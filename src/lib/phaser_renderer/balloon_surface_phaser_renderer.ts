import {BalloonSurfaceRenderer} from "../renderer/balloon_surface_renderer";
import {BalloonSurface} from "../balloon_surface";
import {PhaserRendererBase} from "./phaser_renderer_base";

export class BalloonSurfacePhaserRenderer extends PhaserRendererBase implements BalloonSurfaceRenderer {
    model: BalloonSurface;

    attachModel(model: BalloonSurface) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("BalloonSurface");
            this.element.classList.add("PhaserBalloonSurface");
            this.element.classList.add(`BalloonSurface-${this.model.id}`);
        }
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("BalloonSurface");
            this.element.classList.remove("PhaserBalloonSurface");
            this.element.classList.remove(`BalloonSurface-${this.model.id}`);
        }
        super.detachModel();
    }
}
