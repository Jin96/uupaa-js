// === SVG ===
//{@svg
//#include uupaa.js

uu.svg || (function(uu) {

var _getAttribute = "getAttribute",
    _setAttribute = "setAttribute";

uu.svg = uu.mix(uusvg, {        // uu.svg(node:Node/TagNameString,
                                //        args:Array/Arguments = void, 
                                //        typical:String = void,
                                //        callback:CallbackFunction = void):SVGNode
    svg:        uusvgsvg,       // uu.svg(x:Number, y:Number, width:Number, height:Number,
                                //        *attr:Hash, *css:Hash):<svg:svg>
    g:          uusvgg,         // uu.svg.g(tx:Number, ty:Number)
    rect:       uusvgrect,      // uu.svg.rect
    text:       uusvgtext,      // uu.svg.text
    circle:     uusvgcircle,    // uu.svg.circle
    transform:  uusvgtransform  // uu.svg.transform(node:SVGNode):Hash
                                //  [1][get transform]  uu.svg.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }
});

// uu.svg - node builder
function uusvg(node,       // @param Node/TagNameString: Node or TagName, eg: <svg:svg>, "circle"
               args,       // @param Array/Arguments(= void): [Node/String/Number/Hash/null, ...]
               typical,    // @param StringArray(= void): eg: ["x", "y"]
               callback) { // @param CallbackFunction(= void):
                           // @return SVGNode:

    //  [1][SVGNode]            uu.svg.svg(uu.svg.circle())                 -> <svg:svg><svg:circle></svg:circle></svg>
    //  [2][SVGTextNode]        uu.svg.svg(uu.text("hello"))                -> <svg:svg>hello</svg:svg>
    //  [3][SVGTextNode]        uu.svg.svg("hello")                         -> <svg:svg>hello</svg:svg>
    //  [4][SVGTextNode atmark] uu.svg.svg("format @ @", "hello", "world")  -> <svg:svg>format hello world</svg:svg>
    //  [5][attr]               uu.svg.svg("id:a,class:hello")              -> <svg:svg id="a" class="hello"></svg:svg>
    //  [6][attr]               uu.svg.svg({id:"a","class":"hello"})        -> <svg:svg id="a" class="hello"></svg:svg>
    //  [7][attr atmark]        uu.svg.svg("id:@", "a")                     -> <svg:svg id="a"></svg:svg>
    //  [8][css]                uu.svg.svg(null, "color:red;float:left")    -> <svg:svg style="color:red;float:left"></svg:svg>
    //  [9][css]                uu.svg.svg(null, {color:"red",float:"left"})-> <svg:svg style="color:red;float:left"></svg:svg>
    //  [10][css atmark]        uu.svg.svg(null, "color:@", "red")          -> <svg:svg style="color:red"></svg:svg>
    //  [11][typical]           uu.svg.circle(100, 101, 102)                -> <svg:circle cx="100" cy="101" r="102"></svg:circle>
    //  [12][complex]           uu.svg.svg("id:@", "a", {color:"red"}, "@ @", "hello", "world")
    //                                                                      -> <svg:svg id="a" style="color:red">hello world</svg:svg>
    node.nodeType || (node = document.createElementNS("http://www.w3.org/2000/svg", node)); // "circle" -> <svg:circle>

    if (args) {
        var arg, i = 0, iz = args.length, token = 0, match, type,
            ai = 0, resultHash = {},
            split = uu.node._.split, at = uu.node._.at;

        for (; i < iz; ++i) {
            arg = args[i];
            type = arg == null ? 0 // null or undefined
                 : arg.nodeType ? 1 // Node
                 : typeof arg === "string" ? 2
                 : typeof arg === "number" ? 4 : 3;

            switch (type) {
            case 0: ++token; break; // skip
            case 1: node.appendChild(arg); break; // arg is Node -> appendChild(node)
            case 2:
                // uu.svg("id:@","a")      -> uu.svg(uu.string.format("id:@", "a"))
                // uu.svg("@ @", "a", "b") -> uu.svg(uu.string.format("@ @", "a", "b"))
                if (arg.indexOf("@") >= 0) {
                    match = arg.match(at).length;
                    arg = uu.f(uu.array(args, i, i + match + 1));
                    i += match; // skip args
                }
                if (!split.test(arg)) { // uu.svg("text") -> uu.svg(uu.text("text"))
                    node.appendChild(document.createTextNode(arg));
                    break;
                }
            case 3: // uu.svg({id:"a"},{color:"red"}) -> uu.attr({id:"a"}), uu.css({color:"red"})
                    // uu.svg("id:a","color:red")     -> uu.attr({id:"a"}), uu.css({color:"red"})
                switch (token++) {
                case 0: uu.attr(node, type === 2 ? uu.hash(arg, split) : arg); break;
                case 1:  uu.css(node, type === 2 ? uu.hash(arg, split) : arg); break;
                default: uu.ng("uu.svg", arg);
                }
                break;
            case 4: // uu.svg()
                resultHash[typical[ai++]] = arg;
            }
        }
    }
    typical && callback && callback(node, resultHash);
    return node;
}

// uu.svg.svg - <svg:svg>
function uusvgsvg(x,        // @param Number: Has no meaning or effect on outermost 'svg' elements
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
    return uusvg("svg", arguments, ["x", "y", "width", "height"]);
}

// uu.svg.g - <svg:g>
function uusvgg(tx,   // @param Number: translate x
                ty) { // @param Number(= 0): translate y
                      // @return SVGNode: <svg:g>
    return uusvg("g", arguments, ["tx", "ty"], function(node, sp) {
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
    return uusvg("rect", arguments,
                     ["x", "y", "width", "height", "rx", "ry"], uu.attr);
}

// uu.svg.text - <svg:text>
function uusvgtext(text, // @param String:
                   x,    // @param Number:
                   y) {  // @param Number:
                         // @return SVGNode: <svg:text>
    var rv = uusvg("text", arguments, ["text", "x", "y"], function(node, sp) {
        node.textContent = sp.text;
        node[_setAttribute]("x", sp.x || 0);
        node[_setAttribute]("y", sp.y || 0);
    });
    rv[_setAttribute]("dx", 0);
    rv[_setAttribute]("dy", 0);
    return rv;
}

// uu.svg.circle - <svg:circle>
function uusvgcircle(cx,  // @param Number:
                     cy,  // @param Number:
                     r) { // @param Number: radius
                          // @return SVGNode: <svg:circle>
    return uusvg("circle", arguments, ["cx", "cy", "r"], uu.attr);
}

// uu.svg.transform - parse transform
function uusvgtransform(node) { // @param SVGNode:
                                // @return Hash:

    //  [1][get transform]  uu.svg.transform(node) -> { scale: 2, tx: 100, ty: 100, rotate: 45 }

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

// --- initialize ---
uu.ready("window", function() {
    uu.ready.svg = true;
    uu.ready.fire("svg", uu.svg);
});

})(uu);

//}@svg
