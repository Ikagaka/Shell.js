/// <reference path="../typings/index.d.ts" />
/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SR = require("./SurfaceRenderer");
var SU = require("./SurfaceUtil");
var CC = require("./CanvasCache");
var ST = require("./SurfaceTree");
var SurfaceBaseRenderer = (function (_super) {
    __extends(SurfaceBaseRenderer, _super);
    function SurfaceBaseRenderer(shell) {
        _super.call(this);
        this.bases = [];
        this.shell = shell;
        this.cache = new CC.CanvasCache(shell.directory);
    }
    SurfaceBaseRenderer.prototype.preload = function () {
        var _this = this;
        var surfaces = this.shell.surfaceDefTree.surfaces;
        console.time("preload");
        return Promise.all(surfaces.map(function (surface, n) { return _this.getBaseSurface(n); })).then(function () {
            console.timeEnd("preload");
            _this.cache.clear();
            return _this;
        });
    };
    SurfaceBaseRenderer.prototype.getBaseSurface = function (n) {
        var _this = this;
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
        return Promise.all(elms.map(function (_a) {
            var file = _a.file, type = _a.type, x = _a.x, y = _a.y;
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
            return cache.getCanvas(file, asis)
                .then(function (cnv) { return { file: file, type: type, x: x, y: y, canvas: new SR.SurfaceCanvas(cnv) }; })
                .catch(function (err) {
                console.warn("SurfaceBaseRenderer#getBaseSurface: no such a file", file, n, srf);
            });
        })).then(function (elms) {
            _this.composeElements(elms);
            // キャッシング
            bases[n] = new SR.SurfaceCanvas(SU.copy(_this.cnv));
            return bases[n];
        });
    };
    SurfaceBaseRenderer.prototype.getBaseSurfaceSize = function (n) {
        return this.getBaseSurface(n).then(function (srfCnv) {
            return {
                width: srfCnv.baseWidth,
                height: srfCnv.baseHeight
            };
        });
    };
    return SurfaceBaseRenderer;
}(SR.SurfaceRenderer));
exports.SurfaceBaseRenderer = SurfaceBaseRenderer;
