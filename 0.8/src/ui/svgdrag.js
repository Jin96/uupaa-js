
// === uu.ui.svgdrag ===
//#include uupaa.js
//#include svg/svg.js
//#include ui/svgdragbase.js
//#include css/box.js

uu.Class.SVGDrag || (function(doc, uu) {

// uu.Class.Drag - Generic Drag and Drop manage class
uu.Class("SVGDrag", {
    init:           draginit,       // init(tgt, grip, option = {})
    fin:            dragfin,        // fin()
    handleEvent:    dragHandleEvent // handleEvent(evt)
});

var _ie678 = uu.ie && !uu.ver.jit,
    _moveup = uu.ver.touch ? "touchmove+,touchend+"
                           : "mousemove+,mouseup+";

// --- drag ---
// uu.Class.SVGDrag.init
function draginit(node,     // @param Node: move target node
                  grip,     // @param Node(= null): grip target node
                  option) { // @param Hash(= {}): { wheel, minw, maxw, minh, maxh }
                            //      option.wheel  - Number/Function: wheel, 0 is off
                            //                                1 is resize
                            //                                fn is callback
                            //      option.minw   - Number: min width
                            //      option.maxw   - Number: max width
                            //      option.minh   - Number: min height
                            //      option.maxh   - Number: max height
    grip = grip || node;
    this.option = uu.arg(option, { tripletap: true, shim: 0 });
    this.node = node;
    this.grip = grip;
    grip.style.cursor = "move";

    uu.event(grip, uu.ver.touch ? "touchstart,gesturestart"
                                : "mousedown", this)
    uu.mousewheel(node, this);
}

// uu.Class.SVGDrag.fin
function dragfin() {
    uu.unbind(doc, "touchmove+,touchend+", this);
    uu.unbind(doc, "gesturechange+,gestureend+", this);
    uu.unbind(_ie678 ? this.grip : doc, _moveup, this);

    uu.css.toStatic(this.node);
}

// uu.Class.SVGDrag.handleEvent
function dragHandleEvent(evt) {
    uu.event.stop(evt);

    uu.ui.svgdragbase(evt, this.node, this.grip, this.option);
    var code = evt.code;

    switch (code) {
    case uu.event.codes.mousedown:  // mousedown, touchstart, gesturestart
        if (evt.gesture) {
            uu.unbind(doc, "touchmove+,touchend+", this);
            uu.bind(doc, "gesturechange+,gestureend+", this);
        } else {
            uu.bind(_ie678 ? this.grip : doc, _moveup, this);
        }
        break;
    case uu.event.codes.mouseup:    // mouseup, touchend, gestureend
        if (evt.gesture) {
            uu.unbind(doc, "gesturechange+,gestureend+", this);
            uu.bind(doc, "touchmove+,touchend+", this);
        } else {
            uu.unbind(_ie678 ? this.grip : doc, _moveup, this);
        }
        break;
//    case uu.event.codes.wheel:
//        this.mousewheel(evt);
    }
}

})(document, uu);

