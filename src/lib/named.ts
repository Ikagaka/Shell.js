import {Attachable} from './attachable';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {ShellProfile} from './shell_profile';
import {BalloonProfile} from './balloon_profile';
import {NamedManager} from './named_manager';
import {Scope} from './scope';

export class Named implements Attachable {
    id: number;
    shellData: ShellData;
    balloonData: BalloonData;
    shellProfile: ShellProfile;
    balloonProfile: BalloonProfile;
    parent: NamedManager;
    element: Element;
    currentScopeId: number;

    private _scopes: Scope[] = [];

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile, parent?: NamedManager, element?: Element) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.shellProfile = shellProfile;
        this.balloonProfile = balloonProfile;
        this.parent = parent;
        if (element) this.attachTo(element);
    }

    attachTo(element: Element) {
        this.element = element;
        this.element.classList.add("Named");
        this.element.classList.add(`Named-${this.id}`);
        for (const scope of this._scopes) {
            const childElement = this._createChildElement();
            scope.attachTo(childElement);
        }
    }

    detach() {
        for (const scope of this._scopes) {
            this.element.removeChild(scope.element);
            scope.detach();
        }
        this.element.classList.remove("Named");
        this.element.classList.remove(`Named-${this.id}`);
        delete this.element;
    }

    private _createChildElement() {
        return this.element ? <Element>this.element.appendChild(document.createElement("div")) : null;
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
                const childElement = this._createChildElement();
                const scope = new Scope(id, this.shellData, this.balloonData, this.shellProfile, this.balloonProfile, this, childElement);
                this._scopes[id] = scope;
            }
            this.currentScopeId = id;
        }
        return this._scopes[this.currentScopeId];
    }
}
