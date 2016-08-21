import * as SM from "./SurfaceModel";
import { EventEmitter } from "events";
export declare class SurfaceState extends EventEmitter {
    surface: SM.Surface;
    section: {
        resolve: Function;
        reject: Function;
    }[];
    constructor(surface: SM.Surface);
    private initLayer(animId);
    begin(animId: number): void;
    end(animId: number): void;
    endAll(): void;
    private setIntervalTimer(animId, interval, args);
    play(animId: number): Promise<void>;
    private step(animId, layer);
    stop(animId: number): void;
    pause(animId: number): void;
    resume(animId: number): void;
    talk(): void;
    yenE(): void;
}
