"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SU = require("./SurfaceUtil");
var React = require('react');
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer(props) {
        _super.call(this, props);
        this.props.style = SU.extend(true, {
            display: "inline-block",
            position: "absolute",
            boxSizing: "border-box",
            margin: "0px",
            border: "none",
            padding: "0px"
        }, this.props.style);
    }
    Layer.prototype.render = function () {
        var _a = this.props, width = _a.width, height = _a.height, basisX = _a.basisX, basisY = _a.basisY, x = _a.x, y = _a.y;
        var style = {
            width: width + "px",
            height: height + "px"
        };
        style[basisX] = x + "px";
        style[basisY] = y + "px";
        return (React.createElement("div", {className: "layer", style: SU.extend(true, {}, this.props.style, style)}, this.props.children));
    };
    return Layer;
}(React.Component));
exports.Layer = Layer;
var LayerSet = (function (_super) {
    __extends(LayerSet, _super);
    function LayerSet(props) {
        _super.call(this, props);
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
    LayerSet.prototype.render = function () {
        return (React.createElement("div", {className: "layerSet", style: SU.extend(true, {}, this.props.style)}, this.props.children));
    };
    return LayerSet;
}(React.Component));
exports.LayerSet = LayerSet;
var Doc = (function (_super) {
    __extends(Doc, _super);
    function Doc(props) {
        _super.call(this, props);
        this.props.style = SU.extend(true, {
            display: "block",
            position: "static",
            boxSizing: "border-box"
        }, this.props.style);
    }
    Doc.prototype.render = function () {
        return (React.createElement("div", {className: "doc", style: SU.extend(true, {}, this.props.style)}, this.props.children));
    };
    return Doc;
}(React.Component));
exports.Doc = Doc;
var Scope = (function (_super) {
    __extends(Scope, _super);
    function Scope(props) {
        _super.call(this, props);
    }
    Scope.prototype.render = function () {
        var _a = this.props.surface, config = _a.config, move = _a.move, scopeId = _a.scopeId, surfaceId = _a.surfaceId, width = _a.width, height = _a.height, basepos = _a.basepos, surfaceNode = _a.surfaceNode, alignmenttodesktop = _a.alignmenttodesktop;
        var s = {
            width: width,
            height: height,
            basisX: "left",
            basisY: "top",
            x: 0,
            y: 0,
            content: "sakura"
        };
        return (React.createElement(LayerSet, {style: this.props.style}, 
            React.createElement(Layer, {key: 0, x: s.x, y: s.y, basisX: s.basisX, basisY: s.basisY, width: s.width, height: s.height}, 
                React.createElement(Doc, null, s.content)
            )
        ));
    };
    return Scope;
}(React.Component));
exports.Scope = Scope;
var Cuttlebone = (function (_super) {
    __extends(Cuttlebone, _super);
    function Cuttlebone() {
        _super.apply(this, arguments);
    }
    return Cuttlebone;
}(React.Component));
exports.Cuttlebone = Cuttlebone;
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
