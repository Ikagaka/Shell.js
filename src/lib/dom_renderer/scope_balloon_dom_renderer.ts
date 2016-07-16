import {ScopeBalloonRenderer} from "../renderer/scope_balloon_renderer";
import {ScopeBalloon} from "../scope_balloon";
import {DOMRendererBase} from "./dom_renderer_base";
import {BalloonSurfaceDOMRenderer} from "./balloon_surface_dom_renderer";

export class ScopeBalloonDOMRenderer extends DOMRendererBase implements ScopeBalloonRenderer {
    model: ScopeBalloon;

    attachModel(model: ScopeBalloon) {
        super.attachModel(model);
        this.element.classList.add("ScopeBalloon");
        this.element.classList.add(`ScopeBalloon-${this.model.id}`);
    }

    createChildRenderer() {
        const childElement = this._createChildElement();
        return new BalloonSurfaceDOMRenderer(childElement);
    }

    removeChildRenderer(renderer: BalloonSurfaceDOMRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        this.element.classList.remove("ScopeBalloon");
        this.element.classList.remove(`ScopeBalloon-${this.model.id}`);
        super.detachModel();
    }
}
