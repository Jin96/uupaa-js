// === Custom Event ========================================
// depend: boost
uu.feat.customEvent = {};

// === Custom Event: Font Resize ===========================
/** Font Resize
 *
 * @class
 */
uu.Class.Singleton("CustomEventFontResize", {
  construct: function() {
    this._fn = []; // Array( [callback function, ... ] )
    this._agent = this._createAgent();
    this._oh = this._agent.offsetHeight; // keep current height
    this._runner();
  },

  // uu.Class.CustomEventFontResize.attach - attach event handler
  attach: function(fn) { // Function: callback function
    this._fn.push(fn);
  },

  // uu.Class.CustomEventFontResize.detach - detach event handler
  detach: function(fn) { // Function: callback function
    var idx = this._fn.indexOf(fn);
    if (idx >= 0) {
      this._fn.splice(idx, 1);
    }
  },

  _createAgent: function() {
    var rv = uudoc.body.appendChild(uudoc.createElement("div"));
    rv.id = "uuCustomEventFontResizeAgent";
    rv.style.cssText = "position:absolute;font-size:large;visibility:hidden;" +
                       "height:1em;top:-10em;left:-10em";
    return rv;
  },

  _runner: function() {
    var solver = this;
    (function FONT_RESIZE_RUNNER() {
      // peek resize font
      if (solver._oh !== solver._agent.offsetHeight) {
        solver._oh = solver._agent.offsetHeight; // store
        var v, i = 0, iz = solver._fn.length;
        for (; i < iz; ++i) {
          v = solver._fn[i];
          v && v(); // callback function
        }
      }
      setTimeout(FONT_RESIZE_RUNNER, 1000);
    })();
  }
});

uu.customEventFontResize = null;
uu.ready(function() {
  uu.customEventFontResize = new uu.Class.CustomEventFontResize();
}, 2);

// === Custom Event: Revalidate View ===========================
/** Revalidate View
 *
 * @class
 */
uu.Class.Singleton("CustomEventView", {
  construct: function() {
    this._fn = []; // Array( [[callback function, kind], ... ] )
  },

  // uu.Class.CustomEventView.attach - attach event handler
  attach: function(fn,     // Function: callback function
                   kind) { // Number: kind, 1 = add element, 2 = resize
    this._fn.push([fn, kind]);
  },

  // uu.Class.CustomEventView.detach - detach event handler
  detach: function(fn) { // Function: callback function
    var idx = -1, i = 0, iz = this._fn.length;
    for (; i < iz; ++i) {
      if (i in this._fn) {
        if (this._fn[i][0] === fn) {
          idx = i;
          break;
        }
      }
    }
    if (idx >= 0) {
      this._fn.splice(idx, 1);
    }
  },

  // uu.Class.CustomEventView.revalidate - revalidate view
  revalidate: function(kind) { // Number(default: 3): kind, 1 = add element, 2 = resize, 3 = all
    kind = kind === void 0 ? 3 : kind;
    var v, i = 0;
    while ( (v = this._fn[i++]) ) {
      if (kind & v[1]) {
        v[0](); // callback
      }
    }
  }
});

uu.customEventView = null;
uu.ready(function() {
  uu.customEventView = new uu.Class.CustomEventView();
}, 2);
