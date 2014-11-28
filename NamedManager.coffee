
Scope = window["Named"] || window["Ikagaka"]?["Named"] || require("./Named.js")

class NamedManager
  constructor: ()->
    @$namedMgr = $("<div />").addClass("namedMgr")
    @element = @$namedMgr[0]
    @namedies = []
    @destructors = []

    do =>
      onmousedown = (ev)=>
        setTimeout((=>
          @$namedMgr.append(ev.currentTarget) ), 100)
      @$namedMgr.on("mousedown", ".named", onmousedown)
      @destructors.push =>
        @$namedMgr.off("mousedown", ".named", onmousedown)

  destructor: ->
    @namedies
      .filter (named)-> named?
      .forEach (named)-> $(named.element).remove()
    @destructors.forEach (destructor)-> destructor()
    @$namedMgr.remove()
    return

  materialize: (shell, balloon)->
    named = new Named(shell, balloon)
    @namedies.push(named)
    @$namedMgr.append(named.element)
    return @namedies.length - 1

  vanish: (namedId)->
    if !@namedies[namedId]? then throw new Error("namedId " + namedId + " is not used yet")
    @namedies[namedId].destructor()
    @namedies[namedId] = null
    return

  named: (namedId)->
    if !@namedies[namedId]? then throw new Error("namedId " + namedId + " is not used yet")
    return @namedies[namedId]

if module?.exports?
  module.exports = NamedManager
else if @Ikagaka?
  @Ikagaka.NamedManager = NamedManager
else
  @NamedManager = NamedManager
