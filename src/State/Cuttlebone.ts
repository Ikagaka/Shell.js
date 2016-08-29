/*
 * Named 状態モデルを更新する
 */
import * as Util from "../Util/index";

//import {NamedMouseDownEvent} from "../Component/Named";

import {Cuttlebone} from "../Model/Cuttlebone";
import {Shell, Directory} from "../Model/Shell";
import {Balloon} from "../Model/Balloon";
import {Named} from "../Model/Named";

import {NamedState} from "../State/Named";
import {SurfaceDefinition} from "../Model/SurfaceDefinitionTree";
import {Config} from "../Model/Config";

import {EventEmitter} from "events";

// cuttlebone model の window stack が更新された
// この named を最前面に持ってきたい
export interface HoverEvent {
  type: "onHover";
  cuttlebone: Cuttlebone;
  named: Named;
}

export class CuttleboneState extends EventEmitter {
  cuttlebone: Cuttlebone;
  namedStates: NamedState[]; // scopeId accsessor

  constructor(cuttlebone: Cuttlebone) {
    super();
    this.cuttlebone = cuttlebone;
    this.namedStates = [];
  }

  destructor(){
    this.namedStates.map((namedState)=>{
      namedState.destructor();
    });
  }

  hover(named: Named): Promise<void> {
    // stack 操作
    const {namedStates, cuttlebone} = this;
    const {namedies} = cuttlebone;
    const id = namedies.indexOf(named);
    if(id >= 0){
      // スタックの順番書き換え 
      const target = namedies.splice(id, 1)[0];
      namedies.unshift(target);
      this.emit("onHover", { type: "onHover", cuttlebone, named: target });
    }else{
      console.warn("CuttleboneState#hover: undefined named:", named);
    }
    return Promise.resolve();
  }

  materialize(shell: Shell, balloon: Balloon): Promise<NamedState>{
    const named = new Named(shell, balloon);
    return this.addNamed(named);
  }

  vanish(namedState: NamedState): Promise<void> {
    const {namedStates, cuttlebone} = this;
    const {namedies} = cuttlebone;
    const {named} = namedState;
    const id = namedStates.indexOf(namedState);
    const _id = namedies.indexOf(named);
    namedState.destructor();
    delete namedStates[id];
    delete namedies[_id];
    return Promise.resolve();
  }

  addNamed(named: Named): Promise<NamedState>{
    const {namedStates, cuttlebone} = this;
    const {namedies} = cuttlebone;
    const namedId = namedStates.length;
    const namedState = new NamedState(named);
    namedStates[namedId] = namedState;
    return Promise.resolve(namedState);
  }

  getNamedState(named: Named): Promise<NamedState> {
    const {namedStates, cuttlebone} = this;
    const {namedies} = cuttlebone;
    const id = namedies.indexOf(named);
    if(id >= 0){
      return Promise.resolve(namedStates[id]);
    }else{
      console.warn("CuttleboneState#getNamedState: undefined named:", named);
      return Promise.reject("undefined named");
    }
  }
}

