
// === CSS 2.1 / StyleSheet ===
// depend: uu.js, uu.color.js, uu.str.js, uu.tween.js
//
// clientWidth           = style.width + padding
// offsetWidth           = style.width + padding + border
// getBoundingClientRect = style.width + padding + border
//
uu.agein || (function(win, doc, uu) {
var _mix    = uu.mix,
    _ie     = uu.ie,
    _db     = { ss: {} }, // { StyleSheetid: StyleSheetObject, ... }
    _BORDER = { thin: 1, medium: 3, thick: (uu.ie67 || uu.opera) ? 6 : 5 },
    _IE_DX  = "DXImageTransform.Microsoft.",
    _SHADOW = _IE_DX + "Shadow",
    _BLUR   = _IE_DX + "MotionBlur",
    _POS_PARENT = { relative: 1, absolute: 1 };

_mix(uu.css, {
  // --- offset (x, y) ---
  // [1][get] uu.css.off(node) -> { x, y }(from <html>)
  // [2][get] uu.css.off(node, node.parentNode) -> { x, y }(from ancestor)
  // [3][get] uu.css.off(node, null, 1) -> { x, y }(from foster)
  // [4][set] uu.css.off(node, x, y) -> node
  off:     _mix(uucssoff, {
    get:        uucssoffget,    // [1][from <html>]   uu.css.off.get(node) -> { x, y }
                                // [2][from ancestor] uu.css.off.get(node, node.parentNode) -> { x, y }
                                // [3][from foster]   uu.css.off.get(node, 0, 1) -> { x, y }
    set:        uucssoffset     // uu.css.off.set(node, x, y) -> node
  }),
  // --- size (w, h) ---
  // [1][get] uu.css.size(node) -> { w, h }(node.style.width + padding + border)
  // [2][get] uu.css.size(node, 1) -> { w, h }(node.style.width)
  // [3][set] uu.css.size(node, width, height) -> node
  size:    _mix(uucsssize, {
    get:        uucsssizeget,   // [1][get] uu.css.size(node) -> { w, h }(node.style.width + padding + border)
                                // [2][get] uu.css.size(node, 1) -> { w, h }(node.style.width)
                                // [3][get] uu.css.size(node, 2) -> { w, h }(node.style.width)(offscreen)
    set:        uucsssizeset    // [1][set] uu.css.size(node, width, height) -> node
  }),
  // --- rect (x, y, w, h) ---
  // [1][get] uu.css.rect(node) -> { x, y, w, h }
  // [2][set] uu.css.rect(node, hash) -> node
  rect:    _mix(uucssrect, {
    get:        uucssrectget,   // uu.css.rect.get(node) -> { x, y, w, h }
    set:        uucssrectset    // uu.css.rect.set(node, { x, y, w, h }) -> node
  }),
  inRect:       uucssinrect,    // uu.css.inRect({ x, y, w, h }, x, y) -> Boolean
  // --- box ---
  margin:  _mix(uucssmarginget, {   // [alias] uu.css.margin.get
    get:        uucssmarginget      // uu.css.margin.get(node, actual = false) -> { t, l, r, b, w, h }
  }),
  border:  _mix(uucssborderget, {   // [alias] uu.css.border.get
    get:        uucssborderget      // uu.css.border.get(node, actual = false) -> { t, l, r, b, w, h }
  }),
  padding: _mix(uucsspaddingget, {  // [alias] uu.css.padding.get
    get:        uucsspaddingget     // uu.css.padding.get(node, actual = false) -> { t, l, r, b, w, h }
  }),
  // --- convert unit ---
  px:      _mix(_ie ? uucsspxie
                    : uucsspx, {    // uu.css.px(node, prop) -> Number(123)
    value:      uucsspxvalue,       // uu.css.px.value(node, value) -> Number(123)
    actvalue:   _ie ? uucsspxactvalueie
                    : uucsspxactvalue
                                    // uu.css.px.actvalue(node, value) -> Number(123)
  }),
  // --- appear ---
  show:         uucssshow,        // uu.css.show(node, fadein = 0) -> node
  hide:         uucsshide,        // uu.css.hide(node, fadeout = 0) -> node
  // --- positioning ---
  toStatic:     uucsstostatic,    // uu.css.toStatic(node) -> node
  toAbsolute:   uucsstoabsolute,  // uu.css.toAbsolute(node) -> node
  toRelative:   uucsstorelative,  // uu.css.toRelative(node) -> node
  // --- text selectable ---
  selectable:   uucssselectable,    // uu.css.selectable(node) -> node
  unselectable: uucssunselectable,  // uu.css.unselectable(node) -> node
  // --- background ---
  // [1][get] uu.css.bg(node) -> { color, img, rpt, pos }
  // [2][set] uu.css.bg(node, color, img, rpt, pos) -> node
  bg:      _mix(uucssbg, {
    get:        uucssbgget,       // uu.css.bg.get(node) -> { color, img, rpt, pos }
    set:        uucssbgset        // uu.css.bg.set(node, color, img, rpt, pos) -> node
  }),
  bgcolor: _mix(uucssbgcolor, {   // [1][get] uu.css.bgcolor(node) -> ColorHash
                                  // [2][set] uu.css.bgcolor(node, ColorHash) -> node
    get:        uucssbgcolorget,  // uu.css.bgcolor.get(node) -> ColorHash
    set:        uucssbgcolorset,  // uu.css.bgcolor.set(node, ColorHash) -> node
    inherit:    uucssbgcolorinherit // uu.css.bgcolor.inherit(node) -> ColorHash
  }),
  // [1][get] uu.css.bgimg(node) -> URLString or ""
  // [2][set] uu.css.bgimg(node, url) -> node
  bgimg:   _mix(uucssbgimg, {
    get:        uucssbgimgget,  // uu.css.bgimg.get(node) -> "http://..." or ""
    set:        uucssbgimgset   // uu.css.bgimg.set(node, url) -> node
  }),
  // [1][get] uu.css.bgrpt(node) -> "repeat"
  // [2][set] uu.css.bgrpt(node, "repeat) -> node
  bgrpt:   _mix(uucssbgrpt, {
    get:        uucssbgrptget,  // uu.css.bgrpt.get(node) -> "repeat"
    set:        uucssbgrptset   // uu.css.bgrpt.set(node, "repeat") -> node
  }),
  // [1][get] uu.css.bgpos(node) -> [x, y]
  // [2][set] uu.css.bgpos(node, [x, y]) -> node
  bgpos:   _mix(uucssbgpos, {
    get:        uucssbgposget,  // uu.css.bgpos.get(node) -> [x, y]
    set:        uucssbgposset   // uu.css.bgpos.set(node, [x, y]) -> node
  }),
  // --- shadow ---
  // [1][get] uu.css.textShadow(node) -> "rgba(0,0,0,0) ox oy blur"
  // [2][set] uu.css.textShadow(node, param) -> node
  textShadow: _mix(uucsstextshadow, {
    get:        _ie ? uucsstextshadowgetie
                    : uucsstextshadowget,
    set:        _ie ? uucsstextshadowsetie
                    : uucsstextshadowset
  }),
  makeShadow:   uucssmakeshadow,  // uu.css.makeShadow([color], [ox], [oy], [blur]) -> "rgba(0,0,0,0) 1px 1px 5px, ..."
  // --- StyleSheet and Rules ---
  create:       uucsscreate,    // uu.css.create(ssid = "uuss") -> uu.Class.CSSRule instance
  inject:       uucssinject,    // uu.css.inject(ssid = "uuss", expr, decl, pos = void 0) -> pos
  reject:       uucssreject,    // uu.css.reject(ssid = "uuss", pos = void 0)
  clear:        uucssclear      // uu.css.clear(ssid = "uuss")
});

// uu.Class.CSSRule - StyleSheet manage class
uu.Class("CSSRule", {
  init:         uucssruleinit,  // uu.Class.CSSRule(ssid)
  add:          uucssruleadd    // [1][add pair]  cssrule.add(".class1", "color:red") -> this
                                // [2][add rules] cssrule.add([".class1", "color:red",
                                //                             "#id1", "color:blue"]) -> this
});

// =========================================================
// uu.css.off
// [1][get] uu.css.off(node) -> { x, y }(from <html>)
// [2][get] uu.css.off(node, node.parentNode) -> { x, y }(from ancestor)
// [3][get] uu.css.off(node, null, 1) -> { x, y }(from foster)
// [4][set] uu.css.off(node, x, y) -> node
function uucssoff(node, // @param: Node:
                  x,    // @param: Number/Node(= <html>): x or ancestor node
                  y) {  // @param: Number(= 0): y or 1 is break foster node
                        // @return Node/Hash: { x, y }
  return (uu.isnum(x) && uu.isnum(y) ? uucssoffset : uucssoffget)(node, x, y);
}

// uu.css.off.get - offset from ancestor or foster node(positioning parent)
// [1][from <html>]   uu.css.off.get(node) -> { x, y }
// [2][from ancestor] uu.css.off.get(node, node.parentNode) -> { x, y }
// [3][from foster]   uu.css.off.get(node, 0, 1) -> { x, y }
function uucssoffget(node,     // @param: Node:
                     ancestor, // @param: Node(= <html>): ancestor node
                     foster) { // @param: Number(= 0): 1 is break foster node
                               // @return Hash: { x, y }
  var x = 0, y = 0, n = node, cs;

  if (foster) {
    cs = _ie ? n.currentStyle : win.getComputedStyle(n, null);
    if (_POS_PARENT[cs.position]) {
      if (cs.left !== "auto" && cs.top !== "auto") {
        return { x: parseInt(cs.left), y: parseInt(cs.top) };
      }
    }
  }
  ancestor = ancestor || uu.html();

  while (n && n !== ancestor) {
    x += n.offsetLeft || 0;
    y += n.offsetTop  || 0;
    n = n.offsetParent;
    if (foster && n) {
      cs = _ie ? n.currentStyle : win.getComputedStyle(n, null);
      // positioning parent is { position: relative }
      //                    or { position: absolute }
      if (_POS_PARENT[cs.position]) {
        break;
      }
    }
  }
  return { x: x, y: y };
}

// uu.css.off.set - set relative node position
function uucssoffset(node, // @param Node:
                     x,    // @param Number: x
                     y) {  // @param Number: y
                           // @return Node:
  var ns = node.style;

  if (_ie || uu.opera) {
    ns.pixelLeft = x;
    ns.pixelTop  = y;
  } else {
    ns.left = x + "px";
    ns.top  = y + "px";
  }
  return node;
}

// uu.css.size
// [1][get] uu.css.size(node) -> { w, h }(node.style.width + padding + border)
// [2][get] uu.css.size(node, 1) -> { w, h }(node.style.width)
// [3][set] uu.css.size(node, width, height) -> node
function uucsssize(node, // @param Node:
                   w,    // @param Number/Number(= 0): width or plain
                   h) {  // @param Number: height
                             // @return Node/Hash:
  return (h !== void 0) ? uucsssizeset(node, w, h)
                        : uucsssizeget(node, w);
}

// uu.css.size.get
// [1][get] uu.css.size(node) -> { w, h }(node.style.width + padding + border)
// [2][get] uu.css.size(node, 1) -> { w, h }(node.style.width)
// [3][get] uu.css.size(node, 2) -> { w, h }(node.style.width)(offscreen)
function uucsssizeget(node,   // @param Node:
                      mode) { // @param Number(= 0):
                              //            0 is combined(add padding, add border)
                              //            1 is plain(no padding, no border)
                              //            2 is plain(no padding, no border,
                              //                       offscreen)
                              // @return Hash: { w, h, _x, _y }
                              //         Number: w, style.width(+padding +border)
                              //         Number: h, style.height(+padding +border)
                              //         Number/void 0: _x
                              //         Number/void 0: _y
  var w, h, r, ns, curt;

  switch (mode || 0) {
  case 0: // [2] combined(+padding, +border) size
    w = node.offsetWidth  || 0;
    h = node.offsetHeight || 0;
    if (!w && !h && node.getBoundingClientRect) {
      r = node.getBoundingClientRect();
      return { w: r.right - r.left, h: r.bottom - r.top,
               _x: r.left, _y: r.top };
    }
    break;
  case 1: // [3] plain(no padding, no border) size
    w = uu.css.px(node, "width");
    h = uu.css.px(node, "height");
    break;
  case 2: // [4] plain(no padding, no border, offscreen) size
    r = uucsspaddingget(node);
    ns = node.style;
    curt = [ns.position, ns.left, ns.top];
    ns.position = "absolute";
    ns.left = ns.top = "-9999px";
    w = node.clientWidth  - r.w; // plain width
    h = node.clientHeight - r.h; // plain height
    ns.position = curt[0];
    ns.left     = curt[1];
    ns.top      = curt[2];
  }
  return { w: w, h: h };
}

// uu.css.size.set
// [1][set] uu.css.size(node, width, height) -> node
function uucsssizeset(node, // @param Node(= void 0):
                      w,    // @param Number:
                      h) {  // @param Number:
                            // @return Node:
  node.style.width  = w + "px";
  node.style.height = h + "px";
}

// uu.css.rect
// [1][get] uu.css.rect(node) -> { x, y, w, h }
// [2][set] uu.css.rect(node, hash) -> node
function uucssrect(node,   // @param Node:
                   rect) { // @param Hash(= void 0): { x, y, w, h }
  return (rect === void 0) ? uucssrectget(node)
                           : uucssrectset(node, rect);
}

// uu.css.rect.get - get relative node position and rectangle
function uucssrectget(node) { // @param Node:
                              // @return Hash: { x, y, w, h }
                              //         Number: x, relative position x
                              //         Number: y, relative position y
                              //         Number: w, style.width + padding + border
                              //         Number: h, style.height + padding + border
  var rv = uucsssizeget(node), fix = 0, x = 0, y = 0, vp, e;

  if (rv._x !== void 0) {
    fix = (_ie && node.parentNode === doc.body) ? 2 : 0;
    vp = uucsssizeget();
    x = rv._x + vp.sw - fix;
    y = rv._y + vp.sh - fix;
  } else {
    e = node;
    while (e) {
      x += e.offsetLeft || 0;
      y += e.offsetTop  || 0;
      e  = e.offsetParent;
    }
  }
  rv.x = x;
  rv.y = y;
  return rv;
}

// uu.css.rect.set - set relative node position and rectangle
function uucssrectset(node,   // @param Node:
                      rect) { // @param Hash: { x, y, w, h }
                              //        Number(= void 0): x, style.left
                              //        Number(= void 0): y, style.top
                              //        Number(= void 0): w, style.width
                              //        Number(= void 0): h, style.height
                              // @return Node:
  var ns = node.style;

  if (_ie || uu.opera) {
    "x" in rect && (ns.pixelLeft   = rect.x);
    "y" in rect && (ns.pixelTop    = rect.y);
    "w" in rect && (ns.pixelWidth  = rect.w > 0 ? rect.w : 0);
    "h" in rect && (ns.pixelHeight = rect.h > 0 ? rect.h : 0);
  } else {
    "x" in rect && (ns.left   = rect.x + "px");
    "y" in rect && (ns.top    = rect.y + "px");
    "w" in rect && (ns.width  = (rect.w > 0 ? rect.w : 0) + "px");
    "h" in rect && (ns.height = (rect.h > 0 ? rect.h : 0) + "px");
  }
  return node;
}

// uu.css.inRect - in rectangle
function uucssinrect(rect, // @param Hash: { x, y, w, h }
                     x,    // @param Number:
                     y) {  // @param Number:
                           // @return Boolean: true = in rect
  return (x > rect.x && x < rect.x + rect.w) &&
         (y > rect.y && y < rect.y + rect.h);
}

// uu.css.margin.get - get margin size
function uucssmarginget(node,     // @param Node:
                        actual) { // @param Boolean(= false): false is quick
                                  // @return Hash: { t, l, r, b, w, h }
                                  //         Number: t, margin-top
                                  //         Number: l, margin-left
                                  //         Number: r, margin-right
                                  //         Number: b, margin-bottom
                                  //         Number: w, left + right
                                  //         Number: h, top + bottom
  if (!("uucssmargin" in node) || actual) {
    var Z = "0px",
        ns = uu.css(node),
        t = ns.marginTop,
        l = ns.marginLeft,
        r = ns.marginRight,
        b = ns.marginBottom;

    t = (t === Z) ? 0 : uucsspxvalue(node, t);
    l = (l === Z) ? 0 : uucsspxvalue(node, l);
    r = (r === Z) ? 0 : uucsspxvalue(node, r);
    b = (b === Z) ? 0 : uucsspxvalue(node, b);
    node.uucssmargin = { t: t, l: l, r: r, b: b,
                         w: l + r, h: t + b }; // bond
  }
  return node.uucssmargin;
}

// uu.css.border.get - border size
function uucssborderget(node,     // @param Node:
                        actual) { // @param Boolean(= false): false is quick
                                  // @return Hash: { t, l, r, b, w, h }
                                  //         Number: t, border-top-width
                                  //         Number: l, border-left-width
                                  //         Number: r, border-right-width
                                  //         Number: b, border-bottom-width
                                  //         Number: w, left + right
                                  //         Number: h, top + bottom
  if (!("uucssborder" in node) || actual) {
    var Z = "0px",
        ns = uu.css(node),
        t = ns.borderTopWidth,
        l = ns.borderLeftWidth,
        r = ns.borderRightWidth,
        b = ns.borderBottomWidth;

    t = _BORDER[t] || ((t === Z) ? 0 : uucsspxvalue(node, t));
    l = _BORDER[l] || ((l === Z) ? 0 : uucsspxvalue(node, l));
    r = _BORDER[r] || ((r === Z) ? 0 : uucsspxvalue(node, r));
    b = _BORDER[b] || ((b === Z) ? 0 : uucsspxvalue(node, b));
    node.uucssborder = { t: t, l: l, r: r, b: b,
                         w: l + r, h: t + b }; // bond
  }
  return node.uucssborder;
}

// uu.css.padding.get - padding size
function uucsspaddingget(node,     // @param Node:
                         actual) { // @param Boolean(= false): false is quick
                                   // @return Hash: { t, l, r, b, w, h }
                                   //         Number: t, padding-top
                                   //         Number: l, padding-left
                                   //         Number: r, padding-right
                                   //         Number: b, padding-bottom
                                   //         Number: w, left + right
                                   //         Number: h, top + bottom
  if (!("uucsspadding" in node) || actual) {
    var Z = "0px",
        ns = uu.css(node),
        t = ns.paddingTop,
        l = ns.paddingLeft,
        r = ns.paddingRight,
        b = ns.paddingBottom;

    t = (t === Z) ? 0 : uucsspxvalue(node, t);
    l = (l === Z) ? 0 : uucsspxvalue(node, l);
    r = (r === Z) ? 0 : uucsspxvalue(node, r);
    b = (b === Z) ? 0 : uucsspxvalue(node, b);
    node.uucsspadding = { t: t, l: l, r: r, b: b,
                          w: l + r, h: t + b }; // bond
  }
  return node.uucsspadding;
}

// uu.css.px.value - covert unit
// uu.css.px.value(node, 123)    -> 123
// uu.css.px.value(node, "12px") -> 12
// uu.css.px.value(node, "12pt") -> 16
// uu.css.px.value(node, "12em") -> 192
// uu.css.px.value(node, "auto") -> ERROR
function uucsspxvalue(node,     // @param Node: context
                      value,    // @param CSSString/Number:
                      actual) { // @param Boolean(= false): false = quick
                                // @return Number: pixel value
  var rv, fontSize;

  if (typeof value === "string") {
    if (value.lastIndexOf("px") > 0) { // value is pixel unit
      return parseInt(value) || 0;
    }

    if (!actual) {
      rv = parseFloat(value);
      if (value.lastIndexOf("pt") > 0) {
        rv *= 4 / 3; // 1.333...
      } else if (value.lastIndexOf("em") > 0) {
        fontSize = uu.css(node).fontSize;
        if (fontSize.lastIndexOf("pt") > 0) { // 12pt * 1.333 = 16px
          rv *= parseFloat(fontSize) * 4 / 3;
        } else {
          rv *= parseFloat(fontSize); // 12px
        }
      }
      return parseInt(rv) || 0;
    }
    value = (_ie ? uucsspxactvalueie : uucsspxactvalue)(node, value);
  }
  return value || 0;
}

// uu.css.actvalue - covert unit
// uu.css.actvalue(node, "12px") -> 12
// uu.css.actvalue(node, "12pt") -> 16
// uu.css.actvalue(node, "12em") -> 192
// uu.css.actvalue(node, "auto") -> 100
function uucsspxactvalue(node,    // @param Node:
                         value) { // @param CSSString: "10em"
                                  // @return Number:
  var st = node.style, stleft = st.left, stpos, stdisp;

  if (uu.webkit) {
    stpos  = st.getPropertyValue("position");
    stdisp = st.getPropertyValue("display");
    st.setProperty("position", "absolute", "important");
    st.setProperty("display",  "block",    "important");
  }
  st.setProperty("left", value, "important");
  // get pixel
  value = parseInt(win.getComputedStyle(node, null).left);
  // restore
  st.removeProperty("left");
  st.setProperty("left", stleft, "");
  if (uu.webkit) {
    st.removeProperty("position");
    st.removeProperty("display");
    st.setProperty("position", stpos,  "");
    st.setProperty("display",  stdisp, "");
  }
  return value;
}

function uucsspxactvalueie(node,    // @param Node:
                           value) { // @param CSSString: "10em"
                                    // @return Number:
  var st = node.style,
      rs = node.runtimeStyle,
      stleft = st.left,
      rsleft = rs.left; // keep !important value

  // overwrite
  rs.left = node.currentStyle.left;
  st.left = value;
  // get pixel
  value = st.pixelLeft;
  // restore
  st.left = stleft;
  rs.left = rsleft;

  return value;
}

// uu.css.px - get pixel value
// uu.css.px(node, "left")
// uu.css.px(node, "width")
function uucsspx(node,   // @param Node:
                 prop) { // @param String: style property name
                         // @return Number: pixel value
  return parseInt(uu.cs(node)[prop]) || 0;
}

function uucsspxie(node, prop) {
  switch (prop) {
  case "width":
      return uucsssizeget(node).w - uucsspaddingget(node, 1).w
                                  - uucssborderget(node, 1).w;
  case "height":
      return uucsssizeget(node).h - uucsspaddingget(node, 1).h
                                  - uucssborderget(node, 1).h;
  }
  var rv = node.currentStyle[prop];

  (rv === "auto") && (rv = uucsspxactvalueie(node, rv));
  return parseInt(rv) || 0;
}

// uu.css.show - show node
function uucssshow(node,     // @param Node:
                   fadein) { // @param Number(= 0): fadein tween duration
                             // @return Node:
  var cs = uu.css(node), ns = node.style,
      tmp, size, opa;

  if (cs.display !== "none" && cs.visibility !== "hidden") {
    return node; // shown
  }
  ns.visibility = "visible";
  ns.display = "";

  if (uu.css(node).display === "none") {
    // <style>{ display: none }</style>
    tmp = uu.node(uue(node.tagName)); // add to body
    // detect actual display value
    ns.display = uu.css(tmp).display;
    uu.node.remove(tmp);
  }

  size = uucsssizeget(node, 2);
  opa = uu.css.opacity.get(node);

  ns.width = "0";
  ns.height = "0";
  uu.css.opacity.set(node, 0);

  return uu.tween(node, fadein || 0, { w: size.w, h: size.h, o: opa });
}

// uu.css.hide - hide node
function uucsshide(node,      // @param Node:
                   fadeout) { // @param Number(= 0): fadeout tween duration
                              //                     0 is disable
                              // @return Node:
  var size = uucsssizeget(node, 2), // offscreen
      opa = uu.css.opacity.get(node),
      cs = uu.css(node);

  if (cs.display === "none" || cs.visibility === "hidden") {
    return node;
  }
  uu.tween(node, fadeout || 0, { w: 0, h: 0, o: 0 }, function(node, ns) {
    ns.display = "none";
    ns.visibility = "hidden";
    ns.width  = size.w + "px"; // restore size
    ns.height = size.h + "px";
    uu.css.opacity.set(node, opa);
  });
  return node;
}

// uu.css.toStatic - to static
function uucsstostatic(node) { // @return Node:
  node.style.position = "static";
//  node.style.left = node.style.top = "0px";
  return node;
}

// uu.css.toAbsolute - to absolute
function uucsstoabsolute(node) { // @param Node:
                                 // @return Node:
  var ns = node.style,
      off = uucssoffget(node, void 0, 1), // offset from foster
      margin = uucssmarginget(node);

  ns.position = "absolute";
  ns.left = (off.x - margin.l) + "px";
  ns.top  = (off.y - margin.t) + "px";
  return node;
}

// uu.css.toRelative - to relative
function uucsstorelative(node) { // @param Node:
                                 // @return Node:
  var ns = node.style, cs = uu.css(node);

  ns.left = cs.left;
  ns.top  = cs.top;
  ns.position = "relative";
  return node;
}

// uu.css.selectable
function uucssselectable(node) { // @param Node:
                                 // @return Node:
  return _uucssselectable(node, 1);
}

// uu.css.unselectable
function uucssunselectable(node) { // @param Node:
                                   // @return Node:
  return _uucssselectable(node, 0);
}

// inner -
function _uucssselectable(node,  // @param Node:
                          sel) { // @param Boolean(= true): true is selectable
                                 // @return Node:
  if (_ie || uu.opera) {
    node.unselectable = sel ? "" : "on";
    node.onselectstart = sel ? "" : _uucssselectablefalse;
    node = node.parentNode;
  } else if (uu.gecko) {
    node.style["-moz-user-select"] = sel ? "" : "none";
  } else if (uu.webkit) {
    node.style["-webkit-user-select"] = sel ? "" : "none";
  }
  return node;
}

// inner - for _uucssselectable
function _uucssselectablefalse() {
  return false;
}

// =========================================================
// uu.css.bg
// [1][get] uu.css.bg(node) -> { color, img, rpt, pos }
// [2][set] uu.css.bg(node, color, img, rpt, pos) -> node
function uucssbg(node,   // @param Node:
                 color,  // @param RGBAHash:
                 img,    // @param URLString:
                 rpt,    // @param String:
                 pos) {  // @param Array: [x, y]
  return color ? uucssbgset(node, color, img, rpt, pos) // [2]
               : uucssbgget(node); // [1]
}

// uu.css.bg.get
function uucssbgget(node) { // @param Node:
                            // @return Hash: { color, img, rpt, pos }
  return { color: uucssbgcolorget(node), // RGBAHash
           img: uucssbgimgget(node),     // URLString
           rpt: uucssbgrptget(node),     // String
           pos: uucssbgposget(node) };   // Array
}

// uu.css.bg.set
function uucssbgset(node,  // @param Node:
                    color, // @param ColorHash:
                    img,   // @param URLString: "http://..."
                    rpt,   // @param String: "repeat"
                    pos) { // @param Array: [x, y]
                           //        String: x, "0%", "left", "30px"
                           //        String: y, "0%", "top", "30px"
                           // @return Node:
  uucssbgcolorset(node, color);
  uucssbgimgset(node, img);
  uucssbgrptset(node, rpt);
  uucssbgposset(node, pos);
  return node;
}

// uu.css.bgcolor
// [1][get] uu.css.bgcolor(node) -> ColorHash
// [2][set] uu.css.bgcolor(node, ColorHash) -> node
function uucssbgcolor(node, color) {
  return (color ? uucssbgcolorset : uucssbgcolorget)(node, color);
}

// uu.css.bgcolor.get - get background-color
function uucssbgcolorget(node) { // @param Node:
                                 // @return ColorHash:
  return uu.color(uu.css(node).backgroundColor);
}

// uu.css.bgcolor.set - set background-color
// uu.css.bgcolor.set(node, ColorHash) -> node
function uucssbgcolorset(node,    // @param Node:
                         color) { // @param ColorHash:
                                  // @return Node:
  node.style.backgroundColor = uu.ver.adv ? color.rgba : color.hex;
  return node;
}

// uu.css.bgcolor.inherit - get background-color from ancestor
function uucssbgcolorinherit(node) { // @param Node:
                                     // @return ColorHash:
  var n = node, color = "transparent",
      ZERO = { transparent: 1, "rgba(0, 0, 0, 0)": 1 };

  while (n && n !== doc && ZERO[color]) {
    if ((_ie && n.currentStyle) || !_ie) {
      color = (uu.ie ? n.currentStyle
                     : win.getComputedStyle(n, null)).backgroundColor;
    }
    n = n.parentNode;
  }
  return uu.color(ZERO[color] ? "white" : color);
}

// uu.css.bgimg
// [1][get] uu.css.bgimg(node) -> URLString or ""
// [2][set] uu.css.bgimg(node, url) -> node
function uucssbgimg(node, url) {
  return (url === void 0) ? uucssbgimgget(node)
                          : uucssbgimgset(node, url);
}

// uu.css.bgimg.get - get background-image url
//    unsupport CSS3 multiple background-image
function uucssbgimgget(node) { // @param Node:
                               // @return String: "http://..." or ""
  var url = uu.trim.url(uu.css(node).backgroundImage);

  if (url.indexOf(",") > 0) { // MultiBG
    return "";
  }
  return url === "none" ? "" : url;
}

// uu.css.bgimg.set
function uucssbgimgset(node,  // @param Node:
                       url) { // @param URLString(= ""): "http://..."
                              // @return Node:
  node.style.backgroundImage = url ? ("url(" + url + ")") : "none";
  return node;
}

// uu.css.bgrpt
// [1][get] uu.css.bgrpt(node) -> "repeat"
// [2][set] uu.css.bgrpt(node, "repeat) -> node
function uucssbgrpt(node,     // @param Node:
                    repeat) { // @param String: "repeat", "repeat-x", ...
                              // @return Hash/Node:
  return (repeat === void 0) ? uucssbgrptget(node)
                             : uucssbgrptset(node, repeat);
}

// uu.css.bgrpt.get
function uucssbgrptget(node) { // @param Node:
                               // @return String: "repeat"
  return uu.css(node).backgroundRepeat;
}

// uu.css.bgrpt.set
function uucssbgrptset(node,     // @param Node:
                       repeat) { // @param String: "repeat", "repeat-x", ...
                                 // @return Node:
  node.style.backgroundRepeat = repeat;
  return node;
}

// uu.css.bgpos
// [1][get] uu.css.bgpos(node) -> [x, y]
// [2][set] uu.css.bgpos(node, [x, y]) -> node
function uucssbgpos(node, // @param Node:
                    x,    // @param String: 
                    y) {  // @param String: 
                          // @return Hash/Node:
  return (y === void 0) ? uucssbgposget(node, x)
                        : uucssbgposset(node, x, y);
}

// uu.css.bgpos.get
function uucssbgposget(node) { // @param Node:
                               // @return Array: [x, y]
                               //         String: x, "0%", "left", "30px"
                               //         String: y, "0%", "top", "30px"
  return uu.css(node).backgroundPosition.split(" ");
}

// uu.css.bgpos.set
function uucssbgposset(node,  // @param Node:
                       ary) { // @param Array: [x, y]
                              // @return Node:
  node.style.backgroundPosition = ary.join(" ");
  return node;
}

// uu.css.textShadow
// [1][get] uu.css.textShadow(node) -> "rgba(0,0,0,0) ox oy blur"
// [2][set] uu.css.textShadow(node, param) -> node
function uucsstextshadow(node,    // @param Node:
                         param) { // @param String(= 0): "rgba(0,0,0,0) ox oy blur"
                                  // @return String:
  return (param === void 0) ? uu.css.textshadow.get(node)
                            : uu.css.textshadow.set(node, param);
}

// uu.css.textShadow.get - get text-shadow value
function uucsstextshadowget(node) { // @param Node:
                                    // @return String: "rgba(0,0,0,0) ox oy blur"
  return win.getComputedStyle(node, null).textShadow || "rgba(0,0,0,0) 0 0 0";
}

function uucsstextshadowgetie(node) {
  return node.uucsstextshadow || "rgba(0,0,0,0) 0 0 0";
}

// uu.css.textShadow.set - set text-shadow value
function uucsstextshadowset(node,    // @param Node:
                            param) { // @param String: "rgba(0,0,0,0) 1px 1px 5px"
  node.style.textShadow = param;
}

function uucsstextshadowsetie(node, param) {
  var ary = uu.split.token(uu.split.token(param, ",")[0]), obj,
      ns = node.style, cs = node.currentStyle,
      ox = uucsspxactvalueie(node, ary[1]),
      oy = uucsspxactvalueie(node, ary[2]),
      blur = uucsspxactvalueie(node, ary[3]),
      chash = uu.color(ary[0]),
      dir = Math.atan2(oy, ox) * (180 / Math.PI) + 90;

  if (node.uucsstextshadow === void 0) {
    (ns.filter.indexOf(_SHADOW) < 0) && (ns.filter += " progid:" + _SHADOW);
    (ns.filter.indexOf(_BLUR)   < 0) && (ns.filter += " progid:" + _BLUR);
    (cs.display === "inline") && (ns.display = "inline-block");
    (uu.ie67 && cs.width === "auto") && (ns.zoom = 1); // hasLayout
  }
  node.uucsstextshadow = param;

  obj = node.filters.item(_SHADOW);
  obj.Color = chash.hex; // "#ffffff" style
  obj.Strength = (ox || oy) ? Math.max(Math.abs(ox), Math.abs(oy)) : 0;
  obj.Direction = dir;
  obj.Enabled = !chash.a ? false : true;

  obj = node.filters.item(_BLUR);
  obj.Add = true;
  obj.Strength = (ox || oy) ? Math.min(blur / 2.5, 10) : 5;
  obj.Direction = dir;
  obj.Enabled = !chash.a ? false : true;
}

// uu.css.makeShadow - make shadow param string
function uucssmakeshadow(color,  // @param Array: ColorString/ColorHash/RGBAHash color
                         ox,     // @param Array: shadow offsetX ("px" unit)
                         oy,     // @param Array: shadow offsetY ("px" unit)
                         blur) { // @param Array: shadow blur ("px" unit)
                                 // @return String: "rgba(0,0,0,0) 1px 1px 5px"
  var rv = [], c, v, i = 0;

  while ( (v = color[i]) ) {
    c = (typeof v === "string") ? v : v.rgba;
    rv.push(c + " " + ox[i] + " " + oy[i] + " " + blur[i]);
    ++i;
  }
  return rv.join(",");
}

// --- StyleSheet and Rules ---
// uu.css.create - create StyleSheet
function uucsscreate(ssid) { // @param String(= "uuss"): StyleSheet id
                             // @return instance: uu.Class.CSSRule
  ssid = ssid || "uuss";

  if (!_db.ss[ssid]) {
    if (_ie) {
      _db.ss[ssid] = doc.createStyleSheet();
    } else {
      var node = uue("style");

      node.appendChild(doc.createTextNode(""));
      _db.ss[ssid] = uu.head().appendChild(node);
    }
  }
  return uu.factory("CSSRule", ssid);
}

// uu.css.inject - add CSS rule
function uucssinject(ssid,  // @param String(= "uuss"): StyleSheet id
                     expr,  // @param String: css selector
                     decl,  // @param String: css declaration
                     pos) { // @param Number(= void 0): void 0 is last
                            // @return Number: inserted pos or -1(error)
  ssid = ssid || "uuss";
  var rv = -1, ss = _db.ss[ssid];

  if (ss) {
    rv = (pos === void 0) ? _rules(ss) : pos;
    _ie ? ss.addRule(uu.trim(expr), uu.trim(decl), rv)
        : (rv = ss.sheet.insertRule(expr + "{" + decl + "}", rv));
  }
  return rv;
}

// uu.css.reject - remove CSS rule
function uucssreject(ssid,  // @param String(= "uuss"): StyleSheet id
                     pos) { // @param Number(= void 0): void 0 is last
  ssid = ssid || "uuss";
  var ss = _db.ss[ssid], i;

  if (ss) {
    i = (pos === void 0) ? _rules(ss) - 1 : pos;
    (i > 1) && (_ie ? ss.removeRule(i)
                    : ss.sheet.deleteRule(i));
  }
}

// uu.css.clear - clear CSS rule
function uucssclear(ssid) { // @param String(= ""): StyleSheet id
  ssid = ssid || "uuss";
  var ss = _db.ss[ssid], i;

  if (ss) {
    i = _rules(ss);
    while (i--) {
      _ie ? ss.removeRule(i)
          : ss.sheet.deleteRule(i);
    }
  }
}

// inner -
function _rules(ss) {
  return _ie ? ss.rules.length
             : ss.sheet.cssRules.length;
}

// uu.Class.CSSRule.init
function uucssruleinit(ssid) { // @param String:
  this._ssid = ssid || "usercss";
}

// uu.Class.CSSRule.add
// [1][add pair]  cssrule.add(".class1", "color:red") -> this
// [2][add rules] cssrule.add([".class1", "color:red",
//                             "#id1", "color:blue"]) -> this
function uucssruleadd(expr,   // @param String/Array: expr or [(expr, decl), ...]
                      decl) { // @param String(= void 0): decl
                              // @return this:
  var v, i = -1, ary = (decl === void 0) ? expr : [expr, decl];

  while ( (v = ary[++i]) ) {
    uucssinject(this._ssid, v, ary[++i]);
  }
  return this;
}

})(window, document, uu);

