
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

export class SurfaceDefinition {
  //characters: { sakura: string; }; // 謎
  points: {
    //centerx: number; centery: number; SakuraAPI // なにそれ
    basepos: { x: number; y: number; };
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
    balloons={char: <{ offsetX: number; offsetY: number }[]>[], offsetX: 0, offsetY: 0},
    points={basepos: { x: 0, y: 0 }}){
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
  constructor(type="overlay", file="", x=0, y=0){
    this.type = "overlay";
    this.file = file;
    this.x = x;
    this.y = y;
  }
}

export class SurfaceCollision {
  name: string;
  type: string;
  constructor(name="", type="rect"){
    this.name = name;
    this.type = type;
  }
}



export class SurfaceCollisionRect extends SurfaceCollision {
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(name="", type="rect", left=0, top=0, right=0, bottom=0){
    super(name, type);
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}

export class SurfaceCollisionEllipse extends SurfaceCollisionRect {
  constructor(name="", type="ellipse", top=0, bottom=0, left=0, right=0){
    super(name, type, bottom, top, left, right);
  }
}

export class SurfaceCollisionCircle extends SurfaceCollision {
  centerX: number;
  centerY: number;
  radius: number;
  constructor(name="", type="circle", centerX=0, centerY=0, radius=0){
    super(name, type);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  }
}

export class SurfaceCollisionPolygon extends SurfaceCollision {
  coordinates: { x: number; y: number; }[];
  constructor(name="", type="polygon", coordinates=<{ x: number; y: number; }[]>[]){
    super(name, type);
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
    patterns:SurfaceAnimationPattern[]=[]){
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
