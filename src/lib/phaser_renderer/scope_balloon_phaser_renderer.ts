import {ScopeBalloonRenderer} from "../renderer/scope_balloon_renderer";
import {ScopeBalloon} from "../scope_balloon";
import {PhaserRendererBase} from "./phaser_renderer_base";

export class ScopeBalloonPhaserRenderer extends PhaserRendererBase implements ScopeBalloonRenderer {
    model: ScopeBalloon;

    attachModel(model: ScopeBalloon) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("ScopeBalloon");
            this.element.classList.add("PhaserScopeBalloon");
            this.element.classList.add(`ScopeBalloon-${this.model.id}`);
        }
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("ScopeBalloon");
            this.element.classList.remove("PhaserScopeBalloon");
            this.element.classList.remove(`ScopeBalloon-${this.model.id}`);
        }
        super.detachModel();
    }
}
