// === SVG ===
//#include uupaa.js
//#include color/color.js

uu.svg || (function(win, doc, uu) {

var _fix = uu.hash("w,width,h,height,text,textContent");

uu.svg = uu.mix(uusvg, {
    attr:    uu.mix(uusvgattr, {        // uu.svg.attr(node:SVGNode, key:String/Hash = void,
                                        //             value:String = void):String/Hash/Node
                                        //  [1][get all pair]   uu.svg.attr(node) -> { key: value, ... }
                                        //  [2][get value]      uu.svg.attr(node, key) -> "value"
                                        //  [3][set pair]       uu.svg.attr(node, key, "value") -> node
                                        //  [4][set pair]       uu.svg.attr(node, { key: "value", ... }) -> node
                                        //  [5][remove attr]    uu.svg.attr(node, key, null) -> node
        transform:  uusvgattrtransform  // uu.svg.attr.transform(node:SVGNode):Hash
                                        //  [1][get transform]  uu.svg.attr.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }
    }),
    css:            uusvgcss,
    g:              uusvgg,
    circle:         uusvgcircle,
    rect:           uusvgrect,
    text:           uusvgtext,
    // --- EVENT ---
    event:   uu.mix(uu.event, {
        unbind:     uu.event.unbind
    }),
    bind:           uu.event,
    unbind:         uu.event.unbind,
    isNode:         isNode          // uu.svg.isNode(search:Mix):Boolean
});

// uu.svg.isNode - is SVG node
function isNode(search) { // @param Mix: search
                          // @return Boolean:
    return search && "ownerSVGElement" in search;
}

// uu.svg - <svg:svg>
function uusvg(x,        // @param Number: Has no meaning or effect on outermost 'svg' elements
               y,        // @param Number: Has no meaning or effect on outermost 'svg' elements
               width,    // @param Number: For outermost 'svg' elements, the intrinsic
                         //                 width of the SVG document fragment.
                         //                For embedded 'svg' elements, the width of
                         //                 the rectangular region into which the 'svg' element is placed.
               height) { // @param Number: For outermost 'svg' elements, the intrinsic
                         //                 height of the SVG document fragment.
                         //                For embedded 'svg' elements, the height of
                         //                 the rectangular region into which the 'svg' element is placed.
                    // @return SVGNode: <svg:svg>
    return buildNode("svg", ["x", "y", "w", "h"], arguments);
}

// uu.svg.g - <svg:g>
function uusvgg(tx,   // @param Number: translate x
                ty) { // @param Number: translate y
                      // @return SVGNode: <svg:g>
    return buildNode("g", ["tx", "ty"], arguments);
}

// uu.svg.rect - <svg:rect>
function uusvgrect(x,      // @param Number:
                   y,      // @param Number:
                   width,  // @param Number:
                   height, // @param Number:
                   rx,     // @param Number: radius
                   ry) {   // @param Number: radius
                           // @return SVGNode: <svg:rect>
    return buildNode("rect", ["x", "y", "width", "height", "rx", "ry"], arguments);
}

// uu.svg.circle - <svg:circle>
function uusvgcircle(cx,  // @param Number:
                     cy,  // @param Number:
                     r) { // @param Number: radius
                          // @return SVGNode: <svg:circle>
    return buildNode("circle", ["cx", "cy", "r"], arguments);
}

// uu.svg.text - <svg:text>
function uusvgtext(txt, // @param String:
                   x,   // @param Number:
                   y) { // @param Number:
                        // @return SVGNode: <svg:text>
    var rv = buildNode("text", ["text", "x", "y"], arguments);

    rv.setAttribute("dx", 0);
    rv.setAttribute("dy", 0);
    return rv;
}

//  [1][get all pair]   uu.svg.attr(node) -> { key: "value", ... }
//  [2][get value]      uu.svg.attr(node, key) -> "value"
//  [3][set pair]       uu.svg.attr(node, key, "value") -> node
//  [4][set pair]       uu.svg.attr(node, { key: "value", ... }) -> node
//  [5][remove attr]    uu.svg.attr(node, key, null) -> node

// uu.svg.attr - attribute accessor
function uusvgattr(node,    // @param Node:
                   key,     // @param String/Hash(= void): key
                   value) { // @param String(= void): "value"
                            // @return String/Hash/Node:
    var rv, ary, i, v, fix, tx = 0, ty = 0, mtx;

    if (key === void 0) { // [1] uu.svg.attr(node)
        rv = {};
        ary = node.attributes;

        while ( (v = ary[++i]) ) {
            rv[v.name] = v.value;
        }
        return rv; // Hash
    }
    if (arguments.length > 2) {     // [3] uu.svg.attr(node, key, value)
        key = uu.hash(key, value);
    } else if (uu.isString(key)) {  // [2] uu.svg.attr(node, key)
        return node.getAttribute(_fix[key] || key) || "";
    }
    for (i in key) {
        fix = _fix[i] || i;
        v = key[i];

        if (key[i] === null) {
            node.removeAttribute(fix); // [5]
        } else {
            switch (fix) {
            case "tx": tx = v; break;
            case "ty": ty = v; break;
            case "textContent": node[fix] = v; break;
            default: node.setAttribute(fix, v); // [4]
            }
        }
    }

    if (node.tagName === "g") {

        // <svg:g transform="scale(2) rotate(45) translate(100,200)">
//uu.log("before=" + node.getAttribute("transform"));

        mtx = (node.getAttribute("transform") || "")
            + " translate(" + tx + "," + ty + ")";
        node.setAttribute("transform", mtx);

//uu.log("after=" + node.getAttribute("transform"));
    }

    return node;
}

//  [1][get transform]  uu.svg.attr.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }

// uu.svg.attr.transform - parse transform
function uusvgattrtransform(node) { // @param SVGNode:
                                    // @return Hash:
    var v = (node.getAttribute("transform") || "").replace(/\s+/, ""),
        m, scale = 1, rotate = 0, tx = 0, ty = 0;

    m = /scale\(([\d\.]+)\)/.exec(v);
    m && (scale = +m[1]);

    m = /rotate\(([\d\.]+)\)/.exec(v);
    m && (rotate = +m[1]);

    m = /translate\(([\-\+\d\.]+)(?:,([\-\+\d\.]+))?\)/.exec(v);
    m && (tx = +m[1], ty = +m[2] || 0);

    return { scale: scale, rotate: rotate, tx: tx, ty: ty };
}

// uu.svg.css
function uusvgcss(node,
                  hash) {
    var i, v;
    for (i in hash) {
        v = _fix[i] || i;
        node.style[v] = hash[i];
    }
    return node;
}

// inner - build svg node
function buildNode(tagName, // @param TagNameString: "svg"
                   defargs, // @param Array:
                   args) {  // @param Array/Arguments: [Node/String/Number/Hash, ...]
                            // @return Node:
    var node = doc.createElementNS("http://www.w3.org/2000/svg", tagName),
        ai = 0, attr, css,
        arg, i = 0, iz = args.length, token = 0, type;

    for (; i < iz; ++i) {
        arg = args[i];
        type = typeof arg;

        if (type === "number" || type === "string") {
            attr || (attr = {});
            attr[defargs[ai++] || "_"] = arg; // uu.mix(attr, { x: 100 })
        } else if (arg.nodeType) {
            node.appendChild(arg);
        } else if (++token < 2) {
            attr ? uu.mix(attr, arg) : (attr = arg);
        } else if (token < 3) {
            css  ? uu.mix(css, arg)  : (css  = arg);
        }
    }
    attr && uusvgattr(node, attr);
    css  && uusvgcss(node, css);
    return node;
}

})(window, document, uu);

