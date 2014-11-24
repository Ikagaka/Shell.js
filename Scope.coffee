

class Scope

  $ = window["jQuery"]

  constructor: (@scopeId, @shell, @balloon)->
    @$scope = $("<div />")
      .addClass("scope")
      .css({
        "position": "absolute",
        "bottom": "0px",
        "right": (@scopeId*240)+"px"
      })
      .draggable({})
    $scopeStyle = $("<style scoped />")
      .html("""
        .scope {
          display: inline-block;
          position: absolute;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          tap-highlight-color: transparent;
        }
        .surfaceCanvas {
          display: inline-block;
        }
      """)
    @$surfaceCanvas = $("<canvas />")
      .addClass("surfaceCanvas")
    @$surface = $("<div />")
      .addClass("surface")
      .append(@$surfaceCanvas)
    @$blimpCanvas =  $("<canvas width='0' height='0' />")
      .addClass("blimpCanvas")
    $blimpStyle = $("<style scoped />")
      .html("""
        .blimp {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
        }
        .blimpCanvas {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
        }
        .blimpText {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
          overflow-y: scroll;
          white-space: pre;
          white-space: pre-wrap;
          white-space: pre-line;
          word-wrap: break-word;
          /*pointer-events: none;*/
        }
        .blimpText a {
          text-decoration: underline;
        }
        .blimpText .ikagaka-choice {
          color: blue;
          cursor: pointer;
        }
        .blimpText .ikagaka-anchor {
          color: red;
          cursor: pointer;
        }
        .blimpText .ikagaka-choice:hover,
        .blimpText .ikagaka-anchor:hover{
          background-color: yellow;
        }

      """)
    @$blimpText = $("<div />")
      .addClass("blimpText")
    @$blimp = $("<div />")
      .addClass("blimp")
      .append($blimpStyle)
      .append(@$blimpCanvas)
      .append(@$blimpText)
      .css({
        "position": "absolute"
      })
      .draggable()
      .click (ev)=>
    @$scope
      .append($scopeStyle)
      .append(@$surface)
      .append(@$blimp)
      .delegate(".ikagaka-choice", "click", (ev)=>
        detail =
          "ID": "OnChoiceSelect"
          "Reference0": ev.target.dataset["choiceid"]
        @$scope.trigger($.Event("IkagakaSurfaceEvent", {detail})))
      .delegate ".ikagaka-anchor", "click", (ev)=>
        detail =
          "ID": "OnAnchorSelect"
          "Reference0": ev.target.dataset["anchorid"]
        @$scope.trigger($.Event("IkagakaSurfaceEvent", {detail}))
    @element = @$scope[0]
    @currentSurface = null
    @currentBalloon = null
    @leftFlag = true
    @insertPoint = @$blimpText
    ###
    @$blimp.on "click", (ev)=>
      @leftFlag = !@leftFlag
      if @leftFlag
      then @blimp(0)
      else @blimp(1)
    ###


  surface: (surfaceId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if surfaceId?
      if surfaceId is -1
      then @$surface.css({"visibility": "hidden"})
      else @$surface.css({"visibility": "visible"})
      if !!@currentSurface
      then @currentSurface.destructor()
      @currentSurface = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, surfaceId, callback)
    @currentSurface

  blimp: (balloonId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if balloonId?
      if balloonId is -1
      then @$blimp.hide()
      else @$blimp.show()
      if !!@currentBalloon
      then @currentBalloon.destructor()
      @currentBalloon = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, balloonId)
      if !!@currentBalloon
        descript = @currentBalloon.descript
        @$blimp.css({
          "width": @$blimpCanvas.width(),
          "height": @$blimpCanvas.height()
        })
        if @leftFlag
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
      undefined
    anchorEnd: =>
      @insertPoint = @$blimpText
      undefined
    choice: (text, id)=>
      _text = $(document.createElement("div")).text(text).html()
      _id = $(document.createElement("div")).text(id).html()
      $("<a />")
        .addClass("ikagaka-choice")
        .attr("data-choiceid": _id)
        .html(_text)
        .appendTo(@insertPoint)
      undefined
    talk: (text)=>
      _text = $(document.createElement("div")).text(text).html()
      if !!@currentSurface
        @currentSurface.talk()
      @$blimp.show()
      @insertPoint.html(@insertPoint.html() + _text)
      @$blimpText[0].scrollTop = 999
      undefined
    clear: =>
      @insertPoint = @$blimpText
      @$blimpText.html("")
      undefined
    br: =>
      @insertPoint.html(@insertPoint.html() + "<br />")
      undefined


if module?.exports?
  module.exports = Scope

if window["Ikagaka"]?
  window["Ikagaka"]["Scope"] = Scope
