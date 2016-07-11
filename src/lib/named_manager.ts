import {Attachable} from './attachable';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {ShellProfile} from './shell_profile';
import {BalloonProfile} from './balloon_profile';
import {Named} from './named';

export class NamedManager implements Attachable {
    element: Element;

    private _nameds: {[id: number]: Named} = {};

    private _named_id: number = 0;

    constructor(element?: Element) {
        if (element) this.attachTo(element);
    }

    attachTo(element: Element) {
        this.element = element;
        element.classList.add("NamedManager");
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            const childElement = this._createChildElement();
            named.attachTo(childElement);
        }
    }

    detach() {
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            this.element.removeChild(named.element);
            named.detach();
        }
        this.element.classList.remove("NamedManager");
        delete this.element;
    }

    private _createChildElement() {
        return this.element ? <Element>this.element.appendChild(document.createElement("div")) : null;
    }

    materialize(shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile) {
        const id = this._new_named_id();
        const childElement = this._createChildElement();
        const named = new Named(id, shellData, balloonData, shellProfile, balloonProfile, this, childElement);
        this._nameds[id] = named;
        return named;
    }

    private _childElement() {
        return 
    }

    vanish(id: number) {
        const named = this._nameds[id];
        named.vanish();
        delete this._nameds[id];
    }

    named(id: number) {
        return this._nameds[id];
    }

    private _new_named_id() {
        return ++this._named_id;
    }
}
