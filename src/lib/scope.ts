import {Attachable} from './attachable';
import {Position} from './position';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {Named} from './named';
import {ScopeShell} from './scope_shell';
import {ScopeBalloon} from './scope_balloon';

export class Scope implements Attachable {
    id: number;
    shell: ScopeShell;
    balloon: ScopeBalloon;
    shellData: ShellData;
    balloonData: BalloonData;
    position: Position;
    parent: Named;
    element: Element;

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, position: Position = new Position(), parent?: Named, element?: Element) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.position = position;
        this.parent = parent;
        this.element = element;
        this.shell = new ScopeShell(this.shellData, null, this, this.element);
        this.balloon = new ScopeBalloon(this.balloonData, null, this, this.element);
    }

    attachTo(element: Element) {
        
    }

    detachFrom(element: Element) {
        
    }
}