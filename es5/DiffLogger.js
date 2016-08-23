"use strict";
var SU = require("./SurfaceUtil");
var DiffLogger = (function () {
    function DiffLogger(o) {
        this.o = o;
        this.changeLog = [];
    }
    DiffLogger.prototype.logger = function (manipulation) {
        var tmp = SU.extend(true, {}, this.o);
        manipulation();
        var diff = SU.diff(tmp, this.o);
        this.changeLog.push([Date.now(), diff]);
    };
    return DiffLogger;
}());
exports.DiffLogger = DiffLogger;
