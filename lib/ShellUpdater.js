"use strict";
function bind_value(shell, a, b, flag) {
    const { bindgroup, char } = shell.config;
    if (typeof a === "number" && typeof b === "number") {
        const scopeId = a;
        const bindgroupId = b;
        if (bindgroup[scopeId] == null) {
            console.warn("ShellUpdater.bind: bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return shell;
        }
        bindgroup[scopeId][bindgroupId] = flag;
        return shell;
    }
    if (typeof a === "string" && typeof b === "string") {
        const _category = a;
        const _parts = b;
        return char.reduce((shell, char, scopeId) => {
            return char.bindgroup.reduce((shell, bindgroup, bindgroupId) => {
                const { category, parts } = bindgroup.name;
                if (_category === category && _parts === parts) {
                    return bind_value(shell, scopeId, bindgroupId, flag);
                }
                return shell;
            }, shell);
        }, shell);
    }
    console.error("ShellUpdater.bind:", "TypeError:", a, b);
    return shell;
}
exports.bind_value = bind_value;
function bind(shell, a, b) {
    return bind_value(shell, a, b, true);
}
exports.bind = bind;
function unbind(shell, a, b) {
    return bind_value(shell, a, b, false);
}
exports.unbind = unbind;
