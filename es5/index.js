/// <reference path="../typings/index.d.ts"/>
"use strict";

var _CanvasCache = require("./CanvasCache");
var _SurfaceRender = require("./SurfaceRender");
var _SurfaceUtil = require("./SurfaceUtil");
var _SurfaceTree = require("./SurfaceTree");
var _Surface = require('./Surface');
var _ShellConfig = require("./ShellConfig");
var _Shell = require("./Shell");
var _package = require("../package.json");
exports.CanvasCache = _CanvasCache;
exports.SurfaceRender = _SurfaceRender;
exports.SurfaceUtil = _SurfaceUtil;
exports.SurfaceTree = _SurfaceTree;
exports.Surface = _Surface;
exports.ShellConfig = _ShellConfig;
exports.Shell = _Shell;
exports.version = _package.version;
var $ = require("jquery");
window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;