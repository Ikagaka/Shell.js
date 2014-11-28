$ = window["Zepto"]

class Scope

  constructor: (@scopeId, @shell, @balloon)->
    @$scope = $("<div />").addClass("scope")
    $style = $("<style scoped />").html(@style)
    @$surface = $("<div />").addClass("surface")
    @$surfaceCanvas = $("<canvas />").addClass("surfaceCanvas")
    @$blimp = $("<div />").addClass("blimp")
    @$blimpCanvas = $("<canvas width='0' height='0' />").addClass("blimpCanvas")
    @$blimpText = $("<div />").addClass("blimpText")

    @$surface.append(@$surfaceCanvas)
    @$blimp.append(@$blimpCanvas)
    @$blimp.append(@$blimpText)
    @$scope.append($style)
    @$scope.append(@$surface)
    @$scope.append(@$blimp)

    @element = @$scope[0]
    @destructors = []
    @currentSurface = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, 0)
    @currentBalloon = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, 0)
    @isBalloonLeft = true
    @talkInsertPointStack = [@$blimpText]
    @insertPoint = @$blimpText

    @$surface.hide()
    @$blimp.hide()

    # set default position
    @$scope.css
      "bottom": "0px",
      "right": (@scopeId*240)+"px"

  surface: (surfaceId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if surfaceId?
      if surfaceId is -1
      then @$surface.hide()
      else @$surface.show()
      if !!@currentSurface
      then @currentSurface.destructor()
      tmp = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, surfaceId, callback)
      if !!tmp then @currentSurface = tmp
      @$scope.width(@$surfaceCanvas.width())
      @$scope.height(@$surfaceCanvas.height())
    return @currentSurface

  blimp: (balloonId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if balloonId?
      if balloonId is -1
      then @$blimp.hide()
      else @$blimp.show()
      if !!@currentBalloon
      then @currentBalloon.destructor()
      tmp = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, balloonId)
      if !!tmp then @currentBalloon = tmp
      descript = @currentBalloon.descript
      @$blimp.css({
        "width": @$blimpCanvas.width(),
        "height": @$blimpCanvas.height()
      })
      if @isBalloonLeft
        @$blimp.css({
          "top":  Number(@shell.descript["#{type}.balloon.offsety"] or 0),
          "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + -1 * @$blimpCanvas.width()
        })
      else
        @$blimp.css({
          "top":  Number(@shell.descript["#{type}.balloon.offsety"] or 0),
          "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + @$surfaceCanvas.width()
        })
      if @$blimp.offset().top - @$blimp.position().top >= $(window).height()
        @$blimp.css({
          "top":  -$(@$blimpCanvas).height(),
        })
      t = descript["origin.y"] or descript["validrect.top"] or "10"
      r = descript["validrect.right"] or "10"
      b = descript["validrect.bottom"] or "10"
      l = descript["origin.x"] or descript["validrect.left"] or "10"
      w = @$blimpCanvas.width()
      h = @$blimpCanvas.height()
      @$blimpText.css({
        "top": "#{t}px",
        "left": "#{l}px",
        "width": "#{w-(Number(l)+Number(r))}px",
        "height": "#{h-(Number(t)-Number(b))}px"
      })
    anchorBegin: (id)=>
      _id = $(document.createElement("div")).text(id).html()
      @insertPoint = $("<a />")
      .addClass("ikagaka-anchor")
        .attr("data-anchorid": _id)
        .appendTo(@$blimpText)
      return
    anchorEnd: =>
      @insertPoint = @$blimpText
      return
    choice: (text, id)=>
      _text = $(document.createElement("div")).text(text).html()
      _id = $(document.createElement("div")).text(id).html()
      $("<a />")
        .addClass("ikagaka-choice")
        .attr("data-choiceid": _id)
        .html(_text)
        .appendTo(@insertPoint)
      return
    talk: (text)=>
      _text = $(document.createElement("div")).text(text).html()
      if !!@currentSurface
        @currentSurface.talk()
      @$blimp.show()
      @insertPoint.html(@insertPoint.html() + _text)
      @$blimpText[0].scrollTop = 999
      return
    clear: =>
      @insertPoint = @$blimpText
      @$blimpText.html("")
      return
    br: =>
      @insertPoint.html(@insertPoint.html() + "<br />")
      return
  style: """
    .scope {
      position: absolute;
      pointer-events: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .surface {}
    .surfaceCanvas {
      pointer-events: auto;
    }
    .blimp {
      position: absolute;
      top: 0px;
      left: 0px;
      pointer-events: auto;
    }
    .blimpCanvas {
      position: absolute;
      top: 0px;
      left: 0px;
    }
    .blimpText {
      position: absolute;
      top: 0px;
      left: 0px;
      overflow-y: scroll;
      white-space: pre;
      white-space: pre-wrap;
      white-space: pre-line;
      word-wrap: break-word;
    }
    .blimpText a {
      text-decoration: underline;
      cursor: pointer;
    }
    .blimpText a:hover { background-color: yellow; }
    .blimpText a.ikagaka-choice { color: blue; }
    .blimpText a.ikagaka-anchor { color: red; }
  """

if module?.exports?
  module.exports = Scope
else if @Ikagaka?
  @Ikagaka.Scope = Scope
else
  @Scope = Scope
