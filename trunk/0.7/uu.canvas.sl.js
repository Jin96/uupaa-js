
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
var _SHADOW = { width: 4, from: 0.01, delta: 0.05 },
    _COMPOS = { "source-over": 0, "destination-over": 4, copy: 10 },
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

    ctx._view = null;
    ctx._content = null;
    ctx._readyState = 0; // 0: not ready, 1: ready(after xaml onLoad="")
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
        ctx._readyState = 1; // draw ready
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
    this._lockState     = 0;    // lock state, 0: unlock, 1: lock, 2: lock + clear
    this._readyState    = 0;
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

    sx = x + (Math.cos(startAngle) * radius);
    sy = y + (Math.sin(startAngle) * radius);
    ex = x + (Math.cos(endAngle) * radius);
    ey = y + (Math.sin(endAngle) * radius);

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
    this._history = [];
    this._zindex = 0;
    this._readyState ? this._view.clear() : (this._stock = []);
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    w = parseInt(w);
    h = parseInt(h);

    if ((!x && !y && w >= this.canvas.width && h >= this.canvas.height)) {
        this.clear();
    } else {
        var fg, zindex = 0, color = uu.css.bgcolor.inherit(this.canvas);

        switch (_COMPOS[this.globalCompositeOperation]) {
        case  4: zindex = --this._zindex; break;
        case 10: this.clear();
        }

        fg = '<Path Opacity="' + (color.a * this.globalAlpha) +
             '" Canvas.ZIndex="' + zindex +
             '" Fill="' + color.hex +
             '" Data="' + _rect(this, x, y, w, h) + '" />';

        this.xFlyweight ||
            this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
        _drawxaml(this, fg);
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
        rv = [], fg, m,
        bw, bh, w, h, x, y, // slice
        tmpmtx, size = "", clip = "",
        zindex = 0, sclip = "",
        i = 0, iz, // for copy canvas
        // for shadow
        so = 0, shx = 0, shy = 0;

    switch (_COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }

    if (image.src) { // image is HTMLImageElement
        switch (az) {
        case 3:
            m = uu.m2d.translate(dx, dy, this._matrix);
            break;
        case 5:
            m = uu.m2d.translate(dx, dy, this._matrix);
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
            m = uu.m2d.translate(x, y, this._matrix);

            size = '" Width="' + w + '" Height="' + h;
            clip = '<Image.Clip><RectangleGeometry Rect="' +
                   [dx - x, dy - y, dw, dh].join(" ") +
                   '" /></Image.Clip>';
            if (this.__shadowColor.a) {
                sclip = '<Rectangle.Clip><RectangleGeometry Rect="' +
                        [dx - x, dy - y, dw, dh].join(" ") +
                        '" /></Rectangle.Clip>';
            }
        }

        rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

        if (this.__shadowColor.a) {
            iz = _SHADOW.width;
            shx = iz / 2 + this.shadowOffsetX;
            shy = iz / 2 + this.shadowOffsetY;
            so = _SHADOW.from;
            tmpmtx = _buildMatrixTransform('Rectangle', m);

            for (i = 0; i < iz; so += _SHADOW.delta, --shx, --shy, ++i) {
                rv.push('<Rectangle Opacity="', so.toFixed(2),
                        '" Canvas.Left="', shx, '" Canvas.Top="', shy,
                        size, '" Fill="', this.__shadowColor.hex, '">', sclip,
                        tmpmtx,
                        '</Rectangle>');
            }
        }

        rv.push('<Image Opacity="', this.globalAlpha,
                '" Source="', image.src, size, '">',
                clip, _buildMatrixTransform('Image', m),
                this.__shadowColor.a ? _buildShadowBlur(this, "Image", this.__shadowColor) : "",
                '</Image></Canvas>');
    } else { // HTMLCanvasElement
        iz = image.uuctx2d._history.length;
        switch (az) {
        case 3:
            m = uu.m2d.translate(dx, dy, this._matrix);
            break;
        case 5:
            m = uu.m2d.translate(dx, dy, this._matrix);
            m = uu.m2d.scale(dw / dim.w, dh / dim.h, m);
            break;
        case 9:
            bw = dw / sw; // bias width
            bh = dh / sh; // bias height
            w = bw * dim.w;
            h = bh * dim.h;
            x = dx - (bw * sx);
            y = dy - (bh * sy);

            m = uu.m2d.translate(x, y, this._matrix);
            m = uu.m2d.scale(bw, bh, m);

            clip = '<Canvas.Clip><RectangleGeometry Rect="' +
                   [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" ") +
                   '" /></Canvas.Clip>';
      //        if (this.__shadowColor.a) {
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
    //            this.__shadowColor.a ? _buildShadowBlur(me, "Canvas", this.__shadowColor) : "",
                '<Canvas>');

        for (; i < iz; ++i) {
            rv.push(image.uuctx2d._history[i]);
        }
        rv.push('</Canvas></Canvas>');
    }
    fg = rv.join("");
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    _drawxaml(this, fg);
}

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
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
    if (this._lockState) {
        throw new Error("duplicate lock");
    }
    this._lockState = clearScreen ? 2 : 1;
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

    _drawxaml(this, fg);
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
function resize(width,    // @param Number: width
                height) { // @param Number: height
    var state = this._readyState;

    this.initSurface()

    if (width !== void 0) {
        this.canvas.style.pixelWidth = width;
    }
    if (height !== void 0) {
        this.canvas.style.pixelHeight = height;
    }
    this._readyState = state;
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
    var prop = { _matrix: [] };

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

    path = path || this._path.join("");

    var rv = [], fg, zindex = 0, mix,
        style = fill ? this.fillStyle
                     : this.strokeStyle;

    switch (mix = _COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }
    if (typeof style !== "string") {
        fg = style.fn(this, style, path, fill, mix, zindex);
    } else {
        if (fill) {
          rv.push('<Canvas Canvas.ZIndex="', zindex, '">',
                  '<Path Opacity="', this.__fillStyle.a * this.globalAlpha,
                  // http://twitter.com/uupaa/status/5179317486
                  '" Data="F1 ', path, // [F1] FillRule=Nonzero
                  '" Fill="', this.__fillStyle.hex, '">',
                  this.__shadowColor.a ? _buildShadowBlur(this, "Path", this.__shadowColor) : "",
                  '</Path></Canvas>');

        } else {
          rv.push('<Canvas Canvas.ZIndex="', zindex, '">',
                  '<Path Opacity="', this.__strokeStyle.a * this.globalAlpha,
                  // http://twitter.com/uupaa/status/5179317486
                  '" Data="', path, _buildStrokeProps(this),
                  '" Stroke="', this.__strokeStyle.hex, '">',
                  this.__shadowColor.a ? _buildShadowBlur(this, "Path", this.__shadowColor) : "",
                  '</Path></Canvas>');
        }
        fg = rv.join("");
    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    _drawxaml(this, fg);
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

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    var style = fill ? this.fillStyle : this.strokeStyle,
        rv = [], fg, color,
        fp, c0, zindex = 0, mtx, rgx, rgy,
        font = uu.font.parse(this.font, this.canvas),
        metric = uu.font.metric(font.formal, text),
        offX = 0, align = this.textAlign, dir = "ltr";

    switch (_COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
        align = this.canvas.currentStyle.direction === dir ? "left" : "right"
    }
    switch (align) {
    case "center": offX = (metric.w - 4) / 2; break; // -4: adjust
    case "right":  offX = metric.w;
    }
    mtx = _buildMatrixTransform(
              'TextBlock',
  //          _mtx2dmultiply(_mtx2dtranslate(x - offX, y), this._matrix));
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
            this.__shadowColor.a ? _buildShadowBlur(this, "TextBlock", this.__shadowColor) : "");

    if (typeof style === "string") {
        ;
    } else if (style.fn === _radialGradientFill) {
        fp = style.param,
        rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
        rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
        rv.push('<TextBlock.Foreground><RadialGradientBrush GradientOrigin="',
                rgx, ',', rgy,
                '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
                    style.colors || _buildRadialColor(style),
                '</RadialGradientBrush></TextBlock.Foreground>');
    } else if (style.fn === _linearGradientFill) {
        fp = style.param;
        c0 = _map2(this._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        rv.push('<TextBlock.Foreground>',
                '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                c0.x1, ",", c0.y1,
                '" EndPoint="', c0.x2, ",", c0.y2, '">',
                    style.colors || _buildLinearColor(style),
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
    _drawxaml(this, fg);
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
    if (this._lockState) {
        (this._lockState === 2) && this.clear(); // [LAZY]
        if (this._stock.length) {
            this._lockState = 0; // [!] pre unlock
            _drawxaml(this, "<Canvas>" + this._stock.join("") + "</Canvas>");
            this._stock = [];
        }
    }
    this._lockState = 0;
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
function _linearGradientFill(ctx, obj, path, fill, mix, zindex) {
    var rv = [],
        fp = obj.param,
        c0 = _map2(ctx._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        prop = fill ? "Fill" : "Stroke";

    rv.push('<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            '" Data="', path,
            fill ? "" : _buildStrokeProps(ctx), '"><Path.', prop,
            '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
            c0.x1, ",", c0.y1,
              '" EndPoint="', c0.x2, ",", c0.y2, '">',
              obj.colors || _buildLinearColor(obj),
            '</LinearGradientBrush></Path.', prop, '>',
            ctx.__shadowColor.a ? _buildShadowBlur(ctx, "Path", ctx.__shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(ctx, obj, path, fill, mix, zindex) {
    var rv = [], prop = fill ? "Fill" : "Stroke",
        fp = obj.param,
        zindex2 = 0,
        rr = fp.r1 * 2,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
        gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
  //    m = _mtx2dmultiply(_mtx2dtranslate(x, y), ctx._matrix),
        m = uu.m2d.translate(x, y, ctx._matrix),
        tmpmtx = _buildMatrixTransform('Ellipse', m),
        v, bari = "";

    rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

    if (fill) {
        // fill outside
        if (obj.color.length) {
            v = obj.color[obj.color.length - 1];
            if (v.color.a > 0.001) {
                if (mix === 4) {
                    zindex2 = --ctx._zindex;
                }
                bari =  [ '<Path Opacity="', ctx.globalAlpha,
                          '" Canvas.ZIndex="', zindex2,
                          '" Data="', path, '" Fill="', v.color.argb, '" />'].join("");
                !ctx.xFlyweight &&
                  ctx._history.push(ctx._clipPath ? (bari = _clippy(ctx, bari)) : bari);
                _drawxaml(ctx, bari);
            }
        }
    }

    rv.push('<Ellipse Opacity="', ctx.globalAlpha,
            '" Width="', rr, '" Height="', rr,
            fill ? "" : _buildStrokeProps(ctx),
            '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
            gx, ',', gy,
            '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">',
              obj.colors || _buildRadialColor(obj),
            '</RadialGradientBrush></Ellipse.', prop, '>',
              tmpmtx,
              ctx.__shadowColor.a ? _buildShadowBlur(ctx, "Ellipse", ctx.__shadowColor) : "",
            '</Ellipse></Canvas>');
    return rv.join("");
}

// inner - Pattern Fill
function _patternFill(ctx, obj, path, fill, mix, zindex) {
    var rv = [], prop = fill ? "Fill" : "Stroke",
        zindex2 = 0,
        sw, sh, xz, yz, x, y, // use tile mode
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (fill) {
        x  = 0;
        y  = 0;
        sw = obj.dim.w;
        sh = obj.dim.h;
        xz = Math.ceil(parseInt(ctx.canvas.width)  / sw);
        yz = Math.ceil(parseInt(ctx.canvas.height) / sh);

        if (mix === 4) {
            zindex2 = --ctx._zindex;
        }

        rv.push('<Canvas Canvas.ZIndex="', zindex, '">');

        if (ctx.__shadowColor.a) {
            sx = _SHADOW.width / 2 + ctx.shadowOffsetX;
            sy = _SHADOW.width / 2 + ctx.shadowOffsetY;
            so = _SHADOW.from;
            sd = _SHADOW.delta;

            for (; si < _SHADOW.width; so += sd, --sx, --sy, ++si) {
                rv.push('<Path Opacity="', so.toFixed(2),
                        '" Canvas.Left="', sx, '" Canvas.Top="', sy,
                        '" Data="', path, fill ? "" : _buildStrokeProps(ctx),
                        '" Fill="', ctx.__shadowColor.hex,
                        '" />');
            }
        }

        // TileBrush simulate
        rv.push('<Canvas Canvas.ZIndex="', zindex2, '" Clip="', path, '">');
        for (y = 0; y < yz; ++y) {
            for (x = 0; x < xz; ++x) {
                rv.push('<Image Opacity="', ctx.globalAlpha,
                        '" Canvas.Left="', x * sw, '" Canvas.Top="', y * sh,
                        '" Source="', obj.src, '">',
        //              ctx.__shadowColor.a ? _buildShadowBlur(ctx, "Image", ctx.__shadowColor) : "",
                        '</Image>');
            }
        }
        rv.push('</Canvas></Canvas>');

        return rv.join("");
    }

    rv.push('<Canvas Canvas.ZIndex="', zindex,
            '"><Path Opacity="', ctx.globalAlpha,
            fill ? "" : _buildStrokeProps(ctx),
            '" Data="', path,
            '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
            obj.src,
            '" /></Path.', prop, '>',
            ctx.__shadowColor.a ? _buildShadowBlur(ctx, "Path", ctx.__shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
}

// inner -
function _clippy(ctx, fg) {
    return '<Canvas Clip="' + ctx._clipPath + '">' + fg + '</Canvas>';
}


// inner - build Linear Color
function _buildLinearColor(obj) { // @param CanvasGradient:
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
function _buildRadialColor(obj) { // @param CanvasGradient:
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
function _buildShadowBlur(ctx,     // @param this:
                          type,    // @param String:
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
function _buildStrokeProps(obj) {
    var cap = obj.lineCap === "butt" ? "flat" : obj.lineCap;

    return '" StrokeLineJoin="'     + obj.lineJoin +
           '" StrokeThickness="'    + (obj.lineWidth * obj._lineScale).toFixed(2) +
           '" StrokeMiterLimit="'   + obj.miterLimit +
           '" StrokeStartLineCap="' + cap +
           '" StrokeEndLineCap="'   + cap;
}

// inner -
function _drawxaml(ctx, fg) {
    if (ctx._lockState || !ctx._readyState) {
        ctx._stock.push(fg);
    } else {
        ctx._view.add(ctx._content.createFromXaml(fg));
    }
}

// add inline XAML source
uu.ie && uu.ver.sl && uu.lazy("init", function() {
    if (!uu.id("xaml")) {
        doc.write('<script type="text/xaml" id="xaml"><Canvas' +
              ' xmlns="http://schemas.microsoft.com/client/2007"></Canvas>' +
              '</script>');
    }
}, 2); // 2: high order

})(window, document, uu);

