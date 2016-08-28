import {Attachable} from "./attachable";
import {ScopeShellRenderer} from "./renderer/scope_shell_renderer";
import {ShellData} from "./shell_data";
import {ShellProfile} from "./shell_profile";
import {Scope} from "./scope";
import {ShellSurface} from "./shell_surface";

export class ScopeShell implements Attachable {
    readonly id: number;
    readonly data: ShellData;
    readonly profile: ShellProfile;
    readonly parent: Scope | undefined;
    renderer: ScopeShellRenderer;
    private _surface: ShellSurface;

    constructor(
        id: number,
        data: ShellData,
        profile: ShellProfile = new ShellProfile(),
        parent?: Scope,
        renderer?: ScopeShellRenderer
    ) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.parent = parent;
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: ScopeShellRenderer) {
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
            this._surface = new ShellSurface(<number>id, this.data, this.profile, this, childRenderer);
        }
    }

    get currentSurface() {
        return this._surface;
    }
}
