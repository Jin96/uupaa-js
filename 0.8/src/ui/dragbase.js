
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
                                //  option.mouseup   - Function: mouseup callback
                                //  option.mousemove - Function: mousemove callback
                                //  option.mousedown - Function: mousedown callback
                                //  option.shim      - Object: shim object
    var opt = option || {},
        pageX = evt.pageX,
        pageY = evt.pageY,
        code  = evt.code,
        dragInfo = grip[_uuuidrag] || {},
        touches, finger, identifier, i, iz; // for iPhone

    if (code === 1 && !dragInfo.dragging) { // 1: mousedown, touchstart

        if (_touch) {
            finger = evt.touches[evt.touches.length - 1];
            identifier = finger.identifier;
            pageX = finger.pageX;
            pageY = finger.pageY;
        }

        dragInfo = grip[_uuuidrag] = {
            x: pageX - (parseInt(node.style.left) || 0),
            y: pageY - (parseInt(node.style.top)  || 0),
            id: identifier, // touch.identifier
            dragging: 1
        };

        opt.mousedown && opt.mousedown(evt, node, option, dragInfo);

        uu.ui.zindex.beginDrag(node);

    } else if (code === 2 && dragInfo.dragging) { // 2: mouseup, touchend

        dragInfo.dragging = 0;

        opt.mouseup && opt.mouseup(evt, node, option, dragInfo);

        uu.ui.zindex.endDrag(node);

    } else if (code === 3 && dragInfo.dragging) { // 3: mousemove, touchmove

        if (_touch) {
            touches = evt.touches;
            for (i = 0, iz = touches.length; i < iz; ++i) {
                finger = touches[i];
                if (dragInfo.id === finger.identifier) {
                    pageX = finger.pageX;
                    pageY = finger.pageY;
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
    }
}

})(uu);

