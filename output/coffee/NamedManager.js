// Generated by CoffeeScript 1.9.2
(function() {
  cuttlebone.NamedManager = (function() {
    function NamedManager() {
      var $style;
      this.$namedMgr = $("<div />").addClass("namedMgr");
      $style = $("<style scoped />").html(this.style);
      this.$namedMgr.append($style);
      this.element = this.$namedMgr[0];
      this.namedies = [];
      this.destructors = [];
      (function(_this) {
        return (function() {
          var onmousedown;
          onmousedown = function(ev) {
            return setTimeout((function() {
              return _this.$namedMgr.append(ev.currentTarget);
            }), 300);
          };
          _this.$namedMgr.on("mousedown", ".named", onmousedown);
          _this.$namedMgr.on("touchstart", ".named", onmousedown);
          return _this.destructors.push(function() {
            _this.$namedMgr.off("mousedown", ".named", onmousedown);
            return _this.$namedMgr.off("touchstart", ".named", onmousedown);
          });
        });
      })(this)();
    }

    NamedManager.prototype.destructor = function() {
      this.namedies.filter(function(named) {
        return named != null;
      }).forEach(function(named) {
        return $(named.element).remove();
      });
      this.destructors.forEach(function(destructor) {
        return destructor();
      });
      this.$namedMgr.remove();
    };

    NamedManager.prototype.materialize = function(shell, balloon) {
      var named;
      named = new cuttlebone.Named(shell, balloon);
      this.namedies.push(named);
      this.$namedMgr.append(named.element);
      return this.namedies.length - 1;
    };

    NamedManager.prototype.vanish = function(namedId) {
      if (this.namedies[namedId] == null) {
        throw new Error("namedId " + namedId + " is not used yet");
      }
      this.namedies[namedId].destructor();
      this.namedies[namedId] = null;
    };

    NamedManager.prototype.named = function(namedId) {
      if (this.namedies[namedId] == null) {
        throw new Error("namedId " + namedId + " is not used yet");
      }
      return this.namedies[namedId];
    };

    NamedManager.prototype.style = ".scope {\n  position: absolute;\n  pointer-events: none;\n  user-select: none;\n  -webkit-tap-highlight-color: transparent;\n}\n.surface {\n}\n.surfaceCanvas {\n  pointer-events: auto;\n}\n.blimp {\n  position: absolute;\n  top: 0px;\n  left: 0px;\n  pointer-events: auto;\n}\n.blimpCanvas {\n  position: absolute;\n  top: 0px;\n  left: 0px;\n}\n.blimpText {\n  position: absolute;\n  top: 0px;\n  left: 0px;\n  overflow-y: scroll;\n  white-space: pre-wrap;\n  word-wrap: break-all;\n}\n.blimpText a {\n  cursor: pointer;\n}\n\n@keyframes blink {\n  75% { opacity: 0.0; }\n}\n.blink {\n  animation: blink 1s step-end infinite;\n}";

    return NamedManager;

  })();

}).call(this);
