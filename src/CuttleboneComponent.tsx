import * as SU from "./SurfaceUtil";
import * as SM from "./SurfaceModel";
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
    this.props.style = SU.extend(true, {
      display: "inline-block",
      position: "absolute",
      boxSizing: "border-box",
      margin: "0px",
      border: "none",
      padding: "0px"
    }, this.props.style);
  }
  render(){
    const {width, height, basisX, basisY, x, y} = this.props;
    const style:{[a:string]:any} = {
      width: width+"px",
      height: height+"px"
    };
    style[basisX] = x+"px";
    style[basisY] = y+"px";
    return (
      <div className="layer" style={SU.extend(true, {}, this.props.style, style)}>
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
    this.props.style = SU.extend(true, {
      display: "block",
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      margin: "0px",
      border: "none",
      padding: "0px"
    }, this.props.style);
  }
  render(){
    return (
      <div className="layerSet" style={SU.extend(true, {}, this.props.style)}>
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
    this.props.style = SU.extend(true, {
      display: "block",
      position: "static",
      boxSizing: "border-box"
    }, this.props.style);
  }
  render(){
    return (
      <div className="doc" style={SU.extend(true, {}, this.props.style)}>
        {this.props.children}
      </div>
    );
  }
}

export interface ScopeProps extends React.Props<Scope>{
  style?: {[key: string]: string };
  surface: SM.Surface;
}
export interface ScopeState {}
export class Scope extends React.Component<ScopeProps, ScopeState> {
  constructor(props: ScopeProps) {
    super(props);
  }
  render(){
    const {config, move, scopeId, surfaceId, width, height, basepos, surfaceNode, alignmenttodesktop} = this.props.surface
    const s: LayerProps&{content:any} = {
      width: width,
      height: height,
      basisX: "left",
      basisY: "top",
      x: 0,
      y: 0,
      content: "sakura"
    };
    return (
      <LayerSet style={this.props.style}>
        <Layer key={0} x={s.x} y={s.y} basisX={s.basisX} basisY={s.basisY} width={s.width} height={s.height}>
          <Doc>{s.content}</Doc>
        </Layer>
      </LayerSet>
    );
  }
}

export interface CuttleboneProps extends React.Props<Cuttlebone> {
  style?: {[key: string]: string };
}
export interface CuttleboneState {}
export class Cuttlebone extends React.Component<CuttleboneProps, CuttleboneState>{
  style: {[key: string]: string };
}



/* 


export class Cuttlebone<P, S> extends React.Component<P, S>{
  style: {
    display: "block",
    position: "static",
    boxSizing: "border-box"
  };
  constructor(){
    super();
  }
  render(){
    const nameds: number[] = [];
    const namedElms = nameds.map((_, i)=>{
      return React.createElement("div", {keys:i,key:i, bottom:0, right:0}, "hi");
    });
    return React.createElement("div", {style: this.style}, 
      React.createElement(LayerSet, {}, namedElms)
    );
  }
}

export class Named<P, S> extends Layer<P, S>{
  render(){
    const scopes: number[] = [];
    const scopeElms = scopes.map((_, i)=>{
      return React.createElement(Scope, {key:i, bottom:0, right:10, width:100, height:200});
    });
    this.props.children = React.createElement(LayerSet, {hover:false}, scopeElms);
    return super.render();
  }
}



*/