window.SurfaceUtil = Shell.SurfaceUtil
setPictureFrame = (element, description) ->
  fieldset = document.createElement('fieldset')
  legend = document.createElement('legend')
  legend.appendChild document.createTextNode(description)
  fieldset.appendChild legend
  fieldset.appendChild element
  fieldset.style.display = 'inline-block'
  fieldset.style.backgroundColor = "#D2E0E6"
  document.body.appendChild fieldset
  return

QUnit.module 'SurfaceUtil'
console.info "Worker:", Worker
###
  QUnit.test 'chromakey_snipet speed test', (assert) ->
    done = assert.async()
    Promise.all([
      SurfaceUtil.fetchImageFromURL("src/surface0.png")
      SurfaceUtil.fetchArrayBuffer("src/surface0.png")
    ]).then ([img, buffer])->
      workers = [1..2].map ->
        new InlineServerWorker [
          "../bower_components/jszip/dist/jszip.min.js"
          "../bower_components/PNG.ts/dist/PNG.js"
        ], (conn)->
          conn.on "getImageData", (buffer, reply)->
            reader = new PNG.PNGReader(buffer)
            reader.deflate = JSZip.compressions.DEFLATE.uncompress
            decoded = reader.parse().getUint8ClampedArray()
            reply(decoded, [decoded.buffer]);
      return Promise.all(
        workers.map (worker)-> worker.load()
      ).then (workers)->
        start = performance.now()
        return Promise.all(
          [1..100].map (i)-> workers[i%workers.length].request("getImageData", buffer)
        ).then (results)->
          stop = performance.now()
          TotalWorkerTime = stop - start
          assert.ok TotalWorkerTime, "Worker並列数2でPNG.ts deflate"
          return [img, buffer]
    .then ([img, buffer])->
      test = ->
        start = performance.now()
        reader = new PNG.PNGReader(buffer)
        reader.deflate = JSZip.compressions.DEFLATE.uncompress
        decoded = reader.parse().getUint8ClampedArray()
        stop = performance.now()
        PNGTSTime = stop - start
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
        {PNGTSTime, getImageDataTime, chromakeyTime, putImageDataTime}
      results = [1..100].map -> test()
      PNGTSTimes = results.map (a)-> a.PNGTSTime
      getImageDataTimes = results.map (a)-> a.getImageDataTime
      putImageDataTimes = results.map (a)-> a.putImageDataTime
      chromakeyTimes = results.map (a)-> a.chromakeyTime
      TotalPNGTSTime = PNGTSTimes.reduce (a,b)-> a+b
      TotalGetImageDataTime = getImageDataTimes.reduce (a,b)-> a+b
      TotalPutImageDataTime = putImageDataTimes.reduce (a,b)-> a+b
      TotalChromakeyTime = chromakeyTimes.reduce (a,b)-> a+b
      assert.ok TotalPNGTSTime, "UIスレッドでPNG.ts deflate"
      assert.ok TotalGetImageDataTime, "UIスレッドでgetImageData"
      assert.ok TotalPutImageDataTime
      assert.ok TotalChromakeyTime
      done()
    .catch (err)-> console.info(err, err.stack); done()
###

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
  SurfaceUtil.fetchArrayBuffer("./src/readme.txt").then (buffer)->
    txt = SurfaceUtil.convert(buffer)
    assert.ok txt.match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/) isnt null
    done()
  .catch (err)-> console.info(err, err.stack); done()

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
  SurfaceUtil.fetchArrayBuffer("src/surface0.png")
  .then (buffer)-> SurfaceUtil.fetchImageFromArrayBuffer(buffer)
  .then (img)->
    assert.ok img.width is 182
    assert.ok img.height is 445
    setPictureFrame(img, "SurfaceUtil.fetchImageFromURL")
    done()
  .catch (err)-> console.info(err, err.stack); done()

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

QUnit.test "SurfaceUtil.init", (assert)->
  done = assert.async()
  SurfaceUtil.fetchImageFromURL("src/surface0.png").then (img)->
    cnv = SurfaceUtil.createCanvas()
    ctx = cnv.getContext("2d")
    SurfaceUtil.init(cnv, ctx, img)
    assert.ok cnv.width is 182
    assert.ok cnv.height is 445
    done()

###
QUnit.test "SurfaceUtil.log", (assert)->
  assert.ok false, "まだ書いてない"

QUnit.test "SurfaceUtil.getRegion", (assert)->
  assert.ok false, "まだ書いてない"
fastcopy

fastfind
chromakey_snipet
###

QUnit.test "SurfaceUtil.randomRange", (assert)->
  assert.expect(10)
  results = [1..1000].map -> SurfaceUtil.randomRange(0, 9)
  histgram = [0..9].map (i)-> results.filter (a)-> a is i
  histgram.forEach (arr, i)->
    parsent = arr.length/10
    assert.ok 5 <= parsent <= 15, i


QUnit.test "SurfaceUtil.pna", (assert)->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0730.png")
    SurfaceUtil.fetchImageFromURL("src/surface0730.pna")
  ]).then ([png, pna])->
    srfCnv = SurfaceUtil.pna({cnv:null, png, pna})
    assert.ok srfCnv.cnv.width is 80
    assert.ok srfCnv.cnv.height is 90
    setPictureFrame(srfCnv.cnv, "pna")
    done()

QUnit.test "SurfaceUtil.getScrollXY", (assert)->
  {scrollX, scrollY} = SurfaceUtil.getScrollXY()
  assert.ok scrollX is 0
  assert.ok scrollY is 0
