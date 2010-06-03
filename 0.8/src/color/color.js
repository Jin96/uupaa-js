
// === uu.color / window.color ===
//#include uupaa.js

(this.uu || this).color || (function(namespace) {

namespace.color        = uucolor;       // uu.color(source:ColorHash/HSVAHash/HSLAHash/RGBAHash/String/Number):ColorHash
namespace.color.add    = uucoloradd;    // uu.color.add(source:String)
namespace.color.expire = uucolorexpire; // uu.color.expire()
namespace.color.random = uucolorrandom; // uu.color.random():ColorHash

// --- COLOR ---
// [1][ColorHash]               uu.color(ColorHash) -> ColorHash
// [2][HSVAHash]                uu.color(HSVAHash)  -> ColorHash
// [3][HSLAHash]                uu.color(HSLAHash)  -> ColorHash
// [4][RGBAHash]                uu.color(RGBAHash)  -> ColorHash
// [5][W3CNamedColor to hash]   uu.color("black")   -> ColorHash
// [6]["#000" to hash]          uu.color("#000")    -> ColorHash
// [7]["#000000" to hash]       uu.color("#000000") -> ColorHash
// [8]["rgba(,,,,) to hash]     uu.color("rgba(0,0,0,1)")         -> ColorHash
// [9]["hsla(,,,,) to hash]     uu.color("hsla(360,100%,100%,1)") -> ColorHash
// [10][number to hash]         uu.color(123)       -> ColorHash

// uu.color - parse color
function uucolor(source) { // @parem ColorHash/HSLAHash/HSVAHash/RGBAHash/String/Number: "black", "#fff", "rgba(0,0,0,0)" ...
                           // @return ColorHash:
                           // @throws Error("INVALID_COLOR")
    if (typeof source !== "string") {
        if (typeof source === "number") {
            return fixColorHash({ r: (source >> 16) & 255,
                                  g: (source >>  8) & 255,
                                  b:  source        & 255,
                                  a: 1 });
        }
        if (source.argb) {
            return source;
        }
        if ("l" in source) { // HSLAHash
            return hslaToColorHash(source);
        }
        if ("v" in source) { // HSVAHash
            return hsvaToColorHash(source);
        }
        if ("a" in source) { // RGBAHash
            return fixColorHash(source);
        }
    }

    var v, m, n = 0, r, g, b, a = 1, add = 0, rgb = 0, error = 0,
        rv = uucolor.db[source] || uucolor.cache[source] ||
             uucolor.db[++add, v = source.toLowerCase()];

    if (!rv) {
        switch ({ "#": 1, r: 2, h: 3 }[v.charAt(0)]) {
        case 1: // #fff or #ffffff
            if (!uucolor.hexFormat.test(v)) {
                break;
            }
            m = v.split("");
            switch (m.length) {
            case 4: n = parseInt(m[1]+m[1] + m[2]+m[2] + m[3]+m[3], 16); break; // #fff
            case 7: n = parseInt(v.slice(1), 16); break; // #ffffff
            case 9: n = parseInt(v.slice(3), 16); // #00ffffff
                    a = ((parseInt(v.slice(1, 3), 16) / 2.55) | 0) / 100; break;
            default:
                    ++error;
            }
            rv = { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: a, num: n };
            break;
        case 2: // rgb(,,) or rgba(,,,)
            ++rgb; // [THROUGH]
        case 3: // hsl(,,) or hsla(,,,)
            m = (rgb ? uucolor.rgbaFormat
                     : uucolor.hslaFormat).exec(
                        v.indexOf("%") < 0 ? v
                                           : v.replace(uucolor.percent,
                                                       rgb ? percent255
                                                           : percent100));
            if (m) {
                r = m[1] | 0, g = m[2] | 0, b = m[3] | 0;
                a = m[4] ? parseFloat(m[4]) : 1;
                rv = rgb ? { r: r > 255 ? 255 : r,
                             g: g > 255 ? 255 : g,
                             b: b > 255 ? 255 : b, a: a }
                         : hslaToColorHash({
                             h: r > 360 ? 360 : r,
                             s: g > 100 ? 100 : g,
                             l: b > 100 ? 100 : b, a: a });
            }
        }
    }

    if (error || !rv) {
        return new Error("INVALID_COLOR");
    }
    if (add) {
        uucolor.cache[source] = fixColorHash(rv); // add cache
    }
    return rv;
}
uucolor.db = { transparent: fixColorHash({ r: 0, g: 0, b: 0, a: 0 }) };
uucolor.cache = {};
uucolor.percent = /([\d\.]+)%/g;
uucolor.hexFormat = /^#(?:[\da-f]{3,8})$/; // #fff or #ffffff or #ffffffff
uucolor.hslaFormat = /^hsla?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // hsla(,,,)
uucolor.rgbaFormat = /^rgba?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // rgba(,,,)

// inner - fix ColorHash
function fixColorHash(c) { // @param ColorHash: source
                           // @return ColorHash:
    var num2hh = uu.hash.num2hh;

    c.num  || (c.num  = (c.r << 16) + (c.g << 8) + c.b);
    c.hex  || (c.hex  = "#" + num2hh[c.r] + num2hh[c.g] + num2hh[c.b]);
    c.rgba || (c.rgba = "rgba(" + c.r + "," + c.g + "," +
                                  c.b + "," + c.a + ")");
    // --- add methods ---
    if (!c.argb) {
        c.rgb       = ColorHashRGB;     // @return "rgb(0,0,0)"
        c.argb      = ColorHashARGB;    // @return "#ffffffff"
        c.hsva      = ColorHashHSVA;    // @return HSVAHash
        c.hsla      = ColorHashHSLA;    // @return HSLAHash
        c.gray      = ColorHashGray;    // @return ColorHash
        c.sepia     = ColorHashSepia;   // @return ColorHash
        c.comple    = ColorHashComple;  // @return ColorHash
        c.arrange   = ColorHashArrange; // @return ColorHash
        c.toString  = ColorHashToString;// @return "#000000" or "rgba(0,0,0,0)"
    }
    return c;
}

// inner - percent("100%") to number(0~255)
function percent255(_,   // @param String: "100.0%"
                    n) { // @param String: "100.0"
                         // @return Number: 0~255
    return (n * 2.555) & 255;
}

// inner - percent("100%") to number(0~100)
function percent100(_,   // @param String: "100.0%"
                    n) { // @param Number: "100.0"
                         // @return Number: 0~100
    n = n | 0;
    return n > 100 ? 100 : n;
}

// uu.color.add
function uucoloradd(source) { // @param String: "000000black,..."
    var ary = source.split(","), i = -1, v, color, num;

    while ( (v = ary[++i]) ) {
        color = v.slice(0, 6);
        num = parseInt(color, 16);

        uucolor.db[v.slice(6)] = fixColorHash({
//          rgba:   "rgba(,,,,)"
            hex:    "#"   + color,      // "#ffffff"
            num:     num,               // 0xffffff
            r:       num >> 16,         // 0 - 255
            g:      (num >> 8) & 0xff,  // 0 - 255
            b:       num       & 0xff,  // 0 - 255
            a:      1                   // 0.0 - 1.0
        });
    }
}

// uu.color.expire - expire color cache
function uucolorexpire() {
    uucolor.cache = {};
}

// ColorHash.toString - "#000000" or "rgba(0,0,0,0)"
function ColorHashToString() { // @return String: "#000000" or "rgba(0,0,0,0)"
    return uu.ready.color.rgba ? this.rgba : this.hex;
}

// ColorHash.argb - "#ffffffff"
function ColorHashARGB() { // @return String: "#ffffffff"
    var num2hh = uu.hash.num2hh;

    return "#" + num2hh[(this.a * 255) & 0xff] +
                 num2hh[this.r] + num2hh[this.g] + num2hh[this.b];
}

// ColorHash.rgb - "rgb(0,0,0)"
function ColorHashRGB() { // @return String: "rgb(0,0,0)"
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
}

// ColorHash.gray - gray color (G channel method)
function ColorHashGray() { // @return ColorHash:
    return fixColorHash({ r: this.g, g: this.g, b: this.g, a: this.a });
}

// ColorHash.sepia - sepia color
function ColorHashSepia() { // @return ColorHash:
    var r = this.r, g = this.g, b = this.b,
        y = 0.2990 * r + 0.5870 * g + 0.1140 * b,
        u = -0.091,
        v = 0.056;

    r = y + 1.4026 * v;
    g = y - 0.3444 * u - 0.7114 * v;
    b = y + 1.7330 * u;
    r *= 1.2;
    b *= 0.8;
    return fixColorHash({ r: r < 0 ? 0 : r > 255 ? 255 : r | 0,
                          g: g < 0 ? 0 : g > 255 ? 255 : g | 0,
                          b: b < 0 ? 0 : b > 255 ? 255 : b | 0, a: this.a });
}

// ColorHash.comple - complementary color
function ColorHashComple() { // @return ColorHash:
    return fixColorHash({ r: this.r ^ 255, g: this.g ^ 255,
                          b: this.b ^ 255, a: this.a });
}

// ColorHash.arrange - arrangemented color(Hue, Saturation and Value)
//    Hue is absolure value,
//    Saturation and Value is relative value.
function ColorHashArrange(h,   // @param Number(= 0): Hue (-360~360)
                          s,   // @param Number(= 0): Saturation (-100~100)
                          v) { // @param Number(= 0): Value (-100~100)
                               // @return ColorHash:
    var rv = this.hsva();

    rv.h += h;
    rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h;

    rv.s += s;
    rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;

    rv.v += v;
    rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;

    return hsvaToColorHash(rv);
}

// ColorHash.hsva
function ColorHashHSVA() { // @return HSVAHash: { h:360, s:100, v:100, a:1.0 }
    var r = this.r / 255,
        g = this.g / 255,
        b = this.b / 255,
        max = (r > g && r > b) ? r : g > b ? g : b,
        min = (r < g && r < b) ? r : g < b ? g : b,
        diff = max - min,
        h = 0,
        s = max ? ((diff / max * 100) + 0.5) | 0 : 0,
        v = ((max * 100) + 0.5) | 0;

    if (s) {
        h = (r === max) ? ((g - b) * 60 / diff) :
            (g === max) ? ((b - r) * 60 / diff + 120)
                        : ((r - g) * 60 / diff + 240);
    }
    return {
        h:  (h < 0) ? h + 360 : h,
        s:  s,
        v:  v,
        a:  this.a,
        toString: HSVAHashToString
    };
}

// HSVAHash.toString
function HSVAHashToString() {
    return "hsva(" + (this.h | 0) + "," + this.s + "%," + this.v + "%," + this.a + ")";
}

// hsvaToColorHash
function hsvaToColorHash(hsva) { // @param HSVAHash:
                                 // @return ColorHash:
    var r = 0,
        g = 0,
        b = 0,
        h = (hsva.h >= 360) ? 0 : hsva.h,
        s = hsva.s * 0.01,
        v = hsva.v * 2.55,
        f, p, q, t, w;

    h = h / 60;
    f = h - (h | 0);

    if (s) {
        p = (((1 - s)             * v) + 0.5) | 0;
        q = (((1 - (s * f))       * v) + 0.5) | 0;
        t = (((1 - (s * (1 - f))) * v) + 0.5) | 0;
        w = (                       v  + 0.5) | 0;

        switch (h | 0) {
        case 0: r = w; g = t; b = p; break;
        case 1: r = q; g = w; b = p; break;
        case 2: r = p; g = w; b = t; break;
        case 3: r = p; g = q; b = w; break;
        case 4: r = t; g = p; b = w; break;
        case 5: r = w; g = p; b = q;
        }
    } else {
        r = g = b = (v + 0.5) | 0;
    }
    return fixColorHash({ r: r, g: g, b: b, a: hsva.a });
}

// ColorHash.hsla
function ColorHashHSLA() { // @return HSLAHash: { h, s, l, a }
    var r = this.r / 255,
        g = this.g / 255,
        b = this.b / 255,
        max = (r > g && r > b) ? r : g > b ? g : b, // Math.max(r, g, b),
        min = (r < g && r < b) ? r : g < b ? g : b, // Math.min(r, g, b),
        diff = max - min,
        h = 0, s = 0, l = (min + max) * 0.5;

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
    return {
        h:  h,
        s:  (s * 100 + 0.5) | 0, // Math.round(s * 100)
        l:  (l * 100 + 0.5) | 0, // Math.round(l * 100)
        a:  this.a,
        toString: HSLAHashToString
    };
}

// HSLAHash.toString
function HSLAHashToString() {
    return "hsla(" + (this.h | 0) + "," + this.s + "%," + this.l + "%," + this.a + ")";
}

// hslaToColorHash - ( h: 0-360, s: 0-100%, l: 0-100%, a: alpha )
function hslaToColorHash(hsla) { // @param HSLAHash:
                                 // @return ColorHash:
    var h = (hsla.h === 360) ? 0 : hsla.h,
        s = hsla.s / 100,
        l = hsla.l / 100,
        r, g, b, s1, s2, l1, l2;

    if (h < 120) {
        r = (120 - h) / 60;
        g = h / 60;
        b = 0;
    } else if (h < 240) {
        r = 0;
        g = (240 - h) / 60;
        b = (h - 120) / 60;
    } else {
        r = (h - 240) / 60;
        g = 0;
        b = (360 - h) / 60;
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
    return fixColorHash({ r: ((r * 255) + 0.5) | 0,
                          g: ((g * 255) + 0.5) | 0,
                          b: ((b * 255) + 0.5) | 0,
                          a: hsla.a });
}

// uu.color.random
function uucolorrandom() { // @return ColorHash:
    return uucolor((Math.random() * 0xffffff) | 0);
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
"tiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory,a9a9a9da" +
"rkgrey,2f4f4fdarkslategrey,696969dimgrey,808080grey,d3d3d3lightgrey,778899l" +
"ightslategrey,708090slategrey,8b4513saddlebrown");

})(this.uu || this);

