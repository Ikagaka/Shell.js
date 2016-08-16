/// <reference path="../typings/index.d.ts"/>
"use strict";
const SurfaceRender_1 = require("./SurfaceRender");
const SurfaceUtil = require("./SurfaceUtil");
const ST = require("./SurfaceTree");
const EventEmitter = require("events");
const $ = require("jquery");
class Surface extends EventEmitter.EventEmitter {
    constructor(div, scopeId, surfaceId, surfaceDefTree, bindgroup) {
        super();
        this.element = div;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.cnv = SurfaceUtil.createCanvas();
        const ctx = this.cnv.getContext("2d");
        if (ctx == null)
            throw new Error("Surface#constructor: ctx is null");
        this.ctx = ctx;
        this.bindgroup = bindgroup;
        this.position = "fixed";
        this.surfaceDefTree = surfaceDefTree;
        this.surfaceTree = surfaceDefTree.surfaces;
        this.surfaceNode = surfaceDefTree.surfaces[surfaceId];
        this.exclusives = [];
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = {};
        this.backgrounds = [];
        this.layers = [];
        this.stopFlags = {};
        this.dynamicBase = null;
        this.destructed = false;
        this.destructors = [];
        // GCの発生を抑えるためレンダラはこれ１つを使いまわす
        this.bufferRender = new SurfaceRender_1.default();
        this.initDOMStructure();
        this.initMouseEvent();
        this.surfaceNode.animations.forEach((anim, id) => { this.initAnimation(id, anim); });
        this.render();
    }
    destructor() {
        $(this.element).children().remove();
        this.destructors.forEach((fn) => fn());
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
    initDOMStructure() {
        this.element.appendChild(this.cnv);
        $(this.element).css("position", "relative");
        $(this.element).css("display", "inline-block");
        $(this.cnv).css("position", "absolute");
    }
    initAnimation(animId, anim) {
        const { intervals, patterns, options, collisions } = anim; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
        if (intervals.some(([interval, args]) => "bind" === interval)) {
            // bind+の場合は initBind にまるなげ
            this.initBind(animId, anim);
            return;
        }
        if (intervals.length > 1) {
            // bind+でなければ分解して再実行
            intervals.forEach(([_interval, args]) => {
                const a = new ST.SurfaceAnimation();
                a.intervals = [[_interval, args]];
                a.patterns = patterns;
                a.options = options;
                a.collisions = collisions;
                this.initAnimation(animId, a);
            });
            return;
        }
        const [_interval, args] = intervals[0];
        var n = 0; // tsc黙らせるため
        if (args.length > 0) {
            n = Number(args[0]);
            if (!isFinite(n)) {
                // rarelyにfaileback
                n = 4;
            }
        }
        // アニメーション描画タイミングの登録
        const fn = (nextTick) => {
            if (this.destructed)
                return;
            if (this.stopFlags[animId])
                return;
            this.play(animId, nextTick);
        };
        // アニメーションを止めるための準備
        this.stopFlags[animId] = false;
        switch (_interval) {
            // nextTickを呼ぶともう一回random
            case "sometimes": return SurfaceUtil.random(fn, 2);
            case "rarely": return SurfaceUtil.random(fn, 4);
            case "random": return SurfaceUtil.random(fn, n);
            case "periodic": return SurfaceUtil.periodic(fn, n);
            case "always": return SurfaceUtil.always(fn);
            case "runonce": return this.play(animId);
            case "never": return;
            case "yen-e": return;
            case "talk":
                this.talkCounts[animId] = n;
                return;
        }
        console.warn("Surface#initAnimation > unkown interval:", _interval, anim);
    }
    initBind(animId, anim) {
        const { intervals, patterns, options, collisions } = anim;
        if (this.isBind(animId)) {
            // 現在有効な bind
            if (intervals.length > 0) {
                // bind+hogeは着せ替え付随アニメーション。
                // bind+sometimesを分解して実行
                intervals.forEach(([interval, args]) => {
                    if (interval !== "bind") {
                        const a = new ST.SurfaceAnimation;
                        a.intervals = [[interval, args]];
                        a.patterns = patterns;
                        a.options = options;
                        a.collisions = collisions;
                        this.initAnimation(animId, a);
                    }
                });
            }
            // レイヤに着せ替えを追加
            options.forEach(([option, args]) => {
                if (option === "background") {
                    this.backgrounds[animId] = patterns;
                }
                else {
                    this.layers[animId] = patterns;
                }
            });
        }
        else {
            //現在の合成レイヤから着せ替えレイヤを削除
            options.forEach(([option, args]) => {
                if (option === "background") {
                    delete this.backgrounds[animId];
                }
                else {
                    delete this.layers[animId];
                }
            });
            // bind+sometimsなどを殺す
            this.end(animId);
        }
    }
    updateBind() {
        // Shell.tsから呼ばれるためpublic
        // Shell#bind,Shell#unbindで発動
        this.surfaceNode.animations.forEach((anim, animId) => {
            if (anim.intervals.some(([interval, args]) => "bind" === interval)) {
                this.initBind(animId, anim);
            }
        });
        // 即時に反映
        this.render();
    }
    // アニメーションタイミングループの開始要請
    begin(animationId) {
        this.stopFlags[animationId] = false;
        const anim = this.surfaceNode.animations[animationId];
        this.initAnimation(animationId, anim);
        this.render();
    }
    // アニメーションタイミングループの開始
    end(animationId) {
        this.stopFlags[animationId] = true;
    }
    // すべての自発的アニメーション再生の停止
    endAll() {
        Object.keys(this.stopFlags).forEach((animationId) => {
            this.end(Number(animationId));
        });
    }
    // アニメーション再生
    play(animationId, callback) {
        if (this.destructed)
            return;
        const anims = this.surfaceNode.animations;
        const anim = this.surfaceNode.animations[animationId];
        if (anim == null) {
            console.warn("Surface#play", "animation", animationId, "is not defined");
            return void setTimeout(callback); // そんなアニメーションはない
        }
        const { patterns, options } = anim;
        this.animationsQueue[animationId] = patterns.map((pattern, i) => () => {
            const { surface, wait, type, x, y } = pattern;
            switch (type) {
                case "start":
                    var { animation_ids } = pattern;
                    this.play(animation_ids[0], nextTick);
                    return;
                case "stop":
                    var { animation_ids } = pattern;
                    this.stop(animation_ids[0]);
                    setTimeout(nextTick);
                    return;
                case "alternativestart":
                    var { animation_ids } = pattern;
                    this.play(SurfaceUtil.choice(animation_ids), nextTick);
                    return;
                case "alternativestop":
                    var { animation_ids } = pattern;
                    this.stop(SurfaceUtil.choice(animation_ids));
                    setTimeout(nextTick);
                    return;
            }
            const _wait = SurfaceUtil.randomRange(wait[0], wait[1]);
            setTimeout(() => {
                // 現在のコマをレイヤーに追加
                options.forEach(([option, args]) => {
                    if (option === "background") {
                        this.backgrounds[animationId] = [pattern];
                    }
                    else {
                        this.layers[animationId] = [pattern];
                    }
                });
                const canIPlay = this.exclusives.every((exclusive) => exclusive !== animationId); //自分のanimationIdはexclusivesリストに含まれていない
                if (canIPlay) {
                    this.render();
                }
                nextTick();
            }, _wait);
        });
        options.forEach(([option, args]) => {
            if (option === "exclusive") {
                if (args.length > 0) {
                    this.animationsQueue[animationId].unshift(() => {
                        this.exclusives = args.map((arg) => Number(arg));
                    });
                }
                else {
                    this.animationsQueue[animationId].unshift(() => {
                        this.exclusives = this.surfaceNode.animations.filter((anim, animId) => animId !== animationId).map((anim, animId) => animId);
                    });
                }
                this.animationsQueue[animationId].push(() => {
                    this.exclusives = [];
                });
            }
        });
        var nextTick = () => {
            if (this.destructed)
                return;
            const next = this.animationsQueue[animationId].shift();
            if (!(next instanceof Function)) {
                // stop pattern animation.
                this.animationsQueue[animationId] = [];
                this.exclusives = [];
                setTimeout(callback);
            }
            else {
                next();
            }
        };
        if (this.animationsQueue[animationId][0] instanceof Function) {
            nextTick();
        }
    }
    stop(animationId) {
        this.animationsQueue[animationId] = []; // アニメーションキューを破棄
    }
    talk() {
        const animations = this.surfaceNode.animations;
        this.talkCount++;
        const hits = animations.filter((anim, animId) => anim.intervals.some(([interval, args]) => "talk" === interval) && this.talkCount % this.talkCounts[animId] === 0);
        hits.forEach((anim, animId) => {
            // そのアニメーションは再生が終了しているか？
            if (this.animationsQueue[animId] == null || this.animationsQueue[animId].length === 0) {
                this.play(animId);
            }
        });
    }
    yenE() {
        const anims = this.surfaceNode.animations;
        anims.forEach((anim, animId) => {
            if (anim.intervals.some(([interval, args]) => interval === "yen-e")) {
                this.play(animId);
            }
        });
    }
    isBind(animId) {
        if (this.bindgroup[this.scopeId] == null)
            return false;
        if (this.bindgroup[this.scopeId][animId] === false)
            return false;
        return true;
    }
    composeAnimationPatterns(layers, interval) {
        let renderLayers = [];
        layers.forEach((patterns) => {
            patterns.forEach((pattern) => {
                const { surface, type, x, y, wait } = pattern;
                if (type === "insert") {
                    // insertの場合は対象のIDをとってくる
                    // animation_id = animationN,x,y
                    const { animation_ids } = pattern;
                    const animId = animation_ids.length > 0 ? animation_ids[0] : -1;
                    // 対象の着せ替えが有効かどうか判定
                    if (!this.isBind(animId))
                        return;
                    const anim = this.surfaceNode.animations[animId];
                    if (anim == null) {
                        console.warn("Surface#composeAnimationPatterns", "insert id", animation_ids, "is wrong target.", this.surfaceNode);
                        return;
                    }
                    renderLayers = renderLayers.concat(this.composeAnimationPatterns([anim.patterns], interval));
                    return;
                }
                if (surface < 0) {
                    // idが-1つまり非表示指定
                    if (type === "base") {
                        // アニメーションパーツによるbaseを削除
                        this.dynamicBase = null;
                    }
                    return;
                }
                const srf = this.surfaceTree[surface]; // 該当のサーフェス
                if (srf == null) {
                    console.warn("Surface#composeAnimationPatterns", "surface id " + surface + " is not defined.", pattern);
                    return; // 対象サーフェスがないのでスキップ
                }
                // 対象サーフェスを構築描画する
                const { base, elements, collisions, animations } = srf;
                const bind_backgrounds = [];
                const bind_fronts = [];
                this.bufferRender.reset();
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
                    animations.forEach((anim, is) => {
                        const { options, patterns } = anim;
                        if (this.isBind(is)) {
                            options.forEach(([option, args]) => {
                                if ("background" === option) {
                                    bind_backgrounds[is] = patterns;
                                }
                                else {
                                    bind_fronts[is] = patterns;
                                }
                            });
                        }
                    });
                }
                // 循環無視されずスタックオーバーフローします
                const _bind_backgrounds = this.composeAnimationPatterns(bind_backgrounds, interval);
                const _bind_fronts = this.composeAnimationPatterns(bind_fronts, interval);
                var _base_ = [];
                if (elements[0] != null) {
                    // element0, element1...
                    _base_ = elements;
                }
                else if (base != null) {
                    // base, element1, element2...
                    _base_ = [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements);
                }
                else {
                    console.error("Surface#composeAnimationPatterns: cannot decide base");
                    return;
                }
                // 対象サーフェスのbaseサーフェス(surface*.png)の上にelementを合成する
                this.bufferRender.composeElements(_bind_backgrounds.concat(_base_, _bind_fronts));
                if (type === "base") {
                    // 構築したこのレイヤーのサーフェスはベースサーフェス指定
                    // 12pattern0,300,30,base,0,0 みたいなの
                    // baseの場合はthis.dynamicBaseにまかせて何も返さない
                    this.dynamicBase = { type, x, y, canvas: this.bufferRender.getSurfaceCanvas() };
                    return;
                }
                else {
                    renderLayers.push({ type, x, y, canvas: this.bufferRender.getSurfaceCanvas() });
                }
            });
        });
        return renderLayers;
    }
    render() {
        if (this.destructed)
            return;
        const backgrounds = this.composeAnimationPatterns(this.backgrounds); //再生途中のアニメーション含むレイヤ
        const elements = (this.surfaceNode.elements);
        const base = this.surfaceNode.base;
        const fronts = this.composeAnimationPatterns(this.layers); //再生途中のアニメーション含むレイヤ
        let baseWidth = 0;
        let baseHeight = 0;
        this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
        // ベースサーフェス作る
        if (this.dynamicBase != null) {
            // pattern base があればそちらを使用
            this.bufferRender.composeElements([this.dynamicBase]);
            baseWidth = this.bufferRender.cnv.width;
            baseHeight = this.bufferRender.cnv.height;
        }
        else {
            // base+elementでベースサーフェス作る
            this.bufferRender.composeElements(elements[0] != null ?
                // element0, element1...
                elements :
                base != null ?
                    // base, element1, element2...
                    [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements)
                    : []);
            // elementまでがベースサーフェス扱い
            baseWidth = this.bufferRender.cnv.width;
            baseHeight = this.bufferRender.cnv.height;
        }
        const composedBase = this.bufferRender.getSurfaceCanvas();
        // アニメーションレイヤー
        this.bufferRender.composeElements(backgrounds);
        this.bufferRender.composeElements([{ type: "overlay", canvas: composedBase, x: 0, y: 0 }]); // 現在有効な ベースサーフェスのレイヤを合成
        this.bufferRender.composeElements(fronts);
        // 当たり判定を描画
        if (this.enableRegionDraw) {
            this.bufferRender.drawRegions((this.surfaceNode.collisions), "" + this.surfaceId);
            this.backgrounds.forEach((_, animId) => {
                this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), "" + this.surfaceId);
            });
            this.layers.forEach((_, animId) => {
                this.bufferRender.drawRegions((this.surfaceNode.animations[animId].collisions), "" + this.surfaceId);
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
    getSurfaceSize() {
        return {
            width: $(this.element).width(),
            height: $(this.element).height()
        };
    }
    initMouseEvent() {
        const $elm = $(this.element);
        let tid = null;
        let touchCount = 0;
        let touchStartTime = 0;
        const tuples = [];
        tuples.push(["contextmenu", (ev) => this.processMouseEvent(ev, "mouseclick")]);
        tuples.push(["click", (ev) => this.processMouseEvent(ev, "mouseclick")]);
        tuples.push(["dblclick", (ev) => this.processMouseEvent(ev, "mousedblclick")]);
        tuples.push(["mousedown", (ev) => this.processMouseEvent(ev, "mousedown")]);
        tuples.push(["mousemove", (ev) => this.processMouseEvent(ev, "mousemove")]);
        tuples.push(["mouseup", (ev) => this.processMouseEvent(ev, "mouseup")]);
        tuples.push(["touchmove", (ev) => this.processMouseEvent(ev, "mousemove")]);
        tuples.push(["touchend", (ev) => {
                this.processMouseEvent(ev, "mouseup");
                this.processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    this.processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
        tuples.push(["touchstart", (ev) => {
                touchCount++;
                touchStartTime = Date.now();
                this.processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(() => touchCount = 0, 500);
            }]);
        tuples.forEach(([ev, handler]) => $elm.on(ev, handler)); // イベント登録
        this.destructors.push(() => {
            tuples.forEach(([ev, handler]) => $elm.off(ev, handler)); // イベント解除
        });
    }
    processMouseEvent(ev, type) {
        $(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
        const { pageX, pageY, clientX, clientY } = SurfaceUtil.getEventPosition(ev);
        const { left, top } = $(ev.target).offset();
        // body直下 fixed だけにすべきかうーむ
        const { scrollX, scrollY } = SurfaceUtil.getScrollXY();
        if (this.position !== "fixed") {
            var baseX = pageX;
            var baseY = pageY;
            var _left = left;
            var _top = top;
        }
        else {
            var baseX = clientX;
            var baseY = clientY;
            var _left = left - scrollX;
            var _top = top - scrollY;
        }
        const basePosY = parseInt($(this.cnv).css("top"), 10); // overlayでのずれた分を
        const basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
        const offsetX = baseX - _left - basePosX; //canvas左上からのx座標
        const offsetY = baseY - _top - basePosY; //canvas左上からのy座標
        const hit1 = SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.collisions), offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
        const hits0 = this.backgrounds.map((_, animId) => {
            return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
        });
        const hits2 = this.layers.map((_, animId) => {
            return SurfaceUtil.getRegion(this.cnv, (this.surfaceNode.animations[animId].collisions), offsetX, offsetY);
        });
        const hits = hits0.concat([hit1], hits2).filter((hit) => hit !== "");
        const hit = hits[hits.length - 1] || hit1;
        const custom = {
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Surface;
