export interface Attachable {
    attachTo(element: Element): void;
    detachFrom(element: Element): void;
    element: Element;
}
