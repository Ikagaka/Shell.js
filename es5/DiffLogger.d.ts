import * as SU from "./SurfaceUtil";
export declare class DiffLogger<T> {
    o: T;
    changeLog: [number, SU.SUDiff][];
    constructor(o: T);
    logger(manipulation: Function): void;
}
