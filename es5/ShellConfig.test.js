/// <reference path="../typings/index.d.ts"/>
"use strict";

var SC = require("./ShellConfig");
var SU = require("./SurfaceUtil");
var narloader = require("narloader");
var NL = narloader.NarLoader;
QUnit.module('ShellConfig');
NL.loadFromURL("/nar/mobilemaster.nar").then(function (dir) {
    var dic = dir.asArrayBuffer();
    var name = SU.fastfind(Object.keys(dic), "descript.txt");
    var descript = SU.parseDescript(SU.convert(dic[name]));
    QUnit.test('SC.loadFromJSONLike', function (assert) {
        var done = assert.async();
        return new SC.ShellConfig().loadFromJSONLike(descript).then(function (config) {
            assert.ok(config.seriko.use_self_alpha === false);
            assert.ok(config.seriko.alignmenttodesktop === "bottom");
            done();
        });
    });
});