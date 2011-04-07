// --- document.querySelectorAll ---
//#include("env.js")

// - query.selector() function limits
// -- unsupported impossible rules ( ":root:first-child", etc ) in W3C Test Suite - css3_id27a
// -- unsupported impossible rules ( "* html"), "* :root"     ) in W3C Test Suite - css3_id27b
// -- unsupported case sensitivity ( ".cs P" )                  in W3C Test Suite - css3_id181
// -- unsupported ":not()", ":not(*)"                           in WebKit querySelectorAll()

//{@worker
//{@node
//{@ti
//{@mb
if (!(this.lib || this).env) {
    throw new Error("Compile Error: Need env.js");
}
if (!(this.lib || this).env.browser) {
    throw new Error("Compile Error: Excluding compat.gecko.js");
}

(function(global,    // @param GlobalObject:
          lib,       // @param LibraryRootObject/undefined:
          document,  // @param Document/BlankObject: document or {}
          toArray) { // @param Function: Array.prototype.slice

                          //  +-----------------+-----------------------------
                          //  | EXPRESSION      | RESULT
                          //  +-----------------+-----------------------------
var _A_TAG          = 1,  //  | E               | [ _A_TAG, "E" ]
    _A_COMBINATOR   = 2,  //  | E > F           | [ _A_COMBINATOR, ">", _A_TAG, "E" ]
    _A_ID           = 3,  //  | #ID             | [ _A_ID, "ID" ]
    _A_CLASS        = 4,  //  | .CLASS          | [ _A_CLASS, "CLASS" ]
    _A_ATTR         = 5,  //  | [ATTR]          | [ _A_ATTR, "ATTR" ]
    _A_ATTR_VALUE   = 6,  //  | [ATTR="VALUE"]  | [ _A_ATTR_VALUE, "ATTR", 1~7, "VALUE" ]
    _A_PSEUDO       = 7,  //  | :target         | [ _A_PSEUDO,      1~29 ]
    _A_PSEUDO_NTH   = 8,  //  | :nth-child(...) | [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
    _A_PSEUDO_FUNC  = 9,  //  | :lang(...)      | [ _A_PSEUDO_FUNC, 35~99, arg ]
    _A_PSEUDO_NOT   = 10, //  | :not(...)       | [ _A_PSEUDO_NOT,  _A_ID or _A_CLASS or _ATTR or _A_PSEUDO or _A_PSEUDO_FUNC, ... ]
    _A_GROUP        = 11, //  | E,F             | [ _A_GROUP ]
    _A_QUICK_ID     = 12, //  | #ID             | [ _A_QUICK_ID,    true or false, "ID" or "CLASS" ]
    _A_QUICK_EFG    = 13, //  | E,F or E,F,G    | [ _A_QUICK_EFG,   ["E", "F"] or ["E", "F", "G"] ]
                          //  +-----------------+-----------------------------
    _TOKEN_COMB     = /^\s*(?:([>+~])\s*)?(\*|\w*)/, // "E > F"  "E + F"  "E ~ F"  "E"  "E F" "*"
    _TOKEN_ATTR     = /^\[\s*(?:([^~\^$*|=!\s]+)\s*([~\^$*|!]?\=)\s*((["'])?.*?\4)|([^\]\s]+))\s*\]/,
    _TOKEN_NTH      = /^(?:(even|odd)|(1n\+0|n\+0|n)|(\d+)|(?:(-?\d*)n([+\-]?\d*)))$/,
    _TOKEN_OPERATOR = { "=":  1, "*=": 2, "^=": 3, "$=": 4,
                        "~=": 5, "|=": 6, "!=": 7 },
    _TOKEN_KIND     = { "#": 1, ".": 2, "[": 3, ":": 4 }, // ]
    _TOKEN_NTH_1    = { a: 0, b: 1, k: 1 }, // nth-child(1)
    _TOKEN_GROUP    = /^\s*,\s*/, // (((
    _TOKEN_ERROR    = /^[>+~]|[>+~*]{2}|[>+~]$/,
    _TOKEN_IDENT    = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i, // #ID or .CLASS
    _TOKEN_PSEUDO   = { E:    /^(\w+|\*)\s*\)/,
                        END:  /^\s*\)/,
                        FUNC: /^\s*([\+\-\w]+)\s*\)/,
                        FIND: /^:([\w\-]+\(?)/,
                        STR:  /^\s*(["'])?(.*?)\1\)/ },
    _TOKEN_PSEUDO_LIST = {
        // pseudo
        "first-child":       1, // childFilter()
        "last-child":        2, // childFilter()
        "only-child":        3, // childFilter()
        "first-of-type":     4, // nthTypeFilter()
        "last-of-type":      5, // nthTypeFilter()
        "only-of-type":      6, // nthTypeFilter()
        hover:               7, // actionFilter()
        focus:               8, // actionFilter()
        active:              0, // actionFilter()
        enabled:            10, // formFilter()
        disabled:           11, // formFilter()
        checked:            12, // formFilter()
        link:               13, // otherFilter()
        visited:            14, // otherFilter()
        empty:              15, // otherFilter()
        root:               16, // otherFilter()
        target:             17, // otherFilter()
/* TODO: test
        required:           18, // otherFilter <input required>
        optional:           19, // otherFilter <input required>
 */
        // pseudo functions
        "not(":             30, // nthFilter())
        "nth-child(":       31, // nthFilter())
        "nth-last-child(":  32, // nthFilter())
        "nth-of-type(":     33, // nthTypeFilter())
        "nth-last-of-type(":34, // nthTypeFilter())
        "lang(":            35, // otherFunctionFilter())
        "contains(":        36  // otherFunctionFilter())
    },
    _QUICK          = { E:   /^\w+$/,
                        ID:  /^([#\.])([a-z_\-][\w\-]*)$/i,            // #ID or .CLASS
                        EFG: /^(\w+)\s*,\s*(\w+)(?:\s*,\s*(\w+))?$/ }, // E,F[,G]
    _QUERY_COMB     = { ">": 1, "+": 2, "~": 3 },
    _QUERY_FORM     = /^(input|button|select|option|textarea)$/i,
    _QUERY_CASESENS = { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    _tokenCache     = {}, // { css-selector-expression: token, ... } for querySelectorAll
    _libqid         = "data-libqueryid",
    _libdoctype     = "data-libdoctype", // doctype=1: XMLDocument, doctype=2: HTMLDocument
    _nodeCount      = 0,
    _trimQuote      = /^["']?|['"]?$/g,
//{@mb
    // CSS3 Selector Browser Implementation
    //      Google("CSS Compatibility and Internet Explorer")
    //          -> http://msdn.microsoft.com/en-us/library/cc351024(v=vs.85).aspx
    //
    // [IE8] querySelectorAll() unsupported Attribute selector and pseudo-class
    //      E[A!=V], :root, :nth-*, :last-*, :first-of-*,
    //               :last-of-*, :only-*, :empty, :target,
    //               :not(...), :enabled, :disabled, :checked,
    //               :contains(...)
    _ie8unsupported = /\!\=|\:(?:root|nth|last|first-of|last-of|only|empty|target|not|enabled|disabled|checked|contains)/,
//}@mb
    _ie             = lib.env.ie > 0,
    _ie67           = lib.env.ie === 6 ||        // [IE6][IE7] -> hasAttribute not impl
                      lib.env.ie === 7,
    _ie678          = _ie67 || lib.env.ie === 8, // [IE6][IE7][IE8]
    _lv3Selector    = false,
    _ie8Selector    = false,
    _badSelectors   = null,
    _fixAttrName    = { // [IE6][IE7] getAttribute bug fix
        usemap:         "useMap",
        htmlFor:        "for",          // getAttribute("htmlFor") -> getAttribute("for")
        colspan:        "colSpan",
        rowspan:        "rowSpan",
        readonly:       "readOnly",
        tabindex:       "tabIndex",
        maxlength:      "maxLength",
        className:      "class",        // getAttribute("className") -> getAttribute("class")
        cellspacing:    "cellSpacing",
        frameborder:    "frameBorder"
    };

// --- detect CSS3 Selector Level3 supported ---
if (document.querySelectorAll) {
    if (lib.env.ie >= 9) { // [IE9]
        _lv3Selector = true;
    } else if (lib.env.ie === 8) { // [IE8]
        _ie8Selector = true;
        _badSelectors = /\!\=|\:(?:root|nth|last|first-of|last-of|only|empty|target|not|enabled|disabled|checked|contains)/;
    } else if (lib.env.gecko >= 1.91) {
        _lv3Selector = true;
    } else if (lib.env.opera >= 10) {
        _lv3Selector = true;
    } else if (lib.env.webkit >= 525.3) {
        _lv3Selector = true;
    }
}

// CSS3 Selector, Expression tokenizer
function queryTokenizer(expr) { // @param CSSSelectorExpressionString: "E > F"
                                // @return QueryTokenHash: { data, group, err, msg, expr }
                                //   data  - Array:   [_A_TOKEN, data, ...]
                                //   group - Number:  expression group count, from 1.
                                //                      querySelectorAll("E,F,G") -> group=3
                                //   err   - Boolean: true is error
                                //   msg   - String:  error message
                                //   expr  - String:  expression
    expr = expr.trim();

    var rv = { data: [], group: 1, err: false, msg: "", expr: expr },
        data = rv.data, m, outer, inner;

    // --- QUICK PHASE ---

/*
    (m = _QUICK.E.exec(expr))  ? data.push(_A_TAG, m[0]) :
    (m = _QUICK.ID.exec(expr)) ? data.push(_A_QUICK_ID, m[1] === "#", m[2]) :
    ((m = _QUICK.EFG.exec(expr)) && m[1] !== m[2] && m[1] !== m[3] && m[2] !== m[3]) // E !== F !== G
                               ? data.push(_A_QUICK_EFG, m[3] ? [m[1], m[2], m[3]]
                                                              : [m[1], m[2]]) :
    _TOKEN_ERROR.test(expr)    ? (rv.msg = expr) : 0;
 */

    if (m) {
        data.push(_A_TAG, m[0]);
    } else {
        m = _QUICK.ID.exec(expr);
        if (m) {
            data.push(_A_QUICK_ID, m[1] === "#", m[2]);
        } else {
            m = _QUICK.EFG.exec(expr);
            if (m) {
                if (m[1] !== m[2] && m[1] !== m[3] && m[2] !== m[3]) { // E !== F !== G
                    data.push(_A_QUICK_EFG, m[3] ? [m[1], m[2], m[3]]  // [E, F, G]
                                                 : [m[1], m[2]]);      // [E, F]
                }
            } else if (_TOKEN_ERROR.test(expr)) {
                rv.msg = expr;
            }
        }
    }

    // --- GENERIC PHASE ---
    if (!data.length) {
        while (!rv.msg && expr && outer !== expr) { // outer loop
            m = _TOKEN_COMB.exec(outer = expr);
            if (m) {
                (m[1] && data.push(_A_COMBINATOR, m[1])); // >+~

                data.push(_A_TAG, m[2] || "*"); // E or "*"

                expr = expr.slice(m[0].length);
            }
            while (!rv.msg && expr && inner !== expr) { // inner loop
                expr = innerLoop(inner = expr, rv);
            }
            m = _TOKEN_GROUP.exec(expr);
            if (m) {
                ++rv.group;
                data.push(_A_GROUP);
                expr = expr.slice(m[0].length);
            }
        }
        (expr && (rv.msg = expr)); // remain
    }
    (rv.msg && (rv.err = true));
    return rv;
}

// inner -
function innerLoop(expr,  // @param String: CSS3 Selector Expression
                   rv,    // @param Hash: { data, group, err, msg, expr }
                   not) { // @param Boolean(= false): true is negate evaluation
                          // @return String: remain expression
    var data = rv.data, m, num, mm, anb, a, b, c;

    switch (_TOKEN_KIND[expr.charAt(0)] || 0) {
    case 1: ((m = _TOKEN_IDENT.exec(expr)) && data.push(_A_ID,    m[1])); break;
    case 2: ((m = _TOKEN_IDENT.exec(expr)) && data.push(_A_CLASS, m[1])); break;
    case 3: m = _TOKEN_ATTR.exec(expr); // [1]ATTR, [2]OPERATOR, [3]"VALUE" [5]ATTR
            if (m) {
                if (m[5]) {
                    data.push(_A_ATTR, m[5]);
                } else {
                    num = _TOKEN_OPERATOR[m[2]];
                    if (num) {
                        data.push(_A_ATTR_VALUE, m[1], num, m[3]);
                    } else {
                        rv.msg = m[0]; // PARSE ERROR
                    }
                }
                // [FIX] Attribute multivalue selector. css3_id7b.html
                //
                //  <p title="hello world"></p> -> query('[title~="hello world"]') -> unmatch
                //            ~~~~~~~~~~~
                if (num === 5 && m[3].indexOf(" ") >= 0) {
                    rv.msg = m[0];
                }
            }
            break;
    case 4: m = _TOKEN_PSEUDO.FIND.exec(expr);
            if (m) {
                num = _TOKEN_PSEUDO_LIST[m[1]] || 0;
                if (!num) {
                    (rv.msg || (rv.msg = m[0]));
                } else if (num < 30) {   // pseudo (30 is magic number)
                    // 4:first-of-type -> 33:nth-of-type(1)
                    // 5:last-of-type  -> 34:nth-last-of-type(1)
                    // 6:only-of-type  -> 33:nth-of-type(1) + 34:nth-last-of-type(1)
                    (num === 4 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1) :
                     num === 5 ? data.push(_A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                     num === 6 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1,
                                           _A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                                 data.push(_A_PSEUDO, num));
                } else if (num === 30) { // :not   (30 is magic number)
                    // ":not(:not(...))", ":not()", ":not(*)" -> ERROR
                    if (not || expr === ":not()" || expr === ":not(*)") {
                        rv.msg = ":not()";
                    } else {
                        data.push(_A_PSEUDO_NOT);
                        expr = expr.slice(m[0].length);
                        m = _TOKEN_PSEUDO.E.exec(expr);
                        if (m) {
                            data.push(_A_TAG, m[1].toUpperCase()); // "DIV"
                        } else {
                            expr = innerLoop(expr, rv, true); // :not(simple selector)
                            m = _TOKEN_PSEUDO.END.exec(expr);
                            (m || rv.msg || (rv.msg = ":not()"));
                        }
                    }
                } else { // pseudo functions
                    data.push(num < 35 ? _A_PSEUDO_NTH : _A_PSEUDO_FUNC, num);
                    expr = expr.slice(m[0].length);
                    m = _TOKEN_PSEUDO.FUNC.exec(expr);
                    if (m) {
                        if (num < 35) { // pseudo nth-functions
                            mm = _TOKEN_NTH.exec(m[1]);
                            if (mm) {
                                if (mm[1]) { // :nth(even) or :nth(odd)
                                    anb = { a: 2, b: mm[1] === "odd" ? 1 : 0, k: 3 };
                                } else if (mm[2]) {
                                    anb = { a: 0, b: 0, k: 2, all: 1 }; // nth(1n+0), nth(n+0), nth(n)
                                } else if (mm[3]) {
                                    anb = { a: 0, b: parseInt(mm[3], 10), k: 1 }; // nth(1)
                                } else {
                                    a = (mm[4] === "-" ? -1 : mm[4] || 1) - 0;
                                    b = (mm[5] || 0) - 0;
                                    c = a < 2;
                                    anb = { a: c ? 0 : a, b: b, k: c ? a + 1 : 3 };
                                }
                            }
                            (anb ? data.push(anb) // pseudo function arg
                                 : (rv.msg ? 0 : (rv.msg = m[0])));
                        } else { // :lang
                            (m ? data.push(m[1]) // pseudo function arg
                               : (rv.msg ? 0 : (rv.msg = m[0])));
                        }
                    } else { // :contains
                        m = _TOKEN_PSEUDO.STR.exec(expr);
                        (m ? data.push(m[2]) // pseudo function arg
                           : (rv.msg ? 0 : (rv.msg = m[0])));
                    }
                }
            }
    }
    if (m) {
        expr = expr.slice(m[0].length);
    }
    return expr;
}

// CSS3 Selector, Token Evaluator
function queryTokenEvaluator(token,     // @param Hash: QueryTokenHash
                             context) { // @param Node: context
                                        // @return NodeArray: [node, ...]
    var node = context.ownerDocument || document, // owner node
        xmldoc = !((node[_libdoctype] ||
                   (node[_libdoctype] = (node.createElement("a").tagName ===
                                         node.createElement("A").tagName) ? 2 : 1)) - 1),
        ctx = [context], result = [], ary,
        lock, word, match, negate = 0, data = token.data,
        i = 0, iz = data.length, j, jz = 1, k, kz, r, ri,
        ident, nid, type, attr, ope, val, rex;

    for (; i < iz; ++i) {

        jz = ctx.length;
        if (!jz) {
            if (result.length < token.group - 1) {
                // skip to next group
                for (; i < iz; ++i) {
                    if (data[i] === _A_GROUP) {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        r    = [];
        ri   = -1;
        j    =  0;
        type =  0;

        switch (data[i]) {
        case _A_QUICK_ID: // [ _A_QUICK_ID, true or false, "ID" or "CLASS" ]
            if (data[++i]) { // ID
                node = document.getElementById(data[++i]);
                return node ? [node] : [];
            } // CLASS
            ary = context.getElementsByTagName("*");
            ident = " " + data[++i] + " ";
            for (jz = ary.length; j < jz; ++j) {
                node = ary[j];
                word = node.className;
                if (word) {
                    if ((" " + word + " ").indexOf(ident) >= 0) {
                        r[++ri] = node;
                    }
                }
            }
            return r;
        case _A_QUICK_EFG: // [ _A_QUICK_EFG, ["E", "F"] or ["E", "F", "G"] ]
            ary = data[++i];
            return sortNode(
                        getElementsByTagName(ary[0], context).concat(
                            getElementsByTagName(ary[1], context),
                            ary[2] ? getElementsByTagName(ary[2], context) : [])).sort;
        case _A_COMBINATOR: // [ _A_COMBINATOR, ">", _A_TAG, "DIV" ]
            type = _QUERY_COMB[data[++i]];
            ++i;
            // break;
        case _A_TAG: // [ _A_TAG, "DIV" ]
            ident = data[++i]; // "DIV" or "*"
            match = ident === "*";
            (xmldoc || (ident = ident.toUpperCase())); // if HTMLDocument -> "div" -> "DIV"

            if (!type) { // TAG
                if (negate) {
                    for (; j < jz; ++j) {
                        node = ctx[j];
                        if (node.tagName !== ident) {
                            r[++ri] = node;
                        }
                    }
                    ctx = r;
                    break;
                }
                for (lock = {}; j < jz; ++j) {
                    ary = ctx[j].getElementsByTagName(ident); // NodeList

                    for (k = 0, kz = ary.length; k < kz; ++k) {
                        node = ary[k];
                        if ((match && node.nodeType === Node.ELEMENT_NODE) ||
                            node.tagName === ident) {

                            nid = (node[_libqid] || (node[_libqid] = ++_nodeCount));
/*
                            (lock[nid] || (r[++ri] = node, lock[nid] = 1));
 */
                            if (!lock[nid]) {
                                r[++ri] = node;
                                lock[nid] = 1;
                            }
                        }
                    }
                }
            } else { // >+~
                for (lock = {}; j < jz; ++j) {
                    node = ctx[j][type < 2 ? "firstChild" : "nextSibling"];
                    for (; node; node = node.nextSibling) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (_ie678 && !node.tagName.indexOf("/")) { // fix #25
                                continue;
                            }
                            if (match || node.tagName === ident) {
                                if (type > 2) {
                                    nid = node[_libqid] || (node[_libqid] = ++_nodeCount);
                                    if (lock[nid]) {
                                        break;
                                    }
                                    lock[nid] = 1;
                                }
                                r[++ri] = node;
                            }
                            if (type === 2) {
                                break;
                            }
                        }
                    }
                }
            }
            ctx = r;
            break;
        case _A_ID: // [ _A_ID, "ID" ]
            type = 1;
            // break;
        case _A_CLASS: // [ _A_CLASS, "CLASS" ]
            ident = type ? data[++i] : (" " + data[++i] + " "); // "ID" or " CLASS "
            for (; j < jz; ++j) {
                node = ctx[j];
                if (type) { // ID
                    word  = xmldoc ? node.id : (node.id || node.name); // XHTML is id only, HTML is id or name
                    match = word && word === ident;
                } else {    // CLASS
                    word  = node.className;
                    match = word && ((" " + word + " ").indexOf(ident) >= 0);
                }
                ((match ^ negate) && (r[++ri] = node));
            }
            ctx = r;
            break;
        case _A_ATTR: // [ _A_ATTR, "ATTR" ]
            for (attr = data[++i]; j < jz; ++j) {
                node = ctx[j];
                // [IE6][IE7] node.hasAttribute() not impl
                match =
//{@ie67
                    _ie67 ? ((word = node.getAttributeNode(attr)) && word.specified) :
//}@ie67
                            node.hasAttribute(attr);
                ((match ^ negate) && (r[++ri] = node));
            }
            ctx = r;
            break;
        case _A_ATTR_VALUE: // [ _A_ATTR_VALUE, "ATTR", "OPERATOR", "VALUE" ]
            attr = data[++i];
            ope  = data[++i];
            val  = data[++i].trim().replace(_trimQuote, ""); // '"quote"' -> "quote"

            if (_ie67) { // [IE6][IE7] fix attr name
                attr = _fixAttrName[attr] || attr;
            }
            switch (ope) {
            case 1: val = "^" + val + "$"; break;                 // [attr  = value]
            case 3: val = "^" + val;       break;                 // [attr ^= value]
            case 4: val =       val + "$"; break;                 // [attr $= value]
            case 5: val = "(?:^| )" + val + "(?:$| )"; break;     // [attr ~= value]
            case 6: val = "^" + val + "\\-|^" + val + "$"; break; // [attr |= value]
            case 7: negate = +!negate;                            // [attr != value]
            }
            rex = RegExp(val, attr in _QUERY_CASESENS ? "" : "i"); // ignore case

//{@ie67
            if (_ie67) { // [IE6][IE7]
                // IE getAttribute(attr) problem
                // http://twitter.com/uupaa/status/25501532102
                // http://twitter.com/uupaa/status/25502149299
                for (; j < jz; ++j) {
                    node = ctx[j];
                    switch (attr) {
                    case "href":     word = node.getAttribute(attr, 2); break;
                    case "checked":  word = node.checked  ? "checked"  : ""; break;
                    case "disabled": word = node.disabled ? "disabled" : ""; break;
                    default:         word = node.getAttribute(attr);
                    }
                    (((word && rex.test(word)) ^ negate) && (r[++ri] = node));
                }
            } else { // [IE8][IE9][Gecko][WebKit][Opera]
//}@ie67
                for (; j < jz; ++j) {
                    node = ctx[j];
                    word = node.getAttribute(attr);
                    (((word && rex.test(word)) ^ negate) && (r[++ri] = node));
                }
//{@ie67
            }
//}@ie67
            if (ope === 7) {
                negate = +!negate; // restore
            }
            ctx = r;
            break;
        case _A_PSEUDO: // [ _A_PSEUDO, 1~29 ]
            type = data[++i];
            ctx = (type < 4  ? childFilter
                 : type < 10 ? actionFilter
                 : type < 13 ? formFilter
                             : otherFilter)(ctx, j, jz, negate, type, xmldoc);
            break;
        case _A_PSEUDO_NTH: // [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
            type = data[++i];
            ctx = (type < 33 ? nthFilter
                             : nthTypeFilter)(ctx, j, jz, negate, type, data[++i], xmldoc);
            break;
        case _A_PSEUDO_FUNC: // [ _A_PSEUDO_FUNC, 31~99, arg ]
            type = data[++i];
            ctx = otherFunctionFilter(ctx, j, jz, negate, type, data[++i]);
            break;
        case _A_PSEUDO_NOT: // [ _A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ... ]
            negate = 2;
            break;
        case _A_GROUP:
            result.push(ctx);
            ctx = [context];
        }
        (negate && --negate);
    }
    // --- mixin group ---
    iz = result.length;
    if (iz) {
        result.push(ctx);
        for (r = [], ri = -1, lock = {}, i = 0, ++iz; i < iz; ++i) {
            ctx = result[i];
            for (j = 0, jz = ctx.length; j < jz; ++j) {
                node = ctx[j];
                nid = node[_libqid] || (node[_libqid] = ++_nodeCount);
                if (!lock[nid]) {
                    r[++ri] = node;
                    lock[nid] = 1;
                }
            }
        }
        return sortNode(r).sort; // to document order
    }
    return ctx;
}

// inner - 1:first-child  2:last-child  3:only-child
function childFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, cn, found = 0;

    for (; j < jz; found = 0, ++j) {
        cn = node = ctx[j];
        if (ps & 1) { // first-child and only-child
            while (!found && (cn = cn.previousSibling)) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    ++found;
                }
            }
        }
        if (ps & 2) { // last-child and only-child
            cn = node;
            while (!found && (cn = cn.nextSibling)) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    ++found;
                }
            }
        }
        (((!found) ^ negate) && (rv[++ri] = node));
    }
    return rv;
}

// inner - 7:hover  8:focus  x:active
function actionFilter(ctx, j, jz, negate, ps) {
    function addRule(selector, declaration) {
        if (ss.insertRule) {
            ss.insertRule(selector + "{" + declaration + "}", 0);
        } else {
            ss.addRule(selector, declaration);
        }
    }

    var rv = [], ri = -1, node, ok, cs, ss, declaration;

    declaration = global.getComputedStyle ? "ruby-align:center"
                                          : "outline:0 solid #000";
    // --- create temporary StyleSheet ---
    node = document.createElement("style");
    node.appendChild(document.createTextNode(" ")); // [WEBKIT]
    document.head.appendChild(node);
    ss = node.sheet || node.styleSheet; // [IE6][IE7][IE8] node.styleSheet

    switch (ps) {
    case 7: addRule(":hover", declaration); break;
    case 8: addRule(":focus", declaration); break;
    case 9: break;
    }

    for (; j < jz; ++j) {
        node = ctx[j];

        // http://d.hatena.ne.jp/uupaa/20080928
        if (global.getComputedStyle) { // [WEB STD][IE9]
            cs = global.getComputedStyle(node, null);
            ok = (cs.outlineWidth + cs.outlineStyle) === "0pxsolid"; // [IE9 TESTED]
        } else if (node.currentStyle) { // [IE6][IE7][IE8]
            ok = node.currentStyle.rubyAlign === "center";
        }
        ((ok ^ negate) && (rv[++ri] = node));
    }
    node.parentNode.removeChild(node); // clear rule
    return rv;
}

// inner - 10:enabled  11:disabled  12:checked
function formFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, ok;

    for (; j < jz; ++j) {
        node = ctx[j];
        ok = (ps === 10) ? !node.disabled
           : (ps === 11) ? !!node.disabled
           : !!node.checked;
        if (_QUERY_FORM.test(node.tagName)) {
            if (ok ^ negate) {
                rv[++ri] = node;
            }
        } else if (negate) {
            rv[++ri] = node;
        }
    }
    return rv;
}

// inner - 13:link  14:visited  15:empty  16:root  17:target  18:required  19:optional
function otherFilter(ctx, j, jz, negate, ps, xmldoc) {

    // TODO: CSS3 Selector Lv4, :root + <style scoped>

    var rv = [], ri = -1, node, cn, ok = 0, found, word, rex /*, attr */,
        textContent = _ie678 ? "innerText" : "textContent";

    switch (ps) {
    case 13: rex = /^(?:a|area)$/i; break;
    case 14: jz = 0; break;
    case 16: if (!negate) {
                jz = 0;
                rv = [document.html];
             }
             break;
    case 17: word = location.hash.slice(1);
             if (!word) {
                jz = 0;
             }
             break;
/* TODO: test
    case 18: attr = "required"; break;
    case 19: attr = "optional";
 */
    }

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 13: ok = rex.test(node.tagName) && !!node.href; break;
        case 15: found = 0;
                 for (cn = node.firstChild; !found && cn; cn = cn.nextSibling) {
                    if (cn.nodeType === Node.ELEMENT_NODE) {
                        ++found;
                    }
                 }
                 ok = !found && !node[textContent]; break;
        case 16: ok = node !== document.html; break;
        case 17: ok = xmldoc ? (node.id === word)
                             : ((node.id || node.name) === word); break;
/* TODO: test
        case 18:
        case 19:
                // [IE6][IE7] node.hasAttribute() not impl
                ok = _ie67
                   ? ((word = node.getAttributeNode(attr)) && word.specified)
                   : node.hasAttribute(attr);
                ps === 19 && (ok = !ok);
 */
        }
        ((ok ^ negate) && (rv[++ri] = node));
    }
    return rv;
}

// inner - 31:nth-child  32:nth-last-child
function nthFilter(ctx, j, jz, negate, ps, anb, xmldoc) {
    if (anb.all) {
        return negate ? [] : ctx;
    }

    var rv = [], ri = -1, nid, lock = {},
        parent, cn, idx, ok, a = anb.a, b = anb.b, k = anb.k,
        iter1 = (ps === 32) ? "lastChild" : "firstChild",
        iter2 = (ps === 32) ? "previousSibling" : "nextSibling",
        tag = ctx[0].tagName;

    if (!xmldoc) {
        tag = tag.toUpperCase();
    }

    for (; j < jz; ++j) {
        parent = ctx[j].parentNode;
        nid = parent[_libqid] || (parent[_libqid] = ++_nodeCount);
        if (!lock[nid]) {
            lock[nid] = 1;
            for (idx = 0, cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    ++idx;
                    ok = k === 1 ? (idx === b)
                       : k === 2 ? (idx >=  b)
                       : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                                 : (idx <=  b);
                    if (ok ^ negate) {
                        if (cn.tagName === tag) {
                            rv[++ri] = cn;
                        }
                    }
                }
            }
        }
    }
    return rv;
}

// inner - 33:nth-of-type  34:nth-last-of-type
function nthTypeFilter(ctx, j, jz, negate, ps, anb) {
    if (ps === 34) {
        ctx.reverse();
    }

    var rv = [], ri = -1, node, tag, parent, parentnid, nid,
        idx, ok = 0, a = anb.a, b = anb.b, k = anb.k,
        tagdb = createTagDB(ctx, 0, jz, ps === 34);

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        tag = node.tagName;
        parent = node.parentNode;
        parentnid = parent[_libqid] || (parent[_libqid] = ++_nodeCount);
              nid =   node[_libqid] || (  node[_libqid] = ++_nodeCount);

        if (tagdb[parentnid][nid].tag === tag) {
            idx = tagdb[parentnid][nid].pos;
            ok = k === 1 ? (idx === b)
               : k === 2 ? (idx >=  b)
               : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                         : (idx <=  b);
        }
        ((ok ^ negate) && (rv[++ri] = node));
    }
    if (ps === 34) {
        rv.reverse(); // to document order
    }
    return rv;
}

// tagdb = { parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... },
//           parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... }, ... }
// inner -
function createTagDB(ctx, j, jz, reverse) { // @param NodeArray:
                                            // @return Hash: tagdb
    var rv = {}, node, parent, parentnid, cn, nid, tagcount, tag, pos,
        iter1 = reverse ? "lastChild" : "firstChild",
        iter2 = reverse ? "previousSibling" : "nextSibling";

    for (; j < jz; ++j) {
        node = ctx[j];
        parent = ctx[j].parentNode;
        parentnid = parent[_libqid] || (parent[_libqid] = ++_nodeCount);

        if (!rv[parentnid]) {
            rv[parentnid] = {};
            tagcount = {}; // { "DIV": count }
            for (cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    tag = cn.tagName;
                    pos = tagcount[tag] ? ++tagcount[tag] : (tagcount[tag] = 1);

                    nid = cn[_libqid] || (cn[_libqid] = ++_nodeCount);
                    rv[parentnid][nid] = { tag: tag, pos: pos };
                }
            }
        }
    }
    return rv;
}

// inner - 35:lang  36:contains
function otherFunctionFilter(ctx, j, jz, negate, ps, arg) {
    var rv = [], ri = -1, ok = 0, node,
        rex = ps === 35 ? RegExp("^(" + arg + "$|" + arg + "-)", "i") : 0,
        textContent = _ie678 ? "innerText" : "textContent";

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 35: while (!node.getAttribute("lang") && (node = node.parentNode)) {}
                 ok = node && rex.test(node.getAttribute("lang")); break;
        case 36: ok = node[textContent].indexOf(arg) >= 0;
        }
        ((ok ^ negate) && (rv[++ri] = node));
    }
    return rv;
}

// document.getElementById
function getElementById(expr,      // @param String: "id"
                        context) { // @param Node(= document): query context
                                   // @return Node/null:
    return (context || document).getElementById(expr);
}

// document.getElementsById
function getElementsById(expr,      // @param CommaJointString: "id1,id2,...", has not space
                         context) { // @param Node(= document): query context
                                    // @return NodeArray: [Node, ...]
    //  [1][has all]  getElementsById("A,B,C")         -> [<a id="A">, <li id="B">, <div id="C">]
    //  [2][skip one] getElementsById("A,NONEEXIST,C") -> [<a id="A">, <div id="C">]

//{@assert
    if (expr.indexOf(" ") >= 0) {
        throw new Error('Error getElementsById("Space can not be specified")');
    }
//}@assert

    var rv = [], ary = expr.split(","),
        i = 0, iz = ary.length,
        ctx = context || document, node;

    for (; i < iz; ++i) {
        node = ctx.getElementById(ary[i]);
        if (node) {
            rv.push(node); // nonexistent node skips
        }
    }
    return rv;
}

// document.getElementsByTagName
function getElementsByTagName(expr,      // @param String(= ""): tag name, "" or "*" is all
                              context) { // @param Node(= document): query context
                                         // @return NodeArray: [Node, ...]
//{@mb
    if (!_ie678) { // [WEB STD][IE9]
//}@mb
        return toArray.call((context || document).getElementsByTagName(expr || "*"));
//{@mb
    }

    // [IE6][IE7][IE8] IE getElementsByTagName("*") has comment nodes
    var rv = [], ri = 0, v, i = 0, skip = (!expr || expr === "*"),
        nodeList = (context || document).getElementsByTagName(expr || "*"),
        iz = nodeList.length;

    for (; i < iz; ++i) {
        v = nodeList[i];
        if (!skip || v.nodeType === 1) { // === Node.ELEMENT_NODE
            rv[ri++] = v;
        }
    }
    return rv;
//}@mb
}

// document.getElementsByClassName
function getElementsByClassName(expr,      // @param String: "class", "class1 class2,..."
                                context) { // @param Node(= document): query context
                                           // @return NodeArray: [Node, ...]
//{@mb
    if (document.getElementsByClassName) {
//}@mb
        // [WEB STD][IE9]
        return toArray.call((context || document).getElementsByClassName(expr));
//{@mb
    }

    var rex, match, node,
        rv, ri, i, iz, ary, az, nodeList,
        word = context;

    if (expr.indexOf(",") > 0) {
        expr = expr.replace(/,/g, " ");
    }

    ary = expr.trim().split(" ");
    az  = ary.length;
    rex = RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
    nodeList = (context || document).getElementsByTagName("*");

    for (rv = [], ri = 0, i = 0, iz = nodeList.length; i < iz; ++i) {
        node = nodeList[i];
        word = node.className;
        if (word) {
            match = word.match(rex);
            if (match && match.length >= az) {
                rv[ri++] = node;
            }
        }
    }
    return rv;
//}@mb
}

// document.querySelectorAll
function querySelectorAll(expr,      // @param CSSSelectorExpressionString: "css > selector"
                          context) { // @param Node(= document): query context
                                     // @return NodeArray: [Node, ...]
//{@mb [IE6][IE7][IE8]
    function fakeToArray(fakeArray) { // @param FakeArray: NodeList, Arguments
                                      // @return Array:
        var rv = [], i = 0, iz = fakeArray.length;

        for (; i < iz; ++i) {
            rv[i] = fakeArray[i];
        }
        return rv;
    }
//}@mb

    context = context || document;

    if (_lv3Selector) {
        return toArray.call(context.querySelectorAll(expr));
    } else {
//{@mb
        if (_ie8Selector && !_badSelectors.test(expr)) {
            return fakeToArray(context.querySelectorAll(expr));
        }
//}@mb
    }

    var token = _tokenCache[expr];

    if (token) {
        _tokenCache[expr] = queryTokenizer(expr);
    }
    return token.err ? [] : queryTokenEvaluator(token, context);
}

// document.matchesSelector
function matchesSelector(expr,      // @param CSSSelectorExpressionString: "css > selector"
                         context) { // @param Node(= document): match context
                                    // @return Boolean:
    context = context || document;
    if (context.matchesSelector) {
        return context.matchesSelector(expr);
    }
    if (context.webkitMatchesSelector) {
        return context.webkitMatchesSelector(expr);
    }
//{@mb
    if (context.mozMatchesSelector) {
        return context.mozMatchesSelector(expr);
    }
    if (context.msMatchesSelector) {
        return context.msMatchesSelector(expr);
    }

    var node, i = 0, nodeArray = querySelectorAll(expr, document);

    for (; (node = nodeArray[i++]); ) {
        if (node === context) {
            return true;
        }
    }
//}@mb
    return false;
}

// sort by document order, detect duplicate
function sortNode(ary,       // @param NodeArray:
                  context) { // @hidden Node(= document): search context
                             // @return Hash: { sort, dup }
                             //   sort - Array: SortedNodeArray
                             //   dup  - Array: DuplicatedNodeArray

    //  [1][sort] sortNode([<body>, <html>, <body>], document)
    //                  -> { sort: [<html>, <body>], dup: [<body>] }

    var rv = [], ri = 0, i = 0, iz = ary.length, hash = { length: iz },
        idx, min = 0xfffffff, max = 0, node, dups = [], di = 0,
        all = _ie ? 0 : getElementsByTagName("", context || document);

    for (; i < iz; ++i) {
        node = ary[i];
        idx = _ie ? node.sourceIndex
                  : all.indexOf(node);
        (min > idx && (min = idx));
        (max < idx && (max = idx));

        if (hash[idx]) { // judge duplicate
            dups[di++] = node;
        } else {
            hash[idx] = node;
        }
    }
    for (i = min; i <= max; ++i) {
        node = hash[i];
        if (node) {
            rv[ri++] = node;
        }
    }
    return { sort: rv, dup: dups };
}

// --- export ---
lib.querySelectorAll       = querySelectorAll;      // querySelectorAll(expr:CSSSelectorExpressionString, context:NodeArray/Node = <body>):NodeArray
lib.queryTokenizer         = queryTokenizer;
lib.queryTokenEvaluator    = queryTokenEvaluator;
lib.getElementById         = getElementById;        // getElementById(expr:String, context:Node = document):Node/null
lib.getElementsById        = getElementsById;       // getElementsById(expr:CommaJointString, context:Node = document):NodeArray
                                                    //  [1][has all]  getElementsById("A,B,C")         -> [<a id="A">, <li id="B">, <div id="C">]
                                                    //  [2][skip one] getElementsById("A,NONEEXIST,C") -> [<a id="A">, <div id="C">]
lib.getElementsByTagName   = getElementsByTagName;  // getElementsByTagName(expr:String = "", context:Node = <body>):NodeArray
lib.getElementsByClassName = getElementsByClassName;// domQueryClassName(expr:String/Node, context:String/Node = <body>):NodeArray/Node
lib.matchesSelector        = matchesSelector;       // matchesSelector(expr:CSSSelectorExpressionString, context:Node = <body>):Boolean
lib.sortNode               = sortNode;              // sortNode(ary:NodeArray, context:Node = <body>):Hash - { sort, dup }
                                                    //  [1][sort] sortNode([<body>, <html>, <body>], document) -> { sort: [<html>, <body>], dup: [<body>] }

})(this, this.lib || this, this.document, Array.prototype.slice);

//}@mb
//}@ti
//}@node
//}@worker

