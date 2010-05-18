
// === uu.Class.Codec ===
//{{{!depend uu
//}}}!depend

uu.Class.Codec || (function(uu) {

uu.Class.singleton("Codec", {
    init:           init,
    encodeUTF8:     encodeUTF8,     // encoddUTF8(str:String):UTF8ByteArray
                                    //  [1] encoddUTF8(String) -> UTF8ByteArray
    decodeUTF8:     decodeUTF8,     // decodeUTF8(byteArray:UTF8ByteArray):String
                                    //  [1] decodeUTF8(UTF8ByteArray) -> String
    decodeURL:      decodeURL,      // decodeURL(url:String, toString:Boolean = false):ByteArray/String
                                    //  [1] decodeURL("http://example.com") -> "http://{{%00}}{{%01}}HexString2ByteArray/"
                                    //  [2] decodeURL("http://example.com", true) -> "http://{{%00}}{{%01}}HexString2ByteArray/"
    decodeDataURI:  decodeDataURI,  // decodeDataURI(dataURI:String)
                                    //  [1] decodeDataURI("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...") -> ByteArray
                                    //  [2] decodeDataURI("data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D") -> ByteArray
    encodeBase64:   encodeBase64,   // encodeBase64(data:String/ByteArray, toURLSafe64 = false):Base64String/URLSafe64String
    decodeBase64:   decodeBase64    // decodeBase64(data:Base64String/URLSafe64String, toByteArray:Boolean = false):String/ByteArray
});

function init() {
    var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        decodeHash = { "=": 0 }, i = 0, iz = base.length;

    for (; i < iz; ++i) {
        decodeHash[base.charAt(i)] = i;
    }

    this.base64 = {
        encodeArray: base.split(""),
        decodeHash:  decodeHash
    };
}

// encodeUTF8 - String to UTF8ByteArray
function encodeUTF8(str) { // @param String: JavaScript string
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

// decodeUTF8 - UTF8ByteArray to String
function decodeUTF8(byteArray) { // @param UTF8ByteArray: [ Number(utf8), ... ]
                                 // @return String: JavaScript string
    var rv = [], ri = -1, iz = byteArray.length, c = 0, i = 0,
        C = String.fromCharCode;

    for (; i < iz; ++i) {
        c = byteArray[i]; // first byte
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = C(c);
        } else if (c < 0xe0) {
            rv[++ri] = C((c & 0x1f) << 6 | (byteArray[++i] & 0x3f));
        } else if (c < 0xf0) {
            rv[++ri] = C((c & 0x0f) << 12 | (byteArray[++i] & 0x3f) << 6
                                          | (byteArray[++i] & 0x3f));
        }
    }
    return rv.join("");
}

// Codec.decodeURL - decode URL to ByteArray/String
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

// decodeDataURI - decode DataURI
function decodeDataURI(dataURI,    // @param String: "data:..."
                       toString) { // @param Boolean(= false): true is toString
                                   //                          false is toByteArray
                                   // @return Hash: { mime, data }
                                   //    mime - String:
                                   //    data - String/ByteArray:
    var m = /^data:([\w\/]+)(;base64)?,/.exec(dataURI),
        mime = "", data = [];

    if (m) {
        mime = m[1];
        data = dataURI.slice(m[0].length);
        data = m[2] ? decodeBase64(decodeURIComponent(data), !toString)
                    : decodeURL(data, toString); // decodeURI weak("%00")
    }
    return { mime: mime, data: data };
}

// encodeBase64
function encodeBase64(data,          // @param String/ByteArray: String or ByteArray( [0x0, ... ] )
                      toURLSafe64) { // @param Boolean(= false): true is toURLSafe64String,
                                     //                          false is toBase64String
                                     // @return Base64String/URLSafe64String:
    var rv = [],
        ary = uu.isString(data) ? encodeUTF8(data) : data,
        pad = 0, c = 0, i = -1, iz,
        encodeArray = this.base64.encodeArray;

    switch (ary.length % 3) {
    case 1: ary.push(0); ++pad;
    case 2: ary.push(0); ++pad;
    }
    iz = ary.length - 1;

    while (i < iz) {
        c = (ary[++i] << 16) | (ary[++i] << 8) | (ary[++i]); // 24bit
        rv.push(encodeArray[(c >> 18) & 0x3f],
                encodeArray[(c >> 12) & 0x3f],
                encodeArray[(c >>  6) & 0x3f],
                encodeArray[ c        & 0x3f]);
    }
    pad > 1 && ary.pop();
    pad > 0 && ary.pop();

    if (toURLSafe64) {
        return rv.join("").replace(/\+/g, "-").replace(/\//g, "_"); // URLSafe64String
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    return rv.join(""); // Base64String
}

// decodeBase64
function decodeBase64(data,          // @param Base64String/URLSafe64String:
                      toByteArray) { // @param Boolean(= false): false is toString
                                     //                          true is toByteArray
                                     // @return String/ByteArray:
    data = data.replace(/\-/g, "+").replace(/_/g, "/").replace(/\=+/g, "");

    // has NG Word?
    if (/[^A-Za-z0-9\+\/]/.test(data)) {
        return toByteArray ? [] : ""; // bad data
    }

    var rv = [], pad = 0, c = 0, i = -1, iz,
        decodeHash = this.base64.decodeHash, ary;

    switch (data.length % 4) { // pad length( "=" or "==" or "" )
    case 2: data += "="; ++pad;
    case 3: data += "="; ++pad;
    }
    ary = data.split("");
    iz = data.length - 1;

    while (i < iz) {                     // 00000000|00000000|00000000 (24bit)
        c = (decodeHash[ary[++i]] << 18) // 111111  |        |
          | (decodeHash[ary[++i]] << 12) //       11|1111    |
          | (decodeHash[ary[++i]] <<  6) //         |    1111|11
          |  decodeHash[ary[++i]]        //         |        |  111111
        rv.push((c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);
    }
    rv.length -= [0, 1, 2][pad]; // cut tail

    return toByteArray ? rv : decodeUTF8(rv);
}

})(uu);

