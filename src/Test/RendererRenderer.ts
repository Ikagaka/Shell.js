import {Canvas} from "../Model/Canvas";
import * as ST from "../Model/SurfaceDefinitionTree";
import * as STL from "../Loader/SurfaceDefinitionTree";
import * as SU from "../Util/index";
import * as SR from "../Renderer/Renderer";
import ST2Y = require("surfaces_txt2yaml");
import $ = require("jquery");

SR.Renderer.prototype.debug = true;


QUnit.module('Shell.SR.SurfaceRenderer');


QUnit.test('SR.SurfaceRenderer#clear', function(assert) {
  const done = assert.async();
  return Promise.all([SU.fetchImageFromURL("/nar/img/surface0730.png")])
  .then((cnvs)=> cnvs.map((cnv)=> new Canvas(SU.copy(cnv))) )
  .then((srfcnvs)=>{
    const render = new SR.Renderer();
    assert.ok(render.srfCnv instanceof Canvas);
    srfcnvs.forEach((srfcnv)=>{
      render.init(srfcnv);
      assert.ok(srfcnv.cnv.width === render.srfCnv.cnv.width);
      assert.ok(srfcnv.cnv.height === render.srfCnv.cnv.height);
      SU.setPictureFrame(srfcnv.cnv, "init");
    });
  });
});