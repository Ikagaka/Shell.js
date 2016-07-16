import {Attachable} from "./attachable";
import {ScopeBalloonRenderer} from "./renderer/scope_balloon_renderer";
import {Position} from "./position";
import {BalloonData} from "./balloon_data";
import {BalloonProfile} from "./balloon_profile";
import {Scope} from "./scope";
import {BalloonSurface} from "./balloon_surface";

export class ScopeBalloon implements Attachable {
    id: number;
    data: BalloonData;
    profile: BalloonProfile;
    position: Position;
    parent: Scope | undefined;
    renderer: ScopeBalloonRenderer;
    private _surface: BalloonSurface;

    constructor(
        id: number,
        data: BalloonData,
        profile: BalloonProfile = new BalloonProfile(),
        parent?: Scope,
        renderer?: ScopeBalloonRenderer
    ) {
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

    setSurface(idLike: number | string) {
        const id = (typeof idLike !== "number" || <any>idLike instanceof String) ? this.data.alias[idLike] : idLike;
        if (this._surface && this._surface.id !== id) {
            this._surface.detach();
            delete this._surface;
        }
        if (!this._surface) {
            this.data.surface(id);
            const childRenderer = this.renderer ? this.renderer.createChildRenderer() : undefined;
            this._surface = new BalloonSurface(<number>id, this.data, this.profile, this, childRenderer);
        }
    }

    get currentSurface() {
        return this._surface;
    }
}
