/// <reference path="../typings/tsd.d.ts"/>

import Surface from './Surface';
import SurfaceRender from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {SurfaceTreeNode, SurfaceCanvas, SurfaceMouseEvent} from "./Interfaces";
import EventEmitter from "eventemitter3";
import SurfacesTxt2Yaml from "surfaces_txt2yaml";
import $ from "jquery";

self["$"] = $;
self["jQuery"] = $;

export default class Shell extends EventEmitter {
  //public

  public directory: { [filepath: string]: ArrayBuffer; } // filepathに対応するファイルのArrayBuffer
  public descript: { [key: string]: string; }; // descript.txtをcsvと解釈した時の値
  public attachedSurface: { div: HTMLDivElement, surface: Surface }[]; // 現在このシェルが実DOM上にレンダリングしているcanvasとそのsurface一覧
  public surfacesTxt: SurfacesTxt; // SurfacesTxt2Yamlの内容
  public surfaceTree: SurfaceTreeNode[]; // このshell.jsが解釈しているShellのリソースツリー
  private cacheCanvas: { [key: string]: SurfaceCanvas; };//keyはfilepath。element合成のときにすでに読み込んだファイルをキャッシュ
  public bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
  public enableRegion: boolean;

  constructor(directory: { [filepath: string]: ArrayBuffer; }) {
    super();

    this.descript = {};
    this.directory = directory;
    this.attachedSurface = [];
    this.surfacesTxt = <SurfacesTxt>{};
    this.surfaceTree = [];
    this.cacheCanvas = {};
    this.bindgroup = [];
    this.enableRegion = false;
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

  // this.directoryからdescript.txtを探してthis.descriptに入れる
  private loadDescript(): Promise<Shell> {
    var dir = this.directory;
    var getName = (dic: {[key: string]: any}, reg: RegExp)=>{
      return Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    };
    var descript_name = getName(dir, /^descript\.txt$/i);
    if (descript_name === "") {
      console.info("descript.txt is not found");
      this.descript = {};
    } else {
      this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
    }
    return Promise.resolve(this);
  }

  // descript.txtからbindgroup探してデフォルト値を反映
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

  // surfaces.txtを読んでthis.surfacesTxtに反映
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

  // surfacetable.txtを読む予定
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

  // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
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

  // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
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
              base: {cnv:null, png: null, pna: null},
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

  // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
  private loadCollisions(): Promise<Shell>{
    var srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].regions).forEach((defname)=>{
      var n = srfs[defname].is;
      var regions = srfs[defname].regions;
      Object.keys(regions).forEach((regname)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: {cnv:null, png: null, pna: null},
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

  // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
  private loadAnimations(): Promise<Shell>{
    var srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].animations).forEach((defname)=>{
      var n = srfs[defname].is;
      var animations = srfs[defname].animations;
      Object.keys(animations).forEach((animname)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: {cnv:null, png: null, pna: null},
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
    return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
  }


  // this.cacheCanvas から filename な SurfaceCanvas を探す。
  // なければ this.directory から探し this.cacheCanvas にキャッシュする
  // 非同期の理由：img.onload = blob url
  private getPNGFromDirectory(filename: string): Promise<SurfaceCanvas> {
    var cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
    if(cached_filename !== ""){
      return Promise.resolve(this.cacheCanvas[cached_filename]);
    }
    if(!this.hasFile(filename)){
      // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
      filename += ".png";
      if(!this.hasFile(filename)){
        return Promise.reject<SurfaceCanvas>(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")));
      }
      console.warn("element file " + filename + " need '.png' extension");
    }
    var _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
    var pnafilename = _filename.replace(/\.png$/i, ".pna");
    var _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
    var pngbuf = this.directory[_filename];

    return SurfaceUtil.fetchImageFromArrayBuffer(pngbuf).then((png)=>{
      // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
      if(_pnafilename === ""){
        this.cacheCanvas[_filename] = {cnv:null, png, pna: null};
        return this.cacheCanvas[_filename];
      }
      var pnabuf = this.directory[_pnafilename];
      return SurfaceUtil.fetchImageFromArrayBuffer(pnabuf).then((pna)=>{
        this.cacheCanvas[_filename] = {cnv:null, png, pna};
        return this.cacheCanvas[_filename];
      });
    });
  }

  public attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number|string): Surface {
    var type = SurfaceUtil.scope(scopeId);
    if(typeof surfaceId === "string"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        var _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else throw new Error("ReferenceError: surface alias scope:" + type+ ", id:" + surfaceId + " is not defined.");
    }else if(typeof surfaceId === "number"){
      var _surfaceId = surfaceId;
    }else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
    var hits = this.attachedSurface.filter(({div: _div})=> _div === div);
    if(hits.length !== 0) throw new Error("ReferenceError: this HTMLDivElement is already attached");
    if(scopeId < 0){
      throw new Error("TypeError: scopeId needs more than 0, but:" + scopeId);
    }
    if(!this.surfaceTree[surfaceId]){
      console.warn("surfaceId:", surfaceId, "is not defined");
      return null;
    }
    var srf = new Surface(div, scopeId, _surfaceId, this.surfaceTree, this.bindgroup);
    srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
    srf.on("mouse", (ev: SurfaceMouseEvent)=>{
      this.emit("mouse", ev); // detachSurfaceで消える
    });
    this.attachedSurface.push({div, surface:srf});
    return srf;
  }

  public detachSurface(div: HTMLDivElement): void {
    var hits = this.attachedSurface.filter(({div: _div})=> _div === div);
    if(hits.length === 0) return;
    hits[0].surface.destructor(); // srf.onのリスナはここで消される
    this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
  }

  public unload(): void {
    this.attachedSurface.forEach(function({div, surface}){
      surface.destructor();
    });
    this.removeAllListeners(null);
    Shell.call(this, {}); // 初期化
  }

  // サーフェスエイリアス込みでサーフェスが存在するか確認
  private hasSurface(scopeId: number, surfaceId: number|string): boolean {
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
    this.attachedSurface.forEach(({surface:srf, div})=>{
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
    this.attachedSurface.forEach(({surface:srf, div})=>{
      srf.updateBind();
    });
  }

  // 全サーフェス強制再描画
  private render(): void {
    this.attachedSurface.forEach(({surface:srf, div})=>{
      srf.render();
    });
  }

  //当たり判定表示
  public showRegion(): void {
    this.enableRegion = true;
    this.attachedSurface.forEach(({surface:srf, div})=>{
      srf.enableRegionDraw = true;
    });
    this.render();
  }

  //当たり判定非表示
  public hideRegion(): void {
    this.enableRegion = false;
    this.attachedSurface.forEach(({surface:srf, div})=>{
      srf.enableRegionDraw = false;
    });
    this.render();
  }
}
