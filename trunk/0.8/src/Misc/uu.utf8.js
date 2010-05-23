
// === uu.utf8 / window.utf8 ===
//{{{!depend uu
//}}}!depend

(function(namespace) {

namespace.utf8 = {
    encode: utf8encode, // utf8.encode(str:String):UTF8ByteArray
    decode: utf8decode  // utf8.decode(byteArray:UTF8ByteArray):String
};

// utf8.encode - String to UTF8ByteArray
function utf8encode(str) { // @param String: JavaScript string
                           // @return UTF8ByteArray: [ Number(utf8), ... ]
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
            throw new Error("OUT_OF_RANGE");
        }
    }
    return rv;
}

// utf8.decode - UTF8ByteArray to String
function utf8decode(byteArray) { // @param UTF8ByteArray: [ Number(utf8), ... ]
                                 // @return String: JavaScript string
    var rv = [], ri = -1, iz = byteArray.length, c = 0, i = 0,
        fromCharCode = String.fromCharCode;

    for (; i < iz; ++i) {
        c = byteArray[i]; // first byte
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = fromCharCode(c);
        } else if (c < 0xe0) {
            rv[++ri] = fromCharCode((c & 0x1f) <<  6 | (byteArray[++i] & 0x3f));
        } else if (c < 0xf0) {
            rv[++ri] = fromCharCode((c & 0x0f) << 12 | (byteArray[++i] & 0x3f) << 6
                                                     | (byteArray[++i] & 0x3f));
        }
    }
    return rv.join("");
}

})(this.uu || this);
