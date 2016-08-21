import "../typings/index.d.ts";
export declare type Directory = {
    [filepath: string]: ArrayBuffer;
};
export declare class CanvasCache {
    directory: Directory;
    cache: {
        [path: string]: HTMLCanvasElement;
    };
    constructor(dir: {
        [path: string]: ArrayBuffer;
    });
    hasFile(path: string): string;
    hasCache(path: string): string;
    getFile(path: string): Promise<ArrayBuffer>;
    getCache(path: string): Promise<HTMLCanvasElement>;
    getCanvas(path: string, asis?: boolean, retry?: boolean): Promise<HTMLCanvasElement>;
    clear(): void;
}
