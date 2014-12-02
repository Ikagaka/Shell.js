

class SurfaceUtil

  constructor: (@cnv)->
    @ctx = @cnv.getContext("2d")

  composeElements: (elements)->
    if elements.length is 0 then return
    {canvas, type, x, y} = elements[0]
    offsetX = offsetY = 0
    switch type
      when "base"        then @base(       canvas, offsetX,     offsetY)
      when "overlay"     then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "overlayfast" then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "replace"     then @replace(    canvas, offsetX + x, offsetY + y)
      when "add"         then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "bind"        then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "interpolate" then @interpolate(canvas, offsetX + x, offsetY + y)
      when "move"
        offsetX = x
        offsetY = y
        copyed = SurfaceUtil.copy(@cnv)
        @base(copyed, offsetX, offsetY)
      else console.error(elements[0])
    @composeElements(elements.slice(1))
    return

  base: (part, x, y)->
    SurfaceUtil.clear(@cnv)
    @init(part, x, y)
    return

  overlayfast: (part, x, y)->
    @ctx.globalCompositeOperation = "source-over"
    @ctx.drawImage(part, x, y)
    return

  interpolate: (part, x, y)->
    @ctx.globalCompositeOperation = "destination-over"
    @ctx.drawImage(part, x, y)
    return

  replace: (part, x, y)->
    @ctx.clearRect(x, y, part.width, part.height)
    @overlayfast(part, x, y)
    return

  init: (cnv, x=0, y=0)->
    @cnv.width = cnv.width
    @cnv.height = cnv.height
    @overlayfast(cnv, x, y)
    return

  @choice = (ary)-> ary[Math.round(Math.random()*(ary.length-1))]

  @clear = (cnv)->
    cnv.width = cnv.width
    return

  @copy = (cnv)->
    copy = document.createElement("canvas")
    ctx = copy.getContext("2d")
    copy.width  = cnv.width
    copy.height = cnv.height
    ctx.drawImage(cnv, 0, 0)
    return copy

  @transImage = (img)->
    cnv = SurfaceUtil.copy(img)
    ctx = cnv.getContext("2d")
    imgdata = ctx.getImageData(0, 0, img.width, img.height)
    data = imgdata.data
    [r, g, b, a] = data
    i = 0
    if a isnt 0
      while i < data.length
        if r is data[i] and
           g is data[i+1] and
           b is data[i+2]
          data[i+3] = 0
        i += 4
    ctx.putImageData(imgdata, 0, 0)
    return cnv

  @loadImage = (url, callback)->
    img = new Image
    img.src = url
    img.addEventListener "load", -> callback(null, img)
    img.addEventListener "error", (ev)-> console.error(ev); callback(ev.error, null)
    return

if module?.exports?
  module.exports = SurfaceUtil
else if @Ikagaka?
  @Ikagaka.SurfaceUtil = SurfaceUtil
else
  @SurfaceUtil = SurfaceUtil
