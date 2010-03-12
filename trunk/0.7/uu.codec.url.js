
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
function urldecode(hex) { // @param String: ASCII + "%hh"
                          // @return ByteArray:
    var rv = [], ri = -1, c, i = 0, iz = hex.length,
        hh2num = urldecode._hh2num, percent = "%".charCodeAt(0);

    while (i < iz) {
        c = hex.charCodeAt(i++);
        if (c === percent) {
            c = hh2num[hex.slice(i, i + 2)] || -1;
            if (c < 0) {
                return []; // bad data
            }
            i += 2;
        }
        rv[++ri] = c;
    }
    return rv;
}
// hh2num = { "%00":    0 , ... "%ff": 255  }; Zero-filled hex string -> Number
// num2hh = {     0: "%00", ...  255: "%ff" }; Number -> Zero-filled hex string
uu.hash.quickMap("0123456789abcdef", "", urldecode._hh2num = {},
                                         urldecode._num2hh = {});

// uu.codec.datauri.decode - decode DataURI
//    data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...
//    data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D
function datauridecode(str) { // @param String: "data:..."
                              // @return Hash: { mime, data }
                              //    mime - String:
                              //    data - ByteArray:
    var m, mime, data;

    m = datauridecode._DATA_URI.exec(str);
    if (m) {
        mime = m[1];
        data = str.slice(m[0].length);
        data = m[2] ? uu.codec.base64.decode(decodeURIComponent(data))
                    : urldecode(data); // decodeURI weak("%00")
    }
    return { mime: mime || "", data: data || [] };
}
datauridecode._DATA_URI = /^data:([\w\/]+)(;base64)?,/;

})(uu);

