"use strict";
const SF = require('./SurfaceModel');
const events_1 = require("events");
class ShellAttacher extends events_1.EventEmitter {
    constructor() {
        super();
        this.attachedSurface = [];
    }
}
function attachSurface(shell, div, scopeId, surfaceId) {
    const { cache, config, surfaceDefTree, attachedSurface } = shell;
    const type = SU.scope(scopeId);
    const hits = attachedSurface.filter(({ div: _div }) => _div === div);
    if (hits.length !== 0)
        throw new Error("Shell.attachSurface: ReferenceError: this HTMLDivElement is already attached");
    if (scopeId < 0) {
        throw new Error("Shell.attachSurface: TypeError: scopeId needs more than 0, but:" + scopeId);
    }
    return getSurfaceAlias(shell, scopeId, surfaceId)
        .then((_surfaceId) => {
        if (_surfaceId !== surfaceId) {
            console.info("Shell.attachSurface:", "surface alias is decided on", _surfaceId, "as", type, surfaceId);
        }
        if (!surfaceDefTree[_surfaceId]) {
            console.warn("Shell.attachSurface: surfaceId:", _surfaceId, "is not defined in surfaceTree", surfaceDefTree);
            return Promise.reject("not defined");
        }
        const srf = new SF.Surface(div, scopeId, _surfaceId, surfaceDefTree, config, cache);
        if (config.enableRegion) {
            // これ必要？
            srf.render();
        }
        /*
        srf.on("mouse", (ev: SF.SurfaceMouseEvent)=>{
          shell.emit("mouse", ev); // detachSurfaceで消える
        });
        */
        attachedSurface.push({ div, surface: srf });
        return Promise.resolve(srf);
    });
}
exports.attachSurface = attachSurface;
function detachSurface(shell, div) {
    const { attachedSurface } = shell;
    const hits = attachedSurface.filter(({ div: _div }) => _div === div);
    if (hits.length === 0)
        return;
    hits[0].surface.destructor(); // srf.onのリスナはここで消される
    attachedSurface.splice(attachedSurface.indexOf(hits[0]), 1);
}
exports.detachSurface = detachSurface;
function unload(shell) {
    const { attachedSurface } = shell;
    attachedSurface.forEach(function ({ div, surface }) {
        surface.destructor();
    });
    shell.removeAllListeners();
    Shell.call(shell, {}); // 初期化 // ES6 Class ではできない:
}
exports.unload = unload;
// 全サーフェス強制再描画
function render() {
    this.attachedSurface.forEach(({ surface: srf, div }) => {
        srf.render();
    });
}
exports.render = render;
