/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var SurfaceRender = (function () {
    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。

    function SurfaceRender() {
        _classCallCheck(this, SurfaceRender);

        this.cnv = SurfaceUtil.createCanvas();
        this.img = this.cnv; // HTMLElementでwidthとHeightがあってdrawImageできるから！
        this.ctx = this.cnv.getContext("2d");
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = 0;
        this.baseHeight = 0;
        this.elements = [];
    }

    _createClass(SurfaceRender, [{
        key: "getSurfaceCanvas",
        value: function getSurfaceCanvas() {
            return { cnv: SurfaceUtil.copy(this.cnv), img: this.img };
        }

        // [
        //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
        //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
        // ]
    }, {
        key: "composeElements",
        value: function composeElements(elements) {
            var _this = this;

            elements.forEach(function (_ref, id) {
                var canvas = _ref.canvas;
                var type = _ref.type;
                var x = _ref.x;
                var y = _ref.y;

                _this.composeElement(canvas, type, x, y);
            });
        }
    }, {
        key: "composeElement",
        value: function composeElement(canvas, type, x, y) {
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
                    this.bind(canvas, x, y);
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
                case "move":
                    this.move(x, y);
                    break;
                case "asis":
                    this.asis(canvas, x, y);
                    break;
                case "reduce":
                    this.reduce(canvas, x, y);
                    break;
                case "start":
                case "stop":
                case "alternativestart":
                case "alternativestop":
                case "insert": // こいつらはSurfaceRenerの仕事ではない。Surfaceでやって
                default:
                    console.warn("SurfaceRender#composeElement", new Error("unsupport type"), canvas, type, x, y);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.elements.push({ method: "clear", args: [] });
            this.cnv.width = this.cnv.width;
        }
    }, {
        key: "pna",
        value: function pna(png, _pna) {
            this.elements.push({ method: "pna", args: [png, _pna] });
            var cnvA = SurfaceUtil.copy(png.img || png.cnv);
            var ctxA = cnvA.getContext("2d");
            var imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
            var dataA = imgdataA.data;
            var cnvB = SurfaceUtil.copy(_pna.img || _pna.cnv);
            var ctxB = cnvB.getContext("2d");
            var imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
            var dataB = imgdataB.data;
            for (var y = 0; y < cnvB.height; y++) {
                for (var x = 0; x < cnvB.width; x++) {
                    var iA = x * 4 + y * cnvA.width * 4; // baseのxy座標とインデックス
                    var iB = x * 4 + y * cnvB.width * 4; // pnaのxy座標とインデックス
                    dataA[iA + 3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
                }
            }
            this.cnv.width = cnvA.width;
            this.cnv.height = cnvA.height;
            this.ctx.putImageData(imgdataA, 0, 0);
        }

        //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
        //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
        //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
        //着せ替え・elementでも使用できる。
    }, {
        key: "base",
        value: function base(part) {
            if ($(part.cnv).attr("data-shell-dummy") != null) return;
            this.elements.push({ method: "base", args: [part] });
            this.baseWidth = part.cnv.width;
            this.baseHeight = part.cnv.height;
            SurfaceUtil.init(this.cnv, this.ctx, part.cnv);
        }

        //下位レイヤにコマを重ねる。
        //着せ替え・elementでも使用できる。
    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            if ($(part.cnv).attr("data-shell-dummy") != null) return;
            if (this.elements.length === 0) {
                return this.base(part);
            }
            this.elements.push({ method: "overlay", args: [part, x, y] });
            // baseのcanvasを拡大するためのキャッシュ
            var tmp = SurfaceUtil.copy(this.cnv);
            // もしパーツが右下へはみだす
            if (x >= 0) {
                this.cnv.width = x + part.cnv.width > this.cnv.width ? x + part.cnv.width : this.cnv.width;
            }
            if (y >= 0) {
                this.cnv.height = y + part.cnv.height > this.cnv.height ? y + part.cnv.height : this.cnv.height;
            }
            // もしパーツが右上へはみだす（ネガティブマージン
            if (x < 0) {
                // もし右へははみ出す
                this.cnv.width = part.cnv.width + x > this.cnv.width ? part.cnv.width : this.cnv.width - x;
                this.basePosX = -x;
            }
            if (y < 0) {
                this.cnv.height = part.cnv.height + y > this.cnv.height ? part.cnv.height : this.cnv.height - y;
                this.basePosY = -y;
            }
            this.ctx.drawImage(tmp, this.basePosX, this.basePosY); //下位レイヤ再描画
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y); //コマ追加
        }

        //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
        //着せ替え・elementでも使用できる。
    }, {
        key: "overlayfast",
        value: function overlayfast(part, x, y) {
            this.elements.push({ method: "overlayfast", args: [part, x, y] });
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
            this.elements.push({ method: "interpolate", args: [part, x, y] });
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
        }

        //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
        //着せ替え・elementでも使用できる。
    }, {
        key: "replace",
        value: function replace(part, x, y) {
            this.elements.push({ method: "replace", args: [part, x, y] });
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
            this.elements.push({ method: "asis", args: [part, x, y] });
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.img || part.cnv, this.basePosX + x, this.basePosY + y);
        }

        //下位レイヤをXY座標指定分ずらす。
        //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
        //着せ替え・elementでは使用不可。
    }, {
        key: "move",
        value: function move(x, y) {
            this.elements.push({ method: "move", args: [x, y] });
            // overlayするためだけのものなのでnullでもまあ問題ない
            var srfCnv = { cnv: SurfaceUtil.copy(this.cnv), img: null };
            this.clear(); // 大きさだけ残して一旦消す
            this.overlay(srfCnv, x, y); //ずらした位置に再描画
        }

        //そのコマを着せ替えパーツとして重ねる。現在ではoverlayと同じ。
        //着せ替えパーツとして単純に一つのサーフェスを重ねることしか出来なかった頃の唯一のメソッドで、現在はaddが互換。
        //着せ替えでないアニメーション・elementでの使用は未定義。
    }, {
        key: "bind",
        value: function bind(part, x, y) {
            this.elements.push({ method: "bind", args: [part, x, y] });
            this.add(part, x, y);
        }

        //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
        //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。
    }, {
        key: "add",
        value: function add(part, x, y) {
            this.elements.push({ method: "add", args: [part, x, y] });
            this.overlay(part, x, y);
        }

        //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
        //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
        //http://usada.sakura.vg/contents/seriko.html
    }, {
        key: "reduce",
        value: function reduce(part, x, y) {
            this.elements.push({ method: "reduce", args: [part, x, y] });
            // はみ出しちぇっく
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
                    var iB = _x * 4 + _y * part.cnv.width * 4; // partのxy座標とインデックス
                    // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
                    if (dataB[iB + 3] === 0) dataA[iA + 3] = dataB[iB + 3];
                }
            }
            this.ctx.putImageData(imgdataA, 0, 0);
        }
    }, {
        key: "init",
        value: function init(srfCnv) {
            console.warn("SurfaceRender#init is deprecated");
            this.elements.push({ method: "init", args: [srfCnv] });
            this.baseWidth = srfCnv.cnv.width;
            this.baseHeight = srfCnv.cnv.height;
            SurfaceUtil.init(this.cnv, this.ctx, srfCnv.cnv);
        }
    }, {
        key: "initImageData",
        value: function initImageData(width, height, data) {
            console.warn("SurfaceRender#initImageData is deprecated");
            this.elements.push({ method: "initImageData", args: [width, height, data] });
            this.baseWidth = this.cnv.width = width;
            this.baseHeight = this.cnv.height = height;
            var imgdata = this.ctx.getImageData(0, 0, width, height);
            imgdata.data.set(data);
            this.ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "drawRegions",
        value: function drawRegions(regions) {
            var _this2 = this;

            regions.forEach(function (col) {
                _this2.drawRegion(col);
            });
        }
    }, {
        key: "drawRegion",
        value: function drawRegion(region) {
            this.elements.push({ method: "drawRegion", args: [region] });
            var _region$type = region.type;
            var type = _region$type === undefined ? "" : _region$type;
            var _region$name = region.name;
            var name = _region$name === undefined ? "" : _region$name;
            var _region$left = region.left;
            var left = _region$left === undefined ? 0 : _region$left;
            var _region$top = region.top;
            var top = _region$top === undefined ? 0 : _region$top;
            var _region$right = region.right;
            var right = _region$right === undefined ? 0 : _region$right;
            var _region$bottom = region.bottom;
            var bottom = _region$bottom === undefined ? 0 : _region$bottom;
            var _region$coordinates = region.coordinates;
            var coordinates = _region$coordinates === undefined ? [] : _region$coordinates;
            var _region$radius = region.radius;
            var radius = _region$radius === undefined ? 0 : _region$radius;
            var _region$center_x = region.center_x;
            var center_x = _region$center_x === undefined ? 0 : _region$center_x;
            var _region$center_y = region.center_y;
            var center_y = _region$center_y === undefined ? 0 : _region$center_y;

            left += this.basePosX;
            top += this.basePosY;
            right += this.basePosX;
            bottom += this.basePosY;
            center_x += this.basePosX;
            center_y += this.basePosY;
            this.ctx.strokeStyle = "#00FF00";
            switch (type) {
                case "rect":
                    this.ctx.rect(left, top, right - left, bottom - top);
                    break;
                default:
                    console.warn("collision shape:", type, "is not draw it region yet");
                    break;
            }
            this.ctx.stroke();
            this.ctx.font = "35px";
            this.ctx.strokeStyle = "white";
            this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(type + ":" + name, left + 5, top + 10);
        }
    }]);

    return SurfaceRender;
})();

exports["default"] = SurfaceRender;
module.exports = exports["default"];