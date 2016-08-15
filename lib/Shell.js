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
var Shell = (function (_super) {
    __extends(Shell, _super);
    function Shell(directory) {
        _super.call(this);
        this.descript = {};
        this.config = {};
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
            .then(function () { return _this.loadConfig(); })
            .then(function () { return _this.loadBindGroup(); }) // 2nd // 依存関係的なやつだと思われ
            .then(function () { return _this.loadSurfacesTxt(); }) // 1st
            .then(function () { return _this.loadSurfaceTable(); }) // 1st
            .then(function () { return _this.loadSurfacePNG(); }) // 2nd
            .then(function () { return _this.loadCollisions(); }) // 3rd
            .then(function () { return _this.loadAnimations(); }) // 3rd
            .then(function () { return _this.loadElements(); }) // 3rd
            .then(function () { return _this; }) // 3rd
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
    Shell.prototype.loadConfig = function () {
        var _this = this;
        // key-valueなdescriptをconfigへ変換
        var descript = this.descript;
        // オートマージ
        // dic["a.b.c"]="d"なテキストをJSON形式に変換している気がする
        Object.keys(descript).forEach(function (key) {
            var ptr = _this.config;
            var props = key.split(".");
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var _a = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop) || ["", "", ""], 1), _prop = _a[0], num = _a[1];
                var _num = Number(num);
                if (isFinite(_num)) {
                    if (!Array.isArray(ptr[_prop])) {
                        ptr[_prop] = [];
                    }
                    ptr[_prop][_num] = ptr[_prop][_num] || {};
                    if (i !== props.length - 1) {
                        ptr = ptr[_prop][_num];
                    }
                    else {
                        if (ptr[_prop][_num] instanceof Object && Object.keys(ptr[_prop][_num]).length > 0) {
                            // descriptではまれに（というかmenu)だけjson化できない項目がある。形式は以下の通り。
                            // menu, 0 -> menu.value
                            // menu.font...
                            // ヤケクソ気味にmenu=hogeをmenu.value=hogeとして扱っている
                            // このifはその例外への対処である
                            ptr[_prop][_num].value = Number(descript[key]) || descript[key];
                        }
                        else {
                            ptr[_prop][_num] = Number(descript[key]) || descript[key];
                        }
                    }
                }
                else {
                    ptr[_prop] = ptr[_prop] || {};
                    if (i !== props.length - 1) {
                        ptr = ptr[_prop];
                    }
                    else {
                        if (ptr[_prop] instanceof Object && Object.keys(ptr[_prop]).length > 0) {
                            ptr[_prop].value = Number(descript[key]) || descript[key];
                        }
                        else {
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
            this.config.menu.value = (+this.config.menu.value) > 0; // number -> boolean
        }
        else {
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
                    var _a = ("" + bindgroup.name).split(",").map(function (a) { return a.trim(); }), category = _a[0], parts = _a[1], thumbnail = _a[2];
                    bindgroup.name = { category: category, parts: parts, thumbnail: thumbnail };
                }
            });
            // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
            if (!Array.isArray(char.bindoption)) {
                char.bindoption = [];
            }
            char.bindoption.forEach(function (bindoption) {
                if (typeof bindoption.group === "string") {
                    var _a = ("" + bindoption.group).split(",").map(function (a) { return a.trim(); }), category = _a[0], options = _a.slice(1);
                    bindoption.group = { category: category, options: options };
                }
            });
        });
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
            // cat surfaces*.txt
            var text = surfaces_text_names.reduce(function (text, filename) { return text + SurfaceUtil.convert(_this.directory[filename]); }, "");
            this.surfacesTxt = SurfacesTxt2Yaml.txt_to_data(text, { compatible: 'ssp-lazy' });
            console.log(this.surfaceTxt);
            // https://github.com/Ikagaka/Shell.js/issues/55
            if (this.surfacesTxt.surfaces == null) {
                this.surfacesTxt.surfaces = {};
            }
            // SurfacesTxt2Yamlの継承の expand と remove
            Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                if (typeof _this.surfacesTxt.surfaces[name].is === "number"
                    && Array.isArray(_this.surfacesTxt.surfaces[name].base)) {
                    _this.surfacesTxt.surfaces[name].base.forEach(function (key) {
                        $.extend(true, _this.surfacesTxt.surfaces[name], _this.surfacesTxt.surfaces[key]);
                    });
                    delete _this.surfacesTxt.surfaces[name].base;
                }
            });
            Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                if (typeof _this.surfacesTxt.surfaces[name].is === "undefined") {
                    delete _this.surfacesTxt.surfaces[name];
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
    };
    // surfacetable.txtを読む予定
    Shell.prototype.loadSurfaceTable = function () {
        var surfacetable_name = Object.keys(this.directory).filter(function (name) { return /^surfacetable.*\.txt$/i.test(name); })[0] || "";
        if (surfacetable_name === "") {
            console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
        }
        else {
            var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
            console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
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
                return resolve(_this);
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
            Object.keys(animations).forEach(function (animId) {
                if (!_this.surfaceTree[n]) {
                    _this.surfaceTree[n] = {
                        base: { cnv: null, png: null, pna: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                var _a = animations[animId], is = _a.is, _b = _a.interval, interval = _b === void 0 ? "never" : _b, _c = _a.option, option = _c === void 0 ? "" : _c, _d = _a.patterns, patterns = _d === void 0 ? [] : _d, _e = _a.regions, regions = _e === void 0 ? {} : _e;
                // animation*.option,* の展開
                // animation*.option,exclusive+background,(1,3,5)
                var _f = option.split(","), _option = _f[0], opt_args = _f.slice(1);
                var _opt_args = opt_args.map(function (str) { return str.replace("(", "").replace(")", "").trim(); });
                var options = option.split("+");
                var _options = options.map(function (option) { return [option.trim(), _opt_args]; });
                var _g = interval.split(","), _interval = _g[0], int_args = _g.slice(1);
                var _int_args = int_args.map(function (str) { return str.trim(); });
                var intervals = _interval.split("+"); // sometimes+talk
                var _intervals = intervals.map(function (interval) { return [interval.trim(), _int_args]; });
                var _regions = [];
                Object.keys(regions).forEach(function (key) {
                    _regions[regions[key].is] = regions[key];
                });
                _this.surfaceTree[n].animations[is] = {
                    options: _options,
                    intervals: _intervals,
                    regions: _regions,
                    is: is, patterns: patterns, interval: interval
                };
            });
        });
        return Promise.resolve(this);
    };
    Shell.prototype.hasFile = function (filename) {
        return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
    };
    // this.cacheCanvas から filename な SurfaceCanvas を探す。
    // なければ this.directory から探し this.cacheCanvas にキャッシュする
    // 非同期の理由：img.onload = blob url
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
            console.warn("Shell#getPNGFromDirectory", "element file " + filename.substr(0, filename.length - ".png".length) + " need '.png' extension");
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
    Shell.prototype.attachSurface = function (div, scopeId, surfaceId) {
        var _this = this;
        var type = SurfaceUtil.scope(scopeId);
        var hits = this.attachedSurface.filter(function (_a) {
            var _div = _a.div;
            return _div === div;
        });
        if (hits.length !== 0)
            throw new Error("Shell#attachSurface > ReferenceError: this HTMLDivElement is already attached");
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
    Shell.prototype.getSurfaceAlias = function (scopeId, surfaceId) {
        var type = SurfaceUtil.scope(scopeId);
        if (typeof surfaceId === "string" || typeof surfaceId === "number") {
            if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                // まずエイリアスを探す
                var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
            }
            else if (typeof surfaceId === "number") {
                // 通常の処理
                var _surfaceId = surfaceId;
            }
        }
        else {
            // そんなサーフェスはない
            console.warn("Shell#hasSurface > surface alias scope:", scopeId + "as" + type + ", id:" + surfaceId + " is not defined.");
            var _surfaceId = -1;
        }
        return _surfaceId;
    };
    // サーフェスエイリアス込みでサーフェスが存在するか確認
    Shell.prototype.hasSurface = function (scopeId, surfaceId) {
        return this.getSurfaceAlias(scopeId, surfaceId) >= 0;
    };
    Shell.prototype.bind = function (a, b) {
        var _this = this;
        if (typeof a === "number" && typeof b === "number") {
            var scopeId = a;
            var bindgroupId = b;
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = true;
            this.attachedSurface.forEach(function (_a) {
                var srf = _a.surface, div = _a.div;
                srf.updateBind();
            });
        }
        else if (typeof a === "string" && typeof b === "string") {
            var _category = a;
            var _parts = b;
            this.config.char.forEach(function (char, scopeId) {
                char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                    var _a = bindgroup.name, category = _a.category, parts = _a.parts;
                    if (_category === category && _parts === parts) {
                        _this.bind(scopeId, bindgroupId);
                    }
                });
            });
        }
        else {
            console.error("Shell#bind", "TypeError:", a, b);
        }
    };
    Shell.prototype.unbind = function (a, b) {
        var _this = this;
        if (typeof a === "number" && typeof b === "number") {
            var scopeId = a;
            var bindgroupId = b;
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = false;
            this.attachedSurface.forEach(function (_a) {
                var srf = _a.surface, div = _a.div;
                srf.updateBind();
            });
        }
        else if (typeof a === "string" && typeof b === "string") {
            var _category = a;
            var _parts = b;
            this.config.char.forEach(function (char, scopeId) {
                char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                    var _a = bindgroup.name, category = _a.category, parts = _a.parts;
                    if (_category === category && _parts === parts) {
                        _this.unbind(scopeId, bindgroupId);
                    }
                });
            });
        }
        else {
            console.error("Shell#unbind", "TypeError:", a, b);
        }
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
    // 着せ替えメニュー用情報ていきょう
    Shell.prototype.getBindGroups = function (scopeId) {
        return this.config.char[scopeId].bindgroup.map(function (bindgroup, bindgroupId) {
            return bindgroup.name;
        });
    };
    return Shell;
})(EventEmitter);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Shell;
