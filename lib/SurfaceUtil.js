/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.init = init;
exports.chromakey_snipet = chromakey_snipet;
exports.log = log;
exports.extend = extend;
exports.parseDescript = parseDescript;
exports.fetchArrayBuffer = fetchArrayBuffer;
exports.convert = convert;
exports.find = find;
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
exports.unscope = unscope;
exports.getEventPosition = getEventPosition;
exports.recursiveElementFromPoint = recursiveElementFromPoint;
exports.eventPropagationSim = eventPropagationSim;
exports.randomRange = randomRange;
exports.getRegion = getRegion;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _encodingJapanese = require("encoding-japanese");

var _encodingJapanese2 = _interopRequireDefault(_encodingJapanese);

function init(cnv, ctx, src) {
    cnv.width = src.width;
    cnv.height = src.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(src, 0, 0);
}

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

function log(element) {
    var description = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    document.body.appendChild(fieldset);
}

// extend deep like jQuery $.extend(true, target, source)

function extend(target, source) {
    for (var key in source) {
        if (typeof source[key] === "object" && Object.getPrototypeOf(source[key]) === Object.prototype) {
            target[key] = target[key] || {};
            extend(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
            target[key] = target[key] || [];
            extend(target[key], source[key]);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

// "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}

function parseDescript(text) {
    text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
    while (true) {
        var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["", ""])[0];
        if (match.length === 0) break;
        text = text.replace(match, "");
    }
    var lines = text.split("\n");
    lines = lines.filter(function (line) {
        return line.length !== 0;
    }); // remove no content line
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

// XMLHttpRequest, xhr.responseType = "arraybuffer"

function fetchArrayBuffer(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    return resolve(xhr.response);
                } else {
                    return reject(new Error("message: " + xhr.response.error.message));
                }
            } else {
                return reject(new Error("status: " + xhr.status));
            }
        });
        xhr["open"]("GET", url);
        xhr["responseType"] = "arraybuffer";
        return xhr["send"]();
    });
}

// convert some encoding txt file arraybuffer to js string
// TODO: use text-enconding & charset detection code

function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return _encodingJapanese2["default"].codeToString(_encodingJapanese2["default"].convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

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

// [1,2,3] -> 1 or 2 or 3 as 33% probability

function choice(arr) {
    return arr[(Math.random() * 100 * arr.length | 0) % arr.length];
}

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

function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    return new Promise(function (resolve, reject) {
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
    })["catch"](function (err) {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}

// ArrayBuffer -> HTMLImageElement

function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    })["catch"](function (err) {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}

// URL -> HTMLImageElement

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

// random(func, n) means call func 1/n per sec

function random(callback, probability) {
    setTimeout(function () {
        function nextTick() {
            random(callback, probability);
        }
        if (Math.random() < 1 / probability) callback(nextTick);else nextTick();
    }, 1000);
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
    if (!(cnv.width > 0 || cnv.height > 0)) return false;
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x + 1 | 0, y + 1 | 0);
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

// 0 -> sakura

function scope(scopeId) {
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
}

// sakuta -> 0

function unscope(charId) {
    return charId === "sakura" ? 0 : charId === "kero" ? 1 : Number(/^char(\d+)/.exec(charId)[1]);
}

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

function recursiveElementFromPoint(ev, parent, target) {
    var _getEventPosition = getEventPosition(ev);

    var clientX = _getEventPosition.clientX;
    var clientY = _getEventPosition.clientY;
    var pageX = _getEventPosition.pageX;
    var pageY = _getEventPosition.pageY;

    var _$$offset = $(target).offset();

    var left = _$$offset.left;
    var top = _$$offset.top;

    var offsetX = clientX - (left - window.scrollX); // window.scrollX は position: fixed; でのclientWidthをとるため
    var offsetY = clientY - (top - window.scrollY);
    if ($(parent).find(target).length > 0 && target instanceof HTMLCanvasElement && isHit(target, offsetX, offsetY)) {
        eventPropagationSim(target, ev);
        return target;
    }
    var tmp = target.style.display;
    target.style.display = "none";
    var under = document.elementFromPoint(clientX, clientY);
    if (under == null) {
        target.style.display = tmp;
        return null;
    }
    if ($(parent).find(under).length > 0) {
        var result = recursiveElementFromPoint(ev, parent, under);
        target.style.display = tmp;
        return result;
    }
    eventPropagationSim(under, ev);
    target.style.display = tmp;
    // マウスを停止しているのにここを大量のmousemoveが通過するが
    // target.style.display = "none"したのち
    // target.style.display = tmp した瞬間に
    // mousemoveが発生してしまうためで、それほど大きな問題はないので大丈夫
    // (モバイルだとマウスないからmousemove発生しないし)
    return under;
}

function eventPropagationSim(target, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (/^mouse|click$/.test(ev.type)) {
        var mev = new MouseEvent(ev.type, {
            screenX: ev.screenX,
            screenY: ev.screenY,
            clientX: ev.clientX,
            clientY: ev.clientY,
            ctrlKey: ev.ctrlKey,
            altKey: ev.altKey,
            shiftKey: ev.shiftKey,
            metaKey: ev.metaKey,
            button: ev.button,
            buttons: ev.originalEvent["buttons"],
            relatedTarget: ev.relatedTarget,
            view: ev.originalEvent["view"],
            detail: ev.originalEvent["detail"],
            bubbles: true
        });
        target.dispatchEvent(mev);
    } else if (/^touch/.test(ev.type)) {
        var ua = window.navigator.userAgent.toLowerCase();
        if (!(document.createTouch instanceof Function)) return console.warn(ua, "does not support document.createTouch");
        if (!(document.createTouchList instanceof Function)) return console.warn(ua, "does not support document.createTouchList");
        if (!(tev["initTouchEvent"] instanceof Function)) return console.warn(ua, "does not support TouchEvent#initTouchEvent");

        var _getEventPosition2 = getEventPosition(ev);

        var pageX = _getEventPosition2.pageX;
        var pageY = _getEventPosition2.pageY;
        var clientX = _getEventPosition2.clientX;
        var clientY = _getEventPosition2.clientY;
        var screenX = _getEventPosition2.screenX;
        var screenY = _getEventPosition2.screenY;

        var tev = document.createEvent("TouchEvent");
        var touch = document.createTouch(document.defaultView, ev.target, 0, pageX, pageY, screenX, screenY);
        var touches = document.createTouchList(touch);
        if (ua.indexOf('chrome') != -1 || ua.indexOf('opera') != -1) {
            console.info("this browser is chrome or opera", ua);
            tev["initTouchEvent"](touches, touches, touches, ev.type, ev.originalEvent["view"], screenX, screenY, clientX, clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey);
        } else if (ua.indexOf('safari') != -1) {
            console.info("this browser is safari", ua);
            tev["initTouchEvent"](ev.type, true, ev.cancelable, ev.originalEvent["view"], ev.originalEvent["detail"], screenX, screenY, clientX, clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, touches, touches, touches, 0, 0);
        } else if (ua.indexOf('firefox') != -1 || true) {
            console.info("this browser is firefox", ua);
            tev["initTouchEvent"](ev.type, true, ev.cancelable, ev.originalEvent["view"], ev.originalEvent["detail"], ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, touches, touches, touches);
        }
        target.dispatchEvent(tev);
    } else {
        console.warn(ev.type, "is not support event");
    }
}

function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function getRegion(element, surfaceNode, offsetX, offsetY) {
    var _this = this;

    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    if (isHit(element, offsetX, offsetY)) {
        var hitCols = surfaceNode.collisions.filter(function (collision, colId) {
            var type = collision.type;
            var name = collision.name;
            var left = collision.left;
            var top = collision.top;
            var right = collision.right;
            var bottom = collision.bottom;
            var coordinates = collision.coordinates;
            var radius = collision.radius;
            var center_x = collision.center_x;
            var center_y = collision.center_y;

            switch (type) {
                case "rect":
                    return left < offsetX && offsetX < right && top < offsetY && offsetY < bottom || right < offsetX && offsetX < left && bottom < offsetX && offsetX < top;
                case "ellipse":
                    var width = Math.abs(right - left);
                    var height = Math.abs(bottom - top);
                    return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) + Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
                case "circle":
                    return Math.pow((offsetX - center_x) / radius, 2) + Math.pow((offsetY - center_y) / radius, 2) < 1;
                case "polygon":
                    var ptC = { x: offsetX, y: offsetY };
                    var tuples = coordinates.reduce(function (arr, _ref, i) {
                        var x = _ref.x;
                        var y = _ref.y;

                        arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                        return arr;
                    }, []);
                    var deg = tuples.reduce(function (sum, _ref2) {
                        var _ref22 = _slicedToArray(_ref2, 2);

                        var ptA = _ref22[0];
                        var ptB = _ref22[1];

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
                    return deg / (2 * Math.PI) >= 1;
                default:
                    console.warn("unkown collision type:", _this.surfaceId, colId, name, collision);
                    return false;
            }
        });
        if (hitCols.length > 0) return { isHit: true, name: hitCols[hitCols.length - 1].name };
        return { isHit: true, name: "" };
    } else {
        return { isHit: false, name: "" };
    }
}