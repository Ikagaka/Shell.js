// Generated by CoffeeScript 1.7.1
var BalloonSurface;

BalloonSurface = (function() {
  var SurfaceUtil;

  SurfaceUtil = window["SurfaceUtil"];

  function BalloonSurface(element, scopeId, surfaceId, balloons) {
    this.element = element;
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.balloons = balloons;
    $(this.element).on("click", (function(_this) {
      return function(ev) {
        return $(_this.element).trigger($.Event('IkagakaBalloonEvent', {
          detail: {
            ID: "OnBallonClick"
          },
          bubbles: true
        }));
      };
    })(this));
    this.render();
  }

  BalloonSurface.prototype.destructor = function() {
    $(this.element).off();
    return void 0;
  };

  BalloonSurface.prototype.render = function() {
    var type, util;
    type = this.scopeId === 0 ? "sakura" : "kero";
    util = new SurfaceUtil(this.element);
    util.init(this.balloons[type][this.surfaceId].canvas);
    return void 0;
  };

  return BalloonSurface;

})();
