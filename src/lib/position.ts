/// <reference path="../../node_modules/@types/node/index.d.ts" />
import {EventEmitter} from 'events';

export class Position extends EventEmitter {
    private _x = 0;
    private _y = 0;
    private _xOrigin = XOrigin.Left;
    private _yOrigin = YOrigin.Bottom;
    private _xFixed = false;
    private _yFixed = false;

    get x() {
        return this._x;
    }
    set x(x: number) {
        const old = this._x;
        this._x = x;
        this.emit('x', x, old);
    }
    get y() {
        return this._y;
    }
    set y(y: number) {
        const old = this._y;
        this._y = y;
        this.emit('y', y, old);
    }
    get xOrigin() {
        return this._xOrigin;
    }
    set xOrigin(xOrigin: XOrigin) {
        const old = this._xOrigin;
        this._xOrigin = xOrigin;
        this.emit('xOrigin', xOrigin, old);
    }
    get yOrigin() {
        return this._yOrigin;
    }
    set yOrigin(yOrigin: YOrigin) {
        const old = this._yOrigin;
        this._yOrigin = yOrigin;
        this.emit('yOrigin', yOrigin, old);
    }
    get xFixed() {
        return this._xFixed;
    }
    set xFixed(xFixed: boolean) {
        const old = this._xFixed;
        this._xFixed = xFixed;
        this.emit('yOrigin', xFixed, old);
    }
    get yFixed() {
        return this._yFixed;
    }
    set yFixed(yFixed: boolean) {
        const old = this._yFixed;
        this._yFixed = yFixed;
        this.emit('yOrigin', yFixed, old);
    }
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    move(x: number, y: number) {
        this.x += x;
        this.y += y;
    }
}

export class RelativePosition extends Position {
    private _parent: Position;
    
    get parent() {
        return  this._parent;
    }
    set parent(parent: Position) {
        const old = this._parent;
        this._parent = parent;
        this.emit('parent', parent, old);
    }
}

export enum XOrigin {
    Right = 1,
    Left,
}

export enum YOrigin {
    Bottom = 1,
    Top,
}
