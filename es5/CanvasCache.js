/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
"use strict";
var SU = require("./SurfaceUtil");
var CanvasCache = (function () {
    function CanvasCache(dir) {
        this.directory = dir;
        this.cache = {};
    }
    CanvasCache.prototype.hasFile = function (path) {
        return SU.has(this.directory, path);
    };
    CanvasCache.prototype.hasCache = function (path) {
        return SU.has(this.cache, path);
    };
    CanvasCache.prototype.getFile = function (path) {
        return SU.get(this.directory, path);
    };
    CanvasCache.prototype.getCache = function (path) {
        return SU.get(this.cache, path);
    };
    CanvasCache.prototype.getCanvas = function (path, asis, retry) {
        var _this = this;
        if (asis === void 0) { asis = false; }
        if (retry === void 0) { retry = true; }
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
    };
    CanvasCache.prototype.clear = function () {
        this.cache = {};
    };
    return CanvasCache;
}());
exports.CanvasCache = CanvasCache;
