import * as Util from "../Util/index";

import {Canvas} from "../Model/Canvas";
import {Scope} from "../Model/Scope";

export class ScopeRenderer {
  render(scope: Scope): Promise<void> {
    return Promise.reject("yet");
  }
  getSurfaceCanvas(): Canvas {
    return new Canvas(Util.createCanvas());
  };
}