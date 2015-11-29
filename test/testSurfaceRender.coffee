window.SurfaceRender = Shell.SurfaceRender
window.SurfaceUtil = Shell.SurfaceUtil
window.SurfaceCanvas = Shell.SurfaceCanvas
$ -> $("<style />").html("canvas{border:1px solid black;}").appendTo($("body"))
craetePictureFrame = (description, target=document.body) ->
  fieldset = document.createElement('fieldset')
  legend = document.createElement('legend')
  legend.appendChild document.createTextNode(description)
  fieldset.appendChild legend
  fieldset.style.display = 'inline-block'
  target.appendChild fieldset
  fieldset.style.backgroundColor = "#D2E0E6"
  return {
    add: (element, txt)->
      if txt?
        frame = craetePictureFrame txt, fieldset
        frame.add element
      else if typeof element is "string"
        txtNode = document.createTextNode element
        p = document.createElement("p")
        p.appendChild txtNode
        fieldset.appendChild p
      else fieldset.appendChild element
  }

QUnit.module 'Shell.SurfaceRender'

QUnit.test 'SurfaceRender#clear', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0730.png")
  ]).then ([png])->
    render = new SurfaceRender(png)
    ctx = render.ctx
    ctx.fillStyle = "black"
    ctx.rect(10,10,80,80)
    ctx.fill()
    render.clear()
    imagedata = ctx.getImageData(50, 50, png.width, png.height)
    alpha = imagedata.data[3]
    assert.ok alpha is 0
    done()

QUnit.test 'SurfaceRender#pna', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0730.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.pna")
  ]).then ([png, pna])->
    render = new SurfaceRender(png)
    render.pna(pna)
    imagedata = render.ctx.getImageData(0, 0, render.cnv.width, render.cnv.height)
    alpha = imagedata.data[3]
    assert.ok alpha is 0
    frame = craetePictureFrame("SurfaceRender#pna")
    frame.add png.cnv, "png"
    frame.add pna.img, "pna"
    frame.add render.cnv, "after"
    done()

QUnit.test 'SurfaceRender#base, SurfaceRender#init', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([png])->
    render = new SurfaceRender()
    render.base(png)
    assert.ok render.cnv.width is 182
    assert.ok render.cnv.height is 445
    done()

QUnit.test 'SurfaceRender#overlay', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.pna")
  ]).then ([base, png, pna])->
    base_render = new SurfaceRender(base)
    megane_render = new SurfaceRender(png)
    megane_render.pna(pna)
    base = base_render.getSurfaceCanvas()
    megane = megane_render.getSurfaceCanvas()
    megane_on_base_render = new SurfaceRender(base)
    base_on_megane_render = new SurfaceRender(megane)
    megane_on_base_negative_render = new SurfaceRender(base)
    base_on_megane_negative_render = new SurfaceRender(megane)
    megane_on_base_render.overlay(megane, 0, 0)
    base_on_megane_render.overlay(base, 0, 0)
    megane_on_base_negative_render.overlay(megane, -100, -100)
    base_on_megane_negative_render.overlay(base, -100, -100)
    assert.ok megane_on_base_render.cnv.width is 182
    assert.ok megane_on_base_render.cnv.height is 445
    assert.ok base_on_megane_render.cnv.width is 182
    assert.ok base_on_megane_render.cnv.height is 445
    assert.ok megane_on_base_negative_render.cnv.width is 282
    assert.ok megane_on_base_negative_render.cnv.height is 545
    assert.ok base_on_megane_negative_render.cnv.width is 182
    assert.ok base_on_megane_negative_render.cnv.height is 445
    frame = craetePictureFrame("SurfaceRender#overlay")
    frame.add "下位レイヤにコマを重ねる"
    frame.add megane_on_base_render.cnv, "megane on base"
    frame.add base_on_megane_render.cnv, "base on megane"
    frame.add megane_on_base_negative_render.cnv, "megane on base (-100, -100)"
    frame.add base_on_megane_negative_render.cnv, "base on megane (-100, -100)"
    done()

QUnit.test 'SurfaceRender#overlayfast', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender(base)
    transparent = render.getSurfaceCanvas()
    render.overlayfast(transparent, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#overlayfast")
    frame.add "下位レイヤの非透過部分（半透明含む）にのみコマを重ねる"
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#interpolate', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender(base)
    transparent = render.getSurfaceCanvas()
    render.interpolate(transparent, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#interpolate")
    frame.add "下位レイヤの透明なところにのみコマを重ねる"
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#replace', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender(base)
    transparent = render.getSurfaceCanvas()
    render.replace(transparent, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#replace")
    frame.add "下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する"
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#move', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender(base)
    render.move(50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#move(50, 50)")
    frame.add "下位レイヤをXY座標指定分ずらす"
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#reduce', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    cnv = document.createElement("canvas")
    cnv.width = cnv.height = 100
    ctx = cnv.getContext("2d");
    ctx.fillStyle = "black"
    ctx.rect(10,10,80,80)
    ctx.fill()
    filter = new SurfaceCanvas().loadFromCanvas(cnv)
    render = new SurfaceRender(base)
    render.reduce(filter, 50, 50)
    render.reduce(filter, 120, 120)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#reduce")
    frame.add "マリちゃんの顔のまわりと右下に透明枠ができる"
    frame.add cnv
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#asis', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender(base)
    render.asis(base, 50, 50)
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#asis(50, 50)")
    frame.add "下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる"
    frame.add "マリちゃんの上に背景緑のマリちゃんがいればOK"
    frame.add render.cnv
    done()

QUnit.test 'SurfaceRender#initImageData', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
  ]).then ([base])->
    render = new SurfaceRender()
    render.initImageData(base.width, base.height, base.pixels)
    assert.ok render.cnv.width is 182
    assert.ok render.cnv.height is 445
    done()


QUnit.test 'SurfaceRender#composeElements', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.pna")
  ]).then ([base, png, pna])->
    megane_render = new SurfaceRender(png)
    megane_render.pna(pna)
    megane = megane_render.getSurfaceCanvas()
    render = new SurfaceRender()
    render.composeElements [
      {canvas: base, type: "base", x: 0, y: 0}
      {canvas: megane, type: "overlay", x: 50, y: 50}
    ]
    assert.ok true
    frame = craetePictureFrame("SurfaceRender#composeElements")
    frame.add render.cnv, "メガネかけていればOK"
    done()

QUnit.test 'SurfaceRender#drawRegions', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.png")
    new SurfaceCanvas().loadFromURL("src/surface0730.pna")
  ]).then ([base, png, pna])->
    megane_render = new SurfaceRender(png)
    megane_render.pna(pna)
    megane = megane_render.getSurfaceCanvas()
    render = new SurfaceRender()
    render.composeElements [
      {canvas: base, type: "base", x: 0, y: 0}
      {canvas: megane, type: "overlay", x: 50, y: 50}
    ]
    render.drawRegions([
      {is: 0, type: "rect", name: "Head", left: 56, top: 58, right: 132, bottom: 91}
      {is: 1, type: "rect", name: "Face", left: 68, top: 96, right: 121, bottom: 144}
      {is: 2, type: "rect", name: "Bust", left: 59, top: 191, right: 106, bottom: 221}
      {is: 3, type: "rect", name: "Power", left: 68, top: 175, right: 90, bottom: 192}
      {is: 4, type: "rect", name: "Leg", left: 47, top: 326, right: 79, bottom: 357}
      {is: 5, type: "rect", name: "Leg", left: 97, top: 322, right: 130, bottom: 350}
      {is: 6, type: "rect", name: "Ribbon", left: 66, top: 7, right: 148, bottom: 49}
      {is: 7, type: "rect", name: "Body", left: 53, top: 223, right: 115, bottom: 253}
      {is: 8, type: "rect", name: "Foot", left: 46, top: 386, right: 87, bottom: 441}
      {is: 9, type: "rect", name: "Foot", left: 116, top: 382, right: 155, bottom: 442}
      {is: 10, type: "rect", name: "Ponytail", left: 129, top: 52, right: 151, bottom: 179}
    ])
    assert.ok true
    assert.ok false, "不定形当たり判定の描画がまだです"
    frame = craetePictureFrame("SurfaceRender#drawRegions")
    frame.add render.cnv, "当たり判定表示できていればOK"
    done()
