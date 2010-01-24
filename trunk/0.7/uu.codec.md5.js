
// === MD5 ===
// depend: uu.js
uu.agein || (function(uu) {
var _S11 =  7,
    _S12 = 12,
    _S13 = 17,
    _S14 = 22,
    _S21 =  5,
    _S22 =  9,
    _S23 = 14,
    _S24 = 20,
    _S31 =  4,
    _S32 = 11,
    _S33 = 16,
    _S34 = 23,
    _S41 =  6,
    _S42 = 10,
    _S43 = 15,
    _S44 = 21,
    _STATE0 = 0x67452301,
    _STATE1 = 0xefcdab89,
    _STATE2 = 0x98badcfe,
    _STATE3 = 0x10325476;

uu.codec.md5 = {
  encode: md5encode,  // uu.codec.md5.encode("ascii")
                      //              -> "5b7f33be48f19c25e1af2f96cffc569f"
                      // uu.codec.md5.encode("user-password")
                      //              -> "8f35d79d54bc1384a4ac23a897ba8b2b"
  test:   md5test
};

// inner -
function _tohex(ary) { // @param ByteArray: [0x0, ... ]
                       // @return String:
  var rv = [], ri = -1, i = 0, iz = ary.length * 4, c, pos, n,
      _HEX = "0123456789abcdef";

  for (; i < iz; ++i) {
    pos = ary[i >> 2];
    n = (i % 4) * 8;
    c = _HEX.charAt((pos >> (n + 4)) & 0xf) +
        _HEX.charAt((pos >> n) & 0xf);
    rv[++ri] = c;
  }
  return rv.join("");
}

// inner -
function _md5(bary, size) {
  bary[size >> 5] |= 0x80 << ((size) % 32);
  bary[(((size + 64) >>> 9) << 4) + 14] = size;

  var a = _STATE0, b = _STATE1, c = _STATE2, d = _STATE3,
      i = 0, iz = bary.length, AA, BB, CC, DD

  for (; i < iz; i += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;

    // Round 1
    a = _ff(a, b, c, d, bary[i +  0], _S11, 0xd76aa478); //  1
    d = _ff(d, a, b, c, bary[i +  1], _S12, 0xe8c7b756); //  2
    c = _ff(c, d, a, b, bary[i +  2], _S13, 0x242070db); //  3
    b = _ff(b, c, d, a, bary[i +  3], _S14, 0xc1bdceee); //  4
    a = _ff(a, b, c, d, bary[i +  4], _S11, 0xf57c0faf); //  5
    d = _ff(d, a, b, c, bary[i +  5], _S12, 0x4787c62a); //  6
    c = _ff(c, d, a, b, bary[i +  6], _S13, 0xa8304613); //  7
    b = _ff(b, c, d, a, bary[i +  7], _S14, 0xfd469501); //  8
    a = _ff(a, b, c, d, bary[i +  8], _S11, 0x698098d8); //  9
    d = _ff(d, a, b, c, bary[i +  9], _S12, 0x8b44f7af); // 10
    c = _ff(c, d, a, b, bary[i + 10], _S13, 0xffff5bb1); // 11
    b = _ff(b, c, d, a, bary[i + 11], _S14, 0x895cd7be); // 12
    a = _ff(a, b, c, d, bary[i + 12], _S11, 0x6b901122); // 13
    d = _ff(d, a, b, c, bary[i + 13], _S12, 0xfd987193); // 14
    c = _ff(c, d, a, b, bary[i + 14], _S13, 0xa679438e); // 15
    b = _ff(b, c, d, a, bary[i + 15], _S14, 0x49b40821); // 16

    // Round 2
    a = _gg(a, b, c, d, bary[i +  1], _S21, 0xf61e2562); // 17
    d = _gg(d, a, b, c, bary[i +  6], _S22, 0xc040b340); // 18
    c = _gg(c, d, a, b, bary[i + 11], _S23, 0x265e5a51); // 19
    b = _gg(b, c, d, a, bary[i +  0], _S24, 0xe9b6c7aa); // 20
    a = _gg(a, b, c, d, bary[i +  5], _S21, 0xd62f105d); // 21
    d = _gg(d, a, b, c, bary[i + 10], _S22,  0x2441453); // 22
    c = _gg(c, d, a, b, bary[i + 15], _S23, 0xd8a1e681); // 23
    b = _gg(b, c, d, a, bary[i +  4], _S24, 0xe7d3fbc8); // 24
    a = _gg(a, b, c, d, bary[i +  9], _S21, 0x21e1cde6); // 25
    d = _gg(d, a, b, c, bary[i + 14], _S22, 0xc33707d6); // 26
    c = _gg(c, d, a, b, bary[i +  3], _S23, 0xf4d50d87); // 27
    b = _gg(b, c, d, a, bary[i +  8], _S24, 0x455a14ed); // 28
    a = _gg(a, b, c, d, bary[i + 13], _S21, 0xa9e3e905); // 29
    d = _gg(d, a, b, c, bary[i +  2], _S22, 0xfcefa3f8); // 30
    c = _gg(c, d, a, b, bary[i +  7], _S23, 0x676f02d9); // 31
    b = _gg(b, c, d, a, bary[i + 12], _S24, 0x8d2a4c8a); // 32

    // Round 3
    a = _hh(a, b, c, d, bary[i +  5], _S31, 0xfffa3942); // 33
    d = _hh(d, a, b, c, bary[i +  8], _S32, 0x8771f681); // 34
    c = _hh(c, d, a, b, bary[i + 11], _S33, 0x6d9d6122); // 35
    b = _hh(b, c, d, a, bary[i + 14], _S34, 0xfde5380c); // 36
    a = _hh(a, b, c, d, bary[i +  1], _S31, 0xa4beea44); // 37
    d = _hh(d, a, b, c, bary[i +  4], _S32, 0x4bdecfa9); // 38
    c = _hh(c, d, a, b, bary[i +  7], _S33, 0xf6bb4b60); // 39
    b = _hh(b, c, d, a, bary[i + 10], _S34, 0xbebfbc70); // 40
    a = _hh(a, b, c, d, bary[i + 13], _S31, 0x289b7ec6); // 41
    d = _hh(d, a, b, c, bary[i +  0], _S32, 0xeaa127fa); // 42
    c = _hh(c, d, a, b, bary[i +  3], _S33, 0xd4ef3085); // 43
    b = _hh(b, c, d, a, bary[i +  6], _S34,  0x4881d05); // 44
    a = _hh(a, b, c, d, bary[i +  9], _S31, 0xd9d4d039); // 45
    d = _hh(d, a, b, c, bary[i + 12], _S32, 0xe6db99e5); // 46
    c = _hh(c, d, a, b, bary[i + 15], _S33, 0x1fa27cf8); // 47
    b = _hh(b, c, d, a, bary[i +  2], _S34, 0xc4ac5665); // 48

    // Round 4
    a = _ii(a, b, c, d, bary[i +  0], _S41, 0xf4292244); // 49
    d = _ii(d, a, b, c, bary[i +  7], _S42, 0x432aff97); // 50
    c = _ii(c, d, a, b, bary[i + 14], _S43, 0xab9423a7); // 51
    b = _ii(b, c, d, a, bary[i +  5], _S44, 0xfc93a039); // 52
    a = _ii(a, b, c, d, bary[i + 12], _S41, 0x655b59c3); // 53
    d = _ii(d, a, b, c, bary[i +  3], _S42, 0x8f0ccc92); // 54
    c = _ii(c, d, a, b, bary[i + 10], _S43, 0xffeff47d); // 55
    b = _ii(b, c, d, a, bary[i +  1], _S44, 0x85845dd1); // 56
    a = _ii(a, b, c, d, bary[i +  8], _S41, 0x6fa87e4f); // 57
    d = _ii(d, a, b, c, bary[i + 15], _S42, 0xfe2ce6e0); // 58
    c = _ii(c, d, a, b, bary[i +  6], _S43, 0xa3014314); // 59
    b = _ii(b, c, d, a, bary[i + 13], _S44, 0x4e0811a1); // 60
    a = _ii(a, b, c, d, bary[i +  4], _S41, 0xf7537e82); // 61
    d = _ii(d, a, b, c, bary[i + 11], _S42, 0xbd3af235); // 62
    c = _ii(c, d, a, b, bary[i +  2], _S43, 0x2ad7d2bb); // 63
    b = _ii(b, c, d, a, bary[i +  9], _S44, 0xeb86d391); // 64

    a = _add(a, AA);
    b = _add(b, BB);
    c = _add(c, CC);
    d = _add(d, DD);
  }
  return [a, b, c, d];
}

// inner -
function _ff(a, b, c, d, x, s, ac) {
  return _calc((b & c) | ((~b) & d), a, b, x, s, ac);
}

// inner -
function _gg(a, b, c, d, x, s, ac) {
  return _calc((b & d) | (c & (~d)), a, b, x, s, ac);
}

// inner -
function _hh(a, b, c, d, x, s, ac) {
  return _calc(b ^ c ^ d, a, b, x, s, ac);
}

// inner -
function _ii(a, b, c, d, x, s, ac) {
  return _calc(c ^ (b | (~d)), a, b, x, s, ac);
}

// inner -
function _add(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);

  return (msw << 16) | (lsw & 0xffff);
}

// inner -
function _calc(q, a, b, x, s, ac) {
  var aq = _add(a, q),
      xac = _add(x, ac),
      aqxac = _add(aq, xac),
      r = (aqxac << s) | (aqxac >>> (32 - s)); // rotate left

  return _add(r, b);
}

// uu.codec.md5.encode - encode ascii to md5
function _md5ascii(str) { // @param String:
                          // @return String:
  var bary = [], mask = (1 << 8) - 1, i = 0, iz = str.length * 8;

  for (; i < iz; i += 8) {
    bary[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
  }
  return _tohex(_md5(bary, str.length * 8));
}

// inner -
function _md5ucs2(str) {
  var bary = [], mask = (1 << 16) - 1, i = 0, iz = str.length * 16;

  for (; i < iz; i += 16) {
    bary[i >> 5] |= (str.charCodeAt(i / 16) & mask) << (i % 32);
  }
  return _tohex(_md5(bary, str.length * 16));
}

// uu.codec.md5.test
function md5test() {
  return _md5ascii("hoge") === "ea703e7aa1efda0064eaa507d9e8ab7e";
}

// uu.codec.md5.encode
function md5encode(str,     // @param String:
                   ascii) { // @param Boolean(= false):
  return (ascii ? _md5ascii : _md5ucs2)(str);
}

})(uu);

