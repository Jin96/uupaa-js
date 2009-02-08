// === Custom Event: Font Resize ===========================
// depend: advance,oop
uu.feat.event_fontResize = {};

/** Font Resize
 *
 * @class
 */
uu.Class.Singleton("EventFontResize", {
  construct: function() {
    this._fn = []; // Array( [callback function, ... ] )
    this._agent = this._createAgent();
    this._oh = this._agent.offsetHeight; // keep current height
    this._runner();
  },

  // uu.Class.EventFontResize.attach - attach event handler
  attach: function(fn) { // Function: callback function
    this._fn.push(fn);
  },

  // uu.Class.EventFontResize.detach - detach event handler
  detach: function(fn) { // Function: callback function
    var idx = this._fn.indexOf(fn);
    if (idx >= 0) {
      this._fn.splice(idx, 1);
    }
  },

  _createAgent: function() {
    var rv = uudoc.body.appendChild(uudoc.createElement("div"));
    rv.id = "uuEventFontResizeAgent";
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

uu.eventFontResize = null;
uu.ready(function() {
  uu.eventFontResize = new uu.Class.EventFontResize();
});
