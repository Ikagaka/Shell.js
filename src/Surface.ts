/// <reference path="../typings/index.d.ts"/>

import * as SR from "./SurfaceRender";
import * as CC from "./CanvasCache";
import * as SU from "./SurfaceUtil";
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import {EventEmitter} from "events";
import $ = require("jquery");

export class Layer{
  background: boolean;
}
export class SerikoLayer extends Layer{
  patternID: number;
  timerID: any;
  paused: boolean;
  stop: boolean; // 現在排他されているアニメションID
  exclusive: boolean; //keyがfalseのアニメーションの"自発的"再生を停止する、sometimesみたいのを止める。bindには関係ない
  canceled: boolean; // 何らかの理由で強制停止された
  constructor(patternID:number, background=false){
    super();
    this.patternID = patternID;
    this.timerID = null;
    this.paused = false;
    this.stop = true;
    this.exclusive = false;
    this.canceled = false;
    this.background = background;
  }
}

export class MayunaLayer extends Layer{
  visible: boolean;
  constructor(visible:boolean, background=false){
    super();
    this.visible = visible;
    this.background = background;
  }
}



export class Surface extends EventEmitter {

  public element: HTMLDivElement;
  private ctx: CanvasRenderingContext2D;
  private bufferRender: SR.SurfaceRender;

  public scopeId: number;
  public surfaceId: number;

  private surfaceDefTree:  ST.SurfaceDefinitionTree;
  private surfaceTree:     { [surfaceID: number]: ST.SurfaceDefinition };
  private surfaceNode: ST.SurfaceDefinition;

  private config:          SC.ShellConfig;
  private cache:           CC.CanvasCache;

  private layers:          Layer[];//アニメーションIDの現在のレイヤ状態
  private talkCount:   number;
  public  moveX:       number;
  public  moveY:       number;
  
  private destructed: boolean;
  private destructors: Function[]; // destructor実行時に実行される関数のリスト

  constructor(div: HTMLDivElement, scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, config: SC.ShellConfig, cache: CC.CanvasCache) {
    super();

    this.element = div;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    const cnv = SU.createCanvas();
    const ctx = cnv.getContext("2d");
    if(ctx == null) throw new Error("Surface#constructor: ctx is null");
    this.ctx = ctx;
    this.config = config;
    this.cache  = cache;
    this.surfaceDefTree = surfaceDefTree;
    this.surfaceTree = surfaceDefTree.surfaces;
    this.surfaceNode = surfaceDefTree.surfaces[surfaceId];

    this.talkCount = 0;

    this.destructed = false;
    this.destructors = [];

    // DOM GCの発生を抑えるためレンダラはこれ１つを使いまわす
    this.bufferRender = new SR.SurfaceRender();//{use_self_alpha: this.config.seriko.use_self_alpha });

    this.initDOMStructure();
    this.initMouseEvent();
    this.surfaceNode.animations.forEach((anim, id)=>{ this.initAnimation(id); });
    this.render();
  }

  public destructor(): void {
    $(this.element).children().remove();
    this.destructors.forEach((fn)=> fn());
    this.element = document.createElement("div");
    this.surfaceNode = new ST.SurfaceDefinition();
    this.surfaceTree = [];
    this.config = new SC.ShellConfig();
    this.layers = [];
    this.talkCount = 0;
    this.destructors = [];
    this.removeAllListeners();
    this.destructed = true;
  }

  private initDOMStructure(): void {
    this.element.appendChild(this.ctx.canvas);
    $(this.element).css("position", "relative");
    $(this.element).css("display", "inline-block");
    $(this.ctx.canvas).css("position", "absolute");
  }

  private initAnimation(animId: number): void {
    if (this.surfaceNode.animations[animId] == null){
      console.warn("Surface#initAnimation: animationID", animId, "is not defined in ", this.surfaceId, this.surfaceNode);
      return;
    }
    const {intervals, patterns, options, collisions} = this.surfaceNode.animations[animId];
    const isBack = options.some(([opt, args])=> opt === "background");
    if(intervals.some(([interval, args])=> "bind" === interval)){
      // このanimIDは着せ替え機能付きレイヤ
      if (this.isBind(animId)) {
        // 現在有効な bind なら
        if(intervals.length > 1){
          // [[bind, []]].length === 1
          // bind+hogeは着せ替え付随アニメーション。
          // 現在のレイヤにSERIKOレイヤを追加
          this.layers[animId] = new SerikoLayer(-1);
          intervals.filter(([interval])=> interval !== "bind")
          .forEach(([interval, args])=>{
            // インターバルタイマの登録
            this.setTimer(animId, interval, args);
          });
          return;
        } 
        // interval,bind
        // 現在のレイヤにMAYUNAレイヤを追加
        this.layers[animId] = new MayunaLayer(true, isBack);
        return;
      }
      // 現在有効な bind でないなら
      // 現在の合成レイヤの着せ替えレイヤを非表示設定
      this.layers[animId] = new MayunaLayer(false, isBack);
      // ついでにbind+sometimsなどを殺す
      this.end(animId);
      return;
    }
    // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
    // 現在のレイヤにSERIKOレイヤを追加
      this.layers[animId] = new SerikoLayer(-1, isBack);
    intervals.forEach(([interval, args])=>{
      // インターバルタイマの登録
      this.setTimer(animId, interval, args);
    });
  }
  
  private setTimer(animId:number, interval:string, args:number[]): void{
    const layer = this.layers[animId];
    if (layer instanceof SerikoLayer){
      const n = isFinite(args[0]) ? args[0]
                                  : (console.warn("Surface#setTimer: failback to", 4, interval, animId)
                                  , 4);
      // アニメーションを止めるための準備
      layer.stop = false;
      // アニメーション描画タイミングの登録
      const fn = (nextTick: Function) => {
        if (this.destructed) return;
        if (layer.stop) return;
        this.play(animId)
        .catch((err)=> console.info("animation canceled", err))
        .then(()=> nextTick());
      };
      switch (interval) {
        // nextTickを呼ぶともう一回random
        case "sometimes": layer.timerID = SU.random(fn, 2); return;
        case "rarely":    layer.timerID = SU.random(fn, 4); return;
        case "random":    layer.timerID = SU.random(fn, n); return;
        case "periodic":  layer.timerID = SU.periodic(fn, n); return;
        case "always":    layer.timerID = SU.always(fn);    return;
        case "runonce":   this.play(animId); return;
        case "never":     return;
        case "yen-e":     return;
        case "talk":      return;
        default:
          console.warn("Surface#setTimer > unkown interval:", interval, animId);
          return; 
      }
    }else{
      console.warn("Surface#setTimer: animId", animId,"is not SerikoLayer");
    }
  }

  public update(): void {
    // レイヤ状態の更新
    this.surfaceNode.animations.forEach((anim, id)=>{ this.initAnimation(id); });
    // 即時に反映
    this.render();
  }

  // アニメーションタイミングループの開始要請
  public begin(animationId: number): void {
    const layer = this.layers[animationId];
    if(layer instanceof SerikoLayer){
      layer.stop = false;
      this.initAnimation(animationId);
      this.render();
    }
  }

  // アニメーションタイミングループの開始
  public end(animationId: number): void {
    const layer = this.layers[animationId];
    if(layer instanceof SerikoLayer){
      layer.stop = true;
    }
  }

  // すべての自発的アニメーション再生の停止
  public endAll(): void {
    this.layers.forEach((layer, id)=>{
      this.end(id);
    });
  }

  // アニメーション再生
  public play(animationId: number): Promise<void> {
    if(this.destructed){ return Promise.reject("destructed"); }
     if(!(this.layers[animationId] instanceof SerikoLayer)){
      console.warn("Surface#play", "animation", animationId, "is not defined");
      return Promise.reject("no such animation"); // そんなアニメーションはない
    }else{
      let layer = <SerikoLayer>this.layers[animationId];
      const anim = this.surfaceNode.animations[animationId];
      if(layer.patternID >= 0){
        // 既に再生中
        // とりま殺す
        layer.canceled = true;
        clearTimeout(layer.timerID);
        layer.timerID = null;
        // とりま非表示に
        layer = this.layers[animationId] = new SerikoLayer(-2);
      }
      if(layer.paused){
        // ポーズは解けた
        layer.paused = false;
      }
      // これから再生開始するレイヤ
      anim.options.forEach(([option, args])=>{
        if(option === "exclusive"){
          args.forEach((id)=>{
            const layer = this.layers[id];
            if(layer instanceof SerikoLayer){
              // exclusive指定を反映
              layer.exclusive = true;
            }
          });
        }
      });
      return new Promise<void>((resolve, reject)=>{
        let nextTick = ()=>{
          // exclusive中のやつら探す
          const existExclusiveLayers = this.layers.some((layer, id)=> {
            return !(layer instanceof SerikoLayer) ? false // layer が mayuna なら 論外
                  :                                  layer.exclusive // exclusive が存在
          });
          if(existExclusiveLayers){
            // 自分はexclusiveか？
            const amIexclusive = this.layers.some((layer, id)=> {
              return !(layer instanceof SerikoLayer) ? false // layer が mayuna なら 論外
                     : !layer.exclusive              ? false // exclusive が存在しない
                     :                                 id === animationId // exclusiveが存在しなおかつ自分は含まれる
            });
            if(!amIexclusive){
              // exclusiveが存在しなおかつ自分はそうではないなら
              layer.canceled = true;
            }
          }
          if(layer.canceled || this.destructed){
            // おわりですおわり
            return reject("canceled");
          }
          if(layer.paused){
            // 次にplayが呼び出されるまで何もしない 
            return;
          }
          // 現在のレイヤを次のレイヤに
          layer.patternID++;
          const pattern = anim.patterns[layer.patternID];
          // 正のレイヤIDなのに次のレイヤがない＝このアニメは終了
          if(layer.patternID >= 0 && pattern == null){
            // とりま非表示に
            layer.patternID = -1;
            layer.exclusive = false;
            layer.timerID = null;
            // nextTickがクロージャとしてもってるlayerを書き換えてしまわないように
            const _layer = this.layers[animationId] = new SerikoLayer(-1);
            return resolve();
          }
          const {surface, wait, type, x, y, animation_ids} = pattern;
          switch(type){
            // 付随再生であってこのアニメの再生終了は待たない・・・はず？
            case "start":            this.play(animation_ids[0]); return;
            case "stop":             this.stop(animation_ids[0]); return;
            case "alternativestart": this.play(SU.choice<number>(animation_ids)); return;
            case "alternativestop":  this.stop(SU.choice<number>(animation_ids)); return;
            case "move":             this.moveX = x; this.moveY = y; return;
          }
          this.render();
          const _wait = SU.randomRange(wait[0], wait[1]);
          // waitだけ待つ
          layer.timerID = setTimeout(nextTick, _wait);
        };/* nextTick ここまで */
        nextTick();
      });
    }
  }

  public stop(animationId: number): void {
    const layer = this.layers[animationId];
    if(layer instanceof SerikoLayer){
      layer.canceled = true;
      layer.patternID = -1;
    }
  }

  public talk(): void {
    const animations = this.surfaceNode.animations;
    this.talkCount++;
    // talkなものでかつtalkCountとtalk,nのmodが0なもの
    const hits = animations.filter((anim, animId)=>
        anim.intervals.some(([interval, args])=> "talk" === interval && this.talkCount % args[0] === 0));
    hits.forEach((anim, animId)=>{
      // そのtalkアニメーションは再生が終了しているか？
      if(this.layers[animId] instanceof SerikoLayer){
        const layer = <SerikoLayer>this.layers[animId];
        if(layer.patternID < 0){
          this.play(animId);
        }
      }
    });
  }

  public yenE(): void {
    const anims = this.surfaceNode.animations;
    anims.forEach((anim, animId)=>{
      if (anim.intervals.some(([interval, args])=> interval === "yen-e") ) {
        this.play(animId);
      }
    });
  }

  private isBind(animId: number): boolean {
    if (this.config.bindgroup[this.scopeId] == null) return false;
    if (this.config.bindgroup[this.scopeId][animId] === false) return false;
    return true;
  }

  private composeBaseSurface(n: number): Promise<SR.SurfaceCanvas> {
    // elements を合成するだけ
    const srf = this.surfaceTree[n];
    if(!(srf instanceof ST.SurfaceDefinition) || srf.elements.length === 0){
      // そんな定義なかった || element0も何もなかった
      console.warn("Surface#composeBaseSurface: no such a surface", n, srf);
      return Promise.reject("no such a surface");
    }
    const elms = srf.elements;
    return Promise.all(elms.map(({file, type, x, y})=>{
      // asisはここで処理しちゃう
      let asis = false;
      if(type === "asis"){
        type = "overlay"; // overlayにしとく
        asis = true;
      }
      if(type === "bind" || type === "add"){
        type = "overlay"; // overlayにしとく
      }
      // ファイルとりにいく
      return this.cache.getCanvas(file, asis)
      .then((cnv)=>{ return {file, type, x, y, canvas: new SR.SurfaceCanvas(cnv) }; })
      .catch((err)=>{
        console.warn("Surface#composeBaseSurface: no such a file", file, n, srf);
      });
    })).then((elms)=>{
      return this.bufferRender.composeElements(elms);
    }).then((srfCnv)=>{
      // basesurfaceの大きさはbasesurfaceそのもの
      srfCnv.basePosX = 0;
      srfCnv.basePosY = 0;
      srfCnv.baseWidth = srfCnv.cnv.width;
      srfCnv.baseHeight = srfCnv.cnv.height;
      return srfCnv;
    });
  }
  private solveAnimationPattern(n:number): ST.SurfaceAnimationPattern[][]{
    const patses: ST.SurfaceAnimationPattern[][] = [];
    const srf = this.surfaceTree[n];
    if(!(srf instanceof ST.SurfaceDefinition)){
      // そんな定義なかった || element0も何もなかった
      console.warn("Surface#solveAnimationPattern: no such a surface", n, srf);
      return patses;
    }
    srf.animations.forEach(({intervals, options, patterns}, animId)=>{
      if(intervals.length === 1 && intervals[0][0] === "bind" && this.isBind(animId)){
        // 対象のサーフェスのパターンで bind で有効な着せ替えな animId
        patses[animId] = [];
        patterns.forEach(({type, animation_ids}, patId)=>{
          if(type === "insert"){
            // insertの場合は対象のIDをとってくる
            const insertId = animation_ids[0];
            const anim = this.surfaceNode.animations[insertId];
            if(!(anim instanceof ST.SurfaceAnimation)){
              console.warn("Surface#solveAnimationPattern", "insert id", animation_ids, "is wrong target.", n, patId);
              return;
            }
            // insertをねじ込む
            patses[animId] = patses[animId].concat(anim.patterns);
            return;
          }
          // insertでない処理
          patses[animId].push(patterns[patId]);
        });
      }
    });
    return patses;
  }

  private composeAnimationPart(n: number, log: number[]=[]): Promise<SR.SurfaceCanvas> {
    if(log.indexOf(n) != -1){
      // 循環参照
      console.warn("Surface#composeAnimationPart: recursive definition detected", n, log);
      return Promise.reject("recursive definition detected");
    }
    const srf = this.surfaceTree[n];
    if(!(srf instanceof ST.SurfaceDefinition)){
      // そんな定義なかった || element0も何もなかった
      console.warn("Surface#composeAnimationPart: no such a surface", n, srf);
      return Promise.reject("no such a surface");
    }
    // サーフェス n で表示すべきpatternをもらってくる
    const patses = this.solveAnimationPattern(n);
    const layers = patses.map((patterns, animId)=>{
      // n の animId な MAYUNA レイヤセットのレイヤが pats
      const layerset = Promise.all(patterns.map(({type, surface, wait, x, y}, patId)=>{
        // 再帰的に画像読むよ
        return this.composeAnimationPart(n, log.concat(n)).then((canvas)=>{
          return {type, x, y, canvas};
        }); 
      }));
      return layerset;
    });
    return Promise.all(layers).then((layers)=>{
      // パターン全部読めたっぽいので分ける
      const backgrounds = layers.filter((_, animId)=>{
        const options = srf.animations[animId].options
        return options.some(([opt, args])=> opt === "background")
      })
      const foregrounds = layers.filter((_, animId)=>{
        const options = srf.animations[animId].options
        return options.every(([opt, args])=> opt !== "background")
      });
      // パターン全部読めたっぽいのでベースを読む
      return this.composeBaseSurface(n).then((base)=>{
        this.bufferRender.composePatterns({base, foregrounds, backgrounds});
        return this.bufferRender;
      });
    });
  }
  
  public render(): void {
    /*
    if(this.destructed) return;
    this.layers.filter((anim_id)=>{})
    const backgrounds = this.composeAnimationPatterns(this.backgrounds);//再生途中のアニメーション含むレイヤ
    const elements = (this.surfaceNode.elements);
    const base = this.surfaceNode.base;
    const fronts = this.composeAnimationPatterns(this.layers);//再生途中のアニメーション含むレイヤ
    let baseWidth = 0;
    let baseHeight = 0;
    this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
    // ベースサーフェス作る
    if(this.dynamicBase != null){
      // pattern base があればそちらを使用
      this.bufferRender.composeElements([this.dynamicBase]);
      baseWidth = this.bufferRender.cnv.width;
      baseHeight = this.bufferRender.cnv.height;
    } else {
      // base+elementでベースサーフェス作る
      this.bufferRender.composeElements(
        elements[0] != null ?
          // element0, element1...
          elements :
            base !=null ?
              // base, element1, element2...
              [{type: "overlay", canvas: base, x: 0, y: 0}].concat(elements)
              : []);
      // elementまでがベースサーフェス扱い
      baseWidth = this.bufferRender.cnv.width;
      baseHeight = this.bufferRender.cnv.height;
    }
    const composedBase = this.bufferRender.getSurfaceCanvas();
    // アニメーションレイヤー
    this.bufferRender.composeElements(backgrounds);
    this.bufferRender.composeElements([{type: "overlay", canvas: composedBase, x: 0, y: 0}]); // 現在有効な ベースサーフェスのレイヤを合成
    this.bufferRender.composeElements(fronts);
    // 当たり判定を描画
    if (this.config.enableRegion) {
      this.bufferRender.drawRegions((this.surfaceNode.collisions), ""+this.surfaceId);
      this.backgrounds.forEach((_, animId)=>{
        this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
      });
      this.layers.forEach((_, animId)=>{
        this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
      });
    }
    // debug用
    //console.log(this.bufferRender.log);
    //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
    //document.body.scrollTop = 99999;
    //this.endAll();

    // バッファから実DOMTree上のcanvasへ描画
    SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv);
    // 位置合わせとか
    $(this.element).width(baseWidth);//this.cnv.width - bufRender.basePosX);
    $(this.element).height(baseHeight);//this.cnv.height - bufRender.basePosY);
    $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
    $(this.cnv).css("left", -this.bufferRender.basePosX);
    */
  }

  public getSurfaceSize(): {width: number, height: number} {
    return {
      width: $(this.element).width(), // base surfaceのおおきさ
      height: $(this.element).height()
    };
  }

  private initMouseEvent(): void {
    /*
    const $elm = $(this.element);
    let tid:any = null;
    let touchCount = 0;
    let touchStartTime = 0;
    const tuples: [string, (ev: JQueryEventObject)=> void][] = [];
    tuples.push(["contextmenu",(ev)=> this.processMouseEvent(ev, "mouseclick")   ]);
    tuples.push(["click",      (ev)=> this.processMouseEvent(ev, "mouseclick")   ]);
    tuples.push(["dblclick",   (ev)=> this.processMouseEvent(ev, "mousedblclick")]);
    tuples.push(["mousedown",  (ev)=> this.processMouseEvent(ev, "mousedown")    ]);
    tuples.push(["mousemove",  (ev)=> this.processMouseEvent(ev, "mousemove")    ]);
    tuples.push(["mouseup",    (ev)=> this.processMouseEvent(ev, "mouseup")      ]);
    tuples.push(["touchmove",  (ev)=> this.processMouseEvent(ev, "mousemove")    ]);
    tuples.push(["touchend",   (ev)=> {
      this.processMouseEvent(ev, "mouseup");
      this.processMouseEvent(ev, "mouseclick");
      if (Date.now() - touchStartTime < 500 && touchCount%2 === 0){
        this.processMouseEvent(ev, "mousedblclick"); }// ダブルタップ->ダブルクリック変換
    }]);
    tuples.push(["touchstart",   (ev)=> {
      touchCount++;
      touchStartTime = Date.now();
      this.processMouseEvent(ev, "mousedown");
      clearTimeout(tid);
      tid = setTimeout(()=> touchCount = 0, 500)
    }]);
    tuples.forEach(([ev, handler])=> $elm.on(ev, handler));// イベント登録
    this.destructors.push(()=>{
      tuples.forEach(([ev, handler])=> $elm.off(ev, handler));// イベント解除
    });
    */
  }

  private processMouseEvent(ev: JQueryEventObject, type:string ): void {// マウスイベントの共通処理
    /*
    $(ev.target).css({"cursor": "default"});//これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
    const {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev);
    const {left, top} = $(ev.target).offset();
    // body直下 fixed だけにすべきかうーむ
    const {scrollX, scrollY} = SurfaceUtil.getScrollXY();
    if(this.position !== "fixed"){
      var baseX = pageX;
      var baseY = pageY;
      var _left = left;
      var _top = top;
    }else{
      var baseX = clientX;
      var baseY = clientY;
      var _left = left - scrollX;
      var _top = top - scrollY;
    }
    const basePosY = parseInt($(this.cnv).css("top"), 10);  // overlayでのずれた分を
    const basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
    const offsetX = baseX - _left - basePosX;//canvas左上からのx座標
    const offsetY = baseY - _top  - basePosY;//canvas左上からのy座標
    const hit1 = SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.collisions), offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
    const hits0 = this.backgrounds.map((_, animId)=>{
      return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
    });
    const hits2 = this.layers.map((_, animId)=>{
      return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
    });
    const hits = hits0.concat([hit1], hits2).filter((hit)=> hit !== "");
    const hit = hits[hits.length-1] || hit1;
    const custom: SurfaceMouseEvent = {
      "type": type,
      "offsetX": offsetX|0,//float->int
      "offsetY": offsetY|0,//float->int
      "wheel": 0,
      "scopeId": this.scopeId,
      "region": hit,
      "button": ev.button === 2 ? 1 : 0,
      "transparency": !SurfaceUtil.isHit(this.cnv, offsetX, offsetY),
      "event": ev}; // onした先でpriventDefaultとかstopPropagationとかしたいので
    if(hit !== ""){//もし当たり判定
      ev.preventDefault();
      if(/^touch/.test(ev.type)){
        ev.stopPropagation(); }
        // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
        // ために親要素にイベント伝えない
      $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
    }
    this.emit("mouse", custom);
    */
  }
  

}



export interface SurfaceMouseEvent {
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "Bust"
  transparency: boolean; // 透明領域ならtrue,
  event: JQueryEventObject;
}

