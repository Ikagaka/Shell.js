/*
 * shell というか shell config 状態モデルを更新する副作用関数群
 */

import * as SH from "./Shell";


// 着せ替えオンオフ
export function bind_value(shell: SH.Shell, a: number|string, b: number|string, flag: boolean): SH.Shell {
  const {bindgroup, char} = shell.config;
  if(typeof a === "number" && typeof b === "number"){
    const scopeId = a;
    const bindgroupId = b;
    if(bindgroup[scopeId] == null){
      console.warn("ShellUpdater.bind: bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
      return shell;
    }
    bindgroup[scopeId][bindgroupId] = flag;
    return shell;
  }
  if(typeof a === "string" && typeof b === "string"){
    const _category = a;
    const _parts = b;
    return char.reduce((shell, char, scopeId)=>{
      return char.bindgroup.reduce((shell, bindgroup, bindgroupId)=>{
        const {category, parts} = bindgroup.name;
        if(_category === category && _parts === parts){
          return bind_value(shell, scopeId, bindgroupId, flag);
        }
        return shell;
      }, shell);
    }, shell);
  }
  console.error("ShellUpdater.bind:", "TypeError:", a, b);
  return shell;
}

export function bind(shell: SH.Shell, category: string, parts: string): SH.Shell
export function bind(shell: SH.Shell, scopeId: number, bindgroupId: number): SH.Shell
export function bind(shell: SH.Shell, a: number|string, b: number|string): SH.Shell {
  return bind_value(shell, a, b, true);
}

// 着せ替えオフ
export function unbind(shell: SH.Shell, category: string, parts: string): SH.Shell
export function unbind(shell: SH.Shell, scopeId: number, bindgroupId: number): SH.Shell
export function unbind(shell: SH.Shell, a: number|string, b: number|string): SH.Shell {
  return bind_value(shell, a, b, false);
}

