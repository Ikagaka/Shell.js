/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
import {Attachable} from "../attachable";
import {Renderer} from "../renderer";
import * as Phaser from "phaser";

export class PhaserRendererBase implements Renderer {
    model: Attachable;
    element: Element;
    game: Phaser.Game;
    layer: Phaser.Group;

    constructor(element: Element | Phaser.Game | Phaser.Group) {
        if (element instanceof Element) {
            this.element = element;
        } else if (element instanceof Phaser.Game) {
            this.game = element;
        } else {
            this.layer = element;
        }
    }

    async initializeGame() {
        return new Promise((resolve) => {
            // TODO canvas size
            this.game = new Phaser.Game(
                800,
                600,
                Phaser.AUTO,
                this.element,
                {create: () => resolve()},
                true,
                true
            );
        });
    }

    attachModel(model: Attachable) {
        this.model = model;
        if (!this.layer) this.layer = this.game.add.group();
    }

    removeChildRenderer(renderer: PhaserRendererBase) {
        const layer = renderer.layer;
        renderer.destroy();
        layer.destroy(true);
    }

    detachModel() {
        delete this.model;
    }

    destroy() {
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
            delete this.element;
        }
    }

    protected _createChildLayer() {
        const childLayer = this.layer.game.add.group();
        this.layer.add(childLayer);
        return childLayer;
    }
}
