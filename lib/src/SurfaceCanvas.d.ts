/// <reference path="../../typings/tsd.d.ts" />
export default class SurfaceCanvas {
    url: string;
    buffer: ArrayBuffer;
    img: HTMLImageElement;
    cnv: HTMLCanvasElement;
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    constructor();
    loadFromURL(url: string): Promise<SurfaceCanvas>;
    loadFromBuffer(buffer: ArrayBuffer): Promise<SurfaceCanvas>;
    loadFromImage(img: HTMLImageElement): Promise<SurfaceCanvas>;
    loadFromCanvas(cnv: HTMLCanvasElement): SurfaceCanvas;
    loadFromUint8ClampedArray(pixels: Uint8ClampedArray, width: number, height: number): SurfaceCanvas;
}
