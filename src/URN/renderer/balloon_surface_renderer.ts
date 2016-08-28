import {BalloonSurface} from "../balloon_surface";
import {Renderer} from "../renderer";

export interface BalloonSurfaceRenderer extends Renderer {
    model: BalloonSurface;
    attachModel(model: BalloonSurface): void;
    detachModel(): void;
}
