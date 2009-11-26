// === uuMeta.evt ===
// depend: uuMeta
/*
uuMeta.evt.code(evt) - return Number(EVENT_CODE)
uuMeta.evt.once(node, "click", callback, capture = false)
uuMeta.evt.tidy(evt) - return EventObject
uuMeta.evt.stop(evt)
uuMeta.evt.bind(node, "click", callback, capture = false)
uuMeta.evt.unbind(node, "click", callback, capture = false)
uuMeta.evt.unbindAll(node, "click")
uuMeta.evt.toggle(node, "click", callback, capture = false)
uuMeta.evt.resize(callback, type = false)
uuMeta.evt.EVENT_CODE - event code and bits filter
 */
// ::event.keyCode
//    http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents

(function uuMetaEventScope() {
var _mm = uuMeta,
    _ie = _mm.ua.ie,
    _eventdb = {}, // { nodeid1: "event_cap,type_cap,strings_cap,",
                   //   nodeid2: "click_0,mousemove_0,", ... }
    _eventfn = {}, // { "nodeid1click_0,": callback, ... }
    _MOUSE_EVENT = /^mouse|click$/, // IE mouse event capture
    _EVENT_ALIAS = _mm.ua.gecko ? { mousewheel: "DOMMouseScroll" } : {},
    _EVENT_CLICKS = { click: 1, dblclick: 2 },
    _EVENT_CODE = {
      // event.type   code
      unknown:        0x000,
      mousedown:      0x001,
      mouseup:        0x002,
      mousemove:      0x003,
      mousewheel:     0x004,
      click:          0x005,
      dblclick:       0x006,
      keydown:        0x007,
      keypress:       0x008,
      keyup:          0x009,
      mouseenter:     0x00a,
      mouseleave:     0x00b,
      mouseover:      0x00c,
      mouseout:       0x00d,
      losecapture:    0x102, // mouseup for IE
      DOMMouseScroll: 0x104  // mousewheel for gecko
    },
    // for resize event
    _resizedb1 = { delay:  40, lock: 0, kill: 0, callback: {} },
    _resizedb2 = { delay: 100, lock: 0, kill: 0, callback: {} };

// uuMeta.evt.code - convert event-type to event-code
function code(evt) { // @param EventObject:
                     // @return Number: event code
  return (_EVENT_CODE[evt.type] || 0) & 255;
}

// uuMeta.evt.bind - bind event
function bind(node,      // @param Node: target node
              name,      // @param JointString: "click,or,customEvent"
              callback,  // @param Function/instance:
              capture) { // @param Boolean(= false):
  _manageevent(node, name, callback, capture || 0, 1);
}

// uuMeta.evt.unbind - unbind event
function unbind(node,      // @param Node: target node
                name,      // @param JointString: "click,or,customEvent"
                callback,  // @param Function/instance:
                capture) { // @param Boolean(= false):
  _manageevent(node, name, callback, capture || 0, 2);
}

// uuMeta.evt.unbindAll - unbind all
function unbindAll(node,   // @param Node:
                   name) { // @param JointString(= ""): "click,or,customEvent"
  var nid = _mm.node.id(node), types = _eventdb[nid], ary, v, w, i = 0;

  if (nid in _eventdb) {
    if (name) {
      if (types.indexOf(name + "_0,") >= 0) {
        _manageevent(node, name, _eventfn[nid + name + "_0"], 0, 2);
      }
      if (types.indexOf(name + "_1,") >= 0) {
        _manageevent(node, name, _eventfn[nid + name + "_1"], 1, 2);
      }
    } else {
      ary = types.split(",");
      while ( (v = ary[i++]) ) {
        w = v.split("_");
        _manageevent(node, w[0], _eventfn[nid + w[0] + w[1]], w[1]*1, 2);
      }
    }
  }
}

// uuMeta.evt.toggle - toggle event
function toggle(node,      // @param Node: target node
                name,      // @param JointString: "click,or,customEvent"
                callback,  // @param Function/instance:
                capture) { // @param Boolean(= false):
  _manageevent(node, name, callback, capture || 0, 3);
}

// uuMeta.evt.once - one time event
function once(node,      // @param Node: target node
              name,      // @param String: "click"
              callback,  // @param Function: callback
              capture) { // @param Boolean(= false):
  function warp() {
    callback();
    _mm.detachEvent(node, name, warp, capture || 0);
  }
  _mm.attachEvent(node, name, warp, capture || 0);
}

// uuMeta.evt.fire - fire event / custom event
//    none capture event only
function fire(node,   // @param Node: target node
              name,   // @param String: "click" or "customEvent"
              args) { // @param Array: [arg, ...]
  var nid = _mm.node.id(node),
      evt = { stopPropagation: _mm.vain,
              preventDefault: _mm.vain,
              uutidy: { code: code,
                        type: type,
                        target: node,
                        currentTarget: node,
                        relatedTarget: node
                      }
            };

  if (nid in _eventdb &&
      _eventdb[nid].indexOf(name + "_0,") >= 0) {
    _eventfn[nid + name + "_0"].apply(this, args.slice().unshift(evt));
  }
}

// inner -
function _manageevent(node, names, callback, capture, mode) {
  var ary   = names.split(","), name, i = 0,
      fn    = callback,
      nid   = _mm.node.id(node),
      types = _eventdb[nid] || (_eventdb[nid] = ""),
      ask   = name + (capture ? "_1," : "_0,"), // "click_0,"
      done  = (types.indexOf(ask) >= 0);

  if (typeof callback !== "function") {
    if (!callback.handleEvent) {
      throw "need Object.prototype.handleEvent";
    }
//  callback.uueventclosure || _setupEventClosure(callback);
//  fn = callback.uueventclosure;
    callback.uueventclosure ||
        (callback.uueventclosure = function(evt) {
          callback.handleEvent(_mm.evt.tidy(evt));
        });
    fn = callback.uueventclosure;
  }

  while ( (name = ary[i++]) ) {
    name = _EVENT_ALIAS[name] || name;

    if (capture && _ie && _MOUSE_EVENT.test(name)) {
      _event(node, "losecapture", fn, capture = 0);
    }
    if (!done && (mode & 1)) {
      _ie && (name === "losecapture") && node.setCapture();
      _eventdb[nid] += ask;
      _eventfn[nid + ask] = fn;
      _mm.attachEvent(node, name, fn, capture);
    }
    if (done && (mode & 2)) {
      _ie && (name === "losecapture") && node.releaseCapture();
      _eventdb[nid].replace(ask, "");
      delete _eventfn[nid + ask];
      _mm.detachEvent(node, name, fn, capture);
    }
  }
}

// inner -
/*
function _setupEventClosure(instance) {
  if (_ie) {
    instance.uueventclosure = function(evt) {
      instance.handleEvent(tidy(evt || event));
    };
  } else {
    instance.uueventclosure = instance;
  }
}
 */

// uuMeta.evt.tidy - event compat
function tidy(evt) { // @param EventObject:
                     // @return EventObject:
  var code = (_EVENT_CODE[evt.type] || 0) & 255,
      wheel = 0,
      clicks = 0,
      keyCode = evt.keyCode || evt.charCode;

  if (_mm.ua.webkit && evt.target.nodeType === 3) { // 3: TEXT_NODE
    evt.target = evt.target.parentNode;
  }
  if (code === _EVENT_CODE.mousewheel) {
    wheel = (evt.detail ? (evt.detail / 3)
                        : (evt.wheelDelta / -120)) | 0;
  } else {
    clicks = (evt.detail || 0) & 0x03 || _EVENT_CLICKS[evt.type] || 0;
  }
  evt.uutidy = {
    code:           code,
    type:           evt.type,
    target:         evt.target,
    currentTarget:  evt.currentTarget,
    relatedTarget:  evt.relatedTarget,
    pageX:          evt.pageX, // abs x
    pageY:          evt.pageY, // abs y
    offsetX:        evt.layerX | evt.offsetX, // Opera = offsetX
    offsetY:        evt.layerY | evt.offsetY, // Opera = offsetY
    altKey:         evt.altKey,
    shiftKey:       evt.shiftKey,
    metaKey:        evt.metaKey,
    keyCode:        keyCode,
    wheel:          wheel,
    clicks:         clicks,
    button:         evt.button
  };
  return evt;
}

// inner -
function tidyIE(evt) {
  evt = evt || _win.event;
  var code = (_EVENT_CODE[evt.type] || 0) & 255,
      src  = evt.srcElement || _doc,
      from = evt.fromElement,
      btn  = evt.button,
      root = _doc[_quirks ? "body" : "documentElement"];

  evt.stopPropagation = function() { evt.cancelBubble = true; };
  evt.preventDefault  = function() { evt.returnValue  = true; };
  evt.uutidy = {
    code:           code,
    type:           evt.type,
    target:         src,
    currentTarget:  src,
    relatedTarget:  (src === from) ? evt.toElement : from,
    pageX:          evt.x + root.scrollLeft, // abs x
    pageY:          evt.y + root.scrollTop,  // abs y
    offsetX:        evt.offsetX,
    offsetY:        evt.offsetY,
    altKey:         evt.altKey,
    shiftKey:       evt.shiftKey,
    metaKey:        evt.ctrlKey,
    keyCode:        evt.keyCode,
    wheel:          (evt.wheelDelta / -120) | 0,
    clicks:         _EVENT_CLICKS[evt.type] || 0,
    button:         !btn ? void 0 : (btn & 1) ? 0 : (btn & 2) ? 1 : 2
  };
  return evt;
}

// uuMeta.evt.stop - stop stopPropagation and preventDefault
function stop(evt) { // @param EventObject(= void 0):
  evt = evt || window.event;
  _ie ? (evt.cancelBubble = true) : evt.stopPropagation();
  _ie ? (evt.returnValue = false) : evt.preventDefault();
}

// uuMeta.evt.resize
function resize(callback, // @param Function: callback function
                agent) {  // @param Boolean(= false): resize agent
  var db = agent ? _resizedb2 : _resizedb1;

  if (!db.callback.length) { // init
    agent ? (db.dim = _mm.getInnerSize())
          : _mm.attachEvent(window, "resize", _resizeevent1);
  }
  db.callback[_mm.guid()] = callback; // regist
  agent && setTimeout(_resizeevent2loop, db.delay);
}

// uuMeta.evt.resizeStop
function resizeStop(agent) { // @param Boolean(= false): resize agent
  (agent ? _resizedb2 : _resizedb1).kill = 1;
}

// inner - resize event handler
function _resizeevent1() {
  var db = _resizedb1;

  if (db.kill) {
    _mm.detachEvent(window, "resize", _resizeevent1);
    return _resizeeventstop(db);
  }
  if (!db.lock++) {
    setTimeout(function(i) {
      for (i in _resizedb1.callback) {
        _resizedb1.callback[i]();
      }
      setTimeout(function() { _resizedb1.lock = 0; }, 0);
    }, db.delay);
  }
}

// inner - resize loop
function _resizeevent2loop() {
  var db = _resizedb2, i, dim;

  if (db.kill) {
    return _resizeeventstop(db);
  }
  if (!db.lock++) {
    dim = _mm.getInnerSize();
    if (db.dim.w !== dim.w || db.dim.h !== dim.h) { // resized
      db.dim = dim;
      for (i in db.callback) {
        db.callback[i]();
      }
    }
    setTimeout(function() { db.lock = 0; }, 0);
  }
  setTimeout(_resizeevent2loop, db.delay);
}

function _resizeeventstop(db) {
  db.kill = db.lock = 0;
  db.callback = {};
}

// --- initialize / export ---
_mm.mix(uuMeta.evt, {
  code:       code,
  once:       once,
  tidy:       _ie ? tidyIE : tidy,
  stop:       stop,
  bind:       bind,
  unbind:     unbind,
  unbindAll:  unbindAll,
  toggle:     toggle,
  fire:       fire,
  resize:     resize,
  resizeStop: resizeStop,
  EVENT_CODE: _EVENT_CODE
});

})(); // uuMeta.evt scope

