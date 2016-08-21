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
    layers: Layer[];
    seriko: boolean[];
    talkCount: number;
    move: {
        x: number;
        y: number;
    };
    destructed: boolean;
    constructor(scopeId: number, surfaceId: number, shell: SH.Shell);
}
export declare class Layer {
    background: boolean;
}
export declare class SerikoLayer extends Layer {
    waiting: boolean;
    patternID: number;
    paused: boolean;
    exclusive: boolean;
    canceled: boolean;
    finished: boolean;
    constructor(background: boolean);
}
export declare class MayunaLayer extends Layer {
    visible: boolean;
    constructor(visible: boolean, background: boolean);
}
