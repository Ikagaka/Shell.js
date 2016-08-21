import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
export declare class Surface {
    scopeId: number;
    surfaceId: number;
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
    constructor(scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, config: SC.ShellConfig);
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
export declare function getSurfaceSize(srf: Surface): {
    width: number;
    height: number;
};
