import * as Util from "../Util/index";

import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import * as MC from "../Model/Cuttlebone";
import {Shell} from "../Model/Shell";

import {Layer, LayerSet, LayerProps} from "./Layer";
import {Scope} from "./Scope";
import {Named} from "./Named";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";


export type CuttleboneProps = MC.Cuttlebone & {emitter: EventEmitter} & React.Props<Cuttlebone>;
export interface CuttleboneState {}
export class Cuttlebone extends React.Component<CuttleboneProps, CuttleboneState> {
  constructor(props: CuttleboneProps) {
    super(props);
  }
  render(){
    const cuttleboneStyle = {
      display: "block", position: "fixed",
      boxSizing: "border-box",
      bottom: "0px", right: "0px",
      height:"100%", width: "100%"
    };
    const emitter = this.props.emitter;
    const namedElms = this.props.namedies.map(({shell, scopes})=>{
      return(<Named shell={shell} scopes={scopes} emitter={emitter}></Named>);
    });
    return (
      <div className="cuttlebone" style={cuttleboneStyle}>
        {namedElms}
      </div>
    );
  }
}
