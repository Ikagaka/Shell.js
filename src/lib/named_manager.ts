import {Attachable} from "./attachable";
import {NamedManagerRenderer} from './renderer/named_manager_renderer';
import {ShellData} from "./shell_data";
import {BalloonData} from "./balloon_data";
import {ShellProfile} from "./shell_profile";
import {BalloonProfile} from "./balloon_profile";
import {Named} from "./named";

export class NamedManager implements Attachable {
    renderer: NamedManagerRenderer;

    protected _nameds: {[id: number]: Named} = {};

    protected _namedID: number = 0;

    constructor(renderer?: NamedManagerRenderer) {
        if (renderer) this.attachTo(renderer);
    }

    attachTo(renderer: NamedManagerRenderer) {
        this.renderer = renderer;
        this.renderer.attachModel(this);
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            const childRenderer = this.renderer.createChildRenderer();
            named.attachTo(childRenderer);
        }
    }

    detach() {
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            const childRenderer = named.renderer;
            named.detach();
            this.renderer.removeChildRenderer(childRenderer);
        }
        this.renderer.detachModel();
        delete this.renderer;
    }

    materialize(shellData: ShellData, balloonData: BalloonData, shellProfile?: ShellProfile, balloonProfile?: BalloonProfile) {
        const id = this._new_namedID();
        const childRenderer = this.renderer.createChildRenderer();
        const named = new Named(id, shellData, balloonData, shellProfile, balloonProfile, this, childRenderer);
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

    private _new_namedID() {
        return ++this._namedID;
    }
}
