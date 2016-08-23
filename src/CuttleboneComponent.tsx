import * as SU from "./SurfaceUtil";
import * as React from 'react';
import * as ReactDOM from 'react-dom';


export class Doc<P, S> extends React.Component<P, S>{
  style: {
    display: "block",
    position: "static",
    boxSizing: "border-box"
  };
  constructor(){
    super();
  }
  render(){
    return (
      <div class="Doc" style={this.style}>
        {this.props.children}
      </div>
    );
  }
}

export class Layer<P, S> extends React.Component<P, S>{
  style: {
    display: "inline-block",
    position: "absolute",
    boxSizing: "border-box",
    margin: "0px",
    border: "none",
    padding: "0px"
  };
  render(){
    return (
      <div class="Layer" style={this.style}>
        {this.props.children}
      </div>
    );
  }
}

export class LayerSet<P, S> extends React.Component<P, S>{
  style: {
    display: "block",
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    margin: "0px",
    border: "none",
    padding: "0px"
  };
  render(){
    return (
      <div class="LayerSet" style={this.style}>
        {this.props.children}
      </div>
    );
  }

}

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

