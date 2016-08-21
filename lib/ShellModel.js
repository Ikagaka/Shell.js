"use strict";
/*
 * shell/master/*** 以下のリソースを一元管理するための バリアント型
 */
const ST = require("./SurfaceTree");
const SU = require("./SurfaceUtil");
const SC = require("./ShellConfig");
const CC = require("./CanvasCache");
class Shell {
    constructor() {
        this.directory = {};
        this.cache = new CC.CanvasCache(this.directory);
        this.descript = {};
        this.descriptJSON = {};
        this.config = new SC.ShellConfig();
        this.surfacesTxt = {};
        this.surfaceDefTree = new ST.SurfaceDefinitionTree();
    }
}
exports.Shell = Shell;
function getSurfaceAlias(shell, scopeId, surfaceId) {
    const { aliases, surfaces } = shell.surfaceDefTree;
    const type = SU.scope(scopeId);
    if (typeof surfaceId === "string" || typeof surfaceId === "number") {
        if (aliases[type] != null && aliases[type][surfaceId] != null) {
            // まずエイリアスを探す
            const _surfaceId = SU.choice(aliases[type][surfaceId]);
            return Promise.resolve(_surfaceId);
        }
        if (typeof surfaceId === "number") {
            // 通常の処理
            const _surfaceId = surfaceId;
            return Promise.resolve(_surfaceId);
        }
    }
    // そんなサーフェスはない
    console.warn("Shell.hasSurface: surface alias scope:", scopeId + "as" + type + ", id:" + surfaceId + " is not defined.");
    return Promise.reject("not defined");
}
exports.getSurfaceAlias = getSurfaceAlias;
// 着せ替えメニュー用情報ていきょう
function getBindGroups(shell, scopeId) {
    const { char } = shell.config;
    if (char[scopeId] == null) {
        return Promise.reject("not defined");
    }
    return Promise.resolve(char[scopeId].bindgroup.map((bindgroup, bindgroupId) => {
        return bindgroup.name;
    }));
}
exports.getBindGroups = getBindGroups;
