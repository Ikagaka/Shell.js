import {Attachable} from './attachable';
import {ShellData} from './shell_data';
import {BalloonData} from './balloon_data';
import {Named} from './named';

export class NamedManager implements Attachable {
    element: Element;

    private _nameds: {[id: number]: Named} = {};

    private _named_id: number = 0;

    constructor(element?: Element) {

    }

    attachTo(element: Element) {
        
    }

    detachFrom(element: Element) {
        
    }

    materialize(shellData: ShellData, balloonData: BalloonData) {
        const id = this._new_named_id();
        const named = new Named(id, shellData, balloonData, this);
        this._nameds[id] = named;
        return named;
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
