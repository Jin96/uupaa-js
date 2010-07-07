(function() {
window.tokenizer = tokenizer;

var _A_TAG          = 1, // E
    _A_COMBINATOR   = 2, // E > F
    _A_ID           = 3, // #ID
    _A_CLASS        = 4, // .CLASS
    _A_ATTR         = 5, // [ATTR]
    _A_ATTR_VALUE   = 6, // [ATTR="VALUE"]
    _A_PSEUDO       = 7, // :target
    _A_PSEUDO_FUNC  = 8, // :lang(...)  :nth-child(...)
    _A_PSEUDO_NOT   = 9, // :not(...)
    _A_COMMA        = 10, // E,F
    _COMB  = /^\s*(?:([>+~])\s*)?(\*|\w*)/, // "E > F"  "E + F"  "E ~ F"  "E"  "E F" "*"
    _ATTR  = /^\[\s*(?:([^~\^$*|=\s]+)\s*([~\^$*|]?\=)\s*((["'])?.*?\4)|([^\]\s]+))\s*\]/,
    _MARK  = { "#": 1, ".": 2, "[": 3, ":": 4 }, // ]
    _COMMA = /^\s*,\s*/,
    _IDENT = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i, // #ID or .CLASS
    _PSEUDO = { E: /^(\w+|\*)\s*\)/, END: /^\s*\)/, FUNC: /^\s*([\+\-\w]+)\s*\)/,
                FIND: /^:([\w\-]+\(?)/ },
    _PSEUDOS = {
        // pseudo
        root:               1, "first-child":      2, "last-child":       3,
        "first-of-type":    4, "last-of-type":     5, "only-child":       6,
        "only-of-type":     7, empty:              8, link:               9,
        visited:           10, active:            11, hover:             12,
        focus:             13, target:            14, enabled:           15,
        disabled:          16, checked:           17,
        // pseudo functions
        "not(":            18, "lang(":           19, "nth-child(":      20,
        "nth-of-type(":    21, "nth-last-child(": 22, "nth-last-of-type(": 23 // ))))))
    };

function tokenizer(expr) {
    var rv = { token: [], group: 1, err: false, msg: "" },
        m, outer, inner;

    expr = expr.trim();
    while (!rv.err && expr && outer !== expr) { // outer loop
        m = _COMB.exec(outer = expr);
        if (m) {
            m[1] && rv.token.push(_A_COMBINATOR, m[1]); // >+~
                    rv.token.push(_A_TAG,        m[2]); // tag
            expr = expr.slice(m[0].length);
        }
        while (!rv.err && expr && inner !== expr) { // inner loop
            expr = innerLoop(inner = expr, rv);
        }
        m = _COMMA.exec(expr);
        if (m) {
            ++rv.group;
            rv.token.push(_A_COMMA);
            expr = expr.slice(m[0].length);
        }
    }
    return rv;
}

function innerLoop(expr, rv, not) {
    var m, num;

    switch (_MARK[expr.charAt(0)] || 0) {
    case 1: (m = _IDENT.exec(expr)) && rv.token.push(_A_ID, m[1]); break;
    case 2: (m = _IDENT.exec(expr)) && rv.token.push(_A_CLASS, m[1]); break;
    case 3: m = _ATTR.exec(expr); // [1]ATTR, [2]OPERATOR, [3]"VALUE" [5]ATTR
            if (m) {
                m[5] ? rv.token.push(_A_ATTR, m[5])
                     : rv.token.push(_A_ATTR_VALUE, m[1], m[2], m[3]);
            }
            break;
    case 4: m = _PSEUDO.FIND.exec(expr);
            if (m) {
                num = _PSEUDOS[m[1]] || 0;
                if (!num) {
                    rv.err || (rv.err = !!(rv.msg = m[0]));
                } else if (num <= 17) { // 17: checked
                    rv.token.push(_A_PSEUDO, m[1]);
                } else if (num === 18) { // 18: not
                    if (not) {
                        rv.err = !!(rv.msg = ":not(:not(...))");
                        break;
                    }
                    rv.token.push(_A_PSEUDO_FUNC, "not");
                    expr = expr.slice(m[0].length);
                    m = _PSEUDO.E.exec(expr);
                    if (m) {
                        rv.token.push(_A_TAG, m[1]);
                    } else {
                        expr = innerLoop(expr, rv, 1); // :not(simple selector)
                        m = _PSEUDO.END.exec(expr);
                        m || (rv.err ? 0 : (rv.err = !!(rv.msg = ":not()")));
                    }
                } else { // :lang(fr)
                    rv.token.push(_A_PSEUDO_FUNC, m[1].slice(0, -1));
                    expr = expr.slice(m[0].length);
                    m = _PSEUDO.FUNC.exec(expr);
                    m ? rv.token.push(m[1])
                      : rv.err ? 0 : (rv.err = !!(rv.msg = m[0]));
                }
            }
    }
    m && (expr = expr.slice(m[0].length));
    return expr;
}

})();
