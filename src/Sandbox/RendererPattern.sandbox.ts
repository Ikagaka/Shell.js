import * as Util from "../Util/index";
import * as SPR from "../Renderer/Pattern";
import * as ST from "../Model/SurfaceDefinitionTree";
import * as SH from "../Model/Shell";
import * as SM from "../Model/Surface";
import * as SHS from "../State/Shell";
import * as SS from "../State/Surface";
import * as SML from "../Loader/Shell";
import * as SR from "../Renderer/Renderer";

import $ = require("jquery");

Util.NarLoader.loadFromURL("../nar/mobilemaster.nar")
.then((dir)=>{ return dir.getDirectory("shell/master").asArrayBuffer(); })
.then((dic)=>{ return SML.load(dic); })
.then((shell)=>{
  console.log(shell);
  // 当たり判定表示
  shell.config.enableRegion = true;
  const rndr = new SPR.SurfacePatternRenderer(shell);
  // 
  rndr.debug = true;
  // プリロードすると安心だけど重い
  return rndr.preload().then(()=>{
    const scopeId = 0;
    const surfaceId = 10;
    // まずベースサーフェスサイズを取得
    rndr.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      const surface = new SM.Surface(scopeId, surfaceId);
      const shellState = new SHS.ShellState(shell, console.info.bind(console, "shell state update:"));

      Util.setCanvasStyle();
      const rndr2 = new SR.Renderer();
      document.body.appendChild(rndr2.cnv);

      const srfState = new SS.SurfaceState(surface, shell, (ev, surface)=>{
        return rndr.render(surface).then((srfcnv)=>{ rndr2.base(srfcnv); return srfcnv;});
      });
      console.log(srfState);
      srfState.debug = true;

      // 初回描画
      return srfState.render();
    });
  });
}).catch(console.error.bind(console));