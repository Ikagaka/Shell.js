import {NamedManager} from "../named_manager";
import {NamedRenderer} from "./named_renderer";
import {Renderer} from "../renderer";

export interface NamedManagerRenderer extends Renderer {
    model: NamedManager;
    attachModel(model: NamedManager): void;
    createChildRenderer(): NamedRenderer;
    removeChildRenderer(renderer: NamedRenderer): void;
    detachModel(): void;
}
