
// === Silverlight Canvas ===
// depend: uu.js, uu.color.js, uu.css.js
uu.agein || (function(win, doc, uu) {
var _SHADOW_WIDTH   = 4,
    _TO_DEGREES     = 180 / Math.PI, // Math.toDegrees - from java.math
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
    _CAPS           = { square: "square", butt: "flat", round: "round" };

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

    switch (_COMPOSITES[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: _clear(this);
    }

    fg = '<Path Opacity="' + (color.a * this.globalAlpha) +
         '" Canvas.ZIndex="' + zindex +
         '" Fill="' + color.hex +
         '" Data="' + _rect(this, x, y, w, h) + '" />';

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

  sx = x + (Math.cos(startAngle) * radius);
  sy = y + (Math.sin(startAngle) * radius);
  ex = x + (Math.cos(endAngle) * radius);
  ey = y + (Math.sin(endAngle) * radius);

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
      style = wire ? this.strokeStyle
                   : this.fillStyle,
      scolor = uu.color(this.shadowColor);

  mix = _COMPOSITES[this.globalCompositeOperation];
  if (mix) {
    (mix === 4) ? (zindex = --this._zindex) : _clear(this);
  }

  if (typeof style === "string") {
    color = uu.color(style);

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">',
            '<Path Opacity="', color.a * this.globalAlpha,
            // http://twitter.com/uupaa/status/5179317486
            '" Data="', wire ? path : "F1 " + path, // [F1] FillRule=Nonzero
            wire ? _buildStrokeProps(this) : "",
            wire ? '" Stroke="' : '" Fill="', color.hex, '">',
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

  rv.push('<Canvas Canvas.ZIndex="', zindex,
          '"><Path Opacity="', me.globalAlpha,
          '" Data="', path,
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
//    m = _mtx2dmultiply(_mtx2dtranslate(x, y), me._mtx),
      m = uu.m2d.translate(x, y, me._mtx),
      tmpmtx = _buildMatrixTransform('Ellipse', m),
      v, bari = "";

  rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

  if (!wire) {
    // fill outside
    if (style._colorStop.length) {
      v = style._colorStop[style._colorStop.length - 1];
      if (v.color.a > 0.001) {
        if (mix === 4) { zindex2 = --me._zindex; }
        bari =  [ '<Path Opacity="', me.globalAlpha,
                  '" Canvas.ZIndex="', zindex2,
                  '" Data="', path, '" Fill="', v.color.argb, '" />'].join("");
        !me.xFlyweight &&
          me._history.push(me._clipPath ? (bari = _clippy(this, bari)) : bari);
        _drawxaml(me, bari);
      }
    }
  }

  rv.push('<Ellipse Opacity="', me.globalAlpha,
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

  if (!wire) {
    x  = 0;
    y  = 0;
    sw = style._dim.w;
    sh = style._dim.h;
    xz = Math.ceil(parseInt(me.canvas.width)  / sw);
    yz = Math.ceil(parseInt(me.canvas.height) / sh);

    if (mix === 4) { zindex2 = --me._zindex; }

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

    if (color.a) {
      sx = _SHADOW_WIDTH / 2 + me.shadowOffsetX;
      sy = _SHADOW_WIDTH / 2 + me.shadowOffsetY;
      so = me.xShadowOpacityFrom;
      sd = me.xShadowOpacityDelta;

      for (; si < _SHADOW_WIDTH; so += sd, --sx, --sy, ++si) {
        rv.push('<Path Opacity="', so.toFixed(2),
                '" Canvas.Left="', sx, '" Canvas.Top="', sy,
                '" Data="', path, wire ? _buildStrokeProps(me) : "",
                '" Fill="', color.hex,
                '" />');
      }
    }

    // TileBrush simulate
    rv.push('<Canvas Canvas.ZIndex="', zindex2, '" Clip="', path, '">');
    for (y = 0; y < yz; ++y) {
      for (x = 0; x < xz; ++x) {
        rv.push('<Image Opacity="', me.globalAlpha,
                '" Canvas.Left="', x * sw, '" Canvas.Top="', y * sh,
                '" Source="', style._src, '">',
//              color.a ? _buildShadowBlur(me, "Image", color) : "",
                '</Image>');
      }
    }
    rv.push('</Canvas></Canvas>');

    return rv.join("");
  }

  rv.push('<Canvas Canvas.ZIndex="', zindex,
          '"><Path Opacity="', me.globalAlpha,
          wire ? _buildStrokeProps(me) : "",
          '" Data="', path,
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
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");
  var style = wire ? this.strokeStyle : this.fillStyle,
      types = (typeof style === "string") ? 0 : style._type,
      rv = [], fg, color,
      fp, c0, zindex = 0, mtx, rgx, rgy,
      font = uu.font.parse(this.font, this.canvas),
      metric = uu.font.metric(text, font.formal),
      offX = 0, align = this.textAlign, dir = "ltr",
      scolor = uu.color(this.shadowColor);

  switch (_COMPOSITES[this.globalCompositeOperation]) {
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
//          _mtx2dmultiply(_mtx2dtranslate(x - offX, y), this._mtx));
            uu.m2d.translate(x - offX, y, this._mtx));

  rv.push('<Canvas Canvas.ZIndex="', zindex, '">');
  if (!types) {
    color = uu.color(style);
    rv.push('<TextBlock Opacity="', color.a * this.globalAlpha,
            '" Foreground="', color.hex);
  } else {
    rv.push('<TextBlock Opacity="', this.globalAlpha);
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
          rv.push('<TextBlock.Foreground><RadialGradientBrush GradientOrigin="',
                  rgx, ',', rgy,
                  '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
                      _buildRadialColor(style),
                  '</RadialGradientBrush></TextBlock.Foreground>');
          break;
  case 3: rv.push('<TextBlock.Foreground><ImageBrush Stretch="None" ImageSource="',
                  style._src,
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
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
  var dim = uu.img.actsize(image),
      az = arguments.length, full = (az === 9),
      sx = full ? a1 : 0,
      sy = full ? a2 : 0,
      sw = full ? a3 : dim.w,
      sh = full ? a4 : dim.h,
      dx = full ? a5 : a1,
      dy = full ? a6 : a2,
      dw = full ? a7 : a3 || dim.w,
      dh = full ? a8 : a4 || dim.h,
      rv = [], fg, m,
      bw, bh, w, h, x, y, // slice
      tmpmtx, size = "", clip = "",
      zindex = 0, sclip = "",
      i = 0, iz, // for copy canvas
      // for shadow
      si = 0, so = 0, sd = 0, shx = 0, shy = 0,
      scolor = uu.color(this.shadowColor);

  switch (_COMPOSITES[this.globalCompositeOperation]) {
  case  4: zindex = --this._zindex; break;
  case 10: _clear(this);
  }

  if ("src" in image) { // image is HTMLImageElement
    switch (az) {
    case 3:
      m = uu.m2d.translate(dx, dy, this._mtx);
      break;
    case 5:
      m = uu.m2d.translate(dx, dy, this._mtx);
      size = '" Width="' + dw + '" Height="' + dh;
      break;
    case 9:
      // TODO: image ratio
      //
      bw = dw / sw; // bias width
      bh = dh / sh; // bias height
      w = bw * dim.w;
      h = bh * dim.h;
      x = dx - (bw * sx);
      y = dy - (bh * sy);
      m = uu.m2d.translate(x, y, this._mtx);

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

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

    if (scolor.a) {
      shx = _SHADOW_WIDTH / 2 + this.shadowOffsetX;
      shy = _SHADOW_WIDTH / 2 + this.shadowOffsetY;
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;
      tmpmtx = _buildMatrixTransform('Rectangle', m);

      for (; si < _SHADOW_WIDTH; so += sd, --shx, --shy, ++si) {
        rv.push('<Rectangle Opacity="', so.toFixed(2),
                '" Canvas.Left="', shx, '" Canvas.Top="', shy,
                size, '" Fill="', scolor.hex, '">', sclip,
                tmpmtx,
                '</Rectangle>');
      }
    }

    rv.push('<Image Opacity="', this.globalAlpha,
            '" Source="', image.src, size, '">',
            clip, _buildMatrixTransform('Image', m),
            scolor.a ? _buildShadowBlur(this, "Image", scolor) : "",
            '</Image></Canvas>');
  } else { // HTMLCanvasElement
    iz = image.uuctx2d._history.length;
    switch (az) {
    case 3:
      m = uu.m2d.translate(dx, dy, this._mtx);
      break;
    case 5:
      m = uu.m2d.translate(dx, dy, this._mtx);
      m = uu.m2d.scale(dw / dim.w, dh / dim.h, m);
      break;
    case 9:
      bw = dw / sw; // bias width
      bh = dh / sh; // bias height
      w = bw * dim.w;
      h = bh * dim.h;
      x = dx - (bw * sx);
      y = dy - (bh * sy);

      m = uu.m2d.translate(x, y, this._mtx);
      m = uu.m2d.scale(bw, bh, m);

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
    rv.push('<Canvas Canvas.ZIndex="', zindex,
            '" Opacity="', this.globalAlpha,
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
      sx = me.shadowOffsetX,
      sy = me.shadowOffsetY;

  if (color.a) {
    sdepth = Math.max(Math.abs(sx), Math.abs(sy)) * 1.2;
    return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
            '" Color="', color.hex,
            '" BlurRadius="', me.shadowBlur * 1.2,
            '" Direction="', Math.atan2(-sy, sx) * _TO_DEGREES,
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
    throw new Error("duplicate lock");
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

})(window, document, uu);

