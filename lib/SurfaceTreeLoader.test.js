/// <reference path="../typings/index.d.ts"/>
"use strict";
const ST = require("./SurfaceTree");
const STL = require("./SurfaceTreeLoader");
const SU = require("./SurfaceUtil");
const narloader = require("narloader");
const ST2Y = require("surfaces_txt2yaml");
const NL = window["NL"] = narloader.NarLoader;
window["SurfaceTree"] = ST;
window["SurfaceUtil"] = SU;
window["SurfacesTxt2Yaml"] = ST2Y;
QUnit.module('SurfaceTreeLoader');
NL.loadFromURL('../nar/mobilemaster.nar')
    .then((nanikaDir) => {
    const shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer();
    const filenames = SU.findSurfacesTxt(Object.keys(shellDir));
    const cat_text = filenames.reduce((text, filename) => text + SU.convert(shellDir[filename]), "");
    const surfacesTxt = ST2Y.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
    QUnit.test('SurfaceTreeLoader.loadFromsurfacesTxt2Yaml', (assert) => {
        const done = assert.async();
        console.log(surfacesTxt);
        return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
            .then((surfaceTree) => {
            console.log(surfaceTree);
            assert.ok(Object.keys(surfaceTree.aliases).every((a) => isFinite(Number(a))));
            assert.ok(Object.keys(surfaceTree.surfaces).every((a) => isFinite(Number(a))
                && Object.keys(surfaceTree.surfaces[a].elements).every((b) => isFinite(Number(b)))
                && Object.keys(surfaceTree.surfaces[a].collisions).every((b) => isFinite(Number(b)))
                && Object.keys(surfaceTree.surfaces[a].animations).every((b) => isFinite(Number(b))
                    && Object.keys(surfaceTree.surfaces[a].animations[b].patterns).every((c) => isFinite(Number(c))))));
            assert.ok(surfaceTree.descript.collisionSort === "ascend");
            assert.ok(surfaceTree.descript.animationSort === "ascend");
            return done();
        });
    });
});