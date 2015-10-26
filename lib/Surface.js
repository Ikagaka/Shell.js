"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var Surface = (function () {
    function Surface(canvas, scopeId, surfaceId, shell) {
        var _this = this;

        _classCallCheck(this, Surface);

        this.element = canvas;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.shell = shell;
        this.width = 0;
        this.height = 0;
        this.position = "fixed";
        this.surfaceNode = shell.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.bufRender = new _SurfaceRender.SurfaceRender(this.bufferCanvas);
        this.elmRender = new _SurfaceRender.SurfaceRender(this.element);
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = {};
        this.backgrounds = {};
        this.layers = {};
        this.stopFlags = {};
        this.destructed = false;
        this.destructors = [];
        this.initMouseEvent();
        this.surfaceNode.animations.forEach(function (anim) {
            _this.initAnimation(anim);
        });
        this.render();
    }

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.element = null;
            this.shell = null;
            this.elmRender.clear();
            this.surfaceNode = null;
            this.element = null;
            this.elmRender = null;
            this.layers = {};
            this.animationsQueue = {};
            this.talkCounts = {};
            this.destructors = [];
            this.destructed = true;
        }
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this2 = this;

            var $elm = $(this.element);
            var tid = 0;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            var processMouseEvent = function processMouseEvent(ev, type) {
                $(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ

                var _SurfaceUtil$getEventPosition = SurfaceUtil.getEventPosition(ev);

                var pageX = _SurfaceUtil$getEventPosition.pageX;
                var pageY = _SurfaceUtil$getEventPosition.pageY;
                var clientX = _SurfaceUtil$getEventPosition.clientX;
                var clientY = _SurfaceUtil$getEventPosition.clientY;

                var _$$offset = $(ev.target).offset();

                var left = _$$offset.left;
                var top = _$$offset.top;

                var _ref = _this2.position !== "fixed" ? [pageX, pageY] : [clientX, clientY];

                var _ref2 = _slicedToArray(_ref, 2);

                var baseX = _ref2[0];
                var baseY = _ref2[1];

                var _ref3 = _this2.position !== "fixed" ? [left, top] : [left - window.scrollX, top - window.scrollY];

                var _ref32 = _slicedToArray(_ref3, 2);

                var _left = _ref32[0];
                var _top = _ref32[1];

                var offsetX = baseX - _left; //canvas左上からのx座標
                var offsetY = baseY - _top; //canvas左上からのy座標
                var hit = SurfaceUtil.getRegion(_this2.element, _this2.surfaceNode, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
                var custom = {
                    "type": type,
                    "offsetX": offsetX | 0,
                    "offsetY": offsetY | 0,
                    "wheel": 0,
                    "scopeId": _this2.scopeId,
                    "region": hit.name,
                    "button": ev.button === 2 ? 1 : 0,
                    "transparency": !hit.isHit,
                    "event": ev }; // onした先でpriventDefaultとかstopPropagationとかしたいので
                if (hit.name !== "") {
                    ev.preventDefault();
                    if (/^touch/.test(ev.type)) {
                        ev.stopPropagation();
                    }
                    // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
                    // ために親要素にイベント伝えない
                    $(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
                }
                _this2.shell.emit("mouse", custom);
            }; // processMouseEventここまで
            tuples.push(["contextmenu", function (ev) {
                return processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["click", function (ev) {
                return processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["dblclick", function (ev) {
                return processMouseEvent(ev, "mousedblclick");
            }]);
            tuples.push(["mousedown", function (ev) {
                return processMouseEvent(ev, "mousedown");
            }]);
            tuples.push(["mousemove", function (ev) {
                return processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["mouseup", function (ev) {
                return processMouseEvent(ev, "mouseup");
            }]);
            tuples.push(["touchmove", function (ev) {
                return processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["touchend", function (ev) {
                processMouseEvent(ev, "mouseup");
                processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
            tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(function () {
                    return touchCount = 0;
                }, 500);
            }]);
            tuples.forEach(function (_ref4) {
                var _ref42 = _slicedToArray(_ref4, 2);

                var ev = _ref42[0];
                var handler = _ref42[1];
                return $elm.on(ev, handler);
            }); // イベント登録
            this.destructors.push(function () {
                tuples.forEach(function (_ref5) {
                    var _ref52 = _slicedToArray(_ref5, 2);

                    var ev = _ref52[0];
                    var handler = _ref52[1];
                    return $elm.off(ev, handler);
                }); // イベント解除
            });
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(anim) {
            var _this3 = this;

            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。

            var _interval$split = interval.split(",");

            var _interval$split2 = _toArray(_interval$split);

            var _interval = _interval$split2[0];

            var rest = _interval$split2.slice(1);

            if (rest.length > 1) {
                var n = Number(rest[0]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4;
                }
            } // rarelyにfaileback
            // アニメーション描画タイミングの登録
            var fn = function fn(nextTick) {
                if (!_this3.destructed && !_this3.stopFlags[animId]) {
                    _this3.play(animId, nextTick);
                }
            };
            switch (_interval) {
                // nextTickを呼ぶともう一回random
                case "sometimes":
                    SurfaceUtil.random(fn, 2);
                    break;
                case "rarely":
                    SurfaceUtil.random(fn, 4);
                    break;
                case "random":
                    SurfaceUtil.random(fn, n);
                    break;
                case "periodic":
                    SurfaceUtil.periodic(fn, n);
                    break;
                case "always":
                    SurfaceUtil.always(fn);
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
                        this.initBind(anim); // bindのことはinitBindにまるなげ
                        break;
                    }
                    console.warn("Surface#initAnimation > unkown SERIKO or MAYURA interval:", interval, anim);
            }
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this4 = this;

            // bind+somtimesみたいなやつを分解
            var is = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            var _interval$split3 = interval.split("+");

            var _interval$split32 = _toArray(_interval$split3);

            var _bind = _interval$split32[0];

            var intervals = _interval$split32.slice(1);

            if (intervals.length > 0) return;
            intervals.forEach(function (interval) {
                _this4.initAnimation({ interval: interval, is: is, patterns: patterns, option: option });
            });
            var option = anim.option;

            if (option === "background") {
                this.backgrounds[is] = patterns[patterns.length - 1];
            } else {
                this.layers[is] = patterns[patterns.length - 1];
            }
            this.render();
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this5 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれるようだ
            this.surfaceNode.animations.forEach(function (anim) {
                var is = anim.is;
                var interval = anim.interval;
                var patterns = anim.patterns;

                if (_this5.shell.bindgroup[_this5.scopeId] == null) return;
                if (_this5.shell.bindgroup[_this5.scopeId][is] == null) return;
                if (!/^bind/.test(interval)) return;
                if (_this5.shell.bindgroup[_this5.scopeId][is] === true) {
                    _this5.initBind(anim);
                } else {
                    delete _this5.layers[is];
                }
            });
        }

        // アニメーションタイミングループの開始
    }, {
        key: "begin",
        value: function begin(animationId) {
            this.stopFlags[animationId] = false;
            var anim = this.surfaceNode.animations[animationId];
            this.initAnimation(anim);
        }

        // アニメーションタイミングループの開始
    }, {
        key: "end",
        value: function end(animationId) {
            this.stopFlags[animationId] = true;
        }

        // アニメーション再生
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this6 = this;

            if (this.destructed) return;
            var anims = this.surfaceNode.animations;
            var anim = this.surfaceNode.animations[animationId];
            if (anim == null) return void setTimeout(callback); // そんなアニメーションはない
            this.animationsQueue[animationId] = anim.patterns.map(function (pattern) {
                return function () {
                    var surface = pattern.surface;
                    var wait = pattern.wait;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;
                    var animation_ids = pattern.animation_ids;

                    switch (type) {
                        case "start":
                            return _this6.play(animation_ids[0], nextTick);
                        case "stop":
                            return _this6.stop(animation_ids[0]);
                            setTimeout(nextTick);
                        case "alternativestart":
                            return _this6.play(SurfaceUtil.choice(animation_ids), nextTick);
                        case "alternativestart":
                            return _this6.stop(SurfaceUtil.choice(animation_ids));
                            setTimeout(nextTick);
                    }

                    var _ref6 = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                    var _ref62 = _slicedToArray(_ref6, 3);

                    var __ = _ref62[0];
                    var a = _ref62[1];
                    var b = _ref62[2];

                    var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                    setTimeout(function () {
                        if (anim.option === "background") {
                            _this6.backgrounds[animationId] = pattern;
                        } else {
                            console.log(animationId, _this6.layers);
                            _this6.layers[animationId] = pattern;
                        }
                        _this6.render();
                        nextTick();
                    }, _wait);
                };
            });
            var nextTick = function nextTick() {
                if (_this6.destructed) return;
                var next = _this6.animationsQueue[animationId].shift();
                if (!(next instanceof Function)) {
                    // stop pattern animation.
                    _this6.animationsQueue[animationId] = [];
                    setTimeout(callback);
                } else next();
            };
            if (this.animationsQueue[animationId][0] instanceof Function) {
                this.animationsQueue[animationId][0]();
            }
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            this.animationsQueue[animationId] = []; // アニメーションキューを破棄
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this7 = this;

            var anims = this.surfaceNode.animations;
            anims.forEach(function (anim) {
                // この条件式よくわからない
                if (anim.interval === "yen-e" && _this7.talkCount % _this7.talkCounts[anim.is] === 0) {
                    _this7.play(anim.is);
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this8 = this;

            if (this.destructed) return;
            // this.layersが数字をキーとした辞書なのでレイヤー順にソート
            var sortedKeys = Object.keys(this.layers).sort(function (layerNumA, layerNumB) {
                return Number(layerNumA) > Number(layerNumB) ? 1 : -1;
            });
            var layers = sortedKeys.map(function (key) {
                return _this8.layers[Number(key)];
            });
            var renderLayers = [];
            layers.forEach(function (pattern, i) {
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface === -1) return; // idが-1つまり非表示指定
                var srf = _this8.shell.surfaceTree[surface]; // 該当のサーフェス
                if (srf == null) {
                    console.warn("Surface#render: surface id " + surface + " is not defined.", pattern);
                    console.warn(surface, Object.keys(_this8.shell.surfaceTree));
                    return; // 対象サーフェスがないのでスキップ
                }
                // 対象サーフェスを構築描画する
                var base = srf.base;
                var elements = srf.elements;

                var rndr = new _SurfaceRender.SurfaceRender(SurfaceUtil.copy(base)); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
                rndr.composeElements(elements); // elementを合成する
                renderLayers.push({ type: type, x: x, y: y, canvas: rndr.cnv });
            });
            if (sortedKeys.length > 0 && Number(sortedKeys[0]) < 0) {
                console.info("background layer detected", sortedKeys, layers[-sortedKeys], layers, renderLayers);
            } else {
                // 物理ベースサーフェスを基準に
                renderLayers.unshift({ type: "overlay", canvas: SurfaceUtil.copy(this.surfaceNode.base), x: 0, y: 0 });
            }
            renderLayers = renderLayers.concat(this.surfaceNode.elements); // エレメントを合成
            this.bufRender.init(renderLayers[0].canvas); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            this.bufRender.composeElements(renderLayers.slice(1)); // 現在有効なアニメーションのレイヤを合成
            if (this.shell.enableRegionDraw) {
                this.bufRender.ctx.fillText("" + this.surfaceId, 5, 10);
                this.bufRender.drawRegions(this.surfaceNode.collisions);
            }
            this.elmRender.init(this.bufRender.cnv); // バッファから実DOMTree上のcanvasへ描画
            this.width = this.element.width;
            this.height = this.element.height;
        }
    }]);

    return Surface;
})();

exports.Surface = Surface;