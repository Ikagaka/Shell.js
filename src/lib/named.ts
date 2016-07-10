import {Attachable} from './attachable';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {NamedManager} from './named_manager';
import {Scope} from './scope';

export class Named implements Attachable {
    id: number;
    shellData: ShellData;
    balloonData: BalloonData;
    parent: NamedManager;
    element: Element;
    currentScopeId: number;

    private _scopes: Scope[] = [];

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, parent?: NamedManager, element?: Element) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.parent = parent;
        this.element = element;
    }

    attachTo(element: Element) {
        
    }

    detachFrom(element: Element) {
        
    }

    vanish() {

    }

    changeShell(shellData: ShellData) {

    }

    changeBalloon(balloonData: BalloonData) {

    }

    scope(id?: number) {
        if (id != null) {
            if (!this._scopes[id]) {
                // TODO position
                const scope = new Scope(id, this.shellData, this.balloonData, null, this, this.element);
                this._scopes[id] = scope;
            }
            this.currentScopeId = id;
        }
        return this._scopes[this.currentScopeId];
    }
}