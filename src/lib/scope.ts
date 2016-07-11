import {Attachable} from './attachable';
import {Position} from './position';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {ShellProfile} from './shell_profile';
import {BalloonProfile} from './balloon_profile';
import {Named} from './named';
import {ScopeShell} from './scope_shell';
import {ScopeBalloon} from './scope_balloon';

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
    element: Element;

    constructor(id: number, shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile, parent?: Named, element?: Element) {
        this.id = id;
        this.shellData = shellData;
        this.balloonData = balloonData;
        this.shellProfile = shellProfile;
        this.balloonProfile = balloonProfile;
        this.position = this.shellProfile.position;
        this.parent = parent;
        this.shell = new ScopeShell(this.id, this.shellData, this.shellProfile, this, this.element);
        this.balloon = new ScopeBalloon(this.id, this.balloonData, this.balloonProfile, this, this.element);
        if (element) this.attachTo(element);
    }

    attachTo(element: Element) {
        this.element = element;
        this.element.classList.add("Scope");
        this.element.classList.add(`Scope-${this.id}`);
        const shellElement = document.createElement("div");
        this.element.appendChild(shellElement);
        this.shell.attachTo(shellElement);
        // balloonのほうが上側
        const balloonElement = document.createElement("div");
        this.element.appendChild(balloonElement);
        this.balloon.attachTo(balloonElement);
    }

    detach() {
        this.element.removeChild(this.shell.element);
        this.shell.detach();
        this.element.removeChild(this.balloon.element);
        this.balloon.detach();
        this.element.classList.remove("Scope");
        this.element.classList.remove(`Scope-${this.id}`);
        delete this.element;
    }
}
