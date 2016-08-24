/*
 * surfaces.txt の内容を構造化したもの
 */

export class SurfaceDefinitionTree {
  descript: SurfaceDescript;
  surfaces: SurfaceDefinition[];
  aliases:  { [aliasname: string]: number[]; }[];
  //regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
  constructor(
    descript: SurfaceDescript=new SurfaceDescript(),
    surfaces: SurfaceDefinition[]=[],
    aliases: { [aliasname: string]: number[]; }[]=[]
  ){
    this.descript = descript;
    this.surfaces = surfaces;
    this.aliases  = aliases;
  }
}


export class SurfaceDescript {
  //version: number;
  //maxwidth: number;
  collisionSort: string;
  animationSort: string;
  constructor(collisionSort="ascend", animationSort="ascend"){
    this.collisionSort = collisionSort;
    this.animationSort = animationSort;
  }
}
export type NULL = null;// avoid vsc syntax highlighting bugs
export class SurfaceDefinition {
  //characters: { sakura: string; }; // 謎
  points: {
    //centerx: number; centery: number; // SakuraAPI なにそれ
    basepos: { x: number|NULL, y: number|NULL };
  };
  balloons: {
    char: { offsetX: number; offsetY: number }[];
    offsetX: number;
    offsetY: number;
  };
  collisions: SurfaceCollision[];
  animations: SurfaceAnimation[];
  elements:   SurfaceElement[];
  constructor(
    elements:SurfaceElement[]=[],
    collisions:SurfaceCollision[]=[],
    animations:SurfaceAnimation[]=[],
    balloons: {
      char: { offsetX: number; offsetY: number }[];
      offsetX: number;
      offsetY: number;
    }={char: [], offsetX: 0, offsetY: 0},
    points:{
      basepos: { x: number|NULL, y: number|NULL }
    }={basepos: { x: null, y: null }
  }){
    this.elements   = elements;
    this.collisions = collisions;
    this.animations = animations;
    this.points     = points
    this.balloons   = balloons;
  }
}

export class SurfaceElement {
  type: string;
  file: string;
  x: number;
  y: number;
  constructor(type: string, file: string, x=0, y=0){
    this.type = "overlay";
    this.file = file;
    this.x = x;
    this.y = y;
  }
}

export class SurfaceCollision {
  name: string;
  type: string;
  constructor(type: string, name: string){
    this.name = name;
    this.type = type;
  }
}



export class SurfaceCollisionRect extends SurfaceCollision {
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(name: string, left: number, top: number, right: number, bottom: number){
    super("rect", name);
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}

export class SurfaceCollisionEllipse extends SurfaceCollision {
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(name: string, left: number, top: number, right: number, bottom: number){
    super("ellipse", name);
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}

export class SurfaceCollisionCircle extends SurfaceCollision {
  centerX: number;
  centerY: number;
  radius: number;
  constructor(name: string, centerX: number, centerY: number, radius: number){
    super("circle", name);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  }
}

export class SurfaceCollisionPolygon extends SurfaceCollision {
  coordinates: { x: number; y: number; }[];
  constructor(name: string, coordinates:{ x: number; y: number; }[] ){
    super("polygon", name);
    this.coordinates = coordinates;
  }
}



export class SurfaceAnimation {
  intervals: [string, number[]][]; // [command, args]
  options: [string, number[]][]; // [command, args]
  collisions: SurfaceCollision[];
  patterns:   SurfaceAnimationPattern[];
  constructor(
    intervals:[string, number[]][] = [["never", []]],
    options:[string, number[]][]=[],
    collisions:SurfaceCollision[]=[],
    patterns:SurfaceAnimationPattern[]=[]  
  ){
    this.intervals = intervals;
    this.options = options;
    this.collisions = collisions;
    this.patterns = patterns;
  }
}

export class SurfaceAnimationPattern {
  type: string;
  surface: number;
  wait: [number, number];
  x: number;
  y: number;
  animation_ids: number[];
  constructor(
    type="ovelay",
    surface=-1,
    wait:[number, number]=[0, 0],
    x=0,
    y=0,
    animation_ids:number[]=[]
  ){
    this.type = type;
    this.surface = surface;
    this.wait = wait;
    this.x = x;
    this.y = y;
    this.animation_ids = animation_ids;
  }
}


export function isBack(anim: SurfaceAnimation): boolean{
  return anim.options.some(([opt, args])=> opt === "background");
}


export function getExclusives(anim: SurfaceAnimation): number[]{
  return anim.options.filter(([opt, args])=> opt === "exclusive").reduce<number[]>((l,[opt, args])=> l.concat(args), []);
}


export function getRegion(collisions: SurfaceCollision[], offsetX: number, offsetY: number): string {
  // このサーフェスの定義 surfaceNode.collision と canvas と座標を比較して
  // collision設定されていれば name"hoge"
  // basepos 左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べる
  // offsetX: number, offsetY: number は surfaceCanvas.basePosX からの相対座標である必要がある、間違ってもcanvas左上からにしてはいけない 

  const hitCols = collisions.filter((collision, colId)=>{
    const {type, name} = collision;
    switch(collision.type){
      case "rect":
        var {left, top, right, bottom} = <SurfaceCollisionRect>collision;
        return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
               (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
      case "ellipse":
        var {left, top, right, bottom} = <SurfaceCollisionEllipse>collision;
        const width = Math.abs(right - left);
        const height = Math.abs(bottom - top);
        return Math.pow((offsetX-(left+width/2))/(width/2), 2) +
               Math.pow((offsetY-(top+height/2))/(height/2), 2) < 1;
      case "circle":
        const {radius, centerX, centerY} = <SurfaceCollisionCircle>collision;
        return Math.pow((offsetX-centerX)/radius, 2)+Math.pow((offsetY-centerY)/radius, 2) < 1;
      case "polygon":
        const {coordinates} = <SurfaceCollisionPolygon>collision;
        const ptC = {x:offsetX, y:offsetY};
        const tuples = coordinates.reduce<[{x:number,y:number},{x:number,y:number}][]>(((arr, {x, y}, i)=>{
          arr.push([
            coordinates[i],
            (!!coordinates[i+1] ? coordinates[i+1] : coordinates[0])
          ]);
          return arr;
        }), []);
        // TODO: acos使わない奴に変える
        const deg = tuples.reduce(((sum, [ptA, ptB])=>{
          const vctA = [ptA.x-ptC.x, ptA.y-ptC.y];
          const vctB = [ptB.x-ptC.x, ptB.y-ptC.y];
          const dotP = vctA[0]*vctB[0] + vctA[1]*vctB[1];
          const absA = Math.sqrt(vctA.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
          const absB = Math.sqrt(vctB.map((a)=> Math.pow(a, 2)).reduce((a, b)=> a+b));
          const rad = Math.acos(dotP/(absA*absB))
          return sum + rad;
        }), 0)
        return deg/(2*Math.PI) >= 1;
      default:
        console.warn("SurfaceTree.getRegion: unkown collision type:", this.surfaceId, colId, name, collision);
        return false;
    }
  });
  if(hitCols.length > 0){
    return hitCols[hitCols.length-1].name;
  }
  return "";
}
