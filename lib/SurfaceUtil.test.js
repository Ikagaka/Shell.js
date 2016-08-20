"use strict";
const SU = require("./SurfaceUtil");
const $ = require("jquery");
QUnit.module('SurfaceUtil');
QUnit.test('SurfaceUtil.parseDescript', (assert) => {
    const text = `
  charset,Shift_JIS
  craftman,Cherry Pot
  craftmanw,Cherry Pot
  craftmanurl,http://3rd.d-con.mydns.jp/cherrypot/
  type,shell
  name,the "MobileMaster"

  sakura.balloon.offsetx,21
  sakura.balloon.offsety,80
  kero.balloon.offsetx,10
  kero.balloon.offsety,20

  seriko.alignmenttodesktop,free
  seriko.paint_transparent_region_black,0
  seriko.use_self_alpha,1
  `;
    const dic = SU.parseDescript(text);
    assert.ok(dic["charset"] === "Shift_JIS");
    assert.ok(dic["sakura.balloon.offsetx"] === "21");
    assert.ok(dic["seriko.paint_transparent_region_black"] === "0");
});
QUnit.test("SurfaceUtil.convert, SurfaceUtil.fetchArrayBuffer", (assert) => {
    assert.expect(1);
    const done = assert.async();
    return SU.fetchArrayBuffer("./src/readme.txt").then((buffer) => {
        const txt = SU.convert(buffer);
        assert.ok(txt.match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/) !== null);
        done();
    });
});
QUnit.test("SurfaceUtil.find", (assert) => {
    const paths = [
        "surface0.png",
        "surface10.png",
        "elements/element0.png"
    ];
    let results = SU.find(paths, "./surface0.png");
    assert.ok(results[0] === paths[0]);
    results = SU.find(paths, "SURFACE10.PNG");
    assert.ok(results[0] === paths[1]);
    results = SU.find(paths, "elements\\element0.png");
    assert.ok(results[0] === paths[2]);
});
QUnit.test("SurfaceUtil.choice", (assert) => {
    let results = (() => { let arr = []; for (let i = 0; i < 1000; i++) {
        arr.push(SU.choice([1, 2, 3]));
    } return arr; })();
    let a = results.reduce(((count, val) => val === 1 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < a && a < 0.4);
    let b = results.reduce(((count, val) => val === 2 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < b && b < 0.4);
    let c = results.reduce(((count, val) => val === 3 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < c && c < 0.4);
});
QUnit.test("SurfaceUtil.copy", (assert) => {
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = 100;
    const ctx = cnv.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.rect(10, 10, 80, 80);
    ctx.stroke();
    const cnv2 = SU.copy(cnv);
    assert.ok(cnv !== cnv2);
    assert.ok(cnv.width === cnv2.width);
    assert.ok(cnv.height === cnv2.height);
    SU.setPictureFrame(cnv, "SurfaceUtil.copy cnv");
    SU.setPictureFrame(cnv2, "SurfaceUtil.copy cnv2");
});
QUnit.test("SurfaceUtil.fetchImageFromURL, SurfaceUtil.fetchImageFromArrayBuffer", (assert) => {
    const done = assert.async();
    assert.expect(2);
    return SU.fetchArrayBuffer("src/surface0.png")
        .then((buffer) => SU.fetchImageFromArrayBuffer(buffer))
        .then((img) => {
        assert.ok(img.width === 182);
        assert.ok(img.height === 445);
        SU.setPictureFrame(img, "SurfaceUtil.fetchImageFromURL");
        done();
    });
});
QUnit.test("SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)", (assert) => {
    const done = assert.async();
    assert.expect(3);
    const endtime = Date.now() + 1000 * 10;
    return Promise.all([
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(4 <= count && count <= 6, "random, 2");
                    return resolve();
                }
                count++;
                next();
            };
            SU.random(func, 2);
        }),
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(4 <= count && count <= 6, "periodic");
                    return resolve();
                }
                count++;
                next();
            };
            SU.periodic(func, 2);
        }),
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(9 <= count && count <= 11, "always");
                    return resolve();
                }
                count++;
                setTimeout(next, 1000);
            };
            SU.always(func);
        })
    ]).then(done);
});
QUnit.test("SurfaceUtil.isHit", (assert) => {
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = 100;
    const ctx = cnv.getContext("2d");
    ctx.fillStyle = "black";
    ctx.rect(10, 10, 80, 80);
    ctx.fill();
    assert.ok(SU.isHit(cnv, 5, 5) === false);
    assert.ok(SU.isHit(cnv, 50, 50) === true);
    SU.setPictureFrame(cnv, "SurfaceUtil.isHit cnv");
});
QUnit.test("SurfaceUtil.createCanvas", (assert) => {
    const cnv = SU.createCanvas();
    assert.ok(cnv instanceof HTMLCanvasElement);
    assert.ok(cnv.width === 1);
    assert.ok(cnv.height === 1);
    SU.setPictureFrame(cnv, "SurfaceUtil.createCanvas");
});
QUnit.test("SurfaceUtil.scope", (assert) => {
    assert.ok("sakura" === SU.scope(0));
    assert.ok("kero" === SU.scope(1));
    assert.ok("char2" === SU.scope(2));
});
QUnit.test("SurfaceUtil.unscope", (assert) => {
    assert.ok(0 === SU.unscope("sakura"));
    assert.ok(1 === SU.unscope("kero"));
    assert.ok(2 === SU.unscope("char2"));
});
QUnit.test("SurfaceUtil.getEventPosition", (assert) => {
    let handler = (ev) => {
        var { pageX, pageY, clientX, clientY, screenX, screenY } = SU.getEventPosition(ev);
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
QUnit.test("SurfaceUtil.randomRange", (assert) => {
    assert.expect(10);
    let results = (() => { let arr = []; for (let i = 0; i < 1000; i++) {
        arr.push(SU.randomRange(0, 9));
    } return arr; })();
    const histgram = (() => { let arr = []; for (let i = 0; i < 10; i++) {
        arr.push(results.filter((a) => a === i));
    } return arr; })();
    histgram.forEach((arr, i) => {
        const parsent = arr.length / 10;
        assert.ok(5 <= parsent && parsent <= 15, "" + i);
    });
});
QUnit.test("SurfaceUtil.getScrollXY", (assert) => {
    var { scrollX, scrollY } = SU.getScrollXY();
    assert.ok(scrollX === 0);
    assert.ok(scrollY === 0);
});
