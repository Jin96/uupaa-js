// === Query CSS ===========================================
// depend: none
uu.feat.query_css = {};

// --- local scope -----------------------------------------
(function() {
    // root - ref document root element (<html>)
var rootElement = uudoc.documentElement ||
                  uudoc.getElementsByTagName("html")[0],
    headElement = uudoc.getElementsByTagName("head")[0],
    textContent = UU.IE || (UU.OPERA && opera.version() < 9.5) ? "innerText"
                                                               : "textContent",
    _ie         = UU.IE,
    _ie8mode8   = UU.IE8MODE8,
    // --- content-type cache (1: HTML, 2: XML) ---
    contentTypeCache = { /* uuid: contentType */ },
    // tag dict( { a: "A", A: "A", ... } )
    htmlTag = {},
    xmlTag  = {},
    QUICK_STATIC = {
      "*":      function(ctx) { return uu.tag("*", ctx); },
      "*:root": function()    { return [rootElement]; }, // fix #27 (*:root)
      ":root":  function()    { return [rootElement]; }, // fix #27 (*:root)
      "* :root":function()    { return [];            }, // fix #27b (* :root)
      "* html": function()    { return [];            }, // fix #27b (* html) IE6 CSS Hack
      "html":   function()    { return [rootElement]; },
      "head":   function()    { return [headElement]; },
      "body":   function()    { return [uudoc.body];  },
      ":link":  function()    { return uu.toArray(uudoc.links); } // spoof
    },
    TRIM_QUOTE  = /^\s*["']?|["']?\s*$/g,
    QUICK_QUERY = /^(?:\*?(\.|#)([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)|(\w+)(?:\s*,\s*(\w+)(?:\s*,\s*(\w+))?)?|(\w+)\s+(\w+)(?:\s+(\w+))?)$/i,
    QUICK_HEAD  = /^#([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)\b(?![#\.:\[])|^((?:\.[a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)+)$/i, // ]
    QUICK_COMMA = /^[^"'\(\)]*,/,
    ROOT_REJECT = /[a-z]+\-(child|type)$/,
    ID_OR_CLASS = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i,
    CHILD       = /^\s*(?:([>+~])\s*)?(\*|\w*)/,
    GROUP       = /^\s*,\s*/,
    PSEUDO      = /^(?::(not)\((?:(\*)|(\w+)|[#\.][a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*|\[\s*(?:[^~\^$*|=!\/\s]+\s*[~\^$*|!\/]?\=\s*(["'])?.*?\4i?|[^\]\s]+)\s*\]|:contains\((["'])?.*?\5\)|::?[\w\-]+(?:\([^\u0029]+\))?)\)|:contains\((["'])?(.*?)\6\)|::?([\w\-]+)(?:\((.*)\))?)/i,
    ATTR        = /^\[\s*(?:([^~\^$*|=!\/\s]+)\s*([~\^$*|!\/]?\=)\s*(["'])?(.*?)\3(i?)|([^\]\s]+))\s*\]/,
    STYLE       = /^\{\s*([^\^$*=!<>&\/\s]+)\s*(:|[\^$*!<>&\/]?\=)\s*(["'])?(.*?)\3(i?)\s*\}/,
    NTH_ANB     = /^((even)|(odd)|(1n\+0|n\+0|n)|(\d+)|((-?\d*)n([+\-]?\d*)))$/,
    TAG_DICT    = "*,div,p,a,ul,ol,li,span,td,tr,dl,dt,dd,h1,h2,h3,h4,iframe,form,input,textarea,select,body,style,script",
    JOINT1      = { ">": 1, "+": 2, "~": 3 },
    JOINT2      = { "#": 1, ".": 2, ":": 3, "[": 4, "{": 5 }, // }]
    ATTR_ALIAS  = { "class": "className", "for": "htmlFor" },
    ATTR_IE_BUG = { href: 1, src: 1 },
    ATTR_OPERATOR = { "=": 1, "!=": 2, "*=": 3, "^=": 4,
                              "$=": 5, "~=": 6, "|=": 7, "/=": 8 },
    ATTR_CASESENS = { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    FILTER_MAP  = {
      "first-child":      [0x01, childFilter],
      "last-child":       [0x02, childFilter],
      "only-child":       [0x03, childFilter],
      "nth-child":        [0x04, nthChildFilter],
      "nth-last-child":   [0x05, nthChildFilter],
      "nth-of-type":      [0x06, nthOfTypeFilter],
      "nth-last-of-type": [0x07, nthOfTypeFilter],
      "first-of-type":    [0x09, ofTypeFilter],
      "last-of-type":     [0x0a, ofTypeFilter],
      enabled:            [0x0b, simpleFilter],
      disabled:           [0x0c, simpleFilter],
      checked:            [0x0d, simpleFilter],
      // [0x0e - 0x11] reserved.
      link:               [0x0e, link],
      empty:              [0x12, empty],
      lang:               [0x13, lang],
      "only-of-type":     [0x14, onlyOfType],
      // [0x15] reserved.
      root:               [0x16, root],
      target:             [0x17, target],
      contains:           [0x18, contains],
      // [0x40 - 0x43] reserved.
      before:             [0xf00, null], // bit 0x100: use flag
      after:              [0xf00, null], // bit 0x200: none operation flag
      "first-letter":     [0xf00, null], // bit 0x400: :not exclude flag
      "first-line":       [0xf00, null]  // bit 0x800: need double semicolon(::) flag
    };

function quickQuery(match, context, really) {
  var rv = [], ri = -1, unq = {}, uuid,
      m1, m2, m3, nodeList1, nodeList2, nodeList3,
      v, i, j, k, iz, jz, kz;

  // "#id" or ".class"
  if (match[1]) {
    if (match[1] === ".") {
      return uu.className(match[2], context, really);
    }
    nodeList1 = (context.ownerDocument || uudoc).getElementById(match[2]);
    return nodeList1 ? [nodeList1] : [];
  }

  // "E" or "E,F" or "E,F,G"
  if (match[3]) {
    m1 = match[3], m2 = match[4], m3 = match[5];
    if (/^\d+$/.test(m1) || /^\d+$/.test(m2) || /^\d+$/.test(m3)) {
      throw expr + " syntax error";
    }

    unq[m1] = 1, nodeList1 = uu.toArray(context.getElementsByTagName(m1));
    if (m2 && !(m2 in unq)) {
      unq[m2] = 1, nodeList2 = uu.toArray(context.getElementsByTagName(m2));
    }
    if (m3 && !(m3 in unq)) {
      unq[m3] = 1, nodeList3 = uu.toArray(context.getElementsByTagName(m3));
    }
    return [].concat(nodeList1, nodeList2 || [], nodeList3 || []);
  }

  // "E F" or "E F G"
  m1 = match[6], m2 = match[7], m3 = match[8];

  nodeList1 = context.getElementsByTagName(m1); // "E"
  for (i = 0, iz = nodeList1.length; i < iz; ++i) {
    nodeList2 = nodeList1[i].getElementsByTagName(m2); // "E F"
    for (j = 0, jz = nodeList2.length; j < jz; ++j) {
      if (m3) {
        nodeList3 = nodeList2[j].getElementsByTagName(m3); // "E F G"
        for (k = 0, kz = nodeList3.length; k < kz; ++k) {
          v = nodeList3[k];
          uuid = v.uuid || (v.uuid = ++uu._uuid);
          if (!(uuid in unq)) {
            rv[++ri] = v;
            unq[uuid] = 1;
          }
        }
      } else {
        v = nodeList2[j];
        uuid = v.uuid || (v.uuid = ++uu._uuid);
        if (!(uuid in unq)) {
          rv[++ri] = v;
          unq[uuid] = 1;
        }
      }
    }
  }
  return rv;
}

// uu.css.querySelectorAll
uu.css.querySelectorAll = function(expr, context, really) {
  var _contentType, _tags, _ie = UU.IE, // alias
      // --- double registration guard ---
      uuid,       // unique-id
      guard = {}, // global guard
      unq   = {}, // local guard
      mixed = 0,  // 1: mixed
      // --- result and context elements ---
      rv  = [], ri, r,
      ctx = [context],
      // --- loop out flag --
      lastExpr1,  // last expr for outer loop
      lastExpr2,  // last expr for inner loop
      // --- iterator and loop counter ---
      i, j, iz,
      // --- work ---
      withComma = expr.indexOf(",") >= 0, // with comma(",")
      tag,        // the E or F or universal selector("*")
      isUniversal,// true: tag is universal selector("*")
      joint,      // >+~_#.:[     // ]
      nodeList, needle, pseudo, v, w, operator, match, negate = 0;

  if (/^[>+~]|[>+~*]{2}|[>+~]$/.test(expr)) {
    throw expr + " syntax error";
  }

  // --- Quick phase ---
  if (!withComma && expr in QUICK_STATIC) { // "*" ":root" "body" ...
    return QUICK_STATIC[expr](context);
  }
  if ( (match = QUICK_QUERY.exec(expr)) ) { // "#id" ".class" "E" "E F" "E,F"...
    return quickQuery(match, context, really);
  }
  if (withComma && QUICK_COMMA.test(expr)) { // split("#id, .class, E")
    w = expr.split(","); // "expr, expr, expr"
    for (i = 0, iz = w.length; i < iz; ++i) {
      v = w[i].replace(UU.UTIL.TRIM, "");
      if (!v) { throw expr + " syntax error"; }
      r = uu.css.querySelectorAll(v, context, really);
      mix(r, rv, unq);
    }
    return rv;
  }
  if (!withComma) {
    if ( (match = QUICK_HEAD.exec(expr)) ) {
      if (match[1]) {
        w = uudoc.getElementById(match[1]);
        ctx = w ? [w] : [];
      } else {
        v = match[2].replace(/\./g, " "); // ".class.class" -> " class class"
        return uu.className(v, context);
      }
      expr = expr.slice(match[0].length);
    }
  }

  // init tag set
  uuid = context.uuid || (context.uuid = ++uu._uuid);
  _contentType = contentTypeCache[uuid] ||
                    (contentTypeCache[uuid] = getContentType(context));
  _tags = _contentType === 1 ? htmlTag : xmlTag;

  // --- Generic phase ---
  while (expr && expr !== lastExpr1) { // outer loop
    lastExpr1 = expr;

    r = [], ri = -1, unq = {}, i = 0, iz = ctx.length;

    // "E > F"  "E + F"  "E ~ F"  "E"  "E F" phase
    if ( (match = CHILD.exec(expr)) ) {
      tag = match[2];
      tag = tag ? (_tags[tag] || addTag(tag, _contentType)) : "*";
      isUniversal = tag === "*"; // true: tag is universal selector

      if (match[1]) {
        joint = JOINT1[match[1]];

        if (joint === 1) { // 1: "E > F"
          for (; i < iz; ++i) {
            for (v = ctx[i].firstChild; v; v = v.nextSibling) {
              if (v.nodeType === 1) {
                if (isUniversal || v.tagName === tag) {
                  r[++ri] = v;
                }
              }
            }
          }
        } else if (joint === 2) { // 2: "E + F"
          for (; i < iz; ++i) {
            for (v = ctx[i].nextSibling; v; v = v.nextSibling) {
              if (v.nodeType === 1) {
                if (_ie) {
                  w = v.tagName;
                  if (!w.indexOf("/")) { continue; } // fix #25
                  if (isUniversal || w === tag) {
                    r[++ri] = v;
                  }
                } else {
                  if (isUniversal || v.tagName === tag) {
                    r[++ri] = v;
                  }
                }
                break;
              }
            }
          }
        } else { // 3: "E ~ F"
          for (; i < iz; ++i) {
            for (v = ctx[i].nextSibling; v; v = v.nextSibling) {
              if (v.nodeType === 1) {
                if (isUniversal || v.tagName === tag) {

                  uuid = v.uuid || (v.uuid = ++uu._uuid);
                  if (uuid in unq) {
                    break;
                  } else {
                    r[++ri] = v;
                    unq[uuid] = 1;
                  }
                }
              }
            }
          }
        }
      } else {
        // >+~ is not found
        if (iz === 1) {
          r = uu.tag(tag, ctx[0]);
        } else {
          for (; i < iz; ++i) {
            nodeList = ctx[i].getElementsByTagName(tag);

            // tag("*") has text/comment node(in IE)
            j = 0;
            while ( (v = nodeList[j++]) ) {
              if (!_ie || !isUniversal || v.nodeType === 1) {
                if (isUniversal || v.tagName === tag) {

                  uuid = v.uuid || (v.uuid = ++uu._uuid);
                  if (!(uuid in unq)) {
                    r[++ri] = v;
                    unq[uuid] = 1;
                  }
                }
              }
            }
          }
        }
      }
      ctx = r;
      expr = expr.slice(match[0].length);
    }

    // Attribute, Class, Pseudo, ID phase
    while (expr && expr !== lastExpr2) { // inner loop
      lastExpr2 = expr;
      match = null;

      r = [], ri = -1, i = 0;

      joint = JOINT2[expr.charAt(0)] || 9; // 9: dummy

      switch (joint) {
      case 1: // 1: "#id"
        if ( (match = ID_OR_CLASS.exec(expr)) ) {
          needle = match[1]; // "id"

          if (_contentType === 1) { // 1:html (match id or name)
            while ( (v = ctx[i++]) ) {
              if (((w = v.id || v.name) && (w === needle)) ^ negate) {
                r[++ri] = v;
              }
            }
          } else { // 2: xml (match id)
            while ( (v = ctx[i++]) ) {
              if (((w = v.id) && (w === needle)) ^ negate) {
                r[++ri] = v;
              }
            }
          }
        }
        break;

      case 2: // 2: ".class"
        if ( (match = ID_OR_CLASS.exec(expr)) ) {
          needle = (" " + match[1] + " "); // " className "

          while ( (v = ctx[i++]) ) {
            if (((w = v.className) &&
                ((" " + w + " ").indexOf(needle) >= 0)) ^ negate) {
              r[++ri] = v;
            }
          }
        }
        break;

      case 3: // 3: pseudo
        if ( (match = PSEUDO.exec(expr)) ) {
          if ( (iz = ctx.length) ) {
            if (match[1]) { // :not(...)
              if (negate) {
                throw ":not(:not(...)) syntax error";
              }
              if (match[2]) { // :not(*)
                break;
              }
              if (match[3]) { // ':not(div)' -> match[3] = "div"
                tag = match[3];
                tag = _tags[tag] || addTag(tag, _contentType);
                while ( (v = ctx[i++]) ) {
                  (v.tagName !== tag) && (r[++ri] = v);
                }
                break;
              }
              w = expr.slice(match[0].length); // remain expr
              expr = match[0].replace(/^:not\(\s*|\s*\)$/g, "") + w;
              ++negate;
              continue;
            } else {
              pseudo = match[8] || "contains";

              // ":root:xxx-child" or ":root:xxx-type" -> not match
              // ":root:not(:first-child)"             -> match root element
              if (iz === 1 && ctx[0] === rootElement
                           && ROOT_REJECT.test(pseudo)) {
                r = negate ? [rootElement] : [];
              } else {
                if ( !(v = FILTER_MAP[pseudo]) ) {
                  throw ":" + pseudo + " unsupported";
                }
                w = v[0];
                if (w & 0x100) {
                  if ((w & 0x800) && !/^::/.test(expr)) {
                    throw match[0] + " syntax error(need ::)";
                  }
                  if ((w & 0x400) && negate) {
                    throw ":not(" + match[0] + ") syntax error(exclude pseudo-element)";
                  }
                  if (w & 0x200) { // 0x100 is none operation
                    r = negate ? [] : ctx;
                    break;
                  }
                }
                r = v[1].call(this, w, negate, ctx, pseudo,
                              match[9] || match[7], _tags, _contentType);
              }
            }
          }
        }
        break;

      case 4: // 4: Attr "[A=V]" or "[A]"
        if ( (match = ATTR.exec(expr)) ) {
          if (match[6]) { // "[A]"
            needle = match[6];

            while ( (v = ctx[i++]) ) {
              if (_ie) {
                w = v.getAttributeNode(needle);
                if ((w && w.specified) ^ negate) {
                  r[++ri] = v;
                }
              } else if (v.hasAttribute(needle) ^ negate) {
                r[++ri] = v;
              }
            }
          } else { // "[A=V]"
            needle = match[4].replace(/^\s*["']|["']\s*$/g, "");
            operator = ATTR_OPERATOR[match[2]];
            if (!operator) {
              throw match[0] + " unsupported";
            }
            w = match[5] || ""; // regexp flag

            if (operator === 8) { // 8: "/=" is regexp operator
              needle = RegExp(needle, w);
            } else {
              // fix [class=i] -> match[4] = "", match[5] = "i"
              w && (needle += w);
            }
            r = judgeAttr(negate, ctx, match[1], operator, needle);
          }
        }
        break;

      case 5: // 5: Style "{S=V}" or "{S}"
        if ( (match = STYLE.exec(expr)) ) {
          r = uu.css.querySelectorAll.styleQuery(negate, ctx, match);
        }
      }

      if (match) {
        ctx = r;
        expr = expr.slice(match[0].length);
        negate = 0;
      }
    }

    // "E,F" phase
    if (withComma && expr && (match = GROUP.exec(expr)) ) {
      ++mixed;
      mix(ctx, rv, guard);
      ctx = [context];
      lastExpr1 = lastExpr2 = "";
      expr = expr.slice(match[0].length);
    }
  }

  if (expr.length) {
    throw expr + " unsupported";
  }
  return mixed ? mix(ctx, rv, guard) : ctx;
}

// mix results
function mix(ctx, rv, unq) {
  var ri = rv.length - 1, i = 0, v, uuid;

  while ( (v = ctx[i++]) ) {
    uuid = v.uuid || (v.uuid = ++uu._uuid);

    if (!(uuid in unq)) {
      rv[++ri] = v;
      unq[uuid] = 1;
    }
  }
  return rv;
}

function getContentType(context) {
  var owner = context.ownerDocument || uudoc,
      p = owner.createElement("p"),
      P = owner.createElement("P");
  // see http://d.hatena.ne.jp/uupaa/20081010/1223630689 [THX! id:os0x]
  return p.tagName === P.tagName ? 1 : 2; // 1: HTMLDocument, 2: XMLDocument
}

function addTag(tag, contentType) {
  var lo = tag.toLowerCase(),
      up = tag.toUpperCase();
  if (!(lo in htmlTag)) {
    xmlTag[up] = htmlTag[lo] = htmlTag[up] = up;
    xmlTag[lo] = lo;
  }
  return contentType === 1 ? up : tag;
}

// [attr operator "value"]
function judgeAttr(negate, elms, attr, operator, value) {
  var rv = [], ri = -1, r, e, v = value, i = 0, rex,
      attrFlag = 0, // attrFlag: ie only
      isInsens = !(attr in ATTR_CASESENS); // true: case insensitive

  if (_ie) {
    if (_ie8mode8 || ATTR_IE_BUG[attr]) { // fix a[href^="#"]
      attrFlag = 2;
    } else {
      attr = ATTR_ALIAS[attr] || attr;
    }
  }

  if (operator < 3) { // [attr = value] or [attr != value]
    --operator;
    if (isInsens) {
      v = v.toLowerCase();
    }
    while ( (e = elms[i++]) ) {
      if ( (r = e.getAttribute(attr, attrFlag)) ) {
        if (isInsens) {
          r = r.toLowerCase();
        }
        ((v === r) ^ operator ^ negate) && (rv[++ri] = e);
      }
    }
  } else {
    switch (operator) {
    case 3: rex = v; break;                           // [attr *= value]
    case 4: rex = "^" + v; break;                     // [attr ^= value]
    case 5: rex = v + "$"; break;                     // [attr $= value]
    case 6: if (v.indexOf(" ") >= 0) { return rv; }   // fix #7b
            rex = "(?:^| )" + v + "(?:$| )"; break;   // [attr ~= value]
    case 7: rex = "^" + v + "\\-|^" + v + "$"; break; // [attr |= value]
    }
    if (rex) {
      v = RegExp(rex, isInsens ? "i": "");
    }
    while ( (e = elms[i++]) ) {
      r = e.getAttribute(attr, attrFlag);
      if ((r && v.test(r)) ^ negate) {
        rv[++ri] = e;
      }
    }
  }
  return rv;
}

// :first-child  :last-child  :only-child
function childFilter(fid, negate, elms) {
  var rv = [], ri = -1, i = 0, v, c, f,
      iter1 = "previousSibling",
      iter2 = "nextSibling";

  while ( (v = elms[i++]) ) {
    f = 0;
    // first-child
    if (fid & 1) {
      for (c = v[iter1]; c; c = c[iter1]) {
        if (c.nodeType === 1) {
          ++f;
          break;
        }
      }
    }
    // last-child
    if (!f && fid & 2) {
      for (c = v[iter2]; c; c = c[iter2]) {
        if (c.nodeType === 1) {
          ++f;
          break;
        }
      }
    }
    if ((!f) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :nth-child  :nth-last-child
function nthChildFilter(fid, negate, elms, pseudo, value, tags, contentType) {
  if (value === "n") {
    return negate ? [] : elms;
  }
  // 0x4 = nth-child, 0x5 = nth-last-child
  var v = elms[0].tagName,
      tag = tags[v] || addTag(v, contentType),
      rv = [], ri = -1, i = 0, iz = elms.length, uuid, unq = {},
      pn, cn, idx, ok,
      iter1 = (fid === 0x5) ? "lastChild" : "firstChild",
      iter2 = (fid === 0x5) ? "previousSibling" : "nextSibling",
      f = nth(value), a = f.a, b = f.b, k = f.k;

  for (; i < iz; ++i) {
    pn = elms[i].parentNode;
    uuid = pn.uuid || (pn.uuid = ++uu._uuid);

    if (!(uuid in unq)) {
      unq[uuid] = 1;
      idx = 0;

      for (cn = pn[iter1]; cn; cn = cn[iter2]) {
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

// :nth-of-type  :nth-last-of-type
function nthOfTypeFilter(fid, negate, elms, pseudo, value) {
  if (fid === 0x07) { // 0x07: nth-last-of-type
    elms.reverse();
  }

  var rv = [], ri = -1, v, i = 0, unq = {},
      idx, pn, currentParent = null, tagName, ok,
      f = nth(value), a = f.a, b = f.b, k = f.k;

  while ( (v = elms[i++]) ) {
    pn = v.parentNode;
    if (pn !== currentParent) {
      currentParent = pn;
      unq = {};
    }

    tagName = v.tagName;
    if (tagName in unq) {
      ++unq[tagName];
    } else {
      unq[tagName] = 1;
    }
    idx = unq[tagName];
    ok = 0;

    switch (k) {
    case 1:  ok = (idx === b); break;
    case 2:  ok = (idx >=  b); break;
    case 3:  ok = (!((idx - b) % a) && (idx - b) / a >= 0); break;
    default: ok = (idx <=  b);
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :first-of-type  :last-of-type
function ofTypeFilter(fid, negate, elms) {
  if (fid === 0x0a) { // 0x0a: last-of-type
    elms.reverse();
  }
  var rv = [], ri = -1, v, i = 0, unq = {},
      pn, currentParent = null;

  while ( (v = elms[i++]) ) {
    pn = v.parentNode;
    if (pn !== currentParent) {
      currentParent = pn;
      unq = {};
    }
    if (v.tagName in unq) {
      ++unq[v.tagName];
    } else {
      unq[v.tagName] = 1;
    }
    if ((unq[v.tagName] === 1) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :enabled  :disabled  :checked  :digit  :negative  :tween  :playing
function simpleFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok, needValidate,
      rex = /^(input|button|select|option|textarea)$/i;

  while ( (v = elms[i++]) ) {
    needValidate = ok = 0;
    switch (fid) {
    case 0x0b: ++needValidate; ok = !v.disabled; break;  // 0x0b: enabled
    case 0x0c: ++needValidate; ok = !!v.disabled; break; // 0x0c: disabled
    case 0x0d: ++needValidate; ok = !!v.checked; break;  // 0x0d: checked
    }

    if (needValidate && !rex.test(v.tagName)) { // fix #144
      if (negate) {
        rv[++ri] = v;
      }
    } else if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :root
function root(fid, negate, elms) {
  if (!negate) {
    return [rootElement];
  }
  var rv = [], ri = -1, v, i = 0;
  while ( (v = elms[i++]) ) {
    if (v !== rootElement) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :target
function target(fid, negate, elms, pseudo, value, tags, contentType) {
  var rv = [], ri = -1, i = 0, v, needle = location.hash.slice(1);

  if (needle) {
    if (contentType === 1) { // 1: html
      while ( (v = elms[i++]) ) {
        (((v.id || v.name) === needle) ^ negate) && (rv[++ri] = v);
      }
    } else { // 2: xml
      while ( (v = elms[i++]) ) {
        ((v.id === needle) ^ negate) && (rv[++ri] = v);
      }
    }
  }
  return rv;
}

// :contains
function contains(fid, negate, elms, pseudo, value) {
  valie = value.replace(TRIM_QUOTE, "");
  var rv = [], ri = -1, v, i = 0,
      _textContent = textContent;

  while ( (v = elms[i++]) ) {
    if ((v[_textContent].indexOf(value) >= 0) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :link
function link(fid, negate, elms) {
  var rv = [], ri = -1, ary = uu.toArray(uudoc.links), v, i = 0,
      j = 0, jz = elms.length, hit;
  while ( (v = ary[i++]) ) {
    for (hit = -1, j = 0; j < jz; ++j) {
      if (elms[j] === v) {
        hit = j;
        break;
      }
    }
    if ((hit >= 0) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :empty
function empty(fid, negate, elms) {
  var rv = [], ri = -1, i = 0, v, c, missMatch = 0,
      _textContent = textContent;
  while ( (v = elms[i++]) ) {
    missMatch = 0;
    for (c = v.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) {
        ++missMatch;
        break;
      }
    }
    // touch(v.textContent) very slowly
    if ((!missMatch && !v[_textContent]) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// :lang
function lang(fid, negate, elms, pseudo, value) {
  var rv = [], ri = -1, v, i = 0, iz = elms.length,
      rex = RegExp("^(" + value + "$|" + value + "-)", "i");

  for (; i < iz; ++i) { // don't touch me
    v = elms[i];
    while (v && v !== uudoc && !v.getAttribute("lang")) {
      v = v.parentNode;
    }
    if (((v && v !== uudoc) && rex.test(v.getAttribute("lang"))) ^ negate) {
      rv[++ri] = elms[i];
    }
  }
  return rv;
}

// :only-of-type
function onlyOfType(fid, negate, elms, pseudo, value, tags, contentType) {
  var rv = [], ri = -1, v, i = 0, c, f, t, tagName,
      iter1 = "nextSibling",
      iter2 = "previousSibling";

  while ( (v = elms[i++]) ) {
    f = 0;
    tagName = v.tagName,
    t = tags[tagName] || addTag(tagName, contentType);
    for (c = v[iter1]; c; c = c[iter1]) {
      if (c.nodeType === 1 && c.tagName === t) {
        ++f;
        break;
      }
    }
    if (!f) {
      for (c = v[iter2]; c; c = c[iter2]) {
        if (c.nodeType === 1 && c.tagName === t){
          ++f;
          break;
        }
      }
    }
    if ((!f) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// parse :nth-xxx(an+b)
function nth(anb) {
  var a, b, c, match = NTH_ANB.exec(anb);

  if (!match) { throw anb + " unsupported"; }
  if (match[2]) { return { a: 2, b: 0, k: 3 }; } // nth(even)
  if (match[3]) { return { a: 2, b: 1, k: 3 }; } // nth(odd)
  if (match[4]) { return { a: 0, b: 0, k: 2 }; } // nth(1n+0), nth(n+0), nht(n)
  if (match[5]) { return { a: 0, b: parseInt(match[5], 10), k: 1 }; } // nth(1)
  a = (match[7] === "-" ? -1 : match[7] || 1) - 0;
  b = (match[8] || 0) - 0;
  c = a < 2;
  return {
    a: c ? 0 : a,
    b: b,
    k: c ? a + 1 : 3
  };
}

// --- export ---
uu.mix(uu.css.querySelectorAll, {
  styleQuery:  function() { return []; }, // dummy function
  childFilter: childFilter,
  FILTER_MAP:  FILTER_MAP
});

(function() {
  // create tag dict.
  var ary = TAG_DICT.split(","), i = 0, iz = ary.length;
  for (; i < iz; ++i) {
    addTag(ary[i]);
  }
})();

(function() {
  // prebuild node.uuid
  function prebuild() {
    var ary = uu.tag("*"), v, i = 0, iz = ary.length;
    for (; i < iz; ++i) {
      v = ary[i];
      v.uuid || (v.uuid = ++uu._uuid);
    }
  }
  UU.IE ? window.attachEvent("onload", prebuild)
        : window.addEventListener("load", prebuild, false);
})();

})(); // end (function())() scope
