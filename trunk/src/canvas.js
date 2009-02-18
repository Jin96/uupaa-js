// === SilverLight(Ag) Canvas ==============================
// depend: ua,hash,style,matrix2d,color
uu.feat.canvas = {};

uu.mix(UU.CONFIG, {
  CANVAS_XAML_SRC: "#xaml" // XAML src(or file path), default("#xaml")
}, 0, 0);

// --- local scope -----------------------------------------
(function() {
var _matrix = uu.Class.Matrix2D,
    _zoom = 10, _halfZoom = _zoom / 2,
    _buildColor = uu.color.build,
    _parseColor = uu.color.parse,
    _agEnable = uu.ua.isSilverLightInstalled("2.0"),
    _agHostCount = 0,
    _emCache = 0,
    _fontCache = {},
    _colorCache = { /* name: [hex, alpha] */ },
    _textMetricElement = null,

    // --- const ---
    AgArcMagicNumber = 0.0001570796326795,
    // prop name
    GLOBAL_ALPHA    = "globalAlpha",
    GLOBAL_COMPO    = "globalCompositeOperation",
    STROKE_STYLE    = "strokeStyle",
    FILL_STYLE      = "fillStyle",
    LINE_WIDTH      = "lineWidth",
    LINE_CAP        = "lineCap",
    LINE_JOIN       = "lineJoin",
    MITER_LIMIT     = "miterLimit",
    SHADOW_OFFSET_X = "shadowOffsetX",
    SHADOW_OFFSET_Y = "shadowOffsetY",
    SHADOW_BLUR     = "shadowBlur",
    SHADOW_COLOR    = "shadowColor",
    FONT            = "font",
    TEXT_ALIGN      = "textAlign",
    TEXT_BASELINE   = "textBaseline",
    // prop value
    HitProps      = { width: 1, height: 2 },
//  GradientType  = { linear: 1, radial: 2, tile: 3 },
    Composite     = { "source-over": 1, "destination-over": 5, copy: 11 },
    TextAlign     = { start: 1, left: 1, center: 2, right: 3, end: 3 },
    SaveProps     = { strokeStyle: 1, fillStyle: 1, globalAlpha: 1,
                      lineWidth: 1, lineCap: 1, lineJoin: 1, miterLimit: 1,
                      shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 1, shadowColor: 1,
                      globalCompositeOperation: 1, font: 1, textAlign: 1, textBaseline: 1,
                      _lineScale: 1, _scaleX: 1, _scaleY: 1, _mtxEffected: 1, _clipPath: 1 },
    AgCaps        = { square: "Square", butt: "Flat", round: "Round" },
    VMLCaps       = { square: "square", butt: "flat", round: "round" },
    AgLineJoin    = { round: "Round", bevel: "Bevel", miter: "Miter" },
    AgFontStyle   = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    AgFontWeight  = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                      lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                      "300": "Light", "400": "Normal", "500": "Medium",
                      "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                      "900": "Black" },
    // Ag parts
    AG_ZINDEX_HEAD  = ' Canvas.ZIndex="',
    AG_OPACITY      = '" Opacity="',
    AG_FILL         = '" Fill="',
    AG_DATA         = '" Data="',
    // VML parts
    VML_STYLE       = 'position:absolute;width:10px;height:10px;',
    VML_ZINDEX      = 'z-index:',
    VML_COORD       = '" coordorigin="0,0" coordsize="100,100',
    VML_FILL        = '" filled="t" stroked="f',
    VML_STROKE      = '" filled="f" stroked="t',
    VML_PATH        = '" path="',
    VML_COLOR       = '" color="',
    VML_COLORS      = '" colors="',
    VML_OPACITY     = '" opacity="',
    VML_SRC         = '" src="',
    VML_ANGLE       = '" angle="',
    VML_FILLTYPE_HEAD = ' filltype="',
    VML_TYPE_HEAD   = ' type="',
    VML_COLOR_HEAD  = ' color="',
    VML_SHAPE_STYLE = '<v:shape style="',
    VML_END_SHAPE   = '" /></v:shape>',
    VML_VSTROKE     = '"><v:stroke',
    VML_VFILL       = '"><v:fill';

// uu.canvas._initDynamicElement
uu.canvas._initDynamicElement = function(canvas, vml) {
  if (vml || !_agEnable) {
    return !canvas.getContext ? VMLInitDynamicElement(canvas) : canvas;
  }
  return !canvas.getContext ? AgInitDynamicElement(canvas) : canvas;
};

// --- measure text rect(width, height) ---
function textMetric(text, font) {
  if (!_textMetricElement) {
    _textMetricElement = uudoc.createElement("div");
    _textMetricElement.id = "uupaa-excanvas-text-rect";
// for debug
//  _textMetricElement.style.cssText = "position:absolute;text-align:left;border:1px solid red";
    _textMetricElement.style.cssText = "position:absolute;top:-9999px;left:-9999px;text-align:left;visibility:hidden;border:1px solid red";
    uudoc.body.appendChild(_textMetricElement);
  }
  _textMetricElement.style.font = font;
  _textMetricElement.innerText = text;
  var box = _textMetricElement.getBoundingClientRect(), w, h;
  w = box.right - box.left;
  h = box.bottom - box.top;
  return { w: Math.round(w), h: Math.round(h) };
}

// --- parse "font:" ---
function parseFontCSS(font, ag) {
  var rv, unit, m, ary, family, i, iz;

  if (font in _fontCache) {
    unit = uu.style.unit(1);
    if (unit.em === _emCache) {
      return _fontCache[font];
    }
  }

  rv = {
    FontStyle: "normal", FontVariant: "normal",
    FontWeight: "normal", FontSize: "medium",
    LineHeight: "1", FontFamily: "", FontFamilyParam: []
  };

  unit = uu.style.unit();

  if ( (m = font.match(/^(normal|italic|oblique)/)) ) {
    rv.FontStyle = m[1];
    font = font.slice(m[0].length);
  }
  if ( (m = font.match(/^\s*(normal|small-caps)/)) ) {
    rv.FontVariant = m[1];
    font = font.slice(m[0].length);
  }
  if ( (m = font.match(/^\s*(normal|bolder|bold|lighter|100|200|300|400|500|600|700|800|900)/)) ) {
    rv.FontWeight = m[1];
    font = font.slice(m[0].length);
  }
  if ( (m = font.match(/^\s*(xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller|[\d]+(px|em|pt))/)) ) {
    if (m[2]) {
      switch (m[2]) {
      case "px": rv.FontSize = parseInt(m[1]); break;
      case "em": rv.FontSize = parseInt(m[1]) * unit.em; break;
      case "pt": rv.FontSize = parseInt(m[1]) * unit.pt; break;
      }
    } else {
      rv.FontSize = m[1];
    }
    font = font.slice(m[0].length);
  }
  if ( (m = font.match(/^\s*\/\s*(normal|[\d\.]+(px|em|pt)|[\d\.]+)/)) ) {
    if (m[2]) {
      switch (m[2]) {
      case "px": rv.LineHeight = parseInt(m[1]); break;
      case "em": rv.LineHeight = parseInt(m[1]) * unit.em; break;
      case "pt": rv.LineHeight = parseInt(m[1]) * unit.pt; break;
      }
    } else {
      if (m[1] === "normal") {
        m[1] = 1;
      }
      rv.LineHeight = m[1];
    }
    font = font.slice(m[0].length);
  }
  font = font.replace(/^\s*/, "");
  family = font.split(",");
  for (ary = [], i = 0, iz = family.length; i < iz; ++i) {
    if (ag) {
      ary.push(family[i].replace(/^\s+|\s+$/, "").
                         replace(/^[\"\']|[\"\']$/g, ""));
    } else {
      ary.push("'" + family[i].replace(/^\s+|\s+$/, "").
                               replace(/^[\"\']|[\"\']$/g, "") + "'");
    }
  }
  rv.FontFamily = ary.join(",");
  rv.FontFamilyParam = ary;

  _emCache = unit.em;
  _fontCache[font] = rv;
  return rv;
}

function buildFontCSS(font, ag) {
  return [font.FontStyle, font.FontVariant, font.FontWeight,
          font.FontSize + "px", "/", font.LineHeight,
          font.FontFamilyParam.join(",")].join(" ");
}

function fontScalFineTuning(fontSize, vml) {
  var scale = 1.0, margin = 0;
  if (vml) {
    // VML
    if (fontSize <= 10)      { scale = 0.72;  margin =  0; }
    else if (fontSize <= 20) { scale = 0.828; margin =  0; }
    else if (fontSize <= 30) { scale = 0.873; margin =  0; }
    else if (fontSize <= 40) { scale = 0.882; margin =  0; }
    else if (fontSize <= 50) { scale = 0.882; margin = -2; }
    else if (fontSize <= 60) { scale = 0.891; margin = -4; }
    else { scale = 1.0; margin = 0; }
//alert("fontSize="+fontSize+", scale="+scale+", margin="+margin);
  } else {
    // Silverlight
    if (fontSize <= 10)      { scale = 0.88; margin =  0; }
    else if (fontSize <= 20) { scale = 0.90; margin = -3; }
    else if (fontSize <= 30) { scale = 0.93; margin = -5; }
    else if (fontSize <= 40) { scale = 0.97; margin = -6; }
    else if (fontSize <= 50) { scale = 0.98; margin = -8; }
    else if (fontSize <= 60) { scale = 0.98; margin = -12; }
    else if (fontSize <= 80) { scale = 0.98; margin = -12; }
    else if (fontSize <= 100){ scale = 0.98; margin = -16; }
    else if (fontSize <= 120){ scale = 0.99; margin = -16; }
    else if (fontSize <= 140){ scale = 0.99; margin = -26; }
    else { scale = 1.0; margin = -16; }
//alert("fontSize="+fontSize+", scale="+scale+", margin="+margin);
  }
  return { scale: scale, margin: margin };
}

// --- detect clip and clear color ---
function detectBackgroundColor(node) {
  var bg = "white", c, n = node, cs;
  while (n) {
    if ( (cs = n.currentStyle) ) {
      bg = cs.backgroundColor;
      if (bg !== "transparent") {
        break;
      }
    }
    n = n.parentNode;
  }
  c = _parseColor(bg === "transparent" ? "white" : bg);
  return _buildColor(c, UU.COLOR.HEX);
}

// --- event handler ---
function onPropertyChange(evt) {
  var tgt, prop, name;
  if ( (prop = HitProps[evt.propertyName] || 0) ) {
    tgt = evt.srcElement;
    name = (prop === 1) ? "width" : "height";
    tgt.style[name] = tgt.attributes[name].nodeValue  + "px";
    uu.canvas.ready() && tgt.getContext()._clear();
  }
}

function onResize(evt) {
  var tgt = evt.srcElement, fc = tgt.firstChild;
  if (fc) {
    fc.style.width  = tgt.clientWidth  + "px";
    fc.style.height = tgt.clientHeight + "px";
  }
}

// --- Silverlight ---
function AgInitDynamicElement(elm) {
  var e = uudoc.createElement(elm.outerHTML), attrs, host, id;
  if (elm.parentNode) {
    elm.parentNode.replaceChild(e, elm);
  } else {
    e = elm;
  }

  e.getContext = function() { return e._ctx2d; };
  e._ctx2d = new Ag2D(e);
  e.attachEvent("onpropertychange", onPropertyChange);
  e.attachEvent("onresize", onResize);

  attrs = e.attributes;
  if (attrs.width && attrs.width.specified) {
    e.style.width = attrs.width.nodeValue + "px";
  } else {
    e.width = e.clientWidth;
  }
  if (attrs.height && attrs.height.specified) {
    e.style.height = attrs.height.nodeValue + "px";
  } else {
    e.height = e.clientHeight;
  }

  host = ++_agHostCount;
  id = "uucanvas" + host;
  window[id + "_onload"] = function(sender) {
    // sender           = <Canvas></Canvas>
    // sender.getHost() = <object></object>
    e._ctx2d._view = sender.children;
    e._ctx2d._content = sender.getHost().content;
    ++e._ctx2d.contextReady;
//  ++uu.canvas._ready;
    uu.canvasReady = true;
  };
  window[id + "_onresize"] = function(sender) {};

  createAgObject({
    source:           UU.CONFIG.CANVAS_XAML_SRC,
    id:               id,
    background:       "#00000000",
//  enableHtmlAccess: "true",
    minRuntimeVersion:"1.0",
    windowless:       "true",
    onLoad:           id + "_onload",
    onResize:         id + "_onresize",
    onError:          "CanvasError"
  }, e);

  return e;
}

function createAgObject(param, context) {
  function encode(str) {
    return str.replace(/([^\w,\-\.])/g, function(_, m1) {
      return "&#" + m1.charCodeAt(0) + ";"; // HexString("&#0000;")
    });
  }
  var rv = [], n;
  for (n in param) {
    rv.push('<param name="', encode(n), '" value="', encode(param[n]), '" />');
  }
  context.innerHTML =
      '<object type="application/x-silverlight" data="data:application/x-silverlight," id="'
        + param.id + '" width="100%" height="100%">' + rv.join("") + '</object>';
}

/** Silverlight(Ag)
 */
function Ag2D(canvasElement) {
  // canvas 2d context properties
  this.canvas       = canvasElement;

  // --- compositing ---
  this[GLOBAL_ALPHA]  = 1.0;
  this[GLOBAL_COMPO]  = "source-over";

  // --- colors and styles ---
  this[STROKE_STYLE]  = "#000000"; // black
  this[FILL_STYLE]    = "#000000"; // black

  // --- line caps/joins ---
  this[LINE_WIDTH]    = 1;
  this[LINE_CAP]      = "butt";
  this[LINE_JOIN]     = "miter";
  this[MITER_LIMIT]   = 10;

  // --- shadows ---
  this[SHADOW_OFFSET_X] = 0;
  this[SHADOW_OFFSET_Y] = 0;
  this[SHADOW_BLUR]   = 0;
  this[SHADOW_COLOR]  = "#00000000"; // transparent black

  // --- text ---
  this[FONT]          = "10px sans-serif";
  this[TEXT_ALIGN]    = "start";
  this[TEXT_BASELINE] = "alphabetic";

  // --- enlarge properties ---
  this.xClearColor  = "#ffffff"; // white
  this.xTiling      = 1;         // 1: TileBrush simulate(slow)
  this.xFontScaleW  = 1.0;
  this.xFontScaleH  = 1.0;
  this.xTextMarginTop = 0;
  this.xType        = "Ag2D";

  // --- hidden properties ---
  this.contextReady = 0;  // 0: not ready
  this._lineScale   = 1;
  this._scaleX      = 1;
  this._scaleY      = 1;
  this._mtxEffected = 0;  // 1: matrix effected
  this._zindex      = -1;

  // --- inner param ---
  this._mtx         = _matrix.identity();
  this._stack       = []; // matrix and prop stack.
  this._path        = []; // current path
  this._clipPath    = null; // clipping path
  this._px          = 0;  // current position x
  this._py          = 0;  // current position y
  this._view        = null;
  this._content     = null;
  this._elm         = canvasElement;

  // detect clear color
  this.xClearColor  = detectBackgroundColor(this._elm);
};

Ag2D.prototype = {
  // === State =============================================
  save: function() {
    var prop = {}, i;
    for (i in SaveProps) { prop[i] = this[i]; }
    this._stack.push([prop, uu.mix([], this._mtx),
                     this._clipPath ? String(this._clipPath) : null]);
  },

  restore: function() {
    if (!this._stack.length) { return; }

    var last = this._stack.pop(), i;
    for (i in SaveProps) { this[i] = last[0][i]; }
    this._mtx = last[1];
    this._clipPath = last[2];
  },

  // === Transformations ==================================
  scale: function(x, y) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.scale(x, y), this._mtx);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._mtx[0][0] + this._mtx[1][1]) / 2;
  },

  rotate: function(angle) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.rotate(angle), this._mtx);
  },

  translate: function(x, y) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.translate(x, y), this._mtx);
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.transform(m11, m12, m21, m22, dx, dy),
                                this._mtx);
  },

  setTransform: function(m11, m12, m21, m22, dx, dy) {
    ++this._mtxEffected;
    this._mtx = _matrix.transform(m11, m12, m21, m22, dx, dy);
  },

  // === Rects ============================================
  clearRect: function(x, y, w, h) {
    if (!x && !y &&
        w == parseInt(this.canvas.width) &&
        h == parseInt(this.canvas.height)) {
      this._view.clear(); // clear all
    } else {
      var m       = this._mtx,
          m11     = m[0][0],
          m21     = m[1][0],
          m31     = m[2][0],
          m12     = m[0][1],
          m22     = m[1][1],
          m32     = m[2][1],
          xw      = x + w,
          yh      = y + h,
          path    = [ " M", x  * m11 + y  * m21 + m31, " ", x  * m12 + y  * m22 + m32,
                      " L", xw * m11 + y  * m21 + m31, " ", xw * m12 + y  * m22 + m32,
                      " L", xw * m11 + yh * m21 + m31, " ", xw * m12 + yh * m22 + m32,
                      " L", x  * m11 + yh * m21 + m31, " ", x  * m12 + yh * m22 + m32,
                      " Z"].join(""),
          zindex  = 0,
          xClear  = this.xClearColor,
          c       = _colorCache[xClear] ||
                        (_colorCache[xClear] = _buildColor(_parseColor(xClear), UU.COLOR.HEX_ALPHA)),
          color   = c[0],
          alpha   = c[1] * this[GLOBAL_ALPHA],
          xaml;

      switch (Composite[this[GLOBAL_COMPO]] || 1) {
      case  5: zindex = --this._zindex; break; // 5:destination-over
      case 11: this._clear(); break; // 11:copy
      }

      xaml = ['<Path', AG_ZINDEX_HEAD, zindex,
              AG_OPACITY, alpha,
              AG_FILL, color,
              AG_DATA, path, '" />'].join("");
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
  },
  _clear: function(x, y, w, h) {
    if (this._view) {
      this._view.clear(); // clear all
      this._zindex = 0;
    }
  },

  fillRect: function(x, y, w, h) {
    this._path = [];
    this.rect(x, y, w, h);
    this.fill();
  },

  strokeRect: function(x, y, w, h) {
    this._path = [];
    this.rect(x, y, w, h);
    this.stroke();
  },

  // === Path API ==========================================
  beginPath: function() {
    this._path = [];
  },

  closePath: function() {
    this._path.push(" Z");
  },

  moveTo: function(x, y) {
    if (!this._mtxEffected) {
      this._path.push(" M", x, " ", y);
    } else {
      var m = this._mtx;
      this._path.push(" M", x * m[0][0] + y * m[1][0] + m[2][0], " ",
                            x * m[0][1] + y * m[1][1] + m[2][1]);
    }
    this._px = x;
    this._py = y;
  },

  lineTo: function(x, y) {
    if (!this._mtxEffected) {
      this._path.push(" L", x, " ", y);
    } else {
      var m = this._mtx;
      this._path.push(" L", x * m[0][0] + y * m[1][0] + m[2][0], " ",
                            x * m[0][1] + y * m[1][1] + m[2][1]);
    }
    this._px = x;
    this._py = y;
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    if (!this._mtxEffected) {
      this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
    } else {
      var m = this._mtx,
          m11 = m[0][0], m21 = m[1][0], m31 = m[2][0],
          m12 = m[0][1], m22 = m[1][1], m32 = m[2][1];
      this._path.push(" Q", cpx * m11 + cpy * m21 + m31, " ",
                            cpx * m12 + cpy * m22 + m32, " ",
                            x   * m11 + y   * m21 + m31, " ",
                            x   * m12 + y   * m22 + m32);
    }
    this._px = x;
    this._py = y;
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (!this._mtxEffected) {
      this._path.push(" C", cp1x, " ", cp1y, " ",
                            cp2x, " ", cp2y, " ",
                            x, " ", y);
    } else {
      var m = this._mtx,
          m11 = m[0][0], m21 = m[1][0], m31 = m[2][0],
          m12 = m[0][1], m22 = m[1][1], m32 = m[2][1];
      this._path.push(" C", cp1x * m11 + cp1y * m21 + m31, " ",
                            cp1x * m12 + cp1y * m22 + m32, " ",
                            cp2x * m11 + cp2y * m21 + m31, " ",
                            cp2x * m12 + cp2y * m22 + m32, " ",
                            x    * m11 + y    * m21 + m31, " ",
                            x    * m12 + y    * m22 + m32);
    }
    this._px = x;
    this._py = y;
  },

  arcTo: function(x1, y1, x2, y2, radius) {
    // not impl
  },

  rect: function(x, y, w, h) {
    if (!this._mtxEffected) {
      this._path.push(" M", x    , " ", y,
                      " L", x + w, " ", y,
                      " L", x + w, " ", y + h,
                      " L", x    , " ", y + h,
                      " Z");
    } else {
      var m = this._mtx,
          m11 = m[0][0], m21 = m[1][0], m31 = m[2][0],
          m12 = m[0][1], m22 = m[1][1], m32 = m[2][1],
          xw = x + w, yh = y + h;
      this._path.push(" M", x  * m11 + y  * m21 + m31, " ", x  * m12 + y  * m22 + m32,
                      " L", xw * m11 + y  * m21 + m31, " ", xw * m12 + y  * m22 + m32,
                      " L", xw * m11 + yh * m21 + m31, " ", xw * m12 + yh * m22 + m32,
                      " L", x  * m11 + yh * m21 + m31, " ", x  * m12 + yh * m22 + m32,
                      " Z");
    }
    this._px = x;
    this._py = y;
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    var deg1 = startAngle * Math.toDegrees,
        deg2 = endAngle   * Math.toDegrees,
        isLargeArcFlag = 0,
        sweepDirectionFlag = anticlockwise ? 0 : 1,
        sx, sy, ex, ey, rx, ry, xaml,
        m = this._mtx, m11, m21, m31, m12, m22, m32;

    // angle normalize
    if (deg1 < 0)   { deg1 += 360; }
    if (deg1 > 360) { deg1 -= 360; }
    if (deg2 < 0)   { deg2 += 360; }
    if (deg2 > 360) { deg2 -= 360; }

    // circle
    if (deg1 + 360 == deg2 || deg1 == deg2 + 360) {
      if (sweepDirectionFlag) {
        endAngle -= AgArcMagicNumber;
      } else {
        endAngle += AgArcMagicNumber;
      }
      isLargeArcFlag = 1;
    } else if (sweepDirectionFlag) {
      if (deg2 - deg1 > 180) {
        isLargeArcFlag = 1;
      }
    } else {
      if (deg1 - deg2 > 180) {
        isLargeArcFlag = 1;
      }
    }

    rx = this._scaleX * radius;
    ry = this._scaleY * radius;

    sx = x + (Math.cos(startAngle) * radius);
    sy = y + (Math.sin(startAngle) * radius);
    ex = x + (Math.cos(endAngle) * radius);
    ey = y + (Math.sin(endAngle) * radius);

    if (!this._path.length) { // add <PathFigure StartPoint="..">
      this.moveTo(sx, sy);
    }

    if (!this._mtxEffected) {
      xaml = [" A", rx, " ", ry, " 0 ", isLargeArcFlag, " ",
              sweepDirectionFlag, " ", ex, " ", ey].join("");
    } else {
      m11 = m[0][0], m21 = m[1][0], m31 = m[2][0];
      m12 = m[0][1], m22 = m[1][1], m32 = m[2][1];
      xaml = [" A", rx, " ", ry, " 0 ", isLargeArcFlag, " ",
              sweepDirectionFlag, " ",
              ex * m11 + ey * m21 + m31, " ",
              ex * m12 + ey * m22 + m32].join("");
    }
    this._path.push(xaml);
    this._px = x;
    this._py = y;
  },

  fill: function() {
    var xaml = "", path = this._path.join(""), zindex = 0,
        mix = Composite[this[GLOBAL_COMPO]] || 1, c,
        fillStyle = this[FILL_STYLE];

    switch (mix) {
    case  5: zindex = --this._zindex; break;  //  5: destination-over
    case 11: this._clear(); break;            // 11: copy
    }

    if (typeof fillStyle === "string") {
      c = _colorCache[fillStyle] ||
              (_colorCache[fillStyle] = _buildColor(_parseColor(fillStyle), UU.COLOR.HEX_ALPHA)),
      xaml = ['<Path', AG_ZINDEX_HEAD, zindex,
                AG_OPACITY, c[1] * this[GLOBAL_ALPHA],
                AG_DATA, path, AG_FILL, c[0], '" />'].join("");
    } else {
      switch (fillStyle._type) {
      case 1: xaml = this._linearGradientFill(fillStyle, path, 0, mix, zindex); break;
      case 2: xaml = this._radialGradientFill(fillStyle, path, 0, mix, zindex); break;
      case 3: xaml = this._patternFill(fillStyle, path, 0, mix, zindex); break;
      }
    }
    if (xaml) {
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
    this._path = [];
  },
  _linearGradientFill: function(style, path, wire, mix, zindex) {
    var prop    = wire ? "Stroke" : "Fill",
        fp      = style._param,
        color   = this._buildLinearColor(style._colorStop),
        w, h, z, sx = 0, sy = 0, ex = 0, ey = 0;

    w = Math.max(fp.x0, fp.x1) - Math.min(fp.x0, fp.x1);
    h = Math.max(fp.y0, fp.y1) - Math.min(fp.y0, fp.y1);
    z = Math.max(w, h);
    if (fp.x0 > fp.x1) { sx = w / z; } else { ex = w / z; }
    if (fp.y0 > fp.y1) { sy = h / z; } else { ey = h / z; }

    return ['<Path', AG_ZINDEX_HEAD, zindex,
              AG_OPACITY, this[GLOBAL_ALPHA],
              AG_DATA, path,
              wire ? this._strokeProps() : "", '"><Path.', prop,
            '><LinearGradientBrush StartPoint="', sx, ",", sy,
              '" EndPoint="', ex, ",", ey, '">', color,
            '</LinearGradientBrush></Path.', prop, '></Path>'].join("");
  },
  _radialGradientFill: function(style, path, wire, mix, zindex) {
    var prop    = wire ? "Stroke" : "Fill",
        fp      = style._param,
        zindex2 = 0,
        color   = this._buildRadialColor(style),
        rr      = fp.r1 * 2,
        x       = fp.x1 - fp.r1,
        y       = fp.y1 - fp.r1,
        gx      = (fp.x0 - (fp.x1 - fp.r1)) / rr,
        gy      = (fp.y0 - (fp.y1 - fp.r1)) / rr,
        m       = _matrix.multiply(_matrix.translate(x, y), this._mtx),
        v,
        bari    = "";

    if (!wire && style._colorStop.length) {
      v = style._colorStop[style._colorStop.length - 1];
      if (v.color[1] > 0.001) {
        // fill outside
        if (mix === 5) { zindex2 = --this._zindex; }
        bari =  [ '<Path', AG_ZINDEX_HEAD, zindex2,
                    AG_OPACITY, this[GLOBAL_ALPHA],
                    AG_DATA, path, '" Fill="#',
                    UU.UTIL.DEC2HEX[parseFloat(v.color[1] / (1 / 255))]
                        + v.color[0].substring(1),
                  '" />'].join("");
        this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(bari)
                                                                   : bari, false));
      }
    }
    return ['<Ellipse', AG_ZINDEX_HEAD, zindex,
              AG_OPACITY, this[GLOBAL_ALPHA], '" Width="', rr, '" Height="', rr,
              wire ? this._strokeProps() : "",
            '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="', gx, ',', gy,
              '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', color,
            '</RadialGradientBrush></Ellipse.', prop, '>',
              this._buildMatrix('Ellipse', m), '</Ellipse>'].join("");
  },
  _patternFill: function(style, path, wire, mix, zindex) {
    var prop    = wire ? "Stroke" : "Fill",
        zindex2 = 0,
        sw, sh, xz, yz, x, y, rv; // use tile mode

    if (!wire && this.xTiling) {
      x  = 0;
      y  = 0;
      sw = style._w;
      sh = style._h;
      xz = Math.ceil(this.canvas.width  / sw);
      yz = Math.ceil(this.canvas.height / sh);
      rv = [];

      if (mix === 5) { zindex2 = --this._zindex; }
      rv.push('<Canvas', AG_ZINDEX_HEAD, zindex2, '" Clip="', path, '">');
      for (y = 0; y < yz; ++y) {
        for (x = 0; x < xz; ++x) {
          rv.push('<Image Opacity="', this[GLOBAL_ALPHA],
                  '" Canvas.Left="', x * sw, '" Canvas.Top="', y * sh,
                  '" Source="', style._src, '" />');
        }
      }
      rv.push('</Canvas>');
      return rv.join("");
    }
    return ['<Path', AG_ZINDEX_HEAD, zindex, AG_OPACITY, this[GLOBAL_ALPHA],
              AG_DATA, path,
              wire ? this._strokeProps() : "",
            '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="', style._src,
            '" /></Path.', prop, '></Path>'].join("");
  },

  stroke: function() {
    var xaml = "", path = this._path.join(""), zindex = 0,
        mix = Composite[this[GLOBAL_COMPO]] || 1, c,
        strokeStyle = this[STROKE_STYLE];

    switch (mix) {
    case  5: zindex = --this._zindex; break;  //  5: destination-over
    case 11: this._clear(); break;            // 11: copy
    }

    if (typeof strokeStyle === "string") {
      c = _colorCache[strokeStyle] ||
              (_colorCache[strokeStyle] = _buildColor(_parseColor(strokeStyle), UU.COLOR.HEX_ALPHA)),
      xaml = ['<Path', AG_ZINDEX_HEAD, zindex,
                AG_OPACITY, c[1] * this[GLOBAL_ALPHA], AG_DATA, path,
                this._strokeProps(), '" Stroke="', c[0], '" />'].join("");
    } else {
      switch (strokeStyle._type) {
      case 1: xaml = this._linearGradientFill(strokeStyle, path, 1, mix, zindex); break;
      case 2: xaml = this._radialGradientFill(strokeStyle, path, 1, mix, zindex); break;
      case 3: xaml = this._patternFill(strokeStyle, path, 1, mix, zindex); break;
      }
    }
    if (xaml) {
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
    this._path = [];
  },

  clip: function() {
    this._clipPath = this._path.join("");
  },
  _clippy: function(xaml) {
    return ['<Canvas Clip="', this._clipPath, '">', xaml, '</Canvas>'].join("");
  },

  isPointInPath: function(x, y) {
    // not impl
  },

  // === Text ==============================================
  fillText: function(text, x, y, maxWidth) {
    var xaml;
    if (typeof this[FILL_STYLE] === "string") {
      xaml = this._fillText(text, x, y, maxWidth, this[FILL_STYLE], 0);
    } else {
/* not impl
      switch (this[FILL_STYLE]._type) {
      case 1: xaml = this._linearGradientFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      case 2: xaml = this._radialGradientFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      case 3: xaml = this._patternFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      }
 */
    }
//alert(xaml);
    if (xaml) {
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
  },
  _fillText: function(text, x, y, maxWidth, style, wire) {
    var r, offX, xaml = this._prerenderFillText(text, x, y, maxWidth, style, wire),
        align = TextAlign[this[TEXT_ALIGN]] || 1;
    if (align === 1) { // start or left
      return xaml;
    }
    r = this._content.createFromXaml(xaml, false);
    offX = (align === 2) ? r.ActualWidth / 2 : r.ActualWidth; // 2 = center
    r = null;
    return this._prerenderFillText(text, x - offX, y, maxWidth, style, wire);
  },
  _prerenderFillText: function(text, x, y, maxWidth, style, wire) {
    text = text.replace(/( |\t|\v|\f|\r\n|\r|\n)/g, " ");
    var font    = parseFontCSS(this[FONT], 1),
        c       = _colorCache[style] ||
                      (_colorCache[style] = _buildColor(_parseColor(style), UU.COLOR.HEX_ALPHA)),
        zindex  = 0,
        tune    = fontScalFineTuning(font.FontSize, 0),
        m       = _matrix.multiply(_matrix.translate(x, y), this._mtx);

    switch (Composite[this[GLOBAL_COMPO]] || 1) {
    case  5: zindex = --this._zindex; break; // 5:destination-over
    case 11: this._clear(); break; // 11:copy
    }

    return ['<TextBlock', AG_ZINDEX_HEAD, zindex,
              AG_OPACITY, c[1] * this[GLOBAL_ALPHA],
              '" Foreground="', c[0], '" Canvas.Top="', this.xTextMarginTop + tune.margin,
              '" FontFamily="', font.FontFamily,
              '" FontSize="', font.FontSize * this.xFontScaleH * tune.scale,
              '" FontStyle="', AgFontStyle[font.FontStyle] || "Normal",
              '" FontWeight="', AgFontWeight[font.FontWeight] || "Normal",
            '">', text, this._buildMatrix('TextBlock', m), '</TextBlock>'].join("");
  },

  strokeText: function(text, x, y, maxWidth) {
    var xaml;
    if (typeof this[STROKE_STYLE] === "string") {
      xaml = this._fillText(text, x, y, maxWidth, this[STROKE_STYLE], 1);
    } else {
/* not impl
      switch (this[STROKE_STYLE]._type) {
      case 1: xaml = this._linearGradientFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      case 2: xaml = this._radialGradientFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      case 3: xaml = this._patternFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      }
*/
    }
    if (xaml) {
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
  },

  measureText: function(text) {
    var xaml, r, w, h;

    xaml = this._fillText(text, 0, 0, undefined, "rgba(0,0,0,0)");
    r = this._content.createFromXaml(xaml, false);
    w = r.ActualWidth;
    h = r.ActualHeight;
    r = null;
    return new AgTextMetrics(w, h);
  },

  // === Drawing images ====================================
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var xaml, a = arguments, az = a.length,
        dx, dy, dw, dh, sx, sy, sw, sh, iw, ih,
        bw, bh, w, h, x, y, // slice
        m, size = "", clip = "",
        zindex  = 0;

    switch (Composite[this[GLOBAL_COMPO]] || 1) {
    case  5: zindex = --this._zindex; break; // 5:destination-over
    case 11: this._clear(); break; // 11:copy
    }

    if ("src" in image) { // image is HTMLImageElement
      iw = image.width;
      ih = image.height;
      if (az < 9) {
        dx = a[1], dy = a[2], dw = a[3] || iw, dh = a[4] || ih,
        sx = 0, sy = 0, sw = iw, sh = ih;
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);

        if (az === 5) {
          size = ['" Width="', dw, '" Height="', dh].join("");
        }
      } else {
        dx = a[5], dy = a[6], dw = a[7], dh = a[8],
        sx = a[1], sy = a[2], sw = a[3], sh = a[4];

        bw = dw / sw; // bias width
        bh = dh / sh; // bias height
        w = bw * iw;
        h = bh * ih;
        x = dx - (bw * sx);
        y = dy - (bh * sy);

        m = _matrix.multiply(_matrix.translate(x, y), this._mtx);

        size = ['" Width="', w, '" Height="', h].join("");
        clip = ['<Image.Clip>',
                  '<RectangleGeometry Rect="', [dx - x, dy - y, dw, dh].join(" "), '" />',
                '</Image.Clip>'].join("");
      }

      xaml = ['<Image', AG_ZINDEX_HEAD, zindex,
                AG_OPACITY, this[GLOBAL_ALPHA],
                '" Source="', image.src, size, '">',
                clip, this._buildMatrix('Image', m),
              '</Image>'].join("");

//      this._view.add(this._factory(this._clipPath ? this._clippy(xaml)
      this._view.add(this._content.createFromXaml(this._clipPath ? this._clippy(xaml)
                                                                 : xaml, false));
    }
  },

  // === Pixel manipulation ================================
  createImageData: function(sw, sh) {
    // not impl
  },

  getImageData: function(sx, sy, sw, sh) {
    // not impl
  },

  putImageData: function(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    // not impl
  },

  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new AgGrad(1, // 1:LinearGradient
                      { x0: x0, y0: y0, x1: x1, y1: y1 });
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new AgGrad(2, // 2:RadialGradient
                      { x0: x0, y0: y0, r0: r0,
                        x1: x1, y1: y1, r1: r1 });
  },

  createPattern: function(image, repetition) {
    return new AgPatt(image, repetition);
  },
  _buildLinearColor: function(ary) {
    var rv = [], v, i = 0, iz = ary.length, n = 1 / 255;
    for (; i < iz; ++i) {
      v = ary[i];
      rv.push('<GradientStop Color="#',
                UU.UTIL.DEC2HEX[parseFloat(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', v.offset, '" />');
    }
    return rv.join("");
  },
  _buildRadialColor: function(style) {
    var rv = [],
        fp = style._param, n = 1 / 255,
        r0 = fp.r0 / fp.r1,
        remain = 1 - r0,
        v,
        i = 0,
        iz = style._colorStop.length;
    if (!iz) { return ""; }

    rv.push('<GradientStop Color="#',
              UU.UTIL.DEC2HEX[parseFloat(style._colorStop[0].color[1] / n)],
              style._colorStop[0].color[0].substring(1), '" Offset="', 0, '" />');
    for (i = 0; i < iz; ++i) {
      v = style._colorStop[i];
      rv.push('<GradientStop Color="#',
                UU.UTIL.DEC2HEX[parseFloat(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', (v.offset * remain + r0), '" />');
    }
    return rv.join("");
  },

  // clearRect(all) + beginPath + moveTo
  xClearBegin: function(x, y) {
    if (this._view) {
      // inline clearRect(all)
      this._view.clear(); // clear all
      this._zindex = 0;
      // inline beginPath + moveTo
      if (!this._mtxEffected) {
        this._path = [" M", x, " ", y];
      } else {
        var m = this._mtx;
        this._path = [" M", x * m[0][0] + y * m[1][0] + m[2][0], " ",
                            x * m[0][1] + y * m[1][1] + m[2][1]];
      }
      this._px = x;
      this._py = y;
    }
  },

  _strokeProps: function() {
    var cap = AgCaps[this[LINE_CAP]] || "Square";
    return ['" StrokeLineJoin="',     AgLineJoin[this[LINE_JOIN]] || "Miter",
            '" StrokeMiterLimit="',   this[MITER_LIMIT],
            '" StrokeThickness="',    this[LINE_WIDTH] * this._lineScale,
            '" StrokeStartLineCap="', cap,
            '" StrokeEndLineCap="',   cap].join("");
  },

  _buildMatrix: function(type, m) {
    return [
      '<', type, '.RenderTransform><MatrixTransform><MatrixTransform.Matrix><Matrix M11="',
                    m[0][0], '" M21="', m[1][0], '" OffsetX="', m[2][0],
         '" M12="', m[0][1], '" M22="', m[1][1], '" OffsetY="', m[2][1],
         '" /></MatrixTransform.Matrix></MatrixTransform></', type, '.RenderTransform>'].join("");
  }
};

function AgGrad(type, param) {
  this._type  = type;
  this._param = param;
  this._colorStop = [];
}

AgGrad.prototype.addColorStop = function(offset, color) {
  function fn(a, b) { return a.offset - b.offset; }
  var c = _colorCache[color] ||
              (_colorCache[color] = _buildColor(_parseColor(color), UU.COLOR.HEX_ALPHA));
  this._colorStop.push({ offset: offset, color: c });
  this._colorStop.sort(fn); // sort offset
};

function AgPatt(image /* HTMLImageElement */, repetition /* = undefined */) {
  repetition = repetition || "repeat";
  switch (repetition) {
  case "repeat": break;
  default: throw "";
  }

  this._type = 3; // 3:tile

  // get image dimension
/*
alert("image.complete="+image.complete);
  if (!image.complete) {
    var me = this,
        dummy = new Image();
    dummy.src = image.src;
    dummy.onload = function() {
      me._w = dummy.width;
      me._h = dummy.height;
    };
  } else {
*/
    this._w = image.width;
    this._h = image.height;
/*
  }
*/

  if ("src" in image) { // HTMLImageElement
    if ("uuIEBoostAlphaPNGSrc" in image) { // special attr by uupaa.js
      this._src = image.uuIEBoostAlphaPNGSrc;
    } else {
      this._src = image.src;
    }
    this._repeat = repetition;
  } else if ("getContext" in image) { // HTMLCanvasElement
    throw "";
  }
}

function AgTextMetrics(w, h) {
  this.width = w;
  this.height = h;
}

function VMLInitDynamicElement(elm) {
  var e = uudoc.createElement(elm.outerHTML), attrs;
  if (elm.parentNode) {
    elm.parentNode.replaceChild(e, elm);
  } else {
    e = elm;
  }

  e.getContext = function() {
    return e._ctx2d ? e._ctx2d : (e._ctx2d = new VML2D(e));
  };
  e.attachEvent("onpropertychange", onPropertyChange);
  e.attachEvent("onresize", onResize);

  attrs = e.attributes;
  if (attrs.width && attrs.width.specified) {
    e.style.width = attrs.width.nodeValue + "px";
  } else {
    e.width = e.clientWidth;
  }
  if (attrs.height && attrs.height.specified) {
    e.style.height = attrs.height.nodeValue + "px";
  } else {
    e.height = e.clientHeight;
  }
  return e;
}

/** VML
 */
function VML2D(canvasElement) {
  // --- canvas 2d context properties ---
  this.canvas       = canvasElement;

  // --- compositing ---
  this[GLOBAL_ALPHA] = 1.0;
  this[GLOBAL_COMPO] = "source-over";

  // --- colors and styles ---
  this[STROKE_STYLE] = "#000000"; // black
  this[FILL_STYLE]   = "#000000"; // black

  // --- line caps/joins ---
  this[LINE_WIDTH]  = 1;
  this[LINE_CAP]    = "butt";
  this[LINE_JOIN]   = "miter";
  this[MITER_LIMIT] = 10;

  // --- shadows ---
  this[SHADOW_OFFSET_X] = 0;
  this[SHADOW_OFFSET_Y] = 0;
  this[SHADOW_BLUR]     = 0;
  this[SHADOW_COLOR]    = "rgba(0,0,0,0)"; // transparent black

  // --- text ---
  this[FONT]            = "10px sans-serif";
  this[TEXT_ALIGN]      = "start";
  this[TEXT_BASELINE]   = "alphabetic";

  // --- enlarge properties ---
  this.xClearColor  = "#ffffff"; // white
  this.xClipStyle   = "#ffffff"; // white
  this.xFontScaleW  = 1.0;
  this.xFontScaleH  = 1.0;
  this.xTextMarginTop = 0;
  this.xType        = "VML2D";

  // --- hidden properties ---
  this.contextReady = 1;  // 1: already
  this._lineScale   = 1;
  this._scaleX      = 1;
  this._scaleY      = 1;
  this._mtxEffected = 0;  // 1: matrix effected
  this._zindex      = -1;

  // --- inner param ---
  this._mtx         = _matrix.identity();
  this._stack       = []; // matrix and prop stack.
  this._path        = []; // current path
  this._clipPath    = null; // clipping path
  this._px          = 0;  // current position x
  this._py          = 0;  // current position y

  this._elm         = canvasElement.appendChild(uudoc.createElement("div"));
  this._elm.style.width     = canvasElement.clientWidth  + "px";
  this._elm.style.height    = canvasElement.clientHeight + "px";
  this._elm.style.overflow  = "hidden";
  this._elm.style.position  = "absolute";

  var bg = detectBackgroundColor(this._elm);
  this.xClearColor  = bg;
  this.xClipStyle   = bg;

  this._clipRect    = this._rect(0, 0, this.canvas.width, this.canvas.height);
};

VML2D.prototype = {
  // === State =============================================
  save: function() {
    var prop = {}, i;
    for (i in SaveProps) { prop[i] = this[i]; }
    this._stack.push([prop, uu.mix([], this._mtx),
                     this._clipPath ? String(this._clipPath) : null]);
  },

  restore: function() {
    if (!this._stack.length) { return; }

    var last = this._stack.pop(), i;
    for (i in SaveProps) { this[i] = last[0][i]; }
    this._mtx = last[1];
    this._clipPath = last[2];
  },

  // === Transformations ===================================
  scale: function(x, y) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.scale(x, y), this._mtx);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._mtx[0][0] + this._mtx[1][1]) / 2;
  },

  rotate: function(angle) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.rotate(angle), this._mtx);
  },

  translate: function(x, y) {
    ++this._mtxEffected;
    this._mtx = _matrix.multiply(_matrix.translate(x, y), this._mtx);
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    this._mtx = _matrix.multiply(_matrix.transform(m11, m12, m21, m22, dx, dy), this._mtx);
  },

  setTransform: function(m11, m12, m21, m22, dx, dy) {
    this._mtx = _matrix.transform(m11, m12, m21, m22, dx, dy);
  },

  // === Rects =============================================
  clearRect: function(x, y, w, h) {
    if (!x && !y &&
        w == parseInt(this.canvas.width) &&
        h == parseInt(this.canvas.height)) {
      this._elm.innerHTML = ""; // clear all
      this._zindex = 0;
    } else {
      var _r      = Math.round,
          c0      = this._map(x, y),
          c1      = this._map(x + w, y),
          c2      = this._map(x + w, y + h),
          c3      = this._map(x, y + h),
          path    = [ " m", _r(c0.x), " ", _r(c0.y),
                      " l", _r(c1.x), " ", _r(c1.y),
                      " l", _r(c2.x), " ", _r(c2.y),
                      " l", _r(c3.x), " ", _r(c3.y),
                      " x"].join(""),
          zindex  = 0,
          xColor  = this.xClearColor,
          c       = _colorCache[xColor] ||
                      (_colorCache[xColor] = _buildColor(_parseColor(xColor), UU.COLOR.HEX_ALPHA)),
          vml;

      switch (Composite[this[GLOBAL_COMPO]] || 1) {
      case  5: zindex = --this._zindex; break; // 5:destination-over
      case 11: this._clear(); break; // 11:copy
      }

      vml =  [VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex,
              VML_FILL, VML_COORD, VML_PATH, path,
              VML_VFILL, VML_TYPE_HEAD, 'solid',
              VML_COLOR, c[0], VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
              VML_END_SHAPE].join("");

      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
  },
  _clear: function() {
    this._elm.innerHTML = ""; // clear all
    this._zindex = 0;
  },

  fillRect: function(x, y, w, h) {
    var rect = this._rect(x, y, w, h);
    this._path = [rect];
    this._px = x;
    this._py = y;

    // When all canvases are painted out, the fillStyle(background-color) is preserved.
    if (rect === this._clipRect) {
      if (typeof this[FILL_STYLE] === "string") {
        this.xClipStyle = this[FILL_STYLE];
      }
    }
    this.fill();
  },

  strokeRect: function(x, y, w, h) {
    this._path = [];
    this.rect(x, y, w, h);
    this.stroke();
  },

  // === Path API ==========================================
  beginPath: function() {
    this._path = [];
  },

  closePath: function() {
    this._path.push(" x");
  },
  moveTo: function(x, y) {
    var _r = Math.round,
        c0 = this._map(x, y);
    this._path.push("m ", _r(c0.x), " ", _r(c0.y));
    this._px = x;
    this._py = y;
  },

  lineTo: function(x, y) {
    var _r = Math.round,
        c0 = this._map(x, y);
    this._path.push("l ", _r(c0.x), " ", _r(c0.y));
    this._px = x;
    this._py = y;
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    var _r = Math.round,
        cp1x = this._px + 2.0 / 3.0 * (cpx - this._px),
        cp1y = this._py + 2.0 / 3.0 * (cpy - this._py),
        cp2x = cp1x + (x - this._px) / 3.0,
        cp2y = cp1y + (y - this._py) / 3.0,
        c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", _r(c1.x), " ", _r(c1.y), " ",
                          _r(c2.x), " ", _r(c2.y), " ",
                          _r(c0.x), " ", _r(c0.y));
    this._px = x;
    this._py = y;
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    var _r = Math.round,
        c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", _r(c1.x), " ", _r(c1.y), " ",
                          _r(c2.x), " ", _r(c2.y), " ",
                          _r(c0.x), " ", _r(c0.y));
    this._px = x;
    this._py = y;
  },

  arcTo: function(x1, y1, x2, y2, radius) {
    // not impl
  },

  rect: function(x, y, w, h) {
    this._path.push(this._rect(x, y, w, h));
    this._px = x;
    this._py = y;
  },
  _rect: function(x, y, w, h) {
    var _r = Math.round,
        c0 = this._map(x, y),
        c1 = this._map(x + w, y),
        c2 = this._map(x + w, y + h),
        c3 = this._map(x, y + h);
    return [" m", _r(c0.x), " ", _r(c0.y),
            " l", _r(c1.x), " ", _r(c1.y),
            " l", _r(c2.x), " ", _r(c2.y),
            " l", _r(c3.x), " ", _r(c3.y),
            " x"].join("");
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    radius *= _zoom;
    var _r = Math.round,
        x1 = x + (Math.cos(startAngle) * radius) - _halfZoom,
        y1 = y + (Math.sin(startAngle) * radius) - _halfZoom,
        x2 = x + (Math.cos(endAngle)   * radius) - _halfZoom,
        y2 = y + (Math.sin(endAngle)   * radius) - _halfZoom,
        c0, c1, c2, rx, ry;

    if (x1 === x2 && !anticlockwise) { x1 += 0.125; }
    c0 = this._map(x, y),
    c1 = this._map(x1, y1),
    c2 = this._map(x2, y2),
    rx = this._scaleX * radius,
    ry = this._scaleY * radius;
    this._path.push(anticlockwise ? "at " : "wa ",
                    _r(c0.x - rx), " ", _r(c0.y - ry), " ",
                    _r(c0.x + rx), " ", _r(c0.y + ry), " ",
                    _r(c1.x), " ", _r(c1.y), " ",
                    _r(c2.x), " ", _r(c2.y));
  },

  fill: function() {
    var vml = "", path = this._path.join(""), zindex = 0,
        mix = Composite[this[GLOBAL_COMPO]] || 1, c,
        fillStyle = this[FILL_STYLE];

    switch (mix) {
    case  5: zindex = --this._zindex; break;  //  5: destination-over
    case 11: this._clear(); break;            // 11: copy
    }

    if (typeof fillStyle === "string") {
      c = _colorCache[fillStyle] ||
              (_colorCache[fillStyle] = _buildColor(_parseColor(fillStyle), UU.COLOR.HEX_ALPHA));
      vml = [VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex, VML_FILL,
                VML_COORD, VML_PATH, path,
              VML_VFILL, VML_COLOR_HEAD, c[0], VML_OPACITY, c[1] * this[GLOBAL_ALPHA], 
              VML_END_SHAPE].join("");
    } else {
      switch (fillStyle._type) {
      case 1: vml = this._linearGradientFill(fillStyle, path, 0, mix, zindex); break;
      case 2: vml = this._radialGradientFill(fillStyle, path, 0, mix, zindex); break;
      case 3: vml = this._patternFill(fillStyle, path, 0, mix, zindex); break;
      }
    }
    if (vml) {
      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
    this._path = [];
  },
  _linearGradientFill: function(style, path, wire, mix, zindex) {
    var brush,
        fp      = style._param,
        color   = this._buildColor(style._colorStop),
        // @see http://d.hatena.ne.jp/uupaa/20080803/1217693950
        angle   = Math.atan2(Math.pow(fp.x1 - fp.x0, 2),
                             Math.pow(fp.y1 - fp.y0, 2)) * Math.toDegrees;
    if (fp.x0 > fp.x1) { angle += 90; }
    if (fp.y0 > fp.y1) { angle += 90; }
    if (angle >= 360) { angle -= 360; }

    if (wire) {
      brush = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'solid', VML_COLORS, color,
               VML_OPACITY, this[GLOBAL_ALPHA],
               VML_ANGLE, angle, this._strokeProps()].join("");
    } else {
      brush = [VML_VFILL, VML_TYPE_HEAD, 'gradient" method="sigma" focus="0%', VML_COLORS, color,
               VML_OPACITY, this[GLOBAL_ALPHA],
               VML_ANGLE, angle].join("");
    }
    return [VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex, VML_COORD,
            wire ? VML_STROKE : VML_FILL, VML_PATH, path,
            brush, VML_END_SHAPE].join("");
  },
  _radialGradientFill: function(style, path, wire, mix, zindex) {
    var brush,
        rv = [], fp = style._param, fsize, fposX, fposY, v,
        color   = this._buildColor(style._colorStop),
        zindex2 = 0,
        x       = fp.x1 - fp.r1,
        y       = fp.y1 - fp.r1,
        r1x     = fp.r1 * this._scaleX,
        r1y     = fp.r1 * this._scaleY,
        c0      = this._map(x, y);

    // focus
    if (!wire) {
      fsize = (fp.r0 / fp.r1);
      fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
      fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (style._colorStop.length) {
      v = style._colorStop[0];
      if (v.color[1] > 0.001) {
        // fill outside
        if (mix === 5) { zindex2 = --this._zindex; }
        rv.push(VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex2,
                VML_FILL, VML_COORD, VML_PATH, path,
                VML_VFILL, VML_TYPE_HEAD, 'solid',
                VML_COLOR, v.color[0], VML_OPACITY, v.color[1] * this[GLOBAL_ALPHA],
                VML_END_SHAPE);
      }
    }
    if (wire) {
      if (style._colorStop.length) {
        v = style._colorStop[Math.round(style._colorStop.length / 2) - 1]; // detect line color
        brush = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile', this._strokeProps(),
                 VML_OPACITY, v.color[1] * this[GLOBAL_ALPHA],
                 VML_COLOR, v.color[0]].join("");
      }
    } else {
        brush = [VML_VFILL, VML_TYPE_HEAD,
                 'gradientradial" method="sigma" focussize="', fsize , ',', fsize,
                 '" focusposition="', fposX, ',', fposY,
                 VML_OPACITY, this[GLOBAL_ALPHA], VML_COLORS, color].join("");
    }
    rv.push('<v:oval style="', VML_ZINDEX, zindex,
              ';position:absolute;left:', Math.round(c0.x / _zoom),
              'px;top:', Math.round(c0.y / _zoom), 'px;width:', r1x, 'px;height:', r1y,
              'px" stroked="', wire ? 't' : 'f',
              '" coordorigin="0,0" coordsize="11000,11000', brush, '" /></v:oval>');
    return rv.join("");
  },
  _patternFill: function(style, path, wire, mix, zindex) {
    var brush;

    if (wire) {
      brush = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile', this._strokeProps(),
               VML_OPACITY, this[GLOBAL_ALPHA], VML_SRC, style._src].join("");
    } else {
      brush = [VML_VFILL, VML_TYPE_HEAD, 'tile',
               VML_OPACITY, this[GLOBAL_ALPHA], VML_SRC, style._src].join("");
    }
    return [VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex,
            VML_COORD, wire ? VML_STROKE : VML_FILL, VML_PATH, path,
            brush, VML_END_SHAPE].join("");
  },

  stroke: function() {
    var vml = "", path = this._path.join(""), zindex = 0,
        mix = Composite[this[GLOBAL_COMPO]] || 1, c,
        strokeStyle = this[STROKE_STYLE];

    switch (mix) {
    case  5: zindex = --this._zindex; break;  //  5: destination-over
    case 11: this._clear(); break;            // 11: copy
    }

    if (typeof strokeStyle === "string") {
      c = _colorCache[strokeStyle] ||
              (_colorCache[strokeStyle] = _buildColor(_parseColor(strokeStyle), UU.COLOR.HEX_ALPHA));
      vml = [VML_SHAPE_STYLE, VML_STYLE, VML_ZINDEX, zindex,
                VML_COORD, VML_STROKE, VML_PATH, path,
              VML_VSTROKE, VML_COLOR_HEAD, c[0],
              VML_OPACITY, c[1] * this[GLOBAL_ALPHA], this._strokeProps(),
              VML_END_SHAPE].join("");
    } else {
      switch (strokeStyle._type) {
      case 1: vml = this._linearGradientFill(strokeStyle, path, 1, mix, zindex); break;
      case 2: vml = this._radialGradientFill(strokeStyle, path, 1, mix, zindex); break;
      case 3: vml = this._patternFill(strokeStyle, path, 1, mix, zindex); break;
      }
    }
    if (vml) {
      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
    this._path = [];
  },

  clip: function() {
    this._clipPath = this._clipRect + " x " + this._path.join("");
  },
  _clippy: function(vml) {
    return [vml, VML_SHAPE_STYLE, VML_STYLE, VML_FILL, VML_COORD, VML_PATH, this._clipPath,
            VML_VFILL, VML_TYPE_HEAD, 'solid', VML_COLOR, this.xClipStyle,
            VML_END_SHAPE].join("");
  },
  isPointInPath: function(x, y) {
    // not impl
  },

  // === Text ==============================================
  fillText: function(text, x, y, maxWidth) {
    var vml;
    if (typeof this[FILL_STYLE] === "string") {
      vml = this._fillText(text, x, y, maxWidth, this[FILL_STYLE], 0);
    } else {
/* not impl
      switch (this[FILL_STYLE]._type) {
      case 1: vml = this._linearGradientFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      case 2: vml = this._radialGradientFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      case 3: vml = this._patternFillText(text, x, y, maxWidth, this[FILL_STYLE], 0); break;
      }
*/
    }
//alert(vml);
    if (vml) {
      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
  },
  _fillText: function(text, x, y, maxWidth, style, wire) {
    text = text.replace(/( |\t|\v|\f|\r\n|\r|\n)/g, " ");
    var c       = _colorCache[style] ||
                    (_colorCache[style] = _buildColor(_parseColor(style), UU.COLOR.HEX_ALPHA)),
        zindex  = 0,
        align   = TextAlign[this[TEXT_ALIGN]] || 1,
        font    = parseFontCSS(this[FONT], 0),
        fontCSS = buildFontCSS(font),
        metric  = textMetric(text, fontCSS),
        w, h, offX = 0, tune;

    tune = fontScalFineTuning(font.FontSize, 1);

    w = metric.w * this.xFontScaleW;
    h = metric.h * this.xFontScaleH * tune.scale;
    if (align === 2) {
      offX = w / 2;
    } else if (align === 3) {
      offX = w;
    }

    switch (Composite[this[GLOBAL_COMPO]] || 1) {
    case  5: zindex = --this._zindex; break; // 5:destination-over
    case 11: this._clear(); break; // 11:copy
    }

    return [VML_SHAPE_STYLE, VML_ZINDEX, zindex, ';position:absolute;width:', w, 'px;height:', h,
              'px;left:', x - offX, 'px;top:', y + this.xTextMarginTop + tune.margin,
              'px;', wire ? VML_STROKE : VML_FILL,
              '" coordSize="21600,21600" o:spt="136" strokeColor="', c[0], '" fillColor="', c[0],
              VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
            '"><v:textpath style="font:', fontCSS, '" string="', text,
            VML_END_SHAPE].join("");
  },

  strokeText: function(text, x, y, maxWidth) {
    var vml;
    if (typeof this[STROKE_STYLE] === "string") {
      vml = this._fillText(text, x, y, maxWidth, this[STROKE_STYLE], 1);
    } else {
/* not impl
      switch (this[FILL_STYLE]._type) {
      case 1: vml = this._linearGradientFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      case 2: vml = this._radialGradientFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      case 3: vml = this._patternFillText(text, x, y, maxWidth, this[STROKE_STYLE], 1); break;
      }
*/
    }
    if (vml) {
      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
  },

  measureText: function(text) {
    var metric = textMetric(text, this[FONT]),
        w = metric.w * this.xFontScaleW,
        h = metric.h * this.xFontScaleH;
    return new VMLTextMetrics(w, h);
  },

  // drawing images
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var vml = "", a = arguments,
        dx, dy, dw, dh, sx, sy, sw, sh, iw, ih, method;

    if ("src" in image) { // image is HTMLImageElement
      iw = image.width;
      ih = image.height;
      switch (a.length) {
      case 3: dx = a[1], dy = a[2], dw = iw, dh = ih,
              sx = 0,    sy = 0,    sw = iw, sh = ih, method = "image"; break;
      case 5: dx = a[1], dy = a[2], dw = a[3], dh = a[4],
              sx = 0,    sy = 0,    sw = iw, sh = ih, method = "scale"; break;
      case 9: dx = a[5], dy = a[6], dw = a[7], dh = a[8],
              sx = a[1], sy = a[2], sw = a[3], sh = a[4], method = "scale"; break;
      default: throw "";
      }
      vml = this._drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh, iw, ih, method);
      this._elm.insertAdjacentHTML("beforeEnd", this._clipPath ? this._clippy(vml) : vml);
    }
  },
  _drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh, ew, eh, method) {
    var me = this, rv = [], _r = Math.round, c0 = this._map(dx, dy),
        zindex = 0,
        prefix = "filter:progid:DxImageTransform.Microsoft", // filter prefix
        sizeTrans = (sx || sy); // 0: none size transform, 1: size transform

    function trans(x, y, w, h) {
      var m = me._mtx,
          _r = Math.round,
          c1 = me._map(x, y),
          c2 = me._map(x + w, y),
          c3 = me._map(x, y + h),
          c4 = me._map(x + w, y + h),
          mx = [  "M11='", m[0][0], "',M12='", m[1][0],
                "',M21='", m[0][1], "',M22='", m[1][1],
                "',Dx='", _r(c1.x / _zoom), "',Dy='", _r(c1.y / _zoom), "'"],
          rv = ["padding:0 ", _r(Math.max(c1.x, c2.x, c3.x, c4.x) / _zoom), "px ",
                              _r(Math.max(c1.y, c2.y, c3.y, c4.y) / _zoom), "px 0;",
                "filter:progid:DXImageTransform.Microsoft.Matrix(", mx.join(""), ",sizingmethod='clip')"];
      return rv.join("");
    }

    switch (Composite[this[GLOBAL_COMPO]] || 1) {
    case  5: zindex = --this._zindex; break; // 5:destination-over
    case 11: this._clear(); break; // 11:copy
    }

    if (this._mtxEffected) {
      rv.push('<div style="z-index:', zindex, ';position:absolute;', trans(dx, dy, dw, dh), '">');
    } else {
      rv.push('<div style="z-index:', zindex, ';position:absolute;', // 1:1 scale
                          "top:", _r(c0.y / _zoom), "px;left:", _r(c0.x / _zoom), "px", '">')
    }
    rv.push('<div style="position:relative;overflow:hidden;width:',
                         _r(dw), 'px;height:', _r(dh), 'px">');

    if (sizeTrans) {
      rv.push('<div style="width:',  Math.cos(dw + sx * dw / sw), 'px;',
                          'height:', Math.cos(dh + sy * dh / sh), 'px;',
                          prefix, '.Matrix(Dx=', -sx * dw / sw, ',Dy=', -sy * dh / sh, ')">');
    }
    rv.push('<div style="width:', _r(ew * dw / sw), 'px;',
                        'height:', _r(eh * dh / sh), 'px;',
                        prefix, '.AlphaImageLoader(src=', image.src, ',sizingMethod=' + method + ')"></div>');
    rv.push(sizeTrans ? "</div>" : "", "</div></div>");
    return rv.join("");
  },

  // === Pixel manipulation ================================
  createImageData: function(sw, sh) {
    // not impl
  },

  getImageData: function(sx, sy, sw, sh) {
    // not impl
  },

  putImageData: function(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    // not impl
  },

  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new VMLGrad(1, // 1:gradient
                       { x0: x0, y0: y0, x1: x1, y1: y1 });
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new VMLGrad(2, // 2:gradientradial
                       { x0: x0, y0: y0, r0: r0,
                         x1: x1, y1: y1, r1: r1 });
  },

  createPattern: function(image, repetition) {
    return new VMLPatt(image, repetition);
  },

  _buildColor: function(ary) {
    var rv = [], i = 0, iz = ary.length;
    for (; i < iz; ++i) {
      rv.push(ary[i].offset + " " + ary[i].color[0]);
    }
    return rv.join(",");
  },

  _map: function(x, y) {
    return {
      // x: x * m11 + y * m21 + offsetX
      // y: x * m12 + y * m22 + offsetY
      x: _zoom * (x * this._mtx[0][0] + y * this._mtx[1][0] + this._mtx[2][0]) - _halfZoom,
      y: _zoom * (x * this._mtx[0][1] + y * this._mtx[1][1] + this._mtx[2][1]) - _halfZoom
    }
  },

  // clearRect(all) + beginPath + moveTo
  xClearBegin: function(x, y) {
    if (this._view) {
      // inline clearRect(all)
      this._elm.innerHTML = ""; // clear all
      this._zindex = 0;
      // inline beginPath + moveTo
      var _r = Math.round, c0 = this._map(x, y);
      this._path = ["m ", _r(c0.x), " ", _r(c0.y)];
      this._px = x;
      this._py = y;
    }
  },

  _strokeProps: function() {
    return ['" weight="', this[LINE_WIDTH] * this._lineScale,
            'px" endcap="', VMLCaps[this[LINE_CAP]] || "square",
            '" joinstyle="', this[LINE_JOIN],
            '" miterlimit="', this[MITER_LIMIT]].join("");
  }
};

function VMLGrad(type, param) {
  this._type   = type;
  this._param  = param;
  this._colorStop  = [];
}

VMLGrad.prototype.addColorStop = function(offset, color) {
  function fn(a, b) { return a.offset - b.offset; }
  // collision of the offset is evaded
  var v, i = 0, iz = this._colorStop.length, c;
  for (; i < iz; ++i) {
    v = this._colorStop[i];
    if (v.offset === offset) {
      if (offset < 1 && offset > 0) {
        offset += iz / 1000;
      }
    }
  }
  c = _colorCache[color] ||
          (_colorCache[color] = _buildColor(_parseColor(color), UU.COLOR.HEX_ALPHA));
  this._colorStop.push({ offset: 1 - offset, color: c });
  this._colorStop.sort(fn);
};

function VMLPatt(image /* HTMLImageElement */, repetition /* = undefined */) {
  repetition = repetition || "repeat";
  switch (repetition) {
  case "repeat": break;
  default: throw "";
  }

  this._type = 3; // 3:tile

  if ("src" in image) { // HTMLImageElement
    if ("uuIEBoostAlphaPNGSrc" in image) { // special attr by uupaa.js
      this._src = image.uuIEBoostAlphaPNGSrc;
    } else {
      this._src = image.src;
    }
    this._repeat = repetition;
  } else if ("getContext" in image) { // HTMLCanvasElement
    throw "";
  }
}

function VMLTextMetrics(w, h) {
  this.width = w;
  this.height = h;
}

function initCanvas() {
  // --- IE part ---
  if (!uudoc.namespaces["v"]) {
    uudoc.namespaces.add("v", "urn:schemas-microsoft-com:vml");
  }
  if (!uudoc.namespaces["o"]) {
    uudoc.namespaces.add("o", "urn:schemas-microsoft-com:office:office");
  }
  uudoc.createStyleSheet().cssText =
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\\:*{behavior:url(#default#VML)}"+
    "o\\:*{behavior:url(#default#VML)}";

  window.CanvasError = function(sender, arg) {
    var e = uudoc.getElementById("output"),
        msg = ["type=", arg.ErrorType,
               "code=", arg.ErrorCode,
               "msg=",  arg.ErrorMessage].join(" ");
    if (e) {
      e.innerHTML = msg;
    } else if (UU.CONFIG.DEBUG_MODE) {
      alert(msg);
    }
  }

  if (/loaded|complete/.test(uudoc.readyState)) {
    setTimeout(initCanvasPhase2, 0); // lazy
  }
  // delay
  uudoc.attachEvent("onreadystatechange", function() {
    if (/loaded|complete/.test(uudoc.readyState)) {
      initCanvasPhase2();
    }
  });
};

function initCanvasPhase2() {
/*
  var e = uudoc.getElementsByTagName("canvas"),
      v, i = 0, ez = e.length, vml = 0, ag = 0;
  if (ez) {
    for (; i < ez; ++i) {
      v = e[i];
      if (!v.getContext) {
        if (!_agEnable || (" " + v.className + " ").indexOf(" vml ") > -1) {
          VMLInitDynamicElement(v);
          ++vml;
        } else {
          AgInitDynamicElement(v);
          ++ag;
        }
      }
    }
  }
  if (!ag) {
    ++uu.canvas._ready;
  }
 */
  var nodeList = uudoc.getElementsByTagName("canvas"),
      v, i = 0, vml = 0, ag = 0;
  while ( (v = nodeList[i++]) ) {
    if (!v.getContext) {
      if (!_agEnable || (" " + v.className + " ").indexOf(" vml ") > -1) {
        VMLInitDynamicElement(v);
        ++vml;
      } else {
        AgInitDynamicElement(v);
        ++ag;
      }
    }
  }
  if (!ag) {
//  ++uu.canvas._ready;
    uu.canvasReady = true;
  }
}

// --- export ---
uu.canvas.Ag2D = Ag2D;
uu.canvas.AgGradient = AgGrad;
uu.canvas.AgPattern = AgPatt;
uu.canvas.AgTextMetrics = AgTextMetrics;
uu.canvas.VML2D = VML2D;
uu.canvas.VMLGradient = VMLGrad;
uu.canvas.VMLPattern = VMLPatt;
uu.canvas.VMLTextMetrics = VMLTextMetrics;
if (UU.IE) {
  window.CanvasRenderingContext2D = function() {};
  window.CanvasGradient = function() {};
  window.CanvasPattern = function() {};
}

// --- initialize ---
UU.IE && initCanvas();

})(); // end (function(){})() scope.
