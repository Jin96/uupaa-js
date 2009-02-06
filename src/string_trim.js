// === String.prototype.trim ===============================
// depend: none
uu.feat.string_trim = {};

uu.mix(String.prototype, {
  // String.prototype.trim - trim both side whitespace
  trim: function() {
    return this.replace(UU.UTIL.TRIM, "");
  },

  // String.prototype.trimLeft - trim left side whitespace
  trimLeft: function() {
    return this.replace(UU.UTIL.TRIM_LEFT, "");
  },

  // String.prototype.trimRight - trim right side whitespace
  trimRight: function() {
    return this.replace(UU.UTIL.TRIM_RIGHT, "");
  }
}, 0, 0);
