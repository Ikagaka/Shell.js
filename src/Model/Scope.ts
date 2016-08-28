/*
 * そのスコープのサーフェスとバルーンの状態を一意に表すモデル
 */

import * as Util from "../Util/index";
import {Surface} from "./Surface";
import {Shell} from "./Shell";
import {Canvas} from "./Canvas";

export class Scope {
  scopeId:         number;
  surfaceId:       number;
  
  surface:         Surface;
  position:        {x: number, y: number};
  size:            {width: number, height: number};
  basepos:         {x: number, y: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";
  // あるべき姿
  // structor(scopeId: number, surfaceId: number, srfCnv: Canvas, basepos: {x: number, y: number}, alignmenttodesktop: string)
  constructor(scopeId: number, surfaceId: number, width: number, height: number, alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free", basepos?: {x?: number, y?: number}){
    // これエラーで落ちたら呼んだ人が悪い

    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.surface = new Surface(scopeId, surfaceId, width, height);

    this.position = {x: 0, y: 0}; // defaultxとか？
    // model は render されないと base surface の大きさがわからない
    this.size    = { width, height };

    // デフォルト値
    this.basepos = { x: width/2|0, y: height };
    // 引数省略時の処理
    if(basepos != null && basepos.x != null){
      this.basepos.x = basepos.x;
    }
    if(basepos != null && basepos.y != null){
      this.basepos.y = basepos.y;
    }
    this.alignmenttodesktop = alignmenttodesktop;
  }
}

