"use strict";
const SU = require("./SurfaceUtil");
const ST = require("./SurfaceTree");
const SC = require("./ShellConfig");
const SM = require("./SurfaceModel");
const events_1 = require("events");
class SurfaceState extends events_1.EventEmitter {
    // アニメーション終了時に呼び出す手はずになっているプロミス値への継続
    // on("move", callback: Function)
    //   move メソッドが発生したことを伝えており暗にウィンドウマネージャへウインドウ位置を変更するよう恫喝している
    // on("render", callback: Function)
    //   描画すべきタイミングなので canvas に描画してくれ 
    constructor(scopeId, surfaceId, shellState) {
        super();
        this.shellState = shellState;
        this.surface = new SM.Surface(scopeId, surfaceId, shellState.shell);
        this.continuations = [];
        this.surface.surfaceNode.animations.forEach((anim, animId) => {
            if (anim != null) {
                this.initLayer(animId);
            }
        });
        this.shellState.on("bindgroup_update", () => {
            // ShellConfig の値が変化し bindgroup_update の構成が変化した！
            this.updateBind();
        });
        this.constructRenderingTree();
    }
    initLayer(animId) {
        // レイヤの初期化、コンストラクタからのみ呼ばれるべき
        const { surfaceId, surfaceNode, config, layers } = this.surface;
        if (surfaceNode.animations[animId] == null) {
            console.warn("SurfaceState#initLayer: animationID", animId, "is not defined in ", surfaceId, surfaceNode);
            return;
        }
        const anim = surfaceNode.animations[animId];
        const { intervals, patterns, options, collisions } = anim;
        if (intervals.some(([interval, args]) => "bind" === interval)) {
            // このanimIDは着せ替え機能付きレイヤ
            if (SC.isBind(config, animId)) {
                // 現在有効な bind なら
                if (intervals.length > 1) {
                    // [[bind, []]].length === 1
                    // bind+hogeは着せ替え付随アニメーション。
                    // 現在のレイヤにSERIKOレイヤを追加
                    layers[animId] = new SM.SerikoLayer(patterns, ST.isBack(anim));
                    // インターバルタイマの登録
                    this.begin(animId);
                    return;
                }
                // interval,bind
                // 現在のレイヤにMAYUNAレイヤを追加
                layers[animId] = new SM.MayunaLayer(patterns, ST.isBack(anim), true);
                return;
            }
            // 現在有効な bind でないなら
            // 現在の合成レイヤの着せ替えレイヤを非表示設定
            layers[animId] = new SM.MayunaLayer(patterns, ST.isBack(anim), false);
            // ついでにbind+sometimsなどを殺す
            this.end(animId);
            return;
        }
        // 着せ替え機能なしレイヤ = 全てSERIKOレイヤ
        // 現在のレイヤにSERIKOレイヤを追加
        layers[animId] = new SM.SerikoLayer(patterns, ST.isBack(anim));
        this.begin(animId);
    }
    updateBind() {
        const animations = this.surface.surfaceNode.animations;
        animations.forEach(({ intervals }, animId) => {
            if (intervals.some(([interval, args]) => "bind" === interval)) {
                this.initLayer(animId);
            }
        });
        this.constructRenderingTree();
    }
    // アニメーションタイミングループの開始要請
    begin(animId) {
        const { surfaceNode, config } = this.surface;
        const { intervals, patterns, options, collisions } = surfaceNode.animations[animId];
        if (intervals.some(([interval]) => interval === "bind")) {
            if (!SC.isBind(config, animId)) {
                return;
            }
        }
        intervals.forEach(([interval, args]) => {
            // インターバルタイマの登録
            this.setIntervalTimer(animId, interval, args);
        });
    }
    // アニメーションタイミングループのintervalタイマの停止
    end(animId) {
        const { seriko } = this.surface;
        // SERIKO Layer の状態を変更
        seriko[animId] = false;
    }
    // すべての自発的アニメーション再生の停止
    endAll() {
        const { layers } = this.surface;
        layers.forEach((layer, animId) => {
            this.end(animId);
        });
    }
    setIntervalTimer(animId, interval, args) {
        // setTimeoutする、beginからのみ呼ばれてほしい
        const { layers, seriko } = this.surface;
        const layer = layers[animId];
        if (layer instanceof SM.SerikoLayer) {
            seriko[animId] = true;
            const fn = (nextTick) => {
                // nextTick は アニメーション終わってから呼ぶともういっぺん random や always されるもの
                if (!seriko[animId])
                    return; // nextTick 呼ばないのでintervalを終了する  
                this.play(animId)
                    .catch((err) => console.info("animation canceled", err))
                    .then(() => { nextTick(); });
            };
            // アニメーション描画タイミングの登録
            switch (interval) {
                // nextTickを呼ぶともう一回random
                case "always":
                    SU.always(fn);
                    return;
                case "runonce":
                    setTimeout(() => this.play(animId));
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
                    const n = isFinite(args[0]) ? args[0]
                        : (console.warn("Surface#setTimer: failback to", 4, "from", args[0], interval, animId, layer)
                            , 4);
                    if (interval === "random") {
                        SU.random(fn, n);
                        return;
                    }
                    if (interval === "periodic") {
                        SU.periodic(fn, n);
                        return;
                    }
                    console.warn("SurfaceState#setTimer > unkown interval:", interval, animId);
                    return;
            }
        }
        console.warn("SurfaceState#setTimer: animId", animId, "is not SerikoLayer");
        return;
    }
    // アニメーション再生
    play(animId) {
        const srf = this.surface;
        const { surfaceNode, layers, destructed } = this.surface;
        if (destructed) {
            // 既に破棄されたサーフェスなのでアニメーション再生とかありえん
            return Promise.reject("destructed");
        }
        if (!(layers[animId] instanceof SM.SerikoLayer)) {
            // そんなアニメーションはない
            console.warn("SurfaceState#play", "animation", animId, "is not defined");
            return Promise.reject("no such animation");
        }
        let layer = layers[animId];
        const anim = surfaceNode.animations[animId];
        if (layer.patternID >= 0 || layer.paused) {
            // 既に再生中、ポーズ中ならば再生停止して最初からどうぞ
            layer.canceled = true; // キャンセル
            layer = layers[animId] = new SM.SerikoLayer(layer.patterns, layer.background); // 値の初期化
        }
        ST.getExclusives(anim).map((exAnimId) => {
            // exclusive指定を反映
            const layer = layers[exAnimId];
            if (layer instanceof SM.SerikoLayer) {
                layer.exclusive = true;
            }
        });
        console.group("" + animId);
        console.info("start animation", animId, this.surface.surfaceNode.animations[animId]);
        return new Promise((resolve, reject) => {
            this.continuations[animId] = { resolve, reject };
            this.step(animId, layer);
        }).then(() => {
            console.info("finish animation", animId);
            console.groupEnd();
        });
    }
    step(animId, layer) {
        const srf = this.surface;
        const { surfaceNode, layers, destructed, move } = this.surface;
        const { resolve, reject } = this.continuations[animId];
        const anim = surfaceNode.animations[animId];
        // patternをすすめる
        // exclusive中のやつら探す
        if (layers.some((layer, id) => !(layer instanceof SM.SerikoLayer) ? false // layer が mayuna なら 論外
            : !layer.exclusive ? false // exclusive が存在しない
                : id === animId // exclusiveが存在しなおかつ自分は含まれる
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
        // patternID は現在表示中のパタン
        // patternID === -1 は +1 され 0 になり wait ミリ秒間待ってから patternID === 0 を表示するとの意思表明
        // patternID+1 はこれから表示
        layer.patternID++;
        if (anim.patterns[layer.patternID] == null) {
            // このステップで次に表示すべきなにかがない＝このアニメは終了
            layer.finished = true;
        }
        if (layer.finished) {
            // 初期化
            layers[animId] = new SM.SerikoLayer(layer.patterns, layer.background);
            delete this.continuations[animId];
            //this.constructRenderingTree();
            return resolve();
        }
        const { wait, type, x, y, animation_ids } = anim.patterns[layer.patternID];
        let { surface } = anim.patterns[layer.patternID];
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
        const _wait = SU.randomRange(wait[0], wait[1]);
        // waitだけ待ってからレンダリング
        console.time("step" + _wait);
        setTimeout(() => {
            console.timeEnd("step" + _wait);
            if (surface < -2) {
                // SERIKO/1.4 ?
                console.warn("SurfaceState#step: pattern surfaceId", surface, "is not defined in SERIKO/1.4, failback to -2");
                surface = -2;
            }
            if (surface === -1) {
                // SERIKO/1.4 -1 として表示されいたこのアニメーション終了 
                layer.finished = true;
                return this.step(animId, layer);
            }
            if (surface === -2) {
                // SERIKO/1.4 全アニメーション停止
                layers.forEach((layer) => {
                    if (layer instanceof SM.SerikoLayer) {
                        layer.finished = true;
                        this.step(animId, layer);
                    }
                });
            }
            this.constructRenderingTree();
            this.step(animId, layer);
        }, _wait);
    }
    // 再生中のアニメーションを停止しろ
    stop(animId) {
        const layer = this.surface.layers[animId];
        if (layer instanceof SM.SerikoLayer) {
            // 何らかの理由で停止要請がでたのでつまりキャンセル
            layer.canceled = true;
        }
    }
    pause(animId) {
        const layer = this.surface.layers[animId];
        if (layer instanceof SM.SerikoLayer) {
            layer.paused = true;
        }
    }
    resume(animId) {
        const layer = this.surface.layers[animId];
        if (layer instanceof SM.SerikoLayer) {
            layer.paused = false;
            this.step(animId, layer);
        }
    }
    talk() {
        const srf = this.surface;
        const { surfaceNode, layers } = this.surface;
        const animations = surfaceNode.animations;
        srf.talkCount++;
        // talkなものでかつtalkCountとtalk,nのmodが0なもの
        const hits = animations.filter((anim, animId) => anim.intervals.some(([interval, args]) => "talk" === interval && srf.talkCount % args[0] === 0));
        hits.forEach((anim, animId) => {
            // そのtalkアニメーションは再生が終了しているか？
            if (layers[animId] instanceof SM.SerikoLayer) {
                const layer = layers[animId];
                if (layer.patternID < 0) {
                    this.play(animId);
                }
            }
        });
    }
    yenE() {
        const srf = this.surface;
        const { surfaceNode, layers } = this.surface;
        const anims = surfaceNode.animations;
        anims.forEach((anim, animId) => {
            if (anim.intervals.some(([interval, args]) => interval === "yen-e")) {
                this.play(animId);
            }
        });
    }
    constructRenderingTree() {
        // 再帰的にpatternで読んでいるベースサーフェス先のbindまで考慮してレンダリングツリーを構築し反映
        const srf = this.surface;
        const { surfaceId, layers, shell } = srf;
        const surfaces = srf.shell.surfaceDefTree.surfaces;
        const config = shell.config;
        const tmp = SU.extend(true, {}, srf.renderingTree);
        srf.renderingTree = layersToTree(surfaces, surfaceId, layers, config);
        console.log("diff: ", /*tmp, srf.renderingTree, */ SU.diff(tmp, srf.renderingTree));
        // レンダリングツリーが更新された！
        this.emit("render");
    }
}
exports.SurfaceState = SurfaceState;
function layersToTree(surfaces, n, layers, config) {
    // bind の循環参照注意
    const tree = new SM.SurfaceRenderingTree(n);
    const anims = surfaces[n].animations;
    let recur = (patterns, rndLayerSets) => {
        // insert の循環参照注意
        patterns.forEach(({ type, surface, x, y, animation_ids }, patId) => {
            if (type === "insert") {
                // insertの場合は対象のIDをとってくる
                const insertId = animation_ids[0];
                const anim = anims[insertId];
                if (!(anim instanceof ST.SurfaceAnimation)) {
                    console.warn("SurfaceState.layersToTree", "insert id", animation_ids, "is wrong target.", n, patId);
                    return;
                }
                // insertをねじ込む
                recur(patterns, rndLayerSets);
            }
            else {
                if (surface > 0) {
                    rndLayerSets.push(new SM.SurfaceRenderingLayer(type, recur2(surfaces, surface, layers, config), x, y));
                }
                else {
                    // MAYUNA で -1 はありえん
                    console.warn("SurfaceState.layersToTree: unexpected surface id ", surface);
                }
            }
        });
    };
    let recur2 = (surfaces, n, layers, config) => {
        const tree = new SM.SurfaceRenderingTree(n);
        if (!(surfaces[n] instanceof ST.SurfaceDefinition)) {
            console.warn("SurfaceState.layer2tree: surface", n, "is not defined");
            return tree;
        }
        const anims = surfaces[n].animations;
        anims.forEach((anim, animId) => {
            const { patterns, intervals, collisions } = anim;
            const rndLayerSets = [];
            if (SC.isBind(config, animId) && intervals.some(([interval, args]) => "bind" === interval) && intervals.length === 1) {
                // insert のための再帰的処理
                recur(patterns, rndLayerSets);
            }
            tree.collisions = collisions;
            (ST.isBack(anim) ? tree.backgrounds : tree.foregrounds).push(rndLayerSets);
        });
        return tree;
    };
    layers.forEach((layer, animId) => {
        const anim = anims[animId];
        const { patterns, collisions } = anim;
        const rndLayerSets = [];
        if (layer instanceof SM.SerikoLayer && layer.patternID >= 0 && patterns[layer.patternID] != null) {
            // patternID >= 0 で pattern が定義されている seriko layer
            const { type, surface, x, y } = patterns[layer.patternID];
            if (surface > 0) {
                // 非表示
                rndLayerSets.push(new SM.SurfaceRenderingLayer(type, recur2(surfaces, surface, layers, config), x, y));
            }
        }
        else if (layer instanceof SM.MayunaLayer && layer.visible) {
            // insert のための再帰的処理
            recur(patterns, rndLayerSets);
        }
        tree.collisions = collisions;
        (ST.isBack(anim) ? tree.backgrounds : tree.foregrounds).push(rndLayerSets);
    });
    return tree;
}
exports.layersToTree = layersToTree;
