/// <reference path="../../typings/tsd.d.ts" />
export default class SurfaceLoader {
    url: string;
    buffer: ArrayBuffer;
    img: HTMLImageElement;
    cnv: HTMLCanvasElement;
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    constructor();
    loadFromURL(url: string): Promise<SurfaceLoader>;
    loadFromBuffer(buffer: ArrayBuffer): Promise<SurfaceLoader>;
    loadFromImage(img: HTMLImageElement): Promise<SurfaceLoader>;
    loadFromCanvas(cnv: HTMLCanvasElement): Promise<SurfaceLoader>;
    loadFromUint8ClampedArray(pixels: Uint8ClampedArray, width: number, height: number): Promise<SurfaceLoader>;
}
