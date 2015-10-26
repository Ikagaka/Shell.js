import {SurfaceRender, SurfaceLayerObject} from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {Shell, SurfaceTreeNode} from "./Shell";

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

export class Surface {
  public element: HTMLCanvasElement;
  public scopeId: number;
  public surfaceId: number;
  public shell: Shell;
  public position: string; // fixed|absolute
  public width: number;
  public height: number;

  private surfaceNode: SurfaceTreeNode
  private bufferCanvas: HTMLCanvasElement; //チラツキを抑えるためのバッファ
  private bufRender: SurfaceRender;//バッファのためのレンダラ
  private elmRender: SurfaceRender;//実際のDOMTreeにあるcanvasへのレンダラ

  private talkCount: number;
  private talkCounts:      { [animationId: number]: number };//key:タイミングがtalkのアニメーションid、number:talkCountの閾値
  private animationsQueue: { [animationId: number]: Function[] }; // key:animationId, 再生中のアニメーションのコマごとのキュー。アニメーションの強制停止に使う
  private backgrounds:     { [animationId: number]: SurfaceAnimationPattern };
  private layers:          { [animationId: number]: SurfaceAnimationPattern };//アニメーションIDの現在のレイヤ。アニメで言う動画セル。
  private stopFlags:       { [animationId: number]: boolean };//keyがfalseのアニメーションの"自発的"再生を停止する、sometimesみたいのを止める。bindには関係ない

  private destructed: boolean;
  private destructors: Function[]; // destructor実行時に実行される関数のリスト

  constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell) {
    this.element = canvas;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.shell = shell;
    this.width = 0;
    this.height = 0;

    this.position = "fixed";
    this.surfaceNode = shell.surfaceTree[surfaceId];
    this.bufferCanvas = SurfaceUtil.createCanvas();
    this.bufRender = new SurfaceRender(this.bufferCanvas);
    this.elmRender = new SurfaceRender(this.element);

    this.talkCount = 0;
    this.talkCounts = {};
    this.animationsQueue = {};
    this.backgrounds = {}
    this.layers = {};
    this.stopFlags = {};

    this.destructed = false;
    this.destructors = [];

    this.initMouseEvent();
    this.surfaceNode.animations.forEach((anim)=>{ this.initAnimation(anim); });
    this.render();
  }

  public destructor(): void {
    this.destructors.forEach((fn)=> fn());
    this.element = null;
    this.shell = null;
    this.elmRender.clear();
    this.surfaceNode = null;
    this.element = null;
    this.elmRender = null;
    this.layers = {};
    this.animationsQueue = {};
    this.talkCounts = {};
    this.destructors = [];
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
      var [baseX, baseY] = this.position !== "fixed" ? [pageX, pageY]: [clientX, clientY];
      var [_left, _top]  = this.position !== "fixed" ? [left,  top]  : [left - window.scrollX, top - window.scrollY];
      var offsetX = baseX - _left;//canvas左上からのx座標
      var offsetY = baseY - _top;//canvas左上からのy座標
      var hit = SurfaceUtil.getRegion(this.element, this.surfaceNode, offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
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
      this.shell.emit("mouse", custom);
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
    var {is:animId, interval, patterns} = anim;//isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
    var [_interval, ...rest] = interval.split(",");
    if(rest.length > 1){
      var n = Number(rest[0]);
      if(!isFinite(n)){
        console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
        n = 4; } } // rarelyにfaileback
    // アニメーション描画タイミングの登録
    var fn = (nextTick: Function) => {
      if (!this.destructed && !this.stopFlags[animId]) {
        this.play(animId, nextTick); } }
    switch (_interval) {
      // nextTickを呼ぶともう一回random
      case "sometimes":SurfaceUtil.random(fn, 2); break;
      case "rarely":   SurfaceUtil.random(fn, 4); break;
      case "random":   SurfaceUtil.random(fn, n); break;
      case "periodic": SurfaceUtil.periodic(fn, n); break;
      case "always":   SurfaceUtil.always(fn); break;
      case "runonce": this.play(animId); break;
      case "never": break;
      case "yen-e": break;
      case "talk": this.talkCounts[animId] = n; break;
      default:
        if(/^bind/.test(interval)){
          this.initBind(anim); // bindのことはinitBindにまるなげ
          break; }
        console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
    }
  }

  private initBind(anim: SurfaceAnimation): void {
    // bind+somtimesみたいなやつを分解
    var {is, interval, patterns, option} = anim;
    var [_bind, ...intervals] = interval.split("+");
    if(intervals.length > 0) return;
    intervals.forEach((interval)=>{
      this.initAnimation({interval, is, patterns, option});
    });
    var {option} = anim;
    if(option === "background"){
      this.backgrounds[is] = patterns[patterns.length-1];
    }else{
      this.layers[is] = patterns[patterns.length-1];
    }
    this.render();
  }

  public updateBind(): void {
    // Shell.tsから呼ばれるためpublic
    // Shell#bind,Shell#unbindで発動
    // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれるようだ
    this.surfaceNode.animations.forEach((anim)=>{
      var {is, interval, patterns} = anim;
      if (this.shell.bindgroup[this.scopeId] == null) return;
      if (this.shell.bindgroup[this.scopeId][is] == null) return;
      if (!/^bind/.test(interval)) return;
      if (this.shell.bindgroup[this.scopeId][is] === true){
        this.initBind(anim);
      }else{
        delete this.layers[is];
      }
    });
  }

  // アニメーションタイミングループの開始
  public begin(animationId: number): void {
    this.stopFlags[animationId] = false;
    var anim = this.surfaceNode.animations[animationId];
    this.initAnimation(anim);
  }

  // アニメーションタイミングループの開始
  public end(animationId: number): void {
    this.stopFlags[animationId] = true;
  }

  // アニメーション再生
  public play(animationId: number, callback?: Function): void {
    if(this.destructed) return;
    var anims = this.surfaceNode.animations;
    var anim = this.surfaceNode.animations[animationId];
    if(anim == null) return void setTimeout(callback); // そんなアニメーションはない
    this.animationsQueue[animationId] = anim.patterns.map((pattern)=> ()=>{
      var {surface, wait, type, x, y, animation_ids} = pattern;
      switch(type){
        case "start":            return this.play(animation_ids[0], nextTick);
        case "stop":             return this.stop(animation_ids[0]); setTimeout(nextTick);
        case "alternativestart": return this.play(SurfaceUtil.choice<number>(animation_ids), nextTick);
        case "alternativestart": return this.stop(SurfaceUtil.choice<number>(animation_ids)); setTimeout(nextTick);
      }
      var [__, a, b] = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]);
      var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
      setTimeout(()=>{
        if(anim.option === "background"){
          this.backgrounds[animationId] = pattern;
        }else{
          console.log(animationId, this.layers)
          this.layers[animationId] = pattern;
        }
        this.render();
        nextTick();
      }, _wait);
    });
    var nextTick = ()=>{
      if(this.destructed) return;
      var next = this.animationsQueue[animationId].shift();
      if(!(next instanceof Function) ){  // アニメーションキューを破棄されてるor これで終わり
        // stop pattern animation.
        this.animationsQueue[animationId] = [];
        setTimeout(callback);
      }else next();
    };
    if(this.animationsQueue[animationId][0] instanceof Function) {
      this.animationsQueue[animationId][0]();
    }
  }

  public stop(animationId: number): void {
    this.animationsQueue[animationId] = []; // アニメーションキューを破棄
  }

  public yenE(): void {
    var anims = this.surfaceNode.animations;
    anims.forEach((anim)=>{
      // この条件式よくわからない
      if (anim.interval === "yen-e" && this.talkCount % this.talkCounts[anim.is] === 0) {
        this.play(anim.is);
      }
    });
  }

  public render(): void {
    if(this.destructed) return;
    // this.layersが数字をキーとした辞書なのでレイヤー順にソート
    var sortedKeys = Object.keys(this.layers).sort((layerNumA, layerNumB)=> Number(layerNumA) > Number(layerNumB) ? 1 : -1 );
    var layers = sortedKeys.map((key)=> this.layers[Number(key)]);
    var renderLayers: SurfaceLayerObject[] = [];
    layers.forEach((pattern, i)=>{
      var {surface, type, x, y} = pattern;
      if(surface === -1) return; // idが-1つまり非表示指定
      var srf = this.shell.surfaceTree[surface]; // 該当のサーフェス
      if(srf == null){
        console.warn("Surface#render: surface id "+surface + " is not defined.", pattern);
        console.warn(surface, Object.keys(this.shell.surfaceTree));
        return; // 対象サーフェスがないのでスキップ
      }
      // 対象サーフェスを構築描画する
      var {base, elements} = srf;
      var rndr = new SurfaceRender(SurfaceUtil.copy(base));// 対象サーフェスのbaseサーフェス(surface*.png)の上に
      rndr.composeElements(elements); // elementを合成する
      renderLayers.push({type, x, y, canvas: rndr.cnv});
    });
    if (sortedKeys.length > 0 && Number(sortedKeys[0]) < 0) { // マイナス値、つまりbackgroundなレイヤがある
      console.info("background layer detected", sortedKeys, layers[-sortedKeys], layers, renderLayers);
    }else{
      // 物理ベースサーフェスを基準に
      renderLayers.unshift({type:"overlay", canvas:SurfaceUtil.copy(this.surfaceNode.base), x:0, y:0})
    }
    renderLayers = renderLayers.concat(this.surfaceNode.elements) // エレメントを合成
    this.bufRender.init(renderLayers[0].canvas); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
    this.bufRender.composeElements(renderLayers.slice(1)); // 現在有効なアニメーションのレイヤを合成
    if (this.shell.enableRegionDraw) { // 当たり判定を描画
      this.bufRender.ctx.fillText(""+this.surfaceId, 5, 10);
      this.bufRender.drawRegions(this.surfaceNode.collisions);
    }
    this.elmRender.init(this.bufRender.cnv); // バッファから実DOMTree上のcanvasへ描画
    this.width = this.element.width;
    this.height = this.element.height;
  }
}
