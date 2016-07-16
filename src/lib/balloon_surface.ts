import {Attachable} from "./attachable";
import {BalloonSurfaceRenderer} from "./renderer/balloon_surface_renderer";
import {BalloonData} from "./balloon_data";
import {BalloonProfile} from "./balloon_profile";
import {ScopeBalloon} from "./scope_balloon";

export class BalloonSurface implements Attachable {
    readonly id: number;
    readonly data: BalloonData;
    readonly profile: BalloonProfile;
    readonly parent: ScopeBalloon | undefined;
    renderer: BalloonSurfaceRenderer;

    constructor(
        id: number,
        data: BalloonData,
        profile: BalloonProfile = new BalloonProfile(),
        parent?: ScopeBalloon,
        renderer?: BalloonSurfaceRenderer
    ) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.parent = parent;
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: BalloonSurfaceRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
    }

    detach() {
        this.renderer.detachModel();
        delete this.renderer;
    }
}
