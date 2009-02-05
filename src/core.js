// === <<global namespace pollution>> ======================
var uu, // core and class namespace
    UU, // const and config namespace
    uudoc = document; // document cache

// === core ================================================
if (!UU) {
  window.UU = UU = {}; // hash
}
window.uu = uu = function() {
  return uu._impl.apply(this, arguments); // adapter
};

// uu.mix - mixin
uu.mix = function(base,       // Hash: mixin base
                  flavor,     // Hash: add flavor
                  aroma,      // Hash(default: undefined): add aroma
                  override) { // Boolean(default: true): true is override base
  var i, ride = (override === void 0) || override;

  for (i in flavor) {
    if (ride || !(i in base)) {
      base[i] = flavor[i];
    }
  }
  return aroma ? uu.mix(base, aroma, null, ride) : base;
  // return Hash
};

uu.mix(UU, {
  VERSION:  0.01, // {major}.{minor{release}}
  CONFIG:   UU.CONFIG || {},
  // --- tiny UserAgent detection ---
  WEBKIT:   navigator.userAgent.indexOf("WebKit") > 0,
  GECKO:    navigator.userAgent.indexOf("Gecko/") > 0,
  OPERA:    !!window.opera,
  IE:       !!uudoc.uniqueID,
  IE8MODE8: uudoc.uniqueID && uudoc.documentMode >= 8,
  // --- utility ---
  UTIL: {
    // --- regexp ---
    TRIM:         /^\s+|\s+$/g, // String.prototype.trim()
    TRIM_LEFT:    /^\s+$/g,     // String.prototype.trimLeft()
    TRIM_RIGHT:   /\s+$/g,      // String.prototype.trimRight()
    TRIM_QUOTE:   /^\s*["']?|["']?\s*$/g,
    SPLIT_TOKEN:  /[\b, ]+/,
    // :after :before :contains :digit :first-letter :first-line :link
    // :negative :playing :target :visited  !=  ?=  /=  <=  >=  &=  {  }
    CSS_REJECT:   /(:(a|b|co|dig|first-l|li|ne|p|t|v))|!=|\/=|<=|>=|&=|\{/ // }
  }
});

uu.mix(UU.CONFIG, {
  BASE_DIR:   "", // script base dir(lazy auto detection)
  DEBUG_MODE: 1,  // 1: enable debug mode
  ASSERT:     1   // 1: enable assertion
}, 0, 0);

uu.mix(uu, {
  state: {
    // uu.state.domReady - DOMReady state(true: ready, false: not ready)
    domReady: false,
    // uu.state.canvasReady - CanvasReady state(true: ready, false: not ready)
    canvasReady: false
  },

  // uu.uuid - get UUID
  uuid: function() {
    return ++uu._uuid;
  },
  _uuid: 0,

  // uu.feat - load feature
  feat: function(feat,   // JointString: "feat" or "feat,feat..."
                 fn,     // Function(default: undefined): callback function
                 url1,   // String(default: ""): primary url
                 url2) { // String(default: ""): secondary url
    uu.feat.loadFrom(url1 || UU.CONFIG.FEAT_URL1, feat, function(ok, miss) {
      if (ok) {
        fn && fn(); // loaded
      } else {
        if (!url2) { throw miss; }
        uu.feat.loadFrom(url2 || UU.CONFIG.FEAT_URL2, miss, function(ok, miss) {
          if (!ok) { throw miss; }
          fn && fn(); // safeguard
        });
      }
    });
  },

  // uu.style - get all style property(faster)
  style: function(elm) { // Node:
    return UU.IE ? (elm.currentStyle || elm.style)
                 : uudoc.defaultView.getComputedStyle(elm, "");
    // return currentStyle or CSS2Properties(read only)
  },

  // uu.canvas - initialize canvas
  canvas: function(canvas, // Node: generated canvas node
                   vml) {  // Boolean(default: false): force VML rendering(in IE)
    return UU.IE ? uu.canvas._initDynamicElement(canvas, vml)
                 : canvas;
    // return canvas node
  },

  // uu.id - query id
  id: function(expr) { // String: "id"
    return uudoc.getElementById(expr);
    // return Node or null
  },

  // uu.tag - query tagName
  tag: (function() {
    if (!UU.IE) {
      return function(expr,      // String: "*" or "tag"
                      context) { // Node(default: document): query context
        return Array.prototype.slice.call(
                    (context || uudoc).getElementsByTagName(expr));
        // return NodeArray( [Node, Node, ...] ) or EmptyArray( [] )
      }
    }
    return function(expr, context) {
      var nodeList = (context || uudoc).getElementsByTagName(expr),
          rv = [], ri = -1, v, i = 0;
      if (expr !== "*") {
        while ( (v = nodeList[i++]) ) {
          rv[++ri] = v;
        }
      } else { // ie: getElementsByTagName("*") has comment nodes
        while ( (v = nodeList[i++]) ) {
          (v.nodeType === 1) && (rv[++ri] = v);
        }
      }
      return rv;
    };
  })(),

  // uu.className - query className
  className: (function() {
    if (uudoc.getElementsByClassName) {
      return function(expr,      // JointString: "class" or "class1 class2 ..."
                      context) { // Node(default: document): query context
        return Array.prototype.slice.call(
                    (context || uudoc).getElementsByClassName(expr));
        // return NodeArray( [Node, Node, ...] ) or EmptyArray( [] )
      };
    }
    return function(expr, context) {
      var nodeList = (context || uudoc).getElementsByTagName("*"),
          name = expr.replace(UU.UTIL.TRIM, "").split(/\s+/),
          rv = [], ri = -1, v, match, c, i = 0, nz = name.length, rex,
          urv = [], uri = -1, unq = {}, u = 0;

      if (nz > 1) { // #fix 170b
        while ( (v = name[u++]) ) {
          if (!(v in unq)) {
            unq[v] = 1;
            urv[++uri] = v;
          }
        }
        name = urv, nz = uri + 1;
      }
      // /(?:^| )(AA|BB|CC)(?:$| )/g
      rex = RegExp("(?:^| )(" + name.join("|") + ")(?:$| )", "g");

      while ( (v = nodeList[i++]) ) {
        c = v.className;
        if (c) {
          match = c.match(rex);
          (match && match.length >= nz) && (rv[++ri] = v);
        }
      }
      return rv;
    };
  })(),

  // uu.css - query css
  css: function(expr,      // String: "css > rule"
                context) { // Node(default: document): query context
    if (uudoc.querySelectorAll) {
      if (!UU.UTIL.CSS_REJECT.test(expr)) {
        try {
          return uu.toArray((context || uudoc).querySelectorAll(expr));
        } catch(err) {} // case: extend pseudo class / operators
      }
    }
    return uu.css.querySelectorAll(expr.replace(UU.UTIL.TRIM, ""),
                                   context || uudoc);
    // return NodeArray( [Node, Node, ...] ) or EmptyArray( [] )
  },

  // uu.toArray - convert FakeArray to Array
  toArray: (function() {
    if (!UU.IE) {
      return function(source,      // FakeArray/Array: source
                      fromIndex) { // Number(default: 0): from index
        return Array.prototype.slice.call(source, fromIndex || 0);
        // return Array
      };
    }
    return function(source, fromIndex) {
      var rv = [], v, i = 0, fidx = fromIndex || 0;
      while ( (v = source[fidx++]) ) {
        rv[i++] = v;
      }
      return rv;
    };
  })()
});

// --- detect base dir ---
(function(loc, nodeList) {
  UU.BASE_DIR = loc.protocol + "//" + loc.pathname.replace(/\\/g, "/");
  var v, i = 0, ary, src, div = uudoc.createElement("div");
  // <script src="http://example.com/dir/uupaa.js">
  // detected BASE_DIR = "http://example.com/dir"
  while ( (v = nodeList[i++]) ) {
    if (/uupaa.*\.js$/.test(v.src)) {
      if (/^(file|https|http)\:\/\//.test(v.src)) { // judge abs path
        src = v.src;
      } else {
        div.innerHTML = '<a href="' + v.src + '" />';
        src = div.firstChild ? div.firstChild.href
                             : /href\="([^"]+)"/.exec(div.innerHTML)[1];
      }
      ary = src.split("/");
      ary.pop(); // chop tail("uupaa.js")
      UU.BASE_DIR = ary.join("/"); // reset base dir
      break;
    }
  }
})(location, uudoc.getElementsByTagName("script"));
