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
    parent: NamedManager;
    renderer: NamedRenderer;
    currentScopeId: number;

    protected _scopes: Scope[] = [];

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile, parent?: NamedManager, renderer?: NamedRenderer) {
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

    scope(id?: number) {
        if (id != null) {
            if (!this._scopes[id]) {
                const childRenderer = this.renderer.createChildRenderer();
                const scope = new Scope(id, this.shellData, this.balloonData, this.shellProfile, this.balloonProfile, this, childRenderer);
                this._scopes[id] = scope;
            }
            this.currentScopeId = id;
        }
        return this._scopes[this.currentScopeId];
    }
}
