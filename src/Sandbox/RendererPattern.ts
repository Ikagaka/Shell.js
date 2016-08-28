import * as Util from "../Util/index";
import * as SML from "../Loader/Shell";
import * as ST from "../Model/SurfaceDefinitionTree";
import * as SH from "../Model/Shell";
import * as SM from "../Model/Surface";
import {Canvas, copy} from "../Model/Canvas";
import * as SHS from "../State/Shell";
import * as SS from "../State/Surface";
import * as SR from "../Renderer/Renderer";
import * as SPR from "../Renderer/Pattern";
import * as SBR from "../Renderer/BaseSurface";

import $ = require("jquery");

$(()=>{ Util.setCanvasStyle(); });

Util.NarLoader.loadFromURL("/nar/mobilemaster.nar")
.then((dir)=>{ return dir.getDirectory("shell/master").asArrayBuffer(); })
.then((dic)=>{ return SML.load(dic); })
.then((shell)=>{
  console.log(shell);
  // 当たり判定表示
  shell.config.enableRegion = true;
  // bind の変更とかできる子
  const shellState = new SHS.ShellState(shell, console.info.bind(console, "shell state update:"));
  // ベースサーフェス生成器
  const baseCache = new SBR.SurfaceBaseRenderer(shell);
  // プリロードすると安心だけど重い
  //return baseCache.preload().then(()=>{
    const scopeId = 0;
    const surfaceId = 0;
    // まずベースサーフェスサイズを取得
    baseCache.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      const realCanvas = Util.createCanvas(width, height);
      document.body.appendChild(realCanvas);
      // レンダラに実 DOM canvas を attach
      const rndr = new SPR.SurfacePatternRenderer(baseCache, new Canvas(realCanvas));
      rndr.debug = true;
      // surface model を生成
      const surface = new SM.Surface(scopeId, surfaceId, width, height);

      const srfState = new SS.SurfaceState(surface, shell, (surface)=> rndr.render(surface) );
      srfState.debug = true;
      
      console.log(srfState);

      // 初回描画
      return srfState.render();
    });
  //});
}).catch(console.error.bind(console));