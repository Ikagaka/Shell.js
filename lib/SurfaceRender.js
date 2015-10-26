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
    function SurfaceRender(cnv) {
        _classCallCheck(this, SurfaceRender);

        this.cnv = cnv;
        this.ctx = cnv.getContext("2d");
    }

    _createClass(SurfaceRender, [{
        key: "composeElements",
        value: function composeElements(elements) {
            if (elements.length === 0) {
                if (this.DEBUG) {
                    $("<hr />").appendTo(document.body);
                }
                return;
            }
            if (!Array.isArray(elements)) throw new Error("TypeError: elements is not array.");
            // elements is a array but it is like `a=[];a[2]="hoge";a[0] === undefined. so use filter.`
            var _elements$filter$0 = elements.filter(function (elm) {
                return !!elm;
            })[0];
            var canvas = _elements$filter$0.canvas;
            var type = _elements$filter$0.type;
            var x = _elements$filter$0.x;
            var y = _elements$filter$0.y;

            var offsetX = 0;
            var offsetY = 0;
            if (this.DEBUG) {
                var wrapper = document.createElement("fieldset");
                var prev = SurfaceUtil.copy(this.cnv);
                var adder = SurfaceUtil.copy(this.cnv);
                var __render = new SurfaceRender(adder);
                __render.clear();
                __render.overlay(canvas, offsetX + x, offsetY + y);
            }
            switch (type) {
                case "base":
                    this.base(canvas);
                    break;
                case "overlay":
                case "add":
                case "bind":
                    this.overlay(canvas, offsetX + x, offsetY + y);
                    break;
                case "overlayfast":
                    this.overlayfast(canvas, offsetX + x, offsetY + y);
                    break;
                case "replace":
                    this.replace(canvas, offsetX + x, offsetY + y);
                    break;
                case "interpolate":
                    this.interpolate(canvas, offsetX + x, offsetY + y);
                    break;
                case "move":
                    offsetX = x;
                    offsetY = y;
                    var copyed = SurfaceUtil.copy(this.cnv);
                    this.base(copyed);
                    break;
                case "asis":
                case "reduce":
                case "insert,ID":
                    break;
                default:
                    console.error(elements[0]);
            }
            if (this.DEBUG) {
                var result = SurfaceUtil.copy(this.cnv);
                $(wrapper).append($("<legend />").text(type + "(" + x + "," + y + ")")).append($("<style scoped />").html("\n        canvas{border:1px solid black;}\n      ")).append(prev).append("+").append(adder).append("=").append(result).appendTo(document.body);
            }
            this.composeElements(elements.slice(1));
        }
    }, {
        key: "clear",
        value: function clear() {
            this.cnv.width = this.cnv.width;
        }
    }, {
        key: "chromakey",
        value: function chromakey() {
            var ctx = this.cnv.getContext("2d");
            var imgdata = ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var data = imgdata.data;
            var r = data[0],
                g = data[1],
                b = data[2],
                a = data[3];
            var i = 0;
            if (a !== 0) {
                while (i < data.length) {
                    if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
                        data[i + 3] = 0;
                    }
                    i += 4;
                }
            }
            ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "pna",
        value: function pna(_pna) {
            var ctxB = _pna.getContext("2d");
            var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var imgdataB = ctxB.getImageData(0, 0, _pna.width, _pna.height);
            var dataA = imgdataA.data;
            var dataB = imgdataB.data;
            var i = 0;
            while (i < dataA.length) {
                dataA[i + 3] = dataB[i];
                i += 4;
            }
            this.ctx.putImageData(imgdataA, 0, 0);
        }
    }, {
        key: "base",
        value: function base(part) {
            this.init(part);
        }
    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            if (this.cnv.width < part.width || this.cnv.height < part.height) {
                // baseのcanvasを拡大
                var tmp = SurfaceUtil.copy(this.cnv);
                this.cnv.width = part.width > this.cnv.width ? part.width : this.cnv.width;
                this.cnv.height = part.height > this.cnv.height ? part.height : this.cnv.height;
                this.ctx.drawImage(tmp, 0, 0);
            }
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part, x, y);
        }
    }, {
        key: "overlayfast",
        value: function overlayfast(part, x, y) {
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.drawImage(part, x, y);
        }
    }, {
        key: "interpolate",
        value: function interpolate(part, x, y) {
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.drawImage(part, x, y);
        }
    }, {
        key: "replace",
        value: function replace(part, x, y) {
            this.ctx.clearRect(x, y, part.width, part.height);
            this.overlay(part, x, y);
        }
    }, {
        key: "init",
        value: function init(cnv) {
            this.cnv.width = cnv.width;
            this.cnv.height = cnv.height;
            this.overlay(cnv, 0, 0); // type hack
        }
    }, {
        key: "initImageData",
        value: function initImageData(width, height, data) {
            this.cnv.width = width;
            this.cnv.height = height;
            var imgdata = this.ctx.getImageData(0, 0, width, height);
            var _data = imgdata.data; // type hack
            _data.set(data);
            this.ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "drawRegions",
        value: function drawRegions(regions) {
            var _this = this;

            regions.forEach(function (col) {
                _this.drawRegion(col);
            });
        }
    }, {
        key: "drawRegion",
        value: function drawRegion(region) {
            var type = region.type;
            var name = region.name;
            var left = region.left;
            var top = region.top;
            var right = region.right;
            var bottom = region.bottom;
            var coordinates = region.coordinates;
            var radius = region.radius;
            var center_x = region.center_x;
            var center_y = region.center_y;

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

exports.SurfaceRender = SurfaceRender;

SurfaceRender.prototype.DEBUG = false;