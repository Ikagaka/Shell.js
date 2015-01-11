$ = window["Zepto"]

class Scope

  constructor: (@scopeId, @shell, @balloon)->
    @$scope = $("<div />").addClass("scope")
    @$surface = $("<div />").addClass("surface")
    @$surfaceCanvas = $("<canvas width='10' height='100' />").addClass("surfaceCanvas")
    @$blimp = $("<div />").addClass("blimp")
    @$blimpCanvas = $("<canvas width='0' height='0' />").addClass("blimpCanvas")
    @$blimpText = $("<div />").addClass("blimpText")

    descript = @balloon.descript
    cursor = descript["cursor"] || ''
    font_name = (descript["font.name"] or "MS Gothic").split(/,/).map((name) -> '"'+name+'"').join(',')
    font_height = descript["font.height"] or "12"
    getfontcolor = (r,g,b,can_ignore) ->
      if can_ignore and (isNaN(r) or r < 0) and (isNaN(g) or g < 0) and (isNaN(b) or b < 0)
        return
      else
        return ("000000" + ((if r > 0 then r else 0) * 65536 + (if g > 0 then g else 0) * 256 + (if b > 0 then b else 0) * 1).toString(16)).slice(-6)
    font_color = getfontcolor(descript["font.color.r"], descript["font.color.g"], descript["font.color.b"])
    font_shadowcolor = getfontcolor(descript["font.shadowcolor.r"], descript["font.shadowcolor.g"], descript["font.shadowcolor.b"], true)
    font_bold = descript["font.bold"]
    font_italic = descript["font.italic"]
    text_decoration = []
    if descript["font.strike"] then text_decoration.push 'line-through'
    if descript["font.underline"] then text_decoration.push 'underline'
    @_style =
      "cursor": cursor
      "font-family": font_name
      "font-size": "#{font_height}px"
      "color": "##{font_color}"
      "background": "none"
      "outline": "none"
      "border": "none"
      "text-shadow": if font_shadowcolor then "1px 1px 0 ##{font_shadowcolor}" else "none"
      "font-weight": if font_bold then "bold" else "normal"
      "font-style": if font_italic then "italic" else "normal"
      "text-decoration": if text_decoration.length then text_decoration.join(' ') else "none"
    @$blimpText.css(@_style)
    clickable_element_style = (prefix, style_default) ->
      style = if {square: true, underline: true, 'square+underline': true}[descript["#{prefix}.style"]] then descript["#{prefix}.style"] else style_default
      font_color = getfontcolor(descript["#{prefix}.font.color.r"], descript["#{prefix}.font.color.g"], descript["#{prefix}.font.color.b"])
      pen_color = getfontcolor(descript["#{prefix}.pen.color.r"], descript["#{prefix}.pen.color.g"], descript["#{prefix}.pen.color.b"])
      brush_color = getfontcolor(descript["#{prefix}.brush.color.r"], descript["#{prefix}.brush.color.g"], descript["#{prefix}.brush.color.b"])
      switch style
        when "square"
          base:
            color: "##{font_color}"
          over:
            outline: "solid 1px ##{pen_color}"
            background: "##{brush_color}"
        when "underline"
          base:
            color: "##{font_color}"
          over:
            'border-bottom': "solid 1px ##{pen_color}"
        when "square+underline"
          base:
            color: "##{font_color}"
          over:
            outline: "solid 1px ##{pen_color}"
            background: "##{brush_color}"
            'border-bottom': "solid 1px ##{pen_color}"
    @_choice_style = clickable_element_style("cursor", "square")
    @_anchor_style = clickable_element_style("anchor", "underline")

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
      $a.css(@_style).css(@_anchor_style.base)
      $a.mouseover(=> $a.css(@_anchor_style.over))
      $a.mouseout(=> $a.css(@_style).css(@_anchor_style.base))
      $a.attr("data-id", _id)
      $a.attr("data-argc", args.length)
      for argv, index in args
        $a.attr("data-argv#{index}", argv)
      @originalInsertPoint = @insertPoint
      @insertPoint = $a.appendTo(@insertPoint)
      return
    anchorEnd: =>
      @insertPoint = @originalInsertPoint
      return
    choice: (text, id, args...)=>
      @$blimpText.find(".blink").hide()
      @$blimp.show()
      _text = $(document.createElement("div")).text(text).html()
      _id = $(document.createElement("div")).text(id).html()
      $a = $("<a />")
      $a.addClass("ikagaka-choice")
      $a.css(@_style)
      $a.mouseover(=> $a.css(@_choice_style.base).css(@_choice_style.over))
      $a.mouseout(=> $a.css(@_style))
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
      $a.css(@_style)
      $a.mouseover(=> $a.css(@_choice_style.base).css(@_choice_style.over))
      $a.mouseout(=> $a.css(@_style))
      $a.attr("data-id", _id)
      $a.attr("data-argc", args.length)
      for argv, index in args
        $a.attr("data-argv#{index}", argv)
      @originalInsertPoint = @insertPoint
      @insertPoint = $a.appendTo(@insertPoint)
      return
    choiceEnd: =>
      @insertPoint = @originalInsertPoint
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
    marker: =>
      @$blimpText.find(".blink").hide()
      _text = $(document.createElement("div")).text("・").html()
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
      @$blimpText.append("<br /><br />").append("<div class='blink'>▼</div>")
      @$blimpText[0].scrollTop = 999
      return


if module?.exports?
  module.exports = Scope
else if @Ikagaka?
  @Ikagaka.Scope = Scope
else
  @Scope = Scope
