
// === Live ===
// depend: uu.js
//
uu.waste || (function(win, doc, uu) {
var _livedb = {}; // { "expr\vnamespace.click": {...}, ... }

// uu.match
uu.match = uumatch;             // uu.match("p > a", NodeArray/Node, rtype = 0) -> Boolean/NodeArray

// uu.live
uu.live = uu.mix(uulive, {      // uu.live("css > expr", "namespace.click", fn)
  has:          uulivehas,      // uu.live.has("css > expr", "namespace.click") -> Boolean
  unbind:       uuliveunbind    // uu.live.unbind("css > expr" = void 0, "namespace.click" = void 0)
});

// uu.match - document.matchesSelector like function
function uumatch(expr,    // @param String: "css > expr"
                 ctx,     // @param NodeArray/Node: match context
                 rtype) { // @param Number(= 0): result type,
                          //             0 is Boolean result, matches all,
                          //             1 is Boolean result, matches any,
                          //             2 is NodeArray result, matches array
                          // @return Boolean/NodeArray:
  ctx = ctx.nodeType ? [ctx] : ctx;
  var rv = [], hash = {}, v, w, i = 0, j = 0, ary = uu.query(expr, doc);

  if (ctx.length === 1) {
    v = ctx[0];
    while ( (w = ary[i++]) ) {
      if (v === w) {
        rv.push(v);
        break;
      }
    }
  } else {
    while ( (v = ary[i++]) ) {
      hash[v.uuguid || uu.nodeid(v)] = 1;
    }
    while ( (v = ctx[j++]) ) {
      (v.uuguid || uu.nodeid(v)) in hash && rv.push(v);
    }
  }
  return !rtype ? rv.length === ctx.length : rtype < 2 ? !!rv.length : rv;
}

// uu.live
// http://d.hatena.ne.jp/uupaa/20091231
function uulive(expr,   // @param String: "css > expr"
                nstype, // @param String: "namespace.click"
                fn) {   // @param Function: callback fn(evt, node, src)
  function _uuliveclosure(evt) {
    evt = evt || win.event;
    var src = evt.srcElement || evt.target;

    src = (uu.webkit && src.nodeType === 3) ? src.parentNode : src;
    if (uu.match(expr, src)) {
      evt.node = doc;
      evt.code = (uupub.EVCODE[evt.type] || 0) & 255;
      evt.src = src;
      evt.px = uu.ie ? evt.clientX + uupub.iebody.scrollLeft : evt.pageX;
      evt.py = uu.ie ? evt.clientY + uupub.iebody.scrollTop  : evt.pageY;
      evt.ox = evt.offsetX || evt.layerX || 0; // [offsetX] IE, Opera, WebKit
      evt.oy = evt.offsetY || evt.layerY || 0; // [layerX]  Gecko, WebKit
      handler.call(fn, evt, doc, src);
    }
  }
  if (!uulivehas(expr, nstype)) {
    var ary = nstype.split("."), // "namespace.click" -> ["namespace", "click"]
        type = ary.pop(), ns = ary.pop() || "",
        handler = uu.isfunc(fn) ? fn : fn.handleEvent,
        closure = fn.uuevliveclosure = _uuliveclosure;

    _livedb[expr + "\v" + nstype] = {
        expr: expr, ns: ns, type: type, nstype: nstype, fn: closure };
    uu.ev.attach(doc, uupub.EVFIX[type] || type, closure);
  }
}

// uu.live.has
function uulivehas(expr,     // @param String: "css > expr"
                   nstype) { // @param String: "namespace.click"
  var db = _livedb[expr + "\v" + nstype];

  return db && expr === db.expr && nstype === db.nstype;
}

// uu.live.unbind
// [1][unbind all] uu.live.unbind()
// [2][unbind all] uu.live.unbind("expr")
// [3][unbind one] uu.live.unbind("expr", "click")
// [4][unbind namespace all] uu.live.unbind("expr", "namespace.*")
// [5][unbind namespace one] uu.live.unbind("expr", "namespace.click")
function uuliveunbind(expr,     // @param String(= void 0): "css > expr"
                      nstype) { // @param String(= void 0): "namespace.click"
  var ns, v, i, r,
      mode = !expr ? 1 :   // [1]
             !nstype ? 2 : // [2]
             nstype.indexOf("*") < 0 ? 3 :  // [3][5]
             (ns = nstype.slice(0, -2), 4); // [4] "namespace.*" -> "namespace"

  for (i in _livedb) { // i = "expr\vnamespace.click"
    v = _livedb[i];    // v = { expr, ns, type, nstype, closure }
    r = 1;
    switch (mode) {
    case 2: r = expr === v.expr; break; // [2]
    case 3: r = expr === v.expr && nstype === v.nstype; break; // [3][5]
    case 4: r = expr === v.expr && ns === v.ns; // [4]
    }
    if (r) {
      uu.ev.detach(doc, v.type, v.fn);
      delete _livedb[i];
    }
  }
}

})(window, document, uu);

