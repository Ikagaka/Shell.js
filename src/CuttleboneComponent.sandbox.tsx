import * as SU from "./SurfaceUtil";
import * as SML from "./ShellModelLoader";
import * as SPR from "./SurfacePatternRenderer";
import * as CC from "./CuttleboneComponent";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import narloader = require("narloader");
import $ = require("jquery");
const NL = narloader.NarLoader;

NL.loadFromURL("../nar/mobilemaster.nar")
.then((dir)=> dir.getDirectory("shell/master").asArrayBuffer() )
.then((dic)=> SML.load(dic) )
.then((shell)=>{
  var rndr = new SPR.SurfacePatternRenderer(shell);
  // return rndr.preload().then(function(){
  // });
  $(()=>{
    const content = $("<div />").attr("id", "content").appendTo("body")[0];
    ReactDOM.render((
      <CC.Named shell={shell} renderer={rndr}></CC.Named>
    ), content);
  });
}).catch(console.error.bind(console));

