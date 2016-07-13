import {Attachable} from "./attachable";
import {ScopeShellRenderer} from "./renderer/scope_shell_renderer";
import {ShellData} from "./shell_data";
import {ShellProfile} from "./shell_profile";
import {Scope} from "./scope";

export class ScopeShell implements Attachable {
    id: number;
    data: ShellData;
    profile: ShellProfile;
    parent: Scope;
    renderer: ScopeShellRenderer;

    constructor(id: number, data: ShellData, profile?: ShellProfile, parent?: Scope, renderer?: ScopeShellRenderer) {
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
}
