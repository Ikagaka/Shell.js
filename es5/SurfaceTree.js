"use strict";

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SurfaceDefinitionTree =
//regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
function SurfaceDefinitionTree() {
    var descript = arguments.length <= 0 || arguments[0] === undefined ? new SurfaceDescript() : arguments[0];
    var surfaces = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var aliases = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, SurfaceDefinitionTree);

    this.descript = descript;
    this.surfaces = surfaces;
    this.aliases = aliases;
};

exports.SurfaceDefinitionTree = SurfaceDefinitionTree;

var SurfaceDescript = function SurfaceDescript() {
    var collisionSort = arguments.length <= 0 || arguments[0] === undefined ? "ascend" : arguments[0];
    var animationSort = arguments.length <= 1 || arguments[1] === undefined ? "ascend" : arguments[1];

    _classCallCheck(this, SurfaceDescript);

    this.collisionSort = collisionSort;
    this.animationSort = animationSort;
};

exports.SurfaceDescript = SurfaceDescript;

var SurfaceDefinition = function SurfaceDefinition() {
    var elements = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var collisions = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var animations = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var balloons = arguments.length <= 3 || arguments[3] === undefined ? { char: [], offsetX: 0, offsetY: 0 } : arguments[3];
    var points = arguments.length <= 4 || arguments[4] === undefined ? { basepos: { x: 0, y: 0 } } : arguments[4];

    _classCallCheck(this, SurfaceDefinition);

    this.elements = elements;
    this.collisions = collisions;
    this.animations = animations;
    this.points = points;
    this.balloons = balloons;
};

exports.SurfaceDefinition = SurfaceDefinition;

var SurfaceElement = function SurfaceElement() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? "overlay" : arguments[0];
    var file = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];
    var x = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var y = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    _classCallCheck(this, SurfaceElement);

    this.type = "overlay";
    this.file = file;
    this.x = x;
    this.y = y;
};

exports.SurfaceElement = SurfaceElement;

var SurfaceCollision = function SurfaceCollision() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var type = arguments.length <= 1 || arguments[1] === undefined ? "rect" : arguments[1];

    _classCallCheck(this, SurfaceCollision);

    this.name = name;
    this.type = type;
};

exports.SurfaceCollision = SurfaceCollision;

var SurfaceCollisionRect = function (_SurfaceCollision) {
    _inherits(SurfaceCollisionRect, _SurfaceCollision);

    function SurfaceCollisionRect() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
        var type = arguments.length <= 1 || arguments[1] === undefined ? "rect" : arguments[1];
        var left = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var top = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var right = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
        var bottom = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];

        _classCallCheck(this, SurfaceCollisionRect);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionRect).call(this, name, type));

        _this.left = left;
        _this.top = top;
        _this.right = right;
        _this.bottom = bottom;
        return _this;
    }

    return SurfaceCollisionRect;
}(SurfaceCollision);

exports.SurfaceCollisionRect = SurfaceCollisionRect;

var SurfaceCollisionEllipse = function (_SurfaceCollisionRect) {
    _inherits(SurfaceCollisionEllipse, _SurfaceCollisionRect);

    function SurfaceCollisionEllipse() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
        var type = arguments.length <= 1 || arguments[1] === undefined ? "ellipse" : arguments[1];
        var top = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var bottom = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var left = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
        var right = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];

        _classCallCheck(this, SurfaceCollisionEllipse);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionEllipse).call(this, name, type, bottom, top, left, right));
    }

    return SurfaceCollisionEllipse;
}(SurfaceCollisionRect);

exports.SurfaceCollisionEllipse = SurfaceCollisionEllipse;

var SurfaceCollisionCircle = function (_SurfaceCollision2) {
    _inherits(SurfaceCollisionCircle, _SurfaceCollision2);

    function SurfaceCollisionCircle() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
        var type = arguments.length <= 1 || arguments[1] === undefined ? "circle" : arguments[1];
        var centerX = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var centerY = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var radius = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

        _classCallCheck(this, SurfaceCollisionCircle);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionCircle).call(this, name, type));

        _this3.centerX = centerX;
        _this3.centerY = centerY;
        _this3.radius = radius;
        return _this3;
    }

    return SurfaceCollisionCircle;
}(SurfaceCollision);

exports.SurfaceCollisionCircle = SurfaceCollisionCircle;

var SurfaceCollisionPolygon = function (_SurfaceCollision3) {
    _inherits(SurfaceCollisionPolygon, _SurfaceCollision3);

    function SurfaceCollisionPolygon() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
        var type = arguments.length <= 1 || arguments[1] === undefined ? "polygon" : arguments[1];
        var coordinates = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        _classCallCheck(this, SurfaceCollisionPolygon);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionPolygon).call(this, name, type));

        _this4.coordinates = coordinates;
        return _this4;
    }

    return SurfaceCollisionPolygon;
}(SurfaceCollision);

exports.SurfaceCollisionPolygon = SurfaceCollisionPolygon;

var SurfaceAnimation = function SurfaceAnimation() {
    var intervals = arguments.length <= 0 || arguments[0] === undefined ? [["never", []]] : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var collisions = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var patterns = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

    _classCallCheck(this, SurfaceAnimation);

    this.intervals = intervals;
    this.options = options;
    this.collisions = collisions;
    this.patterns = patterns;
};

exports.SurfaceAnimation = SurfaceAnimation;

var SurfaceAnimationPattern = function SurfaceAnimationPattern() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? "ovelay" : arguments[0];
    var surface = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
    var wait = arguments.length <= 2 || arguments[2] === undefined ? [0, 0] : arguments[2];
    var x = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
    var y = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
    var animation_ids = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];

    _classCallCheck(this, SurfaceAnimationPattern);

    this.type = type;
    this.surface = surface;
    this.wait = wait;
    this.x = x;
    this.y = y;
    this.animation_ids = animation_ids;
};

exports.SurfaceAnimationPattern = SurfaceAnimationPattern;