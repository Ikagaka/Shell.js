/// <reference path="../typings/index.d.ts"/>

export interface SurfaceCanvas {
  cnv: HTMLCanvasElement|null; // 色抜き後のサーフェス。初期状態ではnull。使われるごとにキャッシュされる
  png: HTMLImageElement|null; // 色抜き前の素材。cnvがあればnullable
  pna: HTMLImageElement|null; // 色抜き前の素材。SurfaceUtil.pna しないかぎり nullable
}

export interface SurfaceMouseEvent {
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "Bust"
  transparency: boolean; // 透明領域ならtrue,
  event: JQueryEventObject;
}

export interface SurfaceTreeNode {
  base:  SurfaceCanvas|null,
  elements: SurfaceElement[],
  collisions: SurfacesTxt2Yaml.SurfaceRegion[],
  animations: SurfaceAnimationEx[]
}

export interface SurfaceAnimationEx {
//  interval: string;
  intervals: [string, string[]][]; // [command, args]
  options: [string, string[]][]; // [command, args]
  is: number;
  patterns: SurfacesTxt2Yaml.SurfaceAnimationPattern[];
  regions: SurfacesTxt2Yaml.SurfaceRegion[];
}

export interface SurfaceElement {
  canvas: SurfaceCanvas;
  type: string;
  x: number;
  y: number;
}
