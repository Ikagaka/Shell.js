/// <reference path="../typings/index.d.ts" />
export declare type Descript = {
    [key: string]: string;
};
export declare type JSONLike = string | number | {
    [key: string]: JSONLike;
};
export declare class ShellConfig {
    seriko: SerikoConfig;
    menu: MenuConfig;
    char: CharConfig[];
    bindgroup: {
        [charId: number]: {
            [bindgroupId: number]: boolean;
        };
    };
    enableRegion: boolean;
    constructor();
    loadFromJSONLike(json: JSONLike): Promise<this>;
}
export declare class SerikoConfig {
    use_self_alpha: boolean;
    paint_transparent_region_black: boolean;
    alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";
    zorder: number[];
    stickyWindow: number[];
    constructor();
}
export declare class MenuConfig {
    value: boolean;
    constructor();
}
export declare class CharConfig {
    menu: "auto" | "hidden";
    menuitem: number[];
    defaultX: number;
    defaultY: number;
    defaultLeft: number;
    defaultTop: number;
    balloon: {
        offsetX: number;
        offsetY: number;
        alignment: "none" | "left" | "right";
    };
    seriko: {
        alignmenttodesktop: string;
    };
    bindgroup: BindGroupConfig[];
    constructor();
    loadFromJSONLike(char: JSONLike): Promise<this>;
}
export declare class BindGroupConfig {
    name: {
        category: string;
        parts: string;
        thumbnail: string;
    };
    default: boolean;
    addid: number[];
    constructor(category: string, parts: string, thumbnail?: string, _default?: boolean);
}
