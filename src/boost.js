// === Boost, ECMAScript3.1 + HTML5 + Advance Spec =========
// depend: none
uu.feat.boost = {};

// === Dec Table ===========================================
// depend: none

UU.UTIL.DEC2HEX = {}; // 0: "00" ... 255: "ff"
UU.UTIL.DEC2DEC = {}; // 0: "00" ...  99: "99"

(function() {
  function createTable(i, j, radix, table) {
    for (; i < radix; ++i) {
      for (j = 0; j < radix; ++j) {
        table[i * radix + j] = i.toString(radix) + j.toString(radix);
      }
    }
  }
  createTable(0, 0, 16, UU.UTIL.DEC2HEX);
  createTable(0, 0, 10, UU.UTIL.DEC2DEC);
})();

// === sprintf =============================================
// depend: none

(function() {
var NUMBER    = 0x0001,
    FLOAT     = 0x0002,
    LITERAL   = 0x0004,
    SIGNED    = 0x0010,
    UNSIGNED  = 0x0020,
    PREFIX    = 0x0040,
    PRECISION = 0x0080,
    OCTET     = 0x0100,
    HEX       = 0x0200,
    NOINDEX   = 0x0400,
    NOWIDTH   = 0x0800,
    TOUPPER   = 0x1000,
    TONUMBER  = 0x2000,
    TOASCII   = 0x4000, // to printable
    IGZERO    = 0x8000, // ignore zero flag (eg: "%05d" -> "%5d")
    DECODE = {
      i: NUMBER | SIGNED | IGZERO,
      d: NUMBER | SIGNED | IGZERO,
      u: NUMBER | UNSIGNED | IGZERO,
      o: NUMBER | UNSIGNED | IGZERO | PREFIX | OCTET,
      x: NUMBER | UNSIGNED | IGZERO | PREFIX | HEX,
      X: NUMBER | UNSIGNED | IGZERO | PREFIX | HEX | TOUPPER,
      f: FLOAT | SIGNED | PRECISION,
      c: TONUMBER | NOWIDTH,
      A: TOASCII | NOWIDTH,
      s: LITERAL | PRECISION,
      "%": LITERAL | NOINDEX | NOWIDTH
    },
    REX = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcAs])/g,
    N = "number",
    UNSIGNED_NUM = 0x100000000;

uu.sprintf = function(format     // String: sprintf format string
                      // args... // Mix: sprintf args
                      ) {
  var next = 1, idx = 0, av = arguments;

  return format.replace(REX, function(_, argidx, flag, width, prec, size, types) {
    var bits = DECODE[types], v;

    idx = argidx ? parseInt(argidx) : next++;

    !(bits & NOINDEX) && (v = (av[idx] === void 0) ? "undefined" : av[idx]);
    bits & NUMBER     && (v = parseInt(v));
    bits & FLOAT      && (v = parseFloat(v));
    bits & LITERAL    && (v = ((types === "s" ? v : types) || "").toString());
    if (bits & (NUMBER | FLOAT) && isNaN(v)) { return ""; }

    bits & UNSIGNED   && (v = (v >= 0) ? v : v % UNSIGNED_NUM + UNSIGNED_NUM);
    bits & OCTET      && (v = v.toString(8));
    bits & HEX        && (v = v.toString(16));
    bits & PREFIX     && (flag === "#") && (v = ((bits & OCTET) ? "0" : "0x") + v);
    bits & PRECISION  && prec &&
                         (v = (bits & FLOAT) ? v.toFixed(prec) : v.substring(0, prec));
    bits & TONUMBER   && (v = (typeof v !== N || v < 0) ? "" : String.fromCharCode(v));
    bits & TOASCII    && (v = (typeof v !== N || v < 0) ? "" : (v < 0x20 || v > 0x7e)
                                                        ? "." : String.fromCharCode(v));
    bits & IGZERO     && (flag = (flag === "0") ? "" : flag);
    v = bits & TOUPPER ? v.toString().toUpperCase() : v.toString();
    if (bits & NOWIDTH || width === void 0 || v.length >= width) {
      return v;
    }
    // -- pad zero or space ---
    flag = flag || " ";
    size = width - v.length;

    if (flag === "0" && (bits & SIGNED) && v.indexOf("-") !== -1) {
      // "-123" -> "-00123"
      return "-" + Array(size + 1).join("0") + v.substring(1);
    }
    return Array(size + 1).join((flag === "#") ? " " : flag) + v;
  });
};
})();

// === String extend =======================================
// depend: none

uu.mix(String.prototype, {
  // String.prototype.sprintf
  sprintf: function(/* args */) { // Mix: sprintf args
    var args = uu.toArray(arguments);
    args.unshift(this);
    return uu.sprintf.apply(this, args);
  },

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

// === Array extend ========================================
// depend: none

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
  forEach: function(fn,        // Function: evaluator
                    thisArg) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        fn.call(thisArg, this[i], i, this);
      }
    }
  },

  // Array.prototype.filter
  filter: function(fn,        // Function: evaluator
                   thisArg) { // ThisObject(default: undefined):
    var rv = [], ri = -1, v, i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        v = this[i];
        fn.call(thisArg, v, i, this) && (rv[++ri] = v);
      }
    }
    return rv; // return Array( [element, ... ] )
  },

  // Array.prototype.every
  every: function(fn,        // Function: evaluator
                  thisArg) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        if (!fn.call(thisArg, this[i], i, this)) {
          return false;
        }
      }
    }
    return true; // return Boolean
  },

  // Array.prototype.some
  some: function(fn,        // Function: evaluator
                 thisArg) { // ThisObject(default: undefined):
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        if (fn.call(thisArg, this[i], i, this)) {
          return true;
        }
      }
    }
    return false; // return Boolean
  },

  // Array.prototype.map
  map: function(fn,        // Function: evaluator
                thisArg) { // ThisObject(default: undefined):
    var rv = Array(this.length), i = 0, iz = this.length;

    for (; i < iz; ++i) {
      if (i in this) {
        rv[i] = fn.call(thisArg, this[i], i, this);
      }
    }
    return rv; // return Array( [element, ... ] )
  },

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
          (!alike || rv.indexOf(v) < 0) && (rv[++ri] = v);
        }
      }
    }
    return rv; // return Array
  }
});

// === Date extend =========================================
// depend: none

uu.mix(Date.prototype, {
  // Date.prototype.toISOString - to ISO8601 date string
  toISOString: function() {
    // "YYYY-MM-DDTHH:mm:ss[.sss]TZ"
    return "%d-%02s-%02sT%02s:%02s:%02sZ".sprintf(
              this.getUTCFullYear(),
              this.getUTCMonth() + 1,
              this.getUTCDate(),
              this.getUTCHours(),
              this.getUTCMinutes(),
              this.getUTCSeconds());
    // return String( "2000-01-01T00:00:00Z" )
  }
}, 0, 0);

uu.mix(Date, {
  // Date.toRFC1123 - to RFC1123 date string
  toRFC1123: function(date) { // Date:
    var rv = date.toUTCString();
    if (/UTC/.test(rv)) {
      rv = rv.replace(/UTC/, "GMT");
      if (rv.length < 29) {
        rv.replace(/, /,", 0");
      }
    }
    return rv; // return String( "Thu, 01 Jan 1970 00:00:00 GMT" )
  }
}, 0, 0);

// === Math extend =========================================
// depend: none

uu.mix(Math, {
  // Math.toDegrees - to degree, from java.math
  toDegrees: 180 / Math.PI,

  // Math.toRadians - to radian, from java.math
  toRadians: Math.PI / 180,

  // Math.PI2 - Math.PI * 2
  PI2: Math.PI * 2
}, 0, 0);

// === HTMLElement.innerHTML or HTMLElement.outerHTML ======
// depend: none

UU.GECKO && !HTMLElement.prototype.outerHTML && (function(proto) {
  proto.__defineGetter__("outerHTML", function() {
    var range = uudoc.createRange(), div = uudoc.createElement("div");
    range.selectNode(this);
    div.appendChild(range.cloneContents());
    return div.innerHTML;
  });
  proto.__defineSetter__("outerHTML", function(html) {
    var range = uudoc.createRange(), cf;
    range.setStartBefore(this);
    cf = range.createContextualFragment(html);
    this.parentNode.replaceChild(cf, this);
  });
  proto.__defineGetter__("innerText", function() {
    return this.textContent;
  });
  proto.__defineSetter__("innerText", function(text) {
    while (this.hasChildNodes()) {
      this.removeChild(this.lastChild);
    }
    this.appendChild(uudoc.createTextNode(text));
  });
})(HTMLElement.prototype);

// === HTML5 Tag set =======================================
// depend: none

// <!DOCTYPE html>
UU.IE && (function() {
  var tags = "abbr,ruby,rt,rb,section,article,aside,header,footer,nav,dialog," +
             "figure,audio,video,source,embed,mark,meter,time,canvas,command," +
             "datagrid,details,datalist,datatemplate,rule,nest,event-source," +
             "output,progress";
  tags.split(",").forEach(function(v) {
    uudoc.createElement(v);
  })
})();

(function() {
  var block = "p,div,dl,ul,ol,form,address,blockquote,h1,h2,h3,h4,h5,h6," +
              "fieldset,hr,pre,"; // XHTML1.x block tag(exclude table)
  uu.mix(uu, {
    // uu.isBlockTag - is block tag
    isBlockTag: function(tagName) { // String:
      var tag = tagName.toLowerCase();
      return block.indexOf(tag + ",") >= 0;
    }
  });
})();
