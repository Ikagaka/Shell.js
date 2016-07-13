import {NamedManagerRenderer} from "../renderer/named_manager_renderer";
import {NamedManager} from "../named_manager";
import {DOMRendererBase} from "./dom_renderer_base";
import {NamedDOMRenderer} from "./named_dom_renderer";

export class NamedManagerDOMRenderer extends DOMRendererBase implements NamedManagerRenderer {
    model: NamedManager;

    attachModel(model: NamedManager) {
        super.attachModel(model);
        this.element.classList.add("NamedManager");
    }

    createChildRenderer() {
        const childElement = this._createChildElement();
        return new NamedDOMRenderer(childElement);
    }

    removeChildRenderer(renderer: NamedDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        this.element.classList.remove("NamedManager");
        super.detachModel();
    }
}