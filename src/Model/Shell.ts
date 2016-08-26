/*
 * shell/master/*** 以下のリソースを一元管理するための バリアント型
 */
import * as Util from "../Util/index";
import {SurfaceDefinitionTree} from "./SurfaceDefinitionTree";
import {Descript, JSONLike, Config} from "./Config";
import {SurfacesTxt} from "surfaces_txt2yaml";

export type Directory = { [filepath: string]: ArrayBuffer };

export class Shell {

  directory: Directory; // filepathに対応するファイルのArrayBuffer

  descript:     Descript; // descript.txtをcsvと解釈した時の値
  descriptJSON: JSONLike; // descript.txtをjsonと解釈した時の値
  config:       Config; // 実際に有効なdescript

  surfacesTxt: SurfacesTxt; // SurfacesTxt2Yamlの内容
  surfaceDefTree: SurfaceDefinitionTree; // このshell.jsが解釈しているShellのリソースツリー
  
  constructor() {
    this.directory = {};

    this.descript = {};
    this.descriptJSON = {};
    this.config = new Config();

    this.surfacesTxt = <SurfacesTxt>{};
    this.surfaceDefTree = new SurfaceDefinitionTree();
  }
}



export function getSurfaceAlias(shell: Shell, scopeId: number, surfaceId: number|string): Promise<number> {
  const {aliases, surfaces} = shell.surfaceDefTree;
  const type = Util.scope(scopeId);
  if(typeof surfaceId === "string" || typeof surfaceId === "number"){
    if(aliases[type] != null && aliases[type][surfaceId] != null){
      // まずエイリアスを探す
      const _surfaceId = Util.choice<number>(aliases[type][surfaceId]);
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
