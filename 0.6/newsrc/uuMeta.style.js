
// === uuMeta.style ===
// depend: uuMeta, uuMeta.color
/*
uuMeta.style.getSize(node) - return { w, h, _x, _y }
uuMeta.style.getMarginSize(node, actual = false) - return { t, l, r, b, w, h }
uuMeta.style.getBorderSize(node, actual = false) - return { t, l, r, b, w, h }
uuMeta.style.getPaddingSize(node, actual = false) - return { t, l, r, b, w, h }
uuMeta.style.toPixel(node, value, actual = false) - return pixel value
uuMeta.style.getPixel(node, prop) - return pixel value
uuMeta.style.getRect(node, fromPositionParent = 0) - return { x, y, w, h }
uuMeta.style.setRect(node, { x, y, w, h })
uuMeta.style.getBackgroundColor(node, ancestor = false, toRGBA = false)
                                        - return [color, alpha] or { r,g,b,a }
uuMeta.style.bg - getBackgroundColor alias
uuMeta.style.getBackgroundImage(node) - return "http://..." or ""
uuMeta.style.bgimg - getBackgroundImage alias
uuMeta.style.getViewport() - return { w, h, sx, sy }
uuMeta.style.getOffsetFromAncestor(node, ancestor) - return { x, y }
uuMeta.style.getOffsetFromPositionParent(node) - return { x, y }
uuMeta.style.toAbsolute(node)
uuMeta.style.toStatic(node)
uuMeta.style.selectable(node)
uuMeta.style.unselectable(node)
uuMeta.style.inRect(rect, x, y) - return Boolean
 */
(function uuMetaStyleScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _doc = document,
    _int = parseInt,
    _iebody, // lazy
    _POS_PARENT = { relative: 1, absolute: 1 };

// clientWidth           = style.width + padding
// offsetWidth           = style.width + padding + border
// getBoundingClientRect = style.width + padding + border

// uuMeta.style.getSize - width + padding + border
function getSize(node) { // @param Node:
                         // @return Hash: { w, h, _x, _y }
                         //    Number: w, style.width + padding + border
                         //    Number: h, style.height + padding + border
                         //    Number/void 0: _x
                         //    Number/void 0: _y
  var w = node.offsetWidth  || 0,
      h = node.offsetHeight || 0, r;

  if ((!w && !h) && node.getBoundingClientRect) {
    r = node.getBoundingClientRect();
    return { w: r.right - r.left, h: r.bottom - r.top,
             _x: r.left, _y: r.top };
  }
  return { w: w, h: h };
}

// uuMeta.style.getMarginSize - margin size
function getMarginSize(node,     // @param Node:
                       actual) { // @param Boolean(= false): false = quick
                                 // @return Hash: { t, l, r, b, w, h }
                                 //     Number: t, margin-top
                                 //     Number: l, margin-left
                                 //     Number: r, margin-right
                                 //     Number: b, margin-bottom
                                 //     Number: w, left + right
                                 //     Number: h, top + bottom
  if (!("uuMarginCache" in node) || actual) {
    var ns = _ua.ie ? node.currentStyle : getComputedStyle(node, null),
        t = toPixel(node, ns.marginTop),
        l = toPixel(node, ns.marginLeft),
        r = toPixel(node, ns.marginRight),
        b = toPixel(node, ns.marginBottom);

    node.uuMarginCache =
        { t: t, l: l, r: r, b: b, w: l + r, h: t + b }; // bond
  }
  return node.uuMarginCache;
}

// uuMeta.style.getBorderSize - border size
function getBorderSize(node,     // @param Node:
                       actual) { // @param Boolean(= false): false = quick
                                 // @return Hash: { t, l, r, b, w, h }
                                 //     Number: t, border-top-width
                                 //     Number: l, border-left-width
                                 //     Number: r, border-right-width
                                 //     Number: b, border-bottom-width
                                 //     Number: w, left + right
                                 //     Number: h, top + bottom
  if (!("uuBorderWidthCache" in node) || actual) {
    var ns = _ua.ie ? node.currentStyle : getComputedStyle(node, null),
        hash = { thin: 1, medium: 3, thick: (_ua.ie67 || _ua.opera) ? 6 : 5 },
        t = ns.borderTopWidth,
        l = ns.borderLeftWidth,
        r = ns.borderRightWidth,
        b = ns.borderBottomWidth;

    t = hash[t] || toPixel(node, t);
    l = hash[l] || toPixel(node, l);
    r = hash[r] || toPixel(node, r);
    b = hash[b] || toPixel(node, b);
    node.uuBorderWidthCache =
        { t: t, l: l, r: r, b: b, w: l + r, h: t + b }; // bond
  }
  return node.uuBorderWidthCache;
}

// uuMeta.style.getPaddingSize - padding size
function getPaddingSize(node,     // @param Node:
                        actual) { // @param Boolean(= false): false = quick
                                  // @return Hash: { t, l, r, b, w, h }
                                  //     Number: t, padding-top
                                  //     Number: l, padding-left
                                  //     Number: r, padding-right
                                  //     Number: b, padding-bottom
                                  //     Number: w, left + right
                                  //     Number: h, top + bottom
  if (!("uuPaddingCache" in node) || actual) {
    var ns = _ua.ie ? node.currentStyle : getComputedStyle(node, null),
        t = toPixel(node, ns.paddingTop),
        l = toPixel(node, ns.paddingLeft),
        r = toPixel(node, ns.paddingRight),
        b = toPixel(node, ns.paddingBottom);

    node.uuPaddingCache =
        { t: t, l: l, r: r, b: b, w: l + r, h: t + b }; // bond
  }
  return node.uuPaddingCache;
}

// uuMeta.style.toPixel - covert unit
//    toPixel(node, 123)    -> 123
//    toPixel(node, "12px") -> 12
//    toPixel(node, "12pt") -> 16
//    toPixel(node, "12em") -> 192
//    toPixel(node, "auto") -> ERROR
function toPixel(node,     // @param Node: context
                 value,    // @param CSSString/Number:
                 actual) { // @param Boolean(= false): false = quick
                           // @return Number: pixel value
  var rv,
      xfloat = parseFloat; // alias

  if (typeof value === "string") {
    if (value.lastIndexOf("px") > 0) { // value is pixel unit
      return _int(value) || 0;
    }

    if (actual) {
      rv = xfloat(value);
      if (value.lastIndexOf("pt") > 0) {
        rv *= 4 / 3; // 1.333...
      } else if (value.lastIndexOf("em") > 0) {
        fontSize = (_ua.ie ? node.currentStyle
                           : getComputedStyle(node, null)).fontSize;
        if (fontSize.lastIndexOf("pt") > 0) { // 12pt * 1.333 = 16px
          rv *= xfloat(fontSize) * 4 / 3;
        } else {
          rv *= xfloat(fontSize); // 12px
        }
      }
      return _int(rv) || 0;
    }
    value = (_ua.ie ? toActualPixelIE : toActualPixel)(node, value);
  }
  return value || 0;
}

// inner - toActualPixel - covert unit
//    toActualPixel(node, "12px") -> 12
//    toActualPixel(node, "12pt") -> 16
//    toActualPixel(node, "12em") -> 192
//    toActualPixel(node, "auto") -> 100
function toActualPixel(node,    // @param Node:
                       value) { // @param CSSString: "10em"
                                // @return Number:
  var st = node.style, stleft = st.left, stpos, stdisp;

  if (_ua.webkit) {
    stpos  = st.getPropertyValue("position");
    stdisp = st.getPropertyValue("display");
    st.setProperty("position", "absolute", "important");
    st.setProperty("display",  "block",    "important");
  }
  st.setProperty("left", value, "important");
  // get pixel
  value = _int(getComputedStyle(node, null).left);
  // restore
  st.removeProperty("left");
  st.setProperty("left", stleft, "");
  if (_ua.webkit) {
    st.removeProperty("position");
    st.removeProperty("display");
    st.setProperty("position", stpos,  "");
    st.setProperty("display",  stdisp, "");
  }
  return value;
}

function toActualPixelIE(node,    // @param Node:
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

// uuMeta.style.getPixel - get pixel value
//    getPixel(node, "left")
//    getPixel(node, "width")
function getPixel(node,   // @param Node:
                  prop) { // @param String: style property name
                          // @return Number: pixel value
  return _int(getComputedStyle(node, null)[prop]) || 0;
}

function getPixelIE(node, prop) {
  switch (prop) {
  case "width":  return getSize(node).w - getPaddingSize(node, 1).w
                                        - getBorderSize(node, 1).w;
  case "height": return getSize(node).h - getPaddingSize(node, 1).h
                                        - getBorderSize(node, 1).h;
  }
  var rv = node.currentStyle[prop];

  (rv === "auto") && (rv = toActualPixelIE(node, rv));
  return _int(rv) || 0;
}

// uuMeta.style.getRect - get absolute node position and rectangle
function getRect(node) { // @param Node:
                         // @return Hash: { x, y, w, h }
                         //   Number: x, absolute position x
                         //   Number: y, absolute position y
                         //   Number: w, style.width + padding + border
                         //   Number: h, style.height + padding + border
  var rv = getSize(node), fix = 0, x = 0, y = 0, vp, e;

  if (rv._x !== void 0) {
    fix = (_ua.ie && node.parentNode === _doc.body) ? 2 : 0;
    vp = getViewport();
    x = rv._x + vp.sx - fix;
    y = rv._y + vp.sy - fix;
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

// uuMeta.style.setRect - set releative node position and rectangle
function setRect(node,   // @param Node:
                 rect) { // @param Hash: { x, y, w, h }
                         //   Number: x, y, w, h
  var s = node.style;

  if (_ua.ie || _ua.opera) {
    if ("x" in rect) { s.pixelLeft   = rect.x; }
    if ("y" in rect) { s.pixelTop    = rect.y; }
    if ("w" in rect) { s.pixelWidth  = rect.w > 0 ? rect.w : 0; }
    if ("h" in rect) { s.pixelHeight = rect.h > 0 ? rect.h : 0; }
  } else {
    if ("x" in rect) { s.left   = rect.x + "px"; }
    if ("y" in rect) { s.top    = rect.y + "px"; }
    if ("w" in rect) { s.width  = (rect.w > 0 ? rect.w : 0) + "px"; }
    if ("h" in rect) { s.height = (rect.h > 0 ? rect.h : 0) + "px"; }
  }
}
// uuMeta.style.getBackgroundColor - get background-color (from ancestor)
// uuMeta.style.bg
function getBackgroundColor(node,     // @param Node:
                            ancestor, // @param Boolean(= false):
                            toRGBA) { // @param Boolean(= false):
                                      //    true = return RGBAHash
                                      //    false = return Array
                                      // @return Array: [HexColorString, Alpha]
  function isZero(color) {
    return color === "transparent" || color === "rgba(0, 0, 0, 0)";
  }
  var bgc = "backgroundColor", n = node, color = "transparent",
      doc = document;

  if (!ancestor) {
    return _ua.ie ? (n.style[bgc] || n.currentStyle[bgc])
                  : getComputedStyle(n, null)[bgc];
  }
  while (n && n !== doc && isZero(color)) {
    if ((_ua.ie && n.currentStyle) || !_ua.ie) {
      color = _ua.ie ? n.currentStyle[bgc]
                     : getComputedStyle(n, null)[bgc];
    }
    n = n.parentNode;
  }
  if (toRGBA) {
    return isZero(color) ? { r: 255, g: 255, b: 255, a: 1 }
                         : _mm.color.parse(color, 1);
  }
  return isZero(color) ? ["white", 1]
                       : _mm.color.parse(color);
}

// uuMeta.style.getBackgroundImage - get background-image url
// uuMeta.style.bgimg
function getBackgroundImage(node) { // @param Node:
                                    // @return String: "http://..." or ""
  var bg = "backgroundImage", m,
      url = _ua.ie ? (node.style[bg] || node.currentStyle[bg])
                   : getComputedStyle(node, null)[bg];
  if (url.indexOf(",") < 0) { // skip CSS3 multiple background-image
    if (url) {
      if ( (m = /^url\((.*)\)$/.exec(url)) ) {
        return m[1].replace(/^\s*[\"\']?|[\"\']?\s*$/g, ""); // trim quote
      }
    }
  }
  return "";
}

// uuMeta.style.getViewport - get viewport dimension and scroll offset
function getViewport() { // @return { w, h, sx, sy }
  if (_ua.ie) {
    _iebody || (_iebody = _mm.compat.body());
    return { w: _iebody.clientWidth,
             h: _iebody.clientHeight,
             sx: _iebody.scrollLeft,
             sy: _iebody.scrollTop };
  }
  // "window.pageXOffset" alias "window.scrollX" in gecko, webkit
  return { w: innerWidth,
           h: innerHeight,
           sx: pageXOffset,
           sy: pageYOffset };
}

// uuMeta.style.getOffsetFromAncestor - get offset position from ancestor
function getOffsetFromAncestor(node,       // @param: Node:
                               ancestor) { // @param: Node:
                                           // @return Hash: { x, y }
  var x = 0, y = 0;

  while (node && node !== ancestor) {
    x += node.offsetLeft || 0;
    y += node.offsetTop  || 0;
    node = node.offsetParent;
  }
  return { x: x, y: y };
}

// uuMeta.style.selectable
function selectable(node) { // @param Node:
  _selectable(node, 1);
}

// uuMeta.style.unselectable
function unselectable(node) { // @param Node:
  _selectable(node, 0);
}

// inner -
function _selectable(node,  // @param Node:
                     sel) { // @param Boolean(= true): true is selectable
  if (_ua.ie || _ua.opera) {
    while (node) {
      node.unselectable = sel ? "" : "on";
      node.onselectstart = sel ? "" : "return false";
      node = node.parentNode;
    }
  } else if (_ua.gecko) {
    node.style["-moz-user-select"] = sel ? "" : "none";
  } else if (_ua.webkit) {
    node.style["-webkit-user-select"] = sel ? "" : "none";
  }
}

// uuMeta.style.getOffsetFromPositionParent
//    - get offset position from positioning parent
function getOffsetFromPositionParent(node) { // @param: Node:
                                             // @return Hash: { x, y }
  var x = 0, y = 0, ns;

  while (node && node !== ancestor) {
    x += node.offsetLeft || 0;
    y += node.offsetTop  || 0;
    if ( (node = node.offsetParent) ) {
      ns = _ua.ie ? node.currentStyle
                  : getComputedStyle(node, null);
      // positioning parent is { position: relative }
      //                    or { position: absolute }
      if (_POS_PARENT[ns.position]) {
        break;
      }
    }
  }
  return { x: x, y: y };
}

// uuMeta.style.toAbsolute - to absolute
function toAbsolute(node) {
  var rect = getRect(node), ns = node.style;

  ns.left = rect.x + "px";
  ns.top  = rect.y + "px";
  ns.position = "absolute";
}

// uuMeta.style.toStatic - to static
function toStatic(node) {
  node.style.position = "static";
}

// uuMeta.inRect - rectangular coordinate
function inRect(rect, // @param Hash: { x, y, w, h }
                x,    // @param Number:
                y) {  // @param Number:
                      // @return Boolean: true = in rect
  return (x > rect.x && x < rect.x + rect.w) &&
         (y > rect.y && y < rect.y + rect.h);
}

// --- initialize / export ---
_mm.mix(_mm.style, {
  getSize:        getSize,
  getMarginSize:  getMarginSize,
  getBorderSize:  getBorderSize,
  getPaddingSize: getPaddingSize,
  toPixel:        toPixel,
  toActualPixel:  _ua.ie ? toActualPixelIE : toActualPixel,
  getPixel:       _ua.ie ? getPixelIE : getPixel,
  getBackgroundColor: getBackgroundColor,
  bg:                 getBackgroundColor, // alias
  getBackgroundImage: getBackgroundImage,
  bgimg:              getBackgroundImage, // alias
  getViewport:    getViewport,
  getOffsetFromAncestor:        getOffsetFromAncestor,
  getOffsetFromPositionParent:  getOffsetFromPositionParent,
  toAbsolute:     toAbsolute,
  toStatic:       toStatic,
  selectable:     selectable,
  unselectable:   unselectable,
  getRect:        getRect,
  setRect:        setRect,
  inRect:         inRect
});

})(); // uuMeta.style scope

