// === uu.md5 ===

uu.md5 || (function(uu) {

uu.md5 = md5encode; // uu.md5(ASCIIString/ByteArray):HexString
                    //   uu.md5("")              -> "d41d8cd98f00b204e9800998ecf8427e"
                    //   uu.md5("hoge")          -> "ea703e7aa1efda0064eaa507d9e8ab7e"
                    //   uu.md5("ascii")         -> "5b7f33be48f19c25e1af2f96cffc569f"
                    //   uu.md5("user-password") -> "9a3729201fdd376c76ded01f986481b1"
                    //   uu.md5(utf8("CJK chars")) -> ...
var _AC = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
        0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
        0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
        0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
        0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
        0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391 ],
    _S = [
        7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
        5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
        4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
        6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21 ],
    _X = [
        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
        1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12,
        5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2,
        0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9 ];

// md5 - encode
function md5encode(data) { // @param ASCIIString/ByteArray:
                           // @return HexString:
    var rv = [], i = 0, iz = data.length, c;

    // --- String to ByteArray ---
    if (typeof data === "string") {
        for (; i < iz; ++i) {
            rv[i] = data.charCodeAt(i) & 0xff;
        }
    } else {
        rv = data.concat(); // clone
    }

    // --- padding ---
    c = i = rv.length;
    rv.push(0x80);
    while (++i % 64 !== 56) {
        rv.push(0);
    }
    c *= 8;
    rv.push(c & 255, c >> 8 & 255, c >> 16 & 255, c >> 24 & 255, 0, 0, 0, 0);

    return toHexString(calcMD5(rv));
}

// inner -
function calcMD5(data) { // @param ByteArray:
                         // @return ByteArray:
    var a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476,
        aa, bb, cc, dd, ra, rb, rc,
        i = 0, iz = data.length, j, k, n, word = [];

    for (; i < iz; i += 64) {
        for (j = 0; j < 16; ++j) {
            k = i + j * 4;
            word[j] = data[k] + (data[k + 1] <<  8)
                              + (data[k + 2] << 16)
                              + (data[k + 3] << 24);
        }
        aa = a;
        bb = b;
        cc = c;
        dd = d;
        for (j = 0; j < 64; ++j) {
            if (j < 16) {
                n = (b & c) | (~b & d); // ff - Round 1
            } else if (j < 32) {
                n = (b & d) | (c & ~d); // gg - Round 2
            } else if (j < 48) {
                n = b ^ c ^ d;          // hh - Round 3
            } else {
                n = c ^ (b | ~d);       // ii - Round 4
            }
            n += a + word[_X[j]] + _AC[j];

            ra = b + ((n << _S[j]) | (n >>> (32 - _S[j])));
            rb = b;
            rc = c;
            // rotate
            a = d;
            b = ra;
            c = rb;
            d = rc;
        }
        a += aa;
        b += bb;
        c += cc;
        d += dd;
    }
    return [a, b, c, d];
}

// inner - ByteArray to HexString
function toHexString(byteArray) { // @param ByteArray:
                                  // @return HexString:
    var rv = [], i = 0, iz = byteArray.length,
        num2hh = uu.hash.num2hh;

    for (; i < iz; ++i) {
        rv.push(num2hh[byteArray[i]       & 0xff],
                num2hh[byteArray[i] >>  8 & 0xff],
                num2hh[byteArray[i] >> 16 & 0xff],
                num2hh[byteArray[i] >> 24 & 0xff]);
    }
    return rv.join("");
}

})(uu);
