import {Attachable} from "./attachable";

export interface Renderer {
    model: Attachable;
    destroy(): void;
}
