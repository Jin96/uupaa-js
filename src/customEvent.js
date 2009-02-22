// === Custom Event ========================================
// depend: boost,event,ua
uu.feat.customEvent = {};

// === Custom Event: Font Resize ===========================
uu.Class.Singleton("CustomEventResizeFont", {
  construct: function() {
    this._fn = []; // Array( [callback function, ... ] )
    this._agent = this._createAgent();
    this._oh = this._agent.offsetHeight; // keep current height
    this._runner();
  },

  // uu.Class.CustomEventResizeFont.attach - attach event handler
  attach: function(fn) { // Function: callback function
    this._fn.push(fn);
  },

  // uu.Class.CustomEventResizeFont.detach - detach event handler
  detach: function(fn) { // Function: callback function
    var idx = this._fn.indexOf(fn);
    if (idx >= 0) {
      this._fn.splice(idx, 1);
    }
  },

  _createAgent: function() {
    uu.customEvent && uu.customEvent.disable();

    var rv = uudoc.body.appendChild(uudoc.createElement("div"));
    rv.id = "uuCustomEventResizeFontAgent";
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

uu.customEventResizeFont = null;
uu.ready(function() {
  uu.customEventResizeFont = new uu.Class.CustomEventResizeFont();
}, 2);

// === Custom Event: Body Resize ===========================
uu.Class.Singleton("CustomEventResizeBody", {
  construct: function() {
    this._fn = []; // Array( [callback function, ... ] )
    var div = this._createAgent();
    this._agent = div;
    this._width = div.clientWidth;
    this._height = div.clientHeight;
    this._runner();
  },

  // uu.Class.CustomEventResizeBody.attach - attach event handler
  attach: function(fn) { // Function: callback function
    this._fn.push(fn);
  },

  // uu.Class.CustomEventResizeBody.detach - detach event handler
  detach: function(fn) { // Function: callback function
    var idx = this._fn.indexOf(fn);
    if (idx >= 0) {
      this._fn.splice(idx, 1);
    }
  },

  _createAgent: function() {
    uu.customEvent && uu.customEvent.disable();

    var div = uudoc.createElement("div");
    div.id = "uuCustomEventResizeBodyAgent";
    div.style.cssText =
        "position:absolute;width:100%;height:100%;visibility:hidden;z-index:-5000";
    // first child
    uudoc.body.firstChild ? uudoc.body.insertBefore(div, uudoc.body.firstChild)
                          : uudoc.body.appendChild(div);

    uu.customEvent && uu.customEvent.enable();
    return div;
  },

  _runner: function() {
    var me = this;
    (function WINDOW_RESIZE_RUNNER() {
      var v, i, iz, fire = 0;

      if (me._width  !== me._agent.clientWidth ||
          me._height !== me._agent.clientHeight) {
        me._width  = me._agent.clientWidth;
        me._height = me._agent.clientHeight;
        ++fire;
      }

      if (fire) {
        for (i = 0, iz = me._fn.length; i < iz; ++i) {
          v = me._fn[i];
          v && v(); // callback function
        }
      }
      setTimeout(WINDOW_RESIZE_RUNNER, 1000);
    })();
  }
});

uu.customEventResizeBody = null;
uu.ready(function() {
  uu.customEventResizeBody = new uu.Class.CustomEventResizeBody();
}, 2);

// === Custom Event ========================================
UU.CONFIG.CUSTOM_EVENT = {
  NOTIFY:           0x01, // without node
  ADD_ELEMENT:      0x02, // with node
  REMOVE_ELEMENT:   0x04, // with node
  UPDATE_ELEMENT:   0x08,
  RESIZE_VIEWPORT:  0x10, // resize window
  RESIZE_BODY:      0x20, // resize body (one shot)
  RESIZE_FONT:      0x40, // resize font
  ALL:              0xff
};

uu.Class.Singleton("CustomEvent", {
  construct: function() {
    this._fn = []; // Array( [[callback function, customEvent], ... ] )
    this._enable = true;
    this._lastEvent = 0x0; // infinitely resize guard

    // set event handler
    var me = this;

    uu.customEventResizeFont.attach(function() {
      uu.style.unit(1);
      me.fire(UU.CONFIG.CUSTOM_EVENT.RESIZE_FONT);
    });

    uu.customEventResizeBody.attach(function() {
      me.fire(UU.CONFIG.CUSTOM_EVENT.RESIZE_BODY);
    });

    uu.event.attach(window, "resize", this);

    if (UU.IE && uu.ua.version < 8) {
      // hook add element for IE6, IE7
      if (uu.windowReady) {
        setAgent();
      } else {
        window.attachEvent("onload", setAgent);
      }
    }

    function setAgent() {
      uudoc.createStyleSheet().cssText =
          "*{behavior:expression(uu.Class.CustomEvent._addElement(this))}";
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
  fire: function(customEvent, // Number(default: 0x01): customEvent
                 node) {      // Node(default: undefined):
    customEvent = customEvent === void 0 ? 0x01 : customEvent;

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
