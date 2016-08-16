/// <reference path="../typings/index.d.ts"/>

import Surface from './Surface';
import SurfaceRender from "./SurfaceRender";
import * as ST from "./SurfaceTree";
import * as SurfaceUtil from "./SurfaceUtil";
import {SurfaceTreeNode, SurfaceCanvas, SurfaceMouseEvent, ShellConifg} from "./Interfaces";
import SurfacesTxt2Yaml = require("surfaces_txt2yaml");
import * as EventEmitter from "events";
import $ = require("jquery");

export default class Shell extends EventEmitter.EventEmitter {
  //public

  public directory: { [filepath: string]: ArrayBuffer; } // filepathに対応するファイルのArrayBuffer
  public descript: { [key: string]: string; }; // descript.txtをcsvと解釈した時の値
  public config: ShellConifg; // 実際に有効なdescript
  public attachedSurface: { div: HTMLDivElement, surface: Surface }[]; // 現在このシェルが実DOM上にレンダリングしているcanvasとそのsurface一覧
  private surfacesTxt: SurfacesTxt2Yaml.SurfacesTxt; // SurfacesTxt2Yamlの内容
  private surfaceTree: ST.SurfaceDefinition[]; // このshell.jsが解釈しているShellのリソースツリー
  private surfaceDefTree: ST.SurfaceDefinitionTree; // このshell.jsが解釈しているShellのリソースツリー
  private cacheCanvas: { [key: string]: SurfaceCanvas; };//keyはfilepath。element合成のときにすでに読み込んだファイルをキャッシュ
  private bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
  public enableRegion: boolean;

  constructor(directory: { [filepath: string]: ArrayBuffer; }) {
    super();

    this.descript = {};
    this.config = <ShellConifg>{};
    this.directory = directory;
    this.attachedSurface = [];
    this.surfacesTxt = <SurfacesTxt2Yaml.SurfacesTxt>{};
    this.surfaceDefTree = new ST.SurfaceDefinitionTree();
    this.surfaceTree = this.surfaceDefTree.surfaces;
    this.cacheCanvas = {};
    this.bindgroup = [];
    this.enableRegion = false;
  }

  public load(): Promise<Shell> {
    return Promise.resolve(this)
    .then(()=> this.loadDescript()) // 1st // ←なにこれ（自問自
    .then(()=> this.loadConfig())
    .then(()=> this.loadBindGroup()) // 2nd // 依存関係的なやつだと思われ
    .then(()=> console.log("descript done"))
    .then(()=> this.loadSurfacesTxt()) // 1st
    .then(()=> this.loadSurfaceTable()) // 1st
    .then(()=> console.log("surfaces done"))
    .then(()=> this.loadSurfacePNG())   // 2nd
    .then(()=> console.log("base done"))
    .then(()=> this.loadElements()) // 3rd
    .then(()=> console.log("elements done"))
    .then(()=> this) // 3rd
    .catch((err)=>{
      console.error("Shell#load > ", err);
      return Promise.reject(err);
    });
  }

  // this.directoryからdescript.txtを探してthis.descriptに入れる
  private loadDescript(): Promise<Shell> {
    const dir = this.directory;
    const getName = (dic: {[key: string]: any}, reg: RegExp)=>{
      return Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    };
    const descript_name = getName(dir, /^descript\.txt$/i);
    if (descript_name === "") {
      console.info("descript.txt is not found");
      this.descript = {};
    } else {
      this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
    }
    return Promise.resolve(this);
  }

  private loadConfig(): Promise<Shell> {
    // key-valueなdescriptをconfigへ変換
    const descript = this.descript;
    // オートマージ
    // dic["a.b.c"]="d"なテキストをJSON形式に変換している気がする
    Object.keys(descript).forEach((key)=>{
      let ptr: any = this.config;
      const props = key.split(".");
      for(let i=0; i<props.length; i++){
        const prop = props[i];
        const [_prop, num] = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop)||["", "", ""], 1);
        const _num = Number(num);
        if(isFinite(_num)){
          if(!Array.isArray(ptr[_prop])){
            ptr[_prop] = [];
          }
          ptr[_prop][_num] = ptr[_prop][_num] || {};
          if(i !== props.length-1){
            ptr = ptr[_prop][_num];
          }else{
            if(ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0){
              // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
              // menu, 0 -> menu.value
              // menu.font...
              // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
              // このifはその例外への対処である
              ptr[_prop][_num].value = Number(descript[key]) || descript[key];
            }else{
              ptr[_prop][_num] = Number(descript[key]) || descript[key];
            }
          }
        }else{
          ptr[_prop] = ptr[_prop] || {};
          if(i !== props.length-1){
            ptr = ptr[_prop];
          }else{
            if(ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0){
              ptr[_prop].value = Number(descript[key]) || descript[key];
            }else{
              ptr[_prop] = Number(descript[key]) || descript[key];
            }
          }
        }
      }
    });
    if(typeof this.config.menu !== "undefiend"){
      // config型のデフォルト値を作り出すコンストラクタが存在しない（ゴミかよ）なので
      // いちいちプロパティの存在チェックをしないといけないゴミさ加減
      // このコード書いたやつ三週間便所掃除させたい
      this.config.menu = {
        value: false
        // font: {...}
        // background: {...}
        // foreground: {...}
        // ...
        // いいから型コンストラクタ定義してくれ頼む
      };
    }
    if(typeof this.config.menu.value === "number"){
      this.config.menu.value = (+this.config.menu.value) > 0; // number -> boolean
    }else{
      this.config.menu.value = true; // default value
    }
    this.config.char = this.config.char|| [];
    // sakura -> char0
    this.config.char[0] = this.config.char[0] || <any>{};
    $.extend(true, this.config["char"][0], this.config["sakura"]);
    delete this.config["sakura"];
    // kero -> char1
    this.config.char = this.config.char|| [];
    this.config.char[1] = this.config.char[1] || <any>{};
    $.extend(true, this.config.char[1], this.config["kero"]);
    delete this.config["kero"];
    // char*
    this.config.char.forEach((char)=>{
      // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
      if(!Array.isArray(char.bindgroup)){
        char.bindgroup = [];
      }
      char.bindgroup.forEach((bindgroup)=>{
        if(typeof bindgroup.name === "string"){
          const [category, parts, thumbnail] = (""+bindgroup.name).split(",").map((a)=>a.trim())
          bindgroup.name = {category, parts, thumbnail};
        }
      });
      // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
      if(!Array.isArray(char.bindoption)){
        char.bindoption = [];
      }
      char.bindoption.forEach((bindoption)=>{
        if(typeof bindoption.group === "string"){
          const [category, ...options] = (""+bindoption.group).split(",").map((a)=>a.trim())
          bindoption.group = {category, options};
        }
      });
    });
    return Promise.resolve(this);
  }

  // descript.txtからbindgroup探してデフォルト値を反映
  private loadBindGroup(): Promise<Shell> {
    const descript = this.descript;
    const grep = (dic:{[key:string]:any}, reg: RegExp)=>
      Object.keys(dic).filter((key)=> reg.test(key))
    const reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
    grep(descript, reg).forEach((key)=>{
      const [_, charId, bindgroupId, dflt] = <string[]>reg.exec(key);
      const _charId = charId === "sakura" ? "0" :
                               "kero"   ? "1" :
                               (/char(\d+)/.exec(charId)||["", Number.NaN])[1];
      const maybeNumCharId = Number(_charId);
      const maybeNumBindgroupId = Number(bindgroupId);
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
    const filenames = SurfaceUtil.findSurfacesTxt(Object.keys(this.directory));
    if(filenames.length === 0){
      console.info("surfaces.txt is not found");
    }
    const cat_text = filenames.reduce((text, filename)=> text + SurfaceUtil.convert(this.directory[filename]), "");
    const surfacesTxt = SurfacesTxt2Yaml.txt_to_data(cat_text, {compatible: 'ssp-lazy'});
    return new ST.SurfaceDefinitionTree().loadFromsurfacesTxt2Yaml(surfacesTxt)
    .then((surfaceTree)=>{
      this.surfacesTxt = surfacesTxt;
      this.surfaceDefTree = surfaceTree;
      this.surfaceTree = this.surfaceDefTree.surfaces;
      return this;
    });
  }

  // surfacetable.txtを読む予定
  private loadSurfaceTable(): Promise<Shell> {
    const surfacetable_name = Object.keys(this.directory).filter((name)=> /^surfacetable.*\.txt$/i.test(name))[0] || "";
    if(surfacetable_name === ""){
      console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
    }else{
      const txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
      console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
      // TODO
    }
    return Promise.resolve(this);
  }

  // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
  private loadSurfacePNG(): Promise<Shell>{
    const surface_names = Object.keys(this.directory).filter((filename)=> /^surface(\d+)\.png$/i.test(filename));
    return new Promise<Shell>((resolve, reject)=>{
      let i = 0;
      surface_names.forEach((filename)=>{
        const n = Number((/^surface(\d+)\.png$/i.exec(filename)||["","NaN"])[1]);
        if(!isFinite(n)) return;
        i++;
        this.getPNGFromDirectory(filename, (err, cnv)=>{
          if(err != null || cnv == null){
            console.warn("Shell#loadSurfacePNG > " + err);
          }else{
            if(!this.surfaceTree[n]){
              // surfaces.txtで未定義なら追加
              this.surfaceTree[n] = new ST.SurfaceDefinition();
              this.surfaceTree[n].base = cnv;
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
    const srfs = this.surfaceTree;
    return new Promise<Shell>((resolve, reject)=>{
      let i = 0;
      srfs.forEach((srf, n)=>{
        const elms = srf.elements;
        const _prms = elms.map((elm, elmId)=>{
          const {type, file, x, y} = elm;
          i++;
          this.getPNGFromDirectory(file, (err, canvas)=>{
            if( err != null || canvas == null){
              console.warn("Shell#loadElements > " + err);
            }else{
              this.surfaceTree[n].elements[elmId].canvas = canvas;
            }
            if(--i <= 0){
              resolve(this);
            }
          });
        });
      });
      // elementを一切使っていなかった
      if(i === 0){
        resolve(this);
      }
    }).then(()=> this);
  }

  private hasFile(filename: string): boolean {
    return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
  }

  // this.cacheCanvas から filename な SurfaceCanvas を探す。
  // なければ this.directory から探し this.cacheCanvas にキャッシュする
  // 非同期の理由：img.onload = blob url
  private getPNGFromDirectory(filename: string, cb: (err: any, srfCnv: SurfaceCanvas|null)=> any): void {
    const cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
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
    const _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
    const pnafilename = _filename.replace(/\.png$/i, ".pna");
    const _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
    const pngbuf = this.directory[_filename];

    SurfaceUtil.getImageFromArrayBuffer(pngbuf, (err, png)=>{
      if(err != null) return cb(err, null);
      // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
      if(_pnafilename === ""){
        this.cacheCanvas[_filename] = {cnv:null, png, pna: null};
        cb(null, this.cacheCanvas[_filename]);
        return;
      }
      const pnabuf = this.directory[_pnafilename];
      SurfaceUtil.getImageFromArrayBuffer(pnabuf, (err, pna)=>{
        if(err != null) return cb(err, null);
        this.cacheCanvas[_filename] = {cnv:null, png, pna};
        cb(null, this.cacheCanvas[_filename]);
      });
    });
  }

  public attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number|string): Surface|null {
    const type = SurfaceUtil.scope(scopeId);
    const hits = this.attachedSurface.filter(({div: _div})=> _div === div);
    if(hits.length !== 0) throw new Error("Shell#attachSurface > ReferenceError: this HTMLDivElement is already attached");
    if(scopeId < 0){
      throw new Error("Shell#attachSurface > TypeError: scopeId needs more than 0, but:" + scopeId);
    }
    const _surfaceId = this.getSurfaceAlias(scopeId, surfaceId);
    if(_surfaceId !== surfaceId){
      console.info("Shell#attachSurface", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
    }
    if(!this.surfaceTree[_surfaceId]){
      console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", this.surfaceTree);
      return null;
    }
    const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.bindgroup);
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
    const hits = this.attachedSurface.filter(({div: _div})=> _div === div);
    if(hits.length === 0) return;
    hits[0].surface.destructor(); // srf.onのリスナはここで消される
    this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
  }

  public unload(): void {
    this.attachedSurface.forEach(function({div, surface}){
      surface.destructor();
    });
    this.removeAllListeners();
    Shell.call(this, {}); // 初期化
  }

  private getSurfaceAlias(scopeId: number, surfaceId: number|string): number {
    const type = SurfaceUtil.scope(scopeId);
    var _surfaceId = -1;
    if(typeof surfaceId === "string" || typeof surfaceId === "number"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        // まずエイリアスを探す
        _surfaceId = SurfaceUtil.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
      }else if(typeof surfaceId === "number"){
        // 通常の処理
        _surfaceId = surfaceId;
      }
    }else{
      // そんなサーフェスはない
      console.warn("Shell#hasSurface > surface alias scope:", scopeId + "as" + type+ ", id:" + surfaceId + " is not defined.");
      _surfaceId = -1;
    }
    return _surfaceId;
  }

  // サーフェスエイリアス込みでサーフェスが存在するか確認
  private hasSurface(scopeId: number, surfaceId: number|string): boolean {
    return this.getSurfaceAlias(scopeId, surfaceId) >= 0;
  }

  // 着せ替えオン
  public bind(category: string, parts: string): void
  public bind(scopeId: number, bindgroupId: number): void
  public bind(a: number|string, b: number|string): void {
    if(typeof a === "number" && typeof b === "number"){
      const scopeId = a;
      const bindgroupId = b;
      if(this.bindgroup[scopeId] == null){
        console.warn("Shell#bind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
        return;
      }
      this.bindgroup[scopeId][bindgroupId] = true;
      this.attachedSurface.forEach(({surface:srf, div})=>{
        srf.updateBind();
      });
    }else if(typeof a === "string" && typeof b === "string"){
      const _category = a;
      const _parts = b;
      this.config.char.forEach((char, scopeId)=>{
        char.bindgroup.forEach((bindgroup, bindgroupId)=>{
          const {category, parts} = bindgroup.name;
          if(_category === category && _parts === parts){
            this.bind(scopeId, bindgroupId);
          }
        });
      });
    }else{
      console.error("Shell#bind", "TypeError:", a, b);
    }
  }

  // 着せ替えオフ
  public unbind(category: string, parts: string): void
  public unbind(scopeId: number, bindgroupId: number): void
  public unbind(a: number|string, b: number|string): void {
    if(typeof a === "number" && typeof b === "number"){
      const scopeId = a;
      const bindgroupId = b;
      if(this.bindgroup[scopeId] == null){
        console.warn("Shell#unbind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
        return;
      }
      this.bindgroup[scopeId][bindgroupId] = false;
      this.attachedSurface.forEach(({surface:srf, div})=>{
        srf.updateBind();
      });
    }else if(typeof a === "string" && typeof b === "string"){
      const _category = a;
      const _parts = b;
      this.config.char.forEach((char, scopeId)=>{
        char.bindgroup.forEach((bindgroup, bindgroupId)=>{
          const {category, parts} = bindgroup.name;
          if(_category === category && _parts === parts){
            this.unbind(scopeId, bindgroupId);
          }
        });
      });
    }else{
      console.error("Shell#unbind", "TypeError:", a, b);
    }
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

  // 着せ替えメニュー用情報ていきょう
  public getBindGroups(scopeId: number): {category: string, parts: string, thumbnail: string}[] {
    return this.config.char[scopeId].bindgroup.map((bindgroup, bindgroupId)=>{
      return bindgroup.name;
    });
  }
}
