import "../typings/index.d.ts";
export default class CanvasCache {
    private directory;
    private cache;
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
