/** <b>Effect Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

uu.module.effect = {};

/** <b>Effect</b>
 *
 * 各関数は、エフェクト完了でfn(elm, cssText)を呼び出します。<br />
 * cssTextはエフェクト開始時に保存しておいたスタイル情報が格納されます。
 *
 * @class
 */
uu.effect = function() {
};

/** <b>uu.effect._vtm - Effectモジュール専用仮想タイマー</b> */
uu.effect._vtm = new uu.module.virtualTimer(10); // instantiate

/** <b>uu.effect.fade - fade, フェードイン/フェードアウト</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、現在の不透明度が0.5以上ならfadeoutし、0.5未満ならfadeinします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param Element         elm           - 要素を指定します。
 * @param Hash            [param]       - パラメタの指定です。
 * @param Number/String   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param Number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param Number          [param.end]   - 目標とする不透明度を指定します。デフォルトは0.0(完全な透明)または1.0(完全な不透明)です。
 */
uu.effect.fade = function(elm, param /* = { speed: "mid", fn: undefined, begin: current-opacity, end: undefined } */) {
  var cssText = elm.style.cssText, curt, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  curt = uu.css.get.opacity(elm);
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: -1, end: -1 });
  if (pa.begin === -1 || !uu.effect._judgeOpacity(pa.begin)) { pa.begin = curt; }
  if (pa.end   === -1 || !uu.effect._judgeOpacity(pa.end))   { pa.end = (curt < 0.5) ? 1.0 : 0.0; }
  (pa.begin > pa.end) ? uu.effect.fadeout._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn, pa.begin, pa.end) :
                        uu.effect.fadein._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn, pa.begin, pa.end);
};

/** <b>uu.effect.fadein - fadein, フェードイン</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、完全に透明な状態から完全に不透明な状態にアニメーションします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param Element         elm           - 要素を指定します。
 * @param Hash            [param]       - パラメタの指定です。
 * @param Number/String   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param Number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param Number          [param.end]   - 目標とする不透明度を指定します。デフォルトは1.0(完全な不透明)です。
 */
uu.effect.fadein = function(elm, param /* = { speed: "mid", fn: undefined, begin: current-opacity, end: 1.0 } */) {
  var cssText = elm.style.cssText, curt, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  curt = uu.css.get.opacity(elm);
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: curt, end: 1.0 });
  uu.effect.fadein._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn,
                         uu.effect._judgeOpacity(pa.begin) ? pa.begin : 0.0,
                         uu.effect._judgeOpacity(pa.end)   ? pa.end   : 1.0);
}
uu.effect.fadein._impl = function(elm, cssText, speed, fn, begin, end) {
  var delta = 1 / (speed / 10), curt = begin;

  function loop(step) {
    switch (step) {
    case 1: return (curt >= end) ? false : true;
    case 2: uu.css.set.opacity(elm, ((curt += delta) > end) ? (curt = end) : curt); break;
    case 4: fn(elm, cssText); break;
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};

/** <b>uu.effect.fadeout - fadeout, フェードアウト</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、完全に不透明な状態から完全に透明な状態にアニメーションします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param Element         elm           - 要素を指定します。
 * @param Hash            [param]       - パラメタの指定です。
 * @param Number/String   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param Number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param Number          [param.end]   - 目標とする不透明度を指定します。デフォルトは0.0(完全な透明)です。
 */
uu.effect.fadeout = function(elm, param /* = { speed: "mid", fn: undefined, begin: current-opacity, end: 0.0 } */) {
  var cssText = elm.style.cssText, curt, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  curt = uu.css.get.opacity(elm);
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: curt, end: 0.0 });
  uu.effect.fadeout._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn,
                          uu.effect._judgeOpacity(pa.begin) ? pa.begin : 1.0,
                          uu.effect._judgeOpacity(pa.end)   ? pa.end   : 0.0);
}
uu.effect.fadeout._impl = function(elm, cssText, speed, fn, begin, end) {
  var delta = 1 / (speed / 10), curt = begin;

  function loop(step) {
    switch (step) {
    case 1: return (curt <= end) ? false : true;
    case 2: uu.css.set.opacity(elm, ((curt -= delta) < end) ? (curt = end) : curt); break;
    case 4: fn(elm, cssText); break;
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};

/** <b>uu.effect.move - 移動</b>
 *
 * 要素を移動します。<br />
 * x,y,relを省略すると、画面の中央に移動します。
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param Number          [param.x]       - left: 目標位置を絶対座標(px単位)で指定します。省略すると現在のx座標から動きません。
 * @param Number          [param.y]       - top: 目標位置を絶対座標(px単位)で指定します。省略すると現在のy座標から動きません。
 * @param Number          [param.rel]     - x,yを相対座標として評価する場合にtrueを指定します。デフォルトはfalse(絶対座標指定)です。
 *                                          rel=true,x=100,y=100とすると、現在を基準とした+100px,+100pxの位置に要素が移動します。
 */
uu.effect.move = function(elm, param /* = { speed: "mid", fn: undefined, x: current-left, y: current-top, rel: false } */) {
  var cssText = elm.style.cssText, curt, pa, inn = uu.ui.inner();
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  curt = uu.ui.element(elm);
  if (param && "rel" in param && param.rel) { // 相対指定
    pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, x: 0, y: 0 });
    pa.x += curt.x;
    pa.y += curt.y;
  } else { // 絶対指定
    if (!param || (!("x" in param) && !("y" in param))) { // centering
      curt.x = (inn.iw - curt.cw) / 2;
      curt.y = (inn.ih - curt.ch) / 2;
    }
    pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, x: curt.x, y: curt.y });
  }
  uu.effect.move._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn, pa.x, pa.y);
};
uu.effect.move._impl = function(elm, cssText, speed, fn, x, y) { // x, yは絶対座標で指定
  var delataBase = 500 / (speed / 10), curt = uu.ui.element(elm),
      delta = { x: (curt.x == x) ? 0 : (curt.x > x) ? -delataBase : delataBase,
                y: (curt.y == y) ? 0 : (curt.y > y) ? -delataBase : delataBase };
  if (curt.x === x && curt.y === y) { fn(elm, cssText); return; }
  function loop(step) {
    switch (step) {
    case 1: return (!delta.x && !delta.y) ? false : true;
    case 2: curt.x += delta.x, curt.y += delta.y;
            if ((delta.x < 0 && curt.x <= x) || (delta.x > 0 && curt.x >= x)) {
              curt.x = x, delta.x = 0;
            }
            if ((delta.y < 0 && curt.y <= y) || (delta.y > 0 && curt.y >= y)) {
              curt.y = y, delta.y = 0;
            }
            uu.css.set(elm, { left: parseInt(curt.x), top: parseInt(curt.y) });
            break;
    case 4: fn(elm, cssText); break;
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};

/** <b>uu.effect.scale - スケールアップ/ダウン</b>
 *
 * 要素を拡大/縮小します。<br />
 * アンカーにより拡大縮小の基点を指定できます。<br />
 * 要素の現在のサイズより目標が大きければ拡大し、小さければ縮小します。
 * 現在のサイズと目標値が同じなら何もしません。
 * <pre class="eg">
 *  8---1---2
 *  |       |
 *  7   0   3   アンカー(anchor)の指定
 *  |       |
 *  6---5---4
 * </pre>
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param Number          [param.anchor]  - アンカーを0～8の数値( 0[中心], 1[北]～8[北西] )で指定します。デフォルトは0です。
 * @param Number          [param.w]       - width: 幅の目標値をpx単位で指定します。省略すると現在の幅を使用します。
 * @param Number          [param.h]       - height: 高さの目標値をpx単位で指定します。省略すると現在の高さを使用します。
 */
uu.effect.scale = function(elm, param /* = { speed: "mid", fn: undefined, anchor: 0, w: current-width, h: current-height } */) {
  var cssText = elm.style.cssText, curt, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  curt = uu.ui.element(elm);
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, anchor: 0, w: curt.cw, h: curt.ch });
  uu.effect.scale._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn, pa.anchor, pa.w, pa.h);
};
uu.effect.scale._impl = function(elm, cssText, speed, fn, anchor, w, h) {
  var delataBase = 500 / (speed / 10), curt = uu.ui.element(elm),
      delta = { x: 0, w: (curt.cw == w) ? 0 : (curt.cw > w) ? -delataBase : delataBase,
                y: 0, h: (curt.ch == h) ? 0 : (curt.ch > h) ? -delataBase : delataBase };
  switch (anchor) {
  case 0: delta.x -= delta.w / 2; delta.y -= delta.h / 2; break;
  case 1:                     delta.w && (delta.x = -(delta.w / 2)); break;
  case 2: delta.x -= delta.w; break;
  case 3: delta.x -= delta.w; delta.h && (delta.y = -(delta.h / 2)); break;
  case 4: delta.x -= delta.w; delta.y -= delta.h; break;
  case 5: delta.y -= delta.h; delta.w && (delta.x = -(delta.w / 2)); break;
  case 6: delta.y -= delta.h; break;
  case 7:                     delta.h && (delta.y = -(delta.h / 2)); break;
  }
  if (curt.cw === w && curt.ch === h) { fn(elm, cssText); return; }
  function loop(step) {
    switch (step) {
    case 1: return (!delta.x && !delta.y && !delta.w && !delta.h) ? false : true;
    case 2: curt.x += delta.x, curt.cw += delta.w;
            curt.y += delta.y, curt.ch += delta.h;
            if ((delta.w < 0 && curt.cw <= w) || (delta.w > 0 && curt.cw >= w)) {
              curt.cw = w, delta.x = 0, delta.w = 0;
            }
            if ((delta.h < 0 && curt.ch <= h) || (delta.h > 0 && curt.ch >= h)) {
              curt.ch = h, delta.y = 0, delta.h = 0;
            }
            uu.css.set(elm, { left: parseInt(curt.x), top: parseInt(curt.y),
                              width: parseInt(curt.cw), height: parseInt(curt.ch) });
            if (!parseInt(curt.cw) || !parseInt(curt.ch)) { // size: 0 で要素を隠す
              uu.css.set(elm, { visibility: "hidden" }); // 隠さないと、ボーダーボックスが見えてしまう
            } else {
              uu.css.set(elm, { visibility: "visible" });
            }
            break;
    case 4: fn(elm, cssText); break;
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};

/** <b>uu.effect.puff - ぱふ</b>
 *
 * 要素のサイズを拡大しながら透明度を高くします。fadeout + scaleのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.puff = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.puff._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.puff._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.ui.element(elm);
  function next() {
    (++run === 2) && fn(elm, cssText);
  }
  uu.effect.scale._impl(elm, "", speed, next, 0, curt.cw * 2.5, curt.ch * 2.5);
  uu.effect.fadeout._impl(elm, "", Math.round(speed / 4), next, uu.css.get.opacity(elm), 0);
};

/** <b>uu.effect.dropOut - ドロップアウト</b>
 *
 * 要素を落下させながら透明度を高くします。fadeout + moveのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.dropOut = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.dropOut._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.dropOut._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.ui.element(elm);
  function next() {
    (++run === 2) && fn(elm, cssText);
  }
  uu.effect.move._impl(elm, "", speed, next, curt.x, curt.y + 200);
  uu.effect.fadeout._impl(elm, "", Math.round(speed / 4), next, uu.css.get.opacity(elm), 0);
};

/** <b>uu.effect.fold - 折りたたむ</b>
 *
 * 左上を基準に高さを縮め、20pxで幅を縮め、最後は0x0にします。scaleのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.fold = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.fold._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.fold._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.ui.element(elm);
  function next() {
    switch (++run) {
    case 1: uu.effect.scale._impl(elm, "", speed, next, 8, 0, 20); break;
    case 2: uu.effect.scale._impl(elm, "", speed, next, 8, 0, 0); break;
    case 3: uu.css.set(elm, { visibility: "hidden" }); // IE用
            fn(elm, cssText);
    }
  }
  uu.effect.scale._impl(elm, "", speed, next, 8, curt.cw, 20);
};

/** <b>uu.effect.shake - 揺らぎ</b>
 *
 * 左右に揺らぎます。moveのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.shake = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.shake._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.shake._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.ui.element(elm);
  function next() {
    switch (++run) {
    case 1: uu.effect.move._impl(elm, "", Math.round(speed / 2), next, curt.x + 20, curt.y); break;
    case 2: uu.effect.move._impl(elm, "", Math.round(speed / 2), next, curt.x - 20, curt.y); break;
    case 3: uu.effect.move._impl(elm, "", Math.round(speed / 2), next, curt.x, curt.y); break;
    case 4: fn(elm, cssText);
    }
  }
  uu.effect.move._impl(elm, "", Math.round(speed / 2), next, curt.x - 20, curt.y);
};

/** <b>uu.effect.shrink - シュリンク</b>
 *
 * 要素の中央に向かって縮小します、最後は0x0にします。scaleのエリアスです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.shrink = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  uu.effect.scale(elm, { speed: param.speed, fn: param.fn, anchor: 0, w: 0, h: 0 });
};

/** <b>uu.effect.glow - 中心から登場</b>
 *
 * 要素の中央から登場します。scaleのエリアスです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.glow = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.glow._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.glow._impl = function(elm, cssText, speed, fn) {
  var curt = uu.ui.element(elm);
  if (uu.css.get(elm, "display") === "none") {
    // display:noneの要素は位置やサイズが全てゼロになるため、スタイルプロパティから情報を取得する
    curt = { x: parseFloat(elm.style.left), y: parseFloat(elm.style.top),
             cw: parseFloat(elm.style.width), ch: parseFloat(elm.style.height) };
  }
  uu.css.set(elm, { left: -2000, top: -2000,                 // 2. 画面外に吹っ飛ばしてから可視化
                    overflow: "hidden", visibility: "visible", display: "show" });
  uu.css.set(elm, { left: curt.x + Math.round(curt.cw / 2),
                    top:  curt.y + Math.round(curt.ch / 2),
                    width: 1, height: 1 }); // 3. 幅,高さ1pxの状態で、画面内に戻す
  uu.effect.scale._impl(elm, cssText, speed, fn, 0, curt.cw, curt.ch); // 元の大きさに戻す
};

/** <b>uu.effect.blindUp - ブラインドアップ</b>
 *
 * 上辺を固定し高さを減らします。scaleのコンビネーションです。<br />
 * エフェクトが完了すると、要素を見えない状態(display: "hide", visibility: "hidden")にしてから、
 * 元のサイズに戻します。
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.blindUp = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.blindUp._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.blindUp._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.ui.element(elm);
  function next() {
    switch (++run) {
    case 1: uu.css.set(elm, { width: curt.cw, height: curt.ch, display: "hide", visibility: "hidden" });
            fn(elm, cssText);
    }
  }
  uu.effect.scale._impl(elm, "", speed, next, 8, curt.cw, 1);
};

/** <b>uu.effect.blindDown - ブラインドダウン</b>
 *
 * 上辺を固定し高さを増やします。scaleのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.blindDown = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.blindDown._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.blindDown._impl = function(elm, cssText, speed, fn) {
  var curt = uu.ui.element(elm);
  if (uu.css.get(elm, "display") === "none") {
    // display:noneの要素は位置やサイズが全てゼロになるため、スタイルプロパティから情報を取得する
    curt = { x: parseFloat(elm.style.left), y: parseFloat(elm.style.top),
             cw: parseFloat(elm.style.width), ch: parseFloat(elm.style.height) };
  }
  uu.css.set(elm, { left: -2000, top: -2000,                 // 2. 画面外に吹っ飛ばしてから可視化
                    overflow: "hidden", visibility: "visible", display: "show" });
  uu.css.set(elm, { left: curt.x, top: curt.y, height: 1 }); // 3. 高さ1pxの状態で、画面内に戻す
  uu.effect.scale._impl(elm, cssText, speed, fn, 8, curt.cw, curt.ch); // 元の大きさに戻す
};

/** <b>uu.effect.pulsate - 点滅</b>
 *
 * 不透明度を上下させ点滅しているように見せます。fadeのコンビネーションです。<br />
 *
 * @param Element         elm             - 要素を指定します。
 * @param Hash            [param]         - パラメタの指定です。
 * @param Number/String   [param.speed]   - 描画完了までの時間を、ms単位の数値か、
 *                                          文字列("now", "quick", "fast", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param Function        [param.fn]      - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 */
uu.effect.pulsate = function(elm, param /* = { speed: "mid", fn: undefined } */) {
  var cssText = elm.style.cssText, pa;
  uu.css.set(elm, { overflow: "hidden", visibility: "visible", display: "show" });
  pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute });
  uu.effect.pulsate._impl(elm, cssText, uu.effect._speedSanitize(pa.speed), pa.fn);
};
uu.effect.pulsate._impl = function(elm, cssText, speed, fn) {
  var run = 0, curt = uu.css.get.opacity(elm);
  function next() {
    switch (++run) {
    case 1: uu.effect.fadein._impl( elm, "", Math.ceil(speed / 4), next, 0.0, 1.0); break;
    case 2: uu.effect.fadeout._impl(elm, "", Math.ceil(speed / 4), next, 1.0, 0.0); break;
    case 3: uu.effect.fadein._impl( elm, "", Math.ceil(speed / 4), next, 0.0, 1.0); break;
    case 4: uu.effect.fadeout._impl(elm, "", Math.ceil(speed / 4), next, 1.0, 0.0); break;
    case 5: uu.effect.fadein._impl( elm, "", Math.ceil(speed / 4), next, 0.0, curt); break;
    case 6: fn(elm, cssText);
    }
  }
  uu.effect.fadeout._impl(elm, "", Math.ceil(speed / 4), next, curt, 0.0);
};

/** <b>uu.effect._frame - エフェクトフレーム</b>
 *
 * エフェクトはbeginからendまでの各ステップで構成されており、beforeとafterの間は無限ループします。<br /><br />
 *
 * <pre>
 * begin(0)　→　before(1)　→　effect(2)　→　after(3)　→　end(4)
 * 　　　　　　　　　↑　　　　　　　　　　　　　│
 * 　　　　　　　　　└─────────────┘
 * </pre>
 *  <table>
 *  <tr><th>step番号</th><th>内容</th></tr>
 *  <tr><td>0</td><td>BEGIN: 処理開始       </td></tr>
 *  <tr><td>1</td><td>BEFORE: effect実行前  </td></tr>
 *  <tr><td>2</td><td>EFFECT: effect本処理  </td></tr>
 *  <tr><td>3</td><td>AFTER: effect実行後   </td></tr>
 *  <tr><td>4</td><td>END: 処理終了         </td></tr>
 *  </table>
 * 各ステップで、fn(step番号)を呼び出します。<br />
 * before,effect,afterの各ステップでfalseを返すとendに移行します。<br />
 *
 * @param Element         elm     - 要素を指定します。
 * @param Number          speed   - 速度の指定です。単位はmsです。
 * @param Function        fn      - コールバック関数を指定します。
 */
uu.effect._frame = function(elm, delay, fn) {
  var run = 0, vtid = 0;
  function finish() { !run++ && (uu.effect._vtm.suspend(vtid), fn(4));  }
  function loop()   { (!run && fn(1) && fn(2) && fn(3)) ? 0 : finish(); }
  fn(0);
  vtid = uu.effect._vtm.set(loop, delay);
};

/** <b>uu.effect._judgeOpacity - 不透明度の検査</b> */
uu.effect._judgeOpacity = function(opacity) {
  return (uu.isN(opacity) && opacity >= 0.0 && opacity <= 1.0);
}

/** <b>uu.effect._speed - デフォルト速度(default speed)</b>
 * @type hash
 */
uu.effect.speed = { now: 1, quick: 250, fast: 400, mid: 600, slow: 2000 };

uu.effect._speedSanitize = function(speed) {
  if (!speed) { return uu.effect.speed["mid"]; }
  return isNaN(speed) ? uu.effect.speed[(speed in uu.effect.speed) ? speed : "mid"] : parseInt(speed);
};

})(); // end (function())()
