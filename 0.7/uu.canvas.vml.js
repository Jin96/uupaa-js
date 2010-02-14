
// === VML Canvas ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js,
//         uu.font.js, uu.canvas.js

//  <canvas width="300" height="150">
//      <div>
//          <v:shape style="...">
//          </v:shape>
//      </div>
//  </canvas>

uu.agein || (function(win, doc, uu) {
var _SHADOW = { width: 4, from: 0.01, delta: 0.05 },
    _COMPOS = { "source-over": 0, "destination-over": 4, copy: 10 },
    _FILTER = uu.ie8 ? ["-ms-filter:'progid:DXImageTransform.Microsoft.", "'"]
                     : ["filter:progid:DXImageTransform.Microsoft.", ""];

uu.mix(uu.canvas.VML2D.prototype, {
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

uu.canvas.VML2D.init = init;
uu.canvas.VML2D.build = build;

// uu.canvas.VML2D.init
function init(ctx, node) { // @param Node: <canvas>
    ctx.canvas = node;
    ctx.initSurface();

    ctx._view = node.appendChild(uue()); // <canvas><div></div></canvas>
    ctx._view.uuCanvasDirection = node.currentStyle.direction;
    ctx._view.style.cssText     = "overflow:hidden;position:absolute;direction:ltr";
    ctx._view.style.pixelWidth  = node.width;
    ctx._view.style.pixelHeight = node.height;
    ctx._clipRect = _rect(ctx, 0, 0, node.width, node.height);
    ctx._readyState = 1; // 0: not ready, 1: complete
}

// uu.canvas.VML2D.build
function build(node) { // @param Node: <canvas>
                       // @return Node:
    // CanvasRenderingContext.getContext
    node.getContext = function() {
        return node.uuctx2d;
    };
    node.uuctx2d = new uu.canvas.VML2D(node);

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
    this._clipStyle     = 0;    // 0 or ColorHash
    this._clipPath      = null; // clipping path
    this._clipRect      = null; // clipping rect
    this._stock         = [];   // lock stock
    this._lockState     = 0;    // lock state, 0: unlock, 1: lock, 2: lock + clear
    this._px            = 0;    // current position x
    this._py            = 0;    // current position y
    // --- extend properties ---
    this.xFlyweight     = 0;    // 1 is animation mode
    this.xMissColor     = "black";
    this.xTextMarginTop = 1.3;
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
    radius *= 10.00;

    var x1 = x + (Math.cos(startAngle) * radius) - 5.00,
        y1 = y + (Math.sin(startAngle) * radius) - 5.00,
        x2 = x + (Math.cos(endAngle)   * radius) - 5.00,
        y2 = y + (Math.sin(endAngle)   * radius) - 5.00,
        c0, c1, rx, ry;

    if (!anticlockwise) { // [FIX] "wa" bug
        (x1.toExponential(5) === x2.toExponential(5)) && (x1 += 0.125);
        (y1.toExponential(5) === y2.toExponential(5)) && (y1 += 0.125);
    }
    c0 = _map2(this._matrix, x1, y1, x2, y2);
    c1 = _map(this._matrix, x, y);
    rx = this._scaleX * radius;
    ry = this._scaleY * radius;
    this._path.push(anticlockwise ? "at " : "wa ",
                    c1.x - rx, " ", c1.y - ry, " ",
                    c1.x + rx, " ", c1.y + ry, " ",
                    c0.x1, " ", c0.y1, " ",
                    c0.x2, " ", c0.y2);
}

// CanvasRenderingContext2D.prototype.arcTo -> NOT IMPL

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    this._path = [];
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    var c0 = _map2(this._matrix, cp1x, cp1y, cp2x, cp2y),
        c1 = _map(this._matrix, x, y);

    this._path.push("c ", c0.x1, " ", c0.y1, " ",
                          c0.x2, " ", c0.y2, " ", c1.x,  " ", c1.y);
    this._px = x;
    this._py = y;
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    this._history = [];
    this._zindex = 0;
    this._view.innerHTML = ""; // clear all
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    w = parseInt(w);
    h = parseInt(h);

    if ((!x && !y && w >= this.canvas.width && h >= this.canvas.height)) {
        this.clear();
    } else {
        var fg, zindex = 0, color = uu.css.bgcolor.inherit(this._view);

        switch (_COMPOS[this.globalCompositeOperation]) {
        case  4: zindex = --this._zindex; break;
        case 10: this.clear();
        }

        fg = '<v:shape style="position:absolute;width:10px;height:10px;z-index:' + zindex +
             '" filled="t" stroked="f" coordsize="100,100" path="' + _rect(this, x, y, w, h) +
             '"><v:fill type="solid" color="' + color.hex +
             '" opacity="' + (color.a * this.globalAlpha).toFixed(2) +
             '" /></v:shape>'

        this.xFlyweight ||
            this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
        this._view.insertAdjacentHTML("BeforeEnd", fg);
    }
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
    this._clipPath = this._clipRect + " x " + this._path.join("");
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
    this._path.push(" x");
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
    var i = 0, iz = this.color.length;

    // collision of the offset is evaded
    if (iz && offset > 0 && offset < 1) {
        for (; i < iz; ++i) {
            if (this.color[i].offset === offset) {
                offset += 0.001;
            }
        }
    }
    this.color.push({ offset: 1 - offset, color: uu.color(color) });
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
        frag = [], sfrag, tfrag, // code fragment
        i = 0, iz, c0, zindex = 0,
        sizeTrans, // 0: none size transform, 1: size transform
        // for shadow
        so = 0, shx = 0, shy = 0;

    switch (_COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }

    if (image.src) { // image is HTMLImageElement
        c0 = _map(this._matrix, dx, dy);

        sizeTrans = (sx || sy); // 0: none size transform, 1: size transform
        tfrag = this._matrixfxd ? _imageTransform(this, this._matrix, dx, dy, dw, dh) : '';

        frag = [
            // [0] shadow only
            '<div style="position:absolute;z-index:' + (zindex - 10) +
                ';left:$1px;top:$2px' + tfrag + '">',
            // [1]
            '<div style="position:relative;overflow:hidden;width:' +
                Math.round(dw) + 'px;height:' + Math.round(dh) + 'px">',
            // [2]
            !sizeTrans ? "" : [
                '<div style="width:', Math.ceil(dw + sx * dw / sw),
                    'px;height:', Math.ceil(dh + sy * dh / sh),
                    'px;',
                    _FILTER[0],
                    'Matrix(Dx=', (-sx * dw / sw).toFixed(3),
                          ',Dy=', (-sy * dh / sh).toFixed(3), ')',
                    _FILTER[1], '">'].join(""),
            // [3]
            '<div style="width:' + Math.round(dim.w * dw / sw) +
                'px;height:' + Math.round(dim.h * dh / sh) + 'px;',
            // [4] shadow only
            'background-color:' + this.__shadowColor.hex + ';' +
                _FILTER[0] + 'Alpha(opacity=$3)' + _FILTER[1],
            // [5] alphaloader
            _FILTER[0] + 'AlphaImageLoader(src=' +
                image.src + ',SizingMethod=' +
                (az === 3 ? "image" : "scale") + ')' + _FILTER[1],
            // [6]
            '"></div>' +
                (sizeTrans ? '</div>' : '') + '</div></div>'
        ];

        if (this.__shadowColor.a) {
            iz = _SHADOW.width;
            shx = iz / 2 + this.shadowOffsetX;
            shy = iz / 2 + this.shadowOffsetY;
            so = _SHADOW.from;

            sfrag = frag[0] + frag[1] + frag[2] + frag[3] + frag[4] + frag[6];

            for (i = 0; i < iz; so += _SHADOW.delta, --shx, --shy, ++i) {
                rv.push(
                    sfrag.replace(/\$1/, this._matrixfxd ? shx : Math.round(c0.x * 0.1) + shx)
                         .replace(/\$2/, this._matrixfxd ? shy : Math.round(c0.y * 0.1) + shy)
                         .replace(/\$3/, (so * 100).toFixed(2)));
            }
        }

        rv.push('<div style="position:absolute;z-index:', zindex);
        if (this._matrixfxd) {
            rv.push(tfrag, '">');
        } else { // 1:1 scale
            rv.push(';top:', Math.round(c0.y * 0.1),
                    'px;left:', Math.round(c0.x * 0.1), 'px">')
        }
        rv.push(frag[1], frag[2], frag[3], frag[5], frag[6]);
        fg = rv.join("");
    } else {
        c0 = _map(this._matrix, dx, dy);
        switch (az) {
        case 3: // 1:1 scale
                rv.push('<div style="position:absolute;z-index:', zindex,
                        ';left:', Math.round(c0.x * 0.1),
                        'px;top:', Math.round(c0.y * 0.1), 'px">')
                iz = image.uuctx2d._history.length;

                for (; i < iz; ++i) {
                    rv.push(image.uuctx2d._history[i]);
                }
                rv.push('</div>');
                break;
        case 5:
                m = uu.m2d.scale(dw / dim.w, dh / dim.h, this._matrix);
                rv.push('<div style="position:absolute;z-index:', zindex,
                        _imageTransform(this, m, dx, dy, dw, dh),
                        '"><div style="width:',  Math.round(dim.w * dw / sw),
                                   'px;height:', Math.round(dim.h * dh / sh), 'px">');
                iz = image.uuctx2d._history.length;

                for (; i < iz; ++i) {
                    rv.push(image.uuctx2d._history[i]);
                }
                rv.push('</div></div>');
                break;
        case 9: // buggy(not impl)
                m = uu.m2d.scale(dw / sw, dh / sh, this._matrix);
                rv.push('<div style="position:absolute;z-index:', zindex,
                        ';overflow:hidden',
                        _imageTransform(this, m, dx, dy, dw, dh), '">');

                iz = image.uuctx2d._history.length;

                for (; i < iz; ++i) {
                    rv.push(image.uuctx2d._history[i]);
                }
                rv.push('</div>');
                break;
        }
        fg = rv.join("");

    // effect CSS::opacity and filter::opacity
    //    fg = fg.replace(/opacity=\"([\d\.]+)\"/g, function(m, opa) {
    //      return 'opacity="' + (opa * me.globalAlpha).toFixed(3) + '"';
    //    }).replace(/opacity=([\d\.]+)/g, function(m, opa) {
    //      return 'opacity=' + (opa * me.globalAlpha).toFixed(3);
    //    });

    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._lockState ? this._stock.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// inner - iamge transform
function _imageTransform(ctx, m, x, y, w, h) {
    var c0 = _map2(ctx._matrix, x, y, x + w, y),
        c1 = _map2(ctx._matrix, x + w, y + h, x, y + h);

    return [
        ";padding:0 ",
        Math.round(Math.max(c0.x1, c0.x2, c1.x1, c1.x2) / 10.00), "px ",
        Math.round(Math.max(c0.y1, c0.y2, c1.y1, c1.y2) / 10.00), "px 0;",
        _FILTER[0], "Matrix(M11=", m[0], ",M12=", m[3],
              ",M21=", m[1], ",M22=", m[4],
              ",Dx=", Math.round(c0.x1 / 10.00),
              ",Dy=", Math.round(c0.y1 / 10.00), ")", _FILTER[1]
    ].join("");
}

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    var path = _rect(this, x, y, w, h);

    this._px = x;
    this._py = y;

    // When all canvases are painted out,
    // the fillStyle(background-color) is preserved.
    if (path === this._clipRect) { // full size path
        if (typeof this.fillStyle === "string") {
            this._clipStyle = uu.color(this.fillStyle); // keep bgcolor
        }
    }
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.getImageData -> NOT IMPL
// CanvasRenderingContext2D.prototype.isPointInPath -> NOT IMPL

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    var m = this._matrix, // inlining: _map(x, y)
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // http://d.hatena.ne.jp/uupaa/20090822
    this._path.push("l ", (ix+(ix<0?-0.49:0.5))|0, " ",
                          (iy+(iy<0?-0.49:0.5))|0);
    this._px = x;
    this._py = y;
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
    var m = this._matrix, // inlining: _map(x, y)
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // http://d.hatena.ne.jp/uupaa/20090822
    this._path.push("m ", (ix+(ix<0?-0.49:0.5))|0, " ",
                          (iy+(iy<0?-0.49:0.5))|0);
    this._px = x;
    this._py = y;
}

// CanvasRenderingContext2D.prototype.putImageData -> NOT IMPL

// CanvasRenderingContext2D.prototype.quickStroke - quick stroke
function quickStroke(hexcolor, alpha, lineWidth) {
    var fg = '<v:shape style="position:absolute;width:10px;height:10px' +
             '" filled="f" stroked="t" coordsize="100,100" path="' +
             this._path.join("") + '"><v:stroke color="' + hexcolor +
             '" opacity="' + alpha.toFixed(2) +
             '" weight="' + lineWidth + 'px" /></v:shape>';

    this._lockState ? this._stock.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.quickStrokeRect
function quickStrokeRect(x, y, w, h, hexcolor, alpha, lineWidth) {
    var ix = x * 10,
        iy = y * 10,
        iw = (x + w) * 10,
        ih = (y + h) * 10;

    this._path = ["m " + (ix - 5) + " " + (iy - 5) +
                  "l " + (ix - 5) + " " + (ih - 5) +
                  "l " + (iw - 5) + " " + (ih - 5) +
                  "l " + (iw - 5) + " " + (iy - 5) +
                  "l " + (ix - 5) + " " + (iy - 5) + "x"];
    this.quickStroke(hexcolor, alpha, lineWidth);
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    var cp1x = this._px + 2.0 / 3.0 * (cpx - this._px),
        cp1y = this._py + 2.0 / 3.0 * (cpy - this._py),
        cp2x = cp1x + (x - this._px) / 3.0,
        cp2y = cp1y + (y - this._py) / 3.0,
        m = this._matrix,
        m0 = m[0], m1 = m[1],
        m3 = m[3], m4 = m[4],
        m6 = m[6], m7 = m[7],
        c0x = (x    * m0 + y    * m3 + m6) * 10 - 5,
        c0y = (x    * m1 + y    * m4 + m7) * 10 - 5,
        c1x = (cp1x * m0 + cp1y * m3 + m6) * 10 - 5,
        c1y = (cp1x * m1 + cp1y * m4 + m7) * 10 - 5,
        c2x = (cp2x * m0 + cp2y * m3 + m6) * 10 - 5,
        c2y = (cp2x * m1 + cp2y * m4 + m7) * 10 - 5;

    // http://d.hatena.ne.jp/uupaa/20090822
    this._path.push("c ",
        (c1x+(c1x<0?-0.49:0.5))|0, " ", (c1y+(c1y<0?-0.49:0.5))|0, " ",
        (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0, " ",
        (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0);
    this._px = x;
    this._py = y;
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this._path.push(_rect(this, x, y, w, h));
    this._px = x;
    this._py = y;
}

// inner -
function _rect(ctx, x, y, w, h) {
    var m = ctx._matrix,
        m0 = m[0], m1 = m[1],
        m3 = m[3], m4 = m[4],
        m6 = m[6], m7 = m[7],
        xw = x + w,
        yh = y + h,
        c0x = (x  * m0 + y  * m3 + m6) * 10 - 5,
        c0y = (x  * m1 + y  * m4 + m7) * 10 - 5,
        c1x = (xw * m0 + y  * m3 + m6) * 10 - 5,
        c1y = (xw * m1 + y  * m4 + m7) * 10 - 5,
        c2x = (xw * m0 + yh * m3 + m6) * 10 - 5,
        c2y = (xw * m1 + yh * m4 + m7) * 10 - 5,
        c3x = (x  * m0 + yh * m3 + m6) * 10 - 5,
        c3y = (x  * m1 + yh * m4 + m7) * 10 - 5;

    // http://d.hatena.ne.jp/uupaa/20090822
    return [" m", (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0,
            " l", (c1x+(c1x<0?-0.49:0.5))|0, " ", (c1y+(c1y<0?-0.49:0.5))|0,
            " l", (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0,
            " l", (c3x+(c3x<0?-0.49:0.5))|0, " ", (c3y+(c3y<0?-0.49:0.5))|0,
            " x"].join("");
}

// CanvasRenderingContext2D.prototype.resize
function resize(width,    // @param Number(= void 0): width
                height) { // @param Number(= void 0): height

    this.initSurface()

    if (width !== void 0) {
        this._view.style.pixelWidth = width;
        this.canvas.style.pixelWidth = width;
    }
    if (height !== void 0) {
        this._view.style.pixelHeight = height;
        this.canvas.style.pixelHeight = height;
    }
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

    var rv = [], fg, zindex = 0, mix, color,
        style = fill ? this.fillStyle
                     : this.strokeStyle,
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    switch (mix = _COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }
    if (typeof style !== "string") {
        fg = style.fn(this, style, path, fill, mix, zindex);
    } else {
        color = fill ? this.__fillStyle
                     : this.__strokeStyle;

        if (this.__shadowColor.a) {
              sx = _SHADOW.width / 2 + this.shadowOffsetX;
              sy = _SHADOW.width / 2 + this.shadowOffsetY;
              so = _SHADOW.from;
              sd = _SHADOW.delta;

            for (; si < _SHADOW.width; so += sd, --sx, --sy, ++si) {
                if (fill) {
                    rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                            ';left:', sx, 'px;top:', sy,
                            'px" filled="t" stroked="f" coordsize="100,100" path="', path,
                            '"><v:fill color="', this.__shadowColor.hex,
                            '" opacity="', so.toFixed(2), '" /></v:shape>');
                } else {
                    rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                            ';left:', sx, 'px;top:', sy,
                            'px" filled="f" stroked="t" coordsize="100,100" path="', path,
                            '"><v:stroke color="', this.__shadowColor.hex,
                            '" opacity="', so.toFixed(2), _buildStrokeProps(this), '" /></v:shape>');
                }
            }
        }
        if (fill) {
            rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                    '" filled="t" stroked="f" coordsize="100,100" path="', path,
                    '"><v:fill color="', color.hex,
                    '" opacity="', (color.a * this.globalAlpha).toFixed(2),
                    '" /></v:shape>');
        } else {
            rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                    '" filled="f" stroked="t" coordsize="100,100" path="', path,
                    '"><v:stroke color="', color.hex,
                    '" opacity="', (color.a * this.globalAlpha).toFixed(2),
                    _buildStrokeProps(this), '" /></v:shape>');
        }
        fg = rv.join("");
    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._lockState ? this._stock.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
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
        align = this.textAlign, dir = "ltr",
        font = uu.font.parse(this.font, this.canvas),
        m = this._matrix, zindex = 0,
        fp, c0, // for grad
        skew = m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
               m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0',
        skewOffset,
        delta = 1000, left = 0, right = delta,
        offset = { x: 0, y: 0 },
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    switch (_COMPOS[this.globalCompositeOperation]) {
    case  4: zindex = --this._zindex; break;
    case 10: this.clear();
    }

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
        align = this._view.uuCanvasDirection === dir ? "left" : "right"
    }
    switch (align) {
    case "center": left = right = delta / 2; break;
    case "right":  left = delta, right = 0.05;
    }
    if (this.textBaseline === "top") {
        // text margin-top fine tuning
        offset.y = font.size /
            (uu.font.SCALE[font.rawfamily.split(",")[0].toUpperCase()] ||
             this.xTextMarginTop);
    }
    skewOffset = _map(this._matrix, x + offset.x, y + offset.y);

    if (this.__shadowColor.a) {
        sx = _SHADOW.width / 2 + this.shadowOffsetX;
        sy = _SHADOW.width / 2 + this.shadowOffsetY;
        so = Math.max(_SHADOW.from + 0.9, 1);
        sd = _SHADOW.delta;

        for (; si < _SHADOW.width; so += sd, --sx, --sy, ++si) {
          rv.push('<v:line style="position:absolute;z-index:', zindex,
                  ';width:1px;height:1px;left:', sx,
                  'px;top:', sy, 'px',
                  '" filled="t" stroked="f" from="', -left, ' 0" to="', right,
                  ' 0.05" coordsize="100,100"><v:fill color="', this.__shadowColor.hex,
                  '" opacity="', so.toFixed(2),
                  '" /><v:skew on="t" matrix="', skew,
                  '" offset="', Math.round(skewOffset.x / 10.00), ',',
                                Math.round(skewOffset.y / 10.00),
                  '" origin="', left,
                  ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
                  uu.esc(text),
                  '" style="v-text-align:', align,
                  ';font:', uu.esc(font.formal), '" /></v:line>');
        }
    }

    rv.push('<v:line style="position:absolute;z-index:', zindex,
            ';width:1px;height:1px" filled="t" stroked="f" from="', -left,
            ' 0" to="', right, ' 0.05" coordsize="100,100">');

    if (typeof style === "string") {
        color = fill ? this.__fillStyle : this.__strokeStyle;
        rv.push('<v:fill color="', color.hex,
                '" opacity="', color.a * this.globalAlpha, '" />');
    } else if (style.fn === _patternFill) {
        rv.push('<v:fill position="0,0" type="tile" src="', style.src, '" />');
    } else { // liner, radial
        fp = style.param;
        c0 = _map2(this._matrix, fp.x0, fp.y0, this._matrix, fp.x1, fp.y1);
        rv.push('<v:fill type="gradient" method="sigma" focus="0%" colors="',
                style.colors || _buildGradationColor(style),
                '" opacity="', this.globalAlpha,
                '" o:opacity2="', this.globalAlpha,
                '" angle="',
                Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
                '" />');
    }
    rv.push('<v:skew on="t" matrix="', skew,
            '" offset="', Math.round(skewOffset.x / 10.00), ',',
                          Math.round(skewOffset.y / 10.00),
            '" origin="', left,
            ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
            uu.esc(text),
            '" style="v-text-align:', align,
            ';font:', uu.esc(font.formal),
            '" /></v:line>');
    fg = rv.join("");
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._lockState ? this._stock.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
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
            this._view.insertAdjacentHTML("BeforeEnd", this._stock.join(""));
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
        x: Math.round((x * m[0] + y * m[3] + m[6]) * 10 - 5),
        y: Math.round((x * m[1] + y * m[4] + m[7]) * 10 - 5)
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
        x1: Math.round((x1 * m[0] + y1 * m[3] + m[6]) * 10 - 5),
        y1: Math.round((x1 * m[1] + y1 * m[4] + m[7]) * 10 - 5),
        x2: Math.round((x2 * m[0] + y2 * m[3] + m[6]) * 10 - 5),
        y2: Math.round((x2 * m[1] + y2 * m[4] + m[7]) * 10 - 5)
    };
}

// inner - Linear Gradient Fill
function _linearGradientFill(ctx, obj, path, fill, mix, zindex) {
    var rv = [],
        fp = obj.param,
        c0 = _map2(ctx._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        angle = Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
        // for shadow
        si = 0, siz = _SHADOW.width, so = 0, sd = 0, sx = 0, sy = 0;

    (angle < 0) && (angle += 360);

    if (ctx.__shadowColor.a) {
        sx = _SHADOW.width / 2 + ctx.shadowOffsetX;
        sy = _SHADOW.width / 2 + ctx.shadowOffsetY;
        so = _SHADOW.from;
        sd = _SHADOW.delta;

        if (!fill) {
            siz = ctx.lineWidth,
            sd = 0.2 / siz; // opacity from 0.05 to 0.25
        }
        for (; si < siz; so += sd, --sx, --sy, ++si) {
            if (fill) {
              rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                      ';left:', sx, 'px;top:', sy,
                      'px" coordsize="100,100" filled="t" stroked="f" path="', path,
                      '"><v:fill type="gradient" method="sigma" focus="0%" color="', ctx.__shadowColor.hex,
                      '" opacity="', so.toFixed(2),
                      '" angle="', angle, '" /></v:shape>');
            } else {
              rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                      ';left:', sx, 'px;top:', sy,
                      'px" coordsize="100,100" filled="f" stroked="t" path="', path,
                      '"><v:stroke filltype="solid" color="', ctx.__shadowColor.hex,
                      '" opacity="', so.toFixed(2),
                      '" angle="', angle,
                      _buildStrokeProps(ctx), '" /></v:shape>');
            }
        }
    }
    if (fill) {
        rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                '" coordsize="100,100" filled="t" stroked="f" path="', path,
                '"><v:fill type="gradient" method="sigma" focus="0%" colors="',
                obj.colors || _buildGradationColor(obj),
                '" opacity="', ctx.globalAlpha,
                '" o:opacity2="', ctx.globalAlpha, // fill only
                '" angle="', angle, '" /></v:shape>');
    } else {
        rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                '" coordsize="100,100" filled="f" stroked="t" path="', path,
                '"><v:stroke filltype="solid" color="', uu.color(ctx.xMissColor).hex,
                '" opacity="', ctx.globalAlpha,
                '" o:opacity2="', ctx.globalAlpha, // fill only
                '" angle="', angle, _buildStrokeProps(ctx), '" /></v:shape>');
    }
    return rv.join("");
}

// inner - Radial Gradient Fill
function _radialGradientFill(ctx, obj, path, fill, mix, zindex) {

    var rv = [], brush, v,
        fp = obj.param, fsize, fposX, fposY, focusParam = "",
        zindex2 = 0,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        r1x = fp.r1 * ctx._scaleX,
        r1y = fp.r1 * ctx._scaleY,
        c0 = _map(ctx._matrix, x, y),
        // for shadow
        si = 0, siz = _SHADOW.width, so = 0, sd = 0, sx = 0, sy = 0;

    // focus
    if (fill) {
        fsize = (fp.r0 / fp.r1);
        fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
        fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (ctx.__shadowColor.a) {
        sx = _SHADOW.width / 2 + ctx.shadowOffsetX;
        sy = _SHADOW.width / 2 + ctx.shadowOffsetY;
        so = _SHADOW.from;
        sd = _SHADOW.delta;

        if (!fill) {
            siz = ctx.lineWidth;
            sd = 0.2 / siz; // opacity from 0.05 to 0.25
        }

        if (fill) {
            focusParam = ['"><v:fill', ' type="',
                          'gradientradial" method="sigma" focussize="',
                          fsize, ',', fsize,
                          '" focusposition="', fposX, ',', fposY].join("");
        } else {
            focusParam = '"><v:stroke' + ' filltype="' + 'tile' +
                         _buildStrokeProps(ctx);
        }
        for (; si < siz; so += sd, --sx, --sy, ++si) {
            if (fill) {
              rv.push('<v:oval style="position:absolute;z-index:', zindex,
                      ';left:', Math.round(c0.x / 10.00) + sx,
                      'px;top:', Math.round(c0.y / 10.00) + sy,
                      'px;width:', r1x, 'px;height:', r1y,
                      'px" filled="t" stroked="f" coordsize="11000,11000',
                      focusParam, '" opacity="', so.toFixed(2),
                      '" color="', ctx.__shadowColor.hex, '" /></v:oval>');
            } else {
              rv.push('<v:oval style="position:absolute;z-index:', zindex,
                      ';left:', Math.round(c0.x / 10.00) + sx,
                      'px;top:', Math.round(c0.y / 10.00) + sy,
                      'px;width:', r1x, 'px;height:', r1y,
                      'px" filled="f" stroked="t" coordsize="11000,11000',
                      focusParam, '" opacity="', so.toFixed(2),
                      '" color="', ctx.__shadowColor.hex, '" /></v:oval>');
            }
        }
    }

    if (!fill) {
        // VML has not stroke gradient
        brush = ['"><v:stroke', ' filltype="', 'tile',
                 _buildStrokeProps(ctx),
                 '" opacity="', ctx.globalAlpha,
                 '" color="', uu.color(ctx.xMissColor).hex].join("");
    } else {
        // fill outside
        if (obj.color.length) {
            v = obj.color[0]; // 0 = outer color
            if (v.color.a > 0.001) {
                if (mix === 4) { zindex2 = --ctx._zindex; }
                rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex2,
                        '" filled="t" stroked="f" coordsize="100,100" path="', path,
                        '"><v:fill type="solid" color="', v.color.hex,
                        '" opacity="', (v.color.a * ctx.globalAlpha).toFixed(2),
                        '" /></v:shape>');
            }
        }
        brush = ['"><v:fill type="gradientradial" method="sigma" focussize="', fsize , ',', fsize,
                 '" focusposition="', fposX, ',', fposY,
                 '" opacity="', ctx.globalAlpha,
                 '" o:opacity2="', ctx.globalAlpha,
                 '" colors="', obj.colors || _buildGradationColor(obj)].join("");
    }
    if (fill) {
        rv.push('<v:oval style="position:absolute;z-index:', zindex, // need z-index
                ';left:', Math.round(c0.x / 10.00),
                'px;top:', Math.round(c0.y / 10.00),
                'px;width:', r1x, 'px;height:', r1y,
                'px" filled="t" stroked="f" coordsize="11000,11000', brush,
                '" /></v:oval>');
    } else {
        rv.push('<v:oval style="position:absolute;z-index:', zindex, // need z-index
                ';left:', Math.round(c0.x / 10.00),
                'px;top:', Math.round(c0.y / 10.00),
                'px;width:', r1x, 'px;height:', r1y,
                'px" filled="f" stroked="t" coordsize="11000,11000', brush,
                '" /></v:oval>');
    }
    return rv.join("");
}

// inner - Pattern Fill
function _patternFill(ctx, obj, path, fill, mix, zindex) {

    var rv = [],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (ctx.__shadowColor.a) {
        sx = _SHADOW.width / 2 + ctx.shadowOffsetX;
        sy = _SHADOW.width / 2 + ctx.shadowOffsetY;
        so = _SHADOW.from;
        sd = _SHADOW.delta;

        for (; si < _SHADOW.width; so += sd, --sx, --sy, ++si) {
            if (fill) {
                rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                        ';left:', sx, 'px;top:', sy,
                        'px" coordsize="100,100" filled="t" stroked="f" path="', path,
                        '"><v:fill type="solid" color="', ctx.__shadowColor.hex,
                        '" opacity="', so.toFixed(2), '" /></v:shape>');
            } else {
                rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                        ';left:', sx, 'px;top:', sy,
                        'px" coordsize="100,100" filled="f" stroked="t" path="', path,
                        '"><v:stroke filltype="', _buildStrokeProps(ctx),
                        '" color="', ctx.__shadowColor.hex,
                        '" opacity="', so.toFixed(2), '" /></v:shape>');
            }
        }
    }
    if (fill) {
        rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                '" coordsize="100,100" filled="t" stroked="f" path="', path,
                '"><v:fill type="tile" opacity="', ctx.globalAlpha,
                '" src="', obj.src, '" /></v:shape>');
    } else {
        rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex,
                '" coordsize="100,100" filled="f" stroked="t" path="', path,
                '"><v:stroke filltype="tile" opacity="', ctx.globalAlpha,
                '" src="', obj.src, _buildStrokeProps(ctx), '" /></v:shape>');
    }
    return rv.join("");
}

// inner -
function _clippy(ctx, fg) {
    if (!ctx._clipStyle) {
        ctx._clipStyle = uu.css.bgcolor.inherit(ctx._view);
    }
    return [fg,
            '<v:shape style="position:absolute;width:10px;height:10px" filled="t" stroked="f" coordsize="100,100" path="', ctx._clipPath,
            '"><v:fill type="solid" color="', ctx._clipStyle.hex, '" /></v:shape>'].join("");
}

// inner - build Gradation Color
function _buildGradationColor(obj) { // @param CanvasGradient:
                                     // @return String:
    var rv = [], ary = obj.color, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv.push(ary[i].offset + " " + ary[i].color.hex);
    }
    return obj.colors = rv.join(","); // bond
}

// inner - build stroke properties
function _buildStrokeProps(obj) {
    return '" joinstyle="'  + obj.lineJoin +
           '" miterlimit="' + obj.miterLimit +
           '" weight="'     + (obj.lineWidth * obj._lineScale).toFixed(2) +
           'px" endcap="' + (obj.lineCap === "butt" ? "flat" : obj.lineCap);
}

// functional collision with uu.css3(altcss) is evaded
uu.ie && uu.lazy("init", function() {
    var ss = doc.createStyleSheet(), ns = doc.namespaces;

    if (!ns["v"]) {
        ns.add("v", "urn:schemas-microsoft-com:vml",           "#default#VML");
        ns.add("o", "urn:schemas-microsoft-com:office:office", "#default#VML");
    }
    ss.owningElement.id = "uucss3ignore";
    ss.cssText =
        "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
        "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
        "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
        "{behavior:url(#default#VML);display:inline-block}"; // [!] inline-block
}, 0); // 0, low order

})(window, document, uu);

