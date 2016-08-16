/// <reference path="../typings/index.d.ts" />
import Surface from './Surface';
import * as SC from "./ShellConfig";
import * as EventEmitter from "events";
export default class Shell extends EventEmitter.EventEmitter {
    directory: {
        [filepath: string]: ArrayBuffer;
    };
    descript: SC.Descript;
    descriptJSON: SC.JSONLike;
    config: SC.ShellConfig;
    attachedSurface: {
        div: HTMLDivElement;
        surface: Surface;
    }[];
    private surfacesTxt;
    private surfaceTree;
    private surfaceDefTree;
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
    private hasFile(filename);
    private getPNGFromDirectory(filename, cb);
    attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number | string): Surface | null;
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
