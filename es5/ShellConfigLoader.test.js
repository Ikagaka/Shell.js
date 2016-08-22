"use strict";

var SC = require("./ShellConfig");
var SCL = require("./ShellConfigLoader");
var SU = require("./SurfaceUtil");
var narloader = require("narloader");
var NL = narloader.NarLoader;
QUnit.module('ShellConfigLoader');
NL.loadFromURL("/nar/mobilemaster.nar").then(function (dir) {
    var dic = dir.asArrayBuffer();
    var name = SU.fastfind(Object.keys(dic), "descript.txt");
    var descript = SU.parseDescript(SU.convert(dic[name]));
    QUnit.test('ShellConfigLoader.loadFromJSONLike', function (assert) {
        var done = assert.async();
        return SCL.loadFromJSONLike(descript).then(function (config) {
            assert.ok(config.seriko instanceof SC.SerikoConfig);
            assert.ok(config.seriko.use_self_alpha === false);
            assert.ok(config.seriko.alignmenttodesktop === "bottom");
            assert.ok(config.menu instanceof SC.MenuConfig);
            assert.ok(config.char instanceof Array);
            assert.ok(config.bindgroup instanceof Array);
            assert.ok(typeof config.enableRegion === "boolean");
            assert.ok(typeof config.position === "string");
            done();
        });
    });
});