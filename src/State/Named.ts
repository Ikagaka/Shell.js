/*
 * Named 状態モデルを更新する
 */
import * as Util from "../Util/index";

import {NamedMouseDownEvent} from "../Component/Named";
import {SurfaceMouseDownEvent} from "../Component/Scope";

import {Canvas} from "../Model/Canvas";
import {Shell} from "../Model/Shell";
import {getAlignmenttodesktop} from "../Model/Config";
import {Scope} from "../Model/Scope";
import {Surface} from "../Model/Surface";
import {Named} from "../Model/Named";

import {ScopeState} from "../State/Scope";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";

import * as SBR from "../Renderer/BaseSurface";
import * as SPR from "../Renderer/Pattern";

import {SurfaceState} from "./Surface";

import {EventEmitter} from "events";

export class NamedState extends EventEmitter {
  named: Named;
  scopeStates: ScopeState[]; // scopeId accsessor
  baseCache: SBR.SurfaceBaseRenderer;

  
  constructor(named: Named) {
    super();
    this.named = named;
    this.scopeStates = [];
    this.baseCache = new SBR.SurfaceBaseRenderer(this.named.shell);
    this.on("onNamedMouseDown", (ev: NamedMouseDownEvent)=> console.info(ev) );
  }

  hover(scopeId: number): void{
    // stack 操作
    const {scopeStates, named} = this;
    const {scopes} = named;
    const scopeState = scopeStates[scopeId];
    if(scopeState instanceof ScopeState){ 
      const id = scopes.indexOf(scopeState.scope);
      const target = scopes.splice(id, 1)[0];
      scopes.unshift(target);
      this.emit("onHover", { type: "onHover" });
    }else{
      console.warn("NamedState#hover: undefined scopeid:", scopeId)
    }
  }

  addScope(scopeId: number, surfaceId: number): Promise<void>{
    const {baseCache, scopeStates, named} = this;
    const {shell, scopes} = named;
    const {config}  = this.named.shell;
    if(scopeStates[scopeId] instanceof ScopeState){
      console.warn("NamedState#addScope: scopeId:", scopeId, " is already exist.");
      return Promise.reject("already exist");
    }
    return baseCache.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      const scope = new Scope(scopeId, surfaceId, width, height, getAlignmenttodesktop(config, scopeId));
      const scopeState = new ScopeState(scope, shell, baseCache );
      scopeState.on("onSurfaceMouseDown", (ev: SurfaceMouseDownEvent)=>{
        this.hover(ev.scope.scopeId);
      });
      scopeStates[scopeId] = scopeState;
      scopes.push(scope);
      this.emit("onHover", { type: "onHover" });
    });
  }

  removeScope(scopeId: number) {
    throw new Error("not impl yet");
  }

  findScopeStateFromScope(scope: Scope): ScopeState {
    const {scopeStates, named} = this;
    const {scopes} = named;
    const id = scopes.indexOf(scope);
    return scopeStates[id];
  }
}


export interface HoverEvent {
  type: "onHover";
  named: Named;
}
