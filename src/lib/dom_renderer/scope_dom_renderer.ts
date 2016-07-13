import {ScopeRenderer} from "../renderer/scope_renderer";
import {Scope} from "../scope";
import {DOMRendererBase} from "./dom_renderer_base";
import {ScopeShellDOMRenderer} from "./scope_shell_dom_renderer";
import {ScopeBalloonDOMRenderer} from "./scope_balloon_dom_renderer";

export class ScopeDOMRenderer extends DOMRendererBase implements ScopeRenderer {
    model: Scope;

    attachModel(model: Scope) {
        super.attachModel(model);
        this.element.classList.add("Scope");
        this.element.classList.add(`Scope-${this.model.id}`);
    }

    createChildShellRenderer() {
        const childElement = this._createChildElement();
        return new ScopeShellDOMRenderer(childElement);
    }

    removeChildShellRenderer(renderer: ScopeShellDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    createChildBalloonRenderer() {
        const childElement = this._createChildElement();
        return new ScopeBalloonDOMRenderer(childElement);
    }

    removeChildBalloonRenderer(renderer: ScopeBalloonDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        this.element.classList.remove("Scope");
        this.element.classList.remove(`Scope-${this.model.id}`);
        super.detachModel();
    }
}
