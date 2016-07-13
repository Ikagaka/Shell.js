import {ScopeShellRenderer} from "../renderer/scope_shell_renderer";
import {ScopeShell} from "../scope_shell";
import {DOMRendererBase} from "./dom_renderer_base";

export class ScopeShellDOMRenderer extends DOMRendererBase implements ScopeShellRenderer {
    model: ScopeShell;

    attachModel(model: ScopeShell) {
        super.attachModel(model);
        this.element.classList.add("ScopeShell");
        this.element.classList.add(`ScopeShell-${this.model.id}`);
    }

    detachModel() {
        this.element.classList.remove("ScopeShell");
        this.element.classList.remove(`ScopeShell-${this.model.id}`);
        super.detachModel();
    }
}
