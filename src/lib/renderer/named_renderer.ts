import {Named} from "../named";
import {ScopeRenderer} from "./scope_renderer";
import {Renderer} from "../renderer";

export interface NamedRenderer extends Renderer {
    model: Named;
    attachModel(model: Named): void;
    createChildRenderer(): ScopeRenderer;
    removeChildRenderer(renderer: ScopeRenderer): void;
    detachModel(): void;
}
