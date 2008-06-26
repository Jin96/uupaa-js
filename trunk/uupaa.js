/** uupaa.js - JavaScript Library for Japanese creator
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 * @see <a href="http://code.google.com/p/uupaa-js/">Home(Google Code)</a>
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/README.htm">README</a>
 */
/** uupaa.js core definition
 *
 * @class
 */
var uu = function() {
  return uu._impl.apply(this, arguments);
};
uu._impl = function() {}; // As you like

uu.version = [0, 3]; // [major, release]

// -----------------------------------
(function() {
// arguments alias
var uud = document, uuw = window, // alias
    uucs = uud.uniqueID ? 0 : uud.defaultView.getComputedStyle, // alias
    uuhd = uud.getElementsByTagName("head")[0]; // <head>

/** uu.mix - オブジェクトのミックスイン - Object mixin
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.mix">uu.mix</a>
 */
uu.mix = function(base, flavor, aroma /* = undefined */) {
  for (var i in flavor) {
    base[i] = flavor[i];
  }
  return aroma ? uu.mix(base, aroma) : base;
};

/** uu.mix.param - パラメタのミックスイン - Object mixin for parameters
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.mix.param">uu.mix.param</a>
 */
uu.mix.param = function(base, flavor, aroma /* = undefined */) {
  for (var i in flavor) {
    (i in base) ? 0 : (base[i] = flavor[i]);
  }
  return aroma ? uu.mix.param(base, aroma) : base;
};

/** uu.mix.prefix - prefix付きのミックスイン - Object mixin with/without prefix
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.mix.prefix">uu.mix.prefix</a>
 */
uu.mix.prefix = function(base, flavor, prefix /* = "" */, add /* = true */) {
  var i, p = prefix || "", sz = p.length;
  if (!sz) { return uu.mix(base, flavor); }
  if (add === void 0 || add) {
    for (i in flavor) {
      base[p + i] = flavor[i];
    }
  } else {
    for (i in flavor) {
      (i.indexOf(p) !== -1) ? (base[i.substring(sz)] = flavor[i]) : (base[i] = flavor[i]);
    }
  }
  return base;
};

/** uu.forEach - 全要素を評価 - for each
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.forEach">uu.forEach</a>
 */
uu.forEach = function(mix, fn, me /* = undefined */) {
  if (mix.forEach) { mix.forEach(fn, me); return mix; } // call native forEach function
  if ("length" in mix) { Array.prototype.forEach.call(mix, fn, me); return mix; } // FakeArray
  for (var i in mix) {
    mix.hasOwnProperty(i) && fn.call(me, mix[i], i, mix);
  }
  return mix;
};

/** uu.filter - 全要素を評価し、結果が真の要素を配列で返す - Object iteration
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.filter">uu.filter</a>
 */
uu.filter = function(mix, fn, me /* = undefined */) {
  if (mix.filter) { return mix.filter(fn, me); } // call native filter function
  if ("length" in mix) { return Array.prototype.filter.call(mix, fn, me); } // FakeArray
  var rv = [], i, v;
  for (i in mix) {
    if (mix.hasOwnProperty(i)) {
      v = mix[i];
      (fn.call(me, v, i, mix)) && rv.push(v);
    }
  }
  return rv;
};

/** ブラウザの判別とブラウザが保持する機能の判別 - Detect User-Agent, Browser Functions and DOM Functions
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.ua">uu.ua</a>
 */
uu.ua = function(info /* = "" */) {
  var me = arguments.callee, n = (info || "_").toLowerCase();
  if (n in me) { return me[n]; }
  switch (n) {
  case "display:table":
    return (!me.ie || me.version >= 8);
  case "version":
    if (!me.version) {
      me.version = (me.ie)     ? parseFloat(me._.match(/MSIE ([\d]\.[\d][\w]?)/)[1])
                 : (me.webkit) ? parseFloat(me._.match(/WebKit\/(\d+(?:\.\d+)*)/)[1])
                 : (me.gecko)  ? parseFloat(me._.match(/Gecko\/(\d{8})/)[1])
                 : (me.opera)  ? opera.version() : 0;
    }
    return me.version;
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
uu.ua.domrange= uud.implementation.hasFeature("Range", "2.0");    // is DOM Level2 Range Module
uu.ua.version = uu.ua("version");

/** IDセレクタ - ID Selector
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#id-selector">ID Selector</a>
 */
uu.id = function(id, noCache /* = false */) {
  return (noCache || false) ? uud.getElementById(id) :
         (uu.id._cache[id] || (uu.id._cache[id] = uud.getElementById(id)));
};
uu.id._cache = {};

/** タグ(要素)セレクタ</a> - Tag/Element Selector
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#element-selector">Tag/Element Selector</a>
 */
uu.tag = function(tagName, context /* = document */) {
  return (context || uud).getElementsByTagName(tagName);
};

/** クラスセレクタ - Class Selector
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#class-selector">Class Selector</a>
 */
uu.klass = function(className, context /* = document */, tag /* = undefined */) { // for Firefox3, Safari3, Opera9.5
  return (context || uud).getElementsByClassName(className);
};
if (!uud.getElementsByClassName) { // for Firefox2, IE6/7/8, Opera9.2x
  uu.klass = function(className, context /* = document */, tag /* = undefined */) {
    return uu.attr._impl("className", context || uud, tag || "*", className, "~=");
  };
}

/** uu.klass.generic - 汎用クラスの雛形を生成 - Create generic class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.generic">Create generic class</a>
 */
uu.klass.generic = function(_) {
  return function() {
    this.construct && this.construct.apply(this, arguments);
  };
};

/** uu.klass.singleton - シングルトンクラスの雛形を生成 - Create singleton class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.singleton">Create singleton class</a>
 */
uu.klass.singleton = function(_) {
  return function() {
    var me = arguments.callee;
    if (!me.instance) {
      me.instance = this; // keep instance
      this.construct && this.construct.apply(this, arguments);
      this.destruct && uu.window.unready(this.destruct, this);
    }
    return me.instance;
  };
};

/** uu.klass.add - classNameプロパティにクラス名を追加 - Add className property
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.add">uu.klass.add</a>
 */
uu.klass.add = function(elm, className) {
  elm.className += " " + ((uu.isS(className)) ? className : uu.notax(className).join(" "));
};

/** uu.klass.has - クラス名の存在確認 - Has className
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.has">uu.klass.has</a>
 */
uu.klass.has = function(elm, className) {
  return (" " + elm.className + " ").indexOf(" " + className + " ") !== -1;
};

/** uu.klass.remove - classNameプロパティからクラス名を削除 - Remove className property
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.remove">uu.klass.remove</a>
 */
uu.klass.remove = function(elm, className) {
  var e = " " + elm.className + " ", re = RegExp(" " + className + " ");
  if (re.test(e)) {
    elm.className = e.replace(re, "");
  }
};

/** uu.klass.toggle - classNameプロパティにクラス名を追加または削除する - Add className property or remove
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.klass.toggle">uu.klass.toggle</a>
 */
uu.klass.toggle = function(elm, className) {
  uu.klass.has(elm, className) ? uu.klass.remove(elm, className) : uu.klass.add(elm, className);
};

/** 属性セレクタ - Attribute Selector
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#attr-selector">Attribute Selector</a>
 */
uu.attr = function(selector, context /* = document */) {
  // "key" or "key=value"形式で指定された場合は、"*[@" key=value "]" フォーマットに補完する
  var sel = selector, m;
  if (sel.indexOf("[@") === -1) { // "A" or "A=V" -> "*[@A]" or "*[@A=V]"
    sel = "*[@" + sel + "]";
  } else if (sel.indexOf("@") === -1) { // "E[A]" or "E[A=V]" -> "E[@A]" or "E[@A=V]"
    sel = sel.replace("[", "[@");
  }
  m = sel.match(/^([\w\-\*]+)\s*\[\s*@(\w+)\s*(?:(\~=|\^=|\$=|\*=|=)\s*(["'])([^"']*)\4)?\s*\]$/);
  if (!m) { return []; }
  if (m[2] === "class") { m[2] = "className"; } // "class" -> "className"
  return (m[3]) ? uu.attr._impl(m[2], context || uud, m[1], m[5], m[3]) // $1=tag,$2=attr,$3=operator,$5=value
                : uu.attr._impl(m[2], context || uud, m[1], "", "@");   // $1=tag,$2=attr
};
uu.attr._impl = function(attr, context, tag, value, operator) {
  var rv = [], a = attr, v = value, sz = v.length, w, fn = {
    "@":  function(e) { (a in e || H(e)) && rv.push(e); },
    "=":  function(e) { ((a in e && e[a] === v) || G(e) === v) && rv.push(e); },
    "~=": function(e) { ((a in e && (" " + e[a] + " ").indexOf(v) !== -1) ||
                                    (" " + G(e) + " ").indexOf(v) !== -1) && rv.push(e); },
    "^=": function(e) { ((a in e && e[a].indexOf(v) === 0) ||
                                    G(e).indexOf(v) === 0) && rv.push(e); },
    "$=": function(e) { if (a in e && e[a].lastIndexOf(v) + sz === e[a].length) { rv.push(e); }
                        else { w = G(e); (w.lastIndexOf(v) + sz === w.length) && rv.push(e); } },
    "*=": function(e) { ((a in e && e[a].indexOf(v) !== -1) ||
                                    G(e).indexOf(v) !== -1) && rv.push(e); }
  }, G = !uu.ua.ie ? function(e) { return e.getAttribute(a) || ""; }
                   : function(e) { return ""; },
     H = !uu.ua.ie ? function(e) { return e.hasAttribute(a); } // IE hasAttribute not impl.
                   : function(e) { return null; };
  if (operator === "~=") { v = " " + v + " "; }
  if (operator in fn) { uu.forEach(uu.tag(tag, context), fn[operator]); }
  return rv;
};

/** uu.attr.get - 属性の取得 - Get attribute
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#uu.attr.get">Get attribute</a>
 */
uu.attr.get = function(elm, attr) {
  var rv = {}, ary = uu.notax(attr);
  function F(v) { rv[v] = (v in elm) ? elm[v] : (elm.getAttribute(v) || ""); }
  ary.forEach(F);
  return (ary.length === 1) ? uu.first(rv, "") : rv;
};
/** uu.attr.set - 属性の設定 - Set attribute
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#uu.attr.set">Set attribute</a>
 */
uu.attr.set = function(elm, attr) {
  function F(v, i) { elm[i] = v; }
  uu.forEach(attr, F);
};

/** uu.xpath - XPathセレクタ - XPath Selector
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#xpath-selector">XPath Selector</a>
 */
uu.xpath = function(expr, context /* = document */) {
  !uud.evaluate && uu.die("xpath");
  var rv = [], i, r = uud.evaluate(expr, context || uud, null, 0, null); // ANY_TYPE = 0
  switch (r.resultType) {
  case 1: rv = r.numberValue; break;  // NUMBER_TYPE = 1
  case 2: rv = r.stringValue; break;  // STRING_TYPE = 2
  case 3: rv = r.booleanValue; break; // BOOLEAN_TYPE = 3
  case 4: i = r.iterateNext(); while (i) { rv.push(i); i = r.iterateNext(); } break; // UNORDERED_NODE_ITERATOR_TYPE = 4
  }
  return rv;
};

/** uu.xpath.snap - XPathセレクタ(スナップショット) - XPath Selector on snapshot
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#xpath-selector">XPath Selector</a>
 */
uu.xpath.snap = function(expr, context /* = document */, attr /* = "" */, sort /* = true */) {
  !uud.evaluate && uu.die("xpath");
  var a = attr || "", n = uud.evaluate(expr, context || uud, null, sort ? 7 : 6, null),
      sz = n.snapshotLength, rv = Array(sz), i = 0, e;
  if (!a.length) { 
    for (; i < sz; ++i) { rv[i] = n.snapshotItem(i); }
  } else {
    for (; i < sz; ++i) { e = n.snapshotItem(i);
                          rv[i] = (a in e) ? e[a] : (e.getAttribute(a) || ""); }
  }
  return rv;
};

/** CSSセレクタ - CSS Selector
 * @class
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#css-selector">CSS Selector</a>
 */
uu.css = function(css3selector, context /* = document */) {
  !uud.evaluate && uu.die("xpath");
  var xpath, node, rv, i = 0, sz;
  try {
    xpath = uu.css.toXPath(css3selector);
    if (xpath) {
      node = document.evaluate(xpath, context || uud, null, 7, null);
      if (node && node.snapshotLength) {
        for (sz = node.snapshotLength, rv = Array(sz); i < sz; ++i) {
          rv[i] = node.snapshotItem(i);
        }
        return rv;
      }
    }
  } catch(e) { uu.config.debug && uu.die("css3", css3selector, xpath); }
  return [];
};

/** 擬似セレクタ - uu.css.pseudo
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#pseudo-selector">Pseudo Selector</a>
 */
uu.css.pseudo = function(pseudoSelector, context /* = document */, tag /* = undefined */) {
  var ctx = context || uud;
  switch (pseudoSelector) {
  case ":enabled":  return uu.filter(uu.tag(tag || "*", ctx), uu.css.pseudo._enabled);
  case ":disabled": return uu.filter(uu.tag(tag || "*", ctx), uu.css.pseudo._disabled);
  case ":checked":  return uu.filter(uu.tag(tag || "input", ctx), uu.css.pseudo._checked);
  case ":selected": return uu.filter(uu.tag(tag || "option", ctx), uu.css.pseudo._selected);
  case ":visible":  return uu.filter(uu.tag(tag || "*", ctx), function(v) { return !uu.css.pseudo._hidden(v); });
  case ":hidden":   return uu.filter(uu.tag(tag || "*", ctx), uu.css.pseudo._hidden);
  }
  return [];
};
uu.mix(uu.css.pseudo, {
  _enabled:   function(elm) { return !elm.disabled ? elm : 0; },
  _disabled:  function(elm) { return elm.disabled ? elm : 0; },
  _checked:   function(elm) { return ((elm.type === "checkbox" || elm.type === "radio") && elm.checked) ? elm : 0; },
  _selected:  function(elm) { return (elm.selected) ? elm : 0; },
  _hidden:    function(elm) { return (elm.type === "hidden" || uu.css.get.display(elm) === "none" ||
                                                               uu.css.get(elm, "visibility") === "hidden"); }
});

/** uu.css.get - 計算済みのスタイルを取得 - document.defaultView.getComputedStyle wrapper
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.css.get">uu.css.get</a>
 */
uu.css.get = function(elm, cssProp /* = undefined */) {
  var hash = {}, rv = uu.ua.ie ? elm.currentStyle : uucs(elm, ""), F = uu.css.cssProp;
  function camel(v) { v = F(v); hash[v] = (v in rv) ? rv[v] : ""; }
  function quick(v) {           hash[v] = (v in rv) ? rv[v] : ""; }
  if (!cssProp) { return rv; }
  cssProp = uu.notax(cssProp);
  if (cssProp.length === 0) { return ""; }
  cssProp.forEach(uu.config.backCompat ? camel : quick);
  return (cssProp.length === 1) ? uu.first(hash, "") : hash;
};

/** uu.css.set - スタイルの設定 - Set style
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.css.set">uu.css.set</a>
 */
uu.css.set = function(elm, cssPropHash) {
  var hash = cssPropHash, F = uu.css.cssProp;
  function special(v) { if (v in hash) { uu.css.set[v](elm, hash[v]); delete hash[v]; } }
  function camel(v, i) { elm.style[F(i)] = v; }
  function quick(v, i) { elm.style[i] = v; }
  uu.css.set._chain.forEach(special); // 特別な値を先に処理
  uu.forEach(hash, uu.config.backCompat ? camel : quick);
};
uu.css.set._chain = ["opacity", "top", "left", "width", "height", "display"];

uu.mix(uu.css.get, {
  opacity:function(elm) { return parseFloat(uucs(elm, "").opacity); },  // 不透明度を数値(0.0～1.0)で取得
  top:    function(elm) { return parseFloat(uucs(elm, "").top); },      // topを数値で取得(単位:px)
  left:   function(elm) { return parseFloat(uucs(elm, "").left); },     // leftを数値で取得(単位:px)
  width:  function(elm) { return parseFloat(uucs(elm, "").width); },    // widthを数値で取得(単位:px)
  height: function(elm) { return parseFloat(uucs(elm, "").height); },   // heightを数値で取得(単位:px)
  display:function(elm) { return uucs(elm).display; }
});
uu.mix(uu.css.set, {
  opacity:function(elm, opa) { elm.style.opacity = parseFloat(opa); }, // 不透明度の設定(0.0～1.0)
  top:    function(elm, num) { elm.style.top  = (typeof num === "number") ? parseInt(num) + "px" : num; }, // topを数値で指定(単位:px)
  left:   function(elm, num) { elm.style.left = (typeof num === "number") ? parseInt(num) + "px" : num; }, // leftを数値で指定(単位:px)
  width:  function(elm, num) { try { elm.style.width  = (typeof num === "number") ? parseInt(num) + "px" : num; } // widthを数値で指定(単位:px)
                               catch(e) { elm.style.width = "0px"; } },
  height: function(elm, num) { try { elm.style.height = (typeof num === "number") ? parseInt(num) + "px" : num; } // heightを数値で指定(単位:px)
                               catch(e) { elm.style.height = "0px"; } }
});

/** uu.css.set.display - 表示方法の設定 - display setter
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.css.set.display">uu.css.set.display</a>
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
  uu.mix(uu.css.get, {
    opacity:function(elm) { return (elm.filters.alpha) ? parseFloat(elm.style.opacity) : 1.0; }, // 不透明度を数値(0.0～1.0)で取得
    top:    function(elm) { return parseFloat(elm.currentStyle.top); },         // topを数値で取得(単位:px)
    left:   function(elm) { return parseFloat(elm.currentStyle.left); },        // leftを数値で取得(単位:px)
    width:  function(elm) { var rv = elm.currentStyle.width;                    // widthを数値で取得(単位:px)
                            return (rv === "auto") ? elm.clientWidth : parseFloat(rv); },   // IEは計算せずに"auto"を返してくる
    height: function(elm) { var rv = elm.currentStyle.height;                   // heightを数値で取得(単位:px)
                            return (rv === "auto") ? elm.clientHeight : parseFloat(rv); },  // IEは計算せずに"auto"を返してくる
    display:function(elm) { return elm.currentStyle.display; }
  });
  uu.css.set.opacity = function(elm, opa) {
    elm.style.opacity = parseFloat(opa); // uu.css.get.opacity()で値を取得できるようにしておく
    if (elm.filters.alpha) { elm.filters.alpha.opacity = parseFloat(opa) * 100; }
                      else { elm.style.filter += " alpha(opacity=" + (parseFloat(opa) * 100) + ")"; }
  };
}

/** uu.css.cssProp - "css-prop"を"cssProp"に変換 - convert "css-prop" style into "cssProp" style
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.css.cssProp">uu.css.cssProp</a>
 */
uu.css.cssProp = function(css_prop) {
  function camelize(str) {
    return str.replace(/-([a-z])/g, function(_, words) {
      return words.toUpperCase();
    });
  }
  var swap = { "float": uu.ua.ie ? "styleFloat" : "cssFloat" };
  return camelize((css_prop in swap) ? swap[css_prop] : css_prop);
};

/** uu.css.toXPath - CSS3セレクタをXPathに変換 - Convert CSS3 selector into XPath
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/SELECTOR.htm#uu.css.XPath">uu.css.toXPath</a>
 */
uu.css.toXPath = function(css3selectors) {
  return css3selectors.split(",").map(uu.css.toXPath._impl).join(" | ");
}
uu.css.toXPath._impl = function(sel) {
  var rv = [".//", "*"], exp = uu.css.toXPath._impl._regexp, index = 1, last = null, m, m2;

  function reset(E) { rv.length = 0, rv.push(E), index = 0; }
  function nth(str) { return (!isNaN(str)) ? /*(*/ (")=" + parseInt(str) + "-1") :
                             (str === "even" || str === "2n")   ? /*(*/ ")mod 2=1" :
                             (str === "odd"  || str === "2n+1") ? /*(*/ ")mod 2=0" :
                             (exp["xn+y"].test(str)) ? str.replace(exp["xn+y"], /*(*/ "+ $2)mod $1=1") : // 4n + 1
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
  //  case "hidden": // uu.css.pseudo(":hidden");
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
  ELM:    /^([\.\#]?)([a-z0-9\_\*\-]*)/i,     // E
  ATTR1:  /^\[\s*([^\~\^\$\*\|\=\s]+)\s*([\~\^\$\*\|]?=)\s*(["'])([^"']*)\3\s*\]/, // E[A=V]
  ATTR2:  /^\[\s*([^\]]*)\s*\]/,              // E[A]
  COMBO1: /^(?:\s*([\>\+\~\s]))/,             // E F, E > F, E + F, E ~ F
  COMBO2: /^\s*([a-z0-9\_\*\-]+)/i,           // E + F の F用
  PSEUDO: /^\:([\w-]+)(?:\((.*)\))?/i,        // :nth-child(n)
  "2n+1": /2n\+1/,                            // :nth-child(2n+1)
  "xn+y": /([\d]+)n\+([\d]+)/,                // :nth-child(xn+y)
  xn:     /([\d]+)n/                          // :nth-child(xn)
};
uu.css.toXPath._impl._attr = {
  "=":  '[@%1$s="%2$s"]',
  "~=": '[contains(concat(" ",@%1$s," ")," %2$s ")]',
  "^=": '[starts-with(@%1$s,"%2$s")]',
  "$=": '[substring(@%1$s,string-length(@%1$s)-string-length("%2$s")+1)="%2$s"]',
  "*=": '[contains(@%1$s,"%2$s")]',
  "|=": '[@%1$s="%2$s" or starts-with(@%1$s,"%2$s-")]'
};

/** Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module">uu.module</a>
 * @class
 */
uu.module = function() {
};

/** uu.module.isLoaded - モジュールの読み込み確認 - is Module Loaded
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.module.isLoaded">uu.module.isLoaded</a>
 */
uu.module.isLoaded = function(module) {
  return uu.notax(module).every(function(v) {
    return v in uu.module;
  });
};

/** uu.module.load - モジュールの読み込み - Load Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.module.load">uu.module.load</a>
 */
uu.module.load = function(path /* = "" */, module, fn /* = undefined */) {
  var src = uu.module._buildURL(path || uu.config.modulePath, module),
      mods = uu.indexes(src), run = 0;
  fn = fn || uu.mute;

  if (uu.module.isLoaded(module) || !mods.length) { fn(); return; }

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

/** uu.module.loadSync -モジュールの同期読み込み - Load Module(Synchronized)
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.module.loadSync">uu.module.loadSync</a>
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
      if ((tick += 50) > uu.module.timeout) {
        node = uu.module._reload(node, false);
        tick = 0;
      }
      if (uu.module.isLoaded(last)) {
        if (!order.length) { fn(); return; } // complete
        last = order.shift();
        node = uu.module._inject(last, src[last]);
        tick = 0;
      }
      uuw.setTimeout(arguments.callee, 50);
    }, 0)
  );
};

/** uu.module.timeout - タイムアウト時間の指定
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.module.timeout">uu.module.timeout</a>
 */
uu.module.timeout = 500; // 500ms(0.5s)

// uu.module._buildURL - URLのビルド
uu.module._buildURL = function(path, module) {
  var rv = {}, base = uu.url.base();
  path = uu.notax(path);
  uu.notax(module).forEach(function(m) {
    rv[m] = [];
    path.forEach(function(p) {
      if (!/$(https:|https:|file:)/.test(p)) {
        p = base + p; // to abs path
      }
      rv[m].push(p + "uu.module." + m + ".js");
    });
  });
  return rv; // Hash { module-name: [url], ...}
};

// uu.module._reload - script要素の差し替え(reload)
uu.module._reload = function(node, async /* = true */) {
  var n = uuhd.removeChild(node), next, e;
  !n.uuList.length && uu.die("module", node.uuModule);
  next = n.uuList.shift();
  e = uu.mix(uu.request._jsCreate(n.id), { uuModule: n.uuModule, uuList: n.uuList });
  if (async === void 0 || async) {
    uu.mix(e, uu.ua.ie ? { onreadystatechange: n.onreadystatechange } :
                         { onload: n.onload, onerror: n.onerror });
  }
  e.src = next;
  return uuhd.appendChild(e); // src設定後にドキュメントツリーに追加しないとIEでは動作しない
};

// uu.module._inject - script要素の差し込み
uu.module._inject = function(name, list, hash) {
  var src = list.shift(),
      e = uu.mix(uu.request._jsCreate("uu.module." + name + ".js"), { uuModule: name, uuList: list });
  uu.mix(e, hash || {});
  // IE6/7/8は、script要素にsrcを設定してからappendChild()を行わないとスクリプトがロードされない
  // これは (new Image()).src のケースとは挙動が異なる。
  function ie()    { e.src = src; uuhd.appendChild(e); }
  function other() { uuhd.appendChild(e); e.src = src; }
  uu.ua.ie ? ie() : other();
  return e;
};

/** Event
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#event">event</a>
 * @class
 */
uu.event = function() {
};

/** uu.event.handler - デフォルトイベントハンドラの生成 - Create default event handler
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.hander">uu.event.handler</a>
 */
uu.event.handler = function(me) {
  return me;
};

/** uu.event.set - イベントハンドラの設定 - Add event hander
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.set">uu.event.set</a>
 */
uu.event.set = function(elm, type, fn, capture /* = false */) {
  type = uu.notax(type);
  (elm === void 0 || !type.length || fn === void 0) && uu.die("event_set");
  function impl(name) { elm.addEventListener(uu.event.type.toDOM(name), fn, capture || false); }
  type.forEach(impl);
};

/** uu.event.unset - イベントハンドラの解除 - Remove event hander
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.unset">uu.event.unset</a>
 */
uu.event.unset = function(elm, type, fn, capture /* = false */) {
  type = uu.notax(type);
  (elm === void 0 || !type.length || fn === void 0) && uu.die("event_unset");
  function impl(name) { elm.removeEventListener(uu.event.type.toDOM(name), fn, capture || false); }
  type.forEach(impl);
};

/** uu.event.stop - イベントの抑止 - stop-propagation and prevent-default
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.stop">uu.event.stop</a>
 */
uu.event.stop = function(evt, cancel /* = true */) {
  evt.stopPropagation();
  (cancel === void 0 || cancel) && evt.preventDefault();
};

/** uu.event.target - イベント発生源の情報を取得 - Detect event target
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.target">uu.event.target</a>
 */
uu.event.target = function(evt) { // for Firefox, Safari, Opera
  return { real: evt.target, curt: evt.currentTarget, hover: evt.relatedTarget };
};

/** uu.event.type - DOMイベントタイプをDOM Level 0イベントタイプに変換
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.type">uu.event.type</a>
 */
uu.event.type = function(type) {
  switch (type) {
  case "onlosecapture": type = "mouseup"; break;
  case "DOMMouseScroll": type = "mousewheel"; break;
  }
  return type;
};

/** uu.event.type.toDOM - DOM Level 0イベントタイプをDOMイベントタイプに変換
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.event.type.toDOM">uu.event.type.toDOM</a>
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
    if (cancelDefault === void 0 || cancelDefault) { evt.returnValue = false; }
  };
  uu.event.target = function(evt) {
    var s = evt.srcElement, f = evt.fromElement;
    return { real: s, curt: s, hover: s === f ? evt.toElement : f };
  };
}

/** DOM
 * @class
 */
uu.dom = function() {
};
/** uu.dom.already - DOM Ready状態の取得 - DOM ready state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.dom.already">uu.dom.already</a>
 */
uu.dom.already = function() {
  return !!uu.dom.ready._run;
};

/** uu.dom.ready - DOM Readyイベントハンドラの設定 - DOM ready event handler
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.dom.ready">uu.dom.ready</a>
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

/** context以下の全ノードを切り取り、DocumentFragmentを返す */
uu.dom.cutdown = function(context /* = document */) {
  var rv, ctx = context || uud;
  if (uu.ua.domrange) { (rv = uud.createRange()).selectNodeContents(ctx);
                        return rv.extractContents(); }
  rv = uud.createDocumentFragment();
  while (ctx.firstChild) {
    rv.appendChild(ctx.removeChild(ctx.firstChild));
  }
  return rv;
};

/** Window
 * @class
 */
uu.window = function() {
};

/** uu.window.already - Window Ready状態の取得 - Window ready state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.window.already">uu.window.already</a>
 */
uu.window.already = function() {
  return !!uu.window.ready._run;
};

/** uu.window.unalready - Window Unready状態の取得 - Window unready state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.window.unalready">uu.window.unalready</a>
 */
uu.window.unalready = function() {
  return !!uu.window.unready._run;
};

/** uu.window.ready - Window Readyイベントハンドラの設定 - Window ready event handler
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.window.ready">uu.window.ready</a>
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

/** uu.window.unready - Window Unreadyイベントハンドラの設定 - Window unready event handler
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.window.unready">uu.window.unready</a>
 */
uu.window.unready = function(fn, me /* = undefined */) {
  var e = arguments.callee;
  if (uu.isA(fn)) { e._stock.forEach(function(v) { e._stock.push([v, me]); }); }
             else { e._stock.push([fn, me]); }
  if (!e._run) {
    // Firefox2, Safari3, IE6はbeforeunload対応, Opera9.x, 9.5は非対応
    uu.event.set(uuw, "beforeunload,unload", e._impl, false);
  }
};
uu.window.unready._run = 0; // uu.window.unready()実行回数
uu.window.unready._stock = []; // uu.window.unready()用イベントコンテナ
uu.window.unready._impl = function() { // uu.window.unready()の実処理部
  var e = uu.window.unready;
  !e._run++ && (e._stock.forEach(function(v) { uu.isF(v[0]) && v[0].call(v[1]); }),
                e._stock = []); // gc
};

/** canvas
 * @class
 */
uu.canvas = function() {
};

/** uu.canvas.already - CanvasReady状態の取得 - CanvasReady state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.canvas.already">uu.canvas.already</a>
 */
uu.canvas.already = function() {
  return !!uu.canvas.ready._run;
};

/** uu.canvas.ready - CanvasReadyイベントハンドラの設定 - CanvasReady event handler
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.canvas.ready">uu.canvas.ready</a>
 */
uu.canvas.ready = function(fn) {
  (uu.ua.ie && !uud.getElementById("excanvas.js")) && uu.die("canvas");
  function judge() {
    return uu.toArray(uu.tag("canvas")).every(function(v) { return uu.isF(v.getContext); });
  }
  var e = arguments.callee;
  if (e._run) {
    (uu.isA(fn) ? fn : [fn]).forEach(function(v) { v(); });
  } else {
    e._stock = e._stock.concat(fn);
    if (uu.ua.gecko || uu.ua.webkit /*|| uu.ua.opera */) {
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

/** Request
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#request">Request</a>
 * @class
 */
uu.request = function() {
};
uu.mix(uu.request, {
  callbackFilter: 0x2,  // コールバックフィルター
  timeout: 10000,       // タイムアウト時間(単位:ms)の指定, 0でタイムアウトしない
  header: {             // 送信ヘッダの指定
    "X-Requested-With": "XMLHttpRequest"
  },
  jsonpFn: "callback",  // JSONP用コールバック関数名の指定。デフォルトは"callback"
  _cache: {},           // uu.ajax.loadIfMod - { url: timestamp } キャッシュ
  _fn: {},              // uu.json.load - JSONP { id: callbackfunction }
  _suicide: 60000       // uu.json.load - JSONP リソース開放待機時間, timeoutより大きな値を指定
});

// uu.request._jsCreate - script要素の生成
// @return Element - 生成したscript要素を返します。
uu.request._jsCreate = function(id /* = "" */) {
  return uu.mix(document.createElement("script"), {
    type: "text/javascript", charset: "utf-8", id: id || ""
  });
};
// uu.request._jsExec - JavaScript文字列をグローバルネームスペースで評価
// @return Element - head要素から削除したscript要素を返します。
uu.request._jsExec = function(code) {
  return uuhd.removeChild(uuhd.appendChild(uu.mix(uu.request._jsCreate(), { text: code })));
};

/** Ajax
 * @class
 */
uu.ajax = function() {
};

/** uu.ajax.already - Ajaxの状態(使用可能/不能)の取得 - Ajax ready state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.ajax.already">uu.ajax.already</a>
 */
uu.ajax.already = function() {
  return uuw.XMLHttpRequest || uuw.ActiveXObject;
};

/** uu.ajax.load - 非同期通信 - Ajax async request
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.ajax.load">uu.ajax.load</a>
 */
uu.ajax.load = function(url, fn /* = undefined */, data /* = undefined */) {
  !url && uu.die("ajax_load");
  uu.ajax.load._impl(url, fn || uu.mute, data || null, false);
};

/** uu.ajax.loadIfMod - 更新チェック付き非同期通信 - Ajax async request with new-arrival check
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.ajax.loadIfMod">uu.ajax.loadIfMod</a>
 */
uu.ajax.loadIfMod = function(url, fn /* = undefined */) {
  !url && uu.die("ajax_loadIfMod");
  uu.ajax.load._impl(url, fn || uu.mute, null, true);
},

// 非同期通信
uu.ajax.load._impl = function(url, fn, data, ifMod) {
  var rq = uu.request, cf = rq.callbackFilter, uid = uu.uniqueID("ajax"),
      xhr = uuw.XMLHttpRequest ? new XMLHttpRequest()
          : uuw.ActiveXObject  ? new ActiveXObject('Microsoft.XMLHTTP') : null;
  if (!xhr) { fail(); return; }
  function H(v, k) { ("setRequestHeader" in xhr) && xhr.setRequestHeader(k, v); } // Opera8にはsetRequestHeader()メソッドが無い
  function lastMod() { var rv = xhr.getResponseHeader("Last-Modified");
                       return (rv) ? Date.parse(rv) : 0; };
  function fail(state) { (cf & 4) && fn(uid, 4, "", state || 400, url, 1); } // 400 "Bad Request"
  function toRFC1123String(tm) { // HTTP/1.1準拠の日付文字列( "Thu, 01 Jan 1970 00:00:00 GMT" )を生成
    if (!uu.ua.ie) { return (new Date(tm)).toUTCString(); }
    var rv = (new Date(tm)).toUTCString().replace(/UTC/, "GMT");
    return (rv.length < 29) ? rv.replace(/, /, ", 0") : rv; // pad zero
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) { return; }
    if (xhr.status !== 200) { fail(xhr.status); return; } // 304 too
    (cf & 2) && fn(uid, 2, xhr.responseText, 200, url, 1);
    (ifMod) && (rq._cache[url] = lastMod);
  };

  try {
    xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), true); // true = Async
  } catch(e) { fail(); return; }

  uu.forEach(rq.header, H);
  (ifMod && url in rq._cache) && H(toRFC1123String(rq._cache[url]), "If-Modified-Since");
  data && H("application/x-www-form-urlencoded", "Content-Type");
  (cf & 1) && fn(uid, 1, "", 0, url, 1);
  xhr.send(data);
  rq.timeout && uu.tm10.set(function() { xhr.abort(); fail(408); }, rq.timeout, 1); // 408 "Request Time-out"
};

/** uu.ajax.loadSync - 同期通信 - Ajax sync request
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.ajax.loadSync">uu.ajax.loadSync</a>
 */
uu.ajax.loadSync = function(url, fn /* = undefined */, data /* = undefined */) {
  !url && uu.die("ajax_loadSync");
  fn = fn || uu.mute, data = data || null;
  var rq = uu.request, cf = rq.callbackFilter, uid = uu.uniqueID("ajax"),
      xhr = uuw.XMLHttpRequest ? new XMLHttpRequest()
          : uuw.ActiveXObject  ? new ActiveXObject('Microsoft.XMLHTTP') : null;
  function H(v, k) { ("setRequestHeader" in xhr) && xhr.setRequestHeader(k, v); } // Opera8にはsetRequestHeader()メソッドが無い
  function fail(state) { (cf & 4) && fn(uid, 4, "", state || 400, url, 1); } // 400 "Bad Request"

  if (!xhr) { fail(); return; }

  try {
    xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), false); // false = Sync
  } catch(e) { fail(); return; }

  uu.forEach(rq.header, H);
  data && H("application/x-www-form-urlencoded", "Content-Type");
  (cf & 1) && fn(uid, 1, "", 0, url, 0);
  xhr.send(data);
  if (xhr.status === 200) { (cf & 2) && fn(uid, 2, xhr.responseText, 200, url, 0); }
                     else { fail(xhr.status); }
};

/** JSON
 * @class
 */
uu.json = function() {
};

/** uu.json.already - JSONPの状態(使用可能/不能)の取得 - JSONP ready state
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.json.already">uu.json.already</a>
 */
uu.json.already = function() {
  return true;
};

/** uu.json.load - 非同期通信 - JSONP async request
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.json.load">uu.json.load</a>
 */
uu.json.load = function(url, fn /* = undefined */) {
  !url && uu.die("json_load");
  fn = fn || uu.mute;
  var rq = uu.request, cf = rq.callbackFilter, uid = uu.uniqueID("jsonp"),
      node, rurl = uu.url.query.add(url, rq.jsonpFn, "uu.request._fn." + uid);
  function fail(state) { (cf & 4) && fn(uid, 4, "", state || 400, url, 1); } // 400 "Bad Request"

  uuhd.appendChild(node = uu.request._jsCreate(uid));
  node._run = 0;

  rq._fn[uid] = function(json, state) {
    function suicide() {
      uuhd.removeChild(node);
      node.src = "";
      delete rq._fn[uid];
    }
    if (node._run++) { return; }
    if (json) { (cf & 2) && fn(uid, 2, json, 200, url, 1); } // 200 OK
         else { fail(state || 404); } // 404 "Not Found", 実際には他のエラーかもしれないが知る手段がない
    uu.delay(suicide, rq._suicide); // suicide
  };
  (cf & 1) && fn(uid, 1, "", 0, url, 1);
  node.src = rurl;

  rq.timeout && uu.delay(function() { rq._fn[uid]("", 408); }, rq.timeout); // 408 "Request Time-out"
};

/** URL
 * @class
 */
uu.url = function() {
};

/** uu.url.base - ベースディレクトリの取得 - Base Directory
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.base">uu.url.base</a>
 */
uu.url.base = function() {
  return uu.url.base._cache || (uu.url.base._cache = uu.url.base._impl());
};
uu.url.base._impl = function() {
  var elm = uu.attr('script[@src*="uupaa.js"]', uuhd);
  return (!elm.length) ? uu.url.dir(uuw.location.protocol + "//" + uuw.location.pathname.replace(/\\/g, "/")) :
                         uu.url.dir(uu.url.abs(elm[0].src));
};
uu.url.base._cache = "";

/** uu.url.abs - 相対パスを絶対パスに変換 - Convert relative path into a absolute pass
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.abs">uu.url.abs</a>
 */
uu.url.abs = function(relPath) {
  function impl(s) {
    var e = uud.createElement("div");
    e.innerHTML = '<a href="' + s + '" />';
    return e.firstChild.href;
  }
  return /^(file|https|http)\:\/\//.test(relPath) ? relPath : impl(relPath);
};

/** uu.url.fileName - パスからファイル名を取得 - File name by path string
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.fileName">uu.url.fileName</a>
 */
uu.url.fileName = function(path) {
  var rv = path.split("/");
  return rv[rv.length - 1];
};

/** uu.url.dir - パスからディレクトリを取得 - Directory by path string
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.dir">uu.url.dir</a>
 */
uu.url.dir = function(path) {
  var sl = path.lastIndexOf("/") + 1;
  return (!sl) ? "" : path.slice(0, sl);
};

/** uu.url.query - クエリストリングをパース - Parse QueryString
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.query">uu.url.query</a>
 */
uu.url.query = function(qstr) {
  var rv = {}, F = uuw.decodeURIComponent;
  function decode(match, key, value) { return rv[F(key)] = F(value); }
  qstr.replace(/^.*\?/, "").replace(/(?:([^\=]+)\=([^\&]+))/g, decode); // "?"の左側を切り落とし "key=value"で切り分ける
  return rv;
};

/** uu.url.query.add - クエリストリングを追加 - Add QueryString
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.url.query.add">uu.url.query.add</a>
 */
uu.url.query.add = function(url, key, value) {
  var rv = [], F = uuw.encodeURIComponent;
  function pair(value, key) { rv.push(F(key) + "=" + F(value)); }
  (uu.isS(key)) ? pair(value, key) : uu.forEach(key, pair);
  return url + (url.lastIndexOf("?") === -1 ? "?" : "&") + rv.join("&");
};

// uu extend
uu.mix.param(uu, { /** @scope uu */
  /** uu.sprintf
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.sprintf">uu.sprintf</a>
   */
  sprintf: function(format /*, ... */) {
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
  /** uu.trim - 両側から空白文字を除去 - Trim both(left and right)
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.trim">uu.trim</a>
   */
  trim: function(str) {
    return str.replace(/^[\s]*|[\s]*$/g, "");
  },
  /** uu.notax - 結合文字列, 文字列の配列, 文字列を受け取り、配列を返す - No taxing
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.notax">uu.notax</a>
   */
  notax: function(tax, param /* = { sep: ",", fn: undefined, trim: true } */) {
    if (param === void 0) { // quickie
      return (tax instanceof Array) ? tax :
             (tax.indexOf(",") === -1) ? [tax] : tax.split(",").map(uu.trim);
    }
    param = uu.mix.param(param || {}, { sep: ",", fn: uu.echo, trim: true });
    !uu.isS(tax) && uu.die("notax");
    if (tax.indexOf(param.sep) === -1) { return [param.fn(tax)]; }
    return tax.split(param.sep).map(function(v) {
      if (param.trim) { v = uu.trim(v); }
      return param.fn(v);
    });
  },
  /** uu.pair - Hash{ key, value }を生成 - Make Hash from key and value
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.pair">uu.pair</a>
   */
  pair: function(key, value) {
    var rv = {};
    rv[key] = value;
    return rv;
  },
  /** uu.toHash - 配列をHash化 - Make Hash from Array
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.toHash">uu.toHash</a>
   */
  toHash: function(ary) {
    var rv = {}, i = 0, sz = ary.length, v;
    for (; i < sz; ++i) {
      v = ary[i];
      (typeof v !== "function") && (rv[v] = v);
    }
    return rv;
  },
  /** uu.toArray - 擬似配列を配列化 - Make Array from FakeArray
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.toArray">uu.toArray</a>
   */
  toArray: function(fake, idx /* = 0 */) {
    idx = idx || 0;
    if (fake === null || !("length" in fake) || !fake.length || fake.length <= idx) { return []; }
    var rv = Array(fake.length - idx), i = idx, sz = rv.length;
    for (; i < sz; ++i) { rv[i] = fake[i]; }
    return rv;
  },
  /** uu.indexes - Hash/配列/擬似配列のindexを列挙し配列を返す - Enumerate the index of the Hash/Array/FakeArray and return an Array
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.indexes">uu.indexes</a>
   */
  indexes: function(mix) {
    var rv = [], i, sz;
    if (uu.isA(mix) || "length" in mix) { // Array / FakeArray
      for (i = 0, sz = mix.length; i < sz; ++i) { (i in mix) && rv.push(i); }
    } else {
      for (i in mix) { mix.hasOwnProperty(i) && rv.push(i); }
    }
    return rv;
  },
  /** uu.values - Hash/配列/擬似配列の値を列挙し配列を返す - Enumerate the value of the Hash/Array/FakeArray and return an Array
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.values">uu.values</a>
   */
  values: function(mix) {
    var rv = [], i, sz;
    if (uu.isA(mix) || "length" in mix) { // Array / FakeArray
      for (i = 0, sz = mix.length; i < sz; ++i) { (i in mix) && rv.push(mix[i]); }
    } else {
      for (i in mix) { mix.hasOwnProperty(i) && rv.push(mix[i]); }
    }
    return rv;
  },
  /** uu.size - Hash/配列/擬似配列の要素数を返す - Length of the Hash/Array/FakeArray
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.size">uu.size</a>
   */
  size: function(mix) {
    var rv = 0, i;
    if ("length" in mix) { return mix.length; }
    for (i in mix) { mix.hasOwnProperty(i) && ++rv; }
    return rv;
  },
  /** uu.first - Hash/配列/擬似配列の先頭の要素の値を取得 - First Element of the Hash/Array/FakeArray
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.first">uu.first</a>
   */
  first: function(mix, missHit /* = undefined */) {
    if ("length" in mix) { return (mix.length) ? mix[0] : missHit; } // Array/FakeArray
    for (var i in mix) { return mix[i]; }
    return missHit;
  },
  /** uu.diet - Hash/Arrayのコンパクト化 - Hash/Array memory compaction
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.diet">uu.diet</a>
   */
  diet: function(mix) {
    var rv, i, sz;
    if (uu.isA(mix)) {
      rv = [], i = 0, sz = mix.length;
      for (; i < sz; ++i) {
        (mix[i] !== null && mix[i] !== void 0) && rv.push(mix[i]);
      }
    } else {
      rv = {};
      for (i in mix) {
        (mix[i] !== null && mix[i] !== void 0 && mix.hasOwnProperty(i)) && (rv[i] = mix[i]);
      }
    }
    return rv;
  },
  /** uu.uniqueID - ユニークIDの生成 - Generate unique ID
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.uniqueID">uu.uniqueID</a>
   */
  uniqueID: function(prefix /* = "uu" */) {
    return (prefix || "uu") + ++uu.uniqueID._count;
  },
  /** uu.delay - 遅延評価 - Lazy evaluation
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.delay">uu.delay</a>
   */
  delay: function(fn, delay /* = 0ms */) {
    return uuw.setTimeout(fn, delay || 0);
  },
  isU:  function(mix) { return mix === void 0; },
  isA:  function(mix) { return mix instanceof Array; },
  isF:  function(mix) { return typeof mix === "function"; },
  isN:  function(mix) { return typeof mix === "number" && isFinite(mix); },
  isB:  function(mix) { return typeof mix === "boolean"; },
  isS:  function(mix) { return typeof mix === "string"; },
  no:   function()    { return false; },
  mute: function()    { },
  echo: function(arg) { return arg; },
  /** uu.inspect - オブジェクトを人間用に加工し出力する - Humanize output, Object Reflection
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.inspect">uu.inspect</a>
   */
  inspect: function(mix) {
    var rv = [], i;
    if (mix === null) { return "null"; }
    if (mix === void 0) { return "undefined"; }
    if (uu.isB(mix) || uu.isN(mix)) { return mix.toString(); }
    if (uu.isS(mix)) { return '"' + mix + '"'; }
    if (uu.isF(mix)) { i = mix.toString(); // {{
                       return i.replace(/function\s*([^\(]*)\([^}]*}/, "$1(){}"); } // ))
    if (uu.isA(mix)) { for (i = 0; i < mix.length; ++i) { rv.push(uu.inspect(mix[i])); }
                       return "[" + rv.join(", ") + "]"; }
    for (i in mix) { rv.push(i + ": " + uu.inspect(mix[i])); } // Object / FakeArray
    return "{" + rv.join(", ") + "}";
  },
  /** uu.log - ログ出力 - Logging
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.log">uu.log</a>
   */
  log: function(mix) {
    var e = uu.id(uu.log.id), i = 0, sz = arguments.length;
    for (; i < sz; ++i) {
      uu.log.stock.push(uu.inspect(arguments[i]));
    }
    if (!e && uu.window.already()) {
      e = uu.mix(uud.body.appendChild(uud.createElement("div")), { id: uu.log.id });
      uu.css.set(e, uu.log.style);
    }
    if (uu.log.stock.length && uu.window.already()) {
      e.innerHTML += uu.log.joint + uu.log.stock.join(", ");
      uu.log.stock.length = 0;
    }
  }
});
uu.uniqueID._count = 0;
uu.mix(uu.log, { id: "uuLog", joint: "<br />", style: { backgroundColor: "lime" }, stock: [] });

// Array extend
uu.mix.param(Array.prototype, { /** @scope Array.prototype */
  /** Array.forEach - 全要素をfnで評価する
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.forEach">Array.forEach</a>
   */
  forEach: function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      (i in this) && fn.call(me, this[i], i, this);
    }
  },
  /** Array.indexOf - 配列の先頭から値を検索し最初のindexを返す。無ければ-1を返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.indexOf">Array.indexOf</a>
   */
  indexOf: function(value, index /* = 0 */) {
    var sz = this.length; index = index || 0; index = (index < 0) ? index + sz : index;
    for (; index < sz; ++index) {
      if (index in this && this[index] === value) { return index; }
    }
    return -1;
  },
  /** Array.lastIndexOf - 配列の後方から値を検索し最初のindexを返す。無ければ-1を返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.lastIndexOf">Array.lastIndexOf</a>
   */
  lastIndexOf: function(value, index /* = this.length */) {
    var sz = this.length; index = (index < 0) ? index + sz : sz - 1;
    for (; index > -1; --index) {
      if (index in this && this[index] === value) { return index; }
    }
    return -1;
  },
  /** Array.filter - 全要素を評価し、結果が真の要素を配列で返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.filter">Array.filter</a>
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
  /** Array.every - 全要素を評価し、全て真ならtrue,偽があればループを中断しfalseを返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.every">Array.every</a>
   */
  every: function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      if (i in this && !fn.call(me, this[i], i, this)) { return false; }
    }
    return true;
  },
  /** Array.some - 全要素を評価し、全て偽ならfalse,真があればループを中断しtrueを返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.some">Array.some</a>
   */
  some: function(fn, me /* = undefined */) {
    for (var i = 0, sz = this.length; i < sz; ++i) {
      if (i in this && fn.call(me, this[i], i, this)) { return true; }
    }
    return false;
  },
  /** Array.map - 全要素を評価し配列を返す
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#Array.map">Array.map</a>
   */
  map: function(fn, me /* = undefined */) {
    var rv = new Array(this.length), i = 0, sz = this.length;
    for (; i < sz; ++i) {
      if (i in this) { rv[i] = fn.call(me, this[i], i, this); }
    }
    return rv;
  }
});

/** Math extend */
uu.mix.param(Math, {
  RADIAN: Math.PI / 180
});

// Gecko extend
if (uu.ua.gecko) {
  if (!HTMLElement.prototype.outerHTML) { // for Firefox
    // HTMLElement.outerHTML extend
    HTMLElement.prototype.__defineSetter__("outerHTML", function(html) {
      this._outerHTMLValue = html;
      var r = uud.createRange(), f;
      r.setStartBefore(this);
      f = r.createContextualFragment(html);
      this.parentNode.replaceChild(f, this);
    });
  }
  if (!HTMLElement.prototype.innerText) { // for Firefox
    // HTMLElement.innerText setter
    HTMLElement.prototype.__defineSetter__("innerText", function(text) {
      while(this.hasChildNodes()) {
        this.removeChild(this.lastChild);
      }
      this._innerTextValue = text;
      this.appendChild(uud.createTextNode(text));
    });
    // HTMLElement.innerText getter
    HTMLElement.prototype.__defineGetter__("innerText", function() {
//    return (this._innerTextValue !== void 0) ? this._innerTextValue : this.textContent;
      if ("_innerTextValue" in this) {
        return this._innerTextValue;
      }
      return this.textContent;
    });
  }
}

/** 仮想タイマーモジュール - Virtual Timer Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer">Virtual Timer</a>
 * @class
 */
uu.module.virtualTimer = uu.klass.generic();
uu.module.virtualTimer.prototype = {
  /** uu.module.virtualTimer.construct - 初期化
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer">uu.module.virtualTimer</a>
   */
  construct: function(baseClock /* = 10ms */) {
    uu.mix(this, { baseClock: baseClock || 10,
                   tick: 0,     // 内部時刻(現実の時間とはズレます)
                   btid: 0,     // base timer id (window.setInterval result)
                   lock: 0,     // 1: under memory-compaction execution
                   data: [] }); // [ vtid: [vtid, next, fn, count, dfn, delay, loop], ... ]
  },
  /** uu.module.virtualTimer.destruct - 後始末
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer">uu.module.virtualTimer</a>
   */
  destruct: function() {
    this.suspend(-1);
    this.data = null;
  },
  /** uu.module.virtualTimer.set - 仮想タイマーの登録
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer.set">uu.module.virtualTimer.set</a>
   */
  set: function(fn, delay /* = 10 */, loop /* = 0 */) {
    fn = uu.isF(fn) ? fn : uu.isS(fn) ? new Function(fn) : uu.mute; // fnが文字列なら関数化
    delay = delay || 10;
    var dfn = uu.isF(delay) ? delay : undefined, rv = this.data.length;
    this.resume(-1);
    this.data[rv] = { vtid: rv, next: this.tick + (dfn ? dfn(0) : delay), // nextをdfn()で計算し格納
                      fn: fn, count: 0, dfn: dfn, delay: delay, loop: loop || 0 };
    return rv;
  },
  /** uu.module.virtualTimer.setLoop - 登録済みの仮想タイマーのループ回数を再設定
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer.setLoop">uu.module.virtualTimer.setLoop</a>
   */
  setLoop: function(vtid, loop /* = 0 */) {
    var d;
    if (!(vtid in this.data) || loop < 0) { return; }
    d = this.data[vtid];
    d.loop = (!loop) ? 0 : d.loop + loop; // loop = 0で無限ループ, loop > 0でループ数追加
    d.next += (!d.next) ? 1 : 0;          // 停止中なら再始動
  },
  /** uu.module.virtualTimer.resume - タイマーの開始と再開
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer.resume">uu.module.virtualTimer.resume</a>
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
  /** uu.module.virtualTimer.suspend - タイマーの停止と一時停止
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer.suspend">uu.module.virtualTimer.suspend</a>
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
  /** uu.module.virtualTimer.diet - Memory Compaction
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.virtualTimer.diet">uu.module.virtualTimer.diet</a>
   */
  diet: function() {
    ++this.lock;
  },
  _impl: function() {
    var carry = this;
    return uuw.setInterval(function() {
      var me = carry, data = me.data, i = 0, sz = data.length, t = me.tick += me.baseClock, d;
      if (me.lock) { // Memory Compaction
        // 予定時刻(next > 0)があるものだけをme.dataに残す
        me.data = data.filter(function(v) { return !!v.next; });
        me.lock = 0; // unlock
      } else {
        for (; i < sz; ++i) {
          d = data[i]; // fetch
          // 予定時刻(d.next)が現在時刻(t)を過ぎていれば、
          // 次回の予定時刻(d.next)を計算しfn()をコール,ループ回数が設定されていればデクリメント、
          // loop回数がゼロになったら予定時刻を0にしてカウンタを停止。
          if (d.next && t >= d.next) {
            d.next = (d.loop && !(--d.loop)) ? 0 : t + (d.dfn ? d.dfn(++d.count) : d.delay);
            d.fn();
          }
        }
      }
    }, this.baseClock);
  }
};
// 汎用仮想タイマーのインスタンス
uu.tm10 = new uu.module.virtualTimer(10); // instantiate

/** Message Pump Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.messagePump">Message Pump</a>
 * @class
 */
uu.module.messagePump = uu.klass.singleton();
uu.module.messagePump.prototype = {
  /** uu.module.messagePump.construct - 初期化
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.messagePump">uu.module.messagePump</a>
   */
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
  /** uu.module.messagePump.set - メッセージの送信先を登録
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.messagePump.set"uu.module.messagePump.set</a>
   */
  set: function(tid, obj) {
    (tid === "broadcast") && uu.die("msgpump_set");
    this.reg[tid] = obj;
  },
  /** uu.module.messagePump.send - メッセージの同期送信
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.messagePump.set"uu.module.messagePump.set</a>
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
  /** uu.module.messagePump.post - メッセージの非同期送信
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.messagePump.post"uu.module.messagePump.post</a>
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
// メッセージポンプのインスタンス - uu.module.messagePump instance */
uu.msgpump = new uu.module.messagePump(); // instantiate

/** パフォーマンスモジュール - Performance Module
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf">performance</a>
 * @class
 */
uu.module.perf = uu.klass.generic();
uu.module.perf.prototype = {
  diff: [],
  /** uu.module.perf.construct - 初期化
   * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/MODULE.htm#uu.module.perf.construct">uu.module.perf.construct</a>
   */
  construct: function() {},
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

/** コンフィギュレーション - Configuration
 * @class
 */
uu.config = function() {
};
uu.mix(uu.config, {
  debug:      true,                   // uu.config.debug - デバッグモードのON/OFF(debug mode)
  png24:      true,                   // uu.config.png24 - 24bit αチャネルpng画像のサポート - Support 24bit alpha channel png image
  backCompat: false,                  // 後方互換を持たせる場合にtrueにします。
  imagePath:  uu.url.base() + "img/", // uu.config.imagePath - 画像検索パス - Image search path
  modulePath: "./,./mini/",           // uu.config.modulePath - モジュール検索パス - Module search path
  load:       ""                      // uu.config.load - 自動でロードするモジュールの指定
});
/** <b>uu.config.parseQuery - クエリ文字列に指定された設定項目を取り込む</b> */
uu.config._parseQuery = function() {
  var rv = {}, pos, e = uu.id("uupaa.js"); // idで検索するため、id指定は必須
  if (!e) { return; } // <script id="uupaa.js"> not found
  pos = e.src.indexOf("?");
  if (pos !== -1) {
    rv = uu.url.query(e.src.slice(pos + 1));
  }
  function toBool(val) { return (val === "false" || val === "0") ? false : true; }
  uu.mix(uu.config, {
    debug:      rv.debug      ? toBool(rv.debug)      : uu.config.debug,
    png24:      rv.png24      ? toBool(rv.png24)      : uu.config.png24,
    backCompat: rv.backCompat ? toBool(rv.backCompat) : uu.config.backCompat,
    imagePath:  rv.imagePath  ? rv.imagePath          : uu.config.imagePath,
    modulePath: rv.modulePath ? rv.modulePath         : uu.config.modulePath,
    load:       rv.load       ? rv.load               : uu.config.load
  });
};

/** Critical error handler
 */
uu.die = function(type, p1, p2) {
  if (type in uu.die._typeError) {
    throw TypeError(uu.sprintf(uu.die._typeError[type], p1, p2));
  } else if (type in uu.die._error) {
    throw Error(uu.sprintf(uu.die._error[type], p1, p2));
  }
  throw Error(uu.sprintf("unknown error"));
}
uu.die._error = { // throw Error(...)
  xpath:          'ERR-02: <script src="{{path}}/javascript-xpath.js"> not exist',
  canvas:         'ERR-02: <script id="excanvas.js" src="{{path}}/excanvas.js"> not exist',
  unknown:        "unknown error"
};
uu.die._typeError = { // throw TypeError(...)
  css3:           "uu.css(%1$s) -> %2$s",
  module:         "uu.module.load(%1$s) failed",
  event_set:      "uu.event.set()",
  event_unset:    "uu.event.unset()",
  ajax_load:      "uu.ajax.load(url)",
  ajax_loadIfMod: "uu.ajax.loadIfMod(url)",
  ajax_loadSync:  "uu.ajax.loadSync(url)",
  json_load:      "uu.json.load(url)",
  msgpump_set:    "uu.module.messagePump(tid)"
};

// init
uu.dom.ready(uu.mute);    // dummy handler
uu.window.ready(uu.mute); // dummy handler
uu.config._parseQuery();
uu.config.load.length && uu.module.load("", uu.config.load); // auto load

})(); // end (function())()
