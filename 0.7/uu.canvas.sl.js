
// === Silverlight Canvas ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js,
//         uu.font.js, uu.canvas.js

//  <canvas width="300" height="150">
//      <object>
//          <Canvas>
//          </Canvas>
//      </object>
//  </canvas>

uu.agein || (function(win, doc, uu) {
var _QQ     = /\?/g, // place holder
    _COMPOS = { "source-over": 0, "destination-over": 4, copy: 10 },
    _FIXED4 = /\.(\d{4})(?:[\d]+)/g, // toFixed(4)
    _TO_DEGREES = 180 / Math.PI, // Math.toDegrees - from java.math
    _FONT_STYLES = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    _FONT_WEIGHTS = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                      lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                      "300": "Light", "400": "Normal", "500": "Medium",
                      "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                      "900": "Black" };

uu.mix(uu.canvas.SL2D.prototype, {
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
    drawImage:              drawImage,
    fill:                   fill,
    fillCircle:             fillCircle,     // [EXTEND]
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           uunop,
    initSurface:            initSurface,    // [EXTEND]
    isPointInPath:          uunop,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           uunop,
    quickStroke:            quickStroke,    // [EXTEND]
    quickStrokeRect:        quickStrokeRect, // [EXTEND]
    quadraticCurveTo:       quadraticCurveTo,
    rect:                   rect,
    resize:                 resize,         // [EXTEND]
    restore:                restore,
    rotate:                 rotate,
    save:                   save,
    scale:                  scale,
    setTransform:           setTransform,
    stroke:                 stroke,
    strokeCircle:           strokeCircle,   // [EXTEND]
    strokeRect:             strokeRect,
    strokeText:             strokeText,
    transform:              transform,
    translate:              translate,
    unlock:                 unlock          // [EXTEND]
});

uu.canvas.SL2D.init = init;
uu.canvas.SL2D.build = build;

// uu.canvas.SL2D.init
function init(ctx, node) { // @param Node: <canvas>
    ctx.canvas = node;
    ctx.initSurface();

    ctx._view = null;    // <Canvas>
    ctx._content = null; // <object>
}

// uu.canvas.SL2D.build
function build(node) { // @param Node: <canvas>
                       // @return Node:
    // CanvasRenderingContext.getContext
    node.getContext = function() {
        return node.uuctx2d;
    };
    node.uuctx2d = new uu.canvas.SL2D(node);

    var onload = "uuonslload" + uu.guid(); // window.uuonslload{n}

    win[onload] = function(sender) { // @param Node: sender is <Canvas> node
        var ctx = node.uuctx2d;

        ctx._view = sender.children;
        ctx._content = sender.getHost().content; // getHost() -> <object>
        // dump
        if (ctx._stock.length) {
            ctx._view.add(ctx._content.createFromXaml(
                "<Canvas>" + ctx._stock.join("") + "</Canvas>"));
        }
        ctx._state = 0x1; // draw ready(locked flag off)
        ctx._stock = []
        win[onload] = null; // gc
    };

    // create Silverlight <object>
    node.innerHTML = [
        '<object type="application/x-silverlight-2" width="100%" height="100%">',
            '<param name="background" value="#00000000" />',  // transparent
            '<param name="windowless" value="true" />',
            '<param name="source" value="#xaml" />',          // XAML ID
            '<param name="onLoad" value="', onload, '" />',   // bond to global
        '</object>'].join("");

    win.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        node.uuctx2d = node.getContext = null;
        win.detachEvent("onunload", arguments.callee);
    });
    return node;
}

// CanvasRenderingContext2D.prototype.initSurface
function initSurface() {
    // --- compositing ---
    this.globalAlpha    = 1.0;
    this.globalCompositeOperation = "source-over";
    // --- colors and styles ---
    this.strokeStyle    = "black";
    this.fillStyle      = "black";
    // --- line caps/joins ---
    this.lineWidth      = 1;
    this.lineCap        = "butt";
    this.lineJoin       = "miter";
    this.miterLimit     = 10;
    // --- shadows ---
    this.shadowBlur     = 0;
    this.shadowColor    = "transparent"; // transparent black
    this.shadowOffsetX  = 0;
    this.shadowOffsetY  = 0;
    // --- text ---
    this.font           = "10px sans-serif";
    this.textAlign      = "start";
    this.textBaseline   = "alphabetic";
    // --- hidden properties ---
    this._strokeCache   = "";
    this._lineScale     = 1;
    this._scaleX        = 1;
    this._scaleY        = 1;
    this._zindex        = -1;
    this._matrixfxd     = 0;    // 1: matrix effected
    this._matrix        = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
    this._history       = [];   // canvas rendering history
    this._stack         = [];   // matrix and prop stack.
    this._path          = [];   // current path
    this._clipPath      = null; // clipping path
    this._clipRect      = null; // clipping rect
    this._stock         = [];   // lock stock
    this._state         = 0;    // state,   0x0: not ready
                                //          0x1: draw ready(normal)
                                //          0x2: + locked
                                //          0x4: + lazy clear
    // --- extend properties ---
    this.xFlyweight     = 0;    // 1 is animation mode
    this.xMissColor     = "black";
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
    to._matrixfxd       = from._matrixfxd;
    to._matrix          = from._matrix.concat();
    to._clipPath        = from._clipPath;
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

    if (this._matrixfxd) {
        c0 = _map(this._matrix, ex, ey);
        ex = c0.x;
        ey = c0.y;
    }
    this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                    sweepDirection, " ", ex, " ", ey);
}

// CanvasRenderingContext2D.prototype.arcTo -> NOT IMPL

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    this._path = [];
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (this._matrixfxd) {
        var c0 = _map2(this._matrix, cp1x, cp1y, cp2x, cp2y),
            c1 = _map(this._matrix, x, y);

        this._path.push(" C", c0.x1, " ", c0.y1, " ",
                              c0.x2, " ", c0.y2, " ", c1.x, " ", c1.y);
    } else {
        this._path.push(" C", cp1x, " ", cp1y, " ",
                              cp2x, " ", cp2y, " ", x, " ", y);
    }
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
            this.__mix = _COMPOS[this._mix];
        }

        var color = uu.css.bgcolor.inherit(this.canvas),
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

// CanvasRenderingContext2D.prototype.createImageData -> NOT IMPL

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
        this.dim = uu.img.actsize(image);
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
function createRadialGradient(x0, y0, r0, x1, y1, r1) { // @return Hash:
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

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    if (this.shadowColor !== this._shadowColor) {
        this.__shadowColor = uu.color(this._shadowColor = this.shadowColor);
    }
    if (this.globalCompositeOperation !== this._mix) {
        this.__mix = _COMPOS[this._mix];
    }

    var dim = uu.img.actsize(image), // img actual size
        az = arguments.length, full = (az === 9),
        sx = full ? a1 : 0,
        sy = full ? a2 : 0,
        sw = full ? a3 : dim.w,
        sh = full ? a4 : dim.h,
        dx = full ? a5 : a1,
        dy = full ? a6 : a2,
        dw = full ? a7 : a3 || dim.w,
        dh = full ? a8 : a4 || dim.h,
        fg, m,
        bw, bh, w, h, x, y,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        renderShadow = this.__shadowColor.a && this.shadowBlur,
        shadow, matrix, history;

    if (image.src) { // HTMLImageElement
        switch (az) {
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
            shadow = renderShadow ? _blur(this, "Image", this.__shadowColor) : "";
            matrix = _matrix("Image", uu.m2d.translate(dx, dy, this._matrix));

            fg = _build('<Canvas Canvas.ZIndex="?"><Image Opacity="?" Source="?">??</Image></Canvas>',
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
            shadow = renderShadow ? _blur(this, "Image", this.__shadowColor) : "";
            matrix = _matrix("Image", uu.m2d.translate(dx, dy, this._matrix));

            fg = _build('<Canvas Canvas.ZIndex="?"><Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill">??</Image></Canvas>',
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

            shadow = renderShadow ? _blur(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", uu.m2d.translate(x, y, this._matrix));

            fg = _build('<Canvas Canvas.ZIndex="?"><Canvas><Image Opacity="?" Source="?" Width="?" Height="?" Stretch="Fill"><Image.Clip><RectangleGeometry Rect="?" /></Image.Clip></Image></Canvas>??</Canvas>',
                        [zindex, this.globalAlpha, image.src, w, h, [dx - x, dy - y, dw, dh].join(" "), matrix, shadow]);
        }
    } else { // HTMLCanvasElement
        history = image.uuctx2d._history.join("");

        switch (az) {
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
            shadow = renderShadow ? _blur(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", az === 3 ? m : uu.m2d.scale(dw / dim.w, dh / dim.h, m));

            fg = _build('<Canvas Canvas.ZIndex="?" Opacity="?"><Canvas>?</Canvas>??</Canvas>',
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
            shadow = renderShadow ? _blur(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", uu.m2d.scale(bw, bh, m));

            fg = _build('<Canvas Canvas.ZIndex="?" Opacity="?"><Canvas>?<Canvas.Clip><RectangleGeometry Rect="?" /></Canvas.Clip></Canvas>??</Canvas>',
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

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillCircle
function fillCircle(x,       // @param Number:
                    y,       // @param Number:
                    r,       // @param Number: radius
                    color) { // @param ColorHash:
    var fg = '<Ellipse Canvas.Left="' + (x - r) +
             '" Canvas.Top="' + (y - r) +
             '" Opacity="' + color.a * this.globalAlpha +
             '" Width="' + (r * 2) +
             '" Height="' + (r * 2) +
             '" Fill="' + color.hex + '" />';

    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h), 1);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.getImageData -> NOT IMPL
// CanvasRenderingContext2D.prototype.isPointInPath -> NOT IMPL

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    if (this._matrixfxd) {
        var c0 = _map(this._matrix, x, y);

        this._path.push(" L", c0.x, " ", c0.y);
    } else {
        this._path.push(" L", x, " ", y);
    }
}

// CanvasRenderingContext2D.prototype.lock
function lock(clearScreen) { // @param Boolean(= false):
    if (this._state & 0x2) {
        throw new Error("duplicate lock. state=" + this._state);
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
    if (this._matrixfxd) {
        var c0 = _map(this._matrix, x, y);

        this._path.push(" M", c0.x, " ", c0.y);
    } else {
        this._path.push(" M", x, " ", y);
    }
}

// CanvasRenderingContext2D.prototype.putImageData -> NOT IMPL

// CanvasRenderingContext2D.prototype.quickStroke - quick stroke
function quickStroke(hexcolor, alpha, lineWidth) {
    var fg =  '<Canvas Canvas.ZIndex="0"><Path Opacity="' + alpha.toFixed(2) +
              '" Data="' + this._path.join("") +
              '" StrokeLineJoin="round" StrokeThickness="' + lineWidth +
              '" StrokeStartLineCap="round" StrokeEndLineCap="round"' +
              '" Stroke="' + hexcolor + '"></Path></Canvas>';

    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.quickStrokeRect
function quickStrokeRect(x, y, w, h, hexcolor, alpha, lineWidth) {
    this._path = [" M" + x       + " "  + y +
                  " V" + (y + h) + " H" + (x + w) +
                  " V" + y       + " H" + x       + " Z"];
    this.quickStroke(hexcolor, alpha, lineWidth);
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    if (this._matrixfxd) {
        var c0 = _map2(this._matrix, cpx, cpy, x, y);

        this._path.push(" Q", c0.x1, " ", c0.y1, " ", c0.x2, " ", c0.y2);
    } else {
        this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
    }
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this._path.push(_rect(this, x, y, w, h));
}

// inner -
function _rect(ctx, x, y, w, h) {
    if (ctx._matrixfxd) {
        var c0 = _map2(ctx._matrix, x, y, x + w, y),
            c1 = _map2(ctx._matrix, x + w, y + h, x, y + h);

        return [" M", c0.x1, " ", c0.y1, " L", c0.x2, " ", c0.y2,
                " L", c1.x1, " ", c1.y1, " L", c1.x2, " ", c1.y2,
                " Z"].join("");
    }
    return [" M", x,     " ", y,     " L", x + w, " ", y,
            " L", x + w, " ", y + h, " L", x,     " ", y + h,
            " Z"].join("");
}

// CanvasRenderingContext2D.prototype.resize
function resize(width,    // @param Number(= void 0): width
                height) { // @param Number(= void 0): height
    var state = this._state;

    this.initSurface()

    if (width !== void 0) {
        this.canvas.style.pixelWidth = width; // resize <canvas>
    }
    if (height !== void 0) {
        this.canvas.style.pixelHeight = height;
    }
    this._state = state;
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this._matrixfxd = 1;
    this._matrix = uu.m2d.rotate(angle, this._matrix);
}

// CanvasRenderingContext2D.prototype.save
function save() {
    var prop = {};

    _copyprop(prop, this);
    prop._clipPath = this._clipPath ? String(this._clipPath) : null;
    this._stack.push(prop);
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
    this._matrixfxd = 1;
    this._matrix = uu.m2d.scale(x, y, this._matrix);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._matrix[0] + this._matrix[4]) / 2;
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
    this._matrixfxd = 1;
    if (m11 === 1 && !m12 && m22 === 1 && !m21 && !dx && !dy) {
        this._matrixfxd = 0; // reset _matrixfxd flag
    }
    this._matrix = [m11, m12, 0,  m21, m22, 0,  dx, dy, 1];
}

// CanvasRenderingContext2D.prototype.stroke
function stroke(path, fill) {
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
        this.__mix = _COMPOS[this._mix];
    }

    // (123.456789).toFixed(4) -> "123.4567"
    path = (path || this._path.join("")).replace(_FIXED4, ".$1");

    var fg, shadow = "", more,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        color = fill ? this.fillStyle
                     : this.strokeStyle;

    if (typeof color !== "string") {
        fg = color.fn(this, color, path, fill, zindex);
    } else {
        // [!] Data="F1 " -> FillRule=Nonzero
        // http://twitter.com/uupaa/status/5179317486
        color = fill ? this.__fillStyle
                     : this.__strokeStyle;
        // [SPEED OPTIMIZED]
        more = fill ? "F1" + path + '" Fill="' + color.hex
                    : path + _stroke(this) + '" Stroke="' + color.hex;

        if (this.__shadowColor.a && this.shadowBlur) {
            shadow = _blur(this, "Path", this.__shadowColor);
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

// CanvasRenderingContext2D.prototype.strokeCircle
function strokeCircle(x,       // @param Number:
                      y,       // @param Number:
                      r,       // @param Number: radius
                      color) { // @param ColorHash:
    var fg = '<Ellipse Canvas.Left="' + (x - r) +
             '" Canvas.Top="' + (y - r) +
             '" Opacity="' + color.a * this.globalAlpha +
             '" Width="' + (r * 2) +
             '" Height="' + (r * 2) +
             '" Stroke="' + color.hex +
             '" StrokeThickness="' + this.lineWidth + '" />';

    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
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
        this.__mix = _COMPOS[this._mix];
    }

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    var style = fill ? this.fillStyle : this.strokeStyle,
        rv = [], fg, color,
        fp, c0,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        mtx, rgx, rgy,
        font = uu.font.parse(this.font, this.canvas),
        metric = uu.font.metric(font.formal, text),
        offX = 0, align = this.textAlign, dir = "ltr";

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
        align = this.canvas.currentStyle.direction === dir ? "left" : "right"
    }
    switch (align) {
    case "center": offX = (metric.w - 4) / 2; break; // -4: adjust
    case "right":  offX = metric.w;
    }
    mtx = _matrix(
              'TextBlock',
              uu.m2d.translate(x - offX, y, this._matrix));

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');
    if (typeof style === "string") {
        color = fill ? this.__fillStyle : this.__strokeStyle;
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
            (this.__shadowColor.a && this.shadowBlur) ? _blur(this, "TextBlock", this.__shadowColor) : "");

    if (typeof style === "string") {
        ;
    } else if (style.fn === _radialGradientFill) {
        fp = style.param,
        rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
        rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
        rv.push('<TextBlock.Foreground><RadialGradientBrush GradientOrigin="',
                rgx, ',', rgy,
                '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
                    style.colors || _radialColor(style),
                '</RadialGradientBrush></TextBlock.Foreground>');
    } else if (style.fn === _linearGradientFill) {
        fp = style.param;
        c0 = _map2(this._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        rv.push('<TextBlock.Foreground>',
                '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                c0.x1, ",", c0.y1,
                '" EndPoint="', c0.x2, ",", c0.y2, '">',
                    style.colors || _linearColor(style),
                '</LinearGradientBrush></TextBlock.Foreground>');
    } else { // pattern
        rv.push('<TextBlock.Foreground><ImageBrush Stretch="None" ImageSource="',
                style.src,
                '" /></TextBlock.Foreground>');
    }
    rv.push('</TextBlock></Canvas>');
    fg = rv.join("");
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.add(this._content.createFromXaml(fg));
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    this._matrixfxd = 1;
    this._matrix = uu.m2d.transform(m11, m12, m21, m22, dx, dy, this._matrix);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this._matrixfxd = 1;
    this._matrix = uu.m2d.translate(x, y, this._matrix);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    switch (this._state) {
    case 0x7: // [THROUGH][INLINE][LAZY] // this.clear();
            this.xFlyweight || (this._history = []);
            this._zindex = 0;
            this._state ? this._view.clear() : (this._stock = []);
    case 0x3:
            this._state = 0x1; // unlock
            if (this._stock.length) {
                this._view.add(this._content.createFromXaml(
                        "<Canvas>" + this._stock.join("") + "</Canvas>"));
                this._stock = [];
            }
    }
}

// inner -
function _map(m,   // @param Array: matrix
              x,   // @param Number: x
              y) { // @param Number: y
                   // @return Hash: { x, y }
    return {
        x: x * m[0] + y * m[3] + m[6], // x * m11 + y * m21 + dx
        y: x * m[1] + y * m[4] + m[7]  // x * m12 + y * m22 + dy
    };
}

// inner -
function _map2(m,    // @param Array: matrix
               x1,   // @param Number: x
               y1,   // @param Number: y
               x2,   // @param Number: x
               y2) { // @param Number: y
                     // @return Hash: { x1, y1, x2, y2 }
    return {
        x1: x1 * m[0] + y1 * m[3] + m[6], // x * m11 + y * m21 + dx
        y1: x1 * m[1] + y1 * m[4] + m[7], // x * m12 + y * m22 + dy
        x2: x2 * m[0] + y2 * m[3] + m[6], // x * m11 + y * m21 + dx
        y2: x2 * m[1] + y2 * m[4] + m[7]  // x * m12 + y * m22 + dy
    };
}

// inner - Linear Gradient Fill
function _linearGradientFill(ctx, obj, path, fill, zindex) {
    var rv = [],
        fp = obj.param,
        c0 = _map2(ctx._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        prop = fill ? "Fill" : "Stroke";

    rv.push('<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            '" Data="', path,
            fill ? "" : _stroke(ctx), '"><Path.', prop,
            '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
            c0.x1, ",", c0.y1,
              '" EndPoint="', c0.x2, ",", c0.y2, '">',
              obj.colors || _linearColor(obj),
            '</LinearGradientBrush></Path.', prop, '>',
            (ctx.__shadowColor.a && ctx.shadowBlur) ? _blur(ctx, "Path", ctx.__shadowColor) : "",
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
              (ctx.__shadowColor.a && ctx.shadowBlur) ? _blur(ctx, "Ellipse", ctx.__shadowColor) : "",
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
        shadow = ctx.__shadowColor.a && ctx.shadowBlur ? _blur(ctx, "Canvas", ctx.__shadowColor) : "";

        // TileBrush simulate
        for (y = 0; y < yz; ++y) {
            for (x = 0; x < xz; ++x) {
                img.push('<Image Opacity="', ctx.globalAlpha,
                         '" Canvas.Left="', x * sw, '" Canvas.Top="', y * sh,
                         '" Source="', obj.src, '"></Image>');
            }
        }
        return _build('<Canvas Canvas.ZIndex="?"><Canvas Canvas.ZIndex="?" Clip="?">?</Canvas>?</Canvas>',
                      [zindex, zindex2, path, img.join(""), shadow]);
    }

    return ['<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            fill ? "" : _stroke(ctx),
            '" Data="', path,
            '"><Path.Stroke><ImageBrush Stretch="None" ImageSource="',
            obj.src,
            '" /></Path.Stroke>',
            (ctx.__shadowColor.a && ctx.shadowBlur) ? _blur(ctx, "Path", ctx.__shadowColor) : "",
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

// inner - build Shadow Blur
function _blur(ctx,     // @param this:
               type,    // @param String: "TextBlock", "Image", "Path", "Ellipse"
               color) { // @param ColorHash:
    var sdepth = 0,
        sx = ctx.shadowOffsetX,
        sy = ctx.shadowOffsetY;

    if (color.a) {
        sdepth = Math.max(Math.abs(sx), Math.abs(sy)) * 1.2;
        return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
                '" Color="', color.hex,
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

// inner - build XAML
function _build(format, ary) {
    var i = -1;

    return format.replace(_QQ, function() {
               return ary[++i];
           });
}

// add inline XAML source
uu.ie && uu.ver.sl && uu.lazy("init", function() {
    uu.id("xaml") || uu.head(uu.mix(uue("script"), {
        id:   "xaml",
        type: "text/xaml",
        text: '<Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas>'
    }));
}, 2); // 2: high order

})(window, document, uu);

