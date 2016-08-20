/// <reference path="../typings/index.d.ts"/>
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SF = require('./Surface');
var ST = require("./SurfaceTree");
var SU = require("./SurfaceUtil");
var SC = require("./ShellConfig");
var CC = require("./CanvasCache");
var SL = require("./ShellLoader");
var events_1 = require("events");

var Shell = function (_events_1$EventEmitte) {
    _inherits(Shell, _events_1$EventEmitte);

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
        _this.cache = new CC.CanvasCache(_this.directory);
        return _this;
    }

    _createClass(Shell, [{
        key: "load",
        value: function load() {
            return SL.load(this.directory, this);
        }
    }, {
        key: "attachSurface",
        value: function attachSurface(div, scopeId, surfaceId) {
            var _this2 = this;

            var surfaceTree = this.surfaceDefTree;
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
            if (!surfaceTree[_surfaceId]) {
                console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", surfaceTree);
                return Promise.reject("not defined");
            }
            var srf = new SF.Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.cache);
            // const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.state);
            if (this.config.enableRegion) {
                srf.render();
            }
            srf.on("mouse", function (ev) {
                _this2.emit("mouse", ev); // detachSurfaceで消える
            });
            this.attachedSurface.push({ div: div, surface: srf });
            return Promise.resolve(srf);
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
            Shell.call(this, {}); // 初期化 // ES6 Class ではできない:
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
            var _this3 = this;

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

                    srf.update();
                });
                return;
            } else if (typeof a === "string" && typeof b === "string") {
                var _ret = function () {
                    // public bind(scopeId: number, bindgroupId: number): void
                    var _category = a;
                    var _parts = b;
                    _this3.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name = bindgroup.name;
                            var category = _bindgroup$name.category;
                            var parts = _bindgroup$name.parts;

                            if (_category === category && _parts === parts) {
                                _this3.bind(scopeId, bindgroupId);
                            }
                        });
                    });
                    return {
                        v: void 0
                    };
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            } else {
                console.error("Shell#bind", "TypeError:", a, b);
            }
        }
    }, {
        key: "unbind",
        value: function unbind(a, b) {
            var _this4 = this;

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

                    srf.update();
                });
            } else if (typeof a === "string" && typeof b === "string") {
                (function () {
                    // public unbind(category: string, parts: string): void
                    // カテゴリ全体のオンオフ
                    var _category = a;
                    var _parts = b;
                    _this4.config.char.forEach(function (char, scopeId) {
                        char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                            var _bindgroup$name2 = bindgroup.name;
                            var category = _bindgroup$name2.category;
                            var parts = _bindgroup$name2.parts;

                            if (_category === category && _parts === parts) {
                                _this4.unbind(scopeId, bindgroupId);
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
}(events_1.EventEmitter);

exports.Shell = Shell;