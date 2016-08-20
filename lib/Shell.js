/// <reference path="../typings/index.d.ts"/>
"use strict";
const SF = require('./Surface');
const ST = require("./SurfaceTree");
const SU = require("./SurfaceUtil");
const SC = require("./ShellConfig");
const CC = require("./CanvasCache");
const SL = require("./ShellLoader");
const events_1 = require("events");
class Shell extends events_1.EventEmitter {
    constructor(directory) {
        super();
        this.descript = {};
        this.descriptJSON = {};
        this.config = new SC.ShellConfig();
        this.directory = directory;
        this.attachedSurface = [];
        this.surfacesTxt = {};
        this.surfaceDefTree = new ST.SurfaceDefinitionTree();
        this.cache = new CC.CanvasCache(this.directory);
    }
    load() {
        return SL.load(this.directory, this);
    }
    attachSurface(div, scopeId, surfaceId) {
        const surfaceTree = this.surfaceDefTree;
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
        if (!surfaceTree[_surfaceId]) {
            console.warn("surfaceId:", _surfaceId, "is not defined in surfaceTree", surfaceTree);
            return Promise.reject("not defined");
        }
        const srf = new SF.Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.cache);
        // const srf = new Surface(div, scopeId, _surfaceId, this.surfaceDefTree, this.config, this.state);
        if (this.config.enableRegion) {
            srf.render();
        }
        srf.on("mouse", (ev) => {
            this.emit("mouse", ev); // detachSurfaceで消える
        });
        this.attachedSurface.push({ div, surface: srf });
        return Promise.resolve(srf);
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
                srf.update();
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
                srf.update();
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
exports.Shell = Shell;
