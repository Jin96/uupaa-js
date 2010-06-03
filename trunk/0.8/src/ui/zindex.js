
// === uu.ui.zindex ===
//#include uupaa.js

uu.ui.zindex || (function(uu) {

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
    var id = uu.nodeid(node);

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

})(uu);

