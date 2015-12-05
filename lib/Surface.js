// todo: anim collision
// todo: background+exclusive,(1,3,5)
/// <reference path="../typings/tsd.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SurfaceRender = require("./SurfaceRender");

var _SurfaceRender2 = _interopRequireDefault(_SurfaceRender);

var _SurfaceUtil = require("./SurfaceUtil");

var SurfaceUtil = _interopRequireWildcard(_SurfaceUtil);

var _eventemitter3 = require("eventemitter3");

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var Surface = (function (_EventEmitter) {
    _inherits(Surface, _EventEmitter);

    function Surface(div, scopeId, surfaceId, surfaceTree, bindgroup) {
        var _this = this;

        _classCallCheck(this, Surface);

        _get(Object.getPrototypeOf(Surface.prototype), "constructor", this).call(this);
        this.element = div;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.cnv = SurfaceUtil.createCanvas();
        this.ctx = this.cnv.getContext("2d");
        this.element.appendChild(this.cnv);
        (0, _jquery2["default"])(this.element).css("position", "relative");
        (0, _jquery2["default"])(this.element).css("display", "inline-block");
        (0, _jquery2["default"])(this.cnv).css("position", "absolute");
        this.bindgroup = bindgroup;
        this.position = "fixed";
        this.surfaceTree = surfaceTree;
        this.surfaceNode = this.surfaceTree[surfaceId] || {
            base: { cnv: null, png: null, pna: null },
            elements: [],
            collisions: [],
            animations: []
        };
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.exclusive = -1;
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = {};
        this.backgrounds = [];
        this.layers = [];
        this.stopFlags = {};
        this.destructed = false;
        this.destructors = [];
        // GCの発生を抑えるためレンダラはこれ１つを使いまわす
        this.bufferRender = new _SurfaceRender2["default"]();
        //this.bufferRender.debug = true;
        this.initMouseEvent();
        this.surfaceNode.animations.forEach(function (anim) {
            _this.initAnimation(anim);
        });
        this.render();
    }

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            (0, _jquery2["default"])(this.element).children().remove();
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.element = null;
            this.surfaceNode = null;
            this.surfaceTree = null;
            this.bindgroup = null;
            this.element = null;
            this.layers = [];
            this.animationsQueue = {};
            this.talkCounts = {};
            this.destructors = [];
            this.removeAllListeners(null);
            this.destructed = true;
        }
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this2 = this;

            var $elm = (0, _jquery2["default"])(this.element);
            var tid = 0;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            var processMouseEvent = function processMouseEvent(ev, type) {
                (0, _jquery2["default"])(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ

                var _SurfaceUtil$getEventPosition = SurfaceUtil.getEventPosition(ev);

                var pageX = _SurfaceUtil$getEventPosition.pageX;
                var pageY = _SurfaceUtil$getEventPosition.pageY;
                var clientX = _SurfaceUtil$getEventPosition.clientX;
                var clientY = _SurfaceUtil$getEventPosition.clientY;

                var _$$offset = (0, _jquery2["default"])(ev.target).offset();

                var left = _$$offset.left;
                var top = _$$offset.top;

                // body直下 fixed だけにすべきかうーむ

                var _ref = _this2.position !== "fixed" ? [pageX, pageY] : [clientX, clientY];

                var _ref2 = _slicedToArray(_ref, 2);

                var baseX = _ref2[0];
                var baseY = _ref2[1];

                var _ref3 = _this2.position !== "fixed" ? [left, top] : [left - window.scrollX, top - window.scrollY];

                var _ref32 = _slicedToArray(_ref3, 2);

                var _left = _ref32[0];
                var _top = _ref32[1];

                var basePosY = parseInt((0, _jquery2["default"])(_this2.cnv).css("top"), 10); // overlayでのずれた分を
                var basePosX = parseInt((0, _jquery2["default"])(_this2.cnv).css("left"), 10); // とってくる
                var offsetX = baseX - _left - basePosX; //canvas左上からのx座標
                var offsetY = baseY - _top - basePosY; //canvas左上からのy座標
                var hit = SurfaceUtil.getRegion(_this2.cnv, _this2.surfaceNode, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
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
                    (0, _jquery2["default"])(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
                }
                _this2.emit("mouse", custom);
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
            var option = anim.option;
            //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
            if (option != null && !/^background$|^exclusive$/.test(option)) {
                console.warn("Surfaces#initAnimation", "unsupportted option", option, animId, anim);
            }
            var __intervals = interval.split("+"); // sometimes+talk
            if (/^bind/.test(interval)) {
                // bindから始まる場合は initBind にまるなげ
                this.initBind(anim);
                return;
            }
            if (__intervals.length > 1) {
                // bind+でなければ分解して再実行
                __intervals.forEach(function (interval) {
                    _this3.initAnimation({ interval: interval, is: animId, patterns: patterns, option: option });
                });
                return;
            }

            var _interval$split = interval.split(",");

            var _interval$split2 = _toArray(_interval$split);

            var _interval = _interval$split2[0];

            var rest = _interval$split2.slice(1);

            if (rest.length > 0) {
                var n = Number(rest[0]);
                if (!isFinite(n)) {
                    console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                    n = 4;
                }
            } // rarelyにfaileback
            // アニメーション描画タイミングの登録
            var fn = function fn(nextTick) {
                if (_this3.destructed) return;
                if (_this3.stopFlags[animId]) return;
                _this3.play(animId, nextTick);
            };
            // アニメーションを止めるための準備
            this.stopFlags[animId] = false;
            switch (_interval) {
                // nextTickを呼ぶともう一回random
                case "sometimes":
                    return SurfaceUtil.random(fn, 2);
                case "rarely":
                    return SurfaceUtil.random(fn, 4);
                case "random":
                    return SurfaceUtil.random(fn, n);
                case "periodic":
                    return SurfaceUtil.periodic(fn, n);
                case "always":
                    return SurfaceUtil.always(fn);
                case "runonce":
                    return this.play(animId);
                case "never":
                    return;
                case "yen-e":
                    return;
                case "talk":
                    this.talkCounts[animId] = n;
                    return;
            }
            console.warn("Surface#initAnimation > unkown interval:", interval, anim);
        }
    }, {
        key: "initBind",
        value: function initBind(anim) {
            var _this4 = this;

            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            if (this.bindgroup[this.scopeId] == null) return;
            if (this.bindgroup[this.scopeId][animId] == null) return;
            if (this.bindgroup[this.scopeId][animId] === true) {
                // 現在有効な bind

                var _interval$split3 = interval.split("+");

                var _interval$split32 = _toArray(_interval$split3);

                var _ = _interval$split32[0];

                var intervals = _interval$split32.slice(1);

                // bind+sometimes
                if (intervals.length > 0) {
                    // bind+hogeは着せ替え付随アニメーション。
                    // bind+sometimesを分解して実行
                    intervals.forEach(function (interval) {
                        _this4.initAnimation({ interval: interval, is: animId, patterns: patterns, option: option });
                    });
                    return;
                }
                // bind単体はレイヤーを重ねる着せ替え。
                if (option === "background") {
                    this.backgrounds[animId] = patterns[patterns.length - 1];
                } else {
                    this.layers[animId] = patterns[patterns.length - 1];
                }
                return;
            } else {
                //現在の合成レイヤから着せ替えレイヤを削除
                if (option === "background") {
                    delete this.backgrounds[animId];
                } else {
                    delete this.layers[animId];
                }
                // bind+sometimsなどを殺す
                this.end(animId);
                return;
            }
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this5 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            this.surfaceNode.animations.forEach(function (anim) {
                _this5.initBind(anim);
            });
            // 即時に反映
            this.render();
        }

        // アニメーションタイミングループの開始要請
    }, {
        key: "begin",
        value: function begin(animationId) {
            this.stopFlags[animationId] = false;
            var anim = this.surfaceNode.animations[animationId];
            this.initAnimation(anim);
            this.render();
        }

        // アニメーションタイミングループの開始
    }, {
        key: "end",
        value: function end(animationId) {
            this.stopFlags[animationId] = true;
        }
    }, {
        key: "endAll",
        value: function endAll() {
            var _this6 = this;

            Object.keys(this.stopFlags).forEach(function (animationId) {
                _this6.end(animationId);
            });
        }

        // アニメーション再生
    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this7 = this;

            if (this.destructed) return;
            var anims = this.surfaceNode.animations;
            var anim = this.surfaceNode.animations[animationId];
            if (anim == null) return void setTimeout(callback); // そんなアニメーションはない
            var animId = anim.is;
            var interval = anim.interval;
            var patterns = anim.patterns;
            var option = anim.option;

            if (option != null && !/^background$|^exclusive$/.test(option)) {
                console.warn("Surface#play", "unsupportted option", option, animationId, anim);
            }
            this.animationsQueue[animationId] = patterns.map(function (pattern, i) {
                return function () {
                    var surface = pattern.surface;
                    var wait = pattern.wait;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;
                    var animation_ids = pattern.animation_ids;

                    switch (type) {
                        case "start":
                            _this7.play(animation_ids[0], nextTick);
                            return;
                        case "stop":
                            _this7.stop(animation_ids[0]);
                            setTimeout(nextTick);
                            return;
                        case "alternativestart":
                            _this7.play(SurfaceUtil.choice(animation_ids), nextTick);
                            return;
                        case "alternativestop":
                            _this7.stop(SurfaceUtil.choice(animation_ids));
                            setTimeout(nextTick);
                            return;
                    }

                    var _ref6 = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""];

                    var _ref62 = _slicedToArray(_ref6, 3);

                    var __ = _ref62[0];
                    var a = _ref62[1];
                    var b = _ref62[2];

                    var _wait = isFinite(Number(b)) ? SurfaceUtil.randomRange(Number(a), Number(b)) : Number(a);
                    setTimeout(function () {
                        // 現在のコマをレイヤーに追加
                        if (option === "background") {
                            _this7.backgrounds[animationId] = pattern;
                        } else {
                            _this7.layers[animationId] = pattern;
                        }
                        if (_this7.exclusive >= 0) {
                            // -1 以上なら排他再生中
                            if (_this7.exclusive === animationId) {
                                // 自分が排他実行中
                                _this7.render();
                            }
                        } else {
                            // 通常
                            _this7.render();
                        }
                        nextTick();
                    }, _wait);
                };
            });
            if (option === "exclusive") {
                this.animationsQueue[animationId].unshift(function () {
                    _this7.exclusive = animationId;
                });
                this.animationsQueue[animationId].push(function () {
                    _this7.exclusive = -1;
                });
            }
            var nextTick = function nextTick() {
                if (_this7.destructed) return;
                var next = _this7.animationsQueue[animationId].shift();
                if (!(next instanceof Function)) {
                    // stop pattern animation.
                    _this7.animationsQueue[animationId] = [];
                    _this7.exclusive = -1;
                    setTimeout(callback);
                } else {
                    next();
                }
            };
            if (this.animationsQueue[animationId][0] instanceof Function) {
                nextTick();
            }
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            this.animationsQueue[animationId] = []; // アニメーションキューを破棄
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this8 = this;

            var animations = this.surfaceNode.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim) {
                return (/talk/.test(anim.interval) && _this8.talkCount % _this8.talkCounts[anim.is] === 0
                );
            });
            hits.forEach(function (anim) {
                // そのアニメーションは再生が終了しているか？
                if (_this8.animationsQueue[anim.is] == null || _this8.animationsQueue[anim.is].length === 0) {
                    _this8.play(anim.is);
                }
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this9 = this;

            var anims = this.surfaceNode.animations;
            anims.forEach(function (anim) {
                if (anim.interval === "yen-e") {
                    _this9.play(anim.is);
                }
            });
        }
    }, {
        key: "composeAnimationPatterns",
        value: function composeAnimationPatterns(layers) {
            var renderLayers = [];
            var keys = Object.keys(layers);
            // forEachからfor文へ
            for (var j = 0; j < keys.length; j++) {
                var pattern = layers[keys[j]];
                var surface = pattern.surface;
                var type = pattern.type;
                var x = pattern.x;
                var y = pattern.y;

                if (surface < 0) continue; // idが-1つまり非表示指定
                var srf = this.surfaceTree[surface]; // 該当のサーフェス
                if (srf == null) {
                    console.warn("Surface#composeAnimationPatterns: surface id " + surface + " is not defined.", pattern);
                    console.warn(surface, Object.keys(this.surfaceTree));
                    continue; // 対象サーフェスがないのでスキップ
                }
                // 対象サーフェスを構築描画する
                var base = srf.base;
                var elements = srf.elements;
                var collisions = srf.collisions;
                var animations = srf.animations;

                this.bufferRender.reset(); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
                this.bufferRender.composeElements([{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements)); // elementを合成する
                renderLayers.push({ type: type, x: x, y: y, canvas: this.bufferRender.getSurfaceCanvas() });
            }
            return renderLayers;
        }
    }, {
        key: "render",
        value: function render() {
            if (this.destructed) return;
            var backgrounds = this.composeAnimationPatterns(this.backgrounds);
            var base = this.surfaceNode.base;
            var elements = this.surfaceNode.elements;
            var fronts = this.composeAnimationPatterns(this.layers);
            var renderLayers = [].concat(backgrounds, elements.length > 0 ? elements : [{ type: "overlay", canvas: base, x: 0, y: 0 }]);
            this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            this.bufferRender.composeElements(renderLayers); // 現在有効なアニメーションのレイヤを合成
            // elementまでがベースサーフェス扱い
            var baseWidth = this.bufferRender.cnv.width;
            var baseHeight = this.bufferRender.cnv.height;
            // アニメーションレイヤーは別腹
            this.bufferRender.composeElements(fronts);
            if (this.enableRegionDraw) {
                this.bufferRender.drawRegions(this.surfaceNode.collisions, "" + this.surfaceId);
            }
            //console.log(this.bufferRender.log);
            //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
            //document.body.scrollTop += 100 + document.body.scrollTop;
            //this.endAll();
            //debugger;
            SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv); // バッファから実DOMTree上のcanvasへ描画
            // SSPでのjuda.narを見る限り合成後のサーフェスはベースサーフェスの大きさではなく合成されたサーフェスの大きさになるようだ
            // juda-systemの\s[1050]のアニメーションはrunonceを同時実行しており、この場合の座標の原点の計算方法が不明。
            // これは未定義動作の可能性が高い。
            (0, _jquery2["default"])(this.element).width(baseWidth); //this.cnv.width - bufRender.basePosX);
            (0, _jquery2["default"])(this.element).height(baseHeight); //this.cnv.height - bufRender.basePosY);
            (0, _jquery2["default"])(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
            (0, _jquery2["default"])(this.cnv).css("left", -this.bufferRender.basePosX);
        }
    }]);

    return Surface;
})(_eventemitter32["default"]);

exports["default"] = Surface;
module.exports = exports["default"];