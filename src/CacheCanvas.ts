import "../typings/index.d.ts"
import * as SU from "./SurfaceUtil";
/*
CacheCanvas型はサーフェスのロード状況を管理します。


*/

export class Done {a: "a"}
export class Yet {b:"b"}

export class Cache<T extends Done | Yet >{
  _: T; // [phantom type](http://qiita.com/falsandtru/items/353a303cc88401db44dd#generic%E5%9E%8B)
  cnv: HTMLCanvasElement; // クロマキーあるいはpnaによる色抜き後のサーフェス.
  ctx: CanvasRenderingContext2D;
  png: HTMLImageElement; // surface*.png
  constructor() {
    this.cnv = document.createElement("canvas");
  }
}

export class PNGWithoutPNA<T extends Done | Yet > extends Cache<T>{
  constructor(png: HTMLImageElement) {
    super();
    this.png = png;
  }
}

export class PNGWithPNA<T extends Done | Yet > extends PNGWithoutPNA<T>{
  pna: HTMLImageElement
  constructor(png: HTMLImageElement, pna: HTMLImageElement) {
    super(png);
    this.pna = pna;
  }
}


export function applyChromakey(cc: Cache<Done | Yet>): Promise<Cache<Done>> {
  return new Promise<Cache<Done>>((resolve, reject)=>{
    resolve(<Cache<Done>>cc);
    //reject("not impl yet");
  });
} 

export function getPNGImage(pngBuffer: ArrayBuffer): Promise<PNGWithoutPNA<Yet>> {
  return SU.fetchImageFromArrayBuffer(pngBuffer).then((png)=> new PNGWithoutPNA<Yet>(png) );
}

export function getPNGAndPNAImage(pngBuffer: ArrayBuffer, pnaBuffer: ArrayBuffer): Promise<PNGWithPNA<Yet>> {
  return Promise.all([
    SU.fetchImageFromArrayBuffer(pngBuffer),
    SU.fetchImageFromArrayBuffer(pnaBuffer)
  ]).then(([png, pna])=> new PNGWithPNA<Yet>(png, pna) );
}
