"use strict";
var SPR = require("./SurfacePatternRenderer");
var SU = require("./SurfaceUtil");
var SM = require("./SurfaceModel");
var SHS = require("./ShellState");
var SS = require("./SurfaceState");
var SML = require("./ShellModelLoader");
var SR = require("./SurfaceRenderer");
var narloader = require("narloader");
var NL = narloader.NarLoader;
NL.loadFromURL("../nar/mobilemaster.nar")
    .then(function (dir) { return dir.getDirectory("shell/master").asArrayBuffer(); })
    .then(function (dic) { return SML.load(dic); })
    .then(function (shell) {
    console.log(shell);
    // 当たり判定表示
    shell.config.enableRegion = true;
    var rndr = new SPR.SurfacePatternRenderer(shell);
    // 
    rndr.debug = true;
    // プリロードすると安心だけど重い
    return rndr.preload().then(function () {
        var surfaceId = 7;
        // まずベースサーフェスサイズを取得
        rndr.getBaseSurfaceSize(surfaceId).then(function (_a) {
            var width = _a.width, height = _a.height;
            var surface = new SM.Surface(0, surfaceId, width, height, shell);
            var shellState = new SHS.ShellState(shell, console.info.bind(console, "shell state update:"));
            var srfState = new SS.SurfaceState(surface, function render(ev, surface) {
                return rndr.render(surface).then(function (srfcnv) { return rndr2.base(srfcnv); });
            });
            console.log(srfState);
            srfState.debug = true;
            SU.setCanvasStyle();
            var rndr2 = new SR.SurfaceRenderer();
            document.body.appendChild(rndr2.cnv);
            // 初回描画
            return srfState.render().then(function () {
                rndr2.base(rndr);
            });
        });
    });
}).catch(console.error.bind(console));
