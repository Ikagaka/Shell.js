/// <reference path="../typings/index.d.ts"/>
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Surface_1 = require('./Surface');
var SurfaceUtil = require("./SurfaceUtil");
var SurfacesTxt2Yaml = require("surfaces_txt2yaml");
var EventEmitter = require("events");
var $ = require("jquery");

var Shell = function (_EventEmitter$EventEm) {
    _inherits(Shell, _EventEmitter$EventEm);

    function Shell(directory) {
        _classCallCheck(this, Shell);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Shell).call(this));

        _this.descript = {};
        _this.config = {};
        _this.directory = directory;
        _this.attachedSurface = [];
        _this.surfacesTxt = {};
        _this.surfaceTree = [];
        _this.cacheCanvas = {};
        _this.bindgroup = [];
        _this.enableRegion = false;
        return _this;
    }

    _createClass(Shell, [{
        key: "load",
        value: function load() {
            var _this2 = this;

            return Promise.resolve(this).then(function () {
                return _this2.loadDescript();
            }) // 1st // ←なにこれ（自問自
            .then(function () {
                return _this2.loadConfig();
            }).then(function () {
                return _this2.loadBindGroup();
            }) // 2nd // 依存関係的なやつだと思われ
            .then(function () {
                return _this2.loadSurfacesTxt();
            }) // 1st
            .then(function () {
                return _this2.loadSurfaceTable();
            }) // 1st
            .then(function () {
                return _this2.loadSurfacePNG();
            }) // 2nd
            .then(function () {
                return _this2.loadCollisions();
            }) // 3rd
            .then(function () {
                return _this2.loadAnimations();
            }) // 3rd
            .then(function () {
                return _this2.loadElements();
            }) // 3rd
            .then(function () {
                return _this2;
            }) // 3rd
            .catch(function (err) {
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
    }, {
        key: "loadConfig",
        value: function loadConfig() {
            var _this3 = this;

            // configへ流し込む
            var descript = this.descript;
            // オートマージ
            Object.keys(descript).forEach(function (key) {
                var ptr = _this3.config;
                var props = key.split(".");
                for (var i = 0; i < props.length; i++) {
                    var prop = props[i];

                    var _Array$prototype$slic = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop) || ["", "", ""], 1);

                    var _Array$prototype$slic2 = _slicedToArray(_Array$prototype$slic, 2);

                    var _prop = _Array$prototype$slic2[0];
                    var num = _Array$prototype$slic2[1];

                    var _num = Number(num);
                    if (isFinite(_num)) {
                        if (!Array.isArray(ptr[_prop])) {
                            ptr[_prop] = [];
                        }
                        ptr[_prop][_num] = ptr[_prop][_num] || {};
                        if (i !== props.length - 1) {
                            ptr = ptr[_prop][_num];
                        } else {
                            if (ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0) {
                                // menu, 0 -> menu.value
                                // menu.font...
                                ptr[_prop][_num].value = Number(descript[key]) || descript[key];
                            } else {
                                ptr[_prop][_num] = Number(descript[key]) || descript[key];
                            }
                        }
                    } else {
                        ptr[_prop] = ptr[_prop] || {};
                        if (i !== props.length - 1) {
                            ptr = ptr[_prop];
                        } else {
                            if (ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0) {
                                ptr[_prop].value = Number(descript[key]) || descript[key];
                            } else {
                                ptr[_prop] = Number(descript[key]) || descript[key];
                            }
                        }
                    }
                }
            });
            if (typeof this.config.menu.value === "number") {
                this.config.menu.value = +this.config.menu.value > 0; // number -> boolean
            } else {
                this.config.menu.value = true; // default value
            }
            this.config.char = this.config.char || [];
            // sakura -> char0
            this.config.char[0] = this.config.char[0] || {};
            $.extend(true, this.config["char"][0], this.config["sakura"]);
            delete this.config["sakura"];
            // kero -> char1
            this.config.char = this.config.char || [];
            this.config.char[1] = this.config.char[1] || {};
            $.extend(true, this.config.char[1], this.config["kero"]);
            delete this.config["kero"];
            // char*
            this.config.char.forEach(function (char) {
                // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
                if (!Array.isArray(char.bindgroup)) {
                    char.bindgroup = [];
                }
                char.bindgroup.forEach(function (bindgroup) {
                    if (typeof bindgroup.name === "string") {
                        var _split$map = ("" + bindgroup.name).split(",").map(function (a) {
                            return a.trim();
                        });

                        var _split$map2 = _slicedToArray(_split$map, 3);

                        var category = _split$map2[0];
                        var parts = _split$map2[1];
                        var thumbnail = _split$map2[2];

                        bindgroup.name = { category: category, parts: parts, thumbnail: thumbnail };
                    }
                });
                // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
                if (!Array.isArray(char.bindoption)) {
                    char.bindoption = [];
                }
                char.bindoption.forEach(function (bindoption) {
                    if (typeof bindoption.group === "string") {
                        var _split$map3 = ("" + bindoption.group).split(",").map(function (a) {
                            return a.trim();
                        });

                        var _split$map4 = _toArray(_split$map3);

                        var category = _split$map4[0];

                        var options = _split$map4.slice(1);

                        bindoption.group = { category: category, options: options };
                    }
                });
            });
            return Promise.resolve(this);
        }
        // descript.txtからbindgroup探してデフォルト値を反映

    }, {
        key: "loadBindGroup",
        value: function loadBindGroup() {
            var _this4 = this;

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
                    _this4.bindgroup[maybeNumCharId] = _this4.bindgroup[maybeNumCharId] || [];
                    if (dflt === "default") {
                        _this4.bindgroup[maybeNumCharId][maybeNumBindgroupId] = !!Number(descript[key]);
                    } else {
                        _this4.bindgroup[maybeNumCharId][maybeNumBindgroupId] = _this4.bindgroup[maybeNumCharId][maybeNumBindgroupId] || false;
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
            var _this5 = this;

            var surfaces_text_names = Object.keys(this.directory).filter(function (name) {
                return (/^surfaces.*\.txt$|^alias\.txt$/i.test(name)
                );
            });
            if (surfaces_text_names.length === 0) {
                console.info("surfaces.txt is not found");
                this.surfacesTxt = { surfaces: {}, descript: {}, aliases: {}, regions: {} };
            } else {
                // cat surfaces*.txt
                var text = surfaces_text_names.reduce(function (text, filename) {
                    return text + SurfaceUtil.convert(_this5.directory[filename]);
                }, "");
                this.surfacesTxt = SurfacesTxt2Yaml.txt_to_data(text, { compatible: 'ssp-lazy' });
                // SurfacesTxt2Yamlの継承の expand と remove
                Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                    if (typeof _this5.surfacesTxt.surfaces[name].is === "number" && Array.isArray(_this5.surfacesTxt.surfaces[name].base)) {
                        _this5.surfacesTxt.surfaces[name].base.forEach(function (key) {
                            $.extend(true, _this5.surfacesTxt.surfaces[name], _this5.surfacesTxt.surfaces[key]);
                        });
                        delete _this5.surfacesTxt.surfaces[name].base;
                    }
                });
                Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                    if (typeof _this5.surfacesTxt.surfaces[name].is === "undefined") {
                        delete _this5.surfacesTxt.surfaces[name];
                    }
                });
                // expand ここまで
                this.surfacesTxt.descript = this.surfacesTxt.descript || {};
                if (typeof this.surfacesTxt.descript["collision-sort"] === "string") {
                    console.warn("Shell#loadSurfacesTxt", "collision-sort is not supported yet.");
                }
                if (typeof this.surfacesTxt.descript["animation-sort"] === "string") {
                    console.warn("Shell#loadSurfacesTxt", "animation-sort is not supported yet.");
                }
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
                console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
            } else {
                var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
                console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
            }
            return Promise.resolve(this);
        }
        // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映

    }, {
        key: "loadSurfacePNG",
        value: function loadSurfacePNG() {
            var _this6 = this;

            var surface_names = Object.keys(this.directory).filter(function (filename) {
                return (/^surface(\d+)\.png$/i.test(filename)
                );
            });
            return new Promise(function (resolve, reject) {
                var i = 0;
                surface_names.forEach(function (filename) {
                    var n = Number((/^surface(\d+)\.png$/i.exec(filename) || ["", "NaN"])[1]);
                    if (!isFinite(n)) return;
                    i++;
                    _this6.getPNGFromDirectory(filename, function (err, cnv) {
                        if (err != null) {
                            console.warn("Shell#loadSurfacePNG > " + err);
                        } else {
                            if (!_this6.surfaceTree[n]) {
                                // surfaces.txtで未定義なら追加
                                _this6.surfaceTree[n] = {
                                    base: cnv,
                                    elements: [],
                                    collisions: [],
                                    animations: []
                                };
                            } else {
                                // surfaces.txtで定義済み
                                _this6.surfaceTree[n].base = cnv;
                            }
                        }
                        if (--i <= 0) {
                            resolve(_this6);
                        }
                    });
                });
            });
        }
        // this.surfacesTxt から element を読み込んで this.surfaceTree に反映

    }, {
        key: "loadElements",
        value: function loadElements() {
            var _this7 = this;

            var srfs = this.surfacesTxt.surfaces;
            var hits = Object.keys(srfs).filter(function (name) {
                return !!srfs[name].elements;
            });
            return new Promise(function (resolve, reject) {
                var i = 0;
                if (hits.length === 0) return resolve(_this7);
                hits.forEach(function (defname) {
                    var n = srfs[defname].is;
                    var elms = srfs[defname].elements;
                    var _prms = Object.keys(elms).map(function (elmname) {
                        var _elms$elmname = elms[elmname];
                        var is = _elms$elmname.is;
                        var type = _elms$elmname.type;
                        var file = _elms$elmname.file;
                        var x = _elms$elmname.x;
                        var y = _elms$elmname.y;

                        i++;
                        _this7.getPNGFromDirectory(file, function (err, canvas) {
                            if (err != null || canvas == null) {
                                console.warn("Shell#loadElements > " + err);
                            } else {
                                if (!_this7.surfaceTree[n]) {
                                    _this7.surfaceTree[n] = {
                                        base: { cnv: null, png: null, pna: null },
                                        elements: [],
                                        collisions: [],
                                        animations: []
                                    };
                                }
                                _this7.surfaceTree[n].elements[is] = { type: type, canvas: canvas, x: x, y: y };
                            }
                            if (--i <= 0) {
                                resolve(_this7);
                            }
                        });
                    });
                });
            });
        }
        // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映

    }, {
        key: "loadCollisions",
        value: function loadCollisions() {
            var _this8 = this;

            var srfs = this.surfacesTxt.surfaces;
            Object.keys(srfs).filter(function (name) {
                return !!srfs[name].regions;
            }).forEach(function (defname) {
                var n = srfs[defname].is;
                var regions = srfs[defname].regions;
                Object.keys(regions).forEach(function (regname) {
                    if (!_this8.surfaceTree[n]) {
                        _this8.surfaceTree[n] = {
                            base: { cnv: null, png: null, pna: null },
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    }
                    var is = regions[regname].is;

                    _this8.surfaceTree[n].collisions[is] = regions[regname];
                });
            });
            return Promise.resolve(this);
        }
        // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映

    }, {
        key: "loadAnimations",
        value: function loadAnimations() {
            var _this9 = this;

            var srfs = this.surfacesTxt.surfaces;
            Object.keys(srfs).filter(function (name) {
                return !!srfs[name].animations;
            }).forEach(function (defname) {
                var n = srfs[defname].is;
                var animations = srfs[defname].animations;
                Object.keys(animations).forEach(function (animId) {
                    if (!_this9.surfaceTree[n]) {
                        _this9.surfaceTree[n] = {
                            base: { cnv: null, png: null, pna: null },
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    }
                    var _animations$animId = animations[animId];
                    var is = _animations$animId.is;
                    var _animations$animId$in = _animations$animId.interval;
                    var interval = _animations$animId$in === undefined ? "never" : _animations$animId$in;
                    var _animations$animId$op = _animations$animId.option;
                    var option = _animations$animId$op === undefined ? "" : _animations$animId$op;
                    var _animations$animId$pa = _animations$animId.patterns;
                    var patterns = _animations$animId$pa === undefined ? [] : _animations$animId$pa;
                    var _animations$animId$re = _animations$animId.regions;
                    var regions = _animations$animId$re === undefined ? {} : _animations$animId$re;
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
                    var _options = options.map(function (option) {
                        return [option.trim(), _opt_args];
                    });

                    var _interval$split = interval.split(",");

                    var _interval$split2 = _toArray(_interval$split);

                    var _interval = _interval$split2[0];

                    var int_args = _interval$split2.slice(1);

                    var _int_args = int_args.map(function (str) {
                        return str.trim();
                    });
                    var intervals = _interval.split("+"); // sometimes+talk
                    var _intervals = intervals.map(function (interval) {
                        return [interval.trim(), _int_args];
                    });
                    var _regions = [];
                    Object.keys(regions).forEach(function (key) {
                        _regions[regions[key].is] = regions[key];
                    });
                    _this9.surfaceTree[n].animations[is] = {
                        options: _options,
                        intervals: _intervals,
                        regions: _regions,
                        is: is, patterns: patterns, interval: interval
                    };
                });
            });
            return Promise.resolve(this);
        }
    }, {
        key: "hasFile",
        value: function hasFile(filename) {
            return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
        }
        // this.cacheCanvas から filename な SurfaceCanvas を探す。
        // なければ this.directory から探し this.cacheCanvas にキャッシュする
        // 非同期の理由：img.onload = blob url

    }, {
        key: "getPNGFromDirectory",
        value: function getPNGFromDirectory(filename, cb) {
            var _this10 = this;

            var cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
            if (cached_filename !== "") {
                cb(null, this.cacheCanvas[cached_filename]);
                return;
            }
            if (!this.hasFile(filename)) {
                // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
                filename += ".png";
                if (!this.hasFile(filename)) {
                    cb(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")), null);
                    return;
                }
                console.warn("Shell#getPNGFromDirectory", "element file " + filename.substr(0, filename.length - ".png".length) + " need '.png' extension");
            }
            var _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
            var pnafilename = _filename.replace(/\.png$/i, ".pna");
            var _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
            var pngbuf = this.directory[_filename];
            SurfaceUtil.getImageFromArrayBuffer(pngbuf, function (err, png) {
                if (err != null) return cb(err, null);
                // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
                if (_pnafilename === "") {
                    _this10.cacheCanvas[_filename] = { cnv: null, png: png, pna: null };
                    cb(null, _this10.cacheCanvas[_filename]);
                    return;
                }
                var pnabuf = _this10.directory[_pnafilename];
                SurfaceUtil.getImageFromArrayBuffer(pnabuf, function (err, pna) {
                    if (err != null) return cb(err, null);
                    _this10.cacheCanvas[_filename] = { cnv: null, png: png, pna: pna };
                    cb(null, _this10.cacheCanvas[_filename]);
                });
            });
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(div, scopeId, surfaceId) {
            var _this11 = this;

            var type = SurfaceUtil.scope(scopeId);
            var hits = this.attachedSurface.filter(function (_ref) {
                var _div = _ref.div;
                return _div === div;
            });
            if (hits.length !== 0) throw new Error("Shell#attachSurface > ReferenceError: this HTMLDivElement is already attached");
            if (scopeId < 0) {
                throw new Error("Shell#attachSurface > TypeError: scopeId needs more than 0, but:" + scopeId);
            }
            var _surfaceId = this.getSurfaceAlias(scopeId, surfaceId);
            if (_surfaceId !== surfaceId) {
                console.info("Shell#attachSurface", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
            }
            if (!this.surfaceTree[_surfaceId]) {
                console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", this.surfaceTree);
                return null;
            }
            var srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceTree, this.bindgroup);
            srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
            if (this.enableRegion) {
                srf.render();
            }
            srf.on("mouse", function (ev) {
                _this11.emit("mouse", ev); // detachSurfaceで消える
            });
            this.attachedSurface.push({ div: div, surface: srf });
            return srf;
        }
    }, {
        key: "detachSurface",
        value: function detachSurface(div) {
            var hits = this.attachedSurface.filter(function (_ref2) {
                var _div = _ref2.div;
                return _div === div;
            });
            if (hits.length === 0) return;
            hits[0].surface.destructor(); // srf.onのリスナはここで消される
            this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
        }
    }, {
        key: "unload",
        value: function unload() {
            this.attachedSurface.forEach(function (_ref3) {
                var div = _ref3.div;
                var surface = _ref3.surface;

                surface.destructor();
            });
            this.removeAllListeners();
            Shell.call(this, {}); // 初期化
        }
    }, {
        key: "getSurfaceAlias",
        value: function getSurfaceAlias(scopeId, surfaceId) {
            var type = SurfaceUtil.scope(scopeId);
            var _surfaceId = -1;
            if (typeof surfaceId === "string" || typeof surfaceId === "number") {
                if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                    // まずエイリアスを探す
                    _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
                } else if (typeof surfaceId === "number") {
                    // 通常の処理
                    _surfaceId = surfaceId;
                }
            } else {
                // そんなサーフェスはない
                console.warn("Shell#hasSurface > surface alias scope:", scopeId + "as" + type + ", id:" + surfaceId + " is not defined.");
                _surfaceId = -1;
            }
            return _surfaceId;
        }
        // サーフェスエイリアス込みでサーフェスが存在するか確認

    }, {
        key: "hasSurface",
        value: function hasSurface(scopeId, surfaceId) {
            return this.getSurfaceAlias(scopeId, surfaceId) >= 0;
        }
    }, {
        key: "bind",
        value: function bind(a, b) {
            var _this12 = this;

            if (typeof a === "number" && typeof b === "number") {
                var scopeId = a;
                var bindgroupId = b;
                if (this.bindgroup[scopeId] == null) {
                    console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                    return;
                }
                this.bindgroup[scopeId][bindgroupId] = true;
                this.attachedSurface.forEach(function (_ref4) {
                    var srf = _ref4.surface;
                    var div = _ref4.div;

                    srf.updateBind();
                });
            } else if (typeof a === "string" && typeof b === "string") {
                (function () {
                    var _category = a;
                    var _parts = b;
                    _this12.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name = bindgroup.name;
                            var category = _bindgroup$name.category;
                            var parts = _bindgroup$name.parts;

                            if (_category === category && _parts === parts) {
                                _this12.bind(scopeId, bindgroupId);
                            }
                        });
                    });
                })();
            } else {
                console.error("Shell#bind", "TypeError:", a, b);
            }
        }
    }, {
        key: "unbind",
        value: function unbind(a, b) {
            var _this13 = this;

            if (typeof a === "number" && typeof b === "number") {
                var scopeId = a;
                var bindgroupId = b;
                if (this.bindgroup[scopeId] == null) {
                    console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                    return;
                }
                this.bindgroup[scopeId][bindgroupId] = false;
                this.attachedSurface.forEach(function (_ref5) {
                    var srf = _ref5.surface;
                    var div = _ref5.div;

                    srf.updateBind();
                });
            } else if (typeof a === "string" && typeof b === "string") {
                (function () {
                    var _category = a;
                    var _parts = b;
                    _this13.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name2 = bindgroup.name;
                            var category = _bindgroup$name2.category;
                            var parts = _bindgroup$name2.parts;

                            if (_category === category && _parts === parts) {
                                _this13.unbind(scopeId, bindgroupId);
                            }
                        });
                    });
                })();
            } else {
                console.error("Shell#unbind", "TypeError:", a, b);
            }
        }
        // 全サーフェス強制再描画

    }, {
        key: "render",
        value: function render() {
            this.attachedSurface.forEach(function (_ref6) {
                var srf = _ref6.surface;
                var div = _ref6.div;

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
                var div = _ref7.div;

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
                var div = _ref8.div;

                srf.enableRegionDraw = false;
            });
            this.render();
        }
        // 着せ替えメニュー用情報ていきょう

    }, {
        key: "getBindGroups",
        value: function getBindGroups(scopeId) {
            return this.config.char[scopeId].bindgroup.map(function (bindgroup, bindgroupId) {
                return bindgroup.name;
            });
        }
    }]);

    return Shell;
}(EventEmitter.EventEmitter);

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Shell;