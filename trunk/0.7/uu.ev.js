
// === Event ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {
var _CLICKS = { click: 1, dblclick: 2 },
    _EVENT_VKEY = uu.hash( // event virtual keycode
        "8,BS,9,TAB,13,ENTER,16,SHIFT,17,CTRL,18,ALT,27,ESC," +
        "32,SP,33,PGUP,34,PGDN,35,END,36,HOME,37,LEFT,38,UP,39,RIGHT,40,DOWN," +
        "45,INS,46,DEL,48,0,49,1,50,2,51,3,52,4,53,5,54,6,55,7,56,8,57,9," +
        "65,A,66,B,67,C,68,D,69,E,70,F,71,G,72,H,73,I,74,J,75,K,76,L,77,M," +
        "78,N,79,O,80,P,81,Q,82,R,83,S,84,T,85,U,86,V,87,W,88,X,89,Y,90,Z");

// uu.ev.*
uu.mix(uu.ev, {
    more:       uuevmore,       // uu.ev.more(event) -> event { btn, vkey, wheel, clicks, vkeycode }
    fire:       uuevfire,       // uu.ev.fire(node, "customEvent", param) -> node
    times:      uuevtimes,      // [1] uu.ev.times(node, names, cyclic, var_args, ...) -> node
    hover:      uuevhover,      // [1][callback]  uu.ev.hover(node, function(){}, function(){}) -> node
                                // [2][toggle class] uu.ev.hover(node, "red white") -> node
    dragbase:   uuevdragbase    // [protected] drag & drop base handler
});

// uu.ev.more - more information
function uuevmore(evt) { // @param event:
                         // @return event: uu.mix(event, { btn, vkey, wheel,
                         //                                clicks, vkeycode })
  var btn = evt.button || 0, wheel = 0, clicks = 0,
      vkeycode = evt.keyCode || evt.charCode || 0,
      EVENT_CODE = uu.dmz.EVENT_CODE;

  if (evt.code) {
    if (uu.ie) {
      btn = !btn ? void 0 : (btn & 1) ? 0 : (btn & 2) ? 1 : 2;
      wheel = (evt.wheelDelta / -120) | 0;
      clicks = _CLICKS[evt.type] || 0;
    } else {
      if (evt.code === EVENT_CODE.mousewheel) {
        wheel = (evt.detail ? (evt.detail / 3)
                            : (evt.wheelDelta / -120)) | 0;
      } else {
        clicks = (evt.detail || 0) & 0x03 || _CLICKS[evt.type] || 0;
      }
    }
  }
  evt.btn = btn;
  evt.vkey = _EVENT_VKEY[vkeycode] || ""; // "UP", "1", "A"
  evt.wheel = wheel;
  evt.clicks = clicks;
  evt.vkeycode = vkeycode; // 38, 49, 65
  return evt;
}

// uu.ev.fire - fire event / fire custom event(none capture event only)
function uuevfire(node,    // @param Node: target node
                  name,    // @param String: "click", "custom"
                  param) { // @param Mix(= void 0): param
                           // @return Node:
  if (uu.ev.has(node, name)) {
    node.uuevfn[name].call(node, {
      stopPropagation: uuvain,
      preventDefault:  uuvain,
      node:   node, // current target
      name:   name, // event name
      code:   0,    // 0: unknown
      src:    node, // event source
      rel:    node,
      px:     0,
      py:     0,
      ox:     0,
      oy:     0,
      param:  param
    }, 1);
  }
  return node;
}

// uu.ev.dragbase -
function uuevdragbase(
            evt,      // @param event:
            tgt,      // @param Node: move target node
            grip,     // @param Node(= void 0): grip node
            option) { // @param Hash(= {}):
                      //        { zmanage, limit, left, right, top, bottom,
                      //          mouseup, mousemove, mousedown }
                      //        Boolean: zmanage(= false), z-index management
                      //        Boolean: limit(= false), use limit rect
                      //        Number: left, right, top, bottom - limit rect
                      //        Function: mouseup, mousemove, mousedown
                      // @return Hash: { x, y, px, py }
  grip = grip || tgt;
  var x, y, px = 0, py = 0, off, r, opt = option || {},
      code = evt.code, ts = tgt.style, iebody;

  if (!code || code > 3 ||
      (code === 3 && !grip.uuevdrag) || // [3] mousemove
      (code === 1 &&  grip.uuevdrag) || // [1] mousedown
      (code === 2 && !grip.uuevdrag)) { // [2] mouseup or losecapture(in IE)
    return { x: 0, y: 0, px: 0, py: 0 };
  }
  if (uu.ie) {
    iebody = uu.dmz.iebody;
    x = evt.clientX + iebody.scrollLeft;
    y = evt.clientY + iebody.scrollTop;
  } else {
    x = evt.pageX;
    y = evt.pageY;
  }
  if (code === 3) { // [3] mousemove
    off = grip.uuevdragoff;
    px = x - off.x;
    py = y - off.y;

    if (opt.limit) {
      if (px < opt.left)   { px = opt.left;   }
      if (px > opt.right)  { px = opt.right;  }
      if (py < opt.top)    { py = opt.top;    }
      if (py > opt.bottom) { py = opt.bottom; }
    }
    uu.ie ? (ts.pixelLeft = px) : (ts.left = px + "px");
    uu.ie ? (ts.pixelTop  = py) : (ts.top  = py + "px");
    if (opt.mousemove) {
      opt.mousemove(evt, tgt, grip, code, opt, x, y, px, py);
    }
  } else if (code === 1) { // [1] mousedown
    if (opt.mousedown) {
      r = opt.mousedown(evt, tgt, grip, code, opt, x, y);
      if (r) { // override - target node, grip node
        tgt = r.tgt;
        grip = r.grip;
      }
    }
    grip.uuevdragoff = { x: x - parseInt(tgt.style.left || 0),
                         y: y - parseInt(tgt.style.top  || 0) };
    grip.uuevdrag = opt.zmanage ? uu.factory("ZIndex").drag(tgt) : 1;
  } else { // [2] mouseup
    opt.mouseup && opt.mouseup(evt, tgt, grip, code, opt, x, y);
    grip.uuevdrag = opt.zmanage ? uu.factory("ZIndex").drag(tgt) : 0;
  }
  return { x: x, y: y, px: px, py: py };
}

// uu.ev.times - cyclic events
// [1] uu.ev.times(node, "click", 0, var_args, ...)
function uuevtimes(node,     // @param Node: target node
                   names,    // @param JointString: "click,click+,..."
                   cyclic    // @param Number: cyclic times, 0 is infinite
           /* var_args */) { // @param Function: callback functions
                             // @return Node:
  function _wrap(evt) {
    callbacks[index++](evt);
    if (index >= callbacks.length) {
      index = 0;
      if (cyclic && !--cyclic) {
        uu.ev(node, names, _wrap, 2);
      }
    }
  }
  cyclic = cyclic || 0;
  var index = 0, callbacks = uu.ary(arguments).slice(3);

  callbacks.length && uu.ev(node, names, _wrap, 1);
  return node;
}

// uu.ev.hover
// [1][callback]     uu.ev.hover(node, function(){}, function(){}) -> node
// [2][toggle class] uu.ev.hover(node, "red white") -> node
function uuevhover(node,    // @param Node:
                   enter,   // @param Function/JointString: callback or class
                   leave) { // @param Function(= void 0):
                            // @return Node:
  function _evhookmouseenter(evt) {
    var rel = evt.relatedTarget;
    // ignode mouse transit(mouseover, mouseout) in child node
    if (evt.node !== rel && !uu.node.has(rel, evt.node)) {
      evt.name = "mouseenter";
      enter.call(node, evt, node); // enter(evt, node)
    }
    uu.ev.stop(evt); // cancel bubble
  }
  function _evhookmouseleave(evt) {
    var rel = evt.relatedTarget;

    if (evt.node !== rel && !uu.node.has(rel, evt.node)) {
      evt.name = "mouseleave";
      leave.call(node, evt, node); // leave(evt, node)
    }
    uu.ev.stop(evt); // cancel bubble
  }
  function _evhovertoggle() {
    uu.klass.has(node, enter) ? uu.klass.sub(node, enter)
                              : (node.className += " " + enter); // [perf]
  }
  var klass = uu.isstr(enter);

  if (uu.ie) {
    uu.ev(node, "mouseenter", klass ? _evhovertoggle : enter);
    uu.ev(node, "mouseleave", klass ? _evhovertoggle : leave);
  } else {
    uu.ev(node, "mouseover+", klass ? _evhovertoggle : _evhookmouseenter);
    uu.ev(node, "mouseout+",  klass ? _evhovertoggle : _evhookmouseleave);
  }
  return node;
}

})(window, document, uu);

