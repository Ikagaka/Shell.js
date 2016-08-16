/// <reference path="../typings/index.d.ts"/>
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Surface_1 = require('./Surface');
var ST = require("./SurfaceTree");
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
        _this.surfaceDefTree = new ST.SurfaceDefinitionTree();
        _this.surfaceTree = _this.surfaceDefTree.surfaces;
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
                return console.log("descript done");
            }).then(function () {
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

            // key-valueなdescriptをconfigへ変換
            var descript = this.descript;
            // オートマージ
            // dic["a.b.c"]="d"なテキストをJSON形式に変換している気がする
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
                                // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
                                // menu, 0 -> menu.value
                                // menu.font...
                                // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
                                // このifはその例外への対処である
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
            if (typeof this.config.menu !== "undefiend") {
                // config型のデフォルト値を作り出すコンストラクタが存在しない（ゴミかよ）なので
                // いちいちプロパティの存在チェックをしないといけないゴミさ加減
                // このコード書いたやつ三週間便所掃除させたい
                this.config.menu = {
                    value: false
                };
            }
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

            var filenames = SurfaceUtil.findSurfacesTxt(Object.keys(this.directory));
            if (filenames.length === 0) {
                console.info("surfaces.txt is not found");
            }
            var cat_text = filenames.reduce(function (text, filename) {
                return text + SurfaceUtil.convert(_this5.directory[filename]);
            }, "");
            var surfacesTxt = SurfacesTxt2Yaml.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
            return new ST.SurfaceDefinitionTree().loadFromsurfacesTxt2Yaml(surfacesTxt).then(function (surfaceTree) {
                _this5.surfacesTxt = surfacesTxt;
                _this5.surfaceDefTree = surfaceTree;
                _this5.surfaceTree = _this5.surfaceDefTree.surfaces;
                return _this5;
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
                        if (err != null || cnv == null) {
                            console.warn("Shell#loadSurfacePNG > " + err);
                        } else {
                            if (!_this6.surfaceTree[n]) {
                                // surfaces.txtで未定義なら追加
                                _this6.surfaceTree[n] = new ST.SurfaceDefinition();
                                _this6.surfaceTree[n].base = cnv;
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
                        _this7.getPNGFromDirectory(file, function (err, canvas) {
                            if (err != null || canvas == null) {
                                console.warn("Shell#loadElements > " + err);
                            } else {
                                _this7.surfaceTree[n].elements[elmId].canvas = canvas;
                            }
                            if (--i <= 0) {
                                resolve(_this7);
                            }
                        });
                    });
                });
                // elementを一切使っていなかった
                if (i === 0) {
                    resolve(_this7);
                }
            }).then(function () {
                return _this7;
            });
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
            var _this8 = this;

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
                    _this8.cacheCanvas[_filename] = { cnv: null, png: png, pna: null };
                    cb(null, _this8.cacheCanvas[_filename]);
                    return;
                }
                var pnabuf = _this8.directory[_pnafilename];
                SurfaceUtil.getImageFromArrayBuffer(pnabuf, function (err, pna) {
                    if (err != null) return cb(err, null);
                    _this8.cacheCanvas[_filename] = { cnv: null, png: png, pna: pna };
                    cb(null, _this8.cacheCanvas[_filename]);
                });
            });
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(div, scopeId, surfaceId) {
            var _this9 = this;

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
            var srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceDefTree, this.bindgroup);
            srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
            if (this.enableRegion) {
                srf.render();
            }
            srf.on("mouse", function (ev) {
                _this9.emit("mouse", ev); // detachSurfaceで消える
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
            var _this10 = this;

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
                    _this10.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name = bindgroup.name;
                            var category = _bindgroup$name.category;
                            var parts = _bindgroup$name.parts;

                            if (_category === category && _parts === parts) {
                                _this10.bind(scopeId, bindgroupId);
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
            var _this11 = this;

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
                    _this11.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name2 = bindgroup.name;
                            var category = _bindgroup$name2.category;
                            var parts = _bindgroup$name2.parts;

                            if (_category === category && _parts === parts) {
                                _this11.unbind(scopeId, bindgroupId);
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