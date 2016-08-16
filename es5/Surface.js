/// <reference path="../typings/index.d.ts"/>
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SurfaceRender_1 = require("./SurfaceRender");
var SurfaceUtil = require("./SurfaceUtil");
var ST = require("./SurfaceTree");
var EventEmitter = require("events");
var $ = require("jquery");

var Surface = function (_EventEmitter$EventEm) {
    _inherits(Surface, _EventEmitter$EventEm);

    function Surface(div, scopeId, surfaceId, surfaceDefTree, bindgroup) {
        _classCallCheck(this, Surface);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Surface).call(this));

        _this.element = div;
        _this.scopeId = scopeId;
        _this.surfaceId = surfaceId;
        _this.cnv = SurfaceUtil.createCanvas();
        var ctx = _this.cnv.getContext("2d");
        if (ctx == null) throw new Error("Surface#constructor: ctx is null");
        _this.ctx = ctx;
        _this.bindgroup = bindgroup;
        _this.position = "fixed";
        _this.surfaceDefTree = surfaceDefTree;
        _this.surfaceTree = surfaceDefTree.surfaces;
        _this.surfaceNode = surfaceDefTree.surfaces[surfaceId];
        _this.exclusives = [];
        _this.talkCount = 0;
        _this.talkCounts = {};
        _this.animationsQueue = {};
        _this.backgrounds = [];
        _this.layers = [];
        _this.stopFlags = {};
        _this.dynamicBase = null;
        _this.destructed = false;
        _this.destructors = [];
        // GCの発生を抑えるためレンダラはこれ１つを使いまわす
        _this.bufferRender = new SurfaceRender_1.default();
        _this.initDOMStructure();
        _this.initMouseEvent();
        _this.surfaceNode.animations.forEach(function (anim, id) {
            _this.initAnimation(id, anim);
        });
        _this.render();
        return _this;
    }

    _createClass(Surface, [{
        key: "destructor",
        value: function destructor() {
            $(this.element).children().remove();
            this.destructors.forEach(function (fn) {
                return fn();
            });
            this.element = document.createElement("div");
            this.surfaceNode = new ST.SurfaceDefinition();
            this.surfaceTree = [];
            this.bindgroup = [];
            this.layers = [];
            this.animationsQueue = {};
            this.talkCounts = {};
            this.destructors = [];
            this.removeAllListeners();
            this.destructed = true;
        }
    }, {
        key: "initDOMStructure",
        value: function initDOMStructure() {
            this.element.appendChild(this.cnv);
            $(this.element).css("position", "relative");
            $(this.element).css("display", "inline-block");
            $(this.cnv).css("position", "absolute");
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(animId, anim) {
            var _this2 = this;

            var intervals = anim.intervals;
            var patterns = anim.patterns;
            var options = anim.options;
            var collisions = anim.collisions; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。

            if (intervals.some(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var interval = _ref2[0];
                var args = _ref2[1];
                return "bind" === interval;
            })) {
                // bind+の場合は initBind にまるなげ
                this.initBind(animId, anim);
                return;
            }
            if (intervals.length > 1) {
                // bind+でなければ分解して再実行
                intervals.forEach(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2);

                    var _interval = _ref4[0];
                    var args = _ref4[1];

                    var a = new ST.SurfaceAnimation();
                    a.intervals = [[_interval, args]];
                    a.patterns = patterns;
                    a.options = options;
                    a.collisions = collisions;
                    _this2.initAnimation(animId, a);
                });
                return;
            }

            var _intervals$ = _slicedToArray(intervals[0], 2);

            var _interval = _intervals$[0];
            var args = _intervals$[1];

            var n = 0; // tsc黙らせるため
            if (args.length > 0) {
                n = Number(args[0]);
                if (!isFinite(n)) {
                    // rarelyにfaileback
                    n = 4;
                }
            }
            // アニメーション描画タイミングの登録
            var fn = function fn(nextTick) {
                if (_this2.destructed) return;
                if (_this2.stopFlags[animId]) return;
                _this2.play(animId, nextTick);
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
            console.warn("Surface#initAnimation > unkown interval:", _interval, anim);
        }
    }, {
        key: "initBind",
        value: function initBind(animId, anim) {
            var _this3 = this;

            var intervals = anim.intervals;
            var patterns = anim.patterns;
            var options = anim.options;
            var collisions = anim.collisions;

            if (this.isBind(animId)) {
                // 現在有効な bind
                if (intervals.length > 0) {
                    // bind+hogeは着せ替え付随アニメーション。
                    // bind+sometimesを分解して実行
                    intervals.forEach(function (_ref5) {
                        var _ref6 = _slicedToArray(_ref5, 2);

                        var interval = _ref6[0];
                        var args = _ref6[1];

                        if (interval !== "bind") {
                            var a = new ST.SurfaceAnimation();
                            a.intervals = [[interval, args]];
                            a.patterns = patterns;
                            a.options = options;
                            a.collisions = collisions;
                            _this3.initAnimation(animId, a);
                        }
                    });
                }
                // レイヤに着せ替えを追加
                options.forEach(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 2);

                    var option = _ref8[0];
                    var args = _ref8[1];

                    if (option === "background") {
                        _this3.backgrounds[animId] = patterns;
                    } else {
                        _this3.layers[animId] = patterns;
                    }
                });
            } else {
                //現在の合成レイヤから着せ替えレイヤを削除
                options.forEach(function (_ref9) {
                    var _ref10 = _slicedToArray(_ref9, 2);

                    var option = _ref10[0];
                    var args = _ref10[1];

                    if (option === "background") {
                        delete _this3.backgrounds[animId];
                    } else {
                        delete _this3.layers[animId];
                    }
                });
                // bind+sometimsなどを殺す
                this.end(animId);
            }
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this4 = this;

            // Shell.tsから呼ばれるためpublic
            // Shell#bind,Shell#unbindで発動
            this.surfaceNode.animations.forEach(function (anim, animId) {
                if (anim.intervals.some(function (_ref11) {
                    var _ref12 = _slicedToArray(_ref11, 2);

                    var interval = _ref12[0];
                    var args = _ref12[1];
                    return "bind" === interval;
                })) {
                    _this4.initBind(animId, anim);
                }
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
            this.initAnimation(animationId, anim);
            this.render();
        }
        // アニメーションタイミングループの開始

    }, {
        key: "end",
        value: function end(animationId) {
            this.stopFlags[animationId] = true;
        }
        // すべての自発的アニメーション再生の停止

    }, {
        key: "endAll",
        value: function endAll() {
            var _this5 = this;

            Object.keys(this.stopFlags).forEach(function (animationId) {
                _this5.end(Number(animationId));
            });
        }
        // アニメーション再生

    }, {
        key: "play",
        value: function play(animationId, callback) {
            var _this6 = this;

            if (this.destructed) return;
            var anims = this.surfaceNode.animations;
            var anim = this.surfaceNode.animations[animationId];
            if (anim == null) {
                console.warn("Surface#play", "animation", animationId, "is not defined");
                return void setTimeout(callback); // そんなアニメーションはない
            }
            var patterns = anim.patterns;
            var options = anim.options;

            this.animationsQueue[animationId] = patterns.map(function (pattern, i) {
                return function () {
                    var surface = pattern.surface;
                    var wait = pattern.wait;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;

                    switch (type) {
                        case "start":
                            var animation_ids = pattern.animation_ids;

                            _this6.play(animation_ids[0], nextTick);
                            return;
                        case "stop":
                            var animation_ids = pattern.animation_ids;

                            _this6.stop(animation_ids[0]);
                            setTimeout(nextTick);
                            return;
                        case "alternativestart":
                            var animation_ids = pattern.animation_ids;

                            _this6.play(SurfaceUtil.choice(animation_ids), nextTick);
                            return;
                        case "alternativestop":
                            var animation_ids = pattern.animation_ids;

                            _this6.stop(SurfaceUtil.choice(animation_ids));
                            setTimeout(nextTick);
                            return;
                    }
                    var _wait = SurfaceUtil.randomRange(wait[0], wait[1]);
                    setTimeout(function () {
                        // 現在のコマをレイヤーに追加
                        options.forEach(function (_ref13) {
                            var _ref14 = _slicedToArray(_ref13, 2);

                            var option = _ref14[0];
                            var args = _ref14[1];

                            if (option === "background") {
                                _this6.backgrounds[animationId] = [pattern];
                            } else {
                                _this6.layers[animationId] = [pattern];
                            }
                        });
                        var canIPlay = _this6.exclusives.every(function (exclusive) {
                            return exclusive !== animationId;
                        }); //自分のanimationIdはexclusivesリストに含まれていない
                        if (canIPlay) {
                            _this6.render();
                        }
                        nextTick();
                    }, _wait);
                };
            });
            options.forEach(function (_ref15) {
                var _ref16 = _slicedToArray(_ref15, 2);

                var option = _ref16[0];
                var args = _ref16[1];

                if (option === "exclusive") {
                    if (args.length > 0) {
                        _this6.animationsQueue[animationId].unshift(function () {
                            _this6.exclusives = args.map(function (arg) {
                                return Number(arg);
                            });
                        });
                    } else {
                        _this6.animationsQueue[animationId].unshift(function () {
                            _this6.exclusives = _this6.surfaceNode.animations.filter(function (anim, animId) {
                                return animId !== animationId;
                            }).map(function (anim, animId) {
                                return animId;
                            });
                        });
                    }
                    _this6.animationsQueue[animationId].push(function () {
                        _this6.exclusives = [];
                    });
                }
            });
            var nextTick = function nextTick() {
                if (_this6.destructed) return;
                var next = _this6.animationsQueue[animationId].shift();
                if (!(next instanceof Function)) {
                    // stop pattern animation.
                    _this6.animationsQueue[animationId] = [];
                    _this6.exclusives = [];
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
            var _this7 = this;

            var animations = this.surfaceNode.animations;
            this.talkCount++;
            var hits = animations.filter(function (anim, animId) {
                return anim.intervals.some(function (_ref17) {
                    var _ref18 = _slicedToArray(_ref17, 2);

                    var interval = _ref18[0];
                    var args = _ref18[1];
                    return "talk" === interval;
                }) && _this7.talkCount % _this7.talkCounts[animId] === 0;
            });
            hits.forEach(function (anim, animId) {
                // そのアニメーションは再生が終了しているか？
                if (_this7.animationsQueue[animId] == null || _this7.animationsQueue[animId].length === 0) {
                    _this7.play(animId);
                }
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this8 = this;

            var anims = this.surfaceNode.animations;
            anims.forEach(function (anim, animId) {
                if (anim.intervals.some(function (_ref19) {
                    var _ref20 = _slicedToArray(_ref19, 2);

                    var interval = _ref20[0];
                    var args = _ref20[1];
                    return interval === "yen-e";
                })) {
                    _this8.play(animId);
                }
            });
        }
    }, {
        key: "isBind",
        value: function isBind(animId) {
            if (this.bindgroup[this.scopeId] == null) return false;
            if (this.bindgroup[this.scopeId][animId] === false) return false;
            return true;
        }
    }, {
        key: "composeAnimationPatterns",
        value: function composeAnimationPatterns(layers, interval) {
            var _this9 = this;

            var renderLayers = [];
            layers.forEach(function (patterns) {
                patterns.forEach(function (pattern) {
                    var surface = pattern.surface;
                    var type = pattern.type;
                    var x = pattern.x;
                    var y = pattern.y;
                    var wait = pattern.wait;

                    if (type === "insert") {
                        // insertの場合は対象のIDをとってくる
                        // animation_id = animationN,x,y
                        var animation_ids = pattern.animation_ids;

                        var animId = animation_ids.length > 0 ? animation_ids[0] : -1;
                        // 対象の着せ替えが有効かどうか判定
                        if (!_this9.isBind(animId)) return;
                        var anim = _this9.surfaceNode.animations[animId];
                        if (anim == null) {
                            console.warn("Surface#composeAnimationPatterns", "insert id", animation_ids, "is wrong target.", _this9.surfaceNode);
                            return;
                        }
                        renderLayers = renderLayers.concat(_this9.composeAnimationPatterns([anim.patterns], interval));
                        return;
                    }
                    if (surface < 0) {
                        // idが-1つまり非表示指定
                        if (type === "base") {
                            // アニメーションパーツによるbaseを削除
                            _this9.dynamicBase = null;
                        }
                        return;
                    }
                    var srf = _this9.surfaceTree[surface]; // 該当のサーフェス
                    if (srf == null) {
                        console.warn("Surface#composeAnimationPatterns", "surface id " + surface + " is not defined.", pattern);
                        return; // 対象サーフェスがないのでスキップ
                    }
                    // 対象サーフェスを構築描画する
                    var base = srf.base;
                    var elements = srf.elements;
                    var collisions = srf.collisions;
                    var animations = srf.animations;

                    var bind_backgrounds = [];
                    var bind_fronts = [];
                    _this9.bufferRender.reset();
                    if (interval === "bind") {
                        console.info("Surface#composeAnimationPatterns", "multiple binds detected");
                        // 多重着せ替え定義（SSPのみ）
                        // アニメーションのコマとして参照した先のsurfaceに、そのsurfaceのアニメーションが定義されていた場合、通常それらは無視される。
                        // しかしSSPではintervalがbindのアニメーション（＝着せ替え）のみ無視されず反映されるようになっている。
                        // これによって、着せ替えの影響を受けるような構造のアニメーションについて、アニメーションのコマ側で着せ替えに応じた定義を行う事が可能である。
                        // なお多重着せ替えを入れ子にする事も可能であるが、循環的な参照は無視される。
                        // http://ssp.shillest.net/ukadoc/manual/descript_shell_surfaces.html#introduction_mayuna
                        // intervalがbindのときのみ対象サーフェスの着せ替えも有効にする
                        // https://github.com/Ikagaka/cuttlebone/issues/23
                        animations.forEach(function (anim, is) {
                            var options = anim.options;
                            var patterns = anim.patterns;

                            if (_this9.isBind(is)) {
                                options.forEach(function (_ref21) {
                                    var _ref22 = _slicedToArray(_ref21, 2);

                                    var option = _ref22[0];
                                    var args = _ref22[1];

                                    if ("background" === option) {
                                        bind_backgrounds[is] = patterns;
                                    } else {
                                        bind_fronts[is] = patterns;
                                    }
                                });
                            }
                        });
                    }
                    // 循環無視されずスタックオーバーフローします
                    var _bind_backgrounds = _this9.composeAnimationPatterns(bind_backgrounds, interval);
                    var _bind_fronts = _this9.composeAnimationPatterns(bind_fronts, interval);
                    var _base_ = [];
                    if (elements[0] != null) {
                        // element0, element1...
                        _base_ = elements;
                    } else if (base != null) {
                        // base, element1, element2...
                        _base_ = [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements);
                    } else {
                        console.error("Surface#composeAnimationPatterns: cannot decide base");
                        return;
                    }
                    // 対象サーフェスのbaseサーフェス(surface*.png)の上にelementを合成する
                    _this9.bufferRender.composeElements(_bind_backgrounds.concat(_base_, _bind_fronts));
                    if (type === "base") {
                        // 構築したこのレイヤーのサーフェスはベースサーフェス指定
                        // 12pattern0,300,30,base,0,0 みたいなの
                        // baseの場合はthis.dynamicBaseにまかせて何も返さない
                        _this9.dynamicBase = { type: type, x: x, y: y, canvas: _this9.bufferRender.getSurfaceCanvas() };
                        return;
                    } else {
                        renderLayers.push({ type: type, x: x, y: y, canvas: _this9.bufferRender.getSurfaceCanvas() });
                    }
                });
            });
            return renderLayers;
        }
    }, {
        key: "render",
        value: function render() {
            var _this10 = this;

            if (this.destructed) return;
            var backgrounds = this.composeAnimationPatterns(this.backgrounds); //再生途中のアニメーション含むレイヤ
            var elements = this.surfaceNode.elements;
            var base = this.surfaceNode.base;
            var fronts = this.composeAnimationPatterns(this.layers); //再生途中のアニメーション含むレイヤ
            var baseWidth = 0;
            var baseHeight = 0;
            this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            // ベースサーフェス作る
            if (this.dynamicBase != null) {
                // pattern base があればそちらを使用
                this.bufferRender.composeElements([this.dynamicBase]);
                baseWidth = this.bufferRender.cnv.width;
                baseHeight = this.bufferRender.cnv.height;
            } else {
                // base+elementでベースサーフェス作る
                this.bufferRender.composeElements(elements[0] != null ?
                // element0, element1...
                elements : base != null ?
                // base, element1, element2...
                [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements) : []);
                // elementまでがベースサーフェス扱い
                baseWidth = this.bufferRender.cnv.width;
                baseHeight = this.bufferRender.cnv.height;
            }
            var composedBase = this.bufferRender.getSurfaceCanvas();
            // アニメーションレイヤー
            this.bufferRender.composeElements(backgrounds);
            this.bufferRender.composeElements([{ type: "overlay", canvas: composedBase, x: 0, y: 0 }]); // 現在有効な ベースサーフェスのレイヤを合成
            this.bufferRender.composeElements(fronts);
            // 当たり判定を描画
            if (this.enableRegionDraw) {
                this.bufferRender.drawRegions(this.surfaceNode.collisions, "" + this.surfaceId);
                this.backgrounds.forEach(function (_, animId) {
                    _this10.bufferRender.drawRegions(_this10.surfaceNode.animations[animId].collisions, "" + _this10.surfaceId);
                });
                this.layers.forEach(function (_, animId) {
                    _this10.bufferRender.drawRegions(_this10.surfaceNode.animations[animId].collisions, "" + _this10.surfaceId);
                });
            }
            // debug用
            //console.log(this.bufferRender.log);
            //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
            //document.body.scrollTop = 99999;
            //this.endAll();
            // バッファから実DOMTree上のcanvasへ描画
            SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv);
            // 位置合わせとか
            $(this.element).width(baseWidth); //this.cnv.width - bufRender.basePosX);
            $(this.element).height(baseHeight); //this.cnv.height - bufRender.basePosY);
            $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
            $(this.cnv).css("left", -this.bufferRender.basePosX);
        }
    }, {
        key: "getSurfaceSize",
        value: function getSurfaceSize() {
            return {
                width: $(this.element).width(),
                height: $(this.element).height()
            };
        }
    }, {
        key: "initMouseEvent",
        value: function initMouseEvent() {
            var _this11 = this;

            var $elm = $(this.element);
            var tid = null;
            var touchCount = 0;
            var touchStartTime = 0;
            var tuples = [];
            tuples.push(["contextmenu", function (ev) {
                return _this11.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["click", function (ev) {
                return _this11.processMouseEvent(ev, "mouseclick");
            }]);
            tuples.push(["dblclick", function (ev) {
                return _this11.processMouseEvent(ev, "mousedblclick");
            }]);
            tuples.push(["mousedown", function (ev) {
                return _this11.processMouseEvent(ev, "mousedown");
            }]);
            tuples.push(["mousemove", function (ev) {
                return _this11.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["mouseup", function (ev) {
                return _this11.processMouseEvent(ev, "mouseup");
            }]);
            tuples.push(["touchmove", function (ev) {
                return _this11.processMouseEvent(ev, "mousemove");
            }]);
            tuples.push(["touchend", function (ev) {
                _this11.processMouseEvent(ev, "mouseup");
                _this11.processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    _this11.processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
            tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                _this11.processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(function () {
                    return touchCount = 0;
                }, 500);
            }]);
            tuples.forEach(function (_ref23) {
                var _ref24 = _slicedToArray(_ref23, 2);

                var ev = _ref24[0];
                var handler = _ref24[1];
                return $elm.on(ev, handler);
            }); // イベント登録
            this.destructors.push(function () {
                tuples.forEach(function (_ref25) {
                    var _ref26 = _slicedToArray(_ref25, 2);

                    var ev = _ref26[0];
                    var handler = _ref26[1];
                    return $elm.off(ev, handler);
                }); // イベント解除
            });
        }
    }, {
        key: "processMouseEvent",
        value: function processMouseEvent(ev, type) {
            var _this12 = this;

            $(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ

            var _SurfaceUtil$getEvent = SurfaceUtil.getEventPosition(ev);

            var pageX = _SurfaceUtil$getEvent.pageX;
            var pageY = _SurfaceUtil$getEvent.pageY;
            var clientX = _SurfaceUtil$getEvent.clientX;
            var clientY = _SurfaceUtil$getEvent.clientY;

            var _$$offset = $(ev.target).offset();

            var left = _$$offset.left;
            var top = _$$offset.top;
            // body直下 fixed だけにすべきかうーむ

            var _SurfaceUtil$getScrol = SurfaceUtil.getScrollXY();

            var scrollX = _SurfaceUtil$getScrol.scrollX;
            var scrollY = _SurfaceUtil$getScrol.scrollY;

            if (this.position !== "fixed") {
                var baseX = pageX;
                var baseY = pageY;
                var _left = left;
                var _top = top;
            } else {
                var baseX = clientX;
                var baseY = clientY;
                var _left = left - scrollX;
                var _top = top - scrollY;
            }
            var basePosY = parseInt($(this.cnv).css("top"), 10); // overlayでのずれた分を
            var basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
            var offsetX = baseX - _left - basePosX; //canvas左上からのx座標
            var offsetY = baseY - _top - basePosY; //canvas左上からのy座標
            var hit1 = SurfaceUtil.getRegion(this.cnv, this.surfaceNode.collisions, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            var hits0 = this.backgrounds.map(function (_, animId) {
                return SurfaceUtil.getRegion(_this12.cnv, _this12.surfaceNode.animations[animId].collisions, offsetX, offsetY);
            });
            var hits2 = this.layers.map(function (_, animId) {
                return SurfaceUtil.getRegion(_this12.cnv, _this12.surfaceNode.animations[animId].collisions, offsetX, offsetY);
            });
            var hits = hits0.concat([hit1], hits2).filter(function (hit) {
                return hit !== "";
            });
            var hit = hits[hits.length - 1] || hit1;
            var custom = {
                "type": type,
                "offsetX": offsetX | 0,
                "offsetY": offsetY | 0,
                "wheel": 0,
                "scopeId": this.scopeId,
                "region": hit,
                "button": ev.button === 2 ? 1 : 0,
                "transparency": !SurfaceUtil.isHit(this.cnv, offsetX, offsetY),
                "event": ev }; // onした先でpriventDefaultとかstopPropagationとかしたいので
            if (hit !== "") {
                ev.preventDefault();
                if (/^touch/.test(ev.type)) {
                    ev.stopPropagation();
                }
                // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
                // ために親要素にイベント伝えない
                $(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
            }
            this.emit("mouse", custom);
        }
    }]);

    return Surface;
}(EventEmitter.EventEmitter);

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Surface;