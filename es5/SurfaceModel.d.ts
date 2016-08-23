import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as SH from "./ShellModel";
export declare class Surface {
    scopeId: number;
    surfaceId: number;
    shell: SH.Shell;
    surfaceDefTree: ST.SurfaceDefinitionTree;
    surfaceNode: ST.SurfaceDefinition;
    config: SC.ShellConfig;
    renderingTree: SurfaceRenderingTree;
    serikos: {
        [animId: number]: Seriko;
    };
    talkCount: number;
    move: {
        x: number;
        y: number;
    };
    destructed: boolean;
    constructor(scopeId: number, surfaceId: number, shell: SH.Shell);
}
export declare class Seriko {
    patternID: number;
    paused: boolean;
    exclusive: boolean;
    canceled: boolean;
    finished: boolean;
    constructor(patternID?: number);
}
export declare class SurfaceRenderingTree {
    base: number;
    foregrounds: SurfaceRenderingLayerSet[];
    backgrounds: SurfaceRenderingLayerSet[];
    collisions: ST.SurfaceCollision[];
    constructor(surface: number);
}
export declare type SurfaceRenderingLayerSet = SurfaceRenderingLayer[];
export declare class SurfaceRenderingLayer {
    type: string;
    surface: SurfaceRenderingTree;
    x: number;
    y: number;
    constructor(type: string, surface: SurfaceRenderingTree, x: number, y: number);
}
