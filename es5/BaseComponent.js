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
    }
    Layer.prototype.render = function () {
        var _a = this.props, width = _a.width, height = _a.height, basisX = _a.basisX, basisY = _a.basisY, x = _a.x, y = _a.y;
        var style = SU.extend(true, {}, {
            display: "inline-block",
            position: "absolute",
            boxSizing: "border-box",
            margin: "0px",
            border: "none",
            padding: "0px",
            width: width + "px",
            height: height + "px"
        }, this.props.style);
        style[basisX] = x + "px";
        style[basisY] = y + "px";
        return (React.createElement("div", {className: "layer", style: style}, this.props.children));
    };
    return Layer;
}(React.Component));
exports.Layer = Layer;
var LayerSet = (function (_super) {
    __extends(LayerSet, _super);
    function LayerSet(props) {
        _super.call(this, props);
    }
    LayerSet.prototype.render = function () {
        var style = SU.extend(true, {}, {
            display: "block",
            position: "relative",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            margin: "0px",
            border: "none",
            padding: "0px"
        }, this.props.style);
        return (React.createElement("div", {className: "layerSet", style: style}, this.props.children));
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
        var style = SU.extend(true, {}, {
            display: "block",
            position: "static",
            boxSizing: "border-box"
        }, this.props.style);
        return (React.createElement("div", {className: "doc", style: SU.extend(true, {}, this.props.style)}, this.props.children));
    };
    return Doc;
}(React.Component));
exports.Doc = Doc;
