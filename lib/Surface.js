/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var $ = jQuery;

var Surface = (function (_EventEmitter2) {
    _inherits(Surface, _EventEmitter2);

    function Surface(canvas, scopeId, surfaceId, shell) {
        var _this = this;

        _classCallCheck(this, Surface);

        _get(Object.getPrototypeOf(Surface.prototype), "constructor", this).call(this);
        EventEmitter2.call(this);
        var $elm = $(canvas);
        $elm.on("contextmenu", function (ev) {
            return processMouseEvent(ev, "mouseclick", _this, false, "");
        });
        $elm.on("click", function (ev) {
            return processMouseEvent(ev, "mouseclick", _this, false, "");
        });
        $elm.on("dblclick", function (ev) {
            return processMouseEvent(ev, "mousedblclick", _this, false, "");
        });
        $elm.on("mousedown", function (ev) {
            return processMouseEvent(ev, "mousedown", _this, false, "");
        });
        $elm.on("mousemove", function (ev) {
            return processMouseEvent(ev, "mousemove", _this, false, "");
        });
        $elm.on("mouseup", function (ev) {
            return processMouseEvent(ev, "mouseup", _this, false, "");
        });
        var tid = 0;
        var touchCount = 0;
        var touchStartTime = 0;
        $elm.on("touchmove", function (ev) {
            return processMouseEvent(ev, "mousemove", _this, false, "");
        });
        $elm.on("touchend", function (ev) {
            processMouseEvent(ev, "mouseup", _this, false, "");
            processMouseEvent(ev, "mouseclick", _this, false, "");
            if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                processMouseEvent(ev, "mousedblclick", _this, false, "");
            }
        });
        $elm.on("touchstart", function (ev) {
            touchCount++;
            touchStartTime = Date.now();
            processMouseEvent(ev, "mousedown", _this, false, "");
            clearTimeout(tid);
            tid = setTimeout(function () {
                return touchCount = 0;
            }, 500);
        });
        this.element = canvas;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.surfaceResources = shell.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.bufRender = new _SurfaceRender.SurfaceRender(this.bufferCanvas);
        this.elmRender = new _SurfaceRender.SurfaceRender(this.element);
        this.destructed = false;
        this.layers = {};
        this.stopFlags = {};
        this.talkCount = 0;
        this.talkCounts = {};
        this.initAnimations();
        this.render();
    }

    _createClass(Surface, [{
        key: "initAnimations",
        value: function initAnimations() {
            var _this2 = this;

            this.surfaceResources.animations.forEach(function (anim) {
                _this2.initAnimation(anim);
            });
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(anim) {
            var _this3 = this;

            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;

            var tmp = interval.split(",");
            var _interval = tmp[0];
            if (tmp.length > 1) {
                var n = Number(tmp[1]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4;
                }
            }
            switch (_interval) {
                case "sometimes":
                    SurfaceUtil.random(function (callback) {
                        if (!_this3.destructed && !_this3.stopFlags[is]) {
                            _this3.play(is, callback);
                        }
                    }, 2);
                    break;
                case "rarely":
                    SurfaceUtil.random(function (callback) {
                        if (!_this3.destructed && !_this3.stopFlags[is]) {
                            _this3.play(is, callback);
                        }
                    }, 4);
                    break;
                case "random":
                    SurfaceUtil.random(function (callback) {
                        if (!_this3.destructed && !_this3.stopFlags[is]) {
                            _this3.play(is, callback);
                        }
                    }, n);
                    break;
                case "periodic":
                    SurfaceUtil.periodic(function (callback) {
                        if (!_this3.destructed && !_this3.stopFlags[is]) {
                            _this3.play(is, callback);
                        }
                    }, n);
                    break;
                case "always":
                    SurfaceUtil.always(function (callback) {
                        if (!_this3.destructed && !_this3.stopFlags[is]) {
                            _this3.play(is, callback);
                        }
                    });
                    break;
                case "runonce":
                    this.play(is);
                    break;
                case "never":
                    break;
                case "yen-e":
                    break;
                case "talk":
                    this.talkCounts[is] = n;
                    break;
                default:
                    if (/^bind/.test(interval)) {
                        this.initBind(anim);
                        break;
                    }
                    console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
            }
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this4 = this;

            this.surfaceResources.animations.forEach(function (anim) {
                var is = anim.is;
                var interval = anim.interval;
                var patterns = anim.patterns;

                if (/^bind/.test(interval)) {
                    _this4.initBind(anim);
                }
            });
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this5 = this;

            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            if (!this.shell.bindgroup[is]) {
                delete this.layers[is];
                this.stop(is);
                return;
            }

            var _interval$split = interval.split("+");

            var _interval$split2 = _toArray(_interval$split);

            var _bind = _interval$split2[0];

            var intervals = _interval$split2.slice(1);

            intervals.forEach(function (itvl) {
                _this5.initAnimation({ interval: itvl, is: is, patterns: patterns, option: option });
            });
            if (intervals.length > 0) return;
            this.layers[is] = patterns[patterns.length - 1];
            this.render();
        }
    }, {
        key: "destructor",
        value: function destructor() {
            this.elmRender.clear();
            this.destructed = true;
            this.layers = {};
        }
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            var renderLayers = Object.keys(this.layers).sort(function (layerNumA, layerNumB) {
                return Number(layerNumA) > Number(layerNumB) ? 1 : -1;
            }).map(function (key) {
                return _this6.layers[Number(key)];
            }).reduce(function (arr, pattern) {
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface === -1) return arr;
                var srf = _this6.shell.surfaceTree[surface];
                if (srf == null) return arr;
                var rndr = new _SurfaceRender.SurfaceRender(SurfaceUtil.copy(srf.base));
                rndr.composeElements(srf.elements);
                //
                //
                return arr.concat({
                    type: type,
                    x: x,
                    y: y,
                    canvas: rndr.cnv
                });
            }, []);
            var srfNode = this.surfaceResources;
            this.bufRender.init(srfNode.base);
            this.bufRender.composeElements(srfNode.elements);
            this.bufRender.composeElements(renderLayers);
            if (this.shell.enableRegionDraw) {
                this.bufRender.ctx.fillText("" + this.surfaceId, 5, 10);
                this.bufRender.drawRegions(srfNode.collisions);
            }
            this.elmRender.init(this.bufRender.cnv);
        }
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this7 = this;

            var anims = this.surfaceResources.animations;
            var anim = this.surfaceResources.animations[animationId];
            if (!anim) return void setTimeout(callback);
            // lazyPromises: [()=> Promise<void>, ()=> Promise<void>, ...]
            var lazyPromises = anim.patterns.map(function (pattern) {
                return function () {
                    return new Promise(function (resolve, reject) {
                        var surface = pattern.surface;
                        var wait = pattern.wait;
                        var type = pattern.type;
                        var x = pattern.x;
                        var y = pattern.y;
                        var animation_ids = pattern.animation_ids;

                        switch (type) {
                            case "start":
                                _this7.play(animation_ids[0], function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "stop":
                                _this7.stop(animation_ids[0]);
                                setTimeout(function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "alternativestart":
                                _this7.play(SurfaceUtil.choice(animation_ids), function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "alternativestart":
                                _this7.stop(SurfaceUtil.choice(animation_ids));
                                setTimeout(function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                        }
                        _this7.layers[animationId] = pattern;
                        _this7.render();

                        var _ref = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                        var _ref2 = _slicedToArray(_ref, 3);

                        var __ = _ref2[0];
                        var a = _ref2[1];
                        var b = _ref2[2];

                        var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                        setTimeout(function () {
                            if (_this7.destructed) {
                                reject(null);
                            } else {
                                resolve(Promise.resolve());
                            }
                        }, _wait);
                    });
                };
            });
            var promise = lazyPromises.reduce(function (proA, proB) {
                return proA.then(proB);
            }, Promise.resolve()); // Promise.resolve().then(prom).then(prom)...
            promise.then(function () {
                return setTimeout(callback);
            })["catch"](function (err) {
                if (!!err) console.error(err.stack);
            });
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            this.stopFlags[animationId] = true;
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this8 = this;

            var animations = this.surfaceResources.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim) {
                return (/^talk/.test(anim.interval) && _this8.talkCount % _this8.talkCounts[anim.is] === 0
                );
            });
            hits.forEach(function (anim) {
                _this8.play(anim.is);
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this9 = this;

            var animations = this.surfaceResources.animations;
            var hits = animations.filter(function (anim) {
                return anim.interval === "yen-e" && _this9.talkCount % _this9.talkCounts[anim.is] === 0;
            });
            hits.forEach(function (anim) {
                _this9.play(anim.is);
            });
        }
    }, {
        key: "getRegion",
        value: function getRegion(offsetX, offsetY) {
            var _this10 = this;

            if (SurfaceUtil.isHit(this.element, offsetX, offsetY)) {
                var hitCols = this.surfaceResources.collisions.filter(function (collision, colId) {
                    var type = collision.type;
                    var name = collision.name;
                    var left = collision.left;
                    var top = collision.top;
                    var right = collision.right;
                    var bottom = collision.bottom;
                    var coordinates = collision.coordinates;
                    var radius = collision.radius;
                    var center_x = collision.center_x;
                    var center_y = collision.center_y;

                    switch (type) {
                        case "rect":
                            return left < offsetX && offsetX < right && top < offsetY && offsetY < bottom || right < offsetX && offsetX < left && bottom < offsetX && offsetX < top;
                        case "ellipse":
                            var width = Math.abs(right - left);
                            var height = Math.abs(bottom - top);
                            return Math.pow((offsetX - (left + width / 2)) / (width / 2), 2) + Math.pow((offsetY - (top + height / 2)) / (height / 2), 2) < 1;
                        case "circle":
                            return Math.pow((offsetX - center_x) / radius, 2) + Math.pow((offsetY - center_y) / radius, 2) < 1;
                        case "polygon":
                            var ptC = { x: offsetX, y: offsetY };
                            var tuples = coordinates.reduce(function (arr, _ref3, i) {
                                var x = _ref3.x;
                                var y = _ref3.y;

                                arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                                return arr;
                            }, []);
                            var deg = tuples.reduce(function (sum, _ref4) {
                                var _ref42 = _slicedToArray(_ref4, 2);

                                var ptA = _ref42[0];
                                var ptB = _ref42[1];

                                var vctA = [ptA.x - ptC.x, ptA.y - ptC.y];
                                var vctB = [ptB.x - ptC.x, ptB.y - ptC.y];
                                var dotP = vctA[0] * vctB[0] + vctA[1] * vctB[1];
                                var absA = Math.sqrt(vctA.map(function (a) {
                                    return Math.pow(a, 2);
                                }).reduce(function (a, b) {
                                    return a + b;
                                }));
                                var absB = Math.sqrt(vctB.map(function (a) {
                                    return Math.pow(a, 2);
                                }).reduce(function (a, b) {
                                    return a + b;
                                }));
                                var rad = Math.acos(dotP / (absA * absB));
                                return sum + rad;
                            }, 0);
                            return deg / (2 * Math.PI) >= 1;
                        default:
                            console.warn("unkown collision type:", _this10.surfaceId, colId, name, collision);
                            return false;
                    }
                });
                if (hitCols.length > 0) return { isHit: true, name: hitCols[hitCols.length - 1].name };
                return { isHit: true, name: "" };
            } else {
                return { isHit: false, name: "" };
            }
        }
    }]);

    return Surface;
})(EventEmitter2);

exports.Surface = Surface;

function processMouseEvent(ev, type, srf, isPointerEventsShimed, lastEventType) {
    $(ev.target).css({ "cursor": "default" });
    if (isPointerEventsShimed && ev.type === lastEventType) {
        lastEventType = "";
        isPointerEventsShimed = false;
        ev.stopPropagation();
        ev.preventDefault();
        return;
    }
    if (/^touch/.test(ev.type)) {
        var changedTouches = ev["changedTouches"];
        var _changedTouches$0 = changedTouches[0];
        var pageX = _changedTouches$0.pageX;
        var pageY = _changedTouches$0.pageY;
    } else {
        var pageX = ev.pageX;
        var pageY = ev.pageY;
    }

    var _$$offset = $(ev.target).offset();

    var left = _$$offset.left;
    var top = _$$offset.top;

    var offsetX = pageX - left;
    var offsetY = pageY - top;
    var hit = srf.getRegion(offsetX, offsetY);
    if (hit.isHit) {
        ev.preventDefault();
        var detail = {
            "type": type,
            "offsetX": offsetX | 0,
            "offsetY": offsetY | 0,
            "wheel": 0,
            "scope": srf.scopeId,
            "region": hit.name,
            "button": ev.button === 2 ? 1 : 0
        };
        if (hit.name.length > 0) {
            if (/^touch/.test(ev.type)) {
                ev.stopPropagation(); // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
            }
            $(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
        }
        srf.emit(type, $.Event('type', { detail: detail, bubbles: true }));
    } else {
        // pointer-events shim
        // canvasの透明領域のマウスイベントを真下の要素に投げる
        var elm = SurfaceUtil.elementFromPointWithout(ev.target, ev.pageX, ev.pageY);
        if (!elm) return;
        if (/^mouse/.test(ev.type)) {
            isPointerEventsShimed = true;
            lastEventType = ev.type;
            ev.preventDefault();
            ev.stopPropagation();
            var _ev = document.createEvent("MouseEvent");
            !!_ev.initMouseEvent && _ev.initMouseEvent(ev.type, ev.bubbles, ev.cancelable, ev.view, ev.detail, ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.button, ev.relatedTarget);
            elm.dispatchEvent(_ev);
        } else if (/^touch/.test(ev.type) && !!document.createTouchList) {
            isPointerEventsShimed = true;
            lastEventType = ev.type;
            ev.preventDefault();
            ev.stopPropagation();
            var touches = document.createTouchList();
            touches[0] = document.createTouch(document.body, ev.target, 0, //identifier
            ev.pageX, ev.pageY, ev.screenX, ev.screenY, ev.clientX, ev.clientY, 1, //radiusX
            1, //radiusY
            0, //rotationAngle
            1.0); //force
            var _ev = document.createEvent("TouchEvent");
            _ev.initTouchEvent(touches, //TouchList* touches,
            touches, //TouchList* targetTouches,
            touches, //TouchList* changedTouches,
            ev.type, ev.view, //PassRefPtr<AbstractView> view,
            ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey);
            elm.dispatchEvent(_ev);
        }
    }
}