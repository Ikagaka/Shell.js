/*
 * surfaces.txt の内容を構造化したもの
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SurfaceDefinitionTree = (function () {
    //regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
    function SurfaceDefinitionTree(descript, surfaces, aliases) {
        if (descript === void 0) { descript = new SurfaceDescript(); }
        if (surfaces === void 0) { surfaces = []; }
        if (aliases === void 0) { aliases = []; }
        this.descript = descript;
        this.surfaces = surfaces;
        this.aliases = aliases;
    }
    return SurfaceDefinitionTree;
}());
exports.SurfaceDefinitionTree = SurfaceDefinitionTree;
var SurfaceDescript = (function () {
    function SurfaceDescript(collisionSort, animationSort) {
        if (collisionSort === void 0) { collisionSort = "ascend"; }
        if (animationSort === void 0) { animationSort = "ascend"; }
        this.collisionSort = collisionSort;
        this.animationSort = animationSort;
    }
    return SurfaceDescript;
}());
exports.SurfaceDescript = SurfaceDescript;
var SurfaceDefinition = (function () {
    function SurfaceDefinition(elements, collisions, animations, balloons, points) {
        if (elements === void 0) { elements = []; }
        if (collisions === void 0) { collisions = []; }
        if (animations === void 0) { animations = []; }
        if (balloons === void 0) { balloons = { char: [], offsetX: 0, offsetY: 0 }; }
        if (points === void 0) { points = { basepos: { x: null, y: null }
        }; }
        this.elements = elements;
        this.collisions = collisions;
        this.animations = animations;
        this.points = points;
        this.balloons = balloons;
    }
    return SurfaceDefinition;
}());
exports.SurfaceDefinition = SurfaceDefinition;
var SurfaceElement = (function () {
    function SurfaceElement(type, file, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.type = type;
        this.file = file;
        this.x = x;
        this.y = y;
    }
    return SurfaceElement;
}());
exports.SurfaceElement = SurfaceElement;
var SurfaceCollision = (function () {
    function SurfaceCollision(type, name) {
        this.name = name;
        this.type = type;
    }
    return SurfaceCollision;
}());
exports.SurfaceCollision = SurfaceCollision;
var SurfaceCollisionRect = (function (_super) {
    __extends(SurfaceCollisionRect, _super);
    function SurfaceCollisionRect(name, left, top, right, bottom) {
        _super.call(this, "rect", name);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    return SurfaceCollisionRect;
}(SurfaceCollision));
exports.SurfaceCollisionRect = SurfaceCollisionRect;
var SurfaceCollisionEllipse = (function (_super) {
    __extends(SurfaceCollisionEllipse, _super);
    function SurfaceCollisionEllipse(name, left, top, right, bottom) {
        _super.call(this, "ellipse", name);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    return SurfaceCollisionEllipse;
}(SurfaceCollision));
exports.SurfaceCollisionEllipse = SurfaceCollisionEllipse;
var SurfaceCollisionCircle = (function (_super) {
    __extends(SurfaceCollisionCircle, _super);
    function SurfaceCollisionCircle(name, centerX, centerY, radius) {
        _super.call(this, "circle", name);
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
    }
    return SurfaceCollisionCircle;
}(SurfaceCollision));
exports.SurfaceCollisionCircle = SurfaceCollisionCircle;
var SurfaceCollisionPolygon = (function (_super) {
    __extends(SurfaceCollisionPolygon, _super);
    function SurfaceCollisionPolygon(name, coordinates) {
        _super.call(this, "polygon", name);
        this.coordinates = coordinates;
    }
    return SurfaceCollisionPolygon;
}(SurfaceCollision));
exports.SurfaceCollisionPolygon = SurfaceCollisionPolygon;
var SurfaceAnimation = (function () {
    function SurfaceAnimation(intervals, options, collisions, patterns) {
        if (intervals === void 0) { intervals = [["never", []]]; }
        if (options === void 0) { options = []; }
        if (collisions === void 0) { collisions = []; }
        if (patterns === void 0) { patterns = []; }
        this.intervals = intervals;
        this.options = options;
        this.collisions = collisions;
        this.patterns = patterns;
    }
    return SurfaceAnimation;
}());
exports.SurfaceAnimation = SurfaceAnimation;
var SurfaceAnimationPattern = (function () {
    function SurfaceAnimationPattern(type, surface, wait, x, y, animation_ids) {
        if (type === void 0) { type = "ovelay"; }
        if (surface === void 0) { surface = -1; }
        if (wait === void 0) { wait = [0, 0]; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (animation_ids === void 0) { animation_ids = []; }
        this.type = type;
        this.surface = surface;
        this.wait = wait;
        this.x = x;
        this.y = y;
        this.animation_ids = animation_ids;
    }
    return SurfaceAnimationPattern;
}());
exports.SurfaceAnimationPattern = SurfaceAnimationPattern;
function isBack(anim) {
    return anim.options.some(function (_a) {
        var opt = _a[0], args = _a[1];
        return opt === "background";
    });
}
exports.isBack = isBack;
function getExclusives(anim) {
    return anim.options.filter(function (_a) {
        var opt = _a[0], args = _a[1];
        return opt === "exclusive";
    }).reduce(function (l, _a) {
        var opt = _a[0], args = _a[1];
        return l.concat(args);
    }, []);
}
exports.getExclusives = getExclusives;
function getRegion(collisions, offsetX, offsetY) {
    // このサーフェスの定義 surfaceNode.collision と canvas と座標を比較して
    // collision設定されていれば name"hoge"
    // basepos 左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べる
    // offsetX: number, offsetY: number は surfaceCanvas.basePosX からの相対座標である必要がある、間違ってもcanvas左上からにしてはいけない 
    var _this = this;
    var hitCols = collisions.filter(function (collision, colId) {
        var type = collision.type, name = collision.name;
        switch (collision.type) {
            case "rect":
                var _a = collision, left = _a.left, top = _a.top, right = _a.right, bottom = _a.bottom;
                return (left < offsetX && offsetX < right && top < offsetY && offsetY < bottom) ||
                    (right < offsetX && offsetX < left && bottom < offsetX && offsetX < top);
            case "ellipse":
                var _b = collision, left = _b.left, top = _b.top, right = _b.right, bottom = _b.bottom;
                var width = Math.abs(right - left);
                var height = Math.abs(bottom - top);
                return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) +
                    Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
            case "circle":
                var _c = collision, radius = _c.radius, centerX = _c.centerX, centerY = _c.centerY;
                return Math.pow((offsetX - centerX) / radius, 2) + Math.pow((offsetY - centerY) / radius, 2) < 1;
            case "polygon":
                var coordinates_1 = collision.coordinates;
                var ptC_1 = { x: offsetX, y: offsetY };
                var tuples = coordinates_1.reduce((function (arr, _a, i) {
                    var x = _a.x, y = _a.y;
                    arr.push([
                        coordinates_1[i],
                        (!!coordinates_1[i + 1] ? coordinates_1[i + 1] : coordinates_1[0])
                    ]);
                    return arr;
                }), []);
                // TODO: acos使わない奴に変える
                var deg = tuples.reduce((function (sum, _a) {
                    var ptA = _a[0], ptB = _a[1];
                    var vctA = [ptA.x - ptC_1.x, ptA.y - ptC_1.y];
                    var vctB = [ptB.x - ptC_1.x, ptB.y - ptC_1.y];
                    var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                    var absA = Math.sqrt(vctA.map(function (a) { return Math.pow(a, 2); }).reduce(function (a, b) { return a + b; }));
                    var absB = Math.sqrt(vctB.map(function (a) { return Math.pow(a, 2); }).reduce(function (a, b) { return a + b; }));
                    var rad = Math.acos(dotP / (absA * absB));
                    return sum + rad;
                }), 0);
                return deg / (2 * Math.PI) >= 1;
            default:
                console.warn("SurfaceTree.getRegion: unkown collision type:", _this.surfaceId, colId, name, collision);
                return false;
        }
    });
    if (hitCols.length > 0) {
        return hitCols[hitCols.length - 1].name;
    }
    return "";
}
exports.getRegion = getRegion;
