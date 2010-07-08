
// === uu.query ===
//#include query/tokenizer.js

uu.query.selectorAll || (function(doc, uu) {

uu.query.selectorAll = selectorAll;

var _A_TAG          = 1, // E               [_A_TAG,        "DIV"]
    _A_COMBINATOR   = 2, // E > F           [_A_COMBINATOR, ">", _A_TAG, "DIV"]
    _A_ID           = 3, // #ID             [_A_ID,         "ID"]
    _A_CLASS        = 4, // .CLASS          [_A_CLASS,      "CLASS"]
    _A_ATTR         = 5, // [ATTR]          [_A_ATTR,       "ATTR"]
    _A_ATTR_VALUE   = 6, // [ATTR="VALUE"]  [_A_ATTR_VALUE, "ATTR", 1~6, "VALUE"]
    _A_PSEUDO       = 7, // :target         [_A_PSEUDO,      1~29]
    _A_PSEUDO_FUNC  = 8, // :nth-child(...) [_A_PSEUDO_FUNC, 31~99, arg]
    _A_PSEUDO_NOT   = 9, // :not(...)       [_A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ...]
    _A_COMMA        = 10, // E,F
    _COMBINATOR = { ">": 1, "+": 2, "~": 3 },
    _CASESENS = { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    _uunid  = "data-uunodeid",
    _nid    = uu.nodeid,
//{{{!mb
    _ie     = uu.ie,
//}}}!mb
    _nextSibling = "nextSibling",
    _previousSibling = "previousSibling",
    _userFilter = uu.nop,
    _userFunctionFilter = uu.nop;

// uu.query.selectorAll
function selectorAll(context, // @param Node: context
                     hash) {  // @param Hash: QueryTokenHash
                              // @return NodeArray:

    var owner = context.ownerDocument,
        xmldoc = owner.createElement("a").tagName !==
                 owner.createElement("A").tagName,
        ctx = [context], nodeList,
        lock = {}, mixinLock = {}, word, match, negate = 0,
        i = 0, iz = hash.token.length, j, jz, k, kz, r, ri,
        ident, node, universal, nid, type,
        attr, ope, val, rex, // for attr
        pseudo, arg; // for pseudo

    for (; i < iz; ++i) {
        r  = [];
        ri = -1;
        j  = type = 0;
        jz = ctx.length;

        switch (hash.token[i]) {
        case _A_COMBINATOR: // [_A_COMBINATOR, ">", _A_TAG, "DIV"]
            type = _COMBINATOR[hash.token[++i]];
            ++i;
        case _A_TAG:        // [_A_TAG, "DIV"]
            ident = hash.token[++i]; // "DIV" or "*"
            xmldoc && (ident = ident.toLowerCase()); // "DIV" -> "div"
            universal = ident === "*";

            if (!type) { // TAG
                for (; j < jz; ++j) {
                    nodeList = ctx[j].getElementsByTagName(ident);

                    for (k = 0, kz = nodeList.length; k < kz; ++k) {
                        node = nodeList[k];
                        if ((universal && node.nodeType === 1) || node.tagName === ident) {
                            nid = node[_uunid] || (_nid.db[nid = ++_nid.n] = node,
                                                   node[_uunid] = nid);
                            lock[nid] || (r[++ri] = node, lock[nid] = 1);
                        }
                    }
                }
            } else { // >+~
                for (; j < jz; ++j) {
                    node = ctx[j][type < 2 ? "firstChild" : "nextSibling"];
                    for (; node; node = node.nextSibling) {
                        if (node.nodeType === 1) {
//{{{!mb
                            if (_ie && !node.tagName.indexOf("/")) { continue; } // fix #25
//}}}!mb
                            if (universal || node.tagName === ident) {
                                if (type > 2) {
                                    nid = node[_uunid] || (_nid.db[nid = ++_nid.n] = node,
                                                           node[_uunid] = nid);
                                    if (lock[nid]) { break; }
                                    lock[nid] = 1;
                                }
                                r[++ri] = node;
                            }
                            if (type === 2) { break; }
                        }
                    }
                }
            }
            ctx = r;
            break;
        case _A_ID:     // [_A_ID, "ID"]
            type = 1;
        case _A_CLASS:  // [_A_CLASS, "CLASS"]
            ident = type ? hash.token[++i] : (" " + hash.token[++i] + " "); // "ID" or " CLASS "
            for (; j < jz; ++j) {
                node = ctx[j];
                if (type) { // ID
                    word  = xmldoc ? node.id : (node.id || node.name); // XHTML is id only
                    match = word && word === ident;
                } else {    // CLASS
                    word  = node.className;
                    match = word && ((" " + word + " ").indexOf(ident) >= 0);
                }
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR: // [_A_ATTR, "ATTR"]
            attr = hash.token[++i];

            for (; j < jz; ++j) {
                node = ctx[j];
                match =
//{{{!mb
                        _ie ? (word = node.getAttributeNode(attr),
                               word && word.specified) :
//}}}!mb
                              node.hasAttribute(attr);
                if (match ^ negate) {
                    r[++ri] = node;
                }
            }
            ctx = r;
            break;
        case _A_ATTR_VALUE: // [_A_ATTR_VALUE, "ATTR", "OPERATOR", "VALUE"]
            attr = hash.token[++i];
            ope  = hash.token[++i];
            val  = uu.trim.quote(hash.token[++i]);
//{{{!mb
            uu.ready.getAttribute || (attr = uu.attr.fix[attr] || attr);
//}}}!mb
            switch (ope) {
            case 1: val = "^" + val + "$"; break;             // [attr  = value]
            case 3: val = "^" + val;       break;             // [attr ^= value]
            case 4: val =       val + "$"; break;             // [attr $= value]
            case 5: val = "(?:^| )" + val + "(?:$| )"; break; // [attr ~= value]
            case 6: val = "^" + val + "\\-|^" + val + "$";    // [attr |= value]
            }
            rex = RegExp(val, attr in _CASESENS ? "" : "i"); // ignore case
            for (; j < jz; ++i) {
                node = ctx[j];
                word = node.getAttribute(attr, 2);
                ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_PSEUDO: // [_A_PSEUDO, 1~29]
            pseudo = hash.token[++i];
            ctx = (pseudo < 4  ? childFilter
                 : pseudo < 7  ? ofTypeFilter
                 : pseudo < 10 ? actionFilter
                 : pseudo < 13 ? formFilter
                 : pseudo < 18 ? otherFilter
                               : _userFilter)(ctx, j, jz, negate, pseudo, xmldoc);
            break;
        case _A_PSEUDO_NTH:  // [_A_PSEUDO_FUNC, 31~34, { a,b,k }]
            pseudo = hash.token[++i];
            arg    = hash.token[++i];
            ctx = (pseudo < 33 ? nthFilter
                               : nthTypeFilter)(ctx, j, jz, negate, pseudo, arg, xmldoc);
            break;
        case _A_PSEUDO_FUNC: // [_A_PSEUDO_FUNC, 31~99, arg]
            pseudo = hash.token[++i];
            arg    = hash.token[++i];
            ctx = (pseudo < 36 ? langFilter
                               : _userFunctionFilter)(ctx, j, jz, negate, pseudo, arg, xmldoc);
            break;
        case _A_PSEUDO_NOT: // [_A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ...]
            negate = 2;
            break;
        case _A_COMMA:
            mixed++ && mixin(ctx, rv, mixinLock);
            ctx = [context];
        }
        negate && --negate;
    }
    return mixed ? mixin(ctx, rv, mixinLock) : ctx;
}

// inner - mix results
function mixin(ctx, rv, mixinLock) {
    var ri = rv.length - 1, i = 0, node, nid;

    for (; i < iz; ++i) {
        node = ctx[i];
        nid = node[_uunid] || (_nid.db[nid = ++_nid.n] = node,
                               node[_uunid] = nid);
        mixinLock[nid] || (rv[++ri] = node, mixinLock[nid] = 1);
    }
    return rv;
}

// inner - 1:first-child  2:last-child  3:only-child
function childFilter(ctx, j, jz, negate, pseudo) {
    var rv = [], ri = -1, node, cn, found;

    for (; j < jz; ++j) {
        node = ctx[j];
        found = 0;
        if (pseudo & 1) { // first-child and only-child
            for (cn = node[_previousSibling]; !found && cn; cn = cn[_previousSibling]) {
                cn.nodeType === 1 && ++found;
            }
        }
        if (pseudo & 2) { // last-child and only-child
            for (cn = node[_nextSibling]; !found && cn; cn = cn[_nextSibling]) {
                cn.nodeType === 1 && ++found;
            }
        }
        ((!found) ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 4:first-of-type  5:last-of-type  6:only-of-type
function ofTypeFilter(ctx, j, jz, negate, pseudo, xmldoc) {
    var rv = [], ri = -1, node, lock = {}, tag, parent = null, cn, found, tag;

    if (pseudo < 6) { // 4:first-of-type  5:last-of-type
        (pseudo === 5) && ctx.reverse();

        for (; j < jz; ++j) {
            node = ctx[j];
            parent !== node.parentNode && (parent = node.parentNode, lock = {});
            tag = node.tagName;
            lock[tag] ? ++lock[tag] : (lock[tag] = 1);

            ((lock[tag] === 1) ^ negate) && (rv[++ri] = node);
        }
    } else { // 6:only-of-type
        for (; j < jz; ++j) {
            node = ctx[j];
            found = 0;
            tag = node.tagName,
            xmldoc || (tag = tag.toUpperCase());

            for (cn = node[_nextSibling]; !found && cn; cn = cn[_nextSibling]) {
                (cn.tagName === tag) && ++found;
            }
            for (cn = node[_previousSibling]; !found && cn; cn = cn[_previousSibling]) {
                (cn.tagName === tag) && ++found;
            }
            ((!found) ^ negate) && (rv[++ri] = node);
        }
    }
    return rv;
}

// inner - 7:hover  8:focus
function actionFilter(ctx, j, jz, negate, pseudo) {
    var rv = [], ri = -1, node, ok, cs,
        ss = uu.css("uuquery2"); // get StyleSheet object

    // http://d.hatena.ne.jp/uupaa/20080928
    ss.add(pseudo < 8 ? ":hover" : ":focus",
//{{{!mb
           _ie ? "ruby-align:center" :
//}}}!mb
                 "outline:0 solid #000");
    for (; j < jz; ++j) {
        node = ctx[j];
        ok =
//{{{!mb
             _ie ? node.currentStyle.rubyAlign === "center" :
//}}}!mb
                   (cs = uu.css(node),
                    (cs.outlineWidth + cs.outlineStyle) === "0pxsolid");
        (ok ^ negate) && (rv[++ri] = node);
    }
    ss.clear();
    return rv;
}

// inner - 10:enabled  11:disabled  12:checked
function formFilter(ctx, j, jz, negate, pseudo) {
    var rv = [], ri = -1, node, ok, test;

    for (; j < jz; ++j) {
        node = ctx[j];
        test = ok = 0;
        switch (pseudo) {
        case 10: ++test; ok =  !node.disabled; break; // 10: enabled
        case 11: ++test; ok = !!node.disabled; break; // 11: disabled
        case 12: ++test; ok = !!node.checked;  break; // 12: checked
        }
        if (test && !/^(input|button|select|option|textarea)$/i.test(node.tagName)) { // fix #144
            negate && (rv[++ri] = node);
        } else if (ok ^ negate) {
            rv[++ri] = node;
        }
    }
    return rv;
}

// inner - 13:link  14:visited  15:empty  16:root  17:target
function otherFilter(ctx, j, jz, negate, pseudo, xmldoc) {
    var rv = [], ri = -1, node, cn, ok, found, word, rex = /^a$/i,
        textContent =
//{{{!mb
                      _ie ? "innerText" :
//}}}!mb
                            "textContent";

    if (pseudo === 16 && !negate) {
        return [doc.html];
    }
    if (pseudo === 17) {
        word = location.hash.slice(1);
        word || (jz = 0); // loop out
    }
    for (; j < jz; ++j) {
        node = ctx[j];

        switch (pseudo) {
        case 15: for (found = 0, cn = node.firstChild; !found && cn; cn = cn.nextSibling) {
                    cn.nodeType === 1 && ++found;
                 }
                 ok = !found && !node[textContent]; break; // textContent very slowly
        case 16: ok = node !== doc.html; break;
        case 17: ok = xmldoc ? (node.id === word)
                             : ((node.id || node.name) === word); break;
        default: ok = rex.test(node.tagName); // :link, :visited
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 31:nth-child  32:nth-last-child
function nthFilter(ctx, j, jz, negate, pseudo, anb, xmldoc) {
    if (anb.all) {
        return negate ? [] : ctx;
    }

    var rv = [], ri = -1, nid, lock = {},
        parent, cn, idx, ok, a = anb.a, b = anb.b, k = anb.k,
        iter1 = (pseudo === 32) ? "lastChild" : "firstChild",
        iter2 = (pseudo === 32) ? "previousSibling" : "nextSibling",
        tag = ctx[0].tagName;

    xmldoc || (tag = tag.toUpperCase());

    for (; j < jz; ++j) {
        parent = ctx[j].parentNode;
        nid = parent[_uunid] || (_nid.db[nid = ++_nid.n] = parent,
                                 parent[_uunid] = nid);
        if (!lock[nid]) {
            lock[nid] = 1;

            for (idx = 0, cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === 1) {
                    ++idx;

                    ok = 0;
                    switch (k) {
                    case 1:  ok = (idx === b); break;
                    case 2:  ok = (idx >= b); break;
                    case 3:  ok = (!((idx - b) % a) && (idx - b) / a >= 0); break;
                    default: ok = (idx <= b);
                    }
                    (ok ^ negate) && cn.tagName === tag && (rv[++ri] = cn);
                }
            }
        }
    }
    return rv;
}

// inner - 33:nth-of-type  34:nth-last-of-type
function nthTypeFilter(ctx, j, jz, negate, pseudo, anb) {
    (pseudo === 34) && ctx.reverse();

    var rv = [], ri = -1, node, lock = {},
        idx, parent = null, tag, ok, a = anb.a, b = anb.b, k = anb.k;

    for (; j < jz; ++j) {
        node = ctx[j];
        parent !== node.parentNode && (parent = node.parentNode,
                                       lock = {});
        tag = node.tagName;
        lock[tag] ? ++lock[tag]
                  : (lock[tag] = 1);
        idx = lock[tag];

        ok = 0;
        switch (k) {
        case 1:  ok = (idx === b); break;
        case 2:  ok = (idx >=  b); break;
        case 3:  ok = (!((idx - b) % a) && (idx - b) / a >= 0); break;
        default: ok = (idx <=  b);
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 35:lang
function langFilter(ctx, j, jz, negate, pseudo, arg) {
    var rv = [], ri = -1, rex = RegExp("^(" + arg + "$|" + arg + "-)", "i");

    for (; j < jz; ++j) { // [!] don't touch
        node = ctx[j];
        while (node && node !== doc && !node.getAttribute("lang")) {
            node = node.parentNode;
        }
        if (((node && node !== doc) && rex.test(node.getAttribute("lang"))) ^ negate) {
            rv[++ri] = ctx[j];
        }
    }
    return rv;
}

})(document, uu);

