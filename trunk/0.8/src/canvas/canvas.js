
// === Canvas ===
//{@canvas

// for Gecko, WebKit, Opera, IE9
window["CanvasRenderingContext2D"] && (function(uu) {

// extend functions and properties
uu.mix(window["CanvasRenderingContext2D"].prototype, {
    lock:           canvasLock,             // ctx.lock(clear:Boolean)
    clear:          canvasClear,            // ctx.clear() - clear all canvas
    unlock:         uu.nop,                 // ctx.unlock()
    drawCircle:     canvasDrawCircle,       // ctx.drawCircle(x:Number, y:Number, radius:Number,
                                            //                fillColor:ColorHash = void,
                                            //                strokeColor:ColorHash = void,
                                            //                lineWidth:Number = 1)
    drawRoundRect:  canvasDrawRoundRect,    // ctx.drawRoundRect(x:Number, y:Number,
                                            //                   width:Number, height:Number,
                                            //                   radius:Number,
                                            //                   fillColor:ColorHash = void,
                                            //                   strokeColor:ColorHash = void,
                                            //                   lineWidth:Number = 1)
    xBackend:       "Canvas"
}, 0, 0);

// CanvasRenderingContext2D.prototype.lock
function canvasLock(clear) { // @param Boolean: clear screen
    clear && this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

// CanvasRenderingContext2D.prototype.clear
function canvasClear() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

// CanvasRenderingContext2D.prototype.drawCircle
function canvasDrawCircle(x,           // @param Number:
                          y,           // @param Number:
                          raduis,      // @param Number: radius
                          fillColor,   // @param ColorHash(= void): fillColor
                          strokeColor, // @param ColorHash(= void): strokeColor
                          lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha && raduis && (fillColor || strokeColor)) {
        var lw = lineWidth === void 0 ? 1 : lineWidth;
            fill = !!fillColor,
            stroke = strokeColor && lw;

        this.save();
        fill   && (this.fillStyle = fillColor.rgba);
        stroke && (this.strokeStyle = strokeColor.rgba,
                   this.lineWidth = lw);
        this.beginPath();
        this.arc(x, y, raduis, 0, 2 * Math.PI, true);
        this.closePath();
        fill   && this.fill();
        stroke && this.stroke();
        this.restore();
    }
}

// CanvasRenderingContext2D.prototype.drawRoundRect - round rect
function canvasDrawRoundRect(x,           // @param Number:
                             y,           // @param Number:
                             width,       // @param Number:
                             height,      // @param Number:
                             radius,      // @param Number/Array: [top-left, top-right, bottom-right, bottom-left]
                             fillColor,   // @param ColorHash(= void 0): fillColor
                             strokeColor, // @param ColorHash(= void 0): strokeColor
                             lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha && width && height && (fillColor || strokeColor)) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            w  = width, h = height,
            w2 = (w / 2) | 0, h2 = (h / 2) | 0, rmin = Math.min(w2, h2),
            r0, r1, r2, r3,
            fill = !!fillColor,
            stroke = strokeColor && lw;

        if (typeof radius === "number") {
            r3 = radius;
            r3 = r3 < 0 ? 0 : (r3 < w2 && r3 < h2) ? r3 : rmin;
            r0 = r1 = r2 = r3; // copy radius
        } else {
            r0 = radius[0];
            r1 = radius[1];
            r2 = radius[2];
            r3 = radius[3];
            r0 = r0 < 0 ? 0 : (r0 < w2 && r0 < h2) ? r0 : rmin;
            r1 = r1 < 0 ? 0 : (r1 < w2 && r1 < h2) ? r1 : rmin;
            r2 = r2 < 0 ? 0 : (r2 < w2 && r2 < h2) ? r2 : rmin;
            r3 = r3 < 0 ? 0 : (r3 < w2 && r3 < h2) ? r3 : rmin;
        }
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);

        fill   && (this.fillStyle = fillColor.rgba);
        stroke && (this.strokeStyle = strokeColor.rgba,
                   this.lineWidth = lw);
        this.beginPath();
        this.moveTo(x, y + h2);
        this.lineTo(x, y + h - r3);
        this.quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
        this.lineTo(x + w - r2, y + h);
        this.quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
        this.lineTo(x + w, y + r1);
        this.quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
        this.lineTo(x + r0, y);
        this.quadraticCurveTo(x, y, x, y + r0); // top-right
        this.closePath();
        fill   && this.fill();
        stroke && this.stroke();
        this.restore();
    }
}
})(uu);

//{@mb
// === VMLCanvas / FlashCanvas / SilverlightCanvas ===
window["CanvasRenderingContext2D"] || (function(doc, uu, uucanvas) {

var _enableFlashCanvas = uu.ie678 ? uu.stat(uu.config.canvas.swf) : 0;

uucanvas.VML = VMLCanvas;                  // uu.canvas.VML class
uucanvas.Flash = FlashCanvas;              // uu.canvas.Flash class
uucanvas.Silverlight = SilverlightCanvas;  // uu.canvas.Silverlight class
uucanvas.init = uucanvasinit;
uucanvas.build = uucanvasbuild;

// class SilverlightCanvas
function SilverlightCanvas(node) { // @param Node: <canvas>
    SilverlightCanvas.init(this, node);
}

// class FlashCanvas
function FlashCanvas(node) { // @param Node: <canvas>
    FlashCanvas.init(this, node);
}

// class VMLCanvas
function VMLCanvas(node) { // @param Node: <canvas>
    VMLCanvas.init(this, node);
}

// uu.canvas.init - init canvas
function uucanvasinit() {
    uu.ie678 && uu.each(uu.tag("canvas"), function(node) {
        if (!node.getContext) { // already initialized (altcss and other)
            // remove fallback contents
            //      <canvas>fallback contents...</canvas> -> <canvas></canvas>
            var newCanvasNode = _removeFallback(node);

            newCanvasNode.width  = parseInt(node.width  || "300"); // 300px -> 300
            newCanvasNode.height = parseInt(node.height || "150");
            newCanvasNode.style.width  = parseInt(newCanvasNode.width)  + "px";
            newCanvasNode.style.height = parseInt(newCanvasNode.height) + "px";
            uucanvasbuild(newCanvasNode, newCanvasNode.className);
        }
    });
}

// inner - remove fallback contents
function _removeFallback(node) { // @param Node:
                                 // @return Node: new node
    if (!node.parentNode) {
        return node;
    }
    var rv = doc.createElement(node.outerHTML),
        endTags = doc.getElementsByTagName("/CANVAS"),
        parent = node.parentNode,
        idx = node.sourceIndex, x, v, w, i = -1;

    while ( (x = endTags[++i]) ) {
        if (idx < x.sourceIndex && parent === x.parentNode) {
            v = doc.all[x.sourceIndex];
            do {
                w = v.previousSibling; // keep previous
                v.parentNode.removeChild(v);
                v = w;
            } while (v !== node);
            break;
        }
    }
    parent.replaceChild(rv, node);
    return rv;
}

// uu.canvas.build - build canvas <canvas class="SFV">
function uucanvasbuild(node,    // @param Node: <canvas>
                       order) { // @param SpaceJointString: "SFV"
                                // @return Node:
    var i = 0, v, order = uu.string.trim(order.toLowerCase()),
        sl = uu.env.silverlight, backend,
        ary = order.split(order.indexOf(" ") >= 0 ? " "  // old style "sl fl vml"
                                                  : ""); // new style "SFV"

    for (; !backend && (v = ary[i++]); ) {
        switch (uucanvas.build.backendOrder[v]) {
        case 2: sl && (backend = SilverlightCanvas); break;
        case 3: _enableFlashCanvas && (backend = FlashCanvas); break;
        case 4: backend = VMLCanvas;
        }
    }
    return (backend ? backend
                    : sl ? SilverlightCanvas
                         : _enableFlashCanvas ? FlashCanvas
                                              : VMLCanvas).build(node);
}
uucanvasbuild.backendOrder = {
    s: 2, sl: 2, silverlight: 2,
    f: 3, fl: 3, flash: 3,
    v: 4, vml: 4
};

})(document, uu, uu.canvas);

//{@canvasvml
// === VML Canvas ===

//  <canvas width="300" height="150">   <- canvas
//      <div>                           <- view
//          <v:shape style="...">
//          </v:shape>
//      </div>
//  </canvas>

!window["CanvasRenderingContext2D"] && (function(win, doc, uu) {
var _COMPOS = { "source-over": 0, "destination-over": 4, copy: 10 },
    _FILTER = uu.env.ie8 ? ["-ms-filter:'progid:DXImageTransform.Microsoft.", "'"]
                         : ["filter:progid:DXImageTransform.Microsoft.", ""],
    _CLIPPY         = '<v:shape style="position:absolute;width:10px;height:10px" filled="t" stroked="f" coordsize="100,100" path="@"><v:fill type="solid" color="@" /></v:shape>',

    // zindex(+shadowOffsetX +shadowOffsetY), path, color.hex, opacity(+strokeProps or +' type="solid"')
    _COLOR_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@" filled="t" stroked="f" coordsize="100,100" path="@"><v:fill color="@" opacity="@" /></v:shape>',
    _COLOR_STROKE   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@" filled="f" stroked="t" coordsize="100,100" path="@"><v:stroke color="@" opacity="@" /></v:shape>',

    _IMAGE_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@;left:@px;top:@px" filled="t" stroked="f" coordsize="100,100" path="@"><v:fill type="tile" opacity="@" src="@" /></v:shape>',
    _IMAGE_SHADOW   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@;left:@px;top:@px" filled="t" stroked="f" coordsize="100,100" path="@"><v:fill color="@" opacity="@" /></v:shape>',

    // zindex(+shadowOffsetX +shadowOffsetY), path, color.hex, opacity(+strokeProps), angle
    _LINER_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@" coordsize="100,100" filled="t" stroked="f" path="@"><v:fill type="gradient" method="sigma" focus="0%" opacity="@" angle="@" /></v:shape>',
    _LINER_STROKE   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@" coordsize="100,100" filled="f" stroked="t" path="@"><v:stroke filltype="solid" opacity="@" angle="@" /></v:shape>',

    // zindex, left, top, width, height, opacity(+'" color="@' +focussize1, +focussize2, +focusposition1, +focusposition2)
    _RADIAL_FILL    = '<v:oval style="position:absolute;z-index:@;left:@px;top:@px;width:@px;height:@px" filled="t" stroked="f" coordsize="11000,11000"><v:fill type="gradientradial" method="sigma" opacity="@" /></v:oval>',
    // zindex, left, top, width, height, opacity(+strokeProps, +color)
    _RADIAL_STROKE  = '<v:oval style="position:absolute;z-index:@;left:@px;top:@px;width:@px;height:@px" filled="f" stroked="t" coordsize="11000,11000"><v:stroke filltype="tile" opacity="@" /></v:oval>',

    // zindex, left, top, path, type["solid" or "tile"], opacity(+color, +src, +strokeProps)
    _PATTERN_FILL   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@;left:@px;top:@px" coordsize="100,100" filled="t" stroked="f" path="@"><v:fill type="@" opacity="@" /></v:shape>',
    _PATTERN_STROKE = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@;left:@px;top:@px" coordsize="100,100" filled="f" stroked="t" path="@"><v:stroke filltype="@" opacity="@" /></v:shape>';

uu.mix(uu.canvas.VML.prototype, {
    arc:                    arc,
    arcTo:                  uu.nop,
    beginPath:              beginPath,
    bezierCurveTo:          bezierCurveTo,
    clear:                  clear,          // [EXTEND]
    clearRect:              clearRect,
    clip:                   clip,
    closePath:              closePath,
    createImageData:        uu.nop,
    createLinearGradient:   createLinearGradient,
    createPattern:          createPattern,
    createRadialGradient:   createRadialGradient,
    drawCircle:             drawCircle,     // [EXTEND]
    drawImage:              drawImage,
    drawRoundRect:          drawRoundRect,  // [EXTEND]
    fill:                   fill,
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           uu.nop,
    isPointInPath:          uu.nop,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           uu.nop,
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

uu.canvas.VML.init = init;
uu.canvas.VML.build = build;

// uu.canvas.VML.init
function init(ctx, node) { // @param Node: <canvas>
    initSurface(ctx);
    ctx.canvas = node;
    ctx._view = node.appendChild(uu.node());
    ctx._view.uuCanvasDirection = node.currentStyle.direction;
    ctx._view.style.cssText     = "overflow:hidden;position:absolute;direction:ltr";
    ctx._view.style.pixelWidth  = node.width;
    ctx._view.style.pixelHeight = node.height;
    ctx._clipRect = _rect(ctx, 0, 0, node.width, node.height);
    ctx._state = 1; // 0x0: not ready
                    // 0x1: draw ready(normal)
                    // 0x2: + locked
                    // 0x4: + lazy clear
}

// uu.canvas.VML.build
function build(canvas) { // @param Node: <canvas>
                         // @return Node:
    var ctx;

    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return ctx;
    };

    // CanvasRenderingContext.toDataURL
    canvas.toDataURL = function() {
        return "data:,";
    };

    ctx = new uu.canvas.VML(canvas);

    // uncapture key events(release focus)
    function onFocus(evt) {
        var div = evt.srcElement,     // <canvas><div /></canvas>
            canvas = div.parentNode;  // <canvas>

        div.blur();
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

            // resize view
            ctx._view.style.pixelWidth  = width  < 0 ? 0 : width;
            ctx._view.style.pixelHeight = height < 0 ? 0 : height;

            ctx._clipRect = _rect(ctx, 0, 0, width, height);
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
    ctx._clipStyle      = 0;    // 0 or ColorHash
    ctx._clipPath       = null; // clipping path
    ctx._clipRect       = null; // clipping rect
    // --- extend properties ---
    ctx.xBackend        = "VML";
    ctx.xFlyweight      = 0;    // 1 is animation mode
    ctx.xMissColor      = "black";
    ctx.xTextMarginTop  = 1.3;
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
    radius *= 10;

    var x1 = x + (Math.cos(startAngle) * radius) - 5,
        y1 = y + (Math.sin(startAngle) * radius) - 5,
        x2 = x + (Math.cos(endAngle)   * radius) - 5,
        y2 = y + (Math.sin(endAngle)   * radius) - 5,
        c0, c1, rx, ry;

    if (!anticlockwise) { // [FIX] "wa" bug
        if (x1.toExponential(5) === x2.toExponential(5)) {
            x1 += 0.125;
        }
        if (y1.toExponential(5) === y2.toExponential(5)) {
            y1 += 0.125;
        }
    }
    c0 = _map2(this._matrix, x1, y1, x2, y2);
    c1 = _map(this._matrix, x, y);
    rx = this._scaleX * radius;
    ry = this._scaleY * radius;

    // [FIX][at][wa] bug, (width | 0) and (height | 0)
    // http://twitter.com/uupaa/status/9833358743
    this._path.push(anticlockwise ? "at " : "wa ",
                    (c1.x - rx) | 0, " ", (c1.y - ry) | 0, " ",
                    (c1.x + rx) | 0, " ", (c1.y + ry) | 0, " ",
                    c0.x1, " ", c0.y1, " ",
                    c0.x2, " ", c0.y2);
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

    x0 = (_x0 * m[0] + _y0 * m[3] + m[6]) * 10 - 5;
    y0 = (_x0 * m[1] + _y0 * m[4] + m[7]) * 10 - 5;
    x1 = (_x1 * m[0] + _y1 * m[3] + m[6]) * 10 - 5;
    y1 = (_x1 * m[1] + _y1 * m[4] + m[7]) * 10 - 5;
    x2 = (_x2 * m[0] + _y2 * m[3] + m[6]) * 10 - 5;
    y2 = (_x2 * m[1] + _y2 * m[4] + m[7]) * 10 - 5;

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
    var c0 = _map2(this._matrix, cp1x, cp1y, cp2x, cp2y),
        c1 = _map(this._matrix, x, y);

    // add begin point
    this._path.length || this._path.push("m", c0.x1, " ", c0.y1);

    this._path.push("c ", c0.x1, " ", c0.y1, " ",
                          c0.x2, " ", c0.y2, " ", c1.x,  " ", c1.y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    this.xFlyweight || (this._history = []);
    this._zindex = 0;
//  this._view.innerHTML = ""; // clear all
    clearAll(this._view);
}

function clearAll(view) {
    while (view.lastChild) {
        view.removeChild(view.lastChild);
    }
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

        var color = uu.css.bgcolor(this.canvas),
            zindex = (this.__mix ===  4) ? --this._zindex
                   : (this.__mix === 10) ? (this.clear(), 0) : 0,
            fg = uu.format(_COLOR_FILL,
                        zindex, _rect(this, x, y, w, h), color.hex,
                         (this.globalAlpha * color.a) + ' type="solid"');

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
        this.dim = uu.image.size(image);
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
    if (this.globalAlpha && radius && (fillColor || strokeColor)) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            fg = '<v:oval style="position:absolute;left:' + (x - radius) +
                    'px;top:'       + (y - radius) +
                    'px;width:'     + (radius * 2) +
                    'px;height:'    + (radius * 2) +
                    'px" filled="'  + (fillColor ? "t" : "f") +
                    '" stroked="'   + (strokeColor ? "t" : "f") + '">';
        if (fillColor) {
            fg +=   '<v:fill opacity="' + (this.globalAlpha * fillColor.a) +
                            '" color="' + fillColor.hex + '" />';
        }
        if (strokeColor && lw) {
            fg +=   '<v:stroke opacity="' + (this.globalAlpha * strokeColor.a) +
                            '" color="' + strokeColor.hex +
                            '" weight="' + lw + 'px" />';
        }
        fg += '</v:oval>';

        this._state !== 0x1 ? this._stock.push(fg)
                            : this._view.insertAdjacentHTML("BeforeEnd", fg);
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

    var dim = uu.image.size(image), // img actual size
        args = arguments.length, full = (args === 9),
        sx = full ? a1 : 0,
        sy = full ? a2 : 0,
        sw = full ? a3 : dim.w,
        sh = full ? a4 : dim.h,
        dx = full ? a5 : a1,
        dy = full ? a6 : a2,
        dw = full ? a7 : a3 || dim.w,
        dh = full ? a8 : a4 || dim.h,
        rv = [], fg, m,
        history, // HTMLCanvasElement context history
        frag = [], tfrag, // code fragment
        i = 0, iz, c0,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        renderShadow = this.__shadowColor.a && this.shadowBlur,
        sizeTrans; // 0: none size transform, 1: size transform

    if (image.src) { // HTMLImageElement

        if (!this._matrixEffected) {

            // shadow
            if (this.__shadowColor.a && this.shadowBlur) {
                rv.push(uu.format(_IMAGE_SHADOW,
                            zindex, dx + (this.shadowOffsetX + 1),
                                    dy + (this.shadowOffsetY + 1),
                             _rect(this, 0, 0, dw, dh),
                             this.__shadowColor.hex,
                             (this.globalAlpha / Math.sqrt(this.shadowBlur) * 0.5)));
            }

            // no resize + no opacity
            if (args === 3 && this.globalAlpha !== 1) {
                rv.push(uu.format(_IMAGE_FILL,
                               zindex, dx, dy, _rect(this, 0, 0, dw, dh),
                               this.globalAlpha, image.src));
            } else {
                rv.push(
                    '<v:image style="position:absolute;z-index:', zindex,
                    ';width:',      dw,
                    'px;height:',   dh,
                    'px;left:',     dx,
                    'px;top:',      dy,
                    'px" coordsize="100,100" src="', image.src,
                    '" opacity="',  this.globalAlpha, // <vml:image opacity> doesn't work.
                    '" cropleft="', sx / dim.w,
                    '" croptop="',  sy / dim.h,
                    '" cropright="',    (dim.w - sx - sw) / dim.w,
                    '" cropbottom="',   (dim.h - sy - sh) / dim.h,
                    '" />');
            }
        } else {
            c0 = _map(this._matrix, dx, dy);

            sizeTrans = (sx || sy); // 0: none size transform, 1: size transform
            tfrag = this._matrixEffected ? _imageTransform(this, this._matrix, dx, dy, dw, dh) : '';

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
                    (args === 3 ? "image" : "scale") + ')' + _FILTER[1],
                // [6]
                '"></div>' +
                    (sizeTrans ? '</div>' : '') + '</div></div>'
            ];

            if (renderShadow) {
                fg = frag[0] + frag[1] + frag[2] + frag[3] + frag[4] + frag[6];
                rv.push(
                    fg.replace(/\$1/, this._matrixEffected ? this.shadowOffsetX
                                                           : Math.round(c0.x * 0.1) + this.shadowOffsetX)
                      .replace(/\$2/, this._matrixEffected ? this.shadowOffsetY
                                                           : Math.round(c0.y * 0.1) + this.shadowOffsetY)
                      .replace(/\$3/, this.globalAlpha / Math.sqrt(this.shadowBlur) * 50));

            }

            rv.push('<div style="position:absolute;z-index:', zindex);
            if (this._matrixEffected) {
                rv.push(tfrag, '">');
            } else { // 1:1 scale
                rv.push(';top:', Math.round(c0.y * 0.1),
                        'px;left:', Math.round(c0.x * 0.1), 'px">')
            }
            rv.push(frag[1], frag[2], frag[3], frag[5], frag[6]);
        }
        fg = rv.join("");
    } else { // HTMLCanvasElement
        history = image.getContext("2d")._history;
        c0 = _map(this._matrix, dx, dy);

        switch (args) {
        case 3: // 1:1 scale
                rv.push('<div style="position:absolute;z-index:', zindex,
                        ';left:',  Math.round(c0.x * 0.1),
                        'px;top:', Math.round(c0.y * 0.1), 'px">')
                iz = history.length;

                for (; i < iz; ++i) {
                    rv.push(history[i]);
                }
                rv.push('</div>');
                break;
        case 5:
                m = uu.matrix2d.scale(dw / dim.w, dh / dim.h, this._matrix);
                rv.push('<div style="position:absolute;z-index:', zindex,
                        _imageTransform(this, m, dx, dy, dw, dh),
                        '"><div style="width:',  Math.round(dim.w * dw / sw),
                                   'px;height:', Math.round(dim.h * dh / sh), 'px">');
                iz = history.length;

                for (; i < iz; ++i) {
                    rv.push(history[i]);
                }
                rv.push('</div></div>');
                break;
        case 9: // buggy(not impl)
                m = uu.matrix2d.scale(dw / sw, dh / sh, this._matrix);
                rv.push('<div style="position:absolute;z-index:', zindex,
                        ';overflow:hidden',
                        _imageTransform(this, m, dx, dy, dw, dh), '">');

                iz = history.length;

                for (; i < iz; ++i) {
                    rv.push(history[i]);
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
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// inner - iamge transform
function _imageTransform(ctx, m, x, y, w, h) {
    var c0 = _map2(ctx._matrix, x, y, x + w, y),
        c1 = _map2(ctx._matrix, x + w, y + h, x, y + h);

    return [
        ";padding:0 ",
        Math.round(Math.max(c0.x1, c0.x2, c1.x1, c1.x2) / 10), "px ",
        Math.round(Math.max(c0.y1, c0.y2, c1.y1, c1.y2) / 10), "px 0;",
        _FILTER[0], "Matrix(M11=", m[0], ",M12=", m[3],
              ",M21=", m[1], ",M22=", m[4],
              ",Dx=", Math.round(c0.x1 / 10),
              ",Dy=", Math.round(c0.y1 / 10), ")", _FILTER[1]
    ].join("");
}

// CanvasRenderingContext2D.prototype.drawRoundRect - round rect
function drawRoundRect(x,           // @param Number:
                       y,           // @param Number:
                       width,       // @param Number:
                       height,      // @param Number:
                       radius,      // @param Number/Array: [top-left, top-right, bottom-right, bottom-left]
                       fillColor,   // @param ColorHash(= void 0): fillColor
                       strokeColor, // @param ColorHash(= void 0): strokeColor
                       lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha && width && height && (fillColor || strokeColor)) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            path, fg, ix, iy, iw, ih, w, h;

        if (typeof radius === "number") { // Number -> [r, r, r, r]
            radius = [radius, radius, radius, radius];
        }
        if (!radius[0] &&
            radius[0] === radius[1] &&
            radius[0] === radius[2] &&
            radius[0] === radius[3]) {

            // radius = [0, 0, 0, 0]
            ix = x * 10 - 5;
            iy = y * 10 - 5;
            iw = (x + width)  * 10 - 5;
            ih = (y + height) * 10 - 5;

            path = ["m " + ix + " " + iy +
                    "l " + ix + " " + ih +
                    "l " + iw + " " + ih +
                    "l " + iw + " " + iy +
                    "l " + ix + " " + iy + "x"].join("");
        } else {
            path = _buildRoundRectPath(this, x, y, width, height,
                                       radius[0], radius[1], radius[2], radius[3]);
        }

        fg = '<v:shape style="position:absolute;width:10px;height:10px;z-index:0' +
                '" filled="'   + (fillColor         ? "t" : "f") +
                '" stroked="'  + (strokeColor && lw ? "t" : "f") +
                '" coordsize="100,100" path="' + path + '">';

        if (fillColor) {
            fg +=   '<v:fill opacity="' + (this.globalAlpha * fillColor.a) +
                            '" color="' + fillColor.hex + '" />';
        }
        if (strokeColor && lw) {
            fg +=   '<v:stroke opacity="' + (this.globalAlpha * strokeColor.a) +
                            '" color="' + strokeColor.hex +
                            '" weight="' + lw + 'px" />';
        }
        fg += '</v:shape>';

        this._state !== 0x1 ? this._stock.push(fg)
                            : this._view.insertAdjacentHTML("BeforeEnd", fg);
    }
}

// inner - build round rect paths
function _buildRoundRectPath(ctx, x, y, w, h, r0, r1, r2, r3) {
    var w2 = (w / 2) | 0, h2 = (h / 2) | 0, rmin = Math.min(w2, h2);

    r0 = r0 < 0 ? 0 : (r0 < w2 && r0 < h2) ? r0 : rmin;
    r1 = r1 < 0 ? 0 : (r1 < w2 && r1 < h2) ? r1 : rmin;
    r2 = r2 < 0 ? 0 : (r2 < w2 && r2 < h2) ? r2 : rmin;
    r3 = r3 < 0 ? 0 : (r3 < w2 && r3 < h2) ? r3 : rmin;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + h2);
    ctx.lineTo(x, y + h - r3);
    ctx.quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
    ctx.lineTo(x + w - r2, y + h);
    ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
    ctx.lineTo(x + w, y + r1);
    ctx.quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
    ctx.lineTo(x + r0, y);
    ctx.quadraticCurveTo(x, y, x, y + r0); // top-right
    ctx.closePath();
    ctx.restore();
    return ctx._path.join("");
}

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    var path = _rect(this, x, y, w, h);

    this.px = x;
    this.py = y;

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

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    var m = this._matrix,
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // [OPTIMIZED] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    ix = (ix+(ix<0?-0.49:0.5))|0;
    iy = (iy+(iy<0?-0.49:0.5))|0;

    this._path.length || this._path.push("m ", ix, " ", iy);
    this._path.push("l ", ix, " ", iy);

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
    var m = this._matrix, // inlining: _map(x, y)
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // [OPTIMIZED] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    this._path.push("m ", (ix+(ix<0?-0.49:0.5))|0, " ",
                          (iy+(iy<0?-0.49:0.5))|0);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    var cp1x = this.px + 2 / 3 * (cpx - this.px),
        cp1y = this.py + 2 / 3 * (cpy - this.py),
        cp2x = cp1x + (x - this.px) / 3,
        cp2y = cp1y + (y - this.py) / 3,
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

    // [OPTIMIZED] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    cpx = (c1x+(c1x<0?-0.49:0.5))|0;
    cpy = (c1y+(c1y<0?-0.49:0.5))|0;

    this._path.length || this._path.push("m ", cpx, " ", cpy);

    this._path.push("c ", cpx, " ", cpy, " ",
        (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0, " ",
        (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0);
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

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this._matrixEffected = 1;
    this._matrix = uu.matrix2d.rotate(angle, this._matrix);
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
    this._matrix = uu.matrix2d.scale(x, y, this._matrix);
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

    path = path || this._path.join("");

    var fg = "", strokeProps,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        color = fill ? this.fillStyle : this.strokeStyle;

    if (typeof color !== "string") {
        fg = color.fn(this, color, path, fill, zindex);
    } else {
        strokeProps = fill ? "" : _stroke(this);
        color = fill ? this.__fillStyle : this.__strokeStyle;

        if (this.__shadowColor.a && this.shadowBlur) {
            fg = uu.format(fill ? _COLOR_FILL : _COLOR_STROKE,
                         zindex + ";left:" + (this.shadowOffsetX + 1) + "px;top:" +
                                             (this.shadowOffsetY + 1) + "px",
                         path, this.__shadowColor.hex,
                         (this.globalAlpha / Math.sqrt(this.shadowBlur) * 0.5) + strokeProps);
        }
        // [SPEED OPTIMIZED]
        if (fill) {
            fg += '<v:shape style="position:absolute;width:10px;height:10px;z-index:' + zindex +
                    '" filled="t" stroked="f" coordsize="100,100" path="' + path +
                    '"><v:fill color="' + color.hex +
                    '" opacity="' + (this.globalAlpha * color.a) + '" /></v:shape>';
        } else {
            fg += '<v:shape style="position:absolute;width:10px;height:10px;z-index:' + zindex +
                    '" filled="f" stroked="t" coordsize="100,100" path="' + path +
                    '"><v:stroke color="' + color.hex +
                    '" opacity="' + (this.globalAlpha * color.a) + strokeProps + '" /></v:shape>';
        }
    }
    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
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

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    var style = fill ? this.fillStyle : this.strokeStyle,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        rv = [], fg, color,
        align = this.textAlign, dir = "ltr",
        font = uu.font(this.font, this.canvas),
        m = this._matrix,
        fp, c0, // for grad
        skew = m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
               m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0',
        skewOffset,
        delta = 1000, left = 0, right = delta,
        offset = { x: 0, y: 0 },
        blur;

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

    if (this.__shadowColor.a && this.shadowBlur) {
        blur = Math.sqrt(this.shadowBlur);

        rv.push('<v:line style="position:absolute;z-index:', zindex,
                ';width:1px;height:1px;left:', this.shadowOffsetX + 1,
                'px;top:', this.shadowOffsetY + 1, 'px',
                '" filled="t" stroked="f" from="', -left, ' 0" to="', right,
                ' 0.05" coordsize="100,100"><v:fill color="', this.__shadowColor.hex,
//              '" opacity="', (this.globalAlpha / blur * 0.5).toFixed(3),
                '" opacity="', (this.globalAlpha / blur).toFixed(3),
                '" /><v:skew on="t" matrix="', skew,
                '" offset="', Math.round(skewOffset.x / 10), ',',
                              Math.round(skewOffset.y / 10),
                '" origin="', left,
                ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
                uu.entity(text),
                '" style="v-text-align:', align,
                ';font:', uu.entity(font.formal), '" /></v:line>');
    }

    rv.push('<v:line style="position:absolute;z-index:', zindex,
            ';width:1px;height:1px" filled="t" stroked="f" from="', -left,
            ' 0" to="', right, ' 0.05" coordsize="100,100">');

    if (typeof style === "string") {
        color = fill ? this.__fillStyle : this.__strokeStyle;
        rv.push('<v:fill color="', color.hex,
                '" opacity="', (color.a * this.globalAlpha).toFixed(2), '" />');
    } else if (style.fn === _patternFill) {
        rv.push('<v:fill position="0,0" type="tile" src="', style.src, '" />');
    } else { // liner, radial
        fp = style.param;
        c0 = _map2(this._matrix, fp.x0, fp.y0, this._matrix, fp.x1, fp.y1);
        rv.push('<v:fill type="gradient" method="sigma" focus="0%" colors="',
                style.colors || _gradationColor(style),
                '" opacity="', this.globalAlpha,
                '" o:opacity2="', this.globalAlpha,
                '" angle="',
                Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
                '" />');
    }
    rv.push('<v:skew on="t" matrix="', skew,
            '" offset="', Math.round(skewOffset.x / 10), ',',
                          Math.round(skewOffset.y / 10),
            '" origin="', left,
            ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
            uu.entity(text),
            '" style="v-text-align:', align,
            ';font:', uu.entity(font.formal),
            '" /></v:line>');
    fg = rv.join("");

    this.xFlyweight ||
        this._history.push(this._clipPath ? (fg = _clippy(this, fg)) : fg);
    this._state !== 0x1 ? this._stock.push(fg)
                        : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    this._matrixEffected = 1;
    this._matrix = uu.matrix2d.transform(m11, m12, m21, m22, dx, dy, this._matrix);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this._matrixEffected = 1;
    this._matrix = uu.matrix2d.translate(x, y, this._matrix);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    switch (this._state) {
    case 0x7: // [INLINE][LAZY] // this.clear();
            this.xFlyweight || (this._history = []);
            this._zindex = 0;
//          this._view.innerHTML = ""; // clear all
            clearAll(this._view); // clear all
            // break; [THROUGH]
    case 0x3:
            this._state = 0x1; // unlock
            if (this._stock.length) {
                this._view.insertAdjacentHTML("BeforeEnd", this._stock.join(""));
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
function _linearGradientFill(ctx, obj, path, fill, zindex) {
    var fg = "", fp = obj.param,
        c0 = _map2(ctx._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        angle = Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
        color, strokeProps = fill ? "" : _stroke(ctx);

    angle < 0 && (angle += 360);

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill ---
        //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //                                                                    ~~~~~~~~~~~~~~~~~
        //      coordsize="100,100" filled="t" stroked="f" path="?">
        //      <v:fill type="gradient" method="sigma" focus="0%" opacity="?" angle="?" color="?" />
        //                                                                            ~~~~~~~~~~
        //  </v:shape>
        //
        // --- stroke ---
        //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //                                                                    ~~~~~~~~~~~~~~~~~
        //      coordsize="100,100" filled="f" stroked="t" path="?">
        //      <v:stroke filltype="solid" opacity="?" angle="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //  </v:shape>
        fg = uu.format(fill ? _LINER_FILL : _LINER_STROKE,
                     zindex + ";left:" + (ctx.shadowOffsetX + 1) + "px;top:" +
                                         (ctx.shadowOffsetY + 1) + "px",
                     path, (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5),
                     angle + '" color="' + ctx.__shadowColor.hex + strokeProps);
    }
    // --- fill ---
    //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //      coordsize="100,100" filled="t" stroked="f" path="?">
    //      <v:fill type="gradient" method="sigma" focus="0%" opacity="?" angle="?" colors="?" o:opacity2="?" />
    //                                                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  </v:shape>
    //
    // --- stroke ---
    //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //      coordsize="100,100" filled="f" stroked="t" path="?">
    //      <v:stroke filltype="solid" opacity="?" angle="?" color="?" o:opacity2="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  </v:shape>
    color = fill ? ('" colors="' + (obj.colors || _gradationColor(obj)))
                 : ('" color="'  + uu.color(ctx.xMissColor).hex);
    return fg + uu.format(fill ? _LINER_FILL : _LINER_STROKE,
                        zindex, path, ctx.globalAlpha,
                        angle + strokeProps + color + '" o:opacity2="' + ctx.globalAlpha);
}

// inner - Radial Gradient Fill
function _radialGradientFill(ctx, obj, path, fill, zindex) {
    var rv = [], v, more,
        fp = obj.param, fsize, fposX, fposY,
        zindex2 = 0,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        r1x = fp.r1 * ctx._scaleX,
        r1y = fp.r1 * ctx._scaleY,
        c0 = _map(ctx._matrix, x, y),
        strokeProps = fill ? "" : _stroke(ctx);

    // focus
    if (fill) {
        fsize = (fp.r0 / fp.r1);
        fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
        fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill shadow ---
        //      [[inside]]
        //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
        //          filled="t" stroked="f" coordsize="11000,11000">
        //          <v:fill type="gradientradial" method="sigma" opacity="?" color="?" focussize="?,?" focusposition="?,?" />
        //                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:oval>
        //
        // --- stroke shadow ---
        //      [[inside]]
        //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
        //          filled="f" stroked="t" coordsize="11000,11000">
        //          <v:stroke filltype="tile" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:oval>
        //
        more = fill ? uu.format('" color="@" focussize="@,@" focusposition="@,@',
                             ctx.__shadowColor.hex, fsize, fsize, fposX, fposY)
                    : uu.format('" color="@@', ctx.__shadowColor.hex, strokeProps);
        rv.push(uu.format(fill ? _RADIAL_FILL : _RADIAL_STROKE,
                        zindex,
                        Math.round(c0.x / 10) + ctx.shadowOffsetX + 1,
                        Math.round(c0.y / 10) + ctx.shadowOffsetY + 1, r1x, r1y,
                        (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5) + more));
    }

    if (fill) {
        // fill outside
        if (obj.color.length) {
            v = obj.color[0]; // 0 = outer color
            if (v.color.a > 0.001) {
                if (ctx.__mix === 4) { zindex2 = --ctx._zindex; }
                rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex2,
                        '" filled="t" stroked="f" coordsize="100,100" path="', path,
                        '"><v:fill type="solid" color="', v.color.hex,
                        '" opacity="', (ctx.globalAlpha * v.color.a).toFixed(3),
                        '" /></v:shape>');
            }
        }
    }
    // --- fill ---
    //      [[outside]]
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //          filled="t" stroked="f" coordsize="100,100" path="?">
    //          <v:fill type="solid" color="?" opacity="?" />
    //      </v:shape>
    //
    //      [[inside]]
    //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
    //          filled="t" stroked="f" coordsize="11000,11000">
    //          <v:fill type="gradientradial" method="sigma" opacity="?" o:opacity2="?" colors="?" focussize="?,?" focusposition="?,?" />
    //                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:oval>
    //
    // --- stroke ---
    //      [[inside]]
    //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
    //          filled="f" stroked="t" coordsize="11000,11000">
    //          <v:stroke filltype="tile" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:oval>
    more = fill ? uu.format('" o:opacity2="@" colors="@" focussize="@,@" focusposition="@,@',
                         ctx.globalAlpha, obj.colors || _gradationColor(obj),
                         fsize, fsize, fposX, fposY)
                : uu.format('" color="@@', uu.color(ctx.xMissColor).hex, strokeProps);

    rv.push(uu.format(fill ? _RADIAL_FILL : _RADIAL_STROKE,
                    zindex,
                    Math.round(c0.x / 10),
                    Math.round(c0.y / 10), r1x, r1y,
                    ctx.globalAlpha + more));
    return rv.join("");
}

// inner - Pattern Fill
function _patternFill(ctx, obj, path, fill, zindex) {
    var fg = "", strokeProps = fill ? "" : _stroke(ctx);

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill --
        //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //          coordsize="100,100" filled="t" stroked="f" path="?">
        //          <v:fill type="?" opacity="?" color="?" />
        //                                     ~~~~~~~~~~
        //      </v:shape>
        //
        // --- stroke ---
        //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //          coordsize="100,100" filled="f" stroked="t" path="?">
        //          <v:stroke filltype="?" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:shape>
        fg = uu.format(fill ? _PATTERN_FILL : _PATTERN_STROKE,
                     zindex, ctx.shadowOffsetX + 1,
                             ctx.shadowOffsetY + 1,
                     path, "solid",
                     (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5) +
                     '" color="' + ctx.__shadowColor.hex + strokeProps);
    }

    // --- fill --
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
    //          coordsize="100,100" filled="t" stroked="f" path="?">
    //          <v:fill type="?" opacity="?" src="?" />
    //                                     ~~~~~~~~
    //      </v:shape>
    //
    // --- stroke ---
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
    //          coordsize="100,100" filled="f" stroked="t" path="?">
    //          <v:stroke filltype="?" opacity="?" src="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:shape>
    return fg + uu.format(fill ? _PATTERN_FILL : _PATTERN_STROKE,
                        zindex, 0, 0, path, "tile",
                        ctx.globalAlpha + '" src="' + obj.src + strokeProps);
}

// inner -
function _clippy(ctx, fg) {
    if (!ctx._clipStyle) {
        ctx._clipStyle = uu.css.bgcolor(ctx.canvas);
    }
    return fg + uu.format(_CLIPPY, ctx._clipPath, ctx._clipStyle.hex);
}

// inner - build Gradation Color
function _gradationColor(obj) { // @param CanvasGradient:
                                // @return String:
    var rv = [], ary = obj.color, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv.push(ary[i].offset + " " + ary[i].color.hex);
    }
    return obj.colors = rv.join(","); // bond
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
                '" joinstyle="'  + ctx._lineJoin +
                '" miterlimit="' + ctx._miterLimit +
                '" weight="'     + ctx.__lineWidth +
                'px" endcap="'   + ctx.__lineCap;
    }
    return ctx._strokeCache;
}

// functional collision with uu.css3(altcss) is evaded
uu.ie678 && uu.ready("canvas:0", function() {
    var ss = doc.createStyleSheet(), ns = doc.namespaces;

    if (!ns["v"]) {
        ns.add("v", "urn:schemas-microsoft-com:vml",           "#default#VML");
        ns.add("o", "urn:schemas-microsoft-com:office:office", "#default#VML");
    }
    ss.owningElement.id = "VMLSETUP";
    ss.cssText =
        "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
        "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
        "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
        "{behavior:url(#default#VML);display:inline-block}"; // [!] inline-block
});

})(this, document, uu);
//}@canvasvml

//{@canvassl
// === Silverlight Canvas ===

//  <canvas width="300" height="150">   <- canvas
//      <object>                        <- content
//          <Canvas>                    <- view
//              <Path />
//          </Canvas>
//      </object>
//  </canvas>

!window["CanvasRenderingContext2D"] && (function(win, doc, uu) {
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
    arcTo:                  uu.nop,
    beginPath:              beginPath,
    bezierCurveTo:          bezierCurveTo,
    clear:                  clear,          // [EXTEND]
    clearRect:              clearRect,
    clip:                   clip,
    closePath:              closePath,
    createImageData:        uu.nop,
    createLinearGradient:   createLinearGradient,
    createPattern:          createPattern,
    createRadialGradient:   createRadialGradient,
    drawCircle:             drawCircle,     // [EXTEND]
    drawImage:              drawImage,
    drawRoundRect:          drawRoundRect,  // [EXTEND]
    fill:                   fill,
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           uu.nop,
    isPointInPath:          uu.nop,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           uu.nop,
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
        onload = "uuCanvasSilverlightOnLoad" + uu.number();

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

        var color = uu.css.bgcolor(this.canvas),
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
        this.dim = uu.image.size(image);
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

    var dim = uu.image.size(image), // img actual size
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
            matrix = _matrix("Image", uu.matrix2d.translate(dx, dy, this._matrix));

            fg = uu.format('<Canvas Canvas.ZIndex="@"><Image Opacity="@" Source="@">@@</Image></Canvas>',
                        zindex, this.globalAlpha, image.src, matrix, shadow);
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
            matrix = _matrix("Image", uu.matrix2d.translate(dx, dy, this._matrix));

            fg = uu.format('<Canvas Canvas.ZIndex="@"><Image Opacity="@" Source="@" Width="@" Height="@" Stretch="Fill">@@</Image></Canvas>',
                        zindex, this.globalAlpha, image.src, dw, dh, matrix, shadow);
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
            matrix = _matrix("Canvas", uu.matrix2d.translate(x, y, this._matrix));

            fg = uu.format('<Canvas Canvas.ZIndex="@"><Canvas><Image Opacity="@" Source="@" Width="@" Height="@" Stretch="Fill"><Image.Clip><RectangleGeometry Rect="@" /></Image.Clip></Image></Canvas>@@</Canvas>',
                        zindex, this.globalAlpha, image.src, w, h, [dx - x, dy - y, dw, dh].join(" "), matrix, shadow);
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
            m = uu.matrix2d.translate(dx, dy, this._matrix);
            shadow = renderShadow ? _dropShadow(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", args === 3 ? m : uu.matrix2d.scale(dw / dim.w, dh / dim.h, m));

            fg = uu.format('<Canvas Canvas.ZIndex="@" Opacity="@"><Canvas>@</Canvas>@@</Canvas>',
                        zindex, this.globalAlpha, history, matrix, shadow);
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

            m = uu.matrix2d.translate(x, y, this._matrix);
            shadow = renderShadow ? _dropShadow(this, "Canvas", this.__shadowColor) : "";
            matrix = _matrix("Canvas", uu.matrix2d.scale(bw, bh, m));

            fg = uu.format('<Canvas Canvas.ZIndex="@" Opacity="@"><Canvas>@<Canvas.Clip><RectangleGeometry Rect="@" /></Canvas.Clip></Canvas>@@</Canvas>',
                        zindex, this.globalAlpha, history,
                         [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
                        matrix, shadow);
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
                       radius,      // @param Number/Array: [top-left, top-right, bottom-right, bottom-left]
                       fillColor,   // @param ColorHash(= void 0): fillColor
                       strokeColor, // @param ColorHash(= void 0): strokeColor
                       lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha <= 0) {
        return;
    }

    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            a  = fillColor ? fillColor.a : strokeColor.a, fg, endTag;

        if (typeof radius === "number") { // Number -> [r, r, r, r]
            radius = [radius, radius, radius, radius];
        }
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
    this._matrix = uu.matrix2d.rotate(angle, this._matrix);
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
    this._matrix = uu.matrix2d.scale(x, y, this._matrix);
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
        font = uu.font(ctx.font, ctx.canvas),
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
            '">', uu.entity(text),
                _matrix('TextBlock', uu.matrix2d.translate(x - offX, y, ctx._matrix)));

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
    this._matrix = uu.matrix2d.transform(m11, m12, m21, m22, dx, dy, this._matrix);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this._matrixEffected = 1;
    this._matrix = uu.matrix2d.translate(x, y, this._matrix);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    var xaml;

    switch (this._state) {
    case 0x7: // [INLINE][LAZY] // this.clear();
            this.xFlyweight || (this._history = []);
            this._zindex = 0;
            this._state ? this._view.clear() : (this._stock = []);
            // break; [THROUGH]
    case 0x3:
            this._state = 0x1; // unlock
            if (this._stock.length) {
                xaml = "<Canvas>" + this._stock.join("") + "</Canvas>";
                this._view.add(this._content.createFromXaml(xaml));
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
        m = uu.matrix2d.translate(x, y, ctx._matrix),
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
                          '" Data="', path, '" Fill="', v.color.argb(), '" />'].join("");
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
        return uu.format('<Canvas Canvas.ZIndex="@"><Canvas Canvas.ZIndex="@" Clip="@">@</Canvas>@</Canvas>',
                      zindex, zindex2, path, img.join(""), shadow);
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
        rv.push('<GradientStop Color="' + v.color.argb() +
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
    rv.push('<GradientStop Color="', ary[0].color.argb(), '" Offset="0" />');
    for (i = 0; i < iz; ++i) {
        v = ary[i];
        rv.push('<GradientStop Color="' + v.color.argb() +
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
uu.ie678 && uu.env.silverlight && uu.ready(function() { // DOMContentLoaded
    uu.id("xaml") || doc.head.appendChild(uu.mix(uu.node("script"), {
            id:   "xaml",
            type: "text/xaml",
            text: '<Canvas xmlns="http://schemas.microsoft.com/client/2007" ' +
                          'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"></Canvas>'
    }));
});

})(this, document, uu);
//}@canvassl

//{@canvasfl
// === Flash Canvas ===

//  <canvas width="300" height="150">   <- this.canvas
//      <object id="external{n}"        <- this._view
//          width="300" height="150" classid="...">
//          <param name="allowScriptAccess" value="always" />
//          <param name="wmode" value="transparent" />
//          <param name="movie" value="../uu.canvas.swf" />
//      </object>
//  </canvas>

!window["CanvasRenderingContext2D"] && (function(win, doc, uu) {

uu.mix(uu.canvas.Flash.prototype, {
    arc:                    arc,
    arcTo:                  uu.nop,
    beginPath:              beginPath,
    bezierCurveTo:          bezierCurveTo,
    clear:                  clear,          // [EXTEND]
    clearRect:              clearRect,
    clip:                   clip,
    closePath:              closePath,
    createImageData:        createImageData,
    createLinearGradient:   createLinearGradient,
    createPattern:          createPattern,
    createRadialGradient:   createRadialGradient,
    drawCircle:             drawCircle,     // [EXTEND]
    drawImage:              drawImage,
    drawRoundRect:          drawRoundRect,  // [EXTEND]
    fill:                   fill,
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           getImageData,
    isPointInPath:          isPointInPath,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           putImageData,
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

uu.canvas.Flash.init = init;
uu.canvas.Flash.build = build;

// uu.canvas.Flash.init
function init(ctx, node) { // @param Node: <canvas>
    initSurface(ctx);
    ctx.canvas = node;
    ctx._view = null;
    ctx._state = 0; // 0x0: not ready
                    // 0x2: command ready
}

// uu.canvas.Flash.build
function build(canvas) { // @param Node: <canvas>
                         // @return Node:
    var ctx;

    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return ctx;
    };

    // CanvasRenderingContext.toDataURL
    canvas.toDataURL = function(mimeType,      // @param String(= "image/png"): mime type
                                jpegQuality) { // @param Number(= 0.8): jpeg quality, 0.0 ~ 1.0
        if (!canvas.width || !canvas.height) {
            return "data:,";
        }

        mimeType = (mimeType || "").toLowerCase();
        mimeType = mimeType === "image/jpeg" ? mimeType : "image/png";

        jpegQuality = parseFloat(jpegQuality); // undefined -> NaN
        if (isNaN(jpegQuality)) {
            jpegQuality = 0.8;
        }

        // [SYNC] ExternalInterface.toDataURL
        clearance(ctx);
        return ctx._view.toDataURL(mimeType, jpegQuality);
    };

    ctx = new uu.canvas.Flash(canvas);
    ctx._id = "external" + uu.number() + "x" + (+new Date).toString(16);

    // callback from ExternalInterface.call()
    function handleFlash(xid, msg, param) {
        switch (msg) {
        case "init":
            // [SYNC] ExternalInterface.initCanvas
            ctx._view.initCanvas(ctx.canvas.width, ctx.canvas.height,
                                 false, ctx.xFlyweight);

            ctx._state = 2; // 2: command ready

            if (canvas.currentStyle.direction === "rtl") {
                ctx._stock.push("rt");
            }
            send(ctx, "XX", 0xf); // send all state
//          break;
//      case "error":
//          break;
        }
    }

    // create swf <object>
    //  <?>
    //      <canvas>
    //          <object id="{{xid}}" width="{{width}}" height="{{height}}"
    //                  classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">
    //              <param name="movie" value="{{uu.config.canvas.swf}}" />
    //              <param name="wmode" value="transparent" />
    //              <param name="allowScriptAccess" value="always" />
    //          </object>
    //      </canvas>
    //  </?>
    ctx._view = uu.flash(uu.config.canvas.swf, { // ctx._view is <object>
                            xid:    ctx._id,
                            parent: canvas,
                            nowrap: true,
                            width:  canvas.width,
                            height: canvas.height,
                            wmode:  "transparent"
                         }, handleFlash);

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

            // resize view(aka <object>)
            ctx._view.width  = width  <= 0 ? 10 : width;
            ctx._view.height = height <= 0 ? 10 : height;

            // [SYNC] ExternalInterface.initCanvas
            if (ctx._state === 2) {
                ctx._view.initCanvas(width  <= 0 ? 10 : width,
                                     height <= 0 ? 10 : height, true,
                                     ctx.xFlyweight);
            }
        }
    }

    canvas.firstChild.attachEvent("onfocus", onFocus);
    canvas.attachEvent("onpropertychange", onPropertyChange);

    win.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        uu.dmz[ctx._id] = null;
        canvas.getContext = canvas.toDataURL = null;
        win.detachEvent("onunload", arguments.callee);
        canvas.detachEvent("onfocus", onFocus);
        canvas.detachEvent("onpropertychange", onPropertyChange);
    });
    return canvas;
}

// inner -
function initSurface(ctx) {
    // --- compositing ---
    ctx.globalAlpha     = 1.0;
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
    ctx._lockState      = 0;    // lock state, 0: unlock, 1: lock, 2: lock + clear
    ctx._lastTimerID    = 0;
    ctx._id             = "";   // "external{n}..."
    ctx._innerLock      = 0;    // lock for copy ready
    // --- extend properties ---
    ctx.xBackend        = "Flash";
    ctx.xFlyweight      = 0;    // 1 is animation mode
}

// inner -
function _copyprop(to, from) {
    to.globalAlpha      = from.globalAlpha;
    to.globalCompositeOperation = from.globalCompositeOperation;
    to.strokeStyle      = from.strokeStyle.toString(); // [!] no ref
    to.fillStyle        = from.fillStyle.toString();   // [!] no ref
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
    return to;
}

// class ImageData
function ImageData(width,     // @param Number:
                   height,    // @param Number:
                   rawdata) { // @param Array(= void 0):
    this.width  = width;
    this.height = height;
    this.build  = imagedatabuild;
    this.cache  = [];
    this.useCache = 0;

    var rv = [], n, i = -1, j = -1, iz = width * height;

    if (!rawdata) {
        while (++i < iz) {
            rv.push(0, 0, 0, 0); // RGBA
        }
    } else {
        iz = rawdata.length;

        while (++i < iz) {
            n = rawdata[i];

            rv[++j] = (n >> 16) & 0xff; // R
            rv[++j] = (n >>  8) & 0xff; // G
            rv[++j] =  n        & 0xff; // B
            rv[++j] = (n >> 24) & 0xff; // A
        }
    }
    this.data = rv;
}

// ImageData.build - build rawdata
//      [(R,G,B,A), ...] -> [Number(ARGB), ...]
function imagedatabuild() {
    if (this.useCache && this.cache.length) {
        return this.cache;
    }

    var rv = [], data = this.data, n,
        i = -1, j = -1, iz = data.length / 4 - 1;

    while (i < iz) {
        n  = data[++j] << 16;
        n |= data[++j] << 8;
        n |= data[++j];
        n += data[++j] * 0x1000000; // [!] 32bit

        rv[++i] = n;
    }
    if (this.useCache) {
        this.cache = rv; // cache
    }
    return rv;
}

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    send(this, "ar\t" + ((x * 1000) | 0) + "\t" +
                        ((y * 1000) | 0) + "\t" +
                        ((radius * 1000) | 0) + "\t" +
                        startAngle + "\t" +
                        endAngle + "\t" +
                        (anticlockwise ? 1 : 0));
}

// CanvasRenderingContext2D.prototype.arcTo
/*
function arcTo(x1, y1, x2, y2, radius) {
    send(this, "at\t" + x1 + "\t" + y1 + "\t" +
                        x2 + "\t" + y2 + "\t" + radius);
}
 */

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    send(this, "bP");
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    send(this, "bC\t" + ((cp1x * 1000) | 0) + "\t"
                      + ((cp1y * 1000) | 0) + "\t"
                      + ((cp2x * 1000) | 0) + "\t"
                      + ((cp2y * 1000) | 0) + "\t"
                      + ((x * 1000) | 0) + "\t"
                      + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    send(this, "cA"); // clearAll
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    send(this, "cR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
    send(this, "cl");
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
    send(this, "cP");
}

// CanvasRenderingContext2D.prototype.createImageData
// createImageData(sw, sh)
// createImageData(imagedata)
function createImageData(a,   // @param ImageData/Number: imagedata or width
                         b) { // @param Number: height
                              // @return ImageData: { width, height, data }
    var sw, sh;

    if (arguments.length === 2) {
        sw = a;
        sh = b;
    } else {
        if (!a) {
            throw new Error("NOT_SUPPORTED_ERR");
        }
        sw = a.width;
        sh = a.height;
    }
    return new ImageData(sw, sh);
}

// CanvasRenderingContext2D.prototype.getImageData
function getImageData(sx,   // @param Number:
                      sy,   // @param Number:
                      sw,   // @param Number:
                      sh) { // @param Number:
    if (sx !== sx || sy !== sy || sw !== sw || sh !== sh) {
        throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!sw || !sh) {
        throw new Error("INDEX_SIZE_ERR");
    }
    if (this._state !== 2) {
        throw new Error("BACKEND_NOT_READY");
    }

    var rawdata, width, height;

    // [SYNC]
    clearance(this);
    rawdata = this._view.getImageData(sx, sy, sw, sh);

    // get actual size
    width  = rawdata.shift();
    height = rawdata.shift();

    return new ImageData(width, height, rawdata);
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) { // @return CanvasGradient:
    function CanvasGradient(x0, y0, x1, y1) {
        this.type = 1;
        this.param = x0 + "\t" + y0 + "\t" + x1 + "\t" + y1;
        this.color = [];
        this._cache = "";
        this.toString = toString;
        this.addColorStop = addColorStop;
    }
    return new CanvasGradient(x0, y0, x1, y1);
}

// CanvasGradient.prototype.addColorStop
function addColorStop(offset, color) {
    this.color.push({ offset: (offset * 255.5) | 0, // Math.round(offset)
                      color:  uu.color(color) });
    this._cache = ""; // clear cache
}

// CanvasGradient.prototype.toString
function toString() {
    if (!this._cache) {
        this.color.sort(function(a, b) {
            return a.offset - b.offset;
        });

        var rv = [], ary = this.color, v, i = 0, iz = ary.length;

        for (; i < iz; ++i) {
            v = ary[i];
            rv.push(v.offset, v.color.num, v.color.a);
        }
        // liner
        //      x0, y0,     x1, y1,     length, {offset1, color1.num, color1.a},
        //                                      {offset2, ...}
        // radial
        //      x0, y0, r0, x1, y1, r1, length, {offset1, color1.num, color1.a},
        //                                      {offset2, ...}
        this._cache = this.param + "\t" + iz + "\t" + rv.join("\t");
    }
    return this._cache;
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image,    // @param HTMLImageElement/HTMLCanvasElement:
                       repeat) { // @param String(= "repeat"): repetition
                                 // @return Hash:
    function CanvasPattern(image, repeat) {
        this.type = 3;
        this.src = image.src; // HTMLImageElement
        this.repeat = repeat;
        this.toString = function() {
            return this.src + "\t" + this.repeat;
        };
    }
    repeat = repeat || "repeat";

    switch (repeat) {
    case "repeat": break;
    default: throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!("src" in image)) { // HTMLCanvasElement unsupported
        throw new Error("NOT_SUPPORTED_ERR");
    }
    // [SYNC] ExternalInterface.loadImage
    this._view.loadImage(image.src);

    return new CanvasPattern(image, repeat);
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) { // @return CanvasGradient:
    function CanvasGradient(x0, y0, r0, x1, y1, r1) {
        this.type = 2;
        this.param = x0 + "\t" + y0 + "\t" + r0 + "\t" +
                     x1 + "\t" + y1 + "\t" + r1;
        this.color = [];
        this._cache = "";
        this.toString = toString;
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
            f = fillColor ? (fillColor.num + "\t" + this.globalAlpha * fillColor.a)
                          : "0\t0",
            s = strokeColor ? (strokeColor.num + "\t" + this.globalAlpha * strokeColor.a)
                            : "0\t0";

        send(this, "X0\t" + x + "\t" + y + "\t" + radius + "\t" +
                            f + "\t" + s + "\t" + lw);
    }
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image,       dx, dy)
// drawImage(image,       dx, dy, dw, dh)
// drawImage(image,       sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    if (this.globalAlpha <= 0) {
        return;
    }

    var args = (a3 === void 0) ? 3
             : (a5 === void 0) ? 5 : 9,
        dx, dy, dw, dh, sx, sy, sw, sh, canvas, guid, ctx = this;

    if (image.src) { // HTMLImageElement
        // [SYNC] ExternalInterface.loadImage
        this._view.loadImage(image.src);

        send(this, "d0\t" + args + "\t" + image.src + "\t" +
                   a1 + "\t" + a2 + "\t" +
                   (a3 || 0) + "\t" + (a4 || 0) + "\t" +
                   (a5 || 0) + "\t" + (a6 || 0) + "\t" +
                   (a7 || 0) + "\t" + (a8 || 0), 0x5);
    } else { // HTMLCanvasElement
        canvas = image.firstChild;

        sx = 0;
        sy = 0;
        sw = canvas.width;
        sh = canvas.height;

        switch (args) {
        case 3: dx = a1, dy = a2, dw = sw, dh = sh; break;
        case 5: dx = a1, dy = a2, dw = a3, dh = a4; break;
        case 9: sx = a1, sy = a2, sw = a3, sh = a4;
                dx = a5, dy = a6, dw = a7, dh = a8;
        }

//        // [SYNC] ExternalInterface.copyCanvas
//        this._view.copyCanvas(canvas.id);

        send(this, "d1\t" + args + "\t" + canvas.id + "\t" +
                  sx + "\t" + sy + "\t" + sw + "\t" + sh + "\t" +
                  dx + "\t" + dy + "\t" + dw + "\t" + dh, 0x5);

/*
        // peek copy ready state
        //   js -> as -> js callback
        ++this._innerLock;
        this._view.addJsCallback(guid = uu.number());

        uu.dmz[this._id + guid] = function() {
            --ctx._innerLock; // unlock
            send(ctx, "XX");
        };
 */
    }
}

// CanvasRenderingContext2D.prototype.drawRoundRect - round rect
function drawRoundRect(x,           // @param Number:
                       y,           // @param Number:
                       width,       // @param Number:
                       height,      // @param Number:
                       radius,      // @param Number/Array: [top-left, top-right, bottom-right, bottom-left]
                       fillColor,   // @param ColorHash(= void 0): fillColor
                       strokeColor, // @param ColorHash(= void 0): strokeColor
                       lineWidth) { // @param Number(= 1): stroke lineWidth
    if (this.globalAlpha <= 0) {
        return;
    }

    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            f = fillColor ? (fillColor.num + "\t" + this.globalAlpha * fillColor.a)
                          : "0\t0",
            s = strokeColor ? (strokeColor.num + "\t" + this.globalAlpha * strokeColor.a)
                            : "0\t0";

        if (typeof radius === "number") { // Number -> [r, r, r, r]
            radius = [radius, radius, radius, radius];
        }
        send(this, "X1\t" + x + "\t" + y + "\t" + width + "\t" + height + "\t" +
                            radius[0] + "\t" + radius[1] + "\t" +
                            radius[2] + "\t" + radius[3] + "\t" +
                            f + "\t" + s + "\t" + lw);
    }
}

// CanvasRenderingContext2D.prototype.fill
function fill() {
    send(this, "fi", 0x5);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    send(this, "fR\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x5);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.isPointInPath
function isPointInPath(x, y) {
    // [SYNC] ExternalInterface.toDataURL
    clearance(this);
    return this._view.isPointInPath(x, y);
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    send(this, "lT\t" + ((x * 1000) | 0) + "\t" + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.lock
function lock(clearScreen) { // @param Boolean(= false):
    if (this._lockState) {
        throw new Error("DUPLICATE_LOCK");
    }
    this._lockState = clearScreen ? 2 : 1;
    if (clearScreen) {
        this._stock.push("cA");
    }
}

// CanvasRenderingContext2D.prototype.measureText
function measureText(text) {
    var metric = uu.font.metric(this.font, text);

    return { width: metric.w, height: metric.h };
}

// CanvasRenderingContext2D.prototype.moveTo
function moveTo(x, y) {
    send(this, "mT\t" + ((x * 1000) | 0) + "\t" + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.putImageData
function putImageData(imagedata,     // @param ImageData:
                      dx,            // @param Number:
                      dy,            // @param Number:
                      dirtyX,        // @param Number:
                      dirtyY,        // @param Number:
                      dirtyWidth,    // @param Number:
                      dirtyHeight) { // @param Number:
    var rawdata, undef;

    if (dx !== dx || dy !== dy) {
        throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!imagedata) {
        throw new Error("TYPE_MISMATCH_ERR");
    }

    dirtyX      = dirtyX      === undef ? 0 : dirtyX;
    dirtyY      = dirtyY      === undef ? 0 : dirtyY;
    dirtyWidth  = dirtyWidth  === undef ? imagedata.width  : dirtyWidth;
    dirtyHeight = dirtyHeight === undef ? imagedata.height : dirtyHeight;

    if (dirtyX !== dirtyX ||
        dirtyY !== dirtyY ||
        dirtyWidth  !== dirtyWidth ||
        dirtyHeight !== dirtyHeight) {
        throw new Error("NOT_SUPPORTED_ERR");
    }

    rawdata = imagedata.build().join(",");

    send(this, "pI\t" + imagedata.width  + "\t" +
                        imagedata.height + "\t" +
                        dx + "\t" +
                        dy + "\t" +
                        dirtyX + "\t" +
                        dirtyY + "\t" +
                        dirtyWidth + "\t" +
                        dirtyHeight + "\t" +
                        rawdata);
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    send(this, "qC\t" + ((cpx * 1000) | 0) + "\t"
                      + ((cpy * 1000) | 0) + "\t"
                      + ((x * 1000) | 0) + "\t"
                      + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    send(this, "re\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x5);
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
    send(this, "rs");
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    send(this, "ro\t" + ((angle * 1000000) | 0));
}

// CanvasRenderingContext2D.prototype.save
function save() {
    this._stack.push(_copyprop({}, this));
    send(this, "sv", 0xf); // [!]
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
    send(this, "sc\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
    send(this, "ST\t" + m11 + "\t" + m12 + "\t" +
                        m21 + "\t" + m22 + "\t" +
                         dx + "\t" +  dy);
}

// CanvasRenderingContext2D.prototype.stroke
function stroke() {
    send(this, "st", 0x7);
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    send(this, "sR\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x7);
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
    if (this.globalAlpha <= 0) {
        return;
    }

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    send(this, (fill ? "fT\t"
                     : "sT\t") + text + "\t" +
               (x || 0) + "\t" +
               (y || 0) + "\t" + (maxWidth || 0), 0xd);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    send(this, "tf\t" + m11 + "\t" + m12 + "\t" +
                        m21 + "\t" + m22 + "\t" +
                         dx + "\t" +  dy);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    send(this, "tl\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    if (this._lockState && this._stock.length) {
        this._lockState = 0; // [!] pre unlock
        send(this, "XX");
    }
    this._lockState = 0;
}

// inner -
function send(ctx,      // @param Context:
              commands, // @param String: commands, "{COMMAND}\t{ARG1}\t..."
              state) {  // @param Number: state bits
                        //      0x0: none
                        //      0x1: globalAlpha, globalCompositeOperation
                        //           strokeStyle, fillStyle
                        //      0x2: lineWidth, lineCap, lineJoin, miterLimit
                        //      0x4: shadowBlur, shadowOffsetX, shadowOffsetY
                        //           shadowColor
                        //      0x8: font, textAlign, textBaseline
    var ary = ctx._stock, i = ary.length - 1, font,
        bit = state || 0;

    // --- build state phase ---

    if (bit & 0x1) {
        if (ctx._alpha !== ctx.globalAlpha) {
            ary[++i] = "gA\t" + (ctx._alpha = ctx.globalAlpha);
        }
        if (ctx._mix != ctx.globalCompositeOperation) {
            ary[++i] = "gC\t" + (ctx._mix = ctx.globalCompositeOperation);
        }
        if (ctx._strokeStyle !== ctx.strokeStyle) {
            if (typeof ctx.strokeStyle === "string") {
                ctx.__strokeStyle = uu.color(ctx._strokeStyle = ctx.strokeStyle);
                ary[++i] = "s0\t" + ctx.__strokeStyle.num + "\t" +
                                    ((ctx.__strokeStyle.a * 1000) | 0);
            } else {
                // "s1" = LinerStroke
                // "s2" = RadialStroke
                // "s3" = PatternStorke
                ary[++i] = "s" + ctx.strokeStyle.type + "\t" +
                                 ctx.strokeStyle.toString();
            }
        }
        if (ctx._fillStyle !== ctx.fillStyle) {
            if (typeof ctx.fillStyle === "string") {
                ctx.__fillStyle = uu.color(ctx._fillStyle = ctx.fillStyle);
                ary[++i] = "f0\t" + ctx.__fillStyle.num + "\t" +
                                    ((ctx.__fillStyle.a * 1000) | 0);
            } else {
                // "f1" = LinerFill
                // "f2" = RadialFill
                // "f3" = PatternFill
                ary[++i] = "f" + ctx.fillStyle.type + "\t" +
                                 ctx.fillStyle.toString();
            }
        }
    }

    if (bit & 0x2) {
        if (ctx._lineWidth !== ctx.lineWidth) {
            ary[++i] = "lW\t" + (ctx._lineWidth = ctx.lineWidth);
        }
        if (ctx._lineCap !== ctx.lineCap) {
            ary[++i] = "lC\t" + (ctx._lineCap = ctx.lineCap);
        }
        if (ctx._lineJoin !== ctx.lineJoin) {
            ary[++i] = "lJ\t" + (ctx._lineJoin = ctx.lineJoin);
        }
        if (ctx._miterLimit !== ctx.miterLimit) {
            ary[++i] = "mL\t" + (ctx._miterLimit = ctx.miterLimit);
        }
    }

    if (bit & 0x4) {
        if (ctx._shadowBlur !== ctx.shadowBlur ||
            ctx._shadowOffsetX !== ctx.shadowOffsetX ||
            ctx._shadowOffsetY !== ctx.shadowOffsetY ||
            ctx._shadowColor   !== ctx.shadowColor) {

            if (ctx._shadowColor !== ctx.shadowColor) {
                ctx.__shadowColor = uu.color(ctx._shadowColor = ctx.shadowColor);
            }
            ctx._shadowBlur    = ctx.shadowBlur;
            ctx._shadowOffsetX = ctx.shadowOffsetX;
            ctx._shadowOffsetY = ctx.shadowOffsetY;

            ary[++i] = "sh\t" + ctx.shadowBlur        + "\t" +
                                ctx.__shadowColor.num + "\t" +
                                ((ctx.__shadowColor.a * 1000) | 0) + "\t" +
                                ctx.shadowOffsetX     + "\t" +
                                ctx.shadowOffsetY;
        }
    }

    if (bit & 0x8) {
        if (ctx._font !== ctx.font) {
            ctx._font = ctx.font;

            font = uu.font(ctx.font, ctx.canvas);
            ary[++i] = "fo\t" + font.size + "\t" +
                                font.style + "\t" +
                                font.weight + "\t" +
                                font.variant + "\t" +
                                font.family;
        }
        if (ctx._textAlign !== ctx.textAlign) {
            ary[++i] = "tA\t" + (ctx._textAlign = ctx.textAlign);
        }
        if (ctx._textBaseline !== ctx.textBaseline) {
            ary[++i] = "tB\t" + (ctx._textBaseline = ctx.textBaseline);
        }
    }

    // --- build message phase ---
    ary[++i] = commands;

    if (!ctx._lockState && ctx._innerLock <= 0) {
        if (ctx._state === 2) {
            if (!ctx._lastTimerID) {
                ctx._lastTimerID = setTimeout(function() {
                    if (ctx._lastTimerID) {
                        clearance(ctx);
                        ctx._lastTimerID = 0;
                    }
                }, 0);
            }
        }
    }
}

// inner - stocked messages clearance
function clearance(ctx) {
    if (ctx._stock.length) {
        var msg = ctx._stock.join("\t");

        ctx._stock = []; // pre clear

        // [SYNC] ExternalInterface.toDataURL
        ctx._view.CallFunction(
            '<invoke name="msg" returntype="javascript"><arguments><string>' +
            msg +
            '</string></arguments></invoke>');
    }
}

})(this, document, uu);
//}@canvasfl

// === uu.matrix2d ===


//  type Matrix2DArray = [m11, m12, m13,     [1, 0, 0,     [m[0], m[1], m[2],
//                        m21, m22, m23,      0, 1, 0,      m[3], m[4], m[5],
//                        m31, m32, m33]      x, y, 1]      m[6], m[7], m[8]]

//  type SVGMatrix2DHash = { a, c, e,        [m11,    m21,    m31(x)
//                           b, d, f,    ->   m12,    m22,    m32(y)
//                           0, 0, 1 }        m13(0), m23(0), m33(1)]

!window["CanvasRenderingContext2D"] && (function(uu) {

uu.matrix2d = identify;     // matrix2d.identify():Matrix2DArray - [1,0,0, 0,1,0, 0,0,1]
uu.mix(uu.matrix2d, {
    multiply:   multiply,   // matrix2d.multiply(ma:Matrix2DArray,
                            //                   mb:Matrix2DArray):Matrix2DArray
    scale:      scale,      // matrix2d.scale(x:Number,
                            //                y:Number,
                            //                m:Matrix2DArray):Matrix2DArray
    rotate:     rotate,     // matrix2d.rotate(angle:Number,
                            //                 m:Matrix2DArray):Matrix2DArray
    transform:  transform,  // matrix2d.transform(m11:Number, m12:Number, m21:Number,
                            //                    m22:Number,  dx:Number,  dy:Number,
                            //                      m:Matrix2DArray):Matrix2DArray
    translate:  translate   // matrix2d.translate(x:Number,
                            //                    y:Number,
                            //                    m:Matrix2DArray):Matrix2DArray
});

// uu.matrix2d - 2D Matrix identify
function identify() { // @return Matrix2DArray: [1,0,0, 0,1,0, 0,0,1]
    return [1, 0, 0,
            0, 1, 0,
            0, 0, 1];
}

// uu.matrix2d.multiply - 2D Matrix multiply
function multiply(ma,   // @param Matrix2DArray: matrix A
                  mb) { // @param Matrix2DArray: matrix B
                        // @return Matrix2DArray: A x B
    return [ma[0] * mb[0] + ma[1] * mb[3] + ma[2] * mb[6],  // m11
            ma[0] * mb[1] + ma[1] * mb[4] + ma[2] * mb[7],  // m12
            0,                                              // m13
            ma[3] * mb[0] + ma[4] * mb[3] + ma[5] * mb[6],  // m21
            ma[3] * mb[1] + ma[4] * mb[4] + ma[5] * mb[7],  // m22
            0,                                              // m23
            ma[6] * mb[0] + ma[7] * mb[3] + ma[8] * mb[6],  // m31(dx)
            ma[6] * mb[1] + ma[7] * mb[4] + ma[8] * mb[7],  // m32(dy)
            ma[6] * mb[2] + ma[7] * mb[5] + ma[8] * mb[8]]; // m33
}

// uu.matrix2d.scale - 2D Matrix multiply x scale
function scale(x,   // @param Number:
               y,   // @param Number:
               m) { // @param Matrix2DArray: matrix
                    // @return Matrix2DArray:
    // [x, 0, 0,
    //  0, y, 0,
    //  0, 0, 1]
    return [x * m[0], x * m[1],    0,
            y * m[3], y * m[4],    0,
                m[6],     m[7], m[8]];
}

// uu.matrix2d.rotate - 2D Matrix multiply x rotate
function rotate(angle, // @param Number: radian
                m) {   // @param Matrix2DArray: matrix
                       // @return Matrix2DArray:
    // [ c, s, 0,
    //  -s, c, 0,
    //   0, 0, 1]
    var c = Math.cos(angle),
        s = Math.sin(angle);

    return [ c * m[0] + s * m[3],  c * m[1] + s * m[4], 0,
            -s * m[0] + c * m[3], -s * m[1] + c * m[4], 0,
                            m[6],                 m[7], m[8]];
}

// uu.matrix2d.transform - 2D Matrix multiply x transform
function transform(m11, // @param Number:
                   m12, // @param Number:
                   m21, // @param Number:
                   m22, // @param Number:
                   dx,  // @param Number:
                   dy,  // @param Number:
                   m) { // @param Matrix2DArray: matrix
                        // @return Matrix2DArray:
    // [m11, m12, 0,
    //  m21, m22, 0,
    //   dx,  dy, 1]
    return [m11 * m[0] + m12 * m[3], m11 * m[1] + m12 * m[4], 0,
            m21 * m[0] + m22 * m[3], m21 * m[1] + m22 * m[4], 0,
             dx * m[0] +  dy * m[3] + m[6],
             dx * m[1] +  dy * m[4] + m[7],
             dx * m[2] +  dy * m[5] + m[8]];
}

// uu.matrix2d.translate - 2D Matrix multiply x translate
function translate(x,   // @param Number:
                   y,   // @param Number:
                   m) { // @param Matrix2DArray: matrix
                        // @return Matrix2DArray:
    // [1, 0, 0,
    //  0, 1, 0,
    //  x, y, 1]
    return [m[0], m[1], 0,
            m[3], m[4], 0,
            x * m[0] + y * m[3] + m[6],
            x * m[1] + y * m[4] + m[7],
            x * m[2] + y * m[5] + m[8]];
}

})(uu);

//}@canvas
//}@mb

