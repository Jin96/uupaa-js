// === Array reduce / diet =================================
// depend: array
uu.feat.array_reduce = {};

// --- Array.prototype Cross Browser ---
uu.mix(Array.prototype, {
  // Array.prototype.reduce
  reduce: function(fn,             // Function: evaluator
                   initialValue) { // Mix(default: undefined):
    var rv, i = 0, iz = this.length, found = 0;

    if (initialValue !== void 0) {
      rv = initialValue;
      ++found;
    }
    for (; i < iz; ++i) {
      if (i in this) {
        if (found) {
          rv = fn(rv, this[i], i, this);
        } else {
          rv = this[i];
          ++found;
        }
      }
    }
    if (!found) { throw ""; }
    return rv;
  },

  // Array.prototype.reduceRight
  reduceRight: function(fn,             // Function: evaluator
                        initialValue) { // Mix(default: undefined):
    var rv, i = 0, found = 0;

    if (initialValue !== void 0) {
      rv = initialValue;
      ++found;
    }
    for (i = this.length - 1; i >= 0; --i) {
      if (i in this) {
        if (found) {
          rv = fn(rv, this[i], i, this);
        } else {
          rv = this[i];
          ++found;
        }
      }
    }
    if (!found) { throw ""; }
    return rv;
  }
}, 0, 0);

uu.mix(uu, {
  // uu.toUniqueArray - Array compaction and remove alike value
  toUniqueArray: function(ary,            // Array: source
                          removeAlike) {  // Boolean(default: true):
    var rv = [], ri = -1, v, i = 0, iz = ary.length,
        alike = (removeAlike === void 0) ? true : removeAlike;

    for (; i < iz; ++i) {
      if (i in ary) {
        v = ary[i];
        if (v !== null && v !== void 0) {
          if (!alike || rv.indexOf(v) < 0) {
            rv[++ri] = v;
          }
        }
      }
    }
    return rv; // return Array
  }
});
