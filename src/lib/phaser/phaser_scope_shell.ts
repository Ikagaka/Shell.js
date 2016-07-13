import * as Phaser from "phaser";
import {ScopeShell} from "../scope_shell";

export class PhaserScopeShell extends ScopeShell {
    game: Phaser.Game;
    layer: Phaser.Group;

    attachTo(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
            this.element.classList.add("ScopeShell");
            this.element.classList.add("PhaserScopeShell");
            this.element.classList.add(`ScopeShell-${this.id}`);
            // TODO canvas size
            this.game = new Phaser.Game(
                800,
                600,
                Phaser.AUTO,
                this.element,
                {create: this._gameCreate.bind(this)},
                true,
                true
            );
        } else if (element instanceof Phaser.Game) {
            this.game = element;
            this._gameCreate();
        } else {
            this.layer = element;
            this._gameCreate();
        }
    }

    detach() {
    }

    private _gameCreate() {
    }
}
