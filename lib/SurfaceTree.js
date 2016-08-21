"use strict";
/*
 * surfaces.txt の内容を構造化したもの
 */
class SurfaceDefinitionTree {
    //regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
    constructor(descript = new SurfaceDescript(), surfaces = [], aliases = []) {
        this.descript = descript;
        this.surfaces = surfaces;
        this.aliases = aliases;
    }
}
exports.SurfaceDefinitionTree = SurfaceDefinitionTree;
class SurfaceDescript {
    constructor(collisionSort = "ascend", animationSort = "ascend") {
        this.collisionSort = collisionSort;
        this.animationSort = animationSort;
    }
}
exports.SurfaceDescript = SurfaceDescript;
class SurfaceDefinition {
    constructor(elements = [], collisions = [], animations = [], balloons = { char: [], offsetX: 0, offsetY: 0 }, points = { basepos: { x: 0, y: 0 } }) {
        this.elements = elements;
        this.collisions = collisions;
        this.animations = animations;
        this.points = points;
        this.balloons = balloons;
    }
}
exports.SurfaceDefinition = SurfaceDefinition;
class SurfaceElement {
    constructor(type = "overlay", file = "", x = 0, y = 0) {
        this.type = "overlay";
        this.file = file;
        this.x = x;
        this.y = y;
    }
}
exports.SurfaceElement = SurfaceElement;
class SurfaceCollision {
    constructor(name = "", type = "rect") {
        this.name = name;
        this.type = type;
    }
}
exports.SurfaceCollision = SurfaceCollision;
class SurfaceCollisionRect extends SurfaceCollision {
    constructor(name = "", type = "rect", left = 0, top = 0, right = 0, bottom = 0) {
        super(name, type);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}
exports.SurfaceCollisionRect = SurfaceCollisionRect;
class SurfaceCollisionEllipse extends SurfaceCollisionRect {
    constructor(name = "", type = "ellipse", top = 0, bottom = 0, left = 0, right = 0) {
        super(name, type, bottom, top, left, right);
    }
}
exports.SurfaceCollisionEllipse = SurfaceCollisionEllipse;
class SurfaceCollisionCircle extends SurfaceCollision {
    constructor(name = "", type = "circle", centerX = 0, centerY = 0, radius = 0) {
        super(name, type);
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
    }
}
exports.SurfaceCollisionCircle = SurfaceCollisionCircle;
class SurfaceCollisionPolygon extends SurfaceCollision {
    constructor(name = "", type = "polygon", coordinates = []) {
        super(name, type);
        this.coordinates = coordinates;
    }
}
exports.SurfaceCollisionPolygon = SurfaceCollisionPolygon;
class SurfaceAnimation {
    constructor(intervals = [["never", []]], options = [], collisions = [], patterns = []) {
        this.intervals = intervals;
        this.options = options;
        this.collisions = collisions;
        this.patterns = patterns;
    }
}
exports.SurfaceAnimation = SurfaceAnimation;
class SurfaceAnimationPattern {
    constructor(type = "ovelay", surface = -1, wait = [0, 0], x = 0, y = 0, animation_ids = []) {
        this.type = type;
        this.surface = surface;
        this.wait = wait;
        this.x = x;
        this.y = y;
        this.animation_ids = animation_ids;
    }
}
exports.SurfaceAnimationPattern = SurfaceAnimationPattern;
function isBack(anim) {
    return anim.options.some(([opt, args]) => opt === "background");
}
exports.isBack = isBack;
function getExclusives(anim) {
    return anim.options.filter(([opt, args]) => opt === "exclusive").reduce((l, [opt, args]) => l.concat(args), []);
}
exports.getExclusives = getExclusives;
