/// <reference path="../typings/tsd.d.ts"/>

import {SurfaceRender, SurfaceLayerObject} from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {Shell, SurfaceTreeNode} from "./Shell";

var $ = jQuery;

export class Surface extends EventEmitter2{
  // public
  element: HTMLCanvasElement;
  scopeId: number;
  surfaceId: number;
  shell: Shell;
  destructed: boolean;

  // private
  surfaceResources: SurfaceTreeNode; //{base, elements, collisions, animations}
  bufferCanvas: HTMLCanvasElement; //チラツキを抑えるためのバッファ
  bufRender: SurfaceRender;//バッファのためのレンダラ
  elmRender: SurfaceRender;//実際のDOMTreeにあるcanvasへのレンダラ

  layers: { [is: number]: SurfaceAnimationPattern; };//baseサーフェスの上に書き込まれていくバッファ
  stopFlags: { [key: string]: boolean; };//keyがfalseのアニメーションの再生を停止する
  talkCount: number;
  talkCounts: { [key: string]: number };//key:タイミングがtalkのアニメーションid、number:talkCountの閾値

  constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell) {
    super();
    EventEmitter2.call(this);

    var $elm = $(canvas);
    $elm.on("contextmenu",(ev)=> processMouseEvent(ev, "mouseclick", this, false, ""));
    $elm.on("click",      (ev)=> processMouseEvent(ev, "mouseclick", this, false, ""));
    $elm.on("dblclick",   (ev)=> processMouseEvent(ev, "mousedblclick", this, false, ""));
    $elm.on("mousedown",  (ev)=> processMouseEvent(ev, "mousedown", this, false, ""));
    $elm.on("mousemove",  (ev)=> processMouseEvent(ev, "mousemove", this, false, ""));
    $elm.on("mouseup",    (ev)=> processMouseEvent(ev, "mouseup", this, false, ""));

    var tid = 0
    var touchCount = 0
    var touchStartTime = 0
    $elm.on("touchmove",  (ev)=> processMouseEvent(ev, "mousemove", this, false, ""));
    $elm.on("touchend",   (ev)=>{
      processMouseEvent(ev, "mouseup", this, false, "");
      processMouseEvent(ev, "mouseclick", this, false, "");
      if (Date.now() - touchStartTime < 500 && touchCount%2 === 0){
        processMouseEvent(ev, "mousedblclick", this, false, "");
      }
    });
    $elm.on("touchstart", (ev)=>{
      touchCount++;
      touchStartTime = Date.now();
      processMouseEvent(ev, "mousedown", this, false, "");
      clearTimeout(tid);
      tid = setTimeout(()=> touchCount = 0, 500)
    });

    this.element = canvas;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.shell = shell;

    this.surfaceResources = shell.surfaceTree[surfaceId];
    this.bufferCanvas = SurfaceUtil.createCanvas();
    this.bufRender = new SurfaceRender(this.bufferCanvas);
    this.elmRender = new SurfaceRender(this.element);

    this.destructed = false;
    this.layers = {};
    this.stopFlags = {};
    this.talkCount = 0;
    this.talkCounts = {};

    this.initAnimations();
    this.render();
  }

  initAnimations(): void {
    this.surfaceResources.animations.forEach((anim)=>{
      this.initAnimation(anim);
    });
  }

  initAnimation(anim: SurfaceAnimation): void {
    var {is, interval, patterns} = anim;
    var tmp = interval.split(",");
    var _interval = tmp[0];
    if(tmp.length > 1){
      var n = Number(tmp[1]);
      if(!isFinite(n)){
        console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
        n = 4;
      }
    }
    switch (_interval) {
      case "sometimes":SurfaceUtil.random(  ((callback) => { if (!this.destructed && !this.stopFlags[is]) { this.play(is, callback); } }), 2); break;
      case "rarely":   SurfaceUtil.random(  ((callback) => { if (!this.destructed && !this.stopFlags[is]) { this.play(is, callback); } }), 4); break;
      case "random":   SurfaceUtil.random(  ((callback) => { if (!this.destructed && !this.stopFlags[is]) { this.play(is, callback); } }), n); break;
      case "periodic": SurfaceUtil.periodic(((callback) => { if (!this.destructed && !this.stopFlags[is]) { this.play(is, callback); } }), n); break;
      case "always":   SurfaceUtil.always(  ((callback) => { if (!this.destructed && !this.stopFlags[is]) { this.play(is, callback); } })   ); break;
      case "runonce": this.play(is); break;
      case "never": break;
      case "yen-e": break;
      case "talk": this.talkCounts[is] = n; break;
      default:
        if(/^bind/.test(interval)){
          this.initBind(anim);
          break;
        }
        console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
    }
  }

  updateBind(): void {
    this.surfaceResources.animations.forEach((anim)=>{
      var {is, interval, patterns} = anim;
      if(/^bind/.test(interval)){
        this.initBind(anim);
      }
    });
  }

  initBind(anim: SurfaceAnimation): void {
    var {is, interval, patterns, option} = anim;
    if(!this.shell.bindgroup[is]){
      delete this.layers[is];
      this.stop(is);
      return;
    }
    var [_bind, ...intervals] = interval.split("+");
    intervals.forEach((itvl)=>{
      this.initAnimation({interval: itvl, is, patterns, option});
    });
    if(intervals.length > 0) return;
    this.layers[is] = patterns[patterns.length-1];
    this.render();
  }

  destructor(): void {
    this.elmRender.clear();
    this.destructed = true;
    this.layers = {};
  }

  render(): void {
    var renderLayers = Object.keys(this.layers)
    .sort((layerNumA, layerNumB)=> Number(layerNumA) > Number(layerNumB) ? 1 : -1 )
    .map((key)=> this.layers[Number(key)])
    .reduce<SurfaceLayerObject[]>(((arr, pattern)=>{
      var {surface, type, x, y} = pattern;
      if(surface === -1) return arr;
      var srf = this.shell.surfaceTree[surface];
      if(srf == null) return arr;
      var rndr = new SurfaceRender(SurfaceUtil.copy(srf.base));
      rndr.composeElements(srf.elements);
      //
      //
      return arr.concat({
        type: type,
        x: x,
        y: y,
        canvas: rndr.cnv
      });
    }), []);
    var srfNode = this.surfaceResources;
    this.bufRender.init(srfNode.base);
    this.bufRender.composeElements(srfNode.elements);
    this.bufRender.composeElements(renderLayers);
    if (this.shell.enableRegionDraw) {
      this.bufRender.ctx.fillText(""+this.surfaceId, 5, 10);
      this.bufRender.drawRegions(srfNode.collisions);
    }
    this.elmRender.init(this.bufRender.cnv);
  }

  play(animationId: number, callback?: () => void): void {
    var anims = this.surfaceResources.animations;
    var anim = this.surfaceResources.animations[animationId];
    if(!anim) return void setTimeout(callback);
    // lazyPromises: [()=> Promise<void>, ()=> Promise<void>, ...]
    var lazyPromises = anim.patterns.map((pattern)=> ()=> new Promise<void>((resolve, reject)=> {
      var {surface, wait, type, x, y, animation_ids} = pattern;
      switch(type){
        case "start":            this.play(animation_ids[0],                              ()=> resolve(Promise.resolve())); return;
        case "stop":             this.stop(animation_ids[0]);                  setTimeout(()=> resolve(Promise.resolve())); return;
        case "alternativestart": this.play(SurfaceUtil.choice<number>(animation_ids),             ()=> resolve(Promise.resolve())); return;
        case "alternativestart": this.stop(SurfaceUtil.choice<number>(animation_ids)); setTimeout(()=> resolve(Promise.resolve())); return;
      }
      this.layers[animationId] = pattern;
      this.render();
      var [__, a, b] = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]);
      var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
      setTimeout((()=>{
        if(this.destructed){// stop pattern animation.
          reject(null);
        }else{
          resolve(Promise.resolve());
        }
      }), _wait);
    }));
    var promise = lazyPromises.reduce(((proA, proB)=> proA.then(proB)), Promise.resolve()); // Promise.resolve().then(prom).then(prom)...
    promise
    .then(()=> setTimeout(callback))
    .catch((err)=>{if(!!err) console.error(err.stack); });
  }

  stop(animationId: number): void {
    this.stopFlags[animationId] = true;
  }

  talk(): void {
    var animations = this.surfaceResources.animations;
    this.talkCount++;
    var hits = animations.filter((anim)=>
        /^talk/.test(anim.interval) && this.talkCount % this.talkCounts[anim.is] === 0);
    hits.forEach((anim)=>{
      this.play(anim.is);
    });
  }

  yenE(): void {
    var animations = this.surfaceResources.animations;
    var hits = animations.filter((anim)=>
    anim.interval === "yen-e" && this.talkCount % this.talkCounts[anim.is] === 0);
    hits.forEach((anim)=>{
      this.play(anim.is);
    });
  }

  getRegion(offsetX: number, offsetY: number): {isHit:boolean, name:string} {
    if(SurfaceUtil.isHit(this.element, offsetX, offsetY)){
      var hitCols = this.surfaceResources.collisions.filter((collision, colId)=>{
        var {type, name, left, top, right, bottom, coordinates, radius, center_x, center_y} = collision;
        switch(type){
          case "rect":
            return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
                   (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
          case "ellipse":
            var width = Math.abs(right - left);
            var height = Math.abs(bottom - top);
            return Math.pow((offsetX-(left+width/2))/(width/2), 2) +
                   Math.pow((offsetY-(top+height/2))/(height/2), 2) < 1;
          case "circle":
            return Math.pow((offsetX-center_x)/radius, 2)+Math.pow((offsetY-center_y)/radius, 2) < 1;
          case "polygon":
            var ptC = {x:offsetX, y:offsetY};
            var tuples = coordinates.reduce(((arr, {x, y}, i)=>{
              arr.push([
                coordinates[i],
                (!!coordinates[i+1] ? coordinates[i+1] : coordinates[0])
              ]);
              return arr;
            }), []);
            var deg = tuples.reduce(((sum, [ptA, ptB])=>{
              var vctA = [ptA.x-ptC.x, ptA.y-ptC.y];
              var vctB = [ptB.x-ptC.x, ptB.y-ptC.y];
              var dotP = vctA[0]*vctB[0] + vctA[1]*vctB[1];
              var absA = Math.sqrt(vctA.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
              var absB = Math.sqrt(vctB.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
              var rad = Math.acos(dotP/(absA*absB))
              return sum + rad;
            }), 0)
            return deg/(2*Math.PI) >= 1;
          default:
            console.warn("unkown collision type:", this.surfaceId, colId, name, collision);
            return false;
        }
      });
      if(hitCols.length > 0)
        return {isHit:true, name:hitCols[hitCols.length-1].name};
      return {isHit:true, name:""};
    }else{
      return {isHit:false, name:""};
    }
  }
}

function processMouseEvent(ev:JQueryEventObject, type:string, srf:Surface, isPointerEventsShimed:boolean, lastEventType:string): void{
  $(ev.target).css({"cursor": "default"});

  if(isPointerEventsShimed && ev.type === lastEventType){//無限ループ避ける？
    lastEventType = "";
    isPointerEventsShimed = false;
    ev.stopPropagation();
    ev.preventDefault();
    return;
  }

  if (/^touch/.test(ev.type)) {
    var changedTouches = <{pageX:number, pageY:number}[]>ev["changedTouches"];
    var {pageX, pageY} = changedTouches[0];
  } else {
    var {pageX, pageY} = ev;
  }
  var {left, top} = $(ev.target).offset();
  var offsetX = pageX - left;
  var offsetY = pageY - top;
  var hit = srf.getRegion(offsetX, offsetY);

  if(hit.isHit){
    ev.preventDefault();
    var detail ={
      "type": type,
      "offsetX": offsetX|0,
      "offsetY": offsetY|0,
      "wheel": 0,
      "scope": srf.scopeId,
      "region": hit.name,
      "button": ev.button === 2 ? 1 : 0
    };
    if(hit.name.length > 0){
      if(/^touch/.test(ev.type)){
        ev.stopPropagation(); // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
      }
      $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
    }
    srf.emit(type, $.Event('type', {detail, bubbles: true }));
  }else{
    // pointer-events shim
    // canvasの透明領域のマウスイベントを真下の要素に投げる
    var elm = SurfaceUtil.elementFromPointWithout(<HTMLElement>ev.target, ev.pageX, ev.pageY);
    if(!elm) return;
    if(/^mouse/.test(ev.type)){
      isPointerEventsShimed = true;
      lastEventType = ev.type;
      ev.preventDefault();
      ev.stopPropagation();
      var _ev = document.createEvent("MouseEvent");
      !!_ev.initMouseEvent && _ev.initMouseEvent(
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
        ev.relatedTarget);
      elm.dispatchEvent(_ev);
    }else if( /^touch/.test(ev.type) && !!document.createTouchList){
      isPointerEventsShimed = true;
      lastEventType = ev.type
      ev.preventDefault();
      ev.stopPropagation();
      var touches = document.createTouchList();
      touches[0] = document.createTouch(
        document.body,
        ev.target,
        0, //identifier
        ev.pageX,
        ev.pageY,
        ev.screenX,
        ev.screenY,
        ev.clientX,
        ev.clientY,
        1, //radiusX
        1, //radiusY
        0, //rotationAngle
        1.0); //force
      var _ev = document.createEvent("TouchEvent");
      _ev.initTouchEvent(
        touches, //TouchList* touches,
        touches, //TouchList* targetTouches,
        touches, //TouchList* changedTouches,
        ev.type,
        ev.view, //PassRefPtr<AbstractView> view,
        ev.screenX,
        ev.screenY,
        ev.clientX,
        ev.clientY,
        ev.ctrlKey,
        ev.altKey,
        ev.shiftKey,
        ev.metaKey);
      elm.dispatchEvent(_ev);
    }
  }
}
