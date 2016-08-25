"use strict";
var SML = require("./ShellModelLoader");
var SPR = require("./SurfacePatternRenderer");
var CC = require("./CuttleboneComponent");
var React = require('react');
var ReactDOM = require('react-dom');
var narloader = require("narloader");
var $ = require("jquery");
var NL = narloader.NarLoader;
NL.loadFromURL("../nar/mobilemaster.nar")
    .then(function (dir) { return dir.getDirectory("shell/master").asArrayBuffer(); })
    .then(function (dic) { return SML.load(dic); })
    .then(function (shell) {
    var rndr = new SPR.SurfacePatternRenderer(shell);
    // return rndr.preload().then(function(){
    // });
    $(function () {
        var content = $("<div />").attr("id", "content").appendTo("body")[0];
        ReactDOM.render((React.createElement(CC.Named, {shell: shell, renderer: rndr})), content);
    });
}).catch(console.error.bind(console));
