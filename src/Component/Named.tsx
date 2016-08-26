import * as Util from "../Util/index";

import * as MS from "../Model/Scope";
import * as MN from "../Model/Named";
import {Shell} from "../Model/Shell";

import {Layer, LayerSet, LayerProps} from "./Layer";
import {Scope} from "./Scope";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";

 
export type NamedProps = MN.Named & {emitter: EventEmitter} & React.Props<Named>;
export interface NamedState {}
export class Named extends React.Component<NamedProps, NamedState> {
  constructor(props: NamedProps) {
    super(props);
  }
  render(){
    const {shell, scopes, emitter} = this.props; 
    const scopeElms = scopes.map((scope, key)=>{
      const {srfCnv, surface} = scope;
      return (
        <div onMouseDown={this.onNamedMouseDown.bind(this)}>
          <Scope key={key} shell={shell} scope={scope} emitter={emitter}></Scope>
        </div>
      );
    });
    return (
      <LayerSet>
        {scopeElms}
      </LayerSet>
    );
  }
  onNamedMouseDown(ev: React.MouseEvent): void {
    // todo: eventemitter
    const {emitter} = this.props;
    emitter.emit("onNamedMouseDown", ev);
  }
}
