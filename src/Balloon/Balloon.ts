import * as SurfaceUtil from "../Util/index";
import {Descript} from '../Model/Config';
import {Surface} from '../Model/Surface';
import BalloonSurface from "./BalloonSurface";
import {BAL} from "./Interfaces";
import {EventEmitter} from "events";
import $ = require("jquery");


export default class Balloon extends EventEmitter {
  public directory: { [key: string]: ArrayBuffer };
  public descript: Descript;
  public balloons: {// filepathとか
    sakura: BAL[],
    kero: BAL[],
    communicate: BAL[],
    online: BAL[],
    arrow: BAL[],
    sstp: BAL,
    thumbnail: BAL
  };
  private attachedBlimp: {
    div: HTMLDivElement,
    surface: BalloonSurface
  }[];

  constructor(directory: { [key: string]: ArrayBuffer }){
    super();
    this.directory = directory;
    this.descript = {};
    this.attachedBlimp = [];
    this.balloons = {
      sakura: [],
      kero: [],
      communicate: [],
      online: [],
      arrow: [],
      sstp: null,
      thumbnail: null
    };
  }

  public load(){
    return Promise.resolve(this)
    .then(()=> this.loadDescript()) // 1st
    .then(()=> this.loadBalloonSurfaces()) // 2nd
    .then(()=> this.loadBalloonDescripts()); // 3rd
  }

  private loadDescript(){
    let dir = this.directory;
    let getName = (dic, reg)=> Object.keys(dic).filter((name)=> reg.test(name))[0] || "";
    let descript_name = getName(dir, /^descript\.txt$/i);
    if(descript_name === ""){
      console.info("descript.txt is not found");
      this.descript = {};
    }else{
      this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
    }
    return Promise.resolve(this);
  }

  private loadBalloonDescripts(){
    let directory = this.directory;
    let balloons = this.balloons;
    let descript = this.descript;
    return new Promise((resolve, reject)=>{
      let keys = Object.keys(directory);
      let hits = keys.filter((filepath)=> /balloon([sk])(\d+)s\.txt$/.test(filepath));
      hits.forEach((filepath)=>{
        let buffer = directory[filepath];
        let _descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(buffer));
        let [__, type, n] = /balloon([sk])(\d+)s\.txt$/.exec(filepath);
        $.extend(true, _descript, descript);
        switch (type){
          case "s": balloons.sakura[Number(n)].descript = _descript; break;
          case "k": balloons.kero[Number(n)].descript = _descript; break;
        }
      });
      resolve(this);
    });
  }

  private loadBalloonSurfaces(){
    let directory = this.directory;
    let balloons = this.balloons;
    let keys = Object.keys(directory);
    let hits = keys.filter((filepath)=> /[^\/]+\.png$/.test(filepath));
    let promises = hits.map((filepath)=>{
      let buffer = directory[filepath];
      return SurfaceUtil.fetchImageFromArrayBuffer(buffer)
      .then((png)=>{
        let cnv = SurfaceUtil.chromakey(png);
        if(/^balloon([ksc])(\d+)\.png$/.test(filepath)){
          let [__, type, n] = /^balloon([ksc])(\d+)\.png$/.exec(filepath);
          switch (type){
            case "s": balloons.sakura[Number(n)] = {canvas: cnv, descript:{}}; break;
            case "k": balloons.kero[Number(n)] = {canvas: cnv, descript:{}}; break;
            case "c": balloons.communicate[Number(n)] = {canvas: cnv, descript:{}}; break;
          }
        }else if( /^online(\d+)\.png$/.test(filepath)){
          let [__, n] = /^online(\d+)\.png$/.exec(filepath);
          balloons.online[Number(n)] = {canvas: cnv, descript:{}};
        }else if( /^arrow(\d+)\.png$/.test(filepath)){
          let [__, n] = /^arrow(\d+)\.png$/.exec(filepath);
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

  public unload(){
    this.attachedBlimp.forEach(({div, surface})=> surface.destructor());
    this.removeAllListeners();
    Object.keys(this).forEach((key)=> this[key] = null);
    return;
  }

  public attachBlimp(element, scopeId, balloonId){
    let type = scopeId === 0 ? "sakura" : "kero";
    if(!(this.balloons[type] != null && this.balloons[type][balloonId] != null)){
      console.warn("balloon id:", balloonId, "is not defined");
      return null;
    }
    let blimp = new BalloonSurface(element, scopeId, balloonId, this);
    this.attachedBlimp.push({surface:blimp, div: element});
    return blimp;
  }

  public detachBlimp(element){
    let hits = this.attachedBlimp.filter((a)=> a.div === element);
    if (hits.length === 0){
      return;
    }
    hits[0].surface.destructor();
    this.attachedBlimp.splice(this.attachedBlimp.indexOf(hits[0]), 1);
    return;
  }


}