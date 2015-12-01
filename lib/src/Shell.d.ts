/// <reference path="../../typings/tsd.d.ts" />
import Surface from './Surface';
import { SurfaceTreeNode } from "./Interfaces";
import EventEmitter from "eventemitter3";
export default class Shell extends EventEmitter {
    directory: {
        [filepath: string]: ArrayBuffer;
    };
    descript: {
        [key: string]: string;
    };
    attachedSurface: {
        canvas: HTMLCanvasElement;
        surface: Surface;
    }[];
    surfacesTxt: SurfacesTxt;
    surfaceTree: SurfaceTreeNode[];
    private cacheCanvas;
    bindgroup: {
        [charId: number]: {
            [bindgroupId: number]: boolean;
        };
    };
    enableRegion: boolean;
    constructor(directory: {
        [filepath: string]: ArrayBuffer;
    });
    load(): Promise<Shell>;
    private loadDescript();
    private loadBindGroup();
    private loadSurfacesTxt();
    private loadSurfaceTable();
    private loadSurfacePNG();
    private loadElements();
    private loadCollisions();
    private loadAnimations();
    private hasFile(filename);
    private getPNGFromDirectory(filename);
    attachSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number | string): Surface;
    detachSurface(canvas: HTMLCanvasElement): void;
    unload(): void;
    private hasSurface(scopeId, surfaceId);
    bind(scopeId: number, bindgroupId: number): void;
    unbind(scopeId: number, bindgroupId: number): void;
    private render();
    showRegion(): void;
    hideRegion(): void;
}
