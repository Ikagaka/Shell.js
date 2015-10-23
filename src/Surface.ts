
import {SurfaceRender, SurfaceLayerObject} from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {Shell, SurfaceTreeNode} from "./Shell";

var $ = jQuery;

export interface SurfaceMouseEvent {
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scope: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "Bust"
  transparency: boolean; // 透明領域ならtrue,
  event: JQueryEventObject;
}

export class Surface extends EventEmitter2 {
  public element: HTMLCanvasElement;
  public scopeId: number;
  public surfaceId: number;
  public shell: Shell;
  public destructed: boolean;

  private surfaceResources: SurfaceTreeNode; //{base, elements, collisions, animations}
  private bufferCanvas: HTMLCanvasElement; //チラツキを抑えるためのバッファ
  private bufRender: SurfaceRender;//バッファのためのレンダラ
  private elmRender: SurfaceRender;//実際のDOMTreeにあるcanvasへのレンダラ
  private layers: { [animationId: number]: SurfaceAnimationPattern; };//アニメーションIDの現在のレイヤ。アニメで言う動画セル。
  private stopFlags: { [key: string]: boolean; };//keyがfalseのアニメーションの再生を停止する
  private talkCount: number;
  private talkCounts: { [key: string]: number };//key:タイミングがtalkのアニメーションid、number:talkCountの閾値
  private destructors: Function[]; // destructor実行時に実行される関数のリスト
  private animationsQueue: { [key:number]: Function[] }; // key:animationId, 再生中のアニメーションのコマごとのキュー。アニメーションの強制停止に使う

  constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell) {
    super();
    EventEmitter2.call(this);

    // public
    this.element = canvas;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.shell = shell;
    this.destructed = false;

    // private
    this.surfaceResources = shell.surfaceTree[surfaceId];
    this.bufferCanvas = SurfaceUtil.createCanvas();
    this.bufRender = new SurfaceRender(this.bufferCanvas);
    this.elmRender = new SurfaceRender(this.element);
    this.destructors = [];
    this.layers = {};
    this.stopFlags = {};
    this.talkCount = 0;
    this.talkCounts = {};
    this.animationsQueue = [];

    // initialize methods
    this.initMouseEvent();
    this.initAnimations();
    this.render();
  }

  // public methods
  public destructor(): void {
    this.destructor = ()=> console.warn("this surface already destructed", this);
    this.destructors.forEach((fn)=> fn());
    this.elmRender.clear();
    this.destructed = true;
    // これ以後のsetTimeoutトリガーのアニメーションを表示しない保険
    this.element = document.createElement("canvas");
    this.elmRender = new SurfaceRender(this.element);
    this.layers = {};
  }

  public render(): void {
    // this.layersが数字をキーとした辞書なのでレイヤー順にソート
    var sorted = Object.keys(this.layers).sort((layerNumA, layerNumB)=> Number(layerNumA) > Number(layerNumB) ? 1 : -1 )
    var renderLayers = sorted
    .map((key)=> this.layers[Number(key)])
    .reduce<SurfaceLayerObject[]>(((arr, pattern)=>{
      var {surface, type, x, y} = pattern;
      if(surface === -1) return arr; // idが-1つまり非表示指定
      var srf = this.shell.surfaceTree[surface];
      if(srf == null){
        console.warn("Surface#render: surface id "+surface + " is not defined.", pattern);
        console.warn(surface, Object.keys(this.shell.surfaceTree));
        return arr; // 対象サーフェスがないのでスキップ
      }
      var {base, elements} = srf;
      // 対象サーフェスのbaseサーフェス(surface*.png)の上に
      var rndr = new SurfaceRender(SurfaceUtil.copy(base));
      // elementを合成する
      rndr.composeElements(elements);
      return arr.concat({
        type: type,
        x: x,
        y: y,
        canvas: rndr.cnv
      });
    }), []);
    var srfNode = this.surfaceResources;
    // this.surfaceIdが持つ情報。型をみて。
    this.bufRender.init(srfNode.base); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
    this.bufRender.composeElements(srfNode.elements);// ベースサーフェスの上にエレメントを合成
    this.bufRender.composeElements(renderLayers);//現在有効なアニメーションのレイヤを合成
    if (this.shell.enableRegionDraw) { // 当たり判定を描画
      this.bufRender.ctx.fillText(""+this.surfaceId, 5, 10);
      this.bufRender.drawRegions(srfNode.collisions);
    }
    this.elmRender.init(this.bufRender.cnv); //バッファから実DOMTree上のcanvasへ描画
  }

  public play(animationId: number, callback?: () => void): void {
    var anims = this.surfaceResources.animations;
    var anim = this.surfaceResources.animations[animationId];
    if(!anim) return void setTimeout(callback);
    this.stopFlags[animationId] = false;
    this.animationsQueue[animationId] = anim.patterns.map((pattern)=> ()=>{
      var {surface, wait, type, x, y, animation_ids} = pattern;
      switch(type){
        case "start":            this.play(animation_ids[0], nextTick); return;
        case "stop":             this.stop(animation_ids[0]); setTimeout(nextTick); return;
        case "alternativestart": this.play(SurfaceUtil.choice<number>(animation_ids), nextTick); return;
        case "alternativestart": this.stop(SurfaceUtil.choice<number>(animation_ids)); setTimeout(nextTick); return;
      }
      this.layers[animationId] = pattern;
      this.render();
      var [__, a, b] = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]);
      var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
      setTimeout(nextTick, _wait);
    });
    var nextTick = ()=>{
      var next = this.animationsQueue[animationId].shift();
      if(!(next instanceof Function) || this.destructed || !!this.stopFlags[animationId]){
        // stop pattern animation.
        this.animationsQueue[animationId] = [];
        setTimeout(callback);
      }else next();
    };
    this.animationsQueue[animationId][0] instanceof Function && this.animationsQueue[animationId][0]();
  }

  public stop(animationId: number): void {
    this.stopFlags[animationId] = true;
    this.animationsQueue[animationId] = [];
  }

  public talk(): void {
    var animations = this.surfaceResources.animations;
    this.talkCount++;
    var hits = animations.filter((anim)=>
        /^talk/.test(anim.interval) && this.talkCount % this.talkCounts[anim.is] === 0);
    hits.forEach((anim)=>{
      this.play(anim.is);
    });
  }

  public yenE(): void {
    var animations = this.surfaceResources.animations;
    var hits = animations.filter((anim)=>
    anim.interval === "yen-e" && this.talkCount % this.talkCounts[anim.is] === 0);
    hits.forEach((anim)=>{
      this.play(anim.is);
    });
  }

  // private methods

  private initMouseEvent(): void {
    this.initMouseEvent = function(){ console.warn("initMouseEvent allows only first call. this call is second call."); };
    // 副作用あり
    var $elm = $(this.element);
    var tid = 0;
    var touchCount = 0;
    var touchStartTime = 0;
    var tuples: [string, (ev:JQueryEventObject)=> void][] = [];
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
        // ダブルタップ->ダブルクリック変換
        this.processMouseEvent(ev, "mousedblclick");
      }
    }]);
    tuples.push(["touchstart",   (ev)=> {
      touchCount++;
      touchStartTime = Date.now();
      this.processMouseEvent(ev, "mousedown");
      clearTimeout(tid);
      tid = setTimeout(()=> touchCount = 0, 500)
    }]);
    // イベント登録
    tuples.forEach(([ev, handler])=> $elm.on(ev, handler));
    this.destructors.push(()=>{
      // イベント解除
      tuples.forEach(([ev, handler])=> $elm.off(ev, handler));
    });
  }

  private initAnimations(): void {
    this.initAnimations = function(){ console.warn("initAnimations allows only first call. this call is second call."); };
    // 副作用あり
    // このサーフェスのアニメーションを登録する
    this.surfaceResources.animations.forEach((anim)=>{
      this.initAnimation(anim);
    });
  }

  private initAnimation(anim: SurfaceAnimation): void {
    // 副作用あり
    var {is:animId, interval, patterns} = anim;//isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
    var tmp = interval.split(",");
    var _interval = tmp[0];
    if(tmp.length > 1){
      var n = Number(tmp[1]);
      if(!isFinite(n)){
        console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
        n = 4; // rarelyにfaileback
      }
    }
    // アニメーション描画タイミングの登録
    switch (_interval) {
      // nextTickを呼ぶともう一回random
      case "sometimes":SurfaceUtil.random(  ((nextTick) => { if (!this.destructed && !this.stopFlags[animId]) { this.play(animId, nextTick); } }), 2); break;
      case "rarely":   SurfaceUtil.random(  ((nextTick) => { if (!this.destructed && !this.stopFlags[animId]) { this.play(animId, nextTick); } }), 4); break;
      case "random":   SurfaceUtil.random(  ((nextTick) => { if (!this.destructed && !this.stopFlags[animId]) { this.play(animId, nextTick); } }), n); break;
      case "periodic": SurfaceUtil.periodic(((nextTick) => { if (!this.destructed && !this.stopFlags[animId]) { this.play(animId, nextTick); } }), n); break;
      case "always":   SurfaceUtil.always(  ((nextTick) => { if (!this.destructed && !this.stopFlags[animId]) { this.play(animId, nextTick); } })   ); break;
      case "runonce": this.play(animId); break;
      case "never": break;
      case "yen-e": break;
      case "talk": this.talkCounts[animId] = n; break;
      default:
        if(/^bind/.test(interval)){
          this.initBind(anim);
          break;
        }
        console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
    }
  }

  public updateBind(): void {
    // Shell.tsから呼ばれるためpublic
    // Shell#bind,Shell#unbindで発動
    // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれるようだ
    this.surfaceResources.animations.forEach((anim)=>{
      var {is, interval, patterns} = anim;
      if(/^bind/.test(interval)){
        this.initBind(anim);
      }
    });
  }

  private initBind(anim: SurfaceAnimation): void {
    // kyuu ni nihongo utenaku natta.
    // initAnimation calls this method for animation interval type "bind".
    // updateBind calls this method.
    var {is, interval, patterns, option} = anim;
    if(!this.shell.bindgroup[this.scopeId][is]){
      delete this.layers[is];
      this.stop(is);
      return;
    }
    var [_bind, ...intervals] = interval.split("+");
    if(intervals.length > 0) return;
    intervals.forEach((itvl)=>{
      this.initAnimation({interval: itvl, is, patterns, option});
    });
    this.layers[is] = patterns[patterns.length-1];
    this.render();
  }

  private getRegion(offsetX: number, offsetY: number): {isHit:boolean, name:string} {
    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    // 副作用なし
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

  private processMouseEvent(ev: JQueryEventObject, type:string): void{
    // マウスイベントの共通処理
    // 副作用なし。イベント発火する。
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
    var hit = this.getRegion(offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}

    ev.preventDefault();
    var custom: SurfaceMouseEvent = {
      "type": type,
      "offsetX": offsetX|0,//float->int
      "offsetY": offsetY|0,//float->int
      "wheel": 0,
      "scope": this.scopeId,
      "region": hit.name,
      "button": ev.button === 2 ? 1 : 0,
      "transparency": !hit.isHit,
      "event": ev // onした先でpriventDefaultとかstopPropagationとかしたいので
    };
    if(hit.name !== ""){//もし当たり判定
      if(/^touch/.test(ev.type)){
        ev.stopPropagation();
        // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
        // ために親要素にイベント伝えない
      }
      $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
    }
    this.emit("mouse", custom);
    this.shell.emit("mouse", custom);
  }
}
