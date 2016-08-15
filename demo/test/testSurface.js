var craetePictureFrame;
window.SurfaceUtil = Shell.SurfaceUtil;
window.Surface = Shell.Surface;
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
QUnit.module('Shell.Surface');
QUnit.test('surface0', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([
        SurfaceUtil.fetchImageFromURL('src/surface0.png'),
        SurfaceUtil.fetchImageFromURL('src/surface100.png'),
        SurfaceUtil.fetchImageFromURL('src/surface101.png')
    ]).then(function (arg) {
        var _base, _srf100, _srf101, base, srf, srf100, srf101, surfaceTree;
        _base = arg[0], _srf100 = arg[1], _srf101 = arg[2];
        base = {
            cnv: null,
            png: _base,
            pna: null
        };
        srf100 = {
            cnv: null,
            png: _srf100,
            pna: null
        };
        srf101 = {
            cnv: null,
            png: _srf101,
            pna: null
        };
        surfaceTree = {
            0: {
                base: base,
                elements: [],
                collisions: [],
                animations: [{
                        is: 0,
                        interval: 'periodic,5',
                        patterns: [
                            {
                                type: 'overlay',
                                surface: 100,
                                wait: '50-3000',
                                x: 65,
                                y: 100
                            },
                            {
                                type: 'overlay',
                                surface: 101,
                                wait: 50,
                                x: 65,
                                y: 100
                            },
                            {
                                type: 'overlay',
                                surface: 100,
                                wait: 50,
                                x: 65,
                                y: 100
                            },
                            {
                                type: 'overlay',
                                surface: -1,
                                wait: 50,
                                x: 0,
                                y: 0
                            }
                        ]
                    }]
            },
            100: {
                base: srf100,
                elements: [],
                collisions: [],
                animations: []
            },
            101: {
                base: srf101,
                elements: [],
                collisions: [],
                animations: []
            }
        };
        srf = new Surface(document.createElement('div'), 0, 0, surfaceTree);
        return setTimeout(function () {
            var frame;
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok($(srf.element).width() === base.cnv.width)',
                filepath: 'test/testSurface.js',
                line: 119
            }));
            assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok($(srf.element).height() === base.cnv.height)',
                filepath: 'test/testSurface.js',
                line: 120
            }));
            frame = craetePictureFrame('surface0');
            frame.add(srf.element, 'マリちゃんの\\0\\s[0]のまばたき');
            return done();
        });
    });
});
QUnit.test('surface overlay', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var _base, base, frame, srf, surfaceTree;
        _base = arg[0];
        base = {
            cnv: null,
            png: _base,
            pna: null
        };
        surfaceTree = {
            0: {
                base: base,
                elements: [],
                collisions: [],
                animations: [{
                        is: 0,
                        interval: 'always',
                        patterns: [
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '50',
                                x: 10,
                                y: 10
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: 20,
                                y: 0
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: 10,
                                y: -10
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: 0,
                                y: -20
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: -10,
                                y: -10
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: -20,
                                y: 0
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: -10,
                                y: 10
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: 50,
                                x: 0,
                                y: 20
                            }
                        ]
                    }]
            }
        };
        srf = new Surface(document.createElement('div'), 0, 0, surfaceTree);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === base.cnv.width)',
            filepath: 'test/testSurface.js',
            line: 204
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === base.cnv.height)',
            filepath: 'test/testSurface.js',
            line: 205
        }));
        frame = craetePictureFrame('overlay テスト');
        frame.add(srf.element, 'マリちゃんのセルフエグザイル');
        return done();
    });
});
QUnit.test('surface overlay negative', function (assert) {
    var done;
    done = assert.async();
    return Promise.all([SurfaceUtil.fetchImageFromURL('src/surface0.png')]).then(function (arg) {
        var _base, base, frame, srf, surfaceTree;
        _base = arg[0];
        base = {
            cnv: null,
            png: _base,
            pna: null
        };
        surfaceTree = {
            0: {
                base: base,
                elements: [],
                collisions: [],
                animations: [{
                        is: 0,
                        interval: 'always',
                        patterns: [
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '30',
                                x: -10,
                                y: -10
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '30',
                                x: -20,
                                y: -20
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '30',
                                x: -30,
                                y: -30
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '30',
                                x: -40,
                                y: -40
                            },
                            {
                                type: 'overlay',
                                surface: 0,
                                wait: '30',
                                x: -50,
                                y: -50
                            }
                        ]
                    }]
            }
        };
        srf = new Surface(document.createElement('div'), 0, 0, surfaceTree);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === base.cnv.width)',
            filepath: 'test/testSurface.js',
            line: 270
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === base.cnv.height)',
            filepath: 'test/testSurface.js',
            line: 271
        }));
        frame = craetePictureFrame('overlay テスト');
        frame.add(srf.element, 'マリちゃんが左上へ向かう');
        return done();
    });
});