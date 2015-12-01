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
    SurfaceUtil.createSurfaceCanvasFromURL("src/surface0.png")
    SurfaceUtil.createSurfaceCanvasFromURL("src/surface100.png")
    SurfaceUtil.createSurfaceCanvasFromURL("src/surface101.png")
  ]).then ([base, srf100, srf101])->
    surfaceTree =
      0:
        base: base
        elements: []
        collisions: []
        animations: [
          {
            is: 0
            interval: "periodic"
            option: "5"
            patterns: [
              {
                animation_ids: []
                type: "overlay"
                surface: 100
                wait: "50-3000"
                x: 65
                y: 100
              }
              {
                animation_ids: []
                type: "overlay"
                surface: 101
                wait: 50
                x: 65
                y: 100
              }
              {
                animation_ids: []
                type: "overlay"
                surface: 100
                wait: 50
                x: 65
                y: 100
              }
              {
                animation_ids: []
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
    srf = new Surface(SurfaceUtil.createCanvas(), 0, 0, surfaceTree)
    assert.ok srf.element.width is base.cnv.width
    assert.ok srf.element.height is base.cnv.height
    frame = craetePictureFrame("surface0")
    frame.add srf.element, "マリちゃんの\\0\\s[0]のまばたき"
    done()

###
QUnit.test '不定形当たり判定', (assert) ->
QUnit.test 'start.alternative', (assert) ->
###
