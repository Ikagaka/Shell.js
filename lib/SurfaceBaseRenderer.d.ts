import * as SR from "./SurfaceRenderer";
import * as CC from "./CanvasCache";
import * as SH from "./ShellModel";
export declare class SurfaceBaseRenderer {
    cache: CC.CanvasCache;
    bases: SR.SurfaceCanvas[];
    shell: SH.Shell;
    renderer: SR.SurfaceRenderer;
    constructor(shell: SH.Shell);
    getBaseSurface(n: number): Promise<SR.SurfaceCanvas>;
    getBaseSurfaceSize(n: number): Promise<{
        width: number;
        height: number;
    }>;
}
