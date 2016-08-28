import {Attachable} from "./attachable";
import {NamedManagerRenderer} from "./renderer/named_manager_renderer";
import {ShellData} from "./shell_data";
import {BalloonData} from "./balloon_data";
import {ShellProfile} from "./shell_profile";
import {BalloonProfile} from "./balloon_profile";
import {Named} from "./named";

export class NamedManager implements Attachable {
    renderer: NamedManagerRenderer;

    protected _nameds: {[id: number]: Named} = {};
    protected _namedPriority: number[] = [];

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

    materialize(
        shellData: ShellData,
        balloonData: BalloonData,
        shellProfile?: ShellProfile,
        balloonProfile?: BalloonProfile,
        priority = true
    ) {
        const id = this._new_namedID();
        const childRenderer = this.renderer ? this.renderer.createChildRenderer() : undefined;
        const named = new Named(id, shellData, balloonData, shellProfile, balloonProfile, this, childRenderer);
        this._nameds[id] = named;
        if (priority) this.selectNamed(id);
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

    selectNamed(id: number) {
        if (this.topPriorityNamedId !== id) {
            const oldIndex = this._namedPriority.indexOf(id);
            if (oldIndex !== -1) this._namedPriority.splice(oldIndex, 1);
            this._namedPriority.push(id);
        }
        if (this.renderer) this.renderer.setPriority(this.namedPriority);
    }

    get namedPriority() {
        return this._namedPriority;
    }

    get topPriorityNamedId() {
        return this._namedPriority[this._namedPriority.length - 1];
    }

    private _new_namedID() {
        return ++this._namedID;
    }
}
