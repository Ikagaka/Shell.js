/*
 * Balloon
 */
import * as Util from "../Util/index";
import {Descript, JSONLike} from "./Config";

export interface BAL {
  descript: Descript;
  descriptJSON: JSONLike;
  canvas: HTMLCanvasElement;
};
export type Directory = { [filepath: string]: ArrayBuffer };

export class Balloon {

  directory: Directory; // filepathに対応するファイルのArrayBuffer
  descript: Descript; // descript.txtをcsvと解釈した時の値

  balloons: {// filepathとか
    sakura: BAL[],
    kero: BAL[],
    communicate: BAL[],
    online: BAL[],
    arrow: BAL[],
    sstp: BAL[],
    thumbnail: BAL[]
  };

  constructor() {
    this.directory = {};
    this.descript = {};

    this.balloons = {
      sakura: [],
      kero: [],
      communicate: [],
      online: [],
      arrow: [],
      sstp: [],
      thumbnail: []
    };
  }
}
