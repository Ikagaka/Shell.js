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
  constructor(shell: Shell){
    super(shell);
  }

  render(surface: Surface): Promise<Canvas> {
    // この this へ現在のサーフェス画像を書き込む
    const {surfaceId, renderingTree} = surface;
    const surfaceNode = this.shell.surfaceDefTree[surfaceId];
    const {base, foregrounds, backgrounds} = renderingTree;
    const {enableRegion} = this.shell.config;
    const {collisions, animations} = surfaceNode;
    return this.getBaseSurface(base).then((baseSrfCnv)=>{
      // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
      this.init(baseSrfCnv);
      this.clear(); // 短形を保ったまま消去
      // この this な srfCnv がreduceの単位元になる
      return this.convoluteTree(new SurfaceRenderingLayer("overlay", renderingTree, 0, 0)); // 透明な base へ overlay する
    }).then(()=>{
      // 当たり判定を描画
      if (enableRegion) {
        backgrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
        this.drawRegions((collisions), ""+surfaceId);
        foregrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
      }
      // debug用
      //console.log(this.bufferRender.log);
      //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
      //document.body.scrollTop = 99999;
      //this.endAll();
      return this.srfCnv;
    })
  }

  private convoluteTree(layer: SurfaceRenderingLayer): Promise<void> {
    const {type, surface, x, y} = layer;
    const {base, backgrounds, foregrounds} = surface;
    const process = (layerSets: SurfaceRenderingLayerSet[]):Promise<void> =>
      layerSets.reduce((prm, layerSet)=>
        layerSet.reduce((prm, layer)=>
          prm.then(()=>
            this.convoluteTree(layer)
          ), prm) , Promise.resolve());
    return process(backgrounds).then(()=>
      this.getBaseSurface(base).then((baseSrfCnv)=>
        // backgrounds の上に base を描画
        // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
        this.composeElement(baseSrfCnv, type, x, y)
      ).catch(console.warn.bind(console)) // 失敗してもログ出して解決
    ).then(()=> process(foregrounds) );
  }
}


