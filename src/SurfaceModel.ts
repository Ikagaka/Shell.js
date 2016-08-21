/*
 * Surface の状態モデル
 */

import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";

export class Layer{
  background: boolean;
}

export class SerikoLayer extends Layer{
  patternID: number;
  timerID: any;
  paused: boolean;
  stop: boolean; // 現在排他されているアニメションID
  exclusive: boolean; //keyがfalseのアニメーションの"自発的"再生を停止する、sometimesみたいのを止める。bindには関係ない
  canceled: boolean; // 何らかの理由で強制停止された
  constructor(patternID:number, background=false){
    super();
    this.patternID = patternID;
    this.timerID = null;
    this.paused = false;
    this.stop = true;
    this.exclusive = false;
    this.canceled = false;
    this.background = background;
  }
}

export class MayunaLayer extends Layer{
  visible: boolean;
  constructor(visible:boolean, background=false){
    super();
    this.visible = visible;
    this.background = background;
  }
}

export class Surface {
  scopeId: number;
  surfaceId: number;

  surfaceDefTree:  ST.SurfaceDefinitionTree;
  surfaceNode: ST.SurfaceDefinition;
  config: SC.ShellConfig;
  layers:          Layer[];//アニメーションIDの現在のレイヤ状態
  talkCount:   number;
  moveX:       number;
  moveY:       number;
  
  destructed: boolean;

  constructor(scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, config: SC.ShellConfig) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    
    this.surfaceDefTree = surfaceDefTree;
    this.surfaceNode = surfaceDefTree.surfaces[surfaceId];
    
    this.config = config;

    this.layers = [];
    this.talkCount = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.destructed = false;
  }
}