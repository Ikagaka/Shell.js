/*
 * Scope 状態モデルを更新する副作用関数群
 */

import * as Util from "../Util/index";

//import {SurfaceDrawEvent} from "../Component/Scope";

import {Canvas} from "../Model/Canvas";
import {Shell, getSurfaceAlias} from "../Model/Shell";
import {Balloon} from "../Model/Balloon";
import {Scope} from "../Model/Scope";
import {Surface} from "../Model/Surface";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";

import * as SBR from "../Renderer/BaseSurface";
import * as SPR from "../Renderer/Pattern";
import {ScopeRenderer} from "../Renderer/Scope";

import {SurfaceState, MoveEvent} from "./Surface";
import {BalloonSurfaceState} from "./BalloonSurface";

import {EventEmitter} from "events";

// \![move] でモデルが更新されたので実DOMに変化してほしい
export interface UpdatePositionEvent {
  type: "onUpdatePosition";
  scope: Scope;
}


export class ScopeState extends EventEmitter {
  scope: Scope;
  shell: Shell;
  surfaceState: SurfaceState;
  scopeRenderer: ScopeRenderer;
  baseCache: SBR.SurfaceBaseRenderer;

  constructor(scope: Scope, shell: Shell, nalloon: Balloon, baseCache: SBR.SurfaceBaseRenderer, scopeRenderer: ScopeRenderer) {
    super();
    this.scope = scope;
    this.shell = shell;
    this.baseCache = baseCache;
    this.surfaceState = new SurfaceState(scope.surface, shell, new SPR.SurfacePatternRenderer(baseCache));
    //this.surfaceState.debug = true;
    // debug したかったら 外からプロパティアクセスして
    this.scopeRenderer = scopeRenderer;
  }

  destructor(){
    this.surfaceState.destructor();
  }

  attachTo(scopeRenderer: ScopeRenderer): void {
    // 実 DOM への書き込み器と結びつける？
    this.scopeRenderer = scopeRenderer;
    const srfCnv = scopeRenderer.getSurfaceCanvas();
    this.surfaceState.rndr.attachCanvas(srfCnv);
  }

  render(): Promise<void> {
    return this.scopeRenderer.render(this.scope);
  }

  surface(surfaceId?: number|string): Promise<SurfaceState>{
    const {shell, scope, surfaceState} = this;
    const {scopeId, surface} = scope; 
    if(surfaceId != null){
      return getSurfaceAlias(shell, scopeId, surfaceId)
      .then((id)=>{
        if(id === surfaceId){
          return surfaceState;
        }
        const rndr = surfaceState.rndr;
        surfaceState.destructor();
        const srf = new Surface(scopeId, id);
        return this.surfaceState = new SurfaceState(srf, shell, rndr);
      });
    }else{
      return Promise.resolve(this.surfaceState);
    }
  }

  balloon(blimpId?: number): Promise<BalloonSurfaceState> {
    return Promise.resolve(new BalloonSurfaceState());
  }

  move(x: number, y: number, ms: number): Promise<void>
  move(x: number, y: number, ms: number, args: {                 scopeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {ghostId: number, scioeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "screen",                  x: "left"|"right"|"center",        y: "top"|"bottom"|"center"       }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "me",                      x: "left"|"right"|"base"|"center", y: "top"|"bottom"|"base"|"center"}): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "primaryscreen"|"global",  x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, ...args: any[]): Promise<void>
  {
    // me の実装しかしてない
    // setTimeout とかで pos 動かす
    // alignmenttodesktop にも注意
    const {scope} = this;
    const {position, alignmenttodesktop} = scope;
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
}
