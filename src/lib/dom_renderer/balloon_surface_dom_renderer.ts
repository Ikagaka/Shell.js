import {BalloonSurfaceRenderer} from "../renderer/balloon_surface_renderer";
import {BalloonSurface} from "../balloon_surface";
import {DOMRendererBase} from "./dom_renderer_base";

export class BalloonSurfaceDOMRenderer extends DOMRendererBase implements BalloonSurfaceRenderer {
    model: BalloonSurface;

    attachModel(model: BalloonSurface) {
        super.attachModel(model);
        this.element.classList.add("BalloonSurface");
        this.element.classList.add(`BalloonSurface-${this.model.id}`);
    }

    detachModel() {
        this.element.classList.remove("BalloonSurface");
        this.element.classList.remove(`BalloonSurface-${this.model.id}`);
        super.detachModel();
    }
}
