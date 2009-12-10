
// === Tween ===
// depend: uu.js, uu.color.js, uu.css.js
uu.waste || (function(win, doc, uu) {
var _FIX = uu.dmz.FIX,
    _HEX2 = uu.dmz.HEX2;

uu.mix(uu, {
  tween: uu.mix(uutween, {      // uu.tween(node, ms, {...}, fn = void 0, prefn = void 0) -> node
    fin:        uutweenfin,     // uu.tween.fin(node, all = 0) -> node or [node, ...]
    running:    uutweenrunning  // uu.tween.running(node) -> Boolean
  })
});

// --- tween ---
// uu.tween - add queue
// [1][abs]            uu.tween(node, 500, { o: 0.5, x: 200 })
// [2][rel]            uu.tween(node, 500, { o: "=+0.5" })
// [3][with "px" unit] uu.tween(node, 500, { h: "=-100px" })
// [4][with easing]    uu.tween(node, 500, { h: [200, Math.easeInOutQuad] })
function uutween(node,  // @param Node:
                 ms,    // @param Number: duration, 0 is now, 1000 is 1sec
                 param, // @param Hash: { prop: end, ... }
                        //           or { prop: [val, ezfn], ... }
                        //    param.val Number/String: end value,
                        //    param.ezfn Function(= easeInOutQuad):
                 fn) {  // @param Function(= void 0): callback, fn(node, style)
                        // @return Node:
  function _uutweenloop() {
    var q = node.uutweenq[0],
        now = q.tm ? +new Date
                   : (q.raw = _uutweenbuild(node, q.pa), q.tm = +new Date),
        raw = q.raw, gain = now - q.tm, ms = q.ms,
        fin = q.fin || (now >= (q.tm + ms)), v, i = 0;

    while ( (v = raw[0][i]) ) { // perf point
      raw[1][i++](fin, gain, ms, 0);
    }
    if (fin) {
      q.fn && q.fn(node, node.style); // fn(node, node.style)
      node.uutweenq.shift(node.uutween = 0); // [ATOMIC] dequeue
      if (!node.uutweenq.length) {
        return;
      }
    }
    node.uutween = setTimeout(_uutweenloop, 0); // [ATOMIC]
  }
  node.style.overflow = "hidden";
  node.uutweenq || (node.uutweenq = []); // init tween queue
  node.uutweenq.push({ tm: 0, ms: ms, pa: param, fn: fn, fin: 0 }); // [ATOMIC]
  node.uutween || _uutweenloop(node.uutween = 1); // [ATOMIC]
  return node;
}

// uu.tween.fin
function uutweenfin(node,  // @param Node(= 0): 0 is all node
                    all) { // @param Number(= 0): 1 is finish all
                           // @return Node/NodeArray:
  var ary = node ? [node] : uu.tag("*", doc.body), v, i = 0, j, jz;

  while( (v = ary[i++]) ) {
    if (v.uutween) { // [ATOMIC]
      for (j = 0, jz = all ? v.uutweenq.length : 1; j < jz; ++j) {
        v.uutweenq[j].fin = 1;
      }
    }
  }
  return (node === void 0) ? ary : node;
}

// inner - build params
function _uutweenbuild(node, param) {
  function _toabs(curt, end, fn, ope) {
    if (uu.isnum(end)) { return end; }
    ope = end.slice(0, 2);
    return (ope === "+=") ? curt + fn(end.slice(2))
         : (ope === "-=") ? curt - fn(end.slice(2))
         : fn(end);
  }
  var cs = uu.css(node), i, v, w, v0, v1, v2, fn, off, size,
      rv = [[], []];

  for (i in param) {
    if (uu.isary(param[i])) {
      v1 = param[i][0]; // param.val
      v2 = param[i][1] || _uutweeneaseinoutquad; // param.ezfn
    } else {
      v1 = param[i]; // param.val
      v2 = _uutweeneaseinoutquad; // param.ezfn
    }
    switch (w = _FIX[i] || i) {
    case "opacity": // [o][opacity]
      v0 = uu.css[w].get(node);
      v1 = _toabs(v0, v1, parseFloat);
      fn =  (function(prop, v0, v1, v2, delta) {
              return function(fin, gain, ms) {
                uu.css[prop].set(node, fin ? v1 : v2(gain, v0, delta, ms));
              };
            })(w, v0, v1, v2, v1 - v0);
      break;
    case "left": // [x][left][y][top]
    case "top":
      off || (off = uu.css.off.get(node, null, 1)); // offset from foster
      v0 = (w === "top") ? off.y : off.x;
      v1 = _toabs(v0, v1, parseInt);
      fn =  (function(prop, v0, v1, v2, delta) {
              return function(fin, gain, ms) {
                node.style[prop] = (fin ? v1 : v2(gain, v0, delta, ms)) + "px";
              };
            })(w, v0, v1, v2, v1 - v0);
      break;
    case "color": // [color][bgcolor][backgroundColor]
    case "backgroundColor":
      fn =  (function(prop, v0, v1, v2) {
              return function(fin, gain, ms, gd) {
                gd = gain / (ms || 1); // [division by zero]
                node.style[prop] = "#" +
                    v2[parseInt(fin ? v1.r : (v1.r - v0.r) * gd + v0.r)] +
                    v2[parseInt(fin ? v1.g : (v1.g - v0.g) * gd + v0.g)] +
                    v2[parseInt(fin ? v1.b : (v1.b - v0.b) * gd + v0.b)];
              };
            })(w, uu.color(cs[w], 1), uu.color(v1, 1), _HEX2);
      break;
    default: // [w][width][h][height][other]
      v0 = uu.css.px(node, w) || 0;
      v1 = _toabs(v0, v1, parseInt);
      fn =  (function(prop, v0, v1, v2, delta) {
              return function(fin, gain, ms) {
                node.style[prop] = (fin ? v1 : v2(gain, v0, delta, ms)) + "px";
              };
            })(w, v0, v1, v2, v1 - v0);
    }
    rv[0].push(w);  // properties
    rv[1].push(fn); // tween funcs
  }
  return rv;
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
  return (t /= d / 2) < 1 ?  c / 2 * t * t + b
                          : -c / 2 * ((--t) * (t - 2) - 1) + b;
}

})(window, document, uu);

