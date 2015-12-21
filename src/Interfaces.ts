/// <reference path="../typings/tsd.d.ts"/>

export interface ShellConifg {
  seriko: {
    use_self_alpha: number;
    paint_transparent_region_black: number;
    alignmenttodesktop: string; // top|bottom|free, 全体のサーフェスのデフォルト※表示位置情報。 上部に貼り付き | 下部に貼り付き | 自由移動 bottom
  };
  menu: {
    value: boolean; // シェルをゴーストのシェル切り替えメニューに表示しなくなる。false
    font: {
      name: string; // オーナードローメニューに使用するフォント
      height: number; // オーナードローメニューに使用する文字の大きさ。
    };
    background: {
      bitmap: {
        filename: string; // バックグラウンド表示画像ファイル名。
      };
      font: {
        color: {
          r: number; // バックグラウンド文字色赤(0～255)
          b: number; // バックグラウンド文字色緑(0～255)
          g: number; // バックグラウンド文字色青(0～255)
        };
      };
      alignment: string; // バックグラウンド画像をrighttopで右寄せ、lefttopで左寄せ、centertopで中央寄せ。SSPのみrightbottom、leftbottom、centerbottomのような下方向固定も可。lefttop
    };
    foreground: {
      bitmap: {
        filename: string; // フォアグラウンド表示画像ファイル名。
      };
      font: {
        color: {
          r: number; // フォアグラウンド文字色赤(0～255)
          b: number; // フォアグラウンド文字色緑(0～255)
          g: number; // フォアグラウンド文字色青(0～255)
        };
      };
      alignment: string; // フォアグラウンド画像をrighttopで右寄せ、lefttopで左寄せ、centertopで中央寄せ。SSPのみrightbottom、leftbottom、centerbottomのような下方向固定も可。lefttop
    };
    sidebar: {
      bitmap: {
        filename: string; // サイドバー表示画像ファイル名。
      };
      alignment: string; // サイドバー画像をtopで上寄せ、bottomで下寄せ。bottom
    };
    separator: {
      color: {
        r: number; // セパレータ色赤(0～255)
        b: number; // セパレータ色緑(0～255)
        g: number; // セパレータ色青(0～255)
      };
    };
    disable: {
      font: {
        color: {
          r: number; // フォアグラウンド文字色赤(0～255)
          b: number; // フォアグラウンド文字色緑(0～255)
          g: number; // フォアグラウンド文字色青(0～255)
        };
      };
    }
  };
  char: {
    name: string; // 本題側のゴーストの名前。
    name2: string; // 本題側のゴーストの名前。愛称等。
    menu: string;// auto|hidden, auto
    menuitem: number[]; // アニメーションID
    defaultx: number; // 画像ベースX座標（無ければ画像中央）
    defaulty: number; // 画像ベースY座標（無ければ画像下端）
    defaultleft: number; // ディスプレイ上でのデフォルトX座標。
    defaulttop: number; // ディスプレイ上でのデフォルトY座標。
    balloon: {
      offsetx: number; // バルーン位置X座標。
      offsety: number; // バルーン位置Y座標。
      alignment: string; // none | left | right, 自動調整、shellのY座標が画面中央より左なら右、右なら左に表示 | 常に左 | 常に右
    }
    seriko: {
      use_self_alpha: number;
      paint_transparent_region_black: number;
      alignmenttodesktop: string; // サーフェスのデフォルト※表示位置情報。
    };
    bindgroup: {
      name: {
        category: string;
        parts: string;
        thumbnail: string;// HTMLImageElemetにするかも -> やるならgetBindGroupsで
      };
      default: number;
      addid: number; // アニメーションID
    }[];
    bindoption: {
      group: {
        category: string;
        options: string[]; //multiple | mustselect
      }
    }[];
  }[];
}

export interface SurfaceCanvas {
  cnv: HTMLCanvasElement; // 色抜き後のサーフェス。初期状態ではnull。使われるごとにキャッシュされる
  png: HTMLImageElement; // 色抜き前の素材。cnvがあればnullable
  pna: HTMLImageElement; // 色抜き前の素材。SurfaceUtil.pna しないかぎり nullable
}

export interface SurfaceMouseEvent {
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "Bust"
  transparency: boolean; // 透明領域ならtrue,
  event: JQueryEventObject;
}

export interface SurfaceTreeNode {
  base:  SurfaceCanvas,
  elements: SurfaceElement[],
  collisions: SurfaceRegion[],
  animations: SurfaceAnimationEx[]
}

export interface SurfaceAnimationEx {
  interval: string;
  intervals: [string, string[]][]; // [command, args]
  options: [string, string[]][]; // [command, args]
  is: number;
  patterns: SurfaceAnimationPattern[];
  regions: SurfaceRegion[];
}

export interface SurfaceElement {
  canvas: SurfaceCanvas;
  type: string;
  x: number;
  y: number;
}
