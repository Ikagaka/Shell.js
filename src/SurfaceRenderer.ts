/*
 * surface -> canvas なレンダラ。
 * HTMLCanvasElement もこの層で抽象化する
 */

import * as ST from "./SurfaceTree";
import * as SU from "./SurfaceUtil";


export class SurfaceCanvas {
  // baseCanvas
  cnv: HTMLCanvasElement
  // overlayではみ出した際canvasのリサイズがされるがその時の補正値
  basePosX: number;
  basePosY: number;
  baseWidth: number;
  baseHeight: number;
  constructor(cnv: HTMLCanvasElement) {
    this.cnv = cnv;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = cnv.width;
    this.baseHeight = cnv.height;
  }
}


export class SurfaceRenderer extends SurfaceCanvas {
  // GCの発生を抑えるためバッファを使いまわす
  ctx: CanvasRenderingContext2D;
  tmpcnv: HTMLCanvasElement
  tmpctx: CanvasRenderingContext2D;
  debug: boolean;
  use_self_alpha: boolean;

  // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
  // nullならば1x1のCanvasをベースサーフェスとする。
  // 渡されたSurfaceCanvasは変更しない。
  constructor() {
    super(SU.createCanvas());
    this.ctx = <CanvasRenderingContext2D>this.cnv.getContext("2d");
    this.tmpcnv = SU.createCanvas();
    this.tmpctx = <CanvasRenderingContext2D>this.tmpcnv.getContext("2d");
    this.use_self_alpha = false;
    this.debug = false;
  }

  init(srfCnv: SurfaceCanvas){
    // this を srfCnv の値で置き換え
    this.base(srfCnv);
    this.basePosX = srfCnv.basePosX;
    this.basePosY = srfCnv.basePosY;
    this.baseWidth = srfCnv.baseWidth;
    this.baseHeight = srfCnv.baseHeight;
  }


  // バッファを使いまわすためのリセット
  // clearは短形を保つがリセットは1x1になる
  reset(): void {
    // reshapeの機会を減らすため大きさはそのままにする
    this.ctx.canvas.width = this.ctx.canvas.width;
    this.tmpctx.canvas.width = this.tmpctx.canvas.width;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  // [
  //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
  //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
  // ]
  composeElements(elms: {type: string, x: number, y: number, canvas: SurfaceCanvas}[]): SurfaceCanvas {
    // baseを決定
    const bases = elms.filter(({type})=> type === "base"); 
    const others = elms.filter(({type})=> type !== "base");
    // element[MAX].base > element0 > element[MIN]
    let base = bases.slice(-1)[0]; /* last */
    if(!(base instanceof ST.SurfaceElement)){
      // element[MIN]
      // elms.length > 0なのでundefinedにはならない…はず。
      // お前がbaseになるんだよ
      base = <ST.SurfaceElement&{canvas:SurfaceCanvas}>elms.shift();
      console.warn("SurfaceRenderer#composeElements: base surface not found. failback. base");
      if(base == null){
        console.warn("SurfaceRenderer#composeElements: cannot decide base surface base");
        return this;
      }
    }
    this.base(base.canvas);
    others.forEach(({canvas, type, x, y})=>{
      this.composeElement(canvas, type, x, y);
    });
    return this;
  }

  composeElement(canvas: SurfaceCanvas, type: string, x=0, y=0): void {
    switch (type) {
      case "overlay":     this.overlay(canvas, x, y);     break;
      case "overlayfast": this.overlayfast(canvas, x, y); break;
      case "replace":     this.replace(canvas, x, y);     break;
      case "interpolate": this.interpolate(canvas, x, y); break;
      case "reduce":      this.reduce(canvas, x, y);      break;
      default:
        console.warn("SurfaceRenderer#composeElement:", "unkown compose method", canvas, type, x, y);
    }
  }

  //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
  //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
  //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
  //着せ替え・elementでも使用できる。
  base(part: SurfaceCanvas): void {
    //this.reset();
    this.cnv.width  = part.cnv.width;
    this.cnv.height = part.cnv.height;
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(part.cnv, 0, 0);
  }

  //下位レイヤにコマを重ねる。
  //着せ替え・elementでも使用できる。
  overlay(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
  //着せ替え・elementでも使用できる。
  overlayfast(part: SurfaceCanvas, x: number, y: number): void {
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
    this.prepareOverlay(part, x, y);
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
  }

  //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
  //着せ替え・elementでも使用できる。
  replace(part: SurfaceCanvas, x: number, y: number): void {
    this.prepareOverlay(part, x, y);
    this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
    this.overlay(part, x, y);
  }

  prepareOverlay(part: SurfaceCanvas, x: number, y: number): void { 
    // パーツがはみだす量
    // もし負なら左へはみ出した量
    let left  = this.basePosX + x;
    // もし負なら右へはみ出した量
    let right = this.cnv.width - ((this.basePosX + x) + part.cnv.width);
    // もし負なら上へはみ出した量
    let top  = this.basePosY + y;
    // もし負なら↓へはみ出した量
    let bottom = this.cnv.height - ((this.basePosY + y) + part.cnv.height);
    if(left < 0 || right < 0 || top < 0 || bottom < 0){
      // はみ出し発生
      let offsetX = 0; // ずれた量
      let offsetY = 0;
      console.info("SurfaceRenderer#prepareOverlay: reshape occured");
      // 現状をtmpcnvへコピー
      SU.fastcopy(this.cnv, this.tmpctx);
      if(left<0){
        offsetX = (-left);
        this.cnv.width += (-left); // reshape
        this.basePosX += (-left);
      }
      if(right<0){
        this.cnv.width += (-right); // reshape
      }
      if(top<0){
        offsetY = (-top);
        this.cnv.height += (-top); // reshape
        this.basePosY += (-top);
      }
      if(bottom<0){
        this.cnv.height += (-bottom); // reshape
      }
      this.ctx.drawImage(this.tmpctx.canvas, offsetX, offsetY); //下位レイヤ再描画
    }
    if(this.debug){
      // 基準点描画
      this.ctx.fillStyle = "lime";
      this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
    }
  }

  //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
  //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
  //http://usada.sakura.vg/contents/seriko.html
  reduce(part: SurfaceCanvas, x: number, y: number): void {
    // はみ出しちぇっく prepareOverlay はしない
    const width  = x + part.cnv.width  < this.cnv.width  ? part.cnv.width  : this.cnv.width  - x;
    const height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
    const imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
    const dataA = imgdataA.data;
    // partの透明領域までアクセスする必要がある
    const ctxB = <CanvasRenderingContext2D>part.cnv.getContext("2d");
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

  drawRegions(regions: ST.SurfaceCollision[], description="notitle"): void {
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

  drawRegion(region: ST.SurfaceCollision): void {
    const {type="", name=""} = region;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#00FF00";
    var left=0, top=0, right=0, bottom=0;
    switch (type) {
      case "rect":
        var {left=0, top=0, right=0, bottom=0} = <ST.SurfaceCollisionRect>region;
        left += this.basePosX;
        top += this.basePosY;
        right += this.basePosX;
        bottom += this.basePosY;
        this.ctx.beginPath();
        this.ctx.rect(left, top, right - left, bottom - top);
        this.ctx.stroke();
        break;
      case "ellipse":
        var {left=0, top=0, right=0, bottom=0} = <ST.SurfaceCollisionEllipse>region;
        left += this.basePosX;
        top += this.basePosY;
        right += this.basePosX;
        bottom += this.basePosY;
        // 実はctx.ellipseはfirefox対応してない
        this.drawEllipseWithBezier(left, top, right - left, bottom - top);
        break;
      case "circle":
        let {radius=0, centerX=0, centerY=0} = <ST.SurfaceCollisionCircle>region;
        centerX += this.basePosX;
        centerY += this.basePosY;
        left = centerX;
        top = centerY;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2*Math.PI, true);
        this.ctx.stroke();
        break;
      case "polygon":
        const {coordinates=[]} = <ST.SurfaceCollisionPolygon>region;
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
        console.warn("SurfaceRenderer#drawRegion", "unkown collision shape:", region);
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
  drawEllipseWithBezier(x: number, y: number, w: number, h: number): void {
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




export function isHit(srfCnv: SurfaceCanvas, cols: ST.SurfaceCollision[], x: number, y: number):{transparency: boolean, name: string}{
  const transparency =  SU.isHit(this.cnv, x, y);
  const name = ST.getRegion(cols, x - this.basePosX, y - this.basePosY);
  return {transparency, name};
}

export function copy(srfCnv: SurfaceCanvas): SurfaceCanvas{
  // SurfaceCanvas を元に新しい SurfaceCanvas をつくる
  const srfCnv2 = new SurfaceCanvas(SU.copy(srfCnv.cnv));
  srfCnv2.basePosX = srfCnv.basePosX;
  srfCnv2.basePosY = srfCnv.basePosY;
  srfCnv2.baseWidth = srfCnv.baseWidth;
  srfCnv2.baseHeight = srfCnv.baseHeight;
  return srfCnv2;
}