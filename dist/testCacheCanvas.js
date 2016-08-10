(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("../typings/index.d.ts");
/*
CacheCanvas型はサーフェスのロード状況を管理します。


*/

var Done = function Done() {
    _classCallCheck(this, Done);
};

exports.Done = Done;

var Yet = function Yet() {
    _classCallCheck(this, Yet);
};

exports.Yet = Yet;

var Cache = function Cache() {
    _classCallCheck(this, Cache);

    this.cnv = document.createElement("canvas");
};

exports.Cache = Cache;

var PNGWithoutPNA = function (_Cache) {
    _inherits(PNGWithoutPNA, _Cache);

    function PNGWithoutPNA(png) {
        _classCallCheck(this, PNGWithoutPNA);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PNGWithoutPNA).call(this));

        _this.png = png;
        return _this;
    }

    return PNGWithoutPNA;
}(Cache);

exports.PNGWithoutPNA = PNGWithoutPNA;

var PNGWithPNA = function (_PNGWithoutPNA) {
    _inherits(PNGWithPNA, _PNGWithoutPNA);

    function PNGWithPNA(png, pna) {
        _classCallCheck(this, PNGWithPNA);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(PNGWithPNA).call(this, png));

        _this2.pna = pna;
        return _this2;
    }

    return PNGWithPNA;
}(PNGWithoutPNA);

exports.PNGWithPNA = PNGWithPNA;
function applyChromakey(cc) {
    return new Promise(function (resolve, reject) {
        resolve(cc);
        //reject("not impl yet");
    });
}
exports.applyChromakey = applyChromakey;
function getPNGImage(pngBuffer) {
    return getImageFromArrayBuffer(pngBuffer).then(function (png) {
        return new PNGWithoutPNA(png);
    });
}
exports.getPNGImage = getPNGImage;
function getPNGAndPNAImage(pngBuffer, pnaBuffer) {
    return Promise.all([getImageFromArrayBuffer(pngBuffer), getImageFromArrayBuffer(pnaBuffer)]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var png = _ref2[0];
        var pna = _ref2[1];
        return new PNGWithPNA(png, pna);
    });
}
exports.getPNGAndPNAImage = getPNGAndPNAImage;
function getImageFromArrayBuffer(buffer) {
    var url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
    return getImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return img;
    });
}
exports.getImageFromArrayBuffer = getImageFromArrayBuffer;
function getImageFromURL(url) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.src = url;
        img.addEventListener("load", function () {
            return resolve(img);
        });
        img.addEventListener("error", reject);
    });
}
exports.getImageFromURL = getImageFromURL;
function getArrayBufferFromURL(url) {
    console.warn("getArrayBuffer for debbug");
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
exports.getArrayBufferFromURL = getArrayBufferFromURL;
},{"../typings/index.d.ts":3}],2:[function(require,module,exports){
'use strict';
var CCC = require('./CacheCanvas');
QUnit.module('CCC');
QUnit.test('CCC.getArrayBufferFromURL', function (assert) {
    var done = assert.async();
    return Promise.all([
        CCC.getArrayBufferFromURL('/nar/mobilemaster.nar').then(function (buf) {
            assert.ok(assert._expr(assert._capt(assert._capt(buf, 'arguments/0/left') instanceof assert._capt(ArrayBuffer, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(buf instanceof ArrayBuffer)',
                filepath: 'lib/testCacheCanvas.js',
                line: 9
            }));
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(buf, 'arguments/0/left/object').byteLength, 'arguments/0/left') > 0, 'arguments/0'), {
                content: 'assert.ok(buf.byteLength > 0)',
                filepath: 'lib/testCacheCanvas.js',
                line: 10
            }));
        }),
        CCC.getArrayBufferFromURL('/nar/mobilemaster.zip').catch(function (err) {
            assert.ok(assert._expr(assert._capt(assert._capt(err, 'arguments/0/left') instanceof assert._capt(Error, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(err instanceof Error)',
                filepath: 'lib/testCacheCanvas.js',
                line: 12
            }));
        })
    ]).then(function () {
        return done();
    });
});
unzip('/nar/mobilemaster.nar').then(function (dic) {
    QUnit.test('CCC.getImageFromArrayBuffer', function (assert) {
        var done = assert.async();
        var buf = dic['shell/master/surface0.png'];
        assert.ok(assert._expr(assert._capt(assert._capt(buf, 'arguments/0/left') instanceof assert._capt(ArrayBuffer, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(buf instanceof ArrayBuffer)',
            filepath: 'lib/testCacheCanvas.js',
            line: 21
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(buf, 'arguments/0/left/object').byteLength, 'arguments/0/left') > 0, 'arguments/0'), {
            content: 'assert.ok(buf.byteLength > 0)',
            filepath: 'lib/testCacheCanvas.js',
            line: 22
        }));
        return CCC.getImageFromArrayBuffer(buf).then(function (img) {
            assert.ok(assert._expr(assert._capt(assert._capt(img, 'arguments/0/left') instanceof assert._capt(Image, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(img instanceof Image)',
                filepath: 'lib/testCacheCanvas.js',
                line: 24
            }));
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').width, 'arguments/0/left') > 0, 'arguments/0'), {
                content: 'assert.ok(img.width > 0)',
                filepath: 'lib/testCacheCanvas.js',
                line: 25
            }));
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').height, 'arguments/0/left') > 0, 'arguments/0'), {
                content: 'assert.ok(img.height > 0)',
                filepath: 'lib/testCacheCanvas.js',
                line: 26
            }));
            done();
        });
    });
    QUnit.test('CCC.getPNGAndPNAImage', function (assert) {
        var done = assert.async();
        var pngBuf = dic['shell/master/surface0731.png'];
        var pnaBuf = dic['shell/master/surface0731.pna'];
        return CCC.getPNGAndPNAImage(pngBuf, pnaBuf).then(function (cache) {
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cache, 'arguments/0/left/object').png, 'arguments/0/left') instanceof assert._capt(Image, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(cache.png instanceof Image)',
                filepath: 'lib/testCacheCanvas.js',
                line: 35
            }));
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cache, 'arguments/0/left/object').pna, 'arguments/0/left') instanceof assert._capt(Image, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(cache.pna instanceof Image)',
                filepath: 'lib/testCacheCanvas.js',
                line: 36
            }));
            done();
        });
    });
    QUnit.test('CCC.getPNGImage', function (assert) {
        var done = assert.async();
        var pngBuf = dic['shell/master/surface0731.png'];
        return CCC.getPNGImage(pngBuf).then(function (cache) {
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cache, 'arguments/0/left/object').png, 'arguments/0/left') instanceof assert._capt(Image, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(cache.png instanceof Image)',
                filepath: 'lib/testCacheCanvas.js',
                line: 44
            }));
            done();
        });
    });
    QUnit.test('CCC.applyChromakey', function (assert) {
        var done = assert.async();
        var pngBuf = dic['shell/master/surface0731.png'];
        var pnaBuf = dic['shell/master/surface0731.pna'];
        return Promise.all([
            CCC.getPNGImage(pngBuf),
            CCC.getPNGAndPNAImage(pngBuf, pnaBuf)
        ]).then(function (caches) {
            return Promise.all(caches.map(function (cache) {
                return CCC.applyChromakey(cache);
            }));
        }).then(function (loadeds) {
            loadeds.forEach(function (loaded) {
                assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(loaded, 'arguments/0/left/object').cnv, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
                    content: 'assert.ok(loaded.cnv instanceof HTMLCanvasElement)',
                    filepath: 'lib/testCacheCanvas.js',
                    line: 58
                }));
                assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(loaded, 'arguments/0/left/object').png, 'arguments/0/left') instanceof assert._capt(Image, 'arguments/0/right'), 'arguments/0'), {
                    content: 'assert.ok(loaded.png instanceof Image)',
                    filepath: 'lib/testCacheCanvas.js',
                    line: 59
                }));
            });
            done();
        });
    });
});
function unzip(url) {
    var jszip = new JSZip();
    return CCC.getArrayBufferFromURL(url).then(function (buf) {
        return jszip.loadAsync(buf);
    }).then(function (zip) {
        var pairs = Object.keys(zip.files).map(function (filename) {
            return {
                filename: filename,
                zipped: zip.file(filename)
            };
        });
        var proms = pairs.map(function (_ref) {
            var filename = _ref.filename;
            var zipped = _ref.zipped;
            return zipped.async('arraybuffer').then(function (unzipped) {
                return {
                    filename: filename,
                    unzipped: unzipped
                };
            });
        });
        return Promise.all(proms);
    }).then(function (pairs) {
        console.warn(pairs);
        var dic = pairs.reduce(function (o, _ref2) {
            var filename = _ref2.filename;
            var unzipped = _ref2.unzipped;
            o[filename] = unzipped;
            return o;
        }, {});
        console.info(dic);
        return dic;
    });
}
},{"./CacheCanvas":1}],3:[function(require,module,exports){
/// <reference path="globals/bluebird/index.d.ts" />
/// <reference path="globals/empower/index.d.ts" />
/// <reference path="globals/encoding-japanese/encoding.d.ts/index.d.ts" />
/// <reference path="globals/jquery/index.d.ts" />
/// <reference path="globals/jszip/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/power-assert-formatter/index.d.ts" />
/// <reference path="globals/power-assert/index.d.ts" />
/// <reference path="globals/qunit/index.d.ts" />
/// <reference path="globals/surfaces_yaml/surfaces_txt2yaml.d.ts/index.d.ts" />

},{}]},{},[2])