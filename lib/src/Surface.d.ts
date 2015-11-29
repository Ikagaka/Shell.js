/// <reference path="../../typings/tsd.d.ts" />
import { SurfaceTreeNode } from "./Interfaces";
import EventEmitter from "eventemitter3";
export default class Surface extends EventEmitter {
    element: HTMLCanvasElement;
    scopeId: number;
    surfaceId: number;
    position: string;
    width: number;
    height: number;
    enableRegionDraw: boolean;
    private ctx;
    private surfaceNode;
    private bufferCanvas;
    private backgrounds;
    private layers;
    private talkCount;
    private talkCounts;
    private animationsQueue;
    private stopFlags;
    private surfaceTree;
    private destructed;
    private destructors;
    constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, surfaceTree: {
        [animationId: number]: SurfaceTreeNode;
    });
    destructor(): void;
    private initMouseEvent();
    private initAnimation(anim);
    private initBind(anim);
    begin(animationId: number): void;
    end(animationId: number): void;
    endAll(): void;
    play(animationId: number, callback?: Function): void;
    stop(animationId: number): void;
    talk(): void;
    yenE(): void;
    private composeAnimationPatterns(layers);
    render(): void;
}
