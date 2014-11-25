

class Named

  $ = window["jQuery"]

  Scope = window["Scope"] || window["Ikagaka"]["Scope"] || require("./Scope.js")

  constructor: (@shell, @balloon)->
    @$named = $("<div />")
      .addClass("named")
    $namedStyle = $("<style scoped />")
      .html("")
    @$named
      .append($namedStyle)
    @element = @$named[0]

    @scopes = []
    @currentScope = null

  destructor: ->
    @scopes.forEach (scope)->
      $(scope.element).remove()
    @$named.remove()

  scope: (scopeId)->
    if scopeId isnt undefined
      if !@scopes[scopeId]
        @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
        @scopes[scopeId].$scope.on "click", (ev)=>
          @$named.append(@scopes[scopeId].$scope)
      @currentScope = @scopes[scopeId]
      $(@element).append(@scopes[scopeId].element)
    @currentScope

  openInputBox: (id, text="")->
    $input = $("<input type='text' />").val(text)
    $dialog = $("<div />")
      .attr({"title": "input box"})
      .dialog({ "autoOpen": false })
      .append($input)
      .append $("<input type='button' />").val("send").click (ev)=>
         detail =
           "ID": "OnUserInput"
           "Reference0": id
           "Reference1": $input.val()
         @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
         $dialog.dialog("destroy").remove()
      .dialog("open")
    setTimeout((-> $dialog.dialog("destroy").remove()), 30000)

  openCommunicateBox: (text="")->
    $input = $("<input type='text' />").val(text)
    $dialog = $("<div />")
      .attr({"title": "communicate box"})
      .dialog({ "autoOpen": false })
      .append($input)
      .append $("<input type='button' />").val("send").click (ev)=>
         detail =
           "ID": "OnCommunicate"
           "Reference0": "user"
           "Reference1": $input.val()
         @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      .dialog("open")
    setTimeout((-> $dialog.dialog("destroy").remove()), 60000)


if module?.exports?
  module.exports = Named

if window["Ikagaka"]?
  window["Ikagaka"]["Named"] = Named
