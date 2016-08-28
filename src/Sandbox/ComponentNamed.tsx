import * as SU from "../Util/index";

import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import {Canvas, copy} from "../Model/Canvas";
import {getAlignmenttodesktop} from "../Model/Config";

import * as SML from "../Loader/Shell";

import {ScopeState} from "../State/Scope";
import {NamedState} from "../State/Named";

import {Named} from "../Component/Named";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {EventEmitter} from "events";
import $ = require("jquery");


//SU.NarLoader.loadFromURL("../nar/mobilemaster.nar")
SU.NarLoader.loadFromURL("../nar/ku-ver06.1.nar")
.then((dir)=> dir.getDirectory("shell/master").asArrayBuffer() )
.then((dic)=> SML.load(dic) )
.then((shell)=>{
  const named = new MN.Named(shell);
  const namedState = new NamedState(named);
  Promise.all([
    namedState.addScope(0, 0),
    namedState.addScope(0, 2010)
  ]).then(()=>{
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
          <Named namedState={namedState}></Named>
        </div>
      ), content);
    });
  });
}).catch(console.error.bind(console));

