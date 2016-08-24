/*
 * surfaces.txt をパースして SurfaceTree 構造体を作る
 */
"use strict";
var SU = require("./SurfaceUtil");
var ST = require("./SurfaceTree");
var SY = require("surfaces_txt2yaml");
function loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(srfsTxt) {
    var _descript = srfsTxt.descript != null ? srfsTxt.descript : {};
    var _surfaces = srfsTxt.surfaces != null ? srfsTxt.surfaces : {};
    var _aliases = srfsTxt.aliases != null ? srfsTxt.aliases : {};
    return loadSurfaceDescript(_descript)
        .then(function (descript) {
        var surfaces = [];
        Object.keys(_surfaces).forEach(function (surfaceName) {
            // typoef is === number なら実体のあるサーフェス定義
            if (typeof _surfaces[surfaceName].is === "number") {
                var parents = [];
                if (Array.isArray(_surfaces[surfaceName].base)) {
                    // .append持ってるので継承
                    parents = _surfaces[surfaceName].base.map(function (parentName) { return _surfaces[parentName]; });
                }
                var srf = {};
                SU.extend.apply(SY, [true, srf, _surfaces[surfaceName]].concat(parents));
                loadSurfaceDefinition(srf)
                    .then(function (srfDef) { surfaces[_surfaces[surfaceName].is] = srfDef; })
                    .catch(console.warn.bind(console));
            }
        });
        return { descript: descript, surfaces: surfaces };
    }).then(function (_a) {
        var descript = _a.descript, surfaces = _a.surfaces;
        var aliases = [];
        Object.keys(_aliases).forEach(function (scope) {
            // scope: sakura, kero, char2... => 0, 1, 2
            var scopeID = SU.unscope(scope);
            aliases[scopeID] = _aliases[scope];
        });
        return { descript: descript, surfaces: surfaces, aliases: aliases };
    }).then(function (_a) {
        var descript = _a.descript, surfaces = _a.surfaces, aliases = _a.aliases;
        var that = new ST.SurfaceDefinitionTree(descript, surfaces, aliases);
        return Promise.resolve(that);
    });
}
exports.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml = loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml;
function loadSurfaceDescript(descript) {
    // collision-sort: string => collisionSort: boolean
    var collisionSort = descript["collision-sort"] === "ascend" ? "ascend"
        : descript["collision-sort"] === "descend" ? "descend"
            : "ascend";
    var animationSort = descript["animation-sort"] === "ascend" ? "ascend"
        : descript["animation-sort"] === "descend" ? "descend"
            : "ascend";
    var that = new ST.SurfaceDescript(collisionSort, animationSort);
    return Promise.resolve(that);
}
exports.loadSurfaceDescript = loadSurfaceDescript;
function loadSurfaceDefinition(srf) {
    var _points = srf.points;
    var _balloons = srf.balloons;
    var _elements = srf.elements;
    var _collisions = srf.regions;
    var _animations = srf.animations;
    var balloons = { char: [], offsetX: 0, offsetY: 0 };
    var points = { basepos: { x: null, y: null } };
    if (_points != null && _points.basepos != null) {
        if (typeof _points.basepos.x === "number") {
            points.basepos.x = _points.basepos.x;
        }
        if (typeof _points.basepos.y === "number") {
            points.basepos.y = _points.basepos.y;
        }
    }
    if (_balloons != null) {
        if (typeof _balloons.offsetx === "number") {
            balloons.offsetX = _balloons.offsetx;
        }
        if (typeof _balloons.offsety === "number") {
            balloons.offsetY = _balloons.offsety;
        }
        Object.keys(_balloons).filter(function (key) { return /sakura$|kero$|char\d+/.test(key); }).forEach(function (charName) {
            var charID = SU.unscope(charName);
            if (typeof _balloons[charName].offsetx === "number") {
                balloons.char[charID] = balloons.char[charID] != null ? balloons.char[charID] : { offsetX: 0, offsetY: 0 };
                balloons.char[charID].offsetX = _balloons[charName].offsetx;
            }
            if (typeof _balloons[charName].offsety === "number") {
                balloons.char[charID] = balloons.char[charID] != null ? balloons.char[charID] : { offsetX: 0, offsetY: 0 };
                balloons.char[charID].offsetY = _balloons[charName].offsety;
            }
        });
    }
    var elements = [];
    if (_elements != null) {
        Object.keys(_elements).forEach(function (id) {
            return loadSurfaceElement(_elements[id])
                .then(function (def) { elements[_elements[id].is] = def; })
                .catch(console.warn.bind(console));
        });
    }
    var collisions = [];
    if (_collisions != null) {
        Object.keys(_collisions).forEach(function (id) {
            return loadSurfaceCollision(_collisions[id])
                .then(function (def) { collisions[_collisions[id].is] = def; })
                .catch(console.warn.bind(console));
        });
    }
    var animations = [];
    if (_animations != null) {
        Object.keys(_animations).forEach(function (id) {
            return loadSurfaceAnimation(_animations[id])
                .then(function (def) { animations[_animations[id].is] = def; })
                .catch(console.warn.bind(console));
        });
    }
    var that = new ST.SurfaceDefinition(elements, collisions, animations, balloons, points);
    return Promise.resolve(that);
}
function loadSurfaceElement(elm) {
    if (!(typeof elm.file === "string" &&
        typeof elm.type === "string")) {
        console.warn("SurfaceTreeLoader.loadFromsurfacesTxt2Yaml: wrong parameters", elm);
        return Promise.reject(elm);
    }
    var file = elm.file;
    var type = elm.type;
    if (typeof elm.x === "number") {
        var x = elm.x;
    }
    else {
        var x = 0;
        console.warn("SurfaceTreeLoader.loadSurfaceElement: faileback to", x);
    }
    if (typeof elm.y === "number") {
        var y = elm.y;
    }
    else {
        var y = 0;
        console.warn("SurfaceTreeLoader.loadSurfaceElement: faileback to", y);
    }
    var that = new ST.SurfaceElement(type, file, x, y);
    return Promise.resolve(that);
}
exports.loadSurfaceElement = loadSurfaceElement;
function loadSurfaceCollision(collision) {
    switch (collision.type) {
        case "rect": return loadSurfaceCollisionRect(collision);
        case "circle": return loadSurfaceCollisionCircle(collision);
        case "ellipse": return loadSurfaceCollisionEllipse(collision);
        case "polygon": return loadSurfaceCollisionPolygon(collision);
        default:
            console.warn("SurfaceTreeLoader.loadSurfaceCollision: unknow collision type", collision.type, ", failback to rect");
            collision.type = "rect";
            return loadSurfaceCollisionRect(collision);
    }
}
exports.loadSurfaceCollision = loadSurfaceCollision;
function loadSurfaceCollisionRect(collision) {
    if (!(typeof collision.left === "number" &&
        typeof collision.top === "number" &&
        typeof collision.bottom === "number" &&
        typeof collision.right === "number")) {
        console.warn("SurfaceTreeLoader.loadSurfaceCollisionRect: unkown parameter", collision);
        return Promise.reject(collision);
    }
    var name = collision.name;
    var type = collision.type;
    var top = collision.top;
    var left = collision.left;
    var bottom = collision.bottom;
    var right = collision.right;
    var that = new ST.SurfaceCollisionRect(name, left, top, right, bottom);
    return Promise.resolve(that);
}
exports.loadSurfaceCollisionRect = loadSurfaceCollisionRect;
function loadSurfaceCollisionEllipse(a) {
    return loadSurfaceCollisionRect(a)
        .then(function (b) { return new ST.SurfaceCollisionEllipse(b.name, b.left, b.top, b.right, b.bottom); });
}
exports.loadSurfaceCollisionEllipse = loadSurfaceCollisionEllipse;
function loadSurfaceCollisionCircle(collision) {
    if (!(typeof collision.center_y === "number" &&
        typeof collision.center_y === "number" &&
        typeof collision.radius === "number")) {
        console.warn("SurfaceTreeLoader.loadSurfaceCollisionCircle: unkown parameter", collision);
        return Promise.reject(collision);
    }
    var name = collision.name;
    var type = collision.type;
    var centerX = collision.center_x;
    var centerY = collision.center_y;
    var radius = collision.radius;
    var that = new ST.SurfaceCollisionCircle(name, centerX, centerY, radius);
    return Promise.resolve(that);
}
exports.loadSurfaceCollisionCircle = loadSurfaceCollisionCircle;
function loadSurfaceCollisionPolygon(col) {
    var name = col.name;
    var type = col.type;
    var _coordinates = col.coordinates != null ? col.coordinates : [];
    if (_coordinates.length < 2) {
        console.warn("SurfaceTreeLoader.loadSurfaceCollisionPolygon: coordinates need more than 3", col);
        return Promise.reject(col);
    }
    if (_coordinates.every(function (o) { return typeof o.x !== "number" || typeof o.y !== "number"; })) {
        console.warn("SurfaceTreeLoader.loadSurfaceCollisionPolygon: coordinates has erro value", col);
        return Promise.reject(col);
    }
    var coordinates = _coordinates;
    var that = new ST.SurfaceCollisionPolygon(name, coordinates);
    return Promise.resolve(that);
}
exports.loadSurfaceCollisionPolygon = loadSurfaceCollisionPolygon;
function loadSurfaceAnimation(animation) {
    var _interval = typeof animation.interval === "string" ? animation.interval : "";
    var _option = typeof animation.option === "string" ? animation.option : "";
    var _regions = animation.regions != null ? animation.regions : {};
    var _patterns = animation.patterns != null ? animation.patterns : [];
    // animation*.option,* の展開
    // animation*.option,exclusive+background,(1,3,5)
    var _a = _option.split(","), __option = _a[0], opt_args = _a.slice(1);
    var _opt_args = opt_args.map(function (str) { return Number(str.replace("(", "").replace(")", "")); });
    var _options = _option.split("+");
    var options = _options.map(function (option) { return [option.trim(), _opt_args]; });
    // bind+sometimes+talk,3
    var _b = _interval.split(","), __interval = _b[0], int_args = _b.slice(1);
    var _int_args = int_args.map(function (str) { return Number(str); });
    var _intervals = __interval.split("+");
    var intervals = _intervals.map(function (interval) { return [interval.trim(), _int_args]; });
    var collisions = [];
    Object.keys(_regions).forEach(function (key) {
        loadSurfaceCollision(_regions[key])
            .then(function (col) { collisions[_regions[key].is] = col; })
            .catch(console.warn.bind(console));
    });
    var patterns = [];
    _patterns.forEach(function (pat, patId) {
        loadSurfaceAnimationPattern(pat)
            .then(function (pat) { patterns[patId] = pat; })
            .catch(console.warn.bind(console));
    });
    var that = new ST.SurfaceAnimation(intervals, options, collisions, patterns);
    return Promise.resolve(that);
}
exports.loadSurfaceAnimation = loadSurfaceAnimation;
function loadSurfaceAnimationPattern(pat) {
    var type = pat.type;
    var surface = pat.surface;
    var _a = (/(\d+)(?:\-(\d+))?/.exec(pat.wait) || ["", "0", ""]).slice(1).map(Number), a = _a[0], b = _a[1];
    if (!isFinite(a)) {
        if (!isFinite(b)) {
            console.warn("SurfaceTreeLoader.loadSurfaceAnimationPattern: cannot parse wait", pat, ", failback to", 0);
            a = b = 0;
        }
        else {
            console.warn("SurfaceTreeLoader.loadSurfaceAnimationPattern: cannot parse wait", a, ", failback to", b);
            a = b;
        }
    }
    var wait = isFinite(b)
        ? [a, b]
        : [a, a];
    var x = pat.x;
    var y = pat.y;
    if (pat["animation_ids"] != null && pat["animation_id"] != null) {
        console.warn("SurfaceTreeLoader.loadSurfaceAnimationPattern: something wrong", pat);
    }
    var animation_ids = Array.isArray(pat["animation_ids"])
        ? [Number(pat["animation_id"])]
        : pat["animation_ids"];
    var that = new ST.SurfaceAnimationPattern(type, surface, wait, x, y, animation_ids);
    return Promise.resolve(that);
}
exports.loadSurfaceAnimationPattern = loadSurfaceAnimationPattern;
