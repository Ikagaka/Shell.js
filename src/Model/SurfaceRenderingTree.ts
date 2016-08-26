/*
 * 現在のサーフェスのレイヤ状態を一意に表すレンダリングツリー
 */

import {SurfaceCollision} from "../Model/SurfaceDefinitionTree";

export class SurfaceRenderingTree { 
  base:        number;
  foregrounds: SurfaceRenderingLayerSet[];
  backgrounds: SurfaceRenderingLayerSet[];
  collisions:  SurfaceCollision[];
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