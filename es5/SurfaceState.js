/*
 * Surface 状態モデルを更新する副作用関数群
 */
"use strict";
var SU = require("./SurfaceUtil");
var ST = require("./SurfaceTree");
var SC = require("./ShellConfig");
var SM = require("./SurfaceModel");
var SurfaceState = (function () {
    function SurfaceState(surface, renderer) {
        var _this = this;
        this.surface = surface;
        this.renderer = renderer;
        this.continuations = {};
        this.debug = false;
        this.surface.surfaceNode.animations.forEach(function (anim, animId) {
            if (anim != null) {
                _this.initSeriko(animId);
            }
        });
        // 初回更新
        this.constructRenderingTree();
    }
    SurfaceState.prototype.destructor = function () {
        this.surface.destructed = true;
        this.endAll();
    };
    SurfaceState.prototype.render = function () {
        var _this = this;
        this.debug && console.time("render");
        this.constructRenderingTree();
        return this.renderer("render", this.surface).then(function () {
            _this.debug && console.timeEnd("render");
        });
    };
    SurfaceState.prototype.initSeriko = function (animId) {
        // レイヤの初期化、コンストラクタからのみ呼ばれるべき
        var _a = this.surface, surfaceId = _a.surfaceId, surfaceNode = _a.surfaceNode, config = _a.config, scopeId = _a.scopeId;
        if (surfaceNode.animations[animId] == null) {
            console.warn("SurfaceState#initLayer: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
            return;
        }
        var anim = surfaceNode.animations[animId];
        var intervals = anim.intervals, patterns = anim.patterns, options = anim.options, collisions = anim.collisions;
        if (intervals.some(function (_a) {
            var interval = _a[0], args = _a[1];
            return "bind" === interval;
        })) {
            // このanimIDは着せ替え機能付きレイヤ
            if (SC.isBind(config, scopeId, animId)) {
                // 現在有効な bind なら
                if (intervals.length > 1) {
                    // [[bind, []]].length === 1
                    // bind+hogeは着せ替え付随アニメーション。
                    // 現在のレイヤにSERIKOレイヤを追加
                    // インターバルタイマの登録
                    this.begin(animId);
                    return;
                }
                // interval,bind
                return;
            }
            // 現在有効な bind でないなら
            // 現在の合成レイヤの着せ替えレイヤを非表示設定
            // bind+sometimsなどを殺す
            this.end(animId);
            return;
        }
        // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
        // 現在のレイヤにSERIKOレイヤを追加
        this.begin(animId);
    };
    SurfaceState.prototype.updateBind = function () {
        var _this = this;
        var surface = this.surface;
        var animations = surface.surfaceNode.animations;
        animations.forEach(function (_a, animId) {
            var intervals = _a.intervals;
            if (intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return "bind" === interval;
            })) {
                // bind+ を発動
                _this.initSeriko(animId);
            }
        });
        this.constructRenderingTree();
        return this.render();
    };
    // アニメーションタイミングループの開始要請
    SurfaceState.prototype.begin = function (animId) {
        var _this = this;
        var _a = this.surface, serikos = _a.serikos, surfaceNode = _a.surfaceNode, config = _a.config, scopeId = _a.scopeId;
        var _b = surfaceNode.animations[animId], intervals = _b.intervals, patterns = _b.patterns, options = _b.options, collisions = _b.collisions;
        if (intervals.some(function (_a) {
            var interval = _a[0];
            return interval === "bind";
        })) {
            if (!SC.isBind(config, scopeId, animId)) {
                return;
            }
        }
        // SERIKO Layer の状態を変更
        serikos[animId] = new SM.Seriko();
        intervals.forEach(function (_a) {
            var interval = _a[0], args = _a[1];
            // インターバルタイマの登録
            _this.setIntervalTimer(animId, interval, args);
        });
    };
    // アニメーションタイミングループのintervalタイマの停止
    SurfaceState.prototype.end = function (animId) {
        var serikos = this.surface.serikos;
        // SERIKO Layer の状態を変更
        delete serikos[animId];
    };
    // すべての自発的アニメーション再生の停止
    SurfaceState.prototype.endAll = function () {
        var _this = this;
        var serikos = this.surface.serikos;
        Object.keys(serikos).forEach(function (animId) {
            _this.end(Number(animId));
        });
    };
    SurfaceState.prototype.setIntervalTimer = function (animId, interval, args) {
        var _this = this;
        // setTimeoutする、beginからのみ呼ばれてほしい
        var serikos = this.surface.serikos;
        if (!(serikos[animId] instanceof SM.Seriko)) {
            console.warn("SurfaceState#setTimer: animId", animId, "is not SerikoLayer");
            return;
        }
        var fn = function (nextTick) {
            // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
            if (!(serikos[animId] instanceof SM.Seriko)) {
                // nextTick 呼ばないのでintervalを終了する
                return;
            }
            _this.play(animId)
                .catch(function (err) { return console.info("animation canceled", err); })
                .then(function () { nextTick(); });
        };
        // アニメーション描画タイミングの登録
        switch (interval) {
            // nextTickを呼ぶともう一回random
            case "always":
                SU.always(fn);
                return;
            case "runonce":
                setTimeout(function () { return _this.play(animId); });
                return;
            case "never": return;
            case "yen-e": return;
            case "talk": return;
            case "sometimes":
                SU.random(fn, 2);
                return;
            case "rarely":
                SU.random(fn, 4);
                return;
            default:
                var n = isFinite(args[0]) ? args[0]
                    : (console.warn("Surface#setIntervalTimer: failback to", 4, "from", args[0], interval, animId)
                        , 4);
                if (interval === "random") {
                    SU.random(fn, n);
                    return;
                }
                if (interval === "periodic") {
                    SU.periodic(fn, n);
                    return;
                }
        }
        console.warn("SurfaceState#setIntervalTimer: unkown interval:", interval, animId);
        return;
    };
    // アニメーション再生
    SurfaceState.prototype.play = function (animId) {
        var _this = this;
        var _a = this, debug = _a.debug, surface = _a.surface;
        var surfaceNode = surface.surfaceNode, serikos = surface.serikos, destructed = surface.destructed, config = surface.config, scopeId = surface.scopeId;
        var animations = surfaceNode.animations;
        if (!(animations[animId] instanceof ST.SurfaceAnimation)) {
            // そんなアニメーションはない
            console.warn("SurfaceState#play: animation " + animId + " is not defined");
            return Promise.reject("SurfaceState#play: animation " + animId + " is not defined");
        }
        var anim = animations[animId];
        var intervals = anim.intervals, patterns = anim.patterns, options = anim.options, collisions = anim.collisions;
        if (intervals.some(function (_a) {
            var interval = _a[0];
            return interval === "bind";
        })) {
            if (!SC.isBind(config, scopeId, animId)) {
                // その bind+ は現在の着せ替え設定では無効だ
                console.warn("SurfaceState#play: this animation is turned off in current bindgroup state");
                return Promise.reject("SurfaceState#play: this animation is turned off in current bindgroup state");
            }
        }
        if (destructed) {
            // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
            return Promise.reject("SurfaceState#play: destructed");
        }
        if (!(serikos[animId] instanceof SM.Seriko)) {
            // SERIKO Layer の状態を初期化
            serikos[animId] = new SM.Seriko();
        }
        var seriko = serikos[animId];
        if (seriko.patternID >= 0 || seriko.paused) {
            // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
            seriko.canceled = true; // this.step に渡している Seriko への参照はキャンセル
            seriko = serikos[animId] = new SM.Seriko(); // 新しい値を設定
        }
        ST.getExclusives(anim).map(function (exAnimId) {
            // exclusive指定を反映
            if (serikos[exAnimId] instanceof SM.Seriko) {
                serikos[exAnimId].exclusive = true;
            }
        });
        debug && console.group("" + animId);
        debug && console.info("animation start", animId, anim);
        return new Promise(function (resolve, reject) {
            // pause から resume した後に帰るべき場所への継続を取り出す
            _this.continuations[animId] = { resolve: resolve, reject: reject };
            _this.step(animId, seriko);
        }).catch(console.info.bind(console, "animation")).then(function () {
            debug && console.info("animation finish", animId);
            debug && console.groupEnd();
        });
    };
    SurfaceState.prototype.step = function (animId, seriko) {
        var _this = this;
        var _a = this, surface = _a.surface, debug = _a.debug;
        var surfaceNode = surface.surfaceNode, serikos = surface.serikos, destructed = surface.destructed, move = surface.move;
        var _b = this.continuations[animId], resolve = _b.resolve, reject = _b.reject;
        var anim = surfaceNode.animations[animId];
        // patternをすすめる
        // exclusive中のやつら探す
        /*if(!Object.keys(serikos).some((id)=>{
          if(!(serikos[id] instanceof SM.Seriko)){
            return false;
          }
          const seriko = serikos[id];
          if(seriko.exclusive && Number(id) === animId){ // exclusiveが存在しなおかつ自分は含まれる
            return true;
          }
          return false; // exclusive が存在しない
        })){
          // exclusiveが存在しなおかつ自分は含まれないので
          seriko.canceled = true;
        }*/
        if (seriko.canceled) {
            // キャンセルされたので reject
            return reject("SurfaceState#step: canceled.");
        }
        if (seriko.paused) {
            // 次にplayが呼び出されるまで何もしない 
            return;
        }
        // patternID は現在表示中のパタン
        // patternID === -1 は +1 され 0 になり wait ミリ秒間待ってから patternID === 0 を表示するとの意思表明
        // patternID+1 はこれから表示
        seriko.patternID++;
        if (anim.patterns[seriko.patternID] == null) {
            // このステップで次に表示すべきなにかがない＝このアニメは終了
            seriko.finished = true;
        }
        if (seriko.finished) {
            // 初期化
            serikos[animId] = new SM.Seriko();
            delete this.continuations[animId];
            return resolve();
        }
        var _c = anim.patterns[seriko.patternID], wait = _c.wait, type = _c.type, x = _c.x, y = _c.y, animation_ids = _c.animation_ids;
        var _surface = anim.patterns[seriko.patternID].surface;
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
                this.renderer("move", surface);
                return;
        }
        var _wait = SU.randomRange(wait[0], wait[1]);
        // waitだけ待ってからレンダリング
        debug && console.time("waiting: " + _wait + "ms");
        setTimeout(function () {
            debug && console.timeEnd("waiting: " + _wait + "ms");
            if (_surface < -2) {
                // SERIKO/1.4 ?
                console.warn("SurfaceState#step: pattern surfaceId", surface, "is not defined in SERIKO/1.4, failback to -2");
                _surface = -2;
            }
            if (_surface === -1) {
                // SERIKO/1.4 -1 として表示されいたこのアニメーション終了 
                seriko.finished = true;
                return _this.step(animId, seriko);
            }
            if (_surface === -2) {
                // SERIKO/1.4 全アニメーション停止
                Object.keys(serikos).forEach(function (id) {
                    if (serikos[id] instanceof SM.Seriko) {
                        serikos[id].finished = true;
                        _this.step(animId, serikos[id]);
                    }
                });
            }
            // 描画
            _this.render().then(function () {
                // 次のパターン処理へ
                _this.step(animId, seriko);
            });
        }, _wait);
    };
    // 再生中のアニメーションを停止しろ
    SurfaceState.prototype.stop = function (animId) {
        var serikos = this.surface.serikos;
        if (serikos[animId] instanceof SM.Seriko) {
            // 何らかの理由で停止要請がでたのでつまりキャンセル
            serikos[animId].canceled = true;
        }
    };
    SurfaceState.prototype.pause = function (animId) {
        var serikos = this.surface.serikos;
        if (serikos[animId] instanceof SM.Seriko) {
            serikos[animId].paused = true;
        }
    };
    SurfaceState.prototype.resume = function (animId) {
        var serikos = this.surface.serikos;
        if (serikos[animId] instanceof SM.Seriko) {
            serikos[animId].paused = false;
            this.step(animId, serikos[animId]);
        }
    };
    SurfaceState.prototype.talk = function () {
        var _this = this;
        var srf = this.surface;
        var _a = this.surface, surfaceNode = _a.surfaceNode, serikos = _a.serikos;
        var animations = surfaceNode.animations;
        srf.talkCount++;
        // talkなものでかつtalkCountとtalk,nのmodが0なもの
        var hits = animations.filter(function (anim, animId) {
            return anim.intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return "talk" === interval && srf.talkCount % args[0] === 0;
            });
        });
        hits.forEach(function (anim, animId) {
            // そのtalkアニメーションは再生が終了しているか？
            if (serikos[animId] instanceof SM.Seriko) {
                if (serikos[animId].patternID < 0) {
                    _this.play(animId);
                }
            }
        });
    };
    SurfaceState.prototype.yenE = function () {
        var _this = this;
        var anims = this.surface.surfaceNode.animations;
        anims.forEach(function (anim, animId) {
            if (anim.intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return interval === "yen-e";
            })) {
                _this.play(animId);
            }
        });
    };
    SurfaceState.prototype.constructRenderingTree = function () {
        // 再帰的にpatternで読んでいるベースサーフェス先のbindまで考慮してレンダリングツリーを構築し反映
        var _a = this, surface = _a.surface, debug = _a.debug;
        var surfaceId = surface.surfaceId, serikos = surface.serikos, renderingTree = surface.renderingTree, shell = surface.shell, scopeId = surface.scopeId;
        var config = shell.config, surfaceDefTree = shell.surfaceDefTree;
        var surfaces = surfaceDefTree.surfaces;
        surface.renderingTree = layersToTree(surfaces, scopeId, surfaceId, serikos, config);
        debug && console.log("diff: ", SU.diff(renderingTree, surface.renderingTree));
        // レンダリングツリーが更新された！
    };
    return SurfaceState;
}());
exports.SurfaceState = SurfaceState;
function layersToTree(surfaces, scopeId, n, serikos, config) {
    var _a = surfaces[n], animations = _a.animations, collisions = _a.collisions;
    var tree = new SM.SurfaceRenderingTree(n);
    tree.collisions = collisions;
    animations.forEach(function (anim, animId) {
        var patterns = anim.patterns, collisions = anim.collisions, intervals = anim.intervals;
        var rndLayerSets = [];
        // seriko で表示されているものをレンダリングツリーに追加
        if (serikos[animId] instanceof SM.Seriko) {
            var patternID = serikos[animId].patternID;
            if (patterns[patternID] instanceof ST.SurfaceAnimationPattern) {
                // pattern が定義されている seriko layer
                var _a = patterns[patternID], type = _a.type, surface = _a.surface, x = _a.x, y = _a.y;
                if (surface > 0) {
                    // 非表示でない
                    if (surfaces[surface] instanceof ST.SurfaceDefinition) {
                        var _tree = recursiveBind(surfaces, surface, serikos, config, collisions);
                        rndLayerSets.push(new SM.SurfaceRenderingLayer(type, _tree, x, y));
                    }
                    else {
                        // 存在しないサーフェスを参照した
                        console.warn("SurfaceState.layersToTree: surface", n, "is not defined");
                    }
                }
            }
        }
        else if (SC.isBind(config, scopeId, animId) && intervals.some(function (_a) {
            var interval = _a[0], args = _a[1];
            return "bind" === interval;
        }) && intervals.length === 1) {
            // interval,bind である、 insert のための再帰的処理
            processInsert(patterns, collisions, rndLayerSets);
        }
        if (ST.isBack(anim)) {
            tree.backgrounds.push(rndLayerSets);
        }
        else {
            tree.foregrounds.push(rndLayerSets);
        }
    });
    return tree;
    function processInsert(patterns, collisions, rndLayerSets) {
        // SC.isBind(config, animId) && intervals.some(([interval, args])=> "bind" === interval) && intervals.length === 1
        // なときだけ呼ばれたい
        // TODO: insert の循環参照を防ぐ
        patterns.forEach(function (_a, patId) {
            var type = _a.type, surface = _a.surface, x = _a.x, y = _a.y, animation_ids = _a.animation_ids;
            if (type === "insert") {
                // insertの場合は対象のIDをとってくる
                var insertId = animation_ids[0];
                if (!(animations[insertId] instanceof ST.SurfaceAnimation)) {
                    console.warn("SurfaceState.layersToTree", "insert id", animation_ids, "is wrong target.", n, patId);
                    return;
                }
                var _b = animations[insertId], patterns_1 = _b.patterns, collisions_1 = _b.collisions;
                // insertをねじ込む
                processInsert(patterns_1, collisions_1, rndLayerSets);
                return;
            }
            if (surface > 0 && surfaces[surface] instanceof ST.SurfaceDefinition) {
                var tree_1 = recursiveBind(surfaces, surface, serikos, config, collisions);
                rndLayerSets.push(new SM.SurfaceRenderingLayer(type, tree_1, x, y));
            }
            else {
                // MAYUNA で -1 はありえん
                console.warn("SurfaceState.layersToTree: unexpected surface id ", surface);
            }
        });
    }
    function recursiveBind(surfaces, n, serikos, config, collisions) {
        // この関数は n が surfaces[n] に存在することを必ず確認してから呼ぶこと
        // TODO: bind の循環参照発生するので防ぐこと
        var animations = surfaces[n].animations;
        var tree = new SM.SurfaceRenderingTree(n);
        // animation0.collision0
        tree.collisions = collisions;
        animations.forEach(function (anim, animId) {
            var patterns = anim.patterns, intervals = anim.intervals, collisions = anim.collisions;
            var rndLayerSets = [];
            if (SC.isBind(config, scopeId, animId) && intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return "bind" === interval;
            }) && intervals.length === 1) {
                // interval,bind である、 insert のための再帰的処理
                processInsert(patterns, collisions, rndLayerSets);
            }
            if (ST.isBack(anim)) {
                tree.backgrounds.push(rndLayerSets);
            }
            else {
                tree.foregrounds.push(rndLayerSets);
            }
        });
        return tree;
    }
}
exports.layersToTree = layersToTree;
