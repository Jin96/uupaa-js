/** <b>Image Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.image = {};

/** <b>Image</b>
 *
 * @class
 */
uu.module.image = function() {
};

/** <b>画像のロード済み確認 - Is image loaded</b>
 *
 * 画像をロード済み(すぐに使用可能な状態)ならtrueを返します。
 *
 * @param String url - 画像のURLを指定します。絶対URLを指定します。
 * @return Boolean   - ロード済みでtrueを返します。
 */
uu.module.image.isLoaded = function(url) {
  function judge(node) { return node.complete && node.src === url; }
  return uu.toArray(uud.images).some(judge);
};

/** <b>画像のプリロード - Preload image</b>
 *
 * 画像を非同期にロードします。
 * リクエスト終了でfn(code, url, image要素)をコールします。<br />
 * codeには成功で1,失敗で0が格納されます。<br />
 *
 * このメソッドはロールオーバーやcanvasで使用する画像のプリロード用です。<br /><br />
 *
 * 既に画像が使用可能になっている状態(uu.module.image.isLoaded()==true)で呼ばれた場合は、
 * 即座に関数を実行します。
 *
 * @param String   url - 画像のパスの指定です。絶対URLや相対パスを指定します。
 * @param Function fn  - リクエスト終了で呼び出す関数を指定します。デフォルトはuu.muteです。
 * @see <a href="#timeout">uu.module.image.timeout</a> - タイムアウト時間の指定
 * @see <a href="#delay">uu.module.image.delay</a> - 遅延時間の指定
 * @see <a href="http://d.hatena.ne.jp/uupaa/20080413/1208067631">uupaa開発日記</a>
 */
uu.module.image.preload = function(url, fn /* = uu.mute */) { // for Firefox3, Safari3.1, Opera9.5β3, IE6/7/8β
  var tick = 0, img, run = 0; // 二重起動防止用

//url = url.toAbsURL();
  url = uu.url.abs(url);
  fn = fn || uu.mute;
  img = new Image();

  if (uu.module.image.isLoaded(url)) { // already loaded
    img.src = url;
    fn(1, url, img);
    return;
  }
  img.onabort = img.onerror = function() { run++ ? 0 : fn(0, url, img); };
  img.onload  = function() {
    run++ ? 0 : ((uu.ua.opera && !img.complete) ? fn(0, url, img) : fn(1, url, img));
  };
  img.src = url;

  if (!run && uu.module.image.timeout) {
    uuw.setTimeout(function() {
      if (run) { return; }
      if ((uu.ua.gecko && img.complete && !img.width) || // Firefox2は読込失敗でcomplete=true, width=0になる
          (tick += uu.module.image.delay) > uu.module.image.timeout) { // タイムアウト
        run++ ? 0 : fn(0, url, img);
        return;
      }
      uuw.setTimeout(arguments.callee, uu.module.image.delay);
    }, 0);
  }
};

/** <b>タイムアウト時間 - Timeout</b>
 * uu.module.image.load()で使用するタイムアウト時間を指定します。
 * 1以上の数値を指定します。単位はmsです。
 * デフォルトは10000です。
 *
 * @type number
 * @see <a href="#preload">uu.module.image.preload()</a> - 画像のプリロード
 */
uu.module.image.timeout = 10000; // 10000ms(10s)

/** <b>遅延時間 - Delay</b>
 * uu.module.image.load()で使用する遅延時間の指定です。
 * 10以上の数値を指定します。単位はmsです。デフォルトは50です。
 *
 * @type number
 * @see <a href="#preload">uu.module.image.preload()</a> - 画像のプリロード
 */
uu.module.image.delay = 50; // 50ms

})(); // end (function())()
