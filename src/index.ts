import _Balloon from "./Balloon";
import _BalloonSurface from "./BalloonSurface";

var _package = require("../package.json");

export var version = _package.version;
export var Balloon = _Balloon;
export var Blimp = _BalloonSurface;

import $ = require("jquery");
window["$"] = window["$"] || $;
window["jQuery"] = window["jQuery"] || $;
