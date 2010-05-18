
// === uu.Class.LZW ===
//{{{!depend uu
//}}}!depend

uu.Class.LZW || (function(uu) {

uu.Class.singleton("LZW", {
    decode:     decode   // decode(byteArray:ByteArray, minimumCodeSize:Number):ByteArray
});

// uu.codec.lzw.decode
function decode(byteArray,         // @param ByteArray: data
                minimumCodeSize) { // @param Number(= 6): minimum code size
                                   // @return ByteArray:
    minimumCodeSize = (minimumCodeSize === void 0) ? 6 : minimumCodeSize;

    var rv = [], imageReadPos = 0, // ary read position
        dict = [],
        clearCode = Math.pow(2, minimumCodeSize),
        endCode = clearCode + 1,
        dictPos = endCode + 1,
        lastLen = 0,
        lastPos = 0,
        codeSize = minimumCodeSize + 1,
        restCode = codeSize,
        used = 0, // used area
        code = 0,
        i = 0,
        k = 0,
        j = 0,
        pow2 = Math.pow(2, codeSize);

    function next() {
        var shiftWidth = 8 - restCode, old;

        // coordinate width
        if (shiftWidth < 0) {
            shiftWidth = 0;
        }
        code += ((byteArray[imageReadPos] >> used) & (0xff >> shiftWidth))
             << (codeSize - restCode);
        old = used + restCode;
        restCode -= (8 - used);
        if (restCode < 0) {
            restCode = 0;
        }
        used = old;
        if (used > 8) {
            used = 0;
            ++imageReadPos;
        }
        return restCode;
    }

    for (j = 0; j < 4096; ++j) {
        if (!next()) {
            if (code === endCode) { // finish
                break; // finish
            } else if (code === clearCode) { // init dict
                codeSize = minimumCodeSize + 1;
                pow2 = Math.pow(2, codeSize); // recalc
                dictPos = endCode + 1;
            } else if (code < clearCode) {
                if (i) {
                    dict[dictPos++] = [lastPos, lastLen + 1];
                }
                rv[i] = code;
                lastPos = i;
                lastLen = 1;
                ++i;
            } else if (code > endCode) {
                dict[dictPos++] = [lastPos, lastLen + 1];
                for (k = 0; k < dict[code][1]; ++k) {
                    rv[i + k] = rv[dict[code][0] + k];
                }
                lastPos = i;
                lastLen = dict[code][1];
                i += dict[code][1];
            }

            if (dictPos === pow2) {
                ++codeSize;
                pow2 = Math.pow(2, codeSize); // recalc
            }

            code = 0;
            restCode = codeSize;
        }
    }
    return rv;
}

})(uu);

