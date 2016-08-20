/// <reference path="../typings/index.d.ts"/>
"use strict";
const SCL = require("./ShellConfigLoader");
const SU = require("./SurfaceUtil");
const narloader = require("narloader");
const NL = narloader.NarLoader;
QUnit.module('ShellConfig');
NL.loadFromURL("/nar/mobilemaster.nar").then((dir) => {
    const dic = dir.asArrayBuffer();
    const name = SU.fastfind(Object.keys(dic), "descript.txt");
    const descript = SU.parseDescript(SU.convert(dic[name]));
    QUnit.test('SC.loadFromJSONLike', (assert) => {
        const done = assert.async();
        return SCL.loadFromJSONLike(descript)
            .then((config) => {
            assert.ok(config.seriko.use_self_alpha === false);
            assert.ok(config.seriko.alignmenttodesktop === "bottom");
            done();
        });
    });
});
