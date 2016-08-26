import * as Util from "../Util/index";

import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import {Shell} from "../Model/Shell";

import {Layer, LayerSet, LayerProps} from "./Layer";
import {Scope, SurfaceMouseDownEvent} from "./Scope";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";

 
export interface NamedProps extends React.Props<Named>{
  named: MN.Named;
  emitter: EventEmitter;
}
export interface NamedState {}
export class Named extends React.Component<NamedProps, NamedState> {
  constructor(props: NamedProps) {
    super(props);
  }
  render(){
    const {named, emitter} = this.props;
    const {shell, scopes} = named; 
    const scopeElms = scopes.map((scope, key)=>{
      const {surface} = scope;
      const _emitter  = new EventEmitter();
      _emitter.on("onSurfaceMouseDown", (ev: SurfaceMouseDownEvent)=>{
        emitter.emit("onSurfaceMouseDown", Util.extend(true, ev, {named: this.props.named}))
      });
      return (
        <div key={key}
          onTouchStart={this.onNamedMouseDown.bind(this)}
          onMouseDown={this.onNamedMouseDown.bind(this)}>
          <Scope shell={shell} scope={scope} emitter={emitter}></Scope>
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
    // todo: eventemitter
    this.props.emitter.emit("onNamedMouseDown", { type: "onNamedMouseDown", event, named: this.props.named });
  }
}

export interface NamedMouseDownEvent {
  type: "onNamedMouseDown";
  event: React.MouseEvent|React.TouchEvent;
  named: MN.Named;
}
export interface SurfaceMouseDownEvent extends SurfaceMouseDownEvent {
  named: MN.Named;
}