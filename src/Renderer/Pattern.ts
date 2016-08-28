/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */

import * as Util from "../Util/index";
import {SurfaceRenderingLayer, SurfaceRenderingLayerSet} from "../Model/SurfaceRenderingTree"
import * as ST from "../Model/SurfaceDefinitionTree";
import {Shell} from "../Model/Shell";
import {Surface} from "../Model/Surface";
import {Canvas} from "../Model/Canvas";
import {SurfaceBaseRenderer} from "./BaseSurface";
import {Renderer} from "./Renderer";

export class SurfacePatternRenderer extends SurfaceBaseRenderer {
  rndr: Renderer;
  // this.rndr.srfCnv は pattern が描画され
  // this.srfCnv は　base が描画される
  // 使い分け注意
  // 本当は継承したくないのだけれど・・・？
  constructor(shell: Shell){
    super(shell);
    this.rndr = new Renderer();
  }

  render(surface: Surface): Promise<Canvas> {
    // この this へ現在のサーフェス画像を書き込む
    const {surfaceId, renderingTree} = surface;
    const surfaceNode = this.shell.surfaceDefTree.surfaces[surfaceId];
    const {base, foregrounds, backgrounds} = renderingTree;
    const {enableRegion} = this.shell.config;
    const {collisions, animations} = surfaceNode;
    return this.getBaseSurface(base).then((baseSrfCnv)=>{
      // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
      this.rndr.init(baseSrfCnv);
      this.rndr.clear(); // 短形を保ったまま消去
      // この this な srfCnv がreduceの単位元になる
      return this.convoluteTree(new SurfaceRenderingLayer("overlay", renderingTree, 0, 0)); // 透明な base へ overlay する
    }).then(()=>{
      // 当たり判定を描画
      if (enableRegion) {
        backgrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.rndr.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
        this.rndr.drawRegions((collisions), ""+surfaceId);
        foregrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.rndr.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
      }
      // debug用
      //console.log(this.bufferRender.log);
      //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
      //document.body.scrollTop = 99999;
      //this.endAll();
      return this.rndr.srfCnv;
    })
  }

  private convoluteTree(layer: SurfaceRenderingLayer): Promise<void> {
    // debug
    // const a = Util.craetePictureFrame("convTree")
    const {type, surface, x, y} = layer;
    const {base, backgrounds, foregrounds} = surface;
    const process = (layerSets: SurfaceRenderingLayerSet[]):Promise<void> =>
      layerSets.reduce((prm, layerSet)=>
        layerSet.reduce((prm, layer)=>
          prm.then(()=>
            this.convoluteTree(layer)
          ), prm) , Promise.resolve());
    return process(backgrounds).then(()=>
      this.getBaseSurface(base).then((baseSrfCnv)=>{
        // backgrounds の上に base を描画
        // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
        // a.add(Util.copy(this.rndr.srfCnv.cnv), "current");
        // a.add(Util.copy(baseSrfCnv.cnv), "base");
        this.rndr.composeElement(baseSrfCnv, type, x, y);
        // a.add(Util.copy(this.rndr.srfCnv.cnv), "result");
      }).catch(console.warn.bind(console)) // 失敗してもログ出して解決
    ).then(()=> process(foregrounds) );
  }
}


