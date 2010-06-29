
// === uu.ui.dragbase, uu.ui.zindex ===
//#include uupaa.js
//#include css/text.js
//#include ui/zindex.js
//#include ui/shim.js
//#include misc/matrix2d.js

uu.ui.dragbase || (function(uu) {

uu.ui.dragbase = uuuidragbase; // drag & drop base handler

var _uuuidrag = "data-uuuidrag", // node["data-uuuidrag"] = { dragging: Boolean, x, y }
    _touch = uu.ver.touch;

// uu.ui.dragbase -
function uuuidragbase(evt,      // @param event:
                      node,     // @param Node: move target node
                      grip,     // @param Node: grip target node
                      option) { // @param Hash(= {}): { mouseup, mousemove, mousedown, shim }
                                //  option.mouseup    - Function: mouseup/touchend/gestureend callback
                                //  option.mousemove  - Function: mousemove/touchmove/gesturechange callback
                                //  option.mousedown  - Function: mousedown/touchstart/gesturestart callback
                                //  option.mousewheel - Function: mousewheel callback
                                //  option.transform  - Boolean: true is use transform
                                //  option.shim       - Object: shim object
    var opt = option || {},
        code = evt.code,
        pageX = evt.pageX,
        pageY = evt.pageY,
        dragInfo = grip[_uuuidrag],
        scale, rotate, // for transform
        touches, finger, identifier, i; // for iPhone

    // init
    if (!dragInfo) {
        grip[_uuuidrag] = dragInfo = {
            tap: 0, ox: 0, oy: 0, trans: [1, 1, 0, 0, 0],
            mode: 0 // 0=zoom, 1=rotate
        };
        dragInfo.trans = uu.css.transform(node).concat();
    }

    // mousedown, touchstart, gesturestart
    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {

        // toggle zoom/rotate mode
        if (option.transform) {
            if (!_touch && evt.mouse == 1) { // 1 is middle click
                dragInfo.mode = dragInfo.mode ? 0 : 1;
                node.style.cursor = dragInfo.mode
                                  ? "url(rotate.cur),url(rotate.gif),default"
                                  : "move";
                return;
            }
        }

        if (_touch) {
            if (evt.touches) {
                finger = evt.touches[evt.touches.length - 1];
                pageX = finger.pageX;
                pageY = finger.pageY;
                identifier = finger.identifier;
            }
        }

        dragInfo.ox = pageX - (parseInt(node.style.left) || 0);
        dragInfo.oy = pageY - (parseInt(node.style.top)  || 0);
        dragInfo.id = identifier;     // touch.identifier
        ++dragInfo.tap;
        dragInfo.dragging = 1;

        opt.mousedown && opt.mousedown(evt, node, option, dragInfo);

        uu.ui.zindex.beginDrag(node);

    // mouseup, touchend, gestureend
    } else if (code === uu.event.codes.mouseup && dragInfo.dragging) {

        if (option.transform) {
            if (_touch) {
                // store current state
                dragInfo.trans = uu.css.transform(node).concat();
            }
            // triple tap -> reset transform matrix
            if (dragInfo.tap > 2) {
                dragInfo.tap = 0;
                uu.css.transform(node, dragInfo.trans = [1, 1, 0, 0, 0]);
            }
        }

        dragInfo.dragging = 0;

        opt.mouseup && opt.mouseup(evt, node, option, dragInfo);

        uu.ui.zindex.endDrag(node);

    // mousemove, touchmove, gesturechange
    } else if (code === uu.event.codes.mousemove && dragInfo.dragging) {

        if (_touch) {
            if (evt.gesture) {
                if (option.transform) {
                    scale  = dragInfo.trans[0] + evt.scale - 1,
                    rotate = dragInfo.trans[2] + evt.rotation;
                    uu.css.transform(node, [scale, scale, rotate, 0, 0]);
                }
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
        node.style.left = (pageX - dragInfo.ox) + "px";
        node.style.top  = (pageY - dragInfo.oy) + "px";

        opt.mousemove && opt.mousemove(evt, node, option, dragInfo);
        dragInfo.tap = 0;
//{{{!mb
        opt.shim &&
            opt.shim.resize(pageX - dragInfo.x,
                            pageY - dragInfo.y,
                            node.offsetWidth,
                            node.offsetHeight);
//}}}!mb
    // mousewheel
    } else if (code === uu.event.codes.mousewheel) {
        if (option.transform) {
            if (evt.shiftKey || dragInfo.mode) {
                dragInfo.trans[2] += evt.wheel * 5;  // rotate
            } else {
                scale = dragInfo.trans[0];
                scale += evt.wheel * 0.1;
                scale < 0.5 && (scale = 0.5);
                dragInfo.trans[0] = dragInfo.trans[1] = scale;
            }
            uu.css.transform(node, dragInfo.trans);
        }
    }
}

})(uu);

