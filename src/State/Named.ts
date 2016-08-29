/*
 * Named 状態モデルを更新する
 */
import * as Util from "../Util/index";

//import {NamedMouseDownEvent} from "../Component/Named";
//import {SurfaceMouseDownEvent} from "../Component/Scope";

import {ContextMenuObject} from "../Model/ContextMenu";
import {Canvas} from "../Model/Canvas";
import {Shell} from "../Model/Shell";
import {Balloon} from "../Model/Balloon";
import {getAlignmenttodesktop} from "../Model/Config";
import {Scope} from "../Model/Scope";
import {Surface} from "../Model/Surface";
import {Named} from "../Model/Named";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";

import * as SBR from "../Renderer/BaseSurface";
import {ScopeRenderer} from "../Renderer/Scope";

import {ScopeState} from "./Scope";

import {EventEmitter} from "events";

// named model の window stack が更新された
export interface HoverEvent {
  type: "onHover";
  named: Named;
  scope: Scope;
}
// on(event: "mousedown", callback: (ev: SurfaceMouseEvent)=> void): void
// on(event: "mousemove", callback: (ev: SurfaceMouseEvent)=> void): void
// on(event: "mouseup", callback: (ev: SurfaceMouseEvent)=> void): void
// on(event: "mouseclick", callback: (ev: SurfaceMouseEvent)=> void): void
// on(event: "mousedblclick", callback: (ev: SurfaceMouseEvent)=> void): void
export interface SurfaceMouseEvent {
  type: string; // mousedown|mousemove|mouseup|mouseclick|mousedblclick のどれか
  transparency: boolean; // true
  button: number; // マウスのボタン。 https://developer.mozilla.org/ja/docs/Web/API/MouseEvent/button
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前,"Bust","Head","Face"など
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // mousewheel実装したら使われるかも
  event: UIEvent // 生のDOMイベント。 https://developer.mozilla.org/ja/docs/Web/API/UIEvent
}
// on(event: "balloonclick", callback: (ev: BalloonMouseEvent)=> void): void
// on(event: "balloondblclick", callback: (ev: BalloonMouseEvent)=> void): void
export interface BalloonMouseEvent {
  type: string; // click|dblclikck|mousemove|mouseup|mousedown
  scopeId: number; // \p[n]
  balloonId: number; // \b[n]
}
// on(event: "userinput", callback: (ev: BalloonInputEvent)=> void): void
// on(event: "communicateinput", callback: (ev: BalloonInputEvent)=> void): void
export interface BalloonInputEvent {
  type: string; //userinput|communicateinput
  id: string;
  content: string;
}
// on(event: "choiceselect", callback: (ev: BalloonSelectEvent)=> void): void
// on(event: "anchorselect", callback: (ev: BalloonSelectEvent)=> void): void
export interface BalloonSelectEvent {
  type: string; //anchorselect|choiceselect
  id: string;
  text: string;
  args: string[];
}
// on(event: "filedrop", callback: (ev: FileDropEvent)=> void): void
export interface FileDropEvent {
  type: string; //filedrop
  scopeId: number;
  event: UIEvent;
}
export interface ContextMenuEvent {
  type: string;
  scopeId: number;
  event: UIEvent;
}



export class NamedState extends EventEmitter {
  named: Named;
  scopeStates: ScopeState[]; // scopeId accsessor
  baseCache: SBR.SurfaceBaseRenderer;
  contextmenuHandler: (ev: ContextMenuEvent)=> ContextMenuObject;
  
  constructor(named: Named) {
    super();
    this.named = named;
    this.scopeStates = [];
    this.baseCache = new SBR.SurfaceBaseRenderer(this.named.shell);
    this.contextmenuHandler = (ev: ContextMenuEvent)=>(<ContextMenuObject>{});
  }

  destructor(){
    this.scopeStates.map((scopeState)=>{
      scopeState.destructor();
    });
  }

  scope(scopeId: number): Promise<ScopeState>{
    const {scopeStates, named} = this;
    const {scopes} = named;
    const scopeState = scopeStates[scopeId];
    if(scopeState instanceof ScopeState){
      return this.hover(scopeId).then(()=> scopeState);
    }else{
      return this.addScope(scopeId, 0);
    }
  }

  openInputBox(id: string, text=""): void {
    console.warn("Named#openInputBox: deplicated api");
    const event = {
      type: "userinput", id,
      content: prompt("UserInput", text)
    };
    this.emit("userinput", event);
  }

  openCommunicateBox(text=""): void {
    console.warn("Named#openCommunicateBox: deplicated api");
    const event = {
      type: "communicateinput",
      sender: "user",
      content: prompt("Communicate", text)
    };
    this.emit("communicateinput", event);
  }

  contextmenu(handler: (ev: ContextMenuEvent)=> ContextMenuObject){
    console.warn("Named#contextmenu: deplicated api");
    this.contextmenuHandler = handler;
  }

  changeShell(shell: Shell): Promise<void>{
    console.warn("Named#changeShell: deplicated api");
    const {balloon} = this.named;
    return this.reload(new Named(shell, balloon));
  }

  changeBalloon(balloon: Balloon): Promise<void>{
    console.warn("Named#changeBalloon: deplicated api");
    const {shell} = this.named;
    return this.reload(new Named(shell, balloon));
  }

  reload(named: Named): Promise<void>{
    console.warn("Named#reload: deplicated api");
    this.destructor();
    NamedState.call(this, named);
    return Promise.resolve();
  }

  hover(scopeId: number): Promise<void> {
    // stack 操作
    const {scopeStates, named} = this;
    const {scopes} = named;
    const scopeState = scopeStates[scopeId];
    if(scopeState instanceof ScopeState){
      // スタックの順番書き換え 
      const id = scopes.indexOf(scopeState.scope);
      const target = scopes.splice(id, 1)[0];
      scopes.unshift(target);
      this.emit("onHover", { type: "onHover", named, scope: target});
    }else{
      console.warn("NamedState#hover: undefined scopeid:", scopeId)
    }
    return Promise.resolve();
  }

  addScope(scopeId: number, surfaceId: number): Promise<ScopeState>{
    const {baseCache, scopeStates, named} = this;
    const {shell, balloon, scopes} = named;
    const {config}  = this.named.shell;
    if(scopeStates[scopeId] instanceof ScopeState){
      console.warn("NamedState#addScope: scopeId:", scopeId, " is already exist.");
      return Promise.reject("already exist");
    }
    const scope = new Scope(scopeId, surfaceId, getAlignmenttodesktop(config, scopeId));
    const scopeState = new ScopeState(scope, shell, balloon, baseCache, new ScopeRenderer());
    scopeStates[scopeId] = scopeState; // こっちは辞書
    scopes.push(scope); // こっちはスタック
    this.emit("onHover", { type: "onHover", named, scope});
    return Promise.resolve(scopeState);
  }

  findScopeStateFromScope(scope: Scope): ScopeState {
    const {scopeStates, named} = this;
    const {scopes} = named;
    const id = scopes.indexOf(scope);
    return scopeStates[id];
  }
}

