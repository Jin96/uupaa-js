
// === Color ===
// depend: uu.js
//
// type Number = 0x000000
// type RGBAHash = { r,g,b,a }
// type RGBAValidHash = { r,g,b,a,valid }
// type HexColorString = "#ffffff"
// type HexColorValidArray = [HexColorString, alpha, valid]
// type RGBAColorString = "rgba(0,0,0,0)"
// type W3CNamedColorString = "pink", "skyblue"

uu.waste || (function(win, doc, uu) {
var _HEX2 = uu.dmz.HEX2,
    _round = Math.round,
    _colordb = { transparent: { hex: "#000000", num: 0,
                                r: 0, g: 0, b: 0, a: 0, valid: 1 } },
    _MANY_SPACE = /\s+/g,
    _PARSE_HEX = /^#(([\da-f])([\da-f])([\da-f])([\da-f]{3})?)$/,
    _PARSE_RGBA = /(rgba?)\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/,
    _PARSE_PERCENT = /[\d\.]+%/g;

// [1][HexColor] uu.color("white")    -> ["#ffffff", 1, 1]
// [2][RGBAHash] uu.color("white", 1) -> { r:255,g:255,b:255,a:1,valid:1 }
// [3][Number]   uu.color("white", 2) -> Number(0xffffff)
uu.color = uu.mix(uucolor, {
  add:          uucoloradd,       // uu.color.add("000000black,...")
  hex:          uucolorhex,       // uu.color.hex(rgba) -> HexColorString("#ffffff")
  rgba:         uucolorrgba,      // uu.color.rgba(rgba) -> RGBAColorString("rgba(0,0,0,0)")
  gray:         uucolorgray,      // uu.color.gray(rgba) -> RGBAHash
  sepia:        uucolorsepia,     // uu.color.sepia(rgba) -> RGBAHash
  comple:       uucolorcomple,    // uu.color.comple(rgba) -> RGBAHash
  arrange:      uucolorarrange,   // uu.color.arrange(rgba, h = 0, s = 0, v = 0) -> RGBAHash
  hex2rgba:     uucolorhex2rgba,  // uu.color.hex2rgba(hex) -> RGBAHash
  num2rgba:     uucolornum2rgba,  // uu.color.num2rgba(number) -> RGBAHash
  rgba2hsva:    uucolorrgba2hsva, // uu.color.rgba2hsva(rgba) -> HSVAHash
  hsva2rgba:    uucolorhsva2rgba, // uu.color.hsva2rgba(hsva) -> RGBAHash
  rgba2hsla:    uucolorrgba2hsla, // uu.color.rgba2hsla(rgba) -> HSLAHash
  hsla2rgba:    uucolorhsla2rgba, // uu.color.hsla2rgba(hsla) -> RGBAHash
  _db:          _colordb          // [protected] color db
});

// uu.color - parse color
// [1][HexColor] uu.color("white")    -> ["#ffffff", 1, 1]
// [2][RGBAHash] uu.color("white", 1) -> { r:255,g:255,b:255,a:1,valid:1 }
// [3][Number]   uu.color("white", 2) -> Number(0xffffff)
function uucolor(color,  // @parem RGBAColorString/HexColorString
                         //        /W3CNamedColorString:
                 type) { // @param Number(= 0): result type
                         // @return HexColorValidArray(type=0)
                         //         /RGBAValidHash(type=1)
                         //         /Number(type=2):
  var rv = _colordb[color], m, n;

  !rv && (color = color.toLowerCase().replace(_MANY_SPACE, ""),
          rv = _colordb[color]);
  if (rv) {
    return !type ? [rv.hex, rv.a, rv.valid]    // [1]
                 : (type === 1) ? rv : rv.num; // [2][3]
  }
  m = _PARSE_HEX.exec(color);
  if (m) {
    rv = m[5] ? m[1]
              : (m[2] + m[2] + m[3] + m[3] + m[4] + m[4]);
    if (!type) {
      return ["#" + rv, 1, 1]; // [1]
    }
    n = parseInt(rv, 16);
    return (type === 1) ? { r: (n >> 16) & 255, g: (n >> 8) & 255, // [2]
                            b: n & 255, a: 1, valid: 1 } : n;      // [3]
  }
  m = _PARSE_RGBA.exec(color);
  if (!m) {
    m = _PARSE_RGBA.exec(color.replace(_PARSE_PERCENT, function(n) {
      return Math.min((parseFloat(n) || 0) * 2.55, 255) | 0
    }));
  }
  switch (type || 0) {
  case 0: return m ? ["#" + _HEX2[m[2]] + _HEX2[m[3]] + _HEX2[m[4]], // [1]
                      m[1] === "rgb" ? 1 : parseFloat(m[5]), 1]
                   : ["#000000", 0, 0];
  case 1: return m ? { r: m[2] | 0, g: m[3] | 0, b: m[4] | 0, // [2]
                       a: m[1] === "rgb" ? 1 : parseFloat(m[5]),
                       valid: 1 }
                   : { r: 0, g: 0, b: 0, a: 0, valid: 0 };
  }
  return m ? m[2] * 65536 + m[3] * 256 + m[4] * 1 : 0; // [3]
}

// uu.color.add
function uucoloradd(items) { // @param JointString: "000000black,..."
  var key, val, num, v, i = 0, item = items.split(",");

  while ( (v = item[i++]) ) {
    key = v.slice(6);
    val = v.slice(0, 6);
    num = parseInt(val, 16);
    _colordb[key] = {
      hex: "#" + val,
      num: num,
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
      valid: 1
    };
  }
}

// uu.color.hex - return Hex Color String( "#ffffff" )
function uucolorhex(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                            // @return HexColorString( "#ffffff" )
  return "#" + _HEX2[rgba.r] + _HEX2[rgba.g] + _HEX2[rgba.b];
}

// uu.color.rgba - return RGBA Color String( "rgba(0,0,0,0)" )
function uucolorrgba(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                             // @return RGBAColorString( "rgba(0,0,0,0)" )
  return "rgba(" + rgba.r + "," + rgba.g + "," +
                   rgba.b + "," + rgba.a + ")";
}

// uu.color.gray - gray color (G channel method)
function uucolorgray(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                             // @return RGBAHash:
  return { r: rgba.g, g: rgba.g,
           b: rgba.g, a: rgba.a };
}

// uu.color.sepia - sepia color
function uucolorsepia(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
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

// uu.color.comple - complementary color
function uucolorcomple(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                               // @return RGBAHash:
  return { r: rgba.r ^ 255, g: rgba.g ^ 255,
           b: rgba.b ^ 255, a: rgba.a };
}

// uu.color.arrange - arrangemented color(Hue, Saturation and Value)
//    Hue is absolure value,
//    Saturation and Value is relative value.
function uucolorarrange(rgba, // @param RGBAHash: Hash( { r,g,b,a })
                        h,    // @param Number(=0): Hue (-360~360)
                        s,    // @param Number(=0): Saturation (-100~100)
                        v) {  // @param Number(=0): Value (-100~100)
                              // @return RGBAHash:
  var rv = uucolorrgba2hsva(rgba), r = 360;

  rv.h += h, rv.h = (rv.h > r) ? rv.h - r : (rv.h < 0) ? rv.h + r : rv.h;
  rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
  rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
  return uucolorhsva2rgba(rv);
}

// uu.color.hex2rgba - convert "#ffffff" to RGBAHash
function uucolorhex2rgba(hex) { // @param HexColorString: String( "#ffffff" )
                                // @return RGBAHash: Hash( { r,g,b,a } )
  return uucolornum2rgba(parseInt(hex.slice(1), 16));
}

// uu.color.num2rgba - convert Number(0xffffff) to RGBAHash
function uucolornum2rgba(num) { // @param Number: 0xffffff
                                // @return RGBAHash: Hash( { r,g,b,a } )
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff,
           b: num & 0xff, a: 1 };
}

// uu.color.rgba2hsva
function uucolorrgba2hsva(rgba) { // @param RGBAHash:
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

// uu.color.hsva2rgba
function uucolorhsva2rgba(hsva) { // @param HSVAHash:
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

// uu.color.rgba2hsla
function uucolorrgba2hsla(rgba) { // @param RGBAHash:
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

// uu.color.hsla2rgba - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function uucolorhsla2rgba(hsla) { // @param HSLAHash:
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

// --- initialize ---
// add W3C Named Color
uucoloradd("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
"yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,ff00ffmage" +
"nta,880000maroon,888800olive,008800green,008888teal,000088navy,880088purple" +
",696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,d3d3d3lightgrey,dcdcd" +
"cgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,778899lightslategray" +
",b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,4b0082indigo,483d8bda" +
"rkslateblue,6a5acdslateblue,7b68eemediumslateblue,9370dbmediumpurple,f8f8ff" +
"ghostwhite,00008bdarkblue,0000cdmediumblue,4169e1royalblue,1e90ffdodgerblue" +
",6495edcornflowerblue,87cefalightskyblue,add8e6lightblue,f0f8ffaliceblue,19" +
"1970midnightblue,00bfffdeepskyblue,87ceebskyblue,b0e0e6powderblue,2f4f4fdar" +
"kslategray,00ced1darkturquoise,afeeeepaleturquoise,f0ffffazure,008b8bdarkcy" +
"an,20b2aalightseagreen,48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamari" +
"ne,e0fffflightcyan,00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgree" +
"n,7fff00chartreuse,adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66" +
"cdaamediumaquamarine,98fb98palegreen,f5fffamintcream,006400darkgreen,228b22" +
"forestgreen,32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolive" +
"green,6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet" +
",8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorch" +
"id,ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,c71585medium" +
"violetred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,ffe4e1mistyrose,ff1493de" +
"eppink,db7093palevioletred,e9967adarksalmon,ffb6c1lightpink,fff0f5lavenderb" +
"lush,cd5c5cindianred,f08080lightcoral,f4a460sandybrown,fff5eeseashell,dc143" +
"ccrimson,ff6347tomato,ff7f50coral,fa8072salmon,ffa07alightsalmon,ffdab9peac" +
"hpuff,ffffe0lightyellow,b22222firebrick,ff4500orangered,ff8c00darkorange,ff" +
"a500orange,ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown," +
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhak" +
"i,fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,e" +
"ee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,ffe4c4bisqu" +
"e,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,f5deb3wheat,faebd7an" +
"tiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory");

})(window, document, uu);

