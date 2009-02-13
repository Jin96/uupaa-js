// === IEBoost =============================================
// depend: ua, stylesheet, style, viewport, customEvent
uu.feat.ieboost = {};

/*
2009-02-14
  min-width だけが指定されている場合は、"auto" の値で一度幅を求める必要がありそう


 */



// === IEBoost MaxMin ======================================
/** CSS2.1 max-width, min-width, max-height, min-height for IE6
 *
 * max-width, min-width, max-height, min-heightを持つブロック要素に
 * マーキング(uuMaxMin)を行い幅と高さを制御する
 *
 * ブロック要素(未処理)
 *    -> node.uuMaxMin プロパティは存在しない
 *
 * ブロック要素(処理対象)
 *    -> node.uuMaxMin = {
 *          min-width: min-width指定値,
 *          max-width: max-width指定値,
 *          min-height: min-width指定値,
 *          max-height: max-width指定値,
 *          width: マークアップ直前の状態で計算された幅(%またはpx)
 *          height: マークアップ直前の状態で計算された高さ(%またはpx)
 *          w0: min-width指定値をルールに基づき事前に計算した値(-1なら,min-widthについては処理対象外)
 *          w2: max-width指定値をルールに基づき事前に計算した値(-1なら,max-widthについては処理対象外)
 *          h0: min-height指定値をルールに基づき事前に計算した値(-1なら,min-heightについては処理対象外)
 *          h2: max-height指定値をルールに基づき事前に計算した値(-1なら,max-heightについては処理対象外)
 *       }
 * ブロック要素(処理対象外)
 *    -> node.uuMaxMin = {
 *          min-width: undefined
 *          max-width: undefined
 *          min-height: undefined
 *          max-height: undefined
 *          width: マークアップ直前の状態で計算された幅(%またはpx)
 *          height: マークアップ直前の状態で計算された高さ(%またはpx)
 *          w0: -1
 *          w2: -1
 *          h0: -1
 *          h2: -1
 *       }
 * インライン要素(処理対象外) -> element.uuMaxMin プロパティは存在しない
 * @class
 */
uu.Class.Singleton("MaxMin", {
  construct: function() {
    this._targetElement = [];
    this._lock = 0;
    this.markup();
    this.fix();

    // set event handler
    var me = this;
    uu.customEventView.attach(function() { // add element + resize, update view
      me.markup(1); // re-validate
      me.fix();
    }, 3);
    uu.customEventFontResize.attach(function() { // font-resize
      uu.style.unit(1); // re-validate em and pt
      me.markup(1); // re-validate
      me.fix();
    });
    uu.event.attach(window, "resize", this);
  },

  handleEvent: function(evt) {
    if (evt.type === "resize") { // window resize event
      this.markup(1); // re-validate
      this.fix();
    }
  },

  // min-height, max-height, min-width, max-width 適用対象を列挙
  // 動的に要素を追加したりCSSを変更するような用法なら、
  // その都度このメソッドを呼ぶ必要がある。
  // CSS2の仕様上ブロックレベル要素のみに適用する(table要素は除外)
  markup: function(force) { // Boolean(default: false): force revalidate
    force = force || false;

    var rv = [], cs, mm, w, h, r,
        nodeList = uu.tag("*", uudoc.body), v, i = 0,
        fnDim = this._getDimension;

    while ( (v = nodeList[i++]) ) {
      if (!uu.isBlockTag(v.tagName)) {
        continue; // (min|max)-(width|height)はブロックエレメント限定
      }

      cs = v.currentStyle;
      // 要素に独自プロパティ(uuMaxMin)を追加し計算済みの値を保存する
      if (force || !v.uuMaxMin) { // 初回 または 強制再評価
        // "" 又は "auto" が指定されている場合は、
        // currentStyle.width や clientWidth の値は使えないため
        // getBoundingClientRect() から幅と高さを取得する
        r = v.getBoundingClientRect();
        w = cs.width, h = cs.height;
        if (cs.width.lastIndexOf("%") === -1) {
          // %指定以外ならpx単位の値を取得する, %指定ならそのまま
          w = (cs.width === "auto") ? (r.right - r.left) : v.clientWidth;
          w += "px";
        }
        if (cs.height.lastIndexOf("%") === -1) {
          h = (cs.height === "auto") ? (r.bottom - r.top) : v.clientHeight;
          h += "px";
        }
        // 要素に独自プロパティ(uuMaxMin)を追加し、
        // style要素/インライン属性で指定されたCSSプロパティを一式保存する
        v.uuMaxMin = {
          width: w,
          height: h,
          "min-width":  cs["min-width"],
          "max-width":  cs["max-width"],
          "min-height": cs["minHeight"],
          "max-height": cs["max-height"]
        };
      }
      // 2回目以降は、
      // style要素/インライン属性で指定されたCSSプロパティについては
      // 変動していないはずなのでそのまま
      // 現在の幅/高さを用いた事前の再計算処理だけ行う。
      mm = v.uuMaxMin;
      uu.mix(mm, {
        w0: fnDim(v, mm["min-width"],  "width"),
        w2: fnDim(v, mm["max-width"],  "width"),
        h0: fnDim(v, mm["min-height"], "height"),
        h2: fnDim(v, mm["max-height"], "height")
      });

      // CSS2の仕様にあわせた打ち消し処理
      // (min-width > max-width なら，max-width = min-width)
      if (mm.w0 !== -1 && mm.w2 !== -1 && mm.w0 > mm.w2) {
        mm.w2 = mm.w0;
      }
      if (mm.h0 !== -1 && mm.h2 !== -1 && mm.h0 > mm.h2) {
        mm.h2 = mm.h0;
      }

      // min-width(w0), max-width(w2), min-height(h0), max-height(h2) の
      // いずれもが指定されていなければ描画対象に含めない
      if (mm.w0 === -1 && mm.w2 === -1 && mm.h0 === -1 && mm.h2 === -1) {
        continue; // 全て -1 なら処理対象外
      }
      rv.push(v); // 描画対象に追加
    }

    this._targetElement = rv;
  },

  // CSS2の仕様書にあるルールを元に要素のサイズを求める
  _getDimension: function(elm, val, name) {
    if (!val || val === "auto" || val === "none") {
      return -1;
    }
    var props = { width: 1, height: 2 },
        rect;
    if (val.lastIndexOf("%") >= 0) {
      // パーセント指定なら -> 親要素の幅/高さに対する%指定と解釈する
      switch (props[name] || 0) {
      case 1: // width
        rect = uu.style.getRect(elm.parentNode);
        return rect.w * parseFloat(val) / 100; // 親要素の幅から計算
      case 2: // height
        rect = uu.style.getRect(elm.parentNode);
// ▼▼▼▼▼
//      return rect.w * parseFloat(val) / 100; // 親要素の高さから計算
// ▲▲▲▲▲
        return rect.h * parseFloat(val) / 100; // 親要素の高さから計算
      }
      return -1;
    }
    return isNaN(val) ? uu.style.toPixel(elm, val, name) : -1; // 単位付の値(3em)
  },

  // IEから連続でイベントが来るため、
  // 一定時間内の同種のイベントを一つにまとめて処理しないと、
  // イベント内でイベントが発生(無限ループ)し、
  // ブラウザがフリーズしたり、勝手にスクロールしたりする。
  fix: function() {
    if (!this._targetElement.length) {
      return;
    }
    if (this._lock) {
      return; // locked
    }
    var me = this;

    function FIX() {
      var ary = me._targetElement, v, i = 0, iz = ary.length, mm;
      me._lock = 1; // lock

      for (; i < iz; ++i) {
        if (i in ary) {
          v = ary[i];
          mm = v.uuMaxMin;
          if (mm.w0 !== -1 || mm.w2 !== -1) {
            me._resizeWidth(v);
          }
          if (mm.h0 !== -1 || mm.h2 !== -1) {
            me._resizeHeight(v);
          }
        }
      }
      // lazy unlock(crucial)
      setTimeout(function() {
        me._lock = 0; // unlock
      }, 40); // lazy 40ms
    }
    setTimeout(FIX, 40); // lazy 40ms
  },

  // ブラウザに再計算させた値を元に、適正範囲内に収まっているかを判断する
  // わかり辛いのでコメント大盛り
  _resizeWidth: function(elm) {
    var mm = elm.uuMaxMin, s = elm.style, w,
        auto;

    function MIN() {
      if (mm.w0 === -1) { // min-widthが指定されていない → nop
        return false;
      }
      s.width = mm.w0; // 一時的にmin-widthの値を幅に設定する(再計算/再描画)が走る
      // min-widthで再計算後の幅が元の幅(w)より大きければ
      // 既にmin-widthを下回っていたことになるため、
      // style.widthにmin-widthを適用した状態でfalseを返す
      return (elm.clientWidth > w) ? true : false;
    }

    function MAX() {
      if (mm.w2 === -1) {
        return false; // max-widthが指定されていない → nop
      }
      s.width = mm.w2;
      return (elm.clientWidth < w) ? true : false;
    }

    // widthをCSS指定値に戻し、ブラウザに本来の幅を再計算させる
    s.width = mm.width;

    // 本来の幅をwに保存
    w = elm.clientWidth;
    if (!MIN() && !MAX()) {
      s.width = mm.width; // 範囲内に収まっている場合は、本来の幅に戻す
    }
  },

  _resizeHeight: function(elm) {
    var mm = elm.uuMaxMin, s = elm.style, h;

    function MIN() {
      if (mm.h0 === -1) {
        return false;
      }
      s.height = mm.h0;
      return (elm.clientHeight > h) ? true : false;
    }

    function MAX() {
      if (mm.h2 === -1) {
        return false;
      }
      s.height = mm.h2;
      return (elm.clientHeight < h) ? true : false;
    }

    s.height = mm.height;
    h = elm.clientHeight;
    if (!MIN() && !MAX()) { s.height = mm.height; }
  }
});

UU.IE && uu.ua.version === 6 && uu.ready(function() {
  new uu.Class.MaxMin();
});

// === IEBoost Alpha PNG ===================================
/** Alpha png image transparent for IE6
 *
 * @class
 */
uu.mix(UU.CONFIG, {
  ALPHA_PNG: {
    SPACER_IMAGE: "b32.png"
  }
}, 0, 0);

uu.Class.Singleton("AlphaPNG", {
  construct: function() {
    uu.style.appendRule("ieboost", "img",    "behavior: expression(uu.Class.AlphaPNG._expression(this))");
    uu.style.appendRule("ieboost", ".png",   "behavior: expression(uu.Class.AlphaPNG._expression(this))");
    uu.style.appendRule("ieboost", "input",  "behavior: expression(uu.Class.AlphaPNG._expression(this))");
    uu.style.appendRule("ieboost", ".alpha", "behavior: expression(uu.Class.AlphaPNG._expression(this))");
  }
});
uu.mix(uu.Class.AlphaPNG, {
  _expression: function(elm) {
    var spacer = UU.CONFIG.ALPHA_PNG.SPACER_IMAGE,
        reg = RegExp(spacer + "$"),
        url, w, h, run = 0,
        src = elm.src || "",
        tagName = elm.tagName.toLowerCase();

    switch (tagName) {
    case "img":
      if (/.png$/i.test(src)) {
        if (reg.test(src)) {
          break; // nop
        }
        elm.uuAlphaPNGSrc = src;

        w = elm.width;
        h = elm.height;

        uu.Class.AlphaPNG._setAlphaLoader(elm, src, "image");

        elm.src = UU.CONFIG.IMG_DIR + spacer;
        elm.width = w; // hasLayout = true
        elm.height = h;
        ++run;
      } else {
        // <img src="*.png">  ->  <img src="*.gif">
        // 内部的に使用しているpngファイル(b32.png)と、DataSchmeは除外する
        if (!reg.test(src) && !(/^data:/.test(src))) {
          elm.uuAlphaPNGSrc = src;

          // disable filter and make it original size
          uu.Class.AlphaPNG._unsetAlphaLoader(elm);
          elm.style.width = "auto";
          elm.style.height = "auto";
          // ここでDataSchemeを持つ要素のwidth,heightが上書されてしまうと
          // ieboost.datascheme の処理に支障がでる
        }
      }
      break;
    case "input":
      if (elm.type !== "image") { break; }
      if (/.png$/i.test(src)) {
        if (reg.test(src)) {
          break; // nop
        }
        elm.uuAlphaPNGSrc = src;

        uu.Class.AlphaPNG._setAlphaLoader(elm, src, "image");

        elm.src = UU.CONFIG.IMG_DIR + spacer;
        elm.style.zoom = 1; // hasLayout = true

        ++run;
      } else {
        // <input type="image" src="*.png">  ->  <input type="image" src="*.gif">
        if (!reg.test(src)) {
          elm.uuAlphaPNGSrc = src;

          // disable filter
          uu.Class.AlphaPNG._unsetAlphaLoader(elm);
          elm.style.width = "auto";
          elm.style.height = "auto";
        }
      }
      break;
    default:
      url = uu.style.getBackgroundImage(elm);
      if (url === "none") {
        uu.Class.ALPHAPNG._unsetAlphaLoader(elm);
        break;
      }
      if (reg.test(url)) {
        break; // nop
      }
      if (/.png$/i.test(url)) {
        uu.Class.AlphaPNG._setAlphaLoader(elm, url, "crop");
        elm.style.backgroundImage = "url(" + UU.CONFIG.IMG_DIR + spacer + ")";

        elm.style.zoom = 1; // hasLayout = true
        ++run;
      } else { // *.png → *.jpg
        uu.Class.AlphaPNG._unsetAlphaLoader(elm);
      }
    }

    if (run) {
      uu.Class.AlphaPNG._bugfix(elm);
    }
    // attach spy and purge behavior
    if (!("uuIEBoostAlphaPNGSpy" in elm)) {
      elm.attachEvent("onpropertychange", uu.Class.AlphaPNG._onpropertychange);
      elm.uuIEBoostAlphaPNGSpy = 1;
    }
    elm.style.behavior = "none";
  },

  // spy
  _onpropertychange: function() {
    var evt = window.event;
    switch (evt.propertyName) {
    case "style.backgroundImage":
    case "src":  // <img src="1.png"> → <input type="2.png">
      uu.Class.AlphaPNG._expression(evt.srcElement);
      break;
    }
  },

  // set alpha image loader
  _setAlphaLoader: function(elm, src, method) {
    var aloader = "DXImageTransform.Microsoft.AlphaImageLoader";
    if (elm.filters.length && aloader in elm.filters) {
      elm.filters[aloader].enabled = 1;
      elm.filters[aloader].src = src;
    } else {
      elm.style.filter += " progid:" + aloader
                       +  "(src='" + src + "', sizingMethod='" + method + "')";
    }
  },

  // unset alpha image loader
  _unsetAlphaLoader: function(elm) {
    var aloader = "DXImageTransform.Microsoft.AlphaImageLoader";
    if (elm.filters.length && aloader in elm.filters) {
      elm.filters[aloader].enabled = 0;
    }
  },

  // 透過された画像の上に配置した要素[a, input, textarea, select ]をクリック可能にする
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
        c.firstChild && uu.Class.AlphaPNG._bugfix(c);
      }
    }
  }
});

UU.IE && uu.ready(function() {
  new uu.Class.AlphaPNG();
});

// === IEBoost Opacity =====================================
/** opacity:
 *
 * @class
 */
uu.Class.Singleton("Opacity", {
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

UU.IE && uu.ready(function() {
  new uu.Class.Opacity();
});

// === IEBoost fix position:absolute bug ===================
/** position: absolute bug(cannot select text) fix for IE6 Standard mode
 *
 * @class
 */
uu.Class.Singleton("PositionAbsolute", {
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

UU.IE && uu.ua.version === 6 && !uu.ua.quirks && uu.ready(function() {
  new uu.Class.PositionAbsolute();
});

// === IEBoost fix position: fixed bug =====================
/** position: fixed for IE6
 *
 * @class
 */
uu.Class.Singleton("PositionFixed", {
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

UU.IE && uu.ua.version === 6 && uu.ready(function() {
  new uu.Class.PositionFixed();
  try {
    uudoc.execCommand("BackgroundImageCache", false, true);
  } catch (err) { ; }
});
