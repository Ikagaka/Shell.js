
declare class Scope {
  constructor(scopeId: number, shell: Shell, balloon: Balloon); // unstable
  surface(scopeId?: number, callback?: () => void)): Surface; // stable
  balloon(balloonId?: number, callback?: () => void): BalloonSurface; // unstable
  element: HTMLElement; // stable
  shell: Shell; // unstable
  balloon: Balloon; // unstable
}

declare module Scope {
}

declare module 'balloon' {
  var foo: typeof Balloon;
  module rsvp {
    export var Balloon: typeof foo;
  }
  export = rsvp;
}
