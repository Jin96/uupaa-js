
// === Color ===
// depend: uu.js
//
// type ColorHash = { hex: "#000000", rgba: "rgba(0,0,0,0)",
//                    r: 0, g: 0, b: 0, a: 0 }
// type RGBAHash = { r: 0, g: 0, b: 0, a: 0 }
// type HSVAHash = { h: 0, s: 0, v: 0, a: 0 }
// type HSLAHash = { h: 0, s: 0, l: 0, a: 0 }
// type W3CNamedColorString = "pink"

uu.waste || (function(win, doc, uu) {
var _HEX = uupub.HEX2, _round = Math.round;

uu.mix(uu.color, {
  gray:         uucolorgray,      // uu.color.gray(RGBAHash/ColorHash) -> ColorHash
  sepia:        uucolorsepia,     // uu.color.sepia(RGBAHash/ColorHash) -> ColorHash
  comple:       uucolorcomple,    // uu.color.comple(RGBAHash/ColorHash) -> ColorHash
  arrange:      uucolorarrange,   // uu.color.arrange(RGBAHash/ColorHash, h = 0, s = 0, v = 0) -> ColorHash
  rgba2hsva:    uucolorrgba2hsva, // uu.color.rgba2hsva(RGBAHash/ColorHash) -> HSVAHash
  hsva2rgba:    uucolorhsva2rgba, // uu.color.hsva2rgba(HSVAHash) -> ColorHash
  rgba2hsla:    uucolorrgba2hsla, // uu.color.rgba2hsla(RGBAHash/ColorHash) -> HSLAHash
  hsla2rgba:    uucolorhsla2rgba  // uu.color.hsla2rgba(HSLAHash) -> ColorHash
});

// uu.color.gray - gray color (G channel method)
function uucolorgray(c) { // @param ColorHash/RGBAHash:
                          // @return ColorHash:
  return _supply({ r: c.g, g: c.g, b: c.g, a: c.a });
}

// uu.color.sepia - sepia color
function uucolorsepia(c) { // @param ColorHash/RGBAHash:
                           // @return ColorHash:
  var r = c.r, g = c.g, b = c.b,
      y = 0.2990 * r + 0.5870 * g + 0.1140 * b,
      u = -0.091,
      v = 0.056;

  r = y + 1.4026 * v;
  g = y - 0.3444 * u - 0.7114 * v;
  b = y + 1.7330 * u;
  r *= 1.2;
  b *= 0.8;
  return _supply({ r: r < 0 ? 0 : r > 255 ? 255 : r | 0,
                   g: g < 0 ? 0 : g > 255 ? 255 : g | 0,
                   b: b < 0 ? 0 : b > 255 ? 255 : b | 0, a: c.a });
}

// uu.color.comple - complementary color
function uucolorcomple(c) { // @param ColorHash/RGBAHash:
                            // @return ColorHash:
  return _supply({ r: c.r ^ 255, g: c.g ^ 255, b: c.b ^ 255, a: c.a });
}

// uu.color.arrange - arrangemented color(Hue, Saturation and Value)
//    Hue is absolure value,
//    Saturation and Value is relative value.
function uucolorarrange(c,   // @param ColorHash/RGBAHash:
                        h,   // @param Number(=0): Hue (-360~360)
                        s,   // @param Number(=0): Saturation (-100~100)
                        v) { // @param Number(=0): Value (-100~100)
                             // @return ColorHash:
  var rv = uucolorrgba2hsva(c), r = 360;

  rv.h += h, rv.h = (rv.h > r) ? rv.h - r : (rv.h < 0) ? rv.h + r : rv.h;
  rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
  rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
  return uucolorhsva2rgba(rv); // ColorHash
}

// uu.color.rgba2hsva
function uucolorrgba2hsva(c) { // @param ColorHash/RGBAHash:
                               // @return HSVAHash:
  var r = c.r / 255, g = c.g / 255, b = c.b / 255,
      max = Math.max(r, g, b),
      diff = max - Math.min(r, g, b),
      h = 0,
      s = max ? _round(diff / max * 100) : 0,
      v = _round(max * 100);

  if (!s) {
    return { h: 0, s: 0, v: v, a: c.a };
  }
  h = (r === max) ? ((g - b) * 60 / diff) :
      (g === max) ? ((b - r) * 60 / diff + 120)
                  : ((r - g) * 60 / diff + 240);
  // HSVAHash( { h:360, s:100, v:100, a:1.0 } )
  return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: c.a };
}

// uu.color.hsva2rgba
function uucolorhsva2rgba(hsva) { // @param HSVAHash:
                                  // @return ColorHash:
  var rv,
      h = (hsva.h >= 360) ? 0 : hsva.h,
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
  case 0:  rv = { r: w, g: t, b: p }; break;
  case 1:  rv = { r: q, g: w, b: p }; break;
  case 2:  rv = { r: p, g: w, b: t }; break;
  case 3:  rv = { r: p, g: q, b: w }; break;
  case 4:  rv = { r: t, g: p, b: w }; break;
  case 5:  rv = { r: w, g: p, b: q }; break;
  default: rv = { r: 0, g: 0, b: 0 };
  }
  rv.a = a;
  return _supply(rv);
}

// uu.color.rgba2hsla
function uucolorrgba2hsla(c) { // @param ColorHash/RGBAHash:
                               // @return HSLAHash:
  var r = c.r / 255,
      g = c.g / 255,
      b = c.b / 255,
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
  return { h: h, s: _round(s * 100), l: _round(l * 100), a: c.a };
}

// uu.color.hsla2rgba - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function uucolorhsla2rgba(hsla) { // @param HSLAHash:
                                  // @return ColorHash:
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
  return _supply({ r: _round(r * 255), g: _round(g * 255),
                   b: _round(b * 255), a: hsla.a });
}

// inner -
function _supply(c) { // @param RGBAHash/ColorHash:
                      // @return ColorHash:
  c.rgba || (c.rgba = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")");
  c.hex  || (c.hex  = "#" + _HEX[c.r] + _HEX[c.g] + _HEX[c.b]);
  return c;
}

// --- initialize ---
// add W3C Named Color
uu.color.add("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00"+
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

