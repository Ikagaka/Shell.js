"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SU = require("./SurfaceUtil");
var React = require('react');
var Cuttlebone = (function (_super) {
    __extends(Cuttlebone, _super);
    function Cuttlebone() {
        _super.apply(this, arguments);
    }
    return Cuttlebone;
}(React.Component));
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer(props) {
        _super.call(this, props);
        this.style = {
            display: "inline-block",
            position: "absolute",
            boxSizing: "border-box",
            margin: "0px",
            border: "none",
            padding: "0px"
        };
    }
    Layer.prototype.render = function () {
        var _a = this.props, width = _a.width, height = _a.height, basisX = _a.basisX, basisY = _a.basisY, x = _a.x, y = _a.y;
        var style = {
            width: width + "px",
            height: height + "px"
        };
        style[basisX] = x + "px";
        style[basisY] = y + "px";
        return (React.createElement("div", {className: "layer", style: SU.extend(true, {}, this.style, this.props.style, style)}, this.props.content));
    };
    return Layer;
}(React.Component));
exports.Layer = Layer;
var LayerSet = (function (_super) {
    __extends(LayerSet, _super);
    function LayerSet(props) {
        _super.call(this, props);
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
    LayerSet.prototype.render = function () {
        var layerNodes = this.props.layers.map(function (_a, key) {
            var x = _a.x, y = _a.y, basisX = _a.basisX, basisY = _a.basisY, width = _a.width, height = _a.height, content = _a.content, style = _a.style;
            return (React.createElement(Layer, {key: key, style: style, x: x, y: y, basisX: basisX, basisY: basisY, width: width, height: height, content: content}));
        });
        return (React.createElement("div", {className: "layerSet", style: SU.extend(true, {}, this.style, this.props.style)}, layerNodes));
    };
    return LayerSet;
}(React.Component));
exports.LayerSet = LayerSet;
var Doc = (function (_super) {
    __extends(Doc, _super);
    function Doc(props) {
        _super.call(this, props);
    }
    Doc.prototype.render = function () {
        return (React.createElement("div", {className: "doc", style: SU.extend(true, {}, this.style, this.props.style)}, this.props.children));
    };
    return Doc;
}(React.Component));
exports.Doc = Doc;
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
