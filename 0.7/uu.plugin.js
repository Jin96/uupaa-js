
// === plugin ===
// depend: uu
uu.agein || (function(win, doc, uu) {

// --- plugin / plugin name space ---
uu.plugin = uuplugin;               // uu.plugin() -> ["plugin-name", ...]

// --- plugin / plugin name space ---
// uu.plugin - enum plugins
function uuplugin() { // @return Array: ["plugin-name", ...]
    return uu.hash.keys(uuplugin);
}

})(window, document, uu);

