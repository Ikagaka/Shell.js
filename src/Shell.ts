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

export class Shell extends EventEmitter2 {
  //public
  public directory: { [filepath: string]: ArrayBuffer; }
  public descript: { [key: string]: string; };
  public attachedSurface: { canvas: HTMLCanvasElement, surface: Surface }[];
  public surfacesTxt: SurfacesTxt;
  public surfaceTree: SurfaceTreeNode[];
  private cacheCanvas: { [key: string]: HTMLCanvasElement; };//keyはfilepath。element合成のときにすでに読み込んだファイルをキャッシュ
  public bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
  public enableRegionDraw: boolean;


  constructor(directory: { [filepath: string]: ArrayBuffer; }) {
    super();

    this.descript = {};
    this.directory = directory;
    this.attachedSurface = [];
    this.surfacesTxt = <SurfacesTxt>{};
    this.surfaceTree = [];
    this.cacheCanvas = {};
    this.bindgroup = [];
    this.enableRegionDraw = false;
  }

  public load(): Promise<Shell> {
    return Promise.resolve(this)
    .then(()=> this.loadDescript()) // 1st // ←なにこれ（自問自
    .then(()=> this.loadBindGroup()) // 2nd // 依存関係的なやつだと思われ
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
  private loadDescript(): Promise<Shell> {
    var dir = this.directory;
    var getName = (dic: {[key: string]: any}, reg: RegExp)=>
      Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    var descript_name = getName(dir, /^descript\.txt$/i);
    if (descript_name === "") {
      console.info("descript.txt is not found");
      this.descript = {};
    } else {
      this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
    }
    return Promise.resolve(this);
  }

  // load bindgroup and assign to this.bindgroup
  private loadBindGroup(): Promise<Shell> {
    var descript = this.descript;
    var grep = (dic:{[key:string]:any}, reg: RegExp)=>
      Object.keys(dic).filter((key)=> reg.test(key))
    var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
    grep(descript, reg).forEach((key)=>{
      var [_, charId, bindgroupId, dflt] = reg.exec(key);
      var _charId = charId === "sakura" ? "0" :
                               "kero"   ? "1" :
                               (/char(\d+)/.exec(charId)||["", Number.NaN])[1];
      var maybeNumCharId = Number(_charId);
      var maybeNumBindgroupId = Number(bindgroupId);
      if(isFinite(maybeNumCharId) && isFinite(maybeNumBindgroupId)){
        this.bindgroup[maybeNumCharId] = this.bindgroup[maybeNumCharId] || [];
        if(dflt === "default"){
          this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = !!Number(descript[key]);
        }else{
          this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = this.bindgroup[maybeNumCharId][maybeNumBindgroupId] || false;
        }
      }else{
        console.warn("CharId: "+ _charId + " or bindgroupId: " + bindgroupId + " is not number");
      }
    });
    return Promise.resolve(this);
  }

  // load surfaces.txt
  private loadSurfacesTxt(): Promise<Shell> {
    var surfaces_text_names = Object.keys(this.directory).filter((name)=> /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
    if(surfaces_text_names.length === 0) {
      console.info("surfaces.txt is not found");
      this.surfacesTxt = <SurfacesTxt>{surfaces:{}, descript: {}, aliases: {}, regions: {}};
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
  private loadSurfaceTable(): Promise<Shell> {
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
  private loadSurfacePNG(): Promise<Shell> {
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
  private loadElements(): Promise<Shell>{
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
  private loadCollisions(): Promise<Shell>{
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
  private loadAnimations(): Promise<Shell>{
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

  private hasFile(filename: string): boolean {
    return SurfaceUtil.find(Object.keys(this.directory), filename).length > 0;
  }

  private getPNGFromDirectory(filename: string): Promise<HTMLCanvasElement> {
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

  public attachSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number|string): Surface {
    var type = SurfaceUtil.scope(scopeId);
    if(typeof surfaceId === "string"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        var _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else throw new Error("ReferenceError: surface alias scope:" + type+ ", id:" + surfaceId + " is not defined.");
    }else if(typeof surfaceId === "number"){
      var _surfaceId = surfaceId;
    }else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
    var hits = this.attachedSurface.filter(({canvas: _canvas})=> _canvas === canvas);
    if(hits.length !== 0) throw new Error("ReferenceError: this HTMLCanvasElement is already attached");
    if(scopeId < 0){
      throw new Error("TypeError: scopeId needs more than 0, but:" + scopeId);
    }
    if(!this.surfaceTree[surfaceId]){
      console.warn("surfaceId:", surfaceId, "is not defined");
      return null;
    }
    var srf = new Surface(canvas, scopeId, _surfaceId, this);
    this.attachedSurface.push({canvas, surface:srf});
    return srf;
  }

  public detachSurface(canvas: HTMLCanvasElement): void {
    var hits = this.attachedSurface.filter(({canvas: _canvas})=> _canvas === canvas);
    if(hits.length === 0) return;
    hits[0].surface.destructor();
    this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
  }

  public unload(): void {
    this.attachedSurface.forEach(function({canvas, surface}){
      surface.destructor();
    });
    this.removeAllListeners();
    Object.keys(this).forEach((key)=> {
      this[key] = new this[key].constructor();
    });
  }

  // サーフェスエイリアス込みでサーフェスが存在するか確認
  public hasSurface(scopeId: number, surfaceId: number|string): boolean {
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

  // 着せ替えオン
  public bind(scopeId: number, bindgroupId: number): void {
    if(this.bindgroup[scopeId] == null){
      console.warn("Shell#bind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
      return;
    }
    this.bindgroup[scopeId][bindgroupId] = true;
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.updateBind();
    });
  }

  // 着せ替えオフ
  public unbind(scopeId: number, bindgroupId: number): void {
    if(this.bindgroup[scopeId] == null){
      console.warn("Shell#unbind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
      return;
    }
    this.bindgroup[scopeId][bindgroupId] = false;
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.updateBind();
    });
  }

  // 強制再描画
  public render(): void {
    this.attachedSurface.forEach(({surface:srf, canvas})=>{
      srf.render();
    });
  }
}
