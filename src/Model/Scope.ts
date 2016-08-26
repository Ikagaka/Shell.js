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
  srfCnv:          Canvas;
  surface:         Surface;
  position:        {x: number, y: number};
  size:            {width: number, height: number};
  basepos:         {x: number, y: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";

  constructor(scopeId: number, surfaceId: number, width: number, height:number, shell: Shell){
    const config = shell.config;
    const surfaceNode = shell.surfaceDefTree[surfaceId];
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    if(config.char[surfaceId] != null && typeof config.char[surfaceId].seriko.alignmenttodesktop === "string"){
      // 個別設定
      this.alignmenttodesktop = config.char[surfaceId].seriko.alignmenttodesktop;
    }else{
      // 全体設定が初期値
      this.alignmenttodesktop = config.seriko.alignmenttodesktop;
    }
     
    // model は　render されないと base surface の大きさがわからない
    this.size    = {width, height}
    this.basepos = {x: width/2|0, y: height};
    if(surfaceNode.points.basepos.x != null){
      this.basepos.x = surfaceNode.points.basepos.x;
    }
    if(surfaceNode.points.basepos.y != null){
      this.basepos.y = surfaceNode.points.basepos.y;
    }

  }
}