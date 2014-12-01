$ = window["Zepto"]

Scope = window["Scope"] || window["Ikagaka"]?["Scope"] || require("./Scope.js")

prompt = window["prompt"]


class Named

  constructor: (@shell, @balloon)->
    @$named = $("<div />").addClass("named")
    @element = @$named[0]
    @scopes = []
    @currentScope = null
    @destructors = []


  load: (callback)->
    @scopes[0] = @scope(0)
    @currentScope = @scopes[0]
    do =>
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
            relLeft = ev.pageX - offsetY
            relTop  = ev.pageY - offsetX
            setTimeout((=>
              @$named.append($scope) ), 100)
        else if $(ev.target).hasClass("surfaceCanvas")
          if $(ev.target).parent().parent().parent()?[0] is @element
            $scope = $target = $(ev.target).parent().parent() # .scope
            {top, left} = $target.offset()
            relLeft = ev.pageX - left
            relTop  = ev.pageY - top
            setTimeout((=>
              @$named.append($scope) ), 100)
      onmousemove = (ev)=>
        if !!$target
          $target.css
            left: ev.pageX - relLeft
            top:  ev.pageY - relTop
      $body = $("body")
      $body.on("mouseup",   onmouseup)
      $body.on("mousedown", onmousedown)
      $body.on("mousemove", onmousemove)
      @destructors.push ->
        $body.off("mouseup",   onmouseup)
        $body.off("mousedown", onmousedown)
        $body.off("mousemove", onmousemove)
    do =>
      onblimpclick = (ev)=>
        detail =
          "ID": "OnBalloonClick"
        @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      onblimpdblclick = (ev)=>
        detail =
          "ID": "OnBalloonDoubleClick"
        @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      @$named.on("click",    ".blimp", onblimpclick)
      @$named.on("dblclick", ".blimp", onblimpdblclick)
      @destructors.push ->
        @$named.off("click",    ".blimp", onblimpclick)
        @$named.off("dblclick", ".blimp", onblimpdblclick)
    do =>
      onchoiceclick = (ev)=>
        id = ev.target.dataset["id"]
        argc = Number ev.target.dataset["argc"]
        if /^On/.test(id) # On
          detail = {}
          detail.ID = id
          for i in [0 ... argc]
            detail["Reference"+i] = ev.target.dataset["argv"+i]
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
        else if argc # Ex
          detail = {}
          detail.ID = "OnChoiceSelectEx"
          detail.Reference0 = ev.target.textContent
          detail.Reference1 = id
          for i in [0 ... argc]
            detail["Reference"+i+2] = ev.target.dataset["argv"+i]
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
        else # normal
          detail = {}
          detail.ID = "OnChoiceSelect"
          detail.Reference0 = id
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      onanchorclick = (ev)=>
        id = ev.target.dataset["id"]
        argc = Number ev.target.dataset["argc"]
        if /^On/.test(id) # On
          detail = {}
          detail.ID = id
          for i in [0 ... argc]
            detail["Reference"+i] = ev.target.dataset["argv"+i]
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
        else if argc # Ex
          detail = {}
          detail.ID = "OnAnchorSelectEx"
          detail.Reference0 = ev.target.textContent
          detail.Reference1 = id
          for i in [0 ... argc]
            detail["Reference"+i+2] = ev.target.dataset["argv"+i]
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
        else # normal
          detail = {}
          detail.ID = "OnAnchorSelect"
          detail.Reference0 = id
          @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      @$named.on("click", ".ikagaka-choice", onchoiceclick)
      @$named.on("click", ".ikagaka-anchor", onanchorclick)
      @destructors.push =>
        @$named.off("click", ".ikagaka-choice", onchoiceclick)
        @$named.off("click", ".ikagaka-anchor", onanchorclick)
    setTimeout(callback)
    return

  destructor: ->
    @scopes.forEach (scope)-> $(scope.element).remove()
    @destructors.forEach (destructor)-> destructor()
    @$named.remove()
    return

  scope: (scopeId)->
    if !isFinite(scopeId) then return @currentScope
    if !@scopes[scopeId]
      @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
    @currentScope = @scopes[scopeId]
    @$named.append(@scopes[scopeId].element)
    return @currentScope

  openInputBox: (id, text="")->
    detail =
      "ID": "OnUserInput"
      "Reference0": id
      "Reference1": prompt("UserInput", text) || ""
    @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
    return

  openCommunicateBox: (text="")->
    detail =
      "ID": "OnCommunicate"
      "Reference0": "user"
      "Reference1": prompt("Communicate", text) || ""
    @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
    return


if module?.exports?
  module.exports = Named
else if @Ikagaka?
  @Ikagaka.Named = Named
else
  @Named = Named
