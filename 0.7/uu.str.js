
// === String++ ===
//{{{!depend uu
//}}}!depend

uu.sprintf || (function(win, doc, uu) {

uu.split.token = uusplittoken;  // uu.split.token(expr, splitter, notrim = false) -> [token, ...]
uu.sprintf = uusprintf;         // uu.sprintf("%s-%d", var_args, ...) -> "formatted string"


// uu.split.token - split token
function uusplittoken(expr,     // @param String: expression
                      splitter, // @param String(= " "):
                      notrim) { // @param Boolean(= false): false is trim both space
                                // @return Array: ["token", ...]
    splitter = splitter || " ";
    if (expr.indexOf(splitter) < 0) { return [expr]; }

    var rv = [], ary = expr.split(""), v, w, i = -1,
        nest = 0, quote = 0, q, tmp = [], ti = -1, esc = 0,
        TOKEN = { "(": 2, ")": 3, '"': 4, "'": 4, "\\": 5 }; // [!]keep local

    TOKEN[splitter] = 1;

    while ( (v = ary[++i]) ) {
        if (esc) {
            esc = 0;
            tmp[++ti] = v;
        } else {
            switch (TOKEN[v] || 0) {
            case 0: tmp[++ti] = v;
                    break;
            case 1: if (!quote) {
                        if (nest) {
                            tmp[++ti] = v;
                        } else {
                            w = tmp.join(""),
                            rv.push(notrim ? w : w.trim());
                            tmp = [];
                            ti = -1;
                        }
                    } else {
                        tmp[++ti] = v;
                    }
                    break;
            case 2: tmp[++ti] = v;
                    !quote && ++nest;
                    break;
            case 3: tmp[++ti] = v;
                    !quote && --nest;
                    break;
            case 4: if (!quote) {
                        quote = 1;
                        q = v;
                    } else if (v === q) {
                        quote = 0;
                    }
                    tmp[++ti] = v;
                    break;
            case 5: esc = 1;
                    tmp[++ti] = v;
            }
        }
    }
    // remain
    if (tmp.length) {
        w = tmp.join("");
        rv.push(notrim ? w : w.trim());
    }
    return rv;
}

// uu.sprintf - sprintf (PHP::sprintf like function)
// uu.sprintf("%s-%d", var_args, ...) -> "formatted string"
function uusprintf(format            // @param String: sprintf format string
                   /* var_args */) { // @param Mix: sprintf var_args
                                     // @return String: "formatted string"
    // http://d.hatena.ne.jp/uupaa/20091214
    function _parse(m, argidx, flag, width, prec, size, types) {
        if (types === "%") {
            return types;
        }
        idx = argidx ? parseInt(argidx) : next++;

        var w = uusprintf._bits[types], ovf, pad,
            v = (av[idx] === void 0) ? "" : av[idx];

        w & 3 && (v = w & 1 ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
        w & 4 && (v = ((types === "s" ? v : types) || "").toString());
        w & 0x20  && (v = v >= 0 ? v : v % 0x100000000 + 0x100000000);
        w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
        w & 0x40  && flag === "#" && (v = (w & 0x100 ? "0" : "0x") + v);
        w & 0x80  && prec && (v = w & 2 ? v.toFixed(prec) : v.slice(0, prec));
        w & 0x400 && (v = uu.json(v)); // "%j"
        w & 0x6000 && (ovf = (typeof v !== "number" || v < 0));
        w & 0x2000 && (v = ovf ? "" : String.fromCharCode(v));
        w & 0x8000 && (flag = flag === "0" ? "" : flag);
        v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
        // padding
        if (!(w & 0x800 || width === void 0 || v.length >= width)) {
            pad = Array(width - v.length + 1).join((!flag || flag === "#") ? " " : flag);
            v = ((w & 0x10 && flag === "0") && !v.indexOf("-")) ?
                ("-" + pad + v.slice(1)) : (pad + v);
        }
        return v;
    }
    var next = 1, idx = 0, av = arguments;

    return format.replace(uusprintf._fmt, _parse);
}
uusprintf._fmt = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcsj])/g;
uusprintf._bits = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261,
                    X: 0x9261, f: 0x92, c: 0x2800, s: 0x84, j: 0xC00 };

})(window, document, uu);

