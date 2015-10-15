"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.choice = choice;
exports.copy = copy;
exports.fetchPNGUint8ClampedArrayFromArrayBuffer = fetchPNGUint8ClampedArrayFromArrayBuffer;
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
exports.fetchImageFromURL = fetchImageFromURL;
exports.random = random;
exports.periodic = periodic;
exports.always = always;
exports.isHit = isHit;
exports.offset = offset;
exports.createCanvas = createCanvas;
exports.scope = scope;
exports.elementFromPointWithout = elementFromPointWithout;
exports.randomRange = randomRange;

function choice(arr) {
    return arr[Math.round(Math.random() * (arr.length - 1))];
}

function copy(cnv) {
    var _copy = document.createElement("canvas");
    var ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}

function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    return new Promise(function (resolve, reject) {})["catch"](function (err) {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}

function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    })["catch"](function (err) {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}

function fetchImageFromURL(url) {
    var img = new Image();
    img.src = url;
    return new Promise(function (resolve, reject) {
        img.addEventListener("load", function () {
            resolve(Promise.resolve(img)); // type hack
        });
        img.addEventListener("error", function (ev) {
            console.error("fetchImageFromURL", ev);
            reject("fetchImageFromURL ");
        });
    });
}

function random(callback, probability) {
    var ms = 1;
    while (Math.round(Math.random() * 1000) > 1000 / probability) {
        ms++;
    }
    setTimeout(function () {
        return callback(function () {
            return random(callback, probability);
        });
    }, ms * 1000);
}

function periodic(callback, sec) {
    setTimeout(function () {
        return callback(function () {
            return periodic(callback, sec);
        });
    }, sec * 1000);
}

function always(callback) {
    callback(function () {
        return always(callback);
    });
}

function isHit(cnv, x, y) {
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x + 1, y + 1);
    var data = imgdata.data;
    return data[data.length - 1] !== 0;
}

function offset(element) {
    var obj = element.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
}

function createCanvas() {
    var cnv = document.createElement("canvas");
    cnv.width = 1;
    cnv.height = 1;
    return cnv;
}

function scope(scopeId) {
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
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

function elementFromPointWithout(element, pageX, pageY) {
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

    var _offset = offset(elm);

    var top = _offset.top;
    var left = _offset.left;

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

function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}