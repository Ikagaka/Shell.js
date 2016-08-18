/// <reference path="../typings/index.d.ts"/>
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Surface_1 = require('./Surface');
var ST = require("./SurfaceTree");
var SU = require("./SurfaceUtil");
var SC = require("./ShellConfig");
var SurfacesTxt2Yaml = require("surfaces_txt2yaml");
var EventEmitter = require("events");

var Shell = function (_EventEmitter$EventEm) {
    _inherits(Shell, _EventEmitter$EventEm);

    function Shell(directory) {
        _classCallCheck(this, Shell);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Shell).call(this));

        _this.descript = {};
        _this.descriptJSON = {};
        _this.config = new SC.ShellConfig();
        _this.directory = directory;
        _this.attachedSurface = [];
        _this.surfacesTxt = {};
        _this.surfaceDefTree = new ST.SurfaceDefinitionTree();
        _this.surfaceTree = _this.surfaceDefTree.surfaces;
        _this.cacheCanvas = {};
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
                return console.log("descript done");
            }) // 依存関係的なやつだと思われ
            .then(function () {
                return _this2.loadSurfacesTxt();
            }) // 1st
            .then(function () {
                return _this2.loadSurfaceTable();
            }) // 1st
            .then(function () {
                return console.log("surfaces done");
            }).then(function () {
                return _this2.loadSurfacePNG();
            }) // 2nd
            .then(function () {
                return console.log("base done");
            }).then(function () {
                return _this2.loadElements();
            }) // 3rd
            .then(function () {
                return console.log("elements done");
            }).then(function () {
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
            var _this3 = this;

            var dir = this.directory;
            var name = SU.fastfind(Object.keys(dir), "descript.txt");
            if (name === "") {
                console.info("descript.txt is not found");
            } else {
                (function () {
                    var descript = _this3.descript = SU.parseDescript(SU.convert(dir[name]));
                    var json = {};
                    Object.keys(descript).forEach(function (key) {
                        var _key = key.replace(/^sakura\./, "char0.").replace(/^kero\./, "char1.");
                        SU.decolateJSONizeDescript(json, _key, descript[key]);
                    });
                    _this3.descriptJSON = json;
                })();
            }
            // key-valueなdescriptをconfigへ変換
            return new SC.ShellConfig().loadFromJSONLike(this.descriptJSON).then(function (config) {
                _this3.config = config;
            }).then(function () {
                return _this3;
            });
        }
        // surfaces.txtを読んでthis.surfacesTxtに反映

    }, {
        key: "loadSurfacesTxt",
        value: function loadSurfacesTxt() {
            var _this4 = this;

            var filenames = SU.findSurfacesTxt(Object.keys(this.directory));
            if (filenames.length === 0) {
                console.info("surfaces.txt is not found");
            }
            var cat_text = filenames.reduce(function (text, filename) {
                return text + SU.convert(_this4.directory[filename]);
            }, "");
            var surfacesTxt = SurfacesTxt2Yaml.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
            return new ST.SurfaceDefinitionTree().loadFromsurfacesTxt2Yaml(surfacesTxt).then(function (surfaceTree) {
                _this4.surfacesTxt = surfacesTxt;
                _this4.surfaceDefTree = surfaceTree;
                _this4.surfaceTree = _this4.surfaceDefTree.surfaces;
                return _this4;
            });
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
                var txt = SU.convert(this.directory[surfacetable_name]);
                console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
            }
            return Promise.resolve(this);
        }
        // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映

    }, {
        key: "loadSurfacePNG",
        value: function loadSurfacePNG() {
            var _this5 = this;

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
                    _this5.getPNGFromDirectory(filename, function (err, cnv) {
                        if (err != null || cnv == null) {
                            console.warn("Shell#loadSurfacePNG > " + err);
                        } else {
                            if (!_this5.surfaceTree[n]) {
                                // surfaces.txtで未定義なら追加
                                _this5.surfaceTree[n] = new ST.SurfaceDefinition();
                                _this5.surfaceTree[n].base = cnv;
                            } else {
                                // surfaces.txtで定義済み
                                _this5.surfaceTree[n].base = cnv;
                            }
                        }
                        if (--i <= 0) {
                            resolve(_this5);
                        }
                    });
                });
            });
        }
        // this.surfacesTxt から element を読み込んで this.surfaceTree に反映

    }, {
        key: "loadElements",
        value: function loadElements() {
            var _this6 = this;

            var srfs = this.surfaceTree;
            return new Promise(function (resolve, reject) {
                var i = 0;
                srfs.forEach(function (srf, n) {
                    var elms = srf.elements;
                    var _prms = elms.map(function (elm, elmId) {
                        var type = elm.type;
                        var file = elm.file;
                        var x = elm.x;
                        var y = elm.y;

                        i++;
                        _this6.getPNGFromDirectory(file, function (err, canvas) {
                            if (err != null || canvas == null) {
                                console.warn("Shell#loadElements > " + err);
                            } else {
                                _this6.surfaceTree[n].elements[elmId].canvas = canvas;
                            }
                            if (--i <= 0) {
                                resolve(_this6);
                            }
                        });
                    });
                });
                // elementを一切使っていなかった
                if (i === 0) {
                    resolve(_this6);
                }
            }).then(function () {
                return _this6;
            });
        }
    }, {
        key: "hasFile",
        value: function hasFile(filename) {
            return SU.fastfind(Object.keys(this.directory), filename) !== "";
        }
        // this.cacheCanvas から filename な SurfaceCanvas を探す。
        // なければ this.directory から探し this.cacheCanvas にキャッシュする
        // 非同期の理由：img.onload = blob url

    }, {
        key: "getPNGFromDirectory",
        value: function getPNGFromDirectory(filename, cb) {
            var _this7 = this;

            var cached_filename = SU.fastfind(Object.keys(this.cacheCanvas), filename);
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
            var _filename = SU.fastfind(Object.keys(this.directory), filename);
            var pnafilename = _filename.replace(/\.png$/i, ".pna");
            var _pnafilename = SU.fastfind(Object.keys(this.directory), pnafilename);
            var pngbuf = this.directory[_filename];
            SU.getImageFromArrayBuffer(pngbuf, function (err, png) {
                if (err != null) return cb(err, null);
                // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
                if (_pnafilename === "") {
                    _this7.cacheCanvas[_filename] = { cnv: null, png: png, pna: null };
                    cb(null, _this7.cacheCanvas[_filename]);
                    return;
                }
                var pnabuf = _this7.directory[_pnafilename];
                SU.getImageFromArrayBuffer(pnabuf, function (err, pna) {
                    if (err != null) return cb(err, null);
                    _this7.cacheCanvas[_filename] = { cnv: null, png: png, pna: pna };
                    cb(null, _this7.cacheCanvas[_filename]);
                });
            });
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(div, scopeId, surfaceId) {
            var _this8 = this;

            var type = SU.scope(scopeId);
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
            var srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceDefTree, this.config);
            // const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.state);
            if (this.config.enableRegion) {
                srf.render();
            }
            srf.on("mouse", function (ev) {
                _this8.emit("mouse", ev); // detachSurfaceで消える
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
            var type = SU.scope(scopeId);
            var _surfaceId = -1;
            if (typeof surfaceId === "string" || typeof surfaceId === "number") {
                if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                    // まずエイリアスを探す
                    _surfaceId = SU.choice(this.surfacesTxt.aliases[type][surfaceId]);
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
            var _this9 = this;

            if (typeof a === "number" && typeof b === "number") {
                // public bind(scopeId: number, bindgroupId: number): void
                var scopeId = a;
                var bindgroupId = b;
                if (this.config.bindgroup[scopeId] == null) {
                    console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                    return;
                }
                this.config.bindgroup[scopeId][bindgroupId] = true;
                this.attachedSurface.forEach(function (_ref4) {
                    var srf = _ref4.surface;
                    var div = _ref4.div;

                    srf.updateBind();
                });
                return;
            } else if (typeof a === "string" && typeof b === "string") {
                var _ret2 = function () {
                    // public bind(scopeId: number, bindgroupId: number): void
                    var _category = a;
                    var _parts = b;
                    _this9.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name = bindgroup.name;
                            var category = _bindgroup$name.category;
                            var parts = _bindgroup$name.parts;

                            if (_category === category && _parts === parts) {
                                _this9.bind(scopeId, bindgroupId);
                            }
                        });
                    });
                    return {
                        v: void 0
                    };
                }();

                if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
            } else {
                console.error("Shell#bind", "TypeError:", a, b);
            }
        }
    }, {
        key: "unbind",
        value: function unbind(a, b) {
            var _this10 = this;

            if (typeof a === "number" && typeof b === "number") {
                // 特定のスコープへのオンオフ
                var scopeId = a;
                var bindgroupId = b;
                if (this.config.bindgroup[scopeId] == null) {
                    console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                    return;
                }
                this.config.bindgroup[scopeId][bindgroupId] = false;
                this.attachedSurface.forEach(function (_ref5) {
                    var srf = _ref5.surface;
                    var div = _ref5.div;

                    srf.updateBind();
                });
            } else if (typeof a === "string" && typeof b === "string") {
                (function () {
                    // public unbind(category: string, parts: string): void
                    // カテゴリ全体のオンオフ
                    var _category = a;
                    var _parts = b;
                    _this10.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name2 = bindgroup.name;
                            var category = _bindgroup$name2.category;
                            var parts = _bindgroup$name2.parts;

                            if (_category === category && _parts === parts) {
                                _this10.unbind(scopeId, bindgroupId);
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
            this.config.enableRegion = true;
            this.render();
        }
        //当たり判定非表示

    }, {
        key: "hideRegion",
        value: function hideRegion() {
            this.config.enableRegion = false;
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