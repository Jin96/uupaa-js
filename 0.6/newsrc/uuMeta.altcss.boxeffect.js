
// === uuMeta.altcss.boxeffect ===
// depend: uuMeta.altcss
(function uuMetaAltCSSBoxEffectScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _math = Math,
    _ie = _ua.ie,
    _ie67 = _ua.ie67,
    _uids = {}, // { uid: node, ... }
    _FLY_WEIGHT = _ua.ie6 && (window.UUALTCSS_FLY_WEIGHT ||
                              window.UUALTCSS_FLY_WEIGHT === void 0),
    _URL = /^\s*url\((.*)\)$/,
    _QUOTE = /^\s*[\"\']?|[\"\']?\s*$/g,
    _UU_GRADIENT = /^\s*-uu-gradient/,
    _MBG = /-uu-background(-image|-repeat|-position|-color|-attachment|-clip|-origin|-size|-break)?/g,
    _MBG_CASE = { "-image": 2, "-repeat": 2, "-position": 2, "-color": 2 },
    _BACKGROUND_REPEAT = { "no-repeat": 1, "repeat-x": 2, "repeat-y": 2 },
    _BACLGROUND_POSITION_H = { left: "0%", center: "50%", right: "100%" },
    _BACLGROUND_POSITION_V = { top: "0%", center: "50%", bottom: "100%" };

// uuMeta.altcss.boxeffect
function boxeffect(node, excss) {
  var view = node.parentNode,
      vs = _ie ? view.currentStyle : getComputedStyle(view, null),
      ns = _ie ? node.currentStyle : getComputedStyle(node, null),
      uid = _mm.node.id(node), m, mbgsh = 0,
      bfx, hash, canvas, nw, nh,
      viw = view.style.width,
      vih = view.style.height,
      decl, declw = -1, declh = -1,
      setExStyle = _mm.altcss.setExStyle,
      MBG = _MBG, MBG_CASE = _MBG_CASE;

  if (vs.display === "none" || ns.display === "none") {
    return;
  }

  _uids[uid] = node;

  _ie67 && fixIELayoutBug(view, node, vs, ns);

  bfx = fxbond(node, excss);

  setExStyle(node, "-uu-box-effect",    bfx.decl["-uu-box-effect"] || "auto");
  setExStyle(node, "-uu-box-shadow",    bfx.decl["-uu-box-shadow"]);
  setExStyle(node, "-uu-box-reflect",   bfx.decl["-uu-box-reflect"]);
  setExStyle(node, "-uu-border-radius", bfx.decl["-uu-border-radius"]);
  _mm.mix(bfx.margin, _mm.style.getMarginSize(bfx.node));
  trainBorder(bfx);
  _ie67 && trainFakeBorder(bfx);

  while ( (m = MBG.exec(bfx.order)) ) {
    if ((!m[1] && !mbgsh++) || MBG_CASE[m[1]]) {
      setExStyle(node, m[0], bfx.decl[m[0]]);
    }
  }
  trainMBG(bfx);

  if (bfx.boxreflect.render) {
    hash = bfx.boxreflect;
    if (hash.dir === "below") {
      if (node.tagName === "IMG") {
        // delay loader
        _mm.image.load(node.src, function(img, state, dim) {
          if (state === 1) {
            bfx.layer = new uuLayer(view, dim.w, dim.h * 2 + hash.offset);
            // http://d.hatena.ne.jp/uupaa/20090822
            bfx.nodeOffset = _mm.style.getOffsetFromAncestor(bfx.node, view);
            bfx.layer.createReflectionLayer(
                "reflect", node, 0,
                node.offsetLeft + (_ie67 ? bfx.border.l : 0),
                node.offsetTop  + (_ie67 ? bfx.border.t : 0),
                0, 0, void 0, 0, hash.offset);
            node.style.visibility = "hidden";
            bfx.hasReflectLayer = 1;
          }
        });
      }
    }
  } else {
    canvas = "vmlcanvas";
    if (_ie && _mm.feature.slver &&
        bfx.decl["-uu-canvas-type"] === "sl") {
      bfx.slmode = 1; // Silverlight mode(buggy)
      canvas = "canvas";
    }

    // get declaration value("auto" or "200px"),
    // The computed value cannot be used.
    if ( !(decl = _mm.altcss.getDeclaredValues(view)) ) {
      decl = { order: "" };
    }

    if (viw && viw !== "auto") {
      declw = viw;
    } else if (decl.order.indexOf("width,") >= 0) {
      declw = decl.decl.width;
    }
    if (vih && vih !== "auto") {
      declh = vih;
    } else if (decl.order.indexOf("height,") >= 0) {
      declh = decl.decl.height;
    }
    // "auto" -> -1, "300px" -> 300
    declw = (declw === "auto") ? -1 : parseInt(declw);
    declh = (declh === "auto") ? -1 : parseInt(declh);

    // http://d.hatena.ne.jp/uupaa/20090822
    bfx.layer = new uuLayer(view, declw, declh, { HIDDEN: 0 });
    bfx.nodebgLayer = bfx.layer.createLayer("nodebg", canvas, 0, 1,
                                            bfx.nodeRect.w, bfx.nodeRect.h);
    // http://d.hatena.ne.jp/uupaa/20090822
    // [1] calc viewbg dimension
    bfx.nodeOffset = _mm.style.getOffsetFromAncestor(bfx.node, view);
    nw = bfx.nodeRect.w + bfx.nodeOffset.x * 2;
    nh = bfx.nodeRect.h + bfx.nodeOffset.y * 2;
    // [2] set viewbg dimension
    bfx.viewbgLayer = bfx.layer.createLayer("viewbg", canvas, 0, 1,
                                            _math.max(bfx.viewRect.w, nw),
                                            _math.max(bfx.viewRect.h, nh));
    bfx.layer.appendLayer("node", node);
  }

  if (bfx.slmode) {
    uuCanvas.ready(function() {
      boxeffectDraw(bfx, 0);
    });
  } else {
    boxeffectDraw(bfx, 0);
  }
}

// uuMeta.altcss.boxeffect.bond
function fxbond(node,    // @param Node:
                excss) { // @param excss:
                         // @return Hash:
  if (!("uuAltCSSBoxEffect" in node)) {
    var view = node.parentNode;

    node.uuAltCSSBoxEffect = {
      decl:         excss.decl,
      order:        excss.order,
      view:         view,
      node:         node,
      layer:        0,
      nodebgLayer:  0,
      viewbgLayer:  0,
      hasReflectLayer: 0,
      slmode:       0, // 1 = Silverlight mode
      viewRect:     _mm.style.getSize(view),
      nodeRect:     _mm.style.getSize(node),
      nodeOffset:   0, // lazy
      train:        { margin: 0, border: 0, mbg: 0 }, // 1: retrain
      margin:       { t: 0, l: 0, r: 0, b: 0, w: 0, h: 0 },
      border:       { render: 0, shorthand: 0,
                      t: 0, l: 0, r: 0, b: 0, w: 0, h: 0,
                      tc: ["#000000", 0] },
      mbg:          { render: 0,
                      type: [],
                      image: ["none"],
                      repeat: ["repeat"],
                      position: ["0% 0%"],
                      attachment: ["scroll"],
                      origin: ["padding"],
                      clip: ["no-clip"],
                      rgba: { r: 0, g: 0, b: 0, a: 0 },
                      altcolor: _mm.style.getBackgroundColor(node, 1, 1),
                      grad: [],
                      imgobj: [],
                      timerid: -1 },
      bradius:      { render: 0, shorthand: 0, r: [0, 0, 0, 0] },
      boxshadow:    { render: 0, rgba: 0, ox: 0, oy: 0, blur: 0 },
      boxreflect:   { render: 0, dir: 0, offset: 0, url: 0,
                      grad: { render: 0 } },
      boxeffect:    { render: 0 }
    };
  }
  return node.uuAltCSSBoxEffect;
};

// uuMeta.altcss.boxeffect.recalc
function fxrecalc() {
  var uid, view, bfx, vs, ns;

  for (uid in _uids) {
    node = _uids[uid];
    view = node.parentNode;

    vs = _ie ? view.currentStyle : getComputedStyle(view, null);
    ns = _ie ? node.currentStyle : getComputedStyle(node, null);

    if (vs.display === "none" || ns.display === "none") {
      continue;
    }

    bfx = node.uuAltCSSBoxEffect;
    boxeffectRecalcRect(node, bfx);
    // improvement of response time
    (function(arg) {
      setTimeout(function() {
        boxeffectDraw(arg, 1);
      }, 0);
    })(bfx);
  }
};

function train(bfx) {
  if (bfx.train.margin || bfx.train.border) {
    bfx.train.margin && _mm.mix(bfx.margin, _mm.style.getMarginSize(bfx.node));
    bfx.train.border && trainBorder(bfx);
    _ie67 && trainFakeBorder(bfx);
    bfx.train.margin = 0;
    bfx.train.border = 0;
  }
  if (bfx.train.mbg) {
    trainMBG(bfx);
    bfx.train.mbg = 0;
  }
}

function boxeffectRecalcRect(node, bfx) {
  train(bfx); // recalc margin, border

  // http://d.hatena.ne.jp/uupaa/20090719
  if (_ie67) { // restore border and margin state
    _mm.mix(node.style, bfx.ie6borderorg);
  }
  // update rect
  bfx.nodeRect = _mm.style.getSize(node);
  bfx.viewRect = _mm.style.getSize(bfx.view);
  bfx.nodeOffset = _mm.style.getOffsetFromAncestor(bfx.node, bfx.view);

  if (_ie67) {
    _mm.mix(node.style, bfx.ie6borderfix);
  }
}

function boxeffectDraw(bfx,      // @param Hash:
                       redraw) { // @param Number(= 0): redraw type
                                 //     0: init
                                 //     1: redraw
                                 //     2: image loaded
  var node = bfx.node,
      layer = bfx.layer,
      nodebg = bfx.nodebgLayer,
      viewbg = bfx.viewbgLayer,
      nw, nh, nctx, vctx, hash, ary;

  train(bfx);

  if (layer) {
    nctx = layer.getContext("nodebg");
    vctx = layer.getContext("viewbg");
  }

  if (0) { // debug
    if (layer) {
      layer.view.style.border = "2px solid pink";
    }
    if (nodebg && viewbg) {
      nodebg.style.border = "5px solid red";
      viewbg.style.border = "5px solid green";
    }
  }

  if (redraw && viewbg && nodebg) {
    nw = bfx.nodeRect.w + bfx.nodeOffset.x * 2;
    nh = bfx.nodeRect.h + bfx.nodeOffset.y * 2;
    if (_ie67) {
      layer.resizeLayer("nodebg", bfx.nodeRect.w,
                                  bfx.nodeRect.h);
    } else {
      layer.resizeLayer("nodebg", bfx.nodeRect.w - bfx.border.w,
                                  bfx.nodeRect.h - bfx.border.h);
    }
    layer.resizeLayer("viewbg", _math.max(bfx.viewRect.w, nw),
                                _math.max(bfx.viewRect.h, nh)).
          push("viewbg").clear().pop().
          push("nodebg").clear().pop();
  }

  // CSS3 background-origin:
  if (nodebg) {
    nodebg.style.left =
        (bfx.nodeOffset.x + (_ie67 ? 0 : bfx.border.l)) + "px";
    nodebg.style.top =
        (bfx.nodeOffset.y + (_ie67 ? 0 : bfx.border.t)) + "px";
  }

  if (viewbg) {
    // ToDo: clipping path for background-color: rgba(,,,0.5) support
/* keep
    if (0) {
      vctx.save();
      vctx.rect(0, 0, bfx.viewRect.w - bfx.border.w,
                      bfx.viewRect.h - bfx.border.h);
      boxpath(vctx,
              bfx.nodeOffset.x + bfx.border.l,
              bfx.nodeOffset.y + bfx.border.t,
              bfx.nodeRect.w - bfx.border.w,
              bfx.nodeRect.h - bfx.border.h,
              bfx.bradius.r,
              1); // open path
      vctx.clip();
    }
 */
    // draw shadow
    if (bfx.boxeffect.render && bfx.boxshadow.render) {
      hash = bfx.boxshadow;
      vctx.save();
      drawFakeShadow(vctx,
                     bfx.nodeOffset.x - hash.blur / 2 + hash.ox,
                     bfx.nodeOffset.y - hash.blur / 2 + hash.oy,
                     bfx.nodeRect.w + hash.blur,
                     bfx.nodeRect.h + hash.blur,
                     hash.rgba,
                     _math.max(hash.blur, _math.abs(hash.ox * 2),
                                          _math.abs(hash.oy * 2)),
                     bfx.bradius.r);
      vctx.restore();
    }

    // draw border
    if (bfx.boxeffect.render && bfx.border.render) {
      ary = [];
      if (bfx.boxshadow.render) {
        hash = bfx.bradius.r;
        ary[0] = !hash[0] ? 1 : (hash[0] < 40) ? hash[0] + 4 : hash[0];
        ary[1] = !hash[1] ? 1 : (hash[1] < 40) ? hash[1] + 4 : hash[1];
        ary[2] = !hash[2] ? 1 : (hash[2] < 40) ? hash[2] + 4 : hash[2];
        ary[3] = !hash[3] ? 1 : (hash[3] < 40) ? hash[3] + 4 : hash[3];
      } else {
        ary = bfx.bradius.r;
      }
      vctx.save();
      vctx.fillStyle = bfx.border.tc[0];
      boxpath(vctx,
              bfx.nodeOffset.x,
              bfx.nodeOffset.y,
              bfx.nodeRect.w,
              bfx.nodeRect.h,
              ary);
      vctx.fill();
      vctx.restore();
    }
/* keep
    if (0) { // end clip
      vctx.restore();
    }
 */
  }

  if (nodebg) {
    layer.push("nodebg");

    // draw background-color
    if (bfx.boxeffect.render) {
      if (bfx.border.render ||
          bfx.boxshadow.render ||
          bfx.mbg.rgba.a) {
        nctx.save();
        if (!bfx.mbg.rgba.r &&
            !bfx.mbg.rgba.g &&
            !bfx.mbg.rgba.b &&
            !bfx.mbg.rgba.a) { // -uu-background-color: transparent
          nctx.globalAlpha = bfx.mbg.altcolor.a;
          nctx.fillStyle = _mm.color.hex(bfx.mbg.altcolor);
        } else {
          nctx.globalAlpha = bfx.mbg.rgba.a;
          nctx.fillStyle = _mm.color.hex(bfx.mbg.rgba);
        }
        boxpath(nctx,
                _ie67 ? bfx.border.l : 0,
                _ie67 ? bfx.border.t : 0,
                bfx.nodeRect.w - bfx.border.w,
                bfx.nodeRect.h - bfx.border.h,
                bfx.bradius.r);
        nctx.fill();
        nctx.restore();
      }
    }

    // draw multiple background image
    if (bfx.boxeffect.render) {
      nctx.save();
      drawMultipleBackgroundImage(bfx, nctx);
      nctx.restore();
    }

    // rewrite border, clipping mbg
    if (_ie67) {
      if (bfx.border.render && bfx.border.shorthand) {
        if (!bfx.bradius.r[0] && bfx.bradius.shorthand) {
          nctx.save();
          nctx.strokeStyle = bfx.border.tc[0];
          nctx.lineWidth = bfx.border.t * 2;
          boxpath(nctx, 0, 0,
                  bfx.nodeRect.w,
                  bfx.nodeRect.h,
                  bfx.bradius.r);
          nctx.stroke();
          nctx.restore();
        }
      }
    }

    layer.pop();
  }

  // bg setting
  node.style.borderColor =
  node.style.backgroundColor = "transparent";
  node.style.backgroundImage = "none";

  // http://d.hatena.ne.jp/uupaa/20090719
  // IE6 'borderColor = "transparent";' unsupported
  if (_ie67) {
    _mm.mix(node.style, bfx.ie6borderfix);
  }

  if (!redraw && bfx.slmode) {
    _mm.altcss.deny = 1;
  }
}

function drawFakeShadow(ctx, x, y, width, height,
                        rgba, blur, radius) {
  var i = 0, j = 0, k, step = 1, line = 5, r = radius,
      fg = "rgba(" + [rgba.r, rgba.g, rgba.b, ""].join(","); // fragment

  if (_FLY_WEIGHT) {
    step *= 3, line *= 2.5;
  }

  ctx.globalAlpha = 1;
  ctx.lineWidth = line;
  for (; i < blur; i += step) {
    k = i / blur;
    j += 0.5;
    ctx.strokeStyle = fg + (k * k * k) + ")";
    boxpath(ctx, x + i, y + i, width - (i * 2), height - (i * 2),
            [r[0] - j, r[1] - j, r[2] - j, r[3] - j]);
    ctx.stroke();
  }
}

function drawMultipleBackgroundImage(bfx, ctx) {
  var mbg = bfx.mbg, i = 0, iz = bfx.mbg.image.length,
      img, draw = 0, pos = [],
      BACKGROUND_REPEAT = _BACKGROUND_REPEAT;

  for (; i < iz; ++i) {
    switch (mbg.type[i]) {
    case 0: // -uu-background-image: none
      break;
    case 1: // image
      img = mbg.imgobj[i];
      if (img.state === 1) {
        pos[i] = trainBackgroundPosition(bfx, mbg.position[i], img);
        ++draw;
      }
      break;
    case 2: // gradient
      if (mbg.grad[i].render) {
        ++draw;
      }
    }
  }

  if (draw) {
    if (!_ie || bfx.slmode) {
      // http://d.hatena.ne.jp/uupaa/20090815
      // Google Chrome3 HTML5::Canvas.clip Jaggies
      if (bfx.border.render) {
        boxpath(ctx,
                _ie67 ? bfx.border.l : -1,
                _ie67 ? bfx.border.t : -1,
                bfx.nodeRect.w - bfx.border.w + 2,
                bfx.nodeRect.h - bfx.border.h + 2,
                bfx.bradius.r);
      } else {
        boxpath(ctx,
                _ie67 ? bfx.border.l : 0,
                _ie67 ? bfx.border.t : 0,
                bfx.nodeRect.w - bfx.border.w,
                bfx.nodeRect.h - bfx.border.h,
                bfx.bradius.r);
      }
      ctx.clip();
    }
    while (i--) {
      switch (mbg.type[i]) {
      case 1:
        img = mbg.imgobj[i];
        if (img.state === 1) {
          switch (BACKGROUND_REPEAT[mbg.repeat[i]] || 0) {
          case 1: // "no-repeat"
            // http://twitter.com/uupaa/status/2763996863
            // Firefox2 bugfix
            ctx.drawImage(img, pos[i].x | 0, pos[i].y | 0);
            break;
          case 2: // "repeat-x", "repeat-y"
            drawImageTile(bfx, ctx, img,
                          (mbg.repeat[i] === "repeat-x" ? 1 : 0),
                          pos[i].x | 0, pos[i].y | 0,
                          _ie67 ? bfx.border.l : 0,
                          _ie67 ? bfx.border.t : 0,
                          bfx.nodeRect.w - bfx.border.w,
                          bfx.nodeRect.h - bfx.border.h);
            break;
          default: // "repeat":
            ctx.save();
            ctx.fillStyle = ctx.createPattern(img, "repeat");
            boxpath(ctx,
                    _ie67 ? bfx.border.l : 0,
                    _ie67 ? bfx.border.t : 0,
                    bfx.nodeRect.w - bfx.border.w,
                    bfx.nodeRect.h - bfx.border.h,
                    bfx.bradius.r);
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      case 2:
        if (mbg.grad[i].render) {
          drawGradient(bfx, ctx, mbg.grad[i]);
        }
      }
    }
  }
}

function drawImageTile(bfx, ctx, img, horizontal,
                       ix, iy, left, top, right, bottom) {
  var x = ix, y = iy, w = img.width, h = img.height,
      xmin = left - w, ymin = top - h;

  if (horizontal) {
    for (; x < right; x += w) {
      ctx.drawImage(img, x, y);
    }
    for (x = ix - w; x > xmin; x -= w) {
      ctx.drawImage(img, x, y);
    }
  } else {
    for (; y < bottom; y += h) {
      ctx.drawImage(img, x, y);
    }
    for (y = iy - h; y > ymin; y -= h) {
      ctx.drawImage(img, x, y);
    }
  }
}

function drawGradient(bfx, ctx, hash) {
  function pos(str, size) {
    return (str.lastIndexOf("%") > 0) ? (size * parseFloat(str) / 100)
                                      : parseFloat(str);
  }
  var p0 = pos(hash.point[0], bfx.nodeRect.w),
      p1 = pos(hash.point[1], bfx.nodeRect.h),
      p2 = pos(hash.point[2], bfx.nodeRect.w),
      p3 = pos(hash.point[3], bfx.nodeRect.h);

  ctx.save();
  ctx.fillStyle = (hash.type === "linear")
      ? bfx.layer.linearGrad(p0, p1, p2, p3,
                              hash.offset, hash.color)
      : bfx.layer.radialGrad(p0, p1, hash.radius[0],
                              p2, p3, hash.radius[1],
                              hash.offset, hash.color);
  boxpath(ctx,
          _ie67 ? bfx.border.l : 0,
          _ie67 ? bfx.border.t : 0,
          bfx.nodeRect.w - bfx.border.w,
          bfx.nodeRect.h - bfx.border.h,
          bfx.bradius.r);
  ctx.fill();
  ctx.restore();
}

function trainMBG(bfx) {
  var mbg = bfx.mbg, i = 0, iz, m, url, _ceil = _math.ceil, N,
      URL = _URL, QUOTE = _QUOTE, UU_GRADIENT = _UU_GRADIENT;

  // spec http://www.w3.org/TR/css3-background/#layering
  N = _math.max(mbg.image.length, mbg.repeat.length, mbg.position.length);

  if (N > mbg.image.length) {
    mbg.image = multipleArray(mbg.image,
                              _ceil(N / mbg.image.length), N);
  }
  if (N > mbg.repeat.length) {
    mbg.repeat = multipleArray(mbg.repeat,
                               _ceil(N / mbg.repeat.length), N);
  }
  if (N > mbg.position.length) {
    mbg.position = multipleArray(mbg.position,
                                 _ceil(N / mbg.position.length), N);
  }

  for (iz = mbg.image.length; i < iz; ++i) {
    mbg.image[i] = _mm.trim(mbg.image[i]);
    mbg.repeat[i] = _mm.trim(mbg.repeat[i]);
    mbg.position[i] = _mm.trim(mbg.position[i]);
    mbg.type[i] = 0; // 0 = unknown

    if ( (m = URL.exec(mbg.image[i])) ) {
      mbg.type[i] = 1; // image
      url = m[1].replace(QUOTE, "");
      mbg.imgobj[i] = _mm.image.load(url, lazyRedraw);
    } else if (UU_GRADIENT.test(mbg.image[i])) {
      mbg.type[i] = 2; // gradient
      mbg.grad[i] = _mm.style.validate.gradient(mbg.image[i]);
      mbg.grad[i].render = (mbg.grad[i].valid &&
                            mbg.grad[i].type) ? 1 : 0;
    }
  }
  function lazyRedraw(img, state, w, h) {
    if (state === 1) {
      (bfx.mbg.timerid >= 0) && clearTimeout(bfx.mbg.timerid);
      bfx.mbg.timerid = setTimeout(function() {
        boxeffectRecalcRect(bfx.node, bfx);
        boxeffectDraw(bfx, 2); // image loaded
      }, 100);
    }
  }
}

function trainBackgroundPosition(bfx, pos, img) {
  var ary, px, py,
      nw = bfx.nodeRect.w,
      nh = bfx.nodeRect.h,
      iw = img.width,
      ih = img.height,
      xfloat = parseFloat;

  if (!_ie67) {
    nw -= bfx.border.w;
    nh -= bfx.border.h;
  }

  ary = (pos.indexOf(" ") > 0) ? pos.split(" ")
                               : [pos, pos];

  if (ary[0] === "top" || ary[0] === "bottom" ||
      ary[1] === "left" || ary[1] === "right") {
    ary.reverse(); // "top left" -> "left top"
  }

  ary[0] = _BACLGROUND_POSITION_H[ary[0]] || ary[0];
  ary[1] = _BACLGROUND_POSITION_V[ary[1]] || ary[1];

  if (ary[0].lastIndexOf("%") > 0) {
    px = nw * xfloat(ary[0]) / 100
       - iw * xfloat(ary[0]) / 100;
  } else {
    px = _mm.style.toPixel(bfx.node, ary[0]);
    if (_ie67) {
      px += bfx.border.l;
    }
  }

  if (ary[1].lastIndexOf("%") > 0) {
    py = nh * xfloat(ary[1]) / 100
       - ih * xfloat(ary[1]) / 100;
  } else {
    py = _mm.style.toPixel(bfx.node, ary[1]);
    if (_ie67) {
      py += bfx.border.t;
    }
  }
  return { x: px, y: py };
}

function boxpath(ctx, x, y, w, h, rary, openPath) {
  var r0 = rary[0], r1 = rary[1], r2 = rary[2], r3 = rary[3],
      w2 = (w / 2) | 0, h2 = (h / 2) | 0, xmin = _math.min;

  if (r0 < 0) { r0 = 0; }
  if (r1 < 0) { r1 = 0; }
  if (r2 < 0) { r2 = 0; }
  if (r3 < 0) { r3 = 0; }
  if (r0 >= w2 || r0 >= h2) { r0 = xmin(w2, h2) - 2; }
  if (r1 >= w2 || r1 >= h2) { r1 = xmin(w2, h2) - 2; }
  if (r2 >= w2 || r2 >= h2) { r2 = xmin(w2, h2) - 2; }
  if (r3 >= w2 || r3 >= h2) { r3 = xmin(w2, h2) - 2; }

  if (!openPath) {
    ctx.beginPath();
  }
  ctx.moveTo(x, y + h2);
  ctx.lineTo(x, y + h - r3);
  ctx.quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
  ctx.lineTo(x + w - r2, y + h);
  ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
  ctx.lineTo(x + w, y + r1);
  ctx.quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
  ctx.lineTo(x + r0, y);
  ctx.quadraticCurveTo(x, y, x, y + r0); // top-right
  ctx.closePath();
}

function multipleArray(ary, times, maxLength) {
  var rv = [], i = 0, iz;

  for (; i < times; ++i) {
    rv = rv.concat(ary);
  }
  if (rv.length > maxLength) {
    for (i = 0, iz = rv.length - maxLength; i < iz; ++i) {
      rv.pop();
    }
  }
  return rv;
}

function trainBorder(bfx) {
  var node = bfx.node,
      hash = bfx.border,
      ns = _ie ? node.currentStyle : getComputedStyle(node, null);

  hash.render = 0;
  hash.shorthand = 0;
  _mm.mix(hash, _mm.style.getBorderSize(node, 1));
  hash.tc = _mm.color.parse(ns.borderTopColor);

  if (hash.tc[1]) { // has border
    if (hash.t || hash.l || hash.r || hash.b) {
      hash.render = 1;
    }
  }
  if (hash.t === hash.r &&
      hash.t === hash.b &&
      hash.t === hash.l) {
    hash.shorthand = 1;
  }
}

function trainFakeBorder(bfx) {
  // http://d.hatena.ne.jp/uupaa/20090719
  var node = bfx.node,
      ns = _ie ? node.currentStyle : getComputedStyle(node, null);

  bfx.ie6borderorg = {
    marginTop: ns.marginTop,
    marginLeft: ns.marginLeft,
    marginRight: ns.marginRight,
    marginBottom: ns.marginBottom,
    borderTopWidth: ns.borderTopWidth,
    borderLeftWidth: ns.borderLeftWidth,
    borderRightWidth: ns.borderRightWidth,
    borderBottomWidth: ns.borderBottomWidth,
    borderStyle: "solid"
  };
  bfx.ie6borderfix = {
    marginTop: (bfx.margin.t + bfx.border.t) + "px",
    marginLeft: (bfx.margin.l + bfx.border.l) + "px",
    marginRight: (bfx.margin.r + bfx.border.r) + "px",
    marginBottom: (bfx.margin.b + bfx.border.b) + "px",
    border: "0px none"
  };
}

// IE6,IE7 CSS layout bugfix
function fixIELayoutBug(view, node, viewStyle, nodeStyle) { // IE6, IE7
  if (!viewStyle.hasLayout) {
    view.style.zoom = 1;
  }
  node.style.zoom = 1; // apply z-index(sink canvas)
  if (nodeStyle.position === "static") {
    node.style.position = "relative"; // set "position: relative"
  }
  // bugfix position:relative + margin:auto
  // see demo/viewbox_position/position_relative.htm
  if (node.style.position === "relative") {
    (nodeStyle.marginTop === "auto") && (node.style.marginTop = 0);
    (nodeStyle.marginLeft === "auto") && (node.style.marginLeft = 0);
    (nodeStyle.marginRight === "auto") && (node.style.marginRight = 0);
    (nodeStyle.marginBottom === "auto") && (node.style.marginBottom = 0);
  }
}

// --- initialize / export ---
_mm.altcss.boxeffect = _mm.mix(boxeffect, {
  bond:   fxbond,
  recalc: fxrecalc
});

})(); // uuMeta.altcss.boxeffect scope

