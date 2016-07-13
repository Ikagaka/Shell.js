/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Phaser from "phaser";
import {NamedManager} from "../named_manager";
import {PhaserNamed} from "./phaser_named";

export class PhaserNamedManager extends NamedManager {
    game: Phaser.Game;
    layer: Phaser.Group;
    protected _nameds: {[id: number]: PhaserNamed} = {};

    attachTo(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
            element.classList.add("NamedManager");
            element.classList.add("PhaserNamedManager");
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
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            const childLayer = named.layer;
            named.detach();
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
            this.element.classList.remove("NamedManager");
            this.element.classList.remove("PhaserNamedManager");
            delete this.element;
        }
    }

    private _gameCreate() {
        if (!this.layer) this.layer = this.game.add.group();
        for (const id of Object.keys(this._nameds)) {
            const named = this._nameds[<number><any>id]; // TODO
            const childLayer = this.layer.game.add.group();
            this.layer.add(childLayer);
            named.attachTo(childLayer);
        }
    }
}
