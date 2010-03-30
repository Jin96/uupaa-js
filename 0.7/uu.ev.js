
// === Event ===
//{{{!depend uu
//}}}!depend

// ::event.keyCode
//    http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
uu.event.more || (function(win, doc, uu) {
var _CLICKS = { click: 1, dblclick: 2 },
    _EVVKEY = uu.split.toHash( // virtual keycode events
        "8,BS,9,TAB,13,ENTER,16,SHIFT,17,CTRL,18,ALT,27,ESC," +
        "32,SP,33,PGUP,34,PGDN,35,END,36,HOME,37,LEFT,38,UP,39,RIGHT,40,DOWN," +
        "45,INS,46,DEL,48,0,49,1,50,2,51,3,52,4,53,5,54,6,55,7,56,8,57,9," +
        "65,A,66,B,67,C,68,D,69,E,70,F,71,G,72,H,73,I,74,J,75,K,76,L,77,M," +
        "78,N,79,O,80,P,81,Q,82,R,83,S,84,T,85,U,86,V,87,W,88,X,89,Y,90,Z");

uu.event.more       = uueventmore;      // uu.event.more(event) -> { rel, btn, vkey, wheel, clicks, vkeycode }
uu.event.times      = uueventtimes;     // [1] uu.event.times(node, names, cyclic, var_args, ...) -> node
uu.event.hover      = uueventhover;     // [1][callback]  uu.event.hover(node, function(){}, function(){}) -> node
                                        // [2][toggle class] uu.event.hover(node, "red white") -> node
uu.event.dragbase   = uueventdragbase;  // [protected] drag & drop base handler

// uu.event.more - more information
function uueventmore(evt) { // @param EventObject:
                         // @return Hash: { rel, btn, vkey, wheel, clicks, vkeycode }
    var rel, btn = evt.button || 0, wheel = 0, clicks = 0,
        vkeycode = evt.keyCode || evt.charCode || 0;

    if (evt.code) {
        if (uu.ie) {
            rel = evt.src === evt.fromElement ? evt.toElement : evt.fromElement;
            btn = !btn ? void 0 : (btn & 1) ? 0 : (btn & 2) ? 1 : 2;
            wheel = (evt.wheelDelta / -120) | 0;
            clicks = _CLICKS[evt.type] || 0;
        } else {
            evt.rel = evt.relatedTarget;
            if (evt.code === uu.event._code.mousewheel) {
                wheel = (evt.detail ? (evt.detail / 3)
                                    : (evt.wheelDelta / -120)) | 0;
            } else {
                clicks = (evt.detail || 0) & 0x03 || _CLICKS[evt.type] || 0;
            }
        }
    }
    return { rel: rel, // relatedTarget
             btn: btn,
             vkey: _EVVKEY[vkeycode] || "", // "UP", "1", "A"
             wheel: wheel,
             clicks: clicks,
             vkeycode: vkeycode }; // 38, 49, 65
}

// uu.event.dragbase -
function uueventdragbase(
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

    if (!code || code > 3
        || (code === 3 && !grip.uueventdrag) // [3] mousemove
        || (code === 1 &&  grip.uueventdrag) // [1] mousedown
        || (code === 2 && !grip.uueventdrag)) { // [2] mouseup or losecapture(in IE)
        return { x: 0, y: 0, px: 0, py: 0 };
    }
    if (uu.ie) {
        iebody = uu.quirks ? doc.body : uu.node.root;
        x = evt.clientX + iebody.scrollLeft;
        y = evt.clientY + iebody.scrollTop;
    } else {
        x = evt.pageX;
        y = evt.pageY;
    }
    if (code === 3) { // [3] mousemove
        off = grip.uueventdragoff;
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
        grip.uueventdragoff = { x: x - parseInt(tgt.style.left || 0),
                                y: y - parseInt(tgt.style.top  || 0) };
        grip.uueventdrag = opt.zmanage ? uu.factory("ZIndex").drag(tgt) : 1;
    } else { // [2] mouseup
        opt.mouseup && opt.mouseup(evt, tgt, grip, code, opt, x, y);
        grip.uueventdrag = opt.zmanage ? uu.factory("ZIndex").drag(tgt) : 0;
    }
    return { x: x, y: y, px: px, py: py };
}

// uu.event.times - cyclic events
// [1] uu.event.times(node, "click", 0, var_args, ...)
function uueventtimes(node,     // @param Node: target node
                      names,    // @param JointString: "click,click+,..."
                      cyclic    // @param Number: cyclic times, 0 is infinite
              /* var_args */) { // @param Function: callback functions
                                // @return Node:
    function _wrap(evt) {
        callbacks[index++](evt);
        if (index >= callbacks.length) {
            index = 0;
            if (cyclic && !--cyclic) {
                uu.event(node, names, _wrap, 2);
            }
        }
    }
    cyclic = cyclic || 0;
    var index = 0, callbacks = uu.array(arguments).slice(3);

    callbacks.length && uu.event(node, names, _wrap, 1);
    return node;
}

// uu.event.hover
// [1][callback]     uu.event.hover(node, function(){}, function(){}) -> node
// [2][toggle class] uu.event.hover(node, "red white") -> node
function uueventhover(node,    // @param Node:
                      enter,   // @param Function/JointString: callback or class
                      leave) { // @param Function(= void 0):
                               // @return Node:
    function _evhookmouseenter(evt) {
        var rel = evt.relatedTarget;
        // ignode mouse transit(mouseover, mouseout) in child node
        if (evt.node !== rel && !uu.node.has(rel, evt.node)) {
            evt.name = "mouseenter";
            enter(evt, node); // enter(evt, node)
        }
        uu.event.stop(evt); // cancel bubble
    }
    function _evhookmouseleave(evt) {
        var rel = evt.relatedTarget;

        if (evt.node !== rel && !uu.node.has(rel, evt.node)) {
            evt.name = "mouseleave";
            leave(evt, node); // leave(evt, node)
        }
        uu.event.stop(evt); // cancel bubble
    }
    function _evhovertoggle() {
        uu.klass.has(node, enter) ? uu.klass.sub(node, enter)
                                  : (node.className += " " + enter); // [OPTIMIZED]
    }
    function _evhookmouseenterie(evt) {
        enter(evt, node);
    }
    function _evhookmouseleaveie(evt) {
        leave(evt, node);
    }
    var klass = uu.isString(enter);

    if (uu.ie) {
        uu.event(node, "mouseenter", klass ? _evhovertoggle : _evhookmouseenterie);
        uu.event(node, "mouseleave", klass ? _evhovertoggle : _evhookmouseleaveie);
    } else {
        uu.event(node, "mouseover+", klass ? _evhovertoggle : _evhookmouseenter);
        uu.event(node, "mouseout+",  klass ? _evhovertoggle : _evhookmouseleave);
    }
    return node;
}

})(window, document, uu);

