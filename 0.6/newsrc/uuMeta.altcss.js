
// === uuMeta.altcss ===
// depend: uuMeta, uuMeta.*, uuMeta.query, uuMeta.canvas, uuMeta.layer
/*
window.UUALTCSS_FORCE_MARKUP = void 0; // 1: force markup, 0: markup off
window.UUALTCSS_ENABLE_MAXMIN = 0
window.UUALTCSS_DECODE_DATAURI = 0;
window.UUALTCSS_VALUE_VALIDATION = 0;
window.UUALTCSS_STRIP_INLINE_WIDTH = 0;
window.UUALTCSS_FLY_WEIGHT = 1;

uuMeta.altcss(context = void 0, rebuild = 0, css = "")
uuMeta.altcss.getRuleset() - return ruleset array
uuMeta.altcss.getDeclaredValues(node) - return Hash/void 0
uuMeta.altcss.getDirtyCSS() - return "dirty css"
uuMeta.altcss.getExStyle(node, prop) - return "extend / computed-like style"
uuMeta.altcss.setExStyle(node, prop, value, redraw = 0)
uuMeta.altcss.redraw()
 */
(function() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _win = window,
    _doc = document,
    _ifcanvas = _mm.feature.ifcanvas,
    _importCache = {}, // import cache { url: cssText }
    _codec = ((_win.UUALTCSS_DECODE_DATAURI || 0)
                && _mm.codec) ? _mm.codec.dataURI : 0,
    // CSS Value Validation
    _VALUE_VALIDATION = _win.UUALTCSS_VALUE_VALIDATION || 0,
    // IE6, IE7: Size of an inline element is invalidated.
    //    <span style="width:100px; height:100px">inline with size</span>
    //          v
    //    <span style="width:auto; height:auto">inline without size</span>
    _STRIP_INLINE_WIDTH = _ua.ie67 && (_win.UUALTCSS_STRIP_INLINE_WIDTH || 0),
    // IE6, IE7: Strip embed image
    //    <img src="data:image/*,...">
    //    <div style="background: url(data:image/*,...)">
    //          v
    //    <img src="1dot.gif">
    //    <div style="background: url(1dot.gif)">
    _fragment = !(_ua.gecko && _ua.rever <= 1.9), // exclude Fx2,3
    _generatedRuleSet = [],
    _uniqueRuleuID = 0, // unique rule id
    _uniqueRules = {},  // unique rule
    _styleSheetID = "uuAltCSS", // StyleSheet ID
    _initialized = 0,
    _mark = 0,
    _plus = 0,
    _specs = [], // raw data
    _data = {}, // raw data
    _lazyClearClass = [], // lazy clear className nodeList
    _uid2data = {}, // { uid: { node, rules, klass, excss }, ... }
                    // excss: { bits: 0, decl: {}, order: "" }
    _lastCSS = "",
    _deny = 0, // 1: deny removeChild
    _plan = { init: [], alphapng: [], boxeffect: [] },
    _EXCSS = { // extend css functions
//    hover:      _ua.ie6    ? 0x8     : 0, // :hover
      position:   _ua.ie6    ? 0x10    : 0, // position: fixed, absolute bug
      alphapng:   _ua.ie6    ? 0x20    : 0, // <img src="some.alpha.png">
      maxmin:     _ua.ie67   ? 0x40    : 0, // max-width:
      disptbl:    _ua.ie67   ? 0x80    : 0, // -uu-display: table
      opacity:    _ua.ie     ? 0x100   : 0, // opacity:
      textshadow: _ua.ie     ? 0x200   : 0, // -uu-text-shadow:
      boxeffect:  _ifcanvas  ? 0x400   : 0, // -uu-box-effect:
      boxshadow:  _ifcanvas  ? 0x800   : 0, // -uu-box-shadow:
      boxreflect: _ifcanvas  ? 0x1000  : 0, // -uu-box-reflect:
      bradius:    _ifcanvas  ? 0x2000  : 0, // -uu-border-radius:
      bimage:     _ifcanvas  ? 0x4000  : 0, // -uu-border-image:
      mbg:        _ifcanvas  ? 0x8000  : 0  // -uu-background:
                                            // -uu-background-color:
                                            // -uu-background-image:
                                            // -uu-background-repeat:
                                            // -uu-background-position:
    },
    _DECL2EXCSS = {
      position:                 1,
      "-uu-display":            2,
      opacity:                  _EXCSS.opacity,
      "-uu-text-shadow":        _EXCSS.textshadow,
      "-uu-box-effect":         _EXCSS.boxeffect,
      "-uu-box-shadow":         _EXCSS.boxshadow,
      "-uu-box-reflect":        _EXCSS.boxreflect,
      "-uu-border-image":       _EXCSS.bimage,
      "-uu-border-radius":      _EXCSS.bradius,
      "-uu-background":         _EXCSS.mbg,
      "-uu-background-color":   _EXCSS.mbg,
      "-uu-background-image":   _EXCSS.mbg,
      "-uu-background-repeat":  _EXCSS.mbg,
      "-uu-background-position":_EXCSS.mbg
    },
    _EXSTYLE2FUNC = {
      option:                   exStyleOpacity,
      "-uu-text-shadow":        exStyleTextShadow,
      "-uu-box-effect":         exStyleBoxEffect,
      "-uu-box-shadow":         exStyleBoxShadow,
      "-uu-box-reflect":        exStyleBoxReflect,
      "-uu-border-radius":      exStyleBorderRadius,
      "-uu-border-image":       exStyleBorderImage,
      "-uu-background":         exStyleBackground,
      "-uu-background-color":   exStyleBackgroundColor,
      "-uu-background-image":   exStyleBackgroundImage,
      "-uu-background-repeat":  exStyleBackgroundRepeat,
      "-uu-background-position":exStyleBackgroundPosition
    },
    _BFX = "uuAltCSSBoxEffect";

if (!_win.UUALTCSS_ENABLE_MAXMIN) {
  _EXCSS.maxmin = 0;
}

// uuMeta.altcss
function altcss(context, // @param Node/IDString(= void 0): revalidation context
                rebuild, // @param Number(= 0): 0 = OFF(quick), 1 = ON(full)
                css) {   // @param CSSString(= ""): CSS text
  // lazy revalidate for :target
  (_mark || _plus) && setTimeout(function() {
    var ctx = (typeof context === "string") ? _mm.query.id(context) : context,
        tick = +new Date;

    ctx = (!ctx || !ctx.parentNode || ctx === _doc) ? _doc
                                                    : ctx.parentNode;
    unbond(ctx);
    if (rebuild) {
      _specs = [], _data = {}; // clear raw data
      init(css);
    }
    validateCSS(ctx);
    _initialized = 1;

    _mm.debug && (_win.status = (new Date - tick) + "ms");

    !_mm.evt.blackout &&
        (typeof _win.makeup === "function") && _win.makeup(_mm, 1);
  }, 0);
}

// uuMeta.altcss.getRuleset
function getRuleset() { // @return Array: rule-set
    return _generatedRuleSet;
}

// uuMeta.altcss.getDeclaredValues - get declaration values (raw CSS String)
function getDecl(node) { // @param Node:
                         // @return Hash/void 0: { bits, order, decl }
                         //             Number: bits, 0 to 0xffffffff
                         //             String: order, comma jointed string
                         //                            has,last-comma,
                         //             Hash: decl { color: "red", ... }
  var rv = _uid2data[_mm.node.id(node)];

  return rv ? rv.excss : rv;
}

// uuMeta.altcss.getDirtyCSS - get last collected CSS
function getDirtyCSS() { // @return String: "dirty CSS"
  return _lastCSS;
}

// uuMeta.altcss.getExStyle - get extend style / computed-like style
function getExStyle(node,   // @param Node:
                    prop) { // @param String: "color"
                            // @return String: "red"
  var rv = "", data, val, rs;

  if (!prop.indexOf("-uu")) { // /^-uu/.test(prop)
    if ( (data = _uid2data[_mm.node.id(node)]) ) {
      if ( (val = data.excss.decl[prop]) ) {
        rv = val;
      }
    }
  } else {
    rs = _ua.ie ? node.currentStyle
                : getComputedStyle(node, null);
    rv = rs[_mm.tidy(prop)];
  }
  return rv;
}

// uuMeta.altcss.setExStyle - set extend style
function setExStyle(node,     // @param Node:
                    prop,     // @param String: "color"
                    value,    // @param String: "red"
                    redraw) { // @param Boolean(= false):
  var fn;

  if (value !== void 0) {
    if ( (fn = _EXSTYLE2FUNC[prop]) ) {
      fn(node, prop, value);
      redraw && redrawCSS();
    } else {
      if (_BFX in node) {
        /^margin/.test(prop) && (node[_BFX].train.margin = 1);
        /^border/.test(prop) && (node[_BFX].train.border = 1);
      }
      node.style[_mm.tidy(prop)] = value;
    }
  }
}

// inner - unbond attrs
function unbond(context) { // @param Node:
  var node, v, i, j;

  // remove class="uucss{n} ..."
  //   1. replace element.className
  //   2. remove element.uuCSSC attr
  _lazyClearClass = _mm.query("[uuCSSC]", context);

  // remove "!important" style
  //   1. collect old style from element.uuCSSIHash
  //   2. remove element.uuCSSI attr
  if (!_ua.ie) {
    node = _mm.query("[uuCSSI]", context), i = 0;
    while ( (v = node[i++]) ) {
      for (j in v.uuCSSIHash) {
        v.style.removeProperty(j);
        v.style.setProperty(j, v.uuCSSIHash[j], "");
      }
      v.removeAttribute("uuCSSI"); // unmarkup
    }
  }
/*
  // remove uuCSSHover="uucsshover{n} ..."
  //   1. remove element.uuCSSHover attr
  node = _mm.query("[uuCSSHover]", context), i = 0;
  while ( (v = node[i++]) ) {
    v.removeAttribute("uuCSSHover");
  }
*/
}

// inner - init
function init(css) {
  var node, v, i, hash, dstr,
      MEMENTO = "uuAltCSSMemento",
      DATA = "data:";

  // memnto
  if (!_initialized && _ua.ie) {
    node = _mm.query.tag("style"), i = 0;
    while ( (v = node[i++]) ) {
//    !(MEMENTO in v) && (v[MEMENTO] = v.innerHTML);
      MEMENTO in v || (v[MEMENTO] = v.innerHTML);
    }
  }

  // collect style sheets
  css = cleanupCSS(_lastCSS = (css || importCSS()));

  // http://d.hatena.ne.jp/uupaa/20090619
  if (!_initialized && _ua.ie6) {
    v = _win.name;
    _win.name = ""; // clear
    if (/UNKNOWN[^\{]+?\{|:unknown[^\{]+?\{/.test(css) && // }}}}
        "UNKNOWN" !== v) {
      _win.name = "UNKNOWN";
      _mm.evt.blackout = 1; // stop boot process
      location.reload(false);
      return false;
    }
  }

  // decode script
  //    <script src="data:text/javascript,..">
  if (_ua.ie && _codec) {
    node = _mm.query.tag("script"), i = 0;
    while ( (v = node[i++]) ) {
      if (!v.src.indexOf(DATA)) {
        hash = _codec.decode(v.src);
        if (hash.mime === "text/javascript") {
          dstr = String.fromCharCode.apply(null, hash.data);
          (new Function(dstr))();
        }
      }
    }
  }

  parseCSS(css);
  _specs.sort(function(a, b) { return a - b; });
  _mm.style.sheet.create(_styleSheetID);
  return true;
}

// inner - validate CSS
function validateCSS(context) {
  // uuNode.cutdown - cut all nodes less than context
  function cutdown(context) { // @Node(= document.body): parent node
                              // @return DocumentFragment:
    var rv, ctx = context || _doc.body;
    if (_doc.createRange) {
      (rv = _doc.createRange()).selectNodeContents(ctx);
      return rv.extractContents(); // return DocumentFragment
    }
    rv = _doc.createDocumentFragment();
    while (ctx.firstChild) {
      rv.appendChild(ctx.removeChild(ctx.firstChild));
    }
    return rv;
  }

  var v, w, i = 0, j, k, l, jz, kz, lz,
      spec, data, expr, ruleid, nodeuid, excss, node,
      // vars alias
      styleSheet = _mm.style.sheet,
      DECL2EXCSS = _DECL2EXCSS,
      EXCSS = _EXCSS,
      mark = _mark,
      ie = _ua.ie,
      ie67 = _ua.ie67,
      IMP = " !important;",
/*
      skip = _ua.ie6
           ? /^\*$|::?before$|::?after$|::?first-letter$|::?first-line$|:active|:focus|:unknown/
           : /^\*$|::?before$|::?after$|::?first-letter$|::?first-line$|:active|:focus|:unknown|:hover/,
      hover = /:hover/,
      pseudo,
*/
      skip = /^\*$|::?before$|::?after$|::?first-letter$|::?first-line$|:active|:focus|:hover|:unknown/,
      REMOVE_UUCSS_CLASSNAME = /uucss[\w]+\s*/g,
      fragment, ruleset = [],
      gridx = -1,
      expair, exbits, exdecl, exorder, exoi, exv, exw, exi, // work
      STRIP_INLINE_WIDTH = _STRIP_INLINE_WIDTH,
      // document fragment context
      dfctx = (!context || context === _doc ||
                           context === _mm.node.root) ? _doc.body : context;

  // reset global vars
  _generatedRuleSet = [];
  _uid2data = {};

  while ( (spec = _specs[i++]) ) {
    data = _data[spec];

    for (j = 0, jz = data.length; j < jz; ++j) {
      expr = data[j].expr;

      if (skip.test(expr)) { // skip universal, pseudo-class/elements
        continue;
      }

      try {
        if (_plus) {
          expair = data[j].pair;
          exbits = 0, exdecl = {}, exorder = [], exoi = -1, exi = 0;

          while ( (exv = expair[exi++]) ) {
            switch (exw = DECL2EXCSS[exv.prop] || 0) {
            case 1: (exv.val === "fixed") && (exbits |= EXCSS.position); break;
            case 2: (exv.val === "table") && (exbits |= EXCSS.disptbl); break;
            default: exbits |= exw;
            }
            exdecl[exv.prop] = exv.val;
            exorder[++exoi] = exv.prop;
          }
          excss = { bits: exbits, decl: exdecl,
                    order: exorder.join(",") + "," };
        }

/*
        pseudo = 0;

        if (!_ua.ie6 || !hover.test(expr)) {
          node = _mm.query(expr, context);
        } else {
          node = _mm.query(expr.replace(hover, function(m) {
            pseudo |= 0x2;
            return "";
          }), context);
        }
*/
        node = _mm.query(expr, context);

        if (ie || spec < 10000) {
          // make unique rule id from expr
          ruleid = _uniqueRules[expr] ||
                   (_uniqueRules[expr] = ++_uniqueRuleuID);

          // add new rule
          if (mark) {
            // ".uucss[num] { color: red; font-size: 24pt; ... }"
            w = (spec < 10000) ? data[j].decl.join(";")
                               : data[j].decl.join(IMP) + IMP;
            w += ";";
/*
            if (!pseudo) {
              ruleset.push(".uucss" + ruleid, w);
            } else if (pseudo & 0x2) { // 0x2: hover
              ruleset.push(".uucsshover" + ruleid, w);
            }
*/
            ruleset.push(".uucss" + ruleid, w);
          }
          for (k = 0, kz = node.length; k < kz; ++k) {
            v = node[k];
            nodeuid = _mm.node.id(v); // node unique id

            // init container
            if (!(nodeuid in _uid2data)) {
              _uid2data[nodeuid] = {
                node: v,
                rules: {},
                klass: [],
                excss: { bits: 0, decl: {}, order: "" }
              };
            }

            // regist rule if not exists
            if (!(ruleid in _uid2data[nodeuid].rules)) {

              _uid2data[nodeuid].rules[ruleid] = ruleid;

              if (mark) {
/*
                if (!pseudo) {
                  _uid2data[nodeuid].klass.push("uucss" + ruleid);
                } else if (pseudo & 0x2) { // 0x2: hover
                  if (!("uuCSSHover" in v)) {
                    v.uuCSSHover = ""; // bond
                  }
                  v.uuCSSHover += " uucsshover" + ruleid;
                }
*/
                // .uucss{n}
                _uid2data[nodeuid].klass.push("uucss" + ruleid);
              }

              // for Acid2 test(need UUALTCSS_STRIP_INLINE_WIDTH = 1)
              //    inline-element has neither width nor height(in IE6, IE7)
              if (STRIP_INLINE_WIDTH) {
                if (/display:inline;/i.test(w) ||
                    /^inline$/.test(v.currentStyle.display)) {
/*
                  !pseudo &&
                      mark && _uid2data[nodeuid].klass.push("uucssinline");
*/
                  mark && _uid2data[nodeuid].klass.push("uucssinline");
                }
              }
            }
            // mixin plus info
            if (_plus) {
              // mixin bits
              _uid2data[nodeuid].excss.bits |= excss.bits;

              // mixin declarations
              _mm.mix(_uid2data[nodeuid].excss.decl, excss.decl);

              // append declaration order
              _uid2data[nodeuid].excss.order
                  += excss.order; // "has,last-comma,"
            }
          }
        } else { // "!important" route
          for (k = 0, kz = node.length; k < kz; ++k) {
            v = node[k];
            nodeuid = _mm.node.id(v); // node unique id

            if (mark) {
              v.setAttribute("uuCSSI", 1); // bond + markup for revalidate

              // init container
//            !("uuCSSIHash" in v) && (v.uuCSSIHash = {}); // bond
              "uuCSSIHash" in v || (v.uuCSSIHash = {}); // bond

              for (l = 0, lz = data[j].pair.length; l < lz; ++l) {
                w = data[j].pair[l];
                // save
                v.uuCSSIHash[w.prop] = v.style.getPropertyValue(w.prop);
                // overwrite
                v.style.setProperty(w.prop, w.val, "important");
              }
            }

            // init container
            if (!(nodeuid in _uid2data)) {
              _uid2data[nodeuid] = {
                node: v,
                rules: {},
                klass: [],
                excss: { bits: 0, decl: {}, order: "" }
              };
            }
            // mixin plus info
            if (_plus) {
              // mixin bits
              _uid2data[nodeuid].excss.bits |= excss.bits;

              // mixin declarations
              _mm.mix(_uid2data[nodeuid].excss.decl, excss.decl);

              // append declaration order
              _uid2data[nodeuid].excss.order
                  += excss.order; // "has,last-comma,"
            }
          }
        }
      } catch(err) {
        _mm.debug && 
            alert("validate fail: " + err);
      }
    }
  }

  _plus && plusPlan(_initialized, context);

  _fragment && !_deny && (fragment = cutdown(dfctx));
  // --- begin code block ---
      // lazy - clear all rules
      styleSheet.removeAllRules(_styleSheetID);

      // lazy - clear all className
      i = 0;
      while ( (v = _lazyClearClass[i++]) ) {
        if (!(ie67 && v.getAttribute("uuCSSLock"))) {
          v.className = v.className.replace(REMOVE_UUCSS_CLASSNAME, "");
          v.removeAttribute("uuCSSC");
        }
      }

      // apply to className
      if (mark) {
        for (nodeuid in _uid2data) {
          v = _uid2data[nodeuid].node;
          if (ie67 && v.getAttribute("uuCSSLock")) {
            ;
          } else {
            w = v.className + " " + _uid2data[nodeuid].klass.join(" ");
//          v.className = w.trim().replace(/\s+/g, " ");
            v.className = _mm.clean(w);
            v.setAttribute("uuCSSC", "1"); // bond + markup for revalidate
          }
        }
      }
      // insert rule
if (1) {
      i = 0;
      while ( (v = ruleset[i++]) ) {
        styleSheet.insertRule(_styleSheetID, v, ruleset[i]);
        _generatedRuleSet[++gridx] = ruleset[i] + "{" + ruleset[i] + "}";
        ++i;
      }
} else {
      styleSheet.overwriteRules(_styleSheetID, ruleset);
}

      // strip width
      if (STRIP_INLINE_WIDTH) {
        styleSheet.insertRule(_styleSheetID,
                              ".uucssinline", "width:auto;height:auto");
        _generatedRuleSet[++gridx] = ".uucssinline{width:auto;height:auto}";
      }
      // boost prevalidate
      _plus && plusPrevalidate(_initialized, context);
  // --- end code block ---
  _fragment && !_deny && dfctx.appendChild(fragment);

  // boost postvalidate
  _plus && plusPostvalidate(_uid2data, _initialized, context);

  // Opera9.5+ problem fix and Opera9.2 flicker fix
  _ua.opera && (_fragment = 0);
}

// inner - parse CSS
function parseCSS(css) {
  var escape = 0, v, i, j, k, iz, jz, kz,
      gd1, gd2, gp1, gp2, ary, expr, decl, decls, exprs, spec,
      gd1i, gd2i, gp1i, gp2i,
      rex1 = /\s*\!important\s*/,
      rex2 = /\s*\!important\s*/g,
      ignore, prop, val, valid, both,
      valids = { width: 1, border: 1, background: 1 },
      VALUE_VALIDATION = _VALUE_VALIDATION,
      SEPA2CODE = { "{": "\\u007B", "}": "\\u007D",
                    ";": "\\u003B", ",": "\\u002C" },
      CODE2SEPA = { "7B": "{", "7D": "}",
                    "3B": ";", "2C": "," },
      SPECIAL_CHAR = /[\{\};,]/g,
      SPECIAL_CODE = /\\u00(7B|7D|3B|2C)/g,
      COMMA = /\s*,\s*/,
      COLON = /\s*:\s*/,
      SEMICOLON = /\s*;\s*/,
      STAR_HACK = /^\s*\*\s+html/i;

  v = css.replace(/(["'])(.*?)\1/g, function(m, q, str) { 
    ++escape;
    return q + str.replace(SPECIAL_CHAR, function(code) {
      return SEPA2CODE[code];
    }) + q;
  });

  if (_ua.ie) {
    v = v.replace(/^\s*\{/,   "*{").  // }
          replace(/\}\s*\{/g, "}*{"). // }
          replace(/\{\}/g,    "{ }"); // for IE Array.split bug
  }
  ary = v.split(/\s*\{|\}\s*/);
  !_ua.ie && ary.pop(); // for IE Array.split bug

  if (ary.length % 2) {
    return; // parse error
  }

  for (i = 0, iz = ary.length; i < iz; i += 2) {
    expr = ary[i]; // "E>F,G"
    decl = _mm.trim(ary[i + 1]); // "color: red,text-aligh:left"
    exprs = (expr + ",").split(COMMA);
    decls = (decl + ";").split(SEMICOLON);
    !_ua.ie && (exprs.pop(), decls.pop()); // IE split bug

    gd1 = [], gd2 = [], gp1 = [], gp2 = [];
    gd1i = gd2i = gp1i = gp2i = -1;

    for (k = 0, kz = decls.length; k < kz; ++k) {
      ignore = 0;

      if (decls[k]) {
        both = decls[k].split(COLON);
        prop = both.shift();  // "color"

        val = both.join(":"); // "red"
        if (escape) {
          val = val.replace(SPECIAL_CODE, function(m, code) {
            return CODE2SEPA[code];
          });
        }

        if (prop.indexOf("\\") >= 0) { // .parser { m\argin: 2em; };
          ++ignore;
        } else if (rex1.test(val)) { // !important
          val = val.replace(rex2, ""); // trim "!important"
          valid = (VALUE_VALIDATION && valids[prop]) ?
                      _mm.style.validate[prop](val).valid : 1;
          if (valid) {
            gd2[++gd2i] = prop + ":" + val;
            gp2[++gp2i] = { prop: prop, val: val };
          } else {
            ++ignore;
          }
        } else {
          valid = (VALUE_VALIDATION && valids[prop]) ?
                      _mm.style.validate[prop](val).valid : 1;
          if (valid) {
            gd1[++gd1i] = prop + ":" + val; // "color:red"
            gp1[++gp1i] = { prop: prop, val: val }; //{prop:"color",val:"red"}
          } else {
            ++ignore;
          }
        }
        ignore && _mm.debug &&
            alert('"' + prop + ":" + val + '" ignore decl');
      }
    }
    for (j = 0, jz = exprs.length; j < jz; ++j) {
      v = exprs[j];
      if (escape) {
        v = v.replace(SPECIAL_CODE, function(m, code) {
          return CODE2SEPA[code];
        });
      }

      // * html .parser {  background: gray; }  -> "gray"
      if (STAR_HACK.test(v)) {
        _mm.debug && alert(v + " ignore CSS Star hack");
        continue; // ignore rule set
      }
      spec = calcspecCSS(v);
      if (gd1.length) {
//      !(spec in _data) && (_specs.push(spec), _data[spec] = []);
        spec in _data || (_specs.push(spec), _data[spec] = []);
        _data[spec].push({ expr: v, decl: gd1, pair: gp1 });
      }
      if (gd2.length) { // !important
        spec += 10000;
//      !(spec in _data) && (_specs.push(spec), _data[spec] = []);
        spec in _data || (_specs.push(spec), _data[spec] = []);
        _data[spec].push({ expr: v, decl: gd2, pair: gp2 });
      }
    }
  }
}

// inner - cleanup CSS
function cleanupCSS(css) { // @param String: dirty css
                        // @return String: clean css
  return _mm.trim(css.replace(/^\s*<!--|-->\s*$/g, ""). // <!-- ... --> (
    replace(/url\(([^\)]+)\)/gi, function(m, data) { // url(...) -> url("...")
      return 'url("' + data.replace(/^["']|["']$/g, "") + '")'; // trim quote
    }).
    replace(/\\([{};,])/g, function(m, c) {
      return (0x10000 + c.charCodeAt(0)).toString(16).replace(/^1/, "\\\\u");
    }).
    replace(/@[^\{]+\{[^\}]*\}/g, ""). // @font-face @page
    replace(/@[^;]+\s*;/g, "").        // @charset
    replace(/\s*[\r\n]+\s*/g, " ").    // ...\r\n...
    replace(/[\u0000-\u001f]+/g, "").  // \u0009 -> "" (unicode)
    replace(/\\x?[0-3]?[0-9a-f]/gi, "")); // "\x9"  -> "" (hex \x00 ~ \x1f)
                                          // "\9"   -> "" (octet \0 ~ \37)
}

// inner - calculating a selector's specificity
function calcspecCSS(expr) { // @param String: simple selector(without comma)
                             // @return Number: spec value
  function A() { ++a; return ""; }
  function B() { ++b; return ""; }
  function C() { ++c; return ""; }
  function C2(m, E) { return " " + E; }

  var a = 0, b = 0, c = 0,
      SPEC_E = /\w+/g,
      SPEC_ID = /#[\w\u00C0-\uFFEE\-]+/g, // (
      SPEC_NOT = /:not\(([^\)]+)\)/,
      SPEC_ATTR = /\[\s*(?:([^~\^$*|=\s]+)\s*([~\^$*|]?\=)\s*(["'])?(.*?)\3|([^\]\s]+))\s*\]/g,
      SPEC_CLASS = /\.[\w\u00C0-\uFFEE\-]+/g,
      SPEC_PCLASS = /:[\w\-]+(?:\(.*\))?/g,
      SPEC_PELEMENT = /::?(?:first-letter|first-line|before|after)/g,
      SPEC_CONTAINS = /:contains\((["'])?.*?\1\)/g;

  expr.replace(SPEC_NOT, C2).      // :not(E)
       replace(SPEC_ID, A).        // #id
       replace(SPEC_CLASS, B).     // .class
       replace(SPEC_CONTAINS, B).  // :contains("...")
       replace(SPEC_PELEMENT, C).  // ::pseudo-element
       replace(SPEC_PCLASS, B).    // :pseudo-class
       replace(SPEC_ATTR, B).      // [attr=value]
       replace(SPEC_E, C);         // E
  // ignore the universal selector

  return a * 100 + b * 10 + c;
}

// inner - import CSS
function importCSS() { // @return String: "dirty CSS"
  function imp(css, absdir) { // @import
    var IMPORTS = /@import\s*(?:url)?[\("']+\s*([\w\/.+-]+)\s*["'\)]+\s*([\w]+)?\s*;/g,
        COMMENT = /\/\*[^*]*\*+([^\/][^*]*\*+)*\//g;

    return css.replace(COMMENT, "").
               replace(IMPORTS, function(m, url, media) {
      var v = _mm.url.abs(url, absdir);
      return imp(_mm.ajax.sync(v), _mm.url.dir(v));
    });
  }

  var rv = [], absdir = _mm.url.abs("."), href, hash, dstr,
      _doc = document,
      node = _mm.toArray(_doc.styleSheets), v, w, i = 0,
      prop1 = _ua.ie ? "owningElement" : "ownerNode",
      prop2 = _ua.ie ? "uuAltCSSMemento" : "textContent",
      DATA_SCHEME_CSS = /^data\:text\/css[;,]/;


  while ( (v = node[i++]) ) {
    if (!v.disabled) {
      href = v.href || "";
      if (!DATA_SCHEME_CSS.test(href)) { // ignore data:text/css for !(IE6,IE7)
        if (/\.css$/.test(href)) {
          // <link>
          w = _mm.url.abs(v.href, absdir);
//        !(w in _importCache) &&
          w in _importCache ||
              (_importCache[w] = imp(_mm.ajax.sync(w), _mm.url.dir(w)));
          rv.push(_importCache[w]);
        } else {
          // <style>
          rv.push(imp(v[prop1][prop2], absdir));
        }
      }
    }
  }
  // decode datauri
  //    <link href="data:text/css,...">
  if (_codec) {
    node = _doc.getElementsByTagName("link"), i = 0;
    while ( (v = node[i++]) ) {
      if (DATA_SCHEME_CSS.test(v.href)) {
        hash = _codec.decode(v.href);
        dstr = String.fromCharCode.apply(null, hash.data);
        w = "link" + i; // "link1"
//      !(w in _importCache) && (_importCache[w] = imp(dstr, absdir));
        w in _importCache || (_importCache[w] = imp(dstr, absdir));
        rv.push(_importCache[w]);
      }
    }
  }
  return rv.join("");
}

function exStyleOpacity(node, prop, value) {
  _mm.style.setOpacity(node, value);
}

function exStyleTextShadow(node, prop, value) {
  var shadow = _mm.style.validate.shadow(value);

  if (!shadow.valid) {
    throw prop + "=" + value;
  }
  _mm.style.setTextShadow(node, shadow.rgba, shadow.ox,
                          shadow.oy, shadow.blur);
}

function exStyleBoxEffect(node, prop, value) {
  if (!/^(?:none|auto)$/.test(value)) { throw prop + "=" + value; }

  var data = _uid2data[_mm.node.id(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    node[_BFX].boxeffect.render = { none: 0, auto: 1 }[value];

    // for box-reflection:
    if (node[_BFX].hasReflectLayer) {
      if (!node[_BFX].boxeffect.render) {
        node[_BFX].layer.hideLayer("reflect");
        node.style.visibility = "";
      } else {
        node[_BFX].layer.showLayer("reflect");
        node.style.visibility = "hidden";
      }
    }
  }
}

function exStyleBoxShadow(node, prop, value) {
  var rv = _mm.style.validate.shadow(value), hash,
      data = _uid2data[_mm.node.id(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    hash = node[_BFX].boxshadow;
    hash.render = 1;
    hash.rgba = rv.rgba[0];
    hash.ox   = _mm.style.toPixel(node, rv.ox[0]);
    hash.oy   = _mm.style.toPixel(node, rv.oy[0]);
    hash.blur = _mm.style.toPixel(node, rv.blur[0]);
  }
}

function exStyleBoxReflect(node, prop, value) {
  var rv = _mm.style.validate.boxReflect(value),
      data = _uid2data[_mm.node.id(node)], hash;

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    hash = node[_BFX].boxreflect;
    hash.render = 1;
    hash.dir    = rv.dir;
    hash.offset = _mm.style.toPixel(node, rv.offset);
  }
}

function exStyleBorderRadius(node, prop, value) {
  var rv = _mm.style.validate.borderRadius(value), hash,
      data = _uid2data[_mm.node.id(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    hash = node[_BFX].bradius;

    if (rv.tl[0] || rv.tr[0] || rv.br[0] || rv.bl[0]) {
      hash.render = 1;
      hash.r = [_mm.style.toPixel(node, rv.tl[0]),
                _mm.style.toPixel(node, rv.tr[0]),
                _mm.style.toPixel(node, rv.br[0]),
                _mm.style.toPixel(node, rv.bl[0])];
    }
    if (hash.r[0] === hash.r[1] && hash.r[1] === hash.r[2] &&
        hash.r[2] === hash.r[3]) {
      hash.shorthand = 1;
    }
  }
}

function exStyleBorderImage(node, prop, value) {
  // ToDo:
}

function exStyleBackground(node, prop, value) {
  var rv = _mm.style.validate.background(value),
      data = _uid2data[_mm.node.id(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    _mm.mix(node[_BFX].mbg, rv);
    node[_BFX].train.mbg = 1;
  }
}

function exStyleBackgroundColor(node, prop, value) {
  var rv = _mm.color.parse(value, 1),
      data = _uid2data[_mm.node.id(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.rgba = rv;
    node[_BFX].train.mbg = 1;
  }
}

function exStyleBackgroundImage(node, prop, value) {
  var rv = _mm.splitToken(value, ","),
      data = _uid2data[_mm.node.id(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.image = rv;
    node[_BFX].train.mbg = 1;
  }
}

function exStyleBackgroundRepeat(node, prop, value) {
  var rv = value.split(","),
      data = _uid2data[_mm.node.id(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.repeat = rv;
    node[_BFX].train.mbg = 1;
  }
}

function exStyleBackgroundPosition(node, prop, value) {
  var rv = value.split(","),
      data = _uid2data[_mm.node.id(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

//  !(_BFX in node) && altcss.boxeffect.bond(node, data.excss);
    _BFX in node || altcss.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.position = rv;
    node[_BFX].train.mbg = 1;
  }
}

// plus.init
function plusInit(context) {
  if (_EXCSS.position) {
    _plan.init = altcss.ie.position.init(context);
  }
}

// plus.plan - make plan
function plusPlan(revalidate, context) {
  if (!revalidate) {
    if (_EXCSS.alphapng) {
      _plan.alphapng = altcss.ie.alphapng.query(context);
    }
  }
}

// plus.prevalidate - pre-validate plan
function plusPrevalidate(revalidate, context) {
  var v, i = 0;

  if (!revalidate) {
    if (_plan.init.length) {
      while ( (v = _plan.init[i++]) ) {
        v();
      }
      _plan.init = []; // clear
    }
    if (_EXCSS.alphapng) {
      altcss.ie.alphapng(_plan.alphapng);
      _plan.alphapng = []; // clear
    }
  }
}

// plus.postvalidate - post-validate plan
function plusPostvalidate(uid2data, revalidate, context) {
  var i = 0, uid, node, excss, bits, ns, disptbl = [],
      boxeffect = [], bfxi = -1,
      _float = parseFloat,
      EXCSS = _EXCSS,
      bfxbits = EXCSS.boxshadow | EXCSS.boxreflect |
                EXCSS.bradius | EXCSS.bimage | EXCSS.mbg;

  for (uid in uid2data) {
    node = uid2data[uid].node;
    excss = uid2data[uid].excss;
    bits = excss.bits;

    if (bits & EXCSS.opacity) { // for IE6-IE8
      ns = node.style.opacity || node.currentStyle.opacity;
      _mm.style.setOpacity(node, _float(ns) || 1.0);
    }

    if (bits & EXCSS.textshadow) { // for IE6-IE8
      shadow = _mm.style.validate.shadow(excss.decl["-uu-text-shadow"]);
      if (shadow.valid) {
        _mm.style.setTextShadow(node, shadow.rgba, shadow.ox,
                                shadow.oy, shadow.blur);
      }
    }

    (bits & EXCSS.position) && altcss.ie.position.markup(node);

    if (!revalidate) {
      if (bits & EXCSS.disptbl) {
        disptbl.push(node); // stock
      }
/*
      if (bits & EXCSS.hover) {
        (function(node) {
          _mm.attachEvent(node, "mouseenter", function(evt) {
            node.className += node.uuCSSHover;
          });
          _mm.attachEvent(node, "mouseleave", function(evt) {
            node.className =
                node.className.replace(/\s*uucsshover[\d]+/g, "");
          });
        })(node);
      }
*/
      if (bits & bfxbits) {
        boxeffect[++bfxi] = node; // stock
      }
    }
  }

  EXCSS.maxmin && (altcss.ie.maxmin.markup(context),
                   altcss.ie.maxmin());

  if (!revalidate) {
    EXCSS.position && altcss.ie.position();
    EXCSS.disptbl && altcss.ie.disptbl(disptbl);
    if (EXCSS.boxeffect) {
      i = 0;
      while ( (node = boxeffect[i++]) ) {
        altcss.boxeffect(node, _uid2data[_mm.node.id(node)].excss);
      }
    }
  }

  if (!revalidate) {
    if (EXCSS.position | EXCSS.maxmin | boxeffect.length) {
      _mm.evt.resize(redrawCSS, 1); // use resize-agent
    }
  }
}

// uuMeta.altcss.redraw
function redrawCSS() {
  _EXCSS.maxmin && altcss.ie.maxmin();
  _EXCSS.position && altcss.ie.position();
  _EXCSS.boxeffect && altcss.boxeffect.recalc();
}

// --- initialize / export ---
function boot() {
  var css = "", context, tick = +new Date;

  if (_mark || _plus) {
    if (init(css)) {
      _plus && plusInit(context);
      validateCSS(context);
      _initialized = 1;
    }
    _mm.debug && (_win.status = (new Date - tick) + "ms");
  }
  !_mm.evt.blackout &&
      (typeof _win.makeup === "function") && _win.makeup(_mm, 0);
}

// +------------+----------------+---------------+
// |            | mark           | plus          |
// +------------+----------------+---------------+
// | IE         | 6, 7, 8        | 6, 7, 8       |
// | Opera      |                | 9.5 +         |
// | Gecko      | 1.8 ~ 1.89     | 1.8 +         |
// | Webkit     | 522 ~ 529      | 522 +         |
// +------------+----------------+---------------+
_ua.ie     && (_ua.uaver >= 6)                       && (++_mark, ++_plus);
_ua.opera  && (_ua.uaver >= 9.5)                     && ++_plus;
_ua.gecko  && (_ua.rever >  1.8 && _ua.rever <= 1.9) && ++_mark;
_ua.gecko  && (_ua.rever >  1.8)                     && ++_plus;
_ua.webkit && (_ua.rever >= 522 && _ua.rever <  530) && ++_mark;
_ua.webkit && (_ua.rever >= 522)                     && ++_plus;

switch (_win.UUALTCSS_FORCE_MARKUP || 2) {
case 0: _mark = 0; break;
case 1: _mark = 1;
}
_mm.cdsl && _mm.cdsl();
_mm.evt.boot(boot);

_mm.altcss = _mm.mix(altcss, {
  getRuleset: getRuleset,
  getDeclaredValues: getDecl,
  getDirtyCSS: getDirtyCSS,
  getExStyle: getExStyle,
  setExStyle: setExStyle,
  ie: {},
  deny: _deny,
  redraw: redrawCSS
});

})(); // uuMeta.altcss scope

