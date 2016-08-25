/*
 * shell/master/descript.txt および現在の シェル 状態を表す構造体
 */
"use strict";
var ShellConfig = (function () {
    function ShellConfig() {
        this.seriko = new SerikoConfig();
        this.menu = new MenuConfig();
        this.char = [];
        // states
        this.bindgroup = [];
        this.enableRegion = false;
        this.position = "fixed";
    }
    return ShellConfig;
}());
exports.ShellConfig = ShellConfig;
var SerikoConfig = (function () {
    // \![set,sticky-window,スコープID,スコープID,...]のdescript版。タグを実行しなくてもあらかじめ設定できる。
    function SerikoConfig() {
        this.use_self_alpha = false;
        this.paint_transparent_region_black = true;
        this.alignmenttodesktop = "bottom";
        this.zorder = [];
        this.stickyWindow = [];
    }
    return SerikoConfig;
}());
exports.SerikoConfig = SerikoConfig;
var MenuConfig = (function () {
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
    function MenuConfig() {
        this.value = false;
    }
    return MenuConfig;
}());
exports.MenuConfig = MenuConfig;
var CharConfig = (function () {
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
    function CharConfig() {
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
        this.seriko = { alignmenttodesktop: "bottom" };
        this.bindgroup = [];
    }
    return CharConfig;
}());
exports.CharConfig = CharConfig;
var BindGroupConfig = (function () {
    // 着せ替えの同時実行設定。アニメーションID*番の着せ替えが有効になった（表示された）時に、addidとして指定した着せ替えも同時に有効にする。カンマ区切りで複数指定可。
    // 同時実行中の着せ替えは、元となった着せ替えが無効になった時点で無効になる。複数の着せ替えのaddidとして同一の着せ替えが同時実行指定されている場合、元となったすべての着せ替えが無効になるまで同時実行指定の着せ替えも無効にならない。
    function BindGroupConfig(category, parts, thumbnail, _default) {
        if (thumbnail === void 0) { thumbnail = ""; }
        if (_default === void 0) { _default = false; }
        this.name = {
            category: category,
            parts: parts,
            thumbnail: thumbnail
        };
        this.default = _default;
        this.addid = [];
    }
    return BindGroupConfig;
}());
exports.BindGroupConfig = BindGroupConfig;
function isBind(config, scopeId, animId) {
    var bindgroup = config.bindgroup;
    if (bindgroup[scopeId] == null)
        return false;
    if (bindgroup[scopeId][animId] === false)
        return false;
    return true;
}
exports.isBind = isBind;
