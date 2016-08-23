/*
 * 可用性・抽象度の高いコードスニペット集
 * SurfaceUtil という名称は Util のほうがむしろふさわしいが
 * 歴史的経緯と変更コストを鑑みてこのままにしている
 */

/// <reference path="../typings/index.d.ts" />
import * as ST from "./SurfaceTree";
import Encoding = require("encoding-japanese");
import $ = require("jquery");
import deep = require("deep-diff");

export type SUDiff = deepDiff.IDiff[];
export function diff(lhs: Object, rhs: Object, prefilter?: deepDiff.IPrefilter, acc?: deepDiff.IAccumulator): SUDiff {
  const ret = deep.diff(lhs, rhs, prefilter, acc);
  return ret != null ? ret : [];
}

export var extend = $.extend;


export function chromakey(png: HTMLCanvasElement|HTMLImageElement):HTMLCanvasElement{
  const cnvA = copy(png);
  const ctxA = <CanvasRenderingContext2D>cnvA.getContext("2d");
  const imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
  chromakey_snipet(<Uint8ClampedArray><any>imgdata.data);
  ctxA.putImageData(imgdata, 0, 0);
  return cnvA;
}

export function png_pna(png: HTMLCanvasElement|HTMLImageElement, pna: HTMLCanvasElement|HTMLImageElement) {
  const cnvA = png instanceof HTMLCanvasElement ? png : copy(png);
  const ctxA = <CanvasRenderingContext2D>cnvA.getContext("2d");
  const imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
  const dataA = imgdataA.data;
  const cnvB = pna instanceof HTMLCanvasElement ? pna : copy(pna);
  const ctxB = <CanvasRenderingContext2D>cnvB.getContext("2d")
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
  return cnvA;
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
      const xhr = new XMLHttpRequest();
      const warn = (msg: string)=>{
        console.warn("SurfaceUtil.fetchArrayBuffer: error", msg, xhr);
        reject(msg);
      };
      xhr.addEventListener("load", function() {
        if (200 <= xhr.status && xhr.status < 300) {
          if (xhr.response.error == null) {
            resolve(<ArrayBuffer>xhr.response);
          } else {
            warn(xhr.response.error.message);
          }
        } else {
          warn(""+xhr.status);
        }
      });
      xhr.addEventListener("error", function() {
        warn(xhr.response.error.message);
      });
      xhr.open("GET", url);
      xhr.responseType = "arraybuffer";
      return xhr.send();
  });
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
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
  return _copy;
}



// tmpcnvにコピー
export function fastcopy(cnv: HTMLCanvasElement|HTMLImageElement, tmpctx: CanvasRenderingContext2D): void {
  tmpctx.canvas.width = cnv.width;
  tmpctx.canvas.height = cnv.height;
  tmpctx.globalCompositeOperation = "source-over";
  tmpctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
}

// ArrayBuffer -> HTMLImageElement
export function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?:string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}));
  return fetchImageFromURL(url).then((img)=>{
    URL.revokeObjectURL(url);
    return img;
  });
}

// URL -> HTMLImageElement
export function fetchImageFromURL(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    const img = new Image();
    img.src = url;
    img.addEventListener("load", function() {
      resolve(img);
    });
    img.addEventListener("error", function(ev) {
      console.error("SurfaceUtil.fetchImageFromURL:", ev);
      reject(ev.error);
    });
  });
}



// random(func, n) means call func 1/n per sec
export function random(callback: (nextTick: Function) => void, probability: number): NodeJS.Timer {
  return setTimeout((() =>{
    function nextTick(){ random(callback, probability); }
    if (Math.random() < 1/probability) callback(nextTick)
    else nextTick();
  }), 1000);
}

// cron
export function periodic(callback: (nextTick: Function) => void, sec: number): NodeJS.Timer {
  return setTimeout((() =>
    callback(()=>
      periodic(callback, sec) )
  ), sec * 1000);
}

// 非同期ループするだけ
export function always(  callback: (nextTick: Function) => void): NodeJS.Timer {
  return setTimeout((() =>
    callback(() => always(callback) )
  ), 0);
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

// sakura -> 0
// parse error -> -1
export function unscope(charId: string): number {
  return charId === "sakura" ? 0
       : charId === "kero"   ? 1
       : Number((/^char(\d+)/.exec(charId)||["","-1"])[1]);
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


export function getScrollXY(): {scrollX: number, scrollY: number} {
  return {
    scrollX: window.scrollX || window.pageXOffset || (<HTMLBodyElement>(document.documentElement || document.body.parentNode || document.body)).scrollLeft,
    scrollY: window.scrollY || window.pageYOffset || (<HTMLBodyElement>(document.documentElement || document.body.parentNode || document.body)).scrollTop
  };
}


export function findSurfacesTxt(filepaths: string[]): string[] {
  return filepaths.filter((name)=> /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
}





export function fetchArrayBufferFromURL(url: string): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject)=> {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", ()=>{
      if (200 <= xhr.status && xhr.status < 300) {
        if (xhr.response.error == null) {
          resolve(xhr.response);
        } else {
          reject(new Error("message: "+ xhr.response.error.message));
        }
      } else {
        reject(new Error("status: "+xhr.status));
      }
    });
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.send();
  });
}




export function decolateJSONizeDescript<T, S>(o: T, key: string, value: S): void {
  // オートマージ
  // dic["a.b.c"]="d"なテキストをJSON形式に変換している気がする
  let ptr = o;
  const props = key.split(".");
  for(let i=0; i<props.length; i++){
    const prop = props[i];
    const [_prop, num]:[string, string] = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop)||["", "", ""], 1);
    const _num = Number(num);
    if(isFinite(_num)){
      if(!Array.isArray(ptr[_prop])){
        ptr[_prop] = [];
      }
      ptr[_prop][_num] = ptr[_prop][_num] || {};
      if(i !== props.length-1){
        ptr = ptr[_prop][_num];
      }else{
        if(ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0){
          // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
          // menu, 0 -> menu.value
          // menu.font...
          // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
          // このifはその例外への対処である
          ptr[_prop][_num].value = Number(value) || value;
        }else{
          ptr[_prop][_num] = Number(value) || value;
        }
      }
    }else{
      ptr[_prop] = ptr[_prop] || {};
      if(i !== props.length-1){
        ptr = ptr[_prop];
      }else{
        if(ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0){
          ptr[_prop].value = Number(value) || value;
        }else{
          ptr[_prop] = Number(value) || value;
        }
      }
    }
  }
  return;
}


export function changeFileExtension(filename: string, without_dot_new_extention:string):string{
  return filename.replace(/\.[^\.]+$/i, "") + "." + without_dot_new_extention;
}

export function ABToCav(ab: ArrayBuffer): Promise<HTMLCanvasElement>{
  return fetchImageFromArrayBuffer(ab).then(copy);
}
export function has<T>(dir: {[key: string]: T }, path: string): string {
  return fastfind(Object.keys(dir), path);
}
export function get<T>(dir: {[key:string]: T }, path: string): Promise<T> {
  let key = "";
  if((key = this.has(dir, path)) === ""){
    return Promise.reject("file not find");
  }
  return Promise.resolve(dir[key]);
}



export function setPictureFrame(element: HTMLElement, description: string){
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.appendChild(document.createTextNode(description));
  fieldset.appendChild(legend);
  fieldset.appendChild(element);
  fieldset.style.display = 'inline-block';
  fieldset.style.backgroundColor = "#D2E0E6";
  document.body.appendChild(fieldset);
  return;
}


export function craetePictureFrame(description: string, target=document.body){
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.appendChild(document.createTextNode(description));
  fieldset.appendChild(legend);
  fieldset.style.display = 'inline-block';
  target.appendChild(fieldset);
  fieldset.style.backgroundColor = "#D2E0E6";
  const add = (element: HTMLElement|string, txt="")=>{
      if(element instanceof HTMLElement){
        const frame = craetePictureFrame(txt, fieldset);
        frame.add(element);
      }else if(typeof element === "string"){
        const txtNode = document.createTextNode(element);
        const p = document.createElement("p");
        p.appendChild(txtNode);
        fieldset.appendChild(p);
      }else{
        fieldset.appendChild(element);
      }
  };
  return { add };
}

export function setCanvasStyle(){
  $(function() {
    $("<style />").html("canvas,img{border:1px solid black;}").appendTo($("body"));
  });
}
