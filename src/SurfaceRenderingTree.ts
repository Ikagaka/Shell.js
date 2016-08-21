
export class SurfaceRenderingTree { 
  base:        number;
  foregrounds: LayerSet[];
  backgrounds: LayerSet[];
  constructor(surfaceId: number){
    this.base = surfaceId;
    this.foregrounds = [];
    this.backgrounds = [];
  }
}
export type LayerSet = Layer[];

export class Layer {
  type: string;
  layer: LayerSet;
  x: number;
  y: number;
}