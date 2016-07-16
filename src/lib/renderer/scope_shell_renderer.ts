import {ScopeShell} from "../scope_shell";
import {ShellSurfaceRenderer} from "./shell_surface_renderer";
import {Renderer} from "../renderer";

export interface ScopeShellRenderer extends Renderer {
    model: ScopeShell;
    attachModel(model: ScopeShell): void;
    createChildRenderer(): ShellSurfaceRenderer;
    removeChildRenderer(renderer: ShellSurfaceRenderer): void;
    detachModel(): void;
}
