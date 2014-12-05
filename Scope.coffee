$ = window["Zepto"]

class Scope

  constructor: (@scopeId, @shell, @balloon)->
    @$scope = $("<div />").addClass("scope")
    @$surface = $("<div />").addClass("surface")
    @$surfaceCanvas = $("<canvas width='10' height='100' />").addClass("surfaceCanvas")
    @$blimp = $("<div />").addClass("blimp")
    @$blimpCanvas = $("<canvas width='0' height='0' />").addClass("blimpCanvas")
    @$blimpText = $("<div />").addClass("blimpText")

    @element = @$scope[0]
    @destructors = []
    @currentSurface = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, 0)
    @currentBalloon = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, 0)
    @isBalloonLeft = true
    @insertPoint = @$blimpText

    @$blimp.append(@$blimpCanvas)
    @$blimp.append(@$blimpText)
    @$surface.append(@$surfaceCanvas)

    @$scope.append(@$surface)
    @$scope.append(@$blimp)

    # set default position
    @$scope.css
      "bottom": "0px",
      "right": (@scopeId*240)+"px"

    @surface(0)
    @blimp(0)
    @surface(-1)
    @blimp(-1)

  surface: (surfaceId)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if Number(surfaceId) < 0 then @$surface.hide(); return @currentSurface
    if surfaceId?
      prevSrfId = @currentSurface.surfaces.surfaces[@currentSurface.surfaceName].is
      @currentSurface.destructor()
      tmp = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, surfaceId)
      tmp = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, prevSrfId) if !tmp
      @currentSurface = tmp
      @$scope.width @$surfaceCanvas[0].width
      @$scope.height @$surfaceCanvas[0].height
      @$surface.show()
    return @currentSurface

  blimp: (balloonId)->
    if Number(balloonId) < 0
      @$blimp.hide()
    else
      if balloonId?
        @currentBalloon.destructor()
        tmp = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, balloonId)
        @currentBalloon = tmp
        @$blimp.width @$blimpCanvas[0].width
        @$blimp.height @$blimpCanvas[0].height
        @$blimp.show()
        descript = @currentBalloon.descript
        type = if @scopeId is 0 then "sakura" else "kero"
        @$blimp.css({ "top": Number(@shell.descript["#{type}.balloon.offsety"] ||0) })
        if @isBalloonLeft
          @$blimp.css({
            "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + -1 * @$blimpCanvas[0].width
          })
        else
          @$blimp.css({
            "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + @$surfaceCanvas[0].width
          })
        t = descript["origin.y"] or descript["validrect.top"] or "10"
        r = descript["validrect.right"] or "10"
        b = descript["validrect.bottom"] or "10"
        l = descript["origin.x"] or descript["validrect.left"] or "10"
        w = @$blimpCanvas[0].width
        h = @$blimpCanvas[0].height
        @$blimpText.css({
          "top": "#{t}px",
          "left": "#{l}px",
          "width": "#{w-(Number(l)+Number(r))}px",
          "height": "#{h-(Number(t)-Number(b))}px"
        })

    anchorBegin: (id, args...)=>
      @$blimpText.find(".blink").hide()
      @$blimp.show()
      _id = $(document.createElement("div")).text(id).html()
      $a = $("<a />")
      $a.addClass("ikagaka-anchor")
      $a.attr("data-id", _id)
      $a.attr("data-argc", args.length)
      for argv, index in args
        $a.attr("data-argv#{index}", argv)
      @insertPoint = $a.appendTo(@$blimpText)
      return
    anchorEnd: =>
      @insertPoint = @$blimpText
      return
    choice: (text, id, args...)=>
      @$blimpText.find(".blink").hide()
      @$blimp.show()
      _text = $(document.createElement("div")).text(text).html()
      _id = $(document.createElement("div")).text(id).html()
      $a = $("<a />")
      $a.addClass("ikagaka-choice")
      $a.html(_text)
      $a.attr("data-id", _id)
      $a.attr("data-argc", args.length)
      for argv, index in args
        $a.attr("data-argv#{index}", argv)
      $a.appendTo(@insertPoint)
      return
    choiceBegin: (id, args...)=>
      @$blimpText.find(".blink").hide()
      @$blimp.show()
      _id = $(document.createElement("div")).text(id).html()
      $a = $("<a />")
      $a.addClass("ikagaka-choice")
      $a.attr("data-id", _id)
      $a.attr("data-argc", args.length)
      for argv, index in args
        $a.attr("data-argv#{index}", argv)
      @insertPoint = $a.appendTo(@$blimpText)
      return
    choiceEnd: =>
      @insertPoint = @$blimpText
      return
    talk: (text)=>
      @$blimpText.find(".blink").hide()
      _text = $(document.createElement("div")).text(text).html()
      if !!@currentSurface
        @currentSurface.talk()
      @$blimp.show()
      @insertPoint.append(_text)
      @$blimpText[0].scrollTop = 999
      return
    clear: =>
      @insertPoint = @$blimpText
      @$blimpText.html("")
      return
    br: =>
      @insertPoint.append("<br />")
      return
    showWait: =>
      @$blimpText.append("<br /><br />").append("<div class='blink'>...</div>")
      return


if module?.exports?
  module.exports = Scope
else if @Ikagaka?
  @Ikagaka.Scope = Scope
else
  @Scope = Scope
