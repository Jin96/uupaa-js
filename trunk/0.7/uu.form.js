
// === form ===
//{{{!depend uu
//}}}!depend

uu.text || (function(win, doc, uu) {

// [1][node] uu.text("text") -> createTextNode("text")
// [2][get]  uu.text(node) -> text or [text, ...]
// [3][set]  uu.text(node, "text") -> node
uu.text = uutext;

// [1][get] uu.value(node) -> value or [value, ...]
// [2][set] uu.value(node, "value") -> node
uu.value = uuvalue;


// [1][get]  uu.text(node) -> text or [text, ...]
// [2][set]  uu.text(node, "text") -> node

// uu.text - node.text / node.innerText accessor
function uutext(node,   // @param Node/String: node or text string
                text) { // @param String(= void):
                        // @return Array/String/Node:
    if (uu.isString(node)) {
        return doc.createTextNode(node);
    }
    if (text === void 0) {
        return node[uu.gecko ? "textContent" : "innerText"];
    }
    uu.node.add(doc.createTextNode(Array.isArray(text) ? text.join("") : text),
                uu.node.clear(node));
    return node;
}

// [1][get] uu.val(node) -> value
// [2][set] uu.val(node, "value") -> node

// uu.value - value accessor
function uuvalue(node,    // @param Node:
                 value) { // @param String(= void 0):
                          // @return String/Node:
    return (value === void 0 ? _valueget : _valueset)(node, value);
}

// [1][<textarea>]       uu.val.get(node) -> "innerText"
// [2][<button>]         uu.val.get(node) -> "<button value>"
// [3][<option>]         uu.val.get(node) -> "<option value>" or
//                                           "<option>value</option>"
// [4][<selet>]          uu.val.get(node) -> selected option value
// [5][<selet multiple>] uu.val.get(node) -> ["value", ...]
// [6][<input checkbox>] uu.val.get(node) -> ["value", ...]
// [7][<input radio>]    uu.val.get(node) -> "value"

// inner -
function _valueget(node) { // @param Node:
                           // @return Array/String:
    var rv = [], v, i = -1, ary, multi = 0;

    if (node.tagName.toLowerCase() === "select") {
        i = node.selectedIndex;
        multi = node.multiple;
        if (i >= 0) {
            while ( (v = node.options[++i]) ) {
                v.selected && rv.push(v.value || v.text);
                if (!multi) { break; }
            }
        }
        rv = multi ? rv : (rv[0] || "");
    } else if (node.type === "radio" || node.type === "checkbox") {
        ary = node.name ? uu.array(doc.getElementsByName(node.name)) : [node];
        while ( (v = ary[++i]) ) {
            v.checked && rv.push(v.value);
        }
        rv = (node.type !== "radio") ? rv : (rv[0] || "");
    } else {
        rv = node.value; // <textarea> <button> <option>
    }
    return rv;
}

// inner -
function _valueset(node,    // @param Node:
                   value) { // @param String/Array:
                            // @return Node:
    var v, i = -1, j, jz, prop, ary, valueArray = Array.isArray(value) ? value : [value];

    if (node.tagName.toLowerCase() === "select") {
        ary = node.options, prop = "selected";
    } else if ({ checkbox: 1, radio: 1 }[node.type || ""]) {
        ary = node.name ? uu.array(doc.getElementsByName(node.name)) : [node];
    }
    if (ary) {
        prop || (prop = "checked"); // prop is "selected" or "checked"
        while ( (v = ary[++i]) ) {
            v[prop] = false; // reset current state
        }
        i = -1, jz = valueArray.length;
        while ( (v = ary[++i]) ) {
            for (j = 0; j < jz; ++j) {
                ((v.value || v.text) == valueArray[j]) && (v[prop] = true); // 0 [==] "0"
            }
        }
    } else {
        node.value = valueArray.join(""); // <textarea> <button> <option>
    }
    return node;
}

})(window, document, uu);

