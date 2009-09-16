
// === uuMeta.style.opacity ===
// depend: uuMeta, uuMeta.style
/*
uuMeta.style.getOpacity(elm) - return 0.0 ~ 1.0
uuMeta.style.setOpacity(elm, opacity = 1.0, diff = 0)
 */
(function uuMetaStyleOpacityScope() {
var _mm = uuMeta,
    _ALPHA = "DXImageTransform.Microsoft.Alpha";

// uuMeta.style.setOpacity - set opacity value(from 0.0 to 1.0)
function setOpacity(node,    // @param Node:
                    opacity, // @param Number: float(from 0.0 to 1.0)
                    diff) {  // @param Boolean(= false):
  if (diff) {
    opacity += parseFloat(node.style.opacity ||
                          getComputedStyle(node, null).opacity);
  }
  node.style.opacity = (opacity > 0.999) ? 1
                     : (opacity < 0.001) ? 0 : opacity;
}

function setOpacityIE(node, opacity, diff) {
  var ns = node.style, obj;

  if (ns.uuopacity === void 0) {
    ns.uuopacity = 1;
    (ns.filter.indexOf(_ALPHA) < 0) && (ns.filter += " progid:" + _ALPHA);
    if (!_mm.ua.ie8 && node.currentStyle.width === "auto") {
      ns.zoom = 1; // IE6, IE7: force "hasLayout"
    }
  }
  if (diff) {
    opacity += parseFloat(ns.uuopacity);
  }
  ns.uuopacity = opacity = (opacity > 0.999) ? 1
                         : (opacity < 0.001) ? 0 : opacity;
  obj = node.filters.item(_ALPHA);
  obj.Opacity = (opacity * 100) | 0;
  obj.Enabled = (opacity === 1 || opacity === 0) ? false : true;
  ns.visibility = (opacity === 0) ? "hidden" : "";
}

// uuMeta.style.getOpacity - get opacity value(from 0.0 to 1.0)
function getOpacity(node) { // @param Node:
                            // @return Number: float(from 0.0 to 1.0)
  return parseFloat(node.style.opacity ||
                    getComputedStyle(node, null).opacity);
}

function getOpacityIE(node) {
  var rv = node.style.uuopacity;

  return (rv === void 0) ? 1 : rv;
}

// --- initialize / export ---
_mm.style.getOpacity = _mm.ua.ie ? getOpacityIE : getOpacity;
_mm.style.setOpacity = _mm.ua.ie ? setOpacityIE : setOpacity;

})(); // uuMeta.style.opacity scope

