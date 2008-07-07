/** <b>IE Boost Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu, UU = uuw.UU;

/** <b>IE Boost Module</b>
 *
 * @class
 */
uu.module.ieboost = uu.klass.singleton();
uu.module.ieboost.prototype = {
  construct: function(param /* = { maxmin: true, alphapng: true, opacity: true } */) {
    var me = this;
    this.param = uu.mix.param(param || {}, { maxmin: true, alphapng: true, opacity: true });
    this.he = uu.event.handler(this); // event handler
    uu.event.set(uuw, "resize", this.he); // IEの二重登録問題が未解決 ▼▼▼次に持ち越し▲▲▲
    uu.msgpump.set("uu.module.ieboost", this); // msgpumpに登録

    // IEのバージョンによる機能の不活性化
    if (uu.ua.version > 6 && uu.ua.version < 5.5) {
      this.param.maxmin   = false; // IE5.5～6.0以外ならmaxmin不活性
      this.param.alphapng = false; // IE5.5～6.0以外ならalphapng不活性
    }
    // モジュールの有無による機能の活性/不活性化
    if (uu.module.isLoaded("ui")) {
      // uiモジュールロード済みでfontResizeイベントを活性化
      this.fontResizeEvent = new uu.event.custom.fontResize();
    }

    this.maxmin     = this.param.maxmin   ? new uu.module.ieboost.maxmin()     : 0;
    this.alphapng   = this.param.alphapng ? new uu.module.ieboost.alphapng()   : 0;
    this.alphapngbg = this.param.alphapng ? new uu.module.ieboost.alphapngbg() : 0;
    this.opacity    = this.param.opacity  ? new uu.module.ieboost.opacity()    : 0;

    if (this.param.maxmin || this.param.alphapng) {
      // ポーリングで変化チェック
      uu.tm10.set(function() {
        me.alphapng && me.alphapng.fix();
      }, 2000, 0); // 2000msで無限ループ
    }
  },
  handleEvent: function(evt) {
    var type = uu.event.type(evt.type);
    switch (type) {
    case "resize": // window resize event
      this.maxmin && this.maxmin.draw();
      break;
    }
  },
  procedure: function(msg, p1, p2) {
    switch (msg) {
    case UU.MSG_EVENT_DOM_MANIP:
      this.maxmin && this.maxmin.recalc();
      this.alphapng && this.alphapng.fix();
      this.alphapngbg && this.alphapngbg.recalc();
      break;
    case UU.MSG_EVENT_FONT_RESIZE:
      this.maxmin && this.maxmin.recalc();
      break;
    }
  }
};

/** <b>CSS2.1 max-width, min-width, max-height, min-height for IE6</b>
 *
 * max-width, min-width, max-height, min-heightを持つブロック要素にマーキング(uuMaxMin)を行い幅と高さを制御する
 * ブロック要素(未処理)   -> element.uuMaxMin プロパティは存在しない
 * ブロック要素(処理対象) -> element.uuMaxMin = {
 *                              min-width: min-width指定値,
 *                              max-width: max-width指定値,
 *                              min-height: min-width指定値,
 *                              max-height: max-width指定値,
 *                              width: マークアップ直前の状態で計算された幅(%またはpx)
 *                              height: マークアップ直前の状態で計算された高さ(%またはpx)
 *                              w0: min-width指定値をルールに基づき事前に計算した値(-1なら,min-widthについては処理対象外)
 *                              w2: max-width指定値をルールに基づき事前に計算した値(-1なら,max-widthについては処理対象外)
 *                              h0: min-height指定値をルールに基づき事前に計算した値(-1なら,min-heightについては処理対象外)
 *                              h2: max-height指定値をルールに基づき事前に計算した値(-1なら,max-heightについては処理対象外)
 *                           }
 * ブロック要素(処理対象外)
 *                        -> element.uuMaxMin = {
 *                              min-width: undefined
 *                              max-width: undefined
 *                              min-height: undefined
 *                              max-height: undefined
 *                              width: マークアップ直前の状態で計算された幅(%またはpx)
 *                              height: マークアップ直前の状態で計算された高さ(%またはpx)
 *                              w0: -1
 *                              w2: -1
 *                              h0: -1
 *                              h2: -1
 *                           }
 * インライン要素(処理対象外) -> element.uuMaxMin プロパティは存在しない
 * @class
 */
uu.module.ieboost.maxmin = uu.klass.generic();
uu.module.ieboost.maxmin.prototype = {
  construct: function() {
    this.lock = 0;
    this.maxmin = this.markup();
    this.draw();
  },
  // 再計算と再描画
  recalc: function() {
    if (!this.maxmin.length) { return; }
    this.maxmin = this.markup(); // 再マークアップ
    this.maxmin.length && this.draw();
  },
  // 困ったことにIEから連続でイベントが来る。
  // 一定時間内の同種のイベントを一つにまとめて処理しないと、
  // イベント内でイベントが発生(無限ループ)し、
  // ブラウザがフリーズしたり、勝手にスクロールする。
  draw: function() {
    if (this.lock) { return; } // lock中なら処理しない
    var me = this;
    function LOCK()   { me.lock = 1; }
    function UNLOCK() { me.lock = 0; }
    function FIX()    { LOCK();
                        me.maxmin.forEach(function(e) {
                          var mm = e.uuMaxMin;
                          if (mm.w0 !== -1 || mm.w2 !== -1) { me.resizeWidth(e);  }
                          if (mm.h0 !== -1 || mm.h2 !== -1) { me.resizeHeight(e); }
                        });
                        // ちょっと間をおいてロックを解除する(肝心)
                        uu.delay(UNLOCK, 40); // 40ms後にunlock
                      }
    uu.delay(FIX, 40);
  },
  // ブラウザに再計算させた値を元に、適正範囲内に収まっているかを判断する
  // わかり辛いのでコメント大盛り
  resizeWidth: function(elm) {
    var mm = elm.uuMaxMin, s = elm.style, w;
    function MIN()  { if (mm.w0 === -1) { return false; } // min-widthが指定されていない → 仕事しない
                      s.width = mm.w0;                    // 一時的にmin-widthの値を幅に設定する(再計算/再描画)が走る
                      return (elm.clientWidth > w) ? true : false; } // min-widthで再計算後の幅が元の幅(w)より大きければ
                                                                     // 既にmin-widthを下回っていたことになるため、
                                                                     // style.widthにmin-widthを適用した状態でfalseを返す
    function MAX()  { if (mm.w2 === -1) { return false; } // max-widthが指定されていない → 仕事しない
                      s.width = mm.w2;
                      return (elm.clientWidth < w) ? true : false; }
    s.width = mm.width;  // widthをCSS指定値に戻し、ブラウザに本来の幅を再計算させる
    w = elm.clientWidth; // 本来の幅をwに保存
    if (!MIN() && !MAX()) { s.width = mm.width; } // 範囲内に収まっている場合は、本来の幅に戻す
  },
  resizeHeight: function(elm) {
    var mm = elm.uuMaxMin, s = elm.style, h;
    function MIN()  { if (mm.h0 === -1) { return false; }
                      s.height = mm.h0;
                      return (elm.clientHeight > h) ? true : false; }
    function MAX()  { if (mm.h2 === -1) { return false; }
                      s.height = mm.h2;
                      return (elm.clientHeight < h) ? true : false; }
    s.height = mm.height;
    h = elm.clientHeight;
    if (!MIN() && !MAX()) { s.height = mm.height; }
  },
  // (min|max)-(height|width)の対象となる要素を列挙
  // 動的に要素を追加したりCSSを変更するような用法なら、その都度このメソッドを呼ぶ必要があるかもしれない
  // CSS2の仕様上ブロックレベル要素(-table)のみ
  markup: function() {
    var rv = [], cs, mm, w, h, r;
    function F(elm, val, name) { // CSS2の仕様書にあるルールを参考に色々と
      if (!val || val === "auto" || val === "none") { return -1; }
      if (val.lastIndexOf("%") !== -1) { // パーセント指定なら -> 親要素の幅/高さに対する%指定と解釈する
        return uu.css.get[name](elm.parentNode) * parseFloat(val) / 100; // 親要素の幅/高さから計算
      }
      return (isNaN(val)) ? uu.css.get.toPixel(elm, val, name) : -1; // 単位付の値(3em)
    }
    uu.forEach(uu.tag("*", document.body), function(v) {
      if (!uu.css.isBlock(v)) { return; } // (min|max)-(width|height)はブロックエレメント限定

      cs = v.currentStyle;
      // 要素に独自プロパティ(uuMaxMin)を追加し計算済みの値を保存する
      if (!v.uuMaxMin) { // 初回
        r = v.getBoundingClientRect();  // "" 又は "auto" が指定されている場合は、
                                        // currentStyle.width や clientWidth の値を見ても無駄なので、
                                        // getBoundingClientRect()から幅と高さを取得する
        w = cs.width, h = cs.height;
        if (cs.width.lastIndexOf("%") === -1) { // %指定以外ならpx単位の値を取得する, %指定ならそのまま
          w = (cs.width === "auto") ? (r.right - r.left) : v.clientWidth;
          w += "px";
        }
        if (cs.height.lastIndexOf("%") === -1) {
          h = (cs.height === "auto") ? (r.bottom - r.top) : v.clientHeight;
          h += "px";
        }
        // 要素に独自プロパティ(uuMaxMin)を追加し、style要素/インライン属性で指定されたCSSプロパティを一式保存する
        v.uuMaxMin = { width: w, height: h,
                       "min-width":  cs["min-width"], "max-width":  cs["max-width"],
                       "min-height": cs["minHeight"], "max-height": cs["max-height"] };
      }
      // 2回目以降は、style要素/インライン属性で指定されたCSSプロパティについては変動がないはずなので、そのまま。
      // 現在の幅/高さを用いた事前の再計算処理だけ行う。
      mm = v.uuMaxMin;
      uu.mix(mm, { w0: F(v, mm["min-width"],  "width"), w2: F(v, mm["max-width"],  "width"),
                   h0: F(v, mm["min-height"], "height"), h2: F(v, mm["max-height"], "height") });
      // CSS2の仕様にあわせた打ち消し処理(min-width > max-width なら，max-width = min-width)
      if (mm.w0 !== -1 && mm.w2 !== -1 && mm.w0 > mm.w2) { mm.w2 = mm.w0; }
      if (mm.h0 !== -1 && mm.h2 !== -1 && mm.h0 > mm.h2) { mm.h2 = mm.h0; }

      // min-width(w0), max-width(w2), min-height(h0), max-height(h2) の
      // いずれもが指定されていなければ描画対象に含めない
      if (mm.w0 === -1 && mm.w2 === -1 && mm.h0 === -1 && mm.h2 === -1) {
        return; // 全て -1 なら処理対象外
      }
      rv.push(v); // 描画対象に追加
    });
    return rv; // 処理対象一覧を配列で返す
  }
};

/** <b>Alpha png image transparent for IE6</b>
 *
 * 全画像にマーキング(uuAlphaPNG)を行い、png画像を自動的に透過する
 * png画像(未処理)          -> element.uuAlphaPNG プロパティは存在しない
 * png画像(透過対象)        -> element.uuAlphaPNG = 1
 * png画像(透過処理済)      -> element.uuAlphaPNG = 2
 * png画像(透過対象外)      -> element.uuAlphaPNG = 3
 * jpg/gif画像(透過対象外)  -> element.uuAlphaPNG = 3
 *
 * 透過するpng画像は条件に合致するものに限定する。文字の大小は区別しない。
 *  条件1. 未処理であること
 *  条件2. png画像であること(拡張子が".png")
 *  条件3. src,classNameの文字列の一部に"alpha","trans"を含んでいること
 *
 * @class
 */
uu.module.ieboost.alphapng = uu.klass.generic();
uu.module.ieboost.alphapng.prototype = {
  construct: function() {
    var me = this;
    this.alpha = { size: 0, gif: uu.config.imagePath + "b1.gif",
                   progid: "progid:DXImageTransform.Microsoft.AlphaImageLoader" };
    // imageモジュール未ロードなら1pxの透明gifを使わない方法でalphapngを実行する
    if (uu.module.isLoaded("image")) {
      uu.module.image.preload(this.alpha.gif, function(code) {
        if (code) { // gif画像のプリロード成功でマークアップと透過を行う
//alert("<img>");
          me.alpha.size = me.markup();
          me.trans();
        }
      });
    } else {
//alert("<span>");
      // <img> を <span> に置換する方法に切り替える
      this.alpha.gif = "";
      this.alpha.size = this.markup();
      this.trans2();
    }
  },
  // 定期的に呼ばれ、必要に応じて透過処理を行う
  fix: function() {
    if (uud.images.length !== this.alpha.size) { // 画像数に変化あり
      this.alpha.size = this.markup(); // 再マークアップ
      this.alpha.gif ? this.trans() : this.trans2();
    }
  },
  trans: function() { // <img>の画像を1x1.gifに差し替え、背景を設定する
    var me = this, w, h;
    uu.forEach(uud.images, function(e) {
      if (!e.uuAlphaPNG || e.uuAlphaPNG !== 1) { return; } // 処理対象外
      w = e.width, h = e.height;
      e.style.filter = me.alpha.progid + '(src="' + e.src + '",sizingMethod="image")';
      uu.mix(e, { src: me.alpha.gif, width: w, height: h, uuAlphaPNG: 2 }); // 処理済みとしてマーク
    });
  },
  trans2: function() { // <img>を<span>で偽装し、spanに背景を設定する
    var me = this, ph;
    uu.forEach(uud.images, function(e) {
      if (!e.uuAlphaPNG || e.uuAlphaPNG !== 1) { return; } // 処理対象外
      ph = uud.createElement("span");
      ph.id               = e.id;
      ph.className        = e.className;
      ph.style.cssText    = e.currentStyle.cssText;
      ph.style.display    = "inline-block";
      ph.style.width      = e.width;
      ph.style.height     = e.height;
      ph.style.styleFloat = e.align;
      ph.style.filter     = me.alpha.progid + '(src="' + e.src + '",sizingMethod="scale")';
      ph.uuAlphaPNG       = 2; // 処理済みとしてマーク
      e.parentNode.replaceChild(ph, e); // imgをドキュメント上から削除する
      if (e.id) { // idキャッシュを更新
        uu.id._cache[e.id] = ph;
      }
    });
  },
  markup: function() {
    uu.forEach(uud.images, function(e) {
      if (!e.uuAlphaPNG) { // 未処理
        e.uuAlphaPNG = 3; // 一旦透過対象外としてマーク
        if (e.complete && /.png$/i.test(e.src)) {
          if (/trans|alpha/i.test(e.src + " " + e.className)) {
            e.uuAlphaPNG = 1; // 透過対象としてマーク
          }
        }
      }
    });
    return uud.images.length;
  }
};

/** <b>Alpha png background-image transparent for IE6</b>
 *
 * 背景画像を自動的に透過する
 * png画像(未処理)          -> element.uuAlphaPNGBG プロパティは存在しない
 * png画像(透過対象)        -> element.uuAlphaPNGBG = 1
 * png画像(透過処理済)      -> element.uuAlphaPNGBG = 2
 * png画像(透過対象外)      -> element.uuAlphaPNGBG = 3
 * jpg/gif画像(透過対象外)  -> element.uuAlphaPNGBG = 3
 *
 * 透過するpng画像は条件に合致するものに限定する。文字の大小は区別しない。
 *  条件1. 未処理であること
 *  条件2. png画像であること(拡張子が".png")
 *  条件3. url,classNameの文字列の一部に"alpha","trans"を含んでいること
 *
 * @class
 */
uu.module.ieboost.alphapngbg = uu.klass.generic();
uu.module.ieboost.alphapngbg.prototype = {
  construct: function() {
    this.alpha = { elm: [],
                   progid: "progid:DXImageTransform.Microsoft.AlphaImageLoader" };
    var me = this;
    uu.window.ready(function() {
      me.alpha.elm = me.markup();
      me.alpha.elm.length && me.trans();
    });
  },
  // DOM要素数に変化があった際に呼ばれ、再マークアップを行う
  recalc: function() {
    if (uu.window.already()) {
      this.alpha.elm = this.markup(); // 再マークアップ
      this.alpha.elm.length && this.trans();
    }
  },
  trans: function() {
    var me = this;
    this.alpha.elm.forEach(function(e) {
      if (!e.uuAlphaPNGBG || e.uuAlphaPNGBG !== 1) { return; } // 処理対象外
      if (e.currentStyle.width === "auto" && e.currentStyle.height === "auto") {
        e.style.width = e.offsetWidth + 'px';
      }
      e.style.backgroundImage = "none";
      e.style.filter = me.alpha.progid + '(src="' + e.uuAlphaPNGBGSrc + '",sizingMethod=crop)';
      e.uuAlphaPNGBG = 2; // 処理済みとしてマーク
// uu.log({ tag: e.tagName, src: e.uuAlphaPNGBGSrc });
      // --- バグ回避 ---
      me.bugfix(e);
      me.bugfixs(e);
    });
  },
  bugfixs: function(elm) {
    var i = 0, sz = elm.childNodes.length, c;
    for (; i < sz; ++i) {
      c = elm.childNodes[i];
      if (c.nodeType !== 1) { continue; }
      this.bugfix(c);
      if (c.firstChild) { this.bugfix(c); }
    }
  },
  bugfix: function(elm) {
    switch (elm.tagName.toLowerCase()) {
    case "a":         elm.style.cursor = "pointer"; // break;
    case "input":
    case "textarea":
    case "select":    !elm.style.position && (elm.style.position = "relative");
    }
  },
  markup: function() {
    var rv = [], url, m, tag;
    uu.forEach(uu.tag("*", uud.body), function(e) {
      if (!e.uuAlphaPNGBG) { // 未処理
        e.uuAlphaPNGBG = 3; // 一旦透過対象外としてマーク
        tag = e.tagName.toLowerCase();
        url = e.style.backgroundImage || e.currentStyle.backgroundImage;
        if (url) {
          m = url.match(/^url\("(.*)"\)$/);
          if (m) {
            if (/.png$/i.test(m[1])) {
              if (/trans|alpha/i.test(m[1] + " " + e.className)) {
                e.uuAlphaPNGBG = 1; // 透過対象としてマーク
                e.uuAlphaPNGBGSrc = m[1]; // srcを保存
                rv.push(e);
              }
            }
          }
        }
      }
    });
    return rv;
  }
};

/** <b>CSS3 opacity for IE6</b>
 *
 * @class
 */
uu.module.ieboost.opacity = uu.klass.generic();
uu.module.ieboost.opacity.prototype = {
  // 全要素から以下の条件にマッチするものを検索しopacityを設定する
  // 条件1. currentStyleに"opacity"が定義されているが、styleに定義が無いもの
  // 条件2. 値が妥当な範囲(0.0～1.0)
  construct: function() {
    var val, opa;
    uu.forEach(uu.tag("*", uud.body), function(e) {
/* leep
      if (e.currentStyle.opacity && !("opacity" in e.style)) {
        val = parseFloat(e.currentStyle.opacity);
        if (val >= 0.0 && val <= 1.0) {
          uu.css.set.opacity(e, val);
        }
      }
 */
      opa = e.style.opacity || e.currentStyle.opacity;
      if (opa) {
        val = parseFloat(opa);
        if (val >= 0.0 && val <= 1.0) {
          uu.css.set.opacity(e, val);
        }
      }

    });
  }
};

uu.ieboost = {};

if (uu.ua.ie) {
  uu.window.ready(function() {
    uu.ieboost = new uu.module.ieboost();
  });
}

})(); // end (function())()

