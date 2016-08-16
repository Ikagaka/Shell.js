/// <reference path="../typings/index.d.ts"/>

import {SurfaceCanvas} from "./Interfaces"
import * as SU from "./SurfaceUtil";
import $ = require("jquery");

export class SurfaceDefinitionTree {
  descript: SurfaceDescript;
  surfaces: SurfaceDefinition[];
  aliases:  { [aliasname: string]: number[]; }[];
  //regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
  constructor(){
    this.descript = new SurfaceDescript();
    this.surfaces = [];
    this.aliases  = [];
  };
  loadFromsurfacesTxt2Yaml(srfsTxt: SurfacesTxt2Yaml.SurfacesTxt): Promise<this>{
    const descript = srfsTxt.descript != null ? srfsTxt.descript : <SurfacesTxt2Yaml.SurfaceDescript>{};
    const surfaces = srfsTxt.surfaces != null ? srfsTxt.surfaces : {};
    const aliases  = srfsTxt.aliases  != null ? srfsTxt.aliases : {};
    new SurfaceDescript().loadFromsurfacesTxt2Yaml(descript)
    .then((descriptDef)=>{ this.descript = descriptDef; })
    .catch(console.warn.bind(console));
    Object.keys(surfaces).forEach((surfaceName)=>{
      // typoef is === number なら実体のあるサーフェス定義
      if(typeof surfaces[surfaceName].is === "number"){
        let parents: SurfacesTxt2Yaml.SurfaceDefinition[] = [];
        if(Array.isArray(surfaces[surfaceName].base)){
          // .append持ってるので継承
          parents = surfaces[surfaceName].base.map((parentName)=> surfaces[parentName]);
        }
        let srf = <SurfacesTxt2Yaml.SurfaceDefinition>{};
        $.extend.apply($, [true, srf, surfaces[surfaceName]].concat(parents));
        new SurfaceDefinition().loadFromsurfacesTxt2Yaml(srf)
        .then((srfDef)=>{ this.surfaces[surfaces[surfaceName].is] = srfDef; })
        .catch(console.warn.bind(console));
      }
    });
    Object.keys(aliases).forEach((scope)=>{
      // scope: sakura, kero, char2... => 0, 1, 2
      const scopeID = SU.unscope(scope);
      this.aliases[scopeID] = aliases[scope];
    });
    return Promise.resolve(this);
  }
}

export class SurfaceDescript {
  //version: number;
  //maxwidth: number;
  collisionSort: string;
  animationSort: string;
  constructor(){
    this.collisionSort = "ascend";
    this.animationSort = "ascend";
  }
  loadFromsurfacesTxt2Yaml(descript: SurfacesTxt2Yaml.SurfaceDescript): Promise<this>{
    // collision-sort: string => collisionSort: boolean
    if (descript["collision-sort"] != null){
      this.collisionSort = descript["collision-sort"] === "ascend"  ? "ascend"
                         : descript["collision-sort"] === "descend" ? "descend"
                         : (console.warn("SurfaceDescript#loadFromsurfacesTxt2Yaml: collision-sort ", descript["collision-sort"], "is not supported"),
                           this.collisionSort)
    }
    if(descript["animation-sort"] != null){
      this.animationSort = descript["animation-sort"] === "ascend"  ? "ascend"
                         : descript["animation-sort"] === "descend" ? "descend"
                         : (console.warn("SurfaceDescript#loadFromsurfacesTxt2Yaml: animation-sort ", descript["animation-sort"], "is not supported"),
                           this.animationSort)
    }
    return Promise.resolve(this);
  }
}

export class SurfaceDefinition {
  //characters: { sakura: string; }; // 謎
  points: {
    //centerx: number; centery: number; SakuraAPI // なにそれ
    basepos: { x: number; y: number; };
  };
  balloons: {
    char: { [scopeID: number]: { offsetX: number; offsetY: number; }; };
    offsetX: number;
    offsetY: number;
  };
  collisions: SurfaceCollision[];
  animations: SurfaceAnimation[];
  elements:   SurfaceElement[];
  base: SurfaceCanvas;
  constructor(){
    this.points = {basepos: { x: 0, y: 0 }};
    this.balloons = {char: [], offsetX: 0, offsetY: 0};
    this.elements   = [];
    this.collisions = [];
    this.animations = [];
    this.base = {cnv:null, png: null, pna: null};
  }
  loadFromsurfacesTxt2Yaml(srf: SurfacesTxt2Yaml.SurfaceDefinition): Promise<this>{
    const points = srf.points;
    const balloons = srf.balloons;
    const elements   = srf.elements;
    const collisions = srf.regions;
    const animations = srf.animations;
    if(points != null && points.basepos != null){
      if(typeof points.basepos.x === "number"){
        this.points.basepos.x = points.basepos.x;
      }
      if(typeof points.basepos.y === "number"){
        this.points.basepos.y = points.basepos.y;
      }
    }
    if(balloons != null){
      if(typeof balloons.offsetx === "number"){
        this.balloons.offsetX = balloons.offsetx;
      }
      if(typeof balloons.offsety === "number"){
        this.balloons.offsetY = balloons.offsety;
      }
      Object.keys(balloons).filter((key)=> /sakura$|kero$|char\d+/.test(key)).forEach((charName)=>{
        const charID = SU.unscope(charName);
        if(typeof balloons[charName].offsetx === "number"){
          this.balloons.char[charID] = this.balloons.char[charID] != null ? this.balloons.char[charID] : {offsetX: 0, offsetY: 0};
          this.balloons.char[charID].offsetX = balloons[charName].offsetx;
        }
        if(typeof balloons[charName].offsety === "number"){
          this.balloons.char[charID] = this.balloons.char[charID] != null ? this.balloons.char[charID] : {offsetX: 0, offsetY: 0};
          this.balloons.char[charID].offsetY = balloons[charName].offsety;
        }
      });
    }
    if(elements != null){
      Object.keys(elements).forEach((id)=>{
        new SurfaceElement().loadFromsurfacesTxt2Yaml(elements[id])
        .then((def)=>{ this.elements[elements[id].is] = def; })
        .catch(console.warn.bind(console));
      });
    }
    if(collisions != null){
      Object.keys(collisions).forEach((id)=>{
        new SurfaceCollision().loadFromsurfacesTxt2Yaml(collisions[id])
        .then((def)=>{ this.collisions[collisions[id].is] = def; })
        .catch(console.warn.bind(console));
      });
    }
    if(animations != null){
      Object.keys(animations).forEach((id)=>{
        new SurfaceAnimation().loadFromsurfacesTxt2Yaml(animations[id])
        .then((def)=>{ this.animations[animations[id].is] = def; })
        .catch(console.warn.bind(console));
      });
    }
    return Promise.resolve(this);
  }
}

export class SurfaceElement {
  type: string;
  file: string;
  x: number;
  y: number;
  canvas: SurfaceCanvas;
  constructor(){
    this.type = "overlay";
    this.file = "";
    this.x = 0;
    this.y = 0;
    this.canvas = {cnv: null, png: null, pna: null};
  }
  loadFromsurfacesTxt2Yaml(elm: SurfacesTxt2Yaml.ElementPattern): Promise<this>{
    if(!(typeof elm.file === "string" &&
       typeof elm.type === "string")){
      console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: wrong parameters", elm)
      return Promise.reject(elm);
    }else{
      this.file = elm.file;
      this.type = elm.type;
    }
    if(typeof elm.x === "number"){
      this.x = elm.x;
    }else{
      console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: faileback to", this.x);
    }
    if(typeof elm.y === "number"){
      this.y = elm.y;
    }else{
      console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: faileback to", this.y);
    }
    return Promise.resolve(this);
  }
}

export class SurfaceCollision {
  name: string;
  type: string;
  constructor(){
    this.name = "";
    this.type = "";
  }
  loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegion): Promise<SurfaceCollision>{
    switch(collision.type){
      case "rect":    return new SurfaceCollisionRect(   ).loadFromsurfacesTxt2Yaml(<SurfacesTxt2Yaml.SurfaceRegionRect   >collision);
      case "circle":  return new SurfaceCollisionCircle( ).loadFromsurfacesTxt2Yaml(<SurfacesTxt2Yaml.SurfaceRegionCircle >collision);
      case "ellipse": return new SurfaceCollisionEllipse().loadFromsurfacesTxt2Yaml(<SurfacesTxt2Yaml.SurfaceRegionEllipse>collision);
      case "polygon": return new SurfaceCollisionPolygon().loadFromsurfacesTxt2Yaml(<SurfacesTxt2Yaml.SurfaceRegionPolygon>collision);
      default:
        console.warn("SurfaceCollision#loadFromsurfacesTxt2Yaml: unknow collision type", collision.type, ", failback to rect");
        this.type = "rect";
        return new SurfaceCollisionRect(   ).loadFromsurfacesTxt2Yaml(<SurfacesTxt2Yaml.SurfaceRegionRect   >collision);
    }
  }
}

export class SurfaceCollisionRect extends SurfaceCollision {
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(){
    super();
    this.type = "rect";
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
  }
  loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegionRect): Promise<this>{
    this.name = collision.name;
    this.type = collision.type;
    if(!(typeof collision.left === "number" &&
       typeof collision.top === "number" &&
       typeof collision.bottom === "number" &&
       typeof collision.right === "number")){
      console.warn(this.constructor.toString(), "#loadFromsurfacesTxt2Yaml: unkown parameter", collision);
      return Promise.reject(collision);
    }
    this.top = collision.top;
    this.left = collision.left;
    this.bottom = collision.bottom;
    this.right = collision.right;
    return Promise.resolve(this);
  }
}

export class SurfaceCollisionCircle extends SurfaceCollision {
  centerX: number;
  centerY: number;
  radius: number;
  constructor(){
    super();
    this.type = "circle";
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
  }
  loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegionCircle): Promise<this>{
    this.name = collision.name;
    this.type = collision.type;
    if(!(typeof collision.center_y === "number" &&
       typeof collision.center_y === "number" &&
       typeof collision.radius === "number")){
      console.warn("SurfaceCollisionCircle#loadFromsurfacesTxt2Yaml: unkown parameter", collision);
      return Promise.reject(collision);
    }
    this.centerX = collision.center_x;
    this.centerY = collision.center_y;
    this.radius = collision.radius;
    return Promise.resolve(this);
  }
}

export class SurfaceCollisionEllipse extends SurfaceCollisionRect {
  constructor(){
    super();
    this.type = "ellipse";
  }
}

export class SurfaceCollisionPolygon extends SurfaceCollision {
  coordinates: { x: number; y: number; }[];
  constructor(){
    super();
    this.type = "polygon";
    this.coordinates = [];
  }
  loadFromsurfacesTxt2Yaml(col: SurfacesTxt2Yaml.SurfaceRegionPolygon): Promise<this>{
    this.name = col.name;
    this.type = col.type;
    const coordinates = col.coordinates !=  null     ? col.coordinates : [];
    if(coordinates.length < 2){
      console.warn("SurfaceRegionPolygon#loadFromsurfacesTxt2Yaml: coordinates need more than 3", col);
      return Promise.reject(col);
    }
    if(coordinates.every((o)=> typeof o.x !== "number" || typeof o.y !== "number")){
      console.warn("SurfaceRegionPolygon#loadFromsurfacesTxt2Yaml: coordinates has erro value", col);
      return Promise.reject(col);
    }
    this.coordinates = coordinates
    return Promise.resolve(this);
  }
}

export class SurfaceAnimation {
  intervals: [string, string[]][]; // [command, args]
  options: [string, string[]][]; // [command, args]
  collisions: SurfaceCollision[];
  patterns:   SurfaceAnimationPattern[];
  constructor(){
    this.intervals = [["never", []]];
    this.options = [];
    this.collisions = [];
    this.patterns = [];
  }
  loadFromsurfacesTxt2Yaml(animation: SurfacesTxt2Yaml.SurfaceAnimation): Promise<this>{
    const interval = typeof animation.interval === "string" ? animation.interval : "";
    const option   = typeof animation.option   === "string" ? animation.option   : "";
    const regions  =        animation.regions  !=  null     ? animation.regions  : {};
    const patterns =        animation.patterns !=  null     ? animation.patterns : [];
    // animation*.option,* の展開
    // animation*.option,exclusive+background,(1,3,5)
    const [_option, ...opt_args] = option.split(",");
    const _opt_args = opt_args.map((str)=> str.replace("(", "").replace(")", "").trim());
    const options = option.split("+");
    this.options = options.map<[string, string[]]>((option)=> [option.trim(), _opt_args]);
    // bind+sometimes+talk,3
    const [_interval, ...int_args] = interval.split(",");
    const _int_args = int_args.map((str)=> str.trim());
    const intervals = _interval.split("+");
    this.intervals = intervals.map<[string, string[]]>((interval)=> [interval.trim(), _int_args]);
    Object.keys(regions).forEach((key)=>{
      new SurfaceCollision().loadFromsurfacesTxt2Yaml(regions[key])
      .then((col)=>{ this.collisions[regions[key].is] = col; })
      .catch(console.warn.bind(console));
    });
    patterns.forEach((pat, patId)=>{
      new SurfaceAnimationPattern().loadFromsurfacesTxt2Yaml(pat)
      .then((pat)=>{ this.patterns[patId] = pat; })
      .catch(console.warn.bind(console));
    });
    return Promise.resolve(this);
  }
}

export class SurfaceAnimationPattern {
  type: string;
  surface: number;
  wait: [number, number];
  x: number;
  y: number;
  animation_ids: number[];
  constructor(){
    this.type = "ovelay"
    this.surface = -1;
    this.wait = [0, 0];
    this.x = 0;
    this.y = 0;
    this.animation_ids = [];
  }
  loadFromsurfacesTxt2Yaml(pat: SurfacesTxt2Yaml.SurfaceAnimationPattern): Promise<this>{
    this.type = pat.type;
    this.surface = pat.surface;
    let [a, b] = (/(\d+)(?:\-(\d+))?/.exec(pat.wait) || ["", "0", ""]).slice(1).map(Number);
    if(!isFinite(a)){
      if(!isFinite(b)){
        console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: cannot parse wait", pat, ", failback to", 0);
        a = b = 0;
      }else{
        console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: cannot parse wait", a, ", failback to", b);
        a = b;
      }
    }
    this.wait = isFinite(b)
                ? [a, b]
                : [a, a];
    this.x = pat.x;
    this.y = pat.y;
    if(pat["animation_ids"] != null && pat["animation_id"] != null){
      console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: something wrong", pat);
    }
    if(Array.isArray(pat["animation_ids"])){
      this.animation_ids = pat["animation_ids"];
    }else if(isFinite(Number(pat["animation_id"]))){
      this.animation_ids = [Number(pat["animation_id"])];
    }
    return Promise.resolve(this);
  }
}
