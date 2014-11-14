

class Named

  $ = window["Zepto"]

  constructor: (@shell)->
    @$named = $("<div />")
      .addClass("named")
    @$style = $("<style scoped />")
      .html("")
    @$named.append(@$style)
    @element = @$named[0]
    @scopes = []
    @currentScope = null

  scope: (scopeId)->
    if scopeId isnt undefined
      if !@scopes[scopeId]
        @scopes[scopeId] = new Scope(scopeId, @shell)
      @currentScope = @scopes[scopeId]
      $(@element).append(@scopes[scopeId].element)
    @currentScope
