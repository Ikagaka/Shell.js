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
    onmouseup = (ev)=>
      if !!$target
        if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
          if $target[0] is $(ev.target).parent()?[0]
            $target = null
        else if $(ev.target).hasClass("surfaceCanvas")
          if $target[0] is $(ev.target).parent().parent()?[0]
            $target = null
    onmousedown = (ev)=>
      if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
        if $(ev.target).parent().parent().parent()?[0] is @element
          $target = $(ev.target).parent() # .blimp
          $scope = $target.parent()
          {top, left} = $target.offset()
          offsetY = parseInt($target.css("left"), 10)
          offsetX = parseInt($target.css("top"), 10)
          if /^touch/.test(ev.type)
            pageX = ev.touches[0].pageX
            pageY = ev.touches[0].pageY
          else
            pageX = ev.pageX
            pageY = ev.pageY
          relLeft = pageX - offsetY
          relTop  = pageY - offsetX
          setTimeout((=>
            @$named.append($scope) ), 200)
      else if $(ev.target).hasClass("surfaceCanvas")
        if $(ev.target).parent().parent().parent()?[0] is @element
          $scope = $target = $(ev.target).parent().parent() # .scope
          {top, left} = $target.offset()
          if /^touch/.test(ev.type)
            pageX = ev.touches[0].pageX
            pageY = ev.touches[0].pageY
          else
            pageX = ev.pageX
            pageY = ev.pageY
          relLeft = pageX - left
          relTop  = pageY - top
          setTimeout((=>
            @$named.append($scope) ), 200)
    onmousemove = (ev)=>
      if !!$target
        if /^touch/.test(ev.type)
          pageX = ev.touches[0].pageX
          pageY = ev.touches[0].pageY
        else
          pageX = ev.pageX
          pageY = ev.pageY
        $target.css
          left: pageX - relLeft
          top:  pageY - relTop
    $body = $("body")
    $body.on("mousedown", onmousedown)
    $body.on("mousemove", onmousemove)
    $body.on("mouseup",   onmouseup)
    $body.on("touchstart", onmousedown)
    $body.on("touchmove",  onmousemove)
    $body.on("touchend",   onmouseup)
    @destructors.push ->
      $body.off("mousedown", onmousedown)
      $body.off("mousemove", onmousemove)
      $body.off("mouseup",   onmouseup)
      $body.off("touchstart", onmousedown)
      $body.off("touchmove",  onmousemove)
      $body.off("touchend",   onmouseup)
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
    event =
      "type": "userinput"
      "id": id
      "content": prompt("UserInput", text)
    @emit(event.type, event)
    return

  openCommunicateBox: (text="")->
    event =
      "type": "communicateinput"
      "sender": "user"
      "content": prompt("Communicate", text)
    @emit(event.type, event)
    return


exports.Named = Named
