import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SM from "./SurfaceModel";
export declare class SurfaceState {
    surface: SM.Surface;
    debug: boolean;
    continuations: {
        [animId: number]: {
            resolve: Function;
            reject: Function;
        };
    };
    renderer: (event: string, surface: SM.Surface) => Promise<void>;
    constructor(surface: SM.Surface, renderer: (event: string, surface: SM.Surface) => Promise<void>);
    render(): Promise<void>;
    private initSeriko(animId);
    updateBind(): Promise<void>;
    begin(animId: number): void;
    end(animId: number): void;
    endAll(): void;
    private setIntervalTimer(animId, interval, args);
    play(animId: number): Promise<void>;
    private step(animId, seriko);
    stop(animId: number): void;
    pause(animId: number): void;
    resume(animId: number): void;
    talk(): void;
    yenE(): void;
    constructRenderingTree(): void;
}
export declare function layersToTree(surfaces: ST.SurfaceDefinition[], scopeId: number, n: number, serikos: {
    [a: number]: SM.Seriko;
}, config: SC.ShellConfig): SM.SurfaceRenderingTree;
