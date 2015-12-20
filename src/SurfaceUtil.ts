/// <reference path="../typings/tsd.d.ts"/>

import {SurfaceTreeNode, SurfaceCanvas} from "./Interfaces";
import Encoding = require("encoding-japanese");

export function pna(srfCnv: SurfaceCanvas): SurfaceCanvas {
  const {cnv, png, pna} = srfCnv;
  if (cnv != null) {
    // 色抜き済みだった
    return srfCnv;
  }
  if (cnv == null && png != null && pna == null){
    // 背景色抜き
    const cnvA = copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    chromakey_snipet(<Uint8ClampedArray><any>imgdata.data);
    ctxA.putImageData(imgdata, 0, 0);
    srfCnv.cnv = cnvA; // キャッシュに反映
    return srfCnv;
  }
  if (cnv == null && png != null && pna != null) {
    // pna
    const cnvA = copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    const dataA = imgdataA.data;
    const cnvB = copy(pna);
    const ctxB = cnvB.getContext("2d")
    const imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
    const dataB = imgdataB.data;
    for(let y=0; y<cnvB.height; y++){
      for(let x=0; x<cnvB.width; x++){
        const iA = x*4 + y*cnvA.width*4; // baseのxy座標とインデックス
        const iB = x*4 + y*cnvB.width*4; // pnaのxy座標とインデックス
        dataA[iA+3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
      }
    }
    ctxA.putImageData(imgdataA, 0, 0);
    srfCnv.cnv = cnvA; // キャッシュに反映
    return srfCnv;
  }
  // png, cnv が null なのは element だけで構成されたサーフェスの dummy base
  return srfCnv;
}


export function init(cnv: HTMLCanvasElement, ctx: CanvasRenderingContext2D, src: HTMLCanvasElement): void {
  cnv.width = src.width;
  cnv.height = src.height;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(src, 0, 0);
}

export function chromakey_snipet(data: Uint8ClampedArray): void { // side effect
  const r = data[0], g = data[1], b = data[2], a = data[3];
  let i = 0;
  if (a !== 0) {
    while (i < data.length) {
      if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
        data[i + 3] = 0;
      }
      i += 4;
    }
  }
}

export function log(element: Element, description=""){
  if(element instanceof HTMLCanvasElement || element instanceof HTMLImageElement){
    description += "("+element.width+"x"+element.height+")";
  }
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.appendChild(document.createTextNode(description));
  fieldset.appendChild(legend);
  fieldset.appendChild(element);
  fieldset.style.display = 'inline-block';
  document.body.appendChild(fieldset);
}

// "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
export function parseDescript(text: string): {[key:string]:string}{
  text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
  while(true){// remove commentout
    const match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["",""])[0];
    if(match.length === 0) break;
    text = text.replace(match, "");
  }
  const lines = text.split("\n");
  const _lines = lines.filter(function(line){ return line.length !== 0; }); // remove no content line
  const dic = _lines.reduce<{[key:string]:string}>(function(dic, line){
    const [key, ...vals] = line.split(",");
    const _key = key.trim();
    const val = vals.join(",").trim();
    dic[_key] = val;
    return dic;
  }, {});
  return dic;
}

// XMLHttpRequest, xhr.responseType = "arraybuffer"
export function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject)=>{
    getArrayBuffer(url, (err, buffer)=>{
      if(!!err) reject(err);
      else      resolve(buffer);
    });
  });
}

// XMLHttpRequest, xhr.responseType = "arraybuffer"
export function getArrayBuffer(url: string, cb: (err: any, buffer: ArrayBuffer)=> any): void {
  const xhr = new XMLHttpRequest();
  const _cb = (a: any, b: ArrayBuffer)=>{
    cb(a, b);
    cb = (a, b)=>{ console.warn("SurfaceUtil.getArrayBuffer", url, a, b); };
  };
  xhr.addEventListener("load", function() {
    if (200 <= xhr.status && xhr.status < 300) {
      if (xhr.response.error == null) {
        _cb(null, xhr.response);
      } else {
        _cb(new Error("message: "+ xhr.response.error.message), null);
      }
    } else {
      _cb(new Error("status: "+xhr.status), null);
    }
  });
  xhr.addEventListener("error", function() {
    _cb(new Error("error: "+ xhr.response.error.message), null);
  });
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";
  return xhr.send();
}

// convert some encoding txt file arraybuffer to js string
// TODO: use text-enconding & charset detection code
export function convert(buffer: ArrayBuffer):string{
  //return new TextDecoder('shift_jis').decode(buffer);
  return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...
export function find(paths: string[], filename: string): string[] {
  filename = filename.split("\\").join("/");
  if(filename.slice(0,2) === "./") filename = filename.slice(2);
  const reg =new RegExp("^"+filename.replace(".", "\.")+"$", "i");
  const hits = paths.filter((key)=> reg.test(key));
  return hits;
}

// 検索打ち切って高速化
export function fastfind(paths: string[], filename: string): string {
  filename = filename.split("\\").join("/");
  if(filename.slice(0,2) === "./") filename = filename.slice(2);
  const reg = new RegExp("^"+filename.replace(".", "\.")+"$", "i");
  for(let i=0; i < paths.length; i++){
    if (reg.test(paths[i])){
      return paths[i];
    }
  }
  return "";
}

// [1,2,3] -> 1 or 2 or 3 as 33% probability
export function choice<T>(arr: T[]): T {
  return arr[(Math.random()*100*(arr.length)|0)%arr.length];
}

// copy canvas as new object
// this copy technic is faster than getImageData full copy, but some pixels are bad copy.
// see also: http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally
export function copy(cnv: HTMLCanvasElement|HTMLImageElement): HTMLCanvasElement {
  const _copy = document.createElement("canvas");
  const ctx = <CanvasRenderingContext2D>_copy.getContext("2d");
  _copy.width = cnv.width;
  _copy.height = cnv.height;
  ctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
  return _copy;
}

// tmpcnvにコピー
export function fastcopy(cnv: HTMLCanvasElement|HTMLImageElement, tmpcnv:HTMLCanvasElement , tmpctx: CanvasRenderingContext2D) {
  tmpcnv.width = cnv.width;
  tmpcnv.height = cnv.height;
  tmpctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
  return tmpcnv;
}

// ArrayBuffer -> HTMLImageElement
export function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?:string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    getImageFromArrayBuffer(buffer, (err, img)=>{
      if(!!err) reject(err);
      else      resolve(img);
    })
  });
}

// ArrayBuffer -> HTMLImageElement
export function getImageFromArrayBuffer(buffer: ArrayBuffer, cb: (err: any, img: HTMLImageElement)=> any): void {
  const url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}));
  getImageFromURL(url, (err, img)=>{
    URL.revokeObjectURL(url);
    if (err == null) cb(null, img);
    else             cb(err, null);
  });
}

// URL -> HTMLImageElement
export function fetchImageFromURL(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    getImageFromURL(url, (err, img)=>{
      if(!!err) reject(err);
      else      resolve(img);
    });
  });
}

// URL -> HTMLImageElement
export function getImageFromURL(url: string, cb: (err: any, img: HTMLImageElement)=> any): void {
  const img = new Image();
  img.src = url;
  img.addEventListener("load", function() {
    cb(null, img);
  });
  img.addEventListener("error", function(ev) {
    console.error("SurfaceUtil.getImageFromURL", ev);
    cb(ev, null);
  });
}

// random(func, n) means call func 1/n per sec
export function random(callback: (nextTick: () => void) => void, probability: number): void {
  setTimeout((() =>{
    function nextTick(){ random(callback, probability); }
    if (Math.random() < 1/probability) callback(nextTick)
    else nextTick();
  }), 1000);
}

// cron
export function periodic(callback: (callback: () => void) => void, sec: number): void {
  setTimeout((() =>
    callback(()=>
      periodic(callback, sec) )
  ), sec * 1000);
}

// 非同期ループするだけ
export function always(  callback: (callback: () => void) => void): void {
  callback(() => always(callback) );
}

// canvasの座標のアルファチャンネルが不透明ならtrue
export function isHit(cnv: HTMLCanvasElement, x: number, y: number ): boolean {
  if(!(x > 0 && y > 0)) return false;
  // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
  if(!(cnv.width > 0 || cnv.height > 0)) return false;
  const ctx = <CanvasRenderingContext2D>cnv.getContext("2d");
  const imgdata = ctx.getImageData(0, 0, x, y);
  const data = imgdata.data;
  return data[data.length - 1] !== 0;
}

// 1x1の canvas を作るだけ
export function createCanvas(): HTMLCanvasElement {
  const cnv = document.createElement("canvas");
  cnv.width = 1;
  cnv.height = 1;
  return cnv;
}

// 0 -> sakura
export function scope(scopeId: number): string {
  return scopeId === 0 ? "sakura"
       : scopeId === 1 ? "kero"
       : "char"+scopeId;
}

// sakuta -> 0
export function unscope(charId: string): number {
  return charId === "sakura" ? 0
       : charId === "kero"   ? 1
       : Number(/^char(\d+)/.exec(charId)[1]);
}

// JQueryEventObject からタッチ・マウスを正規化して座標値を抜き出す便利関数
export function getEventPosition (ev: JQueryEventObject): { pageX: number, pageY: number, clientX: number, clientY: number, screenX: number, screenY: number} {
  if (/^touch/.test(ev.type) && (<TouchEvent>ev.originalEvent).touches.length > 0){
    const pageX = (<TouchEvent>ev.originalEvent).touches[0].pageX;
    const pageY = (<TouchEvent>ev.originalEvent).touches[0].pageY;
    const clientX = (<TouchEvent>ev.originalEvent).touches[0].clientX;
    const clientY = (<TouchEvent>ev.originalEvent).touches[0].clientY;
    const screenX = (<TouchEvent>ev.originalEvent).touches[0].screenX;
    const screenY = (<TouchEvent>ev.originalEvent).touches[0].screenY;
    return {pageX, pageY, clientX, clientY, screenX, screenY};
  }
  const pageX = ev.pageX;
  const pageY = ev.pageY;
  const clientX = ev.clientX;
  const clientY = ev.clientY;
  const screenX = ev.screenX;
  const screenY = ev.screenY;
  return {pageX, pageY, clientX, clientY, screenX, screenY};
}

// min-max 間のランダム値
export function randomRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// このサーフェスの定義 surfaceNode.collision と canvas と座標を比較して
// collision設定されていれば name"hoge"
export function getRegion(element: HTMLCanvasElement, collisions: SurfaceRegion[], offsetX: number, offsetY: number): string {
  // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド

  const hitCols = collisions.filter((collision, colId)=>{
    const {type, name} = collision;
    switch(collision.type){
      case "rect":
        var {left, top, right, bottom} = <SurfaceRegionRect>collision;
        return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
               (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
      case "ellipse":
        var {left, top, right, bottom} = <SurfaceRegionEllipse>collision;
        const width = Math.abs(right - left);
        const height = Math.abs(bottom - top);
        return Math.pow((offsetX-(left+width/2))/(width/2), 2) +
               Math.pow((offsetY-(top+height/2))/(height/2), 2) < 1;
      case "circle":
        const {radius, center_x, center_y} = <SurfaceRegionCircle>collision;
        return Math.pow((offsetX-center_x)/radius, 2)+Math.pow((offsetY-center_y)/radius, 2) < 1;
      case "polygon":
        const {coordinates} = <SurfaceRegionPolygon>collision;
        const ptC = {x:offsetX, y:offsetY};
        const tuples = coordinates.reduce(((arr, {x, y}, i)=>{
          arr.push([
            coordinates[i],
            (!!coordinates[i+1] ? coordinates[i+1] : coordinates[0])
          ]);
          return arr;
        }), []);
        const deg = tuples.reduce(((sum, [ptA, ptB])=>{
          const vctA = [ptA.x-ptC.x, ptA.y-ptC.y];
          const vctB = [ptB.x-ptC.x, ptB.y-ptC.y];
          const dotP = vctA[0]*vctB[0] + vctA[1]*vctB[1];
          const absA = Math.sqrt(vctA.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
          const absB = Math.sqrt(vctB.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
          const rad = Math.acos(dotP/(absA*absB))
          return sum + rad;
        }), 0)
        return deg/(2*Math.PI) >= 1;
      default:
        console.warn("unkown collision type:", this.surfaceId, colId, name, collision);
        return false;
    }
  });
  if(hitCols.length > 0){
    return hitCols[hitCols.length-1].name;
  }
  return "";
}

export function getScrollXY(): {scrollX: number, scrollY: number} {
  return {
    scrollX: window.scrollX || window.pageXOffset || (<HTMLBodyElement>(document.documentElement || document.body.parentNode || document.body)).scrollLeft,
    scrollY: window.scrollY || window.pageYOffset || (<HTMLBodyElement>(document.documentElement || document.body.parentNode || document.body)).scrollTop
  };
}
