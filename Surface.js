// Generated by CoffeeScript 1.8.0
(function() {
  var $, Promise, Surface, SurfaceUtil, _, _ref;

  $ = this.Zepto;

  _ = this._;

  SurfaceUtil = this.SurfaceUtil || ((_ref = this.Ikagaka) != null ? _ref["SurfaceUtil"] : void 0) || require("./SurfaceUtil.js");

  Promise = this.Promise;

  Surface = (function() {
    function Surface(element, scopeId, surfaceName, surfaces) {
      var keys, srf;
      this.element = element;
      this.scopeId = scopeId;
      this.surfaceName = surfaceName;
      this.surfaces = surfaces;
      srf = this.surfaces.surfaces[surfaceName];
      this.baseSurface = srf.baseSurface;
      this.regions = srf.regions || {};
      this.animations = srf.animations || {};
      this.bufferCanvas = SurfaceUtil.copy(this.baseSurface || document.createElement("canvas"));
      this.stopFlags = {};
      this.layers = {};
      this.destructed = false;
      this.talkCount = 0;
      this.talkCounts = {};
      this.isPointerEventsShimed = false;
      this.lastEventType = "";
      $(this.element).on("contextmenu", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mouseclick", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      $(this.element).on("click", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mouseclick", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      $(this.element).on("dblclick", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mousedblclick", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      $(this.element).on("mousedown", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mousedown", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      $(this.element).on("mousemove", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mousemove", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      $(this.element).on("mouseup", (function(_this) {
        return function(ev) {
          return _this.processMouseEvent(ev, "mouseup", function($ev) {
            return $(_this.element).trigger($ev);
          });
        };
      })(this));
      (function(_this) {
        return (function() {
          var tid, touchCount, touchStartTime;
          tid = 0;
          touchCount = 0;
          touchStartTime = 0;
          $(_this.element).on("touchmove", function(ev) {
            return _this.processMouseEvent(ev, "mousemove", function($ev) {
              return $(_this.element).trigger($ev);
            });
          });
          $(_this.element).on("touchend", function(ev) {
            _this.processMouseEvent(ev, "mouseup", function($ev) {
              return $(_this.element).trigger($ev);
            });
            _this.processMouseEvent(ev, "mouseclick", function($ev) {
              return $(_this.element).trigger($ev);
            });
            if (Date.now() - touchStartTime < 500 && touchCount % 2 === 0) {
              return _this.processMouseEvent(ev, "mousedblclick", function($ev) {
                return $(_this.element).trigger($ev);
              });
            }
          });
          return $(_this.element).on("touchstart", function(ev) {
            touchCount++;
            touchStartTime = Date.now();
            _this.processMouseEvent(ev, "mousedown", function($ev) {
              return $(_this.element).trigger($ev);
            });
            clearTimeout(tid);
            return tid = setTimeout((function() {
              return touchCount = 0;
            }), 500);
          });
        });
      })(this)();
      keys = Object.keys(this.animations);
      keys.forEach((function(_this) {
        return function(name) {
          var animationId, interval, n, pattern, tmp, _is, _ref1;
          _ref1 = _this.animations[name], _is = _ref1.is, interval = _ref1.interval, pattern = _ref1.pattern;
          animationId = _is;
          interval = interval || "";
          tmp = interval.split(",");
          interval = tmp[0];
          n = Number(tmp.slice(1).join(","));
          switch (interval) {
            case "sometimes":
              return Surface.random((function(callback) {
                if (!_this.destructed && !_this.stopFlags[animationId]) {
                  return _this.play(animationId, callback);
                }
              }), 2);
            case "rarely":
              return Surface.random((function(callback) {
                if (!_this.destructed && !_this.stopFlags[animationId]) {
                  return _this.play(animationId, callback);
                }
              }), 4);
            case "random":
              return Surface.random((function(callback) {
                if (!_this.destructed && !_this.stopFlags[animationId]) {
                  return _this.play(animationId, callback);
                }
              }), n);
            case "periodic":
              return Surface.periodic((function(callback) {
                if (!_this.destructed && !_this.stopFlags[animationId]) {
                  return _this.play(animationId, callback);
                }
              }), n);
            case "always":
              return Surface.always(function(callback) {
                if (!_this.destructed && !_this.stopFlags[animationId]) {
                  return _this.play(animationId, callback);
                }
              });
            case "runonce":
              return _this.play(animationId);
            case "never":
              break;
            case "bind":
              break;
            case "yen-e":
              break;
            case "talk":
              return _this.talkCounts[name] = n;
            default:
              if (/^bind(?:\+(\d+))/.test(interval)) {

              } else {
                return console.error(_this.animations[name]);
              }
          }
        };
      })(this));
      this.render();
    }

    Surface.prototype.destructor = function() {
      SurfaceUtil.clear(this.element);
      $(this.element).off();
      this.destructed = true;
      this.layers = {};
    };

    Surface.prototype.yenE = function() {
      var hits, keys;
      keys = Object.keys(this.animations);
      hits = keys.filter((function(_this) {
        return function(name) {
          return _this.animations[name].interval === "yen-e" && _this.talkCount % _this.talkCounts[name] === 0;
        };
      })(this));
      hits.forEach((function(_this) {
        return function(name) {
          return _this.play(_this.animations[name].is);
        };
      })(this));
    };

    Surface.prototype.talk = function() {
      var hits, keys;
      this.talkCount++;
      keys = Object.keys(this.animations);
      hits = keys.filter((function(_this) {
        return function(name) {
          return /^talk/.test(_this.animations[name].interval) && _this.talkCount % _this.talkCounts[name] === 0;
        };
      })(this));
      hits.forEach((function(_this) {
        return function(name) {
          return _this.play(_this.animations[name].is);
        };
      })(this));
    };

    Surface.prototype.render = function() {
      var base, keys, mapped, patterns, sorted, srfs, util, util2;
      srfs = this.surfaces.surfaces;
      keys = Object.keys(this.layers);
      sorted = keys.sort(function(layerNumA, layerNumB) {
        if (Number(layerNumA) > Number(layerNumB)) {
          return 1;
        } else {
          return -1;
        }
      });
      mapped = sorted.map((function(_this) {
        return function(key) {
          return _this.layers[key];
        };
      })(this));
      patterns = mapped.reduce(((function(_this) {
        return function(arr, pat) {
          var hit, surface, type, x, y;
          surface = pat.surface, type = pat.type, x = pat.x, y = pat.y;
          if (surface === -1) {
            return arr;
          }
          keys = Object.keys(srfs);
          hit = keys.find(function(key) {
            return srfs[key].is === surface;
          });
          if (!hit) {
            return arr;
          }
          return arr.concat({
            type: type,
            x: x,
            y: y,
            canvas: srfs[hit].baseSurface
          });
        };
      })(this)), []);
      SurfaceUtil.clear(this.bufferCanvas);
      util = new SurfaceUtil(this.bufferCanvas);
      if (!!this.baseSurface || patterns.length > 0) {
        base = this.baseSurface || patterns[0].canvas;
        util.composeElements([
          {
            "type": "base",
            "canvas": base
          }
        ].concat(patterns));
        SurfaceUtil.clear(this.element);
        util2 = new SurfaceUtil(this.element);
        util2.init(this.bufferCanvas);
      }
    };

    Surface.prototype.play = function(animationId, callback) {
      var anim, hit, keys, lazyPromises, promise;
      if (callback == null) {
        callback = function() {};
      }
      keys = Object.keys(this.animations);
      hit = keys.find((function(_this) {
        return function(name) {
          return _this.animations[name].is === animationId;
        };
      })(this));
      if (!hit) {
        setTimeout(callback);
        return;
      }
      anim = this.animations[hit];
      lazyPromises = anim.patterns.map((function(_this) {
        return function(pattern) {
          return function() {
            return new Promise(function(resolve, reject) {
              var a, animation_ids, b, surface, type, wait, __, _animId, _ref1;
              surface = pattern.surface, wait = pattern.wait, type = pattern.type, animation_ids = pattern.animation_ids;
              if (/^start/.test(type)) {
                _animId = SurfaceUtil.choice(animation_ids);
                if (!!_this.animations[_animId]) {
                  _this.play(_this.animations[_animId].is, function() {
                    return resolve();
                  });
                  return;
                }
              }
              if (/^stop\,\d+/.test(type)) {
                _animId = SurfaceUtil.choice(animation_ids);
                if (!!_this.animations[_animId]) {
                  _this.play(_this.animations[_animId].is, function() {
                    return resolve();
                  });
                  return;
                }
              }
              if (/^alternativestart/.test(type)) {
                _animId = SurfaceUtil.choice(animation_ids);
                if (!!_this.animations[_animId]) {
                  _this.play(_this.animations[_animId].is, function() {
                    return resolve();
                  });
                  return;
                }
              }
              if (/^alternativestop/.test(type)) {
                _animId = SurfaceUtil.choice(animation_ids);
                if (!!_this.animations[_animId]) {
                  _this.play(_this.animations[_animId].is, function() {
                    return resolve();
                  });
                  return;
                }
              }
              _this.layers[anim.is] = pattern;
              _this.render();
              _ref1 = /(\d+)(?:\-(\d+))?/.exec(wait) || ["", "0"], __ = _ref1[0], a = _ref1[1], b = _ref1[2];
              if (!!b) {
                wait = _.random(Number(a), Number(b));
              }
              return setTimeout((function() {
                if (_this.destructed) {
                  return reject();
                } else {
                  return resolve();
                }
              }), wait);
            });
          };
        };
      })(this));
      promise = lazyPromises.reduce((function(proA, proB) {
        return proA.then(proB);
      }), Promise.resolve());
      promise.then((function(_this) {
        return function() {
          return setTimeout(callback);
        };
      })(this))["catch"](function(err) {
        if (!!err) {
          return console.error(err.stack);
        }
      });
    };

    Surface.prototype.stop = function(animationId) {
      this.stopFlags[animationId] = true;
    };

    Surface.prototype.bind = function(animationId) {
      var anim, animIds, hit, interval, keys, pattern;
      keys = Object.keys(this.animations);
      hit = keys.find((function(_this) {
        return function(name) {
          return _this.animations[name].is === animationId;
        };
      })(this));
      if (!hit) {
        return;
      }
      anim = this.animations[hit];
      if (anim.patterns.length === 0) {
        return;
      }
      interval = anim.interval;
      pattern = anim.patterns[anim.patterns.length - 1];
      this.layers[anim.is] = pattern;
      this.render();
      if (/^bind(?:\+(\d+))/.test(interval)) {
        animIds = interval.split("+").slice(1);
        animIds.forEach((function(_this) {
          return function(animId) {
            return _this.play(animId, function() {});
          };
        })(this));
      }
    };

    Surface.prototype.unbind = function(animationId) {
      delete this.layers[animationId];
    };

    Surface.prototype.processMouseEvent = function(ev, eventName, callback) {
      var detail, elm, hit, keys, left, offsetX, offsetY, pageX, pageY, sorted, top, touches, _ev, _ref1, _ref2;
      $(ev.target).css({
        "cursor": "default"
      });
      if (this.isPointerEventsShimed && ev.type === this.lastEventType) {
        this.lastEventType = "";
        this.isPointerEventsShimed = false;
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }
      if (/^touch/.test(ev.type)) {
        _ref1 = ev.changedTouches[0], pageX = _ref1.pageX, pageY = _ref1.pageY;
      } else {
        pageX = ev.pageX, pageY = ev.pageY;
      }
      _ref2 = $(ev.target).offset(), left = _ref2.left, top = _ref2.top;
      offsetX = pageX - left;
      offsetY = pageY - top;
      if (Surface.isHit(ev.target, offsetX, offsetY)) {
        ev.preventDefault();
        detail = {
          "type": eventName,
          "offsetX": offsetX | 0,
          "offsetY": offsetY | 0,
          "wheel": 0,
          "scope": this.scopeId,
          "region": "",
          "button": (ev.button === 2 ? 1 : 0)
        };
        keys = Object.keys(this.regions);
        sorted = keys.sort(function(a, b) {
          if (a.is > b.is) {
            return 1;
          } else {
            return -1;
          }
        });
        hit = sorted.find((function(_this) {
          return function(name) {
            var bottom, right, _ref3;
            _ref3 = _this.regions[name], name = _ref3.name, left = _ref3.left, top = _ref3.top, right = _ref3.right, bottom = _ref3.bottom;
            return ((left < offsetX && offsetX < right) && (top < offsetY && offsetY < bottom)) || ((right < offsetX && offsetX < left) && (bottom < offsetY && offsetY < top));
          };
        })(this));
        if (!!hit) {
          if (/^touch/.test(ev.type)) {
            ev.stopPropagation();
          }
          detail["region"] = this.regions[hit].name;
          $(ev.target).css({
            "cursor": "pointer"
          });
        }
        callback($.Event('IkagakaDOMEvent', {
          detail: detail,
          bubbles: true
        }));
      } else {
        elm = Surface.isHitBubble(ev.target, ev.pageX, ev.pageY);
        if (!elm) {
          return;
        }
        if (/^mouse/.test(ev.type)) {
          this.isPointerEventsShimed = true;
          this.lastEventType = ev.type;
          ev.preventDefault();
          ev.stopPropagation();
          _ev = document.createEvent("MouseEvent");
          if (typeof _ev.initMouseEvent === "function") {
            _ev.initMouseEvent(ev.type, ev.bubbles, ev.cancelable, ev.view, ev.detail, ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.button, ev.relatedTarget);
          }
          elm.dispatchEvent(_ev);
        } else if (/^touch/.test(ev.type) && !!document.createTouchList) {
          this.isPointerEventsShimed = true;
          this.lastEventType = ev.type;
          ev.preventDefault();
          ev.stopPropagation();
          touches = document.createTouchList();
          touches[0] = document.createTouch(document.body, ev.target, 0, ev.pageX, ev.pageY, ev.screenX, ev.screenY, ev.clientX, ev.clientY, 1, 1, 0, 1.0);
          _ev = document.createEvent("TouchEvent");
          _ev.initTouchEvent(touches, touches, touches, ev.type, ev.view, ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey);
          elm.dispatchEvent(_ev);
        }
      }
    };

    Surface.random = function(callback, n) {
      var ms;
      ms = 1;
      while (Math.round(Math.random() * 1000) > 1000 / n) {
        ms++;
      }
      setTimeout((function() {
        return callback(function() {
          return Surface.random(callback, n);
        });
      }), ms * 1000);
    };

    Surface.periodic = function(callback, n) {
      setTimeout((function() {
        return callback(function() {
          return Surface.periodic(callback, n);
        });
      }), n * 1000);
    };

    Surface.always = function(callback) {
      callback(function() {
        return Surface.always(callback);
      });
    };

    Surface.isHit = function(canvas, x, y) {
      var ctx, data, imgdata;
      ctx = canvas.getContext("2d");
      imgdata = ctx.getImageData(0, 0, x + 1, y + 1);
      data = imgdata.data;
      return data[data.length - 1] !== 0;
    };

    Surface.isHitBubble = function(element, pageX, pageY) {
      var elm, left, top, _elm, _ref1;
      $(element).hide();
      elm = document.elementFromPoint(pageX, pageY);
      if (!elm) {
        $(element).show();
        return elm;
      }
      if (!(elm instanceof HTMLCanvasElement)) {
        $(element).show();
        return elm;
      }
      _ref1 = $(elm).offset(), top = _ref1.top, left = _ref1.left;
      if (Surface.isHit(elm, pageX - left, pageY - top)) {
        $(element).show();
        return elm;
      }
      _elm = Surface.isHitBubble(elm, pageX, pageY);
      $(element).show();
      return _elm;
    };

    return Surface;

  })();

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Surface;
  } else if (this.Ikagaka != null) {
    this.Ikagaka.Surface = Surface;
  } else {
    this.Surface = Surface;
  }

}).call(this);
