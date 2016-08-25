"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BC = require("./BaseComponent");
var SR = require("./SurfaceRenderer");
var SS = require("./SurfaceState");
var SM = require("./SurfaceModel");
var React = require('react');
var ReactDOM = require('react-dom');
var narloader = require("narloader");
var NL = narloader.NarLoader;
var Scope = (function (_super) {
    __extends(Scope, _super);
    function Scope(props) {
        _super.call(this, props);
        this.state = { width: 0, height: 0 };
        this.surfaceState = null;
    }
    Scope.prototype.componentWillMount = function () {
    };
    Scope.prototype.componentDidMount = function () {
        var _this = this;
        var _a = this.props, renderer = _a.renderer, scopeId = _a.scopeId, surfaceId = _a.surfaceId;
        var canvas = ReactDOM.findDOMNode(this.refs["surface"]);
        var rndr = new SR.SurfaceRenderer(canvas);
        renderer.getBaseSurfaceSize(surfaceId).then(function (_a) {
            var width = _a.width, height = _a.height;
            // 短形を取得
            _this.setState({ width: width, height: height });
            var surface = new SM.Surface(scopeId, surfaceId, width, height, renderer.shell);
            // アニメーション開始
            _this.surfaceState = new SS.SurfaceState(surface, function (ev, surface) {
                return renderer.render(surface).then(function (srfcnv) { return rndr.base(srfcnv); });
            });
        });
        // イベント登録
        // window.addEventListener('resize', this.handleResize);
    };
    Scope.prototype.componentWillUnmount = function () {
        // アニメーション停止
        if (this.surfaceState instanceof SS.SurfaceState) {
            this.surfaceState.destructor();
        }
        // イベント解除
        // window.removeEventListener('resize', this.handleResize);
    };
    Scope.prototype.render = function () {
        var s = {
            width: this.state.width,
            height: this.state.height,
            basisX: "left",
            basisY: "top",
            x: 0,
            y: 0
        };
        if (this.surfaceState instanceof SS.SurfaceState) {
            var _a = this.surfaceState.surface, config = _a.config, move = _a.move, scopeId = _a.scopeId, surfaceId = _a.surfaceId, width = _a.width, height = _a.height, basepos = _a.basepos, surfaceNode = _a.surfaceNode, alignmenttodesktop = _a.alignmenttodesktop;
        }
        return (React.createElement(BC.Layer, {basisX: "right", basisY: "bottom", x: 0, y: 0, width: s.width, height: s.height}, 
            React.createElement(BC.LayerSet, {style: { "WebkitTapHighlightColor": "transparent" }}, 
                React.createElement(BC.Layer, {key: 0, basisX: "left", basisY: "top", x: s.x, y: s.y, width: s.width, height: s.height, style: { "userSelect": "none" }}, 
                    React.createElement("canvas", {ref: "surface", width: s.width, height: s.height, style: { "userSelect": "none", "pointerEvents": "auto" }})
                ), 
                React.createElement(BC.Layer, {key: 1, basisX: "left", basisY: "top", x: -200, y: 0, width: 200, height: 100, style: { backgroundColor: "blue" }}, "\"hi\""))
        ));
    };
    return Scope;
}(React.Component));
exports.Scope = Scope;
var Named = (function (_super) {
    __extends(Named, _super);
    function Named(props) {
        _super.call(this, props);
    }
    Named.prototype.componentWillMount = function () {
    };
    Named.prototype.componentDidMount = function () {
        // イベント登録
        // window.addEventListener('resize', this.handleResize);
    };
    Named.prototype.componentWillUnmount = function () {
        // イベント解除
        // window.removeEventListener('resize', this.handleResize);
    };
    Named.prototype.render = function () {
        var namedStyle = {
            display: "block", position: "fixed",
            boxSizing: "border-box",
            bottom: "0px", right: "0px",
            height: "100%", width: "100%"
        };
        return (React.createElement("div", {className: "named", style: namedStyle}, 
            React.createElement(BC.LayerSet, null, 
                React.createElement(Scope, {key: 0, surfaceId: 0, scopeId: 0, shell: this.props.shell, renderer: this.props.renderer})
            )
        ));
    };
    return Named;
}(React.Component));
exports.Named = Named;
