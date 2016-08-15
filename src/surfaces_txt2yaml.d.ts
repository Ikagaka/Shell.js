// Type definitions for text-encoding
// Project: https://github.com/Narazaka/surfaces_yaml
// Definitions by: Legokichi Duckscallion Pine <https://github.com/legokichi/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface SurfacesTxt {
  charset: string;
  descript: SurfaceDescript;
  surfaces: { [key: string]: SurfaceDefinition; };
  aliases: { [scope: string]: { [aliasname: string]: number[]; }; };
  regions: { [scope: string]: {[regionName: string]: ToolTipElement}; };
}

interface ToolTipElement {
  tooltip: string;
  cursor: {
    mouseup: string;
    mousedown: string;
  };
}
interface SurfaceDescript {
  version: number;
  maxwidth: number;
  "collision-sort": string;
  "animation-sort": string;
}

interface SurfaceDefinition {
  is: number;
  characters: { sakura: string; };
  points: {
    centerx: number;
    centery: number;
    kinoko: { centerx: number; centery: number; },
    basepos: { x: number; y: number; };
  };
  balloons: {
    sakura: { offsetx: number; offsety: number; };
    offsetx: number;
    offsety: number;
  };
  regions: { [key: string]: SurfaceRegion; };
  animations: { [key: string]: SurfaceAnimation; };
  elements: { [key: string]: ElementPattern; };
  base: string[];
}

interface ElementPattern {
  is: number,
  type: string,
  file: string,
  x: number,
  y: number
}

interface SurfaceAnimation {
  is: number;
  interval: string;
  option: string;
  patterns: SurfaceAnimationPattern[];
  regions: { [key: string]: SurfaceRegion; };
}

interface SurfaceAnimationPatternBase {
  // 'overlay', 'overlayfast', 'reduce', 'replace', 'interpolate', 'asis', 'bind', 'add', 'reduce', 'move'
  type: string;
  surface: number;
  wait: string;
  x: number;
  y: number;
}

interface SurfaceAnimationPatternAlternative extends SurfaceAnimationPatternBase {
  // 'alternativestart', 'alternativestop'
  animation_ids: number[];
}

interface SurfaceAnimationPatternInsert extends SurfaceAnimationPatternBase {
  //  'insert', 'start', 'stop'
  animation_id: string;
}

declare type SurfaceAnimationPattern = SurfaceAnimationPatternBase | SurfaceAnimationPatternAlternative | SurfaceAnimationPatternInsert;

interface SurfaceRegionBase {
  is: number;
  name: string;
  type: string;
}

interface SurfaceRegionRect extends SurfaceRegionBase {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface SurfaceRegionCircle extends SurfaceRegionBase {
  center_x: number;
  center_y: number;
  radius: number;
}

interface SurfaceRegionEllipse extends SurfaceRegionBase {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface SurfaceRegionPolygon extends SurfaceRegionBase {
  coordinates: { x: number; y: number; }[];
}

declare type SurfaceRegion = SurfaceRegionRect | SurfaceRegionCircle | SurfaceRegionEllipse | SurfaceRegionPolygon;

declare module SurfacesTxt2Yaml {
  export function txt_to_data(text: string, option?: {}): SurfacesTxt;
}

declare module "surfaces_txt2yaml" {
  export = SurfacesTxt2Yaml;
}
