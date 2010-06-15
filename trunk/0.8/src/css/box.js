
// === CSS BoxModel ===
//#include uupaa.js

// clientWidth           = node.style.width + padding
// offsetWidth           = node.style.width + padding + border
// getBoundingClientRect = node.style.width + padding + border
//
/*
[CSS2.1 box model] http://www.w3.org/TR/CSS2/box.html

    B-------border--------+ -> border edge [CSS2.1 KEYWORD]
    |                     |
    |  P----padding----+  | -> padding edge [CSS2.1 KEYWORD]
    |  |               |  |
    |  |  C-content-+  |  | -> content edge [CSS2.1 KEYWORD]
    |  |  |         |  |  |
    |  |  |         |  |  |
    |  |  +---------+  |  |
    |  |               |  |
    |  +---------------+  |
    |                     |
    +---------------------+

    B = event.offsetX/Y in WebKit
        event.layerX/Y  in Gecko
    P = event.offsetX/Y in IE6 ~ IE8
    C = event.offsetX/Y in Opera
 */

uu.css.box || (function(win, doc, uu, getComputedStyle) {

uu.mix(uu.css, {
    box:            uucssbox,       // uu.css.box(node:Node, mode:Number = 0):Hash
    rect:           uucssrect,      // uu.css.rect(node:Node):Hash { x, y, offsetWidth, offsetHeight }
    toStatic:       uucsstostatic,  // uu.css.toStatic(node:Node):Node
    toAbsolute:     uucsstoabsolute,// uu.css.toAbsolute(node:Node):Node
    toRelative:     uucsstorelative // uu.css.toRelative(node:Node):Node
});

var _uucssbox = "data-uucssbox";

// uu.css.box - get box size(margin, padding, border, width, height)
function uucssbox(node,  // @param Node:
                  quick, // @param Boolean(= false): false is use-cache, true is quick-mode
                  mbp) { // @param Number(= 0x7): select properties, 0x7 is all,
                         //                       0x4 is margin only,
                         //                       0x2 is border only,
                         //                       0x1 is padding only
                         // @return Hash: { width:  style.width,
                         //                 height: style.height,
                         //                 margin:  { top, left, right, bottom },
                         //                 border:  { top, left, right, bottom },
                         //                 padding: { top, left, right, bottom } }
    var rv = node[_uucssbox];

    if (!rv || !quick) {
        var zero = "0px", uucssunit = uu.css.unit, bw = uucssbox.bw,
            mbp = mbp || 0x7,
            ns = uu.css(node, true), // computed pixel unit
            mt = ns.marginTop,
            ml = ns.marginLeft,
            mr = ns.marginRight,
            mb = ns.marginBottom,
            pt = ns.paddingTop,
            pl = ns.paddingLeft,
            pr = ns.paddingRight,
            pb = ns.paddingBottom;
            bt = ns.borderTopWidth,
            bl = ns.borderLeftWidth,
            br = ns.borderRightWidth,
            bb = ns.borderBottomWidth;

        if (mbp & 0x4) { // margin
            mt = mt === zero ? 0 : uucssunit(node, mt, 1);
            ml = ml === zero ? 0 : uucssunit(node, ml, 1);
            mr = mr === zero ? 0 : uucssunit(node, mr, 1);
            mb = mb === zero ? 0 : uucssunit(node, mb, 1);
        }
        if (mbp & 0x2) { // border
            bt = bw[bt] || (bt === zero ? 0 : uucssunit(node, bt, 1));
            bl = bw[bl] || (bl === zero ? 0 : uucssunit(node, bl, 1));
            br = bw[br] || (br === zero ? 0 : uucssunit(node, br, 1));
            bb = bw[bb] || (bb === zero ? 0 : uucssunit(node, bb, 1));
        }
        if (mbp & 0x1) { // padding
            pt = pt === zero ? 0 : uucssunit(node, pt, 1);
            pl = pl === zero ? 0 : uucssunit(node, pl, 1);
            pr = pr === zero ? 0 : uucssunit(node, pr, 1);
            pb = pb === zero ? 0 : uucssunit(node, pb, 1);
        }
        rv = node[_uucssbox] = {
            width:   ns.width,
            height:  ns.height,
            margin:  { top: mt, left: ml, right: mr, bottom: mb },
            border:  { top: bt, left: bl, right: br, bottom: bb },
            padding: { top: pt, left: pl, right: pr, bottom: pb }
        };
    }
    return rv;
}
uucssbox.bw = { // border-width
    thin: 1, medium: 3, thick: (uu.ver.ie6 || uu.ver.ie7 || uu.opera) ? 6 : 5
};

//  [1][offset from foster node(layout parent)] uu.css.getBorderEdge(<div>) -> { x: 100, y: 100, w: 100, h: 100 }
//  [2][offset from ancestor node]              uu.css.getBorderEdge(<div>, <html>) -> { x: 200, y: 200, w: 100, h: 100 }

// uu.css.rect - get offset from foster node(layout parent)
function uucssrect(node,           // @param Node:
                   ancestorNode) { // @param Node(= null): null is layout parent
                                   // @return Hash: { x, y, w, h }
                                   // @test test/CSS/uu.css.boxRect.htm
                                   // @test test/CSS/uu.css.boxRect(ie8 offset-1px bug).htm
    var cs = uu.css(node), position = cs.position,
        x = 0,
        y = 0,
        w = node.offsetWidth  || 0, // offsetWidth  = node.style.width  + padding + border
        h = node.offsetHeight || 0, // offsetHeight = node.style.height + padding + border
        n = node,
        ancestor = doc.html, quick = 0;

    if (position === "relative" || position === "absolute") {
        if (cs.left !== "auto" && cs.top !== "auto") {
            quick = 1;
        }
//{{{!mb
        if (uu.gecko) {
            if (cs.left === "0px" || cs.top === "0px") { // [GECKO][FIX] left:auto -> "0px"
                quick = 0;
            }
        }
//}}}!mb
    }

    if (ancestorNode == null) {
        // offset from foster node(layout parent)
        if (quick) {
            x = parseInt(cs.left);
            y = parseInt(cs.top);
        } else {
            while (n && n !== ancestor) {
                x += n.offsetLeft || 0;
                y += n.offsetTop  || 0;
                n  = n.offsetParent;
                if (n) {
                    cs = (getComputedStyle ? getComputedStyle(n, 0)
                                           : n.currentStyle).position;
                    if (cs === "relative" || cs === "absolute") {
                        break;
                    }
                }
            }
        }
    } else {
        // offset from ancestor node
        while (n && n !== ancestor) {
            x += n.offsetLeft || 0;
            y += n.offsetTop  || 0;
            n  = n.offsetParent;
        }
    }
    return { x: x, y: y, w: w, h: h };
}

// uu.css.toStatic - to static
function uucsstostatic(node) { // @param Node:
                               // @return Node:
    node.style.position = "static";
    return node;
}

// uu.css.toAbsolute - to absolute
function uucsstoabsolute(node) { // @param Node:
                                 // @return Node:
    var ns = node.style,
        rect = uucssrect(node), // offset from foster
        box = uucssbox(node, false, 0x4); // margin only

    ns.position = "absolute";
    ns.left = (rect.x - box.margin.left) + "px";
    ns.top  = (rect.y - box.margin.top)  + "px";
    return node;
}

// uu.css.toRelative - to relative
function uucsstorelative(node) { // @param Node:
                                 // @return Node:
    var ns = node.style, cs = uu.css(node);

    ns.position = "relative";
    ns.left = cs.left;
    ns.top  = cs.top;
    return node;
}

})(this, this.document, uu, this.getComputedStyle);

