
// === hack ===
//{{{!depend uu
//}}}!depend

uu.hack || (function(win, doc, uu) {

uu.hack = {
    css2kb: uuhackcss2kb    // uu.hack.css2kb([className, ...]) -> Hash
};

// uu.hack.css2kb - hash from CSS implemented data
// .hoge { list-style: url(?key=val) }
// uu.hash.css2kb("hoge") -> { key: val }
function uuhackcss2kb(name) { // @param String/Array: className or [className, ...]
                              // @return Hash: { key: value, ... }
    function _parseQueryString(m, key, val, v) {
        v = fn(val);
        return rv[fn(key)] = isNaN(v) ? v : parseFloat(v);
    }
    // http://d.hatena.ne.jp/uupaa/20091125
    var rv = {}, cs, url, ary = uu.array(name), i = 0, iz = ary.length,
        div = doc.body.appendChild(uu.node()),
        fn = decodeURIComponent, _kv = uuhackcss2kb._kv; // alias

    for (; i < iz; ++i) {
        div.className = ary[i];
        cs = _ie ? div.currentStyle : win.getComputedStyle(div, null);
        url = uu.trim.url(cs.listStyleImage);
        if (url && url.indexOf("?") > 0) {
            url.slice(url.indexOf("?") + 1).replace(_kv, _parseQueryString);
        }
    }
    doc.body.removeChild(div);
    return rv;
}
uuhackcss2kb._kv = /(?:([^\=]+)\=([^\;]+);?)/g; // key = value

})(window, document, uu);

