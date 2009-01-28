// === Query CSS Plus ======================================
// depend: query_css, styleSheet, color
uu.feat.query_css_plus = {};

(function() {
var STYLE_OPERATOR  = { "=": 1, ":": 1, "!=": 2, "*=": 3, "^=": 4, "$=": 5,
                        "/=": 8, ">=": 9, "<=": 10, "&=": 11 },
    STYLE_PROP      = { color: 1, backgroundColor: 1,
                        opacity: 2, width: 3, height: 3 },
    DIGIT           = /^\s*(?:[\-+]?)[\d,\.]+\s*$/,
    NEGATIVE        = /^\s*\-[\d,\.]+\s*$/,
    MARKUP_STYLE    = UU.IE ? "ruby-align:center" : "outline:0 solid #000";

uu.mix(uu.css.querySelectorAll.FILTER_MAP, {
  link:     [0x0e, actionFilter], // override
  visited:  [0x0f, actionFilter],
  hover:    [0x10, actionFilter],
  focus:    [0x11, actionFilter],

  digit:    [0x40, extendFilter],
  negative: [0x41, extendFilter],
  tween:    [0x42, extendFilter],
  playing:  [0x43, extendFilter],

  // jQuery selector
  first:    [0x01, uu.css.querySelectorAll.childFilter],
  last:     [0x02, uu.css.querySelectorAll.childFilter],
  even:     [0x80, even],
  odd:      [0x81, odd],
  eq:       [0x82, eq],
  gt:       [0x83, jFilter],
  lt:       [0x84, jFilter],
  parent:   [0x85, jFilter],
  header:   [0x86, jFilter],
  input:    [0x87, jFilter],
  button:   [0x88, jFilter],
  text:     [0x89, jFilter],
  password: [0x8a, jFilter],
  radio:    [0x8b, jFilter],
  checkbox: [0x8c, jFilter],
  submit:   [0x8d, jFilter],
  image:    [0x8e, jFilter],
  reset:    [0x8f, jFilter],
  file:     [0x90, jFilter],
  hidden:   [0x91, jFilter],
  visible:  [0x92, jFilter],
  selected: [0x93, jFilter]
});

// :link  :visited  :hover  :focus
function actionFilter(fid, negate, elms, pusedo) {
  var rv = [], ri = -1, ruleIndex, ary = [], v, i = 0;

  switch (fid) {
  case 0x0e: // 0x0e: link
  case 0x0f: // 0x0f: visited
    ruleIndex = uu.style.appendRule("query+", "a:" + pusedo, MARKUP_STYLE);
    ary = uu.toArray(uudoc.links);
    break;
  case 0x10: // 0x10: hover
  case 0x11: // 0x11: focus
    ruleIndex = uu.style.appendRule("query+", ":" + pusedo, MARKUP_STYLE);
    ary = uu.tag("*", uudoc.body);
  }

  while ( (v = ary[i++]) ) {
    if (spy(v)) {
      if ((elms.indexOf(v) >= 0) ^ negate) {
        rv[++ri] = v;
      }
    }
  }
  uu.style.deleteRule("query+", ruleIndex);
  return rv;
}

// :digit  :negative  :tween  :playing
function extendFilter(fid, negate, elms) {
  var rv = [], ri = -1, v, i = 0, ok;

  while ( (v = elms[i++]) ) {
    ok = 0;
    switch (fid) {
    case 0x40: ok = DIGIT.test(v[textContent]); break; // 0x40: digit
    case 0x41: ok = NEGATIVE.test(v[textContent]); break; // 0x41: negative
    case 0x42: ok = !!v.uuTween; break;   // 0x42: tween
    case 0x43: ok = v.uuTween && v.uuTween.playing(); break; // 0x43: playing
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

// spy style
function spy(elm) {
  var rv, cs;

  // http://d.hatena.ne.jp/uupaa/20080928/1222543331
  if (UU.IE) {
    cs = elm.currentStyle || elm.style;
    rv = cs.rubyAlign === "center";
  } else {
    cs = uu.style(elm, "");
    rv = (cs.outlineWidth === "0px" && cs.outlineStyle === "solid");
  }
  return rv;
}

function jFilter(fid, negate, elms, pseudo, value, tags, contentType) {
  var rv = [], ri = -1, v, i = 0, iz = elms.length, ok, rex;

  for(; i < iz; ++i) {
    v = elms[i];
    ok = 0;
    switch (fid) {
    case 0x83:  ok = i >= parseInt(value) + 1; break;
    case 0x84:  ok = i <= parseInt(value) - 1; break;
    case 0x85:  ok = v.firstChild; break;
    case 0x86:  rex = RegExp("h[1-6]", contentType === 1 ? "i" : "");
                ok = rex.test(v.tagName); break;
    case 0x87:  rex = RegExp("(input|textarea|select|button)", contentType === 1 ? "i" : "");
                ok = rex.test(v.tagName) || v.type === "button"; break;
    case 0x88:  rex = RegExp("button", contentType === 1 ? "i" : "");
                ok = rex.test(v.tagName) || v.type === "button"; break;
    case 0x89:  ok = v.type === "text"; break;
    case 0x8a:  ok = v.type === "password"; break;
    case 0x8b:  ok = v.type === "radio"; break;
    case 0x8c:  ok = v.type === "checkbox"; break;
    case 0x8d:  ok = v.type === "submit"; break;
    case 0x8e:  ok = v.type === "image"; break;
    case 0x8f:  ok = v.type === "reset"; break;
    case 0x90:  ok = v.type === "file"; break;
    case 0x91:  ok = (v.type === "hidden" || hidden(v)); break;
    case 0x92:  ok = (v.type !== "hidden" && !hidden(v)); break;
    case 0x93:  ok = v.selected; break;
    }
    if (ok ^ negate) {
      rv[++ri] = v;
    }
  }
  return rv;
}

function even(fid, negate, elms, pseudo, value, tags, contentType) {
  var filter = uu.css.querySelectorAll.FILTER_MAP["nth-child"];
  return filter[1](filter[0], negate, elms, pseudo, "odd", tags, contentType);
}

function odd(fid, negate, elms, pseudo, value, tags, contentType) {
  var filter = uu.css.querySelectorAll.FILTER_MAP["nth-child"];
  return filter[1](filter[0], negate, elms, pseudo, "even", tags, contentType);
}

function eq(fid, negate, elms, pseudo, value) {
  var rv = elms[parseInt(value)];
  return (rv ^ negate) ? [rv] : [];
}

function hidden(elm) {
  var ie = UU.IE || (UU.OPERA && opera.version() < 9.5),
      cs = ie ? (elm.currentStyle || elm.style)
              : uu.style(elm, "");
  return cs.display === "none" || cs.visibility === "hidden";
}

uu.css.querySelectorAll.styleQuery = function(negate, elms, match) {
  var needle = match[4].replace(/^\s*["']|["']\s*$/g, ""),
      operator = STYLE_OPERATOR[match[2]] || 0,
      w;
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
  return judgeStyle(negate, elms, match[1], operator, needle);
};


// {style operator "value"}
function judgeStyle(negate, elms, style, operator, value) {
  var rv = [], ri = -1, ary, ok, r, e, v1 = value, v2 = 0, i = 0,
      rect, prop = STYLE_PROP[style] || 0;

  if (!(style in uu.style(elms[0]))) {
    return []; // unknown style
  }

  if (operator === 11) { // 11: "&="
    ary = v1.split(/-/); // {style&=0x0-0xf}
    if (ary.length !== 2) { throw "[" + style + "&=" + v1 + "-???] syntax error"; }
    v1 = ary[0];
    v2 = ary[1];
  }

  // pre-filter
  if (prop === 1) { // 1: color, backgroundColor
    v1 = uu.color.parse(v1)[0];
    v2 = uu.color.parse(v2)[0];
  }

  // to number
  if (prop) {
    v1 = parseFloat(v1);
    v2 = parseFloat(v2);
    if (operator === 11 && v1 > v2) {
      r = v2, v2 = v1, v1 = r; // swap(v1, v2);
    }
  }

  while ( (e = elms[i++]) ) {
    switch (prop) {
    case 1: r = uu.color.parse(uu.style(e)[style])[0]; break;
    case 2: r = uu.style.getOpacity(e); break;
    case 3: rect = uu.style.getRect(e);
            r = style === "width" ? rect.w || rect.ow : rect.h || rect.oh;
            break;
    default:r = (operator >= 9) ? parseFloat(uu.style(e)[style])
                                : uu.style(e)[style];
    }

    // ToDo:
    // 1. Conversion of unit(em, px -> px) for IE - need px
    // 2. Conversion define-name(center -> 50%) for some styles

    ok = 0;
    switch (operator) {
    case 1: ok = v1 == r; break;            // {style =  value} or {style : value}
    case 2: ok = v1 != r; break;            // {style != value}
    case 3: ok = r.indexOf(v1) >= 0; break; // {style *= value}
    case 4: ok = !r.indexOf(v1); break;     // {style ^= value}
    case 5: ok = (r.lastIndexOf(v1) + v1.length) === r.length; break; // {style $= value}
    case 8: ok = v1.test(r); break;         // {style /= "regexp"ig}
    case 9: ok = parseInt(r) >= v1; break;  // {style >= value}
    case 10: ok = parseInt(r) <= v1; break; // {style <= value}
    case 11: ok = parseInt(r) >= v1 &&
                  parseInt(r) <= v2;        // {style &= #000000-#ffffff}
    }
    if (ok ^ negate) {
      rv[++ri] = e;
    }
  }
  return rv;
}

})();
