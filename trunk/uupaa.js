/** uupaa.js - JavaScript Library for Casual Creator
 *
 * @author Takao Obara <com.gmail@js.uupaa>
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 * @see <a href="http://code.google.com/p/uupaa-js/">Home(Google Code)</a>
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/README.htm">README</a>
 */

// -----------------------------------
// Core
var UU = { VERSION: [0, 5] }, // [major, release]
    uu = function() { return uu._impl.apply(this, arguments); }; // adapter

// --- Mixin ---
// uu.mix - Object mixin - オブジェクトのミックスイン
uu.mix = function(base, flavor, aroma /* = undefined */) {
  for (var i in flavor) {
    base[i] = flavor[i];
  }
  return aroma ? uu.mix(base, aroma) : base;
};
// uu.mix.param - Object mixin for parameters - パラメタのミックスイン
uu.mix.param = function(base, flavor, aroma /* = undefined */) {
  for (var i in flavor) {
    (i in base) ? 0 : (base[i] = flavor[i]);
  }
  return aroma ? uu.mix.param(base, aroma) : base;
};

// -----------------------------------
(function() { // alias - 頻出するキーワードの別名を生成する、コード圧縮率を高める効果もある
var uud = document, uuw = window, uuhd = uud.getElementsByTagName("head")[0], // <head>
    uust = uuw.setTimeout, uupi = uuw.parseInt, uupf = uuw.parseFloat, uumr = Math.round,
    uuco = uuw.console, uuap = Array.prototype,
    uucs = uud.uniqueID ? function(e) { return e.currentStyle || e.style; } // for IE
                        : uud.defaultView.getComputedStyle; // for Firefox, Opera, Safari

uu.mix(UU, {
  FIRST:       0x101, // UU.FIRST:       first sibling(先頭の兄弟) - 最初
  PREV:        0x102, // UU.PREV:        prev sibling(前の兄弟) - 前
  NEXT:        0x103, // UU.NEXT:        next sibling(次の兄弟) - 次
  LAST:        0x104, // UU.LAST:        last sibling(末尾の兄弟) - 最後
  FIRST_CHILD: 0x105, // UU.FIRST_CHILD: first child(子の先頭) - サブディレクトリの最初
  LAST_CHILD:  0x106, // UU.LAST_CHILD:  last child(子の末尾) - サブディレクトリの最後
  // --- for MessagePump ---
  // custom event
  MSG_CHANGE_READY_STATE:   0x101,  // ReadyState change event, post(p1="W" or "D" or "C")
  MSG_ADD_CLASSNAME:        0x102,  // uu.klass.add,    post(p1=elm, p2=className)
  MSG_REMOVE_CLASSNAME:     0x103,  // uu.klass.remove, post(p1=elm, p2=className)
  // --- for Window ---
  MSG_RESIZE_WINDOW:        0x201   // resize window
});

// --- Detect ---
uu.mix(uu, {
  // uu.ua - Detect User-Agent and Functions - ブラウザと機能の判別
  ua:       function(info /* = "" */) {
              var me = uu.ua, n = (info || "_").toLowerCase();
              switch (n) {
              case "display:table":
                return !(me.ie && me.version < 8); // IE6, IE7はdisplay:table非対応
              case "version":
                if (!me.version) {
                  me.version = me.ie     ? uupf(me._.match(/MSIE ([\d]\.[\d][\w]?)/)[1])  // 5.5, 6, 7, 8(IE Major version)
                             : me.webkit ? uupf(me._.match(/WebKit\/(\d+(?:\.\d+)*)/)[1]) // 525.13(Webkit Build Number)
                             : me.gecko  ? uupf(me._.match(/Gecko\/(\d{8})/)[1])          // 20080404(Gecko Build Number)
                             : me.opera  ? opera.version() : 0; // 10048(Opera Build Number)
                }
                return me.version;
              }
              return (n in me) ? me[n] : false;
            }
});
uu.ua._        = navigator.userAgent;            // UserAgent cache
uu.ua.opera    = !!uuw.opera;                    // is Opera
uu.ua.ie       = !!uud.uniqueID;                 // is Internet Explorer
uu.ua.gecko    = uu.ua._.indexOf("Gecko/") >= 0; // is Gecko(Firefox, Camino)
uu.ua.webkit   = uu.ua._.indexOf("WebKit") >= 0; // is WebKit(Safari, Konqueror)
uu.ua.ipod     = uu.ua._.indexOf("iPod") >= 0 || uu.ua._.indexOf("iPhone") >= 0; // is iPod/iPhone(Safari)
uu.ua.wii      = !!(uuw.opera && uuw.opera.wiiremote);              // is Wii Internet channel
uu.ua.air      = uu.ua._.indexOf("AdobeAIR") >= 0;                  // is Adobe AIR
uu.ua.std      = uud.compatMode && uud.compatMode === "CSS1Compat"; // is Standard Mode, false is Quirks Mode
uu.ua.domrange = uud.implementation.hasFeature("Range", "2.0");     // is DOM Level2 Range Module
uu.ua.version  = uu.ua("version");
uu.ua.ie6      = uu.ua.ie && uu.ua.version === 6; // is Internet Explorer Version 6
uu.ua.ie8std   = uu.ua.ie && uu.ua.version === 8 && uu.ua.std; // is Internet Explorer Version 8 Standard Mode
uu.ua.firefox3 = uu.ua.gecko && uu.ua._.indexOf("Firefox/3") >= 0; // is Firefox Version 3
uu.ua.kestrel  = uu.ua.opera && uu.ua._.indexOf("Opera/9.5") >= 0; // is Opera Version 9.5

// --- Iteration ---
uu.mix(uu, {
  // uu.forEach - Executes a provided function once per hash element - 全要素を評価
  forEach:  function(mix, fn, me /* = undefined */) {
              if (mix.forEach) {         // Array -> Array.forEach()
                mix.forEach(fn, me);
              } else if (uu.isFA(mix)) { // FakeArray -> Array.prototype.forEach.call()
                uuap.forEach.call(mix, fn, me);
              } else {
                for (var i in mix) {            // Hash, Object
                  mix.hasOwnProperty(i) && fn.call(me, mix[i], i, mix);
                }
              }
            },
  // uu.filter - Creates a new array with all elements that pass the test implemented by the provided function
  //           - 全要素を評価し、結果が真の要素を配列で返す
  filter:   function(mix, fn, me /* = undefined */) {
              if (mix.filter)   { return mix.filter(fn, me); }            // Array
              if (uu.isFA(mix)) { return uuap.filter.call(mix, fn, me); } // FakeArray
              var rv = [], i, v;
              for (i in mix) {
                if (mix.hasOwnProperty(i)) {
                  v = mix[i];
                  fn.call(me, v, i, mix) && rv.push(v);
                }
              }
              return rv;
            }
});
// --- Iteration::CrossBrowser ---
uu.mix.param(uuap, { // uuap is Array.prototype alias
  // Array.prototype.forEach - Executes a provided function once per array element
  //                         - 全要素をfnで評価する
  forEach:  function(fn, me /* = undefined */) {
              for (var i = 0, sz = this.length; i < sz; ++i) {
                (i in this) && fn.call(me, this[i], i, this);
              }
            },
  // Array.prototype.filter - Creates a new array with all elements that pass the test implemented by the provided function
  //                        - 全要素を評価し、結果が真の要素を配列で返す
  filter:   function(fn, me /* = undefined */) {
              var rv = [], i = 0, sz = this.length, v;
              for (; i < sz; ++i) {
                if (i in this) {
                  v = this[i];
                  (fn.call(me, v, i, this)) && rv.push(v);
                }
              }
              return rv;
            },
  // Array.prototype.every - Tests whether all elements in the array pass the test implemented by the provided function
  //                       - 全要素を評価し、全て真ならtrue,偽があればループを中断しfalseを返す
  every:    function(fn, me /* = undefined */) {
              for (var i = 0, sz = this.length; i < sz; ++i) {
                if (i in this && !fn.call(me, this[i], i, this)) { return false; }
              }
              return true;
            },
  // Array.prototype.some - Tests whether some element in the array passes the test implemented by the provided function
  //                      - 全要素を評価し、全て偽ならfalse,真があればループを中断しtrueを返す
  some:     function(fn, me /* = undefined */) {
              for (var i = 0, sz = this.length; i < sz; ++i) {
                if (i in this && fn.call(me, this[i], i, this)) { return true; }
              }
              return false;
            },
  // Array.prototype.map - Creates a new array with the results of calling a provided function on every element in this array
  //                     - 全要素を評価し配列を返す
  map:      function(fn, me /* = undefined */) {
              var rv = new Array(this.length), i = 0, sz = this.length;
              for (; i < sz; ++i) {
                (i in this) && (rv[i] = fn.call(me, this[i], i, this));
              }
              return rv;
            }
});

// --- Selector ---
uu.mix(uu, {
  // uu.id - ID Selector - IDセレクタ
  id:       function(id) {
              if (!uu.config.cacheID) { return uud.getElementById(id); }
              return (uu._cacheID[id] || (uu._cacheID[id] = uud.getElementById(id)));
            },
  // uu.tag - Tag/Element Selector - タグ(要素)セレクタ
  tag:      function(tagName, context /* = document */) {
              return uu.toArray((context || uud).getElementsByTagName(tagName));
            },
  // uu.klass - Class Selector - クラスセレクタ
  klass:    function(className, context /* = document */) {
              // for Firefox3, Safari3, Opera9.5
              return uu.toArray((context || uud).getElementsByClassName(className));
            },
  // uu.attr - Attribute Selector - 属性セレクタ
  // expr: E[@A] E[@A~="V"] E[@A="V"] E[@A^="V"] E[@A$="V"] E[@A*="V"] E[@A="V"]
  attr:     function(expr, context /* = document */) {
              var m = expr.match(/^([\w\-\*]+)\[@(\w+)(?:(\~=|\^=|\$=|\*=|=)(["'])([^"']*)\4)?\]$/);
              return !m ? [] : m[3] ? uu._attr(context || uud, m[1], m[2], m[3], m[5]) // 1:E, 2:A, 3:=, 5:V
                                    : uu._attr(context || uud, m[1], m[2], "@",  "");
            },
  // uu.xpath - XPath Selector - XPathセレクタ
  xpath:    function(expr, context /* = document */) {
              var rv = [], i, r = uud.evaluate(expr, context || uud, null, 0, null); // 0 is ANY_TYPE
              switch (r.resultType) {
              case 1: rv = r.numberValue; break;  // 1 is NUMBER_TYPE
              case 2: rv = r.stringValue; break;  // 2 is STRING_TYPE
              case 3: rv = r.booleanValue; break; // 3 is BOOLEAN_TYPE
              case 4: i = r.iterateNext();        // 4 is UNORDERED_NODE_ITERATOR_TYPE
                      while (i) { rv.push(i); i = r.iterateNext(); }
                      break;
              }
              return rv;
            },
  // uu.xsnap - XPath Selector on snapshot - XPathスナップショット
  xsnap:    function(expr, context /* = document */, attr /* = "" */, sort /* = true */) {
              var n = uud.evaluate(expr, context || uud, null, sort ? 7 : 6, null), // 7 is SORT
                  a = attr || "", i = 0, sz = n.snapshotLength, rv = Array(sz), e;
              for (; i < sz; ++i) {
                e = n.snapshotItem(i);
                rv[i] = !a ? e : (a in e) ? e[a] : (e.getAttribute(a) || "");
              }
              return rv;
            },
  // uu.css - CSS Selector - CSSセレクタ
  css:      function(expr, context /* = document */) {
              var xpath, node, rv, i = 0, sz;
              try {
                if (expr in uu._cacheXPath) {
                  xpath = uu._cacheXPath[expr];
                } else {
                  xpath = uu.toXPath(expr);    // compile
                  uu._cacheXPath[expr] = xpath; // cache
                }
                if (xpath) {
                  node = uud.evaluate(xpath, context || uud, null, 7, null); // 7 is SORT
                  if (node && node.snapshotLength) {
                    for (sz = node.snapshotLength, rv = Array(sz); i < sz; ++i) {
                      rv[i] = node.snapshotItem(i);
                    }
                    return rv;
                  }
                }
              } catch(e) { (uu.config.debug & 0x1) && uu.die("uu.css(expr=%s) -> XPath[%s]", expr, xpath); }
              return [];
            },
  // uu.pseudo - Pseudo Selector - 擬似セレクタ
  pseudo:   function(expr, context /* = document */, tag /* = undefined */) {
              var rv = [], sl = expr.substring(1), F = {
                enabled:  function(e) { !e.disabled && rv.push(e); },
                disabled: function(e) {  e.disabled && rv.push(e); },
                checked:  function(e) {  e.checked  && (e.type === "checkbox" ||
                                                        e.type === "radio") && rv.push(e); },
                selected: function(e) {  e.selected && rv.push(e); },
                visible:  function(e) { (e.type !== "hidden" && !H(e)) && rv.push(e); },
                hidden:   function(e) { (e.type === "hidden" ||  H(e)) && rv.push(e); },
                animated: function(e) { ("uuEffectRunning" in e) && e.uuEffectRunning && rv.push(e); }
              },
              T = { checked: "input", selected: "option" },
              H = function(e) { return uu.css.get(e, "display") === "none" ||
                                       uu.css.get(e, "visibility") === "hidden"; };
              (sl in F) && uu.forEach(uu.tag(tag || T[sl] || "*", context || uud), F[sl]);
              return rv;
            },
  // uu.nodeType - NodeType Selector - ノードタイプセレクタ
  nodeType: function(nodeType, context /* = document */, depth /* = 0 */) {
              var rv = [];
              function F(e, _rv) { (e.nodeType === nodeType) && _rv.push(e); }
              return uu.node._recursive(context || uud, F, rv, 0, depth || 0);
            },
  // uu.textNode - Text node Selector - TextNodeセレクタ
  textNode: function(context /* = document */, deep /* = false */) {
              uu.nodeType(3, context, deep);
            },
  // uu.toXPath - Convert CSS3 selector into XPath - CSS3セレクタをXPathに変換
  toXPath:  function(expr) {
              return expr.split(",").map(uu._toXPath).join(" | "); // split Selectors group and join("|")
            },
  _cacheID: { /* id: element, ... */ },
  _cacheXPath:
            { /* css3-expr: compiled-xpath, ... */ },
  _attr:    function(ctx, E, A, OP, V) {
              var rv = [], sz = V.length, w,
                  F = {
                    "@":  function(e) { (A in e || H(e)) && rv.push(e); },
                    "=":  function(e) { ((A in e && e[A] === V) || G(e) === V) && rv.push(e); },
                    "*=": function(e) { ((A in e && e[A].indexOf(V) !== -1) || G(e).indexOf(V) !== -1) && rv.push(e); },
                    "^=": function(e) { ((A in e && e[A].indexOf(V) ===  0) || G(e).indexOf(V) ===  0) && rv.push(e); },
                    "$=": function(e) { if (A in e && e[A].lastIndexOf(V) + sz === e[A].length) { rv.push(e); return; }
                                        w = G(e); (w && w.lastIndexOf(V) + sz === w.length) && rv.push(e); },
                    "~=": function(e) { ((A in e && (" " + e[A] + " ").indexOf(V) !== -1) ||
                                        (" " + G(e) + " ").indexOf(V) !== -1) && rv.push(e); }
                  },
                  G = uu.ua.ie ? function(e) { return "";   } : function(e) { return e.getAttribute(A) || ""; },
                  H = uu.ua.ie ? function(e) { return null; } : function(e) { return e.hasAttribute(A);       };
              if (A === "class") { A = "className"; }
              if (OP === "~=") { V = " " + V + " "; }
              uu.forEach(uu.tag(E, ctx), F[OP]);
              return rv;
            },
  _toXPath: function(sel) {
              var ELM    = /^([\.\#]?)([a-z0-9\_\*\-]*)/i,     // E
                  ATTR1  = /^\[\s*([^\~\^\$\*\|\=\s]+)\s*([\~\^\$\*\|]?=)\s*(["'])([^"']*)\3\s*\]/, // E[A=V]
                  ATTR2  = /^\[\s*([^\]]*)\s*\]/,              // E[A]
                  COMBO1 = /^(?:\s*([\>\+\~\s]))/,             // E F, E > F, E + F, E ~ F
                  COMBO2 = /^\s*([a-z0-9\_\*\-]+)/i,           // E + F の F用
                  PSEUDO = /^\:([\w-]+)(?:\((.*)\))?/i,        // :nth-child(n)
                  AOPE = { // attr operator
                    "=" : '[@%1$s="%2$s"]',                                                         // attr=value
                    "~=": '[contains(concat(" ",@%1$s," ")," %2$s ")]',                             // attr~=value
                    "^=": '[starts-with(@%1$s,"%2$s")]',                                            // attr^=value
                    "$=": '[substring(@%1$s,string-length(@%1$s)-string-length("%2$s")+1)="%2$s"]', // attr$=value
                    "*=": '[contains(@%1$s,"%2$s")]',                                               // attr*=value
                    "|=": '[@%1$s="%2$s" or starts-with(@%1$s,"%2$s-")]'                            // attr|=value
                  },
                  NTH = {
                    xn_y: /([\d]+)n\+([\d]+)/,                // :nth-child(xn+y)
                    xn:   /([\d]+)n/                          // :nth-child(xn)
                  },
                  rv = [".//", "*"], index = 1, last = null, m, m2;

              function reset(E) { rv.length = 0, rv.push(E), index = 0; }
              function nth(str) {
                return (!isNaN(str)) ? /*(*/ (")=" + uupi(str) + "-1") :
                       (str === "even" || str === "2n")   ? /*(*/ ")mod 2=1" :
                       (str === "odd"  || str === "2n+1") ? /*(*/ ")mod 2=0" :
                       (NTH.xn_y.test(str)) ? str.replace(NTH.xn_y, /*(*/ "+ $2)mod $1=1") : // 4n + 1
                       (NTH.xn.test(str))   ? str.replace(NTH.xn,   /*(*/ ")mod $1=1") : /*(*/ ")"; // 3n
              }

              while (sel.length && sel != last) {
                last = sel = uu.trim(sel);
                if (!sel.length) { break; }

                // Element phase: E.className, E#id
                m = sel.match(ELM);
                if (m) {
                  switch (m[1]) {
                  case ".": rv.push('[contains(concat(" ",@class," ")," ' + m[2] + ' ")]'); break;
                  case "#": rv.push('[@id="' + m[2] + '"]'); break;
                  default:  rv[index] = m[2];
                  }
                  sel = sel.substring(m[0].length);
                }
                // Attr phase: E[A], E[A=V], E[A~=V], E[A$=V], E[A*=V], E[A|=V]
                m = sel.match(ATTR1);
                if (m) {
                  (m[2] in AOPE) && rv.push(uu.sprintf(AOPE[m[2]], m[1], m[4]));
                  sel = sel.substring(m[0].length);
                } else {
                  m = sel.match(ATTR2);
                  if (m) {
                    rv.push("[@" + m[1] + "]");
                    sel = sel.substring(m[0].length);
                  }
                }
                // Attr phase: E:not(selector) - sorry. not impl.

                // Pseudo-classes and Pseudo-elements phase:
                m = sel.match(PSEUDO);
                while (m) {
                  switch (m[1]) {
                  case "root":        rv.push("*[not(parent::*)]"); break;
                  case "first-child": rv.push("[not(preceding-sibling::*)]"); break;
                  case "last-child":  rv.push("[not(following-sibling::*)]"); break;
                  case "only-child":  rv.push("[count(parent::*/child::*)=1]"); break;
                  case "nth-child":   rv.push(uu.sprintf("[(count(preceding-sibling::*)%1$s]", nth(m[2]))); break; // )
                  case "nth-last-child":  rv.push(uu.sprintf("[(count(following-sibling::*)%1$s]", nth(m[2]))); break; // )
                  case "nth-of-type":     rv.push(uu.sprintf("[(count(preceding-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
                  case "nth-last-of-type":rv.push(uu.sprintf("[(count(following-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
                  case "first-of-type":   rv.push(uu.sprintf("[(not(preceding-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
                  case "last-of-type":    rv.push(uu.sprintf("[(not(following-sibling::%2$s)%1$s]", nth(m[2]), rv[index])); break; // )
                  case "only-of-type":    rv.push(uu.sprintf("[count(parent::*/child::%s)=1]",rv[index])); break;
                  // --- jQuery
                  case "first":     rv.push("[1]"); break;
                  case "last":      rv.push("[last()]"); break;
                  case "even":      rv.push("[(count(preceding-sibling::*))mod 2=0]"); break;
                  case "odd":       rv.push("[(count(preceding-sibling::*))mod 2=1]"); break;
                  case "eq":        reset(uu.sprintf("/descendant::%s[%d]", rv[index], uupi(m[2]) + 1)); break;
                  case "gt":        reset(uu.sprintf("/descendant::%s[position() > %d]", rv[index], uupi(m[2]) + 1)); break;
                  case "lt":        reset(uu.sprintf("/descendant::%s[position() < %d]", rv[index], uupi(m[2]) + 1)); break;
                  case "header":    reset(uu.sprintf("//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]")); break;
                  case "contains":  rv.push(uu.sprintf("[contains(string(), %s)]", m[2])); break;
                  case "empty":     rv.push("[not(*) and not(text())]"); break;
                  case "parent":    rv.push("[text()]"); break;
                  case "input":     rv.push("*[self::input or self::textarea or self::select or self::button]"); break;
                  case "text":      rv.push('input[@type="text"]'); break;
                  case "password":  rv.push('input[@type="password"]'); break;
                  case "radio":     rv.push('input[@type="radio"]'); break;
                  case "checkbox":  rv.push('input[@type="checkbox"]'); break;
                  case "submit":    rv.push('input[@type="submit"]'); break;
                  case "image":     rv.push('input[@type="image"]'); break;
                  case "reset":     rv.push('input[@type="reset"]'); break;
                  case "button":    rv.push('*[self::input[@type="button"] or self::button]'); break;
                  case "file":      rv.push('input[@type="file"]'); break;
                  }
                  sel = sel.substring(m[0].length);
                  m = sel.match(PSEUDO);
                }
                // Combinator phase: E F, E > F, E + F, E ~ F
                m = sel.match(COMBO1);
                if (m) {
                  if (m[1] === "+") { // E + F のケースでは、Fを先読みする必要がある
                    sel = sel.substring(m[0].length);
                    m2 = sel.match(COMBO2);
                    if (m2) {
                      rv.push('/following-sibling::*[1][self::' + m2[1] +']'); // とりあえず
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
});
// --- Selector::CrossBrowser ---
!uud.getElementsByClassName && uu.mix(uu, { // for Firefox2, IE6/7/8, Opera9.2x
  klass:    function(className, context /* = document */) {
              var rv = [], ary, e = uu.tag("*", context || uud), cn = uu.trim(className);

              function F(cn, ary) { // cn = " " + v.className + " ", ary = [ "aaa", "bbb" ]
                var i = 0, sz = ary.length, rv = 0;
                for (; i < sz; ++i) {
                  (cn.indexOf(" " + ary[i] + " ") !== -1) && ++rv;
                }
                return rv === sz; // true: match all
              }

              if (cn.indexOf(" ") === -1) { // className = "aaa"
                cn = " " + cn + " ";
                e.forEach(function(v) {
                  ((" " + v.className + " ").indexOf(cn) !== -1) && rv.push(v);
                });
              } else { // className = "aaa bbb ccc"
                ary = cn.split(" ");
                e.forEach(function(v) {
                  F(" " + v.className + " ", ary) && rv.push(v);
                });
              }
              return rv;
            }
});

// --- Node ---
uu.mix(uu.node = function() {}, {
  // uu.node.insert - Insert ELEMENET_NODE or "<HTMLString>" - ELEMENT_NODEまたはHTML文字列をノード化し挿入
  insert:   function(html, context /* = document.body */, pos /* = UU.LAST_CHILD */) {
              if (uu.ua.ie && uu.isS(html)) {
                uu.node._insIE(html, context || uud.body, pos || UU.LAST_CHILD);
                return;
              }
              html = uu.isS(html) ? uu.node.substance(html) : html; // node化
              uu.node._ins(html, context || uud.body, pos || UU.LAST_CHILD);
            },
  // uu.node.insertText - Insert TEXT_NODE or "TextString" - TEXT_NODE または テキスト文字列をノード化し挿入
  insertText:
            function(text, context /* = document.body */, pos /* = UU.LAST_CHILD */) {
              uu.node.insert(uu.isS(text) ? uud.createTextNode(text) : text,
                             context || uud.body, pos || UU.LAST_CHILD);
            },
  // uu.node.replace - Replace oldNode with node - nodeとoldNodeを入れ替える
  replace:  function(node, oldNode, context /* = document.body */) {
              return (context || uud.body).replaceChild(node, oldNode); // return oldNode
            },
  // uu.node.remove - Remove node - nodeを取り除く
  remove:   function(node, context /* = node.parentNode */) {
              var ctx = context || node.parentNode;
              if ("nodeType" in ctx) {
                if (ctx.nodeType === 1 || ctx.nodeType === 9) {
                  return (context || node.parentNode).removeChild(node); // return node
                }
              }
              return null;
            },
  // uu.node.diet - Removes CRLF/WhiteSpace/Comment node - 空白と改行だけのテキストノードとコメントノードを再帰的に除去する
  diet:     function(elm, depth /* = 0 */) {
              function F(e, _rv) {
                switch (e.nodeType) {
                case 3: if (/\S/.test(e.nodeValue)) { break; } // blank text node?
                case 8: _rv.push(e); // comment node
                }
              }
              var rv = [], i, sz;

              uu.node._recursive(elm, F, rv, 0, depth || 0);
              for (i = 0, sz = rv.length; i < sz; ++i) {
                rv[i].parentNode.removeChild(rv[i]);
              }
            },
  // uu.node.cutdown - Cut all nodes less than context and return DocumentFragment
  //                 - context以下の全ノードを切り取り、DocumentFragmentを返す
  cutdown:  function(context /* = document.body */) {
              var rv, ctx = context || uud.body;
              if (uu.ua.domrange) {
                (rv = uud.createRange()).selectNodeContents(ctx); // 高速
                return rv.extractContents();
              }
              rv = uud.createDocumentFragment(); // 低速
              while (ctx.firstChild) {
                rv.appendChild(ctx.removeChild(ctx.firstChild));
              }
              return rv;
            },
  // uu.node.substance - Convert HTMLString into DocumentFragment - HTMLStringをDocumentFragmentに変換する
  substance:
            function(html) {
              if (uu.ua.domrange) { // Safari3はcreateContextualFragmentメソッドはあるがオンザフライでノードが作れない
                if (uu.ua.firefox3) {
                  return uud.createRange().createContextualFragment(html);
                }
              }
              // createContextualFragment が使えない環境(Safar3, Firefox2, IE等)では、
              // <div></div>をプレースホルダとしてノードを生成し、中身だけを切り抜いて返す
              var e = uud.body.appendChild(uud.createElement("div")); // placeholder
              e.innerHTML = html;
              return uu.node.cutdown(e);
            },
  _recursive:
            function(elm, fn, rv, depth, max) { // 再帰的にELEMENT_NODEを辿る
              var e, i = 0, sz = elm.childNodes.length;
              for (; i < sz; ++i) {
                fn(e = elm.childNodes[i], rv);
                (e.nodeType === 1 && depth + 1 <= max) &&
                  uu.node._recursive(e, fn, rv, depth + 1, max);
              }
              return rv;
            },
  _insIE:   function(node, ctx, pos) { // insert for IE
              ctx = (pos === UU.FIRST || pos === UU.LAST) ? ctx.parentNode : ctx;
              var F = ctx.insertAdjacentHTML;
              switch (pos) {
              case UU.FIRST:
              case UU.FIRST_CHILD:  F("AfterBegin",  node); break;
              case UU.LAST:
              case UU.LAST_CHILD:   F("BeforeEnd",   node); break;
              case UU.PREV:         F("BeforeBegin", node); break;
              case UU.NEXT:         F("AfterEnd",    node); break;
              }
            },
  _ins:     function(node, ctx, pos) { // insert for Firefox, Opera, Safari
              function FIRST(ctx)   { ctx.firstChild ? ctx.insertBefore(node, ctx.firstChild)
                                                     : ctx.appendChild(node); }
              function PREV(p, ctx) { p.insertBefore(node, ctx); }
              function NEXT(p, ctx) { (p.lastChild === ctx) ? p.appendChild(node)
                                                            : p.insertBefore(node, ctx.nextSibling); }
              function LAST(ctx)    { ctx.appendChild(node); }
              switch (pos) {
              case UU.FIRST:        FIRST(ctx.parentNode); break;
              case UU.PREV:         PREV(ctx.parentNode, ctx); break;
              case UU.NEXT:         NEXT(ctx.parentNode, ctx); break;
              case UU.LAST:         LAST(ctx.parentNode); break;
              case UU.FIRST_CHILD:  FIRST(ctx); break;
              case UU.LAST_CHILD:   LAST(ctx); break;
              }
            }
});

// --- The OOP "Class" ---
uu.mix(uu.klass, {
  // uu.klass.kiss - Create a simple class - シンプルなクラスの雛形を生成
  kiss:     function(/* args, ... */) {
              // このスコープでthisを参照するとthis=windowになる
              return function() {
                // このスコープでthisを参照するとthisは新しく生成されるインスタンスを示す
                this.construct && this.construct.apply(this, arguments);
              };
            },
  // uu.klass.generic - Create a generic class - 汎用クラスの雛形を生成
  generic:  function(/* args, ... */) {
              return function() {
                this.uid = uu.uid("generic"); // add "uid" property - uidを追加
                this.msgbox && uu.msg.set(this); // regist "msgbox" if found - メッセージボックスを自動登録
                this.handleEvent && (this._eventClosure = uu.event.closure(this)); // イベントクロージャを自動登録
                this.construct && this.construct.apply(this, arguments);
              };
            },
  // uu.klass.singleton - Create a singleton class - シングルトンクラスの雛形を生成
  singleton:
            function(/* args, ... */) {
              return function() {
                var me = this, a = arguments, fn = a.callee;
                if (!fn.instance) {
                  fn.instance = me; // keep instance
                  me.uid = uu.uid("singleton"); // add "uid" property - uidを追加
                  me.msgbox && uu.msg.set(me); // regist "msgbox" if found - メッセージボックスを自動登録
                  me.handleEvent && (me._eventClosure = uu.event.closure(me)); // イベントクロージャを自動登録
                  me.construct && me.construct.apply(me, a);
                  me.destruct && uu.ready(function() { me.destruct(); }, "U");
                } else {
                  me.stabled && me.stabled.apply(me, a); // after the second
                }
                return fn.instance; // fn.instance を返すことで、thisは廃棄される。
              };
            }
});

// --- The CSS "Class" ---
uu.mix(uu.klass, {
  // uu.klass.has - Has className - classNameの存在確認
  has:      function(elm, className) {
              return (" " + elm.className + " ").indexOf(" " + className + " ") !== -1;
            },
  // uu.klass.add - Add className property - classNameプロパティにクラス名を追加
  add:      function(elm, className) {
              var cn = className, uid;
              if ((cn.indexOf("js") === 0) && (cn in uu.klass._chain)) {
                uid = uu.klass._chain[cn];
                cn = cn.substring(2);
              }
              elm.className += (elm.className ? " " : "") + cn;
              uid && uu.msg.post(uid, UU.MSG_ADD_CLASSNAME, elm, cn);
            },
  // uu.klass.remove - Remove className property - classNameプロパティからクラス名を削除
  remove:   function(elm, className) {
              var cn = className;
              if ((" " + elm.className + " ").indexOf(" " + cn + " ") !== -1) { // elm.className has className
                elm.className = (" " + elm.className + " ").replace(" " + cn + " ", " "); // erase
                (cn in uu.klass._unchain) &&
                    uu.msg.post(uu.klass._unchain[cn], UU.MSG_REMOVE_CLASSNAME, elm, cn);
              }
            },
  // uu.klass.toggle - Add className property or remove - classNameプロパティにクラス名を追加または削除する
  toggle:   function(elm, className) {
              var cn = className;
              uu.klass.has(elm, cn) ? uu.klass.remove(elm, cn) : uu.klass.add(elm, cn);
            },
  setWidgetChainedClassName:
            function(uid, className) {
              uu.klass._chain["js" + className] = uid;
              uu.klass._unchain[className] = uid;
            },
  unsetWidgetChainedClassName:
            function(uid, className) {
              delete uu.klass._chain["js" + className];
              delete uu.klass._unchain[className];
            },
  // uu.klass.evalWidgetChainedClassName - Evaluate className - classNameを評価する
  evalWidgetChainedClassName:
            function(elm, className) {
              var cn = className, uid = (cn in uu.klass._chain) ? uu.klass._chain[cn] : 0;
              uid && uu.msg.post(uid, UU.MSG_ADD_CLASSNAME, elm, cn);
            },
  _chain:   { /* "jsclassName": uid, ... */ },
  _unchain: { /* "className": uid, ... */ }
});

// --- Attribute ---
uu.mix(uu.attr, {
  // uu.attr.get - Get attribute - 属性を取得
  get:      function(elm, attr /* Taxing( "attr" or "attr,attr" or ["attr", ...] ) */) {
              var rv = {}, ary = uu.notax(attr);
              ary.forEach(function(v) {
                rv[v] = (v in elm) ? elm[v] : (elm.getAttribute(v) || "");
              });
              return (ary.length === 1) ? uu.first(rv, "") : rv; // 要素数1で文字列化
            },
  // uu.attr.set - Set attribute - 属性を設定
  set:      function(elm, hash /* Hash( { attr: value, ... } ) */) {
              uu.forEach(hash, function(v, i) { elm[i] = v; });
            }
});

// --- CSS ---
uu.mix(uu.css, {
  // uu.css.get - document.defaultView.getComputedStyle wrapper - 計算済みのスタイルを取得
  get:      function(elm, cssProp /* = undefined */) { // cssProp = "prop", ["prop, "prop"], "prop,prop"
              var rv = {}, cs = uucs(elm, ""), F = uu.css._camelize;
              function CAMEL(v) { v = F(v); rv[v] = (v in cs) ? cs[v] : ""; }
              function QUICK(v) {           rv[v] = (v in cs) ? cs[v] : ""; }
              if (!cssProp) { return cs; } // currentStyle または CSS2Propertiesを返す

              cssProp = uu.notax(cssProp);
              cssProp.forEach(uu.config.backCompat ? CAMEL : QUICK);
              return (cssProp.length === 1) ? uu.first(rv, "") : rv; // 指定された要素数が1なら文字列を返す
            },
  // uu.css.rect - Get RectHash( { x: left, y: top, w: width, h: height } ) (value of px unit)
  rect:     function(elm) {
              var cs = uucs(elm, ""), s = cs.position === "static", w = uupf(cs.width), h = uupf(cs.height);
              return s ? { x: 0, y: 0, w: w, h: h } :
                         { x: uupf(cs.left), y: uupf(cs.top), w: w, h: h };
            },
  // uu.css.opacity - Get opacity value(from 0.0 to 1.0) - 不透明度を数値(0.0～1.0)で取得
  opacity:  function(elm) {
              return uupf(uucs(elm, "").opacity);
            },
  // uu.css.backgroundImage - Get background-image URL - 背景画像のURLを取得
  // undocumented
  // 取得できない場合は none を返す
  // url( ) をトリムした文字列を返す
  backgroundImage:
            function(elm) {
              var url = uucs(elm, "").backgroundImage, m;
              if (!url) { return "none"; }
              m = url.match(/^url\((.*)\)$/);
              return !m ? "none" : m[1].replace(/["']/g, ""); // trim quote
            },
  // uu.css.set - Set style - スタイルを設定
  set:      function(elm, hash) { // hash = { cssProp: value, ... }
              if (!elm) { (uu.config.debug & 0x1) && uu.die("uu.css.set(elm=%s)", elm); return; }
              var F = uu.css._camelize, opa = "opacity";
              function CAMEL(v, i) { (i !== opa) && (elm.style[F(i)] = v); }
              function QUICK(v, i) { (i !== opa) && (elm.style[i]    = v); }
              if (opa in hash) { uu.css.setOpacity(elm, hash.opacity); }
              uu.forEach(hash, uu.config.backCompat ? CAMEL : QUICK);
            },
  // uu.css.setRect - Set RectHash( { x: left, y: top, w: width, h: height } )
  // x,y,w,hは省略可能
  // autoVisible = true なら、width or height zero で visibility: hiddenにし、1以上でvisible化
  setRect:  function(elm, rect, autoVisible /* = false */) {
              var s = elm.style, r = rect, resize = 0, I = uupi;
              if ("x" in r) { s.left = I(r.x) + "px"; }
              if ("y" in r) { s.top  = I(r.y) + "px"; }
              if ("w" in r) { s.width  = (r.w > 0 ? I(r.w) : 0) + "px"; ++resize; }
              if ("h" in r) { s.height = (r.h > 0 ? I(r.h) : 0) + "px"; ++resize; }
              autoVisible && resize && uu.css._autoVisible(elm);
            },
  // uu.css.setOpacity - Set opacity value(from 0.0 to 1.0) - 不透明度を設定(0.0～1.0)
  setOpacity:
            function(elm, opa) {
              opa = uupf(opa);
              opa = (opa > 1) ? 1 : (opa < 0.001) ? 0 : opa;
              elm.style.opacity = opa;
            },
  // uu.css.setBackgroundImage - Set background-image URL - 背景画像のURLを設定
  setBackgroundImage:
            function(elm, url) {
              elm.style.backgroundImage = (url.indexOf("url(") === -1) ? "url(" + url + ")" : url;
            }, // )
  // uu.css.show - Show element
  show:     function(elm, resultRect /* = false */) {
              var tag = elm.tagName.toLowerCase();
              elm.style.visibility = "visible";
              // 安易に elm.style.display = "" としてしまうと、<style>やstyle=""のdisplayの値が適用されてしまう
              // 一手間かかるが、tagがブロックタグかどうかを確認し、タグの種類に合ったdisplay値を設定してあげる
              elm.style.display = (uu.css._display_buggy.indexOf(tag + ",") !== -1) ? "" :
                                  (uu.css._display_block.indexOf(tag + ",") !== -1) ? "block" :
                                  (tag in uu.css._display_table) ? uu.css._display_table[tag] : "inline";
              return resultRect ? uu.css.rect(elm) : 0;
            },
  // uu.css.hide - Hide element
  hide:     function(elm, resultRect /* = false */) {
              elm.style.display = "none";
              return resultRect ? uu.css.rect(elm) : 0;
            },
  // uu.css.rebound - Move element in inside of screen after having made it visible in outside of screen
  //                - 画面外で可視化し画面内に戻す
  rebound:  function(elm, inboundRect) {
              uu.css.setRect(elm, { x: -3333, y: -3333 });
              uu.css.show(elm);
              uu.css.setRect(elm, inboundRect);
            },
  // uu.css.isBlock - is block element - ブロック要素ならtrue
  isBlock:  function(elm) { // table要素はfalse
              return (uu.css._display_block.indexOf(elm.tagName.toLowerCase() + ",") !== -1);
            },
  // uu.css.toPixel - Unit into px - px単位に変換
  toPixel:  function(elm, val, cssProp /* = "" */) {
              if (!val) { return 0; }
              if (!isNaN(val) || val.lastIndexOf("px") !== -1) {
                return uupf(val); // 3,"3","3px" なら 3 を返す
              }
              if (val.lastIndexOf("pt") !== -1) {
                return uupf(val) * uu.css.get.pt();
              }
              if (val.lastIndexOf("em") !== -1) {
                return uupf(val) * uu.css.get.em();
              }
              return val;
            },
  // uu.css.measure - Measure em and pt, and return PixelHash( { em, pt } ) value
  //                - em, ptを測定しPixelHash( { em, pt } )を返す
  measure:  function(cache /* = true */) {
              var rv = uu.css._pixelHash, e;
              if ((cache !== void 0 && !cache) || !rv.em) {
                e = uud.body.appendChild(uud.createElement("div"));
                e.style.width  = "12em"; rv.em = e.clientWidth  / 12;
                e.style.height = "12pt"; rv.pt = e.clientHeight / 12;
                uud.body.removeChild(e);
              }
              return rv;
            },
  // uu.css.insertRule - Insert CSS ruls - CSSルールを追加
  insertRule:
            function(rule, index /* = undefined */) {
              var rv = -1, pos, ss;
              if (!uu.css._styleSheet) {
                uu.css._styleSheet = uu.css.createStyleSheet();
              }
              ss = uu.css._styleSheet;

              if (!uu.ua.ie) { // for Firefox, Opera, Safari
                return ss.sheet.insertRule(rule, index || ss.sheet.cssRules.length); // return inserted index,
              }
              // for IE, rule( "selector { declaration; ... }" ) を分割し、addRule()に渡す
              pos = rule.indexOf("{"); // }
              if (pos === -1) {
                (uu.config.debug & 0x1) && uu.die("uu.css.insertRule(rule=%s)", rule);
                return -1; // bad format
              }
              rv = index || ss.rules.length;
              rule = rule.replace(/[\{\}]/g, "");
              ss.addRule(rule.substring(0, pos), rule.substring(pos), rv);
              return rv; // return inserted index,
            },
  // uu.css.deleteRule - Delete CSS ruls
  deleteRule:
            function(index) {
              if (uu.ua.ie) {
                uu.css._styleSheet.removeRule(index); // for IE
              } else {
                uu.css._styleSheet.sheet.deleteRule(index); // for Firefox, Opera, Safari
              }
            },
  // uu.css.createStyleSheet - Create StyleSheet
  createStyleSheet:
            function() {
              if (uu.ua.ie) { return uud.createStyleSheet(); }
              var e = uud.createElement("style");
              e.appendChild(uud.createTextNode(""));
              return uuhd.appendChild(e);
            },
  _autoVisible:
            function(elm) {
              var s = elm.style, v, zero, I = uupi;
              v = uucs(elm, "").visibility;
              zero = (!I(s.width) || !I(s.height));
              if (zero && v !== "hidden") {
                elm.style.visibility = "hidden";
              } else if (!zero && v === "hidden") {
                elm.style.visibility = "visible";
              }
            },
  _camelize:
            function(css_prop) { // Convert "css-prop" style into "cssProp" style - "css-prop"を"cssProp"に変換
              var p = css_prop, ng = { "float": uu.ua.ie ? "styleFloat" : "cssFloat" }; // htmlFor等は処理しない
              function F(str) {
                return str.replace(/-([a-z])/g, function(_, words) {
                  return words.toUpperCase();
                });
              }
              return F((p in ng) ? ng[p] : p);
            },
  _pixelHash: // PixelHash( { em, pt } )
            { em: 0, pt: 0 },
  _styleSheet:
            0,
  _display_block: // XHTML1.x block tag
            "p,div,dl,ul,ol,form,address,blockquote,h1,h2,h3,h4,h5,h6,fieldset,hr,pre,",
  _display_buggy: // style.display用機能不全リスト(主にIE6,IE7用)
            uu.ua("display:table") ? "" : "table,caption,tr,td,th,tbody,thead,tfoot,col,colgroup,",
  _display_table: // style.display を設定する上で特別な配慮が必要な要素の一覧
            !uu.ua("display:table") ? {} : {
              table: "table",              caption:  "table-caption",
              tr:    "table-row",          th:       "table-cell",        td:    "table-cell",
              thead: "table-header-group", tbody:    "table-row-group",   tfoot: "table-footer-group",
              col:   "table-column",       colgroup: "table-column-group"
            }
});
// --- CSS::getter/setter::CrossBrowser ---
uu.ua.ie && uu.mix(uu.css, {
  opacity:  function(elm) {
              return elm.filters.alpha ? uupf(elm.style.opacity) : 1.0;
            },
  backgroundImage:
            function(elm) {
              var url = elm.style.backgroundImage || elm.currentStyle.backgroundImage, m;
              if (!url) { return "none"; }
              m = url.match(/^url\((.*)\)$/);
              return !m ? "none" : m[1].replace(/["']/g, ""); // trim quote
            },
  rect:     function(elm) {
              var cs = uucs(elm, ""), x = cs.left, y = cs.top, w = cs.width, h = cs.height;
              w = (w === "auto") ? elm.clientWidth  : uupf(w);
              h = (h === "auto") ? elm.clientHeight : uupf(h);
              if (cs.position === "static") {
                return { x: 0, y: 0, w: w, h: h };
              }
              x = (x === "auto") ? uu.css.toPixel(x) : uupf(x);
              y = (y === "auto") ? uu.css.toPixel(y) : uupf(y);
//uu.log("result: x=%s y=%s w=%s h=%s", x, y, w, h);
              return { x: x, y: y, w: w, h: h };
            },
  setOpacity:
            function(elm, opa) {
              opa = uupf(opa);
              opa = (opa > 1) ? 1 : (opa < 0.001) ? 0 : opa;
              elm.style.opacity = uupf(opa); // uu.css.opacity()で値を取得できるようにしておく
              if (elm.filters.alpha) {
                elm.filters.alpha.opacity = uupf(opa) * 100;
                return;
              }
              elm.style.filter += " alpha(opacity=" + (uupf(opa) * 100) + ")";
              elm.style.zoom = elm.style.zoom || "1.0";
            },
  toPixel:  function(elm, val, cssProp /* = "" */) {
              if (!val) { return 0; }
              if (!isNaN(val) || val.lastIndexOf("px") !== -1) {
                return uupf(val); // 3,"3","3px" なら 3 を返す
              }
              if (val === "auto") {
                switch (cssProp || "") {
                case "width":  return elm.clientWidth;
                case "height": return elm.clientHeight;
                }
              }
              // @see this trick: http://d.hatena.ne.jp/uupaa/20080628
              var rv, s = elm.style, r = elm.runtimeStyle, sx = s.left, rx = r.left;
              r.left = uucs(elm, "").left;    // style="left: currentStyle.left !important"
              s.left = val, rv = s.pixelLeft; // stealthily set, and get pixel value(no redraw)
              s.left = sx, r.left = rx;       // restore style
              return rv; // pixel value
            }
});
(uu.ua.opera && !uu.ua.kestrel) && uu.mix(uu.css, { // Opera9.2x
  rect:     function(elm) {
              var cs = uucs(elm, ""), x = cs.left, y = cs.top, w = cs.width, h = cs.height, F = uupf;
              w = (w === "auto") ? elm.clientWidth  : F(w);
              h = (h === "auto") ? elm.clientHeight : F(h);
              w -= F(cs.paddingLeft) + F(cs.paddingRight) + F(cs.borderLeftWidth) + F(cs.borderRightWidth);
              h -= F(cs.paddingTop) + F(cs.paddingBottom) + F(cs.borderTopWidth) + F(cs.borderBottomWidth);
              if (cs.position === "static") {
                return { x: 0, y: 0, w: w, h: h };
              }
              x = (x === "auto") ? uu.css.toPixel(x) : F(x);
              y = (y === "auto") ? uu.css.toPixel(y) : F(y);
// uu.log("result: x=%s y=%s w=%s h=%s", x, y, w, h);
              return { x: x, y: y, w: w, h: h };
            }
});

// --- Element ---
uu.mix(uu.element = function() {}, {
  // uu.element.rect - Get element rect(abs) - 要素の絶対位置とサイズを取得
  rect:     function(elm) {
              var e = elm, x = 0, y = 0;
              while (e) {
                x += e.offsetLeft || 0;
                y += e.offsetTop  || 0;
                e = e.offsetParent;
              }
              return { x:  x, // offset from viewport with scroll(abs x) - 画面左上からのオフセット(スクロール量を含む)
                       y:  y, // offset from viewport with scroll(abs y) - 画面左上からのオフセット(スクロール量を含む)
                       w:  elm.clientWidth,    // padding + width
                       h:  elm.clientHeight,   // padding + height
                       ow: elm.offsetWidth,    // border + padding + width
                       oh: elm.offsetHeight }; // border + padding + height
            },
  // uu.element.offsetFromParentHasLayout - Get offset from ParentHasLayout element - ParentHasLayout要素からのオフセットを取得
  offsetFromParentHasLayout:
            function(elm) {
              var e = elm, x = 0, y = 0, r;
              while (e) {
                x += e.offsetLeft || 0;
                y += e.offsetTop  || 0;
                e = e.offsetParent;
                if (e) {
                  r = uu.css.get(e, "position"); // ParentHasLayout element = value of position is "relative" or "absolute".
                  if (r === "relative" || r === "absolute") {
                    break;
                  }
                }
              }
              return { x:  x, // offset from ParentHasLayout element(rel x) - ParentHasLayout要素からのオフセット
                       y:  y, // offset from ParentHasLayout element(rel y) - ParentHasLayout要素からのオフセット
                       w:  elm.clientWidth,    // padding + width
                       h:  elm.clientHeight,   // padding + height
                       ow: elm.offsetWidth,    // border + padding + width
                       oh: elm.offsetHeight }; // border + padding + height
            },
  // uu.ui.element.offsetFromAncestor - Get offset from ancestor element - 先祖要素(ancestor)からのオフセットを取得
  offsetFromAncestor:
            function(elm, ancestor) {
              var e = elm, x = 0, y = 0;
              function isRoot(e) { return (e === ancestor || e === uud); }

              if (isRoot(e)) {
                return { x: 0, y: 0 };
              }
              while (e) {
                x += e.offsetLeft || 0;
                y += e.offsetTop  || 0;
                e = e.offsetParent;
                if (isRoot(e)) { break; }
              }
              return { x: x, y: y };
            },
  //uu.ui.element.toAbsolute - Absolute positioning - 絶対座標化
  toAbsolute:
            function(elm) {
              var rect = uu.element.rect(elm); // 静的座標における絶対位置を取得
              elm.style.position = "absolute";
              elm.style.left = rect.x + "px";
              elm.style.top  = rect.y + "px";
            },
  //uu.ui.element.toStatic - Static positioning - 静的座標化
  toStatic: function(elm) {
              elm.style.position = "static";
            },
  // uu.ui.element.fromPoint - Coming Soon
  fromPoint:
            function(x, y) {
              return uud.elementFromPoint(x, y);
            }
});

// for Firefox3.0+, Opera9.5+
(uu.ua.firefox3 || uu.ua.kestrel) && uu.mix(uu.element, {
  rect:     function(elm) {
              var b = elm.getBoundingClientRect(), vp = uu.viewport.rect();
              return { x:  vp.sw + b.left,  y:  vp.sh + b.top,
                       w:  elm.clientWidth, h:  elm.clientHeight,
                       ow: elm.offsetWidth, oh: elm.offsetHeight };
            }
});
// for IE6+
uu.ua.ie && uu.mix(uu.element, {
  rect:     function(elm) {
              var b = elm.getBoundingClientRect(), vp = uu.viewport.rect(),
                  fix = (elm.parentNode === uud.body) ? 2 : 0;
              return { x:  vp.sw + b.left - fix, y:  vp.sh + b.top - fix, // -2px
                       w:  elm.clientWidth,      h:  elm.clientHeight,
                       ow: elm.offsetWidth,      oh: elm.offsetHeight };
            }
});

//uu.ua.gecko && !uu.ua.firefox3 && uu.mix(uu.element, { // for Firefox2
//  uu.element.fromPoint = function(x, y) {
//    return null; // not impl
//  };
//});

// --- ViewPort ----
uu.mix(uu.viewport = function() {}, {
  // uu.viewport.rect - Get view-port rect(browser inner size) - ブラウザの表示領域の位置とサイズを取得
  rect:     function() {
              var pad = uu.viewport._padding;
              return { x: pad.left, y: pad.top,
                       w: uuw.innerWidth  - pad.left - pad.right, // browser view-port width - ブラウザの表示領域の幅
                       h: uuw.innerHeight - pad.top - pad.bottom, // browser view-port height - ブラウザの表示領域の高さ
                       sw: uuw.pageXOffset, sh: uuw.pageYOffset }; // scroll width and height - スクロール幅と高さ
            },
  // uu.viewport.setVirtualPadding - Set PaddingHash( { top, right, bottom, left } )
  // 各要素は省略可能
  setVirtualPadding:
            function(padding) {
              uu.mix(uu.viewport._padding, padding);
            },
  _padding: { top: 0, right: 0, bottom: 0, left: 0 }
});
uu.ua.ie && uu.mix(uu.viewport, {
  rect:     function() {
              var e = uu.ua.std ? uud.documentElement : uud.body;
              return { x: 0, y: 0,
                       w: e.clientWidth, h: e.clientHeight,
                       sw: e.scrollLeft,  sh: e.scrollTop };
            }
});

// --- Module ---
uu.mix(uu, {
  // uu.module - Load Module - モジュールの読み込み
  module:   function(path /* = "" */, module, fn /* = undefined */) {
              var me = uu.module, src = me._build(path || uu.config.modulePath, module),
                  mods = uu.indexes(src), run = 0;
              fn = fn || uu.mute;

              if (!mods.length || me.already(module)) { // already
                fn();
                return;
              }
              function IE(v, i) {
                me._inject(i, v, {
                  onreadystatechange: function() {
                    if (!/loaded|complete/.test(this.readyState)) { return; }
                    if (!me.already(this.uuModule)) { me._reload(this); return; }
                    if (me.already(mods)) { !run++ && fn(); }
                  }
                });
              }
              function STD(v, i) { // v = "{url1};{url2};..."  i = "dev"
                me._inject(i, v, {
                  onload:  function() { if (me.already(mods)) { !run++ && fn(); } },
                  onerror: function() { me._reload(this); }
                });
              }
              uu.forEach(src, uu.ua.ie ? IE : STD);
            }
});
uu.mix(uu.module, {
  // uu.module.already - Module already loaded - モジュールの読み込み確認
  already:  function(module) {
              return uu.notax(module).every(function(v) {
                if (v.indexOf(".") === -1) {
                  return v in uu.module;
                }
                // "parent.child" format support
                var rv = 1, e = uu.module, ary = v.split("."), i = 0, sz = ary.length;
                for (; i < sz; ++i) {
                  if (ary[i] in e) { e = e[ary[i]]; continue; }
                  rv = 0;
                  break;
                }
                return !!rv;
              });
            },
  // uu.module.loadSync - Load Module(Synchronized) - モジュールの同期読み込み
  loadSync: function(path /* = "" */, module, fn /* = undefined */) {
              var me = uu.module, src = me._build(path || uu.config.modulePath, module),
                  mods = uu.indexes(src), node, last, tick = 0;
              fn = fn || uu.mute;

              if (!mods.length || me.already(module)) { // already
                fn();
                return;
              }

              last = mods.shift();
              node = me._inject(last, src[last]);

              function DELAY() {
                if ((tick += 100) > me.loadSyncTimeout) {
                  node = me._reload(node, false);
                  tick = 0;
                }
                if (me.already(last)) {
                  if (!mods.length) { fn(); return -1; } // complete
                  last = mods.shift();
                  node = me._inject(last, src[last]);
                  tick = 0;
                }
                return 100;
              }

              uu.vtmMidSpeed.set(0, DELAY);
            },
  // uu.module.loadSyncTimeout - loadSync timeout
  loadSyncTimeout:
            2000,
  _build:   function(path, module) { // build path
              var rv = {}, base = uu.url.base();
              path = uu.notax(path);

              uu.notax(module).forEach(function(m) {
                rv[m] = [];
                path.forEach(function(p) {
                  if (!/^(http|https|file):/.test(p)) { p = base + p; } // to abs path
                  rv[m].push(p + "uu.module." + m + ".js");
                });
              });
              return rv; // Hash { module-name: [url], ...}
            },
  _reload:  function(node, async /* = true */) { // reload alternate module
              var n = uuhd.removeChild(node), next, e;
              !n.uuList.length && uu.die("uu.module._reload(node=%s)", node.uuModule);

              next = n.uuList.shift();
              e = uu.mix(uu.script.create(n.id), { uuModule: n.uuModule, uuList: n.uuList });

              if (async === void 0 || async) {
                uu.mix(e, uu.ua.ie ? { onreadystatechange: n.onreadystatechange }
                                   : { onload: n.onload, onerror: n.onerror });
              }
              e.src = next;
              return uuhd.appendChild(e); // src設定後にドキュメントツリーに追加しないとIEでは動作しない
            },
  _inject:  function(name, list, hash) { // inject script tag
              var src = list.shift(), e = uu.script.create("uu.module." + name + ".js");
              uu.mix(e, { uuModule: name, uuList: list }, hash || {});
              e.setAttribute("src", src);
              return uuhd.appendChild(e);
            }
});

// --- Event ---
uu.mix(uu.event = function() {}, {
  // uu.event.closure - Create event closure - イベントクロージャを生成
  closure:  function(me) {
              return uu.ua.ie ? function(e) { me.handleEvent(e); } : me;
            },
  // uu.event.target - Detect event target - イベント発生源を取得
  target:   function(evt) { // for Firefox, Safari, Opera
              return evt;
            },
  // uu.event.set - Add event handler - イベントハンドラを設定
  set:      function(me, elm, type, capture /* = false */) {
              uu.event._impl(me, elm, type, capture || 0, 1);
            },
  // uu.event.unset - Remove event handler - イベントハンドラを解除
  unset:    function(me, elm, type, capture /* = false */) {
              uu.event._impl(me, elm, type, capture || 0, 2);
            },
  // uu.event.toggle - Toggle event handler - イベントハンドラを設定または解除
  toggle:   function(me, elm, type, capture /* = false */) {
              uu.event._impl(me, elm, type, capture || 0, 3);
            },
  // uu.event.stop - Execute stop-propagation and prevent-default - イベントの抑止
  stop:     function(evt, cancel /* = true */) {
              evt.stopPropagation();
              (cancel === void 0 || cancel) && evt.preventDefault();
            },
  // uu.event.toType - Convert DOM Lv0 event type - DOM Lv0イベントタイプに変換
  toType:   function(evt) {
              return evt.type;
            },
  // uu.event.toDOMType - Convert DOM event type - DOMイベントタイプに変換
  toDOMType:function(type) {
              return type;
            },
  // uu.event.keyState - Get key state - キーの状態を取得
  keyState: function(evt) {
              return { alt:  evt.altKey,  shift: evt.shiftKey, // alt = Option(Mac)
                       ctrl: evt.ctrlKey, key: evt.which ? evt.which : uuw.keyCode };
            },
  // uu.event.mousePos - Get mouse position - マウス座標を取得
  mousePos: function(evt) { // Firefox2, Safari3, Opera9
              return { x:  evt.pageX,   y:  evt.pageY,     // x,y   画面左上からのオフセット幅(スクロール量を含む)
                       ox: evt.layerX,  oy: evt.layerY,    // ox,oy 画面左上からのオフセット幅(スクロール量を含まない)
                       cx: evt.clientX, cy: evt.clientY }; // cy,cy 最寄の要素の左上からの相対座標
            },
  // uu.event.mouseState - Get mouse click and wheel state - マウスクリック, ホイールの状態を取得
  mouseState:
            function(evt) {
              var rv = { left: 0, mid: 0, right: 0, click: 0, wheel: 0 };
              if (uu.ua.gecko || evt.which) {
                switch (evt.which) {
                  case  1: rv.left  = 1; break;
                  case  2: rv.mid   = 1; break;
                  case  3: rv.right = 1; break;
                }
                rv.click = evt.detail & 0x03; // click count - クリック回数(0～3)
              } else if (uu.ua.ie || evt.button) {
                if (evt.button & 0x1) { rv.left  = 1; }
                if (evt.button & 0x4) { rv.mid   = 1; }
                if (evt.button & 0x2) { rv.right = 1; }
              }
              // wheelDelta: Safari, IE
              // detail: Firefox
              if (evt.wheelDelta || evt.detail) {
                rv.wheel = parseInt(evt.detail ? (evt.detail / 3) : (evt.wheelDelta / -120));
              }
              return rv;
            },
  // uu.event.clicks - Set click event handler - クリックイベントハンドラを設定
//  clicks:   function(me, elm, toggles /* = 2 */) {
//              elm.uuClicks = { idx: 0, max: toggles || 2, me: me };
//          ////    uu.event.set(elm, "click", uu.event._clicks);
//              uu.event.set(uu.event._clicks, elm, "click");
//            },
//  _clicks:  function(evt) {
//              uu.ua.ie ? (evt.returnValue = false) : evt.preventDefault();
//              var v = uu.event.target(evt).target.uuClicks;
//              v.me((++v.idx >= v.max) ? (v.idx = 0) : v.idx);
//            },
  _impl:    function(me, elm, type, capture, mode) { // mode = set:0x1, unset:0x2, toggle:0x3
              type = uu.notax(type);

              if ("handleEvent" in me) { me = me._eventClosure; }

              (elm === void 0 || !type.length || me === void 0) &&
                  uu.die("uu.event._impl(elm or type or me) is empty");

              if (!("uuEventID" in elm)) { elm.uuEventID = []; } // add a non-standard proprty

              if (uu.ua.ie && capture) { uu.event._captIE(elm, me, mode); }

              type.forEach(function(_type) {
                _type = uu.event.toDOMType(_type);
                var eid = uu.event._db_find(elm, _type, me, capture);
                (!eid && mode & 0x1) && uu.event._set(elm, _type, me, capture);
                ( eid && mode & 0x2) && uu.event._unset(elm, _type, me, capture, eid);
              });
            },
  _set:     function(e, t, f, c) {
              uu.event._db_set(e, t, f, c);
              e.addEventListener(t, f, c);
            },
  _unset:   function(e, t, f, c, i) {
              uu.event._db_unset(i, e, t);
              e.removeEventListener(t, f, c);
            },
  _db_set:  function(elm, type, fn, capture) {
              var eid = uu.uid("event"), typecap = type + (capture ? "1" : "0");
              uu.event._db[eid] = [elm, typecap, fn];
              elm.uuEventID.push(eid);
            },
  _db_unset:
            function(eid, elm, type) {
              elm.uuEventID.splice(elm.uuEventID.indexOf(eid), 1);
              delete uu.event._db[eid];
            },
  _db_find: function(elm, type, fn, capture) {
              var v, i = 0, eid, sz = elm.uuEventID.length, typecap = type + (capture ? "1" : "0");
              for (; i < sz; ++i) {
                eid = elm.uuEventID[i];
                if (eid in uu.event._db) {
                  v = uu.event._db[eid];
                  if (v[1] === typecap && v[2] === fn) { return eid; }
                }
              }
              return 0;
            },
  _db:      { /* unique-id: [elm, type/cap, fn], ... */ } // idをキーとしたデータ構造
});
// --- Event::CrossBrowser ---
uu.ua.gecko && uu.mix(uu.event, {
  toType:    function(evt) {
              return (evt.type === "DOMMouseScroll") ? "mousewheel" : evt.type;
            },
  toDOMType:
            function(type) {
              return (type === "mousewheel") ? "DOMMouseScroll" : type;
            }
});
uu.ua.opera && uu.mix(uu.event, {
  mousePos: function(evt) {
              return { x:  evt.pageX,   y:  evt.pageY,
                       ox: evt.offsetX, oy: evt.offsetY,
                       cx: evt.clientX, cy: evt.clientY };
            }
});
uu.ua.ie && uu.mix(uu.event, {
  toType:   function(evt) {
              return (evt.type.indexOf("losecapture") >= 0) ? "mouseup" : evt.type;
            },
  target:   function(evt) {
              var s = evt.srcElement, f = evt.fromElement;
              return { target: s, currentTarget: s, relatedTarget: s === f ? evt.toElement : f };
            },
  stop:     function(evt, cancelDefault /* = true */) {
              evt.cancelBubble = true;
              if (cancelDefault === void 0 || cancelDefault) {
                evt.returnValue = false;
              }
            },
  mousePos: function(evt) {
              var vp = uu.viewport.rect();
              return { x:  evt.clientX + vp.sw, y: evt.clientY + vp.sh,
                       ox: evt.offsetX,         oy: evt.offsetY,
                       cx: evt.clientX,         cy: evt.clientY };
            },
  _set:     function(e, t, f, c) {
              uu.event._db_set(e, t, f, c);
              e.attachEvent("on" + t, f);
            },
  _unset:   function(e, t, f, c, i) {
              uu.event._db_unset(i, e, t);
              e.detachEvent("on" + t, f);
            },
  _captIE:  function(elm, fn, mode) {
              if ("setCapture" in elm) {
                var eid = uu.event._db_find(elm, "losecapture", fn, 1);
                if (!eid && mode & 0x1) {
                  elm.setCapture();
                  uu.event._set(elm, "losecapture", fn, 1); // begin capture
                } else if (eid && mode & 0x2) {
                  elm.releaseCapture();
                  uu.event._unset(elm, "losecapture", fn, eid); // end capture
                }
              }
            }
});

// --- Ready ---
uu.mix(uu, {
  // uu.ready - Ready event handler - Readyイベントハンドラを設定
  ready:    function(fn, id /* = "D" */) {
              id = id || "D";
              var me = uu.ready;
              if (me._run[id]) { fn(); return; }

              function DELAY(n, title) { return me.already("C") ? (me._done(title), -1) : 10; }

              me._db[id].push(fn);
              switch (id) {
              case "D":  me._dom(fn, id); break;
              case "W":  uu.event.set(function() { me._done("W"); }, uuw, "load"); break;
              case "C":  (uu.ua.ie || uu.ua.opera) ? me._canvas(fn, id) : me._done("C"); break;
              case "DC": me(function() { uu.vtmHighSpeed.set(0, DELAY, -1, "DC"); }, "D"); break;
              case "WC": me(function() { uu.vtmHighSpeed.set(0, DELAY, -1, "WC"); }, "W"); break;
              case "U":  uu.event.set(function() { me._done("U"); }, uuw, "beforeunload,unload"); break;
              case "A":  (uuw.XMLHttpRequest || uuw.ActiveXObject) && me._done("A"); break;
              case "J":  me._done("J"); break;
              }
            }
});
uu.mix(uu.ready, {
  // uu.ready.already - Ready state - Ready状態の確認
  already:  function(id /* = "D" */) { // D, W, C, DC, WC, U
              return uu.ready._run[id || "D"] > 0;
            },
  _done:    function(id) { !uu.ready._run[id]++ &&
                               (uu.ready._db[id].forEach(uu.ready._call), uu.ready._db[id] = []); },
  _call:    function(fn) { fn(); },
  _dom:     function(fn, id) {
              if (uu.ua.gecko || uu.ua.opera) { uud.addEventListener("DOMContentLoaded", D, false); }
              else if (uu.ua.webkit && uud.readyState) { uu.vtmHighSpeed.set(0, WK); }
              else if (uu.ua.ie && uud.readyState) { uu.vtmHighSpeed.set(0, IE); }
              else { uu.event.set(D, uuw, "load"); } // for legacy browser
              function D() { uu.ready._done("D"); }
              function WK() { return /loaded|complete/.test(uud.readyState) ? (D(), -1) : 10; }
              // http://javascript.nwbox.com/IEContentLoaded/
              function IE() {try{uud.documentElement.doScroll("up");}catch(e){return 10;}D();return-1;}
            },
  _canvas:  function(fn, id) {
              var tag = uu.toArray(uu.tag("canvas"));
              // Opera9.5xからcanvasの初期化タイミングが変化(9.2xはDomReady→9.5xはWindowReady)
              uu.event.set(function() { uu.vtmHighSpeed.set(0, DELAY); }, uuw, "load");
              function DELAY() { return READY() ? (uu.ready._done("C"), -1) : 40; }
              function READY() { return tag.every(function(v) { return uu.isF(v.getContext); }); }
            },
  _run:     { D: 0, W: 0, C: 0, DC: 0, WC: 0, U: 0, A: 0, J: 0 },
  _db:      { D: [], W: [], C: [], DC: [], WC: [], U: [], A: [], J: [] }
});

// --- Request ---
uu.mix(uu.request = function() {}, {
  // uu.request.callbackFilter - Default value of the callback filter - コールバックフィルタのデフォルト値
  callbackFilter:
            0x2,
  // uu.request.timeout - Request timeout(zero does not do timeout) - タイムアウト時間(単位:ms)(0でタイムアウトしない)
  timeout:  10000,
  // uu.request.header - Request Header - リクエストヘッダ
  header:   { "X-Requested-With": "XMLHttpRequest" },
  // uu.request.jsonpFn - JSONP callback function name - JSONPコールバック関数名
  jsonpFn:  "callback",
  _cache:   {},     // cache( { url: timestamp } ) for uu.ajax.loadIfMod
  _fn:      {},     // tmp functions( { id: callbackfunction } ) for uu.jsonp
  _suicide: 60000   // resource expire time(ms) for uu.jsonp
});

// --- Request ---
uu.mix(uu, {
  // uu.ajax - Ajax async request - 非同期リクエスト
  ajax:     function(url, fn /* = undefined */, data /* = undefined */,
                     callbackFilter /* = undefined */, ifMod /* = false */) {
              !url && uu.die(ifMod || false ? "uu.ajax(url=%s)" : "uu.ajax.loadIfMod(url=%s)", url);
              url = uu.url.abs(url), fn = fn || uu.mute, data = data || null, ifMod = ifMod || false;

              var rq = uu.request, cf = callbackFilter || rq.callbackFilter, uid = uu.uid("ajax"), run = 0,
                  xhr = XHR(), fileScheme = url.indexOf("file://") !== -1; // file スキームでtrue
              if (!xhr) { FAIL(); return; }

              function XHR() {
                return uuw.XMLHttpRequest ? new XMLHttpRequest() : uuw.ActiveXObject
                                          ? new ActiveXObject('Microsoft.XMLHTTP') : null; }
              function HEADER(v, k) { xhr.setRequestHeader(k, v); }
              // "Last-Modified"の値をパース
              function LASTMOD()    { var rv = xhr.getResponseHeader("Last-Modified");
                                      return (rv) ? Date.parse(rv) : 0; }
              // HTTP/1.1準拠の日付文字列( "Thu, 01 Jan 1970 00:00:00 GMT" )を生成
              function RFCDATE(tm)  { if (!uu.ua.ie) { return (new Date(tm)).toUTCString(); }
                                      var rv = (new Date(tm)).toUTCString().replace(/UTC/, "GMT");
                                      return (rv.length < 29) ? rv.replace(/, /, ", 0") : rv; } // pad zero
              // 400 "Bad Request"
              function FAIL(state)  { (cf & 4 && !run++) && fn(uid, 4, "", state || 400, url, 1); }
              // onreadystatechange hander
              function HANDLER()    { if (xhr.readyState !== 4) { return; }
                                      // fileスキームでは成功時にstatusが0になる(Firefox2,Safari3,Opera9.5,IE6)
                                      if (xhr.status === 200 || fileScheme && !xhr.status) {
                                        (cf & 2 && !run++) && fn(uid, 2, xhr.responseText, 200, url, 1);
                                        (ifMod) && (rq._cache[url] = LASTMOD());
                                        return;
                                      }
                                      FAIL(xhr.status); } // 304 too

              xhr.onreadystatechange = HANDLER;
              try {
                xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), true); // true = Async
              } catch(e) { FAIL(); return; }

              uu.forEach(rq.header, HEADER);
              data && HEADER("application/x-www-form-urlencoded", "Content-Type");
              (ifMod && (url in rq._cache)) && HEADER(RFCDATE(rq._cache[url]), "If-Modified-Since");
              (cf & 1) && fn(uid, 1, "", 0, url, 1);
              xhr.send(data);

              rq.timeout && uu.vtmHighSpeed.set(function() { xhr.abort(); FAIL(408); }, rq.timeout, 1); // 408 "Request Time-out"
            },
  // uu.json - JSONP async request - 非同期リクエスト
  jsonp:    function(url, fn /* = undefined */, callbackFilter /* = undefined */) {
              !url && uu.die("uu.jsonp(url=%s)", url);
              url = uu.url.abs(url), fn = fn || uu.mute;

              var rq = uu.request, cf = callbackFilter || rq.callbackFilter, uid = uu.uid("jsonp"),
                  node, rurl = uu.url.addQuery(url, uu.toPair(rq.jsonpFn, "uu.request._fn." + uid));

              // 400 "Bad Request"
              function FAIL(state) { (cf & 4) && fn(uid, 4, "", state || 400, url, 1); }

              uuhd.appendChild(node = uu.script.create(uid));
              node._run = 0;

              rq._fn[uid] = function(json, state) {
                              function SUICIDE() {  uuhd.removeChild(node);
                                                    node.src = "";
                                                    delete rq._fn[uid]; }
                              if (node._run++) { return; }
                              if (json) { (cf & 2) && fn(uid, 2, json, 200, url, 1); } // 200 OK
                                   else { FAIL(state || 404); } // 404 "Not Found", 実際には他のエラーかもしれないが知る手段がない
                              uu.delay(SUICIDE, rq._suicide); // suicide
                            };
              (cf & 1) && fn(uid, 1, "", 0, url, 1);
              node.src = rurl;

              rq.timeout && uu.delay(function() { rq._fn[uid]("", 408); }, rq.timeout); // 408 "Request Time-out"
            }
});

// --- Request.Ajax ---
uu.mix(uu.ajax, {
  // uu.ajax.loadIfMod - Ajax async request with new-arrival check - 更新チェック付き非同期リクエスト
  loadIfMod:
            function(url, fn /* = undefined */, callbackFilter /* = undefined */) {
              uu.ajax(url, fn, 0, callbackFilter, true);
            }
});

// --- Request.Script ---
uu.mix(uu.script = function() {}, {
  // uu.script.create - Create script element - script要素の生成
  create:   function(id /* = "" */) {
              return uu.mix(document.createElement("script"), {
                type: "text/javascript", charset: "utf-8", id: id || ""
              });
            },
  // uu.script.exec - Evel Script - JavaScript文字列をグローバルネームスペースで評価
  exec:     function(code) {
              return uuhd.removeChild(uuhd.appendChild(uu.mix(uu.script.create(), { text: code })));
            }
});

// --- Utility ---
uu.mix(uu, {
  // uu.uid - Generate unique ID - ユニークIDの生成
  uid:      function(prefix /* = "uniqueID" */) {
              return (prefix || "uniqueID") + ++uu.uid._count;
            },
  // uu.sprintf
  sprintf:  function(format /*, ... */) {
              var av = arguments, next = 1, idx = 0, prefix = { o: "0", x: "0x", X: "0X" },
                  I = uupi, F = uupf, N = isNaN, C = String.fromCharCode;
              function FORMAT(m, ai, f, w, p, sz, t, v) { // m(match), sz(size)未使用, vはundefined
                idx = ai ? I(ai) : next++;
                switch (t) {
                case "i":
                case "d": v = I(T(idx)).toString(); break;
                case "u": v = I(T(idx)); !N(v) && (v = U(v).toString()); break;
                case "o": v = I(T(idx)); !N(v) && (v = P(t, U(v).toString(8), f)); break;
                case "x": v = I(T(idx)); !N(v) && (v = P(t, U(v).toString(16), f)); break;
                case "X": v = I(T(idx)); !N(v) && (v = P(t, U(v).toString(16).toUpperCase(), f)); break;
                case "f": v = F(T(idx)).toFixed(p); break;
                case "c": w = 0; v = T(idx); v = (typeof v === "number") ? C(v) : NaN; break;
                case "s": /* w = 0; */ v = T(idx).toString(); p && (v = v.substring(0, p)); break;
                case "%": v = "%"; break;
                }
                if (N(v)) { v = v.toString(); f = ""; } // "NaN" does reset flag
                return (v.length < w) ? PAD(t, v, f || " ", w - v.length) : v;
              }
              function PAD(t, v, f, sz) {
                if (f === "0" && (t === "d" || t === "f") && v.indexOf("-") !== -1) {
                  return "-" + Array(sz + 1).join("0") + v.substring(1); // "-123" -> "-00123"
                }
                return Array(sz + 1).join((f === "#") ? " " : f) + v;
              }
              function P(t, v, f) { return (f !== "#") ? v : prefix[t] + v; } // add prefix
              function T(i) { return (av[i] === void 0) ? "undefined" : av[i]; } // "undefined" trap
              function U(v) { return (v >= 0) ? v : v % 0x100000000 + 0x100000000; } // to unsigned

              return format.replace(/%(?:([\d]+)\$)?(#|0)?([\d]+)?(?:\.([\d]+))?(l)?([%iduoxXfcs])/g, FORMAT);
            },
  // uu.trim - Trim both(left and right) - 文字列の両端の空白文字を除去
  trim:     function(str) {
              return str.replace(/^[\s]*|[\s]*$/g, "");
            },
  // uu.notax - Receive JointedString, StringArray and String, return an Array
  //          - 結合文字列, 文字列の配列, 文字列を受け取り、配列を返す
  notax:    function(tax, param /* = { sep: ",", fn: undefined, trim: true } */) {
              if (param === void 0) { // quickie
                return (tax instanceof Array) ? tax :
                       (tax.indexOf(",") === -1) ? [tax] : tax.split(",").map(uu.trim);
              }
              param = uu.mix.param(param || {}, { sep: ",", fn: uu.echo, trim: true });
              !uu.isS(tax) && uu.die("uu.notax(tax=%s)", tax);
              if (tax.indexOf(param.sep) === -1) { return [param.fn(tax)]; }
              return tax.split(param.sep).map(function(v) {
                if (param.trim) { v = uu.trim(v); }
                return param.fn(v);
              });
            },
  // uu.toPair - Make Hash( { key: value } ) from key and value - key, value から Hash( { key: value } )を生成
  toPair:   function(key, value) {
              var rv = {};
              rv[key] = value;
              return rv;
            },
  // uu.toHash - Make Hash from Array and FakeArray - 配列,擬似配列をHash化
  toHash:   function(ary) {
              var rv = {}, i = 0, sz = ary.length, v;
              for (; i < sz; ++i) {
                v = ary[i];
                (typeof v !== "function") && (rv[v] = v);
              }
              return rv;
            },
  // uu.toArray - Make Array from FakeArray - 擬似配列を配列化
  toArray:  function(fake, idx /* = 0 */) {
              idx = idx || 0;
              if (fake === null || !("length" in fake) || !fake.length || fake.length <= idx) {
                return [];
              }
              var rv = Array(fake.length - idx), i = idx, sz = rv.length;
              for (; i < sz; ++i) { rv[i] = fake[i]; }
              return rv;
            },
  // uu.indexes - Enumerate the index of the Hash/Array/FakeArray and return an Array
  //            - Hash/配列/擬似配列のindexを列挙し配列を返す
  indexes:  function(mix) {
              var rv = [], i, sz;
              if (uu.isA(mix) || uu.isFA(mix)) { // Array, FakeArray
                for (i = 0, sz = mix.length; i < sz; ++i) { (i in mix) && rv.push(i); }
              } else {
                for (i in mix) { mix.hasOwnProperty(i) && rv.push(i); }
              }
              return rv;
            },
  // uu.values - Enumerate the value of the Hash/Array/FakeArray and return an Array
  //           - Hash/配列/擬似配列の値を列挙し配列を返す
  values:   function(mix) {
              var rv = [], i, sz;
              if (uu.isA(mix) || uu.isFA(mix)) { // Array, FakeArray
                for (i = 0, sz = mix.length; i < sz; ++i) { (i in mix) && rv.push(mix[i]); }
              } else {
                for (i in mix) { mix.hasOwnProperty(i) && rv.push(mix[i]); }
              }
              return rv;
            },
  // uu.converse - Return Hash which replaced value with key of Hash
  //             - Hashのkeyとvalueを入れ替えたHashを返す
  converse: function(hash) {
              var rv = {};
              uu.forEach(hash, function(v, i) {
                rv[v] = i;
              });
              return rv;
            },
  // uu.size - Length of the Hash/Array/FakeArray - Hash/配列/擬似配列の要素数を返す
  size:     function(mix) {
              var rv = 0, i;
              if (uu.isA(mix) || uu.isFA(mix)) { return mix.length; } // Array, FakeArray
              for (i in mix) { mix.hasOwnProperty(i) && ++rv; }
              return rv;
            },
  // uu.first - First Element of the Hash/Array/FakeArray - Hash/配列/擬似配列の先頭の要素の値を取得
  first:    function(mix, missHit /* = undefined */) {
              if (uu.isA(mix) || uu.isFA(mix)) { return (mix.length) ? mix[0] : missHit; } // Array, FakeArray
              for (var i in mix) { return mix[i]; }
              return missHit;
            },
  // uu.last - Last Element of the Hash/Array/FakeArray - Hash/配列/擬似配列の最後の要素の値を取得
  last:     function(mix, missHit /* = undefined */) {
              if (uu.isA(mix) || uu.isFA(mix)) { return (mix.length) ? mix[mix.length - 1] : missHit; } // Array, FakeArray
              var i, rv = missHit;
              for (i in mix) { rv = mix[i]; }
              return rv;
            },
  // uu.slim - Remove equivalent value - 配列から重複する値を除去した新しい配列を生成する
  slim:     function(ary) {
              return ary.filter(function(v, i, a) {
                return a.slice(0, i).indexOf(v) === -1 && a.slice(i + 1).indexOf(v) === -1;
              });
            },
  // uu.diet - Hash/Array memory compaction - Hash/Arrayのコンパクト化
  diet:     function(mix) {
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
  // uu.inRect - Rectangular coordinate - 矩形内(rect)の座標(pos)ならtrue
  inRect:   function(rect, pos) {
              return (pos.x > rect.x && pos.x < rect.x + rect.w) &&
                     (pos.y > rect.y && pos.y < rect.y + rect.h);
            },
  // uu.delay - Lazy evaluation - 遅延評価
  delay:    function(fn, delay /* = 0ms */) {
              return uust(fn, delay || 0);
            },
  // uu.time - Get current time - 現在時刻を取得
  time:     function() {
              return (new Date()).getTime();
            },
  // uu.isU, uu.isA, uu.isFA, uu.isE, uu.isF, uu.isN, uu.isB, uu.isS - judge types
  isU:      function(mix) { return mix === void 0; },
  isA:      function(mix) { return mix instanceof Array; },
  isFA:     function(mix) { return !(mix instanceof Array) && ("length" in mix); },
  isE:      function(mix) { return !!mix.nodeType; }, // mix instanceof Node
  isF:      function(mix) { return typeof mix === "function"; },
  isN:      function(mix) { return typeof mix === "number" && isFinite(mix); },
  isB:      function(mix) { return typeof mix === "boolean"; },
  isS:      function(mix) { return typeof mix === "string"; },
  // uu.die - Critical error handler
  die:      function(fmt, p1, p2) {
              throw TypeError(uu.sprintf(fmt, p1, p2));
            },
  // uu.no - Every return false
  no:       function()    { return false; },
  // uu.echo - Every return first argument
  echo:     function(arg) { return arg; },
  // uu.mute - Every return undefined
  mute:     function()    {}
});
uu.uid._count = 0;

// --- Log ---
uu.mix(uu.log = function(fmt /*, arg, ... */) { uuco && uuco.log.apply(this, arguments); }, {
  debug:    function(fmt /*, arg, ... */) { uuco && uuco.debug.apply(this, arguments); },
  error:    function(fmt /*, arg, ... */) { uuco && uuco.error.apply(this, arguments); },
  warn:     function(fmt /*, arg, ... */) { uuco && uuco.warn.apply(this, arguments); },
  info:     function(fmt /*, arg, ... */) { uuco && uuco.info.apply(this, arguments); },
  dir:      function() { uuco && uuco.inspect.apply(this, arguments); },
  clear:    function() { uuco && uuco.clear(); }
});

// --- CrossBrowser ---
uu.mix.param(uuap, { // uuap is Array.prototype alias
  // Array.indexOf - Returns the first index at which a given element can be found in the array, or -1 if it is not present
  //               - 配列の先頭から値を検索し最初のindexを返す。無ければ-1を返す
  indexOf:  function(value, index /* = 0 */) {
              var sz = this.length;
              index = index || 0, index = (index < 0) ? index + sz : index;
              for (; index < sz; ++index) {
                if (index in this && this[index] === value) { return index; }
              }
              return -1;
            },
  // Array.lastIndexOf - Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at fromIndex
  //                   - 配列の後方から値を検索し最初のindexを返す。無ければ-1を返す
  lastIndexOf:
            function(value, index /* = this.length */) {
              var sz = this.length;
              index = (index < 0) ? index + sz : sz - 1;
              for (; index > -1; --index) {
                if (index in this && this[index] === value) { return index; }
              }
              return -1;
            }
});
uu.ua.gecko && !HTMLElement.prototype.outerHTML && (function() {
  HTMLElement.prototype.__defineGetter__("outerHTML", function() {
              var r = uud.createRange(), tub = uud.createElement("div");
              r.selectNode(this);
              tub.appendChild(r.cloneContents());
              return tub.innerHTML;
            });
  HTMLElement.prototype.__defineSetter__("outerHTML", function(html) {
              var r = uud.createRange(), f;
              r.setStartBefore(this);
              f = r.createContextualFragment(html);
              this.parentNode.replaceChild(f, this);
            });
  HTMLElement.prototype.__defineGetter__("innerText", function() {
              return this.textContent;
            });
  HTMLElement.prototype.__defineSetter__("innerText", function(text) {
              while(this.hasChildNodes()) {
                this.removeChild(this.lastChild);
              }
              this.appendChild(uud.createTextNode(text));
            });
}());

// --- Basic Modules ---

/** URL
 *
 * @class
 */
uu.module.url = uu.klass.kiss();
uu.module.url.prototype = {
  construct:
            function() { this.db = { baseCache: "" }; },
  // uu.module.url.base, uu.url.base - Get base URL
  base:     function() {
              var me = this;
              function F() {
                var elm = uu.attr('script[@src*="uupaa.js"]', uuhd), lo = uuw.location;
                return (!elm.length) ? me.dir(lo.protocol + "//" + lo.pathname.replace(/\\/g, "/"))
                                     : me.dir(me.abs(elm[0].src));
              }
              return this.db.baseCache || (this.db.baseCache = F());
            },
  // uu.module.url.abs, uu.url.abs - Get absolute URL - 絶対URL化
  abs:      function(path) {
              function ONTHEFLY(s) { var e = uud.createElement("div");
                              e.innerHTML = '<a href="' + s + '" />';
                              return e.firstChild.href; }
              return /^(file|https|http)\:\/\//.test(path) ? path : ONTHEFLY(path);
            },
  // uu.module.url.dir, uu.url.dir - Extract scheme and directory part from URL - URLからスキームとディレクトリを取り出す
  dir:      function(path) {
              var sl = path.lastIndexOf("/") + 1;
              return (!sl) ? "" : path.slice(0, sl);
            },
  // uu.module.url.fileName, uu.url.fileName - Extract file-name and extension part from URL - URLからファイル名と拡張子を取り出す
  fileName: function(path) {
              var rv = path.split("/");
              return rv[rv.length - 1];
            },
  // uu.module.url.query, uu.url.query - Parse QueryString - QueryStringのパース
  query:    function(qstr) {
              var rv = {}, F = uuw.decodeURIComponent;
              function D(match, key, value) { return rv[F(key)] = F(value); }
              // "?"の左側を切り落とし "key=value"で切り分け
              qstr.replace(/^.*\?/, "").replace(/&amp;/g, "&").replace(/(?:([^\=]+)\=([^\&]+)&?)/g, D);
              return rv;
            },
  // uu.module.url.addQuery, uu.url.addQuery - Add QueryString - クエリストリングを追加
  addQuery: function(url, hash) {
              var rv = [], F = uuw.encodeURIComponent;
              uu.forEach(hash, function(v, k) { rv.push(F(k) + "=" + F(v)); });
              return url + (url.lastIndexOf("?") === -1 ? "?" : "&") + rv.join("&");
            }
};

/** Virtual Timer - 仮想タイマー
 *
 * @class
 */
uu.module.virtualTimer = uu.klass.kiss();
uu.module.virtualTimer.prototype = {
  construct:
            function(baseClock /* = 10ms */) {
              uu.mix(this, { baseClock: baseClock || 10, tick: 0, baseTimerID: -1, dietLock: 0,
                             db: [ /* vtid: { next, fn, count, dfn, delay, loop, unset }, ... */ ] });
            },
  destruct: function() {
              this.suspend(-1); this.db = null;
            },
  // uu.module.virtualTimer.set - Regist VirtualTimer - 仮想タイマーを登録
  set:      function(fn /* = uu.mute */, delay /* = 10 */, loop /* = 0 */, title /* = "unknown" */) {
              fn = uu.isF(fn) ? fn : uu.isS(fn) ? new Function(fn) : uu.mute, delay = delay || 10;
              var dfn = uu.isF(delay) ? delay : 0,
                  next = dfn ? dfn(0, title) : delay, vtid = this.db.length;
              if (next < 0) { return -2; }
              this.resume(-1);
              this.db[vtid] = { next: this.tick + next, unset: 0, fn: fn, count: 0, dfn: dfn,
                                delay: delay, loop: loop || 0, title: title || "unknown" };
              return vtid;
            },
  // uu.module.virtualTimer.unset - Unregist VirtualTimer - 仮想タイマーを抹消
  unset:    function(vtid) {
              if (!(vtid in this.db)) { return; }
              var db = this.db[vtid];
              db.loop = 0, db.next = 0, db.unset = 1;
            },
  // uu.module.virtualTimer.extend - Extend VirtualTimer loop count - 仮想タイマーのループ数を延長
  extend:   function(vtid, loop /* = -1 */) {
              loop = loop || -1;
              if (!(vtid in this.db) || this.db[vtid].unset) { return; }
              var db = this.db[vtid];
              // loop < 0で無限ループ化, loop >= 0で有限ループ化
              db.loop = (loop < 0) ? -1 : (db.loop < 0 ? loop : db.loop + loop);
              db.next += (!db.next) ? 1 : 0; // restart if suspended
            },
  // uu.module.virtualTimer.resume - Resume BaseTimer or VirtualTimer - ベースタイマー/仮想タイマーを再スタート
  resume:   function(vtid /* = -1 */) {
              vtid = vtid || -1;
              if (vtid < 0) {
                if (this.baseTimerID === -1) {
                  this.tick = uu.time(); // refresh tick count
                  this.baseTimerID = this._impl(); // restart
                }
              } else if (vtid in this.db) {
                var db = this.db[vtid];
                if (!db.loop || db.next || db.unset) { return; }
                db.next = 1; // restart
                (this.baseTimerID === -1) && this.resume(-1); // resume(-1) - restart base timer
              }
            },
  // uu.module.virtualTimer.suspend - Suspend BaseTimer or VirtualTimer - ベースタイマー/仮想タイマーを一時停止
  suspend:  function(vtid /* = -1 */) {
              vtid = vtid || -1;
              if (vtid < 0) {
                (this.baseTimerID !== -1) && uuw.clearInterval(this.baseTimerID);
                this.baseTimerID = -1; // stop base timer
              } else if (vtid in this.db) {
                var db = this.db[vtid];
                if (!db.loop || !db.next || db.unset) { return; }
                db.next = 0; // stop
              }
            },
  // uu.module.virtualTimer.diet - Memory Compaction - リソースを開放
  diet:     function() {
              ++this.dietLock;
            },
  _impl:    function() {
              var carry = this;
              return uuw.setInterval(function() {
                var me = carry, i = 0, sz = me.db.length, tick = me.tick += me.baseClock, r, db;
                if (me.dietLock) {
                  me.db = me.db.filter(function(v) { return v.loop || v.next; });
                  me.dietLock = 0; // unlock
                } else {
                  for (; i < sz; ++i) {
                    db = me.db[i]; // fetch
                    // 予定時刻(db.next)が現在時刻(tick)を過ぎていれば、
                    // 次回の予定(db.next)をtick + rで求めfn()をコール,
                    // loop残ゼロでsuspend状態へ(db.loop=db.next=0)
                    if (db.next && tick >= db.next) {
                      db.next = (db.loop < 0 || --db.loop)
                              ? (r = db.dfn ? db.dfn(++db.count, db.title) : db.delay, tick + r) : 0;
                      if (r < 0) {
//uu.log("auto suspend[%s]: db.loop[%d], db.count[%d], delay[%d]", db.title, db.loop, db.count, r);
                        db.next = 0, db.loop = 0, r = 0;
                      }
                      db.fn();
                    }
                  }
                }
              }, this.baseClock);
            }
};

/** Message Pump
 *
 * @class
 */
uu.module.messagePump = uu.klass.kiss();
uu.module.messagePump.prototype = {
  construct:
            function() {
              var me = this;
              function F() {
                if (!me.msg.length) { me.vtm.suspend(-1); return; } // self suspend
                var e = me.msg.shift();
                (e[0] in me.uid) && me.uid[e[0]].msgbox(e[1], e[2], e[3]); // (msg, param1, param2)
              }
              this.uid  = { /* msgbox_uid: msgbox_object, ... */ };
              this.msg  = [ /* num: [ id, msg, param1, param2], ... */ ];
              this.vtm  = new uu.module.virtualTimer(10);
              this.vtid = this.vtm.set(F, 10, -1, "MessagePump"); // タイマーは自前の物を使用
            },
  // uu.module.messagePump.set, uu.msg.set - Register the destination of the message - メッセージの送信先を登録
  set:      function(obj /* Object has uid property */) {
              !obj.uid && uu.die("uu.module.messagePump.set(obj)");
              this.uid[obj.uid] = obj;
            },
  // uu.module.messagePump.send, uu.msg.send - Send a message synchronously - メッセージを同期送信
  send:     function(to, msg, p1 /* = 0 */, p2 /* = 0 */) {
              p1 = p1 || 0, p2 = p2 || 0;
              var rv = [], me = this;
              if (!to) { // broadcast
                uu.forEach(this.uid, function(v) {
                  rv.push(v.msgbox(msg, p1, p2));
                });
              } else { // unicast, multicast
                (uu.isA(to) ? to : [to]).forEach(function(v) {
                  rv.push(me.uid[uu.isS(v) ? v : v.uid].msgbox(msg, p1, p2));
                });
                // ユニキャストなら配列ではなく戻り値そのものを返す
                if (rv.length === 1) {
                  rv = rv[0];
                }
              }
              return rv;
            },
  // uu.module.messagePump.post, uu.msg.post - Send a message asynchronously - メッセージを非同期送信
  post:     function(to, msg, p1 /* = 0 */, p2 /* = 0 */) {
              p1 = p1 || 0, p2 = p2 || 0;
              var stock = this.msg;
              if (!to) { // broadcast
                uu.forEach(this.uid, function(v, i) {
                  stock.push([i, msg, p1, p2]);
                });
              } else { // unicast, multicast
                (uu.isA(to) ? to : [to]).forEach(function(v) {
                  stock.push([uu.isS(v) ? v : v.uid, msg, p1, p2]);
                });
              }
              this.vtm.resume(-1);
            }
};

/** Custom Event
 *
 * @class
 */
uu.module.customEvent = uu.klass.singleton();
uu.module.customEvent.prototype = {
  construct:
            function() {
              this.event = { /* uid: { type, uid }, ... */ };
              this.db = {
                FONT_RESIZE: { run: 0, spy: 0, spyHeight: 0, vtid: -2, uid: [] }
              };
            },
  msgbox:   function(msg, p1, p2) {
              var uid;
              switch (msg) {
              case "SET": // post(p1 = EVENT_TYPE, p2 = uid)
                switch (p1) {
                case "FONT_RESIZE":
                  this._setFontResize(p2);
                  uid = uu.uid("customEvent");
                  this.event[uid] = { type: p1, uid: p2 };
                  return uid;
                  break;
                }
                break;
              case "UNSET": // post(p1 = EVENT_TYPE, p2 = uid)
                switch (p1) {
                case "FONT_RESIZE":
                  this._unsetFontResize(this.event[p2].type, this.event[p2].uid);
                  break;
                }
                break;
              }
              return 0;
            },
  _setFontResize:
            function(uid) {
              var db = this.db.FONT_RESIZE;

              // フォントリサイズを監視
              // spyの高さ変化 → uu.css.measure(false); で再計算 → メッセージをポスト
              function PEEK() {
                var h = db.spy.offsetHeight;
                if (db.spyHeight !== h) {
                  db.spyHeight = h; // update
                  uu.css.measure(false); // remeasure(em,pt)
                  db.uid.forEach(function(v) {
                    uu.msg.post(v, "FONT_RESIZE");
                  });
                }
              }
              db.uid.push(uid);
              if (!db.run++) {
                db.spy = uud.createElement("div");
                uu.css.set(db.spy, {
                  className: "spy", position: "absolute", fontSize: "large",
                  visibility: "hidden", height: "1em", top: "-10em", left: "-10em" // spyは画面外で待機
                });
                uud.body.appendChild(db.spy);
                db.spyHeight = db.spy.offsetHeight; // 元の高さを保存
                db.vtid = uu.vtmLowSpeed.set(PEEK, 1000);
              }
              return true;
            },
  _unsetFontResize:
            function(uid) {
              var db = this.db.FONT_RESIZE, pos = db.uid.indexOf(uid);
              if (pos !== -1) {
                db.uid[pos] = null;
                db.uid = uu.diet(db.uid);
                if (!db.uid.length) {
                  uu.vtmLowSpeed.unset(db.vtid);
                  uud.body.removeChild(db.spy);
                }
              }
            }
};

/** Agent
 *
 * @class
 */
uu.module.agent = uu.klass.singleton();
uu.module.agent.prototype = {
  construct:
            function() {
              uu.vtmLowSpeed.set(this._chainClassName, 2000, -1, "ChainClassNameAgent");
            },
  msgbox:   function(msg, p1, p2) {
              switch (msg) {
              case UU.MSG_CHANGE_READY_STATE: // p1="W" or "D" or "C"
                this._chainClassName();
                break;
              }
            },
  _chainClassName:
            function() {
              var m;
              uu.tag("*", uud.body).forEach(function(v) {
                if (v.className) {
                  m = (" " + v.className).match(/ js[\w\-]+/g);
                  if (m) {
                    m.forEach(function(vv) {
                      uu.klass.evalWidgetChainedClassName(v, vv.substring(3)); // " jsxxx" -> "xxx"
                    });
                  }
                }
              });
            }
};

/** Image
 *
 * @class
 */
uu.module.image = uu.klass.kiss();
uu.module.image.prototype = {
  construct:
            function() { uu.mix(this, { db: [ /* img, ... */ ], ok: 0, ng: 0 }); },
  // uu.module.image.load - Preload image - 画像のプリロード
  load:     function(url, fn /* = undefined */, callbackFilter /* = undefined */) {
              url = uu.url.abs(url), fn = fn || uu.mute;
              var me = this, cf = callbackFilter || uu.request.callbackFilter,
                  img = new Image(), uid = uu.uid("image"), run = 0, tick = 0;

              function ERROR() { !run++ && NG(); }
              function LOAD()  { !run++ && ((uu.ua.opera && !img.complete) ? NG() : OK()); }
              function OK()    { ++me.ok; ++img.uuImageReady; (cf & 2) && fn(uid, 2, img, 200, url, 1); }
              function NG()    { ++me.ng;                     (cf & 4) && fn(uid, 4, "",  400, url, 1); }
              function DELAY() { if (run) { return -1; }
                                 if ((uu.ua.gecko && img.complete && !img.width) || // Firefox2は読込失敗でcomplete=true, width=0になる
                                     (tick += 50) > uu.request.timeout) { // タイムアウト
                                   !run++ && NG();
                                   return -1;
                                 }
                                 return 50;
                               }
              this.db.push(uu.mix(img, { uid: uid, uuImageReady: 0 })); // 独自属性(uid, uuImageReady)を追加

              (cf & 1) && fn(uid, 1, "", 0, url, 1);
              if (this.browserCached(url)) { img.src = url; OK(); return img; }
              img.onerror = ERROR;
              img.onabort = ERROR;
              img.onload  = LOAD;
              img.src     = url;
              (!run && uu.request.timeout) && uu.vtmHighSpeed.set(0, DELAY);
              return img;
            },
  // uu.module.image.already - ImageReady state - ImageReady状態の確認
  already:  function(uid /* uid or ImageNumber */ /* = undefined */) {
              if (uid === void 0) { return !this.ng; }
              if (uu.isN(uid) && uid in this.db) { return !!this.db[uid].uuImageReady; }
              var r = this.item(uid);
              return (r.length && r[0].uuImageReady);
            },
  // uu.module.image.browserCached - ImageReady state(confirm browser cash) - ImageReady状態の確認(ブラウザキャッシュを確認)
  browserCached:
            function(url) {
              function F(v) { return v.complete && (v.src === url); }
              return uu.toArray(uud.images).some(F);
            },
  // uu.module.image.loading - Number of the files loading - 読み込んでいる最中のファイル数を取得
  loading:  function() { return this.db.length - this.ok - this.ng; },
  // uu.module.image.item - Loaded image object - 読み込み済みの画像オブジェクトを取得
  item:     function(uid /* uid or ImageNumber */ /* = undefined */) {
              if (uid === void 0) { return this.db; }
              if (uu.isN(uid) && uid in this.db) { return this.db[uid]; }
              return this.db.filter(function(v) { return v.uid === uid; })
            }
};

/** Image Collection
 *
 * @class
 */
uu.module.imageset = uu.klass.singleton();
uu.module.imageset.prototype = {
  construct:
            function() {
              this.img = { /* uid: uu.module.image */ };
              this.already = { /* uid: 0 */ };
            },
  msgbox:   function(msg, p1, p2) {
              switch (msg) {
              case "PRELOAD_IMAGE": // 画像の読み込み依頼, post(p1 = uid, p2 = Taxing( { files } ) )
                this._preload(p1, uu.notax(p2));
                break;
              case "IS_ALREADY": // send(p1 = uid)
                if (!(p1 in this.img)) {
                  return false;
                }
                return this.img[p1].already;
              }
              return 0;
            },
  _preload: function(uid, file) {
              var me = this, run = 0;

              if (!(uid in this.img)) {
                this.img[uid] = new uu.module.image(); // create object
                this.already[uid] = 0;
              }
              file.forEach(function(v) {
                me.img[uid].load(v, function(imguid, step) {
                  switch (step) {
                  case 2:
                    if (me.img[uid].already()) { // 全画像のロードに成功で"PRELOAD_IMAGE_OK"をポストする
                      me.already[uid] = 1;
                      ++run;
                      if (run === file.length) {
                        uu.msg.post(uid, "PRELOAD_IMAGE_OK", me.img[uid]);
                      }
                    }
                    break;
                  case 4:
                    me.already[uid] = 0;
                    uu.msg.post(uid, "PRELOAD_IMAGE_NG", me.img[uid]);
                    break;
                  }
                }, 6);
              });
            }
};

/** Color and ColorNameSpace
 *
 * @class
 */
uu.module.color = uu.klass.kiss();
uu.module.color.prototype = {
  construct:
            function() {
              // create dictionary
              this._name = { /* name: hex, ... */ }; // name -> hex
              this._d2h  = new Array(256);           // 255  -> "FF"

              var me = this, i, j, hex, name;
              this._dict.split(",").forEach(function(v) {
                hex = uupi(v.substring(0, 6), 16);
                name = v.substring(6);
                me._name[name] = hex;
              });
              for (i = 0; i < 16; ++i) {
                for (j = 0; j < 16; ++j) {
                  this._d2h[i * 16 + j] = i.toString(16) + j.toString(16);
                }
              }
            },
  // uu.module.color.zero - Transparent black( { r: 0, g: 0, b: 0, a: 0 } ) - 透明な黒
  zero:     { r: 0, g: 0, b: 0, a: 0 },
  // uu.module.color.black - Black( { r: 0, g: 0, b: 0, a: 1 } )
  black:    { r: 0, g: 0, b: 0, a: 1 },
  // uu.module.color.white - White( { r: 255, g: 255, b: 255, a: 1 } )
  white:    { r: 255, g: 255, b: 255, a: 1 },
  // uu.module.color.hash - Parse color and return RGBAHash - 色をパースしRGBAHashを返す
  hash:     function(r, g, b, a) { // r = Number( Red ) or String( name, #fff, rgb, rgba ) or RGBAHash or HSVAHash
              var m, i = uuw.parseInt, f = uuw.parseFloat;
              function H(n, a) { return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff, a: a }; }
              function D(n)    { return (n.lastIndexOf("%") === -1) ? i(n) : f(n) * 2.55 | 0; }

              switch (typeof r) {
              case "number":
                return (g === void 0) ? H(r, 1) : { r: r, g: g, b: b, a: a || 1 };
              case "string":
                if (r.indexOf(" ") !== -1) { r = r.replace(/ /g, ""); }
                if (r.charAt(0) === "#") {
                  m = r.split("");
                  return (r.length > 4)
                         ? { r: i(m[1] + m[2], 16), g: i(m[3] + m[4], 16), b: i(m[5] + m[6], 16), a: 1 }
                         : { r: i(m[1] + m[1], 16), g: i(m[2] + m[2], 16), b: i(m[3] + m[3], 16), a: 1 };
                }
                if (r in this._name) { // r = "violet"
                  return (name === "transparent") ? H(this._name[r], 0) : H(this._name[r], 1);
                }
                m = r.match(/rgba\(([\w\.%]+),([\w\.%]+),([\w\.%]+),([0-9\.]+)\)/);
                if (m) {
                  return { r: D(m[1]), g: D(m[2]), b: D(m[3]), a: f(m[4]) };
                }
                m = r.match(/rgb\(([\w\.%]+),([\w\.%]+),([\w\.%]+)\)/);
                if (m) {
                  return { r: D(m[1]), g: D(m[2]), b: D(m[3]), a: 1 };
                }
                break;
              default:
                if ("r" in r) { return uu.mix({}, r); } // RGBAHash clone
                if ("h" in r) { return this.hsva2rgba(r); } // HSVAHash to RGBAHash
              }
              return r;
            },
  // uu.module.color.coffee - return "#ffffff" style color
  coffee:   function(r, g, b) { // r = Number( Red ) or RGBAHash or HSVAHash
              if (uu.isN(r)) { return "#" + [this._d2h[r], this._d2h[g], this._d2h[b]].join(""); }
              ("h" in r) && (r = uu.mix({}, this.hsva2rgba(r))); // hsva to rgba + clone
              return "#" + [this._d2h[r.r], this._d2h[r.g], this._d2h[r.b]].join("");
            },
  // uu.module.color.rgb - return "rgb(0,0,0)" style color
  rgb:      function(r, g, b) { // r = Number( Red ) or RGBAHash or HSVAHash
              if (uu.isN(r)) { return "rgb(" + [r, g, b].join(",") + ")"; }
              ("h" in r) && (r = uu.mix({}, this.hsva2rgba(r))); // hsva to rgba + clone
              return "rgb(" + [r.r, r.g, r.b].join(",") + ")";
            },
  // uu.module.color.rgba - return "rgba(0,0,0,0)" style color
  rgba:     function(r, g, b, a) { // r = Number( Red) or RGBAHash or HSVAHash
              if (uu.isN(r)) { return "rgba(" + [r, g, b, a].join(",") + ")"; }
              ("h" in r) && (r = uu.mix({}, this.hsva2rgba(r))); // hsva to rgba + clone
              return "rgba(" + [r.r, r.g, r.b, r.a].join(",") + ")";
            },
  // uu.module.color.complementary - return complementary-colors - 補色を返す
  complementary:
            function(hash) { // hash = RGBAHash or HSVAHash
              ("h" in hash) && (hash = uu.mix({}, this.hsva2rgba(hash))); // hsva to rgba + clone
              return { r: (hash.r ^ 0xff) + 1, g: (hash.g ^ 0xff) + 1,
                       b: (hash.b ^ 0xff) + 1, a: hash.a };
            },
  // uu.module.color.rgba2hsva - Convert RGBAHash to HSVAHash - RGBAHashをHSVAHashに変換
  rgba2hsva:
            function(rgba) {
              var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255, a = rgba.a,
                  max = Math.max(r, g, b), diff = max - Math.min(r, g, b),
                  h = 0, s = max ? uumr(diff / max * 100) : 0, v = uumr(max * 100); 
              if (!s) { return { h: 0, s: 0, v: v, a: a }; }

              h = (r === max) ? ((g - b) * 60 / diff) :
                  (g === max) ? ((b - r) * 60 / diff + 120)
                              : ((r - g) * 60 / diff + 240);
              return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: a }; // HSVAHash( { h:360, s:100, v:100, a:1.0 } )
            },
  // uu.module.color.hsva2rgba - Convert HSVAHash to RGBAHash - HSVAHashをRGBAHashに変換
  hsva2rgba: // hsva = HSVAHash
            function(hsva) {
              var h = (hsva.h === 360) ? 0 : hsva.h, s = hsva.s / 100, v = hsva.v / 100, a = hsva.a,
                  h60 = h / 60, matrix = h60 | 0, f = h60 - matrix;
              if (!s) { h = uumr(v * 255); return { r: h, g: h, b: h, a: a }; }

              function MATRIX() {
                var p = uumr((1 - s) * v * 255),
                    q = uumr((1 - (s * f)) * v * 255),
                    t = uumr((1 - (s * (1 - f))) * v * 255),
                    w = uumr(v * 255);
                switch (matrix) {
                  case 0: return { r: w, g: t, b: p, a: a };
                  case 1: return { r: q, g: w, b: p, a: a };
                  case 2: return { r: p, g: w, b: t, a: a };
                  case 3: return { r: p, g: q, b: w, a: a };
                  case 4: return { r: t, g: p, b: w, a: a };
                  case 5: return { r: w, g: p, b: q, a: a };
                }
                return { r: 0, g: 0, b: 0, a: a };
              }
              return MATRIX(); // RGBAHash( { r: 255, g: 255, b: 255, a: 1 } )
            },
  // uu.module.color.ratio - Set Hue, Saturation and Value - 色相(H), 彩度(S), 明度(V)を設定
  ratio:    function(hash, h /* = 0 */, s /* = 0 */, v /* = 0 */) { // hash = RGBAHash or HSVAHash // hsvには絶対値ではなく増減値を指定
              var rv = uu.mix({}, hash); // clone
              ("r" in hash) && (rv = this.rgba2hsva(rv)); // rgba to hsva
              rv.h += h, rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h; // 0～360に収まらなければ0～360に収まるように補正
              rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s; // 0以下は0に、100以上は100に補正
              rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v; // 0以下は0に、100以上は100に補正
              ("r" in hash) && (rv = this.hsva2rgba(rv)); // hsva to rgba
              return rv; // HSVAHash or RGBAHash
            },
  _dict:
"000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,ff00ffmagenta,"+
"880000maroon,888800olive,008800green,008888teal,000088navy,880088purple,696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,d3d3d3lightgrey,"+
"dcdcdcgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,778899lightslategray,b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,4b0082indigo,"+
"483d8bdarkslateblue,6a5acdslateblue,7b68eemediumslateblue,9370dbmediumpurple,f8f8ffghostwhite,00008bdarkblue,0000cdmediumblue,4169e1royalblue,"+
"1e90ffdodgerblue,6495edcornflowerblue,87cefalightskyblue,add8e6lightblue,f0f8ffaliceblue,191970midnightblue,00bfffdeepskyblue,87ceebskyblue,"+
"b0e0e6powderblue,2f4f4fdarkslategray,00ced1darkturquoise,afeeeepaleturquoise,f0ffffazure,008b8bdarkcyan,20b2aalightseagreen,48d1ccmediumturquoise,"+
"40e0d0turquoise,7fffd4aquamarine,e0fffflightcyan,00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgreen,7fff00chartreuse,adff2fgreenyellow,"+
"2e8b57seagreen,3cb371mediumseagreen,66cdaamediumaquamarine,98fb98palegreen,f5fffamintcream,006400darkgreen,228b22forestgreen,32cd32limegreen,"+
"90ee90lightgreen,f0fff0honeydew,556b2fdarkolivegreen,6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet,8a2be2blueviolet,"+
"dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorchid,ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,c71585mediumvioletred,"+
"bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,ffe4e1mistyrose,ff1493deeppink,db7093palevioletred,e9967adarksalmon,ffb6c1lightpink,fff0f5lavenderblush,"+
"cd5c5cindianred,f08080lightcoral,f4a460sandybrown,fff5eeseashell,dc143ccrimson,ff6347tomato,ff7f50coral,fa8072salmon,ffa07alightsalmon,ffdab9peachpuff,"+
"ffffe0lightyellow,B22222firebrick,ff4500orangered,ff8c00darkorange,ffa500orange,ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown,"+
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhaki,fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,"+
"eee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,ffe4c4bisque,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,f5deb3wheat,"+
"faebd7antiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory,000000transparent" // transparent = rgba(0, 0, 0, 0)
};

/** Effect
 *
 * @class
 *
 * @note element.uuEffectKeptCssText: アニメーション開始時に(keep: trueなら)cssTextを保存する独自プロパティ
 *       revert: true 指定時に uuEffectKeptCssText の値を元にスタイルを復元する。
 *       復元後は、uuEffectKeptCssText = "" に設定されるがプロパティ自体は存在する。
 * @note element.uuEffectRunning エフェクト実行中の要素に追加される独自プロパティ, エフェクト実行済みならfalseになる
 *       エフェクト未実行の要素は、uuEffectRunningプロパティ自体が存在しない。
 */
uu.module.effect = uu.klass.singleton();
uu.module.effect.prototype = {
  speed:    { now: 1, quick: 250, fast: 400, mid: 600, slow: 2000 },
  construct:
            function() {
              this._vtm = new uu.module.virtualTimer(10);
              this._defaultSpeed = this.speed.mid;
              // リソースを抱えている要素と開放用関数の一覧
              this._hasResourceElement = [ /* [Element: deleteResourceFunction], ... */ ];
            },
  setDefaultSpeed:
            function(speed) {
              this._defaultSpeed = (speed in this.speed) ? this.speed[speed] : uupi(speed);
            },
  // リソースの開放
  diet:     function() {
              this._vtm.diet();
              this._hasResourceElement.forEach(function(v) {
                v[1](v[0]);
              });
              this._hasResourceElement = [];
            },
  fade:     function(elm, param /* = { speed, fn, begin: 1, end: 0, keep: false, revert: false } */) {
              var pp = this._prepare(elm, uu.mix.param(param || {}, { begin: 1, end: 0 }));
              uu.css.show(elm);
              this._fade(elm, pp.revert, pp.speed, pp.fn, pp.begin, pp.end);
            },
  move:     function(elm, param /* = { speed, fn, pos: 0, keep: false, revert: false } */) {
              var pp = this._prepare(elm, uu.mix.param(param || {}, { pos: 0 })), x = 0, y = 0,
                  rect = uu.css.show(elm, 1), vp = uu.viewport.rect();
              if (!uu.isN(pp.pos)) {
                x = pp.pos.x, y = pp.pos.y;
              } else {
                function F(patt, pos, top, mid, low) {
                  var rv = patt.charAt(pos);
                  return rv === "T" ? top : rv === "M" ? mid : low;
                }
                x = F("MMLLLMTTT", pp.pos, 0, (vp.w - rect.w) / 2, vp.w - rect.w);
                y = F("MTTMLLLMT", pp.pos, 0, (vp.h - rect.h) / 2, vp.h - rect.h);
              }
              this._move(elm, pp.revert, pp.speed, pp.fn, x, y);
            },
  scale:    function(elm, param /* = { speed, fn, anchor: 0, w: 0, h: 0, keep: false, revert: false } */) {
              var pp = this._prepare(elm, uu.mix.param(param || {}, { anchor: 0, w: 0, h: 0 }));
              uu.css.show(elm);
              this._scale(elm, pp.revert, pp.speed, pp.fn, pp.anchor, pp.w, pp.h);
            },
  bullet:   function(elm, param /* = { speed, fn, x: 0, y: 0, w: 120, h: 30, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, uu.mix.param(param || {}, { x: 0, y: 0, w: 120, h: 30 })),
                  rect = uu.css.show(elm, 1), d = 800 / (pp.speed / 10),
                  x = rect.x, y = rect.y, w = rect.w, h = rect.h, dx, dy, dw, dh,
                  es = elm.style, vtid = 0, job = 0;
              function FIN() { me._vtm.unset(vtid); me._revert(elm, pp.revert); pp.fn(elm); }
              dx = (x === pp.x) ? 0 : (x > pp.x) ? -d : d;
              dy = (y === pp.y) ? 0 : (y > pp.y) ? -d : d;
              dw = (w === pp.w) ? 0 : (w > pp.w) ? -d : d;
              dh = (h === pp.h) ? 0 : (h > pp.h) ? -d : d;
              if (x !== pp.x) { job |= 0x1; }
              if (y !== pp.y) { job |= 0x2; }
              if (w !== pp.w) { job |= 0x4; }
              if (h !== pp.h) { job |= 0x8; }

              function loop() {
                if (!job) { FIN(); return; }
                if (job & 0x1) {
                  x += dx;
                  if ((dx < 0 && x <= pp.x) || (dx > 0 && x >= pp.x)) { x = pp.x, job &= 0xE; } // 0xe: 1110
                  es.left = x + "px";
                }
                if (job & 0x2) {
                  y += dy;
                  if ((dy < 0 && y <= pp.y) || (dy > 0 && y >= pp.y)) { y = pp.y, job &= 0xD; } // 0xd: 1101
                  es.top = y + "px";
                }
                if (job & 0x4) {
                  w += dw;
                  if ((dw < 0 && w <= pp.w) || (dw > 0 && w >= pp.w)) { w = pp.w; job &= 0xB; } // 0xb: 1011
                  es.width = w + "px";
                }
                if (job & 0x8) {
                  h += dh;
                  if ((dh < 0 && h <= pp.h) || (dh > 0 && h >= pp.h)) { h = pp.h, job &= 0x7; } // 0x7: 0111
                  es.height = h + "px";
                }
              }
              vtid = this._vtm.set(loop, 10, 800);
            },
  puff:     function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, param), run = 0, rect = uu.css.show(elm, 1);
              function next() { if (++run >= 2) { me._revert(elm, pp.revert); pp.fn(elm); } }
              this._scale(elm, 0, pp.speed, next, 0, rect.w * 2.5, rect.h * 2.5);
              this._fade(elm, 0, uumr(pp.speed / 4), next, uu.css.opacity(elm), 0);
            },
  fold:     function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, param), run = 0, rect = uu.css.show(elm, 1);
              function next() {
                switch (++run) {
                case 1: me._scale(elm, 0, pp.speed, next, 8, 0, 20); break;
                case 2: me._scale(elm, 0, pp.speed, next, 8, 0,  0); break;
                case 3: uu.css.set(elm, { visibility: "hidden" }); // IE用
                        me._revert(elm, pp.revert); pp.fn(elm);
                }
              }
              this._scale(elm, 0, pp.speed, next, 8, rect.w, 20);
            },
  shake:    function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, param), run = 0, rect = uu.css.show(elm, 1);
              function next() {
                switch (++run) {
                case 1: me._move(elm, 0, uumr(pp.speed / 2), next, rect.x + 20, rect.y); break;
                case 2: me._move(elm, 0, uumr(pp.speed / 2), next, rect.x - 20, rect.y); break;
                case 3: me._move(elm, 0, uumr(pp.speed / 2), next, rect.x,      rect.y); break;
                case 4: me._revert(elm, pp.revert); pp.fn(elm);
                }
              }
              this._move(elm, 0, uumr(pp.speed / 2), next, rect.x - 20, rect.y);
            },
  shrink:   function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              this.scale(elm, uu.mix(param, { anchor: 0, w: 0, h: 0 }));
            },
  glow:     function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var pp = this._prepare(elm, param), rect = this._rect(elm);
              uu.css.rebound(elm, { x: rect.x + uumr(rect.w / 2), y: rect.y + uumr(rect.h / 2), w: 1, h: 1 });
              this._scale(elm, pp.revert, pp.speed, pp.fn, 0, rect.w, rect.h);
            },
  slideUp:  function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, param), rect = uu.css.show(elm, 1);
              function next() {
                uu.css.hide(elm);
                uu.css.setRect(elm, rect);
                me._revert(elm, pp.revert);
                pp.fn(elm);
              }
              this._scale(elm, 0, pp.speed, next, 8, rect.w, 1);
            },
  slideDown:
            function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var pp = this._prepare(elm, param), rect = this._rect(elm);
              uu.css.rebound(elm, { x: rect.x, y: rect.y, h: 1 });
              this._scale(elm, pp.revert, pp.speed, pp.fn, 8, rect.w, rect.h);
            },
  pulsate:  function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var me = this, pp = this._prepare(elm, param), run = 0, opa;
              uu.css.show(elm);
              opa = uu.css.opacity(elm);
              function next() {
                switch (++run) {
                case 1: me._fade(elm, 0, Math.ceil(pp.speed / 4), next, 0.0, 1.0); break;
                case 2: me._fade(elm, 0, Math.ceil(pp.speed / 4), next, 1.0, 0.0); break;
                case 3: me._fade(elm, 0, Math.ceil(pp.speed / 4), next, 0.0, 1.0); break;
                case 4: me._fade(elm, 0, Math.ceil(pp.speed / 4), next, 1.0, 0.0); break;
                case 5: me._fade(elm, 0, Math.ceil(pp.speed / 4), next, 0.0, opa); break;
                case 6: me._revert(elm, pp.revert); pp.fn(elm);
                }
              }
              this._fade(elm, 0, Math.ceil(pp.speed / 4), next, opa, 0.0);
            },
  dropOut:  function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var R = this._revert, pp = this._prepare(elm, param), run = 0, rect = uu.css.show(elm, 1);
              function next() { (++run === 2) && (R(elm, pp.revert), pp.fn(elm)); }
              this._move(elm, 0, pp.speed, next, rect.x, rect.y + 200);
              this._fade(elm, 0, uumr(pp.speed / 4), next, uu.css.opacity(elm), 0);
            },
  _core:    function(delay, fn) {
              var me = this, stop = 0, vtid = 0;
              function finish() { !stop++ && (me._vtm.unset(vtid), fn(4)); }
              function loop() { (!stop && fn(1) && fn(2)) ? 0 : finish(); }
              fn(0);
              vtid = this._vtm.set(loop, delay);
            },
  _prepare: function(elm, param) {
              var rv = uu.mix.param(param, { fn: uu.mute, speed: this._defaultSpeed, keep: 0, revert: 0 });
              uu.mix.param(elm, { uuEffectKeptCssText: "", uuEffectRunning: 0 });
              rv.keep && (elm.uuEffectKeptCssText = elm.style.cssText);
              ++elm.uuEffectRunning;
              elm.style.overflow = "hidden";
              rv.speed = (rv.speed in this.speed) ? this.speed[rv.speed] : uupi(rv.speed);
              return rv;
            },
  _revert:  function(elm, revert) {
              if (revert) {
                elm.style.cssText = elm.uuEffectKeptCssText;
                elm.uuEffectKeptCssText = "";
              }
              (--elm.uuEffectRunning <= 0) && (elm.uuEffectRunning = 0);
            },
  _rect:    function(elm) {
              if (uu.css.get(elm, "display") === "none") { // display:noneならelm.styleから取得
                return { x: uupf(elm.style.left || 0),  y: uupf(elm.style.top || 0),
                         w: uupf(elm.style.width || 0), h: uupf(elm.style.height || 0) };
              }
              return uu.css.rect(elm);
            },
  _fade:    function(elm, revert, speed, fn, begin, end) { // fade - from begin to end
              var R = this._revert, delta = 1 / (speed / 10), opa = begin, out = (begin > end) ? 1 : 0;
              function loop(step) {
                switch (step) {
                case 1: return opa !== end;
                case 2: if (out) { ((opa -= delta) < end) && (opa = end); }
                            else { ((opa += delta) > end) && (opa = end); }
                        uu.css.setOpacity(elm, opa); break;
                case 4: R(elm, revert); fn(elm);
                }
                return true;
              }
              this._core(10, loop);
            },
  _move:    function(elm, revert, speed, fn, x, y) { // x, yは絶対座標で指定
              var R = this._revert, deltaBase = 500 / (speed / 10), rect = uu.css.rect(elm),
                  delta = { x: (rect.x === x) ? 0 : (rect.x > x) ? -deltaBase : deltaBase,
                            y: (rect.y === y) ? 0 : (rect.y > y) ? -deltaBase : deltaBase };
              function FIN() { R(elm, revert); fn(elm); }
              if (rect.x === x && rect.y === y) { FIN(); return; }
              function loop(step) {
                switch (step) {
                case 1: return (!delta.x && !delta.y) ? false : true;
                case 2: rect.x += delta.x, rect.y += delta.y;
                        if ((delta.x < 0 && rect.x <= x) || (delta.x > 0 && rect.x >= x)) {
                          rect.x = x, delta.x = 0;
                        }
                        if ((delta.y < 0 && rect.y <= y) || (delta.y > 0 && rect.y >= y)) {
                          rect.y = y, delta.y = 0;
                        }
                        uu.css.setRect(elm, { x: rect.x, y: rect.y });
                        break;
                case 4: FIN();
                }
                return true;
              }
              this._core(10, loop);
            },
  _scale:   function(elm, revert, speed, fn, anchor, w, h) {
              var R = this._revert, deltaBase = 500 / (speed / 10), rect = uu.css.rect(elm),
                  delta = { x: 0, w: (rect.w === w) ? 0 : (rect.w > w) ? -deltaBase : deltaBase,
                            y: 0, h: (rect.h === h) ? 0 : (rect.h > h) ? -deltaBase : deltaBase },
                  dw2 = delta.w / 2, dh2 = delta.h / 2;
              function FIN() { R(elm, revert); fn(elm); }
              if (rect.w === w && rect.h === h) { FIN(); return; }

              switch (anchor) {
              case 0: delta.x -= dw2;     delta.y -= dh2; break;
              case 1:                     delta.w && (delta.x = -dw2); break;
              case 2: delta.x -= delta.w; break;
              case 3: delta.x -= delta.w; delta.h && (delta.y = -dh2); break;
              case 4: delta.x -= delta.w; delta.y -= delta.h; break;
              case 5: delta.y -= delta.h; delta.w && (delta.x = -dw2); break;
              case 6: delta.y -= delta.h; break;
              case 7:                     delta.h && (delta.y = -dh2); break;
              }
              function loop(step) {
                switch (step) {
                case 1: return (!delta.x && !delta.y && !delta.w && !delta.h) ? false : true;
                case 2: rect.x += delta.x, rect.y += delta.y, rect.w += delta.w, rect.h += delta.h;
                        if ((delta.w < 0 && rect.w <= w) || (delta.w > 0 && rect.w >= w)) {
                          rect.w = w, delta.x = 0, delta.w = 0;
                        }
                        if ((delta.h < 0 && rect.h <= h) || (delta.h > 0 && rect.h >= h)) {
                          rect.h = h, delta.y = 0, delta.h = 0;
                        }
                        uu.css.setRect(elm, rect, 1);
                        break;
                case 4: FIN();
                }
                return true;
              }
              this._core(10, loop);
            }
};

/** Friendly Data Container
 *
 * @class
 */
uu.module.fdc = uu.klass.kiss();
uu.module.fdc.prototype = {};

/** Skin
 *
 * @class
 */
uu.module.skin = {};

/** Configuration
 *
 * @class
 */
uu.module.config = uu.klass.singleton();
uu.module.config.prototype = {
  construct:
            function() {
              uu.mix(this, {
                basePath:   uu.url.base(),
                modulePath: "{BASE},{BASE}mini/",
                imagePath:  "{BASE}img/",
                repair:     0x1,
                debug:      0x0,
                module:     "",
                cacheID:    0, // uu.id cache
                cacheXPath: 1, // uu.css cache
                backCompat: 0
              });
            },
  // uu.module.config.importFromQueryString
  importFromQueryString:
            function() {
              var e = uu.id("uupaa.js"), rv = {};
              if (e && e.src.indexOf("?") !== -1) {
                rv = uu.url.query(e.src.slice(e.src.indexOf("?") + 1));
                if ("basePath"   in rv) { this.basePath   = rv.basePath;         }
                if ("modulePath" in rv) { this.modulePath = rv.modulePath;       }
                if ("imagePath"  in rv) { this.imagePath  = rv.imagePath;        }
                if ("repair"     in rv) { this.repair     = uupi(rv.repair);     }
                if ("debug"      in rv) { this.debug      = uupi(rv.debug);      }
                if ("module"     in rv) { this.module     = rv.module;           }
                if ("cacheID"    in rv) { this.cacheID    = uupi(rv.cacheID);    }
                if ("cacheXPath" in rv) { this.cacheXPath = uupi(rv.cacheXPath); }
                if ("backCompat" in rv) { this.backCompat = uupi(rv.backCompat); }
              }
              this.modulePath = this.modulePath.replace(/\{BASE\}/g, this.basePath);
              this.imagePath  = this.imagePath.replace(/\{BASE\}/g, this.basePath);
            },
  // uu.module.config.load
  load:     function() {
              // --- load module ---
              if (this.module.length) {
                uu.module("", this.module);
                this.module = "";
              }
              // --- load FirebugLite ---
              (!uu.ua.gecko && this.debug & 0x2) && this._loadFirebugLite();
            },
  _loadFirebugLite:
            function() {
              if (uuw.firebug) { return; } // duplicate load
              uu.ready(function() {
                uuw.firebug = uud.createElement('script');
                firebug.setAttribute("src", "http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js");
                uud.body.appendChild(firebug);
                (function() {
                  if (uuw.pi && uuw.firebug) {
                    uuw.firebug.init();
                  } else {
                    setTimeout(arguments.callee);
                  }
                })();
              }, "D");
            }
};

// --- Initialize and Instantiate ---
// System global instance
uu.url          = new uu.module.url();
uu.vtmHighSpeed = new uu.module.virtualTimer(10);
uu.vtmMidSpeed  = new uu.module.virtualTimer(100);
uu.vtmLowSpeed  = new uu.module.virtualTimer(250);
uu.msg          = new uu.module.messagePump();
uu.customEvent  = new uu.module.customEvent();
uu.agent        = new uu.module.agent();
uu.imageset     = new uu.module.imageset();
uu.color        = new uu.module.color();
uu.effect       = new uu.module.effect();
uu.config       = new uu.module.config();

uu.ready(function() { uu.msg.post(0, UU.MSG_CHANGE_READY_STATE, "D"); }, "D");
uu.ready(function() { uu.msg.post(0, UU.MSG_CHANGE_READY_STATE, "W"); }, "W");
uu.ready(function() { uu.msg.post(0, UU.MSG_CHANGE_READY_STATE, "C"); }, "C");
uu.config.importFromQueryString();
uu.config.load();

})(); // end (function())()

