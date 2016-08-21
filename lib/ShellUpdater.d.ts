import * as SH from "./Shell";
export declare function bind_value(shell: SH.Shell, category: string, parts: string, flag: boolean): SH.Shell;
export declare function bind_value(shell: SH.Shell, scopeId: number, bindgroupId: number, flag: boolean): SH.Shell;
export declare function bind(shell: SH.Shell, category: string, parts: string): SH.Shell;
export declare function bind(shell: SH.Shell, scopeId: number, bindgroupId: number): SH.Shell;
export declare function unbind(shell: SH.Shell, category: string, parts: string): void;
export declare function unbind(shell: SH.Shell, scopeId: number, bindgroupId: number): void;
