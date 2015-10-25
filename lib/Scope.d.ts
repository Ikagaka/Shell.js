/// <reference path="../typings/tsd.d.ts"/>

import {Shell, Surface} from "ikagaka.shell.js";
import {Balloon, Blimp} from "ikagaka.balloon.js";
import {Named} from "./Named";

export declare class Scope {
  public element: HTMLElement;
  private currentSurface: Surface;
  private currentBlimp: Blimp;
  public scopeId: number;
  public type: string; // sakura|kero

  constructor(scopeId: number, shell: Shell, balloon: Balloon, named: Named);
  public destructor(): void;
  public surface(): Surface;
  public surface(surfaceId: number): Surface;
  public surface(surfaceAlias: string): Surface;
  public blimp(blimpId?: number): Blimp;
}
