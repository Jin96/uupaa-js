/** Tip Module
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu, UU = uuw.UU;

uu.module.tip = {};

// over ride
uu._impl = function(expr, context) {
  return new uu.tip(expr, context);
};

/*
item(n);
size();
mix(flavor);
forEach(fn);
filter(fn);
every(fn);
some(fn);
map(fn);
indexOf(search,start=0)
text(n);
html(n);
value(n);
attr(attr, n);
css(cssProp, n);

setText(text, n);
setHTML(html, n);
setValue(val, n);
setAttr(attrHash, n);
setCSS(cssPropHash, n);
addClass(className, fn);
hasClass(className, fn);
removeClass(className, fn);
toggleClass(className, fn);
domReady(fn);

size()が変動する可能性のある操作を行うと自動的にstackを生成する。
stackはpop()で戻れる
 */

/** Tip
 *
 * @class
 */
uu.tip = uu.klass.generic();
uu.tip.growth = uu.tip.prototype = {
  construct: function(expr, context) {
    return uu.mix(this, { _stack: [], _item: expr ? this._q(expr, context) : [] });
  },
  push: function() {
    this._stack.push(this._item);
    return this;
  },
  pop: function() {
    this._item = this._stack.pop() || [];
    return this;
  },
  _q: function(expr, context) {
    var rv = [], ex = expr, ctx = context, r;
    function F(ary) { if (!ary || !ary.length) { return; }
                      var i = 0, sz = ary.length;
                      for (rv = Array(sz); i < sz; ++i) { rv[i] = ary[i]; }
                    }
    if (typeof ex === "string") { // uu("the selector")
      r = ex.substring(1);        // r = "he selector"
      switch (ex.charAt(0)) {                                 // Sugar              -> None sugar
      case "#": rv.push(uu.id(r)); break;                     // uu("#id")          -> uu.id(id);
      case ".": F(uu.klass(r, ctx)); break;                   // uu(".class")       -> uu.klass(class, ctx);
      case "*": F(uu.tag("*", ctx)); break;                   // uu("*")            -> uu.tag("*", ctx)
      case "@": F(uu.attr(ex, ctx)); break;                   // uu("@attr=value")  -> uu.attr("@attr=value", ctx)
      case "x": F(uu.xpath.snap(r, ctx)); break;              // uu("x//input")     -> uu.xpath.snap("//input", ctx);
      case ":": F(uu.css.pseudo(ex, ctx)); break;             // uu(":checked")     -> uu.css.pseudo(":checked", ctx)
      case "<": rv.push(uu.dom.substance(ex));                // uu("<div><p>Hello</p></div>")    -> create element ...
                uu.isE(ctx) && ctx.appendChild(rv[0]); break; // uu("<div></div>", document.body) -> document.body.appendChild(create element ...)
      case "|": rv.push(uud.createTextNode(r));               // uu("|new text")                  -> createTextNode("new text")
                uu.isE(ctx) && ctx.appendChild(rv[0]); break; // uu("|new text", document.body)   -> document.body.appendChild(createTextNode("new text"))
      default:  (/^[a-z]+$/i.test(ex)) ? F(uu.tag(ex, ctx))   // uu("span")         -> uu.tag("span");
                                       : F(uu.css(ex, ctx));  // uu("div > a")      -> uu.css("div > a");
      }
    } else if (ex === uuw || ex.nodeType) {                   // window or HTMLElement -> uu(node)
      rv.push(ex);
    } else if (uu.isA(ex)) {                                  // [element, ...] -> uu([element, ...])
      rv = uu.mix([], ex);
    } else if (ex instanceof uu.tip) {                        // uu(uu("*"))    -> copy constructor
      rv = uu.mix([], ex._item), this._stack = uu.mix([], ex._stack); // clone Element
    } // else if (uu.isF(ex)) { uu.dom.ready(ex); }
    return rv;
  },
  // 全itemにfn.apply(item, [item, index, this.item])を適用し...配列を返す, fn内部のthisはitem
  _iter: function(fn, method) {
    return this._item[method](function(item, index, ary) {
      return fn.apply(item, [item, index, ary]);
    });
  }
};

uu.mix(uu.tip.prototype, {
  /** itemをcontextとし、exprでさらに絞り込む */
  pick: function(expr) {
    if (expr) {
      var rv = [], me = this.push();
      this._item.forEach(function(e) { rv = rv.concat(me._q(expr, e)); });
      this._item = rv; // switch
    }
    return this;
  },
  // --- item manipulation ---
  /** item[n]を取得, nを省略すると全itemを取得, 要素がなければundefinedを返す */
  item: function(n /* = undefined */) {
    return (n === void 0) ? this._item : this._item[n];
  },
  /** itemサイズを取得 */
  size: function() {
    return this._item.length;
  },
  /** itemにflavorをミックス, ++stack */
  mix: function(flavor) {
    this.push();
    uu.mix(this._item, flavor);
    return this;
  },
  // --- item iteration ---
  /** 全itemにfn.apply(item, [item, index, this.item])を適用, fn内部のthisはitem */
  forEach: function(fn) {
    this._item.forEach(function(item, index, ary) {
      fn.apply(item, [item, index, ary]);
    });
    return this;
  },
  /** 全itemにfn.apply(item, [item, index, this.item])を適用し結果が真の要素を配列で返す, fn内部のthisはitem */
  filter: function(fn) { return this._iter(fn, "filter"); },
  /** 全itemにfn.apply(item, [item, index, this.item])を適用し全て真ならtrue,偽があればループを中断しfalseを返す, fn内部のthisはitem */
  every: function(fn) { return this._iter(fn, "every"); },
  /** 全itemにfn.apply(item, [item, index, this.item])を適用し全て偽ならfalse,真があればループを中断しtrueを返す, fn内部のthisはitem */
  some: function(fn) { return this._iter(fn, "some"); },
  /** 全itemにfn.apply(item, [item, index, this.item])を適用し結果を返す, fn内部のthisはitem */
  /** 返す結果はtipインスタンスではなく、fnの戻り値の配列となる */
  map: function(fn) { return this._iter(fn, "map"); },
  // --- item search ---
  /** elmと一致するitemのArrayIndexを返す, 開始位置はstartで指定する */
  indexOf: function(elm, start /* = 0 */) {
    return this._item.indexOf(elm, start || 0);
  },
  // --- getter ---
  /** テキストの取得 */
  text: function(n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return e.innerText; })
                          : this._item[n].innerText;
  },
  /** HTMLの取得 */
  html: function(n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return e.innerHTML; })
                          : this._item[n].innerHTML;
  },
  /** value属性の取得 */
  value: function(n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return e.value; })
                          : this._item[n].value;
  },
  /** item[n]のattrを取得, nを省略すると全itemのattrを配列で取得 ["value1", "value2", ...] */
  attr: function(attr, n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return uu.attr.get(e, attr); })
                          : uu.attr.get(this._item[n], attr);
  },
  /** item[n]のcssPropを取得, nを省略すると全itemのcssPropをHashで取得 [ hash1, hash2, ... ] */
  css: function(cssProp, n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return uu.attr.get(e, cssProp); })
                          : uu.attr.get(this._item[n], cssProp);
  },
  // --- setter ---
  /** テキストを設定 */
  setText: function(text, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { e.innerText = text; })
                   : this._item[n].innerText = text;
    return this;
  },
  /** HTMLを設定 */
  setHTML: function(html, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { e.innerHTML = html; })
                   : this._item[n].innerHTML = html;
    return this;
  },
  /** value属性を設定 */
  setValue: function(val, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { e.value = val; })
                   : this._item[n].value = val;
    return this;
  },
  /** item[n]にHash( { attr: value, ... } )を設定, nを省略すると全itemに設定 */
  setAttr: function(attrHash, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { uu.attr.set(e, attrHash); })
                   : uu.attr.set(this._item[n], attrHash);
    return this;
  },
  /** item[n]にcssPropHash( { cssProp: value, ... } )を設定, nを省略すると全itemに設定 */
  setCSS: function(cssPropHash, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { uu.css.set(e, cssPropHash); })
                   : uu.css.set(this._item[n], cssPropHash);
    return this;
  },
  // --- className ---
  /** item[n]にクラス名を追加, nを省略すると全itemに追加 */
  addClass: function(className, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { uu.klass.add(e, className); })
                   : uu.klass.add(this._item[n], className);
    return this;
  },
  /** item[n]にclassNameがあればtrue, nを省略すると全itemの結果を配列で取得 */
  hasClass: function(className, n /* = undefined */) {
    return (n === void 0) ? this._item.map(function(e) { return uu.klass.has(e, className); })
                          : uu.klass.has(this._item[n], className);
  },
  /** item[n]からクラス名を削除, nを省略すると全itemから削除 */
  removeClass: function(className, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { uu.klass.remove(e, className); })
                   : uu.klass.remove(this._item[n], className);
    return this;
  },
  /** クラス名を追加または削除する */
  toggleClass: function(className, n /* = undefined */) {
    (n === void 0) ? this._item.forEach(function(e) { uu.klass.toggle(e, className); })
                   : uu.klass.toggle(this._item[n], className);
    return this;
  },
  insert: function(elm /* Node or <html> or "text" */, pos /* = UU.LC */, n /* = undefined */) {
    pos = pos || UU.LC;
    function E(e) {
      if (!uu.isS(e)) { return e; }
      var c = e.charAt(0);
      if (c === "<") { return uu.dom.substance(e); }                // "<div></div>" -> element node("div")
      return uud.createTextNode((c === "|") ? e.substring(1) : e);  // "text" or "|text" -> text node("new text")
    }
    function F(ctx) { (!ctx.firstChild) ? ctx.appendChild(E(elm)) : ctx.insertBefore(E(elm), ctx.firstChild); }
    function L(ctx) { ctx.appendChild(E(elm)); }
    function X(e)   { if (e.nodeType !== 1) { return; }
                      switch (pos) {
                      case UU.F:  F(e.parentNode); break;
                      case UU.L:  L(e.parentNode); break;
                      case UU.FC: F(e); break;
                      case UU.LC: L(e); break;
                      }
                    }
    (n === void 0) ? this._item.forEach(X) : X(this._item[n]);
/*
    uu.msgpump.post(0, UU.MSG_EVENT_DOM_MANIP, {
      from: "uu.module.tip", to: "", cc: "", subject: "insert",
      time: (new Date()).getTime()
    });
 */
    uu.msgpump.post(0, UU.MSG_EVENT_DOM_MANIP);
    return this;
  },
/*
  remove: function() {
    this._item.forEach(function(e) { e.parentNode.removeChild(e); });
    return this;
  },
  empty: function() {
    this._item.forEach(function(e) { e.innerHTML = ""; });
    return this;
  },
 */
  // --- ready ---
  domReady: function(fn) {
    uu.dom.ready(fn);
  }
});

})(); // end (function())()
