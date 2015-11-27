window.SurfaceUtil = Shell.SurfaceUtil
setPictureFrame = (element, description) ->
  fieldset = document.createElement('fieldset')
  legend = document.createElement('legend')
  legend.appendChild document.createTextNode(description)
  fieldset.appendChild legend
  fieldset.appendChild element
  fieldset.style.display = 'inline-block'
  document.body.appendChild fieldset
  return

QUnit.module 'SurfaceUtil'

QUnit.test 'chromakey_snipet speed test', (assert) ->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("surface0.png").then (img)->
    test = ->
      cnv = SurfaceUtil.copy(img)
      ctx = cnv.getContext("2d")
      start = performance.now()
      imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
      stop = performance.now()
      getImageDataTime = stop - start
      start = performance.now()
      SurfaceUtil.chromakey_snipet(imgdata.data)
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

QUnit.test 'SurfaceUtil.extend', (assert) ->
  original = {a: 0, b: {c: 0, d: 0}}
  SurfaceUtil.extend(original, {a: 1, b: {c: 1}})
  assert.ok original.a is 1
  assert.ok original.b.c is 1
  assert.ok original.b.d is 0

QUnit.test 'SurfaceUtil.parseDescript', (assert) ->
  text = """
  charset,Shift_JIS
  craftman,Cherry Pot
  craftmanw,Cherry Pot
  craftmanurl,http://3rd.d-con.mydns.jp/cherrypot/
  type,shell
  name,the "MobileMaster"

  sakura.balloon.offsetx,21
  sakura.balloon.offsety,80
  kero.balloon.offsetx,10
  kero.balloon.offsety,20

  seriko.alignmenttodesktop,free
  seriko.paint_transparent_region_black,0
  seriko.use_self_alpha,1
  """
  dic = SurfaceUtil.parseDescript(text)
  assert.ok dic["charset"] is "Shift_JIS"
  assert.ok dic["sakura.balloon.offsetx"] is "21"
  assert.ok dic["seriko.paint_transparent_region_black"] is "0"

QUnit.test "SurfaceUtil.convert, SurfaceUtil.fetchArrayBuffer", (assert)->
  assert.expect(1);
  done = assert.async()
  SurfaceUtil.fetchArrayBuffer("./readme.txt").then (buffer)->
    txt = SurfaceUtil.convert(buffer)
    assert.ok txt.match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/) isnt null
    done()

QUnit.test "SurfaceUtil.find", (assert)->
  paths = [
    "surface0.png"
    "surface10.png"
    "elements/element0.png"
  ]
  results = SurfaceUtil.find(paths, "./surface0.png")
  assert.ok results[0] is paths[0]
  results = SurfaceUtil.find(paths, "SURFACE10.PNG")
  assert.ok results[0] is paths[1]
  results = SurfaceUtil.find(paths, "elements\\element0.png")
  assert.ok results[0] is paths[2]

QUnit.test "SurfaceUtil.choice", (assert)->
  results = (SurfaceUtil.choice([1,2,3]) for i in [1..1000])

  assert.ok 0.2 < results.reduce(((count, val)-> if val is 1 then count+1 else count), 0)/results.length < 0.4
  assert.ok 0.2 < results.reduce(((count, val)-> if val is 2 then count+1 else count), 0)/results.length < 0.4
  assert.ok 0.2 < results.reduce(((count, val)-> if val is 3 then count+1 else count), 0)/results.length < 0.4


QUnit.test "SurfaceUtil.copy", (assert)->
  cnv = document.createElement("canvas")
  cnv.width = cnv.height = 100
  ctx = cnv.getContext("2d")
  ctx.strokeStyle = "black"
  ctx.rect(10,10,80,80)
  ctx.stroke()
  cnv2 = SurfaceUtil.copy(cnv)
  assert.ok cnv isnt cnv2
  assert.ok cnv.width is cnv2.width
  assert.ok cnv.height is cnv2.height
  setPictureFrame(cnv, "SurfaceUtil.copy cnv")
  setPictureFrame(cnv2, "SurfaceUtil.copy cnv2")

QUnit.test "SurfaceUtil.fetchImageFromURL, SurfaceUtil.fetchImageFromArrayBuffer", (assert)->
  done = assert.async()
  assert.expect(2);
  SurfaceUtil.fetchArrayBuffer("./surface0.png")
  .then (buffer)-> SurfaceUtil.fetchImageFromArrayBuffer(buffer)
  .then (img)->
    assert.ok img.width is 182
    assert.ok img.height is 445
    setPictureFrame(img, "SurfaceUtil.fetchImageFromURL")
    done()
  .catch (err)-> done()

QUnit.test "SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)", (assert)->
  done = assert.async()
  assert.expect(3)
  endtime = Date.now() + 1000*10
  Promise.all([
    new Promise (resolve, reject)->
      count = 0
      func = (next)->
        if endtime < Date.now()
          assert.ok 4 <= count <= 6, "random, 2"
          return resolve()
        count++
        next()
      SurfaceUtil.random(func, 2)
    new Promise (resolve, reject)->
      count = 0
      func = (next)->
        if endtime < Date.now()
          assert.ok 4 <= count <= 6, "periodic"
          return resolve()
        count++
        next()
      SurfaceUtil.periodic(func, 2)
    new Promise (resolve, reject)->
      count = 0
      func = (next)->
        if endtime < Date.now()
          assert.ok 9 <= count <= 11, "always"
          return resolve()
        count++
        setTimeout(next, 1000)
      SurfaceUtil.always(func)
  ]).then(done)

QUnit.test "SurfaceUtil.isHit", (assert)->
  cnv = document.createElement("canvas")
  cnv.width = cnv.height = 100
  ctx = cnv.getContext("2d")
  ctx.fillStyle = "black"
  ctx.rect(10,10,80,80)
  ctx.fill()
  assert.ok SurfaceUtil.isHit(cnv, 5, 5) is false
  assert.ok SurfaceUtil.isHit(cnv, 50, 50) is true
  setPictureFrame(cnv, "SurfaceUtil.isHit cnv")

QUnit.test "SurfaceUtil.offset", (assert)->
  {left, top, width, height} = SurfaceUtil.offset(document.body)
  assert.ok 0 < left
  assert.ok 0 < top
  assert.ok 0 < width
  assert.ok 0 < height

QUnit.test "SurfaceUtil.createCanvas", (assert)->
  cnv = SurfaceUtil.createCanvas()
  assert.ok cnv instanceof HTMLCanvasElement
  assert.ok cnv.width is 1
  assert.ok cnv.height is 1
  setPictureFrame cnv, "SurfaceUtil.createCanvas"

QUnit.test "SurfaceUtil.scope", (assert)->
  assert.ok "sakura" is SurfaceUtil.scope 0
  assert.ok "kero" is SurfaceUtil.scope 1
  assert.ok "char2" is SurfaceUtil.scope 2

QUnit.test "SurfaceUtil.unscope", (assert)->
  assert.ok 0 is SurfaceUtil.unscope "sakura"
  assert.ok 1 is SurfaceUtil.unscope "kero"
  assert.ok 2 is SurfaceUtil.unscope "char2"


QUnit.test "SurfaceUtil.getEventPosition", (assert)->
  $(document.body).click handler = (ev)->
    {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev)
    assert.ok 100 is pageX
    assert.ok 100 is pageY
    assert.ok 100 is clientX
    assert.ok 100 is clientY
    assert.ok 100 is screenX
    assert.ok 100 is screenY
    $(document.body).off("click", handler)
  document.body.dispatchEvent new MouseEvent("click", {
    screenX: 100,
    screenY: 100,
    clientX: 100,
    clientY: 100,
    pageX: 100,
    pageY: 100
  })


QUnit.test "recursiveElementFromPoint, eventPropagationSim", (assert)->
  assert.ok false, "test is not written yet"
