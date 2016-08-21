"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SU = require("./SurfaceUtil");
var ST = require("./SurfaceTree");
var SC = require("./ShellConfig");
var SM = require("./SurfaceModel");
var events_1 = require("events");

var SurfaceState = function (_events_1$EventEmitte) {
    _inherits(SurfaceState, _events_1$EventEmitte);

    // on("move", callback: Function)
    //   move メソッドが発生したことを伝えており暗にウィンドウマネージャへウインドウ位置を変更するよう恫喝している
    // on("render", callback: Function)
    //   描画すべきタイミングなので canvas に描画してくれ 
    function SurfaceState(scopeId, surfaceId, shellState) {
        _classCallCheck(this, SurfaceState);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SurfaceState).call(this));

        _this.shellState = shellState;
        _this.surface = new SM.Surface(scopeId, surfaceId, shellState.shell);
        _this.section = [];
        _this.surface.surfaceNode.animations.forEach(function (_, animId) {
            _this.initLayer(animId);
        });
        _this.shellState.on("bindgroup_update", function () {
            _this.updateBind();
        });
        _this.emit("render");
        return _this;
    }

    _createClass(SurfaceState, [{
        key: "initLayer",
        value: function initLayer(animId) {
            // レイヤの初期化、コンストラクタからのみ呼ばれるべき
            var _surface = this.surface;
            var surfaceId = _surface.surfaceId;
            var surfaceNode = _surface.surfaceNode;
            var config = _surface.config;
            var layers = _surface.layers;

            if (surfaceNode.animations[animId] == null) {
                console.warn("Surface#initAnimation: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
                return;
            }
            var anim = surfaceNode.animations[animId];
            var intervals = anim.intervals;
            var patterns = anim.patterns;
            var options = anim.options;
            var collisions = anim.collisions;

            if (intervals.some(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var interval = _ref2[0];
                var args = _ref2[1];
                return "bind" === interval;
            })) {
                // このanimIDは着せ替え機能付きレイヤ
                if (SC.isBind(config, animId)) {
                    // 現在有効な bind なら
                    if (intervals.length > 1) {
                        // [[bind, []]].length === 1
                        // bind+hogeは着せ替え付随アニメーション。
                        // 現在のレイヤにSERIKOレイヤを追加
                        layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
                        // インターバルタイマの登録
                        this.begin(animId);
                        return;
                    }
                    // interval,bind
                    // 現在のレイヤにMAYUNAレイヤを追加
                    layers[animId] = new SM.MayunaLayer(true, ST.isBack(anim));
                    return;
                }
                // 現在有効な bind でないなら
                // 現在の合成レイヤの着せ替えレイヤを非表示設定
                layers[animId] = new SM.MayunaLayer(false, ST.isBack(anim));
                // ついでにbind+sometimsなどを殺す
                this.end(animId);
                return;
            }
            // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
            // 現在のレイヤにSERIKOレイヤを追加
            layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
            this.begin(animId);
        }
    }, {
        key: "updateBind",
        value: function updateBind() {
            var _this2 = this;

            var animations = this.surface.surfaceNode.animations;
            animations.forEach(function (_ref3, animId) {
                var intervals = _ref3.intervals;

                if (intervals.some(function (_ref4) {
                    var _ref5 = _slicedToArray(_ref4, 2);

                    var interval = _ref5[0];
                    var args = _ref5[1];
                    return "bind" === interval;
                })) {
                    _this2.initLayer(animId);
                }
            });
        }
        // アニメーションタイミングループの開始要請

    }, {
        key: "begin",
        value: function begin(animId) {
            var _this3 = this;

            var _surface2 = this.surface;
            var surfaceNode = _surface2.surfaceNode;
            var config = _surface2.config;
            var _surfaceNode$animatio = surfaceNode.animations[animId];
            var intervals = _surfaceNode$animatio.intervals;
            var patterns = _surfaceNode$animatio.patterns;
            var options = _surfaceNode$animatio.options;
            var collisions = _surfaceNode$animatio.collisions;

            if (SC.isBind(config, animId)) {
                intervals.filter(function (_ref6) {
                    var _ref7 = _slicedToArray(_ref6, 1);

                    var interval = _ref7[0];
                    return interval !== "bind";
                }).forEach(function (_ref8) {
                    var _ref9 = _slicedToArray(_ref8, 2);

                    var interval = _ref9[0];
                    var args = _ref9[1];

                    // インターバルタイマの登録
                    _this3.setIntervalTimer(animId, interval, args);
                });
            }
        }
        // アニメーションタイミングループのintervalタイマの停止

    }, {
        key: "end",
        value: function end(animId) {
            var seriko = this.surface.seriko;
            // SERIKO Layer の状態を変更

            seriko[animId] = false;
        }
        // すべての自発的アニメーション再生の停止

    }, {
        key: "endAll",
        value: function endAll() {
            var _this4 = this;

            var layers = this.surface.layers;

            layers.forEach(function (layer, animId) {
                _this4.end(animId);
            });
        }
    }, {
        key: "setIntervalTimer",
        value: function setIntervalTimer(animId, interval, args) {
            var _this5 = this;

            // setTimeoutする、beginからのみ呼ばれてほしい
            var _surface3 = this.surface;
            var layers = _surface3.layers;
            var seriko = _surface3.seriko;

            var layer = layers[animId];
            if (layer instanceof SM.SerikoLayer) {
                var n = isFinite(args[0]) ? args[0] : (console.warn("Surface#setTimer: failback to", 4, interval, animId), 4);
                seriko[animId] = true;
                var fn = function fn(nextTick) {
                    // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
                    if (!seriko[animId]) return; // nextTick 呼ばないのでintervalを終了する
                    _this5.play(animId).catch(function (err) {
                        return console.info("animation canceled", err);
                    }).then(function () {
                        return nextTick();
                    });
                };
                // アニメーション描画タイミングの登録
                switch (interval) {
                    // nextTickを呼ぶともう一回random
                    case "sometimes":
                        SU.random(fn, 2);
                        return;
                    case "rarely":
                        SU.random(fn, 4);
                        return;
                    case "random":
                        SU.random(fn, n);
                        return;
                    case "periodic":
                        SU.periodic(fn, n);
                        return;
                    case "always":
                        SU.always(fn);
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
            }
            console.warn("Surface#setTimer: animId", animId, "is not SerikoLayer");
            return;
        }
        // アニメーション再生

    }, {
        key: "play",
        value: function play(animId) {
            var _this6 = this;

            var srf = this.surface;
            var _surface4 = this.surface;
            var surfaceNode = _surface4.surfaceNode;
            var layers = _surface4.layers;
            var destructed = _surface4.destructed;

            if (destructed) {
                // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
                return Promise.reject("destructed");
            }
            if (!(layers[animId] instanceof SM.SerikoLayer)) {
                // そんなアニメーションはない
                console.warn("Surface#play", "animation", animId, "is not defined");
                return Promise.reject("no such animation");
            }
            var layer = layers[animId];
            var anim = surfaceNode.animations[animId];
            if (layer.patternID >= 0 || layer.paused) {
                // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
                layer.canceled = true; // キャンセル
                layer = layers[animId] = new SM.SerikoLayer(ST.isBack(anim)); // 値の初期化
            }
            ST.getExclusives(anim).map(function (exAnimId) {
                // exclusive指定を反映
                var layer = layers[exAnimId];
                if (layer instanceof SM.SerikoLayer) {
                    layer.exclusive = true;
                }
            });
            return new Promise(function (resolve, reject) {
                _this6.section[animId] = { resolve: resolve, reject: reject };
                _this6.step(animId, layer);
            });
        }
    }, {
        key: "step",
        value: function step(animId, layer) {
            var _this7 = this;

            var srf = this.surface;
            var _surface5 = this.surface;
            var surfaceNode = _surface5.surfaceNode;
            var layers = _surface5.layers;
            var destructed = _surface5.destructed;
            var move = _surface5.move;
            var _section$animId = this.section[animId];
            var resolve = _section$animId.resolve;
            var reject = _section$animId.reject;

            var anim = surfaceNode.animations[animId];
            // patternをすすめる
            // exclusive中のやつら探す
            if (!layers.some(function (layer, id) {
                return !(layer instanceof SM.SerikoLayer) ? false // layer が mayuna なら 論外
                : !layer.exclusive ? false // exclusive が存在しない
                : id === animId;
            } // exclusiveが存在しなおかつ自分は含まれる
            )) {
                // exclusiveが存在しなおかつ自分は含まれないので
                layer.canceled = true;
            }
            if (layer.canceled) {
                // キャンセルされたので reject
                return reject("canceled");
            }
            if (layer.paused) {
                // 次にplayが呼び出されるまで何もしない 
                return;
            }
            if (layer.patternID !== -1 && anim.patterns[layer.patternID + 1] == null) {
                // -1 は一番初めでなくて、 +1 は次のレイヤがない
                // 正のレイヤIDなのに次のレイヤがない＝このアニメは終了
                layer.finished = true;
            }
            if (layer.finished) {
                layers[animId] = new SM.SerikoLayer(ST.isBack(anim));
                delete this.section[animId];
                return resolve();
            }
            // 再生中っぽい
            layer.patternID++;
            var _anim$patterns$layer$ = anim.patterns[layer.patternID];
            var surface = _anim$patterns$layer$.surface;
            var wait = _anim$patterns$layer$.wait;
            var type = _anim$patterns$layer$.type;
            var x = _anim$patterns$layer$.x;
            var y = _anim$patterns$layer$.y;
            var animation_ids = _anim$patterns$layer$.animation_ids;

            switch (type) {
                // 付随再生であってこのアニメの再生終了は待たない・・・はず？
                case "start":
                    this.play(animation_ids[0]);
                    return;
                case "stop":
                    this.stop(animation_ids[0]);
                    return;
                case "alternativestart":
                    this.play(SU.choice(animation_ids));
                    return;
                case "alternativestop":
                    this.stop(SU.choice(animation_ids));
                    return;
                case "move":
                    move.x = x;
                    move.y = y;
                    this.emit("move");
                    return;
            }
            // waitだけ待つ
            setTimeout(function () {
                _this7.step(animId, layer);
            }, SU.randomRange(wait[0], wait[1]));
            this.emit("render");
        }
        // 再生中のアニメーションを停止しろ

    }, {
        key: "stop",
        value: function stop(animId) {
            var layer = this.surface.layers[animId];
            if (layer instanceof SM.SerikoLayer) {
                // 何らかの理由で停止要請がでたのでつまりキャンセル
                layer.canceled = true;
            }
        }
    }, {
        key: "pause",
        value: function pause(animId) {
            var layer = this.surface.layers[animId];
            if (layer instanceof SM.SerikoLayer) {
                layer.paused = true;
            }
        }
    }, {
        key: "resume",
        value: function resume(animId) {
            var layer = this.surface.layers[animId];
            if (layer instanceof SM.SerikoLayer) {
                layer.paused = false;
                this.step(animId, layer);
            }
        }
    }, {
        key: "talk",
        value: function talk() {
            var _this8 = this;

            var srf = this.surface;
            var _surface6 = this.surface;
            var surfaceNode = _surface6.surfaceNode;
            var layers = _surface6.layers;

            var animations = surfaceNode.animations;
            srf.talkCount++;
            // talkなものでかつtalkCountとtalk,nのmodが0なもの
            var hits = animations.filter(function (anim, animId) {
                return anim.intervals.some(function (_ref10) {
                    var _ref11 = _slicedToArray(_ref10, 2);

                    var interval = _ref11[0];
                    var args = _ref11[1];
                    return "talk" === interval && srf.talkCount % args[0] === 0;
                });
            });
            hits.forEach(function (anim, animId) {
                // そのtalkアニメーションは再生が終了しているか？
                if (layers[animId] instanceof SM.SerikoLayer) {
                    var layer = layers[animId];
                    if (layer.patternID < 0) {
                        _this8.play(animId);
                    }
                }
            });
        }
    }, {
        key: "yenE",
        value: function yenE() {
            var _this9 = this;

            var srf = this.surface;
            var _surface7 = this.surface;
            var surfaceNode = _surface7.surfaceNode;
            var layers = _surface7.layers;

            var anims = surfaceNode.animations;
            anims.forEach(function (anim, animId) {
                if (anim.intervals.some(function (_ref12) {
                    var _ref13 = _slicedToArray(_ref12, 2);

                    var interval = _ref13[0];
                    var args = _ref13[1];
                    return interval === "yen-e";
                })) {
                    _this9.play(animId);
                }
            });
        }
    }]);

    return SurfaceState;
}(events_1.EventEmitter);

exports.SurfaceState = SurfaceState;