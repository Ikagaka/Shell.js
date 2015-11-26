/// <reference path="../../typings/tsd.d.ts" />
export interface SurfaceLayerObject {
    canvas: HTMLCanvasElement;
    type: string;
    x: number;
    y: number;
}
export declare class SurfaceRender {
    cnv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    basePosX: number;
    basePosY: number;
    DEBUG: boolean;
    constructor(cnv: HTMLCanvasElement);
    composeElements(elements: SurfaceLayerObject[]): void;
    clear(): void;
    chromakey(): void;
    pna(pna: HTMLCanvasElement): void;
    base(part: HTMLCanvasElement): void;
    overlay(part: HTMLCanvasElement, x: number, y: number): void;
    overlayfast(part: HTMLCanvasElement, x: number, y: number): void;
    interpolate(part: HTMLCanvasElement, x: number, y: number): void;
    replace(part: HTMLCanvasElement, x: number, y: number): void;
    init(cnv: HTMLImageElement | HTMLCanvasElement): void;
    initImageData(width: number, height: number, data: Uint8ClampedArray): void;
    drawRegions(regions: SurfaceRegion[]): void;
    drawRegion(region: SurfaceRegion): void;
}
