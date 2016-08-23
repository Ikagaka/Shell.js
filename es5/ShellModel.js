"use strict";
/*
 * shell/master/*** 以下のリソースを一元管理するための バリアント型
 */
var ST = require("./SurfaceTree");
var SU = require("./SurfaceUtil");
var SC = require("./ShellConfig");
var Shell = (function () {
    function Shell() {
        this.directory = {};
        this.descript = {};
        this.descriptJSON = {};
        this.config = new SC.ShellConfig();
        this.surfacesTxt = {};
        this.surfaceDefTree = new ST.SurfaceDefinitionTree();
    }
    return Shell;
}());
exports.Shell = Shell;
function getSurfaceAlias(shell, scopeId, surfaceId) {
    var _a = shell.surfaceDefTree, aliases = _a.aliases, surfaces = _a.surfaces;
    var type = SU.scope(scopeId);
    if (typeof surfaceId === "string" || typeof surfaceId === "number") {
        if (aliases[type] != null && aliases[type][surfaceId] != null) {
            // まずエイリアスを探す
            var _surfaceId = SU.choice(aliases[type][surfaceId]);
            return Promise.resolve(_surfaceId);
        }
        if (typeof surfaceId === "number") {
            // 通常の処理
            var _surfaceId = surfaceId;
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
    var char = shell.config.char;
    if (char[scopeId] == null) {
        return Promise.reject("not defined");
    }
    return Promise.resolve(char[scopeId].bindgroup.map(function (bindgroup, bindgroupId) {
        return bindgroup.name;
    }));
}
exports.getBindGroups = getBindGroups;
