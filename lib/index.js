/// <reference path="../typings/index.d.ts"/>
"use strict";
const SurfaceRender_1 = require("./SurfaceRender");
const _SurfaceUtil = require("./SurfaceUtil");
const Surface_1 = require('./Surface');
const Shell_1 = require("./Shell");
const $ = require("jquery");
var _package = require("../package.json");
exports.SurfaceRender = SurfaceRender_1.default;
exports.SurfaceUtil = _SurfaceUtil;
exports.Surface = Surface_1.default;
exports.Shell = Shell_1.default;
exports.version = _package.version;
window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;
