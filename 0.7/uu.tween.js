
// === Tween ===
// depend: uu.js, uu.color.js, uu.css.js(uu.css.opacity)

uu.waste || (function(win, doc, uu) {
var _IOQUAD = "(t=gain,b=%f,c=%f,(t/=ms2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b)",
    _ALPHA = /^alpha\([^\x29]+\) ?/,
    _PROPS = { opacity: 1, color: 2, backgroundColor: 2, left: 3, top: 3,
               width: 4, height: 4 },
    _FMT = ['var t,b,c,ms2=ms/2,ns=node.style;',
            'var _2=%3$s;_2=(_2>0.999)?1:(_2<0.001)?0:_2;' + // opacity
            (uu.ie ? 'ns.filter=((_2>0&&_2<1)?"alpha(opacity="+(_2*100)+")":"");' +
                     'fin&&uu.css.opacity.set(node,%2$f)&&(ns.filter+=" %1$s");'
                   : 'ns.opacity=fin?%2$f:_2;'),
            'var gms=gain/ms,hex=uu.dmz.HEX2;' +
            'ns.%s="#"+(hex[(fin?%5$d:(%5$d-%2$d)*gms+%2$d)|0]||0)+' + // (bg)color
                      '(hex[(fin?%6$d:(%6$d-%3$d)*gms+%3$d)|0]||0)+' +
                      '(hex[(fin?%7$d:(%7$d-%4$d)*gms+%4$d)|0]||0);',
            'ns.%s=(fin?%f:%s)+"px";', // left, top, other
            'var v=fin?%2$f:%3$s;v=v<0?0:v;ns.%1$s=v+"px";']; // width, height

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
// [4][with easing fu] uu.tween(node, 500, { h: [200, "easing function name"] })
function uutween(node,  // @param Node:
                 ms,    // @param Number: duration
                 param, // @param Hash: { prop: end, ... }
                        //           or { prop: [val, ezfn], ... }
                        //    param.val Number/String: end value,
                        //    param.ezfn String(= void 0):
                 fn) {  // @param Function(= void 0): callback, fn(node, style)
                        // @return Node:
  function _twloop() {
    var q = node.uutweenq[0],
        tm = q.tm ? +new Date
                  : (q.js = _twjs(node, q.pa), q.tm = +new Date),
        fin = q.fin || (tm >= q.tm + q.ms);

    q.js(node, fin, tm - q.tm, q.ms); // call(node, finish, gain, ms)
    if (fin) {
      q.fn && q.fn(node, node.style); // fn(node, node.style)
      node.uutweenq.shift();
      node.uutweenq.length || (clearInterval(node.uutween), node.uutween = 0);
    }
  }
  node.style.overflow = "hidden";
  node.uutweenq || (node.uutweenq = []); // init tween queue
  node.uutweenq.push({ tm: 0, ms: Math.max(ms, 1), pa: param, fn: fn, fin: 0 });
  node.uutween ||
      (node.uutween = setInterval(_twloop, ((1000 / param.fps) | 0) || 1));
  return node;
}

// uu.tween.fin
function uutweenfin(node,  // @param Node(= 0): 0 is all node
                    all) { // @param Number(= 0): 1 is finish all
                           // @return Node/NodeArray:
  var ary = node ? [node] : uu.tag("*", doc.body), v, i = 0, j, jz;

  while( (v = ary[i++]) ) {
    if (v.uutween) {
      for (j = 0, jz = all ? v.uutweenq.length : 1; j < jz; ++j) {
        v.uutweenq[j].fin = 1; // fin bit
      }
    }
  }
  return (node === void 0) ? ary : node;
}

// uu.tween.running
function uutweenrunning(node) { // @param Node:
                                // @return Boolean:
  return !!node.uutween;
}

// inner - build javascript function
function _twjs(node, param) {
  function _build(n, word, v0, v1, ez) {
    return uu.fmt(_FMT[n], word, v1,
                  ez ? uu.fmt("Math.%s(gain,%f,%f,ms)", ez, v0, v1 - v0)
                     : uu.fmt(_IOQUAD, v0, v1 - v0));
  }
  function _toabs(curt, end, fn, ope) {
    if (uu.isnum(end)) { return end; }
    ope = end.slice(0, 2);
    return (ope === "+=") ? curt + fn(end.slice(2))
         : (ope === "-=") ? curt - fn(end.slice(2)) : fn(end);
  }
  var rv = _FMT[0], i, v0, v1, ez, w, n,
      cs = win.getComputedStyle(node, null, 1);

  for (i in param) {
    if (i !== "fps") {
      ez = 0;
      uu.isary(param[i]) ? (v1 = param[i][0], ez = param[i][1]) // val, ezfn
                         : (v1 = param[i]); // param.val

      switch (n = _PROPS[w = uu.dmz.FIX[i] || i]) {
      case 1: // opacity
        v0 = uu.css[w].get(node);
        "uucssopacity" in node || uu.css[w].set(node, v0); // [IE] set opacity
        rv += _build(n, uu.ie ? node.style.filter.replace(_ALPHA, "") : "",
                     v0, _toabs(v0, v1, parseFloat), ez);
        break;
      case 2: // [color][bgcolor][backgroundColor]
        v0 = uu.color(cs[w], 1);
        v1 = uu.color(v1, 1);
        rv += uu.fmt(_FMT[n], w, v0.r, v0.g, v0.b, v1.r, v1.g, v1.b);
        break;
      case 3:
        v0 = (w === "top") ? node.offsetTop : node.offsetLeft;
      default:
        n === 3 || (v0 = parseInt(cs[w]) || 0);
        rv += _build(n || 3, w, v0, _toabs(v0, v1, parseInt), ez);
      }
    }
  }
  return new Function("node", "fin", "gain", "ms", rv);
}

})(window, document, uu);

