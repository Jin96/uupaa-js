
// === <canvas> ===
// depend: uu.js
//
uu.agein || (function(win, doc, uu) {

//{{{!mb

var _flashCanvas = (uu.ie && uu.ver.flash > 9) ?
                   _swfLoader(uu.config.dir + "uu.canvas.swf") : 0;

//}}}!mb

uu.canvas.init   = uucanvasinit;    // uu.canvas.init()
uu.canvas.create = uucanvascreate;  // uu.canvas.create(width = 300, height = 150, order = "vml sl flash") -> <canvas>

//{{{!mb

uu.canvas.FL2D   = FL2D;            // uu.canvas.FL2D class
uu.canvas.SL2D   = SL2D;            // uu.canvas.SL2D class
uu.canvas.VML2D  = VML2D;           // uu.canvas.VML2D class

// class FL2D
function FL2D(node) { // @param Node: <canvas>
    FL2D.init(this, node);
}

// class SL2D
function SL2D(node) { // @param Node: <canvas>
    SL2D.init(this, node);
}

// class VML2D
function VML2D(node) { // @param Node: <canvas>
    VML2D.init(this, node);
}

//}}}!mb

// uu.canvas.init
function uucanvasinit() {
//{{{!mb
    uu.ie && uu.ary.each(uu.tag("canvas"), function(node) {
        if (!node.uuctx2d) { // already initialized (altcss and other)
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
                        order,         // @param String(= "sl flash vml"): backend order
                        placeHolder) { // @param Node(= <body>): placeholder Node
                                       // @return Node: new element
    var canvas = uue(uu.ie ? "CANVAS" : "canvas"); // [IE][!] need upper case

    canvas.width  = width  == null ? 300 : width;
    canvas.height = height == null ? 150 : height;

    placeHolder || (placeHolder = doc.body.appendChild(uue())); // <body><div /></body>
                                                                //       ~~~~~~~
    placeHolder.parentNode.replaceChild(canvas, placeHolder);
    return uu.ie ? _build(canvas, order || "sl flash vml") : canvas;
}

//{{{!mb inner - build canvas <canvas class="flash sl vml">
function _build(node,    // @param Node: <canvas>
                order) { // @param SpaceJointString:
                         // @return Node:
    var ary = uu.split(order), i = -1, v;

    while ( (v = ary[++i]) ) {
        if (v === "sl" && uu.ver.sl) {
            return SL2D.build(node);
        } else if (v === "flash" && _flashCanvas) {
            return FL2D.build(node);
        } else if (v === "vml") {
            return VML2D.build(node);
        }
    }
    // backend detect order: Silverlight -> Flash -> VML
    return (uu.ver.sl ? SL2D : _flashCanvas ? FL2D : VML2D).build(node);
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

