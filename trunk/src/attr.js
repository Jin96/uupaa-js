// === Attribute ===========================================
// depend: none
uu.feat.attr = {};

(function() {
var ATTR_ALIAS  = { "class": "className", "for": "htmlFor" },
    ATTR_IE_BUG = { href: 1, src: 1 };

uu.attr = {
  // uu.attr.get - get attribute
  get: function(elm,      // Node:
                attrs) {  // JoinString: "attr" or "attr,attr,..."
    var rv = {}, ary = attrs.split(UU.UTIL.SPLIT_TOKEN), v, i = 0,
        ie = UU.IE, ie8 = UU.IE8MODE8;

    while ( (v = ary[i++]) ) {
      if (ie) {
        if (ie8 || ATTR_IE_BUG[v]) { // fix a[href^="#"]
          rv[v] = elm.getAttribute(v, 2) || "";
        } else {
          rv[v] = elm.getAttribute(ATTR_ALIAS[v] || v) || "";
        }
      } else {
        rv[v] = elm.getAttribute(v) || "";
      }
    }
    return rv; // return Hash( { name: value, ... } )
  },

  // uu.attr.set - set attribute
  set: function(elm,    // Node:
                hash) { // Hash: { attrName: attrValue, ... }
    var i, _buggy = UU.IE && !UU.IE8MODE8;

    for (i in hash) {
      elm.setAttribute(_buggy ? ATTR_ALIAS[i] || i : i, hash[i]);
    }
  }
};
})();
