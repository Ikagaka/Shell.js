"use strict";
var CC = require("./CuttleboneComponent");
var React = require('react');
var ReactDOM = require('react-dom');
var narloader = require("narloader");
var $ = require("jquery");
var NL = narloader.NarLoader;
$(function () {
    $("body").attr("id", "content");
    ReactDOM.render(React.createElement(CC.Cuttlebone, { style: { width: "500px", height: "500px", border: "1px solid" } }), document.getElementById("content"));
});
