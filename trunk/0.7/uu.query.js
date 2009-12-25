
// === CSS3 Selector ===
// depend: uu.js, uu.color.js, uu.css.js
uu.waste || (function(win, doc, uu, _cstyle, _innerText) {
var _ssid   = "uuqueryss", // StyleSheet ID
    // --- content-type cache (1: HTML, 2: XML) ---
    _ctypedb      = {}, // { quid: contentType }
    _htmltagdb    = {}, // tag dict( { a: "A", A: "A", ... } )
    _xmltagdb     = {},
    _ndiddb       = uupub.ndiddb,
    _HTML5TAG     = uupub.HTML5TAG + ",", // add tail comma
    _QUICK_STATIC = {
      "*":      function(ctx) { return uu.tag("*", ctx); },
      "*:root": function() { return [uupub.root]; }, // fix #27 (*:root)
      ":root":  function() { return [uupub.root]; }, // fix #27 (*:root)
      "* :root":function() { return []; }, // fix #27b (* :root)
      "* html": function() { return []; }, // fix #27b (* html) IE6 CSS Star Hack
      html:     function() { return [uupub.root]; },
      head:     function() { return [uu.head()]; },
      body:     function() { return [doc.body]; },
      ":link":  function() { return uu.ary(doc.links); } }, // spoof
    // :after :before :contains :digit :first-letter :first-line :link
    // :negative :playing :target :visited  !=  ?=  /=  <=  >=  &=  {  }
    _SYNTAX_ERROR = /^[>+~]|[>+~*]{2}|[>+~]$/,
    _SYNTAX_ERROR2= /\\ /,
    _DOT_TO_SPACE = /\./g,
    _TRIM_NOT     = /^:not\(\s*|\s*\)$/g,
    _DOUBLE_COLON = /^::/,
    _QUICK_QUERY  = /^(?:\*?(\.|#)([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)|(\w+)(?:\s*,\s*(\w+)(?:\s*,\s*(\w+))?)?|(\w+)\s+(\w+)(?:\s+(\w+))?)$/i,
    _QUICK_HEAD   = /^#([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)\b(?![#\.:\[])|^((?:\.[a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)+)$/i, // ]
    _QUICK_COMMA  = /^[^"'\(\)]*,/,
    _ROOT_REJECT  = /[a-z]+\-(child|type)$/,
    _ID_OR_CLASS  = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i,
    _CHILD        = /^\s*(?:([>+~])\s*)?(\*|\w*)/,
    _GROUP        = /^\s*,\s*/,
    _PSEUDO       = /^(?::(not)\((?:(\*)|(\w+)|[#\.][a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*|\[\s*(?:[^~\^$*|=!\/\s]+\s*[~\^$*|!\/]?\=\s*(["'])?.*?\4i?|[^\]\s]+)\s*\]|:contains\((["'])?.*?\5\)|::?[\w\-]+(?:\([^\u0029]+\))?)\)|:contains\((["'])?(.*?)\6\)|::?([\w\-]+)(?:\((.*?)\))?)/i,
    _ATTR         = /^\[\s*(?:([^~\^$*|=!\/\s]+)\s*([~\^$*|!\/]?\=)\s*(["'])?(.*?)\3(i?)|([^\]\s]+))\s*\]/,
    _STYLE        = /^\{\s*([^\^$*=!<>&\/\s]+)\s*(:|[\^$*!<>&\/]?\=)\s*(["'])?(.*?)\3(i?)\s*\}/,
    _STYLE_RANGE  = /\s*\~\s*/, // {prop&=0x0~0xf}  style range operator
    _QUICK_DIGIT  = /^\d+$/,
    _DIGIT_FILTER = /^\s*(?:[\-+]?)[\d,\.]+\s*$/,
    _NEGATIVE_FILTER = /^\s*\-[\d,\.]+\s*$/,
    _FORM_TAGS    = /^(input|button|select|option|textarea)$/i,
    _BACKSLASH    = /\\/,
    _JOINT1       = { ">": 1, "+": 2, "~": 3 },
    _JOINT2       = { "#": 1, ".": 2, ":": 3, "[": 4, "{": 5 }, // }]
    _NTH_ANB      = /^((even)|(odd)|(1n\+0|n\+0|n)|(\d+)|((-?\d*)n([+\-]?\d*)))$/,
    _ATTR_ALIAS   = { "class": "className", "for": "htmlFor" },
    _ATTR_IE_BUG  = { href: 1, src: 1 },
    _ATTR_OPERATOR= { "=": 1, "!=": 2, "*=": 3, "^=": 4,
                              "$=": 5, "~=": 6, "|=": 7, "/=": 8 },
    _ATTR_CASESENS= { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    _EX_PROP_KIND = { color: 1, backgroundColor: 1, opacity: 2, width: 3, height: 4,
                      left: 5, top: 5, right: 5, bottom: 5, backgroundImage: 6 },
    _EX_OPERATOR  = { ":": 1,     // E{prop : value}             match
                      "=": 1,     // E{prop = value}             match
                      "!=": 2,    // E{prop != value}            not match
                      "*=": 3,    // E{prop *= value}            match somewhere
                      "^=": 4,    // E{prop ^= value}            match head
                      "$=": 5,    // E{prop $= value}            match tail
                      "/=": 8,    // E{prop /= "value"}          match Regexp
                      ">=": 9,    // E{prop >= value}            more than
                      "<=": 10,   // E{prop <= value}            less than
                      "&=": 11 }, // E{prop &= value1 ~ value2}  from value1 to value2
    _DUMMY = function() { return []; },
    _FILTERS = {
      "first-child":    [0x01, uuquerychildfilter],
      "last-child":     [0x02, uuquerychildfilter],
      "only-child":     [0x03, uuquerychildfilter],
      "nth-child":      [0x04, nthChildFilter],
      "nth-last-child": [0x05, nthChildFilter],
      "nth-of-type":    [0x06, nthOfTypeFilter],
      "nth-last-of-type":
                        [0x07, nthOfTypeFilter],
      "first-of-type":  [0x09, ofTypeFilter],
      "last-of-type":   [0x0a, ofTypeFilter],
      enabled:          [0x0b, simpleFilter],
      disabled:         [0x0c, simpleFilter],
      checked:          [0x0d, simpleFilter],
      link:             [0x0e, uu.config.visited ? visitedFilter : link],
      visited:          [0x0f, uu.config.visited ? visitedFilter : _DUMMY],
      hover:            [0x10, actionFilter],
      focus:            [0x11, actionFilter],
      empty:            [0x12, empty],
      lang:             [0x13, lang],
      "only-of-type":   [0x14, onlyOfType],
      // [0x15] reserved.
      root:             [0x16, root],
      target:           [0x17, target],
      contains:         [0x18, contains],
      digit:            [0x40, extendFilter],
      negative:         [0x41, extendFilter],
      tween:            [0x42, extendFilter],
      boxeffect:        [0x43, extendFilter],
      mom:              [0x44, parentFilter],
      ui:               [0x50, uiFilter],
      uislider:         [0x51, uiFilter],
      // bit information
      //    0x100: use flag
      //    0x200: none operation flag
      //    0x400: :not exclude flag
      //    0x800: need double-semicolon(::) flag
      before:           [0xf00, null],
      after:            [0xf00, null],
      "first-letter":   [0xf00, null],
      "first-line":     [0xf00, null] };

if (uu.config.visited) {
  delete _QUICK_STATIC[":link"];
}

uu.mix(uu.query, {
  selectorAll:        uuqueryselectorall,
  childFilter:        uuquerychildfilter,
  filters:            _FILTERS
});

// inner -
function quickQuery(expr, match, context) {
  var rv = [], ri = -1, unq = {}, uid, newid,
      m1, m2, m3, nodeList1, nodeList2, nodeList3,
      v, i, j, k, iz, jz, kz;

  // "#id" or ".class"
  if (match[1]) {
    if (match[1] === ".") {
      return uu.klass(match[2], context);
    }
    nodeList1 = (context.ownerDocument || doc).getElementById(match[2]);
    return nodeList1 ? [nodeList1] : [];
  }

  // "E" or "E,F" or "E,F,G"
  if (match[3]) {
    m1 = match[3], m2 = match[4], m3 = match[5];
    if (_QUICK_DIGIT.test(m1) ||
        _QUICK_DIGIT.test(m2) ||
        _QUICK_DIGIT.test(m3)) {
      throw expr + " syntax error";
    }

    unq[m1] = 1;
    nodeList1 = uu.ary(context.getElementsByTagName(m1));

    if (m2 && !(m2 in unq)) {
      unq[m2] = 1;
      nodeList2 = uu.ary(context.getElementsByTagName(m2));
    }

    if (m3 && !(m3 in unq)) {
      unq[m3] = 1;
      nodeList3 = uu.ary(context.getElementsByTagName(m3));
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
          uid = v.uuguid ||
              (_ndiddb[v.uuguid = newid = ++uupub.ndidseed] = v, newid);
          uid in unq || (rv[++ri] = v, unq[uid] = 1);
        }
      } else {
        v = nodeList2[j];
        uid = v.uuguid ||
            (_ndiddb[v.uuguid = newid = ++uupub.ndidseed] = v, newid);
        uid in unq || (rv[++ri] = v, unq[uid] = 1);
      }
    }
  }
  return rv;
}

// uu.query.selectorAll
function uuqueryselectorall(expr,      // @param String: expr
                            context) { // @param Node/NodeArray:
  expr = uu.trim(expr);
  var _ctype, // content-type
      _tags,  // alias
      // --- double registration guard ---
      uid,        // unique-id
      guard = {}, // global guard
      unq   = {}, // local guard
      mixed = 0,  // 1: mixed
      // --- result and context elements ---
      rv  = [], ri, r,
      ctx = context.nodeType ? [context] : context,
      // --- loop out flag --
      lastExpr1,  // last expr for outer loop
      lastExpr2,  // last expr for inner loop
      // --- iterator and loop counter ---
      i, j, iz,
      // --- work ---
      withComma = expr.indexOf(",") >= 0, // with comma(",")
      tag,         // the E or F or universal selector("*")
      isUniversal, // true: tag is universal selector("*")
      joint,       // >+~_#.:[     // ]
      nodeList, needle, pseudo, v, w, operator, match, negate = 0;

  if (_SYNTAX_ERROR.test(expr)) {
    throw expr + " syntax error";
  }

  // --- Quick phase ---
  if (context.nodeType) {
    if (!withComma && expr in _QUICK_STATIC) { // "*" ":root" "body" ...
      return _QUICK_STATIC[expr](context);
    }
    match = _QUICK_QUERY.exec(expr); // "#id" ".class" "E" "E F" "E,F"...
    if (match) {
      return quickQuery(expr, match, context);
    }
    if (withComma && _QUICK_COMMA.test(expr)) { // split("#id, .class, E")
      w = expr.split(","); // "expr, expr, expr"
      for (i = 0, iz = w.length; i < iz; ++i) {
        v = uu.trim(w[i]);
        if (!v) {
          throw expr + " syntax error";
        }
        r = uuqueryselectorall(v, context);
        mixin(r, rv, unq);
      }
      return rv;
    }
    if (!withComma) {
      match = _QUICK_HEAD.exec(expr);
      if (match) {
        if (match[1]) {
          w = doc.getElementById(match[1]);
          ctx = w ? [w] : [];
        } else {
          // ".class.class" -> " class class"
          v = match[2].replace(_DOT_TO_SPACE, " ");
          return uu.klass(v, context);
        }
        expr = expr.slice(match[0].length);
      }
    }
  }

  // init tag set
  uid = uu.node.id(context);
  _ctype = _ctypedb[uid] || (_ctypedb[uid] = getContentType(context));
  _tags = _ctype === 1 ? _htmltagdb : _xmltagdb;
  // http://twitter.com/uupaa/status/4542172000
  !expr.indexOf("!") && (expr = expr.replace("!", ":scope"));

  // --- Generic phase ---
  while (expr && expr !== lastExpr1) { // outer loop
    lastExpr1 = expr;

    r = [], ri = -1, unq = {}, i = 0, iz = ctx.length;

    match = _CHILD.exec(expr);
    if (!expr.indexOf(":scope")) {
      // http://twitter.com/uupaa/status/4542172000
      expr = expr.slice(6);
    } else if (match) {
      // "E > F"  "E + F"  "E ~ F"  "E"  "E F" phase
      tag = match[2];
      tag = tag ? (_tags[tag] || addTag(tag, _ctype)) : "*";
      isUniversal = tag === "*"; // true: tag is universal selector

      if (match[1]) {
        joint = _JOINT1[match[1]];

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
                w = v.tagName;
                if (uu.ie && !w.indexOf("/")) { continue; } // fix #25
                if (isUniversal || w === tag) {
                  r[++ri] = v;
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
                  uid = v.uuguid ||
                        (_ndiddb[v.uuguid = w = ++uupub.ndidseed] = v, w);
                  if (uid in unq) {
                    break;
                  } else {
                    r[++ri] = v;
                    unq[uid] = 1;
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
              if (!uu.ie || !isUniversal || v.nodeType === 1) {
                if (isUniversal || v.tagName === tag) {
                  uid = v.uuguid ||
                        (_ndiddb[v.uuguid = w = ++uupub.ndidseed] = v, w);
                  uid in unq || (r[++ri] = v, unq[uid] = 1);
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

      joint = _JOINT2[expr.charAt(0)] || 9; // 9: dummy

      switch (joint) {
      case 1: // 1: "#id"
        match = _ID_OR_CLASS.exec(expr);
        if (match) {
          needle = match[1]; // "id"

          if (_ctype === 1) { // 1:html (match id or name)
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
        match = _ID_OR_CLASS.exec(expr);
        if (match) {
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
        match = _PSEUDO.exec(expr);
        if (match) {
          iz = ctx.length;
          if (iz) {
            if (match[1]) { // :not(...)
              if (negate) {
                throw ":not(:not(...)) syntax error";
              }
              if (match[2]) { // :not(*)
                break;
              }
              if (match[3]) { // ':not(div)' -> match[3] = "div"
                tag = match[3];
                tag = _tags[tag] || addTag(tag, _ctype);
                while ( (v = ctx[i++]) ) {
                  (v.tagName !== tag) && (r[++ri] = v);
                }
                break;
              }
              w = expr.slice(match[0].length); // remain expr
              expr = match[0].replace(_TRIM_NOT, "") + w;
              ++negate;
              continue;
            } else {
              pseudo = match[8] || "contains";

              // ":root:xxx-child" or ":root:xxx-type" -> not match
              // ":root:not(:first-child)"             -> match root element
              if (iz === 1 && ctx[0] === uupub.root
                           && _ROOT_REJECT.test(pseudo)) {
                r = negate ? [uupub.root] : [];
              } else {
                if ( !(v = _FILTERS[pseudo]) ) {
                  throw ":" + pseudo + " unsupported";
                }
                w = v[0];
                if (w & 0x100) {
                  if ((w & 0x800) && !_DOUBLE_COLON.test(expr)) {
                    throw match[0] + " syntax error(need ::)";
                  }
                  if ((w & 0x400) && negate) {
                    throw ":not(" + match[0] + ") syntax error" +
                          "(exclude pseudo-element)";
                  }
                  if (w & 0x200) { // 0x100 is none operation
                    r = negate ? [] : ctx;
                    break;
                  }
                }
                r = v[1].call(this, w, negate, ctx, pseudo,
                              match[9] || match[7], _tags, _ctype);
              }
            }
          }
        }
        break;

      case 4: // 4: Attr "[A=V]" or "[A]"
        match = _ATTR.exec(expr);
        if (match) {
          if (match[6]) { // "[A]"
            needle = match[6];

            while ( (v = ctx[i++]) ) {
              if (uu.ie) {
                w = v.getAttributeNode(needle);
                if ((w && w.specified) ^ negate) {
                  r[++ri] = v;
                }
              } else if (v.hasAttribute(needle) ^ negate) {
                r[++ri] = v;
              }
            }
          } else { // "[A=V]"
            // fix #Acid2 [class=second two]
            if (!match[3] &&
                match[4].indexOf(" ") >= 0 &&
                match[4].replace(_SYNTAX_ERROR2, "").indexOf(" ") >= 0) {
              throw match[0] + " syntax error";
            }
            needle = uu.trim.quote(match[4]);
            operator = _ATTR_OPERATOR[match[2]];
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
        match = _STYLE.exec(expr);
        if (match) {
          r = styleQuery(negate, ctx, match);
        }
      }

      if (match) {
        ctx = r;
        expr = expr.slice(match[0].length);
        negate = 0;
      }
    }

    // "E,F" phase
    if (withComma && expr && (match = _GROUP.exec(expr)) ) {
      ++mixed;
      mixin(ctx, rv, guard);
//    ctx = [context];
      ctx = context.nodeType ? [context] : context;
      lastExpr1 = lastExpr2 = "";
      expr = expr.slice(match[0].length);
      // http://twitter.com/uupaa/status/4542172000
      !expr.indexOf("!") && (expr = expr.replace("!", ":scope"));
    }
  }

  if (expr.length) {
    throw expr + " unsupported";
  }
  return mixed ? mixin(ctx, rv, guard) : ctx;
}

// inner - mix results
function mixin(ctx, rv, guard) {
  var ri = rv.length - 1, i = 0, v, uid, newid;

  while ( (v = ctx[i++]) ) {
    uid = v.uuguid ||
          (_ndiddb[v.uuguid = newid = ++uupub.ndidseed] = v, newid);
    uid in guard || (rv[++ri] = v, guard[uid] = 1);
  }
  return rv;
}

// inner - detect ContentType
function getContentType(context) { // @return Number: 1 is HTMLDocument,
                                   //                 2 is XMLDocument
  var owner = context.ownerDocument || doc;
  // see http://d.hatena.ne.jp/uupaa/20081010 [THX! id:os0x]
  return owner.createElement("p").tagName ===
         owner.createElement("P").tagName ? 1 : 2; 
}

// inner -
function addTag(tag, contentType) {
  var lo = tag.toLowerCase(),
      up = tag.toUpperCase();

  lo in _htmltagdb || (_xmltagdb[up] = _htmltagdb[lo] = _htmltagdb[up] = up,
                       _xmltagdb[lo] = lo);
  // IE unsupport HTML5 tags
  // http://d.hatena.ne.jp/uupaa/20090820
  if (uu.ie || uu.opera) {
    if (contentType === 1) {
      if (_HTML5TAG.indexOf(tag + ",") >= 0) {
        return lo;
      }
    }
  }
  return contentType === 1 ? up : tag;
}

// inner - [attr operator "value"]
function judgeAttr(negate, elms, attr, operator, value) {
  var rv = [], ri = -1, r, e, v = value, i = 0, rex,
      attrFlag = 0, // attrFlag: ie only
      isInsens = !(attr in _ATTR_CASESENS); // true: case insensitive

  if (uu.ie) {
    if (uu.ie8 || _ATTR_IE_BUG[attr]) { // fix a[href^="#"]
      attrFlag = 2;
    } else {
      attr = _ATTR_ALIAS[attr] || attr;
    }
  }

  if (operator < 3) { // [attr = value] or [attr != value]
    --operator;
    v = v.replace(_BACKSLASH, ""); // fix #Acid2 [class=second\ two]
    if (isInsens) {
      v = v.toLowerCase();
    }
    while ( (e = elms[i++]) ) {
      r = e.getAttribute(attr, attrFlag);
      if (r) {
        if (isInsens) {
          r = (r + "").toLowerCase();
        }
        ((v == r) ^ operator ^ negate) && (rv[++ri] = e);
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

// inner - :first-child  :last-child  :only-child
function uuquerychildfilter(fid, negate, elms) {
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

// inner - :nth-child  :nth-last-child
function nthChildFilter(fid, negate, elms, pseudo, value, tags, contentType) {
  if (value === "n") {
    return negate ? [] : elms;
  }
  // 0x4 = nth-child, 0x5 = nth-last-child
  var v = elms[0].tagName,
      tag = tags[v] || addTag(v, contentType),
      rv = [], ri = -1, i = 0, iz = elms.length, uid, newid, unq = {},
      pn, cn, idx, ok,
      iter1 = (fid === 0x5) ? "lastChild" : "firstChild",
      iter2 = (fid === 0x5) ? "previousSibling" : "nextSibling",
      f = nth(value), a = f.a, b = f.b, k = f.k;

  for (; i < iz; ++i) {
    pn = elms[i].parentNode;
    uid = pn.uuguid ||
          (_ndiddb[pn.uuguid = newid = ++uupub.ndidseed] = pn, newid);
    if (!(uid in unq)) {
      unq[uid] = 1;
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

// inner - :nth-of-type  :nth-last-of-type
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

// inner - :first-of-type  :last-of-type
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

// inner - :enabled  :disabled  :checked
function simpleFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok, needValidate;

  while ( (v = elms[i++]) ) {
    needValidate = ok = 0;
    switch (fid) {
    case 0x0b: ++needValidate; ok = !v.disabled; break;  // 0x0b: enabled
    case 0x0c: ++needValidate; ok = !!v.disabled; break; // 0x0c: disabled
    case 0x0d: ++needValidate; ok = !!v.checked; break;  // 0x0d: checked
    }

    if (needValidate && !_FORM_TAGS.test(v.tagName)) { // fix #144
      if (negate) {
        rv[++ri] = v;
      }
    } else if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner - :root
function root(fid, negate, elms) {
  if (!negate) {
    return [uupub.root];
  }
  var rv = [], ri = -1, v, i = 0;

  while ( (v = elms[i++]) ) {
    if (v !== uupub.root) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner - :target
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

// inner - :contains
function contains(fid, negate, elms, pseudo, value) {
  var rv = [], ri = -1, v, i = 0;

  while ( (v = elms[i++]) ) {
    if ((v[_innerText].indexOf(value) >= 0) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner - :link
function link(fid, negate, elms) {
  var rv = [], ri = -1, ary = uu.ary(doc.links), v, i = 0,
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

// inner - :empty
function empty(fid, negate, elms) {
  var rv = [], ri = -1, i = 0, v, c, missMatch = 0;

  while ( (v = elms[i++]) ) {
    missMatch = 0;
    for (c = v.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) {
        ++missMatch;
        break;
      }
    }
    // touch(v.textContent) very slowly
    if ((!missMatch && !v[_innerText]) ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner - :lang
function lang(fid, negate, elms, pseudo, value) {
  var rv = [], ri = -1, v, i = 0, iz = elms.length,
      rex = RegExp("^(" + value + "$|" + value + "-)", "i");

  for (; i < iz; ++i) { // don't touch me
    v = elms[i];
    while (v && v !== doc && !v.getAttribute("lang")) {
      v = v.parentNode;
    }
    if (((v && v !== doc) && rex.test(v.getAttribute("lang"))) ^ negate) {
      rv[++ri] = elms[i];
    }
  }
  return rv;
}

// inner - :only-of-type
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

// inner - parse :nth-xxx(an+b)
function nth(anb) {
  var a, b, c, match = _NTH_ANB.exec(anb);

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

// inner - :digit(0x40)  :negative(0x41)  :tween(0x42)
//         :boxeffec(0x43)
function extendFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok;

  while ( (v = elms[i++]) ) {
    ok = 0;
    switch (fid) {
    case 0x40: ok = _DIGIT_FILTER.test(v[_innerText] || ""); break;
    case 0x41: ok = _NEGATIVE_FILTER.test(v[_innerText] || ""); break;
    case 0x42: ok = !!v.uutween; break;
    case 0x43: ok = !!v.uucss3bfx;
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner - :mom(0x44)
function parentFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok;

  while ( (v = elms[i++]) ) {
    ok = v.parentNode ? 1 : 0;
    if (ok ^ negate) {
      rv[++ri] = v.parentNode; // || void 0
    }
  }
  return rv;
}

// inner - :ui(0x50)  :uislider(0x51)
function uiFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok;

  while ( (v = elms[i++]) ) {
    ok = 0;
    switch (fid) {
    case 0x50: ok = !!v.uuui; break;
    case 0x51: ok = (v.uuui && v.uuui.name === "slider"); break;
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// inner -
function styleQuery(negate, elms, match) {
  function _color2num(c) {
    return (c.r << 16) + (c.g << 8) + c.b;
  }
  var value = uu.trim.quote(match[4]),
      prop, propKind,
      operator = _EX_OPERATOR[match[2]], w,
      rv = [], ri = -1, ary, ok, r, e, v1, v2 = 0, i = 0,
      hasRange = 0, unitExchanged = 0,
      xfloat = parseFloat;

  if (!operator) {
    throw match[0] + " unsupported";
  }
  w = match[5] || ""; // regexp flag

  if (operator === 8) { // 8: "/=" is regexp operator
    value = RegExp(value, w); // build regexp object
  } else {
    // fix {class=i} -> match[4] = "", match[5] = "i"
    w && (value += w);
  }

  prop = match[1];

  v1 = value;
  if (operator === 11) { // 11: "&="
    ary = v1.split(_STYLE_RANGE); // {prop&=0x0~0xf}
    if (ary.length !== 2) {
      throw "[" + prop + "&=" + v1 + "-???] syntax error";
    }
    v1 = ary[0];
    v2 = ary[1];
    hasRange = 1;
  }

  // pre-filter
  propKind = _EX_PROP_KIND[prop] || 0;
  switch (propKind) {
  case 1: // 1: color, backgroundColor to number
    v1 = _color2num(uu.color(v1));
    hasRange && (v2 = _color2num(uu.color(v2)));
    break;
  case 2: // 2: opacity
    v1 = xfloat(v1);
    hasRange && (v2 = xfloat(v2));
  }

  // range normalize
  if (hasRange && v1 > v2) { // {prop&=1~0} -> {prop&=0~1}
    r = v2, v2 = v1, v1 = r; // swap(v1, v2);
  }

  while ( (e = elms[i++]) ) {
    switch (propKind) {
    case 1: // color, backgroundColor
      r = _color2num(uu.color((uu.ie ? e.currentStyle : _cstyle(e, null))[prop]));
      break;
    case 2: // opacity
      r = uu.css.opacity.get(e);
      break;
    case 3: // width
      r = uu.css.px(e, "width");

      if (!unitExchanged) {
        ++unitExchanged;
        v1 = uu.css.px.value(e, v1);
        hasRange && (v2 = uu.css.px.value(e, v1));
      }
      break;
    case 4: // height
      r = uu.css.px(e, "height");

      if (!unitExchanged) {
        ++unitExchanged;
        v1 = uu.css.px.value(e, v1);
        hasRange && (v2 = uu.css.px.value(e, v1));
      }
      break;
    case 5: // top, right, bottom, left
      r = uu.css.px.value(e, (uu.ie ? e.currentStyle : _cstyle(e, null))[prop]);
      if (!unitExchanged) {
        ++unitExchanged;
        v1 = uu.css.px.value(e, v1);
        hasRange && (v2 = uu.css.px.value(e, v1));
      }
      break;
    case 6: // backgroundImage
      r = uu.css.bgimg.get(e) || "none"; // "http://..." or "none"
      break;
    default:
      w = (uu.ie ? e.currentStyle : _cstyle(e, null))[prop];
      r = (operator >= 9) ? xfloat(w) : w;
    }

    ok = 0;
    switch (operator) {
    case 1: ok = v1 == r; break;            // {prop = value} or {prop: value}
    case 2: ok = v1 != r; break;            // {prop != value}
    case 3: ok = r.indexOf(v1) >= 0; break; // {prop *= value}
    case 4: ok = !r.indexOf(v1); break;     // {prop ^= value}
    case 5: ok = (r.lastIndexOf(v1) + v1.length) === r.length; break;
                                            // {prop $= value}
    case 8: ok = v1.test(r); break;         // {prop /= "regexp"ig}
    case 9: ok = r >= v1; break;            // {prop >= value}
    case 10: ok = r <= v1; break;           // {prop <= value}
    case 11: ok = r >= v1 && r <= v2;       // {prop &= #000000~#ffffff}
    }
    if (ok ^ negate) {
      rv[++ri] = e;
    }
  }
  return rv;
}

// inner -
function visitedFilter(fid, negate, elms) {
  // :link(0x0e)  :visited(0x0f)
  var rv = [], ri = -1, v, i = 0, ok, cs, idx;

  // http://d.hatena.ne.jp/uupaa/20080928
  uu.css.create(_ssid);
  idx = uu.css.inject(_ssid, "a:visited",
                      uu.ie ? "ruby-align:center"
                            : "outline:0 solid #000");
  while ( (v = elms[i++]) ) {
    if (v.tagName === "A") {
      if (uu.ie) {
        ok = (v.currentStyle.rubyAlign === "center") ? 1 : 0;
      } else {
        cs = _cstyle(v, null);
        ok = (cs.outlineWidth === "0px" &&
              cs.outlineStyle === "solid") ? 1 : 0;
      }
      if (fid === 0x0e) {
        if ((!ok) ^ negate) {
          rv[++ri] = v;
        }
      } else {
        if (ok ^ negate) {
          rv[++ri] = v;
        }
      }
    }
  }
  uu.css.reject(_ssid, idx);
  return rv;
}

// inner -
function actionFilter(fid, negate, elms, pusedo) {
  // :hover(0x10)  :focus(0x11)
  var rv = [], ri = -1, v, i = 0, ok, cs, idx;

  // http://d.hatena.ne.jp/uupaa/20080928
  uu.css.create(_ssid);
  idx = uu.css.inject(_ssid, ":" + pusedo,
                      uu.ie ? "ruby-align:center"
                            : "outline:0 solid #000");
  while ( (v = elms[i++]) ) {
    if (uu.ie) {
      ok = (v.currentStyle.rubyAlign === "center") ? 1 : 0;
    } else {
      cs = _cstyle(v, null);
      ok = (cs.outlineWidth === "0px" &&
            cs.outlineStyle === "solid") ? 1 : 0;
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  uu.css.reject(_ssid, idx);
  return rv;
}

// inner -
function createTagDictionary() {
  // create tag dict.
  var ary = ("*,div,p,a,ul,ol,li,span,td,tr,dl,dt,dd,h1,h2,h3,h4," +
             "iframe,form,input,textarea,select,body,style,script").split(","),
      i = 0, iz = ary.length;

  for (; i < iz; ++i) {
    addTag(ary[i]);
  }
}

// --- initialize ---
createTagDictionary();

})(window, document, uu, window.getComputedStyle,
   uu.gecko ? "textContent" : "innerText");

