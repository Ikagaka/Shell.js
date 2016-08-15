/// <reference path="../typings/index.d.ts"/>
/// <reference path="surfaces_txt2yaml.d.ts" />
"use strict";
const Surface_1 = require('./Surface');
const SurfaceUtil = require("./SurfaceUtil");
const SurfacesTxt2Yaml = require("surfaces_txt2yaml");
const EventEmitter = require("events");
const $ = require("jquery");
class Shell extends EventEmitter.EventEmitter {
    constructor(directory) {
        super();
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
    load() {
        return Promise.resolve(this)
            .then(() => this.loadDescript()) // 1st // ←なにこれ（自問自
            .then(() => this.loadConfig())
            .then(() => this.loadBindGroup()) // 2nd // 依存関係的なやつだと思われ
            .then(() => this.loadSurfacesTxt()) // 1st
            .then(() => this.loadSurfaceTable()) // 1st
            .then(() => this.loadSurfacePNG()) // 2nd
            .then(() => this.loadCollisions()) // 3rd
            .then(() => this.loadAnimations()) // 3rd
            .then(() => this.loadElements()) // 3rd
            .then(() => this) // 3rd
            .catch((err) => {
            console.error("Shell#load > ", err);
            return Promise.reject(err);
        });
    }
    // this.directoryからdescript.txtを探してthis.descriptに入れる
    loadDescript() {
        const dir = this.directory;
        const getName = (dic, reg) => {
            return Object.keys(dic).filter((name) => reg.test(name))[0] || "";
        };
        const descript_name = getName(dir, /^descript\.txt$/i);
        if (descript_name === "") {
            console.info("descript.txt is not found");
            this.descript = {};
        }
        else {
            this.descript = SurfaceUtil.parseDescript(SurfaceUtil.convert(dir[descript_name]));
        }
        return Promise.resolve(this);
    }
    loadConfig() {
        // configへ流し込む
        const descript = this.descript;
        // オートマージ
        Object.keys(descript).forEach((key) => {
            let ptr = this.config;
            const props = key.split(".");
            for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                const [_prop, num] = Array.prototype.slice.call(/^([^\d]+)(\d+)?$/.exec(prop) || ["", "", ""], 1);
                const _num = Number(num);
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
                            // menu, 0 -> menu.value
                            // menu.font...
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
        this.config.char.forEach((char) => {
            // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
            if (!Array.isArray(char.bindgroup)) {
                char.bindgroup = [];
            }
            char.bindgroup.forEach((bindgroup) => {
                if (typeof bindgroup.name === "string") {
                    const [category, parts, thumbnail] = ("" + bindgroup.name).split(",").map((a) => a.trim());
                    bindgroup.name = { category, parts, thumbnail };
                }
            });
            // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
            if (!Array.isArray(char.bindoption)) {
                char.bindoption = [];
            }
            char.bindoption.forEach((bindoption) => {
                if (typeof bindoption.group === "string") {
                    const [category, ...options] = ("" + bindoption.group).split(",").map((a) => a.trim());
                    bindoption.group = { category, options };
                }
            });
        });
        return Promise.resolve(this);
    }
    // descript.txtからbindgroup探してデフォルト値を反映
    loadBindGroup() {
        const descript = this.descript;
        const grep = (dic, reg) => Object.keys(dic).filter((key) => reg.test(key));
        const reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
        grep(descript, reg).forEach((key) => {
            const [_, charId, bindgroupId, dflt] = reg.exec(key);
            const _charId = charId === "sakura" ? "0" :
                "kero" ? "1" :
                    (/char(\d+)/.exec(charId) || ["", Number.NaN])[1];
            const maybeNumCharId = Number(_charId);
            const maybeNumBindgroupId = Number(bindgroupId);
            if (isFinite(maybeNumCharId) && isFinite(maybeNumBindgroupId)) {
                this.bindgroup[maybeNumCharId] = this.bindgroup[maybeNumCharId] || [];
                if (dflt === "default") {
                    this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = !!Number(descript[key]);
                }
                else {
                    this.bindgroup[maybeNumCharId][maybeNumBindgroupId] = this.bindgroup[maybeNumCharId][maybeNumBindgroupId] || false;
                }
            }
            else {
                console.warn("CharId: " + _charId + " or bindgroupId: " + bindgroupId + " is not number");
            }
        });
        return Promise.resolve(this);
    }
    // surfaces.txtを読んでthis.surfacesTxtに反映
    loadSurfacesTxt() {
        const surfaces_text_names = Object.keys(this.directory).filter((name) => /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
        if (surfaces_text_names.length === 0) {
            console.info("surfaces.txt is not found");
            this.surfacesTxt = { surfaces: {}, descript: {}, aliases: {}, regions: {} };
        }
        else {
            // cat surfaces*.txt
            const text = surfaces_text_names.reduce((text, filename) => text + SurfaceUtil.convert(this.directory[filename]), "");
            this.surfacesTxt = SurfacesTxt2Yaml.txt_to_data(text, { compatible: 'ssp-lazy' });
            // SurfacesTxt2Yamlの継承の expand と remove
            Object.keys(this.surfacesTxt.surfaces).forEach((name) => {
                if (typeof this.surfacesTxt.surfaces[name].is === "number"
                    && Array.isArray(this.surfacesTxt.surfaces[name].base)) {
                    this.surfacesTxt.surfaces[name].base.forEach((key) => {
                        $.extend(true, this.surfacesTxt.surfaces[name], this.surfacesTxt.surfaces[key]);
                    });
                    delete this.surfacesTxt.surfaces[name].base;
                }
            });
            Object.keys(this.surfacesTxt.surfaces).forEach((name) => {
                if (typeof this.surfacesTxt.surfaces[name].is === "undefined") {
                    delete this.surfacesTxt.surfaces[name];
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
    loadSurfaceTable() {
        const surfacetable_name = Object.keys(this.directory).filter((name) => /^surfacetable.*\.txt$/i.test(name))[0] || "";
        if (surfacetable_name === "") {
            console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
        }
        else {
            const txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
            console.info("Shell#loadSurfaceTable", "surfacetable.txt is not supported yet.");
        }
        return Promise.resolve(this);
    }
    // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
    loadSurfacePNG() {
        const surface_names = Object.keys(this.directory).filter((filename) => /^surface(\d+)\.png$/i.test(filename));
        return new Promise((resolve, reject) => {
            let i = 0;
            surface_names.forEach((filename) => {
                const n = Number((/^surface(\d+)\.png$/i.exec(filename) || ["", "NaN"])[1]);
                if (!isFinite(n))
                    return;
                i++;
                this.getPNGFromDirectory(filename, (err, cnv) => {
                    if (err != null) {
                        console.warn("Shell#loadSurfacePNG > " + err);
                    }
                    else {
                        if (!this.surfaceTree[n]) {
                            // surfaces.txtで未定義なら追加
                            this.surfaceTree[n] = {
                                base: cnv,
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        }
                        else {
                            // surfaces.txtで定義済み
                            this.surfaceTree[n].base = cnv;
                        }
                    }
                    if (--i <= 0) {
                        resolve(this);
                    }
                });
            });
        });
    }
    // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
    loadElements() {
        const srfs = this.surfacesTxt.surfaces;
        const hits = Object.keys(srfs).filter((name) => !!srfs[name].elements);
        return new Promise((resolve, reject) => {
            let i = 0;
            if (hits.length === 0)
                return resolve(this);
            hits.forEach((defname) => {
                const n = srfs[defname].is;
                const elms = srfs[defname].elements;
                const _prms = Object.keys(elms).map((elmname) => {
                    const { is, type, file, x, y } = elms[elmname];
                    i++;
                    this.getPNGFromDirectory(file, (err, canvas) => {
                        if (err != null || canvas == null) {
                            console.warn("Shell#loadElements > " + err);
                        }
                        else {
                            if (!this.surfaceTree[n]) {
                                this.surfaceTree[n] = {
                                    base: { cnv: null, png: null, pna: null },
                                    elements: [],
                                    collisions: [],
                                    animations: []
                                };
                            }
                            this.surfaceTree[n].elements[is] = { type, canvas, x, y };
                        }
                        if (--i <= 0) {
                            resolve(this);
                        }
                    });
                });
            });
        });
    }
    // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
    loadCollisions() {
        const srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter((name) => !!srfs[name].regions).forEach((defname) => {
            const n = srfs[defname].is;
            const regions = srfs[defname].regions;
            Object.keys(regions).forEach((regname) => {
                if (!this.surfaceTree[n]) {
                    this.surfaceTree[n] = {
                        base: { cnv: null, png: null, pna: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                const { is } = regions[regname];
                this.surfaceTree[n].collisions[is] = regions[regname];
            });
        });
        return Promise.resolve(this);
    }
    // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
    loadAnimations() {
        const srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter((name) => !!srfs[name].animations).forEach((defname) => {
            const n = srfs[defname].is;
            const animations = srfs[defname].animations;
            Object.keys(animations).forEach((animId) => {
                if (!this.surfaceTree[n]) {
                    this.surfaceTree[n] = {
                        base: { cnv: null, png: null, pna: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                const { is, interval = "never", option = "", patterns = [], regions = {} } = animations[animId];
                // animation*.option,* の展開
                // animation*.option,exclusive+background,(1,3,5)
                const [_option, ...opt_args] = option.split(",");
                const _opt_args = opt_args.map((str) => str.replace("(", "").replace(")", "").trim());
                const options = option.split("+");
                const _options = options.map((option) => [option.trim(), _opt_args]);
                const [_interval, ...int_args] = interval.split(",");
                const _int_args = int_args.map((str) => str.trim());
                const intervals = _interval.split("+"); // sometimes+talk
                const _intervals = intervals.map((interval) => [interval.trim(), _int_args]);
                const _regions = [];
                Object.keys(regions).forEach((key) => {
                    _regions[regions[key].is] = regions[key];
                });
                this.surfaceTree[n].animations[is] = {
                    options: _options,
                    intervals: _intervals,
                    regions: _regions,
                    is, patterns, interval
                };
            });
        });
        return Promise.resolve(this);
    }
    hasFile(filename) {
        return SurfaceUtil.fastfind(Object.keys(this.directory), filename) !== "";
    }
    // this.cacheCanvas から filename な SurfaceCanvas を探す。
    // なければ this.directory から探し this.cacheCanvas にキャッシュする
    // 非同期の理由：img.onload = blob url
    getPNGFromDirectory(filename, cb) {
        const cached_filename = SurfaceUtil.fastfind(Object.keys(this.cacheCanvas), filename);
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
        const _filename = SurfaceUtil.fastfind(Object.keys(this.directory), filename);
        const pnafilename = _filename.replace(/\.png$/i, ".pna");
        const _pnafilename = SurfaceUtil.fastfind(Object.keys(this.directory), pnafilename);
        const pngbuf = this.directory[_filename];
        SurfaceUtil.getImageFromArrayBuffer(pngbuf, (err, png) => {
            if (err != null)
                return cb(err, null);
            // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
            if (_pnafilename === "") {
                this.cacheCanvas[_filename] = { cnv: null, png, pna: null };
                cb(null, this.cacheCanvas[_filename]);
                return;
            }
            const pnabuf = this.directory[_pnafilename];
            SurfaceUtil.getImageFromArrayBuffer(pnabuf, (err, pna) => {
                if (err != null)
                    return cb(err, null);
                this.cacheCanvas[_filename] = { cnv: null, png, pna };
                cb(null, this.cacheCanvas[_filename]);
            });
        });
    }
    attachSurface(div, scopeId, surfaceId) {
        const type = SurfaceUtil.scope(scopeId);
        const hits = this.attachedSurface.filter(({ div: _div }) => _div === div);
        if (hits.length !== 0)
            throw new Error("Shell#attachSurface > ReferenceError: this HTMLDivElement is already attached");
        if (scopeId < 0) {
            throw new Error("Shell#attachSurface > TypeError: scopeId needs more than 0, but:" + scopeId);
        }
        const _surfaceId = this.getSurfaceAlias(scopeId, surfaceId);
        if (_surfaceId !== surfaceId) {
            console.info("Shell#attachSurface", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
        }
        if (!this.surfaceTree[_surfaceId]) {
            console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", this.surfaceTree);
            return null;
        }
        const srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceTree, this.bindgroup);
        srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
        if (this.enableRegion) {
            srf.render();
        }
        srf.on("mouse", (ev) => {
            this.emit("mouse", ev); // detachSurfaceで消える
        });
        this.attachedSurface.push({ div, surface: srf });
        return srf;
    }
    detachSurface(div) {
        const hits = this.attachedSurface.filter(({ div: _div }) => _div === div);
        if (hits.length === 0)
            return;
        hits[0].surface.destructor(); // srf.onのリスナはここで消される
        this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
    }
    unload() {
        this.attachedSurface.forEach(function ({ div, surface }) {
            surface.destructor();
        });
        this.removeAllListeners();
        Shell.call(this, {}); // 初期化
    }
    getSurfaceAlias(scopeId, surfaceId) {
        const type = SurfaceUtil.scope(scopeId);
        var _surfaceId = -1;
        if (typeof surfaceId === "string" || typeof surfaceId === "number") {
            if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                // まずエイリアスを探す
                _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
            }
            else if (typeof surfaceId === "number") {
                // 通常の処理
                _surfaceId = surfaceId;
            }
        }
        else {
            // そんなサーフェスはない
            console.warn("Shell#hasSurface > surface alias scope:", scopeId + "as" + type + ", id:" + surfaceId + " is not defined.");
            _surfaceId = -1;
        }
        return _surfaceId;
    }
    // サーフェスエイリアス込みでサーフェスが存在するか確認
    hasSurface(scopeId, surfaceId) {
        return this.getSurfaceAlias(scopeId, surfaceId) >= 0;
    }
    bind(a, b) {
        if (typeof a === "number" && typeof b === "number") {
            const scopeId = a;
            const bindgroupId = b;
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = true;
            this.attachedSurface.forEach(({ surface: srf, div }) => {
                srf.updateBind();
            });
        }
        else if (typeof a === "string" && typeof b === "string") {
            const _category = a;
            const _parts = b;
            this.config.char.forEach((char, scopeId) => {
                char.bindgroup.forEach((bindgroup, bindgroupId) => {
                    const { category, parts } = bindgroup.name;
                    if (_category === category && _parts === parts) {
                        this.bind(scopeId, bindgroupId);
                    }
                });
            });
        }
        else {
            console.error("Shell#bind", "TypeError:", a, b);
        }
    }
    unbind(a, b) {
        if (typeof a === "number" && typeof b === "number") {
            const scopeId = a;
            const bindgroupId = b;
            if (this.bindgroup[scopeId] == null) {
                console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.bindgroup[scopeId][bindgroupId] = false;
            this.attachedSurface.forEach(({ surface: srf, div }) => {
                srf.updateBind();
            });
        }
        else if (typeof a === "string" && typeof b === "string") {
            const _category = a;
            const _parts = b;
            this.config.char.forEach((char, scopeId) => {
                char.bindgroup.forEach((bindgroup, bindgroupId) => {
                    const { category, parts } = bindgroup.name;
                    if (_category === category && _parts === parts) {
                        this.unbind(scopeId, bindgroupId);
                    }
                });
            });
        }
        else {
            console.error("Shell#unbind", "TypeError:", a, b);
        }
    }
    // 全サーフェス強制再描画
    render() {
        this.attachedSurface.forEach(({ surface: srf, div }) => {
            srf.render();
        });
    }
    //当たり判定表示
    showRegion() {
        this.enableRegion = true;
        this.attachedSurface.forEach(({ surface: srf, div }) => {
            srf.enableRegionDraw = true;
        });
        this.render();
    }
    //当たり判定非表示
    hideRegion() {
        this.enableRegion = false;
        this.attachedSurface.forEach(({ surface: srf, div }) => {
            srf.enableRegionDraw = false;
        });
        this.render();
    }
    // 着せ替えメニュー用情報ていきょう
    getBindGroups(scopeId) {
        return this.config.char[scopeId].bindgroup.map((bindgroup, bindgroupId) => {
            return bindgroup.name;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Shell;
