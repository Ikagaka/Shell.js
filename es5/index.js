/// <reference path="../typings/index.d.ts"/>
"use strict";

var SurfaceRender_1 = require("./SurfaceRender");
var _SurfaceUtil = require("./SurfaceUtil");
var _SurfaceTree = require("./SurfaceTree");
var Surface_1 = require('./Surface');
var _ShellConfig = require("./ShellConfig");
var Shell_1 = require("./Shell");
var _package = require("../package.json");
exports.SurfaceRender = SurfaceRender_1.default;
exports.SurfaceUtil = _SurfaceUtil;
exports.SurfaceTree = _SurfaceTree;
exports.Surface = Surface_1.default;
exports.ShellConfig = _ShellConfig;
exports.Shell = Shell_1.default;
exports.version = _package.version;
var $ = require("jquery");
window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;