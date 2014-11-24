

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

  scope: (scopeId)->
    if scopeId isnt undefined
      if !@scopes[scopeId]
        @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
        @scopes[scopeId].$scope.on "click", (ev)=>
          @$named.append(@scopes[scopeId].$scope)
      @currentScope = @scopes[scopeId]
      $(@element).append(@scopes[scopeId].element)
    @currentScope

if module?.exports?
  module.exports = Named

if window["Ikagaka"]?
  window["Ikagaka"]["Named"] = Named
