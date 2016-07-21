import "../typings/index.d.ts"

/*
CacheCanvas型はサーフェスのロード状況を管理します。


*/


export interface PNGLoaded {
  png: HTMLImageElement; // surface*.png
}

export interface PNGWithPNALoaded extends PNGLoaded {
  pna: HTMLImageElement; // surface*.pna
}

export interface CanvasLoaded extends PNGLoaded {
  cnv: HTMLCanvasElement; // クロマキーあるいはpnaによる色抜き後のサーフェス
}

export type CacheCanvas = PNGLoaded|PNGWithPNALoaded|CanvasLoaded;

export function applyChromakey(): Promise<CanvasLoaded> {
  return new Promise<CanvasLoaded>((resolve, reject)=>{});
} 

export function getPNGImage(pngBuffer: ArrayBuffer): Promise<PNGLoaded> {
  return getImageFromArrayBuffer(pngBuffer).then((png)=> ({png: png}));
}

export function getPNGAndPNAImage(pngBuffer: ArrayBuffer, pnaBuffer: ArrayBuffer): Promise<PNGWithPNALoaded> {
  return Promise.all([
    getImageFromArrayBuffer(pngBuffer),
    getImageFromArrayBuffer(pnaBuffer)
  ]).then(([png, pna])=> ({png: png, pna: pna}));
}

export function getImageFromArrayBuffer(buffer: ArrayBuffer): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}));
  return getImageFromURL(url).then((img)=>{
    URL.revokeObjectURL(url);
    return img;
  });
}

export function getImageFromURL(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    img.addEventListener("load", ()=> resolve(img));
    img.addEventListener("error", reject);
  });
}

export function getArrayBuffer(url: string): Promise<ArrayBuffer> {
  console.warn("getArrayBuffer for debbug");
  const xhr = new XMLHttpRequest();
  return new Promise<ArrayBuffer>((resolve, reject)=> {
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


