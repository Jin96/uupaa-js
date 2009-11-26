
// === uuMeta.style.shadow ===
// depend: uuMeta, uuMeta.style, uuMeta.color
/*
uuMeta.style.getTextShadow(elm) - return { color, ox, oy, blur }
uuMeta.style.setTextShadow(elm, color, ox, oy, blur)
 */
(function() {
var _mm = uuMeta,
    _DXIMG = "DXImageTransform.Microsoft.",
    _SHADOW = _DXIMG + "Shadow",
    _BLUR = _DXIMG + "MotionBlur";

// uuMeta.style.setTextShadow - set text-shadow value
function setTextShadow(elm,    // @param Node:
                       color,  // @param Array: ColorString/RGBAHash color
                       ox,     // @param Array: shadow offsetX (with unit)
                       oy,     // @param Array: shadow offsetY (with unit)
                       blur) { // @param Array: shadow blur (with unit)
  var rv = [], c, v, i = 0;

  while ( (v = color[i++]) ) {
    c = (typeof v === "string") ? v : _mm.color.hex(v);
    rv.push(c + " " + ox[i] + " " + oy[i] + " " + blur[i]);
  }
  elm.style.textShadow = rv.join(",");
}

function setTextShadowIE(elm, color, ox, oy, blur) {
  if (!color.length) {
    color[0] = "transparent";
    ox[0] = 0;
    oy[0] = 0;
    blur[0] = 0;
  }

  var es = elm.style, obj, _math = Math,
      cs = elm.currentStyle,
      x = _mm.style.toPixel(elm, ox[0]),
      y = _mm.style.toPixel(elm, oy[0]),
      rgba = (typeof color[0] === "string") ? _mm.color.parse(color[0], 1)
                                            : color[0],
      dir = _math.atan2(y, x) * (180 / _math.PI) + 90,
      shadowStrength, blurStrength;

  if (x || y) {
    shadowStrength = _math.max(_math.abs(x), _math.abs(y));
    blurStrength = _math.min(_mm.style.toPixel(elm, blur[0]) / 2.5, 10);
  } else {
    shadowStrength = 0;
    blurStrength = 5;
  }

  if (es.uutextshadow === void 0) {
    (es.filter.indexOf(_SHADOW) < 0) && (es.filter += " progid:" + _SHADOW);
    (es.filter.indexOf(_BLUR)   < 0) && (es.filter += " progid:" + _BLUR);
    (cs.display === "inline") && (elm.style.display = "inline-block");
    // IE6, IE7: force "hasLayout"
    (!_mm.ua.ie8 && cs.width === "auto") && (es.zoom = 1);
  }

  es.uutextshadow = { color: color, ox: ox, oy: oy, blur: blur };

  obj = elm.filters.item(_SHADOW);
  obj.Color = _mm.color.hex(rgba);
  obj.Strength = shadowStrength;
  obj.Direction = dir;
  obj.Enabled = !rgba.a ? false : true;

  obj = elm.filters.item(_BLUR);
  obj.Add = true;
  obj.Strength = blurStrength;
  obj.Direction = dir;
  obj.Enabled = !rgba.a ? false : true;
}

// uuMeta.style.getTextShadow - get text-shadow value
function getTextShadow(elm) { // @param Node:
                              // @return Hash: { color, ox, oy, blur }
  return _mm.style.validate.shadow(getComputedStyle(elm, null).textShadow);
}

function getTextShadowIE(elm) {
  var rv = elm.style.uutextshadow,
      zero = { color: ["transparent"], ox: [0], oy: [0], blur: [0] };

  return (rv === void 0) ? zero : rv;
}

// --- initialize / export ---
_mm.style.getTextShadow = _mm.ua.ie ? getTextShadowIE : getTextShadow;
_mm.style.setTextShadow = _mm.ua.ie ? setTextShadowIE : setTextShadow;

})(); // uuMeta.style.shadow scope

