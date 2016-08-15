export interface SurfaceCanvas {
    cnv: HTMLCanvasElement | null;
    png: HTMLImageElement | null;
    pna: HTMLImageElement | null;
}
export interface SurfaceTreeNode {
    elements: SurfaceElement[];
    collisions: SurfaceRegion[];
    animations: SurfaceAnimationEx[];
}
export interface SurfaceAnimationEx {
    intervals: [string, string[]][];
    options: [string, string[]][];
    is: number;
    patterns: SurfaceAnimationPattern[];
    regions: SurfaceRegion[];
}
export interface SurfaceElement {
    canvas: SurfaceCanvas;
    type: string;
    x: number;
    y: number;
}
export interface SurfacesTxt {
    charset: string;
    descript: SurfaceDescript;
    surfaces: {
        [key: string]: SurfaceDefinition;
    };
    aliases: {
        [scope: string]: {
            [aliasname: string]: number[];
        };
    };
    regions: {
        [scope: string]: {
            [regionName: string]: ToolTipElement;
        };
    };
}
export interface ToolTipElement {
    tooltip: string;
    cursor: {
        mouseup: string;
        mousedown: string;
    };
}
export interface SurfaceDescript {
    version: number;
    maxwidth: number;
    "collision-sort": string;
    "animation-sort": string;
}
export interface SurfaceDefinition {
    is: number;
    characters: {
        sakura: string;
    };
    points: {
        centerx: number;
        centery: number;
        kinoko: {
            centerx: number;
            centery: number;
        };
        basepos: {
            x: number;
            y: number;
        };
    };
    balloons: {
        sakura: {
            offsetx: number;
            offsety: number;
        };
        offsetx: number;
        offsety: number;
    };
    regions: {
        [key: string]: SurfaceRegion;
    };
    animations: {
        [key: string]: SurfaceAnimation;
    };
    elements: {
        [key: string]: ElementPattern;
    };
    base: string[];
}
export interface ElementPattern {
    is: number;
    type: string;
    file: string;
    x: number;
    y: number;
}
export interface SurfaceAnimation {
    is: number;
    interval: string;
    option: string;
    patterns: SurfaceAnimationPattern[];
    regions: {
        [key: string]: SurfaceRegion;
    };
}
export interface SurfaceAnimationPatternBase {
    type: string;
    surface: number;
    wait: string;
    x: number;
    y: number;
}
export interface SurfaceAnimationPatternAlternative extends SurfaceAnimationPatternBase {
    animation_ids: number[];
}
export interface SurfaceAnimationPatternInsert extends SurfaceAnimationPatternBase {
    animation_id: string;
}
export declare type SurfaceAnimationPattern = SurfaceAnimationPatternBase | SurfaceAnimationPatternAlternative | SurfaceAnimationPatternInsert;
export interface SurfaceRegionBase {
    is: number;
    name: string;
    type: string;
}
export interface SurfaceRegionRect extends SurfaceRegionBase {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface SurfaceRegionCircle extends SurfaceRegionBase {
    center_x: number;
    center_y: number;
    radius: number;
}
export interface SurfaceRegionEllipse extends SurfaceRegionBase {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface SurfaceRegionPolygon extends SurfaceRegionBase {
    coordinates: {
        x: number;
        y: number;
    }[];
}
export declare type SurfaceRegion = SurfaceRegionRect | SurfaceRegionCircle | SurfaceRegionEllipse | SurfaceRegionPolygon;
