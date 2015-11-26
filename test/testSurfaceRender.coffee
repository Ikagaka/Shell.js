window.SurfaceRender = Shell.SurfaceRender
window.SurfaceUtil = Shell.SurfaceUtil
$ -> $("<style />").html("canvas{border:1px solid black;}").appendTo($("body"))
craetePictureFrame = (description, target=document.body) ->
  fieldset = document.createElement('fieldset')
  legend = document.createElement('legend')
  legend.appendChild document.createTextNode(description)
  fieldset.appendChild legend
  fieldset.style.display = 'inline-block'
  target.appendChild fieldset
  return {
    add: (element, txt)->
      if txt?
        frame = craetePictureFrame txt, fieldset
        frame.add element
      else fieldset.appendChild element
    elm: fieldset
  }

QUnit.module 'Shell.SurfaceRender'

QUnit.test 'SurfaceRender#clear', (assert) ->
  cnv = document.createElement("canvas")
  cnv.width = cnv.height = 100
  render = new SurfaceRender(cnv)
  ctx = render.ctx
  ctx.fillStyle = "black"
  ctx.rect(10,10,80,80)
  ctx.fill()
  render.clear()
  imagedata = ctx.getImageData(0, 0, cnv.width, cnv.height)
  alpha = imagedata.data[3]
  assert.ok alpha is 0
  frame = craetePictureFrame("SurfaceRender#clear")
  frame.add cnv

QUnit.test 'SurfaceRender#chromakey', (assert) ->
  done = assert.async()
  assert.expect(1)
  SurfaceUtil.fetchImageFromURL("surface0.png").then (img)->
    cnv = SurfaceUtil.copy(img)
    render = new SurfaceRender(cnv)
    render.chromakey()
    ctx = render.ctx
    imagedata = ctx.getImageData(0, 0, cnv.width, cnv.height)
    alpha = imagedata.data[3]
    assert.ok alpha is 0
    frame = craetePictureFrame("SurfaceRender#chromakey")
    frame.add img, "before"
    frame.add cnv, "after"
    done()

QUnit.test 'chromakey speed test', (assert) ->
  done = assert.async()
  assert.expect(2)
  SurfaceUtil.fetchImageFromURL("surface0.png").then (img)->
    test = ->
      cnv = SurfaceUtil.copy(img)
      ctx = cnv.getContext("2d")
      start = performance.now()
      imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
      stop = performance.now()
      getImageDataTime = stop - start
      data = imgdata.data;
      start = performance.now()
      `
      var r = data[0], g = data[1], b = data[2], a = data[3];
      var i = 0;
      if (a !== 0) {
        while (i < data.length) {
          if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
            data[i + 3] = 0;
          }
          i += 4;
        }
      }
      `
      stop = performance.now()
      chromakeyTime = stop - start
      start = performance.now()
      ctx.putImageData(imgdata, 0, 0)
      stop = performance.now()
      putImageDataTime = stop - start
      {getImageDataTime, chromakeyTime, putImageDataTime}
    results = [1..100].map -> test()
    getImageDataTimes = results.map (a)-> a.getImageDataTime
    putImageDataTimes = results.map (a)-> a.putImageDataTime
    chromakeyTimes = results.map (a)-> a.chromakeyTime
    getImageDataTime = getImageDataTimes.reduce (a,b)-> a+b
    putImageDataTime = putImageDataTimes.reduce (a,b)-> a+b
    chromakeyTime = chromakeyTimes.reduce (a,b)-> a+b
    assert.ok getImageDataTime > putImageDataTime
    assert.ok chromakeyTime > 0
    done()

QUnit.test 'SurfaceRender#pna', (assert) ->
  done = assert.async()
  assert.expect(1)
  Promise.all([
    SurfaceUtil.fetchImageFromURL("surface0730.png").then (img)-> SurfaceUtil.copy(img)
    SurfaceUtil.fetchImageFromURL("surface0730.pna").then (img)-> SurfaceUtil.copy(img)
  ]).then ([png, pna])->
    _png = SurfaceUtil.copy(png)
    render = new SurfaceRender(png)
    render.pna(pna)
    ctx = render.ctx
    imagedata = ctx.getImageData(0, 0, render.cnv.width, render.cnv.height)
    alpha = imagedata.data[3]
    assert.ok alpha is 0
    frame = craetePictureFrame("SurfaceRender#pna")
    frame.add _png, "before"
    frame.add pna, "pna"
    frame.add png, "after"
    frame.elm.style.backgroundColor = "gray"
    done()

QUnit.test 'SurfaceRender#base, SurfaceRender#init', (assert) ->
  done = assert.async()
  assert.expect(2)
  SurfaceUtil.fetchImageFromURL("surface0.png").then (img)->
    cnv = SurfaceUtil.createCanvas()
    render = new SurfaceRender(cnv)
    render.base(img)
    assert.ok cnv.width is 182
    assert.ok cnv.height is 445
    done()

QUnit.test 'SurfaceRender#overlay', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("surface0.png").then (img)-> SurfaceUtil.copy(img)
    SurfaceUtil.fetchImageFromURL("surface0730.png").then (img)-> SurfaceUtil.copy(img)
    SurfaceUtil.fetchImageFromURL("surface0730.pna").then (img)-> SurfaceUtil.copy(img)
  ]).then ([base, png, pna])->
    render = new SurfaceRender(png)
    render.pna(pna)
    render = new SurfaceRender(base)
    render.chromakey()
    _base = SurfaceUtil.copy base
    _png = SurfaceUtil.copy png
    render = new SurfaceRender(_png)
    render.overlay(base, 0, 0)
    render = new SurfaceRender(_base)
    render.overlay(png, 0, 0)
    __base = SurfaceUtil.copy base
    __png = SurfaceUtil.copy png
    render = new SurfaceRender(__png)
    render.overlay(base, -100, -100)
    render = new SurfaceRender(__base)
    render.overlay(png, -100, -100)
    assert.ok _png.width is 182
    assert.ok _png.height is 445
    assert.ok _base.width is 182
    assert.ok _base.height is 445
    assert.ok __png.width is 182
    assert.ok __png.height is 445
    assert.ok __base.width is 282
    assert.ok __base.height is 545
    frame = craetePictureFrame("SurfaceRender#overlay")
    frame.add _base, "megane on base"
    frame.add _png, "base on megane"
    frame.add __base, "megane on base (-100, -100)"
    frame.add __png, "base on megane (-100, -100)"
    frame.elm.style.backgroundColor = "gray"
    done()

QUnit.test 'SurfaceRender#overlayfast', (assert) ->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("surface0.png")
  .then (img)-> SurfaceUtil.copy(img)
  .then (base)->
    render = new SurfaceRender(base)
    render.chromakey()
    _base = SurfaceUtil.copy(base)
    render.overlayfast(_base, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#overlayfast")
    frame.add base, "overlayfast"
    frame.elm.style.backgroundColor = "gray"
    done()

QUnit.test 'SurfaceRender#interpolate', (assert) ->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("surface0.png")
  .then (img)-> SurfaceUtil.copy(img)
  .then (base)->
    render = new SurfaceRender(base)
    render.chromakey()
    _base = SurfaceUtil.copy(base)
    render.interpolate(_base, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#interpolate")
    frame.add base, "interpolate"
    frame.elm.style.backgroundColor = "gray"
    done()

QUnit.test 'SurfaceRender#replace', (assert) ->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("surface0.png")
  .then (img)-> SurfaceUtil.copy(img)
  .then (base)->
    render = new SurfaceRender(base)
    render.chromakey()
    _base = SurfaceUtil.copy(base)
    render = new SurfaceRender(_base)
    render.replace(base, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#replace")
    frame.add _base, "replace"
    frame.elm.style.backgroundColor = "gray"
    done()

QUnit.test 'SurfaceRender#initImageData', (assert) ->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("surface0.png")
  .then (img)-> SurfaceUtil.copy(img)
  .then (base)->
    render = new SurfaceRender(base)
    render.chromakey()
    imgdata = render.ctx.getImageData(0,0,render.cnv.width, render.cnv.height)
    render = new SurfaceRender(SurfaceUtil.createCanvas())
    render.initImageData(base.width, base.height, imgdata.data)
    assert.ok render.cnv.width is 182
    assert.ok render.cnv.height is 445
    done()


QUnit.test 'SurfaceRender#drawRegions', (assert) ->
  assert.ok false, "not impliment yet"

QUnit.test 'SurfaceRender#composeElements', (assert) ->
  assert.ok false, "not impliment yet"
