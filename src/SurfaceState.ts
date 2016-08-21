/*
 * Surface 状態モデルを更新する副作用関数群
 */
import * as CC from "./CanvasCache";
import * as SU from "./SurfaceUtil";
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SM from "./SurfaceModel";

import {EventEmitter} from "events";

export class SurfaceState extends EventEmitter {
  surface: SM.Surface;
  section: {resolve:Function, reject:Function}[];



  // on("move", callback: Function)
  //   move メソッドが発生したことを伝えており暗にウィンドウマネージャへウインドウ位置を変更するよう恫喝している
  // on("render", callback: Function)
  //   描画すべきタイミングなので canvas に描画してくれ 

  constructor(surface: SM.Surface){
    super();

    this.surface = surface;
    this.section = [];
    
    this.surface.surfaceNode.animations.forEach((_, animId)=>{
      this.initLayer(animId);
    });
    this.emit("render");
  }

  private initLayer(animId: number): void {
    // レイヤの初期化、コンストラクタからのみ呼ばれるべき
    const {surfaceId, surfaceNode, config, layers} = this.surface;
    if (surfaceNode.animations[animId] == null){
      console.warn("Surface#initAnimation: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
      return;
    }
    const anim = surfaceNode.animations[animId];
    const {intervals, patterns, options, collisions} = anim;
    if(intervals.some(([interval, args])=> "bind" === interval)){
      // このanimIDは着せ替え機能付きレイヤ
      if (SC.isBind(config, animId)) {
        // 現在有効な bind なら
        if(intervals.length > 1){
          // [[bind, []]].length === 1
          // bind+hogeは着せ替え付随アニメーション。
          // 現在のレイヤにSERIKOレイヤを追加
          layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
          // インターバルタイマの登録
          this.begin(animId);
          return;
        } 
        // interval,bind
        // 現在のレイヤにMAYUNAレイヤを追加
        layers[animId] = new SM.MayunaLayer(true, ST.isBack(anim));
        return;
      }
      // 現在有効な bind でないなら
      // 現在の合成レイヤの着せ替えレイヤを非表示設定
      layers[animId] = new SM.MayunaLayer(false, ST.isBack(anim));
      // ついでにbind+sometimsなどを殺す
      this.end(animId);
      return;
    }
    // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
    // 現在のレイヤにSERIKOレイヤを追加
    layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
    this.begin(animId);
  }

  // アニメーションタイミングループの開始要請
  begin(animId: number): void {
    const {surfaceNode, config} = this.surface;
    const {intervals, patterns, options, collisions} = surfaceNode.animations[animId];
    if(SC.isBind(config, animId)){
      intervals.filter(([interval])=> interval !== "bind")
      .forEach(([interval, args])=>{
        // インターバルタイマの登録
        this.setIntervalTimer(animId, interval, args);
      });
    }
  }

  // アニメーションタイミングループのintervalタイマの停止
  end(animId: number): void {
    const {seriko} = this.surface;
    // SERIKO Layer の状態を変更
    seriko[animId] = false;
  }

  // すべての自発的アニメーション再生の停止
  endAll(): void {
    const {layers} = this.surface;
    layers.forEach((layer, animId)=>{
      this.end(animId);
    });
  }

  private setIntervalTimer(animId:number, interval:string, args:number[]): void{
    // setTimeoutする、beginからのみ呼ばれてほしい
    const {layers, seriko} = this.surface;
    const layer = layers[animId];
    if (layer instanceof SM.SerikoLayer){
      const n = isFinite(args[0]) ? args[0]
                                  : (console.warn("Surface#setTimer: failback to", 4, interval, animId)
                                  , 4);
      seriko[animId] = true;
      const fn = (nextTick: Function)=>{
        // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
        if (!seriko[animId]) return; // nextTick 呼ばないのでintervalを終了する
        this.play(animId)
        .catch((err)=> console.info("animation canceled", err))
        .then(()=> nextTick());
      };
      // アニメーション描画タイミングの登録
      switch (interval) {
        // nextTickを呼ぶともう一回random
        case "sometimes": SU.random(fn, 2);   return;
        case "rarely":    SU.random(fn, 4);   return;
        case "random":    SU.random(fn, n);   return;
        case "periodic":  SU.periodic(fn, n); return;
        case "always":    SU.always(fn);      return;
        case "runonce":   this.play(animId);  return;
        case "never":     return;
        case "yen-e":     return;
        case "talk":      return;
        default:
          console.warn("Surface#setTimer > unkown interval:", interval, animId);
          return; 
      }
    }
    console.warn("Surface#setTimer: animId", animId,"is not SerikoLayer");
    return;
  }

  // アニメーション再生
  play(animId: number): Promise<void> {
    const srf = this.surface;
    const {surfaceNode, layers, destructed} = this.surface;
    if(destructed){
      // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
      return Promise.reject("destructed");
    }
    if(!(layers[animId] instanceof SM.SerikoLayer)){
      // そんなアニメーションはない
      console.warn("Surface#play", "animation", animId, "is not defined");
      return Promise.reject("no such animation");
    }
    let layer = <SM.SerikoLayer>layers[animId];
    const anim = surfaceNode.animations[animId];
    if(layer.patternID >= 0 || layer.paused){
      // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
      layer.canceled = true; // キャンセル
      layer = layers[animId] = new SM.SerikoLayer(ST.isBack(anim)); // 値の初期化
    }
    ST.getExclusives(anim).map((exAnimId)=>{
      // exclusive指定を反映
      const layer = layers[exAnimId];
      if(layer instanceof SM.SerikoLayer){
        layer.exclusive = true;
      }
    });
    return new Promise<void>((resolve, reject)=>{
      this.section[animId] = {resolve, reject};
      this.step(animId, layer);
    });
  }


  private step(animId: number, layer: SM.SerikoLayer): void {
    const srf = this.surface;
    const {surfaceNode, layers, destructed} = this.surface;
    const {resolve, reject} = this.section[animId];
    const anim = surfaceNode.animations[animId];
    // patternをすすめる
    // exclusive中のやつら探す
    if(!layers.some((layer, id)=>
      !(layer instanceof SM.SerikoLayer) ? false // layer が mayuna なら 論外
                      : !layer.exclusive ? false // exclusive が存在しない
                                          : id === animId // exclusiveが存在しなおかつ自分は含まれる
    )){ // ... のでない限り
      // exclusiveが存在しなおかつ自分は含まれないので
      layer.canceled = true;
    }
    if(layer.canceled){
      // キャンセルされたので reject
      return reject("canceled");
    }
    if(layer.paused){
      // 次にplayが呼び出されるまで何もしない 
      return;
    }
    if(layer.patternID !== -1 && anim.patterns[layer.patternID+1] == null){
      // -1 は一番初めでなくて、 +1 は次のレイヤがない
      // 正のレイヤIDなのに次のレイヤがない＝このアニメは終了
      layer.finished   = true;
    }
    if(layer.finished){
      layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
      delete this.section[animId];
      return resolve();
    }
    // 再生中っぽい
    layer.patternID++; 
    const {surface, wait, type, x, y, animation_ids} = anim.patterns[layer.patternID];
    switch(type){
      // 付随再生であってこのアニメの再生終了は待たない・・・はず？
      case "start":            this.play(animation_ids[0]); return;
      case "stop":             this.stop(animation_ids[0]); return;
      case "alternativestart": this.play(SU.choice<number>(animation_ids)); return;
      case "alternativestop":  this.stop(SU.choice<number>(animation_ids)); return;
      case "move":             srf.moveX = x; srf.moveY = y; this.emit("move"); return;
    }
    // waitだけ待つ
    setTimeout(()=>{
      this.step(animId, layer);
    }, SU.randomRange(wait[0], wait[1]));
    this.emit("render");
  }

  // 再生中のアニメーションを停止しろ
  stop(animId: number): void {
    const layer = this.surface.layers[animId];
    if(layer instanceof SM.SerikoLayer){
      // 何らかの理由で停止要請がでたのでつまりキャンセル
      layer.canceled = true;
    }
  }

  pause(animId: number): void {
    const layer = this.surface.layers[animId];
    if(layer instanceof SM.SerikoLayer){
      layer.paused = true;
    }
  }

  resume(animId: number): void {
    const layer = this.surface.layers[animId];
    if(layer instanceof SM.SerikoLayer){
      layer.paused = false;
      this.step(animId, layer);
    }
  }

  talk(): void {
    const srf = this.surface;
    const {surfaceNode, layers} = this.surface;
    const animations = surfaceNode.animations;
    srf.talkCount++;
    // talkなものでかつtalkCountとtalk,nのmodが0なもの
    const hits = animations.filter((anim, animId)=>
        anim.intervals.some(([interval, args])=> "talk" === interval && srf.talkCount % args[0] === 0));
    hits.forEach((anim, animId)=>{
      // そのtalkアニメーションは再生が終了しているか？
      if(layers[animId] instanceof SM.SerikoLayer){
        const layer = <SM.SerikoLayer>layers[animId];
        if(layer.patternID < 0){
          this.play(animId);
        }
      }
    });
  }

  yenE(): void {
    const srf = this.surface;
    const {surfaceNode, layers} = this.surface;
    const anims = surfaceNode.animations;
    anims.forEach((anim, animId)=>{
      if (anim.intervals.some(([interval, args])=> interval === "yen-e") ) {
        this.play(animId);
      }
    });
  }

}






  
