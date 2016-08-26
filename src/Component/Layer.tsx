import * as Util from "../Util/index";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");


export interface LayerProps extends React.Props<Layer>{
  style?: {[key: string]: string };
  width: number;
  height: number;
  basisX: "left" | "right";
  basisY: "top" | "bottom";
  x: number;
  y: number;
}
export interface LayerState {}
export class Layer extends React.Component<LayerProps, LayerState >{
  constructor(props: LayerProps) {
    super(props);
  }
  render(){
    const {width, height, basisX, basisY, x, y} = this.props;
    const style:{[a:string]:any} = Util.extend(true, {}, {
      display: "inline-block",
      position: "absolute",
      boxSizing: "border-box",
      margin: "0px",
      border: "none",
      padding: "0px",
      width: width+"px",
      height: height+"px"
    }, this.props.style);
    style[basisX] = x+"px";
    style[basisY] = y+"px";
    return (
      <div className="layer" style={style}>
        {this.props.children}
      </div>
    );
  }
}


export interface LayerSetProps extends React.Props<LayerSet>{
  style?: {[key: string]: string };
}
export interface LayerSetState {
}
export class LayerSet extends React.Component<LayerSetProps, LayerSetState>{
  constructor(props: LayerSetProps) {
    super(props);
  }
  render(){
    const style:{[a:string]:any} = Util.extend(true, {}, {
      display: "block",
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      margin: "0px",
      border: "none",
      padding: "0px"
    }, this.props.style);
    return (
      <div className="layerSet" style={style}>
        {this.props.children}
      </div>
    );
  }
}


export interface DocProps extends React.Props<Doc>{
  style?: {[key: string]: string };
}
export interface DocState {}
export class Doc extends React.Component<DocProps, DocState>{
  constructor(props: DocProps) {
    super(props);
  }
  render(){
    const style:{[a:string]:any} = Util.extend(true, {}, {
      display: "block",
      position: "static",
      boxSizing: "border-box"
    }, this.props.style);
    return (
      <div className="doc" style={Util.extend(true, {}, this.props.style)}>
        {this.props.children}
      </div>
    );
  }
}
