/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Phaser from 'phaser';
import {Attachable} from './attachable';
import {Position} from './position';
import {ShellData} from './shell_data';
import {ShellProfile} from './shell_profile';
import {Scope} from './scope';

export class ScopeShell implements Attachable {
    id: number;
    data: ShellData;
    profile: ShellProfile;
    parent: Scope;
    element: Element;
    game: Phaser.Game;

    constructor(id: number, data: ShellData, profile?: ShellProfile, parent?: Scope, element?: Element) {
        this.id = id;
        this.data = data;
        this.profile = profile;
        this.parent = parent;
        this.element = element;
    }

    attachTo(element: Element) {
        this.element = element;
        this.element.classList.add("ScopeShell");
        this.element.classList.add(`ScopeShell-${this.id}`);
        // TODO canvas size
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, this.element, null, true, true);
    }

    detach() {
        this.game.destroy();
        this.element.classList.remove("ScopeShell");
        this.element.classList.remove(`ScopeShell-${this.id}`);
        delete this.element;
    }
}
