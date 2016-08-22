/*
 * Surface の状態モデル
 */
"use strict";
class Surface {
    constructor(scopeId, surfaceId, shell) {
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.surfaceDefTree = shell.surfaceDefTree;
        this.surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
        this.config = shell.config;
        this.renderingTree = new SurfaceRenderingTree(surfaceId);
        this.layers = [];
        this.seriko = [];
        this.talkCount = 0;
        this.move = { x: 0, y: 0 };
        this.destructed = false;
    }
}
exports.Surface = Surface;
class Layer {
    constructor(patterns, background) {
        this.patterns = [];
        this.background = background;
    }
}
exports.Layer = Layer;
class SerikoLayer extends Layer {
    constructor(patterns, background, patternID = -1) {
        super(patterns, background);
        this.patternID = patternID;
        this.paused = false;
        this.exclusive = false;
        this.canceled = false;
        this.finished = false;
    }
}
exports.SerikoLayer = SerikoLayer;
class MayunaLayer extends Layer {
    constructor(patterns, background, visible) {
        super(patterns, background);
        this.visible = true;
    }
}
exports.MayunaLayer = MayunaLayer;
class SurfaceRenderingTree {
    constructor(surface) {
        this.base = surface;
        this.foregrounds = [];
        this.backgrounds = [];
        this.collisions = [];
    }
}
exports.SurfaceRenderingTree = SurfaceRenderingTree;
class SurfaceRenderingLayer {
    constructor(type, surface, x, y) {
        this.type = type;
        this.surface = surface;
        this.x = x;
        this.y = y;
    }
}
exports.SurfaceRenderingLayer = SurfaceRenderingLayer;
