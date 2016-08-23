"use strict";
var SU = require("./SurfaceUtil");
var SR = require("./SurfaceRenderer");
SR.SurfaceRenderer.prototype.debug = true;
QUnit.module('Shell.SR.SurfaceRenderer');
QUnit.test('SR.SurfaceRenderer#clear', function (assert) {
    var done = assert.async();
    return Promise.all([SU.fetchImageFromURL("src/surface0730.png")])
        .then(function (cnvs) { return cnvs.map(function (cnv) { return new SR.SurfaceCanvas(SU.copy(cnv)); }); })
        .then(function (srfcnvs) {
        var render = new SR.SurfaceRenderer();
        assert.ok(render instanceof SR.SurfaceCanvas);
        srfcnvs.forEach(function (srfcnv) {
            assert.ok(render instanceof SR.SurfaceCanvas);
            render.init(srfcnv);
            Object.keys(srfcnv).forEach(function (key) {
                assert.ok(srfcnv[key] === render[key]);
            });
            SU.setPictureFrame(srfcnv.cnv, "init");
        });
    });
});
