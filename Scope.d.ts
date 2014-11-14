
declare class Scope {
  constructor(shell: Shell, balloon: Balloon); // unstable
  surface(scopeId?: number, callback?: () => void)): Surface; // stable
  blimp(balloonId?: number, callback?: () => void): Blimp; // unstable
  element: HTMLElement;
  surface: Surface;
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
