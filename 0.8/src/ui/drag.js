
// === uu.ui.drag ===
//#include uupaa.js
//#include css/box.js
//#include ui/dragbase.js

uu.Class.Drag || (function(doc, uu) {

// uu.Class.Drag - Generic Drag and Drop manage class
uu.Class("Drag", {
    init:           draginit,       // init(tgt, grip, option = {})
    fin:            dragfin,        // fin()
    handleEvent:    dragHandleEvent // handleEvent(evt)
});

var _moveup = uu.env.touch ? "touchmove+,touchend+"
                           : "mousemove+,mouseup+";

// uu.Class.Drag.init
function draginit(node,     // @param Node: move target node
                  grip,     // @param Node(= null): grip target node
                  option) { // @param Hash(= {}): { wheel, noshim }
                            //      option.wheel  - Number/Function: wheel, 0 is off
                            //                                1 is resize
                            //                                fn is callback
                            //      option.noshim - Number: noshim, 1 is disable shim(in IE6)
    grip = grip || node;
    this.option = uu.arg(option, { transform: true, shim: 0 });
    this.node = node;
    this.grip = grip;
    grip.style.cursor = "move";

    uu.css.position(node, "a"); // to absolute

    if (this.option.shim && uu.env.ie6) {
        this.option.shim = uu("Shim", node);
    }
/*
    this.shim = (uu.env.ie6 && !this.option.rel
                            && !this.option.noshim) ? uu("Shim", tgt) : 0;
 */

    uu.event(grip, uu.env.touch ? "touchstart,gesturestart"
                                : "mousedown", this)
    uu.mousewheel(node, this);

//    this.option.zoom && uu.mousewheel(node, this);
}

// uu.Class.Drag.fin
function dragfin() {
    uu.unbind(doc, "touchmove+,touchend+", this);
    uu.unbind(doc, "gesturechange+,gestureend+", this);
    uu.unbind(uu.ie678 ? this.grip : doc, _moveup, this);

    uu.css.position(this.node); // to static
}

// uu.Class.Drag.handleEvent
function dragHandleEvent(evt) {
    uu.event.stop(evt);

    uu.ui.dragbase(evt, this.node, this.grip, this.option);
    var code = evt.uu.code;

//this.node.textContent = evt.type;

    switch (code) {
    case uu.event.codes.mousedown:  // mousedown, touchstart, gesturestart

uu.log("mousedown: gesture=@ touches=@", evt.uu.gesture, evt.uu.touches ? evt.uu.touches.length : 0);

        if (evt.uu.gesture) {
            uu.unbind(doc, "touchmove+,touchend+", this);
            uu.bind(doc, "gesturechange+,gestureend+", this);
        } else {
            uu.bind(uu.ie678 ? this.grip : doc, _moveup, this);
        }
        break;

    case uu.event.codes.mouseup:    // mouseup, touchend, gestureend

uu.log("mouseup: gesture=@ touches=@", evt.uu.gesture, evt.uu.touches ? evt.uu.touches.length : 0);
        if (evt.uu.gesture) {
            uu.unbind(doc, "gesturechange+,gestureend+", this);
            uu.bind(doc, "touchmove+,touchend+", this);
        } else {
            uu.unbind(uu.ie678 ? this.grip : doc, _moveup, this);
        }
        break;
//  case uu.event.codes.wheel:
//      this.option.wheel && this.mousewheel(evt);
    }
}

})(document, uu);

