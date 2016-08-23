import * as ST from "./SurfaceTree";
export declare class SurfaceCanvas {
    cnv: HTMLCanvasElement;
    basePosX: number;
    basePosY: number;
    baseWidth: number;
    baseHeight: number;
    constructor(cnv: HTMLCanvasElement);
}
export declare class SurfaceRenderer extends SurfaceCanvas {
    ctx: CanvasRenderingContext2D;
    tmpcnv: HTMLCanvasElement;
    tmpctx: CanvasRenderingContext2D;
    debug: boolean;
    use_self_alpha: boolean;
    constructor();
    init(srfCnv: SurfaceCanvas): void;
    reset(): void;
    clear(): void;
    composeElements(elms: {
        type: string;
        x: number;
        y: number;
        canvas: SurfaceCanvas;
    }[]): SurfaceCanvas;
    composeElement(canvas: SurfaceCanvas, type: string, x?: number, y?: number): void;
    base(part: SurfaceCanvas): void;
    overlay(part: SurfaceCanvas, x: number, y: number): void;
    overlayfast(part: SurfaceCanvas, x: number, y: number): void;
    interpolate(part: SurfaceCanvas, x: number, y: number): void;
    replace(part: SurfaceCanvas, x: number, y: number): void;
    prepareOverlay(part: SurfaceCanvas, x: number, y: number): void;
    reduce(part: SurfaceCanvas, x: number, y: number): void;
    drawRegions(regions: ST.SurfaceCollision[], description?: string): void;
    drawRegion(region: ST.SurfaceCollision): void;
    drawEllipseWithBezier(x: number, y: number, w: number, h: number): void;
}
export declare function isHit(srfCnv: SurfaceCanvas, cols: ST.SurfaceCollision[], x: number, y: number): {
    transparency: boolean;
    name: string;
};
export declare function copy(srfCnv: SurfaceCanvas): SurfaceCanvas;
