export interface Attachable {
    element: Element;
    attachTo(element: Element): void;
    detach(): void;
}
