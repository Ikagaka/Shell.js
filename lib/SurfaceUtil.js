/**
 * extend deep like jQuery $.extend(true, target, source)
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.parseDescript = parseDescript;
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
exports.recursiveElementFromPoint = recursiveElementFromPoint;
exports.eventPropagationSim = eventPropagationSim;
exports.randomRange = randomRange;

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

/**
 * "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
 */

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

/**
 * convert some encoding txt file arraybuffer to js string
 */

function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

/**
 * find filename that matches arg "filename" from arg "paths"
 */

function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./") filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter(function (key) {
        return reg.test(key);
    });
    return hits;
}

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
        var nextTick = function nextTick() {
            return random(callback, probability);
        };
        callback(nextTick);
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

// 0 -> sakura

function scope(scopeId) {
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
}

// sakuta -> 0

function unscope(charId) {
    return charId === "sakura" ? 0 : charId === "kero" ? 1 : Number(/^char(\d+)/.exec(charId)[1]);
}

function recursiveElementFromPoint(ev, parent, target) {
    var clientX = ev.clientX;
    var clientY = ev.clientY;
    var pageX = ev.pageX;
    var pageY = ev.pageY;

    var _$$offset = $(target).offset();

    var left = _$$offset.left;
    var top = _$$offset.top;
    var offsetX = pageX - left;
    var offsetY = pageY - top;

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
        var tev = document.createEvent("TouchEvent");
        var touch = document.createTouch(document.defaultView, ev.target, 0, ev.pageX, ev.pageY, ev.screenX, ev.screenY);
        var touches = document.createTouchList(touch);
        if (ua.indexOf('chrome') != -1 || ua.indexOf('opera') != -1) {
            console.info("this browser is chrome or opera", ua);
            tev["initTouchEvent"](touches, touches, touches, ev.type, ev.originalEvent["view"], ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey);
        } else if (ua.indexOf('safari') != -1) {
            console.info("this browser is safari", ua);
            tev["initTouchEvent"](ev.type, true, ev.cancelable, ev.originalEvent["view"], ev.originalEvent["detail"], ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, touches, touches, touches, 0, 0);
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