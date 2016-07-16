import {ShellSurface} from "../shell_surface";
import {Renderer} from "../renderer";

export interface ShellSurfaceRenderer extends Renderer {
    model: ShellSurface;
    attachModel(model: ShellSurface): void;
    detachModel(): void;
}
