/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SBR = require("./SurfaceBaseRenderer");
var SR = require("./SurfaceRenderer");

var SurfacePatternRenderer = function (_SBR$SurfaceBaseRende) {
  _inherits(SurfacePatternRenderer, _SBR$SurfaceBaseRende);

  function SurfacePatternRenderer(shell) {
    _classCallCheck(this, SurfacePatternRenderer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SurfacePatternRenderer).call(this, shell));
  }

  _createClass(SurfacePatternRenderer, [{
    key: "render",
    value: function render(srf) {
      return Promise.resolve(SR.copy(this.renderer));
    }
  }]);

  return SurfacePatternRenderer;
}(SBR.SurfaceBaseRenderer);

exports.SurfacePatternRenderer = SurfacePatternRenderer;

var SurfaceLayer = function SurfaceLayer() {
  _classCallCheck(this, SurfaceLayer);
};

exports.SurfaceLayer = SurfaceLayer;

var Layer = function Layer() {
  _classCallCheck(this, Layer);
};

exports.Layer = Layer;
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