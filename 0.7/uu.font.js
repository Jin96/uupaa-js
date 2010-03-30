// === font ===
//{{{!depend uu
//}}}!depend

uu.font || (function(win, doc, uu) {

var _BASE_STYLE = "position:absolute;border:0 none;margin:0;padding:0;";

uu.font = {
    parse:      fontparse,      // uu.font.parse(font, embase) -> Hash
    detect:     fontdetect,     // uu.font.detect(node) -> String("Alial")
    metric:     fontmetric,     // uu.font.text(font, text) -> { w, h }
    ready:      fontready,      // uu.font.ready(fonts) -> Array
    SCALE:      {
//{{{!mb
        ARIAL: 1.55, "ARIAL BLACK": 1.07, "COMIC SANS MS": 1.15,
        "COURIER NEW": 1.6, GEORGIA: 1.6, "LUCIDA GRANDE": 1,
        "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
        "TREBUCHET MS": 1.55, VERDANA: 1.4,
        "MS UI GOTHIC": 2, "MS PGOTHIC": 2, MEIRYO: 1,
//}}}!mb
        "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1, FANTASY: 1, CURSIVE: 1
    }
};

// uu.font.parse - parse CSS::font style
//ja                CSS スタイルのフォント文字列をパースする
function fontparse(font,     // @param String: font string, "12pt Arial"
                   embase) { // @param Node: The em base node
                             // @return Hash:
    // inner - measure em unit
    function _em(node) {
        var rv, div = node.appendChild(uu.node());

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
        style = uu.node().style; // dummy element
        try {
            style.font = font; // parse
        } catch (err) {
            throw err;
        }
        fontSize = style.fontSize; // get font-size

        rv.size = fontparse._sizes[fontSize];
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
        rv.style = style.fontStyle; // normal, italic, oblique
        rv.weight = style.fontWeight; // normal, bold, bolder, lighter, 100~900
        rv.variant = style.fontVariant; // normal, small-caps
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
fontparse._sizes = {
    "xx-small": 0.512,
    "x-small":  0.64,
    smaller:    0.8,
    small:      0.8,
    medium:     1,
    large:      1.2,
    larger:     1.2,
    "x-large":  1.44,
    "xx-large": 1.728
};

// uu.font.detect - detect the rendering font
//ja                レンダリングに使用されているフォントを特定する
function fontdetect(node) { // @param Node:
                            // @return String: detected font, eg: "serif"
    var fam = uu.style.quick(node).fontFamily,
        ary = uu.split.token(fam, ","), v, i = -1,
        a, b = fontmetric("72pt " + fam);

    while ( (v = ary[++i]) ) {
        a = fontmetric("72pt " + v);
        if (a.w === b.w && a.h === b.h) {
            return v; // match
        }
    }
    return "";
}

// uu.font.metric - measure text rect(width, height)
//ja                レンダリング時の幅と高さを返す
function fontmetric(font,   // @param CSSFronString: "12pt Arial"
                    text) { // @param String(= "aABCDEFGHIJKLMm"):
                            // @return Hash: { w, h }
    var node = fontmetric._node;

    if (!node) {
        fontmetric._node = node = uu.node();
        node.style.cssText = _BASE_STYLE +
            "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
        doc.body.appendChild(node);
    }
    node.style.font = font;
    node[uu.gecko ? "textContent"
                  : "innerText"] = text || "aABCDEFGHIJKLMm";
    return { w: node.offsetWidth,
             h: node.offsetHeight };
}
fontmetric._node = 0; // [lazy] measure node

// uu.font.ready - enum usable font
//ja               レンダリングに利用可能なフォントを列挙する
function fontready(fonts) { // @param FontNameArray: ["Arial", "Times New Roman", "UnknownFontName"]
                            // @return Array: ["Arial", "Times New Roman"]
    var rv = [], i = 0, iz = fonts.length, a, b;

    for (; i < iz; ++i) {
        a = fontmetric("72pt dummy");
        b = fontmetric("72pt " + fonts[i]);

        if (a.w !== b.w || a.h !== b.h) {
            rv.push(fonts[i]);
        }
    }
    return rv;
}

})(window, document, uu);

