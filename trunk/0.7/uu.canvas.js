
// === <canvas> ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js
uu.waste || (function(win, doc, uu, _innerText, _math) {
var _slhosts      = 0,  // Silverlight host count
    _fontUniqueID = 0,  // font cache unique id
    _fontCache    = {}, // { uid: { font: fontString } }
    _unitCache    = {}, // { uid: { pt, em } }
    _colorCache   = {}, // { color: ["#ffffff", alpha] }
    _metricNode,        // [lazy] Measure Text Metric Node
    _safari3x     = uu.webkit && uu.ver.re < 530, // Safari3.x
    // property alias
    _GLOBAL_ALPHA = "globalAlpha",
    _GLOBAL_COMPO = "globalCompositeOperation",
    _STROKE_STYLE = "strokeStyle",
    _FILL_STYLE   = "fillStyle",
    _SHADOW_OX    = "shadowOffsetX",
    _SHADOW_OY    = "shadowOffsetY",
    _SHADOW_BLUR  = "shadowBlur",
    _SHADOW_COLOR = "shadowColor",
    _BASE_STYLE   = "position:absolute;border:0 none;margin:0;padding:0;",
    _METRIC_STYLE = _BASE_STYLE + "top:-10000px;left:-10000px;" +
                                  "text-align:left;visibility:hidden",
    _MEASURE_STYLE= _BASE_STYLE + "width:12pt;height:12em",

    // property sets
    _FONT_SIZES   = { "xx-small": 0.512, "x-small": 0.64, smaller: 0.8,
                      small: 0.8, medium: 1, large: 1.2, larger: 1.2,
                      "x-large": 1.44, "xx-large": 1.728 },
    _FONT_SCALES  = { ARIAL: 1.55, "ARIAL BLACK": 1.07,
                      "COMIC SANS MS": 1.15, "COURIER NEW": 1.6,
                      GEORGIA: 1.6, "LUCIDA GRANDE": 1,
                      "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
                      "TREBUCHET MS": 1.55, VERDANA: 1.4, "MS UI GOTHIC": 2,
                      "MS PGOTHIC": 2, MEIRYO: 1,
                      "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1,
                      FANTASY: 1, CURSIVE: 1 },
    _QUOTE        = /[\"\']/g,
    _COMMA        = /\s*,\s*/g,
    _METHOD = {
        save:             save,
        restore:          restore,
        scale:            scale,
        rotate:           rotate,
        translate:        translate,
        transform:        transform,
        setTransform:     setTransform,
        beginPath:        beginPath,
        arcTo:            uuvain,
        stroke:           stroke,
        isPointInPath:    uuvain,
        strokeText:       strokeText,
        measureText:      measureText,
        createImageData:  uuvain,
        getImageData:     uuvain,
        putImageData:     uuvain,
        // extend uu.canvas
        guard:            guard,      // IE only
        unguard:          unguard,    // IE only
        initSurface:      initSurface // IE only
    };

uu.mix(SL2D.prototype, _METHOD);
uu.mix(VML2D.prototype, _METHOD);

uu.mix(uu.canvas, {
  init:     uucanvasinit,       // uu.canvas.init()
  expire:   uucanvasexpire,     // uu.canvas.expire()
  SL2D:     SL2D,
  VML2D:    VML2D,
  impl: {
    bgcolor:            uucanvasimplbgcolor,
    parseFont:          uucanvasimplparsefont,
    parseColor:         uucanvasimplparsecolor,
    colorCache:         _colorCache,
    drawImageArgs:      uucanvasimpldrawimageargs,
    getTextMetric:      uucanvasimplgettextmetric,
    FONT_SCALES:        _FONT_SCALES,
    mtx2d: {
      scale:            uucanvasimplmatrix2dscale,
      rotate:           uucanvasimplmatrix2drotate,
      multiply:         uucanvasimplmatrix2dmultiply,
      transform:        uucanvasimplmatrix2dtransform,
      translate:        uucanvasimplmatrix2dtranslate
    }
  }
});

uu.mix(win, {
  CanvasRenderingContext2D: uuvain,
  CanvasGradient:       CanvasGradient,
  CanvasPattern:        CanvasPattern,
  TextMetrics:          TextMetrics
}, 0, 0);

CanvasGradient.prototype.addColorStop = addColorStop;

// hook document.createElement
if ((uu.ie || _safari3x) && !doc.uucreateelement) {
  doc.uucreateelement = doc.createElement; // keep original method
  doc.createElement = _createelement;
}

// inner - create element
function _createelement(tag,      // @param String: tag name
                        vml,      // @param Boolean(= false): true is vml canvas
                        dummy1,   // @param Mix: dummy arg
                        dummy2) { // @param Mix: dummy arg
                                 // @return Node: new element
  if (tag === "canvas") {
    var elm = doc.uucreateelement("CANVAS"); // [!] upper case

    if (uu.ie) {
      return (vml || !uu.ver.sl) ? initVML(elm) : initSL(elm);
    } else if (_safari3x) {
      return _initOldWebKitCanvas(elm);
    }
  }
  return doc.uucreateelement(tag, vml, dummy1, dummy2);
}

// uu.canvas.init
function uucanvasinit() {
  if (uu.ie) {
    uu.ary.each(uu.tag("canvas"), function(v) {
      (uu.klass.has(v, "vml") || !uu.ver.sl) ? initVML(v) : initSL(v);
    });
  } else if (_safari3x) {
    uu.ary.each(uu.tag("canvas"), _initOldWebKitCanvas);
  }
  uu.ready.gone.win = uu.ready.gone.canvas = 1;
}

// uu.canvas.expire - expire cache
function uucanvasexpire() {
  _fontCache  = {};
  _unitCache  = {};
  _colorCache = {};
}

// uu.canvas.impl.parseColor
function uucanvasimplparsecolor(c) { // @param ColorString:
  return _colorCache[c] = uu.color(c); // add cache
}

// uu.canvas.impl.matrix2DMultiply - 2D Matrix multiply
function uucanvasimplmatrix2dmultiply(a, b) {
  return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],  // m11
          a[0] * b[1] + a[1] * b[4] + a[2] * b[7],  // m12
          0,                                        // m13
          a[3] * b[0] + a[4] * b[3] + a[5] * b[6],  // m21
          a[3] * b[1] + a[4] * b[4] + a[5] * b[7],  // m22
          0,                                        // m23
          a[6] * b[0] + a[7] * b[3] + a[8] * b[6],  // m31(dx)
          a[6] * b[1] + a[7] * b[4] + a[8] * b[7],  // m32(dy)
          a[6] * b[2] + a[7] * b[5] + a[8] * b[8]]; // m33
}

// uu.canvas.impl.matrix2DTranslate - 2D Matrix translate
function uucanvasimplmatrix2dtranslate(x, y) {
  return [1, 0, 0,
          0, 1, 0,
          x, y, 1];
}

// uu.canvas.impl.matrix2DRotate - 2D Matrix rotate
function uucanvasimplmatrix2drotate(angle) {
  var c = _math.cos(angle),
      s = _math.sin(angle);

  return [ c, s, 0,
          -s, c, 0,
           0, 0, 1];
}

// uu.canvas.impl.matrix2DScale - 2D Matrix scale
function uucanvasimplmatrix2dscale(x, y) {
  return [x, 0, 0,
          0, y, 0,
          0, 0, 1];
}

// uu.canvas.impl.matrix2DTransform - 2D Matrix transform
function uucanvasimplmatrix2dtransform(m11, m12, m21, m22, dx, dy) {
  return [m11, m12, 0,
          m21, m22, 0,
          dx,  dy,  1];
}

// uu.canvas.impl.drawImageArgs - detect drawImage arguments
function uucanvasimpldrawimageargs(image) {
  var a = arguments, az = a.length,
      dim = uu.img.actsize(image);

  if (az < 9) {
    return {
      az: az, dim: dim,
      sx: 0, sy: 0, sw: dim.w, sh: dim.h,
      dx: a[1], dy: a[2], dw: a[3] || dim.w, dh: a[4] || dim.h
    };
  } else if (az === 9) {
    return {
      az: az, dim: dim,
      sx: a[1], sy: a[2], sw: a[3], sh: a[4],
      dx: a[5], dy: a[6], dw: a[7], dh: a[8]
    };
  }
  throw "";
}

// uu.canvas.impl.getTextMetric - measure text rect(width, height)
function uucanvasimplgettextmetric(text, font) {
  if (!_metricNode) {
    _metricNode = doc.createElement("div");
    _metricNode.style.cssText = _METRIC_STYLE;
    doc.body.appendChild(_metricNode);
  }
  _metricNode.style.font = font;
  _metricNode[_innerText] = text;

  return { w: _metricNode.offsetWidth,
           h: _metricNode.offsetHeight };
}

// uu.canvas.impl.bgcolor - get background-color from ancestor
// [uu.css.bgcolor.inherit] copy
function uucanvasimplbgcolor(node,   // @param Node:
                             type) { // @param Number(= 0): result type
                                     //            0 = return HexColorValidArray
                                     //            1 = return RGBAValidHash
                                     //            2 = return Number
                                     // @return HexColorValidArray(type=0)
                                     //         /RGBAValidHash(type=1)
                                     //         /Number(type=2):
  var n = node, color = "transparent",
      ZERO = { transparent: 1, "rgba(0, 0, 0, 0)": 1 };

  while (n && n !== doc && ZERO[color]) {
    if ((uu.ie && n.currentStyle) || !uu.ie) {
      color = (uu.ie ? n.currentStyle
                     : win.getComputedStyle(n, null)).backgroundColor;
    }
    n = n.parentNode;
  }
  return uu.color(ZERO[color] ? "white" : color, type || 0);
}

// uu.canvas.impl.parseFont - parse CSS::font style
function uucanvasimplparsefont(font, embase) {
  var rv = {}, w, sz, dummy, style, uid, key = "uuCanvasID";

  uid = embase[key] || (embase[key] = ++_fontUniqueID);

  if (uid in _fontCache) {
    if (font in _fontCache[uid]) {
      return _fontCache[uid][font];
    }
  } else {
    _fontCache[uid] = {};
  }

  // computed font style by CSS parser
  dummy = doc.createElement("div");
  style = dummy.style;
  try {
    style.font = font;
  } catch (err) {}

  sz = style.fontSize;

  w = _FONT_SIZES[sz];
  if (w) {
    w *= 16;
  } else {
    w = parseFloat(sz);
    if (sz.lastIndexOf("pt") > 0) { // "12.3pt"
      w *= 1.33; // 1.3333...
    } else if (sz.lastIndexOf("em") > 0) { // "10.5em"
      uid in _unitCache || (_unitCache[uid] = _measureUnit(embase));
      w *= _unitCache[uid].em;
    }
  }
  rv.size = parseFloat(w);
  rv.style = style.fontStyle;
  rv.weight = style.fontWeight;
  rv.variant = style.fontVariant;
  rv.rawfamily = style.fontFamily.replace(_QUOTE, "");
  rv.family = "'" + rv.rawfamily.replace(_COMMA, "','") + "'";
  rv.formal = [rv.style,
               rv.variant,
               rv.weight,
               rv.size.toFixed(2) + "px",
               rv.family].join(" ");
  return _fontCache[uid][font] = rv;
}

// inner - measure unit
function _measureUnit(elm) {
  var node = elm.appendChild(doc.createElement("div")), pt, em;

  node.style.cssText = _MEASURE_STYLE;
  pt = node.clientWidth  / 12;
  em = node.clientHeight / 12;
  elm.removeChild(node);
  return { pt: pt, em: em };
}

// inner - copy property
function _copyprop(to, from) {
  to[_GLOBAL_ALPHA] = from[_GLOBAL_ALPHA];
  to[_GLOBAL_COMPO] = from[_GLOBAL_COMPO];
  to[_STROKE_STYLE] = from[_STROKE_STYLE];
  to[_FILL_STYLE]   = from[_FILL_STYLE];
  to.lineWidth      = from.lineWidth;
  to.lineCap        = from.lineCap;
  to.lineJoin       = from.lineJoin;
  to.miterLimit     = from.miterLimit;
  to[_SHADOW_OX]    = from[_SHADOW_OX];
  to[_SHADOW_OY]    = from[_SHADOW_OY];
  to[_SHADOW_BLUR]  = from[_SHADOW_BLUR];
  to[_SHADOW_COLOR] = from[_SHADOW_COLOR];
  to.font           = from.font;
  to.textAlign      = from.textAlign;
  to.textBaseline   = from.textBaseline;
  to._lineScale     = from._lineScale;
  to._scaleX        = from._scaleX;
  to._scaleY        = from._scaleY;
  to._efx           = from._efx;
  to._clipPath      = from._clipPath;
  to._mtx[0]        = from._mtx[0];
  to._mtx[1]        = from._mtx[1];
  to._mtx[2]        = from._mtx[2];
  to._mtx[3]        = from._mtx[3];
  to._mtx[4]        = from._mtx[4];
  to._mtx[5]        = from._mtx[5];
  to._mtx[6]        = from._mtx[6];
  to._mtx[7]        = from._mtx[7];
  to._mtx[8]        = from._mtx[8];
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
  this._mtx = uucanvasimplmatrix2dmultiply([x, 0, 0,
                                            0, y, 0,
                                            0, 0, 1], this._mtx);
  this._scaleX *= x;
  this._scaleY *= y;
  this._lineScale = (this._mtx[0] + this._mtx[4]) / 2;
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
  var c = _math.cos(angle),
      s = _math.sin(angle);

  this._efx = 1;
  this._mtx = uucanvasimplmatrix2dmultiply([ c, s, 0,
                                            -s, c, 0,
                                             0, 0, 1], this._mtx);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
  this._efx = 1;
  this._mtx = uucanvasimplmatrix2dmultiply([1, 0, 0,
                                            0, 1, 0,
                                            x, y, 1], this._mtx);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
  this._efx = 1;
  this._mtx = uucanvasimplmatrix2dmultiply([m11, m12, 0,
                                            m21, m22, 0,
                                            dx,  dy,  1], this._mtx);
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
  if (m11 === 1 && !m12 &&
      m22 === 1 && !m21 && !dx && !dy) {
    this._efx = 0; // reset _efx flag
  }
  this._mtx = uucanvasimplmatrix2dtransform(m11, m12, m21, m22, dx, dy);
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
  var metric = uucanvasimplgettextmetric(text, this.font);

  return new TextMetrics(metric.w, metric.h);
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
  this[_GLOBAL_ALPHA] = 1.0;
  this[_GLOBAL_COMPO] = "source-over";
  // --- colors and styles ---
  this[_STROKE_STYLE] = "#000000"; // black
  this[_FILL_STYLE]   = "#000000"; // black
  // --- line caps/joins ---
  this.lineWidth      = 1;
  this.lineCap        = "butt";
  this.lineJoin       = "miter";
  this.miterLimit     = 10;
  // --- shadows ---
  this[_SHADOW_OX]    = 0;
  this[_SHADOW_OY]    = 0;
  this[_SHADOW_BLUR]  = 0;
  this[_SHADOW_COLOR] = "transparent"; // transparent black
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
  this._lockStock     = []; // lock stock
  this._lockState     = 0;  // lock state, 0: unlock, 1: lock, 2: lock + clear

  if (this.canvas.uuCanvasType === "VML2D") {
    this._shadow      = ["#000", 0, 0, 0];
    this._px          = 0; // current position x
    this._py          = 0; // current position y
    if (resize) { // resize <div> node
      this._node.style.pixelWidth  = this.canvas.width;
      this._node.style.pixelHeight = this.canvas.height;
    }
  } else {
    this._shadow      = ["#000", 0, 0, 0];
    this.xTiling      = 1; // 1 = TileBrush simulate(slow)
    this._clipRect    = null; // clipping rect
    this._readyStock  = [];
  }
}

// inner - onPropertyChange handler
function onPropertyChange(evt) {
  var tgt, name = evt.propertyName, ctx;

  if ({ width: 1, height: 1 }[name]) {
    tgt = evt.srcElement; // tgt = <canvas>
    tgt.style[name] = _math.max(parseInt(tgt[name]), 0) + "px";
    if (tgt._ctx2d._readyState) {
      ctx = tgt._ctx2d;
      ctx.initSurface(1); // 1: resize
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
}

// window.TextMetrics
function TextMetrics(w, h) { // for measureText
  this.width = w;
  this.height = h;
}

// window.CanvasPattern
function CanvasPattern(image, repetition) {
  repetition = repetition || "repeat";

  switch (repetition) {
  case "repeat": break;
  default: throw "";
  }

  if (!("src" in image)) { // HTMLCanvasElement unsupported
    throw "";
  }
  this._src = image.src; // HTMLImageElement
  this._dim = uu.img.actsize(image);
  this._type = 3; // 3:tile
  this._repeat = repetition;
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
  var c = _colorCache[color] || uucanvasimplparsecolor(color),
      v, i = 0, iz;

  if (!this._vml) { // SL
    this._colorStop.push({ offset: offset, color: c });
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
    this._colorStop.push({ offset: 1 - offset, color: c });
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
      idx = node.sourceIndex,
      v, w, i = 0, iz = endTags.length;

  for (; i < iz; ++i) {
    if (idx < endTags[i].sourceIndex &&
        node.parentNode === endTags[i].parentNode) {
      v = doc.all[endTags[i].sourceIndex];
      do {
        w = v.previousSibling; // keep previous
        v.parentNode.removeChild(v);
        v = w;
      } while (v !== node);
      break;
    }
  }
  node.parentNode.replaceChild(rv, node);
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

  newnode.getContext = function() {
    return newnode._ctx2d;
  };
  newnode._ctx2d = new SL2D(newnode);

  win[onload] = function(sender) { // @param Node: sender is <Canvas> node
    var ctx = newnode._ctx2d;

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
  return newnode;
}

// uu.canvas.VML2D - VML 2D
function VML2D(node) { // @param Node:
  this.canvas = node;
  node.uuCanvasType = "VML2D";
  this.initSurface();
  var div = node.appendChild(doc.createElement("div")), ds = div.style;

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

  newnode.getContext = function() {
    return newnode._ctx2d;
  };
  newnode._ctx2d = new VML2D(newnode);
  newnode.attachEvent("onpropertychange", onPropertyChange);
  return newnode;
}

// inner -
function _initOldWebKitCanvas(node) { // @param Node:
                                      // @return Node:
  if (!node._getContext) {
    node._getContext = node.getContext; // keep original method
    // wrapper
    node.getContext = function(type) {
      var ctx = node._getContext(type || "2d");
      // extend API
      if (!ctx._stack) {
        uu.canvas.impl.extendTextAPI(ctx); // fillText(), strokeText()
        uu.canvas.impl.extendLockAPI(ctx); // lock(), unlock()
      }
      return ctx;
    };
  }
  return node;
}

// --- initialize ---
uu.lazy("canvas", function() {
  uu.canvas.init();
  win.xcanvas && win.xcanvas(uu, uu.tag("canvas"));
});

// add inline XAML source
uu.ie && uu.lazy("init", function() {
  if (uu.ver.sl && !uu.id("xaml")) {
    doc.write('<script type="text/xaml" id="xaml"><Canvas' +
              ' xmlns="http://schemas.microsoft.com/client/2007"></Canvas>' +
              '</script>');
  }
}, 2); // 2: high order

// functional collision with uu.css3 is evaded
uu.ie && uu.lazy("init", function() {
  var v, i = 0, ary = uu.dmz.HTML5TAG.split(","), VML = "#default#VML",
      ss = doc.createStyleSheet(),
      ns = doc.namespaces, NS = "urn:schemas-microsoft-com:";

  while ( (v = ary[i++]) ) {
    doc.createElement(v);
  }
  if (!ns["v"]) {
    ns.add("v", NS + "vml", VML);
    ns.add("o", NS + "office:office", VML);
  }
  ss.owningElement.id = "uucss3ignore";
  ss.cssText = 
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
    "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
    "{behavior:url(" + VML + ");display:inline-block}"; // [!] inline-block
}, 0); // 0, low order

})(window, document, uu, uu.gecko ? "textContent" : "innerText", Math);

