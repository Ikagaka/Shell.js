"use strict";
const SU = require("./SurfaceUtil");
const SR = require("./SurfaceRenderer");
SR.SurfaceRenderer.prototype.debug = true;
QUnit.module('Shell.SR.SurfaceRenderer');
QUnit.test('SR.SurfaceRenderer#clear', function (assert) {
    const done = assert.async();
    return Promise.all([SU.fetchImageFromURL("src/surface0730.png")])
        .then((cnvs) => cnvs.map((cnv) => new SR.SurfaceCanvas(SU.copy(cnv))))
        .then((srfcnvs) => {
        const render = new SR.SurfaceRenderer();
        assert.ok(render instanceof SR.SurfaceCanvas);
        srfcnvs.forEach((srfcnv) => {
            assert.ok(render instanceof SR.SurfaceCanvas);
            render.init(srfcnv);
            Object.keys(srfcnv).forEach((key) => {
                assert.ok(srfcnv[key] === render[key]);
            });
            SU.setPictureFrame(srfcnv.cnv, "init");
        });
    });
});
