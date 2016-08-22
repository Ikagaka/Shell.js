/// <reference path="../typings/index.d.ts"/>
"use strict";

var ST = require("./SurfaceTree");
var STL = require("./SurfaceTreeLoader");
var SU = require("./SurfaceUtil");
var narloader = require("narloader");
var ST2Y = require("surfaces_txt2yaml");
var NL = window["NL"] = narloader.NarLoader;
window["SurfaceTree"] = ST;
window["SurfaceUtil"] = SU;
window["SurfacesTxt2Yaml"] = ST2Y;
QUnit.module('SurfaceTreeLoader');
NL.loadFromURL('../nar/mobilemaster.nar').then(function (nanikaDir) {
    var shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer();
    var filenames = SU.findSurfacesTxt(Object.keys(shellDir));
    var cat_text = filenames.reduce(function (text, filename) {
        return text + SU.convert(shellDir[filename]);
    }, "");
    var surfacesTxt = ST2Y.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
    QUnit.test('SurfaceTreeLoader.loadFromsurfacesTxt2Yaml', function (assert) {
        var done = assert.async();
        console.log(surfacesTxt);
        return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt).then(function (surfaceTree) {
            var aliases = surfaceTree.aliases;
            var surfaces = surfaceTree.surfaces;
            var descript = surfaceTree.descript;

            assert.ok(Array.isArray(aliases));
            assert.ok(Array.isArray(surfaces));
            surfaces.forEach(function (srf) {
                var elements = srf.elements;
                var collisions = srf.collisions;
                var animations = srf.animations;
                var balloons = srf.balloons;
                var points = srf.points;

                assert.ok(Array.isArray(elements) && elements.every(function (elm) {
                    return elm instanceof ST.SurfaceElement;
                }));
                assert.ok(Array.isArray(collisions) && collisions.every(function (col) {
                    return col instanceof ST.SurfaceCollision;
                }));
                assert.ok(Array.isArray(animations) && animations.every(function (anm) {
                    return anm instanceof ST.SurfaceAnimation;
                }));
            });
            assert.ok(surfaceTree.descript.collisionSort === "ascend");
            assert.ok(surfaceTree.descript.animationSort === "ascend");
            return done();
        });
    });
});