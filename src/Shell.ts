/// <reference path="../typings/tsd.d.ts"/>

import {Surface} from './Surface';
import {SurfaceRender, SurfaceLayerObject} from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";

export interface SurfaceTreeNode {
  base:  HTMLCanvasElement,
  elements: SurfaceLayerObject[],
  collisions: SurfaceRegion[],
  animations: SurfaceAnimation[]
}

export class Shell {
  //public
  directory: { [filepath: string]: ArrayBuffer; }
  descript: { [key: string]: string; };
  attachedSurface: { canvas: HTMLCanvasElement, surface: Surface }[];
  surfacesTxt: SurfacesTxt;
  surfaceTree: SurfaceTreeNode[];
  cacheCanvas: { [key: string]: HTMLCanvasElement; };//keyはfilepath。element合成のときにすでに読み込んだファイルをキャッシュ
  bindgroup: {[key: number]: boolean}; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
  enableRegionDraw: boolean;


  constructor(directory: { [filepath: string]: ArrayBuffer; }) {
    this.directory = directory;
    this.attachedSurface = [];
    this.surfacesTxt = <SurfacesTxt>{};
    this.surfaceTree = [];
    this.cacheCanvas = {};
    this.bindgroup = [];
    this.enableRegionDraw = false;
  }

  load(): Promise<Shell> {
    return Promise.resolve(this)
    .then(()=> this.loadDescript()) // 1st // ←なにこれ（自問自答
    .then(()=> this.loadBindGroup()) // 2nd
    .then(()=> this.loadSurfacesTxt()) // 1st
    .then(()=> this.loadSurfaceTable()) // 1st
    .then(()=> this.loadSurfacePNG())   // 2nd
    .then(()=> this.loadCollisions()) // 3rd
    .then(()=> this.loadAnimations()) // 3rd
    .then(()=> this.loadElements()) // 3rd
    .catch((err)=>{
      console.error("Shell#load > ", err);
      return Promise.reject(err);
    });
  }

  // load descript and assign to this.descript
  loadDescript(): Promise<Shell> {
    var dir = this.directory;
    var getName = (dic: {[key: string]: any}, reg: RegExp)=>
      Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    var descript_name = getName(dir, /^descript\.txt$/i);
    if (descript_name === "") {
      console.warn("descript.txt is not found");
    } else {
      this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
    }
    return Promise.resolve(this);
  }

  // load bindgroup and assign to this.bindgroup
  loadBindGroup(): Promise<Shell> {
    var descript = this.descript;
    var grep = (dic:{[key:string]:any}, reg: RegExp)=>
      Object.keys(dic).filter((key)=> reg.test(key))
    var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)\.default/;
    grep(descript, reg).forEach((key)=>{
      var [_, charId, bindgroupId, type] = reg.exec(key);
      var maybeNum = Number(bindgroupId)
      if(isFinite(maybeNum)){
        this.bindgroup[maybeNum] = this.descript[key] === "1" ? true : false;
      }else{
        console.warn(bindgroupId + " is not numer");
      }
    });
    return Promise.resolve(this);
  }

  // load surfaces.txt
  loadSurfacesTxt(): Promise<Shell> {
    var surfaces_text_names = Object.keys(this.directory).filter((name)=> /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
    if(surfaces_text_names.length === 0) {
      console.info("surfaces.txt is not found");
    } else {
      surfaces_text_names.forEach((filename)=> {
        var text = SurfaceUtil.convert(this.directory[filename]);
        var srfs = SurfacesTxt2Yaml.txt_to_data(text, {compatible: 'ssp-lazy'});
        SurfaceUtil.extend(this.surfacesTxt, srfs);
      });
      //{ expand inherit and remove
      Object.keys(this.surfacesTxt.surfaces).forEach((name)=>{
        if(typeof this.surfacesTxt.surfaces[name].is === "number"
           && Array.isArray(this.surfacesTxt.surfaces[name].base)){
          this.surfacesTxt.surfaces[name].base.forEach((key)=>{
            SurfaceUtil.extend(this.surfacesTxt.surfaces[name], this.surfacesTxt.surfaces[key]);
          });
          delete this.surfacesTxt.surfaces[name].base;
        }
      });
      Object.keys(this.surfacesTxt.surfaces).forEach((name)=>{
        if(typeof this.surfacesTxt.surfaces[name].is === "undefined"){
          delete this.surfacesTxt.surfaces[name]
        }
      });
      //}
    }
    return Promise.resolve(this);
  }

  // load surfacetable.txt
  loadSurfaceTable(): Promise<Shell> {
    var surfacetable_name = Object.keys(this.directory).filter((name)=> /^surfacetable.*\.txt$/i.test(name))[0] || "";
    if(surfacetable_name === ""){
      console.info("surfacetable.txt is not found.")
    }else{
      var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
      // TODO
    }
    return Promise.resolve(this);
  }

  // load surface*.png and surface*.pna
  loadSurfacePNG(): Promise<Shell> {
    var surface_names = Object.keys(this.directory).filter((filename)=> /^surface(\d+)\.png$/i.test(filename));
    var prms = surface_names.map((filename)=>{
      var n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
      return this.getPNGFromDirectory(filename).then((cnv)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: cnv,
            elements: [],
            collisions: [],
            animations: []
          };
        }else{
          this.surfaceTree[n].base = cnv;
        }
      }).catch((err)=>{
        console.warn("Shell#loadSurfacePNG > " + err);
        return Promise.resolve();
      });
    });
    return Promise.all(prms).then(()=> Promise.resolve(this));
  }

  // load elements
  loadElements(): Promise<Shell>{
    var srfs = this.surfacesTxt.surfaces;
    var hits = Object.keys(srfs).filter((name)=> !!srfs[name].elements);
    var prms = hits.map((defname)=>{
      var n = srfs[defname].is;
      var elms = srfs[defname].elements;
      var _prms = Object.keys(elms).map((elmname)=>{
        var {is, type, file, x, y} = elms[elmname];
        return this.getPNGFromDirectory(file).then((canvas)=>{
          if(!this.surfaceTree[n]){
            this.surfaceTree[n] = {
              base: SurfaceUtil.createCanvas(),
              elements: [],
              collisions: [],
              animations: []
            };
          }
          this.surfaceTree[n].elements[is] = {type, canvas, x, y};
          return Promise.resolve(this);
        }).catch((err)=>{
          console.warn("Shell#loadElements > " + err);
          return Promise.resolve(this);
        });
      });
      return Promise.all(_prms).then(()=> {
        return Promise.resolve(this);
      });
    });
    return Promise.all(prms).then(()=> {
      return Promise.resolve(this);
    });
  }

  // load collisions
  loadCollisions(): Promise<Shell>{
    var srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].regions).forEach((defname)=>{
      var n = srfs[defname].is;
      var regions = srfs[defname].regions;
      Object.keys(regions).forEach((regname)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: SurfaceUtil.createCanvas(),
            elements: [],
            collisions: [],
            animations: []
          };
        }
        var {is} = regions[regname];
        this.surfaceTree[n].collisions[is] = regions[regname];
      });
    });
    return Promise.resolve(this);
  }

  // load animations
  loadAnimations(): Promise<Shell>{
    var srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].animations).forEach((defname)=>{
      var n = srfs[defname].is;
      var animations = srfs[defname].animations;
      Object.keys(animations).forEach((animname)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: SurfaceUtil.createCanvas(),
            elements: [],
            collisions: [],
            animations: []
          };
        }
        var {is, interval} = animations[animname];
        this.surfaceTree[n].animations[is] = animations[animname];
      });
    });
    return Promise.resolve(this);
  }

  hasFile(filename: string): boolean {
    return SurfaceUtil.find(Object.keys(this.directory), filename).length > 0;
  }

  getPNGFromDirectory(filename: string): Promise<HTMLCanvasElement> {
    var cached_filename = SurfaceUtil.find(Object.keys(this.cacheCanvas), filename)[0] || "";
    if(cached_filename !== ""){
      return Promise.resolve(this.cacheCanvas[cached_filename]);
    }
    if(!this.hasFile(filename)){
      filename += ".png";
      if(!this.hasFile(filename)){
        return Promise.reject<HTMLCanvasElement>(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")));
      }
      console.warn("element file " + filename + " need '.png' extension");
    }
    var _filename = SurfaceUtil.find(Object.keys(this.directory), filename)[0];
    var pnafilename = _filename.replace(/\.png$/i, ".pna");
    var _pnafilename = SurfaceUtil.find(Object.keys(this.directory), pnafilename)[0] || "";
    var pngbuf = this.directory[_filename];
    var pnabuf = this.directory[_pnafilename];
    var render = new SurfaceRender(SurfaceUtil.createCanvas());

    return SurfaceUtil.fetchImageFromArrayBuffer(pngbuf).then((img)=>{
      render.init(img);
      if(_pnafilename === ""){
        render.chromakey();
        this.cacheCanvas[_filename] = render.cnv;
        return render.cnv;
      }
      return SurfaceUtil.fetchImageFromArrayBuffer(pnabuf).then((pnaimg)=>{
        render.pna(SurfaceUtil.copy(pnaimg));
        this.cacheCanvas[_filename] = render.cnv;
        return render.cnv;
      });
    });
  }

  attachSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number|string): Surface {
    var type = SurfaceUtil.scope(scopeId);
    if(typeof surfaceId === "string"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        var _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else throw new Error("ReferenceError: surface alias scope:" + type+ ", id:" + surfaceId + " is not defined.");
    }else if(typeof surfaceId === "number"){
      var _surfaceId = surfaceId;
    }else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
    var tuple = this.attachedSurface.filter((tuple)=> tuple[0] === canvas)[0];
    if(!!tuple) throw new Error("ReferenceError: this HTMLCanvasElement is already attached");
    var srf = new Surface(canvas, scopeId, _surfaceId, this);
    this.attachedSurface.push({canvas, surface:srf});
    return srf;
  }

  detachSurface(canvas: HTMLCanvasElement): void {
    var tuple = this.attachedSurface.filter((tuple)=> tuple[0] === canvas)[0];
    if(!tuple) return;
    tuple[1].destructor();
    this.attachedSurface.splice(this.attachedSurface.indexOf(tuple), 1);
  }

  hasSurface(scopeId: number, surfaceId: number|string): boolean {
    var type = SurfaceUtil.scope(scopeId);
    if(typeof surfaceId === "string"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        var _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else{
        throw new Error("RuntimeError: surface alias scope:" + type+ ", id:" + surfaceId + " is not defined.");
      }
    }else if(typeof surfaceId === "number"){
      var _surfaceId = surfaceId;
    }else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
    return this.surfaceTree[_surfaceId] != null;
  }

  bind(animationId: number): void {
    this.bindgroup[animationId] = true;
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.updateBind();
    });
  }

  unbind(animationId: number): void {
    this.bindgroup[animationId] = false;
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.updateBind();
    });
  }

  render(): void {
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.render();
    });
  }

}
