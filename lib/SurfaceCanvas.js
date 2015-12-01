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

// サーフェスのリソースのキャッシュのためのクラス
// あるサーフェスの様々なリソースを統一的に扱えるようにするためのクラス

var SurfaceCanvas = (function () {
    function SurfaceCanvas() {
        _classCallCheck(this, SurfaceCanvas);

        this.url = "";
        this.buffer = null;
        this.img = null;
        this.cnv = null;
        this.pixels = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
    }

    _createClass(SurfaceCanvas, [{
        key: "loadFromURL",
        value: function loadFromURL(url) {
            var _this = this;

            this.url = url;
            return SurfaceUtil.fetchArrayBuffer(url).then(function (buffer) {
                return _this.loadFromBuffer(buffer);
            });
        }
    }, {
        key: "loadFromBuffer",
        value: function loadFromBuffer(buffer) {
            var _this2 = this;

            this.buffer = buffer;
            return SurfaceUtil.fetchImageFromArrayBuffer(buffer).then(function (img) {
                return _this2.loadFromImage(img);
            });
        }
    }, {
        key: "loadFromImage",
        value: function loadFromImage(img) {
            this.img = img;
            return Promise.resolve(this.loadFromCanvas(SurfaceUtil.copy(img)));
        }
    }, {
        key: "loadFromCanvas",
        value: function loadFromCanvas(cnv) {
            this.cnv = cnv;
            this.ctx = cnv.getContext("2d");
            var imgdata = this.ctx.getImageData(0, 0, cnv.width, cnv.height);
            SurfaceUtil.chromakey_snipet(imgdata.data); // cnvとimgdataは色抜きでキャッシュ
            this.ctx.putImageData(imgdata, 0, 0);
            return this.loadFromUint8ClampedArray(imgdata.data, cnv.width, cnv.height);
        }
    }, {
        key: "loadFromUint8ClampedArray",
        value: function loadFromUint8ClampedArray(pixels, width, height) {
            this.width = width;
            this.height = height;
            this.pixels = pixels;
            return this;
        }
    }]);

    return SurfaceCanvas;
})();

exports["default"] = SurfaceCanvas;
module.exports = exports["default"];