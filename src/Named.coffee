{SurfaceUtil} = require("ikagaka.shell.js")
{Scope} = require("./Scope")

class Named extends EventEmitter2

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
    $target = null
    relLeft = relTop = 0
    @shell.on "mouse", (ev)=>
      if ev.transparency is true and
         ev.type isnt "mousemove" # mousemoveおよびmouseenterはループするので
        SurfaceUtil.recursiveElementFromPoint(ev.event, @nmdmgr.element, ev.event.target)
        # 透明領域の下要素にイベントが投げられたので
        # それが拾われるのを待つ
        return
      switch ev.type
        when "mouseup"
          $target = null
        when "mousemove"
          if $target?
            $surfaceCanvas = $(@scopes[ev.scopeId].element).find(".surfaceCanvas")
            {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev.event);
            $target.css
              right:  document.body.clientWidth  - clientX - ($surfaceCanvas.width()  - relLeft)
              bottom: document.body.clientHeight - clientY - ($surfaceCanvas.height() - relTop)
        when "mousedown"
          $target = $scope = $(@scopes[ev.scopeId].element)
          {top, left} = $target.offset()
          {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev.event);
          relLeft = clientX - (left - window.scrollX) # サーフェス左上を起点とした
          relTop  = clientY - (top  - window.scrollY) # マウスの相対座標
          @$named.append($scope) # このnamedの中のscopeの中で最前面に
          @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
      @emit("mouseShell", ev)
      return
    @balloon.on "mouse", (ev)=>
      $scope = $(@scopes[ev.scopeId].element)
      switch ev.type
        when "mouseup"
          $target = null
        when "mousemove"
          if $target?
            {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev.event);
            $scope = $(@scopes[ev.scopeId].element)
            if pageX - relLeft + $scope.width()/2 > 0
            then @scope(ev.scopeId).blimp().right()
            else @scope(ev.scopeId).blimp().left()
            $target.css
              left: pageX - relLeft
              top:  pageY - relTop
        when "mousedown"
          $scope = $(@scopes[ev.scopeId].element)
          $target = $scope.find(".blimp")
          {top, left} = $target.offset()
          offsetY = parseInt($target.css("left"), 10)
          offsetX = parseInt($target.css("top"), 10)
          {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev.event);
          relLeft = pageX - offsetY
          relTop  = pageY - offsetX
          @$named.append($scope) # namedの中のscopeの中で最前面に
          @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
      @emit("mouseBalloon", ev)
      return
    @balloon.on "select", (ev)=>
      console.log(ev);
      @emit("select", ev);
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
    @emit("input", event)
    return

  openCommunicateBox: (text="")->
    # TODO use Ballon
    event =
      "type": "communicateinput"
      "sender": "user"
      "content": prompt("Communicate", text)
    @emit("input", event)
    return

exports.Named = Named
