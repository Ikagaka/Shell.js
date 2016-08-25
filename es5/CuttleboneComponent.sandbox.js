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
    rndr.debug = true;
    // return rndr.preload().then(function(){
    // });
    $(function () {
        var content = $("<div />").attr("id", "content").appendTo("body")[0];
        var cuttleboneStyle = {
            display: "block", position: "fixed",
            boxSizing: "border-box",
            bottom: "0px", right: "0px",
            height: "100%", width: "100%"
        };
        ReactDOM.render((React.createElement("div", {className: "cuttlebone", style: cuttleboneStyle}, 
            React.createElement(CC.Named, {shell: shell, renderer: rndr})
        )), content);
    });
}).catch(console.error.bind(console));
