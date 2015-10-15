var prmNar = NarLoader.loadFromURL('../nar/mobilemaster.nar');
prmNar.then(function (nanikaDir) {
    QUnit.module('Shell');
    var shellDir = nanikaDir.getDirectory('shell/master').asArrayBuffer();
    console.dir(shellDir);
    var shell = new Shell.Shell(shellDir);
    QUnit.test('shell#load', function (assert) {
        var done = assert.async();
        return shell.load().then(function (shell) {
            assert.ok(true);
            console.log(shell);
            setInterval(function () {
                shell.unbind(20);
                shell.unbind(30);
                shell.unbind(31);
                shell.unbind(32);
                shell.unbind(50);
                shell.enableRegionVisible = true;
                shell.render();
                setTimeout(function () {
                    shell.bind(20);
                    shell.bind(30);
                    shell.bind(31);
                    shell.bind(32);
                    shell.bind(50);
                    shell.enableRegionVisible = false;
                    shell.render();
                }, 3000);
            }, 6000);
            done();
        }).catch(function (err) {
            console.error(err, err.stack, shell);
            assert.ok(false);
            done();
        });
    });
    QUnit.test('shell#hasFile', function (assert) {
        console.log(2);
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('surface0.png'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile("surface0.png"))',
            filepath: 'test/original/testShell.js',
            line: 50
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('surface0.PNG'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile("surface0.PNG"))',
            filepath: 'test/original/testShell.js',
            line: 51
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('.\\SURFACE0.PNG'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile(".\\\\SURFACE0.PNG"))',
            filepath: 'test/original/testShell.js',
            line: 52
        }));
        assert.ok(assert._expr(assert._capt(!assert._capt(assert._capt(shell, 'arguments/0/argument/callee/object').hasFile('surface0+png'), 'arguments/0/argument'), 'arguments/0'), {
            content: 'assert.ok(!shell.hasFile("surface0+png"))',
            filepath: 'test/original/testShell.js',
            line: 53
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(shell, 'arguments/0/callee/object').hasFile('./surface0.png'), 'arguments/0'), {
            content: 'assert.ok(shell.hasFile("./surface0.png"))',
            filepath: 'test/original/testShell.js',
            line: 54
        }));
        assert.ok(assert._expr(assert._capt(!assert._capt(assert._capt(shell, 'arguments/0/argument/callee/object').hasFile('/surface0/png'), 'arguments/0/argument'), 'arguments/0'), {
            content: 'assert.ok(!shell.hasFile("/surface0/png"))',
            filepath: 'test/original/testShell.js',
            line: 55
        }));
    });
    QUnit.test('shell.descript', function (assert) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object').descript, 'arguments/0/left/object')['kero.bindgroup20.name'], 'arguments/0/left') === '装備,飛行装備', 'arguments/0'), {
            content: 'assert.ok(shell.descript["kero.bindgroup20.name"] === "装備,飛行装備")',
            filepath: 'test/original/testShell.js',
            line: 59
        }));
    });
    QUnit.test('shell.surfacesTxt', function (assert) {
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object').surfacesTxt, 'arguments/0/left/object').charset, 'arguments/0/left') === 'Shift_JIS', 'arguments/0'), {
            content: 'assert.ok(shell.surfacesTxt.charset === "Shift_JIS")',
            filepath: 'test/original/testShell.js',
            line: 63
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(shell, 'arguments/0/left/object/object/object').surfacesTxt, 'arguments/0/left/object/object').descript, 'arguments/0/left/object').version, 'arguments/0/left') === 1, 'arguments/0'), {
            content: 'assert.ok(shell.surfacesTxt.descript.version === 1)',
            filepath: 'test/original/testShell.js',
            line: 64
        }));
    });
    QUnit.test('shell#attachSurface (periodic)', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 0);
        srf.render();
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 0, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 0)',
            filepath: 'test/original/testShell.js',
            line: 71
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203Bs[0]\u3002periodic,5瞬き\u3001talk,4口パク\u3002');
    });
    QUnit.test('shell#attachSurface (basic element and animation)', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 3);
        console.log(srf);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 3, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 3)',
            filepath: 'test/original/testShell.js',
            line: 80
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLCanvasElement)',
            filepath: 'test/original/testShell.js',
            line: 81
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(srf.element.height === 445)',
            filepath: 'test/original/testShell.js',
            line: 82
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(srf.element.width === 182)',
            filepath: 'test/original/testShell.js',
            line: 83
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceTreeNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Head', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceTreeNode.collisions[0].name === "Head")',
            filepath: 'test/original/testShell.js',
            line: 84
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceTreeNode, 'arguments/0/left/object/object/object').animations, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').interval, 'arguments/0/left') === 'sometimes', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceTreeNode.animations[0].interval === "sometimes")',
            filepath: 'test/original/testShell.js',
            line: 85
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203B胸を腕で覆っている\u3002sometimes瞬き\u3001random,6目そらし\u3001talk,4口パク\u3002');
    });
    QUnit.test('shell#attachSurface (animation always)', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 7);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 7, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 7)',
            filepath: 'test/original/testShell.js',
            line: 93
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLCanvasElement)',
            filepath: 'test/original/testShell.js',
            line: 94
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(srf.element.height === 445)',
            filepath: 'test/original/testShell.js',
            line: 95
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(srf.element.width === 182)',
            filepath: 'test/original/testShell.js',
            line: 96
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceTreeNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Head', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceTreeNode.collisions[0].name === "Head")',
            filepath: 'test/original/testShell.js',
            line: 97
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, '\u203B腕組み\u3002瞬き\u3001always怒り\u3001口パク\u3002');
    });
    QUnit.test('shell#attachSurface (runonce)', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 401);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 401, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 401)',
            filepath: 'test/original/testShell.js',
            line: 105
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLCanvasElement)',
            filepath: 'test/original/testShell.js',
            line: 106
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').height, 'arguments/0/left') === 445, 'arguments/0'), {
            content: 'assert.ok(srf.element.height === 445)',
            filepath: 'test/original/testShell.js',
            line: 107
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').width, 'arguments/0/left') === 182, 'arguments/0'), {
            content: 'assert.ok(srf.element.width === 182)',
            filepath: 'test/original/testShell.js',
            line: 108
        }));
        setPictureFrame(srf, '\u203B寝ぼけ\u3002runonce口に手を当ててから直ぐ離し目パチ\u3002');
    });
    QUnit.test('shell#attachSurface ', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 11);
        console.log(srf);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 11, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 11)',
            filepath: 'test/original/testShell.js',
            line: 116
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLCanvasElement)',
            filepath: 'test/original/testShell.js',
            line: 117
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').height, 'arguments/0/left') === 210, 'arguments/0'), {
            content: 'assert.ok(srf.element.height === 210)',
            filepath: 'test/original/testShell.js',
            line: 118
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').width, 'arguments/0/left') === 230, 'arguments/0'), {
            content: 'assert.ok(srf.element.width === 230)',
            filepath: 'test/original/testShell.js',
            line: 119
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object/object/object').surfaceTreeNode, 'arguments/0/left/object/object/object').collisions, 'arguments/0/left/object/object')[0], 'arguments/0/left/object').name, 'arguments/0/left') === 'Screen', 'arguments/0'), {
            content: 'assert.ok(srf.surfaceTreeNode.collisions[0].name === "Screen")',
            filepath: 'test/original/testShell.js',
            line: 120
        }));
        setInterval(function () {
            srf.talk();
        }, 80);
        setPictureFrame(srf, 'CRTゅう');
    });
    QUnit.test('shell#attachSurface (srf.play())', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 5000);
        srf.play(100);
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 5000, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 5000)',
            filepath: 'test/original/testShell.js',
            line: 129
        }));
        setPictureFrame(srf, '\u203B１回のみ爆発アニメ\u3002');
    });
    QUnit.test('shell#attachSurface (error filepath handle)', function (assert) {
        var cnv = document.createElement('canvas');
        var srf = shell.attachSurface(cnv, 0, 5001);
        srf.render();
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').surfaceId, 'arguments/0/left') === 5001, 'arguments/0'), {
            content: 'assert.ok(srf.surfaceId === 5001)',
            filepath: 'test/original/testShell.js',
            line: 137
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object').element, 'arguments/0/left') instanceof assert._capt(HTMLCanvasElement, 'arguments/0/right'), 'arguments/0'), {
            content: 'assert.ok(srf.element instanceof HTMLCanvasElement)',
            filepath: 'test/original/testShell.js',
            line: 138
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').height, 'arguments/0/left') === 300, 'arguments/0'), {
            content: 'assert.ok(srf.element.height === 300)',
            filepath: 'test/original/testShell.js',
            line: 139
        }));
        assert.ok(assert._expr(assert._capt(assert._capt(assert._capt(assert._capt(srf, 'arguments/0/left/object/object').element, 'arguments/0/left/object').width, 'arguments/0/left') === 300, 'arguments/0'), {
            content: 'assert.ok(srf.element.width === 300)',
            filepath: 'test/original/testShell.js',
            line: 140
        }));
        setPictureFrame(srf, '\u203B透明です\u3002ファイル名エラー補正のテスト\u3002');
    });
    function setPictureFrame(srf, description) {
        var fieldset = document.createElement('fieldset');
        var legend = document.createElement('legend');
        var p = document.createElement('p');
        legend.appendChild(document.createTextNode('' + srf.surfaceId));
        p.appendChild(document.createTextNode(description || ''));
        fieldset.appendChild(legend);
        fieldset.appendChild(srf.element);
        fieldset.appendChild(p);
        fieldset.style.display = 'inline-block';
        fieldset.style.width = '310px';
        document.body.appendChild(fieldset);
        srf.element.addEventListener('mousemove', function (ev) {
            var pageX = ev.pageX, pageY = ev.pageY;
            var tmp = $(ev.target).offset();
            var left = tmp.left, top = tmp.top;
            var offsetX = pageX - left;
            var offsetY = pageY - top;
            var hit = srf.getRegion(offsetX, offsetY);
            if (hit.isHit) {
                $(ev.target).css({ 'cursor': 'pointer' });
            } else {
                $(ev.target).css({ 'cursor': 'default' });
            }
        });
    }
});