
// === <canvas> ===
// depend: uu.js
//
uu.agein || (function(win, doc, uu) {

//{{{!mb

var _flashCanvas = (uu.ie && uu.ver.flash > 8) ?
                   _swfLoader(uu.config.baseDir + "uu.canvas.swf") : 0;

//}}}!mb

uu.canvas.init   = uucanvasinit;    // uu.canvas.init()
uu.canvas.create = uucanvascreate;  // uu.canvas.create(width = 300, height = 150, order = "vml silver flash") -> <canvas>

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
            _build(newNode, newNode.className);
        }
    });
//}}}!mb
    uu.ready.gone.win = uu.ready.gone.canvas = 1;
}

// uu.canvas.create - create canvas element
function uucanvascreate(width,         // @param Number(= 300):
                        height,        // @param Number(= 150):
                        order,         // @param String(= "silver flash vml"): backend order
                        placeHolder) { // @param Node(= <body>): placeholder Node
                                       // @return Node: new element
    var canvas = uue(uu.ie ? "CANVAS" : "canvas"); // [IE][!] need upper case

    canvas.width  = width  == null ? 300 : width;
    canvas.height = height == null ? 150 : height;

    placeHolder || (placeHolder = doc.body.appendChild(uue())); // <body><div /></body>
                                                                //       ~~~~~~~
    placeHolder.parentNode.replaceChild(canvas, placeHolder);
    return uu.ie ? _build(canvas, order || "silver flash vml") : canvas;
}

//{{{!mb inner - build canvas <canvas class="flash silver vml">
function _build(node,    // @param Node: <canvas>
                order) { // @param SpaceJointString:
                         // @return Node:
    var ary = uu.split(order), i = -1, v;

    while ( (v = ary[++i]) ) {
        if ((v === "silver" || v === "sl") && uu.ver.silverlight) {
            return Silverlight.build(node);
        } else if ((v === "flash" || v === "fl") && _flashCanvas) {
            return Flash.build(node);
        } else if (v === "vml") {
            return VML.build(node);
        }
    }
    // backend detect order: Silverlight -> Flash -> VML
    return (uu.ver.silverlight ? Silverlight
                               : _flashCanvas ? Flash : VML).build(node);
}

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

