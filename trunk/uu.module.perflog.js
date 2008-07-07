/** Performance and Log Module
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.perflog = {};

/** パフォーマンスモジュール - Performance Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf">performance</a>
 * @class
 */
uu.module.perf = uu.klass.generic();
uu.module.perf.prototype = {
  /** uu.module.perf.construct - 初期化
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf.construct">uu.module.perf.construct</a>
   */
  construct: function() {
    this.diff = [];
  },
  /** uu.module.perf.run - 測定
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf.run">uu.module.perf.run</a>
   */
  run: function(fn, times /* = 1 */) {
    this.diff.length = 0;
    var rv, i = 0, sz = times || 1;
    for (; i < sz; ++i) {
      rv = (new Date()).getTime();
      fn();
      this.diff.push((new Date()).getTime() - rv);
    }
  },
  /** uu.module.perf.dump - ダンプ
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf.dump">uu.module.perf.dump</a>
   */
  dump: function() {
    return this.diff;
  },
  /** uu.module.perf.average - 平均値
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf.average">uu.module.perf.average</a>
   */
  average: function() {
    if (!this.diff.length) { return 0; }
    var rv = 0;
    this.diff.forEach(function(v) { rv += v; });
    return rv / this.diff.length;
  }
};

/** ログモジュール2 - Log Module Version2
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.log2">log2</a>
 * @class
 */
uu.module.log2 = uu.klass.singleton();
uu.module.log2.prototype = {
  /** uu.module.log2.construct - 初期化
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.log2.construct">uu.module.log2.construct</a>
   */
  construct: function(param /* = { id: "uuLog", sort: true, uparound: 30, style: { ... } } */) {
    var me = this;
    this.param = uu.mix.param(param || {}, {
      id: "uuLog", sort: true, uparound: 0,
      style: { backgroundColor: "powderblue", color: "black", position: "fixed", display: "none",
               width: "30em", height: "8em", right: "1em", bottom: "1em", overflow: "auto", opacity: 0.7 }
    });
    this.stock = [];
    this.line = 0;
    this.e = 0;
    uu.window.ready(function() {
      // ログ出力用のpre要素が存在しなければ作成する
      me.e = uu.id(me.param.id, true);
      if (!me.e) {
        me.e = uu.mix(uud.body.appendChild(uud.createElement("pre")), { id: me.param.id });
        uu.css.set(me.e, me.param.style);
      }
      me.put(); // 溜まったログを出力
    });
  },
  put: function() {
    if (this.e && this.stock.length) { // 溜まったログを出力
      uu.css.set(this.e, { display: "show" });
      this.e.innerHTML += "<br />" + this.stock.join(", ");
      this.stock.length = 0; // clear
      if (this.param.uparound && ++this.line > this.param.uparound) {
        this.clear(); // clear log
        this.line = 0;
      }
    }
  },
  clear: function() {
    if (this.e) { this.e.innerHTML = ""; }
    this.stock = [];
  },
  /** uu.module.log2.log - ログ出力 - Logging
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.log2.log">uu.module.log2.log</a>
   */
  log: function(fmt /*, arg, ... */) {
    this.stock.push(uu.sprintf.apply(this, arguments));
    this.put();
  },
  /** uu.module.log2.inspect - オブジェクトを人間用に加工し出力する - Humanize output, Object Reflection
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.log2.inspect">uu.module.log2.inspect</a>
   */
  inspect: function(/* mix, ... */) {
    var i = 0, sz = arguments.length, nest = 0;
    for (; i < sz; ++i) {
      this.stock.push(this._inspectImpl(arguments[i], this.param.sort, nest));
    }
    this.put();
  },
  _inspectImpl: function(mix, sort, nest) {
    var rv = [], i, xpath;
    if (mix === null) { return "null"; }
    if (mix === void 0) { return "undefined"; }
    if (uu.isB(mix) || uu.isN(mix)) { return mix.toString(); }
    if (uu.isS(mix)) { return '"' + mix + '"'; } // {{
    if (uu.isF(mix)) { return mix.toString().replace(/function\s*([^\(]*)\([^}]*}/, "$1(){}"); } // ))
    if (++nest >= 4) { return "..."; } // too mach recursion
    if (uu.isE(mix)) { xpath = [this._toXpath(mix)]; // Node
                       mix.id && xpath.push(" #" + mix.id); // add "#id"
                       mix.className && xpath.push(" ." + mix.className); // add ".className"
                       return xpath.join(""); /*
                       for (i in mix) { rv.push(i + ": " + uu.inspect._impl(mix[i], sort, nest)); } // Object / FakeArray
                       sort && rv.sort();
                       return xpath.join("") + "{" + rv.join(", <br />") + "}"; }
                       */
                       }
    if (uu.isA(mix)) { for (i = 0; i < mix.length; ++i) { rv.push(this._inspectImpl(mix[i], sort, nest)); }
                       return "[" + rv.join(", <br />") + "]"; }
    for (i in mix) { rv.push(i + ": " + this._inspectImpl(mix[i], sort, nest)); } // Object / FakeArray
    sort && rv.sort();
    return "{" + rv.join(", <br />") + "}";
  },
  // Node to XPath
  _toXpath: function(elm) {
    if (!elm.parentNode || elm.nodeType !== 1) { return "/html"; }
    function F(e, tag) {
      var rv = 0, i = 0, c = e.parentNode.childNodes, sz = c.length;
      for (; i < sz; ++i) { if (c[i].nodeType !== 1) { continue; }
                            if (c[i].tagName === tag) { ++rv; }
                            if (c[i] === e) { return rv; } }
      return -1;
    }
    var rv = [], pos = F(elm, elm.tagName);
    while (elm && elm.nodeType === 1) {
      rv.push(elm.tagName.toLowerCase());
      elm = elm.parentNode;
    }
    rv.reverse();
    return "/" + rv.join("/") + "[" + pos + "]";
  }
};
uu.log2 = new uu.module.log2();
uu.log = function(fmt /*, arg, ... */) { uu.log2[uu.isS(fmt) ? "log" : "inspect"].apply(uu.log2, arguments) };
uu.log.dir = function(/* arg, ... */) { uu.log2.inspect.apply(uu.log2, arguments); };
uu.log.clear = function() { uu.log2.clear(); };

})(); // end (function())()
