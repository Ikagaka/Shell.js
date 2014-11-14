

class Scope

  constructor: (@scopeId, @shell, @balloon)->
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
    @$balloon = $("<div />")
      .addClass("balloon")
      .hide()
    @$scope
      .append(@$surface)
      .append(@$balloon)
      .append(@$style)
    @element = @$scope[0]
    @currentSurface = null
    @currentBalloon = new Balloon(shell)

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
    
  balloon: (balloonId)->
    if balloonId is -1
    then @$balloon.hide()
    else @$balloon.show()
    @$balloon.append(@currentBalloon.element) if !!@currentBalloon
    @currentBalloon


###
class Balloon
  constructor: (tree)->
    @$balloon = $("<div />")
      .addClass("box")
    @$style = $("<style scoped />")
      .html("""
        .box {
          position: absolute;
          top: -150px;
          left: 0px;
          height: 150px;
          width: 280px;
          background: #ccc;
          overflow-y: scroll;
          white-space: pre;
          white-space: pre-wrap;
          white-space: pre-line;
          word-wrap: break-word;
        }
        .text {
          padding: 1em;
        }
        .anchor,
        .select {
          color:red;
          cursor:pointer;
        }
        .anchor:hover,
        .select:hover {
          background-color:violet;
        }
      """)
    @$text = $("<div />")
      .addClass("text")
    @$balloon
      .append(@$style)
      .append(@$text)
    @element = @$balloon[0]
  talk: (text)->
    @$text.html(@$text.html() + text)
    undefined
  clear: ->
    @$text.html("")
    undefined
  br: ->
    @talk("<br />")
    undefined
###
