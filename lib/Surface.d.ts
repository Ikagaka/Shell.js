/// <reference path="../typings/index.d.ts" />
import * as ST from "./SurfaceTree";
import * as EventEmitter from "events";
export default class Surface extends EventEmitter.EventEmitter {
    element: HTMLDivElement;
    scopeId: number;
    surfaceId: number;
    position: string;
    enableRegionDraw: boolean;
    private cnv;
    private ctx;
    private surfaceNode;
    private backgrounds;
    private layers;
    private exclusives;
    private talkCount;
    private talkCounts;
    private animationsQueue;
    private stopFlags;
    private surfaceTree;
    private surfaceDefTree;
    private bindgroup;
    private dynamicBase;
    private destructed;
    private destructors;
    private bufferRender;
    constructor(div: HTMLDivElement, scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, bindgroup: {
        [charId: number]: {
            [bindgroupId: number]: boolean;
        };
    });
    destructor(): void;
    private initDOMStructure();
    private initAnimation(animId, anim);
    private initBind(animId, anim);
    updateBind(): void;
    begin(animationId: number): void;
    end(animationId: number): void;
    endAll(): void;
    play(animationId: number, callback?: Function): void;
    stop(animationId: number): void;
    talk(): void;
    yenE(): void;
    private isBind(animId);
    private composeAnimationPatterns(layers, interval?);
    render(): void;
    getSurfaceSize(): {
        width: number;
        height: number;
    };
    private initMouseEvent();
    private processMouseEvent(ev, type);
}
