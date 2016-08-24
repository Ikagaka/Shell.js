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

  renderingTree:   SurfaceRenderingTree; // 実際に表示されるべき再帰的なbindも含めたレイヤツリー
  serikos:          {[animId: number]: Seriko}; // interval再生が有効なアニメーションID
  talkCount:       number;

  move:            {x: number, y: number};
  width:           number;
  height:          number;
  basepos:         {x: number, y: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";

  destructed:      boolean;

  constructor(scopeId: number, surfaceId: number, width: number, height: number, shell: SH.Shell) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    
    this.shell = shell;

    this.surfaceDefTree = shell.surfaceDefTree;
    this.surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
    
    this.config = shell.config;
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.serikos = {};
    this.talkCount = 0;

    this.move = {x: 0, y: 0};

    if(this.config.char[surfaceId] != null && typeof this.config.char[surfaceId].seriko.alignmenttodesktop === "string"){
      // 個別設定
      this.alignmenttodesktop = this.config.char[surfaceId].seriko.alignmenttodesktop;
    }else{
      // 全体設定が初期値
      this.alignmenttodesktop = this.config.seriko.alignmenttodesktop;
    }
     
    // model は　render されないと base surface の大きさがわからない
    this.width = width;
    this.height = width;
    this.basepos = {x: width/2|0, y: height};
    if(this.surfaceNode.points.basepos.x != null){
      this.basepos.x = this.surfaceNode.points.basepos.x;
    }
    if(this.surfaceNode.points.basepos.y != null){
      this.basepos.y = this.surfaceNode.points.basepos.y;
    }

    this.destructed = false;
  }
}

export class Seriko {
  patternID:  number;
  paused:     boolean; // \![anim,pause] みたいなの 
  exclusive:  boolean; // このアニメーションは排他されているか
  canceled:   boolean; // 何らかの理由で強制停止された
  finished:   boolean; // このアニメーションは正常終了した

  constructor(patternID=-1){
    this.patternID = patternID;
    this.paused     = false;
    this.exclusive  = false;
    this.canceled   = false;
    this.finished   = false;
  }
}



export class SurfaceRenderingTree { 
  base:        number;
  foregrounds: SurfaceRenderingLayerSet[];
  backgrounds: SurfaceRenderingLayerSet[];
  collisions:  ST.SurfaceCollision[];
  constructor(surface: number){
    this.base = surface;
    this.foregrounds = [];
    this.backgrounds = [];
    this.collisions = [];
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