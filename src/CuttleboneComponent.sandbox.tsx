import * as CC from "./CuttleboneComponent";
import * as SU from "./SurfaceUtil";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import narloader = require("narloader");
import $ = require("jquery");
const NL = narloader.NarLoader;


$(()=>{
  const content = $("<div />").attr("id", "content").appendTo("body")[0];
  ReactDOM.render(
    React.createElement(CC.LayerSet, {
      style:{width:"500px", height:"500px", border:"1px solid"},
      layers:[
        { style: { border:"1px solid" }, width: 100, height: 100, basisX: "left", basisY: "bottom", x: 100, y: 100, content: "hi"},
        { style: { border:"1px solid" }, width: 100, height: 100, basisX: "left", basisY: "bottom", x: 150, y: 100, content: "hei"}
      ]
    }),
    content
  );
});

