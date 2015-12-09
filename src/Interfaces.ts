

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

export interface SurfaceRegion {
  is: number;
  name: string;
  type: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  radius: number;
  center_x: number;
  center_y: number;
  coordinates: { x: number; y: number; }[];
}

export interface SurfaceAnimation {
  is: number;
  interval: string;
  option: string;
  patterns: SurfaceAnimationPattern[];
}

export interface SurfaceAnimationPattern {
  animation_ids: number[]; //alternativestart, alternativestop
  animation_id: string; // insert', 'start', 'stop'
  type: string;
  surface: number;
  wait: string;
  x: number;
  y: number;
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
