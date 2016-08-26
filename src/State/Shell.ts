/*
 * shell config 状態モデルを更新する副作用関数群
 */
import {Shell} from "../Model/Shell";
import {Config} from "../Model/Config";

export class ShellState {
  shell: Shell;
  listener: (event: string, shell: Shell)=>Promise<void>
  // on("update_bindgroup")
  //   config の bindgroup が書き換わったので 全ての surface の状態を変更するように上位存在へお伺いを立てている

  constructor(shell: Shell, listener: (event: string, shell: Shell)=>Promise<void>){
    this.shell = shell;
    this.listener = listener;
  }

  bind(category: string, parts: string): void
  bind(scopeId: number, bindgroupId: number): void
  bind(a: number|string, b: number|string): void {
    const {config} = this.shell;
    bind_value(config, a, b, true);
    this.listener("update_bindgroup", this.shell);
  }

  // 着せ替えオフ
  unbind(category: string, parts: string): void
  unbind(scopeId: number, bindgroupId: number): void
  unbind(a: number|string, b: number|string): void {
    const {config} = this.shell;
    bind_value(config, a, b, false);
    this.listener("update_bindgroup", this.shell);
  }
}

// 着せ替えオンオフ
export function bind_value(config: Config, a: number|string, b: number|string, flag: boolean): void {
  const {bindgroup, char} = config;
  if(typeof a === "number" && typeof b === "number"){
    const scopeId = a;
    const bindgroupId = b;
    if(bindgroup[scopeId] == null){
      console.warn("ShellState#bind_value: bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
      return;
    }
    bindgroup[scopeId][bindgroupId] = flag;
    return;
  }
  if(typeof a === "string" && typeof b === "string"){
    const _category = a;
    const _parts = b;
    char.forEach((char, scopeId)=>{
      char.bindgroup.forEach((bindgroup, bindgroupId)=>{
        const {category, parts} = bindgroup.name;
        if(_category === category && _parts === parts){
          bind_value(config, scopeId, bindgroupId, flag);
        }
      });
    });
  }
  console.error("ShellState#bind_value:", "TypeError:", a, b);
  return void config;
}

