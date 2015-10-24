/// <reference path="../typings/tsd.d.ts"/>

import {Shell} from "ikagaka.shell.js";
import {Balloon} from "ikagaka.balloon.js";
import {Scope} from "./Scope";
import {NamedManager} from "./NamedManager";

export declare class Named extends EventEmitter2 {
  public namedId: number;
  public element: HTMLElement;
  public scopes: Scope[];
  private currentScope: Scope;

  constructor(namedId: number, shell: Shell, balloon: Balloon, nmdmgr: NamedManager);
  public load(): Promise<Named>;
  public unload(): void;
  public scope(scopeId?: number): Scope;
  public openInputBox(id: string, placeHolder?: string): void;
  public openCommunicateBox(placeHolder?: string): void;
}
