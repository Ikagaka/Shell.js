/*
 * shell/master/descript.txt から ShellConfig 構造体を作る
 */
"use strict";
var SC = require("./ShellConfig");
function loadFromJSONLike(json) {
    var that = new SC.ShellConfig();
    var seriko = json["seriko"] != null ? json["seriko"] : {};
    var menu = json["menu"] != null ? json["menu"] : {};
    var char = (Array.isArray(json["char"]) ? json["char"] : []);
    // char*
    return Promise.all(char.map(function (_char, id) {
        return loadCharConfig(_char).then(function (conf) {
            that.char[id] = conf;
        });
    })).then(function (configs) {
        // descript.txtからbindgroup探してデフォルト値を反映
        that.char.forEach(function (_char, charId) {
            that.bindgroup[charId] = [];
            _char.bindgroup.forEach(function (o, animId) {
                that.bindgroup[charId][animId] = o.default;
            });
        });
        return that;
    });
}
exports.loadFromJSONLike = loadFromJSONLike;
function loadCharConfig(char) {
    var that = new SC.CharConfig();
    // char1.bindgroup[20].name = "装備,飛行装備" -> {category: "装備", parts: "飛行装備", thumbnail: ""};
    if (Array.isArray(char["bindgroup"])) {
        char["bindgroup"].forEach(function (bindgroup, id) {
            if (bindgroup != null && typeof bindgroup["name"] === "string") {
                var _a = bindgroup["name"].split(",").map(function (a) { return a.trim(); }), category = _a[0], parts = _a[1], thumbnail = _a[2];
                that.bindgroup[id] = new SC.BindGroupConfig(category, parts, thumbnail, !!Number(bindgroup["default"]));
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
    return Promise.resolve(that);
}
exports.loadCharConfig = loadCharConfig;
