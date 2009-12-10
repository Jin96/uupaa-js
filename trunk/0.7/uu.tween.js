
// === Tween ===
// depend: uu.js, uu.color.js, uu.css.js

// Math.linear
Math.linear = function(t, b, c, d) {
  return c * t / d + b;
};

// Math.easeInOutQuad
Math.easeInOutQuad = function(t, b, c, d) {
  return (t /= d / 2) < 1 ?  c / 2 * t * t + b
                          : -c / 2 * ((--t) * (t - 2) - 1) + b;
};

uu.waste || (function(win, doc, uu) {
var _FIX = uu.dmz.FIX,
    _TWSTYLES = { opacity: 1, color: 2, backgroundColor: 2, left: 3, top: 3 },
    _TWFMT1 = 'uu.css.opacity.set(node,fin?%f:Math.%s(gain,%f,%f,ms));',
    _TWFMT2 = 'var g=gain/(ms||1),cv0=%j,cv1=%j,cv2=uu.dmz.HEX2,F=parseInt;' +
              'node.style.%s="#"+(cv2[F(fin?cv1.r:(cv1.r-cv0.r)*g+cv0.r)]||0)+' +
                                '(cv2[F(fin?cv1.g:(cv1.g-cv0.g)*g+cv0.g)]||0)+' +
                                '(cv2[F(fin?cv1.b:(cv1.b-cv0.b)*g+cv0.b)]||0);',
    _TWFMT3 = 'node.style.%s=(fin?%f:Math.%s(gain,%f,%f,ms))+"px";';

uu.mix(uu, {
  tween: uu.mix(uutween, {      // uu.tween(node, ms, {...}, fn = void 0) -> node
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
        fin = q.fin || (now >= (q.tm + q.ms));

    q.raw(node, fin, now - q.tm, q.ms, 0); // update styles
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
        v.uutweenq[j].fin = 1; // fin bit
      }
    }
  }
  return (node === void 0) ? ary : node;
}

// inner - build function
function _uutweenbuild(node, param) {
  function _toabs(curt, end, fn, ope) {
    if (uu.isnum(end)) { return end; }
    ope = end.slice(0, 2);
    return (ope === "+=") ? curt + fn(end.slice(2))
         : (ope === "-=") ? curt - fn(end.slice(2))
         : fn(end);
  }
  var rv = "", i, v0, v1, v2, w, off;

  for (i in param) {
    if (uu.isary(param[i])) {
      v1 = param[i][0]; // param.val
      v2 = param[i][1] || "easeInOutQuad"; // param.ezfn
    } else {
      v1 = param[i]; // param.val
      v2 = "easeInOutQuad"; // param.ezfn
    }
    switch (_TWSTYLES[w = _FIX[i] || i]) {
    case 1: // [o][opacity]
      v0 = uu.css[w].get(node);
      v1 = _toabs(v0, v1, parseFloat);
      rv += uu.fmt(_TWFMT1, v1, v2, v0, v1 - v0);
      break;
    case 2: // [color][bgcolor][backgroundColor]
      rv += uu.fmt(_TWFMT2, uu.color(uu.css(node)[w], 1), uu.color(v1, 1), w);
      break;
    case 3: // [x][left][y][top]
      off || (off = uu.css.off.get(node, null, 1)); // offset from foster
      v0 = (w === "top") ? off.y : off.x;
      v1 = _toabs(v0, v1, parseInt);
      rv += uu.fmt(_TWFMT3, w, v1, v2, v0, v1 - v0);
      break;
    default: // [w][width][h][height][other]
      v0 = uu.css.px(node, w) || 0;
      v1 = _toabs(v0, v1, parseInt);
      rv += uu.fmt(_TWFMT3, w, v1, v2, v0, v1 - v0);
    }
  }
  return new Function("node", "fin", "gain", "ms", rv);
}

// uu.tween.running
function uutweenrunning(node) { // @param Node:
                                // @return Boolean:
  return !!node.uutween;
}

})(window, document, uu);

