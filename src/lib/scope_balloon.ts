import {Attachable} from './attachable';
import {Position} from './position';
import {BalloonData} from './balloon_data';
import {Scope} from './scope';

export class ScopeBalloon implements Attachable {
    position: Position;
    balloonData: BalloonData;
    parent: Scope;
    element: Element;

    constructor(balloonData: BalloonData, position: Position = new Position(), parent?: Scope, element?: Element) {
        this.balloonData = balloonData;
        this.parent = parent;
        this.element = element;
    }

    attachTo(element: Element) {
        
    }

    detachFrom(element: Element) {
        
    }
}