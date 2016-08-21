import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import * as CC from "./CanvasCache";
import * as SY from "surfaces_txt2yaml";
export declare type Directory = {
    [filepath: string]: ArrayBuffer;
};
export declare class Shell {
    directory: Directory;
    cache: CC.CanvasCache;
    descript: SC.Descript;
    descriptJSON: SC.JSONLike;
    config: SC.ShellConfig;
    surfacesTxt: SY.SurfacesTxt;
    surfaceDefTree: ST.SurfaceDefinitionTree;
    constructor();
}
export declare function getSurfaceAlias(shell: Shell, scopeId: number, surfaceId: number | string): Promise<number>;
export declare function getBindGroups(shell: Shell, scopeId: number): Promise<{
    category: string;
    parts: string;
    thumbnail: string;
}[]>;
