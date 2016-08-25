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
        this.screenX = 0;
        this.screenY = 0;
        this.state = { width: 0, height: 0, x: 0, y: 0 };
        this.surfaceState = null;
    }
    Scope.prototype.componentDidMount = function () {
        var _this = this;
        var _a = this.props, renderer = _a.renderer, scopeId = _a.scopeId, surfaceId = _a.surfaceId, shell = _a.shell;
        renderer.getBaseSurfaceSize(surfaceId).then(function (_a) {
            var width = _a.width, height = _a.height;
            var surface = new SM.Surface(scopeId, surfaceId, width, height, shell);
            // アニメーション開始
            _this.surfaceState = new SS.SurfaceState(surface, function (ev, surface) {
                return renderer.render(surface).then(function (srfcnv) {
                    var canvas = ReactDOM.findDOMNode(_this.refs["surface"]);
                    var rndr = new SR.SurfaceRenderer(canvas);
                    rndr.base(srfcnv);
                });
            });
            _this.surfaceState.debug = true;
            return _this.surfaceState.render().then(function () {
                // setStateのタイミングでrenderが呼ばれるので
                _this.setState({ width: width, height: height, x: _this.state.x, y: _this.state.y });
            });
        });
    };
    Scope.prototype.componentDidUpdate = function () {
        if (this.surfaceState instanceof SS.SurfaceState) {
            this.surfaceState.render();
        }
    };
    Scope.prototype.componentWillUnmount = function () {
        if (this.surfaceState instanceof SS.SurfaceState) {
            this.surfaceState.destructor();
        }
    };
    Scope.prototype.render = function () {
        var _a = this.state, width = _a.width, height = _a.height, x = _a.x, y = _a.y;
        var s = {
            width: width, height: height,
            basisX: "left",
            basisY: "top",
            x: x, y: y
        };
        if (this.surfaceState instanceof SS.SurfaceState) {
            var _b = this.surfaceState.surface, config = _b.config, move = _b.move, scopeId = _b.scopeId, surfaceId = _b.surfaceId, width_1 = _b.width, height_1 = _b.height, basepos = _b.basepos, surfaceNode = _b.surfaceNode, alignmenttodesktop = _b.alignmenttodesktop;
            s.x -= basepos.x;
            s.y -= basepos.y;
            switch (alignmenttodesktop) {
                case "top":
                    s.y = 0;
                    break;
                case "bottom":
                    s.basisY = "bottom";
                    s.y = 0;
                    break;
                case "right":
                    s.basisX = "right";
                    s.x = 0;
                    break;
                case "left":
                    s.basisX = "left";
                    s.x = 0;
                    break;
                case "free": break;
            }
        }
        var b = {
            width: 200, height: 100,
            basisX: "left", basisY: "top",
            x: 0, y: 0
        };
        switch (b.basisX) {
            case "left":
                b.x -= b.width;
                break;
            case "right":
                b.x += b.width;
                break;
        }
        return (React.createElement(BC.Layer, {basisX: s.basisX, basisY: s.basisY, x: s.x, y: s.y, width: s.width, height: s.height}, 
            React.createElement(BC.LayerSet, null, 
                React.createElement(BC.Layer, {basisX: "left", basisY: "top", x: 0, y: 0, width: s.width, height: s.height}, 
                    React.createElement("canvas", {ref: "surface", style: { position: "absolute", top: "0px", left: "0px" }, onMouseDown: this.onSurfaceMouseDown.bind(this), onMouseMove: this.onSurfaceMouseMove.bind(this), onMouseUp: this.onSurfaceMouseUp.bind(this), onTouchStart: this.onSurfaceMouseDown.bind(this), onTouchMove: this.onSurfaceMouseMove.bind(this), onTouchEnd: this.onSurfaceMouseUp.bind(this), onTouchCancel: this.onSurfaceMouseUp.bind(this)})
                ), 
                React.createElement(BC.Layer, {basisX: b.basisX, basisY: b.basisY, x: b.x, y: b.y, width: b.width, height: b.height}, 
                    React.createElement("canvas", {width: b.width, height: b.height, ref: "balloon", style: { position: "absolute", top: 0 + "px", left: 0 + "px" }}), 
                    React.createElement("div", {style: { position: "absolute", top: 0 + "px", left: 0 + "px", width: b.width + "px", height: b.height + "px" }}, "\"hi\"")))
        ));
    };
    Scope.prototype.onSurfaceMouseDown = function (ev) {
        console.log(ev.type, ev, this);
        this.screenX = ev.screenX;
        this.screenY = ev.screenY;
    };
    Scope.prototype.onSurfaceMouseMove = function (ev) {
        console.log(ev.type, ev, this);
        var diffX = this.screenX - ev.screenX;
        var diffY = this.screenY - ev.screenY;
        this.setState({ width: this.state.width, height: this.state.height, x: this.state.x + diffX, y: this.state.y + diffY });
    };
    Scope.prototype.onSurfaceMouseUp = function (ev) {
        console.log(ev.type, ev, this);
        this.screenX = 0;
        this.screenY = 0;
    };
    return Scope;
}(React.Component));
exports.Scope = Scope;
var Named = (function (_super) {
    __extends(Named, _super);
    function Named() {
        _super.apply(this, arguments);
    }
    Named.prototype.render = function () {
        return (React.createElement(BC.LayerSet, null, 
            React.createElement(Scope, {scopeId: 0, surfaceId: 0, shell: this.props.shell, renderer: this.props.renderer}), 
            React.createElement(Scope, {scopeId: 1, surfaceId: 10, shell: this.props.shell, renderer: this.props.renderer})));
    };
    return Named;
}(React.Component));
exports.Named = Named;
