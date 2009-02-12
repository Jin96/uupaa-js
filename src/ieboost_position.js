// === IEBoost Position ====================================
// depend: ua, stylesheet, style, viewport, customEvent
uu.feat.ieboost_position = {};

// === IEBoost fix position:absolute bug ===================
/** position: absolute bug(cannot select text) fix for IE6 Standard mode
 *
 * @class
 */
uu.Class("PositionAbsolute", {
  construct: function() {
    this._fixed = 0;
    this.fix();
  },

  fix: function() {
    if (this._fixed) { return; }

    var nodeList = uu.tag("*"), v, i = 0, cs;

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

UU.IE && uu.ua.version === 6 && !uu.ua.quirks && uu.ready(function() {
  uu.ieboostPositionAbsolute = new uu.Class.PositionAbsolute();
});

// === IEBoost fix position: fixed bug =====================
/** position: fixed for IE6
 *
 * @class
 */
uu.Class("PositionFixed", {
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
    var nodeList = uu.tag("*"), v, i = 0, fixed = 0,
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

UU.IE && uu.ua.version === 6 && uu.ready(function() {
  uu.ieboostPositionFixed = new uu.Class.PositionFixed();
  try {
    uudoc.execCommand("BackgroundImageCache", false, true);
  } catch (err) { ; }
});
