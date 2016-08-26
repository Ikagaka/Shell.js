import * as SU from "../Util/index";
import * as ST from "../Model/SurfaceDefinitionTree";
import * as STL from "../Loader/SurfaceDefinitionTree";
import ST2Y = require("surfaces_txt2yaml");


window["SurfaceTree"] = ST;
window["SurfaceUtil"] = SU;
window["SurfacesTxt2Yaml"] = ST2Y;

QUnit.module('SurfaceTreeLoader');
SU.NarLoader.loadFromURL('../nar/mobilemaster.nar')
.then((nanikaDir) =>{
  const shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer()
  const filenames = SU.findSurfacesTxt(Object.keys(shellDir));
  const cat_text = filenames.reduce((text, filename)=> text + SU.convert(shellDir[filename]), "");
  const surfacesTxt = ST2Y.txt_to_data(cat_text, {compatible: 'ssp-lazy'});
  
  QUnit.test('SurfaceTreeLoader.loadFromsurfacesTxt2Yaml', (assert)=>{
    const done = assert.async();
    console.log(surfacesTxt);
    return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
    .then((surfaceTree)=>{
      var {aliases, surfaces, descript} = surfaceTree;
      assert.ok(Array.isArray(aliases));
      assert.ok(Array.isArray(surfaces));
      surfaces.forEach((srf)=>{
        const {elements, collisions, animations, balloons, points} = srf;
        assert.ok(Array.isArray(elements)   &&   elements.every((elm)=> elm instanceof ST.SurfaceElement ));
        assert.ok(Array.isArray(collisions) && collisions.every((col)=> col instanceof ST.SurfaceCollision ));
        assert.ok(Array.isArray(animations) && animations.every((anm)=> anm instanceof ST.SurfaceAnimation ));
        
      });
      assert.ok(surfaceTree.descript.collisionSort === "ascend");
      assert.ok(surfaceTree.descript.animationSort === "ascend");
      return done();
    });
  });
});



