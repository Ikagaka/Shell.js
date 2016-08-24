import * as SPR from "./SurfacePatternRenderer";
import * as ST from "./SurfaceTree";
import * as SU from "./SurfaceUtil";
import * as SH from "./ShellModel";
import * as SM from "./SurfaceModel";
import * as SHS from "./ShellState";
import * as SS from "./SurfaceState";
import * as SML from "./ShellModelLoader";
import * as SR from "./SurfaceRenderer";
import * as CC from "./CuttleboneComponent";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import narloader = require("narloader");
import $ = require("jquery");
const NL = narloader.NarLoader;

NL.loadFromURL("../nar/mobilemaster.nar")
.then(function(dir){ return dir.getDirectory("shell/master").asArrayBuffer(); })
.then(function(dic){ return SML.load(dic); })
.then(function(shell){
  console.log(shell);
  // 当たり判定表示
  shell.config.enableRegion = true;
  var rndr = new SPR.SurfacePatternRenderer(shell);
  // 
  rndr.debug = true;
  // プリロードすると安心だけど重い
  return rndr.preload().then(function(){
    var surfaceId = 7;
    // まずベースサーフェスサイズを取得
    rndr.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      var surface = new SM.Surface(0, surfaceId, width, height, shell);
      var shellState = new SHS.ShellState(shell, console.info.bind(console, "shell state update:"));
      var srfState = new SS.SurfaceState(surface, function render(ev, surface){
        return rndr.render(surface).then(function(srfcnv){ return rndr2.base(srfcnv); });
      });
      console.log(srfState);
      srfState.debug = true;

      SU.setCanvasStyle();
      var rndr2 = new SR.SurfaceRenderer();
      document.body.appendChild(rndr2.cnv);

      // 初回描画
      return srfState.render().then(function(){
        rndr2.base(rndr);
      });
    });
  });
}).catch(console.error.bind(console));