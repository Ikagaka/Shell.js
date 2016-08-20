"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var Encoding = require("encoding-japanese");
var $ = require("jquery");
exports.extend = $.extend;
function chromakey(png) {
    var cnvA = copy(png);
    var ctxA = cnvA.getContext("2d");
    if (!ctxA) throw new Error("getContext failed");
    var imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    chromakey_snipet(imgdata.data);
    ctxA.putImageData(imgdata, 0, 0);
    return cnvA;
}
exports.chromakey = chromakey;
function png_pna(png, pna) {
    var cnvA = png instanceof HTMLCanvasElement ? png : copy(png);
    var ctxA = cnvA.getContext("2d");
    if (!ctxA) throw new Error("getContext failed");
    var imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    var dataA = imgdataA.data;
    var cnvB = pna instanceof HTMLCanvasElement ? pna : copy(pna);
    var ctxB = cnvB.getContext("2d");
    if (!ctxB) throw new Error("getContext failed");
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
    return cnvA;
}
exports.png_pna = png_pna;
function chromakey_snipet(data) {
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
}
exports.chromakey_snipet = chromakey_snipet;
function log(element) {
    var description = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

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
        if (match.length === 0) break;
        text = text.replace(match, "");
    }
    var lines = text.split("\n");
    var _lines = lines.filter(function (line) {
        return line.length !== 0;
    }); // remove no content line
    var dic = _lines.reduce(function (dic, line) {
        var _line$split = line.split(",");

        var _line$split2 = _toArray(_line$split);

        var key = _line$split2[0];

        var vals = _line$split2.slice(1);

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
        var xhr = new XMLHttpRequest();
        var warn = function warn(msg) {
            console.warn("SurfaceUtil.fetchArrayBuffer: error", msg, xhr);
            reject(msg);
        };
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    resolve(xhr.response);
                } else {
                    warn(xhr.response.error.message);
                }
            } else {
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
    if (filename.slice(0, 2) === "./") filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter(function (key) {
        return reg.test(key);
    });
    return hits;
}
exports.find = find;
// 検索打ち切って高速化
function fastfind(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./") filename = filename.slice(2);
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
    return arr[(Math.random() * 100 * arr.length | 0) % arr.length];
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
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}
exports.copy = copy;
// tmpcnvにコピー
function fastcopy(cnv, tmpctx) {
    tmpctx.canvas.width = cnv.width;
    tmpctx.canvas.height = cnv.height;
    tmpctx.drawImage(cnv, 0, 0); // type hack
}
exports.fastcopy = fastcopy;
// ArrayBuffer -> HTMLImageElement
function fetchImageFromArrayBuffer(buffer, mimetype) {
    return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
        return fetchImageFromURL(url);
    });
}
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
// URL -> HTMLImageElement
function fetchImageFromURL(url) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
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
    return setTimeout(function () {
        function nextTick() {
            random(callback, probability);
        }
        if (Math.random() < 1 / probability) callback(nextTick);else nextTick();
    }, 1000);
}
exports.random = random;
// cron
function periodic(callback, sec) {
    return setTimeout(function () {
        return callback(function () {
            return periodic(callback, sec);
        });
    }, sec * 1000);
}
exports.periodic = periodic;
// 非同期ループするだけ
function always(callback) {
    return setTimeout(function () {
        return callback(function () {
            return always(callback);
        });
    }, 0);
}
exports.always = always;
// canvasの座標のアルファチャンネルが不透明ならtrue
function isHit(cnv, x, y) {
    if (!(x > 0 && y > 0)) return false;
    // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
    if (!(cnv.width > 0 || cnv.height > 0)) return false;
    var ctx = cnv.getContext("2d");
    if (!ctx) throw new Error("getContext failed");
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
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
}
exports.scope = scope;
// sakura -> 0
// parse error -> -1
function unscope(charId) {
    return charId === "sakura" ? 0 : charId === "kero" ? 1 : Number((/^char(\d+)/.exec(charId) || ["", "-1"])[1]);
}
exports.unscope = unscope;
// JQueryEventObject からタッチ・マウスを正規化して座標値を抜き出す便利関数
function getEventPosition(ev) {
    if (/^touch/.test(ev.type) && ev.originalEvent.touches.length > 0) {
        var _pageX = ev.originalEvent.touches[0].pageX;
        var _pageY = ev.originalEvent.touches[0].pageY;
        var _clientX = ev.originalEvent.touches[0].clientX;
        var _clientY = ev.originalEvent.touches[0].clientY;
        var _screenX = ev.originalEvent.touches[0].screenX;
        var _screenY = ev.originalEvent.touches[0].screenY;
        return { pageX: _pageX, pageY: _pageY, clientX: _clientX, clientY: _clientY, screenX: _screenX, screenY: _screenY };
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
    var _this = this;

    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    var hitCols = collisions.filter(function (collision, colId) {
        var type = collision.type;
        var name = collision.name;
        var left, top, right, bottom;
        var left, top, right, bottom;

        var _ret = function () {
            switch (collision.type) {
                case "rect":
                    left = collision.left;
                    top = collision.top;
                    right = collision.right;
                    bottom = collision.bottom;

                    return {
                        v: left < offsetX && offsetX < right && top < offsetY && offsetY < bottom || right < offsetX && offsetX < left && bottom < offsetX && offsetX < top
                    };
                case "ellipse":
                    left = collision.left;
                    top = collision.top;
                    right = collision.right;
                    bottom = collision.bottom;

                    var width = Math.abs(right - left);
                    var height = Math.abs(bottom - top);
                    return {
                        v: Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) + Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1
                    };
                case "circle":
                    var radius = collision.radius;
                    var centerX = collision.centerX;
                    var centerY = collision.centerY;

                    return {
                        v: Math.pow((offsetX - centerX) / radius, 2) + Math.pow((offsetY - centerY) / radius, 2) < 1
                    };
                case "polygon":
                    var coordinates = collision.coordinates;

                    var ptC = { x: offsetX, y: offsetY };
                    var tuples = coordinates.reduce(function (arr, _ref, i) {
                        var x = _ref.x;
                        var y = _ref.y;

                        arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                        return arr;
                    }, []);
                    var deg = tuples.reduce(function (sum, _ref2) {
                        var _ref3 = _slicedToArray(_ref2, 2);

                        var ptA = _ref3[0];
                        var ptB = _ref3[1];

                        var vctA = [ptA.x - ptC.x, ptA.y - ptC.y];
                        var vctB = [ptB.x - ptC.x, ptB.y - ptC.y];
                        var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                        var absA = Math.sqrt(vctA.map(function (a) {
                            return Math.pow(a, 2);
                        }).reduce(function (a, b) {
                            return a + b;
                        }));
                        var absB = Math.sqrt(vctB.map(function (a) {
                            return Math.pow(a, 2);
                        }).reduce(function (a, b) {
                            return a + b;
                        }));
                        var rad = Math.acos(dotP / (absA * absB));
                        return sum + rad;
                    }, 0);
                    return {
                        v: deg / (2 * Math.PI) >= 1
                    };
                default:
                    console.warn("unkown collision type:", _this.surfaceId, colId, name, collision);
                    return {
                        v: false
                    };
            }
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
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
function findSurfacesTxt(filepaths) {
    return filepaths.filter(function (name) {
        return (/^surfaces.*\.txt$|^alias\.txt$/i.test(name)
        );
    });
}
exports.findSurfacesTxt = findSurfacesTxt;
function fetchArrayBufferFromURL(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    resolve(xhr.response);
                } else {
                    reject(new Error("message: " + xhr.response.error.message));
                }
            } else {
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
    var ptr = o;
    var props = key.split(".");
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];

        var _Array$prototype$slic = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop) || ["", "", ""], 1);

        var _Array$prototype$slic2 = _slicedToArray(_Array$prototype$slic, 2);

        var _prop = _Array$prototype$slic2[0];
        var num = _Array$prototype$slic2[1];

        var _num = Number(num);
        if (isFinite(_num)) {
            if (!Array.isArray(ptr[_prop])) {
                ptr[_prop] = [];
            }
            ptr[_prop][_num] = ptr[_prop][_num] || {};
            if (i !== props.length - 1) {
                ptr = ptr[_prop][_num];
            } else {
                if (ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0) {
                    // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
                    // menu, 0 -> menu.value
                    // menu.font...
                    // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
                    // このifはその例外への対処である
                    ptr[_prop][_num].value = Number(value) || value;
                } else {
                    ptr[_prop][_num] = Number(value) || value;
                }
            }
        } else {
            ptr[_prop] = ptr[_prop] || {};
            if (i !== props.length - 1) {
                ptr = ptr[_prop];
            } else {
                if (ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0) {
                    ptr[_prop].value = Number(value) || value;
                } else {
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
    var key = "";
    if ((key = this.has(dir, path)) === "") {
        return Promise.reject("file not find");
    }
    return Promise.resolve(dir[key]);
}
exports.get = get;
function setPictureFrame(element, description) {
    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    fieldset.style.backgroundColor = "#D2E0E6";
    document.body.appendChild(fieldset);
    return;
}
exports.setPictureFrame = setPictureFrame;