
// === uu.ui.dragbase, uu.ui.zindex ===
//#include uupaa.js
//#include css/text.js
//#include ui/zindex.js
//#include ui/shim.js

uu.ui.dragbase || (function(uu) {

uu.ui.dragbase = uuuidragbase; // drag & drop base handler

var _uuuidrag = "data-uuuidrag", // node["data-uuuidrag"] = { dragging: Boolean, x, y }
    _touch = uu.ver.touch;

// uu.ui.dragbase -
function uuuidragbase(evt,      // @param event:
                      node,     // @param Node: move target node
                      grip,     // @param Node: grip target node
                      option) { // @param Hash(= {}): { mouseup, mousemove, mousedown, shim }
                                //  option.mouseup   - Function: mouseup/touchend/gestureend callback
                                //  option.mousemove - Function: mousemove/touchmove/gesturechange callback
                                //  option.mousedown - Function: mousedown/touchstart/gesturestart callback
                                //  option.tripletap - Boolean/Function: true is reset
                                //                                       triple tap callback
                                //  option.shim      - Object: shim object
    var opt = option || {},
        pageX = evt.pageX,
        pageY = evt.pageY,
        code  = evt.code,
        dragInfo = grip[_uuuidrag] || {},
        touches, finger, identifier, i; // for iPhone

    // mousedown, touchstart, gesturestart
    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {

        // init
        if (!grip[_uuuidrag]) {
            grip[_uuuidrag] = dragInfo = { tap: 0, scale: 1, rotate: 0 };

            fetchTransform(node, dragInfo);
        }

        if (_touch) {
            if (evt.touches) {
                finger = evt.touches[evt.touches.length - 1];
                pageX = finger.pageX;
                pageY = finger.pageY;
                identifier = finger.identifier;
            }
        }
        dragInfo.x = pageX - (parseInt(node.style.left) || 0);
        dragInfo.y = pageY - (parseInt(node.style.top)  || 0);
        dragInfo.id = identifier;     // touch.identifier
        ++dragInfo.tap;
        dragInfo.dragging = 1;

        opt.mousedown && opt.mousedown(evt, node, option, dragInfo);

        uu.ui.zindex.beginDrag(node);

    // mouseup, touchend, gestureend
    } else if (code === uu.event.codes.mouseup && dragInfo.dragging) {

        if (_touch) {
            fetchTransform(node, dragInfo);

            // triple tap -> reset transform matrix
            if (option.tripletap && dragInfo.tap > 2) {
                if (option.tripletap === true) {
                    node.style.webkitTransform = "";
                    dragInfo.rotate = 0;
                    dragInfo.scale = 1;
                    dragInfo.tap = 0;
                } else {
                    option.tripletap(evt, node, option, dragInfo);
                }
            }
        }
        dragInfo.dragging = 0;

        opt.mouseup && opt.mouseup(evt, node, option, dragInfo);

        uu.ui.zindex.endDrag(node);

    // mousemove, touchmove, gesturechange
    } else if (code === uu.event.codes.mousemove && dragInfo.dragging) {

        if (_touch) {
            if (evt.gesture) {
//              node.style.webkitTransformOrigin = ""
                node.style.webkitTransform =
                    "scale(" + (dragInfo.scale + evt.scale - 1) +
                    ") rotate(" + (dragInfo.rotate + evt.rotation) + "deg)";
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
        node.style.left = (pageX - dragInfo.x) + "px";
        node.style.top  = (pageY - dragInfo.y) + "px";

        opt.mousemove && opt.mousemove(evt, node, option, dragInfo);
//{{{!mb
        opt.shim &&
            opt.shim.resize(pageX - dragInfo.x,
                            pageY - dragInfo.y,
                            node.offsetWidth,
                            node.offsetHeight);
//}}}!mb
        dragInfo.tap = 0;
    }

}

// inner - fetch transform params
function fetchTransform(node,       // @param Node:
                        dragInfo) { // @param Hash:
    var style = node.style.webkitTransform, m

    m = /scale\(([\d\.]+)\)/.exec(style);
    m && (dragInfo.scale = +m[1]);

    m = /rotate\(([\d\.]+)deg\)/.exec(style);
    m && (dragInfo.rotate = +m[1]);
}

})(uu);

