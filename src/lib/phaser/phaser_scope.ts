import * as Phaser from "phaser";
import {Scope} from "../scope";
import {PhaserScopeShell} from "./phaser_scope_shell";
import {PhaserScopeBalloon} from "./phaser_scope_balloon";

export class PhaserScope extends Scope {
    game: Phaser.Game;
    layer: Phaser.Group;
    shell: PhaserScopeShell;
    balloon: PhaserScopeBalloon;

    attachTo(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
            this.element.classList.add("Scope");
            this.element.classList.add("PhaserScope");
            this.element.classList.add(`Scope-${this.id}`);
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
        if (!this.layer) this.layer = this.game.add.group();
        const shellChildLayer = this.layer.game.add.group();
        this.layer.add(shellChildLayer);
        this.shell.attachTo(shellChildLayer);
        const balloonChildLayer = this.layer.game.add.group();
        this.layer.add(balloonChildLayer);
        this.balloon.attachTo(balloonChildLayer);
    }
}
