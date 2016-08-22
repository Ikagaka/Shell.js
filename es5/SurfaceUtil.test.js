"use strict";

var SU = require("./SurfaceUtil");
var $ = require("jquery");
QUnit.module('SurfaceUtil');
QUnit.test('SurfaceUtil.parseDescript', function (assert) {
    var text = "\n  charset,Shift_JIS\n  craftman,Cherry Pot\n  craftmanw,Cherry Pot\n  craftmanurl,http://3rd.d-con.mydns.jp/cherrypot/\n  type,shell\n  name,the \"MobileMaster\"\n\n  sakura.balloon.offsetx,21\n  sakura.balloon.offsety,80\n  kero.balloon.offsetx,10\n  kero.balloon.offsety,20\n\n  seriko.alignmenttodesktop,free\n  seriko.paint_transparent_region_black,0\n  seriko.use_self_alpha,1\n  ";
    var dic = SU.parseDescript(text);
    assert.ok(dic["charset"] === "Shift_JIS");
    assert.ok(dic["sakura.balloon.offsetx"] === "21");
    assert.ok(dic["seriko.paint_transparent_region_black"] === "0");
});
QUnit.test("SurfaceUtil.convert, SurfaceUtil.fetchArrayBuffer", function (assert) {
    assert.expect(1);
    var done = assert.async();
    return SU.fetchArrayBuffer("./src/readme.txt").then(function (buffer) {
        var txt = SU.convert(buffer);
        assert.ok(txt.match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/) !== null);
        done();
    });
});
QUnit.test("SurfaceUtil.find", function (assert) {
    var paths = ["surface0.png", "surface10.png", "elements/element0.png"];
    var results = SU.find(paths, "./surface0.png");
    assert.ok(results[0] === paths[0]);
    results = SU.find(paths, "SURFACE10.PNG");
    assert.ok(results[0] === paths[1]);
    results = SU.find(paths, "elements\\element0.png");
    assert.ok(results[0] === paths[2]);
});
QUnit.test("SurfaceUtil.choice", function (assert) {
    var results = function () {
        var arr = [];for (var i = 0; i < 1000; i++) {
            arr.push(SU.choice([1, 2, 3]));
        }return arr;
    }();
    var a = results.reduce(function (count, val) {
        return val === 1 ? count + 1 : count;
    }, 0) / results.length;
    assert.ok(0.2 < a && a < 0.4);
    var b = results.reduce(function (count, val) {
        return val === 2 ? count + 1 : count;
    }, 0) / results.length;
    assert.ok(0.2 < b && b < 0.4);
    var c = results.reduce(function (count, val) {
        return val === 3 ? count + 1 : count;
    }, 0) / results.length;
    assert.ok(0.2 < c && c < 0.4);
});
QUnit.test("SurfaceUtil.copy", function (assert) {
    var cnv = document.createElement("canvas");
    cnv.width = cnv.height = 100;
    var ctx = cnv.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.rect(10, 10, 80, 80);
    ctx.stroke();
    var cnv2 = SU.copy(cnv);
    assert.ok(cnv !== cnv2);
    assert.ok(cnv.width === cnv2.width);
    assert.ok(cnv.height === cnv2.height);
    SU.setPictureFrame(cnv, "SurfaceUtil.copy cnv");
    SU.setPictureFrame(cnv2, "SurfaceUtil.copy cnv2");
});
QUnit.test("SurfaceUtil.fetchImageFromURL, SurfaceUtil.fetchImageFromArrayBuffer", function (assert) {
    var done = assert.async();
    assert.expect(2);
    return SU.fetchArrayBuffer("src/surface0.png").then(function (buffer) {
        return SU.fetchImageFromArrayBuffer(buffer);
    }).then(function (img) {
        assert.ok(img.width === 182);
        assert.ok(img.height === 445);
        SU.setPictureFrame(img, "SurfaceUtil.fetchImageFromURL");
        done();
    });
});
QUnit.test("SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)", function (assert) {
    var done = assert.async();
    assert.expect(3);
    var endtime = Date.now() + 1000 * 10;
    return Promise.all([new Promise(function (resolve, reject) {
        var count = 0;
        var func = function func(next) {
            if (endtime < Date.now()) {
                assert.ok(4 <= count && count <= 6, "random, 2");
                return resolve();
            }
            count++;
            next();
        };
        SU.random(func, 2);
    }), new Promise(function (resolve, reject) {
        var count = 0;
        var func = function func(next) {
            if (endtime < Date.now()) {
                assert.ok(4 <= count && count <= 6, "periodic");
                return resolve();
            }
            count++;
            next();
        };
        SU.periodic(func, 2);
    }), new Promise(function (resolve, reject) {
        var count = 0;
        var func = function func(next) {
            if (endtime < Date.now()) {
                assert.ok(9 <= count && count <= 11, "always");
                return resolve();
            }
            count++;
            setTimeout(next, 1000);
        };
        SU.always(func);
    })]).then(done);
});
QUnit.test("SurfaceUtil.isHit", function (assert) {
    var cnv = document.createElement("canvas");
    cnv.width = cnv.height = 100;
    var ctx = cnv.getContext("2d");
    ctx.fillStyle = "black";
    ctx.rect(10, 10, 80, 80);
    ctx.fill();
    assert.ok(SU.isHit(cnv, 5, 5) === false);
    assert.ok(SU.isHit(cnv, 50, 50) === true);
    SU.setPictureFrame(cnv, "SurfaceUtil.isHit cnv");
});
QUnit.test("SurfaceUtil.createCanvas", function (assert) {
    var cnv = SU.createCanvas();
    assert.ok(cnv instanceof HTMLCanvasElement);
    assert.ok(cnv.width === 1);
    assert.ok(cnv.height === 1);
    SU.setPictureFrame(cnv, "SurfaceUtil.createCanvas");
});
QUnit.test("SurfaceUtil.scope", function (assert) {
    assert.ok("sakura" === SU.scope(0));
    assert.ok("kero" === SU.scope(1));
    assert.ok("char2" === SU.scope(2));
});
QUnit.test("SurfaceUtil.unscope", function (assert) {
    assert.ok(0 === SU.unscope("sakura"));
    assert.ok(1 === SU.unscope("kero"));
    assert.ok(2 === SU.unscope("char2"));
});
QUnit.test("SurfaceUtil.getEventPosition", function (assert) {
    var handler = function handler(ev) {
        var _SU$getEventPosition = SU.getEventPosition(ev);

        var pageX = _SU$getEventPosition.pageX;
        var pageY = _SU$getEventPosition.pageY;
        var clientX = _SU$getEventPosition.clientX;
        var clientY = _SU$getEventPosition.clientY;
        var screenX = _SU$getEventPosition.screenX;
        var screenY = _SU$getEventPosition.screenY;

        assert.ok(100 === pageX);
        assert.ok(100 === pageY);
        assert.ok(100 === clientX);
        assert.ok(100 === clientY);
        assert.ok(100 === screenX);
        assert.ok(100 === screenY);
        $(document.body).off("click", handler);
    };
    $(document.body).click(handler);
    document.body.dispatchEvent(new MouseEvent("click", {
        screenX: 100,
        screenY: 100,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100
    }));
});
/*
QUnit.test("SurfaceUtil.log", (assert)=>
  assert.ok(false, "まだ書いてない"

QUnit.test("SurfaceUtil.getRegion", (assert)=>
  assert.ok(false, "まだ書いてない"
fastcopy

fastfind
chromakey_snipet
*/
QUnit.test("SurfaceUtil.randomRange", function (assert) {
    assert.expect(10);
    var results = function () {
        var arr = [];for (var i = 0; i < 1000; i++) {
            arr.push(SU.randomRange(0, 9));
        }return arr;
    }();
    var histgram = function () {
        var arr = [];
        var _loop = function _loop(i) {
            arr.push(results.filter(function (a) {
                return a === i;
            }));
        };

        for (var i = 0; i < 10; i++) {
            _loop(i);
        }return arr;
    }();
    histgram.forEach(function (arr, i) {
        var parsent = arr.length / 10;
        assert.ok(5 <= parsent && parsent <= 15, "" + i);
    });
});
QUnit.test("SurfaceUtil.getScrollXY", function (assert) {
    var _SU$getScrollXY = SU.getScrollXY();

    var scrollX = _SU$getScrollXY.scrollX;
    var scrollY = _SU$getScrollXY.scrollY;

    assert.ok(scrollX === 0);
    assert.ok(scrollY === 0);
});