
// === <canvas> ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js,
//         uu.mtx2d.js, uu.font.js
uu.agein || (function(win, doc, uu) {
var _slhosts = 0, // Silverlight host count
    _flready = 0,
    _CanvasRenderingContext2D = {
      save:             save,
      restore:          restore,
      scale:            scale,
      rotate:           rotate,
      translate:        translate,
      transform:        transform,
      setTransform:     setTransform,
      beginPath:        beginPath,
      arcTo:            uunop,
      stroke:           stroke,
      isPointInPath:    uunop,
      strokeText:       strokeText,
      measureText:      measureText,
      createImageData:  uunop,
      getImageData:     uunop,
      putImageData:     uunop,
      // extend uu.canvas
      guard:            guard,       // IE only
      unguard:          unguard,     // IE only
      initSurface:      initSurface  // IE only
    };

//{mb
uu.mix(SL2D.prototype,  _CanvasRenderingContext2D);
uu.mix(VML2D.prototype, _CanvasRenderingContext2D);
//}mb

uu.mix(uu.canvas, {
  init:             uucanvasinit,   // uu.canvas.init()
  create:           uucanvascreate, // uu.canvas.create() -> <canvas>
//{mb
  SL2D:             SL2D,
  VML2D:            VML2D
//}mb
});

uu.mix(win, {
  CanvasGradient:   CanvasGradient,
  CanvasPattern:    CanvasPattern
}, 0, 0);

CanvasGradient.prototype.addColorStop = addColorStop;

// uu.canvas.init
function uucanvasinit() {
//{mb
  uu.ie && uu.ary.each(uu.tag("canvas"), function(v) {
    _orderedinit(v, v.className);
  });
//}mb
  uu.ready.gone.win = uu.ready.gone.canvas = 1;
}

// uu.canvas.create - create canvas element
function uucanvascreate(types) { // @param String(= "vml sl fl"):
                                 // @return Node: new element
  var elm = doc.createElement("CANVAS"); // [IE][!] need upper case

  return uu.ie ? _orderedinit(elm, types) : elm;
}

//{mb [IE] fix mem leak
uu.ie && win.attachEvent("onunload", _unload);

function _unload() {
  win.CanvasGradient = null;
  win.CanvasPattern = null;
  win.detachEvent("onunload", _unload);
}

// inner -
function _orderedinit(node,    // @param Node:
                      types) { // @param String: "vml sl fl" -> "fl"
                               // @return Node:
  var backend = 0, sl = !!uu.ver.sl, fl = uu.ver.fl > 9 && _flready;

  (" " + types + " ").replace(/ (?:vml|sl|fl) /g, function(m) {
    m === " vml "      && (backend = 1);
    m === " sl " && sl && (backend = 2);
    m === " fl " && fl && (backend = 3);
    return "";
  });

  switch (backend || (fl ? 3 : sl ? 2 : 1)) {
  case 1: return initVML(node);
  case 2: return initSL(node);
  }
  return initFL(node);
}

// inner - copy properties
function _copyprop(to, from) {
  to.globalAlpha    = from.globalAlpha;
  to.globalCompositeOperation = from.globalCompositeOperation;
  to.strokeStyle    = from.strokeStyle;
  to.fillStyle      = from.fillStyle;
  to.lineWidth      = from.lineWidth;
  to.lineCap        = from.lineCap;
  to.lineJoin       = from.lineJoin;
  to.miterLimit     = from.miterLimit;
  to.shadowOffsetX  = from.shadowOffsetX;
  to.shadowOffsetY  = from.shadowOffsetY;
  to.shadowBlur     = from.shadowBlur;
  to.shadowColor    = from.shadowColor;
  to.font           = from.font;
  to.textAlign      = from.textAlign;
  to.textBaseline   = from.textBaseline;
  to._lineScale     = from._lineScale;
  to._scaleX        = from._scaleX;
  to._scaleY        = from._scaleY;
  to._efx           = from._efx;
  to._clipPath      = from._clipPath;
  to._mtx           = from._mtx.concat();
}

// CanvasRenderingContext2D.prototype.save
function save() {
  var prop = { _mtx: [] };

  _copyprop(prop, this);
  prop._clipPath = this._clipPath ? String(this._clipPath)
                                  : null;
  this._stack.push(prop);
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
  this._stack.length && _copyprop(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
  this._efx = 1;
  this._mtx = uu.m2d.scale(x, y, this._mtx);
  this._scaleX *= x;
  this._scaleY *= y;
  this._lineScale = (this._mtx[0] + this._mtx[4]) / 2;
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
  this._efx = 1;
  this._mtx = uu.m2d.rotate(angle, this._mtx);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
  this._efx = 1;
  this._mtx = uu.m2d.translate(x, y, this._mtx);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
  this._efx = 1;
  this._mtx = uu.m2d.transform(m11, m12, m21, m22, dx, dy, this._mtx);
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
  if (m11 === 1 && !m12 &&
      m22 === 1 && !m21 && !dx && !dy) {
    this._efx = 0; // reset _efx flag
  }
  this._mtx = [m11, m12, 0,  m21, m22, 0,  dx, dy, 1];
}

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
  this._path = [];
}

// CanvasRenderingContext2D.prototype.stroke
function stroke() {
  this.fill(1);
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth) {
  this.fillText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.measureText
function measureText(text) {
  var metric = uu.font.metric(text, this.font);

  return { width: metric.w, height: metric.h };
}

// CanvasRenderingContext2D.prototype.guard - onPropertyChange guard (IE only)
function guard(fn) { // @param Function(= void 0): callback function
  this._guardState = this._readyState; // keep
  this._readyState = 0; // modify
  if (fn) {
    fn();
    this._readyState = this._guardState; // restore
    this._guardState = null;
  }
}

// CanvasRenderingContext2D.prototype.unguard
function unguard() {
  if (this._guardState != null) { // null or undefined
    this._readyState = this._guardState;
    this._guardState = null;
  }
}

// CanvasRenderingContext2D.prototype.initSurface
function initSurface(resize) { // @param Number(= 0): 1 is resize
  // --- compositing ---
  this.globalAlpha    = 1.0;
  this.globalCompositeOperation = "source-over";
  // --- colors and styles ---
  this.strokeStyle    = "black"; // black
  this.fillStyle      = "black"; // black
  // --- line caps/joins ---
  this.lineWidth      = 1;
  this.lineCap        = "butt";
  this.lineJoin       = "miter";
  this.miterLimit     = 10;
  // --- shadows ---
  this.shadowOffsetX  = 0;
  this.shadowOffsetY  = 0;
  this.shadowBlur     = 0;
  this.shadowColor    = "transparent"; // transparent black
  // --- text ---
  this.font           = "10px sans-serif";
  this.textAlign      = "start";
  this.textBaseline   = "alphabetic";
  // --- extend properties ---
  this.xMissColor     = "#000000"; // black
  this.xTextMarginTop = 1.3; // for VML
  this.xClipStyle     = 0; // for VML
  this.xImageRender   = 0; // 0: normal, 1: vml:image
  this.xFlyweight     = 0; // for Silverlight, VML
  this.xShadowOpacityFrom  = 0.01; // for Silverlight, VML
  this.xShadowOpacityDelta = 0.05; // for Silverlight, VML
  // --- hidden properties ---
  this._shadow        = ["black", 0, 0, 0];
  this._readyStock    = [];
  this._lineScale     = 1;
  this._scaleX        = 1;
  this._scaleY        = 1;
  this._zindex        = -1;
  this._efx           = 0; // 1: matrix effected
  this._mtx           = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
  this._history       = []; // canvas rendering history
  this._stack         = []; // matrix and prop stack.
  this._path          = []; // current path
  this._clipPath      = null; // clipping path
  this._clipRect      = null; // clipping rect
  this._lockStock     = []; // lock stock
  this._lockState     = 0;  // lock state, 0: unlock, 1: lock, 2: lock + clear

  if (this.canvas.uuCanvasType == "VML2D") {
    this._px          = 0; // current position x
    this._py          = 0; // current position y
    if (resize) { // resize <div> node
      this._node.style.pixelWidth  = this.canvas.width;
      this._node.style.pixelHeight = this.canvas.height;
    }
  }
}

// inner - onPropertyChange handler
function onPropertyChange(evt) {
  var canvasNode, name = evt.propertyName, ctx;

  if (name === "width" || name === "height") {
    canvasNode = evt.srcElement;
    canvasNode.style[name] = Math.max(parseInt(canvasNode[name]), 0) + "px";

    if (canvasNode.uuctx2d._readyState) {
      ctx = canvasNode.uuctx2d;
      ctx.initSurface(1); // 1: resize
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
}

// window.CanvasPattern
function CanvasPattern(image,    // @param HTMLImageElement/HTMLCanvasElement:
                       repeat) { // @param String(= "repeat"): repetition
  repeat = repeat || "repeat";

  switch (repeat) {
  case "repeat": break;
  default: throw new Error("NOT_SUPPORTED_ERR");
  }

  if (!("src" in image)) { // HTMLCanvasElement unsupported
    throw new Error("NOT_SUPPORTED_ERR");
  }
  this._src = image.src; // HTMLImageElement
  this._dim = uu.img.actsize(image);
  this._type = 3; // 3:tile
  this._repeat = repeat;
}

// window.CanvasGradient
function CanvasGradient(type, param, vml) {
  this._vml = vml;
  this._type = type;
  this._param = param;
  this._colorStop = [];
}

// CanvasGradient.prototype.addColorStop
function addColorStop(offset, color) {
  var v, i = 0, iz;

  if (!this._vml) { // SL
    this._colorStop.push({ offset: offset, color: uu.color(color) });
  } else { // VML
    // collision of the offset is evaded
    for (iz = this._colorStop.length; i < iz; ++i) {
      v = this._colorStop[i];
      if (v.offset === offset) {
        if (offset < 1 && offset > 0) {
          offset += iz / 1000; // collision -> +0.001
        }
      }
    }
    this._colorStop.push({ offset: 1 - offset, color: uu.color(color) });
  }
  this._colorStop.sort(function(a, b) {
    return a.offset - b.offset;
  }); // sort offset
}

// inner - remove fallback contents
function removeFallback(node) { // @param Node:
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

// uu.canvas.SL2D - Silverlight 2D
function SL2D(node) { // @param Node:
  this.canvas = node;
  node.uuCanvasType = "SL2D";
  this.initSurface();
  this._node = node;
  this._view = null;
  this._content = null;
  this._readyState = 0; // 0: not ready, 1: complete(after xaml onLoad="")
}

// inner - initSL
function initSL(node) { // @param Node:
                        // @return Node: new node;
  if (node.uuCanvasType) { return node; } // already init

  var newnode = removeFallback(node),
      attr = node.attributes, aw = attr.width, ah = attr.height,
      onload = "uuonslload" + (++_slhosts); // window.uuonslload{n}

  newnode.width  = newnode.style.pixelWidth  =
      (aw && aw.specified) ? aw.nodeValue : 300;
  newnode.height = newnode.style.pixelHeight =
      (ah && ah.specified) ? ah.nodeValue : 150;

  // CanvasRenderingContext.getContext
  newnode.getContext = function() {
    return newnode.uuctx2d;
  };
  newnode.uuctx2d = new SL2D(newnode);

  win[onload] = function(sender) { // @param Node: sender is <Canvas> node
    var ctx = newnode.uuctx2d;

    ctx._view = sender.children;
    ctx._content = sender.getHost().content; // getHost() -> <object>
    // dump
    if (ctx._readyStock.length) {
      ctx._view.add(ctx._content.createFromXaml(
          "<Canvas>" + ctx._readyStock.join("") + "</Canvas>"));
    }
    ctx._readyState = 1; // draw ready
    ctx._readyStock = []
    win[onload] = null; // gc
  };
  newnode.innerHTML = [
    '<object type="application/x-silverlight-2" width="100%" height="100%">',
      '<param name="background" value="#00000000" />',  // transparent
      '<param name="windowless" value="true" />',
      '<param name="source" value="#xaml" />',          // XAML ID
      '<param name="onLoad" value="', onload, '" />',   // bond to global
    '</object>'].join("");
  newnode.attachEvent("onpropertychange", onPropertyChange);
  win.attachEvent("onunload", function() {
    newnode.uuctx2d = null;
    newnode.getContext = null;
    newnode.detachEvent("onpropertychange", onPropertyChange);
    win.detachEvent("onunload", arguments.callee);
  })
  return newnode;
}

// uu.canvas.VML2D - VML 2D
function VML2D(node) { // @param Node:
  this.canvas = node;
  node.uuCanvasType = "VML2D";
  this.initSurface();
  var div = node.appendChild(uue()), ds = div.style;

  div.uuCanvasDirection = node.currentStyle.direction;
  ds.pixelWidth  = node.width;
  ds.pixelHeight = node.height;
  ds.overflow    = "hidden";
  ds.position    = "absolute";
  ds.direction   = "ltr";
  this._clipRect = VML2D._rect(this, 0, 0, node.width, node.height);
  this._node = div;
  this._readyState = 1; // 0: not ready, 1: complete
}

// inner - initVML
function initVML(node) { // @param Node:
                         // @return Node: new node;
  if (node.uuCanvasType) { return node; } // already init

  var newnode = removeFallback(node),
      attr = node.attributes, aw = attr.width, ah = attr.height;

  newnode.style.pixelWidth  = (aw && aw.specified) ? aw.nodeValue : 300;
  newnode.style.pixelHeight = (ah && ah.specified) ? ah.nodeValue : 150;

  // CanvasRenderingContext.getContext
  newnode.getContext = function() {
    return newnode.uuctx2d;
  };
  newnode.uuctx2d = new VML2D(newnode);
  newnode.attachEvent("onpropertychange", onPropertyChange);
  win.attachEvent("onunload", function() {
    newnode.uuctx2d = null;
    newnode.getContext = null;
    newnode.detachEvent("onpropertychange", onPropertyChange);
    win.detachEvent("onunload", arguments.callee);
  })
  return newnode;
}
//}mb

// uu.canvas.FL2D - Flash 2D
function FL2D(node) { // @param Node:
  this.canvas = node;
  node.uuCanvasType = "FL2D";
  this.initSurface();
  this._node = node;
  this._view = null;
  this._content = null;
  this._readyState = 0; // 0: not ready, 1: complete(after xaml onLoad="")
}

// inner - initFL
function initFL(node) { // @param Node:
                        // @return Node: new node;
  if (node.uuCanvasType) { return node; } // already init
  // TODO: IMPL
  return node;
}

// --- initialize ---
uu.lazy("canvas", function() {
  uu.canvas.init();
  win.xcanvas && win.xcanvas(uu, uu.tag("canvas"));
});

//{mb add inline XAML source
uu.ie && uu.lazy("init", function() {
  if (uu.ver.sl && !uu.id("xaml")) {
    doc.write('<script type="text/xaml" id="xaml"><Canvas' +
              ' xmlns="http://schemas.microsoft.com/client/2007"></Canvas>' +
              '</script>');
  }
}, 2); // 2: high order

// functional collision with uu.css3(altcss) is evaded
uu.ie && uu.lazy("init", function() {
  var ss = doc.createStyleSheet(), ns = doc.namespaces;

  if (!ns["v"]) {
    ns.add("v", "urn:schemas-microsoft-com:vml",           "#default#VML");
    ns.add("o", "urn:schemas-microsoft-com:office:office", "#default#VML");
  }
  ss.owningElement.id = "uucss3ignore";
  ss.cssText =
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
    "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
    "{behavior:url(#default#VML);display:inline-block}"; // [!] inline-block
}, 0); // 0, low order
//}mb

})(window, document, uu);

