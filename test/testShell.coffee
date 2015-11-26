prmNar = NarLoader.loadFromURL('../nar/mobilemaster.nar')

prmNar.then (nanikaDir) ->

  setPictureFrame = (srf, description) ->
    fieldset = document.createElement('fieldset')
    legend = document.createElement('legend')
    p = document.createElement('p')
    legend.appendChild document.createTextNode('' + srf.surfaceId)
    p.appendChild document.createTextNode(description or '')
    fieldset.appendChild legend
    fieldset.appendChild srf.element
    fieldset.appendChild p
    fieldset.style.display = 'inline-block'
    fieldset.style.width = '310px'
    document.body.appendChild fieldset
    srf.element.addEventListener 'mousemove', (ev) ->
      pageX = ev.pageX
      pageY = ev.pageY
      tmp = $(ev.target).offset()
      left = tmp.left
      top = tmp.top
      offsetX = pageX - left
      offsetY = pageY - top
      hit = srf.getRegion(offsetX, offsetY)
      if hit.isHit
        $(ev.target).css 'cursor': 'pointer'
      else
        $(ev.target).css 'cursor': 'default'
      return
    return

  QUnit.module 'Shell'
  shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer()
  console.dir shellDir
  shell = new (Shell.Shell)(shellDir)
  QUnit.test 'shell#load', (assert) ->
    done = assert.async()
    shell.load().then((shell) ->
      assert.ok true
      console.log shell
      setInterval (->
        shell.unbind 0, 20
        shell.unbind 0, 30
        shell.unbind 0, 31
        shell.unbind 0, 32
        shell.unbind 0, 50
        shell.enableRegionDraw = true
        shell.render()
        setTimeout (->
          shell.bind 0, 20
          shell.bind 0, 30
          shell.bind 0, 31
          shell.bind 0, 32
          shell.bind 0, 50
          shell.enableRegionDraw = false
          shell.render()
          return
        ), 3000
        return
      ), 6000
      done()
      return
    ).catch (err) ->
      console.error err, err.stack, shell
      assert.ok false
      done()
      return
  QUnit.test 'shell#hasFile', (assert) ->
    console.log 2
    assert.ok shell.hasFile('surface0.png')
    assert.ok shell.hasFile('surface0.PNG')
    assert.ok shell.hasFile('.\\SURFACE0.PNG')
    assert.ok !shell.hasFile('surface0+png')
    assert.ok shell.hasFile('./surface0.png')
    assert.ok !shell.hasFile('/surface0/png')
    return
  QUnit.test 'shell.descript', (assert) ->
    assert.ok shell.descript['kero.bindgroup20.name'] == '装備,飛行装備'
    return
  QUnit.test 'shell.surfacesTxt', (assert) ->
    assert.ok shell.surfacesTxt.charset == 'Shift_JIS'
    assert.ok shell.surfacesTxt.descript.version == 1
    return
  QUnit.test 'shell#attachSurface (periodic)', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 0)
    srf.render()
    assert.ok srf.surfaceId == 0
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※s[0]。periodic,5瞬き、talk,4口パク。'
    return
  QUnit.test 'shell#attachSurface (basic element and animation)', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 3)
    console.log srf
    assert.ok srf.surfaceId == 3
    assert.ok srf.element instanceof HTMLCanvasElement
    assert.ok srf.element.height == 445
    assert.ok srf.element.width == 182
    assert.ok srf.surfaceResources.collisions[0].name == 'Head'
    assert.ok srf.surfaceResources.animations[0].interval == 'sometimes'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※胸を腕で覆っている。sometimes瞬き、random,6目そらし、talk,4口パク。'
    return
  QUnit.test 'shell#attachSurface (animation always)', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 7)
    assert.ok srf.surfaceId == 7
    assert.ok srf.element instanceof HTMLCanvasElement
    assert.ok srf.element.height == 445
    assert.ok srf.element.width == 182
    assert.ok srf.surfaceResources.collisions[0].name == 'Head'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※腕組み。瞬き、always怒り、口パク。'
    return
  QUnit.test 'shell#attachSurface (runonce)', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 401)
    assert.ok srf.surfaceId == 401
    assert.ok srf.element instanceof HTMLCanvasElement
    assert.ok srf.element.height == 445
    assert.ok srf.element.width == 182
    setPictureFrame srf, '※寝ぼけ。runonce口に手を当ててから直ぐ離し目パチ。'
    return
  QUnit.test 'shell#attachSurface ', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 11)
    console.log srf
    assert.ok srf.surfaceId == 11
    assert.ok srf.element instanceof HTMLCanvasElement
    assert.ok srf.element.height == 210
    assert.ok srf.element.width == 230
    assert.ok srf.surfaceResources.collisions[0].name == 'Screen'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, 'CRTゅう'
    return
  QUnit.test 'shell#attachSurface (srf.play())', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 5000)
    srf.play 100
    assert.ok srf.surfaceId == 5000
    setPictureFrame srf, '※１回のみ爆発アニメ。'
    return
  QUnit.test 'shell#attachSurface (error filepath handle)', (assert) ->
    cnv = document.createElement('canvas')
    srf = shell.attachSurface(cnv, 0, 5001)
    srf.render()
    assert.ok srf.surfaceId == 5001
    assert.ok srf.element instanceof HTMLCanvasElement
    assert.ok srf.element.height == 300
    assert.ok srf.element.width == 300
    setPictureFrame srf, '※透明です。ファイル名エラー補正のテスト。'
    return
  return

# ---
# generated by js2coffee 2.1.0
