/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */

import * as Util from "./index";

export type Directory = { [filepath: string]: ArrayBuffer };

export class CanvasCache {
  directory: Directory;
  cache: {[path: string]: HTMLCanvasElement }; // 色抜きキャッシュ
  constructor(dir: {[path: string]: ArrayBuffer }){
    this.directory = dir;
    this.cache = {};
  }
  hasFile(path: string): string {
    return Util.has(this.directory, path);
  }
  hasCache(path: string): string {
    return Util.has(this.cache, path);
  }
  getFile(path: string): Promise<ArrayBuffer> {
    return Util.get(this.directory, path);
  }
  getCache(path: string): Promise<HTMLCanvasElement> {
    return Util.get(this.cache, path);
  }
  getCanvas(path: string, asis=false, retry=true): Promise<HTMLCanvasElement> {
    if(asis && this.hasCache(path) !== ""){
      // 色抜き後のキャッシュがあった
      return Promise.resolve(this.cache[path]);
    }
    return this.getFile(path).then(Util.ABToCav).then((png)=>{
      if(asis){
        // 色抜き前でいい(色抜きが重いので色抜き前で良いならABからBlobしてIMGしてCNVしてしまう)
        return Promise.resolve(png);
      }
      const pna_name = Util.changeFileExtension(path, "pna");
      return this.getCanvas(pna_name, true /* pna読み出しなのでasis適用しない */ , false /* リトライしない */).then((pna)=>{
        // pnaあったので色抜き
        return Util.png_pna(png, pna);
      }).catch((err)=>{
        // pnaとかなかったのでそのまま色抜き
        return Util.chromakey(png);
      }).then((cnv)=>{
        // 色抜き後のキャッシング
        this.cache[path] = cnv;
        return cnv;
      });
    }).catch((err)=>{
      // そもそもpngファイルがなかった
      if(retry === false){
        // 二度目はない
        return Promise.reject(err);
      }
      // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
      if(this.hasFile(path+".png") === ""){
        // それでもやっぱりpngファイルがなかった
        console.warn("CanvasCache#getCanvas: ", err, path, this.directory);
        return Promise.reject(err);
      }
      // なんとpngファイルがあった
      console.warn("CanvasCache#getCanvas: ", "element file " + path + " need '.png' extension");
      // 拡張子つけてリトライ
      return this.getCanvas(path+".png", asis, false/* 二度目はない */);
    });
  }
  clear(){
    this.cache = {};
  }
}