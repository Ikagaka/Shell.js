/*
 * スコープ間の重なりを表現するモデル
 */

import {Shell} from "./Shell";
import {Scope} from "./Scope";

export class Named {
  shell: Shell;
  scopes: Scope[]; // stack
  constructor(shell: Shell){
    this.shell = shell;
    this.scopes = [];
  }
}