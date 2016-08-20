/// <reference path="../typings/index.d.ts"/>

import * as ST from "./SurfaceTree";
import * as STL from "./SurfaceTreeLoader";
import * as SU from "./SurfaceUtil";
import narloader = require("narloader");
import ST2Y = require("surfaces_txt2yaml");

const NL = window["NL"] = narloader.NarLoader;
window["SurfaceTree"] = ST;
window["SurfaceUtil"] = SU;
window["SurfacesTxt2Yaml"] = ST2Y;

QUnit.module('SurfaceTreeLoader');
NL.loadFromURL('../nar/mobilemaster.nar')
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
      console.log(surfaceTree);
      var {aliases, surfaces} = surfaceTree;
      assert.ok(surfaces.every((srf)=>{
        return srf.elements.every((b)=> true /* todo */ )
        && srf.collisions.every((b)=> true /* todo */ )
        && srf.animations.every((anim)=>
          anim.patterns.every((c)=>
            // todo
            true 
          )
        )
      }));
      assert.ok(surfaceTree.descript.collisionSort === "ascend");
      assert.ok(surfaceTree.descript.animationSort === "ascend");
      return done();
    });
  });
});



