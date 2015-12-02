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
        SurfaceUtil.createSurfaceCanvasFromURL('src/surface0.png'),
        SurfaceUtil.createSurfaceCanvasFromURL('src/surface100.png'),
        SurfaceUtil.createSurfaceCanvasFromURL('src/surface101.png')
    ]).then(function (arg) {
        var base, frame, srf, srf100, srf101, surfaceTree;
        base = arg[0], srf100 = arg[1], srf101 = arg[2];
        surfaceTree = {
            0: {
                base: base,
                elements: [],
                collisions: [],
                animations: [{
                        is: 0,
                        interval: 'periodic',
                        option: '5',
                        patterns: [
                            {
                                animation_ids: [],
                                type: 'overlay',
                                surface: 100,
                                wait: '50-3000',
                                x: 65,
                                y: 100
                            },
                            {
                                animation_ids: [],
                                type: 'overlay',
                                surface: 101,
                                wait: 50,
                                x: 65,
                                y: 100
                            },
                            {
                                animation_ids: [],
                                type: 'overlay',
                                surface: 100,
                                wait: 50,
                                x: 65,
                                y: 100
                            },
                            {
                                animation_ids: [],
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
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').width, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === base.cnv.width)',
            filepath: 'test/testSurface.js',
            line: 107
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === assert._capt(assert._capt(assert._capt(base, 'arguments/0/right/object/object').cnv, 'arguments/0/right/object').height, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === base.cnv.height)',
            filepath: 'test/testSurface.js',
            line: 108
        }));
        frame = craetePictureFrame('surface0');
        frame.add(srf.element, 'マリちゃんの\\0\\s[0]のまばたき');
        return done();
    });
});