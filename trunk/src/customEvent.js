// === Custom Event ========================================
// depend: boost,event,ua
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
    uu.customEvent && uu.customEvent.disable();

    var rv = uudoc.body.appendChild(uudoc.createElement("div"));
    rv.id = "uuCustomEventFontResizeAgent";
    rv.style.cssText = "position:absolute;font-size:large;visibility:hidden;" +
                       "height:1em;top:-10em;left:-10em";

    uu.customEvent && uu.customEvent.enable();
    return rv;
  },

  _runner: function() {
    var me = this;
    (function FONT_RESIZE_RUNNER() {
      var v, i, iz, offsetHeight, fire = 0;

      uu.customEvent && uu.customEvent.disable();

      // peek resize font
      offsetHeight = me._agent.offsetHeight;
      if (me._oh !== offsetHeight) {
        me._oh = offsetHeight; // store
        ++fire;
      }

      uu.customEvent && uu.customEvent.enable();

      if (fire) {
        for (i = 0, iz = me._fn.length; i < iz; ++i) {
          v = me._fn[i];
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

// === Custom Event ========================================
UU.CONFIG.CUSTOM_EVENT = {
  ADD_ELEMENT:      0x01, // with node
  REMOVE_ELEMENT:   0x02, // with node
  UPDATE_ELEMENT:   0x04,
  RESIZE_VIEWPORT:  0x10, // resize window
  RESIZE_FONT:      0x20, // resize font
  ALL:              0xff
};

uu.Class.Singleton("CustomEvent", {
  construct: function() {
    this._fn = []; // Array( [[callback function, customEvent], ... ] )
    this._enable = true;
    this._lastEvent = 0x0; // infinitely resize guard

    // set event handler
    var me = this;

    uu.customEventFontResize.attach(function() {
      uu.style.unit(1);
      me.fire(UU.CONFIG.CUSTOM_EVENT.RESIZE_FONT);
    });

    uu.event.attach(window, "resize", this);

    if (UU.IE && uu.ua.version < 8) {
      // hook add element for IE6, IE7
      window.attachEvent("onload", function() {
        uudoc.createStyleSheet().cssText =
            "*{behavior:expression(uu.Class.CustomEvent._addElement(this))}";
      });
    }
  },

  handleEvent: function(evt) {
    if (this._enable) {
      if (evt.type === "resize") {
        this.fire(UU.CONFIG.CUSTOM_EVENT.RESIZE_VIEWPORT);
      }
    }
  },

  // uu.Class.CustomEvent.enable
  enable: function() {
    this._enable = true;
  },

  // uu.Class.CustomEvent.disable
  disable: function() {
    this._enable = false;
  },

  // uu.Class.CustomEvent.attach - attach event handler
  attach: function(fn,            // Function: callback function
                   customEvent) { // Number: customEvent, UU.CONFIG.CUSTOM_EVENT...
    this._fn.push([fn, customEvent]);
  },

  // uu.Class.CustomEvent.detach - detach event handler
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

  // uu.Class.CustomEvent.fire - revalidate
  fire: function(customEvent, // Number(default: 0xff): customEvent
                 node) {      // Node(default: undefined):
    customEvent = customEvent === void 0 ? 0xff : customEvent;

    if (this._enable) {
      if (customEvent & UU.CONFIG.CUSTOM_EVENT.RESIZE_VIEWPORT &&
          customEvent & this._lastEvent) {
        customEvent = customEvent & ~UU.CONFIG.CUSTOM_EVENT.RESIZE_VIEWPORT;
      }
      this._lastEvent = customEvent;

      var v, i = 0;
      while ( (v = this._fn[i++]) ) {
        if (customEvent & v[1]) {
          v[0](customEvent, node); // callback
        }
      }
    }
  }
});

// static function
uu.mix(uu.Class.CustomEvent, {
  // uu.Class.CustomEvent._addElement
  _addElement: function(elm) {
    // @see http://d.hatena.ne.jp/uupaa/20081129/1227951320
    if (elm.style.behavior === "none") { return; } // guard: text selection + drag

    uu.customEvent.disable();

    elm.style.behavior = "none"; // disable CSS::expression

    uu.customEvent.enable();

    if (elm.nodeType === 1) {
      // hook remove element
      (function(node) {
        var rm = node.removeChild;
        node.removeChild = function(oldChild) {
          var rv = rm(oldChild);
          uu.customEvent.fire(UU.CONFIG.CUSTOM_EVENT.REMOVE_ELEMENT, rv);
          return rv;
        }
      })(elm);

      uu.customEvent.fire(UU.CONFIG.CUSTOM_EVENT.ADD_ELEMENT, elm);
    }
  }
});

uu.customEvent = null;
uu.ready(function() {
  uu.customEvent = new uu.Class.CustomEvent();
}, 2); // 2: mid
