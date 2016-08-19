/// <reference path="../typings/index.d.ts"/>

import * as SU from "./SurfaceUtil";
import * as SY from "surfaces_txt2yaml";
import $ = require("jquery");

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

export function loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(srfsTxt: SY.SurfacesTxt): Promise<SurfaceDefinitionTree>{
  const _descript = srfsTxt.descript != null ? srfsTxt.descript : <SY.SurfaceDescript>{};
  const _surfaces = srfsTxt.surfaces != null ? srfsTxt.surfaces : {};
  const _aliases  = srfsTxt.aliases  != null ? srfsTxt.aliases : {};
  return loadSurfaceDescript(_descript)
  .then((descript)=>{
    const surfaces:SurfaceDefinition[] = [];
    Object.keys(_surfaces).forEach((surfaceName)=>{
      // typoef is === number なら実体のあるサーフェス定義
      if(typeof _surfaces[surfaceName].is === "number"){
        let parents: SY.SurfaceDefinition[] = [];
        if(Array.isArray(_surfaces[surfaceName].base)){
          // .append持ってるので継承
          parents = _surfaces[surfaceName].base.map((parentName)=> _surfaces[parentName]);
        }
        let srf = <SY.SurfaceDefinition>{};
        $.extend.apply($, [true, srf, _surfaces[surfaceName]].concat(parents));
        loadSurfaceDefinition(srf)
        .then((srfDef)=>{ surfaces[_surfaces[surfaceName].is] = srfDef; })
        .catch(console.warn.bind(console));
      }
    })
    return {descript, surfaces};
  }).then(({descript, surfaces})=>{
    const aliases = <{ [aliasname: string]: number[]; }[]>[];
    Object.keys(_aliases).forEach((scope)=>{
      // scope: sakura, kero, char2... => 0, 1, 2
      const scopeID = SU.unscope(scope);
      aliases[scopeID] = _aliases[scope];
    });
    return {descript, surfaces, aliases};
  }).then(({descript, surfaces, aliases})=>{
    const that = new SurfaceDefinitionTree(descript, surfaces, aliases);
    return Promise.resolve(that);
  });
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
export function loadSurfaceDescript(descript: SY.SurfaceDescript): Promise<SurfaceDescript>{
  // collision-sort: string => collisionSort: boolean
  const collisionSort = descript["collision-sort"] === "ascend"  ? "ascend"
                      : descript["collision-sort"] === "descend" ? "descend"
                      : "ascend";
  const animationSort = descript["animation-sort"] === "ascend"  ? "ascend"
                      : descript["animation-sort"] === "descend" ? "descend"
                      : "ascend";
  let that = new SurfaceDescript(collisionSort, animationSort);
  return Promise.resolve(that);
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

function loadSurfaceDefinition(srf: SY.SurfaceDefinition): Promise<SurfaceDefinition>{
  const _points = srf.points;
  const _balloons = srf.balloons;
  const _elements   = srf.elements;
  const _collisions = srf.regions;
  const _animations = srf.animations;
  const balloons   = {char: <{ offsetX: number; offsetY: number }[]>[], offsetX: 0, offsetY: 0}
  const points     = {basepos: { x: 0, y: 0 }};
  if(_points != null && _points.basepos != null){
    if(typeof _points.basepos.x === "number"){
      points.basepos.x = _points.basepos.x;
    }
    if(typeof _points.basepos.y === "number"){
      points.basepos.y = _points.basepos.y;
    }
  }
  if(_balloons != null){
    if(typeof _balloons.offsetx === "number"){
      balloons.offsetX = _balloons.offsetx;
    }
    if(typeof _balloons.offsety === "number"){
      balloons.offsetY = _balloons.offsety;
    }
    Object.keys(_balloons).filter((key)=> /sakura$|kero$|char\d+/.test(key)).forEach((charName)=>{
      const charID = SU.unscope(charName);
      if(typeof _balloons[charName].offsetx === "number"){
        balloons.char[charID] = balloons.char[charID] != null ? balloons.char[charID] : {offsetX: 0, offsetY: 0};
        balloons.char[charID].offsetX = _balloons[charName].offsetx;
      }
      if(typeof _balloons[charName].offsety === "number"){
        balloons.char[charID] = balloons.char[charID] != null ? balloons.char[charID] : {offsetX: 0, offsetY: 0};
        balloons.char[charID].offsetY = _balloons[charName].offsety;
      }
    });
  }
  const elements = <SurfaceElement[]>[];
  if(_elements != null){
    Object.keys(_elements).forEach((id)=>
      loadSurfaceElement(_elements[id])
      .then((def)=>{ elements[_elements[id].is] = def; })
      .catch(console.warn.bind(console)) );
  }
  const collisions = <SurfaceCollision[]>[];
  if(_collisions != null){
    Object.keys(_collisions).forEach((id)=>
      loadSurfaceCollision(_collisions[id])
      .then((def)=>{ collisions[_collisions[id].is] = def; })
      .catch(console.warn.bind(console)) )
  }
  const animations = <SurfaceAnimation[]>[];
  if(_animations != null){
    Object.keys(_animations).forEach((id)=>
          loadSurfaceAnimation(_animations[id])
          .then((def)=>{ animations[_animations[id].is] = def; })
          .catch(console.warn.bind(console)) )
  }
  const that = new SurfaceDefinition(elements, collisions, animations, balloons, points);
  return Promise.resolve(that);
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

export function loadSurfaceElement(elm: SY.ElementPattern): Promise<SurfaceElement>{
  if(!(typeof elm.file === "string" &&
      typeof elm.type === "string")){
    console.warn("SurfaceTree.loadFromsurfacesTxt2Yaml: wrong parameters", elm)
    return Promise.reject(elm);
  }
  const file = elm.file;
  const type = elm.type;
  if(typeof elm.x === "number"){
    var x = elm.x;
  }else{
    var x = 0;
    console.warn("SurfaceTree.loadSurfaceElement: faileback to", x);
  }
  if(typeof elm.y === "number"){
    var y = elm.y;
  }else{
    var y = 0;
    console.warn("SurfaceTree.loadSurfaceElement: faileback to", y);
  }
  const that = new SurfaceElement(type, file, x, y);
  return Promise.resolve(that);
}


export class SurfaceCollision {
  name: string;
  type: string;
  constructor(name="", type="rect"){
    this.name = name;
    this.type = type;
  }
}

export function loadSurfaceCollision(collision: SY.SurfaceRegion): Promise<SurfaceCollision>{
  switch(collision.type){
    case "rect":    return loadSurfaceCollisionRect(<SY.SurfaceRegionRect   >collision);
    case "circle":  return loadSurfaceCollisionCircle(<SY.SurfaceRegionCircle >collision);
    case "ellipse": return loadSurfaceCollisionEllipse(<SY.SurfaceRegionEllipse>collision);
    case "polygon": return loadSurfaceCollisionPolygon(<SY.SurfaceRegionPolygon>collision);
    default:
      console.warn("SurfaceTree.loadSurfaceCollision: unknow collision type", collision.type, ", failback to rect");
      collision.type = "rect";
      return loadSurfaceCollisionRect(<SY.SurfaceRegionRect   >collision);
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

export function loadSurfaceCollisionRect(collision: SY.SurfaceRegionRect): Promise<SurfaceCollisionRect>{
  if(!(typeof collision.left === "number" &&
      typeof collision.top === "number" &&
      typeof collision.bottom === "number" &&
      typeof collision.right === "number")){
    console.warn("SurfaceTree.loadSurfaceCollisionRect: unkown parameter", collision);
    return Promise.reject(collision);
  }
  const name = collision.name;
  const type = collision.type;
  const top = collision.top;
  const left = collision.left;
  const bottom = collision.bottom;
  const right = collision.right;
  const that = new SurfaceCollisionRect(name, type, top, left, bottom, right);
  return Promise.resolve(that);
}

export class SurfaceCollisionEllipse extends SurfaceCollisionRect {
  constructor(name="", type="ellipse", top=0, bottom=0, left=0, right=0){
    super(name, type, bottom, top, left, right);
  }
}

export function loadSurfaceCollisionEllipse(a: SY.SurfaceRegionEllipse): Promise<SurfaceCollisionEllipse>{
  return loadSurfaceCollisionRect(a)
  .then((b)=> new SurfaceCollisionEllipse(b.name, b.type, b.top, b.bottom, b.left, b.right));
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

export function loadSurfaceCollisionCircle(collision: SY.SurfaceRegionCircle): Promise<SurfaceCollisionCircle>{
  if(!(typeof collision.center_y === "number" &&
      typeof collision.center_y === "number" &&
      typeof collision.radius === "number")){
    console.warn("SurfaceTree.loadSurfaceCollisionCircle: unkown parameter", collision);
    return Promise.reject(collision);
  }
  const name = collision.name;
  const type = collision.type;
  const centerX = collision.center_x;
  const centerY = collision.center_y;
  const radius = collision.radius;
  const that = new SurfaceCollisionCircle(name, type, centerX, centerY, radius);
  return Promise.resolve(that);
}


export class SurfaceCollisionPolygon extends SurfaceCollision {
  coordinates: { x: number; y: number; }[];
  constructor(name="", type="polygon", coordinates=<{ x: number; y: number; }[]>[]){
    super(name, type);
    this.coordinates = coordinates;
  }
}

export function loadSurfaceCollisionPolygon(col: SY.SurfaceRegionPolygon): Promise<SurfaceCollisionPolygon>{
  const name = col.name;
  const type = col.type;
  const _coordinates = col.coordinates !=  null     ? col.coordinates : [];
  if(_coordinates.length < 2){
    console.warn("SurfaceTree.loadSurfaceCollisionPolygon: coordinates need more than 3", col);
    return Promise.reject(col);
  }
  if(_coordinates.every((o)=> typeof o.x !== "number" || typeof o.y !== "number")){
    console.warn("SurfaceTree.loadSurfaceCollisionPolygon: coordinates has erro value", col);
    return Promise.reject(col);
  }
  const coordinates = _coordinates
  const that = new SurfaceCollisionPolygon(name, type, coordinates);
  return Promise.resolve(that);
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

export function loadSurfaceAnimation(animation: SY.SurfaceAnimation): Promise<SurfaceAnimation>{
  const _interval = typeof animation.interval === "string" ? animation.interval : "";
  const _option   = typeof animation.option   === "string" ? animation.option   : "";
  const _regions  =        animation.regions  !=  null     ? animation.regions  : {};
  const _patterns =        animation.patterns !=  null     ? animation.patterns : [];
  // animation*.option,* の展開
  // animation*.option,exclusive+background,(1,3,5)
  const [__option, ...opt_args] = _option.split(",");
  const _opt_args = opt_args.map((str)=> Number(str.replace("(", "").replace(")", "")));
  const _options = _option.split("+");
  const options = _options.map<[string, number[]]>((option)=> [option.trim(), _opt_args]);
  // bind+sometimes+talk,3
  const [__interval, ...int_args] = _interval.split(",");
  const _int_args = int_args.map((str)=> Number(str));
  const _intervals = __interval.split("+");
  const intervals = _intervals.map<[string, number[]]>((interval)=> [interval.trim(), _int_args]);
  const collisions:SurfaceCollision[] = [];
  Object.keys(_regions).forEach((key)=>{
    loadSurfaceCollision(_regions[key])
    .then((col)=>{ collisions[_regions[key].is] = col; })
    .catch(console.warn.bind(console));
  });
  const patterns:SurfaceAnimationPattern[] = [];
  _patterns.forEach((pat, patId)=>{
    loadSurfaceAnimationPattern(pat)
    .then((pat)=>{ patterns[patId] = pat; })
    .catch(console.warn.bind(console));
  });
  const that = new SurfaceAnimation(intervals, options, collisions, patterns);
  return Promise.resolve(this);
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

export function loadSurfaceAnimationPattern(pat: SY.SurfaceAnimationPattern): Promise<SurfaceAnimationPattern>{
  const type = pat.type;
  const surface = pat.surface;
  let [a, b] = (/(\d+)(?:\-(\d+))?/.exec(pat.wait) || ["", "0", ""]).slice(1).map(Number);
  if(!isFinite(a)){
    if(!isFinite(b)){
      console.warn("SurfaceTree.loadSurfaceAnimationPattern: cannot parse wait", pat, ", failback to", 0);
      a = b = 0;
    }else{
      console.warn("SurfaceTree.loadSurfaceAnimationPattern: cannot parse wait", a, ", failback to", b);
      a = b;
    }
  }
  const wait:[number,number] = isFinite(b)
              ? [a, b]
              : [a, a];
  const x = pat.x;
  const y = pat.y;
  if(pat["animation_ids"] != null && pat["animation_id"] != null){
    console.warn("SurfaceTree.loadSurfaceAnimationPattern: something wrong", pat);
  }
  const animation_ids:number[] = Array.isArray(pat["animation_ids"])
                               ? [Number(pat["animation_id"])] 
                               : pat["animation_ids"];
  const that = new SurfaceAnimationPattern(type, surface, wait, x, y, animation_ids);
  return Promise.resolve(that);
}
