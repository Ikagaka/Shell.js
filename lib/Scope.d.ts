/// <reference path="../typings/tsd.d.ts"/>

import {Shell, Surface} from "ikagaka.shell.js";
import {Balloon, Blimp} from "ikagaka.balloon.js";
import {Named} from "./Named";

export declare class Scope {
  element: HTMLElement;
  currentSurface: Surface;
  currentBlimp: Blimp;
  scopeId: number;
  type: string; // sakura|kero

  constructor(scopeId: number, shell: Shell, balloon: Balloon, named: Named);
  surface(): Surface;
  surface(surfaceId: number): Surface;
  surface(surfaceAlias: string): Surface;
  blimp(blimpId?: number): Blimp;
}
