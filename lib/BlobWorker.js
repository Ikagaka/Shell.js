"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cuttlebone;
(function (cuttlebone) {
    function getArrayBuffer(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function () {
                if (200 <= xhr.status && xhr.status < 300) {
                    if (typeof xhr.response.error === "undefined") {
                        resolve(Promise.resolve(xhr.response));
                    } else {
                        reject(new Error(xhr["response"]["error"]["message"]));
                    }
                } else {
                    reject(new Error("xhr status: " + xhr.status));
                }
            });
            xhr.open("GET", url);
            xhr.responseType = "arraybuffer";
            xhr.send();
        });
    }
    function createTransferable(dic) {
        var buffers = [];
        Object.keys(dic).forEach(function (key) {
            return buffers.push(dic[key]);
        });
        return buffers;
    }

    var BlobWorker = (function () {
        function BlobWorker(mainScript, CONSTS, importURLs) {
            _classCallCheck(this, BlobWorker);

            if (!Array.isArray(CONSTS)) CONSTS = [];
            if (!Array.isArray(importURLs)) importURLs = [];
            this.importURLs = importURLs;
            this.mainScript = mainScript;
            this.CONSTS = CONSTS;
            this.url = null;
            this.worker = null;
            this.requestId = 0;
            this.callbacks = {};
            this.blobURLs = [];
        }

        _createClass(BlobWorker, [{
            key: "load",
            value: function load() {
                var _this = this;

                var prms = this.importURLs.map(function (url) {
                    return getArrayBuffer(url).then(function (buffer) {
                        return URL.createObjectURL(new Blob([buffer], { "type": "test/javascript" }));
                    });
                });
                return Promise.all(prms).then(function (_importURLs) {
                    var inlineScript = [_importURLs.map(function (src) {
                        return "importScripts('" + src + "');\n";
                    }).join("") + "\n", "(" + serverScript + ")();\n", "(" + _this.mainScript + ")([" + _this.CONSTS.map(JSON.stringify).join(",") + "]);\n"];
                    _this.url = URL.createObjectURL(new Blob(inlineScript, { type: "text/javascript" }));
                    _this.blobURLs = _importURLs.concat(_this.url);
                    _this.worker = new Worker(_this.url);
                    _this.worker.addEventListener("error", function (ev) {
                        console.error(!!ev && !!ev.error && ev.error.stack || ev.error || ev);
                    });
                    _this.worker.addEventListener("message", function (ev) {
                        var id = ev.data[0];
                        var data = ev.data[1];
                        _this.callbacks[id](data);
                        delete _this.callbacks[id];
                    });
                    return _this;
                });
                function serverScript() {
                    var _self = self; // type hack
                    var handlers = {};
                    self.addEventListener("message", function (ev) {
                        var id = ev.data[0];
                        var event = ev.data[1];
                        var data = ev.data[2];
                        function reply(data, transferable) {
                            if (!Array.isArray(transferable)) transferable = [];
                            _self.postMessage([id, data], transferable);
                        }
                        handlers[event](data, reply);
                    });
                    _self.on = function (event, callback) {
                        handlers[event] = callback;
                    };
                }
            }
        }, {
            key: "request",
            value: function request(event, data, transferable) {
                var _this2 = this;

                if (!Array.isArray(transferable)) transferable = [];
                return new Promise(function (resolve, reject) {
                    var id = _this2.requestId++;
                    _this2.worker.postMessage([id, event, data], transferable);
                    _this2.callbacks[id] = function (_data) {
                        return resolve(Promise.resolve(_data));
                    };
                });
            }
        }, {
            key: "terminate",
            value: function terminate() {
                this.worker.terminate();
                this.blobURLs.forEach(URL.revokeObjectURL);
            }
        }]);

        return BlobWorker;
    })();

    cuttlebone.BlobWorker = BlobWorker;
})(cuttlebone || (cuttlebone = {}));