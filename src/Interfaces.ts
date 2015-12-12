/// <reference path="../typings/tsd.d.ts"/>

export interface SurfaceCanvas {
  cnv: HTMLCanvasElement; // 色抜き後のサーフェス。初期状態ではnull。使われるごとにキャッシュされる
  png: HTMLImageElement; // 色抜き前の素材。cnvがあればnullable
  pna: HTMLImageElement; // 色抜き前の素材。SurfaceUtil.pna しないかぎり nullable
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

export interface SurfaceLayer extends SurfaceAnimationPattern {
  mayura: SurfaceAnimationPattern[];
}

export interface SurfaceTreeNode {
  base:  SurfaceCanvas,
  elements: SurfaceLayerObject[],
  collisions: SurfaceRegion[],
  animations: SurfaceAnimation[]
}

export interface SurfaceLayerObject {
  canvas: SurfaceCanvas;
  type: string;
  x: number;
  y: number;
}
