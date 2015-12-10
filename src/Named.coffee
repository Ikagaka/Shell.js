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
      @destructors.push =>
        $(document.body).off("mouseup", onmouseup)
        $(document.body).off("mousemove", onmousemove)
        $(document.body).off("touchmove", onmousemove)
        $(document.body).off("touchend", onmouseup)
        @shell.off("mouse")
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
            # mouseclick 発動させるために 待つ
            setTimeout((=>
              @$named.append($scope) # このnamedの中のscopeの中で最前面に
              @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
            ), 300)
        @emit(ev.type, ev)
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
      @destructors.push =>
        $(document.body).off("mouseup", onmouseup)
        $(document.body).off("mousemove", onmousemove)
        $(document.body).off("touchmove", onmousemove)
        $(document.body).off("touchend", onmouseup)
        @balloon.off "mouse"
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
            then wait = 500 # selectを発火させるため
            else wait = 300 # clickを発火させるため
            setTimeout((=>
              # @balloon.on "select"が balloonをdelegateしているため、
              # 一旦"select"を発火させてからDOMツリーを変更する必要がある
              @$named.append($scope) # namedの中のscopeの中で最前面に
              @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
            ), wait)
        switch ev.type
          when "click"    then ev.type = "balloonclick";    @emit("balloonclick",    ev)
          when "dblclick" then ev.type = "balloondblclick"; @emit("balloondblclick", ev)
        return
    @balloon.on "select", (ev)=>
      switch ev.type
        when "choiceselect" then @emit("choiceselect", ev)
        when "anchorselect" then @emit("anchorselect", ev)
      return
    @destructors.push =>
      @balloon.off("select")
      @$named.off("drop")
    that = @
    @$named.on "dragenter", (ev)-> ev.preventDefault(); ev.stopPropagation();
    @$named.on "dragleave", (ev)-> ev.preventDefault(); ev.stopPropagation();
    @$named.on "dragover", (ev)->
      ev.preventDefault(); ev.stopPropagation();
      that.emit("filedropping", {type: "filedropping", scopeId: Number($(@).attr("scopeId")), event: ev})
    @$named.on "drop", ".scope", (ev)->
      ev.preventDefault(); ev.stopPropagation();
      that.emit("filedrop", {type: "filedrop", scopeId: Number($(@).attr("scopeId")), event: ev})
    return

  destructor: ->
    @scopes.forEach (scope)-> scope.destructor()
    @scopes = []
    @destructors.forEach (fn)-> fn()
    @$named.children().remove()
    @$named.remove()
    return

  load: ()->
    Promise.resolve(this)

  scope: (scopeId)->
    unless scopeId?
      if @currentScope instanceof Scope
      then return @currentScope
      else
        console.error("Named#scope", "currentScope has not been defined yet, failback to scope 0", scopeId, @currentScope, @);
        return @currentScope = @scopes[0];
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
    @emit("userinput", event)
    return

  openCommunicateBox: (text="")->
    # TODO use Ballon
    event =
      "type": "communicateinput"
      "sender": "user"
      "content": prompt("Communicate", text)
    # 将来的にはballoon.jsにレンダリングさせる
    @emit("communicateinput", event)
    return

module.exports = Named
