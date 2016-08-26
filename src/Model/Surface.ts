/*
 * Surface のアニメーション状態およびレイヤ状態を表すモデル
 */
import {SurfaceRenderingTree} from "./SurfaceRenderingTree";

export class Surface {
  scopeId: number;
  surfaceId: number;

  renderingTree:   SurfaceRenderingTree; // 実際に表示されるべき再帰的なbindも含めたレイヤツリー
  serikos:          {[animId: number]: Seriko}; // interval再生が有効なアニメーションID
  talkCount:       number;
  move:             {x: number, y: number};
  destructed:      boolean;

  constructor(scopeId: number, surfaceId: number) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.serikos = {};
    this.talkCount = 0;
    this.move =             {x: 0, y: 0};
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


