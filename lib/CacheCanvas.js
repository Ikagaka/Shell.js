"use strict";
require("../typings/index.d.ts");
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
    return getImageFromArrayBuffer(pngBuffer).then((png) => new PNGWithoutPNA(png));
}
exports.getPNGImage = getPNGImage;
function getPNGAndPNAImage(pngBuffer, pnaBuffer) {
    return Promise.all([
        getImageFromArrayBuffer(pngBuffer),
        getImageFromArrayBuffer(pnaBuffer)
    ]).then(([png, pna]) => new PNGWithPNA(png, pna));
}
exports.getPNGAndPNAImage = getPNGAndPNAImage;
function getImageFromArrayBuffer(buffer) {
    const url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
    return getImageFromURL(url).then((img) => {
        URL.revokeObjectURL(url);
        return img;
    });
}
exports.getImageFromArrayBuffer = getImageFromArrayBuffer;
function getImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", reject);
    });
}
exports.getImageFromURL = getImageFromURL;
function getArrayBufferFromURL(url) {
    console.warn("getArrayBuffer for debbug");
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    resolve(xhr.response);
                }
                else {
                    reject(new Error("message: " + xhr.response.error.message));
                }
            }
            else {
                reject(new Error("status: " + xhr.status));
            }
        });
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";
        xhr.send();
    });
}
exports.getArrayBufferFromURL = getArrayBufferFromURL;
