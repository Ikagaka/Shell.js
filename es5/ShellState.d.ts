import * as SH from "./ShellModel";
import * as SC from "./ShellConfig";
export declare class ShellState {
    shell: SH.Shell;
    listener: (event: string, shell: SH.Shell) => Promise<void>;
    constructor(shell: SH.Shell, listener: (event: string, shell: SH.Shell) => Promise<void>);
    bind(category: string, parts: string): void;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(category: string, parts: string): void;
    unbind(scopeId: number, bindgroupId: number): void;
}
export declare function bind_value(config: SC.ShellConfig, a: number | string, b: number | string, flag: boolean): void;
