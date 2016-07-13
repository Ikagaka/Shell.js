import {Renderer} from "./renderer";

export interface Attachable {
    renderer: Renderer;
    attachTo(renderer: Renderer): void;
    detach(): void;
}
