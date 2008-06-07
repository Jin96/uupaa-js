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
uu.image = function() {
};

/** <b>画像をロード済みならtrue</b>
 *
 * @param string url - 画像のURLを指定します。絶対URLを指定します。
 * @return bool      - ロード済みでtrueを返します。
 */
uu.image.isLoaded = function(url) {
  function judge(node) { return node.complete && node.src === url; }
  return uu.toArray(uud.images).some(judge);
};

/** <b>画像をプリロードする(preload image)</b>
 *
 * 画像を非同期にロードします。
 * リクエスト終了でfn(code, url, image要素)をコールします。<br />
 * codeには成功で1,失敗で0が格納されます。<br />
 *
 * このメソッドはロールオーバーやcanvasで使用する画像のプリロード用です。<br /><br />
 *
 * 既に画像が使用可能になっている状態(uu.image.isLoaded()==true)で呼ばれた場合は、
 * 即座に関数を実行します。
 *
 * @param string   url - 画像のパスの指定です。絶対URLや相対パスを指定します。
 * @param function fn  - リクエスト終了で呼び出す関数を指定します。デフォルトはuu.muteです。
 * @see <a href="#timeout">uu.image.timeout</a> - タイムアウト時間の指定
 * @see <a href="#delay">uu.image.delay</a> - 遅延時間の指定
 * @see <a href="http://d.hatena.ne.jp/uupaa/20080413/1208067631">uupaa開発日記</a>
 */
uu.image.preload = function(url, fn /* = uu.mute */) { // for Firefox3, Safari3.1, Opera9.5β3, IE6/7/8β
  var tick = 0, img, run = 0; // 二重起動防止用

//url = url.toAbsURL();
  url = uu.url.abs(url);
  fn = fn || uu.mute;
  img = new Image();

  if (uu.image.isLoaded(url)) { // already loaded
    img.src = url;
    fn(1, url, img);
    return;
  }
  img.onabort = img.onerror = function() { run++ ? 0 : fn(0, url, img); };
  img.onload  = function() {
    run++ ? 0 : ((uu.ua.opera && !img.complete) ? fn(0, url, img) : fn(1, url, img));
  };
  img.src = url;

  if (!run && uu.image.timeout) {
    uuw.setTimeout(function() {
      if (run) { return; }
      if ((uu.ua.gecko && img.complete && !img.width) || // Firefox2は読込失敗でcomplete=true, width=0になる
          (tick += uu.image.delay) > uu.image.timeout) { // タイムアウト
        run++ ? 0 : fn(0, url, img);
        return;
      }
      uuw.setTimeout(arguments.callee, uu.image.delay);
    }, 0);
  }
};

/** <b>IEで24bitのαブレンドを使用可能にする(24bit png image alpha blend for IE)</b>
 *
 * png画像を動的に追加し、透過させたい場合に、この関数をコールします。<br />
 * IE5.5/6.0以外のブラウザでは何もしません。
 *
 * @param array elms - 要素または、要素の配列を指定します。
 */
uu.image.png24 = function(elms) {};
uu.image.png24._file = uu.config.imagePath + "uu.module.image.1x1.gif"; // png24で使用する1x1のgifイメージのファイル名
uu.image.png24._search = function() {};

/** <b>タイムアウト時間</b>
 * uu.image.load()で使用するタイムアウト時間を指定します。
 * 1以上の数値を指定します。単位はmsです。
 * デフォルトは10000です。
 *
 * @type number
 * @see <a href="#preload">uu.image.preload()</a> - 画像のプリロード
 */
uu.image.timeout = 10000; // 10000ms(10s)

/** <b>遅延時間</b>
 * uu.image.load()で使用する遅延時間の指定です。
 * 10以上の数値を指定します。単位はmsです。デフォルトは50です。
 *
 * @type number
 * @see <a href="#preload">uu.image.preload()</a> - 画像のプリロード
 */
uu.image.delay = 50; // 50ms

if (uu.config.png24 && (/MSIE (5\.5|6\.0)/.test(uu.ua._) && navigator.platform == "Win32")) {
  // uu.mixで、元のuu.image.png24()のプロパティ(_file,_search等)を引き継いだuu.image.png24()を作り出す
  // 普通に上書きすると、_file,_searchはundefinedになってしまうが、
  // このようにすると、子孫との関係を維持しつつ、親(この場合function)の中身の入れ替えが可能になる。
  uu.image.png24 = uu.mix(function(elms) {
    var w, h;
    (uu.isA(elms) ? elms : [elms]).forEach(function(v) {
      if (v.uu_png24) { return; } // alert("already");
      w = v.width, h = v.height;
      v.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + v.src + '",sizingMethod=scale)';
      uu.mix(v, { src: uu.image.png24._file, width: w, height: h, uu_png24: 1 });
    });
  }, uu.image.png24);

  /** <b>24bit化するpng画像を列挙</b>
   *
   * 条件に一致するpng画像を列挙し配列を返します。<br />
   *    条件1. ".png"拡張子(大/小文字は無視)<br />
   *    条件2. alt,srcの文字列の一部が"24b"または"24B"か、classに"alpha"が含まれている<br />
   *
   * @return array    img要素の配列を返します。要素が見つからない場合は[]を返します。
   * @private
   */
  uu.image.png24._search = function() {
    var rv = [];
    uu.toArray(uud.images).forEach(function(v) {
      if (v.complete && /.png$/i.test(v.src)) {
        if ((v.alt && /24b/i.test(v.alt)) || /24b/i.test(v.src) || uu.css.is(v, "alpha")) {
          rv.push(v);
        }
      }
    });
    return rv;
  };

  // 画像のプリロードに成功したら透過処理を行う。
  // 読込失敗で何もしない(デバッグモードなら例外を挙げる)
  uu.window.ready(function() {
    uu.image.preload(uu.image.png24._file, function(code) {
      if (code) {
        code && uu.image.png24(uu.image.png24._search());
      } else if (uu.config.debug) {
        throw Error("image not exist: " + uu.image.png24._file);
      }
    });
  });
}

})(); // end (function())()
