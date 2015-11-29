window.SurfaceUtil = Shell.SurfaceUtil
window.SurfaceCanvas = Shell.SurfaceCanvas
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


QUnit.test 'Surface()', (assert) ->
  done = assert.async()
  Promise.all([
    new SurfaceCanvas().loadFromURL("src/surface0.png")
    new SurfaceCanvas().loadFromURL("src/surface100.png")
    new SurfaceCanvas().loadFromURL("src/surface101.png")
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
    console.log srf = new Surface(SurfaceUtil.createCanvas(), 0, 0, surfaceTree)
    assert.ok srf.element.width is base.width
    assert.ok srf.element.height is base.height
    frame = craetePictureFrame("surface0")
    frame.add srf.element, "マリちゃんの\\0\\s[0]のまばたき"
    done()
