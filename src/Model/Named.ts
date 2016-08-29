/*
 * スコープ間の重なりを表現するモデル
 */

import {Shell} from "./Shell";
import {Balloon} from "../Model/Balloon";
import {Scope} from "./Scope";

export class Named {
  shell: Shell;
  balloon: Balloon;
  scopes: Scope[]; // stack
  
  constructor(shell: Shell, balloon: Balloon){
    this.shell = shell;
    this.scopes = [];
  }
}