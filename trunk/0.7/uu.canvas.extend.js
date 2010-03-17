
// === extend CanvasRenderingContext2D ===
// depend: uu
uu.agein || (function(win, doc, uu) {

var _CanvasPrototype;

if (win["CanvasRenderingContext2D"]) {
    _CanvasPrototype = win.CanvasRenderingContext2D.prototype;
}

//{{{!mb

var _extendOpera = uu.opera && uu.ver.browser >= 9.5 && uu.ver.browser < 10.5,
    _extendGecko = uu.gecko && uu.ver.render === 1.9;

// === extend text and shadow api ===
if (_extendOpera || _extendGecko) {

    // wrapper
    _CanvasPrototype._save    = _CanvasPrototype.save;
    _CanvasPrototype._restore = _CanvasPrototype.restore;

    uu.mix(_CanvasPrototype, {
        _shadow:        ["transparent", 0, 0, 0], // for Firefox3.0
        _stack:         [],
        font:           "10px sans-serif",
        textAlign:      "start",
        textBaseline:   "top",          // spec: "alphabetic"
        xTextMarginTop: 1.3,
        save:           save,           // [MODIFY]
        restore:        restore,        // [MODIFY]
        fillText:       fillText,       // [EXTEND]
        strokeText:     strokeText,     // [EXTEND]
        measureText:    measureText     // [EXTEND]
    });

    if (_extendGecko) {
        // shadow accesser
        _CanvasPrototype.__defineSetter__("shadowColor",    function(color) {
            this._shadow[0] = color;
        });
        _CanvasPrototype.__defineSetter__("shadowOffsetX",  function(x) {
            this._shadow[1] = x;
        });
        _CanvasPrototype.__defineSetter__("shadowOffsetY",  function(y) {
            this._shadow[2] = y;
        });
        _CanvasPrototype.__defineSetter__("shadowBlur",     function(blur) {
            this._shadow[3] = blur;
        });
        _CanvasPrototype.__defineGetter__("shadowColor",    function() {
            return this._shadow[0];
        });
        _CanvasPrototype.__defineGetter__("shadowOffsetX",  function() {
            return this._shadow[1];
        });
        _CanvasPrototype.__defineGetter__("shadowOffsetY",  function() {
            return this._shadow[2];
        });
        _CanvasPrototype.__defineGetter__("shadowBlur",     function() {
            return this._shadow[3];
        });
    }
}

// CanvasRenderingContext2D.prototype.save
function save() {
    this._stack.push([this.font,
                      this.textAlign,
                      this.textBaseline,
                      this._shadow.concat()]);
    this._save();
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._restore();
    if (this._stack.length) {
        var last = this._stack.pop();

        this.font = last[0];
        this.textAlign = last[1];
        this.textBaseline = last[2];
        this._shadow = last[3].concat();
    }
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    _strokeText(this, text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth) {
    _strokeText(this, text, x, y, maxWidth, 0);
}

// CanvasRenderingContext2D.prototype.measureText
function measureText(text) {
    var metric = uu.font.metric(this.font, text);

    return { width: metric.w, height: metric.h };
}

// inner -
function _newsvg(tag) {
    return doc.createElementNS("http://www.w3.org/2000/svg", tag);
}

// inner -
function _buildShadow(svg, shadowOffsetX, shadowOffsetY,
                           shadowBlur, shadowColor) {
    var e = [],
        blur = shadowBlur < 8 ? shadowBlur * 0.5
                              : Math.sqrt(shadowBlur * 2);

    //  [0] <svg:defs>
    //  [1]     <svg:filter id="dropshadow" filterUnits="userSpaceOnUse">
    //  [2]         <svg:feGaussianBlur in="SourceAlpha" stdDeviation="?" />
    //  [3]         <svg:feOffset dx="?" dy="?" result="offsetblur" />
    //  [4]         <svg:feFlood flood-color="?" flood-opacity="?" />
    //  [5]         <svg:feComposite in2="offsetblur" operator="in" />
    //  [6]         <svg:feMerge>
    //  [7]             <svg:feMergeNode />
    //  [8]             <svg:feMergeNode in="SourceGraphic" />
    //          </svg:filter>
    //      </svg:defs>

    svg.appendChild(e[0] = _newsvg("defs"));
      e[0].appendChild(e[1] = _newsvg("filter"));
        e[1].appendChild(e[2] = _newsvg("feGaussianBlur"));
        e[1].appendChild(e[3] = _newsvg("feOffset"));
        e[1].appendChild(e[4] = _newsvg("feFlood"));
        e[1].appendChild(e[5] = _newsvg("feComposite"));
        e[1].appendChild(e[6] = _newsvg("feMerge"));
          e[6].appendChild(e[7] = _newsvg("feMergeNode"));
          e[6].appendChild(e[8] = _newsvg("feMergeNode"));

    e[1].setAttribute("id",             "dropshadow");
    e[1].setAttribute("filterUnits",    "userSpaceOnUse");
    e[2].setAttribute("in",             "SourceAlpha");
    e[2].setAttribute("stdDeviation",   blur);
    e[3].setAttribute("dx",             shadowOffsetX);
    e[3].setAttribute("dy",             shadowOffsetY);
    e[3].setAttribute("result",         "offsetblur");
    e[4].setAttribute("flood-color",    shadowColor.hex);
    e[4].setAttribute("flood-opacity",  shadowColor.a);
    e[5].setAttribute("in2",            "offsetblur");
    e[5].setAttribute("operator",       "in");
    e[8].setAttribute("in",             "SourceGraphic");
}

// inner - Text render
function _strokeText(ctx, text, x, y, maxWidth, fill) {
    var style = fill ? ctx.fillStyle : ctx.strokeStyle;

    if (typeof style !== "string") {
        return;
    }

    // detect and cache text-direction
    if (!ctx._ltr) {
        ctx._ltr = win.getComputedStyle(ctx.canvas, null).direction === "ltr";
    }
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    if (_extendOpera) {
        _strokeTextOpera(ctx, text, x, y, maxWidth, fill);
    } else if (_extendGecko) {
        _strokeTextGecko(ctx, text, x, y, maxWidth, fill);
    }
}

// inner - Text Render for Opera9.5~10.10
function _strokeTextOpera(ctx, text, x, y, maxWidth, fill) {
    var align   = ctx.textAlign,
        metric  = uu.font.metric(ctx.font, text),
        font    = uu.font.parse(ctx.font, ctx.canvas),
        shadowColor = uu.color(ctx.shadowColor),
        shadow  = shadowColor.a && ctx.shadowBlur,
        svg     = _newsvg("svg"),
        txt     = _newsvg("text"),
        offx    = 0, // offset x
        offy    = 0, // offset y
        margin  = 50,
        cage;

    if (!ctx._cage) {
        cage = uue();
        cage.style = "display:none";
        ctx._cage = doc.body.appendChild(cage);
    }

    switch (align) {
    case "left":   align = "start"; break;
    case "center": align = "middle"; break;
    case "right":  align = "end"; break;
    case "start":  align = ctx._ltr ? "start" : "end"; break;
    case "end":    align = ctx._ltr ? "end"   : "start";
    }
    switch (align) {
    case "middle": offx = metric.w * 0.5; break;
    case "end":    offx = metric.w;
    }

    if (ctx.textBaseline === "top") {
        // text margin-top fine tuning
        offy = font.size /
            (uu.font.SCALE[font.rawfamily.split(",")[0].toUpperCase()] ||
             ctx.xTextMarginTop);
    }
    svg.setAttribute("width",  metric.w + margin * 2);
    svg.setAttribute("height", metric.h + margin * 2);

    if (shadow) {
        _buildShadow(svg, ctx.shadowOffsetX, ctx.shadowOffsetY,
                          ctx.shadowBlur, shadowColor);
        txt.setAttribute("filter", "url(#dropshadow)");
    }

    txt.setAttribute("x",            offx + margin);
    txt.setAttribute("y",            offy + margin + offy * 0.41666); // offy / 2.4
    txt.setAttribute("fill",         fill ? ctx.fillStyle : ctx.strokeStyle);
    txt.setAttribute("text-anchor",  align);
    txt.setAttribute("font-style",   font.style);
    txt.setAttribute("font-variant", font.variant);
    txt.setAttribute("font-size",    font.size + "px");
    txt.setAttribute("font-weight",  font.weight);
    txt.setAttribute("font-family",  font.family);

    if (uu.ver.browser < 10) { // [Opera9.5][Opera9.6][FIX] font detect bug
        if (!txt.getAttribute("font-family").replace(/[\"\']/g, "")) {
            return;
        }
    }
    svg.appendChild(txt);
    txt.appendChild(doc.createTextNode(text));

    if (shadow) { // [OPTIMIZED] text-shadow optimization
        ctx._cage.appendChild(svg);
    }

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(svg, x - margin - offx, y - margin);
    ctx.restore();

    if (shadow) { // [OPTIMIZED] text-shadow optimization
        ctx._cage.removeChild(svg);
    }
}

// inner - Text render for Firefox3.0
function _strokeTextGecko(ctx, text, x, y, maxWidth, fill) {
    var align   = ctx.textAlign,
        metric  = uu.font.metric(ctx.font, text),
        shadowColor = uu.color(ctx.shadowColor),
        shadow  = shadowColor.a && ctx.shadowBlur,
        offX    = 0,
        offY    = (metric.h + metric.h * 0.5) * 0.5; // emulate textBaseline="top"

    switch (align) {
    case "start":   align = ctx._ltr ? "left"  : "right"; break;
    case "end":     align = ctx._ltr ? "right" : "left";
    }
    switch (align) {
    case "center":  offX = metric.w * 0.5; break;
    case "right":   offX = metric.w;
    }

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.mozTextStyle = ctx.font;
    ctx.translate(x - offX, y + offY);

    if (!fill) {
        ctx.fillStyle = ctx.strokeStyle;
    }

    if (shadow) {
        ctx.save();
        ctx.translate(ctx.shadowOffsetX + 1,
                      ctx.shadowOffsetY + 1);
        ctx.globalAlpha = ctx.globalAlpha / Math.sqrt(ctx.shadowBlur); // * 0.5;
        ctx.fillStyle = shadowColor.hex;
        ctx.mozDrawText(text);
        ctx.restore();
    }

    ctx.mozDrawText(text);
    // http://d.hatena.ne.jp/uupaa/20090506/1241572019
    ctx.fillRect(0,0,0,0); // force redraw(Firefox3.0 bug)
    ctx.restore();
}

//}}}!mb

// === extend functions and properties ===
if (_CanvasPrototype) {
    // --- function ---
    _CanvasPrototype.lock   = lock;     // [EXTEND]
    _CanvasPrototype.clear  = clear;    // [EXTEND]
    _CanvasPrototype.unlock = uunop;    // [EXTEND]
    _CanvasPrototype.drawCircle = drawCircle; // [EXTEND]
    _CanvasPrototype.drawRoundRect = drawRoundRect; // [EXTEND]
    // --- property ---
    _CanvasPrototype.xBackend = "Canvas"; // [EXTEND]
}

// CanvasRenderingContext2D.prototype.lock
function lock(clear) { // @param Boolean: clear screen
    clear && this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

// CanvasRenderingContext2D.prototype.drawCircle
function drawCircle(x,           // @param Number:
                    y,           // @param Number:
                    raduis,      // @param Number: radius
                    fillColor,   // @param ColorHash(= void 0): fillColor
                    strokeColor, // @param ColorHash(= void 0): strokeColor
                    lineWidth) { // @param Number(= 1): stroke lineWidth
    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth;

        this.save();
        if (fillColor) {
            this.fillStyle = fillColor.rgba;
        }
        if (strokeColor && lw) {
            this.strokeStyle = strokeColor.rgba;
            this.lineWidth = lw;
        }
        this.beginPath();
        this.arc(x, y, raduis, 0, 2 * Math.PI, true);
        this.closePath();
        if (fillColor) {
            this.fill();
        }
        if (strokeColor && lw) {
            this.stroke();
        }
        this.restore();
    }
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
    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            w = width, h = height,
            r0 = radius[0], r1 = radius[1], r2 = radius[2], r3 = radius[3],
            w2 = (width  / 2) | 0, h2 = (height / 2) | 0;

        r0 < 0 && (r0 = 0);
        r1 < 0 && (r1 = 0);
        r2 < 0 && (r2 = 0);
        r3 < 0 && (r3 = 0);
        (r0 >= w2 || r0 >= h2) && (r0 = Math.min(w2, h2) - 2);
        (r1 >= w2 || r1 >= h2) && (r1 = Math.min(w2, h2) - 2);
        (r2 >= w2 || r2 >= h2) && (r2 = Math.min(w2, h2) - 2);
        (r3 >= w2 || r3 >= h2) && (r3 = Math.min(w2, h2) - 2);

        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);

        if (fillColor) {
            this.fillStyle = fillColor.rgba;
        }
        if (strokeColor && lw) {
            this.strokeStyle = strokeColor.rgba;
            this.lineWidth = lw;
        }

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

        if (fillColor) {
            this.fill();
        }
        if (strokeColor && lw) {
            this.stroke();
        }
        this.restore();
    }
}

})(window, document, uu);

