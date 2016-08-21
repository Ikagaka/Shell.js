import * as SBR from "./SurfaceBaseRenderer";
import * as SH from "./ShellModel";
import * as SR from "./SurfaceRenderer";
import * as SM from "./SurfaceModel";
export declare class SurfacePatternRenderer extends SBR.SurfaceBaseRenderer {
    constructor(shell: SH.Shell);
    render(srf: SM.Surface): Promise<SR.SurfaceCanvas>;
}
export declare class SurfaceLayer {
    base: Layer;
    foregrounds: LayerSet[];
    backgrounds: LayerSet[];
}
export declare type LayerSet = Layer[];
export declare class Layer {
    type: string;
    layer: LayerSet;
    x: number;
    y: number;
}
