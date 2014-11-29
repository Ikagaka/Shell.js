
declare class Scope {
  constructor(scopeId: number, shell: Shell, balloon: Balloon);
  surface(surfaceId?: number, callback?: () => void)): Surface;
  blimp(blimpId?: number, callback?: () => void): {
    talk: (text: string) => void;
    clear: () => void;
    br: () => void;
    choice: (text: string, id: string) => void;
    anchorBegin: (id: string) => void;
    anchorEnd () => void;
  };
  element: HTMLElement;
}
