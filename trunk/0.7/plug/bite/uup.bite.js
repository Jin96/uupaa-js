
// === bite ===
// depend: uu.js, uu.css
uu.waste || (function(win, doc, uu) {
var _uuev = uu.ev,
    _uuary = uu.ary,
    _uucss = uu.css,
    _uumix = uu.mix,
    _uuattr = uu.attr,
    _uuhash = uu.hash,
    _uunode = uu.node,
    _uuklass = uu.klass;

bite.fn = biteinit.prototype = bite.prototype;
bite.fn.extend = function(hash) { _uumix(bite.fn, hash); };
bite.extend = function(hash) { _uumix(bite, hash); };
bite.exp = function() { win.$ = win.jQuery = bite; };
win.$$$ = bite;

_uumix(bite.prototype, {
  each:         biteeach,
  size:         bitesize,
  index:        biteindex,      // bite.index(element)
  eq:           biteeq,         // bite.eq(nth)
  get:          biteget,        // bite.get(nth = void 0)
  attr:         biteattr,
  removeAttr:   biteremoveattr, // bite.removeAttr(name)
  css:          bitecss,
  addClass:     biteaddclass,   // bite.addClass() -> this
  hasClass:     bitehasclass,   // bite.hasClass() - Boolean
  removeClass:  biteremoveclass, // bite.removeClass() -> this
  toggleClass:  bitetoggleclass, // bite.toggleClass() -> this
  html:         bitehtml,
  text:         bitetext,
  val:          biteval,
//  filter:     bitefilter,   // [1] bite.filter(expr)
                              // [2] bite.filter(fn)
  find:         bitefind,       // bite.find(expr) -> this

//  is:         biteis,       // bite.is(expr)
//  map:        bitemap,      // bite.map(callback)
//  not:        bitenot,      // bite.not(expr)
//  slice:      biteslice,    // bite.slice(start, end)
//  add:        biteadd,
//  children:   bitechildren,
//  closet:     bitecloset,
//  contents:   bitecontents,
//  find:       bitefind,
//  next:       bitenext,
//  nextAll:    bitenextall,
//  parent:     biteparent,
//  parents:    biteparents,
//  prev:       biteprev,
//  prevAll:    biteprevall,
//  siblings:   bitesiblings,
//  andSelf:    biteandself,
  end:          biteend,        // bite.end() -> this
  append:       biteappend,     // bite.append(html) -> this
//  appendTo:   biteappendto,
//  prepend:    biteprepend,
//  prependTo:  biteprependto,
//  after:      biteafter,
//  before:     bitebefore,
//  insertAfter:biteinsertafter,
//  insertBefore:
//  wrap:       bitewrap,
//  wrapAll:    bitewrapall,
  wrapInner:    bitewrapInner,  // bite.wrapInner(html) -> this
//  repleaceWith: biterepleacewith,
//  replaceAll: bitereplaceall,
//  empty:      biteempty,
  remove:       biteremove,     // bite.remove() -> this
//  clone:      biteclone,
  show:         biteshow,       // bite.show() -> this
  hide:         bitehide,       // bite.hide() -> this
  width:        bitewidth,      // bite.width() -> Number
  height:       biteheight,     // bite.height() -> Number
  bind:         bitebind,       // bite.bind("click", fn) -> this
  unbind:       biteunbind,     // bite.bind("click", fn) -> this
  hover:        bitehover,      // bite.hover(enter, leave) -> this
  ready:        uu.ready        // bite.ready(fn)
});

// inner - build DOM Lv2 event handler - bite.click(), ...
_uuary.each(_uuary(uu.dmz.EVENT), function(v) {
  bite.fn[v] = function(fn) {
    return _biteeach(this, _uuev, v, fn);
  };
  bite.fn["un" + v] = function() {
    return _biteeach(this, _uuev.unbind, v);
  };
});

function bite(expr, ctx) {
  return new biteinit(expr, ctx);
}

function biteinit(expr, ctx) {
  this._stack = [[]]; // [nodeset, ...]
  this._ns = !expr ? [] // nodeset
           : (expr === win || expr.nodeType) ? [expr] // node
           : uu.isary(expr) ? expr.slice() // clone NodeArray
           : uu.isstr(expr) ?
                (!expr.indexOf("<") ? [_uunode.bulk(expr)] // <div> -> fragment
                                    : uu.query(expr, ctx)) // query
           : (expr instanceof bite) ? expr._ns.slice() // copy constructor
           : uu.isfunc(expr) ? (uu.ready(expr), []) // ready
           : []; // bad expr
}

// bite.each
function biteeach(fn) { // @param Function: callback function
                        // @return this:
  var ary = this._ns, v, i = 0;

  while ( (v = ary[i]) ) {
    // fn(this, i, v) order
    if (fn.call(v, i, v) === false) { return this; }
    ++i;
  }
  return this;
}

// bite.size - get elements length
function bitesize() { // @return Number:
  return this._ns.length;
}

// bite.index - find element index
function biteindex(elm) { // @param Mix:
                          // @return Number: found index or -1
  return this._ns.indexOf(elm);
}

// bite.eq - get nth element
function biteeq(nth) { // @param Number(= 0):  0 is first element
                       //                   : -1 is last element
                       // @return Mix:
  return this._ns[nth < 0 ? nth + this._ns.length
                          : nth || 0];
}

// bite.get - get element array
function biteget(nth) { // @param Number(= void 0): nth
                        // @return Array:
  return nth === void 0 ? this._ns : this._ns[nth];
}

// bite.attr
// [1][get] bite.attr(name) - String
// [2][set] bite.attr(properties) - this
// [3][set] bite.attr(name, value) - this
function biteattr(a1, a2) {
  if (a2 === void 0) {
    return uu.isstr(a1) ? _uuattr.get(this._ns[0], a1) // [1]
                        : _biteeach(this, _uuattr.set, a1); // [2]
  }
  return _biteeach(this, _uuattr.set, _uuhash(a1, a2)); // [3]
}

// bite.removeAttr(name)
function biteremoveattr(name) {
  _biteeach(this, function(node) {
    node[name] = "",
    node.removeAttribute(name);
  });
}

// bite.css
// [1][get] bite.css(name) - String
// [2][set] bite.css(properties) - this
// [3][set] bite.css(name, value) - this
function bitecss(a1, a2) {
  if (a2 === void 0) {
    return uu.isstr(a1) ? _uucss.get(this._ns[0], a1) // [1]
                        : _biteeach(this, _uucss.set, a1); // [2]
  }
  return _biteeach(this, _uucss.set, _uuhash(a1, a2)); // [3]
}

// bite.addClass - add className for all elements
function biteaddclass(className) { // @param JointString: "class1 class2"
                                   // @return this:
  return _biteeach(this, _uuklass.add, className);
}

// bite.hasClass
function bitehasclass(className) { // @param JointString: "class1 class2"
                                   // @return Boolean:
  var rv = false, node = this._ns, v, i = 0;

  while ( (v = node[i++]) ) {
    if (_uuklass.has(v, className)) {
      rv = true;
    }
  }
  return rv;
}

// bite.removeClass - remove className for all elements
function biteremoveclass(className) { // @param JointString: "class1 class2"
                                      // @return this:
  return _biteeach(this, _uuklass.sub, className);
}

// bite.toggleClass - toggle(add / remove) className for all elements
function bitetoggleclass(className, // @param JointString: "class1 class2"
                         add) {     // @param Boolean(= void 0): true is add
                                    // @return this:
  if (add !== void 0) {
    return _biteeach(this, _uuklass.toggle, className);
  }
  return _biteeach(this, add ? _uuklass.add : _uuklass.sub, className);
}

// bite.html
// [1][get] bite.html() - String
// [2][set] bite.html("<p>text</p>") - this
function bitehtml(html) { // @param String(= void 0):
                         // @return this:
  var v, i = 0;

  if (html === void 0) {
    return this._ns[0].innerHTML;
  } else {
    while ( (v = this._ns[i++]) ) {
      v.innerHTML = html;
    }
  }
  return this;
}

// bite.text
// [1][get] bite.text() - String
// [2][set] bite.text("text") - this
function bitetext(text) { // @param String(= void 0):
                         // @return this:
  var v, i = 0;

  if (text === void 0) {
    return this._ns[0][uu.gecko ? "textContent" : "innerText"];
  } else {
    while ( (v = this._ns[i++]) ) {
      uu.text.set(v, text);
    }
  }
  return this;
}

// bite.val
// [1][get] bite.val() - ["value", ...]
// [2][set] bite.val(val) - this
function biteval(val) {
  var rv = this, node = this._ns, v, i = 0;

  if (val === void 0) {
    rv = [];
    while ( (v = node[i++]) ) {
      rv.push(uu.val.get(v));
    }
  } else {
    while ( (v = node[i++]) ) {
      uu.val.set(v, val);
    }
  }
  return rv;
}

// bite.find
function bitefind(expr) { // @param String:
                          // @return this:
  this._stack.push(this._ns); // add stack
  this._ns = uu.query("! " + expr, this._ns);
  return this;
}

// bite.end
function biteend() { // @return this:
  this._ns = this._stack.pop() || [];
  return this;
}

// bite.append
function biteappend(html) { // @param bite/HTMLString/Node:
                            // @return this:
  var i = 0, v;

  while ( (v = this._ns[i++]) ) {
    if (html._ns) {
      _uunode(html._ns[0], v); // bite._ns[0] -> appendChild
    } else if (uu.isstr(html) || html.nodeType) {
      _uunode(html, v);
    }
  }
  return this;
}

// bite.wrapInner
function bitewrapInner(wrapper) { // @param HTMLString/Node:
                                  // @return this:
  var i = 0, v, w, x;

  while ( (v = this._ns[i++]) ) {
    x = w = _uunode.bulk(wrapper);
    while (x.firstChild) {
      x = x.firstChild;
    }
    while (v.firstChild) {
      x.appendChild(v.removeChild(v.firstChild));
    }
    _uunode(w, v, 5); // firstChild
  }
  return this;
}

// bite.remove - remove node
function biteremove() { // @return this:
  var v, i = 0;

  while ( (v = this._ns[i++]) ) {
    v.parentNode.removeChild(v);
  }
  return this;
}

// bite.show - show elements
function biteshow() { // @return this:
  return _biteeach(this, _uucss.show);
}

// bite.hide - hide elements
function bitehide() { // @return this:
  return _biteeach(this, _uucss.hide);
}

// bite.width
function bitewidth() { // @return Number:
  return _uucss.size.get(this._ns[0], 1).w;
}

// bite.height
function biteheight() { // @return Number:
  return _uucss.size.get(this._ns[0], 1).h;
}

// bite.bind - bind event
function bitebind(name, // @param String: event type
                  fn) { // @param Function: callback
                        // @return this:
  return _biteeach(this, _uuev, name, fn);
}

// bite.unbind - unbind event
function biteunbind(name, // @param String: event type
                    fn) { // @param Function: callback
                          // @return this:
  return _biteeach(this, _uuev.unbind, name, fn);
}

// bite.hover - bind hover event
function bitehover(enter,   // @param Function:
                   leave) { // @param Function:
                            // @return this:
  return _biteeach(this, _uuev.hover, enter, leave);
}

// inner - node iterator
function _biteeach(me, fn, p1, p2, p3, p4) {
  var v, i = 0;

  while ( (v = me._ns[i++]) ) {
    if (v && v.nodeType === 11) { // 11: DocumentFragment
      v = v.firstChild || v;
    }
    fn(v, p1, p2, p3, p4);
  }
  return me;
}

})(window, document, uu);

