/// <reference path="../typings/tsd.d.ts"/>
var SurfaceUtil = require("./SurfaceUtil");
var SurfaceRender = (function () {
    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。
    function SurfaceRender(opt) {
        this.use_self_alpha = false;
        this.cnv = SurfaceUtil.createCanvas();
        this.ctx = this.cnv.getContext("2d");
        this.tmpcnv = SurfaceUtil.createCanvas();
        this.tmpctx = this.tmpcnv.getContext("2d");
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = 0;
        this.baseHeight = 0;
        this.debug = false;
    }
    // バッファを使いまわすためのリセット
    // clearは短形を保つがリセットは1x1になる
    SurfaceRender.prototype.reset = function () {
        this.cnv.width = 1;
        this.cnv.height = 1;
        this.tmpcnv.width = 1;
        this.tmpcnv.height = 1;
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = 0;
        this.baseHeight = 0;
    };
    SurfaceRender.prototype.getSurfaceCanvas = function () {
        return { cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null };
    };
    // [
    //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
    //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
    // ]
    SurfaceRender.prototype.composeElements = function (elements) {
        // V8による最適化のためfor文に
        var keys = Object.keys(elements);
        for (var i = 0; i < keys.length; i++) {
            var _a = elements[keys[i]], canvas = _a.canvas, type = _a.type, x = _a.x, y = _a.y;
            this.composeElement(canvas, type, x, y);
        }
    };
    SurfaceRender.prototype.composeElement = function (canvas, type, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (canvas.cnv == null && canvas.png == null) {
            // element 合成のみで作られるサーフェスの base は dummy SurfaceCanvas
            return;
        }
        if (!this.use_self_alpha)
            canvas = SurfaceUtil.pna(canvas);
        if (this.baseWidth === 0 || this.baseHeight === 0) {
            // このサーフェスはまだ base を持たない
            this.base(canvas);
            return;
        }
        switch (type) {
            case "base":
                this.base(canvas);
                break;
            case "overlay":
                this.overlay(canvas, x, y);
                break;
            case "add":
                this.add(canvas, x, y);
                break;
            case "bind":
                this.add(canvas, x, y);
                break; // 旧仕様bindはaddへ
            case "overlayfast":
                this.overlayfast(canvas, x, y);
                break;
            case "replace":
                this.replace(canvas, x, y);
                break;
            case "interpolate":
                this.interpolate(canvas, x, y);
                break;
            case "move":
                this.move(x, y);
                break;
            case "asis":
                this.asis(canvas, x, y);
                break;
            case "reduce":
                this.reduce(canvas, x, y);
                break;
            default:
                console.warn("SurfaceRender#composeElement", "unkown compose method", canvas, type, x, y);
        }
    };
    SurfaceRender.prototype.clear = function () {
        this.cnv.width = this.cnv.width;
    };
    //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
    //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
    //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
    //着せ替え・elementでも使用できる。
    SurfaceRender.prototype.base = function (part) {
        if (!(part.cnv instanceof HTMLCanvasElement)) {
            console.error("SurfaceRender#base", "base surface is not defined", part);
            return;
        }
        this.baseWidth = part.cnv.width;
        this.baseHeight = part.cnv.height;
        SurfaceUtil.init(this.cnv, this.ctx, part.cnv);
    };
    SurfaceRender.prototype.prepareOverlay = function (part, x, y) {
        // baseのcanvasを拡大するためのキャッシュ
        var tmp = SurfaceUtil.fastcopy(this.cnv, this.tmpcnv, this.tmpctx);
        var offsetX = 0;
        var offsetY = 0;
        // もしパーツが右下へはみだす
        if (x >= 0) {
            // 右
            if (x + this.basePosX + part.cnv.width > this.cnv.width) {
                this.cnv.width = this.basePosX + x + part.cnv.width;
            }
            else {
                this.cnv.width = this.cnv.width;
            }
        }
        if (y >= 0) {
            // 下
            if (y + this.basePosY + part.cnv.height > this.cnv.height) {
                this.cnv.height = y + this.basePosY + part.cnv.height;
            }
            else {
                this.cnv.height = this.cnv.height;
            }
        }
        // もしパーツが左上へはみだす（ネガティブマージン
        if (x + this.basePosX < 0) {
            // もし左へははみ出す
            if (part.cnv.width + x > this.cnv.width) {
                // partの横幅がx考慮してもcnvよりでかい
                this.cnv.width = part.cnv.width;
                this.basePosX = -x;
                offsetX = this.basePosX;
            }
            else {
                this.cnv.width = this.cnv.width - x;
                this.basePosX = -x;
                offsetX = this.cnv.width - tmp.width;
            }
        }
        if (y + this.basePosY < 0) {
            // 上
            if (part.cnv.height + y > this.cnv.height) {
                // partの縦幅がy考慮してもcnvよりでかい
                this.cnv.height = part.cnv.height;
                this.basePosY = -y;
                offsetY = this.basePosY;
            }
            else {
                this.cnv.height = this.cnv.height - y;
                this.basePosY = -y;
                offsetY = this.cnv.height - tmp.height;
            }
        }
        if (this.debug) {
            this.ctx.fillStyle = "lime";
            this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
        }
        this.ctx.drawImage(tmp, offsetX, offsetY); //下位レイヤ再描画
    };
    //下位レイヤにコマを重ねる。
    //着せ替え・elementでも使用できる。
    SurfaceRender.prototype.overlay = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y); //コマ追加
    };
    //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
    //着せ替え・elementでも使用できる。
    SurfaceRender.prototype.overlayfast = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤの透明なところにのみコマを重ねる。
    //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
    //interpolateで重なる部分はベースより上位（手前）側になければならない
    //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
    //着せ替え・elementでも使用できる。
    SurfaceRender.prototype.interpolate = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "destination-over";
        this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
    //着せ替え・elementでも使用できる。
    SurfaceRender.prototype.replace = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
        this.overlay(part, x, y);
    };
    //下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる。
    //着せ替え・elementでも使用できる。
    //なおelement合成されたサーフェスを他のサーフェスのアニメーションパーツとしてasisメソッドで合成した場合の表示は未定義であるが、
    //Windows上では普通、透過領域は画像本来の抜き色に関係なく黒（#000000）で表示されるだろう。
    SurfaceRender.prototype.asis = function (part, x, y) {
        this.prepareOverlay(part, x, y);
        this.ctx.globalCompositeOperation = "source-over";
        // part.png で png画像をそのまま利用
        this.ctx.drawImage(part.png, this.basePosX + x, this.basePosY + y);
    };
    //下位レイヤをXY座標指定分ずらす。
    //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
    //着せ替え・elementでは使用不可。
    SurfaceRender.prototype.move = function (x, y) {
        // overlayするためだけのものなのでpngやpnaがnullでもまあ問題ない
        var srfCnv = { cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null };
        this.clear(); // 大きさだけ残して一旦消す
        this.overlay(srfCnv, x, y); //ずらした位置に再描画
    };
    //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
    //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。
    SurfaceRender.prototype.add = function (part, x, y) {
        this.overlay(part, x, y);
    };
    //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
    //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
    //http://usada.sakura.vg/contents/seriko.html
    SurfaceRender.prototype.reduce = function (part, x, y) {
        if (!this.use_self_alpha)
            part = SurfaceUtil.pna(part);
        // はみ出しちぇっく
        // prepareOverlay はしない
        var width = x + part.cnv.width < this.cnv.width ? part.cnv.width : this.cnv.width - x;
        var height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
        var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
        var dataA = imgdataA.data;
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
    SurfaceRender.prototype.drawRegions = function (regions, description) {
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
    SurfaceRender.prototype.drawRegion = function (region) {
        var _a = region.type, type = _a === void 0 ? "" : _a, _b = region.name, name = _b === void 0 ? "" : _b;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#00FF00";
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
                var _o = region, _p = _o.radius, radius = _p === void 0 ? 0 : _p, _q = _o.center_x, center_x = _q === void 0 ? 0 : _q, _r = _o.center_y, center_y = _r === void 0 ? 0 : _r;
                center_x += this.basePosX;
                center_y += this.basePosY;
                left = center_x;
                top = center_y;
                this.ctx.beginPath();
                this.ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI, true);
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
                console.warn("SurfaceRender#drawRegion", "unkown collision shape:", region);
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
    SurfaceRender.prototype.drawEllipseWithBezier = function (x, y, w, h) {
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
    return SurfaceRender;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SurfaceRender;
