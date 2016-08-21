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
        this.layers = [];
        this.seriko = [];
        this.talkCount = 0;
        this.move = { x: 0, y: 0 };
        this.destructed = false;
    }
}
exports.Surface = Surface;
class Layer {
}
exports.Layer = Layer;
class SerikoLayer extends Layer {
    constructor(background) {
        super();
        this.patternID = -1;
        this.paused = false;
        this.exclusive = false;
        this.canceled = false;
        this.finished = false;
        this.background = background;
    }
}
exports.SerikoLayer = SerikoLayer;
class MayunaLayer extends Layer {
    constructor(visible, background) {
        super();
        this.visible = true;
        this.background = background;
    }
}
exports.MayunaLayer = MayunaLayer;
