
// === uu.msgpack / window.msgpack ===
// http://msgpack.sourceforge.net/
//{{{!depend uu, uu.utf8
//}}}!depend

(this.uu || this).msgpack || (function(namespace) {

var _sign = { 8: 0x80, 16: 0x8000, 32: 0x80000000, 64: 0x8000000000000000 },
    _bin2num = {}, // { "00000000": 0, "00000001": 1, ... }
    // --- minify ---
    _charCodeAt = "charCodeAt";

namespace.msgpack = {
    pack:   msgpackpack,  // uu.msgpack.pack(data:Mix):ByteArray
    unpack: msgpackunpack // uu.msgpack.unpack(data:String/ByteArray):Mix
};

// uu.msgpack.pack
function msgpackpack(data) { // @param Mix:
                             // @return ByteArray:
                             // @throws Error("OVERFLOW")
    return encode([], data);
}

// uu.msgpack.unpack
function msgpackunpack(data) { // @param String/ByteArray:
                               // @return Mix:
    return { data: data, index: -1, byte: isArray(data),
             decode: decode }.decode();
}

// inner - encoder
function encode(rv,    // @param Array: result
                mix) { // @param Mix: source data
    var size = 0, i = 0, ff = 0xff, rr;

    if (mix === null) {
        rv.push(0xc0);
    } else if (isArray(mix)) {
        size = mix.length;
        setSize(rv, 16, size, [0x90, 0xdc, 0xdd]);
        for (; i < size; ++i) {
            encode(rv, mix[i]);
        }
    } else {
        switch (typeof mix) {
        case "boolean":
            rv.push(mix ? 0xc3 : 0xc2);
            break;
        case "number":
            if (Math.floor(mix) === mix) { // bugfix // (mix | 0 == mix)
                if (mix < 0) { // int
                    if (mix >= -32) { // negative fixnum
                        rv.push(0xe0 + mix + 32); // 0xff = -1, 0xe0 = -32
                    } else if (mix >= -0x100) {
                        rv.push(0xd0, mix);
                    } else if (mix >= -0x10000) {
                        rv.push(0xd1, mix >> 8, mix & ff);
                    } else if (mix >= -0x100000000) {
                        rv.push(0xd2, mix >>> 24, (mix >> 16) & ff, (mix >> 8) & ff, mix & ff);
                    } else {
                        mix += 0x10000000000000000;
                        rv.push(0xd3, (mix / 0x100000000000000) & ff,
                                      (mix /   0x1000000000000) & ff,
                                      (mix /     0x10000000000) & ff,
                                      (mix /       0x100000000) & ff,
                                      (mix >>> 24) & ff,
                                      (mix >>  16) & ff,
                                      (mix >>   8) & ff,
                                               mix & ff);
                    }
                } else { // uint
                    if (mix < 128) {
                        rv.push(mix); // positive fixnum
                    } else if (mix < 0x100) { // uint 8
                        rv.push(0xcc, mix);
                    } else if (mix < 0x10000) { // uint 16
                        rv.push(0xcd, mix >> 8, mix & ff);
                    } else if (mix < 0x100000000) { // uint 32
                        rv.push(0xce, mix >>> 24, (mix >> 16) & ff, (mix >> 8) & ff, mix & ff);
                    } else {
                        rv.push(0xcf, (mix / 0x100000000000000) & ff,
                                      (mix /   0x1000000000000) & ff,
                                      (mix /     0x10000000000) & ff,
                                      (mix /       0x100000000) & ff,
                                      (mix >>> 24) & ff,
                                      (mix >>  16) & ff,
                                      (mix >>   8) & ff,
                                               mix & ff);
                    }
                }
            } else { // double
                rv = toIEEE754(mix);
            }
            break;
        case "string":
            size = mix.length;

//          if (utf8) {
                for (rr = [], i = 0; i < size; ++i) {
                    namespace.utf8.encode(mix.charAt(i), rr);
                }
                setSize(rv, 32, rr.length, [0xa0, 0xda, 0xdb]);
                Array.prototype.push.apply(rv, rr);
//          } else { // ucs2(unicode)
//              setSize(rv, 32, size, [0xa0, 0xda, 0xdb]);
//              for (i = 0; i < size; ++i) {
//                  rv.push(mix.charCodeAt(i)); // ucs2
//              }
//          }
            break;
        default: // hash
            setSize(rv, 16, hashSize(mix), [0x80, 0xde, 0xdf]);
            for (i in mix) {
                encode(rv, i);
                encode(rv, mix[i]);
            }
        }
    }
    return rv;
}

// inner - decoder
function decode() { // @return Mix:
    var rv = 0, size = 0, i = 0, msb = 0, exp, key, nv,
        that = this,
        data = that.data,
        type = that.byte ? data[++that.index]
                         : data[_charCodeAt](++that.index);

    if (type >= 0xe0) {         // negative fixnum (111x xxxx) (-32 ~ -1)
        return type - 0x100;
    }
    if (type < 0x80) {          // positive fixnum (0xxx xxxx) (0 ~ 127)
        return type;
    }
    if (type < 0x90) {          // FixMap (1000 xxxx)
        size = type - 0x80, type = 0x80;
    } else if (type < 0xa0) {   // FixArray (1001 xxxx)
        size = type - 0x90, type = 0x90;
    } else if (type < 0xc0) {   // FixRaw (101x xxxx)
        size = type - 0xa0, type = 0xa0;
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return false;
    case 0xc3:  return true;
    case 0xca:  rv = readByte(that, 4);      // float
                exp = ((rv >> 23) & 0xff) - 0x7f;
                return (rv & _sign[32] ? -1 : 1)
                        * (rv & 0x7fffff | 0x800000) * Math.pow(2, exp - 23);
    case 0xcb:  rv = readByte(that, 4);      // double
                exp = ((rv >> 20) & 0x7ff) - 1023; // +1023 bias
                return (rv & _sign[32] ? -1 : 1)
                        * ((rv & 0xfffff | 0x100000) * Math.pow(2, exp - 20)
                            + readByte(that, 4) * Math.pow(2, exp - 52));
    case 0xcf:  return readByte(that, 8);    // uint 64
    case 0xce:  return readByte(that, 4);    // uint 32
    case 0xcd:  return readByte(that, 2);    // uint 16
    case 0xcc:  return readByte(that, 1);    // uint 8
    case 0xd3:  nv = readByte(that, 8);          // int 64
    case 0xd2:  nv === void 0 && (nv = readByte(that, 4));  // int 32
    case 0xd1:  nv === void 0 && (nv = readByte(that, 2));  // int 16
    case 0xd0:  nv === void 0 && (nv = readByte(that, 1));  // int 8
                msb = 4 << ((type & 0x3) + 1); // 8, 16, 32, 64
                return nv < _sign[msb] ? nv : nv - _sign[msb] * 2;
    case 0xdb:  size = readByte(that, 4);           // raw 32
    case 0xda:  size || (size = readByte(that, 2)); // raw 16
    case 0xa0:  for (rv = []; i < size; ++i) {      // raw
                    rv[i] = that.byte ? data[++that.index]
                                      : data[_charCodeAt](++that.index);
                }
//              return utf8 ? namespace.utf8.decode(rv)
//                          : String.fromCharCode.apply(null, rv);
                return namespace.utf8.decode(rv);
    case 0xdf:  size = readByte(that, 4);           // map 32
    case 0xde:  size || (size = readByte(that, 2)); // map 16
    case 0x80:  for (rv = {}; i < size; ++i) {      // map
                    key = that.decode();
                    rv[key] = that.decode(); // key/value pair
                }
                return rv;
    case 0xdd:  size = readByte(that, 4);           // array 32
    case 0xdc:  size || (size = readByte(that, 2)); // array 16
    case 0x90:  for (rv = []; i < size; ++i) {      // array
                    rv.push(that.decode());
                }
                return rv;
    }
    return;
}

// inner - read byte
function readByte(that,   // @param Object:
                  size) { // @param Number:
                          // @return Number:
    var rv = 0, data = that.data, i = that.index, byte = that.byte;

    switch (size) {
    case 8: rv += (byte ? data[++i] : data[_charCodeAt](++i)) * 0x100000000000000; // << 56
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *   0x1000000000000; // << 48
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *     0x10000000000; // << 40
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *       0x100000000; // << 32
    case 4: rv += (byte ? data[++i] : data[_charCodeAt](++i)) *         0x1000000; // << 24 (keep msb)
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *           0x10000; // << 16
    case 2: rv += (byte ? data[++i] : data[_charCodeAt](++i)) *             0x100; // << 8
    case 1: rv += (byte ? data[++i] : data[_charCodeAt](++i));

    }
    that.index = i;
    return rv;
}

// inner - Number to IEEE754 formated ByteArray
function toIEEE754(num) { // @param Number:
                          // @return ByteArray: [0xcb, ...]

    // see -> http://pc.nikkeibp.co.jp/pc21/special/gosa/eg4.shtml
    var sign = num < 0 ? "1" : "0";
    var fraction = num.toString(2).slice(1);
    //  (123.456).toString(2)
    //      = "1111011.0111010010111100011010100111111011111001110111"
    //                          v
    //  slice(1)
    //      =  "111011.0111010010111100011010100111111011111001110111"
    var exp;

    if (fraction.charAt(0) === ".") {
        // 0.1 -> ".0001100110011001100110011001100110011001100110011001101"
        exp = 1023 - fraction.indexOf("1");
        exp = ("00000000000" + exp.toString(2)).slice(-11); // pad zero

        fraction = fraction.replace(/^\.0*1/, "");
    } else {
        // 123.345 -> "111011.0111010010111100011010100111111011111001110111"
        exp = 1023 + fraction.indexOf(".");
        exp = ("00000000000" + exp.toString(2)).slice(-11); // pad zero

        fraction = fraction.replace(/\./, "");
        //  replace(/\./, "")
        //      =  "11110110111010010111100011010100111111011111001110111"
    }
    fraction += "0000000000000000000000000000000000000000000000000000"; // x52


    // TODO: Rounding modes


    var s = (sign + exp + fraction).slice(0, 64);

    return [0xcb, _bin2num[s.slice(0,  8) ], _bin2num[s.slice(8,  16)],
                  _bin2num[s.slice(16, 24)], _bin2num[s.slice(24, 32)],
                  _bin2num[s.slice(32, 40)], _bin2num[s.slice(40, 48)],
                  _bin2num[s.slice(48, 56)], _bin2num[s.slice(56, 64)]];
}

// inner - set size
function setSize(rv,      // @param Array: result
                 fixSize, // @param Number: fix size. eg: 16 or 32
                 size,    // @param Number: size
                 types) { // @param Array: type formats. eg: [0x90, 0xdc, 0xdd]
    var ff = 0xff;

    if (size < fixSize) {
        rv.push(types[0] + size);
    } else if (size < 0x10000) { // 16
        rv.push(types[1], size >> 8, size & ff);
    } else if (size < 0x100000000) { // 32
        rv.push(types[2], size >>> 24, size >> 16 & ff, size >> 8 & ff, size & ff);
    } else {
        throw new Error("OVERFLOW");
    }
}

// inner - get hash size
function hashSize(hash) { // @param Hash:
                          // @return Number:
    var rv = 0;

    if (Object.keys) {
        return Object.keys(hash).length;
    }
    for (i in hash) {
        hash.hasOwnProperty(i) && ++rv;
    }
    return rv;
}

// inner - Array.isArray alias
function isArray(mix) { // @param Mix:
                        // @return Boolean:
    return Object.prototype.toString.call(mix) === "[object Array]";
}

// --- init ---
// inner - create binaryToNumber hash
(function() {
    var i = 0, s;

    for (; i < 256; ++i) {
        s = ("0000000" + i.toString(2)).slice(-8);
        _bin2num[s] = i;
    }
})();

})(this.uu || this);
