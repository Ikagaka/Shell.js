/*
 * shell/master/descript.txt および現在の シェル 状態を表す構造体
 */



export type Descript = { [key: string]: string; };

export type JSONLike = string | number | { [key: string]: JSONLike };

export class ShellConfig {
  // 以下 descript
  public seriko: SerikoConfig;
  public menu: MenuConfig;
  public char: CharConfig[];
  // 以下 state
  public bindgroup: { [charId: number]: { [bindgroupId: number]: boolean } }; //keyはbindgroupのid、値はその着せ替えグループがデフォルトでオンかどうかの真偽値
  public enableRegion: boolean;
  public position: "fixed"|"absolute";

  constructor(){
    this.seriko = new SerikoConfig();
    this.menu = new MenuConfig();
    this.char = [];
    // states
    this.bindgroup = [];
    this.enableRegion = false;
    this.position = "fixed";
  }
}

export class SerikoConfig {
  use_self_alpha: boolean;
  // 数値が1だった場合はPNAでなくサーフェス自体（32bitPNG）のアルファチャンネルを透明度として使用する。
  // アルファチャンネルを持たないサーフェスについてはPNAが有効。
  // default: 0
  paint_transparent_region_black: boolean;
  // サーフェスの抜き色（png画像左上の色）になっているにも関わらず、PNA等での透明度指定では透明でない領域の表示設定。
  // 0を指定した場合はサーフェス本来の色（抜き色）を指定の透明度で表示する。
  // 1を指定した場合はサーフェスの色の替わりに黒で塗りつぶされてから指定の透明度で表示する。
  // 例えば0を指定した上で全面真っ白のpnaを用意したサーフェスは、抜き色なしで画像のまま表示される。
  // default: 1
  alignmenttodesktop: "top" | "bottom" | "left" | "right" | "free";
  // top|bottom|free, 全体のサーフェスのデフォルト※表示位置情報。 上部に貼り付き | 下部に貼り付き | 自由移動 bottom
  zorder: number[];
  // \![set,zorder,スコープID,スコープID,...]のdescript版。タグを実行しなくてもあらかじめ設定できる。
  stickyWindow: number[];
  // \![set,sticky-window,スコープID,スコープID,...]のdescript版。タグを実行しなくてもあらかじめ設定できる。
  constructor(){
    this.use_self_alpha = false;
    this.paint_transparent_region_black = true;
    this.alignmenttodesktop = "bottom"
    this.zorder = [];
    this.stickyWindow = [];
  }
}


export class MenuConfig {
  value: boolean; // シェルをゴーストのシェル切り替えメニューに表示しなくなる。false
  /*font: {
    name: string; // オーナードローメニューに使用するフォント
    height: number; // オーナードローメニューに使用する文字の大きさ。
  };*/
  /*background: {
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
  };*/
  /*
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
  };*/
  /*
  sidebar?: {
    bitmap: {
      filename: string; // サイドバー表示画像ファイル名。
    };
    alignment: string; // サイドバー画像をtopで上寄せ、bottomで下寄せ。bottom
  };
  separator?: {
    color: {
      r: number; // セパレータ色赤(0～255)
      b: number; // セパレータ色緑(0～255)
      g: number; // セパレータ色青(0～255)
    };
  };*/
  /*disable: {// 選択不可文字
    font: {
      color: {
        r: number; // フォアグラウンド文字色赤(0～255)
        b: number; // フォアグラウンド文字色緑(0～255)
        g: number; // フォアグラウンド文字色青(0～255)
      };
    };
  }*/
  constructor(){
    this.value = false;
  }
}


export class CharConfig {
  /*
  name: string; // 本題側のゴーストの名前。
  name2: string; // 本題側のゴーストの名前。愛称等。
  */
  menu: "auto" | "hidden"; // auto|hidden, auto
  menuitem: number[]; // アニメーションID
  defaultX: number; // 画像ベースX座標（無ければ画像中央）
  defaultY: number; // 画像ベースY座標（無ければ画像下端）
  defaultLeft: number; // ディスプレイ上でのデフォルトX座標。
  defaultTop: number; // ディスプレイ上でのデフォルトY座標。
  balloon: {
    offsetX: number; // バルーン位置X座標。
    offsetY: number; // バルーン位置Y座標。
    alignment: "none" | "left" | "right"; // none | left | right, 自動調整、shellのY座標が画面中央より左なら右、右なら左に表示 | 常に左 | 常に右
  }
  seriko: {
    alignmenttodesktop: string; // サーフェスのデフォルト※表示位置情報。
  };
  bindgroup: BindGroupConfig[]; 
  /*
  bindoption: {
    // char*.bindoption*.group,カテゴリ名,オプション
    // その着せ替えカテゴリにオプションを設定。*は単に0から始まる通し番号(3人目以降)。
    // mustselectでパーツを必ず1つ選択、multipleで複数のパーツを選択可能。
    // オプションは+区切りで複数可。
    group: {
      category: string;
      options: string[]; //multiple | mustselect
    }
  }[];*/
  constructor(){
    this.menu = "auto";
    this.menuitem = [];
    this.defaultX = 0;
    this.defaultY = 0;
    this.defaultLeft = 0;
    this.defaultTop = 0;
    this.balloon = {
      offsetX: 0,
      offsetY: 0,
      alignment: "none"
    };
    this.bindgroup = [];
  }
  
}

export class BindGroupConfig {
  name: {
    category: string;
    parts: string;
    thumbnail: string;// HTMLImageElemetにするかも -> やるならgetBindGroupsで
  };
  // sakura.bindgroup*.name,カテゴリ名,パーツ名,サムネイル名
  // アニメーションID*番のパーツにカテゴリ名とパーツ名を定義。(本体側)
  // アニメーションIDはsurfaces.txtにおけるアニメーション定義の「animation*.interval,bind」の*にあたる数字。
  // オーナードローメニューの着せ替えに表示するために必要。
  // Sakura Scriptの\![bind,カテゴリ名,パーツ名,数値]で操作するためにも必要。（SSPのみ）
  default: boolean;
  // アニメーションID*番の着せ替えを最初から表示するか否か。1で表示、0で非表示。
  addid: number[];
  // 着せ替えの同時実行設定。アニメーションID*番の着せ替えが有効になった（表示された）時に、addidとして指定した着せ替えも同時に有効にする。カンマ区切りで複数指定可。
  // 同時実行中の着せ替えは、元となった着せ替えが無効になった時点で無効になる。複数の着せ替えのaddidとして同一の着せ替えが同時実行指定されている場合、元となったすべての着せ替えが無効になるまで同時実行指定の着せ替えも無効にならない。
  constructor(category: string, parts: string, thumbnail="", _default=false){
    this.name = {
      category: category,
      parts: parts,
      thumbnail: thumbnail
    };
    this.default = _default;
    this.addid = [];
  }
}


export function isBind(config: ShellConfig, animId: number): boolean {
  const {bindgroup} = config;
  if (bindgroup[this.scopeId] == null) return false;
  if (bindgroup[this.scopeId][animId] === false) return false;
  return true;
}
