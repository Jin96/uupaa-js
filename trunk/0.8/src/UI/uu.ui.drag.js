
// === uu.ui.drag ===
//{{{!depend uu, uu.ui.dragbase, uu.ui.zindex
//}}}!depend

uu.Class.Drag || (function(doc, uu) {

// uu.Class.Drag - Generic Drag and Drop manage class
uu.Class("Drag", {
    init:         draginit,         // init(tgt, grip, option = {})
    handleEvent:  dragHandleEvent//,  // handleEvent(evt)
//    mousewheel:   dragmousewheel    // mousewheel(evt)
});

var _ie678 = uu.ie && !uu.ver.jit;

// --- drag ---
// uu.Class.Drag.init
function draginit(node,     // @param Node: move target node
                  grip,     // @param Node(= null): grip target node
                  option) { // @param Hash(= {}): { ghost, wheel, noshim, rel, minw, maxw, minh, maxh }
                            //      option.ghost  - Number: ghost, 1 is enable ghost effect
                            //      option.wheel  - Number/Function: wheel, 0 is off
                            //                                1 is resize
                            //                                fn is callback
                            //      option.noshim - Number: noshim, 1 is disable shim(in IE6)
                            //      option.relative    - Number: rel, 1 is relative, 0 is absolute
                            //      option.minw   - Number: min width
                            //      option.maxw   - Number: max width
                            //      option.minh   - Number: min height
                            //      option.maxh   - Number: max height
    grip = grip || node;
    this.option = uu.arg(option, {
//        ghost:      0,
//        relative:   0,
        shim: 0,
        zoom: {
            width:  { min: 0, max: 2000 },
            height: { min: 0, max: 2000 }
        }
    });
    this.node = node;
    this.grip = grip;
    grip.style.cursor = "move";
/*
    this.option.relative ? uu.css.toRelative(node)
                         : uu.css.toAbsolute(node);
 */
    uu.css.toAbsolute(node);

    if (this.option.shim && uu.ver.ie6) {
        this.option.shim = uu("Shim", node);
    }
/*
    this.shim = (uu.ver.ie6 && !this.option.rel
                            && !this.option.noshim) ? uu("Shim", tgt) : 0;
 */
    uu.mousedown(grip, this);
//    this.option.zoom && uu.mousewheel(node, this);
}

// uu.Class.Drag.handleEvent
function dragHandleEvent(evt) {
    uu.event.stop(evt);

    uu.ui.dragbase(evt, this.node, this.grip, this.option);
    var xtype = evt.xtype, fn;

    if (xtype < 5) {
        if (xtype < 3) { // 1: mousedown, 2: mouseup
            fn = xtype === 1 ? uu.event : uu.event.unbind;

            fn(_ie678 ? this.grip : doc, "mousemove+,mouseup+", this);
        } else if (xtype === 3) { // [3] mousemove
/*
            this._shim &&
                this._shim.resize({ x: rv.px, y: rv.py, w: this._tgt.offsetWidth,
                                                        h: this._tgt.offsetHeight });
 */
        } else if (xtype === 4) { // 4: wheel
//            this.option.wheel && this.mousewheel(evt);
        }
    }
}

/*
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
 */

/*
// --- impl ---
// inner -
function uueventdraglimit(min,   // @param Number:
                          value, // @param Number:
                          max) { // @param Number:
                                 // @return Boolean:
    return (min > value) ? min
                         : (value > max) ? max : value;
}
 */

})(document, uu);

