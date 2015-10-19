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
    $elm.on("contextmenu",(ev)=> processMouseEvent(ev, "mouseclick", this));
    $elm.on("click",      (ev)=> processMouseEvent(ev, "mouseclick", this));
    $elm.on("dblclick",   (ev)=> processMouseEvent(ev, "mousedblclick", this));
    $elm.on("mousedown",  (ev)=> processMouseEvent(ev, "mousedown", this));
    $elm.on("mousemove",  (ev)=> processMouseEvent(ev, "mousemove", this));
    $elm.on("mouseup",    (ev)=> processMouseEvent(ev, "mouseup", this));

    var tid = 0
    var touchCount = 0
    var touchStartTime = 0
    $elm.on("touchmove",  (ev)=> processMouseEvent(ev, "mousemove", this));
    $elm.on("touchend",   (ev)=>{
      processMouseEvent(ev, "mouseup", this);
      processMouseEvent(ev, "mouseclick", this);
      if (Date.now() - touchStartTime < 500 && touchCount%2 === 0){
        processMouseEvent(ev, "mousedblclick", this);
      }
    });
    $elm.on("touchstart", (ev)=>{
      touchCount++;
      touchStartTime = Date.now();
      processMouseEvent(ev, "mousedown", this);
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

function processMouseEvent(ev:JQueryEventObject, type:string, srf:Surface): void{
  $(ev.target).css({"cursor": "default"});

  if (/^touch/.test(ev.type)) {//もしタッチ
    var changedTouches = <{pageX:number, pageY:number}[]>ev["changedTouches"]; //そういうプロパティがあるんです（おこ
    var {pageX, pageY} = changedTouches[0];
  } else {//もしマウス
    var {pageX, pageY} = ev;
  }
  var {left, top} = $(ev.target).offset();
  var offsetX = pageX - left;//canvas左上からのx座標
  var offsetY = pageY - top;//canvas左上からのy座標
  var hit = srf.getRegion(offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}

  if(hit.isHit){
    ev.preventDefault();
    var detail ={
      "type": type,
      "offsetX": offsetX|0,//float->int
      "offsetY": offsetY|0,//float->int
      "wheel": 0,
      "scope": srf.scopeId,
      "region": hit.name,
      "button": ev.button === 2 ? 1 : 0
    };
    if(hit.name !== ""){//もし当たり判定
      if(/^touch/.test(ev.type)){
        ev.stopPropagation();
        // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
        // ために親要素にイベント伝えない
      }
      $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
    }
    srf.emit(type, $.Event('type', {detail, bubbles: true }));
    return;
  }

  // 以後透明領域のマウスイベント透過処理
  // pointer-events shim
  // canvasの透明領域のマウスイベントを真下の要素に投げる
  var cnv = <HTMLElement>ev.target; // Element、お前は今日からHTMLElementだ(ていうかcanvas)
  var tmpDisp = cnv.style.display;
  cnv.style.display = "none";　// 非表示にして直下の要素を調べるハック
  var under = document.elementFromPoint(ev.pageX, ev.pageY);
  if (! (under instanceof Element) ){ // under == null, 下には何もなかった（そんな馬鹿な
    cnv.style.display = tmpDisp; // もとの設定に戻す
    return;
  }
  // under は何らかの要素だった
  if(/^mouse/.test(ev.type)){ // 直下要素へイベント作りなおして伝播
    ev.preventDefault();
    ev.stopPropagation();
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    var mev = new MouseEvent(ev.type, {
      screenX: ev.screenX,
      screenY: ev.screenY,
      clientX: ev.clientX,
      clientY: ev.clientY,
      ctrlKey: ev.ctrlKey,
      altKey: ev.altKey,
      shiftKey: ev.shiftKey,
      metaKey: ev.metaKey,
      button: ev.button,
      buttons: <number>ev["buttons"],
      relatedTarget: ev.relatedTarget,
      view: <Window>ev["view"],
      detail: <number>ev["detail"]
    });
    under.dispatchEvent(mev);
    return;
  }
  if( /^touch/.test(ev.type) && !!document.createTouchList){
    ev.preventDefault();
    ev.stopPropagation();
    var tev = document.createEvent("TouchEvent");
    // https://developer.mozilla.org/en/docs/Web/API/Document/createTouch
    // http://stackoverflow.com/questions/31079014/how-to-create-a-touchevent-in-chrome
    var touch = <Touch>document.createTouch(
      <Window>ev["view"],
      ev.target,
      0, //identifier
      ev.pageX,
      ev.pageY,
      ev.screenX,
      ev.screenY); //force
    var touches = document.createTouchList(touch);
    // http://qiita.com/damele0n/items/dc312bbf66da1d46dd6f
    var initTouchEvent = <Function>TouchEvent.prototype["initTouchEvent"];
    var args: [any];
    if(true){// Chrome, Opera
      args = [
        touches,             // {TouchList} touches
        touches,             // {TouchList} targetTouches
        touches,             // {TouchList} changedTouches
        ev.type,             // {String}    type
        <Window>ev["view"],  // {Window}    view
        ev.screenX,          // {Number}    screenX
        ev.screenY,          // {Number}    screenY
        ev.clientX,          // {Number}    clientX
        ev.clientY,          // {Number}    clientY
        ev.ctrlKey,          // {Boolean}   ctrlKey
        ev.altKey,           // {Boolean}   alrKey
        ev.shiftKey,         // {Boolean}   shiftKey
        ev.metaKey           // {Boolean}   metaKey
      ];
    }else if (false){// Safari
      args = [
        ev.type,              // {String}    type
        ev.cancelBubble,      // {Boolean}   canBubble
        ev.cancelable,        // {Boolean}   cancelable
        <Window>ev["view"],   // {Window}    view
        <number>ev["detail"], // {Number}    detail
        ev.screenX,           // {Number}    screenX
        ev.screenY,           // {Number}    screenY
        ev.clientX,           // {Number}    clientX
        ev.clientY,           // {Number}    clientY
        ev.ctrlKey,           // {Boolean}   ctrlKey
        ev.altKey,            // {Boolean}   alrKey
        ev.shiftKey,          // {Boolean}   shiftKey
        ev.metaKey,           // {Boolean}   metaKey
        touches,              // {TouchList} touches
        touches,              // {TouchList} targetTouches
        touches,              // {TouchList} changedTouches
        0,                    // {Number}    scale(0 - 1)
        0                     // {Number}    rotation
      ];
    }else if (false){// Firefox
      args = [
        ev.type,              // {String} type
        ev.cancelBubble,      // {Boolean} canBubble
        ev.cancelable,        // {Boolean} cancelable
        <Window>ev["view"],   // {Window} view
        <number>ev["detail"], // {Number} detail
        ev.ctrlKey,           // {Boolean} ctrlKey
        ev.altKey,            // {Boolean} altKey
        ev.shiftKey,          // {Boolean} shiftKey
        ev.metaKey,           // {Boolean} metaKey
        touches,              // {TouchList} touches
        touches,              // {TouchList} targetTouches
        touches               // {TouchList} changedTouches
      ];
    }
    initTouchEvent.apply(tev, args);
    under.dispatchEvent(tev);
    return;
  }
}
