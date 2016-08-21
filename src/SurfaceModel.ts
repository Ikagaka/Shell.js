/*
 * Surface の状態モデル
 */

import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SH from "./ShellModel";

export class Surface {
  scopeId: number;
  surfaceId: number;
  shell: SH.Shell;

  surfaceDefTree:  ST.SurfaceDefinitionTree;
  surfaceNode:     ST.SurfaceDefinition;

  config:          SC.ShellConfig;

  layers:          Layer[];   // アニメーションIDの現在のレイヤ状態
  renderingTree:   SurfaceRenderingTree; // 実際に表示されるべき再帰的なbindも含めたレイヤツリー
  seriko:          boolean[]; // interval再生が有効なアニメーションID
  talkCount:       number;
  move:            {x: number, y: number};
  destructed:      boolean;

  constructor(scopeId: number, surfaceId: number, shell: SH.Shell) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    
    this.shell = shell;

    this.surfaceDefTree = shell.surfaceDefTree;
    this.surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
    
    this.config = shell.config;
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.layers = [];
    this.seriko = [];
    this.talkCount = 0;
    this.move = {x: 0, y: 0};

    this.destructed = false;
  }
}


export class Layer{
  background: boolean;
  patterns: ST.SurfaceAnimationPattern[];
  constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean){
    this.patterns   = [];
    this.background = background;
  }
}


export class SerikoLayer extends Layer{
  patternID:  number;
  waiting:    boolean; // interval待ち
  paused:     boolean; // \![anim,pause] みたいなの 
  exclusive:  boolean; // このアニメーションは排他されているか
  canceled:   boolean; // 何らかの理由で強制停止された
  finished:   boolean; // このアニメーションは正常終了した

  constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean, patternID=-1){
    super(patterns, background);
    this.patternID = patternID;
    this.paused     = false;
    this.exclusive  = false;
    this.canceled   = false;
    this.finished   = false;
  }
}

export class MayunaLayer extends Layer{
  visible: boolean;
  
  constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean, visible: boolean){
    super(patterns, background);
    this.visible    = true;
  }
}

export class SurfaceRenderingTree { 
  base:        number;
  foregrounds: SurfaceRenderingLayerSet[];
  backgrounds: SurfaceRenderingLayerSet[];
  constructor(surface: number){
    this.base = surface;
    this.foregrounds = [];
    this.backgrounds = [];
  }
}

export type SurfaceRenderingLayerSet = SurfaceRenderingLayer[];

export class SurfaceRenderingLayer {
  type: string;
  surface: SurfaceRenderingTree;
  x: number;
  y: number;
  constructor(type: string, surface: SurfaceRenderingTree, x: number, y: number){
    this.type = type;
    this.surface = surface;
    this.x = x;
    this.y = y;
  }
}