
// === ECMAScript-262 5th ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {
var _TRIM = /^\s+|\s+$/g;

// --- extend ---
uu.mix(Array.prototype, {
  indexOf:      arrayindexof,   // ECMAScript-262 5th
  lastIndexOf:  arraylastindexof, // ECMAScript-262 5th
  every:        arrayevery,     // ECMAScript-262 5th
  some:         arraysome,      // ECMAScript-262 5th
  forEach:      arrayforeach,   // ECMAScript-262 5th
  map:          arraymap,       // ECMAScript-262 5th
  filter:       arrayfilter,    // ECMAScript-262 5th
  reduce:       arrayreduce,    // ECMAScript-262 5th
  reduceRight:  arrayreduceright // ECMAScript-262 5th
}, 0, 0);

uu.mix(Boolean.prototype, {
  toJSON:       numbertojson    // ECMAScript-262 5th
}, 0, 0);

uu.mix(Date.prototype, {
  toISOString:  datetoisostring,// ECMAScript-262 5th
  toJSON:       datetoisostring // ECMAScript-262 5th
}, 0, 0);

/*
uu.mix(Function.prototype, {
  bind:         functionbind    // ECMAScript-262 5th
}, 0, 0);
 */

uu.mix(Number.prototype, {
  toJSON:       numbertojson    // ECMAScript-262 5th
}, 0, 0);

uu.mix(String.prototype, {
  trim:         stringtrim,     // ECMAScript-262 5th
  toJSON:       stringtojson    // ECMAScript-262 5th
}, 0, 0);

uu.gecko && !HTMLElement.prototype.innerText && (function(proto) {
  proto.__defineGetter__("innerText", innertextgetter);
  proto.__defineSetter__("innerText", innertextsetter);
  proto.__defineGetter__("outerHTML", outerhtmlgetter);
  proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(HTMLElement.prototype);

// =========================================================
// innerText getter
function innertextgetter() {
  return this.textContent;
}

// innerText setter
function innertextsetter(text) {
  while (this.hasChildNodes()) {
    this.removeChild(this.lastChild);
  }
  this.appendChild(doc.createTextNode(text));
}

// outerHTML getter
function outerhtmlgetter() {
  var rv, parent = this.parentNode,
      range = doc.createRange(), div = doc.createElement("div");

  !parent && doc.body.appendChild(this); // orphan
  range.selectNode(this);
  div.appendChild(range.cloneContents());
  rv = div.innerHTML;
  !parent && this.parentNode.removeChild(this);
  return rv;
}

// outerHTML setter
function outerhtmlsetter(html) {
  var range = doc.createRange(), cf;

  range.setStartBefore(this);
  cf = range.createContextualFragment(html);
  this.parentNode.replaceChild(cf, this);
}

// =========================================================
// Array.prototype.indexOf
function arrayindexof(searchElement, // @param Mix:
                      fromIndex) {   // @param Number(= 0):
                                     // @return Number: found index or -1
  var iz = this.length, i = fromIndex || 0;

  i = (i < 0) ? i + iz : i;
  for (; i < iz; ++i) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }
  return -1;
}

// Array.prototype.lastIndexOf
function arraylastindexof(searchElement, // @param Mix:
                          fromIndex) {   // @param Number(= this.length):
                                         // @return Number: found index or -1
  var iz = this.length, i = fromIndex;

  i = (i < 0) ? i + iz : iz - 1;
  for (; i > -1; --i) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }
  return -1;
}

// Array.prototype.every
function arrayevery(fn,        // @param Function: callback evaluator
                    fn_this) { // @param this(= void 0):
                               // @return Boolean:
  for (var i = 0, iz = this.length; i < iz; ++i) {
    if (i in this && !fn.call(fn_this, this[i], i, this)) {
      return false;
    }
  }
  return true;
}

// Array.prototype.some
function arraysome(fn,        // @param Function: callback evaluator
                   fn_this) { // @param this(= void 0):
                              // @return Boolean:
  for (var i = 0, iz = this.length; i < iz; ++i) {
    if (i in this && fn.call(fn_this, this[i], i, this)) {
      return true;
    }
  }
  return false;
}

// Array.prototype.forEach
function arrayforeach(fn,        // @param Function: callback evaluator
                      fn_this) { // @param this(= void 0):
  for (var i = 0, iz = this.length; i < iz; ++i) {
    i in this && fn.call(fn_this, this[i], i, this);
  }
}

// Array.prototype.map
function arraymap(fn,        // @param Function: callback evaluator
                  fn_this) { // @param this(= void 0):
                             // @return Array: [element, ... ]
  for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
    i in this && (rv[i] = fn.call(fn_this, this[i], i, this));
  }
  return rv;
}

// Array.prototype.filter
function arrayfilter(fn,        // @param Function: callback evaluator
                     fn_this) { // @param this(= void 0):
                                // @return Array: [element, ... ]
  for (var rv = [], ri = -1, v, i = 0, iz = this.length; i < iz; ++i) {
    if (i in this) {
      v = this[i];
      fn.call(fn_this, v, i, this) && (rv[++ri] = v);
    }
  }
  return rv;
}

// Array.prototype.reduce
function arrayreduce(fn,             // @param Function: callback evaluator
                     initialValue) { // @param Mix(= void 0):
                                     // @return Mix:
  var rv, i = 0, iz = this.length, found = 0;

  if (initialValue !== void 0) {
    rv = initialValue;
    ++found;
  }
  for (; i < iz; ++i) {
    if (i in this) {
      rv = found ? fn(rv, this[i], i, this)
                 : (++found, this[i]);
    }
  }
  if (!found) { throw ""; }
  return rv;
}

// Array.prototype.reduceRight
function arrayreduceright(fn,             // @param Function: callback evaluator
                          initialValue) { // @param Mix(= void 0):
                                          // @return Mix:
  var rv, i = 0, found = 0;

  if (initialValue !== void 0) {
    rv = initialValue;
    ++found;
  }
  for (i = this.length - 1; i >= 0; --i) {
    if (i in this) {
      rv = found ? fn(rv, this[i], i, this)
                 : (++found, this[i]);
    }
  }
  if (!found) { throw ""; }
  return rv;
}

// Date.prototype.toISOString - to ISO8601 string, ECMAScript-262 5th
function datetoisostring() { // @return String:
  return uu.date2str(this);
}

/*
// Function.prototype.bind - ECMAScript-262 5th
function functionbind(fn_this,    // @param this: bind this
                      var_args) { // @param Mix(= void 0): bind var_args
                                  // @return Function: closure
  var currentScope = this, arg = [];

  if (arguments.length) {
    arg = uu.ary(arguments);
    arg.shift();
  }
  return function(var_args) {
    return currentScope.apply(fn_this, arg.concat(uu.ary(arguments)));
  };
}
 */

// Number.prototype.toJSON
// Boolean.prototype.toJSON
function numbertojson() { // @return String: "123", "true", "false"
  return this.toString();
}

// String.prototype.trim
function stringtrim() { // @return String: "has  space"
  return this.replace(_TRIM, "");
}

// String.prototype.toJSON
function stringtojson() { // @return String: "string"
  return uu.str2json(this);
}

})(window, document, uu);

