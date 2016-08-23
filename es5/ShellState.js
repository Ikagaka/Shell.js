"use strict";
var ShellState = (function () {
    // on("update_bindgroup")
    //   config の bindgroup が書き換わったので 全ての surface の状態を変更するように上位存在へお伺いを立てている
    function ShellState(shell, listener) {
        this.shell = shell;
        this.listener = listener;
    }
    ShellState.prototype.bind = function (a, b) {
        var config = this.shell.config;
        bind_value(config, a, b, true);
        this.listener("update_bindgroup", this.shell);
    };
    ShellState.prototype.unbind = function (a, b) {
        var config = this.shell.config;
        bind_value(config, a, b, false);
        this.listener("update_bindgroup", this.shell);
    };
    return ShellState;
}());
exports.ShellState = ShellState;
// 着せ替えオンオフ
function bind_value(config, a, b, flag) {
    var bindgroup = config.bindgroup, char = config.char;
    if (typeof a === "number" && typeof b === "number") {
        var scopeId = a;
        var bindgroupId = b;
        if (bindgroup[scopeId] == null) {
            console.warn("ShellState#bind_value: bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        bindgroup[scopeId][bindgroupId] = flag;
        return;
    }
    if (typeof a === "string" && typeof b === "string") {
        var _category_1 = a;
        var _parts_1 = b;
        char.forEach(function (char, scopeId) {
            char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                var _a = bindgroup.name, category = _a.category, parts = _a.parts;
                if (_category_1 === category && _parts_1 === parts) {
                    bind_value(config, scopeId, bindgroupId, flag);
                }
            });
        });
    }
    console.error("ShellState#bind_value:", "TypeError:", a, b);
    return void config;
}
exports.bind_value = bind_value;
