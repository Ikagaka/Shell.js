/// <reference path="../typings/tsd.d.ts"/>
var SurfaceRender_1 = require("./SurfaceRender");
var SurfaceUtil = require("./SurfaceUtil");
var eventemitter3_1 = require("eventemitter3");
var jquery_1 = require("jquery");
class Surface extends eventemitter3_1.default {
    constructor(div, scopeId, surfaceId, surfaceTree) {
        super();
        this.element = div;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.cnv = SurfaceUtil.createCanvas();
        this.ctx = this.cnv.getContext("2d");
        this.element.appendChild(this.cnv);
        jquery_1.default(this.element).css("position", "relative");
        jquery_1.default(this.cnv).css("position", "absolute");
        this.position = "fixed";
        this.surfaceTree = surfaceTree;
        this.surfaceNode = this.surfaceTree[surfaceId];
        this.bufferCanvas = SurfaceUtil.createCanvas();
        this.talkCount = 0;
        this.talkCounts = {};
        this.animationsQueue = {};
        this.backgrounds = [];
        this.layers = [];
        this.stopFlags = {};
        this.destructed = false;
        this.destructors = [];
        this.initMouseEvent();
        this.surfaceNode.animations.forEach((anim) => { this.initAnimation(anim); });
        this.render();
    }
    destructor() {
        jquery_1.default(this.element).children().remove();
        this.destructors.forEach((fn) => fn());
        this.element = null;
        this.surfaceNode = null;
        this.element = null;
        this.layers = [];
        this.animationsQueue = {};
        this.talkCounts = {};
        this.destructors = [];
        this.removeAllListeners(null);
        this.destructed = true;
    }
    initMouseEvent() {
        var $elm = jquery_1.default(this.element);
        var tid = 0;
        var touchCount = 0;
        var touchStartTime = 0;
        var tuples = [];
        var processMouseEvent = (ev, type) => {
            jquery_1.default(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
            var { pageX, pageY, clientX, clientY } = SurfaceUtil.getEventPosition(ev);
            var { left, top } = jquery_1.default(ev.target).offset();
            // body直下 fixed だけにすべきかうーむ
            var [baseX, baseY] = this.position !== "fixed" ? [pageX, pageY] : [clientX, clientY];
            var [_left, _top] = this.position !== "fixed" ? [left, top] : [left - window.scrollX, top - window.scrollY];
            var basePosY = parseInt(jquery_1.default(this.cnv).css("top"), 10); // overlayでのずれた分を
            var basePosX = parseInt(jquery_1.default(this.cnv).css("left"), 10); // とってくる
            var offsetX = baseX - _left - basePosX; //canvas左上からのx座標
            var offsetY = baseY - _top - basePosY; //canvas左上からのy座標
            var hit = SurfaceUtil.getRegion(this.cnv, this.surfaceNode, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            var custom = {
                "type": type,
                "offsetX": offsetX | 0,
                "offsetY": offsetY | 0,
                "wheel": 0,
                "scopeId": this.scopeId,
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
                jquery_1.default(ev.target).css({ "cursor": "pointer" }); //当たり判定でマウスポインタを指に
            }
            this.emit("mouse", custom);
        }; // processMouseEventここまで
        tuples.push(["contextmenu", (ev) => processMouseEvent(ev, "mouseclick")]);
        tuples.push(["click", (ev) => processMouseEvent(ev, "mouseclick")]);
        tuples.push(["dblclick", (ev) => processMouseEvent(ev, "mousedblclick")]);
        tuples.push(["mousedown", (ev) => processMouseEvent(ev, "mousedown")]);
        tuples.push(["mousemove", (ev) => processMouseEvent(ev, "mousemove")]);
        tuples.push(["mouseup", (ev) => processMouseEvent(ev, "mouseup")]);
        tuples.push(["touchmove", (ev) => processMouseEvent(ev, "mousemove")]);
        tuples.push(["touchend", (ev) => {
                processMouseEvent(ev, "mouseup");
                processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
        tuples.push(["touchstart", (ev) => {
                touchCount++;
                touchStartTime = Date.now();
                processMouseEvent(ev, "mousedown");
                clearTimeout(tid);
                tid = setTimeout(() => touchCount = 0, 500);
            }]);
        tuples.forEach(([ev, handler]) => $elm.on(ev, handler)); // イベント登録
        this.destructors.push(() => {
            tuples.forEach(([ev, handler]) => $elm.off(ev, handler)); // イベント解除
        });
    }
    initAnimation(anim) {
        var { is: animId, interval, patterns } = anim; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
        var [_interval, ...rest] = interval.split(",");
        if (rest.length > 1) {
            var n = Number(rest[0]);
            if (!isFinite(n)) {
                console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                n = 4;
            }
        } // rarelyにfaileback
        // アニメーション描画タイミングの登録
        var fn = (nextTick) => {
            if (!this.destructed && !this.stopFlags[animId]) {
                this.play(animId, nextTick);
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
            case "never": break;
            case "yen-e": break;
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
    initBind(anim) {
        // bind+somtimesみたいなやつを分解
        var { is, interval, patterns, option } = anim;
        var [_bind, ...intervals] = interval.split("+");
        if (intervals.length > 0)
            return;
        intervals.forEach((interval) => {
            //sometimesみたいのはinitAnimationに丸投げ
            this.initAnimation({ interval: interval, is: is, patterns: patterns, option: option });
        });
        var { option } = anim;
        if (option === "background") {
            this.backgrounds[is] = patterns[patterns.length - 1];
        }
        else {
            this.layers[is] = patterns[patterns.length - 1];
        }
        this.render();
    }
    updateBind(bindgroup) {
        // Shell.tsから呼ばれるためpublic
        // Shell#bind,Shell#unbindで発動
        // shell.bindgroup[scopeId][bindgroupId] が変更された時に呼ばれる
        this.surfaceNode.animations.forEach((anim) => {
            //このサーフェスに定義されたアニメーションの中でintervalがbindなものｗ探す
            var { is, interval, patterns, option } = anim;
            if (bindgroup[this.scopeId] == null)
                return;
            if (bindgroup[this.scopeId][is] == null)
                return;
            if (!/^bind/.test(interval))
                return;
            if (bindgroup[this.scopeId][is] === true) {
                //現在の設定が着せ替え有効ならばinitBindにまるなげ
                this.initBind(anim);
            }
            else {
                //現在の合成レイヤから着せ替えレイヤを削除
                delete this.layers[is];
                if (option === "background") {
                    delete this.backgrounds[is];
                }
                else {
                    delete this.layers[is];
                }
                this.render();
            }
        });
    }
    // アニメーションタイミングループの開始
    begin(animationId) {
        this.stopFlags[animationId] = false;
        var anim = this.surfaceNode.animations[animationId];
        this.initAnimation(anim);
    }
    // アニメーションタイミングループの開始
    end(animationId) {
        this.stopFlags[animationId] = true;
    }
    endAll() {
        Object.keys(this.stopFlags).forEach((key) => {
            this.stopFlags[key] = false;
        });
    }
    // アニメーション再生
    play(animationId, callback) {
        if (this.destructed)
            return;
        var anims = this.surfaceNode.animations;
        var anim = this.surfaceNode.animations[animationId];
        if (anim == null)
            return void setTimeout(callback); // そんなアニメーションはない
        this.animationsQueue[animationId] = anim.patterns.map((pattern, i) => () => {
            var { surface, wait, type, x, y, animation_ids } = pattern;
            switch (type) {
                case "start":
                    this.play(animation_ids[0], nextTick);
                    return;
                case "stop":
                    this.stop(animation_ids[0]);
                    setTimeout(nextTick);
                    return;
                case "alternativestart":
                    this.play(SurfaceUtil.choice(animation_ids), nextTick);
                    return;
                case "alternativestop":
                    this.stop(SurfaceUtil.choice(animation_ids));
                    setTimeout(nextTick);
                    return;
            }
            var [__, a, b] = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]);
            var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
            setTimeout(() => {
                if (anim.option === "background") {
                    this.backgrounds[animationId] = pattern;
                }
                else {
                    this.layers[animationId] = pattern;
                }
                this.render();
                nextTick();
            }, _wait);
        });
        var nextTick = () => {
            if (this.destructed)
                return;
            var next = this.animationsQueue[animationId].shift();
            if (!(next instanceof Function)) {
                // stop pattern animation.
                this.animationsQueue[animationId] = [];
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
        var animations = this.surfaceNode.animations;
        this.talkCount++;
        var hits = animations.filter((anim) => /^talk/.test(anim.interval) && this.talkCount % this.talkCounts[anim.is] === 0);
        hits.forEach((anim) => {
            this.play(anim.is);
        });
    }
    yenE() {
        var anims = this.surfaceNode.animations;
        anims.forEach((anim) => {
            // この条件式よくわからない
            if (anim.interval === "yen-e" && this.talkCount % this.talkCounts[anim.is] === 0) {
                this.play(anim.is);
            }
        });
    }
    composeAnimationPatterns(layers) {
        var renderLayers = [];
        layers.forEach((pattern, i) => {
            var { surface, type, x, y } = pattern;
            if (surface < 0)
                return; // idが-1つまり非表示指定
            var srf = this.surfaceTree[surface]; // 該当のサーフェス
            if (srf == null) {
                console.warn("Surface#render: surface id " + surface + " is not defined.", pattern);
                console.warn(surface, Object.keys(this.surfaceTree));
                return; // 対象サーフェスがないのでスキップ
            }
            // 対象サーフェスを構築描画する
            var { base, elements, collisions, animations } = srf;
            var rndr = new SurfaceRender_1.default(); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
            rndr.base(base);
            rndr.composeElements(elements); // elementを合成する
            renderLayers.push({ type: type, x: x, y: y, canvas: rndr.getSurfaceCanvas() });
        });
        return renderLayers;
    }
    render() {
        if (this.destructed)
            return;
        var backgrounds = this.composeAnimationPatterns(this.backgrounds);
        var base = this.surfaceNode.base;
        var elements = this.surfaceNode.elements;
        var fronts = this.composeAnimationPatterns(this.layers);
        var renderLayers = [].concat(backgrounds, [{ type: "overlay", canvas: base, x: 0, y: 0 }], elements, fronts);
        var bufRender = new SurfaceRender_1.default(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
        bufRender.composeElements(renderLayers); // 現在有効なアニメーションのレイヤを合成
        if (this.enableRegionDraw) {
            bufRender.ctx.fillText("" + this.surfaceId, 5, 10); // surfaceIdを描画
            bufRender.drawRegions(this.surfaceNode.collisions);
        }
        SurfaceUtil.init(this.cnv, this.ctx, bufRender.cnv); // バッファから実DOMTree上のcanvasへ描画
        jquery_1.default(this.element).width(bufRender.baseWidth); //this.cnv.width - bufRender.basePosX);
        jquery_1.default(this.element).height(bufRender.baseHeight); //this.cnv.height - bufRender.basePosY);
        jquery_1.default(this.cnv).css("top", -bufRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
        jquery_1.default(this.cnv).css("left", -bufRender.basePosX);
    }
}
exports.Surface = Surface;
