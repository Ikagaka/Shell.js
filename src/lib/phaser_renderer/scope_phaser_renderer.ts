import {ScopeRenderer} from "../renderer/scope_renderer";
import {Scope} from "../scope";
import {PhaserRendererBase} from "./phaser_renderer_base";
import {ScopeShellPhaserRenderer} from "./scope_shell_phaser_renderer";
import {ScopeBalloonPhaserRenderer} from "./scope_balloon_phaser_renderer";

export class ScopePhaserRenderer extends PhaserRendererBase implements ScopeRenderer {
    model: Scope;

    attachModel(model: Scope) {
        super.attachModel(model);
        if (this.element) {
            this.element.classList.add("Scope");
            this.element.classList.add("PhaserScope");
            this.element.classList.add(`Scope-${this.model.id}`);
        }
    }

    createChildShellRenderer() {
        const childLayer = super._createChildLayer();
        return new ScopeShellPhaserRenderer(childLayer);
    }

    removeChildShellRenderer(renderer: ScopeShellPhaserRenderer) {
        super.removeChildRenderer(renderer);
    }

    createChildBalloonRenderer() {
        const childLayer = super._createChildLayer();
        return new ScopeBalloonPhaserRenderer(childLayer);
    }

    removeChildBalloonRenderer(renderer: ScopeBalloonPhaserRenderer) {
        super.removeChildRenderer(renderer);
    }

    detachModel() {
        if (this.element) {
            this.element.classList.remove("Scope");
            this.element.classList.remove("PhaserScope");
            this.element.classList.remove(`Scope-${this.model.id}`);
        }
        super.detachModel();
    }
}
