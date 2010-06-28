
// === uu.ui.dragbase, uu.ui.zindex ===
//#include uupaa.js
//#include css/text.js
//#include ui/zindex.js
//#include ui/shim.js
//#include misc/matrix2d.js

uu.ui.dragbase || (function(uu) {

uu.ui.dragbase = uuuidragbase; // drag & drop base handler

var _uuuidrag = "data-uuuidrag", // node["data-uuuidrag"] = { dragging: Boolean, x, y }
    _touch = uu.ver.touch,
    _transform = uu.webkit ? "webkitTransform"
               : uu.gecko  ? "MozTransform"
               : uu.opera  ? "OTransform" : "transform";

// uu.ui.dragbase -
function uuuidragbase(evt,      // @param event:
                      node,     // @param Node: move target node
                      grip,     // @param Node: grip target node
                      option) { // @param Hash(= {}): { mouseup, mousemove, mousedown, shim }
                                //  option.mouseup    - Function: mouseup/touchend/gestureend callback
                                //  option.mousemove  - Function: mousemove/touchmove/gesturechange callback
                                //  option.mousedown  - Function: mousedown/touchstart/gesturestart callback
                                //  option.mousewheel - Function: mousewheel callback
                                //  option.tripletap  - Boolean/Function: true is reset
                                //                                       triple tap callback
                                //  option.shim       - Object: shim object
    var opt = option || {},
        code = evt.code,
        pageX = evt.pageX,
        pageY = evt.pageY,
        dragInfo = grip[_uuuidrag],
        touches, finger, identifier, i; // for iPhone

    // init
    if (!dragInfo) {
        grip[_uuuidrag] = dragInfo = {
            tap: 0, scale: 1, rotate: 0, ox: 0, oy: 0,
            mode: 0 // 0=zoom, 1=rotate
        };
//{{{!mb
        if (uu.ie) {
            uu.mix(dragInfo, getCenterPosition(node));
            node.style.filter +=
                " progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')";
        }
//}}}!mb

        parseMatrix(node, dragInfo);
    }

    // mousedown, touchstart, gesturestart
    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {

        // toggle zoom/rotate mode
        if (!_touch && evt.mouse == 1) { // 1 is middle click
            dragInfo.mode = dragInfo.mode ? 0 : 1;
            node.style.cursor = dragInfo.mode
                              ? "url(rotate.cur),url(rotate.gif),default"
                              : "move";
            return;
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

        if (_touch) {
            parseMatrix(node, dragInfo);
        }
        // triple tap -> reset transform matrix
        if (option.tripletap && dragInfo.tap > 2) {
            if (option.tripletap === true) {
                dragInfo.tap = 0;
                dragInfo.scale = 1;
                dragInfo.rotate = 0;
                modMatrix(node, dragInfo, 1, 0);
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
                modMatrix(node, dragInfo, evt.scale, evt.rotation);
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
        if (evt.shiftKey || dragInfo.mode) {
            dragInfo.rotate += evt.wheel * 5;  // rotate
        } else {
            dragInfo.scale += evt.wheel * 0.1; // scale
            dragInfo.scale < 0.5 && (dragInfo.scale = 0.5);
        }
        modMatrix(node, dragInfo, 1, 0);
    }
}

// inner -
function modMatrix(node, dragInfo, scale, rotate) {
//{{{!mb
    if (uu.ie) {
        var mtx, filter, pos;

        scale = dragInfo.scale + scale - 1;
        rotate = (dragInfo.rotate + rotate) * Math.PI / 180; // deg2rad

        mtx = uu.matrix2d.scale(scale, scale, uu.matrix2d.identify());
        mtx = uu.matrix2d.rotate(-rotate, mtx);

        filter = node.filters.item("DXImageTransform.Microsoft.Matrix");
        filter.M11 = mtx[0];
        filter.M12 = mtx[1];
        filter.M21 = mtx[3];
        filter.M22 = mtx[4];

        // recalc center
        pos = getCenterPosition(node);
        node.style.marginLeft = dragInfo.cx - pos.cx + "px";
        node.style.marginTop  = dragInfo.cy - pos.cy + "px";
        return;
    }
//}}}!mb

//  node.style.webkitTransformOrigin = ""

    node.style[_transform] =
        "scale(" + (dragInfo.scale + scale - 1) +
        ") rotate(" + (dragInfo.rotate + rotate) + "deg)";
}

// inner - parse matrix
function parseMatrix(node,       // @param Node:
                     dragInfo) { // @param Hash:
    var style = node.style[_transform] || "", m

    m = /scale\(([\d\.]+)\)/.exec(style);
    m && (dragInfo.scale = +m[1]);

    m = /rotate\(([\d\.]+)deg\)/.exec(style);
    m && (dragInfo.rotate = +m[1]);
}

//{{{!mb
// inner -
function getCenterPosition(node) {
    var rect = node.getBoundingClientRect();

    return { cx: (rect.right  - rect.left) / 2,
             cy: (rect.bottom - rect.top)  / 2 };
}
//}}}!mb

})(uu);

