
// === elementFromPoint ===
//{{{!depend uu, uu.class
//}}}!depend

uu.Class.ElementFromPoint || (function(win, doc, uu) {

// client coordinates - http://www.quirksmode.org/dom/w3c_cssom.html
//      true:  Safari3x, Safari4, Opera9.x, Opera10.10
//      false: IE, Gecko, Chrome4, Opera10.50
var _clientCoordinates = uu.ver.safari || (uu.ver.opera && !uu.ver.jit);

// uu.Class.ElementFromPoint
uu.Class("ElementFromPoint", {
    init:         init,       // init(callback:Function)
    handleEvent:  handleEvent // handleEvent(evt:EventObjectEx)
});

// uu.Class.ElementFromPoint.init
function init(callback) { // @param Function: callback
    this._callback = callback;

    uu.event(doc, "mousemove+", this);
}

// uu.Class.ElementFromPoint.handleEvent
function handleEvent(evt) { // @param EventObjectEx:
    var node, px, py;

    if (uu.ie) {
        px = evt.clientX;
        py = evt.clientY;
    } else if (_clientCoordinates) {
        px = evt.clientX + win.pageXOffset;
        py = evt.clientY + win.pageYOffset;
    } else {
        px = evt.pageX - win.pageXOffset;
        py = evt.pageY - win.pageYOffset;
    }
    node = doc.elementFromPoint(px, py);

    // Opera9.x has text-node
    if (node.nodeType === 3) {
        node = node.parentNode;
    }
    if (node) {
        this._callback(evt, node);
    }
}

})(window, document, uu);

