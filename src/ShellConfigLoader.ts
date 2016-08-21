/*
 * shell/master/descript.txt から ShellConfig 構造体を作る
 */

import * as SC from "./ShellConfig";
import * as SU from "./SurfaceUtil";

export function loadFromJSONLike(json: SC.JSONLike): Promise<SC.ShellConfig> {
  const that = new SC.ShellConfig();
  const seriko: SC.JSONLike   = json["seriko"] != null      ? json["seriko"] : {};
  const menu:   SC.JSONLike   = json["menu"]   != null      ? json["menu"]   : {};
  const char = <SC.JSONLike[]>(Array.isArray(json["char"]) ? json["char"]   : []);
  
  // char*
  return Promise.all(char.map((_char, id)=>{
    return loadCharConfig(_char).then((conf)=>{
      that.char[id] = conf;
    });
  })).then((configs)=>{
    // descript.txtからbindgroup探してデフォルト値を反映
    that.char.forEach((_char, charId)=>{
      that.bindgroup[charId] = [];
      _char.bindgroup.forEach((o, animId)=>{
        that.bindgroup[charId][animId] = o.default;
      });
    });
    return that;
  });
}

export function loadCharConfig(char: SC.JSONLike): Promise<SC.CharConfig> {
  const that = new SC.CharConfig();
  // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
  if(Array.isArray(char["bindgroup"])){
    char["bindgroup"].forEach((bindgroup: SC.JSONLike, id: number)=>{
      if(bindgroup != null && typeof bindgroup["name"] === "string"){
        const [category, parts, thumbnail]:string[] = bindgroup["name"].split(",").map((a:string)=> a.trim())
        that.bindgroup[id] = new SC.BindGroupConfig(category, parts, thumbnail, !!Number(bindgroup["default"]));
      }
    });
  }
  /*
  // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
  if(Array.isArray(char["bindoption"])){
    char["bindoption"].forEach((bindoption)=>{
      if(typeof bindoption.group === "string"){
        const [category, ...options] = (""+bindoption.group).split(",").map((a)=>a.trim())
        bindoption.group = {category, options};
      }
    });
  }
  */
  return Promise.resolve(that);
}