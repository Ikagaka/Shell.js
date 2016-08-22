import * as SBR from "./SurfaceBaseRenderer";
import * as SH from "./ShellModel";
import * as SR from "./SurfaceRenderer";
import * as SM from "./SurfaceModel";
export declare class SurfacePatternRenderer extends SBR.SurfaceBaseRenderer {
    constructor(shell: SH.Shell);
    render(surface: SM.Surface): Promise<SR.SurfaceCanvas>;
    private convoluteTree(layer);
}
