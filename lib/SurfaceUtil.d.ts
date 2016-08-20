import * as ST from "./SurfaceTree";
export declare var extend: {
    (target: any, object1?: any, ...objectN: any[]): any;
    (deep: boolean, target: any, object1?: any, ...objectN: any[]): any;
};
export declare function chromakey(png: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function png_pna(png: HTMLCanvasElement | HTMLImageElement, pna: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function chromakey_snipet(data: Uint8ClampedArray): void;
export declare function log(element: Element, description?: string): void;
export declare function parseDescript(text: string): {
    [key: string]: string;
};
export declare function fetchArrayBuffer(url: string): Promise<ArrayBuffer>;
export declare function convert(buffer: ArrayBuffer): string;
export declare function find(paths: string[], filename: string): string[];
export declare function fastfind(paths: string[], filename: string): string;
export declare function choice<T>(arr: T[]): T;
export declare function copy(cnv: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function fastcopy(cnv: HTMLCanvasElement | HTMLImageElement, tmpctx: CanvasRenderingContext2D): void;
export declare function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?: string): Promise<HTMLImageElement>;
export declare function fetchImageFromURL(url: string): Promise<HTMLImageElement>;
export declare function random(callback: (nextTick: Function) => void, probability: number): NodeJS.Timer;
export declare function periodic(callback: (nextTick: Function) => void, sec: number): NodeJS.Timer;
export declare function always(callback: (nextTick: Function) => void): NodeJS.Timer;
export declare function isHit(cnv: HTMLCanvasElement, x: number, y: number): boolean;
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
export declare function getRegion(element: HTMLCanvasElement, collisions: ST.SurfaceCollision[], offsetX: number, offsetY: number): string;
export declare function getScrollXY(): {
    scrollX: number;
    scrollY: number;
};
export declare function findSurfacesTxt(filepaths: string[]): string[];
export declare function fetchArrayBufferFromURL(url: string): Promise<ArrayBuffer>;
export declare function decolateJSONizeDescript<T, S>(o: T, key: string, value: S): void;
export declare function changeFileExtension(filename: string, without_dot_new_extention: string): string;
export declare function ABToCav(ab: ArrayBuffer): Promise<HTMLCanvasElement>;
export declare function has<T>(dir: {
    [key: string]: T;
}, path: string): string;
export declare function get<T>(dir: {
    [key: string]: T;
}, path: string): Promise<T>;
export declare function setPictureFrame(element: HTMLElement, description: string): void;
export declare function craetePictureFrame(description: string, target?: HTMLElement): {
    add: (element: HTMLElement | string, txt?: string) => void;
};
