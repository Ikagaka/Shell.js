prmNar = NarLoader.loadFromURL('../nar/mobilemaster.nar')
$ -> $("<style />").html("body{background-color:#D2E0E6;}canvas,img{border:1px solid black;}").appendTo($("body"))
window.SurfaceUtil = Shell.SurfaceUtil
window.Shell = Shell.Shell

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
      hit = SurfaceUtil.getRegion(srf.element, srf.surfaceNode.collisions , offsetX, offsetY)
      console.log(hit)
      if hit.isHit
        $(ev.target).css 'cursor': 'pointer'
      else
        $(ev.target).css 'cursor': 'default'
      return
    return

  QUnit.module 'Shell'
  shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer()
  console.dir shellDir
  shell = new Shell(shellDir)
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
        shell.showRegion()
        shell.render()
        setTimeout (->
          shell.bind 0, 20
          shell.bind 0, 30
          shell.bind 0, 31
          shell.bind 0, 32
          shell.bind 0, 50
          shell.hideRegion()
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
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 0)
    srf.render()
    assert.ok srf.surfaceId == 0
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※s[0]。periodic,5瞬き、talk,4口パク。'
    return
  QUnit.test 'shell#attachSurface (basic element and animation)', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 3)
    console.log srf
    assert.ok srf.surfaceId == 3
    assert.ok $(srf.element).children()[0] instanceof HTMLCanvasElement
    assert.ok $(srf.element).height() == 445
    assert.ok $(srf.element).width() == 182
    assert.ok srf.surfaceNode.collisions[0].name == 'Head'
    assert.ok srf.surfaceNode.animations[0].interval == 'sometimes'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※胸を腕で覆っている。sometimes瞬き、random,6目そらし、talk,4口パク。'
    return
  QUnit.test 'shell#attachSurface (animation always)', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 7)
    assert.ok srf.surfaceId == 7
    assert.ok srf.element instanceof HTMLDivElement
    assert.ok $(srf.element).height() == 445
    assert.ok $(srf.element).width() == 182
    assert.ok srf.surfaceNode.collisions[0].name == 'Head'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, '※腕組み。瞬き、always怒り、口パク。'
    return
  QUnit.test 'shell#attachSurface (runonce)', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 401)
    assert.ok srf.surfaceId == 401
    assert.ok srf.element instanceof HTMLDivElement
    assert.ok $(srf.element).height() == 445
    assert.ok $(srf.element).width() == 182
    setPictureFrame srf, '※寝ぼけ。runonce口に手を当ててから直ぐ離し目パチ。'
    return
  QUnit.test 'shell#attachSurface ', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 11)
    console.log srf
    assert.ok srf.surfaceId == 11
    assert.ok srf.element instanceof HTMLDivElement
    assert.ok $(srf.element).height() == 210
    assert.ok $(srf.element).width() == 230
    assert.ok srf.surfaceNode.collisions[0].name == 'Screen'
    setInterval (->
      srf.talk()
      return
    ), 80
    setPictureFrame srf, 'CRTゅう'
    return
  QUnit.test 'shell#attachSurface (srf.play())', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 5000)
    srf.play 100
    assert.ok srf.surfaceId == 5000
    setPictureFrame srf, '※１回のみ爆発アニメ。'
    return
  QUnit.test 'shell#attachSurface (error filepath handle)', (assert) ->
    div = document.createElement('div')
    srf = shell.attachSurface(div, 0, 5001)
    srf.render()
    assert.ok srf.surfaceId == 5001
    assert.ok srf.element instanceof HTMLDivElement
    assert.ok $(srf.element).height() == 300
    assert.ok $(srf.element).width() == 300
    setPictureFrame srf, '※透明です。ファイル名エラー補正のテスト。'
    return
  QUnit.test 'shell#getBindGroups', (assert) ->
    arr = shell.getBindGroups(0);
    expected =
      20: {category: "装備", parts: "飛行装備"}
      30: {category: "みみ", parts: "MiSP-[sDA]アンテナ"}
      31: {category: "みみ", parts: "めか"}
      32: {category: "みみ", parts: "ねこ"}
      50: {category: "アクセサリ", parts: "MiSP-[sDA]眼鏡"}
    arr.forEach ({category, parts}, bindId)->
      assert.ok category = expected[bindId].category
      assert.ok parts = expected[bindId].parts
  return

# ---
# generated by js2coffee 2.1.0
