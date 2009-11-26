
// === uuMeta.color ===
// depend: uuMeta
/*
type Number = 0x000000
type RGBAHash = { r,g,b,a }
type RGBAValidHash = { r,g,b,a,valid }
type HexColorString = "#ffffff"
type HexColorValidArray = [HexColorString, alpha, valid]
type RGBAColorString = "rgba(0,0,0,0)"
type W3CNamedColorString = "pink", "skyblue"

uuMeta.color.parse(color, type = 0) - return (type=0) HexColorValidArray
                                      or     (type=1) RGBAValidHash
                                      or     (type=2) Number
uuMeta.color.add("000000black,...")
uuMeta.color.hex(rgba) - return HexColorString("#ffffff")
uuMeta.color.rgba(rgba) - return RGBAColorString("rgba(0,0,0,0)")
uuMeta.color.arrange(rgba, h = 0, s = 0, v = 0) - return RGBAHash
uuMeta.color.comple(rgba) - return RGBAHash
uuMeta.color.gray(rgba) - return RGBAHash
uuMeta.color.sepia(rgba) - return RGBAHash
uuMeta.color.hex2rgba(hex) - return RGBAHash
uuMeta.color.rgba2hsva(rgba) - return HSVAHash
uuMeta.color.hsva2rgba(hsva) - return RGBAHash
uuMeta.color.rgba2hsla(rgba) - return HSLAHash
uuMeta.color.hsla2rgba(hsla) - return RGBAHash
 */
(function uuMetaColorScope() {
var _mm = uuMeta,
    _round  = Math.round,
    _hash   = { transparent: { hex: "#000000", num: 0,
                               r: 0, g: 0, b: 0, a: 0, valid: 1 } },
    _MANY_SPACE     = /\s+/g,
    _PARSE_HEX      = /^#(([\da-f])([\da-f])([\da-f])([\da-f]{3})?)$/,
    _PARSE_PERCENT  = /[\d\.]+%/g,
    _PARSE_RGBA     = /(rgba?)\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/;

// uuMeta.color.parse - parse color
function parse(color,  // @parem RGBAColorString
                       //        /HexColorString
                       //        /W3CNamedColorString:
               type) { // @param Number(= 0): result type
                       //            0 = return HexColorValidArray
                       //            1 = return RGBAValidHash
                       //            2 = return Number
                       // @return HexColorValidArray(type=0)
                       //         /RGBAValidHash(type=1)
                       //         /Number(type=2):
  var rv = _hash[color], m, n,
      xfloat = parseFloat, hex2 = _mm.hash.hex2; // alias

  !rv && (color = color.toLowerCase().replace(_MANY_SPACE, ""),
          rv = _hash[color]);
  if (rv) {
    return !type ? [rv.hex, rv.a, rv.valid] :
           (type === 1) ? rv : rv.num;
  }
  if ( (m = _PARSE_HEX.exec(color)) ) {
    rv = m[5] ? m[1]
              : (m[2] + m[2] + m[3] + m[3] + m[4] + m[4]);
    if (!type) {
      return ["#" + rv, 1, 1];
    }
    n = parseInt(rv, 16);
    return (type === 1) ? { r: (n >> 16) & 255, g: (n >> 8) & 255,
                            b: n & 255, a: 1, valid: 1 } : n;
  }
  m = _PARSE_RGBA.exec(color);
  if (!m) {
    m = _PARSE_RGBA.exec(color.replace(_PARSE_PERCENT, function(n) {
      return Math.min((xfloat(n) || 0) * 2.55, 255) | 0
    }));
  }
  switch (type || 0) {
  case 0: return m ? ["#" + hex2[m[2]] + hex2[m[3]] + hex2[m[4]],
                      m[1] === "rgb" ? 1 : xfloat(m[5]), 1]
                   : ["#000000", 0, 0];
  case 1: return m ? { r: m[2] | 0, g: m[3] | 0, b: m[4] | 0,
                       a: m[1] === "rgb" ? 1 : xfloat(m[5]),
                       valid: 1 }
                   : { r: 0, g: 0, b: 0, a: 0, valid: 0 };
  }
  return m ? m[2] * 65536 + m[3] * 256 + m[4] * 1 : 0;
}

// uuMeta.color.add
function add(items) { // @param JointString: "000000black,..."
  var key, val, num, v, i = 0, item = items.split(",");

  while ( (v = item[i++]) ) {
    key = v.slice(6);
    val = v.slice(0, 6);
    num = parseInt(val, 16);
    _hash[key] = { hex: "#" + val,
                   num: num,
                   r: (num >> 16) & 255,
                   g: (num >> 8) & 255,
                   b: num & 255,
                   a: 1,
                   valid: 1 };
  }
}

// uuMeta.color.hex - return Hex Color String( "#ffffff" )
function hex(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                     // @return HexColorString( "#ffffff" )
  var hex2 = _mm.hash.hex2;

  return "#" + hex2[rgba.r] + hex2[rgba.g] + hex2[rgba.b];
}

// uuMeta.color.rgba - return RGBA Color String( "rgba(0,0,0,0)" )
function rgba(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                      // @return RGBAColorString( "rgba(0,0,0,0)" )
  return "rgba(" + rgba.r + "," + rgba.g + "," +
                   rgba.b + "," + rgba.a + ")";
}

// uuMeta.color.arrange - arrangemented color(Hue, Saturation and Value)
//    Hue is absolure value,
//    Saturation and Value is relative value.
function arrange(rgba, // @param RGBAHash: Hash( { r,g,b,a })
                 h,    // @param Number(=0): Hue (from -360 to 360)
                 s,    // @param Number(=0): Saturation (from -100 to 100)
                 v) {  // @param Number(=0): Value (from -100 to 100)
                       // @return RGBAHash:
  var rv = rgba2hsva(rgba), r = 360;

  rv.h += h, rv.h = (rv.h > r) ? rv.h - r : (rv.h < 0) ? rv.h + r : rv.h;
  rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
  rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
  return hsva2rgba(rv);
}

// uuMeta.color.comple - complementary color
function comple(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                        // @return RGBAHash:
  return { r: rgba.r ^ 255, g: rgba.g ^ 255,
           b: rgba.b ^ 255, a: rgba.a };
}

// uuMeta.color.gray - gray color (G channel method)
function gray(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                      // @return RGBAHash:
  return { r: rgba.g, g: rgba.g,
           b: rgba.g, a: rgba.a };
}

// uuMeta.color.sepia - sepia color
function sepia(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                       // @return RGBAHash:
  var r = rgba.r, g = rgba.g, b = rgba.b,
      y = 0.2990 * r + 0.5870 * g + 0.1140 * b,
      u = -0.091,
      v = 0.056;

  r = y + 1.4026 * v;
  g = y - 0.3444 * u - 0.7114 * v;
  b = y + 1.7330 * u;
  r *= 1.2;
  b *= 0.8;
  return { r: r < 0 ? 0 : r > 255 ? 255 : r | 0,
           g: g < 0 ? 0 : g > 255 ? 255 : g | 0,
           b: b < 0 ? 0 : b > 255 ? 255 : b | 0, a: rgba.a };
}

// uuMeta.color.hex2rgba - convert "#ffffff" to RGBAHash
function hex2rgba(hex) { // @param HexColorString: String( "#ffffff" )
                         // @return RGBAHash: Hash( { r,g,b,a } )
  var n = parseInt(hex.slice(1), 16);

  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff,
           b: n & 0xff, a: 1 };
}

// uuMeta.color.rgba2hsva
function rgba2hsva(rgba) { // @param RGBAHash:
                           // @return HSVAHash:
  var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255,
      max = Math.max(r, g, b),
      diff = max - Math.min(r, g, b),
      h = 0,
      s = max ? _round(diff / max * 100) : 0,
      v = _round(max * 100);

  if (!s) {
    return { h: 0, s: 0, v: v, a: rgba.a };
  }
  h = (r === max) ? ((g - b) * 60 / diff) :
      (g === max) ? ((b - r) * 60 / diff + 120)
                  : ((r - g) * 60 / diff + 240);
  // HSVAHash( { h:360, s:100, v:100, a:1.0 } )
  return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: rgba.a };
}

// uuMeta.color.hsva2rgba
function hsva2rgba(hsva) { // @param HSVAHash:
                           // @return RGBAHash:
  var h = (hsva.h >= 360) ? 0 : hsva.h,
      s = hsva.s / 100,
      v = hsva.v / 100,
      a = hsva.a,
      h60 = h / 60, matrix = h60 | 0, f = h60 - matrix,
      v255, p, q, t, w,
      round = _round;

  if (!s) {
    h = round(v * 255);
    return { r: h, g: h, b: h, a: a };
  }
  v255 = v * 255,
  p = round((1 - s) * v255),
  q = round((1 - (s * f)) * v255),
  t = round((1 - (s * (1 - f))) * v255),
  w = round(v255);
  switch (matrix) {
  case 0: return { r: w, g: t, b: p, a: a };
  case 1: return { r: q, g: w, b: p, a: a };
  case 2: return { r: p, g: w, b: t, a: a };
  case 3: return { r: p, g: q, b: w, a: a };
  case 4: return { r: t, g: p, b: w, a: a };
  case 5: return { r: w, g: p, b: q, a: a };
  }
  return { r: 0, g: 0, b: 0, a: a };
}

// uuMeta.color.rgba2hsla
function rgba2hsla(rgba) { // @param RGBAHash:
                           // @return HSLAHash:
  var r = rgba.r / 255,
      g = rgba.g / 255,
      b = rgba.b / 255,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      diff = max - min,
      h = 0, s = 0, l = (min + max) / 2;

  if (l > 0 && l < 1) {
    s = diff / (l < 0.5 ? l * 2 : 2 - (l * 2));
  }
  if (diff > 0) {
    if (max === r && max !== g) {
      h += (g - b) / diff;
    } else if (max === g && max !== b) {
      h += (b - r) / diff + 2;
    } else if (max === b && max !== r) {
      h += (r - g) / diff + 4;
    }
    h *= 60;
  }
  return { h: h, s: _round(s * 100), l: _round(l * 100), a: rgba.a };
}

// uuMeta.color.hsla2rgba - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function hsla2rgba(hsla) { // @param HSLAHash:
                           // @return RGBAHash:
  var h = (hsla.h === 360) ? 0 : hsla.h,
      s = hsla.s / 100,
      l = hsla.l / 100,
      r, g, b, s1, s2, l1, l2;

  if (h < 120) {
    r = (120 - h) / 60, g = h / 60, b = 0;
  } else if (h < 240) {
    r = 0, g = (240 - h) / 60, b = (h - 120) / 60;
  } else {
    r = (h - 240) / 60, g = 0, b = (360 - h) / 60;
  }
  s1 = 1 - s;
  s2 = s * 2;

  r = s2 * (r > 1 ? 1 : r) + s1;
  g = s2 * (g > 1 ? 1 : g) + s1;
  b = s2 * (b > 1 ? 1 : b) + s1;

  if (l < 0.5) {
    r *= l, g *= l, b *= l;
  } else {
    l1 = 1 - l;
    l2 = l * 2 - 1;
    r = l1 * r + l2;
    g = l1 * g + l2;
    b = l1 * b + l2;
  }
  return { r: _round(r * 255), g: _round(g * 255),
           b: _round(b * 255), a: hsla.a };
}

// --- initialize / export ---
// add W3C Named Color
add(
"000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,"+
"ffff00yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,"+
"ff00ffmagenta,880000maroon,888800olive,008800green,008888teal,000088navy,"+
"880088purple,696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,"+
"d3d3d3lightgrey,dcdcdcgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,"+
"778899lightslategray,b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,"+
"4b0082indigo,483d8bdarkslateblue,6a5acdslateblue,7b68eemediumslateblue,"+
"9370dbmediumpurple,f8f8ffghostwhite,00008bdarkblue,0000cdmediumblue,"+
"4169e1royalblue,1e90ffdodgerblue,6495edcornflowerblue,87cefalightskyblue,"+
"add8e6lightblue,f0f8ffaliceblue,191970midnightblue,00bfffdeepskyblue,"+
"87ceebskyblue,b0e0e6powderblue,2f4f4fdarkslategray,00ced1darkturquoise,"+
"afeeeepaleturquoise,f0ffffazure,008b8bdarkcyan,20b2aalightseagreen,"+
"48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamarine,e0fffflightcyan,"+
"00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgreen,7fff00chartreuse,"+
"adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66cdaamediumaquamarine,"+
"98fb98palegreen,f5fffamintcream,006400darkgreen,228b22forestgreen,"+
"32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolivegreen,"+
"6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet,"+
"8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorchid,"+
"ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,"+
"c71585mediumvioletred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,"+
"ffe4e1mistyrose,ff1493deeppink,db7093palevioletred,e9967adarksalmon,"+
"ffb6c1lightpink,fff0f5lavenderblush,cd5c5cindianred,f08080lightcoral,"+
"f4a460sandybrown,fff5eeseashell,dc143ccrimson,ff6347tomato,ff7f50coral,"+
"fa8072salmon,ffa07alightsalmon,ffdab9peachpuff,ffffe0lightyellow,"+
"b22222firebrick,ff4500orangered,ff8c00darkorange,ffa500orange,"+
"ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown,"+
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhaki,"+
"fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,"+
"eee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,"+
"ffe4c4bisque,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,"+
"f5deb3wheat,faebd7antiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,"+
"fffff0ivory");

uuMeta.color = {
  parse:      parse,
  add:        add,
  hex:        hex,
  rgba:       rgba,
  arrange:    arrange,
  comple:     comple,
  gray:       gray,
  sepia:      sepia,
  hex2rgba:   hex2rgba,
  rgba2hsva:  rgba2hsva,
  hsva2rgba:  hsva2rgba,
  rgba2hsla:  rgba2hsla,
  hsla2rgba:  hsla2rgba,
  refHash:    _hash
};

})(); // uuMeta.color scope

