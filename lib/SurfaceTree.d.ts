/// <reference path="../typings/index.d.ts" />
export declare class SurfaceDefinitionTree {
    descript: SurfaceDescript;
    surfaces: SurfaceDefinition[];
    aliases: {
        [aliasname: string]: number[];
    }[];
    constructor(descript?: SurfaceDescript, surfaces?: SurfaceDefinition[], aliases?: {
        [aliasname: string]: number[];
    }[]);
}
export declare function loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(srfsTxt: SurfacesTxt2Yaml.SurfacesTxt): Promise<SurfaceDefinitionTree>;
export declare class SurfaceDescript {
    collisionSort: string;
    animationSort: string;
    constructor(collisionSort?: string, animationSort?: string);
}
export declare function loadSurfaceDescript(descript: SurfacesTxt2Yaml.SurfaceDescript): Promise<SurfaceDescript>;
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
    collisions: SurfaceCollision[];
    animations: SurfaceAnimation[];
    elements: SurfaceElement[];
    constructor(elements?: SurfaceElement[], collisions?: SurfaceCollision[], animations?: SurfaceAnimation[], balloons?: {
        char: never[];
        offsetX: number;
        offsetY: number;
    }, points?: {
        basepos: {
            x: number;
            y: number;
        };
    });
}
export declare class SurfaceElement {
    type: string;
    file: string;
    x: number;
    y: number;
    constructor(type?: string, file?: string, x?: number, y?: number);
}
export declare function loadSurfaceElement(elm: SurfacesTxt2Yaml.ElementPattern): Promise<SurfaceElement>;
export declare class SurfaceCollision {
    name: string;
    type: string;
    constructor(name?: string, type?: string);
}
export declare function loadSurfaceCollision(collision: SurfacesTxt2Yaml.SurfaceRegion): Promise<SurfaceCollision>;
export declare class SurfaceCollisionRect extends SurfaceCollision {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(name?: string, type?: string, left?: number, top?: number, right?: number, bottom?: number);
}
export declare function loadSurfaceCollisionRect(collision: SurfacesTxt2Yaml.SurfaceRegionRect): Promise<SurfaceCollisionRect>;
export declare class SurfaceCollisionEllipse extends SurfaceCollisionRect {
    constructor(name?: string, type?: string, top?: number, bottom?: number, left?: number, right?: number);
}
export declare function loadSurfaceCollisionEllipse(a: any): Promise<SurfaceCollisionEllipse>;
export declare class SurfaceCollisionCircle extends SurfaceCollision {
    centerX: number;
    centerY: number;
    radius: number;
    constructor(name?: string, type?: string, centerX?: number, centerY?: number, radius?: number);
}
export declare function loadSurfaceCollisionCircle(collision: SurfacesTxt2Yaml.SurfaceRegionCircle): Promise<SurfaceCollisionCircle>;
export declare class SurfaceCollisionPolygon extends SurfaceCollision {
    coordinates: {
        x: number;
        y: number;
    }[];
    constructor(name?: string, type?: string, coordinates?: {
        x: number;
        y: number;
    }[]);
}
export declare function loadSurfaceCollisionPolygon(col: SurfacesTxt2Yaml.SurfaceRegionPolygon): Promise<SurfaceCollisionPolygon>;
export declare class SurfaceAnimation {
    intervals: [string, string[]][];
    options: [string, string[]][];
    collisions: SurfaceCollision[];
    patterns: SurfaceAnimationPattern[];
    constructor(intervals?: [string, string[]][], options?: [string, string[]][], collisions?: SurfaceCollision[], patterns?: SurfaceAnimationPattern[]);
}
export declare function loadSurfaceAnimation(animation: SurfacesTxt2Yaml.SurfaceAnimation): Promise<SurfaceAnimation>;
export declare class SurfaceAnimationPattern {
    type: string;
    surface: number;
    wait: [number, number];
    x: number;
    y: number;
    animation_ids: number[];
    constructor(type?: string, surface?: number, wait?: [number, number], x?: number, y?: number, animation_ids?: never[]);
}
export declare function loadSurfaceAnimationPattern(pat: SurfacesTxt2Yaml.SurfaceAnimationPattern): Promise<SurfaceAnimationPattern>;
