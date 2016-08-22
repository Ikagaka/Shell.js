import * as SS from "./ShellState";
import * as ST from "./SurfaceTree";
import * as SM from "./SurfaceModel";
import { EventEmitter } from "events";
export declare class SurfaceState extends EventEmitter {
    surface: SM.Surface;
    shellState: SS.ShellState;
    continuations: {
        resolve: Function;
        reject: Function;
    }[];
    constructor(scopeId: number, surfaceId: number, shellState: SS.ShellState);
    private initLayer(animId);
    private updateBind();
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
    constructRenderingTree(): void;
}
export declare function layersToTree(surfaces: ST.SurfaceDefinition[], n: number, layers: SM.Layer[]): SM.SurfaceRenderingTree;
