(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Shell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Surface = require('./Surface');

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var Shell = (function (_EventEmitter2) {
    _inherits(Shell, _EventEmitter2);

    function Shell(directory) {
        _classCallCheck(this, Shell);

        _get(Object.getPrototypeOf(Shell.prototype), "constructor", this).call(this);
        EventEmitter2.call(this);
        this.directory = directory;
        this.attachedSurface = [];
        this.surfacesTxt = {};
        this.surfaceTree = [];
        this.cacheCanvas = {};
        this.bindgroup = [];
        this.enableRegionDraw = false;
    }

    _createClass(Shell, [{
        key: "load",
        value: function load() {
            var _this = this;

            return Promise.resolve(this).then(function () {
                return _this.loadDescript();
            }) // 1st // ←なにこれ（自問自答
            .then(function () {
                return _this.loadBindGroup();
            }) // 2nd
            .then(function () {
                return _this.loadSurfacesTxt();
            }) // 1st
            .then(function () {
                return _this.loadSurfaceTable();
            }) // 1st
            .then(function () {
                return _this.loadSurfacePNG();
            }) // 2nd
            .then(function () {
                return _this.loadCollisions();
            }) // 3rd
            .then(function () {
                return _this.loadAnimations();
            }) // 3rd
            .then(function () {
                return _this.loadElements();
            }) // 3rd
            ["catch"](function (err) {
                console.error("Shell#load > ", err);
                return Promise.reject(err);
            });
        }

        // load descript and assign to this.descript
    }, {
        key: "loadDescript",
        value: function loadDescript() {
            var dir = this.directory;
            var getName = function getName(dic, reg) {
                return Object.keys(dic).filter(function (name) {
                    return reg.test(name);
                })[0] || "";
            };
            var descript_name = getName(dir, /^descript\.txt$/i);
            if (descript_name === "") {
                console.warn("descript.txt is not found");
            } else {
                this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
            }
            return Promise.resolve(this);
        }

        // load bindgroup and assign to this.bindgroup
    }, {
        key: "loadBindGroup",
        value: function loadBindGroup() {
            var _this2 = this;

            var descript = this.descript;
            var grep = function grep(dic, reg) {
                return Object.keys(dic).filter(function (key) {
                    return reg.test(key);
                });
            };
            var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)\.default/;
            grep(descript, reg).forEach(function (key) {
                var _reg$exec = reg.exec(key);

                var _reg$exec2 = _slicedToArray(_reg$exec, 3);

                var _ = _reg$exec2[0];
                var charId = _reg$exec2[1];
                var bindgroupId = _reg$exec2[2];

                var _charId = charId === "sakura" ? "0" : "kero" ? "1" : (/char(\d+)/.exec(charId) || ["", Number.NaN])[1];
                var maybeNumCharId = Number(_charId);
                var maybeNumBindgroupId = Number(bindgroupId);
                var maybeNumBool = Number(descript[key]);
                if (isFinite(maybeNumCharId) && isFinite(maybeNumBindgroupId)) {
                    _this2.bindgroup[maybeNumCharId] = _this2.bindgroup[maybeNumCharId] || [];
                    _this2.bindgroup[maybeNumCharId][maybeNumBindgroupId] = maybeNumBool === 1 ? true : false;
                } else {
                    console.warn("CharId: " + _charId + " or bindgroupId: " + bindgroupId + " is not number");
                }
            });
            return Promise.resolve(this);
        }

        // load surfaces.txt
    }, {
        key: "loadSurfacesTxt",
        value: function loadSurfacesTxt() {
            var _this3 = this;

            var surfaces_text_names = Object.keys(this.directory).filter(function (name) {
                return (/^surfaces.*\.txt$|^alias\.txt$/i.test(name)
                );
            });
            if (surfaces_text_names.length === 0) {
                console.info("surfaces.txt is not found");
            } else {
                surfaces_text_names.forEach(function (filename) {
                    var text = SurfaceUtil.convert(_this3.directory[filename]);
                    var srfs = SurfacesTxt2Yaml.txt_to_data(text, { compatible: 'ssp-lazy' });
                    SurfaceUtil.extend(_this3.surfacesTxt, srfs);
                });
                //{ expand inherit and remove
                Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                    if (typeof _this3.surfacesTxt.surfaces[name].is === "number" && Array.isArray(_this3.surfacesTxt.surfaces[name].base)) {
                        _this3.surfacesTxt.surfaces[name].base.forEach(function (key) {
                            SurfaceUtil.extend(_this3.surfacesTxt.surfaces[name], _this3.surfacesTxt.surfaces[key]);
                        });
                        delete _this3.surfacesTxt.surfaces[name].base;
                    }
                });
                Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                    if (typeof _this3.surfacesTxt.surfaces[name].is === "undefined") {
                        delete _this3.surfacesTxt.surfaces[name];
                    }
                });
            }
            return Promise.resolve(this);
        }

        // load surfacetable.txt
    }, {
        key: "loadSurfaceTable",
        value: function loadSurfaceTable() {
            var surfacetable_name = Object.keys(this.directory).filter(function (name) {
                return (/^surfacetable.*\.txt$/i.test(name)
                );
            })[0] || "";
            if (surfacetable_name === "") {
                console.info("surfacetable.txt is not found.");
            } else {
                var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
            }
            return Promise.resolve(this);
        }

        // load surface*.png and surface*.pna
    }, {
        key: "loadSurfacePNG",
        value: function loadSurfacePNG() {
            var _this4 = this;

            var surface_names = Object.keys(this.directory).filter(function (filename) {
                return (/^surface(\d+)\.png$/i.test(filename)
                );
            });
            var prms = surface_names.map(function (filename) {
                var n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
                return _this4.getPNGFromDirectory(filename).then(function (cnv) {
                    if (!_this4.surfaceTree[n]) {
                        _this4.surfaceTree[n] = {
                            base: cnv,
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    } else {
                        _this4.surfaceTree[n].base = cnv;
                    }
                })["catch"](function (err) {
                    console.warn("Shell#loadSurfacePNG > " + err);
                    return Promise.resolve();
                });
            });
            return Promise.all(prms).then(function () {
                return Promise.resolve(_this4);
            });
        }

        // load elements
    }, {
        key: "loadElements",
        value: function loadElements() {
            var _this5 = this;

            var srfs = this.surfacesTxt.surfaces;
            var hits = Object.keys(srfs).filter(function (name) {
                return !!srfs[name].elements;
            });
            var prms = hits.map(function (defname) {
                var n = srfs[defname].is;
                var elms = srfs[defname].elements;
                var _prms = Object.keys(elms).map(function (elmname) {
                    var _elms$elmname = elms[elmname];
                    var is = _elms$elmname.is;
                    var type = _elms$elmname.type;
                    var file = _elms$elmname.file;
                    var x = _elms$elmname.x;
                    var y = _elms$elmname.y;

                    return _this5.getPNGFromDirectory(file).then(function (canvas) {
                        if (!_this5.surfaceTree[n]) {
                            _this5.surfaceTree[n] = {
                                base: SurfaceUtil.createCanvas(),
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        }
                        _this5.surfaceTree[n].elements[is] = { type: type, canvas: canvas, x: x, y: y };
                        return Promise.resolve(_this5);
                    })["catch"](function (err) {
                        console.warn("Shell#loadElements > " + err);
                        return Promise.resolve(_this5);
                    });
                });
                return Promise.all(_prms).then(function () {
                    return Promise.resolve(_this5);
                });
            });
            return Promise.all(prms).then(function () {
                return Promise.resolve(_this5);
            });
        }

        // load collisions
    }, {
        key: "loadCollisions",
        value: function loadCollisions() {
            var _this6 = this;

            var srfs = this.surfacesTxt.surfaces;
            Object.keys(srfs).filter(function (name) {
                return !!srfs[name].regions;
            }).forEach(function (defname) {
                var n = srfs[defname].is;
                var regions = srfs[defname].regions;
                Object.keys(regions).forEach(function (regname) {
                    if (!_this6.surfaceTree[n]) {
                        _this6.surfaceTree[n] = {
                            base: SurfaceUtil.createCanvas(),
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    }
                    var is = regions[regname].is;

                    _this6.surfaceTree[n].collisions[is] = regions[regname];
                });
            });
            return Promise.resolve(this);
        }

        // load animations
    }, {
        key: "loadAnimations",
        value: function loadAnimations() {
            var _this7 = this;

            var srfs = this.surfacesTxt.surfaces;
            Object.keys(srfs).filter(function (name) {
                return !!srfs[name].animations;
            }).forEach(function (defname) {
                var n = srfs[defname].is;
                var animations = srfs[defname].animations;
                Object.keys(animations).forEach(function (animname) {
                    if (!_this7.surfaceTree[n]) {
                        _this7.surfaceTree[n] = {
                            base: SurfaceUtil.createCanvas(),
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    }
                    var _animations$animname = animations[animname];
                    var is = _animations$animname.is;
                    var interval = _animations$animname.interval;

                    _this7.surfaceTree[n].animations[is] = animations[animname];
                });
            });
            return Promise.resolve(this);
        }
    }, {
        key: "hasFile",
        value: function hasFile(filename) {
            return SurfaceUtil.find(Object.keys(this.directory), filename).length > 0;
        }
    }, {
        key: "getPNGFromDirectory",
        value: function getPNGFromDirectory(filename) {
            var _this8 = this;

            var cached_filename = SurfaceUtil.find(Object.keys(this.cacheCanvas), filename)[0] || "";
            if (cached_filename !== "") {
                return Promise.resolve(this.cacheCanvas[cached_filename]);
            }
            if (!this.hasFile(filename)) {
                filename += ".png";
                if (!this.hasFile(filename)) {
                    return Promise.reject(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")));
                }
                console.warn("element file " + filename + " need '.png' extension");
            }
            var _filename = SurfaceUtil.find(Object.keys(this.directory), filename)[0];
            var pnafilename = _filename.replace(/\.png$/i, ".pna");
            var _pnafilename = SurfaceUtil.find(Object.keys(this.directory), pnafilename)[0] || "";
            var pngbuf = this.directory[_filename];
            var pnabuf = this.directory[_pnafilename];
            var render = new _SurfaceRender.SurfaceRender(SurfaceUtil.createCanvas());
            return SurfaceUtil.fetchImageFromArrayBuffer(pngbuf).then(function (img) {
                render.init(img);
                if (_pnafilename === "") {
                    render.chromakey();
                    _this8.cacheCanvas[_filename] = render.cnv;
                    return render.cnv;
                }
                return SurfaceUtil.fetchImageFromArrayBuffer(pnabuf).then(function (pnaimg) {
                    render.pna(SurfaceUtil.copy(pnaimg));
                    _this8.cacheCanvas[_filename] = render.cnv;
                    return render.cnv;
                });
            });
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(canvas, scopeId, surfaceId) {
            var type = SurfaceUtil.scope(scopeId);
            if (typeof surfaceId === "string") {
                if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                    var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
                } else throw new Error("ReferenceError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
            } else if (typeof surfaceId === "number") {
                var _surfaceId = surfaceId;
            } else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
            var hits = this.attachedSurface.filter(function (_ref) {
                var _canvas = _ref.canvas;
                return _canvas === canvas;
            });
            if (hits.length !== 0) throw new Error("ReferenceError: this HTMLCanvasElement is already attached");
            if (scopeId < 0) {
                throw new Error("TypeError: scopeId needs more than 0, but:" + scopeId);
            }
            if (!this.surfaceTree[surfaceId]) {
                console.warn("surfaceId:", surfaceId, "is not defined");
                return null;
            }
            var srf = new _Surface.Surface(canvas, scopeId, _surfaceId, this);
            this.attachedSurface.push({ canvas: canvas, surface: srf });
            return srf;
        }
    }, {
        key: "detachSurface",
        value: function detachSurface(canvas) {
            var hits = this.attachedSurface.filter(function (_ref2) {
                var _canvas = _ref2.canvas;
                return _canvas === canvas;
            });
            if (hits.length === 0) return;
            hits[0].surface.destructor();
            this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
        }
    }, {
        key: "unload",
        value: function unload() {
            var _this9 = this;

            this.attachedSurface.forEach(function (_ref3) {
                var canvas = _ref3.canvas;
                var surface = _ref3.surface;

                surface.destructor();
            });
            this.removeAllListeners();
            Object.keys(this).forEach(function (key) {
                _this9[key] = new _this9[key].constructor();
            });
        }
    }, {
        key: "hasSurface",
        value: function hasSurface(scopeId, surfaceId) {
            var type = SurfaceUtil.scope(scopeId);
            if (typeof surfaceId === "string") {
                if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                    var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
                } else {
                    throw new Error("RuntimeError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
                }
            } else if (typeof surfaceId === "number") {
                var _surfaceId = surfaceId;
            } else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
            return this.surfaceTree[_surfaceId] != null;
        }

        // 着せ替えオン
    }, {
        key: "bind",
        value: function bind(scopeId, bindgroupId) {
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = true;
            this.attachedSurface.forEach(function (_ref4) {
                var srf = _ref4.surface;
                var canvas = _ref4.canvas;

                srf.updateBind();
            });
        }

        // 着せ替えオフ
    }, {
        key: "unbind",
        value: function unbind(scopeId, bindgroupId) {
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = false;
            this.attachedSurface.forEach(function (_ref5) {
                var srf = _ref5.surface;
                var canvas = _ref5.canvas;

                srf.updateBind();
            });
        }

        // 強制再描画
    }, {
        key: "render",
        value: function render() {
            this.attachedSurface.forEach(function (_ref6) {
                var srf = _ref6.surface;
                var canvas = _ref6.canvas;

                srf.render();
            });
        }
    }]);

    return Shell;
})(EventEmitter2);

exports.Shell = Shell;
},{"./Surface":2,"./SurfaceRender":3,"./SurfaceUtil":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var $ = jQuery;

var Surface = (function (_EventEmitter2) {
    _inherits(Surface, _EventEmitter2);

    function Surface(canvas, scopeId, surfaceId, shell) {
        _classCallCheck(this, Surface);

        _get(Object.getPrototypeOf(Surface.prototype), "constructor", this).call(this);
        EventEmitter2.call(this);
        // public
        this.element = canvas;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.destructed = false;
        // private
        this.surfaceResources = shell.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.bufRender = new _SurfaceRender.SurfaceRender(this.bufferCanvas);
        this.elmRender = new _SurfaceRender.SurfaceRender(this.element);
        this.destructors = [];
        this.layers = {};
        this.stopFlags = {};
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = [];
        // initialize methods
        this.initMouseEvent();
        this.initAnimations();
        this.render();
    }

    // public methods

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            var _this = this;

            this.destructor = function () {
                return console.warn("this surface already destructed", _this);
            };
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.elmRender.clear();
            this.destructed = true;
            // これ以後のsetTimeoutトリガーのアニメーションを表示しない保険
            this.element = document.createElement("canvas");
            this.elmRender = new _SurfaceRender.SurfaceRender(this.element);
            this.layers = {};
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            // this.layersが数字をキーとした辞書なのでレイヤー順にソート
            var sorted = Object.keys(this.layers).sort(function (layerNumA, layerNumB) {
                return Number(layerNumA) > Number(layerNumB) ? 1 : -1;
            });
            var renderLayers = sorted.map(function (key) {
                return _this2.layers[Number(key)];
            }).reduce(function (arr, pattern) {
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface === -1) return arr; // idが-1つまり非表示指定
                var srf = _this2.shell.surfaceTree[surface];
                if (srf == null) {
                    console.warn("Surface#render: surface id " + surface + " is not defined.", pattern);
                    console.warn(surface, Object.keys(_this2.shell.surfaceTree));
                    return arr; // 対象サーフェスがないのでスキップ
                }
                var base = srf.base;
                var elements = srf.elements;

                // 対象サーフェスのbaseサーフェス(surface*.png)の上に
                var rndr = new _SurfaceRender.SurfaceRender(SurfaceUtil.copy(base));
                // elementを合成する
                rndr.composeElements(elements);
                return arr.concat({
                    type: type,
                    x: x,
                    y: y,
                    canvas: rndr.cnv
                });
            }, []);
            var srfNode = this.surfaceResources;
            // this.surfaceIdが持つ情報。型をみて。
            this.bufRender.init(srfNode.base); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            this.bufRender.composeElements(srfNode.elements); // ベースサーフェスの上にエレメントを合成
            this.bufRender.composeElements(renderLayers); //現在有効なアニメーションのレイヤを合成
            if (this.shell.enableRegionDraw) {
                this.bufRender.ctx.fillText("" + this.surfaceId, 5, 10);
                this.bufRender.drawRegions(srfNode.collisions);
            }
            this.elmRender.init(this.bufRender.cnv); //バッファから実DOMTree上のcanvasへ描画
        }
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this3 = this;

            var anims = this.surfaceResources.animations;
            var anim = this.surfaceResources.animations[animationId];
            if (!anim) return void setTimeout(callback);
            this.stopFlags[animationId] = false;
            this.animationsQueue[animationId] = anim.patterns.map(function (pattern) {
                return function () {
                    var surface = pattern.surface;
                    var wait = pattern.wait;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;
                    var animation_ids = pattern.animation_ids;

                    switch (type) {
                        case "start":
                            _this3.play(animation_ids[0], nextTick);
                            return;
                        case "stop":
                            _this3.stop(animation_ids[0]);
                            setTimeout(nextTick);
                            return;
                        case "alternativestart":
                            _this3.play(SurfaceUtil.choice(animation_ids), nextTick);
                            return;
                        case "alternativestart":
                            _this3.stop(SurfaceUtil.choice(animation_ids));
                            setTimeout(nextTick);
                            return;
                    }
                    _this3.layers[animationId] = pattern;
                    _this3.render();

                    var _ref = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                    var _ref2 = _slicedToArray(_ref, 3);

                    var __ = _ref2[0];
                    var a = _ref2[1];
                    var b = _ref2[2];

                    var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                    setTimeout(nextTick, _wait);
                };
            });
            var nextTick = function nextTick() {
                var next = _this3.animationsQueue[animationId].shift();
                if (!(next instanceof Function) || _this3.destructed || !!_this3.stopFlags[animationId]) {
                    // stop pattern animation.
                    _this3.animationsQueue[animationId] = [];
                    setTimeout(callback);
                } else next();
            };
            this.animationsQueue[animationId][0] instanceof Function && this.animationsQueue[animationId][0]();
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            this.stopFlags[animationId] = true;
            this.animationsQueue[animationId] = [];
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this4 = this;

            var animations = this.surfaceResources.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim) {
                return (/^talk/.test(anim.interval) && _this4.talkCount % _this4.talkCounts[anim.is] === 0
                );
            });
            hits.forEach(function (anim) {
                _this4.play(anim.is);
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this5 = this;

            var animations = this.surfaceResources.animations;
            var hits = animations.filter(function (anim) {
                return anim.interval === "yen-e" && _this5.talkCount % _this5.talkCounts[anim.is] === 0;
            });
            hits.forEach(function (anim) {
                _this5.play(anim.is);
            });
        }

        // private methods
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this6 = this;

            this.initMouseEvent = function () {
                console.warn("initMouseEvent allows only first call. this call is second call.");
            };
            // 副作用あり
            var $elm = $(this.element);
            var tid = 0;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            tuples.push(["contextmenu", function (ev) {
                return _this6.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["click", function (ev) {
                return _this6.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["dblclick", function (ev) {
                return _this6.processMouseEvent(ev, "mousedblclick");
            }]);
            tuples.push(["mousedown", function (ev) {
                return _this6.processMouseEvent(ev, "mousedown");
            }]);
            tuples.push(["mousemove", function (ev) {
                return _this6.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["mouseup", function (ev) {
                return _this6.processMouseEvent(ev, "mouseup");
            }]);
            tuples.push(["touchmove", function (ev) {
                return _this6.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["touchend", function (ev) {
                _this6.processMouseEvent(ev, "mouseup");
                _this6.processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    // ダブルタップ->ダブルクリック変換
                    _this6.processMouseEvent(ev, "mousedblclick");
                }
            }]);
            tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                _this6.processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(function () {
                    return touchCount = 0;
                }, 500);
            }]);
            // イベント登録
            tuples.forEach(function (_ref3) {
                var _ref32 = _slicedToArray(_ref3, 2);

                var ev = _ref32[0];
                var handler = _ref32[1];
                return $elm.on(ev, handler);
            });
            this.destructors.push(function () {
                // イベント解除
                tuples.forEach(function (_ref4) {
                    var _ref42 = _slicedToArray(_ref4, 2);

                    var ev = _ref42[0];
                    var handler = _ref42[1];
                    return $elm.off(ev, handler);
                });
            });
        }
    }, {
        key: "initAnimations",
        value: function initAnimations() {
            var _this7 = this;

            this.initAnimations = function () {
                console.warn("initAnimations allows only first call. this call is second call.");
            };
            // 副作用あり
            // このサーフェスのアニメーションを登録する
            this.surfaceResources.animations.forEach(function (anim) {
                _this7.initAnimation(anim);
            });
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(anim) {
            var _this8 = this;

            // 副作用あり
            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
            var tmp = interval.split(",");
            var _interval = tmp[0];
            if (tmp.length > 1) {
                var n = Number(tmp[1]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4; // rarelyにfaileback
                }
            }
            // アニメーション描画タイミングの登録
            switch (_interval) {
                // nextTickを呼ぶともう一回random
                case "sometimes":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this8.destructed && !_this8.stopFlags[animId]) {
                            _this8.play(animId, nextTick);
                        }
                    }, 2);
                    break;
                case "rarely":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this8.destructed && !_this8.stopFlags[animId]) {
                            _this8.play(animId, nextTick);
                        }
                    }, 4);
                    break;
                case "random":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this8.destructed && !_this8.stopFlags[animId]) {
                            _this8.play(animId, nextTick);
                        }
                    }, n);
                    break;
                case "periodic":
                    SurfaceUtil.periodic(function (nextTick) {
                        if (!_this8.destructed && !_this8.stopFlags[animId]) {
                            _this8.play(animId, nextTick);
                        }
                    }, n);
                    break;
                case "always":
                    SurfaceUtil.always(function (nextTick) {
                        if (!_this8.destructed && !_this8.stopFlags[animId]) {
                            _this8.play(animId, nextTick);
                        }
                    });
                    break;
                case "runonce":
                    this.play(animId);
                    break;
                case "never":
                    break;
                case "yen-e":
                    break;
                case "talk":
                    this.talkCounts[animId] = n;
                    break;
                default:
                    if (/^bind/.test(interval)) {
                        this.initBind(anim);
                        break;
                    }
                    console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
            }
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this9 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれるようだ
            this.surfaceResources.animations.forEach(function (anim) {
                var is = anim.is;
                var interval = anim.interval;
                var patterns = anim.patterns;

                if (/^bind/.test(interval)) {
                    _this9.initBind(anim);
                }
            });
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this10 = this;

            // kyuu ni nihongo utenaku natta.
            // initAnimation calls this method for animation interval type "bind".
            // updateBind calls this method.
            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            if (!this.shell.bindgroup[this.scopeId][is]) {
                delete this.layers[is];
                this.stop(is);
                return;
            }

            var _interval$split = interval.split("+");

            var _interval$split2 = _toArray(_interval$split);

            var _bind = _interval$split2[0];

            var intervals = _interval$split2.slice(1);

            if (intervals.length > 0) return;
            intervals.forEach(function (itvl) {
                _this10.initAnimation({ interval: itvl, is: is, patterns: patterns, option: option });
            });
            this.layers[is] = patterns[patterns.length - 1];
            this.render();
        }
    }, {
        key: "getRegion",
        value: function getRegion(offsetX, offsetY) {
            var _this11 = this;

            // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
            // 副作用なし
            if (SurfaceUtil.isHit(this.element, offsetX, offsetY)) {
                var hitCols = this.surfaceResources.collisions.filter(function (collision, colId) {
                    var type = collision.type;
                    var name = collision.name;
                    var left = collision.left;
                    var top = collision.top;
                    var right = collision.right;
                    var bottom = collision.bottom;
                    var coordinates = collision.coordinates;
                    var radius = collision.radius;
                    var center_x = collision.center_x;
                    var center_y = collision.center_y;

                    switch (type) {
                        case "rect":
                            return left < offsetX && offsetX < right && top < offsetY && offsetY < bottom || right < offsetX && offsetX < left && bottom < offsetX && offsetX < top;
                        case "ellipse":
                            var width = Math.abs(right - left);
                            var height = Math.abs(bottom - top);
                            return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) + Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
                        case "circle":
                            return Math.pow((offsetX - center_x) / radius, 2) + Math.pow((offsetY - center_y) / radius, 2) < 1;
                        case "polygon":
                            var ptC = { x: offsetX, y: offsetY };
                            var tuples = coordinates.reduce(function (arr, _ref5, i) {
                                var x = _ref5.x;
                                var y = _ref5.y;

                                arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                                return arr;
                            }, []);
                            var deg = tuples.reduce(function (sum, _ref6) {
                                var _ref62 = _slicedToArray(_ref6, 2);

                                var ptA = _ref62[0];
                                var ptB = _ref62[1];

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
                            return deg / (2 * Math.PI) >= 1;
                        default:
                            console.warn("unkown collision type:", _this11.surfaceId, colId, name, collision);
                            return false;
                    }
                });
                if (hitCols.length > 0) return { isHit: true, name: hitCols[hitCols.length - 1].name };
                return { isHit: true, name: "" };
            } else {
                return { isHit: false, name: "" };
            }
        }
    }, {
        key: "processMouseEvent",
        value: function processMouseEvent(ev, type) {
            // マウスイベントの共通処理
            // 副作用なし。イベント発火する。
            $(ev.target).css({ "cursor": "default" });
            if (/^touch/.test(ev.type)) {
                var changedTouches = ev["changedTouches"]; //そういうプロパティがあるんです（おこ
                var _changedTouches$0 = changedTouches[0];
                var pageX = _changedTouches$0.pageX;
                var pageY = _changedTouches$0.pageY;
            } else {
                var pageX = ev.pageX;
                var pageY = ev.pageY;
            }

            var _$$offset = $(ev.target).offset();

            var left = _$$offset.left;
            var top = _$$offset.top;

            var offsetX = pageX - left; //canvas左上からのx座標
            var offsetY = pageY - top; //canvas左上からのy座標
            var hit = this.getRegion(offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            ev.preventDefault();
            var custom = {
                "type": type,
                "offsetX": offsetX | 0,
                "offsetY": offsetY | 0,
                "wheel": 0,
                "scope": this.scopeId,
                "region": hit.name,
                "button": ev.button === 2 ? 1 : 0,
                "transparency": !hit.isHit,
                "event": ev // onした先でpriventDefaultとかstopPropagationとかしたいので
            };
            if (hit.name !== "") {
                if (/^touch/.test(ev.type)) {
                    ev.stopPropagation();
                }
                $(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
            }
            this.emit("mouse", custom);
            this.shell.emit("mouse", custom);
        }
    }]);

    return Surface;
})(EventEmitter2);

exports.Surface = Surface;
},{"./SurfaceRender":3,"./SurfaceUtil":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var SurfaceRender = (function () {
    function SurfaceRender(cnv) {
        _classCallCheck(this, SurfaceRender);

        this.cnv = cnv;
        this.ctx = cnv.getContext("2d");
    }

    _createClass(SurfaceRender, [{
        key: "composeElements",
        value: function composeElements(elements) {
            if (elements.length === 0) {
                return;
            }
            if (!Array.isArray(elements)) throw new Error("TypeError: elements is not array.");
            // elements is a array but it is like `a=[];a[2]="hoge";a[0] === undefined. so use filter.`
            var _elements$filter$0 = elements.filter(function (elm) {
                return !!elm;
            })[0];
            var canvas = _elements$filter$0.canvas;
            var type = _elements$filter$0.type;
            var x = _elements$filter$0.x;
            var y = _elements$filter$0.y;

            var offsetX = 0;
            var offsetY = 0;
            switch (type) {
                case "base":
                    this.base(canvas);
                    break;
                case "overlay":
                case "add":
                case "bind":
                    this.overlay(canvas, offsetX + x, offsetY + y);
                    break;
                case "overlayfast":
                    this.overlayfast(canvas, offsetX + x, offsetY + y);
                    break;
                case "replace":
                    this.replace(canvas, offsetX + x, offsetY + y);
                    break;
                case "interpolate":
                    this.interpolate(canvas, offsetX + x, offsetY + y);
                    break;
                case "move":
                    offsetX = x;
                    offsetY = y;
                    var copyed = SurfaceUtil.copy(this.cnv);
                    this.base(copyed);
                    break;
                case "asis":
                case "reduce":
                case "insert,ID":
                    break;
                default:
                    console.error(elements[0]);
            }
            this.composeElements(elements.slice(1));
        }
    }, {
        key: "clear",
        value: function clear() {
            this.cnv.width = this.cnv.width;
        }
    }, {
        key: "chromakey",
        value: function chromakey() {
            var ctx = this.cnv.getContext("2d");
            var imgdata = ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var data = imgdata.data;
            var r = data[0],
                g = data[1],
                b = data[2],
                a = data[3];
            var i = 0;
            if (a !== 0) {
                while (i < data.length) {
                    if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
                        data[i + 3] = 0;
                    }
                    i += 4;
                }
            }
            ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "pna",
        value: function pna(_pna) {
            var ctxB = _pna.getContext("2d");
            var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var imgdataB = ctxB.getImageData(0, 0, _pna.width, _pna.height);
            var dataA = imgdataA.data;
            var dataB = imgdataB.data;
            var i = 0;
            while (i < dataA.length) {
                dataA[i + 3] = dataB[i];
                i += 4;
            }
            this.ctx.putImageData(imgdataA, 0, 0);
        }
    }, {
        key: "base",
        value: function base(part) {
            this.init(part);
        }
    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            if (this.cnv.width < part.width || this.cnv.height < part.height) {
                this.init(part);
            } else {
                this.ctx.globalCompositeOperation = "source-over";
                this.ctx.drawImage(part, x, y);
            }
        }
    }, {
        key: "overlayfast",
        value: function overlayfast(part, x, y) {
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.drawImage(part, x, y);
        }
    }, {
        key: "interpolate",
        value: function interpolate(part, x, y) {
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.drawImage(part, x, y);
        }
    }, {
        key: "replace",
        value: function replace(part, x, y) {
            this.ctx.clearRect(x, y, part.width, part.height);
            this.overlay(part, x, y);
        }
    }, {
        key: "init",
        value: function init(cnv) {
            this.cnv.width = cnv.width;
            this.cnv.height = cnv.height;
            this.overlay(cnv, 0, 0); // type hack
        }
    }, {
        key: "initImageData",
        value: function initImageData(width, height, data) {
            this.cnv.width = width;
            this.cnv.height = height;
            var imgdata = this.ctx.getImageData(0, 0, width, height);
            var _data = imgdata.data; // type hack
            _data.set(data);
            this.ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "drawRegions",
        value: function drawRegions(regions) {
            var _this = this;

            regions.forEach(function (col) {
                _this.drawRegion(col);
            });
        }
    }, {
        key: "drawRegion",
        value: function drawRegion(region) {
            var type = region.type;
            var name = region.name;
            var left = region.left;
            var top = region.top;
            var right = region.right;
            var bottom = region.bottom;
            var coordinates = region.coordinates;
            var radius = region.radius;
            var center_x = region.center_x;
            var center_y = region.center_y;

            this.ctx.strokeStyle = "#00FF00";
            switch (type) {
                case "rect":
                    this.ctx.rect(left, top, right - left, bottom - top);
                    break;
                case "ellipse":
                    this.ctx.rect(left, top, right - left, bottom - top);
                    break;
                case "circle":
                    this.ctx.rect(left, top, right - left, bottom - top);
                    break;
                case "polygon":
                    this.ctx.rect(left, top, right - left, bottom - top);
            }
            this.ctx.stroke();
            this.ctx.font = "35px";
            this.ctx.strokeStyle = "white";
            this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(type + ":" + name, left + 5, top + 10);
        }
    }]);

    return SurfaceRender;
})();

exports.SurfaceRender = SurfaceRender;
},{"./SurfaceUtil":4}],4:[function(require,module,exports){
/**
 * extend deep like jQuery $.extend(true, target, source)
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.parseDescript = parseDescript;
exports.convert = convert;
exports.find = find;
exports.choice = choice;
exports.copy = copy;
exports.fetchPNGUint8ClampedArrayFromArrayBuffer = fetchPNGUint8ClampedArrayFromArrayBuffer;
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
exports.fetchImageFromURL = fetchImageFromURL;
exports.random = random;
exports.periodic = periodic;
exports.always = always;
exports.isHit = isHit;
exports.offset = offset;
exports.createCanvas = createCanvas;
exports.scope = scope;
exports.randomRange = randomRange;

function extend(target, source) {
    for (var key in source) {
        if (typeof source[key] === "object" && Object.getPrototypeOf(source[key]) === Object.prototype) {
            target[key] = target[key] || {};
            extend(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
            target[key] = target[key] || [];
            extend(target[key], source[key]);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

/**
 * "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
 */

function parseDescript(text) {
    text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
    while (true) {
        var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["", ""])[0];
        if (match.length === 0) break;
        text = text.replace(match, "");
    }
    var lines = text.split("\n");
    lines = lines.filter(function (line) {
        return line.length !== 0;
    }); // remove no content line
    var dic = lines.reduce(function (dic, line) {
        var tmp = line.split(",");
        var key = tmp[0];
        var vals = tmp.slice(1);
        key = key.trim();
        var val = vals.join(",").trim();
        dic[key] = val;
        return dic;
    }, {});
    return dic;
}

/**
 * convert some encoding txt file arraybuffer to js string
 */

function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

/**
 * find filename that matches arg "filename" from arg "paths"
 */

function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./") filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter(function (key) {
        return reg.test(key);
    });
    return hits;
}

function choice(arr) {
    return arr[Math.round(Math.random() * (arr.length - 1))];
}

function copy(cnv) {
    var _copy = document.createElement("canvas");
    var ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}

function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    return new Promise(function (resolve, reject) {})["catch"](function (err) {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}

function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    })["catch"](function (err) {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}

function fetchImageFromURL(url) {
    var img = new Image();
    img.src = url;
    return new Promise(function (resolve, reject) {
        img.addEventListener("load", function () {
            resolve(Promise.resolve(img)); // type hack
        });
        img.addEventListener("error", function (ev) {
            console.error("fetchImageFromURL", ev);
            reject("fetchImageFromURL ");
        });
    });
}

function random(callback, probability) {
    var ms = 1;
    while (Math.round(Math.random() * 1000) > 1000 / probability) {
        ms++;
    }
    setTimeout(function () {
        var nextTick = function nextTick() {
            return random(callback, probability);
        };
        callback(nextTick);
    }, ms * 1000);
}

function periodic(callback, sec) {
    setTimeout(function () {
        return callback(function () {
            return periodic(callback, sec);
        });
    }, sec * 1000);
}

function always(callback) {
    callback(function () {
        return always(callback);
    });
}

function isHit(cnv, x, y) {
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x + 1, y + 1);
    var data = imgdata.data;
    return data[data.length - 1] !== 0;
}

function offset(element) {
    var obj = element.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
}

function createCanvas() {
    var cnv = document.createElement("canvas");
    cnv.width = 1;
    cnv.height = 1;
    return cnv;
}

function scope(scopeId) {
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
}

/*
var _charId = charId === "sakura" ? 0
            : charId === "kero"   ? 1
            : Number(/^char(\d+)/.exec(charId)[1]);
*/
/*
@isHitBubble = (element, pageX, pageY)->
  $(element).hide()
  elm = document.elementFromPoint(pageX, pageY)
  if !elm
    $(element).show(); return elm
  unless elm instanceof HTMLCanvasElement
    $(element).show(); return elm
  {top, left} = $(elm).offset()
  if Surface.isHit(elm, pageX-left, pageY-top)
    $(element).show(); return elm
  _elm = Surface.isHitBubble(elm, pageX, pageY)
  $(element).show(); return _elm
*/
// ↑この死にコードなんだよ
/*
以下Named.jsから呼ばれなくなった死にコード
export function elementFromPointWithout (element: HTMLElement, pageX: number, pageY: number): Element {
  var tmp = element.style.display;
  element.style.display = "none";
  // elementを非表示にして直下の要素を調べる
  var elm = document.elementFromPoint(pageX, pageY);
  // 直下の要素がcanvasなら透明かどうか調べる
  // todo: cuttlebone管理下の要素かどうかの判定必要
  if (!elm){
    element.style.display = tmp;
    return elm;
  }
  if (!(elm instanceof HTMLCanvasElement)) {
    element.style.display = tmp;
    return elm;
  }
  var {top, left} = offset(elm);
  // 不透明canvasならヒット
  if (elm instanceof HTMLCanvasElement && isHit(elm, pageX - left, pageY - top)) {
    element.style.display = tmp;
    return elm;
  }
  if(elm instanceof HTMLElement){
    // elementの非表示のままさらに下の要素を調べにいく
    var _elm = elementFromPointWithout(elm, pageX, pageY)
    element.style.display = tmp;
    return _elm;
  }
  // 解決できなかった！ザンネン!
  console.warn(elm);
  element.style.display = tmp;
  return null;
}
*/

function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _Surface2 = require('./Surface');

var _Surface = _interopRequireWildcard(_Surface2);

var _SurfaceRender2 = require("./SurfaceRender");

var _SurfaceRender = _interopRequireWildcard(_SurfaceRender2);

var _SurfaceUtil2 = require("./SurfaceUtil");

var _SurfaceUtil = _interopRequireWildcard(_SurfaceUtil2);

var _Shell2 = require("./Shell");

var _Shell = _interopRequireWildcard(_Shell2);

var Surface = _Surface.Surface;
exports.Surface = Surface;
var SurfaceRender = _SurfaceRender.SurfaceRender;
exports.SurfaceRender = SurfaceRender;
var SurfaceUtil = _SurfaceUtil;
exports.SurfaceUtil = SurfaceUtil;
var Shell = _Shell.Shell;
exports.Shell = Shell;
},{"./Shell":1,"./Surface":2,"./SurfaceRender":3,"./SurfaceUtil":4}]},{},[5])(5)
});