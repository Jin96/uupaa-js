
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
    sendProp:               sendProp,       // [EXTEND]
    setTransform:           setTransform,
    stroke:                 stroke,
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
function build(node) { // @param Node: <canvas>
                       // @return Node:
    // CanvasRenderingContext.getContext
    node.getContext = function() {
        return node.uuctx2d;
    };
    node.uuctx2d = new uu.canvas.FL2D(node);

    var id = "externalcanvas" + uu.guid();

    // wait for response from flash
    uu.flash.dmz[id] = flashCanvasReadyCallback;

    function flashCanvasReadyCallback() {
        var ctx = node.uuctx2d;

        ctx._readyState = 1; // 1: draw ready
        uu.flash.dmz[id] = null; // free
    };

    // create swf <object>
    node.innerHTML = uu.fmt(
        '<object id="%s" width="%s" height="%s" classid="%s">' +
            '<param name="allowScriptAccess" value="always" />' +
            '<param name="flashVars" value="" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="movie" value="%s" /></object>',
        id, node.width, node.height,
        "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
        uu.config.imgdir + "uu.canvas.swf");

    node.uuctx2d._view = uu.id(id); // find swf <object>

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
    this._tmid          = 0;    // timer id
    this._msgid         = 1;    // message id(1~9)
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
    this.send("ar\t" + x + "\t" + y + "\t" +
                       radius + "\t" + startAngle + "\t" +
                       endAngle + "\t" + anticlockwise);
}

// CanvasRenderingContext2D.prototype.arcTo -> NOT IMPL


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

// CanvasRenderingContext2D.prototype.createImageData -> NOT IMPL

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) {
    function CanvasGradient(x0, y0, x1, y1) {
        this.linear = 1;
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
    this.sendProp();
    if (a3 === void 0) {
        this.send("d3\t" + a1 + "\t" + a2);
    } else if (a5 === void 0) {
        this.send("d5\t" + a1 + "\t" + a2 + "\t" + a3 + "\t" + a4);
    } else {
        this.send("d9\t" + a1 + "\t" + a2 + "\t" + a3 + "\t" + a4 + "\t" +
                           a5 + "\t" + a6 + "\t" + a7 + "\t" + a8);
    }
}

// CanvasRenderingContext2D.prototype.fill
function fill() {
    this.sendProp();
    this.send("fi");
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.sendProp();
    this.send("fR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.sendProp();
    this.send("fT\t" + text + "\t" + (x || 0) + "\t" +
                                     (y || 0) + "\t" + maxWidth || 0);
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    this.send("lT\t" + x + "\t" + y);
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
    this.send("mT\t" + x + "\t" + y);
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
    this.sendProp();
    this.send("re\t" + x + "\t" + y + "\t" + w + "\t" + h);
}

// CanvasRenderingContext2D.prototype.resize
function resize(width,    // @param Number(= void 0): width
                height) { // @param Number(= void 0): height
    var state = this._readyState;

    this.initSurface()

    if (width !== void 0) {
        this.canvas.style.pixelWidth = width;
    }
    if (height !== void 0) {
        this.canvas.style.pixelHeight = height;
    }
    this._readyState = state;
    this.send("rz\t" + width + "\t" + height);
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stack.length && _copyprop(this, this._stack.pop());
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this.send("ro\t" + angle);
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
    this.sendProp();
    this.send("st");
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.sendProp();
    this.send("sR\t" + x + "\t" + y + "\t" + w + "\t" + h);
}
// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth) {
    this.sendProp();
    this.send("sT\t" + text + "\t" + (x || 0) + "\t" + (y || 0) + "\t" + maxWidth || 0);
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
function sendProp() {
    var ary = this._stock, i = ary.length - 1;

    // globalAlpha
    if (this.globalAlpha !== this._globalAlpha) {
        ary[++i] = "gA\t" + (this._globalAlpha = this.globalAlpha);
    }

    // globalCompositeOperation
    if (this.globalCompositeOperation !== this._mix) {
        ary[++i] = "gC\t" + (this._mix = this.globalCompositeOperation);
    }

    // strokeStyle
    if (this.strokeStyle !== this._strokeStyle) {
        if (typeof this.strokeStyle === "string") {
            this.__strokeStyle = uu.color(this._strokeStyle = this.strokeStyle);
            ary[++i] = "s0\t" + this.__strokeStyle.num + "\t" + this.__strokeStyle.a;
        } else if (this.strokeStyle.linear) {

            ary[++i] = "s1\t" + this.__strokeStyle.num + "\t" + this.__strokeStyle.a;

        }
    }

    // fillStyle
    if (this.fillStyle !== this._fillStyle) {
        if (typeof this.fillStyle === "string") {
            this.__fillStyle = uu.color(this._fillStyle = this.fillStyle);
            ary[++i] = "f0\t" + this.__fillStyle.num + "\t" + this.__fillStyle.a;
        }
    }

    // lineWidth
    if (this.lineWidth !== this._lineWidth) {
        ary[++i] = "lW\t" + (this._lineWidth = this.lineWidth);
    }

    // lineCap
    if (this.lineCap !== this._lineCap) {
        ary[++i] = "lC\t" + (this._lineCap = this.lineCap);
    }

    // lineJoin
    if (this.lineJoin !== this._lineJoin) {
        ary[++i] = "lJ\t" + (this._lineJoin = this.lineJoin);
    }

    // miterLimit
    if (this.miterLimit !== this._miterLimit) {
        ary[++i] = "mL\t" + (this._miterLimit = this.miterLimit);
    }

    // shadowBlur
    if (this.shadowBlur !== this._shadowBlur) {
        ary[++i] = "sB\t" + (this._shadowBlur = this.shadowBlur);
    }

    // shadowColor
    if (this.shadowColor !== this._shadowColor) {
        this.__shadowColor = uu.color(this._fillStyle = this.shadowColor);
        ary[++i] = "sC\t" + this.__shadowColor.num + "\t" + this.__shadowColor.a;
    }

    // shadowOffsetX
    if (this.shadowOffsetX !== this._shadowOffsetX) {
        ary[++i] = "sX\t" + (this._shadowOffsetX = this.shadowOffsetX);
    }

    // shadowOffsetY
    if (this.shadowOffsetY !== this._shadowOffsetY) {
        ary[++i] = "sY\t" + (this._shadowOffsetY = this.shadowOffsetY);
    }

    // font
    if (this.font !== this._font) {
        ary[++i] = "fo\t" + (this._font = this.font);
    }

    // textAlign
    if (this.textAlign !== this._textAlign) {
        ary[++i] = "tA\t" + (this._textAlign = this.textAlign);
    }

    // textBaseline
    if (this.textBaseline !== this._textBaseline) {
        ary[++i] = "tB\t" + (this._textBaseline = this.textBaseline);
    }
}

/*
function send(fg) { // @param String: fragment, "{COMMAND}\t{ARG1}\t..."
    if (fg) {
        this._stock.push(fg);
    }
    if (!this._lockState && this._readyState) {
        this._view.CallFunction(send._prefix + this._stock.join("\t") +
                                send._suffix);
        this._stock = []; // clear
    }
}
send._prefix = '<invoke name="send" returntype="javascript"><arguments><string>';
send._suffix = '</string></arguments></invoke>';
 */
function send(fg) { // @param String: fragment, "{COMMAND}\t{ARG1}\t..."
    if (fg) {
        this._stock.push(fg);
    }
    if (!this._lockState && this._readyState) {
        if (this._readyState === 1) {
            if (this._view) {
                // send "init" command
                this._view.CallFunction(send._prefix +
                    "in\t" + this.canvas.width + "\t" + this.canvas.height +
                    send._suffix);
                this._readyState = 2;
            }
        }
        if (this._readyState === 2) {
            var ctx = this;

            // <param name="flashVars" param="t={time}&c={cmd}" />
            if (!ctx._tmid) {
                ctx._tmid = setTimeout(function() {
                    if (ctx._tmid && ctx._stock.length) {
                        ctx._view.flashVars = "i=" + ++ctx._msgid +
                                             "&c=" + ctx._stock.join("\t");
                        ctx._stock = []; // clear
                        ctx._msgid > 9 && (ctx._msgid = 1);
                        ctx._tmid = clearTimeout();
                    }
                }, 0);
            }
        }
    }
}
send._prefix = '<invoke name="send" returntype="javascript"><arguments><string>';
send._suffix = '</string></arguments></invoke>';

/*
function _toXML(value) {
    var type = typeof(value);

    if (type == "string") {
        return "<string>" + _escXML(value) +
               "</string>";
    } else if (type == "undefined") {
        return "<undefined/>";
    } else if (type == "number") {
        return "<number>" + value + "</number>";
    } else if (value == null) {
        return "<null/>";
    } else if (type == "boolean") {
        return value ? "<true/>" : "<false/>";
    } else if (value instanceof Date) {
        return "<date>" + value.getTime() + "</date>";
    } else if (value instanceof Array) {
        return _ary2XML(value);
    } else if (type == "object") {
        return _obj2XML(value);
    } else {
        return "<null/>"; // ???
    }
}

function _escXML(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").
             replace(/>/g, "&gt;").replace(/"/g, "&quot;").
             replace(/'/g, "&apos;");
}

function _ary2XML(obj) {
    var s = "<array>";

    for (var i=0; i<obj.length; i++) {  // ←(3)
        s += "<property id=\"" + i + "\">" +
             _toXML(obj[i]) +   // ←(4)
             "</property>";
    }
    return s + "</array>";
}

function _obj2XML(obj) {
    var s = "<object>";

    for (var prop in obj) {
        s += "<property id=\"" + prop + "\">" +
             _toXML(obj[prop]) +
             "</property>";
    }
    return s + "</object>";
}
 */

})(window, document, uu);

