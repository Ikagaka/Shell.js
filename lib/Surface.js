// todo: insert
// todo: anim collision
// todo: background+exclusive,(1,3,5)
/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SurfaceRender_1 = require("./SurfaceRender");
var SurfaceUtil = require("./SurfaceUtil");
var EventEmitter = require("eventemitter3");
var $ = require("jquery");
var Surface = (function (_super) {
    __extends(Surface, _super);
    function Surface(div, scopeId, surfaceId, surfaceTree, bindgroup) {
        var _this = this;
        _super.call(this);
        this.element = div;
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.cnv = SurfaceUtil.createCanvas();
        this.ctx = this.cnv.getContext("2d");
        this.element.appendChild(this.cnv);
        $(this.element).css("position", "relative");
        $(this.element).css("display", "inline-block");
        $(this.cnv).css("position", "absolute");
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
        this.dynamicBase = null;
        this.destructed = false;
        this.destructors = [];
        // GCの発生を抑えるためレンダラはこれ１つを使いまわす
        this.bufferRender = new SurfaceRender_1.default();
        //this.bufferRender.debug = true;
        this.initMouseEvent();
        this.surfaceNode.animations.forEach(function (anim) { _this.initAnimation(anim); });
        this.render();
    }
    Surface.prototype.destructor = function () {
        $(this.element).children().remove();
        this.destructors.forEach(function (fn) { return fn(); });
        this.element = null;
        this.surfaceNode = {
            base: { cnv: null, png: null, pna: null },
            elements: [],
            collisions: [],
            animations: []
        };
        this.surfaceTree = [];
        this.bindgroup = [];
        this.layers = [];
        this.animationsQueue = {};
        this.talkCounts = {};
        this.destructors = [];
        this.removeAllListeners(null);
        this.destructed = true;
    };
    Surface.prototype.initMouseEvent = function () {
        var _this = this;
        var $elm = $(this.element);
        var tid = 0;
        var touchCount = 0;
        var touchStartTime = 0;
        var tuples = [];
        var processMouseEvent = function (ev, type) {
            $(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
            var _a = SurfaceUtil.getEventPosition(ev), pageX = _a.pageX, pageY = _a.pageY, clientX = _a.clientX, clientY = _a.clientY;
            var _b = $(ev.target).offset(), left = _b.left, top = _b.top;
            // body直下 fixed だけにすべきかうーむ
            var _c = _this.position !== "fixed" ? [pageX, pageY] : [clientX, clientY], baseX = _c[0], baseY = _c[1];
            var _d = _this.position !== "fixed" ? [left, top] : [left - window.scrollX, top - window.scrollY], _left = _d[0], _top = _d[1];
            var basePosY = parseInt($(_this.cnv).css("top"), 10); // overlayでのずれた分を
            var basePosX = parseInt($(_this.cnv).css("left"), 10); // とってくる
            var offsetX = baseX - _left - basePosX; //canvas左上からのx座標
            var offsetY = baseY - _top - basePosY; //canvas左上からのy座標
            var hit = SurfaceUtil.getRegion(_this.cnv, _this.surfaceNode, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
            var custom = {
                "type": type,
                "offsetX": offsetX | 0,
                "offsetY": offsetY | 0,
                "wheel": 0,
                "scopeId": _this.scopeId,
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
            _this.emit("mouse", custom);
        }; // processMouseEventここまで
        tuples.push(["contextmenu", function (ev) { return processMouseEvent(ev, "mouseclick"); }]);
        tuples.push(["click", function (ev) { return processMouseEvent(ev, "mouseclick"); }]);
        tuples.push(["dblclick", function (ev) { return processMouseEvent(ev, "mousedblclick"); }]);
        tuples.push(["mousedown", function (ev) { return processMouseEvent(ev, "mousedown"); }]);
        tuples.push(["mousemove", function (ev) { return processMouseEvent(ev, "mousemove"); }]);
        tuples.push(["mouseup", function (ev) { return processMouseEvent(ev, "mouseup"); }]);
        tuples.push(["touchmove", function (ev) { return processMouseEvent(ev, "mousemove"); }]);
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
                tid = setTimeout(function () { return touchCount = 0; }, 500);
            }]);
        tuples.forEach(function (_a) {
            var ev = _a[0], handler = _a[1];
            return $elm.on(ev, handler);
        }); // イベント登録
        this.destructors.push(function () {
            tuples.forEach(function (_a) {
                var ev = _a[0], handler = _a[1];
                return $elm.off(ev, handler);
            }); // イベント解除
        });
    };
    Surface.prototype.initAnimation = function (anim) {
        var _this = this;
        var animId = anim.is, interval = anim.interval, patterns = anim.patterns, option = anim.option; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
        if (option != null && !/^background$|^exclusive$/.test(option)) {
            console.warn("Surfaces#initAnimation", "unsupportted option", option, animId, anim);
        }
        if (typeof interval !== "string") {
            console.warn("Surface#initAnimation", "animation interval is not defined. failback to never.", anim);
            interval = "never";
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
                _this.initAnimation({ interval: interval, is: animId, patterns: patterns, option: option });
            });
            return;
        }
        var _a = interval.split(","), _interval = _a[0], rest = _a.slice(1);
        if (rest.length > 0) {
            var n = Number(rest[0]);
            if (!isFinite(n)) {
                console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", interval, " argument is not finite number");
                n = 4;
            }
        } // rarelyにfaileback
        // アニメーション描画タイミングの登録
        var fn = function (nextTick) {
            if (_this.destructed)
                return;
            if (_this.stopFlags[animId])
                return;
            _this.play(animId, nextTick);
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
        console.warn("Surface#initAnimation > unkown interval:", interval, anim);
    };
    Surface.prototype.initBind = function (anim) {
        var _this = this;
        var animId = anim.is, interval = anim.interval, patterns = anim.patterns, option = anim.option;
        if (this.bindgroup[this.scopeId] == null)
            return;
        if (this.bindgroup[this.scopeId][animId] == null)
            return;
        if (this.bindgroup[this.scopeId][animId] === true) {
            // 現在有効な bind
            var _a = interval.split("+"), _ = _a[0], intervals = _a.slice(1); // bind+sometimes
            if (intervals.length > 0) {
                // bind+hogeは着せ替え付随アニメーション。
                // bind+sometimesを分解して実行
                intervals.forEach(function (interval) {
                    _this.initAnimation({ interval: interval, is: animId, patterns: patterns, option: option });
                });
                return;
            }
            // bind単体はレイヤーを重ねる着せ替え。
            /*となりの羽山さんsurface4
            animation52.interval,bind
            animation52.pattern0,add,2171,2,0,110
            animation52.pattern1,insert,0,0,185
            animation52.pattern2,insert,0,0,186
            animation52.pattern3,insert,0,0,187
            animation52.pattern4,insert,0,0,188
            animation52.pattern5,insert,0,0,189
            animation52.pattern6,insert,0,0,184
            animation52.pattern7,insert,0,0,183
            animation52.pattern14,insert,0,0,255
            animation52.pattern15,insert,0,0,256
            animation52.pattern16,insert,0,0,257
            animation52.pattern20,add,3111,2,40,125
            */
            var mayura_layer = {
                mayura: patterns,
                animation_id: null,
                animation_ids: null,
                type: null,
                surface: null,
                wait: null,
                x: null,
                y: null
            };
            if (option === "background") {
                this.backgrounds[animId] = mayura_layer;
            }
            else {
                this.layers[animId] = mayura_layer;
            }
            return;
        }
        else {
            //現在の合成レイヤから着せ替えレイヤを削除
            if (option === "background") {
                delete this.backgrounds[animId];
            }
            else {
                delete this.layers[animId];
            }
            // bind+sometimsなどを殺す
            this.end(animId);
            return;
        }
    };
    Surface.prototype.updateBind = function () {
        var _this = this;
        // Shell.tsから呼ばれるためpublic
        // Shell#bind,Shell#unbindで発動
        this.surfaceNode.animations.forEach(function (anim) { _this.initBind(anim); });
        // 即時に反映
        this.render();
    };
    // アニメーションタイミングループの開始要請
    Surface.prototype.begin = function (animationId) {
        this.stopFlags[animationId] = false;
        var anim = this.surfaceNode.animations[animationId];
        this.initAnimation(anim);
        this.render();
    };
    // アニメーションタイミングループの開始
    Surface.prototype.end = function (animationId) {
        this.stopFlags[animationId] = true;
    };
    Surface.prototype.endAll = function () {
        var _this = this;
        Object.keys(this.stopFlags).forEach(function (animationId) {
            _this.end(animationId);
        });
    };
    // アニメーション再生
    Surface.prototype.play = function (animationId, callback) {
        var _this = this;
        if (this.destructed)
            return;
        var anims = this.surfaceNode.animations;
        var anim = this.surfaceNode.animations[animationId];
        if (anim == null)
            return void setTimeout(callback); // そんなアニメーションはない
        var animId = anim.is, interval = anim.interval, patterns = anim.patterns, option = anim.option;
        if (option != null && !/^background$|^exclusive$/.test(option)) {
            console.warn("Surface#play", "unsupportted option", option, animationId, anim);
        }
        this.animationsQueue[animationId] = patterns.map(function (pattern, i) { return function () {
            var surface = pattern.surface, wait = pattern.wait, type = pattern.type, x = pattern.x, y = pattern.y, animation_ids = pattern.animation_ids, animation_id = pattern.animation_id;
            switch (type) {
                case "start":
                    _this.play(Number((/\d+/.exec(animation_id) || ["", "-1"])[1]), nextTick);
                    return;
                case "stop":
                    _this.stop(Number((/\d+/.exec(animation_id) || ["", "-1"])[1]));
                    setTimeout(nextTick);
                    return;
                case "alternativestart":
                    _this.play(SurfaceUtil.choice(animation_ids), nextTick);
                    return;
                case "alternativestop":
                    _this.stop(SurfaceUtil.choice(animation_ids));
                    setTimeout(nextTick);
                    return;
            }
            var _a = (/(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0", ""]), __ = _a[0], a = _a[1], b = _a[2];
            var _wait = isFinite(Number(b))
                ? SurfaceUtil.randomRange(Number(a), Number(b))
                : Number(a);
            setTimeout(function () {
                // 現在のコマをレイヤーに追加
                if (option === "background") {
                    _this.backgrounds[animationId] = pattern;
                }
                else {
                    _this.layers[animationId] = pattern;
                }
                if (_this.exclusive >= 0) {
                    // -1 以上なら排他再生中
                    if (_this.exclusive === animationId) {
                        // 自分が排他実行中
                        _this.render();
                    }
                }
                else {
                    // 通常
                    _this.render();
                }
                nextTick();
            }, _wait);
        }; });
        if (option === "exclusive") {
            this.animationsQueue[animationId].unshift(function () {
                _this.exclusive = animationId;
            });
            this.animationsQueue[animationId].push(function () {
                _this.exclusive = -1;
            });
        }
        var nextTick = function () {
            if (_this.destructed)
                return;
            var next = _this.animationsQueue[animationId].shift();
            if (!(next instanceof Function)) {
                // stop pattern animation.
                _this.animationsQueue[animationId] = [];
                _this.exclusive = -1;
                setTimeout(callback);
            }
            else {
                next();
            }
        };
        if (this.animationsQueue[animationId][0] instanceof Function) {
            nextTick();
        }
    };
    Surface.prototype.stop = function (animationId) {
        this.animationsQueue[animationId] = []; // アニメーションキューを破棄
    };
    Surface.prototype.talk = function () {
        var _this = this;
        var animations = this.surfaceNode.animations;
        this.talkCount++;
        var hits = animations.filter(function (anim) {
            return /talk/.test(anim.interval) && _this.talkCount % _this.talkCounts[anim.is] === 0;
        });
        hits.forEach(function (anim) {
            // そのアニメーションは再生が終了しているか？
            if (_this.animationsQueue[anim.is] == null || _this.animationsQueue[anim.is].length === 0) {
                _this.play(anim.is);
            }
        });
    };
    Surface.prototype.yenE = function () {
        var _this = this;
        var anims = this.surfaceNode.animations;
        anims.forEach(function (anim) {
            if (anim.interval === "yen-e") {
                _this.play(anim.is);
            }
        });
    };
    Surface.prototype.composeAnimationPatterns = function (layers) {
        var renderLayers = [];
        var keys = Object.keys(layers);
        // forEachからfor文へ
        for (var j = 0; j < keys.length; j++) {
            var pattern = layers[keys[j]];
            var surface = pattern.surface, type = pattern.type, x = pattern.x, y = pattern.y, mayura = pattern.mayura, animation_id = pattern.animation_id;
            if (Array.isArray(mayura)) {
                // 着せ替え定義の場合はこのkeys[j]番レイヤーに着せ替えパターンを展開する
                var __renderLayers = this.composeAnimationPatterns(mayura);
                renderLayers = renderLayers.concat(__renderLayers);
                continue;
            }
            if (type === "insert") {
                // insertの場合は対象のIDをとってくる
                // animation_id = animationN,x,y
                var _a = animation_id.split(","), a = _a[0], b = _a[1], c = _a[2];
                var animId = Number(c);
                // 対象の着せ替えが有効かどうか判定
                if (this.bindgroup[this.scopeId] == null)
                    continue;
                if (this.bindgroup[this.scopeId][animId] == null)
                    continue;
                if (this.bindgroup[this.scopeId][animId] === false)
                    continue;
                var anim = this.surfaceNode.animations[animId];
                if (anim == null) {
                    console.warn("Surface#composeAnimationPatterns: insert id", animation_id, "is wrong target.", this.surfaceNode);
                    continue;
                }
                var __renderLayers = this.composeAnimationPatterns(anim.patterns);
                renderLayers = renderLayers.concat(__renderLayers);
                continue;
            }
            if (surface < 0)
                continue; // idが-1つまり非表示指定
            var srf = this.surfaceTree[surface]; // 該当のサーフェス
            if (srf == null) {
                console.warn("Surface#composeAnimationPatterns: surface id " + surface + " is not defined.", pattern);
                continue; // 対象サーフェスがないのでスキップ
            }
            // 対象サーフェスを構築描画する
            var base = srf.base, elements = srf.elements, collisions = srf.collisions, animations = srf.animations;
            this.bufferRender.reset(); // 対象サーフェスのbaseサーフェス(surface*.png)の上に
            // elementを合成する
            var _renderLayers = [].concat(
            // element0 or base
            elements[0] != null ?
                // element0, element1...
                elements :
                // base, element1, element2...
                [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements));
            this.bufferRender.composeElements(_renderLayers); // 現在有効な ベースサーフェスのレイヤを合成
            // 構築したこのレイヤーのサーフェスはベースサーフェス指定
            if (type === "base") {
                // 新しい ベースサーフェス
                // 12pattern0,300,30,base,0,0 みたいなの
                if (pattern.surface < 0) {
                    this.dynamicBase = null;
                }
                else {
                    this.dynamicBase = { type: type, x: x, y: y, canvas: this.bufferRender.getSurfaceCanvas() };
                }
            }
            else {
                renderLayers.push({ type: type, x: x, y: y, canvas: this.bufferRender.getSurfaceCanvas() });
            }
        }
        return renderLayers;
    };
    Surface.prototype.render = function () {
        if (this.destructed)
            return;
        var backgrounds = this.composeAnimationPatterns(this.backgrounds);
        var base = this.surfaceNode.base;
        var elements = this.surfaceNode.elements;
        var fronts = this.composeAnimationPatterns(this.layers);
        this.bufferRender.reset(); // ベースサーフェスをバッファに描画。surface*.pngとかsurface *{base,*}とか
        if (this.dynamicBase != null) {
            // pattern base があればそちらを使用
            this.bufferRender.composeElements([this.dynamicBase]);
        }
        else {
            var renderLayers = [].concat(backgrounds, 
            // element0 or base
            elements[0] != null ?
                // element0, element1...
                elements :
                // base, element1, element2...
                [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements));
            this.bufferRender.composeElements(renderLayers); // 現在有効な ベースサーフェスのレイヤを合成
        }
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
        //document.body.scrollTop = 99999;
        //this.endAll();
        SurfaceUtil.init(this.cnv, this.ctx, this.bufferRender.cnv); // バッファから実DOMTree上のcanvasへ描画
        $(this.element).width(baseWidth); //this.cnv.width - bufRender.basePosX);
        $(this.element).height(baseHeight); //this.cnv.height - bufRender.basePosY);
        $(this.cnv).css("top", -this.bufferRender.basePosY); // overlayでキャンバスサイズ拡大したときのためのネガティブマージン
        $(this.cnv).css("left", -this.bufferRender.basePosX);
    };
    return Surface;
})(EventEmitter);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Surface;
