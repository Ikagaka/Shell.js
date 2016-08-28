import {Attachable} from "../attachable";
import {Renderer} from "../renderer";

export class DOMRendererBase implements Renderer {
    model: Attachable;

    constructor(public element: Element) {
    }

    attachModel(model: Attachable) {
        this.model = model;
    }

    removeChildRenderer(renderer: DOMRendererBase) {
        const element = renderer.element;
        renderer.destroy();
        this.element.removeChild(element);
    }

    detachModel() {
        delete this.model;
    }

    destroy() {
        delete this.element;
    }

    protected _createChildElement() {
        return <Element>this.element.appendChild(document.createElement("div"));
    }
}
