
// === Silverlight Canvas ===
// depend: uu, uu.color, uu.img, uu.font, uu.canvas

//  <canvas width="300" height="150">   <- canvas
//      <object>                        <- content
//          <Canvas>                    <- view
//              <Path />
//          </Canvas>
//      </object>
//  </canvas>

//{{{!mb

uu.agein || (function(win, doc, uu) {
var _COMPOS = { "source-over": 0, "destination-over": 4, copy: 10 },
    _FIXED4 = /\.(\d{4})(?:[\d]+)/g, // toFixed(4)
    _TO_DEGREES = 180 / Math.PI, // Math.toDegrees - from java.math
    _FONT_STYLES = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    _FONT_WEIGHTS = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                      lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                      "300": "Light", "400": "Normal", "500": "Medium",
                      "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                      "900": "Black" };

uu.mix(uu.canvas.Silverlight.prototype, {
    arc:                    arc,
    arcTo:                  uunop,
    beginPath:              beginPath,
    bezierCurveTo:          bezierCurveTo,
    clear:                  clear,          // [EXTEND]
    clearRect:              clearRect,
    clip:                   clip,
    closePath:              closePath,
    createImageData:        uunop,
    createLinearGradient:   createLinearGradient,
    createPattern:          createPattern,
    createRadialGradient:   createRadialGradient,
    drawCircle:             drawCircle,     // [EXTEND]
    drawImage:              drawImage,
    drawRoundRect:          drawRoundRect,  // [EXTEND]
    fill:                   fill,
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           uunop,
    isPointInPath:          uunop,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           uunop,
    quadraticCurveTo:       quadraticCurveTo,
    rect:                   rect,
    restore:                restore,
    rotate:                 rotate,
    save:                   save,
    scale:                  scale,
    setTransform:           setTransform,
    stroke:                 stroke,
    strokeRect:             strokeRect,
    strokeText:             strokeText,
    transform:              transform,
    translate:              translate,
    unlock:                 unlock          // [EXTEND]
});

uu.canvas.Silverlight.init = init;
uu.canvas.Silverlight.build = build;

// uu.canvas.Silverlight.init
function init(ctx, node) { // @param Node: <canvas>
    initSurface(ctx);
    ctx.canvas = node;
    ctx._view = null;
    ctx._content = null;
    ctx._state = 0;      // 0x0: not ready
                         // 0x1: draw ready(normal)
                         // 0x2: + locked
                         // 0x4: + lazy clear
}

// uu.canvas.Silverlight.build
function build(canvas) { // @param Node: <canvas>
                         // @return Node:
    var ctx,
        // [ASYNC] initialized notify callback handler
        onload = "uuCanvasSilverlightOnLoad" + uu.guid();

    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return ctx;
    };

    // CanvasRenderingContext.toDataURL
    canvas.toDataURL = function() {
        return "data:,";
    };

    ctx = new uu.canvas.Silverlight(canvas);

    // wait for response from Silverlight initializer
    win[onload] = function(sender) { // @param Node: sender is <Canvas> node
        ctx._view = sender.children;
        ctx._content = sender.getHost().content; // getHost() -> <object>
        // dump
        if (ctx._stock.length) {
            var xaml = ctx._stock.join("");

            ctx._view.add(ctx._content.createFromXaml(
                "<Canvas>" + xaml + "</Canvas>"));
        }
        ctx._state = 0x1; // draw ready(locked flag off)
        ctx._stock = [];
    };

    // create Silverlight <object>
    canvas.innerHTML = [
        '<object type="application/x-silverlight-2" width="100%" height="100%">',
            '<param name="background" value="#00000000" />',  // transparent
            '<param name="windowless" value="true" />',
            '<param name="source" value="#xaml" />',          // XAML ID
            '<param name="onLoad" value="', onload, '" />',   // bond to global
        '</object>'].join("");

    // uncapture key events(release focus)
    function onFocus(evt) {
        var obj = evt.srcElement,     // <canvas><object /></canvas>
            canvas = obj.parentNode;  // <canvas>

        obj.blur();
        canvas.focus();
    }

    // trap <canvas width>, <canvas height> change event
    function onPropertyChange(evt) {
        var attr = evt.propertyName, width, height;

        if (attr === "width" || attr === "height") {
            initSurface(ctx);

            width  = parseInt(canvas.width);
            height = parseInt(canvas.height);

            // resize <canvas>
            canvas.style.pixelWidth  = width  < 0 ? 0 : width;
            canvas.style.pixelHeight = height < 0 ? 0 : height;

            ctx.clear();
        }
    }

    canvas.firstChild.attachEvent("onfocus", onFocus);
    canvas.attachEvent("onpropertychange", onPropertyChange);

    win.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        canvas.getContext = canvas.toDataURL = null;
        win.detachEvent("onunload", arguments.callee);
        canvas.detachEvent("onfocus", onFocus);
        canvas.detachEvent("onpropertychange", onPropertyChange);
        win[onload] = null;
    });
    return canvas;
}

// inner -
function initSurface(ctx) {
    // --- compositing ---
    ctx.globalAlpha     = 1;
    ctx.globalCompositeOperation = "source-over";
    // --- colors and styles ---
    ctx.strokeStyle     = "black"; // String or Object
    ctx.fillStyle       = "black"; // String or Object
    // --- line caps/joins ---
    ctx.lineWidth       = 1;
    ctx.lineCap         = "butt";
    ctx.lineJoin        = "miter";
    ctx.miterLimit      = 10;
    // --- shadows ---
    ctx.shadowBlur      = 0;
    ctx.shadowColor     = "transparent"; // transparent black
    ctx.shadowOffsetX   = 0;
    ctx.shadowOffsetY   = 0;
    // --- text ---
    ctx.font            = "10px sans-serif";
    ctx.textAlign       = "start";
    ctx.textBaseline    = "alphabetic";
    // --- current position ---
    ctx.px              = 0;    // current position x
    ctx.py              = 0;    // current position y
    // --- hidden properties ---
    ctx._stack          = [];   // matrix and prop stack.
    ctx._stock          = [];   // lock stock
    ctx._lineScale      = 1;
    ctx._scaleX         = 1;
    ctx._scaleY         = 1;
    ctx._zindex         = -1;
    ctx._matrixEffected = 0;    // 1: matrix effected
    ctx._matrix         = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
    ctx._history        = [];   // canvas rendering history
    ctx._path           = [];   // current path
    ctx._clipPath       = null; // clipping path
    ctx._clipRect       = null; // clipping rect
    ctx._strokeCache    = "";
    // --- extend properties ---
    ctx.xBackend        = "Silverlight";
    ctx.xFlyweight      = 0;    // 1 is animation mode
    ctx.xKnockoutColor  = "white"; // for strokeText
}

// inner -
function _copyprop(to, from) {
    to.globalAlpha      = from.globalAlpha;
    to.globalCompositeOperation = from.globalCompositeOperation;
    to.strokeStyle      = from.strokeStyle;
    to.fillStyle        = from.fillStyle;
    to.lineWidth        = from.lineWidth;
    to.lineCap          = from.lineCap;
    to.lineJoin         = from.lineJoin;
    to.miterLimit       = from.miterLimit;
    to.shadowBlur       = from.shadowBlur;
    to.shadowColor      = from.shadowColor;
    to.shadowOffsetX    = from.shadowOffsetX;
    to.shadowOffsetY    = from.shadowOffsetY;
    to.font             = from.font;
    to.textAlign        = from.textAlign;
    to.textBaseline     = from.textBaseline;
    to._lineScale       = from._lineScale;
    to._scaleX          = from._scaleX;
    to._scaleY          = from._scaleY;
    to._matrixEffected  = from._matrixEffected;
    to._matrix          = from._matrix.concat();
    to._clipPath        = from._clipPath;
    return to;
}

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    var deg1 = startAngle * _TO_DEGREES,
        deg2 = endAngle * _TO_DEGREES,
        isLargeArc = 0,
        magic = 0.0001570796326795,
        sweepDirection = anticlockwise ? 0 : 1,
        sx, sy, ex, ey, rx, ry, m, _ex, _ey;

    // angle normalize
    (deg1 < 0)   && (deg1 += 360);
    (deg1 > 360) && (deg1 -= 360);
    (deg2 < 0)   && (deg2 += 360);
    (deg2 > 360) && (deg2 -= 360);

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

    sx = Math.cos(startAngle) * radius + x;
    sy = Math.sin(startAngle) * radius + y;
    ex = Math.cos(endAngle)   * radius + x;
    ey = Math.sin(endAngle)   * radius + y;

    // add <PathFigure StartPoint="..">
    this._path.length ? this.lineTo(sx, sy)
                      : this.moveTo(sx, sy);

    if (this._matrixEffected) {
        m = this._matrix, _ex = ex, _ey = ey;

        ex = _ex * m[0] + _ey * m[3] + m[6]; // x * m11 + y * m21 + dx
        ey = _ex * m[1] + _ey * m[4] + m[7]; // x * m12 + y * m22 + dy
    }
    this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                    sweepDirection, " ", ex, " ", ey);
}

// CanvasRenderingContext2D.prototype.arcTo
//function arcTo(x1, y1, x2, y2, radius) {
    /*
     *  The original writer in code block is mindcat.
     *
     *  http://d.hatena.ne.jp/mindcat/20100131/
     */
/*
    var m = this._matrix,
        _x0 = this.px,
        _y0 = this.py,
        _x1 = x1,
        _y1 = y1,
        _x2 = x2,
        _y2 = y2,
        x0, y0, a1, b1, a2, b2, mm,
        dd, cc, tt, k1, k2, j1, j2, cx, cy, px, py, qx, qy,
        ang1, ang2;

    x0 = _x0 * m[0] + _y0 * m[3] + m[6];
    y0 = _x0 * m[1] + _y0 * m[4] + m[7];
    x1 = _x1 * m[0] + _y1 * m[3] + m[6];
    y1 = _x1 * m[1] + _y1 * m[4] + m[7];
    x2 = _x2 * m[0] + _y2 * m[3] + m[6];
    y2 = _x2 * m[1] + _y2 * m[4] + m[7];

    a1 = y0 - y1;
    b1 = x0 - x1;
    a2 = y2 - y1;
    b2 = x2 - x1;
    mm = Math.abs(a1 * b2 - b1 * a2);

    if (!mm || !radius) {
        this.lineTo(x1, y1);
        return;
    }
    dd = a1 * a1 + b1 * b1;
    cc = a2 * a2 + b2 * b2;
    tt = a1 * a2 + b1 * b2;
    k1 = radius * Math.sqrt(dd) / mm;
    k2 = radius * Math.sqrt(cc) / mm;
    j1 = k1 * tt / dd;
    j2 = k2 * tt / cc;
    cx = k1 * b2 + k2 * b1;
    cy = k1 * a2 + k2 * a1;
    px = b1 * (k2 + j1);
    py = a1 * (k2 + j1);
    qx = b2 * (k1 + j2);
    qy = a2 * (k1 + j2);
    ang1 = Math.atan2(py - cy, px - cx);
    ang2 = Math.atan2(qy - cy, qx - cx);

    this.lineTo(px + x1, py + y1);
    this.arc(cx + x1, cy + y1, radius,
             ang1, ang2, b1 * a2 > b2 * a1);
}
  */

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    this._path = [];
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (this._matrixEffected) {
        var m = this._matrix,
            _1x = cp1x, _1y = cp1y, _2x = cp2x, _2y = cp2y, _x = x, _y = y;

        cp1x = _1x * m[0] + _1y * m[3] + m[6];
        cp1y = _1x * m[1] + _1y * m[4] + m[7];
        cp2x = _2x * m[0] + _2y * m[3] + m[6];
        cp2y = _2x * m[1] + _2y * m[4] + m[7];
           x =  _x * m[0] +  _y * m[3] + m[6];
           y =  _x * m[1] +  _y * m[4] + m[7];
    }
    // add begin point
    this._path.length || this._path.push(" M", cp1x, " ", cp1y);

    this._path.push(" C", cp1x, " ", cp1y, " ",
                          cp2x, " ", cp2y, " ", x, " ", y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    this.xFlyweight || (this._history = []);
    this._zindex = 0;
    this._state ? this._view.clear() : (this._stock = []);
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    w = parseInt(w);
    h = parseInt(h);

    if ((!x && !y && w >= this.canvas.width && h >= this.canvas.height)) {
        this.clear();
    } else {
        if (this.globalCompositeOperation !== this._mix) {
            this.__mix = _COMPOS[this._mix = this.globalCompositeOperation];
        }

        var color = uu.canvas.bgcolor(this.canvas),
            zindex = (this.__mix ===  4) ? --this._zindex
                   : (this.__mix === 10) ? (this.clear(), 0) : 0,
            fg = '<Path Opacity="' + (this.globalAlpha * color.a) +
                 '" Canvas.ZIndex="' + zindex +
                 '" Fill="' + color.hex +
                 '" Data="' + _rect(this, x, y, w, h) + '" />';

        this.xFlyweight ||
            this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
        this._state !== 0x1 ? this._stock.push(fg)
                            : this._view.add(this._content.createFromXaml(fg));
    }
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
    this._clipPath = this._path.join("");
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
    this._path.push(" Z");
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) { // @return Hash:
    function CanvasGradient(x0, y0, x1, y1) {
        this.fn = _linearGradientFill;
        this.param = { x0: x0, y0: y0, x1: x1, y1: y1 };
        this.color = [];
        this.colors = "";
        this.addColorStop = addColorStop;
    }
    return new CanvasGradient(x0, y0, x1, y1);
}

// CanvasGradient.prototype.addColorStop
function addColorStop(offset, color) {
    this.color.push({ offset: offset, color: uu.color(color) });
    this.color.sort(function(a, b) {
        return a.offset - b.offset;
    });
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image,    // @param HTMLImageElement/HTMLCanvasElement:
                       repeat) { // @param String(= "repeat"): repetition
                                 // @return Hash:
    function CanvasPattern(image, repeat) {
        this.fn = _patternFill;
        this.src = image.src; // HTMLImageElement
        this.dim = uu.img.size(image);
        this.type = 3; // 3:tile
        this.repeat = repeat;
    }
    repeat = repeat || "repeat";

    switch (repeat) {
    case "repeat": break;
    default: throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!("src" in image)) { // HTMLCanvasElement unsupported
        throw new Error("NOT_SUPPORTED_ERR");
    }
    return new CanvasPattern(image, repeat);
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) { // @return CanvasGradient:
    function CanvasGradient(x0, y0, r0, x1, y1, r1) {
        this.fn = _radialGradientFill;
        this.param = { x0: x0, y0: y0, r0: r0,
                       x1: x1, y1: y1, r1: r1 };
        this.color = [];
        this.colors = "";
        this.addColorStop = addColorStop;
    }
    return new CanvasGradient(x0, y0, r0, x1, y1, r1);
}

// CanvasRenderingContext2D.prototype.drawCircle
function drawCircle(x,           // @param Number:
                    y,           // @param Number:
                    radius,      // @param Number: radius
                    fillColor,   // @param ColorHash(= void 0): fillColor
                    strokeColor, // @param ColorHash(= void 0): strokeColor
                    lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha <= 0) {
        return;
    }

    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            a  = fillColor ? fillColor.a : strokeColor.a,
            fg = '<Ellipse Canvas.Left="' + (x - radius) +
                 '" Canvas.Top="'   + (y - radius) +
                 '" Opacity="'      + (this.globalAlpha * a) +
                 '" Width="'        + (radius * 2) +
                 '" Height="'       + (radius * 2);

        if (fillColor) {
            fg +=   '" Fill="' + fillColor.hex;
        }
        if (strokeColor && lw) {
            fg +=   '" Stroke="' + strokeColor.hex +
                    '" StrokeThickness="' + lw;
        }
        fg += '" />';

        this._state !== 0x1 ? this._stock.push(fg)
                            : this._view.add(this._content.createFromXaml(fg));
    }
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    if (this.globalAlpha <= 0) {
        return;
    }

    if (this.shadowColor !== this._shadowColor) {
        this.__shadowColor = uu.color(this._shadowColor = this.shadowColor);
    }
    if (this.globalCompositeOperation !== this._mix) {
        this.__mix = _COMPOS[this._mix = this.globalCompositeOperation];
    }

    var dim = uu.img.size(image), // img actual size
        args = arguments.length, full = (args === 9),
        sx = full ? a1 : 0,
        sy = full ? a2 : 0,
        sw = full ? a3 : dim.w,
        sh = full ? a4 : dim.h,
        dx = full ? a5 : a1,
        dy = full ? a6 : a2,
        dw = full ? a7 : a3 || dim.w,
        dh = full ? a8 : a4 || dim.h,
        fg, m, x, y, w, h, bw, bh,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        renderShadow = this.__shadowColor.a && this.shadowBlur,
        shadow, matrix, history;

    if (image.src) { // HTMLImageElement
        switch (args) {
        case 3:
            //  [[arg3]]
            //  <Canvas Canvas.ZIndex="?">
            //      <Image Opacity="?" Source="?">
            //          <Image.RenderTransform>
            //              <MatrixTransform>
            //                  <MatrixTransform.Matrix>
            //                      <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
            //                  </MatrixTransform.Matrix>
            //              </MatrixTransform>
            //          </Image.RenderTransform>
            //          <Image.Effect>
            //              <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
            //          </Image.Effect>
            //      </Image>
            //  </Canvas>
            shadow = renderShadow ? _dropShadow(this, "Image", this.__shadowColor) : "";
            matrix = _matrix("Image", uu.m2d.translate(dx, dy, this._matrix));

            fg = uu.fmt('<Canvas Canvas.ZIndex="?"><Image Opacity="?" Source="?">??</Image></Canvas>',
                        [zindex, this.globalAlpha, image.src, matrix, shadow]);
            break;
        case 5:
            //  [[arg5]]
            //  <Canvas Canvas.ZIndex="?">
            //      <Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill">
            //                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //          <Image.RenderTransform>
            //              <MatrixTransform>
            //                  <MatrixTransform.Matrix>
            //                      <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
            //                  </MatrixTransform.Matrix>
            //              </MatrixTransform>
            //          </Image.RenderTransform>
            //          <Image.Effect>
            //              <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
            //          </Image.Effect>
            //      </Image>
            //  </Canvas>
            shadow = renderShadow ? _dropShadow(this, "Image", this.__shadowColor) : "";
            matrix = _matrix("Image", uu.m2d.translate(dx, dy, this._matrix));

            fg = uu.fmt('<Canvas Canvas.ZIndex="?"><Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill">??</Image></Canvas>',
                        [zindex, this.globalAlpha, image.src, dw, dh, matrix, shadow]);
            break;
        case 9:
            //  [[arg9]]
            //  <Canvas Canvas.ZIndex="?">
            //      <Canvas>
            //          <Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill">
            //                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //              <Image.Clip>
            //                  <RectangleGeometry Rect="? ? ? ?" />
            //              </Image.Clip>
            //          </Image>
            //      </Canvas>
            //      <Canvas.RenderTransform>
            //          <MatrixTransform>
            //              <MatrixTransform.Matrix>
            //                  <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
            //              </MatrixTransform.Matrix>
            //          </MatrixTransform>
            //      </Canvas.RenderTransform>
            //      <Canvas.Effect>
            //          <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
            //      </Canvas.Effect>
            //  </Canvas>
            bw = dw / sw; // bias width
            bh = dh / sh; // bias height
            w = (bw * dim.w) | 0;
            h = (bh * dim.h) | 0;
            x = dx - (bw * sx);
            y = dy - (bh * sy);

            shadow = renderShadow ? _dropShadow(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", uu.m2d.translate(x, y, this._matrix));

            fg = uu.fmt('<Canvas Canvas.ZIndex="?"><Canvas><Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill"><Image.Clip><RectangleGeometry Rect="?" /></Image.Clip></Image></Canvas>??</Canvas>',
                        [zindex, this.globalAlpha, image.src, w, h, [dx - x, dy - y, dw, dh].join(" "), matrix, shadow]);
        }
    } else { // HTMLCanvasElement
        history = image.getContext("2d")._history.join("");

        switch (args) {
        case 3:
        case 5:
            //  [[arg3]] and [[arg5]]
            //  <Canvas Canvas.ZIndex="?" Opacity="?">
            //      <Canvas>
            //
            //          <Canvas>History...</Canvas>
            //
            //      </Canvas>
            //      <Canvas.RenderTransform>
            //          <MatrixTransform>
            //              <MatrixTransform.Matrix>
            //                  <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
            //              </MatrixTransform.Matrix>
            //          </MatrixTransform>
            //      </Canvas.RenderTransform>
            //      <Canvas.Effect>
            //          <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
            //      </Canvas.Effect>
            //  </Canvas>
            m = uu.m2d.translate(dx, dy, this._matrix);
            shadow = renderShadow ? _dropShadow(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", args === 3 ? m : uu.m2d.scale(dw / dim.w, dh / dim.h, m));

            fg = uu.fmt('<Canvas Canvas.ZIndex="?" Opacity="?"><Canvas>?</Canvas>??</Canvas>',
                        [zindex, this.globalAlpha, history, matrix, shadow]);
            break;
        case 9:
            //  [[arg9]]
            //  <Canvas Canvas.ZIndex="?" Opacity="?">
            //      <Canvas>
            //
            //          <Canvas>History...</Canvas>
            //
            //          <Canvas.Clip>
            //              <RectangleGeometry Rect="?" />
            //          </Canvas.Clip>
            //      </Canvas>
            //      <Canvas.RenderTransform>
            //          <MatrixTransform>
            //              <MatrixTransform.Matrix>
            //                  <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
            //              </MatrixTransform.Matrix>
            //          </MatrixTransform>
            //      </Canvas.RenderTransform>
            //      <Canvas.Effect>
            //          <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
            //      </Canvas.Effect>
            //  </Canvas>
            bw = dw / sw; // bias width
            bh = dh / sh; // bias height
            w = bw * dim.w;
            h = bh * dim.h;
            x = dx - (bw * sx);
            y = dy - (bh * sy);

            m = uu.m2d.translate(x, y, this._matrix);
            shadow = renderShadow ? _dropShadow(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", uu.m2d.scale(bw, bh, m));

            fg = uu.fmt('<Canvas Canvas.ZIndex="?" Opacity="?"><Canvas>?<Canvas.Clip><RectangleGeometry Rect="?" /></Canvas.Clip></Canvas>??</Canvas>',
                        [zindex, this.globalAlpha, history,
                         [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
                        matrix, shadow]);
        }
    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.drawRoundRect - round rect
function drawRoundRect(x,           // @param Number:
                       y,           // @param Number:
                       width,       // @param Number:
                       height,      // @param Number:
                       radius,      // @param Array: [top-left, top-right, bottom-right, bottom-left]
                       fillColor,   // @param ColorHash(= void 0): fillColor
                       strokeColor, // @param ColorHash(= void 0): strokeColor
                       lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha <= 0) {
        return;
    }

    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            a  = fillColor ? fillColor.a : strokeColor.a, fg, endTag;

        if (radius[0] === radius[1]
            && radius[0] === radius[2]
            && radius[0] === radius[3]) {

            fg = '<Rectangle Canvas.Left="' + x + '" Canvas.Top="' + y +
                    '" Width="' + width + '" Height="' + height +
                    '" RadiusX="' + radius[0] + '" RadiusY="' + radius[0] +
                    '" Opacity="' + (this.globalAlpha * a);
            endTag = '" />';
        } else {
            fg = '<Canvas><Path Opacity="' + (this.globalAlpha * a) +
                    '" Data="' + _buildRoundRectPath(x, y, width, height, radius);
            endTag = '"></Path></Canvas>';
        }

        if (fillColor) {
            fg +=   '" Fill="' + fillColor.hex;
        }
        if (strokeColor && lw) {
            fg +=   '" Stroke="' + strokeColor.hex +
                    '" StrokeThickness="' + lw;
        }
        fg += endTag;

        this._state !== 0x1 ? this._stock.push(fg)
                            : this._view.add(this._content.createFromXaml(fg));
    }
}

// inner - build round rect paths
function _buildRoundRectPath(x, y, width, height, radius) {
    var w = width, h = height,
        r0 = radius[0], r1 = radius[1],
        r2 = radius[2], r3 = radius[3],
        w2 = (width  / 2) | 0, h2 = (height / 2) | 0;

    r0 < 0 && (r0 = 0);
    r1 < 0 && (r1 = 0);
    r2 < 0 && (r2 = 0);
    r3 < 0 && (r3 = 0);
    (r0 >= w2 || r0 >= h2) && (r0 = Math.min(w2, h2) - 2);
    (r1 >= w2 || r1 >= h2) && (r1 = Math.min(w2, h2) - 2);
    (r2 >= w2 || r2 >= h2) && (r2 = Math.min(w2, h2) - 2);
    (r3 >= w2 || r3 >= h2) && (r3 = Math.min(w2, h2) - 2);

    return [" M", x, " ", y + h2,                           // ctx.moveTo(x, y + h2)
            " L", x, " ", y + h - r3,                       // ctx.lineTo(x, y + h - r3);
            " Q", x, " ", y + h, " ", x + r3, " ", y + h,   // ctx.quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
            " L", x + w - r2, " ", y + h,                   // ctx.lineTo(x + w - r2, y + h);
            " Q", x + w, " ", y + h, " ", x + w, " ",
                                          y + h - r2,       // ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
            " L", x + w, " ", y + r1,                       // ctx.lineTo(x + w, y + r1);
            " Q", x + w, " ", y, " ", x + w - r1, " ", y,   // ctx.quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
            " L", x + r0, " ", y,                           // ctx.lineTo(x + r0, y);
            " Q", x, " ", y, " ", x, " ", y + r0,           // ctx.quadraticCurveTo(x, y, x, y + r0); // top-right
            " Z"].join("");                                 // ctx.closePath();
}

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h), 1);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    if (this._matrixEffected) {
        var m = this._matrix, _x = x, _y = y;

        x = _x * m[0] + _y * m[3] + m[6]; // x * m11 + y * m21 + dx
        y = _x * m[1] + _y * m[4] + m[7]; // x * m12 + y * m22 + dy
    }
    this._path.length || this._path.push(" M", x, " ", y);
    this._path.push(" L", x, " ", y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.lock
function lock(clearScreen) { // @param Boolean(= false):
    if (this._state & 0x2) {
        throw new Error("DUPLICATE_LOCK");
    }
    this._state |= clearScreen ? 0x6 : 0x2;
}

// CanvasRenderingContext2D.prototype.measureText
function measureText(text) {
    var metric = uu.font.metric(this.font, text);

    return { width: metric.w, height: metric.h };
}

// CanvasRenderingContext2D.prototype.moveTo
function moveTo(x, y) {
    if (this._matrixEffected) {
        var m = this._matrix, _x = x, _y = y;

        x = _x * m[0] + _y * m[3] + m[6]; // x * m11 + y * m21 + dx
        y = _x * m[1] + _y * m[4] + m[7]; // x * m12 + y * m22 + dy
    }
    this._path.push(" M", x, " ", y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    if (this._matrixEffected) {
        var m = this._matrix, _1x = cpx, _1y = cpy, _x = x, _y = y;

        cpx = _1x * m[0] + _1y * m[3] + m[6]; // x * m11 + y * m21 + dx
        cpy = _1x * m[1] + _1y * m[4] + m[7]; // x * m12 + y * m22 + dy
          x =  _x * m[0] +  _y * m[3] + m[6]; // x * m11 + y * m21 + dx
          y =  _x * m[1] +  _y * m[4] + m[7]; // x * m12 + y * m22 + dy
    }
    this._path.length || this._path.push(" M", cpx, " ", cpy);
    this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this._path.push(_rect(this, x, y, w, h));
    this.px = x;
    this.py = y;
}

// inner -
function _rect(ctx, x, y, w, h) {
    if (ctx._matrixEffected) {
        var m = ctx._matrix, xw = x + w, yh = y + h;

        return [" M", x  * m[0] + y  * m[3] + m[6], " ", x  * m[1] + y  * m[4] + m[7],
                " L", xw * m[0] + y  * m[3] + m[6], " ", xw * m[1] + y  * m[4] + m[7],
                " L", xw * m[0] + yh * m[3] + m[6], " ", xw * m[1] + yh * m[4] + m[7],
                " L", x  * m[0] + yh * m[3] + m[6], " ", x  * m[1] + yh * m[4] + m[7],
                " Z"].join("");
    }
    return [" M", x,     " ", y,     " L", x + w, " ", y,
            " L", x + w, " ", y + h, " L", x,     " ", y + h,
            " Z"].join("");
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this._matrixEffected = 1;
    this._matrix = uu.m2d.rotate(angle, this._matrix);
}

// CanvasRenderingContext2D.prototype.save
function save() {
    var prop = _copyprop({}, this);

    prop._clipPath = this._clipPath ? String(this._clipPath) : null;
    this._stack.push(prop);
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
    this._matrixEffected = 1;
    this._matrix = uu.m2d.scale(x, y, this._matrix);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._matrix[0] + this._matrix[4]) / 2;
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
    this._matrixEffected = 1;
    if (m11 === 1 && !m12 && m22 === 1 && !m21 && !dx && !dy) {
        this._matrixEffected = 0; // reset _matrixEffected flag
    }
    this._matrix = [m11, m12, 0,  m21, m22, 0,  dx, dy, 1];
}

// CanvasRenderingContext2D.prototype.stroke
function stroke(path, fill) {
    if (this.globalAlpha <= 0) {
        return;
    }
    if (this.shadowColor !== this._shadowColor) {
        this.__shadowColor = uu.color(this._shadowColor = this.shadowColor);
    }
    if (this.strokeStyle !== this._strokeStyle) {
        if (typeof this.strokeStyle === "string") {
            this.__strokeStyle = uu.color(this._strokeStyle = this.strokeStyle);
        }
    }
    if (this.fillStyle !== this._fillStyle) {
        if (typeof this.fillStyle === "string") {
            this.__fillStyle = uu.color(this._fillStyle = this.fillStyle);
        }
    }
    if (this.globalCompositeOperation !== this._mix) {
        this.__mix = _COMPOS[this._mix = this.globalCompositeOperation];
    }

    // avoid Silverlight MaxPathLength = 32768
    //    (123.456789).toFixed(4) -> "123.4567"
    path = (path || this._path.join("")).replace(_FIXED4, ".$1");

    var fg, shadow = "", more,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        color = fill ? this.fillStyle : this.strokeStyle;

    if (typeof color !== "string") {
        fg = color.fn(this, color, path, fill, zindex);
    } else {
        // [!] Data="F1 " -> FillRule=Nonzero
        // http://twitter.com/uupaa/status/5179317486
        color = fill ? this.__fillStyle : this.__strokeStyle;

        // [SPEED OPTIMIZED]
        more = fill ? "F1" + path + '" Fill="' + color.hex
                    : path + _stroke(this) + '" Stroke="' + color.hex;

        if (this.__shadowColor.a && this.shadowBlur) {
            shadow = _dropShadow(this, "Path", this.__shadowColor);
        }
        fg = '<Canvas Canvas.ZIndex="' + zindex +
                '"><Path Opacity="' + (this.globalAlpha * color.a) +
                '" Data="' + more + '">' + shadow + '</Path></Canvas>';
    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
    if (fill) {
        _strokeText(this, text, x, y, maxWidth, fill);
    } else {
        var fillStyle = this.fillStyle; // save

        _strokeText(this, text, x, y, maxWidth, 0);

        this.fillStyle = this.xKnockoutColor;
        _strokeText(this, text, x, y, maxWidth, 1);

        this.fillStyle = fillStyle; // restore
    }
}

function _strokeText(ctx, text, x, y, maxWidth, fill) {
    if (ctx.globalAlpha <= 0) {
        return;
    }
    if (ctx.shadowColor !== ctx._shadowColor) {
        ctx.__shadowColor = uu.color(ctx._shadowColor = ctx.shadowColor);
    }
    if (ctx.strokeStyle !== ctx._strokeStyle) {
        if (typeof ctx.strokeStyle === "string") {
            ctx.__strokeStyle = uu.color(ctx._strokeStyle = ctx.strokeStyle);
        }
    }
    if (ctx.fillStyle !== ctx._fillStyle) {
        if (typeof ctx.fillStyle === "string") {
            ctx.__fillStyle = uu.color(ctx._fillStyle = ctx.fillStyle);
        }
    }
    if (ctx.globalCompositeOperation !== ctx._mix) {
        ctx.__mix = _COMPOS[ctx._mix = ctx.globalCompositeOperation];
    }

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    var style = fill ? ctx.fillStyle : ctx.strokeStyle,
        zindex = (ctx.__mix ===  4) ? --ctx._zindex
               : (ctx.__mix === 10) ? (ctx.clear(), 0) : 0,
        rv = [], fg, color,
        fp, m = ctx._matrix, x0, y0, x1, y1,
        font = uu.font.parse(ctx.font, ctx.canvas),
        metric = uu.font.metric(font.formal, text),
        offX = 0, align = ctx.textAlign, dir = "ltr";

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
        align = ctx.canvas.currentStyle.direction === dir ? "left" : "right"
    }
    switch (align) {
    case "center": offX = (metric.w - 4) / 2; break; // -4: adjust
    case "right":  offX = metric.w;
    }

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');
    if (typeof style === "string") {
        color = fill ? ctx.__fillStyle : ctx.__strokeStyle;
        rv.push('<TextBlock Opacity="', (ctx.globalAlpha * color.a),
                '" Foreground="', color.hex);
    } else {
        rv.push('<TextBlock Opacity="', ctx.globalAlpha);
    }
    rv.push('" FontFamily="', font.rawfamily,
            '" FontSize="', font.size.toFixed(2),
            '" FontStyle="', _FONT_STYLES[font.style] || "Normal",
            '" FontWeight="', _FONT_WEIGHTS[font.weight] || "Normal",
            '">', uu.esc(text),
                _matrix('TextBlock', uu.m2d.translate(x - offX, y, ctx._matrix)));

    if (fill) {
        rv.push((ctx.__shadowColor.a &&
                 ctx.shadowBlur) ? _dropShadow(ctx, "TextBlock", ctx.__shadowColor) : "");
    } else {
        rv.push('<TextBlock.Effect><BlurEffect Radius="3" /></TextBlock.Effect>');
    }

    if (typeof style === "string") {
        ;
    } else if (style.fn === _radialGradientFill) {
        fp = style.param,
        x0 = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
        y0 = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),

        rv.push('<TextBlock.Foreground><RadialGradientBrush GradientOrigin="',
                x0, ',', y0,
                '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
                    style.colors || _radialColor(style),
                '</RadialGradientBrush></TextBlock.Foreground>');

    } else if (style.fn === _linearGradientFill) {
        fp = style.param;

        x0 = fp.x0 * m[0] + fp.y0 * m[3] + m[6]; // x * m11 + y * m21 + dx
        y0 = fp.x0 * m[1] + fp.y0 * m[4] + m[7]; // x * m12 + y * m22 + dy
        x1 = fp.x1 * m[0] + fp.x1 * m[3] + m[6]; // x * m11 + y * m21 + dx
        y1 = fp.y1 * m[1] + fp.y1 * m[4] + m[7]; // x * m12 + y * m22 + dy

        rv.push('<TextBlock.Foreground>',
                '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                x0, ",", y0,
                '" EndPoint="', x1, ",", y1, '">',
                    style.colors || _linearColor(style),
                '</LinearGradientBrush></TextBlock.Foreground>');

    } else { // pattern
        rv.push('<TextBlock.Foreground><ImageBrush Stretch="None" ImageSource="',
                style.src,
                '" /></TextBlock.Foreground>');
    }
    rv.push('</TextBlock></Canvas>');
    fg = rv.join("");

    ctx.xFlyweight ||
        ctx._history.push(ctx._clipPath ? (fg = _clippy(ctx, fg)) : fg);
    ctx._state !== 0x1 ? ctx._stock.push(fg)
                       : ctx._view.add(ctx._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    this._matrixEffected = 1;
    this._matrix = uu.m2d.transform(m11, m12, m21, m22, dx, dy, this._matrix);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this._matrixEffected = 1;
    this._matrix = uu.m2d.translate(x, y, this._matrix);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    switch (this._state) {
    case 0x7: // [INLINE][LAZY] // this.clear();
            this.xFlyweight || (this._history = []);
            this._zindex = 0;
            this._state ? this._view.clear() : (this._stock = []);
            // break; [THROUGH]
    case 0x3:
            this._state = 0x1; // unlock
            if (this._stock.length) {
                this._view.add(this._content.createFromXaml(
                        "<Canvas>" + this._stock.join("") + "</Canvas>"));
                this._stock = [];
            }
    }
}

// inner - Linear Gradient Fill
function _linearGradientFill(ctx, obj, path, fill, zindex) {
    var rv = [],
        fp = obj.param,
        m  = ctx._matrix,
        x0 = fp.x0,
        y0 = fp.y0,
        x1 = fp.x1,
        y1 = fp.y1,
        prop = fill ? "Fill" : "Stroke";

    if (ctx._matrixEffected) {
        x0 = fp.x0 * m[0] + fp.y0 * m[3] + m[6], // x * m11 + y * m21 + dx
        y0 = fp.x0 * m[1] + fp.y0 * m[4] + m[7]  // x * m12 + y * m22 + dy
        x1 = fp.x1 * m[0] + fp.y1 * m[3] + m[6], // x * m11 + y * m21 + dx
        y1 = fp.x1 * m[1] + fp.y1 * m[4] + m[7]  // x * m12 + y * m22 + dy
    }

    rv.push('<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            '" Data="', path,
            fill ? "" : _stroke(ctx), '"><Path.', prop,
            '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
                x0, ",", y0, '" EndPoint="', x1, ",", y1, '">',
              obj.colors || _linearColor(obj),
            '</LinearGradientBrush></Path.', prop, '>',
            (ctx.__shadowColor.a && ctx.shadowBlur) ? _dropShadow(ctx, "Path", ctx.__shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(ctx, obj, path, fill, zindex) {
    var rv = [], prop = fill ? "Fill" : "Stroke",
        fp = obj.param,
        zindex2 = 0,
        rr = fp.r1 * 2,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
        gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
        m = uu.m2d.translate(x, y, ctx._matrix),
        tmpmtx = _matrix('Ellipse', m),
        v, bari = "";

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

    if (fill) {
        // fill outside
        if (obj.color.length) {
            v = obj.color[obj.color.length - 1];
            if (v.color.a > 0.001) {
                if (ctx.__mix === 4) {
                    zindex2 = --ctx._zindex;
                }
                bari =  [ '<Path Opacity="', ctx.globalAlpha,
                          '" Canvas.ZIndex="', zindex2,
                          '" Data="', path, '" Fill="', v.color.argb, '" />'].join("");
                !ctx.xFlyweight &&
                  ctx._history.push(ctx._clipPath ? (bari = _clippy(ctx, bari)) : bari);
                ctx._state !== 0x1 ? ctx._stock.push(bari)
                                   : ctx._view.add(ctx._content.createFromXaml(bari));
            }
        }
    }

    rv.push('<Ellipse Opacity="', ctx.globalAlpha,
            '" Width="', rr, '" Height="', rr,
            fill ? "" : _stroke(ctx),
            '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
            gx, ',', gy,
            '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
              obj.colors || _radialColor(obj),
            '</RadialGradientBrush></Ellipse.', prop, '>',
              tmpmtx,
              (ctx.__shadowColor.a && ctx.shadowBlur) ? _dropShadow(ctx, "Ellipse", ctx.__shadowColor) : "",
            '</Ellipse></Canvas>');
    return rv.join("");
}

// inner - Pattern Fill
function _patternFill(ctx, obj, path, fill, zindex) {
    var img = [], shadow, zindex2 = 0,
        sw, sh, xz, yz, x, y; // use tile mode

    if (fill) {
        x  = 0;
        y  = 0;
        sw = obj.dim.w;
        sh = obj.dim.h;
        xz = Math.ceil(parseInt(ctx.canvas.width)  / sw);
        yz = Math.ceil(parseInt(ctx.canvas.height) / sh);

        if (ctx.__mix === 4) {
            zindex2 = --ctx._zindex;
        }
        // --- pattern fill ---
        //      <Canvas Canvas.ZIndex="?">
        //          <Canvas Canvas.ZIndex="?" Clip="?">
        //              <Image Opacity="?" Canvas.Left="?" Canvas.Top="?" Source="?">
        //              </Image>
        //              <Image />
        //                  :
        //              <Image />
        //          </Canvas>
        //          <Canvas.RenderTransform>
        //              <MatrixTransform>
        //                  <MatrixTransform.Matrix>
        //                      <Matrix M11="?" M21="?" OffsetX="?" M12="?" M22="?" OffsetY="?" />
        //                  </MatrixTransform.Matrix>
        //              </MatrixTransform>
        //          </Canvas.RenderTransform>
        //          <Canvas.Effect>
        //              <DropShadowEffect Opacity="?" Color="?" BlurRadius="?" Direction="?" ShadowDepth="?" />
        //          </Canvas.Effect>
        //      </Canvas>
        //
        shadow = ctx.__shadowColor.a && ctx.shadowBlur ? _dropShadow(ctx, "Canvas", ctx.__shadowColor) : "";

        // TileBrush simulate
        for (y = 0; y < yz; ++y) {
            for (x = 0; x < xz; ++x) {
                img.push('<Image Opacity="', ctx.globalAlpha,
                         '" Canvas.Left="', x * sw, '" Canvas.Top="', y * sh,
                         '" Source="', obj.src, '"></Image>');
            }
        }
        return uu.fmt('<Canvas Canvas.ZIndex="?"><Canvas Canvas.ZIndex="?" Clip="?">?</Canvas>?</Canvas>',
                      [zindex, zindex2, path, img.join(""), shadow]);
    }

    return ['<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            fill ? "" : _stroke(ctx),
            '" Data="', path,
            '"><Path.Stroke><ImageBrush Stretch="None" ImageSource="',
            obj.src,
            '" /></Path.Stroke>',
            (ctx.__shadowColor.a && ctx.shadowBlur) ? _dropShadow(ctx, "Path", ctx.__shadowColor) : "",
            '</Path></Canvas>'].join("");
}

// inner -
function _clippy(ctx, fg) {
    return '<Canvas Clip="' + ctx._clipPath + '">' + fg + '</Canvas>';
}

// inner - build Linear Color
function _linearColor(obj) { // @param CanvasGradient:
                             // @return String:
    var rv = [], ary = obj.color, v, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        v = ary[i];
        rv.push('<GradientStop Color="' + v.color.argb +
                '" Offset="' + v.offset + '" />');
    }
    return obj.colors = rv.join(""); // bond
}

// inner - build Radial Color
function _radialColor(obj) { // @param CanvasGradient:
                             // @return String:
    var rv = [], ary = obj.color,  v, i = 0, iz = ary.length,
        fp = obj.param,
        r0 = fp.r0 / fp.r1,
        remain = 1 - r0;

    if (!iz) {
        return obj.colors = " ";
    }
    rv.push('<GradientStop Color="', ary[0].color.argb, '" Offset="0" />');
    for (i = 0; i < iz; ++i) {
        v = ary[i];
        rv.push('<GradientStop Color="' + v.color.argb +
                '" Offset="' + (v.offset * remain + r0) + '" />');
    }
    return obj.colors = rv.join(""); // bond
}

// inner - build MatrixTransform
function _matrix(type, m) {
    return [
        '<', type,
        '.RenderTransform><MatrixTransform><MatrixTransform.Matrix><Matrix M11="',
                   m[0], '" M21="', m[3], '" OffsetX="', m[6],
        '" M12="', m[1], '" M22="', m[4], '" OffsetY="', m[7],
        '" /></MatrixTransform.Matrix></MatrixTransform></', type,
        '.RenderTransform>'].join("");
}

// inner - build DropShadow
function _dropShadow(ctx,     // @param this:
                     type,    // @param String: "TextBlock", "Image", "Path", "Ellipse"
                     color) { // @param ColorHash:
    var sdepth = 0,
        sx = ctx.shadowOffsetX,
        sy = ctx.shadowOffsetY;

    if (color.a) {
        sdepth = Math.max(Math.abs(sx), Math.abs(sy)) * 1.2;
        return ['<', type, '.Effect><DropShadowEffect Opacity="1" Color="', color.hex,
                '" BlurRadius="', ctx.shadowBlur * 1.2,
                '" Direction="', Math.atan2(-sy, sx) * _TO_DEGREES,
                '" ShadowDepth="', sdepth,
                '" /></', type, '.Effect>'].join("");
    }
    return "";
}

// inner - build stroke properties
function _stroke(ctx) {
    var modify = 0;

    if (ctx.lineJoin !== ctx._lineJoin) {
        ctx._lineJoin = ctx.lineJoin;
        ++modify;
    }
    if (ctx.lineWidth !== ctx._lineWidth) {
        ctx._lineWidth = ctx.lineWidth;
        ctx.__lineWidth = (ctx.lineWidth * ctx._lineScale).toFixed(2);
        ++modify;
    }
    if (ctx.miterLimit !== ctx._miterLimit) {
        ctx._miterLimit = ctx.miterLimit;
        ++modify;
    }
    if (ctx.lineCap !== ctx._lineCap) {
        ctx._lineCap = ctx.lineCap;
        ctx.__lineCap = (ctx.lineCap === "butt") ? "flat" : ctx.lineCap;
        ++modify;
    }

    if (modify) {
        ctx._strokeCache =
                '" StrokeLineJoin="'     + ctx._lineJoin +
                '" StrokeThickness="'    + ctx.__lineWidth +
                '" StrokeMiterLimit="'   + ctx._miterLimit +
                '" StrokeStartLineCap="' + ctx.__lineCap +
                '" StrokeEndLineCap="'   + ctx.__lineCap;
    }
    return ctx._strokeCache;
}

// add inline XAML source
uu.ie && uu.ver.silverlight && uu.lazy("init", function() {
    uu.id("xaml") || doc.head.appendChild(uu.mix(uue("script"), {
            id:   "xaml",
            type: "text/xaml",
            text: '<Canvas xmlns="http://schemas.microsoft.com/client/2007" ' +
                          'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"></Canvas>'
    }));
}, 2); // 2: high order

})(window, document, uu);

//}}}!mb

