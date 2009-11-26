
// === Node++ ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {

uu.mix(uu, {
  svg:          uusvg,          // uu.svg(tag) -> new <svg> element
  flash:        uuflash,        // uu.flash("http://...", width, height) -> new <object> element
  xpath:        uuxpath         // uu.xpath(node) -> "/html/body/div[5]"
});
uu.mix(uu.node, {
    diet:       uunodediet,     // uu.node.diet(ctx = body, depth = 0)
    index:      uunodeindex,    // [1][find node index] uu.node.index(node) -> Number
                                // [2][find tag index]  uu.node.index(node, "div") -> Number
    first:      uunodefirst,    // [1][find] uu.node.first(node) -> find first sibling
                                // [2][add]  uu.node.first(ctx, uu.div()) -> HTMLDivElement
                                // [3][add]  uu.node.first(ctx, "<div><p>txt</p></div>") -> HTMLDivElement
    prev:       uunodeprev,     // @see uu.node.first
    next:       uunodenext,     // @see uu.node.first
    last:       uunodelast,     // @see uu.node.first
    firstChild: uunodefirstchild,
    lastChild:  uunodelastchild,
    data: uu.mix(uunodedata, {  // [1][get all] uu.node.data(node) -> { key: value, ... }
                                // [2][get one] uu.node.data(node, key) -> Mix
                                // [3][set]     uu.node.data(node, key, value) -> node
      get:      uunodedataget,  // uu.node.data.get(node, key) -> Mix
      set:      uunodedataset,  // uu.node.data.set(node, key, value) -> node
      clear:    uunodedataclear // [1][clear data] uu.node.data.clear(node, key) -> node
                                // [2][clear all data] uu.node.data.clear(node) -> node
    })
});

// uu.svg - create SVG element
function uusvg(tag) { // @param String: svg tag
                      // @return Node: new <svg> element
  return doc.createElementNS("http://www.w3.org/2000/svg", tag);
}

// uu.flash - create <object> element for Flash
function uuflash(url,      // @param URLString:
                 width,    // @param Number:
                 height,   // @param Number:
                 option) { // @param Hash(= { wmode: "transparent",
                           //                 play: "true", loop: "false" }):
                           // @return Node: new <object> element
  var rv = uu.mix(doc.createElement("object"),
                  { type: "application/x-shockwave-flash",
                    data: url, width: width, height: height }),
      h = uu.arg(option, { movie: url, wmode: "transparent",
                           play: "true", loop: "false" }), i;

  for (i in h) {
    rv.appendChild(uu.mix(doc.createElement("param"),
                          { name: i, value: h[i] }));
  }
  return rv;
}

// uu.xpath - get xpath
function uuxpath(node) { // @param Node: ELEMENT_NODE
                         // @return XPathString: "/html/body/div[5]" or ""
  if (!node.parentNode || node.nodeType !== 1) { return ""; }
  var rv = [], n = node;

  while (n && n.nodeType === 1) {
    rv.push(n.tagName.toLowerCase());
    n = n.parentNode;
  }
  return "/" + rv.reverse().join("/") +
         "[" + uunodeindex(node, node.tagName) + "]";
}

// uu.node.diet - removes CRLF/blank-text/white-space/comment node
function uunodediet(ctx,     // @param Node(= document.body): parent node
                    depth) { // @param Number(= 0): max depth
  function _impl(elm, depth) {
    for (var w = elm.firstChild; w; w = w.nextSibling) {
      switch (w.nodeType) {
      case 1: (depth + 1 <= limit) && _impl(w, depth + 1); break; // recursive
      case 3: if (BLANK.test(w.nodeValue)) { break; } // blank-text node?
      case 8: rv.push(w); // comment node
      }
    }
  }
  var rv = [], v, i = 0, limit = depth || 0, BLANK = /\S/;

  _impl(ctx, 0);
  while ( (v = rv[i++]) ) {
    v.parentNode.removeChild(v);
  }
}

// uu.node.index
// [1][find node index] uu.node.index(node) -> Number
// [2][find tag index]  uu.node.index(node, "div") -> Number
function uunodeindex(node,  // @param Node: ELEMENT_NODE
                     tag) { // @param String(= ""): tag
                            // @return Number: ELEMENT_NODE index(from 1) or -1
  var rv = 0, cn = node.parentNode.firstChild;

  for (; cn; cn = cn.nextSibling) {
    tag ? ((cn.tagName === tag) && ++rv)
        : ((cn.nodeType === 1) && ++rv); // 1: ELEMENT_NODE
    if (cn === node) {
      return rv;
    }
  }
  return -1;
}

// uu.node.first - find first sibling node / add first sibling node
// [1][find] uu.node.first(ctx) -> find first sibling
// [2][add]  uu.node.first(ctx, uu.div()) -> HTMLDivElement
// [3][add]  uu.node.first(ctx, "<div><p>txt</p></div>") -> HTMLDivElement
function uunodefirst(ctx,    // @param Node: context
                     data) { // @param Node/DocumentFragment/HTMLString:
                             // @return Node: found node / first node
  return data ? uu.node(data, ctx, 1) // 1: first sibling
              : _nodefindfirst(ctx);
}

// uu.node.prev - find previous sibling node / add previous sibling node
function uunodeprev(ctx, data) { // @see uu.node.first
  return data ? uu.node(data, ctx, 2) // 2: prev sibling
              : _nodefindprev(ctx);
}

// uu.node.next - find next sibling node / add next sibling node
function uunodenext(ctx, data) { // @see uu.node.first
  return data ? uu.node(data, ctx, 3) // 3: next sibling
              : _nodefindprev(ctx, 1);
}

// uu.node.last - find last sibling node / add last sibling node
function uunodelast(ctx, data) { // @see uu.node.first
  return data ? uu.node(data, ctx, 4)  // 4: last sibling
              : _nodefindfirst(ctx, 1);
}

// uu.node.firstChild - find firstChild node / add firstChild node
function uunodefirstchild(ctx, data) { // @see uu.node.first
  return data ? uu.node(data, ctx, 5) // 5: first child
              : _nodefindfirst(ctx, 0, 1);
}

// uu.node.lastChild - find lastChild node / add lastChild node
function uunodelastchild(ctx, data) { // @see uu.node.first
  return data ? uu.node(data, ctx, 6)  // 6: last child
              : _nodefindfirst(ctx, 1, 1);
}

// inner - find first / last sibling node
function _nodefindfirst(node, last, child) {
  var ctx  = child ? node : node.parentNode,
      rv   = last ? ctx.lastElementChild : ctx.firstElementChild,
      iter = last ? "previousSibling" : "nextSibling";

  if (!rv) {
    for (rv = last ? ctx.lastChild : ctx.firstChild; rv; rv = rv[iter]) {
      if (rv.nodeType === 1) { break; } // 1: ELEMENT_NODE only
    }
  }
  return rv;
}

// inner - find prev / next sibling node
function _nodefindprev(node, next) {
  var rv   = next ? node.nextElementSibling : node.previousElementSibling,
      iter = next ? "nextSibling" : "previousSibling";

  if (!rv) {
    for (rv = node[iter]; rv; rv = rv[iter]) {
      if (rv.nodeType === 1) { break; } // 1: ELEMENT_NODE only
    }
  }
  return rv;
}

// uu.node.data - node.data accessor
// [1][get all] uu.node.data(node) -> { key: value, ... }
// [2][get one] uu.node.data(node, key) -> Mix
// [3][set]     uu.node.data(node, key, value) -> node
function uunodedata(node,    // @param Node:
                    key,     // @param String: key
                    value) { // @param Mix(= void 0): value
                             // @return Hash/Mix/Node:
  return (value === void 0 ? uunodedataget : uunodedataset)(node, key, value);
}

// uu.node.data.get - get node.data
// [1][get all] uu.node.data.get(node) -> { key: value, ... }
// [2][get one] uu.node.data.get(node, key) -> Mix
function uunodedataget(node,  // @param Node:
                       key) { // @param String: key
                              // @return Mix/void 0: value or void 0
  node.uudata || (node.uudata = {});
  return (key === void 0) ? node.uudata : node.uudata[key];
}

// uu.node.data.set - set node.data
function uunodedataset(node,    // @param Node:
                       key,     // @param String: key
                       value) { // @param Mix: value
                                // @return Node:
  node.uudata || (node.uudata = {});
  node.uudata[key] = value; // set or overwrite
  return node;
}

// uu.node.data.clear - clear node.data
// [1][clear data] uu.node.data.clear(node, key) -> node
// [2][clear all data] uu.node.data.clear(node) -> node
function uunodedataclear(node,  // @param Node:
                         key) { // @param String(= void 0): key
                                // @return Node:
  // [IE6][IE7] fix, http://d.hatena.ne.jp/uupaa/20090924/
  if (node.uudata) {
    (key === void 0) ? (node.uudata = void 0)
                     : (node.uudata[key] = void 0);
  }
  return node;
}

})(window, document, uu);

