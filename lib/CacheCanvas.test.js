/// <reference path="../typings/index.d.ts"/>
"use strict";
const CCC = require("./CacheCanvas");
const narloader = require("narloader");
const NL = narloader.NarLoader;
QUnit.module('CCC');
NL.loadFromURL("/nar/mobilemaster.nar").then((dir) => {
    const dic = dir.asArrayBuffer();
    QUnit.test('CCC.getPNGAndPNAImage', (assert) => {
        const done = assert.async();
        const pngBuf = dic["shell/master/surface0731.png"];
        const pnaBuf = dic["shell/master/surface0731.pna"];
        return CCC.getPNGAndPNAImage(pngBuf, pnaBuf)
            .then((cache) => {
            assert.ok(cache.png instanceof Image);
            assert.ok(cache.pna instanceof Image);
            done();
        });
    });
    QUnit.test('CCC.getPNGImage', (assert) => {
        const done = assert.async();
        const pngBuf = dic["shell/master/surface0731.png"];
        return CCC.getPNGImage(pngBuf)
            .then((cache) => {
            assert.ok(cache.png instanceof Image);
            done();
        });
    });
    QUnit.test('CCC.applyChromakey', (assert) => {
        const done = assert.async();
        const pngBuf = dic["shell/master/surface0731.png"];
        const pnaBuf = dic["shell/master/surface0731.pna"];
        return Promise.all([
            CCC.getPNGImage(pngBuf),
            CCC.getPNGAndPNAImage(pngBuf, pnaBuf)
        ]).then((caches) => Promise.all(caches.map((cache) => CCC.applyChromakey(cache)))).then((loadeds) => {
            loadeds.forEach((loaded) => {
                assert.ok(loaded.cnv instanceof HTMLCanvasElement);
                assert.ok(loaded.png instanceof Image);
            });
            done();
        });
    });
});
