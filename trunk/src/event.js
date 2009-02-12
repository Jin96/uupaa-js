// === Event ===============================================
// depend: none
uu.feat.event = {};

uu.mix(UU.CONFIG, {
  EVENT: {}
}, 0, 0);

uu.mix(UU.CONFIG.EVENT, {
  // UU.CONFIG.EVENT.RENAME
  RENAME: {
    mousewheel: "DOMMouseScroll"
  },

  // UU.CONFIG.EVENT.KIND_BASE
  KIND_BASE: {
    // event.type   kind
    unknown:        0x0000,
    mousedown:      0x0001,
    mouseup:        0x0002,
    mousemove:      0x0003,
    mousewheel:     0x0004,
    clock:          0x0005,
    dblclock:       0x0006,
    DOMMouseScroll: 0x0104, // mousewheel
    losecapture:    0x0102  // mouseup
  }
}, 0, 0);

/** Event
 *
 * @class
 */
uu.Class("Event", {
  construct: function() {
    this._db = { /* uuid: [elm, type + cap, fn], ... */ };
  },

  // uu.Class.Event.attach - attach event handler
  attach: function(elm, type, obj, capture /* = false */) {
    return this._assign(obj)._impl(obj, elm, type, capture || 0, 1);
  },

  // uu.Class.Event.detach - detach event handler
  detach: function(elm, type, obj, capture /* = false */) {
    return this._impl(obj, elm, type, capture || 0, 2);
  },

  // uu.Class.Event.toggle - toggle event handler
  toggle: function(elm, type, obj, capture /* = false */) {
    return this._assign(obj)._impl(obj, elm, type, capture || 0, 3);
  },

  // uu.Class.Event.stop - execute stop-propagation and prevent-default
  stop: function(evt, cancel /* = true */) {
    cancel = cancel === void 0 || cancel;
    if (UU.IE) {
      evt.cancelBubble = true;
      cancel && (evt.returnValue = false);
    } else {
      evt.stopPropagation();
      cancel && evt.preventDefault();
    }
    return this;
  },

  // uu.Class.Event.kind - convert event type to event kind
  kind: function(evt,    // EventObject:
                 kind) { // Hash(default: UU.CONFIG.EVENT.KIND_BASE):
    kind = kind || UU.CONFIG.EVENT.KIND_BASE;
    return 0xff && (kind[evt.type] || 0); // 0 is unknown
  },


  // uu.Class.Event.key - get key state
  key: function(evt) {
    return {
      alt:   evt.altKey,
      shift: evt.shiftKey,
      ctrl:  evt.ctrlKey,
      key:   evt.which || window.keyCode
    };
  },

/*
  // uu.Class.Event.touch
  touch: function(evt) {
    var length = evt.touches.length;

    return {
      touches: length,
//      evt.touches[i].pageX, pageY

    };
  },
 */

  // uu.Class.Event.mouse - get mouse state
  mouse: function(evt, more /* = false */) {
    var x, y, ox, oy, cx, cy, iebody,
        left = 0, mid = 0, right = 0, click = 0, wheel = 0, button;

    if (UU.IE) {
      // x,y - offset from window, with scroll offset
      iebody = uudoc.documentElement || uudoc.body;
      x = evt.clientX + iebody.scrollLeft;
      y = evt.clientY + iebody.scrollTop;
    } else {
      x = evt.pageX;
      y = evt.pageY;
    }
    if (!more) {
      return { x: x, y: y };
    }

    // --- get more state ---
    if (UU.IE || UU.OPERA) {
      ox = offsetX;
      oy = offsetY;
    } else {
      ox = layerX;
      oy = layerY;
    }
    cx = clientX;
    cy = clientY;

    button = evt.button;
    if (UU.GECKO || evt.which) {
      switch (evt.which) {
      case 1: left  = 1; break;
      case 2: mid   = 1; break;
      case 3: right = 1; break;
      }
      click = evt.detail & 0x03; // click count(0Å`3)
    } else if (UU.IE || button) {
      if (button & 0x1) { left  = 1; }
      if (button & 0x4) { mid   = 1; }
      if (button & 0x2) { right = 1; }
    }
    // wheelDelta: Safari, IE
    // detail: Firefox
    if (evt.wheelDelta || evt.detail) {
      wheel = parseInt(evt.detail ? (evt.detail / 3)
                                  : (evt.wheelDelta / -120));
    }
    return { x: x, y: y,
             left: left, mid: mid, right: right,
             click: click, wheel: wheel };
  },

  // uu.Class.Event._assign - assign event handler
  _assign: function(me) {
    if ("_uuEventClosure" in me) { return this; } // assigned
    if (!me.handleEvent) { throw ""; } // rude

    if (UU.IE) {
      me._uuEventClosure = function(evt) {
        var src  = evt.srcElement,
            from = evt.fromElement;
        evt.target = src;
        evt.currentTarget = src;
        evt.relatedTarget = (src === from) ? evt.toElement : from;
        me.handleEvent(evt);
      };
    } else {
      me._uuEventClosure = me;
    }
    return this;
  },

  _impl: function(obj, elm, types, capture, mode) {
    // mode: attach:0x1, detach:0x2, toggle:0x3
    var uuid, ary, type, i, iz, fn = obj._uuEventClosure;

    if (fn === void 0 || elm === void 0 || !types) {
      throw "";
    }

    // add a non-standard proprty
    !("uuEventID" in elm) && (elm.uuEventID = []);

    // --- IE mouse capture ---
    if (UU.IE && capture && "setCapture" in elm) {

      uuid = this._find(elm, "losecapture", fn, 1);

      if (!uuid && (mode & 0x1)) { // mode attach(0x1) or toggle(0x3)
        elm.setCapture();
        this._attach(elm, "losecapture", fn, 1);
        elm.attachEvent("onlosecapture", fn);
      } else if (uuid && (mode & 0x2)) { // mode detach(0x2) or toggle(0x3)
        elm.releaseCapture();
        this._detach(uuid, elm);
        elm.detachEvent("onlosecapture", fn);
      }
    }

    ary = types.split(UU.UTIL.SPLIT_TOKEN);
    for (i = 0, iz = ary.length; i < iz; ++i) {
      type = ary[i];

      // rename "mousewheel" to "DOMMouseScroll"
      if (UU.GECKO && type in UU.CONFIG.EVENT.RENAME) {
        type = UU.CONFIG.EVENT.RENAME[type];
      }

      uuid = this._find(elm, type, fn, capture);

      if (!uuid && (mode & 0x1)) {
        this._attach(elm, type, fn, capture);
        UU.IE ? elm.attachEvent("on" + type, fn)
              : elm.addEventListener(type, fn, capture);
      }
      if (uuid && (mode & 0x2)) {
        this._detach(uuid, elm);
        UU.IE ? elm.detachEvent("on" + type, fn)
              : elm.removeEventListener(type, fn, capture);
      }
    }
    return this;
  },

  _attach: function(elm, type, fn, capture) {
    var uuid = uu.uuid(), typecap = type + (capture ? "1" : "0");
    this._db[uuid] = [elm, typecap, fn];
    elm.uuEventID[uuid] = 1; // element.uuEventID = { uuid: 1 };
  },

  _detach: function(uuid, elm) {
    delete elm.uuEventID[uuid];
    delete this._db[uuid];
  },

  _find: function(elm, type, fn, capture) { // find db
    var uuid, v, typecap = type + (capture ? "1" : "0");
    for (uuid in elm.uuEventID) {
      v = this._db[uuid];
      if (v && v[1] === typecap && v[2] === fn) {
        return uuid; // found
      }
    }
    return 0;
  }
});

uu.event = new uu.Class.Event();
