/// <reference path="../typings/tsd.d.ts"/>
var Encoding = require("encoding-japanese");
function pna(srfCnv) {
    var cnv = srfCnv.cnv, png = srfCnv.png, pna = srfCnv.pna;
    if (cnv != null) {
        // 色抜き済みだった
        return srfCnv;
    }
    if (cnv == null && png != null && pna == null) {
        // 背景色抜き
        var cnvA = copy(png);
        var ctxA = cnvA.getContext("2d");
        var imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
        chromakey_snipet(imgdata.data);
        ctxA.putImageData(imgdata, 0, 0);
        srfCnv.cnv = cnvA; // キャッシュに反映
        return srfCnv;
    }
    if (cnv == null && png != null && pna != null) {
        // pna
        var cnvA = copy(png);
        var ctxA = cnvA.getContext("2d");
        var imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
        var dataA = imgdataA.data;
        var cnvB = copy(pna);
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
        ctxA.putImageData(imgdataA, 0, 0);
        srfCnv.cnv = cnvA; // キャッシュに反映
        return srfCnv;
    }
    // png, cnv が null なのは element だけで構成されたサーフェスの dummy base
    return srfCnv;
}
exports.pna = pna;
function init(cnv, ctx, src) {
    cnv.width = src.width;
    cnv.height = src.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(src, 0, 0);
}
exports.init = init;
function chromakey_snipet(data) {
    var r = data[0], g = data[1], b = data[2], a = data[3];
    var i = 0;
    if (a !== 0) {
        while (i < data.length) {
            if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
                data[i + 3] = 0;
            }
            i += 4;
        }
    }
}
exports.chromakey_snipet = chromakey_snipet;
function log(element, description) {
    if (description === void 0) { description = ""; }
    if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement) {
        description += "(" + element.width + "x" + element.height + ")";
    }
    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    document.body.appendChild(fieldset);
}
exports.log = log;
// "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
function parseDescript(text) {
    text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
    while (true) {
        var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["", ""])[0];
        if (match.length === 0)
            break;
        text = text.replace(match, "");
    }
    var lines = text.split("\n");
    var _lines = lines.filter(function (line) { return line.length !== 0; }); // remove no content line
    var dic = _lines.reduce(function (dic, line) {
        var _a = line.split(","), key = _a[0], vals = _a.slice(1);
        var _key = key.trim();
        var val = vals.join(",").trim();
        dic[_key] = val;
        return dic;
    }, {});
    return dic;
}
exports.parseDescript = parseDescript;
// XMLHttpRequest, xhr.responseType = "arraybuffer"
function fetchArrayBuffer(url) {
    return new Promise(function (resolve, reject) {
        getArrayBuffer(url, function (err, buffer) {
            if (!!err)
                reject(err);
            else
                resolve(buffer);
        });
    });
}
exports.fetchArrayBuffer = fetchArrayBuffer;
// XMLHttpRequest, xhr.responseType = "arraybuffer"
function getArrayBuffer(url, cb) {
    var xhr = new XMLHttpRequest();
    var _cb = function (a, b) {
        cb(a, b);
        cb = function (a, b) { console.warn("SurfaceUtil.getArrayBuffer", url, a, b); };
    };
    xhr.addEventListener("load", function () {
        if (200 <= xhr.status && xhr.status < 300) {
            if (xhr.response.error == null) {
                _cb(null, xhr.response);
            }
            else {
                _cb(new Error("message: " + xhr.response.error.message), null);
            }
        }
        else {
            _cb(new Error("status: " + xhr.status), null);
        }
    });
    xhr.addEventListener("error", function () {
        _cb(new Error("error: " + xhr.response.error.message), null);
    });
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    return xhr.send();
}
exports.getArrayBuffer = getArrayBuffer;
// convert some encoding txt file arraybuffer to js string
// TODO: use text-enconding & charset detection code
function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}
exports.convert = convert;
// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...
function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter(function (key) { return reg.test(key); });
    return hits;
}
exports.find = find;
// 検索打ち切って高速化
function fastfind(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    for (var i = 0; i < paths.length; i++) {
        if (reg.test(paths[i])) {
            return paths[i];
        }
    }
    return "";
}
exports.fastfind = fastfind;
// [1,2,3] -> 1 or 2 or 3 as 33% probability
function choice(arr) {
    return arr[(Math.random() * 100 * (arr.length) | 0) % arr.length];
}
exports.choice = choice;
// copy canvas as new object
// this copy technic is faster than getImageData full copy, but some pixels are bad copy.
// see also: http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally
function copy(cnv) {
    var _copy = document.createElement("canvas");
    var ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}
exports.copy = copy;
// tmpcnvにコピー
function fastcopy(cnv, tmpcnv, tmpctx) {
    tmpcnv.width = cnv.width;
    tmpcnv.height = cnv.height;
    tmpctx.drawImage(cnv, 0, 0); // type hack
    return tmpcnv;
}
exports.fastcopy = fastcopy;
// ArrayBuffer -> HTMLImageElement
function fetchImageFromArrayBuffer(buffer, mimetype) {
    return new Promise(function (resolve, reject) {
        getImageFromArrayBuffer(buffer, function (err, img) {
            if (!!err)
                reject(err);
            else
                resolve(img);
        });
    });
}
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
// ArrayBuffer -> HTMLImageElement
function getImageFromArrayBuffer(buffer, cb) {
    var url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
    getImageFromURL(url, function (err, img) {
        URL.revokeObjectURL(url);
        if (err == null)
            cb(null, img);
        else
            cb(err, null);
    });
}
exports.getImageFromArrayBuffer = getImageFromArrayBuffer;
// URL -> HTMLImageElement
function fetchImageFromURL(url) {
    return new Promise(function (resolve, reject) {
        getImageFromURL(url, function (err, img) {
            if (!!err)
                reject(err);
            else
                resolve(img);
        });
    });
}
exports.fetchImageFromURL = fetchImageFromURL;
// URL -> HTMLImageElement
function getImageFromURL(url, cb) {
    var img = new Image();
    img.src = url;
    img.addEventListener("load", function () {
        cb(null, img);
    });
    img.addEventListener("error", function (ev) {
        console.error("SurfaceUtil.getImageFromURL", ev);
        cb(ev, null);
    });
}
exports.getImageFromURL = getImageFromURL;
// random(func, n) means call func 1/n per sec
function random(callback, probability) {
    setTimeout((function () {
        function nextTick() { random(callback, probability); }
        if (Math.random() < 1 / probability)
            callback(nextTick);
        else
            nextTick();
    }), 1000);
}
exports.random = random;
// cron
function periodic(callback, sec) {
    setTimeout((function () {
        return callback(function () {
            return periodic(callback, sec);
        });
    }), sec * 1000);
}
exports.periodic = periodic;
// 非同期ループするだけ
function always(callback) {
    callback(function () { return always(callback); });
}
exports.always = always;
// canvasの座標のアルファチャンネルが不透明ならtrue
function isHit(cnv, x, y) {
    if (!(x > 0 && y > 0))
        return false;
    // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
    if (!(cnv.width > 0 || cnv.height > 0))
        return false;
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x, y);
    var data = imgdata.data;
    return data[data.length - 1] !== 0;
}
exports.isHit = isHit;
// 1x1の canvas を作るだけ
function createCanvas() {
    var cnv = document.createElement("canvas");
    cnv.width = 1;
    cnv.height = 1;
    return cnv;
}
exports.createCanvas = createCanvas;
// 0 -> sakura
function scope(scopeId) {
    return scopeId === 0 ? "sakura"
        : scopeId === 1 ? "kero"
            : "char" + scopeId;
}
exports.scope = scope;
// sakuta -> 0
function unscope(charId) {
    return charId === "sakura" ? 0
        : charId === "kero" ? 1
            : Number(/^char(\d+)/.exec(charId)[1]);
}
exports.unscope = unscope;
// JQueryEventObject からタッチ・マウスを正規化して座標値を抜き出す便利関数
function getEventPosition(ev) {
    if (/^touch/.test(ev.type) && ev.originalEvent.touches.length > 0) {
        var pageX_1 = ev.originalEvent.touches[0].pageX;
        var pageY_1 = ev.originalEvent.touches[0].pageY;
        var clientX_1 = ev.originalEvent.touches[0].clientX;
        var clientY_1 = ev.originalEvent.touches[0].clientY;
        var screenX_1 = ev.originalEvent.touches[0].screenX;
        var screenY_1 = ev.originalEvent.touches[0].screenY;
        return { pageX: pageX_1, pageY: pageY_1, clientX: clientX_1, clientY: clientY_1, screenX: screenX_1, screenY: screenY_1 };
    }
    var pageX = ev.pageX;
    var pageY = ev.pageY;
    var clientX = ev.clientX;
    var clientY = ev.clientY;
    var screenX = ev.screenX;
    var screenY = ev.screenY;
    return { pageX: pageX, pageY: pageY, clientX: clientX, clientY: clientY, screenX: screenX, screenY: screenY };
}
exports.getEventPosition = getEventPosition;
// min-max 間のランダム値
function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.randomRange = randomRange;
// このサーフェスの定義 surfaceNode.collision と canvas と座標を比較して
// collision設定されていれば name"hoge"
function getRegion(element, collisions, offsetX, offsetY) {
    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    var _this = this;
    var hitCols = collisions.filter(function (collision, colId) {
        var type = collision.type, name = collision.name;
        switch (collision.type) {
            case "rect":
                var _a = collision, left = _a.left, top = _a.top, right = _a.right, bottom = _a.bottom;
                return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
                    (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
            case "ellipse":
                var _b = collision, left = _b.left, top = _b.top, right = _b.right, bottom = _b.bottom;
                var width = Math.abs(right - left);
                var height = Math.abs(bottom - top);
                return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) +
                    Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
            case "circle":
                var _c = collision, radius = _c.radius, center_x = _c.center_x, center_y = _c.center_y;
                return Math.pow((offsetX - center_x) / radius, 2) + Math.pow((offsetY - center_y) / radius, 2) < 1;
            case "polygon":
                var coordinates = collision.coordinates;
                var ptC = { x: offsetX, y: offsetY };
                var tuples = coordinates.reduce((function (arr, _a, i) {
                    var x = _a.x, y = _a.y;
                    arr.push([
                        coordinates[i],
                        (!!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0])
                    ]);
                    return arr;
                }), []);
                var deg = tuples.reduce((function (sum, _a) {
                    var ptA = _a[0], ptB = _a[1];
                    var vctA = [ptA.x - ptC.x, ptA.y - ptC.y];
                    var vctB = [ptB.x - ptC.x, ptB.y - ptC.y];
                    var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                    var absA = Math.sqrt(vctA.map(function (a) { return Math.pow(a, 2); }).reduce(function (a, b) { return a + b; }));
                    var absB = Math.sqrt(vctB.map(function (a) { return Math.pow(a, 2); }).reduce(function (a, b) { return a + b; }));
                    var rad = Math.acos(dotP / (absA * absB));
                    return sum + rad;
                }), 0);
                return deg / (2 * Math.PI) >= 1;
            default:
                console.warn("unkown collision type:", _this.surfaceId, colId, name, collision);
                return false;
        }
    });
    if (hitCols.length > 0) {
        return hitCols[hitCols.length - 1].name;
    }
    return "";
}
exports.getRegion = getRegion;
function getScrollXY() {
    return {
        scrollX: window.scrollX || window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft,
        scrollY: window.scrollY || window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    };
}
exports.getScrollXY = getScrollXY;
