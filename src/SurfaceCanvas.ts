/// <reference path="../typings/tsd.d.ts"/>

import * as SurfaceUtil from "./SurfaceUtil";


// サーフェスのリソースのキャッシュのためのクラス
// あるサーフェスの様々なリソースを統一的に扱えるようにするためのクラス
export default class SurfaceCanvas {
  url: string;         // "" as null
  buffer: ArrayBuffer; // nullable
  img: HTMLImageElement; // nullable
  cnv: HTMLCanvasElement; // cnvは色抜きでキャッシュ
  pixels: Uint8ClampedArray; // imgdataは色抜きでキャッシュ
  width: number;      // 0 as null
  height: number;     // 0 as null
  ctx: CanvasRenderingContext2D;

  constructor() {
    this.url = "";
    this.buffer = null;
    this.img = null;
    this.cnv = null;
    this.pixels = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
  }

  loadFromURL(url: string): Promise<SurfaceCanvas> {
    this.url = url;
    return SurfaceUtil.fetchArrayBuffer(url).then((buffer)=>{
      return this.loadFromBuffer(buffer);
    });
  }

  loadFromBuffer(buffer: ArrayBuffer): Promise<SurfaceCanvas> {
    this.buffer = buffer;
    return SurfaceUtil.fetchImageFromArrayBuffer(buffer).then((img)=>{
      return this.loadFromImage(img);
    });
  }

  loadFromImage(img: HTMLImageElement): Promise<SurfaceCanvas> {
    this.img = img;
    return Promise.resolve(this.loadFromCanvas(SurfaceUtil.copy(img)));
  }

  loadFromCanvas(cnv: HTMLCanvasElement): SurfaceCanvas {
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d");
    var imgdata = this.ctx.getImageData(0, 0, cnv.width, cnv.height);
    SurfaceUtil.chromakey_snipet(<Uint8ClampedArray><any>imgdata.data); // cnvとimgdataは色抜きでキャッシュ
    this.ctx.putImageData(imgdata, 0, 0);
    return this.loadFromUint8ClampedArray(<Uint8ClampedArray><any>imgdata.data, cnv.width, cnv.height);
  }

  loadFromUint8ClampedArray(pixels: Uint8ClampedArray, width: number, height: number): SurfaceCanvas {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
    return this;
  }
}
