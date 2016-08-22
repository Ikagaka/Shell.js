"use strict";
const events_1 = require("events");
class ShellState extends events_1.EventEmitter {
    // on("bindgroup_update")
    //   config の bindgroup が書き換わったので 全ての surface の状態を変更するように上位存在へお伺いを立てている
    constructor(shell) {
        super();
        this.shell = shell;
    }
    bind(a, b) {
        const { config } = this.shell;
        bind_value(config, a, b, true);
        this.emit("bindgroup_update");
    }
    unbind(a, b) {
        const { config } = this.shell;
        bind_value(config, a, b, false);
        this.emit("bindgroup_update");
    }
}
exports.ShellState = ShellState;
// 着せ替えオンオフ
function bind_value(config, a, b, flag) {
    const { bindgroup, char } = config;
    if (typeof a === "number" && typeof b === "number") {
        const scopeId = a;
        const bindgroupId = b;
        if (bindgroup[scopeId] == null) {
            console.warn("ShellState#bind_value: bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        bindgroup[scopeId][bindgroupId] = flag;
        return;
    }
    if (typeof a === "string" && typeof b === "string") {
        const _category = a;
        const _parts = b;
        char.forEach((char, scopeId) => {
            char.bindgroup.forEach((bindgroup, bindgroupId) => {
                const { category, parts } = bindgroup.name;
                if (_category === category && _parts === parts) {
                    bind_value(config, scopeId, bindgroupId, flag);
                }
            });
        });
    }
    console.error("ShellState#bind_value:", "TypeError:", a, b);
    return void config;
}
exports.bind_value = bind_value;
