// todo: anim collision
// todo: background+exclusive,(1,3,5)
/// <reference path="../typings/tsd.d.ts"/>

import SurfaceRender from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {SurfaceLayerObject, SurfaceTreeNode, SurfaceMouseEvent} from "./Interfaces";
import EventEmitter from "eventemitter3";
import $ from "jquery";


export default class Surface extends EventEmitter {

  public element: HTMLDivElement;
  public scopeId: number;
  public surfaceId: number;
  public position: string; // fixed|absolute
  public enableRegionDraw: boolean;

  private cnv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private surfaceNode: SurfaceTreeNode
  private bufferCanvas: HTMLCanvasElement; //チラツキを抑えるためのバッファ

  private backgrounds:     SurfaceAnimationPattern[];//背景レイヤ
  private layers:          SurfaceAnimationPattern[];//アニメーションIDの現在のレイヤ。アニメで言う動画セル。

  private exclusive: number; // 現在排他実行中のアニメションID
  private talkCount: number;
  private talkCounts:      { [animationId: number]: number };//key:タイミングがtalkのアニメーションid、number:talkCountの閾値
  private animationsQueue: { [animationId: number]: Function[] }; // key:animationId, 再生中のアニメーションのコマごとのキュー。アニメーションの強制停止に使う
  private stopFlags:       { [animationId: number]: boolean };//keyがfalseのアニメーションの"自発的"再生を停止する、sometimesみたいのを止める。bindには関係ない
  private surfaceTree:     { [animationId: number]: SurfaceTreeNode };
  private bindgroup:       { [charId: number]: { [bindgroupId: number]: boolean } }

  private destructed: boolean;
  private destructors: Function[]; // destructor実行時に実行される関数のリスト

  private bufferRender: SurfaceRender;

  constructor(div: HTMLDivElement, scopeId: number, surfaceId: number, surfaceTree: { [animationId: number]: SurfaceTreeNode }, bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }) {
    super();

    this.element = div;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.cnv = SurfaceUtil.createCanvas();
    this.ctx = this.cnv.getContext("2d");

    this.element.appendChild(this.cnv);
    $(this.element).css("position", "relative");
    $(this.element).css("display", "inline-block");
    $(this.cnv).css("position", "absolute");

    this.bindgroup = bindgroup;
    this.position = "fixed";
    this.surfaceTree = surfaceTree;
    this.surfaceNode = this.surfaceTree[surfaceId];
    this.bufferCanvas = SurfaceUtil.createCanvas();

    this.exclusive = -1;
    this.talkCount = 0;
    this.talkCounts = {};
    this.animationsQueue = {};
    this.backgrounds = []
    this.layers = [];
    this.stopFlags = {};

    this.destructed = false;
    this.destructors = [];

    // GCの発生を抑えるためレンダラはこれ１つを使いまわす
    this.bufferRender = new SurfaceRender();
    //this.bufferRender.debug = true;

    this.initMouseEvent();
    this.surfaceNode.animations.forEach((anim)=>{ this.initAnimation(anim); });
    this.render();
  }

  public destructor(): void {
    $(this.element).children().remove();
    this.destructors.forEach((fn)=> fn());
    this.element = null;
    this.surfaceNode = null;
    this.surfaceTree = null;
    this.bindgroup = null;
    this.element = null;
    this.layers = [];
    this.animationsQueue = {};
    this.talkCounts = {};
    this.destructors = [];
    this.removeAllListeners(null);
    this.destructed = true;
  }

  private initMouseEvent(): void {
    var $elm = $(this.element);
    var tid = 0;
    var touchCount = 0;
    var touchStartTime = 0;
    var tuples: [string, (ev: JQueryEventObject)=> void][] = [];
    var processMouseEvent = (ev: JQueryEventObject, type:string )=> {// マウスイベントの共通処理
      $(ev.target).css({"cursor": "default"});//これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
      var {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev);
      var {left, top} = $(ev.target).offset();
      // body直下 fixed だけにすべきかうーむ
      var [baseX, baseY] = this.position !== "fixed" ? [pageX, pageY]: [clientX, clientY];
      var [_left, _top]  = this.position !== "fixed" ? [left,  top]  : [left - window.scrollX, top - window.scrollY];
      var basePosY = parseInt($(this.cnv).css("top"), 10);  // overlayでのずれた分を
      var basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
      var offsetX = baseX - _left - basePosX;//canvas左上からのx座標
      var offsetY = baseY - _top  - basePosY;//canvas左上からのy座標
      var hit = SurfaceUtil.getRegion(this.cnv, this.surfaceNode, offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
      var custom: SurfaceMouseEvent = {
        "type": type,
        "offsetX": offsetX|0,//float->int
        "offsetY": offsetY|0,//float->int
        "wheel": 0,
        "scopeId": this.scopeId,
        "region": hit.name,
        "button": ev.button === 2 ? 1 : 0,
        "transparency": !hit.isHit,
        "event": ev}; // onした先でpriventDefaultとかstopPropagationとかしたいので
      if(hit.name !== ""){//もし当たり判定
        ev.preventDefault();
        if(/^touch/.test(ev.type)){
          ev.stopPropagation(); }
          // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
          // ために親要素にイベント伝えない
        $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
      }
      this.emit("mouse", custom);
    };// processMouseEventここまで
    tuples.push(["contextmenu",(ev)=> processMouseEvent(ev, "mouseclick")   ]);
    tuples.push(["click",      (ev)=> processMouseEvent(ev, "mouseclick")   ]);
    tuples.push(["dblclick",   (ev)=> processMouseEvent(ev, "mousedblclick")]);
    tuples.push(["mousedown",  (ev)=> processMouseEvent(ev, "mousedown")    ]);
    tuples.push(["mousemove",  (ev)=> processMouseEvent(ev, "mousemove")    ]);
    tuples.push(["mouseup",    (ev)=> processMouseEvent(ev, "mouseup")      ]);
    tuples.push(["touchmove",  (ev)=> processMouseEvent(ev, "mousemove")    ]);
    tuples.push(["touchend",   (ev)=> {
      processMouseEvent(ev, "mouseup");
      processMouseEvent(ev, "mouseclick");
      if (Date.now() - touchStartTime < 500 && touchCount%2 === 0){
        processMouseEvent(ev, "mousedblclick"); }// ダブルタップ->ダブルクリック変換
    }]);
    tuples.push(["touchstart",   (ev)=> {
      touchCount++;
      touchStartTime = Date.now();
      processMouseEvent(ev, "mousedown");
      clearTimeout(tid);
      tid = setTimeout(()=> touchCount = 0, 500)
    }]);
    tuples.forEach(([ev, handler])=> $elm.on(ev, handler));// イベント登録
    this.destructors.push(()=>{
      tuples.forEach(([ev, handler])=> $elm.off(ev, handler));// イベント解除
    });
  }

  private initAnimation(anim: SurfaceAnimation): void {
    var {is:animId, interval, patterns, option} = anim;//isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
    if (option != null && /^background$|^exclusive|/.test(option)){
      console.warn("Surfaces#initAnimation", "unsupportted option", option, animId, anim);
    }
    var __intervals = interval.split("+"); // sometimes+talk
    if(/^bind/.test(interval)){
      // bindから始まる場合は initBind にまるなげ
      this.initBind(anim);
      return;
    }
    if(__intervals.length > 1){
      // bind+でなければ分解して再実行
      __intervals.forEach((interval)=>{
        this.initAnimation({interval, is: animId, patterns, option});
      });
      return;
    }
    var [_interval, ...rest] = interval.split(",");
    if(rest.length > 0){
      var n = Number(rest[0]);
      if(!isFinite(n)){
        console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
        n = 4; } } // rarelyにfaileback
    // アニメーション描画タイミングの登録
    var fn = (nextTick: Function) => {
      if (this.destructed) return;
      if (this.stopFlags[animId]) return;
      this.play(animId, nextTick);
    }
    // アニメーションを止めるための準備
    this.stopFlags[animId] = false;
    switch (_interval) {
      // nextTickを呼ぶともう一回random
      case "sometimes": return SurfaceUtil.random(fn, 2);
      case "rarely":    return SurfaceUtil.random(fn, 4);
      case "random":    return SurfaceUtil.random(fn, n);
      case "periodic":  return SurfaceUtil.periodic(fn, n);
      case "always":    return SurfaceUtil.always(fn);
      case "runonce":   return this.play(animId);
      case "never":     return;
      case "yen-e":     return;
      case "talk": this.talkCounts[animId] = n; return;
    }
    console.warn("Surface#initAnimation > unkown interval:", interval, anim);
  }

  private initBind(anim: SurfaceAnimation): void {
    var {is:animId, interval, patterns, option} = anim;
    if (this.bindgroup[this.scopeId] == null) return;
    if (this.bindgroup[this.scopeId][animId] == null) return;
    if (this.bindgroup[this.scopeId][animId] === true){
      // 現在有効な bind
      var [_, ...intervals] = interval.split("+"); // bind+sometimes
      if(intervals.length > 0){
        // bind+hogeは着せ替え付随アニメーション。
        // bind+sometimesを分解して実行
        intervals.forEach((interval)=>{
          this.initAnimation({interval, is: animId, patterns, option});
        });
        return;
      }
      // bind単体はレイヤーを重ねる着せ替え。
      if(option === "background"){
        this.backgrounds[animId] = patterns[patterns.length-1];
      }else{
        this.layers[animId] = patterns[patterns.length-1];
      }
      return;
    }else{
      //現在の合成レイヤから着せ替えレイヤを削除
      if(option === "background"){
        delete this.backgrounds[animId];
      }else{
        delete this.layers[animId];
      }
      // bind+sometimsなどを殺す
      this.end(animId);
      return;
    }
  }

  public updateBind(): void {
    // Shell.tsから呼ばれるためpublic
    // Shell#bind,Shell#unbindで発動
    this.surfaceNode.animations.forEach((anim)=>{ this.initBind(anim); });
    // 即時に反映
    this.render();
  }

  // アニメーションタイミングループの開始要請
  public begin(animationId: number): void {
    this.stopFlags[animationId] = false;
    var anim = this.surfaceNode.animations[animationId];
    this.initAnimation(anim);
    this.render();
  }

  // アニメーションタイミングループの開始
  public end(animationId: number): void {
    this.stopFlags[animationId] = true;
  }

  public endAll(): void {
    Object.keys(this.stopFlags).forEach((animationId)=>{
      this.end(<number><any>animationId);
    })
  }

  // アニメーション再生
  public play(animationId: number, callback?: Function): void {
    if(this.destructed) return;
    var anims = this.surfaceNode.animations;
    var anim = this.surfaceNode.animations[animationId];
    if(anim == null) return void setTimeout(callback); // そんなアニメーションはない
    var {is:animId, interval, patterns, option} = anim;
    if (option != null && /^background$|^exclusive|/.test(option)){
      console.warn("Surface#play", "unsupportted option", option, animationId, anim);
    }
    this.animationsQueue[animationId] = patterns.map((pattern, i)=> ()=>{
      var {surface, wait, type, x, y, animation_ids} = pattern;
      switch(type){
        case "start":            this.play(animation_ids[0], nextTick); return;
        case "stop":             this.stop(animation_ids[0]); setTimeout(nextTick); return;
        case "alternativestart": this.play(SurfaceUtil.choice<number>(animation_ids), nextTick); return;
        case "alternativestop":  this.stop(SurfaceUtil.choice<number>(animation_ids)); setTimeout(nextTick); return;
      }
      var [__, a, b] = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]);
      var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
      setTimeout(()=>{
        // 現在のコマをレイヤーに追加
        if(option === "background"){
          this.backgrounds[animationId] = pattern;
        }else{
          this.layers[animationId] = pattern;
        }
        if(this.exclusive >= 0){
          // -1 以上なら排他再生中
          if(this.exclusive === animationId){
            // 自分が排他実行中
            this.render();
          }
        }else{
          // 通常
          this.render();
        }

        nextTick();
      }, _wait);
    });
    if(option === "exclusive"){
      this.animationsQueue[animationId].unshift(()=>{
        this.exclusive = animationId;
      });
      this.animationsQueue[animationId].push(()=>{
        this.exclusive = -1;
      });
    }
    var nextTick = ()=>{
      if(this.destructed) return;
      var next = this.animationsQueue[animationId].shift();
      if(!(next instanceof Function) ){  // アニメーションキューを破棄されてるor これで終わり
        // stop pattern animation.
        this.animationsQueue[animationId] = [];
        this.exclusive = -1;
        setTimeout(callback);
      }else{
        next();
      }
    };
    if(this.animationsQueue[animationId][0] instanceof Function) {
      nextTick();
    }
  }

  public stop(animationId: number): void {
    this.animationsQueue[animationId] = []; // アニメーションキューを破棄
  }

  public talk(): void {
    var animations = this.surfaceNode.animations;
    this.talkCount++;
    var hits = animations.filter((anim)=>
        /talk/.test(anim.interval) && this.talkCount % this.talkCounts[anim.is] === 0);
    hits.forEach((anim)=>{
      this.play(anim.is);
    });
  }

  public yenE(): void {
    var anims = this.surfaceNode.animations;
    anims.forEach((anim)=>{
      if (anim.interval === "yen-e") {
        this.play(anim.is);
      }
    });
  }

  private composeAnimationPatterns(layers: SurfaceAnimationPattern[]): SurfaceLayerObject[] {
    var renderLayers: SurfaceLayerObject[] = [];
    var keys = Object.keys(layers);
    // forEachからfor文へ
    for(let j=0; j<keys.length; j++){
      var pattern: SurfaceAnimationPattern = layers[keys[j]];
      var {surface, type, x, y} = pattern;
      if(surface < 0) continue; // idが-1つまり非表示指定
      var srf = this.surfaceTree[surface]; // 該当のサーフェス
      if(srf == null){
        console.warn("Surface#composeAnimationPatterns: surface id "+surface + " is not defined.", pattern);
        console.warn(surface, Object.keys(this.surfaceTree));
        continue; // 対象サーフェスがないのでスキップ
      }
      // 対象サーフェスを構築描画する
      var {base, elements, collisions, animations} = srf;
      this.bufferRender.reset();// 対象サーフェスのbaseサーフェス(surface*.png)の上に
      this.bufferRender.composeElements([{type: "overlay", canvas: base, x: 0, y: 0}].concat(elements)); // elementを合成する
      renderLayers.push({type, x, y, canvas: this.bufferRender.getSurfaceCanvas()});
    }
    return renderLayers;
  }

  public render(): void {
    if(this.destructed) return;
    var backgrounds = this.composeAnimationPatterns(this.backgrounds);
    var base = this.surfaceNode.base;
    var elements = this.surfaceNode.elements;
    var fronts = this.composeAnimationPatterns(this.layers);

    var renderLayers: SurfaceLayerObject[] = [].concat(
      backgrounds,
      elements.length > 0 ? elements : [{type: "overlay", canvas: base, x: 0, y: 0}]
    );
    this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
    this.bufferRender.composeElements(renderLayers); // 現在有効なアニメーションのレイヤを合成
    // elementまでがベースサーフェス扱い
    var baseWidth = this.bufferRender.cnv.width;
    var baseHeight = this.bufferRender.cnv.height;
    // アニメーションレイヤーは別腹
    this.bufferRender.composeElements(fronts);
    if (this.enableRegionDraw) { // 当たり判定を描画
      this.bufferRender.drawRegions(this.surfaceNode.collisions, ""+this.surfaceId);
    }

    //console.log(this.bufferRender.log);
    //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
    //document.body.scrollTop += 100 + document.body.scrollTop;
    //this.endAll();
    //debugger;



    SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv); // バッファから実DOMTree上のcanvasへ描画
    // SSPでのjuda.narを見る限り合成後のサーフェスはベースサーフェスの大きさではなく合成されたサーフェスの大きさになるようだ
    // juda-systemの\s[1050]のアニメーションはrunonceを同時実行しており、この場合の座標の原点の計算方法が不明。
    // これは未定義動作の可能性が高い。
    $(this.element).width(baseWidth);//this.cnv.width - bufRender.basePosX);
    $(this.element).height(baseHeight);//this.cnv.height - bufRender.basePosY);
    $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
    $(this.cnv).css("left", -this.bufferRender.basePosX);
  }
}
