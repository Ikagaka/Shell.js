import {Attachable} from "./attachable";
import {ScopeBalloonRenderer} from "./renderer/scope_balloon_renderer";
import {Position} from "./position";
import {BalloonData} from "./balloon_data";
import {BalloonProfile} from "./balloon_profile";
import {Scope} from "./scope";

export class ScopeBalloon implements Attachable {
    id: number;
    data: BalloonData;
    profile: BalloonProfile;
    position: Position;
    parent: Scope;
    renderer: ScopeBalloonRenderer;

    constructor(id: number, data: BalloonData, profile?: BalloonProfile, parent?: Scope, renderer?: ScopeBalloonRenderer) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.position = this.profile.position;
        this.parent = parent;
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: ScopeBalloonRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
    }

    detach() {
        this.renderer.detachModel();
        delete this.renderer;
    }
}
