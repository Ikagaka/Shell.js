var craetePictureFrame;
window.SurfaceRender = Shell.SurfaceRender;
SurfaceRender.prototype.debug = true;
window.SurfaceUtil = Shell.SurfaceUtil;
$(function () {
    return $('<style />').html('canvas,img{border:1px solid black;}').appendTo($('body'));
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
    fieldset.style.backgroundColor = '#D2E0E6';
    return {
        add: function (element, txt) {
            var frame, p, txtNode;
            if (txt != null) {
                frame = craetePictureFrame(txt, fieldset);
                return frame.add(element);
            } else if (typeof element === 'string') {
                txtNode = document.createTextNode(element);
                p = document.createElement('p');
                p.appendChild(txtNode);
                return fieldset.appendChild(p);
            } else {
                return fieldset.appendChild(element);
            }
        }
    };
};
QUnit.module('Shell.SurfaceRender');
QUnit.test('SurfaceRender#clear', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0730.png')]).then(function (arg) {
        var alpha, cnv, ctx, imagedata, png, render;
        png = arg[0];
        render = new SurfaceRender();
        render.base(SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: null
        }));
        cnv = render.cnv, ctx = render.ctx;
        ctx.fillStyle = 'black';
        ctx.rect(10, 10, 80, 80);
        ctx.fill();
        render.clear();
        imagedata = ctx.getImageData(50, 50, cnv.width, cnv.height);
        alpha = imagedata.data[3];
        assert.ok(assert._expr(assert._capt(assert._capt(alpha, 'arguments/0/left') === 0, 'arguments/0'), {
            content: 'assert.ok(alpha === 0)',
            filepath: 'test/testSurfaceRender.js',
            line: 64
        }));
        return done();
    });
});
QUnit.test('SurfaceRender#base', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var cnv, ctx, png, render;
        png = arg[0];
        render = new SurfaceRender();
        render.base(SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: null
        }));
        cnv = render.cnv, ctx = render.ctx;
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 82
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 83
        }));
        return done();
    });
});
QUnit.test('SurfaceRender#overlay', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var base, base_on_megane_negative_render, base_on_megane_render, frame, img, megane, megane_on_base_negative_render, megane_on_base_render, pna, png;
        img = arg[0], png = arg[1], pna = arg[2];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        megane = SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: pna
        });
        megane_on_base_render = new SurfaceRender();
        megane_on_base_render.base(base);
        base_on_megane_render = new SurfaceRender();
        base_on_megane_render.base(megane);
        megane_on_base_negative_render = new SurfaceRender();
        megane_on_base_negative_render.base(base);
        base_on_megane_negative_render = new SurfaceRender();
        base_on_megane_negative_render.base(megane);
        megane_on_base_render.overlay(megane, 0, 0);
        base_on_megane_render.overlay(base, 0, 0);
        megane_on_base_negative_render.overlay(megane, -100, -100);
        base_on_megane_negative_render.overlay(base, -100, -100);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(megane_on_base_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(megane_on_base_render.cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 116
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(megane_on_base_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(megane_on_base_render.cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 117
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(base_on_megane_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(base_on_megane_render.cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 118
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(base_on_megane_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(base_on_megane_render.cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 119
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(megane_on_base_negative_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 282, 'arguments/0'), {
            content: 'assert.ok(megane_on_base_negative_render.cnv.width === 282)',
            filepath: 'test/testSurfaceRender.js',
            line: 120
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(megane_on_base_negative_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 545, 'arguments/0'), {
            content: 'assert.ok(megane_on_base_negative_render.cnv.height === 545)',
            filepath: 'test/testSurfaceRender.js',
            line: 121
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(base_on_megane_negative_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(base_on_megane_negative_render.cnv.width === 182)',
            filepath: 'test/testSurfaceRender.js',
            line: 122
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(base_on_megane_negative_render, 'arguments/0/left/object/object').cnv, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(base_on_megane_negative_render.cnv.height === 445)',
            filepath: 'test/testSurfaceRender.js',
            line: 123
        }));
        frame = craetePictureFrame('SurfaceRender#overlay');
        frame.add('下位レイヤにコマを重ねる');
        frame.add(megane_on_base_render.cnv, 'megane on base');
        frame.add(base_on_megane_render.cnv, 'base on megane');
        frame.add(megane_on_base_negative_render.cnv, 'megane on base (-100, -100)');
        frame.add(base_on_megane_negative_render.cnv, 'base on megane (-100, -100)');
        return done();
    });
});
QUnit.test('SurfaceRender#overlayfast', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render, transparent;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.base(base);
        transparent = render.getSurfaceCanvas();
        render.overlayfast(transparent, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#overlayfast');
        frame.add('下位レイヤの非透過部分\uFF08半透明含む\uFF09にのみコマを重ねる');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/overlayfast.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#interpolate', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render, transparent;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.base(base);
        transparent = render.getSurfaceCanvas();
        render.interpolate(transparent, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#interpolate');
        frame.add('下位レイヤの透明なところにのみコマを重ねる');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/interpolate.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#replace', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render, transparent;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.base(base);
        transparent = render.getSurfaceCanvas();
        render.replace(transparent, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#replace');
        frame.add('下位レイヤにコマを重ねるが\u3001コマの透過部分について下位レイヤにも反映する');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/replace.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#move', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.base(base);
        render.move(50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#move(50, 50)');
        frame.add('下位レイヤをXY座標指定分ずらす');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/move.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#reduce', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, cnv, ctx, filter, frame, img, render;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        cnv = document.createElement('canvas');
        cnv.width = cnv.height = 100;
        ctx = cnv.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.rect(10, 10, 80, 80);
        ctx.fill();
        filter = {
            cnv: cnv,
            img: null
        };
        render = new SurfaceRender();
        render.base(base);
        render.reduce(filter, 50, 50);
        render.reduce(filter, 120, 120);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#reduce');
        frame.add('マリちゃんの顔のまわりと右下に透明枠ができる');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/reduce.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#asis', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.base(base);
        render.asis(base, 50, 50);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#asis(50, 50)');
        frame.add('下位レイヤに\u3001抜き色やアルファチャンネルを適応しないままそのコマを重ねる');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/asis.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#composeElements', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var base, frame, img, megane, pna, png, render;
        img = arg[0], png = arg[1], pna = arg[2];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        megane = {
            cnv: null,
            png: png,
            pna: pna
        };
        render = new SurfaceRender();
        render.composeElements([
            {
                canvas: base,
                type: 'base',
                x: 0,
                y: 0
            },
            {
                canvas: megane,
                type: 'overlay',
                x: 50,
                y: 50
            }
        ]);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#composeElements');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/composeElements.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#drawRegions', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var base, frame, img, render;
        img = arg[0];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        render = new SurfaceRender();
        render.composeElements([{
                canvas: base,
                type: 'base',
                x: 0,
                y: 0
            }]);
        render.drawRegions([
            {
                is: 0,
                type: 'rect',
                name: 'Head',
                left: 56,
                top: 58,
                right: 132,
                bottom: 91
            },
            {
                is: 1,
                type: 'rect',
                name: 'Face',
                left: 68,
                top: 96,
                right: 121,
                bottom: 144
            },
            {
                is: 2,
                type: 'rect',
                name: 'Bust',
                left: 59,
                top: 191,
                right: 106,
                bottom: 221
            },
            {
                is: 3,
                type: 'rect',
                name: 'Power',
                left: 68,
                top: 175,
                right: 90,
                bottom: 192
            },
            {
                is: 4,
                type: 'rect',
                name: 'Leg',
                left: 47,
                top: 326,
                right: 79,
                bottom: 357
            },
            {
                is: 5,
                type: 'rect',
                name: 'Leg',
                left: 97,
                top: 322,
                right: 130,
                bottom: 350
            },
            {
                is: 6,
                type: 'rect',
                name: 'Ribbon',
                left: 66,
                top: 7,
                right: 148,
                bottom: 49
            },
            {
                is: 7,
                type: 'rect',
                name: 'Body',
                left: 53,
                top: 223,
                right: 115,
                bottom: 253
            },
            {
                is: 8,
                type: 'rect',
                name: 'Foot',
                left: 46,
                top: 386,
                right: 87,
                bottom: 441
            },
            {
                is: 9,
                type: 'rect',
                name: 'Foot',
                left: 116,
                top: 382,
                right: 155,
                bottom: 442
            },
            {
                is: 10,
                type: 'rect',
                name: 'Ponytail',
                left: 129,
                top: 52,
                right: 151,
                bottom: 179
            },
            {
                is: 11,
                type: 'circle',
                name: 'neji',
                radius: 5,
                center_x: 59,
                center_y: 303
            },
            {
                is: 12,
                type: 'ellipse',
                name: 'xxx',
                left: 73,
                top: 263,
                right: 95,
                bottom: 313
            },
            {
                is: 13,
                type: 'polygon',
                name: 'Iron',
                coordinates: [
                    {
                        x: 90,
                        y: 253
                    },
                    {
                        x: 107,
                        y: 310
                    },
                    {
                        x: 130,
                        y: 310
                    },
                    {
                        x: 160,
                        y: 300
                    },
                    {
                        x: 170,
                        y: 280
                    },
                    {
                        x: 160,
                        y: 260
                    },
                    {
                        x: 120,
                        y: 280
                    },
                    {
                        x: 100,
                        y: 253
                    }
                ]
            }
        ]);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#drawRegions');
        frame.add(render.cnv, 'result');
        frame.add($('<img src=\'src/drawRegions.png\' />')[0], 'expected');
        return done();
    });
});
QUnit.test('SurfaceRender#overlay negative', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var base, frame, img, megane, pna, png, render;
        img = arg[0], png = arg[1], pna = arg[2];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        megane = SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: pna
        });
        render = new SurfaceRender();
        render.debug = true;
        render.composeElements([
            {
                canvas: base,
                type: 'base',
                x: 0,
                y: 0
            },
            {
                canvas: megane,
                type: 'overlay',
                x: -100,
                y: -100
            },
            {
                canvas: megane,
                type: 'overlay',
                x: -50,
                y: -50
            },
            {
                canvas: megane,
                type: 'overlay',
                x: 0,
                y: 0
            }
        ]);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#overlay negative');
        frame.add(render.cnv, 'result');
        return done();
    });
});
QUnit.test('SurfaceRender#overlay base on megane', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var base, frame, img, megane, pna, png, render;
        img = arg[0], png = arg[1], pna = arg[2];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        megane = SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: pna
        });
        render = new SurfaceRender();
        render.debug = true;
        render.composeElements([
            {
                canvas: megane,
                type: 'base',
                x: 0,
                y: 0
            },
            {
                canvas: base,
                type: 'overlay',
                x: -100,
                y: -100
            }
        ]);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#overlay negative');
        frame.add(render.cnv, 'result');
        return done();
    });
});
QUnit.test('SurfaceRender#overlay base on megane super', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.png'),
        SurfaceUtil.fetchImageFromURL('src/surface0730.pna')
    ]).then(function (arg) {
        var base, frame, img, megane, pna, png, render;
        img = arg[0], png = arg[1], pna = arg[2];
        base = SurfaceUtil.pna({
            cnv: null,
            png: img,
            pna: null
        });
        megane = SurfaceUtil.pna({
            cnv: null,
            png: png,
            pna: pna
        });
        render = new SurfaceRender();
        render.debug = true;
        render.composeElements([
            {
                canvas: megane,
                type: 'base',
                x: 0,
                y: 0
            },
            {
                canvas: megane,
                type: 'overlay',
                x: -50,
                y: -50
            },
            {
                canvas: megane,
                type: 'overlay',
                x: 50,
                y: -50
            },
            {
                canvas: megane,
                type: 'overlay',
                x: -50,
                y: 50
            },
            {
                canvas: megane,
                type: 'overlay',
                x: 50,
                y: 50
            }
        ]);
        assert.ok(true);
        frame = craetePictureFrame('SurfaceRender#overlay negative');
        frame.add(render.cnv, 'result');
        return done();
    });
});