/// <reference path="../typings/tsd.d.ts" />
import { SurfaceCanvas, SurfaceElement } from "./Interfaces";
export default class SurfaceRender {
    cnv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    tmpcnv: HTMLCanvasElement;
    tmpctx: CanvasRenderingContext2D;
    basePosX: number;
    basePosY: number;
    baseWidth: number;
    baseHeight: number;
    debug: boolean;
    use_self_alpha: boolean;
    constructor(opt?: {
        use_self_alpha: boolean;
    });
    reset(): void;
    getSurfaceCanvas(): SurfaceCanvas;
    composeElements(elements: SurfaceElement[]): void;
    private composeElement(canvas, type, x?, y?);
    clear(): void;
    base(part: SurfaceCanvas): void;
    private prepareOverlay(part, x, y);
    private overlay(part, x, y);
    private overlayfast(part, x, y);
    private interpolate(part, x, y);
    private replace(part, x, y);
    private asis(part, x, y);
    private move(x, y);
    private add(part, x, y);
    private reduce(part, x, y);
    drawRegions(regions: SurfaceRegion[], description?: string): void;
    private drawRegion(region);
    private drawEllipseWithBezier(x, y, w, h);
}
