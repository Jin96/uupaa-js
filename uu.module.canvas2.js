/** <b>Canvas Module2</b>
 *
 * CanvasAPIをラップし、マクロの再生記録とペン座標の履歴機能を持たせたモジュールで、<br />
 * 主にデバッグ用です。
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

uu.module.canvas2 = {};

/** <b>Canvas 2D Context for Debug</b>
 *
 * 検証が終わっていないので、このモジュールは使用しないでください
 * @class
 */
uu.module.context2dDebug = uu.basicClass();
uu.module.context2dDebug.prototype = {

  /** <b>uu.module.context2dDebug.construct - 初期化</b>
   * @param context2d context - 2Dコンテキストを指定します。
   */
  construct: function(context) {
    this.ctx = context;
    this.stackSize = 0;   // スタック数
    this.zoom = [1, 1];   // ズーム比率
    this.offset = [0, 0]; // オフセット
    this.rotate = 0;      // 回転
    this.clip = false;    // クリップ
    // ---
    this.mode = 0; /* 0: 通常, 1: rec中, 2: play中 */
    this.historyIndex = 0;
    this.cmdHistory = [[]]; // コマンド履歴
    this.penHistory = [[]]; // ペン座標履歴
    this.x = 0; /* 現在のペン座標(カレントのサブパスの終点) */
    this.y = 0; /* 現在のペン座標(カレントのサブパスの終点) */
  },
  /** <b>uu.module.context2dDebug.info - コンテキストの情報を取得</b>
   *
   *  <dl>
   *    <dt>canvas</dt><dd>キャンバスオブジェクト</dd>
   *    <dt>context</dt><dd>コンテキスト</dd>
   *    <dt>w</dt><dd>キャンバスの幅</dd>
   *    <dt>h</dt><dd>キャンバスの高さ</dd>
   *    <dt>mix</dt><dd>合成方法</dd>
   *    <dt>alpha</dt><dd>アルファブレンド</dd>
   *    <dt>pos { x, y }</dt><dd>現在のペン座標(カレントパスの終点)</dd>
   *    <dt>zoom { x, y }</dt><dd>拡大倍率</dd>
   *    <dt>offset { x, y }</dt><dd>オフセット</dd>
   *    <dt>rotate</dt><dd>回転度数</dd>
   *    <dt>clip</dt><dd>クリッピング中ならtrue</dd>
   *    <dt>stackSize</dt><dd>スタック数</dd>
   *    <dt>mode</dt><dd>モード</dd>
   *    <dt>penHistoryLength</dt><dd>ペン座標履歴数</dd>
   *    <dt>cmdHistoryLength</dt><dd>コマンド履歴数</dd>
   *  </dl>
   *
   * @return hash - hash { canvas, context, w, h, mix, alpha, pos, stackSize } を返します。
   * @see <a href="context.reset()">context.reset()</a> - コンテキストの初期化
   */
  info: function() {
    return { canvas: this.ctx.canvas, context: this.ctx,
             w: this.ctx.canvas.width, h: this.ctx.canvas.height,
             mix: this.ctx.globalCompositeOperation, alpha: this.ctx.globalAlpha,
             pos: { x: this.x, y: this.y },
             zoom: { x: this.zoom.x, y: this.zoom.y },
             offset: { x: this.offset.x, y: this.offset.y },
             rotate: this.rotate, clip: this.clip,
             stackSize: this.stackSize, mode: this.mode,
             penHistoryLength: this.penHistory.length,
             cmdHistoryLength: this.cmdHistory.length
           };
  },

  /** <b>uu.module.context2dDebug.push - コンテキストの状態をスタックに保存。</b>
   * @return this - thisを返します。
   */
  push: function() {
    this.ctx.save();
    ++this.stackSize;
    return this;
  },
  /** <b>uu.module.context2dDebug.pop - コンテキストの状態をスタックから復元。</b>
   * @return this - thisを返します。
   */
  pop: function() {
    if (this.stackSize) {
      --this.stackSize;
      this.ctx.restore();
    }
    return this;
  },
  /** <b>uu.module.context2dDebug.reset - コンテキストの初期化</b>
   * @return this - thisを返します。
   */
  reset: function() {
    this.ctx.strokeStyle = "black";
    this.ctx.fillStyle = "black";
    this.ctx.lineWidth = 1;
    this.ctx.lineCap = "butt";
    this.ctx.lineJoin = "miter";
    this.ctx.miterLimit = 10;
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "black";
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalComposite = "source-over";
    // ---
    this.stackSize = 0;
    this.zoom(1, 1);
    this.offset(0, 0); // オフセット
    this.rotate(0); // 回転
    this.clip = false;    // クリップ... クリッピング情報をリセットすべきか?
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.clip();
    this.mode = 0;
    this.historyIndex = 0;
    this.cmdHistory = [[]]; // コマンド履歴
    this.penHistory = [[]]; // 座標履歴
    this.x = 0;
    this.y = 0;
    return this;
  },
  /** <b>uu.module.context2dDebug.toDataURL - data: URIの生成</b>
   *  <dl>
   *    <dt>image/png</dt><dd>png画像, Firefox2+,Safari3+,Opera9+で使用可能</dd>
   *    <dt>image/jpeg</dt><dd>jpg画像, Firefox2+,Safari3+で使用可能</dd>
   *  </dl>
   * @param string type - 画像フォーマットを文字列で指定します。デフォルトは "image/png" です。
   * @return string - data: URIを返します。返された文字列はimg要素のsrcに指定可能です。
   */
  toDataURL: function(type /* = "image/png" */) {
    this.ctx.canvas.toDataURL(type || "image/png");
  },
  /** <b>uu.module.context2dDebug.begin - 座標を記録</b> */
  _posRec: function(x, y) {
    if (this.mode === 1) {
      this.penHistory[this.historyIndex].push([x, y]);
    }
  },
  _cmdRec: function(cmd, params__ /* ... */) {
    if (this.mode === 1) {
      this.cmdHistory[this.historyIndex].push(uu.toArray(arguments));
    }
  },
  /** <b>uu.module.context2dDebug.begin - コマンドの記録</b>
   *
   * コマンドの記録を開始します。
   *
   * @see <a href="#stop">uu.module.context2dDebug.stop()</a> - コマンドの記録停止
   * @see <a href="#play">uu.module.context2dDebug.play()</a> - コマンドの再生
   */
  record: function() {
    this.mode = 1;
    this.penHistory[this.historyIndex] = [];
    this.cmdHistory[this.historyIndex] = [];
  },
  /** <b>uu.module.context2dDebug.begin - コマンドの再生</b>
   *
   * @param function fn - 1step毎にコールバックする関数を指定します。デフォルトはundefinedです。
   * @see <a href="#recode">uu.module.context2dDebug.recode()</a> - コマンドの記録
   */
  play: function(fn /* = undefined */) {
    fn = fn || uu.mute;
    this.mode = 2;
    // [ cmd, param1, param2, paramx... ]
    this.cmdHistory[this.historyIndex].forEach(function(v) {
      var cmd = v[this.memid], param = v.slice(1);
      if (cmd in this) {
        this.cmd.apply(this, param);
      }
      fn();
    });
  },
  /** <b>uu.module.context2dDebug.stop - コマンドの記録を停止</b>
   *
   * コマンドの記録を停止します。
   *
   * @see <a href="#recode">uu.module.context2dDebug.recode()</a> - コマンドの記録
   * @see <a href="#play">uu.module.context2dDebug.play()</a> - コマンドの再生
   */
  stop: function() {
    this.mode = 0;
  },
  ctx: function() {
    return this.ctx;
  },
  /** <b>uu.module.context2dDebug.begin - 合成方法を指定</b>
   *
   *  <dl>
   *    <dt>source-atop</dt><dd></dd>
   *    <dt>source-in</dt><dd></dd>
   *    <dt>source-out</dt><dd></dd>
   *    <dt>source-over</dt><dd></dd>
   *    <dt>destination-atop</dt><dd></dd>
   *    <dt>destination-in</dt><dd></dd>
   *    <dt>destination-out</dt><dd></dd>
   *    <dt>destination-over</dt><dd></dd>
   *    <dt>lighter</dt><dd></dd>
   *    <dt>copy</dt><dd></dd>
   *    <dt>xor</dt><dd></dd>
   *  </dl>
   * @return this - thisを返します。
   */
  mix: function(method) {
    this._cmdRec("mix", method);
    return this._mix(method);
  },
  /** <b>uu.module.context2dDebug.begin - アルファブレンドの値を指定</b>
   *
   * @param number alpha - アルファブレンド値を0.0～1.0の値で指定します。不透明度(opacity)と同様です。
   * @return this - thisを返します。
   */
  alpha: function(alpha) {
    this._cmdRec("alpha", alpha);
    return this._alpha(alpha);
  },
  /** <b>uu.module.context2dDebug.begin - クリア</b>
   * 指定した範囲をクリアします。引数を全て省略すると全体をクリアします。
   *
   * @param number [x] - x座標を指定します。
   * @param number [y] - y座標を指定します。
   * @param number [w] - 幅を指定します。負の値も指定可能です。
   * @param number [h] - 高さを指定します。負の値も指定可能です。
   * @return this - thisを返します。
   */
  clear: function(x, y, w, h) {
    this._cmdRec("clear", x, y, w, h);
    return this._clear(x, y, w, h);
  },
  /** <b>uu.module.context2dDebug.begin - サブパスの初期化と開始</b>
   *
   * コンテキストのサブパスを全てクリアし、新しいサブパスを開始します。<br />
   * x,y座標が指定されている場合は、その座標まで移動しサブパスの出発点とします。
   *
   * <pre class="eg">
   * var ctx = new uu.module.context2dDebug(uu.canvas.context(uu.canvas.create()));
   * ctx.begin(100, 100, 1).  // サブパス開始, (100,100)に移動
   *     line(20, 0).         // (120, 100)に線を引きながら移動
   *     line(-20, 0).        // ( 90, 120)に線を引きながら移動
   *     close(200, 100, 1).  // サブパスをクローズ(暗黙で100,100と90,120の間に線が引かれる)し、(200,100)に移動
   *     line(10, 20).        // (210, 120)に線を引きながら移動
   *     line(-20, 0).        // (190, 120)に線を引きながら移動
   *     stroke();            // サブパスを描画
   * </pre>
   *
   * @param number [x] - 移動先のx絶対座標を指定します。デフォルトはundefinedです。
   * @param number [y] - 移動先のy絶対座標を指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  begin: function(x /* = undefined */, y /* = undefined */) { 
    this._cmdRec("begin", x, y);
    return this._begin(x, y);
  },
  /** <b>uu.module.context2dDebug.close - 現在のサブパスを閉じ、新しいサブパスを開始</b>
   *
   * カレントのサブパスを閉じ、新しいサブパスを開始します。<br />
   * x,y座標が指定されている場合は、その座標まで移動しサブパスの出発点とします。
   *
   * @param number [x] - 移動先のx座標を指定します。デフォルトはundefinedです。
   * @param number [y] - 移動先のy座標を指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  close: function(x /* = undefined */, y /* = undefined */) {
    this._cmdRec("close", x, y);
    return this._close(x, y);
  },
  /** <b>uu.module.context2dDebug.move - サブパスの移動</b>
   *
   * カレントのサブパスを移動させます。<br />
   * move()で移動すると、線として描画されません。
   *
   * @param number x - 移動先のx座標を指定します。
   * @param number y - 移動先のy座標を指定します。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  move: function(x, y) {
    this._cmdRec("move", x, y);
    return this._move(x, y);
  },
  /** <b>uu.module.context2dDebug.line - 直接を引きつつサブパスを移動</b>
   *
   * カレントのサブパスをx,y座標に移動させ、始点から終点まで線を引きます。<br />
   * line()で移動するとstoroke()で線が描画されます。<br />
   * サブパスが存在しない場合は、何もしません。
   *
   * @param array point - 移動先のx,y座標を指定します。<br />
   *                      [x1, y1, x2, y2, ... ] 形式で複数の頂点を指定できます。
   * @param hash [style] - ラインスタイルを指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  line: function(point, style /* = undefined */) {
    if (!uu.isA(point) || poing.length % 2) { throw TypeError("uu.module.context2dDebug.line(point)"); }
    this._cmdRec("line", point, style);
    return this._line(point, style);
  },
  /** <b>uu.module.context2dDebug.arcLine - 円弧のサブパスを作成しパスを移動する</b>
   *
   * カレントのサブパスの終点(ペン座標)から(x1,y1)までの直線をAとし、<br />
   * (x1,y1)から(x2,y2)までの直線をBとした場合に、AとBに接する円弧のパスを作成します。<br />
   * また、サブパスの終点から円弧の始点まで直線を引きます。<br />
   * カレントのサブパスが存在しない場合は、何もしません。<br />
   *
   * Safari以外のブラウザでは描画結果が仕様どおりに描画されないため、このメソッドは使用不能です。<br />
   *
   * <pre class="eg">
   * 　　 b　c
   * 　　／⌒＼
   * 　／A 　 B＼
   *  a　　　　　d
   * var ctx = new uu.module.context2dDebug(uu.canvas.context(uu.canvas.create()));
   * ctx.begin(0, 200, 1).                      // サブパス開始, a(0,200)に移動
   *     arcLine([100, 100, 200, 200], 1, 40).  // a(0,200)から円弧の始点(約75,75)まで直線を引き、
   *                                            // 円弧を作成する
   *     line(200,200, 1).                      // 円弧の終点(約125,125)からd(200,200)までの直線を引く
   *     stroke();                              // サブパスを描画
   * </pre>
   *
   * @param array point - 移動先のx,y座標を指定します。<br />
   *                      [x1, y1, x2, y2, ... ] 形式で複数の頂点を指定できます。
   * @param number [r] - 半径を指定します。デフォルトは100です。
   * @param hash [style] - ラインスタイルを指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   * @ignore
   */
  arcLine: function(point, r /* = 100 */, style /* = undefined */) {
    if (!uu.isA(point) || poing.length % 2) { throw TypeError("uu.module.context2dDebug.arcLine(point)"); }
    this._cmdRec("arcLine", point, r, style);
    return this._arcTo(point, r, style);
  },
  /** <b>uu.module.context2dDebug.fill - サブパスを塗りつぶす</b>
   *
   * サブパスを塗りつぶします。<br />
   * サブパスが閉じていない場合(close)はサブパスを一旦閉じてから塗りつぶします。
   * (塗りつぶしが終わったらサブパスを元の閉じていない状態に戻します。)<br /><br />
   *
   * wireにtrueを指定すると、サブパスに沿ってワイヤーを描画します。
   *
   * @param number/bool [wire] - ワイヤーを描画する場合はtrueか1を指定します。塗りつぶす場合はfalseか0を指定します。
   *                             デフォルトは0です。
   * @param fillStyle/strokeStyle [style] - フィルスタイル(塗りつぶし用)または、
   *                                        ストロークスタイル(ワイヤー用)を指定します。
   *                                        デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  fill: function(wire /* = false */, style /* = undefined */) {
    this._cmdRec("fill", wire, style);
    if (wire) {
      return this._stroke(style);
    }
    return this._fill(style);
  },
  /** <b>uu.module.context2dDebug.rect - スクエア(四角)のサブパスを追加</b>
   *
   * (x,y)を基点にスクエア(四角)状のサブパスを作成します。<br />
   * 次に作成したサブパスを閉じ(close)、<br />
   * 新しいサブパスを開始して(x,y)に移動します。<br /><br />
   *
   * このメソッドは、move + line のコンビニエンスメソッドです。<br />
   *
   * 未確認: すでにサブパスが存在する場合は破棄される? それとも一旦閉じられそのまま存続する?
   *
   * @param number x - 移動先のx座標を指定します。
   * @param number y - 移動先のy座標を指定します。
   * @param number w - 幅を指定します。
   * @param number h - 高さを指定します。
   * @param hash [style] - ラインスタイルを指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  rect: function(x, y, w, h, style /* = undefined */) {
    this._cmdRec("rect", x, y, w, h, style);
    return this._rect(x, y, w, h, style);
  },
  /** <b>uu.module.context2dDebug.rect - 円弧のサブパスを追加</b>
   *
   * (x,y)を中心とする円弧状のサブパスを作成します。<br />
   * 既にサブパスが存在する場合は、円弧の始点まで直線のパスが自動的に追加されます。<br />
   *
   * @param number x - 円弧の中心を指定します。
   * @param number y - 円弧の中心を指定します。
   * @param hash [style] - ラインスタイルを指定します。デフォルトはundefinedです。
   * @param hash [param] - パラメタを指定します。
   * @param number [param.r] - 半径を指定します。デフォルトは100です。
   * @param number [param.a0] - 開始角度を0～359の数値で指定します。デフォルトは0です。
   * @param number [param.a1] - 終了角度を0～359の数値で指定します。デフォルトは359です。
   * @param number [param.clock] - 時計周りにパスを設定する場合はtrueを、反時計回りならfalseを指定します。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  arc: function(x, y, param /* = { r: 100, a0: 0, a1: 359, clock: true } */, style /* = undefined */) {
    this._cmdRec("arc", x, y, param, style);
    return this._arc(x, y, param, style);
  },
  /** <b>uu.module.context2dDebug.curve - カーブを引きつつサブパスを移動</b>
   *
   * カレントのサブパスの終点(ペン座標)とx,y座標を結ぶカーブをパスに追加し、<br />
   * x,y座標にパスを移動します。<br />
   * サブパスが存在しない場合は、何もしません。
   *
   * @param array point - 制御点と移動先のx,y座標を指定します。<br />
   *                      ベジェ曲線なら、[cp1x, cp1y, cp2x, cp2y, x, y ] 形式で座標を指定します。<br />
   *                      二次曲線なら、[cp1x, cp1y, x, y ] 形式で座標を指定します。
   * @param number/bool [bezier] - ベジェ曲線を使用するならtrueか1を指定します。
   *                               二次曲線を使用するならfalseか0を指定します。<br />
   *                               デフォルトは1です。
   * @param hash [style] - ラインスタイルを指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   */
  curve: function(point, bezier /* = 1 */, style /* = undefined */) {
    if (!uu.isA(point) || poing.length % 2) { throw TypeError("uu.module.context2dDebug.curve(point)"); }
    this._cmdRec("curve", point, bezier, style);
    return this._curve(point, bezier, style);
  },
  /** <b>uu.module.context2dDebug.clip - クリッピングパスの設定</b>
   *
   * カレントパスを元に、クリッピングパス(マスク)を生成し、コンテキストに適用します。<br />
   * 一度生成したクリッピングパスは、begin()やreset()を実行するまで有効です。
   */
  clip: function() {
    this.clip = true;
    this._cmdRec("clip");
    this.ctx.clip();
    return this;
  },
  /** <b>uu.module.context2dDebug.drawBox - ボックスを描画</b>
   *
   * (x,y)を基点にスクエア(四角)状のボックスを追加します。<br />
   * fillにtrueを指定すると塗りつぶされたボックスを、falseを指定するとワイヤーを描画します。
   *
   * このメソッドは、move + line + fill or storoke のコンビニエンスメソッドとも言えますが、
   * 既存のサブパスにはなんら影響を及ぼしません。<br />
   *
   * @param number x - 移動先のx座標を指定します。
   * @param number y - 移動先のy座標を指定します。
   * @param number w - 幅を指定します。
   * @param number h - 高さを指定します。
   * @param number/bool [wire] - ワイヤーを描画する場合はtrueか1を指定します。塗りつぶす場合はfalseか0を指定します。
   *                             デフォルトは0です。
   * @param fillStyle/storokeStyle [style] - フィルスタイルまたはストロークスタイルを指定します。デフォルトはundefinedです。
   * @return this - thisを返します。
   * @see <a href="#begin">uu.module.context2dDebug.begin()</a> - サブパスの初期化と開始
   * @see <a href="#close">uu.module.context2dDebug.close()</a> - 現在のサブパスを閉じ、新しいサブパスを開始
   * @see <a href="#move">uu.module.context2dDebug.close()</a> - サブパスの移動
   * @see <a href="#line">uu.module.context2dDebug.line()</a> - 直接を引きつつサブパスを移動
   * @see <a href="#fill">uu.module.context2dDebug.fill()</a> - サブパスを塗りつぶす
   * @see <a href="#rect">uu.module.context2dDebug.rect()</a> - スクエア(四角)のサブパスを追加
   * @see <a href="#drawBox">uu.module.context2dDebug.drawBox()</a> - ボックスを描画
   */
  drawBox: function(x, y, w, h, wire /* = 0 */, style /* = undefined */) {
    this._cmdRec("box", x, y, w, h, fill, style);
    if (wire) {
      return this._storokeRect(x, y, w, h, style);
    }
    return this._fillRect(x, y, w, h, style);
  },
  /** <b>uu.module.context2dDebug.zoom - 拡大縮小率の設定</b>
   *
   * 拡大縮小率(スケール)を設定します。
   *
   * @param number x - 水平方向のzoom値を指定します。2で2倍になり、0.5で1/2になります。
   * @param number y - 垂直方向のzoom値を指定します。2で2倍になり、0.5で1/2になります。
   * @return this - thisを返します。
   */
  zoom: function(x, y) {
    this._cmdRec("zoom", x, y);
    this.zoom[0] = x;
    this.zoom[1] = y;
    this.ctx.scale(x, y);
    return this;
  },
  /** <b>uu.module.context2dDebug.offset - オフセット座標の設定</b>
   *
   * 原点をずらします。scale(1,1)の時、オフセット値1は1pxに相当します。
   *
   * @param number x - 水平方向のオフセット値を指定します。
   * @param number y - 垂直方向のオフセット値を指定します。
   * @return this - thisを返します。
   */
  offset: function(x, y) {
    this._cmdRec("offset", x, y);
    this.offset[0] = x;
    this.offset[1] = y;
    this.ctx.translate(x, y);
    return this;
  },
  /** <b>uu.module.context2dDebug.rotate - キャンバスの回転</b>
   *
   * キャンバス(コンテキスト)を回転させます。
   *
   * @param number angle - 回転を度数(0～359)で指定します。0が正位置です。
   * @return this - thisを返します。
   */
  rotate: function(angle) {
    this._cmdRec("rotate", angle);
    this.rotate = angle;
    this.ctx.rotate(angle * Math.RADIAN);
    return this;
  },
//  inPath: function(x, y) { return this.ctx.isPointInPath(x, y); },

  /** <b>uu.module.context2dDebug.gradation - グラデーションの作成</b>
   *
   * グラデーションを作成します。
   *
   * @param array point - 始点(x0,y0)と終点(x1,y1)の座標を指定します。<br />
   *                      線形グラデーションでは、[x0, y0, x1, y1] の形式で指定します。<br />
   *                      円形グラデーションでは、[x0, y0, r0, x1, y1, r1] の形式で指定します。<br />
   * @param bool/number [line] - 線形グラデーションを作成する場合はtrueか1を指定します。
   *                             falseか0を指定すると、円形グラデーションになります。
   *                             デフォルトは1です。
   * @param array colorStop - グラデーションカラーの変化点を指定します。<br />
   *                          offsetには0.0～1.0の値を、colorには色を指定します。<br />
   *                          [offset0, color0, offset1, color1, ...]の形式で指定します。<br />
   *                          デフォルトはundefinedです。
   * @return CanvasGradient - グラデーションオブジェクトを返します。
   */
  gradation: function(point, line /* = 1 */, colorStop /* = undefined */) {
    this._cmdRec("gradation", point, line, colorStop);
    var rv, i = 0;
    if (line || typeof line === "undefined") {
      rv = this.ctx.createLinearGradient(point[0], point[1], point[2], point[3]);
    } else {
      rv = this.ctx.createRadialGradient(point[0], point[1], point[2], point[3], point[4], point[5]);
    }
    if (uu.isA(colorStop)) {
      for (; i < colorStop.length; i += 2) {
        rv.addColorStop(color[i], color[i + 1]);
      }
    }
    return rv;
  },
  /** <b>uu.module.context2dDebug.drawImage - 画像の描画</b>
   */
  drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    switch (arguments.length) {
    case 1: this.ctx.drawImage(image, 0, 0); break;
    case 3: this.ctx.drawImage(image, sx, sy); break;
    case 5: this.ctx.drawImage(image, sx, sy, sw, sh); break;
    case 9: this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh); break;
    }
    return this;
  },
  /** <b>create gradation set</b>
   *
   * @param string name
   * @param array  params
   * 
   */
  PRESET_GRADATION_REFRECTION_IMAGE: 0,
  createPresetGradation: function(name, params) {
    switch (name) {
    case this.PRESET_GRADATION_REFRECTION_IMAGE: // params[0] = height
    return this.gradation(0, params[0], 0, 0, [0, "rgba(0, 0, 0, 0.5)", 1, "rgba(0, 0, 0, 1.0)"]);
    }
    return null;
  },
  /* ok keep */
  drawReflectImage: function(img, x, y, w, h, reflectionGradation /* = undefined */) {
    var gra = (typeof reflectionGradation !== "undefined")
            ? reflectionGradation : this.createPresetGradation(this.PRESET_GRADATION_REFRECTION_IMAGE, [h]);
//    this.clear(0, 0, w, h * 2);
    this.push().translate(0, h * 2).scale(1, -1).drawImage(img, x, y);
    this.mix("destination-out").fillRect(x, y, w, h, gra);
    this.pop();
    this.drawImage(img, x, y);
  },
  /* 早いけど、背景が黒じゃなきゃダメ */
  drawQuickReflectScaledImage: function(img, x, y, w, h, scale, reflectionHeight /* = 50 */, reflectionGradation /* = undefined */) {
    var // rh = reflectionHeight || 50,
        gra = (typeof reflectionGradation !== "undefined")
            ? reflectionGradation
            : this.createPresetGradation(this.PRESET_GRADATION_REFRECTION_IMAGE, [h]);

    this.push();
    this.translate(x, y)
    this.scale(scale, scale);
//    this.strokeRect(0, 0, w, h, "pink");
    this.drawImage(img);
    this.pop();

    this.push();
    this.translate(x, y + h * 2 * scale).scale(scale, -scale).drawImage(img);
    this.mix("destination-out").fillRect(0, 0, w, h, gra);
    this.pop();
  },
  // operaはglobalAlphaの値がdrawImage()に反映されない
  drawReflectScaledImage: function(img, x, y, w, h, scale, reflectionHeight /* = 50 */) {
    var rh = reflectionHeight || 50, i, a;
    this.push();
    this.translate(x, y)
    this.scale(scale, scale);
//    this.strokeRect(0, 0, w, h, "pink");
    this.drawImage(img);
    this.pop();

    this.push();
    this.translate(x, y + h * 2 * scale).scale(scale, -scale);
    for (i = 2, a = rh / 100; i < rh / scale; a -= 0.01, i += 2) {
      this.alpha(a).drawImage(img, 0, h - i, w, 2, 0, h - i, w, 2);
    }
    this.pop();
  },
  /** 画像をキャンバスのサイズに拡大/縮小しコピーする
   *
   * wとhよりも画像が小さければ、拡大コピーします。
   * wまたはhが大きくければ縮小しコピーします。
   */
  drawFixedImage: function(img) {
    var sw = img.width, sh = img.height,
        cw = this.ctx.canvas.width,
        ch = this.ctx.canvas.height,
        dx = (sw <= cw) ? Math.floor((cw - sw) / 2) : 0,
        dy = (sh <= ch) ? Math.floor((ch - sh) / 2) : 0,
        dw = (sw <= cw) ? sw : cw,
        dh = (sh <= ch) ? sh : ch;
    return this.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
  },
  //////////////////////////////////////////////////////////
  _mix: function(method) {
    this.ctx.globalCompositeOperation = method;
    return this;
  },
  _alpha: function(alpha) {
    this.ctx.globalAlpha = alpha;
    return this;
  },
  _clear: function(x, y, w, h) {
    if (arguments.length) {
      if (w < 0) { x -= w; w = -w; }
      if (h < 0) { y -= h; h = -h; }
      this.ctx.clearRect(x, y, w, h)
    } else {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    return this;
  },
  _begin: function(x, y) { 
    this.ctx.beginPath();
    if (arguments.length) {
      this._posRec(this.x = x || this.x, this.y = y || this.y);
      this.ctx.moveTo(this.x, this.y);
    }
    return this;
  },
  _close: function(x, y) {
    this.ctx.closePath();
    if (arguments.length) {
      this._posRec(this.x = x || this.x, this.y = y || this.y);
      this.ctx.moveTo(this.x, this.y);
    }
    return this;
  },
  _move: function(x, y) {
    this._posRec(this.x = x || this.x, this.y = y || this.y);
    this.ctx.moveTo(this.x, this.y);
    return this;
  },
  _line: function(point, style) {
    var i = 0, sz = point.length;
    if (style) { this._lineStyle(style); }
    for (; i < sz; i += 2) {
      this._posRec(this.x = point[i], this.y = point[i + 1]);
      this.ctx.lineTo(this.x, this.y);
    }
    return this;
  },
  _fill: function(style) {
    if (style) { this._fillStyle(style); }
    this.ctx.fill();
    return this;
  },
  _rect: function(x, y, w, h, style) {
    if (style) { this._lineStyle(style); }
    this._posRec(this.x = x || this.x, this.y = y || this.y);
    this.ctx.rect(this.x, this.y, w, h);
    return this;
  },
  _arc: function(x, y, param, style) {
    if (style) { this._lineStyle(style); }
    this._posRec(this.x = x || this.x, this.y = y || this.y);
    param = uu.mix.param(param || {}, { r: 100, a0: 0, a1: 359, clock: true });
    this.ctx.arc(this.x, this.y, param.r, param.a0 * Math.RADIAN, param.a1 * Math.RADIAN, !clock);
    return this;
  },
  _arcTo: function(point, r, style) {
    if (style) { this._lineStyle(style); }
    this.ctx.arc(point[0], point[1], point[2], point[3], r);
    return this;
  },
  _curve: function(point, bezier, style) {
    if (style) { this._lineStyle(style); }
    if (bezier) {
      return this.ctx.bezierCurveTo(point[0], point[1], point[2], point[3], point[4], point[5]);
    }
    return this.ctx.quadraticCurveTo(point[0], point[1], point[2], point[3]);
  },
  _stroke: function(style) {
    if (style) { this._strokeStyle(style); }
    this.ctx.stroke();
    return this;
  },
  _lineStyle: function(style) {
    uu.mix(this.ctx, style);
    return this;
  },
  _fillStyle: function(style) {
    this.ctx.fillStyle = style;
    return this;
  },
  _strokeStyle: function(style) {
    this.ctx.strokeStyle = style;
    return this;
  },
  _fillRect: function(x, y, w, h, abs, style) {
    if (style) { this._fillStyle(style); }
    this._posRec(this.x = this._posX(x, abs), this.y = this._posY(y, abs));
    this.ctx.fillRect(this.x, this.y, w, h);
    return this;
  },
  _storokeRect: function(x, y, w, h, abs, style) {
    if (style) { this._storokeStyle(style); }
    this._posRec(this.x = this._posX(x, abs), this.y = this._posY(y, abs));
    this.ctx.strokeRect(this.x, this.y, w, h);
    return this;
  }
};

})(); // end (function())()
