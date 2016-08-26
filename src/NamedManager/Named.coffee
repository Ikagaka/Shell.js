{recursiveElementFromPoint} = require("./LayerUtil")
{SurfaceUtil} = require("ikagaka.shell.js")
Scope = require("./Scope")
EventEmitter = require("eventemitter3")
$ = require("./Menu")(require("jquery"))

class Named extends EventEmitter

  constructor: (@namedId, @shell, @balloon, @nmdmgr)->
    super()

    @element = document.createElement("div")
    @scopes = []
    @currentScope = null
    @destructors = []
    @contextmenuHandler = null

    @initDOMStructure()
    @initEventListener()
    @initDefaultSurface()

  initDOMStructure: ->
    @$named = $(@element).addClass("named").attr("namedId", @namedId)
    return

  initEventListener: ->
    @initContextMenuEvent()
    @initShellMouseEvent()
    @initBalloonMouseEvent()
    @initBalloonSelectEvent()
    @initFileDropEvent()

  initDefaultSurface: ->
    @scope(0).surface(0)
    @scope(1).surface(10)

  initContextMenuEvent: ->
    # コンテキストメニュー
    $.contextMenu
      selector: ".namedMgr .named[namedId=#{@namedId}] .context-menu"
      build: ($trigger, ev)=>
        ev.preventDefault()
        scopeId = $trigger.attr("scopeId")
        if @contextmenuHandler?
        then return @contextmenuHandler({type: "contextmenu", scopeId, scope: scopeId, event: ev})
        else return {items:{sep1:"---"}}
    @destructors.push =>
      @$named.find(".context-menu").contextMenu("destroy")
    return

  initShellMouseEvent: ->
    # Shell Mouse Event
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
      @shell.removeAllListeners("mouse")
    @shell.on "mouse", (ev)=>
      @$named.find(".context-menu").contextMenu(false)
      if ev.transparency is true and
         ev.type isnt "mousemove" # mousemoveおよびmouseenterはループするので
        ev.event.preventDefault()
        recursiveElementFromPoint(ev.event, @nmdmgr.element, ev.event.target)
        # 透明領域の下要素にイベントが投げられたので
        # それが拾われるのを待つ
        return
      switch ev.button
        when 1
          switch ev.type
            when "mousedown"
              # コンテキストメニュー表示
              @$named.find(".context-menu").contextMenu(true)
              $(".namedMgr .named[namedId=#{@namedId}] .scope[scopeId=#{ev.scopeId}] .context-menu")
              .trigger($.Event('contextmenu', {data: ev.event.data, pageX: ev.event.pageX, pageY: ev.event.pageY}))
              @$named.find(".context-menu").contextMenu(false)
        when 0
          switch ev.type
            when "mousedown"
              scopeId = ev.scopeId
              $target = $scope = $(@scopes[ev.scopeId].element)
              {top, left} = $target.offset()
              {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev.event)
              # この座標はbody要素直下のfixed座標用
              {scrollX, scrollY} = SurfaceUtil.getScrollXY()
              relLeft = clientX - (left - scrollX) # サーフェス左上を起点としたマウスの相対座標
              relTop  = clientY - (top  - scrollY)
              if $(@element).children().last()[0] isnt $scope[0]
                @$named.append($scope) # このnamedの中のscopeの中で最前面に
              if $(@nmdmgr.element).children().last()[0] isnt @element
                @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
      ev.scope = ev.scopeId # cuttlebone@0.2互換
      @emit(ev.type, ev)
      return
    return

  initBalloonMouseEvent: ->
    # Ballon Mouse Event
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
      console.log @
      @balloon.removeAllListeners "mouse"
    @balloon.on "mouse", (ev)=>
      # balloon.js の ev 見直す必要あるな？
      switch ev.event.button
        when 0
          $scope = $(@scopes[ev.scopeId].element)
          switch ev.type
            when "mousedown"
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
              if $(@element).children().last()[0] isnt $scope[0]
                @$named.append($scope) # このnamedの中のscopeの中で最前面に
              if $(@nmdmgr.element).children().last()[0] isnt @element
                @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
      ev.scope = ev.scopeId # cuttlebone@0.2互換
      switch ev.type
        # なんでmouseclickじゃないのかはBalloon.jsに文句を言って
        when "click"    then ev.type = "balloonclick";    @emit("balloonclick",    ev)
        when "dblclick" then ev.type = "balloondblclick"; @emit("balloondblclick", ev)
      return
    return

  initBalloonSelectEvent: ->
    # BalloonSelect
    @balloon.on "select", (ev)=>
      ev.scope = ev.scopeId # 互換
      switch ev.type
        when "choiceselect" then @emit("choiceselect", ev)
        when "anchorselect" then @emit("anchorselect", ev)
      return
    @destructors.push =>
      @balloon.removeAllListeners("select")
    return

  initFileDropEvent: ->
    # FileDrop
    that = @
    @$named.on "dragenter", (ev)-> ev.preventDefault(); ev.stopPropagation();
    @$named.on "dragleave", (ev)-> ev.preventDefault(); ev.stopPropagation();
    @$named.on "dragover", (ev)->
      ev.preventDefault(); ev.stopPropagation();
      scopeId = Number($(@).attr("scopeId")) # 互換
      that.emit("filedropping", {type: "filedropping", scopeId, scope: scopeId, event: ev})
    @$named.on "drop", ".scope", (ev)->
      ev.preventDefault(); ev.stopPropagation();
      scopeId = Number($(@).attr("scopeId")) # 互換
      that.emit("filedrop", {type: "filedrop", scopeId, scope: scopeId, event: ev})
    @destructors.push =>
      @$named.off("dragenter")
      @$named.off("dragleave")
      @$named.off("dragover")
      @$named.off("drop")
    return

  destructor: ->
    @destructors.forEach (fn)-> fn()
    @scopes.forEach (scope)-> scope.destructor()
    @scopes = []
    @contextmenuHandler = null
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

  changeShell: (@shell)-> @reload()

  changeBalloon: (@balloon)-> @reload()

  reload: ->
    args = [@namedId, @shell, @balloon, @nmdmgr]
    positions = @scopes.map (scope)-> scope.position()
    _contextmenuHandler = @contextmenuHandler
    @destructor()
    @constructor.apply(@, args)
    positions.forEach (pos, i)=>
      @scope(i).surface(if i is 0 then 0 else 10)
      console.log pos ,i
      @scope(i).position(pos)
    @contextmenuHandler = _contextmenuHandler
    @nmdmgr.$namedMgr.append(@element)

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

  contextmenu: (@contextmenuHandler)->

module.exports = Named
