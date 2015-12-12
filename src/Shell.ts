/// <reference path="../typings/tsd.d.ts"/>

import Surface from './Surface';
import SurfaceRender from "./SurfaceRender";
import * as SurfaceUtil from "./SurfaceUtil";
import {SurfaceTreeNode, SurfaceCanvas, SurfaceMouseEvent} from "./Interfaces";
import SurfacesTxt2Yaml = require("surfaces_txt2yaml");
import EventEmitter = require("eventemitter3");
import $ = require("jquery");

export default class Shell extends EventEmitter {
  //public

  public directory: { [filepath: string]: ArrayBuffer; } // filepathに対応するファイルのArrayBuffer
  public descript: { [key: string]: string; }; // descript.txtをcsvと解釈した時の値
  public attachedSurface: { div: HTMLDivElement, surface: Surface }[]; // 現在このシェルが実DOM上にレンダリングしているcanvasとそのsurface一覧
  private surfacesTxt: SurfacesTxt; // SurfacesTxt2Yamlの内容
  private surfaceTree: SurfaceTreeNode[]; // このshell.jsが解釈しているShellのリソースツリー
  private cacheCanvas: { [key: string]: SurfaceCanvas; };//keyはfilepath。element合成のときにすでに読み込んだファイルをキャッシュ
  private bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
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
    .then(()=> this) // 3rd
    .catch((err)=>{
      console.error("Shell#load > ", err);
      return Promise.reject(err);
    });
  }

  // this.directoryからdescript.txtを探してthis.descriptに入れる
  private loadDescript(): Promise<Shell> {
    let dir = this.directory;
    let getName = (dic: {[key: string]: any}, reg: RegExp)=>{
      return Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    };
    let descript_name = getName(dir, /^descript\.txt$/i);
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
    let descript = this.descript;
    let grep = (dic:{[key:string]:any}, reg: RegExp)=>
      Object.keys(dic).filter((key)=> reg.test(key))
    let reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
    grep(descript, reg).forEach((key)=>{
      let [_, charId, bindgroupId, dflt] = reg.exec(key);
      let _charId = charId === "sakura" ? "0" :
                               "kero"   ? "1" :
                               (/char(\d+)/.exec(charId)||["", Number.NaN])[1];
      let maybeNumCharId = Number(_charId);
      let maybeNumBindgroupId = Number(bindgroupId);
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
    let surfaces_text_names = Object.keys(this.directory).filter((name)=> /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
    if(surfaces_text_names.length === 0) {
      console.info("surfaces.txt is not found");
      this.surfacesTxt = <SurfacesTxt>{surfaces:{}, descript: {}, aliases: {}, regions: {}};
    } else {
      // cat surfaces*.txt
      let text = surfaces_text_names.reduce((text, filename)=> text + SurfaceUtil.convert(this.directory[filename]), "");
      this.surfacesTxt = SurfacesTxt2Yaml.txt_to_data(text, {compatible: 'ssp-lazy'});
      // SurfacesTxt2Yamlの継承の expand と remove
      Object.keys(this.surfacesTxt.surfaces).forEach((name)=>{
        if(typeof this.surfacesTxt.surfaces[name].is === "number"
           && Array.isArray(this.surfacesTxt.surfaces[name].base)){
          this.surfacesTxt.surfaces[name].base.forEach((key)=>{
            $.extend(true, this.surfacesTxt.surfaces[name], this.surfacesTxt.surfaces[key]);
          });
          delete this.surfacesTxt.surfaces[name].base;
        }
      });
      Object.keys(this.surfacesTxt.surfaces).forEach((name)=>{
        if(typeof this.surfacesTxt.surfaces[name].is === "undefined"){
          delete this.surfacesTxt.surfaces[name]
        }
      });
      // expand ここまで
      this.surfacesTxt.descript = this.surfacesTxt.descript || <SurfaceDescript>{};
      if(typeof this.surfacesTxt.descript["collision-sort"] === "string"){
        console.warn("Shell#loadSurfacesTxt", "collision-sort is not supported yet.");
      }
      if(typeof this.surfacesTxt.descript["collision-sort"] === "string"){
        console.warn("Shell#loadSurfacesTxt", "animation-sort is not supported yet.");
      }
    }
    return Promise.resolve(this);
  }

  // surfacetable.txtを読む予定
  private loadSurfaceTable(): Promise<Shell> {
    let surfacetable_name = Object.keys(this.directory).filter((name)=> /^surfacetable.*\.txt$/i.test(name))[0] || "";
    if(surfacetable_name === ""){
      console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
    }else{
      let txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
      console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
      // TODO
    }
    return Promise.resolve(this);
  }

  // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
  private loadSurfacePNG(): Promise<Shell>{
    let surface_names = Object.keys(this.directory).filter((filename)=> /^surface(\d+)\.png$/i.test(filename));
    return new Promise<Shell>((resolve, reject)=>{
      let i = 0;
      surface_names.forEach((filename)=>{
        let n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
        i++;
        this.getPNGFromDirectory(filename, (err, cnv)=>{
          if(err != null){
            console.warn("Shell#loadSurfacePNG > " + err);
          }else{
            if(!this.surfaceTree[n]){
              // surfaces.txtで未定義なら追加
              this.surfaceTree[n] = {
                base: cnv,
                elements: [],
                collisions: [],
                animations: []
              };
            }else{
              // surfaces.txtで定義済み
              this.surfaceTree[n].base = cnv;
            }
          }
          if(--i <= 0){
            resolve(this);
          }
        });
      });
    });
  }

  // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
  private loadElements(): Promise<Shell>{
    let srfs = this.surfacesTxt.surfaces;
    let hits = Object.keys(srfs).filter((name)=> !!srfs[name].elements);
    return new Promise<Shell>((resolve, reject)=>{
      let i = 0;
      if(hits.length === 0) return resolve(this);
      hits.forEach((defname)=>{
        let n = srfs[defname].is;
        let elms = srfs[defname].elements;
        let _prms = Object.keys(elms).map((elmname)=>{
          let {is, type, file, x, y} = elms[elmname];
          i++;
          this.getPNGFromDirectory(file, (err, canvas)=>{
            if( err != null){
              console.warn("Shell#loadElements > " + err);
            }else{
              if(!this.surfaceTree[n]){
                this.surfaceTree[n] = {
                  base: {cnv:null, png: null, pna: null},
                  elements: [],
                  collisions: [],
                  animations: []
                };
              }
              this.surfaceTree[n].elements[is] = {type, canvas, x, y};
            }
            if(--i <= 0){
              resolve(this);
            }
          });
        });
      });
    });
  }

  // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
  private loadCollisions(): Promise<Shell>{
    let srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].regions).forEach((defname)=>{
      let n = srfs[defname].is;
      let regions = srfs[defname].regions;
      Object.keys(regions).forEach((regname)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: {cnv:null, png: null, pna: null},
            elements: [],
            collisions: [],
            animations: []
          };
        }
        let {is} = regions[regname];
        this.surfaceTree[n].collisions[is] = regions[regname];
      });
    });
    return Promise.resolve(this);
  }

  // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
  private loadAnimations(): Promise<Shell>{
    let srfs = this.surfacesTxt.surfaces;
    Object.keys(srfs).filter((name)=> !!srfs[name].animations).forEach((defname)=>{
      let n = srfs[defname].is;
      let animations = srfs[defname].animations;
      Object.keys(animations).forEach((animId)=>{
        if(!this.surfaceTree[n]){
          this.surfaceTree[n] = {
            base: {cnv:null, png: null, pna: null},
            elements: [],
            collisions: [],
            animations: []
          };
        }
        let {is, interval="never", option="", patterns=[], regions=<{ [key: string]: SurfaceRegion; }>{}} = animations[animId];
        // animation*.option,* の展開
        // animation*.option,exclusive+background,(1,3,5)
        let [_option, ...opt_args] = option.split(",");
        let _opt_args = opt_args.map((str)=> str.replace("(", "").replace(")", "").trim());
        let options = option.split("+");
        let _options = options.map<[string, string[]]>((option)=> [option.trim(), _opt_args]);
        let [_interval, ...int_args] = interval.split(",");
        let _int_args = int_args.map((str)=> str.trim());
        let intervals = _interval.split("+"); // sometimes+talk
        let _intervals = intervals.map<[string, string[]]>((interval)=> [interval.trim(), _int_args]);
        let _regions: SurfaceRegion[] = [];
        Object.keys(regions).forEach((key)=>{
          _regions[regions[key].is] = regions[key];
        });
        this.surfaceTree[n].animations[is] = {
          options: _options,
          intervals: _intervals,
          regions: _regions,
          is, patterns, interval
        };
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
  private getPNGFromDirectory(filename: string, cb: (err: any, srfCnv: SurfaceCanvas)=> any): void {
    let cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
    if(cached_filename !== ""){
      cb(null, this.cacheCanvas[cached_filename]);
      return;
    }
    if(!this.hasFile(filename)){
      // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
      filename += ".png";
      if(!this.hasFile(filename)){
        cb(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")), null);
        return;
      }
      console.warn("Shell#getPNGFromDirectory", "element file " + filename.substr(0, filename.length - ".png".length) + " need '.png' extension");
    }
    let _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
    let pnafilename = _filename.replace(/\.png$/i, ".pna");
    let _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
    let pngbuf = this.directory[_filename];

    SurfaceUtil.getImageFromArrayBuffer(pngbuf, (err, png)=>{
      if(err != null) return cb(err, null);
      // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
      if(_pnafilename === ""){
        this.cacheCanvas[_filename] = {cnv:null, png, pna: null};
        cb(null, this.cacheCanvas[_filename]);
        return;
      }
      let pnabuf = this.directory[_pnafilename];
      SurfaceUtil.getImageFromArrayBuffer(pnabuf, (err, pna)=>{
        if(err != null) return cb(err, null);
        this.cacheCanvas[_filename] = {cnv:null, png, pna};
        cb(null, this.cacheCanvas[_filename]);
      });
    });
  }

  public attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number|string): Surface {
    let type = SurfaceUtil.scope(scopeId);
    let hits = this.attachedSurface.filter(({div: _div})=> _div === div);
    if(hits.length !== 0) throw new Error("Shell#attachSurface > ReferenceError: this HTMLDivElement is already attached");
    if(scopeId < 0){
      throw new Error("Shell#attachSurface > TypeError: scopeId needs more than 0, but:" + scopeId);
    }
    let _surfaceId = this.getSurfaceAlias(scopeId, surfaceId);
    if(_surfaceId !== surfaceId){
      console.info("Shell#attachSurface", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
    }
    if(!this.surfaceTree[_surfaceId]){
      console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", this.surfaceTree);
      return null;
    }
    let srf = new Surface(div, scopeId, _surfaceId, this.surfaceTree, this.bindgroup);
    srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
    if(this.enableRegion){
      srf.render();
    }
    srf.on("mouse", (ev: SurfaceMouseEvent)=>{
      this.emit("mouse", ev); // detachSurfaceで消える
    });
    this.attachedSurface.push({div, surface:srf});
    return srf;
  }

  public detachSurface(div: HTMLDivElement): void {
    let hits = this.attachedSurface.filter(({div: _div})=> _div === div);
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

  private getSurfaceAlias(scopeId: number, surfaceId: number|string): number {
    let type = SurfaceUtil.scope(scopeId);
    if(typeof surfaceId === "string" || typeof surfaceId === "number"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        // まずエイリアスを探す
        var _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else if(typeof surfaceId === "number"){
        // 通常の処理
        var _surfaceId = surfaceId;
      }
    }else{
      // そんなサーフェスはない
      console.warn("Shell#hasSurface > surface alias scope:", scopeId + "as" + type+ ", id:" + surfaceId + " is not defined.");
      var _surfaceId = -1;
    }
    return _surfaceId;
  }

  // サーフェスエイリアス込みでサーフェスが存在するか確認
  private hasSurface(scopeId: number, surfaceId: number|string): boolean {
    return this.getSurfaceAlias(scopeId, surfaceId) >= 0;
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

  public getBindGroups(): {category: string, parts: string, thumbnail: string}[][]{
    let descript = this.descript;
    let grep = (dic:{[key:string]:any}, reg: RegExp)=>
      Object.keys(dic).filter((key)=> reg.test(key))
    let reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)\.name/;
    let scopes: {category: string, parts: string, thumbnail: string}[][] = [];
    grep(descript, reg).forEach((key)=>{
      let [_, charId, bindgroupId, dflt] = reg.exec(key);
      let _charId = SurfaceUtil.unscope(charId);
      let [category, parts, thumbnail] = descript[key].split(",");
      scopes[_charId][Number(bindgroupId)] = {category, parts, thumbnail};
    });
    return scopes;
  }
}
