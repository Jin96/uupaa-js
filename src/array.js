// === Array.prototype Cross Browser =================================
// depend: none
uu.feat.array = {};

uu.mix(Array.prototype, {
  // Array.prototype.lastIndexOf
  lastIndexOf: function(needle,      // Mix:
                        fromIndex) { // Number(default: this.length):
    var iz = this.length, i = fromIndex;
    i = (i < 0) ? i + iz : iz - 1;

    for (; i > -1; --i) {
      if (i in this && this[i] === needle) {
        return i; // return found index
      }
    }
    return -1;
  },

  // Array.prototype.indexOf
  indexOf: function(needle,      // Mix:
                    fromIndex) { // Number(default: 0):
    var iz = this.length, i = fromIndex || 0;
    i = (i < 0) ? i + iz : i;

    for (; i < iz; ++i) {
      if (i in this && this[i] === needle) {
        return i; // return found index
      }
    }
    return -1;
  },

  // Array.prototype.forEach
  forEach: function(fn,         // Function: evaluator
                    bindThis) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        fn.call(bindThis, this[i], i, this);
      }
    }
  },

  // Array.prototype.filter
  filter: function(fn,         // Function: evaluator
                   bindThis) { // ThisObject(default: undefined):
    var rv = [], ri = -1, v, i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        v = this[i];
        fn.call(bindThis, v, i, this) && (rv[++ri] = v);
      }
    }
    return rv; // return Array( [element, ... ] )
  },

  // Array.prototype.every
  every: function(fn,         // Function: evaluator
                  bindThis) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        if (!fn.call(bindThis, this[i], i, this)) {
          return false;
        }
      }
    }
    return true; // return Boolean
  },

  // Array.prototype.some
  some: function(fn,         // Function: evaluator
                 bindThis) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        if (fn.call(bindThis, this[i], i, this)) {
          return true;
        }
      }
    }
    return false; // return Boolean
  },

  // Array.prototype.map
  map: function(fn,         // Function: evaluator
                bindThis) { // ThisObject(default: undefined):
    var rv = Array(this.length), i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        rv[i] = fn.call(bindThis, this[i], i, this);
      }
    }
    return rv; // return Array( [element, ... ] )
  }
}, 0, 0);
