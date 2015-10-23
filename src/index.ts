
import * as _Surface from './Surface';
import * as _SurfaceRender from "./SurfaceRender";
import * as _SurfaceUtil from "./SurfaceUtil";
import * as _Shell from "./Shell";

export var Surface = _Surface.Surface;
export var SurfaceRender = _SurfaceRender.SurfaceRender;
export var SurfaceUtil = _SurfaceUtil;
export var Shell = _Shell.Shell;
export interface SurfaceTreeNode extends _Shell.SurfaceTreeNode {}
export interface SurfaceMouseEvent extends _Surface.SurfaceMouseEvent {}
export interface SurfaceLayerObject extends _SurfaceRender.SurfaceLayerObject {}
