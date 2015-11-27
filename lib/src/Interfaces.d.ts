import SurfaceCanvas from "./SurfaceCanvas";
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
export interface SurfaceRegion {
    is: number;
    name: string;
    type: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
    radius: number;
    center_x: number;
    center_y: number;
    coordinates: {
        x: number;
        y: number;
    }[];
}
export interface SurfaceAnimation {
    is: number;
    interval: string;
    option: string;
    patterns: SurfaceAnimationPattern[];
}
export interface SurfaceAnimationPattern {
    animation_ids: number[];
    type: string;
    surface: number;
    wait: string;
    x: number;
    y: number;
}
export interface SurfaceTreeNode {
    base: HTMLCanvasElement;
    elements: SurfaceLayerObject[];
    collisions: SurfaceRegion[];
    animations: SurfaceAnimation[];
}
export interface SurfaceLayerObject {
    canvas: SurfaceCanvas;
    type: string;
    x: number;
    y: number;
}
