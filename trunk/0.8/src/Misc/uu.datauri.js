
// === uu.datauri / window.datauri ===
//{{{!depend uu, uu.base64
//}}}!depend

(function(namespace) {

namespace.datauri = {
    decode:  datauridecode // datauri.decode(data:String, toString:Boolean = false):Hash
                           //  [1] datauri.decode("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...")
                           //                       -> { mime: "image/gif", data: ... }
                           //  [2] datauri.decode("data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D")
                           //                       -> { mime: "text/css", data: ... }
};

// datauri.decode - decode DataURI
function decodeDataURI(data,    // @param String: "data:..."
                       toString) { // @param Boolean(= false): true is toString
                                   //                          false is toByteArray
                                   // @return Hash: { mime, data }
                                   //    mime - String:
                                   //    data - String/ByteArray:
    var rv = [], m = /^data:([\w\/]+)(;base64)?,/.exec(data), mime = "";

    if (m) {
        mime = m[1];
        rv = data.slice(m[0].length);
        rv = m[2] ? namespace.base64(decodeURIComponent(rv), !toString)
                  : decodeURL(rv, toString); // decodeURI weak("%00")
    }
    return { mime: mime, data: rv };
}

function decodeURL(url,        // @param String: ASCII + "%hh"
                   toString) { // @param Boolean(= false): true = result is String
                               //                          false = result is ByteArray
                               // @return ByteArray/String:
    var rv = [], ri = -1, c, i = 0, iz = url.length,
        percent = "%".charCodeAt(0); // "%" = ASCII(37)

    while (i < iz) {
        c = url.charCodeAt(i++);
        // "%3c" -> parseInt("0x3c")
        //   ~~                 ~~
        rv[++ri] = c === percent ? +("0x" + url.slice(i, i += 2)) : c;
    }
    return toString ? String.fromCharCode.apply(null, rv) : rv;
}

})(this.uu || this);
