/** <b>Effect Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

uu.module.effect = {};

/** <b>Effect</b>
 *
 * @class
 */
uu.effect = function() {
};

/** <b>uu.effect._vtm - Effectモジュール専用仮想タイマー</b> */
uu.effect._vtm = new uu.module.virtualTimer(10); // instantiate

/** <b>uu.effect._speed - Speed set</b> */
uu.effect._speed = { now: 1, quick: 250, fast: 500, mid: 1000, slow: 4000 };


/** <b>uu.effect.show - 要素の表示</b> */
uu.effect.show = function(elm, param /* = { speed: "now", fn: undefined } */) {
  var ss = uu.css.get(elm),
      pa = uu.mix.param(param || {}, { speed: "now", fn: uu.mute });

  if (pa.speed === "now") {
    if (ss.visibility === "hidden" || ss.display === "none") {
      uu.css.set(elm, { display: "show", visibility: "visible" });
    }
    return;
  }
  uu.effect.show._impl(elm, pa.speed, pa.fn)
};
uu.effect.show._impl = function(elm, speed, fn) {
  // var me = delta, curt = uu.css.get.height(elm), end = 0;
  // ...
};

/** <b>uu.effect.hide - 要素の非表示</b> */
uu.effect.hide = function(elm, param /* = { speed: "now" } */) {
 // ...
};

/** <b>uu.effect.fade - fade, フェードイン/フェードアウト</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、現在の不透明度が0.5以上ならfadeoutし、0.5未満ならfadeinします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param element         elm           - 要素を指定します。
 * @param hash            [param]       - パラメタの指定です。
 * @param number/string   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("quick", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param number          [param.end]   - 目標とする不透明度を指定します。デフォルトは0.0(完全な透明)または1.0(完全な不透明)です。
 */
uu.effect.fade = function(elm, param /* = { speed: "mid", fn: undefined, begin: current-opacity, end: undefined } */) {
  var curt = uu.css.get.opacity(elm),
      pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: -1, end: -1 });
  if (pa.begin === -1 || !uu.effect._judgeOpacity(pa.begin)) { pa.begin = curt; }
  if (pa.end   === -1 || !uu.effect._judgeOpacity(pa.end))   { pa.end = (curt < 0.5) ? 1.0 : 0.0; }
  uu.effect.show(elm);
  (pa.begin > pa.end) ? uu.effect.fadeout._impl(elm, pa.speed, pa.fn, pa.begin, pa.end) :
                        uu.effect.fadein._impl(elm, pa.speed, pa.fn, pa.begin, pa.end);
};

/** <b>uu.effect.fadein - fadein, フェードイン</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、完全に透明な状態から完全に不透明な状態にアニメーションします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param element         elm           - 要素を指定します。
 * @param hash            [param]       - パラメタの指定です。
 * @param number/string   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("quick", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param number          [param.end]   - 目標とする不透明度を指定します。デフォルトは1.0(完全な不透明)です。
 */
uu.effect.fadein = function(elm, param /* = { speed: "quick", fn: undefined, begin: current-opacity, end: 1.0 } */) {
  var curt = uu.css.get.opacity(elm),
      pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: curt, end: 1.0 });
  uu.effect.show(elm);
  uu.effect.fadein._impl(elm, pa.speed || 1, pa.fn, uu.effect._judgeOpacity(pa.begin) ? pa.begin : 0.0,
                                                    uu.effect._judgeOpacity(pa.end)   ? pa.end   : 1.0);
}
uu.effect.fadein._impl = function(elm, speed, fn, begin, end) {
  var me = uu.effect.fadein, delta, curt = begin;
  (!uu.isN(speed)) && (speed = me._speed[(speed in me._speed) ? speed : "mid"]);
  delta = 1 / (speed / 10);

  function loop(step) {
    switch (step) {
    case 1: if (curt >= end) { return false; }
            break;
    case 2: uu.css.set.opacity(elm, ((curt += delta) > end) ? (curt = end) : curt);
            break;
    case 4: fn();
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};
uu.effect.fadein._speed = { quick: 250, mid: 1000, slow: 4000 };

/** <b>uu.effect.fadeout - fadeout, フェードアウト</b>
 *
 * 指定された不透明度になるようにアニメーションします。<br />
 * beginとendを省略すると、完全に不透明な状態から完全に透明な状態にアニメーションします。<br />
 * 要素が非表示になっている場合は、まず可視状態にしてからアニメーションを行います。
 *
 * @param element         elm           - 要素を指定します。
 * @param hash            [param]       - パラメタの指定です。
 * @param number/string   [param.speed] - 描画完了までの時間を、ms単位の数値か、
 *                                        文字列("quick", "mid", "slow")で指定します。デフォルトは"mid"です。
 * @param function        [param.fn]    - エフェクト完了でコールバックするメソッドを指定します。省略可能です。
 * @param number          [param.begin] - 初期不透明度を指定します。デフォルトは現在の不透明度です。
 * @param number          [param.end]   - 目標とする不透明度を指定します。デフォルトは0.0(完全な透明)です。
 */
uu.effect.fadeout = function(elm, param /* = { speed: "quick", fn: undefined, begin: current-opacity, end: 0.0 } */) {
  var curt = uu.css.get.opacity(elm),
      pa = uu.mix.param(param || {}, { speed: "mid", fn: uu.mute, begin: curt, end: 0.0 });
  uu.effect.show(elm);
  uu.effect.fadeout._impl(elm, pa.speed || 1, pa.fn, uu.effect._judgeOpacity(pa.begin) ? pa.begin : 1.0,
                                                     uu.effect._judgeOpacity(pa.end)   ? pa.end   : 0.0);
}
uu.effect.fadeout._impl = function(elm, speed, fn, begin, end) {
  var me = uu.effect.fadein, delta, curt = begin;
  (!uu.isN(speed)) && (speed = me._speed[(speed in me._speed) ? speed : "mid"]);
  delta = 1 / (speed / 10);

  function loop(step) {
    switch (step) {
    case 1: if (curt <= end) { return false; }
            break;
    case 2: uu.css.set.opacity(elm, ((curt -= delta) < end) ? (curt = end) : curt);
            break;
    case 4: fn();
    }
    return true;
  }
  uu.effect._frame(elm, 10, loop);
};
uu.effect.fadeout._speed = { quick: 250, mid: 1000, slow: 4000 };

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
 * @param element         elm     - 要素を指定します。
 * @param number          speed   - 速度の指定です。単位はmsです。
 * @param function        fn      - コールバック関数を指定します。
 */
uu.effect._frame = function(elm, delay, fn) {
  var run = 0, vtid = 0;
  function finish() { !run++ && (uu.effect._vtm.suspend(vtid), fn(4));         }
  function loop()   { (!run && fn(1) && fn(2) && fn(3)) ? 0 : finish(); }
  fn(0);
  vtid = uu.effect._vtm.set(loop, delay);
};

/** uu.effect._judgeOpacity - 不透明度の検査 */
uu.effect._judgeOpacity = function(opacity) {
  return (uu.isN(opacity) && opacity >= 0.0 && opacity <= 1.0);
}

})(); // end (function())()
