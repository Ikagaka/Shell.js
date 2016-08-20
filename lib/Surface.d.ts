/// <reference path="../typings/index.d.ts" />
import * as CC from "./CanvasCache";
import * as ST from "./SurfaceTree";
import * as SC from "./ShellConfig";
import { EventEmitter } from "events";
export declare class Layer {
    background: boolean;
}
export declare class SerikoLayer extends Layer {
    patternID: number;
    timerID: any;
    paused: boolean;
    stop: boolean;
    exclusive: boolean;
    canceled: boolean;
    constructor(patternID: number, background?: boolean);
}
export declare class MayunaLayer extends Layer {
    visible: boolean;
    constructor(visible: boolean, background?: boolean);
}
export declare class Surface extends EventEmitter {
    element: HTMLDivElement;
    private ctx;
    private bufferRender;
    scopeId: number;
    surfaceId: number;
    private surfaceDefTree;
    private surfaceTree;
    private surfaceNode;
    private config;
    private cache;
    private layers;
    private talkCount;
    moveX: number;
    moveY: number;
    private destructed;
    private destructors;
    constructor(div: HTMLDivElement, scopeId: number, surfaceId: number, surfaceDefTree: ST.SurfaceDefinitionTree, config: SC.ShellConfig, cache: CC.CanvasCache);
    destructor(): void;
    private initDOMStructure();
    private initAnimation(animId);
    private setTimer(animId, interval, args);
    update(): void;
    begin(animationId: number): void;
    end(animationId: number): void;
    endAll(): void;
    play(animationId: number): Promise<void>;
    stop(animationId: number): void;
    talk(): void;
    yenE(): void;
    private isBind(animId);
    private composeBaseSurface(n);
    private solveAnimationPattern(n);
    private composeAnimationPart(n, log?);
    render(): void;
    getSurfaceSize(): {
        width: number;
        height: number;
    };
    private initMouseEvent();
    private processMouseEvent(ev, type);
}
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
