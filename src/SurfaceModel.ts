/*
 * Surface の状態モデル
 */

import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";


export class Surface {
  scopeId: number;
  surfaceId: number;

  surfaceDefTree:  ST.SurfaceDefinitionTree;
  surfaceNode:     ST.SurfaceDefinition;

  config:          SC.ShellConfig;

  layers:          Layer[];   // アニメーションIDの現在のレイヤ状態
  seriko:          boolean[]; // interval再生が有効なアニメーションID
  talkCount:       number;
  moveX:           number;
  moveY:           number;
  destructed:      boolean;

  constructor(scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, config: SC.ShellConfig) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    
    this.surfaceDefTree = surfaceDefTree;
    this.surfaceNode = surfaceDefTree.surfaces[surfaceId];
    
    this.config = config;

    this.layers = [];
    this.seriko = [];
    this.talkCount = 0;
    this.moveX = 0;
    this.moveY = 0;

    this.destructed = false;
  }
}


export class Layer{
  background: boolean;
}


export class SerikoLayer extends Layer{
  waiting:    boolean; // interval待ち
  patternID:  number;  // 現在表示してる pattern 。 -1でpattern0への再生開始待ち、0でpattern0を表示
  paused:     boolean; // \![anim,pause] みたいなの 
  exclusive:  boolean; // このアニメーションは排他されているか
  canceled:   boolean; // 何らかの理由で強制停止された
  finished:   boolean; // このアニメーションは正常終了した

  constructor(background: boolean){
    super();
    this.patternID  = -1;
    this.paused     = false;
    this.exclusive  = false;
    this.canceled   = false;
    this.finished = false;
    this.background = background;
  }
}

export class MayunaLayer extends Layer{
  visible: boolean;
  
  constructor(visible: boolean, background: boolean){
    super();
    this.visible = true;
    this.background = background;
  }
}

export function getSurfaceSize(srf: Surface): {width: number, height: number} {
  return {
    // TODO
    width: 0,//$(this.element).width(), // base surfaceのおおきさ
    height: 0//$(this.element).height()
  };
}


