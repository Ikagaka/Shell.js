import * as Phaser from "phaser";
import {ScopeBalloon} from "../scope_balloon";

export class PhaserScopeBalloon extends ScopeBalloon {
    game: Phaser.Game;
    layer: Phaser.Group;

    attachTo(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
            this.element.classList.add("ScopeBalloon");
            this.element.classList.add("PhaserScopeBalloon");
            this.element.classList.add(`ScopeBalloon-${this.id}`);
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
