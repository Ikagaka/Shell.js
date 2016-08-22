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
    renderingTree: SurfaceRenderingTree;
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
    patterns: ST.SurfaceAnimationPattern[];
    constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean);
}
export declare class SerikoLayer extends Layer {
    patternID: number;
    waiting: boolean;
    paused: boolean;
    exclusive: boolean;
    canceled: boolean;
    finished: boolean;
    constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean, patternID?: number);
}
export declare class MayunaLayer extends Layer {
    visible: boolean;
    constructor(patterns: ST.SurfaceAnimationPattern[], background: boolean, visible: boolean);
}
export declare class SurfaceRenderingTree {
    base: number;
    foregrounds: SurfaceRenderingLayerSet[];
    backgrounds: SurfaceRenderingLayerSet[];
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
