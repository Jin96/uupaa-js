
// === form ===
//{{{!depend uu
//}}}!depend

uu.text || (function(win, doc, uu) {

uu.mix(uu, {
    // --- form ---
    // [1][node] uu.text("text") -> createTextNode("text")
    // [2][get]  uu.text(node) -> text or [text, ...]
    // [3][set]  uu.text(node, "text") -> node
    text:    uu.mix(uutext, {
        get:        uutextget,      // uu.text.get(node) -> text or [text, ...]
        set:        uutextset       // uu.text.set(node, text) -> node
    }),
    // [1][get] uu.val(node) -> val or [val, ...]
    // [2][set] uu.val(node, "val") -> node
    val:     uu.mix(uuval, {
        get:        uuvalget,       // uu.val.get(node) -> val or [val, ...]
        set:        uuvalset        // uu.val.set(node, val) -> node
    })
});

// --- form ---
// uu.text - text element creator, innerText accessor
// [1][node] uu.text("text") -> createTextNode("text")
// [2][get]  uu.text(node) -> text or [text, ...]
// [3][set]  uu.text(node, "text") -> node
function uutext(node,   // @param Node/String:
                text) { // @param String(= void 0):
                        // @return Array/String/Node:
    return uu.isstr(node) ? doc.createTextNode(node) : // [1]
           ((text === void 0) ? uutextget : uutextset)(node, text); // [2][3]
}

// uu.text.get
function uutextget(node) { // @param Node:
                           // @return String: innerText
    return node[_gecko ? "textContent" : "innerText"];
}

// uu.text.set
function uutextset(node,   // @param Node:
                   text) { // @param Array/String: innerText
                           // @return Node: node
    uu.node(doc.createTextNode(Array.isArray(text) ? text.join("") : text),
            uu.node.clear(node));
    return node;
}

// uu.val - value
// [1][get] uu.val(node) -> value
// [2][set] uu.val(node, "value") -> node
function uuval(node,  // @param Node:
               val) { // @param String(= void 0):
                      // @return String/Node:
    return ((val === void 0) ? uuvalget : uuvalset)(node, val);
}

// uu.val.get - get value
// [1][<textarea>]       uu.val.get(node) -> "innerText"
// [2][<button>]         uu.val.get(node) -> "<button value>"
// [3][<option>]         uu.val.get(node) -> "<option value>" or
//                                           "<option>value</option>"
// [4][<selet>]          uu.val.get(node) -> selected option value
// [5][<selet multiple>] uu.val.get(node) -> ["value", ...]
// [6][<input checkbox>] uu.val.get(node) -> ["value", ...]
// [7][<input radio>]    uu.val.get(node) -> "value"
function uuvalget(node) { // @param Node:
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
        ary = node.name ? uu.ary(doc.getElementsByName(node.name)) : [node];
        while ( (v = ary[++i]) ) {
            v.checked && rv.push(v.value);
        }
        rv = (node.type !== "radio") ? rv : (rv[0] || "");
    } else {
        rv = node.value; // <textarea> <button> <option>
    }
    return rv;
}

// uu.val.set - set value
// uu.val.set(node, value) -> node
function uuvalset(node,  // @param Node:
                  val) { // @param String/Array:
                         // @return Node:
    var v, i = -1, j, jz, prop, ary, vals = Array.isArray(val) ? val : [val];

    if (node.tagName.toLowerCase() === "select") {
        ary = node.options, prop = "selected";
    } else if ({ checkbox: 1, radio: 1 }[node.type || ""]) {
        ary = node.name ? uu.ary(doc.getElementsByName(node.name)) : [node];
    }
    if (ary) {
        prop || (prop = "checked"); // prop is "selected" or "checked"
        while ( (v = ary[++i]) ) {
            v[prop] = false; // reset current state
        }
        i = -1, jz = vals.length;
        while ( (v = ary[++i]) ) {
            for (j = 0; j < jz; ++j) {
                ((v.value || v.text) == vals[j]) && (v[prop] = true); // 0 [==] "0"
            }
        }
    } else {
        node.value = vals.join(""); // <textarea> <button> <option>
    }
    return node;
}

})(window, document, uu);

