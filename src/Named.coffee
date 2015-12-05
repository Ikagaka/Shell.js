{recursiveElementFromPoint} = require("./LayerUtil")
{SurfaceUtil} = require("ikagaka.shell.js")
Scope = require("./Scope")
EventEmitter = require("eventemitter3")
$ = require("jquery")

class Named extends EventEmitter

  constructor: (@namedId, @shell, @balloon, @nmdmgr)->
    super()

    @element = document.createElement("div")
    @scopes = []
    @currentScope = null
    @destructors = []

    @initDOMStructure()
    @initEventListener()
    @scope(0).surface(0)
    @scope(1).surface(10)
    Promise.resolve(@)

  initDOMStructure: ->
    @$named = $(@element).addClass("named")
    return

  initEventListener: ->
    do =>
      # サーフェス移動
      relLeft = relTop = 0
      $target = null
      scopeId = -1
      onmouseup = => $target = null; scopeId = -1
      onmousemove = (ev)=> # https://github.com/Ikagaka/NamedManager.js/issues/16 によりbodyからキャプチャ
        if !$target? then return
        $element = $(@scopes[scopeId].element)
        # この座標はbody要素直下のfixed座標用
        {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev)
        # ブラウザのユーザから見えてる部分の大きさを取得
        right  = window.innerWidth  - clientX - ($element.width()  - relLeft)
        bottom = window.innerHeight - clientY - ($element.height() - relTop)
        alignment = @shell.descript["seriko.alignmenttodesktop"] || @shell.descript["#{SurfaceUtil.scope(scopeId)}.alignmenttodesktop"] || "bottom"
        switch alignment
          when "free" then break;
          when "top" then console.warn("seriko.alignmenttodesktop, free", "have not been supported yet"); break;
          when "bottom" then bottom = 0; break;
        $target.css({right, bottom, top: "", left: ""})
      $(document.body).on("mouseup", onmouseup)
      $(document.body).on("mousemove", onmousemove)
      $(document.body).on("touchmove", onmousemove)
      $(document.body).on("touchend", onmouseup)
      @destructors.push ->
        $(document.body).off("mouseup", onmouseup)
        $(document.body).off("mousemove", onmousemove)
        $(document.body).off("touchmove", onmousemove)
        $(document.body).off("touchend", onmouseup)
      @shell.on "mouse", (ev)=>
        if ev.transparency is true and
           ev.type isnt "mousemove" # mousemoveおよびmouseenterはループするので
          recursiveElementFromPoint(ev.event, @nmdmgr.element, ev.event.target)
          # 透明領域の下要素にイベントが投げられたので
          # それが拾われるのを待つ
          return
        switch ev.type
          when "mousedown", "touchstart"
            scopeId = ev.scopeId
            $target = $scope = $(@scopes[ev.scopeId].element)
            {top, left} = $target.offset()
            {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev.event)
            # この座標はbody要素直下のfixed座標用
            relLeft = clientX - (left - window.scrollX) # サーフェス左上を起点としたマウスの相対座標
            relTop  = clientY - (top  - window.scrollY)
            @$named.append($scope) # このnamedの中のscopeの中で最前面に
            @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
        @emit("shell_mouse", ev)
        return
    do =>
      # バルーン移動
      relLeft = relTop = 0
      $target = null
      scopeId = -1
      onmouseup = => $target = null; scopeId = -1
      onmousemove = (ev)=>
        if !$target? then return
        # この座標はbody要素直下のfixed座標用
        {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev)
        $scope = $(@scopes[scopeId].element)
        if pageX - relLeft + $scope.width()/2 > 0
        then @scope(scopeId).blimp().right()
        else @scope(scopeId).blimp().left()
        $target.css
          left: pageX - relLeft
          top:  pageY - relTop
          right: ""
          bottom: ""
      $(document.body).on("mouseup", onmouseup)
      $(document.body).on("mousemove", onmousemove)
      $(document.body).on("touchmove", onmousemove)
      $(document.body).on("touchend", onmouseup)
      @destructors.push ->
        $(document.body).off("mouseup", onmouseup)
        $(document.body).off("mousemove", onmousemove)
        $(document.body).off("touchmove", onmousemove)
        $(document.body).off("touchend", onmouseup)
      @balloon.on "mouse", (ev)=>
        $scope = $(@scopes[ev.scopeId].element)
        switch ev.type
          when "mousedown", "touchstart"
            scopeId = ev.scopeId
            $scope = $(@scopes[ev.scopeId].element)
            $target = $scope.find(".blimp")
            {top, left} = $target.offset()
            offsetY = parseInt($target.css("left"), 10)
            offsetX = parseInt($target.css("top"), 10)
            {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev.event)
            # この座標はbody要素直下のfixed座標用
            relLeft = pageX - offsetY
            relTop  = pageY - offsetX
            if $(ev.event.target).hasClass("ikagaka-choice") || $(ev.event.target).hasClass("ikagaka-anchor")
            then wait = 500
            else wait = 0
            setTimeout((=>
              # @balloon.on "select"が balloonをdelegateしているため、
              # 一旦"select"を発火させてからDOMツリーを変更する必要がある
              @$named.append($scope) # namedの中のscopeの中で最前面に
              @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
            ), wait)
        @emit("balloon_mouse", ev)
        return
    @balloon.on "select", (ev)=>
      @emit("balloon_select", ev)
    return

  destructor: ->
    @scopes.forEach (scope)-> scope.destructor()
    @scopes = []
    @destructors.forEach (fn)-> fn()
    @$named.children().remove()
    @$named.remove()
    return

  scope: (scopeId)->
    unless scopeId? then return @currentScope
    unless typeof scopeId is "number"
      console.warn("scopeId:", scopeId, "is not a number")
      return @currentScope
    unless @scopes[scopeId]? # まだ存在していないスコープ
      @scopes[scopeId] = new Scope(scopeId, @shell, @balloon, @)
    @currentScope = @scopes[scopeId]
    @$named.append(@scopes[scopeId].element) # 前面へ
    return @currentScope

  openInputBox: (id, text="")->
    # TODO use Ballon
    event =
      "type": "userinput"
      "id": id
      "content": prompt("UserInput", text)
    # 将来的にはballoon.jsにレンダリングさせる
    @emit("balloon_input", event)
    return

  openCommunicateBox: (text="")->
    # TODO use Ballon
    event =
      "type": "communicateinput"
      "sender": "user"
      "content": prompt("Communicate", text)
    # 将来的にはballoon.jsにレンダリングさせる
    @emit("balloon_input", event)
    return

module.exports = Named
