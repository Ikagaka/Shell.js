import * as SC from "./ShellConfig";
import * as ST from "./SurfaceTree";
import * as SY from "surfaces_txt2yaml";
export declare type Directory = {
    [filepath: string]: ArrayBuffer;
};
export declare function load(directory: Directory): Promise<void>;
export declare function loadDescript(directory: Directory): Promise<{
    descript: SC.Descript;
    descriptJSON: SC.JSONLike;
    config: SC.ShellConfig;
}>;
export declare function loadSurfacesTxt(directory: Directory): Promise<{
    surfacesTxt: SY.SurfacesTxt;
    surfaceDefTree: ST.SurfaceDefinitionTree;
}>;
export declare function loadSurfaceTable(directory: Directory): Promise<void>;
export declare function loadSurfacePNG(directory: Directory, tree: ST.SurfaceDefinitionTree): Promise<ST.SurfaceDefinitionTree>;
