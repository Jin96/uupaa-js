// === SVG ===
//#include uupaa.js

uu.svg.g || (function(win, doc, uu) {

uu.mix(uu.svg, {
    g:          uusvgg,
    circle:     uusvgcircle,
    rect:       uusvgrect,
    text:       uusvgtext
});

uu.svg.transform = uusvgtransform; // uu.svg.transform(node:SVGNode):Hash
                                   //  [1][get transform]  uu.svg.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }

var _getAttribute = "getAttribute",
    _setAttribute = "setAttribute";

// uu.svg.g - <svg:g>
function uusvgg(tx,   // @param Number: translate x
                ty) { // @param Number: translate y
                      // @return SVGNode: <svg:g>
/*
    return uu.node.build("svg:g", arguments, ["tx", "ty"], function(node, sp) {
        var mtx = (node[_getAttribute]("transform") || "")
                + " translate(" + sp.tx + "," + (sp.ty || 0) + ")";

        node[_setAttribute]("transform", mtx);
    });
 */
    return uu.node("svg:g", arguments, ["tx", "ty"], function(node, sp) {
        var mtx = (node[_getAttribute]("transform") || "")
                + " translate(" + sp.tx + "," + (sp.ty || 0) + ")";

        node[_setAttribute]("transform", mtx);
    });

}

// uu.svg.rect - <svg:rect>
function uusvgrect(x,      // @param Number:
                   y,      // @param Number:
                   width,  // @param Number:
                   height, // @param Number:
                   rx,     // @param Number: radius
                   ry) {   // @param Number: radius
                           // @return SVGNode: <svg:rect>
    return uu.node("svg:rect", arguments,
                     ["x", "y", "width", "height", "rx", "ry"], uu.attr);
}

// uu.svg.circle - <svg:circle>
function uusvgcircle(cx,  // @param Number:
                     cy,  // @param Number:
                     r) { // @param Number: radius
                          // @return SVGNode: <svg:circle>
    return uu.node("svg:circle", arguments, ["cx", "cy", "r"], uu.attr);
}

// uu.svg.text - <svg:text>
function uusvgtext(txt, // @param String:
                   x,   // @param Number:
                   y) { // @param Number:
                        // @return SVGNode: <svg:text>
    var rv = uu.node("svg:text", arguments, ["text", "x", "y"], function(node, sp) {
        node.textContent = sp.text;
        node[_setAttribute]("x", sp.x || 0);
        node[_setAttribute]("y", sp.y || 0);
    });
    rv[_setAttribute]("dx", 0);
    rv[_setAttribute]("dy", 0);
    return rv;
}

//  [1][get transform]  uu.svg.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }

// uu.svg.transform - parse transform
function uusvgtransform(node) { // @param SVGNode:
                                // @return Hash:
    var v = (node[_getAttribute]("transform") || "").replace(/\s+/, ""),
        m, scale = 1, rotate = 0, tx = 0, ty = 0;

    m = /scale\(([\d\.]+)\)/.exec(v);
    m && (scale = +m[1]);

    m = /rotate\(([\d\.]+)\)/.exec(v);
    m && (rotate = +m[1]);

    m = /translate\(([\-\+\d\.]+)(?:,([\-\+\d\.]+))?\)/.exec(v);
    m && (tx = +m[1], ty = +m[2] || 0);

    return { scale: scale, rotate: rotate, tx: tx, ty: ty };
}

})(window, document, uu);

