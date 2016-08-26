import * as SU from "../Util/index";
import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import {copy} from "../Model/Canvas";
import {getAlignmenttodesktop} from "../Model/Config";
import {ScopeState} from "../State/Scope";
import * as SML from "../Loader/Shell";
import * as SPR from "../Renderer/Pattern";
import {Named} from "../Component/Named";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {EventEmitter} from "events";
import $ = require("jquery");


SU.NarLoader.loadFromURL("../nar/mobilemaster.nar")
.then((dir)=> dir.getDirectory("shell/master").asArrayBuffer() )
.then((dic)=> SML.load(dic) )
.then((shell)=>{
  const rndr = new SPR.SurfacePatternRenderer(shell);
  //rndr.debug = true;
  // return rndr.preload().then(function(){
  // });
  const emitter = new EventEmitter();
  emitter.on("onNamedMouseDown", console.info.bind(console));
  emitter.on("onSurfaceMouseDown", console.info.bind(console));
  const scopeId = 0;
  const surfaceId = 0;
  return rndr.getBaseSurface(surfaceId).then((srfCnv)=>{
    const scope = new MS.Scope(scopeId, surfaceId, copy(srfCnv), getAlignmenttodesktop(shell.config, scopeId));
    const named = new MN.Named(shell);
    const scopeState = new ScopeState(scope, shell, (surface)=> rndr.render(surface) );
    named.scopes.push(scope);
    $(()=>{
      const content = $("<div />").attr("id", "content").appendTo("body")[0];
      const cuttleboneStyle = {
        display: "block", position: "fixed",
        boxSizing: "border-box",
        bottom: "0px", right: "0px",
        height:"100%", width: "100%"
      };
      
      ReactDOM.render((
        <div className="cuttlebone" style={cuttleboneStyle}>
          <Named named={named} emitter={emitter}></Named>
        </div>
      ), content);
    });
  });
}).catch(console.error.bind(console));

