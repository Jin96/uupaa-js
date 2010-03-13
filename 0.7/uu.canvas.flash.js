
// === Flash Canvas ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js,
//         uu.font.js, uu.canvas.js, uu.flash.js

//  <canvas width="300" height="150">
//      <object id="external{n}" width="300" height="150" classid="...">
//          <param name="allowScriptAccess" value="always" />
//          <param name="flashVars" value="" />
//          <param name="wmode" value="transparent" />
//          <param name="movie" value="../uu.canvas.swf" />
//      </object>
//  </canvas>

//{{{!mb

uu.agein || (function(win, doc, uu) {

uu.mix(uu.canvas.Flash.prototype, {
    arc:                    arc,
    arcTo:                  uunop,
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
    fill:                   fill,
    fillRect:               fillRect,
    fillText:               fillText,
    getImageData:           getImageData,
    initSurface:            initSurface,    // [EXTEND]
    isPointInPath:          isPointInPath,
    lineTo:                 lineTo,
    lock:                   lock,           // [EXTEND]
    measureText:            measureText,
    moveTo:                 moveTo,
    putImageData:           putImageData,
    quickStroke:            uunop,          // [EXTEND]
    quickStrokeRect:        uunop,          // [EXTEND]
    quadraticCurveTo:       quadraticCurveTo,
    rect:                   rect,
    resize:                 resize,         // [EXTEND]
    restore:                restore,
    rotate:                 rotate,
    save:                   save,
    scale:                  scale,
    send:                   send,           // [EXTEND]
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
    ctx.canvas = node;
    ctx.initSurface();

    ctx._view = null; // swf <object>
}

// uu.canvas.Flash.build
function build(canvas) { // @param Node: <canvas>
                         // @return Node:
    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return canvas.uuctx;
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
        clearance(this);
        return canvas.uuctx._view.toDataURL(mimeType, jpegQuality);
    };

    canvas.uuctx = new uu.canvas.Flash(canvas);
    canvas.uuctx._id = "external" + uu.guid() + "x" + (+new Date).toString(16);

    uu.dmz[canvas.uuctx._id] = flashCanvasReadyCallback;

    // wait for response from flash initializer
    function flashCanvasReadyCallback() {
        var ctx = canvas.uuctx;

        // [ASYNC]
        setTimeout(function() {
            ctx._readyState = 1; // 1: draw ready

            // [SYNC] send "init" command. init(width, heigth, xFlyweight)
            ctx._view.CallFunction(send._prefix +
                "in\t" + ctx.canvas.width + "\t" + ctx.canvas.height +
                "\t" + ctx.xFlyweight + send._suffix);

            if (canvas.currentStyle.direction === "rtl") {
                ctx._stock.push("rt");
            }
            ctx.send("XX", 0xf);
        }, 0);
    }

    // create swf <object>
    canvas.innerHTML = uu.fmt(
        '<object id="?" width="?" height="?" classid="?">' +
            '<param name="allowScriptAccess" value="always" />' +
            '<param name="flashVars" value="" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="movie" value="?" /></object>',
        [canvas.uuctx._id, canvas.width, canvas.height,
         "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
         uu.config.dir + "uu.canvas.swf"]);

    canvas.uuctx._view = canvas.firstChild; // <object>

    // uncapture key events(release focus)
    function onFocus(evt) {
        var obj = evt.srcElement,     // <canvas><object /></canvas>
            canvas = obj.parentNode;  // <canvas>

        obj.blur();
        canvas.focus();
    }

    // trap <canvas width>, <canvas height> change event
    function onPropertyChange(evt) {
        var attr = evt.propertyName;

        attr === "width"  && canvas.uuctx.resize(canvas.width);
        attr === "height" && canvas.uuctx.resize(void 0, canvas.height);
    }

    canvas.firstChild.attachEvent("onfocus", onFocus); // <object>.attachEvent
    canvas.attachEvent("onpropertychange", onPropertyChange);

    win.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        uu.dmz[canvas.uuctx._id] = null;
        canvas.uuctx = canvas.getContext = canvas.toDataURL = null;
        win.detachEvent("onunload", arguments.callee);
        canvas.detachEvent("onfocus", onFocus);
        canvas.detachEvent("onpropertychange", onPropertyChange);
    });
    return canvas;
}

// CanvasRenderingContext2D.prototype.initSurface
function initSurface() {
    // --- compositing ---
    this.globalAlpha    = 1.0;
    this.globalCompositeOperation = "source-over";
    // --- colors and styles ---
    this.strokeStyle    = "black"; // String or Object
    this.fillStyle      = "black"; // String or Object
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
    // --- current position ---
    this.px             = 0;    // current position x
    this.py             = 0;    // current position y
    // --- hidden properties ---
    this._stack         = [];   // matrix and prop stack.
    this._stock         = [];   // lock stock
    this._lockState     = 0;    // lock state, 0: unlock, 1: lock, 2: lock + clear
    this._readyState    = 0;
    this._lastTimerID   = 0;
    this._lastMessageID = 1;
    this._id            = "";   // "external{n}..."
    this._innerLock     = 0;    // lock for copy ready
    // --- extend properties ---
    this.xBackend       = "Flash";
    this.xFlyweight     = 0;    // 1 is animation mode
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
        n += data[++j] * 0x1000000;

        rv[++i] = n;
    }
    if (this.useCache) {
        this.cache = rv; // cache
    }
    return rv;
}

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    this.send("ar\t" + x + "\t" + y + "\t" +
                       radius     + "\t" +
                       startAngle + "\t" +
                       endAngle   + "\t" +
                       (anticlockwise ? 1 : 0));
}

// CanvasRenderingContext2D.prototype.arcTo
/*
function arcTo(x1, y1, x2, y2, radius) {
    this.send("at\t" + x1 + "\t" + y1 + "\t" +
                       x2 + "\t" + y2 + "\t" + radius);
}
 */

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    this.send("bP");
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.send("bC\t" + cp1x + "\t" + cp1y + "\t" +
                       cp2x + "\t" + cp2y + "\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    this.send("cA"); // clearAll
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    this.send("cR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
    this.send("cl");
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
    this.send("cP");
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
    if (isNaN(sx) || isNaN(sy) || isNaN(sw) || isNaN(sh)) {
        throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!sw || !sh) {
        throw new Error("INDEX_SIZE_ERR");
    }
    if (this._readyState !== 2) {
        throw new Error("FLASH_NOT_READY");
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
function drawCircle(x,             // @param Number:
                    y,             // @param Number:
                    r,             // @param Number: radius
                    fillColor,     // @param ColorHash(= void 0): fillColor
                    strokeColor,   // @param ColorHash(= void 0): strokeColor
                    lineWidth) {   // @param Number(= 1): stroke lineWidth
    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            f = fillColor ? (fillColor.num + "\t" + this.globalAlpha * fillColor.a)
                          : "0\t0",
            s = strokeColor ? (strokeColor.num + "\t" + this.globalAlpha * strokeColor.a)
                            : "0\t0";

        this.send("X0\t" + x + "\t" + y + "\t" + r + "\t" +
                           f + "\t" + s + "\t" + lw);
    }
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image,       dx, dy)
// drawImage(image,       dx, dy, dw, dh)
// drawImage(image,       sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    var args = (a3 === void 0) ? 3
             : (a5 === void 0) ? 5 : 9,
        dx, dy, dw, dh, sx, sy, sw, sh, canvas, guid, ctx = this;

    if (image.src) { // HTMLImageElement
        this.send("d0\t" + args + "\t" + image.src + "\t" +
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
        this.send("d1\t" + args + "\t" + canvas.id + "\t" +
                  sx + "\t" + sy + "\t" + sw + "\t" + sh + "\t" +
                  dx + "\t" + dy + "\t" + dw + "\t" + dh, 0x5);

        // peek copy ready state
        //   js -> as -> js callback
        ++this._innerLock;
        this._view.addJsCallback(guid = uu.guid());

        uu.dmz[this._id + guid] = function() {
            --ctx._innerLock; // unlock
            ctx.send("XX");
        };
    }
}

// CanvasRenderingContext2D.prototype.fill
function fill() {
    this.send("fi", 0x5);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.send("fR\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x5);
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
    this.send("lT\t" + ((x * 1000) | 0) + "\t" + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.lock
function lock(clearScreen) { // @param Boolean(= false):
    if (this._lockState) {
        throw new Error("duplicate lock");
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
    this.send("mT\t" + ((x * 1000) | 0) + "\t" + ((y * 1000) | 0));
}

// CanvasRenderingContext2D.prototype.putImageData
function putImageData(imagedata,     // @param ImageData:
                      dx,            // @param Number:
                      dy,            // @param Number:
                      dirtyX,        // @param Number:
                      dirtyY,        // @param Number:
                      dirtyWidth,    // @param Number:
                      dirtyHeight) { // @param Number:
    if (isNaN(dx) || isNaN(dy)) {
        throw new Error("NOT_SUPPORTED_ERR");
    }
    if (!imagedata) {
        throw new Error("TYPE_MISMATCH_ERR");
    }

    dirtyX      = dirtyX      === void 0 ? 0 : dirtyX;
    dirtyY      = dirtyY      === void 0 ? 0 : dirtyY;
    dirtyWidth  = dirtyWidth  === void 0 ? imagedata.width  : dirtyWidth;
    dirtyHeight = dirtyHeight === void 0 ? imagedata.height : dirtyHeight;

    if (isNaN(dirtyX) || isNaN(dirtyY)
        || isNaN(dirtyWidth) || isNaN(dirtyHeight)) {
        throw new Error("NOT_SUPPORTED_ERR");
    }

    var rawdata = imagedata.build().join(",");

    this.send("pI\t" + imagedata.width  + "\t" +
                       imagedata.height + "\t" +
                       dx + "\t" +
                       dy + "\t" +
                       dirtyX + "\t" +
                       dirtyY + "\t" +
                       dirtyWidth + "\t" +
                       dirtyHeight + "\t" +
                       rawdata);
}

// CanvasRenderingContext2D.prototype.quickStroke -> NOT IMPL
// CanvasRenderingContext2D.prototype.quickStrokeRect -> NOT IMPL

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    this.send("qC\t" + cpx + "\t" + cpy + "\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this.send("re\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x5);
}

// CanvasRenderingContext2D.prototype.resize
function resize(width,    // @param Number(= void 0): width
                height) { // @param Number(= void 0): height
    var state = this._readyState;

    this.initSurface()

    if (width !== void 0) {
        this.canvas.style.pixelWidth = width;
        this._view.width = width;
    }
    if (height !== void 0) {
        this.canvas.style.pixelHeight = height;
        this._view.height = height;
    }
    this._readyState = state;
    this._lastMessageID = 100 + uu.guid(); // [!] next command force send

    // [SYNC] ExternalInterface.resize
    this._view.resize(this.canvas.width, this.canvas.height, this.xFlyweight);
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
    this.send("rs");
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this.send("ro\t" + ((angle * 1000000) | 0));
}

// CanvasRenderingContext2D.prototype.save
function save() {
    var prop = {};

    _copyprop(prop, this);
    this._stack.push(prop);

    this.send("sv", 0xf); // [!]
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
    this.send("sc\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
    this.send("ST\t" + m11 + "\t" + m12 + "\t" +
                       m21 + "\t" + m22 + "\t" +
                        dx + "\t" +  dy);
}

// CanvasRenderingContext2D.prototype.stroke
function stroke() {
    this.send("st", 0x7);
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.send("sR\t" + x + "\t" + y + "\t" + w + "\t" + h, 0x7);
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    this.send((fill ? "fT\t"
                    : "sT\t") + text + "\t" +
              (x || 0) + "\t" +
              (y || 0) + "\t" + (maxWidth || 0), 0xd);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    this.send("tf\t" + m11 + "\t" + m12 + "\t" +
                       m21 + "\t" + m22 + "\t" +
                        dx + "\t" +  dy);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this.send("tl\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    if (this._lockState) {
        if (this._stock.length) {
            this._lockState = 0; // [!] pre unlock
            this.send("XX");
        }
    }
    this._lockState = 0;
}

// CanvasRenderingContext2D.prototype.send
function send(commands, // @param String: commands, "{COMMAND}\t{ARG1}\t..."
              state) {  // @param Number: state bits
                        //      0x0: none
                        //      0x1: globalAlpha, globalCompositeOperation
                        //           strokeStyle, fillStyle
                        //      0x2: lineWidth, lineCap, lineJoin, miterLimit
                        //      0x4: shadowBlur, shadowOffsetX, shadowOffsetY
                        //           shadowColor
                        //      0x8: font, textAlign, textBaseline
    var ctx = this, ary = this._stock, i = ary.length - 1, font,
        bit = state || 0;

    // --- build state phase ---

    if (bit & 0x1) {
        if (this._alpha !== this.globalAlpha) {
            ary[++i] = "gA\t" + (this._alpha = this.globalAlpha);
        }
        if (this._mix != this.globalCompositeOperation) {
            ary[++i] = "gC\t" + (this._mix = this.globalCompositeOperation);
        }
        if (this._strokeStyle !== this.strokeStyle) {
            if (typeof this.strokeStyle === "string") {
                this.__strokeStyle = uu.color(this._strokeStyle = this.strokeStyle);
                ary[++i] = "s0\t" + this.__strokeStyle.num + "\t" +
                                    this.__strokeStyle.a;
            } else {
                // "s1" = LinerStroke
                // "s2" = RadialStroke
                // "s3" = PatternStorke
                ary[++i] = "s" + this.strokeStyle.type + "\t" +
                                 this.strokeStyle.toString();
            }
        }
        if (this._fillStyle !== this.fillStyle) {
            if (typeof this.fillStyle === "string") {
                this.__fillStyle = uu.color(this._fillStyle = this.fillStyle);
                ary[++i] = "f0\t" + this.__fillStyle.num + "\t" +
                                    this.__fillStyle.a;
            } else {
                // "f1" = LinerFill
                // "f2" = RadialFill
                // "f3" = PatternFill
                ary[++i] = "f" + this.fillStyle.type + "\t" +
                                 this.fillStyle.toString();
            }
        }
    }

    if (bit & 0x2) {
        if (this._lineWidth !== this.lineWidth) {
            ary[++i] = "lW\t" + (this._lineWidth = this.lineWidth);
        }
        if (this._lineCap !== this.lineCap) {
            ary[++i] = "lC\t" + (this._lineCap = this.lineCap);
        }
        if (this._lineJoin !== this.lineJoin) {
            ary[++i] = "lJ\t" + (this._lineJoin = this.lineJoin);
        }
        if (this._miterLimit !== this.miterLimit) {
            ary[++i] = "mL\t" + (this._miterLimit = this.miterLimit);
        }
    }

    if (bit & 0x4) {
        if (this._shadowBlur !== this.shadowBlur
            || this._shadowOffsetX !== this.shadowOffsetX
            || this._shadowOffsetY !== this.shadowOffsetY
            || this._shadowColor   !== this.shadowColor) {

            if (this._shadowColor !== this.shadowColor) {
                this.__shadowColor = uu.color(this._shadowColor = this.shadowColor);
            }
            this._shadowBlur    = this.shadowBlur;
            this._shadowOffsetX = this.shadowOffsetX;
            this._shadowOffsetY = this.shadowOffsetY;

            ary[++i] = "sh\t" + this.shadowBlur        + "\t" +
                                this.__shadowColor.num + "\t" +
                                this.__shadowColor.a   + "\t" +
                                this.shadowOffsetX     + "\t" +
                                this.shadowOffsetY;
        }
    }

    if (bit & 0x8) {
        if (this._font !== this.font) {
            this._font = this.font;

            font = uu.font.parse(this.font, this.canvas);
            ary[++i] = "fo\t" + font.size + "\t" +
                                font.style + "\t" +
                                font.weight + "\t" +
                                font.variant + "\t" +
                                font.family;
        }
        if (this._textAlign !== this.textAlign) {
            ary[++i] = "tA\t" + (this._textAlign = this.textAlign);
        }
        if (this._textBaseline !== this.textBaseline) {
            ary[++i] = "tB\t" + (this._textBaseline = this.textBaseline);
        }
    }

    // --- build message phase ---
    ary[++i] = commands;

    if (!this._lockState && this._innerLock <= 0) {
        if (this._readyState === 1) {
            this._readyState = 2;

            clearance(this);
        }
        if (this._readyState === 2) {

            // <param name="flashVars" param="i={msgid}&b={msgbody}" />
            if (!this._lastTimerID) {
                this._lastTimerID = setTimeout(function() {
                    if (ctx._lastTimerID) {
                        if (ctx._stock.length) {
                            // http://twitter.com/uupaa/status/9182387840
                            // http://twitter.com/uupaa/status/9195030504
                            // http://twitter.com/uupaa/status/9195279662
                            // http://twitter.com/uupaa/status/9196237383
                            // http://twitter.com/uupaa/status/9196368732
                            var message = "i=" + ctx._lastMessageID +
                                          "&b=" + ctx._stock.join("\t");

                            // pre clear
                            ctx._stock = [];

                            // [ASYNC] There might be a packet loss
                            ctx._view.flashVars = message;

                            // round-trip
                            ++ctx._lastMessageID > 9 && (ctx._lastMessageID = 1);

//                          clearTimeout(ctx._lastTimerID);
                        }
                        ctx._lastTimerID = 0;
                    }
                }, 0); // http://twitter.com/uupaa/status/9837157309
            }
        }
    }
}
send._prefix = '<invoke name="send" returntype="javascript"><arguments><string>';
send._suffix = '</string></arguments></invoke>';

// inner - stocked messages clearance
function clearance(ctx) {
    if (ctx._stock.length) {
        var msg = ctx._stock.join("\t");

        ctx._stock = []; // pre clear
        // [SYNC]
        ctx._view.CallFunction(send._prefix + msg + send._suffix);
    }
}

})(window, document, uu);

//}}}!mb

