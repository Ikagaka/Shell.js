/// <reference path="../typings/tsd.d.ts" />
import Surface from './Surface';
import { ShellConifg } from "./Interfaces";
import EventEmitter = require("eventemitter3");
export default class Shell extends EventEmitter {
    directory: {
        [filepath: string]: ArrayBuffer;
    };
    descript: {
        [key: string]: string;
    };
    config: ShellConifg;
    attachedSurface: {
        div: HTMLDivElement;
        surface: Surface;
    }[];
    private surfacesTxt;
    private surfaceTree;
    private cacheCanvas;
    private bindgroup;
    enableRegion: boolean;
    constructor(directory: {
        [filepath: string]: ArrayBuffer;
    });
    load(): Promise<Shell>;
    private loadDescript();
    private loadConfig();
    private loadBindGroup();
    private loadSurfacesTxt();
    private loadSurfaceTable();
    private loadSurfacePNG();
    private loadElements();
    private loadCollisions();
    private loadAnimations();
    private hasFile(filename);
    private getPNGFromDirectory(filename, cb);
    attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number | string): Surface;
    detachSurface(div: HTMLDivElement): void;
    unload(): void;
    private getSurfaceAlias(scopeId, surfaceId);
    private hasSurface(scopeId, surfaceId);
    bind(category: string, parts: string): void;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(category: string, parts: string): void;
    unbind(scopeId: number, bindgroupId: number): void;
    private render();
    showRegion(): void;
    hideRegion(): void;
    getBindGroups(scopeId: number): {
        category: string;
        parts: string;
        thumbnail: string;
    }[];
}
