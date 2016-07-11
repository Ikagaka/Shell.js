export interface Attachable {
    attachTo(element: Element): void;
    detach(): void;
    element: Element;
}
