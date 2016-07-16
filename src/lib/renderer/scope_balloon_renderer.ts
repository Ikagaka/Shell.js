import {ScopeBalloon} from "../scope_balloon";
import {BalloonSurfaceRenderer} from "./balloon_surface_renderer";
import {Renderer} from "../renderer";

export interface ScopeBalloonRenderer extends Renderer {
    model: ScopeBalloon;
    attachModel(model: ScopeBalloon): void;
    createChildRenderer(): BalloonSurfaceRenderer;
    removeChildRenderer(renderer: BalloonSurfaceRenderer): void;
    detachModel(): void;
}
