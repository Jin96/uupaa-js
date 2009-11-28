
// === Tween ===
// depend: uu.js, uu.color.js, uu.css.js, uu.query.js, /* uu.img.js */
uu.waste || (function(win, doc, uu) {

uu.mix(uu, {
  tween: uu.mix(uutween, {      // uu.tween(node, duration, {...}, fn = void 0) -> node
    move:       uutweenmove,    // uu.tween.move(node, duration, x, y, w, h, opacity, fn = void 0) -> node
    stop:       uutweenstop,    // [1][stop all tween]  uu.tween.stop() -> [node, ...]
                                // [2][stop node tween] uu.tween.stop(node) -> node
    running:    uutweenrunning  // uu.tween.running(node) -> Boolean
  })
});

// --- tween ---
// uu.tween - add queue
// uu.tween(node, 1000, { opacity: [0, 1], left: [100, 200] })
function uutween(node,     // @param Node:
                 duration, // @param Number: duration, 0 is now, 1000 is 1sec
                 param,    // @param Hash(= void 0): { prop:[begin,end,ez], ...}
                           //         param[prop][0] false/Number: begin, false is current value
                           //         param[prop][1] Number: end
                           //         param[prop][2] Function(= easeInOutQuad): easing function
                 fn,       // @param Function(= void 0): post callback
                 prefn) {  // @param Function(= void 0): pre callback
                           // @return Node:
  // bond
  //    node.uutweenq - tween queue
  //    node.uutween  - tween timer id, 0 is stoped, seek uu.query(":tween")
  //    node.uutweencancel(finish) - tween canceller
  function _uutweenlazy() {
    _uutweennext(node);
  }
  node.uutweenq || (node.uutweenq = []);
  if (node.uutweenq.push([duration, param, fn, prefn]) === 1) {
    node.uutween = 1;
    node.style.overflow = "hidden";
/* keep
    uu.img.render(node, 1); // 1: speed
 */
    setTimeout(_uutweenlazy, 0);
  }
  return node;
}

// inner -
function _uutweennext(node) {
  node.uutweenq.length ? _uutweenrunner(node)
/* keep
                       : (node.uutween = 0, uu.img.render(node));
 */
                       : (node.uutween = 0);
}

// inner -
function _uutweenrunner(node) {
  function _uutweenrunnerlazy() {
    _uutweennext(node);
  }
  function _uutweencancel(finish) {
    // http://twitter.com/uupaa/status/4990916169
    _uutweenloop(0, 1, finish);
  }
  function _uutweenloop(dummy, stop, finish) {
    var v, i = 0, curt = +new Date, gain = curt - tm1,
        fin = finish || (curt >= tm1 + dura), ns = node.style;

    while ( (v = names[i]) ) { // perf point
      ns[v] = funcs[i++](fin, gain, dura);
    }
    if (stop || fin) {
      node.uutweencancel = 0;
      fin && fn && fn(node, ns); // fn(node, node.style)
      setTimeout(_uutweenrunnerlazy, 0);
    } else {
      node.uutween = setTimeout(_uutweenloop, 0);
    }
  }
  var arg = node.uutweenq.shift(), cs = uu.css(node),
      dura = arg[0], pm = arg[1], fn = arg[2], prefn = arg[3], // deploy
      tm1, curt, pos, size, ns, i, v, w, vfn,
      funcs = [], names = [], _ez = _uutweeneaseinoutquad,
      FIX = uu.dmz.FIX;

  if (prefn) {
    w = prefn(node, cs); // prefn(node, node.currentStyle)
    if (w === false) {
      setTimeout(_uutweenrunnerlazy, 0);
      return;
    } else if (w !== true) {
      pm = w; // override param
    }
  }
  tm1 = +new Date;
  ns = node.style;

  for (i in pm) {
    switch (w = FIX[i] || i) {
    case "left":
    case "top":
      pos || (pos = uu.css.off.get(node, null, 1)); // offset from foster
      v = pm[i][0];
      pos[w] = (v === false) ? pos[(w === "top") ? "y" : "x"] : v;
    }
  }
  pos && uu.css.off.set(node, pos.left, pos.top);
  for (i in pm) {
    switch (w = FIX[i] || i) {
    // [o][opacity]
    case "opacity":
      curt = (pm[i][0] === false) ? uu.css[w].get(node) : pm[i][0];
      vfn = (function(end, ez, curt, delta) {
              return function(fin, gain, dura) {
                var rv = fin ? end : ez(gain, curt, delta, dura);

                uu.ie && uu.css.opacity.set(node, rv);
                return rv;
              };
            })(pm[i][1], pm[i][2] || _ez, curt, pm[i][1] - curt);
      uu.css[w].set(node, curt);
      break;
    // [x][left][y][top]
    case "left":
    case "top":
      curt = pos[i];
      vfn = (function(end, ez, curt, delta) {
              return function(fin, gain, dura) {
                return (fin ? end : ez(gain, curt, delta, dura)) + "px";
              };
            })(pm[i][1], pm[i][2] || _ez, curt, pm[i][1] - curt);
      break;
    // [color][bgcolor][backgroundColor]
    case "color":
    case "backgroundColor":
      curt = (pm[i][0] === false) ? cs[w] : pm[i][0];
      vfn = (function(end, ez, curt) {
              return function(fin, gain, dura) {
                var gd = gain / dura, F = parseInt;

                return "#" + ez[F(fin ? end.r : (end.r - curt.r) * gd + curt.r)]
                           + ez[F(fin ? end.g : (end.g - curt.g) * gd + curt.g)]
                           + ez[F(fin ? end.b : (end.b - curt.b) * gd + curt.b)];
              };
            })(uu.color(pm[i][1], 1), uu.dmz.HEX2, uu.color(curt, 1));
      ns[w] = curt; // ColorString
      break;
    // [w][width][h][height][other]
    default:
      curt = parseInt((pm[i][0] === false) ? cs[w] : pm[i][0]);
      if (isNaN(curt)) { // [IE] style.width -> "auto" -> parseInt("auto") -> NaN
        if (w === "width" || w === "height") {
          size || (size = uu.css.size(node, 1)); // 1: plain size
          curt = (w === "width") ? size.w : size.h;
        }
      }
      vfn = (function(end, ez, curt, delta) {
              return function(fin, gain, dura) {
                return parseInt(fin ? end : ez(gain, curt, delta, dura)) + "px";
              };
            })(pm[i][1], pm[i][2] || _ez, curt, pm[i][1] - curt);
      ns[w] = curt + "px";
    }
    names.push(w);
    funcs.push(vfn);
  }
  node.uutweencancel = _uutweencancel;
  _uutweenloop();
}

// uu.tween.move - rect and opacity effect
function uutweenmove(node,      // @param Node:
                     duration,  // @param Number:
                     x,         // @param Number(= void 0): end x
                     y,         // @param Number(= void 0): end y
                     w,         // @param Number(= void 0): end width
                     h,         // @param Number(= void 0): end height
                     opacity,   // @param Number(= void 0): end opacity
                     fn) {      // @param Function(= void 0): callback
                                // @return Node:
  var fxx = x !== void 0, fxy = y !== void 0,
      fxw = w !== void 0, fxh = h !== void 0,
      fxo = opacity !== void 0, pm = {};

  fxx && (pm.x = [false, x]);
  fxy && (pm.y = [false, y]);
  fxw && (pm.w = [false, w]);
  fxh && (pm.h = [false, h]);
  fxo && (pm.o = [false, opacity]);
  uutween(node, duration, pm, fn);
  return node;
}

// uu.tween.stop
// [1][stop all tween]  uu.tween.stop() -> [node, ...]
// [2][stop node tween] uu.tween.stop(node) -> node
function uutweenstop(node,     // @param Node(= 0): 0 is all node
                     finish) { // @param Number(= 0): 0 is stop, 1 is finish
                               // @return Node/NodeArray:
  var ary = node ? [node] : uu.query(":tween", doc.body), v, i = 0;

  while( (v = ary[i++]) ) {
    v.uutween && clearTimeout(v.uutween);
    v.uutween = 0;
    v.uutweencancel && v.uutweencancel(finish || 0);
  }
  return (node === void 0) ? ary : node;
}

// uu.tween.running
function uutweenrunning(node) { // @param Node:
                                // @return Boolean:
  return !!node.uutween;
}

// inner - linear
function _uutweenlinear(t, b, c, d) {
  return c * t / d + b;
}

// inner - easeInOutQuad
function _uutweeneaseinoutquad(t, b, c, d) {
  return (t/=d/2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b;
}

})(window, document, uu);

