/*
 * はみ出しを考慮したCanvas
 */

export class Canvas {
  // baseCanvas
  cnv: HTMLCanvasElement
  // overlayではみ出した際canvasのリサイズがされるがその時の補正値
  basePosX: number;
  basePosY: number;
  baseWidth: number;
  baseHeight: number;
  constructor(cnv: HTMLCanvasElement) {
    this.cnv = cnv;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = cnv.width;
    this.baseHeight = cnv.height;
  }
}
