/*
 * 実 DOM と surface モデルをつなぐものたち
 * ほとんど　windowmanager　というか　angular　とかの階層
 */

import * as SH from './Shell';
import * as SU from "./SurfaceUtil";
import * as SF from './SurfaceModel';
import {EventEmitter} from "events";

export type AttachedSurfaces = { div: HTMLDivElement, surface: SF.Surface }[]; // 現在このシェルが実DOM上にレンダリングしているcanvasとそのsurface一覧


export function attachSurface(shell: SH.Shell, attachedSurface: AttachedSurfaces, div: HTMLDivElement, scopeId: number, surfaceId: number|string): Promise<SF.Surface> {
  const {cache, config, surfaceDefTree} = shell;
  const type = SU.scope(scopeId);
  const hits = attachedSurface.filter(({div: _div})=> _div === div);
  if(hits.length !== 0) throw new Error("Shell.attachSurface: ReferenceError: this HTMLDivElement is already attached");
  if(scopeId < 0){
    throw new Error("Shell.attachSurface: TypeError: scopeId needs more than 0, but:" + scopeId);
  }
  return SH.getSurfaceAlias(shell, scopeId, surfaceId)
  .then((_surfaceId)=>{
    if(_surfaceId !== surfaceId){
      console.info("Shell.attachSurface:", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
    }
    if(!surfaceDefTree[_surfaceId]){
      console.warn("Shell.attachSurface: surfaceId:", _surfaceId, "is not defined in surfaceTree", surfaceDefTree);
      return Promise.reject("not defined");
    }
    const srf = new SF.Surface(div, scopeId, _surfaceId, surfaceDefTree, config, cache);
    if(config.enableRegion){
      // これ必要？
      srf.render();
    }
    /*
    srf.on("mouse", (ev: SF.SurfaceMouseEvent)=>{
      shell.emit("mouse", ev); // detachSurfaceで消える
    });
    */
    attachedSurface.push({div, surface:srf});
    return Promise.resolve(srf);
  });
}

export function detachSurface(attachedSurface: AttachedSurfaces, div: HTMLDivElement): void {
  const hits = attachedSurface.filter(({div: _div})=> _div === div);
  if(hits.length === 0) return;
  hits[0].surface.destructor(); // srf.onのリスナはここで消される
  attachedSurface.splice(attachedSurface.indexOf(hits[0]), 1);
}



// 全サーフェス強制再描画
export function render(attachedSurface: AttachedSurfaces): void {
  attachedSurface.forEach(({surface:srf, div})=>{
    srf.render();
  });
}





export function initMouseEvent(): void {
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

export function processMouseEvent(ev: JQueryEventObject, type:string ): void {// マウスイベントの共通処理
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

