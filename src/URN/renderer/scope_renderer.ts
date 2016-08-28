import {Scope} from "../scope";
import {ScopeShellRenderer} from "./scope_shell_renderer";
import {ScopeBalloonRenderer} from "./scope_balloon_renderer";
import {Renderer} from "../renderer";

export interface ScopeRenderer extends Renderer {
    model: Scope;
    attachModel(model: Scope): void;
    createChildShellRenderer(): ScopeShellRenderer;
    removeChildShellRenderer(renderer: ScopeShellRenderer): void;
    createChildBalloonRenderer(): ScopeBalloonRenderer;
    removeChildBalloonRenderer(renderer: ScopeBalloonRenderer): void;
    detachModel(): void;
}
