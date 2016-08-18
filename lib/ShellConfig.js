/// <reference path="../typings/index.d.ts"/>
"use strict";
class ShellConfig {
    constructor() {
        this.seriko = new SerikoConfig();
        this.menu = new MenuConfig();
        this.char = [];
        // states
        this.bindgroup = [];
        this.enableRegion = false;
    }
    loadFromJSONLike(json) {
        const seriko = json["seriko"] != null ? json["seriko"] : {};
        const menu = json["menu"] != null ? json["menu"] : {};
        const char = (Array.isArray(json["char"]) ? json["char"] : []);
        // char*
        return Promise.all(char.map((_char, id) => {
            return new CharConfig().loadFromJSONLike(_char).then((conf) => {
                this.char[id] = conf;
            });
        })).then((configs) => {
            // descript.txtからbindgroup探してデフォルト値を反映
            this.char.forEach((_char, charId) => {
                this.bindgroup[charId] = [];
                _char.bindgroup.forEach((o, animId) => {
                    this.bindgroup[charId][animId] = o.default;
                });
            });
            return this;
        });
    }
}
exports.ShellConfig = ShellConfig;
class SerikoConfig {
    // \![set,sticky-window,スコープID,スコープID,...]のdescript版。タグを実行しなくてもあらかじめ設定できる。
    constructor() {
        this.use_self_alpha = false;
        this.paint_transparent_region_black = true;
        this.alignmenttodesktop = "bottom";
        this.zorder = [];
        this.stickyWindow = [];
    }
}
exports.SerikoConfig = SerikoConfig;
class MenuConfig {
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
    constructor() {
        this.value = false;
    }
}
exports.MenuConfig = MenuConfig;
class CharConfig {
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
    constructor() {
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
    loadFromJSONLike(char) {
        // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
        if (Array.isArray(char["bindgroup"])) {
            char["bindgroup"].forEach((bindgroup, id) => {
                if (bindgroup != null && typeof bindgroup["name"] === "string") {
                    const [category, parts, thumbnail] = bindgroup["name"].split(",").map((a) => a.trim());
                    this.bindgroup[id] = new BindGroupConfig(category, parts, thumbnail, !!Number(bindgroup["default"]));
                }
            });
        }
        /*
        // sakura.bindoption0.group = "アクセサリ,multiple" -> {category: "アクセサリ", options: "multiple"}
        if(Array.isArray(char["bindoption"])){
          char["bindoption"].forEach((bindoption)=>{
            if(typeof bindoption.group === "string"){
              const [category, ...options] = (""+bindoption.group).split(",").map((a)=>a.trim())
              bindoption.group = {category, options};
            }
          });
        }
        */
        return Promise.resolve(this);
    }
}
exports.CharConfig = CharConfig;
class BindGroupConfig {
    // 着せ替えの同時実行設定。アニメーションID*番の着せ替えが有効になった（表示された）時に、addidとして指定した着せ替えも同時に有効にする。カンマ区切りで複数指定可。
    // 同時実行中の着せ替えは、元となった着せ替えが無効になった時点で無効になる。複数の着せ替えのaddidとして同一の着せ替えが同時実行指定されている場合、元となったすべての着せ替えが無効になるまで同時実行指定の着せ替えも無効にならない。
    constructor(category, parts, thumbnail = "", _default = false) {
        this.name = {
            category: category,
            parts: parts,
            thumbnail: thumbnail
        };
        this.default = _default;
        this.addid = [];
    }
}
exports.BindGroupConfig = BindGroupConfig;
