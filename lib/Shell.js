/// <reference path="./Surface"/>
/// <reference path="./SurfaceUtil"/>
/// <reference path="./SurfaceRender"/>
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cuttlebone;
exports.cuttlebone = cuttlebone;
(function (cuttlebone) {
    /**
     * extend deep like jQuery $.extend(true, target, source)
     */
    function extend(target, source) {
        for (var key in source) {
            if (typeof source[key] === "object" && Object.getPrototypeOf(source[key]) === Object.prototype) {
                target[key] = target[key] || {};
                extend(target[key], source[key]);
            } else if (Array.isArray(source[key])) {
                target[key] = target[key] || [];
                extend(target[key], source[key]);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }
    /**
     * "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
     */
    function parseDescript(text) {
        text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
        while (true) {
            var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["", ""])[0];
            if (match.length === 0) break;
            text = text.replace(match, "");
        }
        var lines = text.split("\n");
        lines = lines.filter(function (line) {
            return line.length !== 0;
        }); // remove no content line
        var dic = lines.reduce(function (dic, line) {
            var tmp = line.split(",");
            var key = tmp[0];
            var vals = tmp.slice(1);
            key = key.trim();
            var val = vals.join(",").trim();
            dic[key] = val;
            return dic;
        }, {});
        return dic;
    }
    /**
     * convert some encoding txt file arraybuffer to js string
     */
    function convert(buffer) {
        //return new TextDecoder('shift_jis').decode(buffer);
        return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
    }
    /**
     * find filename that matches arg "filename" from arg "paths"
     */
    function find(paths, filename) {
        filename = filename.split("\\").join("/");
        if (filename.slice(0, 2) === "./") filename = filename.slice(2);
        var reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
        var hits = paths.filter(function (key) {
            return reg.test(key);
        });
        return hits;
    }

    var Shell = (function () {
        function Shell(directory) {
            _classCallCheck(this, Shell);

            this.directory = directory;
            this.descript = {};
            this.surfaces = [];
            this.surfacesTxt = {};
            this.surfaceTree = [];
            this.canvasCache = {};
            this.bindgroup = [];
            this.enableRegionVisible = false;
            this.enablePNGDecoder = false;
        }

        _createClass(Shell, [{
            key: "load",
            value: function load() {
                var _this = this;

                return Promise.resolve(this).then(function () {
                    return _this.loadDescript();
                }) // 1st
                .then(function () {
                    return _this.loadBindGroup();
                }) // 2nd
                .then(function () {
                    return _this.loadSurfacesTxt();
                }) // 1st
                .then(function () {
                    return _this.loadSurfaceTable();
                }) // 1st
                .then(function () {
                    return _this.loadSurfacePNG();
                }) // 2nd
                .then(function () {
                    return _this.loadCollisions();
                }) // 3rd
                .then(function () {
                    return _this.loadAnimations();
                }) // 3rd
                .then(function () {
                    return _this.loadElements();
                }) // 3rd
                ["catch"](function (err) {
                    console.error("Shell#load > ", err);
                    return Promise.reject(err);
                });
            }

            // load descript
        }, {
            key: "loadDescript",
            value: function loadDescript() {
                var descript_name = Object.keys(this.directory).filter(function (name) {
                    return (/^descript\.txt$/i.test(name)
                    );
                })[0] || "";
                if (descript_name === "") {
                    console.warn("descript.txt is not found");
                } else {
                    this.descript = parseDescript(convert(this.directory[descript_name]));
                }
                return Promise.resolve(this);
            }
        }, {
            key: "loadBindGroup",
            value: function loadBindGroup() {
                var _this2 = this;

                // load bindgroup
                var reg = /^(sakura|kero|char\d+)\.bindgroup(\d+)\.default/;
                Object.keys(this.descript).filter(function (key) {
                    return reg.test(key);
                }).forEach(function (key) {
                    var _reg$exec = reg.exec(key);

                    var _reg$exec2 = _slicedToArray(_reg$exec, 4);

                    var _ = _reg$exec2[0];
                    var charId = _reg$exec2[1];
                    var bindgroupId = _reg$exec2[2];
                    var type = _reg$exec2[3];

                    _this2.bindgroup[Number(bindgroupId)] = _this2.descript[key] === "1";
                });
                return Promise.resolve(this);
            }

            // load surfaces.txt
        }, {
            key: "loadSurfacesTxt",
            value: function loadSurfacesTxt() {
                var _this3 = this;

                var surfaces_text_names = Object.keys(this.directory).filter(function (name) {
                    return (/^surfaces.*\.txt$|^alias\.txt$/i.test(name)
                    );
                });
                if (surfaces_text_names.length === 0) {
                    console.info("surfaces.txt is not found");
                } else {
                    surfaces_text_names.forEach(function (filename) {
                        var srfs = SurfacesTxt2Yaml.txt_to_data(convert(_this3.directory[filename]), { compatible: 'ssp-lazy' });
                        extend(_this3.surfacesTxt, srfs);
                    });
                    //{ expand inherit and remove
                    Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                        if (typeof _this3.surfacesTxt.surfaces[name].is === "number" && Array.isArray(_this3.surfacesTxt.surfaces[name].base)) {
                            _this3.surfacesTxt.surfaces[name].base.forEach(function (key) {
                                extend(_this3.surfacesTxt.surfaces[name], _this3.surfacesTxt.surfaces[key]);
                            });
                            delete _this3.surfacesTxt.surfaces[name].base;
                        }
                    });
                    Object.keys(this.surfacesTxt.surfaces).forEach(function (name) {
                        if (typeof _this3.surfacesTxt.surfaces[name].is === "undefined") {
                            delete _this3.surfacesTxt.surfaces[name];
                        }
                    });
                }
                return Promise.resolve(this);
            }

            // load surfacetable.txt
        }, {
            key: "loadSurfaceTable",
            value: function loadSurfaceTable() {
                var surfacetable_name = Object.keys(this.directory).filter(function (name) {
                    return (/^surfacetable.*\.txt$/i.test(name)
                    );
                })[0] || "";
                if (surfacetable_name === "") {
                    console.info("surfacetable.txt is not found.");
                } else {
                    var txt = convert(this.directory[surfacetable_name]);
                }
                return Promise.resolve(this);
            }

            // load surface*.png and surface*.pna
        }, {
            key: "loadSurfacePNG",
            value: function loadSurfacePNG() {
                var _this4 = this;

                var surface_names = Object.keys(this.directory).filter(function (filename) {
                    return (/^surface(\d+)\.png$/i.test(filename)
                    );
                });
                var prms = surface_names.map(function (filename) {
                    var n = Number(/^surface(\d+)\.png$/i.exec(filename)[1]);
                    _this4.getPNGFromDirectory(filename).then(function (cnv) {
                        if (!_this4.surfaceTree[n]) {
                            _this4.surfaceTree[n] = {
                                base: cnv,
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        } else {
                            _this4.surfaceTree[n].base = cnv;
                        }
                    })["catch"](function (err) {
                        console.warn("Shell#loadSurfacePNG > " + err);
                        return Promise.resolve();
                    });
                });
                return Promise.all(prms).then(function () {
                    return Promise.resolve(_this4);
                });
            }

            // load elements
        }, {
            key: "loadElements",
            value: function loadElements() {
                var _this5 = this;

                var srfs = this.surfacesTxt.surfaces;
                var hits = Object.keys(srfs).filter(function (name) {
                    return !!srfs[name].elements;
                });
                var prms = hits.map(function (defname) {
                    var n = srfs[defname].is;
                    var elms = srfs[defname].elements;
                    var _prms = Object.keys(elms).map(function (elmname) {
                        var _elms$elmname = elms[elmname];
                        var is = _elms$elmname.is;
                        var type = _elms$elmname.type;
                        var file = _elms$elmname.file;
                        var x = _elms$elmname.x;
                        var y = _elms$elmname.y;

                        return _this5.getPNGFromDirectory(file).then(function (canvas) {
                            if (!_this5.surfaceTree[n]) {
                                _this5.surfaceTree[n] = {
                                    base: SurfaceUtil.createCanvas(),
                                    elements: [],
                                    collisions: [],
                                    animations: []
                                };
                            }
                            _this5.surfaceTree[n].elements[is] = { type: type, canvas: canvas, x: x, y: y };
                            return Promise.resolve(_this5);
                        })["catch"](function (err) {
                            console.warn("Shell#loadElements > " + err);
                            return Promise.resolve(_this5);
                        });
                    });
                    return Promise.all(_prms).then(function () {
                        return Promise.resolve(_this5);
                    });
                });
                return Promise.all(prms).then(function () {
                    return Promise.resolve(_this5);
                });
            }

            // load collisions
        }, {
            key: "loadCollisions",
            value: function loadCollisions() {
                var _this6 = this;

                var srfs = this.surfacesTxt.surfaces;
                Object.keys(srfs).filter(function (name) {
                    return !!srfs[name].regions;
                }).forEach(function (defname) {
                    var n = srfs[defname].is;
                    var regions = srfs[defname].regions;
                    Object.keys(regions).forEach(function (regname) {
                        if (!_this6.surfaceTree[n]) {
                            _this6.surfaceTree[n] = {
                                base: SurfaceUtil.createCanvas(),
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        }
                        var is = regions[regname].is;

                        _this6.surfaceTree[n].collisions[is] = regions[regname];
                    });
                });
                return Promise.resolve(this);
            }

            // load animations
        }, {
            key: "loadAnimations",
            value: function loadAnimations() {
                var _this7 = this;

                var srfs = this.surfacesTxt.surfaces;
                Object.keys(srfs).filter(function (name) {
                    return !!srfs[name].animations;
                }).forEach(function (defname) {
                    var n = srfs[defname].is;
                    var animations = srfs[defname].animations;
                    Object.keys(animations).forEach(function (animname) {
                        if (!_this7.surfaceTree[n]) {
                            _this7.surfaceTree[n] = {
                                base: SurfaceUtil.createCanvas(),
                                elements: [],
                                collisions: [],
                                animations: []
                            };
                        }
                        var _animations$animname = animations[animname];
                        var is = _animations$animname.is;
                        var interval = _animations$animname.interval;

                        _this7.surfaceTree[n].animations[is] = animations[animname];
                    });
                });
                return Promise.resolve(this);
            }
        }, {
            key: "hasFile",
            value: function hasFile(filename) {
                return find(Object.keys(this.directory), filename).length > 0;
            }
        }, {
            key: "getPNGFromDirectory",
            value: function getPNGFromDirectory(filename) {
                var _this8 = this;

                var cached_filename = find(Object.keys(this.canvasCache), filename)[0] || "";
                if (cached_filename !== "") {
                    return Promise.resolve(this.canvasCache[cached_filename]);
                }
                if (!this.hasFile(filename)) {
                    filename += ".png";
                    if (!this.hasFile(filename)) {
                        return Promise.reject(new Error("no such file in directory: " + filename.replace(/\.png$/i, "")));
                    }
                    console.warn("element file " + filename + " need '.png' extension");
                }
                var _filename = find(Object.keys(this.directory), filename)[0];
                var pnafilename = _filename.replace(/\.png$/i, ".pna");
                var _pnafilename = find(Object.keys(this.directory), pnafilename)[0] || "";
                var pngbuf = this.directory[_filename];
                var pnabuf = this.directory[_pnafilename];
                var render = new SurfaceRender(SurfaceUtil.createCanvas());
                var planB = function planB() {
                    // pngjs way
                    return SurfaceUtil.fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf, pnabuf).then(function (pngdata) {
                        render.initImageData(pngdata.width, pngdata.height, pngdata.data);
                        _this8.canvasCache[_filename] = render.cnv;
                        return render.cnv;
                    });
                };
                var planC = function planC() {
                    // basic way
                    return SurfaceUtil.fetchImageFromArrayBuffer(pngbuf).then(function (img) {
                        render.init(img);
                        if (_pnafilename === "") {
                            render.chromakey();
                            _this8.canvasCache[_filename] = render.cnv;
                            return render.cnv;
                        }
                        return SurfaceUtil.fetchImageFromArrayBuffer(pnabuf).then(function (pnaimg) {
                            render.pna(SurfaceUtil.copy(pnaimg));
                            _this8.canvasCache[_filename] = render.cnv;
                            return render.cnv;
                        });
                    });
                };
                if (false && this.enablePNGDecoder) {
                    return planB()["catch"](function (err) {
                        console.warn("getPNGFromDirectory(" + filename + ", pngjs) > ", err);
                        return planC();
                    })["catch"](function (err) {
                        return Promise.reject("getPNGFromDirectory(" + filename + ") > " + err);
                    });
                } else {
                    return planC()["catch"](function (err) {
                        return Promise.reject("getPNGFromDirectory(" + filename + ") > " + err);
                    });
                }
            }
        }, {
            key: "attachSurface",
            value: function attachSurface(canvas, scopeId, surfaceId) {
                var type = SurfaceUtil.scope(scopeId);
                if (typeof surfaceId === "string") {
                    if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                        var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
                    } else throw new Error("ReferenceError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
                } else if (typeof surfaceId === "number") {
                    var _surfaceId = surfaceId;
                } else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
                var tuple = this.surfaces.filter(function (tuple) {
                    return tuple[0] === canvas;
                })[0];
                if (!!tuple) throw new Error("ReferenceError: this HTMLCanvasElement is already attached");
                var srf = new Surface(canvas, scopeId, _surfaceId, this);
                this.surfaces.push([canvas, srf]);
                return srf;
            }
        }, {
            key: "detachSurface",
            value: function detachSurface(canvas) {
                var tuple = this.surfaces.filter(function (tuple) {
                    return tuple[0] === canvas;
                })[0];
                if (!tuple) return;
                tuple[1].destructor();
                this.surfaces.splice(this.surfaces.indexOf(tuple), 1);
            }
        }, {
            key: "hasSurface",
            value: function hasSurface(scopeId, surfaceId) {
                var type = SurfaceUtil.scope(scopeId);
                if (typeof surfaceId === "string") {
                    if (!!this.surfacesTxt.aliases && !!this.surfacesTxt.aliases[type] && !!this.surfacesTxt.aliases[type][surfaceId]) {
                        var _surfaceId = SurfaceUtil.choice(this.surfacesTxt.aliases[type][surfaceId]);
                    } else {
                        throw new Error("RuntimeError: surface alias scope:" + type + ", id:" + surfaceId + " is not defined.");
                    }
                } else if (typeof surfaceId === "number") {
                    var _surfaceId = surfaceId;
                } else throw new Error("TypeError: surfaceId: number|string is not match " + typeof surfaceId);
                return this.surfaceTree[_surfaceId] != null;
            }
        }, {
            key: "bind",
            value: function bind(animationId) {
                this.bindgroup[animationId] = true;
                this.surfaces.forEach(function (tuple) {
                    var _tuple = _slicedToArray(tuple, 2);

                    var _ = _tuple[0];
                    var srf = _tuple[1];

                    srf.updateBind();
                });
            }
        }, {
            key: "unbind",
            value: function unbind(animationId) {
                this.bindgroup[animationId] = false;
                this.surfaces.forEach(function (tuple) {
                    var _tuple2 = _slicedToArray(tuple, 2);

                    var _ = _tuple2[0];
                    var srf = _tuple2[1];

                    srf.updateBind();
                });
            }
        }, {
            key: "render",
            value: function render() {
                this.surfaces.forEach(function (tuple) {
                    var _tuple3 = _slicedToArray(tuple, 2);

                    var _ = _tuple3[0];
                    var srf = _tuple3[1];

                    srf.render();
                });
            }
        }]);

        return Shell;
    })();

    cuttlebone.Shell = Shell;
})(cuttlebone || (exports.cuttlebone = cuttlebone = {}));