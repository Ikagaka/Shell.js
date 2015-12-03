/// <reference path="../../typings/tsd.d.ts" />
import { SurfaceTreeNode, SurfaceCanvas } from "./Interfaces";
export declare function pna(srfCnv: SurfaceCanvas): SurfaceCanvas;
export declare function createSurfaceCanvasDummy(): SurfaceCanvas;
export declare function createSurfaceCanvasFromURL(url: string): Promise<{
    img: HTMLImageElement;
    cnv: HTMLCanvasElement;
}>;
export declare function createSurfaceCanvasFromArrayBuffer(buffer: ArrayBuffer): Promise<{
    img: HTMLImageElement;
    cnv: HTMLCanvasElement;
}>;
export declare function init(cnv: HTMLCanvasElement, ctx: CanvasRenderingContext2D, src: HTMLCanvasElement): void;
export declare function chromakey_snipet(data: Uint8ClampedArray): void;
export declare function log(element: Element, description?: string): void;
export declare function extend(target: any, source: any): void;
export declare function parseDescript(text: string): {
    [key: string]: string;
};
export declare function fetchArrayBuffer(url: string): Promise<ArrayBuffer>;
export declare function convert(buffer: ArrayBuffer): string;
export declare function find(paths: string[], filename: string): string[];
export declare function choice<T>(arr: T[]): T;
export declare function copy(cnv: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf: ArrayBuffer, pnabuf?: ArrayBuffer): Promise<{
    width: number;
    height: number;
    data: Uint8ClampedArray;
}>;
export declare function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?: string): Promise<HTMLImageElement>;
export declare function fetchImageFromURL(url: string): Promise<HTMLImageElement>;
export declare function random(callback: (nextTick: () => void) => void, probability: number): void;
export declare function periodic(callback: (callback: () => void) => void, sec: number): void;
export declare function always(callback: (callback: () => void) => void): void;
export declare function isHit(cnv: HTMLCanvasElement, x: number, y: number): boolean;
export declare function offset(element: Element): {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare function createCanvas(): HTMLCanvasElement;
export declare function scope(scopeId: number): string;
export declare function unscope(charId: string): number;
export declare function getEventPosition(ev: JQueryEventObject): {
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
};
export declare function randomRange(min: number, max: number): number;
export declare function getRegion(element: HTMLCanvasElement, surfaceNode: SurfaceTreeNode, offsetX: number, offsetY: number): {
    isHit: boolean;
    name: string;
};
