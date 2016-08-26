{SurfaceUtil} = require("ikagaka.shell.js")

#function recursiveElementFromPoint(ev: JQueryEventObject, parent: HTMLElement, target: HTMLElement): HTMLElement {
recursiveElementFromPoint = (ev, parent, target)->
  #debug# console.group(ev.type)
  # parentはdelegateする先祖要素
  {clientX, clientY, pageX, pageY} = SurfaceUtil.getEventPosition(ev)
  {scrollX, scrollY} = SurfaceUtil.getScrollXY()
  {left, top} = $(target).offset()
  offsetX = clientX - (left - scrollX) # window.scrollX は position: fixed; でのclientWidthをとるため
  offsetY = clientY - (top  - scrollY)

  # targetは先祖要素の子孫かつcanvasかつ不透明
  if ($(parent).find(target).length > 0 && # targetは先祖要素の子孫
      target instanceof HTMLCanvasElement && # かつcanvas
      SurfaceUtil.isHit(target, offsetX, offsetY)) # かつ不透明
    #debug# console.log("targetは先祖要素の子孫かつcanvasかつ不透明")
    eventPropagationSim(target, ev)
    #debug# console.groupEnd()
    return target;

  tmp = target.style.display
  target.style.display = "none"
  under = document.elementFromPoint(clientX, clientY) # 座標直下の要素を取得
  if !under? # 座標直下にはもう何もなかった
    target.style.display = tmp
    #debug# console.log("座標直下にはもう何もなかった")
    #debug# console.groupEnd()
    return null

  if $(parent).find(under).length > 0 # 座標直下に先祖要素の子孫要素があった
    #debug# console.log("座標直下に先祖要素の子孫要素があった")
    result = recursiveElementFromPoint(ev, parent, under) # 再帰的にクリックスルー判定をする
    target.style.display = tmp
    #debug# console.groupEnd()
    return result

  # 直下の要素は先祖要素の子孫ではない
  eventPropagationSim(under, ev) # 第三者の要素にマウスイベントを投げる
  target.style.display = tmp
  # マウスを停止しているのにここを大量のmousemoveが通過するが
  # target.style.display = "none"したのち
  # target.style.display = tmp した瞬間に
  # mousemoveが発生してしまうためで、それほど大きな問題はないので大丈夫
  # (モバイルだとマウスないからmousemove発生しないし)
  #debug# console.log("直下の要素は先祖要素の子孫ではない")
  #debug# console.groupEnd()
  return under


#function eventPropagationSim(target: HTMLElement, ev: JQueryEventObject): void {
eventPropagationSim = (target, ev)->
  ev.preventDefault()
  ev.stopPropagation()
  if /^mouse|contextmenu|click$/.test(ev.type) # マウスイベントをシミュレーション
    ua = window.navigator.userAgent.toLowerCase()
    if ua.indexOf("msie") isnt -1 or ua.indexOf("trident") isnt -1 # もしIE
      mev = document.createEvent("MouseEvent")
      # https://msdn.microsoft.com/ja-jp/library/ff975292(v=vs.85).aspx
      mev.initMouseEvent(ev.type,
        true, # canBubble
        true, # cancelable
        ev.originalEvent["view"], # viewArg
        ev.originalEvent["detail"], # detailArg
        ev.screenX, # screenXArg
        ev.screenY, # screenYArg
        ev.clientX, # clientXArg
        ev.clientY, # clientYArg
        ev.ctrlKey, # ctrlKeyArg
        ev.altKey, # altKeyArg
        ev.shiftKey, # shiftKeyArg
        ev.metaKey, # metaKeyArg
        ev.button, # buttonArg
        ev.relatedTarget # relatedTargetArg
      )
      target.dispatchEvent(mev)
    else
      mev = new MouseEvent(ev.type, {
        screenX: ev.screenX,
        screenY: ev.screenY,
        clientX: ev.clientX,
        clientY: ev.clientY,
        ctrlKey: ev.ctrlKey,
        altKey:  ev.altKey,
        shiftKey:ev.shiftKey,
        metaKey: ev.metaKey,
        button:  ev.button,
        buttons: ev.originalEvent["buttons"],
        relatedTarget: ev.relatedTarget,
        view:    ev.originalEvent["view"],
        detail:  ev.originalEvent["detail"],
        bubbles: true
      })
      target.dispatchEvent(mev)
  else if /^touch/.test(ev.type) # 地獄のタッチイベントシミュレーション
    ua = window.navigator.userAgent.toLowerCase()
    if !(document.createTouch instanceof Function)
      return console.warn(ua, "does not support document.createTouch")
    if !(document.createTouchList instanceof Function)
      return console.warn(ua, "does not support document.createTouchList")

    tev = document.createEvent("TouchEvent")

    if !(tev["initTouchEvent"] instanceof Function)
      return console.warn(ua, "does not support TouchEvent#initTouchEvent")
    {pageX, pageY, clientX, clientY, screenX, screenY} = SurfaceUtil.getEventPosition(ev)

    touch = document.createTouch(
      document.defaultView,
      ev.target,
      0,
      pageX,
      pageY,
      screenX,
      screenY)
    touches = document.createTouchList(touch)
    if ua.indexOf('chrome') isnt -1 || ua.indexOf('opera') isnt -1 #chrome|opera
      console.info("this browser is chrome or opera", ua)
      (tev["initTouchEvent"])(
        touches,
        touches,
        touches,
        ev.type,
        ev.originalEvent["view"],
        screenX,
        screenY,
        clientX,
        clientY,
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey);
    else if ua.indexOf('safari') isnt -1 # safari
      console.info("this browser is safari", ua)
      (tev["initTouchEvent"])(
        ev.type,
        true,
        ev.cancelable,
        ev.originalEvent["view"],
        ev.originalEvent["detail"],
        screenX,
        screenY,
        clientX,
        clientY,
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey,
        touches,
        touches,
        touches,
        0,
        0)
    else if ua.indexOf('firefox') isnt -1 || true #firefox or anything else
      console.info("this browser is firefox", ua)
      (tev["initTouchEvent"])(
        ev.type,
        true,
        ev.cancelable,
        ev.originalEvent["view"],
        ev.originalEvent["detail"],
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey,
        touches,
        touches,
        touches)
    target.dispatchEvent(tev) # タッチイベント発火
  else
    console.warn(ev.type, "is not support event");


exports.recursiveElementFromPoint = recursiveElementFromPoint
exports.eventPropagationSim = eventPropagationSim
