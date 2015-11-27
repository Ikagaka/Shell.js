/// <reference path="../typings/tsd.d.ts"/>
var SurfaceUtil = require("./SurfaceUtil");
// サーフェスのリソースのキャッシュのためのクラス
// あるサーフェスの様々なリソースを統一的に扱えるようにするためのクラス
class SurfaceCanvas {
    constructor() {
        this.url = "";
        this.buffer = null;
        this.img = null;
        this.cnv = null;
        this.pixels = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
    }
    loadFromURL(url) {
        this.url = url;
        return SurfaceUtil.fetchArrayBuffer(url).then((buffer) => {
            return this.loadFromBuffer(buffer);
        });
    }
    loadFromBuffer(buffer) {
        this.buffer = buffer;
        return SurfaceUtil.fetchImageFromArrayBuffer(buffer).then((img) => {
            return this.loadFromImage(img);
        });
    }
    loadFromImage(img) {
        this.img = img;
        return Promise.resolve(this.loadFromCanvas(SurfaceUtil.copy(img)));
    }
    loadFromCanvas(cnv) {
        this.cnv = cnv;
        this.ctx = cnv.getContext("2d");
        var imgdata = this.ctx.getImageData(0, 0, cnv.width, cnv.height);
        SurfaceUtil.chromakey_snipet(imgdata.data); // cnvとimgdataは色抜きでキャッシュ
        this.ctx.putImageData(imgdata, 0, 0);
        return this.loadFromUint8ClampedArray(imgdata.data, cnv.width, cnv.height);
    }
    loadFromUint8ClampedArray(pixels, width, height) {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
        return this;
    }
}
exports.SurfaceCanvas = SurfaceCanvas;
