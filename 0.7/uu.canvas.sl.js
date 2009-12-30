
// === Silverlight Canvas ===
// depend: uu.js, uu.color.js, uu.css.js
uu.waste || (function(win, doc, uu, _impl, _math) {
var _mtx2d          = _impl.mtx2d,
    _mtx2dscale     = _mtx2d.scale,
    _mtx2dmultiply  = _mtx2d.multiply,
    _mtx2dtranslate = _mtx2d.translate,
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

uu.mix(uu.canvas.SL2D.prototype, {
  clearRect:        clearRect,
  strokeRect:       strokeRect,
  fillRect:         fillRect,
  closePath:        closePath,
  moveTo:           moveTo,
  lineTo:           lineTo,
  quadraticCurveTo: quadraticCurveTo,
  bezierCurveTo:    bezierCurveTo,
  rect:             rect,
  arc:              arc,
  fill:             fill,
  clip:             clip,
  fillText:         fillText,
  drawImage:        drawImage,
  createLinearGradient: createLinearGradient,
  createRadialGradient: createRadialGradient,
  createPattern:    createPattern,
  // extend
  lock:             lock,       // ctx.lock(clearScreen = 0)
  unlock:           unlock,     // ctx.unlock()
  // extend for uu.css3
  qstroke:          qstroke,    // quick stroke
  qstrokeRect:      qstrokeRect // quick strokeRect
});
uu.canvas.SL2D._rect = _rect;

// uu.canvas.SL2D._rect
function _rect(me, x, y, w, h) {
  if (me._efx) {
    var c0 = _map2(me._mtx, x, y, x + w, y),
        c1 = _map2(me._mtx, x + w, y + h, x, y + h);

    return [" M", c0.x1, " ", c0.y1, " L", c0.x2, " ", c0.y2,
            " L", c1.x1, " ", c1.y1, " L", c1.x2, " ", c1.y2,
            " Z"].join("");
  }
  return [" M", x,     " ", y,     " L", x + w, " ", y,
          " L", x + w, " ", y + h, " L", x,     " ", y + h,
          " Z"].join("");
}

// inner - map
function _map(mtx, x, y) {
  return {
    x: x * mtx[0] + y * mtx[3] + mtx[6], // x * m11 + y * m21 + dx
    y: x * mtx[1] + y * mtx[4] + mtx[7]  // x * m12 + y * m22 + dy
  };
}

function _map2(mtx, x1, y1, x2, y2) {
  return {
    x1: x1 * mtx[0] + y1 * mtx[3] + mtx[6], // x * m11 + y * m21 + dx
    y1: x1 * mtx[1] + y1 * mtx[4] + mtx[7], // x * m12 + y * m22 + dy
    x2: x2 * mtx[0] + y2 * mtx[3] + mtx[6], // x * m11 + y * m21 + dx
    y2: x2 * mtx[1] + y2 * mtx[4] + mtx[7]  // x * m12 + y * m22 + dy
  };
}

// inner -
function _clear(me) {
  me._history = [];
  me._zindex = 0;
  me._readyState ? me._view.clear() : (me._readyStock = []);
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
        color = uu.css.bgcolor.inherit(this._node);

    switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: _clear(this);
    }

    fg = _SL_PATH_OPACITY + (color.a * this[_GLOBAL_ALPHA]) +
         '" Canvas.ZIndex="' + zindex +
         _SL_FILL + color.hex +
         _SL_DATA + _rect(this, x, y, w, h) + '" />';

    !this.xFlyweight &&
      this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    _drawxaml(this, fg);
  }
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
    var c0 = _map(this._mtx, x, y);

    x = c0.x, y = c0.y;
  }
  this._path.push(" M", x, " ", y);
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
  if (this._efx) {
    var c0 = _map(this._mtx, x, y);

    x = c0.x, y = c0.y;
  }
  this._path.push(" L", x, " ", y);
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
  if (this._efx) {
    var c0 = _map2(this._mtx, cpx, cpy, x, y);

    cpx = c0.x1, cpy = c0.y1, x = c0.x2, y = c0.y2;
  }
  this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
  if (this._efx) {
    var c0 = _map2(this._mtx, cp1x, cp1y, cp2x, cp2y),
        c1 = _map(this._mtx, x, y);

    cp1x = c0.x1, cp1y = c0.y1, cp2x = c0.x2, cp2y = c0.y2;
    x = c1.x, y = c1.y;
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
    c0 = _map(this._mtx, ex, ey);
    ex = c0.x;
    ey = c0.y;
  }
  this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                  sweepDirection, " ", ex, " ", ey);
}

// CanvasRenderingContext2D.prototype.fill
function fill(wire, path) {
  path = path || this._path.join("");

  var rv = [], fg, zindex = 0, mix, color,
      style = wire ? this[_STROKE_STYLE]
                   : this[_FILL_STYLE],
      scolor = uu.color(this[_SHADOW_COLOR]);

  mix = _COMPOSITES[this[_GLOBAL_COMPO]];
  if (mix) {
    (mix === 4) ? (zindex = --this._zindex) : _clear(this);
  }

  if (typeof style === "string") {
    color = uu.color(style);

    rv.push(_SL_CANVAS_ZINDEX, zindex, '">',
            _SL_PATH_OPACITY, color.a * this[_GLOBAL_ALPHA],
            // http://twitter.com/uupaa/status/5179317486
            _SL_DATA, wire ? path : "F1 " + path, // [F1] FillRule=Nonzero
            wire ? _buildStrokeProps(this) : "",
            wire ? _SL_STROKE : _SL_FILL, color.hex, '">',
            scolor.a ? _buildShadowBlur(this, "Path", scolor) : "",
            '</Path></Canvas>');
    fg = rv.join("");
  } else {
    fg = _FILL_FUNC[style._type](this, style, path, wire, mix, zindex, scolor);
  }
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  _drawxaml(this, fg);
}

// inner - Linear Gradient Fill
function _linearGradientFill(me, style, path, wire, mix, zindex, color) {
  var rv = [],
      fp = style._param,
      c0 = _map2(me._mtx, fp.x0, fp.y0, fp.x1, fp.y1),
      prop = wire ? "Stroke" : "Fill";

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">',
          _SL_PATH_OPACITY, me[_GLOBAL_ALPHA],
          _SL_DATA, path,
          wire ? _buildStrokeProps(me) : "", '"><Path.', prop,
          '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
          c0.x1, ",", c0.y1,
            '" EndPoint="', c0.x2, ",", c0.y2, '">',
            _buildLinearColor(style._colorStop),
          '</LinearGradientBrush></Path.', prop, '>',
          color.a ? _buildShadowBlur(me, "Path", color) : "",
          '</Path></Canvas>');
  return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(me, style, path, wire, mix, zindex, color) {
  var rv = [], prop = wire ? "Stroke" : "Fill",
      fp = style._param,
      zindex2 = 0,
      rr = fp.r1 * 2,
      x = fp.x1 - fp.r1,
      y = fp.y1 - fp.r1,
      gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
      gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
      m = _mtx2dmultiply(_mtx2dtranslate(x, y), me._mtx),
      tmpmtx = _buildMatrixTransform('Ellipse', m),
      v, bari = "";

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">');

  if (!wire) {
    // fill outside
    if (style._colorStop.length) {
      v = style._colorStop[style._colorStop.length - 1];
      if (v.color.a > 0.001) {
        if (mix === 4) { zindex2 = --me._zindex; }
        bari =  [ _SL_PATH_OPACITY, me[_GLOBAL_ALPHA],
                  '" Canvas.ZIndex="', zindex2,
                  _SL_DATA, path, _SL_FILL, v.color.argb, '" />'].join("");
        !me.xFlyweight &&
          me._history.push(me._clipPath ? (bari = _clippy(this, bari)) : bari);
        _drawxaml(me, bari);
      }
    }
  }

  rv.push('<Ellipse Opacity="', me[_GLOBAL_ALPHA],
          '" Width="', rr, '" Height="', rr,
          wire ? _buildStrokeProps(me) : "",
          '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
          gx, ',', gy,
          '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
            _buildRadialColor(style),
          '</RadialGradientBrush></Ellipse.', prop, '>',
            tmpmtx,
            color.a ? _buildShadowBlur(me, "Ellipse", color) : "",
          '</Ellipse></Canvas>');
  return rv.join("");
}

// inner - Pattern Fill
function _patternFill(me, style, path, wire, mix, zindex, color) {
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

    if (color.a) {
      sx = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_X];
      sy = _SHADOW_WIDTH / 2 + me[_SHADOW_OFFSET_Y];
      so = me.xShadowOpacityFrom;
      sd = me.xShadowOpacityDelta;

      for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
        rv.push(_SL_PATH_OPACITY, so.toFixed(2),
                _SL_CANVAS_LEFT, sx, _SL_CANVAS_TOP, sy,
                _SL_DATA, path, wire ? _buildStrokeProps(me) : "",
                _SL_FILL, color.hex,
                '" />');
      }
    }

    rv.push(_SL_CANVAS_ZINDEX, zindex2, '" Clip="', path, '">');
    for (y = 0; y < yz; ++y) {
      for (x = 0; x < xz; ++x) {
        rv.push('<Image Opacity="', me[_GLOBAL_ALPHA],
                _SL_CANVAS_LEFT, x * sw, _SL_CANVAS_TOP, y * sh,
                '" Source="', style._src, '">',
//              color.a ? _buildShadowBlur(me, "Image", color) : "",
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
          color.a ? _buildShadowBlur(me, "Path", color) : "",
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
      rv = [], fg, color,
      fp, c0, zindex = 0, mtx, rgx, rgy,
      font = _impl.parseFont(this.font, this.canvas),
      metric = _impl.getTextMetric(text, font.formal),
      offX = 0, align = this.textAlign, dir = "ltr",
      scolor = uu.color(this[_SHADOW_COLOR]);

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = this._node.currentStyle.direction === dir ? "left" : "right"
  }
  switch (align) {
  case "center": offX = (metric.w - 4) / 2; break; // -4: adjust
  case "right":  offX = metric.w;
  }
  mtx = _buildMatrixTransform(
            'TextBlock',
            _mtx2dmultiply(_mtx2dtranslate(x - offX, y), this._mtx));

  rv.push(_SL_CANVAS_ZINDEX, zindex, '">');
  if (!types) {
    color = uu.color(style);
    rv.push('<TextBlock Opacity="', color.a * this[_GLOBAL_ALPHA],
            '" Foreground="', color.hex);
  } else {
    rv.push('<TextBlock Opacity="', this[_GLOBAL_ALPHA]);
  }
  rv.push('" FontFamily="', font.rawfamily,
          '" FontSize="', font.size.toFixed(2),
          '" FontStyle="', _FONT_STYLES[font.style] || "Normal",
          '" FontWeight="', _FONT_WEIGHTS[font.weight] || "Normal",
          '">', uu.esc(text), mtx,
          scolor.a ? _buildShadowBlur(this, "TextBlock", scolor) : "");

  switch (types) {
  case 1: fp = style._param;
          c0 = _map2(this._mtx, fp.x0, fp.y0, fp.x1, fp.y1),
          rv.push('<TextBlock.Foreground>',
                  '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                  c0.x1, ",", c0.y1,
                  '" EndPoint="', c0.x2, ",", c0.y2, '">',
                      _buildLinearColor(style._colorStop),
                  '</LinearGradientBrush></TextBlock.Foreground>');
          break;
  case 2: fp = style._param,
          rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
          rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
          rv.push('<TextBlock.Foreground>',
                  '<RadialGradientBrush GradientOrigin="', rgx, ',', rgy,
                  '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
                      _buildRadialColor(style),
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
  _drawxaml(this, fg);
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image) {
  var info = _impl.drawImageArgs.apply(this, arguments),
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
      scolor = uu.color(this[_SHADOW_COLOR]);

  switch (_COMPOSITES[this[_GLOBAL_COMPO]]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  if ("src" in image) { // image is HTMLImageElement
    switch (info.az) {
    case 3:
      m = _mtx2dmultiply(_mtx2dtranslate(dx, dy), this._mtx);
      break;
    case 5:
      m = _mtx2dmultiply(_mtx2dtranslate(dx, dy), this._mtx);
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

      m = _mtx2dmultiply(_mtx2dtranslate(x, y), this._mtx);

      size = '" Width="' + w + '" Height="' + h;
      clip = '<Image.Clip><RectangleGeometry Rect="' +
             [dx - x, dy - y, dw, dh].join(" ") +
             '" /></Image.Clip>';
      if (scolor.a) {
        sclip = '<Rectangle.Clip><RectangleGeometry Rect="' +
                [dx - x, dy - y, dw, dh].join(" ") +
                '" /></Rectangle.Clip>';
      }
    }

    rv.push(_SL_CANVAS_ZINDEX, zindex, '">');

    if (scolor.a) {
      shx = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_X];
      shy = _SHADOW_WIDTH / 2 + this[_SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;
      tmpmtx = _buildMatrixTransform('Rectangle', m);

      for (; si < _SHADOW_WIDTH; so += sd, --shx, --shy, ++si) {
        rv.push('<Rectangle Opacity="', so.toFixed(2),
                _SL_CANVAS_LEFT, shx, _SL_CANVAS_TOP, shy,
                size, _SL_FILL, scolor.hex, '">', sclip,
                tmpmtx,
                '</Rectangle>');
      }
    }

    rv.push('<Image Opacity="', this[_GLOBAL_ALPHA],
            '" Source="', image.src, size, '">',
            clip, _buildMatrixTransform('Image', m),
            scolor.a ? _buildShadowBlur(this, "Image", scolor) : "",
            '</Image></Canvas>');
  } else { // HTMLCanvasElement
    iz = image.uuctx2d._history.length;
    switch (info.az) {
    case 3:
      m = _mtx2dmultiply(_mtx2dtranslate(dx, dy), this._mtx);
      break;
    case 5:
      m = _mtx2dmultiply(_mtx2dtranslate(dx, dy), this._mtx);
      m = _mtx2dmultiply(_mtx2dscale(dw / iw, dh / ih), m);
      break;
    case 9:
      bw = dw / sw; // bias width
      bh = dh / sh; // bias height
      w = bw * iw;
      h = bh * ih;
      x = dx - (bw * sx);
      y = dy - (bh * sy);

      m = _mtx2dmultiply(_mtx2dtranslate(x, y), this._mtx);
      m = _mtx2dmultiply(_mtx2dscale(bw, bh), m);

      clip = '<Canvas.Clip><RectangleGeometry Rect="' +
             [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" ") +
             '" /></Canvas.Clip>';
//        if (scolor.a) {
//          sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
//                   [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
//                   '" /></Rectangle.Clip>'].join("");
//        }
    }

    // shadow not impl
    rv.push(_SL_CANVAS_ZINDEX, zindex,
            '" Opacity="', this[_GLOBAL_ALPHA], // image.uuctx2d[_GLOBAL_ALPHA],
            size, '">',
            clip, _buildMatrixTransform('Canvas', m),
//            scolor.a ? _buildShadowBlur(me, "Canvas", scolor) : "",
            '<Canvas>');

    for (; i < iz; ++i) {
      rv.push(image.uuctx2d._history[i]);
    }
    rv.push('</Canvas></Canvas>');
  }
  fg = rv.join("");
  !this.xFlyweight &&
    this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
  _drawxaml(this, fg);
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) {
  return new win.CanvasGradient(1, // 1:LinearGradient
                                { x0: x0, y0: y0,
                                  x1: x1, y1: y1 });
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) {
  return new win.CanvasGradient(2, // 2:RadialGradient
                                { x0: x0, y0: y0, r0: r0,
                                  x1: x1, y1: y1, r1: r1 });
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image, repetition) {
  return new win.CanvasPattern(image, repetition);
}

// inner - build Linear Color
function _buildLinearColor(ary) {
  var rv = [], v, i = 0, iz = ary.length;

  for (; i < iz; ++i) {
    v = ary[i];
    rv.push('<GradientStop Color="' + v.color.argb +
            '" Offset="' + v.offset + '" />');
  }
  return rv.join("");
}

// inner - build Radial Color
function _buildRadialColor(style) {
  var rv = [],
      fp = style._param,
      r0 = fp.r0 / fp.r1,
      remain = 1 - r0,
      v,
      i = 0,
      iz = style._colorStop.length;
  if (!iz) { return ""; }

  rv.push('<GradientStop Color="', style._colorStop[0].color.argb,
          '" Offset="0" />');
  for (i = 0; i < iz; ++i) {
    v = style._colorStop[i];
    rv.push('<GradientStop Color="' + v.color.argb +
            '" Offset="' + (v.offset * remain + r0) + '" />');
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
function _buildShadowBlur(me,      // @param this:
                          type,    // @param String:
                          color) { // @param ColorHash:
  var sdepth = 0,
      sx = me[_SHADOW_OFFSET_X],
      sy = me[_SHADOW_OFFSET_Y];

  if (color.a) {
    sdepth = _math.max(_math.abs(sx), _math.abs(sy)) * 1.2;
    return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
            '" Color="', color.hex,
            '" BlurRadius="', me.shadowBlur * 1.2,
            '" Direction="', _math.atan2(-sy, sx) * _TO_DEGREES,
            '" ShadowDepth="', sdepth,
            '" /></', type, '.Effect>'].join("");
  }
  return "";
}

// inner - build stroke properties
function _buildStrokeProps(obj) {
  var cap = _CAPS[obj.lineCap],
      width = (obj.lineWidth * obj._lineScale).toFixed(2);

  return '" StrokeLineJoin="'     + obj.lineJoin +
         '" StrokeThickness="'    + width +
         '" StrokeMiterLimit="'   + obj.miterLimit +
         '" StrokeStartLineCap="' + cap +
         '" StrokeEndLineCap="'   + cap;
}

// CanvasRenderingContext2D.prototype.qstroke - quick stroke
function qstroke(hexcolor, alpha, lineWidth) {
  var fg =  '<Canvas Canvas.ZIndex="0"><Path Opacity="' + alpha.toFixed(2) +
            '" Data="' + this._path.join("") +
            '" StrokeLineJoin="round" StrokeThickness="' + lineWidth +
            '" StrokeStartLineCap="round" StrokeEndLineCap="round"' +
            '" Stroke="' + hexcolor + '"></Path></Canvas>';

  _drawxaml(this, fg);
}

// CanvasRenderingContext2D.prototype.qstrokeRect
function qstrokeRect(x, y, w, h, hexcolor, alpha, lineWidth) {
  this._path = [" M" + x       + " "  + y +
                " V" + (y + h) + " H" + (x + w) + 
                " V" + y       + " H" + x       + " Z"];
  this.qstroke(hexcolor, alpha, lineWidth);
}

// CanvasRenderingContext2D.prototype.lock
function lock(clearScreen) { // @param Boolean(= false):
  if (this._lockState) {
    throw "duplicate lock";
  }
  this._lockState = clearScreen ? 2 : 1;
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
  if (this._lockState) {
    (this._lockState === 2) && _clear(this);
    this._lockState = 0;
    if (this._lockStock.length) {
      _drawxaml(this, "<Canvas>" + this._lockStock.join("") + "</Canvas>");
    }
  }
  this._lockStock = [];
}

// inner -
function _drawxaml(me, fg) {
  if (me._lockState) {
    me._lockStock.push(fg);
  } else {
    if (me._readyState) {
      me._view.add(me._content.createFromXaml(fg));
    } else {
      me._readyStock.push(fg);
    }
  }
}

})(window, document, uu, uu.canvas.impl, Math);

