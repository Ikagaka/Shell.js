(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Shell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Surface = require('./Surface');

var _Surface2 = _interopRequireDefault(_Surface);

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceRender2 = _interopRequireDefault(_SurfaceRender);

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var _eventemitter3 = require("eventemitter3");

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _surfaces_txt2yaml = require("surfaces_txt2yaml");

var _surfaces_txt2yaml2 = _interopRequireDefault(_surfaces_txt2yaml);

var Shell = (function (_EventEmitter) {
    _inherits(Shell, _EventEmitter);

    function Shell(directory) {
        _classCallCheck(this, Shell);

        _get(Object.getPrototypeOf(Shell.prototype), "constructor", this).call(this);
        this.descript = {};
        this.directory = directory;
        this.attachedSurface = [];
        this.surfacesTxt = {};
        this.surfaceTree = [];
        this.cacheCanvas = {};
        this.bindgroup = [];
        this.enableRegion = false;
    }

    _createClass(Shell, [{
        key: "load",
        value: function load() {
            var _this = this;

            return Promise.resolve(this).then(function () {
                return _this.loadDescript();
            }) // 1st // ←なにこれ（自問自
            .then(function () {
                return _this.loadBindGroup();
            }) // 2nd // 依存関係的なやつだと思われ
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

        // this.directoryからdescript.txtを探してthis.descriptに入れる
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
                console.info("descript.txt is not found");
                this.descript = {};
            } else {
                this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
            }
            return Promise.resolve(this);
        }

        // descript.txtからbindgroup探してデフォルト値を反映
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
            var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
            grep(descript, reg).forEach(function (key) {
                var _reg$exec = reg.exec(key);

                var _reg$exec2 = _slicedToArray(_reg$exec, 4);

                var _ = _reg$exec2[0];
                var charId = _reg$exec2[1];
                var bindgroupId = _reg$exec2[2];
                var dflt = _reg$exec2[3];

                var _charId = charId === "sakura" ? "0" : "kero" ? "1" : (/char(\d+)/.exec(charId) || ["", Number.NaN])[1];
                var maybeNumCharId = Number(_charId);
                var maybeNumBindgroupId = Number(bindgroupId);
                if (isFinite(maybeNumCharId) && isFinite(maybeNumBindgroupId)) {
                    _this2.bindgroup[maybeNumCharId] = _this2.bindgroup[maybeNumCharId] || [];
                    if (dflt === "default") {
                        _this2.bindgroup[maybeNumCharId][maybeNumBindgroupId] = !!Number(descript[key]);
                    } else {
                        _this2.bindgroup[maybeNumCharId][maybeNumBindgroupId] = _this2.bindgroup[maybeNumCharId][maybeNumBindgroupId] || false;
                    }
                } else {
                    console.warn("CharId: " + _charId + " or bindgroupId: " + bindgroupId + " is not number");
                }
            });
            return Promise.resolve(this);
        }

        // surfaces.txtを読んでthis.surfacesTxtに反映
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
                this.surfacesTxt = { surfaces: {}, descript: {}, aliases: {}, regions: {} };
            } else {
                surfaces_text_names.forEach(function (filename) {
                    var text = SurfaceUtil.convert(_this3.directory[filename]);
                    var srfs = _surfaces_txt2yaml2["default"].txt_to_data(text, { compatible: 'ssp-lazy' });
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

        // surfacetable.txtを読む予定
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

        // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
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

        // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
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
                                base: { cnv: SurfaceUtil.createCanvas(), img: null },
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

        // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
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
                            base: { cnv: SurfaceUtil.createCanvas(), img: null },
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

        // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
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
                            base: { cnv: SurfaceUtil.createCanvas(), img: null },
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

        // this.directoryからfilenameなサーフェスを探す。
        // あったらついでにpnaも探して合成する
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
            return SurfaceUtil.createSurfaceCanvasFromArrayBuffer(pngbuf).then(function (pngsrfcnv) {
                if (_pnafilename === "") {
                    _this8.cacheCanvas[_filename] = pngsrfcnv;
                    return _this8.cacheCanvas[_filename];
                }
                var pnabuf = _this8.directory[_pnafilename];
                return SurfaceUtil.createSurfaceCanvasFromArrayBuffer(pnabuf).then(function (pnasrfcnv) {
                    var render = new _SurfaceRender2["default"]();
                    render.pna(pngsrfcnv, pnasrfcnv);
                    _this8.cacheCanvas[_filename] = render.getSurfaceCanvas();
                    return _this8.cacheCanvas[_filename];
                });
            });
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(canvas, scopeId, surfaceId) {
            var _this9 = this;

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
            var srf = new _Surface2["default"](canvas, scopeId, _surfaceId, this.surfaceTree);
            srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
            srf.on("mouse", function (ev) {
                _this9.emit("mouse", ev); // detachSurfaceで消える
            });
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
            hits[0].surface.destructor(); // srf.onのリスナはここで消される
            this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
        }
    }, {
        key: "unload",
        value: function unload() {
            var _this10 = this;

            this.attachedSurface.forEach(function (_ref3) {
                var canvas = _ref3.canvas;
                var surface = _ref3.surface;

                surface.destructor();
            });
            this.removeAllListeners(null);
            Object.keys(this).forEach(function (key) {
                _this10[key] = new _this10[key].constructor();
            });
        }

        // サーフェスエイリアス込みでサーフェスが存在するか確認
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
            var _this11 = this;

            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = true;
            this.attachedSurface.forEach(function (_ref4) {
                var srf = _ref4.surface;
                var canvas = _ref4.canvas;

                srf.updateBind(_this11.bindgroup);
            });
        }

        // 着せ替えオフ
    }, {
        key: "unbind",
        value: function unbind(scopeId, bindgroupId) {
            var _this12 = this;

            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = false;
            this.attachedSurface.forEach(function (_ref5) {
                var srf = _ref5.surface;
                var canvas = _ref5.canvas;

                srf.updateBind(_this12.bindgroup);
            });
        }

        // 全サーフェス強制再描画
    }, {
        key: "render",
        value: function render() {
            this.attachedSurface.forEach(function (_ref6) {
                var srf = _ref6.surface;
                var canvas = _ref6.canvas;

                srf.render();
            });
        }

        //当たり判定表示
    }, {
        key: "showRegion",
        value: function showRegion() {
            this.enableRegion = true;
            this.attachedSurface.forEach(function (_ref7) {
                var srf = _ref7.surface;
                var canvas = _ref7.canvas;

                srf.enableRegionDraw = true;
            });
            this.render();
        }

        //当たり判定非表示
    }, {
        key: "hideRegion",
        value: function hideRegion() {
            this.enableRegion = false;
            this.attachedSurface.forEach(function (_ref8) {
                var srf = _ref8.surface;
                var canvas = _ref8.canvas;

                srf.enableRegionDraw = false;
            });
            this.render();
        }
    }]);

    return Shell;
})(_eventemitter32["default"]);

exports["default"] = Shell;
module.exports = exports["default"];
},{"./Surface":3,"./SurfaceRender":4,"./SurfaceUtil":5,"eventemitter3":8,"surfaces_txt2yaml":43}],3:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceRender2 = _interopRequireDefault(_SurfaceRender);

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var _eventemitter3 = require("eventemitter3");

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

self["$"] = _jquery2["default"];
self["jQuery"] = _jquery2["default"];

var Surface = (function (_EventEmitter) {
    _inherits(Surface, _EventEmitter);

    function Surface(canvas, scopeId, surfaceId, surfaceTree) {
        var _this = this;

        _classCallCheck(this, Surface);

        _get(Object.getPrototypeOf(Surface.prototype), "constructor", this).call(this);
        this.element = canvas;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.width = 0;
        this.height = 0;
        this.ctx = canvas.getContext("2d");
        this.position = "fixed";
        this.surfaceTree = surfaceTree;
        this.surfaceNode = this.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = {};
        this.backgrounds = [];
        this.layers = [];
        this.stopFlags = {};
        this.destructed = false;
        this.destructors = [];
        this.initMouseEvent();
        this.surfaceNode.animations.forEach(function (anim) {
            _this.initAnimation(anim);
        });
        this.render();
    }

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.element = null;
            this.surfaceNode = null;
            this.element = null;
            this.layers = [];
            this.animationsQueue = {};
            this.talkCounts = {};
            this.destructors = [];
            this.removeAllListeners(null);
            this.destructed = true;
        }
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this2 = this;

            var $elm = (0, _jquery2["default"])(this.element);
            var tid = 0;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            var processMouseEvent = function processMouseEvent(ev, type) {
                (0, _jquery2["default"])(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ

                var _SurfaceUtil$getEventPosition = SurfaceUtil.getEventPosition(ev);

                var pageX = _SurfaceUtil$getEventPosition.pageX;
                var pageY = _SurfaceUtil$getEventPosition.pageY;
                var clientX = _SurfaceUtil$getEventPosition.clientX;
                var clientY = _SurfaceUtil$getEventPosition.clientY;

                var _$$offset = (0, _jquery2["default"])(ev.target).offset();

                var left = _$$offset.left;
                var top = _$$offset.top;

                var _ref = _this2.position !== "fixed" ? [pageX, pageY] : [clientX, clientY];

                var _ref2 = _slicedToArray(_ref, 2);

                var baseX = _ref2[0];
                var baseY = _ref2[1];

                var _ref3 = _this2.position !== "fixed" ? [left, top] : [left - window.scrollX, top - window.scrollY];

                var _ref32 = _slicedToArray(_ref3, 2);

                var _left = _ref32[0];
                var _top = _ref32[1];

                var offsetX = baseX - _left; //canvas左上からのx座標
                var offsetY = baseY - _top; //canvas左上からのy座標
                var hit = SurfaceUtil.getRegion(_this2.element, _this2.surfaceNode, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
                var custom = {
                    "type": type,
                    "offsetX": offsetX | 0,
                    "offsetY": offsetY | 0,
                    "wheel": 0,
                    "scopeId": _this2.scopeId,
                    "region": hit.name,
                    "button": ev.button === 2 ? 1 : 0,
                    "transparency": !hit.isHit,
                    "event": ev }; // onした先でpriventDefaultとかstopPropagationとかしたいので
                if (hit.name !== "") {
                    ev.preventDefault();
                    if (/^touch/.test(ev.type)) {
                        ev.stopPropagation();
                    }
                    // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
                    // ために親要素にイベント伝えない
                    (0, _jquery2["default"])(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
                }
                _this2.emit("mouse", custom);
            }; // processMouseEventここまで
            tuples.push(["contextmenu", function (ev) {
                return processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["click", function (ev) {
                return processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["dblclick", function (ev) {
                return processMouseEvent(ev, "mousedblclick");
            }]);
            tuples.push(["mousedown", function (ev) {
                return processMouseEvent(ev, "mousedown");
            }]);
            tuples.push(["mousemove", function (ev) {
                return processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["mouseup", function (ev) {
                return processMouseEvent(ev, "mouseup");
            }]);
            tuples.push(["touchmove", function (ev) {
                return processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["touchend", function (ev) {
                processMouseEvent(ev, "mouseup");
                processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
            tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(function () {
                    return touchCount = 0;
                }, 500);
            }]);
            tuples.forEach(function (_ref4) {
                var _ref42 = _slicedToArray(_ref4, 2);

                var ev = _ref42[0];
                var handler = _ref42[1];
                return $elm.on(ev, handler);
            }); // イベント登録
            this.destructors.push(function () {
                tuples.forEach(function (_ref5) {
                    var _ref52 = _slicedToArray(_ref5, 2);

                    var ev = _ref52[0];
                    var handler = _ref52[1];
                    return $elm.off(ev, handler);
                }); // イベント解除
            });
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(anim) {
            var _this3 = this;

            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。

            var _interval$split = interval.split(",");

            var _interval$split2 = _toArray(_interval$split);

            var _interval = _interval$split2[0];

            var rest = _interval$split2.slice(1);

            if (rest.length > 1) {
                var n = Number(rest[0]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4;
                }
            } // rarelyにfaileback
            // アニメーション描画タイミングの登録
            var fn = function fn(nextTick) {
                if (!_this3.destructed && !_this3.stopFlags[animId]) {
                    _this3.play(animId, nextTick);
                }
            };
            switch (_interval) {
                // nextTickを呼ぶともう一回random
                case "sometimes":
                    SurfaceUtil.random(fn, 2);
                    break;
                case "rarely":
                    SurfaceUtil.random(fn, 4);
                    break;
                case "random":
                    SurfaceUtil.random(fn, n);
                    break;
                case "periodic":
                    SurfaceUtil.periodic(fn, n);
                    break;
                case "always":
                    SurfaceUtil.always(fn);
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
                        this.initBind(anim); // bindのことはinitBindにまるなげ
                        break;
                    }
                    console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
            }
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this4 = this;

            // bind+somtimesみたいなやつを分解
            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            var _interval$split3 = interval.split("+");

            var _interval$split32 = _toArray(_interval$split3);

            var _bind = _interval$split32[0];

            var intervals = _interval$split32.slice(1);

            if (intervals.length > 0) return;
            intervals.forEach(function (interval) {
                //sometimesみたいのはinitAnimationに丸投げ
                _this4.initAnimation({ interval: interval, is: is, patterns: patterns, option: option });
            });
            var option = anim.option;

            if (option === "background") {
                this.backgrounds[is] = patterns[patterns.length - 1];
            } else {
                this.layers[is] = patterns[patterns.length - 1];
            }
            this.render();
        }
    }, {
        key: "updateBind",
        value: function updateBind(bindgroup) {
            var _this5 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれる
            this.surfaceNode.animations.forEach(function (anim) {
                //このサーフェスに定義されたアニメーションの中でintervalがbindなものｗ探す
                var is = anim.is;
                var interval = anim.interval;
                var patterns = anim.patterns;

                if (bindgroup[_this5.scopeId] == null) return;
                if (bindgroup[_this5.scopeId][is] == null) return;
                if (!/^bind/.test(interval)) return;
                if (bindgroup[_this5.scopeId][is] === true) {
                    //現在の設定が着せ替え有効ならばinitBindにまるなげ
                    _this5.initBind(anim);
                } else {
                    //現在の合成レイヤから着せ替えレイヤを削除
                    delete _this5.layers[is];
                }
            });
        }

        // アニメーションタイミングループの開始
    }, {
        key: "begin",
        value: function begin(animationId) {
            this.stopFlags[animationId] = false;
            var anim = this.surfaceNode.animations[animationId];
            this.initAnimation(anim);
        }

        // アニメーションタイミングループの開始
    }, {
        key: "end",
        value: function end(animationId) {
            this.stopFlags[animationId] = true;
        }
    }, {
        key: "endAll",
        value: function endAll() {
            var _this6 = this;

            Object.keys(this.stopFlags).forEach(function (key) {
                _this6.stopFlags[key] = false;
            });
        }

        // アニメーション再生
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this7 = this;

            if (this.destructed) return;
            var anims = this.surfaceNode.animations;
            var anim = this.surfaceNode.animations[animationId];
            if (anim == null) return void setTimeout(callback); // そんなアニメーションはない
            this.animationsQueue[animationId] = anim.patterns.map(function (pattern, i) {
                return function () {
                    var surface = pattern.surface;
                    var wait = pattern.wait;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;
                    var animation_ids = pattern.animation_ids;

                    switch (type) {
                        case "start":
                            _this7.play(animation_ids[0], nextTick);
                            return;
                        case "stop":
                            _this7.stop(animation_ids[0]);
                            setTimeout(nextTick);
                            return;
                        case "alternativestart":
                            _this7.play(SurfaceUtil.choice(animation_ids), nextTick);
                            return;
                        case "alternativestop":
                            _this7.stop(SurfaceUtil.choice(animation_ids));
                            setTimeout(nextTick);
                            return;
                    }

                    var _ref6 = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                    var _ref62 = _slicedToArray(_ref6, 3);

                    var __ = _ref62[0];
                    var a = _ref62[1];
                    var b = _ref62[2];

                    var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                    setTimeout(function () {
                        if (anim.option === "background") {
                            _this7.backgrounds[animationId] = pattern;
                        } else {
                            _this7.layers[animationId] = pattern;
                        }
                        _this7.render();
                        nextTick();
                    }, _wait);
                };
            });
            var nextTick = function nextTick() {
                if (_this7.destructed) return;
                var next = _this7.animationsQueue[animationId].shift();
                if (!(next instanceof Function)) {
                    // stop pattern animation.
                    _this7.animationsQueue[animationId] = [];
                    setTimeout(callback);
                } else {
                    next();
                }
            };
            if (this.animationsQueue[animationId][0] instanceof Function) {
                nextTick();
            }
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            this.animationsQueue[animationId] = []; // アニメーションキューを破棄
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this8 = this;

            var animations = this.surfaceNode.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim) {
                return (/^talk/.test(anim.interval) && _this8.talkCount % _this8.talkCounts[anim.is] === 0
                );
            });
            hits.forEach(function (anim) {
                _this8.play(anim.is);
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this9 = this;

            var anims = this.surfaceNode.animations;
            anims.forEach(function (anim) {
                // この条件式よくわからない
                if (anim.interval === "yen-e" && _this9.talkCount % _this9.talkCounts[anim.is] === 0) {
                    _this9.play(anim.is);
                }
            });
        }
    }, {
        key: "composeAnimationPatterns",
        value: function composeAnimationPatterns(layers) {
            var _this10 = this;

            var renderLayers = [];
            layers.forEach(function (pattern, i) {
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface < 0) return; // idが-1つまり非表示指定
                var srf = _this10.surfaceTree[surface]; // 該当のサーフェス
                if (srf == null) {
                    console.warn("Surface#render: surface id " + surface + " is not defined.", pattern);
                    console.warn(surface, Object.keys(_this10.surfaceTree));
                    return; // 対象サーフェスがないのでスキップ
                }
                // 対象サーフェスを構築描画する
                var base = srf.base;
                var elements = srf.elements;
                var collisions = srf.collisions;
                var animations = srf.animations;

                var rndr = new _SurfaceRender2["default"](); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
                rndr.base(base);
                rndr.composeElements(elements); // elementを合成する
                renderLayers.push({ type: type, x: x, y: y, canvas: rndr.getSurfaceCanvas() });
            });
            return renderLayers;
        }
    }, {
        key: "render",
        value: function render() {
            if (this.destructed) return;
            var backgrounds = this.composeAnimationPatterns(this.backgrounds);
            var base = this.surfaceNode.base;
            var elements = this.surfaceNode.elements;
            var fronts = this.composeAnimationPatterns(this.layers);
            var renderLayers = [].concat(backgrounds, [{ type: "overlay", canvas: base, x: 0, y: 0 }], elements, fronts);
            var bufRender = new _SurfaceRender2["default"](); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            bufRender.composeElements(renderLayers); // 現在有効なアニメーションのレイヤを合成
            if (this.enableRegionDraw) {
                bufRender.ctx.fillText("" + this.surfaceId, 5, 10); // surfaceIdを描画
                bufRender.drawRegions(this.surfaceNode.collisions);
            }
            SurfaceUtil.init(this.element, this.ctx, bufRender.cnv); // バッファから実DOMTree上のcanvasへ描画
            this.width = this.element.width;
            this.height = this.element.height;
        }
    }]);

    return Surface;
})(_eventemitter32["default"]);

exports["default"] = Surface;
module.exports = exports["default"];
},{"./SurfaceRender":4,"./SurfaceUtil":5,"eventemitter3":8,"jquery":11}],4:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts"/>
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
    // 渡されたSurfaceCanvasをベースサーフェスとしてレイヤー合成を開始する。
    // nullならば1x1のCanvasをベースサーフェスとする。
    // 渡されたSurfaceCanvasは変更しない。

    function SurfaceRender() {
        _classCallCheck(this, SurfaceRender);

        this.cnv = SurfaceUtil.createCanvas();
        this.img = this.cnv; // HTMLElementでwidthとHeightがあってdrawImageできるから！
        this.ctx = this.cnv.getContext("2d");
        this.basePosX = 0;
        this.basePosY = 0;
        this.elements = [];
    }

    _createClass(SurfaceRender, [{
        key: "getSurfaceCanvas",
        value: function getSurfaceCanvas() {
            return { cnv: SurfaceUtil.copy(this.cnv), img: this.img };
        }

        // [
        //  {canvas: srfCnv1, type: "base",    x: 0,  y: 0}
        //  {canvas: srfCnv2, type: "overlay", x: 50, y: 50}
        // ]
    }, {
        key: "composeElements",
        value: function composeElements(elements) {
            var _this = this;

            elements.forEach(function (_ref, id) {
                var canvas = _ref.canvas;
                var type = _ref.type;
                var x = _ref.x;
                var y = _ref.y;

                _this.composeElement(canvas, type, x, y);
            });
        }
    }, {
        key: "composeElement",
        value: function composeElement(canvas, type, x, y) {
            switch (type) {
                case "base":
                    this.base(canvas);
                    break;
                case "overlay":
                    this.overlay(canvas, x, y);
                    break;
                case "add":
                    this.add(canvas, x, y);
                    break;
                case "bind":
                    this.bind(canvas, x, y);
                    break;
                case "overlayfast":
                    this.overlayfast(canvas, x, y);
                    break;
                case "replace":
                    this.replace(canvas, x, y);
                    break;
                case "interpolate":
                    this.interpolate(canvas, x, y);
                    break;
                case "move":
                    this.move(x, y);
                    break;
                case "asis":
                    this.asis(canvas, x, y);
                    break;
                case "reduce":
                    this.reduce(canvas, x, y);
                    break;
                case "start":
                case "stop":
                case "alternativestart":
                case "alternativestop":
                case "insert": // こいつらはSurfaceRenerの仕事ではない。Surfaceでやって
                default:
                    console.warn("SurfaceRender#composeElement", new Error("unsupport type"), canvas, type, x, y);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.elements.push({ method: "clear", args: [] });
            this.cnv.width = this.cnv.width;
        }
    }, {
        key: "pna",
        value: function pna(png, _pna) {
            this.elements.push({ method: "pna", args: [png, _pna] });
            var cnvA = SurfaceUtil.copy(png.img || png.cnv);
            var ctxA = cnvA.getContext("2d");
            var imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
            var dataA = imgdataA.data;
            var cnvB = SurfaceUtil.copy(_pna.img || _pna.cnv);
            var ctxB = cnvB.getContext("2d");
            var imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
            var dataB = imgdataB.data;
            for (var y = 0; y < cnvB.height; y++) {
                for (var x = 0; x < cnvB.width; x++) {
                    var iA = x * 4 + y * cnvA.width * 4; // baseのxy座標とインデックス
                    var iB = x * 4 + y * cnvB.width * 4; // pnaのxy座標とインデックス
                    dataA[iA + 3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
                }
            }
            this.cnv.width = cnvA.width;
            this.cnv.height = cnvA.height;
            this.ctx.putImageData(imgdataA, 0, 0);
        }

        //下位レイヤをコマで完全に置き換える。collisionもコマのサーフェスに定義されたものに更新される。
        //このメソッドのパターンを重ねると、サーフェス全面を描画し直すことによるアニメーション（いわばパラパラ漫画）が実現される。
        //この描画メソッドが指定されたpattern定義では、XY座標は無視される。
        //着せ替え・elementでも使用できる。
    }, {
        key: "base",
        value: function base(part) {
            this.elements.push({ method: "base", args: [part] });
            SurfaceUtil.init(this.cnv, this.ctx, part.cnv);
        }

        //下位レイヤにコマを重ねる。
        //着せ替え・elementでも使用できる。
    }, {
        key: "overlay",
        value: function overlay(part, x, y) {
            this.elements.push({ method: "overlay", args: [part, x, y] });
            // baseのcanvasを拡大するためのキャッシュ
            var tmp = SurfaceUtil.copy(this.cnv);
            // もしパーツが右下へはみだす
            if (x >= 0) {
                this.cnv.width = x + part.cnv.width > this.cnv.width ? x + part.cnv.width : this.cnv.width;
            }
            if (y >= 0) {
                this.cnv.height = y + part.cnv.height > this.cnv.height ? y + part.cnv.height : this.cnv.height;
            }
            // もしパーツが右上へはみだす（ネガティブマージン
            if (x < 0) {
                // もし右へははみ出す
                this.cnv.width = part.cnv.width + x > this.cnv.width ? part.cnv.width : this.cnv.width - x;
                this.basePosX = -x;
            }
            if (y < 0) {
                this.cnv.height = part.cnv.height + y > this.cnv.height ? part.cnv.height : this.cnv.height - y;
                this.basePosY = -y;
            }
            this.ctx.drawImage(tmp, this.basePosX, this.basePosY); //下位レイヤ再描画
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y); //コマ追加
        }

        //下位レイヤの非透過部分（半透明含む）にのみコマを重ねる。
        //着せ替え・elementでも使用できる。
    }, {
        key: "overlayfast",
        value: function overlayfast(part, x, y) {
            this.elements.push({ method: "overlayfast", args: [part, x, y] });
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
        }

        //下位レイヤの透明なところにのみコマを重ねる。
        //下位レイヤの半透明部分に対しても、透明度が高い部分ほど強くコマを合成する。
        //interpolateで重なる部分はベースより上位（手前）側になければならない
        //（interpolateのコマが描画している部分に、上位のレイヤで不透明な部分が重なると反映されなくなる）。
        //着せ替え・elementでも使用できる。
    }, {
        key: "interpolate",
        value: function interpolate(part, x, y) {
            this.elements.push({ method: "interpolate", args: [part, x, y] });
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.drawImage(part.cnv, this.basePosX + x, this.basePosY + y);
        }

        //下位レイヤにコマを重ねるが、コマの透過部分について下位レイヤにも反映する（reduce + overlayに近い）。
        //着せ替え・elementでも使用できる。
    }, {
        key: "replace",
        value: function replace(part, x, y) {
            this.elements.push({ method: "replace", args: [part, x, y] });
            this.ctx.clearRect(this.basePosX + x, this.basePosY + y, part.cnv.width, part.cnv.height);
            this.overlay(part, x, y);
        }

        //下位レイヤに、抜き色やアルファチャンネルを適応しないままそのコマを重ねる。
        //着せ替え・elementでも使用できる。
        //なおelement合成されたサーフェスを他のサーフェスのアニメーションパーツとしてasisメソッドで合成した場合の表示は未定義であるが、
        //Windows上では普通、透過領域は画像本来の抜き色に関係なく黒（#000000）で表示されるだろう。
    }, {
        key: "asis",
        value: function asis(part, x, y) {
            this.elements.push({ method: "asis", args: [part, x, y] });
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(part.img || part.cnv, this.basePosX + x, this.basePosY + y);
        }

        //下位レイヤをXY座標指定分ずらす。
        //この描画メソッドが指定されたpattern定義では、サーフェスIDは無視される。
        //着せ替え・elementでは使用不可。
    }, {
        key: "move",
        value: function move(x, y) {
            this.elements.push({ method: "move", args: [x, y] });
            // overlayするためだけのものなのでnullでもまあ問題ない
            var srfCnv = { cnv: SurfaceUtil.copy(this.cnv), img: null };
            this.clear(); // 大きさだけ残して一旦消す
            this.overlay(srfCnv, x, y); //ずらした位置に再描画
        }

        //そのコマを着せ替えパーツとして重ねる。現在ではoverlayと同じ。
        //着せ替えパーツとして単純に一つのサーフェスを重ねることしか出来なかった頃の唯一のメソッドで、現在はaddが互換。
        //着せ替えでないアニメーション・elementでの使用は未定義。
    }, {
        key: "bind",
        value: function bind(part, x, y) {
            this.elements.push({ method: "bind", args: [part, x, y] });
            this.add(part, x, y);
        }

        //下位レイヤにそのコマを着せ替えパーツとして重ねる。本質的にはoverlayと同じ。
        //着せ替え用に用意されたメソッドで、着せ替えでないアニメーション・elementでの使用は未定義。
    }, {
        key: "add",
        value: function add(part, x, y) {
            this.elements.push({ method: "add", args: [part, x, y] });
            this.overlay(part, x, y);
        }

        //下位レイヤの抜き色による透過領域に、そのコマの抜き色による透過領域を追加する。コマの抜き色で無い部分は無視される。
        //着せ替え用に用意されたメソッドだが、着せ替えでないアニメーション・elementでも使用可能。
        //http://usada.sakura.vg/contents/seriko.html
    }, {
        key: "reduce",
        value: function reduce(part, x, y) {
            this.elements.push({ method: "reduce", args: [part, x, y] });
            // はみ出しちぇっく
            var width = x + part.cnv.width < this.cnv.width ? part.cnv.width : this.cnv.width - x;
            var height = y + part.cnv.height < this.cnv.height ? part.cnv.height : this.cnv.height - y;
            var imgdataA = this.ctx.getImageData(0, 0, this.cnv.width, this.cnv.height);
            var dataA = imgdataA.data;
            var ctxB = part.cnv.getContext("2d");
            var imgdataB = ctxB.getImageData(0, 0, part.cnv.width, part.cnv.height);
            var dataB = imgdataB.data;
            for (var _y = 0; _y < height; _y++) {
                for (var _x = 0; _x < width; _x++) {
                    var iA = (x + _x) * 4 + (y + _y) * this.cnv.width * 4; // baseのxy座標とインデックス
                    var iB = _x * 4 + _y * part.cnv.width * 4; // partのxy座標とインデックス
                    // もしコマが透過ならpartのalphaチャネルでbaseのを上書き
                    if (dataB[iB + 3] === 0) dataA[iA + 3] = dataB[iB + 3];
                }
            }
            this.ctx.putImageData(imgdataA, 0, 0);
        }
    }, {
        key: "init",
        value: function init(srfCnv) {
            this.elements.push({ method: "init", args: [srfCnv] });
            SurfaceUtil.init(this.cnv, this.ctx, srfCnv.cnv);
        }
    }, {
        key: "initImageData",
        value: function initImageData(width, height, data) {
            this.elements.push({ method: "initImageData", args: [width, height, data] });
            this.cnv.width = width;
            this.cnv.height = height;
            var imgdata = this.ctx.getImageData(0, 0, width, height);
            imgdata.data.set(data);
            this.ctx.putImageData(imgdata, 0, 0);
        }
    }, {
        key: "drawRegions",
        value: function drawRegions(regions) {
            var _this2 = this;

            regions.forEach(function (col) {
                _this2.drawRegion(col);
            });
        }
    }, {
        key: "drawRegion",
        value: function drawRegion(region) {
            this.elements.push({ method: "drawRegion", args: [region] });
            var _region$type = region.type;
            var type = _region$type === undefined ? "" : _region$type;
            var _region$name = region.name;
            var name = _region$name === undefined ? "" : _region$name;
            var _region$left = region.left;
            var left = _region$left === undefined ? 0 : _region$left;
            var _region$top = region.top;
            var top = _region$top === undefined ? 0 : _region$top;
            var _region$right = region.right;
            var right = _region$right === undefined ? 0 : _region$right;
            var _region$bottom = region.bottom;
            var bottom = _region$bottom === undefined ? 0 : _region$bottom;
            var _region$coordinates = region.coordinates;
            var coordinates = _region$coordinates === undefined ? [] : _region$coordinates;
            var _region$radius = region.radius;
            var radius = _region$radius === undefined ? 0 : _region$radius;
            var _region$center_x = region.center_x;
            var center_x = _region$center_x === undefined ? 0 : _region$center_x;
            var _region$center_y = region.center_y;
            var center_y = _region$center_y === undefined ? 0 : _region$center_y;

            left += this.basePosX;
            top += this.basePosY;
            right += this.basePosX;
            bottom += this.basePosY;
            center_x += this.basePosX;
            center_y += this.basePosY;
            this.ctx.strokeStyle = "#00FF00";
            switch (type) {
                case "rect":
                    this.ctx.rect(left, top, right - left, bottom - top);
                    break;
                default:
                    console.warn("collision shape:", type, "is not draw it region yet");
                    break;
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

exports["default"] = SurfaceRender;
module.exports = exports["default"];
},{"./SurfaceUtil":5}],5:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.createSurfaceCanvasFromURL = createSurfaceCanvasFromURL;
exports.createSurfaceCanvasFromArrayBuffer = createSurfaceCanvasFromArrayBuffer;
exports.init = init;
exports.chromakey_snipet = chromakey_snipet;
exports.log = log;
exports.extend = extend;
exports.parseDescript = parseDescript;
exports.fetchArrayBuffer = fetchArrayBuffer;
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
exports.unscope = unscope;
exports.getEventPosition = getEventPosition;
exports.recursiveElementFromPoint = recursiveElementFromPoint;
exports.eventPropagationSim = eventPropagationSim;
exports.randomRange = randomRange;
exports.getRegion = getRegion;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _encodingJapanese = require("encoding-japanese");

var _encodingJapanese2 = _interopRequireDefault(_encodingJapanese);

function createSurfaceCanvasFromURL(url) {
    return fetchArrayBuffer(url).then(createSurfaceCanvasFromArrayBuffer);
}

function createSurfaceCanvasFromArrayBuffer(buffer) {
    return fetchImageFromArrayBuffer(buffer).then(function (img) {
        var cnv = copy(img);
        var ctx = cnv.getContext("2d");
        var imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
        chromakey_snipet(imgdata.data);
        ctx.putImageData(imgdata, 0, 0);
        return { cnv: cnv, img: img };
    });
}

function init(cnv, ctx, src) {
    cnv.width = src.width;
    cnv.height = src.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(src, 0, 0);
}

function chromakey_snipet(data) {
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
}

function log(element) {
    var description = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    document.body.appendChild(fieldset);
}

// extend deep like jQuery $.extend(true, target, source)

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

// "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}

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

// XMLHttpRequest, xhr.responseType = "arraybuffer"

function fetchArrayBuffer(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status < 300) {
                if (xhr.response.error == null) {
                    return resolve(xhr.response);
                } else {
                    return reject(new Error("message: " + xhr.response.error.message));
                }
            } else {
                return reject(new Error("status: " + xhr.status));
            }
        });
        xhr["open"]("GET", url);
        xhr["responseType"] = "arraybuffer";
        return xhr["send"]();
    });
}

// convert some encoding txt file arraybuffer to js string
// TODO: use text-enconding & charset detection code

function convert(buffer) {
    //return new TextDecoder('shift_jis').decode(buffer);
    return _encodingJapanese2["default"].codeToString(_encodingJapanese2["default"].convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...

function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./") filename = filename.slice(2);
    var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    var hits = paths.filter(function (key) {
        return reg.test(key);
    });
    return hits;
}

// [1,2,3] -> 1 or 2 or 3 as 33% probability

function choice(arr) {
    return arr[(Math.random() * 100 * arr.length | 0) % arr.length];
}

// copy canvas as new object
// this copy technic is faster than getImageData full copy, but some pixels are bad copy.
// see also: http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally

function copy(cnv) {
    var _copy = document.createElement("canvas");
    var ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}

function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf) {
    return new Promise(function (resolve, reject) {
        reject("deplicated");
        /*
        var reader = new PNGReader(pngbuf);
        var png = reader.parse();
        var dataA = png.getUint8ClampedArray();
        if(typeof pnabuf === "undefined"){
          var r = dataA[0], g = dataA[1], b = dataA[2], a = dataA[3];
          var i = 0;
          if (a !== 0) {
            while (i < dataA.length) {
              if (r === dataA[i] && g === dataA[i + 1] && b === dataA[i + 2]) {
                dataA[i + 3] = 0;
              }
              i += 4;
            }
          }
          return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
        }
        var pnareader = new PNGReader(pnabuf);
        var pna = pnareader.parse();
        var dataB = pna.getUint8ClampedArray();
        if(dataA.length !== dataB.length){
          return reject("fetchPNGUint8ClampedArrayFromArrayBuffer TypeError: png" +
          png.width+"x"+png.height+" and  pna"+pna.width+"x"+pna.height +
          " do not match both sizes");
        }
        var j = 0;
        while (j < dataA.length) {
          dataA[j + 3] = dataB[j];
          j += 4;
        }
        return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
        */
    })["catch"](function (err) {
        return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:" + err + ", reason: " + err.stack);
    });
}

// ArrayBuffer -> HTMLImageElement

function fetchImageFromArrayBuffer(buffer, mimetype) {
    var url = URL.createObjectURL(new Blob([buffer], { type: mimetype || "image/png" }));
    return fetchImageFromURL(url).then(function (img) {
        URL.revokeObjectURL(url);
        return Promise.resolve(img);
    })["catch"](function (err) {
        return Promise.reject("fetchImageFromArrayBuffer > " + err);
    });
}

// URL -> HTMLImageElement

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

// random(func, n) means call func 1/n per sec

function random(callback, probability) {
    setTimeout(function () {
        function nextTick() {
            random(callback, probability);
        }
        if (Math.random() < 1 / probability) callback(nextTick);else nextTick();
    }, 1000);
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
    if (!(x > 0 && y > 0)) return false;
    // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
    if (!(cnv.width > 0 || cnv.height > 0)) return false;
    var ctx = cnv.getContext("2d");
    var imgdata = ctx.getImageData(0, 0, x, y);
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

// 0 -> sakura

function scope(scopeId) {
    return scopeId === 0 ? "sakura" : scopeId === 1 ? "kero" : "char" + scopeId;
}

// sakuta -> 0

function unscope(charId) {
    return charId === "sakura" ? 0 : charId === "kero" ? 1 : Number(/^char(\d+)/.exec(charId)[1]);
}

function getEventPosition(ev) {
    if (/^touch/.test(ev.type) && ev.originalEvent.touches.length > 0) {
        var pageX = ev.originalEvent.touches[0].pageX;
        var pageY = ev.originalEvent.touches[0].pageY;
        var clientX = ev.originalEvent.touches[0].clientX;
        var clientY = ev.originalEvent.touches[0].clientY;
        var screenX = ev.originalEvent.touches[0].screenX;
        var screenY = ev.originalEvent.touches[0].screenY;
        return { pageX: pageX, pageY: pageY, clientX: clientX, clientY: clientY, screenX: screenX, screenY: screenY };
    }
    var pageX = ev.pageX;
    var pageY = ev.pageY;
    var clientX = ev.clientX;
    var clientY = ev.clientY;
    var screenX = ev.screenX;
    var screenY = ev.screenY;
    return { pageX: pageX, pageY: pageY, clientX: clientX, clientY: clientY, screenX: screenX, screenY: screenY };
}

function recursiveElementFromPoint(ev, parent, target) {
    var _getEventPosition = getEventPosition(ev);

    var clientX = _getEventPosition.clientX;
    var clientY = _getEventPosition.clientY;
    var pageX = _getEventPosition.pageX;
    var pageY = _getEventPosition.pageY;

    var _$$offset = $(target).offset();

    var left = _$$offset.left;
    var top = _$$offset.top;

    var offsetX = clientX - (left - window.scrollX); // window.scrollX は position: fixed; でのclientWidthをとるため
    var offsetY = clientY - (top - window.scrollY);
    if ($(parent).find(target).length > 0 && target instanceof HTMLCanvasElement && isHit(target, offsetX, offsetY)) {
        eventPropagationSim(target, ev);
        return target;
    }
    var tmp = target.style.display;
    target.style.display = "none";
    var under = document.elementFromPoint(clientX, clientY);
    if (under == null) {
        target.style.display = tmp;
        return null;
    }
    if ($(parent).find(under).length > 0) {
        var result = recursiveElementFromPoint(ev, parent, under);
        target.style.display = tmp;
        return result;
    }
    eventPropagationSim(under, ev);
    target.style.display = tmp;
    // マウスを停止しているのにここを大量のmousemoveが通過するが
    // target.style.display = "none"したのち
    // target.style.display = tmp した瞬間に
    // mousemoveが発生してしまうためで、それほど大きな問題はないので大丈夫
    // (モバイルだとマウスないからmousemove発生しないし)
    return under;
}

function eventPropagationSim(target, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (/^mouse|click$/.test(ev.type)) {
        var mev = new MouseEvent(ev.type, {
            screenX: ev.screenX,
            screenY: ev.screenY,
            clientX: ev.clientX,
            clientY: ev.clientY,
            ctrlKey: ev.ctrlKey,
            altKey: ev.altKey,
            shiftKey: ev.shiftKey,
            metaKey: ev.metaKey,
            button: ev.button,
            buttons: ev.originalEvent["buttons"],
            relatedTarget: ev.relatedTarget,
            view: ev.originalEvent["view"],
            detail: ev.originalEvent["detail"],
            bubbles: true
        });
        target.dispatchEvent(mev);
    } else if (/^touch/.test(ev.type)) {
        var ua = window.navigator.userAgent.toLowerCase();
        if (!(document.createTouch instanceof Function)) return console.warn(ua, "does not support document.createTouch");
        if (!(document.createTouchList instanceof Function)) return console.warn(ua, "does not support document.createTouchList");
        if (!(tev["initTouchEvent"] instanceof Function)) return console.warn(ua, "does not support TouchEvent#initTouchEvent");

        var _getEventPosition2 = getEventPosition(ev);

        var pageX = _getEventPosition2.pageX;
        var pageY = _getEventPosition2.pageY;
        var clientX = _getEventPosition2.clientX;
        var clientY = _getEventPosition2.clientY;
        var screenX = _getEventPosition2.screenX;
        var screenY = _getEventPosition2.screenY;

        var tev = document.createEvent("TouchEvent");
        var touch = document.createTouch(document.defaultView, ev.target, 0, pageX, pageY, screenX, screenY);
        var touches = document.createTouchList(touch);
        if (ua.indexOf('chrome') != -1 || ua.indexOf('opera') != -1) {
            console.info("this browser is chrome or opera", ua);
            tev["initTouchEvent"](touches, touches, touches, ev.type, ev.originalEvent["view"], screenX, screenY, clientX, clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey);
        } else if (ua.indexOf('safari') != -1) {
            console.info("this browser is safari", ua);
            tev["initTouchEvent"](ev.type, true, ev.cancelable, ev.originalEvent["view"], ev.originalEvent["detail"], screenX, screenY, clientX, clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, touches, touches, touches, 0, 0);
        } else if (ua.indexOf('firefox') != -1 || true) {
            console.info("this browser is firefox", ua);
            tev["initTouchEvent"](ev.type, true, ev.cancelable, ev.originalEvent["view"], ev.originalEvent["detail"], ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, touches, touches, touches);
        }
        target.dispatchEvent(tev);
    } else {
        console.warn(ev.type, "is not support event");
    }
}

function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function getRegion(element, surfaceNode, offsetX, offsetY) {
    var _this = this;

    // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
    if (isHit(element, offsetX, offsetY)) {
        var hitCols = surfaceNode.collisions.filter(function (collision, colId) {
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
                    var tuples = coordinates.reduce(function (arr, _ref, i) {
                        var x = _ref.x;
                        var y = _ref.y;

                        arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                        return arr;
                    }, []);
                    var deg = tuples.reduce(function (sum, _ref2) {
                        var _ref22 = _slicedToArray(_ref2, 2);

                        var ptA = _ref22[0];
                        var ptB = _ref22[1];

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
                    console.warn("unkown collision type:", _this.surfaceId, colId, name, collision);
                    return false;
            }
        });
        if (hitCols.length > 0) return { isHit: true, name: hitCols[hitCols.length - 1].name };
        return { isHit: true, name: "" };
    } else {
        return { isHit: false, name: "" };
    }
}
},{"encoding-japanese":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _SurfaceRender2 = require("./SurfaceRender");

var _SurfaceRender3 = _interopRequireDefault(_SurfaceRender2);

var _SurfaceUtil2 = require("./SurfaceUtil");

var _SurfaceUtil = _interopRequireWildcard(_SurfaceUtil2);

var _Surface2 = require('./Surface');

var _Surface3 = _interopRequireDefault(_Surface2);

var _Shell2 = require("./Shell");

var _Shell3 = _interopRequireDefault(_Shell2);

var SurfaceRender = _SurfaceRender3["default"];
exports.SurfaceRender = SurfaceRender;
var SurfaceUtil = _SurfaceUtil;
exports.SurfaceUtil = SurfaceUtil;
var Surface = _Surface3["default"];
exports.Surface = Surface;
var Shell = _Shell3["default"];
exports.Shell = Shell;
},{"./Shell":2,"./Surface":3,"./SurfaceRender":4,"./SurfaceUtil":5}],7:[function(require,module,exports){
/**
 * Encoding.js
 *
 * @description    Converts character encoding.
 * @fileoverview   Encoding library
 * @author         polygon planet
 * @version        1.0.24
 * @date           2015-09-22
 * @link           https://github.com/polygonplanet/encoding.js
 * @copyright      Copyright (c) 2013-2015 polygon planet <polygon.planet.aqua@gmail.com>
 * @license        licensed under the MIT license.
 *
 * Based:
 *   - mbstring library
 *   - posql charset library
 *   - libxml2
 *   - pot.js
 */

/*jshint bitwise:false,eqnull:true,newcap:false */

(function (name, context, factory) {

// Supports UMD. AMD, CommonJS/Node.js and browser context
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    exports[name] = factory();
  }
} else if (typeof define === 'function' && define.amd) {
  define(factory);
} else {
  context[name] = factory();
}

})('Encoding', this, function () {
'use strict';

var UTF8_UNKNOWN = '?'.charCodeAt(0);

var fromCharCode = String.fromCharCode;
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var HAS_TYPED = typeof Uint8Array !== 'undefined' &&
                typeof Uint16Array !== 'undefined';

// Test for String.fromCharCode.apply.
var CAN_CHARCODE_APPLY = false;
var CAN_CHARCODE_APPLY_TYPED = false;

try {
  if (fromCharCode.apply(null, [0x61]) === 'a') {
    CAN_CHARCODE_APPLY = true;
  }
} catch (e) {}

if (HAS_TYPED) {
  try {
    if (fromCharCode.apply(null, new Uint8Array([0x61])) === 'a') {
      CAN_CHARCODE_APPLY_TYPED = true;
    }
  } catch (e) {}
}

// Function.prototype.apply stack max range
var APPLY_BUFFER_SIZE = 65533;
var APPLY_BUFFER_SIZE_OK = null;


/**
 * Encoding names.
 *
 * @ignore
 */
var EncodingNames = {
  UTF32: {
    order: 0
  },
  UTF32BE: {
    alias: ['UCS4']
  },
  UTF32LE: null,
  UTF16: {
    order: 1
  },
  UTF16BE: {
    alias: ['UCS2']
  },
  UTF16LE: null,
  BINARY: {
    order: 2
  },
  ASCII: {
    order: 3,
    alias: ['ISO646', 'CP367']
  },
  JIS: {
    order: 4,
    alias: ['ISO2022JP']
  },
  UTF8: {
    order: 5
  },
  EUCJP: {
    order: 6
  },
  SJIS: {
    order: 7,
    alias: ['CP932', 'MSKANJI', 'WINDOWS31J']
  },
  UNICODE: {
    order: 8
  }
};

/**
 * Encoding alias names.
 *
 * @ignore
 */
var EncodingAliases = {};

/**
 * Encoding orders.
 *
 * @ignore
 */
var EncodingOrders = (function() {
  var aliases = EncodingAliases;

  var names = getKeys(EncodingNames);
  var orders = [];
  var name, encoding, j, l;

  for (var i = 0, len = names.length; i < len; i++) {
    name = names[i];
    aliases[name] = name;

    encoding = EncodingNames[name];
    if (encoding != null) {
      if (typeof encoding.order !== 'undefined') {
        orders[orders.length] = name;
      }

      if (encoding.alias) {
        // Create the encoding aliases.
        for (j = 0, l = encoding.alias.length; j < l; j++) {
          aliases[encoding.alias[j]] = name;
        }
      }
    }
  }

  orders.sort(function(a, b) {
    return EncodingNames[a].order - EncodingNames[b].order;
  });

  return orders;
}());


/**
 * Encoding.
 *
 * @name Encoding
 * @type {Object}
 * @public
 * @class
 */
var Encoding = {
  /**
   * @lends Encoding
   */
  /**
   * Encoding orders.
   *
   * @ignore
   */
  orders: EncodingOrders,
  /**
   * Detects character encoding.
   *
   * If encodings is "AUTO", or the encoding-list as an array, or
   *   comma separated list string it will be detected automatically.
   *
   * @param {Array.<number>|TypedArray|string} data The data being detected.
   * @param {(Object|string|Array.<string>)=} [encodings] The encoding-list of
   *   character encoding.
   * @return {string|boolean} The detected character encoding, or false.
   *
   * @public
   * @function
   */
  detect: function(data, encodings) {
    if (data == null || data.length === 0) {
      return false;
    }

    if (isObject(encodings)) {
      encodings = encodings.encoding;
    }

    if (isString(data)) {
      data = stringToBuffer(data);
    }

    if (encodings == null) {
      encodings = Encoding.orders;
    } else {
      if (isString(encodings)) {
        encodings = encodings.toUpperCase();
        if (encodings === 'AUTO') {
          encodings = Encoding.orders;
        } else if (~encodings.indexOf(',')) {
          encodings = encodings.split(/\s*,\s*/);
        } else {
          encodings = [encodings];
        }
      }
    }

    var len = encodings.length;
    var e, encoding, method;
    for (var i = 0; i < len; i++) {
      e = encodings[i];
      encoding = assignEncodingName(e);
      if (!encoding) {
        continue;
      }

      method = 'is' + encoding;
      if (!hasOwnProperty.call(EncodingDetect, method)) {
        throw new Error('Undefined encoding: ' + e);
      }

      if (EncodingDetect[method](data)) {
        return encoding;
      }
    }

    return false;
  },
  /**
   * Convert character encoding.
   *
   * If `from` is "AUTO", or the encoding-list as an array, or
   *   comma separated list string it will be detected automatically.
   *
   * @param {Array.<number>|TypedArray|string} data The data being converted.
   * @param {(string|Object)} to The name of encoding to.
   * @param {(string|Array.<string>)=} [from] The encoding-list of
   *   character encoding.
   * @return {Array|TypedArray|string} The converted data.
   *
   * @public
   * @function
   */
  convert: function(data, to, from) {
    var result;
    var type;
    var options = {};

    if (isObject(to)) {
      options = to;
      from = options.from;
      to = options.to;
      if (options.type) {
        type = options.type;
      }
    }

    if (isString(data)) {
      type = type || 'string';
      data = stringToBuffer(data);
    } else if (data == null || data.length === 0) {
      data = [];
    }

    var encodingFrom;
    if (from != null && isString(from) &&
        from.toUpperCase() !== 'AUTO' && !~from.indexOf(',')) {
      encodingFrom = assignEncodingName(from);
    } else {
      encodingFrom = Encoding.detect(data);
    }

    var encodingTo = assignEncodingName(to);
    var method = encodingFrom + 'To' + encodingTo;

    if (hasOwnProperty.call(EncodingConvert, method)) {
      result = EncodingConvert[method](data, options);
    } else {
      // Returns the raw data if the method is undefined.
      result = data;
    }

    switch (('' + type).toLowerCase()) {
      case 'string':
        return codeToString_fast(result);
      case 'arraybuffer':
        return codeToBuffer(result);
      case 'array':
        /* falls through */
      default:
        return bufferToCode(result);
    }
  },
  /**
   * Encode a character code array to URL string like encodeURIComponent.
   *
   * @param {Array.<number>|TypedArray} data The data being encoded.
   * @return {string} The percent encoded string.
   *
   * @public
   * @function
   */
  urlEncode: function(data) {
    if (isString(data)) {
      data = stringToBuffer(data);
    }

    var alpha = stringToCode('0123456789ABCDEF');
    var results = [];
    var i = 0;
    var len = data && data.length;
    var b;

    for (; i < len; i++) {
      b = data[i];

      //FIXME: JavaScript UTF-16 encoding
      if (b > 0xFF) {
        return encodeURIComponent(codeToString_fast(data));
      }

      if ((b >= 0x61 /*a*/ && b <= 0x7A /*z*/) ||
          (b >= 0x41 /*A*/ && b <= 0x5A /*Z*/) ||
          (b >= 0x30 /*0*/ && b <= 0x39 /*9*/) ||
          b === 0x21 /*!*/ ||
          (b >= 0x27 /*'*/ && b <= 0x2A /***/) ||
          b === 0x2D /*-*/ || b === 0x2E /*.*/ ||
          b === 0x5F /*_*/ || b === 0x7E /*~*/
      ) {
        results[results.length] = b;
      } else {
        results[results.length] = 0x25; /*%*/
        if (b < 0x10) {
          results[results.length] = 0x30; /*0*/
          results[results.length] = alpha[b];
        } else {
          results[results.length] = alpha[b >> 4 & 0xF];
          results[results.length] = alpha[b & 0xF];
        }
      }
    }

    return codeToString_fast(results);
  },
  /**
   * Decode a percent encoded string to
   *  character code array like decodeURIComponent.
   *
   * @param {string} string The data being decoded.
   * @return {Array.<number>} The decoded array.
   *
   * @public
   * @function
   */
  urlDecode: function(string) {
    var results = [];
    var i = 0;
    var len = string && string.length;
    var c;

    while (i < len) {
      c = string.charCodeAt(i++);
      if (c === 0x25 /*%*/) {
        results[results.length] = parseInt(
          string.charAt(i++) + string.charAt(i++), 16);
      } else {
        results[results.length] = c;
      }
    }

    return results;
  },
  /**
   * Encode a character code array to Base64 encoded string.
   *
   * @param {Array.<number>|TypedArray} data The data being encoded.
   * @return {string} The Base64 encoded string.
   *
   * @public
   * @function
   */
  base64Encode: function(data) {
    if (isString(data)) {
      data = stringToBuffer(data);
    }
    return base64encode(data);
  },
  /**
   * Decode a Base64 encoded string to character code array.
   *
   * @param {string} string The data being decoded.
   * @return {Array.<number>} The decoded array.
   *
   * @public
   * @function
   */
  base64Decode: function(string) {
    return base64decode(string);
  },
  /**
   * Joins a character code array to string.
   *
   * @param {Array.<number>|TypedArray} data The data being joined.
   * @return {String} The joined string.
   *
   * @public
   * @function
   */
  codeToString: codeToString_fast,
  /**
   * Splits string to an array of character codes.
   *
   * @param {string} string The input string.
   * @return {Array.<number>} The character code array.
   *
   * @public
   * @function
   */
  stringToCode: stringToCode,
  /**
   * 全角英数記号文字を半角英数記号文字に変換
   *
   * Convert the ascii symbols and alphanumeric characters to
   *   the zenkaku symbols and alphanumeric characters.
   *
   * @example
   *   console.log(Encoding.toHankakuCase('Ｈｅｌｌｏ Ｗｏｒｌｄ！ １２３４５'));
   *   // 'Hello World! 12345'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toHankakuCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c >= 0xFF01 && c <= 0xFF5E) {
        c -= 0xFEE0;
      }
      results[results.length] = c;
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 半角英数記号文字を全角英数記号文字に変換
   *
   * Convert to the zenkaku symbols and alphanumeric characters
   *  from the ascii symbols and alphanumeric characters.
   *
   * @example
   *   console.log(Encoding.toZenkakuCase('Hello World! 12345'));
   *   // 'Ｈｅｌｌｏ Ｗｏｒｌｄ！ １２３４５'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toZenkakuCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c >= 0x21 && c <= 0x7E) {
        c += 0xFEE0;
      }
      results[results.length] = c;
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 全角カタカナを全角ひらがなに変換
   *
   * Convert to the zenkaku hiragana from the zenkaku katakana.
   *
   * @example
   *   console.log(Encoding.toHiraganaCase('ボポヴァアィイゥウェエォオ'));
   *   // 'ぼぽう゛ぁあぃいぅうぇえぉお'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toHiraganaCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c >= 0x30A1 && c <= 0x30F6) {
        c -= 0x0060;
      // 「ワ゛」 => 「わ」 + 「゛」
      } else if (c === 0x30F7) {
        results[results.length] = 0x308F;
        c = 0x309B;
      // 「ヲ゛」 => 「を」 + 「゛」
      } else if (c === 0x30FA) {
        results[results.length] = 0x3092;
        c = 0x309B;
      }
      results[results.length] = c;
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 全角ひらがなを全角カタカナに変換
   *
   * Convert to the zenkaku katakana from the zenkaku hiragana.
   *
   * @example
   *   console.log(Encoding.toKatakanaCase('ぼぽう゛ぁあぃいぅうぇえぉお'));
   *   // 'ボポヴァアィイゥウェエォオ'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toKatakanaCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c >= 0x3041 && c <= 0x3096) {
        if ((c === 0x308F || // 「わ」 + 「゛」 => 「ワ゛」
             c === 0x3092) && // 「を」 + 「゛」 => 「ヲ゛」
            i < len && data[i] === 0x309B) {
          c = c === 0x308F ? 0x30F7 : 0x30FA;
          i++;
        } else {
          c += 0x0060;
        }
      }
      results[results.length] = c;
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 全角カタカナを半角ｶﾀｶﾅに変換
   *
   * Convert to the hankaku katakana from the zenkaku katakana.
   *
   * @example
   *   console.log(Encoding.toHankanaCase('ボポヴァアィイゥウェエォオ'));
   *   // 'ﾎﾞﾎﾟｳﾞｧｱｨｲｩｳｪｴｫｵ'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toHankanaCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c, d, t;

    while (i < len) {
      c = data[i++];

      if (c >= 0x3001 && c <= 0x30FC) {
        t = hankanaCase_table[c];
        if (t !== void 0) {
          results[results.length] = t;
          continue;
        }
      }

      // 「ヴ」, 「ワ」+「゛」, 「ヲ」+「゛」
      if (c === 0x30F4 || c === 0x30F7 || c === 0x30FA) {
        results[results.length] = hankanaCase_sonants[c];
        results[results.length] = 0xFF9E;
        // 「カ」 - 「ド」
      } else if (c >= 0x30AB && c <= 0x30C9) {
        results[results.length] = hankanaCase_table[c - 1];
        results[results.length] = 0xFF9E;
        // 「ハ」 - 「ポ」
      } else if (c >= 0x30CF && c <= 0x30DD) {
        d = c % 3;
        results[results.length] = hankanaCase_table[c - d];
        results[results.length] = hankanaCase_marks[d - 1];
      } else {
        results[results.length] = c;
      }
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 半角ｶﾀｶﾅを全角カタカナに変換 (濁音含む)
   *
   * Convert to the zenkaku katakana from the hankaku katakana.
   *
   * @example
   *   console.log(Encoding.toZenkanaCase('ﾎﾞﾎﾟｳﾞｧｱｨｲｩｳｪｴｫｵ'));
   *   // 'ボポヴァアィイゥウェエォオ'
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toZenkanaCase: function(data) {
    var asString = false;
    if (isString(data)) {
      asString = true;
      data = stringToBuffer(data);
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c, code, next;

    for (i = 0; i < len; i++) {
      c = data[i];
      // Hankaku katakana
      if (c > 0xFF60 && c < 0xFFA0) {
        code = zenkanaCase_table[c - 0xFF61];
        if (i + 1 < len) {
          next = data[i + 1];
          // 「ﾞ」 + 「ヴ」
          if (next === 0xFF9E && c === 0xFF73) {
            code = 0x30F4;
            i++;
          // 「ﾞ」 + 「ワ゛」
          } else if (next === 0xFF9E && c === 0xFF9C) {
            code = 0x30F7;
            i++;
          // 「ﾞ」 + 「ｦ゛」
          } else if (next === 0xFF9E && c === 0xFF66) {
            code = 0x30FA;
            i++;
            // 「ﾞ」 + 「カ」 - 「コ」 or 「ハ」 - 「ホ」
          } else if (next === 0xFF9E &&
                     ((c > 0xFF75 && c < 0xFF85) ||
                      (c > 0xFF89 && c < 0xFF8F))) {
            code++;
            i++;
            // 「ﾟ」 + 「ハ」 - 「ホ」
          } else if (next === 0xFF9F &&
                     (c > 0xFF89 && c < 0xFF8F)) {
            code += 2;
            i++;
          }
        }
        c = code;
      }
      results[results.length] = c;
    }

    return asString ? codeToString_fast(results) : results;
  },
  /**
   * 全角スペースを半角スペースに変換
   *
   * Convert the em space(U+3000) to the single space(U+0020).
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toHankakuSpace: function(data) {
    if (isString(data)) {
      return data.replace(/\u3000/g, ' ');
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c === 0x3000) {
        c = 0x20;
      }
      results[results.length] = c;
    }

    return results;
  },
  /**
   * 半角スペースを全角スペースに変換
   *
   * Convert the single space(U+0020) to the em space(U+3000).
   *
   * @param {Array.<number>|TypedArray|string} data The input unicode data.
   * @return {Array.<number>|string} The conveted data.
   *
   * @public
   * @function
   */
  toZenkakuSpace: function(data) {
    if (isString(data)) {
      return data.replace(/\u0020/g, '\u3000');
    }

    var results = [];
    var len = data && data.length;
    var i = 0;
    var c;

    while (i < len) {
      c = data[i++];
      if (c === 0x20) {
        c = 0x3000;
      }
      results[results.length] = c;
    }

    return results;
  }
};


/**
 * @private
 * @ignore
 */
var EncodingDetect = {
  isBINARY: isBINARY,
  isASCII: isASCII,
  isJIS: isJIS,
  isEUCJP: isEUCJP,
  isSJIS: isSJIS,
  isUTF8: isUTF8,
  isUTF16: isUTF16,
  isUTF16BE: isUTF16BE,
  isUTF16LE: isUTF16LE,
  isUTF32: isUTF32,
  isUNICODE: isUNICODE
};

/**
 * @private
 * @ignore
 */
var EncodingConvert = {
  // JIS, EUCJP, SJIS
  JISToEUCJP: JISToEUCJP,
  EUCJPToJIS: EUCJPToJIS,
  JISToSJIS: JISToSJIS,
  SJISToJIS: SJISToJIS,
  EUCJPToSJIS: EUCJPToSJIS,
  SJISToEUCJP: SJISToEUCJP,

  // UTF8
  JISToUTF8: JISToUTF8,
  UTF8ToJIS: UTF8ToJIS,
  EUCJPToUTF8: EUCJPToUTF8,
  UTF8ToEUCJP: UTF8ToEUCJP,
  SJISToUTF8: SJISToUTF8,
  UTF8ToSJIS: UTF8ToSJIS,

  // UNICODE
  UNICODEToUTF8: UNICODEToUTF8,
  UTF8ToUNICODE: UTF8ToUNICODE,
  UNICODEToJIS: UNICODEToJIS,
  JISToUNICODE: JISToUNICODE,
  UNICODEToEUCJP: UNICODEToEUCJP,
  EUCJPToUNICODE: EUCJPToUNICODE,
  UNICODEToSJIS: UNICODEToSJIS,
  SJISToUNICODE: SJISToUNICODE,

  // UTF16, UNICODE
  UNICODEToUTF16: UNICODEToUTF16,
  UTF16ToUNICODE: UTF16ToUNICODE,
  UNICODEToUTF16BE: UNICODEToUTF16BE,
  UTF16BEToUNICODE: UTF16BEToUNICODE,
  UNICODEToUTF16LE: UNICODEToUTF16LE,
  UTF16LEToUNICODE: UTF16LEToUNICODE,

  // UTF16, UTF16BE, UTF16LE
  UTF8ToUTF16: UTF8ToUTF16,
  UTF16ToUTF8: UTF16ToUTF8,
  UTF8ToUTF16BE: UTF8ToUTF16BE,
  UTF16BEToUTF8: UTF16BEToUTF8,
  UTF8ToUTF16LE: UTF8ToUTF16LE,
  UTF16LEToUTF8: UTF16LEToUTF8,
  UTF16ToUTF16BE: UTF16ToUTF16BE,
  UTF16BEToUTF16: UTF16BEToUTF16,
  UTF16ToUTF16LE: UTF16ToUTF16LE,
  UTF16LEToUTF16: UTF16LEToUTF16,
  UTF16BEToUTF16LE: UTF16BEToUTF16LE,
  UTF16LEToUTF16BE: UTF16LEToUTF16BE,

  // UTF16, JIS
  JISToUTF16: JISToUTF16,
  UTF16ToJIS: UTF16ToJIS,
  JISToUTF16BE: JISToUTF16BE,
  UTF16BEToJIS: UTF16BEToJIS,
  JISToUTF16LE: JISToUTF16LE,
  UTF16LEToJIS: UTF16LEToJIS,

  // UTF16, EUCJP
  EUCJPToUTF16: EUCJPToUTF16,
  UTF16ToEUCJP: UTF16ToEUCJP,
  EUCJPToUTF16BE: EUCJPToUTF16BE,
  UTF16BEToEUCJP: UTF16BEToEUCJP,
  EUCJPToUTF16LE: EUCJPToUTF16LE,
  UTF16LEToEUCJP: UTF16LEToEUCJP,

  // UTF16, SJIS
  SJISToUTF16: SJISToUTF16,
  UTF16ToSJIS: UTF16ToSJIS,
  SJISToUTF16BE: SJISToUTF16BE,
  UTF16BEToSJIS: UTF16BEToSJIS,
  SJISToUTF16LE: SJISToUTF16LE,
  UTF16LEToSJIS: UTF16LEToSJIS
};


/**
 * Binary (exe, images and so, etc.)
 *
 * Note:
 *   This function is not considered for Unicode
 *
 * @private
 * @ignore
 */
function isBINARY(data) {
  var i = 0;
  var len = data && data.length;
  var c;

  for (; i < len; i++) {
    c = data[i];
    if (c > 0xFF) {
      return false;
    }

    if ((c >= 0x00 && c <= 0x07) || c === 0xFF) {
      return true;
    }
  }

  return false;
}

/**
 * ASCII (ISO-646)
 *
 * @private
 * @ignore
 */
function isASCII(data) {
  var i = 0;
  var len = data && data.length;
  var b;

  for (; i < len; i++) {
    b = data[i];
    if (b > 0xFF ||
        (b >= 0x80 && b <= 0xFF) ||
        b === 0x1B) {
      return false;
    }
  }

  return true;
}

/**
 * ISO-2022-JP (JIS)
 *
 * RFC1468 Japanese Character Encoding for Internet Messages
 * RFC1554 ISO-2022-JP-2: Multilingual Extension of ISO-2022-JP
 * RFC2237 Japanese Character Encoding for Internet Messages
 *
 * @private
 * @ignore
 */
function isJIS(data) {
  var i = 0;
  var len = data && data.length;
  var b, esc1, esc2;

  for (; i < len; i++) {
    b = data[i];
    if (b > 0xFF || (b >= 0x80 && b <= 0xFF)) {
      return false;
    }

    if (b === 0x1B) {
      if (i + 2 >= len) {
        return false;
      }

      esc1 = data[i + 1];
      esc2 = data[i + 2];
      if (esc1 === 0x24) {
        if (esc2 === 0x28 ||  // JIS X 0208-1990/2000/2004
            esc2 === 0x40 ||  // JIS X 0208-1978
            esc2 === 0x42) {  // JIS X 0208-1983
          return true;
        }
      } else if (esc1 === 0x26 && // JIS X 0208-1990
                 esc2 === 0x40) {
        return true;
      } else if (esc1 === 0x28) {
        if (esc2 === 0x42 || // ASCII
            esc2 === 0x49 || // JIS X 0201 Halfwidth Katakana
            esc2 === 0x4A) { // JIS X 0201-1976 Roman set
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * EUC-JP
 *
 * @private
 * @ignore
 */
function isEUCJP(data) {
  var i = 0;
  var len = data && data.length;
  var b;

  for (; i < len; i++) {
    b = data[i];
    if (b < 0x80) {
      continue;
    }

    if (b > 0xFF || b < 0x8E) {
      return false;
    }

    if (b === 0x8E) {
      if (i + 1 >= len) {
        return false;
      }

      b = data[++i];
      if (b < 0xA1 || 0xDF < b) {
        return false;
      }
    } else if (b === 0x8F) {
      if (i + 2 >= len) {
        return false;
      }

      b = data[++i];
      if (b < 0xA2 || 0xED < b) {
        return false;
      }

      b = data[++i];
      if (b < 0xA1 || 0xFE < b) {
        return false;
      }
    } else if (0xA1 <= b && b <= 0xFE) {
      if (i + 1 >= len) {
        return false;
      }

      b = data[++i];
      if (b < 0xA1 || 0xFE < b) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Shift-JIS (SJIS)
 *
 * @private
 * @ignore
 */
function isSJIS(data) {
  var i = 0;
  var len = data && data.length;
  var b;

  while (i < len && data[i] > 0x80) {
    if (data[i++] > 0xFF) {
      return false;
    }
  }

  for (; i < len; i++) {
    b = data[i];
    if (b <= 0x80 ||
        (0xA1 <= b && b <= 0xDF)) {
      continue;
    }

    if (b === 0xA0 || b > 0xEF || i + 1 >= len) {
      return false;
    }

    b = data[++i];
    if (b < 0x40 || b === 0x7F || b > 0xFC) {
      return false;
    }
  }

  return true;
}

/**
 * UTF-8
 *
 * @private
 * @ignore
 */
function isUTF8(data) {
  var i = 0;
  var len = data && data.length;
  var b;

  for (; i < len; i++) {
    b = data[i];
    if (b > 0xFF) {
      return false;
    }

    if (b === 0x09 || b === 0x0A || b === 0x0D ||
        (b >= 0x20 && b <= 0x7E)) {
      continue;
    }

    if (b >= 0xC2 && b <= 0xDF) {
      if (i + 1 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xBF) {
        return false;
      }
      i++;
    } else if (b === 0xE0) {
      if (i + 2 >= len ||
          data[i + 1] < 0xA0 || data[i + 1] > 0xBF ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
        return false;
      }
      i += 2;
    } else if ((b >= 0xE1 && b <= 0xEC) ||
                b === 0xEE || b === 0xEF) {
      if (i + 2 >= len ||
          data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
        return false;
      }
      i += 2;
    } else if (b === 0xED) {
      if (i + 2 >= len ||
          data[i + 1] < 0x80 || data[i + 1] > 0x9F ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
        return false;
      }
      i += 2;
    } else if (b === 0xF0) {
      if (i + 3 >= len ||
          data[i + 1] < 0x90 || data[i + 1] > 0xBF ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
        return false;
      }
      i += 3;
    } else if (b >= 0xF1 && b <= 0xF3) {
      if (i + 3 >= len ||
          data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
        return false;
      }
      i += 3;
    } else if (b === 0xF4) {
      if (i + 3 >= len ||
          data[i + 1] < 0x80 || data[i + 1] > 0x8F ||
          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
        return false;
      }
      i += 3;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * UTF-16 (LE or BE)
 *
 * RFC2781: UTF-16, an encoding of ISO 10646
 *
 * @link http://www.ietf.org/rfc/rfc2781.txt
 * @private
 * @ignore
 */
function isUTF16(data) {
  var i = 0;
  var len = data && data.length;
  var pos = null;
  var b1, b2, next, prev;

  if (len < 2) {
    if (data[0] > 0xFF) {
      return false;
    }
  } else {
    b1 = data[0];
    b2 = data[1];
    if (b1 === 0xFF && // BOM (little-endian)
        b2 === 0xFE) {
      return true;
    }
    if (b1 === 0xFE && // BOM (big-endian)
        b2 === 0xFF) {
      return true;
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i;
        break;
      } else if (data[i] > 0xFF) {
        return false;
      }
    }

    if (pos === null) {
      return false; // Non ASCII
    }

    next = data[pos + 1]; // BE
    if (next !== void 0 && next > 0x00 && next < 0x80) {
      return true;
    }

    prev = data[pos - 1]; // LE
    if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
      return true;
    }
  }

  return false;
}

/**
 * UTF-16BE (big-endian)
 *
 * RFC 2781 4.3 Interpreting text labelled as UTF-16
 * Text labelled "UTF-16BE" can always be interpreted as being big-endian
 *  when BOM does not founds (SHOULD)
 *
 * @link http://www.ietf.org/rfc/rfc2781.txt
 * @private
 * @ignore
 */
function isUTF16BE(data) {
  var i = 0;
  var len = data && data.length;
  var pos = null;
  var b1, b2;

  if (len < 2) {
    if (data[0] > 0xFF) {
      return false;
    }
  } else {
    b1 = data[0];
    b2 = data[1];
    if (b1 === 0xFE && // BOM
        b2 === 0xFF) {
      return true;
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i;
        break;
      } else if (data[i] > 0xFF) {
        return false;
      }
    }

    if (pos === null) {
      return false; // Non ASCII
    }

    if (pos % 2 === 0) {
      return true;
    }
  }

  return false;
}

/**
 * UTF-16LE (little-endian)
 *
 * @see isUTF16BE
 * @private
 * @ignore
 */
function isUTF16LE(data) {
  var i = 0;
  var len = data && data.length;
  var pos = null;
  var b1, b2;

  if (len < 2) {
    if (data[0] > 0xFF) {
      return false;
    }
  } else {
    b1 = data[0];
    b2 = data[1];
    if (b1 === 0xFF && // BOM
        b2 === 0xFE) {
      return true;
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i;
        break;
      } else if (data[i] > 0xFF) {
        return false;
      }
    }

    if (pos === null) {
      return false; // Non ASCII
    }

    if (pos % 2 !== 0) {
      return true;
    }
  }

  return false;
}

/**
 * UTF-32
 *
 * Unicode 3.2.0: Unicode Standard Annex #19
 *
 * @link http://www.iana.org/assignments/charset-reg/UTF-32
 * @link http://www.unicode.org/reports/tr19/tr19-9.html
 * @private
 * @ignore
 */
function isUTF32(data) {
  var i = 0;
  var len = data && data.length;
  var pos = null;
  var b1, b2, b3, b4;
  var next, prev;

  if (len < 4) {
    for (; i < len; i++) {
      if (data[i] > 0xFF) {
        return false;
      }
    }
  } else {
    b1 = data[0];
    b2 = data[1];
    b3 = data[2];
    b4 = data[3];
    if (b1 === 0x00 && b2 === 0x00 && // BOM (big-endian)
        b3 === 0xFE && b4 === 0xFF) {
      return true;
    }

    if (b1 === 0xFF && b2 === 0xFE && // BOM (little-endian)
        b3 === 0x00 && b4 === 0x00) {
      return true;
    }

    for (; i < len; i++) {
      if (data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00) {
        pos = i;
        break;
      } else if (data[i] > 0xFF) {
        return false;
      }
    }

    if (pos === null) {
      return false;
    }

    // The byte order should be the big-endian when BOM is not detected.
    next = data[pos + 3];
    if (next !== void 0 && next > 0x00 && next <= 0x7F) {
      // big-endian
      return data[pos + 2] === 0x00 && data[pos + 1] === 0x00;
    }

    prev = data[pos - 1];
    if (prev !== void 0 && prev > 0x00 && prev <= 0x7F) {
      // little-endian
      return data[pos + 1] === 0x00 && data[pos + 2] === 0x00;
    }
  }

  return false;
}

/**
 * JavaScript Unicode array
 *
 * @private
 * @ignore
 */
function isUNICODE(data) {
  var i = 0;
  var len = data && data.length;
  var c;

  for (; i < len; i++) {
    c = data[i];
    if (c < 0 || c > 0x10FFFF) {
      return false;
    }
  }

  return true;
}


/**
 * JIS to SJIS
 *
 * @private
 * @ignore
 */
function JISToSJIS(data) {
  var results = [];
  var index = 0;
  var i = 0;
  var len = data && data.length;
  var b1, b2;

  for (; i < len; i++) {
    // escape sequence
    while (data[i] === 0x1B) {
      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
        index = 1;
      } else if ((data[i + 1] === 0x28 && data[i + 2] === 0x49)) {
        index = 2;
      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
                 data[i + 3] === 0x44) {
        index = 3;
        i++;
      } else {
        index = 0;
      }

      i += 3;
      if (data[i] === void 0) {
        return results;
      }
    }

    if (index === 1) {
      b1 = data[i];
      b2 = data[++i];
      if (b1 & 0x01) {
        b1 >>= 1;
        if (b1 < 0x2F) {
          b1 += 0x71;
        } else {
          b1 -= 0x4F;
        }
        if (b2 > 0x5F) {
          b2 += 0x20;
        } else {
          b2 += 0x1F;
        }
      } else {
        b1 >>= 1;
        if (b1 <= 0x2F) {
          b1 += 0x70;
        } else {
          b1 -= 0x50;
        }
        b2 += 0x7E;
      }
      results[results.length] = b1 & 0xFF;
      results[results.length] = b2 & 0xFF;
    } else if (index === 2) {
      results[results.length] = data[i] + 0x80 & 0xFF;
    } else if (index === 3) {
      // Shift_JIS cannot convert JIS X 0212:1990.
      results[results.length] = UTF8_UNKNOWN;
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * JIS to EUCJP
 *
 * @private
 * @ignore
 */
function JISToEUCJP(data) {
  var results = [];
  var index = 0;
  var len = data && data.length;
  var i = 0;

  for (; i < len; i++) {

    // escape sequence
    while (data[i] === 0x1B) {
      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
        index = 1;
      } else if ((data[i + 1] === 0x28 && data[i + 2] === 0x49)) {
        index = 2;
      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
                 data[i + 3] === 0x44) {
        index = 3;
        i++;
      } else {
        index = 0;
      }

      i += 3;
      if (data[i] === void 0) {
        return results;
      }
    }

    if (index === 1) {
      results[results.length] = data[i] + 0x80 & 0xFF;
      results[results.length] = data[++i] + 0x80 & 0xFF;
    } else if (index === 2) {
      results[results.length] = 0x8E;
      results[results.length] = data[i] + 0x80 & 0xFF;
    } else if (index === 3) {
      results[results.length] = 0x8F;
      results[results.length] = data[i] + 0x80 & 0xFF;
      results[results.length] = data[++i] + 0x80 & 0xFF;
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * SJIS to JIS
 *
 * @private
 * @ignore
 */
function SJISToJIS(data) {
  var results = [];
  var index = 0;
  var len = data && data.length;
  var i = 0;
  var b1, b2;

  var esc = [
    0x1B, 0x28, 0x42,
    0x1B, 0x24, 0x42,
    0x1B, 0x28, 0x49
  ];

  for (; i < len; i++) {
    b1 = data[i];
    if (b1 >= 0xA1 && b1 <= 0xDF) {
      if (index !== 2) {
        index = 2;
        results[results.length] = esc[6];
        results[results.length] = esc[7];
        results[results.length] = esc[8];
      }
      results[results.length] = b1 - 0x80 & 0xFF;
    } else if (b1 >= 0x80) {
      if (index !== 1) {
        index = 1;
        results[results.length] = esc[3];
        results[results.length] = esc[4];
        results[results.length] = esc[5];
      }

      b1 <<= 1;
      b2 = data[++i];
      if (b2 < 0x9F) {
        if (b1 < 0x13F) {
          b1 -= 0xE1;
        } else {
          b1 -= 0x61;
        }
        if (b2 > 0x7E) {
          b2 -= 0x20;
        } else {
          b2 -= 0x1F;
        }
      } else {
        if (b1 < 0x13F) {
          b1 -= 0xE0;
        } else {
          b1 -= 0x60;
        }
        b2 -= 0x7E;
      }
      results[results.length] = b1 & 0xFF;
      results[results.length] = b2 & 0xFF;
    } else {
      if (index !== 0) {
        index = 0;
        results[results.length] = esc[0];
        results[results.length] = esc[1];
        results[results.length] = esc[2];
      }
      results[results.length] = b1 & 0xFF;
    }
  }

  if (index !== 0) {
    results[results.length] = esc[0];
    results[results.length] = esc[1];
    results[results.length] = esc[2];
  }

  return results;
}

/**
 * SJIS to EUCJP
 *
 * @private
 * @ignore
 */
function SJISToEUCJP(data) {
  var results = [];
  var len = data && data.length;
  var i = 0;
  var b1, b2;

  for (; i < len; i++) {
    b1 = data[i];
    if (b1 >= 0xA1 && b1 <= 0xDF) {
      results[results.length] = 0x8E;
      results[results.length] = b1;
    } else if (b1 >= 0x81) {
      b2 = data[++i];
      b1 <<= 1;
      if (b2 < 0x9F) {
        if (b1 < 0x13F) {
          b1 -= 0x61;
        } else {
          b1 -= 0xE1;
        }

        if (b2 > 0x7E) {
          b2 += 0x60;
        } else {
          b2 += 0x61;
        }
      } else {
        if (b1 < 0x13F) {
          b1 -= 0x60;
        } else {
          b1 -= 0xE0;
        }
        b2 += 0x02;
      }
      results[results.length] = b1 & 0xFF;
      results[results.length] = b2 & 0xFF;
    } else {
      results[results.length] = b1 & 0xFF;
    }
  }

  return results;
}

/**
 * EUCJP to JIS
 *
 * @private
 * @ignore
 */
function EUCJPToJIS(data) {
  var results = [];
  var index = 0;
  var len = data && data.length;
  var i = 0;
  var b;

  // escape sequence
  var esc = [
    0x1B, 0x28, 0x42,
    0x1B, 0x24, 0x42,
    0x1B, 0x28, 0x49,
    0x1B, 0x24, 0x28, 0x44
  ];

  for (; i < len; i++) {
    b = data[i];
    if (b === 0x8E) {
      if (index !== 2) {
        index = 2;
        results[results.length] = esc[6];
        results[results.length] = esc[7];
        results[results.length] = esc[8];
      }
      results[results.length] = data[++i] - 0x80 & 0xFF;
    } else if (b === 0x8F) {
      if (index !== 3) {
        index = 3;
        results[results.length] = esc[9];
        results[results.length] = esc[10];
        results[results.length] = esc[11];
        results[results.length] = esc[12];
      }
      results[results.length] = data[++i] - 0x80 & 0xFF;
      results[results.length] = data[++i] - 0x80 & 0xFF;
    } else if (b > 0x8E) {
      if (index !== 1) {
        index = 1;
        results[results.length] = esc[3];
        results[results.length] = esc[4];
        results[results.length] = esc[5];
      }
      results[results.length] = b - 0x80 & 0xFF;
      results[results.length] = data[++i] - 0x80 & 0xFF;
    } else {
      if (index !== 0) {
        index = 0;
        results[results.length] = esc[0];
        results[results.length] = esc[1];
        results[results.length] = esc[2];
      }
      results[results.length] = b & 0xFF;
    }
  }

  if (index !== 0) {
    results[results.length] = esc[0];
    results[results.length] = esc[1];
    results[results.length] = esc[2];
  }

  return results;
}

/**
 * EUCJP to SJIS
 *
 * @private
 * @ignore
 */
function EUCJPToSJIS(data) {
  var results = [];
  var len = data && data.length;
  var i = 0;
  var b1, b2;

  for (; i < len; i++) {
    b1 = data[i];
    if (b1 === 0x8F) {
      results[results.length] = UTF8_UNKNOWN;
      i += 2;
    } else if (b1 > 0x8E) {
      b2 = data[++i];
      if (b1 & 0x01) {
        b1 >>= 1;
        if (b1 < 0x6F) {
          b1 += 0x31;
        } else {
          b1 += 0x71;
        }

        if (b2 > 0xDF) {
          b2 -= 0x60;
        } else {
          b2 -= 0x61;
        }
      } else {
        b1 >>= 1;
        if (b1 <= 0x6F) {
          b1 += 0x30;
        } else {
          b1 += 0x70;
        }
        b2 -= 0x02;
      }
      results[results.length] = b1 & 0xFF;
      results[results.length] = b2 & 0xFF;
    } else if (b1 === 0x8E) {
      results[results.length] = data[++i] & 0xFF;
    } else {
      results[results.length] = b1 & 0xFF;
    }
  }

  return results;
}

/**
 * SJIS To UTF-8
 *
 * @private
 * @ignore
 */
function SJISToUTF8(data) {
  init_JIS_TO_UTF8_TABLE();

  var results = [];
  var i = 0;
  var len = data && data.length;
  var b, b1, b2, u2, u3, jis, utf8;

  for (; i < len; i++) {
    b = data[i];
    if (b >= 0xA1 && b <= 0xDF) {
      b2 = b - 0x40;
      u2 = 0xBC | ((b2 >> 6) & 0x03);
      u3 = 0x80 | (b2 & 0x3F);

      results[results.length] = 0xEF;
      results[results.length] = u2 & 0xFF;
      results[results.length] = u3 & 0xFF;
    } else if (b >= 0x80) {
      b1 = b << 1;
      b2 = data[++i];

      if (b2 < 0x9F) {
        if (b1 < 0x13F) {
          b1 -= 0xE1;
        } else {
          b1 -= 0x61;
        }

        if (b2 > 0x7E) {
          b2 -= 0x20;
        } else {
          b2 -= 0x1F;
        }
      } else {
        if (b1 < 0x13F) {
          b1 -= 0xE0;
        } else {
          b1 -= 0x60;
        }
        b2 -= 0x7E;
      }

      b1 &= 0xFF;
      jis = (b1 << 8) + b2;

      utf8 = JIS_TO_UTF8_TABLE[jis];
      if (utf8 === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (utf8 < 0xFFFF) {
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        } else {
          results[results.length] = utf8 >> 16 & 0xFF;
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * EUC-JP to UTF-8
 *
 * @private
 * @ignore
 */
function EUCJPToUTF8(data) {
  init_JIS_TO_UTF8_TABLE();

  var results = [];
  var i = 0;
  var len = data && data.length;
  var b, b2, u2, u3, j2, j3, jis, utf8;

  for (; i < len; i++) {
    b = data[i];
    if (b === 0x8E) {
      b2 = data[++i] - 0x40;
      u2 = 0xBC | ((b2 >> 6) & 0x03);
      u3 = 0x80 | (b2 & 0x3F);

      results[results.length] = 0xEF;
      results[results.length] = u2 & 0xFF;
      results[results.length] = u3 & 0xFF;
    } else if (b === 0x8F) {
      j2 = data[++i] - 0x80;
      j3 = data[++i] - 0x80;
      jis = (j2 << 8) + j3;

      utf8 = JISX0212_TO_UTF8_TABLE[jis];
      if (utf8 === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (utf8 < 0xFFFF) {
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        } else {
          results[results.length] = utf8 >> 16 & 0xFF;
          results[results.length] = utf8 >>  8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        }
      }
    } else if (b >= 0x80) {
      jis = ((b - 0x80) << 8) + (data[++i] - 0x80);

      utf8 = JIS_TO_UTF8_TABLE[jis];
      if (utf8 === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (utf8 < 0xFFFF) {
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        } else {
          results[results.length] = utf8 >> 16 & 0xFF;
          results[results.length] = utf8 >>  8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * JIS to UTF-8
 *
 * @private
 * @ignore
 */
function JISToUTF8(data) {
  init_JIS_TO_UTF8_TABLE();

  var results = [];
  var index = 0;
  var i = 0;
  var len = data && data.length;
  var b2, u2, u3, jis, utf8;

  for (; i < len; i++) {
    while (data[i] === 0x1B) {
      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
        index = 1;
      } else if (data[i + 1] === 0x28 && data[i + 2] === 0x49) {
        index = 2;
      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
                 data[i + 3] === 0x44) {
        index = 3;
        i++;
      } else {
        index = 0;
      }

      i += 3;
      if (data[i] === void 0) {
        return results;
      }
    }

    if (index === 1) {
      jis = (data[i] << 8) + data[++i];

      utf8 = JIS_TO_UTF8_TABLE[jis];
      if (utf8 === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (utf8 < 0xFFFF) {
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        } else {
          results[results.length] = utf8 >> 16 & 0xFF;
          results[results.length] = utf8 >>  8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        }
      }
    } else if (index === 2) {
      b2 = data[i] + 0x40;
      u2 = 0xBC | ((b2 >> 6) & 0x03);
      u3 = 0x80 | (b2 & 0x3F);

      results[results.length] = 0xEF;
      results[results.length] = u2 & 0xFF;
      results[results.length] = u3 & 0xFF;
    } else if (index === 3) {
      jis = (data[i] << 8) + data[++i];

      utf8 = JISX0212_TO_UTF8_TABLE[jis];
      if (utf8 === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (utf8 < 0xFFFF) {
          results[results.length] = utf8 >> 8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        } else {
          results[results.length] = utf8 >> 16 & 0xFF;
          results[results.length] = utf8 >>  8 & 0xFF;
          results[results.length] = utf8 & 0xFF;
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * UTF-8 to SJIS
 *
 * @private
 * @ignore
 */
function UTF8ToSJIS(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var b, b1, b2, utf8, jis;

  for (; i < len; i++) {
    b = data[i];
    if (b >= 0x80) {
      if (b <= 0xDF) {
        // 2 bytes.
        utf8 = (b << 8) + data[++i];
      } else {
        // 3 bytes.
        utf8 = (b << 16) +
               (data[++i] << 8) +
               (data[++i] & 0xFF);
      }

      jis = UTF8_TO_JIS_TABLE[utf8];
      if (jis === void 0) {
        results[results.length] = UTF8_UNKNOWN;
      } else {
        if (jis < 0xFF) {
          results[results.length] = jis + 0x80;
        } else {
          if (jis > 0x10000) {
            jis -= 0x10000;
          }

          b1 = jis >> 8;
          b2 = jis & 0xFF;
          if (b1 & 0x01) {
            b1 >>= 1;
            if (b1 < 0x2F) {
              b1 += 0x71;
            } else {
              b1 -= 0x4F;
            }

            if (b2 > 0x5F) {
              b2 += 0x20;
            } else {
              b2 += 0x1F;
            }
          } else {
            b1 >>= 1;
            if (b1 <= 0x2F) {
              b1 += 0x70;
            } else {
              b1 -= 0x50;
            }
            b2 += 0x7E;
          }
          results[results.length] = b1 & 0xFF;
          results[results.length] = b2 & 0xFF;
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * UTF-8 to EUC-JP
 *
 * @private
 * @ignore
 */
function UTF8ToEUCJP(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var b, utf8, jis;

  for (; i < len; i++) {
    b = data[i];
    if (b >= 0x80) {
      if (b <= 0xDF) {
        utf8 = (data[i++] << 8) + data[i];
      } else {
        utf8 = (data[i++] << 16) +
               (data[i++] << 8) +
               (data[i] & 0xFF);
      }

      jis = UTF8_TO_JIS_TABLE[utf8];
      if (jis === void 0) {
        jis = UTF8_TO_JISX0212_TABLE[utf8];
        if (jis === void 0) {
          results[results.length] = UTF8_UNKNOWN;
        } else {
          results[results.length] = 0x8F;
          results[results.length] = (jis >> 8) - 0x80 & 0xFF;
          results[results.length] = (jis & 0xFF) - 0x80 & 0xFF;
        }
      } else {
        if (jis > 0x10000) {
          jis -= 0x10000;
        }
        if (jis < 0xFF) {
          results[results.length] = 0x8E;
          results[results.length] = jis - 0x80 & 0xFF;
        } else {
          results[results.length] = (jis >> 8) - 0x80 & 0xFF;
          results[results.length] = (jis & 0xFF) - 0x80 & 0xFF;
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF;
    }
  }

  return results;
}

/**
 * UTF-8 to JIS
 *
 * @private
 * @ignore
 */
function UTF8ToJIS(data) {
  var results = [];
  var index = 0;
  var len = data && data.length;
  var i = 0;
  var b, utf8, jis;
  var esc = [
    0x1B, 0x28, 0x42,
    0x1B, 0x24, 0x42,
    0x1B, 0x28, 0x49,
    0x1B, 0x24, 0x28, 0x44
  ];

  for (; i < len; i++) {
    b = data[i];
    if (b < 0x80) {
      if (index !== 0) {
        index = 0;
        results[results.length] = esc[0];
        results[results.length] = esc[1];
        results[results.length] = esc[2];
      }
      results[results.length] = b & 0xFF;
    } else {
      if (b <= 0xDF) {
        utf8 = (data[i] << 8) + data[++i];
      } else {
        utf8 = (data[i] << 16) + (data[++i] << 8) + data[++i];
      }

      jis = UTF8_TO_JIS_TABLE[utf8];
      if (jis === void 0) {
        jis = UTF8_TO_JISX0212_TABLE[utf8];
        if (jis === void 0) {
          if (index !== 0) {
            index = 0;
            results[results.length] = esc[0];
            results[results.length] = esc[1];
            results[results.length] = esc[2];
          }
          results[results.length] = UTF8_UNKNOWN;
        } else {
          // JIS X 0212:1990
          if (index !== 3) {
            index = 3;
            results[results.length] = esc[9];
            results[results.length] = esc[10];
            results[results.length] = esc[11];
            results[results.length] = esc[12];
          }
          results[results.length] = jis >> 8 & 0xFF;
          results[results.length] = jis & 0xFF;
        }
      } else {
        if (jis > 0x10000) {
          jis -= 0x10000;
        }
        if (jis < 0xFF) {
          // Halfwidth Katakana
          if (index !== 2) {
            index = 2;
            results[results.length] = esc[6];
            results[results.length] = esc[7];
            results[results.length] = esc[8];
          }
          results[results.length] = jis & 0xFF;
        } else {
          if (index !== 1) {
            index = 1;
            results[results.length] = esc[3];
            results[results.length] = esc[4];
            results[results.length] = esc[5];
          }
          results[results.length] = jis >> 8 & 0xFF;
          results[results.length] = jis & 0xFF;
        }
      }
    }
  }

  if (index !== 0) {
    results[results.length] = esc[0];
    results[results.length] = esc[1];
    results[results.length] = esc[2];
  }

  return results;
}

/**
 * UTF-16 (JavaScript Unicode array) to UTF-8
 *
 * @private
 * @ignore
 */
function UNICODEToUTF8(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c, second;

  for (; i < len; i++) {
    c = data[i];

    // high surrogate
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < len) {
      second = data[i + 1];
      // low surrogate
      if (second >= 0xDC00 && second <= 0xDFFF) {
        c = (c - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        i++;
      }
    }

    if (c < 0x80) {
      results[results.length] = c;
    } else if (c < 0x800) {
      results[results.length] = 0xC0 | ((c >> 6) & 0x1F);
      results[results.length] = 0x80 | (c & 0x3F);
    } else if (c < 0x10000) {
      results[results.length] = 0xE0 | ((c >> 12) & 0xF);
      results[results.length] = 0x80 | ((c >> 6) & 0x3F);
      results[results.length] = 0x80 | (c & 0x3F);
    } else if (c < 0x200000) {
      results[results.length] = 0xF0 | ((c >> 18) & 0xF);
      results[results.length] = 0x80 | ((c >> 12) & 0x3F);
      results[results.length] = 0x80 | ((c >> 6) & 0x3F);
      results[results.length] = 0x80 | (c & 0x3F);
    }
  }

  return results;
}

/**
 * UTF-8 to UTF-16 (JavaScript Unicode array)
 *
 * @private
 * @ignore
 */
function UTF8ToUNICODE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var n, c, c2, c3, c4, code;

  while (i < len) {
    c = data[i++];
    n = c >> 4;
    if (n >= 0 && n <= 7) {
      // 0xxx xxxx
      code = c;
    } else if (n === 12 || n === 13) {
      // 110x xxxx
      // 10xx xxxx
      c2 = data[i++];
      code = ((c & 0x1F) << 6) | (c2 & 0x3F);
    } else if (n === 14) {
      // 1110 xxxx
      // 10xx xxxx
      // 10xx xxxx
      c2 = data[i++];
      c3 = data[i++];
      code = ((c & 0x0F) << 12) |
             ((c2 & 0x3F) << 6) |
              (c3 & 0x3F);
    } else if (n === 15) {
      // 1111 0xxx
      // 10xx xxxx
      // 10xx xxxx
      // 10xx xxxx
      c2 = data[i++];
      c3 = data[i++];
      c4 = data[i++];
      code = ((c & 0x7) << 18)   |
             ((c2 & 0x3F) << 12) |
             ((c3 & 0x3F) << 6)  |
              (c4 & 0x3F);
    }

    if (code <= 0xFFFF) {
      results[results.length] = code;
    } else {
      // Split in surrogate halves
      code -= 0x10000;
      results[results.length] = (code >> 10) + 0xD800; // High surrogate
      results[results.length] = (code % 0x400) + 0xDC00; // Low surrogate
    }
  }

  return results;
}

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16
 *
 * UTF-16BE (big-endian)
 * Note: this function does not prepend the BOM by default.
 *
 * RFC 2781 4.3 Interpreting text labelled as UTF-16
 *   If the first two octets of the text is not 0xFE followed by
 *   0xFF, and is not 0xFF followed by 0xFE, then the text SHOULD be
 *   interpreted as being big-endian.
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UNICODEToUTF16(data, options) {
  var results;

  if (options && options.bom) {
    var optBom = options.bom;
    if (!isString(optBom)) {
      optBom = 'BE';
    }

    var bom, utf16;
    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xFE, 0xFF];
      utf16 = UNICODEToUTF16BE(data);
    } else {
      // Little-endian
      bom = [0xFF, 0xFE];
      utf16 = UNICODEToUTF16LE(data);
    }

    results = [];
    results[0] = bom[0];
    results[1] = bom[1];

    for (var i = 0, len = utf16.length; i < len; i++) {
      results[results.length] = utf16[i];
    }
  } else {
    // Without BOM: Convert as BE (SHOULD).
    results = UNICODEToUTF16BE(data);
  }

  return results;
}

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16BE
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UNICODEToUTF16BE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c;

  while (i < len) {
    c = data[i++];
    if (c <= 0xFF) {
      results[results.length] = 0;
      results[results.length] = c;
    } else if (c <= 0xFFFF) {
      results[results.length] = c >> 8 & 0xFF;
      results[results.length] = c & 0xFF;
    }
  }

  return results;
}

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16LE
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UNICODEToUTF16LE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c;

  while (i < len) {
    c = data[i++];
    if (c <= 0xFF) {
      results[results.length] = c;
      results[results.length] = 0;
    } else if (c <= 0xFFFF) {
      results[results.length] = c & 0xFF;
      results[results.length] = c >> 8 & 0xFF;
    }
  }

  return results;
}

/**
 * UTF-16BE to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UTF16BEToUNICODE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c1, c2;

  if (len >= 2 &&
      ((data[0] === 0xFE && data[1] === 0xFF) ||
       (data[0] === 0xFF && data[1] === 0xFE))
  ) {
    i = 2;
  }

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];
    if (c1 === 0) {
      results[results.length] = c2;
    } else {
      results[results.length] = ((c1 & 0xFF) << 8) | (c2 & 0xFF);
    }
  }

  return results;
}

/**
 * UTF-16LE to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UTF16LEToUNICODE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c1, c2;

  if (len >= 2 &&
      ((data[0] === 0xFE && data[1] === 0xFF) ||
       (data[0] === 0xFF && data[1] === 0xFE))
  ) {
    i = 2;
  }

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];
    if (c2 === 0) {
      results[results.length] = c1;
    } else {
      results[results.length] = ((c2 & 0xFF) << 8) | (c1 & 0xFF);
    }
  }

  return results;
}

/**
 * UTF-16 to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 *
 * @private
 * @ignore
 */
function UTF16ToUNICODE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var isLE = false;
  var first = true;
  var c1, c2;

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];

    if (first && i === 2) {
      first = false;
      if (c1 === 0xFE && c2 === 0xFF) {
        isLE = false;
      } else if (c1 === 0xFF && c2 === 0xFE) {
        // Little-endian
        isLE = true;
      } else {
        isLE = isUTF16LE(data);
        i = 0;
      }
      continue;
    }

    if (isLE) {
      if (c2 === 0) {
        results[results.length] = c1;
      } else {
        results[results.length] = ((c2 & 0xFF) << 8) | (c1 & 0xFF);
      }
    } else {
      if (c1 === 0) {
        results[results.length] = c2;
      } else {
        results[results.length] = ((c1 & 0xFF) << 8) | (c2 & 0xFF);
      }
    }
  }

  return results;
}

/**
 * UTF-16 to UTF-16BE
 *
 * @private
 * @ignore
 */
function UTF16ToUTF16BE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var isLE = false;
  var first = true;
  var c1, c2;

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];

    if (first && i === 2) {
      first = false;
      if (c1 === 0xFE && c2 === 0xFF) {
        isLE = false;
      } else if (c1 === 0xFF && c2 === 0xFE) {
        // Little-endian
        isLE = true;
      } else {
        isLE = isUTF16LE(data);
        i = 0;
      }
      continue;
    }

    if (isLE) {
      results[results.length] = c2;
      results[results.length] = c1;
    } else {
      results[results.length] = c1;
      results[results.length] = c2;
    }
  }

  return results;
}

/**
 * UTF-16BE to UTF-16
 *
 * @private
 * @ignore
 */
function UTF16BEToUTF16(data, options) {
  var isLE = false;
  var bom;

  if (options && options.bom) {
    var optBom = options.bom;
    if (!isString(optBom)) {
      optBom = 'BE';
    }

    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xFE, 0xFF];
    } else {
      // Little-endian
      bom = [0xFF, 0xFE];
      isLE = true;
    }
  }

  var results = [];
  var len = data && data.length;
  var i = 0;

  if (len >= 2 &&
      ((data[0] === 0xFE && data[1] === 0xFF) ||
       (data[0] === 0xFF && data[1] === 0xFE))
  ) {
    i = 2;
  }

  if (bom) {
    results[0] = bom[0];
    results[1] = bom[1];
  }

  var c1, c2;
  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];

    if (isLE) {
      results[results.length] = c2;
      results[results.length] = c1;
    } else {
      results[results.length] = c1;
      results[results.length] = c2;
    }
  }

  return results;
}

/**
 * UTF-16 to UTF-16LE
 *
 * @private
 * @ignore
 */
function UTF16ToUTF16LE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var isLE = false;
  var first = true;
  var c1, c2;

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];

    if (first && i === 2) {
      first = false;
      if (c1 === 0xFE && c2 === 0xFF) {
        isLE = false;
      } else if (c1 === 0xFF && c2 === 0xFE) {
        // Little-endian
        isLE = true;
      } else {
        isLE = isUTF16LE(data);
        i = 0;
      }
      continue;
    }

    if (isLE) {
      results[results.length] = c1;
      results[results.length] = c2;
    } else {
      results[results.length] = c2;
      results[results.length] = c1;
    }
  }

  return results;
}

/**
 * UTF-16LE to UTF-16
 *
 * @private
 * @ignore
 */
function UTF16LEToUTF16(data, options) {
  var isLE = false;
  var bom;

  if (options && options.bom) {
    var optBom = options.bom;
    if (!isString(optBom)) {
      optBom = 'BE';
    }

    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xFE, 0xFF];
    } else {
      // Little-endian
      bom = [0xFF, 0xFE];
      isLE = true;
    }
  }

  var results = [];
  var len = data && data.length;
  var i = 0;

  if (len >= 2 &&
      ((data[0] === 0xFE && data[1] === 0xFF) ||
       (data[0] === 0xFF && data[1] === 0xFE))
  ) {
    i = 2;
  }

  if (bom) {
    results[0] = bom[0];
    results[1] = bom[1];
  }

  var c1, c2;
  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];

    if (isLE) {
      results[results.length] = c1;
      results[results.length] = c2;
    } else {
      results[results.length] = c2;
      results[results.length] = c1;
    }
  }

  return results;
}

/**
 * UTF-16BE to UTF-16LE
 *
 * @private
 * @ignore
 */
function UTF16BEToUTF16LE(data) {
  var results = [];
  var i = 0;
  var len = data && data.length;
  var c1, c2;

  if (len >= 2 &&
      ((data[0] === 0xFE && data[1] === 0xFF) ||
       (data[0] === 0xFF && data[1] === 0xFE))
  ) {
    i = 2;
  }

  while (i < len) {
    c1 = data[i++];
    c2 = data[i++];
    results[results.length] = c2;
    results[results.length] = c1;
  }

  return results;
}

/**
 * UTF-16LE to UTF-16BE
 *
 * @private
 * @ignore
 */
function UTF16LEToUTF16BE(data) {
  return UTF16BEToUTF16LE(data);
}


/**
 * UTF-16 (JavaScript Unicode array) to JIS
 *
 * @private
 * @ignore
 */
function UNICODEToJIS(data) {
  return UTF8ToJIS(UNICODEToUTF8(data));
}

/**
 * JIS to UTF-16 (JavaScript Unicode array)
 *
 * @private
 * @ignore
 */
function JISToUNICODE(data) {
  return UTF8ToUNICODE(JISToUTF8(data));
}

/**
 * UTF-16 (JavaScript Unicode array) to EUCJP
 *
 * @private
 * @ignore
 */
function UNICODEToEUCJP(data) {
  return UTF8ToEUCJP(UNICODEToUTF8(data));
}

/**
 * EUCJP to UTF-16 (JavaScript Unicode array)
 *
 * @private
 * @ignore
 */
function EUCJPToUNICODE(data) {
  return UTF8ToUNICODE(EUCJPToUTF8(data));
}

/**
 * UTF-16 (JavaScript Unicode array) to SJIS
 *
 * @private
 * @ignore
 */
function UNICODEToSJIS(data) {
  return UTF8ToSJIS(UNICODEToUTF8(data));
}

/**
 * SJIS to UTF-16 (JavaScript Unicode array)
 *
 * @private
 * @ignore
 */
function SJISToUNICODE(data) {
  return UTF8ToUNICODE(SJISToUTF8(data));
}

/**
 * UTF-8 to UTF-16
 *
 * @private
 * @ignore
 */
function UTF8ToUTF16(data, options) {
  return UNICODEToUTF16(UTF8ToUNICODE(data), options);
}

/**
 * UTF-16 to UTF-8
 *
 * @private
 * @ignore
 */
function UTF16ToUTF8(data) {
  return UNICODEToUTF8(UTF16ToUNICODE(data));
}

/**
 * UTF-8 to UTF-16BE
 *
 * @private
 * @ignore
 */
function UTF8ToUTF16BE(data) {
  return UNICODEToUTF16BE(UTF8ToUNICODE(data));
}

/**
 * UTF-16BE to UTF-8
 *
 * @private
 * @ignore
 */
function UTF16BEToUTF8(data) {
  return UNICODEToUTF8(UTF16BEToUNICODE(data));
}

/**
 * UTF-8 to UTF-16LE
 *
 * @private
 * @ignore
 */
function UTF8ToUTF16LE(data) {
  return UNICODEToUTF16LE(UTF8ToUNICODE(data));
}

/**
 * UTF-16LE to UTF-8
 *
 * @private
 * @ignore
 */
function UTF16LEToUTF8(data) {
  return UNICODEToUTF8(UTF16LEToUNICODE(data));
}

/**
 * JIS to UTF-16
 *
 * @private
 * @ignore
 */
function JISToUTF16(data, options) {
  return UTF8ToUTF16(JISToUTF8(data), options);
}

/**
 * UTF-16 to JIS
 *
 * @private
 * @ignore
 */
function UTF16ToJIS(data) {
  return UTF8ToJIS(UTF16ToUTF8(data));
}

/**
 * JIS to UTF-16BE
 *
 * @private
 * @ignore
 */
function JISToUTF16BE(data) {
  return UTF8ToUTF16BE(JISToUTF8(data));
}

/**
 * UTF-16BE to JIS
 *
 * @private
 * @ignore
 */
function UTF16BEToJIS(data) {
  return UTF8ToJIS(UTF16BEToUTF8(data));
}

/**
 * JIS to UTF-16LE
 *
 * @private
 * @ignore
 */
function JISToUTF16LE(data) {
  return UTF8ToUTF16LE(JISToUTF8(data));
}

/**
 * UTF-16LE to JIS
 *
 * @private
 * @ignore
 */
function UTF16LEToJIS(data) {
  return UTF8ToJIS(UTF16LEToUTF8(data));
}

/**
 * EUC-JP to UTF-16
 *
 * @private
 * @ignore
 */
function EUCJPToUTF16(data, options) {
  return UTF8ToUTF16(EUCJPToUTF8(data), options);
}

/**
 * UTF-16 to EUC-JP
 *
 * @private
 * @ignore
 */
function UTF16ToEUCJP(data) {
  return UTF8ToEUCJP(UTF16ToUTF8(data));
}

/**
 * EUC-JP to UTF-16BE
 *
 * @private
 * @ignore
 */
function EUCJPToUTF16BE(data) {
  return UTF8ToUTF16BE(EUCJPToUTF8(data));
}

/**
 * UTF-16BE to EUC-JP
 *
 * @private
 * @ignore
 */
function UTF16BEToEUCJP(data) {
  return UTF8ToEUCJP(UTF16BEToUTF8(data));
}

/**
 * EUC-JP to UTF-16LE
 *
 * @private
 * @ignore
 */
function EUCJPToUTF16LE(data) {
  return UTF8ToUTF16LE(EUCJPToUTF8(data));
}

/**
 * UTF-16LE to EUC-JP
 *
 * @private
 * @ignore
 */
function UTF16LEToEUCJP(data) {
  return UTF8ToEUCJP(UTF16LEToUTF8(data));
}

/**
 * SJIS to UTF-16
 *
 * @private
 * @ignore
 */
function SJISToUTF16(data, options) {
  return UTF8ToUTF16(SJISToUTF8(data), options);
}

/**
 * UTF-16 to SJIS
 *
 * @private
 * @ignore
 */
function UTF16ToSJIS(data) {
  return UTF8ToSJIS(UTF16ToUTF8(data));
}

/**
 * SJIS to UTF-16BE
 *
 * @private
 * @ignore
 */
function SJISToUTF16BE(data) {
  return UTF8ToUTF16BE(SJISToUTF8(data));
}

/**
 * UTF-16BE to SJIS
 *
 * @private
 * @ignore
 */
function UTF16BEToSJIS(data) {
  return UTF8ToSJIS(UTF16BEToUTF8(data));
}

/**
 * SJIS to UTF-16LE
 *
 * @private
 * @ignore
 */
function SJISToUTF16LE(data) {
  return UTF8ToUTF16LE(SJISToUTF8(data));
}

/**
 * UTF-16LE to SJIS
 *
 * @private
 * @ignore
 */
function UTF16LEToSJIS(data) {
  return UTF8ToSJIS(UTF16LEToUTF8(data));
}


/**
 * Assign the internal encoding name from the argument encoding name.
 *
 * @private
 * @ignore
 */
function assignEncodingName(target) {
  var name = '';
  var expect = ('' + target).toUpperCase().replace(/[^A-Z0-9]+/g, '');
  var aliasNames = getKeys(EncodingAliases);
  var len = aliasNames.length;
  var hit = 0;
  var encoding, encodingLen, j;

  for (var i = 0; i < len; i++) {
    encoding = aliasNames[i];
    if (encoding === expect) {
      name = encoding;
      break;
    }

    encodingLen = encoding.length;
    for (j = hit; j < encodingLen; j++) {
      if (encoding.slice(0, j) === expect.slice(0, j) ||
          encoding.slice(-j) === expect.slice(-j)) {
        name = encoding;
        hit = j;
      }
    }
  }

  if (hasOwnProperty.call(EncodingAliases, name)) {
    return EncodingAliases[name];
  }

  return name;
}


// Helpers

function isObject(x) {
  var type = typeof x;
  return type === 'function' || type === 'object' && !!x;
}

function isArray(x) {
  return Array.isArray ? Array.isArray(x) :
    toString.call(x) === '[object Array]';
}

function isString(x) {
  return typeof x === 'string' || toString.call(x) === '[object String]';
}


function getKeys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }

  var keys = [];
  for (var key in object) {
    if (hasOwnProperty.call(object, key)) {
      keys[keys.length] = key;
    }
  }

  return keys;
}


function createBuffer(bits, size) {
  if (!HAS_TYPED) {
    return new Array(size);
  }

  switch (bits) {
    case 8: return new Uint8Array(size);
    case 16: return new Uint16Array(size);
  }
}


function stringToBuffer(string) {
  var length = string.length;
  var buffer = createBuffer(16, length);

  for (var i = 0; i < length; i++) {
    buffer[i] = string.charCodeAt(i);
  }

  return buffer;
}


function codeToString_fast(code) {
  if (CAN_CHARCODE_APPLY && CAN_CHARCODE_APPLY_TYPED) {
    var len = code && code.length;
    if (len < APPLY_BUFFER_SIZE) {
      if (APPLY_BUFFER_SIZE_OK) {
        return fromCharCode.apply(null, code);
      }

      if (APPLY_BUFFER_SIZE_OK === null) {
        try {
          var s = fromCharCode.apply(null, code);
          if (len > APPLY_BUFFER_SIZE) {
            APPLY_BUFFER_SIZE_OK = true;
          }
          return s;
        } catch (e) {
          // Ignore RangeError: arguments too large
          APPLY_BUFFER_SIZE_OK = false;
        }
      }
    }
  }

  return codeToString_chunked(code);
}


function codeToString_chunked(code) {
  var string = '';
  var length = code && code.length;
  var i = 0;
  var sub;

  while (i < length) {
    if (code.subarray) {
      sub = code.subarray(i, i + APPLY_BUFFER_SIZE);
    } else {
      sub = code.slice(i, i + APPLY_BUFFER_SIZE);
    }
    i += APPLY_BUFFER_SIZE;

    if (APPLY_BUFFER_SIZE_OK) {
      string += fromCharCode.apply(null, sub);
      continue;
    }

    if (APPLY_BUFFER_SIZE_OK === null) {
      try {
        string += fromCharCode.apply(null, sub);
        if (sub.length > APPLY_BUFFER_SIZE) {
          APPLY_BUFFER_SIZE_OK = true;
        }
        continue;
      } catch (e) {
        APPLY_BUFFER_SIZE_OK = false;
      }
    }

    return codeToString_slow(code);
  }

  return string;
}


function codeToString_slow(code) {
  var string = '';
  var length = code && code.length;

  for (var i = 0; i < length; i++) {
    string += fromCharCode(code[i]);
  }

  return string;
}


function stringToCode(string) {
  var code = [];
  var len = string && string.length;

  for (var i = 0; i < len; i++) {
    code[i] = string.charCodeAt(i);
  }

  return code;
}


function codeToBuffer(code) {
  if (HAS_TYPED) {
    // Use Uint16Array for Unicode codepoint.
    return new Uint16Array(code);
  } else {
    if (isArray(code)) {
      return code;
    }
  }

  var length = code && code.length;
  var buffer = [];

  for (var i = 0; i < length; i++) {
    buffer[i] = code[i];
  }

  return buffer;
}


function bufferToCode(buffer) {
  if (isArray(buffer)) {
    return buffer;
  }

  return slice.call(buffer);
}

// Base64
/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
// -- Masanao Izumo Copyright 1999 "free"
// Modified to add support for Binary Array for Encoding.js

var base64EncodeChars = [
  65,  66,  67,  68,  69,  70,  71,  72,  73,  74,  75,  76,  77,
  78,  79,  80,  81,  82,  83,  84,  85,  86,  87,  88,  89,  90,
  97,  98,  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
  48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  43,  47
];

var base64DecodeChars = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
  -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
];

var base64EncodePadding = '='.charCodeAt(0);


function base64encode(data) {
  var out, i, len;
  var c1, c2, c3;

  len = data && data.length;
  i = 0;
  out = [];

  while (i < len) {
    c1 = data[i++];
    if (i == len) {
      out[out.length] = base64EncodeChars[c1 >> 2];
      out[out.length] = base64EncodeChars[(c1 & 0x3) << 4];
      out[out.length] = base64EncodePadding;
      out[out.length] = base64EncodePadding;
      break;
    }

    c2 = data[i++];
    if (i == len) {
      out[out.length] = base64EncodeChars[c1 >> 2];
      out[out.length] = base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
      out[out.length] = base64EncodeChars[(c2 & 0xF) << 2];
      out[out.length] = base64EncodePadding;
      break;
    }

    c3 = data[i++];
    out[out.length] = base64EncodeChars[c1 >> 2];
    out[out.length] = base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
    out[out.length] = base64EncodeChars[((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)];
    out[out.length] = base64EncodeChars[c3 & 0x3F];
  }

  return codeToString_fast(out);
}


function base64decode(str) {
  var c1, c2, c3, c4;
  var i, len, out;

  len = str && str.length;
  i = 0;
  out = [];

  while (i < len) {
    /* c1 */
    do {
      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xFF];
    } while (i < len && c1 == -1);

    if (c1 == -1) {
      break;
    }

    /* c2 */
    do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xFF];
    } while (i < len && c2 == -1);

    if (c2 == -1) {
      break;
    }

    out[out.length] = (c1 << 2) | ((c2 & 0x30) >> 4);

    /* c3 */
    do {
      c3 = str.charCodeAt(i++) & 0xFF;
      if (c3 == 61) {
        return out;
      }
      c3 = base64DecodeChars[c3];
    } while (i < len && c3 == -1);

    if (c3 == -1) {
      break;
    }

    out[out.length] = ((c2 & 0xF) << 4) | ((c3 & 0x3C) >> 2);

    /* c4 */
    do {
      c4 = str.charCodeAt(i++) & 0xFF;
      if (c4 == 61) {
        return out;
      }
      c4 = base64DecodeChars[c4];
    } while (i < len && c4 == -1);

    if (c4 == -1) {
      break;
    }

    out[out.length] = ((c3 & 0x03) << 6) | c4;
  }

  return out;
}


/**
 * Encoding conversion table for UTF-8 to JIS.
 *
 * @ignore
 */
var UTF8_TO_JIS_TABLE = {
0xEFBDA1:0x21,0xEFBDA2:0x22,0xEFBDA3:0x23,0xEFBDA4:0x24,0xEFBDA5:0x25,
0xEFBDA6:0x26,0xEFBDA7:0x27,0xEFBDA8:0x28,0xEFBDA9:0x29,0xEFBDAA:0x2A,
0xEFBDAB:0x2B,0xEFBDAC:0x2C,0xEFBDAD:0x2D,0xEFBDAE:0x2E,0xEFBDAF:0x2F,
0xEFBDB0:0x30,0xEFBDB1:0x31,0xEFBDB2:0x32,0xEFBDB3:0x33,0xEFBDB4:0x34,
0xEFBDB5:0x35,0xEFBDB6:0x36,0xEFBDB7:0x37,0xEFBDB8:0x38,0xEFBDB9:0x39,
0xEFBDBA:0x3A,0xEFBDBB:0x3B,0xEFBDBC:0x3C,0xEFBDBD:0x3D,0xEFBDBE:0x3E,
0xEFBDBF:0x3F,0xEFBE80:0x40,0xEFBE81:0x41,0xEFBE82:0x42,0xEFBE83:0x43,
0xEFBE84:0x44,0xEFBE85:0x45,0xEFBE86:0x46,0xEFBE87:0x47,0xEFBE88:0x48,
0xEFBE89:0x49,0xEFBE8A:0x4A,0xEFBE8B:0x4B,0xEFBE8C:0x4C,0xEFBE8D:0x4D,
0xEFBE8E:0x4E,0xEFBE8F:0x4F,0xEFBE90:0x50,0xEFBE91:0x51,0xEFBE92:0x52,
0xEFBE93:0x53,0xEFBE94:0x54,0xEFBE95:0x55,0xEFBE96:0x56,0xEFBE97:0x57,
0xEFBE98:0x58,0xEFBE99:0x59,0xEFBE9A:0x5A,0xEFBE9B:0x5B,0xEFBE9C:0x5C,
0xEFBE9D:0x5D,0xEFBE9E:0x5E,0xEFBE9F:0x5F,

0xE291A0:0x2D21,0xE291A1:0x2D22,0xE291A2:0x2D23,0xE291A3:0x2D24,0xE291A4:0x2D25,
0xE291A5:0x2D26,0xE291A6:0x2D27,0xE291A7:0x2D28,0xE291A8:0x2D29,0xE291A9:0x2D2A,
0xE291AA:0x2D2B,0xE291AB:0x2D2C,0xE291AC:0x2D2D,0xE291AD:0x2D2E,0xE291AE:0x2D2F,
0xE291AF:0x2D30,0xE291B0:0x2D31,0xE291B1:0x2D32,0xE291B2:0x2D33,0xE291B3:0x2D34,
0xE285A0:0x2D35,0xE285A1:0x2D36,0xE285A2:0x2D37,0xE285A3:0x2D38,0xE285A4:0x2D39,
0xE285A5:0x2D3A,0xE285A6:0x2D3B,0xE285A7:0x2D3C,0xE285A8:0x2D3D,0xE285A9:0x2D3E,
0xE38D89:0x2D40,0xE38C94:0x2D41,0xE38CA2:0x2D42,0xE38D8D:0x2D43,0xE38C98:0x2D44,
0xE38CA7:0x2D45,0xE38C83:0x2D46,0xE38CB6:0x2D47,0xE38D91:0x2D48,0xE38D97:0x2D49,
0xE38C8D:0x2D4A,0xE38CA6:0x2D4B,0xE38CA3:0x2D4C,0xE38CAB:0x2D4D,0xE38D8A:0x2D4E,
0xE38CBB:0x2D4F,0xE38E9C:0x2D50,0xE38E9D:0x2D51,0xE38E9E:0x2D52,0xE38E8E:0x2D53,
0xE38E8F:0x2D54,0xE38F84:0x2D55,0xE38EA1:0x2D56,0xE38DBB:0x2D5F,0xE3809D:0x2D60,
0xE3809F:0x2D61,0xE28496:0x2D62,0xE38F8D:0x2D63,0xE284A1:0x2D64,0xE38AA4:0x2D65,
0xE38AA5:0x2D66,0xE38AA6:0x2D67,0xE38AA7:0x2D68,0xE38AA8:0x2D69,0xE388B1:0x2D6A,
0xE388B2:0x2D6B,0xE388B9:0x2D6C,0xE38DBE:0x2D6D,0xE38DBD:0x2D6E,0xE38DBC:0x2D6F,
0xE288AE:0x2D73,0xE28891:0x2D74,0xE2889F:0x2D78,0xE28ABF:0x2D79,

0xE38080:0x2121,0xE38081:0x2122,0xE38082:0x2123,0xEFBC8C:0x2124,0xEFBC8E:0x2125,
0xE383BB:0x2126,0xEFBC9A:0x2127,0xEFBC9B:0x2128,0xEFBC9F:0x2129,0xEFBC81:0x212A,
0xE3829B:0x212B,0xE3829C:0x212C,0xC2B4:0x212D,0xEFBD80:0x212E,0xC2A8:0x212F,
0xEFBCBE:0x2130,0xEFBFA3:0x2131,0xEFBCBF:0x2132,0xE383BD:0x2133,0xE383BE:0x2134,
0xE3829D:0x2135,0xE3829E:0x2136,0xE38083:0x2137,0xE4BB9D:0x2138,0xE38085:0x2139,
0xE38086:0x213A,0xE38087:0x213B,0xE383BC:0x213C,0xE28095:0x213D,0xE28090:0x213E,
0xEFBC8F:0x213F,0xEFBCBC:0x2140,0xEFBD9E:0x2141,0xE28096:0x2142,0xEFBD9C:0x2143,
0xE280A6:0x2144,0xE280A5:0x2145,0xE28098:0x2146,0xE28099:0x2147,0xE2809C:0x2148,
0xE2809D:0x2149,0xEFBC88:0x214A,0xEFBC89:0x214B,0xE38094:0x214C,0xE38095:0x214D,
0xEFBCBB:0x214E,0xEFBCBD:0x214F,0xEFBD9B:0x2150,0xEFBD9D:0x2151,0xE38088:0x2152,
0xE38089:0x2153,0xE3808A:0x2154,0xE3808B:0x2155,0xE3808C:0x2156,0xE3808D:0x2157,
0xE3808E:0x2158,0xE3808F:0x2159,0xE38090:0x215A,0xE38091:0x215B,0xEFBC8B:0x215C,
0xEFBC8D:0x215D,0xC2B1:0x215E,0xC397:0x215F,0xC3B7:0x2160,0xEFBC9D:0x2161,
0xE289A0:0x2162,0xEFBC9C:0x2163,0xEFBC9E:0x2164,0xE289A6:0x2165,0xE289A7:0x2166,
0xE2889E:0x2167,0xE288B4:0x2168,0xE29982:0x2169,0xE29980:0x216A,0xC2B0:0x216B,
0xE280B2:0x216C,0xE280B3:0x216D,0xE28483:0x216E,0xEFBFA5:0x216F,0xEFBC84:0x2170,
0xEFBFA0:0x2171,0xEFBFA1:0x2172,0xEFBC85:0x2173,0xEFBC83:0x2174,0xEFBC86:0x2175,
0xEFBC8A:0x2176,0xEFBCA0:0x2177,0xC2A7:0x2178,0xE29886:0x2179,0xE29885:0x217A,
0xE2978B:0x217B,0xE2978F:0x217C,0xE2978E:0x217D,0xE29787:0x217E,0xE29786:0x2221,
0xE296A1:0x2222,0xE296A0:0x2223,0xE296B3:0x2224,0xE296B2:0x2225,0xE296BD:0x2226,
0xE296BC:0x2227,0xE280BB:0x2228,0xE38092:0x2229,0xE28692:0x222A,0xE28690:0x222B,
0xE28691:0x222C,0xE28693:0x222D,0xE38093:0x222E,0xE28888:0x223A,0xE2888B:0x223B,
0xE28A86:0x223C,0xE28A87:0x223D,0xE28A82:0x223E,0xE28A83:0x223F,0xE288AA:0x2240,
0xE288A9:0x2241,0xE288A7:0x224A,0xE288A8:0x224B,0xC2AC:0x224C,0xE28792:0x224D,
0xE28794:0x224E,0xE28880:0x224F,0xE28883:0x2250,0xE288A0:0x225C,0xE28AA5:0x225D,
0xE28C92:0x225E,0xE28882:0x225F,0xE28887:0x2260,0xE289A1:0x2261,0xE28992:0x2262,
0xE289AA:0x2263,0xE289AB:0x2264,0xE2889A:0x2265,0xE288BD:0x2266,0xE2889D:0x2267,
0xE288B5:0x2268,0xE288AB:0x2269,0xE288AC:0x226A,0xE284AB:0x2272,0xE280B0:0x2273,
0xE299AF:0x2274,0xE299AD:0x2275,0xE299AA:0x2276,0xE280A0:0x2277,0xE280A1:0x2278,
0xC2B6:0x2279,0xE297AF:0x227E,0xEFBC90:0x2330,0xEFBC91:0x2331,0xEFBC92:0x2332,
0xEFBC93:0x2333,0xEFBC94:0x2334,0xEFBC95:0x2335,0xEFBC96:0x2336,0xEFBC97:0x2337,
0xEFBC98:0x2338,0xEFBC99:0x2339,0xEFBCA1:0x2341,0xEFBCA2:0x2342,0xEFBCA3:0x2343,
0xEFBCA4:0x2344,0xEFBCA5:0x2345,0xEFBCA6:0x2346,0xEFBCA7:0x2347,0xEFBCA8:0x2348,
0xEFBCA9:0x2349,0xEFBCAA:0x234A,0xEFBCAB:0x234B,0xEFBCAC:0x234C,0xEFBCAD:0x234D,
0xEFBCAE:0x234E,0xEFBCAF:0x234F,0xEFBCB0:0x2350,0xEFBCB1:0x2351,0xEFBCB2:0x2352,
0xEFBCB3:0x2353,0xEFBCB4:0x2354,0xEFBCB5:0x2355,0xEFBCB6:0x2356,0xEFBCB7:0x2357,
0xEFBCB8:0x2358,0xEFBCB9:0x2359,0xEFBCBA:0x235A,0xEFBD81:0x2361,0xEFBD82:0x2362,
0xEFBD83:0x2363,0xEFBD84:0x2364,0xEFBD85:0x2365,0xEFBD86:0x2366,0xEFBD87:0x2367,
0xEFBD88:0x2368,0xEFBD89:0x2369,0xEFBD8A:0x236A,0xEFBD8B:0x236B,0xEFBD8C:0x236C,
0xEFBD8D:0x236D,0xEFBD8E:0x236E,0xEFBD8F:0x236F,0xEFBD90:0x2370,0xEFBD91:0x2371,
0xEFBD92:0x2372,0xEFBD93:0x2373,0xEFBD94:0x2374,0xEFBD95:0x2375,0xEFBD96:0x2376,
0xEFBD97:0x2377,0xEFBD98:0x2378,0xEFBD99:0x2379,0xEFBD9A:0x237A,0xE38181:0x2421,
0xE38182:0x2422,0xE38183:0x2423,0xE38184:0x2424,0xE38185:0x2425,0xE38186:0x2426,
0xE38187:0x2427,0xE38188:0x2428,0xE38189:0x2429,0xE3818A:0x242A,0xE3818B:0x242B,
0xE3818C:0x242C,0xE3818D:0x242D,0xE3818E:0x242E,0xE3818F:0x242F,0xE38190:0x2430,
0xE38191:0x2431,0xE38192:0x2432,0xE38193:0x2433,0xE38194:0x2434,0xE38195:0x2435,
0xE38196:0x2436,0xE38197:0x2437,0xE38198:0x2438,0xE38199:0x2439,0xE3819A:0x243A,
0xE3819B:0x243B,0xE3819C:0x243C,0xE3819D:0x243D,0xE3819E:0x243E,0xE3819F:0x243F,
0xE381A0:0x2440,0xE381A1:0x2441,0xE381A2:0x2442,0xE381A3:0x2443,0xE381A4:0x2444,
0xE381A5:0x2445,0xE381A6:0x2446,0xE381A7:0x2447,0xE381A8:0x2448,0xE381A9:0x2449,
0xE381AA:0x244A,0xE381AB:0x244B,0xE381AC:0x244C,0xE381AD:0x244D,0xE381AE:0x244E,
0xE381AF:0x244F,0xE381B0:0x2450,0xE381B1:0x2451,0xE381B2:0x2452,0xE381B3:0x2453,
0xE381B4:0x2454,0xE381B5:0x2455,0xE381B6:0x2456,0xE381B7:0x2457,0xE381B8:0x2458,
0xE381B9:0x2459,0xE381BA:0x245A,0xE381BB:0x245B,0xE381BC:0x245C,0xE381BD:0x245D,
0xE381BE:0x245E,0xE381BF:0x245F,0xE38280:0x2460,0xE38281:0x2461,0xE38282:0x2462,
0xE38283:0x2463,0xE38284:0x2464,0xE38285:0x2465,0xE38286:0x2466,0xE38287:0x2467,
0xE38288:0x2468,0xE38289:0x2469,0xE3828A:0x246A,0xE3828B:0x246B,0xE3828C:0x246C,
0xE3828D:0x246D,0xE3828E:0x246E,0xE3828F:0x246F,0xE38290:0x2470,0xE38291:0x2471,
0xE38292:0x2472,0xE38293:0x2473,0xE382A1:0x2521,0xE382A2:0x2522,0xE382A3:0x2523,
0xE382A4:0x2524,0xE382A5:0x2525,0xE382A6:0x2526,0xE382A7:0x2527,0xE382A8:0x2528,
0xE382A9:0x2529,0xE382AA:0x252A,0xE382AB:0x252B,0xE382AC:0x252C,0xE382AD:0x252D,
0xE382AE:0x252E,0xE382AF:0x252F,0xE382B0:0x2530,0xE382B1:0x2531,0xE382B2:0x2532,
0xE382B3:0x2533,0xE382B4:0x2534,0xE382B5:0x2535,0xE382B6:0x2536,0xE382B7:0x2537,
0xE382B8:0x2538,0xE382B9:0x2539,0xE382BA:0x253A,0xE382BB:0x253B,0xE382BC:0x253C,
0xE382BD:0x253D,0xE382BE:0x253E,0xE382BF:0x253F,0xE38380:0x2540,0xE38381:0x2541,
0xE38382:0x2542,0xE38383:0x2543,0xE38384:0x2544,0xE38385:0x2545,0xE38386:0x2546,
0xE38387:0x2547,0xE38388:0x2548,0xE38389:0x2549,0xE3838A:0x254A,0xE3838B:0x254B,
0xE3838C:0x254C,0xE3838D:0x254D,0xE3838E:0x254E,0xE3838F:0x254F,0xE38390:0x2550,
0xE38391:0x2551,0xE38392:0x2552,0xE38393:0x2553,0xE38394:0x2554,0xE38395:0x2555,
0xE38396:0x2556,0xE38397:0x2557,0xE38398:0x2558,0xE38399:0x2559,0xE3839A:0x255A,
0xE3839B:0x255B,0xE3839C:0x255C,0xE3839D:0x255D,0xE3839E:0x255E,0xE3839F:0x255F,
0xE383A0:0x2560,0xE383A1:0x2561,0xE383A2:0x2562,0xE383A3:0x2563,0xE383A4:0x2564,
0xE383A5:0x2565,0xE383A6:0x2566,0xE383A7:0x2567,0xE383A8:0x2568,0xE383A9:0x2569,
0xE383AA:0x256A,0xE383AB:0x256B,0xE383AC:0x256C,0xE383AD:0x256D,0xE383AE:0x256E,
0xE383AF:0x256F,0xE383B0:0x2570,0xE383B1:0x2571,0xE383B2:0x2572,0xE383B3:0x2573,
0xE383B4:0x2574,0xE383B5:0x2575,0xE383B6:0x2576,0xCE91:0x2621,0xCE92:0x2622,
0xCE93:0x2623,0xCE94:0x2624,0xCE95:0x2625,0xCE96:0x2626,0xCE97:0x2627,
0xCE98:0x2628,0xCE99:0x2629,0xCE9A:0x262A,0xCE9B:0x262B,0xCE9C:0x262C,
0xCE9D:0x262D,0xCE9E:0x262E,0xCE9F:0x262F,0xCEA0:0x2630,0xCEA1:0x2631,
0xCEA3:0x2632,0xCEA4:0x2633,0xCEA5:0x2634,0xCEA6:0x2635,0xCEA7:0x2636,
0xCEA8:0x2637,0xCEA9:0x2638,0xCEB1:0x2641,0xCEB2:0x2642,0xCEB3:0x2643,
0xCEB4:0x2644,0xCEB5:0x2645,0xCEB6:0x2646,0xCEB7:0x2647,0xCEB8:0x2648,
0xCEB9:0x2649,0xCEBA:0x264A,0xCEBB:0x264B,0xCEBC:0x264C,0xCEBD:0x264D,
0xCEBE:0x264E,0xCEBF:0x264F,0xCF80:0x2650,0xCF81:0x2651,0xCF83:0x2652,
0xCF84:0x2653,0xCF85:0x2654,0xCF86:0x2655,0xCF87:0x2656,0xCF88:0x2657,
0xCF89:0x2658,0xD090:0x2721,0xD091:0x2722,0xD092:0x2723,0xD093:0x2724,
0xD094:0x2725,0xD095:0x2726,0xD081:0x2727,0xD096:0x2728,0xD097:0x2729,
0xD098:0x272A,0xD099:0x272B,0xD09A:0x272C,0xD09B:0x272D,0xD09C:0x272E,
0xD09D:0x272F,0xD09E:0x2730,0xD09F:0x2731,0xD0A0:0x2732,0xD0A1:0x2733,
0xD0A2:0x2734,0xD0A3:0x2735,0xD0A4:0x2736,0xD0A5:0x2737,0xD0A6:0x2738,
0xD0A7:0x2739,0xD0A8:0x273A,0xD0A9:0x273B,0xD0AA:0x273C,0xD0AB:0x273D,
0xD0AC:0x273E,0xD0AD:0x273F,0xD0AE:0x2740,0xD0AF:0x2741,0xD0B0:0x2751,
0xD0B1:0x2752,0xD0B2:0x2753,0xD0B3:0x2754,0xD0B4:0x2755,0xD0B5:0x2756,
0xD191:0x2757,0xD0B6:0x2758,0xD0B7:0x2759,0xD0B8:0x275A,0xD0B9:0x275B,
0xD0BA:0x275C,0xD0BB:0x275D,0xD0BC:0x275E,0xD0BD:0x275F,0xD0BE:0x2760,
0xD0BF:0x2761,0xD180:0x2762,0xD181:0x2763,0xD182:0x2764,0xD183:0x2765,
0xD184:0x2766,0xD185:0x2767,0xD186:0x2768,0xD187:0x2769,0xD188:0x276A,
0xD189:0x276B,0xD18A:0x276C,0xD18B:0x276D,0xD18C:0x276E,0xD18D:0x276F,
0xD18E:0x2770,0xD18F:0x2771,0xE29480:0x2821,0xE29482:0x2822,0xE2948C:0x2823,
0xE29490:0x2824,0xE29498:0x2825,0xE29494:0x2826,0xE2949C:0x2827,0xE294AC:0x2828,
0xE294A4:0x2829,0xE294B4:0x282A,0xE294BC:0x282B,0xE29481:0x282C,0xE29483:0x282D,
0xE2948F:0x282E,0xE29493:0x282F,0xE2949B:0x2830,0xE29497:0x2831,0xE294A3:0x2832,
0xE294B3:0x2833,0xE294AB:0x2834,0xE294BB:0x2835,0xE2958B:0x2836,0xE294A0:0x2837,
0xE294AF:0x2838,0xE294A8:0x2839,0xE294B7:0x283A,0xE294BF:0x283B,0xE2949D:0x283C,
0xE294B0:0x283D,0xE294A5:0x283E,0xE294B8:0x283F,0xE29582:0x2840,0xE4BA9C:0x3021,
0xE59496:0x3022,0xE5A883:0x3023,0xE998BF:0x3024,0xE59380:0x3025,0xE6849B:0x3026,
0xE68CA8:0x3027,0xE5A7B6:0x3028,0xE980A2:0x3029,0xE891B5:0x302A,0xE88C9C:0x302B,
0xE7A990:0x302C,0xE682AA:0x302D,0xE68FA1:0x302E,0xE6B8A5:0x302F,0xE697AD:0x3030,
0xE891A6:0x3031,0xE88AA6:0x3032,0xE9AFB5:0x3033,0xE6A293:0x3034,0xE59CA7:0x3035,
0xE696A1:0x3036,0xE689B1:0x3037,0xE5AE9B:0x3038,0xE5A790:0x3039,0xE899BB:0x303A,
0xE9A3B4:0x303B,0xE7B5A2:0x303C,0xE7B6BE:0x303D,0xE9AE8E:0x303E,0xE68896:0x303F,
0xE7B29F:0x3040,0xE8A2B7:0x3041,0xE5AE89:0x3042,0xE5BAB5:0x3043,0xE68C89:0x3044,
0xE69A97:0x3045,0xE6A188:0x3046,0xE99787:0x3047,0xE99E8D:0x3048,0xE69D8F:0x3049,
0xE4BBA5:0x304A,0xE4BC8A:0x304B,0xE4BD8D:0x304C,0xE4BE9D:0x304D,0xE58189:0x304E,
0xE59BB2:0x304F,0xE5A4B7:0x3050,0xE5A794:0x3051,0xE5A881:0x3052,0xE5B089:0x3053,
0xE6839F:0x3054,0xE6848F:0x3055,0xE685B0:0x3056,0xE69893:0x3057,0xE6A485:0x3058,
0xE782BA:0x3059,0xE7958F:0x305A,0xE795B0:0x305B,0xE7A7BB:0x305C,0xE7B6AD:0x305D,
0xE7B7AF:0x305E,0xE88383:0x305F,0xE8908E:0x3060,0xE8A1A3:0x3061,0xE8AC82:0x3062,
0xE98195:0x3063,0xE981BA:0x3064,0xE58CBB:0x3065,0xE4BA95:0x3066,0xE4BAA5:0x3067,
0xE59F9F:0x3068,0xE882B2:0x3069,0xE98381:0x306A,0xE7A3AF:0x306B,0xE4B880:0x306C,
0xE5A3B1:0x306D,0xE6BAA2:0x306E,0xE980B8:0x306F,0xE7A8B2:0x3070,0xE88CA8:0x3071,
0xE88A8B:0x3072,0xE9B0AF:0x3073,0xE58581:0x3074,0xE58DB0:0x3075,0xE592BD:0x3076,
0xE593A1:0x3077,0xE59BA0:0x3078,0xE5A7BB:0x3079,0xE5BC95:0x307A,0xE9A3B2:0x307B,
0xE6B7AB:0x307C,0xE883A4:0x307D,0xE894AD:0x307E,0xE999A2:0x3121,0xE999B0:0x3122,
0xE99AA0:0x3123,0xE99FBB:0x3124,0xE5908B:0x3125,0xE58FB3:0x3126,0xE5AE87:0x3127,
0xE7838F:0x3128,0xE7BEBD:0x3129,0xE8BF82:0x312A,0xE99BA8:0x312B,0xE58DAF:0x312C,
0xE9B59C:0x312D,0xE7AABA:0x312E,0xE4B891:0x312F,0xE7A293:0x3130,0xE887BC:0x3131,
0xE6B8A6:0x3132,0xE59898:0x3133,0xE59484:0x3134,0xE6AC9D:0x3135,0xE8949A:0x3136,
0xE9B0BB:0x3137,0xE5A7A5:0x3138,0xE58EA9:0x3139,0xE6B5A6:0x313A,0xE7939C:0x313B,
0xE9968F:0x313C,0xE59982:0x313D,0xE4BA91:0x313E,0xE9818B:0x313F,0xE99BB2:0x3140,
0xE88D8F:0x3141,0xE9A48C:0x3142,0xE58FA1:0x3143,0xE596B6:0x3144,0xE5ACB0:0x3145,
0xE5BDB1:0x3146,0xE698A0:0x3147,0xE69BB3:0x3148,0xE6A084:0x3149,0xE6B0B8:0x314A,
0xE6B3B3:0x314B,0xE6B4A9:0x314C,0xE7919B:0x314D,0xE79B88:0x314E,0xE7A98E:0x314F,
0xE9A0B4:0x3150,0xE88BB1:0x3151,0xE8A19B:0x3152,0xE8A9A0:0x3153,0xE98BAD:0x3154,
0xE6B6B2:0x3155,0xE796AB:0x3156,0xE79B8A:0x3157,0xE9A785:0x3158,0xE682A6:0x3159,
0xE8AC81:0x315A,0xE8B68A:0x315B,0xE996B2:0x315C,0xE6A68E:0x315D,0xE58EAD:0x315E,
0xE58686:0x315F,0xE59C92:0x3160,0xE5A0B0:0x3161,0xE5A584:0x3162,0xE5AEB4:0x3163,
0xE5BBB6:0x3164,0xE680A8:0x3165,0xE68EA9:0x3166,0xE68FB4:0x3167,0xE6B2BF:0x3168,
0xE6BC94:0x3169,0xE7828E:0x316A,0xE78494:0x316B,0xE78599:0x316C,0xE78795:0x316D,
0xE78CBF:0x316E,0xE7B881:0x316F,0xE889B6:0x3170,0xE88B91:0x3171,0xE89697:0x3172,
0xE981A0:0x3173,0xE9899B:0x3174,0xE9B49B:0x3175,0xE5A1A9:0x3176,0xE696BC:0x3177,
0xE6B19A:0x3178,0xE794A5:0x3179,0xE587B9:0x317A,0xE5A4AE:0x317B,0xE5A5A5:0x317C,
0xE5BE80:0x317D,0xE5BF9C:0x317E,0xE68ABC:0x3221,0xE697BA:0x3222,0xE6A8AA:0x3223,
0xE6ACA7:0x3224,0xE6AEB4:0x3225,0xE78E8B:0x3226,0xE7BF81:0x3227,0xE8A596:0x3228,
0xE9B4AC:0x3229,0xE9B48E:0x322A,0xE9BB84:0x322B,0xE5B2A1:0x322C,0xE6B296:0x322D,
0xE88DBB:0x322E,0xE58484:0x322F,0xE5B18B:0x3230,0xE686B6:0x3231,0xE88786:0x3232,
0xE6A1B6:0x3233,0xE789A1:0x3234,0xE4B999:0x3235,0xE4BFBA:0x3236,0xE58DB8:0x3237,
0xE681A9:0x3238,0xE6B8A9:0x3239,0xE7A98F:0x323A,0xE99FB3:0x323B,0xE4B88B:0x323C,
0xE58C96:0x323D,0xE4BBAE:0x323E,0xE4BD95:0x323F,0xE4BCBD:0x3240,0xE4BEA1:0x3241,
0xE4BDB3:0x3242,0xE58AA0:0x3243,0xE58FAF:0x3244,0xE59889:0x3245,0xE5A48F:0x3246,
0xE5AB81:0x3247,0xE5AEB6:0x3248,0xE5AFA1:0x3249,0xE7A791:0x324A,0xE69A87:0x324B,
0xE69E9C:0x324C,0xE69EB6:0x324D,0xE6AD8C:0x324E,0xE6B2B3:0x324F,0xE781AB:0x3250,
0xE78F82:0x3251,0xE7A68D:0x3252,0xE7A6BE:0x3253,0xE7A8BC:0x3254,0xE7AE87:0x3255,
0xE88AB1:0x3256,0xE88B9B:0x3257,0xE88C84:0x3258,0xE88DB7:0x3259,0xE88FAF:0x325A,
0xE88F93:0x325B,0xE89DA6:0x325C,0xE8AAB2:0x325D,0xE598A9:0x325E,0xE8B2A8:0x325F,
0xE8BFA6:0x3260,0xE9818E:0x3261,0xE99C9E:0x3262,0xE89A8A:0x3263,0xE4BF84:0x3264,
0xE5B3A8:0x3265,0xE68891:0x3266,0xE78999:0x3267,0xE794BB:0x3268,0xE887A5:0x3269,
0xE88ABD:0x326A,0xE89BBE:0x326B,0xE8B380:0x326C,0xE99B85:0x326D,0xE9A493:0x326E,
0xE9A795:0x326F,0xE4BB8B:0x3270,0xE4BC9A:0x3271,0xE8A7A3:0x3272,0xE59B9E:0x3273,
0xE5A18A:0x3274,0xE5A38A:0x3275,0xE5BBBB:0x3276,0xE5BFAB:0x3277,0xE680AA:0x3278,
0xE68294:0x3279,0xE681A2:0x327A,0xE68790:0x327B,0xE68892:0x327C,0xE68B90:0x327D,
0xE694B9:0x327E,0xE9AD81:0x3321,0xE699A6:0x3322,0xE6A2B0:0x3323,0xE6B5B7:0x3324,
0xE781B0:0x3325,0xE7958C:0x3326,0xE79A86:0x3327,0xE7B5B5:0x3328,0xE88AA5:0x3329,
0xE89FB9:0x332A,0xE9968B:0x332B,0xE99A8E:0x332C,0xE8B29D:0x332D,0xE587B1:0x332E,
0xE58ABE:0x332F,0xE5A496:0x3330,0xE592B3:0x3331,0xE5AEB3:0x3332,0xE5B496:0x3333,
0xE685A8:0x3334,0xE6A682:0x3335,0xE6B6AF:0x3336,0xE7A28D:0x3337,0xE8938B:0x3338,
0xE8A197:0x3339,0xE8A9B2:0x333A,0xE98EA7:0x333B,0xE9AAB8:0x333C,0xE6B5AC:0x333D,
0xE9A6A8:0x333E,0xE89B99:0x333F,0xE59EA3:0x3340,0xE69FBF:0x3341,0xE89B8E:0x3342,
0xE9888E:0x3343,0xE58A83:0x3344,0xE59A87:0x3345,0xE59084:0x3346,0xE5BB93:0x3347,
0xE68BA1:0x3348,0xE692B9:0x3349,0xE6A0BC:0x334A,0xE6A0B8:0x334B,0xE6AEBB:0x334C,
0xE78DB2:0x334D,0xE7A2BA:0x334E,0xE7A9AB:0x334F,0xE8A69A:0x3350,0xE8A792:0x3351,
0xE8B5AB:0x3352,0xE8BC83:0x3353,0xE983AD:0x3354,0xE996A3:0x3355,0xE99A94:0x3356,
0xE99DA9:0x3357,0xE5ADA6:0x3358,0xE5B2B3:0x3359,0xE6A5BD:0x335A,0xE9A18D:0x335B,
0xE9A18E:0x335C,0xE68E9B:0x335D,0xE7ACA0:0x335E,0xE6A8AB:0x335F,0xE6A9BF:0x3360,
0xE6A2B6:0x3361,0xE9B08D:0x3362,0xE6BD9F:0x3363,0xE589B2:0x3364,0xE5969D:0x3365,
0xE681B0:0x3366,0xE68BAC:0x3367,0xE6B4BB:0x3368,0xE6B887:0x3369,0xE6BB91:0x336A,
0xE8919B:0x336B,0xE8A490:0x336C,0xE8BD84:0x336D,0xE4B894:0x336E,0xE9B0B9:0x336F,
0xE58FB6:0x3370,0xE6A49B:0x3371,0xE6A8BA:0x3372,0xE99E84:0x3373,0xE6A0AA:0x3374,
0xE5859C:0x3375,0xE7AB83:0x3376,0xE892B2:0x3377,0xE9879C:0x3378,0xE98E8C:0x3379,
0xE5999B:0x337A,0xE9B4A8:0x337B,0xE6A0A2:0x337C,0xE88C85:0x337D,0xE890B1:0x337E,
0xE7B2A5:0x3421,0xE58888:0x3422,0xE88B85:0x3423,0xE793A6:0x3424,0xE4B9BE:0x3425,
0xE4BE83:0x3426,0xE586A0:0x3427,0xE5AF92:0x3428,0xE5888A:0x3429,0xE58B98:0x342A,
0xE58BA7:0x342B,0xE5B7BB:0x342C,0xE5969A:0x342D,0xE5A0AA:0x342E,0xE5A7A6:0x342F,
0xE5AE8C:0x3430,0xE5AE98:0x3431,0xE5AF9B:0x3432,0xE5B9B2:0x3433,0xE5B9B9:0x3434,
0xE682A3:0x3435,0xE6849F:0x3436,0xE685A3:0x3437,0xE686BE:0x3438,0xE68F9B:0x3439,
0xE695A2:0x343A,0xE69F91:0x343B,0xE6A193:0x343C,0xE6A3BA:0x343D,0xE6ACBE:0x343E,
0xE6AD93:0x343F,0xE6B197:0x3440,0xE6BCA2:0x3441,0xE6BE97:0x3442,0xE6BD85:0x3443,
0xE792B0:0x3444,0xE79498:0x3445,0xE79BA3:0x3446,0xE79C8B:0x3447,0xE7ABBF:0x3448,
0xE7AEA1:0x3449,0xE7B0A1:0x344A,0xE7B7A9:0x344B,0xE7BCB6:0x344C,0xE7BFB0:0x344D,
0xE8829D:0x344E,0xE889A6:0x344F,0xE88E9E:0x3450,0xE8A6B3:0x3451,0xE8AB8C:0x3452,
0xE8B2AB:0x3453,0xE98284:0x3454,0xE99191:0x3455,0xE99693:0x3456,0xE99691:0x3457,
0xE996A2:0x3458,0xE999A5:0x3459,0xE99F93:0x345A,0xE9A4A8:0x345B,0xE88898:0x345C,
0xE4B8B8:0x345D,0xE590AB:0x345E,0xE5B2B8:0x345F,0xE5B78C:0x3460,0xE78EA9:0x3461,
0xE7998C:0x3462,0xE79CBC:0x3463,0xE5B2A9:0x3464,0xE7BFAB:0x3465,0xE8B48B:0x3466,
0xE99B81:0x3467,0xE9A091:0x3468,0xE9A194:0x3469,0xE9A198:0x346A,0xE4BC81:0x346B,
0xE4BC8E:0x346C,0xE58DB1:0x346D,0xE5969C:0x346E,0xE599A8:0x346F,0xE59FBA:0x3470,
0xE5A587:0x3471,0xE5AC89:0x3472,0xE5AF84:0x3473,0xE5B290:0x3474,0xE5B88C:0x3475,
0xE5B9BE:0x3476,0xE5BF8C:0x3477,0xE68FAE:0x3478,0xE69CBA:0x3479,0xE69797:0x347A,
0xE697A2:0x347B,0xE69C9F:0x347C,0xE6A38B:0x347D,0xE6A384:0x347E,0xE6A99F:0x3521,
0xE5B8B0:0x3522,0xE6AF85:0x3523,0xE6B097:0x3524,0xE6B1BD:0x3525,0xE795BF:0x3526,
0xE7A588:0x3527,0xE5ADA3:0x3528,0xE7A880:0x3529,0xE7B480:0x352A,0xE5BEBD:0x352B,
0xE8A68F:0x352C,0xE8A898:0x352D,0xE8B2B4:0x352E,0xE8B5B7:0x352F,0xE8BB8C:0x3530,
0xE8BC9D:0x3531,0xE9A3A2:0x3532,0xE9A88E:0x3533,0xE9ACBC:0x3534,0xE4BA80:0x3535,
0xE581BD:0x3536,0xE58480:0x3537,0xE5A693:0x3538,0xE5AE9C:0x3539,0xE688AF:0x353A,
0xE68A80:0x353B,0xE693AC:0x353C,0xE6ACBA:0x353D,0xE78AA0:0x353E,0xE79691:0x353F,
0xE7A587:0x3540,0xE7BEA9:0x3541,0xE89FBB:0x3542,0xE8AABC:0x3543,0xE8ADB0:0x3544,
0xE68EAC:0x3545,0xE88F8A:0x3546,0xE99EA0:0x3547,0xE59089:0x3548,0xE59083:0x3549,
0xE596AB:0x354A,0xE6A194:0x354B,0xE6A998:0x354C,0xE8A9B0:0x354D,0xE7A0A7:0x354E,
0xE69DB5:0x354F,0xE9BB8D:0x3550,0xE58DB4:0x3551,0xE5AEA2:0x3552,0xE8849A:0x3553,
0xE89990:0x3554,0xE98086:0x3555,0xE4B898:0x3556,0xE4B985:0x3557,0xE4BB87:0x3558,
0xE4BC91:0x3559,0xE58F8A:0x355A,0xE590B8:0x355B,0xE5AEAE:0x355C,0xE5BC93:0x355D,
0xE680A5:0x355E,0xE69591:0x355F,0xE69CBD:0x3560,0xE6B182:0x3561,0xE6B1B2:0x3562,
0xE6B3A3:0x3563,0xE781B8:0x3564,0xE79083:0x3565,0xE7A9B6:0x3566,0xE7AAAE:0x3567,
0xE7AC88:0x3568,0xE7B49A:0x3569,0xE7B3BE:0x356A,0xE7B5A6:0x356B,0xE697A7:0x356C,
0xE7899B:0x356D,0xE58EBB:0x356E,0xE5B185:0x356F,0xE5B7A8:0x3570,0xE68B92:0x3571,
0xE68BA0:0x3572,0xE68C99:0x3573,0xE6B8A0:0x3574,0xE8999A:0x3575,0xE8A8B1:0x3576,
0xE8B79D:0x3577,0xE98BB8:0x3578,0xE6BC81:0x3579,0xE7A6A6:0x357A,0xE9AD9A:0x357B,
0xE4BAA8:0x357C,0xE4BAAB:0x357D,0xE4BAAC:0x357E,0xE4BE9B:0x3621,0xE4BEA0:0x3622,
0xE58391:0x3623,0xE58587:0x3624,0xE7ABB6:0x3625,0xE585B1:0x3626,0xE587B6:0x3627,
0xE58D94:0x3628,0xE58CA1:0x3629,0xE58DBF:0x362A,0xE58FAB:0x362B,0xE596AC:0x362C,
0xE5A283:0x362D,0xE5B3A1:0x362E,0xE5BCB7:0x362F,0xE5BD8A:0x3630,0xE680AF:0x3631,
0xE68190:0x3632,0xE681AD:0x3633,0xE68C9F:0x3634,0xE69599:0x3635,0xE6A98B:0x3636,
0xE6B381:0x3637,0xE78B82:0x3638,0xE78BAD:0x3639,0xE79FAF:0x363A,0xE883B8:0x363B,
0xE88485:0x363C,0xE88888:0x363D,0xE8958E:0x363E,0xE983B7:0x363F,0xE98FA1:0x3640,
0xE99FBF:0x3641,0xE9A597:0x3642,0xE9A99A:0x3643,0xE4BBB0:0x3644,0xE5879D:0x3645,
0xE5B0AD:0x3646,0xE69A81:0x3647,0xE6A5AD:0x3648,0xE5B180:0x3649,0xE69BB2:0x364A,
0xE6A5B5:0x364B,0xE78E89:0x364C,0xE6A190:0x364D,0xE7B281:0x364E,0xE58385:0x364F,
0xE58BA4:0x3650,0xE59D87:0x3651,0xE5B7BE:0x3652,0xE98CA6:0x3653,0xE696A4:0x3654,
0xE6ACA3:0x3655,0xE6ACBD:0x3656,0xE790B4:0x3657,0xE7A681:0x3658,0xE7A6BD:0x3659,
0xE7AD8B:0x365A,0xE7B78A:0x365B,0xE88AB9:0x365C,0xE88F8C:0x365D,0xE8A1BF:0x365E,
0xE8A59F:0x365F,0xE8ACB9:0x3660,0xE8BF91:0x3661,0xE98791:0x3662,0xE5909F:0x3663,
0xE98A80:0x3664,0xE4B99D:0x3665,0xE580B6:0x3666,0xE58FA5:0x3667,0xE58CBA:0x3668,
0xE78B97:0x3669,0xE78E96:0x366A,0xE79FA9:0x366B,0xE88BA6:0x366C,0xE8BAAF:0x366D,
0xE9A786:0x366E,0xE9A788:0x366F,0xE9A792:0x3670,0xE585B7:0x3671,0xE6849A:0x3672,
0xE8999E:0x3673,0xE596B0:0x3674,0xE7A9BA:0x3675,0xE581B6:0x3676,0xE5AF93:0x3677,
0xE98187:0x3678,0xE99A85:0x3679,0xE4B8B2:0x367A,0xE6AB9B:0x367B,0xE987A7:0x367C,
0xE5B191:0x367D,0xE5B188:0x367E,0xE68E98:0x3721,0xE7AA9F:0x3722,0xE6B293:0x3723,
0xE99DB4:0x3724,0xE8BDA1:0x3725,0xE7AAAA:0x3726,0xE7868A:0x3727,0xE99A88:0x3728,
0xE7B282:0x3729,0xE6A097:0x372A,0xE7B9B0:0x372B,0xE6A191:0x372C,0xE98DAC:0x372D,
0xE58BB2:0x372E,0xE5909B:0x372F,0xE896AB:0x3730,0xE8A893:0x3731,0xE7BEA4:0x3732,
0xE8BB8D:0x3733,0xE983A1:0x3734,0xE58DA6:0x3735,0xE8A288:0x3736,0xE7A581:0x3737,
0xE4BF82:0x3738,0xE582BE:0x3739,0xE58891:0x373A,0xE58584:0x373B,0xE59593:0x373C,
0xE59CAD:0x373D,0xE78FAA:0x373E,0xE59E8B:0x373F,0xE5A591:0x3740,0xE5BDA2:0x3741,
0xE5BE84:0x3742,0xE681B5:0x3743,0xE685B6:0x3744,0xE685A7:0x3745,0xE686A9:0x3746,
0xE68EB2:0x3747,0xE690BA:0x3748,0xE695AC:0x3749,0xE699AF:0x374A,0xE6A182:0x374B,
0xE6B893:0x374C,0xE795A6:0x374D,0xE7A8BD:0x374E,0xE7B3BB:0x374F,0xE7B58C:0x3750,
0xE7B699:0x3751,0xE7B98B:0x3752,0xE7BDAB:0x3753,0xE88C8E:0x3754,0xE88D8A:0x3755,
0xE89B8D:0x3756,0xE8A888:0x3757,0xE8A9A3:0x3758,0xE8ADA6:0x3759,0xE8BBBD:0x375A,
0xE9A09A:0x375B,0xE9B68F:0x375C,0xE88AB8:0x375D,0xE8BF8E:0x375E,0xE9AFA8:0x375F,
0xE58A87:0x3760,0xE6889F:0x3761,0xE69283:0x3762,0xE6BF80:0x3763,0xE99A99:0x3764,
0xE6A181:0x3765,0xE58291:0x3766,0xE6ACA0:0x3767,0xE6B1BA:0x3768,0xE6BD94:0x3769,
0xE7A9B4:0x376A,0xE7B590:0x376B,0xE8A180:0x376C,0xE8A8A3:0x376D,0xE69C88:0x376E,
0xE4BBB6:0x376F,0xE580B9:0x3770,0xE580A6:0x3771,0xE581A5:0x3772,0xE585BC:0x3773,
0xE588B8:0x3774,0xE589A3:0x3775,0xE596A7:0x3776,0xE59C8F:0x3777,0xE5A085:0x3778,
0xE5AB8C:0x3779,0xE5BBBA:0x377A,0xE686B2:0x377B,0xE687B8:0x377C,0xE68BB3:0x377D,
0xE68DB2:0x377E,0xE6A49C:0x3821,0xE6A8A9:0x3822,0xE789BD:0x3823,0xE78AAC:0x3824,
0xE78CAE:0x3825,0xE7A094:0x3826,0xE7A1AF:0x3827,0xE7B5B9:0x3828,0xE79C8C:0x3829,
0xE882A9:0x382A,0xE8A68B:0x382B,0xE8AC99:0x382C,0xE8B3A2:0x382D,0xE8BB92:0x382E,
0xE981A3:0x382F,0xE98DB5:0x3830,0xE999BA:0x3831,0xE9A195:0x3832,0xE9A893:0x3833,
0xE9B9B8:0x3834,0xE58583:0x3835,0xE58E9F:0x3836,0xE58EB3:0x3837,0xE5B9BB:0x3838,
0xE5BCA6:0x3839,0xE6B89B:0x383A,0xE6BA90:0x383B,0xE78E84:0x383C,0xE78FBE:0x383D,
0xE7B583:0x383E,0xE888B7:0x383F,0xE8A880:0x3840,0xE8ABBA:0x3841,0xE99990:0x3842,
0xE4B98E:0x3843,0xE5808B:0x3844,0xE58FA4:0x3845,0xE591BC:0x3846,0xE59BBA:0x3847,
0xE5A791:0x3848,0xE5ADA4:0x3849,0xE5B7B1:0x384A,0xE5BAAB:0x384B,0xE5BCA7:0x384C,
0xE688B8:0x384D,0xE69585:0x384E,0xE69EAF:0x384F,0xE6B996:0x3850,0xE78B90:0x3851,
0xE7B38A:0x3852,0xE8A2B4:0x3853,0xE882A1:0x3854,0xE883A1:0x3855,0xE88FB0:0x3856,
0xE8998E:0x3857,0xE8AA87:0x3858,0xE8B7A8:0x3859,0xE988B7:0x385A,0xE99B87:0x385B,
0xE9A1A7:0x385C,0xE9BC93:0x385D,0xE4BA94:0x385E,0xE4BA92:0x385F,0xE4BC8D:0x3860,
0xE58D88:0x3861,0xE59189:0x3862,0xE590BE:0x3863,0xE5A8AF:0x3864,0xE5BE8C:0x3865,
0xE5BEA1:0x3866,0xE6829F:0x3867,0xE6A2A7:0x3868,0xE6AA8E:0x3869,0xE7919A:0x386A,
0xE7A281:0x386B,0xE8AA9E:0x386C,0xE8AAA4:0x386D,0xE8ADB7:0x386E,0xE98690:0x386F,
0xE4B99E:0x3870,0xE9AF89:0x3871,0xE4BAA4:0x3872,0xE4BDBC:0x3873,0xE4BEAF:0x3874,
0xE58099:0x3875,0xE58096:0x3876,0xE58589:0x3877,0xE585AC:0x3878,0xE58A9F:0x3879,
0xE58AB9:0x387A,0xE58BBE:0x387B,0xE58E9A:0x387C,0xE58FA3:0x387D,0xE59091:0x387E,
0xE5908E:0x3921,0xE59689:0x3922,0xE59D91:0x3923,0xE59EA2:0x3924,0xE5A5BD:0x3925,
0xE5AD94:0x3926,0xE5AD9D:0x3927,0xE5AE8F:0x3928,0xE5B7A5:0x3929,0xE5B7A7:0x392A,
0xE5B7B7:0x392B,0xE5B9B8:0x392C,0xE5BA83:0x392D,0xE5BA9A:0x392E,0xE5BAB7:0x392F,
0xE5BC98:0x3930,0xE68192:0x3931,0xE6858C:0x3932,0xE68A97:0x3933,0xE68B98:0x3934,
0xE68EA7:0x3935,0xE694BB:0x3936,0xE69882:0x3937,0xE69983:0x3938,0xE69BB4:0x3939,
0xE69DAD:0x393A,0xE6A0A1:0x393B,0xE6A297:0x393C,0xE6A78B:0x393D,0xE6B19F:0x393E,
0xE6B4AA:0x393F,0xE6B5A9:0x3940,0xE6B8AF:0x3941,0xE6BA9D:0x3942,0xE794B2:0x3943,
0xE79A87:0x3944,0xE7A1AC:0x3945,0xE7A8BF:0x3946,0xE7B3A0:0x3947,0xE7B485:0x3948,
0xE7B498:0x3949,0xE7B59E:0x394A,0xE7B6B1:0x394B,0xE88095:0x394C,0xE88083:0x394D,
0xE882AF:0x394E,0xE882B1:0x394F,0xE88594:0x3950,0xE8868F:0x3951,0xE888AA:0x3952,
0xE88D92:0x3953,0xE8A18C:0x3954,0xE8A1A1:0x3955,0xE8AC9B:0x3956,0xE8B2A2:0x3957,
0xE8B3BC:0x3958,0xE9838A:0x3959,0xE985B5:0x395A,0xE989B1:0x395B,0xE7A0BF:0x395C,
0xE98BBC:0x395D,0xE996A4:0x395E,0xE9998D:0x395F,0xE9A085:0x3960,0xE9A699:0x3961,
0xE9AB98:0x3962,0xE9B4BB:0x3963,0xE5899B:0x3964,0xE58AAB:0x3965,0xE58FB7:0x3966,
0xE59088:0x3967,0xE5A395:0x3968,0xE68BB7:0x3969,0xE6BFA0:0x396A,0xE8B1AA:0x396B,
0xE8BD9F:0x396C,0xE9BAB9:0x396D,0xE5858B:0x396E,0xE588BB:0x396F,0xE5918A:0x3970,
0xE59BBD:0x3971,0xE7A980:0x3972,0xE985B7:0x3973,0xE9B5A0:0x3974,0xE9BB92:0x3975,
0xE78D84:0x3976,0xE6BC89:0x3977,0xE885B0:0x3978,0xE79491:0x3979,0xE5BFBD:0x397A,
0xE6839A:0x397B,0xE9AAA8:0x397C,0xE78B9B:0x397D,0xE8BEBC:0x397E,0xE6ADA4:0x3A21,
0xE9A083:0x3A22,0xE4BB8A:0x3A23,0xE59BB0:0x3A24,0xE59DA4:0x3A25,0xE5A2BE:0x3A26,
0xE5A99A:0x3A27,0xE681A8:0x3A28,0xE68787:0x3A29,0xE6988F:0x3A2A,0xE69886:0x3A2B,
0xE6A0B9:0x3A2C,0xE6A2B1:0x3A2D,0xE6B7B7:0x3A2E,0xE79795:0x3A2F,0xE7B4BA:0x3A30,
0xE889AE:0x3A31,0xE9AD82:0x3A32,0xE4BA9B:0x3A33,0xE4BD90:0x3A34,0xE58F89:0x3A35,
0xE59486:0x3A36,0xE5B5AF:0x3A37,0xE5B7A6:0x3A38,0xE5B7AE:0x3A39,0xE69FBB:0x3A3A,
0xE6B299:0x3A3B,0xE791B3:0x3A3C,0xE7A082:0x3A3D,0xE8A990:0x3A3E,0xE98E96:0x3A3F,
0xE8A39F:0x3A40,0xE59D90:0x3A41,0xE5BAA7:0x3A42,0xE68CAB:0x3A43,0xE582B5:0x3A44,
0xE582AC:0x3A45,0xE5868D:0x3A46,0xE69C80:0x3A47,0xE59389:0x3A48,0xE5A19E:0x3A49,
0xE5A6BB:0x3A4A,0xE5AEB0:0x3A4B,0xE5BDA9:0x3A4C,0xE6898D:0x3A4D,0xE68EA1:0x3A4E,
0xE6A0BD:0x3A4F,0xE6ADB3:0x3A50,0xE6B888:0x3A51,0xE781BD:0x3A52,0xE98787:0x3A53,
0xE78A80:0x3A54,0xE7A095:0x3A55,0xE7A0A6:0x3A56,0xE7A5AD:0x3A57,0xE6968E:0x3A58,
0xE7B4B0:0x3A59,0xE88F9C:0x3A5A,0xE8A381:0x3A5B,0xE8BC89:0x3A5C,0xE99A9B:0x3A5D,
0xE589A4:0x3A5E,0xE59CA8:0x3A5F,0xE69D90:0x3A60,0xE7BDAA:0x3A61,0xE8B2A1:0x3A62,
0xE586B4:0x3A63,0xE59D82:0x3A64,0xE998AA:0x3A65,0xE5A0BA:0x3A66,0xE6A68A:0x3A67,
0xE882B4:0x3A68,0xE592B2:0x3A69,0xE5B48E:0x3A6A,0xE59FBC:0x3A6B,0xE7A295:0x3A6C,
0xE9B7BA:0x3A6D,0xE4BD9C:0x3A6E,0xE5898A:0x3A6F,0xE5928B:0x3A70,0xE690BE:0x3A71,
0xE698A8:0x3A72,0xE69C94:0x3A73,0xE69FB5:0x3A74,0xE7AA84:0x3A75,0xE7AD96:0x3A76,
0xE7B4A2:0x3A77,0xE98CAF:0x3A78,0xE6A19C:0x3A79,0xE9AEAD:0x3A7A,0xE7ACB9:0x3A7B,
0xE58C99:0x3A7C,0xE5868A:0x3A7D,0xE588B7:0x3A7E,0xE5AF9F:0x3B21,0xE68BB6:0x3B22,
0xE692AE:0x3B23,0xE693A6:0x3B24,0xE69CAD:0x3B25,0xE6AEBA:0x3B26,0xE896A9:0x3B27,
0xE99B91:0x3B28,0xE79A90:0x3B29,0xE9AF96:0x3B2A,0xE68D8C:0x3B2B,0xE98C86:0x3B2C,
0xE9AEAB:0x3B2D,0xE79ABF:0x3B2E,0xE69992:0x3B2F,0xE4B889:0x3B30,0xE58298:0x3B31,
0xE58F82:0x3B32,0xE5B1B1:0x3B33,0xE683A8:0x3B34,0xE69292:0x3B35,0xE695A3:0x3B36,
0xE6A19F:0x3B37,0xE787A6:0x3B38,0xE78F8A:0x3B39,0xE794A3:0x3B3A,0xE7AE97:0x3B3B,
0xE7BA82:0x3B3C,0xE89A95:0x3B3D,0xE8AE83:0x3B3E,0xE8B39B:0x3B3F,0xE985B8:0x3B40,
0xE9A490:0x3B41,0xE696AC:0x3B42,0xE69AAB:0x3B43,0xE6AE8B:0x3B44,0xE4BB95:0x3B45,
0xE4BB94:0x3B46,0xE4BCBA:0x3B47,0xE4BDBF:0x3B48,0xE588BA:0x3B49,0xE58FB8:0x3B4A,
0xE58FB2:0x3B4B,0xE597A3:0x3B4C,0xE59B9B:0x3B4D,0xE5A3AB:0x3B4E,0xE5A78B:0x3B4F,
0xE5A789:0x3B50,0xE5A7BF:0x3B51,0xE5AD90:0x3B52,0xE5B18D:0x3B53,0xE5B882:0x3B54,
0xE5B8AB:0x3B55,0xE5BF97:0x3B56,0xE6809D:0x3B57,0xE68C87:0x3B58,0xE694AF:0x3B59,
0xE5AD9C:0x3B5A,0xE696AF:0x3B5B,0xE696BD:0x3B5C,0xE697A8:0x3B5D,0xE69E9D:0x3B5E,
0xE6ADA2:0x3B5F,0xE6ADBB:0x3B60,0xE6B08F:0x3B61,0xE78D85:0x3B62,0xE7A589:0x3B63,
0xE7A781:0x3B64,0xE7B3B8:0x3B65,0xE7B499:0x3B66,0xE7B4AB:0x3B67,0xE882A2:0x3B68,
0xE88482:0x3B69,0xE887B3:0x3B6A,0xE8A696:0x3B6B,0xE8A99E:0x3B6C,0xE8A9A9:0x3B6D,
0xE8A9A6:0x3B6E,0xE8AA8C:0x3B6F,0xE8ABAE:0x3B70,0xE8B387:0x3B71,0xE8B39C:0x3B72,
0xE99B8C:0x3B73,0xE9A3BC:0x3B74,0xE6ADAF:0x3B75,0xE4BA8B:0x3B76,0xE4BCBC:0x3B77,
0xE4BE8D:0x3B78,0xE58590:0x3B79,0xE5AD97:0x3B7A,0xE5AFBA:0x3B7B,0xE68588:0x3B7C,
0xE68C81:0x3B7D,0xE69982:0x3B7E,0xE6ACA1:0x3C21,0xE6BB8B:0x3C22,0xE6B2BB:0x3C23,
0xE788BE:0x3C24,0xE792BD:0x3C25,0xE79794:0x3C26,0xE7A381:0x3C27,0xE7A4BA:0x3C28,
0xE8808C:0x3C29,0xE880B3:0x3C2A,0xE887AA:0x3C2B,0xE89294:0x3C2C,0xE8BE9E:0x3C2D,
0xE6B190:0x3C2E,0xE9B9BF:0x3C2F,0xE5BC8F:0x3C30,0xE8AD98:0x3C31,0xE9B4AB:0x3C32,
0xE7ABBA:0x3C33,0xE8BBB8:0x3C34,0xE5AE8D:0x3C35,0xE99BAB:0x3C36,0xE4B883:0x3C37,
0xE58FB1:0x3C38,0xE59FB7:0x3C39,0xE5A4B1:0x3C3A,0xE5AB89:0x3C3B,0xE5AEA4:0x3C3C,
0xE68289:0x3C3D,0xE6B9BF:0x3C3E,0xE6BC86:0x3C3F,0xE796BE:0x3C40,0xE8B3AA:0x3C41,
0xE5AE9F:0x3C42,0xE89480:0x3C43,0xE7AFA0:0x3C44,0xE581B2:0x3C45,0xE69FB4:0x3C46,
0xE88A9D:0x3C47,0xE5B1A1:0x3C48,0xE8958A:0x3C49,0xE7B89E:0x3C4A,0xE8888E:0x3C4B,
0xE58699:0x3C4C,0xE5B084:0x3C4D,0xE68DA8:0x3C4E,0xE8B5A6:0x3C4F,0xE6969C:0x3C50,
0xE785AE:0x3C51,0xE7A4BE:0x3C52,0xE7B497:0x3C53,0xE88085:0x3C54,0xE8AC9D:0x3C55,
0xE8BB8A:0x3C56,0xE981AE:0x3C57,0xE89B87:0x3C58,0xE982AA:0x3C59,0xE5809F:0x3C5A,
0xE58BBA:0x3C5B,0xE5B0BA:0x3C5C,0xE69D93:0x3C5D,0xE781BC:0x3C5E,0xE788B5:0x3C5F,
0xE9858C:0x3C60,0xE98788:0x3C61,0xE98CAB:0x3C62,0xE88BA5:0x3C63,0xE5AF82:0x3C64,
0xE5BCB1:0x3C65,0xE683B9:0x3C66,0xE4B8BB:0x3C67,0xE58F96:0x3C68,0xE5AE88:0x3C69,
0xE6898B:0x3C6A,0xE69CB1:0x3C6B,0xE6AE8A:0x3C6C,0xE78BA9:0x3C6D,0xE78FA0:0x3C6E,
0xE7A8AE:0x3C6F,0xE885AB:0x3C70,0xE8B6A3:0x3C71,0xE98592:0x3C72,0xE9A696:0x3C73,
0xE58492:0x3C74,0xE58F97:0x3C75,0xE591AA:0x3C76,0xE5AFBF:0x3C77,0xE68E88:0x3C78,
0xE6A8B9:0x3C79,0xE7B6AC:0x3C7A,0xE99C80:0x3C7B,0xE59B9A:0x3C7C,0xE58F8E:0x3C7D,
0xE591A8:0x3C7E,0xE5AE97:0x3D21,0xE5B0B1:0x3D22,0xE5B79E:0x3D23,0xE4BFAE:0x3D24,
0xE68481:0x3D25,0xE68BBE:0x3D26,0xE6B4B2:0x3D27,0xE7A780:0x3D28,0xE7A78B:0x3D29,
0xE7B582:0x3D2A,0xE7B98D:0x3D2B,0xE7BF92:0x3D2C,0xE887AD:0x3D2D,0xE8889F:0x3D2E,
0xE89290:0x3D2F,0xE8A186:0x3D30,0xE8A5B2:0x3D31,0xE8AE90:0x3D32,0xE8B9B4:0x3D33,
0xE8BCAF:0x3D34,0xE980B1:0x3D35,0xE9858B:0x3D36,0xE985AC:0x3D37,0xE99B86:0x3D38,
0xE9869C:0x3D39,0xE4BB80:0x3D3A,0xE4BD8F:0x3D3B,0xE58585:0x3D3C,0xE58D81:0x3D3D,
0xE5BE93:0x3D3E,0xE6888E:0x3D3F,0xE69F94:0x3D40,0xE6B181:0x3D41,0xE6B88B:0x3D42,
0xE78DA3:0x3D43,0xE7B8A6:0x3D44,0xE9878D:0x3D45,0xE98A83:0x3D46,0xE58F94:0x3D47,
0xE5A499:0x3D48,0xE5AEBF:0x3D49,0xE6B791:0x3D4A,0xE7A59D:0x3D4B,0xE7B8AE:0x3D4C,
0xE7B29B:0x3D4D,0xE5A1BE:0x3D4E,0xE7869F:0x3D4F,0xE587BA:0x3D50,0xE8A193:0x3D51,
0xE8BFB0:0x3D52,0xE4BF8A:0x3D53,0xE5B3BB:0x3D54,0xE698A5:0x3D55,0xE79EAC:0x3D56,
0xE7ABA3:0x3D57,0xE8889C:0x3D58,0xE9A7BF:0x3D59,0xE58786:0x3D5A,0xE5BEAA:0x3D5B,
0xE697AC:0x3D5C,0xE6A5AF:0x3D5D,0xE6AE89:0x3D5E,0xE6B7B3:0x3D5F,0xE6BA96:0x3D60,
0xE6BDA4:0x3D61,0xE79BBE:0x3D62,0xE7B494:0x3D63,0xE5B7A1:0x3D64,0xE981B5:0x3D65,
0xE98687:0x3D66,0xE9A086:0x3D67,0xE587A6:0x3D68,0xE5889D:0x3D69,0xE68980:0x3D6A,
0xE69A91:0x3D6B,0xE69B99:0x3D6C,0xE6B89A:0x3D6D,0xE5BAB6:0x3D6E,0xE7B792:0x3D6F,
0xE7BDB2:0x3D70,0xE69BB8:0x3D71,0xE896AF:0x3D72,0xE897B7:0x3D73,0xE8ABB8:0x3D74,
0xE58AA9:0x3D75,0xE58F99:0x3D76,0xE5A5B3:0x3D77,0xE5BA8F:0x3D78,0xE5BE90:0x3D79,
0xE68195:0x3D7A,0xE98BA4:0x3D7B,0xE999A4:0x3D7C,0xE582B7:0x3D7D,0xE5849F:0x3D7E,
0xE58B9D:0x3E21,0xE58CA0:0x3E22,0xE58D87:0x3E23,0xE58FAC:0x3E24,0xE593A8:0x3E25,
0xE59586:0x3E26,0xE594B1:0x3E27,0xE59897:0x3E28,0xE5A5A8:0x3E29,0xE5A6BE:0x3E2A,
0xE5A8BC:0x3E2B,0xE5AEB5:0x3E2C,0xE5B086:0x3E2D,0xE5B08F:0x3E2E,0xE5B091:0x3E2F,
0xE5B09A:0x3E30,0xE5BA84:0x3E31,0xE5BA8A:0x3E32,0xE5BBA0:0x3E33,0xE5BDB0:0x3E34,
0xE689BF:0x3E35,0xE68A84:0x3E36,0xE68B9B:0x3E37,0xE68E8C:0x3E38,0xE68DB7:0x3E39,
0xE69887:0x3E3A,0xE6988C:0x3E3B,0xE698AD:0x3E3C,0xE699B6:0x3E3D,0xE69DBE:0x3E3E,
0xE6A2A2:0x3E3F,0xE6A89F:0x3E40,0xE6A8B5:0x3E41,0xE6B2BC:0x3E42,0xE6B688:0x3E43,
0xE6B889:0x3E44,0xE6B998:0x3E45,0xE784BC:0x3E46,0xE784A6:0x3E47,0xE785A7:0x3E48,
0xE79787:0x3E49,0xE79C81:0x3E4A,0xE7A19D:0x3E4B,0xE7A481:0x3E4C,0xE7A5A5:0x3E4D,
0xE7A7B0:0x3E4E,0xE7ABA0:0x3E4F,0xE7AC91:0x3E50,0xE7B2A7:0x3E51,0xE7B4B9:0x3E52,
0xE88296:0x3E53,0xE88F96:0x3E54,0xE8928B:0x3E55,0xE89589:0x3E56,0xE8A19D:0x3E57,
0xE8A3B3:0x3E58,0xE8A89F:0x3E59,0xE8A8BC:0x3E5A,0xE8A994:0x3E5B,0xE8A9B3:0x3E5C,
0xE8B1A1:0x3E5D,0xE8B39E:0x3E5E,0xE986A4:0x3E5F,0xE989A6:0x3E60,0xE98DBE:0x3E61,
0xE99098:0x3E62,0xE99A9C:0x3E63,0xE99E98:0x3E64,0xE4B88A:0x3E65,0xE4B888:0x3E66,
0xE4B89E:0x3E67,0xE4B997:0x3E68,0xE58697:0x3E69,0xE589B0:0x3E6A,0xE59F8E:0x3E6B,
0xE5A0B4:0x3E6C,0xE5A38C:0x3E6D,0xE5ACA2:0x3E6E,0xE5B8B8:0x3E6F,0xE68385:0x3E70,
0xE693BE:0x3E71,0xE69DA1:0x3E72,0xE69D96:0x3E73,0xE6B584:0x3E74,0xE78AB6:0x3E75,
0xE795B3:0x3E76,0xE7A9A3:0x3E77,0xE892B8:0x3E78,0xE8ADB2:0x3E79,0xE986B8:0x3E7A,
0xE98CA0:0x3E7B,0xE598B1:0x3E7C,0xE59FB4:0x3E7D,0xE9A3BE:0x3E7E,0xE68BAD:0x3F21,
0xE6A48D:0x3F22,0xE6AE96:0x3F23,0xE787AD:0x3F24,0xE7B994:0x3F25,0xE881B7:0x3F26,
0xE889B2:0x3F27,0xE8A7A6:0x3F28,0xE9A39F:0x3F29,0xE89D95:0x3F2A,0xE8BEB1:0x3F2B,
0xE5B0BB:0x3F2C,0xE4BCB8:0x3F2D,0xE4BFA1:0x3F2E,0xE4BEB5:0x3F2F,0xE59487:0x3F30,
0xE5A8A0:0x3F31,0xE5AF9D:0x3F32,0xE5AFA9:0x3F33,0xE5BF83:0x3F34,0xE6858E:0x3F35,
0xE68CAF:0x3F36,0xE696B0:0x3F37,0xE6998B:0x3F38,0xE6A3AE:0x3F39,0xE6A69B:0x3F3A,
0xE6B5B8:0x3F3B,0xE6B7B1:0x3F3C,0xE794B3:0x3F3D,0xE796B9:0x3F3E,0xE79C9F:0x3F3F,
0xE7A59E:0x3F40,0xE7A7A6:0x3F41,0xE7B4B3:0x3F42,0xE887A3:0x3F43,0xE88AAF:0x3F44,
0xE896AA:0x3F45,0xE8A6AA:0x3F46,0xE8A8BA:0x3F47,0xE8BAAB:0x3F48,0xE8BE9B:0x3F49,
0xE980B2:0x3F4A,0xE9879D:0x3F4B,0xE99C87:0x3F4C,0xE4BABA:0x3F4D,0xE4BB81:0x3F4E,
0xE58883:0x3F4F,0xE5A1B5:0x3F50,0xE5A3AC:0x3F51,0xE5B08B:0x3F52,0xE7949A:0x3F53,
0xE5B0BD:0x3F54,0xE8858E:0x3F55,0xE8A88A:0x3F56,0xE8BF85:0x3F57,0xE999A3:0x3F58,
0xE99DAD:0x3F59,0xE7ACA5:0x3F5A,0xE8AB8F:0x3F5B,0xE9A088:0x3F5C,0xE985A2:0x3F5D,
0xE59BB3:0x3F5E,0xE58EA8:0x3F5F,0xE98097:0x3F60,0xE590B9:0x3F61,0xE59E82:0x3F62,
0xE5B8A5:0x3F63,0xE68EA8:0x3F64,0xE6B0B4:0x3F65,0xE7828A:0x3F66,0xE79DA1:0x3F67,
0xE7B28B:0x3F68,0xE7BFA0:0x3F69,0xE8A1B0:0x3F6A,0xE98182:0x3F6B,0xE98594:0x3F6C,
0xE98C90:0x3F6D,0xE98C98:0x3F6E,0xE99A8F:0x3F6F,0xE7919E:0x3F70,0xE9AB84:0x3F71,
0xE5B487:0x3F72,0xE5B5A9:0x3F73,0xE695B0:0x3F74,0xE69EA2:0x3F75,0xE8B6A8:0x3F76,
0xE99B9B:0x3F77,0xE68DAE:0x3F78,0xE69D89:0x3F79,0xE6A499:0x3F7A,0xE88F85:0x3F7B,
0xE9A097:0x3F7C,0xE99B80:0x3F7D,0xE8A3BE:0x3F7E,0xE6BE84:0x4021,0xE691BA:0x4022,
0xE5AFB8:0x4023,0xE4B896:0x4024,0xE780AC:0x4025,0xE7959D:0x4026,0xE698AF:0x4027,
0xE58784:0x4028,0xE588B6:0x4029,0xE58BA2:0x402A,0xE5A793:0x402B,0xE5BE81:0x402C,
0xE680A7:0x402D,0xE68890:0x402E,0xE694BF:0x402F,0xE695B4:0x4030,0xE6989F:0x4031,
0xE699B4:0x4032,0xE6A3B2:0x4033,0xE6A096:0x4034,0xE6ADA3:0x4035,0xE6B885:0x4036,
0xE789B2:0x4037,0xE7949F:0x4038,0xE79B9B:0x4039,0xE7B2BE:0x403A,0xE88196:0x403B,
0xE5A3B0:0x403C,0xE8A3BD:0x403D,0xE8A5BF:0x403E,0xE8AAA0:0x403F,0xE8AA93:0x4040,
0xE8AB8B:0x4041,0xE9809D:0x4042,0xE98692:0x4043,0xE99D92:0x4044,0xE99D99:0x4045,
0xE69689:0x4046,0xE7A88E:0x4047,0xE88486:0x4048,0xE99ABB:0x4049,0xE5B8AD:0x404A,
0xE6839C:0x404B,0xE6889A:0x404C,0xE696A5:0x404D,0xE69894:0x404E,0xE69E90:0x404F,
0xE79FB3:0x4050,0xE7A98D:0x4051,0xE7B18D:0x4052,0xE7B8BE:0x4053,0xE8848A:0x4054,
0xE8B2AC:0x4055,0xE8B5A4:0x4056,0xE8B7A1:0x4057,0xE8B99F:0x4058,0xE7A2A9:0x4059,
0xE58887:0x405A,0xE68B99:0x405B,0xE68EA5:0x405C,0xE69182:0x405D,0xE68A98:0x405E,
0xE8A8AD:0x405F,0xE7AA83:0x4060,0xE7AF80:0x4061,0xE8AAAC:0x4062,0xE99BAA:0x4063,
0xE7B5B6:0x4064,0xE8888C:0x4065,0xE89D89:0x4066,0xE4BB99:0x4067,0xE58588:0x4068,
0xE58D83:0x4069,0xE58DA0:0x406A,0xE5AEA3:0x406B,0xE5B082:0x406C,0xE5B096:0x406D,
0xE5B79D:0x406E,0xE688A6:0x406F,0xE68987:0x4070,0xE692B0:0x4071,0xE6A093:0x4072,
0xE6A0B4:0x4073,0xE6B389:0x4074,0xE6B585:0x4075,0xE6B497:0x4076,0xE69F93:0x4077,
0xE6BD9C:0x4078,0xE7858E:0x4079,0xE785BD:0x407A,0xE6978B:0x407B,0xE7A9BF:0x407C,
0xE7AEAD:0x407D,0xE7B79A:0x407E,0xE7B98A:0x4121,0xE7BEA8:0x4122,0xE885BA:0x4123,
0xE8889B:0x4124,0xE888B9:0x4125,0xE896A6:0x4126,0xE8A9AE:0x4127,0xE8B38E:0x4128,
0xE8B7B5:0x4129,0xE981B8:0x412A,0xE981B7:0x412B,0xE98AAD:0x412C,0xE98A91:0x412D,
0xE99683:0x412E,0xE9AEAE:0x412F,0xE5898D:0x4130,0xE59684:0x4131,0xE6BCB8:0x4132,
0xE784B6:0x4133,0xE585A8:0x4134,0xE7A685:0x4135,0xE7B995:0x4136,0xE886B3:0x4137,
0xE7B38E:0x4138,0xE5998C:0x4139,0xE5A191:0x413A,0xE5B2A8:0x413B,0xE68EAA:0x413C,
0xE69BBE:0x413D,0xE69BBD:0x413E,0xE6A59A:0x413F,0xE78B99:0x4140,0xE7968F:0x4141,
0xE7968E:0x4142,0xE7A48E:0x4143,0xE7A596:0x4144,0xE7A79F:0x4145,0xE7B297:0x4146,
0xE7B4A0:0x4147,0xE7B584:0x4148,0xE89887:0x4149,0xE8A8B4:0x414A,0xE998BB:0x414B,
0xE981A1:0x414C,0xE9BCA0:0x414D,0xE583A7:0x414E,0xE589B5:0x414F,0xE58F8C:0x4150,
0xE58FA2:0x4151,0xE58089:0x4152,0xE596AA:0x4153,0xE5A3AE:0x4154,0xE5A58F:0x4155,
0xE788BD:0x4156,0xE5AE8B:0x4157,0xE5B1A4:0x4158,0xE58C9D:0x4159,0xE683A3:0x415A,
0xE683B3:0x415B,0xE68D9C:0x415C,0xE68E83:0x415D,0xE68CBF:0x415E,0xE68EBB:0x415F,
0xE6938D:0x4160,0xE697A9:0x4161,0xE69BB9:0x4162,0xE5B7A3:0x4163,0xE6A78D:0x4164,
0xE6A7BD:0x4165,0xE6BC95:0x4166,0xE787A5:0x4167,0xE4BA89:0x4168,0xE797A9:0x4169,
0xE79BB8:0x416A,0xE7AA93:0x416B,0xE7B39F:0x416C,0xE7B78F:0x416D,0xE7B69C:0x416E,
0xE881A1:0x416F,0xE88D89:0x4170,0xE88D98:0x4171,0xE891AC:0x4172,0xE892BC:0x4173,
0xE897BB:0x4174,0xE8A385:0x4175,0xE8B5B0:0x4176,0xE98081:0x4177,0xE981AD:0x4178,
0xE98E97:0x4179,0xE99C9C:0x417A,0xE9A892:0x417B,0xE5838F:0x417C,0xE5A297:0x417D,
0xE6868E:0x417E,0xE88793:0x4221,0xE894B5:0x4222,0xE8B488:0x4223,0xE980A0:0x4224,
0xE4BF83:0x4225,0xE581B4:0x4226,0xE58987:0x4227,0xE58DB3:0x4228,0xE681AF:0x4229,
0xE68D89:0x422A,0xE69D9F:0x422B,0xE6B8AC:0x422C,0xE8B6B3:0x422D,0xE9809F:0x422E,
0xE4BF97:0x422F,0xE5B19E:0x4230,0xE8B38A:0x4231,0xE6978F:0x4232,0xE7B69A:0x4233,
0xE58D92:0x4234,0xE8A296:0x4235,0xE585B6:0x4236,0xE68F83:0x4237,0xE5AD98:0x4238,
0xE5ADAB:0x4239,0xE5B08A:0x423A,0xE6908D:0x423B,0xE69D91:0x423C,0xE9819C:0x423D,
0xE4BB96:0x423E,0xE5A49A:0x423F,0xE5A4AA:0x4240,0xE6B1B0:0x4241,0xE8A991:0x4242,
0xE594BE:0x4243,0xE5A095:0x4244,0xE5A6A5:0x4245,0xE683B0:0x4246,0xE68993:0x4247,
0xE69F81:0x4248,0xE888B5:0x4249,0xE6A595:0x424A,0xE99980:0x424B,0xE9A784:0x424C,
0xE9A8A8:0x424D,0xE4BD93:0x424E,0xE5A086:0x424F,0xE5AFBE:0x4250,0xE88090:0x4251,
0xE5B2B1:0x4252,0xE5B8AF:0x4253,0xE5BE85:0x4254,0xE680A0:0x4255,0xE6858B:0x4256,
0xE688B4:0x4257,0xE69BBF:0x4258,0xE6B3B0:0x4259,0xE6BB9E:0x425A,0xE8838E:0x425B,
0xE885BF:0x425C,0xE88B94:0x425D,0xE8A28B:0x425E,0xE8B2B8:0x425F,0xE98080:0x4260,
0xE980AE:0x4261,0xE99A8A:0x4262,0xE9BB9B:0x4263,0xE9AF9B:0x4264,0xE4BBA3:0x4265,
0xE58FB0:0x4266,0xE5A4A7:0x4267,0xE7ACAC:0x4268,0xE9868D:0x4269,0xE9A18C:0x426A,
0xE9B7B9:0x426B,0xE6BB9D:0x426C,0xE780A7:0x426D,0xE58D93:0x426E,0xE59584:0x426F,
0xE5AE85:0x4270,0xE68998:0x4271,0xE68A9E:0x4272,0xE68B93:0x4273,0xE6B2A2:0x4274,
0xE6BFAF:0x4275,0xE790A2:0x4276,0xE8A897:0x4277,0xE990B8:0x4278,0xE6BF81:0x4279,
0xE8ABBE:0x427A,0xE88CB8:0x427B,0xE587A7:0x427C,0xE89BB8:0x427D,0xE58FAA:0x427E,
0xE58FA9:0x4321,0xE4BD86:0x4322,0xE98194:0x4323,0xE8BEB0:0x4324,0xE5A5AA:0x4325,
0xE884B1:0x4326,0xE5B7BD:0x4327,0xE7ABAA:0x4328,0xE8BEBF:0x4329,0xE6A39A:0x432A,
0xE8B0B7:0x432B,0xE78BB8:0x432C,0xE9B188:0x432D,0xE6A8BD:0x432E,0xE8AAB0:0x432F,
0xE4B8B9:0x4330,0xE58D98:0x4331,0xE59886:0x4332,0xE59DA6:0x4333,0xE68B85:0x4334,
0xE68EA2:0x4335,0xE697A6:0x4336,0xE6AD8E:0x4337,0xE6B7A1:0x4338,0xE6B99B:0x4339,
0xE782AD:0x433A,0xE79FAD:0x433B,0xE7ABAF:0x433C,0xE7AEAA:0x433D,0xE7B6BB:0x433E,
0xE880BD:0x433F,0xE88386:0x4340,0xE89B8B:0x4341,0xE8AA95:0x4342,0xE98D9B:0x4343,
0xE59BA3:0x4344,0xE5A387:0x4345,0xE5BCBE:0x4346,0xE696AD:0x4347,0xE69A96:0x4348,
0xE6AA80:0x4349,0xE6AEB5:0x434A,0xE794B7:0x434B,0xE8AB87:0x434C,0xE580A4:0x434D,
0xE79FA5:0x434E,0xE59CB0:0x434F,0xE5BC9B:0x4350,0xE681A5:0x4351,0xE699BA:0x4352,
0xE6B1A0:0x4353,0xE797B4:0x4354,0xE7A89A:0x4355,0xE7BDAE:0x4356,0xE887B4:0x4357,
0xE89C98:0x4358,0xE98185:0x4359,0xE9A6B3:0x435A,0xE7AF89:0x435B,0xE7959C:0x435C,
0xE7ABB9:0x435D,0xE7AD91:0x435E,0xE89384:0x435F,0xE98090:0x4360,0xE7A7A9:0x4361,
0xE7AA92:0x4362,0xE88CB6:0x4363,0xE5ABA1:0x4364,0xE79D80:0x4365,0xE4B8AD:0x4366,
0xE4BBB2:0x4367,0xE5AE99:0x4368,0xE5BFA0:0x4369,0xE68ABD:0x436A,0xE698BC:0x436B,
0xE69FB1:0x436C,0xE6B3A8:0x436D,0xE899AB:0x436E,0xE8A1B7:0x436F,0xE8A8BB:0x4370,
0xE9858E:0x4371,0xE98BB3:0x4372,0xE9A790:0x4373,0xE6A897:0x4374,0xE780A6:0x4375,
0xE78CAA:0x4376,0xE88BA7:0x4377,0xE89197:0x4378,0xE8B2AF:0x4379,0xE4B881:0x437A,
0xE58586:0x437B,0xE5878B:0x437C,0xE5968B:0x437D,0xE5AFB5:0x437E,0xE5B896:0x4421,
0xE5B8B3:0x4422,0xE5BA81:0x4423,0xE5BC94:0x4424,0xE5BCB5:0x4425,0xE5BDAB:0x4426,
0xE5BEB4:0x4427,0xE687B2:0x4428,0xE68C91:0x4429,0xE69AA2:0x442A,0xE69C9D:0x442B,
0xE6BDAE:0x442C,0xE78992:0x442D,0xE794BA:0x442E,0xE79CBA:0x442F,0xE881B4:0x4430,
0xE884B9:0x4431,0xE885B8:0x4432,0xE89DB6:0x4433,0xE8AABF:0x4434,0xE8AB9C:0x4435,
0xE8B685:0x4436,0xE8B7B3:0x4437,0xE98A9A:0x4438,0xE995B7:0x4439,0xE9A082:0x443A,
0xE9B3A5:0x443B,0xE58B85:0x443C,0xE68D97:0x443D,0xE79BB4:0x443E,0xE69C95:0x443F,
0xE6B288:0x4440,0xE78F8D:0x4441,0xE8B383:0x4442,0xE98EAE:0x4443,0xE999B3:0x4444,
0xE6B4A5:0x4445,0xE5A29C:0x4446,0xE6A48E:0x4447,0xE6A78C:0x4448,0xE8BFBD:0x4449,
0xE98E9A:0x444A,0xE7979B:0x444B,0xE9809A:0x444C,0xE5A19A:0x444D,0xE6A082:0x444E,
0xE68EB4:0x444F,0xE6A7BB:0x4450,0xE4BD83:0x4451,0xE6BCAC:0x4452,0xE69F98:0x4453,
0xE8BEBB:0x4454,0xE894A6:0x4455,0xE7B6B4:0x4456,0xE98D94:0x4457,0xE6A4BF:0x4458,
0xE6BDB0:0x4459,0xE59DAA:0x445A,0xE5A3B7:0x445B,0xE5ACAC:0x445C,0xE7B4AC:0x445D,
0xE788AA:0x445E,0xE5908A:0x445F,0xE987A3:0x4460,0xE9B6B4:0x4461,0xE4BAAD:0x4462,
0xE4BD8E:0x4463,0xE5819C:0x4464,0xE581B5:0x4465,0xE58983:0x4466,0xE8B29E:0x4467,
0xE59188:0x4468,0xE5A0A4:0x4469,0xE5AE9A:0x446A,0xE5B89D:0x446B,0xE5BA95:0x446C,
0xE5BAAD:0x446D,0xE5BBB7:0x446E,0xE5BC9F:0x446F,0xE6828C:0x4470,0xE68AB5:0x4471,
0xE68CBA:0x4472,0xE68F90:0x4473,0xE6A2AF:0x4474,0xE6B180:0x4475,0xE7A287:0x4476,
0xE7A68E:0x4477,0xE7A88B:0x4478,0xE7B7A0:0x4479,0xE88987:0x447A,0xE8A882:0x447B,
0xE8ABA6:0x447C,0xE8B984:0x447D,0xE98093:0x447E,0xE982B8:0x4521,0xE984AD:0x4522,
0xE98798:0x4523,0xE9BC8E:0x4524,0xE6B3A5:0x4525,0xE69198:0x4526,0xE693A2:0x4527,
0xE695B5:0x4528,0xE6BBB4:0x4529,0xE79A84:0x452A,0xE7AC9B:0x452B,0xE981A9:0x452C,
0xE98F91:0x452D,0xE6BABA:0x452E,0xE593B2:0x452F,0xE5BEB9:0x4530,0xE692A4:0x4531,
0xE8BD8D:0x4532,0xE8BFAD:0x4533,0xE98984:0x4534,0xE585B8:0x4535,0xE5A1AB:0x4536,
0xE5A4A9:0x4537,0xE5B195:0x4538,0xE5BA97:0x4539,0xE6B7BB:0x453A,0xE7BA8F:0x453B,
0xE7949C:0x453C,0xE8B2BC:0x453D,0xE8BBA2:0x453E,0xE9A19B:0x453F,0xE782B9:0x4540,
0xE4BC9D:0x4541,0xE6AEBF:0x4542,0xE6BEB1:0x4543,0xE794B0:0x4544,0xE99BBB:0x4545,
0xE5858E:0x4546,0xE59090:0x4547,0xE5A0B5:0x4548,0xE5A197:0x4549,0xE5A6AC:0x454A,
0xE5B1A0:0x454B,0xE5BE92:0x454C,0xE69697:0x454D,0xE69D9C:0x454E,0xE6B8A1:0x454F,
0xE799BB:0x4550,0xE88F9F:0x4551,0xE8B3AD:0x4552,0xE98094:0x4553,0xE983BD:0x4554,
0xE98D8D:0x4555,0xE7A0A5:0x4556,0xE7A0BA:0x4557,0xE58AAA:0x4558,0xE5BAA6:0x4559,
0xE59C9F:0x455A,0xE5A5B4:0x455B,0xE68092:0x455C,0xE58092:0x455D,0xE5859A:0x455E,
0xE586AC:0x455F,0xE5878D:0x4560,0xE58880:0x4561,0xE59490:0x4562,0xE5A194:0x4563,
0xE5A198:0x4564,0xE5A597:0x4565,0xE5AE95:0x4566,0xE5B3B6:0x4567,0xE5B68B:0x4568,
0xE682BC:0x4569,0xE68A95:0x456A,0xE690AD:0x456B,0xE69DB1:0x456C,0xE6A183:0x456D,
0xE6A2BC:0x456E,0xE6A39F:0x456F,0xE79B97:0x4570,0xE6B798:0x4571,0xE6B9AF:0x4572,
0xE6B69B:0x4573,0xE781AF:0x4574,0xE78788:0x4575,0xE5BD93:0x4576,0xE79798:0x4577,
0xE7A5B7:0x4578,0xE7AD89:0x4579,0xE7AD94:0x457A,0xE7AD92:0x457B,0xE7B396:0x457C,
0xE7B5B1:0x457D,0xE588B0:0x457E,0xE891A3:0x4621,0xE895A9:0x4622,0xE897A4:0x4623,
0xE8A88E:0x4624,0xE8AC84:0x4625,0xE8B186:0x4626,0xE8B88F:0x4627,0xE98083:0x4628,
0xE9808F:0x4629,0xE99099:0x462A,0xE999B6:0x462B,0xE9A0AD:0x462C,0xE9A8B0:0x462D,
0xE99798:0x462E,0xE5838D:0x462F,0xE58B95:0x4630,0xE5908C:0x4631,0xE5A082:0x4632,
0xE5B08E:0x4633,0xE686A7:0x4634,0xE6929E:0x4635,0xE6B49E:0x4636,0xE79EB3:0x4637,
0xE7ABA5:0x4638,0xE883B4:0x4639,0xE89084:0x463A,0xE98193:0x463B,0xE98A85:0x463C,
0xE5B3A0:0x463D,0xE9B487:0x463E,0xE58CBF:0x463F,0xE5BE97:0x4640,0xE5BEB3:0x4641,
0xE6B69C:0x4642,0xE789B9:0x4643,0xE79DA3:0x4644,0xE7A6BF:0x4645,0xE7AFA4:0x4646,
0xE6AF92:0x4647,0xE78BAC:0x4648,0xE8AAAD:0x4649,0xE6A083:0x464A,0xE6A9A1:0x464B,
0xE587B8:0x464C,0xE7AA81:0x464D,0xE6A4B4:0x464E,0xE5B18A:0x464F,0xE9B3B6:0x4650,
0xE88BAB:0x4651,0xE5AF85:0x4652,0xE98589:0x4653,0xE7809E:0x4654,0xE599B8:0x4655,
0xE5B1AF:0x4656,0xE68387:0x4657,0xE695A6:0x4658,0xE6B28C:0x4659,0xE8B19A:0x465A,
0xE98181:0x465B,0xE9A093:0x465C,0xE59191:0x465D,0xE69B87:0x465E,0xE9888D:0x465F,
0xE5A588:0x4660,0xE982A3:0x4661,0xE58685:0x4662,0xE4B98D:0x4663,0xE587AA:0x4664,
0xE89699:0x4665,0xE8AC8E:0x4666,0xE78198:0x4667,0xE68DBA:0x4668,0xE98D8B:0x4669,
0xE6A5A2:0x466A,0xE9A6B4:0x466B,0xE7B884:0x466C,0xE795B7:0x466D,0xE58D97:0x466E,
0xE6A5A0:0x466F,0xE8BB9F:0x4670,0xE99BA3:0x4671,0xE6B19D:0x4672,0xE4BA8C:0x4673,
0xE5B0BC:0x4674,0xE5BC90:0x4675,0xE8BFA9:0x4676,0xE58C82:0x4677,0xE8B391:0x4678,
0xE88289:0x4679,0xE899B9:0x467A,0xE5BBBF:0x467B,0xE697A5:0x467C,0xE4B9B3:0x467D,
0xE585A5:0x467E,0xE5A682:0x4721,0xE5B0BF:0x4722,0xE99FAE:0x4723,0xE4BBBB:0x4724,
0xE5A68A:0x4725,0xE5BF8D:0x4726,0xE8AA8D:0x4727,0xE6BFA1:0x4728,0xE7A6B0:0x4729,
0xE7A5A2:0x472A,0xE5AFA7:0x472B,0xE891B1:0x472C,0xE78CAB:0x472D,0xE786B1:0x472E,
0xE5B9B4:0x472F,0xE5BFB5:0x4730,0xE68DBB:0x4731,0xE6929A:0x4732,0xE78783:0x4733,
0xE7B298:0x4734,0xE4B983:0x4735,0xE5BBBC:0x4736,0xE4B98B:0x4737,0xE59F9C:0x4738,
0xE59AA2:0x4739,0xE682A9:0x473A,0xE6BF83:0x473B,0xE7B48D:0x473C,0xE883BD:0x473D,
0xE884B3:0x473E,0xE886BF:0x473F,0xE8BEB2:0x4740,0xE8A697:0x4741,0xE89AA4:0x4742,
0xE5B7B4:0x4743,0xE68A8A:0x4744,0xE692AD:0x4745,0xE8A687:0x4746,0xE69DB7:0x4747,
0xE6B3A2:0x4748,0xE6B4BE:0x4749,0xE790B6:0x474A,0xE7A0B4:0x474B,0xE5A986:0x474C,
0xE7BDB5:0x474D,0xE88AAD:0x474E,0xE9A6AC:0x474F,0xE4BFB3:0x4750,0xE5BB83:0x4751,
0xE68B9D:0x4752,0xE68E92:0x4753,0xE69597:0x4754,0xE69DAF:0x4755,0xE79B83:0x4756,
0xE7898C:0x4757,0xE8838C:0x4758,0xE882BA:0x4759,0xE8BCA9:0x475A,0xE9858D:0x475B,
0xE5808D:0x475C,0xE59FB9:0x475D,0xE5AA92:0x475E,0xE6A285:0x475F,0xE6A5B3:0x4760,
0xE785A4:0x4761,0xE78BBD:0x4762,0xE8B2B7:0x4763,0xE5A3B2:0x4764,0xE8B3A0:0x4765,
0xE999AA:0x4766,0xE98099:0x4767,0xE89DBF:0x4768,0xE7A7A4:0x4769,0xE79FA7:0x476A,
0xE890A9:0x476B,0xE4BCAF:0x476C,0xE589A5:0x476D,0xE58D9A:0x476E,0xE68B8D:0x476F,
0xE69F8F:0x4770,0xE6B38A:0x4771,0xE799BD:0x4772,0xE7AE94:0x4773,0xE7B295:0x4774,
0xE888B6:0x4775,0xE89684:0x4776,0xE8BFAB:0x4777,0xE69B9D:0x4778,0xE6BCA0:0x4779,
0xE78886:0x477A,0xE7B89B:0x477B,0xE88EAB:0x477C,0xE9A781:0x477D,0xE9BAA6:0x477E,
0xE587BD:0x4821,0xE7AEB1:0x4822,0xE7A1B2:0x4823,0xE7AEB8:0x4824,0xE88287:0x4825,
0xE7AD88:0x4826,0xE6ABA8:0x4827,0xE5B9A1:0x4828,0xE8828C:0x4829,0xE79591:0x482A,
0xE795A0:0x482B,0xE585AB:0x482C,0xE989A2:0x482D,0xE6BA8C:0x482E,0xE799BA:0x482F,
0xE98697:0x4830,0xE9ABAA:0x4831,0xE4BC90:0x4832,0xE7BDB0:0x4833,0xE68A9C:0x4834,
0xE7AD8F:0x4835,0xE996A5:0x4836,0xE9B3A9:0x4837,0xE599BA:0x4838,0xE5A199:0x4839,
0xE89BA4:0x483A,0xE99ABC:0x483B,0xE4BCB4:0x483C,0xE588A4:0x483D,0xE58D8A:0x483E,
0xE58F8D:0x483F,0xE58F9B:0x4840,0xE5B886:0x4841,0xE690AC:0x4842,0xE69691:0x4843,
0xE69DBF:0x4844,0xE6B0BE:0x4845,0xE6B18E:0x4846,0xE78988:0x4847,0xE78AAF:0x4848,
0xE78FAD:0x4849,0xE79594:0x484A,0xE7B981:0x484B,0xE888AC:0x484C,0xE897A9:0x484D,
0xE8B2A9:0x484E,0xE7AF84:0x484F,0xE98786:0x4850,0xE785A9:0x4851,0xE9A092:0x4852,
0xE9A3AF:0x4853,0xE68CBD:0x4854,0xE699A9:0x4855,0xE795AA:0x4856,0xE79BA4:0x4857,
0xE7A390:0x4858,0xE89583:0x4859,0xE89BAE:0x485A,0xE58CAA:0x485B,0xE58D91:0x485C,
0xE590A6:0x485D,0xE5A683:0x485E,0xE5BA87:0x485F,0xE5BDBC:0x4860,0xE682B2:0x4861,
0xE68989:0x4862,0xE689B9:0x4863,0xE68AAB:0x4864,0xE69690:0x4865,0xE6AF94:0x4866,
0xE6B38C:0x4867,0xE796B2:0x4868,0xE79AAE:0x4869,0xE7A291:0x486A,0xE7A798:0x486B,
0xE7B78B:0x486C,0xE7BDB7:0x486D,0xE882A5:0x486E,0xE8A2AB:0x486F,0xE8AAB9:0x4870,
0xE8B2BB:0x4871,0xE981BF:0x4872,0xE99D9E:0x4873,0xE9A39B:0x4874,0xE6A88B:0x4875,
0xE7B0B8:0x4876,0xE58299:0x4877,0xE5B0BE:0x4878,0xE5BEAE:0x4879,0xE69E87:0x487A,
0xE6AF98:0x487B,0xE790B5:0x487C,0xE79C89:0x487D,0xE7BE8E:0x487E,0xE9BCBB:0x4921,
0xE69F8A:0x4922,0xE7A897:0x4923,0xE58CB9:0x4924,0xE7968B:0x4925,0xE9ABAD:0x4926,
0xE5BDA6:0x4927,0xE8869D:0x4928,0xE88FB1:0x4929,0xE88298:0x492A,0xE5BCBC:0x492B,
0xE5BF85:0x492C,0xE795A2:0x492D,0xE7AD86:0x492E,0xE980BC:0x492F,0xE6A1A7:0x4930,
0xE5A7AB:0x4931,0xE5AA9B:0x4932,0xE7B490:0x4933,0xE799BE:0x4934,0xE8ACAC:0x4935,
0xE4BFB5:0x4936,0xE5BDAA:0x4937,0xE6A899:0x4938,0xE6B0B7:0x4939,0xE6BC82:0x493A,
0xE793A2:0x493B,0xE7A5A8:0x493C,0xE8A1A8:0x493D,0xE8A995:0x493E,0xE8B1B9:0x493F,
0xE5BB9F:0x4940,0xE68F8F:0x4941,0xE79785:0x4942,0xE7A792:0x4943,0xE88B97:0x4944,
0xE98CA8:0x4945,0xE98BB2:0x4946,0xE8929C:0x4947,0xE89BAD:0x4948,0xE9B0AD:0x4949,
0xE59381:0x494A,0xE5BDAC:0x494B,0xE6968C:0x494C,0xE6B59C:0x494D,0xE78095:0x494E,
0xE8B2A7:0x494F,0xE8B393:0x4950,0xE9A0BB:0x4951,0xE6958F:0x4952,0xE793B6:0x4953,
0xE4B88D:0x4954,0xE4BB98:0x4955,0xE59FA0:0x4956,0xE5A4AB:0x4957,0xE5A9A6:0x4958,
0xE5AF8C:0x4959,0xE586A8:0x495A,0xE5B883:0x495B,0xE5BA9C:0x495C,0xE68096:0x495D,
0xE689B6:0x495E,0xE695B7:0x495F,0xE696A7:0x4960,0xE699AE:0x4961,0xE6B5AE:0x4962,
0xE788B6:0x4963,0xE7ACA6:0x4964,0xE88590:0x4965,0xE8869A:0x4966,0xE88A99:0x4967,
0xE8AD9C:0x4968,0xE8B2A0:0x4969,0xE8B3A6:0x496A,0xE8B5B4:0x496B,0xE9989C:0x496C,
0xE99984:0x496D,0xE4BEAE:0x496E,0xE692AB:0x496F,0xE6ADA6:0x4970,0xE8889E:0x4971,
0xE891A1:0x4972,0xE895AA:0x4973,0xE983A8:0x4974,0xE5B081:0x4975,0xE6A593:0x4976,
0xE9A2A8:0x4977,0xE891BA:0x4978,0xE89597:0x4979,0xE4BC8F:0x497A,0xE589AF:0x497B,
0xE5BEA9:0x497C,0xE5B985:0x497D,0xE69C8D:0x497E,0xE7A68F:0x4A21,0xE885B9:0x4A22,
0xE8A487:0x4A23,0xE8A686:0x4A24,0xE6B7B5:0x4A25,0xE5BC97:0x4A26,0xE68995:0x4A27,
0xE6B2B8:0x4A28,0xE4BB8F:0x4A29,0xE789A9:0x4A2A,0xE9AE92:0x4A2B,0xE58886:0x4A2C,
0xE590BB:0x4A2D,0xE599B4:0x4A2E,0xE5A2B3:0x4A2F,0xE686A4:0x4A30,0xE689AE:0x4A31,
0xE7849A:0x4A32,0xE5A5AE:0x4A33,0xE7B289:0x4A34,0xE7B39E:0x4A35,0xE7B49B:0x4A36,
0xE99BB0:0x4A37,0xE69687:0x4A38,0xE8819E:0x4A39,0xE4B899:0x4A3A,0xE4BDB5:0x4A3B,
0xE585B5:0x4A3C,0xE5A180:0x4A3D,0xE5B9A3:0x4A3E,0xE5B9B3:0x4A3F,0xE5BC8A:0x4A40,
0xE69F84:0x4A41,0xE4B8A6:0x4A42,0xE894BD:0x4A43,0xE99689:0x4A44,0xE9999B:0x4A45,
0xE7B1B3:0x4A46,0xE9A081:0x4A47,0xE583BB:0x4A48,0xE5A381:0x4A49,0xE79996:0x4A4A,
0xE7A2A7:0x4A4B,0xE588A5:0x4A4C,0xE79EA5:0x4A4D,0xE89491:0x4A4E,0xE7AE86:0x4A4F,
0xE5818F:0x4A50,0xE5A489:0x4A51,0xE78987:0x4A52,0xE7AF87:0x4A53,0xE7B7A8:0x4A54,
0xE8BEBA:0x4A55,0xE8BF94:0x4A56,0xE9818D:0x4A57,0xE4BEBF:0x4A58,0xE58B89:0x4A59,
0xE5A8A9:0x4A5A,0xE5BC81:0x4A5B,0xE99EAD:0x4A5C,0xE4BF9D:0x4A5D,0xE88897:0x4A5E,
0xE98BAA:0x4A5F,0xE59C83:0x4A60,0xE68D95:0x4A61,0xE6ADA9:0x4A62,0xE794AB:0x4A63,
0xE8A39C:0x4A64,0xE8BC94:0x4A65,0xE7A982:0x4A66,0xE58B9F:0x4A67,0xE5A293:0x4A68,
0xE68595:0x4A69,0xE6888A:0x4A6A,0xE69AAE:0x4A6B,0xE6AF8D:0x4A6C,0xE7B0BF:0x4A6D,
0xE88FA9:0x4A6E,0xE580A3:0x4A6F,0xE4BFB8:0x4A70,0xE58C85:0x4A71,0xE59186:0x4A72,
0xE5A0B1:0x4A73,0xE5A589:0x4A74,0xE5AE9D:0x4A75,0xE5B3B0:0x4A76,0xE5B3AF:0x4A77,
0xE5B4A9:0x4A78,0xE5BA96:0x4A79,0xE68AB1:0x4A7A,0xE68DA7:0x4A7B,0xE694BE:0x4A7C,
0xE696B9:0x4A7D,0xE69C8B:0x4A7E,0xE6B395:0x4B21,0xE6B3A1:0x4B22,0xE783B9:0x4B23,
0xE7A0B2:0x4B24,0xE7B8AB:0x4B25,0xE8839E:0x4B26,0xE88AB3:0x4B27,0xE8908C:0x4B28,
0xE893AC:0x4B29,0xE89C82:0x4B2A,0xE8A492:0x4B2B,0xE8A8AA:0x4B2C,0xE8B18A:0x4B2D,
0xE982A6:0x4B2E,0xE98B92:0x4B2F,0xE9A3BD:0x4B30,0xE9B3B3:0x4B31,0xE9B5AC:0x4B32,
0xE4B98F:0x4B33,0xE4BAA1:0x4B34,0xE5828D:0x4B35,0xE58996:0x4B36,0xE59D8A:0x4B37,
0xE5A6A8:0x4B38,0xE5B8BD:0x4B39,0xE5BF98:0x4B3A,0xE5BF99:0x4B3B,0xE688BF:0x4B3C,
0xE69AB4:0x4B3D,0xE69C9B:0x4B3E,0xE69F90:0x4B3F,0xE6A392:0x4B40,0xE58692:0x4B41,
0xE7B4A1:0x4B42,0xE882AA:0x4B43,0xE886A8:0x4B44,0xE8AC80:0x4B45,0xE8B28C:0x4B46,
0xE8B2BF:0x4B47,0xE989BE:0x4B48,0xE998B2:0x4B49,0xE590A0:0x4B4A,0xE9A0AC:0x4B4B,
0xE58C97:0x4B4C,0xE58395:0x4B4D,0xE58D9C:0x4B4E,0xE5A2A8:0x4B4F,0xE692B2:0x4B50,
0xE69CB4:0x4B51,0xE789A7:0x4B52,0xE79DA6:0x4B53,0xE7A986:0x4B54,0xE987A6:0x4B55,
0xE58B83:0x4B56,0xE6B2A1:0x4B57,0xE6AE86:0x4B58,0xE5A080:0x4B59,0xE5B98C:0x4B5A,
0xE5A594:0x4B5B,0xE69CAC:0x4B5C,0xE7BFBB:0x4B5D,0xE587A1:0x4B5E,0xE79B86:0x4B5F,
0xE691A9:0x4B60,0xE7A3A8:0x4B61,0xE9AD94:0x4B62,0xE9BABB:0x4B63,0xE59F8B:0x4B64,
0xE5A6B9:0x4B65,0xE698A7:0x4B66,0xE69E9A:0x4B67,0xE6AF8E:0x4B68,0xE593A9:0x4B69,
0xE6A799:0x4B6A,0xE5B995:0x4B6B,0xE8869C:0x4B6C,0xE69E95:0x4B6D,0xE9AEAA:0x4B6E,
0xE69FBE:0x4B6F,0xE9B192:0x4B70,0xE6A19D:0x4B71,0xE4BAA6:0x4B72,0xE4BFA3:0x4B73,
0xE58F88:0x4B74,0xE68AB9:0x4B75,0xE69CAB:0x4B76,0xE6B2AB:0x4B77,0xE8BF84:0x4B78,
0xE4BEAD:0x4B79,0xE7B9AD:0x4B7A,0xE9BABF:0x4B7B,0xE4B887:0x4B7C,0xE685A2:0x4B7D,
0xE6BA80:0x4B7E,0xE6BCAB:0x4C21,0xE89493:0x4C22,0xE591B3:0x4C23,0xE69CAA:0x4C24,
0xE9AD85:0x4C25,0xE5B7B3:0x4C26,0xE7AE95:0x4C27,0xE5B2AC:0x4C28,0xE5AF86:0x4C29,
0xE89C9C:0x4C2A,0xE6B98A:0x4C2B,0xE89391:0x4C2C,0xE7A894:0x4C2D,0xE88488:0x4C2E,
0xE5A699:0x4C2F,0xE7B28D:0x4C30,0xE6B091:0x4C31,0xE79CA0:0x4C32,0xE58B99:0x4C33,
0xE5A4A2:0x4C34,0xE784A1:0x4C35,0xE7899F:0x4C36,0xE79F9B:0x4C37,0xE99CA7:0x4C38,
0xE9B5A1:0x4C39,0xE6A48B:0x4C3A,0xE5A9BF:0x4C3B,0xE5A898:0x4C3C,0xE586A5:0x4C3D,
0xE5908D:0x4C3E,0xE591BD:0x4C3F,0xE6988E:0x4C40,0xE79B9F:0x4C41,0xE8BFB7:0x4C42,
0xE98A98:0x4C43,0xE9B3B4:0x4C44,0xE5A7AA:0x4C45,0xE7899D:0x4C46,0xE6BB85:0x4C47,
0xE5858D:0x4C48,0xE6A389:0x4C49,0xE7B6BF:0x4C4A,0xE7B7AC:0x4C4B,0xE99DA2:0x4C4C,
0xE9BABA:0x4C4D,0xE691B8:0x4C4E,0xE6A8A1:0x4C4F,0xE88C82:0x4C50,0xE5A684:0x4C51,
0xE5AD9F:0x4C52,0xE6AF9B:0x4C53,0xE78C9B:0x4C54,0xE79BB2:0x4C55,0xE7B6B2:0x4C56,
0xE88097:0x4C57,0xE89299:0x4C58,0xE584B2:0x4C59,0xE69CA8:0x4C5A,0xE9BB99:0x4C5B,
0xE79BAE:0x4C5C,0xE69DA2:0x4C5D,0xE58BBF:0x4C5E,0xE9A485:0x4C5F,0xE5B0A4:0x4C60,
0xE688BB:0x4C61,0xE7B1BE:0x4C62,0xE8B2B0:0x4C63,0xE5958F:0x4C64,0xE682B6:0x4C65,
0xE7B48B:0x4C66,0xE99680:0x4C67,0xE58C81:0x4C68,0xE4B99F:0x4C69,0xE586B6:0x4C6A,
0xE5A49C:0x4C6B,0xE788BA:0x4C6C,0xE880B6:0x4C6D,0xE9878E:0x4C6E,0xE5BCA5:0x4C6F,
0xE79FA2:0x4C70,0xE58E84:0x4C71,0xE5BDB9:0x4C72,0xE7B484:0x4C73,0xE896AC:0x4C74,
0xE8A8B3:0x4C75,0xE8BA8D:0x4C76,0xE99D96:0x4C77,0xE69FB3:0x4C78,0xE896AE:0x4C79,
0xE99193:0x4C7A,0xE68489:0x4C7B,0xE68488:0x4C7C,0xE6B2B9:0x4C7D,0xE79992:0x4C7E,
0xE8ABAD:0x4D21,0xE8BCB8:0x4D22,0xE594AF:0x4D23,0xE4BD91:0x4D24,0xE584AA:0x4D25,
0xE58B87:0x4D26,0xE58F8B:0x4D27,0xE5AEA5:0x4D28,0xE5B9BD:0x4D29,0xE682A0:0x4D2A,
0xE68682:0x4D2B,0xE68F96:0x4D2C,0xE69C89:0x4D2D,0xE69F9A:0x4D2E,0xE6B9A7:0x4D2F,
0xE6B68C:0x4D30,0xE78CB6:0x4D31,0xE78CB7:0x4D32,0xE794B1:0x4D33,0xE7A590:0x4D34,
0xE8A395:0x4D35,0xE8AA98:0x4D36,0xE9818A:0x4D37,0xE98291:0x4D38,0xE983B5:0x4D39,
0xE99B84:0x4D3A,0xE89E8D:0x4D3B,0xE5A495:0x4D3C,0xE4BA88:0x4D3D,0xE4BD99:0x4D3E,
0xE4B88E:0x4D3F,0xE8AA89:0x4D40,0xE8BCBF:0x4D41,0xE9A090:0x4D42,0xE582AD:0x4D43,
0xE5B9BC:0x4D44,0xE5A696:0x4D45,0xE5AEB9:0x4D46,0xE5BAB8:0x4D47,0xE68F9A:0x4D48,
0xE68FBA:0x4D49,0xE69381:0x4D4A,0xE69B9C:0x4D4B,0xE6A58A:0x4D4C,0xE6A798:0x4D4D,
0xE6B48B:0x4D4E,0xE6BAB6:0x4D4F,0xE78694:0x4D50,0xE794A8:0x4D51,0xE7AAAF:0x4D52,
0xE7BE8A:0x4D53,0xE88080:0x4D54,0xE89189:0x4D55,0xE89389:0x4D56,0xE8A681:0x4D57,
0xE8ACA1:0x4D58,0xE8B88A:0x4D59,0xE981A5:0x4D5A,0xE999BD:0x4D5B,0xE9A48A:0x4D5C,
0xE685BE:0x4D5D,0xE68A91:0x4D5E,0xE6ACB2:0x4D5F,0xE6B283:0x4D60,0xE6B5B4:0x4D61,
0xE7BF8C:0x4D62,0xE7BFBC:0x4D63,0xE6B780:0x4D64,0xE7BE85:0x4D65,0xE89EBA:0x4D66,
0xE8A3B8:0x4D67,0xE69DA5:0x4D68,0xE88EB1:0x4D69,0xE9A0BC:0x4D6A,0xE99BB7:0x4D6B,
0xE6B49B:0x4D6C,0xE7B5A1:0x4D6D,0xE890BD:0x4D6E,0xE985AA:0x4D6F,0xE4B9B1:0x4D70,
0xE58DB5:0x4D71,0xE5B590:0x4D72,0xE6AC84:0x4D73,0xE6BFAB:0x4D74,0xE8978D:0x4D75,
0xE898AD:0x4D76,0xE8A6A7:0x4D77,0xE588A9:0x4D78,0xE5908F:0x4D79,0xE5B1A5:0x4D7A,
0xE69D8E:0x4D7B,0xE6A2A8:0x4D7C,0xE79086:0x4D7D,0xE79283:0x4D7E,0xE797A2:0x4E21,
0xE8A38F:0x4E22,0xE8A3A1:0x4E23,0xE9878C:0x4E24,0xE99BA2:0x4E25,0xE999B8:0x4E26,
0xE5BE8B:0x4E27,0xE78E87:0x4E28,0xE7AB8B:0x4E29,0xE8918E:0x4E2A,0xE68EA0:0x4E2B,
0xE795A5:0x4E2C,0xE58A89:0x4E2D,0xE6B581:0x4E2E,0xE6BA9C:0x4E2F,0xE79089:0x4E30,
0xE79599:0x4E31,0xE7A1AB:0x4E32,0xE7B292:0x4E33,0xE99A86:0x4E34,0xE7AB9C:0x4E35,
0xE9BE8D:0x4E36,0xE4BEB6:0x4E37,0xE685AE:0x4E38,0xE69785:0x4E39,0xE8999C:0x4E3A,
0xE4BA86:0x4E3B,0xE4BAAE:0x4E3C,0xE5839A:0x4E3D,0xE4B8A1:0x4E3E,0xE5878C:0x4E3F,
0xE5AFAE:0x4E40,0xE69699:0x4E41,0xE6A281:0x4E42,0xE6B6BC:0x4E43,0xE78C9F:0x4E44,
0xE79982:0x4E45,0xE79EAD:0x4E46,0xE7A89C:0x4E47,0xE7B3A7:0x4E48,0xE889AF:0x4E49,
0xE8AB92:0x4E4A,0xE981BC:0x4E4B,0xE9878F:0x4E4C,0xE999B5:0x4E4D,0xE9A098:0x4E4E,
0xE58A9B:0x4E4F,0xE7B791:0x4E50,0xE580AB:0x4E51,0xE58E98:0x4E52,0xE69E97:0x4E53,
0xE6B78B:0x4E54,0xE78790:0x4E55,0xE790B3:0x4E56,0xE887A8:0x4E57,0xE8BCAA:0x4E58,
0xE99AA3:0x4E59,0xE9B197:0x4E5A,0xE9BA9F:0x4E5B,0xE791A0:0x4E5C,0xE5A181:0x4E5D,
0xE6B699:0x4E5E,0xE7B4AF:0x4E5F,0xE9A19E:0x4E60,0xE4BBA4:0x4E61,0xE4BCB6:0x4E62,
0xE4BE8B:0x4E63,0xE586B7:0x4E64,0xE58AB1:0x4E65,0xE5B6BA:0x4E66,0xE6809C:0x4E67,
0xE78EB2:0x4E68,0xE7A4BC:0x4E69,0xE88B93:0x4E6A,0xE988B4:0x4E6B,0xE99AB7:0x4E6C,
0xE99BB6:0x4E6D,0xE99C8A:0x4E6E,0xE9BA97:0x4E6F,0xE9BDA2:0x4E70,0xE69AA6:0x4E71,
0xE6ADB4:0x4E72,0xE58897:0x4E73,0xE58AA3:0x4E74,0xE78388:0x4E75,0xE8A382:0x4E76,
0xE5BB89:0x4E77,0xE6818B:0x4E78,0xE68690:0x4E79,0xE6BCA3:0x4E7A,0xE78589:0x4E7B,
0xE7B0BE:0x4E7C,0xE7B7B4:0x4E7D,0xE881AF:0x4E7E,0xE893AE:0x4F21,0xE980A3:0x4F22,
0xE98CAC:0x4F23,0xE59182:0x4F24,0xE9ADAF:0x4F25,0xE6AB93:0x4F26,0xE78289:0x4F27,
0xE8B382:0x4F28,0xE8B7AF:0x4F29,0xE99CB2:0x4F2A,0xE58AB4:0x4F2B,0xE5A981:0x4F2C,
0xE5BB8A:0x4F2D,0xE5BC84:0x4F2E,0xE69C97:0x4F2F,0xE6A5BC:0x4F30,0xE6A694:0x4F31,
0xE6B5AA:0x4F32,0xE6BC8F:0x4F33,0xE789A2:0x4F34,0xE78BBC:0x4F35,0xE7AFAD:0x4F36,
0xE88081:0x4F37,0xE881BE:0x4F38,0xE89D8B:0x4F39,0xE9838E:0x4F3A,0xE585AD:0x4F3B,
0xE9BA93:0x4F3C,0xE7A684:0x4F3D,0xE8828B:0x4F3E,0xE98CB2:0x4F3F,0xE8AB96:0x4F40,
0xE580AD:0x4F41,0xE5928C:0x4F42,0xE8A9B1:0x4F43,0xE6ADAA:0x4F44,0xE8B384:0x4F45,
0xE88487:0x4F46,0xE68391:0x4F47,0xE69EA0:0x4F48,0xE9B7B2:0x4F49,0xE4BA99:0x4F4A,
0xE4BA98:0x4F4B,0xE9B090:0x4F4C,0xE8A9AB:0x4F4D,0xE89781:0x4F4E,0xE895A8:0x4F4F,
0xE6A480:0x4F50,0xE6B9BE:0x4F51,0xE7A297:0x4F52,0xE88595:0x4F53,0xE5BC8C:0x5021,
0xE4B890:0x5022,0xE4B895:0x5023,0xE4B8AA:0x5024,0xE4B8B1:0x5025,0xE4B8B6:0x5026,
0xE4B8BC:0x5027,0xE4B8BF:0x5028,0xE4B982:0x5029,0xE4B996:0x502A,0xE4B998:0x502B,
0xE4BA82:0x502C,0xE4BA85:0x502D,0xE8B1AB:0x502E,0xE4BA8A:0x502F,0xE88892:0x5030,
0xE5BC8D:0x5031,0xE4BA8E:0x5032,0xE4BA9E:0x5033,0xE4BA9F:0x5034,0xE4BAA0:0x5035,
0xE4BAA2:0x5036,0xE4BAB0:0x5037,0xE4BAB3:0x5038,0xE4BAB6:0x5039,0xE4BB8E:0x503A,
0xE4BB8D:0x503B,0xE4BB84:0x503C,0xE4BB86:0x503D,0xE4BB82:0x503E,0xE4BB97:0x503F,
0xE4BB9E:0x5040,0xE4BBAD:0x5041,0xE4BB9F:0x5042,0xE4BBB7:0x5043,0xE4BC89:0x5044,
0xE4BD9A:0x5045,0xE4BCB0:0x5046,0xE4BD9B:0x5047,0xE4BD9D:0x5048,0xE4BD97:0x5049,
0xE4BD87:0x504A,0xE4BDB6:0x504B,0xE4BE88:0x504C,0xE4BE8F:0x504D,0xE4BE98:0x504E,
0xE4BDBB:0x504F,0xE4BDA9:0x5050,0xE4BDB0:0x5051,0xE4BE91:0x5052,0xE4BDAF:0x5053,
0xE4BE86:0x5054,0xE4BE96:0x5055,0xE58498:0x5056,0xE4BF94:0x5057,0xE4BF9F:0x5058,
0xE4BF8E:0x5059,0xE4BF98:0x505A,0xE4BF9B:0x505B,0xE4BF91:0x505C,0xE4BF9A:0x505D,
0xE4BF90:0x505E,0xE4BFA4:0x505F,0xE4BFA5:0x5060,0xE5809A:0x5061,0xE580A8:0x5062,
0xE58094:0x5063,0xE580AA:0x5064,0xE580A5:0x5065,0xE58085:0x5066,0xE4BC9C:0x5067,
0xE4BFB6:0x5068,0xE580A1:0x5069,0xE580A9:0x506A,0xE580AC:0x506B,0xE4BFBE:0x506C,
0xE4BFAF:0x506D,0xE58091:0x506E,0xE58086:0x506F,0xE58183:0x5070,0xE58187:0x5071,
0xE69C83:0x5072,0xE58195:0x5073,0xE58190:0x5074,0xE58188:0x5075,0xE5819A:0x5076,
0xE58196:0x5077,0xE581AC:0x5078,0xE581B8:0x5079,0xE58280:0x507A,0xE5829A:0x507B,
0xE58285:0x507C,0xE582B4:0x507D,0xE582B2:0x507E,0xE58389:0x5121,0xE5838A:0x5122,
0xE582B3:0x5123,0xE58382:0x5124,0xE58396:0x5125,0xE5839E:0x5126,0xE583A5:0x5127,
0xE583AD:0x5128,0xE583A3:0x5129,0xE583AE:0x512A,0xE583B9:0x512B,0xE583B5:0x512C,
0xE58489:0x512D,0xE58481:0x512E,0xE58482:0x512F,0xE58496:0x5130,0xE58495:0x5131,
0xE58494:0x5132,0xE5849A:0x5133,0xE584A1:0x5134,0xE584BA:0x5135,0xE584B7:0x5136,
0xE584BC:0x5137,0xE584BB:0x5138,0xE584BF:0x5139,0xE58580:0x513A,0xE58592:0x513B,
0xE5858C:0x513C,0xE58594:0x513D,0xE585A2:0x513E,0xE7ABB8:0x513F,0xE585A9:0x5140,
0xE585AA:0x5141,0xE585AE:0x5142,0xE58680:0x5143,0xE58682:0x5144,0xE59B98:0x5145,
0xE5868C:0x5146,0xE58689:0x5147,0xE5868F:0x5148,0xE58691:0x5149,0xE58693:0x514A,
0xE58695:0x514B,0xE58696:0x514C,0xE586A4:0x514D,0xE586A6:0x514E,0xE586A2:0x514F,
0xE586A9:0x5150,0xE586AA:0x5151,0xE586AB:0x5152,0xE586B3:0x5153,0xE586B1:0x5154,
0xE586B2:0x5155,0xE586B0:0x5156,0xE586B5:0x5157,0xE586BD:0x5158,0xE58785:0x5159,
0xE58789:0x515A,0xE5879B:0x515B,0xE587A0:0x515C,0xE89995:0x515D,0xE587A9:0x515E,
0xE587AD:0x515F,0xE587B0:0x5160,0xE587B5:0x5161,0xE587BE:0x5162,0xE58884:0x5163,
0xE5888B:0x5164,0xE58894:0x5165,0xE5888E:0x5166,0xE588A7:0x5167,0xE588AA:0x5168,
0xE588AE:0x5169,0xE588B3:0x516A,0xE588B9:0x516B,0xE5898F:0x516C,0xE58984:0x516D,
0xE5898B:0x516E,0xE5898C:0x516F,0xE5899E:0x5170,0xE58994:0x5171,0xE589AA:0x5172,
0xE589B4:0x5173,0xE589A9:0x5174,0xE589B3:0x5175,0xE589BF:0x5176,0xE589BD:0x5177,
0xE58A8D:0x5178,0xE58A94:0x5179,0xE58A92:0x517A,0xE589B1:0x517B,0xE58A88:0x517C,
0xE58A91:0x517D,0xE8BEA8:0x517E,0xE8BEA7:0x5221,0xE58AAC:0x5222,0xE58AAD:0x5223,
0xE58ABC:0x5224,0xE58AB5:0x5225,0xE58B81:0x5226,0xE58B8D:0x5227,0xE58B97:0x5228,
0xE58B9E:0x5229,0xE58BA3:0x522A,0xE58BA6:0x522B,0xE9A3AD:0x522C,0xE58BA0:0x522D,
0xE58BB3:0x522E,0xE58BB5:0x522F,0xE58BB8:0x5230,0xE58BB9:0x5231,0xE58C86:0x5232,
0xE58C88:0x5233,0xE794B8:0x5234,0xE58C8D:0x5235,0xE58C90:0x5236,0xE58C8F:0x5237,
0xE58C95:0x5238,0xE58C9A:0x5239,0xE58CA3:0x523A,0xE58CAF:0x523B,0xE58CB1:0x523C,
0xE58CB3:0x523D,0xE58CB8:0x523E,0xE58D80:0x523F,0xE58D86:0x5240,0xE58D85:0x5241,
0xE4B897:0x5242,0xE58D89:0x5243,0xE58D8D:0x5244,0xE58796:0x5245,0xE58D9E:0x5246,
0xE58DA9:0x5247,0xE58DAE:0x5248,0xE5A498:0x5249,0xE58DBB:0x524A,0xE58DB7:0x524B,
0xE58E82:0x524C,0xE58E96:0x524D,0xE58EA0:0x524E,0xE58EA6:0x524F,0xE58EA5:0x5250,
0xE58EAE:0x5251,0xE58EB0:0x5252,0xE58EB6:0x5253,0xE58F83:0x5254,0xE7B092:0x5255,
0xE99B99:0x5256,0xE58F9F:0x5257,0xE69BBC:0x5258,0xE787AE:0x5259,0xE58FAE:0x525A,
0xE58FA8:0x525B,0xE58FAD:0x525C,0xE58FBA:0x525D,0xE59081:0x525E,0xE590BD:0x525F,
0xE59180:0x5260,0xE590AC:0x5261,0xE590AD:0x5262,0xE590BC:0x5263,0xE590AE:0x5264,
0xE590B6:0x5265,0xE590A9:0x5266,0xE5909D:0x5267,0xE5918E:0x5268,0xE5928F:0x5269,
0xE591B5:0x526A,0xE5928E:0x526B,0xE5919F:0x526C,0xE591B1:0x526D,0xE591B7:0x526E,
0xE591B0:0x526F,0xE59292:0x5270,0xE591BB:0x5271,0xE59280:0x5272,0xE591B6:0x5273,
0xE59284:0x5274,0xE59290:0x5275,0xE59286:0x5276,0xE59387:0x5277,0xE592A2:0x5278,
0xE592B8:0x5279,0xE592A5:0x527A,0xE592AC:0x527B,0xE59384:0x527C,0xE59388:0x527D,
0xE592A8:0x527E,0xE592AB:0x5321,0xE59382:0x5322,0xE592A4:0x5323,0xE592BE:0x5324,
0xE592BC:0x5325,0xE59398:0x5326,0xE593A5:0x5327,0xE593A6:0x5328,0xE5948F:0x5329,
0xE59494:0x532A,0xE593BD:0x532B,0xE593AE:0x532C,0xE593AD:0x532D,0xE593BA:0x532E,
0xE593A2:0x532F,0xE594B9:0x5330,0xE59580:0x5331,0xE595A3:0x5332,0xE5958C:0x5333,
0xE594AE:0x5334,0xE5959C:0x5335,0xE59585:0x5336,0xE59596:0x5337,0xE59597:0x5338,
0xE594B8:0x5339,0xE594B3:0x533A,0xE5959D:0x533B,0xE59699:0x533C,0xE59680:0x533D,
0xE592AF:0x533E,0xE5968A:0x533F,0xE5969F:0x5340,0xE595BB:0x5341,0xE595BE:0x5342,
0xE59698:0x5343,0xE5969E:0x5344,0xE596AE:0x5345,0xE595BC:0x5346,0xE59683:0x5347,
0xE596A9:0x5348,0xE59687:0x5349,0xE596A8:0x534A,0xE5979A:0x534B,0xE59785:0x534C,
0xE5979F:0x534D,0xE59784:0x534E,0xE5979C:0x534F,0xE597A4:0x5350,0xE59794:0x5351,
0xE59894:0x5352,0xE597B7:0x5353,0xE59896:0x5354,0xE597BE:0x5355,0xE597BD:0x5356,
0xE5989B:0x5357,0xE597B9:0x5358,0xE5998E:0x5359,0xE59990:0x535A,0xE7879F:0x535B,
0xE598B4:0x535C,0xE598B6:0x535D,0xE598B2:0x535E,0xE598B8:0x535F,0xE599AB:0x5360,
0xE599A4:0x5361,0xE598AF:0x5362,0xE599AC:0x5363,0xE599AA:0x5364,0xE59A86:0x5365,
0xE59A80:0x5366,0xE59A8A:0x5367,0xE59AA0:0x5368,0xE59A94:0x5369,0xE59A8F:0x536A,
0xE59AA5:0x536B,0xE59AAE:0x536C,0xE59AB6:0x536D,0xE59AB4:0x536E,0xE59B82:0x536F,
0xE59ABC:0x5370,0xE59B81:0x5371,0xE59B83:0x5372,0xE59B80:0x5373,0xE59B88:0x5374,
0xE59B8E:0x5375,0xE59B91:0x5376,0xE59B93:0x5377,0xE59B97:0x5378,0xE59BAE:0x5379,
0xE59BB9:0x537A,0xE59C80:0x537B,0xE59BBF:0x537C,0xE59C84:0x537D,0xE59C89:0x537E,
0xE59C88:0x5421,0xE59C8B:0x5422,0xE59C8D:0x5423,0xE59C93:0x5424,0xE59C98:0x5425,
0xE59C96:0x5426,0xE59787:0x5427,0xE59C9C:0x5428,0xE59CA6:0x5429,0xE59CB7:0x542A,
0xE59CB8:0x542B,0xE59D8E:0x542C,0xE59CBB:0x542D,0xE59D80:0x542E,0xE59D8F:0x542F,
0xE59DA9:0x5430,0xE59F80:0x5431,0xE59E88:0x5432,0xE59DA1:0x5433,0xE59DBF:0x5434,
0xE59E89:0x5435,0xE59E93:0x5436,0xE59EA0:0x5437,0xE59EB3:0x5438,0xE59EA4:0x5439,
0xE59EAA:0x543A,0xE59EB0:0x543B,0xE59F83:0x543C,0xE59F86:0x543D,0xE59F94:0x543E,
0xE59F92:0x543F,0xE59F93:0x5440,0xE5A08A:0x5441,0xE59F96:0x5442,0xE59FA3:0x5443,
0xE5A08B:0x5444,0xE5A099:0x5445,0xE5A09D:0x5446,0xE5A1B2:0x5447,0xE5A0A1:0x5448,
0xE5A1A2:0x5449,0xE5A18B:0x544A,0xE5A1B0:0x544B,0xE6AF80:0x544C,0xE5A192:0x544D,
0xE5A0BD:0x544E,0xE5A1B9:0x544F,0xE5A285:0x5450,0xE5A2B9:0x5451,0xE5A29F:0x5452,
0xE5A2AB:0x5453,0xE5A2BA:0x5454,0xE5A39E:0x5455,0xE5A2BB:0x5456,0xE5A2B8:0x5457,
0xE5A2AE:0x5458,0xE5A385:0x5459,0xE5A393:0x545A,0xE5A391:0x545B,0xE5A397:0x545C,
0xE5A399:0x545D,0xE5A398:0x545E,0xE5A3A5:0x545F,0xE5A39C:0x5460,0xE5A3A4:0x5461,
0xE5A39F:0x5462,0xE5A3AF:0x5463,0xE5A3BA:0x5464,0xE5A3B9:0x5465,0xE5A3BB:0x5466,
0xE5A3BC:0x5467,0xE5A3BD:0x5468,0xE5A482:0x5469,0xE5A48A:0x546A,0xE5A490:0x546B,
0xE5A49B:0x546C,0xE6A2A6:0x546D,0xE5A4A5:0x546E,0xE5A4AC:0x546F,0xE5A4AD:0x5470,
0xE5A4B2:0x5471,0xE5A4B8:0x5472,0xE5A4BE:0x5473,0xE7AB92:0x5474,0xE5A595:0x5475,
0xE5A590:0x5476,0xE5A58E:0x5477,0xE5A59A:0x5478,0xE5A598:0x5479,0xE5A5A2:0x547A,
0xE5A5A0:0x547B,0xE5A5A7:0x547C,0xE5A5AC:0x547D,0xE5A5A9:0x547E,0xE5A5B8:0x5521,
0xE5A681:0x5522,0xE5A69D:0x5523,0xE4BD9E:0x5524,0xE4BEAB:0x5525,0xE5A6A3:0x5526,
0xE5A6B2:0x5527,0xE5A786:0x5528,0xE5A7A8:0x5529,0xE5A79C:0x552A,0xE5A68D:0x552B,
0xE5A799:0x552C,0xE5A79A:0x552D,0xE5A8A5:0x552E,0xE5A89F:0x552F,0xE5A891:0x5530,
0xE5A89C:0x5531,0xE5A889:0x5532,0xE5A89A:0x5533,0xE5A980:0x5534,0xE5A9AC:0x5535,
0xE5A989:0x5536,0xE5A8B5:0x5537,0xE5A8B6:0x5538,0xE5A9A2:0x5539,0xE5A9AA:0x553A,
0xE5AA9A:0x553B,0xE5AABC:0x553C,0xE5AABE:0x553D,0xE5AB8B:0x553E,0xE5AB82:0x553F,
0xE5AABD:0x5540,0xE5ABA3:0x5541,0xE5AB97:0x5542,0xE5ABA6:0x5543,0xE5ABA9:0x5544,
0xE5AB96:0x5545,0xE5ABBA:0x5546,0xE5ABBB:0x5547,0xE5AC8C:0x5548,0xE5AC8B:0x5549,
0xE5AC96:0x554A,0xE5ACB2:0x554B,0xE5AB90:0x554C,0xE5ACAA:0x554D,0xE5ACB6:0x554E,
0xE5ACBE:0x554F,0xE5AD83:0x5550,0xE5AD85:0x5551,0xE5AD80:0x5552,0xE5AD91:0x5553,
0xE5AD95:0x5554,0xE5AD9A:0x5555,0xE5AD9B:0x5556,0xE5ADA5:0x5557,0xE5ADA9:0x5558,
0xE5ADB0:0x5559,0xE5ADB3:0x555A,0xE5ADB5:0x555B,0xE5ADB8:0x555C,0xE69688:0x555D,
0xE5ADBA:0x555E,0xE5AE80:0x555F,0xE5AE83:0x5560,0xE5AEA6:0x5561,0xE5AEB8:0x5562,
0xE5AF83:0x5563,0xE5AF87:0x5564,0xE5AF89:0x5565,0xE5AF94:0x5566,0xE5AF90:0x5567,
0xE5AFA4:0x5568,0xE5AFA6:0x5569,0xE5AFA2:0x556A,0xE5AF9E:0x556B,0xE5AFA5:0x556C,
0xE5AFAB:0x556D,0xE5AFB0:0x556E,0xE5AFB6:0x556F,0xE5AFB3:0x5570,0xE5B085:0x5571,
0xE5B087:0x5572,0xE5B088:0x5573,0xE5B08D:0x5574,0xE5B093:0x5575,0xE5B0A0:0x5576,
0xE5B0A2:0x5577,0xE5B0A8:0x5578,0xE5B0B8:0x5579,0xE5B0B9:0x557A,0xE5B181:0x557B,
0xE5B186:0x557C,0xE5B18E:0x557D,0xE5B193:0x557E,0xE5B190:0x5621,0xE5B18F:0x5622,
0xE5ADB1:0x5623,0xE5B1AC:0x5624,0xE5B1AE:0x5625,0xE4B9A2:0x5626,0xE5B1B6:0x5627,
0xE5B1B9:0x5628,0xE5B28C:0x5629,0xE5B291:0x562A,0xE5B294:0x562B,0xE5A69B:0x562C,
0xE5B2AB:0x562D,0xE5B2BB:0x562E,0xE5B2B6:0x562F,0xE5B2BC:0x5630,0xE5B2B7:0x5631,
0xE5B385:0x5632,0xE5B2BE:0x5633,0xE5B387:0x5634,0xE5B399:0x5635,0xE5B3A9:0x5636,
0xE5B3BD:0x5637,0xE5B3BA:0x5638,0xE5B3AD:0x5639,0xE5B68C:0x563A,0xE5B3AA:0x563B,
0xE5B48B:0x563C,0xE5B495:0x563D,0xE5B497:0x563E,0xE5B59C:0x563F,0xE5B49F:0x5640,
0xE5B49B:0x5641,0xE5B491:0x5642,0xE5B494:0x5643,0xE5B4A2:0x5644,0xE5B49A:0x5645,
0xE5B499:0x5646,0xE5B498:0x5647,0xE5B58C:0x5648,0xE5B592:0x5649,0xE5B58E:0x564A,
0xE5B58B:0x564B,0xE5B5AC:0x564C,0xE5B5B3:0x564D,0xE5B5B6:0x564E,0xE5B687:0x564F,
0xE5B684:0x5650,0xE5B682:0x5651,0xE5B6A2:0x5652,0xE5B69D:0x5653,0xE5B6AC:0x5654,
0xE5B6AE:0x5655,0xE5B6BD:0x5656,0xE5B690:0x5657,0xE5B6B7:0x5658,0xE5B6BC:0x5659,
0xE5B789:0x565A,0xE5B78D:0x565B,0xE5B793:0x565C,0xE5B792:0x565D,0xE5B796:0x565E,
0xE5B79B:0x565F,0xE5B7AB:0x5660,0xE5B7B2:0x5661,0xE5B7B5:0x5662,0xE5B88B:0x5663,
0xE5B89A:0x5664,0xE5B899:0x5665,0xE5B891:0x5666,0xE5B89B:0x5667,0xE5B8B6:0x5668,
0xE5B8B7:0x5669,0xE5B984:0x566A,0xE5B983:0x566B,0xE5B980:0x566C,0xE5B98E:0x566D,
0xE5B997:0x566E,0xE5B994:0x566F,0xE5B99F:0x5670,0xE5B9A2:0x5671,0xE5B9A4:0x5672,
0xE5B987:0x5673,0xE5B9B5:0x5674,0xE5B9B6:0x5675,0xE5B9BA:0x5676,0xE9BABC:0x5677,
0xE5B9BF:0x5678,0xE5BAA0:0x5679,0xE5BB81:0x567A,0xE5BB82:0x567B,0xE5BB88:0x567C,
0xE5BB90:0x567D,0xE5BB8F:0x567E,0xE5BB96:0x5721,0xE5BBA3:0x5722,0xE5BB9D:0x5723,
0xE5BB9A:0x5724,0xE5BB9B:0x5725,0xE5BBA2:0x5726,0xE5BBA1:0x5727,0xE5BBA8:0x5728,
0xE5BBA9:0x5729,0xE5BBAC:0x572A,0xE5BBB1:0x572B,0xE5BBB3:0x572C,0xE5BBB0:0x572D,
0xE5BBB4:0x572E,0xE5BBB8:0x572F,0xE5BBBE:0x5730,0xE5BC83:0x5731,0xE5BC89:0x5732,
0xE5BD9D:0x5733,0xE5BD9C:0x5734,0xE5BC8B:0x5735,0xE5BC91:0x5736,0xE5BC96:0x5737,
0xE5BCA9:0x5738,0xE5BCAD:0x5739,0xE5BCB8:0x573A,0xE5BD81:0x573B,0xE5BD88:0x573C,
0xE5BD8C:0x573D,0xE5BD8E:0x573E,0xE5BCAF:0x573F,0xE5BD91:0x5740,0xE5BD96:0x5741,
0xE5BD97:0x5742,0xE5BD99:0x5743,0xE5BDA1:0x5744,0xE5BDAD:0x5745,0xE5BDB3:0x5746,
0xE5BDB7:0x5747,0xE5BE83:0x5748,0xE5BE82:0x5749,0xE5BDBF:0x574A,0xE5BE8A:0x574B,
0xE5BE88:0x574C,0xE5BE91:0x574D,0xE5BE87:0x574E,0xE5BE9E:0x574F,0xE5BE99:0x5750,
0xE5BE98:0x5751,0xE5BEA0:0x5752,0xE5BEA8:0x5753,0xE5BEAD:0x5754,0xE5BEBC:0x5755,
0xE5BF96:0x5756,0xE5BFBB:0x5757,0xE5BFA4:0x5758,0xE5BFB8:0x5759,0xE5BFB1:0x575A,
0xE5BF9D:0x575B,0xE682B3:0x575C,0xE5BFBF:0x575D,0xE680A1:0x575E,0xE681A0:0x575F,
0xE68099:0x5760,0xE68090:0x5761,0xE680A9:0x5762,0xE6808E:0x5763,0xE680B1:0x5764,
0xE6809B:0x5765,0xE68095:0x5766,0xE680AB:0x5767,0xE680A6:0x5768,0xE6808F:0x5769,
0xE680BA:0x576A,0xE6819A:0x576B,0xE68181:0x576C,0xE681AA:0x576D,0xE681B7:0x576E,
0xE6819F:0x576F,0xE6818A:0x5770,0xE68186:0x5771,0xE6818D:0x5772,0xE681A3:0x5773,
0xE68183:0x5774,0xE681A4:0x5775,0xE68182:0x5776,0xE681AC:0x5777,0xE681AB:0x5778,
0xE68199:0x5779,0xE68281:0x577A,0xE6828D:0x577B,0xE683A7:0x577C,0xE68283:0x577D,
0xE6829A:0x577E,0xE68284:0x5821,0xE6829B:0x5822,0xE68296:0x5823,0xE68297:0x5824,
0xE68292:0x5825,0xE682A7:0x5826,0xE6828B:0x5827,0xE683A1:0x5828,0xE682B8:0x5829,
0xE683A0:0x582A,0xE68393:0x582B,0xE682B4:0x582C,0xE5BFB0:0x582D,0xE682BD:0x582E,
0xE68386:0x582F,0xE682B5:0x5830,0xE68398:0x5831,0xE6858D:0x5832,0xE68495:0x5833,
0xE68486:0x5834,0xE683B6:0x5835,0xE683B7:0x5836,0xE68480:0x5837,0xE683B4:0x5838,
0xE683BA:0x5839,0xE68483:0x583A,0xE684A1:0x583B,0xE683BB:0x583C,0xE683B1:0x583D,
0xE6848D:0x583E,0xE6848E:0x583F,0xE68587:0x5840,0xE684BE:0x5841,0xE684A8:0x5842,
0xE684A7:0x5843,0xE6858A:0x5844,0xE684BF:0x5845,0xE684BC:0x5846,0xE684AC:0x5847,
0xE684B4:0x5848,0xE684BD:0x5849,0xE68582:0x584A,0xE68584:0x584B,0xE685B3:0x584C,
0xE685B7:0x584D,0xE68598:0x584E,0xE68599:0x584F,0xE6859A:0x5850,0xE685AB:0x5851,
0xE685B4:0x5852,0xE685AF:0x5853,0xE685A5:0x5854,0xE685B1:0x5855,0xE6859F:0x5856,
0xE6859D:0x5857,0xE68593:0x5858,0xE685B5:0x5859,0xE68699:0x585A,0xE68696:0x585B,
0xE68687:0x585C,0xE686AC:0x585D,0xE68694:0x585E,0xE6869A:0x585F,0xE6868A:0x5860,
0xE68691:0x5861,0xE686AB:0x5862,0xE686AE:0x5863,0xE6878C:0x5864,0xE6878A:0x5865,
0xE68789:0x5866,0xE687B7:0x5867,0xE68788:0x5868,0xE68783:0x5869,0xE68786:0x586A,
0xE686BA:0x586B,0xE6878B:0x586C,0xE7BDB9:0x586D,0xE6878D:0x586E,0xE687A6:0x586F,
0xE687A3:0x5870,0xE687B6:0x5871,0xE687BA:0x5872,0xE687B4:0x5873,0xE687BF:0x5874,
0xE687BD:0x5875,0xE687BC:0x5876,0xE687BE:0x5877,0xE68880:0x5878,0xE68888:0x5879,
0xE68889:0x587A,0xE6888D:0x587B,0xE6888C:0x587C,0xE68894:0x587D,0xE6889B:0x587E,
0xE6889E:0x5921,0xE688A1:0x5922,0xE688AA:0x5923,0xE688AE:0x5924,0xE688B0:0x5925,
0xE688B2:0x5926,0xE688B3:0x5927,0xE68981:0x5928,0xE6898E:0x5929,0xE6899E:0x592A,
0xE689A3:0x592B,0xE6899B:0x592C,0xE689A0:0x592D,0xE689A8:0x592E,0xE689BC:0x592F,
0xE68A82:0x5930,0xE68A89:0x5931,0xE689BE:0x5932,0xE68A92:0x5933,0xE68A93:0x5934,
0xE68A96:0x5935,0xE68B94:0x5936,0xE68A83:0x5937,0xE68A94:0x5938,0xE68B97:0x5939,
0xE68B91:0x593A,0xE68ABB:0x593B,0xE68B8F:0x593C,0xE68BBF:0x593D,0xE68B86:0x593E,
0xE69394:0x593F,0xE68B88:0x5940,0xE68B9C:0x5941,0xE68B8C:0x5942,0xE68B8A:0x5943,
0xE68B82:0x5944,0xE68B87:0x5945,0xE68A9B:0x5946,0xE68B89:0x5947,0xE68C8C:0x5948,
0xE68BAE:0x5949,0xE68BB1:0x594A,0xE68CA7:0x594B,0xE68C82:0x594C,0xE68C88:0x594D,
0xE68BAF:0x594E,0xE68BB5:0x594F,0xE68D90:0x5950,0xE68CBE:0x5951,0xE68D8D:0x5952,
0xE6909C:0x5953,0xE68D8F:0x5954,0xE68E96:0x5955,0xE68E8E:0x5956,0xE68E80:0x5957,
0xE68EAB:0x5958,0xE68DB6:0x5959,0xE68EA3:0x595A,0xE68E8F:0x595B,0xE68E89:0x595C,
0xE68E9F:0x595D,0xE68EB5:0x595E,0xE68DAB:0x595F,0xE68DA9:0x5960,0xE68EBE:0x5961,
0xE68FA9:0x5962,0xE68F80:0x5963,0xE68F86:0x5964,0xE68FA3:0x5965,0xE68F89:0x5966,
0xE68F92:0x5967,0xE68FB6:0x5968,0xE68F84:0x5969,0xE69096:0x596A,0xE690B4:0x596B,
0xE69086:0x596C,0xE69093:0x596D,0xE690A6:0x596E,0xE690B6:0x596F,0xE6949D:0x5970,
0xE69097:0x5971,0xE690A8:0x5972,0xE6908F:0x5973,0xE691A7:0x5974,0xE691AF:0x5975,
0xE691B6:0x5976,0xE6918E:0x5977,0xE694AA:0x5978,0xE69295:0x5979,0xE69293:0x597A,
0xE692A5:0x597B,0xE692A9:0x597C,0xE69288:0x597D,0xE692BC:0x597E,0xE6939A:0x5A21,
0xE69392:0x5A22,0xE69385:0x5A23,0xE69387:0x5A24,0xE692BB:0x5A25,0xE69398:0x5A26,
0xE69382:0x5A27,0xE693B1:0x5A28,0xE693A7:0x5A29,0xE88889:0x5A2A,0xE693A0:0x5A2B,
0xE693A1:0x5A2C,0xE68AAC:0x5A2D,0xE693A3:0x5A2E,0xE693AF:0x5A2F,0xE694AC:0x5A30,
0xE693B6:0x5A31,0xE693B4:0x5A32,0xE693B2:0x5A33,0xE693BA:0x5A34,0xE69480:0x5A35,
0xE693BD:0x5A36,0xE69498:0x5A37,0xE6949C:0x5A38,0xE69485:0x5A39,0xE694A4:0x5A3A,
0xE694A3:0x5A3B,0xE694AB:0x5A3C,0xE694B4:0x5A3D,0xE694B5:0x5A3E,0xE694B7:0x5A3F,
0xE694B6:0x5A40,0xE694B8:0x5A41,0xE7958B:0x5A42,0xE69588:0x5A43,0xE69596:0x5A44,
0xE69595:0x5A45,0xE6958D:0x5A46,0xE69598:0x5A47,0xE6959E:0x5A48,0xE6959D:0x5A49,
0xE695B2:0x5A4A,0xE695B8:0x5A4B,0xE69682:0x5A4C,0xE69683:0x5A4D,0xE8AE8A:0x5A4E,
0xE6969B:0x5A4F,0xE6969F:0x5A50,0xE696AB:0x5A51,0xE696B7:0x5A52,0xE69783:0x5A53,
0xE69786:0x5A54,0xE69781:0x5A55,0xE69784:0x5A56,0xE6978C:0x5A57,0xE69792:0x5A58,
0xE6979B:0x5A59,0xE69799:0x5A5A,0xE697A0:0x5A5B,0xE697A1:0x5A5C,0xE697B1:0x5A5D,
0xE69DB2:0x5A5E,0xE6988A:0x5A5F,0xE69883:0x5A60,0xE697BB:0x5A61,0xE69DB3:0x5A62,
0xE698B5:0x5A63,0xE698B6:0x5A64,0xE698B4:0x5A65,0xE6989C:0x5A66,0xE6998F:0x5A67,
0xE69984:0x5A68,0xE69989:0x5A69,0xE69981:0x5A6A,0xE6999E:0x5A6B,0xE6999D:0x5A6C,
0xE699A4:0x5A6D,0xE699A7:0x5A6E,0xE699A8:0x5A6F,0xE6999F:0x5A70,0xE699A2:0x5A71,
0xE699B0:0x5A72,0xE69A83:0x5A73,0xE69A88:0x5A74,0xE69A8E:0x5A75,0xE69A89:0x5A76,
0xE69A84:0x5A77,0xE69A98:0x5A78,0xE69A9D:0x5A79,0xE69B81:0x5A7A,0xE69AB9:0x5A7B,
0xE69B89:0x5A7C,0xE69ABE:0x5A7D,0xE69ABC:0x5A7E,0xE69B84:0x5B21,0xE69AB8:0x5B22,
0xE69B96:0x5B23,0xE69B9A:0x5B24,0xE69BA0:0x5B25,0xE698BF:0x5B26,0xE69BA6:0x5B27,
0xE69BA9:0x5B28,0xE69BB0:0x5B29,0xE69BB5:0x5B2A,0xE69BB7:0x5B2B,0xE69C8F:0x5B2C,
0xE69C96:0x5B2D,0xE69C9E:0x5B2E,0xE69CA6:0x5B2F,0xE69CA7:0x5B30,0xE99CB8:0x5B31,
0xE69CAE:0x5B32,0xE69CBF:0x5B33,0xE69CB6:0x5B34,0xE69D81:0x5B35,0xE69CB8:0x5B36,
0xE69CB7:0x5B37,0xE69D86:0x5B38,0xE69D9E:0x5B39,0xE69DA0:0x5B3A,0xE69D99:0x5B3B,
0xE69DA3:0x5B3C,0xE69DA4:0x5B3D,0xE69E89:0x5B3E,0xE69DB0:0x5B3F,0xE69EA9:0x5B40,
0xE69DBC:0x5B41,0xE69DAA:0x5B42,0xE69E8C:0x5B43,0xE69E8B:0x5B44,0xE69EA6:0x5B45,
0xE69EA1:0x5B46,0xE69E85:0x5B47,0xE69EB7:0x5B48,0xE69FAF:0x5B49,0xE69EB4:0x5B4A,
0xE69FAC:0x5B4B,0xE69EB3:0x5B4C,0xE69FA9:0x5B4D,0xE69EB8:0x5B4E,0xE69FA4:0x5B4F,
0xE69F9E:0x5B50,0xE69F9D:0x5B51,0xE69FA2:0x5B52,0xE69FAE:0x5B53,0xE69EB9:0x5B54,
0xE69F8E:0x5B55,0xE69F86:0x5B56,0xE69FA7:0x5B57,0xE6AA9C:0x5B58,0xE6A09E:0x5B59,
0xE6A186:0x5B5A,0xE6A0A9:0x5B5B,0xE6A180:0x5B5C,0xE6A18D:0x5B5D,0xE6A0B2:0x5B5E,
0xE6A18E:0x5B5F,0xE6A2B3:0x5B60,0xE6A0AB:0x5B61,0xE6A199:0x5B62,0xE6A1A3:0x5B63,
0xE6A1B7:0x5B64,0xE6A1BF:0x5B65,0xE6A29F:0x5B66,0xE6A28F:0x5B67,0xE6A2AD:0x5B68,
0xE6A294:0x5B69,0xE6A29D:0x5B6A,0xE6A29B:0x5B6B,0xE6A283:0x5B6C,0xE6AAAE:0x5B6D,
0xE6A2B9:0x5B6E,0xE6A1B4:0x5B6F,0xE6A2B5:0x5B70,0xE6A2A0:0x5B71,0xE6A2BA:0x5B72,
0xE6A48F:0x5B73,0xE6A28D:0x5B74,0xE6A1BE:0x5B75,0xE6A481:0x5B76,0xE6A38A:0x5B77,
0xE6A488:0x5B78,0xE6A398:0x5B79,0xE6A4A2:0x5B7A,0xE6A4A6:0x5B7B,0xE6A3A1:0x5B7C,
0xE6A48C:0x5B7D,0xE6A38D:0x5B7E,0xE6A394:0x5C21,0xE6A3A7:0x5C22,0xE6A395:0x5C23,
0xE6A4B6:0x5C24,0xE6A492:0x5C25,0xE6A484:0x5C26,0xE6A397:0x5C27,0xE6A3A3:0x5C28,
0xE6A4A5:0x5C29,0xE6A3B9:0x5C2A,0xE6A3A0:0x5C2B,0xE6A3AF:0x5C2C,0xE6A4A8:0x5C2D,
0xE6A4AA:0x5C2E,0xE6A49A:0x5C2F,0xE6A4A3:0x5C30,0xE6A4A1:0x5C31,0xE6A386:0x5C32,
0xE6A5B9:0x5C33,0xE6A5B7:0x5C34,0xE6A59C:0x5C35,0xE6A5B8:0x5C36,0xE6A5AB:0x5C37,
0xE6A594:0x5C38,0xE6A5BE:0x5C39,0xE6A5AE:0x5C3A,0xE6A4B9:0x5C3B,0xE6A5B4:0x5C3C,
0xE6A4BD:0x5C3D,0xE6A599:0x5C3E,0xE6A4B0:0x5C3F,0xE6A5A1:0x5C40,0xE6A59E:0x5C41,
0xE6A59D:0x5C42,0xE6A681:0x5C43,0xE6A5AA:0x5C44,0xE6A6B2:0x5C45,0xE6A6AE:0x5C46,
0xE6A790:0x5C47,0xE6A6BF:0x5C48,0xE6A781:0x5C49,0xE6A793:0x5C4A,0xE6A6BE:0x5C4B,
0xE6A78E:0x5C4C,0xE5AFA8:0x5C4D,0xE6A78A:0x5C4E,0xE6A79D:0x5C4F,0xE6A6BB:0x5C50,
0xE6A783:0x5C51,0xE6A6A7:0x5C52,0xE6A8AE:0x5C53,0xE6A691:0x5C54,0xE6A6A0:0x5C55,
0xE6A69C:0x5C56,0xE6A695:0x5C57,0xE6A6B4:0x5C58,0xE6A79E:0x5C59,0xE6A7A8:0x5C5A,
0xE6A882:0x5C5B,0xE6A89B:0x5C5C,0xE6A7BF:0x5C5D,0xE6AC8A:0x5C5E,0xE6A7B9:0x5C5F,
0xE6A7B2:0x5C60,0xE6A7A7:0x5C61,0xE6A885:0x5C62,0xE6A6B1:0x5C63,0xE6A89E:0x5C64,
0xE6A7AD:0x5C65,0xE6A894:0x5C66,0xE6A7AB:0x5C67,0xE6A88A:0x5C68,0xE6A892:0x5C69,
0xE6AB81:0x5C6A,0xE6A8A3:0x5C6B,0xE6A893:0x5C6C,0xE6A984:0x5C6D,0xE6A88C:0x5C6E,
0xE6A9B2:0x5C6F,0xE6A8B6:0x5C70,0xE6A9B8:0x5C71,0xE6A987:0x5C72,0xE6A9A2:0x5C73,
0xE6A999:0x5C74,0xE6A9A6:0x5C75,0xE6A988:0x5C76,0xE6A8B8:0x5C77,0xE6A8A2:0x5C78,
0xE6AA90:0x5C79,0xE6AA8D:0x5C7A,0xE6AAA0:0x5C7B,0xE6AA84:0x5C7C,0xE6AAA2:0x5C7D,
0xE6AAA3:0x5C7E,0xE6AA97:0x5D21,0xE89897:0x5D22,0xE6AABB:0x5D23,0xE6AB83:0x5D24,
0xE6AB82:0x5D25,0xE6AAB8:0x5D26,0xE6AAB3:0x5D27,0xE6AAAC:0x5D28,0xE6AB9E:0x5D29,
0xE6AB91:0x5D2A,0xE6AB9F:0x5D2B,0xE6AAAA:0x5D2C,0xE6AB9A:0x5D2D,0xE6ABAA:0x5D2E,
0xE6ABBB:0x5D2F,0xE6AC85:0x5D30,0xE89896:0x5D31,0xE6ABBA:0x5D32,0xE6AC92:0x5D33,
0xE6AC96:0x5D34,0xE9ACB1:0x5D35,0xE6AC9F:0x5D36,0xE6ACB8:0x5D37,0xE6ACB7:0x5D38,
0xE79B9C:0x5D39,0xE6ACB9:0x5D3A,0xE9A3AE:0x5D3B,0xE6AD87:0x5D3C,0xE6AD83:0x5D3D,
0xE6AD89:0x5D3E,0xE6AD90:0x5D3F,0xE6AD99:0x5D40,0xE6AD94:0x5D41,0xE6AD9B:0x5D42,
0xE6AD9F:0x5D43,0xE6ADA1:0x5D44,0xE6ADB8:0x5D45,0xE6ADB9:0x5D46,0xE6ADBF:0x5D47,
0xE6AE80:0x5D48,0xE6AE84:0x5D49,0xE6AE83:0x5D4A,0xE6AE8D:0x5D4B,0xE6AE98:0x5D4C,
0xE6AE95:0x5D4D,0xE6AE9E:0x5D4E,0xE6AEA4:0x5D4F,0xE6AEAA:0x5D50,0xE6AEAB:0x5D51,
0xE6AEAF:0x5D52,0xE6AEB2:0x5D53,0xE6AEB1:0x5D54,0xE6AEB3:0x5D55,0xE6AEB7:0x5D56,
0xE6AEBC:0x5D57,0xE6AF86:0x5D58,0xE6AF8B:0x5D59,0xE6AF93:0x5D5A,0xE6AF9F:0x5D5B,
0xE6AFAC:0x5D5C,0xE6AFAB:0x5D5D,0xE6AFB3:0x5D5E,0xE6AFAF:0x5D5F,0xE9BABE:0x5D60,
0xE6B088:0x5D61,0xE6B093:0x5D62,0xE6B094:0x5D63,0xE6B09B:0x5D64,0xE6B0A4:0x5D65,
0xE6B0A3:0x5D66,0xE6B19E:0x5D67,0xE6B195:0x5D68,0xE6B1A2:0x5D69,0xE6B1AA:0x5D6A,
0xE6B282:0x5D6B,0xE6B28D:0x5D6C,0xE6B29A:0x5D6D,0xE6B281:0x5D6E,0xE6B29B:0x5D6F,
0xE6B1BE:0x5D70,0xE6B1A8:0x5D71,0xE6B1B3:0x5D72,0xE6B292:0x5D73,0xE6B290:0x5D74,
0xE6B384:0x5D75,0xE6B3B1:0x5D76,0xE6B393:0x5D77,0xE6B2BD:0x5D78,0xE6B397:0x5D79,
0xE6B385:0x5D7A,0xE6B39D:0x5D7B,0xE6B2AE:0x5D7C,0xE6B2B1:0x5D7D,0xE6B2BE:0x5D7E,
0xE6B2BA:0x5E21,0xE6B39B:0x5E22,0xE6B3AF:0x5E23,0xE6B399:0x5E24,0xE6B3AA:0x5E25,
0xE6B49F:0x5E26,0xE8A18D:0x5E27,0xE6B4B6:0x5E28,0xE6B4AB:0x5E29,0xE6B4BD:0x5E2A,
0xE6B4B8:0x5E2B,0xE6B499:0x5E2C,0xE6B4B5:0x5E2D,0xE6B4B3:0x5E2E,0xE6B492:0x5E2F,
0xE6B48C:0x5E30,0xE6B5A3:0x5E31,0xE6B693:0x5E32,0xE6B5A4:0x5E33,0xE6B59A:0x5E34,
0xE6B5B9:0x5E35,0xE6B599:0x5E36,0xE6B68E:0x5E37,0xE6B695:0x5E38,0xE6BFA4:0x5E39,
0xE6B685:0x5E3A,0xE6B7B9:0x5E3B,0xE6B895:0x5E3C,0xE6B88A:0x5E3D,0xE6B6B5:0x5E3E,
0xE6B787:0x5E3F,0xE6B7A6:0x5E40,0xE6B6B8:0x5E41,0xE6B786:0x5E42,0xE6B7AC:0x5E43,
0xE6B79E:0x5E44,0xE6B78C:0x5E45,0xE6B7A8:0x5E46,0xE6B792:0x5E47,0xE6B785:0x5E48,
0xE6B7BA:0x5E49,0xE6B799:0x5E4A,0xE6B7A4:0x5E4B,0xE6B795:0x5E4C,0xE6B7AA:0x5E4D,
0xE6B7AE:0x5E4E,0xE6B8AD:0x5E4F,0xE6B9AE:0x5E50,0xE6B8AE:0x5E51,0xE6B899:0x5E52,
0xE6B9B2:0x5E53,0xE6B99F:0x5E54,0xE6B8BE:0x5E55,0xE6B8A3:0x5E56,0xE6B9AB:0x5E57,
0xE6B8AB:0x5E58,0xE6B9B6:0x5E59,0xE6B98D:0x5E5A,0xE6B89F:0x5E5B,0xE6B983:0x5E5C,
0xE6B8BA:0x5E5D,0xE6B98E:0x5E5E,0xE6B8A4:0x5E5F,0xE6BBBF:0x5E60,0xE6B89D:0x5E61,
0xE6B8B8:0x5E62,0xE6BA82:0x5E63,0xE6BAAA:0x5E64,0xE6BA98:0x5E65,0xE6BB89:0x5E66,
0xE6BAB7:0x5E67,0xE6BB93:0x5E68,0xE6BABD:0x5E69,0xE6BAAF:0x5E6A,0xE6BB84:0x5E6B,
0xE6BAB2:0x5E6C,0xE6BB94:0x5E6D,0xE6BB95:0x5E6E,0xE6BA8F:0x5E6F,0xE6BAA5:0x5E70,
0xE6BB82:0x5E71,0xE6BA9F:0x5E72,0xE6BD81:0x5E73,0xE6BC91:0x5E74,0xE7818C:0x5E75,
0xE6BBAC:0x5E76,0xE6BBB8:0x5E77,0xE6BBBE:0x5E78,0xE6BCBF:0x5E79,0xE6BBB2:0x5E7A,
0xE6BCB1:0x5E7B,0xE6BBAF:0x5E7C,0xE6BCB2:0x5E7D,0xE6BB8C:0x5E7E,0xE6BCBE:0x5F21,
0xE6BC93:0x5F22,0xE6BBB7:0x5F23,0xE6BE86:0x5F24,0xE6BDBA:0x5F25,0xE6BDB8:0x5F26,
0xE6BE81:0x5F27,0xE6BE80:0x5F28,0xE6BDAF:0x5F29,0xE6BD9B:0x5F2A,0xE6BFB3:0x5F2B,
0xE6BDAD:0x5F2C,0xE6BE82:0x5F2D,0xE6BDBC:0x5F2E,0xE6BD98:0x5F2F,0xE6BE8E:0x5F30,
0xE6BE91:0x5F31,0xE6BF82:0x5F32,0xE6BDA6:0x5F33,0xE6BEB3:0x5F34,0xE6BEA3:0x5F35,
0xE6BEA1:0x5F36,0xE6BEA4:0x5F37,0xE6BEB9:0x5F38,0xE6BF86:0x5F39,0xE6BEAA:0x5F3A,
0xE6BF9F:0x5F3B,0xE6BF95:0x5F3C,0xE6BFAC:0x5F3D,0xE6BF94:0x5F3E,0xE6BF98:0x5F3F,
0xE6BFB1:0x5F40,0xE6BFAE:0x5F41,0xE6BF9B:0x5F42,0xE78089:0x5F43,0xE7808B:0x5F44,
0xE6BFBA:0x5F45,0xE78091:0x5F46,0xE78081:0x5F47,0xE7808F:0x5F48,0xE6BFBE:0x5F49,
0xE7809B:0x5F4A,0xE7809A:0x5F4B,0xE6BDB4:0x5F4C,0xE7809D:0x5F4D,0xE78098:0x5F4E,
0xE7809F:0x5F4F,0xE780B0:0x5F50,0xE780BE:0x5F51,0xE780B2:0x5F52,0xE78191:0x5F53,
0xE781A3:0x5F54,0xE78299:0x5F55,0xE78292:0x5F56,0xE782AF:0x5F57,0xE783B1:0x5F58,
0xE782AC:0x5F59,0xE782B8:0x5F5A,0xE782B3:0x5F5B,0xE782AE:0x5F5C,0xE7839F:0x5F5D,
0xE7838B:0x5F5E,0xE7839D:0x5F5F,0xE78399:0x5F60,0xE78489:0x5F61,0xE783BD:0x5F62,
0xE7849C:0x5F63,0xE78499:0x5F64,0xE785A5:0x5F65,0xE78595:0x5F66,0xE78688:0x5F67,
0xE785A6:0x5F68,0xE785A2:0x5F69,0xE7858C:0x5F6A,0xE78596:0x5F6B,0xE785AC:0x5F6C,
0xE7868F:0x5F6D,0xE787BB:0x5F6E,0xE78684:0x5F6F,0xE78695:0x5F70,0xE786A8:0x5F71,
0xE786AC:0x5F72,0xE78797:0x5F73,0xE786B9:0x5F74,0xE786BE:0x5F75,0xE78792:0x5F76,
0xE78789:0x5F77,0xE78794:0x5F78,0xE7878E:0x5F79,0xE787A0:0x5F7A,0xE787AC:0x5F7B,
0xE787A7:0x5F7C,0xE787B5:0x5F7D,0xE787BC:0x5F7E,0xE787B9:0x6021,0xE787BF:0x6022,
0xE7888D:0x6023,0xE78890:0x6024,0xE7889B:0x6025,0xE788A8:0x6026,0xE788AD:0x6027,
0xE788AC:0x6028,0xE788B0:0x6029,0xE788B2:0x602A,0xE788BB:0x602B,0xE788BC:0x602C,
0xE788BF:0x602D,0xE78980:0x602E,0xE78986:0x602F,0xE7898B:0x6030,0xE78998:0x6031,
0xE789B4:0x6032,0xE789BE:0x6033,0xE78A82:0x6034,0xE78A81:0x6035,0xE78A87:0x6036,
0xE78A92:0x6037,0xE78A96:0x6038,0xE78AA2:0x6039,0xE78AA7:0x603A,0xE78AB9:0x603B,
0xE78AB2:0x603C,0xE78B83:0x603D,0xE78B86:0x603E,0xE78B84:0x603F,0xE78B8E:0x6040,
0xE78B92:0x6041,0xE78BA2:0x6042,0xE78BA0:0x6043,0xE78BA1:0x6044,0xE78BB9:0x6045,
0xE78BB7:0x6046,0xE5808F:0x6047,0xE78C97:0x6048,0xE78C8A:0x6049,0xE78C9C:0x604A,
0xE78C96:0x604B,0xE78C9D:0x604C,0xE78CB4:0x604D,0xE78CAF:0x604E,0xE78CA9:0x604F,
0xE78CA5:0x6050,0xE78CBE:0x6051,0xE78D8E:0x6052,0xE78D8F:0x6053,0xE9BB98:0x6054,
0xE78D97:0x6055,0xE78DAA:0x6056,0xE78DA8:0x6057,0xE78DB0:0x6058,0xE78DB8:0x6059,
0xE78DB5:0x605A,0xE78DBB:0x605B,0xE78DBA:0x605C,0xE78F88:0x605D,0xE78EB3:0x605E,
0xE78F8E:0x605F,0xE78EBB:0x6060,0xE78F80:0x6061,0xE78FA5:0x6062,0xE78FAE:0x6063,
0xE78F9E:0x6064,0xE792A2:0x6065,0xE79085:0x6066,0xE791AF:0x6067,0xE790A5:0x6068,
0xE78FB8:0x6069,0xE790B2:0x606A,0xE790BA:0x606B,0xE79195:0x606C,0xE790BF:0x606D,
0xE7919F:0x606E,0xE79199:0x606F,0xE79181:0x6070,0xE7919C:0x6071,0xE791A9:0x6072,
0xE791B0:0x6073,0xE791A3:0x6074,0xE791AA:0x6075,0xE791B6:0x6076,0xE791BE:0x6077,
0xE7928B:0x6078,0xE7929E:0x6079,0xE792A7:0x607A,0xE7938A:0x607B,0xE7938F:0x607C,
0xE79394:0x607D,0xE78FB1:0x607E,0xE793A0:0x6121,0xE793A3:0x6122,0xE793A7:0x6123,
0xE793A9:0x6124,0xE793AE:0x6125,0xE793B2:0x6126,0xE793B0:0x6127,0xE793B1:0x6128,
0xE793B8:0x6129,0xE793B7:0x612A,0xE79484:0x612B,0xE79483:0x612C,0xE79485:0x612D,
0xE7948C:0x612E,0xE7948E:0x612F,0xE7948D:0x6130,0xE79495:0x6131,0xE79493:0x6132,
0xE7949E:0x6133,0xE794A6:0x6134,0xE794AC:0x6135,0xE794BC:0x6136,0xE79584:0x6137,
0xE7958D:0x6138,0xE7958A:0x6139,0xE79589:0x613A,0xE7959B:0x613B,0xE79586:0x613C,
0xE7959A:0x613D,0xE795A9:0x613E,0xE795A4:0x613F,0xE795A7:0x6140,0xE795AB:0x6141,
0xE795AD:0x6142,0xE795B8:0x6143,0xE795B6:0x6144,0xE79686:0x6145,0xE79687:0x6146,
0xE795B4:0x6147,0xE7968A:0x6148,0xE79689:0x6149,0xE79682:0x614A,0xE79694:0x614B,
0xE7969A:0x614C,0xE7969D:0x614D,0xE796A5:0x614E,0xE796A3:0x614F,0xE79782:0x6150,
0xE796B3:0x6151,0xE79783:0x6152,0xE796B5:0x6153,0xE796BD:0x6154,0xE796B8:0x6155,
0xE796BC:0x6156,0xE796B1:0x6157,0xE7978D:0x6158,0xE7978A:0x6159,0xE79792:0x615A,
0xE79799:0x615B,0xE797A3:0x615C,0xE7979E:0x615D,0xE797BE:0x615E,0xE797BF:0x615F,
0xE797BC:0x6160,0xE79881:0x6161,0xE797B0:0x6162,0xE797BA:0x6163,0xE797B2:0x6164,
0xE797B3:0x6165,0xE7988B:0x6166,0xE7988D:0x6167,0xE79889:0x6168,0xE7989F:0x6169,
0xE798A7:0x616A,0xE798A0:0x616B,0xE798A1:0x616C,0xE798A2:0x616D,0xE798A4:0x616E,
0xE798B4:0x616F,0xE798B0:0x6170,0xE798BB:0x6171,0xE79987:0x6172,0xE79988:0x6173,
0xE79986:0x6174,0xE7999C:0x6175,0xE79998:0x6176,0xE799A1:0x6177,0xE799A2:0x6178,
0xE799A8:0x6179,0xE799A9:0x617A,0xE799AA:0x617B,0xE799A7:0x617C,0xE799AC:0x617D,
0xE799B0:0x617E,0xE799B2:0x6221,0xE799B6:0x6222,0xE799B8:0x6223,0xE799BC:0x6224,
0xE79A80:0x6225,0xE79A83:0x6226,0xE79A88:0x6227,0xE79A8B:0x6228,0xE79A8E:0x6229,
0xE79A96:0x622A,0xE79A93:0x622B,0xE79A99:0x622C,0xE79A9A:0x622D,0xE79AB0:0x622E,
0xE79AB4:0x622F,0xE79AB8:0x6230,0xE79AB9:0x6231,0xE79ABA:0x6232,0xE79B82:0x6233,
0xE79B8D:0x6234,0xE79B96:0x6235,0xE79B92:0x6236,0xE79B9E:0x6237,0xE79BA1:0x6238,
0xE79BA5:0x6239,0xE79BA7:0x623A,0xE79BAA:0x623B,0xE898AF:0x623C,0xE79BBB:0x623D,
0xE79C88:0x623E,0xE79C87:0x623F,0xE79C84:0x6240,0xE79CA9:0x6241,0xE79CA4:0x6242,
0xE79C9E:0x6243,0xE79CA5:0x6244,0xE79CA6:0x6245,0xE79C9B:0x6246,0xE79CB7:0x6247,
0xE79CB8:0x6248,0xE79D87:0x6249,0xE79D9A:0x624A,0xE79DA8:0x624B,0xE79DAB:0x624C,
0xE79D9B:0x624D,0xE79DA5:0x624E,0xE79DBF:0x624F,0xE79DBE:0x6250,0xE79DB9:0x6251,
0xE79E8E:0x6252,0xE79E8B:0x6253,0xE79E91:0x6254,0xE79EA0:0x6255,0xE79E9E:0x6256,
0xE79EB0:0x6257,0xE79EB6:0x6258,0xE79EB9:0x6259,0xE79EBF:0x625A,0xE79EBC:0x625B,
0xE79EBD:0x625C,0xE79EBB:0x625D,0xE79F87:0x625E,0xE79F8D:0x625F,0xE79F97:0x6260,
0xE79F9A:0x6261,0xE79F9C:0x6262,0xE79FA3:0x6263,0xE79FAE:0x6264,0xE79FBC:0x6265,
0xE7A08C:0x6266,0xE7A092:0x6267,0xE7A4A6:0x6268,0xE7A0A0:0x6269,0xE7A4AA:0x626A,
0xE7A185:0x626B,0xE7A28E:0x626C,0xE7A1B4:0x626D,0xE7A286:0x626E,0xE7A1BC:0x626F,
0xE7A29A:0x6270,0xE7A28C:0x6271,0xE7A2A3:0x6272,0xE7A2B5:0x6273,0xE7A2AA:0x6274,
0xE7A2AF:0x6275,0xE7A391:0x6276,0xE7A386:0x6277,0xE7A38B:0x6278,0xE7A394:0x6279,
0xE7A2BE:0x627A,0xE7A2BC:0x627B,0xE7A385:0x627C,0xE7A38A:0x627D,0xE7A3AC:0x627E,
0xE7A3A7:0x6321,0xE7A39A:0x6322,0xE7A3BD:0x6323,0xE7A3B4:0x6324,0xE7A487:0x6325,
0xE7A492:0x6326,0xE7A491:0x6327,0xE7A499:0x6328,0xE7A4AC:0x6329,0xE7A4AB:0x632A,
0xE7A580:0x632B,0xE7A5A0:0x632C,0xE7A597:0x632D,0xE7A59F:0x632E,0xE7A59A:0x632F,
0xE7A595:0x6330,0xE7A593:0x6331,0xE7A5BA:0x6332,0xE7A5BF:0x6333,0xE7A68A:0x6334,
0xE7A69D:0x6335,0xE7A6A7:0x6336,0xE9BD8B:0x6337,0xE7A6AA:0x6338,0xE7A6AE:0x6339,
0xE7A6B3:0x633A,0xE7A6B9:0x633B,0xE7A6BA:0x633C,0xE7A789:0x633D,0xE7A795:0x633E,
0xE7A7A7:0x633F,0xE7A7AC:0x6340,0xE7A7A1:0x6341,0xE7A7A3:0x6342,0xE7A888:0x6343,
0xE7A88D:0x6344,0xE7A898:0x6345,0xE7A899:0x6346,0xE7A8A0:0x6347,0xE7A89F:0x6348,
0xE7A680:0x6349,0xE7A8B1:0x634A,0xE7A8BB:0x634B,0xE7A8BE:0x634C,0xE7A8B7:0x634D,
0xE7A983:0x634E,0xE7A997:0x634F,0xE7A989:0x6350,0xE7A9A1:0x6351,0xE7A9A2:0x6352,
0xE7A9A9:0x6353,0xE9BE9D:0x6354,0xE7A9B0:0x6355,0xE7A9B9:0x6356,0xE7A9BD:0x6357,
0xE7AA88:0x6358,0xE7AA97:0x6359,0xE7AA95:0x635A,0xE7AA98:0x635B,0xE7AA96:0x635C,
0xE7AAA9:0x635D,0xE7AB88:0x635E,0xE7AAB0:0x635F,0xE7AAB6:0x6360,0xE7AB85:0x6361,
0xE7AB84:0x6362,0xE7AABF:0x6363,0xE98283:0x6364,0xE7AB87:0x6365,0xE7AB8A:0x6366,
0xE7AB8D:0x6367,0xE7AB8F:0x6368,0xE7AB95:0x6369,0xE7AB93:0x636A,0xE7AB99:0x636B,
0xE7AB9A:0x636C,0xE7AB9D:0x636D,0xE7ABA1:0x636E,0xE7ABA2:0x636F,0xE7ABA6:0x6370,
0xE7ABAD:0x6371,0xE7ABB0:0x6372,0xE7AC82:0x6373,0xE7AC8F:0x6374,0xE7AC8A:0x6375,
0xE7AC86:0x6376,0xE7ACB3:0x6377,0xE7AC98:0x6378,0xE7AC99:0x6379,0xE7AC9E:0x637A,
0xE7ACB5:0x637B,0xE7ACA8:0x637C,0xE7ACB6:0x637D,0xE7AD90:0x637E,0xE7ADBA:0x6421,
0xE7AC84:0x6422,0xE7AD8D:0x6423,0xE7AC8B:0x6424,0xE7AD8C:0x6425,0xE7AD85:0x6426,
0xE7ADB5:0x6427,0xE7ADA5:0x6428,0xE7ADB4:0x6429,0xE7ADA7:0x642A,0xE7ADB0:0x642B,
0xE7ADB1:0x642C,0xE7ADAC:0x642D,0xE7ADAE:0x642E,0xE7AE9D:0x642F,0xE7AE98:0x6430,
0xE7AE9F:0x6431,0xE7AE8D:0x6432,0xE7AE9C:0x6433,0xE7AE9A:0x6434,0xE7AE8B:0x6435,
0xE7AE92:0x6436,0xE7AE8F:0x6437,0xE7AD9D:0x6438,0xE7AE99:0x6439,0xE7AF8B:0x643A,
0xE7AF81:0x643B,0xE7AF8C:0x643C,0xE7AF8F:0x643D,0xE7AEB4:0x643E,0xE7AF86:0x643F,
0xE7AF9D:0x6440,0xE7AFA9:0x6441,0xE7B091:0x6442,0xE7B094:0x6443,0xE7AFA6:0x6444,
0xE7AFA5:0x6445,0xE7B1A0:0x6446,0xE7B080:0x6447,0xE7B087:0x6448,0xE7B093:0x6449,
0xE7AFB3:0x644A,0xE7AFB7:0x644B,0xE7B097:0x644C,0xE7B08D:0x644D,0xE7AFB6:0x644E,
0xE7B0A3:0x644F,0xE7B0A7:0x6450,0xE7B0AA:0x6451,0xE7B09F:0x6452,0xE7B0B7:0x6453,
0xE7B0AB:0x6454,0xE7B0BD:0x6455,0xE7B18C:0x6456,0xE7B183:0x6457,0xE7B194:0x6458,
0xE7B18F:0x6459,0xE7B180:0x645A,0xE7B190:0x645B,0xE7B198:0x645C,0xE7B19F:0x645D,
0xE7B1A4:0x645E,0xE7B196:0x645F,0xE7B1A5:0x6460,0xE7B1AC:0x6461,0xE7B1B5:0x6462,
0xE7B283:0x6463,0xE7B290:0x6464,0xE7B2A4:0x6465,0xE7B2AD:0x6466,0xE7B2A2:0x6467,
0xE7B2AB:0x6468,0xE7B2A1:0x6469,0xE7B2A8:0x646A,0xE7B2B3:0x646B,0xE7B2B2:0x646C,
0xE7B2B1:0x646D,0xE7B2AE:0x646E,0xE7B2B9:0x646F,0xE7B2BD:0x6470,0xE7B380:0x6471,
0xE7B385:0x6472,0xE7B382:0x6473,0xE7B398:0x6474,0xE7B392:0x6475,0xE7B39C:0x6476,
0xE7B3A2:0x6477,0xE9ACBB:0x6478,0xE7B3AF:0x6479,0xE7B3B2:0x647A,0xE7B3B4:0x647B,
0xE7B3B6:0x647C,0xE7B3BA:0x647D,0xE7B486:0x647E,0xE7B482:0x6521,0xE7B49C:0x6522,
0xE7B495:0x6523,0xE7B48A:0x6524,0xE7B585:0x6525,0xE7B58B:0x6526,0xE7B4AE:0x6527,
0xE7B4B2:0x6528,0xE7B4BF:0x6529,0xE7B4B5:0x652A,0xE7B586:0x652B,0xE7B5B3:0x652C,
0xE7B596:0x652D,0xE7B58E:0x652E,0xE7B5B2:0x652F,0xE7B5A8:0x6530,0xE7B5AE:0x6531,
0xE7B58F:0x6532,0xE7B5A3:0x6533,0xE7B693:0x6534,0xE7B689:0x6535,0xE7B59B:0x6536,
0xE7B68F:0x6537,0xE7B5BD:0x6538,0xE7B69B:0x6539,0xE7B6BA:0x653A,0xE7B6AE:0x653B,
0xE7B6A3:0x653C,0xE7B6B5:0x653D,0xE7B787:0x653E,0xE7B6BD:0x653F,0xE7B6AB:0x6540,
0xE7B8BD:0x6541,0xE7B6A2:0x6542,0xE7B6AF:0x6543,0xE7B79C:0x6544,0xE7B6B8:0x6545,
0xE7B69F:0x6546,0xE7B6B0:0x6547,0xE7B798:0x6548,0xE7B79D:0x6549,0xE7B7A4:0x654A,
0xE7B79E:0x654B,0xE7B7BB:0x654C,0xE7B7B2:0x654D,0xE7B7A1:0x654E,0xE7B885:0x654F,
0xE7B88A:0x6550,0xE7B8A3:0x6551,0xE7B8A1:0x6552,0xE7B892:0x6553,0xE7B8B1:0x6554,
0xE7B89F:0x6555,0xE7B889:0x6556,0xE7B88B:0x6557,0xE7B8A2:0x6558,0xE7B986:0x6559,
0xE7B9A6:0x655A,0xE7B8BB:0x655B,0xE7B8B5:0x655C,0xE7B8B9:0x655D,0xE7B983:0x655E,
0xE7B8B7:0x655F,0xE7B8B2:0x6560,0xE7B8BA:0x6561,0xE7B9A7:0x6562,0xE7B99D:0x6563,
0xE7B996:0x6564,0xE7B99E:0x6565,0xE7B999:0x6566,0xE7B99A:0x6567,0xE7B9B9:0x6568,
0xE7B9AA:0x6569,0xE7B9A9:0x656A,0xE7B9BC:0x656B,0xE7B9BB:0x656C,0xE7BA83:0x656D,
0xE7B795:0x656E,0xE7B9BD:0x656F,0xE8BEAE:0x6570,0xE7B9BF:0x6571,0xE7BA88:0x6572,
0xE7BA89:0x6573,0xE7BA8C:0x6574,0xE7BA92:0x6575,0xE7BA90:0x6576,0xE7BA93:0x6577,
0xE7BA94:0x6578,0xE7BA96:0x6579,0xE7BA8E:0x657A,0xE7BA9B:0x657B,0xE7BA9C:0x657C,
0xE7BCB8:0x657D,0xE7BCBA:0x657E,0xE7BD85:0x6621,0xE7BD8C:0x6622,0xE7BD8D:0x6623,
0xE7BD8E:0x6624,0xE7BD90:0x6625,0xE7BD91:0x6626,0xE7BD95:0x6627,0xE7BD94:0x6628,
0xE7BD98:0x6629,0xE7BD9F:0x662A,0xE7BDA0:0x662B,0xE7BDA8:0x662C,0xE7BDA9:0x662D,
0xE7BDA7:0x662E,0xE7BDB8:0x662F,0xE7BE82:0x6630,0xE7BE86:0x6631,0xE7BE83:0x6632,
0xE7BE88:0x6633,0xE7BE87:0x6634,0xE7BE8C:0x6635,0xE7BE94:0x6636,0xE7BE9E:0x6637,
0xE7BE9D:0x6638,0xE7BE9A:0x6639,0xE7BEA3:0x663A,0xE7BEAF:0x663B,0xE7BEB2:0x663C,
0xE7BEB9:0x663D,0xE7BEAE:0x663E,0xE7BEB6:0x663F,0xE7BEB8:0x6640,0xE8ADB1:0x6641,
0xE7BF85:0x6642,0xE7BF86:0x6643,0xE7BF8A:0x6644,0xE7BF95:0x6645,0xE7BF94:0x6646,
0xE7BFA1:0x6647,0xE7BFA6:0x6648,0xE7BFA9:0x6649,0xE7BFB3:0x664A,0xE7BFB9:0x664B,
0xE9A39C:0x664C,0xE88086:0x664D,0xE88084:0x664E,0xE8808B:0x664F,0xE88092:0x6650,
0xE88098:0x6651,0xE88099:0x6652,0xE8809C:0x6653,0xE880A1:0x6654,0xE880A8:0x6655,
0xE880BF:0x6656,0xE880BB:0x6657,0xE8818A:0x6658,0xE88186:0x6659,0xE88192:0x665A,
0xE88198:0x665B,0xE8819A:0x665C,0xE8819F:0x665D,0xE881A2:0x665E,0xE881A8:0x665F,
0xE881B3:0x6660,0xE881B2:0x6661,0xE881B0:0x6662,0xE881B6:0x6663,0xE881B9:0x6664,
0xE881BD:0x6665,0xE881BF:0x6666,0xE88284:0x6667,0xE88286:0x6668,0xE88285:0x6669,
0xE8829B:0x666A,0xE88293:0x666B,0xE8829A:0x666C,0xE882AD:0x666D,0xE58690:0x666E,
0xE882AC:0x666F,0xE8839B:0x6670,0xE883A5:0x6671,0xE88399:0x6672,0xE8839D:0x6673,
0xE88384:0x6674,0xE8839A:0x6675,0xE88396:0x6676,0xE88489:0x6677,0xE883AF:0x6678,
0xE883B1:0x6679,0xE8849B:0x667A,0xE884A9:0x667B,0xE884A3:0x667C,0xE884AF:0x667D,
0xE8858B:0x667E,0xE99A8B:0x6721,0xE88586:0x6722,0xE884BE:0x6723,0xE88593:0x6724,
0xE88591:0x6725,0xE883BC:0x6726,0xE885B1:0x6727,0xE885AE:0x6728,0xE885A5:0x6729,
0xE885A6:0x672A,0xE885B4:0x672B,0xE88683:0x672C,0xE88688:0x672D,0xE8868A:0x672E,
0xE88680:0x672F,0xE88682:0x6730,0xE886A0:0x6731,0xE88695:0x6732,0xE886A4:0x6733,
0xE886A3:0x6734,0xE8859F:0x6735,0xE88693:0x6736,0xE886A9:0x6737,0xE886B0:0x6738,
0xE886B5:0x6739,0xE886BE:0x673A,0xE886B8:0x673B,0xE886BD:0x673C,0xE88780:0x673D,
0xE88782:0x673E,0xE886BA:0x673F,0xE88789:0x6740,0xE8878D:0x6741,0xE88791:0x6742,
0xE88799:0x6743,0xE88798:0x6744,0xE88788:0x6745,0xE8879A:0x6746,0xE8879F:0x6747,
0xE887A0:0x6748,0xE887A7:0x6749,0xE887BA:0x674A,0xE887BB:0x674B,0xE887BE:0x674C,
0xE88881:0x674D,0xE88882:0x674E,0xE88885:0x674F,0xE88887:0x6750,0xE8888A:0x6751,
0xE8888D:0x6752,0xE88890:0x6753,0xE88896:0x6754,0xE888A9:0x6755,0xE888AB:0x6756,
0xE888B8:0x6757,0xE888B3:0x6758,0xE88980:0x6759,0xE88999:0x675A,0xE88998:0x675B,
0xE8899D:0x675C,0xE8899A:0x675D,0xE8899F:0x675E,0xE889A4:0x675F,0xE889A2:0x6760,
0xE889A8:0x6761,0xE889AA:0x6762,0xE889AB:0x6763,0xE888AE:0x6764,0xE889B1:0x6765,
0xE889B7:0x6766,0xE889B8:0x6767,0xE889BE:0x6768,0xE88A8D:0x6769,0xE88A92:0x676A,
0xE88AAB:0x676B,0xE88A9F:0x676C,0xE88ABB:0x676D,0xE88AAC:0x676E,0xE88BA1:0x676F,
0xE88BA3:0x6770,0xE88B9F:0x6771,0xE88B92:0x6772,0xE88BB4:0x6773,0xE88BB3:0x6774,
0xE88BBA:0x6775,0xE88E93:0x6776,0xE88C83:0x6777,0xE88BBB:0x6778,0xE88BB9:0x6779,
0xE88B9E:0x677A,0xE88C86:0x677B,0xE88B9C:0x677C,0xE88C89:0x677D,0xE88B99:0x677E,
0xE88CB5:0x6821,0xE88CB4:0x6822,0xE88C96:0x6823,0xE88CB2:0x6824,0xE88CB1:0x6825,
0xE88D80:0x6826,0xE88CB9:0x6827,0xE88D90:0x6828,0xE88D85:0x6829,0xE88CAF:0x682A,
0xE88CAB:0x682B,0xE88C97:0x682C,0xE88C98:0x682D,0xE88E85:0x682E,0xE88E9A:0x682F,
0xE88EAA:0x6830,0xE88E9F:0x6831,0xE88EA2:0x6832,0xE88E96:0x6833,0xE88CA3:0x6834,
0xE88E8E:0x6835,0xE88E87:0x6836,0xE88E8A:0x6837,0xE88DBC:0x6838,0xE88EB5:0x6839,
0xE88DB3:0x683A,0xE88DB5:0x683B,0xE88EA0:0x683C,0xE88E89:0x683D,0xE88EA8:0x683E,
0xE88FB4:0x683F,0xE89093:0x6840,0xE88FAB:0x6841,0xE88F8E:0x6842,0xE88FBD:0x6843,
0xE89083:0x6844,0xE88F98:0x6845,0xE8908B:0x6846,0xE88F81:0x6847,0xE88FB7:0x6848,
0xE89087:0x6849,0xE88FA0:0x684A,0xE88FB2:0x684B,0xE8908D:0x684C,0xE890A2:0x684D,
0xE890A0:0x684E,0xE88EBD:0x684F,0xE890B8:0x6850,0xE89486:0x6851,0xE88FBB:0x6852,
0xE891AD:0x6853,0xE890AA:0x6854,0xE890BC:0x6855,0xE8959A:0x6856,0xE89284:0x6857,
0xE891B7:0x6858,0xE891AB:0x6859,0xE892AD:0x685A,0xE891AE:0x685B,0xE89282:0x685C,
0xE891A9:0x685D,0xE89186:0x685E,0xE890AC:0x685F,0xE891AF:0x6860,0xE891B9:0x6861,
0xE890B5:0x6862,0xE8938A:0x6863,0xE891A2:0x6864,0xE892B9:0x6865,0xE892BF:0x6866,
0xE8929F:0x6867,0xE89399:0x6868,0xE8938D:0x6869,0xE892BB:0x686A,0xE8939A:0x686B,
0xE89390:0x686C,0xE89381:0x686D,0xE89386:0x686E,0xE89396:0x686F,0xE892A1:0x6870,
0xE894A1:0x6871,0xE893BF:0x6872,0xE893B4:0x6873,0xE89497:0x6874,0xE89498:0x6875,
0xE894AC:0x6876,0xE8949F:0x6877,0xE89495:0x6878,0xE89494:0x6879,0xE893BC:0x687A,
0xE89580:0x687B,0xE895A3:0x687C,0xE89598:0x687D,0xE89588:0x687E,0xE89581:0x6921,
0xE89882:0x6922,0xE8958B:0x6923,0xE89595:0x6924,0xE89680:0x6925,0xE896A4:0x6926,
0xE89688:0x6927,0xE89691:0x6928,0xE8968A:0x6929,0xE896A8:0x692A,0xE895AD:0x692B,
0xE89694:0x692C,0xE8969B:0x692D,0xE897AA:0x692E,0xE89687:0x692F,0xE8969C:0x6930,
0xE895B7:0x6931,0xE895BE:0x6932,0xE89690:0x6933,0xE89789:0x6934,0xE896BA:0x6935,
0xE8978F:0x6936,0xE896B9:0x6937,0xE89790:0x6938,0xE89795:0x6939,0xE8979D:0x693A,
0xE897A5:0x693B,0xE8979C:0x693C,0xE897B9:0x693D,0xE8988A:0x693E,0xE89893:0x693F,
0xE8988B:0x6940,0xE897BE:0x6941,0xE897BA:0x6942,0xE89886:0x6943,0xE898A2:0x6944,
0xE8989A:0x6945,0xE898B0:0x6946,0xE898BF:0x6947,0xE8998D:0x6948,0xE4B995:0x6949,
0xE89994:0x694A,0xE8999F:0x694B,0xE899A7:0x694C,0xE899B1:0x694D,0xE89A93:0x694E,
0xE89AA3:0x694F,0xE89AA9:0x6950,0xE89AAA:0x6951,0xE89A8B:0x6952,0xE89A8C:0x6953,
0xE89AB6:0x6954,0xE89AAF:0x6955,0xE89B84:0x6956,0xE89B86:0x6957,0xE89AB0:0x6958,
0xE89B89:0x6959,0xE8A0A3:0x695A,0xE89AAB:0x695B,0xE89B94:0x695C,0xE89B9E:0x695D,
0xE89BA9:0x695E,0xE89BAC:0x695F,0xE89B9F:0x6960,0xE89B9B:0x6961,0xE89BAF:0x6962,
0xE89C92:0x6963,0xE89C86:0x6964,0xE89C88:0x6965,0xE89C80:0x6966,0xE89C83:0x6967,
0xE89BBB:0x6968,0xE89C91:0x6969,0xE89C89:0x696A,0xE89C8D:0x696B,0xE89BB9:0x696C,
0xE89C8A:0x696D,0xE89CB4:0x696E,0xE89CBF:0x696F,0xE89CB7:0x6970,0xE89CBB:0x6971,
0xE89CA5:0x6972,0xE89CA9:0x6973,0xE89C9A:0x6974,0xE89DA0:0x6975,0xE89D9F:0x6976,
0xE89DB8:0x6977,0xE89D8C:0x6978,0xE89D8E:0x6979,0xE89DB4:0x697A,0xE89D97:0x697B,
0xE89DA8:0x697C,0xE89DAE:0x697D,0xE89D99:0x697E,0xE89D93:0x6A21,0xE89DA3:0x6A22,
0xE89DAA:0x6A23,0xE8A085:0x6A24,0xE89EA2:0x6A25,0xE89E9F:0x6A26,0xE89E82:0x6A27,
0xE89EAF:0x6A28,0xE89F8B:0x6A29,0xE89EBD:0x6A2A,0xE89F80:0x6A2B,0xE89F90:0x6A2C,
0xE99B96:0x6A2D,0xE89EAB:0x6A2E,0xE89F84:0x6A2F,0xE89EB3:0x6A30,0xE89F87:0x6A31,
0xE89F86:0x6A32,0xE89EBB:0x6A33,0xE89FAF:0x6A34,0xE89FB2:0x6A35,0xE89FA0:0x6A36,
0xE8A08F:0x6A37,0xE8A08D:0x6A38,0xE89FBE:0x6A39,0xE89FB6:0x6A3A,0xE89FB7:0x6A3B,
0xE8A08E:0x6A3C,0xE89F92:0x6A3D,0xE8A091:0x6A3E,0xE8A096:0x6A3F,0xE8A095:0x6A40,
0xE8A0A2:0x6A41,0xE8A0A1:0x6A42,0xE8A0B1:0x6A43,0xE8A0B6:0x6A44,0xE8A0B9:0x6A45,
0xE8A0A7:0x6A46,0xE8A0BB:0x6A47,0xE8A184:0x6A48,0xE8A182:0x6A49,0xE8A192:0x6A4A,
0xE8A199:0x6A4B,0xE8A19E:0x6A4C,0xE8A1A2:0x6A4D,0xE8A1AB:0x6A4E,0xE8A281:0x6A4F,
0xE8A1BE:0x6A50,0xE8A29E:0x6A51,0xE8A1B5:0x6A52,0xE8A1BD:0x6A53,0xE8A2B5:0x6A54,
0xE8A1B2:0x6A55,0xE8A282:0x6A56,0xE8A297:0x6A57,0xE8A292:0x6A58,0xE8A2AE:0x6A59,
0xE8A299:0x6A5A,0xE8A2A2:0x6A5B,0xE8A28D:0x6A5C,0xE8A2A4:0x6A5D,0xE8A2B0:0x6A5E,
0xE8A2BF:0x6A5F,0xE8A2B1:0x6A60,0xE8A383:0x6A61,0xE8A384:0x6A62,0xE8A394:0x6A63,
0xE8A398:0x6A64,0xE8A399:0x6A65,0xE8A39D:0x6A66,0xE8A3B9:0x6A67,0xE8A482:0x6A68,
0xE8A3BC:0x6A69,0xE8A3B4:0x6A6A,0xE8A3A8:0x6A6B,0xE8A3B2:0x6A6C,0xE8A484:0x6A6D,
0xE8A48C:0x6A6E,0xE8A48A:0x6A6F,0xE8A493:0x6A70,0xE8A583:0x6A71,0xE8A49E:0x6A72,
0xE8A4A5:0x6A73,0xE8A4AA:0x6A74,0xE8A4AB:0x6A75,0xE8A581:0x6A76,0xE8A584:0x6A77,
0xE8A4BB:0x6A78,0xE8A4B6:0x6A79,0xE8A4B8:0x6A7A,0xE8A58C:0x6A7B,0xE8A49D:0x6A7C,
0xE8A5A0:0x6A7D,0xE8A59E:0x6A7E,0xE8A5A6:0x6B21,0xE8A5A4:0x6B22,0xE8A5AD:0x6B23,
0xE8A5AA:0x6B24,0xE8A5AF:0x6B25,0xE8A5B4:0x6B26,0xE8A5B7:0x6B27,0xE8A5BE:0x6B28,
0xE8A683:0x6B29,0xE8A688:0x6B2A,0xE8A68A:0x6B2B,0xE8A693:0x6B2C,0xE8A698:0x6B2D,
0xE8A6A1:0x6B2E,0xE8A6A9:0x6B2F,0xE8A6A6:0x6B30,0xE8A6AC:0x6B31,0xE8A6AF:0x6B32,
0xE8A6B2:0x6B33,0xE8A6BA:0x6B34,0xE8A6BD:0x6B35,0xE8A6BF:0x6B36,0xE8A780:0x6B37,
0xE8A79A:0x6B38,0xE8A79C:0x6B39,0xE8A79D:0x6B3A,0xE8A7A7:0x6B3B,0xE8A7B4:0x6B3C,
0xE8A7B8:0x6B3D,0xE8A883:0x6B3E,0xE8A896:0x6B3F,0xE8A890:0x6B40,0xE8A88C:0x6B41,
0xE8A89B:0x6B42,0xE8A89D:0x6B43,0xE8A8A5:0x6B44,0xE8A8B6:0x6B45,0xE8A981:0x6B46,
0xE8A99B:0x6B47,0xE8A992:0x6B48,0xE8A986:0x6B49,0xE8A988:0x6B4A,0xE8A9BC:0x6B4B,
0xE8A9AD:0x6B4C,0xE8A9AC:0x6B4D,0xE8A9A2:0x6B4E,0xE8AA85:0x6B4F,0xE8AA82:0x6B50,
0xE8AA84:0x6B51,0xE8AAA8:0x6B52,0xE8AAA1:0x6B53,0xE8AA91:0x6B54,0xE8AAA5:0x6B55,
0xE8AAA6:0x6B56,0xE8AA9A:0x6B57,0xE8AAA3:0x6B58,0xE8AB84:0x6B59,0xE8AB8D:0x6B5A,
0xE8AB82:0x6B5B,0xE8AB9A:0x6B5C,0xE8ABAB:0x6B5D,0xE8ABB3:0x6B5E,0xE8ABA7:0x6B5F,
0xE8ABA4:0x6B60,0xE8ABB1:0x6B61,0xE8AC94:0x6B62,0xE8ABA0:0x6B63,0xE8ABA2:0x6B64,
0xE8ABB7:0x6B65,0xE8AB9E:0x6B66,0xE8AB9B:0x6B67,0xE8AC8C:0x6B68,0xE8AC87:0x6B69,
0xE8AC9A:0x6B6A,0xE8ABA1:0x6B6B,0xE8AC96:0x6B6C,0xE8AC90:0x6B6D,0xE8AC97:0x6B6E,
0xE8ACA0:0x6B6F,0xE8ACB3:0x6B70,0xE99EAB:0x6B71,0xE8ACA6:0x6B72,0xE8ACAB:0x6B73,
0xE8ACBE:0x6B74,0xE8ACA8:0x6B75,0xE8AD81:0x6B76,0xE8AD8C:0x6B77,0xE8AD8F:0x6B78,
0xE8AD8E:0x6B79,0xE8AD89:0x6B7A,0xE8AD96:0x6B7B,0xE8AD9B:0x6B7C,0xE8AD9A:0x6B7D,
0xE8ADAB:0x6B7E,0xE8AD9F:0x6C21,0xE8ADAC:0x6C22,0xE8ADAF:0x6C23,0xE8ADB4:0x6C24,
0xE8ADBD:0x6C25,0xE8AE80:0x6C26,0xE8AE8C:0x6C27,0xE8AE8E:0x6C28,0xE8AE92:0x6C29,
0xE8AE93:0x6C2A,0xE8AE96:0x6C2B,0xE8AE99:0x6C2C,0xE8AE9A:0x6C2D,0xE8B0BA:0x6C2E,
0xE8B181:0x6C2F,0xE8B0BF:0x6C30,0xE8B188:0x6C31,0xE8B18C:0x6C32,0xE8B18E:0x6C33,
0xE8B190:0x6C34,0xE8B195:0x6C35,0xE8B1A2:0x6C36,0xE8B1AC:0x6C37,0xE8B1B8:0x6C38,
0xE8B1BA:0x6C39,0xE8B282:0x6C3A,0xE8B289:0x6C3B,0xE8B285:0x6C3C,0xE8B28A:0x6C3D,
0xE8B28D:0x6C3E,0xE8B28E:0x6C3F,0xE8B294:0x6C40,0xE8B1BC:0x6C41,0xE8B298:0x6C42,
0xE6889D:0x6C43,0xE8B2AD:0x6C44,0xE8B2AA:0x6C45,0xE8B2BD:0x6C46,0xE8B2B2:0x6C47,
0xE8B2B3:0x6C48,0xE8B2AE:0x6C49,0xE8B2B6:0x6C4A,0xE8B388:0x6C4B,0xE8B381:0x6C4C,
0xE8B3A4:0x6C4D,0xE8B3A3:0x6C4E,0xE8B39A:0x6C4F,0xE8B3BD:0x6C50,0xE8B3BA:0x6C51,
0xE8B3BB:0x6C52,0xE8B484:0x6C53,0xE8B485:0x6C54,0xE8B48A:0x6C55,0xE8B487:0x6C56,
0xE8B48F:0x6C57,0xE8B48D:0x6C58,0xE8B490:0x6C59,0xE9BD8E:0x6C5A,0xE8B493:0x6C5B,
0xE8B38D:0x6C5C,0xE8B494:0x6C5D,0xE8B496:0x6C5E,0xE8B5A7:0x6C5F,0xE8B5AD:0x6C60,
0xE8B5B1:0x6C61,0xE8B5B3:0x6C62,0xE8B681:0x6C63,0xE8B699:0x6C64,0xE8B782:0x6C65,
0xE8B6BE:0x6C66,0xE8B6BA:0x6C67,0xE8B78F:0x6C68,0xE8B79A:0x6C69,0xE8B796:0x6C6A,
0xE8B78C:0x6C6B,0xE8B79B:0x6C6C,0xE8B78B:0x6C6D,0xE8B7AA:0x6C6E,0xE8B7AB:0x6C6F,
0xE8B79F:0x6C70,0xE8B7A3:0x6C71,0xE8B7BC:0x6C72,0xE8B888:0x6C73,0xE8B889:0x6C74,
0xE8B7BF:0x6C75,0xE8B89D:0x6C76,0xE8B89E:0x6C77,0xE8B890:0x6C78,0xE8B89F:0x6C79,
0xE8B982:0x6C7A,0xE8B8B5:0x6C7B,0xE8B8B0:0x6C7C,0xE8B8B4:0x6C7D,0xE8B98A:0x6C7E,
0xE8B987:0x6D21,0xE8B989:0x6D22,0xE8B98C:0x6D23,0xE8B990:0x6D24,0xE8B988:0x6D25,
0xE8B999:0x6D26,0xE8B9A4:0x6D27,0xE8B9A0:0x6D28,0xE8B8AA:0x6D29,0xE8B9A3:0x6D2A,
0xE8B995:0x6D2B,0xE8B9B6:0x6D2C,0xE8B9B2:0x6D2D,0xE8B9BC:0x6D2E,0xE8BA81:0x6D2F,
0xE8BA87:0x6D30,0xE8BA85:0x6D31,0xE8BA84:0x6D32,0xE8BA8B:0x6D33,0xE8BA8A:0x6D34,
0xE8BA93:0x6D35,0xE8BA91:0x6D36,0xE8BA94:0x6D37,0xE8BA99:0x6D38,0xE8BAAA:0x6D39,
0xE8BAA1:0x6D3A,0xE8BAAC:0x6D3B,0xE8BAB0:0x6D3C,0xE8BB86:0x6D3D,0xE8BAB1:0x6D3E,
0xE8BABE:0x6D3F,0xE8BB85:0x6D40,0xE8BB88:0x6D41,0xE8BB8B:0x6D42,0xE8BB9B:0x6D43,
0xE8BBA3:0x6D44,0xE8BBBC:0x6D45,0xE8BBBB:0x6D46,0xE8BBAB:0x6D47,0xE8BBBE:0x6D48,
0xE8BC8A:0x6D49,0xE8BC85:0x6D4A,0xE8BC95:0x6D4B,0xE8BC92:0x6D4C,0xE8BC99:0x6D4D,
0xE8BC93:0x6D4E,0xE8BC9C:0x6D4F,0xE8BC9F:0x6D50,0xE8BC9B:0x6D51,0xE8BC8C:0x6D52,
0xE8BCA6:0x6D53,0xE8BCB3:0x6D54,0xE8BCBB:0x6D55,0xE8BCB9:0x6D56,0xE8BD85:0x6D57,
0xE8BD82:0x6D58,0xE8BCBE:0x6D59,0xE8BD8C:0x6D5A,0xE8BD89:0x6D5B,0xE8BD86:0x6D5C,
0xE8BD8E:0x6D5D,0xE8BD97:0x6D5E,0xE8BD9C:0x6D5F,0xE8BDA2:0x6D60,0xE8BDA3:0x6D61,
0xE8BDA4:0x6D62,0xE8BE9C:0x6D63,0xE8BE9F:0x6D64,0xE8BEA3:0x6D65,0xE8BEAD:0x6D66,
0xE8BEAF:0x6D67,0xE8BEB7:0x6D68,0xE8BF9A:0x6D69,0xE8BFA5:0x6D6A,0xE8BFA2:0x6D6B,
0xE8BFAA:0x6D6C,0xE8BFAF:0x6D6D,0xE98287:0x6D6E,0xE8BFB4:0x6D6F,0xE98085:0x6D70,
0xE8BFB9:0x6D71,0xE8BFBA:0x6D72,0xE98091:0x6D73,0xE98095:0x6D74,0xE980A1:0x6D75,
0xE9808D:0x6D76,0xE9809E:0x6D77,0xE98096:0x6D78,0xE9808B:0x6D79,0xE980A7:0x6D7A,
0xE980B6:0x6D7B,0xE980B5:0x6D7C,0xE980B9:0x6D7D,0xE8BFB8:0x6D7E,0xE9818F:0x6E21,
0xE98190:0x6E22,0xE98191:0x6E23,0xE98192:0x6E24,0xE9808E:0x6E25,0xE98189:0x6E26,
0xE980BE:0x6E27,0xE98196:0x6E28,0xE98198:0x6E29,0xE9819E:0x6E2A,0xE981A8:0x6E2B,
0xE981AF:0x6E2C,0xE981B6:0x6E2D,0xE99AA8:0x6E2E,0xE981B2:0x6E2F,0xE98282:0x6E30,
0xE981BD:0x6E31,0xE98281:0x6E32,0xE98280:0x6E33,0xE9828A:0x6E34,0xE98289:0x6E35,
0xE9828F:0x6E36,0xE982A8:0x6E37,0xE982AF:0x6E38,0xE982B1:0x6E39,0xE982B5:0x6E3A,
0xE983A2:0x6E3B,0xE983A4:0x6E3C,0xE68988:0x6E3D,0xE9839B:0x6E3E,0xE98482:0x6E3F,
0xE98492:0x6E40,0xE98499:0x6E41,0xE984B2:0x6E42,0xE984B0:0x6E43,0xE9858A:0x6E44,
0xE98596:0x6E45,0xE98598:0x6E46,0xE985A3:0x6E47,0xE985A5:0x6E48,0xE985A9:0x6E49,
0xE985B3:0x6E4A,0xE985B2:0x6E4B,0xE9868B:0x6E4C,0xE98689:0x6E4D,0xE98682:0x6E4E,
0xE986A2:0x6E4F,0xE986AB:0x6E50,0xE986AF:0x6E51,0xE986AA:0x6E52,0xE986B5:0x6E53,
0xE986B4:0x6E54,0xE986BA:0x6E55,0xE98780:0x6E56,0xE98781:0x6E57,0xE98789:0x6E58,
0xE9878B:0x6E59,0xE98790:0x6E5A,0xE98796:0x6E5B,0xE9879F:0x6E5C,0xE987A1:0x6E5D,
0xE9879B:0x6E5E,0xE987BC:0x6E5F,0xE987B5:0x6E60,0xE987B6:0x6E61,0xE9889E:0x6E62,
0xE987BF:0x6E63,0xE98894:0x6E64,0xE988AC:0x6E65,0xE98895:0x6E66,0xE98891:0x6E67,
0xE9899E:0x6E68,0xE98997:0x6E69,0xE98985:0x6E6A,0xE98989:0x6E6B,0xE989A4:0x6E6C,
0xE98988:0x6E6D,0xE98A95:0x6E6E,0xE988BF:0x6E6F,0xE9898B:0x6E70,0xE98990:0x6E71,
0xE98A9C:0x6E72,0xE98A96:0x6E73,0xE98A93:0x6E74,0xE98A9B:0x6E75,0xE9899A:0x6E76,
0xE98B8F:0x6E77,0xE98AB9:0x6E78,0xE98AB7:0x6E79,0xE98BA9:0x6E7A,0xE98C8F:0x6E7B,
0xE98BBA:0x6E7C,0xE98D84:0x6E7D,0xE98CAE:0x6E7E,0xE98C99:0x6F21,0xE98CA2:0x6F22,
0xE98C9A:0x6F23,0xE98CA3:0x6F24,0xE98CBA:0x6F25,0xE98CB5:0x6F26,0xE98CBB:0x6F27,
0xE98D9C:0x6F28,0xE98DA0:0x6F29,0xE98DBC:0x6F2A,0xE98DAE:0x6F2B,0xE98D96:0x6F2C,
0xE98EB0:0x6F2D,0xE98EAC:0x6F2E,0xE98EAD:0x6F2F,0xE98E94:0x6F30,0xE98EB9:0x6F31,
0xE98F96:0x6F32,0xE98F97:0x6F33,0xE98FA8:0x6F34,0xE98FA5:0x6F35,0xE98F98:0x6F36,
0xE98F83:0x6F37,0xE98F9D:0x6F38,0xE98F90:0x6F39,0xE98F88:0x6F3A,0xE98FA4:0x6F3B,
0xE9909A:0x6F3C,0xE99094:0x6F3D,0xE99093:0x6F3E,0xE99083:0x6F3F,0xE99087:0x6F40,
0xE99090:0x6F41,0xE990B6:0x6F42,0xE990AB:0x6F43,0xE990B5:0x6F44,0xE990A1:0x6F45,
0xE990BA:0x6F46,0xE99181:0x6F47,0xE99192:0x6F48,0xE99184:0x6F49,0xE9919B:0x6F4A,
0xE991A0:0x6F4B,0xE991A2:0x6F4C,0xE9919E:0x6F4D,0xE991AA:0x6F4E,0xE988A9:0x6F4F,
0xE991B0:0x6F50,0xE991B5:0x6F51,0xE991B7:0x6F52,0xE991BD:0x6F53,0xE9919A:0x6F54,
0xE991BC:0x6F55,0xE991BE:0x6F56,0xE99281:0x6F57,0xE991BF:0x6F58,0xE99682:0x6F59,
0xE99687:0x6F5A,0xE9968A:0x6F5B,0xE99694:0x6F5C,0xE99696:0x6F5D,0xE99698:0x6F5E,
0xE99699:0x6F5F,0xE996A0:0x6F60,0xE996A8:0x6F61,0xE996A7:0x6F62,0xE996AD:0x6F63,
0xE996BC:0x6F64,0xE996BB:0x6F65,0xE996B9:0x6F66,0xE996BE:0x6F67,0xE9978A:0x6F68,
0xE6BFB6:0x6F69,0xE99783:0x6F6A,0xE9978D:0x6F6B,0xE9978C:0x6F6C,0xE99795:0x6F6D,
0xE99794:0x6F6E,0xE99796:0x6F6F,0xE9979C:0x6F70,0xE997A1:0x6F71,0xE997A5:0x6F72,
0xE997A2:0x6F73,0xE998A1:0x6F74,0xE998A8:0x6F75,0xE998AE:0x6F76,0xE998AF:0x6F77,
0xE99982:0x6F78,0xE9998C:0x6F79,0xE9998F:0x6F7A,0xE9998B:0x6F7B,0xE999B7:0x6F7C,
0xE9999C:0x6F7D,0xE9999E:0x6F7E,0xE9999D:0x7021,0xE9999F:0x7022,0xE999A6:0x7023,
0xE999B2:0x7024,0xE999AC:0x7025,0xE99A8D:0x7026,0xE99A98:0x7027,0xE99A95:0x7028,
0xE99A97:0x7029,0xE99AAA:0x702A,0xE99AA7:0x702B,0xE99AB1:0x702C,0xE99AB2:0x702D,
0xE99AB0:0x702E,0xE99AB4:0x702F,0xE99AB6:0x7030,0xE99AB8:0x7031,0xE99AB9:0x7032,
0xE99B8E:0x7033,0xE99B8B:0x7034,0xE99B89:0x7035,0xE99B8D:0x7036,0xE8A58D:0x7037,
0xE99B9C:0x7038,0xE99C8D:0x7039,0xE99B95:0x703A,0xE99BB9:0x703B,0xE99C84:0x703C,
0xE99C86:0x703D,0xE99C88:0x703E,0xE99C93:0x703F,0xE99C8E:0x7040,0xE99C91:0x7041,
0xE99C8F:0x7042,0xE99C96:0x7043,0xE99C99:0x7044,0xE99CA4:0x7045,0xE99CAA:0x7046,
0xE99CB0:0x7047,0xE99CB9:0x7048,0xE99CBD:0x7049,0xE99CBE:0x704A,0xE99D84:0x704B,
0xE99D86:0x704C,0xE99D88:0x704D,0xE99D82:0x704E,0xE99D89:0x704F,0xE99D9C:0x7050,
0xE99DA0:0x7051,0xE99DA4:0x7052,0xE99DA6:0x7053,0xE99DA8:0x7054,0xE58B92:0x7055,
0xE99DAB:0x7056,0xE99DB1:0x7057,0xE99DB9:0x7058,0xE99E85:0x7059,0xE99DBC:0x705A,
0xE99E81:0x705B,0xE99DBA:0x705C,0xE99E86:0x705D,0xE99E8B:0x705E,0xE99E8F:0x705F,
0xE99E90:0x7060,0xE99E9C:0x7061,0xE99EA8:0x7062,0xE99EA6:0x7063,0xE99EA3:0x7064,
0xE99EB3:0x7065,0xE99EB4:0x7066,0xE99F83:0x7067,0xE99F86:0x7068,0xE99F88:0x7069,
0xE99F8B:0x706A,0xE99F9C:0x706B,0xE99FAD:0x706C,0xE9BD8F:0x706D,0xE99FB2:0x706E,
0xE7AB9F:0x706F,0xE99FB6:0x7070,0xE99FB5:0x7071,0xE9A08F:0x7072,0xE9A08C:0x7073,
0xE9A0B8:0x7074,0xE9A0A4:0x7075,0xE9A0A1:0x7076,0xE9A0B7:0x7077,0xE9A0BD:0x7078,
0xE9A186:0x7079,0xE9A18F:0x707A,0xE9A18B:0x707B,0xE9A1AB:0x707C,0xE9A1AF:0x707D,
0xE9A1B0:0x707E,0xE9A1B1:0x7121,0xE9A1B4:0x7122,0xE9A1B3:0x7123,0xE9A2AA:0x7124,
0xE9A2AF:0x7125,0xE9A2B1:0x7126,0xE9A2B6:0x7127,0xE9A384:0x7128,0xE9A383:0x7129,
0xE9A386:0x712A,0xE9A3A9:0x712B,0xE9A3AB:0x712C,0xE9A483:0x712D,0xE9A489:0x712E,
0xE9A492:0x712F,0xE9A494:0x7130,0xE9A498:0x7131,0xE9A4A1:0x7132,0xE9A49D:0x7133,
0xE9A49E:0x7134,0xE9A4A4:0x7135,0xE9A4A0:0x7136,0xE9A4AC:0x7137,0xE9A4AE:0x7138,
0xE9A4BD:0x7139,0xE9A4BE:0x713A,0xE9A582:0x713B,0xE9A589:0x713C,0xE9A585:0x713D,
0xE9A590:0x713E,0xE9A58B:0x713F,0xE9A591:0x7140,0xE9A592:0x7141,0xE9A58C:0x7142,
0xE9A595:0x7143,0xE9A697:0x7144,0xE9A698:0x7145,0xE9A6A5:0x7146,0xE9A6AD:0x7147,
0xE9A6AE:0x7148,0xE9A6BC:0x7149,0xE9A79F:0x714A,0xE9A79B:0x714B,0xE9A79D:0x714C,
0xE9A798:0x714D,0xE9A791:0x714E,0xE9A7AD:0x714F,0xE9A7AE:0x7150,0xE9A7B1:0x7151,
0xE9A7B2:0x7152,0xE9A7BB:0x7153,0xE9A7B8:0x7154,0xE9A881:0x7155,0xE9A88F:0x7156,
0xE9A885:0x7157,0xE9A7A2:0x7158,0xE9A899:0x7159,0xE9A8AB:0x715A,0xE9A8B7:0x715B,
0xE9A985:0x715C,0xE9A982:0x715D,0xE9A980:0x715E,0xE9A983:0x715F,0xE9A8BE:0x7160,
0xE9A995:0x7161,0xE9A98D:0x7162,0xE9A99B:0x7163,0xE9A997:0x7164,0xE9A99F:0x7165,
0xE9A9A2:0x7166,0xE9A9A5:0x7167,0xE9A9A4:0x7168,0xE9A9A9:0x7169,0xE9A9AB:0x716A,
0xE9A9AA:0x716B,0xE9AAAD:0x716C,0xE9AAB0:0x716D,0xE9AABC:0x716E,0xE9AB80:0x716F,
0xE9AB8F:0x7170,0xE9AB91:0x7171,0xE9AB93:0x7172,0xE9AB94:0x7173,0xE9AB9E:0x7174,
0xE9AB9F:0x7175,0xE9ABA2:0x7176,0xE9ABA3:0x7177,0xE9ABA6:0x7178,0xE9ABAF:0x7179,
0xE9ABAB:0x717A,0xE9ABAE:0x717B,0xE9ABB4:0x717C,0xE9ABB1:0x717D,0xE9ABB7:0x717E,
0xE9ABBB:0x7221,0xE9AC86:0x7222,0xE9AC98:0x7223,0xE9AC9A:0x7224,0xE9AC9F:0x7225,
0xE9ACA2:0x7226,0xE9ACA3:0x7227,0xE9ACA5:0x7228,0xE9ACA7:0x7229,0xE9ACA8:0x722A,
0xE9ACA9:0x722B,0xE9ACAA:0x722C,0xE9ACAE:0x722D,0xE9ACAF:0x722E,0xE9ACB2:0x722F,
0xE9AD84:0x7230,0xE9AD83:0x7231,0xE9AD8F:0x7232,0xE9AD8D:0x7233,0xE9AD8E:0x7234,
0xE9AD91:0x7235,0xE9AD98:0x7236,0xE9ADB4:0x7237,0xE9AE93:0x7238,0xE9AE83:0x7239,
0xE9AE91:0x723A,0xE9AE96:0x723B,0xE9AE97:0x723C,0xE9AE9F:0x723D,0xE9AEA0:0x723E,
0xE9AEA8:0x723F,0xE9AEB4:0x7240,0xE9AF80:0x7241,0xE9AF8A:0x7242,0xE9AEB9:0x7243,
0xE9AF86:0x7244,0xE9AF8F:0x7245,0xE9AF91:0x7246,0xE9AF92:0x7247,0xE9AFA3:0x7248,
0xE9AFA2:0x7249,0xE9AFA4:0x724A,0xE9AF94:0x724B,0xE9AFA1:0x724C,0xE9B0BA:0x724D,
0xE9AFB2:0x724E,0xE9AFB1:0x724F,0xE9AFB0:0x7250,0xE9B095:0x7251,0xE9B094:0x7252,
0xE9B089:0x7253,0xE9B093:0x7254,0xE9B08C:0x7255,0xE9B086:0x7256,0xE9B088:0x7257,
0xE9B092:0x7258,0xE9B08A:0x7259,0xE9B084:0x725A,0xE9B0AE:0x725B,0xE9B09B:0x725C,
0xE9B0A5:0x725D,0xE9B0A4:0x725E,0xE9B0A1:0x725F,0xE9B0B0:0x7260,0xE9B187:0x7261,
0xE9B0B2:0x7262,0xE9B186:0x7263,0xE9B0BE:0x7264,0xE9B19A:0x7265,0xE9B1A0:0x7266,
0xE9B1A7:0x7267,0xE9B1B6:0x7268,0xE9B1B8:0x7269,0xE9B3A7:0x726A,0xE9B3AC:0x726B,
0xE9B3B0:0x726C,0xE9B489:0x726D,0xE9B488:0x726E,0xE9B3AB:0x726F,0xE9B483:0x7270,
0xE9B486:0x7271,0xE9B4AA:0x7272,0xE9B4A6:0x7273,0xE9B6AF:0x7274,0xE9B4A3:0x7275,
0xE9B49F:0x7276,0xE9B584:0x7277,0xE9B495:0x7278,0xE9B492:0x7279,0xE9B581:0x727A,
0xE9B4BF:0x727B,0xE9B4BE:0x727C,0xE9B586:0x727D,0xE9B588:0x727E,0xE9B59D:0x7321,
0xE9B59E:0x7322,0xE9B5A4:0x7323,0xE9B591:0x7324,0xE9B590:0x7325,0xE9B599:0x7326,
0xE9B5B2:0x7327,0xE9B689:0x7328,0xE9B687:0x7329,0xE9B6AB:0x732A,0xE9B5AF:0x732B,
0xE9B5BA:0x732C,0xE9B69A:0x732D,0xE9B6A4:0x732E,0xE9B6A9:0x732F,0xE9B6B2:0x7330,
0xE9B784:0x7331,0xE9B781:0x7332,0xE9B6BB:0x7333,0xE9B6B8:0x7334,0xE9B6BA:0x7335,
0xE9B786:0x7336,0xE9B78F:0x7337,0xE9B782:0x7338,0xE9B799:0x7339,0xE9B793:0x733A,
0xE9B7B8:0x733B,0xE9B7A6:0x733C,0xE9B7AD:0x733D,0xE9B7AF:0x733E,0xE9B7BD:0x733F,
0xE9B89A:0x7340,0xE9B89B:0x7341,0xE9B89E:0x7342,0xE9B9B5:0x7343,0xE9B9B9:0x7344,
0xE9B9BD:0x7345,0xE9BA81:0x7346,0xE9BA88:0x7347,0xE9BA8B:0x7348,0xE9BA8C:0x7349,
0xE9BA92:0x734A,0xE9BA95:0x734B,0xE9BA91:0x734C,0xE9BA9D:0x734D,0xE9BAA5:0x734E,
0xE9BAA9:0x734F,0xE9BAB8:0x7350,0xE9BAAA:0x7351,0xE9BAAD:0x7352,0xE99DA1:0x7353,
0xE9BB8C:0x7354,0xE9BB8E:0x7355,0xE9BB8F:0x7356,0xE9BB90:0x7357,0xE9BB94:0x7358,
0xE9BB9C:0x7359,0xE9BB9E:0x735A,0xE9BB9D:0x735B,0xE9BBA0:0x735C,0xE9BBA5:0x735D,
0xE9BBA8:0x735E,0xE9BBAF:0x735F,0xE9BBB4:0x7360,0xE9BBB6:0x7361,0xE9BBB7:0x7362,
0xE9BBB9:0x7363,0xE9BBBB:0x7364,0xE9BBBC:0x7365,0xE9BBBD:0x7366,0xE9BC87:0x7367,
0xE9BC88:0x7368,0xE79AB7:0x7369,0xE9BC95:0x736A,0xE9BCA1:0x736B,0xE9BCAC:0x736C,
0xE9BCBE:0x736D,0xE9BD8A:0x736E,0xE9BD92:0x736F,0xE9BD94:0x7370,0xE9BDA3:0x7371,
0xE9BD9F:0x7372,0xE9BDA0:0x7373,0xE9BDA1:0x7374,0xE9BDA6:0x7375,0xE9BDA7:0x7376,
0xE9BDAC:0x7377,0xE9BDAA:0x7378,0xE9BDB7:0x7379,0xE9BDB2:0x737A,0xE9BDB6:0x737B,
0xE9BE95:0x737C,0xE9BE9C:0x737D,0xE9BEA0:0x737E,0xE5A0AF:0x7421,0xE6A787:0x7422,
0xE98199:0x7423,0xE791A4:0x7424,0xE5879C:0x7425,0xE78699:0x7426,

0xE7BA8A:0x7921,0xE8A49C:0x7922,0xE98D88:0x7923,0xE98A88:0x7924,0xE8939C:0x7925,
0xE4BF89:0x7926,0xE782BB:0x7927,0xE698B1:0x7928,0xE6A388:0x7929,0xE98BB9:0x792A,
0xE69BBB:0x792B,0xE5BD85:0x792C,0xE4B8A8:0x792D,0xE4BBA1:0x792E,0xE4BBBC:0x792F,
0xE4BC80:0x7930,0xE4BC83:0x7931,0xE4BCB9:0x7932,0xE4BD96:0x7933,0xE4BE92:0x7934,
0xE4BE8A:0x7935,0xE4BE9A:0x7936,0xE4BE94:0x7937,0xE4BF8D:0x7938,0xE58180:0x7939,
0xE580A2:0x793A,0xE4BFBF:0x793B,0xE5809E:0x793C,0xE58186:0x793D,0xE581B0:0x793E,
0xE58182:0x793F,0xE58294:0x7940,0xE583B4:0x7941,0xE58398:0x7942,0xE5858A:0x7943,
0xE585A4:0x7944,0xE5869D:0x7945,0xE586BE:0x7946,0xE587AC:0x7947,0xE58895:0x7948,
0xE58A9C:0x7949,0xE58AA6:0x794A,0xE58B80:0x794B,0xE58B9B:0x794C,0xE58C80:0x794D,
0xE58C87:0x794E,0xE58CA4:0x794F,0xE58DB2:0x7950,0xE58E93:0x7951,0xE58EB2:0x7952,
0xE58F9D:0x7953,0xEFA88E:0x7954,0xE5929C:0x7955,0xE5928A:0x7956,0xE592A9:0x7957,
0xE593BF:0x7958,0xE59686:0x7959,0xE59D99:0x795A,0xE59DA5:0x795B,0xE59EAC:0x795C,
0xE59F88:0x795D,0xE59F87:0x795E,0xEFA88F:0x795F,0xEFA890:0x7960,0xE5A29E:0x7961,
0xE5A2B2:0x7962,0xE5A48B:0x7963,0xE5A593:0x7964,0xE5A59B:0x7965,0xE5A59D:0x7966,
0xE5A5A3:0x7967,0xE5A6A4:0x7968,0xE5A6BA:0x7969,0xE5AD96:0x796A,0xE5AF80:0x796B,
0xE794AF:0x796C,0xE5AF98:0x796D,0xE5AFAC:0x796E,0xE5B09E:0x796F,0xE5B2A6:0x7970,
0xE5B2BA:0x7971,0xE5B3B5:0x7972,0xE5B4A7:0x7973,0xE5B593:0x7974,0xEFA891:0x7975,
0xE5B582:0x7976,0xE5B5AD:0x7977,0xE5B6B8:0x7978,0xE5B6B9:0x7979,0xE5B790:0x797A,
0xE5BCA1:0x797B,0xE5BCB4:0x797C,0xE5BDA7:0x797D,0xE5BEB7:0x797E,0xE5BF9E:0x7A21,
0xE6819D:0x7A22,0xE68285:0x7A23,0xE6828A:0x7A24,0xE6839E:0x7A25,0xE68395:0x7A26,
0xE684A0:0x7A27,0xE683B2:0x7A28,0xE68491:0x7A29,0xE684B7:0x7A2A,0xE684B0:0x7A2B,
0xE68698:0x7A2C,0xE68893:0x7A2D,0xE68AA6:0x7A2E,0xE68FB5:0x7A2F,0xE691A0:0x7A30,
0xE6929D:0x7A31,0xE6938E:0x7A32,0xE6958E:0x7A33,0xE69880:0x7A34,0xE69895:0x7A35,
0xE698BB:0x7A36,0xE69889:0x7A37,0xE698AE:0x7A38,0xE6989E:0x7A39,0xE698A4:0x7A3A,
0xE699A5:0x7A3B,0xE69997:0x7A3C,0xE69999:0x7A3D,0xEFA892:0x7A3E,0xE699B3:0x7A3F,
0xE69A99:0x7A40,0xE69AA0:0x7A41,0xE69AB2:0x7A42,0xE69ABF:0x7A43,0xE69BBA:0x7A44,
0xE69C8E:0x7A45,0xEFA4A9:0x7A46,0xE69DA6:0x7A47,0xE69EBB:0x7A48,0xE6A192:0x7A49,
0xE69F80:0x7A4A,0xE6A081:0x7A4B,0xE6A184:0x7A4C,0xE6A38F:0x7A4D,0xEFA893:0x7A4E,
0xE6A5A8:0x7A4F,0xEFA894:0x7A50,0xE6A698:0x7A51,0xE6A7A2:0x7A52,0xE6A8B0:0x7A53,
0xE6A9AB:0x7A54,0xE6A986:0x7A55,0xE6A9B3:0x7A56,0xE6A9BE:0x7A57,0xE6ABA2:0x7A58,
0xE6ABA4:0x7A59,0xE6AF96:0x7A5A,0xE6B0BF:0x7A5B,0xE6B19C:0x7A5C,0xE6B286:0x7A5D,
0xE6B1AF:0x7A5E,0xE6B39A:0x7A5F,0xE6B484:0x7A60,0xE6B687:0x7A61,0xE6B5AF:0x7A62,
0xE6B696:0x7A63,0xE6B6AC:0x7A64,0xE6B78F:0x7A65,0xE6B7B8:0x7A66,0xE6B7B2:0x7A67,
0xE6B7BC:0x7A68,0xE6B8B9:0x7A69,0xE6B99C:0x7A6A,0xE6B8A7:0x7A6B,0xE6B8BC:0x7A6C,
0xE6BABF:0x7A6D,0xE6BE88:0x7A6E,0xE6BEB5:0x7A6F,0xE6BFB5:0x7A70,0xE78085:0x7A71,
0xE78087:0x7A72,0xE780A8:0x7A73,0xE78285:0x7A74,0xE782AB:0x7A75,0xE7848F:0x7A76,
0xE78484:0x7A77,0xE7859C:0x7A78,0xE78586:0x7A79,0xE78587:0x7A7A,0xEFA895:0x7A7B,
0xE78781:0x7A7C,0xE787BE:0x7A7D,0xE78AB1:0x7A7E,0xE78ABE:0x7B21,0xE78CA4:0x7B22,
0xEFA896:0x7B23,0xE78DB7:0x7B24,0xE78EBD:0x7B25,0xE78F89:0x7B26,0xE78F96:0x7B27,
0xE78FA3:0x7B28,0xE78F92:0x7B29,0xE79087:0x7B2A,0xE78FB5:0x7B2B,0xE790A6:0x7B2C,
0xE790AA:0x7B2D,0xE790A9:0x7B2E,0xE790AE:0x7B2F,0xE791A2:0x7B30,0xE79289:0x7B31,
0xE7929F:0x7B32,0xE79481:0x7B33,0xE795AF:0x7B34,0xE79A82:0x7B35,0xE79A9C:0x7B36,
0xE79A9E:0x7B37,0xE79A9B:0x7B38,0xE79AA6:0x7B39,0xEFA897:0x7B3A,0xE79D86:0x7B3B,
0xE58AAF:0x7B3C,0xE7A0A1:0x7B3D,0xE7A18E:0x7B3E,0xE7A1A4:0x7B3F,0xE7A1BA:0x7B40,
0xE7A4B0:0x7B41,0xEFA898:0x7B42,0xEFA899:0x7B43,0xEFA89A:0x7B44,0xE7A694:0x7B45,
0xEFA89B:0x7B46,0xE7A69B:0x7B47,0xE7AB91:0x7B48,0xE7ABA7:0x7B49,0xEFA89C:0x7B4A,
0xE7ABAB:0x7B4B,0xE7AE9E:0x7B4C,0xEFA89D:0x7B4D,0xE7B588:0x7B4E,0xE7B59C:0x7B4F,
0xE7B6B7:0x7B50,0xE7B6A0:0x7B51,0xE7B796:0x7B52,0xE7B992:0x7B53,0xE7BD87:0x7B54,
0xE7BEA1:0x7B55,0xEFA89E:0x7B56,0xE88C81:0x7B57,0xE88DA2:0x7B58,0xE88DBF:0x7B59,
0xE88F87:0x7B5A,0xE88FB6:0x7B5B,0xE89188:0x7B5C,0xE892B4:0x7B5D,0xE89593:0x7B5E,
0xE89599:0x7B5F,0xE895AB:0x7B60,0xEFA89F:0x7B61,0xE896B0:0x7B62,0xEFA8A0:0x7B63,
0xEFA8A1:0x7B64,0xE8A087:0x7B65,0xE8A3B5:0x7B66,0xE8A892:0x7B67,0xE8A8B7:0x7B68,
0xE8A9B9:0x7B69,0xE8AAA7:0x7B6A,0xE8AABE:0x7B6B,0xE8AB9F:0x7B6C,0xEFA8A2:0x7B6D,
0xE8ABB6:0x7B6E,0xE8AD93:0x7B6F,0xE8ADBF:0x7B70,0xE8B3B0:0x7B71,0xE8B3B4:0x7B72,
0xE8B492:0x7B73,0xE8B5B6:0x7B74,0xEFA8A3:0x7B75,0xE8BB8F:0x7B76,0xEFA8A4:0x7B77,
0xEFA8A5:0x7B78,0xE981A7:0x7B79,0xE9839E:0x7B7A,0xEFA8A6:0x7B7B,0xE98495:0x7B7C,
0xE984A7:0x7B7D,0xE9879A:0x7B7E,0xE98797:0x7C21,0xE9879E:0x7C22,0xE987AD:0x7C23,
0xE987AE:0x7C24,0xE987A4:0x7C25,0xE987A5:0x7C26,0xE98886:0x7C27,0xE98890:0x7C28,
0xE9888A:0x7C29,0xE988BA:0x7C2A,0xE98980:0x7C2B,0xE988BC:0x7C2C,0xE9898E:0x7C2D,
0xE98999:0x7C2E,0xE98991:0x7C2F,0xE988B9:0x7C30,0xE989A7:0x7C31,0xE98AA7:0x7C32,
0xE989B7:0x7C33,0xE989B8:0x7C34,0xE98BA7:0x7C35,0xE98B97:0x7C36,0xE98B99:0x7C37,
0xE98B90:0x7C38,0xEFA8A7:0x7C39,0xE98B95:0x7C3A,0xE98BA0:0x7C3B,0xE98B93:0x7C3C,
0xE98CA5:0x7C3D,0xE98CA1:0x7C3E,0xE98BBB:0x7C3F,0xEFA8A8:0x7C40,0xE98C9E:0x7C41,
0xE98BBF:0x7C42,0xE98C9D:0x7C43,0xE98C82:0x7C44,0xE98DB0:0x7C45,0xE98D97:0x7C46,
0xE98EA4:0x7C47,0xE98F86:0x7C48,0xE98F9E:0x7C49,0xE98FB8:0x7C4A,0xE990B1:0x7C4B,
0xE99185:0x7C4C,0xE99188:0x7C4D,0xE99692:0x7C4E,0xEFA79C:0x7C4F,0xEFA8A9:0x7C50,
0xE99A9D:0x7C51,0xE99AAF:0x7C52,0xE99CB3:0x7C53,0xE99CBB:0x7C54,0xE99D83:0x7C55,
0xE99D8D:0x7C56,0xE99D8F:0x7C57,0xE99D91:0x7C58,0xE99D95:0x7C59,0xE9A197:0x7C5A,
0xE9A1A5:0x7C5B,0xEFA8AA:0x7C5C,0xEFA8AB:0x7C5D,0xE9A4A7:0x7C5E,0xEFA8AC:0x7C5F,
0xE9A69E:0x7C60,0xE9A98E:0x7C61,0xE9AB99:0x7C62,0xE9AB9C:0x7C63,0xE9ADB5:0x7C64,
0xE9ADB2:0x7C65,0xE9AE8F:0x7C66,0xE9AEB1:0x7C67,0xE9AEBB:0x7C68,0xE9B080:0x7C69,
0xE9B5B0:0x7C6A,0xE9B5AB:0x7C6B,0xEFA8AD:0x7C6C,0xE9B899:0x7C6D,0xE9BB91:0x7C6E,
0xE285B0:0x7C71,0xE285B1:0x7C72,0xE285B2:0x7C73,0xE285B3:0x7C74,0xE285B4:0x7C75,
0xE285B5:0x7C76,0xE285B6:0x7C77,0xE285B7:0x7C78,0xE285B8:0x7C79,0xE285B9:0x7C7A,
0xEFBFA4:0x7C7C,0xEFBC87:0x7C7D,0xEFBC82:0x7C7E,

//FIXME: mojibake
0xE288A5:0x2142,
0xEFBFA2:0x224C,
0xE28892:0x1215D
};

/**
 * The encoding conversion table for UTF-8 to JIS X 0212:1990 (Hojo-Kanji).
 *
 * @ignore
 */
var UTF8_TO_JISX0212_TABLE = {
0xCB98:0x222F,0xCB87:0x2230,0xC2B8:0x2231,0xCB99:0x2232,0xCB9D:0x2233,
0xC2AF:0x2234,0xCB9B:0x2235,0xCB9A:0x2236,0x7E:0x2237,0xCE84:0x2238,
0xCE85:0x2239,0xC2A1:0x2242,0xC2A6:0x2243,0xC2BF:0x2244,0xC2BA:0x226B,
0xC2AA:0x226C,0xC2A9:0x226D,0xC2AE:0x226E,0xE284A2:0x226F,0xC2A4:0x2270,
0xE28496:0x2271,0xCE86:0x2661,0xCE88:0x2662,0xCE89:0x2663,0xCE8A:0x2664,
0xCEAA:0x2665,0xCE8C:0x2667,0xCE8E:0x2669,0xCEAB:0x266A,0xCE8F:0x266C,
0xCEAC:0x2671,0xCEAD:0x2672,0xCEAE:0x2673,0xCEAF:0x2674,0xCF8A:0x2675,
0xCE90:0x2676,0xCF8C:0x2677,0xCF82:0x2678,0xCF8D:0x2679,0xCF8B:0x267A,
0xCEB0:0x267B,0xCF8E:0x267C,0xD082:0x2742,0xD083:0x2743,0xD084:0x2744,
0xD085:0x2745,0xD086:0x2746,0xD087:0x2747,0xD088:0x2748,0xD089:0x2749,
0xD08A:0x274A,0xD08B:0x274B,0xD08C:0x274C,0xD08E:0x274D,0xD08F:0x274E,
0xD192:0x2772,0xD193:0x2773,0xD194:0x2774,0xD195:0x2775,0xD196:0x2776,
0xD197:0x2777,0xD198:0x2778,0xD199:0x2779,0xD19A:0x277A,0xD19B:0x277B,
0xD19C:0x277C,0xD19E:0x277D,0xD19F:0x277E,0xC386:0x2921,0xC490:0x2922,
0xC4A6:0x2924,0xC4B2:0x2926,0xC581:0x2928,0xC4BF:0x2929,0xC58A:0x292B,
0xC398:0x292C,0xC592:0x292D,0xC5A6:0x292F,0xC39E:0x2930,0xC3A6:0x2941,
0xC491:0x2942,0xC3B0:0x2943,0xC4A7:0x2944,0xC4B1:0x2945,0xC4B3:0x2946,
0xC4B8:0x2947,0xC582:0x2948,0xC580:0x2949,0xC589:0x294A,0xC58B:0x294B,
0xC3B8:0x294C,0xC593:0x294D,0xC39F:0x294E,0xC5A7:0x294F,0xC3BE:0x2950,
0xC381:0x2A21,0xC380:0x2A22,0xC384:0x2A23,0xC382:0x2A24,0xC482:0x2A25,
0xC78D:0x2A26,0xC480:0x2A27,0xC484:0x2A28,0xC385:0x2A29,0xC383:0x2A2A,
0xC486:0x2A2B,0xC488:0x2A2C,0xC48C:0x2A2D,0xC387:0x2A2E,0xC48A:0x2A2F,
0xC48E:0x2A30,0xC389:0x2A31,0xC388:0x2A32,0xC38B:0x2A33,0xC38A:0x2A34,
0xC49A:0x2A35,0xC496:0x2A36,0xC492:0x2A37,0xC498:0x2A38,0xC49C:0x2A3A,
0xC49E:0x2A3B,0xC4A2:0x2A3C,0xC4A0:0x2A3D,0xC4A4:0x2A3E,0xC38D:0x2A3F,
0xC38C:0x2A40,0xC38F:0x2A41,0xC38E:0x2A42,0xC78F:0x2A43,0xC4B0:0x2A44,
0xC4AA:0x2A45,0xC4AE:0x2A46,0xC4A8:0x2A47,0xC4B4:0x2A48,0xC4B6:0x2A49,
0xC4B9:0x2A4A,0xC4BD:0x2A4B,0xC4BB:0x2A4C,0xC583:0x2A4D,0xC587:0x2A4E,
0xC585:0x2A4F,0xC391:0x2A50,0xC393:0x2A51,0xC392:0x2A52,0xC396:0x2A53,
0xC394:0x2A54,0xC791:0x2A55,0xC590:0x2A56,0xC58C:0x2A57,0xC395:0x2A58,
0xC594:0x2A59,0xC598:0x2A5A,0xC596:0x2A5B,0xC59A:0x2A5C,0xC59C:0x2A5D,
0xC5A0:0x2A5E,0xC59E:0x2A5F,0xC5A4:0x2A60,0xC5A2:0x2A61,0xC39A:0x2A62,
0xC399:0x2A63,0xC39C:0x2A64,0xC39B:0x2A65,0xC5AC:0x2A66,0xC793:0x2A67,
0xC5B0:0x2A68,0xC5AA:0x2A69,0xC5B2:0x2A6A,0xC5AE:0x2A6B,0xC5A8:0x2A6C,
0xC797:0x2A6D,0xC79B:0x2A6E,0xC799:0x2A6F,0xC795:0x2A70,0xC5B4:0x2A71,
0xC39D:0x2A72,0xC5B8:0x2A73,0xC5B6:0x2A74,0xC5B9:0x2A75,0xC5BD:0x2A76,
0xC5BB:0x2A77,0xC3A1:0x2B21,0xC3A0:0x2B22,0xC3A4:0x2B23,0xC3A2:0x2B24,
0xC483:0x2B25,0xC78E:0x2B26,0xC481:0x2B27,0xC485:0x2B28,0xC3A5:0x2B29,
0xC3A3:0x2B2A,0xC487:0x2B2B,0xC489:0x2B2C,0xC48D:0x2B2D,0xC3A7:0x2B2E,
0xC48B:0x2B2F,0xC48F:0x2B30,0xC3A9:0x2B31,0xC3A8:0x2B32,0xC3AB:0x2B33,
0xC3AA:0x2B34,0xC49B:0x2B35,0xC497:0x2B36,0xC493:0x2B37,0xC499:0x2B38,
0xC7B5:0x2B39,0xC49D:0x2B3A,0xC49F:0x2B3B,0xC4A1:0x2B3D,0xC4A5:0x2B3E,
0xC3AD:0x2B3F,0xC3AC:0x2B40,0xC3AF:0x2B41,0xC3AE:0x2B42,0xC790:0x2B43,
0xC4AB:0x2B45,0xC4AF:0x2B46,0xC4A9:0x2B47,0xC4B5:0x2B48,0xC4B7:0x2B49,
0xC4BA:0x2B4A,0xC4BE:0x2B4B,0xC4BC:0x2B4C,0xC584:0x2B4D,0xC588:0x2B4E,
0xC586:0x2B4F,0xC3B1:0x2B50,0xC3B3:0x2B51,0xC3B2:0x2B52,0xC3B6:0x2B53,
0xC3B4:0x2B54,0xC792:0x2B55,0xC591:0x2B56,0xC58D:0x2B57,0xC3B5:0x2B58,
0xC595:0x2B59,0xC599:0x2B5A,0xC597:0x2B5B,0xC59B:0x2B5C,0xC59D:0x2B5D,
0xC5A1:0x2B5E,0xC59F:0x2B5F,0xC5A5:0x2B60,0xC5A3:0x2B61,0xC3BA:0x2B62,
0xC3B9:0x2B63,0xC3BC:0x2B64,0xC3BB:0x2B65,0xC5AD:0x2B66,0xC794:0x2B67,
0xC5B1:0x2B68,0xC5AB:0x2B69,0xC5B3:0x2B6A,0xC5AF:0x2B6B,0xC5A9:0x2B6C,
0xC798:0x2B6D,0xC79C:0x2B6E,0xC79A:0x2B6F,0xC796:0x2B70,0xC5B5:0x2B71,
0xC3BD:0x2B72,0xC3BF:0x2B73,0xC5B7:0x2B74,0xC5BA:0x2B75,0xC5BE:0x2B76,
0xC5BC:0x2B77,
0xE4B882:0x3021,0xE4B884:0x3022,0xE4B885:0x3023,0xE4B88C:0x3024,
0xE4B892:0x3025,0xE4B89F:0x3026,0xE4B8A3:0x3027,0xE4B8A4:0x3028,0xE4B8A8:0x3029,
0xE4B8AB:0x302A,0xE4B8AE:0x302B,0xE4B8AF:0x302C,0xE4B8B0:0x302D,0xE4B8B5:0x302E,
0xE4B980:0x302F,0xE4B981:0x3030,0xE4B984:0x3031,0xE4B987:0x3032,0xE4B991:0x3033,
0xE4B99A:0x3034,0xE4B99C:0x3035,0xE4B9A3:0x3036,0xE4B9A8:0x3037,0xE4B9A9:0x3038,
0xE4B9B4:0x3039,0xE4B9B5:0x303A,0xE4B9B9:0x303B,0xE4B9BF:0x303C,0xE4BA8D:0x303D,
0xE4BA96:0x303E,0xE4BA97:0x303F,0xE4BA9D:0x3040,0xE4BAAF:0x3041,0xE4BAB9:0x3042,
0xE4BB83:0x3043,0xE4BB90:0x3044,0xE4BB9A:0x3045,0xE4BB9B:0x3046,0xE4BBA0:0x3047,
0xE4BBA1:0x3048,0xE4BBA2:0x3049,0xE4BBA8:0x304A,0xE4BBAF:0x304B,0xE4BBB1:0x304C,
0xE4BBB3:0x304D,0xE4BBB5:0x304E,0xE4BBBD:0x304F,0xE4BBBE:0x3050,0xE4BBBF:0x3051,
0xE4BC80:0x3052,0xE4BC82:0x3053,0xE4BC83:0x3054,0xE4BC88:0x3055,0xE4BC8B:0x3056,
0xE4BC8C:0x3057,0xE4BC92:0x3058,0xE4BC95:0x3059,0xE4BC96:0x305A,0xE4BC97:0x305B,
0xE4BC99:0x305C,0xE4BCAE:0x305D,0xE4BCB1:0x305E,0xE4BDA0:0x305F,0xE4BCB3:0x3060,
0xE4BCB5:0x3061,0xE4BCB7:0x3062,0xE4BCB9:0x3063,0xE4BCBB:0x3064,0xE4BCBE:0x3065,
0xE4BD80:0x3066,0xE4BD82:0x3067,0xE4BD88:0x3068,0xE4BD89:0x3069,0xE4BD8B:0x306A,
0xE4BD8C:0x306B,0xE4BD92:0x306C,0xE4BD94:0x306D,0xE4BD96:0x306E,0xE4BD98:0x306F,
0xE4BD9F:0x3070,0xE4BDA3:0x3071,0xE4BDAA:0x3072,0xE4BDAC:0x3073,0xE4BDAE:0x3074,
0xE4BDB1:0x3075,0xE4BDB7:0x3076,0xE4BDB8:0x3077,0xE4BDB9:0x3078,0xE4BDBA:0x3079,
0xE4BDBD:0x307A,0xE4BDBE:0x307B,0xE4BE81:0x307C,0xE4BE82:0x307D,0xE4BE84:0x307E,
0xE4BE85:0x3121,0xE4BE89:0x3122,0xE4BE8A:0x3123,0xE4BE8C:0x3124,0xE4BE8E:0x3125,
0xE4BE90:0x3126,0xE4BE92:0x3127,0xE4BE93:0x3128,0xE4BE94:0x3129,0xE4BE97:0x312A,
0xE4BE99:0x312B,0xE4BE9A:0x312C,0xE4BE9E:0x312D,0xE4BE9F:0x312E,0xE4BEB2:0x312F,
0xE4BEB7:0x3130,0xE4BEB9:0x3131,0xE4BEBB:0x3132,0xE4BEBC:0x3133,0xE4BEBD:0x3134,
0xE4BEBE:0x3135,0xE4BF80:0x3136,0xE4BF81:0x3137,0xE4BF85:0x3138,0xE4BF86:0x3139,
0xE4BF88:0x313A,0xE4BF89:0x313B,0xE4BF8B:0x313C,0xE4BF8C:0x313D,0xE4BF8D:0x313E,
0xE4BF8F:0x313F,0xE4BF92:0x3140,0xE4BF9C:0x3141,0xE4BFA0:0x3142,0xE4BFA2:0x3143,
0xE4BFB0:0x3144,0xE4BFB2:0x3145,0xE4BFBC:0x3146,0xE4BFBD:0x3147,0xE4BFBF:0x3148,
0xE58080:0x3149,0xE58081:0x314A,0xE58084:0x314B,0xE58087:0x314C,0xE5808A:0x314D,
0xE5808C:0x314E,0xE5808E:0x314F,0xE58090:0x3150,0xE58093:0x3151,0xE58097:0x3152,
0xE58098:0x3153,0xE5809B:0x3154,0xE5809C:0x3155,0xE5809D:0x3156,0xE5809E:0x3157,
0xE580A2:0x3158,0xE580A7:0x3159,0xE580AE:0x315A,0xE580B0:0x315B,0xE580B2:0x315C,
0xE580B3:0x315D,0xE580B5:0x315E,0xE58180:0x315F,0xE58181:0x3160,0xE58182:0x3161,
0xE58185:0x3162,0xE58186:0x3163,0xE5818A:0x3164,0xE5818C:0x3165,0xE5818E:0x3166,
0xE58191:0x3167,0xE58192:0x3168,0xE58193:0x3169,0xE58197:0x316A,0xE58199:0x316B,
0xE5819F:0x316C,0xE581A0:0x316D,0xE581A2:0x316E,0xE581A3:0x316F,0xE581A6:0x3170,
0xE581A7:0x3171,0xE581AA:0x3172,0xE581AD:0x3173,0xE581B0:0x3174,0xE581B1:0x3175,
0xE580BB:0x3176,0xE58281:0x3177,0xE58283:0x3178,0xE58284:0x3179,0xE58286:0x317A,
0xE5828A:0x317B,0xE5828E:0x317C,0xE5828F:0x317D,0xE58290:0x317E,0xE58292:0x3221,
0xE58293:0x3222,0xE58294:0x3223,0xE58296:0x3224,0xE5829B:0x3225,0xE5829C:0x3226,
0xE5829E:0x3227,0xE5829F:0x3228,0xE582A0:0x3229,0xE582A1:0x322A,0xE582A2:0x322B,
0xE582AA:0x322C,0xE582AF:0x322D,0xE582B0:0x322E,0xE582B9:0x322F,0xE582BA:0x3230,
0xE582BD:0x3231,0xE58380:0x3232,0xE58383:0x3233,0xE58384:0x3234,0xE58387:0x3235,
0xE5838C:0x3236,0xE5838E:0x3237,0xE58390:0x3238,0xE58393:0x3239,0xE58394:0x323A,
0xE58398:0x323B,0xE5839C:0x323C,0xE5839D:0x323D,0xE5839F:0x323E,0xE583A2:0x323F,
0xE583A4:0x3240,0xE583A6:0x3241,0xE583A8:0x3242,0xE583A9:0x3243,0xE583AF:0x3244,
0xE583B1:0x3245,0xE583B6:0x3246,0xE583BA:0x3247,0xE583BE:0x3248,0xE58483:0x3249,
0xE58486:0x324A,0xE58487:0x324B,0xE58488:0x324C,0xE5848B:0x324D,0xE5848C:0x324E,
0xE5848D:0x324F,0xE5848E:0x3250,0xE583B2:0x3251,0xE58490:0x3252,0xE58497:0x3253,
0xE58499:0x3254,0xE5849B:0x3255,0xE5849C:0x3256,0xE5849D:0x3257,0xE5849E:0x3258,
0xE584A3:0x3259,0xE584A7:0x325A,0xE584A8:0x325B,0xE584AC:0x325C,0xE584AD:0x325D,
0xE584AF:0x325E,0xE584B1:0x325F,0xE584B3:0x3260,0xE584B4:0x3261,0xE584B5:0x3262,
0xE584B8:0x3263,0xE584B9:0x3264,0xE58582:0x3265,0xE5858A:0x3266,0xE5858F:0x3267,
0xE58593:0x3268,0xE58595:0x3269,0xE58597:0x326A,0xE58598:0x326B,0xE5859F:0x326C,
0xE585A4:0x326D,0xE585A6:0x326E,0xE585BE:0x326F,0xE58683:0x3270,0xE58684:0x3271,
0xE5868B:0x3272,0xE5868E:0x3273,0xE58698:0x3274,0xE5869D:0x3275,0xE586A1:0x3276,
0xE586A3:0x3277,0xE586AD:0x3278,0xE586B8:0x3279,0xE586BA:0x327A,0xE586BC:0x327B,
0xE586BE:0x327C,0xE586BF:0x327D,0xE58782:0x327E,0xE58788:0x3321,0xE5878F:0x3322,
0xE58791:0x3323,0xE58792:0x3324,0xE58793:0x3325,0xE58795:0x3326,0xE58798:0x3327,
0xE5879E:0x3328,0xE587A2:0x3329,0xE587A5:0x332A,0xE587AE:0x332B,0xE587B2:0x332C,
0xE587B3:0x332D,0xE587B4:0x332E,0xE587B7:0x332F,0xE58881:0x3330,0xE58882:0x3331,
0xE58885:0x3332,0xE58892:0x3333,0xE58893:0x3334,0xE58895:0x3335,0xE58896:0x3336,
0xE58898:0x3337,0xE588A2:0x3338,0xE588A8:0x3339,0xE588B1:0x333A,0xE588B2:0x333B,
0xE588B5:0x333C,0xE588BC:0x333D,0xE58985:0x333E,0xE58989:0x333F,0xE58995:0x3340,
0xE58997:0x3341,0xE58998:0x3342,0xE5899A:0x3343,0xE5899C:0x3344,0xE5899F:0x3345,
0xE589A0:0x3346,0xE589A1:0x3347,0xE589A6:0x3348,0xE589AE:0x3349,0xE589B7:0x334A,
0xE589B8:0x334B,0xE589B9:0x334C,0xE58A80:0x334D,0xE58A82:0x334E,0xE58A85:0x334F,
0xE58A8A:0x3350,0xE58A8C:0x3351,0xE58A93:0x3352,0xE58A95:0x3353,0xE58A96:0x3354,
0xE58A97:0x3355,0xE58A98:0x3356,0xE58A9A:0x3357,0xE58A9C:0x3358,0xE58AA4:0x3359,
0xE58AA5:0x335A,0xE58AA6:0x335B,0xE58AA7:0x335C,0xE58AAF:0x335D,0xE58AB0:0x335E,
0xE58AB6:0x335F,0xE58AB7:0x3360,0xE58AB8:0x3361,0xE58ABA:0x3362,0xE58ABB:0x3363,
0xE58ABD:0x3364,0xE58B80:0x3365,0xE58B84:0x3366,0xE58B86:0x3367,0xE58B88:0x3368,
0xE58B8C:0x3369,0xE58B8F:0x336A,0xE58B91:0x336B,0xE58B94:0x336C,0xE58B96:0x336D,
0xE58B9B:0x336E,0xE58B9C:0x336F,0xE58BA1:0x3370,0xE58BA5:0x3371,0xE58BA8:0x3372,
0xE58BA9:0x3373,0xE58BAA:0x3374,0xE58BAC:0x3375,0xE58BB0:0x3376,0xE58BB1:0x3377,
0xE58BB4:0x3378,0xE58BB6:0x3379,0xE58BB7:0x337A,0xE58C80:0x337B,0xE58C83:0x337C,
0xE58C8A:0x337D,0xE58C8B:0x337E,0xE58C8C:0x3421,0xE58C91:0x3422,0xE58C93:0x3423,
0xE58C98:0x3424,0xE58C9B:0x3425,0xE58C9C:0x3426,0xE58C9E:0x3427,0xE58C9F:0x3428,
0xE58CA5:0x3429,0xE58CA7:0x342A,0xE58CA8:0x342B,0xE58CA9:0x342C,0xE58CAB:0x342D,
0xE58CAC:0x342E,0xE58CAD:0x342F,0xE58CB0:0x3430,0xE58CB2:0x3431,0xE58CB5:0x3432,
0xE58CBC:0x3433,0xE58CBD:0x3434,0xE58CBE:0x3435,0xE58D82:0x3436,0xE58D8C:0x3437,
0xE58D8B:0x3438,0xE58D99:0x3439,0xE58D9B:0x343A,0xE58DA1:0x343B,0xE58DA3:0x343C,
0xE58DA5:0x343D,0xE58DAC:0x343E,0xE58DAD:0x343F,0xE58DB2:0x3440,0xE58DB9:0x3441,
0xE58DBE:0x3442,0xE58E83:0x3443,0xE58E87:0x3444,0xE58E88:0x3445,0xE58E8E:0x3446,
0xE58E93:0x3447,0xE58E94:0x3448,0xE58E99:0x3449,0xE58E9D:0x344A,0xE58EA1:0x344B,
0xE58EA4:0x344C,0xE58EAA:0x344D,0xE58EAB:0x344E,0xE58EAF:0x344F,0xE58EB2:0x3450,
0xE58EB4:0x3451,0xE58EB5:0x3452,0xE58EB7:0x3453,0xE58EB8:0x3454,0xE58EBA:0x3455,
0xE58EBD:0x3456,0xE58F80:0x3457,0xE58F85:0x3458,0xE58F8F:0x3459,0xE58F92:0x345A,
0xE58F93:0x345B,0xE58F95:0x345C,0xE58F9A:0x345D,0xE58F9D:0x345E,0xE58F9E:0x345F,
0xE58FA0:0x3460,0xE58FA6:0x3461,0xE58FA7:0x3462,0xE58FB5:0x3463,0xE59082:0x3464,
0xE59093:0x3465,0xE5909A:0x3466,0xE590A1:0x3467,0xE590A7:0x3468,0xE590A8:0x3469,
0xE590AA:0x346A,0xE590AF:0x346B,0xE590B1:0x346C,0xE590B4:0x346D,0xE590B5:0x346E,
0xE59183:0x346F,0xE59184:0x3470,0xE59187:0x3471,0xE5918D:0x3472,0xE5918F:0x3473,
0xE5919E:0x3474,0xE591A2:0x3475,0xE591A4:0x3476,0xE591A6:0x3477,0xE591A7:0x3478,
0xE591A9:0x3479,0xE591AB:0x347A,0xE591AD:0x347B,0xE591AE:0x347C,0xE591B4:0x347D,
0xE591BF:0x347E,0xE59281:0x3521,0xE59283:0x3522,0xE59285:0x3523,0xE59288:0x3524,
0xE59289:0x3525,0xE5928D:0x3526,0xE59291:0x3527,0xE59295:0x3528,0xE59296:0x3529,
0xE5929C:0x352A,0xE5929F:0x352B,0xE592A1:0x352C,0xE592A6:0x352D,0xE592A7:0x352E,
0xE592A9:0x352F,0xE592AA:0x3530,0xE592AD:0x3531,0xE592AE:0x3532,0xE592B1:0x3533,
0xE592B7:0x3534,0xE592B9:0x3535,0xE592BA:0x3536,0xE592BB:0x3537,0xE592BF:0x3538,
0xE59386:0x3539,0xE5938A:0x353A,0xE5938D:0x353B,0xE5938E:0x353C,0xE593A0:0x353D,
0xE593AA:0x353E,0xE593AC:0x353F,0xE593AF:0x3540,0xE593B6:0x3541,0xE593BC:0x3542,
0xE593BE:0x3543,0xE593BF:0x3544,0xE59480:0x3545,0xE59481:0x3546,0xE59485:0x3547,
0xE59488:0x3548,0xE59489:0x3549,0xE5948C:0x354A,0xE5948D:0x354B,0xE5948E:0x354C,
0xE59495:0x354D,0xE594AA:0x354E,0xE594AB:0x354F,0xE594B2:0x3550,0xE594B5:0x3551,
0xE594B6:0x3552,0xE594BB:0x3553,0xE594BC:0x3554,0xE594BD:0x3555,0xE59581:0x3556,
0xE59587:0x3557,0xE59589:0x3558,0xE5958A:0x3559,0xE5958D:0x355A,0xE59590:0x355B,
0xE59591:0x355C,0xE59598:0x355D,0xE5959A:0x355E,0xE5959B:0x355F,0xE5959E:0x3560,
0xE595A0:0x3561,0xE595A1:0x3562,0xE595A4:0x3563,0xE595A6:0x3564,0xE595BF:0x3565,
0xE59681:0x3566,0xE59682:0x3567,0xE59686:0x3568,0xE59688:0x3569,0xE5968E:0x356A,
0xE5968F:0x356B,0xE59691:0x356C,0xE59692:0x356D,0xE59693:0x356E,0xE59694:0x356F,
0xE59697:0x3570,0xE596A3:0x3571,0xE596A4:0x3572,0xE596AD:0x3573,0xE596B2:0x3574,
0xE596BF:0x3575,0xE59781:0x3576,0xE59783:0x3577,0xE59786:0x3578,0xE59789:0x3579,
0xE5978B:0x357A,0xE5978C:0x357B,0xE5978E:0x357C,0xE59791:0x357D,0xE59792:0x357E,
0xE59793:0x3621,0xE59797:0x3622,0xE59798:0x3623,0xE5979B:0x3624,0xE5979E:0x3625,
0xE597A2:0x3626,0xE597A9:0x3627,0xE597B6:0x3628,0xE597BF:0x3629,0xE59885:0x362A,
0xE59888:0x362B,0xE5988A:0x362C,0xE5988D:0x362D,0xE5988E:0x362E,0xE5988F:0x362F,
0xE59890:0x3630,0xE59891:0x3631,0xE59892:0x3632,0xE59899:0x3633,0xE598AC:0x3634,
0xE598B0:0x3635,0xE598B3:0x3636,0xE598B5:0x3637,0xE598B7:0x3638,0xE598B9:0x3639,
0xE598BB:0x363A,0xE598BC:0x363B,0xE598BD:0x363C,0xE598BF:0x363D,0xE59980:0x363E,
0xE59981:0x363F,0xE59983:0x3640,0xE59984:0x3641,0xE59986:0x3642,0xE59989:0x3643,
0xE5998B:0x3644,0xE5998D:0x3645,0xE5998F:0x3646,0xE59994:0x3647,0xE5999E:0x3648,
0xE599A0:0x3649,0xE599A1:0x364A,0xE599A2:0x364B,0xE599A3:0x364C,0xE599A6:0x364D,
0xE599A9:0x364E,0xE599AD:0x364F,0xE599AF:0x3650,0xE599B1:0x3651,0xE599B2:0x3652,
0xE599B5:0x3653,0xE59A84:0x3654,0xE59A85:0x3655,0xE59A88:0x3656,0xE59A8B:0x3657,
0xE59A8C:0x3658,0xE59A95:0x3659,0xE59A99:0x365A,0xE59A9A:0x365B,0xE59A9D:0x365C,
0xE59A9E:0x365D,0xE59A9F:0x365E,0xE59AA6:0x365F,0xE59AA7:0x3660,0xE59AA8:0x3661,
0xE59AA9:0x3662,0xE59AAB:0x3663,0xE59AAC:0x3664,0xE59AAD:0x3665,0xE59AB1:0x3666,
0xE59AB3:0x3667,0xE59AB7:0x3668,0xE59ABE:0x3669,0xE59B85:0x366A,0xE59B89:0x366B,
0xE59B8A:0x366C,0xE59B8B:0x366D,0xE59B8F:0x366E,0xE59B90:0x366F,0xE59B8C:0x3670,
0xE59B8D:0x3671,0xE59B99:0x3672,0xE59B9C:0x3673,0xE59B9D:0x3674,0xE59B9F:0x3675,
0xE59BA1:0x3676,0xE59BA4:0x3677,0xE59BA5:0x3678,0xE59BA6:0x3679,0xE59BA7:0x367A,
0xE59BA8:0x367B,0xE59BB1:0x367C,0xE59BAB:0x367D,0xE59BAD:0x367E,0xE59BB6:0x3721,
0xE59BB7:0x3722,0xE59C81:0x3723,0xE59C82:0x3724,0xE59C87:0x3725,0xE59C8A:0x3726,
0xE59C8C:0x3727,0xE59C91:0x3728,0xE59C95:0x3729,0xE59C9A:0x372A,0xE59C9B:0x372B,
0xE59C9D:0x372C,0xE59CA0:0x372D,0xE59CA2:0x372E,0xE59CA3:0x372F,0xE59CA4:0x3730,
0xE59CA5:0x3731,0xE59CA9:0x3732,0xE59CAA:0x3733,0xE59CAC:0x3734,0xE59CAE:0x3735,
0xE59CAF:0x3736,0xE59CB3:0x3737,0xE59CB4:0x3738,0xE59CBD:0x3739,0xE59CBE:0x373A,
0xE59CBF:0x373B,0xE59D85:0x373C,0xE59D86:0x373D,0xE59D8C:0x373E,0xE59D8D:0x373F,
0xE59D92:0x3740,0xE59DA2:0x3741,0xE59DA5:0x3742,0xE59DA7:0x3743,0xE59DA8:0x3744,
0xE59DAB:0x3745,0xE59DAD:0x3746,0xE59DAE:0x3747,0xE59DAF:0x3748,0xE59DB0:0x3749,
0xE59DB1:0x374A,0xE59DB3:0x374B,0xE59DB4:0x374C,0xE59DB5:0x374D,0xE59DB7:0x374E,
0xE59DB9:0x374F,0xE59DBA:0x3750,0xE59DBB:0x3751,0xE59DBC:0x3752,0xE59DBE:0x3753,
0xE59E81:0x3754,0xE59E83:0x3755,0xE59E8C:0x3756,0xE59E94:0x3757,0xE59E97:0x3758,
0xE59E99:0x3759,0xE59E9A:0x375A,0xE59E9C:0x375B,0xE59E9D:0x375C,0xE59E9E:0x375D,
0xE59E9F:0x375E,0xE59EA1:0x375F,0xE59E95:0x3760,0xE59EA7:0x3761,0xE59EA8:0x3762,
0xE59EA9:0x3763,0xE59EAC:0x3764,0xE59EB8:0x3765,0xE59EBD:0x3766,0xE59F87:0x3767,
0xE59F88:0x3768,0xE59F8C:0x3769,0xE59F8F:0x376A,0xE59F95:0x376B,0xE59F9D:0x376C,
0xE59F9E:0x376D,0xE59FA4:0x376E,0xE59FA6:0x376F,0xE59FA7:0x3770,0xE59FA9:0x3771,
0xE59FAD:0x3772,0xE59FB0:0x3773,0xE59FB5:0x3774,0xE59FB6:0x3775,0xE59FB8:0x3776,
0xE59FBD:0x3777,0xE59FBE:0x3778,0xE59FBF:0x3779,0xE5A083:0x377A,0xE5A084:0x377B,
0xE5A088:0x377C,0xE5A089:0x377D,0xE59FA1:0x377E,0xE5A08C:0x3821,0xE5A08D:0x3822,
0xE5A09B:0x3823,0xE5A09E:0x3824,0xE5A09F:0x3825,0xE5A0A0:0x3826,0xE5A0A6:0x3827,
0xE5A0A7:0x3828,0xE5A0AD:0x3829,0xE5A0B2:0x382A,0xE5A0B9:0x382B,0xE5A0BF:0x382C,
0xE5A189:0x382D,0xE5A18C:0x382E,0xE5A18D:0x382F,0xE5A18F:0x3830,0xE5A190:0x3831,
0xE5A195:0x3832,0xE5A19F:0x3833,0xE5A1A1:0x3834,0xE5A1A4:0x3835,0xE5A1A7:0x3836,
0xE5A1A8:0x3837,0xE5A1B8:0x3838,0xE5A1BC:0x3839,0xE5A1BF:0x383A,0xE5A280:0x383B,
0xE5A281:0x383C,0xE5A287:0x383D,0xE5A288:0x383E,0xE5A289:0x383F,0xE5A28A:0x3840,
0xE5A28C:0x3841,0xE5A28D:0x3842,0xE5A28F:0x3843,0xE5A290:0x3844,0xE5A294:0x3845,
0xE5A296:0x3846,0xE5A29D:0x3847,0xE5A2A0:0x3848,0xE5A2A1:0x3849,0xE5A2A2:0x384A,
0xE5A2A6:0x384B,0xE5A2A9:0x384C,0xE5A2B1:0x384D,0xE5A2B2:0x384E,0xE5A384:0x384F,
0xE5A2BC:0x3850,0xE5A382:0x3851,0xE5A388:0x3852,0xE5A38D:0x3853,0xE5A38E:0x3854,
0xE5A390:0x3855,0xE5A392:0x3856,0xE5A394:0x3857,0xE5A396:0x3858,0xE5A39A:0x3859,
0xE5A39D:0x385A,0xE5A3A1:0x385B,0xE5A3A2:0x385C,0xE5A3A9:0x385D,0xE5A3B3:0x385E,
0xE5A485:0x385F,0xE5A486:0x3860,0xE5A48B:0x3861,0xE5A48C:0x3862,0xE5A492:0x3863,
0xE5A493:0x3864,0xE5A494:0x3865,0xE89981:0x3866,0xE5A49D:0x3867,0xE5A4A1:0x3868,
0xE5A4A3:0x3869,0xE5A4A4:0x386A,0xE5A4A8:0x386B,0xE5A4AF:0x386C,0xE5A4B0:0x386D,
0xE5A4B3:0x386E,0xE5A4B5:0x386F,0xE5A4B6:0x3870,0xE5A4BF:0x3871,0xE5A583:0x3872,
0xE5A586:0x3873,0xE5A592:0x3874,0xE5A593:0x3875,0xE5A599:0x3876,0xE5A59B:0x3877,
0xE5A59D:0x3878,0xE5A59E:0x3879,0xE5A59F:0x387A,0xE5A5A1:0x387B,0xE5A5A3:0x387C,
0xE5A5AB:0x387D,0xE5A5AD:0x387E,0xE5A5AF:0x3921,0xE5A5B2:0x3922,0xE5A5B5:0x3923,
0xE5A5B6:0x3924,0xE5A5B9:0x3925,0xE5A5BB:0x3926,0xE5A5BC:0x3927,0xE5A68B:0x3928,
0xE5A68C:0x3929,0xE5A68E:0x392A,0xE5A692:0x392B,0xE5A695:0x392C,0xE5A697:0x392D,
0xE5A69F:0x392E,0xE5A6A4:0x392F,0xE5A6A7:0x3930,0xE5A6AD:0x3931,0xE5A6AE:0x3932,
0xE5A6AF:0x3933,0xE5A6B0:0x3934,0xE5A6B3:0x3935,0xE5A6B7:0x3936,0xE5A6BA:0x3937,
0xE5A6BC:0x3938,0xE5A781:0x3939,0xE5A783:0x393A,0xE5A784:0x393B,0xE5A788:0x393C,
0xE5A78A:0x393D,0xE5A78D:0x393E,0xE5A792:0x393F,0xE5A79D:0x3940,0xE5A79E:0x3941,
0xE5A79F:0x3942,0xE5A7A3:0x3943,0xE5A7A4:0x3944,0xE5A7A7:0x3945,0xE5A7AE:0x3946,
0xE5A7AF:0x3947,0xE5A7B1:0x3948,0xE5A7B2:0x3949,0xE5A7B4:0x394A,0xE5A7B7:0x394B,
0xE5A880:0x394C,0xE5A884:0x394D,0xE5A88C:0x394E,0xE5A88D:0x394F,0xE5A88E:0x3950,
0xE5A892:0x3951,0xE5A893:0x3952,0xE5A89E:0x3953,0xE5A8A3:0x3954,0xE5A8A4:0x3955,
0xE5A8A7:0x3956,0xE5A8A8:0x3957,0xE5A8AA:0x3958,0xE5A8AD:0x3959,0xE5A8B0:0x395A,
0xE5A984:0x395B,0xE5A985:0x395C,0xE5A987:0x395D,0xE5A988:0x395E,0xE5A98C:0x395F,
0xE5A990:0x3960,0xE5A995:0x3961,0xE5A99E:0x3962,0xE5A9A3:0x3963,0xE5A9A5:0x3964,
0xE5A9A7:0x3965,0xE5A9AD:0x3966,0xE5A9B7:0x3967,0xE5A9BA:0x3968,0xE5A9BB:0x3969,
0xE5A9BE:0x396A,0xE5AA8B:0x396B,0xE5AA90:0x396C,0xE5AA93:0x396D,0xE5AA96:0x396E,
0xE5AA99:0x396F,0xE5AA9C:0x3970,0xE5AA9E:0x3971,0xE5AA9F:0x3972,0xE5AAA0:0x3973,
0xE5AAA2:0x3974,0xE5AAA7:0x3975,0xE5AAAC:0x3976,0xE5AAB1:0x3977,0xE5AAB2:0x3978,
0xE5AAB3:0x3979,0xE5AAB5:0x397A,0xE5AAB8:0x397B,0xE5AABA:0x397C,0xE5AABB:0x397D,
0xE5AABF:0x397E,0xE5AB84:0x3A21,0xE5AB86:0x3A22,0xE5AB88:0x3A23,0xE5AB8F:0x3A24,
0xE5AB9A:0x3A25,0xE5AB9C:0x3A26,0xE5ABA0:0x3A27,0xE5ABA5:0x3A28,0xE5ABAA:0x3A29,
0xE5ABAE:0x3A2A,0xE5ABB5:0x3A2B,0xE5ABB6:0x3A2C,0xE5ABBD:0x3A2D,0xE5AC80:0x3A2E,
0xE5AC81:0x3A2F,0xE5AC88:0x3A30,0xE5AC97:0x3A31,0xE5ACB4:0x3A32,0xE5AC99:0x3A33,
0xE5AC9B:0x3A34,0xE5AC9D:0x3A35,0xE5ACA1:0x3A36,0xE5ACA5:0x3A37,0xE5ACAD:0x3A38,
0xE5ACB8:0x3A39,0xE5AD81:0x3A3A,0xE5AD8B:0x3A3B,0xE5AD8C:0x3A3C,0xE5AD92:0x3A3D,
0xE5AD96:0x3A3E,0xE5AD9E:0x3A3F,0xE5ADA8:0x3A40,0xE5ADAE:0x3A41,0xE5ADAF:0x3A42,
0xE5ADBC:0x3A43,0xE5ADBD:0x3A44,0xE5ADBE:0x3A45,0xE5ADBF:0x3A46,0xE5AE81:0x3A47,
0xE5AE84:0x3A48,0xE5AE86:0x3A49,0xE5AE8A:0x3A4A,0xE5AE8E:0x3A4B,0xE5AE90:0x3A4C,
0xE5AE91:0x3A4D,0xE5AE93:0x3A4E,0xE5AE94:0x3A4F,0xE5AE96:0x3A50,0xE5AEA8:0x3A51,
0xE5AEA9:0x3A52,0xE5AEAC:0x3A53,0xE5AEAD:0x3A54,0xE5AEAF:0x3A55,0xE5AEB1:0x3A56,
0xE5AEB2:0x3A57,0xE5AEB7:0x3A58,0xE5AEBA:0x3A59,0xE5AEBC:0x3A5A,0xE5AF80:0x3A5B,
0xE5AF81:0x3A5C,0xE5AF8D:0x3A5D,0xE5AF8F:0x3A5E,0xE5AF96:0x3A5F,0xE5AF97:0x3A60,
0xE5AF98:0x3A61,0xE5AF99:0x3A62,0xE5AF9A:0x3A63,0xE5AFA0:0x3A64,0xE5AFAF:0x3A65,
0xE5AFB1:0x3A66,0xE5AFB4:0x3A67,0xE5AFBD:0x3A68,0xE5B08C:0x3A69,0xE5B097:0x3A6A,
0xE5B09E:0x3A6B,0xE5B09F:0x3A6C,0xE5B0A3:0x3A6D,0xE5B0A6:0x3A6E,0xE5B0A9:0x3A6F,
0xE5B0AB:0x3A70,0xE5B0AC:0x3A71,0xE5B0AE:0x3A72,0xE5B0B0:0x3A73,0xE5B0B2:0x3A74,
0xE5B0B5:0x3A75,0xE5B0B6:0x3A76,0xE5B199:0x3A77,0xE5B19A:0x3A78,0xE5B19C:0x3A79,
0xE5B1A2:0x3A7A,0xE5B1A3:0x3A7B,0xE5B1A7:0x3A7C,0xE5B1A8:0x3A7D,0xE5B1A9:0x3A7E,
0xE5B1AD:0x3B21,0xE5B1B0:0x3B22,0xE5B1B4:0x3B23,0xE5B1B5:0x3B24,0xE5B1BA:0x3B25,
0xE5B1BB:0x3B26,0xE5B1BC:0x3B27,0xE5B1BD:0x3B28,0xE5B287:0x3B29,0xE5B288:0x3B2A,
0xE5B28A:0x3B2B,0xE5B28F:0x3B2C,0xE5B292:0x3B2D,0xE5B29D:0x3B2E,0xE5B29F:0x3B2F,
0xE5B2A0:0x3B30,0xE5B2A2:0x3B31,0xE5B2A3:0x3B32,0xE5B2A6:0x3B33,0xE5B2AA:0x3B34,
0xE5B2B2:0x3B35,0xE5B2B4:0x3B36,0xE5B2B5:0x3B37,0xE5B2BA:0x3B38,0xE5B389:0x3B39,
0xE5B38B:0x3B3A,0xE5B392:0x3B3B,0xE5B39D:0x3B3C,0xE5B397:0x3B3D,0xE5B3AE:0x3B3E,
0xE5B3B1:0x3B3F,0xE5B3B2:0x3B40,0xE5B3B4:0x3B41,0xE5B481:0x3B42,0xE5B486:0x3B43,
0xE5B48D:0x3B44,0xE5B492:0x3B45,0xE5B4AB:0x3B46,0xE5B4A3:0x3B47,0xE5B4A4:0x3B48,
0xE5B4A6:0x3B49,0xE5B4A7:0x3B4A,0xE5B4B1:0x3B4B,0xE5B4B4:0x3B4C,0xE5B4B9:0x3B4D,
0xE5B4BD:0x3B4E,0xE5B4BF:0x3B4F,0xE5B582:0x3B50,0xE5B583:0x3B51,0xE5B586:0x3B52,
0xE5B588:0x3B53,0xE5B595:0x3B54,0xE5B591:0x3B55,0xE5B599:0x3B56,0xE5B58A:0x3B57,
0xE5B59F:0x3B58,0xE5B5A0:0x3B59,0xE5B5A1:0x3B5A,0xE5B5A2:0x3B5B,0xE5B5A4:0x3B5C,
0xE5B5AA:0x3B5D,0xE5B5AD:0x3B5E,0xE5B5B0:0x3B5F,0xE5B5B9:0x3B60,0xE5B5BA:0x3B61,
0xE5B5BE:0x3B62,0xE5B5BF:0x3B63,0xE5B681:0x3B64,0xE5B683:0x3B65,0xE5B688:0x3B66,
0xE5B68A:0x3B67,0xE5B692:0x3B68,0xE5B693:0x3B69,0xE5B694:0x3B6A,0xE5B695:0x3B6B,
0xE5B699:0x3B6C,0xE5B69B:0x3B6D,0xE5B69F:0x3B6E,0xE5B6A0:0x3B6F,0xE5B6A7:0x3B70,
0xE5B6AB:0x3B71,0xE5B6B0:0x3B72,0xE5B6B4:0x3B73,0xE5B6B8:0x3B74,0xE5B6B9:0x3B75,
0xE5B783:0x3B76,0xE5B787:0x3B77,0xE5B78B:0x3B78,0xE5B790:0x3B79,0xE5B78E:0x3B7A,
0xE5B798:0x3B7B,0xE5B799:0x3B7C,0xE5B7A0:0x3B7D,0xE5B7A4:0x3B7E,0xE5B7A9:0x3C21,
0xE5B7B8:0x3C22,0xE5B7B9:0x3C23,0xE5B880:0x3C24,0xE5B887:0x3C25,0xE5B88D:0x3C26,
0xE5B892:0x3C27,0xE5B894:0x3C28,0xE5B895:0x3C29,0xE5B898:0x3C2A,0xE5B89F:0x3C2B,
0xE5B8A0:0x3C2C,0xE5B8AE:0x3C2D,0xE5B8A8:0x3C2E,0xE5B8B2:0x3C2F,0xE5B8B5:0x3C30,
0xE5B8BE:0x3C31,0xE5B98B:0x3C32,0xE5B990:0x3C33,0xE5B989:0x3C34,0xE5B991:0x3C35,
0xE5B996:0x3C36,0xE5B998:0x3C37,0xE5B99B:0x3C38,0xE5B99C:0x3C39,0xE5B99E:0x3C3A,
0xE5B9A8:0x3C3B,0xE5B9AA:0x3C3C,0xE5B9AB:0x3C3D,0xE5B9AC:0x3C3E,0xE5B9AD:0x3C3F,
0xE5B9AE:0x3C40,0xE5B9B0:0x3C41,0xE5BA80:0x3C42,0xE5BA8B:0x3C43,0xE5BA8E:0x3C44,
0xE5BAA2:0x3C45,0xE5BAA4:0x3C46,0xE5BAA5:0x3C47,0xE5BAA8:0x3C48,0xE5BAAA:0x3C49,
0xE5BAAC:0x3C4A,0xE5BAB1:0x3C4B,0xE5BAB3:0x3C4C,0xE5BABD:0x3C4D,0xE5BABE:0x3C4E,
0xE5BABF:0x3C4F,0xE5BB86:0x3C50,0xE5BB8C:0x3C51,0xE5BB8B:0x3C52,0xE5BB8E:0x3C53,
0xE5BB91:0x3C54,0xE5BB92:0x3C55,0xE5BB94:0x3C56,0xE5BB95:0x3C57,0xE5BB9C:0x3C58,
0xE5BB9E:0x3C59,0xE5BBA5:0x3C5A,0xE5BBAB:0x3C5B,0xE5BC82:0x3C5C,0xE5BC86:0x3C5D,
0xE5BC87:0x3C5E,0xE5BC88:0x3C5F,0xE5BC8E:0x3C60,0xE5BC99:0x3C61,0xE5BC9C:0x3C62,
0xE5BC9D:0x3C63,0xE5BCA1:0x3C64,0xE5BCA2:0x3C65,0xE5BCA3:0x3C66,0xE5BCA4:0x3C67,
0xE5BCA8:0x3C68,0xE5BCAB:0x3C69,0xE5BCAC:0x3C6A,0xE5BCAE:0x3C6B,0xE5BCB0:0x3C6C,
0xE5BCB4:0x3C6D,0xE5BCB6:0x3C6E,0xE5BCBB:0x3C6F,0xE5BCBD:0x3C70,0xE5BCBF:0x3C71,
0xE5BD80:0x3C72,0xE5BD84:0x3C73,0xE5BD85:0x3C74,0xE5BD87:0x3C75,0xE5BD8D:0x3C76,
0xE5BD90:0x3C77,0xE5BD94:0x3C78,0xE5BD98:0x3C79,0xE5BD9B:0x3C7A,0xE5BDA0:0x3C7B,
0xE5BDA3:0x3C7C,0xE5BDA4:0x3C7D,0xE5BDA7:0x3C7E,0xE5BDAF:0x3D21,0xE5BDB2:0x3D22,
0xE5BDB4:0x3D23,0xE5BDB5:0x3D24,0xE5BDB8:0x3D25,0xE5BDBA:0x3D26,0xE5BDBD:0x3D27,
0xE5BDBE:0x3D28,0xE5BE89:0x3D29,0xE5BE8D:0x3D2A,0xE5BE8F:0x3D2B,0xE5BE96:0x3D2C,
0xE5BE9C:0x3D2D,0xE5BE9D:0x3D2E,0xE5BEA2:0x3D2F,0xE5BEA7:0x3D30,0xE5BEAB:0x3D31,
0xE5BEA4:0x3D32,0xE5BEAC:0x3D33,0xE5BEAF:0x3D34,0xE5BEB0:0x3D35,0xE5BEB1:0x3D36,
0xE5BEB8:0x3D37,0xE5BF84:0x3D38,0xE5BF87:0x3D39,0xE5BF88:0x3D3A,0xE5BF89:0x3D3B,
0xE5BF8B:0x3D3C,0xE5BF90:0x3D3D,0xE5BF91:0x3D3E,0xE5BF92:0x3D3F,0xE5BF93:0x3D40,
0xE5BF94:0x3D41,0xE5BF9E:0x3D42,0xE5BFA1:0x3D43,0xE5BFA2:0x3D44,0xE5BFA8:0x3D45,
0xE5BFA9:0x3D46,0xE5BFAA:0x3D47,0xE5BFAC:0x3D48,0xE5BFAD:0x3D49,0xE5BFAE:0x3D4A,
0xE5BFAF:0x3D4B,0xE5BFB2:0x3D4C,0xE5BFB3:0x3D4D,0xE5BFB6:0x3D4E,0xE5BFBA:0x3D4F,
0xE5BFBC:0x3D50,0xE68087:0x3D51,0xE6808A:0x3D52,0xE6808D:0x3D53,0xE68093:0x3D54,
0xE68094:0x3D55,0xE68097:0x3D56,0xE68098:0x3D57,0xE6809A:0x3D58,0xE6809F:0x3D59,
0xE680A4:0x3D5A,0xE680AD:0x3D5B,0xE680B3:0x3D5C,0xE680B5:0x3D5D,0xE68180:0x3D5E,
0xE68187:0x3D5F,0xE68188:0x3D60,0xE68189:0x3D61,0xE6818C:0x3D62,0xE68191:0x3D63,
0xE68194:0x3D64,0xE68196:0x3D65,0xE68197:0x3D66,0xE6819D:0x3D67,0xE681A1:0x3D68,
0xE681A7:0x3D69,0xE681B1:0x3D6A,0xE681BE:0x3D6B,0xE681BF:0x3D6C,0xE68282:0x3D6D,
0xE68286:0x3D6E,0xE68288:0x3D6F,0xE6828A:0x3D70,0xE6828E:0x3D71,0xE68291:0x3D72,
0xE68293:0x3D73,0xE68295:0x3D74,0xE68298:0x3D75,0xE6829D:0x3D76,0xE6829E:0x3D77,
0xE682A2:0x3D78,0xE682A4:0x3D79,0xE682A5:0x3D7A,0xE682A8:0x3D7B,0xE682B0:0x3D7C,
0xE682B1:0x3D7D,0xE682B7:0x3D7E,0xE682BB:0x3E21,0xE682BE:0x3E22,0xE68382:0x3E23,
0xE68384:0x3E24,0xE68388:0x3E25,0xE68389:0x3E26,0xE6838A:0x3E27,0xE6838B:0x3E28,
0xE6838E:0x3E29,0xE6838F:0x3E2A,0xE68394:0x3E2B,0xE68395:0x3E2C,0xE68399:0x3E2D,
0xE6839B:0x3E2E,0xE6839D:0x3E2F,0xE6839E:0x3E30,0xE683A2:0x3E31,0xE683A5:0x3E32,
0xE683B2:0x3E33,0xE683B5:0x3E34,0xE683B8:0x3E35,0xE683BC:0x3E36,0xE683BD:0x3E37,
0xE68482:0x3E38,0xE68487:0x3E39,0xE6848A:0x3E3A,0xE6848C:0x3E3B,0xE68490:0x3E3C,
0xE68491:0x3E3D,0xE68492:0x3E3E,0xE68493:0x3E3F,0xE68494:0x3E40,0xE68496:0x3E41,
0xE68497:0x3E42,0xE68499:0x3E43,0xE6849C:0x3E44,0xE6849E:0x3E45,0xE684A2:0x3E46,
0xE684AA:0x3E47,0xE684AB:0x3E48,0xE684B0:0x3E49,0xE684B1:0x3E4A,0xE684B5:0x3E4B,
0xE684B6:0x3E4C,0xE684B7:0x3E4D,0xE684B9:0x3E4E,0xE68581:0x3E4F,0xE68585:0x3E50,
0xE68586:0x3E51,0xE68589:0x3E52,0xE6859E:0x3E53,0xE685A0:0x3E54,0xE685AC:0x3E55,
0xE685B2:0x3E56,0xE685B8:0x3E57,0xE685BB:0x3E58,0xE685BC:0x3E59,0xE685BF:0x3E5A,
0xE68680:0x3E5B,0xE68681:0x3E5C,0xE68683:0x3E5D,0xE68684:0x3E5E,0xE6868B:0x3E5F,
0xE6868D:0x3E60,0xE68692:0x3E61,0xE68693:0x3E62,0xE68697:0x3E63,0xE68698:0x3E64,
0xE6869C:0x3E65,0xE6869D:0x3E66,0xE6869F:0x3E67,0xE686A0:0x3E68,0xE686A5:0x3E69,
0xE686A8:0x3E6A,0xE686AA:0x3E6B,0xE686AD:0x3E6C,0xE686B8:0x3E6D,0xE686B9:0x3E6E,
0xE686BC:0x3E6F,0xE68780:0x3E70,0xE68781:0x3E71,0xE68782:0x3E72,0xE6878E:0x3E73,
0xE6878F:0x3E74,0xE68795:0x3E75,0xE6879C:0x3E76,0xE6879D:0x3E77,0xE6879E:0x3E78,
0xE6879F:0x3E79,0xE687A1:0x3E7A,0xE687A2:0x3E7B,0xE687A7:0x3E7C,0xE687A9:0x3E7D,
0xE687A5:0x3E7E,0xE687AC:0x3F21,0xE687AD:0x3F22,0xE687AF:0x3F23,0xE68881:0x3F24,
0xE68883:0x3F25,0xE68884:0x3F26,0xE68887:0x3F27,0xE68893:0x3F28,0xE68895:0x3F29,
0xE6889C:0x3F2A,0xE688A0:0x3F2B,0xE688A2:0x3F2C,0xE688A3:0x3F2D,0xE688A7:0x3F2E,
0xE688A9:0x3F2F,0xE688AB:0x3F30,0xE688B9:0x3F31,0xE688BD:0x3F32,0xE68982:0x3F33,
0xE68983:0x3F34,0xE68984:0x3F35,0xE68986:0x3F36,0xE6898C:0x3F37,0xE68990:0x3F38,
0xE68991:0x3F39,0xE68992:0x3F3A,0xE68994:0x3F3B,0xE68996:0x3F3C,0xE6899A:0x3F3D,
0xE6899C:0x3F3E,0xE689A4:0x3F3F,0xE689AD:0x3F40,0xE689AF:0x3F41,0xE689B3:0x3F42,
0xE689BA:0x3F43,0xE689BD:0x3F44,0xE68A8D:0x3F45,0xE68A8E:0x3F46,0xE68A8F:0x3F47,
0xE68A90:0x3F48,0xE68AA6:0x3F49,0xE68AA8:0x3F4A,0xE68AB3:0x3F4B,0xE68AB6:0x3F4C,
0xE68AB7:0x3F4D,0xE68ABA:0x3F4E,0xE68ABE:0x3F4F,0xE68ABF:0x3F50,0xE68B84:0x3F51,
0xE68B8E:0x3F52,0xE68B95:0x3F53,0xE68B96:0x3F54,0xE68B9A:0x3F55,0xE68BAA:0x3F56,
0xE68BB2:0x3F57,0xE68BB4:0x3F58,0xE68BBC:0x3F59,0xE68BBD:0x3F5A,0xE68C83:0x3F5B,
0xE68C84:0x3F5C,0xE68C8A:0x3F5D,0xE68C8B:0x3F5E,0xE68C8D:0x3F5F,0xE68C90:0x3F60,
0xE68C93:0x3F61,0xE68C96:0x3F62,0xE68C98:0x3F63,0xE68CA9:0x3F64,0xE68CAA:0x3F65,
0xE68CAD:0x3F66,0xE68CB5:0x3F67,0xE68CB6:0x3F68,0xE68CB9:0x3F69,0xE68CBC:0x3F6A,
0xE68D81:0x3F6B,0xE68D82:0x3F6C,0xE68D83:0x3F6D,0xE68D84:0x3F6E,0xE68D86:0x3F6F,
0xE68D8A:0x3F70,0xE68D8B:0x3F71,0xE68D8E:0x3F72,0xE68D92:0x3F73,0xE68D93:0x3F74,
0xE68D94:0x3F75,0xE68D98:0x3F76,0xE68D9B:0x3F77,0xE68DA5:0x3F78,0xE68DA6:0x3F79,
0xE68DAC:0x3F7A,0xE68DAD:0x3F7B,0xE68DB1:0x3F7C,0xE68DB4:0x3F7D,0xE68DB5:0x3F7E,
0xE68DB8:0x4021,0xE68DBC:0x4022,0xE68DBD:0x4023,0xE68DBF:0x4024,0xE68E82:0x4025,
0xE68E84:0x4026,0xE68E87:0x4027,0xE68E8A:0x4028,0xE68E90:0x4029,0xE68E94:0x402A,
0xE68E95:0x402B,0xE68E99:0x402C,0xE68E9A:0x402D,0xE68E9E:0x402E,0xE68EA4:0x402F,
0xE68EA6:0x4030,0xE68EAD:0x4031,0xE68EAE:0x4032,0xE68EAF:0x4033,0xE68EBD:0x4034,
0xE68F81:0x4035,0xE68F85:0x4036,0xE68F88:0x4037,0xE68F8E:0x4038,0xE68F91:0x4039,
0xE68F93:0x403A,0xE68F94:0x403B,0xE68F95:0x403C,0xE68F9C:0x403D,0xE68FA0:0x403E,
0xE68FA5:0x403F,0xE68FAA:0x4040,0xE68FAC:0x4041,0xE68FB2:0x4042,0xE68FB3:0x4043,
0xE68FB5:0x4044,0xE68FB8:0x4045,0xE68FB9:0x4046,0xE69089:0x4047,0xE6908A:0x4048,
0xE69090:0x4049,0xE69092:0x404A,0xE69094:0x404B,0xE69098:0x404C,0xE6909E:0x404D,
0xE690A0:0x404E,0xE690A2:0x404F,0xE690A4:0x4050,0xE690A5:0x4051,0xE690A9:0x4052,
0xE690AA:0x4053,0xE690AF:0x4054,0xE690B0:0x4055,0xE690B5:0x4056,0xE690BD:0x4057,
0xE690BF:0x4058,0xE6918B:0x4059,0xE6918F:0x405A,0xE69191:0x405B,0xE69192:0x405C,
0xE69193:0x405D,0xE69194:0x405E,0xE6919A:0x405F,0xE6919B:0x4060,0xE6919C:0x4061,
0xE6919D:0x4062,0xE6919F:0x4063,0xE691A0:0x4064,0xE691A1:0x4065,0xE691A3:0x4066,
0xE691AD:0x4067,0xE691B3:0x4068,0xE691B4:0x4069,0xE691BB:0x406A,0xE691BD:0x406B,
0xE69285:0x406C,0xE69287:0x406D,0xE6928F:0x406E,0xE69290:0x406F,0xE69291:0x4070,
0xE69298:0x4071,0xE69299:0x4072,0xE6929B:0x4073,0xE6929D:0x4074,0xE6929F:0x4075,
0xE692A1:0x4076,0xE692A3:0x4077,0xE692A6:0x4078,0xE692A8:0x4079,0xE692AC:0x407A,
0xE692B3:0x407B,0xE692BD:0x407C,0xE692BE:0x407D,0xE692BF:0x407E,0xE69384:0x4121,
0xE69389:0x4122,0xE6938A:0x4123,0xE6938B:0x4124,0xE6938C:0x4125,0xE6938E:0x4126,
0xE69390:0x4127,0xE69391:0x4128,0xE69395:0x4129,0xE69397:0x412A,0xE693A4:0x412B,
0xE693A5:0x412C,0xE693A9:0x412D,0xE693AA:0x412E,0xE693AD:0x412F,0xE693B0:0x4130,
0xE693B5:0x4131,0xE693B7:0x4132,0xE693BB:0x4133,0xE693BF:0x4134,0xE69481:0x4135,
0xE69484:0x4136,0xE69488:0x4137,0xE69489:0x4138,0xE6948A:0x4139,0xE6948F:0x413A,
0xE69493:0x413B,0xE69494:0x413C,0xE69496:0x413D,0xE69499:0x413E,0xE6949B:0x413F,
0xE6949E:0x4140,0xE6949F:0x4141,0xE694A2:0x4142,0xE694A6:0x4143,0xE694A9:0x4144,
0xE694AE:0x4145,0xE694B1:0x4146,0xE694BA:0x4147,0xE694BC:0x4148,0xE694BD:0x4149,
0xE69583:0x414A,0xE69587:0x414B,0xE69589:0x414C,0xE69590:0x414D,0xE69592:0x414E,
0xE69594:0x414F,0xE6959F:0x4150,0xE695A0:0x4151,0xE695A7:0x4152,0xE695AB:0x4153,
0xE695BA:0x4154,0xE695BD:0x4155,0xE69681:0x4156,0xE69685:0x4157,0xE6968A:0x4158,
0xE69692:0x4159,0xE69695:0x415A,0xE69698:0x415B,0xE6969D:0x415C,0xE696A0:0x415D,
0xE696A3:0x415E,0xE696A6:0x415F,0xE696AE:0x4160,0xE696B2:0x4161,0xE696B3:0x4162,
0xE696B4:0x4163,0xE696BF:0x4164,0xE69782:0x4165,0xE69788:0x4166,0xE69789:0x4167,
0xE6978E:0x4168,0xE69790:0x4169,0xE69794:0x416A,0xE69796:0x416B,0xE69798:0x416C,
0xE6979F:0x416D,0xE697B0:0x416E,0xE697B2:0x416F,0xE697B4:0x4170,0xE697B5:0x4171,
0xE697B9:0x4172,0xE697BE:0x4173,0xE697BF:0x4174,0xE69880:0x4175,0xE69884:0x4176,
0xE69888:0x4177,0xE69889:0x4178,0xE6988D:0x4179,0xE69891:0x417A,0xE69892:0x417B,
0xE69895:0x417C,0xE69896:0x417D,0xE6989D:0x417E,0xE6989E:0x4221,0xE698A1:0x4222,
0xE698A2:0x4223,0xE698A3:0x4224,0xE698A4:0x4225,0xE698A6:0x4226,0xE698A9:0x4227,
0xE698AA:0x4228,0xE698AB:0x4229,0xE698AC:0x422A,0xE698AE:0x422B,0xE698B0:0x422C,
0xE698B1:0x422D,0xE698B3:0x422E,0xE698B9:0x422F,0xE698B7:0x4230,0xE69980:0x4231,
0xE69985:0x4232,0xE69986:0x4233,0xE6998A:0x4234,0xE6998C:0x4235,0xE69991:0x4236,
0xE6998E:0x4237,0xE69997:0x4238,0xE69998:0x4239,0xE69999:0x423A,0xE6999B:0x423B,
0xE6999C:0x423C,0xE699A0:0x423D,0xE699A1:0x423E,0xE69BBB:0x423F,0xE699AA:0x4240,
0xE699AB:0x4241,0xE699AC:0x4242,0xE699BE:0x4243,0xE699B3:0x4244,0xE699B5:0x4245,
0xE699BF:0x4246,0xE699B7:0x4247,0xE699B8:0x4248,0xE699B9:0x4249,0xE699BB:0x424A,
0xE69A80:0x424B,0xE699BC:0x424C,0xE69A8B:0x424D,0xE69A8C:0x424E,0xE69A8D:0x424F,
0xE69A90:0x4250,0xE69A92:0x4251,0xE69A99:0x4252,0xE69A9A:0x4253,0xE69A9B:0x4254,
0xE69A9C:0x4255,0xE69A9F:0x4256,0xE69AA0:0x4257,0xE69AA4:0x4258,0xE69AAD:0x4259,
0xE69AB1:0x425A,0xE69AB2:0x425B,0xE69AB5:0x425C,0xE69ABB:0x425D,0xE69ABF:0x425E,
0xE69B80:0x425F,0xE69B82:0x4260,0xE69B83:0x4261,0xE69B88:0x4262,0xE69B8C:0x4263,
0xE69B8E:0x4264,0xE69B8F:0x4265,0xE69B94:0x4266,0xE69B9B:0x4267,0xE69B9F:0x4268,
0xE69BA8:0x4269,0xE69BAB:0x426A,0xE69BAC:0x426B,0xE69BAE:0x426C,0xE69BBA:0x426D,
0xE69C85:0x426E,0xE69C87:0x426F,0xE69C8E:0x4270,0xE69C93:0x4271,0xE69C99:0x4272,
0xE69C9C:0x4273,0xE69CA0:0x4274,0xE69CA2:0x4275,0xE69CB3:0x4276,0xE69CBE:0x4277,
0xE69D85:0x4278,0xE69D87:0x4279,0xE69D88:0x427A,0xE69D8C:0x427B,0xE69D94:0x427C,
0xE69D95:0x427D,0xE69D9D:0x427E,0xE69DA6:0x4321,0xE69DAC:0x4322,0xE69DAE:0x4323,
0xE69DB4:0x4324,0xE69DB6:0x4325,0xE69DBB:0x4326,0xE69E81:0x4327,0xE69E84:0x4328,
0xE69E8E:0x4329,0xE69E8F:0x432A,0xE69E91:0x432B,0xE69E93:0x432C,0xE69E96:0x432D,
0xE69E98:0x432E,0xE69E99:0x432F,0xE69E9B:0x4330,0xE69EB0:0x4331,0xE69EB1:0x4332,
0xE69EB2:0x4333,0xE69EB5:0x4334,0xE69EBB:0x4335,0xE69EBC:0x4336,0xE69EBD:0x4337,
0xE69FB9:0x4338,0xE69F80:0x4339,0xE69F82:0x433A,0xE69F83:0x433B,0xE69F85:0x433C,
0xE69F88:0x433D,0xE69F89:0x433E,0xE69F92:0x433F,0xE69F97:0x4340,0xE69F99:0x4341,
0xE69F9C:0x4342,0xE69FA1:0x4343,0xE69FA6:0x4344,0xE69FB0:0x4345,0xE69FB2:0x4346,
0xE69FB6:0x4347,0xE69FB7:0x4348,0xE6A192:0x4349,0xE6A094:0x434A,0xE6A099:0x434B,
0xE6A09D:0x434C,0xE6A09F:0x434D,0xE6A0A8:0x434E,0xE6A0A7:0x434F,0xE6A0AC:0x4350,
0xE6A0AD:0x4351,0xE6A0AF:0x4352,0xE6A0B0:0x4353,0xE6A0B1:0x4354,0xE6A0B3:0x4355,
0xE6A0BB:0x4356,0xE6A0BF:0x4357,0xE6A184:0x4358,0xE6A185:0x4359,0xE6A18A:0x435A,
0xE6A18C:0x435B,0xE6A195:0x435C,0xE6A197:0x435D,0xE6A198:0x435E,0xE6A19B:0x435F,
0xE6A1AB:0x4360,0xE6A1AE:0x4361,0xE6A1AF:0x4362,0xE6A1B0:0x4363,0xE6A1B1:0x4364,
0xE6A1B2:0x4365,0xE6A1B5:0x4366,0xE6A1B9:0x4367,0xE6A1BA:0x4368,0xE6A1BB:0x4369,
0xE6A1BC:0x436A,0xE6A282:0x436B,0xE6A284:0x436C,0xE6A286:0x436D,0xE6A288:0x436E,
0xE6A296:0x436F,0xE6A298:0x4370,0xE6A29A:0x4371,0xE6A29C:0x4372,0xE6A2A1:0x4373,
0xE6A2A3:0x4374,0xE6A2A5:0x4375,0xE6A2A9:0x4376,0xE6A2AA:0x4377,0xE6A2AE:0x4378,
0xE6A2B2:0x4379,0xE6A2BB:0x437A,0xE6A385:0x437B,0xE6A388:0x437C,0xE6A38C:0x437D,
0xE6A38F:0x437E,0xE6A390:0x4421,0xE6A391:0x4422,0xE6A393:0x4423,0xE6A396:0x4424,
0xE6A399:0x4425,0xE6A39C:0x4426,0xE6A39D:0x4427,0xE6A3A5:0x4428,0xE6A3A8:0x4429,
0xE6A3AA:0x442A,0xE6A3AB:0x442B,0xE6A3AC:0x442C,0xE6A3AD:0x442D,0xE6A3B0:0x442E,
0xE6A3B1:0x442F,0xE6A3B5:0x4430,0xE6A3B6:0x4431,0xE6A3BB:0x4432,0xE6A3BC:0x4433,
0xE6A3BD:0x4434,0xE6A486:0x4435,0xE6A489:0x4436,0xE6A48A:0x4437,0xE6A490:0x4438,
0xE6A491:0x4439,0xE6A493:0x443A,0xE6A496:0x443B,0xE6A497:0x443C,0xE6A4B1:0x443D,
0xE6A4B3:0x443E,0xE6A4B5:0x443F,0xE6A4B8:0x4440,0xE6A4BB:0x4441,0xE6A582:0x4442,
0xE6A585:0x4443,0xE6A589:0x4444,0xE6A58E:0x4445,0xE6A597:0x4446,0xE6A59B:0x4447,
0xE6A5A3:0x4448,0xE6A5A4:0x4449,0xE6A5A5:0x444A,0xE6A5A6:0x444B,0xE6A5A8:0x444C,
0xE6A5A9:0x444D,0xE6A5AC:0x444E,0xE6A5B0:0x444F,0xE6A5B1:0x4450,0xE6A5B2:0x4451,
0xE6A5BA:0x4452,0xE6A5BB:0x4453,0xE6A5BF:0x4454,0xE6A680:0x4455,0xE6A68D:0x4456,
0xE6A692:0x4457,0xE6A696:0x4458,0xE6A698:0x4459,0xE6A6A1:0x445A,0xE6A6A5:0x445B,
0xE6A6A6:0x445C,0xE6A6A8:0x445D,0xE6A6AB:0x445E,0xE6A6AD:0x445F,0xE6A6AF:0x4460,
0xE6A6B7:0x4461,0xE6A6B8:0x4462,0xE6A6BA:0x4463,0xE6A6BC:0x4464,0xE6A785:0x4465,
0xE6A788:0x4466,0xE6A791:0x4467,0xE6A796:0x4468,0xE6A797:0x4469,0xE6A7A2:0x446A,
0xE6A7A5:0x446B,0xE6A7AE:0x446C,0xE6A7AF:0x446D,0xE6A7B1:0x446E,0xE6A7B3:0x446F,
0xE6A7B5:0x4470,0xE6A7BE:0x4471,0xE6A880:0x4472,0xE6A881:0x4473,0xE6A883:0x4474,
0xE6A88F:0x4475,0xE6A891:0x4476,0xE6A895:0x4477,0xE6A89A:0x4478,0xE6A89D:0x4479,
0xE6A8A0:0x447A,0xE6A8A4:0x447B,0xE6A8A8:0x447C,0xE6A8B0:0x447D,0xE6A8B2:0x447E,
0xE6A8B4:0x4521,0xE6A8B7:0x4522,0xE6A8BB:0x4523,0xE6A8BE:0x4524,0xE6A8BF:0x4525,
0xE6A985:0x4526,0xE6A986:0x4527,0xE6A989:0x4528,0xE6A98A:0x4529,0xE6A98E:0x452A,
0xE6A990:0x452B,0xE6A991:0x452C,0xE6A992:0x452D,0xE6A995:0x452E,0xE6A996:0x452F,
0xE6A99B:0x4530,0xE6A9A4:0x4531,0xE6A9A7:0x4532,0xE6A9AA:0x4533,0xE6A9B1:0x4534,
0xE6A9B3:0x4535,0xE6A9BE:0x4536,0xE6AA81:0x4537,0xE6AA83:0x4538,0xE6AA86:0x4539,
0xE6AA87:0x453A,0xE6AA89:0x453B,0xE6AA8B:0x453C,0xE6AA91:0x453D,0xE6AA9B:0x453E,
0xE6AA9D:0x453F,0xE6AA9E:0x4540,0xE6AA9F:0x4541,0xE6AAA5:0x4542,0xE6AAAB:0x4543,
0xE6AAAF:0x4544,0xE6AAB0:0x4545,0xE6AAB1:0x4546,0xE6AAB4:0x4547,0xE6AABD:0x4548,
0xE6AABE:0x4549,0xE6AABF:0x454A,0xE6AB86:0x454B,0xE6AB89:0x454C,0xE6AB88:0x454D,
0xE6AB8C:0x454E,0xE6AB90:0x454F,0xE6AB94:0x4550,0xE6AB95:0x4551,0xE6AB96:0x4552,
0xE6AB9C:0x4553,0xE6AB9D:0x4554,0xE6ABA4:0x4555,0xE6ABA7:0x4556,0xE6ABAC:0x4557,
0xE6ABB0:0x4558,0xE6ABB1:0x4559,0xE6ABB2:0x455A,0xE6ABBC:0x455B,0xE6ABBD:0x455C,
0xE6AC82:0x455D,0xE6AC83:0x455E,0xE6AC86:0x455F,0xE6AC87:0x4560,0xE6AC89:0x4561,
0xE6AC8F:0x4562,0xE6AC90:0x4563,0xE6AC91:0x4564,0xE6AC97:0x4565,0xE6AC9B:0x4566,
0xE6AC9E:0x4567,0xE6ACA4:0x4568,0xE6ACA8:0x4569,0xE6ACAB:0x456A,0xE6ACAC:0x456B,
0xE6ACAF:0x456C,0xE6ACB5:0x456D,0xE6ACB6:0x456E,0xE6ACBB:0x456F,0xE6ACBF:0x4570,
0xE6AD86:0x4571,0xE6AD8A:0x4572,0xE6AD8D:0x4573,0xE6AD92:0x4574,0xE6AD96:0x4575,
0xE6AD98:0x4576,0xE6AD9D:0x4577,0xE6ADA0:0x4578,0xE6ADA7:0x4579,0xE6ADAB:0x457A,
0xE6ADAE:0x457B,0xE6ADB0:0x457C,0xE6ADB5:0x457D,0xE6ADBD:0x457E,0xE6ADBE:0x4621,
0xE6AE82:0x4622,0xE6AE85:0x4623,0xE6AE97:0x4624,0xE6AE9B:0x4625,0xE6AE9F:0x4626,
0xE6AEA0:0x4627,0xE6AEA2:0x4628,0xE6AEA3:0x4629,0xE6AEA8:0x462A,0xE6AEA9:0x462B,
0xE6AEAC:0x462C,0xE6AEAD:0x462D,0xE6AEAE:0x462E,0xE6AEB0:0x462F,0xE6AEB8:0x4630,
0xE6AEB9:0x4631,0xE6AEBD:0x4632,0xE6AEBE:0x4633,0xE6AF83:0x4634,0xE6AF84:0x4635,
0xE6AF89:0x4636,0xE6AF8C:0x4637,0xE6AF96:0x4638,0xE6AF9A:0x4639,0xE6AFA1:0x463A,
0xE6AFA3:0x463B,0xE6AFA6:0x463C,0xE6AFA7:0x463D,0xE6AFAE:0x463E,0xE6AFB1:0x463F,
0xE6AFB7:0x4640,0xE6AFB9:0x4641,0xE6AFBF:0x4642,0xE6B082:0x4643,0xE6B084:0x4644,
0xE6B085:0x4645,0xE6B089:0x4646,0xE6B08D:0x4647,0xE6B08E:0x4648,0xE6B090:0x4649,
0xE6B092:0x464A,0xE6B099:0x464B,0xE6B09F:0x464C,0xE6B0A6:0x464D,0xE6B0A7:0x464E,
0xE6B0A8:0x464F,0xE6B0AC:0x4650,0xE6B0AE:0x4651,0xE6B0B3:0x4652,0xE6B0B5:0x4653,
0xE6B0B6:0x4654,0xE6B0BA:0x4655,0xE6B0BB:0x4656,0xE6B0BF:0x4657,0xE6B18A:0x4658,
0xE6B18B:0x4659,0xE6B18D:0x465A,0xE6B18F:0x465B,0xE6B192:0x465C,0xE6B194:0x465D,
0xE6B199:0x465E,0xE6B19B:0x465F,0xE6B19C:0x4660,0xE6B1AB:0x4661,0xE6B1AD:0x4662,
0xE6B1AF:0x4663,0xE6B1B4:0x4664,0xE6B1B6:0x4665,0xE6B1B8:0x4666,0xE6B1B9:0x4667,
0xE6B1BB:0x4668,0xE6B285:0x4669,0xE6B286:0x466A,0xE6B287:0x466B,0xE6B289:0x466C,
0xE6B294:0x466D,0xE6B295:0x466E,0xE6B297:0x466F,0xE6B298:0x4670,0xE6B29C:0x4671,
0xE6B29F:0x4672,0xE6B2B0:0x4673,0xE6B2B2:0x4674,0xE6B2B4:0x4675,0xE6B382:0x4676,
0xE6B386:0x4677,0xE6B38D:0x4678,0xE6B38F:0x4679,0xE6B390:0x467A,0xE6B391:0x467B,
0xE6B392:0x467C,0xE6B394:0x467D,0xE6B396:0x467E,0xE6B39A:0x4721,0xE6B39C:0x4722,
0xE6B3A0:0x4723,0xE6B3A7:0x4724,0xE6B3A9:0x4725,0xE6B3AB:0x4726,0xE6B3AC:0x4727,
0xE6B3AE:0x4728,0xE6B3B2:0x4729,0xE6B3B4:0x472A,0xE6B484:0x472B,0xE6B487:0x472C,
0xE6B48A:0x472D,0xE6B48E:0x472E,0xE6B48F:0x472F,0xE6B491:0x4730,0xE6B493:0x4731,
0xE6B49A:0x4732,0xE6B4A6:0x4733,0xE6B4A7:0x4734,0xE6B4A8:0x4735,0xE6B1A7:0x4736,
0xE6B4AE:0x4737,0xE6B4AF:0x4738,0xE6B4B1:0x4739,0xE6B4B9:0x473A,0xE6B4BC:0x473B,
0xE6B4BF:0x473C,0xE6B597:0x473D,0xE6B59E:0x473E,0xE6B59F:0x473F,0xE6B5A1:0x4740,
0xE6B5A5:0x4741,0xE6B5A7:0x4742,0xE6B5AF:0x4743,0xE6B5B0:0x4744,0xE6B5BC:0x4745,
0xE6B682:0x4746,0xE6B687:0x4747,0xE6B691:0x4748,0xE6B692:0x4749,0xE6B694:0x474A,
0xE6B696:0x474B,0xE6B697:0x474C,0xE6B698:0x474D,0xE6B6AA:0x474E,0xE6B6AC:0x474F,
0xE6B6B4:0x4750,0xE6B6B7:0x4751,0xE6B6B9:0x4752,0xE6B6BD:0x4753,0xE6B6BF:0x4754,
0xE6B784:0x4755,0xE6B788:0x4756,0xE6B78A:0x4757,0xE6B78E:0x4758,0xE6B78F:0x4759,
0xE6B796:0x475A,0xE6B79B:0x475B,0xE6B79D:0x475C,0xE6B79F:0x475D,0xE6B7A0:0x475E,
0xE6B7A2:0x475F,0xE6B7A5:0x4760,0xE6B7A9:0x4761,0xE6B7AF:0x4762,0xE6B7B0:0x4763,
0xE6B7B4:0x4764,0xE6B7B6:0x4765,0xE6B7BC:0x4766,0xE6B880:0x4767,0xE6B884:0x4768,
0xE6B89E:0x4769,0xE6B8A2:0x476A,0xE6B8A7:0x476B,0xE6B8B2:0x476C,0xE6B8B6:0x476D,
0xE6B8B9:0x476E,0xE6B8BB:0x476F,0xE6B8BC:0x4770,0xE6B984:0x4771,0xE6B985:0x4772,
0xE6B988:0x4773,0xE6B989:0x4774,0xE6B98B:0x4775,0xE6B98F:0x4776,0xE6B991:0x4777,
0xE6B992:0x4778,0xE6B993:0x4779,0xE6B994:0x477A,0xE6B997:0x477B,0xE6B99C:0x477C,
0xE6B99D:0x477D,0xE6B99E:0x477E,0xE6B9A2:0x4821,0xE6B9A3:0x4822,0xE6B9A8:0x4823,
0xE6B9B3:0x4824,0xE6B9BB:0x4825,0xE6B9BD:0x4826,0xE6BA8D:0x4827,0xE6BA93:0x4828,
0xE6BA99:0x4829,0xE6BAA0:0x482A,0xE6BAA7:0x482B,0xE6BAAD:0x482C,0xE6BAAE:0x482D,
0xE6BAB1:0x482E,0xE6BAB3:0x482F,0xE6BABB:0x4830,0xE6BABF:0x4831,0xE6BB80:0x4832,
0xE6BB81:0x4833,0xE6BB83:0x4834,0xE6BB87:0x4835,0xE6BB88:0x4836,0xE6BB8A:0x4837,
0xE6BB8D:0x4838,0xE6BB8E:0x4839,0xE6BB8F:0x483A,0xE6BBAB:0x483B,0xE6BBAD:0x483C,
0xE6BBAE:0x483D,0xE6BBB9:0x483E,0xE6BBBB:0x483F,0xE6BBBD:0x4840,0xE6BC84:0x4841,
0xE6BC88:0x4842,0xE6BC8A:0x4843,0xE6BC8C:0x4844,0xE6BC8D:0x4845,0xE6BC96:0x4846,
0xE6BC98:0x4847,0xE6BC9A:0x4848,0xE6BC9B:0x4849,0xE6BCA6:0x484A,0xE6BCA9:0x484B,
0xE6BCAA:0x484C,0xE6BCAF:0x484D,0xE6BCB0:0x484E,0xE6BCB3:0x484F,0xE6BCB6:0x4850,
0xE6BCBB:0x4851,0xE6BCBC:0x4852,0xE6BCAD:0x4853,0xE6BD8F:0x4854,0xE6BD91:0x4855,
0xE6BD92:0x4856,0xE6BD93:0x4857,0xE6BD97:0x4858,0xE6BD99:0x4859,0xE6BD9A:0x485A,
0xE6BD9D:0x485B,0xE6BD9E:0x485C,0xE6BDA1:0x485D,0xE6BDA2:0x485E,0xE6BDA8:0x485F,
0xE6BDAC:0x4860,0xE6BDBD:0x4861,0xE6BDBE:0x4862,0xE6BE83:0x4863,0xE6BE87:0x4864,
0xE6BE88:0x4865,0xE6BE8B:0x4866,0xE6BE8C:0x4867,0xE6BE8D:0x4868,0xE6BE90:0x4869,
0xE6BE92:0x486A,0xE6BE93:0x486B,0xE6BE94:0x486C,0xE6BE96:0x486D,0xE6BE9A:0x486E,
0xE6BE9F:0x486F,0xE6BEA0:0x4870,0xE6BEA5:0x4871,0xE6BEA6:0x4872,0xE6BEA7:0x4873,
0xE6BEA8:0x4874,0xE6BEAE:0x4875,0xE6BEAF:0x4876,0xE6BEB0:0x4877,0xE6BEB5:0x4878,
0xE6BEB6:0x4879,0xE6BEBC:0x487A,0xE6BF85:0x487B,0xE6BF87:0x487C,0xE6BF88:0x487D,
0xE6BF8A:0x487E,0xE6BF9A:0x4921,0xE6BF9E:0x4922,0xE6BFA8:0x4923,0xE6BFA9:0x4924,
0xE6BFB0:0x4925,0xE6BFB5:0x4926,0xE6BFB9:0x4927,0xE6BFBC:0x4928,0xE6BFBD:0x4929,
0xE78080:0x492A,0xE78085:0x492B,0xE78086:0x492C,0xE78087:0x492D,0xE7808D:0x492E,
0xE78097:0x492F,0xE780A0:0x4930,0xE780A3:0x4931,0xE780AF:0x4932,0xE780B4:0x4933,
0xE780B7:0x4934,0xE780B9:0x4935,0xE780BC:0x4936,0xE78183:0x4937,0xE78184:0x4938,
0xE78188:0x4939,0xE78189:0x493A,0xE7818A:0x493B,0xE7818B:0x493C,0xE78194:0x493D,
0xE78195:0x493E,0xE7819D:0x493F,0xE7819E:0x4940,0xE7818E:0x4941,0xE781A4:0x4942,
0xE781A5:0x4943,0xE781AC:0x4944,0xE781AE:0x4945,0xE781B5:0x4946,0xE781B6:0x4947,
0xE781BE:0x4948,0xE78281:0x4949,0xE78285:0x494A,0xE78286:0x494B,0xE78294:0x494C,
0xE78295:0x494D,0xE78296:0x494E,0xE78297:0x494F,0xE78298:0x4950,0xE7829B:0x4951,
0xE782A4:0x4952,0xE782AB:0x4953,0xE782B0:0x4954,0xE782B1:0x4955,0xE782B4:0x4956,
0xE782B7:0x4957,0xE7838A:0x4958,0xE78391:0x4959,0xE78393:0x495A,0xE78394:0x495B,
0xE78395:0x495C,0xE78396:0x495D,0xE78398:0x495E,0xE7839C:0x495F,0xE783A4:0x4960,
0xE783BA:0x4961,0xE78483:0x4962,0xE78484:0x4963,0xE78485:0x4964,0xE78486:0x4965,
0xE78487:0x4966,0xE7848B:0x4967,0xE7848C:0x4968,0xE7848F:0x4969,0xE7849E:0x496A,
0xE784A0:0x496B,0xE784AB:0x496C,0xE784AD:0x496D,0xE784AF:0x496E,0xE784B0:0x496F,
0xE784B1:0x4970,0xE784B8:0x4971,0xE78581:0x4972,0xE78585:0x4973,0xE78586:0x4974,
0xE78587:0x4975,0xE7858A:0x4976,0xE7858B:0x4977,0xE78590:0x4978,0xE78592:0x4979,
0xE78597:0x497A,0xE7859A:0x497B,0xE7859C:0x497C,0xE7859E:0x497D,0xE785A0:0x497E,
0xE785A8:0x4A21,0xE785B9:0x4A22,0xE78680:0x4A23,0xE78685:0x4A24,0xE78687:0x4A25,
0xE7868C:0x4A26,0xE78692:0x4A27,0xE7869A:0x4A28,0xE7869B:0x4A29,0xE786A0:0x4A2A,
0xE786A2:0x4A2B,0xE786AF:0x4A2C,0xE786B0:0x4A2D,0xE786B2:0x4A2E,0xE786B3:0x4A2F,
0xE786BA:0x4A30,0xE786BF:0x4A31,0xE78780:0x4A32,0xE78781:0x4A33,0xE78784:0x4A34,
0xE7878B:0x4A35,0xE7878C:0x4A36,0xE78793:0x4A37,0xE78796:0x4A38,0xE78799:0x4A39,
0xE7879A:0x4A3A,0xE7879C:0x4A3B,0xE787B8:0x4A3C,0xE787BE:0x4A3D,0xE78880:0x4A3E,
0xE78887:0x4A3F,0xE78888:0x4A40,0xE78889:0x4A41,0xE78893:0x4A42,0xE78897:0x4A43,
0xE7889A:0x4A44,0xE7889D:0x4A45,0xE7889F:0x4A46,0xE788A4:0x4A47,0xE788AB:0x4A48,
0xE788AF:0x4A49,0xE788B4:0x4A4A,0xE788B8:0x4A4B,0xE788B9:0x4A4C,0xE78981:0x4A4D,
0xE78982:0x4A4E,0xE78983:0x4A4F,0xE78985:0x4A50,0xE7898E:0x4A51,0xE7898F:0x4A52,
0xE78990:0x4A53,0xE78993:0x4A54,0xE78995:0x4A55,0xE78996:0x4A56,0xE7899A:0x4A57,
0xE7899C:0x4A58,0xE7899E:0x4A59,0xE789A0:0x4A5A,0xE789A3:0x4A5B,0xE789A8:0x4A5C,
0xE789AB:0x4A5D,0xE789AE:0x4A5E,0xE789AF:0x4A5F,0xE789B1:0x4A60,0xE789B7:0x4A61,
0xE789B8:0x4A62,0xE789BB:0x4A63,0xE789BC:0x4A64,0xE789BF:0x4A65,0xE78A84:0x4A66,
0xE78A89:0x4A67,0xE78A8D:0x4A68,0xE78A8E:0x4A69,0xE78A93:0x4A6A,0xE78A9B:0x4A6B,
0xE78AA8:0x4A6C,0xE78AAD:0x4A6D,0xE78AAE:0x4A6E,0xE78AB1:0x4A6F,0xE78AB4:0x4A70,
0xE78ABE:0x4A71,0xE78B81:0x4A72,0xE78B87:0x4A73,0xE78B89:0x4A74,0xE78B8C:0x4A75,
0xE78B95:0x4A76,0xE78B96:0x4A77,0xE78B98:0x4A78,0xE78B9F:0x4A79,0xE78BA5:0x4A7A,
0xE78BB3:0x4A7B,0xE78BB4:0x4A7C,0xE78BBA:0x4A7D,0xE78BBB:0x4A7E,0xE78BBE:0x4B21,
0xE78C82:0x4B22,0xE78C84:0x4B23,0xE78C85:0x4B24,0xE78C87:0x4B25,0xE78C8B:0x4B26,
0xE78C8D:0x4B27,0xE78C92:0x4B28,0xE78C93:0x4B29,0xE78C98:0x4B2A,0xE78C99:0x4B2B,
0xE78C9E:0x4B2C,0xE78CA2:0x4B2D,0xE78CA4:0x4B2E,0xE78CA7:0x4B2F,0xE78CA8:0x4B30,
0xE78CAC:0x4B31,0xE78CB1:0x4B32,0xE78CB2:0x4B33,0xE78CB5:0x4B34,0xE78CBA:0x4B35,
0xE78CBB:0x4B36,0xE78CBD:0x4B37,0xE78D83:0x4B38,0xE78D8D:0x4B39,0xE78D90:0x4B3A,
0xE78D92:0x4B3B,0xE78D96:0x4B3C,0xE78D98:0x4B3D,0xE78D9D:0x4B3E,0xE78D9E:0x4B3F,
0xE78D9F:0x4B40,0xE78DA0:0x4B41,0xE78DA6:0x4B42,0xE78DA7:0x4B43,0xE78DA9:0x4B44,
0xE78DAB:0x4B45,0xE78DAC:0x4B46,0xE78DAE:0x4B47,0xE78DAF:0x4B48,0xE78DB1:0x4B49,
0xE78DB7:0x4B4A,0xE78DB9:0x4B4B,0xE78DBC:0x4B4C,0xE78E80:0x4B4D,0xE78E81:0x4B4E,
0xE78E83:0x4B4F,0xE78E85:0x4B50,0xE78E86:0x4B51,0xE78E8E:0x4B52,0xE78E90:0x4B53,
0xE78E93:0x4B54,0xE78E95:0x4B55,0xE78E97:0x4B56,0xE78E98:0x4B57,0xE78E9C:0x4B58,
0xE78E9E:0x4B59,0xE78E9F:0x4B5A,0xE78EA0:0x4B5B,0xE78EA2:0x4B5C,0xE78EA5:0x4B5D,
0xE78EA6:0x4B5E,0xE78EAA:0x4B5F,0xE78EAB:0x4B60,0xE78EAD:0x4B61,0xE78EB5:0x4B62,
0xE78EB7:0x4B63,0xE78EB9:0x4B64,0xE78EBC:0x4B65,0xE78EBD:0x4B66,0xE78EBF:0x4B67,
0xE78F85:0x4B68,0xE78F86:0x4B69,0xE78F89:0x4B6A,0xE78F8B:0x4B6B,0xE78F8C:0x4B6C,
0xE78F8F:0x4B6D,0xE78F92:0x4B6E,0xE78F93:0x4B6F,0xE78F96:0x4B70,0xE78F99:0x4B71,
0xE78F9D:0x4B72,0xE78FA1:0x4B73,0xE78FA3:0x4B74,0xE78FA6:0x4B75,0xE78FA7:0x4B76,
0xE78FA9:0x4B77,0xE78FB4:0x4B78,0xE78FB5:0x4B79,0xE78FB7:0x4B7A,0xE78FB9:0x4B7B,
0xE78FBA:0x4B7C,0xE78FBB:0x4B7D,0xE78FBD:0x4B7E,0xE78FBF:0x4C21,0xE79080:0x4C22,
0xE79081:0x4C23,0xE79084:0x4C24,0xE79087:0x4C25,0xE7908A:0x4C26,0xE79091:0x4C27,
0xE7909A:0x4C28,0xE7909B:0x4C29,0xE790A4:0x4C2A,0xE790A6:0x4C2B,0xE790A8:0x4C2C,
0xE790A9:0x4C2D,0xE790AA:0x4C2E,0xE790AB:0x4C2F,0xE790AC:0x4C30,0xE790AD:0x4C31,
0xE790AE:0x4C32,0xE790AF:0x4C33,0xE790B0:0x4C34,0xE790B1:0x4C35,0xE790B9:0x4C36,
0xE79180:0x4C37,0xE79183:0x4C38,0xE79184:0x4C39,0xE79186:0x4C3A,0xE79187:0x4C3B,
0xE7918B:0x4C3C,0xE7918D:0x4C3D,0xE79191:0x4C3E,0xE79192:0x4C3F,0xE79197:0x4C40,
0xE7919D:0x4C41,0xE791A2:0x4C42,0xE791A6:0x4C43,0xE791A7:0x4C44,0xE791A8:0x4C45,
0xE791AB:0x4C46,0xE791AD:0x4C47,0xE791AE:0x4C48,0xE791B1:0x4C49,0xE791B2:0x4C4A,
0xE79280:0x4C4B,0xE79281:0x4C4C,0xE79285:0x4C4D,0xE79286:0x4C4E,0xE79287:0x4C4F,
0xE79289:0x4C50,0xE7928F:0x4C51,0xE79290:0x4C52,0xE79291:0x4C53,0xE79292:0x4C54,
0xE79298:0x4C55,0xE79299:0x4C56,0xE7929A:0x4C57,0xE7929C:0x4C58,0xE7929F:0x4C59,
0xE792A0:0x4C5A,0xE792A1:0x4C5B,0xE792A3:0x4C5C,0xE792A6:0x4C5D,0xE792A8:0x4C5E,
0xE792A9:0x4C5F,0xE792AA:0x4C60,0xE792AB:0x4C61,0xE792AE:0x4C62,0xE792AF:0x4C63,
0xE792B1:0x4C64,0xE792B2:0x4C65,0xE792B5:0x4C66,0xE792B9:0x4C67,0xE792BB:0x4C68,
0xE792BF:0x4C69,0xE79388:0x4C6A,0xE79389:0x4C6B,0xE7938C:0x4C6C,0xE79390:0x4C6D,
0xE79393:0x4C6E,0xE79398:0x4C6F,0xE7939A:0x4C70,0xE7939B:0x4C71,0xE7939E:0x4C72,
0xE7939F:0x4C73,0xE793A4:0x4C74,0xE793A8:0x4C75,0xE793AA:0x4C76,0xE793AB:0x4C77,
0xE793AF:0x4C78,0xE793B4:0x4C79,0xE793BA:0x4C7A,0xE793BB:0x4C7B,0xE793BC:0x4C7C,
0xE793BF:0x4C7D,0xE79486:0x4C7E,0xE79492:0x4D21,0xE79496:0x4D22,0xE79497:0x4D23,
0xE794A0:0x4D24,0xE794A1:0x4D25,0xE794A4:0x4D26,0xE794A7:0x4D27,0xE794A9:0x4D28,
0xE794AA:0x4D29,0xE794AF:0x4D2A,0xE794B6:0x4D2B,0xE794B9:0x4D2C,0xE794BD:0x4D2D,
0xE794BE:0x4D2E,0xE794BF:0x4D2F,0xE79580:0x4D30,0xE79583:0x4D31,0xE79587:0x4D32,
0xE79588:0x4D33,0xE7958E:0x4D34,0xE79590:0x4D35,0xE79592:0x4D36,0xE79597:0x4D37,
0xE7959E:0x4D38,0xE7959F:0x4D39,0xE795A1:0x4D3A,0xE795AF:0x4D3B,0xE795B1:0x4D3C,
0xE795B9:0x4D3D,0xE795BA:0x4D3E,0xE795BB:0x4D3F,0xE795BC:0x4D40,0xE795BD:0x4D41,
0xE795BE:0x4D42,0xE79681:0x4D43,0xE79685:0x4D44,0xE79690:0x4D45,0xE79692:0x4D46,
0xE79693:0x4D47,0xE79695:0x4D48,0xE79699:0x4D49,0xE7969C:0x4D4A,0xE796A2:0x4D4B,
0xE796A4:0x4D4C,0xE796B4:0x4D4D,0xE796BA:0x4D4E,0xE796BF:0x4D4F,0xE79780:0x4D50,
0xE79781:0x4D51,0xE79784:0x4D52,0xE79786:0x4D53,0xE7978C:0x4D54,0xE7978E:0x4D55,
0xE7978F:0x4D56,0xE79797:0x4D57,0xE7979C:0x4D58,0xE7979F:0x4D59,0xE797A0:0x4D5A,
0xE797A1:0x4D5B,0xE797A4:0x4D5C,0xE797A7:0x4D5D,0xE797AC:0x4D5E,0xE797AE:0x4D5F,
0xE797AF:0x4D60,0xE797B1:0x4D61,0xE797B9:0x4D62,0xE79880:0x4D63,0xE79882:0x4D64,
0xE79883:0x4D65,0xE79884:0x4D66,0xE79887:0x4D67,0xE79888:0x4D68,0xE7988A:0x4D69,
0xE7988C:0x4D6A,0xE7988F:0x4D6B,0xE79892:0x4D6C,0xE79893:0x4D6D,0xE79895:0x4D6E,
0xE79896:0x4D6F,0xE79899:0x4D70,0xE7989B:0x4D71,0xE7989C:0x4D72,0xE7989D:0x4D73,
0xE7989E:0x4D74,0xE798A3:0x4D75,0xE798A5:0x4D76,0xE798A6:0x4D77,0xE798A9:0x4D78,
0xE798AD:0x4D79,0xE798B2:0x4D7A,0xE798B3:0x4D7B,0xE798B5:0x4D7C,0xE798B8:0x4D7D,
0xE798B9:0x4D7E,0xE798BA:0x4E21,0xE798BC:0x4E22,0xE7998A:0x4E23,0xE79980:0x4E24,
0xE79981:0x4E25,0xE79983:0x4E26,0xE79984:0x4E27,0xE79985:0x4E28,0xE79989:0x4E29,
0xE7998B:0x4E2A,0xE79995:0x4E2B,0xE79999:0x4E2C,0xE7999F:0x4E2D,0xE799A4:0x4E2E,
0xE799A5:0x4E2F,0xE799AD:0x4E30,0xE799AE:0x4E31,0xE799AF:0x4E32,0xE799B1:0x4E33,
0xE799B4:0x4E34,0xE79A81:0x4E35,0xE79A85:0x4E36,0xE79A8C:0x4E37,0xE79A8D:0x4E38,
0xE79A95:0x4E39,0xE79A9B:0x4E3A,0xE79A9C:0x4E3B,0xE79A9D:0x4E3C,0xE79A9F:0x4E3D,
0xE79AA0:0x4E3E,0xE79AA2:0x4E3F,0xE79AA3:0x4E40,0xE79AA4:0x4E41,0xE79AA5:0x4E42,
0xE79AA6:0x4E43,0xE79AA7:0x4E44,0xE79AA8:0x4E45,0xE79AAA:0x4E46,0xE79AAD:0x4E47,
0xE79ABD:0x4E48,0xE79B81:0x4E49,0xE79B85:0x4E4A,0xE79B89:0x4E4B,0xE79B8B:0x4E4C,
0xE79B8C:0x4E4D,0xE79B8E:0x4E4E,0xE79B94:0x4E4F,0xE79B99:0x4E50,0xE79BA0:0x4E51,
0xE79BA6:0x4E52,0xE79BA8:0x4E53,0xE79BAC:0x4E54,0xE79BB0:0x4E55,0xE79BB1:0x4E56,
0xE79BB6:0x4E57,0xE79BB9:0x4E58,0xE79BBC:0x4E59,0xE79C80:0x4E5A,0xE79C86:0x4E5B,
0xE79C8A:0x4E5C,0xE79C8E:0x4E5D,0xE79C92:0x4E5E,0xE79C94:0x4E5F,0xE79C95:0x4E60,
0xE79C97:0x4E61,0xE79C99:0x4E62,0xE79C9A:0x4E63,0xE79C9C:0x4E64,0xE79CA2:0x4E65,
0xE79CA8:0x4E66,0xE79CAD:0x4E67,0xE79CAE:0x4E68,0xE79CAF:0x4E69,0xE79CB4:0x4E6A,
0xE79CB5:0x4E6B,0xE79CB6:0x4E6C,0xE79CB9:0x4E6D,0xE79CBD:0x4E6E,0xE79CBE:0x4E6F,
0xE79D82:0x4E70,0xE79D85:0x4E71,0xE79D86:0x4E72,0xE79D8A:0x4E73,0xE79D8D:0x4E74,
0xE79D8E:0x4E75,0xE79D8F:0x4E76,0xE79D92:0x4E77,0xE79D96:0x4E78,0xE79D97:0x4E79,
0xE79D9C:0x4E7A,0xE79D9E:0x4E7B,0xE79D9F:0x4E7C,0xE79DA0:0x4E7D,0xE79DA2:0x4E7E,
0xE79DA4:0x4F21,0xE79DA7:0x4F22,0xE79DAA:0x4F23,0xE79DAC:0x4F24,0xE79DB0:0x4F25,
0xE79DB2:0x4F26,0xE79DB3:0x4F27,0xE79DB4:0x4F28,0xE79DBA:0x4F29,0xE79DBD:0x4F2A,
0xE79E80:0x4F2B,0xE79E84:0x4F2C,0xE79E8C:0x4F2D,0xE79E8D:0x4F2E,0xE79E94:0x4F2F,
0xE79E95:0x4F30,0xE79E96:0x4F31,0xE79E9A:0x4F32,0xE79E9F:0x4F33,0xE79EA2:0x4F34,
0xE79EA7:0x4F35,0xE79EAA:0x4F36,0xE79EAE:0x4F37,0xE79EAF:0x4F38,0xE79EB1:0x4F39,
0xE79EB5:0x4F3A,0xE79EBE:0x4F3B,0xE79F83:0x4F3C,0xE79F89:0x4F3D,0xE79F91:0x4F3E,
0xE79F92:0x4F3F,0xE79F95:0x4F40,0xE79F99:0x4F41,0xE79F9E:0x4F42,0xE79F9F:0x4F43,
0xE79FA0:0x4F44,0xE79FA4:0x4F45,0xE79FA6:0x4F46,0xE79FAA:0x4F47,0xE79FAC:0x4F48,
0xE79FB0:0x4F49,0xE79FB1:0x4F4A,0xE79FB4:0x4F4B,0xE79FB8:0x4F4C,0xE79FBB:0x4F4D,
0xE7A085:0x4F4E,0xE7A086:0x4F4F,0xE7A089:0x4F50,0xE7A08D:0x4F51,0xE7A08E:0x4F52,
0xE7A091:0x4F53,0xE7A09D:0x4F54,0xE7A0A1:0x4F55,0xE7A0A2:0x4F56,0xE7A0A3:0x4F57,
0xE7A0AD:0x4F58,0xE7A0AE:0x4F59,0xE7A0B0:0x4F5A,0xE7A0B5:0x4F5B,0xE7A0B7:0x4F5C,
0xE7A183:0x4F5D,0xE7A184:0x4F5E,0xE7A187:0x4F5F,0xE7A188:0x4F60,0xE7A18C:0x4F61,
0xE7A18E:0x4F62,0xE7A192:0x4F63,0xE7A19C:0x4F64,0xE7A19E:0x4F65,0xE7A1A0:0x4F66,
0xE7A1A1:0x4F67,0xE7A1A3:0x4F68,0xE7A1A4:0x4F69,0xE7A1A8:0x4F6A,0xE7A1AA:0x4F6B,
0xE7A1AE:0x4F6C,0xE7A1BA:0x4F6D,0xE7A1BE:0x4F6E,0xE7A28A:0x4F6F,0xE7A28F:0x4F70,
0xE7A294:0x4F71,0xE7A298:0x4F72,0xE7A2A1:0x4F73,0xE7A29D:0x4F74,0xE7A29E:0x4F75,
0xE7A29F:0x4F76,0xE7A2A4:0x4F77,0xE7A2A8:0x4F78,0xE7A2AC:0x4F79,0xE7A2AD:0x4F7A,
0xE7A2B0:0x4F7B,0xE7A2B1:0x4F7C,0xE7A2B2:0x4F7D,0xE7A2B3:0x4F7E,0xE7A2BB:0x5021,
0xE7A2BD:0x5022,0xE7A2BF:0x5023,0xE7A387:0x5024,0xE7A388:0x5025,0xE7A389:0x5026,
0xE7A38C:0x5027,0xE7A38E:0x5028,0xE7A392:0x5029,0xE7A393:0x502A,0xE7A395:0x502B,
0xE7A396:0x502C,0xE7A3A4:0x502D,0xE7A39B:0x502E,0xE7A39F:0x502F,0xE7A3A0:0x5030,
0xE7A3A1:0x5031,0xE7A3A6:0x5032,0xE7A3AA:0x5033,0xE7A3B2:0x5034,0xE7A3B3:0x5035,
0xE7A480:0x5036,0xE7A3B6:0x5037,0xE7A3B7:0x5038,0xE7A3BA:0x5039,0xE7A3BB:0x503A,
0xE7A3BF:0x503B,0xE7A486:0x503C,0xE7A48C:0x503D,0xE7A490:0x503E,0xE7A49A:0x503F,
0xE7A49C:0x5040,0xE7A49E:0x5041,0xE7A49F:0x5042,0xE7A4A0:0x5043,0xE7A4A5:0x5044,
0xE7A4A7:0x5045,0xE7A4A9:0x5046,0xE7A4AD:0x5047,0xE7A4B1:0x5048,0xE7A4B4:0x5049,
0xE7A4B5:0x504A,0xE7A4BB:0x504B,0xE7A4BD:0x504C,0xE7A4BF:0x504D,0xE7A584:0x504E,
0xE7A585:0x504F,0xE7A586:0x5050,0xE7A58A:0x5051,0xE7A58B:0x5052,0xE7A58F:0x5053,
0xE7A591:0x5054,0xE7A594:0x5055,0xE7A598:0x5056,0xE7A59B:0x5057,0xE7A59C:0x5058,
0xE7A5A7:0x5059,0xE7A5A9:0x505A,0xE7A5AB:0x505B,0xE7A5B2:0x505C,0xE7A5B9:0x505D,
0xE7A5BB:0x505E,0xE7A5BC:0x505F,0xE7A5BE:0x5060,0xE7A68B:0x5061,0xE7A68C:0x5062,
0xE7A691:0x5063,0xE7A693:0x5064,0xE7A694:0x5065,0xE7A695:0x5066,0xE7A696:0x5067,
0xE7A698:0x5068,0xE7A69B:0x5069,0xE7A69C:0x506A,0xE7A6A1:0x506B,0xE7A6A8:0x506C,
0xE7A6A9:0x506D,0xE7A6AB:0x506E,0xE7A6AF:0x506F,0xE7A6B1:0x5070,0xE7A6B4:0x5071,
0xE7A6B8:0x5072,0xE7A6BB:0x5073,0xE7A782:0x5074,0xE7A784:0x5075,0xE7A787:0x5076,
0xE7A788:0x5077,0xE7A78A:0x5078,0xE7A78F:0x5079,0xE7A794:0x507A,0xE7A796:0x507B,
0xE7A79A:0x507C,0xE7A79D:0x507D,0xE7A79E:0x507E,0xE7A7A0:0x5121,0xE7A7A2:0x5122,
0xE7A7A5:0x5123,0xE7A7AA:0x5124,0xE7A7AB:0x5125,0xE7A7AD:0x5126,0xE7A7B1:0x5127,
0xE7A7B8:0x5128,0xE7A7BC:0x5129,0xE7A882:0x512A,0xE7A883:0x512B,0xE7A887:0x512C,
0xE7A889:0x512D,0xE7A88A:0x512E,0xE7A88C:0x512F,0xE7A891:0x5130,0xE7A895:0x5131,
0xE7A89B:0x5132,0xE7A89E:0x5133,0xE7A8A1:0x5134,0xE7A8A7:0x5135,0xE7A8AB:0x5136,
0xE7A8AD:0x5137,0xE7A8AF:0x5138,0xE7A8B0:0x5139,0xE7A8B4:0x513A,0xE7A8B5:0x513B,
0xE7A8B8:0x513C,0xE7A8B9:0x513D,0xE7A8BA:0x513E,0xE7A984:0x513F,0xE7A985:0x5140,
0xE7A987:0x5141,0xE7A988:0x5142,0xE7A98C:0x5143,0xE7A995:0x5144,0xE7A996:0x5145,
0xE7A999:0x5146,0xE7A99C:0x5147,0xE7A99D:0x5148,0xE7A99F:0x5149,0xE7A9A0:0x514A,
0xE7A9A5:0x514B,0xE7A9A7:0x514C,0xE7A9AA:0x514D,0xE7A9AD:0x514E,0xE7A9B5:0x514F,
0xE7A9B8:0x5150,0xE7A9BE:0x5151,0xE7AA80:0x5152,0xE7AA82:0x5153,0xE7AA85:0x5154,
0xE7AA86:0x5155,0xE7AA8A:0x5156,0xE7AA8B:0x5157,0xE7AA90:0x5158,0xE7AA91:0x5159,
0xE7AA94:0x515A,0xE7AA9E:0x515B,0xE7AAA0:0x515C,0xE7AAA3:0x515D,0xE7AAAC:0x515E,
0xE7AAB3:0x515F,0xE7AAB5:0x5160,0xE7AAB9:0x5161,0xE7AABB:0x5162,0xE7AABC:0x5163,
0xE7AB86:0x5164,0xE7AB89:0x5165,0xE7AB8C:0x5166,0xE7AB8E:0x5167,0xE7AB91:0x5168,
0xE7AB9B:0x5169,0xE7ABA8:0x516A,0xE7ABA9:0x516B,0xE7ABAB:0x516C,0xE7ABAC:0x516D,
0xE7ABB1:0x516E,0xE7ABB4:0x516F,0xE7ABBB:0x5170,0xE7ABBD:0x5171,0xE7ABBE:0x5172,
0xE7AC87:0x5173,0xE7AC94:0x5174,0xE7AC9F:0x5175,0xE7ACA3:0x5176,0xE7ACA7:0x5177,
0xE7ACA9:0x5178,0xE7ACAA:0x5179,0xE7ACAB:0x517A,0xE7ACAD:0x517B,0xE7ACAE:0x517C,
0xE7ACAF:0x517D,0xE7ACB0:0x517E,0xE7ACB1:0x5221,0xE7ACB4:0x5222,0xE7ACBD:0x5223,
0xE7ACBF:0x5224,0xE7AD80:0x5225,0xE7AD81:0x5226,0xE7AD87:0x5227,0xE7AD8E:0x5228,
0xE7AD95:0x5229,0xE7ADA0:0x522A,0xE7ADA4:0x522B,0xE7ADA6:0x522C,0xE7ADA9:0x522D,
0xE7ADAA:0x522E,0xE7ADAD:0x522F,0xE7ADAF:0x5230,0xE7ADB2:0x5231,0xE7ADB3:0x5232,
0xE7ADB7:0x5233,0xE7AE84:0x5234,0xE7AE89:0x5235,0xE7AE8E:0x5236,0xE7AE90:0x5237,
0xE7AE91:0x5238,0xE7AE96:0x5239,0xE7AE9B:0x523A,0xE7AE9E:0x523B,0xE7AEA0:0x523C,
0xE7AEA5:0x523D,0xE7AEAC:0x523E,0xE7AEAF:0x523F,0xE7AEB0:0x5240,0xE7AEB2:0x5241,
0xE7AEB5:0x5242,0xE7AEB6:0x5243,0xE7AEBA:0x5244,0xE7AEBB:0x5245,0xE7AEBC:0x5246,
0xE7AEBD:0x5247,0xE7AF82:0x5248,0xE7AF85:0x5249,0xE7AF88:0x524A,0xE7AF8A:0x524B,
0xE7AF94:0x524C,0xE7AF96:0x524D,0xE7AF97:0x524E,0xE7AF99:0x524F,0xE7AF9A:0x5250,
0xE7AF9B:0x5251,0xE7AFA8:0x5252,0xE7AFAA:0x5253,0xE7AFB2:0x5254,0xE7AFB4:0x5255,
0xE7AFB5:0x5256,0xE7AFB8:0x5257,0xE7AFB9:0x5258,0xE7AFBA:0x5259,0xE7AFBC:0x525A,
0xE7AFBE:0x525B,0xE7B081:0x525C,0xE7B082:0x525D,0xE7B083:0x525E,0xE7B084:0x525F,
0xE7B086:0x5260,0xE7B089:0x5261,0xE7B08B:0x5262,0xE7B08C:0x5263,0xE7B08E:0x5264,
0xE7B08F:0x5265,0xE7B099:0x5266,0xE7B09B:0x5267,0xE7B0A0:0x5268,0xE7B0A5:0x5269,
0xE7B0A6:0x526A,0xE7B0A8:0x526B,0xE7B0AC:0x526C,0xE7B0B1:0x526D,0xE7B0B3:0x526E,
0xE7B0B4:0x526F,0xE7B0B6:0x5270,0xE7B0B9:0x5271,0xE7B0BA:0x5272,0xE7B186:0x5273,
0xE7B18A:0x5274,0xE7B195:0x5275,0xE7B191:0x5276,0xE7B192:0x5277,0xE7B193:0x5278,
0xE7B199:0x5279,0xE7B19A:0x527A,0xE7B19B:0x527B,0xE7B19C:0x527C,0xE7B19D:0x527D,
0xE7B19E:0x527E,0xE7B1A1:0x5321,0xE7B1A3:0x5322,0xE7B1A7:0x5323,0xE7B1A9:0x5324,
0xE7B1AD:0x5325,0xE7B1AE:0x5326,0xE7B1B0:0x5327,0xE7B1B2:0x5328,0xE7B1B9:0x5329,
0xE7B1BC:0x532A,0xE7B1BD:0x532B,0xE7B286:0x532C,0xE7B287:0x532D,0xE7B28F:0x532E,
0xE7B294:0x532F,0xE7B29E:0x5330,0xE7B2A0:0x5331,0xE7B2A6:0x5332,0xE7B2B0:0x5333,
0xE7B2B6:0x5334,0xE7B2B7:0x5335,0xE7B2BA:0x5336,0xE7B2BB:0x5337,0xE7B2BC:0x5338,
0xE7B2BF:0x5339,0xE7B384:0x533A,0xE7B387:0x533B,0xE7B388:0x533C,0xE7B389:0x533D,
0xE7B38D:0x533E,0xE7B38F:0x533F,0xE7B393:0x5340,0xE7B394:0x5341,0xE7B395:0x5342,
0xE7B397:0x5343,0xE7B399:0x5344,0xE7B39A:0x5345,0xE7B39D:0x5346,0xE7B3A6:0x5347,
0xE7B3A9:0x5348,0xE7B3AB:0x5349,0xE7B3B5:0x534A,0xE7B483:0x534B,0xE7B487:0x534C,
0xE7B488:0x534D,0xE7B489:0x534E,0xE7B48F:0x534F,0xE7B491:0x5350,0xE7B492:0x5351,
0xE7B493:0x5352,0xE7B496:0x5353,0xE7B49D:0x5354,0xE7B49E:0x5355,0xE7B4A3:0x5356,
0xE7B4A6:0x5357,0xE7B4AA:0x5358,0xE7B4AD:0x5359,0xE7B4B1:0x535A,0xE7B4BC:0x535B,
0xE7B4BD:0x535C,0xE7B4BE:0x535D,0xE7B580:0x535E,0xE7B581:0x535F,0xE7B587:0x5360,
0xE7B588:0x5361,0xE7B58D:0x5362,0xE7B591:0x5363,0xE7B593:0x5364,0xE7B597:0x5365,
0xE7B599:0x5366,0xE7B59A:0x5367,0xE7B59C:0x5368,0xE7B59D:0x5369,0xE7B5A5:0x536A,
0xE7B5A7:0x536B,0xE7B5AA:0x536C,0xE7B5B0:0x536D,0xE7B5B8:0x536E,0xE7B5BA:0x536F,
0xE7B5BB:0x5370,0xE7B5BF:0x5371,0xE7B681:0x5372,0xE7B682:0x5373,0xE7B683:0x5374,
0xE7B685:0x5375,0xE7B686:0x5376,0xE7B688:0x5377,0xE7B68B:0x5378,0xE7B68C:0x5379,
0xE7B68D:0x537A,0xE7B691:0x537B,0xE7B696:0x537C,0xE7B697:0x537D,0xE7B69D:0x537E,
0xE7B69E:0x5421,0xE7B6A6:0x5422,0xE7B6A7:0x5423,0xE7B6AA:0x5424,0xE7B6B3:0x5425,
0xE7B6B6:0x5426,0xE7B6B7:0x5427,0xE7B6B9:0x5428,0xE7B782:0x5429,0xE7B783:0x542A,
0xE7B784:0x542B,0xE7B785:0x542C,0xE7B786:0x542D,0xE7B78C:0x542E,0xE7B78D:0x542F,
0xE7B78E:0x5430,0xE7B797:0x5431,0xE7B799:0x5432,0xE7B880:0x5433,0xE7B7A2:0x5434,
0xE7B7A5:0x5435,0xE7B7A6:0x5436,0xE7B7AA:0x5437,0xE7B7AB:0x5438,0xE7B7AD:0x5439,
0xE7B7B1:0x543A,0xE7B7B5:0x543B,0xE7B7B6:0x543C,0xE7B7B9:0x543D,0xE7B7BA:0x543E,
0xE7B888:0x543F,0xE7B890:0x5440,0xE7B891:0x5441,0xE7B895:0x5442,0xE7B897:0x5443,
0xE7B89C:0x5444,0xE7B89D:0x5445,0xE7B8A0:0x5446,0xE7B8A7:0x5447,0xE7B8A8:0x5448,
0xE7B8AC:0x5449,0xE7B8AD:0x544A,0xE7B8AF:0x544B,0xE7B8B3:0x544C,0xE7B8B6:0x544D,
0xE7B8BF:0x544E,0xE7B984:0x544F,0xE7B985:0x5450,0xE7B987:0x5451,0xE7B98E:0x5452,
0xE7B990:0x5453,0xE7B992:0x5454,0xE7B998:0x5455,0xE7B99F:0x5456,0xE7B9A1:0x5457,
0xE7B9A2:0x5458,0xE7B9A5:0x5459,0xE7B9AB:0x545A,0xE7B9AE:0x545B,0xE7B9AF:0x545C,
0xE7B9B3:0x545D,0xE7B9B8:0x545E,0xE7B9BE:0x545F,0xE7BA81:0x5460,0xE7BA86:0x5461,
0xE7BA87:0x5462,0xE7BA8A:0x5463,0xE7BA8D:0x5464,0xE7BA91:0x5465,0xE7BA95:0x5466,
0xE7BA98:0x5467,0xE7BA9A:0x5468,0xE7BA9D:0x5469,0xE7BA9E:0x546A,0xE7BCBC:0x546B,
0xE7BCBB:0x546C,0xE7BCBD:0x546D,0xE7BCBE:0x546E,0xE7BCBF:0x546F,0xE7BD83:0x5470,
0xE7BD84:0x5471,0xE7BD87:0x5472,0xE7BD8F:0x5473,0xE7BD92:0x5474,0xE7BD93:0x5475,
0xE7BD9B:0x5476,0xE7BD9C:0x5477,0xE7BD9D:0x5478,0xE7BDA1:0x5479,0xE7BDA3:0x547A,
0xE7BDA4:0x547B,0xE7BDA5:0x547C,0xE7BDA6:0x547D,0xE7BDAD:0x547E,0xE7BDB1:0x5521,
0xE7BDBD:0x5522,0xE7BDBE:0x5523,0xE7BDBF:0x5524,0xE7BE80:0x5525,0xE7BE8B:0x5526,
0xE7BE8D:0x5527,0xE7BE8F:0x5528,0xE7BE90:0x5529,0xE7BE91:0x552A,0xE7BE96:0x552B,
0xE7BE97:0x552C,0xE7BE9C:0x552D,0xE7BEA1:0x552E,0xE7BEA2:0x552F,0xE7BEA6:0x5530,
0xE7BEAA:0x5531,0xE7BEAD:0x5532,0xE7BEB4:0x5533,0xE7BEBC:0x5534,0xE7BEBF:0x5535,
0xE7BF80:0x5536,0xE7BF83:0x5537,0xE7BF88:0x5538,0xE7BF8E:0x5539,0xE7BF8F:0x553A,
0xE7BF9B:0x553B,0xE7BF9F:0x553C,0xE7BFA3:0x553D,0xE7BFA5:0x553E,0xE7BFA8:0x553F,
0xE7BFAC:0x5540,0xE7BFAE:0x5541,0xE7BFAF:0x5542,0xE7BFB2:0x5543,0xE7BFBA:0x5544,
0xE7BFBD:0x5545,0xE7BFBE:0x5546,0xE7BFBF:0x5547,0xE88087:0x5548,0xE88088:0x5549,
0xE8808A:0x554A,0xE8808D:0x554B,0xE8808E:0x554C,0xE8808F:0x554D,0xE88091:0x554E,
0xE88093:0x554F,0xE88094:0x5550,0xE88096:0x5551,0xE8809D:0x5552,0xE8809E:0x5553,
0xE8809F:0x5554,0xE880A0:0x5555,0xE880A4:0x5556,0xE880A6:0x5557,0xE880AC:0x5558,
0xE880AE:0x5559,0xE880B0:0x555A,0xE880B4:0x555B,0xE880B5:0x555C,0xE880B7:0x555D,
0xE880B9:0x555E,0xE880BA:0x555F,0xE880BC:0x5560,0xE880BE:0x5561,0xE88180:0x5562,
0xE88184:0x5563,0xE881A0:0x5564,0xE881A4:0x5565,0xE881A6:0x5566,0xE881AD:0x5567,
0xE881B1:0x5568,0xE881B5:0x5569,0xE88281:0x556A,0xE88288:0x556B,0xE8828E:0x556C,
0xE8829C:0x556D,0xE8829E:0x556E,0xE882A6:0x556F,0xE882A7:0x5570,0xE882AB:0x5571,
0xE882B8:0x5572,0xE882B9:0x5573,0xE88388:0x5574,0xE8838D:0x5575,0xE8838F:0x5576,
0xE88392:0x5577,0xE88394:0x5578,0xE88395:0x5579,0xE88397:0x557A,0xE88398:0x557B,
0xE883A0:0x557C,0xE883AD:0x557D,0xE883AE:0x557E,0xE883B0:0x5621,0xE883B2:0x5622,
0xE883B3:0x5623,0xE883B6:0x5624,0xE883B9:0x5625,0xE883BA:0x5626,0xE883BE:0x5627,
0xE88483:0x5628,0xE8848B:0x5629,0xE88496:0x562A,0xE88497:0x562B,0xE88498:0x562C,
0xE8849C:0x562D,0xE8849E:0x562E,0xE884A0:0x562F,0xE884A4:0x5630,0xE884A7:0x5631,
0xE884AC:0x5632,0xE884B0:0x5633,0xE884B5:0x5634,0xE884BA:0x5635,0xE884BC:0x5636,
0xE88585:0x5637,0xE88587:0x5638,0xE8858A:0x5639,0xE8858C:0x563A,0xE88592:0x563B,
0xE88597:0x563C,0xE885A0:0x563D,0xE885A1:0x563E,0xE885A7:0x563F,0xE885A8:0x5640,
0xE885A9:0x5641,0xE885AD:0x5642,0xE885AF:0x5643,0xE885B7:0x5644,0xE88681:0x5645,
0xE88690:0x5646,0xE88684:0x5647,0xE88685:0x5648,0xE88686:0x5649,0xE8868B:0x564A,
0xE8868E:0x564B,0xE88696:0x564C,0xE88698:0x564D,0xE8869B:0x564E,0xE8869E:0x564F,
0xE886A2:0x5650,0xE886AE:0x5651,0xE886B2:0x5652,0xE886B4:0x5653,0xE886BB:0x5654,
0xE8878B:0x5655,0xE88783:0x5656,0xE88785:0x5657,0xE8878A:0x5658,0xE8878E:0x5659,
0xE8878F:0x565A,0xE88795:0x565B,0xE88797:0x565C,0xE8879B:0x565D,0xE8879D:0x565E,
0xE8879E:0x565F,0xE887A1:0x5660,0xE887A4:0x5661,0xE887AB:0x5662,0xE887AC:0x5663,
0xE887B0:0x5664,0xE887B1:0x5665,0xE887B2:0x5666,0xE887B5:0x5667,0xE887B6:0x5668,
0xE887B8:0x5669,0xE887B9:0x566A,0xE887BD:0x566B,0xE887BF:0x566C,0xE88880:0x566D,
0xE88883:0x566E,0xE8888F:0x566F,0xE88893:0x5670,0xE88894:0x5671,0xE88899:0x5672,
0xE8889A:0x5673,0xE8889D:0x5674,0xE888A1:0x5675,0xE888A2:0x5676,0xE888A8:0x5677,
0xE888B2:0x5678,0xE888B4:0x5679,0xE888BA:0x567A,0xE88983:0x567B,0xE88984:0x567C,
0xE88985:0x567D,0xE88986:0x567E,0xE8898B:0x5721,0xE8898E:0x5722,0xE8898F:0x5723,
0xE88991:0x5724,0xE88996:0x5725,0xE8899C:0x5726,0xE889A0:0x5727,0xE889A3:0x5728,
0xE889A7:0x5729,0xE889AD:0x572A,0xE889B4:0x572B,0xE889BB:0x572C,0xE889BD:0x572D,
0xE889BF:0x572E,0xE88A80:0x572F,0xE88A81:0x5730,0xE88A83:0x5731,0xE88A84:0x5732,
0xE88A87:0x5733,0xE88A89:0x5734,0xE88A8A:0x5735,0xE88A8E:0x5736,0xE88A91:0x5737,
0xE88A94:0x5738,0xE88A96:0x5739,0xE88A98:0x573A,0xE88A9A:0x573B,0xE88A9B:0x573C,
0xE88AA0:0x573D,0xE88AA1:0x573E,0xE88AA3:0x573F,0xE88AA4:0x5740,0xE88AA7:0x5741,
0xE88AA8:0x5742,0xE88AA9:0x5743,0xE88AAA:0x5744,0xE88AAE:0x5745,0xE88AB0:0x5746,
0xE88AB2:0x5747,0xE88AB4:0x5748,0xE88AB7:0x5749,0xE88ABA:0x574A,0xE88ABC:0x574B,
0xE88ABE:0x574C,0xE88ABF:0x574D,0xE88B86:0x574E,0xE88B90:0x574F,0xE88B95:0x5750,
0xE88B9A:0x5751,0xE88BA0:0x5752,0xE88BA2:0x5753,0xE88BA4:0x5754,0xE88BA8:0x5755,
0xE88BAA:0x5756,0xE88BAD:0x5757,0xE88BAF:0x5758,0xE88BB6:0x5759,0xE88BB7:0x575A,
0xE88BBD:0x575B,0xE88BBE:0x575C,0xE88C80:0x575D,0xE88C81:0x575E,0xE88C87:0x575F,
0xE88C88:0x5760,0xE88C8A:0x5761,0xE88C8B:0x5762,0xE88D94:0x5763,0xE88C9B:0x5764,
0xE88C9D:0x5765,0xE88C9E:0x5766,0xE88C9F:0x5767,0xE88CA1:0x5768,0xE88CA2:0x5769,
0xE88CAC:0x576A,0xE88CAD:0x576B,0xE88CAE:0x576C,0xE88CB0:0x576D,0xE88CB3:0x576E,
0xE88CB7:0x576F,0xE88CBA:0x5770,0xE88CBC:0x5771,0xE88CBD:0x5772,0xE88D82:0x5773,
0xE88D83:0x5774,0xE88D84:0x5775,0xE88D87:0x5776,0xE88D8D:0x5777,0xE88D8E:0x5778,
0xE88D91:0x5779,0xE88D95:0x577A,0xE88D96:0x577B,0xE88D97:0x577C,0xE88DB0:0x577D,
0xE88DB8:0x577E,0xE88DBD:0x5821,0xE88DBF:0x5822,0xE88E80:0x5823,0xE88E82:0x5824,
0xE88E84:0x5825,0xE88E86:0x5826,0xE88E8D:0x5827,0xE88E92:0x5828,0xE88E94:0x5829,
0xE88E95:0x582A,0xE88E98:0x582B,0xE88E99:0x582C,0xE88E9B:0x582D,0xE88E9C:0x582E,
0xE88E9D:0x582F,0xE88EA6:0x5830,0xE88EA7:0x5831,0xE88EA9:0x5832,0xE88EAC:0x5833,
0xE88EBE:0x5834,0xE88EBF:0x5835,0xE88F80:0x5836,0xE88F87:0x5837,0xE88F89:0x5838,
0xE88F8F:0x5839,0xE88F90:0x583A,0xE88F91:0x583B,0xE88F94:0x583C,0xE88F9D:0x583D,
0xE88D93:0x583E,0xE88FA8:0x583F,0xE88FAA:0x5840,0xE88FB6:0x5841,0xE88FB8:0x5842,
0xE88FB9:0x5843,0xE88FBC:0x5844,0xE89081:0x5845,0xE89086:0x5846,0xE8908A:0x5847,
0xE8908F:0x5848,0xE89091:0x5849,0xE89095:0x584A,0xE89099:0x584B,0xE88EAD:0x584C,
0xE890AF:0x584D,0xE890B9:0x584E,0xE89185:0x584F,0xE89187:0x5850,0xE89188:0x5851,
0xE8918A:0x5852,0xE8918D:0x5853,0xE8918F:0x5854,0xE89191:0x5855,0xE89192:0x5856,
0xE89196:0x5857,0xE89198:0x5858,0xE89199:0x5859,0xE8919A:0x585A,0xE8919C:0x585B,
0xE891A0:0x585C,0xE891A4:0x585D,0xE891A5:0x585E,0xE891A7:0x585F,0xE891AA:0x5860,
0xE891B0:0x5861,0xE891B3:0x5862,0xE891B4:0x5863,0xE891B6:0x5864,0xE891B8:0x5865,
0xE891BC:0x5866,0xE891BD:0x5867,0xE89281:0x5868,0xE89285:0x5869,0xE89292:0x586A,
0xE89293:0x586B,0xE89295:0x586C,0xE8929E:0x586D,0xE892A6:0x586E,0xE892A8:0x586F,
0xE892A9:0x5870,0xE892AA:0x5871,0xE892AF:0x5872,0xE892B1:0x5873,0xE892B4:0x5874,
0xE892BA:0x5875,0xE892BD:0x5876,0xE892BE:0x5877,0xE89380:0x5878,0xE89382:0x5879,
0xE89387:0x587A,0xE89388:0x587B,0xE8938C:0x587C,0xE8938F:0x587D,0xE89393:0x587E,
0xE8939C:0x5921,0xE893A7:0x5922,0xE893AA:0x5923,0xE893AF:0x5924,0xE893B0:0x5925,
0xE893B1:0x5926,0xE893B2:0x5927,0xE893B7:0x5928,0xE894B2:0x5929,0xE893BA:0x592A,
0xE893BB:0x592B,0xE893BD:0x592C,0xE89482:0x592D,0xE89483:0x592E,0xE89487:0x592F,
0xE8948C:0x5930,0xE8948E:0x5931,0xE89490:0x5932,0xE8949C:0x5933,0xE8949E:0x5934,
0xE894A2:0x5935,0xE894A3:0x5936,0xE894A4:0x5937,0xE894A5:0x5938,0xE894A7:0x5939,
0xE894AA:0x593A,0xE894AB:0x593B,0xE894AF:0x593C,0xE894B3:0x593D,0xE894B4:0x593E,
0xE894B6:0x593F,0xE894BF:0x5940,0xE89586:0x5941,0xE8958F:0x5942,0xE89590:0x5943,
0xE89591:0x5944,0xE89592:0x5945,0xE89593:0x5946,0xE89596:0x5947,0xE89599:0x5948,
0xE8959C:0x5949,0xE8959D:0x594A,0xE8959E:0x594B,0xE8959F:0x594C,0xE895A0:0x594D,
0xE895A1:0x594E,0xE895A2:0x594F,0xE895A4:0x5950,0xE895AB:0x5951,0xE895AF:0x5952,
0xE895B9:0x5953,0xE895BA:0x5954,0xE895BB:0x5955,0xE895BD:0x5956,0xE895BF:0x5957,
0xE89681:0x5958,0xE89685:0x5959,0xE89686:0x595A,0xE89689:0x595B,0xE8968B:0x595C,
0xE8968C:0x595D,0xE8968F:0x595E,0xE89693:0x595F,0xE89698:0x5960,0xE8969D:0x5961,
0xE8969F:0x5962,0xE896A0:0x5963,0xE896A2:0x5964,0xE896A5:0x5965,0xE896A7:0x5966,
0xE896B4:0x5967,0xE896B6:0x5968,0xE896B7:0x5969,0xE896B8:0x596A,0xE896BC:0x596B,
0xE896BD:0x596C,0xE896BE:0x596D,0xE896BF:0x596E,0xE89782:0x596F,0xE89787:0x5970,
0xE8978A:0x5971,0xE8978B:0x5972,0xE8978E:0x5973,0xE896AD:0x5974,0xE89798:0x5975,
0xE8979A:0x5976,0xE8979F:0x5977,0xE897A0:0x5978,0xE897A6:0x5979,0xE897A8:0x597A,
0xE897AD:0x597B,0xE897B3:0x597C,0xE897B6:0x597D,0xE897BC:0x597E,0xE897BF:0x5A21,
0xE89880:0x5A22,0xE89884:0x5A23,0xE89885:0x5A24,0xE8988D:0x5A25,0xE8988E:0x5A26,
0xE89890:0x5A27,0xE89891:0x5A28,0xE89892:0x5A29,0xE89898:0x5A2A,0xE89899:0x5A2B,
0xE8989B:0x5A2C,0xE8989E:0x5A2D,0xE898A1:0x5A2E,0xE898A7:0x5A2F,0xE898A9:0x5A30,
0xE898B6:0x5A31,0xE898B8:0x5A32,0xE898BA:0x5A33,0xE898BC:0x5A34,0xE898BD:0x5A35,
0xE89980:0x5A36,0xE89982:0x5A37,0xE89986:0x5A38,0xE89992:0x5A39,0xE89993:0x5A3A,
0xE89996:0x5A3B,0xE89997:0x5A3C,0xE89998:0x5A3D,0xE89999:0x5A3E,0xE8999D:0x5A3F,
0xE899A0:0x5A40,0xE899A1:0x5A41,0xE899A2:0x5A42,0xE899A3:0x5A43,0xE899A4:0x5A44,
0xE899A9:0x5A45,0xE899AC:0x5A46,0xE899AF:0x5A47,0xE899B5:0x5A48,0xE899B6:0x5A49,
0xE899B7:0x5A4A,0xE899BA:0x5A4B,0xE89A8D:0x5A4C,0xE89A91:0x5A4D,0xE89A96:0x5A4E,
0xE89A98:0x5A4F,0xE89A9A:0x5A50,0xE89A9C:0x5A51,0xE89AA1:0x5A52,0xE89AA6:0x5A53,
0xE89AA7:0x5A54,0xE89AA8:0x5A55,0xE89AAD:0x5A56,0xE89AB1:0x5A57,0xE89AB3:0x5A58,
0xE89AB4:0x5A59,0xE89AB5:0x5A5A,0xE89AB7:0x5A5B,0xE89AB8:0x5A5C,0xE89AB9:0x5A5D,
0xE89ABF:0x5A5E,0xE89B80:0x5A5F,0xE89B81:0x5A60,0xE89B83:0x5A61,0xE89B85:0x5A62,
0xE89B91:0x5A63,0xE89B92:0x5A64,0xE89B95:0x5A65,0xE89B97:0x5A66,0xE89B9A:0x5A67,
0xE89B9C:0x5A68,0xE89BA0:0x5A69,0xE89BA3:0x5A6A,0xE89BA5:0x5A6B,0xE89BA7:0x5A6C,
0xE89A88:0x5A6D,0xE89BBA:0x5A6E,0xE89BBC:0x5A6F,0xE89BBD:0x5A70,0xE89C84:0x5A71,
0xE89C85:0x5A72,0xE89C87:0x5A73,0xE89C8B:0x5A74,0xE89C8E:0x5A75,0xE89C8F:0x5A76,
0xE89C90:0x5A77,0xE89C93:0x5A78,0xE89C94:0x5A79,0xE89C99:0x5A7A,0xE89C9E:0x5A7B,
0xE89C9F:0x5A7C,0xE89CA1:0x5A7D,0xE89CA3:0x5A7E,0xE89CA8:0x5B21,0xE89CAE:0x5B22,
0xE89CAF:0x5B23,0xE89CB1:0x5B24,0xE89CB2:0x5B25,0xE89CB9:0x5B26,0xE89CBA:0x5B27,
0xE89CBC:0x5B28,0xE89CBD:0x5B29,0xE89CBE:0x5B2A,0xE89D80:0x5B2B,0xE89D83:0x5B2C,
0xE89D85:0x5B2D,0xE89D8D:0x5B2E,0xE89D98:0x5B2F,0xE89D9D:0x5B30,0xE89DA1:0x5B31,
0xE89DA4:0x5B32,0xE89DA5:0x5B33,0xE89DAF:0x5B34,0xE89DB1:0x5B35,0xE89DB2:0x5B36,
0xE89DBB:0x5B37,0xE89E83:0x5B38,0xE89E84:0x5B39,0xE89E85:0x5B3A,0xE89E86:0x5B3B,
0xE89E87:0x5B3C,0xE89E88:0x5B3D,0xE89E89:0x5B3E,0xE89E8B:0x5B3F,0xE89E8C:0x5B40,
0xE89E90:0x5B41,0xE89E93:0x5B42,0xE89E95:0x5B43,0xE89E97:0x5B44,0xE89E98:0x5B45,
0xE89E99:0x5B46,0xE89E9E:0x5B47,0xE89EA0:0x5B48,0xE89EA3:0x5B49,0xE89EA7:0x5B4A,
0xE89EAC:0x5B4B,0xE89EAD:0x5B4C,0xE89EAE:0x5B4D,0xE89EB1:0x5B4E,0xE89EB5:0x5B4F,
0xE89EBE:0x5B50,0xE89EBF:0x5B51,0xE89F81:0x5B52,0xE89F88:0x5B53,0xE89F89:0x5B54,
0xE89F8A:0x5B55,0xE89F8E:0x5B56,0xE89F95:0x5B57,0xE89F96:0x5B58,0xE89F99:0x5B59,
0xE89F9A:0x5B5A,0xE89F9C:0x5B5B,0xE89F9F:0x5B5C,0xE89FA2:0x5B5D,0xE89FA3:0x5B5E,
0xE89FA4:0x5B5F,0xE89FAA:0x5B60,0xE89FAB:0x5B61,0xE89FAD:0x5B62,0xE89FB1:0x5B63,
0xE89FB3:0x5B64,0xE89FB8:0x5B65,0xE89FBA:0x5B66,0xE89FBF:0x5B67,0xE8A081:0x5B68,
0xE8A083:0x5B69,0xE8A086:0x5B6A,0xE8A089:0x5B6B,0xE8A08A:0x5B6C,0xE8A08B:0x5B6D,
0xE8A090:0x5B6E,0xE8A099:0x5B6F,0xE8A092:0x5B70,0xE8A093:0x5B71,0xE8A094:0x5B72,
0xE8A098:0x5B73,0xE8A09A:0x5B74,0xE8A09B:0x5B75,0xE8A09C:0x5B76,0xE8A09E:0x5B77,
0xE8A09F:0x5B78,0xE8A0A8:0x5B79,0xE8A0AD:0x5B7A,0xE8A0AE:0x5B7B,0xE8A0B0:0x5B7C,
0xE8A0B2:0x5B7D,0xE8A0B5:0x5B7E,0xE8A0BA:0x5C21,0xE8A0BC:0x5C22,0xE8A181:0x5C23,
0xE8A183:0x5C24,0xE8A185:0x5C25,0xE8A188:0x5C26,0xE8A189:0x5C27,0xE8A18A:0x5C28,
0xE8A18B:0x5C29,0xE8A18E:0x5C2A,0xE8A191:0x5C2B,0xE8A195:0x5C2C,0xE8A196:0x5C2D,
0xE8A198:0x5C2E,0xE8A19A:0x5C2F,0xE8A19C:0x5C30,0xE8A19F:0x5C31,0xE8A1A0:0x5C32,
0xE8A1A4:0x5C33,0xE8A1A9:0x5C34,0xE8A1B1:0x5C35,0xE8A1B9:0x5C36,0xE8A1BB:0x5C37,
0xE8A280:0x5C38,0xE8A298:0x5C39,0xE8A29A:0x5C3A,0xE8A29B:0x5C3B,0xE8A29C:0x5C3C,
0xE8A29F:0x5C3D,0xE8A2A0:0x5C3E,0xE8A2A8:0x5C3F,0xE8A2AA:0x5C40,0xE8A2BA:0x5C41,
0xE8A2BD:0x5C42,0xE8A2BE:0x5C43,0xE8A380:0x5C44,0xE8A38A:0x5C45,0xE8A38B:0x5C46,
0xE8A38C:0x5C47,0xE8A38D:0x5C48,0xE8A38E:0x5C49,0xE8A391:0x5C4A,0xE8A392:0x5C4B,
0xE8A393:0x5C4C,0xE8A39B:0x5C4D,0xE8A39E:0x5C4E,0xE8A3A7:0x5C4F,0xE8A3AF:0x5C50,
0xE8A3B0:0x5C51,0xE8A3B1:0x5C52,0xE8A3B5:0x5C53,0xE8A3B7:0x5C54,0xE8A481:0x5C55,
0xE8A486:0x5C56,0xE8A48D:0x5C57,0xE8A48E:0x5C58,0xE8A48F:0x5C59,0xE8A495:0x5C5A,
0xE8A496:0x5C5B,0xE8A498:0x5C5C,0xE8A499:0x5C5D,0xE8A49A:0x5C5E,0xE8A49C:0x5C5F,
0xE8A4A0:0x5C60,0xE8A4A6:0x5C61,0xE8A4A7:0x5C62,0xE8A4A8:0x5C63,0xE8A4B0:0x5C64,
0xE8A4B1:0x5C65,0xE8A4B2:0x5C66,0xE8A4B5:0x5C67,0xE8A4B9:0x5C68,0xE8A4BA:0x5C69,
0xE8A4BE:0x5C6A,0xE8A580:0x5C6B,0xE8A582:0x5C6C,0xE8A585:0x5C6D,0xE8A586:0x5C6E,
0xE8A589:0x5C6F,0xE8A58F:0x5C70,0xE8A592:0x5C71,0xE8A597:0x5C72,0xE8A59A:0x5C73,
0xE8A59B:0x5C74,0xE8A59C:0x5C75,0xE8A5A1:0x5C76,0xE8A5A2:0x5C77,0xE8A5A3:0x5C78,
0xE8A5AB:0x5C79,0xE8A5AE:0x5C7A,0xE8A5B0:0x5C7B,0xE8A5B3:0x5C7C,0xE8A5B5:0x5C7D,
0xE8A5BA:0x5C7E,0xE8A5BB:0x5D21,0xE8A5BC:0x5D22,0xE8A5BD:0x5D23,0xE8A689:0x5D24,
0xE8A68D:0x5D25,0xE8A690:0x5D26,0xE8A694:0x5D27,0xE8A695:0x5D28,0xE8A69B:0x5D29,
0xE8A69C:0x5D2A,0xE8A69F:0x5D2B,0xE8A6A0:0x5D2C,0xE8A6A5:0x5D2D,0xE8A6B0:0x5D2E,
0xE8A6B4:0x5D2F,0xE8A6B5:0x5D30,0xE8A6B6:0x5D31,0xE8A6B7:0x5D32,0xE8A6BC:0x5D33,
0xE8A794:0x5D34,0xE8A795:0x5D35,0xE8A796:0x5D36,0xE8A797:0x5D37,0xE8A798:0x5D38,
0xE8A7A5:0x5D39,0xE8A7A9:0x5D3A,0xE8A7AB:0x5D3B,0xE8A7AD:0x5D3C,0xE8A7B1:0x5D3D,
0xE8A7B3:0x5D3E,0xE8A7B6:0x5D3F,0xE8A7B9:0x5D40,0xE8A7BD:0x5D41,0xE8A7BF:0x5D42,
0xE8A884:0x5D43,0xE8A885:0x5D44,0xE8A887:0x5D45,0xE8A88F:0x5D46,0xE8A891:0x5D47,
0xE8A892:0x5D48,0xE8A894:0x5D49,0xE8A895:0x5D4A,0xE8A89E:0x5D4B,0xE8A8A0:0x5D4C,
0xE8A8A2:0x5D4D,0xE8A8A4:0x5D4E,0xE8A8A6:0x5D4F,0xE8A8AB:0x5D50,0xE8A8AC:0x5D51,
0xE8A8AF:0x5D52,0xE8A8B5:0x5D53,0xE8A8B7:0x5D54,0xE8A8BD:0x5D55,0xE8A8BE:0x5D56,
0xE8A980:0x5D57,0xE8A983:0x5D58,0xE8A985:0x5D59,0xE8A987:0x5D5A,0xE8A989:0x5D5B,
0xE8A98D:0x5D5C,0xE8A98E:0x5D5D,0xE8A993:0x5D5E,0xE8A996:0x5D5F,0xE8A997:0x5D60,
0xE8A998:0x5D61,0xE8A99C:0x5D62,0xE8A99D:0x5D63,0xE8A9A1:0x5D64,0xE8A9A5:0x5D65,
0xE8A9A7:0x5D66,0xE8A9B5:0x5D67,0xE8A9B6:0x5D68,0xE8A9B7:0x5D69,0xE8A9B9:0x5D6A,
0xE8A9BA:0x5D6B,0xE8A9BB:0x5D6C,0xE8A9BE:0x5D6D,0xE8A9BF:0x5D6E,0xE8AA80:0x5D6F,
0xE8AA83:0x5D70,0xE8AA86:0x5D71,0xE8AA8B:0x5D72,0xE8AA8F:0x5D73,0xE8AA90:0x5D74,
0xE8AA92:0x5D75,0xE8AA96:0x5D76,0xE8AA97:0x5D77,0xE8AA99:0x5D78,0xE8AA9F:0x5D79,
0xE8AAA7:0x5D7A,0xE8AAA9:0x5D7B,0xE8AAAE:0x5D7C,0xE8AAAF:0x5D7D,0xE8AAB3:0x5D7E,
0xE8AAB6:0x5E21,0xE8AAB7:0x5E22,0xE8AABB:0x5E23,0xE8AABE:0x5E24,0xE8AB83:0x5E25,
0xE8AB86:0x5E26,0xE8AB88:0x5E27,0xE8AB89:0x5E28,0xE8AB8A:0x5E29,0xE8AB91:0x5E2A,
0xE8AB93:0x5E2B,0xE8AB94:0x5E2C,0xE8AB95:0x5E2D,0xE8AB97:0x5E2E,0xE8AB9D:0x5E2F,
0xE8AB9F:0x5E30,0xE8ABAC:0x5E31,0xE8ABB0:0x5E32,0xE8ABB4:0x5E33,0xE8ABB5:0x5E34,
0xE8ABB6:0x5E35,0xE8ABBC:0x5E36,0xE8ABBF:0x5E37,0xE8AC85:0x5E38,0xE8AC86:0x5E39,
0xE8AC8B:0x5E3A,0xE8AC91:0x5E3B,0xE8AC9C:0x5E3C,0xE8AC9E:0x5E3D,0xE8AC9F:0x5E3E,
0xE8AC8A:0x5E3F,0xE8ACAD:0x5E40,0xE8ACB0:0x5E41,0xE8ACB7:0x5E42,0xE8ACBC:0x5E43,
0xE8AD82:0x5E44,0xE8AD83:0x5E45,0xE8AD84:0x5E46,0xE8AD85:0x5E47,0xE8AD86:0x5E48,
0xE8AD88:0x5E49,0xE8AD92:0x5E4A,0xE8AD93:0x5E4B,0xE8AD94:0x5E4C,0xE8AD99:0x5E4D,
0xE8AD8D:0x5E4E,0xE8AD9E:0x5E4F,0xE8ADA3:0x5E50,0xE8ADAD:0x5E51,0xE8ADB6:0x5E52,
0xE8ADB8:0x5E53,0xE8ADB9:0x5E54,0xE8ADBC:0x5E55,0xE8ADBE:0x5E56,0xE8AE81:0x5E57,
0xE8AE84:0x5E58,0xE8AE85:0x5E59,0xE8AE8B:0x5E5A,0xE8AE8D:0x5E5B,0xE8AE8F:0x5E5C,
0xE8AE94:0x5E5D,0xE8AE95:0x5E5E,0xE8AE9C:0x5E5F,0xE8AE9E:0x5E60,0xE8AE9F:0x5E61,
0xE8B0B8:0x5E62,0xE8B0B9:0x5E63,0xE8B0BD:0x5E64,0xE8B0BE:0x5E65,0xE8B185:0x5E66,
0xE8B187:0x5E67,0xE8B189:0x5E68,0xE8B18B:0x5E69,0xE8B18F:0x5E6A,0xE8B191:0x5E6B,
0xE8B193:0x5E6C,0xE8B194:0x5E6D,0xE8B197:0x5E6E,0xE8B198:0x5E6F,0xE8B19B:0x5E70,
0xE8B19D:0x5E71,0xE8B199:0x5E72,0xE8B1A3:0x5E73,0xE8B1A4:0x5E74,0xE8B1A6:0x5E75,
0xE8B1A8:0x5E76,0xE8B1A9:0x5E77,0xE8B1AD:0x5E78,0xE8B1B3:0x5E79,0xE8B1B5:0x5E7A,
0xE8B1B6:0x5E7B,0xE8B1BB:0x5E7C,0xE8B1BE:0x5E7D,0xE8B286:0x5E7E,0xE8B287:0x5F21,
0xE8B28B:0x5F22,0xE8B290:0x5F23,0xE8B292:0x5F24,0xE8B293:0x5F25,0xE8B299:0x5F26,
0xE8B29B:0x5F27,0xE8B29C:0x5F28,0xE8B2A4:0x5F29,0xE8B2B9:0x5F2A,0xE8B2BA:0x5F2B,
0xE8B385:0x5F2C,0xE8B386:0x5F2D,0xE8B389:0x5F2E,0xE8B38B:0x5F2F,0xE8B38F:0x5F30,
0xE8B396:0x5F31,0xE8B395:0x5F32,0xE8B399:0x5F33,0xE8B39D:0x5F34,0xE8B3A1:0x5F35,
0xE8B3A8:0x5F36,0xE8B3AC:0x5F37,0xE8B3AF:0x5F38,0xE8B3B0:0x5F39,0xE8B3B2:0x5F3A,
0xE8B3B5:0x5F3B,0xE8B3B7:0x5F3C,0xE8B3B8:0x5F3D,0xE8B3BE:0x5F3E,0xE8B3BF:0x5F3F,
0xE8B481:0x5F40,0xE8B483:0x5F41,0xE8B489:0x5F42,0xE8B492:0x5F43,0xE8B497:0x5F44,
0xE8B49B:0x5F45,0xE8B5A5:0x5F46,0xE8B5A9:0x5F47,0xE8B5AC:0x5F48,0xE8B5AE:0x5F49,
0xE8B5BF:0x5F4A,0xE8B682:0x5F4B,0xE8B684:0x5F4C,0xE8B688:0x5F4D,0xE8B68D:0x5F4E,
0xE8B690:0x5F4F,0xE8B691:0x5F50,0xE8B695:0x5F51,0xE8B69E:0x5F52,0xE8B69F:0x5F53,
0xE8B6A0:0x5F54,0xE8B6A6:0x5F55,0xE8B6AB:0x5F56,0xE8B6AC:0x5F57,0xE8B6AF:0x5F58,
0xE8B6B2:0x5F59,0xE8B6B5:0x5F5A,0xE8B6B7:0x5F5B,0xE8B6B9:0x5F5C,0xE8B6BB:0x5F5D,
0xE8B780:0x5F5E,0xE8B785:0x5F5F,0xE8B786:0x5F60,0xE8B787:0x5F61,0xE8B788:0x5F62,
0xE8B78A:0x5F63,0xE8B78E:0x5F64,0xE8B791:0x5F65,0xE8B794:0x5F66,0xE8B795:0x5F67,
0xE8B797:0x5F68,0xE8B799:0x5F69,0xE8B7A4:0x5F6A,0xE8B7A5:0x5F6B,0xE8B7A7:0x5F6C,
0xE8B7AC:0x5F6D,0xE8B7B0:0x5F6E,0xE8B6BC:0x5F6F,0xE8B7B1:0x5F70,0xE8B7B2:0x5F71,
0xE8B7B4:0x5F72,0xE8B7BD:0x5F73,0xE8B881:0x5F74,0xE8B884:0x5F75,0xE8B885:0x5F76,
0xE8B886:0x5F77,0xE8B88B:0x5F78,0xE8B891:0x5F79,0xE8B894:0x5F7A,0xE8B896:0x5F7B,
0xE8B8A0:0x5F7C,0xE8B8A1:0x5F7D,0xE8B8A2:0x5F7E,0xE8B8A3:0x6021,0xE8B8A6:0x6022,
0xE8B8A7:0x6023,0xE8B8B1:0x6024,0xE8B8B3:0x6025,0xE8B8B6:0x6026,0xE8B8B7:0x6027,
0xE8B8B8:0x6028,0xE8B8B9:0x6029,0xE8B8BD:0x602A,0xE8B980:0x602B,0xE8B981:0x602C,
0xE8B98B:0x602D,0xE8B98D:0x602E,0xE8B98E:0x602F,0xE8B98F:0x6030,0xE8B994:0x6031,
0xE8B99B:0x6032,0xE8B99C:0x6033,0xE8B99D:0x6034,0xE8B99E:0x6035,0xE8B9A1:0x6036,
0xE8B9A2:0x6037,0xE8B9A9:0x6038,0xE8B9AC:0x6039,0xE8B9AD:0x603A,0xE8B9AF:0x603B,
0xE8B9B0:0x603C,0xE8B9B1:0x603D,0xE8B9B9:0x603E,0xE8B9BA:0x603F,0xE8B9BB:0x6040,
0xE8BA82:0x6041,0xE8BA83:0x6042,0xE8BA89:0x6043,0xE8BA90:0x6044,0xE8BA92:0x6045,
0xE8BA95:0x6046,0xE8BA9A:0x6047,0xE8BA9B:0x6048,0xE8BA9D:0x6049,0xE8BA9E:0x604A,
0xE8BAA2:0x604B,0xE8BAA7:0x604C,0xE8BAA9:0x604D,0xE8BAAD:0x604E,0xE8BAAE:0x604F,
0xE8BAB3:0x6050,0xE8BAB5:0x6051,0xE8BABA:0x6052,0xE8BABB:0x6053,0xE8BB80:0x6054,
0xE8BB81:0x6055,0xE8BB83:0x6056,0xE8BB84:0x6057,0xE8BB87:0x6058,0xE8BB8F:0x6059,
0xE8BB91:0x605A,0xE8BB94:0x605B,0xE8BB9C:0x605C,0xE8BBA8:0x605D,0xE8BBAE:0x605E,
0xE8BBB0:0x605F,0xE8BBB1:0x6060,0xE8BBB7:0x6061,0xE8BBB9:0x6062,0xE8BBBA:0x6063,
0xE8BBAD:0x6064,0xE8BC80:0x6065,0xE8BC82:0x6066,0xE8BC87:0x6067,0xE8BC88:0x6068,
0xE8BC8F:0x6069,0xE8BC90:0x606A,0xE8BC96:0x606B,0xE8BC97:0x606C,0xE8BC98:0x606D,
0xE8BC9E:0x606E,0xE8BCA0:0x606F,0xE8BCA1:0x6070,0xE8BCA3:0x6071,0xE8BCA5:0x6072,
0xE8BCA7:0x6073,0xE8BCA8:0x6074,0xE8BCAC:0x6075,0xE8BCAD:0x6076,0xE8BCAE:0x6077,
0xE8BCB4:0x6078,0xE8BCB5:0x6079,0xE8BCB6:0x607A,0xE8BCB7:0x607B,0xE8BCBA:0x607C,
0xE8BD80:0x607D,0xE8BD81:0x607E,0xE8BD83:0x6121,0xE8BD87:0x6122,0xE8BD8F:0x6123,
0xE8BD91:0x6124,0xE8BD92:0x6125,0xE8BD93:0x6126,0xE8BD94:0x6127,0xE8BD95:0x6128,
0xE8BD98:0x6129,0xE8BD9D:0x612A,0xE8BD9E:0x612B,0xE8BDA5:0x612C,0xE8BE9D:0x612D,
0xE8BEA0:0x612E,0xE8BEA1:0x612F,0xE8BEA4:0x6130,0xE8BEA5:0x6131,0xE8BEA6:0x6132,
0xE8BEB5:0x6133,0xE8BEB6:0x6134,0xE8BEB8:0x6135,0xE8BEBE:0x6136,0xE8BF80:0x6137,
0xE8BF81:0x6138,0xE8BF86:0x6139,0xE8BF8A:0x613A,0xE8BF8B:0x613B,0xE8BF8D:0x613C,
0xE8BF90:0x613D,0xE8BF92:0x613E,0xE8BF93:0x613F,0xE8BF95:0x6140,0xE8BFA0:0x6141,
0xE8BFA3:0x6142,0xE8BFA4:0x6143,0xE8BFA8:0x6144,0xE8BFAE:0x6145,0xE8BFB1:0x6146,
0xE8BFB5:0x6147,0xE8BFB6:0x6148,0xE8BFBB:0x6149,0xE8BFBE:0x614A,0xE98082:0x614B,
0xE98084:0x614C,0xE98088:0x614D,0xE9808C:0x614E,0xE98098:0x614F,0xE9809B:0x6150,
0xE980A8:0x6151,0xE980A9:0x6152,0xE980AF:0x6153,0xE980AA:0x6154,0xE980AC:0x6155,
0xE980AD:0x6156,0xE980B3:0x6157,0xE980B4:0x6158,0xE980B7:0x6159,0xE980BF:0x615A,
0xE98183:0x615B,0xE98184:0x615C,0xE9818C:0x615D,0xE9819B:0x615E,0xE9819D:0x615F,
0xE981A2:0x6160,0xE981A6:0x6161,0xE981A7:0x6162,0xE981AC:0x6163,0xE981B0:0x6164,
0xE981B4:0x6165,0xE981B9:0x6166,0xE98285:0x6167,0xE98288:0x6168,0xE9828B:0x6169,
0xE9828C:0x616A,0xE9828E:0x616B,0xE98290:0x616C,0xE98295:0x616D,0xE98297:0x616E,
0xE98298:0x616F,0xE98299:0x6170,0xE9829B:0x6171,0xE982A0:0x6172,0xE982A1:0x6173,
0xE982A2:0x6174,0xE982A5:0x6175,0xE982B0:0x6176,0xE982B2:0x6177,0xE982B3:0x6178,
0xE982B4:0x6179,0xE982B6:0x617A,0xE982BD:0x617B,0xE9838C:0x617C,0xE982BE:0x617D,
0xE98383:0x617E,0xE98384:0x6221,0xE98385:0x6222,0xE98387:0x6223,0xE98388:0x6224,
0xE98395:0x6225,0xE98397:0x6226,0xE98398:0x6227,0xE98399:0x6228,0xE9839C:0x6229,
0xE9839D:0x622A,0xE9839F:0x622B,0xE983A5:0x622C,0xE98392:0x622D,0xE983B6:0x622E,
0xE983AB:0x622F,0xE983AF:0x6230,0xE983B0:0x6231,0xE983B4:0x6232,0xE983BE:0x6233,
0xE983BF:0x6234,0xE98480:0x6235,0xE98484:0x6236,0xE98485:0x6237,0xE98486:0x6238,
0xE98488:0x6239,0xE9848D:0x623A,0xE98490:0x623B,0xE98494:0x623C,0xE98496:0x623D,
0xE98497:0x623E,0xE98498:0x623F,0xE9849A:0x6240,0xE9849C:0x6241,0xE9849E:0x6242,
0xE984A0:0x6243,0xE984A5:0x6244,0xE984A2:0x6245,0xE984A3:0x6246,0xE984A7:0x6247,
0xE984A9:0x6248,0xE984AE:0x6249,0xE984AF:0x624A,0xE984B1:0x624B,0xE984B4:0x624C,
0xE984B6:0x624D,0xE984B7:0x624E,0xE984B9:0x624F,0xE984BA:0x6250,0xE984BC:0x6251,
0xE984BD:0x6252,0xE98583:0x6253,0xE98587:0x6254,0xE98588:0x6255,0xE9858F:0x6256,
0xE98593:0x6257,0xE98597:0x6258,0xE98599:0x6259,0xE9859A:0x625A,0xE9859B:0x625B,
0xE985A1:0x625C,0xE985A4:0x625D,0xE985A7:0x625E,0xE985AD:0x625F,0xE985B4:0x6260,
0xE985B9:0x6261,0xE985BA:0x6262,0xE985BB:0x6263,0xE98681:0x6264,0xE98683:0x6265,
0xE98685:0x6266,0xE98686:0x6267,0xE9868A:0x6268,0xE9868E:0x6269,0xE98691:0x626A,
0xE98693:0x626B,0xE98694:0x626C,0xE98695:0x626D,0xE98698:0x626E,0xE9869E:0x626F,
0xE986A1:0x6270,0xE986A6:0x6271,0xE986A8:0x6272,0xE986AC:0x6273,0xE986AD:0x6274,
0xE986AE:0x6275,0xE986B0:0x6276,0xE986B1:0x6277,0xE986B2:0x6278,0xE986B3:0x6279,
0xE986B6:0x627A,0xE986BB:0x627B,0xE986BC:0x627C,0xE986BD:0x627D,0xE986BF:0x627E,
0xE98782:0x6321,0xE98783:0x6322,0xE98785:0x6323,0xE98793:0x6324,0xE98794:0x6325,
0xE98797:0x6326,0xE98799:0x6327,0xE9879A:0x6328,0xE9879E:0x6329,0xE987A4:0x632A,
0xE987A5:0x632B,0xE987A9:0x632C,0xE987AA:0x632D,0xE987AC:0x632E,0xE987AD:0x632F,
0xE987AE:0x6330,0xE987AF:0x6331,0xE987B0:0x6332,0xE987B1:0x6333,0xE987B7:0x6334,
0xE987B9:0x6335,0xE987BB:0x6336,0xE987BD:0x6337,0xE98880:0x6338,0xE98881:0x6339,
0xE98884:0x633A,0xE98885:0x633B,0xE98886:0x633C,0xE98887:0x633D,0xE98889:0x633E,
0xE9888A:0x633F,0xE9888C:0x6340,0xE98890:0x6341,0xE98892:0x6342,0xE98893:0x6343,
0xE98896:0x6344,0xE98898:0x6345,0xE9889C:0x6346,0xE9889D:0x6347,0xE988A3:0x6348,
0xE988A4:0x6349,0xE988A5:0x634A,0xE988A6:0x634B,0xE988A8:0x634C,0xE988AE:0x634D,
0xE988AF:0x634E,0xE988B0:0x634F,0xE988B3:0x6350,0xE988B5:0x6351,0xE988B6:0x6352,
0xE988B8:0x6353,0xE988B9:0x6354,0xE988BA:0x6355,0xE988BC:0x6356,0xE988BE:0x6357,
0xE98980:0x6358,0xE98982:0x6359,0xE98983:0x635A,0xE98986:0x635B,0xE98987:0x635C,
0xE9898A:0x635D,0xE9898D:0x635E,0xE9898E:0x635F,0xE9898F:0x6360,0xE98991:0x6361,
0xE98998:0x6362,0xE98999:0x6363,0xE9899C:0x6364,0xE9899D:0x6365,0xE989A0:0x6366,
0xE989A1:0x6367,0xE989A5:0x6368,0xE989A7:0x6369,0xE989A8:0x636A,0xE989A9:0x636B,
0xE989AE:0x636C,0xE989AF:0x636D,0xE989B0:0x636E,0xE989B5:0x636F,0xE989B6:0x6370,
0xE989B7:0x6371,0xE989B8:0x6372,0xE989B9:0x6373,0xE989BB:0x6374,0xE989BC:0x6375,
0xE989BD:0x6376,0xE989BF:0x6377,0xE98A88:0x6378,0xE98A89:0x6379,0xE98A8A:0x637A,
0xE98A8D:0x637B,0xE98A8E:0x637C,0xE98A92:0x637D,0xE98A97:0x637E,0xE98A99:0x6421,
0xE98A9F:0x6422,0xE98AA0:0x6423,0xE98AA4:0x6424,0xE98AA5:0x6425,0xE98AA7:0x6426,
0xE98AA8:0x6427,0xE98AAB:0x6428,0xE98AAF:0x6429,0xE98AB2:0x642A,0xE98AB6:0x642B,
0xE98AB8:0x642C,0xE98ABA:0x642D,0xE98ABB:0x642E,0xE98ABC:0x642F,0xE98ABD:0x6430,
0xE98ABF:0x6431,0xE98B80:0x6432,0xE98B81:0x6433,0xE98B82:0x6434,0xE98B83:0x6435,
0xE98B85:0x6436,0xE98B86:0x6437,0xE98B87:0x6438,0xE98B88:0x6439,0xE98B8B:0x643A,
0xE98B8C:0x643B,0xE98B8D:0x643C,0xE98B8E:0x643D,0xE98B90:0x643E,0xE98B93:0x643F,
0xE98B95:0x6440,0xE98B97:0x6441,0xE98B98:0x6442,0xE98B99:0x6443,0xE98B9C:0x6444,
0xE98B9D:0x6445,0xE98B9F:0x6446,0xE98BA0:0x6447,0xE98BA1:0x6448,0xE98BA3:0x6449,
0xE98BA5:0x644A,0xE98BA7:0x644B,0xE98BA8:0x644C,0xE98BAC:0x644D,0xE98BAE:0x644E,
0xE98BB0:0x644F,0xE98BB9:0x6450,0xE98BBB:0x6451,0xE98BBF:0x6452,0xE98C80:0x6453,
0xE98C82:0x6454,0xE98C88:0x6455,0xE98C8D:0x6456,0xE98C91:0x6457,0xE98C94:0x6458,
0xE98C95:0x6459,0xE98C9C:0x645A,0xE98C9D:0x645B,0xE98C9E:0x645C,0xE98C9F:0x645D,
0xE98CA1:0x645E,0xE98CA4:0x645F,0xE98CA5:0x6460,0xE98CA7:0x6461,0xE98CA9:0x6462,
0xE98CAA:0x6463,0xE98CB3:0x6464,0xE98CB4:0x6465,0xE98CB6:0x6466,0xE98CB7:0x6467,
0xE98D87:0x6468,0xE98D88:0x6469,0xE98D89:0x646A,0xE98D90:0x646B,0xE98D91:0x646C,
0xE98D92:0x646D,0xE98D95:0x646E,0xE98D97:0x646F,0xE98D98:0x6470,0xE98D9A:0x6471,
0xE98D9E:0x6472,0xE98DA4:0x6473,0xE98DA5:0x6474,0xE98DA7:0x6475,0xE98DA9:0x6476,
0xE98DAA:0x6477,0xE98DAD:0x6478,0xE98DAF:0x6479,0xE98DB0:0x647A,0xE98DB1:0x647B,
0xE98DB3:0x647C,0xE98DB4:0x647D,0xE98DB6:0x647E,0xE98DBA:0x6521,0xE98DBD:0x6522,
0xE98DBF:0x6523,0xE98E80:0x6524,0xE98E81:0x6525,0xE98E82:0x6526,0xE98E88:0x6527,
0xE98E8A:0x6528,0xE98E8B:0x6529,0xE98E8D:0x652A,0xE98E8F:0x652B,0xE98E92:0x652C,
0xE98E95:0x652D,0xE98E98:0x652E,0xE98E9B:0x652F,0xE98E9E:0x6530,0xE98EA1:0x6531,
0xE98EA3:0x6532,0xE98EA4:0x6533,0xE98EA6:0x6534,0xE98EA8:0x6535,0xE98EAB:0x6536,
0xE98EB4:0x6537,0xE98EB5:0x6538,0xE98EB6:0x6539,0xE98EBA:0x653A,0xE98EA9:0x653B,
0xE98F81:0x653C,0xE98F84:0x653D,0xE98F85:0x653E,0xE98F86:0x653F,0xE98F87:0x6540,
0xE98F89:0x6541,0xE98F8A:0x6542,0xE98F8B:0x6543,0xE98F8C:0x6544,0xE98F8D:0x6545,
0xE98F93:0x6546,0xE98F99:0x6547,0xE98F9C:0x6548,0xE98F9E:0x6549,0xE98F9F:0x654A,
0xE98FA2:0x654B,0xE98FA6:0x654C,0xE98FA7:0x654D,0xE98FB9:0x654E,0xE98FB7:0x654F,
0xE98FB8:0x6550,0xE98FBA:0x6551,0xE98FBB:0x6552,0xE98FBD:0x6553,0xE99081:0x6554,
0xE99082:0x6555,0xE99084:0x6556,0xE99088:0x6557,0xE99089:0x6558,0xE9908D:0x6559,
0xE9908E:0x655A,0xE9908F:0x655B,0xE99095:0x655C,0xE99096:0x655D,0xE99097:0x655E,
0xE9909F:0x655F,0xE990AE:0x6560,0xE990AF:0x6561,0xE990B1:0x6562,0xE990B2:0x6563,
0xE990B3:0x6564,0xE990B4:0x6565,0xE990BB:0x6566,0xE990BF:0x6567,0xE990BD:0x6568,
0xE99183:0x6569,0xE99185:0x656A,0xE99188:0x656B,0xE9918A:0x656C,0xE9918C:0x656D,
0xE99195:0x656E,0xE99199:0x656F,0xE9919C:0x6570,0xE9919F:0x6571,0xE991A1:0x6572,
0xE991A3:0x6573,0xE991A8:0x6574,0xE991AB:0x6575,0xE991AD:0x6576,0xE991AE:0x6577,
0xE991AF:0x6578,0xE991B1:0x6579,0xE991B2:0x657A,0xE99284:0x657B,0xE99283:0x657C,
0xE995B8:0x657D,0xE995B9:0x657E,0xE995BE:0x6621,0xE99684:0x6622,0xE99688:0x6623,
0xE9968C:0x6624,0xE9968D:0x6625,0xE9968E:0x6626,0xE9969D:0x6627,0xE9969E:0x6628,
0xE9969F:0x6629,0xE996A1:0x662A,0xE996A6:0x662B,0xE996A9:0x662C,0xE996AB:0x662D,
0xE996AC:0x662E,0xE996B4:0x662F,0xE996B6:0x6630,0xE996BA:0x6631,0xE996BD:0x6632,
0xE996BF:0x6633,0xE99786:0x6634,0xE99788:0x6635,0xE99789:0x6636,0xE9978B:0x6637,
0xE99790:0x6638,0xE99791:0x6639,0xE99792:0x663A,0xE99793:0x663B,0xE99799:0x663C,
0xE9979A:0x663D,0xE9979D:0x663E,0xE9979E:0x663F,0xE9979F:0x6640,0xE997A0:0x6641,
0xE997A4:0x6642,0xE997A6:0x6643,0xE9989D:0x6644,0xE9989E:0x6645,0xE998A2:0x6646,
0xE998A4:0x6647,0xE998A5:0x6648,0xE998A6:0x6649,0xE998AC:0x664A,0xE998B1:0x664B,
0xE998B3:0x664C,0xE998B7:0x664D,0xE998B8:0x664E,0xE998B9:0x664F,0xE998BA:0x6650,
0xE998BC:0x6651,0xE998BD:0x6652,0xE99981:0x6653,0xE99992:0x6654,0xE99994:0x6655,
0xE99996:0x6656,0xE99997:0x6657,0xE99998:0x6658,0xE999A1:0x6659,0xE999AE:0x665A,
0xE999B4:0x665B,0xE999BB:0x665C,0xE999BC:0x665D,0xE999BE:0x665E,0xE999BF:0x665F,
0xE99A81:0x6660,0xE99A82:0x6661,0xE99A83:0x6662,0xE99A84:0x6663,0xE99A89:0x6664,
0xE99A91:0x6665,0xE99A96:0x6666,0xE99A9A:0x6667,0xE99A9D:0x6668,0xE99A9F:0x6669,
0xE99AA4:0x666A,0xE99AA5:0x666B,0xE99AA6:0x666C,0xE99AA9:0x666D,0xE99AAE:0x666E,
0xE99AAF:0x666F,0xE99AB3:0x6670,0xE99ABA:0x6671,0xE99B8A:0x6672,0xE99B92:0x6673,
0xE5B6B2:0x6674,0xE99B98:0x6675,0xE99B9A:0x6676,0xE99B9D:0x6677,0xE99B9E:0x6678,
0xE99B9F:0x6679,0xE99BA9:0x667A,0xE99BAF:0x667B,0xE99BB1:0x667C,0xE99BBA:0x667D,
0xE99C82:0x667E,0xE99C83:0x6721,0xE99C85:0x6722,0xE99C89:0x6723,0xE99C9A:0x6724,
0xE99C9B:0x6725,0xE99C9D:0x6726,0xE99CA1:0x6727,0xE99CA2:0x6728,0xE99CA3:0x6729,
0xE99CA8:0x672A,0xE99CB1:0x672B,0xE99CB3:0x672C,0xE99D81:0x672D,0xE99D83:0x672E,
0xE99D8A:0x672F,0xE99D8E:0x6730,0xE99D8F:0x6731,0xE99D95:0x6732,0xE99D97:0x6733,
0xE99D98:0x6734,0xE99D9A:0x6735,0xE99D9B:0x6736,0xE99DA3:0x6737,0xE99DA7:0x6738,
0xE99DAA:0x6739,0xE99DAE:0x673A,0xE99DB3:0x673B,0xE99DB6:0x673C,0xE99DB7:0x673D,
0xE99DB8:0x673E,0xE99DBB:0x673F,0xE99DBD:0x6740,0xE99DBF:0x6741,0xE99E80:0x6742,
0xE99E89:0x6743,0xE99E95:0x6744,0xE99E96:0x6745,0xE99E97:0x6746,0xE99E99:0x6747,
0xE99E9A:0x6748,0xE99E9E:0x6749,0xE99E9F:0x674A,0xE99EA2:0x674B,0xE99EAC:0x674C,
0xE99EAE:0x674D,0xE99EB1:0x674E,0xE99EB2:0x674F,0xE99EB5:0x6750,0xE99EB6:0x6751,
0xE99EB8:0x6752,0xE99EB9:0x6753,0xE99EBA:0x6754,0xE99EBC:0x6755,0xE99EBE:0x6756,
0xE99EBF:0x6757,0xE99F81:0x6758,0xE99F84:0x6759,0xE99F85:0x675A,0xE99F87:0x675B,
0xE99F89:0x675C,0xE99F8A:0x675D,0xE99F8C:0x675E,0xE99F8D:0x675F,0xE99F8E:0x6760,
0xE99F90:0x6761,0xE99F91:0x6762,0xE99F94:0x6763,0xE99F97:0x6764,0xE99F98:0x6765,
0xE99F99:0x6766,0xE99F9D:0x6767,0xE99F9E:0x6768,0xE99FA0:0x6769,0xE99F9B:0x676A,
0xE99FA1:0x676B,0xE99FA4:0x676C,0xE99FAF:0x676D,0xE99FB1:0x676E,0xE99FB4:0x676F,
0xE99FB7:0x6770,0xE99FB8:0x6771,0xE99FBA:0x6772,0xE9A087:0x6773,0xE9A08A:0x6774,
0xE9A099:0x6775,0xE9A08D:0x6776,0xE9A08E:0x6777,0xE9A094:0x6778,0xE9A096:0x6779,
0xE9A09C:0x677A,0xE9A09E:0x677B,0xE9A0A0:0x677C,0xE9A0A3:0x677D,0xE9A0A6:0x677E,
0xE9A0AB:0x6821,0xE9A0AE:0x6822,0xE9A0AF:0x6823,0xE9A0B0:0x6824,0xE9A0B2:0x6825,
0xE9A0B3:0x6826,0xE9A0B5:0x6827,0xE9A0A5:0x6828,0xE9A0BE:0x6829,0xE9A184:0x682A,
0xE9A187:0x682B,0xE9A18A:0x682C,0xE9A191:0x682D,0xE9A192:0x682E,0xE9A193:0x682F,
0xE9A196:0x6830,0xE9A197:0x6831,0xE9A199:0x6832,0xE9A19A:0x6833,0xE9A1A2:0x6834,
0xE9A1A3:0x6835,0xE9A1A5:0x6836,0xE9A1A6:0x6837,0xE9A1AA:0x6838,0xE9A1AC:0x6839,
0xE9A2AB:0x683A,0xE9A2AD:0x683B,0xE9A2AE:0x683C,0xE9A2B0:0x683D,0xE9A2B4:0x683E,
0xE9A2B7:0x683F,0xE9A2B8:0x6840,0xE9A2BA:0x6841,0xE9A2BB:0x6842,0xE9A2BF:0x6843,
0xE9A382:0x6844,0xE9A385:0x6845,0xE9A388:0x6846,0xE9A38C:0x6847,0xE9A3A1:0x6848,
0xE9A3A3:0x6849,0xE9A3A5:0x684A,0xE9A3A6:0x684B,0xE9A3A7:0x684C,0xE9A3AA:0x684D,
0xE9A3B3:0x684E,0xE9A3B6:0x684F,0xE9A482:0x6850,0xE9A487:0x6851,0xE9A488:0x6852,
0xE9A491:0x6853,0xE9A495:0x6854,0xE9A496:0x6855,0xE9A497:0x6856,0xE9A49A:0x6857,
0xE9A49B:0x6858,0xE9A49C:0x6859,0xE9A49F:0x685A,0xE9A4A2:0x685B,0xE9A4A6:0x685C,
0xE9A4A7:0x685D,0xE9A4AB:0x685E,0xE9A4B1:0x685F,0xE9A4B2:0x6860,0xE9A4B3:0x6861,
0xE9A4B4:0x6862,0xE9A4B5:0x6863,0xE9A4B9:0x6864,0xE9A4BA:0x6865,0xE9A4BB:0x6866,
0xE9A4BC:0x6867,0xE9A580:0x6868,0xE9A581:0x6869,0xE9A586:0x686A,0xE9A587:0x686B,
0xE9A588:0x686C,0xE9A58D:0x686D,0xE9A58E:0x686E,0xE9A594:0x686F,0xE9A598:0x6870,
0xE9A599:0x6871,0xE9A59B:0x6872,0xE9A59C:0x6873,0xE9A59E:0x6874,0xE9A59F:0x6875,
0xE9A5A0:0x6876,0xE9A69B:0x6877,0xE9A69D:0x6878,0xE9A69F:0x6879,0xE9A6A6:0x687A,
0xE9A6B0:0x687B,0xE9A6B1:0x687C,0xE9A6B2:0x687D,0xE9A6B5:0x687E,0xE9A6B9:0x6921,
0xE9A6BA:0x6922,0xE9A6BD:0x6923,0xE9A6BF:0x6924,0xE9A783:0x6925,0xE9A789:0x6926,
0xE9A793:0x6927,0xE9A794:0x6928,0xE9A799:0x6929,0xE9A79A:0x692A,0xE9A79C:0x692B,
0xE9A79E:0x692C,0xE9A7A7:0x692D,0xE9A7AA:0x692E,0xE9A7AB:0x692F,0xE9A7AC:0x6930,
0xE9A7B0:0x6931,0xE9A7B4:0x6932,0xE9A7B5:0x6933,0xE9A7B9:0x6934,0xE9A7BD:0x6935,
0xE9A7BE:0x6936,0xE9A882:0x6937,0xE9A883:0x6938,0xE9A884:0x6939,0xE9A88B:0x693A,
0xE9A88C:0x693B,0xE9A890:0x693C,0xE9A891:0x693D,0xE9A896:0x693E,0xE9A89E:0x693F,
0xE9A8A0:0x6940,0xE9A8A2:0x6941,0xE9A8A3:0x6942,0xE9A8A4:0x6943,0xE9A8A7:0x6944,
0xE9A8AD:0x6945,0xE9A8AE:0x6946,0xE9A8B3:0x6947,0xE9A8B5:0x6948,0xE9A8B6:0x6949,
0xE9A8B8:0x694A,0xE9A987:0x694B,0xE9A981:0x694C,0xE9A984:0x694D,0xE9A98A:0x694E,
0xE9A98B:0x694F,0xE9A98C:0x6950,0xE9A98E:0x6951,0xE9A991:0x6952,0xE9A994:0x6953,
0xE9A996:0x6954,0xE9A99D:0x6955,0xE9AAAA:0x6956,0xE9AAAC:0x6957,0xE9AAAE:0x6958,
0xE9AAAF:0x6959,0xE9AAB2:0x695A,0xE9AAB4:0x695B,0xE9AAB5:0x695C,0xE9AAB6:0x695D,
0xE9AAB9:0x695E,0xE9AABB:0x695F,0xE9AABE:0x6960,0xE9AABF:0x6961,0xE9AB81:0x6962,
0xE9AB83:0x6963,0xE9AB86:0x6964,0xE9AB88:0x6965,0xE9AB8E:0x6966,0xE9AB90:0x6967,
0xE9AB92:0x6968,0xE9AB95:0x6969,0xE9AB96:0x696A,0xE9AB97:0x696B,0xE9AB9B:0x696C,
0xE9AB9C:0x696D,0xE9ABA0:0x696E,0xE9ABA4:0x696F,0xE9ABA5:0x6970,0xE9ABA7:0x6971,
0xE9ABA9:0x6972,0xE9ABAC:0x6973,0xE9ABB2:0x6974,0xE9ABB3:0x6975,0xE9ABB5:0x6976,
0xE9ABB9:0x6977,0xE9ABBA:0x6978,0xE9ABBD:0x6979,0xE9ABBF:0x697A,0xE9AC80:0x697B,
0xE9AC81:0x697C,0xE9AC82:0x697D,0xE9AC83:0x697E,0xE9AC84:0x6A21,0xE9AC85:0x6A22,
0xE9AC88:0x6A23,0xE9AC89:0x6A24,0xE9AC8B:0x6A25,0xE9AC8C:0x6A26,0xE9AC8D:0x6A27,
0xE9AC8E:0x6A28,0xE9AC90:0x6A29,0xE9AC92:0x6A2A,0xE9AC96:0x6A2B,0xE9AC99:0x6A2C,
0xE9AC9B:0x6A2D,0xE9AC9C:0x6A2E,0xE9ACA0:0x6A2F,0xE9ACA6:0x6A30,0xE9ACAB:0x6A31,
0xE9ACAD:0x6A32,0xE9ACB3:0x6A33,0xE9ACB4:0x6A34,0xE9ACB5:0x6A35,0xE9ACB7:0x6A36,
0xE9ACB9:0x6A37,0xE9ACBA:0x6A38,0xE9ACBD:0x6A39,0xE9AD88:0x6A3A,0xE9AD8B:0x6A3B,
0xE9AD8C:0x6A3C,0xE9AD95:0x6A3D,0xE9AD96:0x6A3E,0xE9AD97:0x6A3F,0xE9AD9B:0x6A40,
0xE9AD9E:0x6A41,0xE9ADA1:0x6A42,0xE9ADA3:0x6A43,0xE9ADA5:0x6A44,0xE9ADA6:0x6A45,
0xE9ADA8:0x6A46,0xE9ADAA:0x6A47,0xE9ADAB:0x6A48,0xE9ADAC:0x6A49,0xE9ADAD:0x6A4A,
0xE9ADAE:0x6A4B,0xE9ADB3:0x6A4C,0xE9ADB5:0x6A4D,0xE9ADB7:0x6A4E,0xE9ADB8:0x6A4F,
0xE9ADB9:0x6A50,0xE9ADBF:0x6A51,0xE9AE80:0x6A52,0xE9AE84:0x6A53,0xE9AE85:0x6A54,
0xE9AE86:0x6A55,0xE9AE87:0x6A56,0xE9AE89:0x6A57,0xE9AE8A:0x6A58,0xE9AE8B:0x6A59,
0xE9AE8D:0x6A5A,0xE9AE8F:0x6A5B,0xE9AE90:0x6A5C,0xE9AE94:0x6A5D,0xE9AE9A:0x6A5E,
0xE9AE9D:0x6A5F,0xE9AE9E:0x6A60,0xE9AEA6:0x6A61,0xE9AEA7:0x6A62,0xE9AEA9:0x6A63,
0xE9AEAC:0x6A64,0xE9AEB0:0x6A65,0xE9AEB1:0x6A66,0xE9AEB2:0x6A67,0xE9AEB7:0x6A68,
0xE9AEB8:0x6A69,0xE9AEBB:0x6A6A,0xE9AEBC:0x6A6B,0xE9AEBE:0x6A6C,0xE9AEBF:0x6A6D,
0xE9AF81:0x6A6E,0xE9AF87:0x6A6F,0xE9AF88:0x6A70,0xE9AF8E:0x6A71,0xE9AF90:0x6A72,
0xE9AF97:0x6A73,0xE9AF98:0x6A74,0xE9AF9D:0x6A75,0xE9AF9F:0x6A76,0xE9AFA5:0x6A77,
0xE9AFA7:0x6A78,0xE9AFAA:0x6A79,0xE9AFAB:0x6A7A,0xE9AFAF:0x6A7B,0xE9AFB3:0x6A7C,
0xE9AFB7:0x6A7D,0xE9AFB8:0x6A7E,0xE9AFB9:0x6B21,0xE9AFBA:0x6B22,0xE9AFBD:0x6B23,
0xE9AFBF:0x6B24,0xE9B080:0x6B25,0xE9B082:0x6B26,0xE9B08B:0x6B27,0xE9B08F:0x6B28,
0xE9B091:0x6B29,0xE9B096:0x6B2A,0xE9B098:0x6B2B,0xE9B099:0x6B2C,0xE9B09A:0x6B2D,
0xE9B09C:0x6B2E,0xE9B09E:0x6B2F,0xE9B0A2:0x6B30,0xE9B0A3:0x6B31,0xE9B0A6:0x6B32,
0xE9B0A7:0x6B33,0xE9B0A8:0x6B34,0xE9B0A9:0x6B35,0xE9B0AA:0x6B36,0xE9B0B1:0x6B37,
0xE9B0B5:0x6B38,0xE9B0B6:0x6B39,0xE9B0B7:0x6B3A,0xE9B0BD:0x6B3B,0xE9B181:0x6B3C,
0xE9B183:0x6B3D,0xE9B184:0x6B3E,0xE9B185:0x6B3F,0xE9B189:0x6B40,0xE9B18A:0x6B41,
0xE9B18E:0x6B42,0xE9B18F:0x6B43,0xE9B190:0x6B44,0xE9B193:0x6B45,0xE9B194:0x6B46,
0xE9B196:0x6B47,0xE9B198:0x6B48,0xE9B19B:0x6B49,0xE9B19D:0x6B4A,0xE9B19E:0x6B4B,
0xE9B19F:0x6B4C,0xE9B1A3:0x6B4D,0xE9B1A9:0x6B4E,0xE9B1AA:0x6B4F,0xE9B19C:0x6B50,
0xE9B1AB:0x6B51,0xE9B1A8:0x6B52,0xE9B1AE:0x6B53,0xE9B1B0:0x6B54,0xE9B1B2:0x6B55,
0xE9B1B5:0x6B56,0xE9B1B7:0x6B57,0xE9B1BB:0x6B58,0xE9B3A6:0x6B59,0xE9B3B2:0x6B5A,
0xE9B3B7:0x6B5B,0xE9B3B9:0x6B5C,0xE9B48B:0x6B5D,0xE9B482:0x6B5E,0xE9B491:0x6B5F,
0xE9B497:0x6B60,0xE9B498:0x6B61,0xE9B49C:0x6B62,0xE9B49D:0x6B63,0xE9B49E:0x6B64,
0xE9B4AF:0x6B65,0xE9B4B0:0x6B66,0xE9B4B2:0x6B67,0xE9B4B3:0x6B68,0xE9B4B4:0x6B69,
0xE9B4BA:0x6B6A,0xE9B4BC:0x6B6B,0xE9B585:0x6B6C,0xE9B4BD:0x6B6D,0xE9B582:0x6B6E,
0xE9B583:0x6B6F,0xE9B587:0x6B70,0xE9B58A:0x6B71,0xE9B593:0x6B72,0xE9B594:0x6B73,
0xE9B59F:0x6B74,0xE9B5A3:0x6B75,0xE9B5A2:0x6B76,0xE9B5A5:0x6B77,0xE9B5A9:0x6B78,
0xE9B5AA:0x6B79,0xE9B5AB:0x6B7A,0xE9B5B0:0x6B7B,0xE9B5B6:0x6B7C,0xE9B5B7:0x6B7D,
0xE9B5BB:0x6B7E,0xE9B5BC:0x6C21,0xE9B5BE:0x6C22,0xE9B683:0x6C23,0xE9B684:0x6C24,
0xE9B686:0x6C25,0xE9B68A:0x6C26,0xE9B68D:0x6C27,0xE9B68E:0x6C28,0xE9B692:0x6C29,
0xE9B693:0x6C2A,0xE9B695:0x6C2B,0xE9B696:0x6C2C,0xE9B697:0x6C2D,0xE9B698:0x6C2E,
0xE9B6A1:0x6C2F,0xE9B6AA:0x6C30,0xE9B6AC:0x6C31,0xE9B6AE:0x6C32,0xE9B6B1:0x6C33,
0xE9B6B5:0x6C34,0xE9B6B9:0x6C35,0xE9B6BC:0x6C36,0xE9B6BF:0x6C37,0xE9B783:0x6C38,
0xE9B787:0x6C39,0xE9B789:0x6C3A,0xE9B78A:0x6C3B,0xE9B794:0x6C3C,0xE9B795:0x6C3D,
0xE9B796:0x6C3E,0xE9B797:0x6C3F,0xE9B79A:0x6C40,0xE9B79E:0x6C41,0xE9B79F:0x6C42,
0xE9B7A0:0x6C43,0xE9B7A5:0x6C44,0xE9B7A7:0x6C45,0xE9B7A9:0x6C46,0xE9B7AB:0x6C47,
0xE9B7AE:0x6C48,0xE9B7B0:0x6C49,0xE9B7B3:0x6C4A,0xE9B7B4:0x6C4B,0xE9B7BE:0x6C4C,
0xE9B88A:0x6C4D,0xE9B882:0x6C4E,0xE9B887:0x6C4F,0xE9B88E:0x6C50,0xE9B890:0x6C51,
0xE9B891:0x6C52,0xE9B892:0x6C53,0xE9B895:0x6C54,0xE9B896:0x6C55,0xE9B899:0x6C56,
0xE9B89C:0x6C57,0xE9B89D:0x6C58,0xE9B9BA:0x6C59,0xE9B9BB:0x6C5A,0xE9B9BC:0x6C5B,
0xE9BA80:0x6C5C,0xE9BA82:0x6C5D,0xE9BA83:0x6C5E,0xE9BA84:0x6C5F,0xE9BA85:0x6C60,
0xE9BA87:0x6C61,0xE9BA8E:0x6C62,0xE9BA8F:0x6C63,0xE9BA96:0x6C64,0xE9BA98:0x6C65,
0xE9BA9B:0x6C66,0xE9BA9E:0x6C67,0xE9BAA4:0x6C68,0xE9BAA8:0x6C69,0xE9BAAC:0x6C6A,
0xE9BAAE:0x6C6B,0xE9BAAF:0x6C6C,0xE9BAB0:0x6C6D,0xE9BAB3:0x6C6E,0xE9BAB4:0x6C6F,
0xE9BAB5:0x6C70,0xE9BB86:0x6C71,0xE9BB88:0x6C72,0xE9BB8B:0x6C73,0xE9BB95:0x6C74,
0xE9BB9F:0x6C75,0xE9BBA4:0x6C76,0xE9BBA7:0x6C77,0xE9BBAC:0x6C78,0xE9BBAD:0x6C79,
0xE9BBAE:0x6C7A,0xE9BBB0:0x6C7B,0xE9BBB1:0x6C7C,0xE9BBB2:0x6C7D,0xE9BBB5:0x6C7E,
0xE9BBB8:0x6D21,0xE9BBBF:0x6D22,0xE9BC82:0x6D23,0xE9BC83:0x6D24,0xE9BC89:0x6D25,
0xE9BC8F:0x6D26,0xE9BC90:0x6D27,0xE9BC91:0x6D28,0xE9BC92:0x6D29,0xE9BC94:0x6D2A,
0xE9BC96:0x6D2B,0xE9BC97:0x6D2C,0xE9BC99:0x6D2D,0xE9BC9A:0x6D2E,0xE9BC9B:0x6D2F,
0xE9BC9F:0x6D30,0xE9BCA2:0x6D31,0xE9BCA6:0x6D32,0xE9BCAA:0x6D33,0xE9BCAB:0x6D34,
0xE9BCAF:0x6D35,0xE9BCB1:0x6D36,0xE9BCB2:0x6D37,0xE9BCB4:0x6D38,0xE9BCB7:0x6D39,
0xE9BCB9:0x6D3A,0xE9BCBA:0x6D3B,0xE9BCBC:0x6D3C,0xE9BCBD:0x6D3D,0xE9BCBF:0x6D3E,
0xE9BD81:0x6D3F,0xE9BD83:0x6D40,0xE9BD84:0x6D41,0xE9BD85:0x6D42,0xE9BD86:0x6D43,
0xE9BD87:0x6D44,0xE9BD93:0x6D45,0xE9BD95:0x6D46,0xE9BD96:0x6D47,0xE9BD97:0x6D48,
0xE9BD98:0x6D49,0xE9BD9A:0x6D4A,0xE9BD9D:0x6D4B,0xE9BD9E:0x6D4C,0xE9BDA8:0x6D4D,
0xE9BDA9:0x6D4E,0xE9BDAD:0x6D4F,0xE9BDAE:0x6D50,0xE9BDAF:0x6D51,0xE9BDB0:0x6D52,
0xE9BDB1:0x6D53,0xE9BDB3:0x6D54,0xE9BDB5:0x6D55,0xE9BDBA:0x6D56,0xE9BDBD:0x6D57,
0xE9BE8F:0x6D58,0xE9BE90:0x6D59,0xE9BE91:0x6D5A,0xE9BE92:0x6D5B,0xE9BE94:0x6D5C,
0xE9BE96:0x6D5D,0xE9BE97:0x6D5E,0xE9BE9E:0x6D5F,0xE9BEA1:0x6D60,0xE9BEA2:0x6D61,
0xE9BEA3:0x6D62,0xE9BEA5:0x6D63,

//FIXME: mojibake
0xE3809C:0x2141
};


/**
 * Encoding conversion table for JIS to UTF-8.
 *
 * @ignore
 */
var JIS_TO_UTF8_TABLE = null;

/**
 * The encoding conversion table for JIS X 0212:1990 (Hojo-Kanji) to UTF-8.
 *
 * @ignore
 */
var JISX0212_TO_UTF8_TABLE = null;

function init_JIS_TO_UTF8_TABLE() {
  if (JIS_TO_UTF8_TABLE === null) {
    JIS_TO_UTF8_TABLE = {};

    var keys = getKeys(UTF8_TO_JIS_TABLE);
    var i = 0;
    var len = keys.length;
    var key, value;

    for (; i < len; i++) {
      key = keys[i];
      value = UTF8_TO_JIS_TABLE[key];
      if (value > 0x5F) {
        JIS_TO_UTF8_TABLE[value] = key | 0;
      }
    }

    JISX0212_TO_UTF8_TABLE = {};
    keys = getKeys(UTF8_TO_JISX0212_TABLE);
    len = keys.length;

    for (i = 0; i < len; i++) {
      key = keys[i];
      value = UTF8_TO_JISX0212_TABLE[key];
      JISX0212_TO_UTF8_TABLE[value] = key | 0;
    }
  }
}

/**
 * Katakana table
 *
 * @ignore
 */
var hankanaCase_table = {
  0x3001:0xFF64,0x3002:0xFF61,0x300C:0xFF62,0x300D:0xFF63,0x309B:0xFF9E,
  0x309C:0xFF9F,0x30A1:0xFF67,0x30A2:0xFF71,0x30A3:0xFF68,0x30A4:0xFF72,
  0x30A5:0xFF69,0x30A6:0xFF73,0x30A7:0xFF6A,0x30A8:0xFF74,0x30A9:0xFF6B,
  0x30AA:0xFF75,0x30AB:0xFF76,0x30AD:0xFF77,0x30AF:0xFF78,0x30B1:0xFF79,
  0x30B3:0xFF7A,0x30B5:0xFF7B,0x30B7:0xFF7C,0x30B9:0xFF7D,0x30BB:0xFF7E,
  0x30BD:0xFF7F,0x30BF:0xFF80,0x30C1:0xFF81,0x30C3:0xFF6F,0x30C4:0xFF82,
  0x30C6:0xFF83,0x30C8:0xFF84,0x30CA:0xFF85,0x30CB:0xFF86,0x30CC:0xFF87,
  0x30CD:0xFF88,0x30CE:0xFF89,0x30CF:0xFF8A,0x30D2:0xFF8B,0x30D5:0xFF8C,
  0x30D8:0xFF8D,0x30DB:0xFF8E,0x30DE:0xFF8F,0x30DF:0xFF90,0x30E0:0xFF91,
  0x30E1:0xFF92,0x30E2:0xFF93,0x30E3:0xFF6C,0x30E4:0xFF94,0x30E5:0xFF6D,
  0x30E6:0xFF95,0x30E7:0xFF6E,0x30E8:0xFF96,0x30E9:0xFF97,0x30EA:0xFF98,
  0x30EB:0xFF99,0x30EC:0xFF9A,0x30ED:0xFF9B,0x30EF:0xFF9C,0x30F2:0xFF66,
  0x30F3:0xFF9D,0x30FB:0xFF65,0x30FC:0xFF70
};

/**
 * @ignore
 */
var hankanaCase_sonants = {
  0x30F4:0xFF73,
  0x30F7:0xFF9C,
  0x30FA:0xFF66
};

/**
 * Sonant marks.
 *
 * @ignore
 */
var hankanaCase_marks = [0xFF9E, 0xFF9F];

/**
 * Zenkaku table [U+FF61] - [U+FF9F]
 *
 * @ignore
 */
var zenkanaCase_table = [
  0x3002, 0x300C, 0x300D, 0x3001, 0x30FB, 0x30F2, 0x30A1, 0x30A3,
  0x30A5, 0x30A7, 0x30A9, 0x30E3, 0x30E5, 0x30E7, 0x30C3, 0x30FC,
  0x30A2, 0x30A4, 0x30A6, 0x30A8, 0x30AA, 0x30AB, 0x30AD, 0x30AF,
  0x30B1, 0x30B3, 0x30B5, 0x30B7, 0x30B9, 0x30BB, 0x30BD, 0x30BF,
  0x30C1, 0x30C4, 0x30C6, 0x30C8, 0x30CA, 0x30CB, 0x30CC, 0x30CD,
  0x30CE, 0x30CF, 0x30D2, 0x30D5, 0x30D8, 0x30DB, 0x30DE, 0x30DF,
  0x30E0, 0x30E1, 0x30E2, 0x30E4, 0x30E6, 0x30E8, 0x30E9, 0x30EA,
  0x30EB, 0x30EC, 0x30ED, 0x30EF, 0x30F3, 0x309B, 0x309C
];

return Encoding;
});

},{}],8:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],9:[function(require,module,exports){
/*!
 * node-inherit
 * Copyright(c) 2011 Dmitry Filatov <dfilatov@yandex-team.ru>
 * MIT Licensed
 */

module.exports = require('./lib/inherit');

},{"./lib/inherit":10}],10:[function(require,module,exports){
/**
 * @module inherit
 * @version 2.2.2
 * @author Filatov Dmitry <dfilatov@yandex-team.ru>
 * @description This module provides some syntax sugar for "class" declarations, constructors, mixins, "super" calls and static members.
 */

(function(global) {

var hasIntrospection = (function(){'_';}).toString().indexOf('_') > -1,
    emptyBase = function() {},
    hasOwnProperty = Object.prototype.hasOwnProperty,
    objCreate = Object.create || function(ptp) {
        var inheritance = function() {};
        inheritance.prototype = ptp;
        return new inheritance();
    },
    objKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            hasOwnProperty.call(obj, i) && res.push(i);
        }
        return res;
    },
    extend = function(o1, o2) {
        for(var i in o2) {
            hasOwnProperty.call(o2, i) && (o1[i] = o2[i]);
        }

        return o1;
    },
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    isFunction = function(obj) {
        return toStr.call(obj) === '[object Function]';
    },
    noOp = function() {},
    needCheckProps = true,
    testPropObj = { toString : '' };

for(var i in testPropObj) { // fucking ie hasn't toString, valueOf in for
    testPropObj.hasOwnProperty(i) && (needCheckProps = false);
}

var specProps = needCheckProps? ['toString', 'valueOf'] : null;

function getPropList(obj) {
    var res = objKeys(obj);
    if(needCheckProps) {
        var specProp, i = 0;
        while(specProp = specProps[i++]) {
            obj.hasOwnProperty(specProp) && res.push(specProp);
        }
    }

    return res;
}

function override(base, res, add) {
    var addList = getPropList(add),
        j = 0, len = addList.length,
        name, prop;
    while(j < len) {
        if((name = addList[j++]) === '__self') {
            continue;
        }
        prop = add[name];
        if(isFunction(prop) &&
                (!hasIntrospection || prop.toString().indexOf('.__base') > -1)) {
            res[name] = (function(name, prop) {
                var baseMethod = base[name]?
                        base[name] :
                        name === '__constructor'? // case of inheritance from plane function
                            res.__self.__parent :
                            noOp;
                return function() {
                    var baseSaved = this.__base;
                    this.__base = baseMethod;
                    var res = prop.apply(this, arguments);
                    this.__base = baseSaved;
                    return res;
                };
            })(name, prop);
        } else {
            res[name] = prop;
        }
    }
}

function applyMixins(mixins, res) {
    var i = 1, mixin;
    while(mixin = mixins[i++]) {
        res?
            isFunction(mixin)?
                inherit.self(res, mixin.prototype, mixin) :
                inherit.self(res, mixin) :
            res = isFunction(mixin)?
                inherit(mixins[0], mixin.prototype, mixin) :
                inherit(mixins[0], mixin);
    }
    return res || mixins[0];
}

/**
* Creates class
* @exports
* @param {Function|Array} [baseClass|baseClassAndMixins] class (or class and mixins) to inherit from
* @param {Object} prototypeFields
* @param {Object} [staticFields]
* @returns {Function} class
*/
function inherit() {
    var args = arguments,
        withMixins = isArray(args[0]),
        hasBase = withMixins || isFunction(args[0]),
        base = hasBase? withMixins? applyMixins(args[0]) : args[0] : emptyBase,
        props = args[hasBase? 1 : 0] || {},
        staticProps = args[hasBase? 2 : 1],
        res = props.__constructor || (hasBase && base.prototype.__constructor)?
            function() {
                return this.__constructor.apply(this, arguments);
            } :
            hasBase?
                function() {
                    return base.apply(this, arguments);
                } :
                function() {};

    if(!hasBase) {
        res.prototype = props;
        res.prototype.__self = res.prototype.constructor = res;
        return extend(res, staticProps);
    }

    extend(res, base);

    res.__parent = base;

    var basePtp = base.prototype,
        resPtp = res.prototype = objCreate(basePtp);

    resPtp.__self = resPtp.constructor = res;

    props && override(basePtp, resPtp, props);
    staticProps && override(base, res, staticProps);

    return res;
}

inherit.self = function() {
    var args = arguments,
        withMixins = isArray(args[0]),
        base = withMixins? applyMixins(args[0], args[0][0]) : args[0],
        props = args[1],
        staticProps = args[2],
        basePtp = base.prototype;

    props && override(basePtp, basePtp, props);
    staticProps && override(base, base, staticProps);

    return base;
};

var defineAsGlobal = true;
if(typeof exports === 'object') {
    module.exports = inherit;
    defineAsGlobal = false;
}

if(typeof modules === 'object') {
    modules.define('inherit', function(provide) {
        provide(inherit);
    });
    defineAsGlobal = false;
}

if(typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = inherit;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.inherit = inherit);

})(this);

},{}],11:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.1.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:01Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// We once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optimization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur(),
				// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// Ensure the complete handler is called before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// Toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = window.location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// Support: BlackBerry 5, iOS 3 (original iPhone)
		// If we don't have gBCR, just use 0,0 rather than error
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

},{}],12:[function(require,module,exports){
'use strict';


var yaml = require('./lib/js-yaml.js');


module.exports = yaml;

},{"./lib/js-yaml.js":13}],13:[function(require,module,exports){
'use strict';


var loader = require('./js-yaml/loader');
var dumper = require('./js-yaml/dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type                = require('./js-yaml/type');
module.exports.Schema              = require('./js-yaml/schema');
module.exports.FAILSAFE_SCHEMA     = require('./js-yaml/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./js-yaml/schema/json');
module.exports.CORE_SCHEMA         = require('./js-yaml/schema/core');
module.exports.DEFAULT_SAFE_SCHEMA = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_FULL_SCHEMA = require('./js-yaml/schema/default_full');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.safeLoad            = loader.safeLoad;
module.exports.safeLoadAll         = loader.safeLoadAll;
module.exports.dump                = dumper.dump;
module.exports.safeDump            = dumper.safeDump;
module.exports.YAMLException       = require('./js-yaml/exception');

// Deprecated schema names from JS-YAML 2.0.x
module.exports.MINIMAL_SCHEMA = require('./js-yaml/schema/failsafe');
module.exports.SAFE_SCHEMA    = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_SCHEMA = require('./js-yaml/schema/default_full');

// Deprecated functions from JS-YAML 1.x.x
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');

},{"./js-yaml/dumper":15,"./js-yaml/exception":16,"./js-yaml/loader":17,"./js-yaml/schema":19,"./js-yaml/schema/core":20,"./js-yaml/schema/default_full":21,"./js-yaml/schema/default_safe":22,"./js-yaml/schema/failsafe":23,"./js-yaml/schema/json":24,"./js-yaml/type":25}],14:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (typeof subject === 'undefined') || (null === subject);
}


function isObject(subject) {
  return (typeof subject === 'object') && (null !== subject);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) {
    return sequence;
  } else if (isNothing(sequence)) {
    return [];
  }
  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (0 === number) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;

},{}],15:[function(require,module,exports){
'use strict';

/*eslint-disable no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (null === map) {
    return {};
  }

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if ('!!' === tag.slice(0, 2)) {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap[tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

function State(options) {
  this.schema      = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent      = Math.max(1, (options['indent'] || 2));
  this.skipInvalid = options['skipInvalid'] || false;
  this.flowLevel   = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap    = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys    = options['sortKeys'] || false;
  this.lineWidth    = options['lineWidth'] || 80;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== '\n') {
      result += ind;
    }
    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

function StringBuilder(source) {
  this.source = source;
  this.result = '';
  this.checkpoint = 0;
}

StringBuilder.prototype.takeUpTo = function (position) {
  var er;

  if (position < this.checkpoint) {
    er = new Error('position should be > checkpoint');
    er.position = position;
    er.checkpoint = this.checkpoint;
    throw er;
  }

  this.result += this.source.slice(this.checkpoint, position);
  this.checkpoint = position;
  return this;
};

StringBuilder.prototype.escapeChar = function () {
  var character, esc;

  character = this.source.charCodeAt(this.checkpoint);
  esc = ESCAPE_SEQUENCES[character] || encodeHex(character);
  this.result += esc;
  this.checkpoint += 1;

  return this;
};

StringBuilder.prototype.finish = function () {
  if (this.source.length > this.checkpoint) {
    this.takeUpTo(this.source.length);
  }
};

function writeScalar(state, object, level, iskey) {
  var simple, first, spaceWrap, folded, literal, single, double,
      sawLineFeed, linePosition, longestLine, indent, max, character,
      position, escapeSeq, hexEsc, previous, lineLength, modifier,
      trailingLineBreaks, result;

  if (0 === object.length) {
    state.dump = "''";
    return;
  }

  if (-1 !== DEPRECATED_BOOLEANS_SYNTAX.indexOf(object)) {
    state.dump = "'" + object + "'";
    return;
  }

  simple = true;
  first = object.length ? object.charCodeAt(0) : 0;
  spaceWrap = (CHAR_SPACE === first ||
               CHAR_SPACE === object.charCodeAt(object.length - 1));

  // Simplified check for restricted first characters
  // http://www.yaml.org/spec/1.2/spec.html#ns-plain-first%28c%29
  if (CHAR_MINUS         === first ||
      CHAR_QUESTION      === first ||
      CHAR_COMMERCIAL_AT === first ||
      CHAR_GRAVE_ACCENT  === first) {
    simple = false;
  }

  // can only use > and | if not wrapped in spaces or is not a key.
  if (spaceWrap) {
    simple = false;
    folded = false;
    literal = false;
  } else {
    folded = !iskey;
    literal = !iskey;
  }

  single = true;
  double = new StringBuilder(object);

  sawLineFeed = false;
  linePosition = 0;
  longestLine = 0;

  indent = state.indent * level;
  max = state.lineWidth;
  if (max === -1) {
    // Replace -1 with biggest ingeger number according to
    // http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
    max = 9007199254740991;
  }

  if (indent < 40) {
    max -= indent;
  } else {
    max = 40;
  }

  for (position = 0; position < object.length; position++) {
    character = object.charCodeAt(position);
    if (simple) {
      // Characters that can never appear in the simple scalar
      if (!simpleChar(character)) {
        simple = false;
      } else {
        // Still simple.  If we make it all the way through like
        // this, then we can just dump the string as-is.
        continue;
      }
    }

    if (single && character === CHAR_SINGLE_QUOTE) {
      single = false;
    }

    escapeSeq = ESCAPE_SEQUENCES[character];
    hexEsc = needsHexEscape(character);

    if (!escapeSeq && !hexEsc) {
      continue;
    }

    if (character !== CHAR_LINE_FEED &&
        character !== CHAR_DOUBLE_QUOTE &&
        character !== CHAR_SINGLE_QUOTE) {
      folded = false;
      literal = false;
    } else if (character === CHAR_LINE_FEED) {
      sawLineFeed = true;
      single = false;
      if (position > 0) {
        previous = object.charCodeAt(position - 1);
        if (previous === CHAR_SPACE) {
          literal = false;
          folded = false;
        }
      }
      if (folded) {
        lineLength = position - linePosition;
        linePosition = position;
        if (lineLength > longestLine) {
          longestLine = lineLength;
        }
      }
    }

    if (character !== CHAR_DOUBLE_QUOTE) {
      single = false;
    }

    double.takeUpTo(position);
    double.escapeChar();
  }

  if (simple && testImplicitResolving(state, object)) {
    simple = false;
  }

  modifier = '';
  if (folded || literal) {
    trailingLineBreaks = 0;
    if (object.charCodeAt(object.length - 1) === CHAR_LINE_FEED) {
      trailingLineBreaks += 1;
      if (object.charCodeAt(object.length - 2) === CHAR_LINE_FEED) {
        trailingLineBreaks += 1;
      }
    }

    if (trailingLineBreaks === 0) {
      modifier = '-';
    } else if (trailingLineBreaks === 2) {
      modifier = '+';
    }
  }

  if (literal && longestLine < max) {
    folded = false;
  }

  // If it's literally one line, then don't bother with the literal.
  // We may still want to do a fold, though, if it's a super long line.
  if (!sawLineFeed) {
    literal = false;
  }

  if (simple) {
    state.dump = object;
  } else if (single) {
    state.dump = '\'' + object + '\'';
  } else if (folded) {
    result = fold(object, max);
    state.dump = '>' + modifier + '\n' + indentString(result, indent);
  } else if (literal) {
    if (!modifier) {
      object = object.replace(/\n$/, '');
    }
    state.dump = '|' + modifier + '\n' + indentString(object, indent);
  } else if (double) {
    double.finish();
    state.dump = '"' + double.result + '"';
  } else {
    throw new Error('Failed to dump scalar value');
  }

  return;
}

// The `trailing` var is a regexp match of any trailing `\n` characters.
//
// There are three cases we care about:
//
// 1. One trailing `\n` on the string.  Just use `|` or `>`.
//    This is the assumed default. (trailing = null)
// 2. No trailing `\n` on the string.  Use `|-` or `>-` to "chomp" the end.
// 3. More than one trailing `\n` on the string.  Use `|+` or `>+`.
//
// In the case of `>+`, these line breaks are *not* doubled (like the line
// breaks within the string), so it's important to only end with the exact
// same number as we started.
function fold(object, max) {
  var result = '',
      position = 0,
      length = object.length,
      trailing = /\n+$/.exec(object),
      newLine;

  if (trailing) {
    length = trailing.index + 1;
  }

  while (position < length) {
    newLine = object.indexOf('\n', position);
    if (newLine > length || newLine === -1) {
      if (result) {
        result += '\n\n';
      }
      result += foldLine(object.slice(position, length), max);
      position = length;
    } else {
      if (result) {
        result += '\n\n';
      }
      result += foldLine(object.slice(position, newLine), max);
      position = newLine + 1;
    }
  }
  if (trailing && trailing[0] !== '\n') {
    result += trailing[0];
  }

  return result;
}

function foldLine(line, max) {
  if (line === '') {
    return line;
  }

  var foldRe = /[^\s] [^\s]/g,
      result = '',
      prevMatch = 0,
      foldStart = 0,
      match = foldRe.exec(line),
      index,
      foldEnd,
      folded;

  while (match) {
    index = match.index;

    // when we cross the max len, if the previous match would've
    // been ok, use that one, and carry on.  If there was no previous
    // match on this fold section, then just have a long line.
    if (index - foldStart > max) {
      if (prevMatch !== foldStart) {
        foldEnd = prevMatch;
      } else {
        foldEnd = index;
      }

      if (result) {
        result += '\n';
      }
      folded = line.slice(foldStart, foldEnd);
      result += folded;
      foldStart = foldEnd + 1;
    }
    prevMatch = index + 1;
    match = foldRe.exec(line);
  }

  if (result) {
    result += '\n';
  }

  // if we end up with one last word at the end, then the last bit might
  // be slightly bigger than we wanted, because we exited out of the loop.
  if (foldStart !== prevMatch && line.length - foldStart > max) {
    result += line.slice(foldStart, prevMatch) + '\n' +
              line.slice(prevMatch + 1);
  } else {
    result += line.slice(foldStart);
  }

  return result;
}

// Returns true if character can be found in a simple scalar
function simpleChar(character) {
  return CHAR_TAB                  !== character &&
         CHAR_LINE_FEED            !== character &&
         CHAR_CARRIAGE_RETURN      !== character &&
         CHAR_COMMA                !== character &&
         CHAR_LEFT_SQUARE_BRACKET  !== character &&
         CHAR_RIGHT_SQUARE_BRACKET !== character &&
         CHAR_LEFT_CURLY_BRACKET   !== character &&
         CHAR_RIGHT_CURLY_BRACKET  !== character &&
         CHAR_SHARP                !== character &&
         CHAR_AMPERSAND            !== character &&
         CHAR_ASTERISK             !== character &&
         CHAR_EXCLAMATION          !== character &&
         CHAR_VERTICAL_LINE        !== character &&
         CHAR_GREATER_THAN         !== character &&
         CHAR_SINGLE_QUOTE         !== character &&
         CHAR_DOUBLE_QUOTE         !== character &&
         CHAR_PERCENT              !== character &&
         CHAR_COLON                !== character &&
         !ESCAPE_SEQUENCES[character]            &&
         !needsHexEscape(character);
}

// Returns true if the character code needs to be escaped.
function needsHexEscape(character) {
  return !((0x00020 <= character && character <= 0x00007E) ||
           (0x00085 === character)                         ||
           (0x000A0 <= character && character <= 0x00D7FF) ||
           (0x0E000 <= character && character <= 0x00FFFD) ||
           (0x10000 <= character && character <= 0x10FFFF));
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (0 !== index) {
        _result += ', ';
      }
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || 0 !== index) {
        _result += generateNextLine(state, level);
      }
      _result += '- ' + state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (0 !== index) {
      pairBuffer += ', ';
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) {
      pairBuffer += '? ';
    }

    pairBuffer += state.dump + ': ';

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || 0 !== index) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (null !== state.tag && '?' !== state.tag) ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || (('object' === typeof object) && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if ('[object Function]' === _toString.call(type.represent)) {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (0 > state.flowLevel || state.flowLevel > level);
  }

  var objectOrArray = '[object Object]' === type || '[object Array]' === type,
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((null !== state.tag && '?' !== state.tag) || duplicate || (2 !== state.indent && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if ('[object Object]' === type) {
      if (block && (0 !== Object.keys(state.dump).length)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if ('[object Array]' === type) {
      if (block && (0 !== state.dump.length)) {
        writeBlockSequence(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if ('[object String]' === type) {
      if ('?' !== state.tag) {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) {
        return false;
      }
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (null !== state.tag && '?' !== state.tag) {
      state.dump = '!<' + state.tag + '> ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (null !== object && 'object' === typeof object) {
    index = objects.indexOf(object);
    if (-1 !== index) {
      if (-1 === duplicatesIndexes.indexOf(index)) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  getDuplicateReferences(input, state);

  if (writeNode(state, 0, input, true, true)) {
    return state.dump + '\n';
  }
  return '';
}

function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}

module.exports.dump     = dump;
module.exports.safeDump = safeDump;

},{"./common":14,"./exception":16,"./schema/default_full":21,"./schema/default_safe":22}],16:[function(require,module,exports){
// YAML error class. http://stackoverflow.com/questions/8458984
//
'use strict';


var inherits = require('inherit');


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');
}


// Inherit from Error
inherits(YAMLException, Error);


YAMLException.prototype.toString = function toString(compact) {
  var result = this.name + ': ';

  result += this.reason || '(unknown reason)';

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


module.exports = YAMLException;

},{"inherit":9}],17:[function(require,module,exports){
'use strict';

/*eslint-disable max-len,no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var Mark                = require('./mark');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return 0x2C/* , */ === c ||
         0x5B/* [ */ === c ||
         0x5D/* ] */ === c ||
         0x7B/* { */ === c ||
         0x7D/* } */ === c;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(((c - 0x010000) >> 10) + 0xD800,
                             ((c - 0x010000) & 0x03FF) + 0xDC00);
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  this.legacy    = options['legacy']    || false;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (null !== state.version) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (1 !== args.length) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (null === match) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (1 !== major) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (1 !== minor && 2 !== minor) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

  TAG: function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (2 !== args.length) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      state.tagMap[handle] = prefix;
    }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length;
           _position < _length;
           _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(0x09 === _character ||
              0x20 <= _character && _character <= 0x10FFFF)) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
    }
  }
}

function storeMappingPair(state, _result, keyTag, keyNode, valueNode) {
  var index, quantity;

  keyNode = String(keyNode);

  if (null === _result) {
    _result = {};
  }

  if ('tag:yaml.org,2002:merge' === keyTag) {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index]);
      }
    } else {
      mergeMappings(state, _result, valueNode);
    }
  } else {
    _result[keyNode] = valueNode;
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (0x0A/* LF */ === ch) {
    state.position++;
  } else if (0x0D/* CR */ === ch) {
    state.position++;
    if (0x0A/* LF */ === state.input.charCodeAt(state.position)) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && 0x23/* # */ === ch) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && 0 !== ch);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (0x20/* Space */ === ch) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (-1 !== checkIndent && 0 !== lineBreaks && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((0x2D/* - */ === ch || 0x2E/* . */ === ch) &&
      state.input.charCodeAt(_position + 1) === ch &&
      state.input.charCodeAt(_position + 2) === ch) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (1 === count) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)             ||
      is_FLOW_INDICATOR(ch)        ||
      0x23/* # */           === ch ||
      0x26/* & */           === ch ||
      0x2A/* * */           === ch ||
      0x21/* ! */           === ch ||
      0x7C/* | */           === ch ||
      0x3E/* > */           === ch ||
      0x27/* ' */           === ch ||
      0x22/* " */           === ch ||
      0x25/* % */           === ch ||
      0x40/* @ */           === ch ||
      0x60/* ` */           === ch) {
    return false;
  }

  if (0x3F/* ? */ === ch || 0x2D/* - */ === ch) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (0 !== ch) {
    if (0x3A/* : */ === ch) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (0x23/* # */ === ch) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (0x27/* ' */ !== ch) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    if (0x27/* ' */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (0x27/* ' */ === ch) {
        captureStart = captureEnd = state.position;
        state.position++;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x22/* " */ !== ch) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    if (0x22/* " */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (0x5C/* \ */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (0 !== ch) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (0x3F/* ? */ === ch) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && 0x3A/* : */ === ch) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (0x2C/* , */ === ch) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (0 !== ch) {
    ch = state.input.charCodeAt(++state.position);

    if (0x2B/* + */ === ch || 0x2D/* - */ === ch) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (0x2B/* + */ === ch) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (0x23/* # */ === ch) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (0 !== ch));
    }
  }

  while (0 !== ch) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (0x20/* Space */ === ch)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (detectedIndent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat('\n', emptyLines + 1);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (0 === emptyLines) {
        if (detectedIndent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else if (detectedIndent) {
      // If current line isn't the first one - count line break from the last content line.
      state.result += common.repeat('\n', emptyLines + 1);
    } else {
      // In case of the first content line - count only empty lines.
      state.result += common.repeat('\n', emptyLines);
    }

    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (0 !== ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {

    if (0x2D/* - */ !== ch) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (0 !== ch)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((0x3F/* ? */ === ch || 0x3A/* : */  === ch) && is_WS_OR_EOL(following)) {

      if (0x3F/* ? */ === ch) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (0x3A/* : */ === ch) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, keyTag, keyNode, valueNode);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if (state.lineIndent > nodeIndent && (0 !== ch)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x21/* ! */ !== ch) {
    return false;
  }

  if (null !== state.tag) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (0x3C/* < */ === ch) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (0x21/* ! */ === ch) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (0 !== ch && 0x3E/* > */ !== ch);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (0 !== ch && !is_WS_OR_EOL(ch)) {

      if (0x21/* ! */ === ch) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if ('!' === tagHandle) {
    state.tag = '!' + tagName;

  } else if ('!!' === tagHandle) {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x26/* & */ !== ch) {
    return false;
  }

  if (null !== state.anchor) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x2A/* * */ !== ch) {
    return false;
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent;

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (1 === indentStatus) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (1 === indentStatus || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (1 === indentStatus) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (null !== state.tag || null !== state.anchor) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (null === state.tag) {
            state.tag = '?';
          }
        }

        if (null !== state.anchor) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (0 === indentStatus) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (null !== state.tag && '!' !== state.tag) {
    if ('?' === state.tag) {
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
           typeIndex < typeQuantity;
           typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (null !== state.anchor) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
      type = state.typeMap[state.tag];

      if (null !== state.result && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result);
        if (null !== state.anchor) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  return null !== state.tag || null !== state.anchor || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || 0x25/* % */ !== ch) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (0 !== ch && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (0 !== ch) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (0x23/* # */ === ch) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (0 !== ch && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) {
        break;
      }

      _position = state.position;

      while (0 !== ch && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (0 !== ch) {
      readLineBreak(state);
    }

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (0 === state.lineIndent &&
      0x2D/* - */ === state.input.charCodeAt(state.position) &&
      0x2D/* - */ === state.input.charCodeAt(state.position + 1) &&
      0x2D/* - */ === state.input.charCodeAt(state.position + 2)) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (0x2E/* . */ === state.input.charCodeAt(state.position)) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (0x0A/* LF */ !== input.charCodeAt(input.length - 1) &&
        0x0D/* CR */ !== input.charCodeAt(input.length - 1)) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (0x20/* Space */ === state.input.charCodeAt(state.position)) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  var documents = loadDocuments(input, options), index, length;

  for (index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (0 === documents.length) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (1 === documents.length) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


function safeLoadAll(input, output, options) {
  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


function safeLoad(input, options) {
  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.loadAll     = loadAll;
module.exports.load        = load;
module.exports.safeLoadAll = safeLoadAll;
module.exports.safeLoad    = safeLoad;

},{"./common":14,"./exception":16,"./mark":18,"./schema/default_full":21,"./schema/default_safe":22}],18:[function(require,module,exports){
'use strict';


var common = require('./common');


function Mark(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) {
    return null;
  }

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1))) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end))) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
         common.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


module.exports = Mark;

},{"./common":14}],19:[function(require,module,exports){
'use strict';

/*eslint-disable max-len*/

var common        = require('./common');
var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return -1 === exclude.indexOf(index);
  });
}


function compileMap(/* lists... */) {
  var result = {}, index, length;

  function collectType(type) {
    result[type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}


function Schema(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && 'scalar' !== type.loadKind) {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema.DEFAULT = null;


Schema.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
  case 1:
    schemas = Schema.DEFAULT;
    types = arguments[0];
    break;

  case 2:
    schemas = arguments[0];
    types = arguments[1];
    break;

  default:
    throw new YAMLException('Wrong number of arguments for Schema.create function');
  }

  schemas = common.toArray(schemas);
  types = common.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type; })) {
    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema({
    include: schemas,
    explicit: types
  });
};


module.exports = Schema;

},{"./common":14,"./exception":16,"./type":25}],20:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./json')
  ]
});

},{"../schema":19,"./json":24}],21:[function(require,module,exports){
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.


'use strict';


var Schema = require('../schema');


module.exports = Schema.DEFAULT = new Schema({
  include: [
    require('./default_safe')
  ],
  explicit: [
    require('../type/js/undefined'),
    require('../type/js/regexp'),
    require('../type/js/function')
  ]
});

},{"../schema":19,"../type/js/function":30,"../type/js/regexp":31,"../type/js/undefined":32,"./default_safe":22}],22:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./core')
  ],
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../schema":19,"../type/binary":26,"../type/merge":34,"../type/omap":36,"../type/pairs":37,"../type/set":39,"../type/timestamp":41,"./core":20}],23:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":19,"../type/map":33,"../type/seq":38,"../type/str":40}],24:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./failsafe')
  ],
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../schema":19,"../type/bool":27,"../type/float":28,"../type/int":29,"../type/null":35,"./failsafe":23}],25:[function(require,module,exports){
'use strict';

var YAMLException = require('./exception');

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (null !== map) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (-1 === TYPE_CONSTRUCTOR_OPTIONS.indexOf(name)) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag          = tag;
  this.kind         = options['kind']         || null;
  this.resolve      = options['resolve']      || function () { return true; };
  this.construct    = options['construct']    || function (data) { return data; };
  this.instanceOf   = options['instanceOf']   || null;
  this.predicate    = options['predicate']    || null;
  this.represent    = options['represent']    || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (-1 === YAML_NODE_KINDS.indexOf(this.kind)) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;

},{"./exception":16}],26:[function(require,module,exports){
'use strict';

/*eslint-disable no-bitwise*/

// A trick for browserified version.
// Since we make browserifier to ignore `buffer` module, NodeBuffer will be undefined
var NodeBuffer = require('buffer').Buffer;
var Type       = require('../type');


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (null === data) {
    return false;
  }

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) { continue; }

    // Fail on illegal characters
    if (code < 0) { return false; }

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  // Wrap into Buffer for NodeJS and leave Array for browser
  if (NodeBuffer) {
    return new NodeBuffer(result);
  }

  return result;
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

},{"../type":25,"buffer":1}],27:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  if (null === data) {
    return false;
  }

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return '[object Boolean]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":25}],28:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

var YAML_FLOAT_PATTERN = new RegExp(
  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  '|[-+]?\\.(?:inf|Inf|INF)' +
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (null === data) {
    return false;
  }

  if (!YAML_FLOAT_PATTERN.test(data)) {
    return false;
  }
  return true;
}

function constructYamlFloat(data) {
  var value, sign, base, digits;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = '-' === value[0] ? -1 : 1;
  digits = [];

  if (0 <= '+-'.indexOf(value[0])) {
    value = value.slice(1);
  }

  if ('.inf' === value) {
    return (1 === sign) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if ('.nan' === value) {
    return NaN;

  } else if (0 <= value.indexOf(':')) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    return sign * value;

  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
    case 'lowercase':
      return '.nan';
    case 'uppercase':
      return '.NAN';
    case 'camelcase':
      return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '.inf';
    case 'uppercase':
      return '.INF';
    case 'camelcase':
      return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '-.inf';
    case 'uppercase':
      return '-.INF';
    case 'camelcase':
      return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 !== object % 1 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

},{"../common":14,"../type":25}],29:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (null === data) {
    return false;
  }

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) { return false; }

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) { return true; }
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') { continue; }
        if (ch !== '0' && ch !== '1') {
          return false;
        }
        hasDigits = true;
      }
      return hasDigits;
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') { continue; }
        if (!isHexCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      return hasDigits;
    }

    // base 8
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') { continue; }
      if (!isOctCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    return hasDigits;
  }

  // base 10 (except 0) or base 60

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') { continue; }
    if (ch === ':') { break; }
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  if (!hasDigits) { return false; }

  // if !base60 - done;
  if (ch !== ':') { return true; }

  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') { sign = -1; }
    value = value.slice(1);
    ch = value[0];
  }

  if ('0' === value) {
    return 0;
  }

  if (ch === '0') {
    if (value[1] === 'b') {
      return sign * parseInt(value.slice(2), 2);
    }
    if (value[1] === 'x') {
      return sign * parseInt(value, 16);
    }
    return sign * parseInt(value, 8);

  }

  if (value.indexOf(':') !== -1) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    return sign * value;

  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 === object % 1 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (object) { return '0b' + object.toString(2); },
    octal:       function (object) { return '0'  + object.toString(8); },
    decimal:     function (object) { return        object.toString(10); },
    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../common":14,"../type":25}],30:[function(require,module,exports){
'use strict';

var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  esprima = require('esprima');
} catch (_) {
  /*global window */
  if (typeof window !== 'undefined') { esprima = window.esprima; }
}

var Type = require('../../type');

function resolveJavascriptFunction(data) {
  if (null === data) {
    return false;
  }

  try {
    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true });

    if ('Program'             !== ast.type         ||
        1                     !== ast.body.length  ||
        'ExpressionStatement' !== ast.body[0].type ||
        'FunctionExpression'  !== ast.body[0].expression.type) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

function constructJavascriptFunction(data) {
  /*jslint evil:true*/

  var source = '(' + data + ')',
      ast    = esprima.parse(source, { range: true }),
      params = [],
      body;

  if ('Program'             !== ast.type         ||
      1                     !== ast.body.length  ||
      'ExpressionStatement' !== ast.body[0].type ||
      'FunctionExpression'  !== ast.body[0].expression.type) {
    throw new Error('Failed to resolve function');
  }

  ast.body[0].expression.params.forEach(function (param) {
    params.push(param.name);
  });

  body = ast.body[0].expression.body.range;

  // Esprima's ranges include the first '{' and the last '}' characters on
  // function expressions. So cut them out.
  /*eslint-disable no-new-func*/
  return new Function(params, source.slice(body[0] + 1, body[1] - 1));
}

function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}

function isFunction(object) {
  return '[object Function]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:js/function', {
  kind: 'scalar',
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});

},{"../../type":25,"esprima":42}],31:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptRegExp(data) {
  if (null === data) {
    return false;
  }

  if (0 === data.length) {
    return false;
  }

  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // if regexp starts with '/' it can have modifiers and must be properly closed
  // `/foo/gim` - modifiers tail can be maximum 3 chars
  if ('/' === regexp[0]) {
    if (tail) {
      modifiers = tail[1];
    }

    if (modifiers.length > 3) { return false; }
    // if expression starts with /, is should be properly terminated
    if (regexp[regexp.length - modifiers.length - 1] !== '/') { return false; }

    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  try {
    return true;
  } catch (error) {
    return false;
  }
}

function constructJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // `/foo/gim` - tail can be maximum 4 chars
  if ('/' === regexp[0]) {
    if (tail) {
      modifiers = tail[1];
    }
    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  return new RegExp(regexp, modifiers);
}

function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) {
    result += 'g';
  }

  if (object.multiline) {
    result += 'm';
  }

  if (object.ignoreCase) {
    result += 'i';
  }

  return result;
}

function isRegExp(object) {
  return '[object RegExp]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:js/regexp', {
  kind: 'scalar',
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});

},{"../../type":25}],32:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptUndefined() {
  return true;
}

function constructJavascriptUndefined() {
  /*eslint-disable no-undefined*/
  return undefined;
}

function representJavascriptUndefined() {
  return '';
}

function isUndefined(object) {
  return 'undefined' === typeof object;
}

module.exports = new Type('tag:yaml.org,2002:js/undefined', {
  kind: 'scalar',
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});

},{"../../type":25}],33:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return null !== data ? data : {}; }
});

},{"../type":25}],34:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlMerge(data) {
  return '<<' === data || null === data;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

},{"../type":25}],35:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlNull(data) {
  if (null === data) {
    return true;
  }

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return null === object;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":25}],36:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (null === data) {
    return true;
  }

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) {
          pairHasKey = true;
        } else {
          return false;
        }
      }
    }

    if (!pairHasKey) {
      return false;
    }

    if (-1 === objectKeys.indexOf(pairKey)) {
      objectKeys.push(pairKey);
    } else {
      return false;
    }
  }

  return true;
}

function constructYamlOmap(data) {
  return null !== data ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

},{"../type":25}],37:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (null === data) {
    return true;
  }

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    keys = Object.keys(pair);

    if (1 !== keys.length) {
      return false;
    }

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (null === data) {
    return [];
  }

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

},{"../type":25}],38:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return null !== data ? data : []; }
});

},{"../type":25}],39:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (null === data) {
    return true;
  }

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (null !== object[key]) {
        return false;
      }
    }
  }

  return true;
}

function constructYamlSet(data) {
  return null !== data ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

},{"../type":25}],40:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return null !== data ? data : ''; }
});

},{"../type":25}],41:[function(require,module,exports){
'use strict';

var Type = require('../type');

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:(?:[Tt]|[ \\t]+)'              + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?)?$');         // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (null === data) {
    return false;
  }

  if (YAML_TIMESTAMP_REGEXP.exec(data) === null) {
    return false;
  }

  return true;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (null === match) {
    throw new Error('Date resolve error');
  }

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if ('-' === match[9]) {
      delta = -delta;
    }
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) {
    date.setTime(date.getTime() - delta);
  }

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

},{"../type":25}],42:[function(require,module,exports){
/*
  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        FnExprTokens,
        Syntax,
        PlaceHolders,
        Messages,
        Regex,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        hasLineTerminator,
        lastIndex,
        lastLineNumber,
        lastLineStart,
        startIndex,
        startLineNumber,
        startLineStart,
        scanning,
        length,
        lookahead,
        state,
        extra,
        isBindingElement,
        isAssignmentTarget,
        firstCoverInitializedNameError;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9,
        Template: 10
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';
    TokenName[Token.Template] = 'Template';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForOfStatement: 'ForOfStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    PlaceHolders = {
        ArrowParameterPlaceHolder: 'ArrowParameterPlaceHolder'
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
        DefaultRestParameter: 'Unexpected token =',
        ObjectPatternAsRestParameter: 'Unexpected token {',
        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
        DuplicateConstructor: 'A class may only have one constructor',
        StaticPrototype: 'Classes may not have static property named prototype',
        MissingFromClause: 'Unexpected token',
        NoAsAfterImportNamespace: 'Unexpected token',
        InvalidModuleSpecifier: 'Unexpected token',
        IllegalImportDeclaration: 'Unexpected token',
        IllegalExportDeclaration: 'Unexpected token',
        DuplicateBinding: 'Duplicate binding %0'
    };

    // See also tools/generate-unicode-regex.js.
    Regex = {
        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,

        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        /* istanbul ignore if */
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 0x30 && ch <= 0x39);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }

    function octalToDecimal(ch) {
        // \0 is not octal escape sequence
        var octal = (ch !== '0'), code = '01234567'.indexOf(ch);

        if (index < length && isOctalDigit(source[index])) {
            octal = true;
            code = code * 8 + '01234567'.indexOf(source[index++]);

            // 3 digits are only allowed when string starts
            // with 0, 1, 2, 3
            if ('0123'.indexOf(ch) >= 0 &&
                    index < length &&
                    isOctalDigit(source[index])) {
                code = code * 8 + '01234567'.indexOf(source[index++]);
            }
        }

        return {
            code: code,
            octal: octal
        };
    }

    // ECMA-262 11.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // ECMA-262 11.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // ECMA-262 11.6 Identifier Names and Identifiers

    function fromCodePoint(cp) {
        return (cp < 0x10000) ? String.fromCharCode(cp) :
            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
            String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
    }

    function isIdentifierStart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch)));
    }

    // ECMA-262 11.6.2.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'enum':
        case 'export':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // ECMA-262 11.6.2.1 Keywords

    function isKeyword(id) {
        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // ECMA-262 11.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment;

        assert(typeof start === 'number', 'Comment must have valid position');

        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
        if (extra.attachComment) {
            extra.leadingComments.push(comment);
            extra.trailingComments.push(comment);
        }
        if (extra.tokenize) {
            comment.type = comment.type + 'Comment';
            if (extra.delegate) {
                comment = extra.delegate(comment);
            }
            extra.tokens.push(comment);
        }
    }

    function skipSingleLineComment(offset) {
        var start, loc, ch, comment;

        start = index - offset;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - offset
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                if (extra.comments) {
                    comment = source.slice(start + offset, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + offset, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
                    ++index;
                }
                hasLineTerminator = true;
                ++lineNumber;
                ++index;
                lineStart = index;
            } else if (ch === 0x2A) {
                // Block comment ends with '*/'.
                if (source.charCodeAt(index + 1) === 0x2F) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        // Ran off the end of the file - the whole thing is a comment
        if (extra.comments) {
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            comment = source.slice(start + 2, index);
            addComment('Block', comment, start, index, loc);
        }
        tolerateUnexpectedToken();
    }

    function skipComment() {
        var ch, start;
        hasLineTerminator = false;

        start = (index === 0);
        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                ++index;
                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                start = true;
            } else if (ch === 0x2F) { // U+002F is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 0x2F) {
                    ++index;
                    ++index;
                    skipSingleLineComment(2);
                    start = true;
                } else if (ch === 0x2A) {  // U+002A is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) { // U+002D is '-'
                // U+003E is '>'
                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                    // '-->' is a single-line comment
                    index += 3;
                    skipSingleLineComment(3);
                } else {
                    break;
                }
            } else if (ch === 0x3C) { // U+003C is '<'
                if (source.slice(index + 1, index + 4) === '!--') {
                    ++index; // `<`
                    ++index; // `!`
                    ++index; // `-`
                    ++index; // `-`
                    skipSingleLineComment(4);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanUnicodeCodePointEscape() {
        var ch, code;

        ch = source[index];
        code = 0;

        // At least, one hex digit is required.
        if (ch === '}') {
            throwUnexpectedToken();
        }

        while (index < length) {
            ch = source[index++];
            if (!isHexDigit(ch)) {
                break;
            }
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        }

        if (code > 0x10FFFF || ch !== '}') {
            throwUnexpectedToken();
        }

        return fromCodePoint(code);
    }

    function codePointAt(i) {
        var cp, first, second;

        cp = source.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDBFF) {
            second = source.charCodeAt(i + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                first = cp;
                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }

        return cp;
    }

    function getComplexIdentifier() {
        var cp, ch, id;

        cp = codePointAt(index);
        id = fromCodePoint(cp);
        index += id.length;

        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (cp === 0x5C) {
            if (source.charCodeAt(index) !== 0x75) {
                throwUnexpectedToken();
            }
            ++index;
            if (source[index] === '{') {
                ++index;
                ch = scanUnicodeCodePointEscape();
            } else {
                ch = scanHexEscape('u');
                cp = ch.charCodeAt(0);
                if (!ch || ch === '\\' || !isIdentifierStart(cp)) {
                    throwUnexpectedToken();
                }
            }
            id = ch;
        }

        while (index < length) {
            cp = codePointAt(index);
            if (!isIdentifierPart(cp)) {
                break;
            }
            ch = fromCodePoint(cp);
            id += ch;
            index += ch.length;

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (cp === 0x5C) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 0x75) {
                    throwUnexpectedToken();
                }
                ++index;
                if (source[index] === '{') {
                    ++index;
                    ch = scanUnicodeCodePointEscape();
                } else {
                    ch = scanHexEscape('u');
                    cp = ch.charCodeAt(0);
                    if (!ch || ch === '\\' || !isIdentifierPart(cp)) {
                        throwUnexpectedToken();
                    }
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 0x5C) {
                // Blackslash (U+005C) marks Unicode escape sequence.
                index = start;
                return getComplexIdentifier();
            } else if (ch >= 0xD800 && ch < 0xDFFF) {
                // Need to handle surrogate pairs.
                index = start;
                return getComplexIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (U+005C) starts an escaped character.
        id = (source.charCodeAt(index) === 0x5C) ? getComplexIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }


    // ECMA-262 11.7 Punctuators

    function scanPunctuator() {
        var token, str;

        token = {
            type: Token.Punctuator,
            value: '',
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: index,
            end: index
        };

        // Check for most common single-character punctuators.
        str = source[index];
        switch (str) {

        case '(':
            if (extra.tokenize) {
                extra.openParenToken = extra.tokenValues.length;
            }
            ++index;
            break;

        case '{':
            if (extra.tokenize) {
                extra.openCurlyToken = extra.tokenValues.length;
            }
            state.curlyStack.push('{');
            ++index;
            break;

        case '.':
            ++index;
            if (source[index] === '.' && source[index + 1] === '.') {
                // Spread operator: ...
                index += 2;
                str = '...';
            }
            break;

        case '}':
            ++index;
            state.curlyStack.pop();
            break;
        case ')':
        case ';':
        case ',':
        case '[':
        case ']':
        case ':':
        case '?':
        case '~':
            ++index;
            break;

        default:
            // 4-character punctuator.
            str = source.substr(index, 4);
            if (str === '>>>=') {
                index += 4;
            } else {

                // 3-character punctuators.
                str = str.substr(0, 3);
                if (str === '===' || str === '!==' || str === '>>>' ||
                    str === '<<=' || str === '>>=') {
                    index += 3;
                } else {

                    // 2-character punctuators.
                    str = str.substr(0, 2);
                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                        str === '<=' || str === '>=' || str === '=>') {
                        index += 2;
                    } else {

                        // 1-character punctuators.
                        str = source[index];
                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                            ++index;
                        }
                    }
                }
            }
        }

        if (index === token.start) {
            throwUnexpectedToken();
        }

        token.end = index;
        token.value = str;
        return token;
    }

    // ECMA-262 11.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanBinaryLiteral(start) {
        var ch, number;

        number = '';

        while (index < length) {
            ch = source[index];
            if (ch !== '0' && ch !== '1') {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            // only 0b or 0B
            throwUnexpectedToken();
        }

        if (index < length) {
            ch = source.charCodeAt(index);
            /* istanbul ignore else */
            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                throwUnexpectedToken();
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 2),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanOctalLiteral(prefix, start) {
        var number, octal;

        if (isOctalDigit(prefix)) {
            octal = true;
            number = '0' + source[index++];
        } else {
            octal = false;
            ++index;
            number = '';
        }

        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (!octal && number.length === 0) {
            // only 0o or 0O
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function isImplicitOctalLiteral() {
        var i, ch;

        // Implicit octal, unless there is a non-octal digit.
        // (Annex B.1.1 on Numeric Literals)
        for (i = index + 1; i < length; ++i) {
            ch = source[i];
            if (ch === '8' || ch === '9') {
                return false;
            }
            if (!isOctalDigit(ch)) {
                return true;
            }
        }

        return true;
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (ch === 'b' || ch === 'B') {
                    ++index;
                    return scanBinaryLiteral(start);
                }
                if (ch === 'o' || ch === 'O') {
                    return scanOctalLiteral(ch, start);
                }

                if (isOctalDigit(ch)) {
                    if (isImplicitOctalLiteral()) {
                        return scanOctalLiteral(ch, start);
                    }
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwUnexpectedToken();
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, unescaped, octToDec, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            str += scanUnicodeCodePointEscape();
                        } else {
                            unescaped = scanHexEscape(ch);
                            if (!unescaped) {
                                throw throwUnexpectedToken();
                            }
                            str += unescaped;
                        }
                        break;
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;
                    case '8':
                    case '9':
                        str += ch;
                        tolerateUnexpectedToken();
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            octToDec = octalToDecimal(ch);

                            octal = octToDec.octal || octal;
                            str += String.fromCharCode(octToDec.code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwUnexpectedToken();
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: startLineNumber,
            lineStart: startLineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.6 Template Literal Lexical Components

    function scanTemplate() {
        var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;

        terminated = false;
        tail = false;
        start = index;
        head = (source[index] === '`');
        rawOffset = 2;

        ++index;

        while (index < length) {
            ch = source[index++];
            if (ch === '`') {
                rawOffset = 1;
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (source[index] === '{') {
                    state.curlyStack.push('${');
                    ++index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        cooked += '\n';
                        break;
                    case 'r':
                        cooked += '\r';
                        break;
                    case 't':
                        cooked += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            cooked += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                cooked += unescaped;
                            } else {
                                index = restore;
                                cooked += ch;
                            }
                        }
                        break;
                    case 'b':
                        cooked += '\b';
                        break;
                    case 'f':
                        cooked += '\f';
                        break;
                    case 'v':
                        cooked += '\v';
                        break;

                    default:
                        if (ch === '0') {
                            if (isDecimalDigit(source.charCodeAt(index))) {
                                // Illegal: \01 \02 and so on
                                throwError(Messages.TemplateOctalLiteral);
                            }
                            cooked += '\0';
                        } else if (isOctalDigit(ch)) {
                            // Illegal: \1 \2
                            throwError(Messages.TemplateOctalLiteral);
                        } else {
                            cooked += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                ++lineNumber;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                lineStart = index;
                cooked += '\n';
            } else {
                cooked += ch;
            }
        }

        if (!terminated) {
            throwUnexpectedToken();
        }

        if (!head) {
            state.curlyStack.pop();
        }

        return {
            type: Token.Template,
            value: {
                cooked: cooked,
                raw: source.slice(start + 1, index - rawOffset)
            },
            head: head,
            tail: tail,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // ECMA-262 11.8.5 Regular Expression Literals

    function testRegExp(pattern, flags) {
        // The BMP character to use as a replacement for astral symbols when
        // translating an ES6 "u"-flagged pattern to an ES5-compatible
        // approximation.
        // Note: replacing with '\uFFFF' enables false positives in unlikely
        // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
        // pattern that would not be detected by this substitution.
        var astralSubstitute = '\uFFFF',
            tmp = pattern;

        if (flags.indexOf('u') >= 0) {
            tmp = tmp
                // Replace every Unicode escape sequence with the equivalent
                // BMP character or a constant ASCII code point in the case of
                // astral symbols. (See the above note on `astralSubstitute`
                // for more information.)
                .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
                    var codePoint = parseInt($1 || $2, 16);
                    if (codePoint > 0x10FFFF) {
                        throwUnexpectedToken(null, Messages.InvalidRegExp);
                    }
                    if (codePoint <= 0xFFFF) {
                        return String.fromCharCode(codePoint);
                    }
                    return astralSubstitute;
                })
                // Replace each paired surrogate with a single ASCII symbol to
                // avoid throwing on regular expressions that are only valid in
                // combination with the "u" flag.
                .replace(
                    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                    astralSubstitute
                );
        }

        // First, detect invalid regular expressions.
        try {
            RegExp(tmp);
        } catch (e) {
            throwUnexpectedToken(null, Messages.InvalidRegExp);
        }

        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        try {
            return new RegExp(pattern, flags);
        } catch (exception) {
            return null;
        }
    }

    function scanRegExpBody() {
        var ch, str, classMarker, terminated, body;

        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        classMarker = false;
        terminated = false;
        while (index < length) {
            ch = source[index++];
            str += ch;
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch.charCodeAt(0))) {
                    throwUnexpectedToken(null, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                throwUnexpectedToken(null, Messages.UnterminatedRegExp);
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                }
            }
        }

        if (!terminated) {
            throwUnexpectedToken(null, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        body = str.substr(1, str.length - 2);
        return {
            value: body,
            literal: str
        };
    }

    function scanRegExpFlags() {
        var ch, str, flags, restore;

        str = '';
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                    tolerateUnexpectedToken();
                } else {
                    str += '\\';
                    tolerateUnexpectedToken();
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        return {
            value: flags,
            literal: str
        };
    }

    function scanRegExp() {
        var start, body, flags, value;
        scanning = true;

        lookahead = null;
        skipComment();
        start = index;

        body = scanRegExpBody();
        flags = scanRegExpFlags();
        value = testRegExp(body.value, flags.value);
        scanning = false;
        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                regex: {
                    pattern: body.value,
                    flags: flags.value
                },
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        return {
            literal: body.literal + flags.literal,
            value: value,
            regex: {
                pattern: body.value,
                flags: flags.value
            },
            start: start,
            end: index
        };
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = scanRegExp();

        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        /* istanbul ignore next */
        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }

            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                regex: regex.regex,
                range: [pos, index],
                loc: loc
            });
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design

    function advanceSlash() {
        var regex, previous, check;

        function testKeyword(value) {
            return value && (value.length > 1) && (value[0] >= 'a') && (value[0] <= 'z');
        }

        previous = extra.tokenValues[extra.tokens.length - 1];
        regex = (previous !== null);

        switch (previous) {
        case 'this':
        case ']':
            regex = false;
            break;

        case ')':
            check = extra.tokenValues[extra.openParenToken - 1];
            regex = (check === 'if' || check === 'while' || check === 'for' || check === 'with');
            break;

        case '}':
            // Dividing a function by anything makes little sense,
            // but we have to check for that.
            regex = false;
            if (testKeyword(extra.tokenValues[extra.openCurlyToken - 3])) {
                // Anonymous function, e.g. function(){} /42
                check = extra.tokenValues[extra.openCurlyToken - 4];
                regex = check ? (FnExprTokens.indexOf(check) < 0) : false;
            } else if (testKeyword(extra.tokenValues[extra.openCurlyToken - 4])) {
                // Named function, e.g. function f(){} /42/
                check = extra.tokenValues[extra.openCurlyToken - 5];
                regex = check ? (FnExprTokens.indexOf(check) < 0) : true;
            }
        }

        return regex ? collectRegex() : scanPunctuator();
    }

    function advance() {
        var cp, token;

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: index,
                end: index
            };
        }

        cp = source.charCodeAt(index);

        if (isIdentifierStart(cp)) {
            token = scanIdentifier();
            if (strict && isStrictModeReservedWord(token.value)) {
                token.type = Token.Keyword;
            }
            return token;
        }

        // Very common: ( and ) and ;
        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
            return scanPunctuator();
        }

        // String literal starts with single quote (U+0027) or double quote (U+0022).
        if (cp === 0x27 || cp === 0x22) {
            return scanStringLiteral();
        }

        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if (cp === 0x2E) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(cp)) {
            return scanNumericLiteral();
        }

        // Slash (/) U+002F can also start a regex.
        if (extra.tokenize && cp === 0x2F) {
            return advanceSlash();
        }

        // Template literals start with ` (U+0060) for template head
        // or } (U+007D) for template middle or template tail.
        if (cp === 0x60 || (cp === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {
            return scanTemplate();
        }

        // Possible identifier start in a surrogate pair.
        if (cp >= 0xD800 && cp < 0xDFFF) {
            cp = codePointAt(index);
            if (isIdentifierStart(cp)) {
                return scanIdentifier();
            }
        }

        return scanPunctuator();
    }

    function collectToken() {
        var loc, token, value, entry;

        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            value = source.slice(token.start, token.end);
            entry = {
                type: TokenName[token.type],
                value: value,
                range: [token.start, token.end],
                loc: loc
            };
            if (token.regex) {
                entry.regex = {
                    pattern: token.regex.pattern,
                    flags: token.regex.flags
                };
            }
            if (extra.tokenValues) {
                extra.tokenValues.push((entry.type === 'Punctuator' || entry.type === 'Keyword') ? entry.value : null);
            }
            if (extra.tokenize) {
                if (!extra.range) {
                    delete entry.range;
                }
                if (!extra.loc) {
                    delete entry.loc;
                }
                if (extra.delegate) {
                    entry = extra.delegate(entry);
                }
            }
            extra.tokens.push(entry);
        }

        return token;
    }

    function lex() {
        var token;
        scanning = true;

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        skipComment();

        token = lookahead;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
        return token;
    }

    function peek() {
        scanning = true;

        skipComment();

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
    }

    function Position() {
        this.line = startLineNumber;
        this.column = startIndex - startLineStart;
    }

    function SourceLocation() {
        this.start = new Position();
        this.end = null;
    }

    function WrappingSourceLocation(startToken) {
        this.start = {
            line: startToken.lineNumber,
            column: startToken.start - startToken.lineStart
        };
        this.end = null;
    }

    function Node() {
        if (extra.range) {
            this.range = [startIndex, 0];
        }
        if (extra.loc) {
            this.loc = new SourceLocation();
        }
    }

    function WrappingNode(startToken) {
        if (extra.range) {
            this.range = [startToken.start, 0];
        }
        if (extra.loc) {
            this.loc = new WrappingSourceLocation(startToken);
        }
    }

    WrappingNode.prototype = Node.prototype = {

        processComment: function () {
            var lastChild,
                innerComments,
                leadingComments,
                trailingComments,
                bottomRight = extra.bottomRightStack,
                i,
                comment,
                last = bottomRight[bottomRight.length - 1];

            if (this.type === Syntax.Program) {
                if (this.body.length > 0) {
                    return;
                }
            }
            /**
             * patch innnerComments for properties empty block
             * `function a() {/** comments **\/}`
             */

            if (this.type === Syntax.BlockStatement && this.body.length === 0) {
                innerComments = [];
                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
                    comment = extra.leadingComments[i];
                    if (this.range[1] >= comment.range[1]) {
                        innerComments.unshift(comment);
                        extra.leadingComments.splice(i, 1);
                        extra.trailingComments.splice(i, 1);
                    }
                }
                if (innerComments.length) {
                    this.innerComments = innerComments;
                    //bottomRight.push(this);
                    return;
                }
            }

            if (extra.trailingComments.length > 0) {
                trailingComments = [];
                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
                    comment = extra.trailingComments[i];
                    if (comment.range[0] >= this.range[1]) {
                        trailingComments.unshift(comment);
                        extra.trailingComments.splice(i, 1);
                    }
                }
                extra.trailingComments = [];
            } else {
                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
                    trailingComments = last.trailingComments;
                    delete last.trailingComments;
                }
            }

            // Eating the stack.
            while (last && last.range[0] >= this.range[0]) {
                lastChild = bottomRight.pop();
                last = bottomRight[bottomRight.length - 1];
            }

            if (lastChild) {
                if (lastChild.leadingComments) {
                    leadingComments = [];
                    for (i = lastChild.leadingComments.length - 1; i >= 0; --i) {
                        comment = lastChild.leadingComments[i];
                        if (comment.range[1] <= this.range[0]) {
                            leadingComments.unshift(comment);
                            lastChild.leadingComments.splice(i, 1);
                        }
                    }

                    if (!lastChild.leadingComments.length) {
                        lastChild.leadingComments = undefined;
                    }
                }
            } else if (extra.leadingComments.length > 0) {
                leadingComments = [];
                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
                    comment = extra.leadingComments[i];
                    if (comment.range[1] <= this.range[0]) {
                        leadingComments.unshift(comment);
                        extra.leadingComments.splice(i, 1);
                    }
                }
            }


            if (leadingComments && leadingComments.length > 0) {
                this.leadingComments = leadingComments;
            }
            if (trailingComments && trailingComments.length > 0) {
                this.trailingComments = trailingComments;
            }

            bottomRight.push(this);
        },

        finish: function () {
            if (extra.range) {
                this.range[1] = lastIndex;
            }
            if (extra.loc) {
                this.loc.end = {
                    line: lastLineNumber,
                    column: lastIndex - lastLineStart
                };
                if (extra.source) {
                    this.loc.source = extra.source;
                }
            }

            if (extra.attachComment) {
                this.processComment();
            }
        },

        finishArrayExpression: function (elements) {
            this.type = Syntax.ArrayExpression;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrayPattern: function (elements) {
            this.type = Syntax.ArrayPattern;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrowFunctionExpression: function (params, defaults, body, expression) {
            this.type = Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishAssignmentExpression: function (operator, left, right) {
            this.type = Syntax.AssignmentExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishAssignmentPattern: function (left, right) {
            this.type = Syntax.AssignmentPattern;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBinaryExpression: function (operator, left, right) {
            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBlockStatement: function (body) {
            this.type = Syntax.BlockStatement;
            this.body = body;
            this.finish();
            return this;
        },

        finishBreakStatement: function (label) {
            this.type = Syntax.BreakStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishCallExpression: function (callee, args) {
            this.type = Syntax.CallExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishCatchClause: function (param, body) {
            this.type = Syntax.CatchClause;
            this.param = param;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassBody: function (body) {
            this.type = Syntax.ClassBody;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassDeclaration: function (id, superClass, body) {
            this.type = Syntax.ClassDeclaration;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassExpression: function (id, superClass, body) {
            this.type = Syntax.ClassExpression;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishConditionalExpression: function (test, consequent, alternate) {
            this.type = Syntax.ConditionalExpression;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishContinueStatement: function (label) {
            this.type = Syntax.ContinueStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishDebuggerStatement: function () {
            this.type = Syntax.DebuggerStatement;
            this.finish();
            return this;
        },

        finishDoWhileStatement: function (body, test) {
            this.type = Syntax.DoWhileStatement;
            this.body = body;
            this.test = test;
            this.finish();
            return this;
        },

        finishEmptyStatement: function () {
            this.type = Syntax.EmptyStatement;
            this.finish();
            return this;
        },

        finishExpressionStatement: function (expression) {
            this.type = Syntax.ExpressionStatement;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishForStatement: function (init, test, update, body) {
            this.type = Syntax.ForStatement;
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
            this.finish();
            return this;
        },

        finishForOfStatement: function (left, right, body) {
            this.type = Syntax.ForOfStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.finish();
            return this;
        },

        finishForInStatement: function (left, right, body) {
            this.type = Syntax.ForInStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = false;
            this.finish();
            return this;
        },

        finishFunctionDeclaration: function (id, params, defaults, body, generator) {
            this.type = Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.finish();
            return this;
        },

        finishFunctionExpression: function (id, params, defaults, body, generator) {
            this.type = Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.finish();
            return this;
        },

        finishIdentifier: function (name) {
            this.type = Syntax.Identifier;
            this.name = name;
            this.finish();
            return this;
        },

        finishIfStatement: function (test, consequent, alternate) {
            this.type = Syntax.IfStatement;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishLabeledStatement: function (label, body) {
            this.type = Syntax.LabeledStatement;
            this.label = label;
            this.body = body;
            this.finish();
            return this;
        },

        finishLiteral: function (token) {
            this.type = Syntax.Literal;
            this.value = token.value;
            this.raw = source.slice(token.start, token.end);
            if (token.regex) {
                this.regex = token.regex;
            }
            this.finish();
            return this;
        },

        finishMemberExpression: function (accessor, object, property) {
            this.type = Syntax.MemberExpression;
            this.computed = accessor === '[';
            this.object = object;
            this.property = property;
            this.finish();
            return this;
        },

        finishMetaProperty: function (meta, property) {
            this.type = Syntax.MetaProperty;
            this.meta = meta;
            this.property = property;
            this.finish();
            return this;
        },

        finishNewExpression: function (callee, args) {
            this.type = Syntax.NewExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishObjectExpression: function (properties) {
            this.type = Syntax.ObjectExpression;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishObjectPattern: function (properties) {
            this.type = Syntax.ObjectPattern;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishPostfixExpression: function (operator, argument) {
            this.type = Syntax.UpdateExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = false;
            this.finish();
            return this;
        },

        finishProgram: function (body, sourceType) {
            this.type = Syntax.Program;
            this.body = body;
            this.sourceType = sourceType;
            this.finish();
            return this;
        },

        finishProperty: function (kind, key, computed, value, method, shorthand) {
            this.type = Syntax.Property;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind;
            this.method = method;
            this.shorthand = shorthand;
            this.finish();
            return this;
        },

        finishRestElement: function (argument) {
            this.type = Syntax.RestElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishReturnStatement: function (argument) {
            this.type = Syntax.ReturnStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSequenceExpression: function (expressions) {
            this.type = Syntax.SequenceExpression;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishSpreadElement: function (argument) {
            this.type = Syntax.SpreadElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSwitchCase: function (test, consequent) {
            this.type = Syntax.SwitchCase;
            this.test = test;
            this.consequent = consequent;
            this.finish();
            return this;
        },

        finishSuper: function () {
            this.type = Syntax.Super;
            this.finish();
            return this;
        },

        finishSwitchStatement: function (discriminant, cases) {
            this.type = Syntax.SwitchStatement;
            this.discriminant = discriminant;
            this.cases = cases;
            this.finish();
            return this;
        },

        finishTaggedTemplateExpression: function (tag, quasi) {
            this.type = Syntax.TaggedTemplateExpression;
            this.tag = tag;
            this.quasi = quasi;
            this.finish();
            return this;
        },

        finishTemplateElement: function (value, tail) {
            this.type = Syntax.TemplateElement;
            this.value = value;
            this.tail = tail;
            this.finish();
            return this;
        },

        finishTemplateLiteral: function (quasis, expressions) {
            this.type = Syntax.TemplateLiteral;
            this.quasis = quasis;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishThisExpression: function () {
            this.type = Syntax.ThisExpression;
            this.finish();
            return this;
        },

        finishThrowStatement: function (argument) {
            this.type = Syntax.ThrowStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishTryStatement: function (block, handler, finalizer) {
            this.type = Syntax.TryStatement;
            this.block = block;
            this.guardedHandlers = [];
            this.handlers = handler ? [handler] : [];
            this.handler = handler;
            this.finalizer = finalizer;
            this.finish();
            return this;
        },

        finishUnaryExpression: function (operator, argument) {
            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = true;
            this.finish();
            return this;
        },

        finishVariableDeclaration: function (declarations) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = 'var';
            this.finish();
            return this;
        },

        finishLexicalDeclaration: function (declarations, kind) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = kind;
            this.finish();
            return this;
        },

        finishVariableDeclarator: function (id, init) {
            this.type = Syntax.VariableDeclarator;
            this.id = id;
            this.init = init;
            this.finish();
            return this;
        },

        finishWhileStatement: function (test, body) {
            this.type = Syntax.WhileStatement;
            this.test = test;
            this.body = body;
            this.finish();
            return this;
        },

        finishWithStatement: function (object, body) {
            this.type = Syntax.WithStatement;
            this.object = object;
            this.body = body;
            this.finish();
            return this;
        },

        finishExportSpecifier: function (local, exported) {
            this.type = Syntax.ExportSpecifier;
            this.exported = exported || local;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportDefaultSpecifier: function (local) {
            this.type = Syntax.ImportDefaultSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportNamespaceSpecifier: function (local) {
            this.type = Syntax.ImportNamespaceSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishExportNamedDeclaration: function (declaration, specifiers, src) {
            this.type = Syntax.ExportNamedDeclaration;
            this.declaration = declaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        },

        finishExportDefaultDeclaration: function (declaration) {
            this.type = Syntax.ExportDefaultDeclaration;
            this.declaration = declaration;
            this.finish();
            return this;
        },

        finishExportAllDeclaration: function (src) {
            this.type = Syntax.ExportAllDeclaration;
            this.source = src;
            this.finish();
            return this;
        },

        finishImportSpecifier: function (local, imported) {
            this.type = Syntax.ImportSpecifier;
            this.local = local || imported;
            this.imported = imported;
            this.finish();
            return this;
        },

        finishImportDeclaration: function (specifiers, src) {
            this.type = Syntax.ImportDeclaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        },

        finishYieldExpression: function (argument, delegate) {
            this.type = Syntax.YieldExpression;
            this.argument = argument;
            this.delegate = delegate;
            this.finish();
            return this;
        }
    };


    function recordError(error) {
        var e, existing;

        for (e = 0; e < extra.errors.length; e++) {
            existing = extra.errors[e];
            // Prevent duplicated error.
            /* istanbul ignore next */
            if (existing.index === error.index && existing.message === error.message) {
                return;
            }
        }

        extra.errors.push(error);
    }

    function constructError(msg, column) {
        var error = new Error(msg);
        try {
            throw error;
        } catch (base) {
            /* istanbul ignore else */
            if (Object.create && Object.defineProperty) {
                error = Object.create(base);
                Object.defineProperty(error, 'column', { value: column });
            }
        } finally {
            return error;
        }
    }

    function createError(line, pos, description) {
        var msg, column, error;

        msg = 'Line ' + line + ': ' + description;
        column = pos - (scanning ? lineStart : lastLineStart) + 1;
        error = constructError(msg, column);
        error.lineNumber = line;
        error.description = description;
        error.index = pos;
        return error;
    }

    // Throw an exception

    function throwError(messageFormat) {
        var args, msg;

        args = Array.prototype.slice.call(arguments, 1);
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        throw createError(lastLineNumber, lastIndex, msg);
    }

    function tolerateError(messageFormat) {
        var args, msg, error;

        args = Array.prototype.slice.call(arguments, 1);
        /* istanbul ignore next */
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        error = createError(lineNumber, lastIndex, msg);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Throw an exception because of the token.

    function unexpectedTokenError(token, message) {
        var value, msg = message || Messages.UnexpectedToken;

        if (token) {
            if (!message) {
                msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
                    (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
                    (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
                    (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
                    (token.type === Token.Template) ? Messages.UnexpectedTemplate :
                    Messages.UnexpectedToken;

                if (token.type === Token.Keyword) {
                    if (isFutureReservedWord(token.value)) {
                        msg = Messages.UnexpectedReserved;
                    } else if (strict && isStrictModeReservedWord(token.value)) {
                        msg = Messages.StrictReservedWord;
                    }
                }
            }

            value = (token.type === Token.Template) ? token.value.raw : token.value;
        } else {
            value = 'ILLEGAL';
        }

        msg = msg.replace('%0', value);

        return (token && typeof token.lineNumber === 'number') ?
            createError(token.lineNumber, token.start, msg) :
            createError(scanning ? lineNumber : lastLineNumber, scanning ? index : lastIndex, msg);
    }

    function throwUnexpectedToken(token, message) {
        throw unexpectedTokenError(token, message);
    }

    function tolerateUnexpectedToken(token, message) {
        var error = unexpectedTokenError(token, message);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpectedToken(token);
        }
    }

    /**
     * @name expectCommaSeparator
     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
     * to <code>expect(value)</code>
     * @since 2.0
     */
    function expectCommaSeparator() {
        var token;

        if (extra.errors) {
            token = lookahead;
            if (token.type === Token.Punctuator && token.value === ',') {
                lex();
            } else if (token.type === Token.Punctuator && token.value === ';') {
                lex();
                tolerateUnexpectedToken(token);
            } else {
                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
            }
        } else {
            expect(',');
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpectedToken(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token matches the specified contextual keyword
    // (where an identifier is sometimes a keyword depending on the context)

    function matchContextualKeyword(keyword) {
        return lookahead.type === Token.Identifier && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(startIndex) === 0x3B || match(';')) {
            lex();
            return;
        }

        if (hasLineTerminator) {
            return;
        }

        // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
        lastIndex = startIndex;
        lastLineNumber = startLineNumber;
        lastLineStart = startLineStart;

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpectedToken(lookahead);
        }
    }

    // Cover grammar support.
    //
    // When an assignment expression position starts with an left parenthesis, the determination of the type
    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
    //
    // There are three productions that can be parsed in a parentheses pair that needs to be determined
    // after the outermost pair is closed. They are:
    //
    //   1. AssignmentExpression
    //   2. BindingElements
    //   3. AssignmentTargets
    //
    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
    // binding element or assignment target.
    //
    // The three productions have the relationship:
    //
    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
    //
    // with a single exception that CoverInitializedName when used directly in an Expression, generates
    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
    //
    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
    // the CoverInitializedName check is conducted.
    //
    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
    // pattern. The CoverInitializedName check is deferred.
    function isolateCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        if (firstCoverInitializedNameError !== null) {
            throwUnexpectedToken(firstCoverInitializedNameError);
        }
        isBindingElement = oldIsBindingElement;
        isAssignmentTarget = oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError;
        return result;
    }

    function inheritCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        isBindingElement = isBindingElement && oldIsBindingElement;
        isAssignmentTarget = isAssignmentTarget && oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError || firstCoverInitializedNameError;
        return result;
    }

    // ECMA-262 13.3.3 Destructuring Binding Patterns

    function parseArrayPattern(params, kind) {
        var node = new Node(), elements = [], rest, restNode;
        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                if (match('...')) {
                    restNode = new Node();
                    lex();
                    params.push(lookahead);
                    rest = parseVariableIdentifier(kind);
                    elements.push(restNode.finishRestElement(rest));
                    break;
                } else {
                    elements.push(parsePatternWithDefault(params, kind));
                }
                if (!match(']')) {
                    expect(',');
                }
            }

        }

        expect(']');

        return node.finishArrayPattern(elements);
    }

    function parsePropertyPattern(params, kind) {
        var node = new Node(), key, keyToken, computed = match('['), init;
        if (lookahead.type === Token.Identifier) {
            keyToken = lookahead;
            key = parseVariableIdentifier();
            if (match('=')) {
                params.push(keyToken);
                lex();
                init = parseAssignmentExpression();

                return node.finishProperty(
                    'init', key, false,
                    new WrappingNode(keyToken).finishAssignmentPattern(key, init), false, false);
            } else if (!match(':')) {
                params.push(keyToken);
                return node.finishProperty('init', key, false, key, false, true);
            }
        } else {
            key = parseObjectPropertyKey();
        }
        expect(':');
        init = parsePatternWithDefault(params, kind);
        return node.finishProperty('init', key, computed, init, false, false);
    }

    function parseObjectPattern(params, kind) {
        var node = new Node(), properties = [];

        expect('{');

        while (!match('}')) {
            properties.push(parsePropertyPattern(params, kind));
            if (!match('}')) {
                expect(',');
            }
        }

        lex();

        return node.finishObjectPattern(properties);
    }

    function parsePattern(params, kind) {
        if (match('[')) {
            return parseArrayPattern(params, kind);
        } else if (match('{')) {
            return parseObjectPattern(params, kind);
        } else if (matchKeyword('let')) {
            if (kind === 'const' || kind === 'let') {
                tolerateUnexpectedToken(lookahead, Messages.UnexpectedToken);
            }
        }

        params.push(lookahead);
        return parseVariableIdentifier(kind);
    }

    function parsePatternWithDefault(params, kind) {
        var startToken = lookahead, pattern, previousAllowYield, right;
        pattern = parsePattern(params, kind);
        if (match('=')) {
            lex();
            previousAllowYield = state.allowYield;
            state.allowYield = true;
            right = isolateCoverGrammar(parseAssignmentExpression);
            state.allowYield = previousAllowYield;
            pattern = new WrappingNode(startToken).finishAssignmentPattern(pattern, right);
        }
        return pattern;
    }

    // ECMA-262 12.2.5 Array Initializer

    function parseArrayInitializer() {
        var elements = [], node = new Node(), restSpread;

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else if (match('...')) {
                restSpread = new Node();
                lex();
                restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    isAssignmentTarget = isBindingElement = false;
                    expect(',');
                }
                elements.push(restSpread);
            } else {
                elements.push(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        lex();

        return node.finishArrayExpression(elements);
    }

    // ECMA-262 12.2.6 Object Initializer

    function parsePropertyFunction(node, paramInfo, isGenerator) {
        var previousStrict, body;

        isAssignmentTarget = isBindingElement = false;

        previousStrict = strict;
        body = isolateCoverGrammar(parseFunctionSourceElements);

        if (strict && paramInfo.firstRestricted) {
            tolerateUnexpectedToken(paramInfo.firstRestricted, paramInfo.message);
        }
        if (strict && paramInfo.stricted) {
            tolerateUnexpectedToken(paramInfo.stricted, paramInfo.message);
        }

        strict = previousStrict;
        return node.finishFunctionExpression(null, paramInfo.params, paramInfo.defaults, body, isGenerator);
    }

    function parsePropertyMethodFunction() {
        var params, method, node = new Node(),
            previousAllowYield = state.allowYield;

        state.allowYield = false;
        params = parseParams();
        state.allowYield = previousAllowYield;

        state.allowYield = false;
        method = parsePropertyFunction(node, params, false);
        state.allowYield = previousAllowYield;

        return method;
    }

    function parseObjectPropertyKey() {
        var token, node = new Node(), expr;

        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        switch (token.type) {
        case Token.StringLiteral:
        case Token.NumericLiteral:
            if (strict && token.octal) {
                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
            }
            return node.finishLiteral(token);
        case Token.Identifier:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.Keyword:
            return node.finishIdentifier(token.value);
        case Token.Punctuator:
            if (token.value === '[') {
                expr = isolateCoverGrammar(parseAssignmentExpression);
                expect(']');
                return expr;
            }
            break;
        }
        throwUnexpectedToken(token);
    }

    function lookaheadPropertyName() {
        switch (lookahead.type) {
        case Token.Identifier:
        case Token.StringLiteral:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.NumericLiteral:
        case Token.Keyword:
            return true;
        case Token.Punctuator:
            return lookahead.value === '[';
        }
        return false;
    }

    // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
    // it might be called at a position where there is in fact a short hand identifier pattern or a data property.
    // This can only be determined after we consumed up to the left parentheses.
    //
    // In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
    // is responsible to visit other options.
    function tryParseMethodDefinition(token, key, computed, node) {
        var value, options, methodNode, params,
            previousAllowYield = state.allowYield;

        if (token.type === Token.Identifier) {
            // check for `get` and `set`;

            if (token.value === 'get' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');
                expect(')');

                state.allowYield = false;
                value = parsePropertyFunction(methodNode, {
                    params: [],
                    defaults: [],
                    stricted: null,
                    firstRestricted: null,
                    message: null
                }, false);
                state.allowYield = previousAllowYield;

                return node.finishProperty('get', key, computed, value, false, false);
            } else if (token.value === 'set' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');

                options = {
                    params: [],
                    defaultCount: 0,
                    defaults: [],
                    firstRestricted: null,
                    paramSet: {}
                };
                if (match(')')) {
                    tolerateUnexpectedToken(lookahead);
                } else {
                    state.allowYield = false;
                    parseParam(options);
                    state.allowYield = previousAllowYield;
                    if (options.defaultCount === 0) {
                        options.defaults = [];
                    }
                }
                expect(')');

                state.allowYield = false;
                value = parsePropertyFunction(methodNode, options, false);
                state.allowYield = previousAllowYield;

                return node.finishProperty('set', key, computed, value, false, false);
            }
        } else if (token.type === Token.Punctuator && token.value === '*' && lookaheadPropertyName()) {
            computed = match('[');
            key = parseObjectPropertyKey();
            methodNode = new Node();

            state.allowYield = true;
            params = parseParams();
            state.allowYield = previousAllowYield;

            state.allowYield = false;
            value = parsePropertyFunction(methodNode, params, true);
            state.allowYield = previousAllowYield;

            return node.finishProperty('init', key, computed, value, true, false);
        }

        if (key && match('(')) {
            value = parsePropertyMethodFunction();
            return node.finishProperty('init', key, computed, value, true, false);
        }

        // Not a MethodDefinition.
        return null;
    }

    function parseObjectProperty(hasProto) {
        var token = lookahead, node = new Node(), computed, key, maybeMethod, proto, value;

        computed = match('[');
        if (match('*')) {
            lex();
        } else {
            key = parseObjectPropertyKey();
        }
        maybeMethod = tryParseMethodDefinition(token, key, computed, node);
        if (maybeMethod) {
            return maybeMethod;
        }

        if (!key) {
            throwUnexpectedToken(lookahead);
        }

        // Check for duplicated __proto__
        if (!computed) {
            proto = (key.type === Syntax.Identifier && key.name === '__proto__') ||
                (key.type === Syntax.Literal && key.value === '__proto__');
            if (hasProto.value && proto) {
                tolerateError(Messages.DuplicateProtoProperty);
            }
            hasProto.value |= proto;
        }

        if (match(':')) {
            lex();
            value = inheritCoverGrammar(parseAssignmentExpression);
            return node.finishProperty('init', key, computed, value, false, false);
        }

        if (token.type === Token.Identifier) {
            if (match('=')) {
                firstCoverInitializedNameError = lookahead;
                lex();
                value = isolateCoverGrammar(parseAssignmentExpression);
                return node.finishProperty('init', key, computed,
                    new WrappingNode(token).finishAssignmentPattern(key, value), false, true);
            }
            return node.finishProperty('init', key, computed, key, false, true);
        }

        throwUnexpectedToken(lookahead);
    }

    function parseObjectInitializer() {
        var properties = [], hasProto = {value: false}, node = new Node();

        expect('{');

        while (!match('}')) {
            properties.push(parseObjectProperty(hasProto));

            if (!match('}')) {
                expectCommaSeparator();
            }
        }

        expect('}');

        return node.finishObjectExpression(properties);
    }

    function reinterpretExpressionAsPattern(expr) {
        var i;
        switch (expr.type) {
        case Syntax.Identifier:
        case Syntax.MemberExpression:
        case Syntax.RestElement:
        case Syntax.AssignmentPattern:
            break;
        case Syntax.SpreadElement:
            expr.type = Syntax.RestElement;
            reinterpretExpressionAsPattern(expr.argument);
            break;
        case Syntax.ArrayExpression:
            expr.type = Syntax.ArrayPattern;
            for (i = 0; i < expr.elements.length; i++) {
                if (expr.elements[i] !== null) {
                    reinterpretExpressionAsPattern(expr.elements[i]);
                }
            }
            break;
        case Syntax.ObjectExpression:
            expr.type = Syntax.ObjectPattern;
            for (i = 0; i < expr.properties.length; i++) {
                reinterpretExpressionAsPattern(expr.properties[i].value);
            }
            break;
        case Syntax.AssignmentExpression:
            expr.type = Syntax.AssignmentPattern;
            reinterpretExpressionAsPattern(expr.left);
            break;
        default:
            // Allow other node type for tolerant parsing.
            break;
        }
    }

    // ECMA-262 12.2.9 Template Literals

    function parseTemplateElement(option) {
        var node, token;

        if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
            throwUnexpectedToken();
        }

        node = new Node();
        token = lex();

        return node.finishTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail);
    }

    function parseTemplateLiteral() {
        var quasi, quasis, expressions, node = new Node();

        quasi = parseTemplateElement({ head: true });
        quasis = [quasi];
        expressions = [];

        while (!quasi.tail) {
            expressions.push(parseExpression());
            quasi = parseTemplateElement({ head: false });
            quasis.push(quasi);
        }

        return node.finishTemplateLiteral(quasis, expressions);
    }

    // ECMA-262 12.2.10 The Grouping Operator

    function parseGroupExpression() {
        var expr, expressions, startToken, i, params = [];

        expect('(');

        if (match(')')) {
            lex();
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: [],
                rawParams: []
            };
        }

        startToken = lookahead;
        if (match('...')) {
            expr = parseRestElement(params);
            expect(')');
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: [expr]
            };
        }

        isBindingElement = true;
        expr = inheritCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            isAssignmentTarget = false;
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();

                if (match('...')) {
                    if (!isBindingElement) {
                        throwUnexpectedToken(lookahead);
                    }
                    expressions.push(parseRestElement(params));
                    expect(')');
                    if (!match('=>')) {
                        expect('=>');
                    }
                    isBindingElement = false;
                    for (i = 0; i < expressions.length; i++) {
                        reinterpretExpressionAsPattern(expressions[i]);
                    }
                    return {
                        type: PlaceHolders.ArrowParameterPlaceHolder,
                        params: expressions
                    };
                }

                expressions.push(inheritCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }


        expect(')');

        if (match('=>')) {
            if (expr.type === Syntax.Identifier && expr.name === 'yield') {
                return {
                    type: PlaceHolders.ArrowParameterPlaceHolder,
                    params: [expr]
                };
            }

            if (!isBindingElement) {
                throwUnexpectedToken(lookahead);
            }

            if (expr.type === Syntax.SequenceExpression) {
                for (i = 0; i < expr.expressions.length; i++) {
                    reinterpretExpressionAsPattern(expr.expressions[i]);
                }
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            expr = {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: expr.type === Syntax.SequenceExpression ? expr.expressions : [expr]
            };
        }
        isBindingElement = false;
        return expr;
    }


    // ECMA-262 12.2 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr, node;

        if (match('(')) {
            isBindingElement = false;
            return inheritCoverGrammar(parseGroupExpression);
        }

        if (match('[')) {
            return inheritCoverGrammar(parseArrayInitializer);
        }

        if (match('{')) {
            return inheritCoverGrammar(parseObjectInitializer);
        }

        type = lookahead.type;
        node = new Node();

        if (type === Token.Identifier) {
            if (state.sourceType === 'module' && lookahead.value === 'await') {
                tolerateUnexpectedToken(lookahead);
            }
            expr = node.finishIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            isAssignmentTarget = isBindingElement = false;
            if (strict && lookahead.octal) {
                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
            }
            expr = node.finishLiteral(lex());
        } else if (type === Token.Keyword) {
            if (!strict && state.allowYield && matchKeyword('yield')) {
                return parseNonComputedProperty();
            }
            isAssignmentTarget = isBindingElement = false;
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
            if (matchKeyword('this')) {
                lex();
                return node.finishThisExpression();
            }
            if (matchKeyword('class')) {
                return parseClassExpression();
            }
            if (!strict && matchKeyword('let')) {
                return node.finishIdentifier(lex().value);
            }
            throwUnexpectedToken(lex());
        } else if (type === Token.BooleanLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = (token.value === 'true');
            expr = node.finishLiteral(token);
        } else if (type === Token.NullLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = null;
            expr = node.finishLiteral(token);
        } else if (match('/') || match('/=')) {
            isAssignmentTarget = isBindingElement = false;
            index = startIndex;

            if (typeof extra.tokens !== 'undefined') {
                token = collectRegex();
            } else {
                token = scanRegExp();
            }
            lex();
            expr = node.finishLiteral(token);
        } else if (type === Token.Template) {
            expr = parseTemplateLiteral();
        } else {
            throwUnexpectedToken(lex());
        }

        return expr;
    }

    // ECMA-262 12.3 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [], expr;

        expect('(');

        if (!match(')')) {
            while (startIndex < length) {
                if (match('...')) {
                    expr = new Node();
                    lex();
                    expr.finishSpreadElement(isolateCoverGrammar(parseAssignmentExpression));
                } else {
                    expr = isolateCoverGrammar(parseAssignmentExpression);
                }
                args.push(expr);
                if (match(')')) {
                    break;
                }
                expectCommaSeparator();
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token, node = new Node();

        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpectedToken(token);
        }

        return node.finishIdentifier(token.value);
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = isolateCoverGrammar(parseExpression);

        expect(']');

        return expr;
    }

    // ECMA-262 12.3.3 The new Operator

    function parseNewExpression() {
        var callee, args, node = new Node();

        expectKeyword('new');

        if (match('.')) {
            lex();
            if (lookahead.type === Token.Identifier && lookahead.value === 'target') {
                if (state.inFunctionBody) {
                    lex();
                    return node.finishMetaProperty('new', 'target');
                }
            }
            throwUnexpectedToken(lookahead);
        }

        callee = isolateCoverGrammar(parseLeftHandSideExpression);
        args = match('(') ? parseArguments() : [];

        isAssignmentTarget = isBindingElement = false;

        return node.finishNewExpression(callee, args);
    }

    // ECMA-262 12.3.4 Function Calls

    function parseLeftHandSideExpressionAllowCall() {
        var quasi, expr, args, property, startToken, previousAllowIn = state.allowIn;

        startToken = lookahead;
        state.allowIn = true;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('(') && !match('.') && !match('[')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (match('(')) {
                isBindingElement = false;
                isAssignmentTarget = false;
                args = parseArguments();
                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
            } else if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        state.allowIn = previousAllowIn;

        return expr;
    }

    // ECMA-262 12.3 Left-Hand-Side Expressions

    function parseLeftHandSideExpression() {
        var quasi, expr, property, startToken;
        assert(state.allowIn, 'callee of new expression always allow in keyword.');

        startToken = lookahead;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('[') && !match('.')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        return expr;
    }

    // ECMA-262 12.4 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token, startToken = lookahead;

        expr = inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);

        if (!hasLineTerminator && lookahead.type === Token.Punctuator) {
            if (match('++') || match('--')) {
                // ECMA-262 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    tolerateError(Messages.StrictLHSPostfix);
                }

                if (!isAssignmentTarget) {
                    tolerateError(Messages.InvalidLHSInAssignment);
                }

                isAssignmentTarget = isBindingElement = false;

                token = lex();
                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
            }
        }

        return expr;
    }

    // ECMA-262 12.5 Unary Operators

    function parseUnaryExpression() {
        var token, expr, startToken;

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            // ECMA-262 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                tolerateError(Messages.StrictLHSPrefix);
            }

            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (match('+') || match('-') || match('~') || match('!')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                tolerateError(Messages.StrictDelete);
            }
            isAssignmentTarget = isBindingElement = false;
        } else {
            expr = parsePostfixExpression();
        }

        return expr;
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // ECMA-262 12.6 Multiplicative Operators
    // ECMA-262 12.7 Additive Operators
    // ECMA-262 12.8 Bitwise Shift Operators
    // ECMA-262 12.9 Relational Operators
    // ECMA-262 12.10 Equality Operators
    // ECMA-262 12.11 Binary Bitwise Operators
    // ECMA-262 12.12 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, stack, right, operator, left, i;

        marker = lookahead;
        left = inheritCoverGrammar(parseUnaryExpression);

        token = lookahead;
        prec = binaryPrecedence(token, state.allowIn);
        if (prec === 0) {
            return left;
        }
        isAssignmentTarget = isBindingElement = false;
        token.prec = prec;
        lex();

        markers = [marker, lookahead];
        right = isolateCoverGrammar(parseUnaryExpression);

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                markers.pop();
                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
                stack.push(expr);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(lookahead);
            expr = isolateCoverGrammar(parseUnaryExpression);
            stack.push(expr);
        }

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
        }

        return expr;
    }


    // ECMA-262 12.13 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate, startToken;

        startToken = lookahead;

        expr = inheritCoverGrammar(parseBinaryExpression);
        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = isolateCoverGrammar(parseAssignmentExpression);
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = isolateCoverGrammar(parseAssignmentExpression);

            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
            isAssignmentTarget = isBindingElement = false;
        }

        return expr;
    }

    // ECMA-262 14.2 Arrow Function Definitions

    function parseConciseBody() {
        if (match('{')) {
            return parseFunctionSourceElements();
        }
        return isolateCoverGrammar(parseAssignmentExpression);
    }

    function checkPatternParam(options, param) {
        var i;
        switch (param.type) {
        case Syntax.Identifier:
            validateParam(options, param, param.name);
            break;
        case Syntax.RestElement:
            checkPatternParam(options, param.argument);
            break;
        case Syntax.AssignmentPattern:
            checkPatternParam(options, param.left);
            break;
        case Syntax.ArrayPattern:
            for (i = 0; i < param.elements.length; i++) {
                if (param.elements[i] !== null) {
                    checkPatternParam(options, param.elements[i]);
                }
            }
            break;
        case Syntax.YieldExpression:
            break;
        default:
            assert(param.type === Syntax.ObjectPattern, 'Invalid type');
            for (i = 0; i < param.properties.length; i++) {
                checkPatternParam(options, param.properties[i].value);
            }
            break;
        }
    }
    function reinterpretAsCoverFormalsList(expr) {
        var i, len, param, params, defaults, defaultCount, options, token;

        defaults = [];
        defaultCount = 0;
        params = [expr];

        switch (expr.type) {
        case Syntax.Identifier:
            break;
        case PlaceHolders.ArrowParameterPlaceHolder:
            params = expr.params;
            break;
        default:
            return null;
        }

        options = {
            paramSet: {}
        };

        for (i = 0, len = params.length; i < len; i += 1) {
            param = params[i];
            switch (param.type) {
            case Syntax.AssignmentPattern:
                params[i] = param.left;
                if (param.right.type === Syntax.YieldExpression) {
                    if (param.right.argument) {
                        throwUnexpectedToken(lookahead);
                    }
                    param.right.type = Syntax.Identifier;
                    param.right.name = 'yield';
                    delete param.right.argument;
                    delete param.right.delegate;
                }
                defaults.push(param.right);
                ++defaultCount;
                checkPatternParam(options, param.left);
                break;
            default:
                checkPatternParam(options, param);
                params[i] = param;
                defaults.push(null);
                break;
            }
        }

        if (strict || !state.allowYield) {
            for (i = 0, len = params.length; i < len; i += 1) {
                param = params[i];
                if (param.type === Syntax.YieldExpression) {
                    throwUnexpectedToken(lookahead);
                }
            }
        }

        if (options.message === Messages.StrictParamDupe) {
            token = strict ? options.stricted : options.firstRestricted;
            throwUnexpectedToken(token, options.message);
        }

        if (defaultCount === 0) {
            defaults = [];
        }

        return {
            params: params,
            defaults: defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseArrowFunctionExpression(options, node) {
        var previousStrict, previousAllowYield, body;

        if (hasLineTerminator) {
            tolerateUnexpectedToken(lookahead);
        }
        expect('=>');

        previousStrict = strict;
        previousAllowYield = state.allowYield;
        state.allowYield = true;

        body = parseConciseBody();

        if (strict && options.firstRestricted) {
            throwUnexpectedToken(options.firstRestricted, options.message);
        }
        if (strict && options.stricted) {
            tolerateUnexpectedToken(options.stricted, options.message);
        }

        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
    }

    // ECMA-262 14.4 Yield expression

    function parseYieldExpression() {
        var argument, expr, delegate, previousAllowYield;

        argument = null;
        expr = new Node();

        expectKeyword('yield');

        if (!hasLineTerminator) {
            previousAllowYield = state.allowYield;
            state.allowYield = false;
            delegate = match('*');
            if (delegate) {
                lex();
                argument = parseAssignmentExpression();
            } else {
                if (!match(';') && !match('}') && !match(')') && lookahead.type !== Token.EOF) {
                    argument = parseAssignmentExpression();
                }
            }
            state.allowYield = previousAllowYield;
        }

        return expr.finishYieldExpression(argument, delegate);
    }

    // ECMA-262 12.14 Assignment Operators

    function parseAssignmentExpression() {
        var token, expr, right, list, startToken;

        startToken = lookahead;
        token = lookahead;

        if (!state.allowYield && matchKeyword('yield')) {
            return parseYieldExpression();
        }

        expr = parseConditionalExpression();

        if (expr.type === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
            isAssignmentTarget = isBindingElement = false;
            list = reinterpretAsCoverFormalsList(expr);

            if (list) {
                firstCoverInitializedNameError = null;
                return parseArrowFunctionExpression(list, new WrappingNode(startToken));
            }

            return expr;
        }

        if (matchAssign()) {
            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }

            // ECMA-262 12.1.1
            if (strict && expr.type === Syntax.Identifier) {
                if (isRestrictedWord(expr.name)) {
                    tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
                }
                if (isStrictModeReservedWord(expr.name)) {
                    tolerateUnexpectedToken(token, Messages.StrictReservedWord);
                }
            }

            if (!match('=')) {
                isAssignmentTarget = isBindingElement = false;
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            token = lex();
            right = isolateCoverGrammar(parseAssignmentExpression);
            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
            firstCoverInitializedNameError = null;
        }

        return expr;
    }

    // ECMA-262 12.15 Comma Operator

    function parseExpression() {
        var expr, startToken = lookahead, expressions;

        expr = isolateCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expressions.push(isolateCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }

        return expr;
    }

    // ECMA-262 13.2 Block

    function parseStatementListItem() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'export':
                if (state.sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalExportDeclaration);
                }
                return parseExportDeclaration();
            case 'import':
                if (state.sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalImportDeclaration);
                }
                return parseImportDeclaration();
            case 'const':
                return parseLexicalDeclaration({inFor: false});
            case 'function':
                return parseFunctionDeclaration(new Node());
            case 'class':
                return parseClassDeclaration();
            }
        }

        if (matchKeyword('let') && isLexicalDeclaration()) {
            return parseLexicalDeclaration({inFor: false});
        }

        return parseStatement();
    }

    function parseStatementList() {
        var list = [];
        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            list.push(parseStatementListItem());
        }

        return list;
    }

    function parseBlock() {
        var block, node = new Node();

        expect('{');

        block = parseStatementList();

        expect('}');

        return node.finishBlockStatement(block);
    }

    // ECMA-262 13.3.2 Variable Statement

    function parseVariableIdentifier(kind) {
        var token, node = new Node();

        token = lex();

        if (token.type === Token.Keyword && token.value === 'yield') {
            if (strict) {
                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } if (!state.allowYield) {
                throwUnexpectedToken(token);
            }
        } else if (token.type !== Token.Identifier) {
            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } else {
                if (strict || token.value !== 'let' || kind !== 'var') {
                    throwUnexpectedToken(token);
                }
            }
        } else if (state.sourceType === 'module' && token.type === Token.Identifier && token.value === 'await') {
            tolerateUnexpectedToken(token);
        }

        return node.finishIdentifier(token.value);
    }

    function parseVariableDeclaration(options) {
        var init = null, id, node = new Node(), params = [];

        id = parsePattern(params, 'var');

        // ECMA-262 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (match('=')) {
            lex();
            init = isolateCoverGrammar(parseAssignmentExpression);
        } else if (id.type !== Syntax.Identifier && !options.inFor) {
            expect('=');
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseVariableDeclarationList(options) {
        var list = [];

        do {
            list.push(parseVariableDeclaration({ inFor: options.inFor }));
            if (!match(',')) {
                break;
            }
            lex();
        } while (startIndex < length);

        return list;
    }

    function parseVariableStatement(node) {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList({ inFor: false });

        consumeSemicolon();

        return node.finishVariableDeclaration(declarations);
    }

    // ECMA-262 13.3.1 Let and Const Declarations

    function parseLexicalBinding(kind, options) {
        var init = null, id, node = new Node(), params = [];

        id = parsePattern(params, kind);

        // ECMA-262 12.2.1
        if (strict && id.type === Syntax.Identifier && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (kind === 'const') {
            if (!matchKeyword('in') && !matchContextualKeyword('of')) {
                expect('=');
                init = isolateCoverGrammar(parseAssignmentExpression);
            }
        } else if ((!options.inFor && id.type !== Syntax.Identifier) || match('=')) {
            expect('=');
            init = isolateCoverGrammar(parseAssignmentExpression);
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseBindingList(kind, options) {
        var list = [];

        do {
            list.push(parseLexicalBinding(kind, options));
            if (!match(',')) {
                break;
            }
            lex();
        } while (startIndex < length);

        return list;
    }


    function tokenizerState() {
        return {
            index: index,
            lineNumber: lineNumber,
            lineStart: lineStart,
            hasLineTerminator: hasLineTerminator,
            lastIndex: lastIndex,
            lastLineNumber: lastLineNumber,
            lastLineStart: lastLineStart,
            startIndex: startIndex,
            startLineNumber: startLineNumber,
            startLineStart: startLineStart,
            lookahead: lookahead,
            tokenCount: extra.tokens ? extra.tokens.length : 0
        };
    }

    function resetTokenizerState(ts) {
        index = ts.index;
        lineNumber = ts.lineNumber;
        lineStart = ts.lineStart;
        hasLineTerminator = ts.hasLineTerminator;
        lastIndex = ts.lastIndex;
        lastLineNumber = ts.lastLineNumber;
        lastLineStart = ts.lastLineStart;
        startIndex = ts.startIndex;
        startLineNumber = ts.startLineNumber;
        startLineStart = ts.startLineStart;
        lookahead = ts.lookahead;
        if (extra.tokens) {
            extra.tokens.splice(ts.tokenCount, extra.tokens.length);
        }
    }

    function isLexicalDeclaration() {
        var lexical, ts;

        ts = tokenizerState();

        lex();
        lexical = (lookahead.type === Token.Identifier) || match('[') || match('{') ||
            matchKeyword('let') || matchKeyword('yield');

        resetTokenizerState(ts);

        return lexical;
    }

    function parseLexicalDeclaration(options) {
        var kind, declarations, node = new Node();

        kind = lex().value;
        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');

        declarations = parseBindingList(kind, options);

        consumeSemicolon();

        return node.finishLexicalDeclaration(declarations, kind);
    }

    function parseRestElement(params) {
        var param, node = new Node();

        lex();

        if (match('{')) {
            throwError(Messages.ObjectPatternAsRestParameter);
        }

        params.push(lookahead);

        param = parseVariableIdentifier();

        if (match('=')) {
            throwError(Messages.DefaultRestParameter);
        }

        if (!match(')')) {
            throwError(Messages.ParameterAfterRestParameter);
        }

        return node.finishRestElement(param);
    }

    // ECMA-262 13.4 Empty Statement

    function parseEmptyStatement(node) {
        expect(';');
        return node.finishEmptyStatement();
    }

    // ECMA-262 12.4 Expression Statement

    function parseExpressionStatement(node) {
        var expr = parseExpression();
        consumeSemicolon();
        return node.finishExpressionStatement(expr);
    }

    // ECMA-262 13.6 If statement

    function parseIfStatement(node) {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return node.finishIfStatement(test, consequent, alternate);
    }

    // ECMA-262 13.7 Iteration Statements

    function parseDoWhileStatement(node) {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return node.finishDoWhileStatement(body, test);
    }

    function parseWhileStatement(node) {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return node.finishWhileStatement(test, body);
    }

    function parseForStatement(node) {
        var init, forIn, initSeq, initStartToken, test, update, left, right, kind, declarations,
            body, oldInIteration, previousAllowIn = state.allowIn;

        init = test = update = null;
        forIn = true;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var')) {
                init = new Node();
                lex();

                state.allowIn = false;
                declarations = parseVariableDeclarationList({ inFor: true });
                state.allowIn = previousAllowIn;

                if (declarations.length === 1 && matchKeyword('in')) {
                    init = init.finishVariableDeclaration(declarations);
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
                    init = init.finishVariableDeclaration(declarations);
                    lex();
                    left = init;
                    right = parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    init = init.finishVariableDeclaration(declarations);
                    expect(';');
                }
            } else if (matchKeyword('const') || matchKeyword('let')) {
                init = new Node();
                kind = lex().value;

                if (!strict && lookahead.value === 'in') {
                    init = init.finishIdentifier(kind);
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else {
                    state.allowIn = false;
                    declarations = parseBindingList(kind, {inFor: true});
                    state.allowIn = previousAllowIn;

                    if (declarations.length === 1 && declarations[0].init === null && matchKeyword('in')) {
                        init = init.finishLexicalDeclaration(declarations, kind);
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
                        init = init.finishLexicalDeclaration(declarations, kind);
                        lex();
                        left = init;
                        right = parseAssignmentExpression();
                        init = null;
                        forIn = false;
                    } else {
                        consumeSemicolon();
                        init = init.finishLexicalDeclaration(declarations, kind);
                    }
                }
            } else {
                initStartToken = lookahead;
                state.allowIn = false;
                init = inheritCoverGrammar(parseAssignmentExpression);
                state.allowIn = previousAllowIn;

                if (matchKeyword('in')) {
                    if (!isAssignmentTarget) {
                        tolerateError(Messages.InvalidLHSInForIn);
                    }

                    lex();
                    reinterpretExpressionAsPattern(init);
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (matchContextualKeyword('of')) {
                    if (!isAssignmentTarget) {
                        tolerateError(Messages.InvalidLHSInForLoop);
                    }

                    lex();
                    reinterpretExpressionAsPattern(init);
                    left = init;
                    right = parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    if (match(',')) {
                        initSeq = [init];
                        while (match(',')) {
                            lex();
                            initSeq.push(isolateCoverGrammar(parseAssignmentExpression));
                        }
                        init = new WrappingNode(initStartToken).finishSequenceExpression(initSeq);
                    }
                    expect(';');
                }
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = isolateCoverGrammar(parseStatement);

        state.inIteration = oldInIteration;

        return (typeof left === 'undefined') ?
                node.finishForStatement(init, test, update, body) :
                forIn ? node.finishForInStatement(left, right, body) :
                    node.finishForOfStatement(left, right, body);
    }

    // ECMA-262 13.8 The continue statement

    function parseContinueStatement(node) {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(startIndex) === 0x3B) {
            lex();

            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (hasLineTerminator) {
            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError(Messages.IllegalContinue);
        }

        return node.finishContinueStatement(label);
    }

    // ECMA-262 13.9 The break statement

    function parseBreakStatement(node) {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(lastIndex) === 0x3B) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }

            return node.finishBreakStatement(null);
        }

        if (hasLineTerminator) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }
        } else if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError(Messages.IllegalBreak);
        }

        return node.finishBreakStatement(label);
    }

    // ECMA-262 13.10 The return statement

    function parseReturnStatement(node) {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            tolerateError(Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(lastIndex) === 0x20) {
            if (isIdentifierStart(source.charCodeAt(lastIndex + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return node.finishReturnStatement(argument);
            }
        }

        if (hasLineTerminator) {
            // HACK
            return node.finishReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return node.finishReturnStatement(argument);
    }

    // ECMA-262 13.11 The with statement

    function parseWithStatement(node) {
        var object, body;

        if (strict) {
            tolerateError(Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return node.finishWithStatement(object, body);
    }

    // ECMA-262 13.12 The switch statement

    function parseSwitchCase() {
        var test, consequent = [], statement, node = new Node();

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (startIndex < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatementListItem();
            consequent.push(statement);
        }

        return node.finishSwitchCase(test, consequent);
    }

    function parseSwitchStatement(node) {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        cases = [];

        if (match('}')) {
            lex();
            return node.finishSwitchStatement(discriminant, cases);
        }

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError(Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return node.finishSwitchStatement(discriminant, cases);
    }

    // ECMA-262 13.14 The throw statement

    function parseThrowStatement(node) {
        var argument;

        expectKeyword('throw');

        if (hasLineTerminator) {
            throwError(Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return node.finishThrowStatement(argument);
    }

    // ECMA-262 13.15 The try statement

    function parseCatchClause() {
        var param, params = [], paramMap = {}, key, i, body, node = new Node();

        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpectedToken(lookahead);
        }

        param = parsePattern(params);
        for (i = 0; i < params.length; i++) {
            key = '$' + params[i].value;
            if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
                tolerateError(Messages.DuplicateBinding, params[i].value);
            }
            paramMap[key] = true;
        }

        // ECMA-262 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            tolerateError(Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return node.finishCatchClause(param, body);
    }

    function parseTryStatement(node) {
        var block, handler = null, finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handler = parseCatchClause();
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (!handler && !finalizer) {
            throwError(Messages.NoCatchOrFinally);
        }

        return node.finishTryStatement(block, handler, finalizer);
    }

    // ECMA-262 13.16 The debugger statement

    function parseDebuggerStatement(node) {
        expectKeyword('debugger');

        consumeSemicolon();

        return node.finishDebuggerStatement();
    }

    // 13 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key,
            node;

        if (type === Token.EOF) {
            throwUnexpectedToken(lookahead);
        }

        if (type === Token.Punctuator && lookahead.value === '{') {
            return parseBlock();
        }
        isAssignmentTarget = isBindingElement = true;
        node = new Node();

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return parseEmptyStatement(node);
            case '(':
                return parseExpressionStatement(node);
            default:
                break;
            }
        } else if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return parseBreakStatement(node);
            case 'continue':
                return parseContinueStatement(node);
            case 'debugger':
                return parseDebuggerStatement(node);
            case 'do':
                return parseDoWhileStatement(node);
            case 'for':
                return parseForStatement(node);
            case 'function':
                return parseFunctionDeclaration(node);
            case 'if':
                return parseIfStatement(node);
            case 'return':
                return parseReturnStatement(node);
            case 'switch':
                return parseSwitchStatement(node);
            case 'throw':
                return parseThrowStatement(node);
            case 'try':
                return parseTryStatement(node);
            case 'var':
                return parseVariableStatement(node);
            case 'while':
                return parseWhileStatement(node);
            case 'with':
                return parseWithStatement(node);
            default:
                break;
            }
        }

        expr = parseExpression();

        // ECMA-262 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return node.finishLabeledStatement(expr, labeledBody);
        }

        consumeSemicolon();

        return node.finishExpressionStatement(expr);
    }

    // ECMA-262 14.1 Function Definition

    function parseFunctionSourceElements() {
        var statement, body = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesisCount,
            node = new Node();

        expect('{');

        while (startIndex < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;
        oldParenthesisCount = state.parenthesizedCount;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;
        state.parenthesizedCount = 0;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            body.push(parseStatementListItem());
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;
        state.parenthesizedCount = oldParenthesisCount;

        return node.finishBlockStatement(body);
    }

    function validateParam(options, param, name) {
        var key = '$' + name;
        if (strict) {
            if (isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        } else if (!options.firstRestricted) {
            if (isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        }
        options.paramSet[key] = true;
    }

    function parseParam(options) {
        var token, param, params = [], i, def;

        token = lookahead;
        if (token.value === '...') {
            param = parseRestElement(params);
            validateParam(options, param.argument, param.argument.name);
            options.params.push(param);
            options.defaults.push(null);
            return false;
        }

        param = parsePatternWithDefault(params);
        for (i = 0; i < params.length; i++) {
            validateParam(options, params[i], params[i].value);
        }

        if (param.type === Syntax.AssignmentPattern) {
            def = param.right;
            param = param.left;
            ++options.defaultCount;
        }

        options.params.push(param);
        options.defaults.push(def);

        return !match(')');
    }

    function parseParams(firstRestricted) {
        var options;

        options = {
            params: [],
            defaultCount: 0,
            defaults: [],
            firstRestricted: firstRestricted
        };

        expect('(');

        if (!match(')')) {
            options.paramSet = {};
            while (startIndex < length) {
                if (!parseParam(options)) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        if (options.defaultCount === 0) {
            options.defaults = [];
        }

        return {
            params: options.params,
            defaults: options.defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseFunctionDeclaration(node, identifierIsOptional) {
        var id = null, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict,
            isGenerator, previousAllowYield;

        previousAllowYield = state.allowYield;

        expectKeyword('function');

        isGenerator = match('*');
        if (isGenerator) {
            lex();
        }

        if (!identifierIsOptional || !match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        state.allowYield = !isGenerator;
        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }


        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }

        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishFunctionDeclaration(id, params, defaults, body, isGenerator);
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp,
            params = [], defaults = [], body, previousStrict, node = new Node(),
            isGenerator, previousAllowYield;

        previousAllowYield = state.allowYield;

        expectKeyword('function');

        isGenerator = match('*');
        if (isGenerator) {
            lex();
        }

        state.allowYield = !isGenerator;
        if (!match('(')) {
            token = lookahead;
            id = (!strict && !isGenerator && matchKeyword('yield')) ? parseNonComputedProperty() : parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }
        strict = previousStrict;
        state.allowYield = previousAllowYield;

        return node.finishFunctionExpression(id, params, defaults, body, isGenerator);
    }

    // ECMA-262 14.5 Class Definitions

    function parseClassBody() {
        var classBody, token, isStatic, hasConstructor = false, body, method, computed, key;

        classBody = new Node();

        expect('{');
        body = [];
        while (!match('}')) {
            if (match(';')) {
                lex();
            } else {
                method = new Node();
                token = lookahead;
                isStatic = false;
                computed = match('[');
                if (match('*')) {
                    lex();
                } else {
                    key = parseObjectPropertyKey();
                    if (key.name === 'static' && (lookaheadPropertyName() || match('*'))) {
                        token = lookahead;
                        isStatic = true;
                        computed = match('[');
                        if (match('*')) {
                            lex();
                        } else {
                            key = parseObjectPropertyKey();
                        }
                    }
                }
                method = tryParseMethodDefinition(token, key, computed, method);
                if (method) {
                    method['static'] = isStatic; // jscs:ignore requireDotNotation
                    if (method.kind === 'init') {
                        method.kind = 'method';
                    }
                    if (!isStatic) {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'constructor') {
                            if (method.kind !== 'method' || !method.method || method.value.generator) {
                                throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
                            }
                            if (hasConstructor) {
                                throwUnexpectedToken(token, Messages.DuplicateConstructor);
                            } else {
                                hasConstructor = true;
                            }
                            method.kind = 'constructor';
                        }
                    } else {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'prototype') {
                            throwUnexpectedToken(token, Messages.StaticPrototype);
                        }
                    }
                    method.type = Syntax.MethodDefinition;
                    delete method.method;
                    delete method.shorthand;
                    body.push(method);
                } else {
                    throwUnexpectedToken(lookahead);
                }
            }
        }
        lex();
        return classBody.finishClassBody(body);
    }

    function parseClassDeclaration(identifierIsOptional) {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (!identifierIsOptional || lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassDeclaration(id, superClass, classBody);
    }

    function parseClassExpression() {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassExpression(id, superClass, classBody);
    }

    // ECMA-262 15.2 Modules

    function parseModuleSpecifier() {
        var node = new Node();

        if (lookahead.type !== Token.StringLiteral) {
            throwError(Messages.InvalidModuleSpecifier);
        }
        return node.finishLiteral(lex());
    }

    // ECMA-262 15.2.3 Exports

    function parseExportSpecifier() {
        var exported, local, node = new Node(), def;
        if (matchKeyword('default')) {
            // export {default} from 'something';
            def = new Node();
            lex();
            local = def.finishIdentifier('default');
        } else {
            local = parseVariableIdentifier();
        }
        if (matchContextualKeyword('as')) {
            lex();
            exported = parseNonComputedProperty();
        }
        return node.finishExportSpecifier(local, exported);
    }

    function parseExportNamedDeclaration(node) {
        var declaration = null,
            isExportFromIdentifier,
            src = null, specifiers = [];

        // non-default export
        if (lookahead.type === Token.Keyword) {
            // covers:
            // export var f = 1;
            switch (lookahead.value) {
                case 'let':
                case 'const':
                    declaration = parseLexicalDeclaration({inFor: false});
                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
                case 'var':
                case 'class':
                case 'function':
                    declaration = parseStatementListItem();
                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
            }
        }

        expect('{');
        while (!match('}')) {
            isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
            specifiers.push(parseExportSpecifier());
            if (!match('}')) {
                expect(',');
                if (match('}')) {
                    break;
                }
            }
        }
        expect('}');

        if (matchContextualKeyword('from')) {
            // covering:
            // export {default} from 'foo';
            // export {foo} from 'foo';
            lex();
            src = parseModuleSpecifier();
            consumeSemicolon();
        } else if (isExportFromIdentifier) {
            // covering:
            // export {default}; // missing fromClause
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        } else {
            // cover
            // export {foo};
            consumeSemicolon();
        }
        return node.finishExportNamedDeclaration(declaration, specifiers, src);
    }

    function parseExportDefaultDeclaration(node) {
        var declaration = null,
            expression = null;

        // covers:
        // export default ...
        expectKeyword('default');

        if (matchKeyword('function')) {
            // covers:
            // export default function foo () {}
            // export default function () {}
            declaration = parseFunctionDeclaration(new Node(), true);
            return node.finishExportDefaultDeclaration(declaration);
        }
        if (matchKeyword('class')) {
            declaration = parseClassDeclaration(true);
            return node.finishExportDefaultDeclaration(declaration);
        }

        if (matchContextualKeyword('from')) {
            throwError(Messages.UnexpectedToken, lookahead.value);
        }

        // covers:
        // export default {};
        // export default [];
        // export default (1 + 2);
        if (match('{')) {
            expression = parseObjectInitializer();
        } else if (match('[')) {
            expression = parseArrayInitializer();
        } else {
            expression = parseAssignmentExpression();
        }
        consumeSemicolon();
        return node.finishExportDefaultDeclaration(expression);
    }

    function parseExportAllDeclaration(node) {
        var src;

        // covers:
        // export * from 'foo';
        expect('*');
        if (!matchContextualKeyword('from')) {
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        }
        lex();
        src = parseModuleSpecifier();
        consumeSemicolon();

        return node.finishExportAllDeclaration(src);
    }

    function parseExportDeclaration() {
        var node = new Node();
        if (state.inFunctionBody) {
            throwError(Messages.IllegalExportDeclaration);
        }

        expectKeyword('export');

        if (matchKeyword('default')) {
            return parseExportDefaultDeclaration(node);
        }
        if (match('*')) {
            return parseExportAllDeclaration(node);
        }
        return parseExportNamedDeclaration(node);
    }

    // ECMA-262 15.2.2 Imports

    function parseImportSpecifier() {
        // import {<foo as bar>} ...;
        var local, imported, node = new Node();

        imported = parseNonComputedProperty();
        if (matchContextualKeyword('as')) {
            lex();
            local = parseVariableIdentifier();
        }

        return node.finishImportSpecifier(local, imported);
    }

    function parseNamedImports() {
        var specifiers = [];
        // {foo, bar as bas}
        expect('{');
        while (!match('}')) {
            specifiers.push(parseImportSpecifier());
            if (!match('}')) {
                expect(',');
                if (match('}')) {
                    break;
                }
            }
        }
        expect('}');
        return specifiers;
    }

    function parseImportDefaultSpecifier() {
        // import <foo> ...;
        var local, node = new Node();

        local = parseNonComputedProperty();

        return node.finishImportDefaultSpecifier(local);
    }

    function parseImportNamespaceSpecifier() {
        // import <* as foo> ...;
        var local, node = new Node();

        expect('*');
        if (!matchContextualKeyword('as')) {
            throwError(Messages.NoAsAfterImportNamespace);
        }
        lex();
        local = parseNonComputedProperty();

        return node.finishImportNamespaceSpecifier(local);
    }

    function parseImportDeclaration() {
        var specifiers = [], src, node = new Node();

        if (state.inFunctionBody) {
            throwError(Messages.IllegalImportDeclaration);
        }

        expectKeyword('import');

        if (lookahead.type === Token.StringLiteral) {
            // import 'foo';
            src = parseModuleSpecifier();
        } else {

            if (match('{')) {
                // import {bar}
                specifiers = specifiers.concat(parseNamedImports());
            } else if (match('*')) {
                // import * as foo
                specifiers.push(parseImportNamespaceSpecifier());
            } else if (isIdentifierName(lookahead) && !matchKeyword('default')) {
                // import foo
                specifiers.push(parseImportDefaultSpecifier());
                if (match(',')) {
                    lex();
                    if (match('*')) {
                        // import foo, * as foo
                        specifiers.push(parseImportNamespaceSpecifier());
                    } else if (match('{')) {
                        // import foo, {bar}
                        specifiers = specifiers.concat(parseNamedImports());
                    } else {
                        throwUnexpectedToken(lookahead);
                    }
                }
            } else {
                throwUnexpectedToken(lex());
            }

            if (!matchContextualKeyword('from')) {
                throwError(lookahead.value ?
                        Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
            }
            lex();
            src = parseModuleSpecifier();
        }

        consumeSemicolon();
        return node.finishImportDeclaration(specifiers, src);
    }

    // ECMA-262 15.1 Scripts

    function parseScriptBody() {
        var statement, body = [], token, directive, firstRestricted;

        while (startIndex < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (startIndex < length) {
            statement = parseStatementListItem();
            /* istanbul ignore if */
            if (typeof statement === 'undefined') {
                break;
            }
            body.push(statement);
        }
        return body;
    }

    function parseProgram() {
        var body, node;

        peek();
        node = new Node();

        body = parseScriptBody();
        return node.finishProgram(body, state.sourceType);
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (entry.regex) {
                token.regex = {
                    pattern: entry.regex.pattern,
                    flags: entry.regex.flags
                };
            }
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function tokenize(code, options, delegate) {
        var toString,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            allowYield: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: []
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenValues = [];
        extra.tokenize = true;
        extra.delegate = delegate;

        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    lex();
                } catch (lexError) {
                    if (extra.errors) {
                        recordError(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            tokens = extra.tokens;
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            allowYield: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: [],
            sourceType: 'script'
        };
        strict = false;

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
            if (extra.attachComment) {
                extra.range = true;
                extra.comments = [];
                extra.bottomRightStack = [];
                extra.trailingComments = [];
                extra.leadingComments = [];
            }
            if (options.sourceType === 'module') {
                // very restrictive condition for now
                state.sourceType = options.sourceType;
                strict = true;
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with *.json manifests.
    exports.version = '2.7.0';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
    /* istanbul ignore next */
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],43:[function(require,module,exports){
module.exports = require('./lib/surfaces_txt2yaml.js')

},{"./lib/surfaces_txt2yaml.js":44}],44:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */
var SurfacesTxt2Yaml, clone, copy, jsyaml,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

clone = function(src) {
  var key, ret;
  if ((src == null) || typeof src !== 'object') {
    return src;
  }
  ret = new src.constructor();
  for (key in src) {
    ret[key] = clone(src[key]);
  }
  return ret;
};

copy = function(source, destination) {
  var key, _results;
  if ((source instanceof Object) && (!(source instanceof Array))) {
    _results = [];
    for (key in source) {
      if ((destination[key] != null) && destination[key] instanceof Object) {
        _results.push(copy(source[key], destination[key]));
      } else {
        _results.push(destination[key] = clone(source[key]));
      }
    }
    return _results;
  } else {
    return destination = clone(source);
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  exports.clone = clone;
  exports.copy = copy;
}


/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

if (typeof require !== "undefined" && require !== null) {
  jsyaml = require('js-yaml');
}

SurfacesTxt2Yaml = {};

SurfacesTxt2Yaml.Parser = (function() {
  function Parser(options) {
    this.options = {
      comment_prefix: ['//']
    };
    this.set_options({
      compatible: 'ssp'
    });
    if (options != null) {
      this.set_options(options);
    }
  }

  Parser.prototype.set_options = function(options) {
    var name, prefix, value;
    if (options.compatible === 'materia') {
      this.options.charset = false;
      this.options.surface_definition = 'materia';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = false;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    } else if (options.compatible === 'ssp') {
      this.options.charset = true;
      this.options.surface_definition = 'ssp';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = false;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    } else if (options.compatible === 'ssp-lazy') {
      this.options.charset = true;
      this.options.surface_definition = 'ssp-lazy';
      this.options.check_seriko = 'warn';
      this.options.allow_all_seriko = true;
      this.options.check_surface_scope_duplication = 'warn';
      this.options.check_nonstandard_comment = 'warn';
    }
    for (name in options) {
      value = options[name];
      this.options[name] = value;
    }
    return this.options.standard_comment_re = new RegExp('^\\s*(?:' + ((function() {
      var _i, _len, _ref, _results;
      _ref = this.options.comment_prefix;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        _results.push(prefix.replace(/\W/, '\\$&'));
      }
      return _results;
    }).call(this)).join('|') + ')|^\s*$');
  };

  Parser.prototype.parse = function(txt) {
    var character, data, id, in_scope, index, line, lines, parsed_data, range, range_result, ranges, region_id, regions, result, scope, scope_begin, scope_content, scope_id, scope_id_delete, scope_id_str, scope_id_uniq, scope_id_value, scope_parser, setting, settings, surface, tooltip, type, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    parsed_data = {};
    lines = txt.split(/\r?\n/);
    scope = null;
    scope_id = null;
    scope_id_str = null;
    in_scope = false;
    scope_begin = null;
    scope_content = [];
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      if (!in_scope) {
        if (this.options.charset && (result = line.match(/^\s*charset,(.+)$/))) {
          if (parsed_data.charset != null) {
            this["throw"]('charset duplication found');
          }
          parsed_data.charset = result[1];
        } else if ((this.options.surface_definition === 'materia' && (result = line.match(/^(?:(descript)|(surface)(\d+(?:,surface\d+)*)|(sakura|kero\d+)\.(surface\.alias))\s*({)?\s*$/))) || (this.options.surface_definition === 'ssp' && (result = line.match(/^\s*(?:(descript)|(surface(?:\.append)?)(!?(?:\d+-)?\d+(?:\s*,\s*(?:surface|!)?(?:\d+-)?\d+)*)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/))) || (this.options.surface_definition === 'ssp-lazy' && (result = line.match(/^\s*(?:(descript)|(surface(?:\.append)?)(.+)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/)))) {
          if (result[1] === 'descript') {
            scope = 'descript';
          } else if ((result[2] === 'surface') || (result[2] === 'surface.append')) {
            scope = 'surface';
            scope_id_uniq = {};
            scope_id_delete = {};
            scope_id_str = 'surface' + result[3];
            ranges = result[3].split(/[^0-9!]*,\s*(?:surface(?:\.append)?)?/);
            for (_j = 0, _len1 = ranges.length; _j < _len1; _j++) {
              range = ranges[_j];
              range_result = null;
              if (range_result = range.match(/^(\d+)-(\d+)$/)) {
                for (id = _k = _ref = range_result[1], _ref1 = range_result[2]; _ref <= _ref1 ? _k <= _ref1 : _k >= _ref1; id = _ref <= _ref1 ? ++_k : --_k) {
                  scope_id_uniq['surface' + id] = true;
                }
              } else if (range.match(/^\d+$/)) {
                scope_id_uniq['surface' + range] = true;
              } else if (range_result = range.match(/^!(\d+)-(\d+)$/)) {
                for (id = _l = _ref2 = range_result[1], _ref3 = range_result[2]; _ref2 <= _ref3 ? _l <= _ref3 : _l >= _ref3; id = _ref2 <= _ref3 ? ++_l : --_l) {
                  scope_id_delete['surface' + id] = true;
                }
              } else if (range_result = range.match(/^!(\d+)$/)) {
                scope_id_delete['surface' + range_result[1]] = true;
              } else if (!this.options.surface_definition === 'ssp-lazy') {
                this["throw"]('wrong surface range "' + range + '" in : ' + line);
              }
            }
            for (scope_id_value in scope_id_delete) {
              delete scope_id_uniq[scope_id_value];
            }
            if (result[2] === 'surface.append') {
              for (scope_id_value in scope_id_uniq) {
                if (parsed_data[scope][scope_id_value] == null) {
                  delete scope_id_uniq[scope_id_value];
                }
              }
            }
            scope_id = Object.keys(scope_id_uniq);
          } else {
            scope = result[5];
            scope_id = result[4];
          }
          if (result[result.length - 1] === '{') {
            in_scope = true;
            scope_begin = index + 1;
          }
        } else if (result = line.match(/^\s*{\s*$/)) {
          if (scope != null) {
            in_scope = true;
            scope_begin = index + 1;
          } else {
            this["throw"]('scope bracket begun before scope name');
          }
        } else if (this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
          this.warnthrow('invalid line found in scope outside : ' + line, this.options.check_nonstandard_comment);
        }
      } else if (result = line.match(/^\s*}\s*$/)) {
        if (parsed_data[scope] == null) {
          parsed_data[scope] = {};
        }
        scope_parser = new SurfacesTxt2Yaml.ScopeParser[scope](this.options, (_ref4 = parsed_data.descript) != null ? _ref4.version : void 0);
        data = scope_parser.parse(scope_content, scope_begin);
        if (scope_id != null) {
          if (scope_id instanceof Array) {
            if (parsed_data[scope][scope_id_str] == null) {
              parsed_data[scope][scope_id_str] = {};
            }
            copy(data, parsed_data[scope][scope_id_str]);
            for (_m = 0, _len2 = scope_id.length; _m < _len2; _m++) {
              scope_id_value = scope_id[_m];
              if (parsed_data[scope][scope_id_value] == null) {
                parsed_data[scope][scope_id_value] = {};
              }
              if (scope_id_str !== scope_id_value) {
                if (parsed_data[scope][scope_id_value].base == null) {
                  parsed_data[scope][scope_id_value].base = [];
                }
                if (-1 === parsed_data[scope][scope_id_value].base.indexOf(scope_id_str)) {
                  parsed_data[scope][scope_id_value].base.push(scope_id_str);
                }
              }
            }
          } else {
            if (parsed_data[scope][scope_id] == null) {
              parsed_data[scope][scope_id] = {};
            }
            copy(data, parsed_data[scope][scope_id]);
          }
        } else {
          copy(data, parsed_data[scope]);
        }
        scope = null;
        scope_id = null;
        scope_id_str = null;
        in_scope = false;
        scope_begin = null;
        scope_content = [];
      } else {
        scope_content.push(line);
      }
    }
    if (in_scope) {
      this["throw"]('scope is not closed (missing closing bracket)');
    }
    delete this.index;
    if (parsed_data.surface != null) {
      parsed_data.surfaces = parsed_data.surface;
      delete parsed_data.surface;
      _ref5 = parsed_data.surfaces;
      for (id in _ref5) {
        surface = _ref5[id];
        result = null;
        if (result = id.match(/^surface(\d+)$/)) {
          surface.is = result[1] - 0;
        }
      }
    }
    if (parsed_data['surface.alias'] != null) {
      parsed_data.aliases = parsed_data['surface.alias'];
      delete parsed_data['surface.alias'];
    }
    if (parsed_data.cursor != null) {
      if (parsed_data.regions == null) {
        parsed_data.regions = {};
      }
      _ref6 = parsed_data.cursor;
      for (character in _ref6) {
        settings = _ref6[character];
        if (parsed_data.regions[character] == null) {
          parsed_data.regions[character] = {};
        }
        for (type in settings) {
          setting = settings[type];
          if (parsed_data.regions[character][setting.region_id] == null) {
            parsed_data.regions[character][setting.region_id] = {};
          }
          if (parsed_data.regions[character][setting.region_id].cursor == null) {
            parsed_data.regions[character][setting.region_id].cursor = {};
          }
          parsed_data.regions[character][setting.region_id].cursor[type] = setting.file;
        }
      }
      delete parsed_data.cursor;
    }
    if (parsed_data.tooltips != null) {
      if (parsed_data.regions == null) {
        parsed_data.regions = {};
      }
      _ref7 = parsed_data.tooltips;
      for (character in _ref7) {
        regions = _ref7[character];
        if (parsed_data.regions[character] == null) {
          parsed_data.regions[character] = {};
        }
        for (region_id in regions) {
          tooltip = regions[region_id];
          if (parsed_data.regions[character][region_id] == null) {
            parsed_data.regions[character][region_id] = {};
          }
          parsed_data.regions[character][region_id].tooltip = tooltip;
        }
      }
      delete parsed_data.tooltips;
    }
    return parsed_data;
  };

  Parser.prototype.warn = function(message) {
    var mes;
    mes = '[WARNING] line ' + (this.index + 1) + ': ' + message;
    return console.warn(mes);
  };

  Parser.prototype["throw"] = function(message) {
    var mes;
    mes = '[ERROR] line ' + (this.index + 1) + ': ' + message;
    if (this.options.lint) {
      return console.warn(mes);
    } else {
      throw mes;
    }
  };

  Parser.prototype.warnthrow = function(message, warnthrow) {
    if (warnthrow) {
      if (warnthrow === 'warn') {
        return this.warn(message);
      } else {
        return this["throw"](message);
      }
    }
  };

  return Parser;

})();

SurfacesTxt2Yaml.ScopeParser = {};

SurfacesTxt2Yaml.ScopeParser.Single = (function() {
  function Single(options) {
    this.options = {};
    if (options != null) {
      this.set_options(options);
    }
  }

  Single.prototype.set_options = function(options) {
    var name, prefix, value;
    for (name in options) {
      value = options[name];
      this.options[name] = value;
    }
    return this.options.standard_comment_re = new RegExp('^\\s*(?:' + ((function() {
      var _i, _len, _ref, _results;
      _ref = this.options.comment_prefix;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        _results.push(prefix.replace(/\W/, '\\$&'));
      }
      return _results;
    }).call(this)).join('|') + ')|^\s*$');
  };

  Single.prototype.parse = function(lines, index_offset) {
    var data, index, line, result, _i, _len;
    this.index_offset = index_offset;
    data = {};
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      if (result = line.match(this.condition.test)) {
        this.condition.match.call(this, data, result);
      } else if (this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
        this.warnthrow('invalid line found in scope inside : ' + line, this.options.check_nonstandard_comment);
      }
    }
    delete this.index_offset;
    delete this.index;
    return data;
  };

  Single.prototype.warn = function(message) {
    var mes;
    mes = '[WARNING] line ' + (this.index_offset + this.index + 1) + ': ' + message;
    console.warn(mes);
  };

  Single.prototype["throw"] = function(message) {
    var mes;
    mes = '[ERROR] line ' + (this.index_offset + this.index + 1) + ': ' + message;
    if (this.options.lint) {
      console.warn(mes);
    } else {
      throw mes;
    }
  };

  Single.prototype.warnthrow = function(message, warnthrow) {
    if (warnthrow) {
      if (warnthrow === 'warn') {
        return this.warn(message);
      } else {
        return this["throw"](message);
      }
    }
  };

  return Single;

})();

SurfacesTxt2Yaml.ScopeParser.Multiple = (function(_super) {
  __extends(Multiple, _super);

  function Multiple() {
    return Multiple.__super__.constructor.apply(this, arguments);
  }

  Multiple.prototype.parse = function(lines, index_offset) {
    var condition, data, index, line, match, result, _i, _j, _len, _len1, _ref;
    this.index_offset = index_offset;
    data = {};
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      this.index = index;
      result = null;
      match = false;
      _ref = this.conditions;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        condition = _ref[_j];
        if (result = line.match(condition.test)) {
          match = condition.match.call(this, data, result);
          if (match) {
            break;
          }
        }
      }
      if (!match && this.options.check_nonstandard_comment && !line.match(this.options.standard_comment_re)) {
        this.warnthrow('invalid line found in scope inside : ' + line, this.options.check_nonstandard_comment);
      }
    }
    delete this.index_offset;
    delete this.index;
    return data;
  };

  return Multiple;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.descript = (function(_super) {
  __extends(descript, _super);

  function descript() {
    return descript.__super__.constructor.apply(this, arguments);
  }

  descript.prototype.conditions = [
    {
      test: /^\s*version,([01])$/,
      match: function(data, result) {
        data.version = result[1] - 0;
        return true;
      }
    }, {
      test: /^\s*maxwidth,(\d+)$/,
      match: function(data, result) {
        data.maxwidth = result[1] - 0;
        return true;
      }
    }, {
      test: /^\s*(collision-sort|animation-sort),(.+)$/,
      match: function(data, result) {
        data[result[1]] = result[2];
        return true;
      }
    }
  ];

  return descript;

})(SurfacesTxt2Yaml.ScopeParser.Multiple);

SurfacesTxt2Yaml.ScopeParser.tooltips = (function(_super) {
  __extends(tooltips, _super);

  function tooltips() {
    return tooltips.__super__.constructor.apply(this, arguments);
  }

  tooltips.prototype.condition = {
    test: /^\s*([^,]+),(.+)$/,
    match: function(data, result) {
      return data[result[1]] = result[2];
    }
  };

  return tooltips;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.cursor = (function(_super) {
  __extends(cursor, _super);

  function cursor() {
    return cursor.__super__.constructor.apply(this, arguments);
  }

  cursor.prototype.condition = {
    test: /^\s*(mouseup|mousedown)(\d+),([^,]+),(.+)$/,
    match: function(data, result) {
      return data[result[1]] = {
        region_id: result[3],
        file: result[4]
      };
    }
  };

  return cursor;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser['surface.alias'] = (function(_super) {
  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.condition = {
    test: /^\s*([^,]+),\[(.+)\]$/,
    match: function(data, result) {
      var id;
      return data[result[1]] = (function() {
        var _i, _len, _ref, _results;
        _ref = result[2].split(/\s*,\s*/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          _results.push(id - 0);
        }
        return _results;
      })();
    }
  };

  return _Class;

})(SurfacesTxt2Yaml.ScopeParser.Single);

SurfacesTxt2Yaml.ScopeParser.surface = (function(_super) {
  __extends(surface, _super);

  function surface(options, seriko_version) {
    this.seriko_version = seriko_version != null ? seriko_version : 0;
    this.options = {};
    if (options != null) {
      this.set_options(options);
    }
  }

  surface.prototype.conditions = [
    {
      test: /^\s*element(\d+),([^,]+),([^,]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_element(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.interval,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_interval(data, result);
      }
    }, {
      test: /^\s*(\d+)interval,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_interval(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.option,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_option(data, result);
      }
    }, {
      test: /^\s*(\d+)option,(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_option(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.pattern(\d+),([^,]+),(.+)$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 0) {
          this.warnthrow('not SERIKO/1.x definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_pattern(data, result);
      }
    }, {
      test: /^\s*(\d+)pattern(\d+),([^,]+),([^,]+),([^,]+)(?:,(.+))?$/,
      match: function(data, result) {
        if (this.options.check_seriko && this.seriko_version === 1) {
          this.warnthrow('not SERIKO/2.0 definition : ' + result[0], this.options.check_seriko);
          if (!this.options.allow_all_seriko) {
            return;
          }
        }
        return this.match_animation_pattern_old(data, result);
      }
    }, {
      test: /^\s*animation(\d+)\.collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collision(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_4(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),(circle),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_3(data.animations[id], result);
      }
    }, {
      test: /^\s*animation(\d+)\.collisionex(\d+),([^,]+),polygon,(.+)$/,
      match: function(data, result) {
        var id, _is;
        _is = (result.splice(1, 1))[0] - 0;
        id = 'animation' + _is;
        if (data.animations == null) {
          data.animations = {};
        }
        if (data.animations[id] == null) {
          data.animations[id] = {
            is: _is
          };
        }
        return this.match_collisionex_n(data.animations[id], result);
      }
    }, {
      test: /^\s*collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/,
      match: function(data, result) {
        return this.match_collision(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_collisionex_4(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),(circle),([-0-9]+),([-0-9]+),([-0-9]+)$/,
      match: function(data, result) {
        return this.match_collisionex_3(data, result);
      }
    }, {
      test: /^\s*collisionex(\d+),([^,]+),polygon,(.+)$/,
      match: function(data, result) {
        return this.match_collisionex_n(data, result);
      }
    }, {
      test: /^\s*point(?:\.(kinoko))?\.(center[xy]),([-0-9]+)$/,
      match: function(data, result) {
        var coordinate, id, type, _ref;
        _ref = result.slice(1, 4), id = _ref[0], type = _ref[1], coordinate = _ref[2];
        coordinate -= 0;
        if (data.points == null) {
          data.points = {};
        }
        if (id != null) {
          if (data.points[id] == null) {
            data.points[id] = {};
          }
          data.points[id][type] = coordinate;
        } else {
          data.points[type] = coordinate;
        }
        return true;
      }
    }, {
      test: /^\s*point\.basepos\.([xy]),([-0-9]+)$/,
      match: function(data, result) {
        var coordinate, type, _ref;
        _ref = result.slice(1, 3), type = _ref[0], coordinate = _ref[1];
        coordinate -= 0;
        if (data.points == null) {
          data.points = {};
        }
        if (data.points.basepos == null) {
          data.points.basepos = {};
        }
        data.points.basepos[type] = coordinate;
        return true;
      }
    }, {
      test: /^\s*(?:(sakura|kero)\.)?balloon\.(offset[xy]),([-0-9]+)$/,
      match: function(data, result) {
        var character, coordinate, type, _ref;
        _ref = result.slice(1, 4), character = _ref[0], type = _ref[1], coordinate = _ref[2];
        coordinate -= 0;
        if (data.balloons == null) {
          data.balloons = {};
        }
        if (character != null) {
          if (data.balloons[character] == null) {
            data.balloons[character] = {};
          }
          data.balloons[character][type] = coordinate;
        } else {
          data.balloons[type] = coordinate;
        }
        return true;
      }
    }
  ];

  surface.prototype.match_element = function(data, result) {
    var file, id, type, x, y, _is, _ref;
    _ref = result.slice(1, 6), _is = _ref[0], type = _ref[1], file = _ref[2], x = _ref[3], y = _ref[4];
    _is -= 0;
    x -= 0;
    y -= 0;
    id = 'element' + _is;
    if (data.elements == null) {
      data.elements = {};
    }
    if (data.elements[id] != null) {
      this.warnthrow('element id duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.elements[id] != null) {
        id = 'element' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.elements[id] = {
      is: _is,
      type: type,
      file: file,
      x: x,
      y: y
    };
    return true;
  };

  surface.prototype.match_animation_interval = function(data, result) {
    var id, interval, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 3), _is = _ref[0], interval = _ref[1];
    _is -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (((_ref1 = data.animations[id]) != null ? _ref1.interval : void 0) != null) {
      this.warnthrow('animation interval duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (((_ref2 = data.animations[id]) != null ? _ref2.interval : void 0) != null) {
        id = 'animation' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    data.animations[id].interval = interval;
    return true;
  };

  surface.prototype.match_animation_option = function(data, result) {
    var id, option, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 3), _is = _ref[0], option = _ref[1];
    _is -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (((_ref1 = data.animations[id]) != null ? _ref1.option : void 0) != null) {
      this.warnthrow('animation option duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (((_ref2 = data.animations[id]) != null ? _ref2.option : void 0) != null) {
        id = 'animation' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    data.animations[id].option = option;
    return true;
  };

  surface.prototype.match_animation_pattern = function(data, result) {
    var animation_id, arg, args, args_str, id, name, p_id, type, _is, _ref, _ref1, _ref2;
    _ref = result.slice(1, 5), _is = _ref[0], p_id = _ref[1], type = _ref[2], args_str = _ref[3];
    _is -= 0;
    p_id -= 0;
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    if (data.animations[id].patterns == null) {
      data.animations[id].patterns = [];
    }
    if (data.animations[id].patterns[p_id] != null) {
      this.warnthrow('animation pattern duplication found : ' + p_id, this.options.check_surface_scope_duplication);
      while (data.animations[id].patterns[p_id] != null) {
        ++p_id;
      }
      this.warnthrow(' replace to : ' + p_id, this.options.check_surface_scope_duplication);
    }
    data.animations[id].patterns[p_id] = {
      type: type
    };
    args = {};
    switch (type) {
      case 'overlay':
      case 'overlayfast':
      case 'reduce':
      case 'replace':
      case 'interpolate':
      case 'asis':
      case 'bind':
      case 'add':
      case 'reduce':
      case 'move':
        _ref1 = args_str.split(','), args.surface = _ref1[0], args.wait = _ref1[1], args.x = _ref1[2], args.y = _ref1[3];
        if (args.surface != null) {
          args.surface -= 0;
        }
        if ((args.wait != null) && !isNaN(args.wait)) {
          args.wait -= 0;
        }
        if (args.x != null) {
          args.x -= 0;
        }
        if (args.y != null) {
          args.y -= 0;
        }
        break;
      case 'base':
        _ref2 = args_str.split(','), args.surface = _ref2[0], args.wait = _ref2[1];
        if (args.surface != null) {
          args.surface -= 0;
        }
        if ((args.wait != null) && !isNaN(args.wait)) {
          args.wait -= 0;
        }
        break;
      case 'insert':
      case 'start':
      case 'stop':
        args.animation_id = 'animation' + args_str.match(/\[?(.*)\]?/)[1];
        break;
      case 'alternativestart':
      case 'alternativestop':
        args.animation_ids = (function() {
          var _i, _len, _ref3, _results;
          _ref3 = args_str.match(/[\(\[]?(.*)[\]\)]?/)[1].split(/[.,]/);
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            animation_id = _ref3[_i];
            _results.push('animation' + animation_id);
          }
          return _results;
        })();
    }
    for (name in args) {
      arg = args[name];
      if (arg != null) {
        data.animations[id].patterns[p_id][name] = arg;
      }
    }
    return true;
  };

  surface.prototype.match_animation_pattern_old = function(data, result) {
    var animation_id, arg, args, args_str, id, name, p_id, surface, type, wait, wait_result, _is, _ref, _ref1, _ref2, _ref3;
    _ref = result.slice(1, 7), _is = _ref[0], p_id = _ref[1], surface = _ref[2], wait = _ref[3], type = _ref[4], args_str = _ref[5];
    _is -= 0;
    p_id -= 0;
    surface -= 0;
    if (wait_result = wait.match(/(\d+)-(\d+)/)) {
      wait = (wait_result[1] * 10) + '-' + (wait_result[2] * 10);
    } else {
      wait *= 10;
    }
    id = 'animation' + _is;
    if (data.animations == null) {
      data.animations = {};
    }
    if (data.animations[id] == null) {
      data.animations[id] = {
        is: _is
      };
    }
    if (data.animations[id].patterns == null) {
      data.animations[id].patterns = [];
    }
    if (data.animations[id].patterns[p_id] != null) {
      this.warnthrow('animation pattern duplication found : ' + p_id, this.options.check_surface_scope_duplication);
      while (data.animations[id].patterns[p_id] != null) {
        ++p_id;
      }
      this.warnthrow(' replace to : ' + p_id, this.options.check_surface_scope_duplication);
    }
    data.animations[id].patterns[p_id] = {
      type: type
    };
    args = {};
    switch (type) {
      case 'overlay':
      case 'overlayfast':
      case 'reduce':
      case 'replace':
      case 'interpolate':
      case 'asis':
      case 'bind':
      case 'add':
      case 'reduce':
      case 'move':
        _ref1 = [surface, wait], args.surface = _ref1[0], args.wait = _ref1[1];
        if (args_str) {
          _ref2 = args_str.split(','), args.x = _ref2[0], args.y = _ref2[1];
          if (args.x != null) {
            args.x -= 0;
          }
          if (args.y != null) {
            args.y -= 0;
          }
        }
        break;
      case 'base':
        _ref3 = [surface, wait], args.surface = _ref3[0], args.wait = _ref3[1];
        break;
      case 'insert':
      case 'start':
      case 'stop':
        args.animation_id = 'animation' + args_str;
        break;
      case 'alternativestart':
      case 'alternativestop':
        args.animation_ids = (function() {
          var _i, _len, _ref4, _results;
          _ref4 = args_str.split(',');
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            animation_id = _ref4[_i];
            _results.push('animation' + animation_id);
          }
          return _results;
        })();
    }
    for (name in args) {
      arg = args[name];
      if (arg != null) {
        data.animations[id].patterns[p_id][name] = arg;
      }
    }
    return true;
  };

  surface.prototype.match_collision = function(data, result) {
    var bottom, id, left, name, right, top, _is, _ref;
    _ref = result.slice(1, 7), _is = _ref[0], left = _ref[1], top = _ref[2], right = _ref[3], bottom = _ref[4], name = _ref[5];
    _is -= 0;
    left -= 0;
    top -= 0;
    right -= 0;
    bottom -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collision duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: 'rect',
      name: name,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    };
    return true;
  };

  surface.prototype.match_collisionex_4 = function(data, result) {
    var bottom, id, left, name, right, top, type, _is, _ref;
    _ref = result.slice(1, 8), _is = _ref[0], name = _ref[1], type = _ref[2], left = _ref[3], top = _ref[4], right = _ref[5], bottom = _ref[6];
    _is -= 0;
    left -= 0;
    top -= 0;
    right -= 0;
    bottom -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: type,
      name: name,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    };
    return true;
  };

  surface.prototype.match_collisionex_3 = function(data, result) {
    var center_x, center_y, id, name, radius, type, _is, _ref;
    _ref = result.slice(1, 8), _is = _ref[0], name = _ref[1], type = _ref[2], center_x = _ref[3], center_y = _ref[4], radius = _ref[5];
    _is -= 0;
    center_x -= 0;
    center_y -= 0;
    radius -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    data.regions[id] = {
      is: _is,
      type: type,
      name: name,
      center_x: center_x,
      center_y: center_y,
      radius: radius
    };
    return true;
  };

  surface.prototype.match_collisionex_n = function(data, result) {
    var c, coordinate, coordinates, coordinates_str, id, index, name, _i, _is, _len, _ref, _ref1;
    _ref = result.slice(1, 4), _is = _ref[0], name = _ref[1], coordinates_str = _ref[2];
    _is -= 0;
    id = 'collision' + _is;
    if (data.regions == null) {
      data.regions = {};
    }
    if (data.regions[id] != null) {
      this.warnthrow('collisionex duplication found : ' + _is, this.options.check_surface_scope_duplication);
      while (data.regions[id] != null) {
        id = 'collision' + ++_is;
      }
      this.warnthrow(' replace to : ' + _is, this.options.check_surface_scope_duplication);
    }
    coordinates = [];
    coordinate = {};
    _ref1 = coordinates_str.split(',');
    for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
      c = _ref1[index];
      if (index % 2 === 0) {
        coordinate.x = c - 0;
      } else {
        coordinate.y = c - 0;
        coordinates.push(coordinate);
        coordinate = {};
      }
    }
    if (coordinate.x != null) {
      this["throw"]('odd number of collisionex coordinates');
    }
    data.regions[id] = {
      is: _is,
      type: 'polygon',
      name: name,
      coordinates: coordinates
    };
    return true;
  };

  return surface;

})(SurfacesTxt2Yaml.ScopeParser.Multiple);

SurfacesTxt2Yaml.txt_to_data = function(txt_str, options) {
  var parser;
  parser = new SurfacesTxt2Yaml.Parser(options);
  return parser.parse(txt_str);
};

SurfacesTxt2Yaml.txt_to_yaml = function(txt_str, options) {
  var data, e;
  data = SurfacesTxt2Yaml.txt_to_data(txt_str, options);
  try {
    return (jsyaml.dump(data, {
      indent: 4,
      flowLevel: 6
    })).replace(/"y"/g, 'y');
  } catch (_error) {
    e = _error;
    throw e;
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  exports.Parser = SurfacesTxt2Yaml.Parser;
  exports.txt_to_data = SurfacesTxt2Yaml.txt_to_data;
  exports.txt_to_yaml = SurfacesTxt2Yaml.txt_to_yaml;
}

},{"js-yaml":12}]},{},[6])(6)
});