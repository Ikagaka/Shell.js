/*
 * そのスコープのサーフェスとバルーンの状態を一意に表すモデル
 */

import * as Util from "../Util/index";
import {Surface} from "./Surface";
import {Shell} from "./Shell";
import {Canvas} from "./Canvas";

export class Scope {
  scopeId:         number;
  
  surface:         Surface;
  position:        {x: number, y: number};

  basepos:         {x?: number, y?: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";
  show:            boolean; // \s[-1] で false
  // あるべき姿
  // structor(scopeId: number, surfaceId: number, srfCnv: Canvas, basepos: {x: number, y: number}, alignmenttodesktop: string)
  constructor(scopeId: number, surfaceId: number, alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free", basepos?: {x?: number, y?: number}){
    // これエラーで落ちたら呼んだ人が悪い

    this.scopeId = scopeId;
    if(surfaceId < 0){
      this.show = false;
      surfaceId = 0;
    }else{
      this.show = true;
    }
    this.surface = new Surface(scopeId, surfaceId);

    this.position = {x: 0, y: 0}; // defaultxとか？のディスプレイ上の座標
    
    this.alignmenttodesktop = alignmenttodesktop;

    // デフォルト値
    this.basepos = {};
    // 引数省略時の処理
    if(basepos != null && basepos.x != null){
      this.basepos.x = basepos.x;
    }
    if(basepos != null && basepos.y != null){
      this.basepos.y = basepos.y;
    }
  }
}

