export declare var enablePNGjs: boolean;
export declare function choice<T>(arr: T[]): T;
export declare function copy(cnv: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf: ArrayBuffer, pnabuf?: ArrayBuffer): Promise<{
    width: number;
    height: number;
    data: Uint8ClampedArray;
}>;
export declare function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?: string): Promise<HTMLImageElement>;
export declare function fetchImageFromURL(url: string): Promise<HTMLImageElement>;
export declare function random(callback: (callback: () => void) => void, probability: number): void;
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
export declare function elementFromPointWithout(element: HTMLElement, pageX: number, pageY: number): Element;
