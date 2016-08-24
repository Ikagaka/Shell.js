/*
 * Surface の状態モデル
 */
"use strict";
var Surface = (function () {
    function Surface(scopeId, surfaceId, width, height, shell) {
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.surfaceDefTree = shell.surfaceDefTree;
        this.surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
        this.config = shell.config;
        this.renderingTree = new SurfaceRenderingTree(surfaceId);
        this.serikos = {};
        this.talkCount = 0;
        this.move = { x: 0, y: 0 };
        if (this.config.char[surfaceId] != null && typeof this.config.char[surfaceId].seriko.alignmenttodesktop === "string") {
            // 個別設定
            this.alignmenttodesktop = this.config.char[surfaceId].seriko.alignmenttodesktop;
        }
        else {
            // 全体設定が初期値
            this.alignmenttodesktop = this.config.seriko.alignmenttodesktop;
        }
        // model は　render されないと base surface の大きさがわからない
        this.width = width;
        this.height = width;
        this.basepos = { x: width / 2 | 0, y: height };
        if (this.surfaceNode.points.basepos.x != null) {
            this.basepos.x = this.surfaceNode.points.basepos.x;
        }
        if (this.surfaceNode.points.basepos.y != null) {
            this.basepos.y = this.surfaceNode.points.basepos.y;
        }
        this.destructed = false;
    }
    return Surface;
}());
exports.Surface = Surface;
var Seriko = (function () {
    function Seriko(patternID) {
        if (patternID === void 0) { patternID = -1; }
        this.patternID = patternID;
        this.paused = false;
        this.exclusive = false;
        this.canceled = false;
        this.finished = false;
    }
    return Seriko;
}());
exports.Seriko = Seriko;
var SurfaceRenderingTree = (function () {
    function SurfaceRenderingTree(surface) {
        this.base = surface;
        this.foregrounds = [];
        this.backgrounds = [];
        this.collisions = [];
    }
    return SurfaceRenderingTree;
}());
exports.SurfaceRenderingTree = SurfaceRenderingTree;
var SurfaceRenderingLayer = (function () {
    function SurfaceRenderingLayer(type, surface, x, y) {
        this.type = type;
        this.surface = surface;
        this.x = x;
        this.y = y;
    }
    return SurfaceRenderingLayer;
}());
exports.SurfaceRenderingLayer = SurfaceRenderingLayer;
