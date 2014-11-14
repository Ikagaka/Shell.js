

class Scope

  constructor: (@scopeId, @shell)->
    @$scope = $("<div />")
      .addClass("scope")
      .css({"bottom": "0px", "right": (@scopeId*240)+"px"})
    @$style = $("<style scoped />")
      .html("""
        .scope {
          position: absolute;
          border: none;
          margin: 0px;
          padding: 0px;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
      """)
    @$surface = $("<div />")
      .addClass("surface")
      .hide()
    @$scope
      .append(@$surface)
      .append(@$style)
    @element = @$scope[0]

    @currentSurface = null


  surface: (surfaceId)->
    if surfaceId is -1
    then @$surface.hide()
    else @$surface.show()
    if surfaceId isnt undefined
      @currentSurface.destructor() if !!@currentSurface
      $(@currentSurface.element).remove() if !!@currentSurface
      @currentSurface = @shell.getSurface(@scopeId, surfaceId)
      @$surface.append(@currentSurface.element) if !!@currentSurface
    @currentSurface
