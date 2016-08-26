NamedManager = require("./NamedManager")
Named = require("./Named")
Scope = require("./Scope")
$ = require("jquery")
version = require("../package.json").version

exports.NamedManager = NamedManager
exports.Named = Named
exports.Scope = Scope
exports.version = version

window["$"] = window["$"] || $
window["jQuery"] = window["jQuery"] || $
