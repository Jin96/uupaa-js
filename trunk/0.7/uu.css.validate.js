
// === CSS Validator ===
// depend: uu.js, uu.color.js, uu.str.js
uu.agein || (function(uu) {
var _LENGTH = /^(?:[\d\.]+(%|px|em|pt|cm|mm|in|pc|px)|0)$/,
    _HEAD_DIGIT = /^\d/,
    _WIDTH_KEYWORD = /^(?:thin|medium|thick)$/,
    _STYLE_KEYWORD = /^(?:none|dotted|dashed|solid|double|groove|ridge|inset|outset)$/,
    _HEAD_GRADIENT = /^-uu-gradient\((.*)\)$/,
    _GRAD_TYPE   = /^\s*(linear|radial)$/,
    _GRAD_POINT  = /^\s*(?:(left)|(right)|([\d\.]+%?))\s+(?:(top)|(bottom)|([\d\.]+%?))$/,
    _GRAD_RADIUS = /^\s*([\d\.]+)$/,
    _GRAD_FROM   = /^\s*from/,
    _GRAD_TO     = /^\s*to/,
    _GRAD_STOP   = /^\s*color-stop/,
    _TO_HEAD     = /\s*to\(\s*/,
    _FROM_HEAD   = /\s*from\(\s*/,
    _STOP_HEAD   = /\s*color-stop\(\s*/,
    _TAIL        = /\s*\)$/,
    _SPLIT_COMMA = /\s*,\s*/,
    _PERCENT     = /%$/,
    _BACKGROUND_POS   = /^([\d\.]+(%|px|em|pt|cm|mm|in|pc|px)|left|center|right|top|bottom|0)$/,
    _BACKGROUND_IDENT = /^(?:(-uu-canvas\(.*?\))|(-uu-gradient\(.*?\))|(none|url\(.*?\))|(repeat|no-repeat|repeat-x|repeat-y|space|round)|(scroll|fixed|local)|(border-box|padding-box|content-box)|(no-clip))$/,
    _BOX_REFLECT_DIR  = /^(above|below|left|right)$/,
    _BOX_REFLECT_MASK = /^(?:(-uu-gradient\(.*?\))|(none|url\(.*?\)))$/;

uu.css.validate = {
    width:        width,        // width(value) - return { width, valid }
    border:       border,       // border(value) - return { width, style, color }
    shadow:       shadow,       // shadow(value) - return { rgba, ox, oy, blur, valid }
    gradient:     gradient,     // gradient(value) - return { type, point, radius, offset, color, valid }
    background:   background,   // background(value) - return { image, repeat, position, attachment,
                                //                              origin, clip, rgba, valid }
    boxReflect:   boxReflect,   // boxReflect(value) - return { tl, tr, br, bl, valid }
    borderRadius: borderRadius  // borderRadius(value) - return { tl, tr, br, bl, valid }
};

// uu.css.validate.width - parse width: property
function width(value) { // @param String: width value
                        // @return Hash: { width, valid }
                        //      width - String: "value"
                        //      valid - Number: 0 or 1
    return {
        width: value,
        valid: (_LENGTH.test(value) || value === "auto") ? 1 : 0
    };
}

// uu.css.validate.border - parse border: short hand property
function border(value) { // @param String: border value
                         // @return Hash: { width, style, rgba, valid }
                         //     width - String: "value"
                         //     style - String: "value"
                         //     rgba  - String: "value"
                         //     valid - Number: 0 or 1
    var ary = uu.split.token(value, " "), v, i = -1,
        width, style, rgba, r, valid = 1;

    while (valid && (v = ary[++i])) {
        if (_LENGTH.test(v) || _WIDTH_KEYWORD.test(v)) {
            width = v;
            continue;
        }
        if (_STYLE_KEYWORD.test(v)) {
            style = v;
            continue;
        }
        r = uu.color(v);
        if (r) {
            rgba = r;
            continue;
        }
        valid = 0;
        break;
    }
    return { width: width || "medium", style: style || "none",
             rgba: rgba, valid: valid };
}

// uu.css.validate.shadow - parse shadow: property
//    box-shadow: <color> || <offsetX> <offsetY> <blur>, ...
//    text-shadow: <color> || <offsetX> <offsetY> <blur>, ...
function shadow(value) { // @param String: -uu-box-shadow: value
                         // @return Hash: { rgba, ox, oy, blur, valid }
                         //     rgba  - Array: [ColorHash, ...]
                         //     ox    - Array: ["0px", ...]
                         //     oy    - Array: ["0px", ...]
                         //     blur  - Array: ["0px", ...]
                         //     valid - Number: 0 or 1
    var rv = { rgba: [], ox: [], oy: [], blur: [] },
        multi, ary, v, i = -1, c, rgba, ox, oy, blur, valid = 1;

    multi = uu.split.token(uu.trim(value), ",");

    while (valid && (v = multi[++i])) {
        ary = uu.split.token(v, " ");

        rgba = _HEAD_DIGIT.test(ary[0]) ? ary.pop() : ary.shift();
        ox   = ary.shift() || 0;
        oy   = ary.shift() || 0;
        blur = ary.shift() || 0;

        c = uu.color(rgba);
        valid = !!c; // 0 is invalid color

        rv.rgba.push(c); // rgba
        rv.ox.push(ox);
        rv.oy.push(oy);
        rv.blur.push(blur);
    }
    !rv.rgba.length && (valid = 0);
    rv.valid = valid;
    return rv;
}

// uu.css.validate.gradient - parse gradient() value
//    gradient(<type>, <point> [, <radius>]?,
//                     <point> [, <radius>]? [, <stop>]*)
function gradient(value) { // @param String: -uu-gradient() value
                           // @return Hash: { type, point, radius, offset, color, valid }
                           //     type   - String: "linear" or "radial"
                           //     point  - Array:  ["0", "100%", "20", "20%"]
                           //     radius - Array:  [radius1, radius2]
                           //     offset - Array:  [0, ...]
                           //     color  - Array:  ["#C0FFEE", ... ]
                           //     valid  - Number: 0 or 1
    var type = 0, point = [], radius = [], from = 0, to = 0,
        offset = [], color = [], valid = 0,
        m, m2, ary, tmpary, v, w, i = -1;

    m = _HEAD_GRADIENT.exec(value);
    if (m) {
        valid = 1;
        ary = uu.split.token(m[1], ",");

        while (valid && (v = ary[++i])) {
            if (_GRAD_TYPE.test(v)) {
                type ? (valid = 0)
                     : (type = (v === "linear") ? 1 : 2); // 1: linear, 2: radial
            } else {
                m2 = _GRAD_POINT.exec(v);
                if (m2) {
                    if (point.length >= 4) {
                        valid = 0;
                    } else {
                        point.push(m2[1] ? "0" : m2[2] ? "100%" : m2[3]);
                        point.push(m2[4] ? "0" : m2[5] ? "100%" : m2[6]);
                    }
                } else {
                    m2 = _GRAD_RADIUS.exec(v);
                    if (m2) {
                        if (type !== 2 || radius.length >= 2) {
                            valid = 0;
                        } else {
                            radius.push(parseFloat(m2[1]));
                        }
                    } else if (_GRAD_FROM.test(v)) {
                        if (from) {
                            valid = 0;
                        } else {
                            v = v.replace(_FROM_HEAD, "").replace(_TAIL, "");
                            offset.push(0);
                            color.push(v);
                            from = 1;
                        }
                    } else if (_GRAD_TO.test(v)) {
                        if (to) {
                            valid = 0;
                        } else {
                            v = v.replace(_TO_HEAD, "").replace(_TAIL, "");
                            offset.push(1);
                            color.push(v);
                            to = 1;
                        }
                    } else if (_GRAD_STOP.test(v)) {
                        v = v.replace(_STOP_HEAD, "").replace(_TAIL, "");
                        tmpary = v.split(_SPLIT_COMMA);
                        w = tmpary.shift();
                        offset.push(_PERCENT.test(w) ? parseFloat(w) / 100
                                                     : parseFloat(w)); // "90%" -> 0.9
                        color.push(tmpary.join(","));
                    } else {
                        // unknown token
                        valid = 0;
                    }
                }
            }
        }
    }
    if (point.length !== 4
        || (type === 2 && radius.length !== 2)
        || !offset.length) {
        valid = 0;
    }
    return { type: (type === 1) ? "linear" : (type === 2) ? "radial" : "",
             point: point, radius: radius,
             offset: offset, color: color, valid: valid };
}

// uu.css.validate.background - parse background: short hand property
//    background("url(...) top left, blue url(...) bottom center")
function background(value) { // @param String: -uu-background: value
                             // @return Hash: { image, repeat, position, attachment,
                             //                 origin, clip, rgba, valid }
                             //     image     - Array: ["url(...), ...]
                             //     repeat    - Array: ["repeat",  ...]
                             //     position  - Array: ["0% 0%",   ...]
                             //     attachment- Array: ["scroll",  ...]
                             //     origin    - Array: ["padding", ...]
                             //     clip      - Array: ["no-clip", ...]
                             //     rgba      - ColorHash:
                             //     valid     - Number: 0 or 1
    var rv = { image: [], repeat: [], position: [],
               attachment: [], origin: [], clip: [] },
        multi, i = -1, j, finalLayer, m, v, w, ary,
        img, rpt, att, pox, poy, ori, clp, rgba, valid = 1;

    multi = uu.split.token(uu.trim.inner(value), ",");
    finalLayer = multi.length - 1; // final-bg-layer

    while (valid && (v = multi[++i])) {
        img = rpt = pox = poy = ori = clp = "";
        ary = uu.split.token(uu.trim(v), " ");

        j = -1;
        while ( (w = ary[++j]) ) {
            m = _BACKGROUND_IDENT.exec(w);
            if (m) {
                if (m[1]) { img ? (valid = 0) : (img = m[1]); } // -uu-canvas
                if (m[2]) { img ? (valid = 0) : (img = m[2]); } // -uu-gradient
                if (m[3]) { img ? (valid = 0) : (img = m[3]); } // url
                if (m[4]) { rpt ? (valid = 0) : (rpt = m[4]); } // repeat
                if (m[5]) { att ? (valid = 0) : (att = m[5]); } // attachment
                if (m[6]) { ori ? (valid = 0) : (ori = m[6]); } // origin
                if (m[7]) { clp ? (valid = 0) : (clp = m[7]); } // clip
                continue;
            } else {
                m = _BACKGROUND_POS.exec(w);
                if (m) {
                    poy ? (valid = 0)
                        : pox ? (poy = m[1])
                              : (pox = m[1]);
                    continue;
                } else if (i === finalLayer) {
                    // color is permitted in <final-bg-layer>, but not in <bg-layer>
                    // http://www.w3.org/TR/css3-background/
                    if (!rgba) {
                        rgba = uu.color(w);
                        valid = !!rgba;
                        continue;
                    }
                }
            }
            // unknown token
            valid = 0;
            break;
        }
        rv.image.push(img || "none"); // "-uu-canvas(...)" or "-uu-gradient(...)" or "url(...)"
        rv.repeat.push(rpt || "repeat");
        rv.attachment.push(att || "scroll");
        rv.position.push((pox || "0%") + " " + (poy || "0%"));
        rv.origin.push(ori || "padding-box");
        rv.clip.push(clp || "no-clip");
    }
    rv.rgba = rgba || { r: 0, g: 0, b: 0, a: 0 }; // color
    rv.valid = valid; // valid
    return rv;
}

// uu.css.validate.box-reflect - parse box-reflect: property
//    box-reflect: <direction> [<offset>] [<mask-box-image>]
//    <direction> ::= "above" / "below" / "left" / "right"
//    <offset> ::= length
//    <mask-box-image> ::= -uu-gradient() or url()
function boxReflect(value) { // @param String: -uu-box-reflect: value
                             // @return Hash: { dir, offset, url, grad, valid }
                             //     dir    - String: "below"
                             //     offset - String: "0"
                             //     url    - String: ""
                             //     grad   - Hash:   { type, point, radius, offset, color, valid }
                             //     valid  - Number: 0 or 1
    var m, v, i = -1, ary = uu.split.token(value, ""),
        dir, off, url, grad, valid = 1;

    while ( valid && (v = ary[++i]) ) {
        if (_BOX_REFLECT_DIR.test(v)) {
            dir ? (valid = 0) : (dir = v);
            continue;
        }
        if (_LENGTH.test(v)) {
            off ? (valid = 0) : (off = v);
            continue;
        }
        m = _BOX_REFLECT_MASK.exec(v);
        if (m) {
            if (m[1]) { (grad || url) ? (valid = 0) : (grad = m[1]); } // gradient
            if (m[2]) { (grad || url) ? (valid = 0) : (url  = m[2]); } // url
            continue;
        }
        // unknown token
        valid = 0;
        break;
    }

    if (valid && grad) {
        grad = gradient(grad);
        if (!grad.valid || !grad.type) {
            valid = 0;
        }
    }
    return { dir: dir, offset: off || "0", url: url || "",
             grad: grad, valid: valid };
}

// uu.css.validate.border-radius - parse border-radius: property
//    border-radius: <radius>{1,4} [/ <radius>{1,4}]
//    border-radius: top-left, top-right, bottom-right, bottom-left
//    border-radius: top-left, top-right, [top-left], [top-right]
function borderRadius(value) { // @param String: -uu-border-radius: value
                               // @return Hash: { tl, tr, br, bl, valid }
                               //     tl    - Array:  ["0px", "0px"]
                               //     tr    - Array:  ["0px", "0px"]
                               //     br    - Array:  ["0px", "0px"]
                               //     bl    - Array:  ["0px", "0px"]
                               //     valid - Number: 0 or 1
    var rv = { tl: [], tr: [], br: [], bl: [] },
        multi = value.split("/"), ary, v, i = -1, valid = 1;

    while (valid && (v = multi[++i])) {
        ary = uu.split(v);
        switch (ary.length) {
        case 1: rv.tl.push(ary[0]);
                rv.tr.push(ary[0]);
                rv.br.push(ary[0]);
                rv.bl.push(ary[0]);
                break;
        case 2: rv.tl.push(ary[0]);
                rv.tr.push(ary[1]);
                rv.br.push(ary[0]);
                rv.bl.push(ary[1]);
                break;
        case 3: rv.tl.push(ary[0]);
                rv.tr.push(ary[1]);
                rv.br.push(ary[2]);
                rv.bl.push(ary[1]); // bottom-left = top-right
                break;
        case 4: rv.tl.push(ary[0]);
                rv.tr.push(ary[1]);
                rv.br.push(ary[2]);
                rv.bl.push(ary[3]);
                break;
        default:valid = 0;
        }
    }
    if (!rv.tl.length || rv.tl.length > 2) {
        valid = 0;
    }
    rv.valid = valid;
    return rv;
}

})(uu);

