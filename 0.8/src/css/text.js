
// === uu.css.text ===
//#include uupaa.js

uu.css.textSelectable || (function(win, uu) {

uu.css.textSelectable = textSelectable; // uu.css.textSelectable(node:Node, allow:Boolean = false):Node

// uu.css.textSelectable - set text selectable
function textSelectable(node,    // @param Node:
                        allow) { // @param Boolean(= false):
                                 // @return Node:
//{{{!mb
    if (uu.webkit) {
//}}}!mb
        node.style.WebkitUserSelect = allow ? "" : "none";
//{{{!mb
    } else if (uu.gecko) {
        node.style.MozUserSelect = allow ? "" : "none";
    } else if (uu.ie || uu.opera) {
        node.unselectable  = allow ? "" : "on";
        node.onselectstart = allow ? "" : "return false";
//      node = node.parentNode;
    }
    node.style.userSelect = allow ? "" : "none";
//}}}!mb
    return node;
}

})(this, uu);

