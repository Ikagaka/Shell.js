(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var _slicedToArray = function () {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i)
                    break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i['return'])
                    _i['return']();
            } finally {
                if (_d)
                    throw _e;
            }
        }
        return _arr;
    }
    return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError('Invalid attempt to destructure non-iterable instance');
        }
    };
}();
require('../typings/index.d.ts');
function applyChromakey() {
    return new Promise(function (resolve, reject) {
    });
}
exports.applyChromakey = applyChromakey;
function getPNGImage(pngBuffer) {
    return getImageFromArrayBuffer(pngBuffer).then(function (png) {
        return { png: png };
    });
}
exports.getPNGImage = getPNGImage;
function getPNGAndPNAImage(pngBuffer, pnaBuffer) {
    return Promise.all([
        getImageFromArrayBuffer(pngBuffer),
        getImageFromArrayBuffer(pnaBuffer)
    ]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);
        var png = _ref2[0];
        var pna = _ref2[1];
        return {
            png: png,
            pna: pna
        };
    });
}
exports.getPNGAndPNAImage = getPNGAndPNAImage;
function getImageFromArrayBuffer(buffer) {
    var url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
    return getImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return img;
    });
}
exports.getImageFromArrayBuffer = getImageFromArrayBuffer;
function getImageFromURL(url) {
    var img = new Image();
    img.src = url;
    return new Promise(function (resolve, reject) {
        img.addEventListener('load', function () {
            return resolve(img);
        });
        img.addEventListener('error', reject);
    });
}
exports.getImageFromURL = getImageFromURL;
function getArrayBuffer(url) {
    console.warn('getArrayBuffer for debbug');
    var xhr = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        xhr.addEventListener('load', function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    resolve(xhr.response);
                } else {
                    reject(new Error('message: ' + xhr.response.error.message));
                }
            } else {
                reject(new Error('status: ' + xhr.status));
            }
        });
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.send();
    });
}
exports.getArrayBuffer = getArrayBuffer;
},{"../typings/index.d.ts":2}],2:[function(require,module,exports){
/// <reference path="globals/bluebird/index.d.ts" />
/// <reference path="globals/empower/index.d.ts" />
/// <reference path="globals/encoding-japanese/encoding.d.ts/index.d.ts" />
/// <reference path="globals/jquery/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/power-assert-formatter/index.d.ts" />
/// <reference path="globals/power-assert/index.d.ts" />
/// <reference path="globals/qunit/index.d.ts" />
/// <reference path="globals/surfaces_yaml/surfaces_txt2yaml.d.ts/index.d.ts" />

},{}]},{},[1])