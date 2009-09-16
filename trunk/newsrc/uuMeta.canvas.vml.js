
// === uuMeta.canvas.vml ===
// depend: uuMeta, uuMeta.color, uuMeta.style, uuMeta.image, uuMeta.canvas
(function uuMetaCanvasVMLScope() {
var _mm = uuMeta,
    _VML2D = uuMeta.canvas.VML2D.prototype,
    _impl = uuMeta.canvas.impl,
    _math = Math,
    _round = _math.round,
    _colorCache = _impl.colorCache,
    _ZOOM           = 10,
    _HALF_ZOOM      = 5,
    _SHADOW_WIDTH   = 4,
    _TO_DEGREES     = 180 / _math.PI, // Math.toDegrees - from java.math
    _GLOBAL_ALPHA   = "globalAlpha",
    _GLOBAL_COMPO   = "globalCompositeOperation",
    _STROKE_STYLE   = "strokeStyle",
    _FILL_STYLE     = "fillStyle",
    _SHADOW_OFFSET_X= "shadowOffsetX",
    _SHADOW_OFFSET_Y= "shadowOffsetY",
    _SHADOW_COLOR   = "shadowColor",
    _FILL_FUNC      = { 1: _linearGradientFill,
                        2: _radialGradientFill,
                        3: _patternFill },
    _COMPOSITES     = { "source-over": 0, "destination-over": 4, copy: 10 },
    _CAPS           = { square: "square", butt: "flat", round: "round" },
    // fragments
    _VML_COORD      = '" coordsize="100,100',
    _VML_FILL       = '" filled="t" stroked="f',
    _VML_STROKE     = '" filled="f" stroked="t',
    _VML_PATH       = '" path="',
    _VML_COLOR      = '" color="',
    _VML_COLORS     = '" colors="',
    _VML_OPACITY    = '" opacity="',
    _VML_ANGLE      = '" angle="',
    _VML_FILLTYPE_HEAD = ' filltype="',
    _VML_TYPE_HEAD  = ' type="',
    _VML_COLOR_HEAD = ' color="',
    _VML_BASE_STYLE = ' style="position:absolute;z-index:',
    _VML_SHAPE_STYLE = '<v:shape style="position:absolute;' +
                        'width:10px;height:10px;z-index:',
    _VML_END_SHAPE  = '" /></v:shape>',
    _VML_VSTROKE    = '"><v:stroke',
    _VML_VFILL      = '"><v:fill',
    _TEXT_SPACE     = /(\t|\v|\f|\r\n|\r|\n)/g,
    _FILTER_PREFIX  = _mm.ua.ie8 ? "-ms-filter:'" : "filter:",
    _FILTER_POSTFIX = _mm.ua.ie8 ? "'" : "",
    _DX_PFX         = 'progid:DXImageTransform.Microsoft.';

// uuMeta.canvas.VML2D._rect
function _rect(me, x, y, w, h) {
  var m = me._mtx,
      m0 = m[0], m1 = m[1],
      m3 = m[3], m4 = m[4],
      m6 = m[6], m7 = m[7],
      zm = _ZOOM,
      hm = _HALF_ZOOM,
      xw = x + w,
      yh = y + h,
      c0x = (x  * m0 + y  * m3 + m6) * zm - hm,
      c0y = (x  * m1 + y  * m4 + m7) * zm - hm,
      c1x = (xw * m0 + y  * m3 + m6) * zm - hm,
      c1y = (xw * m1 + y  * m4 + m7) * zm - hm,
      c2x = (xw * m0 + yh * m3 + m6) * zm - hm,
      c2y = (xw * m1 + yh * m4 + m7) * zm - hm,
      c3x = (x  * m0 + yh * m3 + m6) * zm - hm,
      c3y = (x  * m1 + yh * m4 + m7) * zm - hm;

  // http://d.hatena.ne.jp/uupaa/20090822
  return [" m", (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0,
          " l", (c1x+(c1x<0?-0.49:0.5))|0, " ", (c1y+(c1y<0?-0.49:0.5))|0,
          " l", (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0,
          " l", (c3x+(c3x<0?-0.49:0.5))|0, " ", (c3y+(c3y<0?-0.49:0.5))|0,
          " x"].join("");
}

// inner - map
function _map(me, x, y) {
  var m = me._mtx;

  return {
    x: _round((x * m[0] + y * m[3] + m[6]) * _ZOOM - _HALF_ZOOM),
    y: _round((x * m[1] + y * m[4] + m[7]) * _ZOOM - _HALF_ZOOM)
  };
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
  w = parseInt(w);
  h = parseInt(h);

  if ((!x && !y &&
       w == this.canvas.width &&
       h == this.canvas.height)) {
    _clear(this); // clear all
  } else {
    var fg, zindex = 0,
        c = _mm.style.getBackgroundColor(this._elm, 1);

    switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: _clear(this);
    }

    fg = [_VML_SHAPE_STYLE, zindex,
          _VML_FILL, _VML_COORD, _VML_PATH, _rect(this, x, y, w, h),
          _VML_VFILL, _VML_TYPE_HEAD, 'solid',
          _VML_COLOR, c[0], _VML_OPACITY, c[1] * this[_GLOBAL_ALPHA],
          _VML_END_SHAPE].join("");

    !this.xFlyweight &&
      this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._elm.insertAdjacentHTML("BeforeEnd", fg);
  }
}

// uuMeta.canvas.VML2D._clear
function _clear(me) {
  me._history = [];
  me._zindex = 0;
  me._elm.innerHTML = ""; // clear all
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
  this.fill(1, _rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
  var path = _rect(this, x, y, w, h);

  this._px = x;
  this._py = y;

  // When all canvases are painted out,
  // the fillStyle(background-color) is preserved.
  if (path === this._clipRect) { // full size path
    if (typeof this[_FILL_STYLE] === "string") {
      this.xClipStyle = this[_FILL_STYLE]; // keep bgcolor
    }
  }
  this.fill(0, path);
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
  this._path.push(" x");
}

// CanvasRenderingContext2D.prototype.moveTo
function moveTo(x, y) {
  var m = this._mtx, // inlining: this._map(x, y)
      zm = _ZOOM,
      hm = _HALF_ZOOM,
      cx = (x * m[0] + y * m[3] + m[6]) * zm - hm,
      cy = (x * m[1] + y * m[4] + m[7]) * zm - hm;

  // http://d.hatena.ne.jp/uupaa/20090822
  this._path.push("m ", (cx+(cx<0?-0.49:0.5))|0, " ",
                        (cy+(cy<0?-0.49:0.5))|0);
  this._px = x;
  this._py = y;
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
  var m = this._mtx, // inlining: this._map(x, y)
      zm = _ZOOM,
      hm = _HALF_ZOOM,
      cx = (x * m[0] + y * m[3] + m[6]) * zm - hm,
      cy = (x * m[1] + y * m[4] + m[7]) * zm - hm;

  // http://d.hatena.ne.jp/uupaa/20090822
  this._path.push("l ", (cx+(cx<0?-0.49:0.5))|0, " ",
                        (cy+(cy<0?-0.49:0.5))|0);
  this._px = x;
  this._py = y;
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
  var cp1x = this._px + 2.0 / 3.0 * (cpx - this._px),
      cp1y = this._py + 2.0 / 3.0 * (cpy - this._py),
      cp2x = cp1x + (x - this._px) / 3.0,
      cp2y = cp1y + (y - this._py) / 3.0,
      m = this._mtx,
      m0 = m[0], m1 = m[1],
      m3 = m[3], m4 = m[4],
      m6 = m[6], m7 = m[7],
      zm = _ZOOM,
      hm = _HALF_ZOOM,
      c0x = (x    * m0 + y    * m3 + m6) * zm - hm,
      c0y = (x    * m1 + y    * m4 + m7) * zm - hm,
      c1x = (cp1x * m0 + cp1y * m3 + m6) * zm - hm,
      c1y = (cp1x * m1 + cp1y * m4 + m7) * zm - hm,
      c2x = (cp2x * m0 + cp2y * m3 + m6) * zm - hm,
      c2y = (cp2x * m1 + cp2y * m4 + m7) * zm - hm;

  // http://d.hatena.ne.jp/uupaa/20090822
  this._path.push("c ",
      (c1x+(c1x<0?-0.49:0.5))|0, " ", (c1y+(c1y<0?-0.49:0.5))|0, " ",
      (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0, " ",
      (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0);
  this._px = x;
  this._py = y;
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
  var c0 = _map(this, x, y),
      c1 = _map(this, cp1x, cp1y),
      c2 = _map(this, cp2x, cp2y);

  this._path.push("c ", c1.x, " ", c1.y, " ",
                        c2.x, " ", c2.y, " ",
                        c0.x, " ", c0.y);
  this._px = x;
  this._py = y;
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
  this._path.push(_rect(this, x, y, w, h));
  this._px = x;
  this._py = y;
}

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
  radius *= _ZOOM;
  var x1 = x + (_math.cos(startAngle) * radius) - _HALF_ZOOM,
      y1 = y + (_math.sin(startAngle) * radius) - _HALF_ZOOM,
      x2 = x + (_math.cos(endAngle)   * radius) - _HALF_ZOOM,
      y2 = y + (_math.sin(endAngle)   * radius) - _HALF_ZOOM,
      c0, c1, c2, rx, ry;

  if (!anticlockwise) {
    // fix "wa" bug
    (x1.toExponential(5) === x2.toExponential(5)) && (x1 += 0.125);
    (y1.toExponential(5) === y2.toExponential(5)) && (y1 += 0.125);
  }
  c0 = _map(this, x, y),
  c1 = _map(this, x1, y1),
  c2 = _map(this, x2, y2),
  rx = this._scaleX * radius,
  ry = this._scaleY * radius;
  this._path.push(anticlockwise ? "at " : "wa ",
                  c0.x - rx, " ", c0.y - ry, " ",
                  c0.x + rx, " ", c0.y + ry, " ",
                  c1.x, " ", c1.y, " ",
                  c2.x, " ", c2.y);
}

// CanvasRenderingContext2D.prototype.fill
function fill(wire, path) {
  path = path || this._path.join("");

  var rv = [], fg, zindex = 0, mix, c,
      style = wire ? this[_STROKE_STYLE]
                   : this[_FILL_STYLE],
      // for shadow
      si = 0, so = 0, sd = 0, sx = 0, sy = 0,
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  if ( (mix = _COMPOSITES[this[_GLOBAL_COMPO]]) ) {
    (mix === 4) ? (zindex = --this._zindex) : _clear(this);
  }

  if (typeof style === "string") {
    c = _colorCache[style] || _impl.parseColor(style);

    if (sc[1]) {
      sx = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_X];
      sy = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
        rv.push(_VML_SHAPE_STYLE, zindex,
                ';left:', sx,
                'px;top:', sy, 'px',
                wire ? _VML_STROKE : _VML_FILL,
                _VML_COORD, _VML_PATH, path,
                wire ? _VML_VSTROKE : _VML_VFILL,
                _VML_COLOR_HEAD, sc[0],
                _VML_OPACITY, so.toFixed(2),
                wire ? _buildStrokeProps(this) : "",
                _VML_END_SHAPE);
      }
    }
    rv.push(_VML_SHAPE_STYLE, zindex,
            wire ? _VML_STROKE : _VML_FILL,
            _VML_COORD, _VML_PATH, path,
            wire ? _VML_VSTROKE : _VML_VFILL,
            _VML_COLOR_HEAD, c[0],
            _VML_OPACITY, c[1] * this[_GLOBAL_ALPHA],
            wire ? _buildStrokeProps(this) : "",
            _VML_END_SHAPE);

    fg = rv.join("");
  } else {
    fg = _FILL_FUNC[style._type](this, style, path, wire, mix, zindex, sc);
  }
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  this._elm.insertAdjacentHTML("BeforeEnd", fg);
}

// inner - Linear Gradient Fill
function _linearGradientFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [],
      fp = style._param,
      c0 = _map(me, fp.x0, fp.y0),
      c1 = _map(me, fp.x1, fp.y1),
      angle = _math.atan2(c1.x - c0.x, c1.y - c0.y) * _TO_DEGREES,
      color = _buildGradationColor(style._colorStop),
      // for shadow
      si = 0, siz = _SHADOW_WIDTH, so = 0, sd = 0, sx = 0, sy = 0;

  (angle < 0) && (angle += 360);

  if (shadowColor[1]) {
    sx = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_X];
    sy = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_Y];
    so = me.xShadowOpacityFrom;
    sd = me.xShadowOpacityDelta;

    if (wire) {
      siz = me.lineWidth,
      sd = 0.2 / siz; // opacity from 0.05 to 0.25
    }
    for (; si < siz; so += sd, --sx, --sy, ++si) {
      rv.push(_VML_SHAPE_STYLE, zindex,
              ';left:', sx, 'px;top:', sy, 'px',
              _VML_COORD, wire ? _VML_STROKE : _VML_FILL,
              _VML_PATH, path,
                // brush
                wire ? _VML_VSTROKE : _VML_VFILL,
                wire ? _VML_FILLTYPE_HEAD : _VML_TYPE_HEAD,
                wire ? 'solid' : 'gradient" method="sigma" focus="0%',
                _VML_COLOR, shadowColor[0],
                _VML_OPACITY, so.toFixed(2),
                _VML_ANGLE, angle,
                wire ? _buildStrokeProps(me) : "",
              _VML_END_SHAPE);
    }
  }
  rv.push(_VML_SHAPE_STYLE, zindex,
          _VML_COORD, wire ? _VML_STROKE : _VML_FILL,
          _VML_PATH, path,
            // brush
            wire ? _VML_VSTROKE : _VML_VFILL,
            wire ? _VML_FILLTYPE_HEAD : _VML_TYPE_HEAD,
            wire ? 'solid' : 'gradient" method="sigma" focus="0%',
            wire ? _VML_COLOR : _VML_COLORS,
            wire ? _impl.parseColor(me.xMissColor)[0] : color,
            _VML_OPACITY, me[_GLOBAL_ALPHA],
            '" o:opacity2="', me[_GLOBAL_ALPHA], // fill only
            _VML_ANGLE, angle,
            wire ? _buildStrokeProps(me) : "",
          _VML_END_SHAPE);
  return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [], brush, v,
      fp = style._param, fsize, fposX, fposY, focusParam = "",
      color = _buildGradationColor(style._colorStop),
      zindex2 = 0,
      x = fp.x1 - fp.r1,
      y = fp.y1 - fp.r1,
      r1x = fp.r1 * me._scaleX,
      r1y = fp.r1 * me._scaleY,
      c0 = _map(me, x, y),
      // for shadow
      si = 0, siz = _SHADOW_WIDTH, so = 0, sd = 0, sx = 0, sy = 0;

  // focus
  if (!wire) {
    fsize = (fp.r0 / fp.r1);
    fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
    fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
  }

  if (shadowColor[1]) {
    sx = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_X];
    sy = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_Y];
    so = me.xShadowOpacityFrom;
    sd = me.xShadowOpacityDelta;

    if (wire) {
      siz = me.lineWidth;
      sd = 0.2 / siz; // opacity from 0.05 to 0.25
    }

    if (wire) {
      focusParam = _VML_VSTROKE + _VML_FILLTYPE_HEAD + 'tile' +
                   _buildStrokeProps(me);
    } else {
      focusParam = [_VML_VFILL, _VML_TYPE_HEAD,
                    'gradientradial" method="sigma" focussize="',
                    fsize, ',', fsize,
                    '" focusposition="', fposX, ',', fposY].join("");
    }
    for (; si < siz; so += sd, --sx, --sy, ++si) {
      rv.push('<v:oval', _VML_BASE_STYLE, zindex,
              ';left:', _round(c0.x / _ZOOM) + sx,
              'px;top:', _round(c0.y / _ZOOM) + sy,
              'px;width:', r1x, 'px;height:', r1y,
              'px', wire ? _VML_STROKE : _VML_FILL,
              '" coordsize="11000,11000',
              focusParam, _VML_OPACITY, so.toFixed(2),
              _VML_COLOR, shadowColor[0],
              '" /></v:oval>');
    }
  }

  if (wire) {
    // VML has not stroke gradient
    brush = [_VML_VSTROKE, _VML_FILLTYPE_HEAD, 'tile',
             _buildStrokeProps(me),
             _VML_OPACITY, me[_GLOBAL_ALPHA],
             _VML_COLOR, _impl.parseColor(me.xMissColor)[0]].join("");
  } else {
    // fill outside
    if (style._colorStop.length) {
      v = style._colorStop[0]; // 0 = outer color
      if (v.color[1] > 0.001) {
        if (mix === 4) { zindex2 = --me._zindex; }
        rv.push(_VML_SHAPE_STYLE, zindex2,
                _VML_FILL, _VML_COORD, _VML_PATH, path,
                _VML_VFILL, _VML_TYPE_HEAD, 'solid',
                _VML_COLOR, v.color[0],
                _VML_OPACITY, v.color[1] * me[_GLOBAL_ALPHA],
                _VML_END_SHAPE);
      }
    }
    brush = [_VML_VFILL, _VML_TYPE_HEAD,
             'gradientradial" method="sigma" focussize="',
             fsize , ',', fsize,
             '" focusposition="', fposX, ',', fposY,
             _VML_OPACITY, me[_GLOBAL_ALPHA],
             '" o:opacity2="', me[_GLOBAL_ALPHA],
             _VML_COLORS, color].join("");
  }
  rv.push('<v:oval', _VML_BASE_STYLE, zindex, // need z-index
          ';left:', _round(c0.x / _ZOOM),
          'px;top:', _round(c0.y / _ZOOM),
          'px;width:', r1x, 'px;height:', r1y, 'px',
          wire ? _VML_STROKE : _VML_FILL,
          '" coordsize="11000,11000', brush,
          '" /></v:oval>');
  return rv.join("");
}

// inner - Pattern Fill
function _patternFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [],
      // for shadow
      si = 0, so = 0, sd = 0, sx = 0, sy = 0;

  if (shadowColor[1]) {
    sx = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_X];
    sy = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_Y];
    so = me.xShadowOpacityFrom;
    sd = me.xShadowOpacityDelta;

    for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
      rv.push(_VML_SHAPE_STYLE, zindex,
              ';left:', sx, 'px;top:', sy, 'px',
              _VML_COORD,
              wire ? _VML_STROKE : _VML_FILL,
              _VML_PATH, path,
                // brush
                wire ? _VML_VSTROKE: _VML_VFILL,
                wire ? _VML_FILLTYPE_HEAD : _VML_TYPE_HEAD, 'solid',
                wire ? _buildStrokeProps(me) : "",
                _VML_COLOR, shadowColor[0],
                _VML_OPACITY, so.toFixed(2),
              _VML_END_SHAPE);
    }
  }

  rv.push(_VML_SHAPE_STYLE, zindex,
          _VML_COORD,
          wire ? _VML_STROKE : _VML_FILL,
          _VML_PATH, path,
            // brush
            wire ? _VML_VSTROKE : _VML_VFILL,
            wire ? _VML_FILLTYPE_HEAD : _VML_TYPE_HEAD, 'tile',
            _VML_OPACITY, me[_GLOBAL_ALPHA],
            '" src="', style._src,
            wire ? _buildStrokeProps(me) : "",
          _VML_END_SHAPE);

  return rv.join("");
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
  this._clipPath = this._clipRect + " x " + this._path.join("");
}

// inner -
function _clippy(me, fg) {
  if (!me.xClipStyle) {
    var bg = _mm.style.getBackgroundColor(me._elm, 1);

    me.xClipStyle = bg[0];
  }
  return [fg, '<v:shape style="position:absolute;width:10px;height:10px',
          _VML_FILL, _VML_COORD, _VML_PATH, me._clipPath,
          _VML_VFILL, _VML_TYPE_HEAD, 'solid', _VML_COLOR, me.xClipStyle,
          _VML_END_SHAPE].join("");
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth, wire) {
  text = text.replace(_TEXT_SPACE, " ");
  var style = wire ? this[_STROKE_STYLE] : this[_FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      rv = [], fg, c,
      align = this.textAlign, dir = "ltr",
      font = _impl.parseFont(this.font, this.canvas),
      m = this._mtx, zindex = 0,
      fp, c0, c1, // for grad
      skew = m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
             m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0',
      skewOffset,
      delta = 1000, left = 0, right = delta,
      offset = { x: 0, y: 0 },
      // for shadow
      si = 0, so = 0, sd = 0, sx = 0, sy = 0,
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = this._elm.uuCanvasDirection === dir ? "left" : "right"
  }
  switch (align) {
  case "center": left = right = delta / 2; break;
  case "right":  left = delta, right = 0.05;
  }
  if (this.textBaseline === "top") {
    // text margin-top fine tuning
    offset.y = font.size /
        (_impl.FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
         this.xTextMarginTop);
  }
  skewOffset = _map(this, x + offset.x, y + offset.y);

  if (sc[1]) {
    sx = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_X];
    sy = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_Y];
    so = _math.max(this.xShadowOpacityFrom + 0.9, 1);
    sd = this.xShadowOpacityDelta;

    for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
      rv.push('<v:line',
              _VML_BASE_STYLE, zindex, ';width:1px;height:1px;left:', sx,
              'px;top:', sy, 'px',
              _VML_FILL, '" from="', -left, ' 0" to="', right,
              ' 0.05" coordsize="100 100">',
              '<v:fill color="', sc[0],
              '" opacity="', so.toFixed(2), '" />',
              '<v:skew on="t" matrix="', skew ,'" ',
              ' offset="', _round(skewOffset.x / _ZOOM), ',',
                           _round(skewOffset.y / _ZOOM),
              '" origin="', left ,' 0" />',
              '<v:path textpathok="t" />',
              '<v:textpath on="t" string="', _impl.toHTMLEntity(text),
              '" style="v-text-align:', align,
              ';font:', _impl.toHTMLEntity(font.formal),
              '" /></v:line>');
    }
  }

  rv.push('<v:line',
          _VML_BASE_STYLE, zindex, ';width:1px;height:1px',
          _VML_FILL, '" from="', -left, ' 0" to="', right,
          ' 0.05" coordsize="100 100">');

  switch (types) {
  case 0:
    c = _colorCache[style] || _impl.parseColor(style);
    rv.push('<v:fill color="', c[0],
            '" opacity="', c[1] * this[_GLOBAL_ALPHA], '" />');
    break;
  case 1:
  case 2:
    fp = style._param;
    c0 = _map(this, fp.x0, fp.y0);
    c1 = _map(this, fp.x1, fp.y1);
    rv.push('<v:fill type="gradient" method="sigma" focus="0%',
            _VML_COLORS, _buildGradationColor(style._colorStop),
            _VML_OPACITY, this[_GLOBAL_ALPHA],
            '" o:opacity2="', this[_GLOBAL_ALPHA],
            _VML_ANGLE,
            _math.atan2(c1.x - c0.x, c1.y - c0.y) * _TO_DEGREES,
            '" />');
    break;
  case 3:
    rv.push('<v:fill position="0,0" type="tile" src="',
            style._src, '" />');
    break;
  }
  rv.push('<v:skew on="t" matrix="', skew ,'" ',
          ' offset="', _round(skewOffset.x / _ZOOM), ',',
                       _round(skewOffset.y / _ZOOM),
          '" origin="', left ,' 0" />',
          '<v:path textpathok="t" />',
          '<v:textpath on="t" string="', _impl.toHTMLEntity(text),
          '" style="v-text-align:', align,
          ';font:', _impl.toHTMLEntity(font.formal),
          '" /></v:line>');
  fg = rv.join("");
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  this._elm.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image) {
  var info = _impl.detectDrawImageArg.apply(this, arguments),
      method = info.az === 3 ? "image" : "scale",
      dx = info.dx,
      dy = info.dy,
      dw = info.dw,
      dh = info.dh,
      sx = info.sx,
      sy = info.sy,
      sw = info.sw,
      sh = info.sh,
      iw = info.dim.w,
      ih = info.dim.h,
      rv = [], fg, m,
      frag = [], sfrag, tfrag, // code fragment
      i = 0, iz, me = this, c0, zindex = 0,
      sizeTrans, // 0: none size transform, 1: size transform
      // for shadow
      si = 0, so = 0, sd = 0, shx = 0, shy = 0, shw = _SHADOW_WIDTH,
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  function trans(m, x, y, w, h) {
    var c1 = _map(me, x, y),
        c2 = _map(me, x + w, y),
        c3 = _map(me, x + w, y + h),
        c4 = _map(me, x, y + h);
    return [";padding:0 ",
            _round(_math.max(c1.x, c2.x, c3.x, c4.x) / _ZOOM), "px ",
            _round(_math.max(c1.y, c2.y, c3.y, c4.y) / _ZOOM), "px 0;",
            _FILTER_PREFIX, _DX_PFX, "Matrix(M11=", m[0], ",M12=", m[3],
              ",M21=", m[1], ",M22=", m[4],
              ",Dx=", _round(c1.x / _ZOOM),
              ",Dy=", _round(c1.y / _ZOOM), ")", _FILTER_POSTFIX].join("");
  }

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  if ("src" in image) { // image is HTMLImageElement
    c0 = _map(this, dx, dy);

    if (this.xImageRender) {
      rv.push(
        '<v:image', _VML_BASE_STYLE, zindex,
        ';width:',    dw,
        'px;height:', dh,
        'px;left:', _round(c0.x / _ZOOM),
        'px;top:',  _round(c0.y / _ZOOM),
        'px" coordsize="100,100',
        '" src="', image.src,
        '" cropleft="',   sx / iw,
        '" croptop="',    sy / ih,
        '" cropright="',  (iw - sx - sw) / iw,
        '" cropbottom="', (ih - sy - sh) / ih,
        '" />');
    } else {
      sizeTrans = (sx || sy); // 0: none size transform, 1: size transform
      tfrag = this._efx ? trans(this._mtx, dx, dy, dw, dh) : '';

      frag = [
        // shadow only
        '<div' + _VML_BASE_STYLE + (zindex - 10) +
            ';left:$1px;top:$2px' + tfrag + '">',
        '<div style="position:relative;overflow:hidden;width:' +
            _round(dw) + 'px;height:' + _round(dh) + 'px">',
        !sizeTrans ? "" : [
          '<div style="width:', _math.ceil(dw + sx * dw / sw),
            'px;height:', _math.ceil(dh + sy * dh / sh),
            'px;',
            _FILTER_PREFIX, _DX_PFX,
            'Matrix(Dx=', (-sx * dw / sw).toFixed(3),
                  ',Dy=', (-sy * dh / sh).toFixed(3), ')',
            _FILTER_POSTFIX, '">'].join(""),
        '<div style="width:' + _round(iw * dw / sw) +
            'px;height:' + _round(ih * dh / sh) + 'px;',
        // shadow only
        'background-color:' + sc[0] + ';' +
          _FILTER_PREFIX + _DX_PFX + 'Alpha(opacity=$3)' + _FILTER_POSTFIX,
        // alphaloader
        _FILTER_PREFIX + _DX_PFX + 'AlphaImageLoader(src=' +
          image.src + ',SizingMethod=' +
          method + ')' + _FILTER_POSTFIX,
        '"></div>' +
            (sizeTrans ? '</div>' : '') + '</div></div>'
      ];

      if (sc[1]) {
        shx = shw / 2 + this[_SHADOW_OFFSET_X];
        shy = shw / 2 + this[_SHADOW_OFFSET_Y];
        so = this.xShadowOpacityFrom;
        sd = this.xShadowOpacityDelta;

        sfrag = frag[0] + frag[1] + frag[2] + frag[3] +
                frag[4] + frag[6];
        for (; si < shw; so += sd, --shx, --shy, ++si) {
          rv.push(
            sfrag.replace(/\$1/, this._efx ? shx : _round(c0.x / _ZOOM) + shx)
                 .replace(/\$2/, this._efx ? shy : _round(c0.y / _ZOOM) + shy)
                 .replace(/\$3/, (so * 100).toFixed(2)));
        }
      }

      rv.push('<div', _VML_BASE_STYLE, zindex);
      if (this._efx) {
        rv.push(tfrag, '">');
      } else { // 1:1 scale
        rv.push(';top:', _round(c0.y / _ZOOM),
                'px;left:', _round(c0.x / _ZOOM), 'px">')
      }
      rv.push(frag[1], frag[2], frag[3], frag[5], frag[6]);
    }
    fg = rv.join("");
  } else {
    c0 = _map(this, dx, dy);
    switch (info.az) {
    case 3: // 1:1 scale
            rv.push('<div', _VML_BASE_STYLE, zindex,
                    ';left:', _round(c0.x / _ZOOM),
                    'px;top:', _round(c0.y / _ZOOM), 'px">')
            iz = image._ctx2d._history.length;

            for (; i < iz; ++i) {
              rv.push(image._ctx2d._history[i]);
            }
            rv.push('</div>');
            break;
    case 5:
            m = _impl.matrix2DMultiply(_impl.matrix2DScale(dw / iw, dh / ih),
                                       this._mtx);
            rv.push('<div', _VML_BASE_STYLE, zindex,
                    trans(m, dx, dy, dw, dh),
                    '"><div style="width:',  _round(iw * dw / sw),
                               'px;height:', _round(ih * dh / sh), 'px">');
            iz = image._ctx2d._history.length;

            for (; i < iz; ++i) {
              rv.push(image._ctx2d._history[i]);
            }
            rv.push('</div></div>');
            break;
    case 9: // buggy(not impl)
            m = _impl.matrix2DMultiply(_impl.matrix2DScale(dw / sw, dh / sh),
                                       this._mtx);
//          m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(dx, dy), m);
            rv.push('<div', _VML_BASE_STYLE, zindex,
                    ';overflow:hidden',
                    trans(m, dx, dy, dw, dh), '">');

            iz = image._ctx2d._history.length;

            for (; i < iz; ++i) {
              rv.push(image._ctx2d._history[i]);
            }
            rv.push('</div>');
            break;
    }
    fg = rv.join("");
/*
    // effect CSS::opacity and filter::opacity
    fg = fg.replace(/opacity=\"([\d\.]+)\"/g, function(m, opa) {
      return 'opacity="' + (opa * me[_GLOBAL_ALPHA]).toFixed(3) + '"';
    }).replace(/opacity=([\d\.]+)/g, function(m, opa) {
      return 'opacity=' + (opa * me[_GLOBAL_ALPHA]).toFixed(3);
    });
*/
  }
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  this._elm.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) {
  return new CanvasGradient(1, // 1:LinearGradient
                            { x0: x0, y0: y0,
                              x1: x1, y1: y1 }, 1);
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) {
  return new CanvasGradient(2, // 2:RadialGradient
                            { x0: x0, y0: y0, r0: r0,
                              x1: x1, y1: y1, r1: r1 }, 1);
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image, repetition) {
  return new CanvasPattern(image, repetition);
}

// inner - build Gradation Color
function _buildGradationColor(ary) {
  var rv = [], i = 0, iz = ary.length;

  for (; i < iz; ++i) {
    rv.push(ary[i].offset + " " + ary[i].color[0]);
  }
  return rv.join(",");
}

// inner - build stroke propertys
function _buildStrokeProps(obj) {
  var width = (obj.lineWidth * obj._lineScale).toFixed(2);

  return '" joinstyle="'  + obj.lineJoin +
         '" miterlimit="' + obj.miterLimit +
         '" weight="'     + width + 'px" endcap="' + _CAPS[obj.lineCap];
}

// --- initialize / export ---
_VML2D.clearRect = clearRect;
_VML2D.strokeRect = strokeRect;
_VML2D.fillRect = fillRect;
_VML2D.closePath = closePath;
_VML2D.moveTo = moveTo;
_VML2D.lineTo = lineTo;
_VML2D.quadraticCurveTo = quadraticCurveTo;
_VML2D.bezierCurveTo = bezierCurveTo;
_VML2D.rect = rect;
_VML2D.arc = arc;
_VML2D.fill = fill;
_VML2D.clip = clip;
_VML2D.fillText = fillText;
_VML2D.drawImage = drawImage;
_VML2D.createLinearGradient = createLinearGradient;
_VML2D.createRadialGradient = createRadialGradient;
_VML2D.createPattern = createPattern;
uuMeta.canvas.VML2D._rect = _rect;
uuMeta.canvas.VML2D._clear = _clear;

})(); // uuMeta.canvas.vml scope

