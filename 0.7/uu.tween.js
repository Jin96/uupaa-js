
// === Tween ===
//{{{!depend uu, uu.color, uu.css, uu.string
//}}}!depend

uu.tween || (function(win, doc, uu) {

uu.tween         = uutween;         // uu.tween(node, ms, {...}, fn = void 0) -> node
uu.tween.skip    = uutweenskip;     // uu.tween.skip(node = void 0, all = 0) -> node or [node, ...]
uu.tween.running = uutweenrunning;  // uu.tween.running(node) -> Boolean

// --- tween ---
// uu.tween - add queue
// [1][abs]            uu.tween(node, 500, { o: 0.5, x: 200 })
// [2][rel]            uu.tween(node, 500, { o: "=+0.5" })
// [3][with "px" unit] uu.tween(node, 500, { h: "=-100px" })
// [4][with easing fn] uu.tween(node, 500, { h: [200, "easing function name"] })
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
            tm = q.tm ? (nowimpl ? Date.now() : +new Date)
                      : (q.js = _twjs(node, q.pa), q.tm = +new Date),
            fin = q.fin || (tm >= q.tm + q.ms);

        q.js(node, fin, tm - q.tm, q.ms); // call(node, finish, gain, ms)
        if (fin) {
            q.fn && q.fn(node, node.style); // fn(node, node.style)
            node.uutweenq.shift();
            node.uutweenq.length ||
                (clearInterval(node.uutween), node.uutween = 0);
        }
    }
    var nowimpl = !!Date.now; // http://d.hatena.ne.jp/uupaa/20091223

    node.style.overflow = "hidden";
    node.uutweenq || (node.uutweenq = []); // init tween queue
    node.uutweenq.push({ tm: 0, ms: Math.max(ms, 1),
                         pa: param, fn: fn, fin: 0 });
    node.uutween ||
          (node.uutween = setInterval(_twloop, ((1000 / param.fps) | 0) || 1));
    return node;
}

// uu.tween.skip
function uutweenskip(node,  // @param Node(= void 0): void 0 is all node
                     all) { // @param Number(= 0): 1 is skip all
                            // @return Node/NodeArray:
    var ary = node ? [node] : uu.tag("*", doc.body), v, i = -1, j, jz;

    while( (v = ary[++i]) ) {
        if (v.uutween) {
            for (j = 0, jz = all ? v.uutweenq.length : 1; j < jz; ++j) {
                v.uutweenq[j].fin = 1; // fin bit
            }
        }
    }
    return node || ary;
}

// uu.tween.running
function uutweenrunning(node) { // @param Node:
                                // @return Boolean:
    return !!node.uutween;
}

// inner - build javascript function
function _twjs(node, param) {
    function _build(n, word, v0, v1, ez) {
        return uu.sprintf(_twjs._FMT[n], word, v1,
                          ez ? uu.sprintf("Math.%s(gain,%f,%f,ms)", ez, v0, v1 - v0)
                             : uu.sprintf(_twjs._IOQUAD, v0, v1 - v0));
    }
    function _toabs(curt, end, fn, ope) {
        if (typeof end === "number") {
            return end;
        }
        ope = end.slice(0, 2);
        return (ope === "+=") ? curt + fn(end.slice(2))
             : (ope === "-=") ? curt - fn(end.slice(2)) : fn(end);
    }
    var rv = _twjs._FMT[0], i, v0, v1, ez, w, n, fixdb = uu.fix._db,
        cs = win.getComputedStyle(node, null, 1);

    for (i in param) {
        if (i !== "fps") {
            ez = 0;
            Array.isArray(param[i]) ? (v1 = param[i][0], ez = param[i][1]) // val, ezfn
                                    : (v1 = param[i]); // param.val

            switch (n = _twjs._PROPS[w = fixdb[i] || i]) {
            case 1: // opacity
                v0 = uu.css[w].get(node);
                node.uucssopacity || uu.css[w].set(node, v0); // [IE] set opacity
                rv += _build(n, uu.ie ? node.style.filter.replace(_twjs._ALPHA, "")
                                      : "",
                             v0, _toabs(v0, v1, parseFloat), ez);
                break;
            case 2: // color
                v0 = uu.color(cs[w]);
                v1 = uu.color(v1);
                rv += uu.sprintf(_twjs._FMT[n], w, v0.r, v0.g, v0.b, v1.r, v1.g, v1.b);
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
_twjs._IOQUAD = "(t=gain,b=%f,c=%f,(t/=ms2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b)";
_twjs._PROPS = { opacity: 1, color: 2, backgroundColor: 2,
                 left: 3, top: 3, width: 4, height: 4 };
_twjs._ALPHA = /^alpha\([^\x29]+\) ?/;
_twjs._FMT = ['var t,b,c,ms2=ms/2,ns=node.style;',
              'var o=%3$s;o=(o>0.999)?1:(o<0.001)?0:o;' + // opacity
              (uu.ie ? 'ns.filter=((o>0&&o<1)?"alpha(opacity="+(o*100)+")":"");' +
                       'fin&&uu.css.opacity.set(node,%2$f)&&(ns.filter+=" %1$s");'
                     : 'ns.opacity=fin?%2$f:o;'),
              'var gms=gain/ms,hex=uu.hash._num2hh;' +
              'ns.%s="#"+(hex[(fin?%5$d:(%5$d-%2$d)*gms+%2$d)|0]||0)+' + // color
                        '(hex[(fin?%6$d:(%6$d-%3$d)*gms+%3$d)|0]||0)+' +
                        '(hex[(fin?%7$d:(%7$d-%4$d)*gms+%4$d)|0]||0);',
              'ns.%s=(fin?%f:%s)+"px";', // left, top, other
              'var w=fin?%2$f:%3$s;w=w<0?0:w;ns.%1$s=w+"px";']; // width, height

})(window, document, uu);

