import {Attachable} from "./attachable";
import {ShellSurfaceRenderer} from "./renderer/shell_surface_renderer";
import {ShellData} from "./shell_data";
import {ShellProfile} from "./shell_profile";
import {ScopeShell} from "./scope_shell";

export class ShellSurface implements Attachable {
    readonly id: number;
    readonly data: ShellData;
    readonly profile: ShellProfile;
    readonly parent: ScopeShell | undefined;
    renderer: ShellSurfaceRenderer;

    constructor(
        id: number,
        data: ShellData,
        profile: ShellProfile = new ShellProfile(),
        parent?: ScopeShell,
        renderer?: ShellSurfaceRenderer
    ) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.parent = parent;
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: ShellSurfaceRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
    }

    detach() {
        this.renderer.detachModel();
        delete this.renderer;
    }
}
