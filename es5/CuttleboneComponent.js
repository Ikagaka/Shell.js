"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Doc = (function (_super) {
    __extends(Doc, _super);
    function Doc() {
        _super.call(this);
    }
    Doc.prototype.render = function () {
        return (React.createElement("div", {class: "Doc", style: this.style}, this.props.children));
    };
    return Doc;
}(React.Component));
exports.Doc = Doc;
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer() {
        _super.apply(this, arguments);
    }
    Layer.prototype.render = function () {
        return (React.createElement("div", {class: "Layer", style: this.style}, this.props.children));
    };
    return Layer;
}(React.Component));
exports.Layer = Layer;
var LayerSet = (function (_super) {
    __extends(LayerSet, _super);
    function LayerSet() {
        _super.apply(this, arguments);
    }
    LayerSet.prototype.render = function () {
        return (React.createElement("div", {class: "LayerSet", style: this.style}, this.props.children));
    };
    return LayerSet;
}(React.Component));
exports.LayerSet = LayerSet;
var Cuttlebone = (function (_super) {
    __extends(Cuttlebone, _super);
    function Cuttlebone() {
        _super.call(this);
    }
    Cuttlebone.prototype.render = function () {
        var nameds = [];
        var namedElms = nameds.map(function (_, i) {
            return React.createElement("div", { keys: i, key: i, bottom: 0, right: 0 }, "hi");
        });
        return React.createElement("div", { style: this.style }, React.createElement(LayerSet, {}, namedElms));
    };
    return Cuttlebone;
}(React.Component));
exports.Cuttlebone = Cuttlebone;
var Named = (function (_super) {
    __extends(Named, _super);
    function Named() {
        _super.apply(this, arguments);
    }
    Named.prototype.render = function () {
        var scopes = [];
        var scopeElms = scopes.map(function (_, i) {
            return React.createElement(Scope, { key: i, bottom: 0, right: 10, width: 100, height: 200 });
        });
        this.props.children = React.createElement(LayerSet, { hover: false }, scopeElms);
        return _super.prototype.render.call(this);
    };
    return Named;
}(Layer));
exports.Named = Named;
var Scope = (function (_super) {
    __extends(Scope, _super);
    function Scope() {
        _super.apply(this, arguments);
    }
    Scope.prototype.render = function () {
        this.props.children = React.createElement(LayerSet, { hover: false }, [
            React.createElement(Layer, { key: 0, top: 0, left: 0, width: 100, height: 200, style: { backgroundColor: "red" } }, React.createElement(Doc, {}, "shell")),
            React.createElement(Layer, { key: 1, top: 0, left: -90, width: 100, height: 60, style: { backgroundColor: "green" } }, React.createElement(Doc, {}, "balloon"))
        ]);
        return _super.prototype.render.call(this);
    };
    return Scope;
}(Layer));
exports.Scope = Scope;
