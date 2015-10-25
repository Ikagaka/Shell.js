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
            if /^touch/.test(ev.event.type)
              pageX = ev.event.touches[0].pageX
              pageY = ev.touches[0].pageY
            else
              pageX = ev.event.pageX
              pageY = ev.event.pageY
            $target.css
              left: pageX - relLeft
              top:  pageY - relTop
        when "mousedown"
          $target = $scope = $(@scopes[ev.scopeId].element)
          {top, left} = $target.offset()
          if /^touch/.test(ev.event.type)
            pageX = ev.event.touches[0].pageX
            pageY = ev.event.touches[0].pageY
          else
            pageX = ev.event.pageX
            pageY = ev.event.pageY
          relLeft = pageX - left
          relTop  = pageY - top
          @$named.append($scope) # このnamedの中のscopeの中で最前面に
          @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
      return
    @balloon.on "mouse", (ev)=>
      $scope = $(@scopes[ev.scopeId].element)
      switch ev.type
        when "mousedown"
          @$named.append($scope) # namedの中のscopeの中で最前面に
          @$named.appendTo(@nmdmgr.element) # すべてのnamedの中で最前面に
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
