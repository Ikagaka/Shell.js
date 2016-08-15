window.SurfaceUtil = Shell.SurfaceUtil
window.Surface = Shell.Surface

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



QUnit.module 'Shell.Surface'


QUnit.test 'surface0', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0.png")
    SurfaceUtil.fetchImageFromURL("src/surface100.png")
    SurfaceUtil.fetchImageFromURL("src/surface101.png")
  ]).then ([_base, _srf100, _srf101])->
    base = {cnv: null, png: _base, pna: null}
    srf100 = {cnv: null, png: _srf100, pna: null}
    srf101 = {cnv: null, png: _srf101, pna: null}
    surfaceTree =
      0:
        base: base
        elements: []
        collisions: []
        animations: [
          {
            is: 0
            interval: "periodic,5"
            patterns: [
              {
                type: "overlay"
                surface: 100
                wait: "50-3000"
                x: 65
                y: 100
              }
              {
                type: "overlay"
                surface: 101
                wait: 50
                x: 65
                y: 100
              }
              {
                type: "overlay"
                surface: 100
                wait: 50
                x: 65
                y: 100
              }
              {
                type: "overlay"
                surface: -1
                wait: 50
                x: 0
                y: 0
              }
            ]
          }
        ]
      100:
        base: srf100
        elements: []
        collisions: []
        animations: []
      101:
        base: srf101
        elements: []
        collisions: []
        animations: []
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    setTimeout ->
      assert.ok $(srf.element).width() is base.cnv.width
      assert.ok $(srf.element).height() is base.cnv.height
      frame = craetePictureFrame("surface0")
      frame.add srf.element, "マリちゃんの\\0\\s[0]のまばたき"
      done()


QUnit.test 'surface overlay', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0.png")
  ]).then ([_base])->
    base = {cnv: null, png: _base, pna: null}
    surfaceTree =
      0:
        base: base
        elements: []
        collisions: []
        animations: [
          {
            is: 0
            interval: "always"
            patterns: [
              {
                type: "overlay"
                surface: 0
                wait: "50"
                x: 10
                y: 10
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: 20
                y: 0
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: 10
                y: -10
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: 0
                y: -20
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: -10
                y: -10
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: -20
                y: 0
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: -10
                y: 10
              }
              {
                type: "overlay"
                surface: 0
                wait: 50
                x: 0
                y: 20
              }
            ]
          }
        ]
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    assert.ok $(srf.element).width() is base.cnv.width
    assert.ok $(srf.element).height() is base.cnv.height
    frame = craetePictureFrame("overlay テスト")
    frame.add srf.element, "マリちゃんのセルフエグザイル"
    done()

QUnit.test 'surface overlay negative', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0.png")
  ]).then ([_base])->
    base = {cnv: null, png: _base, pna: null}
    surfaceTree =
      0:
        base: base
        elements: []
        collisions: []
        animations: [
          {
            is: 0
            interval: "always"
            patterns: [
              {
                type: "overlay"
                surface: 0
                wait: "30"
                x: -10
                y: -10
              }
              {
                type: "overlay"
                surface: 0
                wait: "30"
                x: -20
                y: -20
              }
              {
                type: "overlay"
                surface: 0
                wait: "30"
                x: -30
                y: -30
              }
              {
                type: "overlay"
                surface: 0
                wait: "30"
                x: -40
                y: -40
              }
              {
                type: "overlay"
                surface: 0
                wait: "30"
                x: -50
                y: -50
              }
            ]
          }
        ]
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    assert.ok $(srf.element).width() is base.cnv.width
    assert.ok $(srf.element).height() is base.cnv.height
    frame = craetePictureFrame("overlay テスト")
    frame.add srf.element, "マリちゃんが左上へ向かう"
    done()

###
QUnit.test '不定形当たり判定', (assert) ->
QUnit.test 'start.alternative', (assert) ->
###
