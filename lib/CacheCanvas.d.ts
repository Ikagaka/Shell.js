import "../typings/index.d.ts";
export declare class Done {
    a: "a";
}
export declare class Yet {
    b: "b";
}
export declare class Cache<T extends Done | Yet> {
    _: T;
    cnv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    png: HTMLImageElement;
    constructor();
}
export declare class PNGWithoutPNA<T extends Done | Yet> extends Cache<T> {
    constructor(png: HTMLImageElement);
}
export declare class PNGWithPNA<T extends Done | Yet> extends PNGWithoutPNA<T> {
    pna: HTMLImageElement;
    constructor(png: HTMLImageElement, pna: HTMLImageElement);
}
export declare function applyChromakey(cc: Cache<Done | Yet>): Promise<Cache<Done>>;
export declare function getPNGImage(pngBuffer: ArrayBuffer): Promise<PNGWithoutPNA<Yet>>;
export declare function getPNGAndPNAImage(pngBuffer: ArrayBuffer, pnaBuffer: ArrayBuffer): Promise<PNGWithPNA<Yet>>;
