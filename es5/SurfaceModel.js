/*
 * Surface の状態モデル
 */
"use strict";

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Surface = function Surface(scopeId, surfaceId, surfaceDefTree, config) {
    _classCallCheck(this, Surface);

    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.surfaceDefTree = surfaceDefTree;
    this.surfaceNode = surfaceDefTree.surfaces[surfaceId];
    this.config = config;
    this.layers = [];
    this.seriko = [];
    this.talkCount = 0;
    this.move = { x: 0, y: 0 };
    this.destructed = false;
};

exports.Surface = Surface;

var Layer = function Layer() {
    _classCallCheck(this, Layer);
};

exports.Layer = Layer;

var SerikoLayer = function (_Layer) {
    _inherits(SerikoLayer, _Layer);

    function SerikoLayer(background) {
        _classCallCheck(this, SerikoLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SerikoLayer).call(this));

        _this.patternID = -1;
        _this.paused = false;
        _this.exclusive = false;
        _this.canceled = false;
        _this.finished = false;
        _this.background = background;
        return _this;
    }

    return SerikoLayer;
}(Layer);

exports.SerikoLayer = SerikoLayer;

var MayunaLayer = function (_Layer2) {
    _inherits(MayunaLayer, _Layer2);

    function MayunaLayer(visible, background) {
        _classCallCheck(this, MayunaLayer);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MayunaLayer).call(this));

        _this2.visible = true;
        _this2.background = background;
        return _this2;
    }

    return MayunaLayer;
}(Layer);

exports.MayunaLayer = MayunaLayer;
function getSurfaceSize(srf) {
    return {
        // TODO
        width: 0,
        height: 0 //$(this.element).height()
    };
}
exports.getSurfaceSize = getSurfaceSize;