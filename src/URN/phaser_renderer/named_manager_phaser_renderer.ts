import {NamedManagerRenderer} from "../renderer/named_manager_renderer";
import {NamedManager} from "../named_manager";
import {PhaserRendererBase} from "./phaser_renderer_base";
import {NamedPhaserRenderer} from "./named_phaser_renderer";

export class NamedManagerPhaserRenderer extends PhaserRendererBase implements NamedManagerRenderer {
    model: NamedManager;

    attachModel(model: NamedManager) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("NamedManager");
            this.element.classList.add("PhaserNamedManager");
        }
    }

    createChildRenderer() {
        const childLayer = super._createChildLayer();
        return new NamedPhaserRenderer(childLayer);
    }

    removeChildRenderer(renderer: NamedPhaserRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("NamedManager");
            this.element.classList.remove("PhaserNamedManager");
        }
        super.detachModel();
    }

    setPriority(priority: number[]) {
    }
}
