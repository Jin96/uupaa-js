// === sprintf =============================================
// depend: none
uu.feat.sprintf = {};

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
    DECODE = {
      i: NUMBER | SIGNED,
      d: NUMBER | SIGNED,
      u: NUMBER | UNSIGNED,
      o: NUMBER | UNSIGNED | OCTET | PREFIX,
      x: NUMBER | UNSIGNED | HEX | PREFIX,
      X: NUMBER | UNSIGNED | HEX | TOUPPER | PREFIX,
      f: FLOAT | SIGNED | PRECISION,
      c: TONUMBER | NOWIDTH,
      A: TOASCII | NOWIDTH,
      s: LITERAL | PRECISION,
      "%": LITERAL | NOINDEX | NOWIDTH
    },
    REX = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcAs])/g,
    UNSIGNED_NUM = 0x100000000;

uu.sprintf = function(format     // String: sprintf format string
                      // args... // Mix: args
                      ) {
  var next = 1, idx = 0, av = arguments;

  return format.replace(REX, function(_, argidx, flag, width, prec, size, type) {
    var bits = DECODE[type], v;

    idx = argidx ? parseInt(argidx) : next++;

    !(bits & NOINDEX) && (v = (av[idx] === void 0) ? "undefined" : av[idx]);
    bits & NUMBER     && (v = parseInt(v));
    bits & FLOAT      && (v = parseFloat(v));
    bits & LITERAL    && (v = (v || type || "").toString());
    if (bits & (NUMBER | FLOAT) && isNaN(v)) { return ""; }

    bits & UNSIGNED   && (v = (v >= 0) ? v : v % UNSIGNED_NUM + UNSIGNED_NUM);
    bits & OCTET      && (v = v.toString(8));
    bits & HEX        && (v = v.toString(16));
    bits & PREFIX     && (flag === "#") && (v = ((bits & OCTET) ? "0" : "0x") + v);
    bits & PRECISION  && prec &&
                         (v = (bits & FLOAT) ? v.toFixed(prec) : v.substring(0, prec));
    bits & TONUMBER   && (v = (typeof v !== "number") ? "" : String.fromCharCode(v));
    bits & TOASCII    && (v = (typeof v !== "number") ? ""
                            : (v < 0x20 || v > 0x7e) ? "." : String.fromCharCode(v));
    v = bits & TOUPPER ? v.toString().toUpperCase() : v.toString();
    if (bits & NOWIDTH || v.length >= width) {
      return v;
    }
    // -- pad zero or space ---
    flag = flag || " ",
    size = width - v.length;

    if (flag === "0" && (bits & SIGNED) && v.indexOf("-") !== -1) {
      // "-123" -> "-00123"
      return "-" + Array(size + 1).join("0") + v.substring(1);
    }
    return Array(size + 1).join((flag === "#") ? " " : flag) + v;
  });
};
})();
