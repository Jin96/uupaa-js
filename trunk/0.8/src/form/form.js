
// === uu.value ===
//#include uupaa.js

uu.value || (function(win, doc, uu) {

uu.value = uuvalue; // uu.value(node:Node, value:String = void):StringArray/Node
                    //  [1][get] uu.value(node) -> value or [value, ...]
                    //  [2][set] uu.value(node, "value") -> node
                    //  [3][get <textarea>]       uu.value(node) -> "innerText"
                    //  [4][get <button>]         uu.value(node) -> "<button value>"
                    //  [5][get <option>]         uu.value(node) -> "<option value>" or
                    //                                              "<option>value</option>"
                    //  [6][get <selet>]          uu.value(node) -> selected option value
                    //  [7][get <selet multiple>] uu.value(node) -> ["value", ...]
                    //  [8][get <input checkbox>] uu.value(node) -> ["value", ...]
                    //  [9][get <input radio>]    uu.value(node) -> "value"

uu.nodeSet.value = NodeSetValue; // NodeSet.value(value:String = void):StringArray/NodeSet
                                 //  [1][get] NodeSet.value() -> ["value", ...]
                                 //  [2][set] NodeSet.value("value") -> NodeSet

// uu.value - value accessor
function uuvalue(node,    // @param Node:
                 value) { // @param String(= void 0):
                          // @return String/Node:
    var tagName = node.tagName.toLowerCase(), type = 0;

    tagName === "select" && (type = node.multiple ? 3 : 2);
    tagName === "input" && (type = { radio: 4, checkbox: 5 }[node.type] || 0);

    return (value ? setValue : getValue)(type, node, value);
}

// inner -
function getValue(type,   // @param Number: nodeType
                  node) { // @param Node:
                          // @return StringArray/String:
    var rv = [], v, i = -1, ary, multi = type & 1;

    if (type) {
        if (type & 2) { // 2:<select>, 3:<select multiple>
            i = node.selectedIndex;
            if (i >= 0) {
                while ( (v = node.options[i++]) ) {
                    v.selected && rv.push(v.value || v.text);
                    if (!multi) { // <select>
                        break;
                    }
                }
            }
        } else if (type & 4) { // 4:<input type="radio">, 5:<input type="checkbox">
            ary = getNameGroupNodes(node);
            while ( (v = ary[++i]) ) {
                v.checked && rv.push(v.value);
            }
        }
        rv = multi ? rv : (rv[0] || "");
    } else {
        rv = node.value; // <textarea> <button> <option>
    }
    return rv;
}

// inner -
function setValue(type,    // @param Number: nodeType
                  node,    // @param Node:
                  value) { // @param StringArray/Array:
                           // @return Node:
    var v, i = -1, j, jz, prop, ary,
        valueArray = Array.isArray(value) ? value : [value];

    if (type) {
        // 2:<select>, 3:<select multiple>
        // 4:<input type="radio">, 5:<input type="checkbox">
        ary  = type & 2 ? node.options : getNameGroupNodes(node);
        prop = type & 2 ? "selected" : "checked";
        if (ary) {
            if (type & 1) {
                while ( (v = ary[++i]) ) {
                    v[prop] = false; // reset current state
                }
            }
            i = -1, jz = valueArray.length;
            while ( (v = ary[++i]) ) {
                for (j = 0; j < jz; ++j) {
                    if ((v.value || v.text) == valueArray[j]) { // 0 == "0"
                        v[prop] = true;
                    }
                }
            }
        }
    } else {
        node.value = valueArray.join(""); // <textarea> <button> <option>
    }
    return node;
}

// NodeSet.value
function NodeSetValue(value) { // @param String:
                               // @return StringArray/NodeSet:
    return uu.nodeSet.iter(1, this, uuvalue, value);
}

// inner -
function getNameGroupNodes(node) {
    return node.name ? uu.array(doc.getElementsByName(node.name)) : [node];
}

})(window, document, uu);

