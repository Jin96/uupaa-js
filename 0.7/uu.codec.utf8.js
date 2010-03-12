
// === UTF8 ===
// depend: uu, uu.codec
uu.agein || (function(uu) {

uu.codec.utf8 = {
    encode: utf8encode, // uu.codec.utf8encode(String) -> UTF8ByteArray
    decode: utf8decode  // uu.codec.utf8decode(UTF8ByteArray) -> String
};

// uu.codec.utf8.encode - String to UTF8ByteArray
function utf8encode(str) { // @param String:
                           // @return UTF8ByteArray: [ utf8code, ... ]
    if (typeof str !== "string" || !str.length) {
        return [];
    }

    var rv = [], iz = str.length, c = 0, i = 0;

    for (; i < iz; ++i) {
        c = str.charCodeAt(i);
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv.push(c & 0x7f);
        } else if (c < 0x0800) {
            rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
        } else if (c < 0x10000) {
            rv.push(((c >>> 12) & 0x0f) | 0xe0,
                    ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
        } else {
            throw new Error("OUT OF RANGE");
        }
    }
    return rv;
}

// uu.codec.utf8.decode - UTF8ByteArray to String
function utf8decode(ary) { // @param UTF8ByteArray: [ utf8code, ... ]
                           // @return String:
    if (!ary.length) {
        return "";
    }

    var rv = [], ri = -1, iz = ary.length, c = 0, i = 0,
        C = String.fromCharCode;

    for (; i < iz; ++i) {
        c = ary[i]; // first byte
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = C(c);
        } else if (c < 0xe0) {
            rv[++ri] = C((c & 0x1f) << 6 | (ary[++i] & 0x3f));
        } else if (c < 0xf0) {
            rv[++ri] = C((c & 0x0f) << 12 | (ary[++i] & 0x3f) << 6
                                          | (ary[++i] & 0x3f));
        }
    }
    return rv.join("");
}

})(uu);

