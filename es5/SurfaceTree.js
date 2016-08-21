/*
 * surfaces.txt の内容を構造化したもの
 */
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
function isBack(anim) {
    return anim.options.some(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var opt = _ref2[0];
        var args = _ref2[1];
        return opt === "background";
    });
}
exports.isBack = isBack;
function getExclusives(anim) {
    return anim.options.filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var opt = _ref4[0];
        var args = _ref4[1];
        return opt === "exclusive";
    }).reduce(function (l, _ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var opt = _ref6[0];
        var args = _ref6[1];
        return l.concat(args);
    }, []);
}
exports.getExclusives = getExclusives;
function getRegion(collisions, offsetX, offsetY) {
    var _this5 = this;

    // このサーフェスの定義 surfaceNode.collision と canvas と座標を比較して
    // collision設定されていれば name"hoge"
    // basepos 左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べる
    // offsetX: number, offsetY: number は basepos からの相対座標である必要がある、間違ってもcanvas左上からにしてはいけない 
    var hitCols = collisions.filter(function (collision, colId) {
        var type = collision.type;
        var name = collision.name;
        var left, top, right, bottom;
        var left, top, right, bottom;

        var _ret = function () {
            switch (collision.type) {
                case "rect":
                    left = collision.left;
                    top = collision.top;
                    right = collision.right;
                    bottom = collision.bottom;

                    return {
                        v: left < offsetX && offsetX < right && top < offsetY && offsetY < bottom || right < offsetX && offsetX < left && bottom < offsetX && offsetX < top
                    };
                case "ellipse":
                    left = collision.left;
                    top = collision.top;
                    right = collision.right;
                    bottom = collision.bottom;

                    var width = Math.abs(right - left);
                    var height = Math.abs(bottom - top);
                    return {
                        v: Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) + Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1
                    };
                case "circle":
                    var radius = collision.radius;
                    var centerX = collision.centerX;
                    var centerY = collision.centerY;

                    return {
                        v: Math.pow((offsetX - centerX) / radius, 2) + Math.pow((offsetY - centerY) / radius, 2) < 1
                    };
                case "polygon":
                    var coordinates = collision.coordinates;

                    var ptC = { x: offsetX, y: offsetY };
                    var tuples = coordinates.reduce(function (arr, _ref7, i) {
                        var x = _ref7.x;
                        var y = _ref7.y;

                        arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                        return arr;
                    }, []);
                    // TODO: acos使わない奴に変える
                    var deg = tuples.reduce(function (sum, _ref8) {
                        var _ref9 = _slicedToArray(_ref8, 2);

                        var ptA = _ref9[0];
                        var ptB = _ref9[1];

                        var vctA = [ptA.x - ptC.x, ptA.y - ptC.y];
                        var vctB = [ptB.x - ptC.x, ptB.y - ptC.y];
                        var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                        var absA = Math.sqrt(vctA.map(function (a) {
                            return Math.pow(a, 2);
                        }).reduce(function (a, b) {
                            return a + b;
                        }));
                        var absB = Math.sqrt(vctB.map(function (a) {
                            return Math.pow(a, 2);
                        }).reduce(function (a, b) {
                            return a + b;
                        }));
                        var rad = Math.acos(dotP / (absA * absB));
                        return sum + rad;
                    }, 0);
                    return {
                        v: deg / (2 * Math.PI) >= 1
                    };
                default:
                    console.warn("unkown collision type:", _this5.surfaceId, colId, name, collision);
                    return {
                        v: false
                    };
            }
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    });
    if (hitCols.length > 0) {
        return hitCols[hitCols.length - 1].name;
    }
    return "";
}
exports.getRegion = getRegion;