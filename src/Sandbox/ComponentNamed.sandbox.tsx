import * as SU from "../Util/index";
import {Scope} from "../Model/Scope";
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
  const surfaceId = 0;
  return rndr.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
    const scope = new Scope(0, surfaceId, width, height, shell);
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
          <Named scopes={[scope]} shell={shell} emitter={emitter}></Named>
        </div>
      ), content);
    });
  });
}).catch(console.error.bind(console));

