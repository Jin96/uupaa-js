
// === String++ ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

uu.split.token = uusplittoken;

// uu.split.token - split token
function uusplittoken(expr,     // @param String: expression
                      splitter, // @param String(= " "):
                      notrim) { // @param Boolean(= false): true is trim space
                                // @return Array: ["token", ...]
  splitter = splitter || " ";
  if (expr.indexOf(splitter) < 0) { return [expr]; }

  var rv = [], ary = expr.split(""), v, w, i = -1,
      nest = 0, quote = 0, q, tmp = [], ti = -1, esc = 0,
      TOKEN = { "(": 2, ")": 3, '"': 4, "'": 4, "\\": 5 }; // [!]keep local

  TOKEN[splitter] = 1;

  while ( (v = ary[++i]) ) {
    if (esc) {
      esc = 0;
      tmp[++ti] = v;
    } else {
      switch (TOKEN[v] || 0) {
      case 0: tmp[++ti] = v;
              break;
      case 1: if (!quote) {
                if (nest) {
                  tmp[++ti] = v;
                } else {
                  w = tmp.join(""),
                  rv.push(notrim ? w : uu.trim(w));
                  tmp = [];
                  ti = -1;
                }
              } else {
                tmp[++ti] = v;
              }
              break;
      case 2: tmp[++ti] = v;
              !quote && ++nest;
              break;
      case 3: tmp[++ti] = v;
              !quote && --nest;
              break;
      case 4: if (!quote) {
                quote = 1;
                q = v;
              } else if (v === q) {
                quote = 0;
              }
              tmp[++ti] = v;
              break;
      case 5: esc = 1;
              tmp[++ti] = v;
      }
    }
  }
  // remain
  if (tmp.length) {
    w = tmp.join("");
    rv.push(notrim ? w : uu.trim(w));
  }
  return rv;
}

})(window, document, uu);

