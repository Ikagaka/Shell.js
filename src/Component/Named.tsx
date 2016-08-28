import * as Util from "../Util/index";

import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import {Shell} from "../Model/Shell";

import * as SN from "../State/Named";

import {Layer, LayerSet, LayerProps} from "./Layer";
import {Scope, SurfaceMouseDownEvent, SurfaceDrawEvent} from "./Scope";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";

 
export interface NamedProps extends React.Props<Named>{
  namedState: SN.NamedState;
}
export interface NamedState {}
export class Named extends React.Component<NamedProps, NamedState> {
  constructor(props: NamedProps) {
    super(props);
    this.props.namedState.on("onHover", (ev: SN.HoverEvent)=>{
      this.setState({});
    });
  }
  render(){
    const {namedState} = this.props;
    const {scopeStates, named} = namedState;
    const {scopes} = named;
    const scopeElms = scopes.map((scope, key)=>{
      const scopeState = namedState.findScopeStateFromScope(scope);
      return (
        <div key={key}
          onTouchStart={this.onNamedMouseDown.bind(this)}
          onMouseDown={this.onNamedMouseDown.bind(this)}>
          <Scope scopeState={scopeState} ></Scope>
        </div>
      );
    });
    return (
      <LayerSet>
        {scopeElms}
      </LayerSet>
    );
  }
  onNamedMouseDown(event: React.MouseEvent|React.TouchEvent): void {
    const {namedState} = this.props;
    const {named} = namedState;
    // namedState.hover() してほしい
    namedState.emit("onNamedMouseDown", { type: "onNamedMouseDown", event, named });
  }
}


/*
this.on("onSurfaceMouseDown", console.info.bind(console));
    namedState.on("onUpdatePosition", (ev: UpdatePositionEvent)=>{
      */
export interface NamedMouseDownEvent {
  type: "onNamedMouseDown";
  event: React.MouseEvent|React.TouchEvent;
  named: MN.Named;
}
