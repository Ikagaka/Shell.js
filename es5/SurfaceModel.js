/*
 * Surface の状態モデル
 */
"use strict";
var Surface = (function () {
    function Surface(scopeId, surfaceId, shell) {
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
