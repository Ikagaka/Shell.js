// Generated by CoffeeScript 1.7.1
var Named;

Named = (function() {
  var $, Scope, prompt, _ref;

  $ = window["jQuery"];

  Scope = window["Scope"] || ((_ref = window["Ikagaka"]) != null ? _ref["Scope"] : void 0) || require("./Scope.js");

  prompt = window["prompt"];

  function Named(shell, balloon) {
    this.shell = shell;
    this.balloon = balloon;
    this.$named = $("<div />").addClass("named");
    this.element = this.$named[0];
    this.scopes = [];
    this.scopes[0] = new Scope(0, this.shell, this.balloon);
    this.currentScope = this.scopes[0];
    this.destructors = [];
    (function(_this) {
      return (function() {
        var $body, $target, onmousedown, onmousemove, onmouseup, relLeft, relTop;
        $target = null;
        relLeft = relTop = 0;
        onmouseup = function(ev) {
          if (!!$target) {
            if ($(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")) {
              if ($target[0] === $(ev.target).parent()[0]) {
                return $target = null;
              }
            } else if ($(ev.target).hasClass("surfaceCanvas")) {
              if ($target[0] === $(ev.target).parent().parent()[0]) {
                return $target = null;
              }
            }
          }
        };
        onmousedown = function(ev) {
          var left, offsetX, offsetY, top, _ref1, _ref2, _target;
          if ($(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")) {
            $target = $(ev.target).parent();
            _ref1 = $target.offset(), top = _ref1.top, left = _ref1.left;
            offsetY = parseInt($target.css("left"), 10);
            offsetX = parseInt($target.css("top"), 10);
            relLeft = ev.pageX - offsetY;
            relTop = ev.pageY - offsetX;
          }
          if ($(ev.target).hasClass("surfaceCanvas")) {
            _target = $target = $(ev.target).parent().parent();
            _ref2 = $target.offset(), top = _ref2.top, left = _ref2.left;
            relLeft = ev.pageX - left;
            relTop = ev.pageY - top;
            return setTimeout((function() {
              return _this.$named.append(_target);
            }), 100);
          }
        };
        onmousemove = function(ev) {
          if (!!$target) {
            return $target.css({
              left: ev.pageX - relLeft,
              top: ev.pageY - relTop
            });
          }
        };
        $body = $("body");
        $body.on("mouseup", onmouseup);
        $body.on("mousedown", onmousedown);
        $body.on("mousemove", onmousemove);
        return _this.destructors.push(function() {
          $body.off("mouseup", onmouseup);
          $body.off("mousedown", onmousedown);
          return $body.off("mousemove", onmousemove);
        });
      });
    })(this)();
    (function(_this) {
      return (function() {
        var onblimpclick;
        onblimpclick = function(ev) {};
        _this.$named.on("click", ".blimp", onblimpclick);
        return _this.destructors.push(function() {
          return _this.$named.off("click", ".blimp", onblimpclick);
        });
      });
    })(this)();
    (function(_this) {
      return (function() {
        var onanchorclick, onchoiceclick;
        onanchorclick = function(ev) {
          var detail;
          detail = {
            "ID": "OnChoiceSelect",
            "Reference0": ev.target.dataset["choiceid"]
          };
          return _this.$named.trigger($.Event("IkagakaSurfaceEvent", {
            detail: detail
          }));
        };
        onchoiceclick = function(ev) {
          var detail;
          detail = {
            "ID": "OnAnchorSelect",
            "Reference0": ev.target.dataset["anchorid"]
          };
          return _this.$named.trigger($.Event("IkagakaSurfaceEvent", {
            detail: detail
          }));
        };
        _this.$named.on("click", ".ikagaka-choice", onanchorclick);
        _this.$named.on("click", ".ikagaka-anchor", onchoiceclick);
        return _this.destructors.push(function() {
          _this.$named.off("click", ".ikagaka-choice", onanchorclick);
          return _this.$named.off("click", ".ikagaka-anchor", onchoiceclick);
        });
      });
    })(this)();
  }

  Named.prototype.destructor = function() {
    this.scopes.forEach(function(scope) {
      return $(scope.element).remove();
    });
    this.destructors.forEach(function(destructor) {
      return destructor();
    });
    return this.$named.remove();
  };

  Named.prototype.scope = function(scopeId) {
    if (!isFinite(scopeId)) {
      return this.currentScope;
    }
    if (!this.scopes[scopeId]) {
      this.scopes[scopeId] = new Scope(scopeId, this.shell, this.balloon);
    }
    this.currentScope = this.scopes[scopeId];
    this.$named.append(this.scopes[scopeId].element);
    return this.currentScope;
  };

  Named.prototype.openInputBox = function(id, text) {
    var detail;
    if (text == null) {
      text = "";
    }
    detail = {
      "ID": "OnUserInput",
      "Reference1": id,
      "Reference1": "" + prompt("UserInput", text)
    };
    return this.$named.trigger($.Event("IkagakaSurfaceEvent", {
      detail: detail
    }));
  };

  Named.prototype.openCommunicateBox = function(text) {
    var detail;
    if (text == null) {
      text = "";
    }
    detail = {
      "ID": "OnCommunicate",
      "Reference0": "user",
      "Reference1": "" + prompt("Communicate", text)
    };
    return this.$named.trigger($.Event("IkagakaSurfaceEvent", {
      detail: detail
    }));
  };

  return Named;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Named;
}

if (window["Ikagaka"] != null) {
  window["Ikagaka"]["Named"] = Named;
}
