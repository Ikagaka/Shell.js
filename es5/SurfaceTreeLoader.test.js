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
            console.log(surfaceTree);
            var aliases = surfaceTree.aliases;
            var surfaces = surfaceTree.surfaces;

            assert.ok(surfaces.every(function (srf) {
                return srf.elements.every(function (b) {
                    return true;
                } /* todo */) && srf.collisions.every(function (b) {
                    return true;
                } /* todo */) && srf.animations.every(function (anim) {
                    return anim.patterns.every(function (c) {
                        return (
                            // todo
                            true
                        );
                    });
                });
            }));
            assert.ok(surfaceTree.descript.collisionSort === "ascend");
            assert.ok(surfaceTree.descript.animationSort === "ascend");
            return done();
        });
    });
});