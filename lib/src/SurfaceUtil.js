/// <reference path="../typings/tsd.d.ts"/>
var encoding_japanese_1 = require("encoding-japanese");
function pna(srfCnv) {
    var { cnv, png, pna } = srfCnv;
    if (cnv != null) {
        // 色抜き済みだった
        return srfCnv;
    }
    if (cnv == null && png != null && pna == null) {
        // 背景色抜き
        cnv = copy(png);
        var ctx = cnv.getContext("2d");
        var imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
        chromakey_snipet(imgdata.data);
        ctx.putImageData(imgdata, 0, 0);
        srfCnv.cnv = cnv; // キャッシュに反映
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
        cnv = cnvA;
        srfCnv.cnv = cnv; // キャッシュに反映
        return srfCnv;
    }
    // png, cnv が null なのは element だけで構成されたサーフェスの dummy base
    return srfCnv;
}
exports.pna = pna;
function createSurfaceCanvasDummy() {
    console.warn("SurfaceUtil.createSurfaceCanvasDummy is deprecated");
    return { cnv: null, png: null, pna: null };
}
exports.createSurfaceCanvasDummy = createSurfaceCanvasDummy;
function createSurfaceCanvasFromURL(url) {
    console.warn("SurfaceUtil.createSurfaceCanvasFromURL is deprecated");
    return fetchArrayBuffer(url)
        .then(createSurfaceCanvasFromArrayBuffer);
}
exports.createSurfaceCanvasFromURL = createSurfaceCanvasFromURL;
function createSurfaceCanvasFromArrayBuffer(buffer) {
    console.warn("SurfaceUtil.createSurfaceCanvasFromArrayBuffer is deprecated");
    return fetchImageFromArrayBuffer(buffer)
        .then((img) => {
        var cnv = copy(img);
        var ctx = cnv.getContext("2d");
        var imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
        chromakey_snipet(imgdata.data);
        ctx.putImageData(imgdata, 0, 0);
        return { cnv: cnv, img: img };
    });
}
exports.createSurfaceCanvasFromArrayBuffer = createSurfaceCanvasFromArrayBuffer;
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
function log(element, description = "") {
    if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement) {
        description += (element.width + "x" + element.height);
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
// extend deep like jQuery $.extend(true, target, source)
function extend(target, source) {
    for (var key in source) {
        if (typeof source[key] === "object" && Object.getPrototypeOf(source[key]) === Object.prototype) {
            target[key] = target[key] || {};
            extend(target[key], source[key]);
        }
        else if (Array.isArray(source[key])) {
            target[key] = target[key] || [];
            extend(target[key], source[key]);
        }
        else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}
exports.extend = extend;
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
    lines = lines.filter(function (line) { return line.length !== 0; }); // remove no content line
    var dic = lines.reduce(function (dic, line) {
        var tmp = line.split(",");
        var key = tmp[0];
        var vals = tmp.slice(1);
        key = key.trim();
        var val = vals.join(",").trim();
        dic[key] = val;
        return dic;
    }, {});
    return dic;
}
exports.parseDescript = parseDescript;
// XMLHttpRequest, xhr.responseType = "arraybuffer"
function fetchArrayBuffer(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    return resolve(xhr.response);
                }
                else {
                    return reject(new Error("message: " + xhr.response.error.message));
                }
            }
            else {
                return reject(new Error("status: " + xhr.status));
            }
        });
        xhr["open"]("GET", url);
        xhr["responseType"] = "arraybuffer";
        return xhr["send"]();
    });
}
exports.fetchArrayBuffer = fetchArrayBuffer;
// convert some encoding txt file arraybuffer to js string
// TODO: use text-enconding & charset detection code
function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return encoding_japanese_1.default.codeToString(encoding_japanese_1.default.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}
exports.convert = convert;
// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...
function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter((key) => reg.test(key));
    return hits;
}
exports.find = find;
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
function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    console.warn("SurfaceUtil.fetchPNGUint8ClampedArrayFromArrayBuffer is deprecated");
    return new Promise((resolve, reject) => {
        reject("deplicated");
        /*
        var reader = new PNGReader(pngbuf);
        var png = reader.parse();
        var dataA = png.getUint8ClampedArray();
        if(typeof pnabuf === "undefined"){
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
          return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
        }
        var pnareader = new PNGReader(pnabuf);
        var pna = pnareader.parse();
        var dataB = pna.getUint8ClampedArray();
        if(dataA.length !== dataB.length){
          return reject("fetchPNGUint8ClampedArrayFromArrayBuffer TypeError: png" +
          png.width+"x"+png.height+" and  pna"+pna.width+"x"+pna.height +
          " do not match both sizes");
        }
        var j = 0;
        while (j < dataA.length) {
          dataA[j + 3] = dataB[j];
          j += 4;
        }
        return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
        */
    }).catch((err) => {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}
exports.fetchPNGUint8ClampedArrayFromArrayBuffer = fetchPNGUint8ClampedArrayFromArrayBuffer;
// ArrayBuffer -> HTMLImageElement
function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then((img) => {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    }).catch((err) => {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
// URL -> HTMLImageElement
function fetchImageFromURL(url) {
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
exports.fetchImageFromURL = fetchImageFromURL;
// random(func, n) means call func 1/n per sec
function random(callback, probability) {
    setTimeout((() => {
        function nextTick() { random(callback, probability); }
        if (Math.random() < 1 / probability)
            callback(nextTick);
        else
            nextTick();
    }), 1000);
}
exports.random = random;
function periodic(callback, sec) {
    setTimeout((() => callback(() => periodic(callback, sec))), sec * 1000);
}
exports.periodic = periodic;
function always(callback) {
    callback(() => always(callback));
}
exports.always = always;
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
function offset(element) {
    var obj = element.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
}
exports.offset = offset;
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
function getEventPosition(ev) {
    if (/^touch/.test(ev.type) && ev.originalEvent.touches.length > 0) {
        var pageX = ev.originalEvent.touches[0].pageX;
        var pageY = ev.originalEvent.touches[0].pageY;
        var clientX = ev.originalEvent.touches[0].clientX;
        var clientY = ev.originalEvent.touches[0].clientY;
        var screenX = ev.originalEvent.touches[0].screenX;
        var screenY = ev.originalEvent.touches[0].screenY;
        return { pageX: pageX, pageY: pageY, clientX: clientX, clientY: clientY, screenX: screenX, screenY: screenY };
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
function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.randomRange = randomRange;
function getRegion(element, surfaceNode, offsetX, offsetY) {
    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    if (isHit(element, offsetX, offsetY)) {
        var hitCols = surfaceNode.collisions.filter((collision, colId) => {
            var { type, name, left, top, right, bottom, coordinates, radius, center_x, center_y } = collision;
            switch (type) {
                case "rect":
                    return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
                        (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
                case "ellipse":
                    var width = Math.abs(right - left);
                    var height = Math.abs(bottom - top);
                    return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) +
                        Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
                case "circle":
                    return Math.pow((offsetX - center_x) / radius, 2) + Math.pow((offsetY - center_y) / radius, 2) < 1;
                case "polygon":
                    var ptC = { x: offsetX, y: offsetY };
                    var tuples = coordinates.reduce(((arr, { x, y }, i) => {
                        arr.push([
                            coordinates[i],
                            (!!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0])
                        ]);
                        return arr;
                    }), []);
                    var deg = tuples.reduce(((sum, [ptA, ptB]) => {
                        var vctA = [ptA.x - ptC.x, ptA.y - ptC.y];
                        var vctB = [ptB.x - ptC.x, ptB.y - ptC.y];
                        var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                        var absA = Math.sqrt(vctA.map((a) => Math.pow(a, 2)).reduce((a, b) => a + b));
                        var absB = Math.sqrt(vctB.map((a) => Math.pow(a, 2)).reduce((a, b) => a + b));
                        var rad = Math.acos(dotP / (absA * absB));
                        return sum + rad;
                    }), 0);
                    return deg / (2 * Math.PI) >= 1;
                default:
                    console.warn("unkown collision type:", this.surfaceId, colId, name, collision);
                    return false;
            }
        });
        if (hitCols.length > 0)
            return { isHit: true, name: hitCols[hitCols.length - 1].name };
        return { isHit: true, name: "" };
    }
    else {
        return { isHit: false, name: "" };
    }
}
exports.getRegion = getRegion;