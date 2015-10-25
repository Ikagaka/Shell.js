/// <reference path="../typings/tsd.d.ts"/>

import { Balloon } from "./Balloon";

export declare class Blimp extends EventEmitter2 {
  public element: HTMLDivElement;
  public scopeId: number;
  public balloonId: number;
  public descript: {[key: string]: string};
  public balloon: Balloon;
  public type: string; // sakura|kero
  public isBalloonLeft: boolean;
  public destructed: boolean;
  public width: number;
  public height: number;

  constructor(element: HTMLDivElement, scopeId: number, balloonId: number, balloon: Balloon);
  destructor(): void;
  render(): void;
  location(x: string, y?: string): void;
  left(): void;
  right(): void;
  surface(balloonId: number): void;
  anchorBegin(id: string, ...args: string[]): void;
  anchorEnd(): void;
  choice(text: string, id: string, ...args: string[]): void;
  choiceBegin(id: string, ...args: string[]): void;
  choiceEnd(): void;
  br(ratio: number): void;
  talk(test: string): void;
  marker(): void;
  clear(): void;
  showWait(): void;
  font(name: string, ...values: string[]): void;

}