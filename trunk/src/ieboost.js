// === IEBoost =============================================
// depend: boost, ua, stylesheet, style, className, viewport, event, customEvent
uu.feat.ieboost = {};

uu.mix(UU.CONFIG, {
  IEBOOST: {}
}, 0, 0);

uu.mix(UU.CONFIG.IEBOOST, {
  ALPHA_PNG: true,
  MAX_WIDTH: false,
  OPACITY: true,
  POSITION_ABSOLUTE: true,
  POSITION_FIXED: true,
  BLANK_PNG: "b32.png"
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

// === IEBoost Alpha PNG ===================================
/** Alpha png image transparent for IE6
 *
 * @class
 */
(function() {
var ALPHA_LOADER = "DXImageTransform.Microsoft.AlphaImageLoader",
    ALPHA_FILTER = " progid:%s(src='%s',sizingMethod='image')",
    ALPHA_REPEAT = [
    '<div class="ieboostalphapngbg ieboostnoprintable" unselectable="on" onselectstart="return false" ',
//    'style="background-color:%s;z-index:%d;position:absolute;top:0;left:0;overflow:hidden;width:%dpx;height:%dpx;%s">',
      'style="%s;%s">',
      '<v:rect style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx;%s" coordsize="21600,21600" filled="t" stroked="f">',
        '<v:fill type="tile" src="%s" />',
      '</v:rect>',
    '</div>'].join(""),
    ALPHA_REPEAT_STYLE1 = 'background-color:%s;z-index:%d;position:absolute;top:0;left:0;overflow:hidden;width:%dpx;height:%dpx;',
    BLANK = UU.CONFIG.IEBOOST.BLANK_PNG,
    BLANK_REX = RegExp(BLANK + "$"),
    tagHash1 =  { input: 1, INPUT: 1, img: 2, IMG: 2 },
    tagHash2 =  { a: 1, input: 2, select: 2, textarea: 2,
                  A: 1, INPUT: 2, SELECT: 2, TEXTAREA: 2 },
    propHash =  { width: 1, height: 1,
                  "style.backgroundImage": 2,
                  "style.backgroundColor": 3,
                  "style.backgroundPositionX": 4,
                  "style.backgroundPositionY": 4,
                  "style.backgroundRepeat": 4 },
    posHash = { left: 0, center: 50, right: 100, top: 0, bottom: 100 },
    POS_X = /^(left|center|right)|(\d+%)|(\d+em)|(\d+pt)|(\d+px)$/,
    POS_Y = /^(top|center|bottom)|(\d+%)|(\d+em)|(\d+pt)|(\d+px)$/,
    onImgInputChange = null,
    onBackgroundChange = null,
    delayTimer = 0;

uu.Class.Singleton("IEBoostAlphaPNG", {
  construct: function() {
    var me = this, cev = UU.CONFIG.CUSTOM_EVENT,
        expr1 = 'behavior:expression(uu.ieboostAlphaPNG.initImgInput(this))';
        expr2 = 'behavior:expression(uu.ieboostAlphaPNG.initBackground(this))';

    uu.style.appendRule("ieboost", "img",    expr1);
    uu.style.appendRule("ieboost", "input",  expr1);
    uu.style.appendRule("ieboost", ".png",   expr2);
    uu.style.appendRule("ieboost", ".alpha", expr2);

    uu.customEvent.attach(function() {
        var nodeList = uu.className("alpha", uudoc.body).concat(
                          uu.className("png", uudoc.body)),
            v, i = 0;
        while ( (v = nodeList[i++]) ) {
          me.fixBackground(v, 1);
        }
    }, cev.RESIZE_BODY | cev.RESIZE_FONT);
  },

  initImgInput: function(elm) {
    elm.style.behavior = "none";
    onImgInputChange = uu.Class.IEBoostAlphaPNG.onImgInputChange;

    if (tagHash1[elm.tagName] === 1 && elm.type !== "image") { // input[type!=image]
      return;
    }
    uu.ieboostAlphaPNG.applyAlphaLoader(elm);
    elm.attachEvent("onpropertychange", onImgInputChange);
  },

  applyAlphaLoader: function(elm) {
    var width = elm.width, height = elm.height;

    elm.uuIEBoostAlphaPNGSrc = elm.src;

//  this.setAlphaLoader(elm, elm.src, "image");
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
      uu.ieboostAlphaPNG.applyAlphaLoader(elm);
      elm.attachEvent("onpropertychange", onImgInputChange); // re-attach
    } else {
      if (!/^data:/.test(src)) {
        // <img src="xxx.png">  -> xxx.gif or xxx.jpg
        // exclude "b32.png" or DataScheme
        elm.detachEvent("onpropertychange", onImgInputChange); // detach
        elm.uuIEBoostAlphaPNGSrc = src;
        // disable filter and make it original size

        if (elm.filters.length && ALPHA_LOADER in elm.filters) {
          elm.filters[ALPHA_LOADER].enabled = 0;
        }

        elm.style.width  = "auto";
        elm.style.height = "auto";
        elm.attachEvent("onpropertychange", onImgInputChange); // re-attach
      }
    }
  },

  initBackground: function(elm) {
    elm.style.behavior = "none";
    onBackgroundChange = uu.Class.IEBoostAlphaPNG.onBackgroundChange;

    var cs = elm.currentStyle, hash, img,
        w, h;
    if (elm === uudoc.body || elm === uudoc.documentElement) {
      w = elm.offsetWidth  - 20;
      h = elm.offsetHeight + 10;
    } else {
      w = elm.clientWidth  || elm.scrollWidth;
      h = elm.clientHeight || elm.scrollHeight;
    }

    elm.uuIEBoostAlphaPNGHash = {
      vml:    0,
      image:  uu.style.getBackgroundImage(elm),
      width:  w,
      height: h,
      color:  cs.backgroundColor,
      posx:   cs.backgroundPositionX,
      posy:   cs.backgroundPositionY,
      repeat: cs.backgroundRepeat
    };
    hash = elm.uuIEBoostAlphaPNGHash;

    if (!/png$/i.test(hash.image)) {
      elm.attachEvent("onpropertychange", onBackgroundChange);
      return;
    }

    img = new Image();
    img.onload = function() {
      hash.vml = 1;
      elm.style.backgroundImage = "url(" + UU.CONFIG.IMG_DIR + BLANK + ")";
      elm.style.backgroundColor = "transparent";
      uu.ieboostAlphaPNG.addBackground(elm, img, hash);
      elm.attachEvent("onpropertychange", onBackgroundChange);
    };
    img.src = hash.image;
  },

  fixBackground: function(elm, prop) {
    var img, nodeList, v, i = 0,
        cs = elm.currentStyle, add = 0, remove = 0, changeProp = 0,
        hash = elm.uuIEBoostAlphaPNGHash,
        curt = {
          image:  uu.style.getBackgroundImage(elm),
          width:  0,
          height: 0,
          color:  cs.backgroundColor,
          posx:   cs.backgroundPositionX,
          posy:   cs.backgroundPositionY,
          repeat: cs.backgroundRepeat
        },
        fmt1 = /png$/i.test(hash.image), // true: before is png
        fmt2 = /png$/i.test(curt.image); // true: after is png

    if (elm === uudoc.body || elm === uudoc.documentElement) {
      curt.width  = elm.offsetWidth  - 20;
      curt.height = elm.offsetHeight + 10;
    } else {
      curt.width  = elm.clientWidth  || elm.scrollWidth;
      curt.height = elm.clientHeight || elm.scrollHeight;
    }

/*
    if (curt.width  !== hash.width  ||
        curt.height !== hash.height ||
        curt.color  !== hash.color  ||
        curt.posx   !== hash.posx   ||
        curt.posy   !== hash.posy   ||
        curt.repeat !== hash.repeat) {
      ++changeProp;
    }
 */
    if (!prop ||
        curt.width  !== hash.width  ||
        curt.height !== hash.height ||
        curt.color  !== hash.color  ||
        curt.posx   !== hash.posx   ||
        curt.posy   !== hash.posy   ||
        curt.repeat !== hash.repeat) {
      ++changeProp;
    }

    if (curt.image !== hash.image) {
      if (fmt1 && fmt2) { // 1.png -> 2.png
        ++add, ++remove;
      } else if (!fmt1 && fmt2) { // *.gif/none -> *.png
        ++add;
      } else if (fmt1 && !fmt2) { // *.png -> *.gif/none
        ++remove;
      }
    } else if (hash.vml && changeProp) {
      ++add, ++remove;
    }

    switch (prop) {
    case 2: // 2: style.backgroundImage
      hash.image = curt.image;
      break;
    case 3: // 3: style.backgroundColor
      hash.color = curt.color;
      break;
    }

    if (remove) {
      nodeList = uu.className("ieboostalphapngbg", elm);
      while ( (v = nodeList[i++]) ) {
        v.parentNode.removeChild(v);
      }
      if (!add) {
        elm.detachEvent("onpropertychange", onBackgroundChange); // detach

        hash.vml = 0;
//      hash.image = hash.image;
        hash.width = curt.width;
        hash.height = curt.height;
//      hash.color = hash.color;
        hash.posx = curt.posx;
        hash.posy = curt.posy;
        hash.repeat = curt.repeat;

        elm.style.backgroundImage = "url(" + hash.image + ")"; // restore
        elm.style.backgroundColor = hash.color; // restore

        elm.attachEvent("onpropertychange", onBackgroundChange); // re-attach
        return;
      }
    }

    if (add) {

      img = new Image();
      img.onload = function() {
        elm.detachEvent("onpropertychange", onBackgroundChange); // detach

        hash.vml = 1;
//      hash.image = hash.image;
        hash.width = curt.width;
        hash.height = curt.height;
//      hash.color = hash.color;
        hash.posx = curt.posx;
        hash.posy = curt.posy;
        hash.repeat = curt.repeat;

        elm.style.backgroundImage = "url(" + UU.CONFIG.IMG_DIR + BLANK + ")";
        elm.style.backgroundColor = "transparent";
        uu.ieboostAlphaPNG.addBackground(elm, img, hash);

        elm.attachEvent("onpropertychange", onBackgroundChange); // re-attach
      };
      img.src = hash.image;
    }
  },

  addBackground: function(elm, img, hash) {
    var div, divstyle, cssText = elm.style.cssText,
        cs = elm.currentStyle,
        zIndex  = (parseInt(cs.zIndex) || 0) - 5000,
        posx    = hash.posx   || "0%", // left, center, right, %, length
        posy    = hash.posy   || "0%", // top, center, bottom, %, length
        repeat  = hash.repeat || "repeat", // repeat｜repeat-x｜repeat-y｜no-repeat
        x, y, match, offsetX = 0, offsetY = 0, unit = uu.style.unit(),
        imgWidth = img.width,
        imgHeight = img.height;

    if ( (match = POS_X.exec(posx)) ) {
      if (match[1]) {
        x = Math.round((hash.width - imgWidth) * (posHash[match[1]] / 100));
      } else if (match[2]) { // 100%
        x = Math.round((hash.width - imgWidth) * (parseInt(match[2]) / 100));
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
        y = Math.round((hash.height - imgHeight) * (posHash[match[1]] / 100));
      } else if (match[2]) {
        y = Math.round((hash.height - imgHeight) * (parseInt(match[2]) / 100));
      } else if (match[3]) { // 100em
        y = parseInt(match[3]) * unit.em;
      } else if (match[4]) { // 100pt
        y = parseInt(match[4]) * unit.pt;
      } else if (match[5]) { // 100px
        y = parseInt(match[5]);
      }
    }

    // box: position: relative
    cs = elm.currentStyle;
    if (!cs.position || cs.position === "static") {
      elm.style.position = "relative";
    }

    divstyle = ALPHA_REPEAT_STYLE1.sprintf(
      hash.color,   // div.style.background-color(String)
      zIndex,       // div.style.z-index(Number)
      hash.width,   // div.style.width(Number, unit: px)
      hash.height   // div.style.height(Number, unit: px)
    );

    switch (repeat) {
    case "no-repeat":
      div = ALPHA_REPEAT.sprintf(
        cssText,      // div.style.extras(String)
        divstyle,
        x,            // vml.rect.style.left(Number, unit: px)
        y,            // vml.rect.style.top(Number, unit: px)
        imgWidth,     // vml.rect.style.width(Number, unit: px)
        imgHeight,    // vml.rect.style.height(Number, unit: px)
        "",           // vml.rect.style.extras(String)
        hash.image    // vml.fill.src(URLString)
      );
      break;
    case "repeat-x":
      offsetX = x;
      while (offsetX > 0) {
        offsetX -= imgWidth;
      }
      div = ALPHA_REPEAT.sprintf(
        cssText,      // div.style.extras(String)
        divstyle,
        offsetX,      // vml.rect.style.left(Number, unit: px)
        y,            // vml.rect.style.top(Number, unit: px)
        hash.width - offsetX, // vml.rect.style.width(Number, unit: px)
        imgHeight,    // vml.rect.style.height(Number, unit: px)
        "",           // vml.rect.style.extras(String)
        hash.image    // vml.fill.src(URLString)
      );
      break;
    case "repeat-y":
      offsetY = y;
      while (offsetY > 0) {
        offsetY -= imgHeight;
      }

      div = ALPHA_REPEAT.sprintf(
        cssText,      // div.style.extras(String)
        divstyle,
        x,            // vml.rect.style.left(Number, unit: px)
        offsetY,      // vml.rect.style.top(Number, unit: px)
        imgWidth,     // vml.rect.style.width(Number, unit: px)
        hash.height - offsetY, // vml.rect.style.height(Number, unit: px)
        "",           // vml.rect.style.extras(String)
        hash.image    // vml.fill.src(URLString)
      );
      break;
    case "repeat":
      offsetX = x;
      while (offsetX > 0) {
        offsetX -= imgWidth;
      }

      offsetY = y;
      while (offsetY > 0) {
        offsetY -= imgHeight;
      }

      div = ALPHA_REPEAT.sprintf(
        cssText,      // div.style.extras(String)
        divstyle,
        offsetX,      // vml.rect.style.left(Number, unit: px)
        offsetY,      // vml.rect.style.top(Number, unit: px)
        hash.width  - offsetX, // vml.rect.style.width(Number, unit: px)
        hash.height - offsetY, // vml.rect.style.height(Number, unit: px)
        "",           // vml.rect.style.extras(String)
        hash.image    // vml.fill.src(URLString)
      );
    }
//    elm.insertAdjacentHTML("beforeEnd", rv);
    elm.insertAdjacentHTML("AfterBegin", div);
  }
});

uu.mix(uu.Class.IEBoostAlphaPNG, {
  onImgInputChange: function() {
    var evt = window.event,
        elm = evt.srcElement,
  //    prop = evt.propertyName, // "src"
        tag = tagHash1[elm.tagName];

    if (tag === 1 && elm.type !== "image") { // input[type!=image]
      return;
    }
    uu.ieboostAlphaPNG.fixImgInput(elm);
  },

  onBackgroundChange: function() {
    var evt = window.event,
        elm = evt.srcElement,
        prop = propHash[evt.propertyName] || 0, url;

    switch (prop) {
    case 2: // style.backgroundImage
      url = uu.style.getBackgroundImage(elm);
      if (BLANK_REX.test(url)) {
        return;
      }
    case 1: // width, height
    case 3: // style.backgroundColor
    case 4: // style.backgroundPositionX, ...
      uu.ieboostAlphaPNG.fixBackground(elm, prop);
      break;
    case 0:
      if (/^style/.test(evt.propertyName)) {
        clearTimeout(delayTimer);
        delayTimer = setTimeout(function() {
          uu.ieboostAlphaPNG.fixBackground(elm, 0);
        }, 40);
      }
    }
  }
});

})();

UU.IE && UU.CONFIG.IEBOOST.ALPHA_PNG && uu.ready(function() {
  uu.ieboostAlphaPNG = new uu.Class.IEBoostAlphaPNG();
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
    var me = this, cev = UU.CONFIG.CUSTOM_EVENT;

    uu.customEvent.attach(function() {
      me.markup();
      me.fix();
    }, cev.ADD_ELEMENT | cev.REMOVE_ELEMENT | cev.UPDATE_ELEMENT);

    uu.customEvent.attach(function() {
      me.fix();
    }, cev.RESIZE_VIEWPORT);

    uu.customEvent.attach(function() {
      me.fix();
    }, cev.RESIZE_FONT);
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
/** opacity:
 *
 * @class
 */
uu.Class.Singleton("IEBoostOpacity", {
  construct: function() {
    this.fix();

    // set event handler
    var me = this, cev = UU.CONFIG.CUSTOM_EVENT;

    uu.customEvent.attach(function() {
      me.fix();
    }, cev.ADD_ELEMENT | cev.UPDATE_ELEMENT);
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
    var me = this, cev = UU.CONFIG.CUSTOM_EVENT;

    uu.customEvent.attach(function(customEvent) {
      me.markup();
    }, cev.ADD_ELEMENT | cev.UPDATE_ELEMENT);

    uu.customEvent.attach(function(customEvent) { // resize, update view
      me.fix();
    }, cev.ADD_ELEMENT | cev.UPDATE_ELEMENT |
//     cev.RESIZE_VIEWPORT | cev.RESIZE_FONT);
       cev.RESIZE_BODY | cev.RESIZE_FONT);

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
