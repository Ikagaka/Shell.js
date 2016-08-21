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
    reset(): void;
    clear(): void;
    composeElements(elms: {
        type: string;
        x: number;
        y: number;
        canvas: SurfaceCanvas;
    }[]): SurfaceCanvas;
    private composeElement(canvas, type, x?, y?);
    base(part: SurfaceCanvas): void;
    private overlay(part, x, y);
    private overlayfast(part, x, y);
    private interpolate(part, x, y);
    private replace(part, x, y);
    private prepareOverlay(part, x, y);
    private reduce(part, x, y);
    drawRegions(regions: ST.SurfaceCollision[], description?: string): void;
    private drawRegion(region);
    private drawEllipseWithBezier(x, y, w, h);
}
export declare function isHit(srfCnv: SurfaceCanvas, cols: ST.SurfaceCollision[], x: number, y: number): {
    transparency: boolean;
    name: string;
};
export declare function copy(srfCnv: SurfaceCanvas): SurfaceCanvas;
