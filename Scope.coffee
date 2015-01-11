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
    styles = {}
    styles["cursor"] = descript["cursor"] || ''
    styles["font.name"] = (descript["font.name"] or "MS Gothic").split(/,/).map((name) -> '"'+name+'"').join(',')
    styles["font.height"] = descript["font.height"] or "12"
    getfontcolor = (r,g,b,can_ignore) ->
      if can_ignore and (isNaN(r) or r < 0) and (isNaN(g) or g < 0) and (isNaN(b) or b < 0)
        return
      else
        return ("000000" + ((if r > 0 then r else 0) * 65536 + (if g > 0 then g else 0) * 256 + (if b > 0 then b else 0) * 1).toString(16)).slice(-6)
    styles["font.color"] = getfontcolor(descript["font.color.r"], descript["font.color.g"], descript["font.color.b"])
    styles["font.shadowcolor"] = getfontcolor(descript["font.shadowcolor.r"], descript["font.shadowcolor.g"], descript["font.shadowcolor.b"], true)
    styles["font.bold"] = descript["font.bold"]
    styles["font.italic"] = descript["font.italic"]
    styles["font.strike"] = descript["font.strike"]
    styles["font.underline"] = descript["font.underline"]
    @_text_style = styles
    clickable_element_style = (prefix, style_default) ->
      styles = {}
      styles["style"] = if {square: true, underline: true, 'square+underline': true, none: true}[descript["#{prefix}.style"]] then descript["#{prefix}.style"] else style_default
      styles["font.color"] = getfontcolor(descript["#{prefix}.font.color.r"], descript["#{prefix}.font.color.g"], descript["#{prefix}.font.color.b"])
      styles["pen.color"] = getfontcolor(descript["#{prefix}.pen.color.r"], descript["#{prefix}.pen.color.g"], descript["#{prefix}.pen.color.b"])
      styles["brush.color"] = getfontcolor(descript["#{prefix}.brush.color.r"], descript["#{prefix}.brush.color.g"], descript["#{prefix}.brush.color.b"])
      styles
    @_choice_style = clickable_element_style("cursor", "square")
    @_anchor_style = clickable_element_style("anchor", "underline")
    @$blimpText.css(@_blimpTextCSS(@_text_style))
    @_initializeCurrentStyle()

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
      $a.css(@_blimpTextCSS(@_current_text_style)).css(@_blimpClickableTextCSS(@_current_anchor_style).base)
      $a.mouseover(=> $a.css(@_blimpClickableTextCSS(@_current_anchor_style).over))
      $a.mouseout(=> $a.css(@_blimpTextCSS(@_current_text_style)).css(@_blimpClickableTextCSS(@_current_anchor_style).base))
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
      $a.css(@_blimpTextCSS(@_current_text_style))
      $a.mouseover(=> $a.css(@_blimpClickableTextCSS(@_current_choice_style).base).css(@_blimpClickableTextCSS(@_current_choice_style).over))
      $a.mouseout(=> $a.css(@_blimpTextCSS(@_current_text_style)))
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
      $a.css(@_blimpTextCSS(@_current_text_style))
      $a.mouseover(=> $a.css(@_blimpClickableTextCSS(@_current_choice_style).base).css(@_blimpClickableTextCSS(@_current_choice_style).over))
      $a.mouseout(=> $a.css(@_blimpTextCSS(@_current_text_style)))
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
      @_initializeCurrentStyle()
      @$blimpText.html("")
      return
    br: (ratio) =>
      if ratio?
        $newimp = $('<span />').css('position': 'relative', 'top': (ratio - 1) + 'em')
        @insertPoint = $newimp.appendTo(@insertPoint)
        @insertPoint.css(@_blimpTextCSS(@_current_text_style))
      @insertPoint.append("<br />")
      return
    showWait: =>
      @$blimpText.append("<br /><br />").append("<div class='blink'>▼</div>")
      @$blimpText[0].scrollTop = 999
      return
    location: (x, y) =>
      re = /^(?:(@)?(-?\d*\.?\d*e?\d*)(em|%)?)?$/
      toparam = (r) =>
        unless r?
          return relative: true, value: 0
        rp = r.match(re)
        unless rp then return
        unless rp[2].length
          return relative: true, value: 0
        if isNaN(rp[2]) then return
        if rp[3] == '%'
          value = rp[2] / 100
          unit = 'em'
        else
          value = Number rp[2]
          unit = rp[3] || 'px'
        relative: !!rp[1]
        value: value + unit
      xp = toparam x
      yp = toparam y
      unless xp? and yp? then return
      if xp.relative and yp.relative
        $newimp = $('<span />').css('position': 'relative', 'margin-left': xp.value, 'top': yp.value)
        @insertPoint = $newimp.appendTo(@insertPoint)
      else
        if xp.relative or yp.relative
          $imp_position_checker = $('<span>.</span>')
          @insertPoint.append($imp_position_checker)
          offset = $imp_position_checker.offset()
          baseoffset = @$blimpText.offset()
          offsetx = offset.left - baseoffset.left
          offsety = offset.top - baseoffset.top
          $imp_position_checker.remove()
        unless xp.relative then offsetx = 0
        unless yp.relative then offsety = 0
        $newimp_container = $('<div />').css('position': 'absolute', 'pointer-events': 'none', 'text-indent': offsetx + 'px', 'top': offsety + 'px')
        $newimp = $('<span />').css('position': 'relative', 'pointer-events': 'auto', 'margin-left': xp.value, 'top': yp.value)
        @insertPoint = $newimp.appendTo($newimp_container.appendTo(@$blimpText))
      @insertPoint.css(@_blimpTextCSS(@_current_text_style))


  _blimpTextCSS: (styles) ->
    css = {}
    css["cursor"] = styles["cursor"]
    css["font-family"] = styles["font.name"]
    css["font-size"] = "#{styles["font.height"]}px"
    css["color"] = "##{styles["font.color"]}"
    css["background"] = "none"
    css["outline"] = "none"
    css["border"] = "none"
    css["text-shadow"] = if styles["font.shadowcolor"] then "1px 1px 0 ##{styles["font.shadowcolor"]}" else "none"
    css["font-weight"] = if styles["font.bold"] then "bold" else "normal"
    css["font-style"] = if styles["font.italic"] then "italic" else "normal"
    text_decoration = []
    if styles["font.strike"] then text_decoration.push 'line-through'
    if styles["font.underline"] then text_decoration.push 'underline'
    css["text-decoration"] = if text_decoration.length then text_decoration.join(' ') else "none"
    css
  _blimpClickableTextCSS: (styles) ->
    switch styles["style"]
      when "square"
        base:
          color: "##{styles["font.color"]}"
        over:
          outline: "solid 1px ##{styles["pen.color"]}"
          background: "##{styles["brush.color"]}"
      when "underline"
        base:
          color: "##{styles["font.color"]}"
        over:
          'border-bottom': "solid 1px ##{styles["pen.color"]}"
      when "square+underline"
        base:
          color: "##{styles["font.color"]}"
        over:
          outline: "solid 1px ##{styles["pen.color"]}"
          background: "##{styles["brush.color"]}"
          'border-bottom': "solid 1px ##{styles["pen.color"]}"
      when "none"
        base:
          color: "##{font_color}"
  _initializeCurrentStyle: ->
    @_current_text_style = {}
    for name, value of @_text_style
      @_current_text_style[name] = value
    @_current_choice_style = {}
    for name, value of @_choice_style
      @_current_choice_style[name] = value
    @_current_anchor_style = {}
    for name, value of @_anchor_style
      @_current_anchor_style[name] = value

if module?.exports?
  module.exports = Scope
else if @Ikagaka?
  @Ikagaka.Scope = Scope
else
  @Scope = Scope
