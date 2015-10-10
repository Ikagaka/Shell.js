import { PNGReader } from "./PNG";
export var enablePNGjs = true;
export function choice(arr) {
    return arr[Math.round(Math.random() * (arr.length - 1))];
}
export function copy(cnv) {
    var _copy = document.createElement("canvas");
    var ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}
export function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    return new Promise((resolve, reject) => {
        var reader = new PNGReader(pngbuf);
        var png = reader.parse();
        var dataA = png.getUint8ClampedArray();
        if (typeof pnabuf === "undefined") {
            var r = dataA[0], g = dataA[1], b = dataA[2], a = dataA[3];
            var i = 0;
            if (a !== 0) {
                while (i < dataA.length) {
                    if (r === dataA[i] && g === dataA[i + 1] && b === dataA[i + 2]) {
                        dataA[i + 3] = 0;
                    }
                    i += 4;
                }
            }
            return resolve(Promise.resolve({ width: png.width, height: png.height, data: dataA }));
        }
        var pnareader = new PNGReader(pnabuf);
        var pna = pnareader.parse();
        var dataB = pna.getUint8ClampedArray();
        if (dataA.length !== dataB.length) {
            return reject("fetchPNGUint8ClampedArrayFromArrayBuffer TypeError: png" +
                png.width + "x" + png.height + " and  pna" + pna.width + "x" + pna.height +
                " do not match both sizes");
        }
        var j = 0;
        while (j < dataA.length) {
            dataA[j + 3] = dataB[j];
            j += 4;
        }
        return resolve(Promise.resolve({ width: png.width, height: png.height, data: dataA }));
    }).catch((err) => {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}
export function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then((img) => {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    }).catch((err) => {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}
export function fetchImageFromURL(url) {
    var img = new Image();
    img.src = url;
    return new Promise((resolve, reject) => {
        img.addEventListener("load", function () {
            resolve(Promise.resolve(img)); // type hack
        });
        img.addEventListener("error", function (ev) {
            console.error("fetchImageFromURL", ev);
            reject("fetchImageFromURL ");
        });
    });
}
export function random(callback, probability) {
    var ms = 1;
    while (Math.round(Math.random() * 1000) > 1000 / probability) {
        ms++;
    }
    setTimeout((() => callback(() => random(callback, probability))), ms * 1000);
}
export function periodic(callback, sec) {
    setTimeout((() => callback(() => periodic(callback, sec))), sec * 1000);
}
export function always(callback) {
    callback(() => always(callback));
}
export function isHit(cnv, x, y) {
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x + 1, y + 1);
    var data = imgdata.data;
    return data[data.length - 1] !== 0;
}
export function offset(element) {
    var obj = element.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
}
export function createCanvas() {
    var cnv = document.createElement("canvas");
    cnv.width = 1;
    cnv.height = 1;
    return cnv;
}
export function scope(scopeId) {
    return scopeId === 0 ? "sakura"
        : scopeId === 1 ? "kero"
            : "char" + scopeId;
}
/*
var _charId = charId === "sakura" ? 0
            : charId === "kero"   ? 1
            : Number(/^char(\d+)/.exec(charId)[1]);
*/
/*
@isHitBubble = (element, pageX, pageY)->
  $(element).hide()
  elm = document.elementFromPoint(pageX, pageY)
  if !elm
    $(element).show(); return elm
  unless elm instanceof HTMLCanvasElement
    $(element).show(); return elm
  {top, left} = $(elm).offset()
  if Surface.isHit(elm, pageX-left, pageY-top)
    $(element).show(); return elm
  _elm = Surface.isHitBubble(elm, pageX, pageY)
  $(element).show(); return _elm
*/
export function elementFromPointWithout(element, pageX, pageY) {
    var tmp = element.style.display;
    element.style.display = "none";
    // elementを非表示にして直下の要素を調べる
    var elm = document.elementFromPoint(pageX, pageY);
    // 直下の要素がcanvasなら透明かどうか調べる
    // todo: cuttlebone管理下の要素かどうかの判定必要
    if (!elm) {
        element.style.display = tmp;
        return elm;
    }
    if (!(elm instanceof HTMLCanvasElement)) {
        element.style.display = tmp;
        return elm;
    }
    var { top, left } = offset(elm);
    // 不透明canvasならヒット
    if (elm instanceof HTMLCanvasElement && isHit(elm, pageX - left, pageY - top)) {
        element.style.display = tmp;
        return elm;
    }
    if (elm instanceof HTMLElement) {
        // elementの非表示のままさらに下の要素を調べにいく
        var _elm = elementFromPointWithout(elm, pageX, pageY);
        element.style.display = tmp;
        return _elm;
    }
    // 解決できなかった！ザンネン!
    console.warn(elm);
    element.style.display = tmp;
    return null;
}
