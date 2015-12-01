/// <reference path="../typings/tsd.d.ts"/>
/*

export default class SurfaceTree {
  files: {[path: string]: { // elementはファイルパス指定なので
    img: HTMLImageElement; // asis用
    cnv: HTMLCanvasElement; // 色抜き済
    imgdata: ImageData; // 色抜き済キャッシュ
  }};
  constructor() {}
  load(files: {[path: string]: ArrayBuffer}): Promise<SurfaceTree> {

  }
}

*/
/*
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

*/
