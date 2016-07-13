import {ScopeShellRenderer} from "../renderer/scope_shell_renderer";
import {ScopeShell} from "../scope_shell";
import {PhaserRendererBase} from "./phaser_renderer_base";

export class ScopeShellPhaserRenderer extends PhaserRendererBase implements ScopeShellRenderer {
    model: ScopeShell;

    attachModel(model: ScopeShell) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("ScopeShell");
            this.element.classList.add("PhaserScopeShell");
            this.element.classList.add(`ScopeShell-${this.model.id}`);
        }
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("ScopeShell");
            this.element.classList.remove("PhaserScopeShell");
            this.element.classList.remove(`ScopeShell-${this.model.id}`);
        }
        super.detachModel();
    }
}
