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
var SM = require("./SurfaceModel");

var SurfacePatternRenderer = function (_SBR$SurfaceBaseRende) {
    _inherits(SurfacePatternRenderer, _SBR$SurfaceBaseRende);

    function SurfacePatternRenderer(shell) {
        _classCallCheck(this, SurfacePatternRenderer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SurfacePatternRenderer).call(this, shell));
    }

    _createClass(SurfacePatternRenderer, [{
        key: "render",
        value: function render(surface) {
            var _this2 = this;

            // この this へ現在のサーフェス画像を書き込む
            var surfaceId = surface.surfaceId;
            var renderingTree = surface.renderingTree;
            var surfaceNode = surface.surfaceNode;
            var base = renderingTree.base;
            var foregrounds = renderingTree.foregrounds;
            var backgrounds = renderingTree.backgrounds;
            var enableRegion = this.shell.config.enableRegion;
            var collisions = surfaceNode.collisions;
            var animations = surfaceNode.animations;

            return this.getBaseSurface(base).then(function (baseSrfCnv) {
                // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
                _this2.init(baseSrfCnv);
                _this2.clear(); // 短形を保ったまま消去
                // この this な srfCnv がreduceの単位元になる
                _this2.convoluteTree(new SM.SurfaceRenderingLayer("overlay", renderingTree, 0, 0));
                // 当たり判定を描画
                if (enableRegion) {
                    backgrounds.forEach(function (_, animId) {
                        _this2.drawRegions(animations[animId].collisions, "" + surfaceId);
                    });
                    _this2.drawRegions(collisions, "" + surfaceId);
                    foregrounds.forEach(function (_, animId) {
                        _this2.drawRegions(animations[animId].collisions, "" + surfaceId);
                    });
                }
                // debug用
                //console.log(this.bufferRender.log);
                //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
                //document.body.scrollTop = 99999;
                //this.endAll();
                return _this2;
            });
        }
    }, {
        key: "convoluteTree",
        value: function convoluteTree(layer) {
            var _this3 = this;

            var type = layer.type;
            var surface = layer.surface;
            var x = layer.x;
            var y = layer.y;
            var base = surface.base;
            var backgrounds = surface.backgrounds;
            var foregrounds = surface.foregrounds;

            var process = function process(layerSets) {
                return layerSets.reduce(function (prm, layerSet) {
                    return layerSet.reduce(function (prm, layer) {
                        return prm.then(function () {
                            return _this3.convoluteTree(layer);
                        });
                    }, prm);
                }, Promise.resolve());
            };
            return process(backgrounds).then(function () {
                return _this3.getBaseSurface(base).then(function (baseSrfCnv) {
                    return (
                        // backgrounds の上に base を描画
                        // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
                        _this3.composeElement(baseSrfCnv, type, x, y)
                    );
                });
            }).then(function () {
                return process(foregrounds);
            });
        }
    }]);

    return SurfacePatternRenderer;
}(SBR.SurfaceBaseRenderer);

exports.SurfacePatternRenderer = SurfacePatternRenderer;