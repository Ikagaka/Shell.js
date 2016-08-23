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
export declare class SurfaceDescript {
    collisionSort: string;
    animationSort: string;
    constructor(collisionSort?: string, animationSort?: string);
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
            offsetX: number;
            offsetY: number;
        }[];
        offsetX: number;
        offsetY: number;
    };
    collisions: SurfaceCollision[];
    animations: SurfaceAnimation[];
    elements: SurfaceElement[];
    constructor(elements?: SurfaceElement[], collisions?: SurfaceCollision[], animations?: SurfaceAnimation[], balloons?: {
        char: {
            offsetX: number;
            offsetY: number;
        }[];
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
    constructor(type: string, file: string, x?: number, y?: number);
}
export declare class SurfaceCollision {
    name: string;
    type: string;
    constructor(type: string, name: string);
}
export declare class SurfaceCollisionRect extends SurfaceCollision {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(name: string, left: number, top: number, right: number, bottom: number);
}
export declare class SurfaceCollisionEllipse extends SurfaceCollision {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(name: string, left: number, top: number, right: number, bottom: number);
}
export declare class SurfaceCollisionCircle extends SurfaceCollision {
    centerX: number;
    centerY: number;
    radius: number;
    constructor(name: string, centerX: number, centerY: number, radius: number);
}
export declare class SurfaceCollisionPolygon extends SurfaceCollision {
    coordinates: {
        x: number;
        y: number;
    }[];
    constructor(name: string, coordinates: {
        x: number;
        y: number;
    }[]);
}
export declare class SurfaceAnimation {
    intervals: [string, number[]][];
    options: [string, number[]][];
    collisions: SurfaceCollision[];
    patterns: SurfaceAnimationPattern[];
    constructor(intervals?: [string, number[]][], options?: [string, number[]][], collisions?: SurfaceCollision[], patterns?: SurfaceAnimationPattern[]);
}
export declare class SurfaceAnimationPattern {
    type: string;
    surface: number;
    wait: [number, number];
    x: number;
    y: number;
    animation_ids: number[];
    constructor(type?: string, surface?: number, wait?: [number, number], x?: number, y?: number, animation_ids?: number[]);
}
export declare function isBack(anim: SurfaceAnimation): boolean;
export declare function getExclusives(anim: SurfaceAnimation): number[];
export declare function getRegion(collisions: SurfaceCollision[], offsetX: number, offsetY: number): string;
