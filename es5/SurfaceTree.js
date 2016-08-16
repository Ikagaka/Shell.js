/// <reference path="../typings/index.d.ts"/>
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SU = require("./SurfaceUtil");
var $ = require("jquery");

var SurfaceDefinitionTree = function () {
    //regions: { [scopeID: number]: {[regionName: string]: ToolTipElement}; }; // 謎
    function SurfaceDefinitionTree() {
        _classCallCheck(this, SurfaceDefinitionTree);

        this.descript = new SurfaceDescript();
        this.surfaces = {};
        this.aliases = {};
    }

    _createClass(SurfaceDefinitionTree, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(srfsTxt) {
            var _this = this;

            var descript = srfsTxt.descript != null ? srfsTxt.descript : {};
            var surfaces = srfsTxt.surfaces != null ? srfsTxt.surfaces : {};
            var aliases = srfsTxt.aliases != null ? srfsTxt.aliases : {};
            new SurfaceDescript().loadFromsurfacesTxt2Yaml(descript).then(function (descriptDef) {
                _this.descript = descriptDef;
            }).catch(console.warn.bind(console));
            Object.keys(surfaces).forEach(function (surfaceName) {
                // typoef is === number なら実体のあるサーフェス定義
                if (typeof surfaces[surfaceName].is === "number") {
                    var parents = [];
                    if (Array.isArray(surfaces[surfaceName].base)) {
                        // .append持ってるので継承
                        parents = surfaces[surfaceName].base.map(function (parentName) {
                            return surfaces[parentName];
                        });
                    }
                    var srf = {};
                    $.extend.apply($, [true, srf, surfaces[surfaceName]].concat(parents));
                    new SurfaceDefinition().loadFromsurfacesTxt2Yaml(srf).then(function (srfDef) {
                        _this.surfaces[surfaces[surfaceName].is] = srfDef;
                    }).catch(console.warn.bind(console));
                }
            });
            Object.keys(aliases).forEach(function (scope) {
                // scope: sakura, kero, char2... => 0, 1, 2
                var scopeID = SU.unscope(scope);
                _this.aliases[scopeID] = aliases[scope];
            });
            return Promise.resolve(this);
        }
    }]);

    return SurfaceDefinitionTree;
}();

exports.SurfaceDefinitionTree = SurfaceDefinitionTree;

var SurfaceDescript = function () {
    function SurfaceDescript() {
        _classCallCheck(this, SurfaceDescript);

        this.collisionSort = "ascend";
        this.animationSort = "ascend";
    }

    _createClass(SurfaceDescript, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(descript) {
            // collision-sort: string => collisionSort: boolean
            if (descript["collision-sort"] != null) {
                this.collisionSort = descript["collision-sort"] === "ascend" ? "ascend" : descript["collision-sort"] === "descend" ? "descend" : (console.warn("SurfaceDescript#loadFromsurfacesTxt2Yaml: collision-sort ", descript["collision-sort"], "is not supported"), this.collisionSort);
            }
            if (descript["animation-sort"] != null) {
                this.animationSort = descript["animation-sort"] === "ascend" ? "ascend" : descript["animation-sort"] === "descend" ? "descend" : (console.warn("SurfaceDescript#loadFromsurfacesTxt2Yaml: animation-sort ", descript["animation-sort"], "is not supported"), this.animationSort);
            }
            return Promise.resolve(this);
        }
    }]);

    return SurfaceDescript;
}();

exports.SurfaceDescript = SurfaceDescript;

var SurfaceDefinition = function () {
    function SurfaceDefinition() {
        _classCallCheck(this, SurfaceDefinition);

        this.points = { basepos: { x: 0, y: 0 } };
        this.balloons = { char: {}, offsetX: 0, offsetY: 0 };
        this.elements = {};
        this.collisions = {};
        this.animations = {};
    }

    _createClass(SurfaceDefinition, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(srf) {
            var _this2 = this;

            var points = srf.points;
            var balloons = srf.balloons;
            var elements = srf.elements;
            var collisions = srf.regions;
            var animations = srf.animations;
            if (points != null && points.basepos != null) {
                if (typeof points.basepos.x === "number") {
                    this.points.basepos.x = points.basepos.x;
                }
                if (typeof points.basepos.y === "number") {
                    this.points.basepos.y = points.basepos.y;
                }
            }
            if (balloons != null) {
                if (typeof balloons.offsetx === "number") {
                    this.balloons.offsetX = balloons.offsetx;
                }
                if (typeof balloons.offsety === "number") {
                    this.balloons.offsetY = balloons.offsety;
                }
                Object.keys(balloons).filter(function (key) {
                    return (/sakura$|kero$|char\d+/.test(key)
                    );
                }).forEach(function (charName) {
                    var charID = SU.unscope(charName);
                    if (typeof balloons[charName].offsetx === "number") {
                        _this2.balloons.char[charID].offsetX = balloons[charName].offsetx;
                    }
                    if (typeof balloons[charName].offsety === "number") {
                        _this2.balloons.char[charID].offsetY = balloons[charName].offsety;
                    }
                });
            }
            if (elements != null) {
                Object.keys(elements).forEach(function (id) {
                    new SurfaceElement().loadFromsurfacesTxt2Yaml(elements[id]).then(function (def) {
                        _this2.elements[elements[id].is] = def;
                    }).catch(console.warn.bind(console));
                });
            }
            if (collisions != null) {
                Object.keys(collisions).forEach(function (id) {
                    new SurfaceCollision().loadFromsurfacesTxt2Yaml(collisions[id]).then(function (def) {
                        _this2.collisions[collisions[id].is] = def;
                    }).catch(console.warn.bind(console));
                });
            }
            if (animations != null) {
                Object.keys(animations).forEach(function (id) {
                    new SurfaceAnimation().loadFromsurfacesTxt2Yaml(animations[id]).then(function (def) {
                        _this2.animations[animations[id].is] = def;
                    }).catch(console.warn.bind(console));
                });
            }
            return Promise.resolve(this);
        }
    }]);

    return SurfaceDefinition;
}();

exports.SurfaceDefinition = SurfaceDefinition;

var SurfaceElement = function () {
    function SurfaceElement() {
        _classCallCheck(this, SurfaceElement);

        this.type = "overlay";
        this.file = "";
        this.x = 0;
        this.y = 0;
    }

    _createClass(SurfaceElement, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(elm) {
            if (!(typeof elm.file === "string" && typeof elm.type === "string")) {
                console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: wrong parameters", elm);
                return Promise.reject(elm);
            } else {
                this.file = elm.file;
                this.type = elm.type;
            }
            if (typeof elm.x === "number") {
                this.x = elm.x;
            } else {
                console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: faileback to", this.x);
            }
            if (typeof elm.y === "number") {
                this.x = elm.y;
            } else {
                console.warn("SurfaceElement#loadFromsurfacesTxt2Yaml: faileback to", this.y);
            }
            return Promise.resolve(this);
        }
    }]);

    return SurfaceElement;
}();

exports.SurfaceElement = SurfaceElement;

var SurfaceCollision = function () {
    function SurfaceCollision() {
        _classCallCheck(this, SurfaceCollision);

        this.name = "";
        this.type = "";
    }

    _createClass(SurfaceCollision, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(collision) {
            switch (collision.type) {
                case "rect":
                    return new SurfaceCollisionRect().loadFromsurfacesTxt2Yaml(collision);
                case "circle":
                    return new SurfaceCollisionCircle().loadFromsurfacesTxt2Yaml(collision);
                case "ellipse":
                    return new SurfaceCollisionEllipse().loadFromsurfacesTxt2Yaml(collision);
                case "polygon":
                    return new SurfaceCollisionPolygon().loadFromsurfacesTxt2Yaml(collision);
                default:
                    console.warn("SurfaceCollision#loadFromsurfacesTxt2Yaml: unknow collision type", collision.type, ", failback to rect");
                    this.type = "rect";
                    return new SurfaceCollisionRect().loadFromsurfacesTxt2Yaml(collision);
            }
        }
    }]);

    return SurfaceCollision;
}();

exports.SurfaceCollision = SurfaceCollision;

var SurfaceCollisionRect = function (_SurfaceCollision) {
    _inherits(SurfaceCollisionRect, _SurfaceCollision);

    function SurfaceCollisionRect() {
        _classCallCheck(this, SurfaceCollisionRect);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionRect).call(this));

        _this3.type = "rect";
        _this3.left = 0;
        _this3.top = 0;
        _this3.right = 0;
        _this3.bottom = 0;
        return _this3;
    }

    _createClass(SurfaceCollisionRect, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(collision) {
            this.name = collision.name;
            this.type = collision.type;
            if (!(typeof collision.left === "number" && typeof collision.top === "number" && typeof collision.bottom === "number" && typeof collision.right === "number")) {
                console.warn(this.constructor.toString(), "#loadFromsurfacesTxt2Yaml: unkown parameter", collision);
                return Promise.reject(collision);
            }
            this.top = collision.top;
            this.left = collision.left;
            this.bottom = collision.bottom;
            this.right = collision.right;
            return Promise.resolve(this);
        }
    }]);

    return SurfaceCollisionRect;
}(SurfaceCollision);

exports.SurfaceCollisionRect = SurfaceCollisionRect;

var SurfaceCollisionCircle = function (_SurfaceCollision2) {
    _inherits(SurfaceCollisionCircle, _SurfaceCollision2);

    function SurfaceCollisionCircle() {
        _classCallCheck(this, SurfaceCollisionCircle);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionCircle).call(this));

        _this4.type = "circle";
        _this4.centerX = 0;
        _this4.centerY = 0;
        _this4.radius = 0;
        return _this4;
    }

    _createClass(SurfaceCollisionCircle, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(collision) {
            this.name = collision.name;
            this.type = collision.type;
            if (!(typeof collision.center_y === "number" && typeof collision.center_y === "number" && typeof collision.radius === "number")) {
                console.warn("SurfaceCollisionCircle#loadFromsurfacesTxt2Yaml: unkown parameter", collision);
                return Promise.reject(collision);
            }
            this.centerX = collision.center_x;
            this.centerY = collision.center_y;
            this.radius = collision.radius;
            return Promise.resolve(this);
        }
    }]);

    return SurfaceCollisionCircle;
}(SurfaceCollision);

exports.SurfaceCollisionCircle = SurfaceCollisionCircle;

var SurfaceCollisionEllipse = function (_SurfaceCollisionRect) {
    _inherits(SurfaceCollisionEllipse, _SurfaceCollisionRect);

    function SurfaceCollisionEllipse() {
        _classCallCheck(this, SurfaceCollisionEllipse);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionEllipse).call(this));

        _this5.type = "ellipse";
        return _this5;
    }

    return SurfaceCollisionEllipse;
}(SurfaceCollisionRect);

exports.SurfaceCollisionEllipse = SurfaceCollisionEllipse;

var SurfaceCollisionPolygon = function (_SurfaceCollision3) {
    _inherits(SurfaceCollisionPolygon, _SurfaceCollision3);

    function SurfaceCollisionPolygon() {
        _classCallCheck(this, SurfaceCollisionPolygon);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceCollisionPolygon).call(this));

        _this6.type = "polygon";
        _this6.coordinates = [];
        return _this6;
    }

    _createClass(SurfaceCollisionPolygon, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(col) {
            this.name = col.name;
            this.type = col.type;
            var coordinates = col.coordinates != null ? col.coordinates : [];
            if (coordinates.length < 2) {
                console.warn("SurfaceRegionPolygon#loadFromsurfacesTxt2Yaml: coordinates need more than 3", col);
                return Promise.reject(col);
            }
            if (coordinates.every(function (o) {
                return typeof o.x === "number" && typeof o.x === "number";
            })) {
                console.warn("SurfaceRegionPolygon#loadFromsurfacesTxt2Yaml: coordinates has erro value", col);
                return Promise.reject(col);
            }
            this.coordinates = coordinates;
            return Promise.resolve(this);
        }
    }]);

    return SurfaceCollisionPolygon;
}(SurfaceCollision);

exports.SurfaceCollisionPolygon = SurfaceCollisionPolygon;

var SurfaceAnimation = function () {
    function SurfaceAnimation() {
        _classCallCheck(this, SurfaceAnimation);

        this.intervals = [["never", []]];
        this.options = [];
        this.collisions = {};
        this.patterns = {};
    }

    _createClass(SurfaceAnimation, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(animation) {
            var _this7 = this;

            var interval = typeof animation.interval === "string" ? animation.interval : "";
            var option = typeof animation.option === "string" ? animation.option : "";
            var regions = animation.regions != null ? animation.regions : {};
            var patterns = animation.patterns != null ? animation.patterns : [];
            // animation*.option,* の展開
            // animation*.option,exclusive+background,(1,3,5)

            var _option$split = option.split(",");

            var _option$split2 = _toArray(_option$split);

            var _option = _option$split2[0];

            var opt_args = _option$split2.slice(1);

            var _opt_args = opt_args.map(function (str) {
                return str.replace("(", "").replace(")", "").trim();
            });
            var options = option.split("+");
            this.options = options.map(function (option) {
                return [option.trim(), _opt_args];
            });
            // bind+sometimes+talk,3

            var _interval$split = interval.split(",");

            var _interval$split2 = _toArray(_interval$split);

            var _interval = _interval$split2[0];

            var int_args = _interval$split2.slice(1);

            var _int_args = int_args.map(function (str) {
                return str.trim();
            });
            var intervals = _interval.split("+");
            this.intervals = intervals.map(function (interval) {
                return [interval.trim(), _int_args];
            });
            Object.keys(regions).forEach(function (key) {
                new SurfaceCollision().loadFromsurfacesTxt2Yaml(regions[key]).then(function (col) {
                    _this7.collisions[regions[key].is] = col;
                }).catch(console.warn.bind(console));
            });
            patterns.forEach(function (pat, patId) {
                new SurfaceAnimationPattern().loadFromsurfacesTxt2Yaml(pat).then(function (pat) {
                    _this7.patterns[patId] = pat;
                }).catch(console.warn.bind(console));
            });
            return Promise.resolve(this);
        }
    }]);

    return SurfaceAnimation;
}();

exports.SurfaceAnimation = SurfaceAnimation;

var SurfaceAnimationPattern = function () {
    function SurfaceAnimationPattern() {
        _classCallCheck(this, SurfaceAnimationPattern);

        this.type = "ovelay";
        this.surface = -1;
        this.wait = [0, 0];
        this.x = 0;
        this.y = 0;
        this.animation_ids = [];
    }

    _createClass(SurfaceAnimationPattern, [{
        key: "loadFromsurfacesTxt2Yaml",
        value: function loadFromsurfacesTxt2Yaml(pat) {
            this.type = pat.type;
            this.surface = pat.surface;

            var _slice$map = (/(\d+)(?:\-(\d+))?/.exec(pat.wait) || ["", "0", ""]).slice(1).map(Number);

            var _slice$map2 = _slicedToArray(_slice$map, 2);

            var a = _slice$map2[0];
            var b = _slice$map2[1];

            if (!isFinite(a)) {
                if (!isFinite(b)) {
                    console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: cannot parse wait", pat, ", failback to", 0);
                    a = b = 0;
                } else {
                    console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: cannot parse wait", a, ", failback to", b);
                    a = b;
                }
            }
            this.wait = isFinite(b) ? [a, b] : [a, a];
            this.x = pat.x;
            this.y = pat.y;
            if (pat["animation_ids"] != null && pat["animation_id"] != null) {
                console.warn("SurfaceAnimationPattern#loadFromsurfacesTxt2Yaml: something wrong", pat);
            }
            if (Array.isArray(pat["animation_ids"])) {
                this.animation_ids = pat["animation_ids"];
            } else if (isFinite(Number(pat["animation_id"]))) {
                this.animation_ids = [Number(pat["animation_id"])];
            }
            return Promise.resolve(this);
        }
    }]);

    return SurfaceAnimationPattern;
}();

exports.SurfaceAnimationPattern = SurfaceAnimationPattern;