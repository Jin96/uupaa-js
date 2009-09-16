// === uuMeta.canvas.extend ===
// depend: uuMeta, uuMeta.style.color, uuMeta.canvas
(function uuMetaCanvasExtendScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _impl = uuMeta.canvas.impl,
    _int = parseInt,
    _doc = document,
    _colorCache = _impl.colorCache,
    _CANVAS2D = "CanvasRenderingContext2D",
    _crc2d = (_CANVAS2D in window) ? window[_CANVAS2D].prototype : 0,
    _SHADOW_WIDTH     = 4,
    _GLOBAL_ALPHA     = "globalAlpha",
    _GLOBAL_COMPO     = "globalCompositeOperation",
    _STROKE_STYLE     = "strokeStyle",
    _FILL_STYLE       = "fillStyle",
    _SHADOW_OFFSET_X  = "shadowOffsetX",
    _SHADOW_OFFSET_Y  = "shadowOffsetY",
    _SHADOW_BLUR      = "shadowBlur",
    _SHADOW_COLOR     = "shadowColor",
    _SHADOWS          = [_SHADOW_COLOR,
                         _SHADOW_OFFSET_X,
                         _SHADOW_OFFSET_Y,
                         _SHADOW_BLUR],
    _FONT             = "font",
    _TEXT_ALIGN       = "textAlign",
    _TEXT_BASELINE    = "textBaseline",
    _HIT_PROPS2       = { width: 1, height: 1,
                          display: 2, visibility: 2, opacity: 2 };

// === Extend Test, Shadow API =============================
if (_crc2d &&
    ((_ua.gecko && _ua.rever <= 1.9) || // Firefox2-3
     (_ua.opera && _ua.uaver <= 10))) { // Opera9.2-10
                                        // exclude Chrome1, Safari3.x
  // wrapper
  _crc2d._save = _crc2d.save;
  _crc2d._restore = _crc2d.restore;
  _crc2d._clearRect = _crc2d.clearRect;

  _mm.mix(_crc2d, {
    _shadow:      ["transparent", 0, 0, 0],
    _stack:       [],
    font:         "10px sans-serif",
    textAlign:    "start",
    textBaseline: "top",    // spec: "alphabetic"
    xMissColor:           "#000",
    xTextMarginTop:       1.3,
    xAutoTextRender:      1, // 1 = auto;
    xShadowOpacityFrom:   0.01, // for Silverlight, VML
    xShadowOpacityDelta:  0.05, // for Silverlight, VML

    save: function() {
      this._stack.push([this[_FONT],
                        this[_TEXT_ALIGN],
                        this[_TEXT_BASELINE],
                        _mm.mix([], this._shadow)]);
      this._save();
    },
    restore: function() {
      this._restore();
      if (this._stack.length) { // for Opera9.5+, Firefox2, Firefox3
        var last = this._stack.pop();
        this[_FONT] = last[0];
        this[_TEXT_ALIGN] = last[1];
        this[_TEXT_BASELINE] = last[2];
        this._shadow = last[3];
      }
    },
    clearRect: function(x, y, w, h) {
      var fn = clearRectDOM;
      if (this.xAutoTextRender) {
        if (_ua.gecko && _ua.rever === 1.9) {
          fn = clearRectMoz;
        } else if (_ua.opera) {
          fn = clearRectSVG;
        }
      }
      fn(this, x, y, w, h);
    },
    fillText: function(text, x, y, maxWidth, wire) {
      var fn = fillTextDOM;
      if (this.xAutoTextRender) {
        if (_ua.gecko && _ua.rever === 1.9) {
          fn = fillTextMoz;
        } else if (_ua.opera) {
          fn = fillTextSVG;
        }
      }
      fn(this, text, x, y, maxWidth, wire);
    },
    strokeText: function(text, x, y, maxWidth) {
      this.fillText(text, x, y, maxWidth, 1);
    },
    measureText: function(text) {
      var metric = _impl.getTextMetric(text, this[_FONT]);
      return new TextMetrics(metric.w, metric.h);
    }
  });

  // Extend Shadow Accesser
  if (_ua.gecko && _ua.rever <= 1.9) { // Firefox2-3
    _crc2d.__defineSetter__(_SHADOWS[0], function(c) { this._shadow[0] = c; });
    _crc2d.__defineSetter__(_SHADOWS[1], function(x) { this._shadow[1] = x; });
    _crc2d.__defineSetter__(_SHADOWS[2], function(y) { this._shadow[2] = y; });
    _crc2d.__defineSetter__(_SHADOWS[3], function(b) { this._shadow[3] = b; });
    _crc2d.__defineGetter__(_SHADOWS[0], function() { return this._shadow[0]; });
    _crc2d.__defineGetter__(_SHADOWS[1], function() { return this._shadow[1]; });
    _crc2d.__defineGetter__(_SHADOWS[2], function() { return this._shadow[2]; });
    _crc2d.__defineGetter__(_SHADOWS[3], function() { return this._shadow[3]; });
  }
}

if (_crc2d &&
    (_ua.chrome && _ua.uaver === 2)) { // Chrome3 strokeText() implemented

  _crc2d.strokeText = function(text, x, y, maxWidth) {
    this.save();
    this[_FILL_STYLE] = this[_STROKE_STYLE];
    this.fillText(text, x, y, maxWidth);
    this.restore();
  }
}

function clearTextView(me) {
  var i = 1, iz = me.canvas._canvasTextView.length;
  for (; i < iz; ++i) {
    me.canvas._canvasTextView[i].textContent = "";
  }
}

function clearRectMoz(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function clearRectDOM(me, x, y, w, h) {
  if (me.canvas._canvasTextView &&
      !x && !y && w == me.canvas.width && h == me.canvas.height) {
    clearTextView(me);
  }
  me._clearRect(x, y, w, h);
}

function clearRectSVG(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function fillTextMoz(me, text, x, y, maxWidth, wire) {
  var align = me[_TEXT_ALIGN], dir = "ltr",
      metric = _impl.getTextMetric(text, me[_FONT]),
      offX = 0, offY = 0,
      // for shadow
      si = 0, so = 0, sd = 0,
      sc = _colorCache[me._shadow[0]] ||
           _impl.parseColor(me._shadow[0]);

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = (getComputedStyle(me.canvas, null).direction === dir) ? "left"
                                                                  : "right";
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }
  offY = (metric.h + metric.h / 2) / 2; // emulate textBaseline="top"

  me.save();
  me[_GLOBAL_COMPO] = "source-over";
  me.mozTextStyle = me.font;
  me.translate(x - offX, y + offY);
  if (wire) {
    me[_FILL_STYLE] = me[_STROKE_STYLE];
  }

  if (sc[1]) {
    so = Math.max(me.xShadowOpacityFrom + 0.9, 1);
    sd = me.xShadowOpacityDelta;

    me.save();
    me.translate(_SHADOW_WIDTH / 2 + me._shadow[1],
                 _SHADOW_WIDTH / 2 + me._shadow[2]);
    for (; si < _SHADOW_WIDTH; so += sd, ++si) {
      me.translate(-1, -1);
      me[_GLOBAL_ALPHA] = so.toFixed(2);
      me[_FILL_STYLE] = sc[0];
      me.mozDrawText(text);
    }
    me.restore();
  }

  me.mozDrawText(text);
  // http://d.hatena.ne.jp/uupaa/20090506
  me.fillRect(0,0,0,0); // force redraw(Firefox3.0 bug)
  me.restore();
}

function fillTextDOM(me, text, x, y, maxWidth, wire) {
  var canvas = me.canvas, // HTMLCanvasElement
      view, layer, sc, name,
      offX = 0, metric, align = me[_TEXT_ALIGN], dir = "ltr";

  if (canvas._canvasLayerView) {
    view = canvas._canvasLayerView._view;
    canvas._canvasTextView = [view];
  } else if (!canvas._canvasTextView) {
//  view = canvas.parentNode.appendChild(_doc.createElement("div"));
    view = _doc.body.appendChild(_doc.createElement("div"));
    view.style.position = "absolute";
    view.style.overflow = "hidden";
    canvas._canvasTextView = [view];

    // reposition
    function repos(attr) {
      function getPos(elm) {
        var x = 0, y = 0, r;
        if (elm.getBoundingClientRect) {
          r = elm.getBoundingClientRect();
          x = r.left + pageXOffset;
          y = r.top  + pageYOffset;
        } else {
          while (elm) {
            x += elm.offsetLeft || 0;
            y += elm.offsetTop  || 0;
            elm = elm.offsetParent;
          }
        }
        return { x: x, y: y };
      }

      try {
        var rect, style = getComputedStyle(me.canvas, null);
        if (attr & 1) {
          rect = getPos(me.canvas);
        } else {
          rect = { x: _int(style.left), y: _int(style.top) };
        }
        _mm.mix(me.canvas._canvasTextView[0].style, {
//        zIndex: (_int(style.zIndex) || 0) + 1, // Fx2"auto" -> 1
          height: _int(canvas.height) + "px",
          width: _int(canvas.width) + "px",
          left: rect.x + "px",
          top: rect.y + "px",
          visibility: style.visibility,
          display: style.display,
          opacity: parseFloat(style.opacity)
        });
        if (!_ua.gecko) {
          _mm.mix(me.canvas._canvasTextView[0].style, {
            zIndex: (_int(style.zIndex) || 0) + 1
          });
        }
      } catch (err) {}
    }
    function onAttr(evt) {
      var attr = _HIT_PROPS2[evt.attrName] || 0;
      if (attr) {
        (attr & 1) && clearTextView(me); // clear
        repos(attr);
      }
    }
    repos(3);
    canvas.addEventListener("DOMAttrModified", onAttr, false);
    setInterval(function() { repos(3); }, 1000); // delay 1sec
  } else {
    view = canvas._canvasTextView[0];
  }
  // Firefox2: shadowColor is always null
  if (_ua.gecko) {
    sc = _colorCache[me._shadow[0]] ||
         _impl.parseColor(me._shadow[0]);
  } else {
    sc = _colorCache[me[_SHADOW_COLOR]] ||
         _impl.parseColor(me[_SHADOW_COLOR]);
  }

  metric = _impl.getTextMetric(text, me[_FONT]);
  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = (getComputedStyle(me.canvas, null).direction === dir) ? "left"
                                                                  : "right";
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }

  layer = view.appendChild(_doc.createElement("div"));
  _mm.mix(layer.style, {
    font: me[_FONT],
    position: "absolute",
    opacity: me[_GLOBAL_ALPHA],
    height: _int(metric.h * 1.2) + "px",
    width: _int(metric.w * 1.2) + "px", // avoid word wrap
    left: (x - offX) + "px",
    top: y + "px"
  });

  if (sc[1]) {
    layer.style.textShadow = [me[_SHADOWS[1]] + "px",
                              me[_SHADOWS[2]] + "px",
                              me[_SHADOWS[3]] + "px",
                              me[_SHADOWS[0]]].join(" ");
  }
  name = wire ? _STROKE_STYLE : _FILL_STYLE;
  if (typeof me[name] === "string") {
    layer.style.color = me[name];
    if (_ua.webkit && wire) {
      layer.style["-webkit-text-fill-color"] = "transparent";
      layer.style["-webkit-text-stroke-color"] = me[name];
      layer.style["-webkit-text-stroke-width"] = "1px";
    }
  }
  layer.textContent = text;
  canvas._canvasTextView.push(layer);
}

function fillTextSVG(me, text, x, y, maxWidth, wire) {
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

  function svge(name) {
    return _doc.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function attr(elm, hash) {
    for (var i in hash) {
      elm.setAttribute(i, hash[i]);
    }
  }
  function filter(svg, sx, sy, sb, sc) {
    var e = [];
    svg.appendChild(e[0] = svge("defs"));
      e[0].appendChild(e[1] = svge("filter"));
        e[1].appendChild(e[2] = svge("feGaussianBlur"));
        e[1].appendChild(e[3] = svge("feOffset"));
        e[1].appendChild(e[4] = svge("feFlood"));
        e[1].appendChild(e[5] = svge("feComposite"));
        e[1].appendChild(e[6] = svge("feMerge"));
          e[6].appendChild(e[7] = svge("feMergeNode"));
          e[6].appendChild(e[8] = svge("feMergeNode"));
    attr(e[1], {
      id:             "dropshadow",
      filterUnits:    "userSpaceOnUse"
    });
    attr(e[2], {
      "in":           "SourceAlpha",
      stdDeviation:   (sb < 8) ? sb / 2 : Math.sqrt(sb * 2)
    });
    attr(e[3], {
      dx:             sx,
      dy:             sy,
      result:         "offsetblur"
    });
    attr(e[4], {
      "flood-color":   sc[0],
      "flood-opacity": sc[1]
    });
    attr(e[5], {
      in2:            "offsetblur",
      operator:       "in"
    });
    attr(e[8], {
      "in":           "SourceGraphic"
    });
  }

  var style = wire ? me[_STROKE_STYLE] : me[_FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      align = me[_TEXT_ALIGN],
      dir = getComputedStyle(me.canvas, null).direction === "ltr",
      font = _impl.parseFont(me[_FONT], me.canvas),
      metric = _impl.getTextMetric(text, me[_FONT]),
      svg = svge("svg"),
      txt = svge("text"),
      sc = _colorCache[me[_SHADOW_COLOR]] ||
           _impl.parseColor(me[_SHADOW_COLOR]),
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
  if (me[_TEXT_BASELINE] === "top") {
    // text margin-top fine tuning
    offset.y = font.size /
        (_impl.FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
         me.xTextMarginTop);
  }
  attr(svg, {
    width:  metric.w + margin,
    height: metric.h + margin
  });
  if (sc[1]) {
    filter(svg, me[_SHADOW_OFFSET_X], me[_SHADOW_OFFSET_Y],
                me[_SHADOW_BLUR], sc);
    attr(txt, {
      filter: "url(#dropshadow)"
    });
  }
  attr(txt, {
    x:              0 + margin / 2 + offset.x,
    y:              offset.y + offset.y / 2.4 + margin / 2,
    fill:           types ? me.xMissColor : style,
    "text-anchor":  align,
    "font-style":   font.style,
    "font-variant": font.variant,
    "font-size":    font.size + "px",
    "font-weight":  font.weight,
    "font-family":  font.family
  });
  validFontFamily = txt.getAttribute("font-family");
  if (!validFontFamily.replace(/[\"\']/g, "")) {
    return; // Opera9.5, Opera9.6 buggy
  }
  svg.appendChild(txt);
  txt.appendChild(_doc.createTextNode(text));

  _doc.body.appendChild(svg);
  me.save();
  me[_GLOBAL_COMPO] = "source-over";
  try {
    me.drawImage(svg, x - margin / 2 - offset.x, y - margin / 2);
  } catch(err) {} // Opera9.2x
  me.restore();
  _doc.body.removeChild(svg);
}

// === Extend Text API for old WebKit ======================
_impl.textAPI = function(ctx) { // @param CanvasRenderingContext2D:
                                // @return CanvasRenderingContext2D:
  ctx._stack = [];
  ctx._save = ctx.save;
  ctx._restore = ctx.restore;
  ctx._clearRect = ctx.clearRect;
  ctx.font = "10px sans-serif";
  ctx.textAlign = "start";
  ctx.textBaseline = "top"; // spec: "alphabetic"
  ctx.xMissColor = "#000";
  ctx.xTextMarginTop = 1.3;

  ctx.save = function() {
    this._stack.push([ctx[_FONT], ctx[_TEXT_ALIGN], ctx[_TEXT_BASELINE]]);
    this._save();
  };
  ctx.restore = function() {
    ctx._restore();
    if (ctx._stack.length) {
      var last = ctx._stack.pop();
      ctx[_FONT] = last[0];
      ctx[_TEXT_ALIGN] = last[1];
      ctx[_TEXT_BASELINE] = last[2];
    }
  };
  ctx.clearRect = function(x, y, w, h) {
    clearRectDOM(ctx, x, y, w, h);
  };
  ctx.fillText = function(text, x, y, maxWidth, wire) {
    fillTextDOM(ctx, text, x, y, maxWidth, wire);
  };
  ctx.strokeText = function(text, x, y, maxWidth) {
    fillTextDOM(ctx, text, x, y, maxWidth, 1);
  };
  ctx.measureText = function(text) {
    var metric = _impl.getTextMetric(text, ctx[_FONT]);
    return new TextMetrics(metric.w, metric.h);
  }
  return ctx;
};

// --- initialize / export ---

})();

