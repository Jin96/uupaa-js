
// === uu.ui.dragbase, uu.ui.zindex ===
//{{{!depend uu
//}}}!depend

uu.ui.dragbase || (function(uu) {

uu.ui.dragbase = uuuidragbase; // drag & drop base handler

var _uuuidrag = "data-uuuidrag"; // node["data-uuuidrag"] = { dragging: Boolean, x, y }

// uu.ui.dragbase -
function uuuidragbase(evt,      // @param event:
                      node,     // @param Node: move target node
                      grip,     // @param Node: grip target node
                      option) { // @param Hash(= {}): { mouseup, mousemove, mousedown, shim }
                                //  option.mouseup   - Function: mouseup callback
                                //  option.mousemove - Function: mousemove callback
                                //  option.mousedown - Function: mousedown callback
                                //  option.shim      - Object: shim object
    var opt = option || {},
        pageX = evt.pageX,
        pageY = evt.pageY,
        xtype = evt.xtype,
        dragInfo = grip[_uuuidrag] || {};

    if (xtype === 1 && !dragInfo.dragging) { // mousedown

        dragInfo = grip[_uuuidrag] = {
            x: pageX - (parseInt(node.style.left) || 0),
            y: pageY - (parseInt(node.style.top)  || 0),
            dragging: 1
        };

        opt.mousedown && opt.mousedown(evt, node, option, dragInfo);

        uu.ui.zindex.beginDrag(node);

    } else if (xtype === 2 && dragInfo.dragging) { // mouseup

        dragInfo.dragging = 0;

        opt.mouseup && opt.mouseup(evt, node, option, dragInfo);

        uu.ui.zindex.endDrag(node);

    } else if (xtype === 3 && dragInfo.dragging) { // mousemove

        node.style.left = (pageX - dragInfo.x) + "px";
        node.style.top  = (pageY - dragInfo.y) + "px";

        opt.mousemove && opt.mousemove(evt, node, option, dragInfo);
        opt.shim &&
            opt.shim.resize(pageX - dragInfo.x,
                            pageY - dragInfo.y,
                            node.offsetWidth,
                            node.offsetHeight);
    }
}

// --- z-index ---
// uu.Class.ZIndex - z-index management class
uu.Class.singleton("ZIndex", {
    init:         zinit,        // init()
    toTop:        ztotop,       // toTop(node:Node)
    bind:         zbind,        // bind(node:Node)
    unbind:       zunbind,      // unbind(node:Node)
    beginDrag:    zbegindrag,   // beginDrag(node:Node)
    endDrag:      zenddrag      // endDrag(node:Node)
});
uu.ui.zindex = uu("ZIndex");

// uu.Class.ZIndex.init
function zinit() {
    this._db = {};      // { nodid: node }
    this._ztop = 20;    // top z-index
}

// uu.Class.ZIndex.toTop
function ztotop(node) { // @param Node:
    this._db[uu.nodeid(node)] &&
        (sink(this, node), node.style.zIndex = this._ztop); // move surface
}

// uu.Class.ZIndex.bind - bind z-index handler
function zbind(node) { // @param Node:
    var id = uu.nodeid(node), position;

    // [IE8][FIX] z-index bug
    // http://twitter.com/uupaa/statuses/15075513615
/*
    if (uu.ver.ie8) {
        if (node.parentNode.currentStyle.position === "static") {
            node.parentNode.style.position = "relative";
        }
    }
 */
    this._db[id] || (this._db[id] = node,
                     node.style.zIndex = ++this._ztop); // top + 1
}

// uu.Class.ZIndex.unbind - unbind z-index handler
function zunbind(node) { // @param Node:
    var id = uu.nodeid(node);

    if (this._db[id]) {
        delete this._db[id];
        --this._ztop;
    }
}

// uu.Class.ZIndex.beginDrag
function zbegindrag(node) { // @param Node:
    this.bind(node); // auto bind
    sink(this, node);
    node.style.zIndex = 5000 + 1; // z-index boost
}

// uu.Class.ZIndex.endDrag
function zenddrag(node) { // @param Node:
    this._db[uu.nodeid(node)] &&
            (node.style.zIndex = this._ztop); // unboost
}

// inner -
function sink(that, node) {
    var thresh = parseInt(node.style.zIndex) || 10, // threshold
        db = that._db, style, i;

    for (i in db) {
        style = db[i].style;
        (style.zIndex >= thresh) && (style.zIndex -= 1);
    }
}

//{{{!mb
// --- shim ---
// uu.Class.Shim - bugfix: selectbox stays in the top(ignore z-index) in IE6
uu.Class("Shim", {
    init:         shiminit,       // init(node)
    resize:       shimresize,     // resize(x:Number, y:Number, w:Number, h:Number)
    unbind:       shimunbind      // unbind()
});

// uu.Class.Shim.init
function shiminit(node) { // @param Node:
    var cs = uu.css(node, true);

    this.node = node;
    this.marginTop  = parseInt(cs.marginTop)  || 0;
    this.marginLeft = parseInt(cs.marginLeft) || 0;

    if (!this.shim) {
        this.shim = document.createElement(
            '<iframe scrolling="no" src="javascript:void 0" frameborder="0"' +
            ' style="position:absolute;top:0;left:0;filter:alpha(opacity=0)">' +
            '</iframe>');
        uu.node.add(this.shim, node, "-"); // add prev sibl

        this.resize(parseInt(cs.left),
                    parseInt(cs.top),
                    node.offsetWidth,
                    node.offsetHeight);
    }
}

// uu.Class.Shim.resize
function shimresize(x, y, w, h) {
    if (this.shim) {

        var shim = this.shim.style;

        shim.top    = this.marginTop + y + "px";
        shim.left   = this.marginTop + x + "px";
        shim.width  = w + "px";
        shim.height = h + "px";
    }
}

// uu.Class.Shim.unbind - purge
function shimunbind() {
    if (this.shim) {
        uu.node.remove(this.shim);
        this.shim = null;
    }
}
//}}}!mb

})(uu);

