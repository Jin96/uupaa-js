
// === uuMeta.canvas.vml ===
// depend: uuMeta, uuMeta.color, uuMeta.style, uuMeta.image, uuMeta.canvas
(function uuMetaCanvasSilverlightScope() {
var _mm = uuMeta,
    _SL2D = uuMeta.canvas.SL2D.prototype,
    _impl = uuMeta.canvas.impl,
    _math = Math,
    _colorCache = _impl.colorCache,
    _SHADOW_WIDTH   = 4,
    _TO_DEGREES     = 180 / _math.PI, // Math.toDegrees - from java.math
    _GLOBAL_ALPHA   = "globalAlpha",
    _GLOBAL_COMPO   = "globalCompositeOperation",
    _STROKE_STYLE   = "strokeStyle",
    _FILL_STYLE     = "fillStyle",
    _SHADOW_OFFSET_X= "shadowOffsetX",
    _SHADOW_OFFSET_Y= "shadowOffsetY",
    _SHADOW_COLOR   = "shadowColor",
    _FONT_STYLES    = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    _FONT_WEIGHTS   = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                        lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                        "300": "Light", "400": "Normal", "500": "Medium",
                        "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                        "900": "Black" },
    _FILL_FUNC      = { 1: _linearGradientFill,
                        2: _radialGradientFill,
                        3: _patternFill },
    _COMPOSITES     = { "source-over": 0, "destination-over": 4, copy: 10 },
    _CAPS           = { square: "square", butt: "flat", round: "round" },
    // fragments
    _SL_FILL        = '" Fill="',
    _SL_STROKE      = '" Stroke="',
    _SL_DATA        = '" Data="',
    _SL_PATH_OPACITY  = '<Path Opacity="',
    _SL_CANVAS_ZINDEX = '<Canvas Canvas.ZIndex="',
    _SL_CANVAS_LEFT = '" Canvas.Left="',
    _SL_CANVAS_TOP  = '" Canvas.Top="',
    _TEXT_SPACE     = /(\t|\v|\f|\r\n|\r|\n)/g;

// inner - 
function _rect(me, x, y, w, h) {
  if (me._efx) {
    var c0 = _map(me, x, y),
        c1 = _map(me, x + w, y),
        c2 = _map(me, x + w, y + h),
        c3 = _map(me, x, y + h);

    return [" M", c0.x, " ", c0.y,
            " L", c1.x, " ", c1.y,
            " L", c2.x, " ", c2.y,
            " L", c3.x, " ", c3.y,
            " Z"].join("");
  }
  return [" M", x,     " ", y,
          " L", x + w, " ", y,
          " L", x + w, " ", y + h,
          " L", x,     " ", y + h,
          " Z"].join("");
}

// inner - map
function _map(me, x, y) {
  var m = me._mtx;

  return {
    x: x * m[0] + y * m[3] + m[6], // x * m11 + y * m21 + dx
    y: x * m[1] + y * m[4] + m[7]  // x * m12 + y * m22 + dy
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

    fg = _SL_PATH_OPACITY + (c[1] * this[_GLOBAL_ALPHA]) +
         '" Canvas.ZIndex="' + zindex +
         _SL_FILL + c[0] +
         _SL_DATA + _rect(this, x, y, w, h) + '" />';

    !this.xFlyweight &&
      this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._view.add(this._content.createFromXaml(fg, false));
  }
}

// uuMeta.canvas.SL2D._clear
function _clear(me) {
  me._history = [];
  me._zindex = 0;
  me._view && me._view.clear(); // fix for IE8
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
  this.fill(1, _rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
  this.fill(0, _rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
  this._path.push(" Z");
}

// CanvasRenderingContext2D.prototype.moveTo
function moveTo(x, y) {
  if (this._efx) {
    var m = this._mtx; // inlining: this._map(x, y)

    this._path.push(" M", x * m[0] + y * m[3] + m[6], " ",
                          x * m[1] + y * m[4] + m[7]);
  } else {
    this._path.push(" M", x, " ", y);
  }
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
  if (this._efx) {
    var m = this._mtx; // inlining: this._map(x, y)

    this._path.push(" L", x * m[0] + y * m[3] + m[6], " ",
                          x * m[1] + y * m[4] + m[7]);
  } else {
    this._path.push(" L", x, " ", y);
  }
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
  if (this._efx) {
    var c0 = _map(this, cpx, cpy),
        c1 = _map(this, x, y);

    cpx = c0.x;
    cpy = c0.y;
    x = c1.x;
    y = c1.y;
  }
  this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
  if (this._efx) {
    var c0 = _map(this, x, y),
        c1 = _map(this, cp1x, cp1y),
        c2 = _map(this, cp2x, cp2y);

    cp1x = c1.x;
    cp1y = c1.y;
    cp2x = c2.x;
    cp2y = c2.y;
    x = c0.x;
    y = c0.y;
  }
  this._path.push(" C", cp1x, " ", cp1y, " ",
                        cp2x, " ", cp2y, " ", x, " ", y);
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
  this._path.push(_rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
  var deg1 = startAngle * _TO_DEGREES,
      deg2 = endAngle * _TO_DEGREES,
      isLargeArc = 0,
      magic = 0.0001570796326795,
      sweepDirection = anticlockwise ? 0 : 1,
      sx, sy, ex, ey, rx, ry, c0;

  // angle normalize
  if (deg1 < 0)   { deg1 += 360; }
  if (deg1 > 360) { deg1 -= 360; }
  if (deg2 < 0)   { deg2 += 360; }
  if (deg2 > 360) { deg2 -= 360; }

  // circle
  if (deg1 + 360 == deg2 || deg1 == deg2 + 360) {
    if (sweepDirection) {
      endAngle -= magic;
    } else {
      endAngle += magic;
    }
    isLargeArc = 1;
  } else if (sweepDirection) {
    if (deg2 - deg1 > 180) {
      isLargeArc = 1;
    }
  } else {
    if (deg1 - deg2 > 180) {
      isLargeArc = 1;
    }
  }

  rx = this._scaleX * radius;
  ry = this._scaleY * radius;

  sx = x + (_math.cos(startAngle) * radius);
  sy = y + (_math.sin(startAngle) * radius);
  ex = x + (_math.cos(endAngle) * radius);
  ey = y + (_math.sin(endAngle) * radius);

  // add <PathFigure StartPoint="..">
  this._path.length ? this.lineTo(sx, sy)
                    : this.moveTo(sx, sy);
  if (this._efx) {
    c0 = _map(this, ex, ey);
    ex = c0.x;
    ey = c0.y;
  }
  this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                  sweepDirection, " ", ex, " ", ey);
}

// CanvasRenderingContext2D.prototype.fill
function fill(wire, path) {
  path = path || this._path.join("");

  var rv = [], fg, zindex = 0, mix, c,
      style = wire ? this[_STROKE_STYLE]
                   : this[_FILL_STYLE],
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  if ( (mix = _COMPOSITES[this[_GLOBAL_COMPO]]) ) {
    (mix === 4) ? (zindex = --this._zindex) : _clear(this);
  }

  if (typeof style === "string") {
    c = _colorCache[style] || _impl.parseColor(style);

    rv.push(_SL_CANVAS_ZINDEX, zindex, '">',
            _SL_PATH_OPACITY, c[1] * this[_GLOBAL_ALPHA],
            _SL_DATA, path,
            wire ? _buildStrokeProps(this) : "",
            wire ? _SL_STROKE : _SL_FILL, c[0], '">',
            sc[1] ? _buildShadowBlur(this, "Path", sc) : "",
            '</Path></Canvas>');
    fg = rv.join("");
  } else {
    fg = _FILL_FUNC[style._type](this, style, path, wire, mix, zindex, sc);
  }
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  this._view.add(this._content.createFromXaml(fg, false));
}

// inner - Linear Gradient Fill
function _linearGradientFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [],
      fp = style._param,
      c0 = _map(me, fp.x0, fp.y0),
      c1 = _map(me, fp.x1, fp.y1),
      prop = wire ? "Stroke" : "Fill",
      color = _buildLinearColor(style._colorStop);

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">',
          _SL_PATH_OPACITY, me[_GLOBAL_ALPHA],
          _SL_DATA, path,
          wire ? _buildStrokeProps(me) : "", '"><Path.', prop,
          '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
          c0.x, ",", c0.y,
            '" EndPoint="', c1.x, ",", c1.y, '">', color,
          '</LinearGradientBrush></Path.', prop, '>',
          shadowColor[1] ? _buildShadowBlur(me, "Path", shadowColor) : "",
          '</Path></Canvas>');
  return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [], prop = wire ? "Stroke" : "Fill",
      fp = style._param,
      color = _buildRadialColor(style),
      zindex2 = 0,
      rr = fp.r1 * 2,
      x = fp.x1 - fp.r1,
      y = fp.y1 - fp.r1,
      gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
      gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(x, y), me._mtx),
      tmpmtx = _buildMatrixTransform('Ellipse', m),
      v, bari = "";

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">');

  if (!wire) {
    // fill outside
    if (style._colorStop.length) {
      v = style._colorStop[style._colorStop.length - 1];
      if (v.color[1] > 0.001) {
        if (mix === 4) { zindex2 = --me._zindex; }
        bari =  [ _SL_PATH_OPACITY, me[_GLOBAL_ALPHA],
                  '" Canvas.ZIndex="', zindex2,
                  _SL_DATA, path, _SL_FILL, '#',
                  _mm.hash.hex2[parseFloat(v.color[1] / (1 / 255))] +
                  v.color[0].substring(1),
                  '" />'].join("");
        !me.xFlyweight &&
          me._history.push(me._clipPath ? (bari = _clippy(this, bari))
                                            : bari);
        me._view.add(me._content.createFromXaml(bari, false));
      }
    }
  }

  rv.push('<Ellipse Opacity="', me[_GLOBAL_ALPHA],
          '" Width="', rr, '" Height="', rr,
          wire ? _buildStrokeProps(me) : "",
          '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
          gx, ',', gy,
          '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', color,
          '</RadialGradientBrush></Ellipse.', prop, '>',
            tmpmtx,
            shadowColor[1] ? _buildShadowBlur(me, "Ellipse", shadowColor) : "",
          '</Ellipse></Canvas>');
  return rv.join("");
}

// inner - Pattern Fill
function _patternFill(me, style, path, wire, mix, zindex, shadowColor) {
  var rv = [], prop = wire ? "Stroke" : "Fill",
      zindex2 = 0,
      sw, sh, xz, yz, x, y, // use tile mode
      // for shadow
      si = 0, so = 0, sd = 0, sx = 0, sy = 0;

  if (!wire && me.xTiling) {
    x  = 0;
    y  = 0;
    sw = style._dim.w;
    sh = style._dim.h;
    xz = _math.ceil(parseInt(me.canvas.width)  / sw);
    yz = _math.ceil(parseInt(me.canvas.height) / sh);

    if (mix === 4) { zindex2 = --me._zindex; }

    rv.push(_SL_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1]) {
      sx = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_X];
      sy = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_Y];
      so = me.xShadowOpacityFrom;
      sd = me.xShadowOpacityDelta;

      for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
        rv.push(_SL_PATH_OPACITY, so.toFixed(2),
                _SL_CANVAS_LEFT, sx, _SL_CANVAS_TOP, sy,
                _SL_DATA, path, wire ? _buildStrokeProps(me) : "",
                _SL_FILL, shadowColor[0],
                '" />');
      }
    }

    rv.push(_SL_CANVAS_ZINDEX, zindex2, '" Clip="', path, '">');
    for (y = 0; y < yz; ++y) {
      for (x = 0; x < xz; ++x) {
        rv.push('<Image Opacity="', me[_GLOBAL_ALPHA],
                _SL_CANVAS_LEFT, x * sw, _SL_CANVAS_TOP, y * sh,
                '" Source="', style._src, '">',
//              shadowColor[1] ? _buildShadowBlur(me, "Image", shadowColor) : "",
                '</Image>');
      }
    }
    rv.push('</Canvas></Canvas>');

    return rv.join("");
  }

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">',
          _SL_PATH_OPACITY, me[_GLOBAL_ALPHA],
          wire ? _buildStrokeProps(me) : "",
          _SL_DATA, path,
          '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
          style._src,
          '" /></Path.', prop, '>',
          shadowColor[1] ? _buildShadowBlur(me, "Path", shadowColor) : "",
          '</Path></Canvas>');
  return rv.join("");
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
  this._clipPath = this._path.join("");
}

// inner -
function _clippy(me, fg) {
  return '<Canvas Clip="' + me._clipPath + '">' + fg + '</Canvas>';
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth, wire) {
  text = text.replace(_TEXT_SPACE, " ");
  var style = wire ? this[_STROKE_STYLE] : this[_FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      rv = [], fg, c,
      fp, c0, c1, zindex = 0, mtx, rgx, rgy,
      font = _impl.parseFont(this.font, this.canvas),
      metric = _impl.getTextMetric(text, font.formal),
      offX = 0, align = this.textAlign, dir = "ltr",
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = this._elm.style.direction === dir ? "left" : "right"
  }
  switch (align) {
  case "center": offX = (metric.w - 4) / 2; break; // -4: adjust
  case "right":  offX = metric.w;
  }
  mtx = _buildMatrixTransform(
            'TextBlock',
            _impl.matrix2DMultiply(_impl.matrix2Dtranslate(x - offX, y),
                                   this._mtx));

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">');
  if (!types) {
    c = _colorCache[style] || _impl.parseColor(style);
    rv.push('<TextBlock Opacity="', c[1] * this[_GLOBAL_ALPHA],
            '" Foreground="', c[0]);
  } else {
    rv.push('<TextBlock Opacity="', this[_GLOBAL_ALPHA]);
  }
  rv.push('" FontFamily="', font.rawfamily,
          '" FontSize="', font.size.toFixed(2),
          '" FontStyle="', _FONT_STYLES[font.style] || "Normal",
          '" FontWeight="', _FONT_WEIGHTS[font.weight] || "Normal",
          '">', _impl.toHTMLEntity(text), mtx,
          sc[1] ? _buildShadowBlur(this, "TextBlock", sc) : "");

  switch (types) {
  case 1: c = _buildLinearColor(style._colorStop);
          fp = style._param;
          c0 = _map(this, fp.x0, fp.y0),
          c1 = _map(this, fp.x1, fp.y1),
          rv.push('<TextBlock.Foreground>',
                  '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                  c0.x, ",", c0.y,
                  '" EndPoint="', c1.x, ",", c1.y, '">', c,
                  '</LinearGradientBrush></TextBlock.Foreground>');
          break;
  case 2: c = _buildRadialColor(style);
          fp = style._param,
          rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
          rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
          rv.push('<TextBlock.Foreground>',
                  '<RadialGradientBrush GradientOrigin="', rgx, ',', rgy,
                  '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', c,
                  '</RadialGradientBrush></TextBlock.Foreground>');
          break;
  case 3: rv.push('<TextBlock.Foreground>',
                  '<ImageBrush Stretch="None" ImageSource="', style._src,
                  '" /></TextBlock.Foreground>');
  }
  rv.push('</TextBlock></Canvas>');
  fg = rv.join("");
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  this._view.add(this._content.createFromXaml(fg, false));
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image) {
  var info = _impl.detectDrawImageArg.apply(this, arguments),
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
      bw, bh, w, h, x, y, // slice
      tmpmtx, size = "", clip = "",
      zindex = 0, sclip = "",
      i = 0, iz, // for copy canvas
      // for shadow
      si = 0, so = 0, sd = 0, shx = 0, shy = 0,
      sc = _colorCache[this[_SHADOW_COLOR]] ||
           _impl.parseColor(this[_SHADOW_COLOR]);

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  if ("src" in image) { // image is HTMLImageElement
    switch (info.az) {
    case 3:
      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(dx, dy), this._mtx);
      break;
    case 5:
      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(dx, dy), this._mtx);
      size = '" Width="' + dw + '" Height="' + dh;
      break;
    case 9:
      // TODO: image ratio
      //
      bw = dw / sw; // bias width
      bh = dh / sh; // bias height
      w = bw * iw;
      h = bh * ih;
      x = dx - (bw * sx);
      y = dy - (bh * sy);

      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(x, y), this._mtx);

      size = '" Width="' + w + '" Height="' + h;
      clip = '<Image.Clip><RectangleGeometry Rect="' +
             [dx - x, dy - y, dw, dh].join(" ") +
             '" /></Image.Clip>';
      if (sc[1]) {
        sclip = '<Rectangle.Clip><RectangleGeometry Rect="' +
                [dx - x, dy - y, dw, dh].join(" ") +
                '" /></Rectangle.Clip>';
      }
    }

    rv.push(_SL_CANVAS_ZINDEX, zindex, '">');

    if (sc[1]) {
      shx = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_X];
      shy = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;
      tmpmtx = _buildMatrixTransform('Rectangle', m);

      for (; si < _SHADOW_WIDTH; so += sd, --shx, --shy, ++si) {
        rv.push('<Rectangle Opacity="', so.toFixed(2),
                _SL_CANVAS_LEFT, shx, _SL_CANVAS_TOP, shy,
                size, _SL_FILL, sc[0], '">', sclip,
                tmpmtx,
                '</Rectangle>');
      }
    }

    rv.push('<Image Opacity="', this[_GLOBAL_ALPHA],
            '" Source="', image.src, size, '">',
            clip, _buildMatrixTransform('Image', m),
            sc[1] ? _buildShadowBlur(this, "Image", sc) : "",
            '</Image></Canvas>');
    fg = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._view.add(this._content.createFromXaml(fg, false));
  } else { // HTMLCanvasElement
    iz = image._ctx2d._history.length;
    switch (info.az) {
    case 3:
      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(dx, dy), this._mtx);
      break;
    case 5:
      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(dx, dy), this._mtx);
      m = _impl.matrix2DMultiply(_impl.matrix2DScale(dw / iw, dh / ih), m);
      break;
    case 9:
      bw = dw / sw; // bias width
      bh = dh / sh; // bias height
      w = bw * iw;
      h = bh * ih;
      x = dx - (bw * sx);
      y = dy - (bh * sy);

      m = _impl.matrix2DMultiply(_impl.matrix2Dtranslate(x, y), this._mtx);
      m = _impl.matrix2DMultiply(_impl.matrix2DScale(bw, bh), m);

      clip = '<Canvas.Clip><RectangleGeometry Rect="' +
             [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" ") +
             '" /></Canvas.Clip>';
//        if (sc[1]) {
//          sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
//                   [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
//                   '" /></Rectangle.Clip>'].join("");
//        }
    }

    // shadow not impl

    rv.push(_SL_CANVAS_ZINDEX, zindex,
            '" Opacity="', this[_GLOBAL_ALPHA], // image._ctx2d[_GLOBAL_ALPHA],
            size, '">',
            clip, _buildMatrixTransform('Canvas', m),
//            sc[1] ? _buildShadowBlur(me, "Canvas", sc) : "",
            '<Canvas>');

    for (; i < iz; ++i) {
      rv.push(image._ctx2d._history[i]);
    }
    rv.push('</Canvas></Canvas>');

    fg = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._view.add(this._content.createFromXaml(fg, false));
  }
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) {
  return new CanvasGradient(1, // 1:LinearGradient
                            { x0: x0, y0: y0,
                              x1: x1, y1: y1 });
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) {
  return new CanvasGradient(2, // 2:RadialGradient
                            { x0: x0, y0: y0, r0: r0,
                              x1: x1, y1: y1, r1: r1 });
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image, repetition) {
  return new CanvasPattern(image, repetition);
}

// inner - build Linear Color
function _buildLinearColor(ary) {
  var rv = [], v, i = 0, iz = ary.length, n = 1 / 255;

  for (; i < iz; ++i) {
    v = ary[i];
    rv.push('<GradientStop Color="#',
              _mm.hash.hex2[parseFloat(v.color[1] / n)],
              v.color[0].substring(1),
              '" Offset="', v.offset, '" />');
  }
  return rv.join("");
}

// inner - build Radial Color
function _buildRadialColor(style) {
  var rv = [],
      fp = style._param, n = 1 / 255,
      r0 = fp.r0 / fp.r1,
      remain = 1 - r0,
      v,
      i = 0,
      iz = style._colorStop.length;
  if (!iz) { return ""; }

  rv.push('<GradientStop Color="#',
            _mm.hash.hex2[parseFloat(style._colorStop[0].color[1] / n)],
            style._colorStop[0].color[0].substring(1),
            '" Offset="', 0, '" />');
  for (i = 0; i < iz; ++i) {
    v = style._colorStop[i];
    rv.push('<GradientStop Color="#',
              _mm.hash.hex2[parseFloat(v.color[1] / n)],
              v.color[0].substring(1),
              '" Offset="', (v.offset * remain + r0), '" />');
  }
  return rv.join("");
}

// inner - build MatrixTransform
function _buildMatrixTransform(type, m) {
  return [
    '<', type,
    '.RenderTransform><MatrixTransform><MatrixTransform.Matrix><Matrix M11="',
               m[0], '" M21="', m[3], '" OffsetX="', m[6],
    '" M12="', m[1], '" M22="', m[4], '" OffsetY="', m[7],
    '" /></MatrixTransform.Matrix></MatrixTransform></', type,
    '.RenderTransform>'].join("");
}

// inner - build Shadow Blur
function _buildShadowBlur(me, type, shadowColor) {
  var sdepth = 0,
      sx = me[_SHADOW_OFFSET_X],
      sy = me[_SHADOW_OFFSET_Y];

  if (shadowColor[1]) {
    sdepth = _math.max(_math.abs(sx), _math.abs(sy)) * 1.2;
    return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
            '" Color="', shadowColor[0],
            '" BlurRadius="', me.shadowBlur * 1.2,
            '" Direction="', _math.atan2(-sy, sx) * _TO_DEGREES,
            '" ShadowDepth="', sdepth,
            '" /></', type, '.Effect>'].join("");
  }
  return "";
}

// inner - build stroke propertys
function _buildStrokeProps(obj) {
  var cap = _CAPS[obj.lineCap],
      width = (obj.lineWidth * obj._lineScale).toFixed(2);

  return '" StrokeLineJoin="'     + obj.lineJoin +
         '" StrokeThickness="'    + width +
         '" StrokeMiterLimit="'   + obj.miterLimit +
         '" StrokeStartLineCap="' + cap +
         '" StrokeEndLineCap="'   + cap;
}

// --- initialize / export ---
_SL2D.clearRect = clearRect;
_SL2D.strokeRect = strokeRect;
_SL2D.fillRect = fillRect;
_SL2D.closePath = closePath;
_SL2D.moveTo = moveTo;
_SL2D.lineTo = lineTo;
_SL2D.quadraticCurveTo = quadraticCurveTo;
_SL2D.bezierCurveTo = bezierCurveTo;
_SL2D.rect = rect;
_SL2D.arc = arc;
_SL2D.fill = fill;
_SL2D.clip = clip;
_SL2D.fillText = fillText;
_SL2D.drawImage = drawImage;
_SL2D.createLinearGradient = createLinearGradient;
_SL2D.createRadialGradient = createRadialGradient;
_SL2D.createPattern = createPattern;
uuMeta.canvas.SL2D._clear = _clear;

})(); // uuMeta.canvas.silverlight scope

