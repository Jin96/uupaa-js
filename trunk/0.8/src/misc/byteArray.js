
// === uu.byteArray ===
//#include uupaa.js

uu.byteArray || (function(uu) {

uu.byteArray = {
    toHexString: toHexString    // uu.byteArray.toHexString(source:ByteArray):String
};

// uu.byteArray.toHexString - array to HexString
function toHexString(source) { // @param ByteArray:
                               // @return String: "[0xnn, 0xnn, ... ]"
    var rv = [], v, i = 0, iz = source.length;

    for (; i < iz; ++i) {
        v = source[i];
        rv.push("0x" + uu.hash.num2hh[v * (v < 0 ? -1 : 1)]);
    }
    return "[" + rv.join(", ") + "]";
}

})(uu);

