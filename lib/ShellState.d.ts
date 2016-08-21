import * as SH from "./ShellModel";
import * as SC from "./ShellConfig";
import { EventEmitter } from "events";
export declare class ShellState extends EventEmitter {
    shell: SH.Shell;
    constructor(shell: SH.Shell);
    bind(category: string, parts: string): void;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(category: string, parts: string): void;
    unbind(scopeId: number, bindgroupId: number): void;
}
export declare function bind_value(config: SC.ShellConfig, a: number | string, b: number | string, flag: boolean): void;
