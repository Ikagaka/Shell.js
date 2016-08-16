/// <reference path="../typings/index.d.ts"/>
"use strict";

var CCC = require("./CacheCanvas");
var SU = require("./SurfaceUtil");
var JSZip = require("jszip");
QUnit.module('CCC');
unzip("/nar/mobilemaster.nar").then(function (dic) {
    QUnit.test('CCC.getPNGAndPNAImage', function (assert) {
        var done = assert.async();
        var pngBuf = dic["shell/master/surface0731.png"];
        var pnaBuf = dic["shell/master/surface0731.pna"];
        return CCC.getPNGAndPNAImage(pngBuf, pnaBuf).then(function (cache) {
            assert.ok(cache.png instanceof Image);
            assert.ok(cache.pna instanceof Image);
            done();
        });
    });
    QUnit.test('CCC.getPNGImage', function (assert) {
        var done = assert.async();
        var pngBuf = dic["shell/master/surface0731.png"];
        return CCC.getPNGImage(pngBuf).then(function (cache) {
            assert.ok(cache.png instanceof Image);
            done();
        });
    });
    QUnit.test('CCC.applyChromakey', function (assert) {
        var done = assert.async();
        var pngBuf = dic["shell/master/surface0731.png"];
        var pnaBuf = dic["shell/master/surface0731.pna"];
        return Promise.all([CCC.getPNGImage(pngBuf), CCC.getPNGAndPNAImage(pngBuf, pnaBuf)]).then(function (caches) {
            return Promise.all(caches.map(function (cache) {
                return CCC.applyChromakey(cache);
            }));
        }).then(function (loadeds) {
            loadeds.forEach(function (loaded) {
                assert.ok(loaded.cnv instanceof HTMLCanvasElement);
                assert.ok(loaded.png instanceof Image);
            });
            done();
        });
    });
});
function unzip(url) {
    var jszip = new JSZip();
    return SU.getArrayBufferFromURL(url).then(function (buf) {
        return jszip.loadAsync(buf);
    }).then(function (zip) {
        var pairs = Object.keys(zip.files).map(function (filename) {
            return { filename: filename, zipped: zip.file(filename) };
        });
        var proms = pairs.map(function (_ref) {
            var filename = _ref.filename;
            var zipped = _ref.zipped;
            return zipped.async("arraybuffer").then(function (unzipped) {
                return { filename: filename, unzipped: unzipped };
            });
        });
        return Promise.all(proms);
    }).then(function (pairs) {
        console.warn(pairs);
        var dic = pairs.reduce(function (o, _ref2) {
            var filename = _ref2.filename;
            var unzipped = _ref2.unzipped;
            o[filename] = unzipped;return o;
        }, {});
        console.info(dic);
        return dic;
    });
}