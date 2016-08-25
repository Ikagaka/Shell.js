/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SBR = require("./SurfaceBaseRenderer");
var SM = require("./SurfaceModel");
var SurfacePatternRenderer = (function (_super) {
    __extends(SurfacePatternRenderer, _super);
    function SurfacePatternRenderer(shell) {
        _super.call(this, shell);
    }
    SurfacePatternRenderer.prototype.render = function (surface) {
        var _this = this;
        // この this へ現在のサーフェス画像を書き込む
        var surfaceId = surface.surfaceId, renderingTree = surface.renderingTree, surfaceNode = surface.surfaceNode;
        var base = renderingTree.base, foregrounds = renderingTree.foregrounds, backgrounds = renderingTree.backgrounds;
        var enableRegion = this.shell.config.enableRegion;
        var collisions = surfaceNode.collisions, animations = surfaceNode.animations;
        return this.getBaseSurface(base).then(function (baseSrfCnv) {
            // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
            _this.init(baseSrfCnv);
            _this.clear(); // 短形を保ったまま消去
            // この this な srfCnv がreduceの単位元になる
            return _this.convoluteTree(new SM.SurfaceRenderingLayer("overlay", renderingTree, 0, 0)); // 透明な base へ overlay する
        }).then(function () {
            // 当たり判定を描画
            if (enableRegion) {
                backgrounds.forEach(function (layerSet) {
                    layerSet.forEach(function (layer) {
                        _this.drawRegions(layer.surface.collisions, "" + surfaceId);
                    });
                });
                _this.drawRegions((collisions), "" + surfaceId);
                foregrounds.forEach(function (layerSet) {
                    layerSet.forEach(function (layer) {
                        _this.drawRegions(layer.surface.collisions, "" + surfaceId);
                    });
                });
            }
            // debug用
            //console.log(this.bufferRender.log);
            //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
            //document.body.scrollTop = 99999;
            //this.endAll();
            return _this;
        });
    };
    SurfacePatternRenderer.prototype.convoluteTree = function (layer) {
        var _this = this;
        var type = layer.type, surface = layer.surface, x = layer.x, y = layer.y;
        var base = surface.base, backgrounds = surface.backgrounds, foregrounds = surface.foregrounds;
        var process = function (layerSets) {
            return layerSets.reduce(function (prm, layerSet) {
                return layerSet.reduce(function (prm, layer) {
                    return prm.then(function () {
                        return _this.convoluteTree(layer);
                    });
                }, prm);
            }, Promise.resolve());
        };
        return process(backgrounds).then(function () {
            return _this.getBaseSurface(base).then(function (baseSrfCnv) {
                // backgrounds の上に base を描画
                // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
                return _this.composeElement(baseSrfCnv, type, x, y);
            }).catch(console.warn.bind(console));
        } // 失敗してもログ出して解決
        ).then(function () { return process(foregrounds); });
    };
    return SurfacePatternRenderer;
}(SBR.SurfaceBaseRenderer));
exports.SurfacePatternRenderer = SurfacePatternRenderer;
