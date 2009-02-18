// === Style ===============================================
// depend: viewport
uu.feat.style = {};

(function() {
var pixel = { pt: 0, em: 0 }, // pixel unit
    HOOK,
    NORMALIZE = {
      "float":    UU.IE ? "styleFloat" : "cssFloat",
      cssFloat:   UU.IE ? "styleFloat" : "cssFloat",
      styleFloat: UU.IE ? "styleFloat" : "cssFloat",
      "for":      "htmlFor",
      colspan:    "colSpan",
      rowspan:    "rowSpan",
      accesskey:  "accessKey",
      tabindex:   "tabIndex"
    },
    fnStyle = UU.IE ? 0 : uudoc.defaultView.getComputedStyle;

uu.mix(uu.style, {
  // uu.style.get - get style property
  get: function(elm,      // Node:
                styles) { // JointString: "prop" or "prop,prop,..."
    var rv = {}, ary = styles.split(UU.UTIL.SPLIT_TOKEN), v, i = 0,
        cs = UU.IE ? (elm.currentStyle || elm.style)
                   : fnStyle(elm, "");
    while ( (v = ary[i++]) ) {
      rv[v] = cs[v] || "";
    }
    return rv; // return Hash( { prop: value, ... } )
  },

  // uu.style.set - set style
  set: function(elm,    // Node:
                hash) { // Hash: { prop: "value", ... }
    var i, v, s = elm.style;
    for (i in hash) {
      v = hash[i];
      if (i in HOOK) {
        HOOK[i](elm, v);
      } else {
        s[i] = v;
      }
    }
  },

  // uu.style.getOpacity - get opacity value(from 0.0 to 1.0)
  getOpacity: (function() {
    if (!UU.IE) {
      return function(elm) { // Node:
        return parseFloat(fnStyle(elm, "").opacity);
        // return Number float(0.0 to 1.0)
      }
    }
    return function(elm) {
      return elm.filters.alpha ? elm.style.opacity : 1.0;
    }
  })(),

  // uu.style.setOpacity - set opacity value(from 0.0 to 1.0)
  setOpacity: function(elm,           // Node:
                       opacity,       // Number:
                       difference) {  // Boolean(default: false):
    var opa = parseFloat(opacity);

    if (difference) {
      opa = (UU.IE ? (elm.filters.alpha ? elm.style.opacity : 1.0)
                   : parseFloat(fnStyle(elm, "").opacity)) + opa;
    }
    if (opa > 0.999) {
      opa = 1;
    } else if (opa < 0.001) {
      opa = 0;
    }
    elm.style.opacity = opa;

    if (UU.IE) {
      if (!elm.filters.alpha) {
        elm.style.filter += " alpha(opacity=0)";
        elm.style.zoom = elm.style.zoom || "1"; // "hasLayout"
      }
      elm.filters.alpha.opacity = opa * 100;
    }
  },

  // uu.style.getRect - get element absolute position and rectangle
  getRect: function(elm) { // Node:
    var e, x = 0, y = 0, fix = 0, rect, viewport;

    if (elm.getBoundingClientRect) {
      // get relative position
      rect = elm.getBoundingClientRect();
      if (UU.IE) {
        fix = (elm.parentNode === uudoc.body) ? 2 : 0;
      }

      // to absolute position
      viewport = uu.viewport.getRect();
      x = rect.left + viewport.sx - fix;
      y = rect.top  + viewport.sy - fix;
    } else {
      // get absolute position
      e = elm;

      while (e) {
        x += e.offsetLeft || 0;
        y += e.offsetTop  || 0;
        e  = e.offsetParent;
      }
    }

    return {
      // element position(absolute)
      x: x,
      y: y,
      // element dimension(style.width + padding)
      w: elm.clientWidth,
      h: elm.clientHeight,
      // element dimension(style.width + padding + border)
      ow: elm.offsetWidth,
      oh: elm.offsetHeight
    };
    // return Hash( { x, y, w, h, ow, oh } )
  },

  // uu.style.setRect - set RectHash( { x: left, y: top, w: width, h: height } )
  setRect: function(elm,    // Node:
                    rect) { // RectHash: { x, y, w, h }
    var s = elm.style;

    if (UU.IE || UU.OPERA) {
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
  },

  // uu.style.show
  show: function(elm,       // Node:
                 display) { // String(default: "block"): display value
    elm.style.display = (display === void 0) ? "block" : display;
  },

  // uu.style.hide
  hide: function(elm) { // Node
    elm.style.display = "none";
  },

  // uu.style.toPixel - unit into px
  toPixel: function(elm,    // Node:
                    val,    // String: "20px", "20em", "20pt"
                    prop) { // String(default: ""): "width" or "height" (ie only)
    var match, s, r, sx, rx, unit;

    if (typeof val === "string") {
      if (UU.IE) {
        if (val === "auto") {
          switch ({ width: 1, height: 2 }[prop || ""] || 0) {
          case 1: return elm.clientWidth;  // 1: width
          case 2: return elm.clientHeight; // 2: height
          }
        }
        uu.customEvent && uu.customEvent.disable();

        // @see this trick: http://d.hatena.ne.jp/uupaa/20080628
        s = elm.style, r = elm.runtimeStyle, sx = s.left, rx = r.left;
        r.left = (elm.currentStyle || elm.style).left; // style="left: currentStyle.left !important"
        s.left = val, val = s.pixelLeft;               // stealthily set, and get pixel value(not redraw)
        s.left = sx, r.left = rx;                      // restore style

        uu.customEvent && uu.customEvent.enable();

      } else if ( (match = /(?:(px)|(pt)|(em))$/.exec(val) ) ) {
        unit = uu.style.unit();
        val = parseFloat(val);
        val *= match[2] ? unit.pt :
               match[3] ? unit.em : 1;
      }
    }
    return val; // return Number
  },

  // uu.style.unit - measure unit(pt, em)
  unit: function(really) { // Boolean(default: false): force re-validate
    if (really || !pixel.em) {
      uu.customEvent && uu.customEvent.disable();

      var e = uudoc.body.appendChild(uudoc.createElement("div"));
      e.style.cssText = "width:12pt;height:12em";
      pixel.pt = e.clientWidth  / 12;
      pixel.em = e.clientHeight / 12;
      uudoc.body.removeChild(e);

      uu.customEvent && uu.customEvent.enable();
    }
    return pixel; // return Hash ( { pt, em } )
  },

  // uu.style.offsetFromAncestor
  offsetFromAncestor: function(elm,        // Node:
                               ancestor) { // Node:
    var e, x = 0, y = 0;

    e = elm;
    while (e && e !== ancestor) {
      x += e.offsetLeft || 0;
      y += e.offsetTop  || 0;
      e  = e.offsetParent;
    }

    // offset from ancestor(relative)
    return { x: x, y: y };
    // return Hash( { x, y } )
  },

  // uu.style.getBackgroundImage - get background-image URL
  getBackgroundImage: function(elm) { // Node:
    var url, m;
    if (UU.IE) {
      url = (elm.style.backgroundImage || elm.currentStyle.backgroundImage);
    } else {
      url = uu.style(elm, "").backgroundImage;
    }
    if (url) {
      if ( (m = /^url\((.*)\)$/.exec(url)) ) {
        return m[1].replace(/^\s*[\"\']?|[\"\']?\s*$/g, ""); // trim quote
        // return String( "http://..." )
      }
    }
    return "none";
  },

  // uu.style.setBackgroundImage - set background-image URL
  setBackgroundImage: function(elm,   // Node:
                               url) { // String: "url(http://...)" or "http://..."
    elm.style.backgroundImage = !url.indexOf("url") ? url : "url(" + url + ")";
  },

  // uu.style.selectable - element selectable
  selectable: function(elm,        // Node:
                       prohibit) { // Boolean(default: true): false is unselectable
    var ng = (prohibit === void 0) ? 1 : prohibit, e;
    if (UU.IE || UU.OPERA) {
      e = elm;
      while (e) {
        e.unselectable = ng ? "on" : "";
        e.onselectstart = ng ? "return false" : "";
        e = e.parentNode;
      }
    } else if (UU.GECKO) {
      elm.style["-moz-user-select"] = ng ? "none" : "";
    } else if (UU.WEBKIT) {
      elm.style["-webkit-user-select"] = ng ? "none" : "";
    }
  },

  // uu.style.normalize - style property normalize
  normalize: function(prop) { // String: "css-prop"
    var rv = NORMALIZE[prop] || prop;
    // camelize
    return rv.replace(/-([a-z])/g, function(match, words) {
      return words.toUpperCase();
    });
    // return String( "cssProp" )
  }
});

// lazy
HOOK = { opacity: uu.style.setOpacity };

})();
