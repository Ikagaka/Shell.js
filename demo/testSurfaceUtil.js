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
    document.body.appendChild(fieldset);
};
QUnit.module('SurfaceUtil');
QUnit.test('chromakey_snipet speed test', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        var chromakeyTime, chromakeyTimes, getImageDataTime, getImageDataTimes, j, putImageDataTime, putImageDataTimes, results, results1, test;
        test = function () {
            var chromakeyTime, cnv, ctx, getImageDataTime, imgdata, putImageDataTime, start, stop;
            cnv = SurfaceUtil.copy(img);
            ctx = cnv.getContext('2d');
            start = performance.now();
            imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
            stop = performance.now();
            getImageDataTime = stop - start;
            start = performance.now();
            SurfaceUtil.chromakey_snipet(imgdata.data);
            stop = performance.now();
            chromakeyTime = stop - start;
            start = performance.now();
            ctx.putImageData(imgdata, 0, 0);
            stop = performance.now();
            putImageDataTime = stop - start;
            return {
                getImageDataTime: getImageDataTime,
                chromakeyTime: chromakeyTime,
                putImageDataTime: putImageDataTime
            };
        };
        results = function () {
            results1 = [];
            for (j = 1; j <= 100; j++) {
                results1.push(j);
            }
            return results1;
        }.apply(this).map(function () {
            return test();
        });
        getImageDataTimes = results.map(function (a) {
            return a.getImageDataTime;
        });
        putImageDataTimes = results.map(function (a) {
            return a.putImageDataTime;
        });
        chromakeyTimes = results.map(function (a) {
            return a.chromakeyTime;
        });
        getImageDataTime = getImageDataTimes.reduce(function (a, b) {
            return a + b;
        });
        putImageDataTime = putImageDataTimes.reduce(function (a, b) {
            return a + b;
        });
        chromakeyTime = chromakeyTimes.reduce(function (a, b) {
            return a + b;
        });
        assert.ok(assert._expr(assert._capt(assert._capt(getImageDataTime, 'arguments/0/left') > assert._capt(putImageDataTime, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(getImageDataTime > putImageDataTime)',
            filepath: 'test/testSurfaceUtil.js',
            line: 70
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(chromakeyTime, 'arguments/0/left') > 0, 'arguments/0'), {
            content: 'assert.ok(chromakeyTime > 0)',
            filepath: 'test/testSurfaceUtil.js',
            line: 71
        }));
        return done();
    });
});
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
        line: 91
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(original, 'arguments/0/left/object/object').b, 'arguments/0/left/object').c, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(original.b.c === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 92
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(original, 'arguments/0/left/object/object').b, 'arguments/0/left/object').d, 'arguments/0/left') === 0, 'arguments/0'), {
        content: 'assert.ok(original.b.d === 0)',
        filepath: 'test/testSurfaceUtil.js',
        line: 93
    }));
});
QUnit.test('SurfaceUtil.parseDescript', function (assert) {
    var dic, text;
    text = 'charset,Shift_JIS\ncraftman,Cherry Pot\ncraftmanw,Cherry Pot\ncraftmanurl,http://3rd.d-con.mydns.jp/cherrypot/\ntype,shell\nname,the "MobileMaster"\n\nsakura.balloon.offsetx,21\nsakura.balloon.offsety,80\nkero.balloon.offsetx,10\nkero.balloon.offsety,20\n\nseriko.alignmenttodesktop,free\nseriko.paint_transparent_region_black,0\nseriko.use_self_alpha,1';
    dic = SurfaceUtil.parseDescript(text);
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['charset'], 'arguments/0/left') === 'Shift_JIS', 'arguments/0'), {
        content: 'assert.ok(dic["charset"] === "Shift_JIS")',
        filepath: 'test/testSurfaceUtil.js',
        line: 100
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['sakura.balloon.offsetx'], 'arguments/0/left') === '21', 'arguments/0'), {
        content: 'assert.ok(dic["sakura.balloon.offsetx"] === "21")',
        filepath: 'test/testSurfaceUtil.js',
        line: 101
    }));
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(dic, 'arguments/0/left/object')['seriko.paint_transparent_region_black'], 'arguments/0/left') === '0', 'arguments/0'), {
        content: 'assert.ok(dic["seriko.paint_transparent_region_black"] === "0")',
        filepath: 'test/testSurfaceUtil.js',
        line: 102
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
            line: 112
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
        line: 121
    }));
    results = SurfaceUtil.find(paths, 'SURFACE10.PNG');
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[1], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[1])',
        filepath: 'test/testSurfaceUtil.js',
        line: 123
    }));
    results = SurfaceUtil.find(paths, 'elements\\element0.png');
    return assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(results, 'arguments/0/left/object')[0], 'arguments/0/left') === assert._capt(assert._capt(paths, 'arguments/0/right/object')[2], 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(results[0] === paths[2])',
        filepath: 'test/testSurfaceUtil.js',
        line: 125
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
        line: 138
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
        line: 145
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
        line: 152
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
        line: 170
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.width === cnv2.width)',
        filepath: 'test/testSurfaceUtil.js',
        line: 171
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === assert._capt(assert._capt(cnv2, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv.height === cnv2.height)',
        filepath: 'test/testSurfaceUtil.js',
        line: 172
    }));
    setPictureFrame(cnv, 'SurfaceUtil.copy cnv');
    return setPictureFrame(cnv2, 'SurfaceUtil.copy cnv2');
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
            line: 184
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(img, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(img.height === 445)',
            filepath: 'test/testSurfaceUtil.js',
            line: 185
        }));
        setPictureFrame(img, 'SurfaceUtil.fetchImageFromURL');
        return done();
    })['catch'](function (err) {
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
                        line: 204
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
                        line: 216
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
                        line: 228
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
        line: 247
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(SurfaceUtil, 'arguments/0/left/callee/object').isHit(assert._capt(cnv, 'arguments/0/left/arguments/0'), 50, 50), 'arguments/0/left') === true, 'arguments/0'), {
        content: 'assert.ok(SurfaceUtil.isHit(cnv, 50, 50) === true)',
        filepath: 'test/testSurfaceUtil.js',
        line: 248
    }));
    return setPictureFrame(cnv, 'SurfaceUtil.isHit cnv');
});
QUnit.test('SurfaceUtil.offset', function (assert) {
    var height, left, ref, top, width;
    ref = SurfaceUtil.offset(document.body), left = ref.left, top = ref.top, width = ref.width, height = ref.height;
    assert.ok(assert._expr(assert._capt(0 < assert._capt(left, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < left)',
        filepath: 'test/testSurfaceUtil.js',
        line: 255
    }));
    assert.ok(assert._expr(assert._capt(0 < assert._capt(top, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < top)',
        filepath: 'test/testSurfaceUtil.js',
        line: 256
    }));
    assert.ok(assert._expr(assert._capt(0 < assert._capt(width, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < width)',
        filepath: 'test/testSurfaceUtil.js',
        line: 257
    }));
    return assert.ok(assert._expr(assert._capt(0 < assert._capt(height, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 < height)',
        filepath: 'test/testSurfaceUtil.js',
        line: 258
    }));
});
QUnit.test('SurfaceUtil.createCanvas', function (assert) {
    var cnv;
    cnv = SurfaceUtil.createCanvas();
    assert.ok(assert._expr(assert._capt(assert._capt(cnv, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(cnv instanceof HTMLCanvasElement)',
        filepath: 'test/testSurfaceUtil.js',
        line: 264
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.width === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 265
    }));
    assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 1, 'arguments/0'), {
        content: 'assert.ok(cnv.height === 1)',
        filepath: 'test/testSurfaceUtil.js',
        line: 266
    }));
    return setPictureFrame(cnv, 'SurfaceUtil.createCanvas');
});
QUnit.test('SurfaceUtil.scope', function (assert) {
    assert.ok(assert._expr(assert._capt('sakura' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(0), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("sakura" === SurfaceUtil.scope(0))',
        filepath: 'test/testSurfaceUtil.js',
        line: 271
    }));
    assert.ok(assert._expr(assert._capt('kero' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(1), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("kero" === SurfaceUtil.scope(1))',
        filepath: 'test/testSurfaceUtil.js',
        line: 272
    }));
    return assert.ok(assert._expr(assert._capt('char2' === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').scope(2), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok("char2" === SurfaceUtil.scope(2))',
        filepath: 'test/testSurfaceUtil.js',
        line: 273
    }));
});
QUnit.test('SurfaceUtil.unscope', function (assert) {
    assert.ok(assert._expr(assert._capt(0 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('sakura'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(0 === SurfaceUtil.unscope("sakura"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 277
    }));
    assert.ok(assert._expr(assert._capt(1 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('kero'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(1 === SurfaceUtil.unscope("kero"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 278
    }));
    return assert.ok(assert._expr(assert._capt(2 === assert._capt(assert._capt(SurfaceUtil, 'arguments/0/right/callee/object').unscope('char2'), 'arguments/0/right'), 'arguments/0'), {
        content: 'assert.ok(2 === SurfaceUtil.unscope("char2"))',
        filepath: 'test/testSurfaceUtil.js',
        line: 279
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
            line: 287
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(pageY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === pageY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 288
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 289
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(clientY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === clientY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 290
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(screenX, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenX)',
            filepath: 'test/testSurfaceUtil.js',
            line: 291
        }));
        assert.ok(assert._expr(assert._capt(100 === assert._capt(screenY, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(100 === screenY)',
            filepath: 'test/testSurfaceUtil.js',
            line: 292
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
QUnit.test('recursiveElementFromPoint, eventPropagationSim', function (assert) {
    return assert.ok(false, 'test is not written yet');
});