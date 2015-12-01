/// <reference path="../../typings/tsd.d.ts" />
import { SurfaceCanvas } from "./Interfaces";
export default class SurfaceRender implements SurfaceCanvas {
    cnv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    img: HTMLImageElement;
    basePosX: number;
    basePosY: number;
    elements: {
        method: string;
        args: any[];
    }[];
    constructor();
    getSurfaceCanvas(): {
        cnv: HTMLCanvasElement;
        img: HTMLImageElement;
    };
    composeElements(elements: {
        canvas: SurfaceCanvas;
        type: string;
        x: number;
        y: number;
    }[]): void;
    composeElement(canvas: SurfaceCanvas, type: string, x: number, y: number): void;
    clear(): void;
    pna(png: SurfaceCanvas, pna: SurfaceCanvas): void;
    base(part: SurfaceCanvas): void;
    overlay(part: SurfaceCanvas, x: number, y: number): void;
    overlayfast(part: SurfaceCanvas, x: number, y: number): void;
    interpolate(part: SurfaceCanvas, x: number, y: number): void;
    replace(part: SurfaceCanvas, x: number, y: number): void;
    asis(part: SurfaceCanvas, x: number, y: number): void;
    move(x: number, y: number): void;
    bind(part: SurfaceCanvas, x: number, y: number): void;
    add(part: SurfaceCanvas, x: number, y: number): void;
    reduce(part: SurfaceCanvas, x: number, y: number): void;
    init(srfCnv: SurfaceCanvas): void;
    initImageData(width: number, height: number, data: Uint8ClampedArray): void;
    drawRegions(regions: SurfaceRegion[]): void;
    drawRegion(region: SurfaceRegion): void;
}
