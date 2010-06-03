
// === uu.ui.dragbase, uu.ui.zindex ===
//#include uupaa.js
//#include css/text.js
//#include ui/zindex.js
//#include ui/shim.js

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

})(uu);

