import {NamedRenderer} from "../renderer/named_renderer";
import {Named} from "../named";
import {DOMRendererBase} from "./dom_renderer_base";
import {ScopeDOMRenderer} from "./scope_dom_renderer";

export class NamedDOMRenderer extends DOMRendererBase implements NamedRenderer {
    model: Named;

    attachModel(model: Named) {
        super.attachModel(model);
        this.element.classList.add("Named");
        this.element.classList.add(`Named-${this.model.id}`);
    }

    createChildRenderer() {
        const childElement = this._createChildElement();
        return new ScopeDOMRenderer(childElement);
    }

    removeChildRenderer(renderer: ScopeDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        this.element.classList.remove("Named");
        this.element.classList.remove(`Named-${this.model.id}`);
        super.detachModel();
    }
}
