/// <reference path="../typings/index.d.ts"/>
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SR = require("./SurfaceRender");
var SU = require("./SurfaceUtil");
var ST = require("./SurfaceTree");
var SC = require("./ShellConfig");
var events_1 = require("events");
var $ = require("jquery");

var Layer = function Layer() {
    _classCallCheck(this, Layer);
};

exports.Layer = Layer;

var SerikoLayer = function (_Layer) {
    _inherits(SerikoLayer, _Layer);

    function SerikoLayer(patternID) {
        var background = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        _classCallCheck(this, SerikoLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SerikoLayer).call(this));

        _this.patternID = patternID;
        _this.timerID = null;
        _this.paused = false;
        _this.stop = true;
        _this.exclusive = false;
        _this.canceled = false;
        _this.background = background;
        return _this;
    }

    return SerikoLayer;
}(Layer);

exports.SerikoLayer = SerikoLayer;

var MayunaLayer = function (_Layer2) {
    _inherits(MayunaLayer, _Layer2);

    function MayunaLayer(visible) {
        var background = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        _classCallCheck(this, MayunaLayer);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MayunaLayer).call(this));

        _this2.visible = visible;
        _this2.background = background;
        return _this2;
    }

    return MayunaLayer;
}(Layer);

exports.MayunaLayer = MayunaLayer;

var Surface = function (_events_1$EventEmitte) {
    _inherits(Surface, _events_1$EventEmitte);

    function Surface(div, scopeId, surfaceId, surfaceDefTree, config, cache) {
        _classCallCheck(this, Surface);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Surface).call(this));

        _this3.element = div;
        _this3.scopeId = scopeId;
        _this3.surfaceId = surfaceId;
        var cnv = SU.createCanvas();
        var ctx = cnv.getContext("2d");
        if (ctx == null) throw new Error("Surface#constructor: ctx is null");
        _this3.ctx = ctx;
        _this3.config = config;
        _this3.cache = cache;
        _this3.surfaceDefTree = surfaceDefTree;
        _this3.surfaceTree = surfaceDefTree.surfaces;
        _this3.surfaceNode = surfaceDefTree.surfaces[surfaceId];
        _this3.talkCount = 0;
        _this3.destructed = false;
        _this3.destructors = [];
        // DOM GCの発生を抑えるためレンダラはこれ１つを使いまわす
        _this3.bufferRender = new SR.SurfaceRender(); //{use_self_alpha: this.config.seriko.use_self_alpha });
        _this3.initDOMStructure();
        _this3.initMouseEvent();
        _this3.surfaceNode.animations.forEach(function (anim, id) {
            _this3.initAnimation(id);
        });
        _this3.render();
        return _this3;
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
            this.config = new SC.ShellConfig();
            this.layers = [];
            this.talkCount = 0;
            this.destructors = [];
            this.removeAllListeners();
            this.destructed = true;
        }
    }, {
        key: "initDOMStructure",
        value: function initDOMStructure() {
            this.element.appendChild(this.ctx.canvas);
            $(this.element).css("position", "relative");
            $(this.element).css("display", "inline-block");
            $(this.ctx.canvas).css("position", "absolute");
        }
    }, {
        key: "initAnimation",
        value: function initAnimation(animId) {
            var _this4 = this;

            if (this.surfaceNode.animations[animId] == null) {
                console.warn("Surface#initAnimation: animationID", animId, "is not defined in ", this.surfaceId, this.surfaceNode);
                return;
            }
            var _surfaceNode$animatio = this.surfaceNode.animations[animId];
            var intervals = _surfaceNode$animatio.intervals;
            var patterns = _surfaceNode$animatio.patterns;
            var options = _surfaceNode$animatio.options;
            var collisions = _surfaceNode$animatio.collisions;

            var isBack = options.some(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var opt = _ref2[0];
                var args = _ref2[1];
                return opt === "background";
            });
            if (intervals.some(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);

                var interval = _ref4[0];
                var args = _ref4[1];
                return "bind" === interval;
            })) {
                // このanimIDは着せ替え機能付きレイヤ
                if (this.isBind(animId)) {
                    // 現在有効な bind なら
                    if (intervals.length > 1) {
                        // [[bind, []]].length === 1
                        // bind+hogeは着せ替え付随アニメーション。
                        // 現在のレイヤにSERIKOレイヤを追加
                        this.layers[animId] = new SerikoLayer(-1);
                        intervals.filter(function (_ref5) {
                            var _ref6 = _slicedToArray(_ref5, 1);

                            var interval = _ref6[0];
                            return interval !== "bind";
                        }).forEach(function (_ref7) {
                            var _ref8 = _slicedToArray(_ref7, 2);

                            var interval = _ref8[0];
                            var args = _ref8[1];

                            // インターバルタイマの登録
                            _this4.setTimer(animId, interval, args);
                        });
                        return;
                    }
                    // interval,bind
                    // 現在のレイヤにMAYUNAレイヤを追加
                    this.layers[animId] = new MayunaLayer(true, isBack);
                    return;
                }
                // 現在有効な bind でないなら
                // 現在の合成レイヤの着せ替えレイヤを非表示設定
                this.layers[animId] = new MayunaLayer(false, isBack);
                // ついでにbind+sometimsなどを殺す
                this.end(animId);
                return;
            }
            // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
            // 現在のレイヤにSERIKOレイヤを追加
            this.layers[animId] = new SerikoLayer(-1, isBack);
            intervals.forEach(function (_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2);

                var interval = _ref10[0];
                var args = _ref10[1];

                // インターバルタイマの登録
                _this4.setTimer(animId, interval, args);
            });
        }
    }, {
        key: "setTimer",
        value: function setTimer(animId, interval, args) {
            var _this5 = this;

            var layer = this.layers[animId];
            if (layer instanceof SerikoLayer) {
                var n = isFinite(args[0]) ? args[0] : (console.warn("Surface#setTimer: failback to", 4, interval, animId), 4);
                // アニメーションを止めるための準備
                layer.stop = false;
                // アニメーション描画タイミングの登録
                var fn = function fn(nextTick) {
                    if (_this5.destructed) return;
                    if (layer.stop) return;
                    _this5.play(animId).catch(function (err) {
                        return console.info("animation canceled", err);
                    }).then(function () {
                        return nextTick();
                    });
                };
                switch (interval) {
                    // nextTickを呼ぶともう一回random
                    case "sometimes":
                        layer.timerID = SU.random(fn, 2);
                        return;
                    case "rarely":
                        layer.timerID = SU.random(fn, 4);
                        return;
                    case "random":
                        layer.timerID = SU.random(fn, n);
                        return;
                    case "periodic":
                        layer.timerID = SU.periodic(fn, n);
                        return;
                    case "always":
                        layer.timerID = SU.always(fn);
                        return;
                    case "runonce":
                        this.play(animId);
                        return;
                    case "never":
                        return;
                    case "yen-e":
                        return;
                    case "talk":
                        return;
                    default:
                        console.warn("Surface#setTimer > unkown interval:", interval, animId);
                        return;
                }
            } else {
                console.warn("Surface#setTimer: animId", animId, "is not SerikoLayer");
            }
        }
    }, {
        key: "update",
        value: function update() {
            var _this6 = this;

            // レイヤ状態の更新
            this.surfaceNode.animations.forEach(function (anim, id) {
                _this6.initAnimation(id);
            });
            // 即時に反映
            this.render();
        }
        // アニメーションタイミングループの開始要請

    }, {
        key: "begin",
        value: function begin(animationId) {
            var layer = this.layers[animationId];
            if (layer instanceof SerikoLayer) {
                layer.stop = false;
                this.initAnimation(animationId);
                this.render();
            }
        }
        // アニメーションタイミングループの開始

    }, {
        key: "end",
        value: function end(animationId) {
            var layer = this.layers[animationId];
            if (layer instanceof SerikoLayer) {
                layer.stop = true;
            }
        }
        // すべての自発的アニメーション再生の停止

    }, {
        key: "endAll",
        value: function endAll() {
            var _this7 = this;

            this.layers.forEach(function (layer, id) {
                _this7.end(id);
            });
        }
        // アニメーション再生

    }, {
        key: "play",
        value: function play(animationId) {
            var _this8 = this;

            if (this.destructed) {
                return Promise.reject("destructed");
            }
            if (!(this.layers[animationId] instanceof SerikoLayer)) {
                console.warn("Surface#play", "animation", animationId, "is not defined");
                return Promise.reject("no such animation"); // そんなアニメーションはない
            } else {
                var _ret = function () {
                    var layer = _this8.layers[animationId];
                    var anim = _this8.surfaceNode.animations[animationId];
                    if (layer.patternID >= 0) {
                        // 既に再生中
                        // とりま殺す
                        layer.canceled = true;
                        clearTimeout(layer.timerID);
                        layer.timerID = null;
                        // とりま非表示に
                        layer = _this8.layers[animationId] = new SerikoLayer(-2);
                    }
                    if (layer.paused) {
                        // ポーズは解けた
                        layer.paused = false;
                    }
                    // これから再生開始するレイヤ
                    anim.options.forEach(function (_ref11) {
                        var _ref12 = _slicedToArray(_ref11, 2);

                        var option = _ref12[0];
                        var args = _ref12[1];

                        if (option === "exclusive") {
                            args.forEach(function (id) {
                                var layer = _this8.layers[id];
                                if (layer instanceof SerikoLayer) {
                                    // exclusive指定を反映
                                    layer.exclusive = true;
                                }
                            });
                        }
                    });
                    return {
                        v: new Promise(function (resolve, reject) {
                            var nextTick = function nextTick() {
                                // exclusive中のやつら探す
                                var existExclusiveLayers = _this8.layers.some(function (layer, id) {
                                    return !(layer instanceof SerikoLayer) ? false // layer が mayuna なら 論外
                                    : layer.exclusive; // exclusive が存在
                                });
                                if (existExclusiveLayers) {
                                    // 自分はexclusiveか？
                                    var amIexclusive = _this8.layers.some(function (layer, id) {
                                        return !(layer instanceof SerikoLayer) ? false // layer が mayuna なら 論外
                                        : !layer.exclusive ? false // exclusive が存在しない
                                        : id === animationId; // exclusiveが存在しなおかつ自分は含まれる
                                    });
                                    if (!amIexclusive) {
                                        // exclusiveが存在しなおかつ自分はそうではないなら
                                        layer.canceled = true;
                                    }
                                }
                                if (layer.canceled || _this8.destructed) {
                                    // おわりですおわり
                                    return reject("canceled");
                                }
                                if (layer.paused) {
                                    // 次にplayが呼び出されるまで何もしない 
                                    return;
                                }
                                // 現在のレイヤを次のレイヤに
                                layer.patternID++;
                                var pattern = anim.patterns[layer.patternID];
                                // 正のレイヤIDなのに次のレイヤがない＝このアニメは終了
                                if (layer.patternID >= 0 && pattern == null) {
                                    // とりま非表示に
                                    layer.patternID = -1;
                                    layer.exclusive = false;
                                    layer.timerID = null;
                                    // nextTickがクロージャとしてもってるlayerを書き換えてしまわないように
                                    var _layer = _this8.layers[animationId] = new SerikoLayer(-1);
                                    return resolve();
                                }
                                var surface = pattern.surface;
                                var wait = pattern.wait;
                                var type = pattern.type;
                                var x = pattern.x;
                                var y = pattern.y;
                                var animation_ids = pattern.animation_ids;

                                switch (type) {
                                    // 付随再生であってこのアニメの再生終了は待たない・・・はず？
                                    case "start":
                                        _this8.play(animation_ids[0]);
                                        return;
                                    case "stop":
                                        _this8.stop(animation_ids[0]);
                                        return;
                                    case "alternativestart":
                                        _this8.play(SU.choice(animation_ids));
                                        return;
                                    case "alternativestop":
                                        _this8.stop(SU.choice(animation_ids));
                                        return;
                                    case "move":
                                        _this8.moveX = x;
                                        _this8.moveY = y;
                                        return;
                                }
                                _this8.render();
                                var _wait = SU.randomRange(wait[0], wait[1]);
                                // waitだけ待つ
                                layer.timerID = setTimeout(nextTick, _wait);
                            }; /* nextTick ここまで */
                            nextTick();
                        })
                    };
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }
        }
    }, {
        key: "stop",
        value: function stop(animationId) {
            var layer = this.layers[animationId];
            if (layer instanceof SerikoLayer) {
                layer.canceled = true;
                layer.patternID = -1;
            }
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this9 = this;

            var animations = this.surfaceNode.animations;
            this.talkCount++;
            // talkなものでかつtalkCountとtalk,nのmodが0なもの
            var hits = animations.filter(function (anim, animId) {
                return anim.intervals.some(function (_ref13) {
                    var _ref14 = _slicedToArray(_ref13, 2);

                    var interval = _ref14[0];
                    var args = _ref14[1];
                    return "talk" === interval && _this9.talkCount % args[0] === 0;
                });
            });
            hits.forEach(function (anim, animId) {
                // そのtalkアニメーションは再生が終了しているか？
                if (_this9.layers[animId] instanceof SerikoLayer) {
                    var layer = _this9.layers[animId];
                    if (layer.patternID < 0) {
                        _this9.play(animId);
                    }
                }
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this10 = this;

            var anims = this.surfaceNode.animations;
            anims.forEach(function (anim, animId) {
                if (anim.intervals.some(function (_ref15) {
                    var _ref16 = _slicedToArray(_ref15, 2);

                    var interval = _ref16[0];
                    var args = _ref16[1];
                    return interval === "yen-e";
                })) {
                    _this10.play(animId);
                }
            });
        }
    }, {
        key: "isBind",
        value: function isBind(animId) {
            if (this.config.bindgroup[this.scopeId] == null) return false;
            if (this.config.bindgroup[this.scopeId][animId] === false) return false;
            return true;
        }
    }, {
        key: "composeBaseSurface",
        value: function composeBaseSurface(n) {
            var _this11 = this;

            // elements を合成するだけ
            var srf = this.surfaceTree[n];
            if (!(srf instanceof ST.SurfaceDefinition) || srf.elements.length === 0) {
                // そんな定義なかった || element0も何もなかった
                console.warn("Surface#composeBaseSurface: no such a surface", n, srf);
                return Promise.reject("no such a surface");
            }
            var elms = srf.elements;
            return Promise.all(elms.map(function (_ref17) {
                var file = _ref17.file;
                var type = _ref17.type;
                var x = _ref17.x;
                var y = _ref17.y;

                // asisはここで処理しちゃう
                var asis = false;
                if (type === "asis") {
                    type = "overlay"; // overlayにしとく
                    asis = true;
                }
                if (type === "bind" || type === "add") {
                    type = "overlay"; // overlayにしとく
                }
                // ファイルとりにいく
                return _this11.cache.getCanvas(file, asis).then(function (cnv) {
                    return { file: file, type: type, x: x, y: y, canvas: new SR.SurfaceCanvas(cnv) };
                }).catch(function (err) {
                    console.warn("Surface#composeBaseSurface: no such a file", file, n, srf);
                });
            })).then(function (elms) {
                return _this11.bufferRender.composeElements(elms);
            }).then(function (srfCnv) {
                // basesurfaceの大きさはbasesurfaceそのもの
                srfCnv.basePosX = 0;
                srfCnv.basePosY = 0;
                srfCnv.baseWidth = srfCnv.cnv.width;
                srfCnv.baseHeight = srfCnv.cnv.height;
                return srfCnv;
            });
        }
    }, {
        key: "solveAnimationPattern",
        value: function solveAnimationPattern(n) {
            var _this12 = this;

            var patses = [];
            var srf = this.surfaceTree[n];
            if (!(srf instanceof ST.SurfaceDefinition)) {
                // そんな定義なかった || element0も何もなかった
                console.warn("Surface#solveAnimationPattern: no such a surface", n, srf);
                return patses;
            }
            srf.animations.forEach(function (_ref18, animId) {
                var intervals = _ref18.intervals;
                var options = _ref18.options;
                var patterns = _ref18.patterns;

                if (intervals.length === 1 && intervals[0][0] === "bind" && _this12.isBind(animId)) {
                    // 対象のサーフェスのパターンで bind で有効な着せ替えな animId
                    patses[animId] = [];
                    patterns.forEach(function (_ref19, patId) {
                        var type = _ref19.type;
                        var animation_ids = _ref19.animation_ids;

                        if (type === "insert") {
                            // insertの場合は対象のIDをとってくる
                            var insertId = animation_ids[0];
                            var anim = _this12.surfaceNode.animations[insertId];
                            if (!(anim instanceof ST.SurfaceAnimation)) {
                                console.warn("Surface#solveAnimationPattern", "insert id", animation_ids, "is wrong target.", n, patId);
                                return;
                            }
                            // insertをねじ込む
                            patses[animId] = patses[animId].concat(anim.patterns);
                            return;
                        }
                        // insertでない処理
                        patses[animId].push(patterns[patId]);
                    });
                }
            });
            return patses;
        }
    }, {
        key: "composeAnimationPart",
        value: function composeAnimationPart(n) {
            var _this13 = this;

            var log = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            if (log.indexOf(n) != -1) {
                // 循環参照
                console.warn("Surface#composeAnimationPart: recursive definition detected", n, log);
                return Promise.reject("recursive definition detected");
            }
            var srf = this.surfaceTree[n];
            if (!(srf instanceof ST.SurfaceDefinition)) {
                // そんな定義なかった || element0も何もなかった
                console.warn("Surface#composeAnimationPart: no such a surface", n, srf);
                return Promise.reject("no such a surface");
            }
            // サーフェス n で表示すべきpatternをもらってくる
            var patses = this.solveAnimationPattern(n);
            var layers = patses.map(function (patterns, animId) {
                // n の animId な MAYUNA レイヤセットのレイヤが pats
                var layerset = Promise.all(patterns.map(function (_ref20, patId) {
                    var type = _ref20.type;
                    var surface = _ref20.surface;
                    var wait = _ref20.wait;
                    var x = _ref20.x;
                    var y = _ref20.y;

                    // 再帰的に画像読むよ
                    return _this13.composeAnimationPart(n, log.concat(n)).then(function (canvas) {
                        return { type: type, x: x, y: y, canvas: canvas };
                    });
                }));
                return layerset;
            });
            return Promise.all(layers).then(function (layers) {
                // パターン全部読めたっぽいので分ける
                var backgrounds = layers.filter(function (_, animId) {
                    var options = srf.animations[animId].options;
                    return options.some(function (_ref21) {
                        var _ref22 = _slicedToArray(_ref21, 2);

                        var opt = _ref22[0];
                        var args = _ref22[1];
                        return opt === "background";
                    });
                });
                var foregrounds = layers.filter(function (_, animId) {
                    var options = srf.animations[animId].options;
                    return options.every(function (_ref23) {
                        var _ref24 = _slicedToArray(_ref23, 2);

                        var opt = _ref24[0];
                        var args = _ref24[1];
                        return opt !== "background";
                    });
                });
                // パターン全部読めたっぽいのでベースを読む
                return _this13.composeBaseSurface(n).then(function (base) {
                    //this.bufferRender.composePatterns({base, foregrounds, backgrounds});
                    return _this13.bufferRender;
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            /*
            if(this.destructed) return;
            this.layers.filter((anim_id)=>{})
            const backgrounds = this.composeAnimationPatterns(this.backgrounds);//再生途中のアニメーション含むレイヤ
            const elements = (this.surfaceNode.elements);
            const base = this.surfaceNode.base;
            const fronts = this.composeAnimationPatterns(this.layers);//再生途中のアニメーション含むレイヤ
            let baseWidth = 0;
            let baseHeight = 0;
            this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
            // ベースサーフェス作る
            if(this.dynamicBase != null){
              // pattern base があればそちらを使用
              this.bufferRender.composeElements([this.dynamicBase]);
              baseWidth = this.bufferRender.cnv.width;
              baseHeight = this.bufferRender.cnv.height;
            } else {
              // base+elementでベースサーフェス作る
              this.bufferRender.composeElements(
                elements[0] != null ?
                  // element0, element1...
                  elements :
                    base !=null ?
                      // base, element1, element2...
                      [{type: "overlay", canvas: base, x: 0, y: 0}].concat(elements)
                      : []);
              // elementまでがベースサーフェス扱い
              baseWidth = this.bufferRender.cnv.width;
              baseHeight = this.bufferRender.cnv.height;
            }
            const composedBase = this.bufferRender.getSurfaceCanvas();
            // アニメーションレイヤー
            this.bufferRender.composeElements(backgrounds);
            this.bufferRender.composeElements([{type: "overlay", canvas: composedBase, x: 0, y: 0}]); // 現在有効な ベースサーフェスのレイヤを合成
            this.bufferRender.composeElements(fronts);
            // 当たり判定を描画
            if (this.config.enableRegion) {
              this.bufferRender.drawRegions((this.surfaceNode.collisions), ""+this.surfaceId);
              this.backgrounds.forEach((_, animId)=>{
                this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
              });
              this.layers.forEach((_, animId)=>{
                this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), ""+this.surfaceId);
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
            $(this.element).width(baseWidth);//this.cnv.width - bufRender.basePosX);
            $(this.element).height(baseHeight);//this.cnv.height - bufRender.basePosY);
            $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
            $(this.cnv).css("left", -this.bufferRender.basePosX);
            */
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
            /*
            const $elm = $(this.element);
            let tid:any = null;
            let touchCount = 0;
            let touchStartTime = 0;
            const tuples: [string, (ev: JQueryEventObject)=> void][] = [];
            tuples.push(["contextmenu",(ev)=> this.processMouseEvent(ev, "mouseclick")   ]);
            tuples.push(["click",      (ev)=> this.processMouseEvent(ev, "mouseclick")   ]);
            tuples.push(["dblclick",   (ev)=> this.processMouseEvent(ev, "mousedblclick")]);
            tuples.push(["mousedown",  (ev)=> this.processMouseEvent(ev, "mousedown")    ]);
            tuples.push(["mousemove",  (ev)=> this.processMouseEvent(ev, "mousemove")    ]);
            tuples.push(["mouseup",    (ev)=> this.processMouseEvent(ev, "mouseup")      ]);
            tuples.push(["touchmove",  (ev)=> this.processMouseEvent(ev, "mousemove")    ]);
            tuples.push(["touchend",   (ev)=> {
              this.processMouseEvent(ev, "mouseup");
              this.processMouseEvent(ev, "mouseclick");
              if (Date.now() - touchStartTime < 500 && touchCount%2 === 0){
                this.processMouseEvent(ev, "mousedblclick"); }// ダブルタップ->ダブルクリック変換
            }]);
            tuples.push(["touchstart",   (ev)=> {
              touchCount++;
              touchStartTime = Date.now();
              this.processMouseEvent(ev, "mousedown");
              clearTimeout(tid);
              tid = setTimeout(()=> touchCount = 0, 500)
            }]);
            tuples.forEach(([ev, handler])=> $elm.on(ev, handler));// イベント登録
            this.destructors.push(()=>{
              tuples.forEach(([ev, handler])=> $elm.off(ev, handler));// イベント解除
            });
            */
        }
    }, {
        key: "processMouseEvent",
        value: function processMouseEvent(ev, type) {
            /*
            $(ev.target).css({"cursor": "default"});//これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
            const {pageX, pageY, clientX, clientY} = SurfaceUtil.getEventPosition(ev);
            const {left, top} = $(ev.target).offset();
            // body直下 fixed だけにすべきかうーむ
            const {scrollX, scrollY} = SurfaceUtil.getScrollXY();
            if(this.position !== "fixed"){
              var baseX = pageX;
              var baseY = pageY;
              var _left = left;
              var _top = top;
            }else{
              var baseX = clientX;
              var baseY = clientY;
              var _left = left - scrollX;
              var _top = top - scrollY;
            }
            const basePosY = parseInt($(this.cnv).css("top"), 10);  // overlayでのずれた分を
            const basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
            const offsetX = baseX - _left - basePosX;//canvas左上からのx座標
            const offsetY = baseY - _top  - basePosY;//canvas左上からのy座標
            const hit1 = SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.collisions), offsetX, offsetY);//透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            const hits0 = this.backgrounds.map((_, animId)=>{
              return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
            });
            const hits2 = this.layers.map((_, animId)=>{
              return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
            });
            const hits = hits0.concat([hit1], hits2).filter((hit)=> hit !== "");
            const hit = hits[hits.length-1] || hit1;
            const custom: SurfaceMouseEvent = {
              "type": type,
              "offsetX": offsetX|0,//float->int
              "offsetY": offsetY|0,//float->int
              "wheel": 0,
              "scopeId": this.scopeId,
              "region": hit,
              "button": ev.button === 2 ? 1 : 0,
              "transparency": !SurfaceUtil.isHit(this.cnv, offsetX, offsetY),
              "event": ev}; // onした先でpriventDefaultとかstopPropagationとかしたいので
            if(hit !== ""){//もし当たり判定
              ev.preventDefault();
              if(/^touch/.test(ev.type)){
                ev.stopPropagation(); }
                // 当たり判定をゆびで撫でてる時はサーフェスのドラッグをできないようにする
                // ために親要素にイベント伝えない
              $(ev.target).css({"cursor": "pointer"}); //当たり判定でマウスポインタを指に
            }
            this.emit("mouse", custom);
            */
        }
    }]);

    return Surface;
}(events_1.EventEmitter);

exports.Surface = Surface;