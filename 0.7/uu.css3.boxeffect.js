
// === CSS3 BoxEffect ===
// depend: uu.js, uu.css.js, uu.css3.js
uu.agein || (function(win, doc, uu, _mix, _ie, _ie6, _ie67, _cstyle, _math) {
var _niddb = {}, // nodeid db { nodeid: node, ... }
    _BFX = "uucss3bfx",
    _IMG_URL = /^\s*url\((.*)\)$/,         // "url(...)" (
    _IMG_CANVAS = /^\s*-uu-canvas\(([^\)]+)\)/, // "-uu-canvas(...)"
    _IMG_GRADIENT = /^\s*-uu-gradient/,    // "-uu-gradient(...)"
    _MBG = /-uu-background(-image|-repeat|-position|-color|-attachment|-clip|-origin|-size|-break)?/g,
    _MBG_CASE = { "-image": 2, "-repeat": 2, "-position": 2, "-color": 2 },
    _BACKGROUND_REPEAT = { "no-repeat": 1, "repeat-x": 2, "repeat-y": 2 },
    _BACLGROUND_POSITION_H = { left: "0%", center: "50%", right: "100%" },
    _BACLGROUND_POSITION_V = { top: "0%", center: "50%", bottom: "100%" };

uu.css3.boxeffect = _mix(uucss3boxeffect, { // uu.css.boxeffect(node, excss)
    bond:   uucss3boxeffectbond,   // uu.css3.boxeffect.bond(node, excess) -> node.uucss3bfx hash
    recalc: uucss3boxeffectrecalc
});

// uu.css3.boxeffect
function uucss3boxeffect(node,    // @param Node:
                         excss) { // @param excss:
    var view = node.parentNode,
        vs = _ie ? view.currentStyle : _cstyle(view, null),
        ns = _ie ? node.currentStyle : _cstyle(node, null),
        nid = uu.nodeid(node), m, mbgsh = 0,
        bfx, hash, backend, nw, nh,
        viw = view.style.width,
        vih = view.style.height,
        decl, declw = -1, declh = -1,
        MBG = _MBG, MBG_CASE = _MBG_CASE;

    if (vs.display === "none" || ns.display === "none") { // hidden
        return;
    }
    _niddb[nid] = node; // manage nodeid

    _ie67 && _fixIELayoutBug(view, node, vs, ns);

    bfx = uucss3boxeffectbond(node, excss);

    // apply style
    uu.css3.set(node, {
        "-uu-box-effect":    bfx.decl["-uu-box-effect"] || "auto",
        "-uu-box-shadow":    bfx.decl["-uu-box-shadow"],
        "-uu-box-reflect":   bfx.decl["-uu-box-reflect"],
        "-uu-border-radius": bfx.decl["-uu-border-radius"]
    });
    _mix(bfx.margin, uu.css.margin.get(bfx.node)); // copy margin
    trainBorder(bfx);
    _ie67 && trainFakeBorder(bfx);

    while ( (m = MBG.exec(bfx.order)) ) {
        if ((!m[1] && !mbgsh++) || MBG_CASE[m[1]]) {
            uu.css3(node, m[0], bfx.decl[m[0]]);
        }
    }
    trainMBG(bfx);

    if (bfx.boxreflect.render) {
        // -uu-box-reflect:
        hash = bfx.boxreflect;
        if (hash.dir === "below") {
            if (node.tagName === "IMG") {
                // delay loader
                uu.img.load(node.src, function(imghash) {
                    if (imghash.code === 200) {
                        bfx.layer = new uu.layer(view, imghash.w,
                                                       imghash.h * 2 + hash.offset);
                        // http://d.hatena.ne.jp/uupaa/20090822
                        bfx.nodeOffset = uu.css.offset.get(bfx.node, view); // from ancestor
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
        backend = "vmlcanvas";
        if (_ie && uu.ver.silverlight
            && bfx.decl["-uu-backend"] === "silver") {

            bfx.backend = 1; // Silverlight mode(buggy)
            backend = "slcanvas";
        }

        // get declaration value("auto" or "200px"),
        // The computed value cannot be used.
        if ( !(decl = uu.css3.decl(view)) ) {
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
        bfx.layer = new uu.layer(view, declw, declh, { HIDDEN: 0 });
        bfx.nodebgLayer = bfx.layer.createLayer("nodebg", backend, 0, 1,
                                                bfx.nodeRect.w, bfx.nodeRect.h);

        // http://d.hatena.ne.jp/uupaa/20090822
        // [1] calc viewbg dimension
        bfx.nodeOffset = uu.css.offset.get(bfx.node, view); // from ancestor
        nw = bfx.nodeRect.w + bfx.nodeOffset.x * 2;
        nh = bfx.nodeRect.h + bfx.nodeOffset.y * 2;
        // [2] set viewbg dimension
        bfx.viewbgLayer = bfx.layer.createLayer("viewbg", backend, 0, 1,
                                                _math.max(bfx.viewRect.w, nw),
                                                _math.max(bfx.viewRect.h, nh));
        bfx.layer.appendLayer("node", node);
    }
    boxeffectDraw(bfx, 0);
}

// uu.css3.boxeffect.bond
function uucss3boxeffectbond(node,    // @param Node:
                             excss) { // @param excss:
                                      // @return Hash: node.uucss3bfx hash
    if (!(_BFX in node)) {
        var view = node.parentNode;

        node[_BFX] = {
            decl:           excss.decl,
            order:          excss.order,
            view:           view,
            node:           node,
            layer:          0,
            nodebgLayer:    0,
            viewbgLayer:    0,
            hasReflectLayer:0,
            backend:        0, // 0: VML, 1: Silverlight, 2: Flash
            viewRect:       uu.css.size(view),
            nodeRect:       uu.css.size(node),
            nodeOffset:     0, // lazy
            train:          { margin: 0, border: 0, mbg: 0 }, // 1: retrain
            margin:         { t: 0, l: 0, r: 0, b: 0, w: 0, h: 0 },
            border:         { render: 0, shorthand: 0,
                                t: 0, l: 0, r: 0, b: 0, w: 0, h: 0,
                                topcolor: uu.color("transparent") }, // ColorHash
            mbg:            { render: 0,
                                type: [], // 1 is url, 2 is gradient, 3 is canvas
                                image: ["none"], // "-uu-canvas(...)" or "-uu-gradient(...)" or "url(...)"
                                repeat: ["repeat"],
                                position: ["0% 0%"],
                                attachment: ["scroll"],
                                origin: ["padding"],
                                clip: ["no-clip"],
                                colorHash: uu.color("transparent"),
                                altcolor: uu.canvas.bgcolor(node), // ColorHash
                                grad: [],
                                canvasid: "", // "-uu-canvas(id)" -> "id"
                                imgobj: [],
                                timerid: -1 },
            bradius:        { render: 0, shorthand: 0, r: [0, 0, 0, 0] },
            boxshadow:      { render: 0, colorHash: 0, ox: 0, oy: 0, blur: 0 },
            boxreflect:     { render: 0, dir: 0, offset: 0, url: 0,
                                grad: { render: 0 } },
            boxeffect:      { render: 0 },
            redrawfn:       0   // redraw callback function for -uu-background-image: -uu-canvas()
                                // document.setCSSCanvasContextRedraw("ident", redrawfn)
        };
    }
    return node[_BFX];
}

// uu.css3.boxeffect.recalc
function uucss3boxeffectrecalc() {
    var node, nid, view, bfx, vs, ns;

    for (nid in _niddb) {
        node = _niddb[nid];
        view = node.parentNode;

        vs = _ie ? view.currentStyle : _cstyle(view, null);
        ns = _ie ? node.currentStyle : _cstyle(node, null);

        if (vs.display === "none" || ns.display === "none") {
            continue;
        }

        bfx = node[_BFX];
        boxeffectRecalcRect(node, bfx);

        // improvement of response time
        (function(arg) {
            setTimeout(function() {
                boxeffectDraw(arg, 1);
            }, 0);
        })(bfx);
    }
}

function train(bfx) {
    if (bfx.train.margin || bfx.train.border) {
        bfx.train.margin && _mix(bfx.margin, uu.css.margin.get(bfx.node));
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
        _mix(node.style, bfx.ie6borderorg);
    }
    // update rect
    bfx.nodeRect = uu.css.size(node);
    bfx.viewRect = uu.css.size(bfx.view);
    bfx.nodeOffset = uu.css.offset.get(bfx.node, bfx.view); // from ancestor

    if (_ie67) {
        _mix(node.style, bfx.ie6borderfix);
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
        nw, nh, nctx, vctx, ary,
        boxshadow, bradius; // alias

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
            boxshadow = bfx.boxshadow;
            vctx.save();
            drawFakeShadow(vctx,
                            bfx.nodeOffset.x - boxshadow.blur / 2 + boxshadow.ox,
                            bfx.nodeOffset.y - boxshadow.blur / 2 + boxshadow.oy,
                            bfx.nodeRect.w + boxshadow.blur,
                            bfx.nodeRect.h + boxshadow.blur,
                            boxshadow.colorHash,
                           _math.max(boxshadow.blur, _math.abs(boxshadow.ox * 2),
                                                     _math.abs(boxshadow.oy * 2)),
                            bfx.bradius.r);
            vctx.restore();
        }

        // draw border
        if (bfx.boxeffect.render && bfx.border.render) {
            ary = [];
            if (bfx.boxshadow.render) {
                bradius = bfx.bradius.r;
                ary[0] = !bradius[0] ? 1 : (bradius[0] < 40) ? bradius[0] + 4 : bradius[0];
                ary[1] = !bradius[1] ? 1 : (bradius[1] < 40) ? bradius[1] + 4 : bradius[1];
                ary[2] = !bradius[2] ? 1 : (bradius[2] < 40) ? bradius[2] + 4 : bradius[2];
                ary[3] = !bradius[3] ? 1 : (bradius[3] < 40) ? bradius[3] + 4 : bradius[3];
            } else {
                ary = bfx.bradius.r;
            }
            vctx.save();
            vctx.fillStyle = bfx.border.topcolor.hex;
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
            if (bfx.border.render || bfx.boxshadow.render || bfx.mbg.colorHash.a) {
                nctx.save();

                // -uu-background-color: transparent
                if (!bfx.mbg.colorHash.r && !bfx.mbg.colorHash.g
                    && !bfx.mbg.colorHash.b && !bfx.mbg.colorHash.a) {

                    nctx.globalAlpha = bfx.mbg.altcolor.a;
                    nctx.fillStyle = bfx.mbg.altcolor.hex;
                } else {
                    nctx.globalAlpha = bfx.mbg.colorHash.a;
                    nctx.fillStyle = bfx.mbg.colorHash.hex;
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
                    nctx.strokeStyle = bfx.border.topcolor.hex;
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
        if (bfx.redrawfn) {
            bfx.redrawfn(1); // callback
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
        _mix(node.style, bfx.ie6borderfix);
    }

    if (!redraw && bfx.slmode) {
        uu.css3._deny = 1;
    }
}

function drawFakeShadow(ctx, x, y, width, height,
                        colorHash, blur, radius) {
    var i = 0, j = 0, k, alpha, step = 1, line = 5,
        hex = colorHash.hex,
        // pre build  "rgb(r,g,b,"
        rgb = "rgba(" + colorHash.r + "," +
                        colorHash.g + "," + colorHash.b + ","; // ))

    // [IE6] thin out shadow
    if (_ie6 && !uu.config.right) {
        step *= 3, line *= 2.5;
    }

    for (; i < blur; i += step) {
        k = i / blur;
        j += 0.5;
        alpha = k * k * k;
        ctx.drawRoundRect(
                x + i, y + i, width - (i * 2), height - (i * 2),
                [radius[0] - j, radius[1] - j, radius[2] - j, radius[3] - j],
                void 0, // (
                { hex: hex, rgba: rgb + alpha + ")", a: alpha }, line);
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
            if (img.code === 200) {
                pos[i] = trainBackgroundPosition(bfx, mbg.position[i], img);
                ++draw;
            }
            break;
        case 2: // gradient
            if (mbg.grad[i].render) {
                ++draw;
            }
            break;
        case 3: // canvas
            ++draw;
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
            case 1: // image
                img = mbg.imgobj[i];
                if (img.code === 200) {
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
            case 2: // gradient
                if (mbg.grad[i].render) {
                    drawGradient(bfx, ctx, mbg.grad[i]);
                }
                break;
            case 3: // canvas
                // NOP
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
    var mbg = bfx.mbg, i = 0, iz, m, mm, url, _ceil = _math.ceil, N,
        IMG_URL = _IMG_URL, IMG_CANVAS = _IMG_CANVAS,
        IMG_GRADIENT = _IMG_GRADIENT;

    // @see MultiBG http://www.w3.org/TR/css3-background/#layering
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
        mbg.image[i] = uu.trim(mbg.image[i]);
        mbg.repeat[i] = uu.trim(mbg.repeat[i]);
        mbg.position[i] = uu.trim(mbg.position[i]);
        mbg.type[i] = 0; // 0 = unknown

        m = IMG_URL.exec(mbg.image[i]);
        if (m) {
            mbg.type[i] = 1; // image
            url = uu.trim.quote(m[1]);
            mbg.imgobj[i] = uu.img.load(url, lazyRedraw);
        } else if (IMG_GRADIENT.test(mbg.image[i])) {
            mbg.type[i] = 2; // gradient
            mbg.grad[i] = uu.css.validate.gradient(mbg.image[i]);
            mbg.grad[i].render = (mbg.grad[i].valid &&
                                  mbg.grad[i].type) ? 1 : 0;
        } else {
            mm = IMG_CANVAS.exec(mbg.image[i]);
            if (mm) {
                mbg.type[i] = 3; // canvas
                mbg.canvasid = uu.trim.quote(mm[1]);
            }
        }
    }
    function lazyRedraw(hash) {
        if (hash.code === 200) {
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

    if (ary[0] === "top" || ary[0] === "bottom"
        || ary[1] === "left" || ary[1] === "right") {

        ary.reverse(); // "top left" -> "left top"
    }

    ary[0] = _BACLGROUND_POSITION_H[ary[0]] || ary[0];
    ary[1] = _BACLGROUND_POSITION_V[ary[1]] || ary[1];

    if (ary[0].lastIndexOf("%") > 0) {
        px = nw * xfloat(ary[0]) / 100
           - iw * xfloat(ary[0]) / 100;
    } else {
        px = uu.css.px.value(bfx.node, ary[0]);
        if (_ie67) {
            px += bfx.border.l;
        }
    }

    if (ary[1].lastIndexOf("%") > 0) {
        py = nh * xfloat(ary[1]) / 100
           - ih * xfloat(ary[1]) / 100;
    } else {
        py = uu.css.px.value(bfx.node, ary[1]);
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
        ns = _ie ? node.currentStyle : _cstyle(node, null);

    hash.render = 0;
    hash.shorthand = 0;
    _mix(hash, uu.css.border.get(node, 1)); // copy border
    hash.topcolor = uu.color(ns.borderTopColor);

    if (hash.topcolor.a) { // has border (not transparent)
        if (hash.t || hash.l || hash.r || hash.b) {
            hash.render = 1;
        }
    }
    // top === right === bottom === left -> shorthand = 1
    if (hash.t === hash.r && hash.t === hash.b && hash.t === hash.l) {
        hash.shorthand = 1;
    }
}

function trainFakeBorder(bfx) {
    // http://d.hatena.ne.jp/uupaa/20090719
    var node = bfx.node,
        ncs = _ie ? node.currentStyle : _cstyle(node, null);

    bfx.ie6borderorg = {
        marginTop: ncs.marginTop,
        marginLeft: ncs.marginLeft,
        marginRight: ncs.marginRight,
        marginBottom: ncs.marginBottom,
        borderTopWidth: ncs.borderTopWidth,
        borderLeftWidth: ncs.borderLeftWidth,
        borderRightWidth: ncs.borderRightWidth,
        borderBottomWidth: ncs.borderBottomWidth,
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
function _fixIELayoutBug(view,  // @param Node: view node
                         node,  // @param Node: node
                         vcs,   // @param ComputedStyle: view.getComputedStyle
                         ncs) { // @param ComputedStyle: node.getComputedStyle
    var ns = node.style;

    !vcs.hasLayout && (view.style.zoom = 1);
    ns.zoom = 1; // apply z-index(sink canvas)
    ncs.position === "static" && (ns.position = "relative"); // to relative

    // bugfix position:relative + margin:auto
    // see demo/viewbox_position/position_relative.htm
    if (ns.position === "relative") {
        (ncs.marginTop === "auto") && (ns.marginTop = 0);
        (ncs.marginLeft === "auto") && (ns.marginLeft = 0);
        (ncs.marginRight === "auto") && (ns.marginRight = 0);
        (ncs.marginBottom === "auto") && (ns.marginBottom = 0);
    }
}

})(window, document, uu, uu.mix, uu.ie, uu.ie6, uu.ie67,
   window.getComputedStyle, Math);

