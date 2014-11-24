// Generated by CoffeeScript 1.7.1
var Named;

Named = (function() {
  var $;

  $ = window["jQuery"];

  function Named(shell, balloon) {
    var $namedStyle;
    this.shell = shell;
    this.balloon = balloon;
    this.$named = $("<div />").addClass("named");
    $namedStyle = $("<style scoped />").html("");
    this.$named.append($namedStyle);
    this.element = this.$named[0];
    this.scopes = [];
    this.currentScope = null;
  }

  Named.prototype.scope = function(scopeId) {
    if (scopeId !== void 0) {
      if (!this.scopes[scopeId]) {
        this.scopes[scopeId] = new Scope(scopeId, this.shell, this.balloon);
        this.scopes[scopeId].$scope.on("click", (function(_this) {
          return function(ev) {
            return _this.$named.append(_this.scopes[scopeId].$scope);
          };
        })(this));
      }
      this.currentScope = this.scopes[scopeId];
      $(this.element).append(this.scopes[scopeId].element);
    }
    return this.currentScope;
  };

  return Named;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Named;
}

if (window["Ikagaka"] != null) {
  window["Ikagaka"]["Named"] = Named;
}
