import * as Util from "../Util/index";
import {Descript, JSONLike} from "../Model/Config";
import {Balloon} from "../Model/Balloon";

export type Directory = { [filepath: string]: ArrayBuffer };

export function load(directory: Directory): Promise<Balloon>{
  const bal = new Balloon();
  const lst = loadBalloonDescript(directory, loadDescript(directory));
  lst.forEach(({type, id, descript, descriptJSON})=>{  
    switch (type){
      case "sakura": bal.balloons.sakura[id] = {descript, descriptJSON}; break;
      case "kero":   bal.balloons.kero[id]   = {descript, descriptJSON}; break;
    }
  });
  return Promise.resolve(bal);
}

export function loadDescript(directory: Directory): Descript {
  const dir = directory;
  const name = Util.fastfind(Object.keys(dir), "descript.txt");
  let descript: Descript = {};
  let descriptJSON: JSONLike = {};
  if (name === "") {
    console.info("Loader.Balloon.loadDescript: descript.txt is not found");
  } else {
    descript = Util.parseDescript(Util.convert(dir[name]));
  }
  return descript;
}
/*
export function loadBalloonDescript(directory: Directory, _descript: Descript): {type: string, id: number, descript: Descript, descriptJSON: JSONLike}[] {
  // todo
  return Object.keys(directory)
  .filter((filepath)=> /balloon([sk])(\d+)s\.txt$/.test(filepath) )
  .map((filepath)=>{ return {filepath, reg: /balloon([sk])(\d+)s\.txt$/.exec(filepath)}; })
  .map(({filepath, reg})=>{ return {filepath, type: reg[1], id: Number(reg[2])}; })
  .map(({filepath, type, id})=>{
    let descript = Util.parseDescript(Util.convert(directory[filepath]));
    let descriptJSON: JSONLike = {};
    Util.extend(true, descript, _descript);
    Object.keys(descript).forEach((key)=>{
      let _key = key
        .replace(/^sakura\./, "char0.")
        .replace(/^kero\./, "char1.");
      Util.decolateJSONizeDescript<JSONLike, string>(descriptJSON, _key, descript[key]);
    });
    return {type:type==="s"?"sakura":"kero", id, descript, descriptJSON};
  });
} 



export function loadBalloonSurfaces(){
  let directory = this.directory;
  let balloons = this.balloons;
  let keys = Object.keys(directory);
  let hits = keys.filter((filepath)=> /[^\/]+\.png$/.test(filepath));
  let promises = hits.map((filepath)=>{
    let buffer = directory[filepath];
    return Util.fetchImageFromArrayBuffer(buffer)
    .then((png)=>{
      let cnv = Util.chromakey(png);
      if(/^balloon([ksc])(\d+)\.png$/.test(filepath)){
        let [__, type, n]:any = /^balloon([ksc])(\d+)\.png$/.exec(filepath);
        switch (type){
          case "s": balloons.sakura[Number(n)] = {canvas: cnv, descript:{}}; break;
          case "k": balloons.kero[Number(n)] = {canvas: cnv, descript:{}}; break;
          case "c": balloons.communicate[Number(n)] = {canvas: cnv, descript:{}}; break;
        }
      }else if( /^online(\d+)\.png$/.test(filepath)){
        let [__, n]:any = /^online(\d+)\.png$/.exec(filepath);
        balloons.online[Number(n)] = {canvas: cnv, descript:{}};
      }else if( /^arrow(\d+)\.png$/.test(filepath)){
        let [__, n]:any = /^arrow(\d+)\.png$/.exec(filepath);
        balloons.arrow[Number(n)] = {canvas: cnv, descript:{}};
      }else if( /^sstp\.png$/.test(filepath)){
        balloons.sstp = {canvas: cnv, descript:{}};
      }else if( /^thumbnail\.png$/.test(filepath)){
        balloons.thumbnail = {canvas: cnv, descript:{}};
      }
    });
  });
  return new Promise((resolve, reject)=>{
    Promise.all(promises).then(()=> resolve(this));
  });
}
*/