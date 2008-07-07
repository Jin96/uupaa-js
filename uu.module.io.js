/** <b>I/O Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.io = {};

/** <b>Color Module</b>
 *
 * @class
 */
uu.module.color = uu.klass.generic();
uu.module.color.prototype = {
  construct: function(color) {
    this.color = color;
  },
  add: function(rgb) {
    this.color += rgb;
  },
  /** <b>uu.module.color.toRGBString - カラー値から色指定用文字列を生成 - create color string for rgb function</b>
   *
   * カラー値から、rgb関数用の文字列( "rgb(255,255,255)" )を生成します。
   * 
   * <pre class="eg">0xff9999.toRGBString(); // "rgb(255,153,153)"</pre>
   *
   * @return string - "rgb(red,green,blue)" フォーマットの色指定用文字列を返します。
   */
  toRGBString: function() {
    var v = this.color, rv = [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
    return "rgb(" + rv.join(",") + ")";
  },
  /** <b>uu.module.color.toRGBAString - カラー値から色指定用文字列を生成 -Create color string for rgba function</b>
   *
   * カラー値から、rgba関数用の文字列( "rgba(255,255,255,1.0)" )を生成します。
   * 
   * <pre class="eg">0xff9999.toRGBAString(0.4); // "rgba(255,153,153,0.4)"</pre>
   *
   * @param number alpha - 不透明度を指定します。0.0～1.0の値を指定可能です。デフォルトは1.0です。
   * @return string - "rgba(red,green,blue,alpha)" フォーマットの色指定用文字列を返します。
   */
  toRGBAString: function(alpha /* = 1.0 */) {
    var v = this.color, rv = [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff, alpha || 1.0];
    return "rgba(" + rv.join(",") + ")";
  }
};

/** <b>Codec module</b>
 *
 * 文字, 文字コードの変換を行います。以下の名前を指定します。
 *
 * <dl>
 *  <dt>HTMLToHTMLEntity</dt><dd>記号(＆＜＞)のHTMLエンティティ化</dd>
 *  <dt>HTMLEntityToHTML</dt><dd>HTMLエンティティの記号化(＆＜＞)</dd>
 *  <dt>LineBreakToBR</dt><dd>テキストの改行をHTMLの改行に変換</dd>
 *  <dt>BRToLineBreak</dt><dd>HTMLの改行をテキストの改行に変換</dd>
 *  <dt>encodeURLSafe64</dt><dd>String to URLSafe64</dd>
 *  <dt>decodeURLSafe64</dt><dd>URLSafe64 to String</dd>
 *  <dt>encodeURIComponent</dt><dd>encodeURIComponent</dd>
 *  <dt>decodeURIComponent</dt><dd>decodeURIComponent</dd>
 *  <dt>encodeJSON</dt><dd>encodeJSON</dd>
 *  <dt>decodeJSON</dt><dd>decodeJSON</dd>
 * </dl>
 *
 * @param String str        - 文字列を指定します。
 * @param String codecName  - コーデック名を指定します。
 * @return String           - 指定されたコーデックで変換後の文字列を返します。
 *                            不正なコーデック名を指定するとstrをそのまま返します。
 * @class
 */
uu.codec = function(str, codecName) {
  if (codecName in uu.codec) {
    return uu.codec[codecName](str);
  }
  return str;
};

/** <b>URLSafe64のON/OFF</b>
 * URLSafe64を使用する場合はtrueを指定します。URLSafe64ではなくBase64を使用する場合はfalseを指定します。
 *
 * @type bool
 * @see <a href="#encodeURLSafe64">uu.codec.encodeURLSafe64</a> - 文字列をURLSafe64にエンコード
 * @see <a href="#decodeURLSafe64">uu.codec.decodeURLSafe64</a> - URLSafe64を文字列にデコード
 */
uu.codec.URLBase64 = true;

uu.codec.HTMLToHTMLEntity = function(str) { // HTML to HTMLEntity
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
uu.codec.HTMLEntityToHTML = function(str) { // HTMLEntity to HTML
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
};
uu.codec.LineBreakToBR = function(str) { // line break to <br />
  return str.replace(/(\r\n|\r|\n)/g, "<br />");
};
uu.codec.BRToLineBreak = function(str) { // <br /> to line break
  return str.replace(/<br[^>]*?>/ig, "\n");
};
uu.codec.encodeURLSafe64 = function(str) { // String(UCS2) → UTF8 → URLSafe64
  return uu.codec._BinToBase64(uu.codec._UCS2ToUTF8(str));
};
uu.codec.decodeURLSafe64 = function(str) { // URLSafe64 → UTF8 → String(UCS2)
  return uu.codec._UTF8toUCS2(uu.codec._Base64ToBin(str));
};
uu.codec.encodeURIComponent = function(str) { // ";/?:@&=+$," → %3B%2F%3F%3A%40%26%3D%2B%24%2C
  var rv = "";
  try {
    rv = uuw.encodeURIComponent(str);
  } catch (e) {}
  return rv;
};
uu.codec.decodeURIComponent = function(str) {
  var rv = "";
  try {
    rv = uuw.decodeURIComponent(str);
  } catch (e) {}
  return rv;
};

/** <b>uu.codec.encodeJSON - JSONエンコード(Object to JSON String)</b>
 *
 * JavaScriptオブジェクトをJSONデータにエンコードします。<br />
 * fnを指定するとJSONの仕様違反となる型(RegExpやfunctionなど)に関して、fn(rv, mix) をコールします。
 * fnがtrueを返せば処理を続行し、falseを返せば処理を中断し、例外をスローします。
 *
 * @param Hash/Mix mix  - jsonエンコードする要素を指定します。
 * @param Function [fn] - JSONの仕様にない型を処理する関数を指定します。fnがfalseを返すと例外をスローします。
 *                        デフォルトはuu.noです。
 * @return String       - jsonエンコード済みの文字列を返します。
 * @throws TypeError "dirty" 無効なデータ(JSONフォーマットに変換不能)
 */
uu.codec.encodeJSON = function(mix, fn /* = uu.no */) {
  fn = fn || uu.no;
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
    else {
      if (!fn(rv, mix)) { throw TypeError("dirty"); }
    }
  };
  F(mix);
  return rv.join("");
};

/** <b>uu.codec.decodeJSON - JSONデコード(JSON String to Object)</b>
 *
 * @param String str - jsonエンコードされた要素を指定します。
 * @return Hash/Mix  - jsonデコード済みの文字列を返します。デコード失敗でfalseを返します。
 * @see <a href="#.encode">uu.json.encode</a> - JSONエンコード
 */
uu.codec.decodeJSON = function(str, force /* = false */) {
  var judge = str.replace(/"(\\.|[^"\\])*"/g, "");
  if (!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(judge))) {
    return uu.module.evaljs(str);
  }
  return false;
};

// --------------------------------------------------------
uu.codec._UCS2ToUTF8 = function(ucs2) {
  if (!uu.isS(ucs2) || !ucs2.length) { return ucs2; }
  var rv = [], size = ucs2.length, c = 0, i = 0;
  for (; i < size; ++i) {
    c = ucs2.charCodeAt(i);
    if (c < 0x0080) {
      rv.push(String.fromCharCode(c & 0x7f));
    } else if (c < 0x0800) {
      rv.push(String.fromCharCode(((c >>>  6) & 0x1f) | 0xc0),
              String.fromCharCode( (c         & 0x3f) | 0x80));
    } else { // if (c < 0x10000)
      rv.push(String.fromCharCode(((c >>> 12) & 0x0f) | 0xe0),
              String.fromCharCode(((c >>>  6) & 0x3f) | 0x80),
              String.fromCharCode( (c         & 0x3f) | 0x80));
    }
  }
  return rv.join("");
};
uu.codec._UTF8toUCS2 = function(utf8) {
  if (!uu.isS(utf8) || !utf8.length) { return utf8; }
  var rv = [], size = utf8.length, c = 0, i = 0;
  for (; i < size; ++i) {
    c = utf8.charCodeAt(i); // 1st byte
    if (c < 0x80) {
      rv.push(String.fromCharCode(c));
    } else if (c < 0xe0) {
      c  = (c & 0x1f) << 6;
      c |= (utf8.charCodeAt(++i) & 0x3f);
      rv.push(String.fromCharCode(c));
    } else if (c < 0xf0) {
      c  = (c & 0x0f) << 12;
      c |= (utf8.charCodeAt(++i) & 0x3f) << 6;
      c |= (utf8.charCodeAt(++i) & 0x3f);
      rv.push(String.fromCharCode(c));
    }
  }
  return rv.join("");
};
uu.codec._BinToBase64 = function(bin) {
  if (!uu.isS(bin) || !bin.length) { return bin; }
  var data = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      rv = [], c = [0,0,0], size = bin.length, remain = bin.length, i = 0;
  for (; i < size; remain -= 3, i += 3) {
    c[0] = bin.charCodeAt(i), c[1] = c[2] = 0;
    if (remain > 2) {
      c[1] = bin.charCodeAt(i + 1);
      c[2] = bin.charCodeAt(i + 2);
      rv.push(data.charAt( c[0] >>> 2 & 0x3F),
              data.charAt((c[0] <<  4 | c[1] >>> 4) & 0x3F),
              data.charAt((c[1] <<  2 | c[2] >>> 6) & 0x3F),
              data.charAt( c[2]                     & 0x3F));
    } else if (remain > 1) { // remain 2byte
      c[1] = bin.charCodeAt(i + 1);
      rv.push(data.charAt( c[0] >>> 2               & 0x3F),
              data.charAt((c[0] <<  4 | c[1] >>> 4) & 0x3F),
              data.charAt( c[1] <<  2               & 0x3F), "=");
    } else { // remain 1byte
      rv.push(data.charAt( c[0] >>> 2 & 0x3F),
              data.charAt( c[0] <<  4 & 0x3F), "==");
    }
  }
  if (uu.codec.URLSafe64) {
    return rv.join("").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  return rv.join("");
};
uu.codec._Base64ToBin = function(b64) {
  if (!uu.isS(b64) || !b64.length) { return b64; }
  b64 = b64.replace(/-/g, '+').replace(/_/g, '/'); // "-"→"+", "_"→"/"
  switch (b64.length % 4) { // omitted pad(=)?
    case 2: b64 += '=';
    case 3: b64 += '=';
  }
  var rv = [], c = [0,0,0,0], size = b64.length, i = 0, j = 0, pos = 0,
      data = [
        64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64, 64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,
        64,64,64,64,64,64,64,64,64,64,64,62,64,64,64,63, 52,53,54,55,56,57,58,59,60,61,64,64,64,64,64,64,
        64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14, 15,16,17,18,19,20,21,22,23,24,25,64,64,64,64,64,
        64,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40, 41,42,43,44,45,46,47,48,49,50,51,64,64,64,64,64,
        64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64, 64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,
        64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64, 64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,
        64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64, 64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,
        64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64, 64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64
      ];
  while (pos < size) {
    c[0] = c[1] = c[2] = c[3] = 0;
    for (i = 0; i < 4; ++i) {
      if ((c[i] = data[(b64.charCodeAt(pos++) & 0xff)]) & 64) {
        c[i] = 0;
        pos = size; // loop out
        break;
      }
      c[i] &= 0x3f;
    }
    if (i > 0) { j = c[0] << 2 | c[1] >>> 4; (j & 0xff) && rv.push(String.fromCharCode(j & 0xff)); }
    if (i > 1) { j = c[1] << 4 | c[2] >>> 2; (j & 0xff) && rv.push(String.fromCharCode(j & 0xff)); }
    if (i > 2) { j = c[2] << 6 | c[3];       (j & 0xff) && rv.push(String.fromCharCode(j & 0xff)); }
  }
  return rv.join("");
};

////////////////////////////////////////////////////////////

/** <b>Cookie Module</b>
 *
 * 検証が終わっていないので、Cookie Moduleは使用しないでください
 * @class
 */
uu.module.cookie = uu.klass.generic();
uu.module.cookie.prototype = {
  secure: !!(uuw.location.protocol === "https:"),
  enable: !!(uuw.navigator.cookieEnabled),

  /** <b>初期化</b>
   *
   * @param Hash    param         { domain, path, expire } を指定します。
   *                              デフォルトは{ domain: "", path: "/", expire: 0 }です。
   * @param String  param.domain  cookieを適用するドメインを指定します。
   * @param String  param.path    cookieを適用するパスを指定します。
   * @param String  param.expire  有効期限を秒数で指定します。
   *                              0以下の値を指定するとブラウザを閉じたタイミングでcookieは削除されます。
   */
  construct: function(param /* = { domain: "", path: "/", expire: 0 } */) {
    this.param = uu.mix.param(param || {}, { domain: "", path: "/", expire: 0 });
  },
  save: function(hash) {
    var rv = [], pa = this.param;
    uu.forEach(hash, function(v, i) {
      rv.push(i + "=" + encodeURIComponent(v));
    });
    rv.push(uu.sprintf("domain=%s; path=%s; max-age=%d; %s", pa.domain, pa.path, pa.expire, this.secure ? "secure" : ""));
    uud.cookie = rv.join("; ");
    return this;
  },
  find: function(name) {
    var re = (new RegExp(name + "=([^;]+);?"));
    return (!uud.cookie.match(re)) ? "" : decodeURIComponent(RegExp.$1);
  }
};

})(); // end (function())()
