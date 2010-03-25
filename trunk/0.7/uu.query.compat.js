
// === jQuery Selectors ===
//{{{!depend uu, uu.query
//}}}!depend

uu.query.filters.eq || (function(win, doc, uu) {
var _HEADER = /h[1-6]/i,
    _BUTTON = /button/i,
    _INPUT  = /(?:input|textarea|select|button)/i;

uu.mix(uu.query.filters, {
    first:    [0x01, uu.query.childFilter],
    last:     [0x02, uu.query.childFilter],
    even:     [0x80, even],
    odd:      [0x81, odd],
    eq:       [0x82, eq],
    gt:       [0x83, jFilter],
    lt:       [0x84, jFilter],
    parent:   [0x85, jFilter],
    header:   [0x86, jFilter],
    input:    [0x87, jFilter],
    button:   [0x88, jFilter],
    hidden:   [0x89, jFilter],
    visible:  [0x8a, jFilter],
    selected: [0x8b, jFilter],
    text:     [0x8c, jFilter],
    password: [0x8d, jFilter],
    radio:    [0x8e, jFilter],
    checkbox: [0x8f, jFilter],
    submit:   [0x90, jFilter],
    image:    [0x91, jFilter],
    reset:    [0x92, jFilter],
    file:     [0x93, jFilter]
});

// inner -
function jFilter(fid, negate, elms, pseudo, value) {
    var rv = [], ri = -1, v, i = 0, iz = elms.length, ok, TYPE = "type";

    for(; i < iz; ++i) {
        v = elms[i];
        ok = 0;
        if (fid >= 0x8c) {
            ok = v[TYPE] === pseudo;
        } else {
            switch (fid) {
            case 0x83: ok = i >= parseInt(value) + 1; break;
            case 0x84: ok = i <= parseInt(value) - 1; break;
            case 0x85: ok = !!v.firstChild; break;
            case 0x86: ok = _HEADER.test(v.tagName); break;
            case 0x87: ok = _INPUT.test(v.tagName)  || v.type === "button"; break;
            case 0x88: ok = _BUTTON.test(v.tagName) || v.type === "button"; break;
            case 0x89: ok = (v.type === "hidden" ||  hidden(v)); break;
            case 0x8a: ok = (v.type !== "hidden" && !hidden(v)); break;
            case 0x8b: ok = !!v.selected;
            }
        }
        if (ok ^ negate) {
            rv[++ri] = v;
        }
    }
    return rv;
}

// inner -
function hidden(elm) {
    var cs = uu.ie ? elm.currentStyle
                   : win.getComputedStyle(elm, null);
    return cs.display === "none" || cs.visibility === "hidden";
}

// inner -
function even(fid, negate, elms, pseudo, value, tags, contentType) {
    var fl = uu.query.filters["nth-child"];
    return fl[1](fl[0], negate, elms, pseudo, "odd", tags, contentType);
}

// inner -
function odd(fid, negate, elms, pseudo, value, tags, contentType) {
    var fl = uu.query.filters["nth-child"];
    return fl[1](fl[0], negate, elms, pseudo, "even", tags, contentType);
}

// inner -
function eq(fid, negate, elms, pseudo, value) {
    var v, ok = 0;

    v = elms[parseInt(value)];
    if (v) {
        ok = 1;
    }
    return (ok ^ negate) ? [v] : [];
}

})(window, document, uu);

