/** uupaa.js - JavaScript Library for Japanese creator
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 * @see http://code.google.com/p/uupaa-js/
 */

////////////////////////////////////////////////////////////
/** <b>uupaa.js core definition</b>
 *
 * @class
 */
var uu = function() {
  return uu._impl.apply(this, arguments);
};
uu._impl = function() {}; // As you like

uu.version = [0, 2]; // [major, release, revision]

////////////////////////////////////////////////////////////
(function() { var uud = document, uuw = window; // alias

uud.head = uud.getElementsByTagName("head")[0]; // alias - document.head

if (!uud.evaluate && !uud.getElementById("javascript-xpath.js")) { // need document.evaluate()
  throw Error('ERR-02: <script src="{{path}}/javascript-xpath.js"> not exist');
}
if (!uud.getElementById("uupaa.js")) { // need <script id="uupaa.js" src="uupaa.js"></script>
  throw Error('ERR-02: <script id="uupaa.js" src="{{path}}/uupaa.js"> not exist');
}

////////////////////////////////////////////////////////////
/** <b>uu.mix - ミックス, 継承(mixin, class abstract)</b>
 *
 * baseにflavorとaromaを混ぜ込みbaseを返します。<br />
 * 既存のindexがあればflavorやaromaの値で上書きします。
 *
 * @param hash/array base    - ベース要素の指定です。
 * @param hash/array flavor  - baseに混ぜ込む要素の指定です。
 * @param hash/array [aroma] - baseに混ぜ込む要素の指定です。デフォルトはundefinedです。
 * @return hash/array - ミックス後のbaseを返します。
 * @see uu.mix.param - パラメタ用のmix
 * @see uu.mix.props - プロパティのみをmix
 * @namespace
 */
uu.mix = function(base, flavor, aroma /* = undefined */) {
  for (var p in flavor) {
    base[p] = flavor[p];
  }
  return aroma ? uu.mix(base, aroma) : base;
};

/** <b>uu.mix.param - 引数の補完(parameter completion mixin)</b>
 *
 * baseにflavorとaromaを混ぜ込みbaseを返します。<br />
 * 既存のindexの値をflavorやaromaの値で上書きしません。
 *
 * <pre class="eg">
 * var base = { param1: 1, param2: "a" };
 * uu.mix.param(base, { param1: "hoge" }); // base = { param1: 1, param2: "a" }
 * </pre>
 *
 * @param hash/array base    - ベース要素の指定です。
 * @param hash/array flavor  - baseに混ぜ込む要素の指定です。
 * @param hash/array [aroma] - baseに混ぜ込む要素の指定です。デフォルトはundefinedです。
 * @return hash/array - ミックス後のbaseを返します。
 * @see uu.mix - 汎用mixin
 * @see uu.mix.props - プロパティのみをmix
 */
uu.mix.param = function(base, flavor, aroma /* = undefined */) {
  for (var p in flavor) {
    (p in base) ? 0 : base[p] = flavor[p];
  }
  return aroma ? uu.mix.param(base, aroma) : base;
};

/** <b>uu.mix.props - プロパティのみ補完(propertys mixin)</b>
 *
 * baseにflavorとaromaを混ぜ込みbaseを返します。<br />
 * 既存のindexの値をflavorやaromaの値で上書きします。<br />
 *
 * uu.mix.propsはメソッドとlengthプロパティを混ぜません。
 * この特徴は、mixinする必要のないメソッドや、
 * 混乱の元となる"length"プロパティをそぎ落とすフィルターとしても使用できます。
 *
 * @param hash/array base    - ベース要素の指定です。
 * @param hash/array flavor  - baseに混ぜ込む要素の指定です。
 * @param hash/array [aroma] - baseに混ぜ込む要素の指定です。デフォルトはundefinedです。
 * @return hash/array - ミックス後のbaseを返します。
 * @see uu.mix - 汎用mixin
 * @see uu.mix.param - パラメタ用のmix
 */
uu.mix.props = function(base, flavor, aroma /* = undefined */) {
  for (var p in flavor) {
    typeof flavor[p] !== "function" && p !== "length" && (base[p] = flavor[p]);
  }
  return aroma ? uu.mix.prop(base, aroma) : base;
};

////////////////////////////////////////////////////////////
/** <b>uu.forEach - 全要素を評価(for each)</b>
 *
 * mixの各要素(各文字)に対しfnを実行します。<br />
 * Array.forEachはarray専用ですが、uu.forEachは、hash, array, 擬似配列に使用可能です。<br />
 *
 * 存在しないインデックスやundefinedの要素はスキップします。
 * fnには3つの引数(要素の値, 要素のインデックス, 配列自身)が渡されます。
 *
 * @param hash/array mix  - 要素を指定します。
 * @param function   fn   - 各要素を評価する関数を指定します。
 * @param this       [me] - fn実行時のthisを指定します。デフォルトはundefinedです。
 * @return mix - mixを返します。
 * @see Array.forEach - 全要素を評価し配列を返す
 * @namespace
 */
uu.forEach = function(mix, fn, me /* = undefined */) {
  if (mix.forEach) { return mix.forEach(fn, me); } // call native forEach function
  var i, sz;
  if ("length" in mix) { // Array or FakeArray(has length property)
    for (i = 0, sz = mix.length; i < sz; ++i) {
      (i in mix) && fn.call(me, mix[i], i, mix);
    }
  } else {
    for (i in mix) {
      mix.hasOwnProperty(i) && fn.call(me, mix[i], i, mix);
    }
  }
  return mix;
};

////////////////////////////////////////////////////////////
/** <b>uu.id - document.getElementById wrapper</b>
 *
 * IDと一致する要素を検索します。
 *
 * @param string id        - IDを指定します。
 * @param bool   [noCache] - キャッシュを使わずに検索する場合にtrueを指定します。<br />
 *                           falseを指定するとキャッシュを使用する可能性があり、
 *                           その要素が既に存在しなかったり、IDが別の要素で使いまわされている可能性もあります。<br />
 *                           デフォルトはfalseです。
 * @return null/element    - 検索成功で要素の参照を返します。失敗でnullを返します。
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 * @namespace
 */
uu.id = function(id, noCache /* = false */) {
  return (noCache || false) ? uud.getElementById(id) :
         (uu.id._cache[id] || (uu.id._cache[id] = uud.getElementById(id)));
};
uu.id._cache = {};

////////////////////////////////////////////////////////////
/** <b>ブラウザの判別とブラウザが保持する機能の判別(Detect User-Agent/Browser Function/DOM Function)</b>
 *
 * ブラウザの判別と、機能の有効/無効情報を返します。<br />
 *
 * <h4>nameに指定可能な文字列</h4>
 * <dl>
 *  <dt>空文字列("")</dt><dd>ユーザエージェント文字列を返す</dd>
 *  <dt>"opara"</dt><dd>Operaでtrue</dd>
 *  <dt>"ie"</dt><dd>Internet Explorerでtrue</dd>
 *  <dt>"gecko"</dt><dd>Geckoブラウザ(Firefox等)でtrue</dd>
 *  <dt>"webkit"</dt><dd>Webkitブラウザ(Safari等)でtrue</dd>
 *  <dt>"ipod"</dt><dd>iPod/iPhone(Safari)でtrue</dd>
 *  <dt>"wii"</dt><dd>Wii Internet channelでtrue</dd>
 *  <dt>"std"</dt><dd>DTDを指定したスタンダードモードでブラウザが描画している場合にtrue</dd>
 *  <dt>"domrange"</dt><dd>DOM Level2 Range Moduleが使用可能でtrue</dd>
 *  <dt>"display:table"</dt><dd>Safari3, Firefox2, Opera9, IE8ならtrue, それ以外ならfalse</dd>
 *  <dt>"ver"</dt><dd>ブラウザ(描画エンジン)のバージョン番号, 値と意味はブラウザの種類で異なる</dd>
 * </dl>
 *
 * @param string name - ブラウザ名, ブラウザの描画エンジン名, 機能名の指定です。<br />
 *                      大小文字を区別しません。
 * @return bool/string - nameで指定したブラウザで動作しているか、機能が使用可能な場合にtrueを返します。
 *                       nameを省略した場合は、ユーザエージェント文字列を返します。
 *                       verを指定するとバージョン番号を返します。
 * @class
 */
uu.ua = function(name /* = "" */) {
  var e = arguments.callee;
  name = (name || "_").toLowerCase();
  if (name in e) { return e[name]; }
  switch (name) {
  case "display:table":
    return (!uu.ua.ie || uu.ua.ver >= 8);
  case "ver":
    if (!uu.ua.ver) {
      uu.ua.ver = (uu.ua.ie)     ? parseFloat(uu.ua._.match(/MSIE ([\d]\.[\d][\w]?)/)[1])
                : (uu.ua.webkit) ? parseFloat(uu.ua._.match(/WebKit\/(\d+(?:\.\d+)*)/)[1])
                : (uu.ua.gecko)  ? parseFloat(uu.ua._.match(/Gecko\/(\d{8})/)[1])
                : (uu.ua.opera)  ? opera.version() : 0;
    }
    return uu.ua.ver;
  }
  return false;
};
uu.ua._       = navigator.userAgent;            // UserAgent cache
uu.ua.opera   = !!uuw.opera;                    // is Opera
uu.ua.ie      = !!uud.uniqueID;                 // is Internet Explorer
uu.ua.gecko   = uu.ua._.indexOf('Gecko/') >= 0; // is Gecko(Firefox)
uu.ua.webkit  = uu.ua._.indexOf('WebKit') >= 0; // is WebKit(Safari)
uu.ua.ipod    = uu.ua._.indexOf('iPod') >= 0 || uu.ua._.indexOf('iPhone') >= 0; // is iPod/iPhone(Safari)
uu.ua.wii     = !!(uuw.opera && uuw.opera.wiiremote);             // is Wii Internet channel
uu.ua.std     = uud.compatMode && uud.compatMode == 'CSS1Compat'; // is Standard Mode
uu.ua.domrange = uud.implementation.hasFeature("Range", "2.0");   // is DOM Level2 Range Module
uu.ua.ver     = uu.ua("ver");

////////////////////////////////////////////////////////////
/** <b>Module</b>
 *
 * @class
 */
uu.module = function() {
};

/** <b>uu.module.timeout - タイムアウト時間</b>
 *
 * uu.module.loadSync()で使用するタイムアウト時間を指定します。<br />
 * 1以上の数値を指定します。単位はmsです。デフォルトは500です。
 *
 * @type number
 * @see uu.module.loadSync
 */
uu.module.timeout = 500; // 500ms(0.5s)

/** <b>uu.module.delay - 遅延時間</b>
 * uu.module.loadSync()で使用する遅延時間の指定です。<br />
 * 10以上の数値を指定します。単位はmsです。デフォルトは50です。
 *
 * @type number
 * @see uu.module.loadSync
 */
uu.module.delay = 50; // 50ms

/** <b>uu.module.isLoaded - モジュールをロード済みならtrue</b>
 *
 * @param taxing name - モジュール名を指定します。
 * @return bool - モジュールロード済みでtrueを返します。<br />
 *                複数モジュール指定時は、全モジュールロード済みでtrueを返します。
 */
uu.module.isLoaded = function(name) {
  return uu.notax(name).every(function(v) {
    return v in uu.module;
  });
};

/** <b>uu.module.load - モジュールの非同期ロード(load module[Async])</b>
 *
 * モジュールを順番にロードし、全モジュールのロード完了で、fn() をコールします。<br />
 * uu.module.loadSync()との違いは以下になります。<br />
 *
 * 1. uu.module.loadSync()はシリアル(順番)にロードしますが、uu.module.load()はパラレル(同時)にロードします。<br />
 * 2. パラレルにロードするためユーザの待機時間が最小になりますが、ロード順は保障されません。<br />
 * 3. タイムアウトしません。
 *
 * 既にロード済みのモジュールを指定すると、即座にfnを呼び出します。
 *
 * @param taxing [path] - 検索パスの指定です。絶対URLや相対パスを指定します。<br />
 *                        空文字列を指定すると、uu.config.modulePathで指定されたURLを検索パスとして使用します。<br />
 *                        デフォルトは空文字列("")です。<br />
 * @param taxing module - モジュールの指定です。
 * @param function [fn] - ロード完了後にコールバックするメソッドを指定します。デフォルトはundefinedです。
 * @throws Error          "uu.module.load({module}) failed"  ロード失敗
 * @see uu.config.modulePath モジュール検索パスの指定
 * @see uu.module.loadSync - 同期ロード
 * @see uu.module.isLoaded - モジュール読込済みでtrueを返す
 * @see uu.baseURL - uupaa.jsのカレントパスを返す
 */
uu.module.load = function(path /* = "" */, module, fn /* = undefined */) {
  var src = uu.module._buildURL(path || uu.config.modulePath, module),
      mods = uu.indexes(src), run = 0;
  fn = fn || uu.mute;

  if (uu.module.isLoaded(module)) { fn(); return; } // already loaded

  (!mods.length) ? fn() :
    uu.forEach(src, function(v, i) {
      if (uu.ua.ie) {
        uu.module._inject(i, v, {
          onreadystatechange: function() {
            // IE6は"complete"のみ、IE8では"loaded"
            if (this.readyState === "complete" || this.readyState === "loaded") {
              if (!uu.module.isLoaded(this.uuModule)) { // file not found.
                uu.module._reload(this);
              } else if (uu.module.isLoaded(mods)) {
                run++ ? 0 : fn();
              }
            }
          }
        });
      } else {
        uu.module._inject(i, v, {
          onload:  function() { if (uu.module.isLoaded(mods)) { run++ ? 0 : fn(); } },
          onerror: function() { uu.module._reload(this); }
        });
      }
    });
};

/** <b>uu.module.loadSync -モジュールの同期ロード(load module[Sync])</b>
 *
 * モジュールを順番にロードし、全モジュールのロード完了で、fn() をコールします。<br />
 * モジュールの検索パス(path)は複数指定可能です。<br />
 * 最初に指定した検索パスからモジュールをロードできない場合は、検索パスがあるかぎり順次試行します。<br />
 * 全検索パスを試行してもロードできない場合は例外を発生させます。<br />
 *
 * 検索パスの指定を省略すると、uu.config.modulePathで指定されたURLを検索パスとして使用します。<br />
 *
 * <pre class="eg">
 * // http://example.com/ 以下から ui,dragモジュールのロードを試み、失敗した場合は、
 * // http://example.net/latest/ 以下からモジュールのロードを試みる。
 * uu.module.loadSync("http://example.com/,http://example.net/latest/", "ui,drag");
 * </pre>
 *
 * 複数の検索パスをうまく組み合わせると、本番系が接続しにくい場合に、
 * 自動的に予備系のサーバからスクリプトをロードするといった動作の指定が可能になります。<br />
 *
 * 既にロード済みのモジュールを指定すると、即座にfnを呼び出します。
 *
 * @param taxing [path] - 検索パスの指定です。絶対URLや相対パスを指定します。<br />
 *                        空文字列を指定すると、uu.config.modulePathで指定されたURLを検索パスとして使用します。<br />
 *                        デフォルトは空文字列("")です。<br />
 * @param taxing module - モジュールの指定です。
 * @param function [fn] - ロード完了後にコールバックするメソッドを指定します。デフォルトはundefinedです。
 * @throws Error          "uu.module.load({module}) timeout" タイムアウト
 * @throws Error          "uu.module.load({module}) failed"  ロード失敗
 * @see uu.config.modulePath - モジュール検索パスの指定
 * @see uu.module.timeout - タイムアウト時間の指定
 * @see uu.module.delay - 遅延時間の指定
 * @see uu.module.load - 非同期ロード
 * @see uu.module.isLoaded - モジュール読込済みでtrueを返す
 * @see uu.baseURL - uupaa.jsのカレントパスを返す
 */
uu.module.loadSync = function(path /* = "" */, module, fn /* = undefined */) {
  var last, src = uu.module._buildURL(path || uu.config.modulePath, module),
      tick = 0, order = [], node;
  fn = fn || uu.mute;

  if (uu.module.isLoaded(module)) { fn(); return; } // already loaded

  (!(order = uu.indexes(src)).length) ? fn() : (
    last = order.shift(),
    node = uu.module._inject(last, src[last]),
    uuw.setTimeout(function() {
      if ((tick += uu.module.delay) > uu.module.timeout) {
        node = uu.module._reload(node, false);
        tick = 0;
      }
      if (uu.module.isLoaded(last)) {
        if (!order.length) { fn(); return; } // complete
        last = order.shift();
        node = uu.module._inject(last, src[last]);
        tick = 0;
      }
      uuw.setTimeout(arguments.callee, uu.module.delay);
    }, 0)
  );
};
/** <b>uu.module._buildURL - URLのビルド</b>
 *
 * @param taxing path
 * @param taxing module
 * @return hash - { module-name: [url], ...}
 */
uu.module._buildURL = function(path, module) {
  var rv = {};
  path = uu.notax(path);
  uu.notax(module).forEach(function(m) {
    rv[m] = [];
    path.forEach(function(p) {
      rv[m].push(p + "uu.module." + m + ".js");
    });
  });
  return rv;
};

/** <b>uu.module._reload - script要素の差し替え(リロード)</b>
 */
uu.module._reload = function(node, async /* = true */) {
  var n = uud.head.removeChild(node), next, e;
  if (!n.uuList.length) { throw Error("uu.module.load(" + node.uuModule + ") failed"); }
  next = n.uuList.shift();
  e = uu.mix(uu.js.create(n.id), { uuModule: n.uuModule, uuList: n.uuList });
  if (uu.isU(async) || async) {
    uu.mix(e, uu.ua.ie ? { onreadystatechange: n.onreadystatechange } :
                         { onload: n.onload, onerror: n.onerror });
  }
  e.src = next;
  return uud.head.appendChild(e); // src設定後にドキュメントツリーに追加しないとIEでは動作しない
};

/** <b>uu.module._inject - script要素の差し込み</b>
 *
 * 
 */
uu.module._inject = function(name, list, param) {
  var src = list.shift(),
      e = uu.mix(uu.js.create("uu.module." + name + ".js"), { uuModule: name, uuList: list });
  uu.mix(e, param || {});
  // IE6/7/8は、script要素にsrcを設定してからappendChild()を行わないとスクリプトがロードされない
  // これは (new Image()).src のケースとは挙動が異なる。
  if (uu.ua.ie) {
    e.src = src;
    uud.head.appendChild(e);
  } else {
    uud.head.appendChild(e);
    e.src = src;
  }
  return e;
};

////////////////////////////////////////////////////////////
/** <b>URL</b>
 *
 * @class
 */
uu.url = function() {
};
/** <b>uu.url.abs - 相対パスを絶対パスに変換</b>
 *
 * 相対パス(相対URL)を絶対パス(絶対URL)に変換した新しい文字列を返します。
 *
 * <pre class="eg">uu.url.abs("./image.jpg"); // "http://www.example.com/image.jpg"</pre>
 *
 * @param string str - 相対パス文字列を指定します。
 * @return string - 変換後の文字列を返します。
 * @see <a href="#fileName">uu.url.fileName</a> - パス文字列からファイル名を取得
 * @see <a href="#path">uu.url.path</a> - パス文字列からパスを取得
 */
uu.url.abs = function(str) {
  function impl(s) {
    var e = uud.createElement("div");
    e.innerHTML = '<a href="' + s + '" />';
    return e.firstChild.href;
  }
  return /^(file|https|http)\:\/\//.test(str) ? str : impl(str);
};
/** <b>uu.url.fileName - パス文字列からファイル名を取得</b>
 *
 * <pre class="eg">uu.url.fileName("./path/file.ext"); // "file.ext"</pre>
 *
 * @param string str - パス文字列を指定します。
 * @return string - パス文字列に含まれているファイル名部分を返します。<br />
 *                  ファイル名が見つからなければ空文字列を返します。
 * @see <a href="#abs">uu.url.abs</a> - 相対パスを絶対パスに変換
 * @see <a href="#path">uu.url.path</a> - パス文字列からパスを取得
 */
uu.url.fileName = function(str) {
  var rv = str.split("/");
  return rv[rv.length - 1];
};
/** <b>uu.url.path - パス文字列からパスを取得</b>
 *
 * <pre class="eg">uu.url.path("./path/file.ext"); // "./path"</pre>
 * 
 * @param string str - パス文字列を指定します。
 * @return string - パス文字列に含まれているパス部分を返します。<br />
 *                  パス部分が見つからなければ空文字列を返します。
 * @see <a href="#abs">uu.url.abs</a> - 相対パスを絶対パスに変換
 * @see <a href="#fileName">uu.url.fileName</a> - パス文字列からファイル名を取得
 */
uu.url.path = function(str) {
  var sl = str.lastIndexOf("/") + 1;
  return (!sl) ? "" : str.slice(0, sl);
};
/** <b>uu.url.query - クエリ文字列をhashで取得</b>
 *
 * URLのクエリ文字列(key1=value1&key2=value2, ...)をパースし、
 * hash({ key1: "value1", key2: "value2" })を返します。<br /><br />
 *
 * encodeURIComponent()でエンコードされている文字列を適切にデコードします。
 *
 * <pre class="eg">
    var url = uu.url.query.add("", "key", "a:?="); // "?key=a%3A%3F%3D"
    var rv  = uu.url.query(url, true);
 * </pre>
 *
 * @param string qstr - クエリ文字列を指定します。
 * @return hash - hashを返します。
 * @namespace
 */
uu.url.query = function(qstr) {
  var rv = {}, F = uuw.decodeURIComponent;
  function decode(match, key, value) { return rv[F(key)] = F(value); }
  qstr.replace(/^.*\?/, "").replace(/(?:([^\=]+)\=([^\&]+))/g, decode); // "?"の左側を切り落とし "key=value"で切り分ける
  return rv;
};
/** <b>uu.url.query.add - クエリ文字列を追加</b>
 *
 * URL文字列の末尾にクエリ文字列("?key1=value1&key2=value2, ...)を追加します。<br /><br />
 *
 * key,valueをencodeURIComponent()で適切にエンコードします。
 *
 * <pre class="eg">
   // "http://www.example.com/?key1=value1&key2=value2"
   uu.url.query.add("http://www.example.com/", { key1: "value1", key2: "value2" });
   
   // "http://www.example.com/?key3=value3"
   uu.url.query.add("http://www.example.com/", "key3", "value3");
 * </pre>
 *
 * @param string url - URLを指定します。
 * @param string/hash key - keyを指定します。hash{ key1: value1, key2: value2, ... }も指定可能です。
 * @param string [value] - valueを指定します。keyにhashを指定した場合はこの引数は無視されます。
 * @return string - クエリ文字列を追加したURL文字列を返します。
 */
uu.url.query.add = function(url, key, value) {
  var rv = [], F = uuw.encodeURIComponent;
  function pair(value, key) { rv.push(F(key) + "=" + F(value)); }
  (uu.isS(key)) ? pair(value, key) : uu.forEach(key, pair);
  return url + (url.lastIndexOf("?") === -1 ? "?" : "&") + rv.join("&");
};

////////////////////////////////////////////////////////////
/** <b>Script</b>
 *
 * @class
 */
uu.js = function() {
};

/** <b>uu.js.create - script要素の生成</b>
 *
 * @return element - 生成したscript要素を返します。
 */
uu.js.create = function(id /* = "" */) {
  return uu.mix(document.createElement("script"), {
    type: "text/javascript", charset: "utf-8", id: id || ""
  });
};

/** <b>uu.js.exec - JavaScript文字列をグローバルネームスペースで評価</b>
 *
 * @return element - head要素から削除したscript要素を返します。
 */
uu.js.exec = function(code) {
  return uud.head.removeChild(uud.head.appendChild(uu.mix(uu.js.create(), { text: code })));
};

////////////////////////////////////////////////////////////
/** <b>uu.attr - 属性を持ち値が一致する要素を列挙(document.getElementsByAttribute wrapper)</b>
 *
 * 属性(アトリビュート)を持ち、値が一致する要素を列挙します。<br />
 * valueと完全に一致する値を持つ要素を列挙します。
 *
 * @param string  attr      - 属性名を指定します。
 * @param string  [value]   - 検索する属性値を指定します。アスタリスク("*")を指定すると値による絞込みをしません。<br />
 *                            デフォルトは"*"です。
 * @param element [context] - 検索開始位置(コンテキスト)を指定します。デフォルトはdocumentです。
 * @param string  [tag]     - getElementsByAttribute()が実装されていないブラウザで、
 *                            tagに指定したタグのみを検索対象とします。
 *                            検索対象を限定することで速度を稼ぎます。
 * @return NodeList/array - 検索成功でNodeListまたは要素の配列 [element, ...] を返します。失敗で空のNodeListか配列を返します。<br />
 *                          NodeListまたは配列を返すため、uu.attr().forEach() ではなく、
 *                          uu.forEach(uu.attr())を使用してください。
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 * @class
 */
uu.attr = function(attr, value /* = "*" */, context /* = document */, tag /* = undefined */) {
  return (context || uud).getElementsByAttribute(attr, value || "*");
};
if (!uud.getElementsByAttribute) {
  uu.attr = function(attr, value /* = "" */, context /* = document */, tag /* = undefined */) {
    var x = function(n, v) { return (v === "*") ? ("@" + n) : ("@" + v + "=\"" + n + "\""); };
    return uu.xpath.snap('.//' + (tag || '*') + '[' + x(attr, value || "*") + ']', "", context || uud, false);
  };
}

/** <b>uu.attr.get - 属性の取得(document.getAttribute warpper)</b>
 *
 * 属性(アトリビュート)を取得します。<br />
 * setAttributeで設定された独自の属性があればそちらを取得しますが、
 * Elementノードに同名の属性値があればそちらを優先します。<br />
 * 存在しない属性名を指定した場合は空文字列("")を返します。
 *
 * @param element elm  - 属性を取得する要素を指定します。
 * @param taxing  attr - 属性名の指定です。
 * @return hash/string - attrに複数の属性名を指定すると hash({ attr: value })を返します。<br />
 *                       attrに属性名を1つだけ指定すると 属性値 を文字列で返します。
 *                       存在しない属性名を指定すると、その要素の戻り値は空文字列("")になります。
 * @see uu.attr - 属性の列挙
 * @see uu.attr.set - 属性の設定
 */
uu.attr.get = function(elm, attr) {
  if (!uu.isC(attr)) { return elm.getAttribute(attr); }
  var rv = {};
  uu.notax(attr).forEach(function(v) {
    if (v in elm) {
      rv[v] = elm[v];
    } else if (elm.hasAttribute(v)) {
      rv[v] = elm.getAttribute(v);
    } else {
      rv[v] = "";
    }
  });
  return rv;
};

/** <b>uu.attr.set - 属性の設定(document.setAttribute warpper)</b>
 *
 * 属性(アトリビュート)の設定
 *
 * @param element elm  - 属性を設定する要素を指定します。
 * @param hash    hash - { attr: value, ...} を指定します。
 * @return element - elmを返します。
 * @see uu.attr - 属性の列挙
 * @see uu.attr.get - 属性の取得
 */
uu.attr.set = function(elm, hash) {
  uu.forEach(hash, function(v, i) {
    elm[i] = v;
  });
  return elm;
};

////////////////////////////////////////////////////////////
/** <b>uu.klass - CSSのクラス名と一致する要素を列挙(document.getElementsByClassName wrapper)</b>
 *
 * CSSのクラス名と一致する要素を列挙します。
 *
 * @param string  className - クラス名を指定します。
 * @param element [context] - 検索開始位置(コンテキスト)を指定します。デフォルトはdocumentです(全要素の検索)。
 * @param string  [tag]     - 指定したtagのみ検索対象とする場合に指定します。<br />
 *                            この引数は、getElementsByClassName()が実装されていないブラウザ(Firefox2,IE6/7/8,Opera9.2x)用です。
 * @return NodeList/array   - 検索成功でNodeListまたは要素の配列 [element, ...] を返します。失敗で空のNodeListか配列を返します。<br />
 *                            NodeListまたは配列を返すため、uu.klass().forEach() ではなく、
 *                            uu.forEach(uu.klass())を使用してください。
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 * @class
 */
uu.klass = function(className, context /* = document */, tag /* = undefined */) { // for Firefox3, Safari3, Opera9.5
  return (context || uud).getElementsByClassName(className);
};
if (!uud.getElementsByClassName) { // for Firefox2, IE6/7/8, Opera9.2x
  uu.klass = function(className, context /* = document */, tag /* = undefined */) {
    function x(cn) { return 'contains(concat(" ",@class," ")," ' + cn + ' ")'; }
    var c = className, rule = (c.indexOf(' ') >= 0) ? c.match(/\w+/g).map(x).join(" and ") : x(c);
    return uu.xpath.snap('.//' + (tag || '*') + '[' + rule + ']', "", context || uud, false);
  };
}

/** <b>uu.css - CSS3のセレクタと一致する要素を列挙</b>
 *
 * CSS3のセレクタと一致する要素を列挙します。<br />
 * この関数は内部でCSS3セレクタをXPathに変換します。<br /><br />
 * uu.config.verboseがtrueで、生成したXPathにエラーがある場合は例外をスローします。
 *
 * <pre class="eg">
 *  <div class="header">div.header</div>
 *  <a href="http://www.example.com/" title="CSS3 selector to XPath">CSS3 selector to XPath</a>
 *
 *  uu.css('div.header, a[title*="CSS3"]').forEach(function(v) {
 *    v.style.backgroundColor = "gold";
 *  });
 * </pre>
 *
 * @param string css3selector - CSS3セレクタを指定します。
 * @return array              - 検索成功で要素の配列 [element, ...] を返します。失敗で空の配列を返します。
 * @throws TypeError "uu.css(...)" 使用できないセレクタを指定したか、不正なXPathに変換された
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">使用可能なセレクタ(Selector)</a>
 * @class
 */
uu.css = function(css3selector) {
  var rv = [], xpath, elm, i = 0;
  try {
    xpath = uu.css.toXPath(css3selector);
    if (xpath) {
      elm = document.evaluate(xpath, document, null, 7, null);
      if (elm && "snapshotLength" in elm) {
        for (; i < elm.snapshotLength; ++i) {
          rv.push(elm.snapshotItem(i));
        }
      }
    }
  } catch(e) {
    if (uu.config.verbose) {
      throw TypeError("uu.css(" + css3selector + ") -> " + xpath);
    }
  }
  return rv;
};

/** <b>uu.css.addClass - classNameを追加</b>
 *
 * 要素のclassNameにクラスを追加します。
 *
 * <pre class="eg">
 * uu.forEach(uu.klass("alpha"), function(v) {
 *   uu.css.addClass(v, "beta,hoge,huga,piyo"); // まとめて追加
 * });
 * </pre>
 *
 * @param element elm - 要素を指定します。
 * @param taxing  tax - クラス名を指定します。
 * @see <a href="#hasClass">uu.css.hasClass</a> - classNameがあればtrue
 * @see <a href="#removeClass">uu.css.removeClass</a> - classNameを削除
 */
uu.css.addClass = function(elm, tax) {
  var rv = [];
  uu.notax(tax).forEach(function(v) { rv.push(" " + v); });
  elm.className = uu.rtrim(elm.className) + rv.join("");
};

/** <b>uu.css.hasClass - classNameがあればtrue</b>
 *
 * 要素のclassNameにnameが含まれていればtrueを返します。
 *
 * @param element elm  - 要素を指定します。
 * @param string  name - クラス名を指定します。
 * @return bool        - classNameにnameが含まれていればtrueを返します。
 * @see <a href="#addClass">uu.css.addClass</a> - classNameを追加
 * @see <a href="#removeClass">uu.css.removeClass</a> - classNameを削除
 */
uu.css.hasClass = function(elm, name) {
  return (elm.className + " ").indexOf(name + " ") !== -1;
};

/** <b>uu.css.removeClass - classNameを削除</b>
 *
 * 要素のclassNameから、nameを削除します。
 *
 * <pre class="eg">
 * uu.forEach(uu.klass("alpha"), function(v) {
 *   uu.css.removeClass(v, "beta"); // 削除は１つずつ
 * });
 * </pre>
 *
 * @param element elm - 要素を指定します。
 * @param string  name - クラス名を指定します。
 * @see <a href="#addClass">uu.css.addClass</a> - classNameを追加
 * @see <a href="#hasClass">uu.css.hasClass</a> - classNameがあればtrue
 */
uu.css.removeClass = function(elm, name) {
  var e = elm.className + " ", re = RegExp(name + " ");
  if (re.test(e)) {
    elm.className = e.replace(re, "");
  }
};

/** <b>uu.css.cssProp - css-propをcssPropに変換</b>
 *
 * css-prop("z-index")を、cssProp("zIndex")に変換した新しい文字列を返します。<br />
 * JavaScriptの予約語の変換も行います。例: "float" → "cssFloat"
 *
 * <pre class="eg">
 * uu.css.cssProp("float"); // "cssFloat"
 * uu.css.cssProp("font-weight"); // "fontWeight"
 * </pre>
 *
 * @param string css - css-propを指定します。
 * @return string - 変換後の文字列を返します。
 * @see <a href="#camelize">String.camelize</a> - キャメライズ
 */
uu.css.cssProp = function() {
  function camelize() {
    return this.replace(/-([a-z])/g, function(_, words) {
      return words.toUpperCase();
    });
  }
  var sp = { "float": uu.ua.ie ? "styleFloat" : "cssFloat" };
  return camelize((this in sp) ? sp[this] : this);
};

/** <b>uu.css.get - スタイルの取得(document.defaultView.getComputedStyle wrapper)</b>
 *
 * 要素に適用されている計算済みのスタイルを取得します。<br />
 * この関数はpseudo elementをサポートしません。
 *
 * @param element       elm       - スタイルを取得する要素を指定します。
 * @param taxing        [cssProp] - cssPropまたはcss-propを指定します。省略できます。
 * @param bool          [cure]    - cssPropにcss-prop形式("font-weight")の名前を指定した場合はtrueにします。
 *                                  デフォルトはfalseです。
 * @return hash/string            - cssPropに複数の要素を指定している場合は hash { cssProp: 計算済みのスタイル, ... }を返します。
 *                                  cssPropが単一の要素なら、計算済みのスタイルを文字列で返します。
 *                                  cssPropで指定したスタイルプロパティが存在しない場合は、その要素の値は空文字列("")になります。
 *                                  cssPropを省略した場合は、スタイルのスナップショット(CSS2Propertiesオブジェクト)を返します。
 * @see uu.css.set - スタイルの設定
 * @namespace
 */
uu.css.get = function(elm, cssProp /* = undefined */, cure /* = false */) {
  cure = cure || false;
  var hash, rv = uu.ua.ie ? elm.currentStyle : uud.defaultView.getComputedStyle(elm, "");
  function prop(v) {                        return (v in rv) ? rv[v] : ""; }
  function Prop(v) { v = uu.css.cssProp(v); return (v in rv) ? rv[v] : ""; }
  if (!cssProp) { return rv; }
  cssProp = uu.notax(cssProp);
  if (cssProp.length === 0) { return ""; }
  if (cssProp.length === 1) { return cure ? Prop(cssProp[0]) : prop(cssProp[0]); }
  hash = {};
  cssProp.forEach(function(v) { hash[v] = cure ? Prop(v) : prop(v); });
  return hash;
};

/** <b>uu.css.set - スタイルの設定(set style)</b>
 *
 * スタイルを設定します。<br />
 * 一部のプロパティでは、特別な値や指定方法が有効です。
 * <dl>
 *  <dt>top, left, width, height</dt><dd>値を数値で指定すると末尾に"px"を補完します。</dd>
 *  <dt>display</dt><dd>"hide"を指定すると要素を隠します。"show"を指定すると要素を表示します。</dd>
 * </dl>
 *
 * @param element       elm       - スタイルを設定する要素を指定します。
 * @param hash          hash      - { cssProp: value, ...} または { "css-prop": value, ... } を指定します。
 *                                  keyにCSS名("z-index")を指定することも可能で、その場合はcureにtrueを指定します。
 * @param bool          [cure]    - hashにcss-prop形式("font-weight")の名前を指定した場合はtrueにします。
 *                                  デフォルトはfalseです。
 * @return element                - elmを返します。
 * @see uu.css.get - スタイルの取得
 * @namespace
 */
uu.css.set = function(elm, hash, cure /* = false */) {
  cure = cure || false;
  uu.css.set._chain.forEach(function(v) { // 特別な値や設定を持つものを先に処理しループを軽くする
    if (v in hash) {
      uu.css.set[v](elm, hash[v]);
      delete hash[v];
    }
  });
  uu.forEach(hash, function(v, i) {
    try {
      elm.style[cure ? uu.css.cssProp(i) : i] = v;
    } catch(e) {}
  });
  return elm;
};
uu.css.set._chain = ["opacity", "top", "left", "width", "height", "display"];

/** <b>uu.css.get.opacity - 不透明度の取得</b>
 * @param element elm - スタイルを取得する要素を指定します。
 * @return number - 不透明度を数値で返します。
 */
uu.css.get.opacity = function(elm) {
  return parseFloat(uud.defaultView.getComputedStyle(elm, "").opacity);
};
/** <b>uu.css.set.opacity - 不透明度の設定</b>
 * @param element elm           - スタイルを設定する要素を指定します。
 * @param number/string opacity - 不透明度を数値または数値の文字列表現で指定します。
 *                                指定可能な値は0.0から1.0の値です。
 * @return element - elmを返します。
 */
uu.css.set.opacity = function(elm, opacity) {
  elm.style.opacity = parseFloat(opacity); // .toFixed(6);
  return elm;
};
/** <b>uu.css.get.top - 上からのオフセットを取得</b>
 * @param element elm - オフセットを取得する要素を指定します。
 * @return number     - オフセットをpx単位の数値で返します。
 */
uu.css.get.top = function(elm) {
  return parseFloat(uud.defaultView.getComputedStyle(elm, "").top);
};
/** <b>uu.css.get.top - 上からのオフセットを設定</b>
 * @param element elm         - オフセットを設定する要素を指定します。
 * @param number/string value - オフセット値を指定します。負の値も指定可能です。
 *                              数値で指定すると、末尾に"px"を補完します。
 * @return element            - elmを返します。
 */
uu.css.set.top = function(elm, value) {
  elm.style.top = (typeof value === "number") ? parseInt(value) + "px" : value;
  return elm;
};
/** <b>uu.css.get.left - 左からのオフセットを取得</b>
 * @param element elm - オフセットを取得する要素を指定します。
 * @return number     - オフセットをpx単位の数値で返します。
 */
uu.css.get.left = function(elm) {
  return parseFloat(uud.defaultView.getComputedStyle(elm, "").left);
};
/** <b>uu.css.get.left - 左からのオフセットを設定</b>
 * @param element elm         - オフセットを設定する要素を指定します。
 * @param number/string value - オフセット値を指定します。負の値も指定可能です。
 *                              数値で指定すると、末尾に"px"を補完します。
 * @return element            - elmを返します。
 */
uu.css.set.left = function(elm, value) {
  elm.style.left = (typeof value === "number") ? parseInt(value) + "px" : value;
  return elm;
};
/** <b>uu.css.get.width - 幅の取得</b>
 * @param element elm - 幅を取得する要素を指定します。
 * @return number     - 幅をpx単位の数値で返します。
 */
uu.css.get.width = function(elm) {
  return parseFloat(uud.defaultView.getComputedStyle(elm, "").width);
};
/** <b>uu.css.set.width - 幅の設定</b>
 * @param element       elm   - 幅を設定する要素を指定します。
 * @param number/string value - 幅を指定します。負の値は指定できません。
 *                              数値で指定すると、末尾に"px"を補完します。
 * @return element            - elmを返します。
 */
uu.css.set.width = function(elm, value) {
  try {
    elm.style.width = (typeof value === "number") ? parseInt(value) + "px" : value;
  } catch(e) {
    elm.style.width = "0px";
  }
  return elm;
};
/** <b>uu.css.get.height - 高さの取得</b>
 * @param element elm - 高さを取得する要素を指定します。
 * @return number     - 高さをpx単位の数値で返します。
 */
uu.css.get.height = function(elm) {
  return parseFloat(uud.defaultView.getComputedStyle(elm, "").height);
};
/** <b>uu.css.set.height - 高さの設定</b>
 * @param element       elm   - 高さを設定する要素を指定します。
 * @param number/string value - 高さを指定します。負の値は指定できません。
 *                              数値で指定すると、末尾に"px"を補完します。
 * @return element            - elmを返します。
 */
uu.css.set.height = function(elm, value) {
  try {
    elm.style.height = (typeof value === "number") ? parseInt(value) + "px" : value;
  } catch(e) {
    elm.style.height = "0px";
  }
  return elm;
};
/** <b>uu.css.set.display - 表示方法の設定</b>
 *
 * 要素の表示/非表示を設定します。<br />
 * このメソッドを使用することで、table要素やインライン要素とdiv要素を同じ方法で操作することができます。
 *
 * @param element elm   - 表示方法を設定する要素を指定します。
 * @param string  disp  - style.displayに指定可能な値か、"show" または "hide"を指定します。
 * @return element      - elmを返します。
 */
uu.css.set.display = function(elm, disp) { // for IE, Firefox, Opera, Safari
  var rv = (disp === "hide") ? "none" : disp, me, tag;
  if (disp === "show") {
    me = arguments.callee, tag = elm.tagName.toLowerCase();
    rv = (me._skip.indexOf(tag + ",") !== -1) ? "" :
         (me._block.indexOf(tag + ",") !== -1) ? "block" :
         (tag in me._unique) ? me._unique[tag] : "inline";
  }
  elm.style.display = rv;
  return elm;
};
// XHTML1.x Elements only
uu.css.set.display._skip = ""; // display: が指定できない属性の一覧
uu.css.set.display._block = "p,div,dl,ul,ol,form,address,blockquote,h1,h2,h3,h4,h5,h6,fieldset,hr,pre,";
uu.css.set.display._unique = { table: "table", caption: "table-caption", tr: "table-row", td: "table-cell",
                               th: "table-cell", tbody: "table-row-group", thead: "table-header-group",
                               tfoot: "table-footer-group", col: "table-column", colgroup: "table-column-group" };
// display: tableが機能しないブラウザ(IE6,7)用の処理
if (!uu.ua("display:table")) {
  uu.css.set.display._skip = "table,caption,tr,td,th,tbody,thead,tfoot,col,colgroup,";
  uu.css.set.display._unique = {};
}

if (uu.ua.ie) {
  uu.css.get.opacity = function(elm) {
    return (elm.filters.alpha) ? parseFloat(elm.style.opacity) : 1.0;
  };
  uu.css.set.opacity = function(elm, opacity) {
    elm.style.opacity = parseFloat(opacity); // .toFixed(6); // uu.css.get()で値を取得できるように
    if (elm.filters.alpha) { elm.filters.alpha.opacity = parseFloat(opacity) * 100; }
                      else { elm.style.filter += " alpha(opacity=" + (parseFloat(opacity) * 100) + ")"; }
  };
  uu.css.get.top = function(elm) {
    return parseFloat(elm.currentStyle.top);
  };
  uu.css.get.left = function(elm) {
    return parseFloat(elm.currentStyle.left);
  };
  uu.css.get.width = function(elm) {
    var rv = elm.currentStyle.width;
    return (rv === "auto") ? elm.clientWidth : parseFloat(rv); // IEは計算せずに"auto"を返してくる
  };
  uu.css.get.height = function(elm) {
    var rv = elm.currentStyle.height;
    return (rv === "auto") ? elm.clientHeight : parseFloat(rv); // IEは計算せずに"auto"を返してくる
  };
}

/** <b>uu.css.toXPath - CSS3セレクタをXPathに変換</b>
 *
 * CSS3のセレクタ(一部除く)をXPathに変換します。<br />
 * 対応状況は用語集を確認してください。<br /><br />
 *
 * CSS3の擬似クラス(:enabled, :disabled, :checked)に対応していない理由。<br />
 *
 * &lt;input id="element" type="checkbox" checked="checked" /&gt;はHTMLパース時に、<br />
 * 1. JavaScriptのプロパティとしての element.checked がtrueに設定される。<br />
 * 2. element.setAttribute("checked", "checked"); 相当の処理が行われる。<br />
 *
 * チェックボックスをクリックすると、<br />
 * 1. JavaScriptのプロパティとしての element.checked がtrueかfalseに設定される。<br />
 * 2. element.setAttribute("checked", 現在の値); 相当の処理は行われない。<br />
 *
 * XPathの@(attribute::)はsetAttribute()で設定された値に反応するため、画面の見た目と、XPathで選択される要素が異なってしまう。
 *
 * @param string css3selectors - CSS3のセレクタを指定します。
 * @return string - 成功でXPathのロケーションパスを返します。
 *                  変換失敗で空文字列("")を返します。
 * @see http://www.w3.org/TR/css3-selectors/
 */
uu.css.toXPath = function(css3selectors) {
  return css3selectors.split(",").map(uu.css.toXPath._impl).join(" | ");
}
uu.css.toXPath._impl = function(sel) {
  var rv = ["//", "*"], exp = uu.css.toXPath._impl._regexp, index = 1, last = null, m, m2;

  function reset(E) { rv.length = 0, rv.push(E), index = 0; }
  function nth(str) { return (!isNaN(str)) ? /*(*/ (")=" + parseInt(str) + "-1") :
                             (str === "even" || str === "2n")   ? /*(*/ ")mod 2=1" :
                             (str === "odd"  || str === "2n+1") ? /*(*/ ")mod 2=0" :
                             (exp["xn+y"].test(str)) ? str.replace(exp["xn+y"], /*(*/ "+ $2)mod $1=1") :    // 4n + 1
                             (exp.xn.test(str))      ? str.replace(exp.xn,      /*(*/ ")mod $1=1") : /*(*/ ")"; } // 3n
  while (sel.length && sel != last) {
    last = sel = uu.trim(sel);
    if (!sel.length) { break; }

    // Element phase: E.className, E#id
    m = sel.match(exp.ELM);
    if (m) {
      switch (m[1]) {
      case ".": rv.push('[contains(concat(" ",@class," ")," ' + m[2] + ' ")]'); break;
      case "#": rv.push('[@id="' + m[2] + '"]'); break;
      default:  rv[index] = m[2];
      }
      sel = sel.substring(m[0].length);
    }
    // Attr phase: E[A], E[A=V], E[A~=V], E[A$=V], E[A*=V], E[A|=V]
    m = sel.match(exp.ATTR1);
    if (m) {
      (m[2] in uu.css.toXPath._impl._attr) && rv.push(uu.sprintf(uu.css.toXPath._impl._attr[m[2]], m[1], m[4]));
      sel = sel.substring(m[0].length);
    } else {
      m = sel.match(exp.ATTR2);
      if (m) {
        rv.push("[@" + m[1] + "]");
        sel = sel.substring(m[0].length);
      }
    }
    // Attr phase: E:not(selector) - sorry. not impl.

    // Pseudo-classes and Pseudo-elements phase:
    m = sel.match(exp.PSEUDO);
    while (m) {
      switch (m[1]) {
      case "root":          rv.push("*[not(parent::*)]"); break;
      case "first-child":   rv.push("[not(preceding-sibling::*)]"); break;
      case "last-child":    rv.push("[not(following-sibling::*)]"); break;
      case "only-child":    rv.push("[count(parent::*/child::*)=1]"); break;
/* 非対応 - これらはuu.pseudo.xxxメソッドとして実装する
      case "animated":      break;
      case "checked":       rv.push('[@checked and (@checked="true" or @checked="checked")]'); break;
      case "selected":      break;
      case "hidden":        rv.push('input[@type="hidden"]'); break; // style.display="none" や style.visibility="hidden" には非対応
      case "visible":       break;
 */
      case "enabled":       rv.push('[not(@disabled)]'); break;
      case "disabled":      rv.push('[@disabled="disabled"]'); break;
      case "nth-child":       rv.push(uu.sprintf("[(count(preceding-sibling::*)%1$s]", nth(m[2]))); break; // )
      case "nth-last-child":  rv.push(uu.sprintf("[(count(following-sibling::*)%1$s]", nth(m[2]))); break; // )
      case "nth-of-type":     rv.push(uu.sprintf("[(count(preceding-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
      case "nth-last-of-type":rv.push(uu.sprintf("[(count(following-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
      case "first-of-type":   rv.push(uu.sprintf("[(not(preceding-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
      case "last-of-type":    rv.push(uu.sprintf("[(not(following-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
      case "only-of-type":    rv.push(uu.sprintf("[count(parent::*/child::%s)=1]",rv[index])); break;
      // ---
      case "first":         rv.push("[1]"); break;
      case "last":          rv.push("[last()]"); break;
      case "even":          rv.push("[(count(preceding-sibling::*))mod 2=0]"); break;
      case "odd":           rv.push("[(count(preceding-sibling::*))mod 2=1]"); break;
      case "eq":            reset(uu.sprintf("/descendant::%s[%d]", rv[index], parseInt(m[2]) + 1)); break;
      case "gt":            reset(uu.sprintf("/descendant::%s[position() > %d]", rv[index], parseInt(m[2]) + 1)); break;
      case "lt":            reset(uu.sprintf("/descendant::%s[position() < %d]", rv[index], parseInt(m[2]) + 1)); break;
      case "header":        reset(uu.sprintf("//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]")); break;
      case "contains":      rv.push(uu.sprintf("[contains(string(), %s)]", m[2])); break;
      case "empty":         rv.push("[not(*) and not(text())]"); break;
      case "parent":        rv.push("[text()]"); break;
      case "input":         rv.push("*[self::input or self::textarea or self::select or self::button]"); break;
      case "text":          rv.push('input[@type="text"]'); break;
      case "password":      rv.push('input[@type="password"]'); break;
      case "radio":         rv.push('input[@type="radio"]'); break;
      case "checkbox":      rv.push('input[@type="checkbox"]'); break;
      case "submit":        rv.push('input[@type="submit"]'); break;
      case "image":         rv.push('input[@type="image"]'); break;
      case "reset":         rv.push('input[@type="reset"]'); break;
      case "button":        rv.push('*[self::input[@type="button"] or self::button]'); break;
      case "file":          rv.push('input[@type="file"]'); break;
      }
      sel = sel.substring(m[0].length);
      m = sel.match(exp.PSEUDO); // 書き方が冗長なのはstrictにするため
    }
    // Combinator phase: E F, E > F, E + F, E ~ F
    m = sel.match(exp.COMBO1);
    if (m) {
      if (m[1] === "+") { // E + F のケースでは、Fを先読みする必要がある
        sel = sel.substring(m[0].length);
        m2 = sel.match(exp.COMBO2);
        if (m2) {
          rv.push('/following-sibling::*[1][self::' + m2[1] +']'); // とりあえ's
          sel = sel.substring(m2[0].length);
        }
      } else {
        switch (m[1]) {
        case ">": rv.push("/"); break;
        case "~": rv.push("/following-sibling::"); break;
        default:  rv.push("//"); break;
        }
        index = rv.length;
        rv.push("*");
        sel = sel.substring(m[0].length);
      }
    }
  }
  return rv.join("");
}
uu.css.toXPath._impl._regexp = {
  ELM:                /^([\.\#]?)([a-z0-9\*\_\-]*)/i,     // E
  ATTR1:              /^\[\s*([^\~\^\$\*\|\=\s]+)\s*([\~\^\$\*\|]?=)\s*(['"])([^"']*)\3\s*\]/, // E[A=V]
  ATTR2:              /^\[\s*([^\]]*)\s*\]/,              // E[A]
  COMBO1:             /^(?:\s*([\>\+\~\s]))/,             // E F, E > F, E + F, E ~ F
  COMBO2:             /^\s*([a-z0-9\*\_\-]+)/i,           // E + F の F用
  PSEUDO:             /^\:([\w-]+)(?:\((.*)\))?/i,        // :nth-child(n)
  "2n+1":             /2n\+1/,                            // :nth-child(2n+1)
  "xn+y":             /([\d]+)n\+([\d]+)/,                // :nth-child(xn+y)
  xn:                 /([\d]+)n/                          // :nth-child(xn)
};
uu.css.toXPath._impl._attr = {
  "=":                '[@%1$s="%2$s"]',
  "~=":               '[contains(concat(" ",@%1$s," ")," %2$s ")]',
  "^=":               '[starts-with(@%1$s,"%2$s")]',
  "$=":               '[substring(@%1$s,string-length(@%1$s)-string-length("%2$s")+1)="%2$s"]',
  "*=":               '[contains(@%1$s,"%2$s")]',
  "|=":               '[@%1$s="%2$s" or starts-with(@%1$s,"%2$s-")]'
};

////////////////////////////////////////////////////////////
/** <b>uu.tag - タグ名と一致する要素を列挙(document.getElementsByTagName wrapper)</b>
 *
 * タグ名と一致する要素を列挙します。
 *
 * <pre class="eg">
 *  uu.tag("div"); // div要素を列挙
 *  uu.tag("script", document.head); // head要素以下のscript要素を列挙
 *  uu.tag("*"); // 全ての要素を列挙
 * </pre>
 *
 * @param string  tagName   - タグ名を指定します。
 *                            "*"(ワイルドカード)を指定すると、全てのタグを検索します。
 * @param element [context] - 検索開始位置(コンテキスト)を指定します。デフォルトはdocumentです。
 * @return NodeList/array     検索成功でNodeListまたは要素の配列 [element, ...] を返します。失敗で空のNodeListか配列を返します。<br />
 *                            NodeListまたは配列を返すため、uu.tag().forEach() ではなく、
 *                            uu.forEach(uu.tag())を使用してください。
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 * @class
 */
uu.tag = function(tagName, context /* = document */) {
  return (context || uud).getElementsByTagName(tagName);
};

////////////////////////////////////////////////////////////
/** <b>uu.xpath - XPathで検索(document.evaluate wrapper)</b>
 *
 * XPath式で要素を検索します。
 *
 * @param string  expr      - XPathの評価式(ロケーションパス)を指定します。
 * @param element [context] - 検索開始位置(コンテキスト)を指定します。デフォルトはdocumentです。
 *                            コンテキストを指定した場合は、exprに"//"ではなく"./"で始まる文字列を指定します。
 * @return mix              - 評価結果を返します。評価に失敗するとnullを返します。
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 * @class
 */
uu.xpath = function(expr, context /* = document */) {
  var rv = [], i, r = uud.evaluate(expr, context || uud, null, 0, null); // ANY_TYPE = 0
  switch (r.resultType) {
  case 1: rv = r.numberValue; break;  // NUMBER_TYPE = 1
  case 2: rv = r.stringValue; break;  // STRING_TYPE = 2
  case 3: rv = r.booleanValue; break; // BOOLEAN_TYPE = 3
  case 4: i = r.iterateNext();
          while (i) { rv.push(i); i = r.iterateNext(); } // コードが冗長なのはstrictにするため
          break; // UNORDERED_NODE_ITERATOR_TYPE = 4
  }
  return rv;
};

/** <b>uu.xpath.snap - XPathの検索結果をスナップ(XPath snapshot)</b>
 *
 * XPathの検索結果のスナップショットを取得します。<br />
 * setAttributeで設定された独自の属性があればそちらを取得しますが、
 * Elementノードに同名の属性値があればそちらを優先します。<br />
 * 存在しない属性名を指定した場合は空文字列("")を返します。
 *
 * <dl>
 *  <dt>div要素を列挙。uu.tags("div")と等価</dt>
 *    <dd>uu.xpath.snap('//div');</dd>
 *  <dt>div class="piyo"要素を列挙</dt>
 *    <dd>uu.xpath.snap('//div[@class="piyo"]');</dd>
 *  <dt>全要素からclass="piyo"を持つ要素を列挙, class="piyo hoge"もヒット, uu.tag("piyo")と等価</dt>
 *    <dd>uu.xpath.snap('//*[contains(@class,"piyo")]');</dd>
 *  <dt>全要素からid属性を持つものを列挙</dt>
 *    <dd>uu.xpath.snap('//*[@id!=""]', id);</dd>
 *  <dt>title="hoge"でclass="piyo"な要素を列挙</dt>
 *    <dd>uu.xpath.snap('//*[@title="hoge" and @class="piyo"]');</dd>
 *  <dt>コンテキスト以下のdiv要素で、class="draggable"を持つ子孫ノードを列挙</dt>
 *    <dd>uu.xpath.snap('./div[@class="draggable"]', "id", コンテキスト);<br />
 *        uu.xpath.snap('//div[@class="draggable"]'); とするとコンテキストを無視して、
 *        全divを検索するため意図しない結果になるので注意が必要です。</dd>
 * </dl>
 *
 * @param string  expr      - XPathの評価式(ロケーションパス)を指定します。
 * @param string  [attr]    - 取得する属性を指定します。デフォルトは空文字列です。
 * @param element [context] - 検索開始位置(コンテキスト)を指定します。デフォルトはdocumentです。
 *                            コンテキストを指定した場合は、exprに"//"ではなく"./"で始まる文字列を指定します。
 * @param bool    [sort]    - ソートする場合にtrue,ソートしない場合にfalseを指定します。省略可能でデフォルトはtrueです。<br />
 * @return array            - attrを指定した場合は、列挙した要素の属性値だけからなる配列 [値, 値, ...]を返します。<br />
 *                            attrを指定しない場合は、要素の参照の配列を返します。<br />
 *                            返される値は、ある時点のスナップショットです(ライブではない)
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm">セレクタ(Selector)</a>
 */
uu.xpath.snap = function(expr, attr /* = "" */, context /* = document */, sort /* = true */) {
  attr = attr || "";
  var rv = [], e, i = 0, n = uud.evaluate(expr, context || uud, null, sort ? 7 : 6, null);
  if (attr.length) {
    for (; i < n.snapshotLength; ++i) {
      e = n.snapshotItem(i);
      if (attr in e) {
        rv.push(e[attr]);
      } else if (e.hasAttribute(attr)) {
        rv.push(e.getAttribute(attr));
      } else {
        rv.push("");
      }
    }
  } else {
    for (; i < n.snapshotLength; ++i) {
      rv.push(n.snapshotItem(i));
    }
  }
  return rv;
};

////////////////////////////////////////////////////////////
/** <b>Event</b>
 *
 * @class
 */
uu.event = function() {
};

/** <b>uu.event.handler - uu.event.set()用の引数を生成</b>
 *
 * @param this    me    thisを指定します。
 * @return object       uu.event.set()用のオブジェクトを返します。
 * @see uu.event.set - イベントハンドラの設定 
 * @see uu.event.unset - イベントハンドラの解除
 * @see JavaScript第5版 420p
 */
uu.event.handler = function(me) { return me; };

/** <b>uu.event.set - イベントハンドラの設定(addEventListener wrapper)</b>
 *
 * イベントハンドラを設定します。<br />
 * イベントハンドラを解除するには、uu.event.set()と同じ引数をuu.event.unset()で指定します。<br />
 *
 * 一時的なオブジェクト(匿名のfunction()等)をfnに指定すると、
 * uu.event.unset()でイベントを解除できなくなりますので注意してください。
 *
 * @param element     elm       - イベントを設定する要素を指定します。
 * @param taxing      type      - イベントタイプを指定します。
 * @param function    fn        - uu.event.handler()の戻り値か関数を指定します。
 * @param bool        [capture] - イベントをキャプチャーする場合はtrueを指定します。
 *                                                  通常のイベントハンドラを登録する場合はfalseを指定します。
 * @see uu.event.handler - uu.event.set()用の引数を生成
 * @see uu.event.unset - イベントハンドラの解除
 */
uu.event.set = function(elm, type, fn, capture /* = false */) {
  if (uu.isU(fn)) { throw TypeError("uu.event.set(fn)"); }
  function impl(name) { elm.addEventListener(uu.event.type.toDOM(name), fn, capture || false); }
  uu.notax(type).forEach(impl);
};

/** <b>uu.event.unset - イベントハンドラの解除(removeEventListener wrapper)</b>
 *
 * イベントハンドラを解除します。<br />
 * イベントハンドラを解除するには、uu.event.set()と同じ引数を指定します。
 *
 * @param element     elm       - イベントを解除する要素を指定します。
 * @param taxing      type      - イベントタイプを指定します。
 * @param object      fn        - uu.handleEvent()の戻り値か関数を指定します。
 * @param bool        [capture] - キャプチャーを解除する場合はtrueを指定します。
 *                                通常のイベントハンドラを解除する場合はfalseを指定します。
 * @see uu.event.handler - uu.event.set()用の引数を生成
 * @see uu.event.set - イベントハンドラの設定
 */
uu.event.unset = function(elm, type, fn, capture /* = false */) {
  if (uu.isU(fn)) { throw TypeError("uu.event.set(fn)"); }
  function impl(name) { elm.removeEventListener(uu.event.type.toDOM(name), fn, capture || false); }
  uu.notax(type).forEach(impl);
};

/** <b>uu.event.stop - イベントの停止(stopPropagation and preventDefault wrapper)</b>
 *
 * イベントのバブルアップ(伝播)と、可能ならデフォルトの動作を抑止します。
 *
 * @param event evt       - イベントオブジェクトを指定します。
 * @param bool  [cancel]  - ブラウザが実装しているデフォルトの動作をキャンセルする場合にtrueを指定します。
 *                          キャンセルできない場合は無視されます。
 */
uu.event.stop = function(evt, cancel /* = true */) {
  evt.stopPropagation();
//uu.defArg(cancel, true) && evt.preventDefault();
  (uu.isU(cancel) || cancel) && evt.preventDefault();
};

/** <b>uu.event.target - イベント発生元のノードを取得</b>
 *
 * イベント発生元を特定する情報を返します。
 *
 *  <dl>
 *    <dt>real</dt><dd>イベント発生源のノード</dd>
 *    <dt>curt</dt><dd>現在処理中のノード(キャプチャリング/バブリング中)のカレントノード(Firefox, Safari, Opera)</dd>
 *    <dt>rel</dt><dd>realの対ノード<br />
 *        realでmouseover発生時に、relにmouseoutした要素が格納される、<br />
 *        realでmouseout発生時は、relにmouseoverした要素が格納される。</dd>
 *  </dl>
 *
 * @param event evt       - イベントオブジェクトを指定します。
 * @return hash           - hash({ real, curt, rel }) を返します。
 */
uu.event.target = function(evt) { // for Firefox, Safari, Opera
  return { real: evt.target, curt: evt.currentTarget, rel: evt.relatedTarget };
};

/** <b>uu.event.type - イベント名をDOM Level 0イベントタイプに変換</b>
 *
 * @private
 * @param string  type  - イベントタイプを指定します。
 * @return string       - 変換後のイベントタイプを返します。
 */
uu.event.type = function(type) {
  switch (type) {
  case "onlosecapture": type = "mouseup"; break;
  case "DOMMouseScroll": type = "mousewheel"; break;
  }
  return type;
};
/** <b>uu.event.type.toDOM - 非DOMイベント名をDOMイベントタイプに変換</b>
 *
 * @private
 * @param string  type  - イベントタイプを指定します。
 * @return string       - 変換後のイベントタイプを返します。
 */
uu.event.type.toDOM = function(type) { return type; };
if (uu.ua.gecko) { // for Firefox
  uu.event.type.toDOM = function(type) {
    return (type === "mousewheel") ? "DOMMouseScroll" : type;
  };
}

if (uu.ua.ie) { // for IE
  // 第一引数で渡されるthis(me)を保持し、this.handleEvent.call(this, event) を実現するクロージャ
  uu.event.handler = function(me) {
    return function(e) { me.handleEvent(e); };
  };
  uu.event.set = function(elm, type, fn, capture /* = false */) {
    type = uu.notax(type);
    if ((capture || false) && ("setCapture" in elm)) {
      elm.setCapture();                 // キャプチャ開始
      type.unshift("onlosecapture");    // キャプチャロスト時にコールされるイベントハンドラを先頭に挿入
    }
    function impl(name) { elm.attachEvent("on" + name, fn); }
    type.forEach(impl);
  };
  uu.event.unset = function(elm, type, fn, capture /* = false */) {
    type = uu.notax(type);
    if ((capture || false) && ("releaseCapture" in elm)) {
      type.unshift("onlosecapture");    // uu.event.set()で自動挿入したイベントハンドラをここでも
      elm.releaseCapture();             // キャプチャ終了
    }
    function impl(name) { elm.detachEvent("on" + name, fn); }
    type.forEach(impl);
  };
  uu.event.stop = function(evt, cancelDefault /* = true */) {
    evt.cancelBubble = true;
    if (uu.isU(cancelDefault) || cancelDefault) { evt.returnValue = false; }
  };
  uu.event.target = function(evt) {
    var s = evt.srcElement, f = evt.fromElement;
    return { real: s, curt: s, rel: s === f ? evt.toElement : f };
  };
}

////////////////////////////////////////////////////////////
/** <b>DOM</b>
 *
 * @class
 */
uu.dom = function() {
};

/** <b>uu.dom.already - DOM使用可能でtrue</b>
 *
 * @return bool - DOMが使用可能な状態ならtrueを返します。
 */
uu.dom.already = function() {
  return !!uu.dom.ready._run;
};

/** <b>uu.dom.ready - document.DOMContentLoadedイベントハンドラ(document.DOMContentLoaded event handler)</b>
 *
 * DOMが使用可能になると呼ばれる関数を登録します。<br />
 * document.DOMContentLoadedをサポートしていないブラウザ(IE, Safari)では同様の機能をエミュレートします。<br />
 *
 * 既にDOMが使用可能になっている状態(uu.dom.already()==true)で呼ばれた場合は、
 * 即座に関数を実行します。
 *
 * @param function/array fn - コールバック関数を指定します。関数の配列も指定可能です。
 * @see uu.dom.already - dom使用可能でtrue
 * @see uu.canvas.ready - canvasが使用可能になると呼ばれる関数を登録
 * @see uu.canvas.already - canvas使用可能でtrue
 * @see uu.window.ready - windowが使用可能になると呼ばれる関数を登録
 * @see uu.window.already - window使用可能でtrue
 * @see uu.window.unready - windowが使用不能になると呼ばれる関数を登録
 * @see uu.window.unalready - window使用不能でtrue
 */
uu.dom.ready = function(fn) {
  var e = arguments.callee;
  if (e._run) {
    (uu.isA(fn) ? fn : [fn]).forEach(function(v) { v(); });
  } else {
    e._stock = e._stock.concat(fn);
    if (uu.ua.gecko || uu.ua.opera) {
      uud.addEventListener("DOMContentLoaded", uu.dom.ready._impl, false);
    } else if (uu.ua.ie && uud.readyState) {
      uud.write('<script type="text/javascript" defer="defer" src="//:" onreadystatechange="(this.readyState==\'loaded\'||this.readyState==\'complete\')&&uu&&uu.dom.ready._impl()"></script>');
    } else if (uu.ua.webkit && uud.readyState) {
      uuw.setTimeout(function() {
        (/loaded|complete/.test(uud.readyState)) ? uu.dom.ready._impl() : uuw.setTimeout(arguments.callee, 0);
      }, 0);
    } else {
      uu.window.ready(uu.dom.ready._impl); // レガシーブラウザならwindow.onloadで代用(for legacy browser)
    }
  }
};
uu.dom.ready._run = 0; // uu.dom.ready()実行回数
uu.dom.ready._stock = []; // uu.dom.ready()用イベントコンテナ
uu.dom.ready._impl = function() { // uu.dom.ready()の実処理部
  var e = uu.dom.ready;
  !e._run++ && (e._stock.forEach(function(v) { v(); }), e._stock = []); // gc
};

////////////////////////////////////////////////////////////
/** <b>Window</b>
 *
 * @class
 */
uu.window = function() {
};

/** <b>uu.window.already - windowロード済みでtrue</b>
 *
 * @return bool - windowロード済みでtrueを返します。
 */
uu.window.already = function() {
  return !!uu.window.ready._run;
};

/** <b>uu.window.unalready - windowアンロード済みでtrue</b>
 *
 * @return bool - windowアンロード済みでtrueを返します。
 */
uu.window.unalready = function() {
  return !!uu.window.unready._run;
};

/** <b>uu.window.ready - window.onloadイベントハンドラ(window.onload event handler)</b>
 *
 * windowが使用可能になると呼ばれる関数を登録します。<br />
 *
 * 既にwindowが使用可能になっている状態(uu.window.already()==true)で呼ばれた場合は、
 * 即座に関数を実行します。
 *
 * @param function/array  fn - コールバック関数を指定します。関数の配列も指定可能です。
 * @see uu.dom.ready - domが使用可能になると呼ばれる関数を登録
 * @see uu.dom.already - dom使用可能でtrue
 * @see uu.canvas.ready - canvasが使用可能になると呼ばれる関数を登録
 * @see uu.canvas.already - canvas使用可能でtrue
 * @see uu.window.already - window使用可能でtrue
 * @see uu.window.unready - windowが使用不能になると呼ばれる関数を登録
 * @see uu.window.unalready - window使用不能でtrue
 */
uu.window.ready = function(fn) {
  var e = arguments.callee;
  if (e._run) { (uu.isA(fn) ? fn : [fn]).forEach(function(v) { v(); }); }
         else { e._stock = e._stock.concat(fn);
                !e._run && uu.event.set(uuw, "load", e._impl, false); } // stock
};
uu.window.ready._run = 0; // uu.window.ready()実行回数
uu.window.ready._stock = []; // uu.window.ready()用イベントコンテナ
uu.window.ready._impl = function() { // uu.window.ready()の実処理部
  var e = uu.window.ready;
  !e._run++ && (e._stock.forEach(function(v) { v(); }), e._stock = []); // gc
};

/** <b>uu.window.unready - window.onunloadイベントハンドラ(window.onunload event handler)</b>
 *
 * windowが使用不能になると呼ばれる関数を登録します。<br />
 * uu.window.ready()と違い、即座に実行する機能はありません。
 *
 * @param function/array  fn   - コールバック関数を指定します。関数の配列も指定可能です。
 * @param this            [me] - fn実行時のthisを指定します。デフォルトはundefinedです。
 * @see uu.dom.ready - domが使用可能になると呼ばれる関数を登録
 * @see uu.dom.already - dom使用可能でtrue
 * @see uu.canvas.ready - canvasが使用可能になると呼ばれる関数を登録
 * @see uu.canvas.already - canvas使用可能でtrue
 * @see uu.window.ready - windowが使用可能になると呼ばれる関数を登録
 * @see uu.window.already - window使用可能でtrue
 * @see uu.window.unready - windowが使用不能になると呼ばれる関数を登録
 * @see uu.window.unalready - window使用不能でtrue
 */
uu.window.unready = function(fn, me /* = undefined */) {
  var e = arguments.callee;
  if (uu.isA(fn)) { e._stock.forEach(function(v) { e._stock.push([v, me]); }); }
             else { e._stock.push([fn, me]); }
  !e._run && uu.event.set(uuw, "unload", e._impl, false); // stock
};
uu.window.unready._run = 0; // uu.window.unready()実行回数
uu.window.unready._stock = []; // uu.window.unready()用イベントコンテナ
uu.window.unready._impl = function() { // uu.window.unready()の実処理部
  var e = uu.window.unready;
  !e._run++ && (e._stock.forEach(function(v) { uu.isF(v[0]) && v[0].call(v[1]); }),
                e._stock = []); // gc
};

////////////////////////////////////////////////////////////
/** <b>canvas</b>
 *
 * @class
 */
uu.canvas = function() {
};

/** <b>uu.canvas.already - canvas使用可能でtrue</b>
 *
 * @return bool - canvasが使用可能でtrueを返します。
 */
uu.canvas.already = function() {
  return !!uu.canvas.ready._run;
};

/** <b>uu.canvas.ready - canvas.readyイベントハンドラ(canvas.ready event handler)</b>
 *
 * canvasが使用可能になると呼ばれる関数を登録します。
 *
 * @param function/function array fn - コールバック関数を指定します。関数の配列も指定可能です。
 * @see uu.dom.ready - domが使用可能になると呼ばれる関数を登録
 * @see uu.dom.already - dom使用可能でtrue
 * @see uu.canvas.already - canvas使用可能でtrue
 * @see uu.window.ready - windowが使用可能になると呼ばれる関数を登録
 * @see uu.window.already - window使用可能でtrue
 * @see uu.window.unready - windowが使用不能になると呼ばれる関数を登録
 * @see uu.window.unalready - window使用不能でtrue
 */
uu.canvas.ready = function(fn) {
  if (uu.ua.ie) { // environment check
    if (!uud.getElementById("excanvas.js")) { // need <script id="excanvas.js" src="excanvas.js"></script>
      throw Error('ERR-02: <script id="excanvas.js" src="{{path}}/excanvas.js"> not exist');
    }
  }
  function judge() {
    return uu.toArray(uu.tag("canvas")).every(function(v) { return uu.isF(v.getContext); });
  }
  var e = arguments.callee;
  if (e._run) {
    (uu.isA(fn) ? fn : [fn]).forEach(function(v) { v(); });
  } else {
    e._stock = e._stock.concat(fn);
    if (uu.ua.gecko || uu.ua.webkit) {
      e._impl();
    } else if (uu.ua.opera) { // Opera9.5xからcanvasの初期化タイミングが不安定になったため
      uuw.setTimeout(function() {
        judge() ? e._impl() : uuw.setTimeout(arguments.callee, 100); // 100ms
      }, 0);
    } else if (uu.ua.ie) {
      uu.window.ready(function() {
        uuw.setTimeout(function() {
          judge() ? e._impl() : uuw.setTimeout(arguments.callee, 100); // 100ms
        }, 0);
      });
    }
  }
};
uu.canvas.ready._run = 0; // uu.canvas.ready()実行回数
uu.canvas.ready._stock = []; // uu.canvas.ready()用イベントコンテナ
uu.canvas.ready._impl = function() { // uu.canvas.ready()の実処理部
  var e = uu.canvas.ready;
  !e._run++ && (e._stock.forEach(function(v) { v(); }), e._stock = []); // gc
};

////////////////////////////////////////////////////////////
/** <b>Ajax</b>
 *
 * @class
 */
uu.ajax = function() {
};

/** <b>uu.ajax.already - Ajax使用可能でtrue</b>
 *
 * @return bool Ajax使用可能でtrueを返します。
 */
uu.ajax.already = function() {
  return uuw.XMLHttpRequest || uuw.ActiveXObject;
};

/** <b>uu.ajax.load - 非同期ロード[Ajax async request]</b>
 *
 * Ajaxで非同期にデータを取得します。
 *
 *  <table>
 *  <tr><th>step番号</th><th>内容</th></tr>
 *  <tr><td>0</td><td>BEGIN: 処理開始     </td></tr>
 *  <tr><td>1</td><td>SEND: リクエスト開始</td></tr>
 *  <tr><td>2</td><td>OK: 成功            </td></tr>
 *  <tr><td>3</td><td>NG: 失敗            </td></tr>
 *  <tr><td>4</td><td>END: 処理終了       </td></tr>
 *  </table>
 *
 * 各ステップで、fn(step番号, response, status, url, async)を呼び出します。<br />
 * responseには空文字列またはレスポンス文字列が格納されます(OKのみ)。<br />
 * statusには0またはステータスコードが格納されます(OKとNGのみ)。<br />
 * asyncは常にtrueになります。<br />
 *
 * @param string   url    - リクエストURLを指定します。
 * @param function [fn]   - リクエスト終了で呼び出す関数を指定します。デフォルトはundefinedです。
 * @param string   [data] - encodeURIComponent済みの key = value のペアを渡します。
 *                          dataに文字列を指定するとpostメソッドを使用します。デフォルトはnullです。
 * @see <a href="#.timeout">uu.ajax.timeout</a> - タイムアウト時間の指定
 * @see <a href="#.already">uu.ajax.already</a> - Ajax使用可能でtrue
 * @see <a href="#.loadIfMod">uu.ajax.loadIfMod</a> - 更新チェック付き非同期ロード
 * @see <a href="#.load">uu.ajax.load</a> - 非同期ロード
 * @see <a href="#.loadSync">uu.ajax.loadSync</a> - 同期ロード
 */
uu.ajax.load = function(url, fn /* = undefined */, data /* = null */) {
  if (!url) { throw TypeError("uu.ajax.load(url)"); }
  uu.ajax.load._impl(url, fn || uu.mute, data || null, false);
};

/** <b>uu.ajax.loadIfMod - 更新チェック付き非同期ロード[Ajax async request with new-arrival check]</b>
 *
 * Ajaxで非同期にデータを取得します。<br />
 * loadIfMod()は、POSTメソッドが使用できません。<br />
 *
 *  <table>
 *  <tr><th>step番号</th><th>内容</th></tr>
 *  <tr><td>0</td><td>BEGIN: 処理開始     </td></tr>
 *  <tr><td>1</td><td>SEND: リクエスト開始</td></tr>
 *  <tr><td>2</td><td>OK: 成功            </td></tr>
 *  <tr><td>3</td><td>NG: 失敗            </td></tr>
 *  <tr><td>4</td><td>END: 処理終了       </td></tr>
 *  </table>
 *
 * 各ステップで、fn(ユニークID, step番号, response, status, url, async)を呼び出します。<br />
 * responseには空文字列またはレスポンス文字列が格納されます(OKのみ)。<br />
 * statusには0またはステータスコードが格納されます(OKとNGのみ)。<br />
 * asyncは常にtrueになります。<br />
 * 過去に同じURLをリクエストしており、サーバ上のファイルが未更新ならfn(NG, "", 304, url, true)を返します。<br />
 *
 * @param string   url - リクエストURLを指定します。
 * @param function [fn] - 各stepで呼び出す関数を指定します。デフォルトはundefinedです。
 * @see <a href="#.timeout">uu.ajax.timeout</a> - タイムアウト時間の指定
 * @see <a href="#.already">uu.ajax.already</a> - Ajax使用可能でtrue
 * @see <a href="#.loadIfMod">uu.ajax.loadIfMod</a> - 更新チェック付き非同期ロード
 * @see <a href="#.load">uu.ajax.load</a> - 非同期ロード
 * @see <a href="#.loadSync">uu.ajax.loadSync</a> - 同期ロード
 */
uu.ajax.loadIfMod = function(url, fn /* = undefined */) {
  if (!url) { throw TypeError("uu.ajax.loadIfMod(url)"); }
  uu.ajax.load._impl(url, fn || uu.mute, null, true);
},

/** <b>uu.ajax.loadSync - 同期ロード[Ajax sync request]</b>
 *
 * Ajaxでデータを取得します。<br />
 * 同期リクエストなのでタイムアウトしません。
 *
 *  <table>
 *  <tr><th>step番号</th><th>内容</th></tr>
 *  <tr><td>0</td><td>BEGIN: 処理開始     </td></tr>
 *  <tr><td>1</td><td>SEND: リクエスト開始</td></tr>
 *  <tr><td>2</td><td>OK: 成功            </td></tr>
 *  <tr><td>3</td><td>NG: 失敗            </td></tr>
 *  <tr><td>4</td><td>END: 処理終了       </td></tr>
 *  </table>
 *
 * 各ステップで、fn(ユニークID, step番号, response, status, url, async)を呼び出します。<br />
 * responseには空文字列またはレスポンス文字列が格納されます(OKのみ)。<br />
 * statusには0またはステータスコードが格納されます(OKとNGのみ)。<br />
 * asyncは常にfalseになります。<br />
 *
 * @param string   url    - リクエストURLを指定します。
 * @param function [fn]   - リクエスト終了で呼び出す関数を指定します。デフォルトはundefinedです。
 * @param string   [data] - encodeURIComponent済みの key = value のペアを渡します。
 *                          dataに文字列を指定するとpostメソッドを使用します。デフォルトはnullです。
 * @see <a href="#.already">uu.ajax.already</a> - Ajax使用可能でtrue
 * @see <a href="#.loadIfMod">uu.ajax.loadIfMod</a> - 更新チェック付き非同期ロード
 * @see <a href="#.load">uu.ajax.load</a> - 非同期ロード
 * @see <a href="#.loadSync">uu.ajax.loadSync</a> - 同期ロード
 */
uu.ajax.loadSync = function(url, fn /* = undefined */, data /* = null */) {
  if (!url) { throw TypeError("uu.ajax.loadSync(url)"); }
  fn   = fn || uu.mute;
  data = data || null;
  var me = uu.ajax.load, uid = uu.uniqueID("ajax"),
      xhr = uuw.XMLHttpRequest ? new XMLHttpRequest()
          : uuw.ActiveXObject  ? new ActiveXObject('Microsoft.XMLHTTP') : null;
  function H(v, k) { ("setRequestHeader" in xhr) && xhr.setRequestHeader(k, v); } // Opera8にはsetRequestHeader()メソッドが無い

  // 400 "Bad Request"
  if (!xhr) { fn(uid, 3, "", 400, url, 0); fn(uid, 4, "", 0, url, 0); return; }

  fn(uid, 0, "", 0, url, 0);
  try {
    xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), false); // false = Sync
  } catch(e) {
    fn(uid, 3, "", 400, url, 1); // 400 "Bad Request"
    fn(uid, 4, "", 0, url, 1);
  }
  uu.forEach(me.header, H);
  data && H("application/x-www-form-urlencoded", "Content-Type");
  fn(uid, 1, "", 0, url, 0);
  xhr.send(data);
  if (xhr.status === 200) { fn(uid, 2, xhr.responseText, 200, url, 0); }
                     else { fn(uid, 3, "", xhr.status, url, 0); }
  fn(uid, 4, "", 0, url, 0);
};

/** <b>uu.ajax.timeout - タイムアウト時間</b>
 * uu.ajax.load()で使用するタイムアウト時間を指定します。
 * 0以上の数値を指定します。単位はmsです。0を指定するとタイムアウトしません。
 * デフォルトは0です。
 *
 * @type number
 * @see <a href="#.load">uu.ajax.load</a> - 非同期ロード
 */
uu.ajax.load.timeout = 0; // 0ms

/** <b>uu.ajax.header - デフォルトヘッダ</b>
 *
 * リクエスト時に毎回送信するヘッダを指定します。
 * デフォルトは、{ "X-Requested-With": "XMLHttpRequest" } です。
 * 
 * @type hash
 * @see <a href="#.load">uu.ajax.load</a> - 非同期ロード
 * @see <a href="#.loadIfMod">uu.ajax.loadIfMod</a> - 更新チェック付き非同期ロード
 * @see <a href="#.loadSync">uu.ajax.loadSync</a> - 同期ロード
 */
uu.ajax.load.header = { "X-Requested-With": "XMLHttpRequest" };

/** 非同期ロード */
uu.ajax.load._impl = function(url, fn, data, neo) {
  var me = uu.ajax.load, uid = uu.uniqueID("ajax"),
      xhr = uuw.XMLHttpRequest ? new XMLHttpRequest()
          : uuw.ActiveXObject  ? new ActiveXObject('Microsoft.XMLHTTP') : null;
  function H(v, k) { ("setRequestHeader" in xhr) && xhr.setRequestHeader(k, v); } // Opera8にはsetRequestHeader()メソッドが無い

  // 400 "Bad Request"
  if (!xhr) { fn(uid, 3, "", 400, url, 1); fn(uid, 4, "", 0, url, 1); return; }

  fn(uid, 0, "", 0, url, 1);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        fn(uid, 2, xhr.responseText, 200, url, 1);
        (neo) && (me._cache[url] = me._header(xhr, "Last-Modified", Date.parse) || 0);
      } else {
        fn(uid, 3, "", xhr.status, url, 1); // 304 too
      }
      fn(uid, 4, "", 0, url, 1);
    }
  };

  try {
    xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), true); // true = Async
  } catch(e) {
    fn(uid, 3, "", 400, url, 1); // 400 "Bad Request"
    fn(uid, 4, "", 0, url, 1);
  }
  uu.forEach(me.header, H);
  (neo && url in me._cache) && H((new Date(me._cache[url])).toRFC1123String(), "If-Modified-Since");
  data                      && H("application/x-www-form-urlencoded", "Content-Type");
  fn(uid, 1, "", 0, url, 1);
  xhr.send(data);
  // 408 "Request Time-out"
  me.timeout && uu.tm10.set(function() {
    xhr.abort();
    fn(uid, 3, "", 408, url, 1);
    fn(uid, 4, "", 0, url, 1);
  }, me.timeout, 1);
};

uu.ajax.load._cache = {}; // If-Modified-Since用URLキャッシュ

/** <b>uu.ajax.load._header - get response header</b>
 *
 * @param XMLHttpRequest  xhr  - XMLHttpRequestオブジェクトを指定します。
 * @param string          name - 検索するヘッダ文字列を指定します。
 * @param function        [fn] - 検索結果に適用するトランスフォーム関数を指定します。
 *                               デフォルトはundefinedです。
 * @return string/mix          - 検索成功で文字列を返します。
 *                               fnが指定されている場合はfn(検索結果)を返します。
 *                               検索失敗で空文字列を返します。
 */
uu.ajax.load._header = function(xhr, name, fn /* = undefined */) {
  var rv = "";
  if (xhr.getAllResponseHeaders().match(name)) {
    rv = xhr.getResponseHeader(name);
    if (rv && uu.isF(fn)) { rv = fn(rv); }
  }
  return rv;
};

////////////////////////////////////////////////////////////
/** <b>JSON</b>
 *
 * @class
 */
uu.json = function() {
};

/** <b>uu.json.already - JSONPが使用可能でtrue</b>
 *
 * @return bool JSONPが使用可能でtrueを返します。
 */
uu.json.already = function() {
  return true;
};

/** <b>uu.json.load - 非同期ロード[JSONP async request]</b>
 *
 * JSONPで非同期にデータを取得します。
 *
 * 自動的にコールバック関数(uu.json._cache._{uid})が定義され、この関数名でラップされたJSONデータがサーバから返却されます。<br />
 * ロード完了から60秒後にリクエストに使用したリソースを開放します。<br /><br />
 *
 *  <table>
 *  <tr><th>step番号</th><th>内容</th></tr>
 *  <tr><td>0</td><td>BEGIN: 処理開始     </td></tr>
 *  <tr><td>1</td><td>SEND: リクエスト開始</td></tr>
 *  <tr><td>2</td><td>OK: 成功            </td></tr>
 *  <tr><td>3</td><td>NG: 失敗            </td></tr>
 *  <tr><td>4</td><td>END: 処理終了       </td></tr>
 *  </table>
 *
 * 各ステップで、fn(ユニークID, step番号, response, status, url, async)を呼び出します。<br />
 * responseには空文字列またはレスポンス文字列が格納されます(OKのみ)。<br />
 * statusには0またはステータスコードが格納されます(OKとNGのみ)。<br />
 * asyncは常にtrueになります。
 *
 * @param string   url  - リクエストURLを指定します。
 * @param function [fn] - 各stepで呼び出す関数を指定します。デフォルトはundefinedです。
 * @see uu.json.already - Ajax使用可能でtrue
 * @see uu.json.timeout - タイムアウト時間の指定
 */
uu.json.load = function(url, fn /* = undefined */) {
  fn = fn || uu.mute;
  var me = uu.json.load, uid = uu.uniqueID("jsonp"),
      node, rurl = uu.url.query.add(url, me.callbackFunctionName, "uu.json.load._cache." + uid);
  fn(uid, 0, "", 0, url, 1); // begin

  uud.head.appendChild(node = uu.js.create(uid));
  node._run = 0;

  me._cache[uid] = function(json, state) {
    function suicide() {
      uud.head.removeChild(node);
      node.src = "";
      delete me._cache[uid];
    }
    if (node._run++) { return; }
    if (json) { fn(uid, 2, json, 200, url, 1); } // 200 OK
         else { fn(uid, 3, "",   404, url, 1); } // 404 "Not Found", 実際には他のエラーかもしれないが知る手段がない
    uu.delay(suicide, me._suicide); // suicide
    fn(uid, 4, "", 0, url, 1);
  };
  fn(uid, 1, "", 0, url, 1);
  node.src = rurl;

  if (me.timeout) {
    uu.delay(function() {
      me._cache[uid]("", 408); // 408 "Request Time-out"
    }, me.timeout);
  }
};

/** <b>uu.json.encode - JSONエンコード(JSON encode)</b>
 *
 * @param hash/mix  mix   jsonエンコードする要素を指定します。
 * @return string         jsonエンコード済みの文字列を返します。
 * @throws TypeError "bad data" 無効なデータ(JSONフォーマットに変換不能)
 * @see <a href="#.decode">uu.json.decode</a> - JSONデコード
 */
uu.json.encode = function(mix) {
  var rv = [], re = /[\\"\x00-\x1F\u0080-\uFFFF]/g,
      esc = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"':  '\\"', "\\": "\\\\" };
  function isFake(mix) { return typeof mix === "object" && "length" in mix; } // FakeArray
  function U(v) { if (v in esc) { return esc[v]; }
                  return "\\u" + ("0000" + v.charCodeAt(0).toString(16)).slice(-4); }
  function F(mix) {
    var i = 0, z = rv.length, sz;
    if (mix === null)                     { rv[z] = "null"; }
    else if (uu.isB(mix) || uu.isN(mix))  { rv[z] = mix.toString(); }
    else if (uu.isS(mix))                 { rv[z] = '"' + mix.replace(re, U) + '"'; }
    else if (uu.isA(mix) || isFake(mix))  { rv[z] = "[";
                                            for (sz = mix.length; i < sz; ++i) { F(mix[i]);
                                                                                 rv[rv.length] = ","; }
                                            rv[rv.length - (i ? 1 : 0)] = "]"; }
    else if (typeof mix === "object")     { rv[z] = "{";
                                            for (i in mix) { rv[rv.length] = '"' + i.replace(re, U) + '":';
                                                             F(mix[i]);
                                                             rv[rv.length] = ","; }
                                            rv[rv.length - (i ? 1 : 0)] = "}"; }
    else { throw TypeError("bad data"); }
  };
  F(mix);
  return rv.join("");
};

/** <b>uu.json.decode - JSONデコード(JSON decode)</b>
 *
 * @param string      str   jsonエンコード済みの文字列を返します。
 * @return hash/mix         jsonデコードされた要素を指定します。
 * @see <a href="#.encode">uu.json.encode</a> - JSONエンコード
 */
uu.json.decode = function(str) {
  return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(str.replace(/"(\\.|[^"\\])*"/g, ""))) &&
         eval("(" + str + ")");
};

/** <b>uu.json.timeout - タイムアウト時間</b>
 * uu.json.load()で使用するタイムアウト時間を指定します。
 * 0以上の数値を指定します。単位はmsです。0を指定するとタイムアウトしません。
 * デフォルトは10000(10秒)です。uu.json._suicideより小さな値を指定してください。
 *
 * @type number
 * @see <a href="#.load">uu.json.load</a> - 非同期ロード
 */
uu.json.load.timeout = 10000; // 10s

/** <b>uu.json.load.callbackFunctionName - コールバック関数名</b>
 *
 * コールバックで使用する関数名を変更する場合に指定します。JSONPのサーバ側の実装に従って設定してください。
 * デフォルトは"callback"です。
 *
 * @type string
 * @see <a href="#.load">uu.json.load</a> - 非同期ロード
 */
uu.json.load.callbackFunctionName = "callback";

/** <b>uu.json._suicide - 自殺(リソース開放までの)時間</b>
 * uu.json.load()で使用するリソースを開放までの時間を指定します。
 * 60000(60秒)以上の数値を指定します。単位はmsです。
 * デフォルトは60000(60秒)です。uu.json.timeoutより小さい値を指定すると動作がおかしくなります。
 *
 * @type number
 * @see <a href="#.load">uu.json.load</a> - 非同期ロード
 */
uu.json.load._suicide = 60000; // 60s

uu.json.load._cache = {}; // cache

////////////////////////////////////////////////////////////
// --- uu extend ---
uu.forEach({
  /** @scope uu */

  /** <b>uu.sprintf - フォーマットされた文字列を生成する(Create formatted string)</b>
   *
   * sprintf相当の関数です。<br />
   * format: %[arg-index$][flag][width][.precision][size]type <br />
   *
   * <pre>
   * arg-index: 引数の呼び出しと再利用, i18n対応(PHP - sprintf準拠)
   *      数値: 数値とダラー("$")により引数を0から始まる番号で呼び出すことができます。
   *
   * flag: 出力方法を指定します。
   *    以下をサポートします。
   *      "#": typeがo,x,Xなら文字列の先頭に"0","0x","0X"を追加します。
   *    以下は非サポートです。
   *      "-": 左詰で出力します。(非サポート)
   *      "+": 数値の前に符号を追加します。(非サポート)
   *      空白: 数値が負なら"-"を、それ以外なら空白を出力します。(非サポート)
   *
   * width: 出力する最小文字数か数値の最低桁数を指定します。
   *    以下をサポートします。
   *      数値: 数値により最低限表示する桁数を指定できます。0で非表示になります。
   *            数値や文字列の桁あわせに使用します。
   *    以下は非サポートです。
   *      "*": 引数で幅を指定します。(非サポート)
   *
   * precision: 出力する最大文字数か小数点以下の桁数を指定します。
   *    以下をサポートします。
   *      数値: 数値で、小数点以下の桁数や文字列の長さを指定できます。
   *            precisionの前にはドット(".")が必要です。
   *            typeがfなら小数点以下の桁数を指定します。
   *              浮動小数点値は丸められる場合があります。0で小数点以下は非表示になります。
   *            typeがsなら文字列の長さを指定します。
   *              指定した長さ以上の文字は切り捨てられます。0で文字列全体が非表示になります。
   *    以下は非サポートです。
   *      "*": 引数で精度を指定します。(非サポート)
   *
   * size: デフォルト引数のサイズを指定します。
   *    以下は非サポートです。
   *      "l": long型に変更します。
   *
   * type: 変数の型を指定します。
   *    以下をサポートします。
   *      "d": 符号付き10進数値(signed decimal number)
   *      "u": 符号無し10進数値(unsigned decimal number)
   *      "o": 符号無し8進数値(unsigned octet number)
   *      "x": 符号無し16進数値[小文字](unsigned hex number[lower case])
   *      "X": 符号無し16進数値[大文字](unsigned hex number[upper case])
   *      "f": 浮動小数点([-]dddd.dddd)(floating-point number)
   *      "c": 文字の数値表現(the character with that ASCII value)
   *      "s": 文字列(string)
   *      "%": パーセント記号("%")そのものを出力
   *    以下は非サポートです。"egEG"は"f"で代用してください。
   *      "i": 符号付き8進数値(signed octet number)
   *      "e": 浮動小数点([-]d.dddde[+/-]dddd)
   *      "g": 浮動小数点("f","e"の結果でより短い方を出力する)
   *      "E": 浮動小数点([-]d.ddddE[+/-]dddd)
   *      "G": 浮動小数点("f","E"の結果でより短い方を出力する)
   *      "n": 出力済みの文字数
   *      "p": ポインタ
   * </pre>
   *
   * @param string  format  - フォーマット文字列を指定します。
   * @param mix     args__  - sprintfに与える引数を指定します。引数は可変個です。
   * @return string         - フォーマットした文字列を返します。
   * @see <a href="http://jp2.php.net/manual/ja/function.sprintf.php">sprintf - PHP</a>
   */
  sprintf: function(format, args__ /* ... */) {
    var av = arguments, next = 1, idx = 0, pi = parseInt;
    function uns(v) { return (v >= 0) ? v : v % 0x100000000 + 0x100000000; }; // to unsigned
    function fmt(word, ai, flag, width, prec, size, type, str, v) { // size, strは未使用, vは常にundefined
      idx = ai ? parseInt(ai) : next++;
      switch (type) {
      case "d": v = pi(av[idx]).toString(); break;
      case "u": v = pi(av[idx]); if (!isNaN(v)) { v = uns(v).toString(); } break;
      case "o": v = pi(av[idx]); if (!isNaN(v)) { v = (flag ? "0"  : "") + uns(v).toString(8); } break;
      case "x": v = pi(av[idx]); if (!isNaN(v)) { v = (flag ? "0x" : "") + uns(v).toString(16); } break;
      case "X": v = pi(av[idx]); if (!isNaN(v)) { v = (flag ? "0X" : "") + uns(v).toString(16).toUpperCase(); } break;
      case "f": v = parseFloat(av[idx]).toFixed(prec); break;
      case "c": width = 0; v = av[idx]; v = (typeof v === "number") ? String.fromCharCode(v) : NaN; break;
      case "s": width = 0; v = av[idx].toString(); if (prec) { v = v.substring(0, prec); } break;
      case "%": v = "%"; break;
      }
      if (isNaN(v)) { v = v.toString(); }
      return (v.length < width) ? (repeat(" ", width - v.length) + v) : v;
    }
    function repeat(str, sz) {
      var rv = [], i = 0;
      for (; i < sz; ++i) { rv[rv.length] = str; }
      return rv.join("");
    }
    return format.replace(/%(?:([\d]+)\$)?(#)?([\d]+)?(?:\.([\d]+))?(l)?([%duoxXfcs])/g, fmt);
  },
  /** <b>uu.assert - C言語スタイルのアサーション(C style assert)</b>
   * @see uu.module.debug.js
   */
  assert: function() {
  },
  /** <b>uu.isA - 配列ならtrue(is Array)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixが配列ならtrueを返します。
   */
  isA: function(mix) {
    return mix instanceof Array;
  },
  /** <b>uu.isU - undefinedならtrue(is Undefined)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixがundefinedならtrueを返します。
   */
  isU: function(mix) {
    return typeof mix === "undefined";
  },
  /** <b>uu.isF - 関数ならtrue(is Function)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixがfunctionならtrueを返します。
   */
  isF: function(mix) {
    return typeof mix === "function";
  },
  /** <b>uu.isN - 数値ならtrue(is Number)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixがnumberならtrueを返します。
   */
  isN: function(mix) {
    return typeof mix === "number" && isFinite(mix);
  },
  /** <b>uu.isB - 真偽値ならtrue(is Boolean)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixがbooleanならtrueを返します。
   */
  isB: function(mix) {
    return typeof mix === "boolean";
  },
  /** <b>uu.isS - 文字列ならtrue(is String)</b>
   *
   * @param mix mix - 検査する変数を指定します。
   * @return bool - mixがstringならtrueを返します。
   */
  isS: function(mix) {
    return typeof mix === "string";
  },
  /** <b>uu.mute - ダミー関数</b>
   * 何もしないダミー関数です。
   */
  mute: function() {
  },
  /** <b>uu.mute - ダミー関数</b>
   * 何もしないダミー関数です。第一引数をそのまま返します。
   */
  echo: function(dummy) {
    return dummy;
  },
  /** <b>uu.baseURL - ベースURLの取得</b>
   *
   * ベースURL(uupaa.jsを読み込んだHTMLのパス)を返します。<br />
   * 結果はキャッシュされ、次回以降はキャッシュを返します。
   *
   * @return string - ベースURLを返します。
   */
  baseURL: function() {
    return uu.baseURL._cache || (uu.baseURL._cache = uu.url.path(uu.url.abs(uu.id("uupaa.js").src)));
  },
  /** <b>uu.notax - 結合文字列, 文字列の配列, 文字列を受け取り、配列を返す</b>
   *
   * taxingをパースしfnで評価した配列を返します。
   *
   * <pre class="eg">var a = "a, b,C,d ";
   * uu.notax(a,"", function(str) { return str.toLowerCase(); }); // ["a","b","c","d"]
   * </pre>
   *
   * @param taxing    tax           - セパレータで区切られた文字列,文字列の配列 または 文字列を指定します。
   * @param hash      [param]       - パラメタを指定します。
   * @param string    [param.sep]   - セパレータを指定します。デフォルトはカンマ(",")です。
   * @param function  [param.fn]    - 各要素を評価する関数を指定します。デフォルトはundefinedです。
   * @param bool      [param.trim]  - カンマ結合文字列の各要素の左右の空白文字をトリムする場合はtrueを指定します。デフォルトはtrueです。
   *                                  taxが文字列や、配列で指定されている場合はトリムしません。
   * @return array      - taxが結合文字列なら、各要素に分割、左右の空白をトリム後に配列化して返します。
   *                      taxが文字列なら、taxを唯一の要素とする配列を返します。
   *                      taxが配列ならtaxをそのまま返します。
   * @throws TypeError  "uu.notax(tax) bad arg"  引数が文字列でも配列でもない
   */
  notax: function(tax, param /* = { sep: ",", fn: undefined, trim: true } */) {
    param = uu.mix.param(param || {}, { sep: ",", fn: uu.echo, trim: true });
    if (uu.isA(tax)) { return param.fn(tax); }
    if (!uu.isS(tax)) { throw TypeError("uu.notax(tax) bad arg"); }
    if (tax.indexOf(param.sep) === -1) { return [param.fn(tax)]; }
    return tax.split(param.sep).map(function(v) {
      if (param.trim) { v = uu.trim(v); }
      return param.fn(v);
    });
  },
  /** <b>配列をhash化</b>
   *
   * 配列をhash化します。<br />
   * 同じindexはひとつにまとめられ、関数オブジェクトは除外します。
   *
   * <pre class="eg">
   *  var ary = [undefined, null, 1, 1, "hoge", function(){} ];
   *  ary["hash_index"] = "lost value";
   *  var b = uu.toHash(ary); // { undefined: undefined, null: null, 1: 1, hoge: "hoge" }
   * </pre>
   *
   * @param array ary - hash化する配列を指定します。
   * @return hash     - hash化した配列を返します。
   */
  toHash: function(ary) {
    var rv = {}, i = 0, sz = ary.length;
    for (; i < sz; ++i) {
      if (i in ary && typeof ary[i] !== "function") {
        rv[ary[i]] = ary[i]
      }
    }
    return rv;
  },
  /** <b>uu.ltrim - 左側の空白文字を除去</b>
   *
   * 文字列の左側から空白文字をトリム(除去)し、新しい文字列を返します。
   *
   * <pre class="eg">uu.ltrim(" hoge "); // "hoge "</pre>
   *
   * @param string           str - 文字列を指定します。
   * @param regexp/undefined reg - 文字列の左側からトリミングする文字の集合を正規表現オブジェクトで指定します。
   *                               省略時は、NULL("\0"),空白(" "),タブ("\t"),改行("\n"),垂直タブ("\v"),復帰("\d")をトリミングします。
   * @return string - トリム後の文字列を返します。
   * @see <a href="#rtrim">uu.rtrim</a> - 右側の空白文字を除去
   * @see <a href="#trim">uu.trim</a> - 両側の空白文字を除去
   */
  ltrim: function(str, reg /* = undefined */) {
    return str.replace(RegExp(!reg ? "^[\\s]+" : "^[" + reg + "]+", "g"), "");
  },
  /** <b>uu.rtrim - 左側の空白文字を除去</b>
   *
   * 文字列の右側から空白文字をトリム(除去)し、新しい文字列を返します。
   *
   * <pre class="eg">uu.rtrim(" hoge "); // " hoge"</pre>
   *
   * @param string           str - 文字列を指定します。
   * @param regexp/undefined reg - 文字列の右側からトリミングする文字の集合を正規表現オブジェクトで指定します。
   *                               省略時は、NULL("\0"),空白(" "),タブ("\t"),改行("\n"),垂直タブ("\v"),復帰("\d")をトリミングします。
   * @return string - トリム後の文字列を返します。
   * @see <a href="#ltrim">uu.ltrim</a> - 左側の空白文字を除去
   * @see <a href="#trim">uu.trim</a> - 両側の空白文字を除去
   */
  rtrim: function(str, reg /* = undefined */) {
    return str.replace(RegExp(!reg ? "[\\s]+$" : "[" + reg + "]+$", "g"), "");
  },
  /** <b>uu.trim - 両側から空白文字を除去</b>
   *
   * 文字列の両側から空白文字をトリム(除去)し、新しい文字列を返します。
   *
   * <pre class="eg">uu.trim(" hoge "); // "hoge"</pre>
   *
   * @param string           str - 文字列を指定します。
   * @param regexp/undefined reg - 文字列の左右からトリミングする文字の集合を正規表現オブジェクトで指定します。
   *                               省略時は、NULL("\0"),空白(" "),タブ("\t"),改行("\n"),垂直タブ("\v"),復帰("\d")をトリミングします。
   * @return string - トリム後の文字列を返します。
   * @see <a href="#rtrim">uu.rtrim</a> - 右側の空白文字を除去
   * @see <a href="#ltrim">uu.ltrim</a> - 左側の空白文字を除去
   */
  trim: function(str, reg /* = undefined */) {
    return (!reg) ? str.replace(/^[\s]*|[\s]*$/g, "") :
                    str.replace(RegExp("^[" + reg + "]+", "g"), "")
                       .replace(RegExp("[" + reg + "]+$", "g"), "");
  },
  /** <b>uu.indexes - array/hashのindexを列挙し配列を返す</b>
   *
   * mixがarrayなら、indexを列挙し配列を返します。hash要素(文字列のindexを持つ要素)は除外します。<br />
   * mixがhashなら、数値/文字両方のindexを列挙し配列を返します。<br />
   *
   * 要素数(length)の取得にも利用できます。
   *
   * <pre class="eg">
   * var array = [74, 50, 50], hash = { a: 74, b: 50, c: 50 };
   * array["hash_index"] = "hash";
   * hash[0] = "hash";
   * delete array[0];
   * uu.indexes(array); // [undefined, 1, 2]
   * uu.indexes(hash); // ["a", "b", "c", 0]
   * </pre>
   *
   * @param hash/array mix - 検索対象の要素を指定します。
   * @return array         - hash/arrayのindexを列挙した配列を返します。
   *                         有効な要素がなければ、空の配列([])を返します。
   * @see <a href="#values">uu.values</a> - array/hashの値を列挙
   */
  indexes: function(mix) {
    var rv = [], i, sz;
    if (uu.isA(mix)) {
      for (i = 0, sz = mix.length; i < sz; ++i) {
        (i in mix) && rv.push(i);
      }
    } else {
      for (i in mix) {
        mix.hasOwnProperty(i) && rv.push(i);
      }
    }
    return rv;
  },
  /** <b>uu.values - array/hashの値を列挙し配列を返す</b>
   *
   * mixがarrayなら、値を列挙し配列を返します。hash要素(文字列のindexを持つ要素)は除外します。<br />
   * mixがhashなら、数値/文字両方のindexを持つ値を列挙し配列を返します。<br />
   *
   * 要素数(length)の取得にも利用できます。
   *
   * <pre class="eg">
   * var array = [74, 50, 50], hash = { a: 74, b: 50, c: 50 };
   * array["hash_index"] = "hash";
   * hash[0] = "hash";
   * delete array[0];
   * uu.values(array); // [50, 50]
   * uu.values(hash); // [74, 50, 50, "hash"]
   * </pre>
   *
   * @param hash/array mix - 検索対象の要素を指定します。
   * @return array         - hash/arrayの値を列挙した配列を返します。
   *                         有効な要素がなければ、空の配列([])を返します。
   * @see <a href="#indexes">uu.indexes</a> - array/hashのindexを列挙
   */
  values: function(mix) {
    var rv = [], i, sz;
    if (uu.isA(mix)) {
      for (i = 0, sz = mix.length; i < sz; ++i) {
        (i in mix) && rv.push(mix[i]);
      }
    } else {
      for (i in mix) {
        mix.hasOwnProperty(i) && rv.push(mix[i]);
      }
    }
    return rv;
  },
  /** <b>uu.toArray - 擬似配列を配列化</b>
   *
   * 与えられた擬似配列を配列化します。<br />
   *
   * 擬似配列には以下のようなものがあります。<br />
   * document.images, NodeList, arguments
   *
   * <pre class="eg">
   *  var node = uu.toArray(uu.tag("*"));
   * </pre>
   *
   * @param FakeArray fake - 擬似配列を指定します。
   * @return array  - fakeがnullやlengthプロパティを持たないhashが指定された場合は空の配列([])を返します。<br />
   *                  fakeがlengthプロパティを持つ擬似配列なら配列化してから返します。
   * @see <a href="http://d.hatena.ne.jp/uupaa/20080602">uupaa開発日記</a>
   */
  toArray: function(fake) {
    if (fake === null || !("length" in fake) || !fake.length) { return []; }
    var rv = Array(fake.length), i = 0, sz = rv.length;
    for (; i < sz; ++i) { rv[i] = fake[i]; }
    return rv;
  },
  /** <b>uu.pushArray - 擬似配列をオブジェクトの要素に追加</b>
   *
   * 与えられた擬似配列を、オブジェクトの要素に追加します。<br />
   * obj.lengthを追加した要素数に更新します。
   *
   * <pre class="eg">
   *  var hash = {};
   *  uu.pushArray(uu.tag("*"), hash); // hash[0] = html, hash[1] = head, hash[2] = meta, ...
   * </pre>
   *
   * @param FakeArray fake - 擬似配列を指定します。
   * @param object    [obj - オブジェクトを指定します。
   * @return object  - fake追加後のオブジェクトを返します。
   * @see uu.toArray - 擬似配列を配列化
   */
  pushArray: function(fake, obj) {
    if (fake === null || !("length" in fake) || !fake.length) { obj.length = 0; return obj; }
    var i = 0, sz = fake.length;
    for (; i < sz; ++i) { obj[i] = fake[i]; }
    obj.length = sz;
    return obj;
  },
  /** <b>uu.diet - コンパクト化(Memory compaction)</b>
   *
   * mixが配列なら、数字indexを持つ要素のうち、
   * 値がnull/undefinedの要素や、hash要素を除いた新しい配列を返します。<br />
   * mixがhashなら、数字/hash indexを持つ要素のうち、
   * 値がnull/undefinedの要素を除いた新しいhashを返します。<br />
   *
   * <pre class="eg">
   * var array = [null, undefined, 3], hash = { a: null, b: undefined, c: 50 };
   * array["hash_index"] = "hash";
   * hash[0] = "hash";
   * uu.diet(array); // [3]
   * uu.diet(hash); // { c: 50, 0: "hash" }
   * </pre>
   *
   * @param hash/array mix - hashか配列を指定します。
   * @return hash/array - 有効な要素のみを持つ新しい配列かhashを返します。<br />
   *                      有効な要素がなければ、空の配列([])かhash({})を返します。
   */
  diet: function(mix) {
    var rv, i, sz;
    if (uu.isA(mix)) {
      rv = [], i = 0, sz = mix.length;
      for (; i < sz; ++i) {
        (mix[i] !== null && typeof mix[i] !== "undefined") && rv.push(mix[i]);
      }
    } else {
      rv = {};
      for (i in mix) {
        (mix[i] !== null && typeof mix[i] !== "undefined" && mix.hasOwnProperty(i)) && (rv[i] = mix[i]);
      }
    }
    return rv;
  },
  /** <b>uu.uniqueID - ユニークIDの生成(generate unique id)</b>
   *
   * @param string [prefix] - プリフィクスを指定します。デフォルトは"uu"です。
   * @return string         - プリフィクス + ユニークナンバー で構成される文字列を返します。
   */
  uniqueID: function(prefix /* = "uu" */) {
    return (prefix || "uu") + ++uu.uniqueID._count;
  },
  /** <b>uu.delay - 遅延評価</b>
   *
   * @param function fn      - 遅延評価する関数を指定します。
   * @param number   [delay] - 遅延時間をms単位で指定します。デフォルトは0です。
   * @return number          - タイマーIDを返します。
   */
  delay: function(fn, delay /* = 0ms */) {
    return uuw.setTimeout(fn, delay || 0);
  },
  /** <b>uu.basicClass - クラスの雛形を生成</b>
   *
   * クラスの雛形を生成するクロージャを返します。<br />
   * newされたタイミングで、コンストラクタを自動で呼び出し、
   * uu.window.unready()にデストラクタを登録します。
   *
   * @return function - クラスの雛形を生成するクロージャを返します。
   */
  basicClass: function(_) {
    return function() {
      this.construct.apply(this, arguments);
      if (this.destruct) {
        uu.window.unready(this.destruct, this);
      }
    }
  },
  /** <b>uu.abstractClass - 委譲用のクラスの雛形を生成</b>
   *
   * 委譲用クラスの雛形を生成するクロージャを返します。<br />
   *
   * このメソッドは、コンストラクタとデストラクタを自動で呼び出しません。<br />
   * 委譲元で処理する必要があります。
   *
   * @return function - クラスの雛形を生成するクロージャを返します。
   */
  abstractClass: function(_) {
    return function() {};
  },
  /** <b>uu.staticClass - public staticなクラスの雛形を生成</b>
   *
   * 静的クラス(常に存在し、newしなくても使用できるメソッドを持つクラス)の雛形を生成するクロージャを返します。<br />
   *
   * @return function - クラスの雛形を生成するクロージャを返します。
   */
  staticClass:  function(_) {
    return function() {};
  },
  /** <b>uu.singletonClass - シングルトンクラスの雛形を生成</b>
   *
   * シングルトンクラス(インスタンスを一つしか生成できないクラス)の雛形を生成するクロージャを返します。<br />
   * newされたタイミングで、コンストラクタを自動で呼び出し、
   * uu.window.unready()にデストラクタを登録します。
   *
   * @return function - クラスの雛形を生成するクロージャを返します。
   */
  singletonClass: function(_) {
    return function() {
      var me = arguments.callee;
      if (!me.instance) {
        me.instance = this; // keep instance
        this.construct.apply(this, arguments);
        if (this.destruct) { uu.window.unready(this.destruct, this); }
      }
      return me.instance;
    }
  }
}, function(v, p) {
  uu[p] = v;
});
uu.uniqueID._count = 0;
uu.baseURL._cache = "";

////////////////////////////////////////////////////////////
// --- Array extend ---

if (!Array.prototype.forEach) {
  /** @scope Array.prototype */
  /** <b>Array.forEach - 全要素をfnで評価する</b>
   * @param function  fn   - 各要素を評価する関数を指定します。
   * @param this      [me] - thisオブジェクトを指定します。デフォルトはundefined(=window)です。
   * @return this - 元の配列(this)を返します(JavaScript1.6のArray.forEach()はthisを返さない仕様です)。
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach">Array.forEach</a> - 全要素を評価し配列を返す - MDC
   * @see <a href="#filter">Array.filter</a> - 全要素を評価し結果が真の要素を配列で返す
   * @see <a href="#every">Array.every</a> - 全要素を評価し全て真ならtrueを返す
   * @see <a href="#some">Array.some</a> - 全要素を評価し全て偽ならtrueを返す
   * @see <a href="#map">Array.map</a> - 全要素を評価し配列を返す
   */
  Array.prototype.forEach = function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      (i in this) && fn.call(me, this[i], i, this);
    }
    return this;
  }
}

uu.forEach({
  /** @scope Array.prototype */

  /** <b>Array.indexOf - 配列の先頭から値を検索し最初のindexを返す。無ければ-1を返す(JavaScript 1.6準拠)</b>
   *
   * <pre class="eg">var rv = [0, 1, 1, 2];
   * rv["hash"] = "hash";
   * rv.indexOf(1), rv.indexOf(1, -2); // 1, 2
   * rv.indexOf("1"), rv.indexOf("hash"); // -1, -1</pre>
   *
   * @param mix     value   - 検索する値を指定します。検索は===演算子で比較します。
   * @param number  [index] - 検索を開始するindexを指定します。負の値は配列の末尾からのオフセットとみなします。デフォルトは0です。
   * @return number - 検索成功で0以上の値を返します。失敗で-1を返します。
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:indexOf">Array:indexOf</a> - 配列の末尾から値を検索 - MDC
   * @see <a href="#lastIndexOf">Array.lastIndexOf</a> - 配列の末尾から値を検索
   */
  indexOf: function(value, index /* = 0 */) {
    var sz = this.length; index = index || 0; index = (index < 0) ? index + sz : index;
    for (; index < sz; ++index) {
      if (index in this && this[index] === value) { return index; }
    }
    return -1;
  },
  /** <b>Array.lastIndexOf - 配列の後方から値を検索し最初のindexを返す。無ければ-1を返す(JavaScript 1.6準拠)</b>
   *
   * <pre class="eg">var rv = [0, 1, 1, 2]; rv["hash"] = "hash";
   * rv.lastIndexOf(1), rv.lastIndexOf(1, -2); // 2, 2
   * rv.lastIndexOf("1"), rv.lastIndexOf("hash"); // -1, -1</pre>
   *
   * @param mix     value   - 検索する値を指定します。検索は===演算子で比較します。
   * @param number  [index] - 検索を開始するindexを指定します。負の値は配列の末尾からのオフセットとみなします。デフォルトは0です。
   * @return number - 検索成功で0以上の値を返します。失敗で-1を返します。
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:lastIndexOf">Array:lastIndexOf</a> - 配列の先頭から値を検索 - MDC
   * @see <a href="#lastIndexOf">Array.lastIndexOf</a> - 配列の先頭から値を検索
   */
  lastIndexOf: function(value, index /* = this.length */) {
    var sz = this.length; index = (index < 0) ? index + sz : sz - 1;
    for (; index > -1; --index) {
      if (index in this && this[index] === value) { return index; }
    }
    return -1;
  },
  /** <b>Array.filter - 全要素を評価し、結果が真の要素を配列で返す(JavaScript 1.6準拠)</b>
   *
   * @param function  fn   - 各要素を評価する関数を指定します。
   * @param this      [me] - thisオブジェクトを指定します。デフォルトはundefined(=window)です。
   * @return array - array([ 要素, ... ])を返します。
   * @see <a href="#forEach">Array.forEach</a> - 全要素を評価し配列を返す
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter">Array.filter</a> - 全要素を評価し結果が真の要素を配列で返す - MDC
   * @see <a href="#every">Array.every</a> - 全要素を評価し全て真ならtrueを返す
   * @see <a href="#some">Array.some</a> - 全要素を評価し全て偽ならtrueを返す
   * @see <a href="#map">Array.map</a> - 全要素を評価し配列を返す
   */
  filter: function(fn, me /* = undefined */) {
    var rv = [], i = 0, sz = this.length, v;
    for (; i < sz; ++i) {
      if (i in this) {
        v = this[i];
        (fn.call(me, v, i, this)) && rv.push(v);
      }
    }
    return rv;
  },
  /** <b>Array.every - 全要素を評価し、全て真ならtrue,偽があればループを中断しfalseを返す(JavaScript 1.6準拠)</b>
   *
   * @param function  fn   - 各要素を評価する関数を指定します。
   * @param this      [me] - thisオブジェクトを指定します。デフォルトはundefined(=window)です。
   * @return bool - 全て真ならtrue, 偽があればfalseを返します。
   * @see <a href="#forEach">Array.forEach</a> - 全要素を評価し配列を返す
   * @see <a href="#filter">Array.filter</a> - 全要素を評価し結果が真の要素を配列で返す
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:every">Array.every</a> - 全要素を評価し全て真ならtrueを返す - MDC
   * @see <a href="#some">Array.some</a> - 全要素を評価し全て偽ならtrueを返す
   * @see <a href="#map">Array.map</a> - 全要素を評価し配列を返す
   */
  every: function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      if (i in this && !fn.call(me, this[i], i, this)) { return false; }
    }
    return true;
  },
  /** <b>Array.some - 全要素を評価し、全て偽ならfalse,真があればループを中断しtrueを返す(JavaScript 1.6準拠)</b>
   *
   * @param function  fn   - 各要素を評価する関数を指定します。
   * @param this      [me] - thisオブジェクトを指定します。デフォルトはundefined(=window)です。
   * @return bool - 全て偽ならfalse, 真があればtrueを返します。
   * @see <a href="#forEach">Array.forEach</a> - 全要素を評価し配列を返す
   * @see <a href="#filter">Array.filter</a> - 全要素を評価し結果が真の要素を配列で返す
   * @see <a href="#every">Array.every</a> - 全要素を評価し全て真ならtrueを返す
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:some">Array.some</a> - 全要素を評価し全て偽ならtrueを返す - MDC
   * @see <a href="#map">Array.map</a> - 全要素を評価し配列を返す
   */
  some: function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      if (i in this && fn.call(me, this[i], i, this)) { return true; }
    }
    return false;
  },
  /** <b>Array.map - 全要素を評価し配列を返す(JavaScript 1.6準拠)</b>
   *
   * @param function  fn   - 各要素を評価する関数を指定します。
   * @param this      [me] - thisオブジェクトを指定します。デフォルトはundefined(=window)です。
   * @return array - 結果を配列で返します。
   * @see <a href="#forEach">Array.forEach</a> - 全要素を評価し配列を返す
   * @see <a href="#filter">Array.filter</a> - 全要素を評価し結果が真の要素を配列で返す
   * @see <a href="#every">Array.every</a> - 全要素を評価し全て真ならtrueを返す
   * @see <a href="#some">Array.some</a> - 全要素を評価し全て偽ならtrueを返す
   * @see <a href="http://developer.mozilla.org/ja/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:map">Array.map</a> - 全要素を評価し配列を返す - MDC
   */
  map: function(fn, me /* = undefined */) {
    var rv = new Array(this.length), i = 0, sz = this.length;
    for (; i < sz; ++i) {
      if (i in this) { rv[i] = fn.call(me, this[i], i, this); }
    }
    return rv;
  }
}, function(v, p) {
  (!Array.prototype[p]) && (Array.prototype[p] = v);
});

////////////////////////////////////////////////////////////
// --- Date extend ---
uu.forEach({
  /** @scope Date.prototype */

  /** <b>Date.toRFC1123String - RFC1123に準拠した日付文字列の生成(Create RFC1123 formated string)</b>
   *
   * ms単位の値から、HTTP/1.1準拠の日付文字列( "Thu, 01 Jan 1970 00:00:00 GMT" )を生成します。
   *
   * <pre class="eg">(new Date()).toRFC1123String(); // "Wed, 28 May 2008 10:59:12 GMT"</pre>
   *
   * @return string - "曜日, 日付 月 年 時:分:秒 GMT" フォーマットの日付文字列を返します。
   * @see <a href="http://d.hatena.ne.jp/uupaa/20080515/1210791702">uupaa開発日記</a>
   */
  toRFC1123String: function() {
    if (!uu.ua.ie) { return this.toUTCString(); }
    var rv = this.toUTCString().replace(/UTC/, "GMT");
    return (rv.length < 29) ? rv.replace(/, /, ", 0") : rv; // pad zero
  }
}, function(v, p) {
  (!Date.prototype[p]) && (Date.prototype[p] = v);
});

////////////////////////////////////////////////////////////
// --- Number extend ---
uu.forEach({
  /** @scope Number.prototype */

  /** <b>Number.toRGBString - カラー値から色指定用文字列を生成(Create color string for rgb function)</b>
   *
   * カラー値から、rgb関数用の文字列( "rgb(255,255,255)" )を生成します。
   * 
   * <pre class="eg">0xff9999.toRGBString(); // "rgb(255,153,153)"</pre>
   *
   * @return string - "rgb(red,green,blue)" フォーマットの色指定用文字列を返します。
   */
  toRGBString: function() {
    var v = this.valueOf(), rv = [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
    return "rgb(" + rv.join(",") + ")";
  },

  /** <b>Number.toRGBAString - カラー値から色指定用文字列を生成(Create color string for rgba function)</b>
   *
   * カラー値から、rgba関数用の文字列( "rgba(255,255,255,1.0)" )を生成します。
   * 
   * <pre class="eg">0xff9999.toRGBAString(0.4); // "rgba(255,153,153,0.4)"</pre>
   *
   * @param number alpha - 不透明度を指定します。0.0～1.0の値を指定可能です。デフォルトは1.0です。
   * @return string - "rgba(red,green,blue,alpha)" フォーマットの色指定用文字列を返します。
   */
  toRGBAString: function(alpha /* = 1.0 */) {
    var v = this.valueOf(), rv = [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff, alpha || 1.0];
    return "rgba(" + rv.join(",") + ")";
  }
}, function(v, p) {
  (!Number.prototype[p]) && (Number.prototype[p] = v);
});

////////////////////////////////////////////////////////////
// --- Math extend ---
if (typeof Math.RADIAN === "undefined") {
  Math.RADIAN = Math.PI / 180;
}

////////////////////////////////////////////////////////////
if (uu.ua.gecko) {
  if (!HTMLElement.prototype.outerHTML) { // for Firefox
    /** <b>HTMLElement.outerHTML extend</b>
     *
     * gecko用のouterHTMLの拡張です。
     * @ignore
     */
    HTMLElement.prototype.__defineSetter__("outerHTML", function(html) {
      this._outerHTMLValue = html;
      var r = uud.createRange(), f;
      r.setStartBefore(this);
      f = r.createContextualFragment(html);
      this.parentNode.replaceChild(f, this);
    });
  }
  if (!HTMLElement.prototype.innerText) { // for Firefox
    /** <b>HTMLElement.innerText setter</b>
     *
     * gecko用のinnerHTMLの拡張です。
     * @ignore
     */
    HTMLElement.prototype.__defineSetter__("innerText", function(text) {
      while(this.hasChildNodes()) {
        this.removeChild(this.lastChild);
      }
      this._innerTextValue = text;
      this.appendChild(uud.createTextNode(text));
    });
    /** <b>HTMLElement.innerText getter</b>
     *
     * gecko用のinnerHTMLの拡張です。
     * @ignore
     */
    HTMLElement.prototype.__defineGetter__("innerText", function() {
      return (typeof this._innerTextValue !== "undefined") ? this._innerTextValue : this.textContent;
    });
  }
}

////////////////////////////////////////////////////////////
// regular module section

/** <b>Quick Timer</b>
 *
 * ベースとなるタイマーで時刻を刻み、
 * その上で複数の仮想タイマーを動作させることで、コンテキストスイッチを減らし、
 * 100個以上のタイマーを高速に動作させることができる高機能タイマーです。<br />
 * 一時停止、再開、ループ回数の指定、遅延時間の動的な指定が可能です。<br />
 *
 * タイマーの精度は、setIntervalやsetTimeoutよりは落ちます(そもそもそれらも正確ではありません)。<br />
 * タイマー周期は約27万年分ほどあるのでオーバーフローの心配はありません。
 * @class
 */
uu.module.virtualTimer = uu.basicClass();
uu.module.virtualTimer.prototype = {
  /** @scope uu.module.virtualTimer.prototype */

  /** <b>uu.module.virtualTimer.construct - 初期化</b>
   *
   * @param number [baseClock] - ベースクロックの指定です。単位はmsで、デフォルトは10です。
   */
  construct: function(baseClock /* = 10ms */) {
    uu.mix(this, { baseClock: baseClock || 10,
                   tick: 0,     // 内部時刻(現実の時間とはズレます)
                   btid: 0,     // base timer id (window.setInterval result)
                   lock: 0,     // 1: under memory-compaction execution
                   data: [] }); // [ vtid: [vtid, next, fn, count, dfn, delay, loop], ... ]
  },
  /** <b>uu.module.virtualTimer.destruct - 後始末</b> */
  destruct: function() {
    this.suspend(-1);
    this.data = null;
  },
  /** <b>uu.module.virtualTimer.set - 仮想タイマーの登録</b>
   *
   * 仮想タイマーを追加します。<br />
   * ベースタイマーが停止している状態ならベースタイマーを再始動させます。
   *
   * @param function/string   fn     - 遅延評価関数を指定します。文字列化した関数も指定可能です。
   *                                   デフォルトはuu.muteです。
   * @param number/function   delay  - 遅延時間を指定します。単位はmsです。<br />
   *                                   デフォルトは10です。<br />
   *                                   遅延時間を返す関数を指定することもできます。
   *                                   delayに関数を指定した場合は、delay(呼び出し回数)の形でコールバックします。
   *                                   呼び出し回数は0以上の整数になります。
   * @param number            [loop] - 評価回数を指定します。0なら無限, 1なら1回, 100なら100回評価します。
   * @return number                  - unset()で使用するvtidを返します。
   * @see <a href="#resetLoop">uu.module.virtualTimer.resetLoop</a> - 仮想タイマーのループ回数を再設定
   */
  set: function(fn /* = uu.mute */, delay /* = 10 */, loop /* = 0 */) {
    fn    = uu.isF(fn) ? fn : uu.isS(fn) ? new Function(fn) : uu.mute; // fnが文字列なら関数化
    delay = delay || 10;
    var dfn = uu.isF(delay) ? delay : undefined, rv = this.data.length;
    this.resume(-1);
    this.data[rv] = { vtid: rv, next: this.tick + (dfn ? dfn(0) : delay), // nextをdfn()で計算し格納
                      fn: fn, count: 0, dfn: dfn, delay: delay, loop: loop || 0 };
    return rv;
  },
  /** <b>uu.module.virtualTimer.resetLoop - 仮想タイマーのループ回数を再設定</b>
   *
   * loop = 0なら、vtidで指定したタイマーを無限ループ化します。<br />
   * loop > 0なら、vtidの現在のループ数に追加します。<br />
   * 仮想タイマーが停止中なら再始動させます。
   *
   * @param number  vtid - set()が返すvtidを指定します。
   * @param number  [loop] - ループ数の指定です。0以上の値を指定します。デフォルトは0です。
   * @see <a href="#set">uu.module.virtualTimer.set</a> - 仮想タイマーの登録
   */
  resetLoop: function(vtid, loop) {
    var d;
    if (!(vtid in this.data) || loop < 0) { return; }
    d = this.data[vtid];
    d.loop = (!loop) ? 0 : d.loop + loop; // loop = 0で無限ループ, loop > 0でループ数追加
    d.next += (!d.next) ? 1 : 0;          // 停止中なら再始動
  },
  /** <b>uu.module.virtualTimer.resume - タイマーの開始(再開)</b>
   *
   * ベースタイマーと仮想タイマーの開始(再開)を行います。<br />
   * ベースタイマー停止中に仮想タイマーを再開させると、
   * ベースタイマーの再始動も行います。
   *
   * @param number  [vtid] - vtidを指定すると仮想タイマーを開始します。<br />
   *                         -1を指定するとベースタイマーを開始します。<br />
   *                         デフォルトは-1です。
   * @see <a href="#suspend">uu.module.virtualTimer.suspend</a> - タイマーの停止(一時停止)
   */
  resume: function(vtid /* = -1 */) {
    var d;
    if (vtid < 0) {
      if (!this.btid) {
        this.tick = (new Date()).getTime();
        this.btid = this._impl();
      }
    } else if (vtid in this.data) {
      d = this.data[vtid];
      if (!d.next) { d.next = d.dfn ? d.dfn(d.count) : 1; }
      if (!this.btid) { arguments.callee(-1); } // resume(-1) - begin base timer
    }
  },
  /** <b>uu.module.virtualTimer.suspend - タイマーの停止(一時停止)</b>
   *
   * ベースタイマーと仮想タイマーの停止(一時停止)を行います。
   *
   * @param number  [vtid] - vtidを指定すると仮想タイマーを停止します。<br />
   *                         -1を指定するとベースタイマーを停止します。<br />
   *                         デフォルトは-1です。
   * @see <a href="#resume">uu.module.virtualTimer.resume</a> - タイマーの開始(再開)
   */
  suspend: function(vtid /* = -1 */) {
    if (vtid < 0) {
      this.btid && uuw.clearInterval(this.btid);
      this.btid = 0;
    } else if (vtid in this.data) {
      // _impl内でthis.data[vtid]を評価中に要素そのものを削除すると例外が発生するため、
      // 予定時刻をゼロにすることでスケジューリングを停止します。
      this.data[vtid].next = 0;
    }
  },
  /** <b>uu.module.virtualTimer.diet - Memory Compaction</b>
   * 不要になった仮想タイマーの情報を削除します。
   * 処理中でもベースタイマーは停止しませんが、仮想タイマーは数baseClock分遅延します。
   */
  diet: function() {
    ++this.lock;
  },
  /** <b>uu.module.virtualTimer._impl</b> */
  _impl: function() {
    var me = this;
    return uuw.setInterval(function() {
      var i = 0, sz = me.data.length, t = me.tick += me.baseClock, d;
      if (me.lock) { // Memory Compaction
        // 予定時刻(next > 0)があるものだけをme.dataに残す
        me.data = me.data.filter(function(v) { return !!v.next; });
        me.lock = 0; // unlock
      } else {
        for (; i < sz; ++i) {
          d = me.data[i]; // fetch
          // 予定時刻(d.next)が現在時刻(t)を過ぎていれば、
          // 次回の予定時刻(d.next)を計算しfn()をコール,ループ回数が設定されていればデクリメント、
          // loop回数がゼロになったら予定時刻を0にしてカウンタを停止。
          if (d.next && t >= d.next) {
            d.next = (d.loop && !(--d.loop)) ? 0 : t + (d.dfn ? d.dfn(++d.count) : d.delay);
            d.fn();
          }
        }
      }
    }, me.baseClock);
  }
};

// 汎用仮想タイマー
uu.tm10 = new uu.module.virtualTimer(10); // instantiate

////////////////////////////////////////////////////////////
/** Message Pump Module.
 *
 * @class
 */
uu.module.messagePump = function() {
};

uu.module.messagePump = uu.singletonClass();
uu.module.messagePump.prototype = {
  construct: function() {
    var me = this;
    this.reg = {}; // registered object { tid: instance, ... }
    this.msg = []; // stocked message [ [ id, msg, param1, param2], ... ]
    this.vtm = new uu.module.virtualTimer(10); // 仮想タイマーを生成
    this.vtid = this.vtm.set(function() {
      if (!me.msg.length) {
        me.vtm.suspend(-1);
      } else {
        var e = me.msg.shift();
        (e[0] in me.reg) && me.reg[e[0]].procedure(e[1], e[2], e[3]);
      }
    }, 10);
  },
  /** <b>メッセージの送信先を登録</b>
   *
   * @param string  tid - ターゲットID(送信先ID)を指定します。"broadcast"は指定できません。
   * @param object  obj - インスタンスを指定します。
   * @see <a href="#send">uu.module.messagePump.send</a> - メッセージの同期送信
   * @see <a href="#post">uu.module.messagePump.post</a> - メッセージの非同期送信
   * @throws TypeError "uu.module.messagePump(tid)"  引数が無効
   */
  set: function(tid, obj) {
    if (tid === "broadcast") { throw TypeError("uu.module.messagePump(tid)"); }
    this.reg[tid] = obj;
  },
  /** <b>メッセージの同期送信</b>
   *
   * メッセージを送信し送信結果を返します。param1,param2にはどのような引数でも渡せます。
   *
   * @param  string tid      - ターゲットID(送信先ID)の指定です。
   *                           有効なIDを指定するとユニキャストします。
   *                           無効なIDや"broadcast"を指定するとブロードキャストします。
   * @param  string msg      - メッセージを指定します。
   * @param  mix    [param1] - 1つめのパラメタの指定です。デフォルトはundefinedです。
   * @param  mix    [param2] - 2つめのパラメタの指定です。デフォルトはundefinedです。
   * @return array/mix       - 送信先.procedure()の実行結果の配列を返します。
   * @see <a href="#set">uu.module.messagePump.set</a> - メッセージの送信先を登録
   */
  send: function(tid, msg, param1 /* = undefined */, param2 /* = undefined */) {
    var rv = [];
    if (tid && tid in this.reg) { // unicast
      rv.push(this.reg[tid].procedure(msg, param1, param2));
    } else { // broadcast
      uu.forEach(this.reg, function(v) { rv.push(v.procedure(msg, param1, param2)); });
    }
    return rv;
  },
  /** <b>メッセージの非同期送信</b>
   *
   * メッセージを非同期送信します。param1,param2にはどのような引数でも渡せます。
   *
   * @param  string tid      - ターゲットID(送信先ID)の指定です。
   *                           有効なIDを指定するとユニキャストします。
   *                           無効なIDや"broadcast"を指定するとブロードキャストします。
   * @param  string msg      - メッセージを指定します。
   * @param  mix    [param1] - 1つめのパラメタの指定です。デフォルトはundefinedです。
   * @param  mix    [param2] - 2つめのパラメタの指定です。デフォルトはundefinedです。
   * @see <a href="#set">uu.module.messagePump.set</a> - メッセージの送信先を登録
   */
  post: function(tid, msg, param1 /* = undefined */, param2 /* = undefined */) {
    if (tid && tid in this.reg) { // unicast
      this.msg.push([tid, msg, param1, param2]);
    } else { // broadcast
      uu.forEach(this.reg, function(v, i) { this.msg.push([i, msg, param1, param2]); });
    }
    this.vtm.resume(-1);
  }
};
/** メッセージポンプのインスタンス(uu.module.messagePump instance)
 *
 * @type object
 */
uu.msgpump = new uu.module.messagePump(); // instantiate

////////////////////////////////////////////////////////////
// init & config

/** <b>config</b>
 *
 * コンフィギュレーション
 *
 * @class
 */
uu.config = function() {
};

/** <b>uu.config.parseQuery - クエリ文字列に指定された設定項目を取り込む</b>
 *
 * id="uupaa.js"のscript要素のsrc属性のクエリ文字列に、
 * "設定項目名=値" を指定するとこれらを自動で取り込みます。<br />
 *
 * <pre>
 * 例:
 *    ＜script id="uupaa.js" "uupaa.js?debug=false&png24=0"＞
 *    uu.config.debug はfalseになります。
 *    uu.config.png24 はfalseになります。
 * </pre>
 * bool型の設定項目(png24など)は、
 * "false"や"0"を指定するとfalseになり、それ以外の文字列を指定するとtrueになります。
 */
uu.config._parseQuery = function() {
  var rv = {}, e = uu.id("uupaa.js"), pos = e.src.indexOf("?");
  if (pos !== -1) {
    rv = uu.url.query(e.src.slice(pos + 1));
  }
  function toBool(val) { return (val === "false" || val === "0") ? false : true; }
  uu.mix(uu.config, {
    debug:      rv.debug      ? toBool(rv.debug) : uu.config.debug,
    verbose:    rv.verbose    ? toBool(rv.verbose):uu.config.verbose,
    png24:      rv.png24      ? toBool(rv.png24) : uu.config.png24,
    imagePath:  rv.imagePath  ? rv.imagePath     : uu.config.imagePath,
    modulePath: rv.modulePath ? rv.modulePath    : uu.config.modulePath
  });
};

/** <b>uu.config.debug - デバッグモードのON/OFF(debug mode)</b>
 *
 * @type bool
 */
uu.config.debug = true;

/** <b>uu.config.verbose - おしゃべりモードのON/OFF(verbose mode)</b>
 *
 * @type bool
 */
uu.config.verbose = false;

/** <b>uu.config.png24 - 24bit png画像の有効/無効(24bit alpha channel png image)</b>
 * 24bit png画像をサポートする場合はtrueにします。デフォルトはtrueです。
 * IE5.5/6.0専用の設定です。
 * 
 * @type bool
 * @see uu.module.image.png24()
 */
uu.config.png24 = true;

/** <b>uu.config.imagePath - uupaa.jsが使用する画像の検索パス(image search path)</b>
 * uupaa.jsから呼び出す画像の検索パスを指定します。<br />
 *
 * 変更する場合は、スラッシュ("/")で終わる絶対パスで指定してください。<br />
 * デフォルトはuupaa.jsが設置されているパス以下のimg/ディレクトリです。
 *
 * <pre class="eg">uu.config.imagePath = "http://example.com/img/";</pre>
 * 
 * @type string
 * @see uu.module.image.png24
 */
uu.config.imagePath = uu.baseURL() + "img/";

/** <b>uu.config.modulePath - module検索パス(module search path)</b>
 * モジュール検索パスを指定します。<br />
 *
 * 変更する場合は、スラッシュ("/")で終わる絶対パスで指定してください。<br />
 * デフォルトは、"./,./mini/"です。
 *
 * <pre class="eg">uu.config.modulePath = ["./", "./mini/", "http://example.com/mini/"];</pre>
 * 
 * @type taxing
 * @see uu.module.load - モジュールの非同期ロード
 * @see uu.module.loadSync - モジュールの同期ロード
 */
uu.config.modulePath = "./,./mini/";

////////////////////////////////////////////////////////////
// ユーザが uu.dom.ready(), uu.window.ready()を使用していないケースでも
// uu.dom.already(), uu.window.already() がtrueを返せるように、
// ダミーのイベントハンドラを登録する
uu.dom.ready(uu.mute);
uu.window.ready(uu.mute);
uu.config._parseQuery();

})(); // end (function())()
