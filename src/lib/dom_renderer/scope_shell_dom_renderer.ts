import {ScopeShellRenderer} from "../renderer/scope_shell_renderer";
import {ScopeShell} from "../scope_shell";
import {DOMRendererBase} from "./dom_renderer_base";
import {ShellSurfaceDOMRenderer} from "./shell_surface_dom_renderer";

export class ScopeShellDOMRenderer extends DOMRendererBase implements ScopeShellRenderer {
    model: ScopeShell;

    attachModel(model: ScopeShell) {
        super.attachModel(model);
        this.element.classList.add("ScopeShell");
        this.element.classList.add(`ScopeShell-${this.model.id}`);
    }

    createChildRenderer() {
        const childElement = this._createChildElement();
        return new ShellSurfaceDOMRenderer(childElement);
    }

    removeChildRenderer(renderer: ShellSurfaceDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        this.element.classList.remove("ScopeShell");
        this.element.classList.remove(`ScopeShell-${this.model.id}`);
        super.detachModel();
    }
}
