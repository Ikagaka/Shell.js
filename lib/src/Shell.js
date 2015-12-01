/// <reference path="../typings/tsd.d.ts"/>
var Surface_1 = require('./Surface');
var SurfaceRender_1 = require("./SurfaceRender");
var SurfaceUtil = require("./SurfaceUtil");
var eventemitter3_1 = require("eventemitter3");
var surfaces_txt2yaml_1 = require("surfaces_txt2yaml");
class Shell extends eventemitter3_1.default {
    constructor(directory) {
        super();
        this.descript = {};
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
            .then(() => this.loadBindGroup()) // 2nd // 依存関係的なやつだと思われ
            .then(() => this.loadSurfacesTxt()) // 1st
            .then(() => this.loadSurfaceTable()) // 1st
            .then(() => this.loadSurfacePNG()) // 2nd
            .then(() => this.loadCollisions()) // 3rd
            .then(() => this.loadAnimations()) // 3rd
            .then(() => this.loadElements()) // 3rd
            .catch((err) => {
            console.error("Shell#load > ", err);
            return Promise.reject(err);
        });
    }
    // this.directoryからdescript.txtを探してthis.descriptに入れる
    loadDescript() {
        var dir = this.directory;
        var getName = (dic, reg) => {
            return Object.keys(dic).filter((name) => reg.test(name))[0] || "";
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
    }
    // descript.txtからbindgroup探してデフォルト値を反映
    loadBindGroup() {
        var descript = this.descript;
        var grep = (dic, reg) => Object.keys(dic).filter((key) => reg.test(key));
        var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)(?:\.(default))?/;
        grep(descript, reg).forEach((key) => {
            var [_, charId, bindgroupId, dflt] = reg.exec(key);
            var _charId = charId === "sakura" ? "0" :
                "kero" ? "1" :
                    (/char(\d+)/.exec(charId) || ["", Number.NaN])[1];
            var maybeNumCharId = Number(_charId);
            var maybeNumBindgroupId = Number(bindgroupId);
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
        var surfaces_text_names = Object.keys(this.directory).filter((name) => /^surfaces.*\.txt$|^alias\.txt$/i.test(name));
        if (surfaces_text_names.length === 0) {
            console.info("surfaces.txt is not found");
            this.surfacesTxt = { surfaces: {}, descript: {}, aliases: {}, regions: {} };
        }
        else {
            surfaces_text_names.forEach((filename) => {
                var text = SurfaceUtil.convert(this.directory[filename]);
                var srfs = surfaces_txt2yaml_1.default.txt_to_data(text, { compatible: 'ssp-lazy' });
                SurfaceUtil.extend(this.surfacesTxt, srfs);
            });
            //{ expand inherit and remove
            Object.keys(this.surfacesTxt.surfaces).forEach((name) => {
                if (typeof this.surfacesTxt.surfaces[name].is === "number"
                    && Array.isArray(this.surfacesTxt.surfaces[name].base)) {
                    this.surfacesTxt.surfaces[name].base.forEach((key) => {
                        SurfaceUtil.extend(this.surfacesTxt.surfaces[name], this.surfacesTxt.surfaces[key]);
                    });
                    delete this.surfacesTxt.surfaces[name].base;
                }
            });
            Object.keys(this.surfacesTxt.surfaces).forEach((name) => {
                if (typeof this.surfacesTxt.surfaces[name].is === "undefined") {
                    delete this.surfacesTxt.surfaces[name];
                }
            });
        }
        return Promise.resolve(this);
    }
    // surfacetable.txtを読む予定
    loadSurfaceTable() {
        var surfacetable_name = Object.keys(this.directory).filter((name) => /^surfacetable.*\.txt$/i.test(name))[0] || "";
        if (surfacetable_name === "") {
            console.info("surfacetable.txt is not found.");
        }
        else {
            var txt = SurfaceUtil.convert(this.directory[surfacetable_name]);
        }
        return Promise.resolve(this);
    }
    // this.directory から surface*.png と surface*.pna を読み込んで this.surfaceTree に反映
    loadSurfacePNG() {
        var surface_names = Object.keys(this.directory).filter((filename) => /^surface(\d+)\.png$/i.test(filename));
        var prms = surface_names.map((filename) => {
            var n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
            return this.getPNGFromDirectory(filename).then((cnv) => {
                if (!this.surfaceTree[n]) {
                    this.surfaceTree[n] = {
                        base: cnv,
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                else {
                    this.surfaceTree[n].base = cnv;
                }
            }).catch((err) => {
                console.warn("Shell#loadSurfacePNG > " + err);
                return Promise.resolve();
            });
        });
        return Promise.all(prms).then(() => Promise.resolve(this));
    }
    // this.surfacesTxt から element を読み込んで this.surfaceTree に反映
    loadElements() {
        var srfs = this.surfacesTxt.surfaces;
        var hits = Object.keys(srfs).filter((name) => !!srfs[name].elements);
        var prms = hits.map((defname) => {
            var n = srfs[defname].is;
            var elms = srfs[defname].elements;
            var _prms = Object.keys(elms).map((elmname) => {
                var { is, type, file, x, y } = elms[elmname];
                return this.getPNGFromDirectory(file).then((canvas) => {
                    if (!this.surfaceTree[n]) {
                        this.surfaceTree[n] = {
                            base: { cnv: SurfaceUtil.createCanvas(), img: null },
                            elements: [],
                            collisions: [],
                            animations: []
                        };
                    }
                    this.surfaceTree[n].elements[is] = { type: type, canvas: canvas, x: x, y: y };
                    return Promise.resolve(this);
                }).catch((err) => {
                    console.warn("Shell#loadElements > " + err);
                    return Promise.resolve(this);
                });
            });
            return Promise.all(_prms).then(() => {
                return Promise.resolve(this);
            });
        });
        return Promise.all(prms).then(() => {
            return Promise.resolve(this);
        });
    }
    // this.surfacesTxt から collision を読み込んで this.surfaceTree に反映
    loadCollisions() {
        var srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter((name) => !!srfs[name].regions).forEach((defname) => {
            var n = srfs[defname].is;
            var regions = srfs[defname].regions;
            Object.keys(regions).forEach((regname) => {
                if (!this.surfaceTree[n]) {
                    this.surfaceTree[n] = {
                        base: { cnv: SurfaceUtil.createCanvas(), img: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                var { is } = regions[regname];
                this.surfaceTree[n].collisions[is] = regions[regname];
            });
        });
        return Promise.resolve(this);
    }
    // this.surfacesTxt から animation を読み込んで this.surfaceTree に反映
    loadAnimations() {
        var srfs = this.surfacesTxt.surfaces;
        Object.keys(srfs).filter((name) => !!srfs[name].animations).forEach((defname) => {
            var n = srfs[defname].is;
            var animations = srfs[defname].animations;
            Object.keys(animations).forEach((animname) => {
                if (!this.surfaceTree[n]) {
                    this.surfaceTree[n] = {
                        base: { cnv: SurfaceUtil.createCanvas(), img: null },
                        elements: [],
                        collisions: [],
                        animations: []
                    };
                }
                var { is, interval } = animations[animname];
                this.surfaceTree[n].animations[is] = animations[animname];
            });
        });
        return Promise.resolve(this);
    }
    hasFile(filename) {
        return SurfaceUtil.find(Object.keys(this.directory), filename).length > 0;
    }
    // this.directoryからfilenameなサーフェスを探す。
    // あったらついでにpnaも探して合成する
    getPNGFromDirectory(filename) {
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
        return SurfaceUtil.createSurfaceCanvasFromArrayBuffer(pngbuf).then((pngsrfcnv) => {
            if (_pnafilename === "") {
                this.cacheCanvas[_filename] = pngsrfcnv;
                return this.cacheCanvas[_filename];
            }
            var pnabuf = this.directory[_pnafilename];
            return SurfaceUtil.createSurfaceCanvasFromArrayBuffer(pnabuf).then((pnasrfcnv) => {
                var render = new SurfaceRender_1.default();
                render.pna(pngsrfcnv, pnasrfcnv);
                this.cacheCanvas[_filename] = render.getSurfaceCanvas();
                return this.cacheCanvas[_filename];
            });
        });
    }
    attachSurface(canvas, scopeId, surfaceId) {
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
        var hits = this.attachedSurface.filter(({ canvas: _canvas }) => _canvas === canvas);
        if (hits.length !== 0)
            throw new Error("ReferenceError: this HTMLCanvasElement is already attached");
        if (scopeId < 0) {
            throw new Error("TypeError: scopeId needs more than 0, but:" + scopeId);
        }
        if (!this.surfaceTree[surfaceId]) {
            console.warn("surfaceId:", surfaceId, "is not defined");
            return null;
        }
        var srf = new Surface_1.default(canvas, scopeId, _surfaceId, this.surfaceTree);
        srf.enableRegionDraw = this.enableRegion; // 当たり判定表示設定の反映
        srf.updateBind(this.bindgroup); // 現在の着せ替え設定の反映
        srf.on("mouse", (ev) => {
            this.emit("mouse", ev); // detachSurfaceで消える
        });
        this.attachedSurface.push({ canvas: canvas, surface: srf });
        return srf;
    }
    detachSurface(canvas) {
        var hits = this.attachedSurface.filter(({ canvas: _canvas }) => _canvas === canvas);
        if (hits.length === 0)
            return;
        hits[0].surface.destructor(); // srf.onのリスナはここで消される
        this.attachedSurface.splice(this.attachedSurface.indexOf(hits[0]), 1);
    }
    unload() {
        this.attachedSurface.forEach(function ({ canvas, surface }) {
            surface.destructor();
        });
        this.removeAllListeners(null);
        Shell.call(this, {}); // 初期化
    }
    // サーフェスエイリアス込みでサーフェスが存在するか確認
    hasSurface(scopeId, surfaceId) {
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
    }
    // 着せ替えオン
    bind(scopeId, bindgroupId) {
        if (this.bindgroup[scopeId] == null) {
            console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        this.bindgroup[scopeId][bindgroupId] = true;
        this.attachedSurface.forEach(({ surface: srf, canvas }) => {
            srf.updateBind(this.bindgroup);
        });
    }
    // 着せ替えオフ
    unbind(scopeId, bindgroupId) {
        if (this.bindgroup[scopeId] == null) {
            console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        this.bindgroup[scopeId][bindgroupId] = false;
        this.attachedSurface.forEach(({ surface: srf, canvas }) => {
            srf.updateBind(this.bindgroup);
        });
    }
    // 全サーフェス強制再描画
    render() {
        this.attachedSurface.forEach(({ surface: srf, canvas }) => {
            srf.render();
        });
    }
    //当たり判定表示
    showRegion() {
        this.enableRegion = true;
        this.attachedSurface.forEach(({ surface: srf, canvas }) => {
            srf.enableRegionDraw = true;
        });
        this.render();
    }
    //当たり判定非表示
    hideRegion() {
        this.enableRegion = false;
        this.attachedSurface.forEach(({ surface: srf, canvas }) => {
            srf.enableRegionDraw = false;
        });
        this.render();
    }
}
exports.Shell = Shell;
