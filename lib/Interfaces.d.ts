/// <reference path="../typings/index.d.ts" />
export interface SurfaceCanvas {
    cnv: HTMLCanvasElement | null;
    png: HTMLImageElement | null;
    pna: HTMLImageElement | null;
}
export interface SurfaceMouseEvent {
    button: number;
    offsetX: number;
    offsetY: number;
    region: string;
    scopeId: number;
    wheel: number;
    type: string;
    transparency: boolean;
    event: JQueryEventObject;
}
export interface SurfaceTreeNode {
    base: SurfaceCanvas | null;
    elements: SurfaceElement[];
    collisions: SurfacesTxt2Yaml.SurfaceRegion[];
    animations: SurfaceAnimationEx[];
}
export interface SurfaceAnimationEx {
    intervals: [string, string[]][];
    options: [string, string[]][];
    is: number;
    patterns: SurfacesTxt2Yaml.SurfaceAnimationPattern[];
    regions: SurfacesTxt2Yaml.SurfaceRegion[];
}
export interface SurfaceElement {
    canvas: SurfaceCanvas;
    type: string;
    x: number;
    y: number;
}
