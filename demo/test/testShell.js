var prmNar;
prmNar = NarLoader.loadFromURL('../nar/mobilemaster.nar');
$(function () {
    return $('<style />').html('body{background-color:#D2E0E6;}canvas,img{border:1px solid black;}').appendTo($('body'));
});
window.SurfaceUtil = Shell.SurfaceUtil;
window.Shell = Shell.Shell;
prmNar.then(function (nanikaDir) {
    var setPictureFrame, shell, shellDir;
    setPictureFrame = function (srf, description) {
        var fieldset, legend, p;
        fieldset = document.createElement('fieldset');
        legend = document.createElement('legend');
        p = document.createElement('p');
        legend.appendChild(document.createTextNode('' + srf.surfaceId));
        p.appendChild(document.createTextNode(description || ''));
        fieldset.appendChild(legend);
        fieldset.appendChild(srf.element);
        fieldset.appendChild(p);
        fieldset.style.display = 'inline-block';
        fieldset.style.width = '310px';
        document.body.appendChild(fieldset);
        srf.element.addEventListener('mousemove', function (ev) {
            var hit, left, offsetX, offsetY, pageX, pageY, tmp, top;
            pageX = ev.pageX;
            pageY = ev.pageY;
            tmp = $(ev.target).offset();
            left = tmp.left;
            top = tmp.top;
            offsetX = pageX - left;
            offsetY = pageY - top;
            hit = SurfaceUtil.getRegion(srf.element, srf.surfaceNode.collisions, offsetX, offsetY);
            console.log(hit);
            if (hit.isHit) {
                $(ev.target).css({ 'cursor': 'pointer' });
            } else {
                $(ev.target).css({ 'cursor': 'default' });
            }
        });
    };
    QUnit.module('Shell');
    shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer();
    console.dir(shellDir);
    shell = new Shell(shellDir);
    QUnit.test('shell#load', function (assert) {
        var done;
        done = assert.async();
        return shell.load().then(function (shell) {
            assert.ok(true);
            console.log(shell);
            setInterval(function () {
                shell.unbind(0, 20);
                shell.unbind(0, 30);
                shell.unbind(0, 31);
                shell.unbind(0, 32);
                shell.unbind(0, 50);
                shell.showRegion();
                shell.render();
                setTimeout(function () {
                    shell.bind(0, 20);
                    shell.bind(0, 30);
                    shell.bind(0, 31);
                    shell.bind(0, 32);
                    shell.bind(0, 50);
                    shell.hideRegion();
                    shell.render();
                }, 3000);
            }, 6000);
            done();
        })['catch'](function (err) {
            console.error(err, err.stack, shell);
            assert.ok(false);
            done();
        });
    });
    QUnit.test('shell#hasFile', function (assert) {
        console.log(2);
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('surface0.png'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile(\'surface0.png\'))',
            filepath: 'test/testShell.js',
            line: 87
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('surface0.PNG'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile(\'surface0.PNG\'))',
            filepath: 'test/testShell.js',
            line: 88
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('.\\SURFACE0.PNG'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile(\'.\\\\SURFACE0.PNG\'))',
            filepath: 'test/testShell.js',
            line: 89
        }));
        assert.ok(assert._expr(assert._capt(!assert._capt(assert._capt(shell, 'arguments/0/argument/callee/object').hasFile('surface0+png'), 'arguments/0/argument'), 'arguments/0'), {
            content: 'assert.ok(!shell.hasFile(\'surface0+png\'))',
            filepath: 'test/testShell.js',
            line: 90
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('./surface0.png'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile(\'./surface0.png\'))',
            filepath: 'test/testShell.js',
            line: 91
        }));
        assert.ok(assert._expr(assert._capt(!assert._capt(assert._capt(shell, 'arguments/0/argument/callee/object').hasFile('/surface0/png'), 'arguments/0/argument'), 'arguments/0'), {
            content: 'assert.ok(!shell.hasFile(\'/surface0/png\'))',
            filepath: 'test/testShell.js',
            line: 92
        }));
    });
    QUnit.test('shell.descript', function (assert) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object').descript, 'arguments/0/left/object')['kero.bindgroup20.name'], 'arguments/0/left') === '装備,飛行装備', 'arguments/0'), {
            content: 'assert.ok(shell.descript[\'kero.bindgroup20.name\'] === \'装備,飛行装備\')',
            filepath: 'test/testShell.js',
            line: 95
        }));
    });
    QUnit.test('shell.surfacesTxt', function (assert) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object').surfacesTxt, 'arguments/0/left/object').charset, 'arguments/0/left') === 'Shift_JIS', 'arguments/0'), {
            content: 'assert.ok(shell.surfacesTxt.charset === \'Shift_JIS\')',
            filepath: 'test/testShell.js',
            line: 98
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object/object').surfacesTxt, 'arguments/0/left/object/object').descript, 'arguments/0/left/object').version, 'arguments/0/left') === 1, 'arguments/0'), {
            content: 'assert.ok(shell.surfacesTxt.descript.version === 1)',
            filepath: 'test/testShell.js',
            line: 99
        }));
    });
    QUnit.test('shell#attachSurface (periodic)', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 0);
        srf.render();
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 0, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 0)',
            filepath: 'test/testShell.js',
            line: 106
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203Bs[0]\u3002periodic,5瞬き\u3001talk,4口パク\u3002');
    });
    QUnit.test('shell#attachSurface (basic element and animation)', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 3);
        console.log(srf);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 3, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 3)',
            filepath: 'test/testShell.js',
            line: 117
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/object/callee/object/arguments/0/object').element, 'arguments/0/left/object/callee/object/arguments/0')), 'arguments/0/left/object/callee/object').children(), 'arguments/0/left/object')[0], 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok($(srf.element).children()[0] instanceof HTMLCanvasElement)',
            filepath: 'test/testShell.js',
            line: 118
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === 445)',
            filepath: 'test/testShell.js',
            line: 119
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === 182)',
            filepath: 'test/testShell.js',
            line: 120
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Head', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceNode.collisions[0].name === \'Head\')',
            filepath: 'test/testShell.js',
            line: 121
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceNode, 'arguments/0/left/object/object/object').animations, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').interval, 'arguments/0/left') === 'sometimes', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceNode.animations[0].interval === \'sometimes\')',
            filepath: 'test/testShell.js',
            line: 122
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203B胸を腕で覆っている\u3002sometimes瞬き\u3001random,6目そらし\u3001talk,4口パク\u3002');
    });
    QUnit.test('shell#attachSurface (animation always)', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 7);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 7, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 7)',
            filepath: 'test/testShell.js',
            line: 132
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLDivElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLDivElement)',
            filepath: 'test/testShell.js',
            line: 133
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === 445)',
            filepath: 'test/testShell.js',
            line: 134
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === 182)',
            filepath: 'test/testShell.js',
            line: 135
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Head', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceNode.collisions[0].name === \'Head\')',
            filepath: 'test/testShell.js',
            line: 136
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203B腕組み\u3002瞬き\u3001always怒り\u3001口パク\u3002');
    });
    QUnit.test('shell#attachSurface (runonce)', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 401);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 401, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 401)',
            filepath: 'test/testShell.js',
            line: 146
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLDivElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLDivElement)',
            filepath: 'test/testShell.js',
            line: 147
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === 445)',
            filepath: 'test/testShell.js',
            line: 148
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === 182)',
            filepath: 'test/testShell.js',
            line: 149
        }));
        setPictureFrame(srf, '\u203B寝ぼけ\u3002runonce口に手を当ててから直ぐ離し目パチ\u3002');
    });
    QUnit.test('shell#attachSurface ', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 11);
        console.log(srf);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 11, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 11)',
            filepath: 'test/testShell.js',
            line: 157
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLDivElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLDivElement)',
            filepath: 'test/testShell.js',
            line: 158
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === 210, 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === 210)',
            filepath: 'test/testShell.js',
            line: 159
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === 230, 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === 230)',
            filepath: 'test/testShell.js',
            line: 160
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Screen', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceNode.collisions[0].name === \'Screen\')',
            filepath: 'test/testShell.js',
            line: 161
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, 'CRTゅう');
    });
    QUnit.test('shell#attachSurface (srf.play())', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 5000);
        srf.play(100);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 5000, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 5000)',
            filepath: 'test/testShell.js',
            line: 172
        }));
        setPictureFrame(srf, '\u203B１回のみ爆発アニメ\u3002');
    });
    QUnit.test('shell#attachSurface (error filepath handle)', function (assert) {
        var div, srf;
        div = document.createElement('div');
        srf = shell.attachSurface(div, 0, 5001);
        srf.render();
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 5001, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 5001)',
            filepath: 'test/testShell.js',
            line: 180
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLDivElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLDivElement)',
            filepath: 'test/testShell.js',
            line: 181
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').height(), 'arguments/0/left') === 300, 'arguments/0'), {
            content: 'assert.ok($(srf.element).height() === 300)',
            filepath: 'test/testShell.js',
            line: 182
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt($(assert._capt(assert._capt(srf, 'arguments/0/left/callee/object/arguments/0/object').element, 'arguments/0/left/callee/object/arguments/0')), 'arguments/0/left/callee/object').width(), 'arguments/0/left') === 300, 'arguments/0'), {
            content: 'assert.ok($(srf.element).width() === 300)',
            filepath: 'test/testShell.js',
            line: 183
        }));
        setPictureFrame(srf, '\u203B透明です\u3002ファイル名エラー補正のテスト\u3002');
    });
    QUnit.test('shell#getBindGroups', function (assert) {
        var arr, expected;
        arr = shell.getBindGroups(0);
        expected = {
            20: {
                category: '装備',
                parts: '飛行装備'
            },
            30: {
                category: 'みみ',
                parts: 'MiSP-[sDA]アンテナ'
            },
            31: {
                category: 'みみ',
                parts: 'めか'
            },
            32: {
                category: 'みみ',
                parts: 'ねこ'
            },
            50: {
                category: 'アクセサリ',
                parts: 'MiSP-[sDA]眼鏡'
            }
        };
        return arr.forEach(function (arg, bindId) {
            var category, parts;
            category = arg.category, parts = arg.parts;
            assert.ok(assert._expr(assert._capt(category = assert._capt(assert._capt(assert._capt(expected, 'arguments/0/right/object/object')[assert._capt(bindId, 'arguments/0/right/object/property')], 'arguments/0/right/object').category, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(category = expected[bindId].category)',
                filepath: 'test/testShell.js',
                line: 214
            }));
            return assert.ok(assert._expr(assert._capt(parts = assert._capt(assert._capt(assert._capt(expected, 'arguments/0/right/object/object')[assert._capt(bindId, 'arguments/0/right/object/property')], 'arguments/0/right/object').parts, 'arguments/0/right'), 'arguments/0'), {
                content: 'assert.ok(parts = expected[bindId].parts)',
                filepath: 'test/testShell.js',
                line: 215
            }));
        });
    });
});