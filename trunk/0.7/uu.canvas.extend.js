
// === extend CanvasRenderingContext2D ===
// depend: uu.js, uu.canvas.js
uu.agein || (function(win, doc, uu, CRC2D) {

//{mb === extend text and shadow api ===
if (uu.opera && uu.ver.ua >= 9.5 && uu.ver.ua < 10.5) {

  // wrapper
  CRC2D.prototype._save    = CRC2D.prototype.save;
  CRC2D.prototype._restore = CRC2D.prototype.restore;

  uu.mix(CRC2D.prototype, {
    _shadow:              ["transparent", 0, 0, 0],
    _stack:               [],
    font:                 "10px sans-serif",
    textAlign:            "start",
    textBaseline:         "top", // spec: "alphabetic"
    xMissColor:           "black",
    xTextMarginTop:       1.3,
    xShadowOpacityFrom:   0.01,  // compat Silverlight, VML
    xShadowOpacityDelta:  0.05,  // compat Silverlight, VML

    // CanvasRenderingContext2D.prototype.save
    save: function() {
      this._stack.push([this.font,
                        this.textAlign,
                        this.textBaseline,
                        this._shadow.concat()]);
      this._save();
    },

    // CanvasRenderingContext2D.prototype.restore
    restore: function() {
      this._restore();
      if (this._stack.length) {
        var last = this._stack.pop();

        this.font = last[0];
        this.textAlign = last[1];
        this.textBaseline = last[2];
        this._shadow = last[3].concat();
      }
    },

    // CanvasRenderingContext2D.prototype.fillText
    fillText: function(text, x, y, maxWidth, wire) {
      fillTextSVG(this, text, x, y, maxWidth, wire);
    },

    // CanvasRenderingContext2D.prototype.strokeText
    strokeText: function(text, x, y, maxWidth) {
      fillTextSVG(this, text, x, y, maxWidth, 1);
    },

    // CanvasRenderingContext2D.prototype.measureText
    measureText: function(text) {
      var metric = uu.font.metric(text, this.font);

      // new TextMetrics(metric.w, metric.h);
      return { width: metric.w, height: metric.h }; // [Opera10.50][FIX]
    }
  });
}

function fillTextSVG(ctx, text, x, y, maxWidth, wire) {
  function _newsvg(tag) { // uu.svg copy
    return doc.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  function filter(svg, sx, sy, sblur, scolor) {
    var e = [];

    svg.appendChild(e[0] = _newsvg("defs"));
      e[0].appendChild(e[1] = _newsvg("filter"));
        e[1].appendChild(e[2] = _newsvg("feGaussianBlur"));
        e[1].appendChild(e[3] = _newsvg("feOffset"));
        e[1].appendChild(e[4] = _newsvg("feFlood"));
        e[1].appendChild(e[5] = _newsvg("feComposite"));
        e[1].appendChild(e[6] = _newsvg("feMerge"));
          e[6].appendChild(e[7] = _newsvg("feMergeNode"));
          e[6].appendChild(e[8] = _newsvg("feMergeNode"));

    e[1].setAttribute("id",           "dropshadow");
    e[1].setAttribute("filterUnits",  "userSpaceOnUse");
    e[2].setAttribute("in",           "SourceAlpha");
    e[2].setAttribute("stdDeviation", (sblur < 8) ? sblur * 0.5
                                                  : Math.sqrt(sblur * 2));
    e[3].setAttribute("dx",           sx);
    e[3].setAttribute("dy",           sy);
    e[3].setAttribute("result",       "offsetblur");
    e[4].setAttribute("flood-color",  scolor.hex);
    e[4].setAttribute("flood-opacity",scolor.a);
    e[5].setAttribute("in2",          "offsetblur");
    e[5].setAttribute("operator",     "in");
    e[8].setAttribute("in",           "SourceGraphic");
  }
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

  if (!ctx._ltr) { // cache text-direction
    ctx._ltr = win.getComputedStyle(ctx.canvas, null).direction === "ltr";
  }
  var style   = wire ? ctx.strokeStyle : ctx.fillStyle,
      types   = (typeof style === "string") ? 0 : style._type,
      align   = ctx.textAlign,
      ltr     = ctx._ltr,
      font    = uu.font.parse(ctx.font, ctx.canvas),
      svg     = _newsvg("svg"),
      txt     = _newsvg("text"),
      scolor  = uu.color(ctx.shadowColor),
      metric  = uu.font.metric(text, ctx.font),
      offx    = 0, // offset x
      offy    = 0, // offset y
      margin  = 50;

  switch (align) {
  case "left":   align = "start"; break;
  case "center": align = "middle"; break;
  case "right":  align = "end"; break;
  case "start":  align = ltr ? "start" : "end"; break;
  case "end":    align = ltr ? "end"   : "start";
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

  if (scolor.a) {
    filter(svg, ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, scolor);
    txt.setAttribute("filter", "url(#dropshadow)");
  }
  txt.setAttribute("x",            offx + margin);
  txt.setAttribute("y",            offy + margin + offy * 0.41666); // offy / 2.4
  txt.setAttribute("fill",         types ? ctx.xMissColor : style);
  txt.setAttribute("text-anchor",  align);
  txt.setAttribute("font-style",   font.style);
  txt.setAttribute("font-variant", font.variant);
  txt.setAttribute("font-size",    font.size + "px");
  txt.setAttribute("font-weight",  font.weight);
  txt.setAttribute("font-family",  font.family);

  if (uu.ver.ua < 10) { // [Opera9.5][Opera9.6][FIX] font detect bug
    if (!txt.getAttribute("font-family").replace(/[\"\']/g, "")) {
      return;
    }
  }
  svg.appendChild(txt);
  txt.appendChild(doc.createTextNode(text));

  if (scolor.a) { // [OPTIMIZED] text-shadow optimization
    doc.body.appendChild(svg);
  }

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
//  try {
      ctx.drawImage(svg, x - margin - offx, y - margin);
//  } catch(err) {}
  ctx.restore();

  if (scolor.a) { // [OPTIMIZED] text-shadow optimization
    doc.body.removeChild(svg);
  }
}
//}mb

// === extend lock, unlock ===
if (CRC2D.prototype) {
  CRC2D.prototype.lock = function(clear) { // @param Boolean: clear screen
    clear && this.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  CRC2D.prototype.unlock = uunop;
}

})(window, document, uu, window["CanvasRenderingContext2D"] || 0);

