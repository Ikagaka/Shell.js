import {ShellSurfaceRenderer} from "../renderer/shell_surface_renderer";
import {ShellSurface} from "../shell_surface";
import {DOMRendererBase} from "./dom_renderer_base";

export class ShellSurfaceDOMRenderer extends DOMRendererBase implements ShellSurfaceRenderer {
    model: ShellSurface;

    attachModel(model: ShellSurface) {
        super.attachModel(model);
        this.element.classList.add("ShellSurface");
        this.element.classList.add(`ShellSurface-${this.model.id}`);
    }

    detachModel() {
        this.element.classList.remove("ShellSurface");
        this.element.classList.remove(`ShellSurface-${this.model.id}`);
        super.detachModel();
    }
}
