
// === uu.base64, uu.utf8j/ window.base64, window.utf8 ===
//#include uupaa.js

(this.uu || this).base64 || (function(nameSpace, globalScope, base) {

nameSpace.base64 = base64encode;        // base64(data:ByteArray/String,
                                        //        toURLSafe64:Boolean = false):Base64String/URLSafe64String
nameSpace.base64.decode = base64decode; // base64.decode(data:Base64String/URLSafe64String):ByteArray
nameSpace.utf8 = utf8encode;            // utf8.encode(str:String):UTF8ByteArray
nameSpace.utf8.decode = utf8decode;     // utf8.decode(byteArray:UTF8ByteArray,
                                        //             startIndex:Number = 0,
                                        //             endIndex:Number = void):String

// base64 - encode ByteArray to Base64 formated String
function base64encode(data,          // @param ByteArray/String:
                      toURLSafe64) { // @param Boolean(= false):
                                     // @return Base64String/URLSafe64String:
    var rv = [],
        ary = typeof data === "string" ? nameSpace.utf8(data) : data,
        c = 0, i = -1, iz = ary.length,
        pad = [0, 2, 1][ary.length % 3],
        num2bin = nameSpace.hash.num2bin,
        num2b64 = nameSpace.hash.num2b64;

    if (globalScope.btoa && num2bin && !toURLSafe64) {
        while (i < iz) {
            rv.push(num2bin[ary[++i]]);
        }
        return btoa(rv.join(""));
    }
    --iz;
    while (i < iz) {
        c = (ary[++i] << 16) | (ary[++i] << 8) | (ary[++i]); // 24bit
        rv.push(num2b64[(c >> 18) & 0x3f], num2b64[(c >> 12) & 0x3f],
                num2b64[(c >>  6) & 0x3f], num2b64[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    return toURLSafe64 ? rv.join("").replace(/\=+$/g, "").replace(/\+/g, "-").
                                                          replace(/\//g, "_")
                       : rv.join("");
}

// base64.decode - decode Base64 formated String to ByteArray
function base64decode(data,          // @param Base64String/URLSafe64String:
                      toByteArray) { // @param Boolean(= false): true is ByteArray result
                                     // @return String/ByteArray:
    var rv = [], c = 0, i = -1,
        ary = data.split(""),
        iz = data.length - 1,
        b642num = nameSpace.hash.b642num;

    while (i < iz) {                  // 00000000|00000000|00000000 (24bit)
        c = (b642num[ary[++i]] << 18) // 111111  |        |
          | (b642num[ary[++i]] << 12) //       11|1111    |
          | (b642num[ary[++i]] <<  6) //         |    1111|11
          |  b642num[ary[++i]]        //         |        |  111111
        rv.push((c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);
    }
    rv.length -= [0, 0, 2, 1][data.replace(/\=+$/, "").length % 4]; // cut tail

    return toByteArray ? rv : nameSpace.utf8.decode(rv);
}

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
        }
    }
    return rv;
}

// utf8.decode - UTF8ByteArray to String
function utf8decode(byteArray,  // @param UTF8ByteArray: [ Number(utf8), ... ]
                    startIndex, // @param Number(= 0):
                    endIndex) { // @param Number(= void):
                                // @return String: JavaScript string
    var rv = [], ri = -1, iz = endIndex || byteArray.length, c = 0,
        i = startIndex || 0;

    if (iz > byteArray.length) {
        iz = byteArray.length;
    }

    for (; i < iz; ++i) {
        c = byteArray[i]; // first byte
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = c;
        } else if (c < 0xe0) {
            rv[++ri] = (c & 0x1f) <<  6 | (byteArray[++i] & 0x3f);
        } else if (c < 0xf0) {
            rv[++ri] = (c & 0x0f) << 12 | (byteArray[++i] & 0x3f) << 6
                                        | (byteArray[++i] & 0x3f);
        }
    }
    return String.fromCharCode.apply(null, rv);
}

// --- init ---
(function(base, hash, i) {
    hash.num2b64 = base.split(""); // ["A", "B", ... "/"]
    hash.b642num = { "=": 0, "-": 62, "_": 63 }; // URLSafe64 chars("-", "_")

    for (; i < 64; ++i) {
        hash.b642num[base.charAt(i)] = i;
    }
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
   nameSpace.hash || (nameSpace.hash = {}), 0);

})(this.uu || this, this);
