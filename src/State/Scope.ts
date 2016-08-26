/*
 * Scope 状態モデルを更新する副作用関数群
 */

import * as Util from "../Util/index";
import {Canvas} from "../Model/Canvas";
import {Shell} from "../Model/Shell";
import {Scope} from "../Model/Scope";
import {Surface} from "../Model/Surface";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";
import {SurfaceState} from "./Surface";
import {EventEmitter} from "events";

export class ScopeState extends EventEmitter {
  scope: Scope;

  position: {x: number, y: number};
  basepos:  {x: number, y: number};
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";

  shell: Shell;
  surface: Surface
  surfaceState: SurfaceState;

  constructor(scope: Scope, shell: Shell, renderer: (surface: Surface)=>Promise<Canvas>) {
    super();
    this.scope = scope;
    this.position = scope.position;
    this.basepos  = scope.basepos;
    this.alignmenttodesktop = scope.alignmenttodesktop;
    this.shell = shell;
    this.surface = scope.surface;
    this.surfaceState = new SurfaceState(scope.surface, shell, renderer, (x: number, y: number, wait: number)=> this.move(x, y, wait));
  }

  move(x: number, y: number, ms: number): Promise<void>
  move(x: number, y: number, ms: number, args: {                 scopeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {ghostId: number, scioeId: number, x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "screen",                  x: "left"|"right"|"center",        y: "top"|"bottom"|"center"       }): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "me",                      x: "left"|"right"|"base"|"center", y: "top"|"bottom"|"base"|"center"}): Promise<void>
  move(x: number, y: number, ms: number, args: {basis: "primaryscreen"|"global",  x: "left"|"base",                  y: "top"|"base"                  }): Promise<void>
  move(x: number, y: number, ms: number, ...args: any[]): Promise<void>{
    // setTimeout とかで pos 動かす
    // alignmenttodesktop にも注意
    return Promise.reject("not impl yet");
  }

  moveCancel(){}
}