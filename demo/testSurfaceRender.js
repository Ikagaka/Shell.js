var craetePictureFrame;
window.SurfaceRender = Shell.SurfaceRender;
window.SurfaceUtil = Shell.SurfaceUtil;
$(function () {
    return $('<style />').html('canvas{border:1px solid black;}').appendTo($('body'));
});
craetePictureFrame = function (description, target) {
    var fieldset, legend;
    if (target == null) {
        target = document.body;
    }
    fieldset = document.createElement('fieldset');
    legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.style.display = 'inline-block';
    target.appendChild(fieldset);
    return {
        add: function (element, txt) {
            var frame;
            if (txt != null) {
                frame = craetePictureFrame(txt, fieldset);
                return frame.add(element);
            } else {
                return fieldset.appendChild(element);
            }
        },
        elm: fieldset
    };
};
QUnit.module('Shell.SurfaceRender');
QUnit.test('SurfaceRender#clear', function (assert) {
    var alpha, cnv, ctx, frame, imagedata, render;
    cnv = document.createElement('canvas');
    cnv.width = cnv.height = 100;
    render = new SurfaceRender(cnv);
    ctx = render.ctx;
    ctx.fillStyle = 'black';
    ctx.rect(10, 10, 80, 80);
    ctx.fill();
    render.clear();
    imagedata = ctx.getImageData(0, 0, cnv.width, cnv.height);
    alpha = imagedata.data[3];
    assert.ok(assert._expr(assert._capt(assert._capt(alpha, 'arguments/0/left') === 0, 'arguments/0'), {
        content: 'assert.ok(alpha === 0)',
        filepath: 'test/testSurfaceRender.js',
        line: 50
    }));
    frame = craetePictureFrame('SurfaceRender#clear');
    return frame.add(cnv);
});
QUnit.test('SurfaceRender#chromakey', function (assert) {
    var done;
    done = assert.async();
    assert.expect(1);
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        var alpha, cnv, ctx, frame, imagedata, render;
        cnv = SurfaceUtil.copy(img);
        render = new SurfaceRender(cnv);
        render.chromakey();
        ctx = render.ctx;
        imagedata = ctx.getImageData(0, 0, cnv.width, cnv.height);
        alpha = imagedata.data[3];
        assert.ok(assert._expr(assert._capt(assert._capt(alpha, 'arguments/0/left') === 0, 'arguments/0'), {
            content: 'assert.ok(alpha === 0)',
            filepath: 'test/testSurfaceRender.js',
            line: 67
        }));
        frame = craetePictureFrame('SurfaceRender#chromakey');
        frame.add(img, 'before');
        frame.add(cnv, 'after');
        return done();
    });
});
QUnit.test('chromakey speed test', function (assert) {
    var done;
    done = assert.async();
    assert.expect(2);
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        var chromakeyTime, chromakeyTimes, getImageDataTime, getImageDataTimes, i, putImageDataTime, putImageDataTimes, results, results1, test;
        test = function () {
            var chromakeyTime, cnv, ctx, data, getImageDataTime, imgdata, putImageDataTime, start, stop;
            cnv = SurfaceUtil.copy(img);
            ctx = cnv.getContext('2d');
            start = performance.now();
            imgdata = ctx.getImageData(0, 0, cnv.width, cnv.height);
            stop = performance.now();
            getImageDataTime = stop - start;
            data = imgdata.data;
            start = performance.now();
            var r = data[0], g = data[1], b = data[2], a = data[3];
            var i = 0;
            if (a !== 0) {
                while (i < data.length) {
                    if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
                        data[i + 3] = 0;
                    }
                    i += 4;
                }
            }
            ;
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
            for (i = 1; i <= 100; i++) {
                results1.push(i);
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
            filepath: 'test/testSurfaceRender.js',
            line: 140
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(chromakeyTime, 'arguments/0/left') > 0, 'arguments/0'), {
            content: 'assert.ok(chromakeyTime > 0)',
            filepath: 'test/testSurfaceRender.js',
            line: 141
        }));
        return done();
    });
});
QUnit.test('SurfaceRender#pna', function (assert) {
    var done;
    done = assert.async();
    assert.expect(1);
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('surface0730.png').then(function (img) {
            return SurfaceUtil.copy(img);
        }),
        SurfaceUtil.fetchImageFromURL('surface0730.pna').then(function (img) {
            return SurfaceUtil.copy(img);
        })
    ]).then(function (arg) {
        var _png, alpha, ctx, frame, imagedata, pna, png, render;
        png = arg[0], pna = arg[1];
        _png = SurfaceUtil.copy(png);
        render = new SurfaceRender(png);
        render.pna(pna);
        ctx = render.ctx;
        imagedata = ctx.getImageData(0, 0, render.cnv.width, render.cnv.height);
        alpha = imagedata.data[3];
        assert.ok(assert._expr(assert._capt(assert._capt(alpha, 'arguments/0/left') === 0, 'arguments/0'), {
            content: 'assert.ok(alpha === 0)',
            filepath: 'test/testSurfaceRender.js',
            line: 165
        }));
        frame = craetePictureFrame('SurfaceRender#pna');
        frame.add(_png, 'before');
        frame.add(pna, 'pna');
        frame.add(png, 'after');
        frame.elm.style.backgroundColor = 'gray';
        return done();
    });
});
QUnit.test('SurfaceRender#base, SurfaceRender#init', function (assert) {
    var done;
    done = assert.async();
    assert.expect(2);
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        var cnv, render;
        cnv = SurfaceUtil.createCanvas();
        render = new SurfaceRender(cnv);
        render.base(img);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 184
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 185
        }));
        return done();
    });
});
QUnit.test('SurfaceRender#overlay', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
            return SurfaceUtil.copy(img);
        }),
        SurfaceUtil.fetchImageFromURL('surface0730.png').then(function (img) {
            return SurfaceUtil.copy(img);
        }),
        SurfaceUtil.fetchImageFromURL('surface0730.pna').then(function (img) {
            return SurfaceUtil.copy(img);
        })
    ]).then(function (arg) {
        var __base, __png, _base, _png, base, frame, pna, png, render;
        base = arg[0], png = arg[1], pna = arg[2];
        render = new SurfaceRender(png);
        render.pna(pna);
        render = new SurfaceRender(base);
        render.chromakey();
        _base = SurfaceUtil.copy(base);
        _png = SurfaceUtil.copy(png);
        render = new SurfaceRender(_png);
        render.overlay(base, 0, 0);
        render = new SurfaceRender(_base);
        render.overlay(png, 0, 0);
        __base = SurfaceUtil.copy(base);
        __png = SurfaceUtil.copy(png);
        render = new SurfaceRender(__png);
        render.overlay(base, -100, -100);
        render = new SurfaceRender(__base);
        render.overlay(png, -100, -100);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(_png, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(_png.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 220
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(_png, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(_png.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 221
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(_base, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(_base.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 222
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(_base, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(_base.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 223
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(__png, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(__png.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 224
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(__png, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(__png.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 225
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(__base, 'arguments/0/left/object').width, 'arguments/0/left') === 282, 'arguments/0'), {
            content: 'assert.ok(__base.width === 282)',
            filepath: 'test/testSurfaceRender.js',
            line: 226
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(__base, 'arguments/0/left/object').height, 'arguments/0/left') === 545, 'arguments/0'), {
            content: 'assert.ok(__base.height === 545)',
            filepath: 'test/testSurfaceRender.js',
            line: 227
        }));
        frame = craetePictureFrame('SurfaceRender#overlay');
        frame.add(_base, 'megane on base');
        frame.add(_png, 'base on megane');
        frame.add(__base, 'megane on base (-100, -100)');
        frame.add(__png, 'base on megane (-100, -100)');
        frame.elm.style.backgroundColor = 'gray';
        return done();
    });
});
QUnit.test('SurfaceRender#overlayfast', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        return SurfaceUtil.copy(img);
    }).then(function (base) {
        var _base, frame, render;
        render = new SurfaceRender(base);
        render.chromakey();
        _base = SurfaceUtil.copy(base);
        render.overlayfast(_base, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#overlayfast');
        frame.add(base, 'overlayfast');
        frame.elm.style.backgroundColor = 'gray';
        return done();
    });
});
QUnit.test('SurfaceRender#interpolate', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        return SurfaceUtil.copy(img);
    }).then(function (base) {
        var _base, frame, render;
        render = new SurfaceRender(base);
        render.chromakey();
        _base = SurfaceUtil.copy(base);
        render.interpolate(_base, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#interpolate');
        frame.add(base, 'interpolate');
        frame.elm.style.backgroundColor = 'gray';
        return done();
    });
});
QUnit.test('SurfaceRender#replace', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        return SurfaceUtil.copy(img);
    }).then(function (base) {
        var _base, frame, render;
        render = new SurfaceRender(base);
        render.chromakey();
        _base = SurfaceUtil.copy(base);
        render = new SurfaceRender(_base);
        render.replace(base, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#replace');
        frame.add(_base, 'replace');
        frame.elm.style.backgroundColor = 'gray';
        return done();
    });
});
QUnit.test('SurfaceRender#initImageData', function (assert) {
    var done;
    done = assert.async();
    return SurfaceUtil.fetchImageFromURL('surface0.png').then(function (img) {
        return SurfaceUtil.copy(img);
    }).then(function (base) {
        var imgdata, render;
        render = new SurfaceRender(base);
        render.chromakey();
        imgdata = render.ctx.getImageData(0, 0, render.cnv.width, render.cnv.height);
        render = new SurfaceRender(SurfaceUtil.createCanvas());
        render.initImageData(base.width, base.height, imgdata.data);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(render.cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 308
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(render.cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 309
        }));
        return done();
    });
});
QUnit.test('SurfaceRender#drawRegions', function (assert) {
    return assert.ok(false, 'not impliment yet');
});
QUnit.test('SurfaceRender#composeElements', function (assert) {
    return assert.ok(false, 'not impliment yet');
});