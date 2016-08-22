/// <reference path="../typings/index.d.ts" />
/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SR = require("./SurfaceRenderer");
var CC = require("./CanvasCache");
var ST = require("./SurfaceTree");

var SurfaceBaseRenderer = function (_SR$SurfaceRenderer) {
    _inherits(SurfaceBaseRenderer, _SR$SurfaceRenderer);

    function SurfaceBaseRenderer(shell) {
        _classCallCheck(this, SurfaceBaseRenderer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceBaseRenderer).call(this));

        _this.bases = [];
        _this.shell = shell;
        _this.cache = new CC.CanvasCache(shell.directory);
        return _this;
    }

    _createClass(SurfaceBaseRenderer, [{
        key: "preload",
        value: function preload() {
            var _this2 = this;

            var surfaces = this.shell.surfaceDefTree.surfaces;
            console.time("preload");
            return Promise.all(surfaces.map(function (surface, n) {
                return _this2.getBaseSurface(n);
            })).then(function () {
                console.timeEnd("preload");
                _this2.cache.clear();
                return _this2;
            });
        }
    }, {
        key: "getBaseSurface",
        value: function getBaseSurface(n) {
            var _this3 = this;

            // elements を合成するだけ
            var surfaceTree = this.shell.surfaceDefTree.surfaces;
            var cache = this.cache;
            var bases = this.bases;
            var srf = surfaceTree[n];
            if (!(srf instanceof ST.SurfaceDefinition) || srf.elements.length === 0) {
                // そんな定義なかった || element0も何もなかった
                console.warn("SurfaceBaseRenderer#getBaseSurface: no such a surface: " + n);
                return Promise.reject("SurfaceBaseRenderer#getBaseSurface: no such a surface: " + n);
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
                    console.warn("SurfaceBaseRenderer#getBaseSurface: no such a file", file, n, srf);
                });
            })).then(function (elms) {
                return _this3.composeElements(elms);
            }).then(function (srfCnv) {
                // basesurfaceの大きさはbasesurfaceそのもの
                srfCnv.basePosX = 0;
                srfCnv.basePosY = 0;
                srfCnv.baseWidth = srfCnv.cnv.width;
                srfCnv.baseHeight = srfCnv.cnv.height;
                // キャッシング
                bases[n] = SR.copy(srfCnv);
                return bases[n];
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
}(SR.SurfaceRenderer);

exports.SurfaceBaseRenderer = SurfaceBaseRenderer;