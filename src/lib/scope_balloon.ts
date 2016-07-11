import {Attachable} from './attachable';
import {Position} from './position';
import {BalloonData} from './balloon_data';
import {BalloonProfile} from './balloon_profile';
import {Scope} from './scope';

export class ScopeBalloon implements Attachable {
    id: number;
    data: BalloonData;
    profile: BalloonProfile;
    position: Position;
    parent: Scope;
    element: Element;

    constructor(id: number, data: BalloonData, profile?: BalloonProfile, parent?: Scope, element?: Element) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.position = this.profile.position;
        this.parent = parent;
        if (element) this.attachTo(element);
    }

    attachTo(element: Element) {
        this.element = element;
        this.element.classList.add("ScopeBalloon");
        this.element.classList.add(`ScopeBalloon-${this.id}`);
    }

    detach() {
        this.element.classList.remove("ScopeBalloon");
        this.element.classList.remove(`ScopeBalloon-${this.id}`);
        delete this.element;
    }
}
