
// === query.tokenizer ===

uu.query.tokenizer || (function(doc, uu) {

uu.query.tokenizer = tokenizer;

var _A_TAG          = 1,  // E               [_A_TAG,        "DIV"]
    _A_COMBINATOR   = 2,  // E > F           [_A_COMBINATOR, ">", _A_TAG, "DIV"]
    _A_ID           = 3,  // #ID             [_A_ID,         "ID"]
    _A_CLASS        = 4,  // .CLASS          [_A_CLASS,      "CLASS"]
    _A_ATTR         = 5,  // [ATTR]          [_A_ATTR,       "ATTR"]
    _A_ATTR_VALUE   = 6,  // [ATTR="VALUE"]  [_A_ATTR_VALUE, "ATTR", 1~6, "VALUE"]
    _A_PSEUDO       = 7,  // :target         [_A_PSEUDO,      1~29]
    _A_PSEUDO_NTH   = 8,  // :nth-child(...) [_A_PSEUDO_FUNC, 31~34, { a,b,k }]
    _A_PSEUDO_FUNC  = 9,  // :lang(...)      [_A_PSEUDO_FUNC, 35~99, arg]
    _A_PSEUDO_NOT   = 10, // :not(...)       [_A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ...]
    _A_COMMA        = 11, // E,F
    _COMB  = /^\s*(?:([>+~])\s*)?(\*|\w*)/, // "E > F"  "E + F"  "E ~ F"  "E"  "E F" "*"
    _ATTR  = /^\[\s*(?:([^~\^$*|=\s]+)\s*([~\^$*|]?\=)\s*((["'])?.*?\4)|([^\]\s]+))\s*\]/,
    _NTH   = /^((even)|(odd)|(1n\+0|n\+0|n)|(\d+)|((-?\d*)n([+\-]?\d*)))$/,
    _OPE   = { "=": 1, "*=": 2, "^=": 3, "$=": 4, "~=": 5, "|=": 6 },
    _MARK  = { "#": 1, ".": 2, "[": 3, ":": 4 }, // ]
    _COMMA = /^\s*,\s*/, // (((
    _IDENT = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i, // #ID or .CLASS
    _PSEUDO = { E: /^(\w+|\*)\s*\)/, END: /^\s*\)/, FUNC: /^\s*([\+\-\w]+)\s*\)/,
                FIND: /^:([\w\-]+\(?)/ }, // )
    _PSEUDOS = {
        // pseudo
        "first-child":      1, "last-child":       2, "only-child":       3, // childFilter
        "first-of-type":    4, "last-of-type":     5, "only-of-type":     6, // ofTypeFilter
        hover:              7, focus:              8, /////active:             9, // actionFilter
        enabled:           10, disabled:          11, checked:           12, // formFilter
        link:              13, visited:           14,                        // otherFilter
        empty:             15, root:              16, target:            17, // otherFilter
        // pseudo functions
        "not(":            30,
        "nth-child(":      31, "nth-last-child(": 32,                        // nthFilter
        "nth-of-type(":    33, "nth-last-of-type(": 34,                      // nthFilter
        "lang(":           35                                                // langFilter ))))))
    };

function tokenizer(expr) {
    var rv = { item: [], group: 1, err: false, msg: "", expr: expr },
        m, outer, inner;

    expr = expr.trim();
    while (!rv.err && expr && outer !== expr) { // outer loop
        m = _COMB.exec(outer = expr);
        if (m) {
            m[1] && rv.item.push(_A_COMBINATOR, m[1]); // >+~
                    rv.item.push(_A_TAG, m[2] || "*"); // "DIV" or "*"
            expr = expr.slice(m[0].length);
        }
        while (!rv.err && expr && inner !== expr) { // inner loop
            expr = innerLoop(inner = expr, rv);
        }
        m = _COMMA.exec(expr);
        if (m) {
            ++rv.group;
            rv.item.push(_A_COMMA);
            expr = expr.slice(m[0].length);
        }
    }
    expr && (rv.err = !!(rv.msg = expr + " syntax error")); // remain
    return rv;
}

function innerLoop(expr, rv, not) {
    var m, num, mm, anb, a, b, c;

    switch (_MARK[expr.charAt(0)] || 0) {
    case 1: (m = _IDENT.exec(expr)) && rv.item.push(_A_ID, m[1]); break;
    case 2: (m = _IDENT.exec(expr)) && rv.item.push(_A_CLASS, m[1]); break;
    case 3: m = _ATTR.exec(expr); // [1]ATTR, [2]OPERATOR, [3]"VALUE" [5]ATTR
            if (m) {
                m[5] ? rv.item.push(_A_ATTR, m[5])
                     : rv.item.push(_A_ATTR_VALUE, m[1], num = _OPE[m[2]], m[3]);
                m[5] || num || (rv.err = !!(rv.msg = ope));
                // [FIX] Attribute multivalue selector. css3_id7b.html
                //  <p title="hello world"></p> -> query('[title~="hello world"]') -> unmatch
                num === 5 && m[3].indexOf(" ") >= 0 && (rv.err = !!(rv.msg = ope));
            }
            break;
    case 4: m = _PSEUDO.FIND.exec(expr);
            if (m) {
                num = _PSEUDOS[m[1]] || 0;
                if (!num) {
                    rv.err || (rv.err = !!(rv.msg = m[0]));
                } else if (num < 30) {   // pseudo (30 is magic number)
                    rv.item.push(_A_PSEUDO, num);
                } else if (num === 30) { // :not   (30 is magic number)
                    if (not) {
                        rv.err = !!(rv.msg = ":not(:not(...))");
                        break;
                    }
                    rv.item.push(_A_PSEUDO_NOT);
                    expr = expr.slice(m[0].length);
                    m = _PSEUDO.E.exec(expr);
                    if (m) {
                        rv.item.push(_A_TAG, m[1].toUpperCase()); // "DIV"
                    } else {
                        expr = innerLoop(expr, rv, 1); // :not(simple selector)
                        m = _PSEUDO.END.exec(expr);
                        m || (rv.err ? 0 : (rv.err = !!(rv.msg = ":not()")));
                    }
                } else { // pseudo nth-functions
                    rv.item.push(num < 35 ? _A_PSEUDO_NTH : _A_PSEUDO_FUNC, num);
                    expr = expr.slice(m[0].length);
                    m = _PSEUDO.FUNC.exec(expr);
                    if (m && num < 35) {
                        mm = _NTH.exec(m[1]);
                        if (mm) {
                            if (mm[2]) {
                                anb = { a: 2, b: 0, k: 3 }; // nth(even)
                            } else if (mm[3]) {
                                anb = { a: 2, b: 1, k: 3 }; // nth(odd)
                            } else if (mm[4]) {
                                anb = { a: 0, b: 0, k: 2, all: 1 }; // nth(1n+0), nth(n+0), nth(n)
                            } else if (mm[5]) {
                                anb = { a: 0, b: parseInt(mm[5], 10), k: 1 }; // nth(1)
                            } else {
                                a = (mm[7] === "-" ? -1 : mm[7] || 1) - 0;
                                b = (mm[8] || 0) - 0;
                                c = a < 2;
                                anb = { a: c ? 0 : a, b: b, k: c ? a + 1 : 3 };
                            }
                        }
                        anb ? rv.item.push(anb)  // pseudo function arg
                            : rv.err ? 0 : (rv.err = !!(rv.msg = m[0]));
                    } else {
                        m ? rv.item.push(m[1]) // pseudo function arg
                          : rv.err ? 0 : (rv.err = !!(rv.msg = m[0]));
                    }
                }
            }
    }
    m && (expr = expr.slice(m[0].length));
    return expr;
}

})(document, uu);
