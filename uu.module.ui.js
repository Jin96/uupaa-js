/** <b>UI module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.ui = {};

/** <b>UI</b>
 *
 * @class
 */
uu.ui = function() {
};

/** <b>ブラウザの表示領域に関する情報を取得</b>
 *
 *  <dl>
 *    <dt>iw</dt><dd>ブラウザの表示領域の幅 - innerWidth or clientWidth</dd>
 *    <dt>ih</dt><dd>ブラウザの表示領域の高さ - innerHeight or clientHeight</dd>
 *    <dt>sw</dt><dd>ブラウザの表示領域の横スクロール量 - pageXOffset or scrollLeft</dd>
 *    <dt>sh</dt><dd>ブラウザの表示領域の縦スクロール量 - pageYOffset or scrollTop</dd>
 *  </dl>
 * @return hash { iw, ih, sw, sh } を返します。<br />
 */
uu.ui.inner = function() {
  return { iw: uuw.innerWidth, ih: uuw.innerHeight,
           sw: uuw.pageXOffset, sh: uuw.pageYOffset };
};
if (uu.ua.ie) { // for IE
  if (uu.ua.std) {
    uu.ui.inner = function() {
      var e = uud.documentElement;
      return { iw: e.clientWidth, ih: e.clientHeight,
               sw: e.scrollLeft, sh: e.scrollTop };
    };
  } else {
    uu.ui.inner.scroll = function() {
      var e = uud.body;
      return { iw: e.clientWidth, ih: e.clientHeight,
               sw: e.scrollLeft, sh: e.scrollTop };
    };
  }
}

/** <b>要素に関する情報を取得</b>
 *
<pre>
elm.offsetLeft (= elm.style.left + elm.style.marginLeftWidth)
├────┤
┏  ━┬━  ━  ━  ━  ━  ━  ━  ━  ━  ━  ━  ━  ━      ┬
      │                                                        │elm.style.top
┃    │                                                    ┬  ┴
      │elm.offsetTop                                       │
┃    │                                                    │elm.style.marginTopWidth
      │                                                    │
┃    ┴  ┏━━━━━━━━━━━━━━━━━━━━━┓┬  ┴  ┬
          ┃■■■■■■■■■■■■■■■■■■■■■┃│      │elm.style.borderTopWidth
┃        ┃■■■■■■■■■■■■■■■■■■■■■┃│      │
          ┃■■┏━━━━━━━━━━━━━━━┓■■┃│  ┬  ┴
┃        ┃■■┃                              ┃■■┃│  │
          ┃■■┃                              ┃■■┃│  │elm.style.paddingTopWidth
┃        ┃■■┃  ┌─Contents─Area───┐  ┃■■┃│  ┴  ┬
          ┃■■┃  │                      │  ┃■■┃│      │
┃        ┃■■┃  │                      │  ┃■■┃│      │ elm.clientHeight
          ┃■■┃  │         elm          │  ┃■■┃│      │  (= elm.style.height)
┃        ┃■■┃  │                      │  ┃■■┃│      │
          ┃■■┃  │                      │  ┃■■┃│      │
┃        ┃■■┃  └───────────┘  ┃■■┃│      ┴
          ┃■■┃                              ┃■■┃│
┃        ┃■■┗━━━━━━━━━━━━━━━┛■■┃│elm.offsetHeight
          ┃■■■■■■■■■■■■■■■■■■■■■┃│   (= elm.style.borderTopWidth
┃        ┃■■■■■■■■■■■■■■■■■■■■■┃│    + elm.style.borderBottomWidth
          ┗━━━━━━━━━━━━━━━━━━━━━┛┴    + elm.style.height)
┃                                                      
          ├─────────────────────┤
┃                      elm.offsetWidth (= elm.style.borderLeft + elm.style.borderRight
                                                                + elm.style.width)
┃              ├───────────────┤
                        elm.clientWidth (= elm.style.width)
┃      
          ├──┤
┃       elm.clientLeft (= elm.style.borderLeftWidth)


Firefox3から、clientLeft, clientTopが利用可能

</pre>
 *
 *  <dl>
 *    <dt>x</dt><dd>画面左上からのオフセット幅(スクロール量を含む) - offsetLeftの累計 - ウインドウの原点からの絶対座標</dd>
 *    <dt>y</dt><dd>画面左上からのオフセット高さ(スクロール量を含む) - offsetTopの累計 - ウインドウの原点からの絶対座標</dd>
 *    <dt>w</dt><dd>要素の幅(オフセット幅, 左右のボーダーを含む) - offsetWidth</dd>
 *    <dt>h</dt><dd>要素の高さ(オフセット高さ, 上下のボーダーを含む) - offsetHeight</dd>
 *    <dt>cw</dt><dd>要素の幅(オフセット幅, 左右のボーダーを含まない) - clientWidth</dd>
 *    <dt>ch</dt><dd>要素の高さ(オフセット高さ, 上下のボーダーを含まない) - clientHeight</dd>
 *  </dl>
 *
 * @param element elm - 要素を指定します。
 * @return rect       - { x, y, w, h, cw, ch } を返します。
 * @namespace
 */
uu.ui.element = function(elm) {
  var e = elm, x = 0, y = 0;
  while (e) {
    x += e.offsetLeft || 0;
    y += e.offsetTop  || 0;
    e = e.offsetParent;
  }
  return { x: x, y: y,
           w: elm.offsetWidth, h: elm.offsetHeight,
           cw: elm.clientWidth, ch: elm.clientHeight };
};
if ("getBoundingClientRect" in uud) { // for IE, +Firefox3.0, +Opera9.5β2
  uu.ui.element = function(elm) {
    var b = elm.getBoundingClientRect(), inn = uu.ui.inner();
    return { x: inn.sw + b.left - 2, y: inn.sh + b.top - 2, // Operaで-2する必要があるかは要確認
             w: elm.offsetWidth, h: elm.offsetHeight,
             cw: elm.clientWidth, ch: elm.clientHeight };
  };
} /* else if ("getBoxObjectFor" in uud) { // for Firefox2
  uu.ui.element = function(elm) {
    var b = uud.getBoxObjectFor(elm), inn = uu.ui.inner();
    var borderTopWidth = parseInt(uu.css.get(elm, "borderTopWidth"));
    var borderLeftWidth = parseInt(uu.css.get(elm, "borderLeftWidth"));
    return { x: inn.sw + b.x - borderTopWidth, y: inn.sh + b.y - borderLeftWidth,
             w: b.width, h: b.height,
             cw: elm.clientWidth, ch: elm.clientHeight };
  };
} */

/** <b>最寄の基準点からの累計オフセットと要素の大きさを取得</b>
 *
 * 最寄の基準点からの累計オフセットと要素の大きさを取得します。
 * 最寄の基準点とは、position absoluteやrelativeが指定された要素のことです。
 *
 *  <dl>
 *    <dt>x</dt><dd>最寄の基準点からの累計オフセット値</dd>
 *    <dt>y</dt><dd>最寄の基準点からの累計オフセット値</dd>
 *    <dt>w</dt><dd>要素の幅(オフセット幅, 左右のボーダーを含む) - offsetWidth</dd>
 *    <dt>h</dt><dd>要素の高さ(オフセット高さ, 上下のボーダーを含む) - offsetHeight</dd>
 *    <dt>cw</dt><dd>要素の幅(オフセット幅, 左右のボーダーを含まない) - clientWidth</dd>
 *    <dt>ch</dt><dd>要素の高さ(オフセット高さ, 上下のボーダーを含まない) - clientHeight</dd>
 *  </dl>
 * @param element elm - 要素を指定します。
 * @return rect       - { x, y, w, h, cw, ch } を返します。<br />
 */
uu.ui.element.offsetParent = function(elm) {
  var e = elm, x = 0, y = 0, ss;
  while (e) {
    x += e.offsetLeft || 0;
    y += e.offsetTop  || 0;
    e = e.offsetParent;
    if (e) {
      ss = uu.css.get(e, "position"); // position を持つものが基準点となる
      if (ss === "relative" || ss === "absolute") { break; }
    }
  }
  return { x: x, y: y,
           w: elm.offsetWidth, h: elm.offsetHeight,
           cw: elm.clientWidth, ch: elm.clientHeight };
};

/** <b>絶対座標化</b>
 *
 * 要素の現在位置を保持したまま絶対座標化します。
 *
 * @param   element   elm     - 要素を指定します。
 * @param   hash      [style] - 追加するスタイルを { 名前: 値, ... }の形式で指定します。<br />
 *                              デフォルトはundefinedです。
 * @return  element           - elmを返します。
 */
uu.ui.element.toAbsolute = function(elm, style /* = undefined */) {
  var rect = uu.ui.element(elm);
  style = uu.mix.param(style || {}, { position: "absolute", left: rect.x + "px", top: rect.y + "px" });
  uu.css.set(elm, style);
  return elm;
};

/** <b>静的座標化</b>
 *
 * @param   element   elm     - 要素を指定します。
 * @param   hash      [style] - 追加するスタイルを { 名前: 値, ... }の形式で指定します。
 *                              デフォルトはundefinedです。
 * @return  element           - elmを返します。
 */
uu.ui.element.toStatic = function(elm, style /* = undefined */) {
  style = uu.mix.param(style || {}, { position: "static", left: 0, top: 0 });
  uu.css.set(elm, style);
  return elm;
};


/** <b>座標が矩形内にあればtrue</b>
 *
 * 座標(マウスカーソル等)が矩形内に含まれている場合にtrueを返します。
 *
 * <pre>
 *  rect━┯━━┓
 *    ┃  │    ┃
 *    ┠─pos   ┃
 *    ┃        ┃
 *    ┗━━━━┛
 * </pre>
 *
 * @param   rect    rect - { x, y, w, h } 要素の座標と大きさを指定します。
 * @param   pos     pos  - { x, y } 点を指定します。
 * @return  bool         - rect上にposがあればtrueを返します。
 */
uu.ui.inRect = function(rect, pos) {
  var r = rect, p = pos;
  return (p.x > r.x && p.x < r.x + r.w) && (p.y > r.y && p.y < r.y + r.h);
};

/** @namespace */
uu.event.key = function() {
};
/** <b>キーの状態を取得</b>
 *
 *  <dl>
 *    <dt>shift</dt><dd>shiftキー押下でtrue</dd>
 *    <dt>ctrl</dt><dd>ctrlキー押下でtrue</dd>
 *    <dt>alt</dt><dd>altキー押下でtrue</dd>
 *    <dt>key</dt><dd>押下したキーコード</dd>
 *  </dl>
 *
 * @return hash - { shift, ctrl, alt, key } を返します。<br />
 */
uu.event.key.state = function(evt) {
  return { shift: evt.shiftKey, ctrl: evt.ctrlKey, alt: evt.altKey,
           key: (evt.which) ? evt.which : uuw.keyCode };
};

/** @namespace */
uu.event.mouse = function() {
};
/** <b>マウスの座標情報を取得</b>
 *
 *  <dl>
 *    <dt>x</dt><dd>画面左上からのオフセット幅(スクロール量を含む)</dd>
 *    <dt>y</dt><dd>画面左上からのオフセット幅(スクロール量を含む)</dd>
 *  </dl>
 *
 * @return hash - { x, y } を返します。
 * @see <a href="#posEx">uu.event.mouse.posEx()</a> - マウスの拡張座標情報を取得
 */
uu.event.mouse.pos = function(evt) { // Firefox2, Safari3, Opera9
  return { x: evt.pageX, y: evt.pageY };
};
if (uu.ua.ie) { // IE
  uu.event.mouse.pos = function(evt) {
    var inn = uu.ui.inner();
    return { x: evt.clientX + inn.sw, y: evt.clientY + inn.sh };
  };
}

/** <b>マウスの拡張座標情報を取得</b>
 *
 *  <dl>
 *    <dt>x</dt><dd>画面左上からのオフセット幅(スクロール量を含む)</dd>
 *    <dt>y</dt><dd>画面左上からのオフセット幅(スクロール量を含む)</dd>
 *    <dt>cx</dt><dd>画面左上からのオフセット幅(スクロール量を含まない)</dd>
 *    <dt>cy</dt><dd>画面左上からのオフセット幅(スクロール量を含まない)</dd>
 *    <dt>ox</dt><dd>最寄の要素の左上からの相対座標</dd>
 *    <dt>oy</dt><dd>最寄の要素の左上からの相対座標</dd>
 *  </dl>
 *
 * @return hash - { x, y, cx, cy, ox, oy } を返します。
 * @see <a href="#pos">uu.event.mouse.pos()</a> - マウスの座標情報を取得
 */
uu.event.mouse.posEx = function(evt) { // Firefox2, Safari3
  return { x:  evt.pageX,   y:  evt.pageY,
           cx: evt.clientX, cy: evt.clientY, // Safari2ではclientX,YはpageX,Yと同じ値を返す
           ox: evt.layerX,  oy: evt.layerY };
};
if (uu.ua.opera) { // Opera
  uu.event.mouse.posEx = function(evt) {
    return { x:  evt.pageX,   y:  evt.pageY,
             cx: evt.clientX, cy: evt.clientY,
             ox: evt.offsetX, oy: evt.offsetY };
  };
} else if (uu.ua.ie) { // IE
  uu.event.mouse.posEx = function(evt) {
    var inn = uu.ui.inner();
    return { x: evt.clientX + inn.sw, y: evt.clientY + inn.sh,
             cx: evt.clientX, cy: evt.clientY,
             ox: evt.offsetX, oy: evt.offsetY };
  };
}

/** <b>マウスの座標と要素のオフセット値を取得</b>
 *
 * マウスによるドラッグ操作用のコンビニエンス関数です。<br />
 *
 * 以下の状態を含むhashを返します。<br />
 * x, y: ページ座標(絶対座標)と、マウスカーソルが乗っている要素の原点(左上)とのオフセット値
 *
 * @return hash - { x, y } を返します。
 */
uu.event.mouse.offsetElement = function(evt, elm) {
  var mpos = uu.event.mouse.pos(evt);
  return { x: mpos.x - parseInt(elm.style.left),
           y: mpos.y - parseInt(elm.style.top) };
};

/** <b>マウスクリック, ホイールの状態を取得</b>
 *
 * 以下の状態を含むhashを返します。<br />
 * left:  左クリックでtrue<br />
 * mid:   中クリックでtrue<br />
 * right: 右クリックでtrue<br />
 * click: クリック数, シングルクリックで1, ダブルクリックで2, トリプルクリックで3<br />
 * wheel: マウスホイールを上に回転させると-1を、下に回転させると1を返します<br />
 *
 * @param   event   evt - イベントオブジェクト
 * @return  hash        - { left, mid, right, click, wheel } を返します。
 */
uu.event.mouse.state = function(evt) {
  var rv = { left: 0, mid: 0, right: 0, click: 0, wheel: 0 };
  if (uu.ua.gecko || evt.which) {
    switch (evt.which) {
      case  1: rv.left  = 1; break;
      case  2: rv.mid   = 1; break;
      case  3: rv.right = 1; break;
    }
    rv.click = evt.detail & 0x03; // クリック回数(0～3)
  } else if (uu.ua.ie || evt.button) {
    if (evt.button & 0x1) { rv.left = 1;  }
    if (evt.button & 0x4) { rv.mid = 1;   }
    if (evt.button & 0x2) { rv.right = 1; }
  }
  // wheelDelta: Safari, IE
  // detail: Firefox
  if (evt.wheelDelta || evt.detail) {
    rv.wheel = parseInt(evt.detail ? (evt.detail / 3) : (evt.wheelDelta / -120));
  }
  return rv;
};

})(); // end (function())()
