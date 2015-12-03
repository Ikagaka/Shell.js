/// <reference path="../typings/tsd.d.ts"/>

import {SurfaceCanvas} from "./Interfaces";
import * as SurfaceUtil from "./SurfaceUtil";


export default class SurfaceRender {
  // baseCanvas
  cnv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // overlayではみ出した際canvasのリサイズがされるがその時の補正値
  basePosX: number;
  basePosY: number;
  baseWidth: number;
  baseHeight: number;

  // デバッグ用ログ
  log: {method: string, args:any[]}[];
  debug: boolean;

  use_self_alpha: boolean;

  // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
  // nullならば1x1のCanvasをベースサーフェスとする。
  // 渡されたSurfaceCanvasは変更しない。
  constructor(opt?:{use_self_alpha: boolean;}) {
    this.use_self_alpha = false;
    this.cnv = SurfaceUtil.createCanvas();
    this.ctx = this.cnv.getContext("2d");
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
    this.log = [];
  }

  getSurfaceCanvas(): SurfaceCanvas {
    return {cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null};
  }

  // [
  //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
  //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
  // ]
  composeElements(elements: {canvas: SurfaceCanvas, type: string, x: number, y: number}[]): void {
    elements.forEach(({canvas, type, x, y}, id)=>{
      this.composeElement(canvas, type, x, y);
    });
  }

  composeElement(canvas: SurfaceCanvas, type: string, x: number, y: number): void {
    if (canvas.cnv == null && canvas.png == null){
      // element 合成のみで作られるサーフェスの base は dummy SurfaceCanvas
      return;
    }
    switch (type) {
      case "base":        this.base(canvas);              break;
      case "overlay":     this.overlay(canvas, x, y);     break;
      case "add":         this.add(canvas, x, y);         break;
      case "bind":        this.bind(canvas, x, y);        break;
      case "overlayfast": this.overlayfast(canvas, x, y); break;
      case "replace":     this.replace(canvas, x, y);     break;
      case "interpolate": this.interpolate(canvas, x, y); break;
      case "move":        this.move(x, y);                break;
      case "asis":        this.asis(canvas, x, y);        break;
      case "reduce":      this.reduce(canvas, x, y);      break;
      case "start":
      case "stop":
      case "alternativestart":
      case "alternativestop":
      case "insert": // こいつらはSurfaceRenerの仕事ではない。Surfaceでやって
      default:
        console.warn("SurfaceRender#composeElement", new Error("unsupport type"), canvas, type, x, y);
    }
  }

  clear(): void {
    if(this.debug) this.log.push({method: "clear", args:[]});
    this.cnv.width = this.cnv.width;
  }

  //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
  //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
  //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
  //着せ替え・elementでも使用できる。
  base(part: SurfaceCanvas): void {
    if(this.debug) this.log.push({method: "base", args:[part]});
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if (! (part.cnv instanceof HTMLCanvasElement)){
      console.error("SurfaceRender", "base surface is not defined", part);
      return;
    }
    this.baseWidth = part.cnv.width;
    this.baseHeight = part.cnv.height;
    SurfaceUtil.init(this.cnv, this.ctx, part.cnv)
  }

  prepareOverlay(part: SurfaceCanvas, x: number, y: number): void {
    // baseのcanvasを拡大するためのキャッシュ
    var tmp = SurfaceUtil.copy(this.cnv);
    var offsetX = 0;
    var offsetY = 0;
    // もしパーツが右下へはみだす
    if(x >= 0){
      // 右
      if (x + this.basePosX + part.cnv.width > this.cnv.width){
        this.cnv.width = this.basePosX + x + part.cnv.width;
        //offsetX = this.basePosX;
      }else{
        this.cnv.width = this.cnv.width;
      }
    }
    if(y >= 0){
      // 下
      if(y + this.basePosY + part.cnv.height > this.cnv.height){
        this.cnv.height = y + this.basePosY + part.cnv.height;
        //offsetY = this.basePosY;
      }else{
        this.cnv.height = this.cnv.height;
      }
    }
    // もしパーツが左上へはみだす（ネガティブマージン
    if(x + this.basePosX < 0){
      // もし左へははみ出す
      if(part.cnv.width + x > this.cnv.width){
        // partの横幅がx考慮してもcnvよりでかい
        this.cnv.width = part.cnv.width;
        this.basePosX = -x;
        offsetX = this.basePosX;
      }else{
        this.cnv.width = this.cnv.width - x;
        this.basePosX = -x;
        offsetX = this.cnv.width - tmp.width;
      }
    }
    if(y + this.basePosY < 0){
      // 上
      if(part.cnv.height + y > this.cnv.height){
        // partの縦幅がy考慮してもcnvよりでかい
        this.cnv.height = part.cnv.height;
        this.basePosY = -y;
        offsetY = this.basePosY;
      }else{
        this.cnv.height = this.cnv.height - y;
        this.basePosY = -y;
        offsetY = this.cnv.height - tmp.height
      }
    }
    if(this.debug){
      this.ctx.fillStyle = "lime";
      this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
    }
    //console.log("x", "y","|", "offsetX", "offsetY", "|","basePosX", "basePosY")
    //console.log(x, y,"|", offsetX, offsetY, "|",this.basePosX, this.basePosY)
    //SurfaceUtil.log(SurfaceUtil.copy(part.cnv), "part");
    //SurfaceUtil.log(SurfaceUtil.copy(tmp), "tmp");
    //SurfaceUtil.log(SurfaceUtil.copy(this.cnv), "cnv");
    this.ctx.drawImage(tmp, offsetX, offsetY); //下位レイヤ再描画
    //SurfaceUtil.log(SurfaceUtil.copy(this.cnv), "cnv2");
  }

  //下位レイヤにコマを重ねる。
  //着せ替え・elementでも使用できる。
  overlay(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.baseWidth === 0 || this.baseHeight === 0){
      // このサーフェスはまだ base を持たない
      return this.base(part);
    }
    if(this.debug) this.log.push({method: "overlay", args:[part, x, y]});
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);//コマ追加
  }

  //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
  //着せ替え・elementでも使用できる。
  overlayfast(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "overlayfast", args:[part, x, y]});
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-atop";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤの透明なところにのみコマを重ねる。
  //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
  //interpolateで重なる部分はベースより上位（手前）側になければならない
  //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
  //着せ替え・elementでも使用できる。
  interpolate(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "interpolate", args:[part, x, y]});
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
  //着せ替え・elementでも使用できる。
  replace(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "replace", args:[part, x, y]});
    this.prepareOverlay(part, x, y);
    this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
    this.overlay(part, x, y);
  }

  //下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる。
  //着せ替え・elementでも使用できる。
  //なおelement合成されたサーフェスを他のサーフェスのアニメーションパーツとしてasisメソッドで合成した場合の表示は未定義であるが、
  //Windows上では普通、透過領域は画像本来の抜き色に関係なく黒（#000000）で表示されるだろう。
  asis(part: SurfaceCanvas, x: number, y: number): void {
    // SurfaceUtil.pna はしない
    if(this.debug) this.log.push({method: "asis", args:[part, x, y]});
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(part.png, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤをXY座標指定分ずらす。
  //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
  //着せ替え・elementでは使用不可。
  move(x: number, y: number): void{
    if(this.debug) this.log.push({method: "move", args:[x, y]});
    // overlayするためだけのものなのでpngやpnaがnullでもまあ問題ない
    var srfCnv:SurfaceCanvas = {cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null};
    this.clear(); // 大きさだけ残して一旦消す
    this.overlay(srfCnv, x, y); //ずらした位置に再描画
  }

  //そのコマを着せ替えパーツとして重ねる。現在ではoverlayと同じ。
  //着せ替えパーツとして単純に一つのサーフェスを重ねることしか出来なかった頃の唯一のメソッドで、現在はaddが互換。
  //着せ替えでないアニメーション・elementでの使用は未定義。
  bind(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "bind", args:[part, x, y]});
    this.add(part, x, y);
  }

  //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
  //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。
  add(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "add", args:[part, x, y]});
    this.overlay(part, x, y);
  }

  //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
  //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
  //http://usada.sakura.vg/contents/seriko.html
  reduce(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    if(this.debug) this.log.push({method: "reduce", args:[part, x, y]});
    // はみ出しちぇっく
    // prepareOverlay はしない
    var width  = x + part.cnv.width  < this.cnv.width  ? part.cnv.width  : this.cnv.width  - x;
    var height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
    var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
    var dataA = imgdataA.data;
    var ctxB = part.cnv.getContext("2d");
    var imgdataB = ctxB.getImageData(0, 0, part.cnv.width, part.cnv.height)
    var dataB = imgdataB.data;
    for(var _y=0; _y<height; _y++){
      for(var _x=0; _x<width; _x++){
        var iA = (x+_x)*4 + (y+_y)*this.cnv.width*4; // baseのxy座標とインデックス
        var iB = (_x)*4 + (_y)*part.cnv.width*4;     // partのxy座標とインデックス
        // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
        if(dataB[iB + 3] === 0) dataA[iA + 3] = dataB[iB + 3];
      }
    }
    this.ctx.putImageData(imgdataA, 0, 0);
  }

  init(srfCnv: SurfaceCanvas): void {
    srfCnv = SurfaceUtil.pna(srfCnv);
    console.warn("SurfaceRender#init is deprecated");
    if(this.debug) this.log.push({method: "init", args:[srfCnv]});
    this.baseWidth = srfCnv.cnv.width;
    this.baseHeight = srfCnv.cnv.height;
    SurfaceUtil.init(this.cnv, this.ctx, srfCnv.cnv);
  }

  initImageData(width: number, height: number, data: Uint8ClampedArray): void {
    console.warn("SurfaceRender#initImageData is deprecated");
    if(this.debug) this.log.push({method: "initImageData", args:[width, height, data]});
    this.baseWidth = this.cnv.width = width;
    this.baseHeight = this.cnv.height = height;
    var imgdata = this.ctx.getImageData(0, 0, width, height);
    (<Uint8Array><any>imgdata.data).set(data);
    this.ctx.putImageData(imgdata, 0, 0);
  }

  drawRegions(regions: SurfaceRegion[], description: string): void {
    this.ctx.font = "35px";
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "white";
    this.ctx.strokeText(description, 5, 10);
    this.ctx.fillStyle = "black";
    this.ctx.fillText(description, 5, 10); // surfaceIdを描画
    regions.forEach((col)=>{
      this.drawRegion(col);
    });
  }

  drawRegion(region: SurfaceRegion): void {
    if(this.debug) this.log.push({method: "drawRegion", args:[region]});
    var {type="", name="", left=0, top=0, right=0, bottom=0, coordinates=[], radius=0, center_x=0, center_y=0} = region;
    left += this.basePosX;
    top += this.basePosY;
    right += this.basePosX;
    bottom += this.basePosY;
    center_x += this.basePosX;
    center_y += this.basePosY;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#00FF00";
    switch (type) {
      case "rect":
        this.ctx.rect(left, top, right - left, bottom - top);
        break;
      default:
        console.warn("collision shape:", type, "is not draw it region yet");
        break;
    }
    this.ctx.stroke();
    this.ctx.font = "35px";
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "white";
    this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
    this.ctx.fillStyle = "black";
    this.ctx.fillText(type + ":" + name, left + 5, top + 10);
  }
}

SurfaceRender.prototype.debug = false;
