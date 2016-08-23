import * as SU from "./SurfaceUtil";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");

interface CuttleboneProps extends React.Props<CuttleboneProps> {
  style?: {[key: string]: string };
}
interface CuttleboneState {}
class Cuttlebone extends React.Component<CuttleboneProps, CuttleboneState>{
  style: {[key: string]: string };
}

export interface LayerProps extends React.Props<Layer>{
  style?: {[key: string]: string };
  width: number;
  height: number;
  basisX: "left" | "right";
  basisY: "top" | "bottom";
  x: number;
  y: number;
  content: any;
}
export interface LayerState {}
export class Layer extends React.Component<LayerProps, LayerState >{
  style: {[key: string]: string };
  constructor(props: LayerProps) {
    super(props);
    this.style = {
      display: "inline-block",
      position: "absolute",
      boxSizing: "border-box",
      margin: "0px",
      border: "none",
      padding: "0px"
    };
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
      <div className="layer" style={SU.extend(true, {}, this.style, this.props.style, style)}>
        {this.props.content}
      </div>
    );
  }
}


export interface LayerSetProps extends React.Props<LayerSet>{
  style?: {[key: string]: string };
  layers: LayerProps[];
}
export interface LayerSetState {
}
export class LayerSet extends React.Component<LayerSetProps, LayerSetState>{
  style: {[key: string]: string };
  constructor(props: LayerSetProps) {
    super(props);
    this.style = {
      display: "block",
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      margin: "0px",
      border: "none",
      padding: "0px"
    };
  }
  render(){
    const layerNodes = this.props.layers.map(({x,y,basisX,basisY,width,height,content,style}, key)=>{
      return (
        <Layer key={key} style={style} x={x} y={y} basisX={basisX} basisY={basisY} width={width} height={height} content={content}>
        </Layer>
      );
    });
    return (
      <div className="layerSet" style={SU.extend(true, {}, this.style, this.props.style)}>
        {layerNodes}
      </div>
    );
  }
}

export interface DocProps extends React.Props<Doc>{
  style?: {[key: string]: string };
}
export interface DocState {}
export class Doc extends React.Component<DocProps, DocState>{
  style: {
    display: "block",
    position: "static",
    boxSizing: "border-box"
  };
  constructor(props: DocProps) {
    super(props);
  }
  render(){
    return (
      <div className="doc" style={SU.extend(true, {}, this.style, this.props.style)}>
        {this.props.children}
      </div>
    );
  }
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

export class Scope<P, S> extends Layer<P, S>{
  render(){
    this.props.children = React.createElement(LayerSet, {hover:false}, [
      React.createElement(Layer, {key:0, top:0, left:0, width:100, height:200, style:{backgroundColor:"red"}},
        React.createElement(Doc, {}, "shell")
      ),
      React.createElement(Layer, {key:1, top:0, left:-90, width:100, height:60, style:{backgroundColor:"green"}},
        React.createElement(Doc, {}, "balloon")
      )
    ]);
    return super.render();
  }
}

*/