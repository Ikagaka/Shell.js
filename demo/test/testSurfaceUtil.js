var setPictureFrame;
window.SurfaceUtil = Shell.SurfaceUtil;
setPictureFrame = function (element, description) {
    var fieldset, legend;
    fieldset = document.createElement('fieldset');
    legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    fieldset.style.backgroundColor = '#D2E0E6';
    document.body.appendChild(fieldset);
};
QUnit.module('SurfaceUtil');
console.info('Worker:', Worker);
QUnit.test('SurfaceUtil.parseDescript', function (assert) {
    var dic, text;
    text = 'charset,Shift_JIS\ncraftman,Cherry Pot\ncraftmanw,Cherry Pot\ncraftmanurl,http://3rd.d-con.mydns.jp/cherrypot/\ntype,shell\nname,the "MobileMaster"\n\nsakura.balloon.offsetx,21\nsakura.balloon.offsety,80\nkero.balloon.offsetx,10\nkero.balloon.offsety,20\n\nseriko.alignmenttodesktop,free\nseriko.paint_transparent_region_black,0\nseriko.use_self_alpha,1';
    dic = SurfaceUtil.parseDescript(text);
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['charset'], 'arguments/0/left') === 'Shift_JIS', 'arguments/0'), {
        content: 'assert.ok(dic["charset"] === "Shift_JIS")',
        filepath: 'test/testSurfaceUtil.js',
        line: 94
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['sakura.balloon.offsetx'], 'arguments/0/left') === '21', 'arguments/0'), {
        content: 'assert.ok(dic["sakura.balloon.offsetx"] === "21")',
        filepath: 'test/testSurfaceUtil.js',
        line: 95
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['seriko.paint_transparent_region_black'], 'arguments/0/left') === '0', 'arguments/0'), {
        content: 'assert.ok(dic["seriko.paint_transparent_region_black"] === "0")',
        filepath: 'test/testSurfaceUtil.js',
        line: 96
    }));
});
QUnit.test('SurfaceUtil.convert, SurfaceUtil.fetchArrayBuffer', function (assert) {
    var done;
    assert.expect(1);
    done = assert.async();
    return SurfaceUtil.fetchArrayBuffer('./src/readme.txt').then(function (buffer) {
        var txt;
        txt = SurfaceUtil.convert(buffer);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(txt, 'arguments/0/left/callee/object').match(/フリーシェル 「窗子」（MADOKO）を改変の上使用しています。/), 'arguments/0/left') !== null, 'arguments/0'), {
            content: 'assert.ok(txt.match(/フリーシェル \u300C窗子\u300D\uFF08MADOKO\uFF09を改変の上使用しています\u3002/) !== null)',
            filepath: 'test/testSurfaceUtil.js',
            line: 106
        }));
        return done();
    })['catch'](function (err) {
        console.info(err, err.stack);
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
        line: 118
    }));
    results = SurfaceUtil.find(paths, 'SURFACE10.PNG');
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[1], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[1])',
        filepath: 'test/testSurfaceUtil.js',
        line: 120
    }));
    results = SurfaceUtil.find(paths, 'elements\\element0.png');
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[2], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[2])',
        filepath: 'test/testSurfaceUtil.js',
        line: 122
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
        line: 135
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
        line: 142
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
        line: 149
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
        line: 167
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.width === cnv2.width)',
        filepath: 'test/testSurfaceUtil.js',
        line: 168
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.height === cnv2.height)',
        filepath: 'test/testSurfaceUtil.js',
        line: 169
    }));
    setPictureFrame(cnv, 'SurfaceUtil.copy cnv');
    return setPictureFrame(cnv2, 'SurfaceUtil.copy cnv2');
});
QUnit.test('SurfaceUtil.fetchImageFromURL, SurfaceUtil.fetchImageFromArrayBuffer', function (assert) {
    var done;
    done = assert.async();
    assert.expect(2);
    return SurfaceUtil.fetchArrayBuffer('src/surface0.png').then(function (buffer) {
        return SurfaceUtil.fetchImageFromArrayBuffer(buffer);
    }).then(function (img) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(img.width === 182)',
            filepath: 'test/testSurfaceUtil.js',
            line: 181
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(img.height === 445)',
            filepath: 'test/testSurfaceUtil.js',
            line: 182
        }));
        setPictureFrame(img, 'SurfaceUtil.fetchImageFromURL');
        return done();
    })['catch'](function (err) {
        console.info(err, err.stack);
        return done();
    });
});
QUnit.test('SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)', function (assert) {
    var done, endtime;
    done = assert.async();
    assert.expect(3);
    endtime = Date.now() + 1000 * 10;
    return Promise.all([
        new Promise(function (resolve, reject) {
            var count, func;
            count = 0;
            func = function (next) {
                if (endtime < Date.now()) {
                    assert.ok(assert._expr(assert._capt(assert._capt(4 <= assert._capt(count, 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(count, 'arguments/0/right/left') <= 6, 'arguments/0/right'), 'arguments/0'), {
                        content: 'assert.ok(4 <= count && count <= 6, "random, 2")',
                        filepath: 'test/testSurfaceUtil.js',
                        line: 202
                    }), 'random, 2');
                    return resolve();
                }
                count++;
                return next();
            };
            return SurfaceUtil.random(func, 2);
        }),
        new Promise(function (resolve, reject) {
            var count, func;
            count = 0;
            func = function (next) {
                if (endtime < Date.now()) {
                    assert.ok(assert._expr(assert._capt(assert._capt(4 <= assert._capt(count, 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(count, 'arguments/0/right/left') <= 6, 'arguments/0/right'), 'arguments/0'), {
                        content: 'assert.ok(4 <= count && count <= 6, "periodic")',
                        filepath: 'test/testSurfaceUtil.js',
                        line: 214
                    }), 'periodic');
                    return resolve();
                }
                count++;
                return next();
            };
            return SurfaceUtil.periodic(func, 2);
        }),
        new Promise(function (resolve, reject) {
            var count, func;
            count = 0;
            func = function (next) {
                if (endtime < Date.now()) {
                    assert.ok(assert._expr(assert._capt(assert._capt(9 <= assert._capt(count, 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(count, 'arguments/0/right/left') <= 11, 'arguments/0/right'), 'arguments/0'), {
                        content: 'assert.ok(9 <= count && count <= 11, "always")',
                        filepath: 'test/testSurfaceUtil.js',
                        line: 226
                    }), 'always');
                    return resolve();
                }
                count++;
                return setTimeout(next, 1000);
            };
            return SurfaceUtil.always(func);
        })
    ]).then(done);
});
QUnit.test('SurfaceUtil.isHit', function (assert) {
    var cnv, ctx;
    cnv = document.createElement('canvas');
    cnv.width = cnv.height = 100;
    ctx = cnv.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.rect(10, 10, 80, 80);
    ctx.fill();
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(SurfaceUtil, 'arguments/0/left/callee/object').isHit(assert._capt(cnv, 'arguments/0/left/arguments/0'), 5, 5), 'arguments/0/left') === false, 'arguments/0'), {
        content: 'assert.ok(SurfaceUtil.isHit(cnv, 5, 5) === false)',
        filepath: 'test/testSurfaceUtil.js',
        line: 245
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(SurfaceUtil, 'arguments/0/left/callee/object').isHit(assert._capt(cnv, 'arguments/0/left/arguments/0'), 50, 50), 'arguments/0/left') === true, 'arguments/0'), {
        content: 'assert.ok(SurfaceUtil.isHit(cnv, 50, 50) === true)',
        filepath: 'test/testSurfaceUtil.js',
        line: 246
    }));
    return setPictureFrame(cnv, 'SurfaceUtil.isHit cnv');
});
QUnit.test('SurfaceUtil.createCanvas', function (assert) {
    var cnv;
    cnv = SurfaceUtil.createCanvas();
    assert.ok(assert._expr(assert._capt(assert._capt(cnv, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv instanceof HTMLCanvasElement)',
        filepath: 'test/testSurfaceUtil.js',
        line: 253
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.width === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 254
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.height === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 255
    }));
    return setPictureFrame(cnv, 'SurfaceUtil.createCanvas');
});
QUnit.test('SurfaceUtil.scope', function (assert) {
    assert.ok(assert._expr(assert._capt('sakura' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(0), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("sakura" === SurfaceUtil.scope(0))',
        filepath: 'test/testSurfaceUtil.js',
        line: 260
    }));
    assert.ok(assert._expr(assert._capt('kero' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(1), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("kero" === SurfaceUtil.scope(1))',
        filepath: 'test/testSurfaceUtil.js',
        line: 261
    }));
    return assert.ok(assert._expr(assert._capt('char2' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(2), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("char2" === SurfaceUtil.scope(2))',
        filepath: 'test/testSurfaceUtil.js',
        line: 262
    }));
});
QUnit.test('SurfaceUtil.unscope', function (assert) {
    assert.ok(assert._expr(assert._capt(0 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('sakura'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 === SurfaceUtil.unscope("sakura"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 266
    }));
    assert.ok(assert._expr(assert._capt(1 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('kero'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(1 === SurfaceUtil.unscope("kero"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 267
    }));
    return assert.ok(assert._expr(assert._capt(2 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('char2'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(2 === SurfaceUtil.unscope("char2"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 268
    }));
});
QUnit.test('SurfaceUtil.getEventPosition', function (assert) {
    var handler;
    $(document.body).click(handler = function (ev) {
        var clientX, clientY, pageX, pageY, ref, screenX, screenY;
        ref = SurfaceUtil.getEventPosition(ev), pageX = ref.pageX, pageY = ref.pageY, clientX = ref.clientX, clientY = ref.clientY, screenX = ref.screenX, screenY = ref.screenY;
        assert.ok(assert._expr(assert._capt(100 === assert._capt(pageX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === pageX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 276
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(pageY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === pageY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 277
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 278
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 279
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(screenX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 280
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(screenY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 281
        }));
        return $(document.body).off('click', handler);
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
QUnit.test('SurfaceUtil.init', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('src/surface0.png').then(function (img) {
        var cnv, ctx;
        cnv = SurfaceUtil.createCanvas();
        ctx = cnv.getContext('2d');
        SurfaceUtil.init(cnv, ctx, img);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(cnv.width === 182)',
            filepath: 'test/testSurfaceUtil.js',
            line: 302
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(cnv.height === 445)',
            filepath: 'test/testSurfaceUtil.js',
            line: 303
        }));
        return done();
    });
});
QUnit.test('SurfaceUtil.randomRange', function (assert) {
    var histgram, j, results, results1;
    assert.expect(10);
    results = function () {
        results1 = [];
        for (j = 1; j <= 1000; j++) {
            results1.push(j);
        }
        return results1;
    }.apply(this).map(function () {
        return SurfaceUtil.randomRange(0, 9);
    });
    histgram = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
    ].map(function (i) {
        return results.filter(function (a) {
            return a === i;
        });
    });
    return histgram.forEach(function (arr, i) {
        var parsent;
        parsent = arr.length / 10;
        return assert.ok(assert._expr(assert._capt(assert._capt(5 <= assert._capt(parsent, 'arguments/0/left/right'), 'arguments/0/left') && assert._capt(assert._capt(parsent, 'arguments/0/right/left') <= 15, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(5 <= parsent && parsent <= 15, i)',
            filepath: 'test/testSurfaceUtil.js',
            line: 339
        }), i);
    });
});
QUnit.test('SurfaceUtil.pna', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var pna, png, srfCnv;
        png = arg[0], pna = arg[1];
        srfCnv = SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: pna
        });
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srfCnv, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 80, 'arguments/0'), {
            content: 'assert.ok(srfCnv.cnv.width === 80)',
            filepath: 'test/testSurfaceUtil.js',
            line: 354
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srfCnv, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 90, 'arguments/0'), {
            content: 'assert.ok(srfCnv.cnv.height === 90)',
            filepath: 'test/testSurfaceUtil.js',
            line: 355
        }));
        setPictureFrame(srfCnv.cnv, 'pna');
        return done();
    });
});
QUnit.test('SurfaceUtil.getScrollXY', function (assert) {
    var ref, scrollX, scrollY;
    ref = SurfaceUtil.getScrollXY(), scrollX = ref.scrollX, scrollY = ref.scrollY;
    assert.ok(assert._expr(assert._capt(assert._capt(scrollX, 'arguments/0/left') === 0, 'arguments/0'), {
        content: 'assert.ok(scrollX === 0)',
        filepath: 'test/testSurfaceUtil.js',
        line: 364
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(scrollY, 'arguments/0/left') === 0, 'arguments/0'), {
        content: 'assert.ok(scrollY === 0)',
        filepath: 'test/testSurfaceUtil.js',
        line: 365
    }));
});