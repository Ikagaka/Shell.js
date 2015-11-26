/// <reference path="../../typings/tsd.d.ts" />
import { Surface } from './Surface';
import { SurfaceLayerObject } from "./SurfaceRender";
export interface EventEmitter {
}
export interface SurfaceRegion {
    is: number;
    name: string;
    type: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
    radius: number;
    center_x: number;
    center_y: number;
    coordinates: {
        x: number;
        y: number;
    }[];
}
export interface SurfaceAnimation {
    is: number;
    interval: string;
    option: string;
    patterns: SurfaceAnimationPattern[];
}
export interface SurfaceAnimationPattern {
    animation_ids: number[];
    type: string;
    surface: number;
    wait: string;
    x: number;
    y: number;
}
export interface SurfaceTreeNode {
    base: HTMLCanvasElement;
    elements: SurfaceLayerObject[];
    collisions: SurfaceRegion[];
    animations: SurfaceAnimation[];
}
export declare class Shell extends EventEmitter {
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
    enableRegionDraw: boolean;
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
    hasSurface(scopeId: number, surfaceId: number | string): boolean;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(scopeId: number, bindgroupId: number): void;
    render(): void;
}
