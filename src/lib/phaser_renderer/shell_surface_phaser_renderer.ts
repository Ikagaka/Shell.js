import {ShellSurfaceRenderer} from "../renderer/shell_surface_renderer";
import {ShellSurface} from "../shell_surface";
import {PhaserRendererBase} from "./phaser_renderer_base";

export class ShellSurfacePhaserRenderer extends PhaserRendererBase implements ShellSurfaceRenderer {
    model: ShellSurface;

    attachModel(model: ShellSurface) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("ShellSurface");
            this.element.classList.add("PhaserShellSurface");
            this.element.classList.add(`ShellSurface-${this.model.id}`);
        }
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("ShellSurface");
            this.element.classList.remove("PhaserShellSurface");
            this.element.classList.remove(`ShellSurface-${this.model.id}`);
        }
        super.detachModel();
    }
}
