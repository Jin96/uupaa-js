
// === uu.ui.dragbase, uu.ui.zindex ===
//#include uupaa.js
//#include css/text.js
//#include ui/zindex.js

uu.ui.svgdragbase || (function(win, doc, uu) {

uu.ui.svgdragbase = uuuisvgdragbase; // drag & drop base handler

var _uuuidrag = "data-uuuidrag", // node["data-uuuidrag"] = { dragging: Boolean, x, y }
    _touch = uu.ver.touch;

// uu.ui.svgdragbase -
function uuuisvgdragbase(evt,      // @param event:
                         node,     // @param Node: move target node
                         grip,     // @param Node: grip target node
                         option) { // @param Hash: { mouseup, mousemove, mousedown, shim }
                                    //  option.mouseup    - Function: mouseup/touchend/gestureend callback
                                    //  option.mousemove  - Function: mousemove/touchmove/gesturechange callback
                                    //  option.mousedown  - Function: mousedown/touchstart/gesturestart callback
                                    //  option.mousewheel - Function: mousewheel callback
                                    //  option.tripletap  - Boolean/Function: true is reset
                                    //                                        triple tap callback
    var opt = option, mtx, trans,
        code = evt.code,
        pageX = evt.pageX,
        pageY = evt.pageY,
        dragInfo = grip[_uuuidrag],
        base = node.transform.baseVal,
        touches, finger, identifier, i; // for iPhone

    // init
    if (!dragInfo) {
        trans = uu.svg.attr.transform(node);

        grip[_uuuidrag] = dragInfo = {
            tap: 0,
            scale: trans.scale, rotate: trans.rotate,
            tx: trans.tx, ty: trans.tx, ox: 0, oy: 0,
            x: trans.tx, y: trans.ty
        };
    }

    // mousedown, touchstart, gesturestart
    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {

        if (_touch) {
            if (evt.touches) {
                finger = evt.touches[evt.touches.length - 1];
                pageX = finger.pageX;
                pageY = finger.pageY;
                identifier = finger.identifier;
            }
        }
        mtx = base.getItem(base.numberOfItems - 1).matrix;
        dragInfo.ox = pageX - mtx.e;
        dragInfo.oy = pageY - mtx.f;
        dragInfo.id = identifier;     // touch.identifier
        ++dragInfo.tap;
        dragInfo.dragging = 1;

        opt.mousedown && opt.mousedown(evt, node, option, dragInfo);

        uu.ui.zindex.beginDrag(node);

    // mouseup, touchend, gestureend
    } else if (code === uu.event.codes.mouseup && dragInfo.dragging) {

        // triple tap -> reset transform matrix
        if (option.tripletap && dragInfo.tap > 2) {
            if (option.tripletap === true) {
                dragInfo.tap = 0;
                dragInfo.scale = 1;
                dragInfo.rotate = 0;
                dragInfo.x = 0;
                dragInfo.y = 0;
            } else {
                option.tripletap(evt, node, option, dragInfo);
            }
        }
        dragInfo.dragging = 0;

        opt.mouseup && opt.mouseup(evt, node, option, dragInfo);

        uu.ui.zindex.endDrag(node);

    // mousemove, touchmove, gesturechange
    } else if (code === uu.event.codes.mousemove && dragInfo.dragging) {

        if (_touch) {
            if (evt.gesture) {
                dragInfo.scale = evt.scale;
                dragInfo.rotate = evt.rotation;
                modMatrix(node, dragInfo);
                return;
            }
            touches = evt.touches;
            if (touches) {
                i = touches.length;
                while (i--) {
                    finger = touches[i];
                    if (dragInfo.id === finger.identifier) {
                        pageX = finger.pageX;
                        pageY = finger.pageY;
                        break;
                    }
                }
            }
        }
        dragInfo.x = pageX - dragInfo.ox;
        dragInfo.y = pageY - dragInfo.oy;

        opt.mousemove && opt.mousemove(evt, node, option, dragInfo);
        dragInfo.tap = 0;

    // mousewheel
    } else if (code === uu.event.codes.mousewheel) {
        if (evt.shiftKey) {
            dragInfo.rotate += evt.wheel * 5;  // rotate
        } else {
            dragInfo.scale += evt.wheel * 0.1; // scale
            dragInfo.scale < 0.5 && (dragInfo.scale = 0.5);
        }
    }
    modMatrix(node, dragInfo);
}

function modMatrix(node, dragInfo) {
    var mtx = node.ownerSVGElement.createSVGMatrix(),
        base = node.transform.baseVal;

    base.replaceItem(
        base.createSVGTransformFromMatrix(
            mtx.translate(dragInfo.x, dragInfo.y).
                scale(dragInfo.scale).
                rotate(dragInfo.rotate)), base.numberOfItems - 1);
}

})(this, document, uu);

