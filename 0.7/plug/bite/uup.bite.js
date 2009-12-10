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
    _uuklass = uu.klass,
    _speed = { slow: 600, normal: 400, fast: 200 };
//    _rootobj = bite(doc);

bite.fn = biteinit.prototype = bite.prototype;
bite.fn.extend = function(hash) { return _uumix(bite.fn, hash); };
bite.extend = function(hash, a, b) {
  return a ? _uumix(hash, a, b) : _uumix(bite, hash);
};
// bite.exp - export scope 
bite.exp = function(prefix) { // @param String(= ""): prefix 
  prefix = prefix || ""; 
  win[prefix + "$"]      = bite; 
  win[prefix + "jQuery"] = bite; 
};
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
  filter:       bitefilter,     // [1] bite.filter(expr)
                                // [2] bite.filter(fn)
  find:         bitefind,       // bite.find(expr) -> this

//  is:         biteis,       // bite.is(expr)
//  map:        bitemap,      // bite.map(callback)
//  not:        bitenot,      // bite.not(expr)
//  slice:      biteslice,    // bite.slice(start, end)
//  add:        biteadd,
  children:     bitechildren, // bite.children(expr) -> this
//  closet:     bitecloset,
//  contents:   bitecontents,
//  next:       bitenext,
//  nextAll:    bitenextall,
  parent:       biteparent,   // bite.parent(expr) -> this
//  parents:    biteparents,
//  prev:       biteprev,
//  prevAll:    biteprevall,
  siblings:     bitesiblings,
//  andSelf:    biteandself,
  end:          biteend,        // bite.end() -> this
  append:       biteappend,     // bite.append(html) -> this
//  appendTo:   biteappendto,
  prepend:      biteprepend,    // bite.append(html) -> this
//  prependTo:  biteprependto,
  after:        biteafter,      // bite.after(html) -> this
  before:       bitebefore,     // bite.before(html) -> this
//  insertAfter:biteinsertafter,
//  insertBefore:
//  wrap:       bitewrap,
//  wrapAll:    bitewrapall,
  wrapInner:    bitewrapInner,  // bite.wrapInner(html) -> this
//  repleaceWith: biterepleacewith,
//  replaceAll: bitereplaceall,
  empty:        biteempty,      // bite.empty() -> this
  remove:       biteremove,     // bite.remove() -> this
//  clone:      biteclone,
  show:         biteshow,       // bite.show() -> this
  hide:         bitehide,       // bite.hide() -> this
  fadeIn:       bitefadein,     // bite.fadein(duration) -> this
  fadeOut:      bitefadeout,    // bite.fadeout(duration) -> this
  fadeTo:       bitefadeto,     // bite.fadeto(speed, opacity, [callback]) -> this
  slideToggle:  biteslidetoggle, // bite.slideToggle(speed, [callback]) -> this
  toggle:       bitetoggle,     // bite.toggle(speed, [callback]) -> this
  animate:      biteanimate,    // bite.animate(hash, duration) -> this
  stop:         bitestop,       // bite.stop() -> this
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
    function bindThis(evt, node) {
      fn.call(node, evt); // this = node
    }
    return _biteeach(this, _uuev, v, bindThis);
  };
  bite.fn["un" + v] = function() {
    return _biteeach(this, _uuev.unbind, v);
  };
});

function bite(expr, ctx) {
  return new biteinit(expr, ctx);
}

function biteinit(expr, ctx) {
  function _evalctx(ctx) {
    return ctx && ctx._ns ? ctx._ns.slice()
                          : uu.isstr(ctx) ? uu.query(ctx) : ctx;
  }
  this._stack = [[]]; // [nodeset, ...]
  this._ns = !expr ? [] // nodeset
      : (expr === win || expr.nodeType) ? [expr] // node
      : uu.isary(expr) ? expr.slice() // clone NodeArray
      : uu.isstr(expr) ? (!expr.indexOf("<")
                           ? [_uunode.bulk(expr)] // <div> -> fragment
                           : uu.query(expr, _evalctx(ctx)))
      : (expr instanceof bite) ? expr._ns.slice() // copy constructor
      : uu.isfunc(expr) ? (uu.ready(expr), []) // ready
      : []; // bad expr
  this.length = 0;
  Array.prototype.push.apply(this, this._ns);
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
// [1][get] bite.attr(name) -> String
// [2][set] bite.attr(properties) -> this
// [3][set] bite.attr(name, value) -> this
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
// [1][get] bite.css(name) -> String
// [2][set] bite.css(properties) -> this
// [3][set] bite.css(name, value) -> this
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
// [1][get] bite.html() -> String
// [2][set] bite.html("<p>text</p>") -> this
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
// [1][get] bite.text() -> String
// [2][set] bite.text("text") -> this
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
// [1][get] bite.val() -> ["value", ...]
// [2][set] bite.val(val) -> this
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

// bite.filter
// [1] bite.filter(expr) -> this
// [2] bite.filter(fn)   -> this
function bitefilter(expr) { // @param String/Function:
                            // @return this:
  this._stack.push(this._ns); // add stack
  if (uu.isfunc(expr)) {
    var rv = [], ary = this._ns, ri = -1, v, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
      v = ary[i];
      expr.call(v, i) && (rv[++ri] = v);
    }
    this._ns = rv;
  } else {
    this._ns = uu.query("! " + expr, this._ns);
  }
  this.length = this._ns;
  return this;
}

// bite.find
function bitefind(expr) { // @param String:
                          // @return this:
  this._stack.push(this._ns); // add stack
  this._ns = uu.query("! " + expr, this._ns);
  this.length = this._ns.length;
  return this;
}

// bite.children
function bitechildren(expr) { // @param String(= void 0):
  return _bitechildren(this, 1, expr); // 1: children
}

// bite.parent
function biteparent(expr) { // @param String(= void 0):
  return _bitechildren(this, 3, expr); // 3: parent
}

// bite.siblings
function bitesiblings(expr) { // @param String(= void 0):
  return _bitechildren(this, 2, expr); // 2: siblings
}

// bite.end
function biteend() { // @return this:
  this._ns = this._stack.pop() || [];
  this.length = this._ns.length;
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

// bite.prepend
function biteprepend(html) { // @param bite/HTMLString/Node:
                             // @return this:
  var i = 0, v;

  while ( (v = this._ns[i++]) ) {
    if (html._ns) {
      _uunode(html._ns[0], v, 5); // bite._ns[0] -> appendChild
    } else if (uu.isstr(html) || html.nodeType) {
      _uunode(html, v, 5);
    }
  }
  return this;
}

function biteprependto(html) { // @param bite/HTMLString/Node:
                             // @return this:
  var i = 0, v;

  while ( (v = this._ns[i++]) ) {
    if (html._ns) {
      _uunode(html._ns[0], v, 1); // bite._ns[0] -> appendChild
    } else if (uu.isstr(html) || html.nodeType) {
      _uunode(html, v, 1);
    }
  }
  return this;
}

// bite.after
function biteafter(html) { // @param bite/HTMLString/Node:
                           // @return this:
  var i = 0, v;

  while ( (v = this._ns[i++]) ) {
    if (html._ns) {
      _uunode(html._ns[0], v, 3); // bite._ns[0]
    } else if (uu.isstr(html) || html.nodeType) {
      _uunode(html, v, 3); // nextSibling
    }
  }
  return this;
}

// bite.before
function bitebefore(html) { // @param bite/HTMLString/Node:
                            // @return this:
  var i = 0, v;

  while ( (v = this._ns[i++]) ) {
    if (html._ns) {
      _uunode(html._ns[0], v, 2); // bite._ns[0] -> inseretBefore
    } else if (uu.isstr(html) || html.nodeType) {
      _uunode(html, v, 2);
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

// bite.empty
function biteempty() { // @return this:
/*
  var v, i = 0,
      descendants = uu.query("*", this._ns),
      uuevunbind = _uuev.unbind;

  while ( (v = descendants[i++]) ) {
     uuevunbind(v);
  }

  i=0;
  while ( (v = this._ns[i++]) ) {
    v.innerHTML = "";
  }
  return this;
 */
  var v, i = 0;

  while ( (v = this._ns[i++]) ) {
    uu.node.clear(v);
  }
  return this;
}

// bite.remove - remove node
function biteremove() { // @return this:
  var v, i = 0,
      descendants = uu.query("*", this._ns),
      uuevunbind = _uuev.unbind;

  while ( (v = descendants[i++]) ) {
    uuevunbind(v);
  }

  i = 0;
  while ( (v = this._ns[i++]) ) {
    uuevunbind(v);
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

// bite.fadeIn -
function bitefadein(speed) { // @param Number(= 400):
  return _biteeach(this, _uucss.show, _speed[speed] || speed, 1);
}

// bite.fadeOut -
function bitefadeout(speed) { // @param Number(= 400):
  return _biteeach(this, _uucss.hide, _speed[speed] || speed, 1);
}

// bite.fadeTo -
function bitefadeto(speed,     // @param String/Number(= 400):
                    opacity) { // @param Number:
  return _biteeach(this, uu.tween, _speed[speed] || speed,
                   { o: [false, opacity] });
}

// bite.slidetoggle -
function biteslidetoggle(speed) { // @param String/Number(= 400):
  function _slidetoggle(node) {
    var cs = uu.css(node), show = 0, param,
        height = cs.height;

    if (cs.display === "none" || cs.visibility === "hidden") {
      show = 1;
      param = { h: [0, height] }; // show
    } else {
      param = { h: [false, 0] }; // hide
    }
    uu.tween(node, _speed[speed] || speed, param,
        function(node, ns) {
          if (!show) {
            ns.display = "none";
            ns.visibility = "hidden";
            ns.height = height + "px"; // restore size
          }
        });
    return this;
  }
  return _biteeach(this, _slidetoggle);
}

// bite.toggle -
function bitetoggle(speed) {
  function _toggle(node) {
    var cs = uu.css(node);

    if (cs.display === "none" || cs.visibility === "hidden") {
      uu.css.show(node, _speed[speed] || speed);
    } else {
      uu.css.hide(node, _speed[speed] || speed);
    }
    return this;
  }
  return _biteeach(this, _toggle);
}

// bite.animate
function biteanimate(hash,
                     duration,
                     easing) {
  function _biteanimate(node) {
    var rv = {}, i;

    for (i in hash) {
      rv[i] = [hash[i], easing];
    }
    uu.tween(node, duration, rv);
  }
  return _biteeach(this, _biteanimate);
}

// bite.stop
function bitestop() { // @return this:
  return _biteeach(this, uu.tween.fin);
}

// bite.width
function bitewidth() { // @return Number:
  return _uucss.size.get(this._ns[0]).w; // node.style.width + padding + border
}

// bite.height
function biteheight() { // @return Number:
  return _uucss.size.get(this._ns[0]).h; // node.style.height + padding + border
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

// inner - enum children
function _bitechildren(me,     // @param bite:
                       mode,   // @param Number:
                       expr) { // @param String(= void 0):
  me._stack.push(me._ns); // add stack
  var rv = [], v, w, i = 0;

  while ( (v = me._ns[i++]) ) {
    switch (mode) {
    case 1: w = v.firstChild; break; // children
    case 2: w = v.parentNode.firstChild; break; // siblings
    case 3: rv.push(v.parentNode); break; // parent
    }
    if (mode < 3) {
      for (; w; w = w.nextSibling) {
        if (w.nodeType === 1) {
          rv.push(w);
        }
      }
    }
  }
  expr && uu.isstr(expr) && (rv = uu.query(rv, expr));
  me._ns = rv;
  me.length = me._ns.length;
  return me;
}

})(window, document, uu);

