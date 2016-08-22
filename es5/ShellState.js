"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events_1 = require("events");

var ShellState = function (_events_1$EventEmitte) {
    _inherits(ShellState, _events_1$EventEmitte);

    // on("bindgroup_update")
    //   config の bindgroup が書き換わったので 全ての surface の状態を変更するように上位存在へお伺いを立てている
    function ShellState(shell) {
        _classCallCheck(this, ShellState);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ShellState).call(this));

        _this.shell = shell;
        return _this;
    }

    _createClass(ShellState, [{
        key: "bind",
        value: function bind(a, b) {
            var config = this.shell.config;

            bind_value(config, a, b, true);
            this.emit("bindgroup_update");
        }
    }, {
        key: "unbind",
        value: function unbind(a, b) {
            var config = this.shell.config;

            bind_value(config, a, b, false);
            this.emit("bindgroup_update");
        }
    }]);

    return ShellState;
}(events_1.EventEmitter);

exports.ShellState = ShellState;
// 着せ替えオンオフ
function bind_value(config, a, b, flag) {
    var bindgroup = config.bindgroup;
    var char = config.char;

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
        (function () {
            var _category = a;
            var _parts = b;
            char.forEach(function (char, scopeId) {
                char.bindgroup.forEach(function (bindgroup, bindgroupId) {
                    var _bindgroup$name = bindgroup.name;
                    var category = _bindgroup$name.category;
                    var parts = _bindgroup$name.parts;

                    if (_category === category && _parts === parts) {
                        bind_value(config, scopeId, bindgroupId, flag);
                    }
                });
            });
        })();
    }
    console.error("ShellState#bind_value:", "TypeError:", a, b);
    return void config;
}
exports.bind_value = bind_value;