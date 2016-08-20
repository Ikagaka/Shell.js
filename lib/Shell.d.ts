/// <reference path="../typings/index.d.ts" />
import * as SF from './Surface';
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as CC from "./CanvasCache";
import * as SY from "surfaces_txt2yaml";
import { EventEmitter } from "events";
export declare class Shell extends EventEmitter {
    directory: {
        [filepath: string]: ArrayBuffer;
    };
    descript: SC.Descript;
    descriptJSON: SC.JSONLike;
    config: SC.ShellConfig;
    cache: CC.CanvasCache;
    attachedSurface: {
        div: HTMLDivElement;
        surface: SF.Surface;
    }[];
    surfacesTxt: SY.SurfacesTxt;
    surfaceDefTree: ST.SurfaceDefinitionTree;
    constructor(directory: {
        [filepath: string]: ArrayBuffer;
    });
    load(): Promise<Shell>;
    attachSurface(div: HTMLDivElement, scopeId: number, surfaceId: number | string): Promise<SF.Surface>;
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
