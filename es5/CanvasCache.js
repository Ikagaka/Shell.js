/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("../typings/index.d.ts");
var SU = require("./SurfaceUtil");

var CanvasCache = function () {
    function CanvasCache(dir) {
        _classCallCheck(this, CanvasCache);

        this.directory = dir;
        this.cache = {};
    }

    _createClass(CanvasCache, [{
        key: "hasFile",
        value: function hasFile(path) {
            return SU.has(this.directory, path);
        }
    }, {
        key: "hasCache",
        value: function hasCache(path) {
            return SU.has(this.cache, path);
        }
    }, {
        key: "getFile",
        value: function getFile(path) {
            return SU.get(this.directory, path);
        }
    }, {
        key: "getCache",
        value: function getCache(path) {
            return SU.get(this.cache, path);
        }
    }, {
        key: "getCanvas",
        value: function getCanvas(path) {
            var _this = this;

            var asis = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
            var retry = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            if (asis && this.hasCache(path) !== "") {
                // 色抜き後のキャッシュがあった
                return Promise.resolve(this.cache[path]);
            }
            return this.getFile(path).then(SU.ABToCav).then(function (png) {
                if (asis) {
                    // 色抜き前でいい(色抜きが重いので色抜き前で良いならABからBlobしてIMGしてCNVしてしまう)
                    return Promise.resolve(png);
                }
                var pna_name = SU.changeFileExtension(path, "pna");
                return _this.getCanvas(pna_name, true /* pna読み出しなのでasis適用しない */, false /* リトライしない */).then(function (pna) {
                    // pnaあったので色抜き
                    return SU.png_pna(png, pna);
                }).catch(function (err) {
                    // pnaとかなかったのでそのまま色抜き
                    return SU.chromakey(png);
                }).then(function (cnv) {
                    // 色抜き後のキャッシング
                    _this.cache[path] = cnv;
                    return cnv;
                });
            }).catch(function (err) {
                // そもそもpngファイルがなかった
                if (retry === false) {
                    // 二度目はない
                    return Promise.reject(err);
                }
                // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
                if (_this.hasFile(path + ".png") === "") {
                    // それでもやっぱりpngファイルがなかった
                    console.warn("CanvasCache#getCanvas: ", err, path, _this.directory);
                    return Promise.reject(err);
                }
                // なんとpngファイルがあった
                console.warn("CanvasCache#getCanvas: ", "element file " + path + " need '.png' extension");
                // 拡張子つけてリトライ
                return _this.getCanvas(path + ".png", asis, false /* 二度目はない */);
            });
        }
    }, {
        key: "clear",
        value: function clear() {
            this.cache = {};
        }
    }]);

    return CanvasCache;
}();

exports.CanvasCache = CanvasCache;