// === font ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

var _metricNode,   // [lazy] Measure Text Metric Node
    _BASE_STYLE = "position:absolute;border:0 none;margin:0;padding:0;",
    _FONT_SIZES = { "xx-small": 0.512,
                    "x-small":  0.64,
                    smaller:    0.8,
                    small:      0.8,
                    medium:     1,
                    large:      1.2,
                    larger:     1.2,
                    "x-large":  1.44,
                    "xx-large": 1.728 };

uu.font = {
  parse:          fontparse,
  metric:         fontmetric,
  SCALE:          { ARIAL: 1.55, "ARIAL BLACK": 1.07, "COMIC SANS MS": 1.15,
                    "COURIER NEW": 1.6, GEORGIA: 1.6, "LUCIDA GRANDE": 1,
                    "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
                    "TREBUCHET MS": 1.55, VERDANA: 1.4, "MS UI GOTHIC": 2,
                    "MS PGOTHIC": 2, MEIRYO: 1, "SANS-SERIF": 1,
                    SERIF: 1, MONOSPACE: 1, FANTASY: 1, CURSIVE: 1 }
};

// uu.font.parse - parse CSS::font style
function fontparse(font,     // @param String:
                   embase) { // @param Node: The em base node
                             // @return Hash:
  // inner - measure em unit
  function _em(node) {
    var rv, div = node.appendChild(uue());

    div.style.cssText = _BASE_STYLE + "width:12em";
    rv = div.clientWidth / 12;
    node.removeChild(div);
    return rv;
  }

  var rv = {}, fontSize, style,
      cache = embase.uucanvascache ||
              (embase.uucanvascache = { font: {}, em: _em(embase) });

  if (!cache.font[font]) {
    // --- parse font string ---
    style = uue().style; // dummy element
    try {
      style.font = font; // parse
    } catch (err) {
      throw err;
    }
    fontSize = style.fontSize; // get font-size

    rv.size = _FONT_SIZES[fontSize];
    if (rv.size) { // "small", "large" ...
      rv.size *= 16;
    } else if (fontSize.lastIndexOf("px") > 0) { // "12px"
      rv.size = parseFloat(fontSize);
    } else if (fontSize.lastIndexOf("pt") > 0) { // "12.3pt"
      rv.size = parseFloat(fontSize) * 1.33;
    } else if (fontSize.lastIndexOf("em") > 0) { // "10.5em"
      rv.size = parseFloat(fontSize) * cache.em;
    } else {
      throw new Error("unknown font unit");
    }
    rv.style = style.fontStyle;
    rv.weight = style.fontWeight;
    rv.variant = style.fontVariant;
    rv.rawfamily = style.fontFamily.replace(/[\"\']/g, "");
    rv.family = "'" + rv.rawfamily.replace(/\s*,\s*/g, "','") + "'";
    rv.formal = [rv.style,
                 rv.variant,
                 rv.weight,
                 rv.size.toFixed(2) + "px",
                 rv.family].join(" ");
    cache.font[font] = rv; // add cache
  }
  return cache.font[font];
}

// uu.font.metric - measure text rect(width, height)
function fontmetric(text,   // @param String:
                    font) { // @param String:
                            // @return Hash: { w, h }
  if (!_metricNode) {
    _metricNode = uue();
    _metricNode.style.cssText = _BASE_STYLE +
        "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
    doc.body.appendChild(_metricNode);
  }
  _metricNode.style.font = font;
  _metricNode[uu.gecko ? "textContent" : "innerText"] = text;

  return { w: _metricNode.offsetWidth,
           h: _metricNode.offsetHeight };
}

})(window, document, uu);

