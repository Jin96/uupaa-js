
// === Canvas Extend ===
// depend: uu.js, uu.canvas.js
uu.waste || (function(win, doc, uu, _cstyle, CANVAS2D) {
var _impl         = uu.canvas.impl,
    _colorCache   = _impl.colorCache,
    _firefox3     = uu.gecko && uu.ver.re === 1.9, // Firefox3.0
    _PROTO        = CANVAS2D in win ? win[CANVAS2D].prototype : 0,
    _SHADOW_WIDTH = 4, // compat SL, VML
    _GLOBAL_ALPHA = "globalAlpha",
    _GLOBAL_COMPO = "globalCompositeOperation",
    _STROKE_STYLE = "strokeStyle",
    _FILL_STYLE   = "fillStyle",
    _SHADOW_OX    = "shadowOffsetX",
    _SHADOW_OY    = "shadowOffsetY",
    _SHADOW_BLUR  = "shadowBlur",
    _SHADOW_COLOR = "shadowColor",
    _SHADOWS      = [_SHADOW_COLOR, _SHADOW_OX, _SHADOW_OY, _SHADOW_BLUR],
    _FONT         = "font",
    _ALIGN        = "textAlign",
    _BASELINE     = "textBaseline",
    _REPOS        = uu.ary("visibility,display,opacity,zIndex,height,width");

// === extend text and shadow api ===
if (_firefox3 || (uu.opera && uu.ver.ua >= 9.5)) { // Firefox3, Opera9.5+
  // wrapper
  _PROTO._save = _PROTO.save;
  _PROTO._restore = _PROTO.restore;

  uu.mix(_PROTO, {
    _shadow:      ["transparent", 0, 0, 0],
    _stack:       [],
    font:         "10px sans-serif",
    textAlign:    "start",
    textBaseline: "top",    // spec: "alphabetic"
    xMissColor:           "#000",
    xTextMarginTop:       1.3,
    xShadowOpacityFrom:   0.01, // compat Silverlight, VML
    xShadowOpacityDelta:  0.05, // compat Silverlight, VML

    save: function() {
      this._stack.push([this[_FONT],
                        this[_ALIGN],
                        this[_BASELINE],
                        uu.mix([], this._shadow)]);
      this._save();
    },
    restore: function() {
      this._restore();
      if (this._stack.length) { // for Firefox3, Opera9.5+
        var last = this._stack.pop();
        this[_FONT] = last[0];
        this[_ALIGN] = last[1];
        this[_BASELINE] = last[2];
        this._shadow = last[3];
      }
    },
    fillText: function(text, x, y, maxWidth, wire) {
      (_firefox3 ? fillTextMoz : fillTextSVG)(this, text, x, y, maxWidth, wire);
    },
    strokeText: function(text, x, y, maxWidth) {
      this.fillText(text, x, y, maxWidth, 1);
    },
    measureText: function(text) {
      var metric = _impl.getTextMetric(text, this[_FONT]);
      return new win.TextMetrics(metric.w, metric.h);
    }
  });
}
// extend shadow accessor
if (_firefox3) {
  _PROTO.__defineSetter__(_SHADOWS[0], function(c) { this._shadow[0] = c; });
  _PROTO.__defineSetter__(_SHADOWS[1], function(x) { this._shadow[1] = x; });
  _PROTO.__defineSetter__(_SHADOWS[2], function(y) { this._shadow[2] = y; });
  _PROTO.__defineSetter__(_SHADOWS[3], function(b) { this._shadow[3] = b; });
  _PROTO.__defineGetter__(_SHADOWS[0], function() { return this._shadow[0]; });
  _PROTO.__defineGetter__(_SHADOWS[1], function() { return this._shadow[1]; });
  _PROTO.__defineGetter__(_SHADOWS[2], function() { return this._shadow[2]; });
  _PROTO.__defineGetter__(_SHADOWS[3], function() { return this._shadow[3]; });
}

if (uu.ver.chrome && uu.ver.ua <= 2) {
  // inner - strokeText() impl. for Google Chrome1, 2
  _PROTO.strokeText = function(text, x, y, maxWidth) {
    this.save();
    this[_FILL_STYLE] = this[_STROKE_STYLE];
    this.fillText(text, x, y, maxWidth);
    this.restore();
  }
}

// inner - fillText() impl. for Firefox3.0
function fillTextMoz(ctx, text, x, y, maxWidth, wire) {
  var align = ctx[_ALIGN], dir = "ltr",
      metric = _impl.getTextMetric(text, ctx[_FONT]),
      offX = 0, offY = 0,
      // for shadow
      si = 0, so = 0, sd = 0,
      sc = _colorCache[ctx._shadow[0]] ||
           _impl.parseColor(ctx._shadow[0]);

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = (_cstyle(ctx.canvas, null).direction === dir) ? "left" : "right";
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }
  offY = (metric.h + metric.h / 2) / 2; // emulate textBaseline="top"

  ctx.save();
  ctx[_GLOBAL_COMPO] = "source-over";
  ctx.mozTextStyle = ctx.font;
  ctx.translate(x - offX, y + offY);
  if (wire) {
    ctx[_FILL_STYLE] = ctx[_STROKE_STYLE];
  }

  if (sc[1]) {
    so = ctx.xShadowOpacityFrom;
    sd = ctx.xShadowOpacityDelta;
    ctx.save();
    ctx.translate(_SHADOW_WIDTH / 2 + ctx._shadow[1],
                  _SHADOW_WIDTH / 2 + ctx._shadow[2]);
    for (; si < _SHADOW_WIDTH; so += sd, ++si) {
      ctx.translate(-1, -1);
      ctx[_GLOBAL_ALPHA] = so.toFixed(2);
      ctx[_FILL_STYLE] = sc[0];
      ctx.mozDrawText(text);
    }
    ctx.restore();
  }
  ctx.mozDrawText(text);
  // http://d.hatena.ne.jp/uupaa/20090506
  ctx.fillRect(0, 0, 0, 0); // force redraw(Firefox3.0 bug)
  ctx.restore();
}

function fillTextSVG(ctx, text, x, y, maxWidth, wire) {
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

  function attr(elm, hash) {
    for (var i in hash) {
      elm.setAttribute(i, hash[i]);
    }
  }
  function _newsvg(tag) { // uu.svg copy
    return doc.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  function filter(svg, sx, sy, sb, sc) {
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
    attr(e[1], { id:             "dropshadow",
                 filterUnits:    "userSpaceOnUse" });
    attr(e[2], { "in":           "SourceAlpha",
                 stdDeviation:   (sb < 8) ? sb / 2 : Math.sqrt(sb * 2) });
    attr(e[3], { dx:             sx,
                 dy:             sy,
                 result:         "offsetblur" });
    attr(e[4], { "flood-color":   sc[0],
                 "flood-opacity": sc[1] });
    attr(e[5], { in2:            "offsetblur",
                 operator:       "in" });
    attr(e[8], { "in":           "SourceGraphic" });
  }
  var style = wire ? ctx[_STROKE_STYLE] : ctx[_FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      align = ctx[_ALIGN],
      dir   = _cstyle(ctx.canvas, null).direction === "ltr",
      font  = _impl.parseFont(ctx[_FONT], ctx.canvas),
      svg   = _newsvg("svg"),
      txt   = _newsvg("text"),
      sc    = _colorCache[ctx[_SHADOW_COLOR]] ||
              _impl.parseColor(ctx[_SHADOW_COLOR]),
      metric = _impl.getTextMetric(text, ctx[_FONT]),
      offset = { x: 0, y: 0 },
      margin = 100,
      validFontFamily;

  switch (align) {
  case "left":   align = "start"; break;
  case "center": align = "middle"; break;
  case "right":  align = "end"; break;
  case "start":  align = dir ? "start" : "end"; break;
  case "end":    align = dir ? "end"   : "start";
  }
  switch (align) {
  case "middle": offset.x = metric.w / 2; break;
  case "end":    offset.x = metric.w;
  }
  if (ctx[_BASELINE] === "top") {
    // text margin-top fine tuning
    offset.y = font.size /
        (_impl.FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
         ctx.xTextMarginTop);
  }
  attr(svg, { width: metric.w + margin, height: metric.h + margin });
  if (sc[1]) {
    filter(svg, ctx[_SHADOW_OX], ctx[_SHADOW_OY], ctx[_SHADOW_BLUR], sc);
    attr(txt, { filter: "url(#dropshadow)" });
  }
  attr(txt, { x:              0 + margin / 2 + offset.x,
              y:              offset.y + offset.y / 2.4 + margin / 2,
              fill:           types ? ctx.xMissColor : style,
              "text-anchor":  align,
              "font-style":   font.style,
              "font-variant": font.variant,
              "font-size":    font.size + "px",
              "font-weight":  font.weight,
              "font-family":  font.family });
  validFontFamily = txt.getAttribute("font-family");
  if (!validFontFamily.replace(/[\"\']/g, "")) {
    return; // Opera9.5, Opera9.6 bug
  }
  svg.appendChild(txt);
  txt.appendChild(doc.createTextNode(text));

  doc.body.appendChild(svg);
  ctx.save();
  ctx[_GLOBAL_COMPO] = "source-over";
  try {
    ctx.drawImage(svg, x - margin / 2 - offset.x, y - margin / 2);
  } catch(err) {}
  ctx.restore();
  doc.body.removeChild(svg);
}

// === Extend Text API for old WebKit ===
_impl.extendTextAPI = function(ctx) { // @param CanvasRenderingContext2D:
  ctx._save = ctx.save;
  ctx._stack = [];
  ctx._restore = ctx.restore;
  ctx._clearRect = ctx.clearRect;
  ctx.font = "10px sans-serif";
  ctx.textAlign = "start";
  ctx.textBaseline = "top"; // spec: "alphabetic"
  ctx.xMissColor = "#000";
  ctx.xTextMarginTop = 1.3;
  ctx.save = function() {
    this._stack.push([ctx[_FONT], ctx[_ALIGN], ctx[_BASELINE]]);
    this._save();
  };
  ctx.restore = function() {
    ctx._restore();
    if (ctx._stack.length) {
      var last = ctx._stack.pop();

      ctx[_FONT] = last[0];
      ctx[_ALIGN] = last[1];
      ctx[_BASELINE] = last[2];
    }
  };
  ctx.clearRect = function(x, y, w, h) {
    if (ctx.canvas.uutextlayer && // has text node
        !x && !y && w == ctx.canvas.width
                 && h == ctx.canvas.height) { // clear all
      removeTextWebKit(ctx);
    }
    ctx._clearRect(x, y, w, h);
  };
  ctx.fillText = fillTextWebKit;
  ctx.strokeText = function(text, x, y, maxWidth) {
    ctx.fillText(text, x, y, maxWidth, 1);
  };
  ctx.measureText = function(text) {
    var metric = _impl.getTextMetric(text, ctx[_FONT]);

    return new win.TextMetrics(metric.w, metric.h);
  }
};

// inner - remove all text node
function removeTextWebKit(ctx) {
  uu.ary.each(ctx.canvas.uutextlayer, function(v) { // remove all text node
    uu.node.remove(v);
  });
  ctx.canvas.uutextlayer = [];
}

// inner - fillText() impl. for Safari3.1, 3.2
function fillTextWebKit(text, x, y, maxWidth, wire) {
  function restyle() {
    var i = 0, iz = _REPOS.length, v, w, cv = ctx.canvas,
        rs = cv.uutextroot.style, cs = cv.style;

    for (; i < iz; ++i) {
      w = _REPOS[i];
      v = cs[w];
      (v !== rs[w]) && (rs[w] = v);
    }
    ((v = cv.offsetLeft) !== parseInt(rs.left)) && (rs.left = v + "px");
    ((v = cv.offsetTop)  !== parseInt(rs.top))  && (rs.top  = v + "px");
  }
  function onDOMNodeRemoved() {
    removeTextWebKit(ctx);
  }
  var ctx = this, canvas = ctx.canvas,
      root = canvas.uutextroot, sc = ctx[_SHADOW_COLOR],
      cs = _cstyle(canvas, null), node, ns, name, hash,
      metric = _impl.getTextMetric(text, ctx[_FONT]),
      offX = 0, align = ctx[_ALIGN], dir = "ltr";

  if (!root) { // first time
    //  <...>                 <- canvas.parentNode
    //    <canvas></canvas>   <- canvas
    //    <div>               <- canvas.uutextroot
    //      <div>text</div>   <- canvas.uutextlayer[0]
    //    </div>
    //  </...>
    root = canvas.parentNode.appendChild(doc.createElement("div"));
    uu.mix(root.style, { position: "absolute", overflow: "hidden" });
    // fix style
    hash = { visibility: cs.visibility,
             display:    cs.display,
             opacity:    cs.opacity,
             zIndex:     parseInt(cs.zIndex) || 0,
             height:     canvas.height     + "px",
             width:      canvas.width      + "px",
             left:       canvas.offsetLeft + "px",
             top:        canvas.offsetTop  + "px" };
    uu.mix(canvas.style, hash);
    uu.mix(root.style, hash); 
    // bond
    canvas.uutextroot = root;
    canvas.uutextlayer = [];
    restyle();
    // http://d.hatena.ne.jp/uupaa/20081127/1227726901
    uu.ev.attach(canvas, "DOMNodeRemoved", onDOMNodeRemoved);
    setInterval(restyle, 1200); // delay 1.2sec
  }
  switch (align) {
  case "end":   dir = "rtl"; // break;
  case "start": align = (cs.direction === dir) ? "left" : "right";
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }
  node = root.appendChild(doc.createElement("div"));
  ns = node.style;
  ns.position = "absolute";
  ns.opacity = ctx[_GLOBAL_ALPHA];
  ns.height = parseInt(metric.h * 1.2) + "px";
  ns.width = parseInt(metric.w * 1.2) + "px"; // avoid word wrap
  ns.left = (x - offX) + "px";
  ns.top = y + "px";
  ns.font = ctx[_FONT];
  // text-shadow:
  sc = _colorCache[sc] || _impl.parseColor(sc);
  if (sc[1]) {
    ns.textShadow = [ctx[_SHADOWS[1]] + "px",
                     ctx[_SHADOWS[2]] + "px",
                     ctx[_SHADOWS[3]] + "px",
                     ctx[_SHADOWS[0]]].join(" ");
  }
  // strokeText or fillText
  name = wire ? _STROKE_STYLE : _FILL_STYLE;
  if (uu.isstr(ctx[name])) {
    ns.color = ctx[name];
    if (wire) {
      ns["-webkit-text-fill-color"]   = "transparent";
      ns["-webkit-text-stroke-color"] = ctx[name];
      ns["-webkit-text-stroke-width"] = "1px";
    }
  }
  node.textContent = text;
  canvas.uutextlayer.push(node);
}

// === extend clear, lock, unlock ===
_impl.extendLockAPI = function(ctx) { // @param CanvasRenderingContext2D:
  ctx.lock = function(clearScreen) {
    clearScreen && this.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  ctx.unlock = uuvain;
};

// --- initialize --
if (_PROTO) {
  _impl.extendLockAPI(_PROTO);
}

})(window, document, uu, window.getComputedStyle, "CanvasRenderingContext2D");

