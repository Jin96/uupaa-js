
// === uuMeta.canvas ===
// depend: uuMeta, uuMeta.color, uuMeta.style, uuMeta.image
/*
uuMeta.canvas.init(canvas, vml = false) - return new canvas element
uuMeta.canvas.ready(callback)
uuMeta.canvas.already() - return true is already
uuMeta.canvas.expire()
 */
(function uuMetaCanvasScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _doc = document,
    _math = Math,
    _metric, // Text Metric Element
    _canvasReady = 0,
    _slHostCount = 0, // Silverlight host count
    _fontUniqueID = 0, // font cache unique id
    _fontCache = {},  // { uid: { font: fontString } }
    _unitCache = {},  // { uid: { pt, em } }
    _colorCache = {}, // { color: ["#ffffff", alpha] }
    // property alias
    _GLOBAL_ALPHA   = "globalAlpha",
    _GLOBAL_COMPO   = "globalCompositeOperation",
    _STROKE_STYLE   = "strokeStyle",
    _FILL_STYLE     = "fillStyle",
    _SHADOW_OFFSET_X= "shadowOffsetX",
    _SHADOW_OFFSET_Y= "shadowOffsetY",
    _SHADOW_BLUR    = "shadowBlur",
    _SHADOW_COLOR   = "shadowColor",
    _BASE_STYLE     = "position:absolute;border:0 none;margin:0;padding:0;",
    _METRIC_STYLE   = _BASE_STYLE + "top:-10000px;left:-10000px;" +
                                    "text-align:left;visibility:hidden",
    _MEASURE_STYLE  = _BASE_STYLE + "width:12pt;height:12em",
    // property sets
    _HIT_PROPS      = { width: 1, height: 1 },
    _FONT_SIZES     = { "xx-small": 0.512, "x-small": 0.64, smaller: 0.8,
                        small: 0.8, medium: 1, large: 1.2, larger: 1.2,
                        "x-large": 1.44, "xx-large": 1.728 },
    _FONT_SCALES    = { ARIAL: 1.55, "ARIAL BLACK": 1.07,
                        "COMIC SANS MS": 1.15, "COURIER NEW": 1.6,
                        GEORGIA: 1.6, "LUCIDA GRANDE": 1,
                        "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
                        "TREBUCHET MS": 1.55, VERDANA: 1.4, "MS UI GOTHIC": 2,
                        "MS PGOTHIC": 2, MEIRYO: 1,
                        "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1,
                        FANTASY: 1, CURSIVE: 1 },
    _QUOTE          = /[\"\']/g,
    _COMMA          = /\s*,\s*/g,
    _ENTITY         = /&"/g,
    _TO_ENTITY      = { "&": "&amp;", '"': "&quot;" },
    _INNER_TEXT     = _mm.ua.gecko ? "textContent" : "innerText";

// window.CanvasRenderingContext2D
// CanvasRenderingContext2D.prototype.*
function notImpl() {
}

// uuMeta.canvas.init - initialize a canvas made dynamically
function initCanvas(canvas, // @param Node: canvas element
                    vml) {  // @param Boolean(= false): true = force VML
                            // @return Node: new canvas
  if (_ua.webkit && _ua.rever < 530) {
    return initOldWebKitCanvas(canvas);
  }
  if (canvas.getContext) {
    return canvas; // already initialized
  }
  return (vml || !_mm.feature.slver) ? initVML(canvas)
                                     : initSL(canvas);
}

// uuMeta.canvas.ready
function readyCanvas(callback) { // @param Function:
  function loop() {
    (_ua.ie ? alreadyCanvas()
            : _canvasReady) ? callback()
                            : setTimeout(loop, 64);
  }
  setTimeout(loop, 16);
}

// uuMeta.canvas.already
function alreadyCanvas() { // @return Boolean: true is already
  if (!_ua.ie) {
    return !!_canvasReady;
  }
  var node = _doc.getElementsByTagName("canvas"),
      i = node.length;

  while (i--) {
    if (!("uuCanvasType" in node[i])) {
      return false;
    }
  }
  return true;
}

// uuMeta.canvas.expire - expire cache
function expireCanvas() {
  _fontCache  = {};
  _unitCache  = {};
  _colorCache = {};
}

// uuMeta.canvas.impl.parseColor
function parseColor(c) { // @param ColorString:
  return _colorCache[c] = uuMeta.color.parse(c); // add cache
}

// uuMeta.canvas.impl.matrix2DMultiply - 2D Matrix multiply
function matrix2DMultiply(a, b) {
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

// uuMeta.canvas.impl.matrix2Dtranslate - 2D Matrix translate
function matrix2Dtranslate(x, y) {
  return [1, 0, 0,
          0, 1, 0,
          x, y, 1];
}

// uuMeta.canvas.impl.matrix2DRotate - 2D Matrix rotate
function matrix2DRotate(angle) {
  var c = _math.cos(angle),
      s = _math.sin(angle);

  return [ c, s, 0,
          -s, c, 0,
           0, 0, 1];
}

// uuMeta.canvas.impl.matrix2DScale - 2D Matrix scale
function matrix2DScale(x, y) {
  return [x, 0, 0,
          0, y, 0,
          0, 0, 1];
}

// uuMeta.canvas.impl.matrix2DTransform - 2D Matrix transform
function matrix2DTransform(m11, m12, m21, m22, dx, dy) {
  return [m11, m12, 0,
          m21, m22, 0,
          dx,  dy,  1];
}

// uuMeta.canvas.impl.detectDrawImageArg - detect drawImage arguments
function detectDrawImageArg(image) {
  var a = arguments, az = a.length,
      dim = _mm.image.getActualDimension(image);

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

// uuMeta.canvas.impl.toHTMLEntity
//      - convert to HTML chars(& ") to HTML entity(&amp; &quot;)
function toHTMLEntity(str) {
  function swap(m) {
    return _TO_ENTITY[m];
  }
  return str.replace(_ENTITY, swap);
}

// uuMeta.canvas.impl.getTextMetric - measure text rect(width, height)
function getTextMetric(text, font) {
  if (!_metric) {
    _metric = _doc.createElement("div");
    _metric.style.cssText = _METRIC_STYLE;
    _doc.body.appendChild(_metric);
  }
  _metric.style.font = font;
  _metric[_INNER_TEXT] = text;

  return uuMeta.style.getSize(_metric);
}

// uuMeta.canvas.impl.parseFont - parse CSS::font style
function parseFont(font, embase) {
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
  dummy = _doc.createElement("div");
  style = dummy.style;
  try {
    style.font = font;
  } catch (err) {}

  sz = style.fontSize;

  if ( (w = _FONT_SIZES[sz]) ) {
    w *= 16;
  } else {
    w = parseFloat(sz);
    if (sz.lastIndexOf("pt") > 0) { // "12.3pt"
      w *= 1.33; // 1.3333...
    } else if (sz.lastIndexOf("em") > 0) { // "10.5em"
/*
      if (!(uid in _unitCache)) {
        _unitCache[uid] = measureUnit(embase);
      }
 */
      uid in _unitCache || (_unitCache[uid] = measureUnit(embase));
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
function measureUnit(elm) {
  var node = elm.appendChild(_doc.createElement("div")), pt, em;

  node.style.cssText = _MEASURE_STYLE;
  pt = node.clientWidth  / 12;
  em = node.clientHeight / 12;
  elm.removeChild(node);
  return { pt: pt, em: em };
}

// inner - copy property
function copyProperty(to, from) {
  to[_GLOBAL_ALPHA]    = from[_GLOBAL_ALPHA];
  to[_GLOBAL_COMPO]    = from[_GLOBAL_COMPO];
  to[_STROKE_STYLE]    = from[_STROKE_STYLE];
  to[_FILL_STYLE]      = from[_FILL_STYLE];
  to.lineWidth         = from.lineWidth;
  to.lineCap           = from.lineCap;
  to.lineJoin          = from.lineJoin;
  to.miterLimit        = from.miterLimit;
  to[_SHADOW_OFFSET_X] = from[_SHADOW_OFFSET_X];
  to[_SHADOW_OFFSET_Y] = from[_SHADOW_OFFSET_Y];
  to[_SHADOW_BLUR]     = from[_SHADOW_BLUR];
  to[_SHADOW_COLOR]    = from[_SHADOW_COLOR];
  to.font              = from.font;
  to.textAlign         = from.textAlign;
  to.textBaseline      = from.textBaseline;
  to._lineScale        = from._lineScale;
  to._scaleX           = from._scaleX;
  to._scaleY           = from._scaleY;
  to._efx              = from._efx;
  to._clipPath         = from._clipPath;
  to._mtx[0]           = from._mtx[0];
  to._mtx[1]           = from._mtx[1];
  to._mtx[2]           = from._mtx[2];
  to._mtx[3]           = from._mtx[3];
  to._mtx[4]           = from._mtx[4];
  to._mtx[5]           = from._mtx[5];
  to._mtx[6]           = from._mtx[6];
  to._mtx[7]           = from._mtx[7];
  to._mtx[8]           = from._mtx[8];
}

// CanvasRenderingContext2D.prototype.save
function save() {
  var prop = { _mtx: [] };

  copyProperty(prop, this);
  prop._clipPath = this._clipPath ? String(this._clipPath)
                                  : null;
  this._stack.push(prop);
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
  this._stack.length && copyProperty(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
  this._efx = 1;
  this._mtx = matrix2DMultiply([x, 0, 0,
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
  this._mtx = matrix2DMultiply([ c, s, 0,
                                -s, c, 0,
                                 0, 0, 1], this._mtx);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
  this._efx = 1;
  this._mtx = matrix2DMultiply([1, 0, 0,
                                0, 1, 0,
                                x, y, 1], this._mtx);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
  this._efx = 1;
  this._mtx = matrix2DMultiply([m11, m12, 0,
                                m21, m22, 0,
                                dx,  dy,  1], this._mtx);
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
  if (m11 === 1 && !m12 &&
      m22 === 1 && !m21 && !dx && !dy) {
    this._efx = 0; // reset _efx flag
  }
  this._mtx = matrix2DTransform(m11, m12, m21, m22, dx, dy);
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
  var metric = getTextMetric(text, this.font);

  return new TextMetrics(metric.w, metric.h);
}

// inner - init surface
function initSurface(me, resize) {
  // --- compositing ---
  me[_GLOBAL_ALPHA] = 1.0;
  me[_GLOBAL_COMPO] = "source-over";
  // --- colors and styles ---
  me[_STROKE_STYLE] = "#000000"; // black
  me[_FILL_STYLE]   = "#000000"; // black
  // --- line caps/joins ---
  me.lineWidth   = 1;
  me.lineCap     = "butt";
  me.lineJoin    = "miter";
  me.miterLimit  = 10;
  // --- shadows ---
  me[_SHADOW_OFFSET_X] = 0;
  me[_SHADOW_OFFSET_Y] = 0;
  me[_SHADOW_BLUR]     = 0;
  me[_SHADOW_COLOR]    = "transparent"; // transparent black
  // --- text ---
  me.font        = "10px sans-serif";
  me.textAlign   = "start";
  me.textBaseline = "alphabetic";
  // --- extend properties ---
  me.xMissColor  = "#000000"; // black
  me.xTextMarginTop = 1.3; // for VML
  me.xClipStyle   = 0; // for VML
  me.xImageRender = 0; // 0: normal, 1: vml:image
  me.xFlyweight   = 0; // for Silverlight, VML
  me.xShadowOpacityFrom  = 0.01; // for Silverlight, VML
  me.xShadowOpacityDelta = 0.05; // for Silverlight, VML
  // --- hidden properties ---
  me._lineScale  = 1;
  me._scaleX     = 1;
  me._scaleY     = 1;
  me._zindex     = -1;
  me._efx        = 0; // 1: matrix effected

  me._mtx = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
  me._history = []; // canvas rendering history
  me._stack = []; // matrix and prop stack.
  me._path = []; // current path
  me._clipPath = null; // clipping path

  if (me.canvas.uuCanvasType === "VML2D") {
    me._shadow = ["#000", 0, 0, 0];
    me._px = 0; // current position x
    me._py = 0; // current position y
    if (resize) {
      me._elm.style.pixelWidth  = me.canvas.width;
      me._elm.style.pixelHeight = me.canvas.height;
    }
  } else {
    me._shadow = ["#000", 0, 0, 0];
    me.xTiling = 1; // 1 = TileBrush simulate(slow)
    me._clipRect = null; // clipping rect
  }
}

// inner - onPropertyChange handler
function onPropertyChange(evt) {
  var tgt, name = evt.propertyName, ctx;

  if (_HIT_PROPS[name]) {
    tgt = evt.srcElement; // tgt = canvas element
    tgt.style[name] =
        _math.max(parseInt(tgt.attributes[name].nodeValue), 0) + "px";

    if (tgt.uuCanvasType) {
      if (tgt.bind._ignore-- <= 0) {
        tgt.bind._ignore = 0;
//        tgt.getContext()._initSurface(1)._clear();
        ctx = tgt.getContext();
        initSurface(ctx, 1); // resize canvas element
        tgt.uuCanvasType === "SL2D" ? uuMeta.canvas.SL2D._clear(ctx)
                                    : uuMeta.canvas.VML2D._clear(ctx);
      }
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
  this._dim = _mm.image.getActualDimension(image);
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
  var c = _colorCache[color] || parseColor(color),
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
  var rv = _doc.createElement(node.outerHTML),
      endTags = _doc.getElementsByTagName("/CANVAS"),
      idx = node.sourceIndex,
      v, w, i = 0, iz = endTags.length;

  for (; i < iz; ++i) {
    if (idx < endTags[i].sourceIndex &&
        node.parentNode === endTags[i].parentNode) {
      v = _doc.all[endTags[i].sourceIndex];
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

// inner -
function initOldWebKitCanvas(node, type) {
  if (!node._getContext) {
    node._getContext = node.getContext; // keep original method
    // wrapper
    node.getContext = function(type) {
      var ctx = node._getContext(type || "2d");
      return ctx._stack ? ctx
                        : uuMeta.canvas.impl.textAPI(ctx);
    };
  }
  return node;
}

// uuMeta.canvas.setup
function setup() {
  var lc = /loaded|complete/, rs = "readyState", fn,
      fnready ="onreadystatechange";

  if (!_ua.ie) {
    if (_doc.getElementsByTagName("canvas").length) { // window.loaded state
      ++_canvasReady;
    } else if (_ua.opera) {
      addEventListener("load", function() {
        ++_canvasReady;
      }, false);
    } else if (_ua.webkit && _doc[rs]) {
      fn = function() {
        if (lc.test(_doc[rs])) {
          if (_ua.rever < 530) { // Safari3.x
            var nodes = _doc.getElementsByTagName("canvas"), v, i = 0;
            while ( (v = nodes[i++]) ) {
              initOldWebKitCanvas(v);
            }
          }
          ++_canvasReady;
        } else {
          setTimeout(fn, 0);
        }
      };
      fn();
    } else if (_ua.gecko) {
      _doc.addEventListener("DOMContentLoaded", function() {
        ++_canvasReady;
      }, false);
    } else {
      ++_canvasReady;
    }
    return;
  }
  // --- IE part ---
  function initIE() {
    var v, node = _doc.getElementsByTagName("canvas"),
        i = node.length;

    while (i--) {
      v = node[i];
      initCanvas(node[i],
          (!_mm.feature.slver ||
           (" " + v.className + " ").indexOf(" vml ") >= 0));
    }
    ++_canvasReady;
  }

  if (lc.test(_doc[rs])) { // DOM already
    initIE();
  } else {
    fn = function() {
      if (lc.test(_doc[rs])) {
        initIE();
        _doc.detachEvent(fnready, fn);
      }
    };
    _doc.attachEvent(fnready, fn);
  }
}

// uuMeta.canvas.SL2D - Silverlight 2D
function SL2D(node) { // @param Node:
  this.canvas = node;
  initSurface(this);
  this._elm = node;
  this._view = null;
  this._content = null;
}

// inner - initSL
function initSL(node) { // @param Node:
  var e = removeFallback(node),
      attr = node.attributes,
      aw = attr.width,
      ah = attr.height,
      onload = "_sl" + (++_slHostCount) + "_onload";

  e.style.pixelWidth  = (aw && aw.specified) ? aw.nodeValue : 300;
  e.style.pixelHeight = (ah && ah.specified) ? ah.nodeValue : 150;

  e.getContext = function() {
    return e._ctx2d;
  };
  e._ctx2d = new SL2D(e);

  window[onload] = function(sender) {
    e.uuCanvasType    = "SL2D"; // canvas.already mark
    // lazy detection
    e.style.direction = e.currentStyle.direction;
    // sender is <Canvas> element
    // sender.getHost() is <object> element
    e._ctx2d._view    = sender.children;
    e._ctx2d._content = sender.getHost().content;
    window[onload]    = void 0; // gc event-hander
  };

  e.innerHTML = [
    '<object type="application/x-silverlight" width="100%" height="100%">',
      '<param name="background" value="#00000000" />',  // transparent
      '<param name="windowless" value="true" />',
      '<param name="source" value="#xaml" />',          // XAML ID
      '<param name="onLoad" value="', onload, '" />',   // bond to global
    '</object>'].join("");

  e.bind = function(ignore) { // @param Number: ignore property change count
    !e.bind._binded++ && e.attachEvent("onpropertychange", onPropertyChange);
    e.bind._ignore = ignore || 0;
  };
  e.unbind = function() {
    e.bind._binded && e.detachEvent("onpropertychange", onPropertyChange);
    e.bind._binded = 0;
  };
  e.bind._binded = 0;
  e.bind._ignore = 0;
  e.bind();
  return e;
}

// uuMeta.canvas.VML2D - VML 2D
function VML2D(node) { // @param Node:
  this.canvas = node;
  node.uuCanvasType = "VML2D";
  initSurface(this);
  this._elm = node.appendChild(_doc.createElement("div"));
  this._elm.style.pixelWidth  = node.width;
  this._elm.style.pixelHeight = node.height;
  this._elm.style.overflow    = "hidden";
  this._elm.style.position    = "absolute";
  this._elm.uuCanvasDirection = node.currentStyle.direction;
  this._elm.style.direction   = "ltr";
  this._clipRect = VML2D._rect(this, 0, 0,
                               this.canvas.width,
                               this.canvas.height);
}

// inner - initVML
function initVML(node) {
  var e = removeFallback(node),
      attr = node.attributes,
      aw = attr.width,
      ah = attr.height;

  e.style.pixelWidth  = (aw && aw.specified) ? aw.nodeValue : 300;
  e.style.pixelHeight = (ah && ah.specified) ? ah.nodeValue : 150;

  e.getContext = function() {
    return e._ctx2d;
  };
  e._ctx2d = new VML2D(e);

  e.bind = function(ignore) { // @param Number: ignore property change count
    !e.bind._binded++ &&
        e.attachEvent("onpropertychange", onPropertyChange);
    e.bind._ignore = ignore || 0;
  };
  e.unbind = function() {
    e.bind._binded &&
        e.detachEvent("onpropertychange", onPropertyChange);
    e.bind._binded = 0;
  };
  e.bind._binded = 0;
  e.bind._ignore = 0;
  e.bind();
  return e;
}

// --- initialize / export ---
// CanvasRenderingContext2D.prototype.xxx
SL2D.prototype.save             = save;
SL2D.prototype.restore          = restore;
SL2D.prototype.scale            = scale;
SL2D.prototype.rotate           = rotate;
SL2D.prototype.translate        = translate;
SL2D.prototype.transform        = transform;
SL2D.prototype.setTransform     = setTransform;
SL2D.prototype.beginPath        = beginPath;
SL2D.prototype.arcTo            = notImpl;
SL2D.prototype.stroke           = stroke;
SL2D.prototype.isPointInPath    = notImpl;
SL2D.prototype.strokeText       = strokeText;
SL2D.prototype.measureText      = measureText;
SL2D.prototype.createImageData  = notImpl;
SL2D.prototype.getImageData     = notImpl;
SL2D.prototype.putImageData     = notImpl;

// CanvasRenderingContext2D.prototype.xxx
VML2D.prototype.save            = save;
VML2D.prototype.restore         = restore;
VML2D.prototype.scale           = scale;
VML2D.prototype.rotate          = rotate;
VML2D.prototype.translate       = translate;
VML2D.prototype.transform       = transform;
VML2D.prototype.setTransform    = setTransform;
VML2D.prototype.beginPath       = beginPath;
VML2D.prototype.arcTo           = notImpl;
VML2D.prototype.stroke          = stroke;
VML2D.prototype.isPointInPath   = notImpl;
VML2D.prototype.strokeText      = strokeText;
VML2D.prototype.measureText     = measureText;
VML2D.prototype.createImageData = notImpl;
VML2D.prototype.getImageData    = notImpl;
VML2D.prototype.putImageData    = notImpl;

// CanvasGradient.prototype.addColorStop
CanvasGradient.prototype.addColorStop = addColorStop;

_mm.mix(_mm.canvas, {
  init:     initCanvas,
  ready:    readyCanvas,
  already:  alreadyCanvas,
  expire:   expireCanvas,
  setup:    setup,
  SL2D:     SL2D,
  VML2D:    VML2D,
  impl: {
    parseFont:          parseFont,
    parseColor:         parseColor,
    colorCache:         _colorCache,
    FONT_SCALES:        _FONT_SCALES,
    toHTMLEntity:       toHTMLEntity,
    getTextMetric:      getTextMetric,
    matrix2DMultiply:   matrix2DMultiply,
    matrix2Dtranslate:  matrix2Dtranslate,
    matrix2DRotate:     matrix2DRotate,
    matrix2DScale:      matrix2DScale,
    matrix2DTransform:  matrix2DTransform,
    detectDrawImageArg: detectDrawImageArg
  }
});
_mm.mix(window, {
  CanvasRenderingContext2D: notImpl,
  CanvasGradient: CanvasGradient,
  CanvasPattern:  CanvasPattern,
  TextMetrics:    TextMetrics
}, 0, 0);

})(); // uuMeta.canvas scope

