// === IEBoost =============================================
// depend: ua, stylesheet, style, viewport, customEvent
uu.feat.ieboost = {};

uu.mix(UU.CONFIG, {
  IEBOOST: {}
}, 0, 0);

uu.mix(UU.CONFIG.IEBOOST, {
  MAX_WIDTH: true,
  ALPHA_PNG: true,
  OPACITY: true,
  POSITION_ABSOLUTE: true,
  POSITION_FIXED: true,
  BLANK_PNG: "b32.png" // use alpha png
}, 0, 0);

// === IEBoost BackgroundImageCache care ===================
UU.IE && uu.ua.version === 6 && uu.ready(function() {
  try {
    uudoc.execCommand("BackgroundImageCache", false, true);
  } catch (err) { ; }
});

// === IEBoost MaxWidth ====================================
/** CSS2.1 max-width, min-width, max-height, min-height for IE6
 *
 * @class
 */
uu.Class.Singleton("MaxWidth", {
  construct: function() {
    this._targetElement = [];
    this._lock = 0;
    this.markup();
    this.fix();

    // set event handler
    var me = this;
    uu.customEventView.attach(function() { // add element + resize, update view
      me.markup();
      me.fix();
    }, 3);
    uu.customEventFontResize.attach(function() { // font-resize
      uu.style.unit(1); // re-validate em and pt
      me.markup();
      me.fix();
    });
    uu.event.attach(window, "resize", this);
  },

  handleEvent: function(evt) {
    if (evt.type === "resize") { // window resize event
      this.markup();
      this.fix();
    }
  },

  markup: function() {
    var rv = [], nodeList = uu.tag("*", uudoc.body), v, i = 0, cs,
        maxWidth, minWidth, maxHeight, minHeight;

    while ( (v = nodeList[i++]) ) {
      if (!uu.isBlockTag(v.tagName)) {
        continue; // exclude(max-width: block element only)
      }

      cs = v.currentStyle;
      maxWidth  = cs["max-width"]  || ""; // length | % | none | inherit
      minWidth  = cs["min-width"]  || ""; // length | % | inherit
      maxHeight = cs["max-height"] || ""; // length | % | none | inherit
      minHeight = cs["minHeight"];        // length | % | inherit (ie6 default "auto")

      /^(inherit|none|auto)$/.test(maxWidth)  && (maxWidth  = "");
      /^(inherit|none|auto)$/.test(minWidth)  && (minWidth  = "");
      /^(inherit|none|auto)$/.test(maxHeight) && (maxHeight = "");
      /^(inherit|none|auto)$/.test(minHeight) && (minHeight = "");

      if (maxWidth  === "" &&
          minWidth  === "" &&
          maxHeight === "" &&
          minHeight === "") {
        if ("uuMaxWidth" in v) {
          delete v["uuMaxWidth"];
        }
        continue; // exclude
      }

      uu.mix(v, {
        uuMaxWidth: {}
      }, 0, 0);
      uu.mix(v.uuMaxWidth, {
        maxWidth:  maxWidth,
        minWidth:  minWidth,
        maxHeight: maxHeight,
        minHeight: minHeight
      });
      uu.mix(v.uuMaxWidth, {
        orgWidth:  v.currentStyle.width,
        orgHeight: v.currentStyle.height
      }, 0, 0);
      rv.push(v);
    }
    this._targetElement = rv;
  },

  // some events are brought together, and it will process it later
  fix: function() {
    if (!this._targetElement.length || this._lock) { // locked
      return;
    }
    var me = this;

    function FIX() {
      me._lock = 1; // lock

      var ary = me._targetElement, i = 0, iz = ary.length;
      for (; i < iz; ++i) {
        me.recalc(ary[i], ary[i].uuMaxWidth);
      }
      // lazy unlock(crucial)
      setTimeout(function() {
        me._lock = 0; // unlock
      }, 40); // lazy 40ms
    }
    setTimeout(FIX, 40); // lazy 40ms
  },

  recalc: function(elm, hash) {
    var calcMaxWidth = 0,
        calcMinWidth = 0,
        calcMaxHeight = 0,
        calcMinHeight = 0,
        unit = uu.style.unit(),
        rect = elm.getBoundingClientRect(),
        match, val, runVal, width, height;
        currentRect = { width: rect.right - rect.left,
                        height: rect.bottom - rect.top };

    if (hash.maxWidth !== "") {
      if ( (match = /(?:(px)|(pt)|(em)|(%))$/.exec(hash.maxWidth)) ) {
        val = parseFloat(hash.maxWidth);
        if (match[4]) {
          rect = elm.parentNode.getBoundingClientRect();
          calcMaxWidth = (rect.right - rect.left) * val / 100;
        } else {
          calcMaxWidth = val * (match[2] ? unit.pt : match[3] ? unit.em : 1);
        }
      }
    }
    if (hash.minWidth !== "") {
      if ( (match = /(?:(px)|(pt)|(em)|(%))$/.exec(hash.minWidth)) ) {
        val = parseFloat(hash.minWidth);
        if (match[4]) {
          rect = elm.parentNode.getBoundingClientRect();
          calcMinWidth = (rect.right - rect.left) * val / 100;
        } else {
          calcMinWidth = val * (match[2] ? unit.pt : match[3] ? unit.em : 1);
        }
      }
    }

    if (hash.maxHeight !== "") {
      if ( (match = /(?:(px)|(pt)|(em)|(%))$/.exec(hash.maxHeight)) ) {
        val = parseFloat(hash.maxHeight);
        if (match[4]) {
          rect = elm.parentNode.getBoundingClientRect();
          calcMaxHeight = (rect.bottom - rect.top) * val / 100;
        } else {
          calcMaxHeight = val * (match[2] ? unit.pt : match[3] ? unit.em : 1);
        }
      }
    }
    if (hash.minHeight !== "") {
      if ( (match = /(?:(px)|(pt)|(em)|(%))$/.exec(hash.minHeight)) ) {
        val = parseFloat(hash.minHeight);
        if (match[4]) {
          rect = elm.parentNode.getBoundingClientRect();
          calcMinHeight = (rect.bottom - rect.top) * val / 100;
        } else {
          calcMinHeight = val * (match[2] ? unit.pt : match[3] ? unit.em : 1);
        }
      }
    }

    // recalc
    if (calcMaxWidth || calcMinWidth) {

      // recalc max-width
      if (calcMinWidth > calcMaxWidth) {
        calcMaxWidth = calcMinWidth;
      }

      // recalc width
      // width: auto !important
      runVal = elm.runtimeStyle.width;  // keep runtimeStyle.width
//    styleVal = elm.style.width; // x
//    elm.runtimeStyle.width = elm.currentStyle.width; // x
      elm.runtimeStyle.width = hash.orgWidth;
      elm.style.width = "auto";
      rect = elm.getBoundingClientRect(); // re-validate
      width = rect.right - rect.left;

//    elm.style.width = styleVal; // x
      elm.style.width = hash.orgWidth; // o
      elm.runtimeStyle.width = runVal; // restore style

      // recalc limits
      if (width > calcMaxWidth) {
        width = calcMaxWidth;
        elm.style.pixelWidth = width;
      } else if (width < calcMinWidth) {
        width = calcMinWidth;
        elm.style.pixelWidth = width;
      } else {
        elm.style.pixelWidth = currentRect.width - 2;
      }
    }

    if (calcMaxHeight || calcMinHeight) {

      // recalc max-height
      if (calcMinHeight > calcMaxHeight) {
        calcMaxHeight = calcMinHeight;
      }

      // recalc height
      // height: auto !important
      runVal = elm.runtimeStyle.height;  // keep runtimeStyle.height
      elm.runtimeStyle.height = hash.orgHeight;
      elm.style.height = "auto";
      rect = elm.getBoundingClientRect(); // re-validate
      height = rect.bottom - rect.top;

      elm.style.height = hash.orgHeight; // o
      elm.runtimeStyle.height = runVal; // restore style

      // recalc limits
      if (height > calcMaxHeight) {
        height = calcMaxHeight;
        elm.style.pixelHeight = height;
      } else if (height < calcMinHeight) {
        height = calcMinHeight;
        elm.style.pixelHeight = height;
      } else {
        elm.style.pixelHeight = currentRect.height - 2;
      }
    }
  }
});

UU.IE && uu.ua.version === 6 && UU.CONFIG.IEBOOST.MAX_WIDTH &&
uu.ready(function() {
  new uu.Class.MaxWidth();
});

// === IEBoost Alpha PNG ===================================
/** Alpha png image transparent for IE6
 *
 * @class
 */
uu.Class.Singleton("IEBoostAlphaPNG", {
  construct: function() {
    var expr = "behavior: expression(uu.Class.IEBoostAlphaPNG._expression(this))";
    uu.style.appendRule("ieboost", "img",    expr);
    uu.style.appendRule("ieboost", ".png",   expr);
    uu.style.appendRule("ieboost", "input",  expr);
    uu.style.appendRule("ieboost", ".alpha", expr);
  }
});
uu.mix(uu.Class.IEBoostAlphaPNG, {
  _expression: function(elm) {
    var spacer = UU.CONFIG.IEBOOST.BLANK_PNG,
        alphaLoader = "DXImageTransform.Microsoft.AlphaImageLoader",
        reg = RegExp(spacer + "$"),
        url, w, h, run = 0,
        src = elm.src || "", inputImage = 0,
        tagName = elm.tagName.toLowerCase(),
        me = uu.Class.IEBoostAlphaPNG;

    function setAlphaLoader(elm, src, method) {
      if (elm.filters.length && alphaLoader in elm.filters) {
        elm.filters[alphaLoader].enabled = 1;
        elm.filters[alphaLoader].src = src;
      } else {
        elm.style.filter +=
            [" progid:", alphaLoader,
             "(src='", src, "', sizingMethod='", method, "')"].join("");
      }
    }

    function unsetAlphaLoader(elm) {
      if (elm.filters.length && alphaLoader in elm.filters) {
        elm.filters[alphaLoader].enabled = 0;
      }
    }

    switch (tagName) {
    case "input":
      if (elm.type !== "image") {
        break;
      }
      inputImage = 1;
      // break;
    case "img":
      if (/.png$/i.test(src)) {
        if (reg.test(src)) {
          break; // nop
        }
        elm.uuAlphaPNGSrc = src;

        w = elm.width;
        h = elm.height;

        setAlphaLoader(elm, src, "image");

        elm.src = UU.CONFIG.IMG_DIR + spacer;

        // hasLayout = true
        if (inputImage) {
          elm.style.zoom = 1;
        } else {
          elm.width = w;
          elm.height = h;
        }
        ++run;
      } else {
        if (!reg.test(src) && !(/^data:/.test(src))) {
          // <img src="xxx.png">  -> xxx.gif or xxx.jpg
          // exclude "b32.png" or  DataScheme
          elm.uuAlphaPNGSrc = src;

          // disable filter and make it original size
          unsetAlphaLoader(elm);
          elm.style.width = "auto";
          elm.style.height = "auto";
        }
      }
      break;
    default:
      url = uu.style.getBackgroundImage(elm);
      if (url === "none") {
        unsetAlphaLoader(elm);
        break;
      }
      if (reg.test(url)) {
        break; // nop
      }
      if (/.png$/i.test(url)) {
        setAlphaLoader(elm, url, "crop");
        elm.style.backgroundImage = "url(" + UU.CONFIG.IMG_DIR + spacer + ")";

        elm.style.zoom = 1; // hasLayout = true
        ++run;
      } else { // xxx.png -> xxx.gif or xxx.jpg
        unsetAlphaLoader(elm);
      }
    }

    if (run) {
      me._bugfix(elm);
    }
    // attach spy and purge behavior
    if (!("uuIEBoostAlphaPNGSpy" in elm)) {
      elm.attachEvent("onpropertychange", me._onpropertychange);
      elm.uuIEBoostAlphaPNGSpy = 1;
    }
    elm.style.behavior = "none";
  },

  // spy
  _onpropertychange: function() {
    var evt = window.event;
    switch (evt.propertyName) {
    case "style.backgroundImage":
    case "src":  // <img src="1.png"> -> <input type="2.png">
      uu.Class.IEBoostAlphaPNG._expression(evt.srcElement);
      break;
    }
  },

  // [a, input, textarea, select ] clickable
  _bugfix: function(elm) {
    var i = 0, sz = elm.childNodes.length, c;

    function FIX(e) {
      switch (e.tagName.toLowerCase()) {
      case "a":        e.style.cursor = "pointer"; // break through;
      case "input":
      case "select":
      case "textarea": !e.style.position && (e.style.position = "relative");
      }
    }

    FIX(elm);
    for (; i < sz; ++i) {
      c = elm.childNodes[i];
      if (c.nodeType === 1) {
        FIX(c);
        c.firstChild && uu.Class.IEBoostAlphaPNG._bugfix(c);
      }
    }
  }
});

UU.IE && UU.CONFIG.IEBOOST.ALPHA_PNG && uu.ready(function() {
  new uu.Class.IEBoostAlphaPNG();
});

// === IEBoost Opacity =====================================
/** opacity:
 *
 * @class
 */
uu.Class.Singleton("IEBoostOpacity", {
  construct: function() {
    this.fix();

    // set event handler
    var me = this;
    uu.customEventView.attach(function() { // add element
      me.fix();
    }, 1);
  },

  fix: function() {
    var nodeList = uu.tag("*", uudoc.body), v, i = 0, opacity;
    while ( (v = nodeList[i++]) ) {
      opacity = v.style.opacity || v.currentStyle.opacity;
      if (opacity) {
        opacity = parseFloat(opacity) || 1.0;
        if (opacity >= 0.0 && opacity <= 1.0) {
          uu.style.setOpacity(v, opacity);
        }
      }
    }
  }
});

UU.IE && UU.CONFIG.IEBOOST.OPACITY && uu.ready(function() {
  new uu.Class.IEBoostOpacity();
});

// === IEBoost fix position:absolute bug ===================
/** position: absolute bug(cannot select text) fix for IE6 Standard mode
 *
 * @class
 */
uu.Class.Singleton("IEBoostPositionAbsolute", {
  construct: function() {
    this._fixed = 0;
    this.fix();
  },

  fix: function() {
    if (this._fixed) { return; }

    var nodeList = uu.tag("*", uudoc.body), v, i = 0, cs;

    while ( (v = nodeList[i++]) ) {
      cs = (v.currentStyle || v.style);
      if (cs.position === "absolute") { // found position: absolute
        uudoc.body.style.height = "100%";
        uudoc.getElementsByTagName("head")[0].style.height = "100%";
        ++this._fixed;
        break;
      }
    }
  }
});

UU.IE && uu.ua.version === 6 && !uu.ua.quirks &&
UU.CONFIG.IEBOOST.POSITION_ABSOLUTE && uu.ready(function() {
  new uu.Class.IEBoostPositionAbsolute();
});

// === IEBoost fix position: fixed bug =====================
/** position: fixed for IE6
 *
 * @class
 */
uu.Class.Singleton("IEBoostPositionFixed", {
  construct: function() {
    this._targetElement = [];
    this._smoothScrollFixed = 0;

    if (uu.ua.quirks) {
      uu.style.appendRule(
          "ieboost",
          ".uuPositionFixed",
          "behavior: expression(" +
            "this.style.pixelTop=document.body.scrollTop+this.uuPositionFixed.pxVValue," +
            "this.style.pixelLeft=document.body.scrollLeft+this.uuPositionFixed.pxHValue)"
      );
    } else {
      uu.style.appendRule(
          "ieboost",
          ".uuPositionFixed",
          "behavior: expression(" +
            "this.style.pixelTop=document.documentElement.scrollTop+this.uuPositionFixed.pxVValue," +
            "this.style.pixelLeft=document.documentElement.scrollLeft+this.uuPositionFixed.pxHValue)"
      );
    }

    this.markup();
    this.fix();

    // set event handler
    var me = this;
    uu.customEventView.attach(function() { // add element
      me.markup();
    }, 1);
    uu.customEventView.attach(function() { // resize, update view
      me.fix();
    }, 2);
    uu.customEventFontResize.attach(function() { // font-resize
      uu.style.unit(1); // re-validate em and pt
      me.fix();
    });
    uu.event.attach(window, "resize", this);
  },

  handleEvent: function(evt) {
    if (evt.type === "resize") { // window resize event
      this.fix();
    }
  },

  _fixSmoothScroll: function() {
    if (this._smoothScrollFixed) { return; }

    // html { background-attachment: fixed }
    html = uu.tag("html")[0];
    if (uu.style.getBackgroundImage(html) === "none") {
      uu.style.setBackgroundImage(html, "none");
    }
    html.style.backgroundAttachment = "fixed";

    // body { background-attachment: fixed }
    if (uu.style.getBackgroundImage(uudoc.body) === "none") {
      uu.style.setBackgroundImage(uudoc.body, "none");
    }
    uudoc.body.style.backgroundAttachment = "fixed";

    ++this._smoothScrollFixed;
  },

  markup: function() {
    var nodeList = uu.tag("*", uudoc.body), v, i = 0, fixed = 0,
        viewport = uu.viewport.getRect(),
        rect, cs,
        mode = 0, // 0x1 = top, 0x2 = bottom, 0x4 = left, 0x8 = right
        cssVValue, // V: vertical
        cssHValue, // H: horizontal
        pxVValue, // V: vertical
        pxHValue; // H: horizontal

    while ( (v = nodeList[i++]) ) {
      if ("uuPositionFixed" in v) {
        continue; // already fixed
      }

      cs = v.currentStyle || v.style;
      if (cs.position === "fixed") {
        ++fixed;

        this._targetElement.push(v); // mark

        rect = uu.style.getRect(v);
        mode = 0;

        if (cs.top !== "auto") { // top:
          mode |= 0x1;
          cssVValue = cs.top;
          pxVValue = uu.style.toPixel(v, cs.paddingTop)
                   + uu.style.toPixel(v, cs.top);
        } else { // bottom:
          mode |= 0x2;
          cssVValue = cs.bottom;
          pxVValue = viewport.h - rect.oh - uu.style.toPixel(v, cs.bottom)
        }

        if (cs.left !== "auto") { // left:
          mode |= 0x4;
          cssHValue = cs.left;
          pxHValue = uu.style.toPixel(v, cs.paddingLeft)
                   + uu.style.toPixel(v, cs.left);
        } else { // right:
          mode |= 0x8;
          cssHValue = cs.right;
          pxHValue = viewport.w - rect.ow - uu.style.toPixel(v, cs.right)
        }

        // add property
        v.uuPositionFixed = {
          mode: mode,
          cssVValue: cssVValue,
          cssHValue: cssHValue,
          pxVValue: pxVValue,
          pxHValue: pxHValue
        };
        uu.className.toggle(v, "uuPositionFixed");
        v.style.position = "absolute"; // position:fixed -> position:absolute
      }
    }
    if (fixed) {
      this._fixSmoothScroll();
    }
  },

  fix: function() {
    var ary = [], ai = -1, v, i = 0, iz = this._targetElement.length,
        viewport = uu.viewport.getRect(), unit = uu.style.unit(),
        cs, prop, mode, rect, w, rex = /em$/;

    for (; i < iz; ++i) {
      v = this._targetElement[i];
      if (!v || !("uuPositionFixed" in v)) {
        continue; // skip
      }

      cs = v.currentStyle;
      prop = v.uuPositionFixed;
      mode = prop.mode;
      rect = uu.style.getRect(v);

      if (mode & 0x1) { // 0x1: top
        if (rex.test(prop.cssVValue)) {
          prop.pxVValue = uu.style.toPixel(v, cs.paddingTop)
                        + parseFloat(prop.cssVValue) * unit.em;
        }
      } else { // 0x2: bottom
        w = rex.test(prop.cssVValue) ? (parseFloat(prop.cssVValue) * unit.em)
                                     : uu.style.toPixel(v, prop.cssVValue);
        prop.pxVValue = viewport.h - rect.oh - w;
      }

      if (mode & 0x4) { // 0x4: left
        if (rex.test(prop.cssHValue)) {
          prop.pxHValue = uu.style.toPixel(v, cs.paddingLeft)
                        + parseFloat(prop.cssHValue) * unit.em;
        }
      } else { // 0x8: right
        w = rex.test(prop.cssHValue) ? (parseFloat(prop.cssHValue) * unit.em)
                                     : uu.style.toPixel(v, prop.cssHValue);
        prop.pxHValue = viewport.w - rect.ow - w;
      }
      ary[++ai] = v;
    }
    if (ary.length) {
      // http://www.microsoft.com/japan/msdn/columns/dude/dude061198.aspx
      uudoc.recalc(1); // update
    }
    this._targetElement = ary;
  }
});

UU.IE && uu.ua.version === 6 &&
UU.CONFIG.IEBOOST.POSITION_FIXED && uu.ready(function() {
  new uu.Class.IEBoostPositionFixed();
});
