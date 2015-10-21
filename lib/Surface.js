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
        _classCallCheck(this, Surface);

        _get(Object.getPrototypeOf(Surface.prototype), "constructor", this).call(this);
        EventEmitter2.call(this);
        // public
        this.element = canvas;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.destructed = false;
        // private
        this.surfaceResources = shell.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.bufRender = new _SurfaceRender.SurfaceRender(this.bufferCanvas);
        this.elmRender = new _SurfaceRender.SurfaceRender(this.element);
        this.destructors = [];
        this.layers = {};
        this.stopFlags = {};
        this.talkCount = 0;
        this.talkCounts = {};
        // initialize methods
        this.initMouseEvent();
        this.initAnimations();
        this.render();
    }

    // public methods

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.elmRender.clear();
            this.destructed = true;
            this.layers = {};
        }
    }, {
        key: "render",
        value: function render() {
            var _this = this;

            // this.layersが数字をキーとした辞書なのでレイヤー順にソート
            var sorted = Object.keys(this.layers).sort(function (layerNumA, layerNumB) {
                return Number(layerNumA) > Number(layerNumB) ? 1 : -1;
            });
            var renderLayers = sorted.map(function (key) {
                return _this.layers[Number(key)];
            }).reduce(function (arr, pattern) {
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface === -1) return arr; // idが-1つまり非表示指定
                var srf = _this.shell.surfaceTree[surface];
                if (srf == null) {
                    console.warn("Surface#render: surface id " + surface + " is not defined.", pattern);
                    console.warn(surface, Object.keys(_this.shell.surfaceTree));
                    return arr; // 対象サーフェスがないのでスキップ
                }
                var base = srf.base;
                var elements = srf.elements;

                // 対象サーフェスのbaseサーフェス(surface*.png)の上に
                var rndr = new _SurfaceRender.SurfaceRender(SurfaceUtil.copy(base));
                // elementを合成する
                rndr.composeElements(elements);
                return arr.concat({
                    type: type,
                    x: x,
                    y: y,
                    canvas: rndr.cnv
                });
            }, []);
            var srfNode = this.surfaceResources;
            // this.surfaceIdが持つ情報。型をみて。
            this.bufRender.init(srfNode.base); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            this.bufRender.composeElements(srfNode.elements); // ベースサーフェスの上にエレメントを合成
            this.bufRender.composeElements(renderLayers); //現在有効なアニメーションのレイヤを合成
            if (this.shell.enableRegionDraw) {
                this.bufRender.ctx.fillText("" + this.surfaceId, 5, 10);
                this.bufRender.drawRegions(srfNode.collisions);
            }
            this.elmRender.init(this.bufRender.cnv); //バッファから実DOMTree上のcanvasへ描画
        }
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this2 = this;

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
                                _this2.play(animation_ids[0], function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "stop":
                                _this2.stop(animation_ids[0]);
                                setTimeout(function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "alternativestart":
                                _this2.play(SurfaceUtil.choice(animation_ids), function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                            case "alternativestart":
                                _this2.stop(SurfaceUtil.choice(animation_ids));
                                setTimeout(function () {
                                    return resolve(Promise.resolve());
                                });
                                return;
                        }
                        _this2.layers[animationId] = pattern;
                        _this2.render();

                        var _ref = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                        var _ref2 = _slicedToArray(_ref, 3);

                        var __ = _ref2[0];
                        var a = _ref2[1];
                        var b = _ref2[2];

                        var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                        setTimeout(function () {
                            if (_this2.destructed) {
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
            var _this3 = this;

            var animations = this.surfaceResources.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim) {
                return (/^talk/.test(anim.interval) && _this3.talkCount % _this3.talkCounts[anim.is] === 0
                );
            });
            hits.forEach(function (anim) {
                _this3.play(anim.is);
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this4 = this;

            var animations = this.surfaceResources.animations;
            var hits = animations.filter(function (anim) {
                return anim.interval === "yen-e" && _this4.talkCount % _this4.talkCounts[anim.is] === 0;
            });
            hits.forEach(function (anim) {
                _this4.play(anim.is);
            });
        }

        // private methods
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this5 = this;

            this.initMouseEvent = function () {
                console.warn("initMouseEvent allows only first call. this call is second call.");
            };
            // 副作用あり
            var $elm = $(this.element);
            var tid = 0;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            tuples.push(["contextmenu", function (ev) {
                return _this5.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["click", function (ev) {
                return _this5.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["dblclick", function (ev) {
                return _this5.processMouseEvent(ev, "mousedblclick");
            }]);
            tuples.push(["mousedown", function (ev) {
                return _this5.processMouseEvent(ev, "mousedown");
            }]);
            tuples.push(["mousemove", function (ev) {
                return _this5.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["mouseup", function (ev) {
                return _this5.processMouseEvent(ev, "mouseup");
            }]);
            tuples.push(["touchmove", function (ev) {
                return _this5.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["touchend", function (ev) {
                _this5.processMouseEvent(ev, "mouseup");
                _this5.processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    // ダブルタップ->ダブルクリック変換
                    _this5.processMouseEvent(ev, "mousedblclick");
                }
            }]);
            tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                _this5.processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(function () {
                    return touchCount = 0;
                }, 500);
            }]);
            // イベント登録
            tuples.forEach(function (_ref3) {
                var _ref32 = _slicedToArray(_ref3, 2);

                var ev = _ref32[0];
                var handler = _ref32[1];
                return $elm.on(ev, handler);
            });
            this.destructors.push(function () {
                // イベント解除
                tuples.forEach(function (_ref4) {
                    var _ref42 = _slicedToArray(_ref4, 2);

                    var ev = _ref42[0];
                    var handler = _ref42[1];
                    return $elm.off(ev, handler);
                });
            });
        }
    }, {
        key: "initAnimations",
        value: function initAnimations() {
            var _this6 = this;

            this.initAnimations = function () {
                console.warn("initAnimations allows only first call. this call is second call.");
            };
            // 副作用あり
            // このサーフェスのアニメーションを登録する
            this.surfaceResources.animations.forEach(function (anim) {
                _this6.initAnimation(anim);
            });
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(anim) {
            var _this7 = this;

            // 副作用あり
            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
            var tmp = interval.split(",");
            var _interval = tmp[0];
            if (tmp.length > 1) {
                var n = Number(tmp[1]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4; // rarelyにfaileback
                }
            }
            // アニメーション描画タイミングの登録
            switch (_interval) {
                // nextTickを呼ぶともう一回random
                case "sometimes":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this7.destructed && !_this7.stopFlags[animId]) {
                            _this7.play(animId, nextTick);
                        }
                    }, 2);
                    break;
                case "rarely":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this7.destructed && !_this7.stopFlags[animId]) {
                            _this7.play(animId, nextTick);
                        }
                    }, 4);
                    break;
                case "random":
                    SurfaceUtil.random(function (nextTick) {
                        if (!_this7.destructed && !_this7.stopFlags[animId]) {
                            _this7.play(animId, nextTick);
                        }
                    }, n);
                    break;
                case "periodic":
                    SurfaceUtil.periodic(function (nextTick) {
                        if (!_this7.destructed && !_this7.stopFlags[animId]) {
                            _this7.play(animId, nextTick);
                        }
                    }, n);
                    break;
                case "always":
                    SurfaceUtil.always(function (nextTick) {
                        if (!_this7.destructed && !_this7.stopFlags[animId]) {
                            _this7.play(animId, nextTick);
                        }
                    });
                    break;
                case "runonce":
                    this.play(animId);
                    break;
                case "never":
                    break;
                case "yen-e":
                    break;
                case "talk":
                    this.talkCounts[animId] = n;
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
            var _this8 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれるようだ
            this.surfaceResources.animations.forEach(function (anim) {
                var is = anim.is;
                var interval = anim.interval;
                var patterns = anim.patterns;

                if (/^bind/.test(interval)) {
                    _this8.initBind(anim);
                }
            });
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this9 = this;

            // kyuu ni nihongo utenaku natta.
            // initAnimation calls this method for animation interval type "bind".
            // updateBind calls this method.
            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            if (!this.shell.bindgroup[this.scopeId][is]) {
                delete this.layers[is];
                this.stop(is);
                return;
            }

            var _interval$split = interval.split("+");

            var _interval$split2 = _toArray(_interval$split);

            var _bind = _interval$split2[0];

            var intervals = _interval$split2.slice(1);

            if (intervals.length > 0) return;
            intervals.forEach(function (itvl) {
                _this9.initAnimation({ interval: itvl, is: is, patterns: patterns, option: option });
            });
            this.layers[is] = patterns[patterns.length - 1];
            this.render();
        }
    }, {
        key: "getRegion",
        value: function getRegion(offsetX, offsetY) {
            var _this10 = this;

            // canvas左上からの座標の位置が透明かそうでないか、当たり判定領域か、名前があるかを調べるメソッド
            // 副作用なし
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
                            var tuples = coordinates.reduce(function (arr, _ref5, i) {
                                var x = _ref5.x;
                                var y = _ref5.y;

                                arr.push([coordinates[i], !!coordinates[i + 1] ? coordinates[i + 1] : coordinates[0]]);
                                return arr;
                            }, []);
                            var deg = tuples.reduce(function (sum, _ref6) {
                                var _ref62 = _slicedToArray(_ref6, 2);

                                var ptA = _ref62[0];
                                var ptB = _ref62[1];

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
    }, {
        key: "processMouseEvent",
        value: function processMouseEvent(ev, type) {
            // マウスイベントの共通処理
            // 副作用なし。イベント発火する。
            $(ev.target).css({ "cursor": "default" });
            if (/^touch/.test(ev.type)) {
                var changedTouches = ev["changedTouches"]; //そういうプロパティがあるんです（おこ
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

            var offsetX = pageX - left; //canvas左上からのx座標
            var offsetY = pageY - top; //canvas左上からのy座標
            var hit = this.getRegion(offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            ev.preventDefault();
            var custom = {
                "type": type,
                "offsetX": offsetX | 0,
                "offsetY": offsetY | 0,
                "wheel": 0,
                "scope": this.scopeId,
                "region": hit.name,
                "button": ev.button === 2 ? 1 : 0,
                "transparency": !hit.isHit
            };
            if (hit.name !== "") {
                if (/^touch/.test(ev.type)) {
                    ev.stopPropagation();
                }
                $(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
            }
            this.emit(type, custom, ev); // 第三引数のjQueryEventは非公式です。
        }
    }]);

    return Surface;
})(EventEmitter2);

exports.Surface = Surface;