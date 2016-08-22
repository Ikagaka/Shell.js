"use strict";

var SBR = require("./SurfaceBaseRenderer");
var ST = require("./SurfaceTree");
var SR = require("./SurfaceRenderer");
var SML = require("./ShellModelLoader");
var narloader = require("narloader");
var NL = narloader.NarLoader;
QUnit.module('ShellConfigLoader');
NL.loadFromURL("/nar/mobilemaster.nar").then(function (dir) {
    var dic = dir.getDirectory("shell/master").asArrayBuffer();
    return SML.load(dic);
}).then(function (shell) {
    var rndr = new SBR.SurfaceBaseRenderer(shell);
    QUnit.test('ShellConfigLoader.loadFromJSONLike', function (assert) {
        var done = assert.async();
        var surfaces = shell.surfaceDefTree.surfaces;
        assert.ok(surfaces instanceof Array);
        assert.ok(surfaces[0] instanceof ST.SurfaceDefinition);
        assert.ok(surfaces[0] != null && surfaces[0].elements.length > 0);
        return rndr.getBaseSurface(0).then(function (srfcnv) {
            assert.ok(srfcnv instanceof SR.SurfaceCanvas);
            assert.ok(!(srfcnv instanceof SR.SurfaceRenderer));
            assert.ok(!(srfcnv instanceof SBR.SurfaceBaseRenderer));
            assert.ok(srfcnv.cnv.width > 0);
            assert.ok(srfcnv.cnv.height > 0);
            return rndr.getBaseSurface(0).then(function (srfcnv2) {
                assert.ok(srfcnv === srfcnv2);
            });
        }).catch(console.error.bind(console)).then(done);
    });
});