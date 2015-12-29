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
        this.bindgroup = bindgroup;
        this.position = "fixed";
        this.surfaceTree = surfaceTree;
        this.surfaceNode = surfaceTree[surfaceId] || {
            base: { cnv: null, png: null, pna: null },
            elements: [],
            collisions: [],
            animations: []
        };
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
    Surface.prototype.initDOMStructure = function () {
        this.element.appendChild(this.cnv);
        $(this.element).css("position", "relative");
        $(this.element).css("display", "inline-block");
        $(this.cnv).css("position", "absolute");
    };
    Surface.prototype.initMouseEvent = function () {
        var _this = this;
        var $elm = $(this.element);
        var tid = null;
        var touchCount = 0;
        var touchStartTime = 0;
        var tuples = [];
        tuples.push(["contextmenu", function (ev) { return _this.processMouseEvent(ev, "mouseclick"); }]);
        tuples.push(["click", function (ev) { return _this.processMouseEvent(ev, "mouseclick"); }]);
        tuples.push(["dblclick", function (ev) { return _this.processMouseEvent(ev, "mousedblclick"); }]);
        tuples.push(["mousedown", function (ev) { return _this.processMouseEvent(ev, "mousedown"); }]);
        tuples.push(["mousemove", function (ev) { return _this.processMouseEvent(ev, "mousemove"); }]);
        tuples.push(["mouseup", function (ev) { return _this.processMouseEvent(ev, "mouseup"); }]);
        tuples.push(["touchmove", function (ev) { return _this.processMouseEvent(ev, "mousemove"); }]);
        tuples.push(["touchend", function (ev) {
                _this.processMouseEvent(ev, "mouseup");
                _this.processMouseEvent(ev, "mouseclick");
                if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
                    _this.processMouseEvent(ev, "mousedblclick");
                } // ダブルタップ->ダブルクリック変換
            }]);
        tuples.push(["touchstart", function (ev) {
                touchCount++;
                touchStartTime = Date.now();
                _this.processMouseEvent(ev, "mousedown");
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
    Surface.prototype.processMouseEvent = function (ev, type) {
        var _this = this;
        $(ev.target).css({ "cursor": "default" }); //これDOMアクセスして重いのでは←mousemoveタイミングで他のライブラリでもっとDOMアクセスしてるし気になるなら計測しろ
        var _a = SurfaceUtil.getEventPosition(ev), pageX = _a.pageX, pageY = _a.pageY, clientX = _a.clientX, clientY = _a.clientY;
        var _b = $(ev.target).offset(), left = _b.left, top = _b.top;
        // body直下 fixed だけにすべきかうーむ
        var _c = SurfaceUtil.getScrollXY(), scrollX = _c.scrollX, scrollY = _c.scrollY;
        var _d = this.position !== "fixed" ? [pageX, pageY] : [clientX, clientY], baseX = _d[0], baseY = _d[1];
        var _e = this.position !== "fixed" ? [left, top] : [left - scrollX, top - scrollY], _left = _e[0], _top = _e[1];
        var basePosY = parseInt($(this.cnv).css("top"), 10); // overlayでのずれた分を
        var basePosX = parseInt($(this.cnv).css("left"), 10); // とってくる
        var offsetX = baseX - _left - basePosX; //canvas左上からのx座標
        var offsetY = baseY - _top - basePosY; //canvas左上からのy座標
        var hit1 = SurfaceUtil.getRegion(this.cnv, this.surfaceNode.collisions, offsetX, offsetY); //透明領域ではなかったら{name:当たり判定なら名前, isHit:true}
        var hits0 = this.backgrounds.map(function (_, animId) {
            return SurfaceUtil.getRegion(_this.cnv, _this.surfaceNode.animations[animId].regions, offsetX, offsetY);
        });
        var hits2 = this.layers.map(function (_, animId) {
            return SurfaceUtil.getRegion(_this.cnv, _this.surfaceNode.animations[animId].regions, offsetX, offsetY);
        });
        var hits = hits0.concat([hit1], hits2).filter(function (hit) { return hit !== ""; });
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
    };
    Surface.prototype.initAnimation = function (anim) {
        var _this = this;
        var animId = anim.is, interval = anim.interval, intervals = anim.intervals, patterns = anim.patterns, options = anim.options, regions = anim.regions; //isってなんだよって話は @narazaka さんに聞いて。SurfacesTxt2Yamlのせい。
        if (intervals.some(function (_a) {
            var interval = _a[0], args = _a[1];
            return "bind" === interval;
        })) {
            // bind+の場合は initBind にまるなげ
            this.initBind(anim);
            return;
        }
        if (intervals.length > 1) {
            // bind+でなければ分解して再実行
            intervals.forEach(function (_a) {
                var _interval = _a[0], args = _a[1];
                _this.initAnimation({ interval: interval, intervals: [[_interval, args]], is: animId, patterns: patterns, options: options, regions: regions });
            });
            return;
        }
        var _a = intervals[0], _interval = _a[0], args = _a[1];
        if (args.length > 0) {
            var n = Number(args[0]);
            if (!isFinite(n)) {
                console.warn("initAnimation > TypeError: surface", this.surfaceId, "animation", anim.is, "interval", _interval, " argument is not finite number");
                // rarelyにfaileback
                n = 4;
            }
        }
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
        console.warn("Surface#initAnimation > unkown interval:", _interval, anim);
    };
    Surface.prototype.initBind = function (anim) {
        var _this = this;
        var animId = anim.is, interval = anim.interval, intervals = anim.intervals, patterns = anim.patterns, options = anim.options, regions = anim.regions;
        if (this.isBind(animId)) {
            // 現在有効な bind
            if (intervals.length > 0) {
                // bind+hogeは着せ替え付随アニメーション。
                // bind+sometimesを分解して実行
                intervals.forEach(function (_a) {
                    var interval = _a[0], args = _a[1];
                    if (interval !== "bind") {
                        _this.initAnimation({ interval: interval, intervals: [[interval, args]], is: animId, patterns: patterns, options: options, regions: regions });
                    }
                });
            }
            // レイヤに着せ替えを追加
            options.forEach(function (_a) {
                var option = _a[0], args = _a[1];
                if (option === "background") {
                    _this.backgrounds[animId] = patterns;
                }
                else {
                    _this.layers[animId] = patterns;
                }
            });
        }
        else {
            //現在の合成レイヤから着せ替えレイヤを削除
            options.forEach(function (_a) {
                var option = _a[0], args = _a[1];
                if (option === "background") {
                    delete _this.backgrounds[animId];
                }
                else {
                    delete _this.layers[animId];
                }
            });
            // bind+sometimsなどを殺す
            this.end(animId);
        }
    };
    Surface.prototype.updateBind = function () {
        var _this = this;
        // Shell.tsから呼ばれるためpublic
        // Shell#bind,Shell#unbindで発動
        this.surfaceNode.animations.forEach(function (anim) {
            if (anim.intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return "bind" === interval;
            })) {
                _this.initBind(anim);
            }
        });
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
    // すべての自発的アニメーション再生の停止
    Surface.prototype.endAll = function () {
        var _this = this;
        Object.keys(this.stopFlags).forEach(function (animationId) {
            _this.end(Number(animationId));
        });
    };
    // アニメーション再生
    Surface.prototype.play = function (animationId, callback) {
        var _this = this;
        if (this.destructed)
            return;
        var anims = this.surfaceNode.animations;
        var anim = this.surfaceNode.animations[animationId];
        if (anim == null) {
            console.warn("Surface#play", "animation", animationId, "is not defined");
            return void setTimeout(callback); // そんなアニメーションはない
        }
        var animId = anim.is, patterns = anim.patterns, options = anim.options;
        this.animationsQueue[animationId] = patterns.map(function (pattern, i) { return function () {
            var surface = pattern.surface, wait = pattern.wait, type = pattern.type, x = pattern.x, y = pattern.y;
            switch (type) {
                case "start":
                case "stop": var animation_id = pattern.animation_id;
                case "start":
                    _this.play(Number((/(\d+)$/.exec(animation_id) || ["", "-1"])[1]), nextTick);
                    return;
                case "stop":
                    _this.stop(Number((/(\d+)$/.exec(animation_id) || ["", "-1"])[1]));
                    setTimeout(nextTick);
                    return;
                case "alternativestart":
                case "alternativestop": var animation_ids = pattern.animation_ids;
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
                options.forEach(function (_a) {
                    var option = _a[0], args = _a[1];
                    if (option === "background") {
                        _this.backgrounds[animationId] = [pattern];
                    }
                    else {
                        _this.layers[animationId] = [pattern];
                    }
                });
                var canIPlay = _this.exclusives.every(function (exclusive) { return exclusive !== animationId; }); //自分のanimationIdはexclusivesリストに含まれていない
                if (canIPlay) {
                    _this.render();
                }
                nextTick();
            }, _wait);
        }; });
        options.forEach(function (_a) {
            var option = _a[0], args = _a[1];
            if (option === "exclusive") {
                if (args.length > 0) {
                    _this.animationsQueue[animationId].unshift(function () {
                        _this.exclusives = args.map(function (arg) { return Number(arg); });
                    });
                }
                else {
                    _this.animationsQueue[animationId].unshift(function () {
                        _this.exclusives = _this.surfaceNode.animations.filter(function (anim) { return anim.is !== animationId; }).map(function (anim) { return anim.is; });
                    });
                }
                _this.animationsQueue[animationId].push(function () {
                    _this.exclusives = [];
                });
            }
        });
        var nextTick = function () {
            if (_this.destructed)
                return;
            var next = _this.animationsQueue[animationId].shift();
            if (!(next instanceof Function)) {
                // stop pattern animation.
                _this.animationsQueue[animationId] = [];
                _this.exclusives = [];
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
            return anim.intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return "talk" === interval;
            }) && _this.talkCount % _this.talkCounts[anim.is] === 0;
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
            if (anim.intervals.some(function (_a) {
                var interval = _a[0], args = _a[1];
                return interval === "yen-e";
            })) {
                _this.play(anim.is);
            }
        });
    };
    Surface.prototype.isBind = function (animId) {
        if (this.bindgroup[this.scopeId] == null)
            return false;
        if (this.bindgroup[this.scopeId][animId] === false)
            return false;
        return true;
    };
    Surface.prototype.composeAnimationPatterns = function (layers, interval) {
        var _this = this;
        var renderLayers = [];
        layers.forEach(function (patterns) {
            patterns.forEach(function (pattern) {
                var surface = pattern.surface, type = pattern.type, x = pattern.x, y = pattern.y, wait = pattern.wait;
                if (type === "insert") {
                    // insertの場合は対象のIDをとってくる
                    // animation_id = animationN,x,y
                    var animation_id = pattern.animation_id;
                    var animId = Number((/\d+$/.exec(animation_id) || ["", "-1"]));
                    // 対象の着せ替えが有効かどうか判定
                    if (!_this.isBind(animId))
                        return;
                    var anim = _this.surfaceNode.animations[animId];
                    if (anim == null) {
                        console.warn("Surface#composeAnimationPatterns", "insert id", animation_id, "is wrong target.", _this.surfaceNode);
                        return;
                    }
                    renderLayers = renderLayers.concat(_this.composeAnimationPatterns([anim.patterns], interval));
                    return;
                }
                if (surface < 0) {
                    // idが-1つまり非表示指定
                    if (type === "base") {
                        // アニメーションパーツによるbaseを削除
                        _this.dynamicBase = null;
                    }
                    return;
                }
                var srf = _this.surfaceTree[surface]; // 該当のサーフェス
                if (srf == null) {
                    console.warn("Surface#composeAnimationPatterns", "surface id " + surface + " is not defined.", pattern);
                    return; // 対象サーフェスがないのでスキップ
                }
                // 対象サーフェスを構築描画する
                var base = srf.base, elements = srf.elements, collisions = srf.collisions, animations = srf.animations;
                var bind_backgrounds = [];
                var bind_fronts = [];
                _this.bufferRender.reset();
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
                    animations.forEach(function (anim) {
                        var is = anim.is, options = anim.options, patterns = anim.patterns;
                        if (_this.isBind(is)) {
                            options.forEach(function (_a) {
                                var option = _a[0], args = _a[1];
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
                var _bind_backgrounds = _this.composeAnimationPatterns(bind_backgrounds, interval);
                var _bind_fronts = _this.composeAnimationPatterns(bind_fronts, interval);
                // 対象サーフェスのbaseサーフェス(surface*.png)の上にelementを合成する
                _this.bufferRender.composeElements([].concat(_bind_backgrounds, elements[0] != null ?
                    // element0, element1...
                    elements :
                    // base, element1, element2...
                    [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements), _bind_fronts));
                if (type === "base") {
                    // 構築したこのレイヤーのサーフェスはベースサーフェス指定
                    // 12pattern0,300,30,base,0,0 みたいなの
                    // baseの場合はthis.dynamicBaseにまかせて何も返さない
                    _this.dynamicBase = { type: type, x: x, y: y, canvas: _this.bufferRender.getSurfaceCanvas() };
                    return;
                }
                else {
                    renderLayers.push({ type: type, x: x, y: y, canvas: _this.bufferRender.getSurfaceCanvas() });
                }
            });
        });
        return renderLayers;
    };
    Surface.prototype.render = function () {
        var _this = this;
        if (this.destructed)
            return;
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
        }
        else {
            // base+elementでベースサーフェス作る
            this.bufferRender.composeElements(elements[0] != null ?
                // element0, element1...
                elements :
                // base, element1, element2...
                [{ type: "overlay", canvas: base, x: 0, y: 0 }].concat(elements));
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
                _this.bufferRender.drawRegions(_this.surfaceNode.animations[animId].regions, "" + _this.surfaceId);
            });
            this.layers.forEach(function (_, animId) {
                _this.bufferRender.drawRegions(_this.surfaceNode.animations[animId].regions, "" + _this.surfaceId);
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
    };
    Surface.prototype.getSurfaceSize = function () {
        return {
            width: $(this.element).width(),
            height: $(this.element).height()
        };
    };
    return Surface;
})(EventEmitter);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Surface;
