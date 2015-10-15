/// <reference path="../typings/tsd.d.ts"/>

import {Surface} from "./Surface";
export class EventBinder extends EventEmitter2 {
  constructor(elm: HTMLElement){
    super();
    EventEmitter2.call(this);

    var $elm = jQuery(elm)
    $elm.on("click", (ev)=>{
      console.log(ev);
      this.emit("mouseclick", ev);
    });
  }
}

/*
@isPointerEventsShimed = false
@lastEventType = ""
@$surfaceCanvas.on "contextmenu",(ev)=> @processMouseEvent(ev, "mouseclick",    ($ev)=> @$surfaceCanvas.trigger($ev))
@$surfaceCanvas.on "click",      (ev)=> @processMouseEvent(ev, "mouseclick",    ($ev)=> @$surfaceCanvas.trigger($ev))
@$surfaceCanvas.on "dblclick",   (ev)=> @processMouseEvent(ev, "mousedblclick", ($ev)=> @$surfaceCanvas.trigger($ev))
@$surfaceCanvas.on "mousedown",  (ev)=> @processMouseEvent(ev, "mousedown",     ($ev)=> @$surfaceCanvas.trigger($ev))
@$surfaceCanvas.on "mousemove",  (ev)=> @processMouseEvent(ev, "mousemove",     ($ev)=> @$surfaceCanvas.trigger($ev))
@$surfaceCanvas.on "mouseup",    (ev)=> @processMouseEvent(ev, "mouseup",       ($ev)=> @$surfaceCanvas.trigger($ev))
do =>
  tid = 0
  touchCount = 0
  touchStartTime = 0
  @$surfaceCanvas.on "touchmove",  (ev)=> @processMouseEvent(ev, "mousemove", ($ev)=> @$surfaceCanvas.trigger($ev))
  @$surfaceCanvas.on "touchend",   (ev)=>
    @processMouseEvent(ev, "mouseup",    ($ev)=> @$surfaceCanvas.trigger($ev))
    @processMouseEvent(ev, "mouseclick", ($ev)=> @$surfaceCanvas.trigger($ev))
    if Date.now() - touchStartTime < 500 and touchCount%2 is 0
      @processMouseEvent(ev, "mousedblclick", ($ev)=> @$surfaceCanvas.trigger($ev))
  @$surfaceCanvas.on "touchstart", (ev)=>
    touchCount++
    touchStartTime = Date.now()
    @processMouseEvent(ev, "mousedown", ($ev)=> @$surfaceCanvas.trigger($ev))
    clearTimeout(tid)
    tid = setTimeout (=>touchCount=0), 500

processMouseEvent: (ev, eventName, callback)->
  $(ev.target).css({"cursor": "default"})
  if @isPointerEventsShimed and ev.type is @lastEventType
    @lastEventType = ""
    @isPointerEventsShimed = false
    ev.stopPropagation()
    ev.preventDefault()
    return
  if /^touch/.test(ev.type)
  then {pageX, pageY} = ev.changedTouches[0]
  else {pageX, pageY} = ev
  {left, top} = $(ev.target).offset()
  offsetX = pageX - left
  offsetY = pageY - top
  hit = @currentSurface.getRegion(offsetX, offsetY)

  if hit.isHit
    ev.preventDefault()
    detail =
      "type": eventName
      "offsetX": offsetX|0
      "offsetY": offsetY|0
      "wheel": 0
      "scope": @scopeId
      "region": hit.name
      "button": (if ev.button is 2 then 1 else 0)

    if hit.name.length > 0
      ev.stopPropagation() if /^touch/.test(ev.type) # when touching stop drug
      $(ev.target).css({"cursor": "pointer"})
    callback($.Event('IkagakaDOMEvent', {detail, bubbles: true }))
  else
    # pointer-events shim
    elm = cuttlebone.SurfaceUtil.elementFromPointWithout(ev.target, ev.pageX, ev.pageY)
    if !elm then return
    if /^mouse/.test(ev.type)
      @isPointerEventsShimed = true
      @lastEventType = ev.type
      ev.preventDefault()
      ev.stopPropagation()
      _ev = document.createEvent("MouseEvent")
      _ev.initMouseEvent?(
        ev.type,
        ev.bubbles,
        ev.cancelable,
        ev.view,
        ev.detail,
        ev.screenX,
        ev.screenY,
        ev.clientX,
        ev.clientY,
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey,
        ev.button,
        ev.relatedTarget)
      elm.dispatchEvent(_ev)
    else if /^touch/.test(ev.type) and !!document.createTouchList
      @isPointerEventsShimed = true
      @lastEventType = ev.type
      ev.preventDefault()
      ev.stopPropagation()
      touches = document.createTouchList()
      touches[0] = document.createTouch(
        document.body,
        ev.target,
        0, #identifier
        ev.pageX,
        ev.pageY,
        ev.screenX,
        ev.screenY,
        ev.clientX,
        ev.clientY,
        1, #radiusX
        1, #radiusY
        0, #rotationAngle
        1.0); #force
      _ev = document.createEvent("TouchEvent")
      _ev.initTouchEvent(
        touches,#TouchList* touches,
        touches,#TouchList* targetTouches,
        touches,#TouchList* changedTouches,
        ev.type,
        ev.view,#PassRefPtr<AbstractView> view,
        ev.screenX,
        ev.screenY,
        ev.clientX,
        ev.clientY,
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey)
      elm.dispatchEvent(_ev)
  return
*/
