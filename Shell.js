// Generated by CoffeeScript 1.7.1
(function() {
  var $, Nar, Promise, Shell, Surface, SurfaceUtil, SurfacesTxt2Yaml, URL, _, _ref, _ref1, _ref2;

  _ = window["_"];

  $ = window["Zepto"];

  SurfacesTxt2Yaml = window["SurfacesTxt2Yaml"];

  Nar = window["Nar"] || ((_ref = window["Ikagaka"]) != null ? _ref["Nar"] : void 0) || require("ikagaka.nar.js");

  Surface = window["Surface"] || ((_ref1 = window["Ikagaka"]) != null ? _ref1["Surface"] : void 0) || require("./Surface.js");

  SurfaceUtil = window["SurfaceUtil"] || ((_ref2 = window["Ikagaka"]) != null ? _ref2["SurfaceUtil"] : void 0) || require("./SurfaceUtil.js");

  Promise = window["Promise"];

  URL = window["URL"];

  Shell = (function() {
    function Shell(directory) {
      if (!directory["descript.txt"]) {
        throw new Error("descript.txt not found");
      }
      this.directory = directory;
      this.descript = Nar.parseDescript(Nar.convert(this.directory["descript.txt"].asArrayBuffer()));
      this.surfaces = null;
    }

    Shell.prototype.load = function(callback) {
      var buffer, mergedSurfaces, surfaces, surfacesTxt;
      if (!!this.directory["surfaces.txt"]) {
        buffer = this.directory["surfaces.txt"].asArrayBuffer();
        surfacesTxt = Nar.convert(buffer);
        surfaces = Shell.parseSurfaces(surfacesTxt);
      } else {
        surfaces = {
          "surfaces": {}
        };
      }
      mergedSurfaces = Shell.mergeSurfacesAndSurfacesFiles(surfaces, this.directory);
      return Shell.loadSurfaces(mergedSurfaces, (function(_this) {
        return function(err, loadedSurfaces) {
          return Shell.loadElements(loadedSurfaces, _this.directory, function(err, loadedElmSurfaces) {
            if (!!err) {
              return callback(err);
            }
            _this.surfaces = Shell.createBases(loadedElmSurfaces);
            delete _this.directory;
            return callback(null);
          });
        };
      })(this));
    };

    Shell.prototype.attachSurface = function(canvas, scopeId, surfaceId, callback) {
      var hits, srfs, type, _ref3, _ref4, _surfaceId;
      if (callback == null) {
        callback = function() {};
      }
      type = scopeId === 0 ? "sakura" : "kero";
      if (Array.isArray((_ref3 = this.surfaces.aliases) != null ? (_ref4 = _ref3[type]) != null ? _ref4[surfaceId] : void 0 : void 0)) {
        _surfaceId = SurfaceUtil.choice(this.surfaces.aliases[type][surfaceId]);
      } else {
        _surfaceId = surfaceId;
      }
      srfs = this.surfaces.surfaces;
      hits = Object.keys(srfs).filter(function(name) {
        return srfs[name].is === _surfaceId;
      });
      if (hits.length === 0) {
        return null;
      }
      return new Surface(canvas, scopeId, hits[0], this.surfaces, callback);
    };

    Shell.createBases = function(surfaces) {
      var srfs;
      srfs = surfaces.surfaces;
      Object.keys(srfs).forEach(function(name) {
        var baseSurface, cnv, elms, sortedElms, srfutil;
        if (!srfs[name].baseSurface) {
          cnv = document.createElement("canvas");
          cnv.width = 0;
          cnv.height = 0;
          srfs[name].baseSurface = cnv;
        }
        if (!srfs[name].elements) {
          return;
        }
        elms = srfs[name].elements;
        sortedElms = Object.keys(elms).map(function(key) {
          return {
            is: elms[key].is,
            x: elms[key].x,
            y: elms[key].y,
            canvas: elms[key].canvas,
            type: elms[key].type
          };
        }).sort(function(elmA, elmB) {
          if (elmA.is > elmB.is) {
            return 1;
          } else {
            return -1;
          }
        });
        baseSurface = sortedElms[0].canvas || srfs[name].baseSurface;
        srfutil = new SurfaceUtil(baseSurface);
        srfutil.composeElements(sortedElms);
        srfs[name].baseSurface = baseSurface;
        return delete srfs[name].file;
      });
      return surfaces;
    };

    Shell.loadSurfaces = function(surfaces, callback) {
      var promises, srfs;
      srfs = surfaces.surfaces;
      promises = Object.keys(srfs).filter(function(name) {
        return !!srfs[name].file;
      }).map(function(name) {
        return new Promise(function(resolve, reject) {
          return setTimeout(function() {
            var buffer, url;
            buffer = srfs[name].file.asArrayBuffer();
            url = URL.createObjectURL(new Blob([buffer], {
              type: "image/png"
            }));
            return SurfaceUtil.loadImage(url, function(err, img) {
              URL.revokeObjectURL(url);
              if (!!err) {
                return reject(err);
              }
              srfs[name].baseSurface = SurfaceUtil.transImage(img);
              return resolve();
            });
          });
        });
      });
      Promise.all(promises).then(function() {
        return callback(null, surfaces);
      })["catch"](function(err) {
        console.error(err, err.stack);
        return callback(err, null);
      });
      return void 0;
    };

    Shell.loadElements = function(surfaces, directory, callback) {
      var promises, srfs;
      srfs = surfaces.surfaces;
      promises = Object.keys(srfs).filter(function(name) {
        return !!srfs[name].elements;
      }).reduce((function(arr, srfName) {
        return arr.concat(Object.keys(srfs[srfName].elements).map(function(elmName) {
          var elm;
          elm = srfs[srfName].elements[elmName];
          return new Promise(function(resolve, reject) {
            return setTimeout(function() {
              var buffer, file, hits, type, url, x, y, _file;
              type = elm.type, file = elm.file, x = elm.x, y = elm.y;
              hits = Object.keys(directory).filter(function(path) {
                var a, b;
                a = path.toLowerCase();
                b = file.toLowerCase();
                return a === b || a === b + ".png".toLowerCase();
              });
              if (hits.length === 0) {
                return reject(new Error("element " + file + " is not found"));
              }
              _file = hits[hits.length - 1];
              buffer = (directory[_file] || directory[_file + ".png"]).asArrayBuffer();
              url = URL.createObjectURL(new Blob([buffer], {
                type: "image/png"
              }));
              return SurfaceUtil.loadImage(url, function(err, img) {
                URL.revokeObjectURL(url);
                if (!!err) {
                  return reject(err.error);
                }
                elm.canvas = SurfaceUtil.transImage(img);
                return resolve();
              });
            });
          });
        }));
      }), []);
      Promise.all(promises).then(function() {
        return callback(null, surfaces);
      })["catch"](function(err) {
        console.error(err, err.stack);
        return callback(err, null);
      });
      return void 0;
    };

    Shell.mergeSurfacesAndSurfacesFiles = function(surfaces, directory) {
      var srfs;
      srfs = surfaces.surfaces;
      return Object.keys(directory).filter(function(filename) {
        return /^surface\d+\.png$/i.test(filename);
      }).map(function(filename) {
        return [Number((/^surface(\d+)\.png$/i.exec(filename) || ["", "-1"])[1]), directory[filename]];
      }).reduce((function(surfaces, _arg) {
        var cnv, file, n, name;
        n = _arg[0], file = _arg[1];
        name = "surface" + n;
        if (!srfs[name]) {
          srfs[name] = {
            is: n
          };
        }
        srfs[name].file = file;
        cnv = document.createElement("canvas");
        cnv.width = 0;
        cnv.height = 0;
        srfs[name].baseSurface = cnv;
        return surfaces;
      }), surfaces);
    };

    Shell.parseSurfaces = function(text) {
      var data;
      data = SurfacesTxt2Yaml.txt_to_data(text, {
        compatible: 'ssp-lazy'
      });
      data.surfaces = Object.keys(data.surfaces).reduce((function(obj, name) {
        if (typeof data.surfaces[name].is !== "undefined") {
          obj[name] = data.surfaces[name];
        }
        if (Array.isArray(data.surfaces[name].base)) {
          data.surfaces[name].base.forEach(function(key) {
            return $.extend(true, data.surfaces[name], data.surfaces[key]);
          });
        }
        return obj;
      }), {});
      return data;
    };

    return Shell;

  })();

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Shell;
  } else if (this.Ikagaka != null) {
    this.Ikagaka.Shell = Shell;
  } else {
    this.Shell = Shell;
  }

}).call(this);
