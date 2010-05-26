
// === uu.entity / window.entity ===
//{{{!depend uu
//}}}!depend

(this.uu || this).entity || (function(namespace) {

namespace.entity = uuentity;              // uu.entity(str:String):String
namespace.entity.decode = uuentitydecode; // uu.entity.decode(str:String):String

var _to   = /[&<>"]/g,
    _from = /&(?:amp|lt|gt|quot);/g,
    _hash = { "&":      "&amp;",
              "<":      "&lt;",
              ">":      "&gt;",
              '"':      "&quot;",
              "&amp;":  "&",
              "&lt;":   "<",
              "&gt;":   ">",
              "&quot;": '"' };

// uu.entity - encode String to HTML Entity
function uuentity(str) { // @param String:
                         // @return String:
    return str.replace(_to, _entity);
}

// uu.entity.decode - decode String from HTML Entity
function uuentitydecode(str) { // @param String:
                               // @return String:
    return str.replace(_from, _entity);
}

// inner - to/from entity
function _entity(code) {
    return _hash[code];
}

})(this.uu || this);
