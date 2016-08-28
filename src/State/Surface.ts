/*
 * Surface 状態モデルを更新する副作用関数群
 */

import * as Util from "../Util/index";
import {Shell} from "../Model/Shell";
import {SurfaceDefinitionTree, SurfaceDefinition, SurfaceAnimation, SurfaceAnimationPattern, SurfaceCollision, getExclusives, isBack} from "../Model/SurfaceDefinitionTree";
import {SurfaceRenderingTree, SurfaceRenderingLayerSet, SurfaceRenderingLayer} from "../Model/SurfaceRenderingTree"
import {Config, isBind} from "../Model/Config";
import {Surface, Seriko} from "../Model/Surface";
import {Canvas} from "../Model/Canvas";
import {Renderer} from "../Renderer/Renderer";
import {EventEmitter} from "events";

export class SurfaceState extends EventEmitter {
  surface: Surface;
  shell: Shell;
  config: Config;
  surfaceNode: SurfaceDefinition;
  debug: boolean;
  rndr: Renderer; // 実 DOM 上の canvas への参照をもつレンダラ
  continuations: {[animId: number]: {resolve:Function, reject:Function}};
  // アニメーション終了時に呼び出す手はずになっているプロミス値への継続
  // 本来は surface モデルに入れるべきだがクロージャを表現できないので

  renderer: (surface: Surface)=>Promise<Canvas>;

  constructor(surface: Surface, shell: Shell, renderer: (surface: Surface)=>Promise<Canvas>) {
    super();
    this.surface = surface;
    this.rndr = new Renderer(); // 初回はメモリ上の canvas への参照もっとく
    this.shell = shell
    this.renderer = renderer;

    this.continuations = {};
    this.debug = false;
    this.surfaceNode = this.shell.surfaceDefTree.surfaces[surface.surfaceId];
    this.surfaceNode.animations.forEach((anim, animId)=>{
      if(anim != null){ this.initSeriko(animId); }
    });
    this.constructRenderingTree();
    // debugの設定を待つため初回 render はしない
  }
  
  destructor(){
    this.surface.destructed = true;
    this.endAll();
  }

  render(): Promise<void>{
    const {scopeId, surfaceId} = this.surface;
    this.debug && console.time("render("+scopeId+","+surfaceId+")");
    this.constructRenderingTree();
    return this.renderer(this.surface).then((srfcnv)=>{
      // srfcnv は合成されたもの
      // 実 DOM の canvas へ反映
      this.rndr.base(srfcnv);
      this.debug && console.timeEnd("render("+scopeId+","+surfaceId+")");
    });
  }

  attachRealDOMCanvas(cnv: HTMLCanvasElement): Promise<void> {
    // 書き込み先を実DOMへ
    this.rndr = new Renderer(new Canvas(cnv));
    return this.render();
  }

  private initSeriko(animId: number): void {
    // レイヤの初期化、コンストラクタからのみ呼ばれるべき
    const {surfaceNode} = this;
    const {config} = this.shell;
    const {surfaceId, scopeId} = this.surface;
    if (surfaceNode.animations[animId] == null){
      console.warn("SurfaceState#initLayer: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
      return;
    }
    const anim = surfaceNode.animations[animId];
    const {intervals, patterns, options, collisions} = anim;
    if(intervals.some(([interval, args])=> "bind" === interval)){
      // このanimIDは着せ替え機能付きレイヤ
      if (isBind(config, scopeId, animId)) {
        // 現在有効な bind なら
        if(intervals.length > 1){
          // [[bind, []]].length === 1
          // bind+hogeは着せ替え付随アニメーション。
          // 現在のレイヤにSERIKOレイヤを追加
          // インターバルタイマの登録
          this.begin(animId);
          return;
        } 
        // interval,bind
        return;
      }
      // 現在有効な bind でないなら
      // 現在の合成レイヤの着せ替えレイヤを非表示設定
      // bind+sometimsなどを殺す
      this.end(animId);
      return;
    }
    // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
    // 現在のレイヤにSERIKOレイヤを追加
    this.begin(animId);
  }

  updateBind(): Promise<void>{
    const {surface, surfaceNode} = this;
    const animations = surfaceNode.animations;
    animations.forEach(({intervals}, animId)=>{
      if(intervals.some(([interval, args])=> "bind" === interval)){
        // bind+ を発動
        this.initSeriko(animId);
      }
    });
    this.constructRenderingTree();
    return this.render().then(()=>{});
  }

  // アニメーションタイミングループの開始要請
  begin(animId: number): void {
    const {surfaceNode, config} = this;
    const {serikos, scopeId} = this.surface;
    const {intervals, patterns, options, collisions} = surfaceNode.animations[animId];
    if(intervals.some(([interval])=> interval === "bind")){
      if( ! isBind(config, scopeId, animId) ){
        return;
      }
    }
    // SERIKO Layer の状態を変更
    serikos[animId] = new Seriko();
    intervals.forEach(([interval, args])=>{
      // インターバルタイマの登録
      this.setIntervalTimer(animId, interval, args);
    });
  }

  // アニメーションタイミングループのintervalタイマの停止
  end(animId: number): void {
    const {serikos} = this.surface;
    // SERIKO Layer の状態を変更
    delete serikos[animId];
  }

  // すべての自発的アニメーション再生の停止
  endAll(): void {
    const {serikos} = this.surface;
    Object.keys(serikos).forEach((animId)=>{
      this.end(Number(animId));
    });
  }

  private setIntervalTimer(animId:number, interval:string, args:number[]): void{
    // setTimeoutする、beginからのみ呼ばれてほしい
    const serikos = this.surface.serikos;
    if (!(serikos[animId] instanceof Seriko)){
      console.warn("SurfaceState#setTimer: animId", animId,"is not SerikoLayer");
      return;
    }
    const fn = (nextTick: Function)=>{
      // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
      if (!(serikos[animId] instanceof Seriko)){
        // nextTick 呼ばないのでintervalを終了する
        return;
      }  
      this.play(animId)
      .catch((err)=> console.info("animation canceled", err))
      .then(()=>{ nextTick(); });
    };
    // アニメーション描画タイミングの登録
    switch (interval) {
      // nextTickを呼ぶともう一回random
      case "always":    Util.always(fn);      return;
      case "runonce":   setTimeout(()=> this.play(animId));  return;
      case "never":     return;
      case "yen-e":     return;
      case "talk":      return;
      case "sometimes": Util.random(fn, 2);   return;
      case "rarely":    Util.random(fn, 4);   return;
      default:
        const n = isFinite(args[0]) ? args[0]
                                    : (console.warn("Surface#setIntervalTimer: failback to", 4, "from", args[0], interval, animId)
                                    , 4);
        if(interval === "random"){
          Util.random(fn, n);
          return;
        }
        if(interval === "periodic"){
          Util.periodic(fn, n);
          return;
        } 
    }
    console.warn("SurfaceState#setIntervalTimer: unkown interval:", interval, animId);
    return;
  }

  // アニメーション再生
  play(animId: number): Promise<void> {
    const {surfaceNode, debug, surface, config} = this;
    const {serikos, destructed, scopeId, surfaceId} = surface;
    const {animations} = surfaceNode;
    if(!(animations[animId] instanceof SurfaceAnimation)){
      // そんなアニメーションはない
      console.warn("SurfaceState#play: animation "+animId+" is not defined");
      return Promise.reject("SurfaceState#play: animation "+animId+" is not defined");
    }
    const anim = animations[animId];
    const {intervals, patterns, options, collisions} = anim;
    if(intervals.some(([interval])=> interval === "bind")){
      if( ! isBind(config, scopeId, animId) ){
        // その bind+ は現在の着せ替え設定では無効だ
        console.warn("SurfaceState#play: this animation is turned off in current bindgroup state");
        return Promise.reject("SurfaceState#play: this animation is turned off in current bindgroup state");
      }
    }
    if(destructed){
      // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
      return Promise.reject("SurfaceState#play: destructed");
    }
    if(!(serikos[animId] instanceof Seriko)){
      // SERIKO Layer の状態を初期化
      serikos[animId] = new Seriko();
    }
    let seriko = serikos[animId];
    if(seriko.patternID >= 0 || seriko.paused){
      // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
      seriko.canceled = true; // this.step に渡している Seriko への参照はキャンセル
      seriko = serikos[animId] = new Seriko(); // 新しい値を設定
    }
    getExclusives(anim).map((exAnimId)=>{
      // exclusive指定を反映
      if(serikos[exAnimId] instanceof Seriko){
        serikos[exAnimId].exclusive = true;
      }
    });
    debug && console.group("("+[scopeId,surfaceId,animId].join(",")+")");
    debug && console.info("animation start", animId, anim);
    return new Promise<void>((resolve, reject)=>{
      // pause から resume した後に帰るべき場所への継続を取り出す
      this.continuations[animId] = {resolve, reject};
      this.step(animId, seriko);
    }).catch(console.info.bind(console, "animation")).then(()=>{
      debug && console.info("animation finish", animId);
      debug && console.groupEnd();
    });
  }


  private step(animId: number, seriko: Seriko): void {
    const {surface, debug, surfaceNode} = this;
    const {serikos, destructed, scopeId, surfaceId} = surface;
    const {resolve, reject} = this.continuations[animId];
    const anim = surfaceNode.animations[animId];
    // patternをすすめる
    // exclusive中のやつら探す
    const exclusives = Object.keys(serikos)
      .filter((id)=> !(serikos[id] instanceof Seriko))
      .filter((id)=> serikos[id].exclusive );
    if(exclusives.length > 0 ){
      // exclusiveが存在
      if(exclusives.every((id)=> Number(id) !== animId )){
        // exclusives の中に自分は含まれない＝排他されてしまう
        seriko.canceled = true;
      }
    }
    if(seriko.canceled){
      // キャンセルされたので reject
      if(reject instanceof Function){
        reject("SurfaceState#step: canceled.");
      }
      return;
    }
    if(seriko.paused){
      // 次にplayが呼び出されるまで何もしない 
      return;
    }
    // patternID は現在表示中のパタン
    // patternID === -1 は +1 され 0 になり wait ミリ秒間待ってから patternID === 0 を表示するとの意思表明
    // patternID+1 はこれから表示
    seriko.patternID++;
    if(anim.patterns[seriko.patternID] == null){
      // このステップで次に表示すべきなにかがない＝このアニメは終了
      seriko.finished   = true;
    }
    if(seriko.finished){
      // 初期化
      serikos[animId] = new Seriko();
      delete this.continuations[animId];
      this.render().then(()=>{
        // 最終状態を描画してから終了
        if(resolve instanceof Function){
          resolve();
        }
      });
      return;
    }
    const {wait, type, x, y, animation_ids} = anim.patterns[seriko.patternID];
    let _surface = anim.patterns[seriko.patternID].surface;
    const _wait = Util.randomRange(wait[0], wait[1]);
    switch(type){
      // 付随再生であってこのアニメの再生終了は待たない・・・はず？
      case "start":            this.play(animation_ids[0]); return;
      case "stop":             this.stop(animation_ids[0]); return;
      case "alternativestart": this.play(Util.choice<number>(animation_ids)); return;
      case "alternativestop":  this.stop(Util.choice<number>(animation_ids)); return;
      case "move":
        surface.move.x = x;
        surface.move.y = y;
        debug && console.time("move("+scopeId+","+surfaceId+")");
        new Promise((resolve)=> setTimeout(resolve, _wait))
        .catch(console.warn.bind(console)) // 何らかの理由で move がキャンセルされようが続行
        .then(()=>{
          debug && console.timeEnd("move("+scopeId+","+surfaceId+")");
          this.emit("onMove", {type: "onMove", scopeId, surfaceId});
          // 動き終わるのを待つ
          // 次のパターン処理へ
          this.step(animId, seriko);
        });
        return; 
    }
    // waitだけ待ってからレンダリング
    debug && console.time("waiting("+[scopeId,surfaceId,animId].join(",")+"): "+_wait+"ms");
    setTimeout(()=>{
      debug && console.timeEnd("waiting("+[scopeId,surfaceId,animId].join(",")+"): "+_wait+"ms");
      if(_surface < -2){
        // SERIKO/1.4 ?
        console.warn("SurfaceState#step: pattern surfaceId", surface, "is not defined in SERIKO/1.4, failback to -2");
        _surface = -2;
      }
      if(_surface === -1){
        // SERIKO/1.4 -1 として表示されいたこのアニメーション終了 
        seriko.finished = true;
        return this.step(animId, seriko);
      }
      if(_surface === -2){
        // SERIKO/1.4 全アニメーション停止
        Object.keys(serikos).forEach((id)=>{
          if (serikos[id] instanceof Seriko){
            serikos[id].finished = true;
            this.step(animId, serikos[id]);
          } 
        });
      }
      // 描画
      this.render().then(()=>{
        // 次のパターン処理へ
        this.step(animId, seriko);
      });
    }, _wait);
  }

  // 再生中のアニメーションを停止しろ
  stop(animId: number): void {
    const {serikos} = this.surface;
    if(serikos[animId] instanceof Seriko){
      // 何らかの理由で停止要請がでたのでつまりキャンセル
      serikos[animId].canceled = true;
    }
  }

  pause(animId: number): void {
    const {serikos} = this.surface;
    if(serikos[animId] instanceof Seriko){
      serikos[animId].paused = true;
    }
  }

  resume(animId: number): void {
    const {serikos} = this.surface;
    if(serikos[animId] instanceof Seriko){
      serikos[animId].paused = false;
      this.step(animId, serikos[animId]);
    }
  }

  talk(): void {
    const {surfaceNode} = this;
    const srf = this.surface;
    const {serikos} = this.surface;
    const animations = surfaceNode.animations;
    srf.talkCount++;
    // talkなものでかつtalkCountとtalk,nのmodが0なもの
    const hits = animations.filter((anim, animId)=>
        anim.intervals.some(([interval, args])=> "talk" === interval && srf.talkCount % args[0] === 0));
    hits.forEach((anim, animId)=>{
      // そのtalkアニメーションは再生が終了しているか？
      if(serikos[animId] instanceof Seriko){
        if(serikos[animId].patternID < 0){
          this.play(animId);
        }
      }
    });
  }

  yenE(): void {
    const anims = this.surfaceNode.animations;
    anims.forEach((anim, animId)=>{
      if (anim.intervals.some(([interval, args])=> interval === "yen-e") ) {
        this.play(animId);
      }
    });
  }

  constructRenderingTree(): void {
    // 再帰的にpatternで読んでいるベースサーフェス先のbindまで考慮してレンダリングツリーを構築し反映
    const {surface, debug, shell} = this;
    const {surfaceId, serikos, renderingTree, scopeId} = surface;
    const {config, surfaceDefTree} = shell;
    const {surfaces} = surfaceDefTree;
    surface.renderingTree = layersToTree(surfaces, scopeId, surfaceId, serikos, config);
    debug && console.log("diff("+scopeId+","+surfaceId+"): ", Util.diff(renderingTree, surface.renderingTree), surface.renderingTree);
    // レンダリングツリーが更新された！
  }
}


export function layersToTree(surfaces: SurfaceDefinition[], scopeId: number, n: number, serikos: {[a:number]:Seriko}, config: Config): SurfaceRenderingTree {
  const {animations, collisions} = surfaces[n];
  const tree = new SurfaceRenderingTree(n);
  tree.collisions = collisions;
  animations.forEach((anim, animId)=>{
    const {patterns, collisions, intervals} = anim;
    const rndLayerSets: SurfaceRenderingLayerSet = [];
    // seriko で表示されているものをレンダリングツリーに追加
    if(serikos[animId] instanceof Seriko){
      const {patternID} = serikos[animId];
      if(patterns[patternID] instanceof SurfaceAnimationPattern){
        // pattern が定義されている seriko layer
        const {type, surface, x, y} = patterns[patternID];
        if(surface > 0){
          // 非表示でない
          if(surfaces[surface] instanceof SurfaceDefinition){
            const _tree = recursiveBind(surfaces, surface, serikos, config, collisions);
            rndLayerSets.push(new SurfaceRenderingLayer(type, _tree, x, y));
          }else{
            // 存在しないサーフェスを参照した
            console.warn("SurfaceState.layersToTree: surface", n, "is not defined");
          }
        }
      }
    }else if(isBind(config, scopeId, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1){
      // interval,bind である、 insert のための再帰的処理
      processInsert(patterns, collisions, rndLayerSets);
    }
    if(isBack(anim)){
      tree.backgrounds.push(rndLayerSets);
    }else{
      tree.foregrounds.push(rndLayerSets);
    }
  });
  return tree;
  function processInsert(patterns: SurfaceAnimationPattern[], collisions: SurfaceCollision[], rndLayerSets: SurfaceRenderingLayerSet){
    // SC.isBind(config, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1
    // なときだけ呼ばれたい
    // TODO: insert の循環参照を防ぐ
    patterns.forEach(({type, surface, x, y, animation_ids}, patId)=>{
      if(type === "insert"){
        // insertの場合は対象のIDをとってくる
        const insertId = animation_ids[0];
        if(!(animations[insertId] instanceof SurfaceAnimation)){
          console.warn("SurfaceState.layersToTree", "insert id", animation_ids, "is wrong target.", n, patId);
          return;
        }
        const {patterns, collisions} = animations[insertId];
        // insertをねじ込む
        processInsert(patterns, collisions, rndLayerSets);
        return;
      }
      if(surface > 0 && surfaces[surface] instanceof SurfaceDefinition){
        const tree = recursiveBind(surfaces, surface, serikos, config, collisions);
        rndLayerSets.push(new SurfaceRenderingLayer(type, tree, x, y));
      }else{
        // MAYUNA で -1 はありえん
        console.warn("SurfaceState.layersToTree: unexpected surface id ", surface);
      }
    });
  }
  function recursiveBind(surfaces: SurfaceDefinition[], n: number, serikos: {[a:number]:Seriko}, config: Config, collisions: SurfaceCollision[]): SurfaceRenderingTree{
    // この関数は n が surfaces[n] に存在することを必ず確認してから呼ぶこと
    // TODO: bind の循環参照発生するので防ぐこと
    const {animations} = surfaces[n];
    const tree = new SurfaceRenderingTree(n);
    // animation0.collision0
    tree.collisions = collisions;
    animations.forEach((anim, animId)=>{
      const {patterns, intervals, collisions} = anim;
      const rndLayerSets: SurfaceRenderingLayerSet = [];
      if(isBind(config, scopeId, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1){
        // interval,bind である、 insert のための再帰的処理
        processInsert(patterns, collisions, rndLayerSets);
      }
      if(isBack(anim)){
        tree.backgrounds.push(rndLayerSets);
      }else{
        tree.foregrounds.push(rndLayerSets);
      }
    });
    return tree;
  }
}

export interface MoveEvent {
  type: "onMove";
  scopeId: number;
  surfaceId: number;
}

