
// === uuMeta.jam ===
// depend: uuMeta
(function uuMetaJamScope() {
var _mm = uuMeta,
    _win = window,
    _doc = document;

_mm.Class("Jam", {
  construct:  _jamconstruct,
  // --- array / hash manipulation ---
  first:      jamfirst,
  nth:        jamnth,
  last:       jamlast,
  size:       jamsize,
  index:      jamindex,
  // --- iterator ---
  each:       jameach,
  map:        jammap,
  reduce:     jamreduce,
  // --- stack manipulation ---
  back:       jamback,
  // --- event manipulation ---
  bind:       jambind,
  unbind:     jamunbind,
  // --- attribute manipulation ---
  nthattr:    jamnthattr,  // jQuery.attr(name)
  attr:       jamsetattr,  // jQuery.attr(hash) or attr(key, val)
  // --- style manipulation ---
  nthcss:     jamnthcss,   // jQuery.css(name)
  css:        jamsetcss,   // jQuery.css(hash) or css(key, val)
  // --- class name manipulation ---
  invoke:     jaminvoke,   // jQuery.addClass()
  revoke:     jamrevoke,   // jQuery.removeClass()
  voke:       jamvoke,     // jQuery.toggleClass()
  // --- html manipulation ---
  nthhtml:    jamnthhtml,  // jQuery.html()
  html:       jamsethtml,  // jQuery.html("<p>text</p>")
  // --- text manipulation ---
  nthtext:    jamnthtext,  // jQuery.text()
  text:       jamsettext,  // jQuery.text("text")
  // --- form element value manipulation ---
  allval:     jamallval,   // jQuery.val()
  nthval:     jamnthval,
  val:        jamsetval,   // jQuery.val("value")
  // --- node manipulation ---
  append:     jamappendnode,   // jQuery.append
  prepend:    jamprependnode,  // jQuery.prepend
  insert:     jaminsertnode,
  remove:     jamremovenode    // jQuery.remove
});

// uuMeta.jam - factory
function jamfactory(expr,      // @param Node/NodeList/String/
                               //        JamObject/window/document:
                    context) { // @param Node/void 0: context
  return new _mm.Class.Jam(expr, context);
}

// inner -
function _jamconstruct(expr, ctx) {
  this._stack = [[]]; // [NodeList, ...]
  this._node  = [];   // managed NodeList

  if (expr) {
    if (expr === _win || expr === _doc || expr.nodeType) { // Node
      this._node = [expr];
    } else if (expr instanceof Array) { // clone NodeList
      this._node = expr.slice();
    } else if (expr instanceof uuMeta.Class.Jam) { // copy constructor
      this._node = expr._node.slice(); // clone NodeList
    } else if (typeof expr === "string") {
      this._node = !expr.indexOf("<")
                 ? [_mm.node.substance(expr, ctx)] // create fragment
                 : _mm.query(expr, ctx);           // query
    }
  }
}

// --- array / hash manipulation ---
// uuMeta.Class.Jam.first - get first element
function jamfirst() { // @return Mix:
  return this._node[0];
}

// uuMeta.Class.Jam.nth - get nth element
function jamnth(nth) { // @param Number(= 0):  0 is first element
                       //                   : -1 is last element
                       // @return Mix:
  return this._node[nth < 0 ? nth + this._node.length
                            : nth || 0];
}

// uuMeta.Class.Jam.last - get last element
function jamlast() { // @return Mix:
  return this._node[this._node.length - 1]; // return element
}

// uuMeta.Class.Jam.size - get elements length
function jamsize() { // @return Number:
  return this._node.length;
}

// uuMeta.Class.Jam.index - find element index
function jamindex(searchElement) { // @param Mix:
                                   // @return Number: found index or -1
  return this._node.indexOf(searchElement);
}

// --- iterator ---
// uuMeta.Class.Jam.each - iterate elements
function jameach(callback) { // @param Function:
                             // @return this:
  this._node.forEach(callback);
  return this;
}

// uuMeta.Class.Jam.map - iterate elements
function jammap(callback) { // @param Function:
                            // @return Array: [result, ...]
  return this._node.map(callback);
}

// uuMeta.Class.Jam.reduce - iterate elements
function jamreduce(callback) { // @param Function:
                               // @return Mix:
  return this._node.reduce(callback);
}

// --- stack manipulation ---
function jamback() { // @return this:
  this._node = this._stack.pop() || [];
  return this;
}

// --- event manipulation ---
// uuMeta.Class.Jam.bind - regist event handler
function jambind(name,      // @param String: event name
                 callback,  // @param Function:
                 capture) { // @param Boolean(= false):
                            // @return this:
  return _jamiter1(this, _mm.bind, name, callback, capture || false);
}

// uuMeta.Class.Jam.unbind - unregist event handler
function jamunbind(name,      // @param String: event name
                   callback,  // @param Function:
                   capture) { // @param Boolean(= false):
                              // @return this:
  return _jamiter1(this, _mm.unbind, name, callback, capture || false);
}

// --- attribute manipulation ---
// uuMeta.Class.Jam.nthattr - get attribute from nth element
function jamnthattr(attrs, // @param JointString: "attr1,..."
                    nth) { // @param Number(= 0):  0 is first element
                           //                     -1 is last element
                           // @return Hash: { attr1: "value", ... }
  return _mm.getAttr(this.nth(nth), attrs);
}

// uuMeta.Class.Jam.attr - set attribute for all elements
function jamsetattr(key,     // @param String/Hash: key
                             //                  or { attr1: "value", ... }
                    value) { // @param String(= void 0): { key,value } pair
                             // @return this:
  return _jamiter1(this, _mm.setAttr, _mm.hash.fromPair(key, value));
}

// --- style manipulation ---
// uuMeta.Class.Jam.nthcss - get style from nth element
function jamnthcss(styles, // @param JointString: "css-prop,cssProp,..."
                   nth) {  // @param Number(= 0):  0 is first element
                           //                     -1 is last element
                           // @return Hash: { cssProp: "value", ... }
  return _mm.getStyle(this.nth(nth), styles);
}

// uuMeta.Class.Jam.css - set style for all elements
function jamsetcss(key,     // @param String/Hash: key
                            //                  or { cssProp: "value", ... }
                            //                  or { css-prop: "value", ... }
                   value) { // @param String(= void 0): { key,value } pair
                            // @return this:
  return _jamiter1(this, _mm.setStyle, _mm.hash.fromPair(key, value));
}

// --- class name manipulation ---
// uuMeta.Class.Jam.invoke - add className for all elements
function jaminvoke(className) { // @param JointString: "class1 class2"
                                // @return this:
  return _jamiter1(this, _mm.addClass, className);
}

// uuMeta.Class.Jam.revoke - remove className for all elements
function jamrevoke(className) { // @param JointString: "class1 class2"
                                // @return this:
  return _jamiter1(this, _mm.removeClass, className);
}

// uuMeta.Class.Jam.voke - toggle(add / remove) className for all elements
function jamvoke(className) { // @param JointString: "class1 class2"
                              // @return this:
  return _jamiter1(this, _mm.toggleClass, className);
}

// --- html manipulation ---
// uuMeta.Class.Jam.nthhtml - get HTML from nth element
function jamnthhtml(nth) { // @param Number(= 0):  0 is first element
                           //                     -1 is last element
                           // @return String:
  return this.nth(nth).innerHTML;
}

// uuMeta.Class.Jam.html - set HTML for all elements
function jamsethtml(html,  // @param String:
                    add) { // @param Boolean(= false):
                           // @return this:
  var v, i = 0;

  while ( (v = this._node[i++]) ) {
    add ? (v.innerHTML += html)
        : (v.innerHTML = html);
  }
  return this;
}

// --- text manipulation ---
// uuMeta.Class.Jam.nthtext - get text from nth element
function jamnthtext(nth) { // @param Number(= 0):  0 is first element
                           //                     -1 is last element
                           // @return String:
  return this.nth(nth).innerText;
}

// uuMeta.Class.Jam.text - set text for all elements
function jamsettext(txt,   // @param String:
                    add) { // @param Boolean(= false):
                           // @return this:
  var v, i = 0;

  while ( (v = this._node[i++]) ) {
    add ? (v.innerText += txt)
        : (v.innerText = txt);
  }
  return this;
}

// --- form element value manipulation ---
// uuMeta.Class.Jam.allval - get value from all element
function jamallval() { // @return Array: [val, ...]
  var rv = [], v, i = 0;

  while ( (v = this._node[i++]) ) {
    rv.push(v.value);
  }
  return this;
}

// uuMeta.Class.Jam.nthval - get value from nth element
function jamnthval(nth) { // @param Number(= 0):  0 is first element
                          //                     -1 is last element
  return this.nth(nth).value;
}

// uuMeta.Class.Jam.val - set value for all elemenets
function jamsetval(value, // @param String:
                   add) { // @param Boolean(= false):
                          // @return this:
  var v, i = 0;

  while ( (v = this._node[i++]) ) {
    add ? (v.value += value)
        : (v.value = value);
  }
  return this;
}

// --- node manipulation ---
// uuMeta.Class.Jam.append - append Node
function jamappendnode(node) { // @param Node/HTMLString:
                               //          HTMLString: "<p>text</p>"
                               // @return this:
  return _jamiter2(this, _mm.node.insert, node, uuMeta.LASTC);
}

// uuMeta.Class.Jam.prepend - prepend Node
function jamprependnode(node) { // @param Node/HTMLString:
                                //          HTMLString: "<p>text</p>"
                                // @return this:
  return _jamiter2(this, _mm.node.insert, node, uuMeta.FIRSTC);
}

// uuMeta.Class.Jam.insert - insert Node
function jaminsertnode(node,  // @param Node/HTMLString:
                              //          HTMLString: "<p>text</p>"
                       pos) { // @param Number(= uuMeta.LASTC)
                              // @return this:
  return _jamiter2(this, _mm.node.insert, node, pos);
}

// uuMeta.Class.Jam.remove - remove node
function jamremovenode() { // @return this:
  var v, i = 0;

  while ( (v = this._node[i++]) ) {
    v.parentNode.removeChild(v);
  }
  return this;
}

// inner - node iterator type1
function _jamiter1(thisArg, fn, arg1, arg2, arg3, arg4) {
  var v, i = 0;

  while ( (v = thisArg._node[i++]) ) {
    fn(v, arg1, arg2, arg3, arg4);
  }
  return thisArg;
}

// inner - node iterator type2
function _jamiter2(thisArg, fn, arg1, arg2, arg3, arg4) {
  var v, i = 0;

  while ( (v = thisArg._node[i++]) ) {
    fn(arg1, v, arg2, arg3, arg4);
  }
  return thisArg;
}

// --- initialize / export ---
_mm.jam = jamfactory;
_mm.jam.plug = _mm.Class.Jam.prototype;
_mm.mix(_mm.jam, _mm);
delete _mm.jam.jam; // remove reference cycles

})(); // uuMeta.jam scope

