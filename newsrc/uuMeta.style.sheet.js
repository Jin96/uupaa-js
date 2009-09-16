
// === uuMeta.style.sheet ===
// depend: uuMeta, uuMeta.style
/*
uuMeta.style.sheet.create(id) - return object
uuMeta.style.sheet.insertRule(id, expr, decl, index = last) - return index
uuMeta.style.sheet.removeRule(id, index = last)
uuMeta.style.sheet.removeAllRules(id)
 */
(function uuMetaStyleSheetScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _sheet = {}; // private style sheet

  // uuMeta.style.sheet.create - create StyleSheet
function create(id) { // @param String: StyleSheet id
                      // @return StyleSheet: new or already object
  if (id in _sheet) {
    return _sheet[id]; // already exists
  }
  var elm, _doc = document;

  if (_ua.ie) {
    _sheet[id] = _doc.createStyleSheet();
  } else {
    elm = _doc.createElement("style");
    elm.appendChild(_doc.createTextNode(""));
    _sheet[id] = _mm.node.head.appendChild(elm);
  }
  return _sheet[id];
}

// uuMeta.style.sheet.insertRule - insert CSS rule
function insertRule(id,      // @param String: StyleSheet id
                    expr,    // @param String: css selector
                    decl,    // @param String: css declaration
                    index) { // @param Number(= last): insertion position
                             // @return Number: inserted rule index
                             //                 or -1(error)
  if (!(id in _sheet)) { return -1; }

  var r = _sheet[id];

  if (_ua.ie) {
    index = (index === void 0) ? r.rules.length : index;
    r.addRule(_mm.trim(expr), _mm.trim(decl), index);
  } else {
    index = (index === void 0) ? r.sheet.cssRules.length : index;
    index = r.sheet.insertRule(expr + "{" + decl + "}", index);
  }
  return index;
}

// uu.style.removeRule - remove CSS rule
function removeRule(id,      // @param String: StyleSheet id
                    index) { // @param Number(= last): deletion position
  if (!(id in _sheet)) { return; }

  var r = _sheet[id];

  if (_ua.ie) {
    index = (index === void 0) ? r.rules.length - 1 : index;
    (index >= 0) && r.removeRule(index);
  } else {
    index = (index === void 0) ? r.sheet.cssRules.length - 1 : index;
    (index >= 0) && r.sheet.deleteRule(index);
  }
}

// uuMeta.style.sheet.overwriteRules - overwrite all CSS rules
function overwriteRules(id,      // @param String: StyleSheet id
                        decls,   // @param Array: [(selector, declaration), ...]
                        index) { // @param Number(= last): insertion position
  if (!(id in _sheet)) { return; }

  var r = _sheet[id], ary = [], v, i = 0;

  if (_ua.ie) {
    while ( (v = decls[i++]) ) {
      ary.push(v, "{", decls[++i], "}");
    }
    r.cssText = ary.join("");
  } else {
alert("not impl");
  }

}

// uuMeta.style.sheet.removeAllRules - remove all CSS rules
function removeAllRules(id) {
  if (!(id in _sheet)) { return; }

  var r = _sheet[id], ie = _ua.ie,
      i = ie ? r.rules.length
             : r.sheet.cssRules.length;
  while (i--) {
    ie ? r.removeRule(i)
       : r.sheet.deleteRule(i);
  }
}

// --- initialize / export ---
_mm.mix(_mm.style.sheet, {
  create: create,
  insertRule: insertRule,
  removeRule: removeRule,
  overwriteRules: overwriteRules,
  removeAllRules: removeAllRules
});

})(); // uuMeta.style.sheet scope

