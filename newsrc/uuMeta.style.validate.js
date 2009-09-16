
// === uuMeta.style.validate ===
// depend: uuMeta, uuMeta.color, uuMeta.token
/*
uuMeta.style.validate = {
  width(value, rv = void 0) - return { width, valid }
  border(value, rv = void 0) - return { width, style, color }
  shadow(value, rv = void 0) - return { rgba, ox, oy, blur, valid }
  gradient(value, rv = void 0) - return { type, point, radius, offset, color,
                                          valid }
  background(value, rv = void 0) - return { image, repeat, position, attachment,
                                            origin, clip, rgba, valid }
  boxReflect(value, rv = void 0) - return { tl, tr, br, bl, valid }
  borderRadius(value, rv = void 0) - return { tl, tr, br, bl, valid }
}
 */
(function uuMetaStyleValidateScope() {
var _mm = uuMeta,
    _LENGTH = /^(?:[\d\.]+(%|px|em|pt|cm|mm|in|pc|px)|0)$/,
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
    _BACKGROUND_IDENT = /^(?:(-uu-gradient\(.*?\))|(none|url\(.*?\))|(repeat|no-repeat|repeat-x|repeat-y|space|round)|(scroll|fixed|local)|(border-box|padding-box|content-box)|(no-clip))$/,
    _BOX_REFECT_DIR   = /^(above|below|left|right)$/,
    _BOX_REFECT_MASK  = /^(?:(-uu-gradient\(.*?\))|(none|url\(.*?\)))$/;

  // uuMeta.style.validate.width - parse width: property
function width(value, // @param String: width value
               rv) {  // @param Hash(= void 0): result value
                      // @return Hash: {
                      //            width: "value",
                      //            valid: 1 }
  rv || (rv = {});
  rv.width = value;
  rv.valid = (_LENGTH.test(value) || value === "auto") ? 1 : 0;
  return rv;
}

// uuMeta.style.validate.border - parse border: short hand property
function border(value, // @param String: border value
                rv) {  // @param Hash(= void 0): result value
                       // @return Hash: {
                       //            width: "value",
                       //            style: "value",
                       //            rgba:  "value",
                       //            valid: 1 }
  rv || (rv = {});
  var ary = _mm.splitToken(value, " "), v, i = 0,
      width, style, rgba, r, valid = 1,
      // alias
      LENGTH = _LENGTH, WIDTH_KEYWORD = _WIDTH_KEYWORD,
      STYLE_KEYWORD = _STYLE_KEYWORD, colorParse = _mm.color.parse;

  while (valid && (v = ary[i++])) {
    if (LENGTH.test(v) || WIDTH_KEYWORD.test(v)) {
      width = v;
      continue;
    }
    if (STYLE_KEYWORD.test(v)) {
      style = v;
      continue;
    }
    r = colorParse(v, 1);
    if (r.valid) {
      rgba = r;
      continue;
    }
    valid = 0;
    break;
  }
  rv.width = width || "medium";
  rv.style = style || "none";
  rv.rgba  = rgba;
  rv.valid = valid;
  return rv;
}

// uuMeta.style.validate.shadow - parse shadow: property
//    box-shadow: <color> || <offsetX> <offsetY> <blur>, ...
//    text-shadow: <color> || <offsetX> <offsetY> <blur>, ...
function shadow(value, // @param String: -uu-box-shadow: value
                rv) {  // @param Hash(= void 0): result value
                       // @return Hash: {
                       //            rgba:  [{r,g,b,a}, ...],
                       //            ox:    ["0px", ...],
                       //            oy:    ["0px", ...],
                       //            blur:  ["0px", ...],
                       //            valid: 1 }
  rv || (rv = { rgba: [], ox: [], oy: [], blur: [] });
  var multi, ary, v, i = 0, c, rgba, ox, oy, blur, valid = 1,
      // alias
      HEAD_DIGIT = _HEAD_DIGIT,
      splitToken = _mm.splitToken,
      colorParse = _mm.color.parse;

  multi = splitToken(_mm.trim(value), ",");
  while (valid && (v = multi[i++])) {
    ary = splitToken(v, " ");

    rgba = HEAD_DIGIT.test(ary[0]) ? ary.pop() : ary.shift();
    ox    = ary.shift() || 0;
    oy    = ary.shift() || 0;
    blur  = ary.shift() || 0;

    c = colorParse(rgba, 1);
    valid = c.valid;

    rv.rgba.push(c); // rgba
    rv.ox.push(ox);
    rv.oy.push(oy);
    rv.blur.push(blur);
  }
  !rv.rgba.length && (valid = 0);
  rv.valid = valid;
  return rv;
}

// uuMeta.style.validate.gradient - parse gradient() value
//    gradient(<type>, <point> [, <radius>]?,
//                     <point> [, <radius>]? [, <stop>]*)
function gradient(value, // @param String: -uu-gradient() value
                  rv) {  // @param Hash(= void 0): result value
                         // @return Hash: {
                         //            type:  "linear" or "radial",
                         //            point:  [],
                         //            radius: [],
                         //            offset: [],
                         //            color:  [],
                         //            valid:  1 }
  rv || (rv = { type: "", point: [], radius: [], offset: [], color: [] });
  var type = 0, point = [], radius = [], from = 0, to = 0,
      offset = [], color = [], valid = 0,
      m, mm, ary, tmpary, v, w, i = 0,
      // alias
      xfloat = parseFloat,
      GRAD_TYPE   = _GRAD_TYPE,
      GRAD_POINT  = _GRAD_POINT,
      GRAD_RADIUS = _GRAD_RADIUS,
      GRAD_FROM   = _GRAD_FROM,
      GRAD_TO     = _GRAD_TO,
      GRAD_STOP   = _GRAD_STOP,
      TO_HEAD     = _TO_HEAD,
      FROM_HEAD   = _FROM_HEAD,
      STOP_HEAD   = _STOP_HEAD,
      TAIL        = _TAIL,
      SPLIT_COMMA = _SPLIT_COMMA,
      PERCENT     = _PERCENT;

  if ( (m = _HEAD_GRADIENT.exec(value)) ) {
    valid = 1;
    ary = _mm.splitToken(m[1], ",");

    while (valid && (v = ary[i++])) {
      if (GRAD_TYPE.test(v)) {
        type ? (valid = 0)
             : (type = (v === "linear") ? 1 : 2); // 1: linear, 2: radial
      } else if ( ( mm = GRAD_POINT.exec(v)) ) {
        if (point.length >= 4) {
          valid = 0;
        } else {
          point.push(mm[1] ? "0" : mm[2] ? "100%" : mm[3]);
          point.push(mm[4] ? "0" : mm[5] ? "100%" : mm[6]);
        }
      } else if ( ( mm = GRAD_RADIUS.exec(v)) ) {
        if (type !== 2 || radius.length >= 2) {
          valid = 0;
        } else {
          radius.push(xfloat(mm[1]));
        }
      } else if (GRAD_FROM.test(v)) {
        if (from) {
          valid = 0;
        } else {
          v = v.replace(FROM_HEAD, "").replace(TAIL, "");
          offset.push(0);
          color.push(v);
          from = 1;
        }
      } else if (GRAD_TO.test(v)) {
        if (to) {
          valid = 0;
        } else {
          v = v.replace(TO_HEAD, "").replace(TAIL, "");
          offset.push(1);
          color.push(v);
          to = 1;
        }
      } else if (GRAD_STOP.test(v)) {
        v = v.replace(STOP_HEAD, "").replace(TAIL, "");
        tmpary = v.split(SPLIT_COMMA);
        w = tmpary.shift();
        offset.push(PERCENT.test(w) ? xfloat(w) / 100
                                    : xfloat(w)); // "90%" -> 0.9
        color.push(tmpary.join(","));
      } else {
        // unknown token
        valid = 0;
      }
    }
  }
  if (point.length !== 4 ||
      (type === 2 && radius.length !== 2) ||
      !offset.length) {
    valid = 0;
  }

  rv.valid  = valid;
  rv.type   = (type === 1) ? "linear" :
              (type === 2) ? "radial" : "";
  rv.point  = point;    // ["0", "100%", "20", "20%"]
  rv.radius = radius;   // [radius1, radius2]
  rv.offset = offset;   // [0, ...]
  rv.color  = color;    // ["#C0FFEE", ... ]
  return rv;
}

// uuMeta.style.validate.background - parse background: short hand property
//    background("url(...) top left, blue url(...) bottom center")
function background(value, // @param String: -uu-background: value
                    rv) {  // @param Hash(= void 0): result value
                           // @return Hash: {
                           //            image: ["url(...), ...],
                           //            repeat: ["repeat", ...],
                           //            position: ["0% 0%", ...],
                           //            attachment: ["scroll", ...],
                           //            origin: ["padding", ...],
                           //            clip: ["no-clip", ...],
                           //            rgba: { r,g,b,a },
                           //            valid: 1 }
  rv || (rv = { image: [], repeat: [], position: [],
                attachment: [], origin: [], clip: [] });
  var multi, i = 0, j, iz, m, v, w, ary,
      img, rpt, att, pox, poy, ori, clp, rgba,
      valid = 1,
      // alias
      splitToken = _mm.splitToken,
      colorParse = _mm.color.parse,
      BACKGROUND_POS = _BACKGROUND_POS,
      BACKGROUND_IDENT = _BACKGROUND_IDENT;

//  multi = splitToken(value.replace(_TRIM_SPACE, " "), ",");
  multi = splitToken(_mm.clean(value), ",");
  iz = multi.length;

  while (valid && (v = multi[i++])) {
    img = rpt = pox = poy = ori = clp = "";
    ary = splitToken(_mm.trim(v), " ");

    j = 0;
    while ( (w = ary[j++]) ) {
      if ( (m = BACKGROUND_IDENT.exec(w)) ) {
        if (m[1]) { img ? (valid = 0) : (img = m[1]); } // -uu-gradient
        if (m[2]) { img ? (valid = 0) : (img = m[2]); } // url
        if (m[3]) { rpt ? (valid = 0) : (rpt = m[3]); } // repeat
        if (m[4]) { att ? (valid = 0) : (att = m[4]); } // attachment
        if (m[5]) { ori ? (valid = 0) : (ori = m[5]); } // origin
        if (m[6]) { clp ? (valid = 0) : (clp = m[6]); } // clip
        continue;
      } else if ( (m = BACKGROUND_POS.exec(w)) ) {
        poy ? (valid = 0)
            : pox ? (poy = m[1])
                  : (pox = m[1]);
        continue;
      } else if (i === iz) {
        // color is permitted in <final-bg-layer>, but not in <bg-layer>
        // http://www.w3.org/TR/css3-background/
        if (!rgba) {
          rgba = colorParse(w, 1);
          valid = rgba.valid;
          continue;
        }
      }
      // unknown token
      valid = 0;
      break;
    }
    rv.image.push(img || "none");
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

// uuMeta.style.validate.box-reflect - parse box-reflect: property
//    box-reflect: <direction> [<offset>] [<mask-box-image>]
//    <direction> ::= "above" / "below" / "left" / "right"
//    <offset> ::= length
//    <mask-box-image> ::= -uu-gradient() or url()
function boxReflect(value, // @param String: -uu-box-reflect: value
                    rv) {  // @param Hash(= void 0): result value
                           // @return Hash: {
                           //            dir:    "below",
                           //            offset: "0",
                           //            url:    "",
                           //            grad:   void 0,
                           //            valid:  1 }
  rv || (rv = {});
  var m, v, i = 0, ary = _mm.splitToken(value, ""),
      dir, off, url, grad, valid = 1,
      // alias
      LENGTH = _LENGTH,
      BOX_REFECT_DIR = _BOX_REFECT_DIR,
      BOX_REFECT_MASK = _BOX_REFECT_MASK;

  while ( valid && (v = ary[i++]) ) {
    if (BOX_REFECT_DIR.test(v)) {
      dir ? (valid = 0) : (dir = v);
      continue;
    }
    if (LENGTH.test(v)) {
      off ? (valid = 0) : (off = v);
      continue;
    }
    if ( (m = BOX_REFECT_MASK.exec(v)) ) {
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
  rv.valid  = valid;
  rv.dir    = dir;
  rv.offset = off || "0";
  rv.url    = url || "";
  rv.grad   = grad;
  return rv;
}

// uuMeta.style.validate.border-radius - parse border-radius: property
//    border-radius: <radius>{1,4} [/ <radius>{1,4}]
//    border-radius: top-left, top-right, bottom-right, bottom-left
//    border-radius: top-left, top-right, [top-left], [top-right]
function borderRadius(value, // @param String: -uu-border-radius: value
                      rv) {  // @param Hash(= void 0): result value
                             // @return Hash: {
                             //            tl: ["0px", "0px"],
                             //            tr: ["0px", "0px"],
                             //            br: ["0px", "0px"],
                             //            bl: ["0px", "0px"],
                             //            valid: 1 }
  rv || (rv = { tl: [], tr: [], br: [], bl: [] });
  var multi = value.split("/"), ary, v, i = 0, valid = 1;

  while (valid && (v = multi[i++])) {
    ary = _mm.splitSpace(v);
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

// --- initialize / export ---
_mm.mix(_mm.style.validate, {
  width: width,
  border: border,
  shadow: shadow,
  gradient: gradient,
  background: background,
  boxReflect: boxReflect,
  borderRadius: borderRadius
});

})(); // uuMeta.style.validate scope

