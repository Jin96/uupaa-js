
// === Base64/URLSafe64 ===
// depend: uu, uu.codec, uu.codec.urf8
uu.agein || (function(uu) {

var _BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    _NGWORD = /[^A-Za-z0-9\+\/]/,
    _ENCODE = _BASE.split(""),
    _DECODE = (function() {
        var rv = { "=": 0 }, i = 0, iz = _BASE.length;

        for (; i < iz; ++i) {
            rv[_BASE.charAt(i)] = i;
        }
        return rv;
    })();

uu.codec.base64 = {
    encode: base64encode,   // uu.codec.base64.encode(ByteArray, urlsafe = false) -> Base64String/URLSafe64String
    decode: base64decode    // uu.codec.base64.decode(Base64String/URLSafe64String, toStr = false) -> ByteArray
};

// uu.codec.base64.encode
function base64encode(mix,       // @param String/ByteArray: String or Array( [0x0, ... ] )
                      urlsafe) { // @param Boolean(= false): true = result is URLSafe64String,
                                 //                          false = result is Base64String
                                 // @return Base64String/URLSafe64String:
    if (uu.isstr(mix)) {
        mix = uu.codec.utf8.encode(mix); // String -> UTF8ByteArray
    }

    var rv = [], pad = 0, c = 0, i = -1, iz, ENCODE = _ENCODE;

    switch (mix.length % 3) {
    case 1: mix.push(0); ++pad;
    case 2: mix.push(0); ++pad;
    }
    iz = mix.length - 1;

    while (i < iz) {
        c = (mix[++i] << 16) | (mix[++i] << 8) | (mix[++i]); // 24bit
        rv.push(ENCODE[(c >> 18) & 0x3f],
                ENCODE[(c >> 12) & 0x3f],
                ENCODE[(c >>  6) & 0x3f],
                ENCODE[ c        & 0x3f]);
    }

    if (urlsafe) {
        // URLSafe64String
        return rv.join("").replace(/\+/g, "-").replace(/\//g, "_");
    }

    // Base64String
    switch (pad) {
    case 2: rv[rv.length - 2] = "=";
    case 1: rv[rv.length - 1] = "=";
    }
    return rv.join("");
}

// uu.codec.base64.decode
function base64decode(base64str, // @param Base64String/URLSafe64String:
                      toStr) {   // @param Boolean(= false): true = result is String
                                 //                          false = result is ByteArray
                                 // @return ByteArray/String:
    if (typeof base64str !== "string" || !base64str.length) {
        return []; // empty
    }

    base64str = base64str.replace(/\-/g, "+").replace(/_/g, "/").replace(/\=+/g, "");

    if (_NGWORD.test(base64str)) {
        return []; // bad data
    }

    var rv = [], pad = 0, DECODE = _DECODE, c = 0, i = -1, iz;

    switch (base64str.length % 4) { // pad length( "=" or "==" or "" )
    case 2: base64str += "="; ++pad;
    case 3: base64str += "="; ++pad;
    }

    iz = base64str.length - 1;
    if (uu.ie) {
        while (i < iz) {                              // 00000000|00000000|00000000 (24bit)
            c = (DECODE[base64str.charAt(++i)] << 18) // 111111  |        |
              | (DECODE[base64str.charAt(++i)] << 12) //       11|1111    |
              | (DECODE[base64str.charAt(++i)] <<  6) //         |    1111|11
              |  DECODE[base64str.charAt(++i)]        //         |        |  111111
            rv.push((c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);
        }
    } else {
        while (i < iz) {                              // 00000000|00000000|00000000 (24bit)
            c = (DECODE[base64str[++i]] << 18)        // 111111  |        |
              | (DECODE[base64str[++i]] << 12)        //       11|1111    |
              | (DECODE[base64str[++i]] <<  6)        //         |    1111|11
              |  DECODE[base64str[++i]]               //         |        |  111111
            rv.push((c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);
        }
    }
    rv.length -= [0,1,2][pad]; // cut tail

    if (toStr) {
        return String.fromCharCode.apply(null, rv);
    }
    return rv;
}

})(uu);

