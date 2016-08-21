/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SR = require("./SurfaceRenderer");
var CC = require("./CanvasCache");
var ST = require("./SurfaceTree");

var SurfaceBaseRenderer = function () {
    function SurfaceBaseRenderer(shell) {
        _classCallCheck(this, SurfaceBaseRenderer);

        this.bases = [];
        this.shell = shell;
        this.cache = new CC.CanvasCache(shell.directory);
        this.renderer = new SR.SurfaceRenderer();
    }

    _createClass(SurfaceBaseRenderer, [{
        key: "getBaseSurface",
        value: function getBaseSurface(n) {
            // elements を合成するだけ
            var surfaceTree = this.shell.surfaceDefTree.surfaces;
            var cache = this.cache;
            var bases = this.bases;
            var renderer = this.renderer;
            var srf = surfaceTree[n];
            if (!(srf instanceof ST.SurfaceDefinition) || srf.elements.length === 0) {
                // そんな定義なかった || element0も何もなかった
                console.warn("Surface#composeBaseSurface: no such a surface", n, srf);
                return Promise.reject("no such a surface");
            }
            if (bases[n] instanceof SR.SurfaceCanvas) {
                // キャッシュがあった
                return Promise.resolve(bases[n]);
            }
            var elms = srf.elements;
            return Promise.all(elms.map(function (_ref) {
                var file = _ref.file;
                var type = _ref.type;
                var x = _ref.x;
                var y = _ref.y;

                // asisはここで処理しちゃう
                var asis = false;
                if (type === "asis") {
                    type = "overlay"; // overlayにしとく
                    asis = true;
                }
                if (type === "bind" || type === "add") {
                    type = "overlay"; // overlayにしとく
                }
                // ファイルとりにいく
                return cache.getCanvas(file, asis).then(function (cnv) {
                    return { file: file, type: type, x: x, y: y, canvas: new SR.SurfaceCanvas(cnv) };
                }).catch(function (err) {
                    console.warn("Surface#composeBaseSurface: no such a file", file, n, srf);
                });
            })).then(function (elms) {
                return renderer.composeElements(elms);
            }).then(function (srfCnv) {
                // basesurfaceの大きさはbasesurfaceそのもの
                srfCnv.basePosX = 0;
                srfCnv.basePosY = 0;
                srfCnv.baseWidth = srfCnv.cnv.width;
                srfCnv.baseHeight = srfCnv.cnv.height;
                // キャッシング
                bases[n] = SR.copy(srfCnv);
                return srfCnv;
            });
        }
    }, {
        key: "getBaseSurfaceSize",
        value: function getBaseSurfaceSize(n) {
            return this.getBaseSurface(n).then(function (srfCnv) {
                return {
                    width: srfCnv.baseWidth,
                    height: srfCnv.baseHeight
                };
            });
        }
    }]);

    return SurfaceBaseRenderer;
}();

exports.SurfaceBaseRenderer = SurfaceBaseRenderer;