/// <reference path="../typings/index.d.ts"/>
"use strict";
const Surface_1 = require('./Surface');
const ST = require("./SurfaceTree");
const SU = require("./SurfaceUtil");
const SC = require("./ShellConfig");
const SurfacesTxt2Yaml = require("surfaces_txt2yaml");
const EventEmitter = require("events");
class Shell extends EventEmitter.EventEmitter {
    constructor(directory) {
        super();
        this.descript = {};
        this.descriptJSON = {};
        this.config = new SC.ShellConfig();
        this.directory = directory;
        this.attachedSurface = [];
        this.surfacesTxt = {};
        this.surfaceDefTree = new ST.SurfaceDefinitionTree();
        this.surfaceTree = this.surfaceDefTree.surfaces;
        this.cacheCanvas = {};
    }
    load() {
        return Promise.resolve(this)
            .then(() => this.loadDescript()) // 1st // ←なにこれ（自問自
            .then(() => console.log("descript done")) // 依存関係的なやつだと思われ
            .then(() => this.loadSurfacesTxt()) // 1st
            .then(() => this.loadSurfaceTable()) // 1st
            .then(() => console.log("surfaces done"))
            .then(() => this.loadSurfacePNG()) // 2nd
            .then(() => console.log("base done"))
            .then(() => this.loadElements()) // 3rd
            .then(() => console.log("elements done"))
            .then(() => this) // 3rd
            .catch((err) => {
            console.error("Shell#load > ", err);
            return Promise.reject(err);
        });
    }
    // this.directoryからdescript.txtを探してthis.descriptに入れる
    loadDescript() {
        const dir = this.directory;
        const name = SU.fastfind(Object.keys(dir), "descript.txt");
        if (name === "") {
            console.info("descript.txt is not found");
        }
        else {
            let descript = this.descript = SU.parseDescript(SU.convert(dir[name]));
            let json = {};
            Object.keys(descript).forEach((key) => {
                let _key = key
                    .replace(/^sakura\./, "char0.")
                    .replace(/^kero\./, "char1.");
                SU.decolateJSONizeDescript(json, _key, descript[key]);
            });
            this.descriptJSON = json;
        }
        // key-valueなdescriptをconfigへ変換
        return new SC.ShellConfig().loadFromJSONLike(this.descriptJSON).then((config) => {
            this.config = config;
        }).then(() => this);
    }
    // surfaces.txtを読んでthis.surfacesTxtに反映
    loadSurfacesTxt() {
        const filenames = SU.findSurfacesTxt(Object.keys(this.directory));
        if (filenames.length === 0) {
            console.info("surfaces.txt is not found");
        }
        const cat_text = filenames.reduce((text, filename) => text + SU.convert(this.directory[filename]), "");
        const surfacesTxt = SurfacesTxt2Yaml.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
        return new ST.SurfaceDefinitionTree().loadFromsurfacesTxt2Yaml(surfacesTxt)
            .then((surfaceTree) => {
            this.surfacesTxt = surfacesTxt;
            this.surfaceDefTree = surfaceTree;
            this.surfaceTree = this.surfaceDefTree.surfaces;
            return this;
        });
    }
    // surfacetable.txtを読む予定
    loadSurfaceTable() {
        const surfacetable_name = Object.keys(this.directory).filter((name) => /^surfacetable.*\.txt$/i.test(name))[0] || "";
        if (surfacetable_name === "") {
            console.info("Shell#loadSurfaceTable", "surfacetable.txt is not found.");
        }
        else {
            const txt = SU.convert(this.directory[surfacetable_name]);
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
                    if (err != null || cnv == null) {
                        console.warn("Shell#loadSurfacePNG > " + err);
                    }
                    else {
                        if (!this.surfaceTree[n]) {
                            // surfaces.txtで未定義なら追加
                            this.surfaceTree[n] = new ST.SurfaceDefinition();
                            this.surfaceTree[n].base = cnv;
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
        const srfs = this.surfaceTree;
        return new Promise((resolve, reject) => {
            let i = 0;
            srfs.forEach((srf, n) => {
                const elms = srf.elements;
                const _prms = elms.map((elm, elmId) => {
                    const { type, file, x, y } = elm;
                    i++;
                    this.getPNGFromDirectory(file, (err, canvas) => {
                        if (err != null || canvas == null) {
                            console.warn("Shell#loadElements > " + err);
                        }
                        else {
                            this.surfaceTree[n].elements[elmId].canvas = canvas;
                        }
                        if (--i <= 0) {
                            resolve(this);
                        }
                    });
                });
            });
            // elementを一切使っていなかった
            if (i === 0) {
                resolve(this);
            }
        }).then(() => this);
    }
    hasFile(filename) {
        return SU.fastfind(Object.keys(this.directory), filename) !== "";
    }
    // this.cacheCanvas から filename な SurfaceCanvas を探す。
    // なければ this.directory から探し this.cacheCanvas にキャッシュする
    // 非同期の理由：img.onload = blob url
    getPNGFromDirectory(filename, cb) {
        const cached_filename = SU.fastfind(Object.keys(this.cacheCanvas), filename);
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
        const _filename = SU.fastfind(Object.keys(this.directory), filename);
        const pnafilename = _filename.replace(/\.png$/i, ".pna");
        const _pnafilename = SU.fastfind(Object.keys(this.directory), pnafilename);
        const pngbuf = this.directory[_filename];
        SU.getImageFromArrayBuffer(pngbuf, (err, png) => {
            if (err != null)
                return cb(err, null);
            // 起動時にすべての画像を色抜きするのはgetimagedataが重いのでcnvはnullのままで
            if (_pnafilename === "") {
                this.cacheCanvas[_filename] = { cnv: null, png, pna: null };
                cb(null, this.cacheCanvas[_filename]);
                return;
            }
            const pnabuf = this.directory[_pnafilename];
            SU.getImageFromArrayBuffer(pnabuf, (err, pna) => {
                if (err != null)
                    return cb(err, null);
                this.cacheCanvas[_filename] = { cnv: null, png, pna };
                cb(null, this.cacheCanvas[_filename]);
            });
        });
    }
    attachSurface(div, scopeId, surfaceId) {
        const type = SU.scope(scopeId);
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
        const srf = new Surface_1.default(div, scopeId, _surfaceId, this.surfaceDefTree, this.config);
        // const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.state);
        if (this.config.enableRegion) {
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
        Shell.call(this, {}); // 初期化 // ES6 Class ではできない:
    }
    getSurfaceAlias(scopeId, surfaceId) {
        const type = SU.scope(scopeId);
        var _surfaceId = -1;
        if (typeof surfaceId === "string" || typeof surfaceId === "number") {
            if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                // まずエイリアスを探す
                _surfaceId = SU.choice(this.surfacesTxt.aliases[type][surfaceId]);
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
            // public bind(scopeId: number, bindgroupId: number): void
            const scopeId = a;
            const bindgroupId = b;
            if (this.config.bindgroup[scopeId] == null) {
                console.warn("Shell#bind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.config.bindgroup[scopeId][bindgroupId] = true;
            this.attachedSurface.forEach(({ surface: srf, div }) => {
                srf.updateBind();
            });
            return;
        }
        else if (typeof a === "string" && typeof b === "string") {
            // public bind(scopeId: number, bindgroupId: number): void
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
            return;
        }
        else {
            console.error("Shell#bind", "TypeError:", a, b);
        }
    }
    unbind(a, b) {
        if (typeof a === "number" && typeof b === "number") {
            // 特定のスコープへのオンオフ
            const scopeId = a;
            const bindgroupId = b;
            if (this.config.bindgroup[scopeId] == null) {
                console.warn("Shell#unbind > bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
                return;
            }
            this.config.bindgroup[scopeId][bindgroupId] = false;
            this.attachedSurface.forEach(({ surface: srf, div }) => {
                srf.updateBind();
            });
        }
        else if (typeof a === "string" && typeof b === "string") {
            // public unbind(category: string, parts: string): void
            // カテゴリ全体のオンオフ
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
        this.config.enableRegion = true;
        this.render();
    }
    //当たり判定非表示
    hideRegion() {
        this.config.enableRegion = false;
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
