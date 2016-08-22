/// <reference path="../typings/index.d.ts" />
/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */

import * as SR from "./SurfaceRenderer";
import * as SU from "./SurfaceUtil";
import * as CC from "./CanvasCache";
import * as SH from "./ShellModel";
import * as ST from "./SurfaceTree";

export class SurfaceBaseRenderer extends SR.SurfaceRenderer{
  
  cache: CC.CanvasCache;     // 色抜きキャッシュ
  bases: SR.SurfaceCanvas[]; // 合成後のベースサーフェス
  shell: SH.Shell;

  constructor(shell: SH.Shell){
    super();
    this.bases = [];
    this.shell = shell;
    this.cache = new CC.CanvasCache(shell.directory);
  }

  getBaseSurface(n: number): Promise<SR.SurfaceCanvas> {
    // elements を合成するだけ
    const surfaceTree = this.shell.surfaceDefTree.surfaces;
    const cache = this.cache;
    const bases = this.bases;
    const srf = surfaceTree[n];
    if(!(srf instanceof ST.SurfaceDefinition) || srf.elements.length === 0){
      // そんな定義なかった || element0も何もなかった
      console.warn("SurfaceBaseRenderer#getBaseSurface: no such a surface", n, srf);
      return Promise.reject("no such a surface");
    }
    if(bases[n] instanceof SR.SurfaceCanvas){
      // キャッシュがあった
      return Promise.resolve(bases[n]);
    }
    const elms = srf.elements;
    return Promise.all(
      elms.map(({file, type, x, y})=>{
        // asisはここで処理しちゃう
        let asis = false;
        if(type === "asis"){
          type = "overlay"; // overlayにしとく
          asis = true;
        }
        if(type === "bind" || type === "add"){
          type = "overlay"; // overlayにしとく
        }
        // ファイルとりにいく
        return cache.getCanvas(file, asis)
        .then((cnv)=>{ return {file, type, x, y, canvas: new SR.SurfaceCanvas(cnv) }; })
        .catch((err)=>{
          console.warn("SurfaceBaseRenderer#getBaseSurface: no such a file", file, n, srf);
        });
      })
    ).then((elms)=> this.composeElements(elms)
    ).then((srfCnv)=>{
      // basesurfaceの大きさはbasesurfaceそのもの
      srfCnv.basePosX = 0;
      srfCnv.basePosY = 0;
      srfCnv.baseWidth = srfCnv.cnv.width;
      srfCnv.baseHeight = srfCnv.cnv.height;
      // キャッシング
      bases[n] = SR.copy(srfCnv);
      return bases[n];
    });
  }

  getBaseSurfaceSize(n:number): Promise<{width: number, height: number}> {
    return this.getBaseSurface(n).then((srfCnv)=>{
      return {
        width: srfCnv.baseWidth,
        height: srfCnv.baseHeight
      };
    });
  }
}