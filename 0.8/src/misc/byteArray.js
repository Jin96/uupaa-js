
// === uu.byteArray ===
//#include uupaa.js

uu.byteArray || (function(uu) {

uu.byteArray = {
    toHexString: toHexString    // uu.byteArray.toHexString(source:ByteArray, verbose:Boolean = false):String
};

// uu.byteArray.toHexString - array to HexString
function toHexString(source,    // @param ByteArray:
                     verbose) { // @param Boolean(= false):
                                // @return String: verbose = false "00010203"
                                //              or verbose = true  "0x00, 0x01, 0x02, 0x03"
    var rv = [], ri = -1, v, i = 0, iz = source.length,
        num2hh = uu.hash.num2hh;

    if (verbose) {
        for (; i < iz; ++i) {
            v = source[i];
            rv[++ri] = "0x" + num2hh[v * (v < 0 ? -1 : 1)];
        }
        return rv.join(", ");
    }
    for (; i < iz; ++i) {
        v = source[i];
        rv[++ri] = num2hh[v * (v < 0 ? -1 : 1)];
    }
    return rv.join("");
}

})(uu);

