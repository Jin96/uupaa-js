/** jQuery like SyntaxSugar Module
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

/** jQuery like SyntaxSugar
 *
 * @class
 */
uu.module.jqss = uu.klass.generic();
uu.module.jqss.prototype = {
  stack: [],
  elm: [], // 抱えている要素
  rollback: 0, // end()の戻り先
  construct: function(expr, context) {
    return this._q(expr, context);
  },
  _q: function(expr, context) {  
    if (!expr) { return this; }
    var me = this, ctx = context, c, r;
    function F(ary) { if (!ary || !ary.length) { return; }
                      var i = 0, sz = ary.length;
                      for (me.elm = Array(sz); i < sz; ++i) { me.elm[i] = ary[i]; }
                    }
    if (typeof expr === "string") { // uu("the selector")
      c = expr.charAt(0), r = expr.substring(1);
      this._push();
      switch (c) { // first char
      case "#": this.elm.push(uu.id(r)); break;               // uu.id("id");
      case ".": F(uu.klass(r, ctx)); break;                   // uu.klass("class", ctx);
      case "*": F(uu.tag("*", ctx)); break;                   // uu.tag("*", ctx)
      case "@": F(uu.attr("*[" + expr + "]", ctx)); break;    // uu.attr("*[@attr=...]", ctx)
      case ":": F(uu.css.pseudo(expr, ctx)); break;           // uu.css.pseudo(":...", ctx)
      case "x": F(uu.xpath.snap(r, ctx)); break;              // uu.xpath.snap("//input", ctx);
      default:  (/[a-z]/i.test(expr)) ? F(uu.tag(expr, ctx))  // uu.tag("span");
                                      : F(uu.css(expr, ctx)); // uu.css("E > F");
      }
      return this;
    } else if (expr.nodeType || expr === uuw || expr === uud) { // uu(node)
      this._push(); this.elm.push(expr);
    } else if (uu.isA(expr)) {                                // uu([node, node, node])
      this._push(); this.elm = uu.mix([], expr);              // clone ElemenetArray
    } else if (expr instanceof uu.module.jqss) {              // copy constructor // uu(uu("*"))
      this._push(); this.elm = uu.mix([], expr.elm);          // clone Element
    } else if (uu.isF(expr)) { uu.dom.ready(expr); }
    return this;
  },
  /** push stack */
  _push: function() {
    this.stack.push(this.elm);
    this.elm = [];
  },
  /** pop stack */
  _pop: function() {
    this.elm = this.stack.pop() || [];
  }
};

uu.mix(uu.module.jqss.prototype, {
  jquery: "1.1.99",

  browser: {
    version: uu.ua.version,
    safari: uu.ua.webkit,
    opera: uu.ua.opera,
    msie: uu.ua.ie,
    mozilla: uu.ua.gecko
  },
  extend: function(/* ... */) {
    if (arguments.length === 1) {
      return uu.mix(this, arguments[0]);
    }
    var base = arguments[0], i = 1, sz = arguments.length;
    for (; i < sz; ++i) {
      uu.mix(base, arguments[i]);
    }
    return base;
  },
  ready: function(fn) { uu.dom.ready(fn); },
  size: function() {
    return this.elm.length;
  },
  get: function(num /* = undefined */) {
    return (num === void 0) ? this.elm : this.elm[num];
  },
  each: function(fn /*, ... */) {
    var arg = uu.toArray(arguments, 1);
    if (arg.length) {
      this.elm.forEach(function(e) { fn.apply(e, arg); });
    } else {
      this.elm.forEach(function(e, i) { fn.apply(e, [i, e]); });
    }
    return this;
  },
  map: function(fn) {
    return this.elm.map(fn);
  },
  index: function(elm, start /* = 0 */) {
    return this.elm.indexOf(elm, start || 0);
  },
  bind: function(type, fn) {
    if (uu.ua.ie) {
      var funcs = [], f;
      this.elm.forEach(function(e) {
        funcs.push(f = function(event) { fn.call(e, event); });
        uu.event.set(e, type, f);
      });
      return this;
    }
    this.elm.forEach(function(e) { uu.event.set(e, type, fn); });
    return this;
  },
  unbind: function(type, fn) {
    this.elm.forEach(function(e) { uu.event.unset(e, type, fn); });
    return this;
  },
//  one: function() {},
/*
  trigger: function(type) {
    this.elm.forEach(function(e) { ... });
    return this;
  },
 */
  /** 属性の取得と設定
   * attr(key)は''先頭''要素の属性値keyを取得
   * attr(key, value)とattr(Hash)は全要素に属性を設定
   */
  attr: function(key /* or Hash */, value /* = undefined */) {
    if (uu.isS(key) && value === void 0) { return uu.attr.get(this.elm[0], key); }
    if (uu.isS(key) && uu.isS(value)) { key = uu.pair(key, value); }
    this.elm.forEach(function(e) { uu.attr.set(e, key); });
    return this;
  },
  addClass: function(className) {
    this.elm.forEach(function(e) { uu.klass.add(e, className); });
  },
  removeClass: function(className) {
    this.elm.forEach(function(e) { uu.klass.remove(e, className); });
  },
  toggleClass: function(className) {
    this.elm.forEach(function(e) { uu.klass.toggle(e, className); });
  },
  // get, set
  text: function(str /* = undefined */) {
    if (uu.isS(str)) {
      this.elm.forEach(function(e) { e.innerText = str; });
      return this;
    }
    var rv = "";
    this.elm.forEach(function(e) { rv += e.innerText; });
    return rv;
  },
  // getFirstElement, setAllElements
  html: function(str /* = undefined */) {
    if (uu.isS(str)) {
      this.elm.forEach(function(e) { e.innerHTML = str; });
      return this;
    }
    return this.elm[0].innerHTML;
  },
  // getFirstElement, setAllElements
  val: function(value /* = undefined */) {
    if (value === void 0) {
      this.elm.forEach(function(e) { e.value = value; });
    }
    return this.elm[0].value;
  },
  remove: function() {
    this.elm.forEach(function(e) { e.parentNode.removeChild(e); });
    return this;
  },
  empty: function() {
    this.elm.forEach(function(e) { e.innerHTML = ""; });
    return this;
  },
  append: function(node /* or HTMLString */) {
    if (uu.isS(node)) {
      this.elm.forEach(function(e) { e.innerHTML += node; });
    }
    this.elm.forEach(function(e) { e.appendChild(node); });
    return this;
  },
  prepend: function(node /* or HTMLString */) {
    if (uu.isS(node)) {
      this.elm.forEach(function(e) { var s = e.innerHTML; e.innerHTML = node + s; });
    }
    this.elm.forEach(function(e) {
      (!e.firstChild) ? e.appendChild(node) : e.insertBefore(node, e.firstChild);
    });
    return this;
  },

//  before: function(node /* or HTMLString */) { },
//  after: function(node /* or HTMLString */) { },
//  appendTo: function(query) { },
//  prependTo: function(query) { },
//  insertBefore: function(query) { },
//  insertAfter: function(query) { },
//  remove: function(query) { },
//  clone: function() { },
//  wrap: function(node /* or HTMLString */) { },
//  end: function() { this._pop(); },
//  filter: function(query) { },
//  not: function(query) { },
//  find: function(query) { },
//  prev: function(query /* = undefined */) { },
//  next: function(query /* = undefined */) { },
//  children: function(query /* = undefined */) { },
//  parent: function(query /* = undefined */) { },
//  parents: function(query /* = undefined */) { },
//  siblings: function(query /* = undefined */) { },
//  contains: function(str) { },
//  add: function(query /* or node or [node, node, ...] */) { },

  // css(key) get first element style
  // css(key, value), css(Hash) set all element style
  css: function(key /* or Hash */, value /* = undefined */) {
    if (uu.isS(key) && value === void 0) { return uu.css.get(this.elm[0], key); }
    if (uu.isS(key) && uu.isS(value)) { key = uu.pair(key, value); }
    this.elm.forEach(function(e) { uu.css.set(e, key); });
    return this;
  },

//  show: function() {
//    this.elm.forEach(function(e) { uu.css.set.display(e, "show"); });
//  },
//  hide: function() {
//    this.elm.forEach(function(e) { uu.css.set.display(e, "hide"); });
//  },
//  toggle: function() {
//    this.elm.forEach(function(e) {
//      var hide = (uu.css.get.display(e) === "none" || uu.css.get(e, "visibility") === "hidden");
//      uu.css.set.display(e, hide ? "show" : "hide");
//    });
//  },
//  slideDown: function() { },
//  slideUp: function() { },
//  slideToggle: function() { },
//  fadeIn: function() { },
//  fadeOut: function() { },
//  fadeTo: function() { },
//  animate: function() {},
//  ready: function() {},
//  hover: function() {},
//  toggle: function() {},
//  load: function() {},
//  loadIfModified: function() {},
  fx: function() {}
});

window.jQuery = function() {
  return jQuery._impl.apply(this, arguments);
};
uu.mix(jQuery, {
  _impl: function(query, context) {
    return new uu.module.jqss(query, context);
  },
  fn: uu.module.jqss.prototype,
  browser: uu.module.jqss.prototype.browser,
  extend: uu.module.jqss.prototype.extend,
  fx: uu.module.jqss.prototype.fx,
  // 以下は、$.xxx の形で呼ばれるメソッド
  map: function(elm, fn) {
    return elm.map(fn);
  },
  each: function(mix, fn) {
    uu.forEach(mix, fn);
    return mix;
  }
});

if (!window.$) {
  window.$ = jQuery;
}

})(); // end (function())()
