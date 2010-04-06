
// === Drag Event ===
//{{{!depend uu, uu.class, uu.css, uu.color
//}}}!depend

uu.Class.Drag || (function(win, doc, uu) {

// uu.Class.Drag - Generic Drag and Drop manage class
uu.Class("Drag", {
    init:         draginit,       // init(tgt, grip, option = {})
    handleEvent:  draghandleevent,// handleEvent(evt)
    drag:         uu.event.dragbase, // drag(evt, tgt, grip, option) -> { x, y, px, py }
    mousewheel:   dragmousewheel  // mousewheel(evt)
});

// uu.Class.Draggable - Limited Drag and Drop manage class
uu.Class("Draggable", {
    init:         draggableinit,  // init(tgt, grip, option = {})
    handleEvent:  draggablehandleevent, // handleEvent(evt)
    drag:         uu.event.dragbase  // drag(evt, tgt, grip, option) -> { x, y, px, py }
});

// uu.Class.Sortable - Sortable Drag and Drop manage class
uu.Class("Sortable", {
    init:         sortableinit,   // init(tgt, grip, option = {})
    handleEvent:  sortablehandleevent, // handleEvent(evt)
    drag:         uu.event.dragbase  // drag(evt, tgt, grip, option) -> { x, y, px, py }
});

// uu.Class.ZIndex - z-index manage class
uu.Class.singleton("ZIndex", {
    init:         zindexinit,     // init()
    top:          zindextop,      // top(node)
    bind:         zindexbind,     // bind(node)
    unbind:       zindexunbind,   // unbind(node)
    drag:         zindexdrag      // drag(node) -> 0 or 1
});
new uu.Class.ZIndex();

// uu.Class.Shim - bugfix: selectbox stays in the top(ignore z-index) in IE6
uu.Class("Shim", {
    init:         shiminit,       // init(node)
    bind:         shimbind,       // bind()
    unbind:       shimunbind,     // unbind()
    resize:       shimresize      // resize()
});

// --- impl ---
// inner -
function uueventdraglimit(min,   // @param Number:
                          value, // @param Number:
                          max) { // @param Number:
                                 // @return Boolean:
    return (min > value) ? min
                         : (value > max) ? max : value;
}

// --- drag ---
// uu.Class.Drag.init
function draginit(tgt,      // @param Node: move target
                  grip,     // @param Node(= void 0): grip
                  option) { // @param Hash(= {}): { ghost, wheel, noshim, rel, minw, maxw, minh, maxh }
                            //      option.ghost  - Number: ghost, 1 is enable ghost effect
                            //      option.wheel  - Number/Function: wheel, 0 is off
                            //                                1 is resize
                            //                                fn is callback
                            //      option.noshim - Number: noshim, 1 is disable shim(in IE6)
                            //      option.rel    - Number: rel, 1 is relative, 0 is absolute
                            //      option.minw   - Number: min width
                            //      option.maxw   - Number: max width
                            //      option.minh   - Number: min height
                            //      option.maxh   - Number: max height
    grip = grip || tgt;
    this._tgt  = tgt;
    this._grip = grip;
    this._opt  = uu.arg(option, {
        ghost:      0,
        wheel:      0,
        noshim:     0,
        rel:        0,
        zmanage:    1,
        minw:       0,
        maxw:       2000,
        minh:       0,
        maxh:       2000
    });
    grip.style.cursor = "move";
    this._opt.rel ? uu.css.toRelative(tgt)
                  : uu.css.toAbsolute(tgt);
    this._shim = (uu.ver.ie6 && !this._opt.rel
                             && !this._opt.noshim) ? uu("Shim", tgt) : 0;
    uu.mousedown(grip, this);
    this._opt.wheel && uu.mousewheel(tgt, this);
//  uu.fx.fade(tgt, { begin: 0, end: 1.0 });
}

// uu.Class.Drag.handleEvent
function draghandleevent(evt) {
    uu.event.stop(evt);
    var rv = this.drag(evt, this._tgt, this._grip, this._opt),
        code = evt.code;

    if (code) {
        if (code <= 2) { // [1] mousedown, [2] mouseup
            uu.event(uu.ie ? this._grip
                           : doc, "mousemove+,mouseup+", this, code & 2);
        } else if (code === 3) { // [3] mousemove
            this._shim &&
                this._shim.resize({ x: rv.px, y: rv.py, w: this._tgt.offsetWidth,
                                                        h: this._tgt.offsetHeight });
        } else if (code === 4) { // [4] wheel
            this._opt.wheel && this.mousewheel(evt);
        }
    }
}

// uu.Class.Drag.mousewheel
function dragmousewheel(evt) {
    var opt = this._opt, wheel, size, w, h, more = uu.event.more(evt);

    if (opt.wheel) {
        wheel = more.wheel * 10;
        size = uu.css.size(this._tgt, 1); // plain size
        w = uueventdraglimit(opt.minw, size.w + wheel, opt.maxw),
        h = uueventdraglimit(opt.minh, size.h + wheel, opt.maxh);
    //  uu.css.rect(this._tgt, { w: w, h: h });
        uu.css.size.set(this._tgt, w, h);
        this._shim && this._shim.resize({ w: w, h: h });
    } else {
        opt.wheel(evt, more, this._tgt, this._grip);
    }
}

// --- draggable ---
// uu.Class.Draggable.init
function draggableinit(
            draggable, // @param NodeArray:
            droppable, // @param NodeArray:
            option) {  // @param Hash(= {}): { ghost, droppablebg }
                       //        Number: ghost, 1 is enable ghost effect
                       //        ColorString(= "bisque"): droppablebg,
                       //                                 drop allow bgcolor
    var that = this, node, i = -1;

    this._opt = uu.arg(option, { ghost: 0, droppablebg: "bisque", zmanage: 1 });
    this._tgt = 0;
    this._draggable = draggable;
    this._droppable = droppable;

    // setup draggable node
    //      <div style="cursor:move" onmousemove="..."></div>
    //
    while ( (node = draggable[++i]) ) {
        node.style.cursor = "move";
        uu.mousedown(node, this);
        this._tgt = node; // dummy
    }

    // keep droppable bgcolor and rect
    //      <div uudroppable={ bgcolor, rect }></div>
    i = -1;
    while ( (node = droppable[++i]) ) {
        node.uudroppable = {
            bgcolor: uu.css.bgcolor(node).hex,
            rect:    uu.css.rect(node)
        };
    }
    this._opt.mousedown = function(evt) {
        that._tgt = evt.node; // evt.currentTarget
        uu.css.toAbsolute(that._tgt);

        // [IE6] hide select-box
        if (uu.ver.ie6) {
            uu.tag("select").forEach(function(v) {
                v.style.visibility = "hidden";
            });
        }
        return { tgt: that._tgt, grip: that._tgt }; // override
    };
    this._opt.mouseup = function(evt, tgt, grip, code, opt, x, y) {
        uu.css.toStatic(tgt);

        // [IE6] show select-box
        if (uu.ver.ie6) {
            uu.tag("select").forEach(function(node) {
                node.style.visibility = "";
            });
        }
        var ctx = _draggableinrect(droppable, x, y, that._opt.droppablebg);

        if (ctx && _draggableready(ctx, draggable)) {
            uu.node.add(tgt, ctx);
        }
    };
}

// uu.Class.Draggable.handleEvent
function draggablehandleevent(evt) {
    uu.event.stop(evt);
    var rv = this.drag(evt, this._tgt, this._tgt, this._opt),
        code = evt.code;

    if (code) {
        if (code <= 2) { // [1] mousedown, [2] mouseup
            uu.event(uu.ie ? this._tgt
                           : doc, "mousemove+,mouseup+", this, code & 2);
        } else if (code === 3) {
            _draggableinrect(this._droppable, rv.x, rv.y, this._opt.droppablebg);
        }
    }
}

// inner - Draggable in Rect
function _draggableinrect(nodeArray, // @param NodeArray:
                          x,         // @param Number:
                          y,         // @param Number:
                          color) {   // @param String: hit color
    var rv, node, backgroundColor, i = 0, iz = nodeArray.length;

    for (; i < iz; ++i) {
        node = nodeArray[i];
        backgroundColor = node.style.backgroundColor;

        if (uu.css.inRect(node.uudroppable.rect, x, y)) {
            rv = node;
            if (backgroundColor !== color) {
                node.style.backgroundColor = color;
            }
        } else {
            if (backgroundColor !== node.uudroppable.bgcolor) {
                node.style.backgroundColor = node.uudroppable.bgcolor;
            }
        }
    }
    return rv;
}

// inner -
function _draggableready(ctx, ary) {
    var v, i = -1;

    while ( (v = ary[++i]) ) {
        if (uu.node.has(v, ctx)) {
            return 0;
        }
    }
    return 1;
}

// --- sortable ---
// uu.Class.Sortable.init
function sortableinit(ul,       // @param Node: <ul> node
                      option) { // @param Hash(= {}):
                                //        { ghost, wheel }
                                //        Number: ghost, 1 is enable ghost effect
                                //        Number/Function: wheel, 0 is off
                                //                                1 is resize
                                //                                fn is callback
    var that = this;

    this._opt = uu.arg(option, { ghost: 0, wheel: 0, zmanage: 1 });
    this._tgt = 0;
    this._fp  = 0; // foot print
//  this._ul  = ul;
    this._li  = uu.query("!>li", ul);

    this._li.forEach(function(v) {
        v.style.cursor = "move";
        uu.event(v, "mousedown+", that);
        that._tgt = v; // dummy
        v.uusortable = { idx: uu.node.find(v),
                         rect: uu.css.rect(v) };
    });

    this._opt.mousedown = function(evt) {
        that._tgt = evt.node; // evt.currentTarget
        var cloned = that._tgt.cloneNode(true);

        cloned.style.visibility = "hidden";

        // TODO: test
        that._fp = uu.node.next(that._tgt, cloned);


        uu.css.toAbsolute(that._tgt);
        return { tgt: that._tgt, grip: that._tgt }; // override
    };
    this._opt.mouseup = function(evt, tgt) {
        uu.node.swap(tgt, that._fp);
        uu.css.toStatic(tgt);
        that._li.forEach(function(v) {
            v.uusortable = { idx: uu.node.find(v),
                             rect: uu.css.rect(v) }; // update
        });
    };
}
// uu.Class.Sortable.handleEvent
function sortablehandleevent(evt) {
    var _tgt = this._tgt, _li,
        rv = this.drag(evt, _tgt, _tgt, this._opt),
        code = evt.code, v, w, r, i = -1;

    if (code) {
        if (code <= 2) { // [1] mousedown, [2] mouseup
            uu.event(uu.ie ? _tgt
                           : doc, "mousemove+,mouseup+", this, code & 2);
        } else if (code === 3) { // [3] mousemove
            _li = this._li;

            while ( (v = _li[++i]) ) {
                if (v !== _tgt) { // exclude drag target
                    w = v.uusortable;
                    r = w.rect;
                    if ((rv.x > r.x && rv.x < r.x + r.w) // [inlining] uu.css.inRect
                        && (rv.y > r.y && rv.y < r.y + r.h)) {

                        (w.idx < _tgt.uusortable.idx) ? uu.node.prev(v, this._fp)
                                                      : uu.node.next(v, this._fp);
                        // swap manage hash
                        v.uusortable = _tgt.uusortable;
                        this._tgt.uusortable = w;
                    }
                }
            }
        }
        uu.event.stop(evt);
    }
}

// --- z-index ---
// uu.Class.ZIndex.init
function zindexinit() {
    this._nodedb = {};  // { nodid: node }
    this._zboost = 5000; // temporarily z-index in dragging
    this._ztop   = 20;   // top z-index
}

// uu.Class.ZIndex.top
function zindextop(node) { // @param Node:
    this._nodedb[uu.nodeid(node)] &&
        (_zsink(this, node),
         node.style.zIndex = this._ztop); // move surface
}

// uu.Class.ZIndex.bind - bind z-index handler
function zindexbind(node) { // @param Node:
    var id = uu.nodeid(node);

    this._nodedb[id] || (this._nodedb[id] = node,
                         node.style.zIndex = ++this._ztop); // top + 1
}

// uu.Class.ZIndex.unbind - unbind z-index handler
function zindexunbind(node) { // @param Node:
    var id = uu.nodeid(node);

    this._nodedb[id] && (delete this._nodedb[id], --this._ztop);
}

// uu.Class.ZIndex.drag - begin drag, end drag
function zindexdrag(node) { // @param Node:
                            // @return Number: 0 or 1
    function _toggle(node, key) {
        var rv = uu.node.data.get(node, key) ? 1 : 0;

        uu.node.data.set(node, key, rv ? 0 : 1);
        return !!rv;
    }
    if (_toggle(node, "zindexdrag")) {
        // end drag
        this._nodedb[uu.nodeid(node)] &&
            (node.style.zIndex = this._ztop); // move surface
        return 0;
    }
    // begin drag
    this.bind(node); // auto bind
    _zsink(this, node);
    node.style.zIndex = this._zboost + 1;
    return 1;
}

// inner -
function _zsink(that, node) {
    var thresh = node.style.zIndex || 10, // threshold
        hash = that._nodedb, v, i = 0;

    for (i in hash) {
        v = hash[i];
        (v.style.zIndex > thresh) && (v.style.zIndex -= 1);
    }
}

// --- shim ---
// uu.Class.Shim.init
function shiminit(node) { // @param Node:
    this._parent = node;
    this.bind();
}

// uu.Class.Shim.bind
function shimbind() {
    if (!this._shim) {
        this._shim = doc.createElement(
            '<iframe scrolling="no" src="javascript:0" frameborder="0"' +
            ' style="position:absolute;top:0;left:0;filter:alpha(opacity=0)">' +
            '</iframe>');
        uu.node.prev(this._shim, this._parent); // add prev sibl
    }
    var hash = uu.css.size(this._parent);

    hash.x = parseInt(this._parent.style.left || 0),
    hash.y = parseInt(this._parent.style.top  || 0);
    uu.css.rect.set(this._shim, hash);
}

// uu.Class.Shim.unbind - purge
function shimunbind() {
    this._shim && (uu.node.remove(this._shim), this._shim = 0);
}

// uu.Class.Shim.resize
function shimresize(hash) {
    this._shim && uu.css.rect.set(this._shim, hash);
}

})(window, document, uu);

