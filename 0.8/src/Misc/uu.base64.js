
// === uu.base64 / window.base64 ===
//{{{!depend uu, uu.utf8
//}}}!depend

(this.uu || this).base64 || (function(namespace) {

var _encodeArray, // ["A", "B", ...]
    _decodeHash = { "=": 0 };

// init data
(function() {
    var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        i = 0, iz = base.length;

    _encodeArray = base.split("");
    for (; i < iz; ++i) {
        _decodeHash[base.charAt(i)] = i;
    }
})();

namespace.base64 = {
    encode: base64encode, // base64.encode(data:String/ByteArray,
                          //               toURLSafe64:Boolean = false):Base64String/URLSafe64String
    decode: base64decode  // base64.decode(data:Base64String/URLSafe64String,
                          //               toByteArray:Boolean = false):String/ByteArray
};

// uu.base64.encode
function base64encode(data,          // @param String/ByteArray:
                      toURLSafe64) { // @param Boolean(= false):
                                     // @return Base64String/URLSafe64String:
    var rv = [],
        ary = typeof data === "string" ? namespace.utf8.encode(data) : data,
        pad = 0, c = 0, i = -1, iz,
        encodeArray = _encodeArray;

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
        pad > 1 && rv.pop();
        pad > 0 && rv.pop();
        return rv.join("").replace(/\+/g, "-").replace(/\//g, "_"); // URLSafe64String
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    return rv.join(""); // Base64String
};

// uu.base64.decode
function base64decode(data,          // @param Base64String/URLSafe64String:
                      toByteArray) { // @param Boolean(= false): false is toString
                                     //                          true is toByteArray
                                     // @return String/ByteArray:
    data = data.replace(/\-/g, "+").replace(/_/g, "/").replace(/\=+/g, "");

    // has NG word?
    if (/[^A-Za-z0-9\+\/]/.test(data)) {
        return toByteArray ? [] : ""; // bad data
    }

    var rv = [], pad = 0, c = 0, i = -1, iz,
        decodeHash = _decodeHash, ary;

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

    return toByteArray ? rv : namespace.utf8.decode(rv);
}

})(this.uu || this);
