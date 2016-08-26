/*
 * shell/master/descript.txt から Config 構造体を作る
 */
import * as Util from "../Util/index";
import {Config, JSONLike, Char, BindGroup} from "../Model/Config";


export function loadFromJSONLike(json: JSONLike): Promise<Config> {
  const that = new Config();
  const seriko: JSONLike   = json["seriko"] != null      ? json["seriko"] : {};
  const menu:   JSONLike   = json["menu"]   != null      ? json["menu"]   : {};
  const char = <JSONLike[]>(Array.isArray(json["char"]) ? json["char"]   : []);
  
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

export function loadCharConfig(char: JSONLike): Promise<Char> {
  const that = new Char();
  // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
  if(char["seriko"] != null && typeof char["seriko"]["alignmenttodesktop"] === "string"){
    switch(char["seriko"]["alignmenttodesktop"]){
      case "left":   that.seriko.alignmenttodesktop = "left";   break;
      case "right":  that.seriko.alignmenttodesktop = "right";  break;
      case "top":    that.seriko.alignmenttodesktop = "top";    break;
      case "bottom": that.seriko.alignmenttodesktop = "bottom"; break;
      case "free":   that.seriko.alignmenttodesktop = "free";   break;
      default: console.warn("ConfigLoader.loadCharConfig: unkown alignmenttodesktop type: ", char["seriko"]["alignmenttodesktop"]);
    }
  }

  
  if(Array.isArray(char["bindgroup"])){
    char["bindgroup"].forEach((bindgroup: JSONLike, id: number)=>{
      if(bindgroup != null && typeof bindgroup["name"] === "string"){
        const [category, parts, thumbnail]:string[] = bindgroup["name"].split(",").map((a:string)=> a.trim())
        that.bindgroup[id] = new BindGroup(category, parts, thumbnail, !!Number(bindgroup["default"]));
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