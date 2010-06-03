
// === uu.entity / window.entity ===

(this.uu || this).entity || (function(namespace) {

namespace.entity = uuentity;                // uu.entity(str:String):String
                                            //  [1][to Entity]           uu.entity("<html>") -> "&lt;html&gt;"
namespace.entity.decode = uuentitydecode;   // uu.entity.decode(str:String):String
                                            //  [1][from Entity]         uu.entity.decode("&lt;html&gt;") -> "<html>"
                                            //  [2][from UNICODE Entity] uu.entity.decode("\u0041\u0042") -> "AB"

var _to   = /[&<>"]/g,
    _from = /&(?:amp|lt|gt|quot);/g,
    _hash = { "&":      "&amp;",
              "<":      "&lt;",
              ">":      "&gt;",
              '"':      "&quot;",
              "&amp;":  "&",
              "&lt;":   "<",
              "&gt;":   ">",
              "&quot;": '"' },
    _uffff = /\\u([0-9a-f]{4})/g; // \u0000 ~ \uffff

// uu.entity - encode String to HTML Entity
function uuentity(str) { // @param String:
                         // @return String:
    return str.replace(_to, _entity);
}

// uu.entity.decode - decode String from HTML Entity
function uuentitydecode(str) { // @param String:
                               // @return String:
    return str.replace(_from, _entity).replace(_uffff, function(m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

// inner - to/from entity
function _entity(code) {
    return _hash[code];
}

})(this.uu || this);
