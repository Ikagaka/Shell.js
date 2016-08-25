/*
 * Surface 状態モデルを更新する副作用関数群
 */

import * as SH from "./ShellModel";
import * as SU from "./SurfaceUtil";
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SM from "./SurfaceModel";

export class SurfaceState {
  surface: SM.Surface;
  debug: boolean;
  continuations: {[animId: number]: {resolve:Function, reject:Function}};
  // アニメーション終了時に呼び出す手はずになっているプロミス値への継続

  renderer: (event: string, surface: SM.Surface)=>Promise<void>;

  constructor(surface: SM.Surface, renderer: (event: string, surface: SM.Surface)=>Promise<void>) {
    this.surface = surface;
    this.renderer = renderer;
    this.continuations = {};
    this.debug = false;
    
    this.surface.surfaceNode.animations.forEach((anim, animId)=>{
      if(anim != null){ this.initSeriko(animId); }
    });
    // 初回更新
    this.constructRenderingTree();
  }
  
  destructor(){
    this.surface.destructed = true;
    this.endAll();
  }

  render(): Promise<void>{
    this.debug && console.time("render");
    this.constructRenderingTree();
    return this.renderer("render", this.surface).then(()=>{
      this.debug && console.timeEnd("render");
    });
  }

  private initSeriko(animId: number): void {
    // レイヤの初期化、コンストラクタからのみ呼ばれるべき
    const {surfaceId, surfaceNode, config, scopeId} = this.surface;
    if (surfaceNode.animations[animId] == null){
      console.warn("SurfaceState#initLayer: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
      return;
    }
    const anim = surfaceNode.animations[animId];
    const {intervals, patterns, options, collisions} = anim;
    if(intervals.some(([interval, args])=> "bind" === interval)){
      // このanimIDは着せ替え機能付きレイヤ
      if (SC.isBind(config, scopeId, animId)) {
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
    const {surface} = this;
    const animations = surface.surfaceNode.animations;
    animations.forEach(({intervals}, animId)=>{
      if(intervals.some(([interval, args])=> "bind" === interval)){
        // bind+ を発動
        this.initSeriko(animId);
      }
    });
    this.constructRenderingTree();
    return this.render();
  }

  // アニメーションタイミングループの開始要請
  begin(animId: number): void {
    const {serikos, surfaceNode, config, scopeId} = this.surface;
    const {intervals, patterns, options, collisions} = surfaceNode.animations[animId];
    if(intervals.some(([interval])=> interval === "bind")){
      if( ! SC.isBind(config, scopeId, animId) ){
        return;
      }
    }
    // SERIKO Layer の状態を変更
    serikos[animId] = new SM.Seriko();
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
    if (!(serikos[animId] instanceof SM.Seriko)){
      console.warn("SurfaceState#setTimer: animId", animId,"is not SerikoLayer");
      return;
    }
    const fn = (nextTick: Function)=>{
      // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
      if (!(serikos[animId] instanceof SM.Seriko)){
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
      case "always":    SU.always(fn);      return;
      case "runonce":   setTimeout(()=> this.play(animId));  return;
      case "never":     return;
      case "yen-e":     return;
      case "talk":      return;
      case "sometimes": SU.random(fn, 2);   return;
      case "rarely":    SU.random(fn, 4);   return;
      default:
        const n = isFinite(args[0]) ? args[0]
                                    : (console.warn("Surface#setIntervalTimer: failback to", 4, "from", args[0], interval, animId)
                                    , 4);
        if(interval === "random"){
          SU.random(fn, n);
          return;
        }
        if(interval === "periodic"){
          SU.periodic(fn, n);
          return;
        } 
    }
    console.warn("SurfaceState#setIntervalTimer: unkown interval:", interval, animId);
    return;
  }

  // アニメーション再生
  play(animId: number): Promise<void> {
    const {debug, surface} = this;
    const {surfaceNode, serikos, destructed, config, scopeId} = surface;
    const {animations} = surfaceNode;
    if(!(animations[animId] instanceof ST.SurfaceAnimation)){
      // そんなアニメーションはない
      console.warn("SurfaceState#play: animation "+animId+" is not defined");
      return Promise.reject("SurfaceState#play: animation "+animId+" is not defined");
    }
    const anim = animations[animId];
    const {intervals, patterns, options, collisions} = anim;
    if(intervals.some(([interval])=> interval === "bind")){
      if( ! SC.isBind(config, scopeId, animId) ){
        // その bind+ は現在の着せ替え設定では無効だ
        console.warn("SurfaceState#play: this animation is turned off in current bindgroup state");
        return Promise.reject("SurfaceState#play: this animation is turned off in current bindgroup state");
      }
    }
    if(destructed){
      // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
      return Promise.reject("SurfaceState#play: destructed");
    }
    if(!(serikos[animId] instanceof SM.Seriko)){
      // SERIKO Layer の状態を初期化
      serikos[animId] = new SM.Seriko();
    }
    let seriko = serikos[animId];
    if(seriko.patternID >= 0 || seriko.paused){
      // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
      seriko.canceled = true; // this.step に渡している Seriko への参照はキャンセル
      seriko = serikos[animId] = new SM.Seriko(); // 新しい値を設定
    }
    ST.getExclusives(anim).map((exAnimId)=>{
      // exclusive指定を反映
      if(serikos[exAnimId] instanceof SM.Seriko){
        serikos[exAnimId].exclusive = true;
      }
    });
    debug && console.group(""+animId);
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


  private step(animId: number, seriko: SM.Seriko): void {
    const {surface, debug} = this;
    const {surfaceNode, serikos, destructed, move} = surface;
    const {resolve, reject} = this.continuations[animId];
    const anim = surfaceNode.animations[animId];
    // patternをすすめる
    // exclusive中のやつら探す
    /*if(!Object.keys(serikos).some((id)=>{
      if(!(serikos[id] instanceof SM.Seriko)){
        return false;
      }
      const seriko = serikos[id];
      if(seriko.exclusive && Number(id) === animId){ // exclusiveが存在しなおかつ自分は含まれる
        return true;
      }
      return false; // exclusive が存在しない 
    })){
      // exclusiveが存在しなおかつ自分は含まれないので
      seriko.canceled = true;
    }*/
    if(seriko.canceled){
      // キャンセルされたので reject
      return reject("SurfaceState#step: canceled.");
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
      serikos[animId] = new SM.Seriko();
      delete this.continuations[animId];
      return resolve();
    }
    const {wait, type, x, y, animation_ids} = anim.patterns[seriko.patternID];
    let _surface = anim.patterns[seriko.patternID].surface;
    switch(type){
      // 付随再生であってこのアニメの再生終了は待たない・・・はず？
      case "start":            this.play(animation_ids[0]); return;
      case "stop":             this.stop(animation_ids[0]); return;
      case "alternativestart": this.play(SU.choice<number>(animation_ids)); return;
      case "alternativestop":  this.stop(SU.choice<number>(animation_ids)); return;
      case "move":
        move.x = x;
        move.y = y;
        this.renderer("move", surface);
        return; 
    }
    const _wait = SU.randomRange(wait[0], wait[1]);
    // waitだけ待ってからレンダリング
    debug && console.time("waiting: "+_wait+"ms");
    setTimeout(()=>{
      debug && console.timeEnd("waiting: "+_wait+"ms");
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
          if (serikos[id] instanceof SM.Seriko){
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
    if(serikos[animId] instanceof SM.Seriko){
      // 何らかの理由で停止要請がでたのでつまりキャンセル
      serikos[animId].canceled = true;
    }
  }

  pause(animId: number): void {
    const {serikos} = this.surface;
    if(serikos[animId] instanceof SM.Seriko){
      serikos[animId].paused = true;
    }
  }

  resume(animId: number): void {
    const {serikos} = this.surface;
    if(serikos[animId] instanceof SM.Seriko){
      serikos[animId].paused = false;
      this.step(animId, serikos[animId]);
    }
  }

  talk(): void {
    const srf = this.surface;
    const {surfaceNode, serikos} = this.surface;
    const animations = surfaceNode.animations;
    srf.talkCount++;
    // talkなものでかつtalkCountとtalk,nのmodが0なもの
    const hits = animations.filter((anim, animId)=>
        anim.intervals.some(([interval, args])=> "talk" === interval && srf.talkCount % args[0] === 0));
    hits.forEach((anim, animId)=>{
      // そのtalkアニメーションは再生が終了しているか？
      if(serikos[animId] instanceof SM.Seriko){
        if(serikos[animId].patternID < 0){
          this.play(animId);
        }
      }
    });
  }

  yenE(): void {
    const anims = this.surface.surfaceNode.animations;
    anims.forEach((anim, animId)=>{
      if (anim.intervals.some(([interval, args])=> interval === "yen-e") ) {
        this.play(animId);
      }
    });
  }

  constructRenderingTree(): void {
    // 再帰的にpatternで読んでいるベースサーフェス先のbindまで考慮してレンダリングツリーを構築し反映
    const {surface, debug} = this;
    const {surfaceId, serikos, renderingTree, shell, scopeId} = surface;
    const {config, surfaceDefTree} = shell;
    const {surfaces} = surfaceDefTree;
    surface.renderingTree = layersToTree(surfaces, scopeId, surfaceId, serikos, config);
    debug && console.log("diff: ", SU.diff(renderingTree, surface.renderingTree));
    // レンダリングツリーが更新された！
  }
}


export function layersToTree(surfaces: ST.SurfaceDefinition[], scopeId: number, n: number, serikos: {[a:number]:SM.Seriko}, config: SC.ShellConfig): SM.SurfaceRenderingTree {
  const {animations, collisions} = surfaces[n];
  const tree = new SM.SurfaceRenderingTree(n);
  tree.collisions = collisions;
  animations.forEach((anim, animId)=>{
    const {patterns, collisions, intervals} = anim;
    const rndLayerSets: SM.SurfaceRenderingLayerSet = [];
    // seriko で表示されているものをレンダリングツリーに追加
    if(serikos[animId] instanceof SM.Seriko){
      const {patternID} = serikos[animId];
      if(patterns[patternID] instanceof ST.SurfaceAnimationPattern){
        // pattern が定義されている seriko layer
        const {type, surface, x, y} = patterns[patternID];
        if(surface > 0){
          // 非表示でない
          if(surfaces[surface] instanceof ST.SurfaceDefinition){
            const _tree = recursiveBind(surfaces, surface, serikos, config, collisions);
            rndLayerSets.push(new SM.SurfaceRenderingLayer(type, _tree, x, y));
          }else{
            // 存在しないサーフェスを参照した
            console.warn("SurfaceState.layersToTree: surface", n, "is not defined");
          }
        }
      }
    }else if(SC.isBind(config, scopeId, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1){
      // interval,bind である、 insert のための再帰的処理
      processInsert(patterns, collisions, rndLayerSets);
    }
    if(ST.isBack(anim)){
      tree.backgrounds.push(rndLayerSets);
    }else{
      tree.foregrounds.push(rndLayerSets);
    }
  });
  return tree;
  function processInsert(patterns: ST.SurfaceAnimationPattern[], collisions: ST.SurfaceCollision[], rndLayerSets:SM.SurfaceRenderingLayerSet){
    // SC.isBind(config, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1
    // なときだけ呼ばれたい
    // TODO: insert の循環参照を防ぐ
    patterns.forEach(({type, surface, x, y, animation_ids}, patId)=>{
      if(type === "insert"){
        // insertの場合は対象のIDをとってくる
        const insertId = animation_ids[0];
        if(!(animations[insertId] instanceof ST.SurfaceAnimation)){
          console.warn("SurfaceState.layersToTree", "insert id", animation_ids, "is wrong target.", n, patId);
          return;
        }
        const {patterns, collisions} = animations[insertId];
        // insertをねじ込む
        processInsert(patterns, collisions, rndLayerSets);
        return;
      }
      if(surface > 0 && surfaces[surface] instanceof ST.SurfaceDefinition){
        const tree = recursiveBind(surfaces, surface, serikos, config, collisions);
        rndLayerSets.push(new SM.SurfaceRenderingLayer(type, tree, x, y));
      }else{
        // MAYUNA で -1 はありえん
        console.warn("SurfaceState.layersToTree: unexpected surface id ", surface);
      }
    });
  }
  function recursiveBind(surfaces: ST.SurfaceDefinition[], n: number, serikos: {[a:number]:SM.Seriko}, config: SC.ShellConfig, collisions: ST.SurfaceCollision[]): SM.SurfaceRenderingTree{
    // この関数は n が surfaces[n] に存在することを必ず確認してから呼ぶこと
    // TODO: bind の循環参照発生するので防ぐこと
    const {animations} = surfaces[n];
    const tree = new SM.SurfaceRenderingTree(n);
    // animation0.collision0
    tree.collisions = collisions;
    animations.forEach((anim, animId)=>{
      const {patterns, intervals, collisions} = anim;
      const rndLayerSets:SM.SurfaceRenderingLayerSet = [];
      if(SC.isBind(config, scopeId, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1){
        // interval,bind である、 insert のための再帰的処理
        processInsert(patterns, collisions, rndLayerSets);
      }
      if(ST.isBack(anim)){
        tree.backgrounds.push(rndLayerSets);
      }else{
        tree.foregrounds.push(rndLayerSets);
      }
    });
    return tree;
  }
}