/** <b>Canvas Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.canvas = {};

/** <b>キャンバス要素を動的に生成する(create dynamic canvas)</b>
 *
 * キャンバス要素を動的に生成します。
 * キャンバスはposition: absolute, display: noneの状態で生成されます。
 *
 * @param number  width             - canvasの幅をpx単位で指定します。デフォルトは300です。
 * @param number  height            - canvasの高さをpx単位で指定します。デフォルトは300です。
 * @param hash    [style]           - スタイルの指定です。
 * @param number  [style.left]      - canvasのx座標をpx単位で指定します。デフォルトは0です。
 * @param number  [style.top]       - canvasのy座標をpx単位で指定します。デフォルトは0です。
 * @param number  [style.display]   - canvasの表示方法(display)を指定します。デフォルトは"none"です。
 * @param number  [style.position]  - canvasの配置(position)を指定します。デフォルトは"absolute"です。
 * @return element                  - 生成したcanvas要素を返します。
 */
uu.canvas.create = function(width /* = 300 */, height /* = 300 */, style /* = { x: 0, y: 0, w: 300, h: 300, display: "none", position: "absolute" } */) {
  style = uu.mix.param(style || {}, { left: 0, top: 0, display: "none", position: "absolute" });
  var e = uud.createElement("canvas");
  uu.mix(e, { width: width || 300, height: height || 300 });
  uu.css.set(e, style);
  return e;
};

/** <b>コンテキストの取得</b>
 *
 * コンテキストを取得します。excanvas.jsで動的に生成したcanvasの初期化も行います。
 *
 * @param  element  elm    - canvasオブジェクトを指定します。
 * @param  string   type   - コンテキストタイプを指定します。デフォルトは"2d"です。
 * @return context           コンテキストを返します。
 */
uu.canvas.context = function(elm, type /* = "2d" */) {
  type = type || "2d";
  return (!uu.ua.ie) ? elm.getContext(type)
                     : G_vmlCanvasManager.initElement(elm).getContext(type);
};

/** <b>グリッドを描画</b>
 *
 * グリッドを描画します。
 *
 * <pre class="eg">
 *  var canvas = document.getElementById("hoge");
 *  var ctx = canvas.getContext("2d");
 *  uu.canvas.drawGrid(ctx, function() {
 *    ;
 *  });
 * </pre>
 *
 * @param context2d ctx   - 2d contextを指定します。
 * @param function  fn    - 描画完了で呼び出す関数を指定します。デフォルトはundefinedです。
 * @param number    size  - グリッドサイズを指定します。単位はpxです。デフォルトは64です。
 * @param string    color - 色を指定します。デフォルトは"gray"です。
 */
uu.canvas.drawGrid = function(ctx, fn /* = undefined */, size /* = 64 */, color /* = "gray" */) {
  fn = fn || uu.mute;
  size = size || 64;
  color = color || "gray";
  var x, y, url = uu.config.imagePath + "uu.module.canvas.grid.gif";

  uu.image.preload(url, function(code, _url, _img) {
    if (code && !uu.ua.ie) {
      ctx.beginPath();
      ctx.fillStyle = ctx.createPattern(_img, "");
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fill();
    };
    ctx.beginPath();
    ctx.strokeStyle = color;
    for (y = size; y < ctx.canvas.height; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
    }
    for (x = size; x < ctx.canvas.width; x += size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }
    ctx.stroke();
    fn();
  });
};


})(); // end (function())()
