import {Descript} from "./descript.ts";

export class DataHandlerBase {

  static bufferToString(buffer: Uint8Array) {
    return "";
  }

  static findDescriptPath(directory: {[path: string]: any}) {
    return Object.keys(directory).find((path) => /(?:^|\b)descript\.txt$/i.test(path));
  }

  static findDescript(directory: {[path: string]: Uint8Array}) {
    return DataHandlerBase.bufferToString(directory[DataHandlerBase.findDescriptPath(directory)]);
  }

  static parseDescript(str: string) {
    return new Descript(); // TODO
  }

  static getDescript(directory: {[path: string]: Uint8Array}) {
    return DataHandlerBase.parseDescript(DataHandlerBase.findDescript(directory));
  }

  static selectImagePaths(directory: {[path: string]: any}) {
    return Object.keys(directory).filter((path) => /\.pn[ga]$/i.test(path));
  }

  static selectImages(directory: {[path: string]: Uint8Array}) {
    return DataHandlerBase.selectImagePaths(directory).map((path) => directory[path]);
  }

  static async getImages(directory: {[path: string]: Uint8Array}) {
    const imagePaths = DataHandlerBase.selectImagePaths(directory);
    const images = await DataHandlerBase.loadImages(imagePaths.map((path) => directory[path]));
    const _directory: {[path: string]: HTMLImageElement} = {};
    for  (let i = 0; i < imagePaths.length; i++) {
        _directory[imagePaths[i]] = images[i];
    }
    return _directory;
  }

  static async loadImages(buffers: Uint8Array[]): Promise<HTMLImageElement[]> { // TODO
    return <any>Promise.all(buffers.map((buffer) => DataHandlerBase.loadImage(buffer)));
  }

  static async loadImage(buffer: Uint8Array) { // TODO: in data base class
    return new Promise<HTMLImageElement>((resolve) => {
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.src = url;
      image.addEventListener("load", () => {
        resolve(image);
      });
    });
  }

  static destroyImage(image: HTMLImageElement) {
    URL.revokeObjectURL(image.src);
  }

  static createTextureFromImage(image: HTMLImageElement) { // TODO: in data base class
    const baseTexture = new PIXI.BaseTexture(image, PIXI.scaleModes.DEFAULT);
    const texture = new PIXI.Texture(baseTexture);
    // const texture = PIXI.Texture.fromImage();
    return texture;
  }

  static destroyTexture(texture: PIXI.Texture) {
    const url = texture.baseTexture.source.src;
    texture.destroy(true);
    URL.revokeObjectURL(url);
  }
}