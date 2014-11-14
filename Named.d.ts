
declare class Named {
  constructor(shell: Shell); // unstable
  scope(scopeId?: number): Scope; // stable
  element: HTMLElement; // stable
  currentScope: number; // unstable
  scopes: Scope[]; // unstable
  shell: Shell; // unstable
}

declare module Named {
}

declare module 'named' {
  var foo: typeof Named;
  module rsvp {
    export var Named: typeof foo;
  }
  export = rsvp;
}
