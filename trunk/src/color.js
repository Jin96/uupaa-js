// === Color ===============================================
// depend: oop
uu.feat.color = {};

// --- types of color ---
// NamedColorString:  "red" or "orange"
// HexColorString:    "#ffffff" or "#fff" (input only)
// RGBColorString:    "rgb(0, 0, 0)" or "rgb(0%, 0%, 0%)" (input only)
// RGBAColorString:   "rgba(0, 0, 0, 0)" or "rgba(0%, 0%, 0%, 0)"
// HSVAColorString:   "rsva(0, 0, 0, 0)"
// HSLAColorString:   "rsla(0, 0, 0, 0)"
// ColorString:       NamedColorString or HexColorString or RGBColorString or RGBAColorString
// JointColorString:  "NamedColorString:ColorString;..."
// RedNumber:         0x00 to 0xff (in RGBA)
// GreenNumber:       0x00 to 0xff (in RGBA)
// BlueNumber:        0x00 to 0xff (in RGBA)
// AlphaNumber:       0.0 to 1.0 (in RGBA, HSVA, HSLA)
// HueNumber:         0 to 360 (in HSLA, HSVA)
// SaturationNumber:  0 to 100 (in HSLA, HSVA)
// ValueNumber:       0 to 100 (in HSVA)
// LightnessNumber:   0 to 100 (in HSLA)
// ColorNumber:       0x0 to 0xffffff
// ColorNumberAlphaNumberArray: [ColorNumber, AlphaNumber]
// HexColorStringAlphaNumberArray: ["#ffffff", AlphaNumber]
// RGBAHash:          { r: RedNumber, g: GreenNumber, b: BlueNumber, a: AlphaNumber }
// HSVAHash:          { h: HueNumber, s: SaturationNumber, v: ValueNumber, a: AlphaNumber }
// HSLAHash:          { h: HueNumber, s: SaturationNumber, l: LightnessNumber, a: AlphaNumber }
// AnyColorTypes:     ColorString or RGBAHash
// ColorArray:        Array( AnyColorTypes, ... )

UU.COLOR = {
  DICT: { transparent: [0, 0] }, // UU.COLOR.DICT - color dict

  // --- preset colors ---
  ZERO:  { r: 0, g: 0, b: 0, a: 0 }, // UU.COLOR.ZERO - Transparent Black
  BLACK: { r: 0, g: 0, b: 0, a: 1 }, // UU.COLOR.BLACK - Black
  WHITE: { r: 255, g: 255, b: 255, a: 1 }, // UU.COLOR.WHITE - WHITE

  // --- style ---
  NUM_ALPHA:  1, // UU.COLOR.NUM_ALPHA - [ColorNumber, AlphaNumber]
  HEX_ALPHA:  2, // UU.COLOR.HEX_ALPHA - ["#123456", AlphaNumber]
  HEX:        3, // UU.COLOR.HEX - "#123456"
  RGBAHASH:   4, // UU.COLOR.RGBAHASH - { r: RedNumber, g: GreenNumber, b: BlueNumber, a: AlphaNumber }
  RGBA:       5, // UU.COLOR.RGBA - "rgba(,,,)"
  HSVA:       6, // UU.COLOR.HSVA - "hsva(,,,)"
  HSLA:       7  // UU.COLOR.HSLA - "hsla(,,,)"
};

// --- local scope ------------------------------------------------------
(function() {
var DICT =  "000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,ff00ffmagenta,880000maroon,888800olive,008800green,008888teal,000088navy,880088purple,696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,d3d3d3lightgrey,dcdcdcgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,778899lightslategray,b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,4b0082indigo,483d8bdarkslateblue,6a5acdslateblue,7b68eemediumslateblue,9370dbmediumpurple,f8f8ffghostwhite,00008bdarkblue,0000cdmediumblue,4169e1royalblue,1e90ffdodgerblue,6495edcornflowerblue,87cefalightskyblue,add8e6lightblue,f0f8ffaliceblue,191970midnightblue,00bfffdeepskyblue,87ceebskyblue,b0e0e6powderblue,2f4f4fdarkslategray,00ced1darkturquoise,afeeeepaleturquoise,f0ffffazure,008b8bdarkcyan,20b2aalightseagreen,48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamarine,e0fffflightcyan,00fa9amediumspringgreen,7cfc00lawngreen,"+
            "00ff7fspringgreen,7fff00chartreuse,adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66cdaamediumaquamarine,98fb98palegreen,f5fffamintcream,006400darkgreen,228b22forestgreen,32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolivegreen,6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet,8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorchid,ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,c71585mediumvioletred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,ffe4e1mistyrose,ff1493deeppink,db7093palevioletred,e9967adarksalmon,ffb6c1lightpink,fff0f5lavenderblush,cd5c5cindianred,f08080lightcoral,f4a460sandybrown,fff5eeseashell,dc143ccrimson,ff6347tomato,ff7f50coral,fa8072salmon,ffa07alightsalmon,ffdab9peachpuff,ffffe0lightyellow,b22222firebrick,ff4500orangered,ff8c00darkorange,ffa500orange,ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown,a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,"+
            "f0e68ckhaki,fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,eee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,ffe4c4bisque,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,f5deb3wheat,faebd7antiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory",
    PARSE = /^(?:#([\da-f]{6})|#([\da-f])([\da-f])([\da-f])|rgba?\(([\d\.]+)(%)?\s*,\s*([\d\.]+)(%)?\s*,\s*([\d\.]+)(%)?\s*(?:,\s*([\d\.]+)\s*)?\))/i; // )

/** Color Dictionary
 *
 * @class Singleton
 */
uu.Class.Singleton("ColorDictionary", {
  // uu.Class.ColorDictionary.addUserDefinitionColor
  addUserDefinitionColor: function(colors) { // JointColorString: "NamedColorString:ColorString,..."
    var c = (colors.toLowerCase().replace(/^[\s;]*|[\s;]*$/g, "")).split(";"),
        v, w, i = 0;
    while ( (v = c[i++] ) ) {
      w = v.split(":");
      UU.COLOR.DICT[w[0]] = uu.style.parseColor(w[1], UU.COLOR.NUM_ALPHA);
    }
  }
});

// --- init dict ---
(function() {
  var ary = DICT.split(","),
      v, i = 0, iz = ary.length, hex6, name, num;

  // decode UU.COLOR.DICT
  for (; i < iz; ++i) {
    v = ary[i];
    hex6 = v.slice(0, 6);       // "000000"
    name = v.slice(6);          // "black"
    num  = parseInt(hex6, 16);  // 0x000000
    UU.COLOR.DICT[name] = [num, 1];
  }
})();

uu.mix(uu.color, {
  // uu.color.parse - ColorString to ColorNumberAlphaNumberArray
  parse: function(colorString) { // ColorString:
    if (!colorString) {
      return [0, 0];
    }

    var match = PARSE.exec(colorString), r, num, alpha = 1;
    if (match) {
      if (match[1]) { // match[1] = "#ffffff"
        num = parseInt(match[1], 16);
      } else if (match[2]) { // match[2] = "f", [3] = "f", [4] = "f"
        num = parseInt([match[2], match[2],
                        match[3], match[3],
                        match[4], match[4]].join(""), 16);
      } else {
        num = (match[6]  ? ((match[5] - 0) * 255 / 100) | 0 : match[5] - 0) * 65536 +
              (match[8]  ? ((match[7] - 0) * 255 / 100) | 0 : match[7] - 0) * 256 +
              (match[10] ? ((match[9] - 0) * 255 / 100) | 0 : match[9] - 0);
        alpha = parseFloat(match[11] || 1);
      }
    } else {
      r = UU.COLOR.DICT[colorString.toLowerCase()] || [0, 2];
      num   = r[0];
      alpha = r[1];
      if (r[1] > 1) {
        throw colorString + " parse error";
      }
    }
    return [num, alpha];
    // return ColorNumberAlphaNumberArray( [ColorNumber, AlphaNumber] ):
  },

  // uu.color.build
  build: function(numAlpha,     // ColorNumberAlphaNumberArray/RGBAHash:
                  colorStyle) { // Number(default: UU.COLOR.HEX):
    colorStyle = colorStyle || 3;
    var num, alpha, rgba, h;

    if ("length" in numAlpha) {
      num = numAlpha[0];
      alpha = numAlpha[1];
      if (colorStyle >= 4) {
        rgba = { r: (num >> 16) & 0xff,
                 g: (num >> 8) & 0xff, b: num & 0xff, a: alpha };
      }
    } else {
      if (colorStyle >= 4) {
        rgba = numAlpha;
      } else {
        num = numAlpha.r * 65536 + numAlpha.g * 256 + numAlpha.b;
        alpha = numAlpha.a;
      }
    }

    switch (colorStyle) {
    case 1: // 1: // NUM_ALPHA return ColorNumberAlphaNumberArray
      return [num, alpha];
    case 2: // 2: HEX_ALPHA return HexColorStringAlphaNumberArray
      return [(0x1000000 + num).toString(16).replace(/^1/, "#"), alpha];
    case 3: // 3: HEX return HexColorString
      return (0x1000000 + num).toString(16).replace(/^1/, "#");
    case 4: // 4: RGBAHASH return RGBAHash
      return rgba;
    case 5: // 5: RGBA return RGBAColorString
      return "rgba(" + [rgba.r, rgba.g, rgba.b, rgba.a].join(",") + ")";
    case 6: // 6: HSVA return HSVAColorString
      h = uu.color.rgba2hsva(rgba);
      return "hsva(" + [((h.h * 100) | 0) / 100,
                        ((h.s * 100) | 0) / 100,
                        ((h.v * 100) | 0) / 100, h.a].join(",") + ")";
    case 7: // 7: HSLA return HSLAColorString
      h = uu.color.rgba2hsla(rgba);
      return "hsla(" + [((h.h * 100) | 0) / 100,
                        ((h.s * 100) | 0) / 100,
                        ((h.l * 100) | 0) / 100, h.a].join(",") + ")";
    }
    return [0, 0]; // ColorNumberAlphaNumberArray
  },

  // uu.color.rgba2hsva
  rgba2hsva: function(rgba) { // RGBAHash:
    var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255,
        max = Math.max(r, g, b), diff = max - Math.min(r, g, b),
        h = 0, s = max ? Math.round(diff / max * 100) : 0,
        v = Math.round(max * 100);

    if (!s) { return { h: 0, s: 0, v: v, a: rgba.a }; }

    h = (r === max) ? ((g - b) * 60 / diff) :
        (g === max) ? ((b - r) * 60 / diff + 120)
                    : ((r - g) * 60 / diff + 240);
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: rgba.a };
    // return HSVAHash( { h:360, s:100, v:100, a:1.0 } )
  },

  // uu.color.hsva2rgba
  hsva2rgba: function(hsva) { // HSVAHash:
    var h = (hsva.h === 360) ? 0 : hsva.h, s = hsva.s / 100, v = hsva.v / 100,
        a = hsva.a,
        h60 = h / 60, matrix = h60 | 0, f = h60 - matrix;

    if (!s) { h = Math.round(v * 255); return { r: h, g: h, b: h, a: a }; }

    function MATRIX() {
      var _r = Math.round, v255 = v * 255,
          p = _r((1 - s) * v255),
          q = _r((1 - (s * f)) * v255),
          t = _r((1 - (s * (1 - f))) * v255),
          w = _r(v255);
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
    return MATRIX();
    // RGBAHash( { r: 255, g: 255, b: 255, a: 1 } )
  },

  // uu.color.rgba2hsla
  rgba2hsla: function(rgba) { // RGBAHash:
    var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255,
        max = Math.max(r, g, b), min = Math.min(r, g, b),
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
    return { h: h, s: Math.round(s * 100), l: Math.round(l * 100), a: rgba.a };
    // return HSVAHash( { h:360, s:100, l:100, a:1.0 } )
  },

  // uu.color.hsla2rgba
  hsla2rgba: function(hsla) { // HSLAHash: Hash( { h: 0-360, s: 0-100, l: 0-100 } )
    var h = (hsla.h === 360) ? 0 : hsla.h, s = hsla.s / 100, l = hsla.l / 100,
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
    return { r: Math.round(r * 255), g: Math.round(g * 255),
             b: Math.round(b * 255), a: hsla.a };
    // return RGBAHash
  }
});

// uu.Class.Color factory
uu.color = function(r, g, b, a) { // see uu.Class.Color.construct
  return new uu.Class.Color(r, g, b, a);
};

/** Color
 *
 * @class
 */
uu.Class("Color", {
  // uu.Class.Color.construct - create instance, push color stack
  construct: function(r,   // RedNumber/ColorString/RGBAHash/uu.Class.Color instance/Array( mix ):
                      g,   // GreenNumber(default: undefined):
                      b,   // BlueNumber(default: undefined):
                      a) { // AlphaNumber(default: undefined):
    this._lock = 0;
    this._stack = [];
    this.push(r, g, b, a);
  },

  // uu.Class.Color.push - push color stack
  //      or RGBAHash or String("#FFF", "#FFFFFF", "rgb(...)", "rgba(...)")
  push: function(r,   // RedNumber/ColorString/RGBAHash/uu.Class.Color instance/ColorArray/JointColorString
                 g,   // GreenNumber(default: undefined):
                 b,   // BlueNumber(default: undefined):
                 a) { // AlphaNumber(default: undefined):
    var v, i, iz, c, numAlpha;
    if (r !== void 0) {
      if (r instanceof uu.Class.Color) { // stack copy
        for (i = 0, iz = r._stack.length; i < iz; ++i) {
          this._stack.push(uu.mix({}, r._stack[i])); // clone
        }
      } else {
        if (r instanceof Array) { // ColorArray( [ColorString / RGBAHash, ...] )
          for (i = 0, iz = r.length; i < iz; ++i) {
            v = r[i];
            if (typeof v === "object" && "r" in v) { // RGBAHash
              this._stack.push(v);
            } else {
              numAlpha = uu.color.parse(v);
              this._stack.push(uu.color.build(numAlpha, UU.COLOR.RGBAHASH));
            }
          }
        } else if (typeof r === "string" && r.indexOf(";") > -1) { // JointColorString( "red;blue" )
          c = (r.toLowerCase().replace(/^[\s;]*|[\s;]*$/g, "")).split(";");
          for (i = 0, iz = c.length; i < iz; ++i) {
            numAlpha = uu.color.parse(c[i]);
            this._stack.push(uu.color.build(numAlpha, UU.COLOR.RGBAHASH));
          }
        } else { // ColorString / RGBAHash
          if (typeof v === "object" && "r" in v) { // RGBAHash
            this._stack.push(v);
          } else {
            numAlpha = uu.color.parse(v); // ColorString
            this._stack.push(uu.color.build(numAlpha, UU.COLOR.RGBAHASH));
          }
        }
      }
    }
    return this; // return this
  },

  // uu.Class.Color.pop - pop color stack and unlock
  pop: function(colorStyle) { // Number(default: UU.COLOR.RGBAHASH):
    this.unlock();
    var rv = this._stack.pop() || UU.COLOR.ZERO;
    return uu.color.build(rv, colorStyle || UU.COLOR.RGBAHASH);
    // return any-types(see uu.color.build)
  },

  // uu.Class.Color.clear - clear all color stack and unlock
  clear: function() {
    this._stack = [];
    return this.unlock(); // return this
  },

  // uu.Class.Color.size - get stack size
  size: function() {
    return this._stack.length; // return Number: stack size
  },

  // uu.Class.Color.empty - is empty stack
  empty: function() {
    return !this._stack.length; // return Number: stack size
  },

  // uu.Class.Color.top - get top stack
  top: function() {
    return this.ref(this._stack.length - 1); // return RGBAHash
  },

  // uu.Class.Color.bottom - get bottom stack
  bottom: function() {
    return this.ref(0); // return RGBAHash
  },

  // uu.Class.Color.ref - refer to color stack
  ref: function(n) { // Number(default: undefined): stack number, undefined is top stack
    return this._stack[this._ref(n)] || UU.COLOR.ZERO;
  },
  _ref: function(n) {
    if (n !== void 0) { return n; }
    if (this._lock) { return this._lock - 1; }
    if (this._stack.length) { return this._stack.length - 1; }
    return 0; // empty stack
  },

  // uu.Class.Color.copy - copy top stack
  copy: function(n) { // Number(default: undefined): stack number, undefined is top stack
    this._stack.push(this.ref(n));
    return this; // return this
  },

  // uu.Class.Color.lock - lock refrence position
  lock: function() {
    this._lock = this._stack.length;
    return this; // return this
  },

  // uu.Class.Color.unlock - unlock refrence position
  unlock: function() {
    this._lock = 0;
    return this; // return this
  },

  // uu.Class.Color.forEach
  forEach: function(fn,           // Function: evaluator
                    thisArg,      // ThisObject(default: undefined):
                    colorStyle) { // Number(default: UU.COLOR.RGBAHASH):
    colorStyle = colorStyle || UU.COLOR.RGBAHASH;
    var v, i = 0, iz = this._stack.length,
        through = colorStyle === UU.COLOR.RGBAHASH;
    for(; i < iz; ++i) {
      v = through ? this._stack[i] : uu.color.build(this._stack[i], colorStyle);
      fn.call(thisArg, v, i, this);
    }
    return this; // return this
  },

  // uu.Class.Color.hexEach - forEach + hex()
  hexEach: function(fn,        // Function: evaluator
                    thisArg) { // ThisObject(default: undefined):
    return this.forEach(fn, thisArg, UU.COLOR.HEX); // return this
  },

  // uu.Class.Color.rgbaEach - forEach + rgba()
  rgbaEach: function(fn,        // Function: evaluator
                     thisArg) { // ThisObject(default: undefined):
    return this.forEach(fn, thisArg, UU.COLOR.RGBA); // return this
  },

  // uu.Class.Color.zero - push Transparent black( { r: 0, g: 0, b: 0, a: 0 } )
  zero: function() {
    this._stack.push(UU.COLOR.ZERO);
    return this; // return this
  },

  // uu.Class.Color.black - push Black( { r: 0, g: 0, b: 0, a: 1 } )
  black: function() {
    this._stack.push(UU.COLOR.BLACK);
    return this; // return this
  },

  // uu.Class.Color.white - push White( { r: 255, g: 255, b: 255, a: 1 } )
  white: function() {
    this._stack.push(UU.COLOR.WHITE);
    return this; // return this
  },

  // uu.Class.Color.hex - return HexColorString( "#ffffff" )
  hex: function(n) { // Number(default: undefined): stack number, undefined is top stack
    return uu.color.build(this.ref(n), UU.COLOR.HEX);
    // return HexColorString
  },

  // uu.Class.Color.rgba - return RGBAColorString( "rgba(0,0,0,0)" )
  rgba: function(n) { // Number(default: undefined): stack number, undefined is top stack
    return uu.color.build(this.ref(n), UU.COLOR.RGBA);
    // return RGBAColorString
  },

  // uu.Class.Color.hsva - return HSVAColorString( "hsva(0,0,0,0)" )
  hsva: function(n) { // Number(default: undefined): stack number, undefined is top stack
    return uu.color.build(this.ref(n), UU.COLOR.HSVA);
    // return HSVAColorString
  },

  // uu.Class.Color.hsla - return HSLAColorString( "hsla(0,0,0,0)" )
  hsla: function(n) { // Number(default: undefined): stack number, undefined is top stack
    return uu.color.build(this.ref(n), UU.COLOR.HSLA);
    // return HSLAColorString
  },

  // uu.Class.Color.toString - return HexColorString( "#ffffff" )
  toString: function() {
    return this.hex();
    // return HexColorString
  },

  // uu.Class.Color.tone - push arrangemented color(Hue, Saturation and Value)
  tone: function(h,   // HueNumber(default: 0): -360 to 360
                 s,   // SaturationNumber(default: 0): 0 to 100
                 v) { // ValueNumber(default: 0): 0 to 100
    h = h || 0, s = s || 0, v = v || 0;
    if (!h && !s && !v) { return this.copy(); }
    var rv = uu.color.rgba2hsva(this.ref());
    rv.h += h, rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h;
    rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
    rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
    this._stack.push(uu.color.hsva2rgba(rv));
    return this; // return this
  },

  // uu.Class.Color.complementary - push complementary-color
  complementary: function() {
    var r = this.ref();
    this._stack.push({ r: r.r ^ 0xff, g: r.g ^ 0xff, b: r.b ^ 0xff, a: r.a });
    return this; // return this
  },

  // uu.Class.Color.gray - push gray-color
  gray: function() {
    var r = this.ref();
    this._stack.push({ r: r.g, g: r.g, b: r.g, a: r.a }); // G channel method
    return this; // return this
  },

  // uu.Class.Color.sepia - push sepia-color
  sepia: function() {
    var rgba = this.ref(), rv,
        r = rgba.r, g = rgba.g, b = rgba.b,
        y = 0.2990 * r + 0.5870 * g + 0.1140 * b, u = -0.091, v = 0.056;

    r = y              + 1.4026 * v;
    g = y - 0.3444 * u - 0.7114 * v;
    b = y + 1.7330 * u             ;

    r *= 1.2;
    b *= 0.8;

    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;

    rv = { r: r | 0, g: g | 0, b: b | 0, a: rgba.a };
    this._stack.push(rv);
    return this; // return this
  }
});

})(); // end (function())() scope
