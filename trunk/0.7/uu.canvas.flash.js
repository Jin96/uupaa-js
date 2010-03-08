
// === Flash Canvas ===
// depend: uu.js, uu.color.js, uu.css.js, uu.img.js,
//         uu.font.js, uu.canvas.js, uu.flash.js

//  <canvas width="300" height="150">
//      <object id="externalcanvas{n}" width="300" height="150" classid="...">
//          <param name="allowScriptAccess" value="always" />
//          <param name="flashVars" value="" />
//          <param name="wmode" value="transparent" />
//          <param name="movie" value="../uu.canvas.swf" />
//      </object>
//  </canvas>

//{{{!mb

uu.agein || (function(win, doc, uu) {

uu.mix(uu.canvas.FL2D.prototype, {
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
    sendState:              sendState,      // [EXTEND]
    setTransform:           setTransform,
    stroke:                 stroke,
    strokeCircle:           strokeCircle,   // [EXTEND]
    strokeRect:             strokeRect,
    strokeText:             strokeText,
    transform:              transform,
    translate:              translate,
    unlock:                 unlock          // [EXTEND]
});

uu.canvas.FL2D.init = init;
uu.canvas.FL2D.build = build;

// uu.canvas.FL2D.init
function init(ctx, node) { // @param Node: <canvas>
    ctx.canvas = node;
    ctx.initSurface();

    ctx._view = null; // swf <object>
}

// uu.canvas.FL2D.build
function build(canvas) { // @param Node: <canvas>
                         // @return Node:
    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return canvas.uuctx2d;
    };
    canvas.uuctx2d = new uu.canvas.FL2D(canvas);

    var id = "externalcanvas" + uu.guid() + (+new Date);

    uu.dmz[id] = flashCanvasReadyCallback;

    // wait for response from flash initializer
    function flashCanvasReadyCallback() {
        var ctx = canvas.uuctx2d;

        ctx._readyState = 1; // 1: draw ready
        if (canvas.currentStyle.direction === "rtl") {
            ctx._stock.push("rt");
        }
        ctx.sendState(0xf);
        ctx.send();
        // [GC]
        uu.dmz[id] = null;
    }

    // create swf <object>
    canvas.innerHTML = uu.fmt(
        '<object id="?" width="?" height="?" classid="?">' +
            '<param name="allowScriptAccess" value="always" />' +
            '<param name="flashVars" value="" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="movie" value="?" /></object>',
        [id, canvas.width, canvas.height,
         "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
         uu.config.dir + "uu.canvas.swf"]);

//  canvas.uuctx2d._view = uu.id(id); // find swf <object>
    canvas.uuctx2d._view = canvas.firstChild; // <object>

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

        attr === "width"  && canvas.uuctx2d.resize(canvas.width);
        attr === "height" && canvas.uuctx2d.resize(void 0, canvas.height);
    }

    canvas.firstChild.attachEvent("onfocus", onFocus); // <object>.attachEvent
    canvas.attachEvent("onpropertychange", onPropertyChange);

    win.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        canvas.uuctx2d = canvas.getContext = null;
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
    // --- hidden properties ---
    this.px             = 0;
    this.py             = 0;
    this._stack         = [];   // matrix and prop stack.
    this._stock         = [];   // lock stock
    this._lockState     = 0;    // lock state, 0: unlock, 1: lock, 2: lock + clear
    this._readyState    = 0;
    this._tmid          = 0;    // timer id
    this._msgid         = 1;    // message id
    // --- extend properties ---
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
//  this.sendState();
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

// CanvasRenderingContext2D.prototype.createImageData -> NOT IMPL

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

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image,       dx, dy)
// drawImage(image,       dx, dy, dw, dh)
// drawImage(image,       sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    var args = (a3 === void 0) ? 3
             : (a5 === void 0) ? 5 : 9,
        dx, dy, dw, dh, sx, sy, sw, sh, canvas;

    if (image.src) { // HTMLImageElement
        this.sendState(0x5);
        this.send("d0\t" + args + "\t" + image.src + "\t" +
                  a1 + "\t" + a2 + "\t" +
                  (a3 || 0) + "\t" + (a4 || 0) + "\t" +
                  (a5 || 0) + "\t" + (a6 || 0) + "\t" +
                  (a7 || 0) + "\t" + (a8 || 0));
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
        this.sendState(0x5);
        this.send("d1\t" + args + "\t" + canvas.id + "\t" +
                  sx + "\t" + sy + "\t" + sw + "\t" + sh + "\t" +
                  dx + "\t" + dy + "\t" + dw + "\t" + dh);
    }
}

// CanvasRenderingContext2D.prototype.fill
function fill() {
    this.sendState(0x5);
    this.send("fi");
}

// CanvasRenderingContext2D.prototype.fillCircle
function fillCircle(x,       // @param Number:
                    y,       // @param Number:
                    r,       // @param Number: radius
                    color) { // @param ColorHash:
    this.send("X0\t" + x + "\t" +
                       y + "\t" +
                       r + "\t" +
                       color.num + "\t" +
                       color.a * this.globalAlpha);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.sendState(0x5);
    this.send("fR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
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

// CanvasRenderingContext2D.prototype.putImageData -> NOT IMPL
// CanvasRenderingContext2D.prototype.quickStroke -> NOT IMPL
// CanvasRenderingContext2D.prototype.quickStrokeRect -> NOT IMPL

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    this.send("qC\t" + cpx + "\t" + cpy + "\t" + x + "\t" + y);
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this.sendState(0x5);
    this.send("re\t" + x + "\t" + y + "\t" + w + "\t" + h);
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
    this._msgid = 100 + uu.guid(); // [!] next command force send

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

    this.sendState(0xf); // [!]
    this.send("sv");
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
    this.sendState(0x7);
    this.send("st");
}

// CanvasRenderingContext2D.prototype.strokeCircle
function strokeCircle(x,       // @param Number:
                      y,       // @param Number:
                      r,       // @param Number: radius
                      color) { // @param ColorHash:
    this.sendState(0x2);
    this.send("X1\t" + x + "\t" +
                       y + "\t" +
                       r + "\t" +
                       color.num + "\t" +
                       color.a * this.globalAlpha);
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.sendState(0x7);
    this.send("sR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    this.sendState(0xd);
    this.send((fill ? "fT\t"
                    : "sT\t") + text + "\t" +
              (x || 0) + "\t" +
              (y || 0) + "\t" + (maxWidth || 0));
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
            this.send();
        }
    }
    this._lockState = 0;
}

// inner
function sendState(bits) { // @param Number: bits
    var ary = this._stock, i = ary.length - 1, font;

    if (bits & 0x1) {
        this._alpha !== this.globalAlpha &&
            (ary[++i] = "gA\t" + (this._alpha = this.globalAlpha));

        this._mix != this.globalCompositeOperation &&
            (ary[++i] = "gC\t" + (this._mix = this.globalCompositeOperation));

        if (this._strokeStyle !== this.strokeStyle) {
            if (typeof this.strokeStyle === "string") {
                this.__strokeStyle = uu.color(this._strokeStyle = this.strokeStyle);
                ary[++i] = "s0\t" + this.__strokeStyle.num + "\t" + this.__strokeStyle.a;
            } else {
                // "s1" = LinerStroke
                // "s2" = RadialStroke
                // "s3" = PatternStorke
                ary[++i] = "s" + this.strokeStyle.type + "\t" + this.strokeStyle.toString();
            }
        }

        if (this._fillStyle !== this.fillStyle) {
            if (typeof this.fillStyle === "string") {
                this.__fillStyle = uu.color(this._fillStyle = this.fillStyle);
                ary[++i] = "f0\t" + this.__fillStyle.num + "\t" + this.__fillStyle.a;
            } else {
                // "f1" = LinerFill
                // "f2" = RadialFill
                // "f3" = PatternFill
                ary[++i] = "f" + this.fillStyle.type + "\t" + this.fillStyle.toString();
            }
        }
    }
    if (bits & 0x2) {
        this._lineWidth !== this.lineWidth &&
            (ary[++i] = "lW\t" + (this._lineWidth = this.lineWidth));

        this._lineCap !== this.lineCap &&
            (ary[++i] = "lC\t" + (this._lineCap = this.lineCap));

        this._lineJoin !== this.lineJoin &&
            (ary[++i] = "lJ\t" + (this._lineJoin = this.lineJoin));

        this._miterLimit !== this.miterLimit &&
            (ary[++i] = "mL\t" + (this._miterLimit = this.miterLimit));
    }

    if (bits & 0x4) {
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

    if (bits & 0x8) {
        if (this._font !== this.font) {
            this._font = this.font;

            font = uu.font.parse(this.font, this.canvas);
            ary[++i] = "fo\t" + font.size + "\t" +
                                font.style + "\t" +
                                font.weight + "\t" +
                                font.variant + "\t" +
                                font.family;
        }
        this._textAlign !== this.textAlign &&
            (ary[++i] = "tA\t" + (this._textAlign = this.textAlign));
        this._textBaseline !== this.textBaseline &&
            (ary[++i] = "tB\t" + (this._textBaseline = this.textBaseline));
    }
}

// inner -
function send(fg) { // @param String: fragment, "{COMMAND}\t{ARG1}\t..."
    if (fg) {
        this._stock.push(fg);
    }
    if (!this._lockState && this._readyState) {
        if (this._readyState === 1) {
            if (this._view) {
                // [SYNC] send "init" command. init(width, heigth, xFlyweight)
                this._view.CallFunction(send._prefix +
                    "in\t" + this.canvas.width + "\t" + this.canvas.height +
                    "\t" + this.xFlyweight +
                    send._suffix);
                this._readyState = 2;

                // [SYNC][FIX] http://twitter.com/uupaa/status/9837157309
                // at first
                this._view.CallFunction(send._prefix +
                    this._stock.join("\t") +
                    send._suffix);
            }
        }
        if (this._readyState === 2) {
            var ctx = this;

            // <param name="flashVars" param="i={msgid}&c={cmd}" />
            if (!ctx._tmid) {
                ctx._tmid = setTimeout(function() {
                    if (ctx._tmid && ctx._stock.length) {
                        var cmd = "i=" + ctx._msgid + "&c=";

                        // http://twitter.com/uupaa/status/9182387840
                        // http://twitter.com/uupaa/status/9195030504
                        // http://twitter.com/uupaa/status/9195279662
                        // http://twitter.com/uupaa/status/9196237383
                        // http://twitter.com/uupaa/status/9196368732
                        cmd += ctx._stock.join("\t"); // [!]

                        ctx._view.flashVars = cmd;
                        ctx._stock = []; // clear
                        ++ctx._msgid > 9 && (ctx._msgid = 1);
                        ctx._tmid = clearTimeout(ctx._tmid);
                    }
                }, 0);
            }
        }
    }
}
send._prefix = '<invoke name="send" returntype="javascript"><arguments><string>';
send._suffix = '</string></arguments></invoke>';

})(window, document, uu);

//}}}!mb

