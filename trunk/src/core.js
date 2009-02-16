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
    TRIM_LEFT:    /^\s+/g,      // String.prototype.trimLeft()
    TRIM_RIGHT:   /\s+$/g,      // String.prototype.trimRight()
    SPLIT_TOKEN:  /[\b, ]+/,
    TRIM_TAIL_SLASH: /\/+$/,
    // :after :before :contains :digit :first-letter :first-line :link
    // :negative :playing :target :visited  !=  ?=  /=  <=  >=  &=  {  }
    CSS_REJECT:   /(:(a|b|co|dig|first-l|li|ne|p|t|v))|!=|\/=|<=|>=|&=|\{/ // }
  }
});

uu.mix(UU.CONFIG, {
  // UU.CONFIG.BASE_DIR - script base dir(lazy auto detection)
  BASE_DIR:   "",

  // UU.CONFIG.IMG_DIR - image base dir
  IMG_DIR:    "{BASE_DIR}img/",

  // UU.CONFIG.DEBUG_MODE - 1: enable debug mode
  DEBUG_MODE: 1,

  // UU.CONFIG.ASSERT - 1: enable assertion
  ASSERT:     1
}, 0, 0);

uu.mix(uu, {
  // uu.codec - codec package
  codec: {},

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

  // uu.id - id selector
  id: function(expr) { // String: "id"
    return uudoc.getElementById(expr);
    // return Node or null
  },

  // uu.tag - tagName selector
  tag: (function() {
    if (!UU.IE) {
      return function(expr,      // String: "*" or "tag"
                      context) { // Node(default: document): context
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

  // uu.className - className selector
  className: (function() {
    if (uudoc.getElementsByClassName) {
      return function(expr,      // JointString: "class" or "class1 class2 ..."
                      context) { // Node(default: document): context
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
      // /(?:^| )(AA|BB|CC)(?:$|(?= ))/g
      rex = RegExp("(?:^| )(" + name.join("|") + ")(?:$|(?= ))", "g");

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

  // uu.css - css selector
  css: function(expr,      // String: "css > rule"
                context) { // Node(default: document): context
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

  // uu.xpath - xpath selector
  xpath: function(expr,      // String: "./p[@id]"
                  context) { // Node(default: document): context
    try {
      var nodeList = uudoc.evaluate(expr, context, null, 7, null), // 7: SORT
          i = 0, iz = nodeList.snapshotLength, rv = Array(iz);
      for (; i < iz; ++i) {
        rv[i] = nodeList.snapshotItem(i);
      }
      return rv;
    } catch(err) {}
    return [];
  },

  // uu.toArray - convert FakeArray to Array
  toArray: (function() {
    if (!UU.IE) {
      return function(fake,        // FakeArray/Array: source
                      fromIndex) { // Number(default: 0): from index
        return Array.prototype.slice.call(fake, fromIndex || 0);
        // return Array
      };
    }
    return function(fake, fromIndex) {
      var rv = [], ri = -1, i = fromIndex || 0, iz = fake.length;
      for (; i < iz; ++i) {
        rv[++ri] = fake[i];
      }
      return rv;
    };
  })(),

  toAbsURL: function(url) { // URLString:
    if (!/^(file|https|http)\:\/\//.test(url)) {
      var div = uudoc.createElement("div");
      div.innerHTML = '<a href="' + url + '" />';
      url = div.firstChild ? div.firstChild.href
                           : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    return url;
  }
});

// --- detect base dir ---
// from: <script src="http://example.com/dir/uupaa.js"> 
// detect to: "http://example.com/dir"
(function(nodeList, config) {
  var v, i = 0, ary = (location.protocol + "//" +
                       location.pathname.replace(/\\/g, "/")).split("/");
  while ( (v = nodeList[i++]) ) {
    if (/uupaa.*\.js$/.test(v.src)) {
      ary = uu.toAbsURL(v.src).split("/");
      break;
    }
  }
  ary.pop(); // cut tail
  config.BASE_DIR = ary.join("/") + "/";

  if (/\{BASE_DIR\}/.test(config.IMG_DIR)) {
    config.IMG_DIR =
        uu.toAbsURL(config.IMG_DIR.replace(/\{BASE_DIR\}/, config.BASE_DIR));
  }
  config.IMG_DIR = config.IMG_DIR.replace(UU.UTIL.TRIM_TAIL_SLASH, "") + "/";
})(uudoc.getElementsByTagName("script"), UU.CONFIG);

// === OOP =================================================
// depend: none
uu.feat.oop = {};

// uu.Class - create a generic class
uu.Class = function(name,    // String: class name
                    proto) { // Hash(default: {}): prototype object
  // "this" is the window object, in this scope.
  uu.Class[name] = function() {
    var me = this;
    // "this" is the instance newly generated, in this scope.
    me.uuid || (me.uuid = uu.uuid()); // add "uuid" property
    me.msgbox && uu.msg && uu.msg.regist(me);
    me.construct && me.construct.apply(me, arguments);
    if (me.destruct && uu.unready) {
      uu.unready(function() { me.destruct(); });
    }
  }
  uu.Class[name].prototype = proto || {};
};

// uu.Class.Singleton - create a singleton class
uu.Class.Singleton = function(name,    // String: class name
                              proto) { // Hash(default: {}): prototype object
  uu.Class[name] = function() {
    var me = this, hash = arguments.callee;
    if (hash.instance) {
      me.stabled && me.stabled.apply(me, arguments); // after the second
    } else {
      hash.instance = me; // keep instance
      me.uuid || (me.uuid = uu.uuid()); // add "uuid" property
      me.msgbox && uu.msg && uu.msg.regist(me);
      me.construct && me.construct.apply(me, arguments);
      if (me.destruct && uu.unready) {
        uu.unready(function() { me.destruct(); });
      }
    }
    // hash.instance is returned. "this" is abandoned.
    return hash.instance;
  };
  uu.Class[name].prototype = proto || {};
};

// === Ready ===============================================
// depend: none
uu.feat.ready = {};

uu.mix(UU.CONFIG, {
  AUTO_RUN: "boot" // String(default: "boot"): uu.ready auto run function name
}, 0, 0);

(function() {
  var order = [0, [], [], []];

  function fire() {
    var i, j, jz, v;
    for (i = 1; i < 4; ++i) {
      for (j = 0, jz = order[i].length; j < jz; ++j) {
        order[i][j]();
      }
    }
    order = null; // purge
    (v = window[UU.CONFIG.AUTO_RUN]) && v(); // boot loader
  }

  (function LOOP() {
    uu.domReady ? fire() : setTimeout(LOOP, 0); // (2)
  })();

  uu.mix(uu, {
    // uu.domReady
    domReady: false,

    // uu.ready - ready event handler
    ready: function(fn,         // Function: callback function
                    priority) { // Number(default: 3): priority, 1 = high, 2 = mid, 3 = low
      priority = ((priority === void 0 ? 3 : priority) & 0x3) || 3;
      uu.domReady ? fn() : order[priority].push(fn);
    },

    // uu.unready - unready event handler
    unready: function(fn) { // Function: callback function
      UU.IE ? attachEvent("onunload", fn) // IE
            : addEventListener("unload", fn, false);
    }
  });

  (function(fn) {
    if (UU.IE || (UU.WEBKIT && uudoc.readyState)) {
      (function LOOP() {
        var ok = 0;
        try {
          // http://javascript.nwbox.com/IEContentLoaded/
          ok = UU.IE ? (uudoc.documentElement.doScroll("up") || 1)
                     : /loaded|complete/.test(uudoc.readyState);
        } catch(err) {}
        ok ? fn() : setTimeout(LOOP, 0);
      })();
    } else if (UU.GECKO || UU.OPERA) {
      uudoc.addEventListener("DOMContentLoaded", fn, false);
    } else {
      addEventListener("load", fn, false); // for legacy browser
    }
  })(function() { uu.domReady = true; }); // (1)
})();

// === Canvas Ready ========================================
// depend: ready
uu.feat.canvasReady = {};

uu.mix(uu.canvas, {
  // uu.canvasReady
  canvasReady: false,

  // uu.canvas.ready
  ready: function(fn,       // Function: callback function
                  canvas) { // Node(default: undefined): canvas element
    (function LOOP() {
      var ok = uu.canvasReady;
      if (canvas && UU.IE) {
        ok = canvas && canvas.getContext().contextReady;
      }
      ok ? fn() : setTimeout(LOOP, 32);
    })();
  }
});

!UU.IE && (function(fn) {
  if (UU.OPERA) {
    window.addEventListener("load", fn, false); // window.onload
  } else if (UU.WEBKIT || UU.GECKO) {
    uu.ready(fn); // DOMContentLoaded
  } else {
    fn(); // now
  }
})(function() { uu.canvasReady = true; });
