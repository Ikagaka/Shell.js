window.$ = require("jquery")
window.SurfaceUtil = require("./SurfaceUtil")
window.ST = require("./SurfaceTree")
window.Surface = require("./Surface").default

$ -> $("<style />").html("canvas{border:1px solid black;}").appendTo($("body"))



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
      aliases: []
      descript: {}
      surfaces: [
        {
          base: base
          elements: []
          collisions: []
          animations: [
            {
              intervals: [["periodic", 5]]
              options: []
              patterns: [
                {
                  type: "overlay"
                  surface: 1
                  wait: [50, 3000]
                  x: 65
                  y: 100
                }
                {
                  type: "overlay"
                  surface: 2
                  wait: [50,50]
                  x: 65
                  y: 100
                }
                {
                  type: "overlay"
                  surface: 1
                  wait: [50,50]
                  x: 65
                  y: 100
                }
                {
                  type: "overlay"
                  surface: -1
                  wait:[50,50]
                  x: 0
                  y: 0
                }
              ]
            }
          ]
        }
        {
          base: srf100
          elements: []
          collisions: []
          animations: []
        }
        {
          base: srf101
          elements: []
          collisions: []
          animations: []
        }
      ]
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    setTimeout ->
      assert.ok $(srf.element).width() is base.cnv.width
      assert.ok $(srf.element).height() is base.cnv.height
      frame = SU.craetePictureFrame("surface0")
      frame.add srf.element, "マリちゃんの\\0\\s[0]のまばたき"
      done()


QUnit.test 'surface overlay', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0.png")
  ]).then ([_base])->
    base = {cnv: null, png: _base, pna: null}
    surfaceTree =
      descript: {}
      aliases: []
      surfaces: [ 
        {
          base: base
          elements: []
          collisions: []
          animations: [
            {
              intervals: ["always"]
              options: []
              patterns: [
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: 10
                  y: 10
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: 20
                  y: 0
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: 10
                  y: -10
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: 0
                  y: -20
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: -10
                  y: -10
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: -20
                  y: 0
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: -10
                  y: 10
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [50,50]
                  x: 0
                  y: 20
                }
              ]
            }
          ]
        }
      ]
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    assert.ok $(srf.element).width() is base.cnv.width
    assert.ok $(srf.element).height() is base.cnv.height
    frame = SU.craetePictureFrame("overlay テスト")
    frame.add srf.element, "マリちゃんのセルフエグザイル"
    done()

QUnit.test 'surface overlay negative', (assert) ->
  done = assert.async()
  Promise.all([
    SurfaceUtil.fetchImageFromURL("src/surface0.png")
  ]).then ([_base])->
    base = {cnv: null, png: _base, pna: null}
    surfaceTree =
      descript: {}
      aliases: []
      surfaces: [
        {
          base: base
          elements: []
          collisions: []
          animations: [
            {
              intervals: ["always"]
              options: []
              patterns: [
                {
                  type: "overlay"
                  surface: 0
                  wait: [30,30]
                  x: -10
                  y: -10
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [30,30]
                  x: -20
                  y: -20
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [30,30]
                  x: -30
                  y: -30
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [30,30]
                  x: -40
                  y: -40
                }
                {
                  type: "overlay"
                  surface: 0
                  wait: [30,30]
                  x: -50
                  y: -50
                }
              ]
            }
          ]
        }
      ]
    srf = new Surface(document.createElement("div"), 0, 0, surfaceTree)
    assert.ok $(srf.element).width() is base.cnv.width
    assert.ok $(srf.element).height() is base.cnv.height
    frame = SU.craetePictureFrame("overlay テスト")
    frame.add srf.element, "マリちゃんが左上へ向かう"
    done()

###
QUnit.test '不定形当たり判定', (assert) ->
QUnit.test 'start.alternative', (assert) ->
###
