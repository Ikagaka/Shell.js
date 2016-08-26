import * as Util from "../Util/index";
import * as ST from "../Model/SurfaceDefinitionTree";
import {Canvas} from "../Model/Canvas";
import * as SML from "../Loader/Shell";
import * as SBR from "../Renderer/BaseSurface";
import * as SR from "../Renderer/Renderer";


QUnit.module('ShellConfigLoader');


Util.NarLoader.loadFromURL("/nar/mobilemaster.nar").then((dir)=>{
  const dic = dir.getDirectory("shell/master").asArrayBuffer();
  return SML.load(dic);
}).then((shell)=>{
  const rndr = new SBR.SurfaceBaseRenderer(shell);

  QUnit.test('ShellConfigLoader.loadFromJSONLike', (assert)=>{
    const done = assert.async();
    const surfaces = shell.surfaceDefTree.surfaces;
    assert.ok(surfaces instanceof Array);
    assert.ok(surfaces[0] instanceof ST.SurfaceDefinition);
    assert.ok(surfaces[0] != null && surfaces[0].elements.length > 0);
    return rndr.getBaseSurface(0)
    .then((srfcnv)=>{
      assert.ok(srfcnv instanceof Canvas);
      assert.ok(!(srfcnv instanceof SR.Renderer));
      assert.ok(!(srfcnv instanceof SBR.SurfaceBaseRenderer));
      assert.ok(srfcnv.cnv.width > 0);
      assert.ok(srfcnv.cnv.height > 0);
      return rndr.getBaseSurface(0)
      .then((srfcnv2)=>{
        assert.ok(srfcnv === srfcnv2);
      });
    }).catch(console.error.bind(console)).then(done);
  });

});



