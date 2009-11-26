
// === Jam (blueberry) ===
// depend: uu.js, uu.css.js, uu.node.js, uu.ev.js, uu.query.js
uu.waste || (function(win, doc, uu) {
var _KLASS_METHOD = { "-": uu.klass.sub,
                      "*": uu.klass.toggle };

uu.jam = _blueberryfactory;

_blueberry.plug = uu.mix(_blueberry.prototype, { // plug point
  // --- nodeset ---
  nth:          jamnth,         // uu.jam.nth(= 0) -> Node / void 0
  size:         jamsize,        // uu.jam.size() -> Number
  index:        jamindex,       // uu.jam.index(node) -> Number(-1 is not found)
  // --- find node / add node ---
  // [1][find] uu.jam.first() -> [node, ...]
  // [2][add]  uu.jam.first(node) -> this
  // [3][add]  uu.jam.first("<p>html</p>") -> this
  first:        jamfirst,
  prev:         jamprev,
  next:         jamnext,
  last:         jamlast,
  firstChild:   jamfirstChild,
  lastChild:    jamlastChild,
  add:          jamadd,
  remove:       jamremove,  // uu.jam.remove() -> this
  // --- attr ---
  // [1][get] uu.jam.attr("attr") -> ["value", ...]
  // [2][get] uu.jam.attr("attr1,attr2") -> [{ attr1: "value", attr2: "value" }, ...]
  // [3][set] uu.jam.attr("attr", "value") -> this
  // [4][set] uu.jam.attr({ attr: "value", ... }) -> this
  attr:         jamattr,
  // --- className(klass) ---
  // [1][add]    uu.jam.klass("class1 class2") -> this
  // [2][sub]    uu.jam.klass("-class1 class2") -> this
  // [3][toggle] uu.jam.klass("*class1 class2") -> this
  // [4][clear]  uu.jam.klass() -> this
  klass:        jamklass,
  // --- css / style ---
  // [1][get] uu.jam.css("color") -> ["red", ...]
  // [2][get] uu.jam.css("color,width") -> [{ color: "red", width: "20px" }, ...]
  // [3][set] uu.jam.css("color", "red") -> this
  // [4][set] uu.jam.css({ color: "red" }) -> this
  css:          jamcss,
  show:         jamshow,    // uu.jam.show(fadein = false) -> this
  hide:         jamhide,    // uu.jam.hide(fadeout = false) -> this
  bind:         jambind,    // uu.jam.bind("click", fn) -> this
  unbind:       jamunbind,  // uu.jam.unbind("click") -> this
  hover:        jamhover,   // uu.jam.hover(enter, leave) -> this
  html:         jamhtml,    // [1][get] uu.jam.html() -> ["innerHTML", ...]
                            // [2][set] uu.jam.html("<p>html</p>") -> this
  text:         jamtext,    // [1][get] uu.jam.text() -> ["innerText", ...]
                            // [2][set] uu.jam.text("html") -> this
  val:          jamval,     // [1][get] uu.jam.val() -> ["value", ...]
                            // [2][set] uu.jam.val("value") -> this
  each:         jameach,    // uu.jam.each(fn) -> this
  find:         jamfind,    // uu.jam.find(expr) -> this
  back:         jamback     // uu.jam.back() -> this
});

// uu.jam - factory
function _blueberryfactory(expr,  // @param Node/NodeList/String/
                                  //        JamInstance/window/document:
                           ctx) { // @param Node/void 0: context
  return new _blueberry(expr, ctx);
}

function _blueberry(expr, ctx) {
  this._stack = [[]]; // [NodeList, ...]
  this._node  = [];   // managed NodeList

  if (expr) {
    if (expr === win || expr === doc || expr.nodeType) { // Node
      this._node = [expr];
    } else if (uu.isary(expr)) { // clone NodeList
      this._node = expr.slice();
    } else if (expr instanceof _blueberry) { // copy constructor
      this._node = expr._node.slice(); // clone NodeList
    } else if (typeof expr === "string") {
      this._node = !expr.indexOf("<")
                 ? [uu.node.bulk(expr, ctx)] // create fragment
                 : uu.query(expr, ctx);      // query
    }
  }
}

// jam.nth - get nth in nodeset
function jamnth(nth) { // @param Number(= 0):  0 is first element
                       //                   : -1 is last element
                       // @return Node:
  return this._node[nth < 0 ? nth + this._node.length
                            : nth || 0];
}

// jam.size - get nodeset length
function jamsize() { // @return Number:
  return this._node.length;
}

// jam.index - find node index in nodeset
function jamindex(node) { // @param Node:
                          // @return Number: found index or -1
  return this._node.indexOf(node);
}

function jamfirst(node) {
  return _jamnode(this, uu.node.first, node);
}
function jamprev(node) {
  return _jamnode(this, uu.node.prev, node);
}
function jamnext(node) {
  return _jamnode(this, uu.node.next, node);
}
function jamlast(node) {
  return _jamnode(this, uu.node.last, node);
}
function jamfirstChild(node) {
  return _jamnode(this, uu.node.firstChild, node);
}
function jamlastChild(node) {
  return _jamnode(this, uu.node.lastChild, node);
}
function jamadd(node) {
  return _jamnode(this, uu.node.lastChild, node);
}
function jamremove() {
  return _jameach(this, uu.node.remove);
}
function jamattr(a, b) {
  return _jammap(this, uu.attr, a, b);
}
function jamklass(a) {
  function _clear(v) { v.className = ""; }
  if (!a) {
    return _jammap(this, _clear);
  }
  var method = _KLASS_METHOD[a.charAt(0)];

  return method ? _jammap(this, method, a.slice(1))
                : _jammap(this, uu.klass.add, a);
}
function jamcss(a, b) {
  return _jammap(this, uu.css, a, b);
}
function jamshow(a) {
  return _jammap(this, uu.css.show, a);
}
function jamhide(a) {
  return _jammap(this, uu.css.hide, a);
}
function jambind(a) {
  return _jameach(this, uu.ev, a);
}
function jamunbind(a) {
  return _jameach(this, uu.ev.unbind, a);
}
function jamhover(enter, leave) {
  return _jameach(this, uu.ev.hover, enter, leave);
}
function jamhtml(a) {
  return _jammap(this, _jamhtml, a);
}
function jamtext(a) {
  return _jammap(this, uu.text, a);
}
function jamval(a) {
  return _jammap(this, uu.val, a);
}
function jameach(fn) {
  uu.each(this._node, fn);
  return this;
}
function jamfind(expr) {
  this._stack.push(this._node);
  this._node = uu.query(expr, this._node);
  return this;
}
function jamback() {
  this._node = this._stack.pop() || [];
  return this;
}

// inner - node iterator
function _jameach(jam, fn, arg1, arg2, arg3, arg4) {
  var v, i = 0;

  while ( (v = jam._node[i++]) ) {
    fn(v, arg1, arg2, arg3, arg4);
  }
  return jam;
}

function _jamhtml(node, value) {
  return (value === void 0) ? node.innerHTML
                            : (node.innerHTML = value, node);
}

// inner - node iterator
function _jammap(jam, fn, arg1, arg2, arg3, arg4) {
  var rv = [], w, v, i = 0, result = 0;

  while ( (v = jam._node[i]) ) {
    rv[i++] = w = fn(v, arg1, arg2, arg3, arg4);
    !result && (result = (v === w) ? 1 : 2); // 1: result is node
  }
  return (result < 2) ? jam : rv;
}

// inner - node iterator
function _jamnode(jam, fn, node) {
  var rv = [], v, i = 0;

  if (node) {
    if (jam._node.length === 1) {
      fn(jam._node[0], node);
    } else {
      while ( (v = jam._node[i++]) ) {
        fn(v, uu.node.bulk(node)); // clone node
      }
    }
    return jam
  }
  while ( (v = jam._node[i]) ) {
    rv[i++] = fn(v);
  }
  return rv;
}

function _buildeventhandler(v) {
  _blueberry.prototype[v] = function(a, b) {
    return (uu.isfunc(a) || a.handleEvent)
                ? _jameach(this, uu.ev, v, a)
                : _jameach(this, uu.ev.fire, v, a, b);
  };
  _blueberry.prototype["un" + v] = function(a) {
    return _jameach(this, uu.ev.unbind, v, a);
  };
}
uu.each(uu.ary(uu.dmz.EVENT), _buildeventhandler);

})(window, document, uu);

