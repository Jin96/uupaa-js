// === Node ================================================
// depend: none
uu.feat.node = {};

uu.node = {
  FIRST:       1, // uu.node.FIRST - first sibling
  PREV:        2, // uu.node.PREV - prev sibling
  NEXT:        3, // uu.node.NEXT - next sibling
  LAST:        4, // uu.node.LAST - last sibling
  FIRST_CHILD: 5, // uu.node.FIRST_CHILD - first child
  LAST_CHILD:  6, // uu.node.LAST_CHILD - last child

  // uu.node.insert - insert ELEMENET_NODE or "<HTMLString>"
  insert: function(node,       // DocumentFragment/HTMLString:
                   context,    // Node(default: document.body): parent node
                   position) { // Number(default: uu.node.LAST_CHILD): insert position
    var rv = node, ctx = context || uudoc.body, pn = ctx.parentNode;

    if (typeof node === "string") { // html to node
      node = uu.node.substance(node, ctx);
      rv = node.firstChild;
    }
    switch (position || 6) {
    case 1: ctx = pn; // break;
    case 5: ctx.firstChild ? ctx.insertBefore(node, ctx.firstChild)
                           : ctx.appendChild(node); break;
    case 4: ctx = pn; // break;
    case 6: ctx.appendChild(node); break;
    case 2: pn.insertBefore(node, ctx); break;
    case 3: (pn.lastChild === ctx) ? pn.appendChild(node)
                                   : pn.insertBefore(node, ctx.nextSibling);
    }
    return rv; // return Node: first element
  },

  // uu.node.insertText - insert TEXT_NODE or "TextString"
  insertText: function(node,       // DocumentFragment/TextString:
                       context,    // Node(default: document.body): parent node
                       position) { // Number(default: uu.node.LAST_CHILD): insert position
    return uu.node.insert(typeof node === "string" ? uudoc.createTextNode(node)
                                                   : node, context, position);
    // return Node: first text element
  },

  // uu.node.replace - replace oldNode
  replace: function(node,      // Node: new element
                    oldNode) { // Node: old element(cutout)
    return oldNode.parentNode.replaceChild(node, oldNode); // return oldNode
  },

  // uu.node.remove - remove node 
  remove: function(node) { // Node:
    return node.parentNode.removeChild(node); // return node
  },

  // uu.node.clear - clear all children
  clear: function(node) { // Node: parent node
    node.innerHTML = "";
    return node; // return node
  },

  // uu.node.substance - convert HTMLString into DocumentFragment
  substance: function(html,      // HTMLString:
                      context) { // Node: node or owner document
    var rv, range, placeholder;

    // use DOM Level2 Range Module
    if (uudoc.createRange && !(UU.OPERA && opera.version() >= 9.5)) {
      // see http://d.hatena.ne.jp/uupaa/20081021/1224525518
      range = uudoc.createRange();
      range.selectNode(context);
      return range.createContextualFragment(html);
    }
    rv = uudoc.createDocumentFragment();
    placeholder = uudoc.createElement("div");
    placeholder.innerHTML = html;
    while (placeholder.firstChild) {
      rv.appendChild(placeholder.removeChild(placeholder.firstChild));
    }
    return rv; // return DocumentFragment
  },

  // uu.node.cutdown - cut all nodes less than context and return DocumentFragment
  cutdown: function(context) { // Node(default: document.body): parent node
    var rv, ctx = context || uudoc.body;
    if (uudoc.createRange) {
      (rv = uudoc.createRange()).selectNodeContents(ctx);
      return rv.extractContents(); // return DocumentFragment
    }
    rv = uudoc.createDocumentFragment();
    while (ctx.firstChild) {
      rv.appendChild(ctx.removeChild(ctx.firstChild));
    }
    return rv; // return DocumentFragment
  },

  // uu.node.normalize - removes CRLF/blank-text/white-space/comment node
  normalize: function(context, // Node(default: document.body): parent node
                      depth) { // Number(default: 0): max depth
    var rv = [], v, i = 0, blank = /\S/, limit = depth || 0;

    function LOOP(elm, depth) {
      for (var w = elm.firstChild; w; w = w.nextSibling) {
        switch (w.nodeType) {
        case 1: (depth + 1 <= limit) && LOOP(w, depth + 1); break; // recursive
        case 3: if (blank.test(w.nodeValue)) { break; } // blank-text node?
        case 8: rv.push(w); // comment node
        }
      }
    }

    LOOP(context, 0);
    while ( (v = rv[i++]) ) {
      v.parentNode.removeChild(v);
    }
  }
};
