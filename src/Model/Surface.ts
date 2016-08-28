/*
 * Surface のアニメーション状態およびレイヤ状態を表すモデル
 */
import * as Util from "../Util/index";
import {SurfaceRenderingTree} from "./SurfaceRenderingTree";
import {Canvas} from "./Canvas";

export class Surface {
  scopeId: number;
  surfaceId: number;
  width: number;
  height: number; // ベースサーフェスのサイズ
  srfCnv:          Canvas;  // 現在のピクセル
  renderingTree:   SurfaceRenderingTree; // 実際に表示されるべき再帰的なbindも含めたレイヤツリー
  serikos:          {[animId: number]: Seriko}; // interval再生が有効なアニメーションID
  talkCount:       number;
  destructed:      boolean;

  constructor(scopeId: number, surfaceId: number, width: number, height: number) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.width = width;
    this.height = height;
    this.srfCnv = new Canvas(Util.createCanvas(width, height));
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.serikos = {};
    this.talkCount = 0;
    this.destructed = false;
  }
}

export class Seriko {
  patternID:  number;
  paused:     boolean; // \![anim,pause] みたいなの 
  exclusive:  boolean; // このアニメーションは排他されているか
  canceled:   boolean; // 何らかの理由で強制停止された
  finished:   boolean; // このアニメーションは正常終了した

  constructor(patternID=-1){
    this.patternID = patternID;
    this.paused     = false;
    this.exclusive  = false;
    this.canceled   = false;
    this.finished   = false;
  }
}


