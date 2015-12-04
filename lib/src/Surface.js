// todo: anim collision
/// <reference path="../typings/tsd.d.ts"/>
var SurfaceRender_1 = require("./SurfaceRender");
var SurfaceUtil = require("./SurfaceUtil");
var eventemitter3_1 = require("eventemitter3");
var jquery_1 = require("jquery");
class Surface extends eventemitter3_1.default {
    constructor(div, scopeId, surfaceId, surfaceTree, bindgroup) {
        super();
        this.element = div;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.cnv = SurfaceUtil.createCanvas();
        this.ctx = this.cnv.getContext("2d");
        this.element.appendChild(this.cnv);
        jquery_1.default(this.element).css("position", "relative");
        jquery_1.default(this.element).css("display", "inline-block");
        jquery_1.default(this.cnv).css("position", "absolute");
        this.bindgroup = bindgroup;
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
        // GCの発生を抑えるためレンダラはこれ１つを使いまわす
        this.bufferRender = new SurfaceRender_1.default();
        this.initMouseEvent();
        this.surfaceNode.animations.forEach((anim) => { this.initAnimation(anim); });
        this.render();
    }
    destructor() {
        jquery_1.default(this.element).children().remove();
        this.destructors.forEach((fn) => fn());
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
        var { is: animId, interval, patterns, option } = anim; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
        var __intervals = interval.split("+"); // sometimes+talk
        if (__intervals.length > 1) {
            // 分解して再実行
            __intervals.forEach((interval) => {
                this.initAnimation({ interval: interval, is: animId, patterns: patterns, option: option });
            });
            return;
        }
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
            default:
                if (/^bind$/.test(interval)) {
                    this.initBind(anim);
                    return;
                }
        }
        console.warn("Surface#initAnimation > unkown interval:", interval, anim);
    }
    initBind(anim) {
        var { is: animId, interval, patterns, option } = anim;
        if (this.bindgroup[this.scopeId] == null)
            return;
        if (this.bindgroup[this.scopeId][animId] == null)
            return;
        if (this.bindgroup[this.scopeId][animId] === true) {
            // 現在有効な bind
            if (option === "background") {
                this.backgrounds[animId] = patterns[patterns.length - 1];
            }
            else {
                this.layers[animId] = patterns[patterns.length - 1];
            }
            // bind+sometimsなどを殺す
            this.end(animId);
            // bindは即座に反映
            this.render();
            return;
        }
        //現在の合成レイヤから着せ替えレイヤを削除
        if (option === "background") {
            delete this.backgrounds[animId];
        }
        else {
            delete this.layers[animId];
        }
        this.render();
        return;
    }
    updateBind() {
        // Shell.tsから呼ばれるためpublic
        // Shell#bind,Shell#unbindで発動
        this.surfaceNode.animations.forEach((anim) => { this.initBind(anim); });
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
        Object.keys(this.stopFlags).forEach((animationId) => {
            this.end(animationId);
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
        var hits = animations.filter((anim) => /talk/.test(anim.interval) && this.talkCount % this.talkCounts[anim.is] === 0);
        hits.forEach((anim) => {
            this.play(anim.is);
        });
    }
    yenE() {
        var anims = this.surfaceNode.animations;
        anims.forEach((anim) => {
            if (anim.interval === "yen-e") {
                this.play(anim.is);
            }
        });
    }
    composeAnimationPatterns(layers) {
        var renderLayers = [];
        var keys = Object.keys(layers);
        // forEachからfor文へ
        for (let j = 0; j < keys.length; j++) {
            var pattern = layers[keys[j]];
            var { surface, type, x, y } = pattern;
            if (surface < 0)
                continue; // idが-1つまり非表示指定
            var srf = this.surfaceTree[surface]; // 該当のサーフェス
            if (srf == null) {
                console.warn("Surface#composeAnimationPatterns: surface id " + surface + " is not defined.", pattern);
                console.warn(surface, Object.keys(this.surfaceTree));
                continue; // 対象サーフェスがないのでスキップ
            }
            // 対象サーフェスを構築描画する
            var { base, elements, collisions, animations } = srf;
            this.bufferRender.reset(); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
            this.bufferRender.composeElements([{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements)); // elementを合成する
            renderLayers.push({ type: type, x: x, y: y, canvas: this.bufferRender.getSurfaceCanvas() });
        }
        return renderLayers;
    }
    render() {
        if (this.destructed)
            return;
        var backgrounds = this.composeAnimationPatterns(this.backgrounds);
        var base = this.surfaceNode.base;
        var elements = this.surfaceNode.elements;
        var fronts = this.composeAnimationPatterns(this.layers);
        var renderLayers = [].concat(
        // よめきつね対策
        // ukadoc上ではbackgroundの上にbaseがくるとのことだｋが
        // SSPの挙動を見る限りbackgroundがあるときはbaseが無視されているので
        backgrounds.length > 0 ? backgrounds : [{ type: "overlay", canvas: base, x: 0, y: 0 }], elements);
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
        /*
        console.log(bufRender.log);
        SurfaceUtil.log(bufRender.cnv);
        document.body.scrollTop = 9999;
        this.endAll();
        debugger;
        */
        SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv); // バッファから実DOMTree上のcanvasへ描画
        // SSPでのjuda.narを見る限り合成後のサーフェスはベースサーフェスの大きさではなく合成されたサーフェスの大きさになるようだ
        // juda-systemの\s[1050]のアニメーションはrunonceを同時実行しており、この場合の座標の原点の計算方法が不明。
        // これは未定義動作の可能性が高い。
        jquery_1.default(this.element).width(baseWidth); //this.cnv.width - bufRender.basePosX);
        jquery_1.default(this.element).height(baseHeight); //this.cnv.height - bufRender.basePosY);
        jquery_1.default(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
        jquery_1.default(this.cnv).css("left", -this.bufferRender.basePosX);
    }
}
exports.Surface = Surface;
