import * as _Surface from './Surface';
import * as _SurfaceRender from "./SurfaceRender";
import * as _SurfaceUtil from "./SurfaceUtil";
import * as _Shell from "./Shell";
export declare var Surface: typeof _Surface.Surface;
export declare var SurfaceRender: typeof _SurfaceRender.SurfaceRender;
export declare var SurfaceUtil: typeof _SurfaceUtil;
export declare var Shell: typeof _Shell.Shell;
export interface SurfaceTreeNode extends _Shell.SurfaceTreeNode {
}
export interface SurfaceMouseEvent extends _Surface.SurfaceMouseEvent {
}
export interface SurfaceLayerObject extends _SurfaceRender.SurfaceLayerObject {
}
