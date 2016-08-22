/*
 * 可用性・抽象度の高いコードスニペット集
 * SurfaceUtil という名称は Util のほうがむしろふさわしいが
 * 歴史的経緯と変更コストを鑑みてこのままにしている
 */
"use strict";
const Encoding = require("encoding-japanese");
const $ = require("jquery");
exports.extend = $.extend;
function chromakey(png) {
    const cnvA = copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    chromakey_snipet(imgdata.data);
    ctxA.putImageData(imgdata, 0, 0);
    return cnvA;
}
exports.chromakey = chromakey;
function png_pna(png, pna) {
    const cnvA = png instanceof HTMLCanvasElement ? png : copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    const dataA = imgdataA.data;
    const cnvB = pna instanceof HTMLCanvasElement ? pna : copy(pna);
    const ctxB = cnvB.getContext("2d");
    const imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
    const dataB = imgdataB.data;
    for (let y = 0; y < cnvB.height; y++) {
        for (let x = 0; x < cnvB.width; x++) {
            const iA = x * 4 + y * cnvA.width * 4; // baseのxy座標とインデックス
            const iB = x * 4 + y * cnvB.width * 4; // pnaのxy座標とインデックス
            dataA[iA + 3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
        }
    }
    ctxA.putImageData(imgdataA, 0, 0);
    return cnvA;
}
exports.png_pna = png_pna;
function chromakey_snipet(data) {
    const r = data[0], g = data[1], b = data[2], a = data[3];
    let i = 0;
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
        description += "(" + element.width + "x" + element.height + ")";
    }
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
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
        const match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["", ""])[0];
        if (match.length === 0)
            break;
        text = text.replace(match, "");
    }
    const lines = text.split("\n");
    const _lines = lines.filter(function (line) { return line.length !== 0; }); // remove no content line
    const dic = _lines.reduce(function (dic, line) {
        const [key, ...vals] = line.split(",");
        const _key = key.trim();
        const val = vals.join(",").trim();
        dic[_key] = val;
        return dic;
    }, {});
    return dic;
}
exports.parseDescript = parseDescript;
// XMLHttpRequest, xhr.responseType = "arraybuffer"
function fetchArrayBuffer(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const warn = (msg) => {
            console.warn("SurfaceUtil.fetchArrayBuffer: error", msg, xhr);
            reject(msg);
        };
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    resolve(xhr.response);
                }
                else {
                    warn(xhr.response.error.message);
                }
            }
            else {
                warn("" + xhr.status);
            }
        });
        xhr.addEventListener("error", function () {
            warn(xhr.response.error.message);
        });
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";
        return xhr.send();
    });
}
exports.fetchArrayBuffer = fetchArrayBuffer;
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
    const reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    const hits = paths.filter((key) => reg.test(key));
    return hits;
}
exports.find = find;
// 検索打ち切って高速化
function fastfind(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    const reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    for (let i = 0; i < paths.length; i++) {
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
    const _copy = document.createElement("canvas");
    const ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}
exports.copy = copy;
// tmpcnvにコピー
function fastcopy(cnv, tmpctx) {
    tmpctx.canvas.width = cnv.width;
    tmpctx.canvas.height = cnv.height;
    tmpctx.globalCompositeOperation = "source-over";
    tmpctx.drawImage(cnv, 0, 0); // type hack
}
exports.fastcopy = fastcopy;
// ArrayBuffer -> HTMLImageElement
function fetchImageFromArrayBuffer(buffer, mimetype) {
    const url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
    return fetchImageFromURL(url).then((img) => {
        URL.revokeObjectURL(url);
        return img;
    });
}
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
// URL -> HTMLImageElement
function fetchImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.addEventListener("load", function () {
            resolve(img);
        });
        img.addEventListener("error", function (ev) {
            console.error("SurfaceUtil.fetchImageFromURL:", ev);
            reject(ev.error);
        });
    });
}
exports.fetchImageFromURL = fetchImageFromURL;
// random(func, n) means call func 1/n per sec
function random(callback, probability) {
    return setTimeout((() => {
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
    return setTimeout((() => callback(() => periodic(callback, sec))), sec * 1000);
}
exports.periodic = periodic;
// 非同期ループするだけ
function always(callback) {
    return setTimeout((() => callback(() => always(callback))), 0);
}
exports.always = always;
// canvasの座標のアルファチャンネルが不透明ならtrue
function isHit(cnv, x, y) {
    if (!(x > 0 && y > 0))
        return false;
    // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
    if (!(cnv.width > 0 || cnv.height > 0))
        return false;
    const ctx = cnv.getContext("2d");
    const imgdata = ctx.getImageData(0, 0, x, y);
    const data = imgdata.data;
    return data[data.length - 1] !== 0;
}
exports.isHit = isHit;
// 1x1の canvas を作るだけ
function createCanvas() {
    const cnv = document.createElement("canvas");
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
// sakura -> 0
// parse error -> -1
function unscope(charId) {
    return charId === "sakura" ? 0
        : charId === "kero" ? 1
            : Number((/^char(\d+)/.exec(charId) || ["", "-1"])[1]);
}
exports.unscope = unscope;
// JQueryEventObject からタッチ・マウスを正規化して座標値を抜き出す便利関数
function getEventPosition(ev) {
    if (/^touch/.test(ev.type) && ev.originalEvent.touches.length > 0) {
        const pageX = ev.originalEvent.touches[0].pageX;
        const pageY = ev.originalEvent.touches[0].pageY;
        const clientX = ev.originalEvent.touches[0].clientX;
        const clientY = ev.originalEvent.touches[0].clientY;
        const screenX = ev.originalEvent.touches[0].screenX;
        const screenY = ev.originalEvent.touches[0].screenY;
        return { pageX, pageY, clientX, clientY, screenX, screenY };
    }
    const pageX = ev.pageX;
    const pageY = ev.pageY;
    const clientX = ev.clientX;
    const clientY = ev.clientY;
    const screenX = ev.screenX;
    const screenY = ev.screenY;
    return { pageX, pageY, clientX, clientY, screenX, screenY };
}
exports.getEventPosition = getEventPosition;
// min-max 間のランダム値
function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.randomRange = randomRange;
function getScrollXY() {
    return {
        scrollX: window.scrollX || window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft,
        scrollY: window.scrollY || window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    };
}
exports.getScrollXY = getScrollXY;
function findSurfacesTxt(filepaths) {
    return filepaths.filter((name) => /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
}
exports.findSurfacesTxt = findSurfacesTxt;
function fetchArrayBufferFromURL(url) {
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
exports.fetchArrayBufferFromURL = fetchArrayBufferFromURL;
function decolateJSONizeDescript(o, key, value) {
    // オートマージ
    // dic["a.b.c"]="d"なテキストをJSON形式に変換している気がする
    let ptr = o;
    const props = key.split(".");
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const [_prop, num] = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop) || ["", "", ""], 1);
        const _num = Number(num);
        if (isFinite(_num)) {
            if (!Array.isArray(ptr[_prop])) {
                ptr[_prop] = [];
            }
            ptr[_prop][_num] = ptr[_prop][_num] || {};
            if (i !== props.length - 1) {
                ptr = ptr[_prop][_num];
            }
            else {
                if (ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0) {
                    // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
                    // menu, 0 -> menu.value
                    // menu.font...
                    // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
                    // このifはその例外への対処である
                    ptr[_prop][_num].value = Number(value) || value;
                }
                else {
                    ptr[_prop][_num] = Number(value) || value;
                }
            }
        }
        else {
            ptr[_prop] = ptr[_prop] || {};
            if (i !== props.length - 1) {
                ptr = ptr[_prop];
            }
            else {
                if (ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0) {
                    ptr[_prop].value = Number(value) || value;
                }
                else {
                    ptr[_prop] = Number(value) || value;
                }
            }
        }
    }
    return;
}
exports.decolateJSONizeDescript = decolateJSONizeDescript;
function changeFileExtension(filename, without_dot_new_extention) {
    return filename.replace(/\.[^\.]+$/i, "") + "." + without_dot_new_extention;
}
exports.changeFileExtension = changeFileExtension;
function ABToCav(ab) {
    return fetchImageFromArrayBuffer(ab).then(copy);
}
exports.ABToCav = ABToCav;
function has(dir, path) {
    return fastfind(Object.keys(dir), path);
}
exports.has = has;
function get(dir, path) {
    let key = "";
    if ((key = this.has(dir, path)) === "") {
        return Promise.reject("file not find");
    }
    return Promise.resolve(dir[key]);
}
exports.get = get;
function setPictureFrame(element, description) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    fieldset.style.backgroundColor = "#D2E0E6";
    document.body.appendChild(fieldset);
    return;
}
exports.setPictureFrame = setPictureFrame;
function craetePictureFrame(description, target = document.body) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.style.display = 'inline-block';
    target.appendChild(fieldset);
    fieldset.style.backgroundColor = "#D2E0E6";
    const add = (element, txt = "") => {
        if (txt === "") {
            const frame = craetePictureFrame(txt, fieldset);
            frame.add(element);
        }
        else if (typeof element === "string") {
            const txtNode = document.createTextNode(element);
            const p = document.createElement("p");
            p.appendChild(txtNode);
            fieldset.appendChild(p);
        }
        else {
            fieldset.appendChild(element);
        }
    };
    return { add };
}
exports.craetePictureFrame = craetePictureFrame;
