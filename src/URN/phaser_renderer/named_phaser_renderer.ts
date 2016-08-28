import {NamedRenderer} from "../renderer/named_renderer";
import {Named} from "../named";
import {PhaserRendererBase} from "./phaser_renderer_base";
import {ScopePhaserRenderer} from "./scope_phaser_renderer";

export class NamedPhaserRenderer extends PhaserRendererBase implements NamedRenderer {
    model: Named;

    attachModel(model: Named) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("Named");
            this.element.classList.add("PhaserNamed");
            this.element.classList.add(`Named-${this.model.id}`);
        }
    }

    createChildRenderer() {
        const childLayer = super._createChildLayer();
        return new ScopePhaserRenderer(childLayer);
    }

    removeChildRenderer(renderer: ScopePhaserRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("Named");
            this.element.classList.remove("PhaserNamed");
            this.element.classList.remove(`Named-${this.model.id}`);
        }
        super.detachModel();
    }

    setPriority(priority: number[]) {
    }
}