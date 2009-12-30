
// === CSS 3 ===
// depend: uu.js, uu.css.*.js, uu.query.js, uu.canvas.*.js, uu.layer.js, uu.url.js
// if (uu.ie67 && !uu.config.light) {
//    IE6, IE7: Size of an inline element is invalidated.
//        <span style="width:100px; height:100px">inline with size</span>
//                             v            v
//        <span style="width:auto; height:auto">inline without size</span>
// }
    // IE6, IE7: Strip embed image
    //    <img src="data:image/*,...">
    //    <div style="background: url(data:image/*,...)">
    //          v
    //    <img src="1dot.gif">
    //    <div style="background: url(1dot.gif)">
uu.waste || (function(win, doc, uu) {
var _canvasok = uu.ver.majority,
    _usedocfg = !(uu.gecko && uu.ver.re <= 1.9), // 1: use document fragmens
    _rules = [],        // generated rules
    _uniqueRuleuID = 0, // unique rule id
    _uniqueRules = {},  // unique rule
    _mark = 0,
    _plus = 0,
    _plan = { init: [], alphapng: [], boxeffect: [] },
    _rawdata = { init: 0, specs: [], data: {} }, // [lazy]
    _dirtycss = "",     // last collected css
    _lazyClearClass = [], // lazy clear className nodeList
    _uid2data = {},     // { uid: { node, rules, klass, excss }, ... }
                        // excss: { bits: 0, decl: {}, order: "" }
    _BFX = "uucss3bfx",
    _CSS3CLASS = /uucss[\w]+\s*/g,
    _SKIP_PSEUDO = /^\*$|::?before$|::?after$|::?first-letter$|::?first-line$|:active|:focus|:hover|:unknown/,
    _EXCSS = { // extend css functions
      position:   uu.ie6    ? 0x10   : 0, // position: fixed, absolute bug
      alphapng:   uu.ie6    ? 0x20   : 0, // <img src="some.alpha.png">
      maxmin:     uu.ie67   ? 0x40   : 0, // max-width:
      disptbl:    uu.ie67   ? 0x80   : 0, // -uu-display: table
      opacity:    uu.ie     ? 0x100  : 0, // opacity:
      textshadow: uu.ie     ? 0x200  : 0, // -uu-text-shadow:
      boxeffect:  _canvasok ? 0x400  : 0, // -uu-box-effect:
      boxshadow:  _canvasok ? 0x800  : 0, // -uu-box-shadow:
      boxreflect: _canvasok ? 0x1000 : 0, // -uu-box-reflect:
      bradius:    _canvasok ? 0x2000 : 0, // -uu-border-radius:
      bimage:     _canvasok ? 0x4000 : 0, // -uu-border-image:
      mbg:        _canvasok ? 0x8000 : 0  // -uu-background:
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
//    "-uu-border-image":       _EXCSS.bimage,
      "-uu-border-radius":      _EXCSS.bradius,
      "-uu-background":         _EXCSS.mbg,
      "-uu-background-color":   _EXCSS.mbg,
      "-uu-background-image":   _EXCSS.mbg,
      "-uu-background-repeat":  _EXCSS.mbg,
      "-uu-background-position":_EXCSS.mbg
    },
    _EXSTYLE2FUNC = {
      opacity:                  _uucss3setopacity,
      "-uu-text-shadow":        _uucss3settextshadow,
      "-uu-box-effect":         _uucss3setboxeffect,
      "-uu-box-shadow":         _uucss3setboxshadow,
      "-uu-box-reflect":        _uucss3setboxreflect,
//    "-uu-border-image":       _uucss3setborderimage,
      "-uu-border-radius":      _uucss3setborderradius,
      "-uu-background":         _uucss3setbg,
      "-uu-background-color":   _uucss3setbgcolor,
      "-uu-background-image":   _uucss3setbgimg,
      "-uu-background-repeat":  _uucss3setbgrpt,
      "-uu-background-position":_uucss3setbgpos
    };

!uu.config.cssexpr && (_EXCSS.maxmin = _EXCSS.position = 0);

// [1][get] uu.css3(node, "color") -> "red"
// [2][get] uu.css3(node, "color,width") -> { color: "red", width: "20px" }
// [3][set] uu.css3(node, "color", "red") -> node
// [4][set] uu.css3(node, { color: "red" }) -> node
uu.css3 = uu.mix(uucss3, {
  get:          uucss3get,      // [1][get one  style]  uu.css3.get(node, "color") -> "red"
                                // [2][get some styles] uu.css3.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
  set:          uucss3set,      // [1][set one  style]  uu.css3.set(node, "-uu-box-shadow", "3px 3px 3px") -> node
                                // [2][set some styles] uu.css3.set(node, { "-uu-box-shadow": "3px 3px 3px" }) -> node
  decl:         uucss3decl,     // uu.css3.decl(node) -> Hash/void 0
  rules:        uucss3rules,    // uu.css3.rules() -> [rule, ...]
  review:       uucss3review,   // uu.css3.review(ctx, full)
  redraw:       uucss3redraw,   // uu.css3.redraw()
  dirtycss:     uucss3dirtycss, // uu.css3.dirtycss() -> "dirty css"
  bgcanvas: uu.mix(uucss3bgcanvas, {  // uu.css3.bgcanvas("id") -> CanvasRenderingContext/null
    redraw:     uucss3bgcanvasredraw  // uu.css3.bgcanvas.redraw(fn)
  }),
  _deny:        0               // [protected] deny removeChild
});

// uu.css3 - css3 accessor
// [1][get] uu.css3(node, "color") -> "red"
// [2][get] uu.css3(node, "color,width") -> { color: "red", width: "20px" }
// [3][set] uu.css3(node, "color", "red") -> node
// [4][set] uu.css3(node, { color: "red" }) -> node
function uucss3(node,   // @param Node:
                mix1,   // @param JointString/Hash(= void 0):
                mix2) { // @param String(= void 0):
                        // @return String/Hash/CSS2Properties/Node:
  return ((mix2 === void 0 && uu.isstr(mix1)) ? uucss3get
                                              : uucss3set)(node, mix1, mix2);
}

// uu.css3.get
// [1][get one  style]  uu.css3.get(node, "color") -> "red"
// [2][get some styles] uu.css3.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
function uucss3get(node,     // @param Node:
                   styles) { // @param JointString: "color"
                             // @return String: "red"
  var rv = {}, ary = styles.split(","), v, i = 0,
      data = _uid2data[uu.nodeid(node)];

  while ( (v = ary[i++]) ) {
    rv[v] = (data && !v.indexOf("-uu")) ? (data.excss.decl[v] || "")
                                        : uu.css.get(node, v);
  }
  return (ary.length === 1) ? rv[ary[0]] : rv;
}

// uu.css3.set
// [1][set one  style]     uu.css3.set(node, "-uu-box-shadow", "3px 3px 3px") -> node
// [2][set some styles]    uu.css3.set(node, { "-uu-box-shadow": "3px 3px 3px" }) -> node
function uucss3set(node,  // @param Node:
                   key,   // @param String/Hash:
                   val) { // @param String(= void 0):
  var hash, fn, i, v, FIX = uupub.FIX;

  uu.isstr(key) ? (hash = {}, hash[key] = val) : (hash = key);
  for (i in hash) {
    v = hash[i];
    if (v !== void 0) {
      fn = _EXSTYLE2FUNC[i];
      if (fn) {
        fn(node, i, v);
      } else {
        if (_BFX in node) { // hash boxeffect prop
          !i.indexOf("margin") && (node[_BFX].train.margin = 1);
          !i.indexOf("border") && (node[_BFX].train.border = 1);
        }
        node.style[FIX[i] || i] = v;
      }
    }
  }
}

// uu.css3.decl - get declaration values (raw CSS String)
function uucss3decl(node) { // @param Node:
                            // @return Hash/void 0: { bits, order, decl }
                            //             Number: bits, 0 to 0xffffffff
                            //             String: order, comma jointed string
                            //                            has,last-comma,
                            //             Hash: decl { color: "red", ... }
  var rv = _uid2data[uu.nodeid(node)];

  return rv ? rv.excss : rv;
}

// uu.css3.redraw
function uucss3redraw() {
  _EXCSS.maxmin && uucss3.fixie.maxmin();
  _EXCSS.position && uucss3.fixie.position();
  _EXCSS.boxeffect && uucss3.boxeffect.recalc();
}

// uu.css3.review - rebuild view
function uucss3review(ctx,    // @param Node/IDString(= void 0):
                              //                      revalidation context
                      full) { // @param Number(= 0): 0 is quick build
  // lazy revalidate for :target
  (_mark || _plus) && setTimeout(function() {
    _uucss3review(uu.isstr(ctx) ? uu.id(ctx) : ctx, full || 0, "");
  }, 0);
}

// inner - rebuild style
function _uucss3review(ctx, rebuild, dirtycss) {
  var tick = +new Date, css;

  ctx = (!ctx || !ctx.parentNode || ctx === doc) ? doc : ctx.parentNode;
  unbond(ctx);
  if (rebuild) {
    css = uu.css.clean(_dirtycss = (dirtycss || uu.css.imports()));
    _rawdata = uu.mix(uu.css.parse(css), { init: 1 });
  }
  _uucss3validate(_rawdata, ctx);

  uu.config.debug && (win.status = (new Date - tick) + "ms");
}

// uu.css3.rules
function uucss3rules() { // @return Array: rule-set
    return _rules;
}

// uu.css3.dirtycss - get last collected CSS
function uucss3dirtycss() { // @return String: "dirty CSS"
  return _dirtycss;
}

// uu.css3.bgcanvas - get -uu-canvas context
function uucss3bgcanvas(id) { // @param String: ident
                              // @return CanvasRenderingContext/null:
  var bfx = _uucss3bgcanvas(id);

  return bfx ? bfx.layer.getContext("nodebg") : null;
}

// uu.css3.bgcanvas.redraw - bind redraw callback function
function uucss3bgcanvasredraw(id,   // @param String:
                              fn) { // @param Function: callback function
  var bfx = _uucss3bgcanvas(id);

  bfx && (bfx.redrawfn = fn);
}

// inner - find -uu-canvas node
function _uucss3bgcanvas(id) { // @return Hash: bfx
  var ary = uu.query(":boxeffect", doc.body), v, i = 0;

  while ( (v = ary[i++]) ) {
    if (v[_BFX].mbg.canvasid === id) {
      return v[_BFX];
    }
  }
  return 0;
}

// inner - unbond attrs
function unbond(context) { // @param Node:
  var node, v, i, j;

  // remove class="uucss{n} ..."
  //   1. replace element.className
  //   2. remove element.uucss3c attr
  _lazyClearClass = uu.query("[uucss3c]", context);

  // remove "!important" style
  //   1. collect old style from element.uucss3ihash
  //   2. remove element.uuCSSI attr
  if (!uu.ie) {
    node = uu.query("[uucss3i]", context), i = 0;
    while ( (v = node[i++]) ) {
      for (j in v.uucss3ihash) {
        v.style.removeProperty(j);
        v.style.setProperty(j, v.uucss3ihash[j], "");
      }
      v.removeAttribute("uucss3i"); // unmarkup
    }
  }
}

// inner - validate CSS
function _uucss3validate(rawdata, context) {
  // uuNode.cutdown - cut all nodes less than context
  function cutdown(context) { // @param Node(= <body>): parent node
                              // @return DocumentFragment:
    var rv, ctx = context || doc.body;
    if (doc.createRange) {
      (rv = doc.createRange()).selectNodeContents(ctx);
      return rv.extractContents();
    }
    rv = doc.createDocumentFragment();
    while (ctx.firstChild) {
      rv.appendChild(ctx.removeChild(ctx.firstChild));
    }
    return rv;
  }

  var v, w, i = 0, j, k, l, iz = rawdata.specs.length, jz, kz, lz,
      spec, data, expr, ruleid, nodeuid, excss, node,
      fragment, ruleset = [],
      gridx = -1,
      expair, exbits, exdecl, exorder, exoi, exv, exw, exi, // work
      // document fragment context
      dfctx = (!context || context === doc ||
                           context === uupub.root) ? doc.body : context,
      DISPLAY_INLINE = /display:inline;/i, INLINE = /^inline$/;

  // reset global vars
  _rules = [];
  _uid2data = {};

  for (; i < iz; ++i) { // [!] no while [!]
    spec = rawdata.specs[i];
    data = rawdata.data[spec];

    for (j = 0, jz = data.length; j < jz; ++j) {
      expr = data[j].expr;

      if (_SKIP_PSEUDO.test(expr)) { // skip universal, pseudo-class/elements
        continue;
      }

      try {
        if (_plus) {
          expair = data[j].pair;
          exbits = 0, exdecl = {}, exorder = [], exoi = -1, exi = 0;

          while ( (exv = expair[exi++]) ) {
            switch (exw = _DECL2EXCSS[exv.prop] || 0) {
            case 1: (exv.val === "fixed") && (exbits |= _EXCSS.position); break;
            case 2: (exv.val === "table") && (exbits |= _EXCSS.disptbl); break;
            default: exbits |= exw;
            }
            exdecl[exv.prop] = exv.val;
            exorder[++exoi] = exv.prop;
          }
          excss = { bits: exbits, decl: exdecl,
                    order: exorder.join(",") + "," };
        }
        node = uu.query(expr, context);

        if (uu.ie || spec < 10000) {
          // make unique rule id from expr
          ruleid = _uniqueRules[expr] ||
                   (_uniqueRules[expr] = ++_uniqueRuleuID);

          // add new rule
          if (_mark) {
            // ".uucss[num] { color: red; font-size: 24pt; ... }"
            w = (spec < 10000) ? data[j].decl.join(";")
                               : data[j].decl.join(" !important;") + " !important;";
            w += ";";
            ruleset.push(".uucss" + ruleid, w);
          }
          for (k = 0, kz = node.length; k < kz; ++k) {
            v = node[k];
            nodeuid = uu.nodeid(v); // node unique id

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

              if (_mark) {
                // .uucss{n}
                _uid2data[nodeuid].klass.push("uucss" + ruleid);
              }

              // [ACID2][IE6][IE7] inline-element has neither width nor height
              //                   (need window.xconfig.light = 0)
              if (uu.ie67 && !uu.config.light) {
                if (DISPLAY_INLINE.test(w) ||
                    INLINE.test(v.currentStyle.display)) {
                  _mark && _uid2data[nodeuid].klass.push("uucssinline");
                }
              }
            }
            // mixin plus info
            if (_plus) {
              // mixin bits
              _uid2data[nodeuid].excss.bits |= excss.bits;

              // mixin declarations
              uu.mix(_uid2data[nodeuid].excss.decl, excss.decl);

              // append declaration order
              _uid2data[nodeuid].excss.order
                  += excss.order; // "has,last-comma,"
            }
          }
        } else { // "!important" route
          for (k = 0, kz = node.length; k < kz; ++k) {
            v = node[k];
            nodeuid = uu.nodeid(v); // node unique id

            if (_mark) {
              v.setAttribute("uucss3i", 1); // bond + markup for revalidate

              // init container
              "uucss3ihash" in v || (v.uucss3ihash = {}); // bond

              for (l = 0, lz = data[j].pair.length; l < lz; ++l) {
                w = data[j].pair[l];
                // save
                v.uucss3ihash[w.prop] = v.style.getPropertyValue(w.prop);
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
              uu.mix(_uid2data[nodeuid].excss.decl, excss.decl);

              // append declaration order
              _uid2data[nodeuid].excss.order
                  += excss.order; // "has,last-comma,"
            }
          }
        }
      } catch(err) {
        uu.config.debug && 
            alert("validate fail: " + err);
      }
    }
  }

  _plus && _uucss3plusplan(rawdata.init, context);

  _usedocfg && !uu.css3._deny && (fragment = cutdown(dfctx));
  // --- begin code block ---
      // lazy - clear all rules
      uu.css.clear("uucss3");

      // lazy - clear all className
      i = 0;
      while ( (v = _lazyClearClass[i++]) ) {
        if (!(uu.ie67 && v.getAttribute("uuCSSLock"))) {
          v.className = v.className.replace(_CSS3CLASS, "");
          v.removeAttribute("uucss3c");
        }
      }

      // apply to className
      if (_mark) {
        for (nodeuid in _uid2data) {
          v = _uid2data[nodeuid].node;
          if (uu.ie67 && v.getAttribute("uuCSSLock")) {
            ;
          } else {
            w = v.className + " " + _uid2data[nodeuid].klass.join(" ");
            v.className = uu.trim.inner(w);
            v.setAttribute("uucss3c", "1"); // bond + markup for revalidate
          }
        }
      }
      // insert rule
      i = 0;
      while ( (v = ruleset[i++]) ) {
        uu.css.inject("uucss3", v, ruleset[i]);
        _rules[++gridx] = ruleset[i] + "{" + ruleset[i] + "}";
        ++i;
      }

      // strip width
      if (uu.ie67 && !uu.config.light) {
        uu.css.inject("uucss3",
                      ".uucssinline", "width:auto;height:auto");
        _rules[++gridx] = ".uucssinline{width:auto;height:auto}";
      }
      // boost prevalidate
      _plus && _uucss3plusprevalidate(rawdata.init);
  // --- end code block ---
  _usedocfg && !uu.css3._deny && dfctx.appendChild(fragment);

  // boost postvalidate
  _plus && _uucss3pluspostvalidate(_uid2data, rawdata.init, context);

  // Opera9.5+ problem fix and Opera9.2 flicker fix
  uu.opera && (_usedocfg = 0);
}

// inner - opacity:
function _uucss3setopacity(node, prop, value) {
  uu.css.opacity.set(node, value);
}

// inner - -uu-text-shadow:
function _uucss3settextshadow(node, prop, value) {
  var shadow = uu.css.validate.shadow(value);

  if (!shadow.valid) {
    throw prop + "=" + value;
  }
  uu.css.textShadow.set(node,
      uu.css.makeShadow(shadow.rgba, shadow.ox,
                        shadow.oy, shadow.blur));
}

// inner - -uu-box-effect:
function _uucss3setboxeffect(node, prop, value) {
  if (!/^(?:none|auto)$/.test(value)) { throw prop + "=" + value; }

  var data = _uid2data[uu.nodeid(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
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

// inner - -uu-box-shadow:
function _uucss3setboxshadow(node, prop, value) {
  var rv = uu.css.validate.shadow(value), hash,
      data = _uid2data[uu.nodeid(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    hash = node[_BFX].boxshadow;
    hash.render = 1;
    hash.rgba = rv.rgba[0];
    hash.ox   = uu.css.px.value(node, rv.ox[0]);
    hash.oy   = uu.css.px.value(node, rv.oy[0]);
    hash.blur = uu.css.px.value(node, rv.blur[0]);
  }
}

// inner - -uu-box-reflect:
function _uucss3setboxreflect(node, prop, value) {
  var rv = uu.css.validate.boxReflect(value),
      data = _uid2data[uu.nodeid(node)], hash;

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    hash = node[_BFX].boxreflect;
    hash.render = 1;
    hash.dir    = rv.dir;
    hash.offset = uu.css.px.value(node, rv.offset);
  }
}

// inner - -uu-border-radius:
function _uucss3setborderradius(node, prop, value) {
  var rv = uu.css.validate.borderRadius(value), hash,
      data = _uid2data[uu.nodeid(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    hash = node[_BFX].bradius;

    if (rv.tl[0] || rv.tr[0] || rv.br[0] || rv.bl[0]) {
      hash.render = 1;
      hash.r = [uu.css.px.value(node, rv.tl[0]),
                uu.css.px.value(node, rv.tr[0]),
                uu.css.px.value(node, rv.br[0]),
                uu.css.px.value(node, rv.bl[0])];
    }
    if (hash.r[0] === hash.r[1] && hash.r[1] === hash.r[2] &&
        hash.r[2] === hash.r[3]) {
      hash.shorthand = 1;
    }
  }
}

/* // inner - -uu-border-image:
function _uucss3setborderimage(node, prop, value) {
  // ToDo:
}
 */

// inner - -uu-background:
function _uucss3setbg(node, prop, value) {
  var rv = uu.css.validate.background(value),
      data = _uid2data[uu.nodeid(node)];

  if (!rv.valid) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    uu.mix(node[_BFX].mbg, rv);
    node[_BFX].train.mbg = 1;
  }
}

// inner - -uu-background-color:
function _uucss3setbgcolor(node, prop, value) {
  var rv = uu.color(value),
      data = _uid2data[uu.nodeid(node)];

  if (!rv) { throw prop + "=" + value; }
  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.rgba = rv;
    node[_BFX].train.mbg = 1;
  }
}

// inner - -uu-background-image:
function _uucss3setbgimg(node, prop, value) {
  var rv = uu.split.token(value, ","),
      data = _uid2data[uu.nodeid(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.image = rv;
    node[_BFX].train.mbg = 1;
  }
}

// inner - -uu-background-repeat:
function _uucss3setbgrpt(node, prop, value) {
  var rv = value.split(","),
      data = _uid2data[uu.nodeid(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.repeat = rv;
    node[_BFX].train.mbg = 1;
  }
}

// inner - -uu-background-position:
function _uucss3setbgpos(node, prop, value) {
  var rv = value.split(","),
      data = _uid2data[uu.nodeid(node)];

  if (data) {
    data.excss.decl[prop] = value; // update

    _BFX in node || uucss3.boxeffect.bond(node, data.excss);
    node[_BFX].mbg.position = rv;
    node[_BFX].train.mbg = 1;
  }
}

// inner - plus.init
function _uucss3plusinit(context) {
  if (_EXCSS.position) {
    _plan.init = uucss3.fixie.position.init(context);
  }
}

// inner - plus.plan - make plan
function _uucss3plusplan(revalidate, context) {
  if (!revalidate) {
    if (_EXCSS.alphapng) {
      _plan.alphapng = uucss3.fixie.alphapng.query(context);
    }
  }
}

// inner - plus.prevalidate - pre-validate plan
function _uucss3plusprevalidate(revalidate) {
  var v, i = 0;

  if (!revalidate) {
    if (_plan.init.length) {
      while ( (v = _plan.init[i++]) ) {
        v();
      }
      _plan.init = []; // clear
    }
    if (_EXCSS.alphapng) {
      uucss3.fixie.alphapng(_plan.alphapng);
      _plan.alphapng = []; // clear
    }
  }
}

// inner - plus.postvalidate - post-validate plan
function _uucss3pluspostvalidate(uid2data, revalidate, context) {
  var i = 0, uid, node, excss, bits, ns, disptbl = [],
      boxeffect = [], bfxi = -1, shadow,
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
      uu.css.opacity.set(node, _float(ns) || 1.0);
    }

    if (bits & EXCSS.textshadow) { // for IE6-IE8
      shadow = uu.css.validate.shadow(excss.decl["-uu-text-shadow"]);
      if (shadow.valid) {
        uu.css.textShadow.set(node,
            uu.css.makeShadow(shadow.rgba, shadow.ox,
                              shadow.oy, shadow.blur));
      }
    }

    (bits & EXCSS.position) && uucss3.fixie.position.markup(node);

    if (!revalidate) {
      if (bits & EXCSS.disptbl) {
        disptbl.push(node); // stock
      }
      if (bits & bfxbits) {
        boxeffect[++bfxi] = node; // stock
      }
    }
  }

  EXCSS.maxmin && (uucss3.fixie.maxmin.markup(context),
                   uucss3.fixie.maxmin());

  if (!revalidate) {
    EXCSS.position && uucss3.fixie.position();
    EXCSS.disptbl && uucss3.fixie.disptbl(disptbl);
    if (EXCSS.boxeffect) {
      i = 0;
      while ( (node = boxeffect[i++]) ) {
        uucss3.boxeffect(node, _uid2data[uu.nodeid(node)].excss);
      }
    }
  }

  if (!revalidate) {
    if (EXCSS.position | EXCSS.maxmin | boxeffect.length) {
      uu.ev.resize.stop(uu.ie ? 1 : 0); // [IE] agent, [OTHER] event
      uu.ev.resize(uucss3redraw, uu.ie ? 1 : 0);
    }
  }
}

// inner - blackout
function _uucss3blackout(css) { // @return Boolean: true is blackout
  var name = win.name;
  // http://d.hatena.ne.jp/uupaa/20090619
/*
  win.name = ""; // clear
  if (/UNKNOWN[^\{]+?\{|:unknown[^\{]+?\{/.test(css) && // }}}}
      "UNKNOWN" !== name) {
    win.name = "UNKNOWN";
    uu.ready.gone.blackout = 1; // stop boot process
    location.reload(false);
    return true;
  }
  return false;
 */
  win.name = ""; // clear
  if ("BLACKOUT" !== name) {
    if (/[;\{] uu/.test(css) || // { uu-border... } or { ...; uu-border... }
        /UNKNOWN[^\{]+?\{|:unknown[^\{]+?\{/.test(css)) { // }}}}}
      win.name = "BLACKOUT";
      uu.ready.gone.blackout = 1; // stop boot process
      location.reload(false);
      return true;
    }
  }
  return false;
}

// inner - memento for IE6, IE7, IE8
function _uucss3memento() {
  var node = uu.tag("style"), v, i = 0, MEMENTO = "uucss3memento";

  while ( (v = node[i++]) ) {
    // skip <style id="uucss3ignore...">
    if (v.id && !v.id.indexOf("uucss3ignore")) {
      continue;
    }
    MEMENTO in v || (v[MEMENTO] = v.innerHTML);
  }
}

// inner - decode data:text/javascript
//    <script src="data:text/javascript,..">
function _uucss3decodescript() {
  var node = uu.tag("script"), v, i = 0, hash, dstr, DATA = "data:";

  while ( (v = node[i++]) ) {
    if (!v.src.indexOf(DATA)) {
      hash = uu.codec.datauri.decode(v.src);
      if (hash.mime === "text/javascript") {
        dstr = String.fromCharCode.apply(null, hash.data);
        (new Function(dstr))();
      }
    }
  }
}

// --- initialize / export ---
// inner - wrap auto viewbox
function _uucss3autoviewbox() {
  var ary1 = uu.query('[class/="uuautoviewbox*"]'), ary2,
      div, v, w, i = 0, j, padding, rex = /[_-]/g;

  while ( (v = ary1[i++]) ) {
    ary2 = uu.split(v.className);
    padding = "";
    j = 0;
    while ( (w = ary2[j++]) ) {
      if (!w.indexOf("uuautoviewbox")) {
        padding = w.slice(13).replace(rex, " "); // "5px-5px" -> "5px 5px"
        break;
      }
    }
    div = doc.createElement("div");
    div.className = "viewbox";
    div.style.padding = padding || "auto";
    uu.node.wrap(v, div);
  }
}

// inner - collect css, parse, validate and draw
function _css3init() {
  var css = "", tick = +new Date;

  _plus && _uucss3autoviewbox();

  if (_mark || _plus) {
    uu.ie && _uucss3memento();
    css = uu.css.clean(_dirtycss = (css || uu.css.imports()));
    if (uu.ie6 && _uucss3blackout(css)) { // ignore lazy
      return;
    }
    // create style sheet
    uu.css.create("uucss3");
    // decode <script src="data:...">
    uu.ie && !uu.config.light && uu.codec.datauri && _uucss3decodescript();
    // parse
    _rawdata = uu.mix(uu.css.parse(css), { init: 0 });

    _plus && _uucss3plusinit();
    _uucss3validate(_rawdata);
    // init flag
    _rawdata.init = 1;

    // debug
    uu.config.debug && (win.status = (new Date - tick) + "ms");
  }
}

// +------------+----------------+---------------+
// |            | mark = 1       | plus = 1      |
// +------------+----------------+---------------+
// | IE         | 6, 7, 8        | 6, 7, 8       |
// | Opera      |                | 9.5 +         |
// | Gecko      | 1.81 ~ 1.9     | 1.81 +        |
// | Webkit     | 522 ~ 529      | 522 +         |
// +------------+----------------+---------------+
(function() {
  uu.ie     && (uu.ver.ua >= 6)                       && (++_mark, ++_plus);
  uu.opera  && (uu.ver.ua >= 9.5)                     && ++_plus;
  uu.gecko  && (uu.ver.re >  1.8 && uu.ver.re <= 1.9) && ++_mark;
  uu.gecko  && (uu.ver.re >  1.8)                     && ++_plus;
  uu.webkit && (uu.ver.re >= 522 && uu.ver.re <  530) && ++_mark;
  uu.webkit && (uu.ver.re >= 522)                     && ++_plus;

  // http://d.hatena.ne.jp/uupaa/20091203/1259828564
  if (uu.isfunc(uu.config.altcss)) {
    // 0 is auto, 1 is enable, -1 is disable
    var ary = uu.config.altcss(uu); // @return Array: [mark, plus]

    _mark = { "-1": 0, 0: _mark, 1: 1 }[ary[0]];
    _plus = { "-1": 0, 0: _plus, 1: 1 }[ary[1]];
  }
})();

// functional collision with uu.canvas is evaded
uu.lazy("init", function() {
  uu.ready(_css3init);
}, 1); // 1: mid order

})(window, document, uu);

