
// === Node++ ===
//{{{!depend uu
//}}}!depend

uu.node.find || (function(win, doc, uu) {

uu.svg      = uusvg;        // uu.svg(tag) -> new <svg> element
uu.xpath    = uuxpath;      // uu.xpath(node) -> "/html/body/div[5]"

uu.node.diet = uunodediet;  // uu.node.diet(ctx = body, depth = 0)

// uu.node.first            // uu.node.first(source, context):Node
// uu.node.prev             // uu.node.prev(source, context):Node
// uu.node.next             // uu.node.next(source, context):Node
// uu.node.last             // uu.node.last(source, context):Node
// uu.node.firstChild       // uu.node.firstChild(source, context):Node
// uu.node.lastChild        // uu.node.lastChild(source, context):Node

uu.node.find = uunodefind;  // [1][find node index] uu.node.find(node) -> Number
                            // [2][find tag index]  uu.node.find(node, "div") -> Number
// uu.node.find.first       // uu.node.find.first(ctx) -> node
// uu.node.find.prev        // uu.node.find.prev(ctx) -> node
// uu.node.find.next        // uu.node.find.next(ctx) -> node
// uu.node.find.last        // uu.node.find.last(ctx) -> node
// uu.node.find.firstChild  // uu.node.find.firstChild(ctx) -> node
// uu.node.find.lastChild   // uu.node.find.lastChild(ctx) -> node

uu.node.data = uunodedata;  // [1][get all] uu.node.data(node) -> { key: value, ... }
                            // [2][get one] uu.node.data(node, key) -> Mix
                            // [3][set]     uu.node.data(node, key, value) -> node
uu.node.data.get = uunodedataget;       // uu.node.data.get(node, key) -> Mix
uu.node.data.set = uunodedataset;       // uu.node.data.set(node, key, value) -> node
uu.node.data.clear = uunodedataclear;   // [1][clear data] uu.node.data.clear(node, key) -> node
                                        // [2][clear all data] uu.node.data.clear(node) -> node

// uu.svg - create SVG element
function uusvg(tag) { // @param String: svg tag
                      // @return Node: new <svg> element
    return doc.createElementNS("http://www.w3.org/2000/svg", tag);
}

// uu.xpath - get xpath
function uuxpath(node) { // @param Node: ELEMENT_NODE
                         // @return XPathString: "/html/body/div[5]" or ""
    if (!node.parentNode || node.nodeType !== 1) {
        return "";
    }

    var rv = [], n = node;

    while (n && n.nodeType === 1) {
        rv.push(n.tagName.toLowerCase());
        n = n.parentNode;
    }
    return "/" + rv.reverse().join("/") +
           "[" + uunodefind(node, node.tagName) + "]";
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
    var rv = [], v, i = -1, limit = depth || 0, BLANK = /\S/;

    _impl(ctx, 0);
    while ( (v = rv[++i]) ) {
        v.parentNode.removeChild(v);
    }
}

// uu.node.find - find node index
// [1][find node index] uu.node.index(node) -> Number
// [2][find tag index]  uu.node.index(node, "div") -> Number
function uunodefind(node,  // @param Node: ELEMENT_NODE
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

uu.each({ first: 1, prev: 2, next: 3, last: 4,
          firstChild: 5, lastChild: 6 }, function(pos, method) {
    // uu.node.first - add first sibling node
    // [1][add] uu.node.first(uu.p(), ctx) -> <p>
    // [2][add] uu.node.first("<p>html</p>", ctx) -> <p>
    uu.node[method] = function(source,    // @param Node/DocumentFragment/HTMLFragment/TagName:
                               context) { // @param Node(= <body>): context
                                          // @return Node: first node
        return uu.node.add(source, context, pos);
    };
    // uu.node.find.first - find first sibling node
    uunodefind[method] = function(ctx) { // @param Node: context
                                         // @return Node: node
        switch (pos) {
        case 1: return _nodefindfirst(ctx); // first
        case 2: return _nodefindprev(ctx); // prev
        case 3: return _nodefindprev(ctx, 1); // next
        case 4: return _nodefindfirst(ctx, 1); // last
        case 5: return _nodefindfirst(ctx, 0, 1); // firstChild
        }
        return _nodefindfirst(ctx, 1, 1); // lastChild
    }
});

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

