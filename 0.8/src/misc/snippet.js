// === uu.snippet ===

uu.snippet || (function(uu) {

uu.snippet = uusnippet; // snippet(id:String, arg:Hash/Array):String/Mix

// uusnippet - evaluate snippet
function uusnippet(id,    // @param String: snippet id. <script id="...">
                   arg) { // @param Mix(= void): arg
                          // @return String/Mix:
    function normalize(str) {
        return str.replace(/("|')/g, "\\$1").replace(/\n/g, "\\n");
    }

    function toBrace(all, ident) {
        return ident.indexOf("arg.") ? '{(' + ident + ')}'  // "{{ident}}"     -> "{(ident)}"
                                     : '"+' + ident + '+"'; // "{{arg.ident}}" -> "+ident+"
    }

    function toText(all, match) {
        return '"' + normalize(uutrim(match)).replace(dualBrace, toBrace) + '"';
    }

    function each(all, match) {
        match = normalize(match.replace(/^\s+|\s+$/gm, ""))
                .replace(eachBlock, toEachBlock)
                .replace(dualBrace, toBrace);
        return 'uu.node.bulk("' + match + '");';
    }

    function toEachBlock(all, hash, block) {
        return '"+uu.snippet.each(' + hash + ',"' +
                                      block.replace(dualBrace, toBrace) + '")+"';
    }

    var js = uusnippet.js[id] || "", node, // {
        dualBrace = /\{\{([^\}]+)\}\}/g,
        eachBlock = /<each ([^>]+)>([\s\S]*?)<\/each>/;

    if (!js) {
        node = uuid(id);
        if (node) {
            uusnippet.js[id] = js = node.text.replace(/\r\n|\r|\n/g, "\n")
                    .replace(/<text>\n([\s\S]*?)^<\/text>$/gm, toText) // <text>...</text>
                    .replace(/<>\n([\s\S]*?)^<\/>$/gm, each)           // <>...</>
                    .replace(/^\s*\n|\n$/g, "");
        }
    }
    return js ? (new Function("arg", js))(arg) : "";
}
uusnippet.js = {}; // { id: JavaScriptExpression, ... }
uusnippet.each = function(hash, fragment) { // (
    var i = 0, iz = hash.length, block = [], eachBrace = /\{\(([^\)]+)\)\}/g;

    for (; i < iz; ++i) {
        block.push(fragment.replace(eachBrace, function(all, ident) {
            return hash[ident][i];
        }));
    }
    return block.join("");
};

})(uu);
