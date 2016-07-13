import * as Phaser from "phaser";
import {Named} from "../named";
import {PhaserScope} from "./phaser_scope";

export class PhaserNamed extends Named {
    game: Phaser.Game;
    layer: Phaser.Group;
    protected _scopes: PhaserScope[] = [];

    attachTo(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
            this.element.classList.add("Named");
            this.element.classList.add("PhaserNamed");
            this.element.classList.add(`Named-${this.id}`);
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
        for (const scope of this._scopes) {
            this.element.removeChild(scope.element);
            const childLayer = scope.layer;
            scope.detach();
            childLayer.destroy(true);
        }
        const layer = this.layer;
        const game = this.game;
        delete this.layer;
        if (this.game) {
            layer.destroy(true);
            delete this.layer;
            delete this.game;
        }
        if (this.element) {
            game.destroy();
            this.element.classList.remove("Named");
            this.element.classList.remove("PhaserNamed");
            this.element.classList.remove(`Named-${this.id}`);
            delete this.element;
        }
    }

    private _gameCreate() {
        if (!this.layer) this.layer = this.game.add.group();
        for (const scope of this._scopes) {
            const childLayer = this.layer.game.add.group();
            this.layer.add(childLayer);
            scope.attachTo(childLayer);
        }
    }
}