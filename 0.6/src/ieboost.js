// === IEBoost =============================================
// depend: boost, ua, stylesheet, style, className, viewport, event, customEvent
uu.feat.ieboost = {};

uu.mix(UU.CONFIG, {
  IEBOOST: {}
}, 0, 0);

uu.mix(UU.CONFIG.IEBOOST, {
  PNG: false,
  PNG_BG: true,
  MAX_WIDTH: false,
  OPACITY: false,
  POSITION_ABSOLUTE: false,
  POSITION_FIXED: false,
  BLANK_IMAGE: "b32.gif"
}, 0, 0);

// === IEBoost BackgroundImageCache care ===================
UU.IE && uu.ua.version === 6 && uu.ready(function() {
  try {
    uudoc.execCommand("BackgroundImageCache", false, true);
  } catch (err) { ; }
});

// === IEBoost VML care ===================================
UU.IE && uu.ua.version <= 8 && uu.ready(function() {
  if (!uudoc.namespaces["v"]) {
    uudoc.namespaces.add("v", "urn:schemas-microsoft-com:vml");
  }
  if (!uudoc.namespaces["o"]) {
    uudoc.namespaces.add("o", "urn:schemas-microsoft-com:office:office");
  }
  uudoc.createStyleSheet().cssText =
    "v\\:*{behavior:url(#default#VML)}"+
    "o\\:*{behavior:url(#default#VML)}";
});

// === IEBoost print care =================================
/*
UU.IE && uu.ua.version <= 8 && uu.ready(function() {
  window.attachEvent("onbeforeprint", function() {
    var nodeList = uu.className("ieboostnoprintable", uudoc.body),
        v, i = 0;
    while ( (v = nodeList[i++]) ) {
      v.style.visibility = "hidden";
    }
  });
  window.attachEvent("onafterprint", function() {
    var nodeList = uu.className("ieboostnoprintable", uudoc.body),
        v, i = 0;
    while ( (v = nodeList[i++]) ) {
      v.style.visibility = "visible";
    }
  });
});
 */

// === IEBoost Alpha PNG ===================================
// <img src="*.png"> or <input type="image" src="*.png"> care
(function() {
var ALPHA_LOADER = "DXImageTransform.Microsoft.AlphaImageLoader",
    ALPHA_FILTER = " progid:%s(src='%s',sizingMethod='image')",
    BLANK = UU.CONFIG.IEBOOST.BLANK_IMAGE,
    BLANK_REX = RegExp(BLANK + "$"),
    tagHash1 =  { input: 1, INPUT: 1, img: 2, IMG: 2 },
    tagHash2 =  { a: 1, input: 2, select: 2, textarea: 2,
                  A: 1, INPUT: 2, SELECT: 2, TEXTAREA: 2 },
    onImgInputChange = null;

uu.Class.Singleton("IEBoostPNG", {
  construct: function() {
    var expr = "behavior:expression(uu.ieboostPNG.initImgInput(this))";
    uu.style.appendRule("ieboost", "img",   expr);
    uu.style.appendRule("ieboost", "input", expr);
  },

  initImgInput: function(elm) {
    elm.style.behavior = "none";
    onImgInputChange = uu.Class.IEBoostPNG.onImgInputChange;

    if (tagHash1[elm.tagName] === 1 && elm.type !== "image") { // input[type!=image]
      return;
    }
    uu.ieboostPNG.applyAlphaLoader(elm);
    elm.attachEvent("onpropertychange", onImgInputChange);
  },

  applyAlphaLoader: function(elm) {
    var width = elm.width, height = elm.height;

    elm.uuIEBoostPNGSrc = elm.src;

    if (elm.filters.length && ALPHA_LOADER in elm.filters) {
      elm.filters[ALPHA_LOADER].enabled = 1;
      elm.filters[ALPHA_LOADER].src = elm.src;
    } else {
      elm.style.filter += ALPHA_FILTER.sprintf(ALPHA_LOADER, elm.src);
    }

    elm.src = UU.CONFIG.IMG_DIR + BLANK;

    // force hasLayout: true
    elm.style.zoom = 1;
    if (tagHash1[elm.tagName] === 2) { // 2: img
      elm.width  = width;
      elm.height = height;
    }
    this.fixAlphaLoaderBug(elm);
  },

  // [a, input, textarea, select ] clickable
  fixAlphaLoaderBug: function(elm) {
    var v;

    function clickable(elm) {
      switch (tagHash2[elm.tagName] || 0) {
      case 1:
        elm.style.cursor = "pointer";
        // break through
      case 2:
        if (!elm.style.position || elm.style.position === "static") {
          elm.style.position = "relative";
        }
      }
    }

    clickable(elm);
    for (v = elm.firstChild; v; v = v.nextSibling) {
      if (v.nodeType === 1) {
        clickable(v);
        v.firstChild && this.fixAlphaLoaderBug(v);
      }
    }
  },

  fixImgInput: function(elm) {
    var src = elm.src;

    if (/.png$/.test(src)) {
      if (BLANK_REX.test(src)) {
        return;
      }

      elm.detachEvent("onpropertychange", onImgInputChange); // detach
      uu.ieboostPNG.applyAlphaLoader(elm);
      elm.attachEvent("onpropertychange", onImgInputChange); // re-attach
    } else {
      if (!/^data:/.test(src)) {
        // <img src="xxx.png">  -> xxx.gif or xxx.jpg
        // exclude "b32.png" or DataScheme
        elm.detachEvent("onpropertychange", onImgInputChange); // detach
        elm.uuIEBoostPNGSrc = src;
        // disable filter and make it original size

        if (elm.filters.length && ALPHA_LOADER in elm.filters) {
          elm.filters[ALPHA_LOADER].enabled = 0;
        }

        elm.style.width  = "auto";
        elm.style.height = "auto";
        elm.attachEvent("onpropertychange", onImgInputChange); // re-attach
      }
    }
  }
});

uu.Class.IEBoostPNG.onImgInputChange = function() {
  var evt = window.event,
      elm = evt.srcElement,
      tag = tagHash1[elm.tagName];

  if (tag === 1 && elm.type !== "image") { // input[type!=image]
    return;
  }
  uu.ieboostPNG.fixImgInput(elm);
}

})();

UU.IE && UU.CONFIG.IEBOOST.PNG && uu.ready(function() {
  uu.ieboostPNG = new uu.Class.IEBoostPNG();
});

// === IEBoost Alpha PNG background ========================
// <div class="alpha" style="background-image: url(*.png)"> care
(function() {
var VML0 = '<div class="ieboostalphapngbg" unselectable="on" onselectstart="return false" ' +
              ' style="position:absolute;overflow:hidden;background-color:%s;z-index:%d;left:%dpx;top:%dpx;width:%dpx;height:%dpx"></div>',
    VML1 = '<v:rect style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx" coordsize="21600,21600" filled="t" stroked="f" print="f"></v:rect>',
    VML2 = '<v:fill type="tile" src="%s" />',
    BLANK = UU.CONFIG.IEBOOST.BLANK_IMAGE,
    BLANK_REX = RegExp(BLANK + "$"),
    ABS_OR_REL = /^(abs|rel)/,
    REPEAT =    { "no-repeat":  0x0,
                  "repeat-x":   0x1,
                  "repeat-y":   0x2,
                  "repeat":     0x3 },
    propHash =  { className: 1,
                  "style.backgroundImage": 2,
                  "style.backgroundColor": 3,
                  "style.backgroundPositionX": 4,
                  "style.backgroundPositionY": 4,
                  "style.backgroundRepeat": 4 },
    posHash = { left: 0, center: 50, right: 100, top: 0, bottom: 100 },
    POS_X = /^(left|center|right)|(\d+%)|(\d+em)|(\d+pt)|(\d+px)$/,
    POS_Y = /^(top|center|bottom)|(\d+%)|(\d+em)|(\d+pt)|(\d+px)$/;

uu.Class.Singleton("IEBoostPNGBG", {
  construct: function() {
    var me = this;
    this._onpropertychange = {}; // Hash( { Node.uniqueID: Number(0 or 1) } )

    uu.style.appendRule("ieboost", ".alpha",
        "top:expression(uu.ieboostPNGBG.repos(this));"+
        "width:expression(uu.ieboostPNGBG.exprDim(this));");

    uu.customEvent.attach(function(customEvent, elm) {
      if (uu.className.has(elm, "alpha")) {
        me.attach(elm);
        me.init(elm);
      }
    }, UU.CUSTOM_EVENT.ADD_ELEMENT);
  },

  attach: function(elm) {
    var uid = elm.uniqueID;
    if (!this._onpropertychange[uid]) {
      this._onpropertychange[uid] = 1;
      elm.attachEvent("onpropertychange", onBackgroundChange);
    }
  },

  detach: function(elm) {
    var uid = elm.uniqueID;
    if (this._onpropertychange[uid]) {
      this._onpropertychange[uid] = 0;
      elm.detachEvent("onpropertychange", onBackgroundChange);
    }
  },

  init: function(elm) {
    this.detach(elm);
    elm.uuIEBoostPNGBGPair = null;
    elm.uuIEBoostPNGBGOrg = {
      color:  elm.style.backgroundColor,
      image:  elm.style.backgroundImage,
      posx:   elm.style.backgroundPositionX,
      posy:   elm.style.backgroundPositionY,
      repeat: elm.style.backgroundRepeat,
      fixed:  elm.style.backgroundFixed
    };
    if (/png$/i.test(uu.style.getBackgroundImage(elm))) {
      this.draw(elm);
    }
    this.attach(elm);
  },

  exprDim: function(elm) {
    var div = uu.id(elm.uuIEBoostPNGBGPair), dim;
    if (div) {
      dim = this.getDim(elm);
      if (div.drawWidth  !== dim.w ||
          div.drawHeight !== dim.h) {
        this.draw(elm, 1);
      }
    }
  },

  getDim: function(elm) {
    if (elm === uudoc.body || elm === uudoc.documentElement) {
      return { w: elm.offsetWidth  - 20,
               h: elm.offsetHeight + 10 };
    }
    if (elm.clientWidth && elm.clientHeight) {
      return { w: elm.clientWidth,
               h: elm.clientHeight };
    }
    var rect = elm.getBoundingClientRect();
    return { w: rect.right - rect.left,
             h: rect.bottom - rect.top };
  },

  repos: function(elm) {
    var repos = 0, cs = elm.currentStyle, rect, div;

    if (ABS_OR_REL.test(cs.position)) {
      return;
    }
    // top, left
    if (elm.uuIEBoostPNGBGOrgOffsetTop  !== elm.offsetTop ||
        elm.uuIEBoostPNGBGOrgOffsetLeft !== elm.offsetLeft) { 
      this.detach(elm);
      elm.uuIEBoostPNGBGOrgOffsetTop  = elm.offsetTop;
      elm.uuIEBoostPNGBGOrgOffsetLeft = elm.offsetLeft;
      this.attach(elm);
      ++repos;
    }

    if (repos) {
      rect = uu.style.getRect(elm);
      div = uu.id(elm.uuIEBoostPNGBGPair);
      if (div) {
        div.style.pixelLeft = rect.x;
        div.style.pixelTop  = rect.y;
      }
    }
  },

  draw: function(elm,     // Node:
                 force) { // Boolean(default: false): force redraw
    var me = this, redraw = force ? 1 : 0, img,
        color = elm.currentStyle.backgroundColor,
        url = uu.style.getBackgroundImage(elm);

    // backgroundColor
    if (color !== "transparent") {
      this.detach(elm);
      elm.uuIEBoostPNGBGOrgBackgroundColor = color;
      elm.style.backgroundColor = "transparent";
      this.attach(elm);
      ++redraw;
    }

    // backgroundImage
    if (!BLANK_REX.test(url)) {
      this.detach(elm);
      elm.uuIEBoostPNGBGOrgBackgroundSrc = url;
      this.attach(elm);
      img = new Image();
      img.onload = function() {
        me.detach(elm);
        elm.uuIEBoostPNGBGOrgBackgroundImageWidth  = img.width;
        elm.uuIEBoostPNGBGOrgBackgroundImageHeight = img.height;
        elm.style.backgroundImage = "url(" + UU.CONFIG.IMG_DIR + BLANK + ")";
        me.attach(elm);
        me.drawVML(elm);
      };
      img.src = url;
      redraw = 0;
    }
    if (redraw) {
      this.drawVML(elm);
    }
  },

  drawVML: function(elm) {
    var cs = elm.currentStyle,
        dim  = this.getDim(elm),
        unit = uu.style.unit(),
        rect = uu.style.getRect(elm),
        posx = cs.backgroundPositionX || "0%", // left, center, right, %, length
        posy = cs.backgroundPositionY || "0%", // top, center, bottom, %, length
        repeat = REPEAT[cs.backgroundRepeat || "repeat"], // repeatbrepeat-xbrepeat-ybno-repeat
        iw = elm.uuIEBoostPNGBGOrgBackgroundImageWidth,
        ih = elm.uuIEBoostPNGBGOrgBackgroundImageHeight,
        match, div, vmlrect, vmlfill,
        x, y, ox = 0, oy = 0,       // offset x, y
        px, py, pw = iw, ph = ih;   // pixel rect

    rect.w = dim.w;
    rect.h = dim.h;

    if ( (match = POS_X.exec(posx)) ) {
      if (match[1]) {
        x = Math.round((rect.w - iw) * (posHash[match[1]] / 100));
      } else if (match[2]) { // 100%
        x = Math.round((rect.w - iw) * (parseInt(match[2]) / 100));
      } else if (match[3]) { // 100em
        x = parseInt(match[3]) * unit.em;
      } else if (match[4]) { // 100pt
        x = parseInt(match[4]) * unit.pt;
      } else if (match[5]) { // 100px
        x = parseInt(match[5]);
      }
    }
    if ( (match = POS_Y.exec(posy)) ) {
      if (match[1]) {
        y = Math.round((rect.h - ih) * (posHash[match[1]] / 100));
      } else if (match[2]) {
        y = Math.round((rect.h - ih) * (parseInt(match[2]) / 100));
      } else if (match[3]) { // 100em
        y = parseInt(match[3]) * unit.em;
      } else if (match[4]) { // 100pt
        y = parseInt(match[4]) * unit.pt;
      } else if (match[5]) { // 100px
        y = parseInt(match[5]);
      }
    }

/*
    if (elm.pair) {
      elm.removeChild(elm.pair);
    }
 */
    div = uu.id(elm.uuIEBoostPNGBGPair);
    if (div) {
      div.removeChild(div.firstChild);
      elm.removeChild(div);
      div = null;
    }
    if (ABS_OR_REL.test(cs.position)) {
      rect.x = 0;
      rect.y = 0;
    }

    div = uudoc.createElement(VML0.sprintf(
              elm.uuIEBoostPNGBGOrgBackgroundColor,
              (parseInt(cs.zIndex) || 0) - 1,
              rect.x, rect.y, rect.w, rect.h));
    elm.firstChild ? elm.insertBefore(div, elm.firstChild)
                   : elm.appendChild(div);
    div.drawWidth  = rect.w;
    div.drawHeight = rect.h;
    this.detach(elm);
    elm.uuIEBoostPNGBGPair = div.uniqueID;
    this.attach(elm);

    px = x - 1; // -1 is tolerance
    py = y;

    if (repeat & 0x1) { // "repeat-x" or "repeat"
      ox = x;
      while (ox > 0) {
        ox -= iw;
      }
      px = ox;
      pw = rect.w - ox;
    }
    if (repeat & 0x2) { // "repeat-y" or "repeat"
      oy = y;
      while (oy > 0) {
        oy -= ih;
      }
      py = oy;
      ph = rect.h - oy;
    }
    vmlrect = uudoc.createElement(VML1.sprintf(px, py, pw, ph));
    vmlfill = uudoc.createElement(VML2.sprintf(elm.uuIEBoostPNGBGOrgBackgroundSrc));
    div.appendChild(vmlrect);
    vmlrect.appendChild(vmlfill);
  },

  restore: function(elm) {
    div = uu.id(elm.uuIEBoostPNGBGPair);
    if (div) {
      this.detach(elm);
      div.removeChild(div.firstChild);
      elm.removeChild(div);
      div = null;
      elm.uuIEBoostPNGBGPair = null;
      elm.style.backgroundColor     = elm.uuIEBoostPNGBGOrg.color;
      elm.style.backgroundImage     = elm.uuIEBoostPNGBGOrg.image;
      elm.style.backgroundPositionX = elm.uuIEBoostPNGBGOrg.posx;
      elm.style.backgroundPositionY = elm.uuIEBoostPNGBGOrg.posy;
      elm.style.backgroundRepeat    = elm.uuIEBoostPNGBGOrg.repeat;
      elm.style.backgroundFixed     = elm.uuIEBoostPNGBGOrg.fixed;
      this.attach(elm);
    }
  }
});

uu.Class.IEBoostPNGBG.onBackgroundChange = function() {
  var evt = window.event,
      elm = evt.srcElement,
      prop = propHash[evt.propertyName], url;

  switch (prop || 0) {
  case 1: // className
    if (elm.uuIEBoostPNGBGPair) {
      if (!uu.className.has(elm, "alpha")) { // remove "alpha"
        uu.ieboostPNGBG.restore(elm);
      }
    } else {
      if (uu.className.has(elm, "alpha")) { // add "alpha"
        uu.ieboostPNGBG.init(elm);
      }
    }
    break;
  case 2: // style.backgroundImage
    url = uu.style.getBackgroundImage(elm);
    if (!BLANK_REX.test(url)) {
      uu.ieboostPNGBG.draw(elm, true);
    }
    break;
  case 3: // style.backgroundColor
    if (elm.style.backgroundColor !== "transparent") {
      uu.ieboostPNGBG.draw(elm, true);
    }
    break;
  case 4: // style.backgroundPositionX
          // style.backgroundPositionY
          // style.backgroundRepeat
    uu.ieboostPNGBG.draw(elm, true);
    break;
  default:
    if (/^uu|^style\.(border|padding|margin)/.test(evt.propertyName)) {
      ; // nop, flyweight
    } else {
      uu.ieboostPNGBG.draw(elm);
    }
  }
};

UU.IE && UU.CONFIG.IEBOOST.PNG_BG && uu.ready(function() {
  uu.ieboostPNGBG = new uu.Class.IEBoostPNGBG();
  onBackgroundChange = uu.Class.IEBoostPNGBG.onBackgroundChange;
});
})();

// === IEBoost MaxWidth ====================================
// CSS2.1 max-width, min-width, max-height, min-height for IE6
uu.Class.Singleton("MaxWidth", {
  construct: function() {
    this._targetElement = [];
    this._lock = 0;
    this.markup();
    this.fix();

    // set event handler
    var me = this;

    uu.customEvent.attach(function() {
      me.markup();
      me.fix();
    }, UU.CUSTOM_EVENT.ADD_ELEMENT | UU.CUSTOM_EVENT.REMOVE_ELEMENT |
       UU.CUSTOM_EVENT.UPDATE_ELEMENT);

    uu.customEvent.attach(function() {
      me.fix();
    }, UU.CUSTOM_EVENT.RESIZE_VIEWPORT);

    uu.customEvent.attach(function() {
      me.fix();
    }, UU.CUSTOM_EVENT.RESIZE_FONT);
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

      uu.customEvent.disable();

      for (; i < iz; ++i) {
        me.recalc(ary[i], ary[i].uuMaxWidth);
      }

      uu.customEvent.enable();

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

// === IEBoost Opacity =====================================
uu.Class.Singleton("IEBoostOpacity", {
  construct: function() {
    this.fix();

    // set event handler
    var me = this;

    uu.customEvent.attach(function() {
      me.fix();
    }, UU.CUSTOM_EVENT.ADD_ELEMENT | UU.CUSTOM_EVENT.UPDATE_ELEMENT);
  },

  fix: function() {
    var nodeList = uu.tag("*", uudoc.body), v, i = 0, opacity;

    uu.customEvent.disable();

    while ( (v = nodeList[i++]) ) {
      opacity = v.style.opacity || v.currentStyle.opacity;
      if (opacity) {
        opacity = parseFloat(opacity) || 1.0;
        if (opacity >= 0.0 && opacity <= 1.0) {
          uu.style.setOpacity(v, opacity);
        }
      }
    }

    uu.customEvent.enable();
  }
});

UU.IE && UU.CONFIG.IEBOOST.OPACITY && uu.ready(function() {
  new uu.Class.IEBoostOpacity();
});

// === IEBoost fix position:absolute bug ===================
// position: absolute bug(cannot select text) fix for IE6 Standard mode
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
// position: fixed for IE6
uu.Class.Singleton("IEBoostPositionFixed", {
  construct: function() {
    this._targetElement = [];
    this._smoothScrollFixed = 0;

    if (uu.ua.quirks) {
      uu.style.appendRule(
          "ieboost",
          ".uuPositionFixed",
          "behavior:expression(" +
            "this.style.pixelTop=document.body.scrollTop+this.uuPositionFixed.pxVValue," +
            "this.style.pixelLeft=document.body.scrollLeft+this.uuPositionFixed.pxHValue)"
      );
    } else {
      uu.style.appendRule(
          "ieboost",
          ".uuPositionFixed",
          "behavior:expression(" +
            "this.style.pixelTop=document.documentElement.scrollTop+this.uuPositionFixed.pxVValue," +
            "this.style.pixelLeft=document.documentElement.scrollLeft+this.uuPositionFixed.pxHValue)"
      );
    }

    this.markup();
    this.fix();

    // set event handler
    var me = this;

    uu.customEvent.attach(function(customEvent) {
      me.markup();
    }, UU.CUSTOM_EVENT.ADD_ELEMENT | UU.CUSTOM_EVENT.UPDATE_ELEMENT);

    uu.customEvent.attach(function(customEvent) { // resize, update view
      me.fix();
    }, UU.CUSTOM_EVENT.ADD_ELEMENT | UU.CUSTOM_EVENT.UPDATE_ELEMENT |
//     UU.CUSTOM_EVENT.RESIZE_VIEWPORT | UU.CUSTOM_EVENT.RESIZE_FONT);
       UU.CUSTOM_EVENT.RESIZE_BODY | UU.CUSTOM_EVENT.RESIZE_FONT);

//    uu.event.attach(window, "resize", this);
  },

/*
  handleEvent: function(evt) {
    if (evt.type === "resize") { // window resize event
      this.fix();
    }
  },
 */
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
        v.style.zIndex = 5000; // z-index effect
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
