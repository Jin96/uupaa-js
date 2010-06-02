
// === uu.node.normalize ===
//{{{!depend uu
//}}}!depend

uu.node.normalize || (function(uu) {

uu.node.normalize = uunodenormalize;  // uu.node.normalize(ctx = body, depth = 0)

// uu.node.normalize - removes CRLF/blank-text/white-space/comment node
function uunodenormalize(parent,  // @param Node(= <body>): parent node
                         depth) { // @param Number(= 1): max depth
                                  // @return Number: removed node count
    // diet blank and comment nodes
    function diet(node, dig) {
        var w = node.firstChild;

        for (; w; w = w.nextSibling) {
            switch (w.nodeType) {
            case 1: (dig + 1 < limit) && diet(w, dig + 1); break; // recursive
            case 3: if (NOT_BLANK.test(w.nodeValue)) {
                        break;
                    }
            case 8: rv.push(w); // comment node
            }
        }
    }

    var rv = [], v, i = -1, limit = depth || 1, NOT_BLANK = /\S/;

    diet(parent, 0);

    // remove
    while ( (v = rv[++i]) ) {
        v.parentNode.removeChild(v);
    }
    return rv.length;
}

})(uu);

