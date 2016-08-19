/// <reference path="../typings/index.d.ts"/>

import _CanvasCache from "./CanvasCache";
import _SurfaceRender from "./SurfaceRender";
import * as _SurfaceUtil from "./SurfaceUtil";
import * as _SurfaceTree from "./SurfaceTree";
import * as _Interfaces from "./Interfaces";
import _Surface from './Surface';
import * as _ShellConfig from "./ShellConfig";
import _Shell from "./Shell";

var _package = require("../package.json");

export var CanvasCache = _CanvasCache;
export var SurfaceRender = _SurfaceRender;
export var SurfaceUtil = _SurfaceUtil;
export var SurfaceTree = _SurfaceTree;
export var Surface = _Surface;
export var ShellConfig = _ShellConfig;
export var Shell = _Shell;
export var version = _package.version;
export var Interfaces = _Interfaces;


import $ = require("jquery");
window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;
