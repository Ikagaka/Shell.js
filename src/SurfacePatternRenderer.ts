/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */

import * as SBR from "./SurfaceBaseRenderer";
import * as ST from "./SurfaceTree";
import * as SU from "./SurfaceUtil";
import * as SH from "./ShellModel";
import * as SR from "./SurfaceRenderer";
import * as SM from "./SurfaceModel";
import * as SRT from "./SurfaceRenderingTree";

export class SurfacePatternRenderer extends SBR.SurfaceBaseRenderer {
  constructor(shell: SH.Shell){
    super(shell);
  }
  render(tree: SRT.SurfaceRenderingTree): Promise<SR.SurfaceCanvas> {
    return Promise.resolve(SR.copy(this.renderer));
  }
}




/*

export function solveAnimationPattern(n:number): ST.SurfaceAnimationPattern[][]{
  const patses: ST.SurfaceAnimationPattern[][] = [];
  const srf = this.surfaceTree[n];
  if(!(srf instanceof ST.SurfaceDefinition)){
    // そんな定義なかった || element0も何もなかった
    console.warn("Surface#solveAnimationPattern: no such a surface", n, srf);
    return patses;
  }
  srf.animations.forEach(({intervals, options, patterns}, animId)=>{
    if(intervals.length === 1 && intervals[0][0] === "bind" && this.isBind(animId)){
      // 対象のサーフェスのパターンで bind で有効な着せ替えな animId
      patses[animId] = [];
      patterns.forEach(({type, animation_ids}, patId)=>{
        if(type === "insert"){
          // insertの場合は対象のIDをとってくる
          const insertId = animation_ids[0];
          const anim = this.surfaceNode.animations[insertId];
          if(!(anim instanceof ST.SurfaceAnimation)){
            console.warn("Surface#solveAnimationPattern", "insert id", animation_ids, "is wrong target.", n, patId);
            return;
          }
          // insertをねじ込む
          patses[animId] = patses[animId].concat(anim.patterns);
          return;
        }
        // insertでない処理
        patses[animId].push(patterns[patId]);
      });
    }
  });
  return patses;
}
*/

/*
export function composeAnimationPart(n: number, log: number[]=[]): Promise<SurfaceCanvas> {
  if(log.indexOf(n) != -1){
    // 循環参照
    console.warn("Surface#composeAnimationPart: recursive definition detected", n, log);
    return Promise.reject("recursive definition detected");
  }
  const srf = this.surfaceTree[n];
  if(!(srf instanceof ST.SurfaceDefinition)){
    // そんな定義なかった || element0も何もなかった
    console.warn("Surface#composeAnimationPart: no such a surface", n, srf);
    return Promise.reject("no such a surface");
  }
  // サーフェス n で表示すべきpatternをもらってくる
  const patses = this.solveAnimationPattern(n);
  const layers = patses.map((patterns, animId)=>{
    // n の animId な MAYUNA レイヤセットのレイヤが pats
    const layerset = Promise.all(patterns.map(({type, surface, wait, x, y}, patId)=>{
      // 再帰的に画像読むよ
      return this.composeAnimationPart(n, log.concat(n)).then((canvas)=>{
        return {type, x, y, canvas};
      }); 
    }));
    return layerset;
  });
  return Promise.all(layers).then((layers)=>{
    // パターン全部読めたっぽいので分ける
    const backgrounds = layers.filter((_, animId)=>{
      const options = srf.animations[animId].options
      return options.some(([opt, args])=> opt === "background")
    })
    const foregrounds = layers.filter((_, animId)=>{
      const options = srf.animations[animId].options
      return options.every(([opt, args])=> opt !== "background")
    });
    // パターン全部読めたっぽいのでベースを読む
    return this.composeBaseSurface(n).then((base)=>{
      //this.bufferRender.composePatterns({base, foregrounds, backgrounds});
      return this.bufferRender;
    });
  });
}
*/
/*
export function render(): void {
  
  if(this.destructed) return;
  this.layers.filter((anim_id)=>{})
  const backgrounds = this.composeAnimationPatterns(this.backgrounds);//再生途中のアニメーション含むレイヤ
  const elements = (this.surfaceNode.elements);
  const base = this.surfaceNode.base;
  const fronts = this.composeAnimationPatterns(this.layers);//再生途中のアニメーション含むレイヤ
  let baseWidth = 0;
  let baseHeight = 0;
  this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
  // ベースサーフェス作る
  if(this.dynamicBase != null){
    // pattern base があればそちらを使用
    this.bufferRender.composeElements([this.dynamicBase]);
    baseWidth = this.bufferRender.cnv.width;
    baseHeight = this.bufferRender.cnv.height;
  } else {
    // base+elementでベースサーフェス作る
    this.bufferRender.composeElements(
      elements[0] != null ?
        // element0, element1...
        elements :
          base !=null ?
            // base, element1, element2...
            [{type: "overlay", canvas: base, x: 0, y: 0}].concat(elements)
            : []);
    // elementまでがベースサーフェス扱い
    baseWidth = this.bufferRender.cnv.width;
    baseHeight = this.bufferRender.cnv.height;
  }
  const composedBase = this.bufferRender.getSurfaceCanvas();
  // アニメーションレイヤー
  this.bufferRender.composeElements(backgrounds);
  this.bufferRender.composeElements([{type: "overlay", canvas: composedBase, x: 0, y: 0}]); // 現在有効な ベースサーフェスのレイヤを合成
  this.bufferRender.composeElements(fronts);
  // 当たり判定を描画
  if (this.config.enableRegion) {
    this.bufferRender.drawRegions((this.surfaceNode.collisions), ""+this.surfaceId);
    this.backgrounds.forEach((_, animId)=>{
      this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
    });
    this.layers.forEach((_, animId)=>{
      this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
    });
  }
  // debug用
  //console.log(this.bufferRender.log);
  //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
  //document.body.scrollTop = 99999;
  //this.endAll();

  // バッファから実DOMTree上のcanvasへ描画
  SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv);
  // 位置合わせとか
  $(this.element).width(baseWidth);//this.cnv.width - bufRender.basePosX);
  $(this.element).height(baseHeight);//this.cnv.height - bufRender.basePosY);
  $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
  $(this.cnv).css("left", -this.bufferRender.basePosX);
  
}

*/