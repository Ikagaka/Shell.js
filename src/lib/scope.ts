import {Attachable} from "./attachable";
import {ScopeRenderer} from "./renderer/scope_renderer";
import {Position} from "./position";
import {ShellData} from "./shell_data";
import {BalloonData} from "./balloon_data";
import {ShellProfile} from "./shell_profile";
import {BalloonProfile} from "./balloon_profile";
import {Named} from "./named";
import {ScopeShell} from "./scope_shell";
import {ScopeBalloon} from "./scope_balloon";

export class Scope implements Attachable {
    id: number;
    shell: ScopeShell;
    balloon: ScopeBalloon;
    shellData: ShellData;
    balloonData: BalloonData;
    shellProfile: ShellProfile;
    balloonProfile: BalloonProfile;
    position: Position;
    parent: Named;
    renderer: ScopeRenderer;

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile, parent?: Named, renderer?: ScopeRenderer) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.shellProfile = shellProfile;
        this.balloonProfile = balloonProfile;
        this.position = this.shellProfile.position;
        this.parent = parent;
        this.shell = new ScopeShell(this.id, this.shellData, this.shellProfile, this);
        this.balloon = new ScopeBalloon(this.id, this.balloonData, this.balloonProfile, this);
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: ScopeRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
        const shellRenderer = this.renderer.createChildShellRenderer();
        this.shell.attachTo(shellRenderer);
        // balloonのほうが上側
        const balloonRenderer = this.renderer.createChildBalloonRenderer();
        this.balloon.attachTo(balloonRenderer);
    }

    detach() {
        const shellRenderer = this.shell.renderer;
        this.shell.detach();
        this.renderer.removeChildShellRenderer(shellRenderer);
        const balloonRenderer = this.balloon.renderer;
        this.balloon.detach();
        this.renderer.removeChildBalloonRenderer(balloonRenderer);
        this.renderer.detachModel();
        delete this.renderer;
    }
}
