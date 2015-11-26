window.SurfaceUtil = Shell.SurfaceUtil;
QUnit.module('SurfaceUtil');
QUnit.test('SurfaceUtil.extend', function (assert) {
    var original;
    original = {
        a: 0,
        b: {
            c: 0,
            d: 0
        }
    };
    SurfaceUtil.extend(original, {
        a: 1,
        b: { c: 1 }
    });
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(original, 'arguments/0/left/object').a, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(original.a === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 20
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(original, 'arguments/0/left/object/object').b, 'arguments/0/left/object').c, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(original.b.c === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 21
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(original, 'arguments/0/left/object/object').b, 'arguments/0/left/object').d, 'arguments/0/left') === 0, 'arguments/0'), {
        content: 'assert.ok(original.b.d === 0)',
        filepath: 'test/testSurfaceUtil.js',
        line: 22
    }));
});
QUnit.test('SurfaceUtil.parseDescript', function (assert) {
    var dic, text;
    text = 'charset,Shift_JIS\ncraftman,Cherry Pot\ncraftmanw,Cherry Pot\ncraftmanurl,http://3rd.d-con.mydns.jp/cherrypot/\ntype,shell\nname,the "MobileMaster"\n\nsakura.balloon.offsetx,21\nsakura.balloon.offsety,80\nkero.balloon.offsetx,10\nkero.balloon.offsety,20\n\nseriko.alignmenttodesktop,free\nseriko.paint_transparent_region_black,0\nseriko.use_self_alpha,1';
    dic = SurfaceUtil.parseDescript(text);
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['charset'], 'arguments/0/left') === 'Shift_JIS', 'arguments/0'), {
        content: 'assert.ok(dic["charset"] === "Shift_JIS")',
        filepath: 'test/testSurfaceUtil.js',
        line: 29
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['sakura.balloon.offsetx'], 'arguments/0/left') === '21', 'arguments/0'), {
        content: 'assert.ok(dic["sakura.balloon.offsetx"] === "21")',
        filepath: 'test/testSurfaceUtil.js',
        line: 30
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['seriko.paint_transparent_region_black'], 'arguments/0/left') === '0', 'arguments/0'), {
        content: 'assert.ok(dic["seriko.paint_transparent_region_black"] === "0")',
        filepath: 'test/testSurfaceUtil.js',
        line: 31
    }));
});
QUnit.test('SurfaceUtil.convert, SurfaceUtil.fetchArrayBuffer', function (assert) {
    var done;
    assert.expect(1);
    done = assert.async();
    return SurfaceUtil.fetchArrayBuffer('./readme.txt').then(function (buffer) {
        var txt;
        txt = SurfaceUtil.convert(buffer);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(txt, 'arguments/0/left/callee/object').match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/), 'arguments/0/left') !== null, 'arguments/0'), {
            content: 'assert.ok(txt.match(/フリーシェル \u300C窗子\u300D\uFF08MADOKO\uFF09を改変の上使用しています\u3002/) !== null)',
            filepath: 'test/testSurfaceUtil.js',
            line: 41
        }));
        return done();
    });
});
QUnit.test('SurfaceUtil.find', function (assert) {
    var paths, results;
    paths = [
        'surface0.png',
        'surface10.png',
        'elements/element0.png'
    ];
    results = SurfaceUtil.find(paths, './surface0.png');
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[0], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[0])',
        filepath: 'test/testSurfaceUtil.js',
        line: 50
    }));
    results = SurfaceUtil.find(paths, 'SURFACE10.PNG');
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[1], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[1])',
        filepath: 'test/testSurfaceUtil.js',
        line: 52
    }));
    results = SurfaceUtil.find(paths, 'elements\\element0.png');
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[2], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[2])',
        filepath: 'test/testSurfaceUtil.js',
        line: 54
    }));
});
QUnit.test('SurfaceUtil.choice', function (assert) {
    var i, ref, ref1, ref2, results;
    results = function () {
        var j, results1;
        results1 = [];
        for (i = j = 1; j <= 1000; i = ++j) {
            results1.push(SurfaceUtil.choice([
                1,
                2,
                3
            ]));
        }
        return results1;
    }();
    assert.ok(assert._expr(assert._capt(assert._capt(0.2 < assert._capt(ref = assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/right/right/left/callee/object').reduce(function (count, val) {
        if (val === 1) {
            return count + 1;
        } else {
            return count;
        }
    }, 0), 'arguments/0/left/right/right/left') / assert._capt(assert._capt(results, 'arguments/0/left/right/right/right/object').length, 'arguments/0/left/right/right/right'), 'arguments/0/left/right/right'), 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(ref, 'arguments/0/right/left') < 0.4, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0.2 < (ref = results.reduce(function (count, val) {if (val === 1) {return count + 1;} else {return count;}}, 0) / results.length) && ref < 0.4)',
        filepath: 'test/testSurfaceUtil.js',
        line: 67
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(0.2 < assert._capt(ref1 = assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/right/right/left/callee/object').reduce(function (count, val) {
        if (val === 2) {
            return count + 1;
        } else {
            return count;
        }
    }, 0), 'arguments/0/left/right/right/left') / assert._capt(assert._capt(results, 'arguments/0/left/right/right/right/object').length, 'arguments/0/left/right/right/right'), 'arguments/0/left/right/right'), 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(ref1, 'arguments/0/right/left') < 0.4, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0.2 < (ref1 = results.reduce(function (count, val) {if (val === 2) {return count + 1;} else {return count;}}, 0) / results.length) && ref1 < 0.4)',
        filepath: 'test/testSurfaceUtil.js',
        line: 74
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(0.2 < assert._capt(ref2 = assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/right/right/left/callee/object').reduce(function (count, val) {
        if (val === 3) {
            return count + 1;
        } else {
            return count;
        }
    }, 0), 'arguments/0/left/right/right/left') / assert._capt(assert._capt(results, 'arguments/0/left/right/right/right/object').length, 'arguments/0/left/right/right/right'), 'arguments/0/left/right/right'), 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(ref2, 'arguments/0/right/left') < 0.4, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0.2 < (ref2 = results.reduce(function (count, val) {if (val === 3) {return count + 1;} else {return count;}}, 0) / results.length) && ref2 < 0.4)',
        filepath: 'test/testSurfaceUtil.js',
        line: 81
    }));
});
QUnit.test('SurfaceUtil.copy', function (assert) {
    var cnv, cnv2, ctx;
    cnv = document.createElement('canvas');
    cnv.width = cnv.height = 100;
    ctx = cnv.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.rect(10, 10, 80, 80);
    ctx.stroke();
    cnv2 = SurfaceUtil.copy(cnv);
    assert.ok(assert._expr(assert._capt(assert._capt(cnv, 'arguments/0/left') !== assert._capt(cnv2, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv !== cnv2)',
        filepath: 'test/testSurfaceUtil.js',
        line: 99
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.width === cnv2.width)',
        filepath: 'test/testSurfaceUtil.js',
        line: 100
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.height === cnv2.height)',
        filepath: 'test/testSurfaceUtil.js',
        line: 101
    }));
    document.body.appendChild(cnv2);
    return document.body.appendChild(cnv);
});
QUnit.test('SurfaceUtil.fetchImageFromURL, SurfaceUtil.fetchImageFromArrayBuffer', function (assert) {
    var done;
    done = assert.async();
    assert.expect(2);
    return SurfaceUtil.fetchArrayBuffer('./surface0.png').then(function (buffer) {
        return SurfaceUtil.fetchImageFromArrayBuffer(buffer);
    }).then(function (img) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(img.width === 182)',
            filepath: 'test/testSurfaceUtil.js',
            line: 113
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(img.height === 445)',
            filepath: 'test/testSurfaceUtil.js',
            line: 114
        }));
        return done();
    })['catch'](function (err) {
        return done();
    });
});
QUnit.test('SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)', function (assert) {
    assert.ok(false, 'test is not written yet');
    return 'done = assert.async()\nassert.expect(3)\nendtime = Date.now() + 1000*10\nPromise.all([\n  new Promise (resolve, reject)->\n    count = 0\n    func = (next)->\n      if endtime < Date.now()\n        assert.ok 1 < count < 5, "random"\n        return resolve()\n      count++\n      next()\n    SurfaceUtil.random(func, 1)\n  new Promise (resolve, reject)->\n    count = 0\n    func = (next)->\n      if endtime < Date.now()\n        assert.ok count is 5, "periodic"\n        return resolve()\n      count++\n      next()\n    SurfaceUtil.periodic(func, 2)\n  new Promise (resolve, reject)->\n    count = 0\n    func = (next)->\n      if endtime < Date.now()\n        assert.ok count is 10, "always"\n        return resolve()\n      count++\n      setTimeout(next, 900)\n    SurfaceUtil.always(func)\n]).then(done)';
});
QUnit.test('SurfaceUtil.isHit', function (assert) {
    var cnv, ctx;
    cnv = document.createElement('canvas');
    cnv.width = cnv.height = 100;
    ctx = cnv.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.rect(10, 10, 80, 80);
    ctx.fill();
    document.body.appendChild(cnv);
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(SurfaceUtil, 'arguments/0/left/callee/object').isHit(assert._capt(cnv, 'arguments/0/left/arguments/0'), 5, 5), 'arguments/0/left') === false, 'arguments/0'), {
        content: 'assert.ok(SurfaceUtil.isHit(cnv, 5, 5) === false)',
        filepath: 'test/testSurfaceUtil.js',
        line: 135
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(SurfaceUtil, 'arguments/0/left/callee/object').isHit(assert._capt(cnv, 'arguments/0/left/arguments/0'), 50, 50), 'arguments/0/left') === true, 'arguments/0'), {
        content: 'assert.ok(SurfaceUtil.isHit(cnv, 50, 50) === true)',
        filepath: 'test/testSurfaceUtil.js',
        line: 136
    }));
});
QUnit.test('SurfaceUtil.offset', function (assert) {
    var height, left, ref, top, width;
    ref = SurfaceUtil.offset(document.body), left = ref.left, top = ref.top, width = ref.width, height = ref.height;
    assert.ok(assert._expr(assert._capt(0 < assert._capt(left, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < left)',
        filepath: 'test/testSurfaceUtil.js',
        line: 142
    }));
    assert.ok(assert._expr(assert._capt(0 < assert._capt(top, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < top)',
        filepath: 'test/testSurfaceUtil.js',
        line: 143
    }));
    assert.ok(assert._expr(assert._capt(0 < assert._capt(width, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < width)',
        filepath: 'test/testSurfaceUtil.js',
        line: 144
    }));
    return assert.ok(assert._expr(assert._capt(0 < assert._capt(height, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < height)',
        filepath: 'test/testSurfaceUtil.js',
        line: 145
    }));
});
QUnit.test('SurfaceUtil.createCanvas', function (assert) {
    var cnv;
    cnv = SurfaceUtil.createCanvas();
    assert.ok(assert._expr(assert._capt(assert._capt(cnv, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv instanceof HTMLCanvasElement)',
        filepath: 'test/testSurfaceUtil.js',
        line: 151
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.width === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 152
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.height === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 153
    }));
});
QUnit.test('SurfaceUtil.scope', function (assert) {
    assert.ok(assert._expr(assert._capt('sakura' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(0), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("sakura" === SurfaceUtil.scope(0))',
        filepath: 'test/testSurfaceUtil.js',
        line: 157
    }));
    assert.ok(assert._expr(assert._capt('kero' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(1), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("kero" === SurfaceUtil.scope(1))',
        filepath: 'test/testSurfaceUtil.js',
        line: 158
    }));
    return assert.ok(assert._expr(assert._capt('char2' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(2), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("char2" === SurfaceUtil.scope(2))',
        filepath: 'test/testSurfaceUtil.js',
        line: 159
    }));
});
QUnit.test('SurfaceUtil.unscope', function (assert) {
    assert.ok(assert._expr(assert._capt(0 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('sakura'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 === SurfaceUtil.unscope("sakura"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 163
    }));
    assert.ok(assert._expr(assert._capt(1 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('kero'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(1 === SurfaceUtil.unscope("kero"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 164
    }));
    return assert.ok(assert._expr(assert._capt(2 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('char2'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(2 === SurfaceUtil.unscope("char2"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 165
    }));
});
QUnit.test('SurfaceUtil.getEventPosition', function (assert) {
    $(document.body).click(function (ev) {
        var clientX, clientY, pageX, pageY, ref, screenX, screenY;
        ref = SurfaceUtil.getEventPosition(ev), pageX = ref.pageX, pageY = ref.pageY, clientX = ref.clientX, clientY = ref.clientY, screenX = ref.screenX, screenY = ref.screenY;
        assert.ok(assert._expr(assert._capt(100 === assert._capt(pageX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === pageX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 172
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(pageY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === pageY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 173
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 174
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 175
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(screenX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 176
        }));
        return assert.ok(assert._expr(assert._capt(100 === assert._capt(screenY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 177
        }));
    });
    return document.body.dispatchEvent(new MouseEvent('click', {
        screenX: 100,
        screenY: 100,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100
    }));
});
QUnit.test('recursiveElementFromPoint, eventPropagationSim', function (assert) {
    return assert.ok(false, 'test is not written yet');
});