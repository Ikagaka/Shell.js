/// <reference path="../typings/tsd.d.ts"/>

import {Shell} from "ikagaka.shell.js";
import {Balloon} from "ikagaka.balloon.js";
import {Named} from "./Named";

export declare class NamedManager extends EventEmitter2 {
  public element: HTMLElement;
  public namedies: Named[];

  constructor();
  public load(): Promise<NamedManager>;
  public unload(): void;
  public materialize(shell: Shell, balloon: Balloon): number;
  public vanish(namedId: number): void;
  public named(namedId: number): Named;
}
