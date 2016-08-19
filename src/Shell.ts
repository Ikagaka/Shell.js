/// <reference path="../typings/index.d.ts"/>

import * as SF from './Surface';
import * as ST from "./SurfaceTree";
import * as SU from "./SurfaceUtil";
import * as SC from "./ShellConfig";
import * as CC from "./CanvasCache";
import * as IF from "./Interfaces";
import * as SY from "surfaces_txt2yaml";
import {EventEmitter} from "events";

export default class Shell extends EventEmitter {
  //public

  public directory: { [filepath: string]: ArrayBuffer; } // filepathに対応するファイルのArrayBuffer
  public descript: SC.Descript; // descript.txtをcsvと解釈した時の値
  public descriptJSON: SC.JSONLike; // descript.txtをjsonと解釈した時の値
  public config: SC.ShellConfig; // 実際に有効なdescript
  private cache: CC.CanvasCache;
  public attachedSurface: { div: HTMLDivElement, surface: SF.Surface }[]; // 現在このシェルが実DOM上にレンダリングしているcanvasとそのsurface一覧
  private surfacesTxt: SY.SurfacesTxt; // SurfacesTxt2Yamlの内容
  private surfaceTree: ST.SurfaceDefinition[]; // このshell.jsが解釈しているShellのリソースツリー
  private surfaceDefTree: ST.SurfaceDefinitionTree; // このshell.jsが解釈しているShellのリソースツリー
  

  constructor(directory: { [filepath: string]: ArrayBuffer; }) {
    super();

    this.descript = {};
    this.descriptJSON = {};
    this.config = new SC.ShellConfig();
    this.directory = directory;
    this.attachedSurface = [];
    this.surfacesTxt = <SY.SurfacesTxt>{};
    this.surfaceDefTree = new ST.SurfaceDefinitionTree();
    this.surfaceTree = this.surfaceDefTree.surfaces;
    this.cache = new CC.CanvasCache(this.directory);
  }

  public load(): Promise<Shell> {
    return Promise.resolve(this)
    .then(()=> this.loadDescript()) // 1st // ←なにこれ（自問自
    .then(()=> console.log("descript done")) // 依存関係的なやつだと思われ
    .then(()=> this.loadSurfacesTxt()) // 1st
    .then(()=> this.loadSurfaceTable()) // 1st
    .then(()=> console.log("surfaces done"))
    .then(()=> this.loadSurfacePNG())   // 2nd
    .then(()=> console.log("base done"))
    .then(()=> this) // 3rd
    .catch((err)=>{
      console.error("Shell#load > ", err);
      return Promise.reject(err);
    });
  }

  // this.directoryからdescript.txtを探してthis.descriptに入れる
  private loadDescript(): Promise<Shell> {
    const dir = this.directory;
    const name = SU.fastfind(Object.keys(dir), "descript.txt");
    if (name === "") {
      console.info("descript.txt is not found");
    } else {
      let descript = this.descript = SU.parseDescript(SU.convert(dir[name]));
      let json: SC.JSONLike = {};
      Object.keys(descript).forEach((key)=>{
        let _key = key
          .replace(/^sakura\./, "char0.")
          .replace(/^kero\./, "char1.");
        SU.decolateJSONizeDescript<SC.JSONLike, string>(json, _key, descript[key]);
      });
      this.descriptJSON = json;
    }
    // key-valueなdescriptをconfigへ変換
    return new SC.ShellConfig().loadFromJSONLike(this.descriptJSON).then((config)=>{
      this.config = config;
    }).then(()=> this);
  }



  // surfaces.txtを読んでthis.surfacesTxtに反映
  private loadSurfacesTxt(): Promise<Shell> {
    const filenames = SU.findSurfacesTxt(Object.keys(this.directory));
    if(filenames.length === 0){
      console.info("surfaces.txt is not found");
    }
    const cat_text = filenames.reduce((text, filename)=> text + SU.convert(this.directory[filename]), "");
    const surfacesTxt = SY.txt_to_data(cat_text, {compatible: 'ssp-lazy'});
    return ST.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
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
      const txt = SU.convert(this.directory[surfacetable_name]);
      console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
      // TODO
    }
    return Promise.resolve(this);
  }

  // this.directory から surface*.png をelement0として読み込んで this.surfaceTree に反映
  private loadSurfacePNG(): Promise<Shell>{
    const surface_names = Object.keys(this.directory).filter((filename)=> /^surface(\d+)\.png$/i.test(filename));
    surface_names.forEach((filename)=>{
      const n = Number((/^surface(\d+)\.png$/i.exec(filename)||["","NaN"])[1]);
      if(!isFinite(n)){ return; }
      // 存在した
      if(this.surfaceTree[n] == null){
        // surfaces.txtで未定義なら追加
        this.surfaceTree[n] = new ST.SurfaceDefinition();
        this.surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
      }else if(this.surfaceTree[n].elements[0] != null){
        // surfaces.txtで定義済みだけどelement0ではない
        this.surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
      }else{
        // surfaces.txtでelement0まで定義済み
      }
    });
    return Promise.resolve(this);
  }

  private hasFile(filename: string): boolean {
    return SU.fastfind(Object.keys(this.directory), filename) !== "";
  }


  public attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number|string): SF.Surface|null {
    const type = SU.scope(scopeId);
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
    const srf = new SF.Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.cache);
    // const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.state);
    if(this.config.enableRegion){
      srf.render();
    }
    srf.on("mouse", (ev: IF.SurfaceMouseEvent)=>{
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
    Shell.call(this, {}); // 初期化 // ES6 Class ではできない:
  }

  private getSurfaceAlias(scopeId: number, surfaceId: number|string): number {
    const type = SU.scope(scopeId);
    var _surfaceId = -1;
    if(typeof surfaceId === "string" || typeof surfaceId === "number"){
      if(!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]){
        // まずエイリアスを探す
        _surfaceId = SU.choice<number>(this.surfacesTxt.aliases[type][surfaceId]);
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
      // public bind(scopeId: number, bindgroupId: number): void
      const scopeId = a;
      const bindgroupId = b;
      if(this.config.bindgroup[scopeId] == null){
        console.warn("Shell#bind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
        return;
      }
      this.config.bindgroup[scopeId][bindgroupId] = true;
      this.attachedSurface.forEach(({surface:srf, div})=>{
        srf.update();
      });
      return;
    }else if(typeof a === "string" && typeof b === "string"){
      // public bind(scopeId: number, bindgroupId: number): void
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
      return;
    }else{
      console.error("Shell#bind", "TypeError:", a, b);
    }
  }

  // 着せ替えオフ
  public unbind(category: string, parts: string): void
  public unbind(scopeId: number, bindgroupId: number): void
  public unbind(a: number|string, b: number|string): void {
    if(typeof a === "number" && typeof b === "number"){
      // 特定のスコープへのオンオフ
      const scopeId = a;
      const bindgroupId = b;
      if(this.config.bindgroup[scopeId] == null){
        console.warn("Shell#unbind > bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
        return;
      }
      this.config.bindgroup[scopeId][bindgroupId] = false;
      this.attachedSurface.forEach(({surface:srf, div})=>{
        srf.update();
      });
    }else if(typeof a === "string" && typeof b === "string"){
      // public unbind(category: string, parts: string): void
      // カテゴリ全体のオンオフ
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
    this.config.enableRegion = true;
    this.render();
  }

  //当たり判定非表示
  public hideRegion(): void {
    this.config.enableRegion = false;
    this.render();
  }

  // 着せ替えメニュー用情報ていきょう
  public getBindGroups(scopeId: number): {category: string, parts: string, thumbnail: string}[] {
    return this.config.char[scopeId].bindgroup.map((bindgroup, bindgroupId)=>{
      return bindgroup.name;
    });
  }
}
