/*
 * Surface 状態モデルを更新する副作用関数群
 */
import * as SR from "./SurfaceRenderer";
import * as CC from "./CanvasCache";
import * as SU from "./SurfaceUtil";
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SM from "./SurfaceModel";


export function initAnimation(surface: SM.Surface, animId: number): void {
  const {surfaceId, surfaceNode, config, layers} = surface;
  if (surfaceNode.animations[animId] == null){
    console.warn("Surface#initAnimation: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
    return;
  }
  const {intervals, patterns, options, collisions} = surfaceNode.animations[animId];
  const isBack = options.some(([opt, args])=> opt === "background");
  if(intervals.some(([interval, args])=> "bind" === interval)){
    // このanimIDは着せ替え機能付きレイヤ
    if (SC.isBind(config, animId)) {
      // 現在有効な bind なら
      if(intervals.length > 1){
        // [[bind, []]].length === 1
        // bind+hogeは着せ替え付随アニメーション。
        // 現在のレイヤにSERIKOレイヤを追加
        layers[animId] = new SM.SerikoLayer(-1);
        intervals.filter(([interval])=> interval !== "bind")
        .forEach(([interval, args])=>{
          // インターバルタイマの登録
          setTimer(surface, animId, interval, args);
        });
        return;
      } 
      // interval,bind
      // 現在のレイヤにMAYUNAレイヤを追加
      layers[animId] = new SM.MayunaLayer(true, isBack);
      return;
    }
    // 現在有効な bind でないなら
    // 現在の合成レイヤの着せ替えレイヤを非表示設定
    layers[animId] = new SM.MayunaLayer(false, isBack);
    // ついでにbind+sometimsなどを殺す
    end(surface, animId);
    return;
  }
  // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
  // 現在のレイヤにSERIKOレイヤを追加
    layers[animId] = new SM.SerikoLayer(-1, isBack);
  intervals.forEach(([interval, args])=>{
    // インターバルタイマの登録
    setTimer(surface, animId, interval, args);
  });
}

export function setTimer(srf: SM.Surface, animId:number, interval:string, args:number[]): void{
  const {layers, destructed} = srf;
  const layer = layers[animId];
  if (layer instanceof SM.SerikoLayer){
    const n = isFinite(args[0]) ? args[0]
                                : (console.warn("Surface#setTimer: failback to", 4, interval, animId)
                                , 4);
    // アニメーションを止めるための準備
    layer.stop = false;
    // アニメーション描画タイミングの登録
    const fn = (nextTick: Function) => {
      if (destructed) return;
      if (layer.stop) return;
      play(srf, animId)
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
      case "runonce":   play(srf, animId); return;
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

export function update(srf: SM.Surface): void {
  const {surfaceNode} = srf;
  // レイヤ状態の更新
  surfaceNode.animations.forEach((anim, id)=>{ initAnimation(srf, id); });
}

// アニメーションタイミングループの開始要請
export function begin(srf: SM.Surface, animationId: number): void {
  const {layers} = srf;
  const layer = layers[animationId];
  if(layer instanceof SM.SerikoLayer){
    layer.stop = false;
    initAnimation(srf, animationId);
  }
}

// アニメーションタイミングループの開始
export function end(srf: SM.Surface, animationId: number): void {
  const {layers} = srf;
  const layer = layers[animationId];
  if(layer instanceof SM.SerikoLayer){
    layer.stop = true;
  }
}

// すべての自発的アニメーション再生の停止
export function endAll(srf: SM.Surface): void {
  const {layers} = srf;
  layers.forEach((layer, id)=>{
    end(srf, id);
  });
}

// アニメーション再生
export function play(srf: SM.Surface, animationId: number): Promise<void> {
  const {surfaceNode, layers, destructed} = srf;
  if(destructed){ return Promise.reject("destructed"); }
    if(!(layers[animationId] instanceof SM.SerikoLayer)){
    console.warn("Surface#play", "animation", animationId, "is not defined");
    return Promise.reject("no such animation"); // そんなアニメーションはない
  }else{
    let layer = <SM.SerikoLayer>layers[animationId];
    const anim = surfaceNode.animations[animationId];
    if(layer.patternID >= 0){
      // 既に再生中
      // とりま殺す
      layer.canceled = true;
      clearTimeout(layer.timerID);
      layer.timerID = null;
      // とりま非表示に
      layer = layers[animationId] = new SM.SerikoLayer(-2);
    }
    if(layer.paused){
      // ポーズは解けた
      layer.paused = false;
    }
    // これから再生開始するレイヤ
    anim.options.forEach(([option, args])=>{
      if(option === "exclusive"){
        args.forEach((id)=>{
          const layer = layers[id];
          if(layer instanceof SM.SerikoLayer){
            // exclusive指定を反映
            layer.exclusive = true;
          }
        });
      }
    });
    return new Promise<void>((resolve, reject)=>{
      let nextTick = ()=>{
        // exclusive中のやつら探す
        const existExclusiveLayers = layers.some((layer, id)=> {
          return !(layer instanceof SM.SerikoLayer) ? false // layer が mayuna なら 論外
                :                                  layer.exclusive // exclusive が存在
        });
        if(existExclusiveLayers){
          // 自分はexclusiveか？
          const amIexclusive = this.layers.some((layer, id)=> {
            return !(layer instanceof SM.SerikoLayer) ? false // layer が mayuna なら 論外
                    : !layer.exclusive              ? false // exclusive が存在しない
                    :                                 id === animationId // exclusiveが存在しなおかつ自分は含まれる
          });
          if(!amIexclusive){
            // exclusiveが存在しなおかつ自分はそうではないなら
            layer.canceled = true;
          }
        }
        if(layer.canceled || destructed){
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
          const _layer = layers[animationId] = new SM.SerikoLayer(-1);
          return resolve();
        }
        const {surface, wait, type, x, y, animation_ids} = pattern;
        switch(type){
          // 付随再生であってこのアニメの再生終了は待たない・・・はず？
          case "start":            play(srf, animation_ids[0]); return;
          case "stop":             stop(srf, animation_ids[0]); return;
          case "alternativestart": play(srf, SU.choice<number>(animation_ids)); return;
          case "alternativestop":  stop(srf, SU.choice<number>(animation_ids)); return;
          case "move":             srf.moveX = x; srf.moveY = y; return;
        }
        SR.render(srf);
        const _wait = SU.randomRange(wait[0], wait[1]);
        // waitだけ待つ
        layer.timerID = setTimeout(nextTick, _wait);
      };/* nextTick ここまで */
      nextTick();
    });
  }
}

export function stop(srf: SM.Surface, animationId: number): void {
  const {layers} = srf;
  const layer = layers[animationId];
  if(layer instanceof SM.SerikoLayer){
    layer.canceled = true;
    layer.patternID = -1;
  }
}

export function talk(srf: SM.Surface): void {
  const {surfaceNode, layers} = srf;
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
        play(srf, animId);
      }
    }
  });
}

export function yenE(srf: SM.Surface): void {
  const {surfaceNode, layers} = srf;
  const anims = surfaceNode.animations;
  anims.forEach((anim, animId)=>{
    if (anim.intervals.some(([interval, args])=> interval === "yen-e") ) {
      play(srf, animId);
    }
  });
}



export function getSurfaceSize(): {width: number, height: number} {
  return {
    width: $(this.element).width(), // base surfaceのおおきさ
    height: $(this.element).height()
  };
}
