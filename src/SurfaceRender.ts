/// <reference path="../typings/tsd.d.ts"/>

import {SurfaceCanvas, SurfaceElement} from "./Interfaces";
import * as SurfaceUtil from "./SurfaceUtil";


export default class SurfaceRender {
  // baseCanvas
  cnv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  // GCの発生を抑えるためバッファを使いまわす
  tmpcnv: HTMLCanvasElement;
  tmpctx: CanvasRenderingContext2D;

  // overlayではみ出した際canvasのリサイズがされるがその時の補正値
  basePosX: number;
  basePosY: number;
  baseWidth: number;
  baseHeight: number;

  debug: boolean;

  use_self_alpha: boolean;

  // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
  // nullならば1x1のCanvasをベースサーフェスとする。
  // 渡されたSurfaceCanvasは変更しない。
  constructor(opt?:{use_self_alpha: boolean;}) {
    this.use_self_alpha = false;
    this.cnv = SurfaceUtil.createCanvas();
    this.ctx = this.cnv.getContext("2d");
    this.tmpcnv = SurfaceUtil.createCanvas();
    this.tmpctx = this.tmpcnv.getContext("2d");
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
    this.debug = false;
  }

  // バッファを使いまわすためのリセット
  // clearは短形を保つがリセットは1x1になる
  reset(): void {
    this.cnv.width = 1;
    this.cnv.height = 1;
    this.tmpcnv.width = 1;
    this.tmpcnv.height = 1;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
  }

  public getSurfaceCanvas(): SurfaceCanvas {
    return {cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null};
  }

  // [
  //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
  //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
  // ]
  public composeElements(elements: SurfaceElement[]): void {
    // V8による最適化のためfor文に
    const keys = Object.keys(elements);
    for(let i=0; i<keys.length; i++){
      const {canvas, type, x, y} = elements[keys[i]];
      this.composeElement(canvas, type, x, y);
    }
  }

  private composeElement(canvas: SurfaceCanvas, type: string, x=0, y=0): void {
    if (canvas.cnv == null && canvas.png == null){
      // element 合成のみで作られるサーフェスの base は dummy SurfaceCanvas
      return;
    }
    if(!this.use_self_alpha) canvas = SurfaceUtil.pna(canvas);
    if(this.baseWidth === 0 || this.baseHeight === 0){
      // このサーフェスはまだ base を持たない
      this.base(canvas);
      return;
    }
    switch (type) {
      case "base":        this.base(canvas);              break;
      case "overlay":     this.overlay(canvas, x, y);     break;
      case "add":         this.add(canvas, x, y);         break;
      case "bind":        this.add(canvas, x, y);         break; // 旧仕様bindはaddへ
      case "overlayfast": this.overlayfast(canvas, x, y); break;
      case "replace":     this.replace(canvas, x, y);     break;
      case "interpolate": this.interpolate(canvas, x, y); break;
      case "move":        this.move(x, y);                break;
      case "asis":        this.asis(canvas, x, y);        break;
      case "reduce":      this.reduce(canvas, x, y);      break;
      default:
        console.warn("SurfaceRender#composeElement", "unkown compose method", canvas, type, x, y);
    }
  }

  public clear(): void {
    this.cnv.width = this.cnv.width;
  }

  //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
  //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
  //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
  //着せ替え・elementでも使用できる。
  public base(part: SurfaceCanvas): void {
    if (! (part.cnv instanceof HTMLCanvasElement)){
      console.error("SurfaceRender#base", "base surface is not defined", part);
      return;
    }
    this.baseWidth = part.cnv.width;
    this.baseHeight = part.cnv.height;
    SurfaceUtil.init(this.cnv, this.ctx, part.cnv)
  }

  private prepareOverlay(part: SurfaceCanvas, x: number, y: number): void {
    // baseのcanvasを拡大するためのキャッシュ
    const tmp = SurfaceUtil.fastcopy(this.cnv, this.tmpcnv, this.tmpctx);
    let offsetX = 0;
    let offsetY = 0;
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
        offsetY = this.cnv.height - tmp.height;
      }
    }
    if(this.debug){
      this.ctx.fillStyle = "lime";
      this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
    }
    this.ctx.drawImage(tmp, offsetX, offsetY); //下位レイヤ再描画
  }

  //下位レイヤにコマを重ねる。
  //着せ替え・elementでも使用できる。
  private overlay(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);//コマ追加
  }

  //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
  //着せ替え・elementでも使用できる。
  private overlayfast(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-atop";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤの透明なところにのみコマを重ねる。
  //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
  //interpolateで重なる部分はベースより上位（手前）側になければならない
  //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
  //着せ替え・elementでも使用できる。
  private interpolate(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
  //着せ替え・elementでも使用できる。
  private replace(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
    this.overlay(part, x, y);
  }

  //下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる。
  //着せ替え・elementでも使用できる。
  //なおelement合成されたサーフェスを他のサーフェスのアニメーションパーツとしてasisメソッドで合成した場合の表示は未定義であるが、
  //Windows上では普通、透過領域は画像本来の抜き色に関係なく黒（#000000）で表示されるだろう。
  private asis(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-over";
    // part.png で png画像をそのまま利用
    this.ctx.drawImage(part.png, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤをXY座標指定分ずらす。
  //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
  //着せ替え・elementでは使用不可。
  private move(x: number, y: number): void{
    // overlayするためだけのものなのでpngやpnaがnullでもまあ問題ない
    const srfCnv:SurfaceCanvas = {cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null};
    this.clear(); // 大きさだけ残して一旦消す
    this.overlay(srfCnv, x, y); //ずらした位置に再描画
  }

  //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
  //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。
  private add(part: SurfaceCanvas, x: number, y: number): void {
    this.overlay(part, x, y);
  }

  //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
  //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
  //http://usada.sakura.vg/contents/seriko.html
  private reduce(part: SurfaceCanvas, x: number, y: number): void {
    if(!this.use_self_alpha) part = SurfaceUtil.pna(part);
    // はみ出しちぇっく
    // prepareOverlay はしない
    const width  = x + part.cnv.width  < this.cnv.width  ? part.cnv.width  : this.cnv.width  - x;
    const height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
    const imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
    const dataA = imgdataA.data;
    const ctxB = part.cnv.getContext("2d");
    const imgdataB = ctxB.getImageData(0, 0, part.cnv.width, part.cnv.height)
    const dataB = imgdataB.data;
    for(let _y=0; _y<height; _y++){
      for(let _x=0; _x<width; _x++){
        const iA = (x+_x)*4 + (y+_y)*this.cnv.width*4; // baseのxy座標とインデックス
        const iB = (_x)*4 + (_y)*part.cnv.width*4;     // partのxy座標とインデックス
        // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
        if(dataB[iB + 3] === 0) dataA[iA + 3] = dataB[iB + 3];
      }
    }
    this.ctx.putImageData(imgdataA, 0, 0);
  }

  public drawRegions(regions: SurfaceRegion[], description="notitle"): void {
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

  private drawRegion(region: SurfaceRegion): void {
    const {type="", name=""} = region;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#00FF00";
    switch (type) {
      case "rect":
        var {left=0, top=0, right=0, bottom=0} = <SurfaceRegionRect>region;
        left += this.basePosX;
        top += this.basePosY;
        right += this.basePosX;
        bottom += this.basePosY;
        this.ctx.beginPath();
        this.ctx.rect(left, top, right - left, bottom - top);
        this.ctx.stroke();
        break;
      case "ellipse":
        var {left=0, top=0, right=0, bottom=0} = <SurfaceRegionEllipse>region;
        left += this.basePosX;
        top += this.basePosY;
        right += this.basePosX;
        bottom += this.basePosY;
        // 実はctx.ellipseはfirefox対応してない
        this.drawEllipseWithBezier(left, top, right - left, bottom - top);
        break;
      case "circle":
        let {radius=0, center_x=0, center_y=0} = <SurfaceRegionCircle>region;
        center_x += this.basePosX;
        center_y += this.basePosY;
        left = center_x;
        top = center_y;
        this.ctx.beginPath();
        this.ctx.arc(center_x, center_y, radius, 0, 2*Math.PI, true);
        this.ctx.stroke();
        break;
      case "polygon":
        const {coordinates=[]} = <SurfaceRegionPolygon>region;
        if(coordinates.length <= 0) break;
        this.ctx.beginPath();
        const {x:startX, y:startY} = coordinates[0];
        left = startX;
        top = startY;
        this.ctx.moveTo(startX, startY);
        for (let i=1; i<coordinates.length; i++){
          const {x, y} = coordinates[i];
          this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(startX, startY);
        this.ctx.stroke();
        break;
      default:
        console.warn("SurfaceRender#drawRegion", "unkown collision shape:", region);
        break;
    }
    this.ctx.font = "35px";
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "white";
    this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
    this.ctx.fillStyle = "black";
    this.ctx.fillText(type + ":" + name, left + 5, top + 10);
  }

  // ctx.ellipseは非標準
  private drawEllipseWithBezier(x: number, y: number, w: number, h: number): void {
    const kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle
    this.ctx.beginPath();
    this.ctx.moveTo(x, ym);
    this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.ctx.stroke();
  }
}
