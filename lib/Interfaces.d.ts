/// <reference path="../typings/index.d.ts" />
export interface ShellConifg {
    seriko: {
        use_self_alpha: number;
        paint_transparent_region_black: number;
        alignmenttodesktop: string;
    };
    menu: {
        value: boolean;
        font?: {
            name: string;
            height: number;
        };
        background?: {
            bitmap: {
                filename: string;
            };
            font: {
                color: {
                    r: number;
                    b: number;
                    g: number;
                };
            };
            alignment: string;
        };
        foreground?: {
            bitmap: {
                filename: string;
            };
            font: {
                color: {
                    r: number;
                    b: number;
                    g: number;
                };
            };
            alignment: string;
        };
        sidebar?: {
            bitmap: {
                filename: string;
            };
            alignment: string;
        };
        separator?: {
            color: {
                r: number;
                b: number;
                g: number;
            };
        };
        disable?: {
            font: {
                color: {
                    r: number;
                    b: number;
                    g: number;
                };
            };
        };
    };
    char: {
        name: string;
        name2: string;
        menu: string;
        menuitem: number[];
        defaultx: number;
        defaulty: number;
        defaultleft: number;
        defaulttop: number;
        balloon: {
            offsetx: number;
            offsety: number;
            alignment: string;
        };
        seriko: {
            use_self_alpha: number;
            paint_transparent_region_black: number;
            alignmenttodesktop: string;
        };
        bindgroup: {
            name: {
                category: string;
                parts: string;
                thumbnail: string;
            };
            default: number;
            addid: number;
        }[];
        bindoption: {
            group: {
                category: string;
                options: string[];
            };
        }[];
    }[];
}
export interface SurfaceCanvas {
    cnv: HTMLCanvasElement | null;
    png: HTMLImageElement | null;
    pna: HTMLImageElement | null;
}
export interface SurfaceMouseEvent {
    button: number;
    offsetX: number;
    offsetY: number;
    region: string;
    scopeId: number;
    wheel: number;
    type: string;
    transparency: boolean;
    event: JQueryEventObject;
}
export interface SurfaceTreeNode {
    base: SurfaceCanvas | null;
    elements: SurfaceElement[];
    collisions: SurfacesTxt2Yaml.SurfaceRegion[];
    animations: SurfaceAnimationEx[];
}
export interface SurfaceAnimationEx {
    intervals: [string, string[]][];
    options: [string, string[]][];
    is: number;
    patterns: SurfacesTxt2Yaml.SurfaceAnimationPattern[];
    regions: SurfacesTxt2Yaml.SurfaceRegion[];
}
export interface SurfaceElement {
    canvas: SurfaceCanvas;
    type: string;
    x: number;
    y: number;
}
