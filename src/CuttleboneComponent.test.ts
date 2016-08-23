import * as CC from "./CuttleboneComponent";
import * as SU from "./SurfaceUtil";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import narloader = require("narloader");
import $ = require("jquery");
const NL = narloader.NarLoader;


$(()=>{
  $("body").attr("id", "content");
  ReactDOM.render(
    React.createElement(CC.Cuttlebone, {style:{width:"500px", height:"500px", border:"1px solid"}}),
    <HTMLElement>document.getElementById("content")
  );
});