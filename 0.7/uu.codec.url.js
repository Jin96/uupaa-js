
// === URL/DataURI ===
// depend: uu, uu.codec, uu.codec.base64
uu.agein || (function(uu) {

uu.codec.url = {
    decode: urldecode       // uu.codec.url.decode(String) -> ByteArray
};

uu.codec.datauri = {
    decode: datauridecode   // uu.codec.datauri.decode(String) -> { mime, data }
};

// uu.codec.url.decode - http://%00%01HexString2ByteArray/
function urldecode(hex,     // @param String: ASCII + "%hh"
                   toStr) { // @param Boolean(= false): true = result is String
                            //                          false = result is ByteArray
                            // @return ByteArray/String:
    var rv = [], ri = -1, c, i = 0, iz = hex.length,
        percent = "%".charCodeAt(0); // "%" = ASCII(37)

    while (i < iz) {
        c = hex.charCodeAt(i++);
        // "%3c" -> parseInt("0x3c")
        //   ~~                 ~~
        rv[++ri] = c === percent ? +("0x" + hex.slice(i, i += 2)) : c;
    }
    return toStr ? String.fromCharCode.apply(null, rv) : rv;
}

// uu.codec.datauri.decode - decode DataURI
//    data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...
//    data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D
function datauridecode(str,     // @param String: "data:..."
                       toStr) { // @param Boolean(= false): true = Hash.data is String
                                //                          false = Hash.data is ByteArray
                                // @return Hash: { mime, data }
                                //    mime - String:
                                //    data - ByteArray/String:
    var m, mime = "", data = [];

    m = datauridecode._DATA_URI.exec(str);
    if (m) {
        mime = m[1];
        data = str.slice(m[0].length);
        data = m[2] ? uu.codec.base64.decode(decodeURIComponent(data), toStr)
                    : urldecode(data, toStr); // decodeURI weak("%00")
    }
    return { mime: mime, data: data };
}
datauridecode._DATA_URI = /^data:([\w\/]+)(;base64)?,/;

})(uu);

