/*
 * shell/master/*** 以下のリソースを一元管理するための バリアント型
 */
import * as ST from "./SurfaceTree";
import * as SU from "./SurfaceUtil";
import * as SC from "./ShellConfig";
import * as CC from "./CanvasCache";
import * as SY from "surfaces_txt2yaml";


export class Shell {

  public directory: { [filepath: string]: ArrayBuffer; } // filepathに対応するファイルのArrayBuffer
  public cache: CC.CanvasCache;

  public descript: SC.Descript; // descript.txtをcsvと解釈した時の値
  public descriptJSON: SC.JSONLike; // descript.txtをjsonと解釈した時の値
  public config: SC.ShellConfig; // 実際に有効なdescript

  public surfacesTxt: SY.SurfacesTxt; // SurfacesTxt2Yamlの内容
  public surfaceDefTree: ST.SurfaceDefinitionTree; // このshell.jsが解釈しているShellのリソースツリー
  

  
  constructor() {
    this.directory = {};
    this.cache = new CC.CanvasCache(this.directory);

    this.descript = {};
    this.descriptJSON = {};
    this.config = new SC.ShellConfig();

    this.surfacesTxt = <SY.SurfacesTxt>{};
    this.surfaceDefTree = new ST.SurfaceDefinitionTree();
  }
}



export function getSurfaceAlias(shell: Shell, scopeId: number, surfaceId: number|string): Promise<number> {
  const {aliases, surfaces} = shell.surfaceDefTree;
  const type = SU.scope(scopeId);
  if(typeof surfaceId === "string" || typeof surfaceId === "number"){
    if(aliases[type] != null && aliases[type][surfaceId] != null){
      // まずエイリアスを探す
      const _surfaceId = SU.choice<number>(aliases[type][surfaceId]);
      return Promise.resolve(_surfaceId);
    }
    if(typeof surfaceId === "number"){
      // 通常の処理
      const _surfaceId = surfaceId;
      return Promise.resolve(_surfaceId);
    }
  }
  // そんなサーフェスはない
  console.warn("Shell.hasSurface: surface alias scope:", scopeId + "as" + type+ ", id:" + surfaceId + " is not defined.");
  return Promise.reject("not defined");
}


// 着せ替えメニュー用情報ていきょう
export function getBindGroups(shell: Shell, scopeId: number): Promise<{category: string, parts: string, thumbnail: string}[]> {
  const {char} = shell.config;
  if(char[scopeId] == null){
    return Promise.reject("not defined");
  }
  return Promise.resolve(char[scopeId].bindgroup.map((bindgroup, bindgroupId)=>{
    return bindgroup.name;
  }));
}
