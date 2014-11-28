
declare class Named {
  constructor(shell: Shell, balloon: Balloon);
  destructor(): void;
  scope(scopeId?: number): Scope;
  openInputBox(id: string, placeHolder?: string): void;
  openCommunicateBox(placeHolder?: string): void;

  element: HTMLElement;
  scopes: Scope[];
}
