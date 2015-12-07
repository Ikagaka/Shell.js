/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Surface_1 = require('./Surface');
var SurfaceUtil = require("./SurfaceUtil");
var SurfacesTxt2Yaml = require("surfaces_txt2yaml");
var EventEmitter = require("eventemitter3");
var $ = require("jquery");
self["$"] = $;
self["jQuery"] = $;
var Shell = (function (_super) {
    __extends(Shell, _super);
    function Shell(directory) {
        _super.call(this);
        this.descript = {};
        this.directory = directory;
        this.attachedSurface = [];
        this.surfacesTxt = {};
        this.surfaceTree = [];
        this.cacheCanvas = {};
        this.bindgroup = [];
        this.enableRegion = false;
    }
    Shell.prototype.load = function () {
        var _this = this;
        return Promise.resolve(this)
            .then(function () { return _this.loadDescript(); }) // 1st // ←なにこれ（自問自
            .then(function () { return _this.loadBindGroup(); }) // 2nd // 依存関係的なやつだと思われ
            .then(function () { return _this.loadSurfacesTxt(); }) // 1st
            .then(function () { return _this.loadSurfaceTable(); }) // 1st
            .then(function () { return _this.loadSurfacePNG(); }) // 2nd
            .then(function () { return _this.loadCollisions(); }) // 3rd
            .then(function () { return _this.loadAnimations(); }) // 3rd
            .then(function () { return _this.loadElements(); }) // 3rd
            .catch(function (err) {
            console.error("Shell#load > ", err);
            return Promise.reject(err);
        });
    };
    // this.directoryからdescript.txtを探してthis.descriptに入れる
    Shell.prototype.loadDescript = function () {
        var dir = this.directory;
        var getName = function (dic, reg) {
            return Object.keys(dic).filter(function (name) { return reg.test(name); })[0] || "";
        };
        var descript_name = getName(dir, /^descript\.txt$/i);
        if (descript_name === "") {
            console.info("descript.txt is not found");
            this.descript = {};
        }
        else {
            this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
        }
        return Promise.resolve(this);
    };
    // descript.txtからbindgroup探してデフォルト値を反映
    Shell.prototype.loadBindGroup = function () {
        var _this = this;
        var descript = this.descript;
        var grep = function (dic, reg) {
            return Object.keys(dic).filter(function (key) { return reg.test(key); });
        };
        var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
        grep(descript, reg).forEach(function (key) {
            var _a = reg.exec(key), _ = _a[0], charId = _a[1], bindgroupId = _a[2], dflt = _a[3];
            var _charId = charId === "sakura" ? "0" :
                "kero" ? "1" :
                    (/char(\d+)/.exec(charId) || ["", Number.NaN])[1];
            var maybeNumCharId = Number(_charId);
            var maybeNumBindgroupId = Number(bindgroupId);
            if (isFinite(maybeNumCharId) && isFinite(maybeNumBindgroupId)) {
                _this.bindgroup[maybeNumCharId] = _this.bindgroup[maybeNumCharId] || [];
                if (dflt === "default") {
                    _this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = !!Number(descript[key]);
                }
                else {
                    _this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = _this.bindgroup[maybeNumCharId][maybeNumBindgroupId] || false;
                }
            }
            else {
                console.warn("CharId: " + _charId + " or bindgroupId: " + bindgroupId + " is not number");
            }
        });
        return Promise.resolve(this);
    };
    // surfaces.txtを読んでthis.surfacesTxtに反映
    Shell.prototype.loadSurfacesTxt = function () {
        var _this = this;
        var surfaces_text_names = Object.keys(this.directory).filter(function (name) { return /^surfaces.*\.txt$|^alias\.txt$/i.test(name); });
        if (surfaces_text_names.length === 0) {
            console.info("surfaces.txt is not found");
            this.surfacesTxt = { surfaces: {}, descript: {}, aliases: {}, regions: {} };
        }
        else {
            surfaces_text_names.forEach(function (filename) {
                var text = SurfaceUtil.convert(_this.directory[filename]);
                var srfs = SurfacesTxt2Yaml.txt_to_data(text, { compatible: 'ssp-lazy' });
                SurfaceUtil.extend(_this.surfacesTxt, srfs);
            });
            //{ expand inherit and remove
            Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                if (typeof _this.surfacesTxt.surfaces[name].is === "number"
                    && Array.isArray(_this.surfacesTxt.surfaces[name].base)) {
                    _this.surfacesTxt.surfaces[name].base.forEach(function (key) {
                        SurfaceUtil.extend(_this.surfacesTxt.surfaces[name], _this.surfacesTxt.surfaces[key]);
                    });
                    delete _this.surfacesTxt.surfaces[name].base;
                }
            });
            Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                if (typeof _this.surfacesTxt.surfaces[name].is === "undefined") {
                    delete _this.surfacesTxt.surfaces[name];
                }
            });
        }
        return Promise.resolve(this);
    };
    // surfacetable.txtを読む予定
    Shell.prototype.loadSurfaceTable = function () {
        var surfacetable_name = Object.keys(this.directory).filter(function (name) { return /^surfacetable.*\.txt$/i.test(name); })[0] || "";
        if (surfacetable_name === "") {
            console.info("surfacetable.txt is not found.");
        }
        else {
            var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
        }
        return Promise.resolve(this);
    };
    // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
    Shell.prototype.loadSurfacePNG = function () {
        var _this = this;
        var surface_names = Object.keys(this.directory).filter(function (filename) { return /^surface(\d+)\.png$/i.test(filename); });
        return new Promise(function (resolve, reject) {
            var i = 0;
            surface_names.forEach(function (filename) {
                var n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
                i++;
                _this.getPNGFromDirectory(filename, function (err, cnv) {
                    if (err != null) {
                        console.warn("Shell#loadSurfacePNG > " + err);
                    }
                    else {
                        if (!_this.surfaceTree[n]) {
                            // surfaces.txtで未定義なら追加
                            _this.surfaceTree[n] = {
                                base: cnv,
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        }
                        else {
                            // surfaces.txtで定義済み
                            _this.surfaceTree[n].base = cnv;
                        }
                    }
                    if (--i <= 0) {
                        resolve(_this);
                    }
                });
            });
        });
    };
    // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
    Shell.prototype.loadElements = function () {
        var _this = this;
        var srfs = this.surfacesTxt.surfaces;
        var hits = Object.keys(srfs).filter(function (name) { return !!srfs[name].elements; });
        return new Promise(function (resolve, reject) {
            var i = 0;
            if (hits.length === 0)
                return resolve();
            hits.forEach(function (defname) {
                var n = srfs[defname].is;
                var elms = srfs[defname].elements;
                var _prms = Object.keys(elms).map(function (elmname) {
                    var _a = elms[elmname], is = _a.is, type = _a.type, file = _a.file, x = _a.x, y = _a.y;
                    i++;
                    _this.getPNGFromDirectory(file, function (err, canvas) {
                        if (err != null) {
                            console.warn("Shell#loadElements > " + err);
                        }
                        else {
                            if (!_this.surfaceTree[n]) {
                                _this.surfaceTree[n] = {
                                    base: { cnv: null, png: null, pna: null },
                                    elements: [],
                                    collisions: [],
                                    animations: []
                                };
                            }
                            _this.surfaceTree[n].elements[is] = { type: type, canvas: canvas, x: x, y: y };
                        }
                        if (--i <= 0) {
                            resolve(_this);
                        }
                    });
                });
            });
        });
    };
    // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
    Shell.prototype.loadCollisions = function () {
        var _this = this;
        var srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter(function (name) { return !!srfs[name].regions; }).forEach(function (defname) {
            var n = srfs[defname].is;
            var regions = srfs[defname].regions;
            Object.keys(regions).forEach(function (regname) {
                if (!_this.surfaceTree[n]) {
                    _this.surfaceTree[n] = {
                        base: { cnv: null, png: null, pna: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                var is = regions[regname].is;
                _this.surfaceTree[n].collisions[is] = regions[regname];
            });
        });
        return Promise.resolve(this);
    };
    // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
    Shell.prototype.loadAnimations = function () {
        var _this = this;
        var srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter(function (name) { return !!srfs[name].animations; }).forEach(function (defname) {
            var n = srfs[defname].is;
            var animations = srfs[defname].animations;
            Object.keys(animations).forEach(function (animname) {
                if (!_this.surfaceTree[n]) {
                    _this.surfaceTree[n] = {
                        base: { cnv: null, png: null, pna: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                var _a = animations[animname], is = _a.is, interval = _a.interval;
                _this.surfaceTree[n].animations[is] = animations[animname];
            });
        });
        return Promise.resolve(this);
    };
    Shell.prototype.hasFile = function (filename) {
        return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
    };
    Shell.prototype.getPNGFromDirectory = function (filename, cb) {
        var _this = this;
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
            console.warn("element file " + filename + " need '.png' extension");
        }
        var _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
        var pnafilename = _filename.replace(/\.png$/i, ".pna");
        var _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
        var pngbuf = this.directory[_filename];
        SurfaceUtil.getImageFromArrayBuffer(pngbuf, function (err, png) {
            if (err != null)
                return cb(err, null);
            // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
            if (_pnafilename === "") {
                _this.cacheCanvas[_filename] = { cnv: null, png: png, pna: null };
                cb(null, _this.cacheCanvas[_filename]);
                return;
            }
            var pnabuf = _this.directory[_pnafilename];
            SurfaceUtil.getImageFromArrayBuffer(pnabuf, function (err, pna) {
                if (err != null)
                    return cb(err, null);
                _this.cacheCanvas[_filename] = { cnv: null, png: png, pna: pna };
                cb(null, _this.cacheCanvas[_filename]);
            });
        });
    };
    // this.cacheCanvas から filename な SurfaceCanvas を探す。
    // なければ this.directory から探し this.cacheCanvas にキャッシュする
    // 非同期の理由：img.onload = blob url
    Shell.prototype.fetchPNGFromDirectory = function (filename) {
        var _this = this;
        console.warn("Shell#fetchPNGFromDirectory is deprecated");
        var cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
        if (cached_filename !== "") {
            return Promise.resolve(this.cacheCanvas[cached_filename]);
        }
        if (!this.hasFile(filename)) {
            // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
            filename += ".png";
            if (!this.hasFile(filename)) {
                return Promise.reject(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")));
            }
            console.warn("element file " + filename + " need '.png' extension");
        }
        var _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
        var pnafilename = _filename.replace(/\.png$/i, ".pna");
        var _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
        var pngbuf = this.directory[_filename];
        return SurfaceUtil.fetchImageFromArrayBuffer(pngbuf).then(function (png) {
            // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
            if (_pnafilename === "") {
                _this.cacheCanvas[_filename] = { cnv: null, png: png, pna: null };
                return _this.cacheCanvas[_filename];
            }
            var pnabuf = _this.directory[_pnafilename];
            return SurfaceUtil.fetchImageFromArrayBuffer(pnabuf).then(function (pna) {
                _this.cacheCanvas[_filename] = { cnv: null, png: png, pna: pna };
                return _this.cacheCanvas[_filename];
            });
        });
    };
    Shell.prototype.attachSurface = function (div, scopeId, surfaceId) {
        var _this = this;
        var type = SurfaceUtil.scope(scopeId);
        if (typeof surfaceId === "string") {
            if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
            }
            else
                throw new Error("ReferenceError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
        }
        else if (typeof surfaceId === "number") {
            var _surfaceId = surfaceId;
        }
        else
            throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
        var hits = this.attachedSurface.filter(function (_a) {
            var _div = _a.div;
            return _div === div;
        });
        if (hits.length !== 0)
            throw new Error("ReferenceError: this HTMLDivElement is already attached");
        if (scopeId < 0) {
            throw new Error("TypeError: scopeId needs more than 0, but:" + scopeId);
        }
        if (!this.surfaceTree[surfaceId]) {
            console.warn("surfaceId:", surfaceId, "is not defined", this.surfaceTree);
            return null;
        }
        var srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceTree, this.bindgroup);
        srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
        srf.on("mouse", function (ev) {
            _this.emit("mouse", ev); // detachSurfaceで消える
        });
        this.attachedSurface.push({ div: div, surface: srf });
        return srf;
    };
    Shell.prototype.detachSurface = function (div) {
        var hits = this.attachedSurface.filter(function (_a) {
            var _div = _a.div;
            return _div === div;
        });
        if (hits.length === 0)
            return;
        hits[0].surface.destructor(); // srf.onのリスナはここで消される
        this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
    };
    Shell.prototype.unload = function () {
        this.attachedSurface.forEach(function (_a) {
            var div = _a.div, surface = _a.surface;
            surface.destructor();
        });
        this.removeAllListeners(null);
        Shell.call(this, {}); // 初期化
    };
    // サーフェスエイリアス込みでサーフェスが存在するか確認
    Shell.prototype.hasSurface = function (scopeId, surfaceId) {
        var type = SurfaceUtil.scope(scopeId);
        if (typeof surfaceId === "string") {
            if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
            }
            else {
                throw new Error("RuntimeError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
            }
        }
        else if (typeof surfaceId === "number") {
            var _surfaceId = surfaceId;
        }
        else
            throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
        return this.surfaceTree[_surfaceId] != null;
    };
    // 着せ替えオン
    Shell.prototype.bind = function (scopeId, bindgroupId) {
        if (this.bindgroup[scopeId] == null) {
            console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        this.bindgroup[scopeId][bindgroupId] = true;
        this.attachedSurface.forEach(function (_a) {
            var srf = _a.surface, div = _a.div;
            srf.updateBind();
        });
    };
    // 着せ替えオフ
    Shell.prototype.unbind = function (scopeId, bindgroupId) {
        if (this.bindgroup[scopeId] == null) {
            console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        this.bindgroup[scopeId][bindgroupId] = false;
        this.attachedSurface.forEach(function (_a) {
            var srf = _a.surface, div = _a.div;
            srf.updateBind();
        });
    };
    // 全サーフェス強制再描画
    Shell.prototype.render = function () {
        this.attachedSurface.forEach(function (_a) {
            var srf = _a.surface, div = _a.div;
            srf.render();
        });
    };
    //当たり判定表示
    Shell.prototype.showRegion = function () {
        this.enableRegion = true;
        this.attachedSurface.forEach(function (_a) {
            var srf = _a.surface, div = _a.div;
            srf.enableRegionDraw = true;
        });
        this.render();
    };
    //当たり判定非表示
    Shell.prototype.hideRegion = function () {
        this.enableRegion = false;
        this.attachedSurface.forEach(function (_a) {
            var srf = _a.surface, div = _a.div;
            srf.enableRegionDraw = false;
        });
        this.render();
    };
    return Shell;
})(EventEmitter);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Shell;
