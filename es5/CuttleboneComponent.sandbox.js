"use strict";
var CC = require("./CuttleboneComponent");
var React = require('react');
var ReactDOM = require('react-dom');
var narloader = require("narloader");
var $ = require("jquery");
var NL = narloader.NarLoader;
$(function () {
    var content = $("<div />").attr("id", "content").appendTo("body")[0];
    ReactDOM.render(React.createElement(CC.LayerSet, {
        style: { width: "500px", height: "500px", border: "1px solid" },
        layers: [
            { style: { border: "1px solid" }, width: 100, height: 100, basisX: "left", basisY: "bottom", x: 100, y: 100, content: "hi" },
            { style: { border: "1px solid" }, width: 100, height: 100, basisX: "left", basisY: "bottom", x: 150, y: 100, content: "hei" }
        ]
    }), content);
});
