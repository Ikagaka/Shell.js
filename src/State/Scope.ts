/*
 * Scope 状態モデルを更新する副作用関数群
 */

import * as Util from "../Util/index";

import {SurfaceDrawEvent} from "../Component/Scope";

import {Canvas} from "../Model/Canvas";
import {Shell} from "../Model/Shell";
import {Scope} from "../Model/Scope";
import {Surface} from "../Model/Surface";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";

import * as SBR from "../Renderer/BaseSurface";
import * as SPR from "../Renderer/Pattern";

import {SurfaceState, MoveEvent} from "./Surface";

import {EventEmitter} from "events";

export class ScopeState extends EventEmitter {
  scope: Scope;

  position: {x: number, y: number};
  basepos:  {x: number, y: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";

  shell: Shell;
  surface: Surface
  surfaceState: SurfaceState;

  baseCache: SBR.SurfaceBaseRenderer;
  rndr: SPR.SurfacePatternRenderer;

  constructor(scope: Scope, shell: Shell, baseCache: SBR.SurfaceBaseRenderer) {
    super();
    this.scope = scope;
    this.position = scope.position;
    this.basepos  = scope.basepos;
    this.alignmenttodesktop = scope.alignmenttodesktop;
    this.shell = shell;
    this.surface = scope.surface;
    this.surfaceState = new SurfaceState(scope.surface, shell, (surface)=> this.rndr.render(surface));
    
    //this.surfaceState.debug = true;
    
    this.baseCache = baseCache;
    this.rndr = new SPR.SurfacePatternRenderer(this.baseCache);

    
    this.on("onSurfaceDraw", (ev: SurfaceDrawEvent)=>{
      // Real DOM が 更新された
      // React が再描画しろと言っている
      this.attachCanvas(new Canvas(ev.canvas));
    });
  }

  move(x: number, y: number, ms: number): Promise<void>
  /*
  move(x: number, y: number, ms: number, args: {                 scopeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {ghostId: number, scioeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "screen",                  x: "left"|"right"|"center",        y: "top"|"bottom"|"center"       }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "me",                      x: "left"|"right"|"base"|"center", y: "top"|"bottom"|"base"|"center"}): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "primaryscreen"|"global",  x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  */
  move(x: number, y: number, ms: number, ...args: any[]): Promise<void>
  {
    // setTimeout とかで pos 動かす
    // alignmenttodesktop にも注意
    const {position, scope, alignmenttodesktop} = this;
    const destinationX = (position.x+x);
    const destinationY = (position.y+y);
    const stopTime = Date.now() + ms;
    const freeX = true; // 通常どちらもフリー
    const freeY = true; // 通常どちらもフリー
    
    let recur = (): Promise<void>=>{
      return new Promise<void>((resolve, reject)=>{
        if(Date.now() - stopTime > 0){
          return resolve();
        }else{
          return new Promise<void>((resolve, reject)=>{
            setTimeout(()=>{
              const remainX = destinationX - position.x;
              const remainY = destinationY - position.y;
              const remainT = stopTime - Date.now();
              const deltaX = remainX/remainT | 0;
              const deltaY = remainY/remainT | 0;
              if(freeX){ position.x += deltaX; }
              if(freeY){ position.y += deltaY; }
              this.emit("onUpdatePosition", { type: "onUpdatePosition", scope})
              resolve();
            }, 100);
          }).then(()=> recur().then(resolve) );
        }
      });
    };
    return recur();
  }

  moveCancel(){
  }

  attachCanvas(cnv: Canvas){
    this.rndr.attachCanvas(cnv);
    this.rndr.render(this.surface);
  }
  
}
