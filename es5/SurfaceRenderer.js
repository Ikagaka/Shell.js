/*
 * surface -> canvas なレンダラ。
 * HTMLCanvasElement もこの層で抽象化する
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ST = require("./SurfaceTree");
var SU = require("./SurfaceUtil");
var SurfaceCanvas = (function () {
    function SurfaceCanvas(cnv) {
        this.cnv = cnv;
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = cnv.width;
        this.baseHeight = cnv.height;
    }
    return SurfaceCanvas;
}());
exports.SurfaceCanvas = SurfaceCanvas;
var SurfaceRenderer = (function (_super) {
    __extends(SurfaceRenderer, _super);
    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。
    function SurfaceRenderer(cnv) {
        _super.call(this, cnv == null ? SU.createCanvas() : cnv);
        this.ctx = this.cnv.getContext("2d");
        this.tmpcnv = SU.createCanvas();
        this.tmpctx = this.tmpcnv.getContext("2d");
        this.use_self_alpha = false;
        this.debug = false;
    }
    SurfaceRenderer.prototype.init = function (srfCnv) {
        // this を srfCnv の値で置き換え
        this.base(srfCnv);
        this.basePosX = srfCnv.basePosX;
        this.basePosY = srfCnv.basePosY;
        this.baseWidth = srfCnv.baseWidth;
        this.baseHeight = srfCnv.baseHeight;
    };
    // バッファを使いまわすためのリセット
    // clearは短形を保つがリセットは1x1になる
    SurfaceRenderer.prototype.reset = function () {
        // reshapeの機会を減らすため大きさはそのままにする
        this.ctx.canvas.width = this.ctx.canvas.width;
        this.tmpctx.canvas.width = this.tmpctx.canvas.width;
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = 0;
        this.baseHeight = 0;
    };
    SurfaceRenderer.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    };
    // [
    //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
    //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
    // ]
    SurfaceRenderer.prototype.composeElements = function (elms) {
        var _this = this;
        // baseを決定
        var bases = elms.filter(function (_a) {
            var type = _a.type;
            return type === "base";
        });
        var others = elms.filter(function (_a) {
            var type = _a.type;
            return type !== "base";
        });
        // element[MAX].base > element0 > element[MIN]
        var base = bases.slice(-1)[0]; /* last */
        if (!(base instanceof ST.SurfaceElement)) {
            // element[MIN]
            // elms.length > 0なのでundefinedにはならない…はず。
            // お前がbaseになるんだよ
            base = elms.shift();
            console.warn("SurfaceRenderer#composeElements: base surface not found. failback. base");
            if (base == null) {
                console.warn("SurfaceRenderer#composeElements: cannot decide base surface base");
                return this;
            }
        }
        this.base(base.canvas);
        others.forEach(function (_a) {
            var canvas = _a.canvas, type = _a.type, x = _a.x, y = _a.y;
            _this.composeElement(canvas, type, x, y);
        });
        return this;
    };
    SurfaceRenderer.prototype.composeElement = function (canvas, type, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        switch (type) {
            case "overlay":
                this.overlay(canvas, x, y);
                break;
            case "overlayfast":
                this.overlayfast(canvas, x, y);
                break;
            case "replace":
                this.replace(canvas, x, y);
                break;
            case "interpolate":
                this.interpolate(canvas, x, y);
                break;
            case "reduce":
                this.reduce(canvas, x, y);
                break;
            default:
                console.warn("SurfaceRenderer#composeElement:", "unkown compose method", canvas, type, x, y);
        }
    };
    //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
    //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
    //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
    //着せ替え・elementでも使用できる。
    SurfaceRenderer.prototype.base = function (part) {
        //this.reset();
        this.cnv.width = part.cnv.width;
        this.cnv.height = part.cnv.height;
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.drawImage(part.cnv, 0, 0);
    };
    //下位レイヤにコマを重ねる。
    //着せ替え・elementでも使用できる。
    SurfaceRenderer.prototype.overlay = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
    //着せ替え・elementでも使用できる。
    SurfaceRenderer.prototype.overlayfast = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤの透明なところにのみコマを重ねる。
    //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
    //interpolateで重なる部分はベースより上位（手前）側になければならない
    //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
    //着せ替え・elementでも使用できる。
    SurfaceRenderer.prototype.interpolate = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "destination-over";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
    //着せ替え・elementでも使用できる。
    SurfaceRenderer.prototype.replace = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
        this.overlay(part, x, y);
    };
    SurfaceRenderer.prototype.prepareOverlay = function (part, x, y) {
        // パーツがはみだす量
        // もし負なら左へはみ出した量
        var left = this.basePosX + x;
        // もし負なら右へはみ出した量
        var right = this.cnv.width - ((this.basePosX + x) + part.cnv.width);
        // もし負なら上へはみ出した量
        var top = this.basePosY + y;
        // もし負なら↓へはみ出した量
        var bottom = this.cnv.height - ((this.basePosY + y) + part.cnv.height);
        if (left < 0 || right < 0 || top < 0 || bottom < 0) {
            // はみ出し発生
            var offsetX = 0; // ずれた量
            var offsetY = 0;
            console.info("SurfaceRenderer#prepareOverlay: reshape occured");
            // 現状をtmpcnvへコピー
            SU.fastcopy(this.cnv, this.tmpctx);
            if (left < 0) {
                offsetX = (-left);
                this.cnv.width += (-left); // reshape
                this.basePosX += (-left);
            }
            if (right < 0) {
                this.cnv.width += (-right); // reshape
            }
            if (top < 0) {
                offsetY = (-top);
                this.cnv.height += (-top); // reshape
                this.basePosY += (-top);
            }
            if (bottom < 0) {
                this.cnv.height += (-bottom); // reshape
            }
            this.ctx.drawImage(this.tmpctx.canvas, offsetX, offsetY); //下位レイヤ再描画
        }
        if (this.debug) {
            // 基準点描画
            this.ctx.fillStyle = "lime";
            this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
        }
    };
    //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
    //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
    //http://usada.sakura.vg/contents/seriko.html
    SurfaceRenderer.prototype.reduce = function (part, x, y) {
        // はみ出しちぇっく prepareOverlay はしない
        var width = x + part.cnv.width < this.cnv.width ? part.cnv.width : this.cnv.width - x;
        var height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
        var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
        var dataA = imgdataA.data;
        // partの透明領域までアクセスする必要がある
        var ctxB = part.cnv.getContext("2d");
        var imgdataB = ctxB.getImageData(0, 0, part.cnv.width, part.cnv.height);
        var dataB = imgdataB.data;
        for (var _y = 0; _y < height; _y++) {
            for (var _x = 0; _x < width; _x++) {
                var iA = (x + _x) * 4 + (y + _y) * this.cnv.width * 4; // baseのxy座標とインデックス
                var iB = (_x) * 4 + (_y) * part.cnv.width * 4; // partのxy座標とインデックス
                // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
                if (dataB[iB + 3] === 0)
                    dataA[iA + 3] = dataB[iB + 3];
            }
        }
        this.ctx.putImageData(imgdataA, 0, 0);
    };
    SurfaceRenderer.prototype.drawRegions = function (regions, description) {
        var _this = this;
        if (description === void 0) { description = "notitle"; }
        this.ctx.font = "35px";
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = "white";
        this.ctx.strokeText(description, 5, 10);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(description, 5, 10); // surfaceIdを描画
        regions.forEach(function (col) {
            _this.drawRegion(col);
        });
    };
    SurfaceRenderer.prototype.drawRegion = function (region) {
        var _a = region.type, type = _a === void 0 ? "" : _a, _b = region.name, name = _b === void 0 ? "" : _b;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#00FF00";
        var left = 0, top = 0, right = 0, bottom = 0;
        switch (type) {
            case "rect":
                var _c = region, _d = _c.left, left = _d === void 0 ? 0 : _d, _e = _c.top, top = _e === void 0 ? 0 : _e, _f = _c.right, right = _f === void 0 ? 0 : _f, _g = _c.bottom, bottom = _g === void 0 ? 0 : _g;
                left += this.basePosX;
                top += this.basePosY;
                right += this.basePosX;
                bottom += this.basePosY;
                this.ctx.beginPath();
                this.ctx.rect(left, top, right - left, bottom - top);
                this.ctx.stroke();
                break;
            case "ellipse":
                var _h = region, _j = _h.left, left = _j === void 0 ? 0 : _j, _k = _h.top, top = _k === void 0 ? 0 : _k, _l = _h.right, right = _l === void 0 ? 0 : _l, _m = _h.bottom, bottom = _m === void 0 ? 0 : _m;
                left += this.basePosX;
                top += this.basePosY;
                right += this.basePosX;
                bottom += this.basePosY;
                // 実はctx.ellipseはfirefox対応してない
                this.drawEllipseWithBezier(left, top, right - left, bottom - top);
                break;
            case "circle":
                var _o = region, _p = _o.radius, radius = _p === void 0 ? 0 : _p, _q = _o.centerX, centerX = _q === void 0 ? 0 : _q, _r = _o.centerY, centerY = _r === void 0 ? 0 : _r;
                centerX += this.basePosX;
                centerY += this.basePosY;
                left = centerX;
                top = centerY;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
                this.ctx.stroke();
                break;
            case "polygon":
                var _s = region.coordinates, coordinates = _s === void 0 ? [] : _s;
                if (coordinates.length <= 0)
                    break;
                this.ctx.beginPath();
                var _t = coordinates[0], startX = _t.x, startY = _t.y;
                left = startX;
                top = startY;
                this.ctx.moveTo(startX, startY);
                for (var i = 1; i < coordinates.length; i++) {
                    var _u = coordinates[i], x = _u.x, y = _u.y;
                    this.ctx.lineTo(x, y);
                }
                this.ctx.lineTo(startX, startY);
                this.ctx.stroke();
                break;
            default:
                console.warn("SurfaceRenderer#drawRegion", "unkown collision shape:", region);
                break;
        }
        this.ctx.font = "35px";
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = "white";
        this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(type + ":" + name, left + 5, top + 10);
    };
    // ctx.ellipseは非標準
    SurfaceRenderer.prototype.drawEllipseWithBezier = function (x, y, w, h) {
        var kappa = .5522848, ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w, // x-end
        ye = y + h, // y-end
        xm = x + w / 2, // x-middle
        ym = y + h / 2; // y-middle
        this.ctx.beginPath();
        this.ctx.moveTo(x, ym);
        this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        this.ctx.stroke();
    };
    return SurfaceRenderer;
}(SurfaceCanvas));
exports.SurfaceRenderer = SurfaceRenderer;
function isHit(srfCnv, cols, x, y) {
    var transparency = SU.isHit(this.cnv, x, y);
    var name = ST.getRegion(cols, x - this.basePosX, y - this.basePosY);
    return { transparency: transparency, name: name };
}
exports.isHit = isHit;
function copy(srfCnv) {
    // SurfaceCanvas を元に新しい SurfaceCanvas をつくる
    var srfCnv2 = new SurfaceCanvas(SU.copy(srfCnv.cnv));
    srfCnv2.basePosX = srfCnv.basePosX;
    srfCnv2.basePosY = srfCnv.basePosY;
    srfCnv2.baseWidth = srfCnv.baseWidth;
    srfCnv2.baseHeight = srfCnv.baseHeight;
    return srfCnv2;
}
exports.copy = copy;
