"use strict";
require("../typings/index.d.ts");
const SU = require("./SurfaceUtil");
/*
CacheCanvas型はサーフェスのロード状況を管理します。


*/
class Done {
}
exports.Done = Done;
class Yet {
}
exports.Yet = Yet;
class Cache {
    constructor() {
        this.cnv = document.createElement("canvas");
    }
}
exports.Cache = Cache;
class PNGWithoutPNA extends Cache {
    constructor(png) {
        super();
        this.png = png;
    }
}
exports.PNGWithoutPNA = PNGWithoutPNA;
class PNGWithPNA extends PNGWithoutPNA {
    constructor(png, pna) {
        super(png);
        this.pna = pna;
    }
}
exports.PNGWithPNA = PNGWithPNA;
function applyChromakey(cc) {
    return new Promise((resolve, reject) => {
        resolve(cc);
        //reject("not impl yet");
    });
}
exports.applyChromakey = applyChromakey;
function getPNGImage(pngBuffer) {
    return SU.fetchImageFromArrayBuffer(pngBuffer).then((png) => new PNGWithoutPNA(png));
}
exports.getPNGImage = getPNGImage;
function getPNGAndPNAImage(pngBuffer, pnaBuffer) {
    return Promise.all([
        SU.fetchImageFromArrayBuffer(pngBuffer),
        SU.fetchImageFromArrayBuffer(pnaBuffer)
    ]).then(([png, pna]) => new PNGWithPNA(png, pna));
}
exports.getPNGAndPNAImage = getPNGAndPNAImage;
