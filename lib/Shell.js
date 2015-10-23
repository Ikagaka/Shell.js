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