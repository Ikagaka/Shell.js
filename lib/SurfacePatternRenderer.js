/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */
"use strict";
const SBR = require("./SurfaceBaseRenderer");
const SM = require("./SurfaceModel");
class SurfacePatternRenderer extends SBR.SurfaceBaseRenderer {
    constructor(shell) {
        super(shell);
    }
    render(surface) {
        // この this へ現在のサーフェス画像を書き込む
        const { surfaceId, renderingTree, surfaceNode } = surface;
        const { base, foregrounds, backgrounds } = renderingTree;
        const { enableRegion } = this.shell.config;
        const { collisions, animations } = surfaceNode;
        return this.getBaseSurface(base).then((baseSrfCnv) => {
            // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
            this.init(baseSrfCnv);
            this.clear(); // 短形を保ったまま消去
            // この this な srfCnv がreduceの単位元になる
            this.convoluteTree(new SM.SurfaceRenderingLayer("overlay", renderingTree, 0, 0));
            // 当たり判定を描画
            if (enableRegion) {
                backgrounds.forEach((_, animId) => {
                    this.drawRegions((animations[animId].collisions), "" + surfaceId);
                });
                this.drawRegions((collisions), "" + surfaceId);
                foregrounds.forEach((_, animId) => {
                    this.drawRegions((animations[animId].collisions), "" + surfaceId);
                });
            }
            // debug用
            //console.log(this.bufferRender.log);
            //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
            //document.body.scrollTop = 99999;
            //this.endAll();
            return this;
        });
    }
    convoluteTree(layer) {
        const { type, surface, x, y } = layer;
        const { base, backgrounds, foregrounds } = surface;
        const process = (layerSets) => layerSets.reduce((prm, layerSet) => layerSet.reduce((prm, layer) => prm.then(() => this.convoluteTree(layer)), prm), Promise.resolve());
        return process(backgrounds)
            .then(() => this.getBaseSurface(base).then((baseSrfCnv) => 
        // backgrounds の上に base を描画
        // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
        this.composeElement(baseSrfCnv, type, x, y)))
            .then(() => process(foregrounds));
    }
}
exports.SurfacePatternRenderer = SurfacePatternRenderer;
