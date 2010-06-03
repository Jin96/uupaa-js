
// === uu.ui.shim ===
//#include uupaa.js

//{{{!mb
uu.Class.Shim || (function(uu) {

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

})(uu);
//}}}!mb

