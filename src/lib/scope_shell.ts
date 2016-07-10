import {Attachable} from './attachable';
import {Position} from './position';
import {ShellData} from './shell_data';
import {Scope} from './scope';

export class ScopeShell implements Attachable {
    position: Position;
    shellData: ShellData;
    parent: Scope;
    element: Element;

    constructor(shellData: ShellData, position: Position = new Position(), parent?: Scope, element?: Element) {
        this.shellData = shellData;
        this.parent = parent;
        this.element = element;
    }

    attachTo(element: Element) {
        
    }

    detachFrom(element: Element) {
        
    }
}