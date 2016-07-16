import {Attachable} from "./attachable";
import {NamedRenderer} from './renderer/named_renderer';
import {ShellData} from "./shell_data";
import {BalloonData} from "./balloon_data";
import {ShellProfile} from "./shell_profile";
import {BalloonProfile} from "./balloon_profile";
import {NamedManager} from "./named_manager";
import {Scope} from "./scope";

export class Named implements Attachable {
    id: number;
    shellData: ShellData;
    balloonData: BalloonData;
    shellProfile: ShellProfile;
    balloonProfile: BalloonProfile;
    parent: NamedManager | undefined;
    renderer: NamedRenderer;

    protected _scopes: Scope[] = [];
    protected _currentScopeId: number;
    protected _scopePriority: number[] = [];

    constructor(
        id: number,
        shellData: ShellData,
        balloonData: BalloonData,
        shellProfile: ShellProfile = new ShellProfile(),
        balloonProfile: BalloonProfile = new BalloonProfile(),
        parent?: NamedManager,
        renderer?: NamedRenderer
    ) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.shellProfile = shellProfile;
        this.balloonProfile = balloonProfile;
        this.parent = parent;
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: NamedRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
        for (const scope of this._scopes) {
            const childRenderer = this.renderer.createChildRenderer();
            scope.attachTo(childRenderer);
        }
    }

    detach() {
        for (const scope of this._scopes) {
            const childRenderer = scope.renderer;
            scope.detach();
            this.renderer.removeChildRenderer(childRenderer);
        }
        this.renderer.detachModel();
        delete this.renderer;
    }

    vanish() {

    }

    changeShell(shellData: ShellData) {

    }

    changeBalloon(balloonData: BalloonData) {

    }

    setScope(id: number) {
        if (!this._scopes[id]) this._createScope(id);
        this._setCurrentScopeId(id);
    }

    scope(id: number) {
        return this._scopes[id];
    }

    get currentScopeId() {
        return this._currentScopeId;
    }

    get currentScope() {
        return this._scopes[this._currentScopeId];
    }

    get scopePriority() {
        return this._scopePriority;
    }

    private _createScope(id: number) {
        const childRenderer = this.renderer ? this.renderer.createChildRenderer() : undefined;
        const scope = new Scope(id, this.shellData, this.balloonData, this.shellProfile, this.balloonProfile, this, childRenderer);
        this._scopes[id] = scope;
    }

    protected _setCurrentScopeId(id: number) {
        if (this._currentScopeId !== id) {
            this._currentScopeId = id;
            const oldIndex = this._scopePriority.indexOf(id);
            if (oldIndex !== -1) this._scopePriority.splice(oldIndex, 1);
            this._scopePriority.push(id);
        }
        if (this.renderer) this.renderer.setPriority(this.scopePriority);
    }
}
