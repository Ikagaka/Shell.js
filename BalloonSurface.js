// Generated by CoffeeScript 1.7.1
var BalloonSurface, SurfaceUtil, _ref, _ref1, _ref2;

SurfaceUtil = ((_ref = this.Shell) != null ? _ref.SurfaceUtil : void 0) || ((_ref1 = this.Ikagaka) != null ? (_ref2 = _ref1["Shell"]) != null ? _ref2.SurfaceUtil : void 0 : void 0) || require("ikagaka.shell.js").SurfaceUtil;

BalloonSurface = (function() {
  function BalloonSurface(element, scopeId, balloonConf, balloons) {
    this.element = element;
    this.scopeId = scopeId;
    this.balloons = balloons;
    this.descript = balloonConf.descript;
    this.baseCanvas = balloonConf.canvas;
    this.render();
  }

  BalloonSurface.prototype.destructor = function() {};

  BalloonSurface.prototype.render = function() {
    var type, util;
    type = this.scopeId === 0 ? "sakura" : "kero";
    util = new SurfaceUtil(this.element);
    util.init(this.baseCanvas);
  };

  return BalloonSurface;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = BalloonSurface;
} else if (this.Ikagaka != null) {
  this.Ikagaka.BalloonSurface = BalloonSurface;
} else {
  this.BalloonSurface = BalloonSurface;
}
