/// <reference path="../typings/index.d.ts"/>
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ST = require("./SurfaceTree");
var SU = require("./SurfaceUtil");

var SurfaceLayer = function SurfaceLayer() {
    _classCallCheck(this, SurfaceLayer);
};

exports.SurfaceLayer = SurfaceLayer;

var Layer = function Layer() {
    _classCallCheck(this, Layer);
};

exports.Layer = Layer;

var SurfaceCanvas = function SurfaceCanvas(cnv) {
    _classCallCheck(this, SurfaceCanvas);

    this.cnv = cnv;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = cnv.width;
    this.baseHeight = cnv.height;
};

exports.SurfaceCanvas = SurfaceCanvas;

var SurfaceRender = function (_SurfaceCanvas) {
    _inherits(SurfaceRender, _SurfaceCanvas);

    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。
    function SurfaceRender() {
        _classCallCheck(this, SurfaceRender);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceRender).call(this, SU.createCanvas()));

        _this.ctx = _this.cnv.getContext("2d");
        _this.tmpcnv = SU.createCanvas();
        _this.tmpctx = _this.tmpcnv.getContext("2d");
        _this.use_self_alpha = false;
        _this.debug = false;
        return _this;
    }
    // バッファを使いまわすためのリセット
    // clearは短形を保つがリセットは1x1になる


    _createClass(SurfaceRender, [{
        key: "reset",
        value: function reset() {
            // reshapeの機会を減らすため大きさはそのままにする
            this.ctx.canvas.width = this.ctx.canvas.width;
            this.tmpctx.canvas.width = this.tmpctx.canvas.width;
            this.basePosX = 0;
            this.basePosY = 0;
            this.baseWidth = 0;
            this.baseHeight = 0;
        }
    }, {
        key: "clear",
        value: function clear() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        // [
        //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
        //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
        // ]

    }, {
        key: "composeElements",
        value: function composeElements(elms) {
            var _this2 = this;

            // baseを決定
            var bases = elms.filter(function (_ref) {
                var type = _ref.type;
                return type === "base";
            });
            var others = elms.filter(function (_ref2) {
                var type = _ref2.type;
                return type !== "base";
            });
            // element[MAX].base > element0 > element[MIN]
            var base = bases.slice(-1)[0]; /* last */
            if (!(base instanceof ST.SurfaceElement)) {
                // element[MIN]
                // elms.length > 0なのでundefinedにはならない…はず。
                // お前がbaseになるんだよ
                base = elms.shift();
                console.warn("SurfaceRender#composeElements: base surface not found. failback.", base);
                if (base == null) {
                    console.warn("SurfaceRender#composeElements: cannot decide base surface", base);
                    return this;
                }
            }
            this.base(base.canvas);
            others.forEach(function (_ref3) {
                var canvas = _ref3.canvas;
                var type = _ref3.type;
                var x = _ref3.x;
                var y = _ref3.y;

                _this2.composeElement(canvas, type, x, y);
            });
            return this;
        }
    }, {
        key: "composeElement",
        value: function composeElement(canvas, type) {
            var x = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            var y = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

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
                    console.warn("SurfaceRender#composeElement:", "unkown compose method", canvas, type, x, y);
            }
        }
        //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
        //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
        //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
        //着せ替え・elementでも使用できる。

    }, {
        key: "base",
        value: function base(part) {
            this.reset();
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.cnv, 0, 0);
        }
        //下位レイヤにコマを重ねる。
        //着せ替え・elementでも使用できる。

    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            this.prepareOverlay(part, x, y);
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
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
    }, {
        key: "prepareOverlay",
        value: function prepareOverlay(part, x, y) {
            // パーツがはみだす量
            // もし負なら左へはみ出した量
            var left = this.basePosX + x;
            // もし負なら右へはみ出した量
            var right = this.cnv.width - (this.basePosX + x + part.cnv.width);
            // もし負なら上へはみ出した量
            var top = this.basePosY + y;
            // もし負なら↓へはみ出した量
            var bottom = this.cnv.height - (this.basePosY + y + part.cnv.height);
            if (left < 0 || right < 0 || top < 0 || bottom < 0) {
                // はみ出し発生
                var offsetX = 0; // ずれた量
                var offsetY = 0;
                console.info("SurfaceRender#prepareOverlay: reshape occured");
                // 現状をtmpcnvへコピー
                SU.fastcopy(this.cnv, this.tmpctx);
                if (left < 0) {
                    offsetX = -left;
                    this.cnv.width += -left; // reshape
                    this.basePosX += -left;
                }
                if (right < 0) {
                    this.cnv.width += -right; // reshape
                }
                if (top < 0) {
                    offsetY = -top;
                    this.cnv.height += -top; // reshape
                    this.basePosY += -top;
                }
                if (bottom < 0) {
                    this.cnv.height += -bottom; // reshape
                }
                if (this.debug) {
                    // 基準点描画
                    this.ctx.fillStyle = "lime";
                    this.ctx.fillRect(this.basePosX, this.basePosY, 5, 5);
                }
                this.ctx.drawImage(this.tmpctx.canvas, offsetX, offsetY); //下位レイヤ再描画
            }
        }
        //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
        //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
        //http://usada.sakura.vg/contents/seriko.html

    }, {
        key: "reduce",
        value: function reduce(part, x, y) {
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
            var _this3 = this;

            var description = arguments.length <= 1 || arguments[1] === undefined ? "notitle" : arguments[1];

            this.ctx.font = "35px";
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = "white";
            this.ctx.strokeText(description, 5, 10);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(description, 5, 10); // surfaceIdを描画
            regions.forEach(function (col) {
                _this3.drawRegion(col);
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
}(SurfaceCanvas);

exports.SurfaceRender = SurfaceRender;