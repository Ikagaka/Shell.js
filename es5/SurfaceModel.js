/*
 * Surface の状態モデル
 */
"use strict";

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Surface = function Surface(scopeId, surfaceId, shell) {
    _classCallCheck(this, Surface);

    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.shell = shell;
    this.surfaceDefTree = shell.surfaceDefTree;
    this.surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
    this.config = shell.config;
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.layers = [];
    this.seriko = [];
    this.talkCount = 0;
    this.move = { x: 0, y: 0 };
    this.destructed = false;
};

exports.Surface = Surface;

var Layer = function Layer(patterns, background) {
    _classCallCheck(this, Layer);

    this.patterns = [];
    this.background = background;
};

exports.Layer = Layer;

var SerikoLayer = function (_Layer) {
    _inherits(SerikoLayer, _Layer);

    function SerikoLayer(patterns, background) {
        var patternID = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

        _classCallCheck(this, SerikoLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SerikoLayer).call(this, patterns, background));

        _this.patternID = patternID;
        _this.paused = false;
        _this.exclusive = false;
        _this.canceled = false;
        _this.finished = false;
        return _this;
    }

    return SerikoLayer;
}(Layer);

exports.SerikoLayer = SerikoLayer;

var MayunaLayer = function (_Layer2) {
    _inherits(MayunaLayer, _Layer2);

    function MayunaLayer(patterns, background, visible) {
        _classCallCheck(this, MayunaLayer);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MayunaLayer).call(this, patterns, background));

        _this2.visible = true;
        return _this2;
    }

    return MayunaLayer;
}(Layer);

exports.MayunaLayer = MayunaLayer;

var SurfaceRenderingTree = function SurfaceRenderingTree(surface) {
    _classCallCheck(this, SurfaceRenderingTree);

    this.base = surface;
    this.foregrounds = [];
    this.backgrounds = [];
    this.collisions = [];
};

exports.SurfaceRenderingTree = SurfaceRenderingTree;

var SurfaceRenderingLayer = function SurfaceRenderingLayer(type, surface, x, y) {
    _classCallCheck(this, SurfaceRenderingLayer);

    this.type = type;
    this.surface = surface;
    this.x = x;
    this.y = y;
};

exports.SurfaceRenderingLayer = SurfaceRenderingLayer;