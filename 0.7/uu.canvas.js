
// === <canvas> ===
// depend: uu
//
uu.agein || (function(win, doc, uu) {

//{{{!mb

var _flashCanvas = (uu.ie && uu.ver.flash > 8) ?
                   _swfLoader(uu.config.baseDir + "uu.canvas.swf") : 0;

//}}}!mb

// uu.canvas
if (!uu.canvas) {
    uu.canvas = function html4NodeBuilder() { // @param Mix: var_args
        return uu.node.build("canvas", arguments);
    }
}

uu.canvas.init   = uucanvasinit;     // uu.canvas.init()
uu.canvas.create = uucanvascreate;   // uu.canvas.create(width = 300, height = 150, order = "svg sl fl vml") -> <canvas>
uu.canvas.bgcolor = uucanvasbgcolor; // uu.canvas.bgcolor(node) -> ColorHash

//{{{!mb

uu.canvas.Silverlight = Silverlight; // uu.canvas.Silverlight class
uu.canvas.Flash       = Flash;       // uu.canvas.Flash class
uu.canvas.VML         = VML;         // uu.canvas.VML class

// class Silverlight
function Silverlight(node) { // @param Node: <canvas>
    Silverlight.init(this, node);
}

// class Flash
function Flash(node) { // @param Node: <canvas>
    Flash.init(this, node);
}

// class VML
function VML(node) { // @param Node: <canvas>
    VML.init(this, node);
}

//}}}!mb

// uu.canvas.init
function uucanvasinit() {
//{{{!mb
    uu.ie && uu.ary.each(uu.tag("canvas"), function(node) {
        if (!node.getContext) { // already initialized (altcss and other)
            // remove fallback contents
            //      <canvas>fallback contents...</canvas> -> <canvas></canvas>
            var newNode = _removeFallback(node);

            newNode.width  = parseInt(node.width  || "300"); // 300px -> 300
            newNode.height = parseInt(node.height || "150");
            newNode.style.pixelWidth  = parseInt(newNode.width);
            newNode.style.pixelHeight = parseInt(newNode.height);
            _buildCanvas(newNode, newNode.className);
        }
    });
//}}}!mb
    uu.ready.gone.win = uu.ready.gone.canvas = 1;
}

// uu.canvas.create - create canvas element
function uucanvascreate(width,         // @param Number(= 300):
                        height,        // @param Number(= 150):
                        order,         // @param String(= "svg sl fl vml"): backend order
                        placeHolder) { // @param Node(= <body>): placeholder Node
                                       // @return Node: new element
    var canvas = uue(uu.ie ? "CANVAS" : "canvas"); // [IE][!] need upper case

    canvas.width  = width  == null ? 300 : width;
    canvas.height = height == null ? 150 : height;

    placeHolder || (placeHolder = doc.body.appendChild(uue())); // <body><div /></body>
                                                                //       ~~~~~~~
    placeHolder.parentNode.replaceChild(canvas, placeHolder);
    return uu.ie ? _buildCanvas(canvas, order || "svg sl fl vml") : canvas;
}

// uu.canvas.bgcolor - get canvas background-color
function uucanvasbgcolor(node) { // @param Node:
                                 // @return ColorHash:
    var n = node, color = "transparent",
        ZERO = uucanvasbgcolor._ZERO;

    while (n && n !== doc && ZERO[color]) {
        if (uu.ie && !n.currentStyle) {
            break;
        }
        color = uu.style.quick(n).backgroundColor;
        n = n.parentNode;
    }
    return uu.color(ZERO[color] ? "white" : color);
}
uucanvasbgcolor._ZERO = { transparent: 1, "rgba(0, 0, 0, 0)": 1 };

//{{{!mb inner - build canvas <canvas class="flash silver vml">
function _buildCanvas(node,    // @param Node: <canvas>
                      order) { // @param SpaceJointString:
                               // @return Node:
    var ary = uu.split(order.toLowerCase()), i = -1, v;

    while ( (v = ary[++i]) ) {
        switch (_buildCanvas._BACKEND[v]) {
        case 1: break;
        case 2: if (uu.ver.silverlight) {
                    return Silverlight.build(node);
                }
                break;
        case 3: if (_flashCanvas) {
                    return Flash.build(node);
                }
                break;
        case 4: return VML.build(node);
        }
    }
    // backend detect order: Silverlight -> Flash -> VML
    return (uu.ver.silverlight ? Silverlight
                               : _flashCanvas ? Flash : VML).build(node);
}
_buildCanvas._BACKEND = { svg: 1, sl: 2, silver: 2, silverlight: 2,
                          fl: 3, flash: 3, vml: 4 };

// inner - remove fallback contents
function _removeFallback(node) { // @param Node:
                                 // @return Node: new node
    if (!node.parentNode) {
        return node;
    }
    var rv = doc.createElement(node.outerHTML),
        endTags = doc.getElementsByTagName("/CANVAS"),
        parent = node.parentNode,
        idx = node.sourceIndex, x, v, w, i = -1;

    while ( (x = endTags[++i]) ) {
        if (idx < x.sourceIndex && parent === x.parentNode) {
            v = doc.all[x.sourceIndex];
            do {
                w = v.previousSibling; // keep previous
                v.parentNode.removeChild(v);
                v = w;
            } while (v !== node);
            break;
        }
    }
    parent.replaceChild(rv, node);
    return rv;
}

// inner - swf preloader
function _swfLoader(url) { // @param String: url
                           // @return Number: 1 or 0
    try {
        var xhr = win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
                  win.XMLHttpRequest ? new XMLHttpRequest() : 0;

        xhr.open("GET", url, false); // sync
        xhr.send(null);
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            return 1;
        }
    } catch (err) {}
    return 0;
}
//}}}!mb

// --- initialize ---
uu.lazy("canvas", function() {
    uu.canvas.init();
    win.xcanvas && win.xcanvas(uu, uu.tag("canvas"));
});

})(window, document, uu);

