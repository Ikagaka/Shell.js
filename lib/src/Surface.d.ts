/// <reference path="../../typings/tsd.d.ts" />
import { Shell } from "./Shell";
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
export declare class Surface {
    element: HTMLCanvasElement;
    scopeId: number;
    surfaceId: number;
    shell: Shell;
    position: string;
    width: number;
    height: number;
    private surfaceNode;
    private bufferCanvas;
    private bufRender;
    private elmRender;
    private talkCount;
    private talkCounts;
    private animationsQueue;
    private backgrounds;
    private layers;
    private stopFlags;
    private destructed;
    private destructors;
    constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell);
    destructor(): void;
    private initMouseEvent();
    private initAnimation(anim);
    private initBind(anim);
    updateBind(): void;
    begin(animationId: number): void;
    end(animationId: number): void;
    endAll(): void;
    play(animationId: number, callback?: Function): void;
    stop(animationId: number): void;
    talk(): void;
    yenE(): void;
    render(): void;
}
