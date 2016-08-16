/// <reference path="../typings/index.d.ts" />
export declare class SurfaceDefinitionTree {
    descript: SurfaceDescript;
    surfaces: {
        [surfaceID: number]: SurfaceDefinition;
    };
    aliases: {
        [scopeID: number]: {
            [aliasname: string]: number[];
        };
    };
    constructor();
    loadFromsurfacesTxt2Yaml(srfsTxt: SurfacesTxt2Yaml.SurfacesTxt): Promise<this>;
}
export declare class SurfaceDescript {
    collisionSort: string;
    animationSort: string;
    constructor();
    loadFromsurfacesTxt2Yaml(descript: SurfacesTxt2Yaml.SurfaceDescript): Promise<this>;
}
export declare class SurfaceDefinition {
    points: {
        basepos: {
            x: number;
            y: number;
        };
    };
    balloons: {
        char: {
            [scopeID: number]: {
                offsetX: number;
                offsetY: number;
            };
        };
        offsetX: number;
        offsetY: number;
    };
    collisions: {
        [id: number]: SurfaceCollision;
    };
    animations: {
        [id: number]: SurfaceAnimation;
    };
    elements: {
        [id: number]: SurfaceElement;
    };
    constructor();
    loadFromsurfacesTxt2Yaml(srf: SurfacesTxt2Yaml.SurfaceDefinition): Promise<this>;
}
export declare class SurfaceElement {
    type: string;
    file: string;
    x: number;
    y: number;
    constructor();
    loadFromsurfacesTxt2Yaml(elm: SurfacesTxt2Yaml.ElementPattern): Promise<this>;
}
export declare class SurfaceCollision {
    name: string;
    type: string;
    constructor();
    loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegion): Promise<SurfaceCollision>;
}
export declare class SurfaceCollisionRect extends SurfaceCollision {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor();
    loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegionRect): Promise<this>;
}
export declare class SurfaceCollisionCircle extends SurfaceCollision {
    centerX: number;
    centerY: number;
    radius: number;
    constructor();
    loadFromsurfacesTxt2Yaml(collision: SurfacesTxt2Yaml.SurfaceRegionCircle): Promise<this>;
}
export declare class SurfaceCollisionEllipse extends SurfaceCollisionRect {
    constructor();
}
export declare class SurfaceCollisionPolygon extends SurfaceCollision {
    coordinates: {
        x: number;
        y: number;
    }[];
    constructor();
    loadFromsurfacesTxt2Yaml(col: SurfacesTxt2Yaml.SurfaceRegionPolygon): Promise<this>;
}
export declare class SurfaceAnimation {
    intervals: [string, string[]][];
    options: [string, string[]][];
    collisions: {
        [id: number]: SurfaceCollision;
    };
    patterns: {
        [id: number]: SurfaceAnimationPattern;
    };
    constructor();
    loadFromsurfacesTxt2Yaml(animation: SurfacesTxt2Yaml.SurfaceAnimation): Promise<this>;
}
export declare class SurfaceAnimationPattern {
    type: string;
    surface: number;
    wait: [number, number];
    x: number;
    y: number;
    animation_ids: number[];
    constructor();
    loadFromsurfacesTxt2Yaml(pat: SurfacesTxt2Yaml.SurfaceAnimationPattern): Promise<this>;
}
