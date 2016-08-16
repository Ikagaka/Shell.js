/// <reference path="../typings/index.d.ts"/>
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SurfaceUtil = require("./SurfaceUtil");

var SurfaceRender = function () {
    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。
    function SurfaceRender(opt) {
        _classCallCheck(this, SurfaceRender);

        this.use_self_alpha = false;
        this.cnv = SurfaceUtil.createCanvas();
        var ctx = this.cnv.getContext("2d");
        if (!ctx) throw new Error("SurfaceRender#Constructor:getContext failed");
        this.ctx = ctx;
        this.tmpcnv = SurfaceUtil.createCanvas();
        var tmpctx = this.tmpcnv.getContext("2d");
        if (!tmpctx) throw new Error("SurfaceRender#Constructor:getContext failed");
        this.tmpctx = tmpctx;
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = 0;
        this.baseHeight = 0;
        this.debug = false;
    }
    // バッファを使いまわすためのリセット
    // clearは短形を保つがリセットは1x1になる


    _createClass(SurfaceRender, [{
        key: "reset",
        value: function reset() {
            this.cnv.width = 1;
            this.cnv.height = 1;
            this.tmpcnv.width = 1;
            this.tmpcnv.height = 1;
            this.basePosX = 0;
            this.basePosY = 0;
            this.baseWidth = 0;
            this.baseHeight = 0;
        }
    }, {
        key: "getSurfaceCanvas",
        value: function getSurfaceCanvas() {
            return { cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null };
        }
        // [
        //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
        //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
        // ]

    }, {
        key: "composeElements",
        value: function composeElements(elements) {
            // V8による最適化のためfor文に
            var keys = Object.keys(elements);
            for (var i = 0; i < keys.length; i++) {
                var _elements$keys$i = elements[keys[i]];
                var canvas = _elements$keys$i.canvas;
                var type = _elements$keys$i.type;
                var x = _elements$keys$i.x;
                var y = _elements$keys$i.y;

                this.composeElement(canvas, type, x, y);
            }
        }
    }, {
        key: "composeElement",
        value: function composeElement(canvas, type) {
            var x = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            var y = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

            if (canvas.cnv == null && canvas.png == null) {
                // element 合成のみで作られるサーフェスの base は dummy SurfaceCanvas
                return;
            }
            if (!this.use_self_alpha) canvas = SurfaceUtil.pna(canvas);
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
        }
    }, {
        key: "clear",
        value: function clear() {
            // this.cnv.width = this.cnv.width; // これDOM GC発生するので
            this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        }
        //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
        //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
        //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
        //着せ替え・elementでも使用できる。

    }, {
        key: "base",
        value: function base(part) {
            if (!(part.cnv instanceof HTMLCanvasElement)) {
                console.error("SurfaceRender#base", "base surface is not defined", part);
                return;
            }
            this.baseWidth = part.cnv.width;
            this.baseHeight = part.cnv.height;
            SurfaceUtil.init(this.cnv, this.ctx, part.cnv);
        }
    }, {
        key: "prepareOverlay",
        value: function prepareOverlay(part, x, y) {
            if (!part.cnv) throw new Error("SurfaceRender#prepareOverlay:cnv is null");
            // baseのcanvasを拡大するためのキャッシュ
            var tmp = SurfaceUtil.fastcopy(this.cnv, this.tmpcnv, this.tmpctx);
            var offsetX = 0;
            var offsetY = 0;
            // もしパーツが右下へはみだす
            if (x >= 0) {
                // 右
                if (x + this.basePosX + part.cnv.width > this.cnv.width) {
                    this.cnv.width = this.basePosX + x + part.cnv.width;
                } else {
                    this.clear();
                }
            }
            if (y >= 0) {
                // 下
                if (y + this.basePosY + part.cnv.height > this.cnv.height) {
                    this.cnv.height = y + this.basePosY + part.cnv.height;
                } else {
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
                } else {
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
                } else {
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
        }
        //下位レイヤにコマを重ねる。
        //着せ替え・elementでも使用できる。

    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y); //コマ追加
        }
        //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
        //着せ替え・elementでも使用できる。

    }, {
        key: "overlayfast",
        value: function overlayfast(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
        }
        //下位レイヤの透明なところにのみコマを重ねる。
        //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
        //interpolateで重なる部分はベースより上位（手前）側になければならない
        //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
        //着せ替え・elementでも使用できる。

    }, {
        key: "interpolate",
        value: function interpolate(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
        }
        //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
        //着せ替え・elementでも使用できる。

    }, {
        key: "replace",
        value: function replace(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
            this.overlay(part, x, y);
        }
        //下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる。
        //着せ替え・elementでも使用できる。
        //なおelement合成されたサーフェスを他のサーフェスのアニメーションパーツとしてasisメソッドで合成した場合の表示は未定義であるが、
        //Windows上では普通、透過領域は画像本来の抜き色に関係なく黒（#000000）で表示されるだろう。

    }, {
        key: "asis",
        value: function asis(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.globalCompositeOperation = "source-over";
            // part.png で png画像をそのまま利用
            this.ctx.drawImage(part.png, this.basePosX + x, this.basePosY + y);
        }
        //下位レイヤをXY座標指定分ずらす。
        //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
        //着せ替え・elementでは使用不可。

    }, {
        key: "move",
        value: function move(x, y) {
            // overlayするためだけのものなのでpngやpnaがnullでもまあ問題ない
            var srfCnv = { cnv: SurfaceUtil.copy(this.cnv), png: null, pna: null };
            this.clear(); // 大きさだけ残して一旦消す
            this.overlay(srfCnv, x, y); //ずらした位置に再描画
        }
        //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
        //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。

    }, {
        key: "add",
        value: function add(part, x, y) {
            this.overlay(part, x, y);
        }
        //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
        //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
        //http://usada.sakura.vg/contents/seriko.html

    }, {
        key: "reduce",
        value: function reduce(part, x, y) {
            if (!this.use_self_alpha) part = SurfaceUtil.pna(part);
            if (!(part.cnv instanceof HTMLCanvasElement)) throw new Error("SurfaceRender#reduce: null");
            // はみ出しちぇっく
            // prepareOverlay はしない
            var width = x + part.cnv.width < this.cnv.width ? part.cnv.width : this.cnv.width - x;
            var height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
            var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var dataA = imgdataA.data;
            var ctxB = part.cnv.getContext("2d");
            if (!ctxB) throw new Error("SurfaceRender#reduce: getContext failed");
            var imgdataB = ctxB.getImageData(0, 0, part.cnv.width, part.cnv.height);
            var dataB = imgdataB.data;
            for (var _y = 0; _y < height; _y++) {
                for (var _x = 0; _x < width; _x++) {
                    var iA = (x + _x) * 4 + (y + _y) * this.cnv.width * 4; // baseのxy座標とインデックス
                    var iB = _x * 4 + _y * part.cnv.width * 4; // partのxy座標とインデックス
                    // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
                    if (dataB[iB + 3] === 0) dataA[iA + 3] = dataB[iB + 3];
                }
            }
            this.ctx.putImageData(imgdataA, 0, 0);
        }
    }, {
        key: "drawRegions",
        value: function drawRegions(regions) {
            var _this = this;

            var description = arguments.length <= 1 || arguments[1] === undefined ? "notitle" : arguments[1];

            this.ctx.font = "35px";
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = "white";
            this.ctx.strokeText(description, 5, 10);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(description, 5, 10); // surfaceIdを描画
            regions.forEach(function (col) {
                _this.drawRegion(col);
            });
        }
    }, {
        key: "drawRegion",
        value: function drawRegion(region) {
            var _region$type = region.type;
            var type = _region$type === undefined ? "" : _region$type;
            var _region$name = region.name;
            var name = _region$name === undefined ? "" : _region$name;

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#00FF00";
            var left = 0,
                top = 0,
                right = 0,
                bottom = 0;
            switch (type) {
                case "rect":
                    var _region$left = region.left;
                    var left = _region$left === undefined ? 0 : _region$left;
                    var _region$top = region.top;
                    var top = _region$top === undefined ? 0 : _region$top;
                    var _region$right = region.right;
                    var right = _region$right === undefined ? 0 : _region$right;
                    var _region$bottom = region.bottom;
                    var bottom = _region$bottom === undefined ? 0 : _region$bottom;

                    left += this.basePosX;
                    top += this.basePosY;
                    right += this.basePosX;
                    bottom += this.basePosY;
                    this.ctx.beginPath();
                    this.ctx.rect(left, top, right - left, bottom - top);
                    this.ctx.stroke();
                    break;
                case "ellipse":
                    var _region$left2 = region.left;
                    var left = _region$left2 === undefined ? 0 : _region$left2;
                    var _region$top2 = region.top;
                    var top = _region$top2 === undefined ? 0 : _region$top2;
                    var _region$right2 = region.right;
                    var right = _region$right2 === undefined ? 0 : _region$right2;
                    var _region$bottom2 = region.bottom;
                    var bottom = _region$bottom2 === undefined ? 0 : _region$bottom2;

                    left += this.basePosX;
                    top += this.basePosY;
                    right += this.basePosX;
                    bottom += this.basePosY;
                    // 実はctx.ellipseはfirefox対応してない
                    this.drawEllipseWithBezier(left, top, right - left, bottom - top);
                    break;
                case "circle":
                    var _region$radius = region.radius;
                    var radius = _region$radius === undefined ? 0 : _region$radius;
                    var _region$centerX = region.centerX;
                    var centerX = _region$centerX === undefined ? 0 : _region$centerX;
                    var _region$centerY = region.centerY;
                    var centerY = _region$centerY === undefined ? 0 : _region$centerY;

                    centerX += this.basePosX;
                    centerY += this.basePosY;
                    left = centerX;
                    top = centerY;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
                    this.ctx.stroke();
                    break;
                case "polygon":
                    var _region$coordinates = region.coordinates;
                    var coordinates = _region$coordinates === undefined ? [] : _region$coordinates;

                    if (coordinates.length <= 0) break;
                    this.ctx.beginPath();
                    var _coordinates$ = coordinates[0];
                    var startX = _coordinates$.x;
                    var startY = _coordinates$.y;

                    left = startX;
                    top = startY;
                    this.ctx.moveTo(startX, startY);
                    for (var i = 1; i < coordinates.length; i++) {
                        var _coordinates$i = coordinates[i];
                        var x = _coordinates$i.x;
                        var y = _coordinates$i.y;

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
        }
        // ctx.ellipseは非標準

    }, {
        key: "drawEllipseWithBezier",
        value: function drawEllipseWithBezier(x, y, w, h) {
            var kappa = .5522848,
                ox = w / 2 * kappa,
                // control point offset horizontal
            oy = h / 2 * kappa,
                // control point offset vertical
            xe = x + w,
                // x-end
            ye = y + h,
                // y-end
            xm = x + w / 2,
                // x-middle
            ym = y + h / 2; // y-middle
            this.ctx.beginPath();
            this.ctx.moveTo(x, ym);
            this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            this.ctx.stroke();
        }
    }]);

    return SurfaceRender;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SurfaceRender;