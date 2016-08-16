/// <reference path="../typings/index.d.ts"/>
"use strict";

var CCC = require("./CacheCanvas");
var narloader = require("narloader");
var NL = narloader.NarLoader;
QUnit.module('CCC');
NL.loadFromURL("/nar/mobilemaster.nar").then(function (dir) {
    var dic = dir.asArrayBuffer();
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