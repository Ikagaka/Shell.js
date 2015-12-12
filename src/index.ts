/// <reference path="../typings/tsd.d.ts"/>

import _SurfaceRender from "./SurfaceRender";
import * as _SurfaceUtil from "./SurfaceUtil";
import * as _Interfaces from "./Interfaces";
import _Surface from './Surface';
import _Shell from "./Shell";
import $ = require("jquery");
var _package = require("../package.json");

export var SurfaceRender = _SurfaceRender;
export var SurfaceUtil = _SurfaceUtil;
export var Surface = _Surface;
export var Shell = _Shell;
export var version = _package.version;

window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;
